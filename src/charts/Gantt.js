goog.provide('anychart.charts.Gantt');

goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.DataGrid');
goog.require('anychart.core.ui.IInteractiveGrid');
goog.require('anychart.core.ui.Splitter');
goog.require('anychart.core.ui.Timeline');
goog.require('anychart.core.utils.GanttContextProvider');
goog.require('anychart.data.Tree');



/**
 * Gantt chart implementation.
 * TODO (A.Kudryavtsev): Describe.
 * TODO (A.Kudryavtsev): Actually, must not be exported as is.
 *
 * @param {boolean=} opt_isResourcesChart - Flag if chart should be interpreted as resource chart.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.ui.IInteractiveGrid}
 */
anychart.charts.Gantt = function(opt_isResourcesChart) {
  anychart.charts.Gantt.base(this, 'constructor');

  /**
   * Flag if chart must be created as resource chart.
   * NOTE: Can not be and must not be modified after initialization of chart.
   * General differences between project chart and resource chart:
   *  1) Resources chart works with periods.
   *  2) Resources chart has not progress and milestones.
   *
   * i.e. the difference between the types is:
   *  - in the way of processing incoming data.
   *  - in the method of drawing the timeline.
   *
   * Note: if user creates a RESOURCE chart and passes the PROJECT-chart-specific-data, he will probably get incorrect
   *  data visualization.
   *
   * @type {boolean}
   * @private
   */
  this.isResourcesChart_ = !!opt_isResourcesChart;

  this.controller_ = new anychart.core.gantt.Controller(this.isResourcesChart_);
  this.controller_.dataGrid(/** @type {anychart.core.ui.DataGrid} */ (this.getDataGrid_()));
  this.controller_.timeline(/** @type {anychart.core.ui.Timeline} */ (this.getTimeline()));
  this.registerDisposable(this.controller_);
  this.controller_.listenSignals(this.controllerInvalidated_, this);


  /**
   * Data tree.
   * @type {anychart.data.Tree|anychart.data.TreeView}
   * @private
   */
  this.data_ = null;


  /**
   * Data grid of gantt chart.
   * @type {anychart.core.ui.DataGrid}
   * @private
   */
  this.dg_ = null;


  /**
   * Timeline of gantt chart.
   * @type {anychart.core.ui.Timeline}
   * @private
   */
  this.tl_ = null;


  /**
   * Splitter between DG and TL.
   * @type {anychart.core.ui.Splitter}
   * @private
   */
  this.splitter_ = null;

  /**
   * Splitter position. Percent or pixel value of splitter position.
   * Pixel value in this case is actually a width of data grid.
   * @type {(string|number)}
   * @private
   */
  this.splitterPosition_ = NaN;

  /**
   * Default header height.
   * @type {number}
   * @private
   */
  this.headerHeight_ = NaN;

  /**
   * Default hover fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.hoverFill_;

  /**
   * Default row selected fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowSelectedFill_;


  /**
   * Cell border settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.columnStroke_;

  /**
   * Row vertical line separation path.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.rowStroke_;

  /**
   * Whether is editable.
   * @type {boolean}
   */
  this.editable = false;

  /**
   * Context provider.
   * @type {anychart.core.utils.GanttContextProvider}
   * @private
   */
  this.formatProvider_ = null;

  /**
   * Vertical scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = this.controller_.getScrollBar();
  this.verticalScrollBar_.zIndex(anychart.charts.Gantt.Z_INDEX_SCROLL);
  this.verticalScrollBar_.listenSignals(this.scrollInvalidated_, this);
  this.registerDisposable(this.verticalScrollBar_);

  this.listenOnce(anychart.enums.EventType.CHART_DRAW, function() {
    this.dataGrid().initMouseFeatures();
    this.getTimeline().initMouseFeatures();
    this.dataGrid().initKeysFeatures();
    this.getTimeline().initKeysFeatures();
  }, false, this);
};
goog.inherits(anychart.charts.Gantt, anychart.core.SeparateChart);


/** @inheritDoc */
anychart.charts.Gantt.prototype.getType = function() {
  return this.isResourcesChart_ ?
      anychart.enums.ChartTypes.GANTT_RESOURCE :
      anychart.enums.ChartTypes.GANTT_PROJECT;
};


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Gantt.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.GANTT_DATA | //New data is set.
    anychart.ConsistencyState.GANTT_POSITION | //Position means that position of data items in DG and TL was changed.
    anychart.ConsistencyState.GANTT_SPLITTER_POSITION; //Position of splitter has been changed.


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Gantt.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Default date time pattern.
 * @type {string}
 */
anychart.charts.Gantt.DEFAULT_DATE_TIME_PATTERN = 'yyyy.MM.dd';


/**
 * Splitter z-index.
 * @type {number}
 */
anychart.charts.Gantt.Z_INDEX_SPLITTER = 10;


/**
 * Data grid and timeline z-index.
 * @type {number}
 */
anychart.charts.Gantt.Z_INDEX_DG_TL = 5;


/**
 * Scroll z-index.
 * @type {number}
 */
anychart.charts.Gantt.Z_INDEX_SCROLL = 20;


/** @inheritDoc */
anychart.charts.Gantt.prototype.usesTreeData = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.getVersionHistoryLink = function() {
  return 'http://anychart.com/products/anygantt/history';
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.createFormatProvider = function(item, opt_period, opt_periodIndex) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.core.utils.GanttContextProvider(this.controller_.isResources());
  this.formatProvider_.currentItem = item;
  this.formatProvider_.currentPeriod = opt_period;
  this.formatProvider_.currentPeriodIndex = opt_periodIndex;
  this.formatProvider_.applyReferenceValues();
  return this.formatProvider_;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.charts.Gantt.prototype.makePointEvent = function(event) {
  return null;
};


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Gantt}  {@link anychart.charts.Pie} instance for method chaining.
 */
anychart.charts.Gantt.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * Hover a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Gantt}  {@link anychart.charts.Pie} instance for method chaining.
 */
