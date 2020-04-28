goog.provide('anychart.ganttModule.TimeLine');
goog.provide('anychart.standalones.ProjectTimeline');
goog.provide('anychart.standalones.ResourceTimeline');


//region -- Requirements.
goog.require('acgraph.vector.Path');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.ganttModule.BaseGrid');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.ganttModule.axisMarkers.Line');
goog.require('anychart.ganttModule.axisMarkers.Range');
goog.require('anychart.ganttModule.axisMarkers.Text');
goog.require('anychart.ganttModule.draggers.BarDragger');
goog.require('anychart.ganttModule.draggers.BaselineProgressDragger');
goog.require('anychart.ganttModule.draggers.ConnectorDragger');
goog.require('anychart.ganttModule.draggers.ProgressDragger');
goog.require('anychart.ganttModule.draggers.ThumbDragger');
goog.require('anychart.ganttModule.elements.BaselinesElement');
goog.require('anychart.ganttModule.elements.ConnectorElement');
goog.require('anychart.ganttModule.elements.GroupingTasksElement');
goog.require('anychart.ganttModule.elements.MilestonesElement');
goog.require('anychart.ganttModule.elements.PeriodsElement');
goog.require('anychart.ganttModule.elements.TasksElement');
goog.require('anychart.ganttModule.elements.TimelineElement');
goog.require('anychart.ganttModule.header.Header');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.GanttDateTime');
goog.require('goog.array');
goog.require('goog.fx.Dragger');



//endregion
//region -- Constructor.
/**
 * Gantt timeline implementation.
 * @param {anychart.ganttModule.Controller=} opt_controller - Controller to be set. See full description in parent class.
 * @param {boolean=} opt_isResources - Flag if TL must have a controller that works in 'Resources' mode.
 * @constructor
 * @extends {anychart.ganttModule.BaseGrid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.ganttModule.TimeLine = function(opt_controller, opt_isResources) {
  anychart.ganttModule.TimeLine.base(this, 'constructor', opt_controller, opt_isResources);

  this.addThemes('defaultTimeline');

  /**
   * Labels factory.
   *
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Labels factory.
   *
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markersFactory_ = null;

  /**
   * Separation path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.separationPath_ = null;

  /**
   * Edit preview path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editPreviewPath_ = null;

  /**
   * Edit progress path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editProgressPath_ = null;

  /**
   * Edit left thumb path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editLeftThumbPath_ = null;

  /**
   * Edit right thumb path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editRightThumbPath_ = null;

  /**
   * Edit start connector path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editStartConnectorPath_ = null;

  /**
   * Edit finish connector path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editFinishConnectorPath_ = null;


  /**
   * Edit connector preview path.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editConnectorPreviewPath_ = null;

  /**
   * Tooltip enabled state storage.
   *
   * @type {boolean|undefined}
   * @private
   */
  this.tooltipEnabledBackup_;


  /**
   * This value sets to ID of hovered item when mouse moves over the bar of item on timeline
   * in live edit mode.
   * It is used to correctly remove live edit controls on hovered row change.
   *
   * @type {number|string|undefined}
   * @private
   */
  this.lastHoveredBarItemId_ = void 0;

  /**
   * This value sets to index of hovered period when mouse moves over the bar of item on timeline
   * in live edit mode.
   * It is used to correctly remove live edit controls on hovered row change.
   *
   * @type {number}
   * @private
   */
  this.lastHoveredPeriodIndex_ = NaN;

  /**
   *
   * @type {boolean}
   */
  this.redrawHeader = false;

  /**
   * Edit preview dragger.
   *
   * @type {anychart.ganttModule.draggers.BarDragger}
   * @private
   */
  this.editPreviewDragger_ = null;

  /**
   * Edit progress dragger.
   *
   * @type {anychart.ganttModule.draggers.ProgressDragger}
   * @private
   */
  this.editProgressDragger_ = null;

  /**
   *
   * @type {anychart.ganttModule.draggers.BaselineProgressDragger}
   * @private
   */
  this.editBaselineProgressDragger_ = null;

  /**
   * Edit left thumb dragger.
   *
   * @type {anychart.ganttModule.draggers.ThumbDragger}
   * @private
   */
  this.editLeftThumbDragger_ = null;

  /**
   * Edit right thumb dragger.
   *
   * @type {anychart.ganttModule.draggers.ThumbDragger}
   * @private
   */
  this.editRightThumbDragger_ = null;

  /**
   * Edit start connector dragger.
   *
   * @type {anychart.ganttModule.draggers.ConnectorDragger}
   * @private
   */
  this.editStartConnectorDragger_ = null;

  /**
   * Edit finish connector dragger.
   *
   * @type {anychart.ganttModule.draggers.ConnectorDragger}
   * @private
   */
  this.editFinishConnectorDragger_ = null;

  /**
   * Whether we are dragging the connector.
   *
   * @type {boolean}
   */
  this.draggingConnector = false;

  /**
   * Whether we are dragging the progress.
   *
   * @type {boolean}
   */
  this.draggingProgress = false;

  /**
   * Whether we are dragging the preview.
   * @type {boolean}
   */
  this.draggingPreview = false;

  /**
   * Whether we are dragging the thumb.
   *
   * @type {anychart.ganttModule.draggers.ThumbDragger}
   * @private
   */
  this.currentThumbDragger_ = null;

  /**
   * Whether we are dragging the connector circle.
   *
   * @type {anychart.ganttModule.draggers.ConnectorDragger}
   * @private
   */
  this.currentConnectorDragger_ = null;

  /**
   * Timeline visual elements.
   *
   * @type {Array.<anychart.ganttModule.BaseGrid.Element>}
   * @private
   */
  this.visElements_ = [];

  /**
   * Number of used visual elements.
   * @type {number}
   * @private
   */
  this.visElementsInUse_ = 0;

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Line>}
   * @private
   */
  this.lineMarkers_ = [];

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Range>}
   * @private
   */
  this.rangeMarkers_ = [];

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Text>}
   * @private
   */
  this.textMarkers_ = [];

  /**
   * List of edit controls.
   *
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.editControls_ = [];

  /**
   * Hovered connector data.
   * We use it to correctly dispatch connector mouse out event.
   *
   * @type {?Object}
   * @private
   */
  this.hoveredConnector_ = null;

  /**
   * Timeline specific elements.
   *
   * @type {Array.<anychart.ganttModule.elements.TimelineElement>}
   * @private
   */
  this.specificElements_ = null;

  /**
   * Date time scale.
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_ = new anychart.scales.GanttDateTime();
  this.scale_.listenSignals(this.scaleInvalidated_, this);

  /**
   *
   * @type {anychart.ganttModule.elements.TimelineElement}
   * @private
   */
  this.elements_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.TasksElement}
   * @private
   */
  this.tasks_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.PeriodsElement}
   * @private
   */
  this.periods_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.MilestonesElement}
   * @private
   */
  this.milestones_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.GroupingTasksElement}
   * @private
   */
  this.groupingTasks_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.BaselinesElement}
   * @private
   */
  this.baselines_ = null;

  /**
   *
   * @type {anychart.ganttModule.elements.ConnectorElement}
   * @private
   */
  this.connectors_ = null;

  /**
   * Currently used low ticks unit.
   * Used to correctly draw calendar intervals that
   * depend on current low ticks unit.
   *
   * @type {?anychart.enums.Interval}
   * @private
   */
  this.currentLowerTicksUnit_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['columnStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['zoomOnMouseWheel', 0, 0],
    ['workingFill', 0, 0, 0, function() {
      var fill = /** @type {acgraph.vector.Fill} */ (this.getOption('workingFill'));
      this.getWorkingPath_().fill(fill);
    }],
    ['notWorkingFill', 0, 0, 0, function() {
      var fill = /** @type {acgraph.vector.Fill} */ (this.getOption('notWorkingFill'));
      this.getNotWorkingPath_().fill(fill);
    }],
    ['holidaysFill', 0, 0, 0, function() {
      var fill = /** @type {acgraph.vector.Fill} */ (this.getOption('holidaysFill'));
      this.getHolidaysPath_().fill(fill);
    }],
    ['weekendsFill', 0, 0, 0, function() {
      var fill = /** @type {acgraph.vector.Fill} */ (this.getOption('weekendsFill'));
      this.getWeekendsPath_().fill(fill);
    }]
  ]);

  this.controller.timeline(this);

  // TODO (A.Kudryavtsev): For a while. Creates all and registers default format selector in measuriator.
  this.header();
};
goog.inherits(anychart.ganttModule.TimeLine, anychart.ganttModule.BaseGrid);


//endregion
//region -- Signals and consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.TimeLine.prototype.SUPPORTED_SIGNALS = anychart.ganttModule.BaseGrid.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ganttModule.TimeLine.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ganttModule.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TIMELINE_SCALES |
    anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS |
    anychart.ConsistencyState.TIMELINE_MARKERS |
    anychart.ConsistencyState.TIMELINE_CALENDAR;


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *   isElement: boolean,
 *   id: (number|string),
 *   type: anychart.enums.TLElementTypes,
 *   item: (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem),
 *   labels: Array.<anychart.core.ui.LabelsFactory>,
 *   bounds: anychart.math.Rect,
 *   periodIndex: number,
 *   period: Object,
 *   label: anychart.core.ui.LabelsFactory.Label,
 *   labelPointSettings: Object
 * }}
 */
anychart.ganttModule.TimeLine.Tag;


/**
 * @typedef {{
 *   item: (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem),
 *   index: number,
 *   type: anychart.enums.TLElementTypes,
 *   period: Object,
 *   periodIndex: number,
 *   bounds: anychart.math.Rect
 * }}
 */
anychart.ganttModule.TimeLine.EditTag;


//endregion
//region -- Constants.
/**
 * Default timeline header height.
 * @type {number}
 */
anychart.ganttModule.TimeLine.DEFAULT_HEADER_HEIGHT = 70;


/**
 * Marker factory z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.MARKER_Z_INDEX = 50;


/**
 * Connector z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.CONNECTOR_Z_INDEX = 60;


/**
 * Connector arrow z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_Z_INDEX = 70;


/**
 * Timeline header z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.HEADER_Z_INDEX = 80;


/**
 * Arrow margin.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_MARGIN = 5;


/**
 * Arrow size.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_SIZE = 4;


/**
 * This constant means that bar will have height = DEFAULT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.ganttModule.TimeLine.DEFAULT_HEIGHT_REDUCTION = 0.7;


/**
 * Edit preview path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_PREVIEW_Z_INDEX = 0;


/**
 * Edit progress path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_PROGRESS_Z_INDEX = 10;


/**
 * Edit left thumb path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_LEFT_THUMB_Z_INDEX = 20;


/**
 * Edit right thumb path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_RIGHT_THUMB_Z_INDEX = 30;


/**
 * Edit start connector path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_START_CONNECTOR_Z_INDEX = 40;


/**
 * Edit finish connector path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_FINISH_CONNECTOR_Z_INDEX = 50;


/**
 * Edit connector preview path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CONNECTOR_PREVIEW_Z_INDEX = 60;


/**
 * Pixel height of edit corner.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT = 5;


/**
 * Pixel width of edit-interval-thumb.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CONNECTOR_RADIUS = 5;


/**
 * Intervals weight growth map.
 *
 * @type {Object.<anychart.enums.Interval, number>}
 * @const
 */
anychart.ganttModule.TimeLine.TICK_INTERVAL_GROWTH_MAP = (function() {
  var rv = {};
  rv[anychart.enums.Interval.MILLISECOND] = 0;
  rv[anychart.enums.Interval.SECOND] = 1;
  rv[anychart.enums.Interval.MINUTE] = 2;
  rv[anychart.enums.Interval.HOUR] = 3;
  rv[anychart.enums.Interval.DAY] = 4;
  rv[anychart.enums.Interval.WEEK] = 5;
  rv[anychart.enums.Interval.THIRD_OF_MONTH] = 6;
  rv[anychart.enums.Interval.MONTH] = 7;
  rv[anychart.enums.Interval.QUARTER] = 8;
  rv[anychart.enums.Interval.SEMESTER] = 9;
  rv[anychart.enums.Interval.YEAR] = 10;

  return rv;
})();


//endregion
//region -- Coloring.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.TimeLine.COLOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'columnStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'workingFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'notWorkingFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'holidaysFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'weekendsFill', anychart.core.settings.fillNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.TimeLine, anychart.ganttModule.TimeLine.COLOR_DESCRIPTORS);


//endregion
//region -- Elements.
/**
 * Initializes and stores all timeline specific elements.
 *
 * @return {Array.<anychart.ganttModule.elements.TimelineElement>} - Timeline specific elements.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.initializeElements_ = function() {
  if (!this.specificElements_) {
    this.specificElements_ = this.controller.isResources() ?
        [
          this.periods(),
          this.milestones()
        ] :
        [
          this.tasks(),
          this.groupingTasks(),
          this.milestones(),
          this.milestones().preview(),
          this.baselines(),
          this.tasks().progress(),
          this.groupingTasks().progress(),
          this.baselines().progress()
        ];
  }
  return this.specificElements_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.TimelineElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.elements = function(opt_value) {
  if (!this.elements_) {
    this.elements_ = new anychart.ganttModule.elements.TimelineElement(this);
    this.setupCreated('elements', this.elements_);
    this.elements_.setupStateSettings();
    this.elements_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.elements_.setup(opt_value);
    return this;
  }
  return this.elements_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.PeriodsElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.periods = function(opt_value) {
  if (!this.periods_) {
    this.periods_ = new anychart.ganttModule.elements.PeriodsElement(this);
    this.setupCreated('periods', this.periods_);
    this.periods_.setupStateSettings();
    this.periods_.parent(/** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements()));
    this.periods_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.periods_.setup(opt_value);
    return this;
  }
  return this.periods_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.TasksElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.tasks = function(opt_value) {
  if (!this.tasks_) {
    this.tasks_ = new anychart.ganttModule.elements.TasksElement(this);
    this.setupCreated('tasks', this.tasks_);
    this.tasks_.setupStateSettings();
    this.tasks_.parent(/** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements()));
    this.tasks_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.tasks_.setup(opt_value);
    return this;
  }
  return this.tasks_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.MilestonesElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.milestones = function(opt_value) {
  if (!this.milestones_) {
    this.milestones_ = new anychart.ganttModule.elements.MilestonesElement(this);
    this.setupCreated('milestones', this.milestones_);
    this.milestones_.setupStateSettings();
    this.milestones_.parent(/** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements()));
    this.milestones_.listenSignals(this.visualElementInvalidated_, this);
    this.milestones_.preview().listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.milestones_.setup(opt_value);
    return this;
  }
  return this.milestones_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.GroupingTasksElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.groupingTasks = function(opt_value) {
  if (!this.groupingTasks_) {
    this.groupingTasks_ = new anychart.ganttModule.elements.GroupingTasksElement(this);
    this.setupCreated('groupingTasks', this.groupingTasks_);
    this.groupingTasks_.setupStateSettings();
    this.groupingTasks_.parent(/** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements()));
    this.groupingTasks_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.groupingTasks_.setup(opt_value);
    return this;
  }
  return this.groupingTasks_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.BaselinesElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.baselines = function(opt_value) {
  if (!this.baselines_) {
    this.baselines_ = new anychart.ganttModule.elements.BaselinesElement(this);
    this.setupCreated('baselines', this.baselines_);
    this.baselines_.setupStateSettings();
    this.baselines_.parent(/** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements()));
    this.baselines_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.baselines_.setup(opt_value);
    return this;
  }
  return this.baselines_;
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.ConnectorElement|anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.TimeLine.prototype.connectors = function(opt_value) {
  if (!this.connectors_) {
    this.connectors_ = new anychart.ganttModule.elements.ConnectorElement(this);
    this.setupCreated('connectors', this.connectors_);
    this.connectors_.setupStateSettings();
    this.connectors_.listenSignals(this.visualElementInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.connectors_.setup(opt_value);
    return this;
  }
  return this.connectors_;
};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item.
 * @param {anychart.ganttModule.elements.TimelineElement} element - Element type.
 * @param {anychart.math.Rect} bounds - Bounds.
 * @param {number=} opt_periodIndex - Period index.
 *
 * @return {anychart.ganttModule.TimeLine.Tag}
 */
anychart.ganttModule.TimeLine.prototype.createTag = function(item, element, bounds, opt_periodIndex) {
  var tag = {
    isElement: true,
    id: item.get(anychart.enums.GanttDataFields.ID),
    type: element.getType(),
    item: item,
    labels: element.getLabelsResolutionOrder(),
    bounds: bounds,
    labelPointSettings: element.getLabelPointSettings(item, opt_periodIndex)
  };

  if (goog.isDef(opt_periodIndex)) {
    tag.periodIndex = opt_periodIndex;
    var periods = item.get(anychart.enums.GanttDataFields.PERIODS);
    tag.period = periods[opt_periodIndex];
  }

  return /** @type {anychart.ganttModule.TimeLine.Tag} */ (tag);
};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item.
 * @param {?number} index - Index.
 * @param {anychart.enums.TLElementTypes} type - Type.
 * @param {anychart.math.Rect} bounds - Bounds.
 * @param {number=} opt_periodIndex - Period index.
 *
 * @return {anychart.ganttModule.TimeLine.EditTag}
 */
anychart.ganttModule.TimeLine.prototype.createEditTag = function(item, index, type, bounds, opt_periodIndex) {
  var tag = {
    isEdit: true,
    item: item,
    index: index,
    type: type,
    bounds: bounds
  };

  if (goog.isDef(opt_periodIndex)) {
    tag.periodIndex = opt_periodIndex;
    var periods = item.get(anychart.enums.GanttDataFields.PERIODS);
    tag.period = periods[opt_periodIndex];
  }

  return /** @type {anychart.ganttModule.TimeLine.EditTag} */ (tag);
};


