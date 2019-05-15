goog.provide('anychart.circularGaugeModule.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.circularGaugeModule.Axis');
goog.require('anychart.circularGaugeModule.AxisMarker');
goog.require('anychart.circularGaugeModule.Cap');
goog.require('anychart.circularGaugeModule.Label');
goog.require('anychart.circularGaugeModule.pointers.Bar');
goog.require('anychart.circularGaugeModule.pointers.Knob');
goog.require('anychart.circularGaugeModule.pointers.Marker');
goog.require('anychart.circularGaugeModule.pointers.Needle');
goog.require('anychart.core.Chart');
goog.require('anychart.core.settings');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');


/**
 * Namespace anychart.gauges
 * @namespace
 * @name anychart.gauges
 */



/**
 * Circular gauge class.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.Chart}
 * @constructor
 */
anychart.circularGaugeModule.Chart = function(opt_data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  anychart.circularGaugeModule.Chart.base(this, 'constructor');

  this.addThemes('circularGauge');

  /**
   * @type {!Array.<anychart.circularGaugeModule.Axis>}
   * @private
   */
  this.axes_ = [];

  /**
   * @type {!Array.<anychart.circularGaugeModule.pointers.Bar>}
   * @private
   */
  this.bars_ = [];

  /**
   * @type {!Array.<anychart.circularGaugeModule.pointers.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   * @type {!Array.<anychart.circularGaugeModule.pointers.Needle>}
   * @private
   */
  this.needles_ = [];

  /**
   * @type {!Array.<anychart.circularGaugeModule.pointers.Knob>}
   * @private
   */
  this.knobs_ = [];

  /**
   * @type {!Array.<anychart.circularGaugeModule.AxisMarker>}
   * @private
   */
  this.ranges_ = [];

  /**
   * Array with pointers.
   * @type {!Array.<?anychart.circularGaugeModule.pointers.Base>}
   * @private
   */
  this.pointers_ = [];

  /**
   * @type {number}
   * @private
   */
  this.pointerCounter_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.circularRangeCounter_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.knobCounter_ = 0;

  this.data(opt_data || null, opt_csvSettings);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['circularPadding',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW],
    ['encloseWithStraightLine',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW],
    ['startAngle',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW],
    ['sweepAngle',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW],
    ['defaultPointerType', 0, 0]
  ]);

  this.resumeSignalsDispatching(true);
  // Initializing tooltip, before flat themes it was done in setupByJSON
  this.getCreated('tooltip');
};
goog.inherits(anychart.circularGaugeModule.Chart, anychart.core.Chart);


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_POINTERS |
    anychart.ConsistencyState.GAUGE_CAP |
    anychart.ConsistencyState.GAUGE_AXES |
    anychart.ConsistencyState.GAUGE_SCALE |
    anychart.ConsistencyState.GAUGE_AXIS_MARKERS;


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.rawData_;


/**
 *
 * @type {?anychart.data.Iterator}
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.iterator_;


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.getType = function() {
  return anychart.enums.GaugeTypes.CIRCULAR;
};


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.circularGaugeModule.Chart.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Default start angle.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE = -90;


/**
 * Z-index frame.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.ZINDEX_FRAME = 1;


/**
 * Z-index knob.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.ZINDEX_KNOB = 20;


/**
 * Z-index circular range.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.ZINDEX_CIRCULAR_RANGE = 30;


/**
 * Z-index pointer.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.ZINDEX_POINTER = 40;


/**
 * Z-index multiplier.
 * @type {number}
 */
anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER = 0.0001;


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.calculateStatistics = function() {
  anychart.circularGaugeModule.Chart.base(this, 'calculateStatistics');

  var elementsStat = this.statistics(anychart.enums.Statistics.CHART_ELEMENTS) || {};
  var axesCount = 0;
  for (var i = this.axes_.length; i--;) {
    if (this.axes_[i]) axesCount++;
  }
  elementsStat['axes'] = axesCount;
  this.statistics(anychart.enums.Statistics.CHART_ELEMENTS, elementsStat);
};


/**
 * @inheritDoc
 */
