//region --- Requiring and Providing
goog.provide('anychart.core.map.series.Choropleth');
goog.require('anychart.core.ChoroplethPoint');
goog.require('anychart.core.map.series.BaseWithMarkers');
goog.require('anychart.core.utils.TypedLayer');
//endregion



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.BaseWithMarkers}
 */
anychart.core.map.series.Choropleth = function(opt_data, opt_csvSettings) {
  anychart.core.map.series.Choropleth.base(this, 'constructor', opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['id', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.needSelfLayer = false;
};
goog.inherits(anychart.core.map.series.Choropleth, anychart.core.map.series.BaseWithMarkers);
anychart.core.map.series.Base.SeriesTypesMap[anychart.enums.MapSeriesType.CHOROPLETH] = anychart.core.map.series.Choropleth;


//region --- Class constants
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.map.series.Choropleth.prototype.SUPPORTED_SIGNALS =
    anychart.core.map.series.BaseWithMarkers.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_COLOR_RANGE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.map.series.Choropleth.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.map.series.BaseWithMarkers.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.MAP_COLOR_SCALE;


//endregion
//region --- Class properties
/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.hatchFillRootElement = null;


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.needsUpdateMapAppearance = function() {
  return true;
};


//endregion
//region --- Getters
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getType = function() {
  return anychart.enums.MapSeriesType.CHOROPLETH;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getPoint = function(index) {
  return new anychart.core.ChoroplethPoint(this, index);
};


//endregion
//region --- Check functions
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.isDiscreteBased = function() {
  return true;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.isChoropleth = function() {
  return true;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.needDrawHatchFill = function() {
  return !!(this.hatchFill() || this.hoverHatchFill() || this.selectHatchFill());
};


//endregion
//region --- Interactivity
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.updateOnZoomOrMove = function() {
  var tx = this.map.getMapLayer().getFullTransformation();
  var hatchFill = this.hatchFillRootElement;
  if (hatchFill) {
    hatchFill.setTransformationMatrix(tx.getScaleX(), tx.getShearX(), tx.getShearY(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
  }

  return anychart.core.map.series.Choropleth.base(this, 'updateOnZoomOrMove');
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
  this.drawLabel(pointState);
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
};


//endregion
//region --- Color scale
//----------------------------------------------------------------------------------------------------------------------
//
//  Color scale.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.MAP_COLOR_SCALE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.map.series.Choropleth.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_COLOR_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
  }
};


//endregion
//region --- Providers
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.createFormatProvider = function(opt_force) {
  this.pointProvider = anychart.core.map.series.Choropleth.base(this, 'createFormatProvider', opt_force);

  var iterator = this.getIterator();
  var value = iterator.get(this.referenceValueNames[1]);

  if (this.colorScale_) {
    this.pointProvider['color'] = this.colorScale_.valueToColor(value);
    if (this.colorScale_ instanceof anychart.scales.OrdinalColor) {
      var range = this.colorScale_.getRangeByValue(/** @type {number} */(value));
      if (range) {
        this.pointProvider['colorRange'] = {
          'color': range.color,
          'end': range.end,
          'name': range.name,
          'start': range.start,
          'index': range.sourceIndex
        };
      }
    }
  }

  return this.pointProvider;
};


//endregion
//region --- Layering
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.rootTypedLayerInitializer = function() {
  var path = acgraph.path();
  path.disableStrokeScaling(true);
  return path;
};


//endregion
//region --- Coloring
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var iterator = this.getIterator();
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();

    var scaledColor;
    if (this.colorScale()) {
      var refVale = this.referenceValueNames[1];
      var value = /** @type {number} */(iterator.get(refVale));
      scaledColor = this.colorScale().valueToColor(value);
    }

    var feature = iterator.meta('currentPointElement');
    var features = iterator.meta('features');
    var point = features && features.length ? features[0] : null;
    var properties = point ? point['properties'] : null;
    var attributes = feature ? feature['attrs'] : null;
    var domElement = feature ? feature['domElement'] : null;

    var scope = {
      'index': iterator.getIndex(),
      'sourceColor': sourceColor,
      'scaledColor': scaledColor,
      'iterator': iterator,
      'colorScale': this.colorScale_,
      'referenceValueNames': this.referenceValueNames,
      'properties': properties,
      'attributes': attributes,
      'element': domElement
    };

    fill = color.call(scope);
  } else {
    fill = color;
  }

  return fill;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.colorizeShape = function(pointState) {
  var features = this.getIterator().meta('features');
  if (!features)
    return;

  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (goog.isDef(feature.domElement)) {
      this.map.featureTraverser(feature, function(shape) {
        var element = shape.domElement;
        if (!element)
          return;

        this.getIterator().meta('currentPointElement', shape);
        element.visible(true);
        if (element instanceof acgraph.vector.Shape) {
          element.stroke(this.getFinalStroke(true, pointState));
          element.fill(this.getFinalFill(true, pointState));
        }
      }, this);
    }
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.applyHatchFill = function(pointState) {
  if (!this.hatchFillRootElement)
    return;

  var hatchFillElements = this.getIterator().meta('hatchFillElements');
  if (!hatchFillElements)
    return;

  for (var i = 0, len = hatchFillElements.length; i < len; i++) {
    var hatchFillElement = hatchFillElements[i];
    hatchFillElement
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.remove = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  anychart.core.map.series.Choropleth.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getMiddlePoint = function() {
  var middleX, middleY, middlePoint, midX, midY, txCoords;
  var iterator = this.getIterator();
  var features = iterator.meta('features');
  var feature = features && features.length ? features[0] : null;

  if (!feature)
    return {'value': {'x': 0, 'y': 0}};

  var pointGeoProp = /** @type {Object}*/(feature['properties']);

  var middleXYModeGeoSettings = pointGeoProp && pointGeoProp['middleXYMode'];
  var middleXYModeDataSettings = iterator.get('middleXYMode');

  var middleXYMode = goog.isDef(middleXYModeDataSettings) ?
      middleXYModeDataSettings : middleXYModeGeoSettings ?
      middleXYModeGeoSettings : anychart.enums.MapPointMiddlePositionMode.RELATIVE;

  if (middleXYMode == anychart.enums.MapPointMiddlePositionMode.RELATIVE) {
    middlePoint = this.getPositionByRegion();
  } else if (middleXYMode == anychart.enums.MapPointMiddlePositionMode.ABSOLUTE) {
    midX = iterator.get('middle-x');
    midY = iterator.get('middle-y');
    middleX = /** @type {number}*/(goog.isDef(midX) ? midX : pointGeoProp ? pointGeoProp['middle-x'] : 0);
    middleY = /** @type {number}*/(goog.isDef(midY) ? midY : pointGeoProp ? pointGeoProp['middle-y'] : 0);

    middleX = anychart.utils.toNumber(middleX);
    middleY = anychart.utils.toNumber(middleY);

    txCoords = this.map.scale().transform(middleX, middleY);

    middlePoint = {'value': {'x': txCoords[0], 'y': txCoords[1]}};
  } else {
    middlePoint = {'value': {'x': 0, 'y': 0}};
  }

  return middlePoint;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var features = iterator.meta('features');
  var feature = features && features.length ? features[0] : null;
  var middlePoint, midX, midY, txCoords;
  if (feature) {
    middlePoint = this.getMiddlePoint();

    var dataLabel = iterator.get('label');
    var dataLabelPositionMode, dataLabelXPos, dataLabelYPos;
    if (dataLabel) {
      dataLabelPositionMode = dataLabel['positionMode'];
      dataLabelXPos = dataLabel['x'];
      dataLabelYPos = dataLabel['y'];
    }

    var pointGeoProp = /** @type {Object}*/(feature['properties']);
    var geoLabel = pointGeoProp && pointGeoProp['label'];
    var geoLabelPositionMode, geoLabelXPos, geoLabelYPos;
    if (geoLabel) {
      geoLabelPositionMode = geoLabel && geoLabel['positionMode'];
      geoLabelXPos = dataLabel['x'];
      geoLabelYPos = dataLabel['y'];
    }

    var positionMode = dataLabelPositionMode || geoLabelPositionMode || anychart.enums.MapPointOutsidePositionMode.RELATIVE;
    var x = goog.isDef(dataLabelXPos) ? dataLabelXPos : geoLabelXPos;
    var y = goog.isDef(dataLabelYPos) ? dataLabelYPos : geoLabelYPos;

    var labelPoint;
    if (goog.isDef(x) && goog.isDef(y)) {
      iterator.meta('positionMode', positionMode);

      midX = middlePoint['value']['x'];
      midY = middlePoint['value']['y'];

      if (positionMode == anychart.enums.MapPointOutsidePositionMode.RELATIVE) {
        x = anychart.utils.normalizeNumberOrPercent(x);
        y = anychart.utils.normalizeNumberOrPercent(y);

        x = anychart.utils.isPercent(x) ? parseFloat(x) / 100 : x;
        y = anychart.utils.isPercent(y) ? parseFloat(y) / 100 : y;

        var shape = feature.domElement;
        if (shape) {
          var bounds = shape.getAbsoluteBounds();
          x = bounds.left + bounds.width * x;
          y = bounds.top + bounds.height * y;
        } else {
          x = 0;
          y = 0;
        }
      } else if (positionMode == anychart.enums.MapPointOutsidePositionMode.ABSOLUTE) {
        txCoords = this.map.scale().transform(parseFloat(x), parseFloat(y));
        x = txCoords[0];
        y = txCoords[1];
      } else if (positionMode == anychart.enums.MapPointOutsidePositionMode.OFFSET) {
        var angle = goog.math.toRadians(parseFloat(x) - 90);
        var r = parseFloat(y);

        x = midX + r * Math.cos(angle);
        y = midY + r * Math.sin(angle);
      }

      var horizontal = Math.sqrt(Math.pow(midX - x, 2));
      var vertical = Math.sqrt(Math.pow(midY - y, 2));
      var connectorAngle = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

      if (midX < x && midY < y) {
        connectorAngle = connectorAngle - 180;
      } else if (midX < x && midY > y) {
        connectorAngle = 180 - connectorAngle;
      } else if (midX > x && midY > y) {
        //connectorAngle = connectorAngle;
      } else if (midX > x && midY < y) {
        connectorAngle = -connectorAngle;
      }

      var anchor = this.getAnchorForLabel(goog.math.standardAngle(connectorAngle - 90));
      iterator.meta('labelAnchor', anchor);
      iterator.meta('markerAnchor', anchor);

      labelPoint = {'value': {'x': x, 'y': y}};
    } else {
      iterator.meta('labelAnchor', anychart.enums.Anchor.CENTER);
      iterator.meta('markerAnchor', anychart.enums.Anchor.CENTER);
    }
  } else {
    middlePoint = {'value': {'x': 0, 'y': 0}};
  }

  if (labelPoint) {
    labelPoint['connectorPoint'] = middlePoint;
    return labelPoint;
  } else {
    return middlePoint;
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA_INDEX) ||
      this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {

    this.seriesPoints.length = 0;
    var iterator = this.getResetIterator();
    var index = this.map.getIndexedGeoData();
    var seriesIndex;
    if (index)
      seriesIndex = index[this.geoIdField()];

    while (iterator.advance()) {
      if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA_INDEX)) {
        if (!seriesIndex)
          continue;

        var name = iterator.get(this.referenceValueNames[0]);
        if (!name || !(goog.isString(name) || goog.isArray(name)))
          continue;

        name = goog.isArray(name) ? name : [name];

        iterator.meta('features', undefined);
        var features = [];
        for (var j = 0, len_ = name.length; j < len_; j++) {
          var id = name[j];
          var point = seriesIndex[id];
          if (point) {
            features.push(point);
            this.seriesPoints[iterator.getIndex()] = id;
          }
        }
        iterator.meta('features', features);
      }

      if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {
        var value = iterator.get(this.referenceValueNames[1]);
        if (this.colorScale_)
          this.colorScale_.extendDataRange(value);
      }
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {
      if (this.colorScale_)
        this.colorScale_.finishAutoCalc();
    }
    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA_INDEX);
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_SCALE);
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.startDrawing = function() {
  anychart.core.map.series.Choropleth.base(this, 'startDrawing');

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var needHatchFill = this.needDrawHatchFill();
    if (!this.hatchFillRootElement && needHatchFill) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.charts.Map.ZINDEX_CHORPLETH_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    if (this.hatchFillRootElement) this.hatchFillRootElement.clear();
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.drawPoint = function(pointState) {
  var features = this.getIterator().meta('features');
  var feature, i, len;
  if (!features || !features.length)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    for (i = 0, len = features.length; i < len; i++) {
      feature = features[i];
      if (goog.isDef(feature.domElement)) {
        this.bindHandlersToGraphics(feature.domElement);
        this.makeInteractive(/** @type {acgraph.vector.Element} */(feature.domElement));
      }
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.colorizeShape(pointState | this.state.getSeriesState());
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillRootElement) {
      var hatchFillElements = [];
      for (i = 0, len = features.length; i < len; i++) {
        feature = features[i];
        if (goog.isDef(feature.domElement)) {
          this.map.featureTraverser(feature, function(shape) {
            var element = shape.domElement;
            if (!element)
              return;

            var hatchFillElement = /** @type {!acgraph.vector.Path} */(this.hatchFillRootElement.genNextChild());
            hatchFillElements.push(hatchFillElement);
            hatchFillElement.deserialize(element.serialize());
          }, this);
        }
      }
      this.getIterator().meta('hatchFillElements', hatchFillElements);
      this.applyHatchFill(pointState | this.state.getSeriesState());
    }
  }

  anychart.core.map.series.Choropleth.base(this, 'drawPoint', pointState);
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.draw = function() {
  anychart.core.map.series.Choropleth.base(this, 'draw');

  this.markConsistent(anychart.ConsistencyState.CONTAINER);

  return this;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.map.series.Choropleth.prototype;
  proto['colorScale'] = proto.colorScale;
  proto['getPoint'] = proto.getPoint;
})();
//endregion
