goog.provide('anychart.charts.Resource');
goog.require('anychart.core.Chart');
goog.require('anychart.core.resource.Activities');
goog.require('anychart.core.resource.Conflicts');
goog.require('anychart.core.resource.Grid');
goog.require('anychart.core.resource.Logo');
goog.require('anychart.core.resource.Resource');
goog.require('anychart.core.resource.ResourceList');
goog.require('anychart.core.resource.TimeLine');
goog.require('anychart.core.ui.Overlay');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.ResourceChartContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data');
goog.require('anychart.data.Iterator');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.Calendar');
goog.require('anychart.scales.DateTimeWithCalendar');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.userAgent');



/**
 * Resource chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.Chart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.charts.Resource = function(opt_data, opt_csvSettings) {
  anychart.charts.Resource.base(this, 'constructor');

  // it doesn't support other options
  this.interactivity().hoverMode('single').selectionMode('multiSelect');

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
   * @type {anychart.core.resource.ResourceList}
   * @private
   */
  this.resourceList_ = new anychart.core.resource.ResourceList();
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
   * @type {anychart.core.resource.TimeLine}
   * @private
   */
  this.timeLine_ = new anychart.core.resource.TimeLine();
  this.timeLine_.listenSignals(this.handleTimeLineSignal_, this);

  /**
   * Dummy logo bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.logoBounds_ = new anychart.math.Rect(0, 0, 0, 0);

  /**
   * Logo.
   * @type {anychart.core.resource.Logo}
   * @private
   */
  this.logo_ = new anychart.core.resource.Logo();
  this.logo_.listenSignals(this.handleLogoSignal_, this);

  this.overlay_ = new anychart.core.ui.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);

  /**
   * Grid.
   * @type {anychart.core.resource.Grid}
   * @private
   */
  this.grid_ = new anychart.core.resource.Grid();
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
  this.yScroll_.inverted(true);
  this.yScroll_.listen(anychart.enums.EventType.SCROLLER_CHANGE, this.handleYScrollChange_, false, this);
  this.yScroll_.listenSignals(this.handleYScrollSignal_, this);

  /**
   * Chart calendar.
   * @type {anychart.scales.Calendar}
   * @private
   */
  this.calendar_ = new anychart.scales.Calendar();
  // we do not listen calendar signals here: scale listens it, and we listen the scale

  /**
   * Date time scale.
   * @type {anychart.scales.DateTimeWithCalendar}
   * @private
   */
  this.xScale_ = new anychart.scales.DateTimeWithCalendar();
  this.xScale_.calendar(this.calendar_);
  this.xScale_.listenSignals(this.handleXScaleSignal_, this);

  /**
   * Current X start point.
   * @type {number}
   * @private
   */
  this.currentXStartDate_ = NaN;

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
   * Time line height settings.
   * @type {string|number}
   * @private
   */
  this.timeLineHeight_ = 0;

  /**
   * Resource list width settings.
   * @type {string|number}
   * @private
   */
  this.resourceListWidth_ = 0;

  /**
   * Events interceptor rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsInterceptor_ = null;

  /**
   * Dragger reference/
   * @type {anychart.charts.Resource.Dragger}
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
   * @type {Array.<anychart.core.resource.Resource>}
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
   * Default value for resource activity minutesPerDay value.
   * @type {number}
   * @private
   */
  this.defaultMinutesPerDay_ = 60;

  /**
   * Pix per hour value.
   * @type {number}
   * @private
   */
  this.pixPerHour_ = 30;

  /**
   * Min row height.
   * @type {number}
   * @private
   */
  this.minRowHeight_ = 100;

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
   * @type {anychart.core.resource.Activities}
   * @private
   */
  this.activities_ = new anychart.core.resource.Activities(this);
  this.activities_.listenSignals(this.handleActivitiesSignals_, this);

  /**
   * Conflicts settings.
   * @type {anychart.core.resource.Conflicts}
   * @private
   */
  this.conflicts_ = new anychart.core.resource.Conflicts(this);
  this.conflicts_.listenSignals(this.handleConflictsSignals_, this);

  this.data(opt_data || null, opt_csvSettings);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);
};
goog.inherits(anychart.charts.Resource, anychart.core.Chart);


