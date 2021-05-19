goog.provide('anychart.calendarModule.Plot');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.utils');


/**
 * Calendar plot class.
 * @constructor
 * @param {anychart.calendarModule.Chart} chart Chart instance.
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.calendarModule.Plot = function(chart) {
  anychart.calendarModule.Plot.base(this, 'constructor');

  /**
   * Parent chart reference.
   * @type {anychart.calendarModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Plot title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * Plot background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;


  /**
   * Week labels texts. S M T W T F S.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.weekLabels_ = [];

  /**
   * Months labels texts. Jan Feb Mar ... Dec.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.monthsLabels_ = [];

  /**
   * DateTime locale object.
   * @type {?anychart.format.DateTimeLocale}
   * @private
   */
  this.locale_ = anychart.format.getDateTimeLocale(anychart.format.outputLocale());
};
goog.inherits(anychart.calendarModule.Plot, anychart.core.VisualBaseWithBounds);


/**
 * Width available for weeks labels.
 * @type {number|string}
 */
anychart.calendarModule.Plot.WEEK_WIDTH = '2%';


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.calendarModule.Plot.prototype.SUPPORTED_CONSISTENCY_STATES =
  anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES | // enabled, container, bounds, zIndex
  anychart.ConsistencyState.APPEARANCE |
  anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE |
  anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND |
  anychart.ConsistencyState.CALENDAR_PLOT_TITLE |
  anychart.ConsistencyState.CALENDAR_PLOT_WEEK_LABELS |
  anychart.ConsistencyState.CALENDAR_PLOT_MONTHS_LABELS;


/**
 * Plot title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.calendarModule.Plot.prototype.onTitleSignal_ = function(event) {
  var state = anychart.ConsistencyState.CALENDAR_PLOT_TITLE;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.calendarModule.Plot)} .
 */
anychart.calendarModule.Plot.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.setupCreated('title', this.title_);
    this.title_.needsForceSignalsDispatching(true);
    this.title_.listenSignals(this.onTitleSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Plot background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.calendarModule.Plot.prototype.onBackgroundSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.calendarModule.Plot|anychart.core.ui.Background} .
 */
anychart.calendarModule.Plot.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.setupCreated('background', this.background_);
    this.background_.needsForceSignalsDispatching(true);
    this.background_.listenSignals(this.onBackgroundSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Prepares all layers and path that would be drawed.
 * Also layers for OptimizedText labels.
 *
 * @private
 */
anychart.calendarModule.Plot.prototype.ensureVisualReady_ = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);
  }

  if (!this.labelsLayerElement_) {
    this.labelsLayerElement_ = acgraph.getRenderer().createLayerElement();

    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerElement_);
    this.labelsLayer_.zIndex(1);
    this.labelsLayer_.parent(this.rootLayer_);
  }

  /*
      NOTE(anton.kagakin):
      Creating 3 path for fill, hatch, stroke caused by drawing cells
      hatch is goes over stroke, so we can't use only dayPath_ for fill
      and stroke together.
   */

  if (!this.dayPath_) {
    /**
     * Path represents fill for days with no data.
     * @type {acgraph.vector.Path}
     */
    this.dayPath_ = this.rootLayer_.path();
    this.dayPath_.zIndex(1);
  }

  if (!this.dayHatchPath_) {
    /**
     * Path represents hatchFill for days with no data.
     * @type {acgraph.vector.Path}
     */
    this.dayHatchPath_ = this.rootLayer_.path();
    this.dayHatchPath_.zIndex(2);
  }

  if (!this.dayStrokePath_) {
    /**
     * Path represents stroke for days with no data.
     * @type {acgraph.vector.Path}
     */
    this.dayStrokePath_ = this.rootLayer_.path();
    this.dayStrokePath_.zIndex(3);
  }

  if (this.dataLayer_) {
    this.dataLayer_.clear();
  } else {
    /**
     * Data layer - is layer for days with data, it creates separate path
     * for each data for interactivity purposes.
     * @type {anychart.core.utils.TypedLayer}
     */
    this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.dataLayer_.zIndex(4);
    this.dataLayer_.parent(this.rootLayer_);
  }

  if (!this.noDataMonthPath_) {
    /**
     * noDataMonthPath represents stroke of months with no data.
     * NB: if we want to resolve color with function and context
     * we should create layer and paths to colorize them accordingly.
     * @type {acgraph.vector.Path}
     */
    this.noDataMonthPath_ = this.rootLayer_.path();
    this.noDataMonthPath_.zIndex(5);
  }

  if (!this.monthPath_) {
    /**
     * monthPath represents stroke of months with data.
     * Goes after noDataMonthPath to be higher than a stroke of months with no data.
     * NB: if we want to resolve color with function and context
     * we should create layer and paths to colorize them accordingly.
     * @type {acgraph.vector.Path}
     */
    this.monthPath_ = this.rootLayer_.path();
    this.monthPath_.zIndex(6);
  }
};