/**
 * Visual element invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.visualElementInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) { //edit visual settings only!
    //TODO (A.Kudryavtsev): Current implementation doesn't need to react on edit controls appearance signal for a while.
  } else {
    var state = 0;
    if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
      state |= anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS;
    }
    if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
      state |= anychart.ConsistencyState.GRIDS_POSITION;
    }
    if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
      state |= anychart.ConsistencyState.BASE_GRID_REDRAW;
    }
    this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- DEPRECATED API.
/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.elements().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baseFill = function(var_args) {
  var target = this.elements();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.baseFill()', 'timeline.elements().fill()'], true);
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.elements().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baseStroke = function(var_args) {
  var target = this.elements();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.baseStroke()', 'timeline.elements().stroke()'], true);
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.baselines().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baselineFill = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.baselineFill()', 'timeline.baselines().fill()'], true);
    target = this.baselines();
    return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.baselines().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baselineStroke = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.baselineStroke()', 'timeline.baselines().stroke()'], true);
    target = this.baselines();
    return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.milestones().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.milestoneFill = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.milestoneFill()', 'timeline.milestones().fill()'], true);
    target = this.milestones();
    return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.milestones().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.milestoneStroke = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.milestoneStroke()', 'timeline.milestones().stroke()'], true);
    target = this.milestones();
    return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.groupingTasks().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.parentFill = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.parentFill()', 'timeline.groupingTasks().fill()'], true);
    target = this.groupingTasks();
    return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.groupingTasks().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.parentStroke = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['timeline.parentStroke()', 'timeline.groupingTasks().stroke()'], true);
    target = this.groupingTasks();
    return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.tasks().progress().fill() or timeline.groupingTasks().progress().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.progressFill = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressFill()', 'timeline.tasks().progress().fill() or timeline.groupingTasks().progress().fill()'], true);
    target = this.tasks();
    return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.tasks().progress().stroke() or timeline.groupingTasks().progress().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.progressStroke = function(var_args) {
  var target;
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressStroke()', 'timeline.tasks().progress().stroke() or timeline.groupingTasks().progress().stroke()'], true);
    target = this.tasks();
    return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.elements().selected().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.selectedElementFill = function(var_args) {
  var target = this.elements().selected();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.selectedElementFill()', 'timeline.elements().selected().fill()'], true);
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.elements().selected().stroke(). DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.selectedElementStroke = function(var_args) {
  var target = this.elements().selected();
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.selectedElementStroke()', 'timeline.elements().selected().stroke()'], true);
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * Getter/setter for base labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @deprecated since 8.2.0 use timeline.elements().labels() instead. DVF-3625
 * @return {anychart.core.ui.LabelsFactory|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baseLabels = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.baseLabels()', 'timeline.elements().labels()'], true);
  return this.elements().labels(opt_value);
};


/**
 * Getter/setter for baseline labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @deprecated since 8.2.0 use timeline.baselines().labels() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.baselineLabels = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineLabels()', 'timeline.baselines().labels()'], true);
    return this.baselines().labels(opt_value);
  }
};


/**
 * Getter/setter for parent labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @deprecated since 8.2.0 use timeline.groupingTasks().labels() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.parentLabels = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.parentLabels()', 'timeline.groupingTasks().labels()'], true);
    return this.groupingTasks().labels(opt_value);
  }
};


/**
 * Getter/setter for milestones labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @deprecated since 8.2.0 use timeline.milestones().labels() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.milestoneLabels = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.milestoneLabels()', 'timeline.milestones().labels()'], true);
    return this.milestones().labels(opt_value);
  }
};


/**
 * Getter/setter for progress labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @deprecated since 8.2.0 use timeline.tasks().progress().labels() or timeline.groupingTasks().progress().labels() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.progressLabels = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressLabels()', 'timeline.tasks().progress().labels() or timeline.groupingTasks().progress().labels()'], true);
    return this.tasks().progress().labels(opt_value);
  }
};


/**
 * Gets/sets 'baseline above' flag.
 * If the flag is set to 'true', baseline bar will be displayed abode an actual time bar.
 * @param {boolean=} opt_value - Value to be set.
 * @deprecated since 8.2.0 use timeline.baselines().above() instead. DVF-3625
 * @return {boolean|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.BaselinesElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineAbove = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineAbove()', 'timeline.baselines().above()'], true);
    return this.baselines()['above'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.elements().height() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseBarHeight = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.baseBarHeight()', 'timeline.elements().height()'], true);
  return this.elements()['height'](opt_value);
};


/**
 * @param {anychart.enums.Anchor=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.elements().anchor() instead. DVF-3625
 * @return {anychart.enums.Anchor|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseBarAnchor = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.baseBarAnchor()', 'timeline.elements().anchor()'], true);
  return this.elements()['anchor'](opt_value);
};


/**
 * @param {anychart.enums.Position=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.elements().position() instead. DVF-3625
 * @return {anychart.enums.Position|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseBarPosition = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.baseBarPosition()', 'timeline.elements().position()'], true);
  return this.elements()['position'](opt_value);
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.elements().offset() instead. DVF-3625
 * @return {string|number|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseBarOffset = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.baseBarOffset()', 'timeline.elements().offset()'], true);
  return this.elements()['offset'](opt_value);
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.groupingTasks().height() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentBarHeight = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.parentBarHeight()', 'timeline.groupingTasks().height()'], true);
    return this.groupingTasks()['height'](opt_value);
  }
};


/**
 * @param {anychart.enums.Anchor=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.groupingTasks().anchor() instead. DVF-3625
 * @return {anychart.enums.Anchor|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentBarAnchor = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.parentBarAnchor()', 'timeline.groupingTasks().anchor()'], true);
    return this.groupingTasks()['anchor'](opt_value);
  }
};


/**
 * @param {anychart.enums.Position=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.groupingTasks().position() instead. DVF-3625
 * @return {anychart.enums.Position|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentBarPosition = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.parentBarPosition()', 'timeline.groupingTasks().position()'], true);
    return this.groupingTasks()['position'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.groupingTasks().offset() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentBarOffset = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.parentBarOffset()', 'timeline.groupingTasks().offset()'], true);
    return this.groupingTasks()['offset'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.baselines().height() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineBarHeight = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineBarHeight()', 'timeline.baselines().height()'], true);
    return this.baselines()['height'](opt_value);
  }
};


/**
 * @param {anychart.enums.Anchor=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.baselines().anchor() instead. DVF-3625
 * @return {anychart.enums.Anchor|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineBarAnchor = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineBarAnchor()', 'timeline.baselines().anchor()'], true);
    return this.baselines()['anchor'](opt_value);
  }
};


/**
 * @param {anychart.enums.Position=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.baselines().position() instead. DVF-3625
 * @return {anychart.enums.Position|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineBarPosition = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineBarPosition()', 'timeline.baselines().position()'], true);
    return this.baselines()['position'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.baselines().offset() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineBarOffset = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.baselineBarOffset()', 'timeline.baselines().offset()'], true);
    return this.baselines()['offset'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.tasks().progress().height() or
 *  timeline.groupingTasks().progress().height() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressBarHeight = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressBarHeight()', 'timeline.tasks().progress().height() or timeline.groupingTasks().progress().height()'], true);
    return this.tasks().progress()['height'](opt_value);
  }
};


/**
 * @param {anychart.enums.Anchor=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.tasks().progress().anchor() or
 *  timeline.groupingTasks().progress().anchor() instead. DVF-3625
 * @return {anychart.enums.Anchor|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressBarAnchor = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressBarAnchor()', 'timeline.tasks().progress().anchor() or timeline.groupingTasks().progress().anchor()'], true);
    return this.tasks().progress()['anchor'](opt_value);
  }
};


/**
 * @param {anychart.enums.Position=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.tasks().progress().position() or
 *  timeline.groupingTasks().progress().position() instead. DVF-3625
 * @return {anychart.enums.Position|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressBarPosition = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressBarPosition()', 'timeline.tasks().progress().position() or timeline.groupingTasks().progress().position()'], true);
    return this.tasks().progress()['position'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.tasks().progress().offset() or
 *  timeline.groupingTasks().progress().offset() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressBarOffset = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.progressBarOffset()', 'timeline.tasks().progress().offset() or timeline.groupingTasks().progress().offset()'], true);
    return this.tasks().progress()['offset'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.milestones().height() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestoneHeight = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.milestoneHeight()', 'timeline.milestones().height()'], true);
    return this.milestones()['height'](opt_value);
  }
};


/**
 * @param {anychart.enums.Anchor=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.milestones().anchor() instead. DVF-3625
 * @return {anychart.enums.Anchor|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestoneAnchor = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.milestoneAnchor()', 'timeline.milestones().anchor()'], true);
    return this.milestones()['anchor'](opt_value);
  }
};


/**
 * @param {anychart.enums.Position=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.milestones().position() instead. DVF-3625
 * @return {anychart.enums.Position|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestonePosition = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.milestonePosition()', 'timeline.milestones().position()'], true);
    return this.milestones()['position'](opt_value);
  }
};


/**
 * @param {(string|number)=} opt_value - Value to set.
 * @deprecated since 8.2.0 use timeline.milestones().offset() instead. DVF-3625
 * @return {number|string|anychart.ganttModule.TimeLine|anychart.ganttModule.elements.TimelineElement} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestoneOffset = function(opt_value) {
  if (this.controller.isResources()) {
    return this;
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
        ['timeline.milestoneOffset()', 'timeline.milestones().offset()'], true);
    return this.milestones()['offset'](opt_value);
  }
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.connectors().fill() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.connectorFill = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.connectorFill()', 'timeline.connectors().fill()'], true);
  var target = this.connectors();
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.connectors().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.connectorStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.connectorStroke()', 'timeline.connectors().stroke()'], true);
  var target = this.connectors();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.2.0 use timeline.connectors().selected().stroke() instead. DVF-3625
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.selectedConnectorStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.selectedConnectorStroke()', 'timeline.connectors().selected().stroke()'], true);
  var target = this.connectors().selected();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.connectors().previewStroke() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Stroke|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.connectorPreviewStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.connectorPreviewStroke()', 'timeline.connectors().previewStroke()'], true);
  var target = this.connectors();
  return arguments.length ? target['previewStroke'].apply(target, arguments) : target['previewStroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.elements().edit().fill() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editPreviewFill = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editPreviewFill()', 'timeline.elements().edit().fill()'], true);
  var target = this.elements().edit();
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.connectors().stroke() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editPreviewStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editPreviewStroke()', 'timeline.elements().edit().stroke()'], true);
  var target = this.elements().edit();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.tasks().progress().edit().fill() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editProgressFill = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editProgressFill()', 'timeline.tasks().edit().fill()'], true);
  var target = this.tasks().edit();
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.tasks().edit().stroke() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editProgressStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editProgressStroke()', 'timeline.tasks().edit().stroke()'], true);
  var target = this.tasks().edit();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.elements().edit().thumbs().fill() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editIntervalThumbFill = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editIntervalThumbFill()', 'timeline.elements().edit().thumbs().fill()'], true);
  var target = this.elements().edit().thumbs();
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.elements().edit().thumbs().stroke() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editIntervalThumbStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editIntervalThumbStroke()', 'timeline.elements().edit().thumbs().stroke()'], true);
  var target = this.elements().edit().thumbs();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.elements().edit().connectorThumbs().fill() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editConnectorThumbFill = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editConnectorThumbFill()', 'timeline.elements().edit().connectorThumbs().fill()'], true);
  var target = this.elements().edit().connectorThumbs();
  return arguments.length ? target['fill'].apply(target, arguments) : target['fill']();
};


/**
 * @param {...*} var_args - Args.
 * @deprecated since 8.3.0 use timeline.elements().edit().connectorThumbs().stroke() instead. DVF-3623
 * @return {anychart.ganttModule.TimeLine|acgraph.vector.Fill|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.TimeLine.prototype.editConnectorThumbStroke = function(var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editConnectorThumbStroke()', 'timeline.elements().edit().connectorThumbs().stroke()'], true);
  var target = this.elements().edit().connectorThumbs();
  return arguments.length ? target['stroke'].apply(target, arguments) : target['stroke']();
};


/**
 * @param {anychart.enums.MarkerType=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().start().connectorThumb().type() instead. DVF-3623
 * @return {anychart.enums.MarkerType|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerType = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editStartConnectorMarkerType()', 'timeline.elements().edit().start().connectorThumb().type()'], true);
  var target = this.elements().edit().start().connectorThumb();
  return arguments.length ? target['type'].apply(target, arguments) : target['type']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().start().connectorThumb().size() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerSize = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editStartConnectorMarkerSize()', 'timeline.elements().edit().start().connectorThumb().size()'], true);
  var target = this.elements().edit().start().connectorThumb();
  return arguments.length ? target['size'].apply(target, arguments) : target['size']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().start().connectorThumb().horizontalOffset() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerHorizontalOffset = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editStartConnectorMarkerHorizontalOffset()', 'timeline.elements().edit().start().connectorThumb().horizontalOffset()'], true);
  var target = this.elements().edit().start().connectorThumb();
  return arguments.length ? target['horizontalOffset'].apply(target, arguments) : target['horizontalOffset']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().start().connectorThumb().verticalOffset() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerVerticalOffset = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editStartConnectorMarkerVerticalOffset()', 'timeline.elements().edit().start().connectorThumb().verticalOffset()'], true);
  var target = this.elements().edit().start().connectorThumb();
  return arguments.length ? target['verticalOffset'].apply(target, arguments) : target['verticalOffset']();
};


/**
 * @param {anychart.enums.MarkerType=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().end().connectorThumb().type() instead. DVF-3623
 * @return {anychart.enums.MarkerType|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerType = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editFinishConnectorMarkerType()', 'timeline.elements().edit().end().connectorThumb().type()'], true);
  var target = this.elements().edit().end().connectorThumb();
  return arguments.length ? target['type'].apply(target, arguments) : target['type']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().end().connectorThumb().size() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerSize = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editFinishConnectorMarkerSize()', 'timeline.elements().edit().end().connectorThumb().size()'], true);
  var target = this.elements().edit().end().connectorThumb();
  return arguments.length ? target['size'].apply(target, arguments) : target['size']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().end().connectorThumb().horizontalOffset() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerHorizontalOffset = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editStartConnectorMarkerHorizontalOffset()', 'timeline.elements().edit().end().connectorThumb().horizontalOffset()'], true);
  var target = this.elements().edit().end().connectorThumb();
  return arguments.length ? target['horizontalOffset'].apply(target, arguments) : target['horizontalOffset']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().end().connectorThumb().verticalOffset() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerVerticalOffset = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editFinishConnectorMarkerVerticalOffset()', 'timeline.elements().edit().end().connectorThumb().verticalOffset()'], true);
  var target = this.elements().edit().end().connectorThumb();
  return arguments.length ? target['verticalOffset'].apply(target, arguments) : target['verticalOffset']();
};


/**
 * @param {number=} opt_value - Value to set.
 * @deprecated since 8.3.0 use timeline.elements().edit().thumbs().size() instead. DVF-3623
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editIntervalWidth = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['timeline.editIntervalWidth()', 'timeline.elements().edit().thumbs().size()'], true);
  var target = this.elements().edit().thumbs();
  return arguments.length ? target['size'].apply(target, arguments) : target['size']();
};


//endregion
//region -- Scale.
/**
 * Gets timeline scale.
 * @param {Object=} opt_value - Scale config.
 * @return {anychart.ganttModule.TimeLine|anychart.scales.GanttDateTime}
 */
anychart.ganttModule.TimeLine.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.scale_.setup(opt_value);
    return this;
  }
  return this.scale_;
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.scaleInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.TIMELINE_SCALES | anychart.ConsistencyState.TIMELINE_MARKERS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    // Calendar settings has been changed.
    state |= anychart.ConsistencyState.TIMELINE_CALENDAR;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets timeline's gantt date time scale.
 * @return {anychart.scales.GanttDateTime} - Scale.
 */
anychart.ganttModule.TimeLine.prototype.getScale = function() {
  return this.scale_;
};


//endregion
//region -- Header.
/**
 * Gets/configures timeline header.
 * @param {Object=} opt_value - Config.
 * @return {anychart.ganttModule.header.Header|anychart.ganttModule.TimeLine} - Header or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.header = function(opt_value) {
  if (!this.header_) {
    this.header_ = new anychart.ganttModule.header.Header(this);
    this.header_.zIndex(anychart.ganttModule.TimeLine.HEADER_Z_INDEX);
    this.header_.listenSignals(this.headerInvalidated_, this);
    this.header_.formatSelector.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }

  if (goog.isDef(opt_value)) {
    this.header_.setup(opt_value);
    return this;
  } else {
    return this.header_;
  }
};


/**
 * Header invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.headerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Axis markers.
/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value - Object with line marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultLineMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLineMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultLineMarkerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value - Object with range marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


/**
 * Getter/setter for text marker default settings.
 * @param {Object=} opt_value - Object with text marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultTextMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultTextMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultTextMarkerSettings_ || {};
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Line marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Line marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Line|anychart.ganttModule.TimeLine)} - Line marker instance by index or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.ganttModule.axisMarkers.Line(this.scale_);
    lineMarker.addThemes(this.themeSettings['defaultLineMarkerSettings']);
    lineMarker.setParentEventTarget(this);
    this.lineMarkers_[index] = lineMarker;
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Range marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Range marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Range|anychart.ganttModule.TimeLine)} - Range marker instance by index or
 *  itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.ganttModule.axisMarkers.Range(this.scale_);
    rangeMarker.addThemes(this.themeSettings['defaultRangeMarkerSettings']);
    rangeMarker.setParentEventTarget(this);
    this.rangeMarkers_[index] = rangeMarker;
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Text marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Text marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Text|anychart.ganttModule.TimeLine)} - Text marker instance by index or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.ganttModule.axisMarkers.Text(this.scale_);
    textMarker.addThemes(this.themeSettings['defaultTextMarkerSettings']);
    textMarker.setParentEventTarget(this);
    this.textMarkers_[index] = textMarker;
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.TIMELINE_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Labels and Markers.
/**
 * Labels factory getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.labels = function(opt_value) {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_.setParentEventTarget(this);
    this.labelsFactory_.listenSignals(this.labelsInvalidated_, this);

    // this.labelsFactory_.dropThemes();
    this.setupCreated('labels', this.labelsFactory_);
  }

  if (goog.isDef(opt_value)) {
    var redraw = true;
    if (anychart.utils.instanceOf(opt_value, anychart.core.ui.LabelsFactory)) {
      this.labelsFactory_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labelsFactory_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labelsFactory_.enabled(false);
    } else {
      redraw = false;
    }
    if (redraw) {
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.labelsFactory_;
};


/**
 * Markers factory getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.MarkersFactory} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.markers = function(opt_value) {
  if (!this.markersFactory_) {
    this.markersFactory_ = new anychart.core.ui.MarkersFactory();
    this.markersFactory_.addThemes('defaultTimeline.markers');
    this.markersFactory_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    var redraw = true;
    if (anychart.utils.instanceOf(opt_value, anychart.core.ui.MarkersFactory)) {
      this.markersFactory_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markersFactory_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.markersFactory_.enabled(false);
    } else {
      redraw = false;
    }
    if (redraw) {
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.markersFactory_;
};


//endregion
//region -- Paths getters.
/**
 * Getter for this.holidaysPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getHolidaysPath_ = function() {
  if (!this.holidaysPath_) {
    this.holidaysPath_ = /** @type {acgraph.vector.Path} */ (this.getCalendarLayer().path());
    this.holidaysPath_.zIndex(0);
    anychart.utils.nameElement(this.holidaysPath_, 'holidays-path');
    this.holidaysPath_
      .stroke('none')
      .fill(/** @type {acgraph.vector.Fill} */ (this.getOption('holidaysFill')));
  }
  return this.holidaysPath_;
};


/**
 * Getter for this.weekendsPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getWeekendsPath_ = function() {
  if (!this.weekendsPath_) {
    this.weekendsPath_ = /** @type {acgraph.vector.Path} */ (this.getCalendarLayer().path());
    this.weekendsPath_.zIndex(0);
    anychart.utils.nameElement(this.weekendsPath_, 'weekends-path');
    this.weekendsPath_
      .stroke('none')
      .fill(/** @type {acgraph.vector.Fill} */ (this.getOption('weekendsFill')));
  }
  return this.weekendsPath_;
};


/**
 * Getter for this.workingPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getWorkingPath_ = function() {
  if (!this.workingPath_) {
    this.workingPath_ = /** @type {acgraph.vector.Path} */ (this.getCalendarLayer().path());
    this.workingPath_.zIndex(1);
    anychart.utils.nameElement(this.workingPath_, 'working-path');
    this.workingPath_
      .stroke('none')
      .fill(/** @type {acgraph.vector.Fill} */ (this.getOption('workingFill')));
  }
  return this.workingPath_;
};


/**
 * Getter for this.notWorkingPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getNotWorkingPath_ = function() {
  if (!this.notWorkingPath_) {
    this.notWorkingPath_ = /** @type {acgraph.vector.Path} */ (this.getCalendarLayer().path());
    this.notWorkingPath_.zIndex(1);
    anychart.utils.nameElement(this.notWorkingPath_, 'not-working-path');
    this.notWorkingPath_
      .stroke('none')
      .fill(/** @type {acgraph.vector.Fill} */ (this.getOption('notWorkingFill')));
  }
  return this.notWorkingPath_;
};


/**
 * Getter for this.separationPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getSeparationPath_ = function() {
  if (!this.separationPath_) {
    this.separationPath_ = /** @type {acgraph.vector.Path} */ (this.getClipLayer().path());
    this.separationPath_.zIndex(6);
    anychart.utils.nameElement(this.separationPath_, 'low-ticks-separation-path');
    this.separationPath_.stroke(/** @type {acgraph.vector.Stroke} */(anychart.ganttModule.BaseGrid.getColorResolver('columnStroke', anychart.enums.ColorType.STROKE, false)(this, 0)));
  }
  return this.separationPath_;
};


/**
 * Getter for this.editPreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditPreviewPath_ = function() {
  if (!this.editPreviewPath_) {
    this.editPreviewPath_ = this.getEditLayer().path();
    this.editPreviewPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_PREVIEW_Z_INDEX)
        .cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.eventsHandler.listen(this.editPreviewPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editPreviewPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editPreviewDragMouseDown_, false, this);
  }
  return this.editPreviewPath_;
};


/**
 * Getter for this.editProgressPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditProgressPath_ = function() {
  if (!this.editProgressPath_) {
    this.editProgressPath_ = this.getEditLayer().path();
    this.editProgressPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_PROGRESS_Z_INDEX);

    this.eventsHandler.listen(this.editProgressPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editProgressPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editProgressDragMouseDown_, false, this);
  }
  return this.editProgressPath_;
};


/**
 * Getter for this.editProgressPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditBaselineProgressPath_ = function() {
  if (!this.editBaselineProgressPath_) {
    this.editBaselineProgressPath_ = this.getEditLayer().path();
    this.editBaselineProgressPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_PROGRESS_Z_INDEX);

    this.eventsHandler.listen(this.editBaselineProgressPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editBaselineProgressPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editBaselineProgressDragMouseDown_, false, this);
  }
  return this.editBaselineProgressPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditLeftThumbPath_ = function() {
  if (!this.editLeftThumbPath_) {
    this.editLeftThumbPath_ = this.getEditLayer().path();
    this.editLeftThumbPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_LEFT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editLeftThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editLeftThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editLeftThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editLeftThumbDragMouseDown_, false, this);
  }
  return this.editLeftThumbPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditRightThumbPath_ = function() {
  if (!this.editRightThumbPath_) {
    this.editRightThumbPath_ = this.getEditLayer().path();
    this.editRightThumbPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_RIGHT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editRightThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editRightThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editRightThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editRightThumbDragMouseDown_, false, this);
  }
  return this.editRightThumbPath_;
};


/**
 * Getter for this.editStartConnectorPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditStartConnectorPath_ = function() {
  if (!this.editStartConnectorPath_) {
    this.editStartConnectorPath_ = this.getEditLayer().path();
    this.editStartConnectorPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_START_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editStartConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editStartConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editStartConnectorMouseDown_, false, this);
  }
  return this.editStartConnectorPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditFinishConnectorPath_ = function() {
  if (!this.editFinishConnectorPath_) {
    this.editFinishConnectorPath_ = this.getEditLayer().path();
    this.editFinishConnectorPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_FINISH_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editFinishConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editFinishConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editFinishConnectorMouseDown_, false, this);
  }
  return this.editFinishConnectorPath_;
};


/**
 * Getter for this.editConnectorPreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditConnectorPreviewPath_ = function() {
  if (!this.editConnectorPreviewPath_) {
    this.editConnectorPreviewPath_ = /** @type {acgraph.vector.Path} */ (this.getEditLayer().path());
    this.editConnectorPreviewPath_
    // .stroke(this.connectorPreviewStroke_)
        .zIndex(anychart.ganttModule.TimeLine.EDIT_CONNECTOR_PREVIEW_Z_INDEX);
    this.editConnectorPreviewPath_.disablePointerEvents(true);
  }
  return this.editConnectorPreviewPath_;
};


