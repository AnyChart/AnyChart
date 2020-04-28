goog.provide('anychart.ganttModule.Chart');

goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.reporting');
goog.require('anychart.format.Context');
goog.require('anychart.ganttModule.Controller');
goog.require('anychart.ganttModule.DataGrid');
goog.require('anychart.ganttModule.IInteractiveGrid');
goog.require('anychart.ganttModule.Selection');
goog.require('anychart.ganttModule.Splitter');
goog.require('anychart.ganttModule.TimeLine');
goog.require('anychart.ganttModule.edit.StructureEdit');
goog.require('anychart.ganttModule.rendering.RowsColoring');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.treeDataModule.utils');



/**
 * Gantt chart implementation.
 * TODO (A.Kudryavtsev): Describe.
 * TODO (A.Kudryavtsev): Actually, must not be exported as is.
 *
 * @param {boolean=} opt_isResourcesChart - Flag if chart should be interpreted as resource chart.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.ganttModule.IInteractiveGrid}
 */
anychart.ganttModule.Chart = function(opt_isResourcesChart) {
  anychart.ganttModule.Chart.base(this, 'constructor');

  this.addThemes('ganttBase', opt_isResourcesChart ? 'ganttResource' : 'ganttProject');

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

  /**
   * Data tree.
   * @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View}
   * @private
   */
  this.data_ = null;

  /**
   * Data grid of gantt chart.
   * @type {anychart.ganttModule.DataGrid}
   * @private
   */
  this.dg_ = null;

  /**
   * Timeline of gantt chart.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.tl_ = null;

  /**
   * Splitter between DG and TL.
   * @type {anychart.ganttModule.Splitter}
   * @private
   */
  this.splitter_ = null;

  /**
   *
   * @type {anychart.ganttModule.rendering.RowsColoring}
   */
  this.rowsColoringInternal = null;

  /**
   * Selection.
   * @type {anychart.ganttModule.Selection}
   * @private
   */
  this.selection_ = new anychart.ganttModule.Selection();

  /**
   * Context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  this.controller_ = new anychart.ganttModule.Controller(this.isResourcesChart_);
  this.controller_.dataGrid(/** @type {anychart.ganttModule.DataGrid} */ (this.getDataGrid_()));
  this.controller_.timeline(/** @type {anychart.ganttModule.TimeLine} */ (this.getTimeline()));
  this.controller_.listenSignals(this.controllerInvalidated_, this);

  /**
   * Vertical scroll bar.
   * @type {anychart.ganttModule.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = this.controller_.getScrollBar();
  this.verticalScrollBar_.zIndex(anychart.ganttModule.Chart.Z_INDEX_SCROLL);
  this.verticalScrollBar_.listenSignals(this.scrollInvalidated_, this);

  this.listenOnce(anychart.enums.EventType.CHART_DRAW, function() {
    this.dataGrid().initMouseFeatures();
    this.getTimeline().initMouseFeatures();
    this.dataGrid().initKeysFeatures();
    this.getTimeline().initKeysFeatures();
  }, false, this);

  //region Init descriptors meta
  /**
   * @this {anychart.ganttModule.Chart}
   */
  function rowHoverFillBeforeInvalidation() {
    //rowHoverFill does not invalidate anything. Here's no need to suspend it.
    this.getTimeline()['rowHoverFill'](/** @type {acgraph.vector.Fill} */ (this.getOption('rowHoverFill')));
    this.getDataGrid_()['rowHoverFill'](/** @type {acgraph.vector.Fill} */ (this.getOption('rowHoverFill')));
  }

  /**
   * @this {anychart.ganttModule.Chart}
   */
  function rowSelectedFillBeforeInvalidation() {
    anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_());
    this.tl_['rowSelectedFill'](/** @type {acgraph.vector.Fill} */ (this.getOption('rowSelectedFill')));
    this.dg_['rowSelectedFill'](/** @type {acgraph.vector.Fill} */ (this.getOption('rowSelectedFill')));
    anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
  }

  /**
   * @this {anychart.ganttModule.Chart}
   */
  function columnStrokeBeforeInvalidation() {
    anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_());
    this.dg_['columnStroke'](/** @type {acgraph.vector.Stroke} */ (this.getOption('columnStroke')));
    this.tl_['columnStroke'](/** @type {acgraph.vector.Stroke} */ (this.getOption('columnStroke')));
    anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
  }

  /**
   * @this {anychart.ganttModule.Chart}
   */
  function rowStrokeBeforeInvalidation() {
    anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_(), this.controller_);
    var val = /** @type {acgraph.vector.Stroke} */ (this.getOption('rowStroke'));
    this.dg_['rowStroke'](val);
    this.tl_['rowStroke'](val);
    this.controller_.rowStrokeThickness(anychart.utils.extractThickness(val));
    anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.controller_);
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['headerHeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['splitterPosition', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['rowHoverFill', 0, 0, 0, rowHoverFillBeforeInvalidation],
    ['rowSelectedFill', 0, 0, 0, rowSelectedFillBeforeInvalidation],
    ['columnStroke', 0, 0, 0, columnStrokeBeforeInvalidation],
    ['rowStroke', 0, 0, 0, rowStrokeBeforeInvalidation]
  ]);
  //endregion
};
goog.inherits(anychart.ganttModule.Chart, anychart.core.SeparateChart);


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.getType = function() {
  return this.isResourcesChart_ ?
      anychart.enums.ChartTypes.GANTT_RESOURCE :
      anychart.enums.ChartTypes.GANTT_PROJECT;
};


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.GANTT_DATA | //New data is set.
    anychart.ConsistencyState.GANTT_POSITION; //Position means that position of data items in DG and TL was changed.


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Default date time pattern.
 * @type {string}
 */
