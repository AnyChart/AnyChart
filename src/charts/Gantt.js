goog.provide('anychart.charts.Gantt');
goog.require('anychart.core.Chart');
goog.require('anychart.core.gantt.Controller');
goog.require('anychart.core.gantt.Timeline');
goog.require('anychart.core.ui.DataGrid');
goog.require('anychart.core.ui.Splitter');



/**
 * Gantt chart implementation.
 * TODO (A.Kudryavtsev): Describe.
 * TODO (A.Kudryavtsev): Actually, must not be exported as is.
 *
 * @param {boolean=} opt_isResourcesChart - Flag if chart should be interpreted as resource chart.
 * @constructor
 * @extends {anychart.core.Chart}
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
   * Vertical scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = this.controller_.getScrollBar();
  this.registerDisposable(this.verticalScrollBar_);

  /**
   * Horizontal scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.horizontalScrollBar_ = this.getTimeline().getScrollBar();
  this.registerDisposable(this.horizontalScrollBar_);


  /**
   * If chart is rendered first time.
   * This flag is used to add mouse wheel event handlers.
   * @type {boolean}
   * @private
   */
  this.initialRendering_ = true;

};
goog.inherits(anychart.charts.Gantt, anychart.core.Chart);


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
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA | //New data is set.
    anychart.ConsistencyState.POSITION; //Position means that position of data items in DG and TL was changed.


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Gantt.prototype.SUPPORTED_SIGNALS =
    anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


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
 * Scroll bar side size.
 * @type {number}
 */
anychart.charts.Gantt.SCROLL_BAR_SIDE = 15;


/**
 * Controller invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.charts.Gantt.prototype.controllerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.POSITION, anychart.Signal.NEEDS_REDRAW);
  }
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
    this.invalidate(anychart.ConsistencyState.DATA);
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
 * Getter for data grid.
 * TODO (A.Kudryavtsev): Turn it to getter for a while?
 * @param {(null|string|Object|anychart.core.ui.DataGrid)=} opt_value - Value to be set.
 * @return {anychart.core.ui.DataGrid} - Chart's timeline.
 */
anychart.charts.Gantt.prototype.getDataGrid = function(opt_value) {
  if (!this.dg_) {
    this.dg_ = new anychart.core.ui.DataGrid();
    this.dg_.controller(this.controller_);
    this.dg_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.registerDisposable(this.dg_);
    var ths = this;
    this.dg_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);
  }

  return this.dg_;
};


/**
 * Getter for timeline.
 * TODO (A.Kudryavtsev): Turn it to getter for a while?
 * @param {(null|string|Object|anychart.core.gantt.Timeline)=} opt_value - Value to be set.
 * @return {anychart.core.gantt.Timeline} - Chart's timeline.
 */
anychart.charts.Gantt.prototype.getTimeline = function(opt_value) {
  if (!this.tl_) {
    this.tl_ = new anychart.core.gantt.Timeline(this.controller_, this.isResourcesChart_);
    this.tl_.zIndex(anychart.charts.Gantt.Z_INDEX_DG_TL);
    this.registerDisposable(this.tl_);
    var ths = this;
    this.tl_.listenSignals(function() {
      ths.controller_.run();
    }, this.controller_);
  }

  return this.tl_;
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
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.splitterPosition_;
};


/**
 * Getter/setter for splitter.
 * TODO (A.Kudryavtsev): Turn it to getter for a while?
 * @param {(null|string|Object|anychart.core.ui.Splitter)=} opt_value - Value to be set.
 * @return {(anychart.charts.Gantt|anychart.core.ui.Splitter)} - Current value or itself for method chaining.
 */
anychart.charts.Gantt.prototype.splitter = function(opt_value) {
  if (!this.splitter_) {
    this.splitter_ = new anychart.core.ui.Splitter;
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
      var b1 = ths.splitter().getLeftBounds();
      var b2 = ths.splitter().getRightBounds();

      anychart.core.Base.suspendSignalsDispatching(ths.getDataGrid(), ths.getTimeline());
      ths.getDataGrid().bounds().set(b1);
      ths.getTimeline().bounds().set(b2);
      anychart.core.Base.resumeSignalsDispatchingTrue(ths.getDataGrid(), ths.getTimeline());

      ths.horizontalScrollBar_.bounds(
          b2.left,
          (b2.top + b2.height + 1),
          b2.width,
          anychart.charts.Gantt.SCROLL_BAR_SIDE
      ).draw();
    });

  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.core.ui.Splitter) {
      this.splitter_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.splitter_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.splitter_.enabled(false); //TODO (A.Kudryavtsev): Exclude this code?
    }
    return this;
  } else {
    return this.splitter_;
  }
};


