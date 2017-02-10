goog.provide('anychart.charts.LinearGauge');

goog.require('anychart'); // otherwise we can't use anychart.gaugeTypesMap object.
goog.require('anychart.core.GaugePointer');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.LinearGauge');
goog.require('anychart.core.linearGauge.ScaleBar');
goog.require('anychart.core.linearGauge.pointers.Bar');
goog.require('anychart.core.linearGauge.pointers.Led');
goog.require('anychart.core.linearGauge.pointers.Marker');
goog.require('anychart.core.linearGauge.pointers.RangeBar');
goog.require('anychart.core.linearGauge.pointers.Tank');
goog.require('anychart.core.linearGauge.pointers.Thermometer');
goog.require('anychart.core.reporting');
goog.require('anychart.data.Set');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Linear gauge class.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.LinearGauge = function(opt_data, opt_csvSettings) {
  anychart.charts.LinearGauge.base(this, 'constructor');

  /**
   * Gauge axes.
   * @type {Array.<anychart.core.axes.LinearGauge>}
   * @private
   */
  this.axes_ = [];

  /**
   * Array of pointers.
   * @type {!Array.<?anychart.core.linearGauge.pointers.Base>}
   * @private
   */
  this.pointers_ = [];

  /**
   * Array of scale bars.
   * @type {Array.<anychart.core.linearGauge.ScaleBar>}
   * @private
   */
  this.scaleBars_ = [];

  /**
   * Number of marker pointers.
   * @type {number}
   * @private
   */
  this.markersCount_ = 0;

  this.data(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.charts.LinearGauge, anychart.core.SeparateChart);


//region --- STATES / SIGNALS ---
/**
 * Linear gauge supported signals.
 * @type {number}
 */
anychart.charts.LinearGauge.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Linear gauge supported consistency states.
 * @type {number}
 */
anychart.charts.LinearGauge.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.GAUGE_POINTERS |
    anychart.ConsistencyState.GAUGE_SCALE |
    anychart.ConsistencyState.GAUGE_AXES |
    anychart.ConsistencyState.GAUGE_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.GAUGE_MARKER_PALETTE |
    anychart.ConsistencyState.GAUGE_PALETTE |
    anychart.ConsistencyState.GAUGE_SCALE_BAR;
//endregion


//region --- PROPERTIES ---
/**
 * Map of pointers constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.charts.LinearGauge.PointersTypesMap = {};
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.BAR] = anychart.core.linearGauge.pointers.Bar;
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.LED] = anychart.core.linearGauge.pointers.Led;
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.MARKER] = anychart.core.linearGauge.pointers.Marker;
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.RANGE_BAR] = anychart.core.linearGauge.pointers.RangeBar;
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.TANK] = anychart.core.linearGauge.pointers.Tank;
anychart.charts.LinearGauge.PointersTypesMap[anychart.enums.LinearGaugePointerType.THERMOMETER] = anychart.core.linearGauge.pointers.Thermometer;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.LinearGauge.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;
//endregion


//region --- DEFAULT SETTINGS ---
/**
 * Getter/setter for axis default settings.
 * @param {Object=} opt_value Object with axis settings.
 * @return {Object|anychart.charts.LinearGauge}
 */
anychart.charts.LinearGauge.prototype.defaultAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultAxisSettings_ || {};
};


/**
 * Getter/setter for linear gauge defaultPointerType.
 * @param {(string|anychart.enums.LinearGaugePointerType)=} opt_value Default pointer type.
 * @return {anychart.charts.LinearGauge|anychart.enums.LinearGaugePointerType} Default pointer type or self for chaining.
 */
anychart.charts.LinearGauge.prototype.defaultPointerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLinearGaugePointerType(opt_value);
    this.defaultPointerType_ = opt_value;
    return this;
  }
  return this.defaultPointerType_;
};


/**
 * Getter/setter for default pointer settings.
 * @param {Object=} opt_value Object with default pointer settings.
 * @return {Object|anychart.charts.LinearGauge} Pointer settings or self for chaining.
 */
anychart.charts.LinearGauge.prototype.defaultPointerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultPointerSettings_ = opt_value;
    return this;
  }
  return this.defaultPointerSettings_ || {};
};


/**
 * Getter/setter for default scale bar settings.
 * @param {Object=} opt_value Object with default pointer settings.
 * @return {Object|anychart.charts.LinearGauge} Pointer settings or self for chaining.
 */