anychart.ganttModule.Chart.DEFAULT_DATE_TIME_PATTERN = 'yyyy.MM.dd';


/**
 * Splitter z-index.
 * @type {number}
 */
anychart.ganttModule.Chart.Z_INDEX_SPLITTER = 10;


/**
 * Data grid and timeline z-index.
 * @type {number}
 */
anychart.ganttModule.Chart.Z_INDEX_DG_TL = 5;


/**
 * Scroll z-index.
 * @type {number}
 */
anychart.ganttModule.Chart.Z_INDEX_SCROLL = 20;


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.getVersionHistoryLink = function() {
  return 'https://anychart.com/products/anygantt/history';
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.ganttModule.Chart.prototype.makePointEvent = function(event) {
  return null;
};


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.ganttModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.ganttModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * Hover a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.ganttModule.Chart}  {@link anychart.pieModule.Chart} instance for method chaining.
 */
anychart.ganttModule.Chart.prototype.hoverPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.ganttModule.Chart|anychart.enums.HoverMode} .
 */
anychart.ganttModule.Chart.prototype.hoverMode = function(opt_value) {
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
 * Controller invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.Chart.prototype.controllerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Scroll invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.Chart.prototype.scrollInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) event.target.draw();
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Data grid invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.Chart.prototype.dataGridInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
  this.controller_.run();
};