//endregion
//region -- Edit events.
/**
 * Clears edit controls.
 * @param {boolean=} opt_ignoreTooltip - Whether to try to restore tooltip visibility.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.clearEdit_ = function(opt_ignoreTooltip) {
  for (var i = 0; i < this.editControls_.length; i++) {
    var path = this.editControls_[i];
    path.clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  this.editControls_.length = 0;

  if (!opt_ignoreTooltip) {
    this.tooltip().enabled(this.tooltipEnabledBackup_);
    this.tooltipEnabledBackup_ = void 0;
  }
};


/**
 * Drag preview mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDragMouseDown_ = function(e) {
  this.editPreviewDragger_ = new anychart.ganttModule.draggers.BarDragger(this.getEditPreviewPath_());

  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.START, this.editPreviewDragStart_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editPreviewDrag_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.END, this.editPreviewEnd_, false, this);
  this.editPreviewDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag progress mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragMouseDown_ = function(e) {
  this.editProgressDragger_ = new anychart.ganttModule.draggers.ProgressDragger(this.getEditProgressPath_());

  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.START, this.editProgressDragStart_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editProgressDrag_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.END, this.editProgressDragEnd_, false, this);
  this.editProgressDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Baseline Drag progress mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editBaselineProgressDragMouseDown_ = function(e) {
  this.editBaselineProgressDragger_ = new anychart.ganttModule.draggers.BaselineProgressDragger(this.getEditBaselineProgressPath_());

  this.editBaselineProgressDragger_.listen(goog.fx.Dragger.EventType.START, this.editBaselineProgressDragStart_, false, this);
  this.editBaselineProgressDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editBaselineProgressDrag_, false, this);
  this.editBaselineProgressDragger_.listen(goog.fx.Dragger.EventType.END, this.editBaselineProgressDragEnd_, false, this);
  this.editBaselineProgressDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag left thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editLeftThumbDragMouseDown_ = function(e) {
  this.editLeftThumbDragger_ = new anychart.ganttModule.draggers.ThumbDragger(this.getEditLeftThumbPath_(), true);

  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editLeftThumbDragStart_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editLeftThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag right thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editRightThumbDragMouseDown_ = function(e) {
  this.editRightThumbDragger_ = new anychart.ganttModule.draggers.ThumbDragger(this.getEditRightThumbPath_(), false);

  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editRightThumbDragStart_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editRightThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag start connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMouseDown_ = function(e) {
  this.editStartConnectorDragger_ = new anychart.ganttModule.draggers.ConnectorDragger(this, this.getEditStartConnectorPath_(), true);

  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editStartConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag finish connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMouseDown_ = function(e) {
  this.editFinishConnectorDragger_ = new anychart.ganttModule.draggers.ConnectorDragger(this, this.getEditFinishConnectorPath_(), false);

  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editFinishConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Edit preview drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.interactivityHandler.highlight();
  this.getEditProgressPath_().clear();
  this.getEditBaselineProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
  this.enableDocMouseMove(true);
};


/**
 * Edit preview drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.draggingPreview = true;
  this.preventClickAfterDrag = true;
};


/**
 * Edit preview drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    var draggedBounds = this.getEditPreviewPath_().getBounds();

    this.clearEdit_();

    var dragger = e.target;
    var el = /** @type {acgraph.vector.Path} */ (dragger.element);
    var dataItem = el.tag.item;
    var tree = this.controller.data();//this.controller.data() can be Tree or TreeView.

    tree.suspendSignalsDispatching();

    var newActualStartRatio = (el.tag.type == anychart.enums.TLElementTypes.MILESTONES || el.tag.type == anychart.enums.TLElementTypes.MILESTONES_PREVIEW) ?
        ((draggedBounds.left + draggedBounds.width / 2 - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width)) :
        ((draggedBounds.left - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width));
    var newActualStart = this.scale_.ratioToTimestamp(newActualStartRatio);

    /*
      This check is for rare case:
      Sometimes we can get NaN values by some unknown factors that I can't catch and reproduce (drag issues?).
      This condition prevents setting NaN values.
     */
    if (!isNaN(newActualStart)) {
      var delta = 0;
      var periodIndex;
      var periodStart;

      switch (el.tag.type) {
        case anychart.enums.TLElementTypes.MILESTONES:
        case anychart.enums.TLElementTypes.MILESTONES_PREVIEW:
          if (this.controller.isResources()) {
            periodIndex = el.tag.periodIndex;
            periodStart = /** @type {number} */ (dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START));
            var periodFieldName = goog.isDef(periodStart) ? anychart.enums.GanttDataFields.START : anychart.enums.GanttDataFields.END;
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, periodFieldName, newActualStart);
            dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, periodFieldName, newActualStart);
          } else {
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            if (goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END))) {
              dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualStart);
              dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newActualStart);
            }
          }
          break;
        case anychart.enums.TLElementTypes.PERIODS:
          periodIndex = el.tag.periodIndex;
          periodStart = /** @type {number} */ (dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START));
          var periodEnd = dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END);
          delta = newActualStart - periodStart;
          var newPeriodEnd = periodEnd + delta;
          if (!isNaN(newPeriodEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newActualStart);
            dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newPeriodEnd);
            dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newPeriodEnd);
          }
          break;
        case anychart.enums.TLElementTypes.BASELINES:
          var baselineStart = /** @type {number} */ (dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START));
          var baselineEnd = dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END);
          delta = newActualStart - baselineStart;
          var newBaselineEnd = baselineEnd + delta;
          if (!isNaN(newBaselineEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START, newActualStart);
          }
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, baselineEnd + delta);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END, baselineEnd + delta);
          break;
        default:
          var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(dataItem);
          var actualStart = info.start;
          var actualEnd = info.end;

          delta = newActualStart - actualStart;
          var newActualEnd = actualEnd + delta;
          if (!isNaN(newActualEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualEnd);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newActualEnd);
          }
      }
    }


    tree.resumeSignalsDispatching(true);

    this.initScale();

    this.dragging = false;
    this.draggingPreview = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  goog.style.setStyle(anychart.document['body'], 'cursor', ''); //TODO (A.Kudryavtsev): Do we reset old CSS cursor here?
  this.enableDocMouseMove(false);
};


/**
 * Edit progress drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.draggingProgress = true;
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();
  this.getEditPreviewPath_().clear();
  this.getEditBaselineProgressPath_().clear();
};


/**
 * Edit progress drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.preventClickAfterDrag = true;
};


/**
 * Edit progress drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    var item = el.tag.item;
    if (!isNaN(dragger.progress)) {
      item.set(anychart.enums.GanttDataFields.PROGRESS_VALUE, anychart.math.round(dragger.progress, 2));
    }
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.draggingProgress = false;
  }
};


/**
 * Edit progress drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editBaselineProgressDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.draggingProgress = true;
  var tooltip = /** @type {anychart.core.ui.Tooltip} */ (this.tooltip());
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (tooltip.enabled());
  tooltip.hide();
  tooltip.enabled(false);
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();
  this.getEditPreviewPath_().clear();
  this.getEditProgressPath_().clear();
};


/**
 * Edit progress drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editBaselineProgressDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.preventClickAfterDrag = true;
};


/**
 * Edit progress drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editBaselineProgressDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    var item = el.tag.item;
    if (!isNaN(dragger.progress)) {
      item.set(anychart.enums.GanttDataFields.BASELINE_PROGRESS_VALUE, anychart.math.round(dragger.progress, 2));
    }
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.draggingProgress = false;
  }
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editRightThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditBaselineProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));
  this.enableDocMouseMove(true);
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editLeftThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditBaselineProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));
  this.enableDocMouseMove(true);
};


//endregion
//region -- Utils.
/**
 *
 * @param {number} anchoredTop
 * @param {number} barHeight
 * @param {anychart.enums.Anchor} anchor
 * @private
 * @return {number}
 */
anychart.ganttModule.TimeLine.prototype.fixBarTop_ = function(anchoredTop, barHeight, anchor) {
  var verticalOffset;
  if (anychart.utils.isTopAnchor(anchor))
    verticalOffset = 0;
  else if (anychart.utils.isBottomAnchor(anchor))
    verticalOffset = -barHeight;
  else
    verticalOffset = -barHeight / 2;

  return anchoredTop + verticalOffset;
};


/**
 * Resolves anchor by position and bar type.
 * @param {anychart.enums.Position} position - Position.
 * @param {anychart.enums.TLElementTypes} type - Timeline element type.
 * @param {boolean=} opt_considerBaseline - Whether to consider baseline.
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.resolveAutoAnchorByType_ = function(position, type, opt_considerBaseline) {
  var anchor = /** @type {anychart.enums.Anchor} */ (position);
  var above = this.baselines().getOption('above');
  switch (type) {
    case anychart.enums.TLElementTypes.TASKS:
      if (opt_considerBaseline && position == anychart.enums.Position.LEFT_CENTER) {
        anchor = above ? anychart.enums.Anchor.LEFT_TOP : anychart.enums.Anchor.LEFT_BOTTOM;
      }
      break;
    case anychart.enums.TLElementTypes.GROUPING_TASKS:
      anchor = anychart.utils.isTopAnchor(/** @type {anychart.enums.Anchor} */ (position)) ?
          anychart.enums.Anchor.LEFT_TOP :
          anychart.enums.Anchor.LEFT_BOTTOM;
      if (opt_considerBaseline && position == anychart.enums.Position.LEFT_CENTER) {
        anchor = above ? anychart.enums.Anchor.LEFT_TOP : anychart.enums.Anchor.LEFT_BOTTOM;
      }
      break;
    case anychart.enums.TLElementTypes.BASELINES:
      if (position == anychart.enums.Position.LEFT_CENTER)
        anchor = above ? anychart.enums.Anchor.LEFT_BOTTOM : anychart.enums.Anchor.LEFT_TOP;
  }

  return /** @type {anychart.enums.Anchor} */ (anchor);
};


//endregion
/**
 * Draws thumb preview.
 * @param {goog.fx.DragEvent} event - Event.
 * @param {number=} opt_scrolling - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawThumbPreview_ = function(event, opt_scrolling) {
  if (this.currentThumbDragger_) {
    var path = this.currentThumbDragger_.isLeft ? this.editLeftThumbPath_ : this.editRightThumbPath_;

    var item = path.tag.item;
    var type = path.tag.type;
    var periodIndex = path.tag.periodIndex;
    var bounds = path.tag.bounds;

    var time;

    switch (type) {
      case anychart.enums.TLElementTypes.BASELINES:
        time = this.currentThumbDragger_.isLeft ?
            item.meta(anychart.enums.GanttDataFields.BASELINE_END) :
            item.meta(anychart.enums.GanttDataFields.BASELINE_START);
        break;
      case anychart.enums.TLElementTypes.PERIODS:
        time = this.currentThumbDragger_.isLeft ?
            item.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END) :
            item.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START);
        break;
      default:
        var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
        if (this.currentThumbDragger_.isLeft) {
          time = info.end;
        } else {
          time = info.start;
        }
    }

    var left = this.container().getStage().getClientPosition().x;

    var mouseLeft;
    if (opt_scrolling) {
      mouseLeft = opt_scrolling < 0 ? this.pixelBoundsCache.left : this.pixelBoundsCache.left + this.pixelBoundsCache.width;
    } else {
      mouseLeft = event.clientX - left;
    }

    var ratio = this.scale_.timestampToRatio(time);
    var ratioLeft = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;

    this.editPreviewPath_
        .clear()
        .moveTo(ratioLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top + bounds.height)
        .lineTo(ratioLeft, bounds.top + bounds.height)
        .close();
  }
};


/**
 * Draws connector preview.
 * @param {goog.fx.DragEvent|anychart.core.MouseEvent} event - Event.
 * @param {number=} opt_scrollOffsetX - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @param {number=} opt_scrollOffsetY - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawConnectorPreview_ = function(event, opt_scrollOffsetX, opt_scrollOffsetY) {
  //TODO (A.Kudryavtsev): In DVF-1809 case this.currentConnectorDragger_ can remain not null. Check it carefully!
  if (this.currentConnectorDragger_ && this.dragging) {
    var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

    var index = circle.tag.index;
    var period = circle.tag.period;
    var periodIndex = circle.tag.periodIndex;

    var containerPosition = this.container().getStage().getClientPosition();
    var containerLeft = containerPosition.x;
    var containerTop = containerPosition.y;

    var mouseLeft, mouseTop;

    if (opt_scrollOffsetX || opt_scrollOffsetY) { //Whether we draw it all on scolling when mouse is actually not moving.
      mouseLeft = this.currentConnectorDragger_.lastTrackedMouseX - containerLeft;
      mouseTop = this.currentConnectorDragger_.lastTrackedMouseY - containerTop;
    } else {
      mouseLeft = event.clientX - containerLeft;
      mouseTop = event.clientY - containerTop;
    }

    var initItemsBounds = this.getItemBounds_(index, period, periodIndex);
    var previewStroke = this.connectors()['previewStroke']();

    var previewThickness = anychart.utils.extractThickness(previewStroke);
    var pixelShift = (previewThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

    var startLeft = this.currentConnectorDragger_.isStart ? initItemsBounds.left : initItemsBounds.left + initItemsBounds.width;
    var startTop = initItemsBounds.top + initItemsBounds.height / 2 + pixelShift;

    this.getEditConnectorPreviewPath_()
        .stroke(previewStroke)
        .clear()
        .moveTo(startLeft, startTop)
        .lineTo(mouseLeft, mouseTop);
  }
};


/**
 * Edit thumb drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editThumbDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.currentThumbDragger_ = /** @type {anychart.ganttModule.draggers.ThumbDragger} */ (e.target);
  this.preventClickAfterDrag = true;
  this.drawThumbPreview_(e);
};


/**
 * Edit thumb drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editThumbDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    var dragPreviewBounds = this.editPreviewPath_.getBounds();

    this.editControls_.push(this.editPreviewPath_); //Kind of soft hack: force this.editPreviewPath_ clearing.
    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    var dataItem = el.tag.item;
    var periodIndex = el.tag.periodIndex;
    var tree = this.controller.data();//this.controller.data() can be Tree or TreeView.

    tree.suspendSignalsDispatching();

    var left = dragPreviewBounds.left;
    var right = dragPreviewBounds.left + dragPreviewBounds.width;
    var leftRatio = (left - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var rightRatio = (right - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var newStart = this.scale_.ratioToTimestamp(leftRatio);
    var newEnd = this.scale_.ratioToTimestamp(rightRatio);

    if (!isNaN(newStart) && !isNaN(newEnd)) {
      switch (el.tag.type) {
        case anychart.enums.TLElementTypes.PERIODS:
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newStart);
          dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newEnd);
          dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newEnd);
          break;
        case anychart.enums.TLElementTypes.BASELINES:
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newStart);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, newEnd);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END, newEnd);
          break;
        default:
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newStart);
          dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newEnd);
          dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newEnd);
      }
    }

    tree.resumeSignalsDispatching(true);
    this.initScale();

    this.currentThumbDragger_ = null;
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }

  goog.style.setStyle(anychart.document['body'], 'cursor', '');
  this.editPreviewPath_.cursor(acgraph.vector.Cursor.EW_RESIZE);
  this.enableDocMouseMove(false);
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.interactivityHandler.highlight();
  this.currentConnectorDragger_ = /** @type {anychart.ganttModule.draggers.ConnectorDragger} */ (e.target);
  this.clearEdit_();
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.enableDocMouseMove(true);
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDrag_ = function(e) {
  this.dragging = true;
  this.draggingConnector = true;
  this.finishedDraggingConnector = false;
  this.interactive = false;
  this.currentConnectorDragger_.lastTrackedMouseX = e.clientX;
  this.currentConnectorDragger_.lastTrackedMouseY = e.clientY;
  this.preventClickAfterDrag = true;
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(this.tooltipEnabledBackup_);
    this.tooltipEnabledBackup_ = void 0;
    this.getEditConnectorPreviewPath_().clear();
    this.dragging = false;
    this.draggingConnector = false;
    this.finishedDraggingConnector = true;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  this.enableDocMouseMove(false);
  //Moved nulling of this.currentConnectorDragger_ to additional mouse up actions (see addMouseUp() method).
};


//region -- Connector events.
/**
 * Creates connector interactivity event.
 * @param {?anychart.core.MouseEvent} event - Incoming original event. Null value means unselection.
 * @private
 * @return {Object} - New event object to be dispatched.
 */