/** @inheritDoc */
anychart.charts.Gantt.prototype.createLegendItemsProvider = function() {
  return []; //TODO (A.Kudryavtsev): Do we need any kind of standard legend here?
};


/**
 * Draw gantt chart content items.
 * @param {anychart.math.Rect} bounds - Bounds of gantt chart content area.
 */
anychart.charts.Gantt.prototype.drawContent = function(bounds) {

  anychart.core.Base.suspendSignalsDispatching(this.dg_, this.tl_, this.splitter_, this.controller_);

  if (!this.splitter().container()) {
    this.getDataGrid().container(this.rootElement);
    this.getTimeline().container(this.rootElement);
    this.splitter().container(this.rootElement);
    this.verticalScrollBar_.container(this.rootElement);
    this.horizontalScrollBar_.container(this.rootElement);
    this.splitter().draw(); //Just initialization.
  }

  if (!this.controller_.dataGrid()) this.controller_.dataGrid(/** @type {anychart.core.ui.DataGrid} */ (this.getDataGrid()));
  if (!this.controller_.timeline()) this.controller_.timeline(/** @type {anychart.core.gantt.Timeline} */ (this.getTimeline()));

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.splitter().bounds(
        bounds.left,
        bounds.top,
        (bounds.width - anychart.charts.Gantt.SCROLL_BAR_SIDE - 2),
        (bounds.height - anychart.charts.Gantt.SCROLL_BAR_SIDE - 2)
    ); //This must automatically set bounds for TL and DG.

    var dgWidth = anychart.utils.normalizeSize(this.splitterPosition_, bounds.width);
    var dgRatio = dgWidth / bounds.width;
    this.splitter().position(dgRatio);

    var tlBounds = this.splitter().getRightBounds();

    this.verticalScrollBar_.bounds(
        (bounds.left + bounds.width - anychart.charts.Gantt.SCROLL_BAR_SIDE - 1),
        tlBounds.top,
        anychart.charts.Gantt.SCROLL_BAR_SIDE,
        (bounds.height - anychart.charts.Gantt.SCROLL_BAR_SIDE - 2)
    );

    this.horizontalScrollBar_.bounds(
        tlBounds.left,
        (tlBounds.top + tlBounds.height + 1),
        tlBounds.width,
        anychart.charts.Gantt.SCROLL_BAR_SIDE
    );

    var newAvailableHeight = bounds.height - this.headerHeight_;
    if (this.controller_.availableHeight() != newAvailableHeight) {
      this.controller_.availableHeight(newAvailableHeight);
      //This will apply changes in title height.
      this.tl_.invalidate(anychart.ConsistencyState.BOUNDS);
      this.dg_.invalidate(anychart.ConsistencyState.BOUNDS);
    }

  }

  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.controller_.data(this.data_);
    this.invalidate(anychart.ConsistencyState.POSITION);
    this.markConsistent(anychart.ConsistencyState.DATA);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.splitter_, this.controller_);
  this.controller_.run(); //This must redraw DG and TL.
  this.splitter().draw();


  if (this.hasInvalidationState(anychart.ConsistencyState.POSITION)) {
    //This consistency state is used to set 'checkDrawingNeeded()' to TRUE. Controller must be run anyway.
    this.markConsistent(anychart.ConsistencyState.POSITION);
  }

};


/** @override */
anychart.charts.Gantt.prototype.draw = function() {
  /*
    This method is used to add mouse wheel handler.
    Current implementation (03 Dec 2014) of mouse wheel handler in closure library
    requires an Element as parameter. Element as element appears on render event only.
    That's why we need to add handler right after first rendering.
   */
  goog.base(this, 'draw');

  if (this.initialRendering_) {
    this.initialRendering_ = false;
    this.dg_.initMouseFeatures();
    this.tl_.initMouseFeatures();
  }
  return this;
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
anychart.charts.Gantt.prototype['getDataGrid'] = anychart.charts.Gantt.prototype.getDataGrid;
anychart.charts.Gantt.prototype['getTimeline'] = anychart.charts.Gantt.prototype.getTimeline;
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