anychart.charts.Gantt.prototype.hoverPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.charts.Gantt|anychart.enums.HoverMode} .
 */
anychart.charts.Gantt.prototype.hoverMode = function(opt_value) {
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
 * Controller invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.charts.Gantt.prototype.controllerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Scroll invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.charts.Gantt.prototype.scrollInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) event.target.draw();
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets/sets chart data.
 * @param {(anychart.data.Tree|anychart.data.TreeView|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {(anychart.data.Tree|anychart.data.TreeView|anychart.charts.Gantt)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.data.Tree || opt_value instanceof anychart.data.TreeView) {
      if (this.data_ != opt_value) {
        this.data_ = opt_value;
        this.invalidate(anychart.ConsistencyState.GANTT_DATA, anychart.Signal.NEEDS_REDRAW);
      }
    } else {
      this.data_ = new anychart.data.Tree(opt_value, opt_fillMethod);
      this.invalidate(anychart.ConsistencyState.GANTT_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * @inheritDoc
 */
anychart.charts.Gantt.prototype.defaultRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller_.defaultRowHeight(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller_.defaultRowHeight());
};


/**
 * Gets/sets header height.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.charts.Gantt|number)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.headerHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.headerHeight_ != opt_value) {
      this.headerHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.headerHeight_;
};


/**
 * Internal getter for data grid.
 * @return {anychart.core.ui.DataGrid} - Chart's data grid.
 * @private
 */
anychart.charts.Gantt.prototype.getDataGrid_ = function() {
  if (!this.dg_) {
    this.dg_ = new anychart.core.ui.DataGrid(this.controller_);
    this.dg_.backgroundFill(null);
    this.dg_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.dg_.interactivityHandler = this;
    this.registerDisposable(this.dg_);
    var ths = this;
    this.dg_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);
  }

  return this.dg_;
};


/**
 * Gets data grid or enables/disables it.
 * NOTE: In current implementation (25 Feb 2015) data grid is not configurable by JSON, can't be set directly and can't be null.
 * @param {boolean=} opt_enabled - If data grid must be enabled/disabled.
 * @return {(anychart.core.ui.DataGrid|anychart.charts.Gantt)} - Data grid or chart itself for method chaining.
 */
anychart.charts.Gantt.prototype.dataGrid = function(opt_enabled) {
  if (goog.isDef(opt_enabled)) {
    if (this.getDataGrid_().enabled() != opt_enabled) {
      anychart.core.Base.suspendSignalsDispatching(this.getDataGrid_(), this.splitter());
      this.getDataGrid_().enabled(opt_enabled);
      this.splitter().enabled(opt_enabled);
      anychart.core.Base.resumeSignalsDispatchingFalse(this.getDataGrid_(), this.splitter()); //We don't need to send any signal.

      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW); //Invalidate a whole chart.
    }
    return this;
  }
  return this.getDataGrid_();
};


/**
 * Getter for timeline.
 * @return {anychart.core.ui.Timeline} - Chart's timeline.
 */
anychart.charts.Gantt.prototype.getTimeline = function() {
  if (!this.tl_) {
    this.tl_ = new anychart.core.ui.Timeline(this.controller_, this.isResourcesChart_);
    this.tl_.backgroundFill(null);
    this.tl_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.tl_.interactivityHandler = this;
    this.registerDisposable(this.tl_);
    var ths = this;
    this.tl_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);
  }

  return this.tl_;
};