anychart.charts.LinearGauge.prototype.defaultScaleBarSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultScaleBarSettings_ = opt_value;
    return this;
  }
  return this.defaultScaleBarSettings_ || {};
};
//endregion


//region --- OWN/INHERITED API ---
/**
 * Sets chart type. Needed for proper serialization.
 * @param {anychart.enums.GaugeTypes} value
 */
anychart.charts.LinearGauge.prototype.setType = function(value) {
  /**
   * @type {anychart.enums.GaugeTypes}
   * @private
   */
  this.type_ = value;
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.getType = function() {
  return this.type_;
};


/**
 * Getter/setter for global offset.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.charts.LinearGauge} Global offset or self for chaining.
 */
anychart.charts.LinearGauge.prototype.globalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {number|string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (opt_value != this.globalOffset_) {
      this.globalOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.globalOffset_;
};


/**
 * Getter/setter for gauge layout.
 * @param {(string|anychart.enums.Layout)=} opt_value Layout of gauge.
 * @return {anychart.enums.Layout|anychart.charts.LinearGauge} Layout or self for chaining.
 */
anychart.charts.LinearGauge.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value);
    if (opt_value != this.layout_) {
      this.layout_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.layout_;
};


/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.LinearGauge)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.LinearGauge.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.LinearGauge.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.LinearGauge)} .
 */
