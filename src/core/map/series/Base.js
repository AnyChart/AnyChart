goog.provide('anychart.core.map.series.Base');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.utils.LegendContextProvider');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.enums');



/**
 * Choropleth series. Read more about choropleth <a href='http://en.wikipedia.org/wiki/Choropleth_map'>here</a>.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.map.series.Base = function(opt_data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  goog.base(this);

  this.data(opt_data || null, opt_csvSettings);
  this.geoData = [];

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.titleFormatter(function() {
    return this['name'];
  });
  tooltip.contentFormatter(function() {
    return 'Id: ' + this['id'] + '\n' + 'Name: ' + this['name'] + '\n' + 'Value: ' + this['value'];
  });
  tooltip.content().hAlign('left');
  tooltip.resumeSignalsDispatching(false);

  this.labels();

  this.selectStatus = [];
  this.hoverStatus = [];
  this.needSelfLayer = true;

  this.hatchFill(false);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.map.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.map.series.Base.SeriesTypesMap = {};


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND |
    anychart.Signal.NEED_UPDATE_COLOR_RANGE;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.map.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.MAP_COLOR_SCALE |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.map.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.map.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.map.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.core.map.series.Base.prototype.iterator_;


/**
 * @type {string}
 * @private
 */
anychart.core.map.series.Base.prototype.geoIdField_;


/**
 * @type {anychart.maps.Map}
 */
anychart.core.map.series.Base.prototype.map;


/**
 * Geo data internal view.
 * @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
 * @protected
 */
anychart.core.map.series.Base.prototype.geoData;


/**
 * @type {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.map.series.Base.prototype.tooltip_ = null;


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 */
anychart.core.map.series.Base.prototype.referenceValueNames;


/**
 * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
 * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * Possible values:
 *    'x' - transforms through xScale,
 *    'y' - transforms through yScale,
 *    'z' - gets as zero Y.
 * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
 * @type {!Array.<string>}
 */
anychart.core.map.series.Base.prototype.referenceValueMeanings;


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series color. See this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.map.series.Base.prototype.color_ = null;


/**
 * Series color from chart. See. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.map.series.Base.prototype.autoColor_ = null;


/**
 * Hatch fill type from chart.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.core.map.series.Base.prototype.autoHatchFill_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.map.series.Base.prototype.hatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.map.series.Base.prototype.hoverHatchFill_;


/**
 * Select hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.map.series.Base.prototype.selectHatchFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Base.prototype.fill_ = (function() {
  var color;
  if (this['colorScale']) {
    var refVale = this['referenceValueNames'][1];
    var value = this['iterator'].get(refVale);
    color = this['colorScale'].valueToColor(value);
  } else {
    color = this['sourceColor'];
  }
  return color;
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Base.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Base.prototype.selectFill_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.core.map.series.Base.prototype.strokeInternal = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.map.series.Base.prototype.selectStroke_ = null;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.map.series.Base.prototype.hoverStroke_ = null;


/**
 * Color scale.
 * @param {(anychart.core.map.scale.LinearColor|anychart.core.map.scale.OrdinalColor)=} opt_value Scale to set.
 * @return {!(anychart.core.map.scale.OrdinalColor|anychart.core.map.scale.LinearColor|anychart.core.map.series.Base)} Default chart color scale value or itself for
 * method chaining.
 */
anychart.core.map.series.Base.prototype.colorScale = function(opt_value) {
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
anychart.core.map.series.Base.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_COLOR_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_COLOR_RANGE);
  }
};


/**
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.map.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.map.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
    if (opt_value instanceof anychart.data.View)
      this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
    else if (opt_value instanceof anychart.data.Set)
      this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
    else
      this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
    this.registerDisposable(this.parentViewToDispose_);
    this.data_ = this.parentView_;
    this.data_.listenSignals(this.dataInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.map.series.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.map.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.map.series.Base.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * Sets/gets geo id field.
 * @param {string=} opt_value Geo id.
 * @return {string|anychart.core.map.series.Base}
 */