/**
 * Sets plot year and setup necessary values like leap year, total days in months, start day.
 *
 * @param {number} value - The year plot would represent.
 */
anychart.calendarModule.Plot.prototype.setYear = function(value) {
  if (this.plotYear_ !== value) {
    this.plotYear_ = value;

    this.isLeapYear_ = anychart.utils.isLeapYear(this.plotYear_);
    this.totalDays_ = this.isLeapYear_ ? 366 : 365;
    this.daysInMonth_ = this.isLeapYear_ ? anychart.utils.DAYS_IN_LEAP_MONTH : anychart.utils.DAYS_IN_MONTH;

    this.firstDay_ = this.locale_ ? this.locale_['firstDayOfWeek'] : 0;

    this.startYearDay_ = new Date(Date.UTC(this.plotYear_, 0, 1)).getUTCDay();
    if (this.startYearDay_ < this.firstDay_)
      this.startYearDay_ += 7;
  }
};


/**
 * Sets meta data for plots drawing.
 *
 * @param {anychart.calendarModule.Chart.YearDataMeta} dataMeta - Meta information to draw data.
 */
anychart.calendarModule.Plot.prototype.setDataMeta = function(dataMeta) {
  this.dataMeta_ = dataMeta;
};


/**
 * Remove's plot from parent node.
 */
anychart.calendarModule.Plot.prototype.remove = function() {
  if (this.rootLayer_) {
    this.rootLayer_.parent(null);
  }
};


/**
 * Coordinate box suitable for drawing.
 *
 * @typedef {{
 *   left: number,
 *   top: number,
 *   right: number,
 *   bottom: number
 * }}
 */
anychart.calendarModule.Plot.CoordinateBox;


/**
 * Month bounds in terms of row/column start/end.
 *   weekDay - row
 *   weekNumber - column
 *
 * @typedef {{
 *   startUTCWeekDay: number,
 *   endUTCWeekDay: number,
 *   startWeekDay: number,
 *   startWeekNumber: number,
 *   endWeekDay: number,
 *   endWeekNumber: number
 * }}
 */
anychart.calendarModule.Plot.MonthsBounds;


/**
 * Type represents day in terms of row/column.
 *   weekDay - row
 *   weekNumber = column
 *
 * @typedef {{
 *   weekDay: number,
 *   weekNumber: number
 * }}
 */
anychart.calendarModule.Plot.DayCell;

/**
 * Draws day cell into passed coordinates.
 * If path is passed - use only path, otherwise used path for fill, hatch, stroke.
 *
 * @param {anychart.calendarModule.Plot.CoordinateBox} box - Coordinate box to draw day cell.
 * @param {acgraph.vector.Path=} opt_path - Path used for drawing.
 */
anychart.calendarModule.Plot.prototype.drawDay = function(box, opt_path) {
  var left = box.left;
  var top = box.top;
  var right = box.right;
  var bottom = box.bottom;

  if (opt_path) {
    opt_path
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();
  } else {
    this.dayPath_ // no data days fill
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();
    this.dayStrokePath_ // no data days stroke
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();
    this.dayHatchPath_ // no data days hatchFill
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();
  }
};


/**
 * Returns coordinate box for day cell in context of passed bounds.
 *
 * @param {number} weekDayRowIndex - Row index of a day of week.
 * @param {number} weekNumber - Week number.
 * @param {anychart.math.Rect} bounds - Bounds used to calculate coordinates.
 * @return {anychart.calendarModule.Plot.CoordinateBox}
 */