anychart.charts.LinearGauge.prototype.palette = function(opt_value) {
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
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.LinearGauge.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
      this.invalidate(anychart.ConsistencyState.GAUGE_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.LinearGauge.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.charts.LinearGauge)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.LinearGauge.prototype.hatchFillPalette = function(opt_value) {
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
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.LinearGauge.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Util method to identify whether layout is vertical.
 * @return {boolean} Is layout vertical or not.
 */
anychart.charts.LinearGauge.prototype.isVertical = function() {
  return this.layout_ == anychart.enums.Layout.VERTICAL;
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};
//endregion


//region --- API FOR POINTERS ---
/** @inheritDoc */
anychart.charts.LinearGauge.prototype.getAllSeries = function() {
  return this.pointers_;
};


/**
 * Creates pointer.
 * @param {string} type Pointer type.
 * @param {number} dataIndex Pointer data index.
 * @private
 * @return {anychart.core.linearGauge.pointers.Base} Pointer instance.
 */
anychart.charts.LinearGauge.prototype.createPointerByType_ = function(type, dataIndex) {
  type = anychart.enums.normalizeLinearGaugePointerType(type);
  var config = this.defaultPointerSettings()[type];
  var ctl = anychart.charts.LinearGauge.PointersTypesMap[type];
  /**
   * @type {anychart.core.linearGauge.pointers.Base}
   */
  var instance;

  if (ctl) {
    instance = new ctl(this, dataIndex);
    var lastPointer = this.pointers_[this.pointers_.length - 1];
    var index = lastPointer ? /** @type {number} */ (lastPointer.autoIndex()) + 1 : 0;
    this.pointers_.push(instance);
    var pointerZIndex = anychart.math.round(index * anychart.charts.LinearGauge.ZINDEX_INCREMENT_MULTIPLIER, 5);
    instance.setAutoZIndex(pointerZIndex);
    instance.autoIndex(index);
    instance.setAutoColor(this.palette().itemAt(index));
    if (instance instanceof anychart.core.linearGauge.pointers.Marker) {
      instance.autoType(/** @type {anychart.enums.MarkerType} */ (this.markerPalette().itemAt(this.markersCount_++)));
    }
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    instance.setParentEventTarget(this);
    instance.setup(config);
    instance.listenSignals(this.pointerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    instance = null;
  }

  return instance;
};


/**
 * Adds pointers to gauge.
 * @param {...(number)} var_args Data indexes for pointers.
 * @return {Array.<anychart.core.linearGauge.pointers.Base>} Array of created pointers.
 */
anychart.charts.LinearGauge.prototype.addPointer = function(var_args) {
  var rv = [];

  var type = /** @type {string} */ (this.defaultPointerType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (count) {
    for (var i = 0; i < count; i++) {
      rv.push(this.createPointerByType_(type, arguments[i]));
    }
  }
  this.resumeSignalsDispatching(true);

  return rv;
};


/**
 * Removes pointer by id.
 * @param {number|string} id Id of the pointer.
 * @return {anychart.charts.LinearGauge} Gauge instance.
 */
anychart.charts.LinearGauge.prototype.removePointer = function(id) {
  return this.removePointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * Removes pointer by index.
 * @param {number} index Pointer index.
 * @return {anychart.charts.LinearGauge} Gauge instance.
 */
anychart.charts.LinearGauge.prototype.removePointerAt = function(index) {
  var pointer = this.pointers_[index];
  if (pointer) {
    anychart.globalLock.lock();
    goog.array.splice(this.pointers_, index, 1);
    goog.dispose(pointer);
    this.invalidate(
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all pointers from gauge.
 * @return {anychart.charts.LinearGauge} Gauge instance.
 */
anychart.charts.LinearGauge.prototype.removeAllPointers = function() {
  if (this.pointers_.length) {
    anychart.globalLock.lock();
    var pointers = this.pointers_;
    this.pointers_ = [];
    this.markersCount_ = 0;
    goog.disposeAll(pointers);
    this.invalidate(
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Find pointer index by pointer id.
 * @param {number|string} id Pointer id.
 * @return {number} Pointer index of -1 if can not be found.
 */
anychart.charts.LinearGauge.prototype.getPointerIndexByPointerId = function(id) {
  return goog.array.findIndex(this.pointers_, function(item) {
    return item.id() == id;
  });
};


/**
 * Returns pointer by id.
 * @param {number|string} id Id of the pointer.
 * @return {?anychart.core.linearGauge.pointers.Base} Pointer instance.
 */
anychart.charts.LinearGauge.prototype.getPointer = function(id) {
  return this.getPointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * Returns pointer by index.
 * @param {number} index Pointer index.
 * @return {?anychart.core.linearGauge.pointers.Base} Pointer instance.
 */
anychart.charts.LinearGauge.prototype.getPointerAt = function(index) {
  return this.pointers_[index] || null;
};


/**
 * INTERNAL USE ONLY. DO NOT EXPORT.
 * Method is trying to find pointer by it's auto index. Used in anychart.core.GaugePointer class.
 * @param {number} autoIndex Pointer autoIndex.
 * @return {anychart.core.linearGauge.pointers.Base} Found pointer.
 */
anychart.charts.LinearGauge.prototype.getPointerByAutoIndex = function(autoIndex) {
  return goog.array.find(this.pointers_, function(item) {
    return item.autoIndex() == autoIndex;
  });
};


/**
 * Returns pointers count.
 * @return {number} Number of pointers.
 */
anychart.charts.LinearGauge.prototype.getPointersCount = function() {
  return this.pointers_.length;
};
//endregion


//region --- DATA ---
/**
 * Data for gauge.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.LinearGauge|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.LinearGauge.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_);
      this.iterator_ = null;
      if (opt_value instanceof anychart.data.View)
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive();
      else if (opt_value instanceof anychart.data.Set)
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose_);
      this.data_ = this.parentView_;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.invalidatePointers();
      this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
          anychart.ConsistencyState.GAUGE_SCALE,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEEDS_RECALCULATION);
    }

    return this;
  }
  return this.data_;
};


/**
 * Invalidate pointers.
 */
anychart.charts.LinearGauge.prototype.invalidatePointers = function() {
  for (var i = this.pointers_.length; i--;)
    this.pointers_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_POINTER_LABEL);
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.LinearGauge.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidatePointers();
    var state = anychart.ConsistencyState.GAUGE_SCALE | anychart.ConsistencyState.GAUGE_POINTERS;
    var signal = anychart.Signal.NEEDS_REDRAW;
    this.invalidate(state, signal);
  }
};


/**
 * Returns current iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.charts.LinearGauge.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.charts.LinearGauge.prototype.getResetIterator = function() {
  return (this.iterator_ = this.data_.getIterator());
};
//endregion


//region --- LEGEND ---
/** @inheritDoc */
anychart.charts.LinearGauge.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  var data = [];
  for (i = 0, count = this.pointers_.length; i < count; i++) {
    /** @type {anychart.core.linearGauge.pointers.Base} */
    var pointer = this.pointers_[i];
    var itemData = pointer.getLegendItemData(itemsTextFormatter);
    itemData['sourceUid'] = goog.getUid(this);
    itemData['sourceKey'] = pointer.id();
    data.push(itemData);
  }
  return data;
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  var pointer = this.getPointer(/** @type {number} */ (sourceKey));
  if (pointer) {
    pointer.enabled(!pointer.enabled());
    if (pointer.enabled())
      pointer.hoverSeries();
    else
      pointer.unhover();
  }
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var pointer = this.getPointer(/** @type {number} */ (sourceKey));
  if (pointer) {
    pointer.hoverSeries();
  }
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var pointer = this.getPointer(/** @type {number} */ (sourceKey));
  if (pointer) {
    pointer.unhover();
  }
};
//endregion


//region --- INTERACTIVITY ---
/** @inheritDoc */
anychart.charts.LinearGauge.prototype.getSelectedPoints = function() {
  var selectedPointers = [];
  var allPointers = this.getAllSeries();
  var pointer, selected;

  for (var i = 0; i < allPointers.length; i++) {
    pointer = allPointers[i];
    if (!pointer || !pointer.state || !pointer.enabled()) continue;
    selected = !!pointer.state.getIndexByPointState(anychart.PointState.SELECT).length;
    if (selected)
      selectedPointers.push(this.getWrappedPointer(/** @type {number} */ (pointer.autoIndex())));
  }

  return selectedPointers;
};


/**
 * Wraps pointer with Point class.
 * @param {number} index Point index.
 * @return {anychart.core.GaugePointer} Wrapper pointer.
 */
anychart.charts.LinearGauge.prototype.getWrappedPointer = function(index) {
  return new anychart.core.GaugePointer(this, index);
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var series, pointIndex, pointStatus;
  if (seriesStatus.length) {
    // current point should and will be last selected/hovered point
    var status = seriesStatus[seriesStatus.length - 1];
    series = status.series;
    pointIndex = series.autoIndex();
    pointStatus = goog.array.contains(status.points, 0);
  }

  var currentPoint = {
    'index': pointIndex,
    'series': series
  };

  currentPoint[event] = opt_empty ? !pointStatus : pointStatus;

  return currentPoint;
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var currentPoint = this.makeCurrentPoint(seriesStatus, type, opt_empty);
  var wrappedPointer = this.getWrappedPointer(currentPoint.index);
  var wrappedPointers = [];
  var pointer;
  if (!opt_empty) {
    for (var i = 0, len = seriesStatus.length; i < len; i++) {
      pointer = /** @type {anychart.core.linearGauge.pointers.Base} */ (seriesStatus[i].series);
      wrappedPointers.push(this.getWrappedPointer(/** @type {number} */ (pointer.autoIndex())));
    }
  }
  var res = {
    'type': (type == 'hovered') ? anychart.enums.EventType.POINTS_HOVER : anychart.enums.EventType.POINTS_SELECT,
    'seriesStatus': this.createEventSeriesStatus(seriesStatus, opt_empty),
    'currentPoint': currentPoint,
    'actualTarget': event['target'],
    'target': this,
    'point': wrappedPointer,
    'points': wrappedPointers,
    'originalEvent': event
  };
  if (opt_forbidTooltip)
    res.forbidTooltip = true;
  return res;
};


/**
 * @inheritDoc
 */
anychart.charts.LinearGauge.prototype.useUnionTooltipAsSingle = function() {
  return true;
};
//endregion


//region --- SCALE / AXIS / SCALEBAR ---
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.LinearGauge|anychart.charts.LinearGauge)} Axis instance by index or itself for method chaining.
 */
anychart.charts.LinearGauge.prototype.axis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var axis = this.axes_[index];
  if (!axis) {
    axis = new anychart.core.axes.LinearGauge();
    axis.setParentEventTarget(this);
    axis.setup(this.defaultAxisSettings());
    this.axes_[index] = axis;
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.LinearGauge.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.GAUGE_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for scale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.ScatterBase)=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.LinearGauge)} Default chart scale value or itself for method chaining.
 */
anychart.charts.LinearGauge.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = /** @type {anychart.scales.ScatterBase} */ (anychart.scales.Base.fromString(opt_value, false));
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Linear gauge scale', 'scatter', 'linear, log']);
      return this;
    }
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GAUGE_SCALE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = new anychart.scales.Linear();
    }
    return this.scale_;
  }
};


/**
 * Getter/setter for scale bar.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Index or chart scale bar settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart scale bar settings to set.
 * @return {!(anychart.core.linearGauge.ScaleBar|anychart.charts.LinearGauge)} scale bar instance by index or itself for method chaining.
 */
anychart.charts.LinearGauge.prototype.scaleBar = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var scaleBar = this.scaleBars_[index];
  if (!scaleBar) {
    scaleBar = new anychart.core.linearGauge.ScaleBar(this);
    scaleBar.setParentEventTarget(this);
    scaleBar.setup(this.defaultScaleBarSettings());
    this.scaleBars_[index] = scaleBar;
    scaleBar.listenSignals(this.onScaleBarSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_SCALE_BAR | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    scaleBar.setup(value);
    return this;
  } else {
    return scaleBar;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.LinearGauge.prototype.onScaleBarSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.GAUGE_SCALE_BAR;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};
//endregion


//region --- CALCULATIONS ---
/**
 * Performs calculations of scale.
 */
anychart.charts.LinearGauge.prototype.calculate = function() {
  var pointer;
  var pointersLength = this.pointers_.length;
  var i;
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_SCALE)) {
    var needsAutoCalc = false;
    goog.array.forEach(this.pointers_, function(pointer) {
      var scale = pointer.scale();
      scale.startAutoCalc();
      needsAutoCalc = needsAutoCalc || scale.needsAutoCalc();
    });

    if (needsAutoCalc) {
      for (i = 0; i < pointersLength; i++) {
        pointer = this.pointers_[i];
        if (pointer && pointer.enabled()) {
          var scale = /** @type {anychart.scales.Base} */ (pointer.scale());
          scale.extendDataRange.apply(scale, pointer.getReferenceValues());
        }
      }
    }

    goog.array.forEach(this.pointers_, function(pointer) {
      pointer.scale().finishAutoCalc();
    });
    this.invalidate(anychart.ConsistencyState.GAUGE_AXES | anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.GAUGE_SCALE);
  }
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.charts.LinearGauge.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  var i;
  var markersCount = 0;
  var isVertical = this.isVertical();

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_PALETTE |
      anychart.ConsistencyState.GAUGE_MARKER_PALETTE |
      anychart.ConsistencyState.GAUGE_HATCH_FILL_PALETTE)) {
    anychart.core.Base.suspendSignalsDispatching(this.pointers_);

    for (i = 0; i < this.pointers_.length; i++) {
      var pointer = this.pointers_[i];
      var index = /** @type {number} */(pointer.autoIndex());
      pointer.setAutoColor(this.palette().itemAt(index));
      pointer.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
      if (pointer instanceof anychart.core.linearGauge.pointers.Marker) {
        pointer.autoType(/** @type {anychart.enums.MarkerType} */ (this.markerPalette().itemAt(markersCount++)));
      }
    }
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS);
    this.invalidatePointers();

    this.markConsistent(anychart.ConsistencyState.GAUGE_PALETTE |
        anychart.ConsistencyState.GAUGE_MARKER_PALETTE |
        anychart.ConsistencyState.GAUGE_HATCH_FILL_PALETTE);
    anychart.core.Base.resumeSignalsDispatchingFalse(this.pointers_);
    this.markersCount_ = markersCount;
  }

  var item;

  var defaultOrientation = isVertical ? anychart.enums.Orientation.LEFT : anychart.enums.Orientation.TOP;
  for (i = 0; i < this.axes_.length; i++) {
    item = this.axes_[i];
    if (item) {
      item.setDefaultOrientation(defaultOrientation);
      if (!item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.scale()));
    }
  }

  for (i = 0; i < this.pointers_.length; i++) {
    item = this.pointers_[i];
    item.layout(/** @type {anychart.enums.Layout} */ (this.layout()));
    if (!item.scale())
      item.scale(/** @type {anychart.scales.ScatterBase} */ (this.scale()));
    if (item instanceof anychart.core.linearGauge.pointers.Marker) {
      if (String(item.autoType()).toLowerCase().indexOf('triangle') != -1) {
        item.autoType(isVertical ? anychart.enums.MarkerType.TRIANGLE_LEFT : anychart.enums.MarkerType.TRIANGLE_UP);
      }
    }
  }

  for (i = 0; i < this.scaleBars_.length; i++) {
    item = this.scaleBars_[i];
    if (item) {
      item.layout(/** @type {anychart.enums.Layout} */ (this.layout()));
      if (!item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */ (this.scale()));
    }
  }
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  var i, count, pointer;
  var pointersLength = this.pointers_.length;

  this.calculate();

  anychart.core.Base.suspendSignalsDispatching(this.axes_, this.pointers_, this.scaleBars_);
  anychart.performance.start('Linear gauge bounds calc');
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.GAUGE_AXES)) {
    var item;
    for (i = 0, count = this.axes_.length; i < count; i++) {
      item = this.axes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
      }
    }
  }

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer().zIndex(1);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var isVertical = this.isVertical();

    var width, height, offset, pb;
    var topGap, rightGap, bottomGap, leftGap;
    topGap = rightGap = bottomGap = leftGap = 0;
    var parentWidth, parentHeight;

    if (isVertical) {
      parentWidth = bounds.width;
      parentHeight = bounds.height;
    } else {
      parentWidth = bounds.height;
      parentHeight = bounds.width;
    }

    for (i = 0; i < pointersLength; i++) {
      pointer = this.pointers_[i];
      var reservedBounds = pointer.getReservedBounds(parentWidth, parentHeight);
      leftGap = Math.max(leftGap, reservedBounds[0]);
      topGap = Math.max(topGap, reservedBounds[1]);
      rightGap = Math.max(rightGap, reservedBounds[2]);
      bottomGap = Math.max(bottomGap, reservedBounds[3]);
    }

    bounds = bounds.clone();
    bounds.top += topGap;
    bounds.height -= topGap + bottomGap;
    bounds.left += leftGap;
    bounds.width -= leftGap + rightGap;
    bounds = bounds.round();

    var w, h;
    w = isVertical ? 0 : bounds.width;
    h = isVertical ? bounds.height : 0;
    var fullBounds = anychart.math.rect(isVertical ? 0 : bounds.left, isVertical ? bounds.top : 0, w, h);

    parentWidth = isVertical ? bounds.width : bounds.height;
    parentHeight = isVertical ? bounds.height : bounds.width;
    height = anychart.utils.normalizeSize('100%', parentHeight);

    var items = goog.array.concat(this.axes_, this.pointers_, this.scaleBars_);
    for (i = 0; i < items.length; i++) {
      item = items[i];
      if (item && item.enabled()) {
        width = anychart.utils.normalizeSize(/** @type {number|string} */ (anychart.utils.normalizeToPercent(item.width())), parentWidth);
        offset = anychart.utils.normalizeSize(/** @type {number|string} */ (anychart.utils.normalizeToPercent(item.offset())), parentWidth);
        if (isVertical)
          pb = anychart.math.rect(offset, bounds.top, width, height);
        else
          pb = anychart.math.rect(bounds.left, offset, height, width);
        fullBounds.boundingRect(pb);
        item.parentBounds(pb);
      }
    }

    var b1, globalOffset;

    if (isVertical) {
      b1 = bounds.left + (bounds.width - fullBounds.width) / 2 - fullBounds.left;
      globalOffset = anychart.utils.normalizeSize(/** @type {number|string} */ (this.globalOffset()), bounds.width);
    } else {
      b1 = bounds.top + (bounds.height - fullBounds.height) / 2 - fullBounds.top;
      globalOffset = anychart.utils.normalizeSize(/** @type {number|string} */ (this.globalOffset()), bounds.height);
    }
    var finalOffset = b1 + globalOffset;
    var offsetLeft = isVertical ? finalOffset : 0;
    var offsetTop = isVertical ? 0 : finalOffset;
    this.rootLayer.setTransformationMatrix(1, 0, 0, 1, offsetLeft, offsetTop);
    this.invalidate(anychart.ConsistencyState.GAUGE_AXES | anychart.ConsistencyState.GAUGE_POINTERS | anychart.ConsistencyState.GAUGE_SCALE_BAR);
  }
  anychart.performance.end('Linear gauge bounds calc');

  var axis;
  anychart.performance.start('Linear gauge axis drawing');
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_AXES)) {
    for (i = 0, count = this.axes_.length; i < count; i++) {
      axis = this.axes_[i];
      if (axis) {
        axis.container(this.rootLayer);
        axis.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_AXES);
  }
  anychart.performance.end('Linear gauge axis drawing');

  anychart.performance.start('Linear gauge pointers drawing');
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_POINTERS)) {
    for (i = 0; i < pointersLength; i++) {
      pointer = this.pointers_[i];
      if (pointer) {
        pointer.container(this.rootLayer);
        pointer.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_POINTERS);
  }
  anychart.performance.end('Linear gauge pointers drawing');

  var scaleBar;
  anychart.performance.start('Linear gauge scale bars drawing');
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_SCALE_BAR)) {
    for (i = 0; i < this.scaleBars_.length; i++) {
      scaleBar = this.scaleBars_[i];
      if (scaleBar) {
        scaleBar.container(this.rootLayer);
        scaleBar.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_SCALE_BAR);
  }
  anychart.performance.end('Linear gauge scale bars drawing');

  anychart.core.Base.resumeSignalsDispatchingFalse(this.axes_, this.pointers_, this.scaleBars_);
};
//endregion


