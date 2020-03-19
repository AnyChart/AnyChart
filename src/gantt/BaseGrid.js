goog.provide('anychart.ganttModule.BaseGrid');

goog.require('acgraph.vector.Path');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.format.Context');
goog.require('anychart.ganttModule.Controller');
goog.require('anychart.ganttModule.IInteractiveGrid');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.ganttModule.Selection');
goog.require('anychart.ganttModule.edit.StructureEdit');
goog.require('anychart.math.Rect');
goog.require('goog.Timer');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.labs.userAgent.device');



/**
 * Base class for grid-like classes like DataGrid and Timeline.
 * Has a header area and interactive grid area.
 * @param {anychart.ganttModule.Controller=} opt_controller - Controller to be set. Setting this parameter has a key
 *  meaning:
 *  - If controller is set, in means that this grid (DG or TL) is not standalone (it is part of higher entity
 *    with its own controller like Gantt Chart). It means that controller must be already created before this grid.
 *  - If controller is not set, the grid becomes standalone and creates its own controller.
 * @param {boolean=} opt_isResource - If opt_controller is not set, this flag says what kind of controller to create.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.ganttModule.IInteractiveGrid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.ganttModule.BaseGrid = function(opt_controller, opt_isResource) {
  anychart.ganttModule.BaseGrid.base(this, 'constructor');

  /**
   * Mouse wheel handler object.
   * @type {goog.events.MouseWheelHandler}
   * @private
   */
  this.mwh_ = null;

  /**
   * Whether current device is desktop device.
   * @type {boolean}
   */
  this.isDesktop = goog.labs.userAgent.device.isDesktop();

  /**
   * Current dragger.
   * @type {anychart.ganttModule.BaseGrid.Dragger}
   */
  this.scrollDragger = null;

  /**
   * Interactivity handler.
   * @type {!anychart.ganttModule.IInteractiveGrid}
   */
  this.interactivityHandler = /** @type {!anychart.ganttModule.IInteractiveGrid} */ (this);

  /**
   * Flag whether grid is standalone.
   * @type {boolean}
   */
  this.isStandalone = true;

  /**
   * Gantt controller.
   * @type {anychart.ganttModule.Controller}
   */
  this.controller = null;

  if (opt_controller && anychart.utils.instanceOf(opt_controller, anychart.ganttModule.Controller)) {
    this.controller = opt_controller;
    this.isStandalone = false;
  } else {
    this.createController(opt_isResource);
    this.selection_ = new anychart.ganttModule.Selection();
  }

  /**
   * Pixel bounds cache.
   * @type {anychart.math.Rect}
   */
  this.pixelBoundsCache = null;

  /**
   * Thickness of row stroke.
   * It is used to avoid multiple thickness extraction from rowStroke_.
   * @type {number}
   */
  this.rowStrokeThickness = 1;

  /**
   * Row stroke path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.rowStrokePath_ = null;


  /**
   * Path that separates header of grid's body.
   * Takes color from this.rowStroke_.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.headerSeparationPath_ = null;

  /**
   * Base layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.base_ = null;

  /**
   * Background rect.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.bgRect_ = null;

  /**
   * Invisible background rect to handle mouse events when visible bg id disabled.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsRect_ = null;

  /**
   * Cells layer. Contains a grid itself.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.cellsLayer_ = null;

  /**
   * Content layer. Contains main content.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.contentLayer_ = null;

  /**
   * Edit layer. Contains edit elements.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.editLayer_ = null;

  /**
   * Layer that contains elements to be drawn with paths.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.drawLayer_ = null;

  /**
   * Edit structure preview path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editStructurePreviewPath_ = null;

  /**
   * Layer that will be clipped by height. Use it for something that
   * must have the height of currently visible rows.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.clipLayer_ = null;

  /**
   * Scrolls layer. Contains scroll bars.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.scrollsLayer_ = null;

  /**
   * Header height.
   * @type {number}
   * @private
   */
  this.headerHeight_ = 45;

  /**
   * Width of grids.
   * Used for case when rows do not take all available width.
   * Use case: calculation of ratios of horizontal scroll in DG.
   * @type {number}
   */
  this.totalGridsWidth = 0;

  /**
   * Height of grids.
   * @type {number}
   */
  this.totalGridsHeight = 0;

  /**
   * Odd cells path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddPath_ = null;

  /**
   * Even cells path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenPath_ = null;

  /**
   * Hover path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.hoverPath_ = null;

  /**
   * Selected row path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.selectedPath_ = null;

  /**
   * Contains the sequence of heights of grid. Used to quickly calculate this.hoveredIndex on mouse over event
   * for row highlighting purposes.
   * @type {Array.<number>}
   * @private
   */
  this.gridHeightCache_ = [];

  /**
   * Index of currently hovered row.
   * @type {number|undefined}
   */
  this.hoveredIndex = -1;

  /**
   * Vertical upper coordinate (top) of highlighted row.
   * @type {number|undefined}
   * @private
   */
  this.hoverStartY_ = 0;

  /**
   * Vertical lower coordinate (top + height) of highlighted row.
   * @type {number|undefined}
   * @private
   */
  this.hoverEndY_ = 0;

  /**
   * Flag whether the position must be redrawn.
   * @type {boolean}
   * @protected
   */
  this.redrawPosition = false;

  /**
   * Flag whether grid is in dragging progress.
   * NOTE: this flag indicates any dragging progress to avoid triggering rowSelect action on drag end.
   * @type {boolean}
   */
  this.dragging = false;

  /**
   * Item that is currently under dragging.
   * @type {anychart.treeDataModule.Tree.DataItem}
   */
  this.draggingItem = null;

  /**
   * Flag whether alt is pressed.
   * @type {boolean}
   */
  this.altKey = false;

  /**
   * Current scroll interval.
   * @type {?number}
   */
  this.scrollInterval = null;

  /**
   * Scroll offset X.
   * @type {number}
   */
  this.scrollOffsetX = 0;

  /**
   * Scroll offset Y.
   * @type {number}
   */
  this.scrollOffsetY = 0;


  /**
   * Whether chart is interactive.
   * @type {boolean}
   */
  this.interactive = true;

  /**
   * Structure edit settings.
   * @type {anychart.ganttModule.edit.StructureEdit}
   * @private
   */
  this.edit_ = null;

  /**
   * Context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;

  /**
   * Tooltip.
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  /**
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.lockInteractivityRect_ = null;

  /**
   * @type {boolean}
   */
  this.preventClickAfterDrag = false;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove_, this.handleMouseOut_, this.handleMouseClick_,
      this.handleMouseOverAndMove_, this.handleAll_);

  function beforeRowFillInvalidation() {
    this.setOption('rowOddFill', null);
    this.setOption('rowEvenFill', null);
  }

  function beforeRowStrokeInvalidation() {
    this.rowStrokeThickness = anychart.utils.extractThickness(this.getOption('rowStroke'));

    /*
     Standalone grid sets controller.rowStrokeThickness value in own draw() method.
     Not standalone grid does the same excepting one case: restoration from XML od JSON.
     It means that for not standalone case we have to set controller's rowStrokeThickness from here because rowStroke
     method is not available for not standalone instances.
    */
    if (!this.isStandalone) this.controller.rowStrokeThickness(this.rowStrokeThickness);
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['backgroundFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, void 0, beforeRowFillInvalidation],
    ['rowStroke', anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, void 0, beforeRowStrokeInvalidation],
    ['rowEvenFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowOddFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['rowHoverFill', 0, 0],
    ['rowSelectedFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.BaseGrid, anychart.core.VisualBaseWithBounds);


//region -- Consistency States and Signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.MEASURE_COLLECT | //Signal for measuriator.
    anychart.Signal.NEEDS_REAPPLICATION; //Live edit coloring.


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE | //Coloring.
    anychart.ConsistencyState.GRIDS_POSITION | //Any vertical grid position change.
    anychart.ConsistencyState.BASE_GRID_REDRAW; //Light redraw. We use this state to highlight a row without redrawing all or smth like that.


//endregion
//region -- Type definitions.
/**
 * Type definition to simplify getting data item's dates and
 * validation info. Contains correctly calculated fields in
 * suitable default format.
 * @typedef {{
 *   start: number,
 *   end: number,
 *   baselineStart: number,
 *   baselineEnd: number,
 *   baselineProgress: number,
 *   progress: number,
 *   isValidStart: boolean,
 *   isValidEnd: boolean,
 *   isValidTask: boolean,
 *   isFlatGroupingTask: boolean,
 *   isValidBaseline: boolean,
 *   isValidProgress: boolean,
 *   baselineProgressPresents: boolean,
 *   isLoadable: boolean,
 *   minPeriodDate: number,
 *   maxPeriodDate: number,
 *   isValidPeriod: boolean
 * }}
 */
anychart.ganttModule.BaseGrid.ItemData;


//endregion
//region -- Constants.
/**
 * Background rect z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.BG_RECT_Z_INDEX = 10;


/**
 * Events rect z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.EVENTS_RECT_Z_INDEX = 20;


/**
 * Cells layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CELLS_Z_INDEX = 30;


/**
 * Draw layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.MARKERS_Z_INDEX = 34;


/**
 * Draw layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.DRAW_Z_INDEX = 35;


/**
 * Content layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CONTENT_Z_INDEX = 40;


/**
 * Edit layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.EDIT_Z_INDEX = 45;


/**
 * Additional layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.CLIP_Z_INDEX = 50;


/**
 * Tooltip z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.TOOLTIP_Z_INDEX = 50;


/**
 * Scrolls layer z-index.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLLS_Z_INDEX = 60;


/**
 * The scroll timer step in ms.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.TIMER_STEP = 100;


/**
 * The scroll step in px.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLL_STEP = 30;


/**
 * The suggested scrolling margin.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.MARGIN = 32;


/**
 * We start scrolling on mouse move event when mouse leaves container's bounds.
 * This value is a border inside of bounds when scrolling starts.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH = 10;


/**
 * Lower drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO = .2;


/**
 * Higher drag edit ratio.
 * TODO (A.Kudryavtsev): Describe.
 * @type {number}
 */
anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO = 1 - anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO;


//endregion
//region -- Selection.
/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.selection = function() {
  return this.selection_;
};


//endregion
//region -- Row type definition
/**
 * Checks whether tree data item is actually a milestone.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is milestone.
 */
anychart.ganttModule.BaseGrid.isMilestone = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return !item.numChildren() &&
      ((info.isValidStart && !info.isValidEnd) || (info.isValidStart && info.isValidEnd && info.start == info.end));
};


/**
 * Checks whether tree data item is actually a general baseline (this method doesn't check whether item is grouping task or not).
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is baseline.
 */
anychart.ganttModule.BaseGrid.isBaseline = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  /*
    If item has baselineProgressValue field and has valid start and end assume it is a baseline.
    isValidTask field has true value if item has valid actualStart and valid actualEnd values.
   */
  return info.isValidBaseline || (info.isValidTask && info.baselineProgressPresents);
};


/**
 * Checks whether tree data item is actually a grouping task.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is grouping task.
 */
anychart.ganttModule.BaseGrid.isGroupingTask = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return !!item.numChildren() && info.isValidStart && info.isValidEnd;
};


/**
 * Checks whether tree data item is actually a parent.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @return {boolean} - Whether tree data item is parent.
 */
anychart.ganttModule.BaseGrid.isParent = function(item) {
  return !!item.numChildren();
};


/**
 * Checks whether tree data item is actually a regular task (not milestones or grouping).
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is regular task .
 */
anychart.ganttModule.BaseGrid.isRegularTask = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return info.isValidStart &&
      info.isValidEnd &&
      info.start != info.end &&
      !item.numChildren() &&
      !info.isValidBaseline;
};