anychart.calendarModule.Plot.prototype.getBoxForDay = function(weekDayRowIndex, weekNumber, bounds) {
  var n = anychart.utils.applyPixelShift;

  var left = bounds.left + this.daysMargin_ * (weekNumber + 1) + weekNumber * this.cellSize_;
  var top = bounds.top + this.daysMargin_ * (weekDayRowIndex + 1) + weekDayRowIndex * this.cellSize_;

  var right = n(left + this.cellSize_, 1);
  var bottom = n(top + this.cellSize_, 1);
  left = n(left, 1);
  top = n(top, 1);

  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  };
};


/**
 * Returns month bounds in terms of start/end weekDay and weekNumber.
 *
 * @param {number} monthNumber - Number of the month.
 * @return {anychart.calendarModule.Plot.MonthsBounds}
 */
anychart.calendarModule.Plot.prototype.getMonthBounds = function(monthNumber) {
  var accumulatedDays = this.startYearDay_;
  for (var i = 0; i < monthNumber + 1; i++) {
    accumulatedDays += this.daysInMonth_[i];
  }

  var startMonthDay = accumulatedDays - this.daysInMonth_[monthNumber];
  var startWeekDay = (startMonthDay - this.firstDay_) % 7;
  var startWeekNumber = Math.floor((startMonthDay - startWeekDay) / 7);

  var endMonthDay = accumulatedDays - 1;
  var endWeekDay = (endMonthDay - this.firstDay_) % 7;
  var endWeekNumber = Math.floor((endMonthDay - endWeekDay) / 7);

  return {
    startUTCWeekDay: startMonthDay % 7,
    endUTCWeekDay: endMonthDay % 7,
    startWeekDay: startWeekDay,
    startWeekNumber: startWeekNumber,
    endWeekDay: endWeekDay,
    endWeekNumber: endWeekNumber
  };
};


/**
 * Draw months visual.
 */
anychart.calendarModule.Plot.prototype.drawMonths = function() {
  this.monthPath_.clear();
  this.noDataMonthPath_.clear();

  // division by 2 with floor rounding
  var m = this.daysMargin_ >> 1;
  var bounds = this.drawableAreaBounds_;
  var monthsWithData = this.dataMeta_.monthsWithData;

  var weekendLength = this.showWeekends_ ? 0 : this.weekendRange_.length;

  for (var i = 0; i < 12; i++) {
    var path = monthsWithData.indexOf(i) > -1 ? this.monthPath_ : this.noDataMonthPath_;
    var monthBounds = this.getMonthBounds(i);

    var startUTCWeekDay = monthBounds.startUTCWeekDay;
    var endUTCWeekDay = monthBounds.endUTCWeekDay;
    var startWeekNumber = monthBounds.startWeekNumber;
    var endWeekNumber = monthBounds.endWeekNumber;

    var rowIndex;
    if (!this.showWeekends_) {
      while (startUTCWeekDay in this.utcWeekEndsObj_) {
        rowIndex = this.fullRowIndex_[startUTCWeekDay];
        startUTCWeekDay = (startUTCWeekDay + 1) % 7;
        rowIndex += 1;
        if (rowIndex === 7) {
          startWeekNumber += 1;
        }
      }

      while (endUTCWeekDay in this.utcWeekEndsObj_) {
        rowIndex = this.fullRowIndex_[endUTCWeekDay];
        endUTCWeekDay = (endUTCWeekDay - 1 + 7) % 7;
        rowIndex -= 1;
        if (rowIndex === -1) {
          endWeekNumber -= 1;
        }
      }
    }

    var maxRowIndex = 6 - weekendLength;

    var startWeekDayRowIndex = this.rowIndex_[startUTCWeekDay];
    var endWeekDayRowIndex = this.rowIndex_[endUTCWeekDay];

    var startBox = this.getBoxForDay(startWeekDayRowIndex, startWeekNumber, bounds);
    var endBox = this.getBoxForDay(endWeekDayRowIndex, endWeekNumber, bounds);
    var nextStartBox = this.getBoxForDay(0, startWeekNumber + 1, bounds);
    var prevEndBox = this.getBoxForDay(maxRowIndex, endWeekNumber - 1, bounds);

    var t0 = nextStartBox.top;
    var b6 = prevEndBox.bottom;

    // start
    path.moveTo(startBox.left - m, startBox.top - m);

    // move down
    path.lineTo(startBox.left - m, b6 + m);

    // move right
    if (endWeekDayRowIndex === maxRowIndex) {
      path.lineTo(endBox.right + m, b6 + m);
    } else {
      path
        .lineTo(prevEndBox.right + m, b6 + m)
        .lineTo(prevEndBox.right + m, endBox.bottom + m)
        .lineTo(endBox.right + m, endBox.bottom + m);
    }

    // move up
    path.lineTo(endBox.right + m, t0 - m);

    // move left
    if (startWeekDayRowIndex === 0) {
      path.lineTo(startBox.left - m, t0 - m);
    } else {
      path
        .lineTo(nextStartBox.left - m, t0 - m)
        .lineTo(nextStartBox.left - m, startBox.top - m)
        .lineTo(startBox.left - m, startBox.top - m);
    }

    path.close();
  }
};