anychart.circularGaugeModule.Chart.prototype.getAllSeries = function() {
  return this.pointers_;
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/**
 * @inheritDoc
 */
anychart.circularGaugeModule.Chart.prototype.getSeriesStatus = function() {
  return [];
};


/**
 * @inheritDoc
 */
anychart.circularGaugeModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.createChartLabel = function() {
  return new anychart.circularGaugeModule.Label();
};


/**
 * Data for gauge.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.circularGaugeModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.circularGaugeModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      this.iterator_ = null; // reset iterator
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_ = this.parentView_;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.invalidatePointerBounds();
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
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidatePointerBounds();
    this.invalidate(
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.NEEDS_RECALCULATION);
  }
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.circularGaugeModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.circularGaugeModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var res = {
    'type': (type == 'hovered') ? anychart.enums.EventType.POINTS_HOVER : anychart.enums.EventType.POINTS_SELECT,
    'seriesStatus': this.createEventSeriesStatus(seriesStatus, opt_empty),
    'currentPoint': this.makeCurrentPoint(seriesStatus, type, opt_empty),
    'actualTarget': event['target'],
    'target': this,
    'originalEvent': event
  };
  if (opt_forbidTooltip)
    res.forbidTooltip = true;
  return res;
};


/**
 * Gauge cap.
 * @param {(Object|boolean)=} opt_value .
 * @return {anychart.circularGaugeModule.Chart|!anychart.circularGaugeModule.Cap} .
 */
anychart.circularGaugeModule.Chart.prototype.cap = function(opt_value) {
  if (!this.cap_) {
    this.cap_ = new anychart.circularGaugeModule.Cap();
    this.setupCreated('cap', this.cap_);
    this.cap_.gauge(this);
    this.cap_.listenSignals(this.onCapSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_CAP, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.cap_.setup(opt_value);
    return this;
  } else {
    return this.cap_;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.onCapSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.GAUGE_CAP;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Circular range..
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.AxisMarker|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.range = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var circularRange = this.ranges_[index];
  if (!circularRange) {
    circularRange = new anychart.circularGaugeModule.AxisMarker();
    this.ranges_[index] = circularRange;
    circularRange.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_CIRCULAR_RANGE + anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * this.circularRangeCounter_);
    this.circularRangeCounter_++;
    circularRange.gauge(this);
    circularRange.addThemes(/** @type {Object} */(this.getThemeOption('defaultRangeSettings')));
    circularRange.listenSignals(this.onCircularRangeSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  }

  if (goog.isDef(value)) {
    circularRange.setup(value);
    return this;
  } else {
    return circularRange;
  }
};


/**
 * Listener for pointers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.onCircularRangeSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GAUGE_AXIS_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//region --- Pointers
/**
 * Creates pointer.
 * @param {string|anychart.enums.CircularGaugePointerType} type Pointer type.
 * @param {number} arrIndex Typed array index.
 * @param {(number|anychart.data.View|anychart.data.Set|Array|string)=} opt_dataIndexOrData Pointer data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @private
 * @return {anychart.circularGaugeModule.pointers.Base} Pointer instance.
 */
anychart.circularGaugeModule.Chart.prototype.createPointerByType_ = function(type, arrIndex, opt_dataIndexOrData, opt_csvSettings) {
  type = anychart.enums.normalizeCircularGaugePointerType(type);
  var isKnob = (type == anychart.enums.CircularGaugePointerType.KNOB);
  var ctl = anychart.circularGaugeModule.Chart.PointersTypesMap[type];
  /**
   * @type {anychart.circularGaugeModule.pointers.Base}
   */
  var instance;

  var typedArray = this.getTypedArray(type);

  if (ctl) {
    instance = new ctl();
    var lastPointer = this.pointers_[this.pointers_.length - 1];
    var index = lastPointer ? /** @type {number} */(lastPointer.autoIndex()) + 1 : 0;
    this.pointers_.push(instance);
    typedArray[arrIndex] = instance;

    var count = isKnob ? this.knobCounter_++ : this.pointerCounter_++;

    var pointerZIndex = isKnob ? anychart.circularGaugeModule.Chart.ZINDEX_KNOB : anychart.circularGaugeModule.Chart.ZINDEX_POINTER;
    pointerZIndex += anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * count;

    instance.autoIndex(index);
    instance.autoDataIndex(count);
    instance.zIndex(pointerZIndex);

    if (goog.isNumber(opt_dataIndexOrData)) {
      instance.dataIndex(/** @type {number} */(opt_dataIndexOrData));
    } else {
      instance.data(/** @type {anychart.data.View|anychart.data.Set|Array|string} */(opt_dataIndexOrData), opt_csvSettings);
    }
    instance.gauge(this);
    var defaultPointerSettings = /** @type {Object} */(this.getThemeOption('defaultPointerSettings'));
    instance.addThemes(defaultPointerSettings['base']);
    instance.addThemes(defaultPointerSettings[anychart.utils.toCamelCase(type)]);
    instance.listenSignals(this.onPointersSignal_, this);

    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  } else {
    instance = null;
  }

  return instance;
};


/**
 * Adds pointers to gauge.
 * @param {...(number|anychart.data.View|anychart.data.Set|Array)} var_args Data indexes or data for pointers.
 * @return {Array.<anychart.circularGaugeModule.pointers.Base>} Array of created pointers.
 */
anychart.circularGaugeModule.Chart.prototype.addPointer = function(var_args) {
  var rv = [];

  var type = /** @type {anychart.enums.CircularGaugePointerType} */ (this.getOption('defaultPointerType'));
  var count = arguments.length;
  var typedArray = this.getTypedArray(type);
  var arrIndex = typedArray.length;
  this.suspendSignalsDispatching();
  if (count) {
    for (var i = 0; i < count; i++) {
      rv.push(this.createPointerByType_(type, arrIndex + i, arguments[i]));
    }
  }
  this.resumeSignalsDispatching(true);

  return rv;
};


/**
 * Removes pointer by id.
 * @param {number|string} id Id of the pointer.
 * @return {anychart.circularGaugeModule.Chart} Gauge instance.
 */
anychart.circularGaugeModule.Chart.prototype.removePointer = function(id) {
  return this.removePointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * @param {anychart.enums.CircularGaugePointerType} type Pointer type.
 * @return {?Array.<anychart.circularGaugeModule.pointers.Base>}
 */
anychart.circularGaugeModule.Chart.prototype.getTypedArray = function(type) {
  switch (type) {
    case anychart.enums.CircularGaugePointerType.BAR:
      return this.bars_;
    case anychart.enums.CircularGaugePointerType.MARKER:
      return this.markers_;
    case anychart.enums.CircularGaugePointerType.NEEDLE:
      return this.needles_;
    case anychart.enums.CircularGaugePointerType.KNOB:
      return this.knobs_;
  }
  return null;
};


/**
 * Remove pointer from typed pointer array.
 * @param {anychart.circularGaugeModule.pointers.Base} pointer
 */
anychart.circularGaugeModule.Chart.prototype.removeFromTypedArray = function(pointer) {
  var type = pointer.getType();
  var arr = this.getTypedArray(type);
  var index = goog.array.indexOf(arr, pointer);
  if (index != -1) {
    goog.array.splice(arr, index, 1);
  }
};


/**
 * Removes pointer by index.
 * @param {number} index Pointer index.
 * @return {anychart.circularGaugeModule.Chart} Gauge instance.
 */
anychart.circularGaugeModule.Chart.prototype.removePointerAt = function(index) {
  var pointer = this.pointers_[index];
  if (pointer) {
    anychart.globalLock.lock();
    goog.array.splice(this.pointers_, index, 1);
    this.removeFromTypedArray(pointer);
    goog.dispose(pointer);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all pointers from gauge.
 * @return {anychart.circularGaugeModule.Chart} Gauge instance.
 */
anychart.circularGaugeModule.Chart.prototype.removeAllPointers = function() {
  if (this.pointers_.length) {
    anychart.globalLock.lock();
    var pointers = this.pointers_;
    this.pointers_ = [];
    this.bars_ = [];
    this.knobs_ = [];
    this.markers_ = [];
    this.needles_ = [];
    this.pointerCounter_ = 0;
    this.knobCounter_ = 0;
    goog.disposeAll(pointers);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Find pointer index by pointer id.
 * @param {number|string} id Pointer id.
 * @return {number} Pointer index of -1 if can not be found.
 */
anychart.circularGaugeModule.Chart.prototype.getPointerIndexByPointerId = function(id) {
  return goog.array.findIndex(this.pointers_, function(item) {
    return item.id() == id;
  });
};


/**
 * Returns pointer by id.
 * @param {number|string} id Id of the pointer.
 * @return {?anychart.circularGaugeModule.pointers.Base} Pointer instance.
 */
anychart.circularGaugeModule.Chart.prototype.getPointer = function(id) {
  return this.getPointerAt(this.getPointerIndexByPointerId(id));
};


/**
 * Returns pointer by index.
 * @param {number} index Pointer index.
 * @return {?anychart.circularGaugeModule.pointers.Base} Pointer instance.
 */
anychart.circularGaugeModule.Chart.prototype.getPointerAt = function(index) {
  return this.pointers_[index] || null;
};


/**
 * INTERNAL USE ONLY. DO NOT EXPORT.
 * Method is trying to find pointer by it's auto index.
 * @param {number} autoIndex Pointer autoIndex.
 * @return {anychart.circularGaugeModule.pointers.Base} Found pointer.
 */
anychart.circularGaugeModule.Chart.prototype.getPointerByAutoIndex = function(autoIndex) {
  return goog.array.find(this.pointers_, function(item) {
    return item.autoIndex() == autoIndex;
  });
};


/**
 * Returns pointers count.
 * @return {number} Number of pointers.
 */
anychart.circularGaugeModule.Chart.prototype.getPointersCount = function() {
  return this.pointers_.length;
};


/**
 * @param {*} value
 * @return {boolean}
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.isData_ = function(value) {
  return (anychart.utils.instanceOf(value, anychart.data.Set) ||
          anychart.utils.instanceOf(value, anychart.data.View) ||
          anychart.utils.instanceOf(value, anychart.data.Mapping) ||
          goog.isArray(value));
};


/**
 * @param {*} value
 * @return {boolean}
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.isConfig_ = function(value) {
  return !this.isData_(value) && !goog.isFunction(value) && goog.isObject(value);
};

// Generate pointer constructors
(function() {
  /**
   * @param {anychart.enums.CircularGaugePointerType} type
   * @return {Function}
   */
  var constructorsGenerator = function(type) {
    /*
    ---  WAS:  ---

      0 argument
      bar() - getter index=0

      1 argument
      bar(index) getter index
      bar(config) setter config index=0

      2 argument
      bar(index, config) setter config index

    --- BECOME ---

      0 argument
      bar() - getter index=0

      1 argument
      bar(index) - getter index
      bar(config) - setter config index=0
      bar(data) - setter data index=0

      2 arguments
      bar(config, data) - setter config data index=0
      bar(data, csvSettings) - setter data settings index=0
      bar(index, config) - setter config index
      bar(index, data) - setter data index

      3 arguments
      bar(config, data, csvSettings) setter config data settings index=0
      bar(index, config, data) - setter config data index
      bar(index, data, csvSettings) setter data settings index

      4 arguments
      bar(index, config, data, csvSettings) - setter config data settings index

    */

    return function(opt_indexOrValueOrData, opt_valueOrDataOrSettings, opt_dataOrSettings, opt_csvSettings) {
      var index, config, data, settings;
      var argLen = arguments.length;

      if (goog.isArray(opt_indexOrValueOrData))
        index = NaN;
      else
        index = anychart.utils.toNumber(opt_indexOrValueOrData);
      if (argLen > 3) {
        // 4 arguments

        // bar(index, config, data, csvSettings) - setter config data settings index
        if (isNaN(index)) index = 0;
        config = opt_valueOrDataOrSettings;
        data = opt_dataOrSettings;
        settings = opt_csvSettings;

      } else if (argLen > 2) {
        // 3 arguments

        if (this.isConfig_(opt_indexOrValueOrData)) {
          // bar(config, data, csvSettings) setter config data settings index=0
          index = 0;
          config = opt_indexOrValueOrData;
          data = opt_valueOrDataOrSettings;
          settings = opt_dataOrSettings;
        } else {
          if (isNaN(index)) index = 0;
          if (this.isConfig_(opt_valueOrDataOrSettings)) {
            // bar(index, config, data) - setter config data index
            config = opt_valueOrDataOrSettings;
            data = opt_dataOrSettings;
          } else {
            // bar(index, data, csvSettings) setter data settings index
            data = opt_valueOrDataOrSettings;
            settings = opt_dataOrSettings;
          }
        }

      } else if (argLen > 1) {
        // 2 arguments

        if (this.isConfig_(opt_indexOrValueOrData)) {
          // bar(config, data) - setter config data index=0
          index = 0;
          config = opt_indexOrValueOrData;
          data = opt_valueOrDataOrSettings;
        } else {
          if (isNaN(index)) {
            // bar(data, csvSettings) - setter data settings index=0
            index = 0;
            data = opt_indexOrValueOrData;
            settings = opt_valueOrDataOrSettings;
          } else {
            if (this.isConfig_(opt_valueOrDataOrSettings))
              // bar(index, config) - setter config index
              config = opt_valueOrDataOrSettings;
            else
              // bar(index, data) - setter data index
              data = opt_valueOrDataOrSettings;
          }
        }


      } else if (argLen > 0) {
        // 1 argument

        if (isNaN(index)) {
          index = 0;
          if (this.isConfig_(opt_indexOrValueOrData))
            // bar(config) - setter config index=0
            config = opt_indexOrValueOrData;
          else
            // bar(data) - setter data index=0
            data = opt_indexOrValueOrData;
        }
        // bar(index) - getter index

      } else {
        // 0 arguments
        index = 0;
      }

      var arr = this.getTypedArray(type);
      var pointer = arr[index];
      if (!pointer) {
        pointer = this.createPointerByType_(type, index, data, settings);
      }

      if (goog.isDef(config)) {
        pointer.setup(config);
        return this;
      } else {
        return pointer;
      }
    };
  };
  var prototype = anychart.circularGaugeModule.Chart.prototype;
  var types = anychart.enums.CircularGaugePointerType;
  for (var i in types) {
    var methodName = anychart.utils.toCamelCase(types[i]);
    /**
     * Pointer constructor.
     * @param {?(boolean|number|Object|anychart.data.View|anychart.data.Set|Array|string)=} opt_indexOrValueOrData .
     * @param {?(boolean|Object|anychart.data.View|anychart.data.Set|Array|string|anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_valueOrDataOrSettings .
     * @param {(anychart.data.View|anychart.data.Set|Array|string|anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_dataOrSettings Pointer data index or pointer data.
     * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
     * @return {!anychart.circularGaugeModule.pointers.Base|anychart.circularGaugeModule.Chart} Pointer.
     * @this {anychart.circularGaugeModule.Chart}
     */
    prototype[methodName] = constructorsGenerator(types[i]);
  }
})();


/** invalidates pointers */
anychart.circularGaugeModule.Chart.prototype.invalidatePointerBounds = function() {
  for (var i = 0, len = this.pointers_.length; i < len; i++) {
    var pointer = this.pointers_[i];
    if (pointer) pointer.invalidate(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Listener for pointers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.onPointersSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.GAUGE_POINTERS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE;

    signal |= anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION;
  }

  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


//endregion


/**
 * Axis.
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.Axis|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.axis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.circularGaugeModule.Axis();
    axis.addThemes(/** @type {Object} */(this.getThemeOption('defaultAxisSettings')));
    axis.gauge(this);
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
anychart.circularGaugeModule.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.GAUGE_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_AXIS_MARKERS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.GAUGE_SCALE | anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis for index.
 * @param {number} index Axis index.
 * @return {anychart.circularGaugeModule.Axis}
 */
anychart.circularGaugeModule.Chart.prototype.getAxis = function(index) {
  return this.axes_[index];
};


//region --- Properties
/**
 * Map of pointers constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.circularGaugeModule.Chart.PointersTypesMap = {};
anychart.circularGaugeModule.Chart.PointersTypesMap[anychart.enums.CircularGaugePointerType.BAR] = anychart.circularGaugeModule.pointers.Bar;
anychart.circularGaugeModule.Chart.PointersTypesMap[anychart.enums.CircularGaugePointerType.KNOB] = anychart.circularGaugeModule.pointers.Knob;
anychart.circularGaugeModule.Chart.PointersTypesMap[anychart.enums.CircularGaugePointerType.MARKER] = anychart.circularGaugeModule.pointers.Marker;
anychart.circularGaugeModule.Chart.PointersTypesMap[anychart.enums.CircularGaugePointerType.NEEDLE] = anychart.circularGaugeModule.pointers.Needle;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function sweepAngleNormalizer(opt_value) {
    return goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
  }
  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    descriptors.FILL,
    descriptors.STROKE,
    descriptors.START_ANGLE,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'circularPadding', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'encloseWithStraightLine', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sweepAngle', sweepAngleNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'defaultPointerType', anychart.enums.normalizeCircularGaugePointerType]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.Chart, anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS);


//endregion


/**
 * Gauge radius in pixels.
 * @return {number} .
 */
anychart.circularGaugeModule.Chart.prototype.getPixRadius = function() {
  return this.gaugeRadius_;
};


/**
 * Internal getter for fixed gauge start angle. All for human comfort.
 * @return {number}
 */
anychart.circularGaugeModule.Chart.prototype.getStartAngle = function() {
  return /** @type {number} */ (this.getOption('startAngle')) + anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE;
};


/**
 * Gets X coordinate of gauge center point.
 * @return {number}
 */
anychart.circularGaugeModule.Chart.prototype.getCx = function() {
  return this.cx_;
};


/**
 * Gets Y coordinate of gauge center point.
 * @return {number}
 */
anychart.circularGaugeModule.Chart.prototype.getCy = function() {
  return this.cy_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates gauge frame path.
 * @param {!acgraph.vector.Path} path .
 * @param {number} cx .
 * @param {number} cy .
 * @param {number} radius .
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.createFrame_ = function(path, cx, cy, radius) {
  var sweepAngle = /** @type {number} */ (this.getOption('sweepAngle'));
  var startAngle = this.getStartAngle();

  var endAngle = startAngle + sweepAngle;

  var startAngleRad = goog.math.toRadians(startAngle);
  var endAngleRad = goog.math.toRadians(endAngle);

  this.capRadius_ = this.cap_ && this.cap_.enabled() ?
      anychart.utils.normalizeSize(/** @type {string} */(this.cap_.getOption('radius')), radius) :
      0;

  var startCenterPt_x = cx + (radius * Math.cos(startAngleRad));
  var startCenterPt_y = cy + (radius * Math.sin(startAngleRad));

  var endCenterPt_x = cx + (radius * Math.cos(endAngleRad));
  var endCenterPt_y = cy + (radius * Math.sin(endAngleRad));

  if (sweepAngle % 360 == 0 && sweepAngle != 0) {
    path.circularArc(cx, cy, radius + this.pixCircularPadding_, radius + this.pixCircularPadding_, startAngle, sweepAngle);
  } else if (Math.abs(sweepAngle) > 180 && this.getOption('encloseWithStraightLine')) {
    var correctiveAngle = 90 - (360 - Math.abs(sweepAngle)) / 2;
    path.circularArc(
        startCenterPt_x,
        startCenterPt_y,
        this.pixCircularPadding_,
        this.pixCircularPadding_,
        sweepAngle < 0 ? startAngle + 90 - correctiveAngle : startAngle + 270 + correctiveAngle,
        sweepAngle < 0 ? -90 + correctiveAngle : 90 - correctiveAngle);
    path.circularArc(
        cx,
        cy,
        radius + this.pixCircularPadding_,
        radius + this.pixCircularPadding_,
        startAngle,
        sweepAngle, true);
    path.circularArc(
        endCenterPt_x,
        endCenterPt_y,
        this.pixCircularPadding_,
        this.pixCircularPadding_,
        endAngle,
        sweepAngle < 0 ? -90 + correctiveAngle : 90 - correctiveAngle, true);
  } else {
    var sweepAboutCap = 360 - Math.abs(sweepAngle) - 90;
    if (sweepAboutCap > 0) {
      path.circularArc(
          startCenterPt_x,
          startCenterPt_y,
          this.pixCircularPadding_,
          this.pixCircularPadding_,
          sweepAngle < 0 ? startAngle + 90 : startAngle + 270,
          sweepAngle < 0 ? -90 : 90);
      path.circularArc(
          cx,
          cy,
          radius + this.pixCircularPadding_,
          radius + this.pixCircularPadding_,
          startAngle,
          sweepAngle, true);
      path.circularArc(
          endCenterPt_x,
          endCenterPt_y,
          this.pixCircularPadding_,
          this.pixCircularPadding_,
          endAngle,
          sweepAngle < 0 ? -90 : 90, true);
      path.circularArc(
          cx,
          cy,
          this.pixCircularPadding_ + this.capRadius_,
          this.pixCircularPadding_ + this.capRadius_,
          sweepAngle < 0 ? endAngle - 45 : endAngle + 45,
          sweepAngle < 0 ? -sweepAboutCap : sweepAboutCap, true);
    } else {
      //calculate intersection point
      var angle = goog.math.toRadians(sweepAngle < 0 ? endAngle - 45 : endAngle + 45);
      var x1 = cx + Math.cos(angle) * (this.pixCircularPadding_ + this.capRadius_);
      var y1 = cy + Math.sin(angle) * (this.pixCircularPadding_ + this.capRadius_);

      angle = goog.math.toRadians(sweepAngle < 0 ? endAngle - 90 : endAngle + 90);
      var x2 = endCenterPt_x + Math.cos(angle) * this.pixCircularPadding_;
      var y2 = endCenterPt_y + Math.sin(angle) * this.pixCircularPadding_;

      angle = goog.math.toRadians(sweepAngle < 0 ? endAngle - 45 + 360 - sweepAngle + 90 : endAngle + 45 + 360 - sweepAngle - 90);
      var x10 = cx + Math.cos(angle) * (this.pixCircularPadding_ + this.capRadius_);
      var y10 = cy + Math.sin(angle) * (this.pixCircularPadding_ + this.capRadius_);

      angle = goog.math.toRadians(sweepAngle < 0 ? startAngle + 90 : startAngle - 90);
      var x20 = startCenterPt_x + Math.cos(angle) * this.pixCircularPadding_;
      var y20 = startCenterPt_y + Math.sin(angle) * this.pixCircularPadding_;


      var A1 = (y1 - y2);
      var B1 = (x2 - x1);
      var C1 = (x1 * y2 - x2 * y1);

      var A2 = (y10 - y20);
      var B2 = (x20 - x10);
      var C2 = (x10 * y20 - x20 * y10);

      var x_inters = (B1 * C2 - B2 * C1) / (A1 * B2 - A2 * B1);
      var y_inters = (C1 * A2 - C2 * A1) / (A1 * B2 - A2 * B1);

      var intersectPointRadius = anychart.math.vectorLength(x_inters, y_inters, cx, cy);

      if (intersectPointRadius < radius) {
        path.circularArc(
            startCenterPt_x,
            startCenterPt_y,
            this.pixCircularPadding_,
            this.pixCircularPadding_,
            sweepAngle < 0 ? startAngle + 90 : startAngle + 270,
            sweepAngle < 0 ? -90 : 90);
        path.circularArc(
            cx,
            cy,
            radius + this.pixCircularPadding_,
            radius + this.pixCircularPadding_,
            startAngle,
            sweepAngle, true);
        path.circularArc(
            endCenterPt_x,
            endCenterPt_y,
            this.pixCircularPadding_,
            this.pixCircularPadding_,
            endAngle,
            sweepAngle < 0 ? -90 : 90, true);

        path.lineTo(x_inters, y_inters);
      } else {
        path.circularArc(cx, cy, radius + this.pixCircularPadding_, radius + this.pixCircularPadding_, 0, 360);
      }
    }
  }

  path.close();
};


/**
 * Calculating common values.
 * @param {anychart.math.Rect} bounds Bounds of the content area.
 * @private
 */
anychart.circularGaugeModule.Chart.prototype.calculate_ = function(bounds) {
  if (!this.framePath) this.framePath = this.rootElement.path();
  else this.framePath.clear();

  this.outerGaugeRadius_ = 1;
  this.pixCircularPadding_ = anychart.utils.normalizeSize(/** @type {string|number} */ (this.getOption('circularPadding')), this.outerGaugeRadius_);
  this.gaugeRadius_ = this.outerGaugeRadius_ - this.pixCircularPadding_;

  this.createFrame_(this.framePath, 0, 0, this.gaugeRadius_);

  var tmpBounds = this.framePath.getBounds();

  var wRatio, hRatio, ratio, left, top;

  wRatio = bounds.width / tmpBounds.width;
  hRatio = bounds.height / tmpBounds.height;

  ratio = Math.min(wRatio, hRatio);

  left = bounds.left + bounds.width / 2 - (tmpBounds.width / 2 * ratio);
  top = bounds.top + bounds.height / 2 - (tmpBounds.height / 2 * ratio);

  this.outerGaugeRadius_ = ratio;
  this.cx_ = left + Math.abs(tmpBounds.left) * ratio;
  this.cy_ = top + Math.abs(tmpBounds.top) * ratio;

  this.pixCircularPadding_ = this.pixCircularPadding_ * this.outerGaugeRadius_;
  this.gaugeRadius_ = this.outerGaugeRadius_ - this.pixCircularPadding_;

  /**
   * Bounds of gauge. (Not bounds of content area).
   * @type {anychart.math.Rect}
   * @private
   */
  this.outerGaugeBounds_ = new anychart.math.Rect(
      left,
      top,
      tmpBounds.width * ratio,
      tmpBounds.height * ratio
      );

  /**
   * Bounds of gauge without circular padding.
   * @type {anychart.math.Rect}
   * @private
   */
  this.gaugeBounds_ = new anychart.math.Rect(
      left + this.pixCircularPadding_,
      top + this.pixCircularPadding_,
      tmpBounds.width * ratio - this.pixCircularPadding_,
      tmpBounds.height * ratio - this.pixCircularPadding_
      );
};


/**
 * Bounds of gauge without circular padding.
 * @return {anychart.math.Rect}
 */
anychart.circularGaugeModule.Chart.prototype.getContentBounds = function() {
  return this.gaugeBounds_ ? this.gaugeBounds_.clone() : anychart.math.rect(0, 0, 0, 0);
};


/**
 * Bounds of gauge without circular padding.
 * @return {anychart.math.Rect}
 */
anychart.circularGaugeModule.Chart.prototype.getGaugeBounds = function() {
  return this.outerGaugeBounds_ ? this.outerGaugeBounds_.clone() : anychart.math.rect(0, 0, 0, 0);
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.setLabelSettings = function(label, bounds) {
  label.parentBounds(this.getGaugeBounds());
  label.parentRadius(this.getPixRadius());
  label.cx(this.getCx());
  label.cy(this.getCy());
  label.startAngle(this.getStartAngle());
  label.sweepAngle(this.getOption('sweepAngle'));
};


/**
 * Draw circular gauge content items.
 * @param {anychart.math.Rect} bounds Bounds of gauge content area.
 */
anychart.circularGaugeModule.Chart.prototype.drawContent = function(bounds) {
  var i, len, axis, pointer, range;

  var pointers = goog.array.concat(this.bars_, this.markers_, this.needles_, this.knobs_);
  anychart.core.Base.suspendSignalsDispatching(this.cap_, this.axes_, this.ranges_, pointers);

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_SCALE)) {

    var needAutoCalc = false;
    goog.array.forEach(this.axes_, function(axis) {
      axis.scale().startAutoCalc();
      needAutoCalc = needAutoCalc || axis.scale().needsAutoCalc();
    });

    if (needAutoCalc) {
      for (i = 0, len = pointers.length; i < len; i++) {
        pointer = /** @type {anychart.circularGaugeModule.pointers.Base} */(pointers[i]);
        if (pointer) {
          var iterator = pointer.getIterator();
          var axisIndex = /** @type {number} */(pointer.getOption('axisIndex'));

          iterator.select(/** @type {number} */(pointer.dataIndex()));
          axis = this.axes_[axisIndex];
          if (axis) {
            axis.scale().extendDataRange(iterator.get('value'));
            if (anychart.utils.instanceOf(pointer, anychart.circularGaugeModule.pointers.Bar))
              axis.scale().extendDataRange(0);
          }
        }
      }
    }

    goog.array.forEach(this.axes_, function(axis) {
      axis.scale().finishAutoCalc();
    });

    this.invalidatePointerBounds();
    this.invalidate(anychart.ConsistencyState.GAUGE_AXES);
    this.invalidate(anychart.ConsistencyState.GAUGE_AXIS_MARKERS);
    this.markConsistent(anychart.ConsistencyState.GAUGE_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculate_(bounds);

    this.framePath.clear();
    this.createFrame_(this.framePath, this.cx_, this.cy_, this.gaugeRadius_);
    this.framePath.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_FRAME);
    this.framePath.parent(this.rootElement);

    if (this.cap_) this.cap_.invalidate(anychart.ConsistencyState.BOUNDS);

    for (i = 0, len = this.axes_.length; i < len; i++) {
      axis = this.axes_[i];
      if (axis) axis.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.invalidatePointerBounds();

    for (i = 0, len = this.ranges_.length; i < len; i++) {
      range = this.ranges_[i];
      if (range) range.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.invalidate(anychart.ConsistencyState.GAUGE_CAP |
        anychart.ConsistencyState.GAUGE_AXES |
        anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_AXIS_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.framePath.stroke(this.getOption('stroke'));
    this.framePath.fill(this.getOption('fill'));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_CAP)) {
    if (this.cap_)
      this.cap_
          .container(this.rootElement)
          .draw();

    this.markConsistent(anychart.ConsistencyState.GAUGE_CAP);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_AXES)) {
    for (i = 0, len = this.axes_.length; i < len; i++) {
      axis = this.axes_[i];
      if (axis) {
        axis
            .container(this.rootElement)
            .draw();
      }
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_POINTERS)) {
    for (i = 0, len = pointers.length; i < len; i++) {
      pointer = pointers[i];
      if (pointer) {
        pointer.setParentEventTarget(this);
        pointer
            .container(this.rootElement)
            .draw();

      }
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_POINTERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_AXIS_MARKERS)) {
    for (i = 0, len = this.ranges_.length; i < len; i++) {
      range = this.ranges_[i];
      if (range) {
        range
            .container(this.rootElement)
            .draw();
      }
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_AXIS_MARKERS);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.cap_, this.axes_, this.ranges_, pointers);
};


//region --- No data label
/**
 * Is there no data on the chart.
 * @return {boolean}
 */
anychart.circularGaugeModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  var countDisabled = 0;
  var pointers = goog.array.concat(this.bars_, this.markers_, this.needles_, this.knobs_);
  var len = pointers.length;
  for (var i = 0; i < len; i++) {
    var pointer = pointers[i];
    if (pointer && !pointer.enabled())
      countDisabled++;
    else
      break;
  }
  return (!rowsCount || !len || (countDisabled == len));
};


//endregion
/**
 * Initializes elements with config or theme settings.
 * @param {Object=} opt_config
 */
anychart.circularGaugeModule.Chart.prototype.setupElements = function(opt_config) {
  opt_config = opt_config ? opt_config : this.themeSettings;

  var i, len;
  var axes = opt_config['axes'];
  if (axes) {
    for (i = 0, len = axes.length; i < len; i++) {
      if (axes[i])
        this.axis(i, axes[i]);
    }
  }

  if ('pointers' in opt_config) {
    var pointers = opt_config['pointers'];
    var json;
    if (goog.isArray(pointers)) {
      for (i = 0; i < pointers.length; i++) {
        json = pointers[i];
        var pointerType = json['pointerType'] || this.getOption('defaultPointerType');
        var typedArray = this.getTypedArray(pointerType);
        var length = typedArray.length;
        var dataIndex = json['dataIndex'];
        var data = json['data'] || null;
        var pointerInst = this.createPointerByType_(pointerType, length);
        if (pointerInst) {
          pointerInst.dataIndex(dataIndex);
          pointerInst.data(data);
          pointerInst.setup(json);
        }
      }
    }
  } else {
    // legacy
    var bars = opt_config['bars'];
    if (bars) {
      for (i = 0, len = bars.length; i < len; i++) {
        if (bars[i])
          this['bar'](i, bars[i]);
      }
    }

    var markers = opt_config['markers'];
    if (markers) {
      for (i = 0, len = markers.length; i < len; i++) {
        if (markers[i])
          this['marker'](i, markers[i]);
      }
    }

    var needles = opt_config['needles'];
    if (needles) {
      for (i = 0, len = needles.length; i < len; i++) {
        if (needles[i])
          this['needle'](i, needles[i]);
      }
    }

    var knobs = opt_config['knobs'];
    if (knobs) {
      for (i = 0, len = knobs.length; i < len; i++) {
        if (knobs[i])
          this['knob'](i, knobs[i]);
      }
    }
  }

  var ranges = opt_config['ranges'];
  if (ranges) {
    for (i = 0, len = ranges.length; i < len; i++) {
      if (ranges[i])
        this.range(i, ranges[i]);
    }
  }
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS, config, opt_default);

  this.data(config['data']);
  if (goog.isDef(config['cap']))
    this.cap(config['cap']);
  this.interactivity(config['interactivity']);

  this.setupElements(config);
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.Chart.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS, json);
  json['data'] = this.data().serialize();
  if (this.cap_)
    json['cap'] = this.cap().serialize();
  json['interactivity'] = this.interactivity().serialize();

  var i, len;
  var axes = [];
  for (i = 0, len = this.axes_.length; i < len; i++) {
    var axis = this.axes_[i];
    if (axis) axes.push(axis.serialize());
  }
  if (axes.length) json['axes'] = axes;

  var pointers = [];
  for (i = 0; i < this.pointers_.length; i++) {
    var pointer = this.pointers_[i];
    if (pointer)
      pointers.push(pointer.serialize());
  }
  if (pointers.length)
    json['pointers'] = pointers;

  var ranges = [];
  for (i = 0, len = this.ranges_.length; i < len; i++) {
    var range = this.ranges_[i];
    if (range) ranges.push(range.serialize());
  }
  if (ranges.length) json['ranges'] = ranges;


  return {'gauge': json};
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.parentViewToDispose_,
      this.parentView_,
      this.data_,
      this.cap_,
      this.ranges_,
      this.axes_,
      this.bars_,
      this.markers_,
      this.needles_,
      this.knobs_,
      this.pointers_);
  this.parentViewToDispose_ = null;
  this.parentView_ = null;
  this.data_ = null;
  this.iterator_ = null;
  this.cap_ = null;
  this.ranges_.length = 0;
  this.axes_.length = 0;
  this.bars_.length = 0;
  this.markers_.length = 0;
  this.needles_.length = 0;
  this.knobs_.length = 0;
  this.pointers_.length = 0;
  anychart.circularGaugeModule.Chart.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.circularGaugeModule.Chart.prototype;
  //descriptors
  //proto['stroke'] = proto.stroke;
  //proto['fill'] = proto.fill;
  //proto['startAngle'] = proto.startAngle;
  //proto['sweepAngle'] = proto.sweepAngle;
  //proto['circularPadding'] = proto.circularPadding;
  //proto['encloseWithStraightLine'] = proto.encloseWithStraightLine;

  proto['data'] = proto.data;

  proto['cap'] = proto.cap;
  proto['axis'] = proto.axis;

  proto['addPointer'] = proto.addPointer;
  proto['removePointer'] = proto.removePointer;
  proto['removePointerAt'] = proto.removePointerAt;
  proto['removeAllPointers'] = proto.removeAllPointers;
  proto['getPointer'] = proto.getPointer;
  proto['getPointerAt'] = proto.getPointerAt;
  proto['getPointersCount'] = proto.getPointersCount;

  // auto generated
  //proto['bar'] = proto.bar;
  //proto['marker'] = proto.marker;
  //proto['needle'] = proto.needle;
  //proto['knob'] = proto.knob;
  //proto['defaultPointerType'] = proto.defaultPointerType;

  proto['range'] = proto.range;

  proto['getType'] = proto.getType;
  proto['noData'] = proto.noData;
})();