//region --- Typedefs and consts
//------------------------------------------------------------------------------
//
//  Typedefs and consts
//
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *   id: (string|undefined),
 *   levels: Array.<anychart.core.resource.TimeLine.Level>,
 *   unit: (anychart.enums.Interval|undefined),
 *   count: (number|undefined),
 *   unitPixSize: number
 * }}
 */
anychart.charts.Resource.ZoomLevel;


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
anychart.charts.Resource.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.charts.Resource.prototype.getType = function() {
  return anychart.enums.ChartTypes.RESOURCE;
};


/** @inheritDoc */
anychart.charts.Resource.prototype.getAllSeries = function() {
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
anychart.charts.Resource.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.Resource.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.Resource.prototype.data_;


/**
 * Zoom levels storage.
 * @type {Array.<anychart.charts.Resource.ZoomLevel>}
 * @private
 */
anychart.charts.Resource.prototype.zoomLevels_;


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
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.Resource|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.Resource.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Getter/setter for xScale.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.scales.DateTimeWithCalendar|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_.setup(opt_value);
    return this;
  }
  return this.xScale_;
};


/**
 * Getter/setter for time tracking mode.
 * @param {(anychart.enums.TimeTrackingMode|string)=} opt_value
 * @return {anychart.charts.Resource|anychart.enums.TimeTrackingMode}
 */
anychart.charts.Resource.prototype.timeTrackingMode = function(opt_value) {
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
 * Default minutes per day getter/setter.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.defaultMinutesPerDay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.normalizeToNaturalNumber(opt_value, 60);
    if (this.defaultMinutesPerDay_ != value) {
      this.defaultMinutesPerDay_ = value;
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultMinutesPerDay_;
};


/**
 * Pix per hour getter/setter.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.pixPerHour = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.toNumber(opt_value);
    if (!isNaN(value) && this.pixPerHour_ != value) {
      this.pixPerHour_ = value;
      // the easiest way to reset enough states and redraw
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.pixPerHour_;
};


/**
 * Minimal row height.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.minRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.toNumber(opt_value);
    if (!isNaN(value) && this.minRowHeight_ != value) {
      this.minRowHeight_ = value;
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minRowHeight_;
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.Resource|acgraph.vector.Stroke} .
 */
anychart.charts.Resource.prototype.splitterStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.splitterStroke_) {
      this.splitterStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.RESOURCE_SPLITTER, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.splitterStroke_;
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.Chart|anychart.core.utils.Padding} .
 */
anychart.charts.Resource.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom,
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
 * @return {anychart.charts.Resource|anychart.core.resource.Activities}
 */
anychart.charts.Resource.prototype.activities = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.activities_.setup(opt_value);
    return this;
  }
  return this.activities_;
};


/**
 * Conflicts settings getter/setter.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.charts.Resource|anychart.core.resource.Conflicts}
 */
anychart.charts.Resource.prototype.conflicts = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.conflicts_.setup(opt_value);
    return this;
  }
  return this.conflicts_;
};


/**
 * Getter/setter for calendar.
 * @param {(Object|string|number|boolean|null)=} opt_value
 * @return {anychart.scales.Calendar|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.calendar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.calendar_.setup(opt_value);
    return this;
  }
  return this.calendar_;
};


/**
 * TimeLine getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.resource.TimeLine|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.timeLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.timeLine_.setup(opt_value);
    return this;
  }
  return this.timeLine_;
};


/**
 * Logo getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.charts.Resource|anychart.core.resource.Logo}
 */
anychart.charts.Resource.prototype.logo = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.logo_.setup(opt_value);
    return this;
  }
  return this.logo_;
};


/**
 * Grid getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.resource.Grid|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.grid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.grid_.setup(opt_value);
    return this;
  }
  return this.grid_;
};


/**
 * X scroll getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Scroller|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.horizontalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScroll_.setup(opt_value);
    return this;
  }
  return this.xScroll_;
};


/**
 * Y scroll getter/setter.
 * @param {(string|Object|null|boolean)=} opt_value
 * @return {anychart.core.ui.Scroller|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.yScroll_.setup(opt_value);
    return this;
  }
  return this.yScroll_;
};


/**
 * Getter/setter for the zoom levels set.
 * @param {Array.<anychart.charts.Resource.ZoomLevel>=} opt_value
 * @return {Array.<anychart.charts.Resource.ZoomLevel>|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.zoomLevels = function(opt_value) {
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
  return /** @type {Array.<anychart.charts.Resource.ZoomLevel>} */(anychart.utils.recursiveClone(this.zoomLevels_));
};