anychart.ganttModule.TimeLine.prototype.getConnectorInteractivityEvent_ = function(event) {
  var type = anychart.enums.EventType.CONNECTOR_SELECT;
  if (event) {
    type = event.type;
    switch (type) {
      case acgraph.events.EventType.MOUSEOUT:
        type = anychart.enums.EventType.CONNECTOR_MOUSE_OUT;
        break;
      case acgraph.events.EventType.MOUSEOVER:
        type = anychart.enums.EventType.CONNECTOR_MOUSE_OVER;
        break;
      case acgraph.events.EventType.MOUSEMOVE:
      case acgraph.events.EventType.TOUCHMOVE:
        type = anychart.enums.EventType.CONNECTOR_MOUSE_MOVE;
        break;
      case acgraph.events.EventType.MOUSEDOWN:
      case acgraph.events.EventType.TOUCHSTART:
        type = anychart.enums.EventType.CONNECTOR_MOUSE_DOWN;
        break;
      case acgraph.events.EventType.MOUSEUP:
      case acgraph.events.EventType.TOUCHEND:
        type = anychart.enums.EventType.CONNECTOR_MOUSE_UP;
        break;
      case acgraph.events.EventType.CLICK:
        type = anychart.enums.EventType.CONNECTOR_CLICK;
        break;
      case acgraph.events.EventType.DBLCLICK:
        type = anychart.enums.EventType.CONNECTOR_DBL_CLICK;
        break;
    }
  }

  return {
    'type': type,
    'actualTarget': event ? event.target : null,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Patches connector interactivity events.
 * @param {Object} evt - Event object.
 * @private
 * @return {?Object} - Patched event or null.
 */
anychart.ganttModule.TimeLine.prototype.patchConnectorEvent_ = function(evt) {
  if (evt && evt['originalEvent']) {
    var orig = evt['originalEvent'];
    var domTarget = (anychart.utils.instanceOf(orig, acgraph.events.BrowserEvent)) ? orig['target'] : orig['domTarget'];
    if (domTarget && anychart.utils.instanceOf(domTarget, anychart.ganttModule.BaseGrid.Element) && domTarget.type == anychart.enums.TLElementTypes.CONNECTORS) {
      var connector = /** @type {anychart.ganttModule.BaseGrid.Element} */ (domTarget);
      var connEvent = this.getConnectorInteractivityEvent_(orig);
      for (var key in connector.meta)
        connEvent[key] = connector.meta[key];
      return connEvent;
    }
  }
  return null;
};


/**
 * Patches connector mouse out event.
 * @param {Object} evt - Event object.
 * @private
 * @return {?Object} - Patched event or null.
 */
anychart.ganttModule.TimeLine.prototype.patchConnectorMouseOutEvent_ = function(evt) {
  if (evt && evt['originalEvent']) {
    var connEvent = {
      'type': anychart.enums.EventType.CONNECTOR_MOUSE_OUT,
      'actualTarget': evt['originalEvent'].target,
      'target': this,
      'originalEvent': evt['originalEvent']
    };

    //Make sure that this.hoveredConnector_ is not null!
    for (var key in this.hoveredConnector_)
      connEvent[key] = this.hoveredConnector_[key];
    return connEvent;
  }
  return null;
};


//endregion
//region -- Edit controls drawing.
/**
 *
 * @param {anychart.enums.TLElementTypes} type - .
 * @param {anychart.math.Rect} bounds - .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawEditPreview_ = function(type, bounds, item, opt_periodIndex) {
  this.clearEdit_(true);
  var el = this.getElementByType_(type);
  var edit = /** @type {anychart.ganttModule.edit.ElementEdit} */ (el.edit());
  if (edit.getOption('enabled')) {
    var tag = this.createEditTag(item, null, type, bounds, opt_periodIndex);
    var path = this.getEditPreviewPath_();
    path.tag = tag;
    path
        .fill(/** @type {acgraph.vector.Fill} */ (edit.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (edit.getOption('stroke')))
        .clear()
        .moveTo(bounds.left, bounds.top)
        .lineTo(bounds.left + bounds.width, bounds.top)
        .lineTo(bounds.left + bounds.width, bounds.top + bounds.height)
        .lineTo(bounds.left, bounds.top + bounds.height)
        .close();

    this.editControls_.push(path);
  }
};


/**
 *
 * @param {anychart.enums.TLElementTypes} type - .
 * @param {anychart.math.Rect} bounds - .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawEditProgress_ = function(type, bounds, item, opt_periodIndex) {
  var el = /** @type {anychart.ganttModule.elements.TasksElement|anychart.ganttModule.elements.GroupingTasksElement} */ (this.getElementByType_(type));
  var edit = /** @type {anychart.ganttModule.edit.ElementEdit} */ (el.progress().edit());
  if (edit.getOption('enabled')) {
    var tag = this.createEditTag(item, null, anychart.enums.TLElementTypes.PROGRESS, bounds, opt_periodIndex);
    var path = this.getEditProgressPath_();
    path.tag = tag;
    var progressValue = goog.isDef(item.meta('progressValue')) ?
        item.meta('progressValue') :
        item.meta('autoProgress');

    progressValue = /** @type {number} */ (progressValue || 0);
    var progressLeft = bounds.left + progressValue * bounds.width;
    var top = bounds.top + bounds.height;
    var cornerHeight = anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT;

    path
        .fill(/** @type {acgraph.vector.Fill} */ (edit.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (edit.getOption('stroke')))
        .clear()
        .moveTo(progressLeft, top - cornerHeight)
        .lineTo(progressLeft + cornerHeight, top)
        .lineTo(progressLeft + cornerHeight, top + cornerHeight)
        .lineTo(progressLeft - cornerHeight, top + cornerHeight)
        .lineTo(progressLeft - cornerHeight, top)
        .close();

    this.editControls_.push(path);
  }
};


/**
 *
 * @param {anychart.enums.TLElementTypes} type - .
 * @param {anychart.math.Rect} bounds - .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawEditBaselineProgress_ = function(type, bounds, item, opt_periodIndex) {
  var el = /** @type {anychart.ganttModule.elements.TasksElement|anychart.ganttModule.elements.GroupingTasksElement} */ (this.getElementByType_(type));
  var edit = /** @type {anychart.ganttModule.edit.ElementEdit} */ (el.progress().edit());
  if (edit.getOption('enabled')) {
    var tag = this.createEditTag(item, null, anychart.enums.TLElementTypes.BASELINE_PROGRESS, bounds, opt_periodIndex);
    var path = this.getEditBaselineProgressPath_();
    path.tag = tag;
    var progressValue = /** @type {number} */ (item.get(anychart.enums.GanttDataFields.BASELINE_PROGRESS_VALUE) || 0);
    progressValue = anychart.utils.normalizeToRatio(progressValue);

    var progressLeft = bounds.left + progressValue * bounds.width;
    var top = bounds.top + bounds.height;
    var cornerHeight = anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT;

    path
        .fill(/** @type {acgraph.vector.Fill} */ (edit.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (edit.getOption('stroke')))
        .clear()
        .moveTo(progressLeft, top - cornerHeight)
        .lineTo(progressLeft + cornerHeight, top)
        .lineTo(progressLeft + cornerHeight, top + cornerHeight)
        .lineTo(progressLeft - cornerHeight, top + cornerHeight)
        .lineTo(progressLeft - cornerHeight, top)
        .close();

    this.editControls_.push(path);
  }
};


/**
 *
 * @param {anychart.enums.TLElementTypes} type - .
 * @param {anychart.math.Rect} bounds - .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawEditThumbs_ = function(type, bounds, item, opt_periodIndex) {
  var el = this.getElementByType_(type);
  var edit = /** @type {anychart.ganttModule.edit.ElementEdit} */ (el.edit());
  var tag = this.createEditTag(item, null, type, bounds, opt_periodIndex);
  var leftThumb = edit.start().thumb();
  var rightThumb = edit.end().thumb();
  var path, size;
  var right = bounds.left + bounds.width;

  if (edit.getOption('enabled') && leftThumb.getOption('enabled')) {
    path = this.getEditLeftThumbPath_();
    path.tag = tag;
    size = /** @type {number} */ (leftThumb.getOption('size'));
    path
        .fill(/** @type {acgraph.vector.Fill} */ (leftThumb.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (leftThumb.getOption('stroke')))
        .clear()
        .moveTo(bounds.left - 1, bounds.top)
        .lineTo(bounds.left - 1 + size, bounds.top)
        .lineTo(bounds.left - 1 + size, bounds.top + bounds.height)
        .lineTo(bounds.left - 1, bounds.top + bounds.height)
        .close();

    this.editControls_.push(path);
  }

  if (edit.getOption('enabled') && rightThumb.getOption('enabled')) {
    path = this.getEditRightThumbPath_();
    path.tag = tag;
    size = /** @type {number} */ (rightThumb.getOption('size'));
    path
        .fill(/** @type {acgraph.vector.Fill} */ (rightThumb.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (rightThumb.getOption('stroke')))
        .clear()
        .moveTo(right + 1, bounds.top)
        .lineTo(right + 1 - size, bounds.top)
        .lineTo(right + 1 - size, bounds.top + bounds.height)
        .lineTo(right + 1, bounds.top + bounds.height)
        .close();

    this.editControls_.push(path);
  }
};


/**
 *
 * @param {anychart.enums.TLElementTypes} type - .
 * @param {number} index - .
 * @param {anychart.math.Rect} bounds - .
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawConnectorsEditThumbs_ = function(type, index, bounds, item, opt_periodIndex) {
  var el = this.getElementByType_(type);
  var edit = /** @type {anychart.ganttModule.edit.ElementEdit} */ (el.edit());
  var tag = this.createEditTag(item, index, type, bounds, opt_periodIndex);
  var right = bounds.left + bounds.width;

  var leftThumb = edit.start().connectorThumb();
  var rightThumb = edit.end().connectorThumb();
  var path, size, drawer;
  var rTop = bounds.top + bounds.height / 2;

  if (edit.getOption('enabled') && leftThumb.getOption('enabled')) {
    path = this.getEditStartConnectorPath_();
    path.tag = tag;
    path
        .fill(/** @type {acgraph.vector.Fill} */ (leftThumb.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (leftThumb.getOption('stroke')));
    drawer = anychart.utils.getMarkerDrawer(leftThumb.getOption('type'));
    size = /** @type {number} */ (leftThumb.getOption('size')) / 2;
    drawer.call(null,
        /** @type {!acgraph.vector.Path} */ (path),
        bounds.left - size + /** @type {number} */ (leftThumb.getOption('horizontalOffset')),
        rTop + /** @type {number} */ (leftThumb.getOption('verticalOffset')),
        size);

    this.editControls_.push(path);
  }

  if (edit.getOption('enabled') && rightThumb.getOption('enabled')) {
    path = this.getEditFinishConnectorPath_();
    path.tag = tag;
    path
        .fill(/** @type {acgraph.vector.Fill} */ (rightThumb.getOption('fill')))
        .stroke(/** @type {acgraph.vector.Stroke} */ (rightThumb.getOption('stroke')));
    drawer = anychart.utils.getMarkerDrawer(rightThumb.getOption('type'));
    size = /** @type {number} */ (rightThumb.getOption('size')) / 2;
    drawer.call(null,
        /** @type {!acgraph.vector.Path} */ (path),
        right + size + /** @type {number} */ (rightThumb.getOption('horizontalOffset')),
        rTop + /** @type {number} */ (rightThumb.getOption('verticalOffset')),
        size);

    this.editControls_.push(path);
  }
};


//endregion
//region -- Common mouse events.
/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseMoveAndOver = function(evt, originalEvent) {
  var orig, domTarget, tag, dataItem;
  if (this.dragging) {
    if (this.draggingConnector) {
      this.drawEditConnector_(evt, originalEvent);
    }
  } else {
    if (evt && evt['originalEvent']) {
      orig = evt['originalEvent'];
      domTarget = orig['domTarget'];
      if (domTarget && domTarget.tag && domTarget.tag.isElement) {
        tag = /** @type {anychart.ganttModule.TimeLine.Tag} */ (domTarget.tag);
        dataItem = tag['item'];
        var id = dataItem.get(anychart.enums.GanttDataFields.ID);
        if (!goog.isDef(this.lastHoveredBarItemId_))
          this.lastHoveredBarItemId_ = id;

        var period = evt['period'];
        var periodIndex = evt['periodIndex'];
        if (goog.isDef(periodIndex) && isNaN(this.lastHoveredPeriodIndex_))
          this.lastHoveredPeriodIndex_ = periodIndex;

        //this condition fixes multiple edit controls appearance on quick mouse move.
        if (this.lastHoveredBarItemId_ != id && this.lastHoveredPeriodIndex_ != periodIndex) {
          this.clearEdit_(true);
          this.lastHoveredBarItemId_ = id;
          if (goog.isDef(periodIndex))
            this.lastHoveredPeriodIndex_ = periodIndex;
        }

        if (tag.bounds) {
          if (tag.type != anychart.enums.TLElementTypes.BASELINE_PROGRESS)
            this.drawEditPreview_(tag.type, tag.bounds, tag.item, periodIndex);
          // Drawing progress
          if (dataItem) {
            if (tag.type == anychart.enums.TLElementTypes.TASKS || tag.type == anychart.enums.TLElementTypes.GROUPING_TASKS ||
                tag.type == anychart.enums.TLElementTypes.PROGRESS) {
              this.drawEditProgress_(tag.type, tag.bounds, tag.item);
            } else if (tag.type == anychart.enums.TLElementTypes.BASELINES || tag.type == anychart.enums.TLElementTypes.BASELINE_PROGRESS) {
              this.drawEditBaselineProgress_(tag.type, tag.bounds, tag.item);
            }
          } else {
            this.getEditProgressPath_().clear();
            this.getEditBaselineProgressPath_().clear();
          }

          // Drawing any resizeable bar
          if (dataItem && tag.type != anychart.enums.TLElementTypes.MILESTONES && tag.type != anychart.enums.TLElementTypes.MILESTONES_PREVIEW) {
            this.drawEditThumbs_(tag.type, tag.bounds, tag.item, periodIndex);
          } else {
            this.getEditLeftThumbPath_().clear();
            this.getEditRightThumbPath_().clear();
          }

          // Drawing connectors thumbs
          if (dataItem && tag.type != anychart.enums.TLElementTypes.BASELINES && tag.type != anychart.enums.TLElementTypes.MILESTONES_PREVIEW) {
            var ind = evt['hoveredIndex'] + this.controller.startIndex();
            this.drawConnectorsEditThumbs_(tag.type, ind, tag.bounds, tag.item, periodIndex);
          } else {
            this.getEditFinishConnectorPath_().clear();
            this.getEditStartConnectorPath_().clear();
          }
        }
      } else {
        if (domTarget && (!domTarget.tag || !domTarget.tag.isEdit)) {
          /*
            If domTarget is range (text, line) marker, it also has own tag, we have to
            consider this case and check whether domTarget is edit control.
            This condition allows to:
              - hide edit controls on element mouse leave
              - hide edit controls when text-line-range marker is under the mouse on element leave
              - leave edit controls if control itself is hovered (prevents edit control blinking)
           */
          this.clearEdit_(true);
        }
      }

      var connEvent = this.patchConnectorEvent_(evt);
      if (connEvent) {
        this.interactivityHandler.dispatchEvent(connEvent);
        this.hoveredConnector_ = domTarget.meta;
      } else if (this.hoveredConnector_) {
        connEvent = this.patchConnectorMouseOutEvent_(evt);
        this.interactivityHandler.dispatchEvent(connEvent);
        this.hoveredConnector_ = null;
      }
    } else {
      this.clearEdit_(false);
    }
  }
};


/**
 *
 * @param {?Object} evt - Event object.
 * @param {anychart.core.MouseEvent} originalEvent - Original event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawEditConnector_ = function(evt, originalEvent) {
  if (evt && this.currentConnectorDragger_) {
    var orig = evt['originalEvent'];
    var domTarget = orig['domTarget'];

    if (domTarget && domTarget.tag && domTarget.tag.isElement) {
      var tag = /** @type {anychart.ganttModule.TimeLine.Tag} */ (domTarget.tag);
      var destinationDataItem = tag.item;

      if (tag.type != anychart.enums.TLElementTypes.BASELINES &&
          tag.type != anychart.enums.TLElementTypes.CONNECTORS &&
          tag.type != anychart.enums.TLElementTypes.MILESTONES_PREVIEW) {
        var editTag = /** @type {anychart.ganttModule.TimeLine.EditTag} */ (this.currentConnectorDragger_.element.tag);
        var startItem = editTag.item;
        var startIndex = editTag.index;

        var period = evt['period'];
        var periodIndex = evt['periodIndex'];

        var from, to;
        if (period) {
          var startPeriod = editTag.period;
          var startPeriodIndex = editTag.periodIndex;
          from = {
            'item': startItem,
            'period': startPeriod,
            'index': startIndex,
            'periodIndex': startPeriodIndex
          };
          to = {
            'item': destinationDataItem,
            'period': period,
            'index': evt['hoveredIndex'] + this.controller.startIndex(),
            'periodIndex': periodIndex
          };
        } else {
          from = {'item': startItem, 'index': startIndex};
          to = {'item': destinationDataItem, 'index': evt['hoveredIndex'] + this.controller.startIndex()};
        }

        var left = originalEvent.clientX - this.container().getStage().getClientPosition().x;
        var elBounds = tag.bounds;
        var dropRatio = (left - elBounds.left) / elBounds.width;
        var startStart = this.currentConnectorDragger_.isStart;
        var dropStart = dropRatio < .5;
        var connType;
        if (startStart) {
          connType = dropStart ?
              anychart.enums.ConnectorType.START_START :
              anychart.enums.ConnectorType.START_FINISH;
        } else {
          connType = dropStart ?
              anychart.enums.ConnectorType.FINISH_START :
              anychart.enums.ConnectorType.FINISH_FINISH;
        }

        this.getEditConnectorPreviewPath_().clear();
        this.connectItems_(from, to, connType, void 0, this.getEditConnectorPreviewPath_());
      } else {
        this.drawConnectorPreview_(originalEvent);
      }
    } else {
      this.drawConnectorPreview_(originalEvent);
    }
  } else {
    this.drawConnectorPreview_(originalEvent);
  }
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.rowMouseDown = function(evt) {
  this.mouseDown(evt);
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.rowMouseUp = function(evt) {
  this.tooltip().enabled(this.tooltipEnabledBackup_);
  this.tooltipEnabledBackup_ = void 0;
};


/**
 * Actually reacts on mouse down.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.TimeLine.prototype.mouseDown = function(evt) {
  if (this.elements().edit().getOption('enabled'))
    this.draggingItem = evt['item'];
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseDown = function(evt) {
  if (evt) {
    var connEvent = this.patchConnectorEvent_(evt);
    if (connEvent) {
      this.interactivityHandler.dispatchEvent(connEvent);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseUp = function(evt) {
  if (this.finishedDraggingConnector) {
    this.finishedDraggingConnector = false;
    if (evt) {
      var destinationItem = evt['item'];
      var destinationPeriodIndex = evt['periodIndex'];
      var originalEvent = evt['originalEvent'];
      var domTarget = originalEvent['domTarget'];
      var tag = domTarget ? domTarget.tag : void 0;
      if (tag && tag.isElement && tag.type != anychart.enums.TLElementTypes.BASELINES && tag.type != anychart.enums.TLElementTypes.MILESTONES_PREVIEW) {
        var left = originalEvent.clientX - this.container().getStage().getClientPosition().x;
        var elBounds = tag.bounds;
        var dropRatio = (left - elBounds.left) / elBounds.width;

        var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

        var startItem = circle.tag.item;
        var startPeriodIndex = circle.tag.periodIndex;

        var startStart = this.currentConnectorDragger_.isStart;
        var dropStart = dropRatio < .5;
        var connType;
        if (startStart) {
          connType = dropStart ? anychart.enums.ConnectorType.START_START : anychart.enums.ConnectorType.START_FINISH;
        } else {
          connType = dropStart ? anychart.enums.ConnectorType.FINISH_START : anychart.enums.ConnectorType.FINISH_FINISH;
        }

        this.addConnector(startItem, destinationItem, connType, startPeriodIndex, destinationPeriodIndex);
      }
    }
  }

  var connEvent = this.patchConnectorEvent_(evt);
  if (connEvent) {
    this.interactivityHandler.dispatchEvent(connEvent);
  } else {
    this.getEditConnectorPreviewPath_().clear();
  }

  this.draggingConnector = false;
  this.currentConnectorDragger_ = null;
  this.interactive = true;
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.mouseOutMove = function(e) {
  if (this.dragging && !this.draggingProgress && (this.scrollOffsetX || this.scrollOffsetY)) {
    var scrollX = 0;
    var scrollY = 0;
    if (this.scrollOffsetX)
      scrollX = this.scrollOffsetX > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;

    if ((this.draggingConnector || this.draggingItem) && this.scrollOffsetY) {
      scrollY = this.scrollOffsetY > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;
    }

    if (this.scroll(scrollX, scrollY, true)) {
      this.drawThumbPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX);
      this.drawConnectorPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX, this.scrollOffsetY);
    }
  }
};


//endregion
/**
 *
 * @param {anychart.enums.TLElementTypes} type - Type.
 * @return {anychart.ganttModule.elements.TimelineElement}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getElementByType_ = function(type) {
  switch (type) {
    case anychart.enums.TLElementTypes.ALL:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements());
    case anychart.enums.TLElementTypes.PERIODS:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.periods());
    case anychart.enums.TLElementTypes.TASKS:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.tasks());
    case anychart.enums.TLElementTypes.GROUPING_TASKS:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.groupingTasks());
    case anychart.enums.TLElementTypes.BASELINES:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.baselines());
    case anychart.enums.TLElementTypes.MILESTONES:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.milestones());
    case anychart.enums.TLElementTypes.MILESTONES_PREVIEW:
      return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.milestones().preview());
  }
  return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.elements());
};


/**
 * Defines type by item. Used to defined whether to draw connector.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @private
 * @return {anychart.ganttModule.elements.TimelineElement} - .
 */
anychart.ganttModule.TimeLine.prototype.getConnectionElementByItem_ = function(item) {
  if (this.controller.isResources()) {
    return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.periods());
  }
  if (anychart.ganttModule.BaseGrid.isProjectMilestone(item)) {
    return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.milestones());
  }
  if (anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
    return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.groupingTasks());
  }

  /*
    this.milestones().preview(), this.baselines(), progresses can't appear here.
   */
  return /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.tasks());
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.tooltip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.elements().tooltip(opt_value);
    return this;
  }
  return /** @type {!anychart.core.ui.Tooltip} */ (this.elements().tooltip());
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.getTooltipInternal = function(opt_value, opt_item, opt_periodIndex) {
  return /** @type {!anychart.core.ui.Tooltip} */ (opt_item ?
      this.getTooltipOfElementByItem(/** @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} */ (opt_item), opt_periodIndex) :
      this.tooltip());
};


/**
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - Index of period for resources chart case.
 * @return {anychart.core.ui.Tooltip} - Tooltip of element.
 */
anychart.ganttModule.TimeLine.prototype.getTooltipOfElementByItem = function(item, opt_periodIndex) {
  var el;

  if (goog.isDef(opt_periodIndex)) {
    var info = anychart.ganttModule.BaseGrid.getPeriodInfo(item, /** @type {number} */ (opt_periodIndex));
    el = info.isValidMilestone ? this.milestones() : this.periods();
  } else if (anychart.ganttModule.BaseGrid.isProjectMilestone(item)) {
    el = this.milestones();
  } else if (anychart.ganttModule.BaseGrid.isBaseline(item)) {
    el = this.baselines();
  } else if (anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
    el = this.groupingTasks();
  } else if (anychart.ganttModule.BaseGrid.isPeriod(item)) {
    /*
      This condition differs a bit from if (goog.isDef(opt_periodIndex)):
      No period can be hovered, but it still can remain Resources-timeline.
     */
    el = this.periods();
  } else {
    el = this.tasks();
  }
  return /** @type {anychart.core.ui.Tooltip} */ (el.tooltip());
};


/**
 * Creates connector.
 * If connector with same parameters already exists, nothing will happen.
 * If connector's data is incorrect, nothing will happen.
 * TODO (A.Kudryavtsev): Do we need to export this method?
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|number|string} startItem - Start data item or its ID.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|number|string} targetItem - Destination data item or its ID.
 * @param {anychart.enums.ConnectorType=} opt_type - Connection type. anychart.enums.ConnectorType.FINISH_START is default.
 * @param {number=} opt_startPeriodIndex - Index of start period.
 * @param {number=} opt_targetPeriodIndex - Index of destination period.
 * TODO (A.Kudryavtsev): Add connector coloring settings?
 * @return {anychart.ganttModule.TimeLine} - Itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.addConnector = function(startItem, targetItem, opt_type, opt_startPeriodIndex, opt_targetPeriodIndex) {
  opt_type = opt_type || anychart.enums.ConnectorType.FINISH_START;
  if (!((anychart.utils.instanceOf(startItem, anychart.treeDataModule.Tree.DataItem)) || (anychart.utils.instanceOf(startItem, anychart.treeDataModule.View.DataItem)))) {
    var soughtStart = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (startItem));
    startItem = soughtStart.length ? soughtStart[0] : null;
  }
  if (!startItem) return this; //TODO (A.Kudryavtsev): Add warning?

  if (!((anychart.utils.instanceOf(targetItem, anychart.treeDataModule.Tree.DataItem)) || (anychart.utils.instanceOf(targetItem, anychart.treeDataModule.View.DataItem)))) {
    var soughtTarget = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (targetItem));
    targetItem = soughtTarget.length ? soughtTarget[0] : null;
  }
  if (!targetItem) return this; //TODO (A.Kudryavtsev): Add warning?

  var to = anychart.enums.GanttDataFields.CONNECT_TO;
  var connType = anychart.enums.GanttDataFields.CONNECTOR_TYPE;

  //TODO (A.Kudryavtsev): Add checking of existing connector.
  this.controller.data().suspendSignalsDispatching();

  var conn, connectTo, connectorToBeAdded, connLength, oldConnector, oldConnectorVisualSettings, connEvent;
  var renewConnectorData = false;

  if (this.controller.isResources()) {
    var startPeriod = startItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_startPeriodIndex];
    var targetPeriod = targetItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_targetPeriodIndex];

    if (goog.isDef(startPeriod) && goog.isDef(targetPeriod)) {
      conn = startPeriod[anychart.enums.GanttDataFields.CONNECTOR];
      connectorToBeAdded = {};
      connectorToBeAdded[to] = targetPeriod[anychart.enums.GanttDataFields.ID];
      connectorToBeAdded[connType] = opt_type;
      if (conn) {
        if (goog.isArray(conn)) { //New behaviour.
          connLength = conn.length;
        } else { //Deprecated behaviour.
          oldConnectorVisualSettings = goog.object.clone(conn);
          oldConnector = {};
          oldConnector[to] = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          goog.object.extend(oldConnector, oldConnectorVisualSettings);
          connLength = 1;
          renewConnectorData = true;
        }
      } else {
        connectTo = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
        if (goog.isDef(connectTo)) { //Deprecated behaviour.
          oldConnector = {};
          oldConnector[to] = connectTo;
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          connLength = 1;
          renewConnectorData = true;
        } else { //New behaviour.
          connLength = 0;
        }
      }

      connEvent = {
        'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
        'target': targetItem,
        'source': startItem,
        'connectorType': opt_type,
        'targetPeriod': targetPeriod,
        'targetPeriodIndex': opt_targetPeriodIndex,
        'sourcePeriod': startPeriod,
        'sourcePeriodIndex': opt_startPeriodIndex
      };

      if (this.interactivityHandler.dispatchEvent(connEvent)) {
        if (renewConnectorData) {
          startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
              anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
        }
        startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
            anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
      }
    } //TODO (A.Kudryavtsev): Do we need to add some warning here?

  } else {
    conn = startItem.get(anychart.enums.GanttDataFields.CONNECTOR);
    connectorToBeAdded = {};
    connectorToBeAdded[to] = targetItem.get(anychart.enums.GanttDataFields.ID);
    connectorToBeAdded[connType] = opt_type;
    if (conn) {
      if (goog.isArray(conn)) { //New behaviour.
        connLength = conn.length;
      } else { //Deprecated behaviour.
        oldConnectorVisualSettings = goog.object.clone(/** @type {Object} */(conn));
        oldConnector = {};
        oldConnector[to] = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        goog.object.extend(oldConnector, oldConnectorVisualSettings);
        connLength = 1;
        renewConnectorData = true;
      }
    } else {
      connectTo = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
      if (goog.isDef(connectTo)) { //Deprecated behaviour.
        oldConnector = {};
        oldConnector[to] = connectTo;
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        connLength = 1;
        renewConnectorData = true;
      } else { //New behaviour.
        connLength = 0;
      }
    }

    connEvent = {
      'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
      'target': targetItem,
      'source': startItem,
      'connectorType': opt_type
    };

    if (this.interactivityHandler.dispatchEvent(connEvent)) {
      if (renewConnectorData) {
        startItem.set(anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
      }
      startItem.set(anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
    }
  }

  this.controller.data().resumeSignalsDispatching(true);

  return this;
};


/**
 * Handles row collapse/expand.
 * @param {Object} event - Dispatched event object.
 * @override
 */
anychart.ganttModule.TimeLine.prototype.rowExpandCollapse = function(event) {
  if (!this.checkConnectorDblClick(event)) {
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
  }
};


/**
 * Checks connector dbl click.
 * Used to double click the connector instead the row.
 * @param {Object} event - Dispatched event object.
 * @return {boolean} - Whether to dispatch event.
 */