/**
 * Draws plot skeleton (like fills, hatch fills, months).
 *
 *  0  1  2  3  4  5  6 - 0 week
 *  7  8  9 10 11 12 13 - 1 week
 * 14 15 16 17 18 19 20 - 2 week
 *
 *  1  2  3  4  5  6  7 - 0 week
 *  8  9 10 11 12 13 14 - 1 week
 * 15 16 17 18 19 20 21 - 2 week
 */
anychart.calendarModule.Plot.prototype.drawSkeleton = function() {
  this.dayPath_.clear();
  this.dayStrokePath_.clear();
  this.dayHatchPath_.clear();

  for (var curDay = this.startYearDay_; curDay < this.totalDays_ + this.startYearDay_; curDay++) {
    var weekDay = (curDay - this.firstDay_) % 7;
    var weekNumber = Math.floor((curDay - weekDay) / 7);
    if (curDay < weekDay)
      weekNumber += 1;

    if (this.showWeekends_ || !((curDay % 7) in this.utcWeekEndsObj_)) {
      var box = this.getBoxForDay(this.rowIndex_[curDay % 7], weekNumber, this.drawableAreaBounds_);
      this.drawDay(box);
    }
  }

  this.drawMonths();
};


/**
 * Returns week day and week number by passed date considering start day.

 * @param {Date} date - Date object.
 * @return {anychart.calendarModule.Plot.DayCell} - Object with week day and week number.
 */
anychart.calendarModule.Plot.prototype.getDayCellByDate_ = function(date) {
  var curDay = 0;
  var monthNumber = date.getUTCMonth();

  for (var i = 0; i < monthNumber; i++) {
    curDay += this.daysInMonth_[i];
  }

  curDay += this.startYearDay_ + date.getUTCDate() - 1;

  var weekDay = (curDay - this.firstDay_) % 7;
  var weekNumber = Math.floor((curDay - weekDay) / 7);

  if (curDay < weekDay)
    weekNumber += 1;

  return {
    weekDay: curDay % 7,
    weekNumber: weekNumber
  };
};


/**
 * Draws data cells.
 *
 * @private
 */
anychart.calendarModule.Plot.prototype.drawData = function() {
  var iterator = this.iterator_ = this.chart_.data().getIterator();

  var dataIndexes = this.dataMeta_.dataIndexes;

  for (var i = 0; i < dataIndexes.length; i++) {
    var index = dataIndexes[i];
    iterator.select(index);

    var x = anychart.format.parseDateTime(iterator.getX());
    var cell = this.getDayCellByDate_(x);

    var path = /** @type {acgraph.vector.Path} */(this.dataLayer_.genNextChild());
    path.tag = {
      dataIndex: index,
      x: x,
      value: iterator.get('value'),
      timestamp: x.getTime(),
      weekNumber: cell.weekNumber,
      day: cell.weekDay,
      month: x.getUTCMonth(),
      year: x.getUTCFullYear()
    };

    this.chart_.colorizePoint(path, anychart.PointState.NORMAL);

    if (this.showWeekends_ || !(cell.weekDay in this.utcWeekEndsObj_)) {
      var dayBox = this.getBoxForDay(this.rowIndex_[cell.weekDay], cell.weekNumber, this.drawableAreaBounds_);
      this.drawDay(dayBox, path);
    }
  }
};


