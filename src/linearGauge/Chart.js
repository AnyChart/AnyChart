goog.provide('anychart.linearGaugeModule.Chart');

goog.require('anychart'); // otherwise we can't use anychart.gaugeTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.reporting');
goog.require('anychart.data.Set');
goog.require('anychart.linearGaugeModule.Axis');
goog.require('anychart.linearGaugeModule.Point');
goog.require('anychart.linearGaugeModule.ScaleBar');
goog.require('anychart.linearGaugeModule.pointers.Bar');
goog.require('anychart.linearGaugeModule.pointers.Led');
goog.require('anychart.linearGaugeModule.pointers.Marker');
goog.require('anychart.linearGaugeModule.pointers.RangeBar');
goog.require('anychart.linearGaugeModule.pointers.Tank');
goog.require('anychart.linearGaugeModule.pointers.Thermometer');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Linear gauge class.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.linearGaugeModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.linearGaugeModule.Chart.base(this, 'constructor');

  this.addThemes('linearGauge');

  /**
   * Gauge axes.
   * @type {Array.<anychart.linearGaugeModule.Axis>}
   * @private
   */
  this.axes_ = [];

  /**
   * Array of pointers.
   * @type {!Array.<?anychart.linearGaugeModule.pointers.Base>}
   * @private
   */
  this.pointers_ = [];

  /**
   * Array of scale bars.
   * @type {Array.<anychart.linearGaugeModule.ScaleBar>}
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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['globalOffset', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['layout', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['defaultPointerType', 0, 0]
  ]);

  // Initializing tooltip, before flat themes it was done in setupByJSON
  this.getCreated('tooltip');
};
goog.inherits(anychart.linearGaugeModule.Chart, anychart.core.SeparateChart);


//region --- STATES / SIGNALS ---
/**
 * Linear gauge supported signals.
 * @type {number}
 */
anychart.linearGaugeModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Linear gauge supported consistency states.
 * @type {number}
 */
anychart.linearGaugeModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
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
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.linearGaugeModule.Chart.prototype.rawData_;


/**
 *
 * @type {?anychart.data.Iterator}
 * @private
 */
anychart.linearGaugeModule.Chart.prototype.iterator_;


/**
 * Map of pointers constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.linearGaugeModule.Chart.PointersTypesMap = {};
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.BAR] = anychart.linearGaugeModule.pointers.Bar;
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.LED] = anychart.linearGaugeModule.pointers.Led;
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.MARKER] = anychart.linearGaugeModule.pointers.Marker;
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.RANGE_BAR] = anychart.linearGaugeModule.pointers.RangeBar;
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.TANK] = anychart.linearGaugeModule.pointers.Tank;
anychart.linearGaugeModule.Chart.PointersTypesMap[anychart.enums.LinearGaugePointerType.THERMOMETER] = anychart.linearGaugeModule.pointers.Thermometer;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.linearGaugeModule.Chart.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'globalOffset', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'layout', anychart.enums.normalizeLayout],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'defaultPointerType', anychart.enums.normalizeLinearGaugePointerType]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.Chart, anychart.linearGaugeModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- OWN/INHERITED API ---
/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.linearGaugeModule.Chart)} Return current chart markers palette or itself for chaining call.
 */
anychart.linearGaugeModule.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.setupCreated('markerPalette', this.markerPalette_);
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
anychart.linearGaugeModule.Chart.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.linearGaugeModule.Chart)} .
 */
anychart.linearGaugeModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
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
anychart.linearGaugeModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    this.setupCreated('palette', this.palette_);
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
anychart.linearGaugeModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.linearGaugeModule.Chart)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.linearGaugeModule.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.setupCreated('hatchFillPalette', this.hatchFillPalette_);
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
anychart.linearGaugeModule.Chart.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GAUGE_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for isVertical property.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.linearGaugeModule.Chart} Is layout vertical or not. Or self for chaining.
 */
