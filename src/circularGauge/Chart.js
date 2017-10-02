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
      anychart.Signal.NEEDS_REDRAW]
  ]);

  this.resumeSignalsDispatching(true);
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
 * @type {!anychart.data.Iterator}
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


/**
 * @inheritDoc
 */
anychart.circularGaugeModule.Chart.prototype.getAllSeries = function() {
  return goog.array.concat(this.bars_, this.markers_, this.needles_, this.knobs_);
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
/**
 * Getter/setter for axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.circularGaugeModule.Chart.prototype.defaultAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultAxisSettings_ || {};
};


/**
 * Getter/setter for bar pointer default settings.
 * @param {Object=} opt_value Object with bar pointer settings.
 * @return {Object}
 */
anychart.circularGaugeModule.Chart.prototype.defaultPointerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultPointerSettings_ = opt_value;
    return this;
  }
  return this.defaultPointerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.circularGaugeModule.Chart.prototype.defaultRangeSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeSettings_ || {};
};


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
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose_);
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
    this.cap_.gauge(this);
    this.registerDisposable(this.cap_);
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
    circularRange.axisIndex(0);
    circularRange.setup(this.defaultRangeSettings());
    this.registerDisposable(circularRange);
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


/**
 * Bar pointer.
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.pointers.Bar|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.bar = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var bar = this.bars_[index];
  if (!bar) {
    bar = new anychart.circularGaugeModule.pointers.Bar();
    this.bars_[index] = bar;
    bar.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_POINTER + anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * this.pointerCounter_);
    bar.dataIndex(this.pointerCounter_++);
    bar.axisIndex(0);
    bar.gauge(this);
    //TODO(AntonKagakin): may be we should create gauge pointers (not only bar, but knob, markers too) and colorize them with default palette?
    bar.setup(this.defaultPointerSettings()['bar']);
    this.registerDisposable(bar);
    bar.listenSignals(this.onPointersSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  }

  if (goog.isDef(value)) {
    bar.setup(value);
    return this;
  } else {
    return bar;
  }
};


/**
 * Marker pointer.
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.pointers.Marker|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.marker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var marker = this.markers_[index];
  if (!marker) {
    marker = new anychart.circularGaugeModule.pointers.Marker();
    this.markers_[index] = marker;
    marker.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_POINTER + anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * this.pointerCounter_);
    marker.dataIndex(this.pointerCounter_++);
    marker.axisIndex(0);
    marker.gauge(this);
    marker.setup(this.defaultPointerSettings()['marker']);
    this.registerDisposable(marker);
    marker.listenSignals(this.onPointersSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  }

  if (goog.isDef(value)) {
    marker.setup(value);
    return this;
  } else {
    return marker;
  }
};


/**
 * Needle pointer.
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.pointers.Needle|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.needle = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var needle = this.needles_[index];
  if (!needle) {
    needle = new anychart.circularGaugeModule.pointers.Needle();
    this.needles_[index] = needle;
    needle.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_POINTER + anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * this.pointerCounter_);
    needle.dataIndex(this.pointerCounter_++);
    needle.axisIndex(0);
    needle.gauge(this);
    needle.setup(this.defaultPointerSettings()['needle']);
    this.registerDisposable(needle);
    needle.listenSignals(this.onPointersSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  }

  if (goog.isDef(value)) {
    needle.setup(value);
    return this;
  } else {
    return needle;
  }
};


/**
 * Knob pointer.
 * @param {?(boolean|number|Object)=} opt_indexOrValue .
 * @param {?(boolean|Object)=} opt_value .
 * @return {!anychart.circularGaugeModule.pointers.Knob|anychart.circularGaugeModule.Chart} .
 */
anychart.circularGaugeModule.Chart.prototype.knob = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var knob = this.knobs_[index];
  if (!knob) {
    knob = new anychart.circularGaugeModule.pointers.Knob();
    this.knobs_[index] = knob;
    knob.zIndex(anychart.circularGaugeModule.Chart.ZINDEX_KNOB + anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * this.knobCounter_);
    knob.dataIndex(this.knobCounter_++);
    knob.axisIndex(0);
    knob.gauge(this);
    knob.setup(this.defaultPointerSettings()['knob']);
    this.registerDisposable(knob);
    knob.listenSignals(this.onPointersSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_POINTERS |
        anychart.ConsistencyState.GAUGE_SCALE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
  }

  if (goog.isDef(value)) {
    knob.setup(value);
    return this;
  } else {
    return knob;
  }
};