/**
 * If used as a setter - zooms chart to the level denoted by the passed index or identifier.
 * Else - returns current zoom level identifier or index, if no identifier specified at current
 * zoom level.
 * @param {(number|string)=} opt_indexOrId
 * @return {number|string|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.zoomLevel = function(opt_indexOrId) {
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
 * Time line height getter/setter.
 * @param {(number|string)=} opt_value
 * @return {anychart.charts.Resource|number|string}
 */
anychart.charts.Resource.prototype.timeLineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeNumberOrPercent(opt_value);
    if (!goog.isNull(val) && this.timeLineHeight_ != val) {
      this.timeLineHeight_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.timeLineHeight_;
};


/**
 * Resource list width getter/setter.
 * @param {(number|string)=} opt_value
 * @return {anychart.charts.Resource|number|string}
 */
anychart.charts.Resource.prototype.resourceListWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeNumberOrPercent(opt_value);
    if (!goog.isNull(val) && this.resourceListWidth_ != val) {
      this.resourceListWidth_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.resourceListWidth_;
};


/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.charts.Resource|anychart.core.ui.Overlay}
 */
anychart.charts.Resource.prototype.overlay = function(opt_value) {
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
 * @return {anychart.charts.Resource|anychart.core.resource.ResourceList}
 */
anychart.charts.Resource.prototype.resourceList = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resourceList_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.resourceList_;
};


/**
 * Getter/setter for current start date.
 * @param {(string|number|Date)=} opt_value
 * @return {number|anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.currentStartDate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var date = anychart.format.parseDateTime(opt_value);
    if (date) {
      var val = date.getTime();
      // var val = goog.math.clamp(data.getTime(), this.xScale_.minimum(), this.xScale_.maximum());
      if (this.currentXStartDate_ != val) {
        this.currentXStartDate_ = val;
        this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.currentXStartDate_;
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
anychart.charts.Resource.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Handles X Scale signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleXScaleSignal_ = function(e) {
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
anychart.charts.Resource.prototype.handleResourceListSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCE_LIST, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles Time Line signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleTimeLineSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_TIME_LINE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles lofo signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleLogoSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles grid signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleGridSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_GRID, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles X Scroll signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleXScrollSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCROLL, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles Y Scroll signal.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleYScrollSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_Y_SCROLL, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles cell padding invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleCellPaddingSignals_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles activities invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleActivitiesSignals_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_RESOURCES, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles conflicts invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleConflictsSignals_ = function(e) {
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
anychart.charts.Resource.prototype.handleXScrollChange_ = function(e) {
  this.currentXStartDate_ = this.xScale_.pixToDate(e['startRatio'] * this.fullPixWidth_ - this.currentXStartPix_);
  this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION, anychart.Signal.NEEDS_REDRAW);
  return false;
};


/**
 * Handles Y Scroll change event.
 * @param {goog.events.Event} e
 * @return {boolean}
 * @private
 */
anychart.charts.Resource.prototype.handleYScrollChange_ = function(e) {
  this.currentYStartRatio_ = e['startRatio'];
  this.invalidate(anychart.ConsistencyState.RESOURCE_Y_RANGE, anychart.Signal.NEEDS_REDRAW);
  return false;
};


/**
 * Handles drag start.
 * @return {boolean}
 * @private
 */
anychart.charts.Resource.prototype.dragStart_ = function() {
  // currently does nothing, but should unhover and start hover prevention
  return true;
};


/**
 * Drags the chart to passed position.
 * @param {number} x
 * @param {number} y
 * @private
 */