anychart.core.map.series.Base.prototype.geoIdField = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.geoIdField_) {
      this.geoIdField_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoIdField_;
};


/**
 * Internal method. Sets link to geo data.
 * @param {anychart.maps.Map} map .
 * @param {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} geoData Geo data to set.
 */
anychart.core.map.series.Base.prototype.setGeoData = function(map, geoData) {
  this.map = map;
  this.geoData = geoData;
  this.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.hasMarkers = function() {
  return false;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.map.series.Base.prototype.setAutoMarkerType = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.map.series.Base|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.map.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.map.series.Base.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Base} .
 */
anychart.core.map.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.color_ || this.autoColor_;
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.map.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.map.series.Base.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill_ = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


/**
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Base.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverHatchFill_)
      this.hoverHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Base.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectHatchFill_)
      this.selectHatchFill_ = hatchFill;
    return this;
  }
  return this.selectHatchFill_;
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.enums.AnyMapPointState} pointState If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.core.map.series.Base.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (pointState == anychart.enums.AnyMapPointState.HOVER) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (pointState == anychart.enums.AnyMapPointState.SELECT) {
    if (usePointSettings && goog.isDef(iterator.get('selectHatchFill'))) {
      hatchFill = iterator.get('selectHatchFill');
    } else if (goog.isDef(this.selectHatchFill())) {
      hatchFill = this.selectHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|string|boolean} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.core.map.series.Base.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill_ ||
        acgraph.vector.normalizeHatchFill(anychart.core.map.series.Base.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? this.autoHatchFill_ : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Base|Function} .
 */
anychart.core.map.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.fill_;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Base|Function} .
 */
anychart.core.map.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: we don't set anything cause everything is fine?
    return this;
  }
  return this.hoverFill_;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Base|Function} .
 */
anychart.core.map.series.Base.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: we don't set anything cause everything is fine?
    return this;
  }
  return this.selectFill_;
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.enums.AnyMapPointState} pointState Point state - normal, hover or select.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.map.series.Base.prototype.getFinalFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && iterator.get('fill')) || this.fill());

  var result;
  if (pointState == anychart.enums.AnyMapPointState.HOVER) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
        normalColor);
  } else if (pointState == anychart.enums.AnyMapPointState.SELECT) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('selectFill')) || this.selectFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.strokeInternal) {
      this.strokeInternal = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.strokeInternal;
};


/**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: we don't set anything cause there is nothing to do?
    return this;
  }
  return this.hoverStroke_;
};


/**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Base.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: we don't set anything cause there is nothing to do?
    return this;
  }
  return this.selectStroke_;
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.enums.AnyMapPointState} pointState If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.map.series.Base.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */((usePointSettings && iterator.get('stroke')) || this.stroke());

  var result;
  if (pointState == anychart.enums.AnyMapPointState.HOVER) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('hoverStroke')) || this.hoverStroke() || normalColor),
        normalColor);
  } else if (pointState == anychart.enums.AnyMapPointState.SELECT) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('selectStroke')) || this.selectStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.map.series.Base.prototype.normalizeColor = function(color, var_args) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Checks whether a labelsFactory instance already exist.
 * @return {boolean}
 */
anychart.core.map.series.Base.prototype.isLabelsInit = function() {
  return !!this.labels_;
};


/**
 * Gets or sets series data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.map.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.map.series.Base.prototype.labels = function(opt_value) {
  //If you invoke this method, you create labelsFactory instance. If you don't want to create the instance,
  // use isLabelsInit method to check whether a labelsFactory instance already exist.
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.adjustFontSize(true);
    this.labels_.fontWeight('bold');
    this.labels_.enabled(true);
    this.labels_.setParentEventTarget(this);
    this.labels_.textFormatter(function() {
      return this['name'];
    });
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.map.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.map.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Gets or sets series select data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.map.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.map.series.Base.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.map.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.map.series.Base.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = goog.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent(res);
  return res;
};


/**
 * Get point index by event. Used for events from data layer only
 * @param {anychart.core.MouseEvent} event .
 * @protected
 * @return {number} Point index.
 */
