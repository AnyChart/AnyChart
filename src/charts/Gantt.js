goog.provide('anychart.charts.Gantt');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.gantt.Timeline');
goog.require('anychart.core.ui.DataGrid');
goog.require('anychart.core.ui.Splitter');
goog.require('goog.i18n.DateTimeFormat');



/**
 * Gantt chart implementation.
 * TODO (A.Kudryavtsev): Describe.
 * TODO (A.Kudryavtsev): Actually, must not be exported as is.
 *
 * @param {boolean=} opt_isResourcesChart - Flag if chart should be interpreted as resource chart.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 */
anychart.charts.Gantt = function(opt_isResourcesChart) {
  goog.base(this);

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
  this.registerDisposable(this.controller_);
  this.controller_.listenSignals(this.controllerInvalidated_, this);


  /**
   * Data tree.
   * @type {anychart.data.Tree}
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
   * @type {anychart.core.gantt.Timeline}
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
  this.splitterPosition_ = '30%';

  /**
   * Default header height.
   * @type {(number|string)}
   * @private
   */
  this.headerHeight_ = anychart.core.gantt.Timeline.DEFAULT_HEADER_HEIGHT;

  /**
   * Default hover fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.hoverFill_ = acgraph.vector.normalizeFill('#edf8ff');

  /**
   * Default row selected fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.rowSelectedFill_ = acgraph.vector.normalizeFill('#d2eafa');

  /**
   * Vertical scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = this.controller_.getScrollBar();
  this.verticalScrollBar_.zIndex(anychart.charts.Gantt.Z_INDEX_SCROLL);
  this.verticalScrollBar_.listenSignals(this.scrollInvalidated_, this.verticalScrollBar_);
  this.registerDisposable(this.verticalScrollBar_);

  /**
   * Timeline horizontal scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.timelineHorizontalScrollBar_ = this.getTimeline().getHorizontalScrollBar();
  this.timelineHorizontalScrollBar_.zIndex(anychart.charts.Gantt.Z_INDEX_SCROLL);
  this.timelineHorizontalScrollBar_.listenSignals(this.scrollInvalidated_, this.timelineHorizontalScrollBar_);
  this.registerDisposable(this.timelineHorizontalScrollBar_);


  /**
   * Data grid horizontal scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.dataGridHorizontalScrollBar_ = this.dataGrid().getHorizontalScrollBar();
  this.dataGridHorizontalScrollBar_.zIndex(anychart.charts.Gantt.Z_INDEX_SCROLL);
  this.dataGridHorizontalScrollBar_.listenSignals(this.scrollInvalidated_, this.dataGridHorizontalScrollBar_);
  this.registerDisposable(this.dataGridHorizontalScrollBar_);

  this.defaultDateTimeFormatter_ = new goog.i18n.DateTimeFormat(anychart.charts.Gantt.DEFAULT_DATE_TIME_PATTERN);

};
goog.inherits(anychart.charts.Gantt, anychart.core.SeparateChart);


/**
 * @type {string}
 */
anychart.charts.Gantt.CHART_TYPE = 'gantt';
anychart.chartTypesMap[anychart.charts.Gantt.CHART_TYPE] = anychart.charts.Gantt;


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


/**
 * Scroll bar side size.
 * @type {number}
 */
anychart.charts.Gantt.SCROLL_BAR_SIDE = 10;


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
};