anychart.charts.Resource.prototype.dragTo_ = function(x, y) {
  var xVal = this.xScale_.pixToDate(x - this.currentXStartPix_);
  var yVal = y / this.fullPixHeight_;
  this.suspendSignalsDispatching();
  if (xVal != this.currentXStartDate_) {
    this.currentXStartDate_ = xVal;
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
anychart.charts.Resource.prototype.dragEnd_ = function() {
  // currently does nothing, but should finish hover prevention and rehover
  return true;
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} e
 * @private
 */
anychart.charts.Resource.prototype.handleMouseWheel_ = function(e) {
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
  if (xVal != this.currentXStartDate_) {
    this.currentXStartDate_ = xVal;
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
anychart.charts.Resource.prototype.initDragger_ = function(e) {
  this.dragger_ = new anychart.charts.Resource.Dragger(this, this.plotLayer_, this.eventsInterceptor_);
  this.dragger_.startDrag(e.getOriginalEvent());
};


/**
 * Initializes mouse features.
 * @private
 */
anychart.charts.Resource.prototype.initMouseWheel_ = function() {
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
 * @return {?anychart.charts.Resource.ZoomLevel}
 * @private
 */
anychart.charts.Resource.prototype.normalizeZoomLevel_ = function(value) {
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
 * @param {anychart.charts.Resource.ZoomLevel} level
 * @private
 */
anychart.charts.Resource.prototype.setZoomLevel_ = function(level) {
  this.suspendSignalsDispatching();
  this.xScale_.unit(level['unit']);
  this.xScale_.count(level['count']);
  this.xScale_.unitPixSize(level['unitPixSize']);
  this.timeLine_.levels(level['levels']);
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
 * @return {!anychart.charts.Resource.ActivityIterator}
 */
anychart.charts.Resource.prototype.getIterator = function() {
  if (!this.interactivityIterator_)
    this.interactivityIterator_ = new anychart.charts.Resource.ActivityIterator(this);
  return this.interactivityIterator_;
};


/**
 * Returns attached reset data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.charts.Resource.prototype.getResetIterator = function() {
  return this.getIterator().reset();
};


/**
 * Returns data iterator for the chart data.
 * @return {!anychart.data.Iterator}
 */
anychart.charts.Resource.prototype.getDataIterator = function() {
  return this.data_.getIterator();
};


/**
 * Returns Resource max occupation.
 * @return {number}
 */
anychart.charts.Resource.prototype.getMaxOccupation = function() {
  this.calculate();
  return this.maxOccupation_;
};


/**
 * Returns true, if the chart tracks availability.
 * @return {boolean}
 */
anychart.charts.Resource.prototype.tracksAvailability = function() {
  return this.trackAvailability_;
};


/**
 * Returns true, if the Y scale is shared among resources.
 * @return {boolean}
 */
anychart.charts.Resource.prototype.hasSharedYScale = function() {
  return this.yScalePerChart_;
};


/** @inheritDoc */
anychart.charts.Resource.prototype.calculate = function() {
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
        this.resources_[i] = resource = new anychart.core.resource.Resource(this, i);
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
      resource = /** @type {anychart.core.resource.Resource} */(this.resources_[i]);
      var occupation = this.yScalePerChart_ ? maxOccupation : resource.getMaxOccupation();
      var height = Math.max(this.pixPerHour_ * occupation / 60, this.minRowHeight_);
      height = this.cellPadding_.widenHeight(height);
      if (resource.hasConflicts) {
        height += statusHeight + anychart.core.resource.Resource.ACTIVITIES_SPACING;
      }
      this.fullPixHeight_ += height;
      this.heights_.push(height);
      this.bottoms_.push(this.fullPixHeight_);
      this.activitiesRegistry.push(activitiesCount += resource.getActivitiesCount());
    }
    this.resourceList_.setHeightsInternal(this.heights_);
    this.resourceList_.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DATA);
    this.invalidate(anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE | anychart.ConsistencyState.RESOURCE_Y_RANGE);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_DATA);
  }
};


/** @inheritDoc */
anychart.charts.Resource.prototype.calculateContentAreaSpace = function(totalBounds) {
  var bounds = anychart.charts.Resource.base(this, 'calculateContentAreaSpace', totalBounds);
  bounds = anychart.utils.applyPixelShiftToRect(bounds, 0);

  var splitterStroke = this.splitterStroke();
  var splitterStrokeThickness = splitterStroke ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(splitterStroke)) : 0;

  var timeLineHeight = anychart.utils.normalizeSize(this.timeLineHeight_, bounds.height);
  var resourceListWidth = anychart.utils.normalizeSize(this.resourceListWidth_, bounds.width);

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
anychart.charts.Resource.prototype.drawContent = function(bounds) {
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
    if (isNaN(this.currentXStartDate_)) {
      //possible problem with no data
      this.currentXStartDate_ = /** @type {number} */(this.xScale_.minimum());
      this.xScale_.startDate(this.currentXStartDate_);
    }
    var min = this.xScale_.dateToPix(/** @type {number} */(this.xScale_.minimum()));
    var max = this.xScale_.dateToPix(/** @type {number} */(this.xScale_.maximum()));
    this.fullPixWidth_ = max - min;
    startPosition = this.xScale_.dateToPix(this.currentXStartDate_);
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
    this.currentXStartDate_ = this.xScale_.pixToDate(startPosition);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_X_SCALE_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_X_SCALE_POSITION)) {
    this.xScale_.startDate(this.currentXStartDate_);
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
    this.timeLine_.xScale(/** @type {anychart.scales.DateTimeWithCalendar} */(this.xScale()));
    this.timeLine_.container(this.rootElement);
    this.timeLine_.parentBounds(this.timeLineBounds_);
    this.timeLine_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_TIME_LINE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_SPLITTER)) {
    var splitterStroke = this.splitterStroke();
    var splitterStrokeThickness = splitterStroke ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(splitterStroke)) : 0;

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
    this.grid_.xScale(/** @type {anychart.scales.DateTimeWithCalendar} */(this.xScale()));
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
      index = (/** @type {anychart.core.resource.Resource} */(this.resources_[i])).draw(index, l, r, this.resourcesLayer_, b.clone(), vLineThickness);
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
anychart.charts.Resource.prototype.getGlobalActivityIndex = function(resourceIndex, activityIndex) {
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
 * @return {anychart.charts.Resource|anychart.enums.HoverMode} .
 */
anychart.charts.Resource.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/**
 * Internal dummy getter/setter for Resource chart selection mode.
 * @param {anychart.enums.SelectionMode=} opt_value Hover mode.
 * @return {anychart.charts.Resource|anychart.enums.SelectionMode} .
 */
anychart.charts.Resource.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectMode_) {
      this.selectMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectMode_);
};