anychart.ganttModule.TimeLine.prototype.checkConnectorDblClick = function(event) {
  var connEvent = this.patchConnectorEvent_(event);
  if (connEvent) {
    this.clearEdit_();
    this.interactivityHandler.dispatchEvent(connEvent);
    return true;
  }
  return false;
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 * @override
 */
anychart.ganttModule.TimeLine.prototype.rowSelect = function(event) {
  if (!this.checkRowSelection(event)) {
    this.connectorUnselect(event); // this dispatches conn unselect event.
    if (this.selectTimelineRow(event['item'], event['periodIndex'])) {
      var eventObj = goog.object.clone(event);
      eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
      (/** @type {anychart.ganttModule.IInteractiveGrid} */ (this.interactivityHandler)).dispatchEvent(eventObj);
    }
  }
};


/**
 * Additional action on row selection.
 * Used to select the connector instead the row.
 * @param {Object} event - Dispatched event object.
 * @return {boolean} - Whether to dispatch event.
 */
anychart.ganttModule.TimeLine.prototype.checkRowSelection = function(event) {
  var domTarget = (event && event['originalEvent']) ? event['originalEvent']['domTarget'] : null;
  //TODO (A.Kudryavtsev): domTarget.type or domTarget.tag.type?
  if (domTarget && domTarget.type == anychart.enums.TLElementTypes.CONNECTORS) {
    this.clearEdit_();
    var connClickEvent = this.patchConnectorEvent_(event);
    if (this.interactivityHandler.dispatchEvent(connClickEvent)) {
      var connSelectEvent = this.patchConnectorEvent_(event);
      connSelectEvent.type = anychart.enums.EventType.CONNECTOR_SELECT;

      if (this.interactivityHandler.selection().hasSelectedConnector())
        this.connectorUnselect(event['originalEvent']);

      if (this.interactivityHandler.dispatchEvent(connSelectEvent)) {
        this.interactivityHandler.rowUnselect(event['originalEvent']);
        var m = domTarget.meta;
        this.interactivityHandler.selection().selectConnector(
            m['fromItem'], m['toItem'],
            m['fromItemIndex'], m['toItemIndex'],
            m['fromPeriodIndex'], m['toPeriodIndex'],
            m['connType']
        );
        this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return true;
  }
  return false;
};


/**
 * Connector unselect handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.TimeLine.prototype.connectorUnselect = function(event) {
  var selection = this.interactivityHandler.selection();
  if (selection.hasSelectedConnector()) {
    var connEvent = this.getConnectorInteractivityEvent_(/** @type {anychart.core.MouseEvent} */ (event)); //empty event.
    connEvent.type = anychart.enums.EventType.CONNECTOR_SELECT;
    if (this.interactivityHandler.dispatchEvent(connEvent)) {
      selection.selectConnector(null);
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.getInteractivityEvent = function(event) {
  var evt = anychart.ganttModule.TimeLine.base(this, 'getInteractivityEvent', event);
  var target = (evt && evt['originalEvent']) ? evt['originalEvent']['domTarget'] : null;

  if (evt && target) {
    var bounds = this.getPixelBounds();
    var ratio = Math.abs(bounds.left - event.offsetX) / (bounds.width);
    var timestamp = this.scale().ratioToTimestamp(ratio);

    var elType;
    if (target.tag && goog.isDef(target.tag.type)) {
      elType = target.tag.type;
    }

    evt['hoverRatio'] = ratio;
    evt['hoverDateTime'] = timestamp;
    if (elType)
      evt['elementType'] = elType;

    if (this.controller.isResources() && target.tag) {
      evt['period'] = target.tag.period;
      evt['periodIndex'] = target.tag.periodIndex;
    }
  }

  return evt;
};


/**
 * Selects row and/or period.
 * @param {anychart.treeDataModule.Tree.DataItem} item - New selected data item.
 * @param {number=} opt_periodIndex - Index of period in item to be selected.
 * @return {boolean} - Whether has been selected.
 */
anychart.ganttModule.TimeLine.prototype.selectTimelineRow = function(item, opt_periodIndex) {
  var selection = this.interactivityHandler.selection();
  selection.selectPeriod(item, opt_periodIndex);
  if (selection.hasSelectedRow()) {
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


/**
 * Generates anychart.ganttModule.BaseGrid.Element.
 * @return {anychart.ganttModule.BaseGrid.Element}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.genElement_ = function() {
  var element;
  if (this.visElementsInUse_ < this.visElements_.length) {
    element = this.visElements_[this.visElementsInUse_++];
    element.reset();
  } else {
    element = new anychart.ganttModule.BaseGrid.Element();
    element.setParentEventTarget(this);
    this.visElements_.push(element);
    this.visElementsInUse_++;
  }
  element.parent(this.getDrawLayer());
  return element;
};


/**
 * Draws timeline bars.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawTimelineElements_ = function() {
  var els = this.initializeElements_();

  for (var j = 0; j < els.length; j++) {
    var element = els[j];
    if (!element.shapeManager)
      element.recreateShapeManager();
    element.shapeManager.clearShapes();
  }

  this.getDrawLayer().removeChildren();

  this.visElementsInUse_ = 0;
  this.markers().clear();

  if (this.controller.isResources()) {
    this.drawResourceTimeline_();
  } else {
    this.drawProjectTimeline_();
  }

  this.markers().draw();

  this.drawConnectors_();

  // Clearing remaining elements.
  for (var i = this.visElementsInUse_, l = this.visElements_.length; i < l; i++) {
    var el = this.visElements_[i];
    el.reset();
  }
};


/**
 * Draws data item's time markers.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawMarkers_ = function(dataItem, totalTop, itemHeight) {
  var markers = dataItem.get(anychart.enums.GanttDataFields.MARKERS);
  if (markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if (marker) {
        var val = dataItem.getMeta(anychart.enums.GanttDataFields.MARKERS, i, 'value');
        if (!goog.isNull(val)) {
          var ratio = this.scale_.timestampToRatio(val);
          if (ratio >= 0 && ratio <= 1) { //Marker is visible
            var height = itemHeight * anychart.ganttModule.TimeLine.DEFAULT_HEIGHT_REDUCTION;

            var left = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio);
            var top = Math.round(totalTop + itemHeight / 2);

            var markerEl = this.markers().add({value: {x: left, y: top}});
            markerEl.setOption('size', height / 2);
            markerEl.setup(marker);
          }
        }
      }
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.drawRowFills = function() {
  //this hides TL elements from top when header is invisible.
  var clip = anychart.ganttModule.TimeLine.base(this, 'drawRowFills');
  clip.top += /** @type {number} */ (this.headerHeight());
  this.getDrawLayer().clip(clip);
  return clip;
};


/**
 * Internal resource timeline drawer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawResourceTimeline_ = function() {
  if (this.periods().getOption('enabled')) {
    var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
    var visibleItems = this.controller.getVisibleItems();
    for (var i = /** @type {number} */(this.controller.startIndex()); i <= /** @type {number} */(this.controller.endIndex()); i++) {
      var item = visibleItems[i];
      if (!item) break;

      var itemHeight = this.controller.getItemHeight(item);
      var newTop = /** @type {number} */ (totalTop + itemHeight);

      this.drawAsPeriods_(item, totalTop, itemHeight);
      this.drawMarkers_(item, totalTop, itemHeight);

      totalTop = (newTop + this.rowStrokeThickness);
    }
  }
};


/**
 * Internal project timeline drawer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawProjectTimeline_ = function() {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
  var visibleItems = this.controller.getVisibleItems();

  for (var i = /** @type {number} */(this.controller.startIndex()); i <= /** @type {number} */(this.controller.endIndex()); i++) {
    var item = visibleItems[i];
    if (!item) break;

    var itemHeight = this.controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    if (anychart.ganttModule.BaseGrid.isBaseline(item)) {
      this.drawAsBaseline_(item, totalTop, itemHeight);
    } else if (anychart.ganttModule.BaseGrid.isGroupingTask(item) || item.get(anychart.enums.GanttDataFields.IS_LOADABLE)) {
      this.drawAsParent_(item, totalTop, itemHeight);
    } else if (anychart.ganttModule.BaseGrid.isProjectMilestone(item)) {
      this.drawAsMilestone_(item, totalTop, itemHeight);
    } else {
      this.drawAsProgress_(item, totalTop, itemHeight);
    }

    this.drawMarkers_(item, totalTop, itemHeight);

    totalTop = (newTop + this.rowStrokeThickness);
  }
};


/**
 * Limits progress bar width (DVF-4324).
 * @param {number} progressValue - Progress ratio value.
 * @param {number} width - Element with that progress belongs to.
 * @param {anychart.ganttModule.elements.ProgressElement} el - related
 * @return {number} - Limited width.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.limitProgressWidth_ = function(progressValue, width, el) {
  var drawOverEnd = el.getOption('drawOverEnd');
  var w = progressValue * width;
  return drawOverEnd ? w : Math.min(w, width);
};


/**
 * Gets bar bounds.
 * @param {anychart.ganttModule.elements.TimelineElement} element - Element.
 * @param {anychart.math.Rect} itemBounds - Full item bounds. Left and width must be taken
 *  from scale transformed values, top and height are values from item's position in grid.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Element point data.
 * @param {boolean=} opt_considerBaseline - Whether to consider baseline appearance in itemBounds.
 * @param {number=} opt_periodIndex - Period index.
 * @return {anychart.math.Rect} - Bar bounds considering anchor/position settings.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getBarBounds_ = function(element, itemBounds, dataItem, opt_considerBaseline, opt_periodIndex) {
  var fixParentHeight = element.getType() == anychart.enums.TLElementTypes.GROUPING_TASKS;
  var optionHeight = /** @type {string|number} */ (element.getHeight(dataItem, opt_periodIndex));
  var height = opt_considerBaseline || fixParentHeight ? itemBounds.height / 2 : itemBounds.height;
  var barHeight = anychart.utils.normalizeSize(optionHeight, height);
  var anchor = /** @type {anychart.enums.Anchor} */ (element.getOption('anchor'));
  var position = /** @type {anychart.enums.Position} */ (element.getOption('position'));
  var offset = /** @type {number|string} */ (element.getOption('offset'));
  var offsetNorm = anychart.utils.normalizeSize(offset, itemBounds.height);
  if (anchor == anychart.enums.Anchor.AUTO) {
    anchor = this.resolveAutoAnchorByType_(position, element.getType(), opt_considerBaseline);
  }

  var coord = anychart.utils.getCoordinateByAnchor(itemBounds, position);
  var top = this.fixBarTop_(coord.y, barHeight, anchor) + offsetNorm;
  return new anychart.math.Rect(coord.x, top, itemBounds.width, barHeight);
};


/**
 * Fixes bounds with current stroke thickness.
 * @param {anychart.ganttModule.elements.TimelineElement} element - Element.
 * @param {anychart.math.Rect} bounds - Bounds to fix.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - .
 * @param {number=} opt_periodIndex - .
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @private
 * @return {anychart.math.Rect} - Fixed bounds.
 */
anychart.ganttModule.TimeLine.prototype.fixBounds_ = function(element, bounds, item, opt_periodIndex, opt_selected) {
  var state = opt_selected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;
  var stroke = element.getStroke(item, state, opt_periodIndex);
  var thickness = anychart.utils.extractThickness(stroke);
  var pixelShift = (thickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  var roundLeft = Math.round(bounds.left) + pixelShift;
  var roundTop = Math.round(bounds.top) + pixelShift;
  var roundRight = Math.round(bounds.left + bounds.width) + pixelShift;
  var roundHeight = Math.round(bounds.top + bounds.height) + pixelShift;
  return new anychart.math.Rect(roundLeft, roundTop, roundRight - roundLeft, roundHeight - roundTop);
};


/**
 * Sets calculated bounds to item meta.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item.
 * @param {anychart.math.Rect} bounds - Bounds to set.
 * @param {number=} opt_periodIndex - Period index.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.setRelatedBounds_ = function(item, bounds, opt_periodIndex) {
  this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
  if (goog.isDef(opt_periodIndex)) {
    if (!goog.isArray(item.meta('periodBounds'))) {
      item.setMeta('periodBounds', []);
    }
    item.setMeta('periodBounds', opt_periodIndex, bounds);
  } else {
    item.meta('relBounds', bounds);
  }
  this.controller.data().resumeSignalsDispatching(false);
};


/**
 * Draws single element's start or end marker.
 *
 * @param {anychart.ganttModule.elements.MarkerConfig} marker - Marker instance.
 * @param {{ x: number, y: number}} position - Marker position.
 * @param {acgraph.vector.Fill} elementFill - Fill value resolved from element.
 * @param {acgraph.vector.Stroke} elementStroke - Stroke value resolved from element.
 * @param {Object=} opt_pointSettings - Point settings config, can be undefined.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawSingleMarker_ = function(marker, position, elementFill, elementStroke, opt_pointSettings) {
  var config = opt_pointSettings || marker.getFlatConfig();
  if (config['enabled']) {
    var markerEl = this.markers().add({ value: position });

    var isMissingFill = !('fill' in config);
    var isMissingStroke = !('stroke' in config);
    if (isMissingFill || isMissingStroke) {
      config = goog.object.clone(config);

      if (isMissingFill) {
        config['fill'] = anychart.color.lighten(elementFill);
      }
      if (isMissingStroke) {
        config['stroke'] = anychart.color.lighten(elementStroke);
      }
    }

    markerEl.setup(config);
  }
};


/**
 * Draws single element's start and end markers.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Current tree data item.
 * @param {anychart.ganttModule.elements.TimelineElement} element - Related timeline element.
 * @param {anychart.math.Rect} bounds - Item's bounds.
 * @param {number=} opt_periodIndex - Period index.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawStartEndMarkers_ = function(item, element, bounds, opt_periodIndex) {
  var pointSettings = element.getPointSettings(item, opt_periodIndex);
  var startMarkerConfig = pointSettings && pointSettings[anychart.enums.GanttDataFields.START_MARKER];
  var endMarkerConfig = pointSettings && pointSettings[anychart.enums.GanttDataFields.END_MARKER];
  var top = bounds.top + bounds.height / 2;
  var startMarkerPosition = { x: bounds.left, y: top };
  var endMarkerPosition = { x: bounds.left + bounds.width, y: top };
  var fill = element.getFill(item, anychart.PointState.NORMAL, opt_periodIndex);
  var stroke = element.getStroke(item, anychart.PointState.NORMAL, opt_periodIndex);
  var startMarker = /** @type {anychart.ganttModule.elements.MarkerConfig} */ (element.startMarker());
  var endMarker = /** @type {anychart.ganttModule.elements.MarkerConfig} */ (element.endMarker());

  this.drawSingleMarker_(startMarker, startMarkerPosition, fill, stroke, startMarkerConfig);
  this.drawSingleMarker_(endMarker, endMarkerPosition, fill, stroke, endMarkerConfig);
};


/**
 * Draws data item as periods.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsPeriods_ = function(dataItem, totalTop, itemHeight) {
  var periods = /** @type {Array.<Object>} */(dataItem.get(anychart.enums.GanttDataFields.PERIODS));
  if (periods) {
    for (var j = 0; j < periods.length; j++) {
      var info = anychart.ganttModule.BaseGrid.getPeriodInfo(dataItem, j);
      var start = info.start;
      var end = info.end;

      if (info.isValidPeriod) {
        var startRatio = this.scale_.timestampToRatio(start);
        var endRatio = this.scale_.timestampToRatio(end);

        if (endRatio > 0 && startRatio < 1) { //Is visible
          var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
          var right = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
          var width = right - left;
          var el = /** @type {anychart.ganttModule.elements.PeriodsElement} */ (this.periods());

          var optionHeight = /** @type {string|number} */ (el.getOption('height'));
          var height = anychart.utils.normalizeSize(optionHeight, itemHeight);

          var itemBounds = new anychart.math.Rect(left, totalTop, width, itemHeight);
          var anchor = /** @type {anychart.enums.Anchor} */ (el.getOption('anchor'));
          var position = /** @type {anychart.enums.Position} */ (el.getOption('position'));
          if (anchor == anychart.enums.Anchor.AUTO) {
            anchor = this.resolveAutoAnchorByType_(position, anychart.enums.TLElementTypes.PERIODS);
          }

          var offset = /** @type {number|string} */ (el.getOption('offset'));
          var offsetNorm = anychart.utils.normalizeSize(offset, itemHeight);

          var coord = anychart.utils.getCoordinateByAnchor(itemBounds, position);
          var top = this.fixBarTop_(coord.y, height, anchor) + offsetNorm;
          var isSelected = this.interactivityHandler.selection().isPeriodSelected(dataItem, j);

          var bounds = this.fixBounds_(el, new anychart.math.Rect(coord.x, top, width, height), dataItem, j, isSelected);

          var tag = this.createTag(dataItem, el, bounds, j);
          this.setRelatedBounds_(dataItem, bounds, j);
          el.rendering().callDrawer(dataItem, bounds, tag, j, isSelected);
          this.drawStartEndMarkers_(dataItem, el, bounds, j);
        }
      } else if (info.isValidMilestone) {
        this.drawAsMilestone_(dataItem, totalTop, itemHeight, info, j);
      }
    }
  }
};


/**
 * Draws data item as baseline.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsBaseline_ = function(dataItem, totalTop, itemHeight) {
  var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(dataItem);

  var isParent = info.isLoadable || anychart.ganttModule.BaseGrid.isGroupingTask(dataItem);
  var element = /** @type {anychart.ganttModule.elements.GroupingTasksElement|anychart.ganttModule.elements.TasksElement} */ (isParent ? this.groupingTasks() : this.tasks());
  var baselines = /** @type {anychart.ganttModule.elements.BaselinesElement} */ (this.baselines());
  var isSelected = this.interactivityHandler.selection().isRowSelected(dataItem);

  var actualStart = info.start;
  var actualEnd = info.end;

  if (isParent) {
    // Lines below allow to draw parent as flat grouping task on fields missing.
    actualEnd = isNaN(actualEnd) ? actualStart : actualEnd;
    actualStart = isNaN(actualStart) ? actualEnd : actualStart;
  }

  var baselineStart = info.baselineStart;
  var baselineEnd = info.baselineEnd;

  var actualStartRatio = this.scale_.timestampToRatio(actualStart);
  var actualEndRatio = this.scale_.timestampToRatio(actualEnd);
  var baselineStartRatio = this.scale_.timestampToRatio(baselineStart);
  var baselineEndRatio = this.scale_.timestampToRatio(baselineEnd);

  var isElementEnabled = element.getOption('enabled');

  // DVF-4389.
  var considerElement = baselines.getOption('disableWithRelatedTask');
  var isBaselineEnabled = baselines.getOption('enabled') && (considerElement ? isElementEnabled : true);

  var actualPresents = (actualEndRatio > 0 && actualStartRatio < 1 && isElementEnabled); // ratios can contain NaNs
  var baselinePresents = (baselineEndRatio > 0 && baselineStartRatio < 1 && isBaselineEnabled); // ratios can contain NaNs

  if (actualPresents || baselinePresents) {
    var b = this.pixelBoundsCache;

    var actualBounds, baselineBounds;
    if (actualPresents) {
      var actualLeft = b.left + b.width * actualStartRatio;
      var actualRight = b.left + b.width * actualEndRatio;
      var actualWidth = actualRight - actualLeft;
      var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
      actualBounds = this.getBarBounds_(element, actualItemBounds, dataItem, true);
    }

    if (baselinePresents) {
      var baselineLeft = b.left + b.width * baselineStartRatio;
      var baselineRight = b.left + b.width * baselineEndRatio;
      var baselineWidth = baselineRight - baselineLeft;
      var baselineItemBounds = new anychart.math.Rect(baselineLeft, totalTop, baselineWidth, itemHeight);
      baselineBounds = this.getBarBounds_(baselines, baselineItemBounds, dataItem, true);
    }

    if (actualBounds && baselineBounds) {
      this.fixBaselineBarsPositioning_(actualBounds, baselineBounds, element, dataItem);
    }

    if (baselineBounds) {
      baselineBounds = this.fixBounds_(baselines, baselineBounds, dataItem, void 0, isSelected);
      var baselineTag = this.createTag(dataItem, baselines, baselineBounds);
      baselines.rendering().callDrawer(dataItem, baselineBounds, baselineTag, void 0, isSelected);
      this.drawStartEndMarkers_(dataItem, baselines, baselineBounds);
    }

    if (actualBounds) {
      if (isParent && !actualBounds.width) {
        var h = actualBounds.height;
        actualBounds.left -= h / 2;
        actualWidth = h;
        actualBounds.width = actualWidth;
        info.isValidTask = true;
      }
      actualBounds = this.fixBounds_(element, actualBounds, dataItem, void 0, isSelected);
      var tag = this.createTag(dataItem, element, actualBounds);

      if (isParent) {
        if (this.milestones().preview().getOption('enabled') && this.milestones().preview().getOption('depth') != 0)
          this.iterateChildMilestones_(0, dataItem, totalTop, itemHeight, goog.getUid(dataItem));
      }
      this.setRelatedBounds_(dataItem, actualBounds);

      /*
        This condition allows to skip drawing of "actual"-bar with incorrect
        start and end values, and keep "baseline"-bar drawn.
        Despite "actual"-bar has invalid values (it means that actualBounds
        has NaN actualBounds.left and actualBounds.width values),
        fixBaselineBarsPositioning_() uses only actualBounds.top and actualBounds.height
        and doesn't break baseline bar correct drawing.
       */
      if (info.isValidTask) {
        element.rendering().callDrawer(dataItem, actualBounds, tag, void 0, isSelected);
        this.drawStartEndMarkers_(dataItem, element, actualBounds);

        var progressEl = /** @type {anychart.ganttModule.elements.ProgressElement} */ (element.progress());
        if (info.isValidProgress && progressEl.getOption('enabled')) { //Draw progress.
          var progressValue = info.progress;
          var progressWidth = this.limitProgressWidth_(/** @type {number} */ (progressValue), actualBounds.width, progressEl);
          var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
          var progressBounds = this.getBarBounds_(progressEl, progressItemBounds, dataItem);
          var progressTag = this.createTag(dataItem, progressEl, progressBounds);
          progressEl.rendering().callDrawer(dataItem, progressBounds, progressTag, void 0, isSelected);
          if (progressWidth) {
            this.drawStartEndMarkers_(dataItem, progressEl, progressBounds);
          }
        }
      }
    }

    var baselineProgressBounds;
    if (baselineBounds) {
      baselineProgressBounds = baselineBounds;
    } else if (actualBounds) {
      baselineProgressBounds = actualBounds.clone();
      baselineProgressBounds.top = totalTop;
      baselineProgressBounds.height = itemHeight;
      baselineProgressBounds = this.getBarBounds_(baselines, baselineProgressBounds, dataItem, true);

      //TODO (A.Kudryavtsev): This is kind of dirty hack, needs to be reworked.
      baselineProgressBounds.top += 0.5;

      this.fixBaselineBarsPositioning_(actualBounds, baselineProgressBounds, element, dataItem);
    }

    if (baselineProgressBounds) {
      var blProgressEl = /** @type {anychart.ganttModule.elements.ProgressElement} */ (baselines.progress());
      if (info.baselineProgressPresents && blProgressEl.getOption('enabled')) { //Draw baseline progress.
        var blProgressValue = info.baselineProgress;
        var blProgressWidth = this.limitProgressWidth_(/** @type {number} */ (blProgressValue), baselineProgressBounds.width, blProgressEl);
        var blProgressItemBounds = new anychart.math.Rect(baselineProgressBounds.left, baselineProgressBounds.top, blProgressWidth, baselineProgressBounds.height);
        var blProgressBounds = this.getBarBounds_(blProgressEl, blProgressItemBounds, dataItem);
        var blProgressTag = this.createTag(dataItem, blProgressEl, blProgressBounds);
        blProgressEl.rendering().callDrawer(dataItem, blProgressBounds, blProgressTag, void 0, isSelected);
        if (blProgressWidth) {
          this.drawStartEndMarkers_(dataItem, blProgressEl, blProgressBounds);
        }
      }
    }
  }
};