/**
 * Checks whether tree data item is actually a grouping task with baseline.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is grouping task with baseline.
 */
anychart.ganttModule.BaseGrid.isGroupingTaskWithBaseline = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return info.isValidStart &&
      info.isValidEnd &&
      info.start != info.end &&
      !!item.numChildren() &&
      info.isValidBaseline;
};


/**
 * Checks whether tree data item is actually a regular task with baseline.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item is regular task with baseline.
 */
anychart.ganttModule.BaseGrid.isRegularTaskWithBaseline = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return info.isValidStart &&
      info.isValidEnd &&
      info.start != info.end &&
      !item.numChildren() &&
      info.isValidBaseline;
};


/**
 * Checks whether tree data item contains resource chart periods.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @param {anychart.ganttModule.BaseGrid.ItemData=} opt_info - Already calculated info. Used to avoid recalculation.
 * @return {boolean} - Whether tree data item contains periods.
 */
anychart.ganttModule.BaseGrid.isPeriod = function(item, opt_info) {
  var info = opt_info || anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
  return info.isValidPeriod;
};


//endregion
//region -- Item field checkers.
/**
 * Checks NaN values in parameters passed and selects suitable
 * by priority (from own not NaN value to autoValue).
 * @param {*} val - Value.
 * @param {*} autoVal - Auto value.
 * @return {number}
 */
anychart.ganttModule.BaseGrid.checkNaN = function(val, autoVal) {
  var rv = NaN;
  if (goog.isNumber(val) && !isNaN(val)) {
    rv = val;
  } else if (goog.isNumber(autoVal) && !isNaN(autoVal)) {
    rv = autoVal;
  }
  return /** @type {number} */ (rv);
};


/**
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree data item.
 * @return {anychart.ganttModule.BaseGrid.ItemData}
 */
anychart.ganttModule.BaseGrid.getProjectItemInfo = function(item) {
  var start = item.meta(anychart.enums.GanttDataFields.ACTUAL_START);
  var autoStart = item.meta('autoStart');
  var end = item.meta(anychart.enums.GanttDataFields.ACTUAL_END);
  var autoEnd = item.meta('autoEnd');
  var baselineStart = item.meta(anychart.enums.GanttDataFields.BASELINE_START);
  var baselineEnd = item.meta(anychart.enums.GanttDataFields.BASELINE_END);
  var progress = item.meta('progressValue');
  var autoProgress = item.meta('autoProgress');
  var baselineProgress = item.get(anychart.enums.GanttDataFields.BASELINE_PROGRESS_VALUE);
  var baselineProgressPresents = goog.isNumber(baselineProgress) || anychart.utils.isPercent(baselineProgress);
  baselineProgress = baselineProgressPresents ?
      anychart.utils.isPercent(baselineProgress) ? parseFloat(baselineProgress) / 100 : Number(baselineProgress) :
      NaN;

  var startVal = anychart.ganttModule.BaseGrid.checkNaN(start, autoStart);
  var endVal = anychart.ganttModule.BaseGrid.checkNaN(end, autoEnd);
  var progressVal = anychart.ganttModule.BaseGrid.checkNaN(progress, autoProgress);

  var minPeriodDate = item.meta('minPeriodDate');
  var maxPeriodDate = item.meta('maxPeriodDate');

  return /** @type {anychart.ganttModule.BaseGrid.ItemData} */ ({
    start: startVal,
    end: endVal,
    baselineStart: baselineStart,
    baselineEnd: baselineEnd,
    baselineProgress: baselineProgress,
    progress: progressVal,
    isValidStart: !isNaN(startVal),
    isValidEnd: !isNaN(endVal),
    isValidTask: !isNaN(startVal) && !isNaN(endVal) && startVal != endVal,
    isFlatGroupingTask: !isNaN(startVal) && !isNaN(endVal) && startVal == endVal && item.numChildren(),
    isValidBaseline: goog.isNumber(baselineStart) && !isNaN(baselineStart) && goog.isNumber(baselineEnd) && !isNaN(baselineEnd),
    isValidProgress: !isNaN(progressVal),
    baselineProgressPresents: baselineProgressPresents,
    minPeriodDate: minPeriodDate,
    maxPeriodDate: maxPeriodDate,
    isValidPeriod: !isNaN(minPeriodDate) && !isNaN(maxPeriodDate),
    isLoadable: !!item.get(anychart.enums.GanttDataFields.IS_LOADABLE) // ENV-1410.
  });
};


//endregion


/**
 * Creates gantt format provider.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Data item.
 * @param {Object=} opt_period - Optional current period.
 * @param {number=} opt_periodIndex - Period index. Required is opt_period is set.
 * @param {anychart.enums.TLElementTypes=} opt_type - Type of hovered timeline element.
 * @param {number=} opt_hoveredRatio - For timeline: hovered ratio.
 * @param {number=} opt_hoveredTimestamp - For timeline: hovered time.
 * @return {anychart.format.Context} - Gantt context provider.
 */
anychart.ganttModule.BaseGrid.prototype.createFormatProvider = function(item, opt_period, opt_periodIndex, opt_type, opt_hoveredRatio, opt_hoveredTimestamp) {
  if (!this.formatProvider_)
    this.formatProvider_ = new anychart.format.Context();

  var isResources = this.controller.isResources();
  var values = {
    'item': {value: item, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: item.get(anychart.enums.GanttDataFields.NAME), type: anychart.enums.TokenType.STRING},
    'id': {value: item.get(anychart.enums.GanttDataFields.ID), type: anychart.enums.TokenType.STRING},
    'linearIndex': {value: item.meta('index') + 1, type: anychart.enums.TokenType.NUMBER}
  };

  var rowType;

  if (isResources) {
    // If period is given for current format provider - set it's values as token custom values.
    if (goog.isDef(opt_period)) {
      var tokenCustomValues = this.getPeriodCustomTokenValues(opt_period);
      this.formatProvider_.tokenCustomValues(tokenCustomValues);
    } else {
      this.formatProvider_.tokenCustomValues({});
    }
    rowType = anychart.enums.TLElementTypes.PERIODS;
    values['minPeriodDate'] = {value: item.meta('minPeriodDate'), type: anychart.enums.TokenType.DATE_TIME};
    values['maxPeriodDate'] = {value: item.meta('maxPeriodDate'), type: anychart.enums.TokenType.DATE_TIME};
    values['period'] = {value: opt_period, type: anychart.enums.TokenType.UNKNOWN};
    values['periodIndex'] = {
      value: (goog.isDefAndNotNull(opt_periodIndex) && opt_periodIndex >= 0) ? opt_periodIndex : void 0,
      type: anychart.enums.TokenType.NUMBER
    };
    values['periodStart'] = {
      value: opt_period ?
          item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.START) :
          void 0, type: anychart.enums.TokenType.DATE_TIME
    };
    values['periodEnd'] = {
      value: opt_period ?
          item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.END) :
          void 0, type: anychart.enums.TokenType.DATE_TIME
    };
    values['start'] = {
      value: values['periodStart'].value || values['minPeriodDate'].value,
      type: anychart.enums.TokenType.DATE_TIME
    };
    values['end'] = {
      value: values['periodEnd'].value || values['maxPeriodDate'].value,
      type: anychart.enums.TokenType.DATE_TIME
    };
    values['barBounds'] = {
      value: item.getMeta('periodBounds', opt_periodIndex),
      type: anychart.enums.TokenType.UNKNOWN
    };
  } else {
    var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
    values['actualStart'] = {
      value: item.meta(anychart.enums.GanttDataFields.ACTUAL_START),
      type: anychart.enums.TokenType.DATE_TIME
    };
    values['actualEnd'] = {
      value: item.meta(anychart.enums.GanttDataFields.ACTUAL_END),
      type: anychart.enums.TokenType.DATE_TIME
    };

    var isParent = anychart.ganttModule.BaseGrid.isGroupingTask(item, info);

    values['progressValue'] = {value: info.progress, type: anychart.enums.TokenType.PERCENT};
    values['autoStart'] = {value: isParent ? item.meta('autoStart') : void 0, type: anychart.enums.TokenType.DATE_TIME};
    values['autoEnd'] = {value: isParent ? item.meta('autoEnd') : void 0, type: anychart.enums.TokenType.DATE_TIME};

    values['start'] = {value: info.start, type: anychart.enums.TokenType.DATE_TIME};
    values['end'] = {value: info.end, type: anychart.enums.TokenType.DATE_TIME};

    values['autoProgress'] = {
      value: isParent ? item.meta('autoProgress') : void 0,
      type: anychart.enums.TokenType.PERCENT
    };
    values['barBounds'] = {value: item.meta('relBounds'), type: anychart.enums.TokenType.UNKNOWN};

    values['progress'] = {value: info.progress, type: anychart.enums.TokenType.PERCENT};

    values['baselineProgress'] = {value: info.baselineProgressPresents ? info.baselineProgress : 0, type: anychart.enums.TokenType.PERCENT};

    if (info.isValidBaseline) {
      rowType = anychart.enums.TLElementTypes.BASELINES;
      values['baselineStart'] = {
        value: info.baselineStart,
        type: anychart.enums.TokenType.DATE_TIME
      };
      values['baselineEnd'] = {
        value: info.baselineEnd,
        type: anychart.enums.TokenType.DATE_TIME
      };
    } else if (anychart.ganttModule.BaseGrid.isMilestone(item, info)) {
      rowType = anychart.enums.TLElementTypes.MILESTONES;
    } else if (anychart.ganttModule.BaseGrid.isGroupingTask(item, info)) {
      rowType = anychart.enums.TLElementTypes.GROUPING_TASKS;
    } else if (anychart.ganttModule.BaseGrid.isRegularTask(item, info)) {
      rowType = anychart.enums.TLElementTypes.TASKS;
    }
  }

  /*
    Here's a difference between 'rowType' and 'elementType':
    elementType is type of currently hovered bar (bar under cursor).
    rowType is type used to draw element in current row.

    elementType appears in context only on bar hover.
    rowType always appears in context if data item contains no errors in date-time representation.
   */

  if (goog.isDef(rowType))
    values['rowType'] = {value: rowType, type: anychart.enums.TokenType.STRING};

  if (goog.isDef(opt_type))
    values['elementType'] = {value: opt_type, type: anychart.enums.TokenType.STRING};

  if (goog.isDef(opt_hoveredRatio))
    values['hoverRatio'] = {value: opt_hoveredRatio, type: anychart.enums.TokenType.NUMBER};

  if (goog.isDef(opt_hoveredTimestamp))
    values['hoverDateTime'] = {value: opt_hoveredTimestamp, type: anychart.enums.TokenType.DATE_TIME};

  this.formatProvider_.dataSource(item);
  return /** @type {anychart.format.Context} */ (this.formatProvider_.propagate(values));
};


/**
 * Creates custom token values from period data.
 * @param {Object} period - Object containing period data.
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>} - context values.
 */