/**
 * Gets/sets chart data.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.ganttModule.Chart)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree) || anychart.utils.instanceOf(opt_value, anychart.treeDataModule.View)) {
      if (this.data_ != opt_value) {
        this.data_ = /** @type {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)} */(opt_value);
        this.invalidate(anychart.ConsistencyState.GANTT_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
      }
    } else {
      this.data_ = new anychart.treeDataModule.Tree(/** @type {Array.<Object>} */(opt_value), opt_fillMethod);
      this.invalidate(anychart.ConsistencyState.GANTT_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.Chart.prototype.defaultRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller_.defaultRowHeight(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller_.defaultRowHeight());
};


/**
 * @inheritDoc
 */
anychart.ganttModule.Chart.prototype.lockInteractivity = function(lock) {
  this.dg_.lockInteractivity(lock);
  this.tl_.lockInteractivity(lock);
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'headerHeight',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'splitterPosition',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'rowHoverFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'rowSelectedFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'columnStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'rowStroke',
      anychart.core.settings.strokeNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.Chart, anychart.ganttModule.Chart.PROPERTY_DESCRIPTORS);


/**
 * Internal getter for data grid.
 * @return {anychart.ganttModule.DataGrid} - Chart's data grid.
 * @private
 */
anychart.ganttModule.Chart.prototype.getDataGrid_ = function() {
  if (!this.dg_) {
    this.dg_ = new anychart.ganttModule.DataGrid(this.controller_);
    this.setupCreated('dataGrid', this.dg_);
    this.dg_.zIndex(anychart.getFlatTheme('defaultDataGrid')['zIndex']);
    this.dg_.setInteractivityHandler(this);
    this.dg_.listenSignals(this.dataGridInvalidated_, this);
  }

  return this.dg_;
};


/**
 * Gets data grid or enables/disables it.
 * NOTE: In current implementation (25 Feb 2015) data grid is not configurable by JSON, can't be set directly and can't be null.
 * @param {boolean=} opt_enabled - If data grid must be enabled/disabled.
 * @return {(anychart.ganttModule.DataGrid|anychart.ganttModule.Chart)} - Data grid or chart itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.dataGrid = function(opt_enabled) {
  if (goog.isDef(opt_enabled)) {
    this.getDataGrid_().enabled(opt_enabled);
    return this;
  }
  return this.getDataGrid_();
};


/**
 * Getter for timeline.
 * @return {anychart.ganttModule.TimeLine} - Chart's timeline.
 */
anychart.ganttModule.Chart.prototype.getTimeline = function() {
  if (!this.tl_) {
    this.tl_ = new anychart.ganttModule.TimeLine(this.controller_, this.isResourcesChart_);
    this.setupCreated('timeline', this.tl_);
    this.tl_.zIndex(anychart.getFlatTheme('defaulTimeline')['zIndex']);
    this.tl_.setInteractivityHandler(this);
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
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.zoomIn = function(opt_zoomFactor) {
  this.getTimeline().getScale().zoomIn(opt_zoomFactor);
  return this;
};


/**
 * Timeline zoom out.
 * @param {number=} opt_zoomFactor - Zoom factor.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.zoomOut = function(opt_zoomFactor) {
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
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.zoomTo = function(startOrUnit, opt_endOrCount, opt_anchor) {
  this.getTimeline().getScale().zoomTo(startOrUnit, opt_endOrCount, opt_anchor);
  return this;
};


/**
 * Fits all visible data to timeline width.
 * TODO (A.Kudryavtsev): Change description.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.fitAll = function() {
  this.getTimeline().getScale().fitAll();
  return this;
};


/**
 * Fits timeline visible area to task's range.
 * TODO (A.Kudryavtsev): Change description.
 * @param {string} taskId - Task id.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.fitToTask = function(taskId) {
  var bounds = this.tl_.pixelBoundsCache;
  if (bounds && bounds.width) { // This condition fixes falling test on hidden container when bounds is null.
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

        if (bounds.width > 0) {
          var relatedBounds = task.meta('relBounds');
          var label = task.meta('label');
          if (label) {
            var labelBounds = this.tl_.labels().measure(label, label.positionProvider());
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
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.NOT_FOUND, null, ['Task', taskId]);
    }
  }
  return this;
};


/**
 * Performs vertical scroll to pxOffset.
 * @see anychart.ganttModule.Controller#scrollTo
 * @param {number=} opt_value - Pixel offset.
 * @return {anychart.ganttModule.Chart|number} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.scrollTo = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller_.scrollTo(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller_.scrollTo());
};


/**
 * Performs vertical scroll to rowIndex specified.
 * @see anychart.ganttModule.Controller#scrollToRow
 * @param {number} rowIndex - Row index.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.scrollToRow = function(rowIndex) {
  this.controller_.scrollToRow(rowIndex);
  return this;
};


/**
 * Gets timeline scale.
 * @param {Object=} opt_value - Scale config.
 * @return {anychart.ganttModule.Chart|anychart.scales.GanttDateTime}
 */
anychart.ganttModule.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.getTimeline().scale(opt_value);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.getTimeline().scale());
};


/**
 * Scrolls vertically to specified index.
 * @see anychart.ganttModule.Controller#scrollToEnd
 * @param {number=} opt_index - End index to scroll to.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.scrollToEnd = function(opt_index) {
  this.controller_.scrollToEnd(opt_index);
  return this;
};


/**
 * Collapses all.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.collapseAll = function() {
  this.controller_.collapseAll();
  return this;
};


/**
 * Expands all.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.expandAll = function() {
  this.controller_.expandAll();
  return this;
};

/**
 * Gets collapsed items map for https://anychart.atlassian.net/browse/ENV-1391.
 * @returns {Object.<anychart.treeDataModule.Tree.DataItem>}
 */
anychart.ganttModule.Chart.prototype.getCollapsedItemsMap = function() {
  return this.controller_.collapsedItemsMap;
};


/**
 * Expands/collapses task.
 * @param {string} taskId
 * @param {boolean} value - Value to be set.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 * @private
 */
anychart.ganttModule.Chart.prototype.collapseTask_ = function(taskId, value) {
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
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.expandTask = function(taskId) {
  return this.collapseTask_(taskId, false);
};


/**
 * Collapses task.
 * @param {string} taskId - Task id.
 * @return {anychart.ganttModule.Chart} - Itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.collapseTask = function(taskId) {
  return this.collapseTask_(taskId, true);
};


/**
 * Getter/setter for splitter.
 * TODO (A.Kudryavtsev): Turn it to getter for a while?
 * @param {(Object|boolean|null)=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.Chart|anychart.ganttModule.Splitter)} - Current value or itself for method chaining.
 */
anychart.ganttModule.Chart.prototype.splitter = function(opt_value) {
  if (!this.splitter_) {
    this.splitter_ = new anychart.ganttModule.Splitter();
    this.splitter_.zIndex(anychart.ganttModule.Chart.Z_INDEX_SPLITTER);

    this.splitter_.listenSignals(function() {
      this.splitter_.draw();
    }, this);

    this.splitter_//TODO (A.Kudryavtsev): Move this settings to theme.
        .suspendSignalsDispatching()
        .layout(anychart.enums.Layout.VERTICAL)
        .position(/** @type {number|string} */ (this.getOption('splitterPosition')))
        .dragPreviewFill('#000 0.3')
        .stroke('none')
        .splitterWidth(2)
        .fill('#cecece')
        .considerSplitterWidth(true)
        .resumeSignalsDispatching(false);

    this.splitter_.listen(anychart.enums.EventType.SPLITTER_POSITION_CHANGE, function(e) {
      //This also stores current position for case if dg is being disabled.
      //Here we don't check if newPosition == oldPosition because it is handled by splitter.
      var padding = this.padding();
      var chartBounds = this.getPixelBounds();
      var w = padding.tightenWidth(chartBounds.width); //This fixes case when chart.padding() is not zero.
      var pos = this.splitter().position();
      var newLeftPixelWidth = Math.floor(pos * w);

      if (this.dg_.getOption('fixedColumns') && e['src'] != 'drawing') { //DVF-4323
        var dgWidthWithoutLastColumn = this.dg_.getTotalColumnsWidth(true);
        var lastColumnWidth = newLeftPixelWidth - dgWidthWithoutLastColumn - this.dg_.getSplitterWidth();
        var lastColumn = this.dg_.getLastEnabledColumn();
        if (lastColumn) {
          lastColumn.suspendSignalsDispatching();
          lastColumn['width'](lastColumnWidth);
          lastColumn.resumeSignalsDispatching(false);
        }
      }

      var ev = {
        'type': anychart.enums.EventType.SPLITTER_POSITION_CHANGE,
        'newPosition': newLeftPixelWidth,
        'oldPosition': this.getOption('splitterPosition')
      };

      this.setOption('splitterPosition', newLeftPixelWidth);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
      this.dispatchDetachedEvent(ev);
    }, void 0, this);

  }

  if (goog.isDef(opt_value)) {
    this.splitter_.setup(opt_value);
    return this;
  } else {
    return this.splitter_;
  }
};


/**
 * @return {anychart.ganttModule.rendering.RowsColoring}
 */
anychart.ganttModule.Chart.prototype.rowsColoring = function() {
  if (!this.rowsColoringInternal) {
    this.rowsColoringInternal = new anychart.ganttModule.rendering.RowsColoring(this);
    this.rowsColoringInternal.listen('statechange', function() {
      anychart.core.Base.suspendSignalsDispatching(this.getTimeline(), this.getDataGrid_());
      this.tl_.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
      this.dg_.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
      anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_);
    }, void 0, this);
  }
  return this.rowsColoringInternal;
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.createLegendItemsProvider = function(sourceMode) {
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
anychart.ganttModule.Chart.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/**
 * Row double click interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowDblClick = function(event) {
  this.rowExpandCollapse(event);
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
  this.dg_.highlight(opt_index, opt_startY, opt_endY);
  this.tl_.highlight(opt_index, opt_startY, opt_endY);
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.editStructureHighlight = function(opt_index, opt_startY, opt_endY) {
  this.dg_.editStructureHighlight(opt_index, opt_startY, opt_endY);
  this.tl_.editStructureHighlight(opt_index, opt_startY, opt_endY);
};


//region -- Selection.
/**
 * @inheritDoc
 */
anychart.ganttModule.Chart.prototype.selection = function() {
  return this.selection_;
};


//endregion
/**
 * Row mouse move interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowMouseMove = function(event) {
  var target = /** @type {anychart.ganttModule.BaseGrid} */ (event['target']);
  if (!target.dragging && !target.draggingConnector) {
    this.highlight(event['hoveredIndex'], event['startY'], event['endY']);

    var tooltip;
    var item = event['item'];
    if (event['elementType'] == anychart.enums.TLElementTypes.MILESTONES_PREVIEW) {
      // https://anychart.atlassian.net/browse/DVF-4356
      item = event['originalEvent']['domTarget'].tag.item;
    }
    tooltip = /** @type {anychart.core.ui.Tooltip} */(target.getTooltipInternal(void 0, item, event['periodIndex']));

    if (anychart.utils.instanceOf(target, anychart.ganttModule.DataGrid)) {
      var tlTooltip = this.tl_.getTooltipOfElementByItem(item);
      tooltip.setMiddleFormats(
          /** @type {Function|null|string|undefined} */ (tlTooltip.getOption('format')),
          /** @type {Function|null|string|undefined} */ (tlTooltip.getOption('titleFormat')));
    } else {
      target.tooltip().hideChildTooltips(); //This fixes appearance of tooltip on fast row mouse change.
    }

    if (tooltip.enabled()) {
      var formatProvider = target.createFormatProvider(item, event['period'], event['periodIndex'], event['elementType'], event['hoverRatio'], event['hoverDateTime']);
      if (tooltip.parent()) {
        tooltip.parent().hideChildTooltips();
      }
      tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
    }
  }
};


/**
 * Row mouse over interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowMouseOver = function(event) {
};


/**
 * Row mouse out interactivity handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowMouseOut = function(event) {
  this.highlight();
  this.dg_.getTooltipInternal().hide();
  this.tl_.getTooltipInternal(void 0, event['item']).hide();
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowSelect = function(event) {
  if (!this.tl_.checkRowSelection(event)) {
    var item = event['item'];
    var period = event['period'];
    var periodIndex = event['periodIndex'];

    var selection = this.selection();
    var isSelected = this.isResourcesChart_ ?
        selection.isPeriodSelected(item, periodIndex) :
        selection.isRowSelected(item);

    if (item && !isSelected) {
      var eventObj = {
        'type': anychart.enums.EventType.ROW_SELECT,
        'item': item,
        'prevItem': selection.getSelectedItem()
      };
      if (goog.isDef(period)) {
        eventObj['period'] = period;
        eventObj['periodIndex'] = periodIndex;
      }
      if (selection.hasSelectedPeriod()) {
        var pIndex = selection.getSelectedPeriodIndex();
        eventObj['prevPeriodIndex'] = pIndex;
        eventObj['prevPeriod'] = selection.getSelectedItem().get(anychart.enums.GanttDataFields.PERIODS, pIndex);
      }

      if (this.dispatchEvent(eventObj)) {
        this.tl_.connectorUnselect(event);
        this.dg_.selectRow(item);
        this.tl_.selectTimelineRow(item, periodIndex);
      }
    }
  }
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.Chart.prototype.rowExpandCollapse = function(event) {
  if (event && !this.tl_.checkConnectorDblClick(event)) {
    var item = event['item'];
    if (item && anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
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
anychart.ganttModule.Chart.prototype.rowMouseDown = function(event) {
  event['target'].rowMouseDown(event);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.Chart.prototype.rowUnselect = function(event) {
  var selection = this.selection();
  //NOTE: this event will not be dispatched by dg_ or tl_ because their interactivity handler is chart but not they are.
  var newEvent = {
    'type': anychart.enums.EventType.ROW_SELECT,
    'actualTarget': event ? event.target : this,
    'target': this,
    'originalEvent': event,
    'item': null, //This is a real difference between 'select' and 'unselect' events.
    'prevItem': selection.getSelectedItem()
  };

  if (selection.hasSelectedPeriod()) {
    var pIndex = selection.getSelectedPeriodIndex();
    newEvent['prevPeriodIndex'] = pIndex;
    newEvent['prevPeriod'] = selection.getSelectedItem().get(anychart.enums.GanttDataFields.PERIODS, pIndex);
  }

  if (this.dispatchEvent(newEvent)) {
    this.dg_.rowUnselect(event);
    this.tl_.rowUnselect(event);
  }
  this.tl_.connectorUnselect(event);
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.rowMouseUp = function(event) {
  event['target'].rowMouseUp(event);
};


//region -- Edit.
/**
 * @inheritDoc
 */
anychart.ganttModule.Chart.prototype.edit = function(opt_value) {
  if (!this.edit_) {
    this.edit_ = new anychart.ganttModule.edit.StructureEdit();
    this.setupCreated('edit', this.edit_);
    // this.edit_.listenSignals(this.onEditSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.edit_.setup(opt_value);
    return this;
  }
  return this.edit_;
};


// /**
//  *
//  * @param {anychart.SignalEvent} e - Signal event.
//  * @private
//  */
// anychart.ganttModule.Chart.prototype.prototype.onEditSignal_ = function(e) {
//   if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
//     if (this.edit().getOption('enabled')) {
//       if (!this.denyAddDocMouseMoveListener_) {
//         goog.events.listen(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
//         this.denyAddDocMouseMoveListener_ = true;
//       }
//     } else {
//       goog.events.unlisten(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
//       this.denyAddDocMouseMoveListener_ = false;
//     }
//     // this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
//   }
//   if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
//     this.reapplyStructureEditAppearance();
//   }
// };


//endregion
/**
 * Enables/disables live edit mode.
 * @param {boolean=} opt_value - Value to be set.
 * @deprecated since 8.3.0 use chart.edit() instead. DVF-3623
 * @return {anychart.ganttModule.IInteractiveGrid|boolean} - Itself for method chaining or current value.
 */
anychart.ganttModule.Chart.prototype.editing = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['chart.editing()', 'chart.edit()'], true);
  if (goog.isDef(opt_value)) {
    this.edit()['enabled'](opt_value);
    return this;
  }
  return /** @type {boolean} */ (this.edit().getOption('enabled'));
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.deleteKeyHandler = function(e) {
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
anychart.ganttModule.Chart.prototype.drawContent = function(bounds) {
  anychart.core.Base.suspendSignalsDispatching(this.getDataGrid_(), this.getTimeline(), this.splitter(), this.controller_);

  if (!this.splitter_.container()) {
    this.dg_.container(this.rootElement);
    this.tl_.container(this.rootElement);
    this.splitter_.container(this.rootElement);
    this.verticalScrollBar_.container(this.rootElement);
  }

  var isFixedDG = this.dg_.getOption('fixedColumns');

  var headerHeight = /** @type {number} */ (this.getOption('headerHeight'));
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (bounds.width > 0) {
      if (this.dg_.enabled()) {
        var dgWidth = isFixedDG ?
            this.dg_.getTotalColumnsWidth() :
            Math.round(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('splitterPosition')), bounds.width));

        this.splitter_.bounds(bounds);
        if (isFixedDG) {
          var widthWithoutLastColumn = this.dg_.getTotalColumnsWidth(true);
          if (widthWithoutLastColumn) {
            var limit = widthWithoutLastColumn + anychart.ganttModule.DataGrid.MIN_COLUMN_WIDTH;
            this.splitter_.setStartLimitForce(limit);
          } else {
            this.splitter_.leftLimitSize(0);
          }
        } else {
          this.splitter_.leftLimitSize(0);
        }

        var dgRatio = goog.math.clamp(dgWidth / bounds.width, 0, 1);
        this.splitter_.handlePositionChange(false);
        this.splitter_.position(dgRatio);
        this.splitter_.draw();
        this.splitter_.handlePositionChange(true);

        if (isFixedDG && this.splitter_.position() != dgRatio) {
          /*
            This condition is kind of stupid hack that fixes the following case:
              - set chart.dataGrid().fixedColumns(true);
              - reduce chart width to make DG width exceed the chart's width
              - it will turn this.splitter_.position() to 1.
              - very quickly expand chart width to make DG width fit inside chart's width.
              - chart's splitter doesn't fit DG width because of internal splitter's mechanisms.

            I can't find the reason of this bug in splitter's implementation because it's really
            old. The better way would be to completely rewrite the splitter.
           */
          this.splitter_.handlePositionChange(false);
          this.splitter_.position(dgRatio);
          this.splitter_.draw();
          this.splitter_.handlePositionChange(true);
        }
      } else {
        this.tl_.bounds().set(bounds);
      }

      var newAvailableHeight = bounds.height - headerHeight - 1;
      if (this.controller_.availableHeight() != newAvailableHeight) {
        this.tl_.headerHeight(headerHeight);
        this.dg_.headerHeight(headerHeight);
        this.controller_.availableHeight(newAvailableHeight);
      }

      var isDataGridEnabled = /** @type {boolean} */(this.dg_.enabled());
      this.splitter_.enabled(isDataGridEnabled);

      if (isDataGridEnabled) {
        var b1 = this.splitter_.getLeftBounds();
        var b2 = this.splitter_.getRightBounds();
        this.dg_.bounds().set(b1);
        this.tl_.bounds().set(b2);
      }

      var tlBounds = this.tl_.getPixelBounds();

      var barSize = /** @type {number} */ (this.verticalScrollBar_.barSize());
      this.verticalScrollBar_.bounds(
          (bounds.left + bounds.width - barSize - 1),
          (tlBounds.top + headerHeight + barSize + 1),
          barSize,
          (tlBounds.height - headerHeight - 2 * barSize - 2)
      );
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GANTT_DATA)) {
    this.controller_.data(this.data_);
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION);
    this.markConsistent(anychart.ConsistencyState.GANTT_DATA);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this.dg_, this.tl_, this.splitter_, this.controller_);

  if (anychart.isAsync()) {
    /*
      Without ASYNC flag, chart and all its components are consistent after
      draw() because all drawing and another JS activities are synchronous.

      With ASYNC flag chart's controller, dataGrid and timeline are not
      consistent and are ready to preform asynchronous operations.

      It means that data grid will not take any settings by its API right after
      chart.draw() is called. To make data grid work, it gets needsForceSignalsDispatching
      flag set as true.

      Probably, timeline needs the same flag, this moment needs to be researched.
     */
    this.dg_.needsForceSignalsDispatching(true);
  }

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
anychart.ganttModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  return anychart.treeDataModule.utils.toCsv(
      /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data()), opt_csvSettings);
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.isNoData = function() {
  if (!this.data_)
    return true;
  return (!this.data_.numChildren());
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.ganttModule.Chart)} .
 */