/**
 * Fixes bars positioning considering baseline.
 * Allows to avoid bar and baseline intersection for auto anchor case.
 * @param {anychart.math.Rect} barBounds - .
 * @param {anychart.math.Rect} baselineBounds - .
 * @param {anychart.ganttModule.elements.TasksElement|anychart.ganttModule.elements.GroupingTasksElement} element - .
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Current tree data item.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.fixBaselineBarsPositioning_ = function(barBounds, baselineBounds, element, item) {
  var barAnchor = /** @type {anychart.enums.Anchor} */ (element.getOption('anchor'));
  var barPosition = /** @type {anychart.enums.Position} */ (element.getOption('position'));
  var baselineAnchor = /** @type {anychart.enums.Anchor} */ (this.baselines().getOption('anchor'));
  var baselinePosition = /** @type {anychart.enums.Position} */ (this.baselines().getOption('position'));

  if ((barAnchor == baselineAnchor) && (barPosition == baselinePosition)) {
    if (barAnchor == anychart.enums.Anchor.AUTO)
      barAnchor = this.resolveAutoAnchorByType_(barPosition, element.getType(), true);
    if (baselineAnchor == anychart.enums.Anchor.AUTO)
      baselineAnchor = this.resolveAutoAnchorByType_(baselinePosition, this.baselines().getType(), true);

    var baselineStroke = this.baselines().getStroke(item, anychart.PointState.NORMAL);
    var barStroke = element.getStroke(item, anychart.PointState.NORMAL);

    var barStrokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (barStroke)) / 2;
    var baselineStrokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (baselineStroke)) / 2;
    var strokes = barStrokeThickness + baselineStrokeThickness;

    if (barAnchor == baselineAnchor) {
      if (this.baselines().getOption('above')) {
        if (anychart.utils.isTopAnchor(barAnchor)) {
          barBounds.top += (baselineBounds.height + strokes);
        } else {
          baselineBounds.top -= (barBounds.height + strokes);
        }
      } else {
        if (anychart.utils.isTopAnchor(barAnchor)) {
          baselineBounds.top += (barBounds.height + strokes);
        } else {
          barBounds.top -= (baselineBounds.height + strokes);
        }
      }
    }
  }
};


/**
 * Draws data item as parent.
 * TODO (A.Kudryavtsev): Think of pixel shift rounding.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsParent_ = function(dataItem, totalTop, itemHeight) {
  var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(dataItem);

  if (this.groupingTasks().getOption('enabled') && (info.isValidTask || info.isFlatGroupingTask || info.isLoadable)) {
    if (this.milestones().preview().getOption('enabled') && this.milestones().preview().getOption('depth') != 0)
      this.iterateChildMilestones_(0, dataItem, totalTop, itemHeight, goog.getUid(dataItem));

    var actualStart = info.start;
    var actualEnd = info.end;

    // Lines below allow to draw parent as flat grouping task on fields missing.
    actualEnd = isNaN(actualEnd) ? actualStart : actualEnd;
    actualStart = isNaN(actualStart) ? actualEnd : actualStart;

    var startRatio = this.scale_.timestampToRatio(actualStart);
    var endRatio = this.scale_.timestampToRatio(actualEnd);

    if (endRatio > 0 && startRatio < 1) { //Is visible
      var b = this.pixelBoundsCache;
      var el = /** @type {anychart.ganttModule.elements.GroupingTasksElement} */ (this.groupingTasks());
      var actualLeft = b.left + b.width * startRatio;
      var actualRight = b.left + b.width * endRatio;
      var actualWidth = actualRight - actualLeft;
      var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
      var actualBounds = this.getBarBounds_(el, actualItemBounds, dataItem);

      if (!actualBounds.width) {
        var h = actualBounds.height;
        actualBounds.left -= h / 2;
        actualWidth = h;
        actualBounds.width = actualWidth;
      }

      var isSelected = this.interactivityHandler.selection().isRowSelected(dataItem);
      actualBounds = this.fixBounds_(el, actualBounds, dataItem, void 0, isSelected);

      var tag = this.createTag(dataItem, el, actualBounds);
      this.setRelatedBounds_(dataItem, actualBounds);
      el.rendering().callDrawer(dataItem, actualBounds, tag, void 0, isSelected);
      this.drawStartEndMarkers_(dataItem, el, actualBounds);

      var progressEl = /** @type {anychart.ganttModule.elements.ProgressElement} */ (el.progress());
      if (info.isValidProgress && progressEl.getOption('enabled')) { //Draw progress.
        var progressValue = info.progress;
        var progressWidth = this.limitProgressWidth_(/** @type {number} */ (progressValue), actualWidth, progressEl);
        var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
        var progressBounds = this.getBarBounds_(progressEl, progressItemBounds, dataItem);
        var progressTag = this.createTag(dataItem, progressEl, progressBounds);
        progressEl.rendering().callDrawer(dataItem, progressBounds, progressTag, void 0, isSelected);
        if (progressWidth) {
          this.drawStartEndMarkers_(dataItem, progressEl, progressBounds);
        }
      }
    }
  }
};


/**
 * Draws data item as milestone preview on grouping task.
 * @param {number} depth - Current depth.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @param {number} initializerUid - UID of item that has initialized the milestone preview drawing.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.iterateChildMilestones_ = function(depth, item, totalTop, itemHeight, initializerUid) {
  var depthOption = this.milestones().preview().getOption('depth');
  var depthMatches = !goog.isDefAndNotNull(depthOption) || //null or undefined value will display ALL submilestones of parent.
      (depth <= depthOption);

  if (depthMatches) {
    if (anychart.ganttModule.BaseGrid.isProjectMilestone(item)) {
      this.drawAsMilestone_(item, totalTop, itemHeight, void 0, void 0, initializerUid);
    } else if (anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
      for (var i = 0; i < item.numChildren(); i++) {
        var child = /** @type {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} */ (item.getChildAt(i));
        this.iterateChildMilestones_(depth + 1, child, totalTop, itemHeight, initializerUid);
      }
    }
  }
};


/**
 * Draws data item as progress.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsProgress_ = function(dataItem, totalTop, itemHeight) {
  var info = anychart.ganttModule.BaseGrid.getProjectItemInfo(dataItem);
  var el = /** @type {anychart.ganttModule.elements.TasksElement} */ (this.tasks());

  if (el.getOption('enabled') && info.isValidTask) {
    var actualStart = info.start;
    var actualEnd = info.end;

    var startRatio = this.scale_.timestampToRatio(actualStart);
    var endRatio = this.scale_.timestampToRatio(actualEnd);

    if (endRatio > 0 && startRatio < 1) { //Is visible
      var b = this.pixelBoundsCache;
      var actualLeft = b.left + b.width * startRatio;
      var actualRight = b.left + b.width * endRatio;
      var actualWidth = actualRight - actualLeft;
      var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
      var actualBounds = this.getBarBounds_(el, actualItemBounds, dataItem);

      var isSelected = this.interactivityHandler.selection().isRowSelected(dataItem);
      actualBounds = this.fixBounds_(el, actualBounds, dataItem, void 0, isSelected);

      var tag = this.createTag(dataItem, el, actualBounds);
      this.setRelatedBounds_(dataItem, actualBounds);
      el.rendering().callDrawer(dataItem, actualBounds, tag, void 0, isSelected);
      this.drawStartEndMarkers_(dataItem, el, actualBounds);

      var progressEl = /** @type {anychart.ganttModule.elements.ProgressElement} */ (el.progress());
      if (info.isValidProgress && progressEl.getOption('enabled')) { //Draw progress.
        var progressValue = info.progress;
        var progressWidth = this.limitProgressWidth_(/** @type {number} */ (progressValue), actualWidth, progressEl);
        var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
        var progressBounds = this.getBarBounds_(progressEl, progressItemBounds, dataItem);
        var progressTag = this.createTag(dataItem, progressEl, actualBounds);
        progressEl.rendering().callDrawer(dataItem, progressBounds, progressTag, void 0, isSelected);
        if (progressWidth) {
          this.drawStartEndMarkers_(dataItem, progressEl, progressBounds);
        }
      }

    }
  }
};


/**
 * Draws data item or period or preview as milestone.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @param {(anychart.ganttModule.BaseGrid.ProjectItemData|anychart.ganttModule.BaseGrid.PeriodData)=} opt_info -
 *  Calculated item info.
 * @param {number=} opt_periodIndex - Period index for resources milestone case.
 * @param {number=} opt_initializerUid - UID of item that has initialized the milestone preview drawing. If is
 *  defined, milestones-preview will be drawn.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsMilestone_ = function(
    dataItem,
    totalTop,
    itemHeight,
    opt_info,
    opt_periodIndex,
    opt_initializerUid
) {
  var el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (goog.isDef(opt_initializerUid) ?
      this.milestones().preview() :
      this.milestones());

  opt_info = goog.isDefAndNotNull(opt_info) ?
      opt_info :
      (goog.isDef(opt_periodIndex) ?
          anychart.ganttModule.BaseGrid.getPeriodInfo(dataItem, opt_periodIndex) :
          anychart.ganttModule.BaseGrid.getProjectItemInfo(dataItem)
      );

  var timestamp = this.controller.isResources() ?
      opt_info.milestoneTimestamp :
      opt_info.start;

  this.drawAsCommonMilestone_(el, timestamp, dataItem, totalTop, itemHeight, opt_periodIndex, opt_initializerUid);
};


/**
 * Draws milestone in common way - it doesn't depend on timeline's
 * chart type (project or resource).
 *
 * Drawing milestones on resources chart appears since DVF-4405.
 *
 * @param {anychart.ganttModule.elements.TimelineElement} el - Related timeline element.
 *  In current implementation can be milestones() or milestones().preview().
 * @param {number} timestamp - Timestamp value where to draw milestone.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Related
 *  data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @param {number=} opt_periodIndex - For resource milestone case, index of period to
 *  be drawn as milestone.
 * @param {number=} opt_initializerUid - For project milestone case, specific UID needed to draw
 *  the milestone preview on grouping task correctly.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsCommonMilestone_ = function(
    el,
    timestamp,
    dataItem,
    totalTop,
    itemHeight,
    opt_periodIndex,
    opt_initializerUid
) {
  var ratio = this.scale_.timestampToRatio(timestamp);
  if (ratio >= 0 && ratio <= 1 && el.getOption('enabled')) {
    var stroke = el.getStroke(dataItem, anychart.PointState.NORMAL);

    var lineThickness = anychart.utils.isNone(stroke) ? 0 :
        goog.isString(stroke) ? 1 :
            stroke['thickness'] ? stroke['thickness'] : 1;

    var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;
    var optionHeight = /** @type {string|number} */ (el.getHeight(dataItem, opt_periodIndex));
    var height = anychart.utils.normalizeSize(optionHeight, itemHeight);
    var halfHeight = Math.round(height / 2);
    var centerLeft = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio) + pixelShift;
    var itemBounds = new anychart.math.Rect(centerLeft - halfHeight, totalTop, height, itemHeight);
    var bounds = this.getBarBounds_(el, itemBounds, dataItem, void 0, opt_periodIndex);

    var isSelected = goog.isDef(opt_periodIndex) ?
        this.interactivityHandler.selection().isPeriodSelected(dataItem, opt_periodIndex) :
        this.interactivityHandler.selection().isRowSelected(dataItem);

    bounds = this.fixBounds_(el, bounds, dataItem, opt_periodIndex, isSelected);

    var tag = this.createTag(dataItem, el, bounds, opt_periodIndex);
    this.setRelatedBounds_(dataItem, bounds, opt_periodIndex);
    el.rendering().callDrawer(dataItem, bounds, tag, opt_periodIndex, isSelected, opt_initializerUid);
    /*
      Don't call this.drawStartEndMarkers_ because milestones-element has an ability
      to set start and end markers with API, but it must not be drawn.
     */

  }

};


/**
 * Actual top here means top pixel dimension of row on screen (including the row hidden by scroll).
 * @param {number} index - Linear index of item in controller's visible items.
 * @return {number}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getItemActualTop_ = function(index) {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1);
  var heightCache = this.controller.getHeightCache();
  var startIndex = this.controller.startIndex();
  var verticalOffset = this.controller.verticalOffset();

  //relativeHeight in this case is height of rows hidden over the top line of visible area (this.pixelBoundsCache)
  var relativeHeight = startIndex ? heightCache[startIndex - 1] : 0;
  relativeHeight += verticalOffset;

  //Lines below turn heights got from controller to Y-coordinates on screen.
  var relativeTop = index ? heightCache[index - 1] : 0;

  return (relativeTop - relativeHeight) + totalTop;
};


/**
 * Gets period or resource-milestone item bounds.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Data item.
 * @param {number} actualTop - @see caller args description.
 * @param {number} rowHeight - @see caller args description.
 * @param {number=} opt_periodIndex - Period index.
 * @return {anychart.math.Rect}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getResourceItemBounds_ = function(item, actualTop, rowHeight, opt_periodIndex) {
  var info = anychart.ganttModule.BaseGrid.getPeriodInfo(item, /** @type {number} */ (opt_periodIndex));

  var milestoneHalfWidth = 0;
  var isMilestone = info.isValidMilestone;
  var startTimestamp = info.start;
  var endTimestamp = info.end;
  var el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.periods());

  if (isMilestone) {
    el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.milestones());
    startTimestamp = info.milestoneTimestamp;
    endTimestamp = info.milestoneTimestamp;
    var optionHeight = /** @type {string|number} */ (el.getHeight(item, opt_periodIndex));
    var mHeight = anychart.utils.normalizeSize(optionHeight, rowHeight);
    milestoneHalfWidth = Math.round(mHeight / 2);
  }

  var left = this.scale_.timestampToRatio(startTimestamp) * this.pixelBoundsCache.width +
      this.pixelBoundsCache.left - milestoneHalfWidth;
  var right = this.scale_.timestampToRatio(endTimestamp) * this.pixelBoundsCache.width +
      this.pixelBoundsCache.left + milestoneHalfWidth;

  var itemBounds = new anychart.math.Rect(left, actualTop, (right - left), rowHeight);

  return this.getBarBounds_(el, itemBounds, item, void 0, opt_periodIndex);
};


/**
 * Gets project item boudns depending on type or specific point settings.
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Data item.
 * @param {anychart.ganttModule.BaseGrid.ProjectItemData} info - Project data item info.
 * @param {number} actualTop - .
 * @param {number} rowHeight - .
 * @return {anychart.math.Rect}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getProjectItemBounds_ = function(item, info, actualTop, rowHeight) {
  var startTimestamp = info.start;
  var endTimestamp = info.end;

  var milestoneHalfWidth = 0;
  var isMilestone = anychart.ganttModule.BaseGrid.isProjectMilestone(item, info);
  if (isMilestone) {
    endTimestamp = startTimestamp;
    var optionHeight = /** @type {string|number} */ (this.milestones().getHeight(item));
    var mHeight = anychart.utils.normalizeSize(optionHeight, rowHeight);
    milestoneHalfWidth = Math.round(mHeight / 2);
  }

  var left = this.scale_.timestampToRatio(startTimestamp) * this.pixelBoundsCache.width +
      this.pixelBoundsCache.left - milestoneHalfWidth;
  var right = this.scale_.timestampToRatio(endTimestamp) * this.pixelBoundsCache.width +
      this.pixelBoundsCache.left + milestoneHalfWidth;

  var itemBounds = new anychart.math.Rect(left, actualTop, (right - left), rowHeight);

  var el;

  if (isMilestone) {
    el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.milestones());
    return this.getBarBounds_(el, itemBounds, item);
  } else if (anychart.ganttModule.BaseGrid.isBaseline(item)) {
    el = /** @type {anychart.ganttModule.elements.TasksElement|anychart.ganttModule.elements.GroupingTasksElement} */ (
        anychart.ganttModule.BaseGrid.isGroupingTask(item) ? this.groupingTasks() : this.tasks()
    );

    var barBounds = this.getBarBounds_(el, itemBounds, item, true);

    var baselineEl = /** @type {anychart.ganttModule.elements.TimelineElement} */(this.baselines());
    var baselineBounds = this.getBarBounds_(baselineEl, itemBounds, item, true);
    this.fixBaselineBarsPositioning_(barBounds, baselineBounds, el, item);
    return barBounds;
  } else if (anychart.ganttModule.BaseGrid.isGroupingTask(item)) {
    el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.groupingTasks());
    return this.getBarBounds_(el, itemBounds, item);
  } else {
    el = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.tasks());
    return this.getBarBounds_(el, itemBounds, item);
  }
};


/**
 * Calculates bounds of item in current scale and controller's state depending on item's type.
 *
 * @param {number} index - Linear index of item in controller's visible items. If is period, index
 *  is linear index of treeDataItem that period belongs to.
 * @param {Object=} opt_period - Period object. Required if chart is resources chart.
 * @param {number=} opt_periodIndex - Period index.
 * @return {?anychart.math.Rect} - Bounds in current scale's state or null if data object contains some wrong data.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getItemBounds_ = function(index, opt_period, opt_periodIndex) {
  var info;
  var actualTop = this.getItemActualTop_(index);
  var visibleItems = this.controller.getVisibleItems();
  var item = visibleItems[index];
  var rowHeight = this.controller.getItemHeight(item);

  if (this.controller.isResources()) {
    return this.getResourceItemBounds_(item, actualTop, rowHeight, opt_periodIndex);
  } else {
    info = anychart.ganttModule.BaseGrid.getProjectItemInfo(item);
    return this.getProjectItemBounds_(item, info, actualTop, rowHeight);
  }
};


/**
 * Connects two bars.
 * @param {Object} from - Start map object. Contains item (or period) to be connected from and it's index.
 *    <code>
 *      {'item':item, 'index':index}
 *        or
 *      {'period':period, 'index':index}.
 *    </code>
 * @param {Object} to - Finish map object. Contains item (or period) to be connected from and it's index. Code is the same.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connection type.
 * @param {Object=} opt_connSettings - Connector visual appearance settings.
 * @param {acgraph.vector.Path=} opt_path - Path to be used. If not set, it will be generated from typed layer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.connectItems_ = function(from, to, opt_connType, opt_connSettings, opt_path) {
  opt_connType = opt_connType || anychart.enums.ConnectorType.FINISH_START;

  //Here 'to' is {'item':item, 'index':index} or {'period':period, 'index':index, 'periodIndex':index}. 'from' is as well.
  var fromIndex = from['index'];
  var toIndex = to['index'];
  var fromPeriodIndex = from['periodIndex'];
  var toPeriodIndex = to['periodIndex'];
  var visibleItems = this.controller.getVisibleItems();
  var fromItem = visibleItems[fromIndex];
  var toItem = visibleItems[toIndex];
  var fromElement = this.getConnectionElementByItem_(fromItem);
  var toElement = this.getConnectionElementByItem_(toItem);

  var fromBounds = this.getItemBounds_(fromIndex, from['period'], fromPeriodIndex);
  var toBounds = this.getItemBounds_(toIndex, to['period'], toPeriodIndex);
  var toRowHeight = this.controller.getItemHeight(toItem);

  if (fromBounds && toBounds && fromElement.getOption('enabled') && toElement.getOption('enabled')) {
    var selected = this.interactivityHandler.selection().isConnectorSelected(fromItem, toItem, fromIndex, toIndex, fromPeriodIndex, toPeriodIndex, opt_connType);

    var drawPreview = goog.isDefAndNotNull(opt_path);
    var pointFill, pointStroke;
    if (opt_connSettings) {
      if (selected) {
        pointFill = goog.typeOf(opt_connSettings['selected']) == 'object' ?
            opt_connSettings['selected']['fill'] :
            void 0;
        pointStroke = goog.typeOf(opt_connSettings['selected']) == 'object' ?
            opt_connSettings['selected']['stroke'] :
            void 0;
      } else {
        pointFill = goog.isDef(opt_connSettings['fill']) ? opt_connSettings['fill'] :
            goog.typeOf(opt_connSettings['normal']) == 'object' ?
                opt_connSettings['normal']['fill'] :
                void 0;
        pointStroke = goog.isDef(opt_connSettings['stroke']) ? opt_connSettings['stroke'] :
            goog.typeOf(opt_connSettings['normal']) == 'object' ?
                opt_connSettings['normal']['stroke'] :
                void 0;
      }
    }

    var state = selected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;
    var stroke = /** @type {acgraph.vector.Stroke} */(pointStroke || this.connectors().getStroke(fromItem, toItem, state, opt_connType, fromPeriodIndex, toPeriodIndex));

    var fromLeft, fromTop, toLeft, toTop, orientation;
    var am = anychart.ganttModule.TimeLine.ARROW_MARGIN;
    var size = anychart.ganttModule.TimeLine.ARROW_SIZE;
    var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);
    var arrow = drawPreview ? path : null;

    var segmentLeft0, segmentLeft1; //Util variables, temporary segment X-coordinate storage.
    var segmentTop0; //Util variable, temporary segment Y-coordinate storage.
    var aboveSequence = true; //If 'from' bar is above the 'to' bar.

    var lineThickness = anychart.utils.extractThickness(stroke);
    var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;
    var toActualTop;

    switch ((opt_connType + '').toLowerCase()) {
      case anychart.enums.ConnectorType.FINISH_FINISH:
        fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.LEFT;

        if (fromBounds.top == toBounds.top) { //Same line
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          if (fromLeft > toLeft) orientation = anychart.enums.Orientation.RIGHT;
        } else {
          segmentLeft0 = Math.max(fromLeft + size + am, toLeft + size + am);
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        }
        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
        break;

      case anychart.enums.ConnectorType.START_FINISH:
        fromLeft = Math.round(fromBounds.left) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.LEFT;

        if (fromLeft - am - am - size > toLeft) {
          segmentLeft0 = toLeft + am + size;
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        } else {
          aboveSequence = toBounds.top >= fromBounds.top;

          segmentLeft0 = fromLeft - am;
          segmentLeft1 = toLeft + am + size;
          toActualTop = this.getItemActualTop_(toIndex);
          segmentTop0 = Math.round(aboveSequence ? toActualTop : toActualTop + toRowHeight) + pixelShift;

          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
          path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
          path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, toTop, path);
          path = this.drawSegment_(segmentLeft1, toTop, toLeft, toTop, path);
        }

        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);

        break;

      case anychart.enums.ConnectorType.START_START:
        fromLeft = Math.round(fromBounds.left) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.RIGHT;

        if (fromBounds.top == toBounds.top) { //Same line
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          if (fromLeft > toLeft) orientation = anychart.enums.Orientation.LEFT;
        } else {
          segmentLeft0 = Math.min(fromLeft - size - am, toLeft - size - am);
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        }
        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
        break;

      default: //anychart.enums.ConnectorType.FINISH_START:
        fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left) + pixelShift;
        var extraEndY;

        if (toLeft >= fromLeft) {
          toLeft = Math.min(toLeft + am, Math.round(toBounds.left + toBounds.width / 2) + pixelShift);
          if (toBounds.top > fromBounds.top) {
            extraEndY = Math.round(toBounds.top) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
            path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
            arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.BOTTOM, arrow);
          } else if (toBounds.top < fromBounds.top) {
            extraEndY = Math.round(toBounds.top + toBounds.height) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
            path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
            arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.TOP, arrow);
          } else { //Same line
            toLeft = Math.round(toBounds.left) + pixelShift;
            toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
            arrow = this.drawArrow_(toLeft, toTop, anychart.enums.Orientation.RIGHT, arrow);
          }

        } else { //if toLeft < fromLeft
          extraEndY = Math.round(toBounds.top + toBounds.height / 2);
          toActualTop = this.getItemActualTop_(toIndex) + pixelShift;

          segmentTop0 = Math.round((toBounds.top > fromBounds.top) ? toActualTop : (toActualTop + toRowHeight)) + pixelShift;
          segmentLeft0 = fromLeft + am;
          segmentLeft1 = toLeft - am - size;

          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
          path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
          path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, extraEndY, path);
          path = this.drawSegment_(segmentLeft1, extraEndY, toLeft, extraEndY, path);

          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.RIGHT, arrow);
        }
    }

    var meta = {
      'fromItemIndex': fromIndex,
      'toItemIndex': toIndex,
      'connType': opt_connType,
      'fromItem': fromItem,
      'toItem': toItem
    };

    if (this.controller.isResources()) {
      meta['fromPeriodIndex'] = fromPeriodIndex;
      meta['toPeriodIndex'] = toPeriodIndex;
    }

    var cursor = this.elements().edit().getOption('enabled') ? acgraph.vector.Cursor.POINTER : acgraph.vector.Cursor.DEFAULT;
    if (path && !drawPreview) {
      path.tag = void 0; //Tooltip will not appear on connector mouse over.
      path.type = anychart.enums.TLElementTypes.CONNECTORS;
      path.currBounds = null;
      path.cursor(cursor);
      meta['path'] = path;
      path.meta = meta;
      path.stroke(stroke);
    }
    if (arrow && !drawPreview) {
      arrow.tag = void 0; //Tooltip will not appear on connector arrow mouse over.
      arrow.type = anychart.enums.TLElementTypes.CONNECTORS;
      arrow.currBounds = null;
      arrow.cursor(cursor);
      meta['arrow'] = arrow;
      arrow.meta = meta;
      arrow.fill(pointFill || this.connectors().getFill(fromItem, toItem, state, opt_connType, fromPeriodIndex, toPeriodIndex));
      arrow.stroke(stroke);
    }
  }
};


