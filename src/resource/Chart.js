goog.provide('anychart.resourceModule.Chart');
goog.require('anychart.core.Chart');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data');
goog.require('anychart.data.Iterator');
goog.require('anychart.format.Context');
goog.require('anychart.ganttBaseModule.Overlay');
goog.require('anychart.ganttBaseModule.TimeLineHeader');
goog.require('anychart.math.Rect');
goog.require('anychart.resourceModule.Activities');
goog.require('anychart.resourceModule.Calendar');
goog.require('anychart.resourceModule.Conflicts');
goog.require('anychart.resourceModule.Grid');
goog.require('anychart.resourceModule.Logo');
goog.require('anychart.resourceModule.Resource');
goog.require('anychart.resourceModule.ResourceList');
goog.require('anychart.resourceModule.Scale');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.userAgent');



/**
 * Resource chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.resourceModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.resourceModule.Chart.base(this, 'constructor');

  this.addThemes('resource');

  // it doesn't support other options
  this.interactivity()['hoverMode']('single')['selectionMode'](anychart.enums.SelectionMode.MULTI_SELECT);

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  /**
   * Dummy resource list bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.resourceListBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Resource list.
   * @type {anychart.resourceModule.ResourceList}
   * @private
   */
  this.resourceList_ = new anychart.resourceModule.ResourceList();
  this.resourceList_.target(this);
  this.resourceList_.listenSignals(this.handleResourceListSignal_, this);

  /**
   * Dummy time line bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.timeLineBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Time line.
   * @type {anychart.ganttBaseModule.TimeLineHeader}
   * @private
   */
  this.timeLine_ = new anychart.ganttBaseModule.TimeLineHeader();
  this.timeLine_.listenSignals(this.handleTimeLineSignal_, this);

  /**
   * Dummy logo bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.logoBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Logo.
   * @type {anychart.resourceModule.Logo}
   * @private
   */
  this.logo_ = new anychart.resourceModule.Logo();
  this.logo_.listenSignals(this.handleLogoSignal_, this);

  this.overlay_ = new anychart.ganttBaseModule.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);

  /**
   * Grid.
   * @type {anychart.resourceModule.Grid}
   * @private
   */
  this.grid_ = new anychart.resourceModule.Grid();
  this.grid_.listenSignals(this.handleGridSignal_, this);

  /**
   * X Scroll bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.xScrollBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * X scroll.
   * @type {anychart.core.ui.Scroller}
   * @private
   */
  this.xScroll_ = new anychart.core.ui.Scroller(true);
  this.setupCreated('horizontalScrollBar', this.xScroll_);
  this.xScroll_.listen(anychart.enums.EventType.SCROLLER_CHANGE, this.handleXScrollChange_, false, this);
  this.xScroll_.listenSignals(this.handleXScrollSignal_, this);

  /**
   * Y Scroll bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.yScrollBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Y scroll.
   * @type {anychart.core.ui.Scroller}
   * @private
   */
  this.yScroll_ = new anychart.core.ui.Scroller(true);
  this.setupCreated('verticalScrollBar', this.yScroll_);
  this.yScroll_.setOption('inverted', true);
  this.yScroll_.listen(anychart.enums.EventType.SCROLLER_CHANGE, this.handleYScrollChange_, false, this);
  this.yScroll_.listenSignals(this.handleYScrollSignal_, this);

  /**
   * Chart calendar.
   * @type {anychart.resourceModule.Calendar}
   * @private
   */
  this.calendar_ = new anychart.resourceModule.Calendar();
  // we do not listen calendar signals here: scale listens it, and we listen the scale

  /**
   * Date time scale.
   * @type {anychart.resourceModule.Scale}
   * @private
   */
  this.xScale_ = new anychart.resourceModule.Scale();
  this.xScale_.calendar(this.calendar_);
  this.xScale_.listenSignals(this.handleXScaleSignal_, this);

  this.setOption('currentStartDate', NaN);

  /**
   * Data X full pix width coord.
   * @type {number}
   * @private
   */
  this.fullPixWidth_ = NaN;

  /**
   * Current X start point pix coord.
   * @type {number}
   * @private
   */
  this.currentXStartPix_ = NaN;

  /**
   * Array of item heights cache.
   * @type {?Array.<number>}
   * @private
   */
  this.heights_ = null;

  /**
   * Array of bottom coords of rows. Effectively - a partial sum of heights_.
   * @type {?Array.<number>}
   * @private
   */
  this.bottoms_ = null;

  /**
   * Total pix height of all items.
   * @type {number}
   * @private
   */
  this.fullPixHeight_ = 0;

  /**
   * Current Y start point ratio position.
   * @type {number}
   * @private
   */
  this.currentYStartRatio_ = 0;

  /**
   * Events interceptor rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsInterceptor_ = null;

  /**
   * Dragger reference/
   * @type {anychart.resourceModule.Chart.Dragger}
   * @private
   */
  this.dragger_ = null;

  /**
   * Stores current zoom level index.
   * @type {number}
   * @private
   */
  this.zoomLevel_ = 0;

  /**
   * Resources list.
   * @type {Array.<anychart.resourceModule.Resource>}
   * @private
   */
  this.resources_ = [];

  /**
   * A list of activities cumulative count per resource.
   * E.g.: [n1, n1 + n2, n1 + n2 + n3, ...]
   * where ni-th is a number of activities in i-th resource.
   * @type {Array.<number>}
   */
  this.activitiesRegistry = [];

  /**
   * A map of interval visible index (also a label index) -> to activity global index.
   * @type {Array.<number>}
   * @private
   */
  this.intervalsRegistry_ = [];

  /**
   * Layer for resources.
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.resourcesLayer_ = null;

  /**
   * Max occupation.
   * @type {number}
   * @private
   */
  this.maxOccupation_ = 0;

  /**
   * If the Y scale should be shared among all resources.
   * @type {boolean}
   * @private
   */
  this.yScalePerChart_ = false;

  /**
   * If the Y scale should track availability along with activity.
   * @type {boolean}
   * @private
   */
  this.trackAvailability_ = false;

  /**
   * Resources clip.
   * @type {acgraph.vector.Clip}
   * @private
   */
  this.resourcesClip_ = null;

  /**
   * Cell padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.cellPadding_ = new anychart.core.utils.Padding();
  this.cellPadding_.listenSignals(this.handleCellPaddingSignals_, this);

  /**
   * Activities settings.
   * @type {anychart.resourceModule.Activities}
   * @private
   */
  this.activities_ = new anychart.resourceModule.Activities(this);
  this.activities_.listenSignals(this.handleActivitiesSignals_, this);

  /**
   * Conflicts settings.
   * @type {anychart.resourceModule.Conflicts}
   * @private
   */
  this.conflicts_ = new anychart.resourceModule.Conflicts(this);
  this.conflicts_.listenSignals(this.handleConflictsSignals_, this);

  this.data(opt_data || null, opt_csvSettings);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['pixPerHour', anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW],
    ['minRowHeight', anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW],
    ['resourceListWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['timeLineHeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['defaultMinutesPerDay', anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW],
    ['currentStartDate', anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW],
    ['splitterStroke', anychart.ConsistencyState.RESOURCE_SPLITTER, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.resourceModule.Chart, anychart.core.Chart);


//region --- Typedefs and consts
//------------------------------------------------------------------------------
//
//  Typedefs and consts
//
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *   id: (string|undefined),
 *   levels: Array.<anychart.ganttBaseModule.TimeLineHeader.Level>,
 *   unit: (anychart.enums.Interval|undefined),
 *   count: (number|undefined),
 *   unitPixSize: number
 * }}
 */