anychart.core.map.series.Base.prototype.getIndexByEvent = function(event) {
  return anychart.utils.toNumber(anychart.utils.extractTag(event['domTarget']).index);
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.core.map.series.Base.prototype.handleMouseOverAndMove = function(event) {
  var evt = this.makePointEvent(event);
  if (evt &&
      ((anychart.utils.checkIfParent(this, event['relatedTarget']) && this.hoverStatus.length > 0) ||
      this.dispatchEvent(evt))) {
    // we don't want to dispatch if this an out-over from the same point
    // in case of move we will always dispatch, because checkIfParent(this, undefined) will return false
    this.hoverPoint(/** @type {number} */ (evt['pointIndex']), event);
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.core.map.series.Base.prototype.handleMouseOut = function(event) {
  var evt = this.makePointEvent(event);
  var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
  var prevIndex = anychart.utils.toNumber(prevTag && prevTag.index);
  var index = evt['pointIndex'];
  if (anychart.utils.checkIfParent(this, event['relatedTarget']) && (isNaN(prevIndex) || prevIndex == index)) {
    // this means we got an out-over on the same point, for example - from the point to inside label
    // in this case we skip dispatching the event and unhovering to avoid possible label disappearance
    this.hoverPoint(/** @type {number} */ (index), event);
  } else if (this.dispatchEvent(evt)) {
    this.unhover();
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 */
anychart.core.map.series.Base.prototype.handleMouseClick = function(event) {
  var evt = this.makePointEvent(event);

  if (evt && ((anychart.utils.checkIfParent(this, event['relatedTarget'])) || this.dispatchEvent(evt))) {
    if (!(event.metaKey || event.shiftKey)) {
      this.map.unselectAll(event);
    }
    // we don't want to dispatch if this an out-over from the same point
    // in case of move we will always dispatch, because checkIfParent(this, undefined) will return false
    if (goog.array.indexOf(this.selectStatus, evt['pointIndex']) == -1)
      this.selectPoint(/** @type {number} */ (evt['pointIndex']), event);
    this.dispatchEvent(this.makeSelectPointEvent(event));
  }
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 * @protected
 */
anychart.core.map.series.Base.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }

  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iter,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {Object} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 * @protected
 */
anychart.core.map.series.Base.prototype.makeSelectPointEvent = function(event) {
  var selectedPoints = [];
  var iterator = this.getIterator();
  for (var i = 0, len = this.selectStatus.length; i < len; i++) {
    iterator.select(this.selectStatus[i]);
    var prop = iterator.meta('properties');
    selectedPoints.push({'id': prop[this.geoIdField()], 'index': iterator.getIndex(), 'properties': prop});
  }

  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }

  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  return {
    'type': anychart.enums.EventType.POINT_SELECT,
    'selectedPoint': selectedPoints[selectedPoints.length - 1],
    'selectedPoints': selectedPoints,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iterator,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Series hover status.
 * NaN - not hovered
 * -1 - series hovered
 * non-negative number - point with this index hovered.
 * @type {Array.<number>}
 * @protected
 */
anychart.core.map.series.Base.prototype.hoverStatus;


/**
 * @type {Array.<number>}
 * @protected
 */
anychart.core.map.series.Base.prototype.selectStatus;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.map.series.Base.prototype.needSelfLayer;


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.map.series.Base} An instance of the {@link anychart.core.map.series.Base} class for method chaining.
 */
anychart.core.map.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.core.map.series.Base}  {@link anychart.core.map.series.Base} instance for method chaining.
 */
anychart.core.map.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.core.map.series.Base} {@link anychart.core.map.series.Base} instance for method chaining.
 */
anychart.core.map.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * Selects a point of the series by its index.
 * @param {number} index Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.core.map.series.Base} {@link anychart.core.map.series.Base} instance for method chaining.
 */
anychart.core.map.series.Base.prototype.selectPoint = goog.abstractMethod;


/**
 * Deselects all points.
 * @param {anychart.core.MouseEvent} event Event that initiate point selecting.
 * @return {!anychart.core.map.series.Base} {@link anychart.core.map.series.Base} instance for method chaining.
 */
anychart.core.map.series.Base.prototype.unselectAll = goog.abstractMethod;


/**
 * Imitates selects a point of the series by its index.
 * @param {number} index Index of the point to select.
 * @return {!anychart.core.map.series.Base} {@link anychart.core.map.series.Base} instance for method chaining.
 */
anychart.core.map.series.Base.prototype.select = goog.abstractMethod;


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {Object} prop .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.core.map.series.Base.prototype.makeInteractive = function(element, prop, opt_seriesGlobal) {
  if (!element) return;
  element.tag = {series: this};
  if (opt_seriesGlobal) {
    element.tag.index = true;
  } else {
    element.tag.index = this.getIterator().getIndex();
  }
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.remove = function() {
  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Calculation color scale.
 */
anychart.core.map.series.Base.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA | anychart.ConsistencyState.MAP_COLOR_SCALE)) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
        var name = iterator.get(this.referenceValueNames[0]);
        for (var i = 0, len = this.geoData.length; i < len; i++) {
          var geom = this.geoData[i];
          if (!geom) continue;
          var prop = geom['properties'];
          if (prop[this.geoIdField()] == name) {
            this.points_.push(geom);
            iterator.meta('shape', geom.domElement).meta('properties', prop);
            break;
          }
        }
      }

      if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_SCALE)) {
        if (this.colorScale_ && this.colorScale_ instanceof anychart.core.map.scale.LinearColor) {
          var value = iterator.get(this.referenceValueNames[1]);
          this.colorScale_.extendDataRange(value);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_SCALE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws series into the current container.
 * @return {anychart.core.map.series.Base} An instance of {@link anychart.core.map.series.Base} class for method chaining.
 */
anychart.core.map.series.Base.prototype.draw = function() {
  this.suspendSignalsDispatching();
  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);

  var iterator = this.getResetIterator();

  this.startDrawing();
  while (iterator.advance() && this.enabled()) {
    var index = iterator.getIndex();
    var pointState = anychart.enums.AnyMapPointState.NORMAL;
    if (goog.array.indexOf(this.selectStatus, index) != -1)
      pointState = anychart.enums.AnyMapPointState.SELECT;
    else if (goog.array.indexOf(this.hoverStatus, index) != -1)
      pointState = anychart.enums.AnyMapPointState.HOVER;

    this.drawPoint(pointState);
  }
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.map.series.Base.prototype.startDrawing = function() {
  if (!this.rootLayer) {
    if (this.needSelfLayer) {
      this.rootLayer = acgraph.layer();
      this.bindHandlersToGraphics(this.rootLayer);
    } else {
      this.rootLayer = this.container();
    }
  }

  this.checkDrawingNeeded();

  var labels = this.labels_;
  var hoverLabels = this.hoverLabels_;
  var selectLabels = this.selectLabels_;

  if (labels || hoverLabels || selectLabels) {
    this.labels().suspendSignalsDispatching();
    this.hoverLabels().suspendSignalsDispatching();
    this.selectLabels().suspendSignalsDispatching();
    labels.clear();
    labels.setAutoZIndex(anychart.maps.Map.ZINDEX_CHORPLETH_LABELS);
    labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    labels.parentBounds(/** @type {anychart.math.Rect} */(this.container().getBounds()));
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var needHatchFill = this.hatchFill_ || this.hoverHatchFill_ || this.selectHatchFill_;
    if (!this.hatchFillRootElement && needHatchFill) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillRootElement.zIndex(anychart.maps.Map.ZINDEX_CHORPLETH_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    if (this.hatchFillRootElement) this.hatchFillRootElement.clear();
  }
};


/**
 * Cconstructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.map.series.Base.prototype.rootTypedLayerInitializer = goog.abstractMethod;


/**
 * Draws a point iterator points to.
 * @param {anychart.enums.AnyMapPointState} pointState Point state.
 */
anychart.core.map.series.Base.prototype.drawPoint = function(pointState) {
  this.drawLabel(pointState);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.map.series.Base.prototype.finalizeDrawing = function() {
  if (this.labels_) {
    this.labels_.draw();
    this.labels_.resumeSignalsDispatching(false);
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
  }
  if (this.hoverLabels_) {
    this.hoverLabels_.resumeSignalsDispatching(false);
    this.hoverLabels_.markConsistent(anychart.ConsistencyState.ALL);
  }
  if (this.selectLabels_) {
    this.selectLabels_.resumeSignalsDispatching(false);
    this.selectLabels_.markConsistent(anychart.ConsistencyState.ALL);
  }

  //if (this.clip()) {
  //  var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBoundsCache : this.clip());
  //  var labelDOM = this.labels().getDomElement();
  //  if (labelDOM) labelDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
  //}

  // This check need to prevent finalizeDrawing to mark CONTAINER consistency state in case when series was disabled by
  // series.enabled(false).
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.map.series.Base.prototype.createFormatProvider = function() {
  if (!this.pointProvider_)
    this.pointProvider_ = {};

  var iterator = this.getIterator();
  var id = iterator.get(this.referenceValueNames[0]);
  var value = iterator.get(this.referenceValueNames[1]);
  var pointGeoProp = iterator.meta('properties');

  this.pointProvider_['id'] = id;
  this.pointProvider_['value'] = value;
  if (pointGeoProp)
    this.pointProvider_['name'] = pointGeoProp['name'];


  if (this.colorScale_) {
    this.pointProvider_['color'] = this.colorScale_.valueToColor(value);
    if (this.colorScale_ instanceof anychart.core.map.scale.OrdinalColor) {
      var range = this.colorScale_.getRangeByValue(/** @type {number} */(value));
      if (range) {
        this.pointProvider_['colorRange'] = {
          'color': range.color,
          'end': range.end,
          'name': range.name,
          'start': range.start,
          'index': range.sourceIndex
        };
      }
    }
  }

  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.map.series.Base.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  var pointGeoProp = /** @type {Object}*/(iterator.meta('properties'));

  var geoMiddleX = goog.object.findValue(pointGeoProp, function(value, key) {
    return (/middle-x/).test(key);
  });
  var geoMiddleY = goog.object.findValue(pointGeoProp, function(value, key) {
    return (/middle-y/).test(key);
  });

  var middleX = /** @type {number}*/(iterator.get('middle-x') || geoMiddleX || .5);
  var middleY = /** @type {number}*/(iterator.get('middle-y') || geoMiddleY || .5);

  var shape = iterator.meta('shape');
  var positionProvider;
  if (shape) {
    var bounds = shape.getBounds();
    positionProvider = {'value': {'x': bounds.left + bounds.width * middleX, 'y': bounds.top + bounds.height * middleY}};
  } else {
    positionProvider = {'value': {'x': 0, 'y': 0}};
  }
  return positionProvider;
};


/**
 * Draws marker for a point.
 * @param {anychart.enums.AnyMapPointState} pointState If it is a hovered marker drawing.
 * @protected
 */
anychart.core.map.series.Base.prototype.drawLabel = function(pointState) {
  var iterator = this.getIterator();
  var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
  if (!shape || !this.labels_) return;

  var selected = pointState == anychart.enums.AnyMapPointState.SELECT;
  var hovered = pointState == anychart.enums.AnyMapPointState.HOVER;

  var pointLabel = iterator.get('labels');
  var hoverPointLabel = hovered ? iterator.get('hoverLabels') : null;
  var selectPointLabel = selected ? iterator.get('selectLabels') : null;

  var index = iterator.getIndex();
  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels_);
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels_);
  } else {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels_);
  }

  var label = this.labels_.getLabel(index);

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(labelHoverEnabledState) ?
              goog.isNull(this.hoverLabels_.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels_.enabled() :
                      labelEnabledState :
                  this.hoverLabels_.enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(this.selectLabels_.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels_.enabled() :
                      labelEnabledState :
                  this.selectLabels_.enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels_.enabled() :
          labelEnabledState;

  if (isDraw) {
    var positionProvider = this.createPositionProvider();
    var formatProvider = this.createFormatProvider();
    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labels_.add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));
    label.draw();
  } else if (label) {
    label.clear();
  }
};


/**
 * Show data point tooltip.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.core.map.series.Base.prototype.showTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());

  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(opt_event['clientX'], opt_event['clientY']));
  } else {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Hide data point tooltip.
 */
anychart.core.map.series.Base.prototype.hideTooltip = function() {
  /** @type {anychart.core.ui.Tooltip} */(this.tooltip()).hide();
};


/**
 * Returns type of current series.
 * @return {anychart.enums.MapSeriesType} Series type.
 */
anychart.core.map.series.Base.prototype.getType = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series name.
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.core.map.series.Base|undefined)} Series name value or itself for method chaining.
 */