anychart.ganttModule.BaseGrid.prototype.getPeriodCustomTokenValues = function(period) {
  var periodKeys = goog.object.getKeys(period);
  var contextValues = {};

  /*
    No use overriding these tokens, they are correctly extracted from periods
    in createFormatProvider.
   */
  var forbiddenKeys = [
    anychart.enums.GanttDataFields.START,
    anychart.enums.GanttDataFields.END
  ];

  for (var i = 0; i < periodKeys.length; i++) {
    var key = periodKeys[i];

    // We don't want to override some of the keys.
    if (goog.array.contains(forbiddenKeys, key)) {
      continue;
    }

    var value = period[key];
    var type = anychart.enums.TokenType.UNKNOWN;

    if (goog.isNumber(value)) {
      type = anychart.enums.TokenType.NUMBER;
    } else if (anychart.utils.isPercent(value)) {
      type = anychart.enums.TokenType.PERCENT;
    } else if (goog.isString(value)) {
      type = anychart.enums.TokenType.STRING;
    }

    contextValues[key] = {
      value: value,
      type: type
    };
  }
  return contextValues;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Additional actions for inherited classes on mouse move while dragging.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addDragMouseMove = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up after dragging.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addDragMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse move and over.
 * @param {?Object} wrappedEvent - Event object.
 * @param {anychart.core.MouseEvent} originalEvent - Original event.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseMoveAndOver = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse down.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseDown = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse up.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseUp = goog.nullFunction;


/**
 * Additional actions for inherited classes on mouse double click.
 * @param {?Object} evt - Event object.
 */
anychart.ganttModule.BaseGrid.prototype.addMouseDblClick = goog.nullFunction;


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseClick_ = function(event) {
  if (!this.preventClickAfterDrag) {
    if (this.interactive) {
      var click = this.getInteractivityEvent(event);

      if (click && !this.interactivityHandler.altKey) {
        var mouseUp = goog.object.clone(click);
        mouseUp['type'] = anychart.enums.EventType.ROW_MOUSE_UP;
        var upDispatched = this.interactivityHandler.dispatchEvent(mouseUp);
        var clickDispatched = this.interactivityHandler.dispatchEvent(click);
        if (upDispatched && clickDispatched) {
          this.interactivityHandler.rowClick(click);

          //DVF-4040
          this.preventMouseOverAfterClick_ = true;
        }
      } else {
        this.interactivityHandler.rowUnselect(click);
      }
    } else {
      this.interactive = true;
    }
  }
  this.preventClickAfterDrag = false;
};


/**
 * Mouse over and move internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseOverAndMove_ = function(event) {
  if (this.preventMouseOverAfterClick_) {
    //DVF-4040
    this.preventMouseOverAfterClick_ = false;
  } else {
    var evt = this.getInteractivityEvent(event);
    this.addMouseMoveAndOver(evt, event);
    if (evt && this.interactive && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseMove(evt);
    }
    if (!evt) //this fixes case when tooltip is still visible on row mouse out.
      this.tooltip().hide();
  }
};


/**
 * "All" internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleAll_ = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.DBLCLICK:
      this.handleDblMouseClick_(event);
      break;
    case acgraph.events.EventType.MOUSEDOWN:
    case acgraph.events.EventType.TOUCHSTART:
      this.handleMouseDown_(event);
      break;
    case acgraph.events.EventType.MOUSEUP:
    case acgraph.events.EventType.TOUCHEND:
      this.handleMouseUp_(event);
      break;
    case acgraph.events.EventType.CONTEXTMENU:
      this.interactivityHandler.dispatchEvent(event);
  }
};


/**
 * Mouse double click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleDblMouseClick_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseDblClick(evt);
  if (this.interactive) {
    if (evt && this.interactivityHandler.dispatchEvent(evt))
      this.interactivityHandler.rowDblClick(evt);
  } else {
    this.interactive = true;
  }
};


/**
 * Mouse out internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseOut_ = function(event) {
  if (this.interactive) {
    var evt = this.getInteractivityEvent(event);
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseOut(evt);
    }
  }
};


/**
 * Mouse down internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseDown_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseDown(evt);
  if (this.interactive) {
    event.preventDefault();
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseDown(evt);
    }
  }
};


/**
 * Mouse up internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.handleMouseUp_ = function(event) {
  var evt = this.getInteractivityEvent(event);
  this.addMouseUp(evt);
  if (this.interactive) {
    if (evt && this.interactivityHandler.dispatchEvent(evt)) {
      this.interactivityHandler.rowMouseUp(evt);
    }
  }
  this.tooltip().hide();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interface.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowClick = function(event) {
  this.rowSelect(event);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowDblClick = function(event) {
  this.rowExpandCollapse(event);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowSelect = function(event) {
  if (this.interactive) {
    var item = event['item'];
    if (this.selectRow(item)) {
      var eventObj = goog.object.clone(event);
      eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
      this.interactivityHandler.dispatchEvent(eventObj);
    }
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowExpandCollapse = function(event) {
  var item = event['item'];
  if (item && anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
    var value = !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
    var evtObj = {
      'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
      'item': item,
      'collapsed': value
    };

    if (this.interactivityHandler.dispatchEvent(evtObj))
      item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseMove = function(event) {
  if (!this.dragging) {
    this.interactivityHandler.highlight(event['hoveredIndex'], event['startY'], event['endY']);
    var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
    var formatProvider = this.createFormatProvider(event['item'], event['period'], event['periodIndex']);
    tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseOver = goog.nullFunction;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseOut = function(event) {
  this.interactivityHandler.highlight();
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseUp = goog.nullFunction;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.rowMouseDown = goog.nullFunction;


/**
 * Calls this method when we move the mouse out of grid. That's why both offsetX and offsetY can't equal 0.
 * @param {goog.fx.DragEvent=} opt_event - Event.
 */
/*
  Illustration for this method:
  (Grid is rectangle in center)

    offsetX < 0  |  !offsetX      |  offsetX > 0
    offsetY < 0  |  offsetY < 0   |  offsetY < 0

    ------------ +----------------+ --------------
                 |                |
    offsetX < 0  |  !offsetX      |  offsetX > 0
    !offsetY     |  !offsetX      |  !offsetY
                 |                |
    ------------ +----------------+ --------------

    offsetX < 0  |  !offsetX      |  offsetX > 0
    offsetY > 0  |  offsetY > 0   |  offsetY > 0

 */
anychart.ganttModule.BaseGrid.prototype.mouseOutMove = goog.nullFunction;


/**
 * Creates new event object to be dispatched.
 * @param {anychart.core.MouseEvent|goog.fx.DragEvent} event - Incoming event.
 * @return {?Object} - New event object to be dispatched.
 */
anychart.ganttModule.BaseGrid.prototype.getInteractivityEvent = function(event) {
  if (this.gridHeightCache_.length) {
    var visibleItems = this.controller.getVisibleItems();
    var startIndex = /** @type {number} */(this.controller.startIndex());
    var item;
    var type = event.type;
    switch (type) {
      case acgraph.events.EventType.MOUSEOUT:
        type = anychart.enums.EventType.ROW_MOUSE_OUT;
        if (this.hoveredIndex >= 0) item = visibleItems[startIndex + this.hoveredIndex];
        break;
      case acgraph.events.EventType.MOUSEOVER:
        type = anychart.enums.EventType.ROW_MOUSE_OVER;
        break;
      case acgraph.events.EventType.MOUSEMOVE:
      case acgraph.events.EventType.TOUCHMOVE:
        type = anychart.enums.EventType.ROW_MOUSE_MOVE;
        break;
      case acgraph.events.EventType.MOUSEDOWN:
      case acgraph.events.EventType.TOUCHSTART:
        type = anychart.enums.EventType.ROW_MOUSE_DOWN;
        break;
      case acgraph.events.EventType.MOUSEUP:
      case acgraph.events.EventType.TOUCHEND:
        type = anychart.enums.EventType.ROW_MOUSE_UP;
        break;
      case acgraph.events.EventType.CLICK:
        type = anychart.enums.EventType.ROW_CLICK;
        break;
      case acgraph.events.EventType.DBLCLICK:
        type = anychart.enums.EventType.ROW_DBL_CLICK;
        break;
    }

    var newEvent = {
      'type': type,
      'actualTarget': event.target,
      'target': this,
      'originalEvent': event
    };

    var initialTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight_ + 1);

    var min = this.pixelBoundsCache.top +
        this.container().getStage().getClientPosition().y +
        this.headerHeight_;

    var mouseHeight = event.clientY - min;

    var totalHeight = this.gridHeightCache_.length ? this.gridHeightCache_[this.gridHeightCache_.length - 1] : 0;

    if (item) {
      newEvent['item'] = item;
    } else if (mouseHeight < 0 || mouseHeight > totalHeight) {
      return null;
    } else {
      var index = goog.array.binarySearch(this.gridHeightCache_, mouseHeight);
      index = index >= 0 ? index : ~index; //Index of row under mouse.
      this.hoveredIndex = index;

      var startHeight = index ? this.gridHeightCache_[index - 1] : 0;
      var startY = initialTop + startHeight;
      var endY = startY + (this.gridHeightCache_[index] - startHeight - this.rowStrokeThickness);

      newEvent['item'] = visibleItems[startIndex + index];
      newEvent['startY'] = startY;
      newEvent['endY'] = endY;
      newEvent['hoveredIndex'] = this.hoveredIndex;
      newEvent['index'] = startIndex + index;
      newEvent['itemHeightMouseRatio'] = (mouseHeight - startHeight) / (this.gridHeightCache_[index] - startHeight);
    }
    return newEvent;
  }
  return null;
};


/**
 *
 * @return {Array.<number>}
 */
anychart.ganttModule.BaseGrid.prototype.getGridHeightCache = function() {
  return this.gridHeightCache_;
};


/**
 * Enables/disables live edit mode.
 * @param {boolean=} opt_value - Value to be set.
 * @deprecated since 8.3.0 use grid.edit() instead. DVF-3623
 * @return {anychart.ganttModule.IInteractiveGrid|boolean} - Itself for method chaining or current value.
 */
anychart.ganttModule.BaseGrid.prototype.editing = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['dataGrid.editing() or timeline.editing()', 'dataGrid.edit() or timeline.edit()'], true);
  if (goog.isDef(opt_value)) {
    this.edit()['enabled'](opt_value);
    return this;
  }
  return /** @type {boolean} */ (this.edit().getOption('enabled'));
};


/**
 * Sets interactivity handler.
 * @param {!anychart.ganttModule.IInteractiveGrid} value - Interactivity handler.
 */
anychart.ganttModule.BaseGrid.prototype.setInteractivityHandler = function(value) {
  this.interactivityHandler = value;
  if (this.interactivityHandler != this) {
    this.edit().parent(/** @type {anychart.ganttModule.edit.StructureEdit} */ (this.interactivityHandler.edit()));
  }
};


//region -- Edit.
/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.edit = function(opt_value) {
  if (!this.edit_) {
    this.edit_ = new anychart.ganttModule.edit.StructureEdit();
    this.setupCreated('edit', this.edit_);
    this.edit_.listenSignals(this.onEditSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.edit_.setup(opt_value);
    return this;
  }
  return this.edit_;
};


/**
 *
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.onEditSignal_ = function(e) {
  // if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
  //   if (/** @type {anychart.core.settings.IObjectWithSettings} */ (this.edit()).getOption('enabled')) {
  //     if (!this.denyAddDocMouseMoveListener_) {
  //       goog.events.listen(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
  //       this.denyAddDocMouseMoveListener_ = true;
  //     }
  //   } else {
  //     goog.events.unlisten(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
  //     this.denyAddDocMouseMoveListener_ = false;
  //   }
  //   // this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
  // }
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.reapplyStructureEditAppearance();
  }
};


/**
 * Adds/removes document mouse move listener to provide ability
 * to auto scroll grid and auto extend TL scale on edit drag.
 * NOTE: does not add listener twice.
 * @param {boolean} value - Whether to enable document mouse move listening.
 */