anychart.resourceModule.Chart.ZoomLevel;


//endregion
//region --- Chart Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Infrastructure Overrides
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.resourceModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.RESOURCE_RESOURCE_LIST |
    anychart.ConsistencyState.RESOURCE_TIME_LINE |
    anychart.ConsistencyState.RESOURCE_X_SCROLL |
    anychart.ConsistencyState.RESOURCE_Y_SCROLL |
    anychart.ConsistencyState.RESOURCE_GRID |
    anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION |
    anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE |
    anychart.ConsistencyState.RESOURCE_Y_RANGE |
    anychart.ConsistencyState.RESOURCE_DATA |
    anychart.ConsistencyState.RESOURCE_RESOURCES |
    anychart.ConsistencyState.RESOURCE_LOGO |
    anychart.ConsistencyState.RESOURCE_OVERLAY |
    anychart.ConsistencyState.RESOURCE_SPLITTER |
    anychart.ConsistencyState.RESOURCE_CONFLICTS;


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.RESOURCE;
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.getAllSeries = function() {
  return [];
};


//endregion
//region --- Private properties
//------------------------------------------------------------------------------
//
//  Private properties
//
//------------------------------------------------------------------------------
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.resourceModule.Chart.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.resourceModule.Chart.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.resourceModule.Chart.prototype.data_;


/**
 * Zoom levels storage.
 * @type {Array.<anychart.resourceModule.Chart.ZoomLevel>}
 * @private
 */
anychart.resourceModule.Chart.prototype.zoomLevels_;


//endregion
//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function pixPerHourNormalizer(opt_value) {
    var value = anychart.utils.toNumber(opt_value);
    return !isNaN(value) ? value : this.getOption('pixPerHour');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'pixPerHour',
      pixPerHourNormalizer);

  function minRowHeightNormalizer(opt_value) {
    var value = anychart.utils.toNumber(opt_value);
    return !isNaN(value) ? value : this.getOption('minRowHeight');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minRowHeight',
      minRowHeightNormalizer);

  function resourceListWidthNormalizer(opt_value) {
    var value = anychart.utils.normalizeNumberOrPercent(opt_value);
    return !goog.isNull(value) ? value : this.getOption('resourceListWidth');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'resourceListWidth',
      resourceListWidthNormalizer);

  function timeLineHeightNormalizer(opt_value) {
    var value = anychart.utils.normalizeNumberOrPercent(opt_value);
    return !goog.isNull(value) ? value : this.getOption('timeLineHeight');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'timeLineHeight',
      timeLineHeightNormalizer);

  function defaultMinutesPerDayNormalizer(opt_value) {
    return anychart.utils.normalizeToNaturalNumber(opt_value, 60);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'defaultMinutesPerDay',
      defaultMinutesPerDayNormalizer);

  function currentStartDateNormalizer(opt_value) {
    var date = anychart.format.parseDateTime(opt_value);
    return date ? date.getTime() : this.getOption('currentStartDate');
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'currentStartDate',
      currentStartDateNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'splitterStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.Chart, anychart.resourceModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.resourceModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.resourceModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Getter/setter for xScale.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.resourceModule.Scale|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_.setup(opt_value);
    return this;
  }
  return this.xScale_;
};


/**
 * Getter/setter for time tracking mode.
 * @param {(anychart.enums.TimeTrackingMode|string)=} opt_value
 * @return {anychart.resourceModule.Chart|anychart.enums.TimeTrackingMode}
 */
anychart.resourceModule.Chart.prototype.timeTrackingMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.enums.normalizeTimeTrackingMode(opt_value);
    var perChart =
        (value == anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART) ||
        (value == anychart.enums.TimeTrackingMode.ACTIVITY_PER_CHART);
    var availability =
        (value == anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART) ||
        (value == anychart.enums.TimeTrackingMode.AVAILABILITY_PER_RESOURCE);
    if (this.yScalePerChart_ != perChart || this.trackAvailability_ != availability) {
      this.yScalePerChart_ = perChart;
      this.trackAvailability_ = availability;
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.yScalePerChart_ ?
      (this.trackAvailability_ ?
          anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART :
          anychart.enums.TimeTrackingMode.ACTIVITY_PER_CHART) :
      (this.trackAvailability_ ?
          anychart.enums.TimeTrackingMode.AVAILABILITY_PER_RESOURCE :
          anychart.enums.TimeTrackingMode.ACTIVITY_PER_RESOURCE);
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.Chart|anychart.core.utils.Padding} .
 */
anychart.resourceModule.Chart.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom,
                                                          opt_rightOrRightAndLeft,
                                                          opt_bottom,
                                                          opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.cellPadding_.setup.apply(this.cellPadding_, arguments);
    return this;
  } else {
    return this.cellPadding_;
  }
};


/**
 * Conflicts settings getter/setter.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.resourceModule.Chart|anychart.resourceModule.Activities}
 */
anychart.resourceModule.Chart.prototype.activities = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.activities_.setup(opt_value);
    return this;
  }
  return this.activities_;
};


/**
 * Conflicts settings getter/setter.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.resourceModule.Chart|anychart.resourceModule.Conflicts}
 */
anychart.resourceModule.Chart.prototype.conflicts = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.conflicts_.setup(opt_value);
    return this;
  }
  return this.conflicts_;
};


/**
 * Getter/setter for calendar.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.resourceModule.Calendar|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.calendar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.calendar_.setup(opt_value);
    return this;
  }
  return this.calendar_;
};


/**
 * TimeLine getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.ganttBaseModule.TimeLineHeader|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.timeLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.timeLine_.setup(opt_value);
    return this;
  }
  return this.timeLine_;
};


/**
 * Logo getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.resourceModule.Chart|anychart.resourceModule.Logo}
 */
anychart.resourceModule.Chart.prototype.logo = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.logo_.setup(opt_value);
    return this;
  }
  return this.logo_;
};


/**
 * Grid getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.resourceModule.Grid|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.grid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.grid_.setup(opt_value);
    return this;
  }
  return this.grid_;
};


/**
 * X scroll getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Scroller|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.horizontalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScroll_.setup(opt_value);
    return this;
  }
  return this.xScroll_;
};


/**
 * Y scroll getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Scroller|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.yScroll_.setup(opt_value);
    return this;
  }
  return this.yScroll_;
};


/**
 * Getter/setter for the zoom levels set.
 * @param {Array.<anychart.resourceModule.Chart.ZoomLevel>=} opt_value
 * @return {Array.<anychart.resourceModule.Chart.ZoomLevel>|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.zoomLevels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      var val = [];
      for (var i = 0; i < opt_value.length; i++) {
        var level = this.normalizeZoomLevel_(opt_value[i]);
        if (level)
          val.push(level);
      }
      if (val.length) {
        this.zoomLevels_ = val;
        // this will reapply the level with the same id (or index, if no id)
        // and fallback to zero zoom level, if no level with the same id exists
        this.zoomLevel(/** @type {(number|string)} */(this.zoomLevel()));
      }
    }
    return this;
  }
  return /** @type {Array.<anychart.resourceModule.Chart.ZoomLevel>} */(anychart.utils.recursiveClone(this.zoomLevels_));
};


