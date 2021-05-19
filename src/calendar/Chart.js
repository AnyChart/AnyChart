//region Provide / Require
goog.provide('anychart.calendarModule.Chart');
goog.require('anychart.calendarModule.DataView');
goog.require('anychart.calendarModule.Plot');
goog.require('anychart.calendarModule.settings.Days');
goog.require('anychart.calendarModule.settings.Months');
goog.require('anychart.calendarModule.settings.Weeks');
goog.require('anychart.calendarModule.settings.Years');
goog.require('anychart.colorScalesModule.Linear');
goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.data.Set');
goog.require('anychart.format');
//endregion
//region Constructor


/**
 * Calendar chart class.
 * @constructor
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 */
anychart.calendarModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.calendarModule.Chart.base(this, 'constructor');

  this.addThemes('calendar');

  this.bindHandlersToComponent(this,
    this.handleMouseOverAndMove,    // override from anychart.core.Chart
    this.handleMouseOut,            // override from anychart.core.Chart
    null,                           // click handler
    this.handleMouseOverAndMove,    // override from anychart.core.Chart
    null,                           // all handler
    null);                          // anychart.core.Chart

  /**
   * Chart plots array.
   * @type {Array.<anychart.calendarModule.Plot>}
   * @private
   */
  this.plots_ = [];

  this.data(opt_data || null, opt_csvSettings);

  /**
   * Array with years represented by the data.
   * @type {Array.<number>}
   * @private
   */
  this.representedYears_ = [];

  /**
   * Array with values sorted ASC
   * @type {Array.<number>}
   * @private
   */
  this.dataDomain_ = [];

  /**
   * Meta information for data that would be drawn.
   * @type {anychart.calendarModule.Chart.DataMeta}
   * @private
   */
  this.dataMeta_ = {};

  /**
   * Actual chart height.
   * @type {number}
   * @private
   */
  this.actualHeight_ = 0;

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.calendarModule.Chart, anychart.core.SeparateChart);


//endregion
//region ConsistencyStates / Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.calendarModule.Chart.prototype.SUPPORTED_SIGNALS =
  anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.calendarModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
  anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.CALENDAR_DATA |
  anychart.ConsistencyState.CALENDAR_PLOTS |
  anychart.ConsistencyState.CALENDAR_COLOR_SCALE |
  anychart.ConsistencyState.CALENDAR_COLOR_RANGE;


//endregion
//region Properties
/**
 * Z-index of a calendar chart data layer.
 * @type {number}
 */
anychart.calendarModule.Chart.ZINDEX_CALENDAR = 30;


/**
 * @typedef {Object<string|number, anychart.calendarModule.Chart.YearDataMeta>}
 */
anychart.calendarModule.Chart.DataMeta;


/**
 * @typedef {{
 *   monthsWithData: Array.<number>,
 *   dataIndexes:Array.<number>
 * }}
 */
anychart.calendarModule.Chart.YearDataMeta;


//endregion
//region Data
/**
 * Prepares calendar view.
 * @private
 */
anychart.calendarModule.Chart.prototype.redefineView_ = function() {
  goog.dispose(this.view_);
  delete this.iterator_;

  this.view_ = new anychart.calendarModule.DataView(this.data_);
  this.view_.listenSignals(this.dataInvalidated_, this);

  this.invalidate(anychart.ConsistencyState.CALENDAR_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Sets data for calendar chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.calendarModule.Chart|anychart.data.View}
 */
anychart.calendarModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) {
        this.title(title);
      }
      if (opt_value['rows']) {
        opt_value = opt_value['rows'];
      }
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.disposeAll(
        this.view_,
        this.data_,
        this.parentViewToDispose_
      );
      this.iterator_ = null;

      if (anychart.utils.instanceOf(opt_value, anychart.data.View)) {
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      } else if (anychart.utils.instanceOf(opt_value, anychart.data.Set)) {
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      } else {
        var isArrayOrString = goog.isArray(opt_value) || goog.isString(opt_value);
        opt_value = isArrayOrString ? opt_value : null;
        this.parentViewToDispose_ = new anychart.data.Set(opt_value, opt_csvSettings);
        this.data_ = this.parentViewToDispose_.mapAs();
      }

      this.redefineView_();
    }

    return this;
  }
  return this.view_;
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.calendarModule.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.CALENDAR_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getDetachedIterator = function() {
  return this.view_.getIterator();
};


