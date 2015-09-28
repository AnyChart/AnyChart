goog.provide('anychart.charts.Map');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.map.scale.Geo');
goog.require('anychart.core.map.series.Base');
goog.require('anychart.core.ui.ColorRange');
goog.require('anychart.core.utils.UnboundRegionsSettings');
goog.require('anychart.utils.GeoJSONParser');
goog.require('goog.dom');



/**
 * AnyChart Map class.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Map = function() {
  goog.base(this);

  /**
   * Internal represent of geo data.
   * @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
   * @private
   */
  this.internalGeoData_ = [];

  /**
   *
   * @type {Array.<acgraph.vector.Element>}
   */
  this.mapPaths = [];

  /**
   *
   * @type {Array.<acgraph.vector.Element>}
   */
  this.mapPathsPool = [];

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * @type {!Array.<anychart.core.map.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * Geo data settings.
   * @type {Node|string|Object}
   * @private
   */
  this.geoData_ = null;

  /**
   * Max size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.maxBubbleSize_;

  /**
   * Min size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.minBubbleSize_;

  this.unboundRegions(true);
  this.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);
};
goog.inherits(anychart.charts.Map, anychart.core.SeparateChart);


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Map.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MAP_SERIES |
    anychart.ConsistencyState.MAP_SCALE |
    anychart.ConsistencyState.MAP_GEO_DATA |
    anychart.ConsistencyState.MAP_PALETTE |
    anychart.ConsistencyState.MAP_COLOR_RANGE |
    anychart.ConsistencyState.MAP_MARKER_PALETTE |
    anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE;


/**
 * Map z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_MAP = 10;


/**
 * Series labels z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_LABELS = 11;


/**
 * Series markers z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_MARKERS = 12;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_SERIES = 30;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_LABEL = 40;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_MARKER = 40;


/**
 * Color range z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_COLOR_RANGE = 50;


/**
 * Series hatch fill z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_HATCH_FILL = 60;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_AXIS = 100;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Map layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.charts.Map.prototype.mapLayer_;


/**
 * Geo scale.
 * @type {anychart.core.map.scale.Geo}
 * @private
 */
anychart.charts.Map.prototype.scale_;


/**
 * Allow point selection if is true.
 * @type {boolean}
 * @private
 */
anychart.charts.Map.prototype.allowPointsSelect_;


/**
 * Internal map getter/setter.
 * @param {anychart.enums.MapSeriesType=} opt_value Series type.
 * @return {anychart.charts.Map|anychart.enums.MapSeriesType}
 */
anychart.charts.Map.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/** @inheritDoc */
anychart.charts.Map.prototype.getType = function() {
  return anychart.enums.MapTypes.MAP;
};


/**
 * Sets/gets geo id field.
 * @param {string=} opt_value Geo id.
 * @return {string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.geoIdField = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.geoIdField_) {
      this.geoIdField_ = opt_value;
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoIdField_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Map scale.
 * @param {anychart.core.map.scale.Geo=} opt_value Scale to set.
 * @return {!(anychart.core.map.scale.Geo|anychart.charts.Map)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Map.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.geoScaleInvalidated_, this);
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.geoScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.MAP_SCALE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = new anychart.core.map.scale.Geo();
      this.scale_.listenSignals(this.geoScaleInvalidated_, this);
    }
    return this.scale_;
  }
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.Map.prototype.geoScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_SCALE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|boolean)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.UnboundRegionsSettings|anychart.charts.Map}
 */
anychart.charts.Map.prototype.unboundRegions = function(opt_value) {
  if (!this.unboundRegionsSettings_)
    this.unboundRegionsSettings_ = new anychart.core.utils.UnboundRegionsSettings(this);

  if (goog.isDef(opt_value)) {
    this.unboundRegionsSettings_.setup(opt_value);
    return this;
  }
  return this.unboundRegionsSettings_;
};


/**
 * Allows to select points of the Map.
 * @param {boolean=} opt_value Allow or not.
 * @return {boolean|anychart.charts.Map} Returns allow points select state or current map instance for chaining.
 * @deprecated use chart.interactivity().selectionMode().
 */
anychart.charts.Map.prototype.allowPointsSelect = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.interactivity().selectionMode(opt_value ?
        anychart.enums.SelectionMode.MULTI_SELECT :
        anychart.enums.SelectionMode.NONE);
    return this;
  }
  return this.interactivity().selectionMode() != anychart.enums.SelectionMode.NONE;
};