anychart.ganttModule.BaseGrid.prototype.enableDocMouseMove = function(value) {
  if (value && !this.denyAddDocMouseMoveListener_) {
    goog.events.listen(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
    this.denyAddDocMouseMoveListener_ = true;
  } else {
    goog.events.unlisten(anychart.document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
    this.denyAddDocMouseMoveListener_ = false;
  }
};


//endregion
//----------------------------------------------------------------------------------------------------------------------
//
//  DOM init.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Inner getter for this.base_.
 * Initializes and returns base layer.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getBase = function() {
  if (!this.base_) {
    this.base_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.base_, 'base-layer');
    //We handle mouseDown here to prevent double click selection.
    this.bindHandlersToGraphics(this.base_, null, null, null, null, /** @type {Function} */ (this.handleMouseDown_));
  }
  return this.base_;
};


/**
 * Inner getter for this.cellsLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getCellsLayer = function() {
  if (!this.cellsLayer_) {
    this.cellsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.cellsLayer_, 'cells-layer');
    this.cellsLayer_.zIndex(anychart.ganttModule.BaseGrid.CELLS_Z_INDEX);
  }
  return this.cellsLayer_;
};


/**
 * Inner getter for this.drawLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getDrawLayer = function() {
  if (!this.drawLayer_) {
    this.drawLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.drawLayer_, 'draw-layer');
    this.drawLayer_.zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX);
  }
  return this.drawLayer_;
};


/**
 * Inner getter for this.contentLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getContentLayer = function() {
  if (!this.contentLayer_) {
    this.contentLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.contentLayer_, 'content-layer');
    this.contentLayer_.zIndex(anychart.ganttModule.BaseGrid.CONTENT_Z_INDEX);
  }
  return this.contentLayer_;
};


/**
 * Inner getter for this.editLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getEditLayer = function() {
  if (!this.editLayer_) {
    this.editLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.editLayer_, 'edit-layer');
    this.editLayer_.zIndex(anychart.ganttModule.BaseGrid.EDIT_Z_INDEX);
  }
  return this.editLayer_;
};


/**
 * Inner getter for this.clipLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getClipLayer = function() {
  if (!this.clipLayer_) {
    this.clipLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.clipLayer_, 'clip-layer');
    this.clipLayer_.zIndex(anychart.ganttModule.BaseGrid.CLIP_Z_INDEX);
  }
  return this.clipLayer_;
};


/**
 * Applies clip when it's necessary.
 *
 * @param {anychart.math.Rect} clipRect - Clip bounds to be applied.
 */
anychart.ganttModule.BaseGrid.prototype.applyClip = function(clipRect) {
  this.getClipLayer().clip(clipRect);

  if (this.rangeLineMarkersLayer_) //Data grid doesn't create own markers layer.
    this.rangeLineMarkersLayer_.clip(clipRect);
  if (this.textMarkersLayer_) //Data grid doesn't create own markers layer.
    this.textMarkersLayer_.clip(clipRect);

  this.getDrawLayer().clip(clipRect);
};


/**
 * Inner getter for this.scrollsLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.BaseGrid.prototype.getScrollsLayer = function() {
  if (!this.scrollsLayer_) {
    this.scrollsLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.scrollsLayer_, 'scrolls-layer');
    this.scrollsLayer_.zIndex(anychart.ganttModule.BaseGrid.SCROLLS_Z_INDEX);
  }
  return this.scrollsLayer_;
};


/**
 * Getter for this.oddPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getOddPath = function() {
  if (!this.oddPath_) {
    this.oddPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.oddPath_, 'odd-path');
    this.oddPath_.stroke(null).zIndex(1);
  }
  return this.oddPath_;
};


/**
 * Getter for this.evenPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getEvenPath = function() {
  if (!this.evenPath_) {
    this.evenPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.evenPath_, 'even-path');
    this.evenPath_.stroke(null).zIndex(1);
  }
  return this.evenPath_;
};


/**
 * Getter for this.hoverPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getHoverPath = function() {
  if (!this.hoverPath_) {
    this.hoverPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.hoverPath_, 'hover-path');
    this.hoverPath_.stroke(null)/*.fill(/!** @type {acgraph.vector.Fill} *!/(this.getOption('rowHoverFill')))*/.zIndex(2);
  }
  return this.hoverPath_;
};


/**
 * Getter for this.selectedPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getSelectedPath = function() {
  if (!this.selectedPath_) {
    this.selectedPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.selectedPath_, 'selected-path');
    this.selectedPath_.stroke(null)/*.fill(/!** @type {acgraph.vector.Fill} *!/(this.getOption('rowSelectedFill')))*/.zIndex(3);
  }
  return this.selectedPath_;
};


/**
 * Getter for this.rowStrokePath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getRowStrokePath = function() {
  if (!this.rowStrokePath_) {
    this.rowStrokePath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.rowStrokePath_, 'row-stroke-path');
    this.rowStrokePath_.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('rowStroke'))).zIndex(4);
  }
  return this.rowStrokePath_;
};


/**
 * Inner getter for this.editStructurePreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.getEditStructurePreviewPath_ = function() {
  if (!this.editStructurePreviewPath_) {
    this.editStructurePreviewPath_ = this.getEditLayer().path();
    anychart.utils.nameElement(this.editStructurePreviewPath_, 'edit-structure-preview-path');
  }
  return this.editStructurePreviewPath_;
};


/**
 * Getter for this.headerSeparationPath_.
 * @return {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.prototype.getHeaderSeparationPath = function() {
  if (!this.headerSeparationPath_) {
    this.headerSeparationPath_ = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
    anychart.utils.nameElement(this.headerSeparationPath_, 'header-separation-path');
    this.headerSeparationPath_.zIndex(40);
  }
  return this.headerSeparationPath_;
};


//region --- Coloring
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    // grid coloring
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'backgroundFill', anychart.core.settings.fillNormalizer],

    // row coloring
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowEvenFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowOddFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowHoverFill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'rowSelectedFill', anychart.core.settings.fillOrFunctionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.BaseGrid, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS);


/**
 * Annotations cache of resolver functions.
 * @type {Object.<string, function(anychart.ganttModule.BaseGrid, number, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, anychart.enums.ConnectorType=, number=, number=):(acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill)>}
 * @private
 */
anychart.ganttModule.BaseGrid.colorResolversCache_ = {};


/**
 * Returns a color resolver for passed color names and type.
 * @param {(string|null|boolean)} colorName
 * @param {anychart.enums.ColorType} colorType
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors
 * @return {function(anychart.ganttModule.BaseGrid, number, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=, anychart.enums.ConnectorType=, number=, number=):acgraph.vector.AnyColor}
 */