/**
 * Draws connectors.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawConnectors_ = function() {
  var connectorsData = this.controller.getConnectorsData();

  var l = connectorsData.length;
  var connData;

  var map = this.controller.isResources() ? this.controller.getPeriodsMap() : this.controller.getVisibleItemsMap();

  while (l--) {
    connData = connectorsData[l];
    var to = connData['to'];
    if (!goog.isObject(to)) to = map[to]; //destination becomes an object instead of string.

    if (goog.isDef(to)) {
      connData['to'] = to; //Replacing a string record with link to object for further connectors draw cycles.

      this.connectItems_(connData['from'], to, connData['type'], connData['connSettings']);
    } else {
      /*
        Destination is not found. We don't need this connector record anymore.
        Destination can be not found in two cases:
          1) Wrong incoming data.
          2) Destination is currently hidden by collapsed parent.
       In both cases we do not need this connectors record at all.
      */
      goog.array.splice(connectorsData, l, 1);
    }
  }
};


/**
 * Draws a segment of connector.
 * @param {number} fromLeft - Start left coordinate.
 * @param {number} fromTop - Start top coordinate.
 * @param {number} toLeft - End left coordinate.
 * @param {number} toTop - End top coordinate.
 * @param {acgraph.vector.Path} path - Path to be drawn.
 * @return {acgraph.vector.Path} - If the segment is drawn, return a path for connector.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawSegment_ = function(fromLeft, fromTop, toLeft, toTop, path) {
  /*
    Here we should know that connector basically can be drawn maximum in 5 segments:

                         +---------------+
                         |               | 1
                         |               +---+
                         |               |   |
                         +---------------+   | 2
                                             |
            +--------------- 3 --------------+
            |
          4 |     +-------------+
            |     |             |
            +---> +             |
              5   |             |
                  +-------------+


    Path will be drawn anyway in case:
    1) We draw a segment only if it is visible.
    2) If a segment becomes visible, it means that even if one of the next segments becomes invisible, we should not lose
    the sequence of segments to avoid appearance of diagonal connectors.
   */

  if (path) {
    try {
      path.lineTo(toLeft, toTop);
    } catch (e) {
      path
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }

  } else {
    var left = Math.min(fromLeft, toLeft);
    var right = Math.max(fromLeft, toLeft);
    var top = Math.min(fromTop, toTop);
    var bottom = Math.max(fromTop, toTop);

    if (left < (this.pixelBoundsCache.left + this.pixelBoundsCache.width) &&
        right > this.pixelBoundsCache.left &&
        top < (this.pixelBoundsCache.top + this.pixelBoundsCache.height) &&
        bottom > this.pixelBoundsCache.top) { //Segment or the part of it is visible.

      path = this.genElement_();
      path.type = anychart.enums.TLElementTypes.CONNECTORS;

      path
          .zIndex(anychart.ganttModule.TimeLine.CONNECTOR_Z_INDEX)
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }
  }

  return path;
};


/**
 * Draws an arrow.
 * @param {number} left - Left coordinate.
 * @param {number} top - Top coordinate.
 * @param {anychart.enums.Orientation} orientation - Arrow direction.
 * @param {acgraph.vector.Path=} opt_path - Path to be used.
 * @private
 * @return {acgraph.vector.Path} - Arrow path or null if path is not drawn.
 */
anychart.ganttModule.TimeLine.prototype.drawArrow_ = function(left, top, orientation, opt_path) {
  var drawPreview = goog.isDefAndNotNull(opt_path);

  var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);

  if (left >= this.pixelBoundsCache.left &&
      left <= this.pixelBoundsCache.left + this.pixelBoundsCache.width &&
      top >= this.pixelBoundsCache.top &&
      top <= this.pixelBoundsCache.top + this.pixelBoundsCache.height) { //Is in visible area.

    var arrSize = anychart.ganttModule.TimeLine.ARROW_SIZE;
    var left1 = 0;
    var top1 = 0;
    var left2 = 0;
    var top2 = 0;

    switch (orientation) {
      case anychart.enums.Orientation.LEFT:
        left = left + 1;
        left1 = left + arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.TOP:
        top = top + 1;
        left1 = left - arrSize;
        top1 = top + arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
      case anychart.enums.Orientation.RIGHT:
        left = left - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.BOTTOM:
        top = top - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
    }

    if (!drawPreview) {
      //path = /** @type {acgraph.vector.Path} */ (this.getDrawLayer().genNextChild());
      path = this.genElement_();
      path.type = anychart.enums.TLElementTypes.CONNECTORS;
    }
    path
        .zIndex(anychart.ganttModule.TimeLine.ARROW_Z_INDEX)
        .moveTo(left, top)
        .lineTo(left1, top1)
        .lineTo(left2, top2)
        .lineTo(left, top);

  }

  return path;
};


/**
 * Redraws vertical lines.
 * @param {Array.<anychart.scales.GanttDateTime.Tick>} ticks - Ticks.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawLowTicks_ = function(ticks) {
  if (ticks.length) {
    var path = this.getSeparationPath_().clear();

    var stroke = /** @type {acgraph.vector.Stroke} */ (path.stroke());
    var thickness = anychart.utils.extractThickness(stroke);

    var top = this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1;
    var bottom = this.pixelBoundsCache.top + this.pixelBoundsCache.height;
    for (var i = 0, l = ticks.length; i < l; i++) {
      var tick = ticks[i];
      var ratio = this.scale_.timestampToRatio(tick['start']);
      var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;
      left = anychart.utils.applyPixelShift(left, thickness);
      path
          .moveTo(left, top)
          .lineTo(left, bottom);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.applyClip = function(clipRect) {
  anychart.ganttModule.TimeLine.base(this, 'applyClip', clipRect);
  this.getCalendarLayer().clip(clipRect);
};


/**
 * Clears calendar drawn.
 *
 * @private
 */
anychart.ganttModule.TimeLine.prototype.clearCalendar_ = function() {
  this.getWorkingPath_().clear();
  this.getNotWorkingPath_().clear();
  this.getHolidaysPath_().clear();
  this.getWeekendsPath_().clear();
};


/**
 * Draws calendar period.
 *
 * @param {acgraph.vector.Path} path - Path to be drawn.
 * @param {number} start - Start timestamp.
 * @param {number} end - End timestamp.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawCalendarRange_ = function(path, start, end) {
  var top = this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1;
  var bottom = this.pixelBoundsCache.top + this.pixelBoundsCache.height;

  var startRatio = this.scale_.timestampToRatio(start);
  var endRatio = this.scale_.timestampToRatio(end);

  var pxStart = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
  var pxEnd = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
  pxStart = anychart.utils.applyPixelShift(pxStart, 1);
  pxEnd = anychart.utils.applyPixelShift(pxEnd, 1);
  path
    .moveTo(pxStart, top)
    .lineTo(pxEnd, top)
    .lineTo(pxEnd, bottom)
    .lineTo(pxStart, bottom)
    .close();
};


/**
 * Draws single working time item.
 * Actually draws working and not working time in single passage.
 *
 * @param {anychart.ganttModule.Calendar.DailyScheduleData} dailySchedule - Single day working schedule.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawWorkingTime_ = function(dailySchedule) {
  if (this.isIntervalUnitEqualsOrBelow_(anychart.enums.Interval.HOUR)) {
    var i;
    var workingIntervals = dailySchedule['workingIntervals'];
    var notWorkingIntervals = dailySchedule['notWorkingIntervals'];

    for (i = 0; i < notWorkingIntervals.length; i++) {
      var notWorkingInterval = notWorkingIntervals[i];
      this.drawCalendarRange_(this.getNotWorkingPath_(), notWorkingInterval['from'], notWorkingInterval['to']);
    }
    for (i = 0; i < workingIntervals.length; i++) {
      var workingInterval = workingIntervals[i];
      this.drawCalendarRange_(this.getWorkingPath_(), workingInterval['from'], workingInterval['to']);
    }
  }
};


/**
 * Defines whether currentLowerTicksUnit_ is below allowedInterval.
 * For example, DAY is below or equal MONTH, YEAR is not below or equal SEMESTER.
 *
 * @param {anychart.enums.Interval} allowedInterval - Interval that currentLowerTicksUnit_ must equal
 *  or be below.
 * @return {boolean}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.isIntervalUnitEqualsOrBelow_ = function(allowedInterval) {
  if (this.currentLowerTicksUnit_) {
    var currentUnitWeight = anychart.ganttModule.TimeLine.TICK_INTERVAL_GROWTH_MAP[this.currentLowerTicksUnit_];
    var allowedUnitWeight = anychart.ganttModule.TimeLine.TICK_INTERVAL_GROWTH_MAP[allowedInterval];
    return allowedUnitWeight >= currentUnitWeight;
  }
  return false;
};


/**
 * Defines whether the calendar values must be drawn.
 *
 * Basically, as it was decided in DVF-4370, holidays and weekends
 * must be drawn for anychart.enums.Interval.DAY and below,
 * working/not working hours must be drawn for anychart.enums.Interval.HOUR
 * and below.
 *
 * @return {boolean}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.isCalendarMustBeDrawn_ = function() {
  return this.scale_.hasCalendar() && this.isIntervalUnitEqualsOrBelow_(anychart.enums.Interval.DAY);
};


/**
 * Draws current working, not working and holidays periods depending on availabilities settings.
 *
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawCalendar_ = function() {
  this.clearCalendar_();

  if (this.isCalendarMustBeDrawn_()) {
    var workingSchedule = this.scale_.getWorkingSchedule();

    for (var i = 0; i < workingSchedule.length; i++) {
      var singleWorkingScheduleItemInfo = workingSchedule[i];
      var start = singleWorkingScheduleItemInfo['start'];
      var end = singleWorkingScheduleItemInfo['end'];
      var isHoliday = singleWorkingScheduleItemInfo['isHoliday'];
      var isWeekend = singleWorkingScheduleItemInfo['isWeekend'];

      if (isHoliday) {
        if (this.currentLowerTicksUnit_ === anychart.enums.Interval.DAY) {
          this.drawCalendarRange_(this.getHolidaysPath_(), start, end);
        } else {
          this.drawWorkingTime_(singleWorkingScheduleItemInfo);
        }
      } else if (isWeekend) {
        this.drawCalendarRange_(this.getWeekendsPath_(), start, end);
      } else {
        this.drawWorkingTime_(singleWorkingScheduleItemInfo);
      }
    }
  }
};


/**
 * Recalculates scale depending on current controller's state.
 */
anychart.ganttModule.TimeLine.prototype.initScale = function() {
  var newScale = this.scale_.isEmpty();
  var range = this.scale_.getRange();

  var dataMin = this.controller.getMinDate();
  var dataMax = this.controller.getMaxDate();
  this.scale_.suspendSignalsDispatching();
  this.scale_.setDataRange(dataMin, dataMax);

  //Without these settings scale will not be able to calculate ratio by anychart.enums.GanttDateTimeMarkers.
  this.scale_.trackedDataMin = dataMin;
  this.scale_.trackedDataMax = dataMax;

  if (newScale && !isNaN(dataMin) && !isNaN(dataMax)) {
    if (this.scale_.needsFitAll) {//If scale demands fit all - we call it.
      this.scale_.fitAll();
      this.scale_.needsFitAll = false;
    } else if (this.scale_.needsZoomTo) {//If zoomTo was called on hidden container.
      this.scale_.zoomTo.apply(this.scale_, this.scale_.neededZoomToArgs);
      this.scale_.needsZoomTo = false;
      this.scale_.neededZoomToArgs = null;
    } else {// Or apply default zoom.
      var totalRange = this.scale_.getTotalRange();
      var newRange = Math.round((totalRange['max'] - totalRange['min']) / 10);
      this.scale_.zoomTo(totalRange['min'], totalRange['min'] + newRange); //Initial visible range: 10% of total range.
    }
  }

  if (!newScale) {
    var max = range['max'];
    var min = range['min'];
    var delta = max - min;

    if (delta) { //This saves currently visible range after totalRange changes.
      range = this.scale_.getRange();
      min = range['min'];
      this.scale_.zoomTo(min, min + delta);
    }
  }

  this.scale_.resumeSignalsDispatching(true);
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.initDom = function() {
  this.getClipLayer().zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX - 2); //Put it under draw layer.
  this.markers().container(this.getContentLayer());
  this.labels().container(this.getContentLayer());
  this.header().container(this.getBase());
  this.initScale();
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.boundsInvalidated = function() {
  this.header().setBounds({
    left: this.pixelBoundsCache.left,
    top: this.pixelBoundsCache.top,
    width: this.pixelBoundsCache.width,
    height: /** @type {number} */ (this.headerHeight())
  });
  this.invalidate(anychart.ConsistencyState.TIMELINE_MARKERS);
  this.redrawHeader = true;
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.appearanceInvalidated = function() {
  this.getSeparationPath_().stroke(/** @type {acgraph.vector.Stroke} */(anychart.ganttModule.BaseGrid.getColorResolver('columnStroke', anychart.enums.ColorType.STROKE, false)(this, 0)));
};


/**
 * Inner getter for this.calendarLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.TimeLine.prototype.getCalendarLayer = function() {
  if (!this.calendarLayer_) {
    this.calendarLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.calendarLayer_, 'calendar-layer');
    this.calendarLayer_.zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX - 2);
  }
  return this.calendarLayer_;
};


/**
 * Inner getter for this.rangeLineMarkersLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.TimeLine.prototype.getRangeLineMarkersLayer = function() {
  if (!this.rangeLineMarkersLayer_) {
    this.rangeLineMarkersLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.rangeLineMarkersLayer_, 'range-line-markers-layer');
    this.rangeLineMarkersLayer_.zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX - 1);
  }
  return this.rangeLineMarkersLayer_;
};


/**
 * Inner getter for this.drawLayer_.
 * @return {acgraph.vector.Layer}
 */
anychart.ganttModule.TimeLine.prototype.getTextMarkersLayer = function() {
  if (!this.textMarkersLayer_) {
    this.textMarkersLayer_ = /** @type {acgraph.vector.Layer} */ (acgraph.layer());
    anychart.utils.nameElement(this.textMarkersLayer_, 'text-markers-layer');
    this.textMarkersLayer_.zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX + 1);
  }
  return this.textMarkersLayer_;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.initLayersStructure = function(base) {
  base
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCellsLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getCalendarLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getRangeLineMarkersLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getDrawLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getTextMarkersLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getContentLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getEditLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getClipLayer()))
      .addChild(/** @type {!acgraph.vector.Layer} */ (this.getScrollsLayer()));
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.labelsInvalidated = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS)) {
    this.drawLabels_();
    this.markConsistent(anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS);
  }
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.specialInvalidated = function() {
  var header = this.header();
  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_SCALES)) {
    this.redrawPosition = true;
    this.redrawHeader = true;
    header.invalidate(anychart.ConsistencyState.RESOURCE_TIMELINE_LEVELS);
    this.invalidate(anychart.ConsistencyState.TIMELINE_CALENDAR);
    this.markConsistent(anychart.ConsistencyState.TIMELINE_SCALES);
  }

  var levelsData = this.scale_.getLevelsData();
  if (this.redrawHeader) {
    header.suspendSignalsDispatching();
    header.setLevels(levelsData);

    var ticks = [];
    for (var i = 0; i < levelsData.length; i++) {
      if (header.level(i).enabled()) {
        var levelData = levelsData[i];
        this.currentLowerTicksUnit_ = levelData['unit'];
        ticks = this.scale_.getTicks(NaN, NaN, levelData['unit'], levelData['count']);
        break;
      }
    }

    header.draw();
    header.resumeSignalsDispatching(false);

    this.drawLowTicks_(ticks);

    var totalRange = this.scale_.getTotalRange();
    var visibleRange = this.scale_.getRange();

    var totMin = this.scale_.timestampToRatio(totalRange['min']) * this.pixelBoundsCache.width;
    var totMax = this.scale_.timestampToRatio(totalRange['max']) * this.pixelBoundsCache.width;
    var visibleMin = this.scale_.timestampToRatio(visibleRange['min']) * this.pixelBoundsCache.width;
    var visibleMax = this.scale_.timestampToRatio(visibleRange['max']) * this.pixelBoundsCache.width;

    if (this.horizontalScrollBar_) {
      var contentBoundsSimulation = new anychart.math.Rect(totMin, 0, totMax - totMin, 0);
      var visibleBoundsSimulation = new anychart.math.Rect(visibleMin, 0, visibleMax - visibleMin, 0);

      this.horizontalScrollBar_
          .suspendSignalsDispatching()
          .handlePositionChange(false)
          .contentBounds(contentBoundsSimulation)
          .visibleBounds(visibleBoundsSimulation)
          .draw()
          .handlePositionChange(true)
          .resumeSignalsDispatching(false);

      if (this.horizontalScrollBar_.container()) this.horizontalScrollBar_.draw();
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_CALENDAR)) {
    this.drawCalendar_();
    this.markConsistent(anychart.ConsistencyState.TIMELINE_CALENDAR);
  }
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.positionFinal = function() {
  if (this.redrawPosition || this.redrawHeader) {
    this.drawTimelineElements_();
    this.invalidate(anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS);
    this.redrawHeader = false;
  }
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.markersInvalidated = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_MARKERS)) {
    var markers = goog.array.concat(this.lineMarkers_, this.rangeMarkers_, this.textMarkers_);

    var top = this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1;
    var dataBounds = new anychart.math.Rect(this.pixelBoundsCache.left,
        top,
        this.pixelBoundsCache.width,
        (this.pixelBoundsCache.height - /** @type {number} */ (this.headerHeight()) - 1));

    for (var m = 0, count = markers.length; m < count; m++) {
      var axesMarker = markers[m];
      if (axesMarker) {
        var b = dataBounds;
        var cont = this.getRangeLineMarkersLayer();
        if (acgraph.utils.instanceOf(axesMarker, anychart.ganttModule.axisMarkers.Text)) {
          b = new anychart.math.Rect(this.pixelBoundsCache.left, top, this.pixelBoundsCache.width, this.totalGridsHeight);
          cont = this.getTextMarkersLayer();
        }
        axesMarker.suspendSignalsDispatching();
        axesMarker.invalidate(anychart.ConsistencyState.BOUNDS);
        axesMarker.parentBounds(b);
        axesMarker.container(cont);
        axesMarker.invalidate(anychart.ConsistencyState.CONTAINER); //Force set of parent.
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.TIMELINE_MARKERS);
  }
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.labelsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.TIMELINE_ELEMENTS_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draws labels.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawLabels_ = function() {
  this.labels().suspendSignalsDispatching();
  this.labels().clear();

  var els = this.initializeElements_();

  for (var i = 0; i < els.length; i++) {
    var element = els[i];
    if (element.getOption('enabled')) {
      if (!element.shapeManager)
        element.recreateShapeManager();
      var tagsData = element.shapeManager.getTagsData();
      for (var j in tagsData) {
        if (tagsData.hasOwnProperty(j)) {
          var tag = tagsData[j];
          if (tag.isElement) {

            var context = this.createFormatProvider(tag.item, tag.period, tag.periodIndex);
            tag.label = this.labels().add(context, {
              'value': {
                'x': 0,
                'y': 0
              }
            });

            var pointLabels = tag.labelPointSettings;
            // var typeLabels = tag.labels;
            var resolutionLabels = tag.labels;
            var typeLabels = resolutionLabels && resolutionLabels[0] ? resolutionLabels[0] : null; //smth like this.tasks().labels() always here.
            var elementsLabels = this.elements().labels();
            var normalLabels = this.labels();

            var pointLabelsEnabled = pointLabels && goog.isDef(pointLabels['enabled']) ? pointLabels['enabled'] : null;
            var elementsLabelsEnabled = element && goog.isDef(elementsLabels.enabled()) ? elementsLabels.enabled() : null;
            var typeLabelsEnabled = typeLabels && goog.isDef(typeLabels.enabled()) ? typeLabels.enabled() : null;

            var draw = false;
            if (goog.isNull(pointLabelsEnabled)) {
              if (goog.isNull(elementsLabelsEnabled)) {
                if (goog.isNull(typeLabelsEnabled)) {
                  draw = normalLabels.enabled();
                } else {
                  draw = typeLabelsEnabled;
                }
              } else {
                draw = elementsLabelsEnabled;
              }
            } else {
              draw = pointLabelsEnabled;
            }

            if (draw) {
              tag.label.resetSettings();
              tag.label.enabled(true);

              tag.label.state('labelOwnSettings', tag.label.ownSettings, 0);
              tag.label.state('pointState', pointLabels, 1);

              var len = resolutionLabels.length;
              var k, count, stateLabels;
              for (k = 0; k < len; k++) {
                stateLabels = resolutionLabels[k];
                count = 2 + k;
                tag.label.state('st' + count, stateLabels, count);
              }

              //Second passage provides correct theme settings order
              for (k = 0; k < len; k++) {
                stateLabels = resolutionLabels[k];
                count = 2 + k + len;
                tag.label.state('st' + count, stateLabels.themeSettings, count);
              }

              var position = anychart.enums.normalizeAnchor(tag.label.getFinalSettings('position'));
              var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(tag.bounds, position)};
              tag.label.positionProvider(positionProvider);

              var values = context.contextValues();
              values['label'] = {value: tag.label, type: anychart.enums.TokenType.UNKNOWN};
              context.propagate();

              tag.label.formatProvider(context);

              this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
              tag.item.meta('label', tag.label);
              this.controller.data().resumeSignalsDispatching(false);
            } else {
              tag.label.enabled(false);
            }
            tag.label.draw();
          }
        }
      }
    }
  }

  this.labels().resumeSignalsDispatching(true);
  this.labels().draw();
  this.elements().labels().markConsistent(anychart.ConsistencyState.ALL);

  // Marking all labels consistent.
  for (var elIndex = 0; elIndex < els.length; elIndex++) {
    var el = els[elIndex];
    el.labels().markConsistent(anychart.ConsistencyState.ALL);
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.deleteKeyHandler = function(e) {
  var selection = this.interactivityHandler.selection();
  if (selection.hasSelectedConnector() && this.elements().edit().getOption('enabled')) {
    var selectedConnectorData = selection.getSelectedConnectorData();
    var fromItemIndex = selectedConnectorData.fromItemIndex;
    var toItemIndex = selectedConnectorData.toItemIndex;
    var connType = selectedConnectorData.connType;
    var visibleItems = this.controller.getVisibleItems();
    var fromItem = visibleItems[fromItemIndex];
    var toItem = visibleItems[toItemIndex];
    var i = 0;

    var removeEvent = {
      'type': anychart.enums.EventType.BEFORE_REMOVE_CONNECTOR,
      'fromItem': fromItem,
      'toItem': toItem,
      'fromItemIndex': fromItemIndex,
      'toItemIndex': toItemIndex,
      'connectorType': connType
    };

    if (this.controller.isResources()) {
      var fromPeriodIndex = selectedConnectorData.fromPeriodIndex;
      var fromPeriods = fromItem.get(anychart.enums.GanttDataFields.PERIODS);
      var fromPeriod = fromPeriods[fromPeriodIndex];
      var fromPeriodConnectors = fromPeriod[anychart.enums.GanttDataFields.CONNECTOR];

      var toPeriodIndex = selectedConnectorData.toPeriodIndex;
      var toPeriods = toItem.get(anychart.enums.GanttDataFields.PERIODS);
      var toPeriod = toPeriods[toPeriodIndex];
      var toPeriodId = toPeriod[anychart.enums.GanttDataFields.ID];

      removeEvent['fromPeriodIndex'] = fromPeriodIndex;
      removeEvent['fromPeriod'] = fromPeriod;
      removeEvent['toPeriodIndex'] = toPeriodIndex;
      removeEvent['toPeriod'] = toPeriod;

      if (goog.isArray(fromPeriodConnectors)) {
        for (i = 0; i < fromPeriodConnectors.length; i++) {//New behaviour.
          var perConn = fromPeriodConnectors[i];
          if (perConn) {
            var perId = perConn[anychart.enums.GanttDataFields.CONNECT_TO];
            var perConnType = perConn[anychart.enums.GanttDataFields.CONNECTOR_TYPE] ||
                anychart.enums.ConnectorType.FINISH_START;
            if (perId == toPeriodId && perConnType == connType) {
              if (this.interactivityHandler.dispatchEvent(removeEvent)) {
                fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR, i);
                selection.selectConnector(null);
              }
            }
          }
        }
      } else { //Old behaviour.
        if (this.interactivityHandler.dispatchEvent(removeEvent)) {
          fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR);
          fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR_TYPE);
          fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECT_TO);
          selection.selectConnector(null);
        }
      }
    } else {
      var toItemId = toItem.get(anychart.enums.GanttDataFields.ID);
      var connectors = fromItem.get(anychart.enums.GanttDataFields.CONNECTOR);
      if (goog.isArray(connectors)) { //New behaviour.
        for (i = 0; i < connectors.length; i++) {
          var connector = connectors[i];
          if (connector) {
            var currentConnType = connector[anychart.enums.GanttDataFields.CONNECTOR_TYPE] ||
                anychart.enums.ConnectorType.FINISH_START;
            if (toItemId == connector[anychart.enums.GanttDataFields.CONNECT_TO] && currentConnType == connType) {
              if (this.interactivityHandler.dispatchEvent(removeEvent)) {
                fromItem.del(anychart.enums.GanttDataFields.CONNECTOR, i);
                selection.selectConnector(null);
              }
            }
          }
        }
      } else { //Old behaviour.
        if (this.interactivityHandler.dispatchEvent(removeEvent)) {
          fromItem.del(anychart.enums.GanttDataFields.CONNECTOR);
          fromItem.del(anychart.enums.GanttDataFields.CONNECTOR_TYPE);
          fromItem.del(anychart.enums.GanttDataFields.CONNECT_TO);
          selection.selectConnector(null);
        }
      }
    }
  }
};