/**
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Map)} .
 */
anychart.charts.Map.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.Map)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Map.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Map hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Map)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Map.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.Map.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for color range.
 * @param {(anychart.core.ui.ColorRange|Object)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.core.ui.ColorRange|anychart.charts.Map)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Map.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.core.ui.ColorRange();
    this.colorRange_.listenSignals(this.colorRangeInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.MAP_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE |
        anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates choropleth series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {Node|string|Object} Passed geo data.
 */
anychart.charts.Map.prototype.choropleth = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.CHOROPLETH, data, opt_csvSettings);
};


/**
 * Creates bubble series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {Node|string|Object} Passed geo data.
 */
anychart.charts.Map.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.BUBBLE, data, opt_csvSettings);
};


/**
 * @param {string} type Series type.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @param {number=} opt_zIndex Optional series zIndex.
 * @private
 * @return {anychart.core.map.series.Choropleth}
 */
anychart.charts.Map.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl;
  type = ('' + type).toLowerCase();
  for (var i in anychart.core.map.series.Base.SeriesTypesMap) {
    if (i.toLowerCase() == type)
      ctl = anychart.core.map.series.Base.SeriesTypesMap[i];
  }
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setParentEventTarget(this);
    this.series_.push(instance);

    var index = this.series_.length - 1;
    var inc = index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);

    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.charts.Map.ZINDEX_SERIES) + inc);
    instance.labels().setAutoZIndex(anychart.charts.Map.ZINDEX_LABEL + inc + anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER / 2);

    instance.setAutoGeoIdField(this.geoIdField());
    instance.setGeoData(this, this.internalGeoData_);
    instance.setAutoColor(this.palette().itemAt(this.series_.length - 1));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(this.series_.length - 1)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(this.series_.length - 1)));

    if (instance.hasMarkers()) {
      instance.markers().setAutoZIndex(anychart.charts.Map.ZINDEX_MARKER + inc);
      instance.markers().setAutoFill((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerFill());
      instance.markers().setAutoStroke((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerStroke());
    }

    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.MAP_SERIES |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Map.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Sets max size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.maxBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxBubbleSize_ != opt_value) {
      this.maxBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxBubbleSize_;
};


/**
 * Sets min size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.minBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minBubbleSize_ != opt_value) {
      this.minBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minBubbleSize_;
};


/** @inheritDoc */
anychart.charts.Map.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.seriesInvalidated_ = function(event) {
  var state = 0;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.APPEARANCE;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.CHART_LEGEND;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_COLOR_RANGE)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE;
    var colorRange = this.colorRange();
    colorRange.dropBoundsCache();
    colorRange.invalidate(colorRange.ALL_VISUAL_STATES);
  }

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.charts.Map.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Getter/setter geo data.
 * @param {Node|string|Object=} opt_data SVG|SVGString|GeoJSON|MapNameString.
 * @return {Node|string|Object} Passed geo data.
 */