anychart.ganttModule.BaseGrid.getColorResolver = function(colorName, colorType, canBeHoveredSelected) {
  if (!colorName) return anychart.color.getNullColor;
  var hash = colorType + '|' + colorName + '|' + canBeHoveredSelected;
  var result = anychart.ganttModule.BaseGrid.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.ganttModule.BaseGrid.colorResolversCache_[hash] = result = goog.partial(anychart.ganttModule.BaseGrid.getColor_,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, canBeHoveredSelected);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {string} colorName
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {boolean} canBeHoveredSelected
 * @param {anychart.ganttModule.BaseGrid} baseGrid
 * @param {number} state
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItem
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItemTo
 * @param {anychart.enums.ConnectorType=} opt_connType
 * @param {number=} opt_periodIndex
 * @param {number=} opt_periodIndexTo
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.ganttModule.BaseGrid.getColor_ = function(colorName, normalizer, isHatchFill, canBeHoveredSelected, baseGrid, state, opt_dataItem, opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (canBeHoveredSelected && (state != anychart.PointState.NORMAL)) {
    stateColor = baseGrid.resolveOption(colorName, state, normalizer);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(baseGrid.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = baseGrid.getHatchFillResolutionContext();
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = baseGrid.resolveOption(colorName, 0, normalizer);
  if (isHatchFill && color === true)
    color = normalizer(baseGrid.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        baseGrid.getHatchFillResolutionContext() :
        baseGrid.getColorResolutionContext(colorName, opt_dataItem, opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = baseGrid.getColorResolutionContext(colorName, opt_dataItem, opt_dataItemTo, opt_connType);
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/**
 * Implements option inheritance from base bar settings.
 * @param {string} name - .
 * @param {string} defaultName - .
 * @return {*}
 */
anychart.ganttModule.BaseGrid.prototype.getInheritedOption = function(name, defaultName) {
  var val = this.getOption(name);
  return goog.isDefAndNotNull(val) ? val : this.getOption(defaultName);
};


/**
 * Resolve annotation color option.
 * @param {string} name
 * @param {number} state
 * @param {Function} normalizer
 * @return {*}
 */
anychart.ganttModule.BaseGrid.prototype.resolveOption = function(name, state, normalizer) {
  if (name == 'rowSelectedFill' || name == 'rowHoverFill' || name == 'selectedElementFill' || name == 'selectedElementStroke') {
    return normalizer(this.getOption(name));
  } else {
    var isFill = goog.string.contains(name, 'Fill');
    var defaultName = isFill ? 'baseFill' : 'baseStroke';
    return normalizer(this.getInheritedOption(name, defaultName));
  }
};


/**
 * Returns source color for colorName.
 * @param {string} colorName
 * @param {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} palette
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.BaseGrid.prototype.getSourceColorFor = function(colorName, palette) {
  var sourceColor;
  switch (colorName) {
    case 'baseFill':
      sourceColor = palette.itemAt(0);
      break;
    case 'baseStroke':
      sourceColor = anychart.color.lighten(palette.itemAt(0));
      break;
    case 'progressFill':
      sourceColor = palette.itemAt(1);
      break;
    case 'progressStroke':
      sourceColor = {
        'color': '#fff',
        'opacity': 0.00001
      };
      break;
    case 'baselineFill':
      sourceColor = anychart.color.lighten(palette.itemAt(1), 0.7);
      break;
    case 'baselineStroke':
      sourceColor = anychart.color.darken(anychart.color.lighten(palette.itemAt(1), 0.7));
      break;
    case 'parentFill':
      sourceColor = palette.itemAt(4);
      break;
    case 'parentStroke':
      sourceColor = anychart.color.lighten(palette.itemAt(4));
      break;
    case 'milestoneFill':
      sourceColor = palette.itemAt(9);
      break;
    case 'milestoneStroke':
      sourceColor = anychart.color.darken(palette.itemAt(9));
      break;
    case 'selectedElementFill':
      sourceColor = palette.itemAt(2);
      break;
    case 'selectedElementStroke':
      sourceColor = anychart.color.darken(palette.itemAt(2));
      break;
    case 'selectedConnectorStroke':
      sourceColor = anychart.color.setThickness(/** @type {acgraph.vector.Stroke} */(anychart.color.lighten(palette.itemAt(2))), 2);
      break;
    case 'rowHoverFill':
      sourceColor = anychart.getFlatTheme('ganttBase')['defaultRowHoverFill'];
      break;
    case 'rowSelectedFill':
      sourceColor = anychart.getFlatTheme('ganttBase')['defaultRowSelectedFill'];
      break;
    default:
      sourceColor = 'blue';
  }
  return /** @type {acgraph.vector.AnyColor} */(sourceColor);
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {string} colorName
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItem
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_dataItemTo
 * @param {anychart.enums.ConnectorType=} opt_connType
 * @param {number=} opt_periodIndex
 * @param {number=} opt_periodIndexTo
 * @return {Object}
 */
anychart.ganttModule.BaseGrid.prototype.getColorResolutionContext = function(colorName, opt_dataItem, opt_dataItemTo, opt_connType, opt_periodIndex, opt_periodIndexTo) {
  var palette = (/** @type {anychart.ganttModule.IInteractiveGrid} */(this.interactivityHandler)).palette();
  var sourceColor = this.getSourceColorFor(colorName, /** @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} */ (palette));
  var rv = {
    'sourceColor': sourceColor
  };
  if (goog.isDefAndNotNull(opt_dataItem)) {
    if (goog.isDef(opt_connType)) {
      rv['fromItem'] = opt_dataItem;
      rv['fromItemIndex'] = opt_dataItem.meta('index');
      rv['toItem'] = opt_dataItemTo;
      rv['toItemIndex'] = opt_dataItemTo.meta('index');
      rv['connType'] = opt_connType;
    } else {
      rv['item'] = opt_dataItem;
      rv['itemIndex'] = opt_dataItem.meta('index');
    }

    if (goog.isDef(opt_periodIndex)) {
      if (goog.isDef(opt_periodIndexTo)) {
        var fromPeriod = opt_dataItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
        var toPeriod = opt_dataItemTo.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndexTo];
        rv['fromPeriod'] = fromPeriod;
        rv['fromPeriodIndex'] = opt_periodIndex;
        rv['toPeriod'] = toPeriod;
        rv['toPeriodIndex'] = opt_periodIndexTo;
      } else {
        var period = opt_dataItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
        rv['period'] = period;
        rv['periodIndex'] = opt_periodIndex;
      }
    }
  }
  return rv;
};


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @return {Object}
 */
anychart.ganttModule.BaseGrid.prototype.getHatchFillResolutionContext = function() {
  return {
    'sourceHatchFill': this.getAutoHatchFill()
  };
};


/**
 * Returns default hatch fill.
 * @return {acgraph.vector.PatternFill}
 */
anychart.ganttModule.BaseGrid.prototype.getAutoHatchFill = function() {
  return /*this.autoHatchFill || */acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.palette = function(opt_value) {
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
anychart.ganttModule.BaseGrid.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
  }
};
//endregion


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.edit().fill() instead. DVF-3623
 * @return {(acgraph.vector.Stroke|anychart.ganttModule.edit.StructureEdit)}
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewFill = function(var_args) {
  var target = this.edit();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.editStructurePreviewFill()', 'timeline.edit().fill()'], true);
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.edit().stroke() instead. DVF-3623
 * @return {(acgraph.vector.Stroke|anychart.ganttModule.edit.StructureEdit)}
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewStroke = function(var_args) {
  var target = this.edit();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.editStructurePreviewStroke()', 'timeline.edit().stroke()'], true);
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.edit().placementStroke() instead. DVF-3623
 * @return {(acgraph.vector.Stroke|anychart.ganttModule.edit.StructureEdit)}
 */
anychart.ganttModule.BaseGrid.prototype.editStructurePreviewDashStroke = function(var_args) {
  var target = this.edit();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.editStructurePreviewDashStroke()', 'timeline.edit().placementStroke()'], true);
  return arguments.length ? target['placementStroke'].apply(target, arguments) : target['placementStroke']();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Private.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Events rect mouse down handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragMouseDown_ = function(e) {
  if (anychart.utils.instanceOf(e.currentTarget, acgraph.vector.Element) && !this.scrollDragger) {
    this.scrollDragger = new anychart.ganttModule.BaseGrid.Dragger(this.base_, this);
    //this.scrollDragger.listen(goog.fx.Dragger.EventType.START, this.dragStartHandler_, false, this);

    this.scrollDragger.listen(goog.fx.Dragger.EventType.DRAG, this.dragHandler_, false, this);

    this.scrollDragger.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
    this.scrollDragger.startDrag(e.getOriginalEvent());
  }
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragStartHandler_ = function(e) {
  this.scrollDragger.reset();
};


/**
 * Drag handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragHandler_ = function(e) {
  this.dragging = true;
  if (this.edit().getOption('enabled') && !this.denyDragScrolling) {
    this.enableDocMouseMove(true);
    this.interactive = false;
    this.interactivityHandler.highlight();
    this.tooltip().hide();
    var evt = this.getInteractivityEvent(e);
    if (evt) {
      var destinationItem = evt['item'];

      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var startY = evt['startY'];
      var endY = evt['endY'];

      if (this.draggingItem) {
        if (destinationItem && destinationItem != this.draggingItem && !destinationItem.isChildOf(this.draggingItem)) {
          if (itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO ||
              itemHeightMouseRatio > anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO) {
            var top = itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO ? startY : endY;
            this.interactivityHandler.editStructureHighlight(top, void 0, 'auto');
          } else {
            if (anychart.ganttModule.BaseGrid.isMilestone(destinationItem)) {
              this.interactivityHandler.editStructureHighlight(void 0, void 0, 'not-allowed');
            } else {
              this.interactivityHandler.editStructureHighlight(startY, endY, 'auto');
            }
          }
        } else {
          this.interactivityHandler.editStructureHighlight(void 0, void 0, 'not-allowed');
        }
        this.addDragMouseMove(evt);
      } else {
        var min = this.pixelBoundsCache.top +
            this.container().getStage().getClientPosition().y +
            this.headerHeight_;

        var h = this.gridHeightCache_[this.gridHeightCache_.length - 1];
        this.interactivityHandler.editStructureHighlight(min + h, void 0, 'auto');
      }
    }
  }
  this.tooltip().hide();
  this.preventClickAfterDrag = true;
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.dragEndHandler_ = function(e) {
  if (this.edit().enabled() && !this.denyDragScrolling) {
    var evt = this.getInteractivityEvent(e);
    var tree = this.controller.data();

    this.addDragMouseUp(evt);

    if (evt) {
      var destinationItem = evt['item'];
      var hoveredIndex = evt['hoveredIndex'];
      var totalIndex = this.controller.startIndex() + hoveredIndex;

      var visibleItems = this.controller.getVisibleItems();

      var itemHeightMouseRatio = evt['itemHeightMouseRatio'];
      var firstItem, secondItem, par; //We drop item between these two.

      var dropLower = itemHeightMouseRatio < anychart.ganttModule.BaseGrid.LOWER_DRAG_EDIT_RATIO;
      var dropUpper = itemHeightMouseRatio > anychart.ganttModule.BaseGrid.HIGHER_DRAG_EDIT_RATIO;

      if (this.draggingItem && destinationItem && destinationItem != this.draggingItem && !destinationItem.isChildOf(this.draggingItem)) {
        if (dropLower || dropUpper) {
          if (dropLower) {
            firstItem = visibleItems[totalIndex - 1];
            secondItem = destinationItem;
          } else {
            firstItem = destinationItem;
            secondItem = visibleItems[totalIndex + 1];
          }

          if (firstItem && secondItem) {
            var firstDepth = firstItem.meta('depth');
            var secondDepth = secondItem.meta('depth');
            var destIndex;

            if (dropUpper) {
              par = destinationItem.getParent() || tree;
              par.addChildAt(this.draggingItem, par.indexOfChild(destinationItem) + 1);
            } else if (firstDepth == secondDepth) {
              var secondParent = secondItem.getParent() || secondItem.tree();
              destIndex = secondParent.indexOfChild(secondItem);

              var dragParent = this.draggingItem.getParent() || this.draggingItem.tree();
              if (dragParent == secondParent) {
                var dragIndex = dragParent.indexOfChild(this.draggingItem);
                if (dragIndex < destIndex) destIndex = Math.max(0, destIndex - 1);
              }

              //if firstDepth equals secondDepth, then the firstParent is the secondParent in this case.
              secondParent.addChildAt(this.draggingItem, destIndex);
            } else {
              if (firstDepth < secondDepth) { //Here firstItem is parent of secondItem.
                firstItem.addChildAt(this.draggingItem, 0); //The only case if firstItem is neighbour of secondItem.
              } else if (!firstItem.isChildOf(this.draggingItem)) {
                par = destinationItem.getParent() || tree;
                destIndex = par.indexOfChild(destinationItem);
                par.addChildAt(this.draggingItem, destIndex);
                // var firstParent = firstItem.getParent() || firstItem.tree();
                // destIndex = firstParent.indexOfChild(firstItem) + 1;
                // firstParent.addChildAt(this.draggingItem, destIndex);
              }
            }
          } else if (secondItem) { //First item is undefined.
            //The only case - is when we drop between very first item and header of data grid.
            tree = secondItem.tree();
            tree.addChildAt(this.draggingItem, 0);
          } else if (firstItem) { //Second item is undefined.
            //The only case - is when we drop in the end of very last item of DG.
            tree = firstItem.getParent() || firstItem.tree();
            destIndex = tree.indexOfChild(firstItem) + 1;
            tree.addChildAt(this.draggingItem, destIndex);
          }
        } else if (!anychart.ganttModule.BaseGrid.isMilestone(destinationItem)) {
          //Dropping data item inside. Setting dragged data item as child of destinationItem.
          destinationItem.addChild(this.draggingItem);
        }
      }
    } else if (this.draggingItem) {
      //dropping outside the rows
      var min = this.pixelBoundsCache.top + this.container().getStage().getClientPosition().y + this.headerHeight_;
      if (e.clientY < min) {
        tree.addChildAt(this.draggingItem, 0);
      } else {
        tree.addChild(this.draggingItem);
      }
    }

    this.interactivityHandler.editStructureHighlight(void 0, void 0, 'auto');

    this.draggingItem = null;
  }

  this.denyDragScrolling = false;

  goog.Timer.callOnce(function() {
    /*
      This allows to restore preventClickAfterDrag value after all sync
      activities are finished.
      Restoration of value allows to keep selecting rows after drag.
     */
    this.preventClickAfterDrag = false;
  }, 10, this);

  this.scrollDragger.reset();
  this.dragging = false;
  this.interactive = true;
  clearInterval(this.scrollInterval);
  this.scrollInterval = null;
  this.enableDocMouseMove(false);
};


/**
 * Draws cells depending on data.
 * @return {anychart.math.Rect} - Clip bounds.
 */
anychart.ganttModule.BaseGrid.prototype.drawRowFills = function() {
  var header = this.pixelBoundsCache.top + this.headerHeight_ + 1; //1px line always separates header from content

  var verticalOffset = this.controller.verticalOffset();
  var startIndex = /** @type {number} */(this.controller.startIndex());
  var endIndex = /** @type {number} */(this.controller.endIndex());
  var visibleItems = this.controller.getVisibleItems();

  var totalTop = (header - verticalOffset);
  this.interactivityHandler.highlight();
  this.gridHeightCache_.length = 0;

  this.getEvenPath().clear();
  this.getOddPath().clear();
  this.getSelectedPath().clear();
  this.getRowStrokePath().clear();

  // COLORS CONFIG MAGIC PREPARATION!
  var colorsPrepared = false;
  var colors, checkers;
  if (this.interactivityHandler.rowsColoringInternal) {
    colors = this.interactivityHandler.rowsColoringInternal.colors;
    if (colors) {
      checkers = this.interactivityHandler.rowsColoringInternal.checkers;
      if (checkers) {
        this.rowsColoringPaths = this.rowsColoringPaths || {};
        colorsPrepared = true;
        for (var key in colors) {
          if (!(key in this.rowsColoringPaths)) {
            var p = /** @type {acgraph.vector.Path} */ (this.getCellsLayer().path());
            p.stroke(null).zIndex(5);
            this.rowsColoringPaths[key] = p;
          }
          this.rowsColoringPaths[key].clear();
        }
      }
    }
  }
  // END OF COLORS CONFIG MAGIC PREPARATION!

  var pixelShift = (this.rowStrokeThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  for (var i = startIndex; i <= endIndex; i++) {
    var item = visibleItems[i];
    if (!item) break;

    var firstCell = (i == startIndex);

    var top = firstCell ? header : totalTop;

    var height = this.controller.getItemHeight(item);
    height = firstCell ? height - verticalOffset + 1 : height;

    /*
      Note: Straight indexing starts with 0 (this.visibleItems_[0], this.visibleItems_[1], this.visibleItems_[2]...).
      But for user numeration starts with 1 and looks like
        1. Item0
        2. Item1
        3. Item2

      That's why evenPath highlights odd value of i, and oddPath highlights even value of i.
     */
    var path = i % 2 ? this.evenPath_ : this.oddPath_;

    var newTop = /** @type {number} */ (top + height);
    if (!anychart.utils.isNone(path.fill())) {
      path
          .moveTo(this.pixelBoundsCache.left, top)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, top)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, newTop)
          .lineTo(this.pixelBoundsCache.left, newTop)
          .close();
    }

    if (item.meta('selected')) {
      this.interactivityHandler.selection().selectRow(item); //In case of restoration from XML/JSON, this allows to save selected item state.
      this.selectedPath_
          .clear()
          .moveTo(this.pixelBoundsCache.left, top)
          .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, top)
          .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, newTop)
          .lineTo(this.pixelBoundsCache.left, newTop)
          .close();
    }

    // COLORS CONFIG MAGIC!
    if (colorsPrepared) {
      var state = this.interactivityHandler.rowsColoringInternal.state;
      for (var c = 0; c < checkers.length; c++) {
        var checker = checkers[c];
        var res = checker(item, state);
        if (res && res in colors) {
          var fillRef = colors[res];
          path = this.rowsColoringPaths[res];
          path
              .moveTo(this.pixelBoundsCache.left, top)
              .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, top)
              .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, newTop)
              .lineTo(this.pixelBoundsCache.left, newTop)
              .close()
              .fill(fillRef);
          break;
        }
      }
    }

    // END OF COLOR CONFIG MAGIC!

    totalTop = (newTop + this.rowStrokeThickness);

    var strokePathTop = Math.floor(totalTop - this.rowStrokeThickness / 2) + pixelShift;
    this.rowStrokePath_
        .moveTo(this.pixelBoundsCache.left, strokePathTop)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, strokePathTop);

    var h = totalTop - header;
    this.gridHeightCache_.push(h);
    this.totalGridsHeight = h;
  }

  var clipRect = new anychart.math.Rect(this.pixelBoundsCache.left, this.pixelBoundsCache.top - 1,
      this.pixelBoundsCache.width, totalTop - this.pixelBoundsCache.top + 1);
  this.applyClip(clipRect);

  return clipRect;
};