anychart.core.map.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      //TODO: send signal to redraw name dependent components, series, legend etc
    }
    return this;
  } else {
    return this.name_;
  }
};


/**
 * Sets/gets series number.
 * @param {number=} opt_value
 * @return {number|anychart.core.map.series.Base}
 */
anychart.core.map.series.Base.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.index_ != opt_value) {
      this.index_ = opt_value;
    }
    return this;
  } else {
    return this.index_;
  }
};


/**
 * Creates context provider for legend items text formatter function.
 * @return {anychart.core.utils.LegendContextProvider} Legend context provider.
 * @private
 */
anychart.core.map.series.Base.prototype.createLegendContextProvider_ = function() {
  if (!this.legendProvider_)
    this.legendProvider_ = new anychart.core.utils.LegendContextProvider(this);
  return this.legendProvider_;
};


/**
 * Creates legend item config.
 * @param {Function} itemsTextFormatter Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Legend item config.
 */
anychart.core.map.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var iconFill, iconStroke, iconHatchFill;
  if (goog.isFunction(legendItem.iconFill())) {
    iconFill = legendItem.iconFill().call(this.color());
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    iconStroke = legendItem.iconStroke().call(this.color());
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    iconHatchFill = legendItem.iconHatchFill().call(this.autoHatchFill_);
  }
  var itemText;
  if (goog.isFunction(itemsTextFormatter)) {
    var format = this.createLegendContextProvider_();
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index();

  var ret = {
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconType': this.getLegendIconType(),
    'iconStroke': iconStroke,
    'iconFill': iconFill || this.color(),
    'iconHatchFill': iconHatchFill,
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.map.series.Base)} Legend item settings or self for chaining.
 */