anychart.charts.Map.prototype.geoData = function(opt_data) {
  if (goog.isDef(opt_data)) {
    if (this.geoData_ != opt_data) {
      this.geoData_ = opt_data;

      this.invalidate(anychart.ConsistencyState.MAP_SCALE |
          anychart.ConsistencyState.MAP_GEO_DATA |
          anychart.ConsistencyState.MAP_SERIES |
          anychart.ConsistencyState.MAP_COLOR_RANGE |
          anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
          anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoData_;
};


/**
 * Clear map paths.
 */
anychart.charts.Map.prototype.clear = function() {
  for (var i = 0, len = this.mapPaths.length; i < len; i++) {
    var path = this.mapPaths[i];
    if (path) {
      path.clear();
      path.parent(null);
      path.removeAllListeners();
      delete path.tag;

      this.mapPathsPool.push(path);
    }
  }
  this.mapPaths.length = 0;
};


/**
 * Geo data processing.
 */
anychart.charts.Map.prototype.processGeoData = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    if (goog.isDefAndNotNull(this.geoData_)) {
      if ((goog.isString(this.geoData_) && goog.string.startsWith(this.geoData_, '<')) || goog.dom.isNodeLike(this.geoData_)) {
        //todo (blackart): Here will be svg parsing. coming soon ...
      }
      var geoData = goog.isString(this.geoData_) ? goog.dom.getWindow()['anychart']['maps'][this.geoData_] : this.geoData_;
      this.internalGeoData_ = anychart.utils.GeoJSONParser.getInstance().parse(/** @type {Object} */(geoData));
      var geoIdFromGeoData = geoData['ac-geoFieldId'];
      if (geoIdFromGeoData)
        this.geoIdField(geoIdFromGeoData);

      if (!this.mapLayer_) {
        this.mapLayer_ = this.rootElement.layer();
        this.mapLayer_.zIndex(anychart.charts.Map.ZINDEX_MAP);
      } else {
        this.clear();
      }

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA);
  }
};


/**
 * Calculate geo scale.
 */
anychart.charts.Map.prototype.calculate = function() {
  this.processGeoData();

  var i, series;
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SCALE)) {
    var scale = this.scale();
    scale.startAutoCalc();

    var j, len;
    for (i = 0, len = this.internalGeoData_.length; i < len; i++) {
      var geom = this.internalGeoData_[i];
      if (geom) {
        if (goog.object.containsKey(geom, 'geometries')) {
          var geometries = geom['geometries'];
          var geomsLen = geometries.length;
          for (j = 0; j < geomsLen; j++) {
            this.iterateGeometry_(geometries[j], this.calcGeom_);
          }
        } else {
          this.iterateGeometry_(
              /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom),
              this.calcGeom_);
        }
      }
    }
    scale.finishAutoCalc();

    var max = -Infinity;
    var min = Infinity;
    var sum = 0;
    var pointsCount = 0;

    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setGeoData(this, this.internalGeoData_);
      series.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);

      //----------------------------------calc statistics for series
      series.calculateStatistics();
      max = Math.max(max, /** @type {number} */(series.statistics('seriesMax')));
      min = Math.min(min, /** @type {number} */ (series.statistics('seriesMin')));
      sum += /** @type {number} */(series.statistics('seriesSum'));
      pointsCount += /** @type {number} */(series.statistics('seriesPointsCount'));
      //----------------------------------end calc statistics for series
      series.calculate();
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    for (i = 0; i < this.series_.length; i++) {
      series = this.series_[i];
      series.statistics('max', max);
      series.statistics('min', min);
      series.statistics('sum', sum);
      series.statistics('average', average);
      series.statistics('pointsCount', pointsCount);
    }
    //----------------------------------end calc statistics for series

    this.markConsistent(anychart.ConsistencyState.MAP_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.container(this.rootElement);
    }
  }
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.charts.Map.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1], this.minBubbleSize_, this.maxBubbleSize_);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Map.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @private
 */
anychart.charts.Map.prototype.invalidateSizeBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  }
};


/**
 * Function for draw geoms.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @private
 */
anychart.charts.Map.prototype.drawGeom_ = function(coords, index, geom) {
  var x, y;
  var xy = this.scale().transform(coords[index], coords[index + 1]);
  x = xy[0];
  y = xy[1];

  if (goog.object.containsKey(geom, 'coordinates')) {
    geom.domElement.moveTo(x, y).lineTo(x, y);
  } else {
    if (index == 0) geom.domElement.moveTo(x, y);
    else geom.domElement.lineTo(x, y);
  }
};


/**
 * Function for calculate geo scale.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @private
 */
anychart.charts.Map.prototype.calcGeom_ = function(coords, index, geom) {
  this.scale().extendDataRangeX(coords[index]);
  this.scale().extendDataRangeY(coords[index + 1]);
};


/**
 * Draw geometry.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geometry.
 * @param {function(
 *            this: anychart.charts.Map,
 *            Array.<number>,
 *            number,
 *            (anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon)
 *         )} callBack DOM element.
 * @private
 */