/**
 * Vertical scrollBar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.ganttModule.TimeLine|anychart.ganttModule.ScrollBar} ScrollBar or self for chaining.
 */
anychart.ganttModule.TimeLine.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.getScrollBar().setup(opt_value);
    return this;
  }
  return this.controller.getScrollBar();
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.horizontalScrollBar = function(opt_value) {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.ganttModule.ScrollBar();
    this.horizontalScrollBar_.setupByJSON(/** @type {!Object} */ (anychart.getFlatTheme('defaultScrollBar')));
    this.horizontalScrollBar_.layout(anychart.enums.Layout.HORIZONTAL);

    var scale = this.scale_;
    this.horizontalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var endRatio = e['endRatio'];

      var range = scale.getTotalRange();
      var totalMin = range['min'];
      var totalMax = range['max'];
      var msRange = totalMax - totalMin;
      var start = Math.round(totalMin + startRatio * msRange);
      var end = Math.round(totalMin + endRatio * msRange);
      scale.setRange(start, end);
    });

    this.horizontalScrollBar_.listenSignals(this.scrollBarInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.horizontalScrollBar_.setup(opt_value);
    return this;
  }

  return this.horizontalScrollBar_;
};


/**
 * Scrollbar invalidation.
 * @param {anychart.SignalEvent} e Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.scrollBarInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Performs scroll to pixel offsets.
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 * @param {boolean=} opt_dragScrolling - Whether TL is in drag scrolling.
 * @return {boolean} - Whether scroll has been performed.
 */
anychart.ganttModule.TimeLine.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset, opt_dragScrolling) {
  if (horizontalPixelOffset || verticalPixelOffset) {
    anychart.core.Base.suspendSignalsDispatching(this, this.scale_, this.controller);

    if (!opt_dragScrolling) {
      this.dragging = false;
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      this.clearEdit_();
    }

    var startIndex = this.controller.startIndex();
    var heightCache = this.controller.getHeightCache();
    var verticalOffset = this.controller.verticalOffset();

    var totalVerticalStartOffset = startIndex ? heightCache[startIndex - 1] : 0;
    totalVerticalStartOffset += (verticalOffset + verticalPixelOffset);
    this.controller.scrollTo(/** @type {number} */ (totalVerticalStartOffset));

    var ratio = horizontalPixelOffset / this.pixelBoundsCache.width;
    if (opt_dragScrolling && !this.draggingConnector && (this.currentThumbDragger_ || this.draggingPreview)) {
      this.scale_.ratioForceScroll(ratio);
    } else if (this.draggingConnector || (this.dragging && this.draggingItem) || (!this.dragging)) {
      this.scale_.ratioScroll(ratio);
    }

    // anychart.core.Base.resumeSignalsDispatchingTrue(this.scale_, this.controller, this);
    anychart.core.Base.resumeSignalsDispatchingFalse(this.scale_, this.controller, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES | anychart.ConsistencyState.TIMELINE_MARKERS, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};

/**
 * Return mousepoint ratio based on mouse x location
 * @param {number} mouseX - Mouse x location on timeline.
 * @returns {number} - Ratio.
 */
anychart.ganttModule.TimeLine.prototype.getMousePointRatioByX = function(mouseX) {
  /**
   * Left offset of stage.
   * @type {number}
   */
  var clientOffsetX = this.container().getStage().getClientPosition().x;

  /**
   * Mouse x location on timeline.
   * @type {number}
   */
  var x = mouseX - this.bounds_.left() - clientOffsetX;
  return x / this.bounds().width();
};


/**
 * Returns zoom factor based on passed dy.
 * Do some additional math for trackpad users.
 *
 * @param {number} dy - Mouse wheel dy.
 * @returns {number} - ZoomFactor
 */
anychart.ganttModule.TimeLine.prototype.getZoomFactor = function(dy) {
  var maxDy = 100;

  // We need to clamp because of trackpads.
  dy = goog.math.clamp(dy, -maxDy, maxDy);

  // 1.05 is a little bit smaller than default gantt zoom factor.
  return 1.05 + Math.abs(dy) / maxDy;
};


/**@inheritDoc*/
anychart.ganttModule.TimeLine.prototype.mouseWheelHandler = function(e) {
  if (this.getOption('zoomOnMouseWheel')) {
    e.preventDefault();

    this.hideContextMenu();
    this.tooltip().hide();

    var dy = e.deltaY;
    var zoomFactor = this.getZoomFactor(dy);
    var ratio = this.getMousePointRatioByX(e.clientX);

    if (dy < 0) {
      this.scale_.zoomIn(zoomFactor, ratio);
    } else {
      this.scale_.zoomOut(zoomFactor, ratio);
    }
  } else {
    anychart.ganttModule.TimeLine.base(this, 'mouseWheelHandler', e);
  }
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.serialize = function() {
  var json = anychart.ganttModule.TimeLine.base(this, 'serialize');
  json['scale'] = this.scale_.serialize();
  json['labels'] = this.labels().serialize();
  json['markers'] = this.markers().serialize();
  json['header'] = this.header().serialize();

  anychart.core.settings.serialize(this, anychart.ganttModule.TimeLine.COLOR_DESCRIPTORS, json, void 0, void 0, true);

  json['elements'] = this.elements().serialize();
  json['connectors'] = this.connectors().serialize();
  json['milestones'] = this.milestones().serialize();

  if (this.controller.isResources()) {
    json['periods'] = this.periods().serialize();
  } else {
    json['tasks'] = this.tasks().serialize();
    json['groupingTasks'] = this.groupingTasks().serialize();
    json['baselines'] = this.baselines().serialize();
  }

  var i;
  var lineMarkers = [];
  for (i = 0; i < this.lineMarkers_.length; i++) {
    var lineMarker = this.lineMarkers_[i];
    if (lineMarker) lineMarkers.push(lineMarker.serialize());
  }
  if (lineMarkers.length) json['lineAxesMarkers'] = lineMarkers;

  var rangeMarkers = [];
  for (i = 0; i < this.rangeMarkers_.length; i++) {
    var rangeMarker = this.rangeMarkers_[i];
    if (rangeMarker) rangeMarkers.push(rangeMarker.serialize());
  }
  if (rangeMarkers.length) json['rangeAxesMarkers'] = rangeMarkers;

  var textMarkers = [];
  for (i = 0; i < this.textMarkers_.length; i++) {
    var textMarker = this.textMarkers_[i];
    if (textMarker) textMarkers.push(textMarker.serialize());
  }
  if (textMarkers.length) json['textAxesMarkers'] = textMarkers;

  if (this.horizontalScrollBar_)
    json['horizontalScrollBar'] = this.horizontalScrollBar().serialize();

  json['verticalScrollBar'] = this.verticalScrollBar().serialize();

  return json;
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.TimeLine.base(this, 'setupByJSON', config, opt_default);

  if ('scale' in config) this.scale_.setup(config['scale']);

  this.labels().setupInternal(!!opt_default, config['labels']);

  if ('markers' in config) this.markers(config['markers']);

  //TODO (A.Kudryavtsev): Issue for flatting.
  if (('header' in config) && !opt_default)
    this.header().setupInternal(false, config['header']);

  anychart.core.settings.deserialize(this, anychart.ganttModule.TimeLine.COLOR_DESCRIPTORS, config, opt_default);

  this.elements().setupInternal(!!opt_default, config['elements']);
  this.milestones().setupInternal(!!opt_default, config['milestones']);
  this.connectors().setupInternal(!!opt_default, config['connectors']);

  if (this.controller.isResources()) {
    this.periods().setupInternal(!!opt_default, config['periods']);
  } else {
    this.tasks().setupInternal(!!opt_default, config['tasks']);
    this.groupingTasks().setupInternal(!!opt_default, config['groupingTasks']);
    this.baselines().setupInternal(!!opt_default, config['baselines']);
  }

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];

  var i = 0;
  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      this.lineMarker(i, lineAxesMarkers[i]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      this.rangeMarker(i, rangeAxesMarkers[i]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      this.textMarker(i, textAxesMarkers[i]);
    }
  }

  if ('horizontalScrollBar' in config)
    this.horizontalScrollBar(config['horizontalScrollBar']);

  if ('verticalScrollBar' in config)
    this.verticalScrollBar(config['verticalScrollBar']);
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.disposeInternal = function() {
  goog.dispose(this.horizontalScrollBar_);
  this.horizontalScrollBar_ = null;
  this.scale_.unlistenSignals(this.scaleInvalidated_);
  if (this.header_)
    this.header_.unlistenSignals(this.headerInvalidated_);

  var markers = goog.array.concat(this.lineMarkers_, this.textMarkers_, this.rangeMarkers_);
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    if (marker) {
      marker.unlistenSignals(this.onMarkersSignal_);
      goog.dispose(marker);
    }
  }

  if (this.editPreviewDragger_) {
    this.editPreviewDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editPreviewDragStart_, false, this);
    this.editPreviewDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editPreviewDrag_, false, this);
    this.editPreviewDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editPreviewEnd_, false, this);
  }
  if (this.editProgressDragger_) {
    this.editProgressDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editProgressDragStart_, false, this);
    this.editProgressDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editProgressDrag_, false, this);
    this.editProgressDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editProgressDragEnd_, false, this);
  }
  if (this.editLeftThumbDragger_) {
    this.editLeftThumbDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editLeftThumbDragStart_, false, this);
    this.editLeftThumbDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
    this.editLeftThumbDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  }
  if (this.editRightThumbDragger_) {
    this.editRightThumbDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editRightThumbDragStart_, false, this);
    this.editRightThumbDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
    this.editRightThumbDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  }
  if (this.editStartConnectorDragger_) {
    this.editStartConnectorDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
    this.editStartConnectorDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
    this.editStartConnectorDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  }
  if (this.editFinishConnectorDragger_) {
    this.editFinishConnectorDragger_.unlisten(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
    this.editFinishConnectorDragger_.unlisten(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
    this.editFinishConnectorDragger_.unlisten(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  }

  goog.disposeAll(
      this.elements_,
      this.periods_,
      this.tasks_,
      this.groupingTasks_,
      this.milestones_,
      this.baselines_,
      this.connectors_,

      this.scale_,
      this.header_,
      this.separationPath_,
      this.editPreviewPath_,

      this.editProgressPath_,
      this.editLeftThumbPath_,
      this.editRightThumbPath_,
      this.editStartConnectorPath_,
      this.editFinishConnectorPath_,
      this.editConnectorPreviewPath_,

      this.editPreviewDragger_,
      this.editProgressDragger_,
      this.editLeftThumbDragger_,
      this.editRightThumbDragger_,
      this.editStartConnectorDragger_,
      this.editFinishConnectorDragger_,

      this.labelsFactory_,
      this.markersFactory_);

  this.labelsFactory_ = null;
  this.markersFactory_ = null;
  this.connectors_ = null;
  this.lineMarkers_.length = 0;
  this.rangeMarkers_.length = 0;
  this.textMarkers_.length = 0;

  anychart.ganttModule.TimeLine.base(this, 'disposeInternal');
};


//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.ganttModule.TimeLine}
 */
anychart.standalones.ProjectTimeline = function() {
  anychart.standalones.ProjectTimeline.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ProjectTimeline, anychart.ganttModule.TimeLine);
anychart.core.makeStandalone(anychart.standalones.ProjectTimeline, anychart.ganttModule.TimeLine);



/**
 * @constructor
 * @extends {anychart.ganttModule.TimeLine}
 */
anychart.standalones.ResourceTimeline = function() {
  anychart.standalones.ResourceTimeline.base(this, 'constructor', void 0, true);
};
goog.inherits(anychart.standalones.ResourceTimeline, anychart.ganttModule.TimeLine);
anychart.core.makeStandalone(anychart.standalones.ResourceTimeline, anychart.ganttModule.TimeLine);


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 */
anychart.standalones.projectTimeline = function() {
  var timeline = new anychart.standalones.ProjectTimeline();
  timeline.setup(anychart.getFullTheme('standalones.projectTimeline'));
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 */
anychart.standalones.resourceTimeline = function() {
  var timeline = new anychart.standalones.ResourceTimeline();
  timeline.setup(anychart.getFullTheme('standalones.resourceTimeline'));
  return timeline;
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.TimeLine.prototype;
  // auto generated
  //proto['backgroundFill'] = proto.backgroundFill;
  //proto['columnStroke'] = proto.columnStroke;

  // row coloring
  //proto['rowFill'] = proto.rowFill;
  //proto['rowEvenFill'] = proto.rowEvenFill;
  //proto['rowOddFill'] = proto.rowOddFill;
  //proto['rowHoverFill'] = proto.rowHoverFill;
  //proto['rowSelectedFill'] = proto.rowSelectedFill;

  // DEPRECATED API
  proto['baseFill'] = proto.baseFill;
  proto['baseStroke'] = proto.baseStroke;
  proto['baselineFill'] = proto.baselineFill;
  proto['baselineStroke'] = proto.baselineStroke;
  proto['milestoneFill'] = proto.milestoneFill;
  proto['milestoneStroke'] = proto.milestoneStroke;
  proto['parentFill'] = proto.parentFill;
  proto['parentStroke'] = proto.parentStroke;
  proto['progressFill'] = proto.progressFill;
  proto['progressStroke'] = proto.progressStroke;
  proto['baseLabels'] = proto.baseLabels;
  proto['baselineLabels'] = proto.baselineLabels;
  proto['parentLabels'] = proto.parentLabels;
  proto['milestoneLabels'] = proto.milestoneLabels;
  proto['progressLabels'] = proto.progressLabels;
  proto['baselineAbove'] = proto.baselineAbove;
  proto['baseBarHeight'] = proto.baseBarHeight;
  proto['baseBarAnchor'] = proto.baseBarAnchor;
  proto['baseBarPosition'] = proto.baseBarPosition;
  proto['baseBarOffset'] = proto.baseBarOffset;
  proto['parentBarHeight'] = proto.parentBarHeight;
  proto['parentBarAnchor'] = proto.parentBarAnchor;
  proto['parentBarPosition'] = proto.parentBarPosition;
  proto['parentBarOffset'] = proto.parentBarOffset;
  proto['baselineBarHeight'] = proto.baselineBarHeight;
  proto['baselineBarAnchor'] = proto.baselineBarAnchor;
  proto['baselineBarPosition'] = proto.baselineBarPosition;
  proto['baselineBarOffset'] = proto.baselineBarOffset;
  proto['progressBarHeight'] = proto.progressBarHeight;
  proto['progressBarAnchor'] = proto.progressBarAnchor;
  proto['progressBarPosition'] = proto.progressBarPosition;
  proto['progressBarOffset'] = proto.progressBarOffset;
  proto['milestoneHeight'] = proto.milestoneHeight;
  proto['milestoneAnchor'] = proto.milestoneAnchor;
  proto['milestonePosition'] = proto.milestonePosition;
  proto['milestoneOffset'] = proto.milestoneOffset;
  proto['selectedElementFill'] = proto.selectedElementFill;
  proto['selectedElementStroke'] = proto.selectedElementStroke;
  proto['connectorFill'] = proto.connectorFill;
  proto['connectorStroke'] = proto.connectorStroke;
  proto['selectedConnectorStroke'] = proto.selectedConnectorStroke;
  proto['connectorPreviewStroke'] = proto.connectorPreviewStroke;
  proto['editStructurePreviewDashStroke'] = proto.editStructurePreviewDashStroke;
  proto['editStructurePreviewFill'] = proto.editStructurePreviewFill;
  proto['editStructurePreviewStroke'] = proto.editStructurePreviewStroke;
  proto['editing'] = proto.editing;
  proto['editPreviewFill'] = proto.editPreviewFill;
  proto['editPreviewStroke'] = proto.editPreviewStroke;
  proto['editProgressFill'] = proto.editProgressFill;
  proto['editProgressStroke'] = proto.editProgressStroke;
  proto['editIntervalThumbFill'] = proto.editIntervalThumbFill;
  proto['editIntervalThumbStroke'] = proto.editIntervalThumbStroke;
  proto['editConnectorThumbFill'] = proto.editConnectorThumbFill;
  proto['editConnectorThumbStroke'] = proto.editConnectorThumbStroke;
  proto['editStartConnectorMarkerSize'] = proto.editStartConnectorMarkerSize;
  proto['editStartConnectorMarkerType'] = proto.editStartConnectorMarkerType;
  proto['editStartConnectorMarkerHorizontalOffset'] = proto.editStartConnectorMarkerHorizontalOffset;
  proto['editStartConnectorMarkerVerticalOffset'] = proto.editStartConnectorMarkerVerticalOffset;
  proto['editFinishConnectorMarkerSize'] = proto.editFinishConnectorMarkerSize;
  proto['editFinishConnectorMarkerType'] = proto.editFinishConnectorMarkerType;
  proto['editFinishConnectorMarkerHorizontalOffset'] = proto.editFinishConnectorMarkerHorizontalOffset;
  proto['editFinishConnectorMarkerVerticalOffset'] = proto.editFinishConnectorMarkerVerticalOffset;
  proto['editIntervalWidth'] = proto.editIntervalWidth;


  proto['edit'] = proto.edit;
  proto['horizontalScrollBar'] = proto.horizontalScrollBar;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['tooltip'] = proto.tooltip;

  proto['labels'] = proto.labels;

  proto['markers'] = proto.markers;
  proto['scale'] = proto.scale;

  proto['textMarker'] = proto.textMarker;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;

  proto['header'] = proto.header;

  proto['elements'] = proto.elements;
  proto['connectors'] = proto.connectors;
  proto['tasks'] = proto.tasks;
  proto['milestones'] = proto.milestones;
  proto['groupingTasks'] = proto.groupingTasks;
  proto['baselines'] = proto.baselines;
  proto['periods'] = proto.periods;


  proto = anychart.standalones.ProjectTimeline.prototype;
  goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
  goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
  proto['palette'] = proto.palette;

  proto = anychart.standalones.ResourceTimeline.prototype;
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
  proto['palette'] = proto.palette;
})();
