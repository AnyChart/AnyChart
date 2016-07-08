goog.provide('anychart.core.map.series.Choropleth');
goog.require('anychart.core.ChoroplethPoint');
goog.require('anychart.core.map.series.BaseWithMarkers');
goog.require('anychart.core.utils.TypedLayer');



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.BaseWithMarkers}
 */
anychart.core.map.series.Choropleth = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['id', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.needSelfLayer = false;
};
goog.inherits(anychart.core.map.series.Choropleth, anychart.core.map.series.BaseWithMarkers);
anychart.core.map.series.Base.SeriesTypesMap[anychart.enums.MapSeriesType.CHOROPLETH] = anychart.core.map.series.Choropleth;


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


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getType = function() {
  return anychart.enums.MapSeriesType.CHOROPLETH;
};


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


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.createFormatProvider = function(opt_force) {
  this.pointProvider = goog.base(this, 'createFormatProvider', opt_force);

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


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.createPositionProvider = function(position) {
  return this.getPositionByRegion();
};


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.hatchFillRootElement = null;


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.rootTypedLayerInitializer = function() {
  var path = acgraph.path();
  path.disableStrokeScaling(true);
  return path;
};


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


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.remove = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  goog.base(this, 'remove');
};


/**
 * Find point from features.
 * @param {Object} feature .
 * @param {string} id .
 * @return {Object}
 */
anychart.core.map.series.Choropleth.prototype.findPoint = function(feature, id) {
  var prop = feature['properties'];

  if (prop && prop[this.getFinalGeoIdField()] == id) {
    return feature;
  } else if (feature['features']) {
    for (var i = 0, len = feature['features'].length; i < len; i++) {
      var feature_ = feature['features'][i];
      var point = this.findPoint(feature_, id);
      if (point) {
        return point;
      }
    }
  }
  return null;
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA) ||
      this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {

    var iterator = this.getResetIterator();
    var index = this.map.getIndexedGeoData();
    var seriesIndex;
    if (index)
      seriesIndex = index[this.geoIdField()];

    while (iterator.advance()) {
      if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
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
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_SCALE);
  }
};


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
anychart.core.map.series.Choropleth.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

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

  goog.base(this, 'drawPoint', pointState);
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.draw = function() {
  anychart.core.map.series.Choropleth.base(this, 'draw');

  this.markConsistent(anychart.ConsistencyState.CONTAINER);

  return this;
};


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


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.getPoint = function(index) {
  return new anychart.core.ChoroplethPoint(this, index);
};


anychart.core.map.series.Choropleth.prototype['colorScale'] = anychart.core.map.series.Choropleth.prototype.colorScale;
anychart.core.map.series.Choropleth.prototype['getPoint'] = anychart.core.map.series.Choropleth.prototype.getPoint;
