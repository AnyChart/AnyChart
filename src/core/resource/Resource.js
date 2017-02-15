goog.provide('anychart.core.resource.Resource');
goog.require('anychart.core.Base');
goog.require('anychart.format');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Calendar');
goog.require('anychart.utils');



/**
 * Resource representation
 * @param {anychart.charts.Resource} chart
 * @param {number} index
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.resource.Resource = function(chart, index) {
  anychart.core.resource.Resource.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {anychart.charts.Resource}
   * @private
   */
  this.chart_ = chart;

  /**
   * Resource index. Refers to the chart data row index.
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * Resource calendar.
   * @type {?anychart.scales.Calendar}
   * @private
   */
  this.calendar_ = null;

  /**
   * Activities storage.
   * @type {Array.<anychart.core.resource.Resource.Activity>}
   * @private
   */
  this.activities_ = [];

  /**
   * Map of UTC day number -> allocation info.
   * @type {Object.<number, anychart.core.resource.Resource.Allocation>}
   * @private
   */
  this.schedule_ = {};

  /**
   * Tracked maximum of occupation in day.
   * @type {number}
   * @private
   */
  this.maxOccupation_ = 0;

  /**
   * If the resource has conflicting activities.
   * @type {boolean}
   */
  this.hasConflicts = false;

  /**
   * Bounds cache.
   * @type {anychart.math.Rect}
   * @private
   */
  this.bounds_ = null;

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.resource.Resource, anychart.core.Base);


//region --- Consts and types
//------------------------------------------------------------------------------
//
//  Consts and types
//
//------------------------------------------------------------------------------
/**
 * MS in day.
 * @const {number}
 */
anychart.core.resource.Resource.DAY = 24 * 60 * 60 * 1000;


/**
 * MS in minute.
 * @const {number}
 */
anychart.core.resource.Resource.MINUTE = 24 * 60 * 60 * 1000;


/**
 * Constant spacing between activities.
 * @const {number}
 */
anychart.core.resource.Resource.ACTIVITIES_SPACING = 1;


/**
 * Allocation descriptor.
 * @typedef {{
 *   vacant: number,
 *   allocated: number,
 *   activities: Array.<number>,
 *   bottom: number
 * }}
 */
anychart.core.resource.Resource.Allocation;


/**
 * @typedef {{
 *   data: Object,
 *   top: number,
 *   intervals: Array.<anychart.core.resource.Resource.ActivityInterval>
 * }}
 */
anychart.core.resource.Resource.Activity;


/**
 * @typedef {{
 *   start: number,
 *   end: number,
 *   minutesPerDay: number,
 *   top: (number|undefined),
 *   shape: ?acgraph.vector.Path,
 *   hfShape: ?acgraph.vector.Path,
 *   visibleIndex: number,
 *   globalIndex: number
 * }}
 */
anychart.core.resource.Resource.ActivityInterval;


//endregion
//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.resource.Resource.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.RESOURCE_RESOURCE_DATA |
    anychart.ConsistencyState.RESOURCE_RESOURCE_SCHEDULE;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.Resource.prototype.SUPPORTED_SIGNALS = 0;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Resource calendar.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.scales.Calendar|anychart.core.resource.Resource}
 */
anychart.core.resource.Resource.prototype.calendar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.calendar_) {
      this.calendar_ = new anychart.scales.Calendar(/** @type {anychart.scales.Calendar} */(this.chart_.calendar()));
    }
    this.calendar_.setup(opt_value);
    return this;
  }
  return this.calendar_ || /** @type {anychart.scales.Calendar} */(this.chart_.calendar());
};


/**
 * Draws the resource.
 * @param {{globalIndex: number, registry: Array.<number>}} index
 * @param {number} from
 * @param {number} to
 * @param {anychart.core.utils.TypedLayer} typedLayer
 * @param {anychart.math.Rect} bounds
 * @param {number} vLineThickness
 * @return {{globalIndex: number, registry: Array.<number>}}
 */