/**
 * Calculated plot height.
 *
 * @return (number) - Actual calculated plot height.
 */
anychart.calendarModule.Plot.prototype.getActualPlotHeight = function() {
  return this.actualPlotHeight_;
};


/**
 * Get bounds for week day label.
 *
 * @param {number} weekDay - Day of week.
 * @return {anychart.math.Rect} - Bounds to draw to.
 */
anychart.calendarModule.Plot.prototype.getWeekDayLabelBounds_ = function(weekDay) {
  // we can use 0 as weekNumber because in this bounds there is only one possible column
  var box = this.getBoxForDay(this.rowIndex_[weekDay], 0, this.weekBounds_);
  return anychart.math.rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
};


/**
 * Get bounds for month label.
 *
 * @param {number} monthNumber - Number of the month.
 * @return {anychart.math.Rect} - Bounds to draw to.
 */
anychart.calendarModule.Plot.prototype.getMonthLabelBounds_ = function(monthNumber) {
  var monthBounds = this.getMonthBounds(monthNumber);

  var startWeekDay = monthBounds.startUTCWeekDay % 7;
  var startWeekNumber = monthBounds.startWeekNumber;

  if (this.rowIndex_[startWeekDay] !== 0)
    startWeekNumber += 1;

  var box = this.getBoxForDay(0, startWeekNumber, this.monthsBounds_);

  /*
    todo(anton.kagakin)
    5 - is a little x offset for the month label
    actually we can consider to add it to months() as a property
   */

  return anychart.math.rect(box.left + 5, box.top, box.right - box.left, box.bottom - box.top);
};


/**
 * Calculates bounds depending on all information provided.
 */
anychart.calendarModule.Plot.prototype.calculateBounds_ = function() {
  var title = this.title();

  var pixelBounds = this.getPixelBounds();

  var left = pixelBounds.left;
  var top = pixelBounds.top;
  var width = pixelBounds.width;

  var titleFontSize = /** @type {number} */ (title.getOption('fontSize'));
  var availableTitleWidth = anychart.utils.getHeightByFontSize(titleFontSize);
  var availableWeekWidth = anychart.utils.normalizeSize(anychart.calendarModule.Plot.WEEK_WIDTH, width);

  var monthsLabelsFontSize = /** @type {number} */ (this.chart_.months().labels().getOption('fontSize'));
  /*
    todo(anton.kagakin)
    5 here is magic number
    need to understand proper y shift to make underSpace work correctly.
   */
  var availableMonthHeight = 5 + anychart.utils.getHeightByFontSize(monthsLabelsFontSize) + this.monthUnderSpace_;

  // -1 here is stroke thickness of this.monthPath_ / 2;
  var drawableAreaWidth = width - availableTitleWidth - availableWeekWidth - 1;

  /**
   * Why (54 - 1 + 2)?:
   *  54 means total number of week columns that can be drawn on a chart depends on different settings
   *     such as first day of week and showWeekends;
   *  -1 means number of spaces between columns;
   *  +2 means left spacing for the first and right spacing for the last columns;
   *
   * @type {number}
   * @private
   */
  this.cellSize_ = (drawableAreaWidth - (54 - 1 + 2) * this.daysMargin_) / 54;
  var daysOfWeekCount = this.showWeekends_ ? 7 : 7 - this.weekendRange_.length;
  /**
   * Here the same: full height is cell size for all 7 rows of cells and space between and around cells
   * @type {number}
   */
  var drawableAreaHeight = this.cellSize_ * daysOfWeekCount + (daysOfWeekCount - 1 + 2) * this.daysMargin_;

  /**
   * Actual plot height.
   * @type {number}
   * @private
   */
  this.actualPlotHeight_ = availableMonthHeight + drawableAreaHeight;

  /**
   * Bounds to draw background into.
   * @type {!anychart.math.Rect}
   * @private
   */
  this.backgroundBounds_ = anychart.math.rect(
    left,
    top,
    width,
    this.actualPlotHeight_
  );

  /**
   * Bounds to draw title into.
   * @type {!anychart.math.Rect}
   * @private
   */
  this.titleBounds_ = anychart.math.rect(
    left,
    top,
    availableTitleWidth,
    this.actualPlotHeight_
  );

  /**
   * Bounds for week labels to draw into.
   * @type {!anychart.math.Rect}
   * @private
   */
  this.weekBounds_ = anychart.math.rect(
    left + availableTitleWidth,
    top + availableMonthHeight,
    availableWeekWidth,
    drawableAreaHeight
  );

  /**
   * Bounds for months labels to draw into.
   * @type {!anychart.math.Rect}
   * @private
   */
  this.monthsBounds_ = anychart.math.rect(
    left + availableTitleWidth + availableWeekWidth,
    top,
    drawableAreaWidth,
    availableMonthHeight
  );

  /**
   * Bounds of plot drawable area (all cells are drawn in that bounds).
   * @type {!anychart.math.Rect}
   * @private
   */
  this.drawableAreaBounds_ = anychart.math.rect(
    left + availableTitleWidth + availableWeekWidth,
    top + availableMonthHeight,
    drawableAreaWidth,
    drawableAreaHeight
  );
};