/**
 * Gets/sets row hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Gantt|string} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.rowHoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = acgraph.vector.normalizeFill.apply(null, arguments);
    //rowHoverFill does not invalidate anything. Here's no need to suspend it.
    this.getTimeline().rowHoverFill(this.hoverFill_);
    this.getDataGrid_().rowHoverFill(this.hoverFill_);
    return this;
  }
  return this.hoverFill_;
};


/**
 * Gets/sets row selected fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.Gantt|string} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.rowSelectedFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.rowSelectedFill_), val)) {
      this.rowSelectedFill_ = val;
      anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_());
      this.tl_.rowSelectedFill(this.rowSelectedFill_);
      this.dg_.rowSelectedFill(this.rowSelectedFill_);
      anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
    }
    return this;
  }
  return this.rowSelectedFill_;
};


/**
 * Gets/sets column stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.charts.Gantt)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.columnStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_());
    this.columnStroke_ = val;
    this.dg_.columnStroke(val);
    this.tl_.columnStroke(val);
    anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
    return this;
  }
  return this.columnStroke_;
};


/**
 * Gets/sets row stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.charts.Gantt)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.rowStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_(), this.controller_);
    this.rowStroke_ = val;
    this.dg_.rowStroke(val);
    this.tl_.rowStroke(val);
    this.controller_.rowStrokeThickness(anychart.utils.extractThickness(val));
    anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.controller_);
    return this;
  }
  return this.rowStroke_;
};


/**
 * Timeline zoom in.
 * @param {number=} opt_zoomFactor - Zoom factor.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.zoomIn = function(opt_zoomFactor) {
  this.getTimeline().getScale().zoomIn(opt_zoomFactor);
  return this;
};


/**
 * Timeline zoom out.
 * @param {number=} opt_zoomFactor - Zoom factor.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.zoomOut = function(opt_zoomFactor) {
  this.getTimeline().getScale().zoomOut(opt_zoomFactor);
  return this;
};


/**
 * Timeline zoom to range.
 *
 * @param {number|anychart.enums.Interval} startOrUnit - Start date timestamp or interval unit.
 * @param {number=} opt_endOrCount - End date timestamp or interval units count (can't be 0).
 * @param {anychart.enums.GanttRangeAnchor=} opt_anchor - Anchor to zoom from.
 *
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.zoomTo = function(startOrUnit, opt_endOrCount, opt_anchor) {
  this.getTimeline().getScale().zoomTo(startOrUnit, opt_endOrCount, opt_anchor);
  return this;
};


/**
 * Fits all visible data to timeline width.
 * TODO (A.Kudryavtsev): Change description.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.fitAll = function() {
  this.getTimeline().getScale().fitAll();
  return this;
};


/**
 * Fits timeline visible area to task's range.
 * TODO (A.Kudryavtsev): Change description.
 * @param {string} taskId - Task id.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.fitToTask = function(taskId) {
  var foundTasks = this.data_.searchItems(anychart.enums.GanttDataFields.ID, taskId);
  if (foundTasks.length) {
    var task = foundTasks[0];
    var actualStart = task.meta(anychart.enums.GanttDataFields.ACTUAL_START);
    var actualEnd = task.meta(anychart.enums.GanttDataFields.ACTUAL_END);
    var isMilestone = goog.isDef(actualStart) && ((!isNaN(actualStart) && !goog.isDef(actualEnd)) || (actualStart == actualEnd));
    if (isMilestone) { //no range for milestone.
      anychart.core.reporting.warning(anychart.enums.WarningCode.GANTT_FIT_TO_TASK, null, [taskId]);
    } else {
      this.getTimeline().getScale().setRange(actualStart, actualEnd); //this will redraw timeline first time.

      var bounds = this.tl_.pixelBoundsCache;

      if (bounds.width > 0) {
        var relatedBounds = task.meta('relBounds');
        var labelBounds = task.meta('labelBounds');
        if (relatedBounds && labelBounds) {
          var labelLefter = labelBounds.left < relatedBounds.left;
          var labelRighter = labelBounds.left + labelBounds.width > relatedBounds.left + relatedBounds.width;

          var leftVal, rightVal;
          if (labelBounds.width < bounds.width) {
            var enlargeRatio = bounds.width / (bounds.width - labelBounds.width);
            if (labelLefter && !labelRighter) {
              leftVal = this.tl_.scale().ratioToTimestamp(1 - enlargeRatio);
              rightVal = this.tl_.scale().ratioToTimestamp(1);
            }
            if (labelRighter && !labelLefter) {
              leftVal = this.tl_.scale().ratioToTimestamp(0);
              rightVal = this.tl_.scale().ratioToTimestamp(enlargeRatio);
            }
          } else {
            leftVal = this.tl_.scale().ratioToTimestamp(0);
            rightVal = this.tl_.scale().ratioToTimestamp(labelBounds.width / bounds.width);
          }
          this.getTimeline().getScale().setRange(leftVal, rightVal); //this will redraw timeline second time.
        }
      }
    }
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.NOT_FOUND, null, ['Task', taskId]);
  }

  return this;
};


/**
 * Performs vertical scroll to pxOffset.
 * TODO (A.Kudryavtsev): See full description in related method of controller.
 * @param {number} pxOffset - Pixel offset.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.scrollTo = function(pxOffset) {
  this.controller_.scrollTo(pxOffset);
  return this;
};


/**
 * Performs vertical scroll to rowIndex specified.
 * TODO (A.Kudryavtsev): See full description in related method of controller.
 * @param {number} rowIndex - Row index.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.scrollToRow = function(rowIndex) {
  this.controller_.scrollToRow(rowIndex);
  return this;
};


/**
 * Gets timeline scale.
 * @param {Object=} opt_value - Scale config.
 * @return {anychart.charts.Gantt|anychart.scales.GanttDateTime}
 */