/**
 * If used as a setter - zooms chart to the level denoted by the passed index or identifier.
 * Else - returns current zoom level identifier or index, if no identifier specified at current
 * zoom level.
 * @param {(number|string)=} opt_indexOrId
 * @return {number|string|anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.zoomLevel = function(opt_indexOrId) {
  var level;
  if (goog.isDef(opt_indexOrId)) {
    var index = NaN;
    if (goog.isString(opt_indexOrId)) {
      for (var i = 0; i < this.zoomLevels_.length; i++) {
        level = this.zoomLevels_[i];
        if (level['id'] == opt_indexOrId) {
          index = i;
          break;
        }
      }
    }
    if (isNaN(index))
      index = anychart.utils.normalizeToNaturalNumber(opt_indexOrId, 0, true);
    level = this.zoomLevels_[index];
    if (level) {
      this.zoomLevel_ = index;
      this.setZoomLevel_(level);
    }
    return this;
  }
  level = this.zoomLevels_[this.zoomLevel_];
  return (level && level.id) ? level.id : this.zoomLevel_;
};


/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.resourceModule.Chart|anychart.ganttBaseModule.Overlay}
 */
anychart.resourceModule.Chart.prototype.overlay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.overlay_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.overlay_;
};


/**
 * Resource list element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.resourceModule.Chart|anychart.resourceModule.ResourceList}
 */