//region --- JSON/DISPOSING ---
/** @inheritDoc */
anychart.charts.LinearGauge.prototype.serialize = function() {
  var json = anychart.charts.LinearGauge.base(this, 'serialize');
  json['type'] = this.getType();

  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  json['globalOffset'] = this.globalOffset();
  json['layout'] = this.layout();
  json['data'] = this.data().serialize();

  var scalesIds = {};
  var scales = [];
  var scale;
  var uid;

  scale = this.scale();
  uid = goog.getUid(scale);
  scalesIds[uid] = scale.serialize();
  scales.push(scalesIds[uid]);
  json['scale'] = scales.length - 1;

  var i, config;
  var axes = [];
  for (i = 0; i < this.axes_.length; i++) {
    var axis = this.axes_[i];
    config = axis.serialize();
    scale = axis.scale();
    if (scale) {
      uid = goog.getUid(scale);
      if (!scalesIds[uid]) {
        scalesIds[uid] = scale.serialize();
        scales.push(scalesIds[uid]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[uid]);
      }
    }
    axes.push(config);
  }
  if (axes.length)
    json['axes'] = axes;

  var pointers = [];
  for (i = 0; i < this.pointers_.length; i++) {
    var pointer = this.pointers_[i];
    config = pointer.serialize();
    scale = pointer.scale();
    if (scale) {
      uid = goog.getUid(scale);
      if (!scalesIds[uid]) {
        scalesIds[uid] = scale.serialize();
        scales.push(scalesIds[uid]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[uid]);
      }
    }
    pointers.push(config);
  }
  if (pointers.length)
    json['pointers'] = pointers;

  var scaleBars = [];
  for (i = 0; i < this.scaleBars_.length; i++) {
    var scaleBar = this.scaleBars_[i];
    config = scaleBar.serialize();
    scale = scaleBar.scale();
    if (scale) {
      uid = goog.getUid(scale);
      if (!scalesIds[uid]) {
        scalesIds[uid] = scale.serialize();
        scales.push(scalesIds[uid]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[uid]);
      }
    }
    scaleBars.push(config);
  }
  if (scaleBars.length)
    json['scaleBars'] = scaleBars;

  if (scales.length)
    json['scales'] = scales;

  return {'gauge': json};
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.LinearGauge.base(this, 'setupByJSON', config, opt_default);

  if ('defaultAxisSettings' in config)
    this.defaultAxisSettings(config['defaultAxisSettings']);
  if ('defaultPointerSettings' in config)
    this.defaultPointerSettings(config['defaultPointerSettings']);
  if ('defaultScaleBarSettings' in config)
    this.defaultScaleBarSettings(config['defaultScaleBarSettings']);

  this.globalOffset(config['globalOffset']);
  this.layout(config['layout']);
  this.data(config['data']);

  if ('palette' in config)
    this.palette(config['palette']);
  if ('markerPalette' in config)
    this.markerPalette(config['markerPalette']);
  if ('hatchFillPalette' in config)
    this.hatchFillPalette(config['hatchFillPalette']);

  var i, json, scale;
  var axes = config['axes'];
  var pointers = config['pointers'];
  var scaleBars = config['scaleBars'];
  var scales = config['scales'];
  var type = this.getType();

  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }
  json = config['scale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.scale(/** @type {anychart.scales.ScatterBase} */ (scale));

  if (goog.isArray(axes)) {
    for (i = 0; i < axes.length; i++) {
      json = axes[i];
      this.axis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 0) this.axis(i).scale(scalesInstances[json['scale']]);
    }
  }
  if (goog.isArray(pointers)) {
    for (i = 0; i < pointers.length; i++) {
      json = pointers[i];
      var pointerType = json['pointerType'] || this.defaultPointerType();
      var dataIndex = json['dataIndex'];
      var pointerInst = this.createPointerByType_(pointerType, dataIndex);
      if (pointerInst) {
        pointerInst.setup(json);
        if (goog.isObject(json)) {
          if ('scale' in json && json['scale'] > 0) pointerInst.scale(scalesInstances[json['scale']]);
        }
      }
    }
  }
  if (goog.isArray(scaleBars)) {
    for (i = 0; i < scaleBars.length; i++) {
      json = scaleBars[i];
      this.scaleBar(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 0) this.scaleBar(i).scale(scalesInstances[json['scale']]);
    }
  }
};