anychart.core.resource.Resource.prototype.draw = function(index, from, to, typedLayer, bounds, vLineThickness) {
  this.calculate();

  if (this.hasConflicts) {
    // UTC day number - easy to hash and calculate.
    var fromDay = Math.floor(from / anychart.core.resource.Resource.DAY);
    var toDay = Math.floor(to / anychart.core.resource.Resource.DAY);
    var conflicts = /** @type {anychart.core.resource.Conflicts} */(this.chart_.conflicts());
    for (var k = fromDay; k <= toDay; k++) {
      conflicts.evaluate(k * anychart.core.resource.Resource.DAY, this.schedule_[k], this, bounds.top);
    }
    // finalize
    conflicts.evaluate(k * anychart.core.resource.Resource.DAY, null, this, bounds.top);
    var statusHeight = /** @type {number} */(conflicts.getOption('height')) + anychart.core.resource.Resource.ACTIVITIES_SPACING;
    bounds.top += statusHeight;
    bounds.height -= statusHeight;
  }
  this.bounds_ = bounds;

  for (var i = 0; i < this.activities_.length; i++) {
    index = this.drawActivity_(index, this.activities_[i], from, to, typedLayer, vLineThickness);
  }

  return index;
};


/**
 * Updates activity appearance.
 * @param {number} index
 * @param {anychart.PointState} state
 * @param {anychart.core.utils.TypedLayer} typedLayer
 * @param {number} vLineThickness
 */
anychart.core.resource.Resource.prototype.updateActivity = function(index, state, typedLayer, vLineThickness) {
  var activity = this.activities_[index];
  if (activity) {
    for (var i = 0; i < activity.intervals.length; i++) {
      var interval = activity.intervals[i];
      if (!isNaN(interval.visibleIndex)) {
        this.drawInterval_(activity, interval, state, typedLayer, vLineThickness);
      }
    }
  }
};


/**
 * Extends passed X scale with all its activity intervals.
 * @param {anychart.scales.DateTimeWithCalendar} scale
 */
anychart.core.resource.Resource.prototype.extendXScale = function(scale) {
  this.calculate();
  for (var i = 0; i < this.activities_.length; i++) {
    var intervals = this.activities_[i].intervals;
    for (var j = 0; j < intervals.length; j++) {
      var interval = intervals[j];
      scale.extendDataRange(interval.start, interval.end);
    }
  }
};


/**
 * Returns Resource max occupation.
 * @return {number}
 */
anychart.core.resource.Resource.prototype.getMaxOccupation = function() {
  this.calculate();
  return this.maxOccupation_;
};


/**
 * Returns activity by index.
 * @param {number} index
 * @return {anychart.core.resource.Resource.Activity}
 */
anychart.core.resource.Resource.prototype.getActivity = function(index) {
  return this.activities_[index] || null;
};


/**
 * Returns activities count.
 * @return {number}
 */
anychart.core.resource.Resource.prototype.getActivitiesCount = function() {
  return this.activities_.length;
};


/**
 * Calculates resource activities and schedule.
 */