/**
 * Check if context menu is visible, if visible hide it.
 */
anychart.ganttModule.BaseGrid.prototype.hideContextMenu = function() {
  if (anychart.window['anychart']['ui']['ContextMenu'] && this.interactivityHandler.contextMenu) {
    var menu = this.interactivityHandler.contextMenu();
    if (menu.isVisible()) menu.hide();
  }
};


/**
 * Mouse wheel default handler.
 * TODO (A.Kudryavtsev): Test it carefully on Windows OS!
 * @param {goog.events.MouseWheelEvent} e - Mouse wheel event.
 * @protected
 */
anychart.ganttModule.BaseGrid.prototype.mouseWheelHandler = function(e) {
  this.hideContextMenu();
  var dx = e.deltaX;
  var dy = e.deltaY;

  var scrollsVertically = Math.abs(dy) > 0;
  var scrollsHorizontally = Math.abs(dx) > 0;

  if (goog.userAgent.WINDOWS || goog.userAgent.GECKO) {
    dx = dx * 18;
    dy = dy * 18;
  }

  var denyBodyScrollLeft = !anychart.document['body']['scrollLeft'];
  var horizontalScroll = this.horizontalScrollBar();
  var verticalScroll = this.controller.getScrollBar();

  var scrollsUp, scrollsLeft;
  var preventHorizontally = false;
  var preventVertically = false;

  if (scrollsVertically) {
    scrollsUp = dy < 0;
    var vStart = verticalScroll.startRatio();
    var vEnd = verticalScroll.endRatio();
    preventVertically = (!vStart && vEnd == 1) ? false :
        ((vStart > 0 && vEnd < 1) ||
        (!vStart && !scrollsUp && vEnd != 1) ||
        (vEnd == 1 && scrollsUp && vStart != 0));
  }

  if (scrollsHorizontally) {
    scrollsLeft = dx < 0;
    var hStart = horizontalScroll.startRatio();
    var hEnd = horizontalScroll.endRatio();
    if (scrollsLeft) {
      preventHorizontally = (!hStart && hEnd == 1) ? denyBodyScrollLeft :
          (hStart > 0 && hEnd < 1) ||
          (hEnd == 1 && hStart != 0) ||
          (!hStart && denyBodyScrollLeft);
    } else {
      preventHorizontally = (!hStart && hEnd == 1) ? false :
          (hStart > 0 && hEnd < 1) ||
          (!hStart && hEnd != 1);
    }
  }

  /*
    Literally means that default page scrolling must be prevented and we scroll BaseGrid instead.
   */
  if (preventVertically || preventHorizontally) {
    e.preventDefault();
    this.scroll(dx, dy);
  }
};


/**
 * 'Needs reapplication' handler.
 * @param {anychart.SignalEvent} event - Incoming event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.needsReapplicationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Public.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Additional actions on appearance invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.appearanceInvalidated = goog.nullFunction;


/**
 * Additional actions on bounds invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.boundsInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.defaultRowHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.defaultRowHeight(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.defaultRowHeight());
};


/**
 * Creates new controller.
 * @param {boolean=} opt_isResources - Whether controller must work in resources chart mode.
 * @protected
 */
anychart.ganttModule.BaseGrid.prototype.createController = function(opt_isResources) {
  this.controller = new anychart.ganttModule.Controller(opt_isResources);
  this.controller.listenSignals(this.needsReapplicationHandler_, this);
};


/**
 * This method actually draws a grid by this scheme:
 * grid.draw() --calls--> controller.run() --calls--> grid.drawInternal();
 *
 * NOTE: Inherited classes don't have drawInternal method, but the have an empty
 * methods to be overridden, included into base grid's drawInternal:
 * 1) initDom()
 * 2) boundsInvalidated()
 * 3) positionInvalidated()
 * 4) appearanceInvalidated()
 * 5) specialInvalidated()
 * 6) positionFinal()
 * 7) labelsInvalidated()
 *
 * @param {boolean} positionRecalculated - If the vertical position was really recalculated.
 * @return {anychart.ganttModule.BaseGrid} - Itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.drawInternal = function(positionRecalculated) {
  if (positionRecalculated)
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);

  if (!this.checkDrawingNeeded()) return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  if (stage)
    stage.suspend();
  // var manualSuspend = stage && !stage.isSuspended() && this.isStandalone; //Not standalone stage is suspended by chart.
  // if (manualSuspend) stage.suspend();
  // console.log(stage.isSuspended());

  var verticalScrollBar, horizontalScrollBar;

  //---------- Creating DOM structure ---------------
  if (!this.getBase().numChildren()) {
    this.bgRect_ = this.base_.rect();
    this.bgRect_
        .fill(/** @type {acgraph.vector.Fill} */(this.getOption('backgroundFill')))
        .stroke(null)
        .zIndex(anychart.ganttModule.BaseGrid.BG_RECT_Z_INDEX);

    this.eventsRect_ = this.base_.rect();
    this.eventsRect_
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .stroke(null)
        .zIndex(anychart.ganttModule.BaseGrid.EVENTS_RECT_Z_INDEX);

    this.initLayersStructure(this.base_);

    if (this.isStandalone) {
      /*
        NOTE: For standalone mode only!
              Not standalone scrolls are controlled by chart.
       */
      verticalScrollBar = this.controller.getScrollBar();
      verticalScrollBar
          .container(this.getScrollsLayer())
          .listenSignals(function(event) {
            // bar size for example
            if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
              this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
            else
              verticalScrollBar.draw();
          }, this);
    }

    horizontalScrollBar = this.horizontalScrollBar();
    horizontalScrollBar
        .container(this.getScrollsLayer())
        .listenSignals(function(event) {
          if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) horizontalScrollBar.draw();
        }, horizontalScrollBar);

    this.base_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.dragMouseDown_, false, this);
    this.base_.listenOnce(acgraph.events.EventType.TOUCHSTART, this.dragMouseDown_, false, this);
    if (anychart.isAsync()) {
      /*
        In current implementation chart must get mouse and
        keyboard features before all stage rendering actions are
        finished, on first mouse move, for example.
        Since the feature is experimental, we'll probably find another
        moment to initialize these features in future.
       */
      this.base_.listenOnce(acgraph.events.EventType.MOUSEMOVE, function() {
        this.initMouseFeatures();
        this.initKeysFeatures();
      }, false, this);
    }

    this.initDom();

    this.lockInteractivityRect_ = stage.rect();
    this.lockInteractivityRect_.stroke('none').fill('#000 0.1').zIndex(1e10);
  }


  //---------- Consistency ---------------
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.base_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var pb = /** @type {!anychart.math.Rect} */ (this.getPixelBounds());
    this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (anychart.utils.applyPixelShiftToRect(pb, 0));
    this.base_.clip(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.bgRect_.setBounds(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.eventsRect_.setBounds(/** @type {anychart.math.Rect} */ (this.pixelBoundsCache));
    this.totalGridsWidth = this.pixelBoundsCache.width;

    if (this.interactivityLocked_) {
      this.lockInteractivityRect_.setBounds(this.pixelBoundsCache);
    }

    var header = this.pixelBoundsCache.top + this.headerHeight_;
    var headSepTop = header + 0.5;

    this.getHeaderSeparationPath()
        .clear()
        .moveTo(this.pixelBoundsCache.left, headSepTop)
        .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, headSepTop);

    var barSize;
    if (this.isStandalone) {
      /*
        NOTE: For standalone mode only!
              Not standalone scrolls are controlled by chart.
       */
      verticalScrollBar = this.controller.getScrollBar();

      barSize = /** @type {number} */ (verticalScrollBar.barSize());
      verticalScrollBar.bounds(
          (this.pixelBoundsCache.left + this.pixelBoundsCache.width - barSize - 1),
          (this.pixelBoundsCache.top + this.headerHeight() + barSize + 1),
          barSize,
          (this.pixelBoundsCache.height - this.headerHeight() - 2 * barSize - 2)
      );
    }

    horizontalScrollBar = this.horizontalScrollBar();
    barSize = /** @type {number} */ (horizontalScrollBar.barSize());
    horizontalScrollBar.bounds(
        (this.pixelBoundsCache.left + barSize),
        (this.pixelBoundsCache.top + this.pixelBoundsCache.height - barSize - 1),
        (this.pixelBoundsCache.width - 2 * barSize),
        barSize
    );

    this.redrawPosition = true;

    this.boundsInvalidated();

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION)) {
    this.tooltip().hide();
    this.redrawPosition = true;
    this.positionInvalidated();
    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.bgRect_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('backgroundFill')));
    var rowFill = this.getOption('rowFill');
    var rowOddFill = this.getOption('rowOddFill');
    rowOddFill = anychart.utils.isNone(rowOddFill) ? rowFill : rowOddFill;
    var rowEvenFill = this.getOption('rowEvenFill');
    rowEvenFill = anychart.utils.isNone(rowEvenFill) ? rowFill : rowEvenFill;
    this.getOddPath().fill(/** @type {acgraph.vector.Fill} */(rowOddFill));
    this.getEvenPath().fill(/** @type {acgraph.vector.Fill} */(rowEvenFill));

    var selectedItem = this.interactivityHandler.selection().getSelectedItem();
    var rowSelectedFill = anychart.ganttModule.BaseGrid.getColorResolver('rowSelectedFill', anychart.enums.ColorType.FILL, false)(this, 0, selectedItem);
    this.getSelectedPath().fill(/** @type {acgraph.vector.Fill} */(rowSelectedFill));

    var rowStrokeColor;
    var rowStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('rowStroke'));
    if (goog.isString(rowStroke)) {
      rowStrokeColor = rowStroke;
    } else if (goog.isObject(rowStroke) && rowStroke['color']) {
      rowStrokeColor = rowStroke['color'];
    }

    if (rowStrokeColor) this.getHeaderSeparationPath().stroke(rowStrokeColor);

    this.getRowStrokePath().stroke(rowStroke);

    this.appearanceInvalidated();
    this.reapplyStructureEditAppearance();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.getBase().zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BASE_GRID_REDRAW)) {
    this.redrawPosition = true;
    this.markConsistent(anychart.ConsistencyState.BASE_GRID_REDRAW);
  }

  this.specialInvalidated();

  if (this.redrawPosition) {
    this.drawRowFills();
    this.positionFinal();
    this.redrawPosition = false;
  }

  this.labelsInvalidated();
  this.markersInvalidated();

  // if (manualSuspend) stage.resume();
  if (stage)
    stage.resume();
  if (this.isStandalone) {
    if (stage && !this.mwh_) {
      stage.listenOnce(acgraph.vector.Stage.EventType.STAGE_RENDERED, function() {
        this.initMouseFeatures();
        this.initKeysFeatures();
      }, void 0, this);
    }
  }

  return this;
};