/**
 * Gets/sets chart data.
 * @param {(anychart.data.Tree|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {(anychart.data.Tree|anychart.charts.Gantt)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.data = function(opt_data, opt_fillMethod) {
  if (goog.isDef(opt_data)) {
    if (opt_data instanceof anychart.data.Tree) {
      if (this.data_ != opt_data) {
        this.data_ = opt_data;
      }
    } else {
      this.data_ = new anychart.data.Tree(opt_data, opt_fillMethod);
    }
    this.invalidate(anychart.ConsistencyState.GANTT_DATA);
    return this;
  }
  return this.data_;
};


/**
 * Gets/sets header height.
 * @param {(number|string)=} opt_value - Value to be set.
 * @return {(anychart.charts.Gantt|number|string)} - Current value or itself for method chaining.
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
    this.dg_ = new anychart.core.ui.DataGrid();
    this.dg_.controller(this.controller_);
    this.dg_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.registerDisposable(this.dg_);
    var ths = this;
    this.dg_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);

    this.dg_.listen(anychart.enums.EventType.ROW_HOVER, function(e) {
      ths.tl_.highlight(e['index'], e['startY'], e['endY'], true);
    });

    this.dg_.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
      ths.tl_.selectRow(e['item']); //This also deselects previous item.
      ths.dispatchEvent(e);
      ths.tl_.invalidate(anychart.ConsistencyState.TIMELINE_POSITION, anychart.Signal.NEEDS_REDRAW);
    });

    this.dg_.tooltip().contentFormatter(function(data) {
      //data here is always a tree data item.

      var name = data.get(anychart.enums.GanttDataFields.NAME);

      var startDate = ths.isResourcesChart_ ?
          data.meta('minPeriodDate') :
          data.get(anychart.enums.GanttDataFields.ACTUAL_START);

      var endDate = ths.isResourcesChart_ ?
          data.meta('maxPeriodDate') :
          data.get(anychart.enums.GanttDataFields.ACTUAL_END);

      var progress = ths.isResourcesChart_ ? data.get(anychart.enums.GanttDataFields.PROGRESS_VALUE) : void 0;

      return (name ? name + '\n' : '') +
          (startDate ? 'Start Date: ' + ths.defaultDateTimeFormatter_.format(new goog.date.UtcDateTime(new Date(startDate))) + '\n' : '') +
          (endDate ? 'End Date: ' + ths.defaultDateTimeFormatter_.format(new goog.date.UtcDateTime(new Date(endDate))) : '') +
          (progress ? '\nComplete: ' + progress : '');

    });
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
      anychart.core.Base.suspendSignalsDispatching(this.getDataGrid_(), this.splitter(), this.dataGridHorizontalScrollBar_);
      this.getDataGrid_().enabled(opt_enabled);
      this.splitter().enabled(opt_enabled);
      this.dataGridHorizontalScrollBar_.enabled(opt_enabled);
      anychart.core.Base.resumeSignalsDispatchingFalse(this.getDataGrid_(), this.splitter(), this.dataGridHorizontalScrollBar_); //We don't need to send any signal.

      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW); //Invalidate a whole chart.
    }
    return this;
  }
  return this.getDataGrid_();
};


/**
 * Getter for timeline.
 * @return {anychart.core.gantt.Timeline} - Chart's timeline.
 */
anychart.charts.Gantt.prototype.getTimeline = function() {
  if (!this.tl_) {
    this.tl_ = new anychart.core.gantt.Timeline(this.controller_, this.isResourcesChart_);
    this.tl_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.registerDisposable(this.tl_);
    var ths = this;
    this.tl_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);

    this.tl_.listen(anychart.enums.EventType.ROW_HOVER, function(e) {
      ths.dg_.highlight(e['index'], e['startY'], e['endY'], true);
    });

    this.tl_.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
      ths.dg_.selectRow(e['item']); //This also deselects previous item.
      ths.dispatchEvent(e);
      ths.dg_.invalidate(anychart.ConsistencyState.DATA_GRID_CLICK, anychart.Signal.NEEDS_REDRAW);
    });

    this.tl_.tooltip().contentFormatter(function(data) {
      var isTreeDataItem = data instanceof anychart.data.Tree.DataItem; //If item is tree data item.

      var name = isTreeDataItem ?
          data.get(anychart.enums.GanttDataFields.NAME) :
          data['item'].get(anychart.enums.GanttDataFields.NAME);

      var startDate = isTreeDataItem ?
          data.get(anychart.enums.GanttDataFields.ACTUAL_START) :
          data['period'][anychart.enums.GanttDataFields.START];

      var endDate = isTreeDataItem ?
          data.get(anychart.enums.GanttDataFields.ACTUAL_END) :
          data['period'][anychart.enums.GanttDataFields.END];

      var progress = isTreeDataItem ? data.get(anychart.enums.GanttDataFields.PROGRESS_VALUE) : void 0;

      return (name ? name + '\n' : '') +
          (startDate ? 'Start Date: ' + ths.defaultDateTimeFormatter_.format(new goog.date.UtcDateTime(new Date(startDate))) + '\n' : '') +
          (endDate ? 'End Date: ' + ths.defaultDateTimeFormatter_.format(new goog.date.UtcDateTime(new Date(endDate))) : '') +
          (progress ? '\nComplete: ' + progress : '');

    });
  }

  return this.tl_;
};