anychart.resourceModule.Chart.prototype.resourceList = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resourceList_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.resourceList_;
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Handles X Scale signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleXScaleSignal_ = function(e) {
  var state = 0;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION |
        anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.RESOURCE_TIME_LINE |
        anychart.ConsistencyState.RESOURCE_X_SCROLL |
        anychart.ConsistencyState.RESOURCE_GRID;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles Resource List signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleResourceListSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCE_LIST, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles Time Line signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleTimeLineSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIME_LINE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles lofo signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleLogoSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles grid signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleGridSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_GRID, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles X Scroll signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleXScrollSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCROLL, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles Y Scroll signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleYScrollSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_Y_SCROLL, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles cell padding invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleCellPaddingSignals_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles activities invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleActivitiesSignals_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCES, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles conflicts invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleConflictsSignals_ = function(e) {
  var state = anychart.ConsistencyState.RESOURCE_CONFLICTS;
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    state |= anychart.ConsistencyState.BOUNDS;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Selected range changing
//------------------------------------------------------------------------------
//
//  Selected range changing
//
//------------------------------------------------------------------------------
/**
 * Handles X Scroll change event.
 * @param {goog.events.Event} e
 * @return {boolean}
 * @private
 */
anychart.resourceModule.Chart.prototype.handleXScrollChange_ = function(e) {
  this.setOption('currentStartDate', this.xScale_.pixToDate(e['startRatio'] * this.fullPixWidth_ - this.currentXStartPix_));
  this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW);
  return false;
};


/**
 * Handles Y Scroll change event.
 * @param {goog.events.Event} e
 * @return {boolean}
 * @private
 */
anychart.resourceModule.Chart.prototype.handleYScrollChange_ = function(e) {
  this.currentYStartRatio_ = e['startRatio'];
  this.invalidate(anychart.ConsistencyState.RESOURCE_Y_RANGE, anychart.Signal.NEEDS_REDRAW);
  return false;
};


/**
 * Handles drag start.
 * @return {boolean}
 * @private
 */
anychart.resourceModule.Chart.prototype.dragStart_ = function() {
  // currently does nothing, but should unhover and start hover prevention
  return true;
};


/**
 * Drags the chart to passed position.
 * @param {number} x
 * @param {number} y
 * @private
 */
anychart.resourceModule.Chart.prototype.dragTo_ = function(x, y) {
  var xVal = this.xScale_.pixToDate(x - this.currentXStartPix_);
  var yVal = y / this.fullPixHeight_;
  this.suspendSignalsDispatching();
  if (xVal != this.getOption('currentStartDate')) {
    this.setOption('currentStartDate', xVal);
    this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
  if (yVal != this.currentYStartRatio_) {
    this.currentYStartRatio_ = yVal;
    this.invalidate(anychart.ConsistencyState.RESOURCE_Y_RANGE, anychart.Signal.NEEDS_REDRAW);
  }
  this.resumeSignalsDispatching(true);
};


/**
 * Handles drag end.
 * @return {boolean}
 * @private
 */
anychart.resourceModule.Chart.prototype.dragEnd_ = function() {
  // currently does nothing, but should finish hover prevention and rehover
  return true;
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.handleMouseWheel_ = function(e) {
  var dx = e.deltaX;
  var dy = e.deltaY;
  var prevent = false;
  if (goog.userAgent.WINDOWS) {
    dx = dx * 15;
    dy = dy * 15;
  } else if (dx) {
    prevent = true;
  }
  var x = -this.currentXStartPix_ - dx;
  var y = -this.currentYStartRatio_ * this.fullPixHeight_ - dy;
  x = -goog.math.clamp(x, -this.fullPixWidth_ + this.contentBounds.width, 0);
  y = -goog.math.clamp(y, -this.fullPixHeight_ + this.contentBounds.height, 0);
  var xVal = this.xScale_.pixToDate(x - this.currentXStartPix_);
  var yVal = y / this.fullPixHeight_;
  this.suspendSignalsDispatching();
  if (xVal != this.getOption('currentStartDate')) {
    this.setOption('currentStartDate', xVal);
    this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
  if (yVal != this.currentYStartRatio_) {
    prevent = true;
    this.currentYStartRatio_ = yVal;
    this.invalidate(anychart.ConsistencyState.RESOURCE_Y_RANGE, anychart.Signal.NEEDS_REDRAW);
  }
  if (prevent)
    e.preventDefault();
  this.resumeSignalsDispatching(true);
};


/**
 * Mousedown handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.resourceModule.Chart.prototype.initDragger_ = function(e) {
  this.dragger_ = new anychart.resourceModule.Chart.Dragger(this, this.plotLayer_, this.eventsInterceptor_);
  this.dragger_.startDrag(e.getOriginalEvent());
};


/**
 * Initializes mouse features.
 * @private
 */
anychart.resourceModule.Chart.prototype.initMouseWheel_ = function() {
  if (this.mouseInited_) return;
  var c = this.container();
  var stage;
  if (c && (stage = c.getStage())) {
    this.mouseInited_ = true;
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(stage.getDomWrapper());
    this.eventsHandler.listen(this.mouseWheelHandler_, goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_);
  } else if (!this.boundInitMouseWheel_) {
    this.boundInitMouseWheel_ = goog.bind(this.initMouseWheel_, this);
    setTimeout(this.boundInitMouseWheel_, 0);
  }
};


//endregion
//region --- Working with Zoom
//------------------------------------------------------------------------------
//
//  Working with Zoom
//
//------------------------------------------------------------------------------
/**
 * Returns normalized copy of a zoom level or null, if passed value
 * cannot be parsed as a level definition.
 * @param {?} value
 * @return {?anychart.resourceModule.Chart.ZoomLevel}
 * @private
 */
anychart.resourceModule.Chart.prototype.normalizeZoomLevel_ = function(value) {
  var rawLevels = value['levels'];
  if (!goog.isArray(rawLevels) || !rawLevels.length)
    return null;
  var levels = [];
  for (var i = 0; i < rawLevels.length; i++) {
    var level = goog.object.clone(rawLevels[i]);
    level['unit'] = anychart.enums.normalizeInterval(level['unit'], anychart.enums.Interval.DAY, true);
    level['count'] = anychart.utils.normalizeToNaturalNumber(level['count']);
    levels.push(level);
  }
  var unit = /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(value['unit'], levels[0]['unit'], true));
  var count = anychart.utils.normalizeToNaturalNumber(value['count'], levels[0]['count'], false);
  var pixSize = anychart.utils.toNumber(value['unitPixSize']) || 50;
  var id = value['id'] ? String(value['id']) : undefined;
  return {
    'id': id,
    'unit': unit,
    'count': count,
    'unitPixSize': pixSize,
    'levels': levels
  };
};


/**
 * Applies specified zoom level.
 * @param {anychart.resourceModule.Chart.ZoomLevel} level
 * @private
 */
anychart.resourceModule.Chart.prototype.setZoomLevel_ = function(level) {
  this.suspendSignalsDispatching();
  this.xScale_.unit(level['unit']);
  this.xScale_.count(level['count']);
  this.xScale_.unitPixSize(level['unitPixSize']);
  this.timeLine_.setLevels(level['levels']);
  this.resumeSignalsDispatching(true);
};


//endregion
//region --- Chart Drawing Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Drawing Infrastructure Overrides
//
//------------------------------------------------------------------------------
/**
 * Returns iterator that cannot read for the chart data.
 * @return {!anychart.resourceModule.Chart.ActivityIterator}
 */
anychart.resourceModule.Chart.prototype.getIterator = function() {
  if (!this.interactivityIterator_)
    this.interactivityIterator_ = new anychart.resourceModule.Chart.ActivityIterator(this);
  return this.interactivityIterator_;
};


/**
 * Returns attached reset data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.resourceModule.Chart.prototype.getResetIterator = function() {
  return this.getIterator().reset();
};


/**
 * Returns data iterator for the chart data.
 * @return {!anychart.data.Iterator}
 */
anychart.resourceModule.Chart.prototype.getDataIterator = function() {
  return this.data_.getIterator();
};


/**
 * Returns Resource max occupation.
 * @return {number}
 */
anychart.resourceModule.Chart.prototype.getMaxOccupation = function() {
  this.calculate();
  return this.maxOccupation_;
};


/**
 * Returns true, if the chart tracks availability.
 * @return {boolean}
 */
anychart.resourceModule.Chart.prototype.tracksAvailability = function() {
  return this.trackAvailability_;
};


/**
 * Returns true, if the Y scale is shared among resources.
 * @return {boolean}
 */
anychart.resourceModule.Chart.prototype.hasSharedYScale = function() {
  return this.yScalePerChart_;
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_DATA)) {
    this.xScale_.startAutoCalc();
    var iterator = this.getDataIterator();
    iterator.reset();
    var i = 0;
    var resource;
    var maxOccupation = 0;
    while (iterator.advance()) {
      resource = this.resources_[i];
      if (resource) {
        resource.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCE_DATA);
      } else {
        this.resources_[i] = resource = new anychart.resourceModule.Resource(this, i);
      }
      resource.extendXScale(this.xScale_);
      maxOccupation = Math.max(maxOccupation, resource.getMaxOccupation());
      i++;
    }
    for (i = iterator.getRowsCount(); i < this.resources_.length; i++)
      goog.dispose(this.resources_[i]);
    this.resources_.length = iterator.getRowsCount();
    this.xScale_.finishAutoCalc();
    this.maxOccupation_ = maxOccupation;
    this.heights_ = [];
    this.bottoms_ = [];
    this.fullPixHeight_ = 0;
    this.activitiesRegistry.length = 0;
    var activitiesCount = 0;
    var statusHeight = this.conflicts_.getOption('height');
    for (i = 0; i < this.resources_.length; i++) {
      resource = /** @type {anychart.resourceModule.Resource} */(this.resources_[i]);
      var occupation = this.yScalePerChart_ ? maxOccupation : resource.getMaxOccupation();
      var height = Math.max(/** @type {number} */ (this.getOption('pixPerHour')) * occupation / 60, /** @type {number} */ (this.getOption('minRowHeight')));
      height = this.cellPadding_.widenHeight(height);
      if (resource.hasConflicts) {
        height += statusHeight + anychart.resourceModule.Resource.ACTIVITIES_SPACING;
      }
      this.fullPixHeight_ += height;
      this.heights_.push(height);
      this.bottoms_.push(this.fullPixHeight_);
      activitiesCount += resource.getActivitiesCount();
      this.activitiesRegistry.push(activitiesCount);
    }
    this.resourceList_.setHeightsInternal(this.heights_);
    this.resourceList_.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DATA);
    this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE | anychart.ConsistencyState.RESOURCE_Y_RANGE);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_DATA);
  }
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.calculateContentAreaSpace = function(totalBounds) {
  var bounds = anychart.resourceModule.Chart.base(this, 'calculateContentAreaSpace', totalBounds);
  bounds = anychart.utils.applyPixelShiftToRect(bounds, 0);

  var splitterStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('splitterStroke'));
  var splitterStrokeThickness = splitterStroke ? acgraph.vector.getThickness(splitterStroke) : 0;

  var timeLineHeight = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('timeLineHeight')), bounds.height);
  var resourceListWidth = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('resourceListWidth')), bounds.width);

  var cbTop = anychart.utils.applyPixelShift(bounds.top + timeLineHeight, 0);
  var cbLeft = anychart.utils.applyPixelShift(bounds.left + resourceListWidth + splitterStrokeThickness, 0);

  timeLineHeight = cbTop - bounds.top;
  resourceListWidth = cbLeft - bounds.left - splitterStrokeThickness;

  this.timeLineBounds_.top = bounds.top;
  this.timeLineBounds_.left = cbLeft;
  this.timeLineBounds_.width = bounds.left + bounds.width - cbLeft;
  this.timeLineBounds_.height = timeLineHeight;
  this.resourceListBounds_.left = bounds.left;
  this.resourceListBounds_.top = cbTop;
  this.resourceListBounds_.width = resourceListWidth;
  this.resourceListBounds_.height = bounds.top + bounds.height - cbTop;
  this.logoBounds_.top = bounds.top;
  this.logoBounds_.left = bounds.left;
  this.logoBounds_.width = resourceListWidth;
  this.logoBounds_.height = timeLineHeight;
  bounds.left = cbLeft;
  bounds.top = cbTop;
  bounds.width = this.timeLineBounds_.width;
  bounds.height = this.resourceListBounds_.height;

  return bounds;
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.drawContent = function(bounds) {
  this.calculate();
  if (this.isConsistent()) {
    return;
  }

  anychart.core.Base.suspendSignalsDispatching(this.xScroll_,
      this.yScroll_, this.timeLine_, this.resourceList_, this.grid_, this.conflicts_);

  if (!this.plotLayer_) {
    this.plotLayer_ = this.rootElement.layer();
    this.plotLayer_.zIndex(3);
    this.eventsHandler.listenOnce(this.plotLayer_, acgraph.events.EventType.MOUSEDOWN, this.initDragger_);
    this.eventsHandler.listenOnce(this.plotLayer_, acgraph.events.EventType.TOUCHSTART, this.initDragger_);

    this.resourcesClip_ = acgraph.clip();
    this.plotLayer_.clip(this.resourcesClip_);

    this.eventsInterceptor_ = this.plotLayer_.rect();
    this.eventsInterceptor_.zIndex(-1);
    this.eventsInterceptor_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.eventsInterceptor_.stroke(null);

    this.resourcesLayer_ = new anychart.core.utils.TypedLayer(
        function() {
          return acgraph.path();
        },
        function(path) {
          (/** @type {acgraph.vector.Path} */(path)).clear();
        });
    this.resourcesLayer_.parent(this.plotLayer_);
    this.resourcesLayer_.zIndex(3);

    this.splitterLine_ = this.rootElement.path();
    this.splitterLine_.zIndex(3);
  }

  this.initMouseWheel_();

  if (this.hasInvalidationState(
      anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION |
          anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE)) {
    this.resourcesClip_.shape(bounds);
    this.eventsInterceptor_.setBounds(bounds);
    this.invalidate(
        anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION |
        anychart.ConsistencyState.RESOURCE_RESOURCE_LIST |
        anychart.ConsistencyState.RESOURCE_TIME_LINE |
        anychart.ConsistencyState.RESOURCE_X_SCROLL |
        anychart.ConsistencyState.RESOURCE_Y_SCROLL |
        anychart.ConsistencyState.RESOURCE_Y_RANGE |
        anychart.ConsistencyState.RESOURCE_RESOURCES |
        anychart.ConsistencyState.RESOURCE_GRID |
        anychart.ConsistencyState.RESOURCE_LOGO |
        anychart.ConsistencyState.RESOURCE_OVERLAY |
        anychart.ConsistencyState.RESOURCE_CONFLICTS |
        anychart.ConsistencyState.RESOURCE_SPLITTER);
  }

  var startPosition, endPosition;
  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE)) {
    if (isNaN(this.getOption('currentStartDate'))) {
      //possible problem with no data
      this.setOption('currentStartDate', /** @type {number} */(this.xScale_.minimum()));
      this.xScale_.startDate(/** @type {number} */ (this.getOption('currentStartDate')));
    }
    var min = this.xScale_.dateToPix(/** @type {number} */(this.xScale_.minimum()));
    var max = this.xScale_.dateToPix(/** @type {number} */(this.xScale_.maximum()));
    this.fullPixWidth_ = max - min;
    startPosition = this.xScale_.dateToPix(/** @type {number} */ (this.getOption('currentStartDate')));
    if (isNaN(startPosition)) startPosition = min;
    endPosition = startPosition + bounds.width;
    if (endPosition > max) {
      if (bounds.width < this.fullPixWidth_) {
        endPosition = max;
        startPosition = endPosition - bounds.width;
      } else {
        startPosition = min;
        endPosition = min + this.fullPixWidth_;
      }
    }
    this.setOption('currentStartDate', this.xScale_.pixToDate(startPosition));
    this.markConsistent(anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION)) {
    this.xScale_.startDate(/** @type {number} */ (this.getOption('currentStartDate')));
    this.currentXStartPix_ = -this.xScale_.dateToPix(/** @type {number} */(this.xScale_.minimum()));
    this.xScroll_.setRangeInternal(
        this.currentXStartPix_ / this.fullPixWidth_,
        (this.currentXStartPix_ + bounds.width) / this.fullPixWidth_
    );
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_Y_RANGE)) {
    startPosition = this.currentYStartRatio_ * this.fullPixHeight_;
    endPosition = startPosition + bounds.height;
    if (endPosition > this.fullPixHeight_) {
      if (bounds.height < this.fullPixHeight_) {
        endPosition = this.fullPixHeight_;
        startPosition = endPosition - bounds.height;
      } else {
        startPosition = 0;
        endPosition = this.fullPixHeight_;
      }
    }
    this.currentYStartRatio_ = startPosition / this.fullPixHeight_ || 0;
    this.resourceList_.verticalScrollBarPosition(this.currentYStartRatio_);
    this.grid_.verticalScrollBarPosition(this.currentYStartRatio_);
    this.yScroll_.setRangeInternal(this.currentYStartRatio_, endPosition / this.fullPixHeight_ || 0);
    this.invalidate(
        anychart.ConsistencyState.RESOURCE_RESOURCE_LIST |
        anychart.ConsistencyState.RESOURCE_Y_SCROLL |
        anychart.ConsistencyState.RESOURCE_GRID |
        anychart.ConsistencyState.RESOURCE_CONFLICTS |
        anychart.ConsistencyState.RESOURCE_RESOURCES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION | anychart.ConsistencyState.RESOURCE_Y_RANGE)) {
    this.xScroll_.parentBounds(bounds);
    this.yScroll_.parentBounds(this.xScroll_.getRemainingBounds());
    var boundsWithoutScroll = this.yScroll_.getRemainingBounds();
    this.xScrollBounds_ = boundsWithoutScroll.clone();
    this.xScrollBounds_.height = bounds.height;
    this.yScrollBounds_ = boundsWithoutScroll.clone();
    this.yScrollBounds_.width = bounds.width;
    this.markConsistent(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION | anychart.ConsistencyState.RESOURCE_Y_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_X_SCROLL)) {
    this.xScroll_.container(this.rootElement);
    this.xScroll_.parentBounds(this.xScrollBounds_);
    this.xScroll_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_X_SCROLL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_Y_SCROLL)) {
    this.yScroll_.container(this.rootElement);
    this.yScroll_.parentBounds(this.yScrollBounds_);
    this.yScroll_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_Y_SCROLL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LOGO)) {
    this.logo_.container(this.rootElement);
    this.logo_.parentBounds(this.logoBounds_);
    this.logo_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LOGO);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_TIME_LINE)) {
    this.timeLine_.xScale(/** @type {anychart.resourceModule.Scale} */(this.xScale()));
    this.timeLine_.container(this.rootElement);
    this.timeLine_.parentBounds(this.timeLineBounds_);
    this.timeLine_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIME_LINE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_SPLITTER)) {
    var splitterStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('splitterStroke'));
    var splitterStrokeThickness = splitterStroke ? acgraph.vector.getThickness(splitterStroke) : 0;

    var splitterPosition = anychart.utils.applyPixelShift(this.resourceListBounds_.getRight() + splitterStrokeThickness / 2, splitterStrokeThickness);
    this.splitterLine_
        .clear()
        .moveTo(splitterPosition, this.timeLineBounds_.top)
        .lineTo(splitterPosition, bounds.getBottom())
        .stroke(splitterStroke);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_SPLITTER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_OVERLAY)) {
    this.overlay_.target(this.container().getStage().getDomWrapper());
    this.overlay_.setBounds(this.getPixelBounds());
    this.overlay_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_OVERLAY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_RESOURCE_LIST)) {
    this.resourceList_.parentBounds(this.resourceListBounds_);
    this.resourceList_.container(this.rootElement);
    this.resourceList_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_RESOURCE_LIST);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_GRID)) {
    this.grid_.xScale(/** @type {anychart.resourceModule.Scale} */(this.xScale()));
    this.grid_.container(this.plotLayer_);
    this.grid_.parentBounds(bounds);
    this.grid_.heights(this.heights_);
    this.grid_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_GRID);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_RESOURCES | anychart.ConsistencyState.RESOURCE_CONFLICTS)) {
    var hT = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.grid_.getOption('horizontalStroke')));
    var b = bounds.clone();
    var l = this.xScale_.pixToDate(0);
    var r = this.xScale_.pixToDate(bounds.width);
    var from;
    var to = anychart.utils.applyPixelShift(
        Math.round(bounds.top - this.currentYStartRatio_ * this.fullPixHeight_),
        hT);
    this.resourcesLayer_.clear();
    this.conflicts_.clear();
    this.activities_.prepareLabels(this.plotLayer_, bounds);
    this.intervalsRegistry_.length = 0;
    var index = {
      globalIndex: 0,
      registry: this.intervalsRegistry_
    };
    var vLineThickness = acgraph.vector.getThickness(
        /** @type {acgraph.vector.Stroke} */(this.grid_.getOption('verticalStroke')));
    for (var i = 0; i < this.resources_.length; i++) {
      var h = this.heights_[i];
      from = to;
      to = anychart.utils.applyPixelShift(to + h, hT);
      var tp = anychart.utils.normalizeSize(/** @type {number|string} */(this.cellPadding_.getOption('top')), h);
      var bp = anychart.utils.normalizeSize(/** @type {number|string} */(this.cellPadding_.getOption('bottom')), h);
      b.top = from + hT / 2 + tp;
      b.height = to - hT / 2 - bp - b.top;
      index = (/** @type {anychart.resourceModule.Resource} */(this.resources_[i])).draw(index, l, r, this.resourcesLayer_, b.clone(), vLineThickness);
    }
    this.activities_.drawLabels();
    this.conflicts_.container(this.plotLayer_);
    this.conflicts_.parentBounds(bounds);
    this.conflicts_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_RESOURCES | anychart.ConsistencyState.RESOURCE_CONFLICTS);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.xScroll_,
      this.yScroll_, this.timeLine_, this.resourceList_, this.grid_, this.conflicts_);
};