/**
 * Returns new data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.view_.getIterator();
};


/**
 * Returns current data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.CALENDAR;
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.createLegendItemsProvider = function(sourceMode) {
  return [];
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.calculate = function() {
  /*
    Here in this method we prepare all necessary information to draw plots.
    Represented years and months with or without data.
   */

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_DATA)) {
    this.representedYears_ = [];
    this.dataDomain_ = [];
    this.dataMeta_ = {};

    var iterator = this.data().getIterator();
    iterator.reset();
    while (iterator.advance()) {
      var value = Number(iterator.get('value'));
      var x = iterator.get('x');
      var parsedX = anychart.format.parseDateTime(x);
      var index = iterator.getIndex();

      var year = parsedX.getUTCFullYear();
      var month = parsedX.getUTCMonth();

      if (!(year in this.dataMeta_)) {
        this.dataMeta_[year] = {
          monthsWithData: [],
          dataIndexes: []
        };
      }

      var yearMeta = this.dataMeta_[year];

      yearMeta.dataIndexes.push(index);
      goog.array.binaryInsert(yearMeta.monthsWithData, month);
      goog.array.binaryInsert(this.representedYears_, year);
      goog.array.binaryInsert(this.dataDomain_, value);
    }

    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CALENDAR_COLOR_SCALE);

    this.plotsLength_ = this.representedYears_.length;
    this.markConsistent(anychart.ConsistencyState.CALENDAR_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_COLOR_SCALE)) {
    var dataDomain = this.dataDomain_;
    if (this.colorScale_) {
      if (this.colorScale_.needsAutoCalc()) {
        this.colorScale_.startAutoCalc();
        this.colorScale_.extendDataRange(dataDomain[0], dataDomain[dataDomain.length - 1]);
        this.colorScale_.finishAutoCalc();
      } else {
        this.colorScale_.resetDataRange();
        this.colorScale_.extendDataRange(dataDomain[0], dataDomain[dataDomain.length - 1]);
      }
      if (anychart.utils.instanceOf(this.colorScale_, anychart.colorScalesModule.Ordinal))
        this.colorScale_.ticks().markInvalid();
    }
    this.invalidatePlotsWith(anychart.ConsistencyState.APPEARANCE);
    this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS);
    this.markConsistent(anychart.ConsistencyState.CALENDAR_COLOR_SCALE);
  }
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/**
 * Returns or create plot by number.
 * todo(anton.kagakin): rework to normal pool prbbly
 * @param {number} index
 * @returns {anychart.calendarModule.Plot}
 */
anychart.calendarModule.Chart.prototype.getPlot = function(index) {
  var plot = this.plots_[index];
  if (!plot) {
    plot = new anychart.calendarModule.Plot(this);
    plot.setParentEventTarget(this);
    this.plots_[index] = plot;
  }
  return plot;
};


//endregion
//region Settings
/**
 * Internal signal handler for years settings.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onYearsSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE |
      anychart.ConsistencyState.CALENDAR_PLOT_TITLE |
      anychart.ConsistencyState.CALENDAR_PLOT_BACKGROUND;
  }

  this.invalidatePlotsWith(state);
  this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Settings for plots. Since plot represents year.
 *
 * @param {Object=} opt_value - Object with settings for plots.
 * @return {anychart.calendarModule.Chart|anychart.calendarModule.settings.Years} - Settings of self for chaining.
 */