anychart.charts.Gantt.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.getTimeline().scale(opt_value);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.getTimeline().scale());
};


/**
 * Scrolls vertically to specified index.
 * @param {number=} opt_index - End index to scroll to.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.scrollToEnd = function(opt_index) {
  this.controller_.scrollToEnd(opt_index);
  return this;
};


/**
 * Collapses all.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.collapseAll = function() {
  this.controller_.collapseAll();
  return this;
};


/**
 * Expands all.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.expandAll = function() {
  this.controller_.expandAll();
  return this;
};


/**
 * Expands/collapses task.
 * @param {string} taskId
 * @param {boolean} value - Value to be set.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 * @private
 */
anychart.charts.Gantt.prototype.collapseTask_ = function(taskId, value) {
  var foundTasks = this.data_.searchItems(anychart.enums.GanttDataFields.ID, taskId);
  if (foundTasks.length) {
    var task = foundTasks[0];
    var evtObj = {
      'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
      'item': task,
      'collapsed': value
    };

    if (this.dispatchEvent(evtObj))
      task.meta(anychart.enums.GanttDataFields.COLLAPSED, value);

  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.NOT_FOUND, null, ['Task', taskId]);
  }
  return this;
};


/**
 * Expands task.
 * @param {string} taskId - Task id.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.expandTask = function(taskId) {
  return this.collapseTask_(taskId, false);
};


/**
 * Collapses task.
 * @param {string} taskId - Task id.
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.collapseTask = function(taskId) {
  return this.collapseTask_(taskId, true);
};


/**
 * Gets/sets splitter position.
 * @param {(string|number)=} opt_value - Pixel or percent value. Actually sets a width of data grid.
 * @return {(anychart.charts.Gantt|number|string)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.splitterPosition = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.splitterPosition_ != opt_value) {
      this.splitterPosition_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GANTT_SPLITTER_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.splitterPosition_;
};


/**
 * Getter/setter for splitter.
 * TODO (A.Kudryavtsev): Turn it to getter for a while?
 * @param {(Object|boolean|null)=} opt_value - Value to be set.
 * @return {(anychart.charts.Gantt|anychart.core.ui.Splitter)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.splitter = function(opt_value) {
  if (!this.splitter_) {
    this.splitter_ = new anychart.core.ui.Splitter();
    this.registerDisposable(this.splitter_);
    this.splitter_.zIndex(anychart.charts.Gantt.Z_INDEX_SPLITTER);

    var ths = this;
    this.splitter_.listenSignals(function() {
      ths.splitter_.draw();
    }, this.splitter_);

    this.splitter_//TODO (A.Kudryavtsev): Move this settings to theme.
        .suspendSignalsDispatching()
        .layout(anychart.enums.Layout.VERTICAL)
        .position(this.splitterPosition_)
        .dragPreviewFill('#000 0.3')
        .stroke('none')
        .splitterWidth(2)
        .fill('#cecece')
        .considerSplitterWidth(true)
        .resumeSignalsDispatching(false);

    this.splitter_.listen(anychart.enums.EventType.SPLITTER_CHANGE, function() {
      //This also stores current position for case if dg is being disabled.
      //Here we don't check if newPosition == oldPosition because it is handled by splitter.
      ths.splitterPosition_ = Math.round(ths.splitter().position() * this.pixelBoundsCache_.width);
      ths.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    });

  }

  if (goog.isDef(opt_value)) {
    this.splitter_.setup(opt_value);
    return this;
  } else {
    return this.splitter_;
  }
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.createLegendItemsProvider = function(sourceMode) {
  return []; //TODO (A.Kudryavtsev): Do we need any kind of standard legend here?
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Row click interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/**
 * Row double click interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowDblClick = function(event) {
  this.rowExpandCollapse(event);
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
  this.dg_.highlight(opt_index, opt_startY, opt_endY);
  this.tl_.highlight(opt_index, opt_startY, opt_endY);
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.editStructureHighlight = function(opt_index, opt_startY, opt_endY) {
  this.dg_.editStructureHighlight(opt_index, opt_startY, opt_endY);
  this.tl_.editStructureHighlight(opt_index, opt_startY, opt_endY);
};


/**
 * Row mouse move interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowMouseMove = function(event) {
  var target = event['target'];
  if (!target.dragging) {
    this.highlight(event['hoveredIndex'], event['startY'], event['endY']);

    var tooltip;
    if (target instanceof anychart.core.ui.DataGrid) {
      tooltip = /** @type {anychart.core.ui.Tooltip} */(this.dg_.tooltip());
    } else {
      tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tl_.tooltip());
    }

    var formatProvider = this.createFormatProvider(event['item'], event['period'], event['periodIndex']);
    tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
  }
};