anychart.ganttModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.ganttModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch) {
      this.getDataGrid_().invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW);
      this.getTimeline().invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW);
      // runs controller
      this.invalidate(anychart.ConsistencyState.GANTT_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.ganttModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.getDataGrid_().invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW);
    this.getTimeline().invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW);
    // runs controller
    this.invalidate(anychart.ConsistencyState.GANTT_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.serialize = function() {
  var json = anychart.ganttModule.Chart.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.ganttModule.Chart.PROPERTY_DESCRIPTORS, json, void 0, void 0, true);
  json['defaultRowHeight'] = this.defaultRowHeight();

  json['controller'] = this.controller_.serialize();
  json['dataGrid'] = this.dataGrid().serialize();
  json['timeline'] = this.getTimeline().serialize();
  json['edit'] = this.edit().serialize();
  json['palette'] = this.palette().serialize();

  return {'gantt': json};
};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('controller' in config) this.controller_.setupByJSON(config['controller'], opt_default);

  this.data(/** @type {anychart.treeDataModule.Tree} */ (this.controller_.data()));
  if ('dataGrid' in config) this.dataGrid().setupByJSON(config['dataGrid'], opt_default);
  if ('timeline' in config) this.getTimeline().setupByJSON(config['timeline'], opt_default);

  this.palette(config['palette']);

  anychart.core.settings.deserialize(this, anychart.ganttModule.Chart.PROPERTY_DESCRIPTORS, config, opt_default);
  this.defaultRowHeight(config['defaultRowHeight']);
  // this.editing(config['editing']);
  if ('edit' in config)
    this.edit().setupInternal(!!opt_default, config['edit']);


};