/** invalidates pointers */
anychart.circularGaugeModule.Chart.prototype.invalidatePointerBounds = function() {
  var pointers = goog.array.concat(this.bars_, this.markers_, this.needles_, this.knobs_);

  for (var i = 0, len = pointers.length; i < len; i++) {
    var pointer = pointers[i];
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
    axis.setup(this.defaultAxisSettings());
    axis.gauge(this);
    this.axes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.GAUGE_AXES, anychart.Signal.NEEDS_REDRAW);
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


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'circularPadding',
      anychart.utils.normalizeToPercent);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'encloseWithStraightLine',
      anychart.core.settings.asIsNormalizer);

  function startAngleNormalizer(opt_value) {
    return goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'startAngle',
      startAngleNormalizer);

  function sweepAngleNormalizer(opt_value) {
    return goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'sweepAngle',
      sweepAngleNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.Chart, anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS);


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
      anychart.utils.normalizeSize(/** @type {string} */(this.cap_.radius()), radius) :
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

    var iterator = this.getIterator();

    var needAutoCalc = false;
    goog.array.forEach(this.axes_, function(axis) {
      axis.scale().startAutoCalc();
      needAutoCalc = needAutoCalc || axis.scale().needsAutoCalc();
    });

    if (needAutoCalc) {
      for (i = 0, len = pointers.length; i < len; i++) {
        pointer = pointers[i];
        if (pointer) {
          var axisIndex = pointer.axisIndex();

          iterator.select(pointer.dataIndex());
          axis = this.axes_[axisIndex];
          axis.scale().extendDataRange(iterator.get('value'));
          if (anychart.utils.instanceOf(pointer, anychart.circularGaugeModule.pointers.Bar))
            axis.scale().extendDataRange(0);
        }
      }
    }

    goog.array.forEach(this.axes_, function(axis) {
      axis.scale().finishAutoCalc();
    });

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

    for (i = 0, len = pointers.length; i < len; i++) {
      pointer = pointers[i];
      if (pointer) pointer.invalidate(anychart.ConsistencyState.BOUNDS);
    }

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


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('defaultAxisSettings' in config)
    this.defaultAxisSettings(config['defaultAxisSettings']);

  if ('defaultPointerSettings' in config)
    this.defaultPointerSettings(config['defaultPointerSettings']);

  if ('defaultRangeSettings' in config)
    this.defaultRangeSettings(config['defaultRangeSettings']);

  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.Chart.PROPERTY_DESCRIPTORS, config);

  this.data(config['data']);
  if (goog.isDef(config['cap']))
    this.cap(config['cap']);
  this.interactivity(config['interactivity']);

  var i, len;
  var axes = config['axes'];
  if (axes) {
    for (i = 0, len = axes.length; i < len; i++) {
      if (axes[i])
        this.axis(i, axes[i]);
    }
  }

  var bars = config['bars'];
  if (bars) {
    for (i = 0, len = bars.length; i < len; i++) {
      if (bars[i])
        this.bar(i, bars[i]);
    }
  }

  var markers = config['markers'];
  if (markers) {
    for (i = 0, len = markers.length; i < len; i++) {
      if (markers[i])
        this.marker(i, markers[i]);
    }
  }

  var needles = config['needles'];
  if (needles) {
    for (i = 0, len = needles.length; i < len; i++) {
      if (needles[i])
        this.needle(i, needles[i]);
    }
  }

  var knobs = config['knobs'];
  if (knobs) {
    for (i = 0, len = knobs.length; i < len; i++) {
      if (knobs[i])
        this.knob(i, knobs[i]);
    }
  }

  var ranges = config['ranges'];
  if (ranges) {
    for (i = 0, len = ranges.length; i < len; i++) {
      if (ranges[i])
        this.range(i, ranges[i]);
    }
  }
};


/** @inheritDoc */
anychart.circularGaugeModule.Chart.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.Chart.base(this, 'serialize');

  json['type'] = anychart.enums.GaugeTypes.CIRCULAR;

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

  var bars = [];
  for (i = 0, len = this.bars_.length; i < len; i++) {
    var bar = this.bars_[i];
    if (bar) bars.push(bar.serialize());
  }
  if (bars.length) json['bars'] = bars;

  var markers = [];
  for (i = 0, len = this.markers_.length; i < len; i++) {
    var marker = this.markers_[i];
    if (marker) markers.push(marker.serialize());
  }
  if (markers.length) json['markers'] = markers;

  var needles = [];
  for (i = 0, len = this.needles_.length; i < len; i++) {
    var needle = this.needles_[i];
    if (needle) needles.push(needle.serialize());
  }
  if (needles.length) json['needles'] = needles;

  var knobs = [];
  for (i = 0, len = this.knobs_.length; i < len; i++) {
    var knob = this.knobs_[i];
    if (knob) knobs.push(knob.serialize());
  }
  if (knobs.length) json['knobs'] = knobs;

  var ranges = [];
  for (i = 0, len = this.ranges_.length; i < len; i++) {
    var range = this.ranges_[i];
    if (range) ranges.push(range.serialize());
  }
  if (ranges.length) json['ranges'] = ranges;


  return {'gauge': json};
};


/**
 * Returns default theme object.
 * @return {Object}
 */
anychart.circularGaugeModule.Chart.prototype.getDefaultThemeObj = function() {
  return {'gauge': anychart.getFullTheme('circularGauge')};
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

  proto['bar'] = proto.bar;
  proto['marker'] = proto.marker;
  proto['needle'] = proto.needle;
  proto['knob'] = proto.knob;

  proto['range'] = proto.range;

  proto['getType'] = proto.getType;
  proto['noData'] = proto.noData;
})();