/**
 * Returns global activity index by the resource index and the activity index.
 * @param {number} resourceIndex
 * @param {number} activityIndex
 * @return {number}
 */
anychart.resourceModule.Chart.prototype.getGlobalActivityIndex = function(resourceIndex, activityIndex) {
  return (this.activitiesRegistry[resourceIndex - 1] || 0) + activityIndex;
};


//endregion
//region --- Interactivity methods
//------------------------------------------------------------------------------
//
//  IInteractiveSeries methods
//
//------------------------------------------------------------------------------
/**
 * Internal dummy getter/setter for Resource chart hover mode.
 * @param {anychart.enums.HoverMode=} opt_value Hover mode.
 * @return {anychart.resourceModule.Chart|anychart.enums.HoverMode} .
 */
anychart.resourceModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


/**
 * Internal dummy getter/setter for Resource chart selection mode.
 * @param {anychart.enums.SelectionMode=} opt_value Hover mode.
 * @return {anychart.resourceModule.Chart|anychart.enums.SelectionMode} .
 */
anychart.resourceModule.Chart.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectMode_) {
      this.selectMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode} */(this.selectMode_);
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.isSeries = function() {
  return true;
};


/**
 * Interface method.
 * @return {boolean}
 */
anychart.resourceModule.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Interface method.
 * @return {boolean}
 */