/** @inheritDoc */
anychart.ganttModule.Chart.prototype.disposeInternal = function() {
  this.controller_.unlistenSignals(this.controllerInvalidated_, this);
  goog.disposeAll(
      this.palette_,
      this.controller_,
      this.verticalScrollBar_,
      this.dg_,
      this.tl_,
      this.splitter_,
      this.edit_,
      this.selection_);
  this.palette_ = null;
  this.controller_ = null;
  this.verticalScrollBar_ = null;
  this.dg_ = null;
  this.tl_ = null;
  this.splitter_ = null;
  this.edit_ = null;
  this.selection_ = null;
  anychart.ganttModule.Chart.base(this, 'disposeInternal');
};


//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['dataGrid'] = proto.dataGrid;
  proto['getTimeline'] = proto.getTimeline;
  proto['zoomIn'] = proto.zoomIn;
  proto['zoomOut'] = proto.zoomOut;
  proto['zoomTo'] = proto.zoomTo;
  proto['fitAll'] = proto.fitAll;
  proto['fitToTask'] = proto.fitToTask;
  proto['scrollTo'] = proto.scrollTo;
  proto['scrollToRow'] = proto.scrollToRow;
  proto['scrollToEnd'] = proto.scrollToEnd;
  proto['collapseAll'] = proto.collapseAll;
  proto['expandAll'] = proto.expandAll;
  proto['expandTask'] = proto.expandTask;
  proto['collapseTask'] = proto.collapseTask;
  proto['getType'] = proto.getType;
  proto['editing'] = proto.editing;
  proto['edit'] = proto.edit;
  proto['toCsv'] = proto.toCsv;
  proto['xScale'] = proto.xScale;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
  proto['palette'] = proto.palette;
  proto['rowsColoring'] = proto.rowsColoring;
  proto['getCollapsedItemsMap'] = proto.getCollapsedItemsMap;

  // auto generated
  // proto['rowHoverFill'] = proto.rowHoverFill;
  // proto['rowSelectedFill'] = proto.rowSelectedFill;
  // proto['columnStroke'] = proto.columnStroke;
  // proto['rowStroke'] = proto.rowStroke;
  // proto['headerHeight'] = proto.headerHeight;
  // proto['splitterPosition'] = proto.splitterPosition;
})();