anychart.core.resource.Resource.prototype.calculate = function() {
  var i, activity;
  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_RESOURCE_DATA)) {
    this.activities_.length = 0;
    var row = this.chart_.getDataIterator();
    var rawActivities;
    if (!row.select(this.index_) || !(rawActivities = row.get('activities')) || !goog.isArray(rawActivities))
      return;
    for (i = 0; i < rawActivities.length; i++) {
      activity = this.activityFromData_(rawActivities[i]);
      if (activity) {
        this.activities_.push(activity);
      }
    }
    this.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCE_SCHEDULE);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_RESOURCE_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_RESOURCE_SCHEDULE)) {
    this.schedule_ = {};
    this.maxOccupation_ = 0;
    this.hasConflicts = false;
    var trackAvailability = this.chart_.tracksAvailability();
    for (i = 0; i < this.activities_.length; i++) {
      activity = this.activities_[i];
      var intervals = activity.intervals;
      for (var j = 0; j < intervals.length; j++) {
        var interval = intervals[j];
        // UTC day number - easy to hash and calculate.
        var from = Math.floor(interval.start / anychart.core.resource.Resource.DAY);
        var to = Math.floor(interval.end / anychart.core.resource.Resource.DAY);
        var thickness = interval.minutesPerDay;
        var intervalTop = 0;
        var k, allocation;
        for (k = from; k <= to; k++) {
          allocation = this.schedule_[k];
          if (!allocation) {
            var vacant = this.calcDaySchedule_(k);
            this.schedule_[k] = allocation = {
              vacant: vacant,
              allocated: 0,
              activities: vacant ? [] : null,
              bottom: 0
            };
          }
          if (!allocation.vacant) // holiday, skipping
            continue;
          // current allocation can be only the last in the list of activities for the
          // allocation, because we form them consequently
          if (allocation.activities[allocation.activities.length - 1] != i) {
            allocation.activities.push(i);
          }
          allocation.allocated += thickness;
          if (allocation.allocated > allocation.vacant)
            this.hasConflicts = true;
          if (allocation.bottom > intervalTop)
            intervalTop = allocation.bottom;
        }
        interval.top = intervalTop;
        var bottom = intervalTop + thickness;
        for (k = from; k <= to; k++) {
          this.schedule_[k].bottom = bottom;
          if (trackAvailability && this.maxOccupation_ < allocation.vacant)
            this.maxOccupation_ = allocation.vacant;
          if (this.maxOccupation_ < allocation.bottom)
            this.maxOccupation_ = allocation.bottom;
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.RESOURCE_RESOURCE_SCHEDULE);
  }
};


//endregion
//region --- Private methods
//------------------------------------------------------------------------------
//
//  Private methods
//
//------------------------------------------------------------------------------
/**
 * Parses passed data JSON and creates Activity object. If the data doesn't
 * contain any valid intervals - returns null.
 * @param {*} dataObj
 * @return {?anychart.core.resource.Resource.Activity}
 * @private
 */
anychart.core.resource.Resource.prototype.activityFromData_ = function(dataObj) {
  if (!goog.isObject(dataObj))
    return null;
  var rawIntervals = dataObj['intervals'];
  if (!goog.isArray(rawIntervals)) {
    rawIntervals = [dataObj];
  }
  var defaultMPDValue = /** @type {number} */(this.chart_.defaultMinutesPerDay());
  var intervals = [];
  for (var i = 0; i < rawIntervals.length; i++) {
    var interval = rawIntervals[i];
    if (interval) {
      var startDate = anychart.format.parseDateTime(interval['start']);
      var endDate = anychart.format.parseDateTime(interval['end']);
      if (startDate && endDate) {
        if (startDate.getTime() > endDate.getTime()) {
          var tmp = startDate;
          startDate = endDate;
          endDate = tmp;
        }
        var start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
        var end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
        var minutesPerDay;
        var total = anychart.utils.normalizeToNaturalNumber(interval['totalMinutes'], NaN, false);
        if (isNaN(total)) {
          minutesPerDay = anychart.utils.normalizeToNaturalNumber(
              interval['minutesPerDay'], defaultMPDValue, false);
        } else {
          var daysCount = (end - start) / anychart.core.resource.Resource.DAY + 1;
          minutesPerDay = total / daysCount;
        }
        intervals.push({
          start: start,
          end: end,
          minutesPerDay: minutesPerDay,
          shape: null,
          hfShape: null,
          visibleIndex: NaN
        });
      }
    }
  }
  return intervals.length ?
      {
        data: dataObj,
        top: 0,
        intervals: intervals
      } :
      null;
};


/**
 * Returns possible day occupation time in minutes.
 * @param {number} date
 * @return {number}
 * @private
 */
anychart.core.resource.Resource.prototype.calcDaySchedule_ = function(date) {
  var daySchedule = (/** @type {anychart.scales.Calendar} */(this.calendar())).getDaySchedule(date);
  var result = 0;
  for (var i = 0; i < daySchedule.length; i++) {
    var interval = daySchedule[i];
    result += interval[1] - interval[0];
  }
  return result / (60 * 1000); // ms in minute
};


/**
 * Draws the activity in passed range.
 * Returns new index for the next activity to be drawn.
 * @param {{globalIndex: number, registry: Array.<number>}} index
 * @param {anychart.core.resource.Resource.Activity} activity
 * @param {number} from
 * @param {number} to
 * @param {anychart.core.utils.TypedLayer} typedLayer
 * @param {number} vLineThickness
 * @return {{globalIndex: number, registry: Array.<number>}}
 * @private
 */
anychart.core.resource.Resource.prototype.drawActivity_ = function(index, activity, from, to, typedLayer, vLineThickness) {
  var globalIndex = index.globalIndex++;
  for (var i = 0; i < activity.intervals.length; i++) {
    var interval = activity.intervals[i];
    interval.shape = null;
    interval.hfShape = null;
    interval.globalIndex = globalIndex;
    if (interval.end + anychart.core.resource.Resource.DAY < from || interval.start > to) {
      interval.visibleIndex = NaN;
    } else {
      interval.visibleIndex = index.registry.length;
      index.registry.push(globalIndex);
      this.drawInterval_(activity, interval, this.chart_.state.getPointStateByIndex(index.globalIndex), typedLayer, vLineThickness);
    }
  }
  return index;
};


/**
 * Draws particular activity interval.
 * @param {anychart.core.resource.Resource.Activity} activity
 * @param {anychart.core.resource.Resource.ActivityInterval} interval
 * @param {anychart.PointState|number} state
 * @param {anychart.core.utils.TypedLayer} typedLayer
 * @param {number} vLineThickness
 * @private
 */
anychart.core.resource.Resource.prototype.drawInterval_ = function(activity, interval, state, typedLayer, vLineThickness) {
  var settings = /** @type {anychart.core.resource.Activities} */(this.chart_.activities());
  var path = interval.shape;
  var hatchPath = interval.hfShape;
  var fill = settings.resolveFill(activity.data, interval, state);
  var stroke = settings.resolveStroke(activity.data, interval, state);
  var hatchFill = settings.resolveHatchFill(activity.data, interval, state);

  var thickness = acgraph.vector.getThickness(stroke);
  var needsDrawing;
  if (path) {
    var oldThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(path.stroke()));
    needsDrawing = oldThickness == thickness;
  } else {
    path = interval.shape = /** @type {!acgraph.vector.Path} */(typedLayer.genNextChild());
    needsDrawing = true;
  }
  path.fill(fill);
  path.stroke(stroke);

  var needsHatchFillDrawing = false;
  if (hatchFill) {
    if (!hatchPath) {
      hatchPath = interval.hfShape = /** @type {acgraph.vector.Path} */(typedLayer.genNextChild());
      hatchPath.disablePointerEvents(true);
      needsHatchFillDrawing = true;
    }
    hatchPath.fill(hatchFill);
    hatchPath.stroke('none');
  } else if (hatchPath) { // we cannot clear here, because than we won't to have a way to know when to redraw
    hatchPath.fill('none');
  }

  var bounds = this.bounds_;
  var xScale = /** @type {anychart.scales.DateTimeWithCalendar} */(this.chart_.xScale());
  var maxOccupation = this.chart_.hasSharedYScale() ?
      this.chart_.getMaxOccupation() :
      this.maxOccupation_;

  var topVal = goog.isDef(interval.top) ? interval.top : activity.top;
  var hDiff = vLineThickness / 2 + thickness / 2;
  var left = anychart.utils.applyPixelShift(
      xScale.dateToPix(interval.start) + bounds.left,
      vLineThickness) + hDiff;
  var right = anychart.utils.applyPixelShift(
      xScale.dateToPix(interval.end + anychart.core.resource.Resource.DAY) + bounds.left,
      vLineThickness) - hDiff;
  var top = anychart.utils.applyPixelShift(
      topVal / maxOccupation * bounds.height + bounds.top + thickness / 2,
      thickness);
  if (topVal)
    top++;
  var bottom = anychart.utils.applyPixelShift(
      (topVal + interval.minutesPerDay) / maxOccupation * bounds.height + bounds.top - thickness / 2,
      thickness);

  if (needsDrawing) {
    path
        .clear()
        .moveTo(left, top)
        .lineTo(right, top)
        .lineTo(right, bottom)
        .lineTo(left, bottom)
        .close();
    path.tag = {
      series: this.chart_,
      index: interval.globalIndex
    };
  }

  if (needsHatchFillDrawing)
    hatchPath
        .clear()
        .moveTo(left, top)
        .lineTo(right, top)
        .lineTo(right, bottom)
        .lineTo(left, bottom)
        .close();

  settings.drawLabel(interval.visibleIndex, state,
      settings.createFormatProvider(interval, activity.data),
      new anychart.math.Rect(left, top, right - left, bottom - top),
      activity.data);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.resource.Resource.prototype.serialize = function() {
  var json = anychart.core.resource.Resource.base(this, 'serialize');
  return json;
};


/** @inheritDoc */
anychart.core.resource.Resource.prototype.setupByJSON = function(config) {
  anychart.core.resource.Resource.base(this, 'setupByJSON', config);
};


/** @inheritDoc */
anychart.core.resource.Resource.prototype.disposeInternal = function() {
  goog.disposeAll(this.calendar_);
  this.activities_ = null;
  this.chart_ = null;
  this.calendar_ = null;
  this.schedule_ = null;
  anychart.core.resource.Resource.base(this, 'disposeInternal');
};


//endregion