anychart.resourceModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.getPoint = function(index) {
  return null;
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.resourceModule.Chart.prototype.applyAppearanceToSeries = function(pointState) {
  var iter = this.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var vLineThickness = acgraph.vector.getThickness(
      /** @type {acgraph.vector.Stroke} */(this.grid_.getOption('verticalStroke')));
  this.resources_[resourceIndex].updateActivity(activityIndex, /** @type {anychart.PointState} */(pointState), this.resourcesLayer_, vLineThickness);
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  var iter = this.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var vLineThickness = acgraph.vector.getThickness(
      /** @type {acgraph.vector.Stroke} */(this.grid_.getOption('verticalStroke')));
  this.resources_[resourceIndex].updateActivity(activityIndex, /** @type {anychart.PointState} */(pointState), this.resourcesLayer_, vLineThickness);

  return opt_value;
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.finalizePointAppearance = goog.nullFunction;


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);

  var tag = anychart.utils.extractTag(res['domTarget']);
  var pointIndex = anychart.utils.toNumber(tag.index);
  if (!isNaN(pointIndex)) {
    res['pointIndex'] = pointIndex;
  }
  return res;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.resourceModule.Chart.prototype.makePointEvent = function(event) {
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
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex = NaN;
  if ('pointIndex' in event) {
    pointIndex = anychart.utils.toNumber(event['pointIndex']);
  } else {
    if ('labelIndex' in event) {
      pointIndex = event['labelIndex'];
    } else if ('markerIndex' in event) {
      pointIndex = event['markerIndex'];
    }
    pointIndex = this.intervalsRegistry_[anychart.utils.toNumber(pointIndex)];
  }
  event['pointIndex'] = pointIndex;

  var iter = this.getIterator();
  var resourceIndex, activityIndex, activity;
  if (iter.select(pointIndex)) {
    resourceIndex = iter.getResourceIndex();
    activityIndex = iter.getActivityIndex();
    activity = this.resources_[resourceIndex].getActivity(activityIndex);
  } else {
    resourceIndex = activityIndex = NaN;
    activity = null;
  }

  return {
    'type': type,
    'actualTarget': event['target'],
    'target': this,
    'originalEvent': event,
    'resourceIndex': resourceIndex,
    'activityIndex': activityIndex,
    'pointIndex': pointIndex,
    'data': activity.data,
    'chart': this
  };
};


/**
 * Hovers an activity determined by the resourceIndex and the activityIndex.
 * @param {number} resourceIndex
 * @param {number} activityIndex
 * @return {anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.hover = function(resourceIndex, activityIndex) {
  this.hoverPoint(this.getGlobalActivityIndex(resourceIndex, activityIndex));
  return this;
};


/**
 * Hovers activity by its global index.
 * @param {number} globalIndex
 * @return {anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.hoverPoint = function(globalIndex) {
  this.unhover();
  this.state.addPointState(anychart.PointState.HOVER, globalIndex);
  return this;
};


/**
 * Removes hover from the series or activity by index.
 * @param {(number|Array.<number>)=} opt_resourceIndex
 * @param {number=} opt_activityIndex
 */
anychart.resourceModule.Chart.prototype.unhover = function(opt_resourceIndex, opt_activityIndex) {
  var index;
  if (goog.isDef(opt_resourceIndex))
    index = this.getGlobalActivityIndex(+opt_resourceIndex, +opt_activityIndex);
  else
    index = NaN;
  this.state.removePointState(anychart.PointState.HOVER, index);
};


/**
 * Selects an activity determined by the resourceIndex and the activityIndex.
 * @param {number} resourceIndex
 * @param {number} activityIndex
 * @return {anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.select = function(resourceIndex, activityIndex) {
  this.selectPoint(this.getGlobalActivityIndex(resourceIndex, activityIndex));
  return this;
};


/**
 * Selects activity by its global index.
 * @param {number} globalIndex
 * @param {anychart.core.MouseEvent=} opt_event
 * @return {anychart.resourceModule.Chart}
 */
anychart.resourceModule.Chart.prototype.selectPoint = function(globalIndex, opt_event) {
  var unselect = !(opt_event && opt_event.shiftKey);
  this.state.setPointState(anychart.PointState.SELECT, globalIndex, unselect ? anychart.PointState.HOVER : undefined);
  return this;
};


/**
 * Removes select from the series or activity by index.
 * @param {(number|Array.<number>)=} opt_resourceIndex
 * @param {number=} opt_activityIndex
 */
anychart.resourceModule.Chart.prototype.unselect = function(opt_resourceIndex, opt_activityIndex) {
  var index;
  if (goog.isDef(opt_resourceIndex))
    index = this.getGlobalActivityIndex(+opt_resourceIndex, +opt_activityIndex);
  else
    index = NaN;
  this.state.removePointState(anychart.PointState.SELECT, index);
};


//endregion
//region --- Working with tooltip
//------------------------------------------------------------------------------
//
//  Working with tooltip
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Creates tooltip context provider.
 * @return {anychart.format.Context}
 */
anychart.resourceModule.Chart.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    /**
     * Tooltip context cache.
     * @type {anychart.format.Context}
     * @protected
     */
    this.tooltipContext = new anychart.format.Context();
  }

  var iter = this.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var resource = this.getResource(resourceIndex);
  var activity = resource.getActivity(activityIndex);
  var iterator = this.getDataIterator();
  iterator.select(resourceIndex);
  var start = Infinity;
  var end = -Infinity;
  var intervals = [];
  for (var i = 0; i < activity.intervals.length; i++) {
    var interval = activity.intervals[i];
    start = Math.min(start, interval.start);
    end = Math.max(end, interval.end);
    intervals.push({
      'start': interval.start,
      'end': interval.end,
      'minutesPerDay': interval.minutesPerDay
    });
  }

  var values = {
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'resourceIndex': {value: resourceIndex, type: anychart.enums.TokenType.NUMBER},
    'activityIndex': {value: activityIndex, type: anychart.enums.TokenType.NUMBER},
    'activity': {value: activity.data, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: activity.data['name'], type: anychart.enums.TokenType.STRING},
    'intervals': {value: intervals, type: anychart.enums.TokenType.UNKNOWN},
    'start': {value: start, type: anychart.enums.TokenType.NUMBER},
    'end': {value: end, type: anychart.enums.TokenType.NUMBER},
    'minutesPerDay': {value: (intervals.length == 1) ? intervals[0]['minutesPerDay'] : NaN, type: anychart.enums.TokenType.NUMBER}
  };

  var tokenCustomValues = {
    '%start': {value: new Date(start), type: anychart.enums.TokenType.DATE_TIME},
    '%end': {value: new Date(end), type: anychart.enums.TokenType.DATE_TIME}
  };

  this.tooltipContext
      .statisticsSources([this])
      .dataSource(iterator)
      .tokenCustomValues(tokenCustomValues);

  return /** @type {anychart.format.Context} */ (this.tooltipContext.propagate(values));
};