/**
 * Resolves CALENDAR_PLOT_APPEARANCE consistency state.
 * @private
 */
anychart.calendarModule.Plot.prototype.resolveAppearanceState_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE)) {
    var days = this.chart_.days();
    var months = this.chart_.months();

    // no data days fill
    this.dayPath_.stroke('none');
    this.dayPath_.fill(/** @type {acgraph.vector.Fill} */ (days.getOption('noDataFill')));

    // no data days hatchFill
    var hatchFill = acgraph.vector.normalizeHatchFill(/** @type {acgraph.vector.HatchFill|Object|string} */ (days.getOption('noDataHatchFill')));
    this.dayHatchPath_.stroke('none');
    this.dayHatchPath_.fill(hatchFill);

    // no data days stroke
    this.dayStrokePath_.stroke(/** @type {acgraph.vector.Stroke} */ (days.getOption('noDataStroke')));
    this.dayStrokePath_.fill('none');

    this.noDataMonthPath_.stroke(/** @type {acgraph.vector.Stroke} */ (months.getOption('noDataStroke')));
    this.noDataMonthPath_.fill('none');

    this.monthPath_.stroke(/** @type {acgraph.vector.Stroke} */ (months.getOption('stroke')));
    this.monthPath_.fill('none');

    this.drawSkeleton();

    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE);
  }
};


/**
 * Resolves CONTAINER consistency state.
 * @private
 */
anychart.calendarModule.Plot.prototype.resolveContainerState_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/**
 * Resolves Z_INDEX consistency state.
 * @private
 */
anychart.calendarModule.Plot.prototype.resolveZIndexState_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }
};


/**
 * Put label at specified bounds with specified settings.
 *
 * @param {anychart.core.ui.OptimizedText} label - Label instance.
 * @param {string} text - Text to set.
 * @param {Object} style - Style to apply.
 * @param {anychart.math.Rect} bounds - Bounds to be put at.
 */
anychart.calendarModule.Plot.prototype.putLabelAtBounds = function(label, text, style, bounds) {
  label.text(text);
  label.style(style);
  label.applySettings();
  label.renderTo(this.labelsLayerElement_);
  label.putAt(bounds, /** @type {acgraph.vector.Stage} */ (this.container().getStage()));
};


/**
 * Setups
 * @private
 */
anychart.calendarModule.Plot.prototype.initializePlotProperties_ = function() {
  this.daysMargin_ = /** @type {number} */(this.chart_.days().getOption('spacing'));
  this.monthUnderSpace_ = /** @type {number} */ (this.chart_.months().getOption('underSpace'));
  this.showWeekends_ = /** @type {boolean} */ (this.chart_.weeks().getOption('showWeekends'));

  this.weekendRange_ = this.locale_ ? goog.array.clone(this.locale_['weekendRange']) : [];
  this.utcWeekEnds_ = [];
  this.utcWeekEndsObj_ = {};

  var i;
  var j = 0;

  for (i = this.weekendRange_[0]; i <= this.weekendRange_[1]; i++) {
    var utcWeekEnd = (i + 1) % 7;
    this.utcWeekEnds_[j++] = utcWeekEnd;
    this.utcWeekEndsObj_[String(utcWeekEnd)] = true;
  }

  this.rowIndex_ = {};
  this.fullRowIndex_ = {};
  var index = 0;
  for (i = 0; i < 7; i++) {
    var day = (i + this.firstDay_) % 7;
    if (this.showWeekends_ || !(day in this.utcWeekEndsObj_)) {
      this.rowIndex_[day] = index++;
    }
    this.fullRowIndex_[day] = i;
  }
};