/**
 * Row mouse over interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowMouseOver = function(event) {
};


/**
 * Row mouse out interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowMouseOut = function(event) {
  this.highlight();
  this.dg_.tooltip().hide();
  this.tl_.tooltip().hide();
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowSelect = function(event) {
  if (!this.tl_.checkRowSelection(event)) {
    this.tl_.connectorUnselect(event);
    var item = event['item'];
    var period = event['period'];
    var periodId = period ? period[anychart.enums.GanttDataFields.ID] : void 0;
    if (item && ((!item.meta('selected') && this.dg_.selectRow(item)) | this.tl_.selectTimelineRow(item, periodId))) {
      var eventObj = {
        'type': anychart.enums.EventType.ROW_SELECT,
        'item': item
      };
      if (goog.isDef(period)) eventObj['period'] = period;
      this.dispatchEvent(eventObj);
    }
  }
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowExpandCollapse = function(event) {
  if (event && !this.tl_.checkConnectorDblClick(event)) {
    var item = event['item'];
    if (item && item.numChildren()) {
      var value = !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
      var evtObj = {
        'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
        'item': item,
        'collapsed': value
      };

      if (this.dispatchEvent(evtObj))
        item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
    }
  }
};


/**
 * Row mouse down interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.charts.Gantt.prototype.rowMouseDown = function(event) {
  event['target'].rowMouseDown(event);
};


/**
 * @inheritDoc
 */
