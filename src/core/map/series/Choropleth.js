goog.provide('anychart.core.map.series.Choropleth');
goog.require('anychart.core.map.series.BaseWithMarkers');
goog.require('anychart.scales.LinearColor');



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

  /**
   * @type {Array}
   * @private
   */
  this.points_ = [];
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
  return acgraph.path();
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator(),
      'colorScale': this.colorScale_,
      'referenceValueNames': this.referenceValueNames
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('regionShape'));
  if (goog.isDef(shape)) {
    shape.visible(true);
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(this.getFinalFill(true, pointState));
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState If the point is hovered or selected.
 * @protected
 */
anychart.core.map.series.Choropleth.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.remove = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  goog.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA | anychart.ConsistencyState.MAP_COLOR_SCALE)) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
        var name = iterator.get(this.referenceValueNames[0]);
        if (!name || !goog.isString(name))
          continue;

        for (var i = 0, len = this.geoData.length; i < len; i++) {
          var geom = this.geoData[i];
          if (!geom) continue;
          var prop = geom['properties'];
          if (prop[this.getFinalGeoIdField()] == name) {
            this.points_.push(geom);
            iterator.meta('regionShape', geom.domElement).meta('regionProperties', prop);
            break;
          }
        }
      }

      if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {
        var value = iterator.get(this.referenceValueNames[1]);
        if (this.colorScale_)
          this.colorScale_.extendDataRange(value);
      }
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_SCALE);
  }
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

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.points_.length = 0;
  }
};


/** @inheritDoc */
anychart.core.map.series.Choropleth.prototype.drawPoint = function(pointState) {
  var iterator = this.getIterator();
  var shape;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    shape = /** @type {acgraph.vector.Shape} */(iterator.meta('regionShape'));
    if (goog.isDef(shape)) {
      var properties = /** @type {Object}*/(iterator.meta('regionProperties'));
      var midX = iterator.get('middle-x');
      var midY = iterator.get('middle-y');
      var middleX = /** @type {number}*/(goog.isDef(midX) ? midX : properties['middle-x']);
      var middleY = /** @type {number}*/(goog.isDef(midY) ? midY : properties['middle-y']);
      var shapeBounds = shape.getBounds();
      var x = shapeBounds.left + shapeBounds.width * middleX;
      var y = shapeBounds.top + shapeBounds.height * middleY;


      this.colorizeShape(pointState | this.state.getSeriesState());
      iterator.meta('shape', iterator.meta('regionShape')).meta('x', x).meta('value', y);
      this.makeInteractive(/** @type {acgraph.vector.Element} */(iterator.meta('regionShape')));
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    shape = /** @type {acgraph.vector.Shape} */(iterator.meta('regionShape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState | this.state.getSeriesState());
  }

  goog.base(this, 'drawPoint', pointState);
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


anychart.core.map.series.Choropleth.prototype['colorScale'] = anychart.core.map.series.Choropleth.prototype.colorScale;