anychart.linearGaugeModule.Chart.prototype.isVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.setOption('layout', opt_value ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    return this;
  }
  return this.getOption('layout') == anychart.enums.Layout.VERTICAL;
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.resizeHandler = function(e) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- API FOR POINTERS ---
/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.getAllSeries = function() {
  return this.pointers_;
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/**
 * Creates pointer.
 * @param {string} type Pointer type.
 * @param {number|anychart.data.View|anychart.data.Set|Array|string} dataIndexOrData Pointer data index or pointer data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @private
 * @return {anychart.linearGaugeModule.pointers.Base} Pointer instance.
 */
anychart.linearGaugeModule.Chart.prototype.createPointerByType_ = function(type, dataIndexOrData, opt_csvSettings) {
  type = anychart.enums.normalizeLinearGaugePointerType(type);
  var ctl = anychart.linearGaugeModule.Chart.PointersTypesMap[type];
  /**
   * @type {anychart.linearGaugeModule.pointers.Base}
   */
  var instance;

  if (ctl) {
    instance = new ctl();
    if (goog.isNumber(dataIndexOrData)) {
      instance.dataIndex(/** @type {number} */(dataIndexOrData));
    } else {
      instance.data(/** @type {anychart.data.View|anychart.data.Set|Array|string} */(dataIndexOrData), opt_csvSettings);
    }
    var lastPointer = this.pointers_[this.pointers_.length - 1];
    var index = lastPointer ? /** @type {number} */ (lastPointer.autoIndex()) + 1 : 0;
    this.pointers_.push(instance);
    var pointerZIndex = anychart.math.round(index * anychart.linearGaugeModule.Chart.ZINDEX_INCREMENT_MULTIPLIER, 5);
    instance.setAutoZIndex(pointerZIndex);
    instance.autoIndex(index);
    instance.setAutoColor(this.palette().itemAt(index));
    if (anychart.utils.instanceOf(instance, anychart.linearGaugeModule.pointers.Marker)) {
      instance.autoType(/** @type {anychart.enums.MarkerType} */ (this.markerPalette().itemAt(this.markersCount_++)));
    }
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    instance.gauge(this);
    instance.setParentEventTarget(this);
    var defaultPointerSettings = /** @type {Object} */(this.getThemeOption('defaultPointerSettings'));
    instance.addThemes(defaultPointerSettings['base']);
    instance.addThemes(defaultPointerSettings[anychart.utils.toCamelCase(type)]);

    // fix for led pointer, that has colorScale and gsc states
    if (goog.isFunction(instance.colorScale)) {
      instance.colorScale(instance.getThemeOption('colorScale'));
      // init states for gap/size/count handling
      instance.initGscFromOptions();
    }

    instance.setupStateSettings();
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
 * @param {...(number|anychart.data.View|anychart.data.Set|Array)} var_args Data indexes or data for pointers.
 * @return {Array.<anychart.linearGaugeModule.pointers.Base>} Array of created pointers.
 */
anychart.linearGaugeModule.Chart.prototype.addPointer = function(var_args) {
  var rv = [];

  var type = /** @type {string} */ (this.getOption('defaultPointerType'));
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
 * @return {anychart.linearGaugeModule.Chart} Gauge instance.
 */
anychart.linearGaugeModule.Chart.prototype.removePointer = function(id) {
  return this.removePointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * Removes pointer by index.
 * @param {number} index Pointer index.
 * @return {anychart.linearGaugeModule.Chart} Gauge instance.
 */
anychart.linearGaugeModule.Chart.prototype.removePointerAt = function(index) {
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
 * @return {anychart.linearGaugeModule.Chart} Gauge instance.
 */
anychart.linearGaugeModule.Chart.prototype.removeAllPointers = function() {
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
anychart.linearGaugeModule.Chart.prototype.getPointerIndexByPointerId = function(id) {
  return goog.array.findIndex(this.pointers_, function(item) {
    return item.id() == id;
  });
};


/**
 * Returns pointer by id.
 * @param {number|string} id Id of the pointer.
 * @return {?anychart.linearGaugeModule.pointers.Base} Pointer instance.
 */
anychart.linearGaugeModule.Chart.prototype.getPointer = function(id) {
  return this.getPointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * Returns pointer by index.
 * @param {number} index Pointer index.
 * @return {?anychart.linearGaugeModule.pointers.Base} Pointer instance.
 */
anychart.linearGaugeModule.Chart.prototype.getPointerAt = function(index) {
  return this.pointers_[index] || null;
};


/**
 * INTERNAL USE ONLY. DO NOT EXPORT.
 * Method is trying to find pointer by it's auto index. Used in anychart.linearGaugeModule.Point class.
 * @param {number} autoIndex Pointer autoIndex.
 * @return {anychart.linearGaugeModule.pointers.Base} Found pointer.
 */
anychart.linearGaugeModule.Chart.prototype.getPointerByAutoIndex = function(autoIndex) {
  return goog.array.find(this.pointers_, function(item) {
    return item.autoIndex() == autoIndex;
  });
};


/**
 * Returns pointers count.
 * @return {number} Number of pointers.
 */
anychart.linearGaugeModule.Chart.prototype.getPointersCount = function() {
  return this.pointers_.length;
};


//endregion
//region --- DATA ---
/**
 * Data for gauge.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.linearGaugeModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.linearGaugeModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_);
      this.iterator_ = null;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_ = this.parentView_;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.invalidatePointers();
      this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
          anychart.ConsistencyState.GAUGE_SCALE |
          anychart.ConsistencyState.CHART_LABELS,
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
anychart.linearGaugeModule.Chart.prototype.invalidatePointers = function() {
  for (var i = this.pointers_.length; i--;)
    this.pointers_[i].invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GAUGE_POINTER_LABELS |
        anychart.ConsistencyState.GAUGE_COLOR_SCALE); // this is for led pointer
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.linearGaugeModule.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidatePointers();
    var state = anychart.ConsistencyState.GAUGE_SCALE | anychart.ConsistencyState.GAUGE_POINTERS | anychart.ConsistencyState.CHART_LABELS;
    var signal = anychart.Signal.NEEDS_REDRAW;
    this.invalidate(state, signal);
  }
};


/**
 * Returns current iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns reset iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.linearGaugeModule.Chart.prototype.getResetIterator = function() {
  return (this.iterator_ = this.data_.getIterator());
};


//endregion
//region --- LEGEND ---
/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  var data = [];
  for (i = 0, count = this.pointers_.length; i < count; i++) {
    /** @type {anychart.linearGaugeModule.pointers.Base} */
    var pointer = this.pointers_[i];
    var itemData = pointer.getLegendItemData(itemsFormat);
    itemData['sourceUid'] = goog.getUid(this);
    itemData['sourceKey'] = pointer.id();
    data.push(itemData);
  }
  return data;
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.legendItemClick = function(item, event) {
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
anychart.linearGaugeModule.Chart.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var pointer = this.getPointer(/** @type {number} */ (sourceKey));
  if (pointer) {
    pointer.hoverSeries();
  }
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.legendItemOut = function(item, event) {
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
anychart.linearGaugeModule.Chart.prototype.getSelectedPoints = function() {
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
 * @return {anychart.linearGaugeModule.Point} Wrapper pointer.
 */
anychart.linearGaugeModule.Chart.prototype.getWrappedPointer = function(index) {
  return new anychart.linearGaugeModule.Point(this, index);
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
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
anychart.linearGaugeModule.Chart.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var currentPoint = this.makeCurrentPoint(seriesStatus, type, opt_empty);
  var wrappedPointer = this.getWrappedPointer(currentPoint.index);
  var wrappedPointers = [];
  var pointer;
  if (!opt_empty) {
    for (var i = 0, len = seriesStatus.length; i < len; i++) {
      pointer = /** @type {anychart.linearGaugeModule.pointers.Base} */ (seriesStatus[i].series);
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
anychart.linearGaugeModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


//endregion
//region --- SCALE / AXIS / SCALEBAR ---
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.linearGaugeModule.Axis|anychart.linearGaugeModule.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.linearGaugeModule.Chart.prototype.axis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.linearGaugeModule.Axis();
    axis.addThemes(/** @type {Object} */(this.getThemeOption('defaultAxisSettings')));
    axis.setParentEventTarget(this);
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
anychart.linearGaugeModule.Chart.prototype.onAxisSignal_ = function(event) {
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
 * @param {(anychart.scales.ScatterBase|Object|anychart.enums.ScaleTypes)=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.linearGaugeModule.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.linearGaugeModule.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.scale_, opt_value, anychart.enums.ScaleTypes.LINEAR,
        anychart.scales.Base.ScaleTypes.SCATTER_OR_DATE_TIME, ['Linear gauge scale', 'scatter', 'linear, log, date-time']);
    if (val) {
      this.scale_ = val;
      this.scale_.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.GAUGE_SCALE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = anychart.scales.linear();
    }
    return this.scale_;
  }
};


/**
 * Getter/setter for scale bar.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Index or chart scale bar settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart scale bar settings to set.
 * @return {!(anychart.linearGaugeModule.ScaleBar|anychart.linearGaugeModule.Chart)} scale bar instance by index or itself for method chaining.
 */
anychart.linearGaugeModule.Chart.prototype.scaleBar = function(opt_indexOrValue, opt_value) {
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
    scaleBar = new anychart.linearGaugeModule.ScaleBar(this);
    var defaultScaleBarSettings = /** @type {Object} */(this.getThemeOption('defaultScaleBarSettings'));
    scaleBar.addThemes(defaultScaleBarSettings);
    scaleBar.colorScale(defaultScaleBarSettings['colorScale']);
    scaleBar.setParentEventTarget(this);
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
anychart.linearGaugeModule.Chart.prototype.onScaleBarSignal_ = function(event) {
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
anychart.linearGaugeModule.Chart.prototype.calculate = function() {
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


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.calculateStatistics = function() {
  anychart.linearGaugeModule.Chart.base(this, 'calculateStatistics');

  var elementsStat = this.statistics(anychart.enums.Statistics.CHART_ELEMENTS) || {};
  var axesCount = 0;
  for (var i = this.axes_.length; i--;) {
    if (this.axes_[i]) axesCount++;
  }
  elementsStat['axes'] = axesCount;
  this.statistics(anychart.enums.Statistics.CHART_ELEMENTS, elementsStat);
};

//endregion
//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.beforeDraw = function() {
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
      if (anychart.utils.instanceOf(pointer, anychart.linearGaugeModule.pointers.Marker)) {
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

  var layout = /** @type {anychart.enums.Layout} */ (this.getOption('layout'));
  for (i = 0; i < this.pointers_.length; i++) {
    item = this.pointers_[i];
    item.layout(layout);
    if (!item.scale())
      item.scale(/** @type {anychart.scales.ScatterBase} */ (this.scale()));
    if (anychart.utils.instanceOf(item, anychart.linearGaugeModule.pointers.Marker)) {
      if (String(item.autoType()).toLowerCase().indexOf('triangle') != -1) {
        item.autoType(isVertical ? anychart.enums.MarkerType.TRIANGLE_LEFT : anychart.enums.MarkerType.TRIANGLE_UP);
      }
    }
  }

  for (i = 0; i < this.scaleBars_.length; i++) {
    item = this.scaleBars_[i];
    if (item) {
      item.layout(layout);
      if (!item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */ (this.scale()));
    }
  }
};


/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.drawContent = function(bounds) {
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
    this.rootLayer = this.rootElement.layer().zIndex(2);
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
        width = anychart.utils.normalizeSize(/** @type {number|string} */ (anychart.utils.normalizeToPercent(item.getOption('width'))), parentWidth);
        offset = anychart.utils.normalizeSize(/** @type {number|string} */ (anychart.utils.normalizeToPercent(item.getOption('offset'))), parentWidth);
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
      globalOffset = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('globalOffset')), bounds.width);
    } else {
      b1 = bounds.top + (bounds.height - fullBounds.height) / 2 - fullBounds.top;
      globalOffset = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('globalOffset')), bounds.height);
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
//region --- NO DATA LABEL ---
/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  var countDisabled = 0;
  var len = this.pointers_.length;
  for (var i = 0; i < len; i++) {
    var pointer = this.pointers_[i];
    if (pointer && !pointer.enabled())
      countDisabled++;
    else
      break;
  }
  return (!rowsCount || !len || (countDisabled == len));
};


//endregion
//region --- JSON/DISPOSING ---
/** @inheritDoc */
anychart.linearGaugeModule.Chart.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.Chart.base(this, 'serialize');

  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  anychart.core.settings.serialize(this, anychart.linearGaugeModule.Chart.PROPERTY_DESCRIPTORS, json);
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
    if (axis) {
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
anychart.linearGaugeModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.Chart.PROPERTY_DESCRIPTORS, config);
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
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
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
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
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
      var pointerType = json['pointerType'] || this.getOption('defaultPointerType');
      var dataIndex = json['dataIndex'];
      var data = json['data'] || null;
      var pointerInst = this.createPointerByType_(pointerType, dataIndex);
      if (pointerInst) {
        pointerInst.data(data);
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
anychart.linearGaugeModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.parentViewToDispose_,
      this.parentView_,
      this.data_,
      this.pointers_,
      this.axes_,
      this.scaleBars_,
      this.palette_,
      this.markerPalette_,
      this.hatchFillPalette_);

  this.parentViewToDispose_ = null;
  this.parentView_ = null;
  this.data_ = null;
  this.iterator_ = null;

  this.pointers_.length = 0;
  this.axes_.length = 0;
  this.scaleBars_.length = 0;

  this.palette_ = null;
  this.markerPalette_ = null;
  this.hatchFillPalette_ = null;
  anychart.linearGaugeModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- POINTERS CONSTRUCTORS ---
/**
 * Pointer invalidation handler.
 * @param {anychart.SignalEvent} e Signal event.
 * @private
 */
anychart.linearGaugeModule.Chart.prototype.pointerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.GAUGE_POINTERS;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  if (e.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.GAUGE_SCALE;
  }
  this.invalidate(state, signal);
};


// Generate pointer constructors
(function() {
  /**
   * @param {anychart.enums.LinearGaugePointerType} type
   * @return {Function}
   */
  var constructorsGenerator = function(type) {
    return function(dataIndexOrData, opt_csvSettings) {
      return this.createPointerByType_(type, dataIndexOrData, opt_csvSettings);
    };
  };
  var prototype = anychart.linearGaugeModule.Chart.prototype;
  var types = anychart.enums.LinearGaugePointerType;
  for (var i in types) {
    var methodName = anychart.utils.toCamelCase(types[i]);
    /**
     * Pointer constructor.
     * @param {number|anychart.data.View|anychart.data.Set|Array|string} dataIndexOrData Pointer data index or pointer data.
     * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
     * @return {anychart.linearGaugeModule.pointers.Base} Pointer.
     * @this {anychart.linearGaugeModule.Chart}
     */
    prototype[methodName] = constructorsGenerator(types[i]);
  }
})();


//endregion

//exports
(function() {
  var proto = anychart.linearGaugeModule.Chart.prototype;
  proto['getType'] = proto.getType;
  // auto generated
  // proto['defaultPointerType'] = proto.defaultPointerType;
  // proto['globalOffset'] = proto.globalOffset;
  // proto['layout'] = proto.layout;

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

  // generated automatically
  //proto['bar'] = proto.bar;
  //proto['led'] = proto.led;
  //proto['marker'] = proto.marker;
  //proto['rangeBar'] = proto.rangeBar;
  //proto['tank'] = proto.tank;
  //proto['thermometer'] = proto.thermometer;
})();