anychart.charts.Map.prototype.iterateGeometry_ = function(geom, callBack) {
  var j, k, m, geomsLen, pointsLen;
  if (!geom) return;
  if (goog.object.containsKey(geom, 'polygones')) {
    var polygones = geom['polygones'];
    geomsLen = polygones.length;
    for (j = 0; j < geomsLen; j++) {
      var polygone = polygones[j];
      var outerPath = polygone['outerPath'];
      var holes = polygone['holes'];
      pointsLen = outerPath.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, outerPath, k, geom);
      }

      pointsLen = holes.length;
      for (k = 0; k < pointsLen; k++) {
        var hole = holes[k];
        for (m = 0; m < hole.length - 1; m += 2) {
          callBack.call(this, hole, m, geom);
        }
      }
    }
  } else if (goog.object.containsKey(geom, 'paths')) {
    var paths = geom['paths'];
    geomsLen = paths.length;
    for (j = 0; j < geomsLen; j++) {
      var path = paths[j];
      pointsLen = path.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, path, k, geom);
      }
    }
  } else if (goog.object.containsKey(geom, 'coordinates')) {
    var coords = geom['coordinates'];
    pointsLen = coords.length;
    for (k = 0; k < pointsLen - 1; k += 2) {
      callBack.call(this, coords, k, geom);
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.drawContent = function(bounds) {
  var i, series;
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      var targetSeries;
      for (i = 0; i < this.series_.length; i++) {
        if (this.series_[i].isChoropleth())
          targetSeries = this.series_[i];
      }
      if (targetSeries) {
        this.colorRange_.suspendSignalsDispatching();
        this.colorRange_.scale(targetSeries.colorScale());
        this.colorRange_.target(targetSeries);
        this.colorRange_.resumeSignalsDispatching(false);
        this.invalidate(anychart.ConsistencyState.BOUNDS);
      }
    }
  }

  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var scale = this.scale();
    var contentAreaBounds;
    if (this.colorRange_) {
      this.colorRange_.parentBounds(bounds.clone().round());
      contentAreaBounds = this.colorRange_.getRemainingBounds();
    } else {
      contentAreaBounds = bounds.clone();
    }
    scale.setBounds(contentAreaBounds);
    this.dataBounds_ = contentAreaBounds;

    this.clear();
    var j, len;
    for (i = 0, len = this.internalGeoData_.length; i < len; i++) {
      var geom = this.internalGeoData_[i];
      if (!geom) continue;

      var domElement;
      if (this.mapPathsPool.length > 0) {
        domElement = this.mapPathsPool.pop().parent(this.mapLayer_);
      } else {
        domElement = this.mapLayer_.path();
      }

      geom.domElement = domElement;
      this.mapPaths.push(domElement);

      if (goog.object.containsKey(geom, 'geometries')) {
        var geometries = geom['geometries'];
        var geomsLen = geometries.length;
        for (j = 0; j < geomsLen; j++) {
          this.iterateGeometry_(geometries[j], this.drawGeom_);
        }
      } else {
        this.iterateGeometry_(
            /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom),
            this.drawGeom_);
      }
    }

    for (i = this.series_.length; i--;) {
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.unboundRegionsSettings_ && this.unboundRegionsSettings_.enabled()) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        this.mapPaths[i].visible(true)
            .fill(this.unboundRegionsSettings_.fill())
            .stroke(this.unboundRegionsSettings_.stroke());
      }
    } else {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        this.mapPaths[i].visible(false);
      }
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_PALETTE |
      anychart.ConsistencyState.MAP_MARKER_PALETTE |
      anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
      anychart.ConsistencyState.MAP_SERIES))
  {
    this.calcBubbleSizes_();
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
      series.setAutoGeoIdField(/** @type {string} */(this.geoIdField()));
      series.setAutoColor(this.palette().itemAt(i));
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
      series.draw();
    }
    this.markConsistent(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.MAP_MARKER_PALETTE |
        anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE | anychart.ConsistencyState.MAP_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoColor(this.palette().itemAt(i));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoGeoIdField(/** @type {string} */(this.geoIdField()));
      series.draw();
    }
    this.markConsistent(anychart.ConsistencyState.MAP_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.container(this.rootElement);
      this.colorRange_.zIndex(anychart.charts.Map.ZINDEX_COLOR_RANGE);
      this.colorRange_.draw();
      this.colorRange_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_RANGE);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Map.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();

  var series, scale, itemData;
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      series = this.series_[i];
      scale = series.colorScale();
      itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.index();
      itemData['meta'] = {
        scale: scale
      };
      data.push(itemData);
    }
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target() &&
        this.colorRange_.scale() instanceof anychart.core.map.scale.OrdinalColor) {
      scale = this.colorRange_.scale();
      series = this.colorRange_.target();
    } else {
      for (i = 0, count = this.series_.length; i < count; i++) {
        series = this.series_[i];
        if (series.colorScale() instanceof anychart.core.map.scale.OrdinalColor) {
          scale = series.colorScale();
          break;
        }
      }
    }
    if (scale) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        data.push({
          'text': range.name,
          'iconEnabled': true,
          'iconType': anychart.enums.LegendItemIconType.SQUARE,
          'iconFill': range.color,
          'disabled': !this.enabled(),
          'sourceUid': goog.getUid(this),
          'sourceKey': i,
          'meta': {
            series: series,
            scale: scale,
            range: range
          }
        });
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT || mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series) {
      series.enabled(!series.enabled());
      if (series.enabled())
        series.hoverSeries();
      else
        series.unhover();
    }
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var pointValue = iterator.get(series.referenceValueNames[1]);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
        event.series = series;
        event.index = points;
      } else {
        event.points = [{
          series: series,
          points: points,
          lastPoint: points[points.length - 1],
          nearestPointToCursor: {index: points[points.length - 1], distance: 0}
        }];
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.hoverSeries();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.map.series.Base} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get(series.referenceValueNames[1]);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.series = series;
          tag.index = points;
        } else {
          tag.points = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

      if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
        this.colorRange_.showMarker((range.start + range.end) / 2);
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.unhover();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
      this.colorRange_.hideMarker();
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.getSeriesStatus = function(event) {
  if (event['target'] instanceof anychart.core.ui.Legend) {
    var tag = anychart.utils.extractTag(event['domTarget']);
    return tag.points;
  }

  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);
  var clientX = event['clientX'];
  var clientY = event['clientY'];

  var value, index;

  var containerOffset = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();

    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series.enabled()) {
        var iterator = series.getIterator();

        var indexes = [];
        iterator.reset();
        var minLength = Infinity;
        var minLengthIndex;
        while (iterator.advance()) {
          var shape = iterator.meta('shape');
          if (shape) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));

            index = iterator.getIndex();
            var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
            if (length <= spotRadius) {
              indexes.push(index);
              if (length < minLength) {
                minLength = length;
                minLengthIndex = index;
              }
            }
          }
        }
        if (indexes.length)
          points.push({
            series: series,
            points: indexes,
            lastPoint: indexes[indexes.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
      }
    }
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    //not working yet. coming soon.
  }

  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.charts.Map.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var series = status.series;
    var eventStatus = {'series': series};
    var iterator = series.getIterator();
    var points = [];
    if (!opt_empty) {
      for (var j = 0; j < status.points.length; j++) {
        var index = status.points[j];
        if (iterator.select(index)) {
          var prop = iterator.meta('regionProperties');
          if (prop) {
            var point = {
              'id': prop[series.getFinalGeoIdField()],
              'index': iterator.getIndex(),
              'properties': prop
            };
            points.push(point);
          } else {
            points.push(index);
          }
        }
      }
    }
    eventStatus['points'] = points;

    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      index = status.nearestPointToCursor.index;
      if (iterator.select(index)) {
        point = {};
        prop = iterator.meta('regionProperties');
        if (prop) {
          point['id'] = prop[series.getFinalGeoIdField()];
          point['index'] = iterator.getIndex();
          point['properties'] = prop;
        }
      } else {
        point = index;
      }
      nearestPointToCursor_ = {
        'point': point,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventStatus['nearestPointToCursor'] = nearestPointToCursor_;
    eventSeriesStatus.push(eventStatus);
  }

  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.charts.Map.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  index = goog.isArray(index) && index.length ? index[0] : index;
  if (this.colorRange_ && this.colorRange_.target()) {
    var target = this.colorRange_.target();
    if (target == series) {
      var iterator = target.getIterator();
      iterator.select(index);
      var value = iterator.get(target.referenceValueNames[1]);
      this.colorRange_.showMarker(value);
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.doAdditionActionsOnMouseOut = function() {
  if (this.colorRange_ && this.colorRange_.enabled()) {
    this.colorRange_.hideMarker();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Map.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.colorRange(config['colorRange']);
  this.unboundRegions(config['unboundRegions']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);
  this.geoIdField(config['geoIdField']);
  if (goog.isDef(config['allowPointsSelect'])) {
    this.interactivity().selectionMode(
        config['allowPointsSelect'] ? anychart.enums.SelectionMode.MULTI_SELECT : anychart.enums.SelectionMode.NONE);
  }

  var i, json, scale;
  if (config['geoScale']) {
    scale = new anychart.core.map.scale.Geo();
    scale.setup(config['geoScale']);
    this.scale(scale);
  }

  var series = config['series'];
  var scales = config['colorScales'];

  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      var type = goog.isString(json) ? json : json['type'];
      type = (type + '').toLowerCase();
      switch (type) {
        case 'ordinalcolor':
          scale = new anychart.core.map.scale.OrdinalColor();
          break;
        case 'linearcolor':
          scale = new anychart.core.map.scale.LinearColor();
          break;
        default:
          scale = new anychart.core.map.scale.LinearColor();
      }
      if (goog.isObject(json))
        scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.defaultSeriesType()).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('colorScale' in json) seriesInst.colorScale(scalesInstances[json['colorScale']]);
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['type'] = this.getType();
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['unboundRegions'] = this.unboundRegions().serialize();
  json['colorRange'] = this.colorRange().serialize();
  json['geoScale'] = this.scale().serialize();
  json['minBubbleSize'] = this.minBubbleSize();
  json['maxBubbleSize'] = this.maxBubbleSize();
  json['geoIdField'] = this.geoIdField();

  var series = [];
  var scalesIds = {};
  var scales = [];
  for (var i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    var config = series_.serialize();

    var scale = series_.colorScale();
    if (scale) {
      var objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['colorScale'] = scales.length - 1;
      } else {
        config['colorScale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
    }
    series.push(config);
  }
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['colorScales'] = scales;

  return {'map': json};
};


//exports
anychart.charts.Map.prototype['getType'] = anychart.charts.Map.prototype.getType;
anychart.charts.Map.prototype['geoData'] = anychart.charts.Map.prototype.geoData;
anychart.charts.Map.prototype['choropleth'] = anychart.charts.Map.prototype.choropleth;
anychart.charts.Map.prototype['bubble'] = anychart.charts.Map.prototype.bubble;
anychart.charts.Map.prototype['unboundRegions'] = anychart.charts.Map.prototype.unboundRegions;
anychart.charts.Map.prototype['colorRange'] = anychart.charts.Map.prototype.colorRange;
anychart.charts.Map.prototype['palette'] = anychart.charts.Map.prototype.palette;
anychart.charts.Map.prototype['markerPalette'] = anychart.charts.Map.prototype.markerPalette;
anychart.charts.Map.prototype['hatchFillPalette'] = anychart.charts.Map.prototype.hatchFillPalette;
anychart.charts.Map.prototype['getSeries'] = anychart.charts.Map.prototype.getSeries;
anychart.charts.Map.prototype['allowPointsSelect'] = anychart.charts.Map.prototype.allowPointsSelect;
anychart.charts.Map.prototype['minBubbleSize'] = anychart.charts.Map.prototype.minBubbleSize;
anychart.charts.Map.prototype['maxBubbleSize'] = anychart.charts.Map.prototype.maxBubbleSize;
anychart.charts.Map.prototype['geoIdField'] = anychart.charts.Map.prototype.geoIdField;