/**
 * Returns resource by index.
 * @param {number} index
 * @return {anychart.resourceModule.Resource}
 */
anychart.resourceModule.Chart.prototype.getResource = function(index) {
  return this.resources_[index] || null;
};


//endregion
//region --- No data label
/**
 * Is there no data on the chart.
 * @return {boolean}
 */
anychart.resourceModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getDataIterator().getRowsCount();
  return (!rowsCount);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Chart.prototype.serialize = function() {
  var json = anychart.resourceModule.Chart.base(this, 'serialize');
  json['data'] = this.data_ ? this.data_.serialize() : null;
  json['zoomLevels'] = this.zoomLevels();
  json['zoomLevel'] = this.zoomLevel();
  json['timeLine'] = this.timeLine_.serialize();
  json['calendar'] = this.calendar_.serialize();
  json['xScale'] = this.xScale_.serialize();
  json['resourceList'] = this.resourceList_.serialize();
  json['horizontalScrollBar'] = this.xScroll_.serialize();
  json['verticalScrollBar'] = this.yScroll_.serialize();
  json['grid'] = this.grid_.serialize();
  json['timeTrackingMode'] = this.timeTrackingMode();
  json['overlay'] = this.overlay_.serialize();
  json['cellPadding'] = this.cellPadding_.serialize();
  json['conflicts'] = this.conflicts_.serialize();
  anychart.core.settings.serialize(this, anychart.resourceModule.Chart.PROPERTY_DESCRIPTORS, json);
  return {'chart': json};
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.Chart.base(this, 'setupByJSON', config);
  if ('cellPadding' in config)
    this.cellPadding_.setup(config['cellPadding']);
  this.activities_.setupInternal(!!opt_default, config['activities']);
  this.data(config['data']);
  this.logo_.setupInternal(!!opt_default, config['logo']);
  this.overlay_.setupInternal(!!opt_default, config['overlay']);
  this.timeLine_.setupInternal(!!opt_default, config['timeLine']);
  this.calendar_.setup(config['calendar']);
  this.xScale_.setup(config['xScale']);
  this.resourceList_.setup(config['resourceList']);
  this.xScroll_.setup(config['horizontalScrollBar']);
  this.yScroll_.setup(config['verticalScrollBar']);
  this.grid_.setup(config['grid']);
  this.zoomLevels(config['zoomLevels']);
  this.zoomLevel(config['zoomLevel']);
  this.timeTrackingMode(config['timeTrackingMode']);
  this.conflicts(config['conflicts']);
  anychart.core.settings.deserialize(this, anychart.resourceModule.Chart.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.dragger_,
      this.eventsInterceptor_,
      this.parentViewToDispose_,
      this.timeLine_,
      this.logo_,
      this.resourceList_,
      this.xScroll_,
      this.yScroll_,
      this.grid_,
      this.resources_,
      this.calendar_,
      this.xScale_,
      this.overlay_,
      this.conflicts_);

  delete this.data_;
  this.dragger_ =
      this.eventsInterceptor_ =
          this.parentViewToDispose_ =
              this.rawData_ =
                  this.timeLine_ =
                      this.logo_ =
                          this.resourceList_ =
                              this.xScroll_ =
                                  this.yScroll_ =
                                      this.grid_ =
                                          this.resources_ =
                                              this.calendar_ =
                                                  this.xScale_ =
                                                      this.overlay_ =
                                                          this.conflicts_ = null;

  anychart.resourceModule.Chart.base(this, 'disposeInternal');
};