anychart.charts.Gantt.prototype.rowUnselect = function(event) {
  if (this.dg_.selectedItem || this.tl_.selectedItem) {
    this.dg_.rowUnselect(event);
    this.tl_.rowUnselect(event);

    //NOTE: this event will not be dispatched by dg_ or tl_ because their interactivity handler is chart but not they are.
    var newEvent = {
      'type': anychart.enums.EventType.ROW_SELECT,
      'actualTarget': event ? event.target : this,
      'target': this,
      'originalEvent': event,
      'item': null //This is a real difference between 'select' and 'unselect' events.
    };
    this.dispatchEvent(newEvent);
  }
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.rowMouseUp = function(event) {
  event['target'].rowMouseUp(event);
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.editing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editable = opt_value;
    this.getDataGrid_().editing(opt_value);
    this.getTimeline().editing(opt_value);
    return this;
  }
  return this.editable;
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.deleteKeyHandler = function(e) {
  this.dg_.deleteKeyHandler(e);
  this.tl_.deleteKeyHandler(e);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Draw.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw gantt chart content items.
 * @param {anychart.math.Rect} bounds - Bounds of gantt chart content area.
 */
anychart.charts.Gantt.prototype.drawContent = function(bounds) {
  anychart.core.Base.suspendSignalsDispatching(this.getDataGrid_(), this.getTimeline(), this.splitter_, this.controller_);

  if (!this.splitter().container()) {
    this.dg_.container(this.rootElement);
    this.tl_.container(this.rootElement);
    this.splitter().container(this.rootElement);
    this.verticalScrollBar_.container(this.rootElement);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_SPLITTER_POSITION) || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (bounds.width > 0) {
      var dgWidth = Math.round(anychart.utils.normalizeSize(this.splitterPosition_, bounds.width));
      var dgRatio = goog.math.clamp(dgWidth / bounds.width, 0, 1);
      this.splitter().position(dgRatio);
      this.markConsistent(anychart.ConsistencyState.GANTT_SPLITTER_POSITION);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (bounds.width > 0) {
      if (this.dg_.enabled()) {
        this.splitter().bounds(bounds).draw();
      } else {
        this.tl_.bounds().set(bounds);
      }

      var newAvailableHeight = bounds.height - this.headerHeight_ - 1;
      if (this.controller_.availableHeight() != newAvailableHeight) {
        this.tl_.headerHeight(this.headerHeight_);
        this.dg_.headerHeight(this.headerHeight_);
        this.controller_.availableHeight(newAvailableHeight);
      }

      if (this.dg_.enabled()) {
        var b1 = this.splitter().getLeftBounds();
        var b2 = this.splitter().getRightBounds();
        this.dg_.bounds().set(b1);
        this.tl_.bounds().set(b2);
      }

      var tlBounds = this.tl_.getPixelBounds();

      var barSize = /** @type {number} */ (this.verticalScrollBar_.barSize());
      this.verticalScrollBar_.bounds(
          (bounds.left + bounds.width - barSize - 1),
          (tlBounds.top + this.headerHeight_ + barSize + 1),
          barSize,
          (tlBounds.height - this.headerHeight_ - 2 * barSize - 2)
      );
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_DATA)) {
    this.controller_.data(this.data_);
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION);
    this.markConsistent(anychart.ConsistencyState.GANTT_DATA);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.splitter_, this.controller_);
  this.controller_.run(); //This must redraw DG and TL.
  if (bounds.width > 0) {
    this.splitter().draw();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_POSITION)) {
    //This consistency state is used to set 'checkDrawingNeeded()' to TRUE. Controller must be run anyway.
    this.markConsistent(anychart.ConsistencyState.GANTT_POSITION);
  }

};