/**
 * Additional actions while DOM initialization.
 */
anychart.ganttModule.BaseGrid.prototype.initDom = goog.nullFunction;


/**
 * Initializes instance-specific layers structure.
 * @param {acgraph.vector.Layer} base - Base layer to add children.
 */
anychart.ganttModule.BaseGrid.prototype.initLayersStructure = goog.nullFunction;


/**
 * Prepares labels to be measured.
 */
anychart.ganttModule.BaseGrid.prototype.prepareLabels = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.lockInteractivity = function(lock) {
  this.interactivityLocked_ = lock;
  if (lock) {
    this.lockInteractivityRect_.setBounds(this.pixelBoundsCache);
  } else {
    this.lockInteractivityRect_.setBounds(new anychart.math.Rect(0, 0, 0, 0));
  }
};


/**
 * Generates horizontal scroll bar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.ganttModule.ScrollBar|anychart.ganttModule.BaseGrid} - Scroll bar.
 */
anychart.ganttModule.BaseGrid.prototype.horizontalScrollBar = goog.abstractMethod;


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {
  var definedValues = goog.isDef(opt_index) && goog.isDef(opt_startY) && goog.isDef(opt_endY);
  var draw = false;
  var clear = false;
  if (definedValues) {
    if (this.hoverStartY_ != opt_startY || this.hoverEndY_ != opt_endY) {
      this.hoveredIndex = opt_index;
      this.hoverStartY_ = opt_startY;
      this.hoverEndY_ = opt_endY;
      draw = this.hoveredIndex >= 0;
    }
  } else {
    if (this.hoveredIndex >= 0) {
      this.hoveredIndex = -1;
      this.hoverStartY_ = NaN;
      this.hoverEndY_ = NaN;
    }
    clear = true;
  }

  if (draw) {
    var dataItem = this.getVisibleItems()[/** @type {number} */ (opt_index)];
    var fill = anychart.ganttModule.BaseGrid.getColorResolver('rowHoverFill', anychart.enums.ColorType.FILL, false)(this, 0, dataItem);
    this.getHoverPath()
        .clear()
        .fill(/** @type {acgraph.vector.Fill} */(fill))
        .moveTo(this.pixelBoundsCache.left, this.hoverStartY_)
        .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.hoverStartY_)
        .lineTo(this.pixelBoundsCache.left + this.pixelBoundsCache.width, this.hoverEndY_)
        .lineTo(this.pixelBoundsCache.left, this.hoverEndY_)
        .close();
  } else if (clear) {
    this.getHoverPath().clear();
  }
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.editStructureHighlight = function(opt_startY, opt_endY, opt_cursor) {
  var previewPath = this.getEditStructurePreviewPath_();
  if (goog.isDef(opt_startY)) {
    if (goog.isDef(opt_endY)) {
      previewPath
          .clear()
          .moveTo(this.pixelBoundsCache.left, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_endY)
          .lineTo(this.pixelBoundsCache.left, opt_endY)
          .close()
          .stroke(/** @type {acgraph.vector.Stroke} */ (this.edit().getOption('stroke')));
    } else {
      previewPath
          .clear()
          .moveTo(this.pixelBoundsCache.left, opt_startY)
          .lineTo(this.pixelBoundsCache.left + this.totalGridsWidth, opt_startY)
          .stroke(/** @type {acgraph.vector.Stroke} */ (this.edit().getOption('placementStroke')));
    }
  } else {
    previewPath.clear();
  }
  if (goog.isDef(opt_cursor))
    goog.style.setStyle(anychart.document['body'], 'cursor', opt_cursor);

};


/**
 * Initializes mouse wheel scrolling and mouse drag scrolling.
 * TODO (A.Kudryavtsev): In current implementation (04 Dec 2014) mouse drag scrolling is not available.
 */
anychart.ganttModule.BaseGrid.prototype.initMouseFeatures = function() {
  if (!this.mwh_) {
    var element = this.getBase().domElement();
    var ths = this;

    if (element) {
      this.mwh_ = new goog.events.MouseWheelHandler(element);
      var mouseWheelEvent = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;
      goog.events.listen(this.mwh_, mouseWheelEvent, this.mouseWheelHandler, false, this);

      goog.events.listen(anychart.window, 'unload', function(e) {
        goog.events.unlisten(ths.mwh_, mouseWheelEvent, ths.mouseWheelHandler, false, this);
      });
    }

    this.horizontalScrollBar().listen(anychart.enums.EventType.SCROLLING, goog.bind(this.denyDragging, this, true));
    // this.horizontalScrollBar().listen(anychart.enums.EventType.SCROLL_END, goog.bind(this.denyDragging, this, true));
  }
};


/**
 * Document mouse move listener.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.BaseGrid.prototype.docMouseMoveListener_ = function(e) {
  var l = anychart.ganttModule.BaseGrid.SCROLL_MOUSE_OUT_INSIDE_LENGTH;
  var container = this.container();
  if (container) {
    var containerPosition = container.getStage().getClientPosition();
    var top = this.pixelBoundsCache.top + containerPosition.y + this.headerHeight_ + l;
    var bottom = containerPosition.y + this.pixelBoundsCache.height - l - l;
    var left = containerPosition.x + this.pixelBoundsCache.left + l;
    var right = left + this.pixelBoundsCache.width - l - l;

    var mouseX = e.clientX;
    var mouseY = e.clientY;

    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
    if (mouseX < left || mouseX > right) this.scrollOffsetX = mouseX - left;
    if (mouseY < top || mouseY > bottom) this.scrollOffsetY = mouseY - top;

    var ths = this;
    if (this.dragging && !this.scrollInterval && !this.denyDragScrolling) {
      this.scrollInterval = setInterval(function() {
        ths.mouseOutMove(e);
      }, anychart.ganttModule.BaseGrid.TIMER_STEP);
    }
  }

};


/**
 * Initializes keys listening.
 */
anychart.ganttModule.BaseGrid.prototype.initKeysFeatures = function() {
  if (!this.interactivityHandler.altKeyHandler) {
    this.interactivityHandler.altKeyHandler = new anychart.ganttModule.BaseGrid.KeyHandler(this.interactivityHandler, anychart.document);

    acgraph.events.listen(this.interactivityHandler.altKeyHandler, 'key', function(e) {
      if (e.keyCode == 18) { //alt
        this.altKey = true;
      }

      if (e.keyCode == 46 || (e.metaKey && e.keyCode == 8)) { //delete
        this.deleteKeyHandler(e);
      }
    }, false, this.interactivityHandler);
  }
};


/**
 * @param {boolean} value
 */