//endregion
//region --- Dragger
//----------------------------------------------------------------------------------------------------------------------
//
//  Dragger
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Dragger for Resource Chart.
 * @param {anychart.resourceModule.Chart} chart
 * @param {acgraph.vector.Element} target
 * @param {acgraph.vector.Rect} boundsProvider
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.resourceModule.Chart.Dragger = function(chart, target, boundsProvider) {
  anychart.resourceModule.Chart.Dragger.base(this, 'constructor', target.domElement());

  /**
   * Target rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = boundsProvider;

  /**
   * Chart reference.
   * @type {anychart.resourceModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Frame descriptor.
   * @type {number|undefined}
   * @private
   */
  this.frame_ = undefined;

  /**
   * Frame function.
   * @type {!function(number)}
   * @private
   */
  this.frameAction_ = goog.bind(function(time) {
    this.frame_ = undefined;
    this.chart_.dragTo_(this.frameX_, this.frameY_);
  }, this);

  this.setHysteresis(3);

  this.listen(goog.fx.Dragger.EventType.START, this.dragStartHandler_, false, this);
  this.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
};
goog.inherits(anychart.resourceModule.Chart.Dragger, goog.fx.Dragger);


/**
 * X coord to pass to the chart in next frame.
 * @type {number}
 * @private
 */
anychart.resourceModule.Chart.Dragger.prototype.frameX_;


/**
 * Y coord to pass to the chart in next frame.
 * @type {number}
 * @private
 */
anychart.resourceModule.Chart.Dragger.prototype.frameY_;


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.resourceModule.Chart.Dragger.prototype.dragStartHandler_ = function(e) {
  return this.chart_.dragStart_();
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.resourceModule.Chart.Dragger.prototype.dragEndHandler_ = function(e) {
  if (goog.isDef(this.frame_)) {
    anychart.window.cancelAnimationFrame(this.frame_);
    this.frameAction_(0);
  }
  this.chart_.dragEnd_();
};


/** @inheritDoc */
anychart.resourceModule.Chart.Dragger.prototype.computeInitialPosition = function() {
  var w = this.rect_.getWidth();
  this.deltaX = -this.chart_.currentXStartPix_;
  this.limits.left = -this.chart_.fullPixWidth_ + w;
  this.limits.width = this.chart_.fullPixWidth_ - w;

  var h = this.rect_.getHeight();
  this.deltaY = -this.chart_.currentYStartRatio_ * this.chart_.fullPixHeight_;
  this.limits.top = -this.chart_.fullPixHeight_ + h;
  this.limits.height = this.chart_.fullPixHeight_ - h;
};


/** @inheritDoc */
anychart.resourceModule.Chart.Dragger.prototype.defaultAction = function(x, y) {
  this.frameX_ = -x;
  this.frameY_ = -y;
  if (goog.isDef(this.frame_))
    anychart.window.cancelAnimationFrame(this.frame_);
  this.frame_ = anychart.window.requestAnimationFrame(this.frameAction_);
};



//endregion
//region --- ActivityIterator
//------------------------------------------------------------------------------
//
//  ActivityIterator
//
//------------------------------------------------------------------------------
/**
 * Iterator for array with interface common to data.Iterator.
 * Need mostly to keep in with InteractivityState.
 * @param {anychart.resourceModule.Chart} chart
 * @extends {anychart.data.Iterator}
 * @constructor
 */
anychart.resourceModule.Chart.ActivityIterator = function(chart) {
  /**
   * Chart reference.
   * @type {anychart.resourceModule.Chart}
   * @private
   */
  this.chart_ = chart;

  this.reset();
};
goog.inherits(anychart.resourceModule.Chart.ActivityIterator, anychart.data.Iterator);


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.reset = function() {
  /**
   * Current resource index.
   * @type {number}
   */
  this.currResource = 0;
  this.currentActivityIndex = this.currentIndex = -1;
  return this;
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.select = function(index) {
  this.currentIndex = index;
  var ind = goog.array.binarySearch(this.chart_.activitiesRegistry, index);
  if (ind < 0) {
    this.currResource = ~ind;
  } else {
    while (this.chart_.activitiesRegistry[++ind] == index) {}
    this.currResource = ind;
  }
  var cutOff = this.chart_.activitiesRegistry[this.currResource - 1] || 0;
  this.currentActivityIndex = this.currentIndex - cutOff;
  return this.currResource < this.chart_.activitiesRegistry.length;
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.advance = function() {
  this.currentIndex++;
  var rowsCount = this.chart_.activitiesRegistry.length;
  var limit, cutOff = NaN;
  while (this.currResource < rowsCount &&
      this.currentIndex >= (limit = this.chart_.activitiesRegistry[this.currResource])) {
    cutOff = limit;
    this.currResource++;
  }
  if (isNaN(cutOff))
    cutOff = this.chart_.activitiesRegistry[this.currResource - 1] || 0;
  this.currentActivityIndex = this.currentIndex - cutOff;
  return this.currResource < rowsCount;
};


/**
 * Returns current resource index.
 * @return {number}
 */
anychart.resourceModule.Chart.ActivityIterator.prototype.getResourceIndex = function() {
  return +this.currResource;
};


/**
 * Returns current activity index of the current resource
 * @return {number}
 */
anychart.resourceModule.Chart.ActivityIterator.prototype.getActivityIndex = function() {
  return this.currentActivityIndex;
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.getIndex = function() {
  return this.currentIndex;
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.getRowsCount = function() {
  return this.chart_.activitiesRegistry[this.chart_.activitiesRegistry.length - 1] || 0;
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.get = function() {
  throw 'Cannot use get on ActivityIterator';
};


/** @inheritDoc */
anychart.resourceModule.Chart.ActivityIterator.prototype.meta = function(name, opt_value) {
  throw 'Cannot use meta on ActivityIterator';
};


//endregion
//region --- CSV
//------------------------------------------------------------------------------
//
//  CSV
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.resourceModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  // only RAW is supported
  var result = this.getRawCsvData();
  return anychart.utils.serializeCsv(result.headers, result.data, opt_csvSettings);
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.resourceModule.Chart.prototype;
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['timeTrackingMode'] = proto.timeTrackingMode;
  proto['cellPadding'] = proto.cellPadding;
  proto['zoomLevels'] = proto.zoomLevels;
  proto['zoomLevel'] = proto.zoomLevel;
  proto['xScale'] = proto.xScale;
  proto['horizontalScrollBar'] = proto.horizontalScrollBar;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['grid'] = proto.grid;
  proto['logo'] = proto.logo;
  proto['timeLine'] = proto.timeLine;
  proto['calendar'] = proto.calendar;
  proto['overlay'] = proto.overlay;
  proto['activities'] = proto.activities;
  proto['conflicts'] = proto.conflicts;
  proto['resourceList'] = proto.resourceList;
  proto['hover'] = proto.hover;
  proto['hoverPoint'] = proto.hoverPoint;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.select;
  proto['selectPoint'] = proto.selectPoint;
  proto['unselect'] = proto.unselect;
  proto['noData'] = proto.noData;
  // auto generated
  //proto['pixPerHour'] = proto.pixPerHour;
  //proto['minRowHeight'] = proto.minRowHeight;
  //proto['resourceListWidth'] = proto.resourceListWidth;
  //proto['timeLineHeight'] = proto.timeLineHeight;
  //proto['defaultMinutesPerDay'] = proto.defaultMinutesPerDay;
  //proto['splitterStroke'] = proto.splitterStroke;
  //proto['currentStartDate'] = proto.currentStartDate;
})();


//endregion