anychart.core.map.series.Base.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.registerDisposable(this.legendItem_);
    this.legendItem_.listenSignals(this.onLegendItemSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.map.series.Base.prototype.onLegendItemSignal_ = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


/**
 * Gets legend icon type for the series.
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.map.series.Base.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.SQUARE);
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.getEnableChangeSignals = function() {
  return goog.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED |
      anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['seriesType'] = this.getType();
  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));

  if (goog.isDef(this.name()))
    json['name'] = this.name();

  json['data'] = this.data().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['selectLabels'] = this.selectLabels().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['legendItem'] = this.legendItem().serialize();

  if (goog.isDef(this.geoIdField()))
    json['geoIdField'] = this.geoIdField();

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectFill']
      );
    } else {
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectStroke']
      );
    } else {
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverHatchFill']
      );
    } else {
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
    }
  }
  if (goog.isFunction(this['selectHatchFill'])) {
    if (goog.isFunction(this.selectHatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectHatchFill']
      );
    } else {
      json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectHatchFill()));
    }
  }
  return json;
};


/** @inheritDoc */
anychart.core.map.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.color(config['color']);

  if (goog.isFunction(this['fill']))
    this.fill(config['fill']);
  if (goog.isFunction(this['hoverFill']))
    this.hoverFill(config['hoverFill']);
  if (goog.isFunction(this['selectFill']))
    this.hoverFill(config['selectFill']);

  if (goog.isFunction(this['stroke']))
    this.stroke(config['stroke']);
  if (goog.isFunction(this['hoverStroke']))
    this.hoverStroke(config['hoverStroke']);
  if (goog.isFunction(this['selectStroke']))
    this.hoverStroke(config['selectStroke']);

  if (goog.isFunction(this['hatchFill']))
    this.hatchFill(config['hatchFill']);
  if (goog.isFunction(this['hoverHatchFill']))
    this.hoverHatchFill(config['hoverHatchFill']);
  if (goog.isFunction(this['selectHatchFill']))
    this.hoverHatchFill(config['selectHatchFill']);

  this.labels(config['labels']);
  this.hoverLabels(config['hoverLabels']);
  this.selectLabels(config['selectLabels']);

  this.name(config['name']);
  this.geoIdField(config['geoIdField']);

  if ('data' in config)
    this.data(config['data'] || null);

  this.tooltip(config['tooltip']);
  this.legendItem(config['legendItem']);
};