/**
 * Gets/sets row hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
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
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
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
      anychart.core.Base.suspendSignalsDispatching(this.dg_, this.tl_);
      this.getTimeline().rowSelectedFill(this.rowSelectedFill_);
      this.getDataGrid_().rowSelectedFill(this.rowSelectedFill_);
      anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
    }
    return this;
  }
  return this.rowSelectedFill_;
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
 * TODO (A.Kudryavtsev): Take full behaviour description from scale's zoomTo() method.
 *
 * @param {number} startDate - Start date.
 * @param {number=} opt_endDate - End date.
 *
 * @return {anychart.charts.Gantt} - Itself for method chaining.
 */
anychart.charts.Gantt.prototype.zoomTo = function(startDate, opt_endDate) {
  this.getTimeline().getScale().zoomTo(startDate, opt_endDate);
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
    var actualStart = task.get(anychart.enums.GanttDataFields.ACTUAL_START);
    var actualEnd = task.get(anychart.enums.GanttDataFields.ACTUAL_END);
    if (actualStart && actualEnd) { //no range for milestone.
      this.getTimeline().getScale().setRange(actualStart, actualEnd);
    } else {
      anychart.utils.warning(anychart.enums.WarningCode.GANTT_FIT_TO_TASK, null, [taskId]);
    }
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.NOT_FOUND, null, ['Task', taskId]);
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
    task.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.NOT_FOUND, null, ['Task', taskId]);
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

    this.splitter_
        .suspendSignalsDispatching()
        .layout(anychart.enums.Layout.VERTICAL)
        .position(this.splitterPosition_)
        .dragPreviewFill('#000 0.3')
        .fill({
          'keys': ['0 #9ccae3', '0.5 #a9dbf6', '1 #e3f4fc'],
          'angle': -90,
          'opacity': .5
        })
        .considerSplitterWidth(true)
        .resumeSignalsDispatching(false);

    this.splitter_.listen(anychart.enums.EventType.SPLITTER_CHANGE, function() {
      //This also stores current position for case if dg is being disabled.
      //Here we don't check if newPosition == oldPosition because it is handled by splitter.
      ths.splitterPosition_ = anychart.math.round(100 * ths.splitter().position(), 2) + '%';
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


/**
 * Draw gantt chart content items.
 * @param {anychart.math.Rect} bounds - Bounds of gantt chart content area.
 */
anychart.charts.Gantt.prototype.drawContent = function(bounds) {

  anychart.core.Base.suspendSignalsDispatching(this.dg_, this.tl_, this.splitter_, this.controller_);

  var boundsChanged = false;

  if (!this.splitter().container()) {
    this.getDataGrid_().container(this.rootElement);
    this.getTimeline().container(this.rootElement);
    this.splitter().container(this.rootElement);
    this.verticalScrollBar_.container(this.rootElement);
    this.dataGridHorizontalScrollBar_.container(this.rootElement);
    this.timelineHorizontalScrollBar_.container(this.rootElement);
  }

  if (!this.controller_.dataGrid()) this.controller_.dataGrid(/** @type {anychart.core.ui.DataGrid} */ (this.getDataGrid_()));
  if (!this.controller_.timeline()) this.controller_.timeline(/** @type {anychart.core.gantt.Timeline} */ (this.getTimeline()));

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_SPLITTER_POSITION)) {
    var dgWidth = anychart.utils.normalizeSize(this.splitterPosition_, bounds.width);
    var dgRatio = goog.math.clamp(dgWidth / bounds.width, 0, 1);
    this.splitter().position(dgRatio);
    this.markConsistent(anychart.ConsistencyState.GANTT_SPLITTER_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.getDataGrid_().enabled()) {
      this.splitter().bounds(bounds);
    } else {
      this.tl_.bounds().set(bounds);
    }

    var newAvailableHeight = bounds.height - this.headerHeight_;
    if (this.controller_.availableHeight() != newAvailableHeight) {
      this.controller_.availableHeight(newAvailableHeight);
      //This will apply changes in title height.
      this.tl_.invalidate(anychart.ConsistencyState.BOUNDS);
      this.dg_.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    boundsChanged = true;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_DATA)) {
    this.controller_.data(this.data_);
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION);
    this.markConsistent(anychart.ConsistencyState.GANTT_DATA);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.splitter_, this.controller_);
  this.controller_.run(); //This must redraw DG and TL.
  this.splitter().draw();

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_POSITION)) {
    //This consistency state is used to set 'checkDrawingNeeded()' to TRUE. Controller must be run anyway.
    this.markConsistent(anychart.ConsistencyState.GANTT_POSITION);
  }

  if (boundsChanged) {
    if (this.dg_.enabled()) {
      var b1 = this.splitter().getLeftBounds();
      var b2 = this.splitter().getRightBounds();
      this.getDataGrid_().bounds().set(b1);
      this.getTimeline().bounds().set(b2);

      var dgBounds = this.dg_.getPixelBounds();

      this.dataGridHorizontalScrollBar_.bounds(
          (dgBounds.left + anychart.charts.Gantt.SCROLL_BAR_SIDE),
          (dgBounds.top + dgBounds.height - anychart.charts.Gantt.SCROLL_BAR_SIDE - 1),
          (dgBounds.width - 2 * anychart.charts.Gantt.SCROLL_BAR_SIDE),
          anychart.charts.Gantt.SCROLL_BAR_SIDE
      );
    }

    var tlBounds = this.tl_.getPixelBounds();

    this.verticalScrollBar_.bounds(
        (bounds.left + bounds.width - anychart.charts.Gantt.SCROLL_BAR_SIDE - 1),
        (tlBounds.top + this.headerHeight_ + anychart.charts.Gantt.SCROLL_BAR_SIDE + 1),
        anychart.charts.Gantt.SCROLL_BAR_SIDE,
        (tlBounds.height - this.headerHeight_ - 2 * anychart.charts.Gantt.SCROLL_BAR_SIDE - 2)
    );

    this.timelineHorizontalScrollBar_.bounds(
        (tlBounds.left + anychart.charts.Gantt.SCROLL_BAR_SIDE),
        (tlBounds.top + tlBounds.height - anychart.charts.Gantt.SCROLL_BAR_SIDE - 1),
        (tlBounds.width - 2 * anychart.charts.Gantt.SCROLL_BAR_SIDE),
        anychart.charts.Gantt.SCROLL_BAR_SIDE
    );

    //This line hides dataGridHorizontalScrollBar_ if is disabled and does nothing otherwise.
    this.dataGridHorizontalScrollBar_.draw();

  }

};