anychart.calendarModule.Chart.prototype.years = function(opt_value) {
  if (!this.yearsSettings_) {
    this.yearsSettings_ = new anychart.calendarModule.settings.Years();
    this.yearsSettings_.listenSignals(this.onYearsSignal_, this);
    this.setupCreated('years', this.yearsSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.yearsSettings_.setup(opt_value);
    return this;
  }

  return this.yearsSettings_;
};


/**
 * Internal signal handler for months settings.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onMonthsSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE | anychart.ConsistencyState.CALENDAR_PLOT_MONTHS_LABELS;
  }
  this.invalidatePlotsWith(state);
  this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Settings for months of each single plot.
 *
 * @param {Object=} opt_value - Object with settings for plot months.
 * @return {anychart.calendarModule.Chart|anychart.calendarModule.settings.Months} - Settings of self for chaining.
 */
anychart.calendarModule.Chart.prototype.months = function(opt_value) {
  if (!this.monthsSettings_) {
    this.monthsSettings_ = new anychart.calendarModule.settings.Months();
    this.monthsSettings_.listenSignals(this.onMonthsSignal_, this);
    this.setupCreated('months', this.monthsSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.monthsSettings_.setup(opt_value);
    return this;
  }

  return this.monthsSettings_;
};


/**
 * Internal signal handler for weeks settings.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onWeeksSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CALENDAR_PLOT_WEEK_LABELS;
  }
  this.invalidatePlotsWith(state);
  this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Settings for weeks of each single plot.
 *
 * @param {Object=} opt_value - Object with settings for plot months.
 * @return {anychart.calendarModule.Chart|anychart.calendarModule.settings.Weeks} - Settings of self for chaining.
 */
anychart.calendarModule.Chart.prototype.weeks = function(opt_value) {
  if (!this.weeksSettings_) {
    this.weeksSettings_ = new anychart.calendarModule.settings.Weeks();
    this.weeksSettings_.listenSignals(this.onWeeksSignal_, this);
    this.setupCreated('weeks', this.weeksSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.weeksSettings_.setup(opt_value);
    return this;
  }

  return this.weeksSettings_;
};


/**
 * Internal signal handler for days settings.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onDaysSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    state |= anychart.ConsistencyState.CALENDAR_PLOT_APPEARANCE;
  }
  this.invalidatePlotsWith(state);
  this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Settings for days of each single plot.
 *
 * @param {Object=} opt_value - Object with settings for plot days.
 * @return {anychart.calendarModule.Chart|anychart.calendarModule.settings.Days} - Settings of self for chaining.
 */
anychart.calendarModule.Chart.prototype.days = function(opt_value) {
  if (!this.daysSettings_) {
    this.daysSettings_ = new anychart.calendarModule.settings.Days();
    this.setupCreated('days', this.daysSettings_);
    this.daysSettings_.setupStateSettings();
    this.daysSettings_.listenSignals(this.onDaysSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.daysSettings_.setup(opt_value);
    return this;
  }

  return this.daysSettings_;
};


/**
 * Color scale signal handler.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onColorRangeSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CALENDAR_COLOR_RANGE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for color range.
 * @param {Object=} opt_value Color range settings to set.
 * @return {!(anychart.colorScalesModule.ui.ColorRange|anychart.calendarModule.Chart)} Return current chart color range or itself for chaining call.
 */
anychart.calendarModule.Chart.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.colorScalesModule.ui.ColorRange();
    this.setupCreated('colorRange', this.colorRange_);
    this.colorRange_.setParentEventTarget(this);
    this.colorRange_.listenSignals(this.onColorRangeSignal_, this);
    this.invalidate(anychart.ConsistencyState.CALENDAR_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


//endregion
//region Interactivity
/**
 * Creates context provider for tooltip.
 * @param {Object} tag
 * @return {anychart.format.Context}
 */
anychart.calendarModule.Chart.prototype.createContextProvider = function(tag) {
  if (!this.contextProvider_) {
    this.contextProvider_ = new anychart.format.Context();
  }

  var iterator = this.getIterator();
  var index = tag.dataIndex;
  iterator.select(index);

  var values = {
    'x': {
      value: tag.x,
      type: anychart.enums.TokenType.DATE
    },
    'timestamp': {
      value: tag.timestamp,
      type: anychart.enums.TokenType.NUMBER
    },
    'value': {
      value: tag.value,
      type: anychart.enums.TokenType.STRING
    },
    'weekNumber': {
      value: tag.weekNumber,
      type: anychart.enums.TokenType.NUMBER
    },
    'day': {
      value: tag.day,
      type: anychart.enums.TokenType.NUMBER
    },
    'month': {
      value: tag.month,
      type: anychart.enums.TokenType.NUMBER
    },
    'year': {
      value: tag.year,
      type: anychart.enums.TokenType.NUMBER
    },
    'index': {
      value: tag.dataIndex,
      type: anychart.enums.TokenType.NUMBER
    }
  };

  return /** @type {anychart.format.Context} */ (
    this.contextProvider_
      .dataSource(iterator)
      .propagate(values)
  );
};


/**
 * Returns resolution context for fill/stroke set with function.
 *
 * @param {string=} opt_baseColor - Base color to resolve with (for hovered/selected - normal state property value)
 * @return {Object} - Context object.
 */
anychart.calendarModule.Chart.prototype.getColorResolutionContext = function(opt_baseColor) {
  var sourceColor = opt_baseColor || 'blue 0.5';
  var value = this.getIterator().get('value');
  var colorScale = this.colorScale();
  var ctx = {
    'value': value,
    'sourceColor': sourceColor
  };

  if (colorScale) {
    ctx['scaledColor'] = colorScale.valueToColor(value);
  }

  return ctx;
};


/**
 * Resolves color property value depends on state.
 *
 * @param {string} propName - Property name that should be resolved.
 * @param {anychart.PointState|number} state - In which state property should be resolved.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} - Resolved color property.
 */
anychart.calendarModule.Chart.prototype.resolveColorProperty = function(propName, state) {
  var settings, stateProp;
  var days = this.days();
  if (state !== anychart.PointState.NORMAL) {
    settings = state === anychart.PointState.HOVER ? days.hovered() : days.selected();
    stateProp = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */ (settings.getOption(propName));

    if (goog.isDefAndNotNull(stateProp) && !goog.isFunction(stateProp))
      return stateProp;
  }

  var normalProp = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */ (days.normal().getOption(propName));
  var ctx;
  if (goog.isFunction(normalProp)) {
    ctx = this.getColorResolutionContext();
    normalProp = normalProp.call(ctx, ctx);
  }

  if (stateProp) {
    ctx = this.getColorResolutionContext(normalProp);
    return stateProp.call(ctx, ctx);
  }

  return normalProp;
};


/**
 * Colorizes point depends on state.
 *
 * @param {acgraph.vector.Path} path - Point dom element.
 * @param {anychart.PointState|number} state - State to colorize to.
 */
anychart.calendarModule.Chart.prototype.colorizePoint = function(path, state) {
  var index = path.tag.dataIndex;
  this.getIterator().select(index);
  var fill = /** @type {acgraph.vector.Fill} */ (this.resolveColorProperty('fill', state));
  var stroke = /** @type {acgraph.vector.Stroke} */ (this.resolveColorProperty('stroke', state));
  path.fill(fill);
  path.stroke(stroke);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.checkIfColorRange = function(target) {
  return anychart.utils.instanceOf(target, anychart.colorScalesModule.ui.ColorRange);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  var tag = /** @type {Object} */ (domTarget.tag);
  this.hoverPath_.tag = tag;
  var tooltip = this.tooltip();

  // we do not want to interact with color range for now
  if (tag && !this.checkIfColorRange(tag)) {
    var d = domTarget.attr('d');
    this.hoverPath_.attr('d', d);
    this.colorizePoint(this.hoverPath_, anychart.PointState.HOVER);
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(tag));
  } else {
    this.hoverPath_
      .clear()
      .fill('none')
      .stroke('none');
    tooltip.hide();
  }
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.handleMouseOut = function(event) {
  this.tooltip().hide();
  this.hoverPath_
    .clear()
    .fill('none')
    .stroke('none');
};


//endregion
//region Drawing
/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.calendarModule.Chart.prototype.onColorScaleSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CALENDAR_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Color scale.
 * @param {(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {anychart.calendarModule.Chart|anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear}
 */
anychart.calendarModule.Chart.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) && this.colorScale_) {
      this.colorScale_ = null;
      this.invalidate(anychart.ConsistencyState.CALENDAR_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
    } else {
      var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.COLOR_SCALES, null, this.onColorScaleSignal_, this);
      if (val) {
        var dispatch = this.colorScale_ == val;
        this.colorScale_ = val;
        this.setupCreated('colorScale', this.colorScale_);
        this.colorScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch)
          this.invalidate(anychart.ConsistencyState.CALENDAR_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * @param {Object|string} config
 * Setup colorScale for heatMap
 */
anychart.calendarModule.Chart.prototype.setupColorScale = function(config) {
  var scale;
  if (goog.isString(config)) {
    scale = anychart.scales.Base.fromString(config, null);
  } else if (goog.isObject(config)) {
    scale = anychart.scales.Base.fromString(config['type'], null);
    if (scale)
      scale.setup(config);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(/** @type {anychart.colorScalesModule.Ordinal} */(scale));
};


/**
 * Disables plots since from index to ensure in change of data, other plots will not be drawn.
 *
 * @param {number} from - Index to disable plots from.
 */
anychart.calendarModule.Chart.prototype.disablePlotsFromIndex = function(from) {
  for (var i = from; i < this.plots_.length; i++) {
    var plot = this.plots_[i];
    plot.enabled(false);
    plot.draw();
  }
};


/**
 * Returns actual chart height.
 * @return {number} Calculated chart height.
 */
anychart.calendarModule.Chart.prototype.getActualHeight = function() {
  return this.actualHeight_;
};


/**
 * Draw plots.
 *
 * @param {anychart.math.Rect} bounds - Bounds to draw plots at.
 */
anychart.calendarModule.Chart.prototype.drawPlots = function(bounds) {
  var isInverted = this.years().getOption('inverted');

  var title = this.years().title();
  var background = this.years().background();
  var titleSettings = title.serialize();
  var backgroundSettings = background.serialize();
  title.markConsistent(anychart.ConsistencyState.ALL);
  title.background().markConsistent(anychart.ConsistencyState.ALL);
  background.markConsistent(anychart.ConsistencyState.ALL);

  var plotJson = {
    title: titleSettings,
    background: backgroundSettings
  };

  this.actualHeight_ = 0;

  var nextPlotBounds = bounds.clone();
  var plotUnderSpace = /** @type {number} */ (this.yearsSettings_.getOption('underSpace'));

  var i;
  var actualPlotHeight;
  var representedYearsLength = this.representedYears_.length;
  for (i = 0; i < representedYearsLength; i++) {
    var plotIndex = isInverted ? representedYearsLength - i - 1 : i;
    var year = this.representedYears_[plotIndex];

    var plot = this.getPlot(plotIndex);

    plot.setupByJSON(plotJson, false);

    plot.container(this.rootLayer);
    plot.setYear(year);
    plot.setDataMeta(this.dataMeta_[year]);
    plot.title().text(String(year));

    plot.parentBounds(nextPlotBounds);
    plot.draw();

    actualPlotHeight = plot.getActualPlotHeight();
    nextPlotBounds = anychart.math.rect(
      nextPlotBounds.left,
      nextPlotBounds.top + actualPlotHeight + plotUnderSpace,
      nextPlotBounds.width,
      nextPlotBounds.height
    );
    this.actualHeight_ += actualPlotHeight + plotUnderSpace;
  }

  if (representedYearsLength > 0) {
    this.actualHeight_ -= plotUnderSpace;
  }

  this.actualHeight_ += this.dataBounds_.top - this.getPixelBounds().top;

  this.disablePlotsFromIndex(this.representedYears_.length);
};


/**
 * Invalidates passed consistency state for plots.
 * @param {number} state - State to invalidate.
 */
anychart.calendarModule.Chart.prototype.invalidatePlotsWith = function(state) {
  var isInverted = /** @type {boolean} */ (this.years().getOption('inverted'));

  for (var i = 0; i < this.plots_.length; i++) {
    var plotIndex = isInverted ? this.representedYears_.length - i - 1 : i;
    var plot = this.getPlot(plotIndex);
    plot.invalidate(state);
  }
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.drawContent = function(bounds) {
  if (!this.checkDrawingNeeded()) {
    return;
  }

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.calendarModule.Chart.ZINDEX_CALENDAR);
  }

  if (!this.hoverPath_) {
    this.hoverPath_ = this.rootLayer.path();
    this.hoverPath_.zIndex(9999);
  }

  this.calculate();

  var colorRange = this.getCreated('colorRange');
  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_COLOR_RANGE)) {
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.scale(this.colorScale());
      // we do not want to interact with color range for now
      // colorRange.target(this);
      colorRange.resumeSignalsDispatching(false);
      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (colorRange) {
      colorRange.parentBounds(bounds.clone().round());
      this.dataBounds_ = colorRange.getRemainingBounds();
    } else {
      this.dataBounds_ = bounds.clone();
    }
    this.invalidate(anychart.ConsistencyState.CALENDAR_PLOTS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_COLOR_RANGE)) {
    if (colorRange) {
      colorRange.suspendSignalsDispatching();
      colorRange.container(this.rootLayer);
      colorRange.zIndex(50);
      colorRange.draw();
      colorRange.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.CALENDAR_COLOR_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALENDAR_PLOTS)) {
    this.drawPlots(this.dataBounds_);
    this.markConsistent(anychart.ConsistencyState.CALENDAR_PLOTS);
  }

};


//endregion
//region CSV
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getDataHolders = function() {
  return /** @type {Array.<{data: function():anychart.data.IDataSource}>} */([this]);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getCsvColumns = function(dataHolder) {
  return ['x', 'value'];
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.serialize = function() {
  var json = anychart.calendarModule.Chart.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['tooltip'] = this.tooltip().serialize();

  //anychart.core.settings.serialize(this, anychart.calendarModule.Chart.OWN_DESCRIPTORS, json);

  if (this.getCreated('years'))
    json['years'] = this.years().serialize();

  if (this.getCreated('months'))
    json['months'] = this.months().serialize();

  if (this.getCreated('weeks'))
    json['weeks'] = this.weeks().serialize();

  if (this.getCreated('days'))
    json['days'] = this.days().serialize();

  if (this.getCreated('colorScale'))
    json['colorScale'] = this.colorScale().serialize();

  if (this.getCreated('colorRange'))
    json['colorRange'] = this.colorRange().serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.calendarModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('data' in config)
    this.data(config['data']);

  if ('years' in config)
    this.years().setupInternal(!!opt_default, config['years']);

  if ('months' in config)
    this.months().setupInternal(!!opt_default, config['months']);

  if ('weeks' in config)
    this.weeks().setupInternal(!!opt_default, config['weeks']);

  if ('days' in config)
    this.days().setupInternal(!!opt_default, config['days']);

  if ('colorScale' in config) {
    var json = config['colorScale'];
    var scale = null;
    if (goog.isString(json)) {
      scale = anychart.scales.Base.fromString(json, null);
    } else if (goog.isObject(json)) {
      scale = anychart.scales.Base.fromString(json['type'], null);
      if (scale)
        scale.setup(json);
    }
    if (scale)
      this.colorScale(/** @type {anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} */ (scale));
  }

  if ('colorRange' in config)
    this.colorRange(config['colorRange']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  //anychart.core.settings.deserialize(this, anychart.calendarModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.data_,
    this.parentViewToDispose_,
    this.yearsSettings_,
    this.monthsSettings_,
    this.weeksSettings_,
    this.daysSettings_,
    this.colorScale_,
    this.colorRange_
  );

  this.data_ = null;
  this.parentViewToDispose_ = null;
  delete this.iterator_;

  this.yearsSettings_ = null;
  this.monthsSettings_ = null;
  this.weeksSettings_ = null;
  this.daysSettings_ = null;
  this.colorScale_ = null;
  this.colorRange_ = null;

  anychart.calendarModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function() {
  var proto = anychart.calendarModule.Chart.prototype;
  // common
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['noData'] = proto.noData;
  proto['tooltip'] = proto.tooltip;

  proto['colorRange'] = proto.colorRange;
  proto['colorScale'] = proto.colorScale;

  proto['years'] = proto.years;
  proto['months'] = proto.months;
  proto['weeks'] = proto.weeks;
  proto['days'] = proto.days;

  proto['getActualHeight'] = proto.getActualHeight;

  // auto generated
})();


//endregion