//exports
anychart.core.map.series.Base.prototype['color'] = anychart.core.map.series.Base.prototype.color;

anychart.core.map.series.Base.prototype['selectFill'] = anychart.core.map.series.Base.prototype.selectFill;
anychart.core.map.series.Base.prototype['hoverFill'] = anychart.core.map.series.Base.prototype.hoverFill;
anychart.core.map.series.Base.prototype['fill'] = anychart.core.map.series.Base.prototype.fill;

anychart.core.map.series.Base.prototype['selectStroke'] = anychart.core.map.series.Base.prototype.selectStroke;
anychart.core.map.series.Base.prototype['hoverStroke'] = anychart.core.map.series.Base.prototype.hoverStroke;
anychart.core.map.series.Base.prototype['stroke'] = anychart.core.map.series.Base.prototype.stroke;

anychart.core.map.series.Base.prototype['selectHatchFill'] = anychart.core.map.series.Base.prototype.selectHatchFill;
anychart.core.map.series.Base.prototype['hoverHatchFill'] = anychart.core.map.series.Base.prototype.hoverHatchFill;
anychart.core.map.series.Base.prototype['hatchFill'] = anychart.core.map.series.Base.prototype.hatchFill;

anychart.core.map.series.Base.prototype['labels'] = anychart.core.map.series.Base.prototype.labels;
anychart.core.map.series.Base.prototype['hoverLabels'] = anychart.core.map.series.Base.prototype.hoverLabels;
anychart.core.map.series.Base.prototype['selectLabels'] = anychart.core.map.series.Base.prototype.selectLabels;

anychart.core.map.series.Base.prototype['geoIdField'] = anychart.core.map.series.Base.prototype.geoIdField;
anychart.core.map.series.Base.prototype['tooltip'] = anychart.core.map.series.Base.prototype.tooltip;
anychart.core.map.series.Base.prototype['colorScale'] = anychart.core.map.series.Base.prototype.colorScale;
anychart.core.map.series.Base.prototype['legendItem'] = anychart.core.map.series.Base.prototype.legendItem;
anychart.core.map.series.Base.prototype['data'] = anychart.core.map.series.Base.prototype.data;