/** @inheritDoc */
anychart.charts.LinearGauge.prototype.disposeInternal = function() {
  goog.disposeAll(this.pointers_);
  this.pointers_ = [];
  goog.disposeAll(this.axes_);
  this.axes_ = null;
  goog.disposeAll(this.scaleBars_);
  this.scaleBars_ = null;
  goog.disposeAll(this.palette_, this.markerPalette_, this.hatchFillPalette_);
  this.palette_ = null;
  this.markerPalette_ = null;
  this.hatchFillPalette_ = null;
  anychart.charts.LinearGauge.base(this, 'disposeInternal');
};
//endregion


//region --- POINTERS CONSTRUCTORS ---
/**
 * Pointer invalidation handler.
 * @param {anychart.SignalEvent} e Signal event.
 * @private
 */
anychart.charts.LinearGauge.prototype.pointerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.GAUGE_POINTERS;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  if (e.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
  }
  this.invalidate(state, signal);
};


/**
 * Creates bar pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Bar pointer.
 */
anychart.charts.LinearGauge.prototype.bar = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.BAR, dataIndex);
};


/**
 * Creates led pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Led pointer.
 */
anychart.charts.LinearGauge.prototype.led = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.LED, dataIndex);
};


/**
 * Creates marker pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Marker pointer.
 */