anychart.ganttModule.BaseGrid.prototype.denyDragging = function(value) {
  this.denyDragScrolling = value;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.deleteKeyHandler = function(e) {
};


/**
 * Additional actions on position invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.positionInvalidated = goog.nullFunction;


/**
 * Additional actions on position. Differs from positionInvalidated:
 * this method is called at the very last when this.redrawPosition is set to true.
 */
anychart.ganttModule.BaseGrid.prototype.positionFinal = goog.nullFunction;


/**
 * Reapplies structure edit control appearance.
 */
anychart.ganttModule.BaseGrid.prototype.reapplyStructureEditAppearance = function() {
  var path = this.getEditStructurePreviewPath_();
  path.fill(/** @type {acgraph.vector.Fill} */ (this.edit().getOption('fill')));
  path.stroke(/** @type {acgraph.vector.Stroke} */ (this.edit().getOption('stroke')));
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.remove = function() {
  if (this.base_) this.base_.parent(null);
};


/**
 * Performs scrolling.
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 * @return {boolean} - Whether scroll has been performed.
 */
anychart.ganttModule.BaseGrid.prototype.scroll = goog.abstractMethod;


/**
 * Method to select row from outside.
 * @param {anychart.treeDataModule.Tree.DataItem} item - New selected data item.
 * @return {boolean} - Whether has been selected.
 */
anychart.ganttModule.BaseGrid.prototype.selectRow = function(item) {
  if (item) {
    this.interactivityHandler.selection().selectRow(item);
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


/**
 * Special invalidation. Used by child classes to preform own invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.specialInvalidated = function() {};


/**
 * Labels invalidation. Used by child classes to preform own invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.labelsInvalidated = goog.nullFunction;


/**
 * Markers invalidation. Used by child classes to preform own invalidation.
 */
anychart.ganttModule.BaseGrid.prototype.markersInvalidated = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.rowUnselect = function(event) {
  if (this.controller.data()) {
    if (this.interactivityHandler == this) { //Should dispatch 'unselect-event' by itself.
      var newEvent = {
        'type': anychart.enums.EventType.ROW_SELECT,
        'actualTarget': event ? event.target : this,
        'target': this,
        'originalEvent': event,
        'item': null, //This is a real difference between 'select' and 'unselect' events.
        'prevItem': this.interactivityHandler.selection().getSelectedItem()
      };
      this.dispatchEvent(newEvent);
    }
    this.interactivityHandler.selection().reset();

    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Exported (without Decoration).
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets new data.
 * @param {anychart.treeDataModule.Tree=} opt_value - New data tree.
 * @return {?(anychart.ganttModule.BaseGrid|anychart.treeDataModule.Tree)} - Current data tree or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.data = function(opt_value) {
  var data = /** @type {?anychart.treeDataModule.Tree} */ (this.controller.data());
  if (goog.isDef(opt_value)) {
    if ((opt_value != data) && (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree))) {
      this.controller.data(opt_value); //This will invalidate position.
    }
    return this;
  }
  return data;
};


/**
 * Draws grid.
 * @return {anychart.ganttModule.BaseGrid}
 */
anychart.ganttModule.BaseGrid.prototype.draw = function() {
  if (!this.isDisposed()) {
    if (!this.pixelBoundsCache || this.pixelBoundsCache.height || !this.pixelBoundsCache.height)
      this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (this.getPixelBounds());
    this.controller
        .availableHeight(this.pixelBoundsCache.height - this.headerHeight_ - 1)
        .rowStrokeThickness(this.rowStrokeThickness)
        .run();
  }
  return this;
};


/**
 * Gets/sets end index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.endIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.endIndex());
};


/**
 * Getter for the set of visible (not collapsed) data items.
 * @return {Array.<anychart.treeDataModule.Tree.DataItem>}
 */
anychart.ganttModule.BaseGrid.prototype.getVisibleItems = function() {
  return this.controller.getVisibleItems();
};


/**
 * Gets/sets start index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.startIndex(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.startIndex());
};


/**
 * Gets/sets header height.
 * @param {number=} opt_value - Value to be set.
 * @return {(number|anychart.ganttModule.BaseGrid)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.headerHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.headerHeight_ != opt_value) {
      this.headerHeight_ = opt_value;
      if (!this.pixelBoundsCache)
        this.pixelBoundsCache = /** @type {anychart.math.Rect} */ (this.getPixelBounds());

      if (this.isStandalone) {
        this.controller
            .suspendSignalsDispatching()
            .availableHeight(this.pixelBoundsCache.height - opt_value - 1)
            .resumeSignalsDispatching(false);
      }

      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.headerHeight_;
};


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.ganttModule.BaseGrid|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
    this.tooltip_.containerProvider(this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Internal getter for tooltip settings.
 * DEV NOTE: Internal tooltip getter, DO NOT EXPORT!
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_item - Item. Parameter is required for timeline
 *  to define, which tooltip will be used.
 * @return {!(anychart.ganttModule.BaseGrid|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.getTooltipInternal = function(opt_value, opt_item) {
  return this.tooltip(opt_value);
};


/**
 * Gets/sets vertical offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.BaseGrid|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.BaseGrid.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.verticalOffset(opt_value);
    return this;
  }
  return /** @type {number} */ (this.controller.verticalOffset());
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.disposeInternal = function() {
  goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.docMouseMoveListener_, false, this);
  if (this.edit_)
    this.edit_.unlistenSignals(this.onEditSignal_, this);

  if (this.tooltip_)
    this.tooltip_.unlistenSignals(this.onTooltipSignal_, this);

  if (this.interactivityHandler.altKeyHandler) {
    this.interactivityHandler.altKeyHandler.removeAllListeners();
    goog.dispose(this.interactivityHandler.altKeyHandler);
  }

  this.controller.unlistenSignals(this.needsReapplicationHandler_, this);
  if (this.scrollDragger) {
    this.scrollDragger.unlisten(goog.fx.Dragger.EventType.DRAG, this.dragHandler_, false, this);
    this.scrollDragger.unlisten(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
  }

  goog.disposeAll(this.palette_, this.edit_, this.tooltip_,
      this.eventsRect_, this.bgRect_, this.scrollDragger,
      this.headerSeparationPath_, this.editStructurePreviewPath_,
      this.rowStrokePath_, this.selectedPath_, this.hoverPath_,
      this.evenPath_, this.oddPath_, this.scrollsLayer_, this.clipLayer_,
      this.editLayer_, this.contentLayer_, this.drawLayer_, this.rangeLineMarkersLayer_,
      this.textMarkersLayer_, this.cellsLayer_, this.base_, this.selection_);
  this.tooltip_ = null;
  this.eventsRect_ = null;
  this.bgRect_ = null;
  this.controller = null;
  this.scrollDragger = null;
  this.headerSeparationPath_ = null;
  this.editStructurePreviewPath_ = null;
  this.rowStrokePath_ = null;
  this.selectedPath_ = null;
  this.hoverPath_ = null;
  this.evenPath_ = null;
  this.oddPath_ = null;
  this.scrollsLayer_ = null;
  this.clipLayer_ = null;
  this.editLayer_ = null;
  this.contentLayer_ = null;
  this.drawLayer_ = null;
  this.rangeLineMarkersLayer_ = null;
  this.textMarkersLayer_ = null;
  this.cellsLayer_ = null;
  this.base_ = null;
  this.edit_ = null;
  this.selection_ = null;
  anychart.ganttModule.BaseGrid.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.prototype.serialize = function() {
  var json = anychart.ganttModule.BaseGrid.base(this, 'serialize');

  json['isStandalone'] = this.isStandalone;

  /*
    Note: not standalone grid is controlled by some higher entity (e.g. gantt chart).
    It means that controller must be serialized and restored by this entity, but not by base grid.
   */
  if (this.isStandalone) {
    json['controller'] = this.controller.serialize();
    json['defaultRowHeight'] = this.defaultRowHeight();
    json['palette'] = this.palette().serialize();
  }

  anychart.core.settings.serialize(this, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS, json, void 0, void 0, true);

  json['headerHeight'] = this.headerHeight_;
  json['edit'] = /** @type {anychart.ganttModule.edit.StructureEdit} */ (this.edit()).serialize();
  // json['editStructurePreviewFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */ (this.editStructurePreviewFill_));
  // json['editStructurePreviewStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewStroke_));
  // json['editStructurePreviewDashStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */ (this.editStructurePreviewDashStroke_));

  // json['editing'] = this.editable;

  return json;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.BaseGrid.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.BaseGrid.base(this, 'setupByJSON', config, opt_default);

  this.isStandalone = ('isStandalone' in config) ? config['isStandalone'] : ('controller' in config);

  if (this.isStandalone && 'controller' in config) {
    this.createController();
    this.controller.setup(config['controller']);
    this.defaultRowHeight(config['defaultRowHeight']);
    this.palette(config['palette']);
  }

  anychart.core.settings.deserialize(this, anychart.ganttModule.BaseGrid.COLOR_DESCRIPTORS, config, opt_default);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  this.headerHeight(config['headerHeight']);

  if ('edit' in config)
    /** @type {anychart.ganttModule.edit.StructureEdit} */ (this.edit()).setupInternal(!!opt_default, config['edit']);
  // this.editStructurePreviewFill(config['editStructurePreviewFill']);
  // this.editStructurePreviewStroke(config['editStructurePreviewStroke']);
  // this.editStructurePreviewDashStroke(config['editStructurePreviewDashStroke']);
  // this.editing(config['editing']);
};



//region --- Base Grid Dragger
/**
 * Dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {anychart.ganttModule.BaseGrid} grid - Current grid to be scrolled.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.BaseGrid.Dragger = function(target, grid) {
  anychart.ganttModule.BaseGrid.Dragger.base(this, 'constructor', target.domElement());

  /**
   * @type {anychart.ganttModule.BaseGrid}
   */
  this.grid = grid;

  /**
   * X.
   * @type {number}
   */
  this.x = 0;

  /**
   * Y.
   * @type {number}
   */
  this.y = 0;

  this.setHysteresis(3);
};
goog.inherits(anychart.ganttModule.BaseGrid.Dragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.computeInitialPosition = function() {
  //TODO (A.Kudryavtsev): We don't actually need to override it right here, but
  //TODO (A.Kudryavtsev): default method dies in IE.
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.defaultAction = function(x, y) {
  if (this.grid.interactivityHandler.altKey || (!this.grid.edit()['enabled']() && !this.grid.denyDragScrolling)) {
    var dX = this.x - x;
    var dY = this.y - y;

    this.x = x;
    this.y = y;

    this.grid.scroll(dX, dY);
  }
};


/**
 * Resets dragger.
 */
anychart.ganttModule.BaseGrid.Dragger.prototype.reset = function() {
  this.x = 0;
  this.y = 0;
};



//endregion
//region --- Base Grid KeyHandler
/**
 * Key handler.
 * @param {anychart.ganttModule.IInteractiveGrid} grid - Base grid itself.
 * @param {Element|Document=} opt_element - The element or document to listen on.
 * @param {boolean=} opt_capture - Whether to listen for browser events in
 *     capture phase (defaults to false).
 * @constructor
 * @extends {goog.events.KeyHandler}
 * @suppress {accessControls} - TODO Add another mechanism (fix this inheritance).
 */
anychart.ganttModule.BaseGrid.KeyHandler = function(grid, opt_element, opt_capture) {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'constructor', opt_element, opt_capture);

  /**
   * @type {anychart.ganttModule.IInteractiveGrid}
   */
  this.grid = grid;
};
goog.inherits(anychart.ganttModule.BaseGrid.KeyHandler, goog.events.KeyHandler);


/** @inheritDoc */
anychart.ganttModule.BaseGrid.KeyHandler.prototype.resetState = function() {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'resetState');
  this.grid.altKey = false;
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.KeyHandler.prototype.attach = function(element, opt_capture) {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'attach', element, opt_capture);

  goog.events.listen(anychart.window, [goog.events.EventType.VISIBILITYCHANGE, goog.events.EventType.BLUR], this.resetState, false, this);
};


/** @inheritDoc */
anychart.ganttModule.BaseGrid.KeyHandler.prototype.detach = function() {
  anychart.ganttModule.BaseGrid.KeyHandler.base(this, 'detach');

  goog.events.unlisten(anychart.window, [goog.events.EventType.VISIBILITYCHANGE, goog.events.EventType.BLUR], this.resetState, false, this);
};


//endregion
//region --- Base Grid Element
/**
 * Actually is a path to be drawn on drawLayer.
 * Used to draw some elements as Timeline's bars with additional data.
 * @constructor
 * @extends {acgraph.vector.Path}
 */
anychart.ganttModule.BaseGrid.Element = function() {
  anychart.ganttModule.BaseGrid.Element.base(this, 'constructor');

  /**
   * Meta information. Used for inner purposes only.
   * @type {Object}
   */
  this.meta = {};
};
goog.inherits(anychart.ganttModule.BaseGrid.Element, acgraph.vector.Path);


/**
 * Resets fields.
 */
anychart.ganttModule.BaseGrid.Element.prototype.reset = function() {
  this.fill(null).stroke(null).clear();
  this.currBounds = null;
  this.type = void 0;
  if (this.label) {
    this.label.resetSettings();
    this.label.enabled(false);
    this.label.draw();
  }
  this.label = null;
  this.labelPointSettings = null;
  this.typeLabels = null;
  this.item = null;
  this.period = null;
  this.periodIndex = void 0;
};


/**
 * Type of element. In current implementation (21 Jul 2015) can be one of timeline's bars type.
 * @type {anychart.enums.TLElementTypes|undefined}
 */
anychart.ganttModule.BaseGrid.Element.prototype.type;


/**
 * Current bounds cache. Used to avoid unnecessary bounds calculation.
 * @type {?anychart.math.Rect}
 */
anychart.ganttModule.BaseGrid.Element.prototype.currBounds = null;


/**
 * Related element label.
 * @type {?anychart.core.ui.LabelsFactory.Label}
 */
anychart.ganttModule.BaseGrid.Element.prototype.label = null;


/**
 * Related element label point settings.
 * @type {?Object}
 */
anychart.ganttModule.BaseGrid.Element.prototype.labelPointSettings = null;


/**
 * Related element labels factory that contains settings by element type.
 * Storing this field allows to avoid detecting related labels factory by type.
 * @type {?anychart.core.ui.LabelsFactory}
 */
anychart.ganttModule.BaseGrid.Element.prototype.typeLabels = null;


/**
 * Related tree data item.
 * @type {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)}
 */
anychart.ganttModule.BaseGrid.Element.prototype.item = null;


/**
 * Related period object.
 * @type {?Object}
 */
anychart.ganttModule.BaseGrid.Element.prototype.period = null;


/**
 * Related period object.
 * @type {number|undefined}
 */
anychart.ganttModule.BaseGrid.Element.prototype.periodIndex = void 0;
//endregion