/** @inheritDoc */
anychart.charts.Gantt.prototype.serialize = function() {
  var json = anychart.charts.Gantt.base(this, 'serialize');

  json['type'] = this.getType();

  json['headerHeight'] = this.headerHeight();
  json['defaultRowHeight'] = this.defaultRowHeight();
  json['rowHoverFill'] = anychart.color.serialize(this.hoverFill_);
  json['rowSelectedFill'] = anychart.color.serialize(this.rowSelectedFill_);
  json['splitterPosition'] = this.splitterPosition();

  json['controller'] = this.controller_.serialize();
  json['dataGrid'] = this.dataGrid().serialize();
  json['timeline'] = this.getTimeline().serialize();

  return {'gantt': json};
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Gantt.base(this, 'setupByJSON', config, opt_default);

  if ('controller' in config) this.controller_.setupByJSON(config['controller'], opt_default);

  this.data(/** @type {anychart.data.Tree} */ (this.controller_.data()));

  this.headerHeight(config['headerHeight']);
  this.defaultRowHeight(config['defaultRowHeight']);
  this.rowHoverFill(config['rowHoverFill']);
  this.rowSelectedFill(config['rowSelectedFill']);
  this.splitterPosition(config['splitterPosition']);
  this.editing(config['editing']);

  if ('dataGrid' in config) this.dataGrid().setupByJSON(config['dataGrid'], opt_default);
  if ('timeline' in config) this.getTimeline().setupByJSON(config['timeline'], opt_default);

};


//exports
(function() {
  var proto = anychart.charts.Gantt.prototype;
  proto['data'] = proto.data;
  proto['dataGrid'] = proto.dataGrid;
  proto['getTimeline'] = proto.getTimeline;
  proto['rowHoverFill'] = proto.rowHoverFill;
  proto['rowSelectedFill'] = proto.rowSelectedFill;
  proto['columnStroke'] = proto.columnStroke;
  proto['rowStroke'] = proto.rowStroke;
  proto['zoomIn'] = proto.zoomIn;
  proto['zoomOut'] = proto.zoomOut;
  proto['zoomTo'] = proto.zoomTo;
  proto['headerHeight'] = proto.headerHeight;
  proto['fitAll'] = proto.fitAll;
  proto['fitToTask'] = proto.fitToTask;
  proto['scrollTo'] = proto.scrollTo;
  proto['scrollToRow'] = proto.scrollToRow;
  proto['scrollToEnd'] = proto.scrollToEnd;
  proto['collapseAll'] = proto.collapseAll;
  proto['expandAll'] = proto.expandAll;
  proto['expandTask'] = proto.expandTask;
  proto['collapseTask'] = proto.collapseTask;
  proto['splitterPosition'] = proto.splitterPosition;
  proto['getType'] = proto.getType;
  proto['editing'] = proto.editing;
  proto['toCsv'] = proto.toCsv;
  proto['xScale'] = proto.xScale;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
})();