/** @inheritDoc */
anychart.charts.Resource.prototype.isSeries = function() {
  return true;
};


/**
 * Interface method.
 * @return {boolean}
 */
anychart.charts.Resource.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Interface method.
 * @return {boolean}
 */
anychart.charts.Resource.prototype.isSizeBased = function() {
  return false;
};


/** @inheritDoc */
anychart.charts.Resource.prototype.getPoint = function(index) {
  return null;
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.charts.Resource.prototype.applyAppearanceToSeries = function(pointState) {
  var iter = this.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var vLineThickness = acgraph.vector.getThickness(
      /** @type {acgraph.vector.Stroke} */(this.grid_.getOption('verticalStroke')));
  this.resources_[resourceIndex].updateActivity(activityIndex, /** @type {anychart.PointState} */(pointState), this.resourcesLayer_, vLineThickness);
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.charts.Resource.prototype.applyAppearanceToPoint = function(pointState) {
  var iter = this.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var vLineThickness = acgraph.vector.getThickness(
      /** @type {acgraph.vector.Stroke} */(this.grid_.getOption('verticalStroke')));
  this.resources_[resourceIndex].updateActivity(activityIndex, /** @type {anychart.PointState} */(pointState), this.resourcesLayer_, vLineThickness);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.charts.Resource.prototype.finalizePointAppearance = function() {
};


/** @inheritDoc */
anychart.charts.Resource.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };

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
anychart.charts.Resource.prototype.makePointEvent = function(event) {
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
 * @return {anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.hover = function(resourceIndex, activityIndex) {
  this.hoverPoint(this.getGlobalActivityIndex(resourceIndex, activityIndex));
  return this;
};


/**
 * Hovers activity by its global index.
 * @param {number} globalIndex
 * @return {anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.hoverPoint = function(globalIndex) {
  this.unhover();
  this.state.addPointState(anychart.PointState.HOVER, globalIndex);
  return this;
};


/**
 * Removes hover from the series or activity by index.
 * @param {(number|Array.<number>)=} opt_resourceIndex
 * @param {number=} opt_activityIndex
 */
anychart.charts.Resource.prototype.unhover = function(opt_resourceIndex, opt_activityIndex) {
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
 * @return {anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.select = function(resourceIndex, activityIndex) {
  this.selectPoint(this.getGlobalActivityIndex(resourceIndex, activityIndex));
  return this;
};


/**
 * Selects activity by its global index.
 * @param {number} globalIndex
 * @param {anychart.core.MouseEvent=} opt_event
 * @return {anychart.charts.Resource}
 */
anychart.charts.Resource.prototype.selectPoint = function(globalIndex, opt_event) {
  var unselect = !(opt_event && opt_event.shiftKey);
  this.state.setPointState(anychart.PointState.SELECT, globalIndex, unselect ? anychart.PointState.HOVER : undefined);
  return this;
};


/**
 * Removes select from the series or activity by index.
 * @param {(number|Array.<number>)=} opt_resourceIndex
 * @param {number=} opt_activityIndex
 */
anychart.charts.Resource.prototype.unselect = function(opt_resourceIndex, opt_activityIndex) {
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
anychart.charts.Resource.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Creates tooltip context provider.
 * @return {!anychart.core.utils.ResourceChartContextProvider}
 */
anychart.charts.Resource.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    /**
     * Tooltip context cache.
     * @type {anychart.core.utils.ResourceChartContextProvider}
     * @protected
     */
    this.tooltipContext = new anychart.core.utils.ResourceChartContextProvider(this);
  }
  this.tooltipContext.applyReferenceValues();
  return this.tooltipContext;
};


/**
 * Returns resource by index.
 * @param {number} index
 * @return {anychart.core.resource.Resource}
 */
anychart.charts.Resource.prototype.getResource = function(index) {
  return this.resources_[index] || null;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Resource.prototype.serialize = function() {
  var json = anychart.charts.Resource.base(this, 'serialize');
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
  json['timeLineHeight'] = this.timeLineHeight_;
  json['resourceListWidth'] = this.resourceListWidth_;
  json['timeTrackingMode'] = this.timeTrackingMode();
  json['pixPerHour'] = this.pixPerHour_;
  json['minRowHeight'] = this.minRowHeight_;
  json['overlay'] = this.overlay_.serialize();
  json['cellPadding'] = this.cellPadding_.serialize();
  json['conflicts'] = this.conflicts_.serialize();
  return json;
};


/** @inheritDoc */
anychart.charts.Resource.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Resource.base(this, 'setupByJSON', config);
  if ('cellPadding' in config)
    this.cellPadding_.setup(config['cellPadding']);
  this.activities_.setupByVal(config['activities'], opt_default);
  this.data(config['data']);
  this.logo_.setupByVal(config['logo'], opt_default);
  this.overlay_.setupByVal(config['overlay'], opt_default);
  this.timeLine_.setupByVal(config['timeLine'], opt_default);
  this.calendar_.setup(config['calendar']);
  this.xScale_.setup(config['xScale']);
  this.resourceList_.setup(config['resourceList']);
  this.xScroll_.setup(config['horizontalScrollBar']);
  this.yScroll_.setup(config['verticalScrollBar']);
  this.grid_.setup(config['grid']);
  this.resourceListWidth(config['resourceListWidth']);
  this.timeLineHeight(config['timeLineHeight']);
  this.zoomLevels(config['zoomLevels']);
  this.zoomLevel(config['zoomLevel']);
  this.minRowHeight(config['minRowHeight']);
  this.pixPerHour(config['pixPerHour']);
  this.timeTrackingMode(config['timeTrackingMode']);
  this.splitterStroke(config['splitterStroke']);
  this.conflicts(config['conflicts']);
};


/** @inheritDoc */
anychart.charts.Resource.prototype.disposeInternal = function() {
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

  anychart.charts.Resource.base(this, 'disposeInternal');
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
 * @param {anychart.charts.Resource} chart
 * @param {acgraph.vector.Element} target
 * @param {acgraph.vector.Rect} boundsProvider
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.charts.Resource.Dragger = function(chart, target, boundsProvider) {
  anychart.charts.Resource.Dragger.base(this, 'constructor', target.domElement());

  /**
   * Target rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.rect_ = boundsProvider;

  /**
   * Chart reference.
   * @type {anychart.charts.Resource}
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
goog.inherits(anychart.charts.Resource.Dragger, goog.fx.Dragger);


/**
 * X coord to pass to the chart in next frame.
 * @type {number}
 * @private
 */
anychart.charts.Resource.Dragger.prototype.frameX_;


/**
 * Y coord to pass to the chart in next frame.
 * @type {number}
 * @private
 */
anychart.charts.Resource.Dragger.prototype.frameY_;


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.charts.Resource.Dragger.prototype.dragStartHandler_ = function(e) {
  return this.chart_.dragStart_();
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.charts.Resource.Dragger.prototype.dragEndHandler_ = function(e) {
  if (goog.isDef(this.frame_)) {
    window.cancelAnimationFrame(this.frame_);
    this.frameAction_(0);
  }
  this.chart_.dragEnd_();
};


/** @inheritDoc */
anychart.charts.Resource.Dragger.prototype.computeInitialPosition = function() {
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
anychart.charts.Resource.Dragger.prototype.defaultAction = function(x, y) {
  this.frameX_ = -x;
  this.frameY_ = -y;
  if (goog.isDef(this.frame_))
    window.cancelAnimationFrame(this.frame_);
  this.frame_ = window.requestAnimationFrame(this.frameAction_);
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
 * @param {anychart.charts.Resource} chart
 * @extends {anychart.data.Iterator}
 * @constructor
 */
anychart.charts.Resource.ActivityIterator = function(chart) {
  /**
   * Chart reference.
   * @type {anychart.charts.Resource}
   * @private
   */
  this.chart_ = chart;

  this.reset();
};
goog.inherits(anychart.charts.Resource.ActivityIterator, anychart.data.Iterator);


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.reset = function() {
  /**
   * Current resource index.
   * @type {number}
   */
  this.currResource = 0;
  this.currentActivityIndex = this.currentIndex = -1;
  return this;
};


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.select = function(index) {
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
anychart.charts.Resource.ActivityIterator.prototype.advance = function() {
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
anychart.charts.Resource.ActivityIterator.prototype.getResourceIndex = function() {
  return +this.currResource;
};


/**
 * Returns current activity index of the current resource
 * @return {number}
 */
anychart.charts.Resource.ActivityIterator.prototype.getActivityIndex = function() {
  return this.currentActivityIndex;
};


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.getIndex = function() {
  return this.currentIndex;
};


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.getRowsCount = function() {
  return this.chart_.activitiesRegistry[this.chart_.activitiesRegistry.length - 1] || 0;
};


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.get = function() {
  throw 'Cannot use get on ActivityIterator';
};


/** @inheritDoc */
anychart.charts.Resource.ActivityIterator.prototype.meta = function(name, opt_value) {
  throw 'Cannot use meta on ActivityIterator';
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
  var proto = anychart.charts.Resource.prototype;
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['timeTrackingMode'] = proto.timeTrackingMode;
  proto['pixPerHour'] = proto.pixPerHour;
  proto['cellPadding'] = proto.cellPadding;
  proto['minRowHeight'] = proto.minRowHeight;
  proto['zoomLevels'] = proto.zoomLevels;
  proto['zoomLevel'] = proto.zoomLevel;
  proto['xScale'] = proto.xScale;
  proto['horizontalScrollBar'] = proto.horizontalScrollBar;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['grid'] = proto.grid;
  proto['logo'] = proto.logo;
  proto['timeLine'] = proto.timeLine;
  proto['calendar'] = proto.calendar;
  proto['resourceListWidth'] = proto.resourceListWidth;
  proto['timeLineHeight'] = proto.timeLineHeight;
  proto['defaultMinutesPerDay'] = proto.defaultMinutesPerDay;
  proto['overlay'] = proto.overlay;
  proto['activities'] = proto.activities;
  proto['conflicts'] = proto.conflicts;
  proto['resourceList'] = proto.resourceList;
  proto['splitterStroke'] = proto.splitterStroke;
  proto['currentStartDate'] = proto.currentStartDate;
  proto['hover'] = proto.hover;
  proto['hoverPoint'] = proto.hoverPoint;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.select;
  proto['selectPoint'] = proto.selectPoint;
  proto['unselect'] = proto.unselect;
})();


//endregion