/**
 * Constructor function for gantt project chart.
 * @return {!anychart.charts.Gantt}
 */
anychart.ganttProject = function() {
  var chart = new anychart.charts.Gantt(false);

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


/**
 * Constructor function for gantt resource chart.
 * @return {!anychart.charts.Gantt}
 */
anychart.ganttResource = function() {
  var chart = new anychart.charts.Gantt(true);

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


//exports
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
anychart.charts.Gantt.prototype['draw'] = anychart.charts.Gantt.prototype.draw;
anychart.charts.Gantt.prototype['data'] = anychart.charts.Gantt.prototype.data;
anychart.charts.Gantt.prototype['dataGrid'] = anychart.charts.Gantt.prototype.dataGrid;
anychart.charts.Gantt.prototype['getTimeline'] = anychart.charts.Gantt.prototype.getTimeline;
anychart.charts.Gantt.prototype['rowHoverFill'] = anychart.charts.Gantt.prototype.rowHoverFill;
anychart.charts.Gantt.prototype['rowSelectedFill'] = anychart.charts.Gantt.prototype.rowSelectedFill;
anychart.charts.Gantt.prototype['zoomIn'] = anychart.charts.Gantt.prototype.zoomIn;
anychart.charts.Gantt.prototype['zoomOut'] = anychart.charts.Gantt.prototype.zoomOut;
anychart.charts.Gantt.prototype['zoomTo'] = anychart.charts.Gantt.prototype.zoomTo;
anychart.charts.Gantt.prototype['headerHeight'] = anychart.charts.Gantt.prototype.headerHeight;
anychart.charts.Gantt.prototype['fitAll'] = anychart.charts.Gantt.prototype.fitAll;
anychart.charts.Gantt.prototype['fitToTask'] = anychart.charts.Gantt.prototype.fitToTask;
anychart.charts.Gantt.prototype['scrollTo'] = anychart.charts.Gantt.prototype.scrollTo;
anychart.charts.Gantt.prototype['scrollToRow'] = anychart.charts.Gantt.prototype.scrollToRow;
anychart.charts.Gantt.prototype['scrollToEnd'] = anychart.charts.Gantt.prototype.scrollToEnd;
anychart.charts.Gantt.prototype['collapseAll'] = anychart.charts.Gantt.prototype.collapseAll;
anychart.charts.Gantt.prototype['expandAll'] = anychart.charts.Gantt.prototype.expandAll;
anychart.charts.Gantt.prototype['expandTask'] = anychart.charts.Gantt.prototype.expandTask;
anychart.charts.Gantt.prototype['collapseTask'] = anychart.charts.Gantt.prototype.collapseTask;
anychart.charts.Gantt.prototype['splitterPosition'] = anychart.charts.Gantt.prototype.splitterPosition;