anychart.charts.LinearGauge.prototype.marker = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.MARKER, dataIndex);
};


/**
 * Creates range bar pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Range Bar pointer.
 */
anychart.charts.LinearGauge.prototype.rangeBar = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.RANGE_BAR, dataIndex);
};


/**
 * Creates tank pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Tank pointer.
 */
anychart.charts.LinearGauge.prototype.tank = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.TANK, dataIndex);
};


/**
 * Creates thermometer pointer.
 * @param {number} dataIndex Pointer data index.
 * @return {anychart.core.linearGauge.pointers.Base} Thermometer pointer.
 */
anychart.charts.LinearGauge.prototype.thermometer = function(dataIndex) {
  return this.createPointerByType_(anychart.enums.LinearGaugePointerType.THERMOMETER, dataIndex);
};
//endregion

//exports
(function() {
  var proto = anychart.charts.LinearGauge.prototype;
  proto['getType'] = proto.getType;
  proto['defaultPointerType'] = proto.defaultPointerType;

  proto['globalOffset'] = proto.globalOffset;
  proto['layout'] = proto.layout;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['isVertical'] = proto.isVertical;

  proto['addPointer'] = proto.addPointer;
  proto['removePointer'] = proto.removePointer;
  proto['removePointerAt'] = proto.removePointerAt;
  proto['removeAllPointers'] = proto.removeAllPointers;
  proto['getPointer'] = proto.getPointer;
  proto['getPointerAt'] = proto.getPointerAt;
  proto['getPointersCount'] = proto.getPointersCount;
  proto['getSelectedPoints'] = proto.getSelectedPoints;

  proto['data'] = proto.data;
  proto['axis'] = proto.axis;
  proto['scaleBar'] = proto.scaleBar;
  proto['scale'] = proto.scale;

  proto['bar'] = proto.bar;
  proto['led'] = proto.led;
  proto['marker'] = proto.marker;
  proto['rangeBar'] = proto.rangeBar;
  proto['tank'] = proto.tank;
  proto['thermometer'] = proto.thermometer;
})();