/**
 * Draws calendar plot.
 * @return {anychart.calendarModule.Plot}
 */
anychart.calendarModule.Plot.prototype.draw = function() {
  if (!this.checkDrawingNeeded()) {
    return this;
  }

  this.ensureVisualReady_();

  this.initializePlotProperties_();

  this.resolveContainerState_();
  this.resolveZIndexState_();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds_();
    this.invalidate(
      anychart.ConsistencyState.CALENDAR_PLOT_WEEK_LABELS |
      anychart.ConsistencyState.CALENDAR_PLOT_MONTHS_LABELS |
      anychart.ConsistencyState.APPEARANCE |
      anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE
    );
  }

  this.resolveAppearanceState_();

  var title;
  var background;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND |
    anychart.ConsistencyState.CALENDAR_PLOT_TITLE)) {

    background = this.getCreated('background');
    if (background && background.enabled()) {
      background.parentBounds(this.backgroundBounds_);
    }

    title = this.getCreated('title');
    if (title && title.enabled()) {
      title.parentBounds(this.titleBounds_);
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND)) {
    background = this.getCreated('background');
    if (background) {
      background.needsForceSignalsDispatching(false);
      background.suspendSignalsDispatching();
      background.container(this.rootLayer_);
      background.zIndex(0);
      background.draw();
      background.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOT_TITLE)) {
    title = this.getCreated('title');
    if (title) {
      title.needsForceSignalsDispatching(false);
      title.suspendSignalsDispatching();
      title.container(this.rootLayer_);
      title.zIndex(1);
      title.draw();
      title.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOT_TITLE);
  }

  var i;
  var text;
  var textBounds;
  var t;

  var weekDays = this.locale_ ? this.locale_['narrowWeekdays'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var months = this.locale_ ? this.locale_['shortMonths'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOT_WEEK_LABELS)) {
    for (i = 0; i < 7; i++) {
      t = this.weekLabels_[i] || (this.weekLabels_[i] = new anychart.core.ui.OptimizedText());

      if (!this.showWeekends_ && (i in this.utcWeekEndsObj_)) {
        t.renderTo(null);
        continue;
      }

      text = weekDays[i];
      textBounds = this.getWeekDayLabelBounds_(i);

      this.putLabelAtBounds(
        t,
        text,
        this.chart_.weeks().labels().flatten(),
        textBounds
      );
    }

    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOT_WEEK_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOT_MONTHS_LABELS)) {
    for (i = 0; i < 12; i++) {
      t = this.monthsLabels_[i] || (this.monthsLabels_[i] = new anychart.core.ui.OptimizedText());

      text = months[i];
      textBounds = this.getMonthLabelBounds_(i);

      this.putLabelAtBounds(
        t,
        text,
        this.chart_.months().labels().flatten(),
        textBounds
      );
    }

    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOT_MONTHS_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawData();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


/** @inheritDoc */
anychart.calendarModule.Plot.prototype.setupByJSON = function(config, opt_default) {
  anychart.calendarModule.Plot.base(this, 'setupByJSON', config, opt_default);

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);
};


/** @inheritDoc */
anychart.calendarModule.Plot.prototype.disposeInternal = function() {
  this.rootLayer_.remove();
  goog.disposeAll(
    this.dayPath_,
    this.dayHatchPath_,
    this.dayStrokePath_,
    this.noDataMonthPath_,
    this.monthPath_,
    this.rootLayer_,
    this.background_,
    this.title_
  );

  this.dayPath_ = null;
  this.dayHatchPath_ = null;
  this.dayStrokePath_ = null;
  this.noDataMonthPath_ = null;
  this.monthPath_ = null;
  this.rootLayer_ = null;

  this.background_ = null;
  this.title_ = null;

  anychart.calendarModule.Plot.base(this, 'disposeInternal');
};
