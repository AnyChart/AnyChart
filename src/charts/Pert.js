goog.provide('anychart.charts.Pert');

goog.require('acgraph.math.Coordinate');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.pert.CriticalPath');
goog.require('anychart.core.pert.Milestones');
goog.require('anychart.core.pert.Tasks');
goog.require('anychart.core.utils.PertPointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Tree');
goog.require('goog.array');



/**
 * Stock chart class.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 */
anychart.charts.Pert = function() {
  anychart.charts.Pert.base(this, 'constructor');

  /**
   * Data tree.
   * @private {anychart.data.Tree}
   */
  this.data_ = null;

  /**
   * Works map.
   * Allows to determine item's successors and predecessors.
   * @private {Object.<string, anychart.charts.Pert.Work>}
   */
  this.worksMap_ = {};

  /**
   * Activity data map.
   * Contains calculated values as earliestStart, earliestFinish, latestStart, latestFinish, duration, slack.
   * @private {Object.<string, anychart.charts.Pert.ActivityData>}
   */
  this.activitiesMap_ = {};

  /**
   * Levels data.
   * @private {Array.<Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>>}
   */
  this.levels_ = [];

  /**
   * Start activities.
   * NOTE: activities that do not depend on other activities.
   * @private {Array.<anychart.data.Tree.DataItem>}
   */
  this.startActivities_ = [];

  /**
   * Finish activities.
   * NOTE: activities that are not dependent on other activities.
   * @private {Array.<anychart.data.Tree.DataItem>}
   */
  this.finishActivities_ = [];

  /**
   * Function that calculates expected time.
   * @private {Function}
   */
  this.expectedTimeCalculator_ = goog.nullFunction;

  /**
   * Format provider.
   * @private {anychart.core.utils.PertPointContextProvider}
   */
  this.formatProvider_ = null;

  /**
   * Finish milestone.
   * @private {?anychart.charts.Pert.Milestone}
   */
  this.finishMilestone_ = null;

  /**
   * Start milestone.
   * @private {?anychart.charts.Pert.Milestone}
   */
  this.startMilestone_ = null;

  /**
   * Location of milestone in a grid.
   * @private {Array.<Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>>}
   */
  this.milestonesLocation_ = [];

  /**
   * Milestones map.
   * @private {Object.<string, (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>}
   */
  this.milestonesMap_ = {};

  /**
   * Milestones layer.
   * @private {anychart.core.utils.TypedLayer}
   */
  this.milestonesLayer_ = null;

  /**
   * Activities layer.
   * @private {anychart.core.utils.TypedLayer}
   */
  this.activitiesLayer_ = null;

  /**
   * Interactivity layer. Contains invisible paths to simplify mouse navigation.
   * @private {anychart.core.utils.TypedLayer}
   */
  this.interactivityLayer_ = null;

  /**
   * Labels layer.
   * @private {acgraph.vector.Layer}
   */
  this.labelsLayer_ = null;

  /**
   * Base layer.
   * @private {acgraph.vector.Layer}
   */
  this.baseLayer_ = null;

  /**
   * Milestones settings object.
   * @private {anychart.core.pert.Milestones}
   */
  this.milestones_ = null;

  /**
   * Tasks settings object.
   * @private {anychart.core.pert.Tasks}
   */
  this.tasks_ = null;

  /**
   * Critical path settings object.
   * @private {anychart.core.pert.CriticalPath}
   */
  this.criticalPath_ = null;

  /**
   * Selected works.
   * @private {Array.<anychart.charts.Pert.Work>}
   */
  this.selectedWorks_ = [];

  /**
   * Selected milestones.
   * @private {Array.<anychart.charts.Pert.Milestone>}
   */
  this.selectedMilestones_ = [];

  /**
   * Edges map.
   * @private {Object.<string, (anychart.charts.Pert.Edge|anychart.charts.Pert.FakeEdge)>}
   */
  this.edgesMap_ = {};

  /**
   * Paths data.
   * @private {Array.<Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>>}
   */
  this.paths_ = [];

  /**
   * Max paths level.
   * @private {number}
   */
  this.maxLevel_ = 0;

  /**
   * Faces calculated by gamma-algorithm.
   * @private {Array.<Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>>}
   */
  this.faces_ = [];

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, this.clickHandler_,
      this.handleMouseOverAndMove, null, this.handleMouseDown);

};
goog.inherits(anychart.charts.Pert, anychart.core.SeparateChart);


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Pert.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Pert.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.PERT_DATA |
    anychart.ConsistencyState.PERT_CALCULATIONS |
    anychart.ConsistencyState.PERT_APPEARANCE |
    anychart.ConsistencyState.PERT_LABELS;


//region -- Type definitions.
//----------------------------------------------------------------------------------------------------------------------
//
//  Type definitions.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @typedef {{
 *    earliestStart: number,
 *    earliestFinish: number,
 *    latestStart: number,
 *    latestFinish: number,
 *    duration: number,
 *    slack: number,
 *    variance: number
 * }}
 */
anychart.charts.Pert.ActivityData;


/**
 * @typedef {{
 *    id: string,
 *    label: string,
 *    successors: Array.<anychart.data.Tree.DataItem>,
 *    predecessors: Array.<anychart.data.Tree.DataItem>,
 *    mSuccessors: Array.<anychart.charts.Pert.Milestone>,
 *    mPredecessors: Array.<anychart.charts.Pert.Milestone>,
 *    level: number,
 *    isCritical: boolean,
 *    left: number,
 *    top: number,
 *    isSelected: boolean,
 *    relatedPath: acgraph.vector.Path,
 *    relatedLabel: anychart.core.ui.LabelsFactory.Label,
 *    isStart: boolean,
 *    creator: ?anychart.charts.Pert.Work,
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    edges: Array.<(anychart.charts.Pert.Edge|anychart.charts.Pert.FakeEdge)>,
 *    upperMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    lowerMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    brokenTo: Array.<anychart.charts.Pert.Milestone>,
 *    parent: ?anychart.charts.Pert.Milestone
 * }}
 */
anychart.charts.Pert.Milestone;


/**
 * Fake milestone typedef.
 * This milestone is used to break an edge to make it look like a broken line.
 * Used for gamma-algorithm.
 *
 * @typedef {{
 *    isFake: boolean,
 *    id: string,
 *    label: string,
 *    level: number,
 *    isCritical: boolean,
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    edges: Array.<(anychart.charts.Pert.Edge|anychart.charts.Pert.FakeEdge)> ,
 *    realEdge: anychart.charts.Pert.Edge,
 *    predFakeEdge: anychart.charts.Pert.FakeEdge,
 *    succFakeEdge: anychart.charts.Pert.FakeEdge,
 *    mSuccessors: Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>,
 *    mPredecessors: Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>,
 *    successors: Array,
 *    predecessors: Array,
 *    upperMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    lowerMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)
 * }}
 */
anychart.charts.Pert.FakeMilestone;


/**
 * Work is actually a wrapper for a TreeDataItem.
 *
 * @typedef {{
 *    id: string,
 *    item: anychart.data.Tree.DataItem,
 *    successors: Array.<anychart.data.Tree.DataItem>,
 *    predecessors: Array.<anychart.data.Tree.DataItem>,
 *    level: number,
 *    startMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    finishMilestone: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    isCritical: boolean,
 *    isSelected: boolean,
 *    relatedPath: acgraph.vector.Path,
 *    upperLabel: anychart.core.ui.LabelsFactory.Label,
 *    lowerLabel: anychart.core.ui.LabelsFactory.Label,
 *    depLeft: Array.<string>,
 *    depRight: Array.<string>,
 *    isProcessed: boolean
 * }}
 */
anychart.charts.Pert.Work;


/**
 * Edge data.
 *
 * @typedef {{
 *    from: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    to: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    work: ?anychart.charts.Pert.Work,
 *    id: string,
 *    isCritical: boolean
 * }}
 */
anychart.charts.Pert.Edge;


/**
 * Fake edge typedef.
 * Fake edge is actually a part of real edge that connects dummy milestones
 * or real milestone and fake one.
 *
 * @typedef {{
 *    isFake: boolean,
 *    from: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    to: (anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone),
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    work: ?anychart.charts.Pert.Work,
 *    id: string,
 *    isCritical: boolean,
 *    realEdge: anychart.charts.Pert.Edge
 * }}
 */
anychart.charts.Pert.FakeEdge;


/**
 * Edge data.
 * @typedef {{
 *    vertices: Object.<string, anychart.charts.Pert.Milestone>,
 *    edges: Object.<string, anychart.charts.Pert.Edge>
 * }}
 */
anychart.charts.Pert.Segment;
//endregion


//region -- Static constants.
/**
 * Base layer z-index.
 * @type {number}
 */
anychart.charts.Pert.BASE_LAYER_Z_INDEX = 2;


/**
 * Cell pixel size.
 * @type {number}
 * @private
 */
anychart.charts.Pert.CELL_PIXEL_SIZE_ = 80;


/**
 * Cell pixel vertical space.
 * @type {number}
 * @private
 */
anychart.charts.Pert.CELL_PIXEL_VERTICAL_SPACE_ = 20;


/**
 * Cell pixel horizontal space.
 * @type {number}
 * @private
 */
anychart.charts.Pert.CELL_PIXEL_HORIZONTAL_SPACE_ = 80;


/**
 * Arrow height.
 * @type {number}
 */
anychart.charts.Pert.ARROW_HEIGHT = 10;


/**
 * Arrow half bottom.
 * @type {number}
 */
anychart.charts.Pert.ARROW_BOTTOM = 3;
//endregion


//region -- Type and context provider.
/** @inheritDoc */
anychart.charts.Pert.prototype.getType = function() {
  return anychart.enums.ChartTypes.PERT;
};


/**
 * Creates format provider and applies reference values.
 * @param {boolean=} opt_force - Force create.
 * @param {anychart.charts.Pert.Work=} opt_work - Work data.
 * @param {anychart.charts.Pert.ActivityData=} opt_activityData - Activity data.
 * @param {anychart.charts.Pert.Milestone=} opt_milestone - Milestone data.
 * @return {anychart.core.utils.PertPointContextProvider} - Format provider.
 */
anychart.charts.Pert.prototype.createFormatProvider = function(opt_force, opt_work, opt_activityData, opt_milestone) {
  if (!this.formatProvider_ || opt_force)
    this.formatProvider_ = new anychart.core.utils.PertPointContextProvider(this);
  this.formatProvider_.work = opt_work;
  this.formatProvider_.activityData = opt_activityData;
  this.formatProvider_.milestone = opt_milestone;
  this.formatProvider_.applyReferenceValues();
  return this.formatProvider_;
};
//endregion


//region -- Data.
//----------------------------------------------------------------------------------------------------------------------
//
//  Data.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets chart data.
 * @param {(anychart.data.Tree|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @param {Array.<anychart.data.Tree.Dependency>=} opt_deps - Dependencies.
 * @return {(anychart.data.Tree|anychart.charts.Pert)} - Current value or itself for method chaining.
 */
anychart.charts.Pert.prototype.data = function(opt_data, opt_fillMethod, opt_deps) {
  if (goog.isDef(opt_data)) {
    if (opt_data instanceof anychart.data.Tree) {
      if (this.data_ != opt_data) {
        if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this);
        this.data_ = opt_data;
      }
    } else {
      if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this);
      this.data_ = new anychart.data.Tree(opt_data, opt_fillMethod, opt_deps);
    }
    this.data_.listenSignals(this.dataInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.PERT_DATA, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * @inheritDoc
 */
anychart.charts.Pert.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.ALL & ~(anychart.ConsistencyState.CHART_ANIMATION | anychart.ConsistencyState.PERT_DATA),
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Listener for data invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.charts.Pert.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.PERT_DATA, anychart.Signal.NEEDS_REDRAW);
};
//endregion


//region -- Abstract methods.
//----------------------------------------------------------------------------------------------------------------------
//
//  Abstract methods implementation.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Pert.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  //TODO (A.Kudryavtsev): Implement.
  return [];
};


/** @inheritDoc */
anychart.charts.Pert.prototype.getAllSeries = function() {
  return [];
};
//endregion


//region -- Mouse interactivty.
//----------------------------------------------------------------------------------------------------------------------
//
//  Mouse interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Hides tooltips excepting one.
 * @param {anychart.core.ui.Tooltip=} opt_exception - Tooltip to be left.
 * @private
 */
anychart.charts.Pert.prototype.hideOtherTooltips_ = function(opt_exception) {
  if (opt_exception != this.milestones().tooltip()) this.milestones().tooltip().hide();
  if (opt_exception != this.tasks().tooltip()) this.tasks().tooltip().hide();
  if (opt_exception != this.criticalPath().milestones().tooltip()) this.criticalPath().milestones().tooltip().hide();
  if (opt_exception != this.criticalPath().tasks().tooltip()) this.criticalPath().tasks().tooltip().hide();
};


/** @inheritDoc */
anychart.charts.Pert.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];

  var label;

  var fill, stroke, source;
  var work, activity, milestone;
  var tooltip;
  var position;
  var pos = new acgraph.math.Coordinate(event['clientX'], event['clientY']);
  var zeroPos = new acgraph.math.Coordinate(0, 0);
  var formatProvider;
  var tag = domTarget.tag;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory) {
    var labelIndex = event['labelIndex'];
    var l = event['target'].getLabel(labelIndex);
    tag = l.tag;
  }

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      milestone = tag['m'];
      source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
      fill = milestone.isSelected ? source.selectFill() : source.hoverFill();
      stroke = milestone.isSelected ? source.selectStroke() : source.hoverStroke();
      domTarget.fill(fill).stroke(stroke);

      tooltip = source.tooltip();
      formatProvider = this.createFormatProvider(false, void 0, void 0, milestone);
      position = tooltip.isFloating() ? pos : zeroPos;
      tooltip.show(formatProvider, position);

      label = milestone.relatedLabel;
      if (label) {
        var lf = /** @type {anychart.core.ui.LabelsFactory} */ (milestone.isSelected ? source.selectLabels() : source.hoverLabels());
        var labelEnabled = !!lf.enabled();
        label.currentLabelsFactory(lf);
        label.enabled(labelEnabled);
        label.draw();
      }

    } else if (goog.isDefAndNotNull(tag['w'])) {
      work = tag['w'];
      activity = this.activitiesMap_[work.id];
      source = work.isCritical ? this.criticalPath().tasks() : this.tasks();
      fill = /** @type {acgraph.vector.Fill} */ (work.isSelected ? source.selectFill() : source.hoverFill());
      stroke = /** @type {acgraph.vector.Stroke} */ (work.isSelected ? source.selectStroke() : source.hoverStroke());
      work.relatedPath.fill(fill).stroke(stroke);

      var upperLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectUpperLabels() : source.hoverUpperLabels());
      var lowerLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectLowerLabels() : source.hoverLowerLabels());
      work.upperLabel.currentLabelsFactory(upperLf);
      work.upperLabel.enabled(!!upperLf.enabled());
      work.upperLabel.draw();
      work.lowerLabel.currentLabelsFactory(lowerLf);
      work.lowerLabel.enabled(!!lowerLf.enabled());
      work.lowerLabel.draw();

      tooltip = source.tooltip();
      formatProvider = this.createFormatProvider(false, work, activity, void 0);
      position = tooltip.isFloating() ? pos : zeroPos;
      tooltip.show(formatProvider, position);
    }
    //else if (goog.isDefAndNotNull(tag['d'])) {
    //  var isCrit = tag['d'];
    //  source = isCrit ? this.criticalPath().tasks() : this.tasks();
    //  fill = source.hoverDummyFill();
    //  stroke = source.hoverDummyStroke();
    //  domTarget.fill(fill).stroke(stroke);
    //}
  }
  this.hideOtherTooltips_(/** @type {anychart.core.ui.Tooltip} */ (tooltip));
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.charts.Pert.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var fill, stroke, source;
  var label;
  var tag = domTarget.tag;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory) {
    var labelIndex = event['labelIndex'];
    var l = event['target'].getLabel(labelIndex);
    tag = l.tag;
  }

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      var milestone = tag['m'];
      source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
      fill = milestone.isSelected ? source.selectFill() : source.fill();
      stroke = milestone.isSelected ? source.selectStroke() : source.stroke();

      label = milestone.relatedLabel;
      if (label) {
        var lf = /** @type {anychart.core.ui.LabelsFactory} */ (milestone.isSelected ? source.selectLabels() : source.labels());
        var labelEnabled = !!lf.enabled();
        label.currentLabelsFactory(lf);
        label.enabled(labelEnabled);
        label.draw();
      }
      domTarget.fill(fill).stroke(stroke);
    } else if (goog.isDefAndNotNull(tag['w'])) {
      var work = tag['w'];
      source = work.isCritical ? this.criticalPath().tasks() : this.tasks();
      fill = /** @type {acgraph.vector.Fill} */ (work.isSelected ? source.selectFill() : source.fill());
      stroke = /** @type {acgraph.vector.Stroke} */ (work.isSelected ? source.selectStroke() : source.stroke());
      work.relatedPath.fill(fill).stroke(stroke);

      var upperLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectUpperLabels() : source.upperLabels());
      var lowerLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectLowerLabels() : source.lowerLabels());
      work.upperLabel.currentLabelsFactory(upperLf);
      work.upperLabel.enabled(!!upperLf.enabled());
      work.upperLabel.draw();
      work.lowerLabel.currentLabelsFactory(lowerLf);
      work.lowerLabel.enabled(!!lowerLf.enabled());
      work.lowerLabel.draw();

    }
    //else if (goog.isDefAndNotNull(tag['d'])) {
    //  var isCrit = tag['d'];
    //  source = isCrit ? this.criticalPath().tasks() : this.tasks();
    //  fill = source.dummyFill();
    //  stroke = source.dummyStroke();
    //  domTarget.fill(fill).stroke(stroke);
    //}
  }
};


/**
 * Handler for click event.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.charts.Pert.prototype.clickHandler_ = function(event) {
  var ctrl = event.metaKey || event.ctrlKey;
  var i = 0;
  var milestone, work;

  var domTarget = /** @type {acgraph.vector.Element} */ (event['domTarget']);
  var tag = domTarget.tag;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory) {
    var labelIndex = event['labelIndex'];
    var l = event['target'].getLabel(labelIndex);
    tag = l.tag;
  }

  if ((domTarget instanceof acgraph.vector.Element)) {
    if (tag) {
      if (goog.isDefAndNotNull(tag['m'])) {
        milestone = tag['m'];
      } else if (goog.isDefAndNotNull(tag['w'])) {
        work = tag['w'];
      }
    }

    if (milestone || work) {
      if (ctrl) {
        if (milestone) {
          milestone.isSelected = !milestone.isSelected;
          if (milestone.isSelected) {
            goog.array.insert(this.selectedMilestones_, milestone);
          } else {
            goog.array.remove(this.selectedMilestones_, milestone);
          }
        }
        if (work) {
          work.isSelected = !work.isSelected;
          if (work.isSelected) {
            goog.array.insert(this.selectedWorks_, work);
          } else {
            goog.array.remove(this.selectedWorks_, work);
          }
        }
      } else {
        for (i = 0; i < this.selectedMilestones_.length; i++) {
          this.selectedMilestones_[i].isSelected = false;
        }
        for (i = 0; i < this.selectedWorks_.length; i++) {
          this.selectedWorks_[i].isSelected = false;
        }
        this.selectedMilestones_.length = 0;
        this.selectedWorks_.length = 0;
        if (milestone) {
          milestone.isSelected = true;
          this.selectedMilestones_.push(milestone);
        }
        if (work) {
          work.isSelected = true;
          this.selectedWorks_.push(work);
        }
      }
    } else {
      for (i = 0; i < this.selectedMilestones_.length; i++) {
        this.selectedMilestones_[i].isSelected = false;
      }
      for (i = 0; i < this.selectedWorks_.length; i++) {
        this.selectedWorks_[i].isSelected = false;
      }
      this.selectedMilestones_.length = 0;
      this.selectedWorks_.length = 0;
    }

    this.dispatchEvent(this.makeInteractivityEvent_());
    this.invalidate(anychart.ConsistencyState.PERT_APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Creates selected item event object.
 * @return {Object}
 * @private
 */
anychart.charts.Pert.prototype.makeInteractivityEvent_ = function() {
  var eventObject = {
    'type': anychart.enums.EventType.POINTS_SELECT,
    'selectedTasks': [],
    'selectedMilestones': []
  };
  var i;

  for (i = 0; i < this.selectedWorks_.length; i++) {
    var work = this.selectedWorks_[i];
    var activity = this.activitiesMap_[work.id];
    var wrappedWork = {
      'item': work.item,
      'name': work.item.get(anychart.enums.DataField.NAME),
      'successors': work.successors,
      'predecessors': work.predecessors,
      'earliestStart': activity.earliestStart,
      'earliestFinish': activity.earliestFinish,
      'latestStart': activity.latestStart,
      'latestFinish': activity.latestFinish,
      'duration': activity.duration,
      'slack': activity.slack,
      'variance': activity.variance
    };
    eventObject['selectedTasks'].push(wrappedWork);
  }

  for (i = 0; i < this.selectedMilestones_.length; i++) {
    var mil = this.selectedMilestones_[i];
    var wrappedMilestone = {
      'successors': mil.successors,
      'predecessors': mil.predecessors,
      'isCritical': mil.isCritical,
      'isStart': mil.isStart
    };
    if (mil.creator) wrappedMilestone['creator'] = mil.creator.item;
    eventObject['selectedMilestones'].push(wrappedMilestone);
  }

  return eventObject;
};
//endregion


//region -- Calculations.
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets function to calculate expected time.
 * @param {function():number=} opt_value - Value to be set.
 * @return {function():number|anychart.charts.Pert} - Current value or itself for method chaining.
 */
anychart.charts.Pert.prototype.expectedTimeCalculator = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.expectedTimeCalculator_ = opt_value;
    this.invalidate(anychart.ConsistencyState.PERT_CALCULATIONS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.expectedTimeCalculator_;
};


/** @inheritDoc */
anychart.charts.Pert.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.PERT_DATA)) {
    this.worksMap_ = {};
    this.startActivities_.length = 0;
    this.finishActivities_.length = 0;

    if (this.data_ && !this.data_.isDisposed()) {
      var items = this.data_.getChildrenUnsafe(); //TODO (A.Kudryavtsev): do we process deeper (child) items somehow?
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var id = String(item.get(anychart.enums.DataField.ID));

        if (!(id in this.worksMap_)) {
          this.worksMap_[id] = {
            id: id,
            item: item,
            successors: [],
            predecessors: [],
            level: -1,
            isCritical: false,
            depLeft: [],
            depRight: []
          };
          this.finishActivities_.push(item); //Has no successors - add.
        }

        var deps = item.get(anychart.enums.DataField.DEPENDS_ON);
        if (goog.isDef(deps) && goog.typeOf(deps) == 'array') {
          for (var j = 0; j < deps.length; j++) {
            var dependsOn = String(deps[j]);
            if (dependsOn in this.worksMap_) {
              if (dependsOn != id) {
                this.worksMap_[dependsOn].successors.push(item);
                this.worksMap_[id].predecessors.push(this.worksMap_[dependsOn].item);
                goog.array.remove(this.finishActivities_, this.worksMap_[dependsOn].item); //Has successor - remove.
                goog.array.binaryInsert(this.worksMap_[dependsOn].depRight, id);
                goog.array.binaryInsert(this.worksMap_[id].depLeft, dependsOn);
              }
            } else {
              var found = this.data_.find(anychart.enums.DataField.ID, dependsOn)[0];
              if (found) {
                var foundId = String(found.get(anychart.enums.DataField.ID));
                this.worksMap_[foundId] = {
                  id: foundId,
                  item: found,
                  successors: [item],
                  predecessors: [],
                  level: -1,
                  isCritical: false,
                  depLeft: [],
                  depRight: []
                };
                goog.array.remove(this.finishActivities_, found); //Has successor - remove.
                this.worksMap_[id].predecessors.push(found);
                goog.array.binaryInsert(this.worksMap_[foundId].depRight, id);
                goog.array.binaryInsert(this.worksMap_[id].depLeft, dependsOn);
              }
            }
          }
        } else {
          this.startActivities_.push(item);
        }
      }

      this.calculateActivities_();
      this.calculateMilestones_();
      this.calculateGamma_();

    }
    this.markConsistent(anychart.ConsistencyState.PERT_DATA);
  }
};


/**
 * Calculates activities.
 * @private
 */
anychart.charts.Pert.prototype.calculateActivities_ = function() {
  this.activitiesMap_ = {};
  if (this.startActivities_.length && this.finishActivities_.length) {
    for (var i = 0; i < this.startActivities_.length; i++) {
      this.calculateActivity_(String(this.startActivities_[i].get(anychart.enums.DataField.ID)));
    }
  } //TODO (A.Kudryavtsev): Else warning.

  var sum = 0;
  for (var key in this.activitiesMap_) {
    var act = this.activitiesMap_[key];
    if (!act.slack) sum += act.variance;
  }
  this.statistics[anychart.enums.Statistics.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION] = Math.sqrt(sum);

  this.markConsistent(anychart.ConsistencyState.PERT_CALCULATIONS);
};


/**
 * Calculates earliest start and earliest finish, latest start and latest finish for given activity.
 * @param {string} id - Activity id.
 * @private
 */
anychart.charts.Pert.prototype.calculateActivity_ = function(id) {
  var workData = this.worksMap_[id];

  if (!(id in this.activitiesMap_)) {
    this.activitiesMap_[id] = /** @type {anychart.charts.Pert.ActivityData} */ ({});

    var opt = Number(workData.item.get(anychart.enums.DataField.OPTIMISTIC));
    var pess = Number(workData.item.get(anychart.enums.DataField.PESSIMISTIC));
    //Can be NaN
    this.activitiesMap_[id].variance = Math.pow(((pess - opt) / 6), 2);
  }

  var activity = this.activitiesMap_[id];

  if (!goog.isDef(activity.duration)) {
    var formatProvider = this.createFormatProvider(false, workData, activity);
    activity.duration = this.expectedTimeCalculator_.call(formatProvider, formatProvider);
  }

  var duration = activity.duration;

  var i = 0;

  //Calculating earliest start and earliest finish.
  if (!goog.isDef(activity.earliestStart)) {
    var max = 0;
    for (i = 0; i < workData.predecessors.length; i++) {
      var pred = workData.predecessors[i];
      var predId = String(pred.get(anychart.enums.DataField.ID));
      var predActivity = this.activitiesMap_[predId];
      if (!goog.isDef(predActivity) || !goog.isDef(predActivity.earliestFinish))
        this.calculateActivity_(predId);
      var predActivityEF = this.activitiesMap_[predId].earliestFinish;
      max = Math.max(max, predActivityEF);
    }
    activity.earliestStart = max;
    activity.earliestFinish = max + duration;
  }


  //Calculating latest start and finish.
  if (!goog.isDef(activity.latestFinish)) {
    var val;
    if (workData.successors.length) {
      val = Infinity;
      for (i = 0; i < workData.successors.length; i++) {
        var succ = workData.successors[i];
        var succId = String(succ.get(anychart.enums.DataField.ID));
        var succActivity = this.activitiesMap_[succId];
        if (!goog.isDef(succActivity) || !goog.isDef(succActivity.latestStart))
          this.calculateActivity_(succId);
        var succActivityLS = this.activitiesMap_[succId].latestStart;
        val = Math.min(val, succActivityLS);
      }
    } else {
      val = -Infinity;
      for (i = 0; i < this.finishActivities_.length; i++) {
        var fin = this.finishActivities_[i];
        var finId = String(fin.get(anychart.enums.DataField.ID));
        var finActivity = this.activitiesMap_[finId];
        if (!goog.isDef(finActivity) || !goog.isDef(finActivity.earliestFinish))
          this.calculateActivity_(finId);
        var finActivityEF = this.activitiesMap_[finId].earliestFinish;
        val = Math.max(val, finActivityEF);
      }
      this.statistics[anychart.enums.Statistics.PERT_CHART_PROJECT_DURATION] = val;
    }
    activity.latestFinish = val;
    activity.latestStart = val - duration;
    activity.slack = val - activity.earliestFinish;
  }

};


/**
 * Adds mSuccessor and mPredecessor.
 * @param {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} successorMilestone - Successor milestone.
 * @param {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} predecessorMilestone - Predecessor milestone.
 * @return {boolean} - Whether milestones are not the same.
 * @private
 */
anychart.charts.Pert.prototype.addMilestoneSuccessors_ = function(successorMilestone, predecessorMilestone) {
  if (successorMilestone == predecessorMilestone) return false;
  goog.array.insert(successorMilestone.mPredecessors, predecessorMilestone);
  goog.array.insert(predecessorMilestone.mSuccessors, successorMilestone);
  return true;
};


/**
 * Creates empty milestone object. Also registers milestone in milestones map.
 * @param {?anychart.charts.Pert.Work} creator - Work that creates milestone or null.
 * @param {boolean} isStart - Whether milestone is start.
 * @param {string=} opt_label - Optional label.
 * @return {anychart.charts.Pert.Milestone} - Empty object.
 * @private
 */
anychart.charts.Pert.prototype.createEmptyMilestone_ = function(creator, isStart, opt_label) {
  var result = /** @type {anychart.charts.Pert.Milestone} */ ({
    label: opt_label || '', //Internal info.
    id: '',
    successors: [],
    predecessors: [],
    mSuccessors: [],
    mPredecessors: [],
    level: -1,
    isCritical: false,
    left: 0,
    top: 0,
    isStart: isStart,
    creator: creator,
    flag: false,
    flagPlotted: false,
    edges: []
  });
  var hash = this.hash_('m', result);
  this.milestonesMap_[hash] = result;
  result.id = hash;
  return result;
};


/**
 * Creates ALL milestones (Also unnecessary milestones).
 * First passage.
 * @private
 */
anychart.charts.Pert.prototype.createAllMilestones_ = function() {
  this.startMilestone_ = this.createEmptyMilestone_(null, true, 'Start');
  this.startMilestone_.isCritical = true;
  this.finishMilestone_ = this.createEmptyMilestone_(null, false, 'Finish');
  this.finishMilestone_.isCritical = true;

  var i;

  for (var id in this.worksMap_) {
    var work = this.worksMap_[id];
    var activity = this.activitiesMap_[id];

    if (!work.startMilestone) {
      work.startMilestone = this.createEmptyMilestone_(work, true, 'S' + work.item.get(anychart.enums.DataField.NAME));
    }

    if (!work.finishMilestone) {
      work.finishMilestone = this.createEmptyMilestone_(work, false, 'F' + work.item.get(anychart.enums.DataField.NAME));
      work.finishMilestone.creator = work;
    }

    goog.array.insert(work.startMilestone.successors, work.item);
    goog.array.insert(work.finishMilestone.predecessors, work.item);

    if (!activity.slack) {
      work.isCritical = true;
      work.startMilestone.isCritical = true;
      work.finishMilestone.isCritical = true;
    }

    if (work.successors.length) {
      for (i = 0; i < work.successors.length; i++) {
        var succ = work.successors[i];
        var succId = String(succ.get(anychart.enums.DataField.ID));
        var succWork = this.worksMap_[succId];
        if (!succWork.startMilestone)
          succWork.startMilestone = this.createEmptyMilestone_(succWork, true, 'S' + succWork.item.get(anychart.enums.DataField.NAME));
        if (!succWork.finishMilestone)
          succWork.finishMilestone = this.createEmptyMilestone_(succWork, false, 'F' + succWork.item.get(anychart.enums.DataField.NAME));
        this.addMilestoneSuccessors_(succWork.startMilestone, work.finishMilestone);
      }
    } else {
      this.addMilestoneSuccessors_(this.finishMilestone_, work.finishMilestone);
    }

    if (work.predecessors.length) {
      for (i = 0; i < work.predecessors.length; i++) {
        var pred = work.predecessors[i];
        var predId = String(pred.get(anychart.enums.DataField.ID));
        var predWork = this.worksMap_[predId];
        if (!predWork.startMilestone)
          predWork.startMilestone = this.createEmptyMilestone_(predWork, true, 'Start: ' + predWork.item.get(anychart.enums.DataField.NAME));
        if (!succWork.finishMilestone)
          predWork.finishMilestone = this.createEmptyMilestone_(predWork, false, 'Finish: ' + predWork.item.get(anychart.enums.DataField.NAME));
        this.addMilestoneSuccessors_(work.startMilestone, predWork.finishMilestone);
      }
    } else {
      this.addMilestoneSuccessors_(work.startMilestone, this.startMilestone_);
    }
  }
};


/**
 * Processes work, creates it's milestones.
 * @param {anychart.charts.Pert.Work} work - Work to be processed.
 * @private
 */
anychart.charts.Pert.prototype.processWork_ = function(work) {
  // if (work && !work.isProcessed) {
  //   work.isProcessed = true;
  //   if (work.depRight.length) {
  //
  //   }
  // }
};


/**
 * Creates ALL milestones (Also unnecessary milestones).
 * First passage.
 * @private
 */
anychart.charts.Pert.prototype.createAllGammaMilestones_ = function() {
  this.startMilestone_ = this.createEmptyMilestone_(null, true, 'Start');
  this.startMilestone_.isCritical = true;
  this.finishMilestone_ = this.createEmptyMilestone_(null, false, 'Finish');
  this.finishMilestone_.isCritical = true;

  var i;

  for (i = 0; i < this.startActivities_.length; i++) {
    var id = String(this.startActivities_[i].get(anychart.enums.DataField.ID));
    var work = this.worksMap_[id];
    this.processWork_(work);

  }

  // for (var id in this.worksMap_) {
  //   var work = this.worksMap_[id];
  //   var activity = this.activitiesMap_[id];



  // if (!work.startMilestone) {
  //   work.startMilestone = this.createEmptyMilestone_(work, true, 'S' + work.item.get(anychart.enums.DataField.NAME));
  // }
  //
  // if (!work.finishMilestone) {
  //   work.finishMilestone = this.createEmptyMilestone_(work, false, 'F' + work.item.get(anychart.enums.DataField.NAME));
  //   work.finishMilestone.creator = work;
  // }
  //
  // goog.array.insert(work.startMilestone.successors, work.item);
  // goog.array.insert(work.finishMilestone.predecessors, work.item);
  //
  // if (!activity.slack) {
  //   work.isCritical = true;
  //   work.startMilestone.isCritical = true;
  //   work.finishMilestone.isCritical = true;
  // }
  //
  // if (work.successors.length) {
  //   for (i = 0; i < work.successors.length; i++) {
  //     var succ = work.successors[i];
  //     var succId = String(succ.get(anychart.enums.DataField.ID));
  //     var succWork = this.worksMap_[succId];
  //     if (!succWork.startMilestone)
  //       succWork.startMilestone = this.createEmptyMilestone_(succWork, true, 'S' + succWork.item.get(anychart.enums.DataField.NAME));
  //     if (!succWork.finishMilestone)
  //       succWork.finishMilestone = this.createEmptyMilestone_(succWork, false, 'F' + succWork.item.get(anychart.enums.DataField.NAME));
  //     this.addMilestoneSuccessors_(succWork.startMilestone, work.finishMilestone);
  //   }
  // } else {
  //   this.addMilestoneSuccessors_(this.finishMilestone_, work.finishMilestone);
  // }
  //
  // if (work.predecessors.length) {
  //   for (i = 0; i < work.predecessors.length; i++) {
  //     var pred = work.predecessors[i];
  //     var predId = String(pred.get(anychart.enums.DataField.ID));
  //     var predWork = this.worksMap_[predId];
  //     if (!predWork.startMilestone)
  //       predWork.startMilestone = this.createEmptyMilestone_(predWork, true, 'Start: ' + predWork.item.get(anychart.enums.DataField.NAME));
  //     if (!succWork.finishMilestone)
  //       predWork.finishMilestone = this.createEmptyMilestone_(predWork, false, 'Finish: ' + predWork.item.get(anychart.enums.DataField.NAME));
  //     this.addMilestoneSuccessors_(work.startMilestone, predWork.finishMilestone);
  //   }
  // } else {
  //   this.addMilestoneSuccessors_(work.startMilestone, this.startMilestone_);
  // }
  // }
};


/**
 * Clears unnecessary milestones.
 * Second and third passage.
 * @private
 */
anychart.charts.Pert.prototype.clearExcessiveMilestones_ = function() {
  var uid, i, j, mSucc, mPred, milestone;
  var succId, succWork, predId, predWork, cantBeShortenedMap, milestoneToRemove, rem;

  var removeList = [];

  //First passage. Clearing structure like Mil -> dummy -> Mil -> Work -> Mil.
  for (uid in this.milestonesMap_) {
    milestone = this.milestonesMap_[uid];
    cantBeShortenedMap = {};

    //if (milestone.label == 'Finish: SD') debugger;
    for (i = 0; i < milestone.mSuccessors.length; i++) {
      mSucc = milestone.mSuccessors[i];

      if (mSucc.successors.length == 1 && mSucc.mPredecessors.length < 2 && !mSucc.predecessors.length) {
        //if (mSucc.successors.length == 1 && !mSucc.predecessors.length) {
        succId = String(mSucc.successors[0].get(anychart.enums.DataField.ID));
        succWork = this.worksMap_[succId];
        var succFinishMilestone = succWork.finishMilestone;
        for (j = 0; j < milestone.mSuccessors.length; j++) {
          if (i != j) { //not same.
            var anotherSucc = milestone.mSuccessors[j];
            if (anotherSucc.successors.length == 1) {
              var anotherSuccId = String(anotherSucc.successors[0].get(anychart.enums.DataField.ID));
              var anotherSuccWork = this.worksMap_[anotherSuccId];
              var anotherSuccFinishMilestone = anotherSuccWork.finishMilestone;
              if (anotherSuccFinishMilestone == succFinishMilestone) {
                cantBeShortenedMap[succFinishMilestone.id] = succFinishMilestone;
              }
            }
          }
        }
      } else {
        cantBeShortenedMap[mSucc.id] = mSucc;
      }
    }

    removeList.length = 0;
    for (i = 0; i < milestone.mSuccessors.length; i++) {
      mSucc = milestone.mSuccessors[i];
      if (!(mSucc.id in cantBeShortenedMap)) {
        succId = String(mSucc.successors[0].get(anychart.enums.DataField.ID));
        succWork = this.worksMap_[succId];
        milestoneToRemove = succWork.startMilestone;
        succWork.startMilestone = milestone;
        goog.array.insert(milestone.successors, succWork.item);
        removeList.push(milestoneToRemove);
      }
    }

    for (i = 0; i < removeList.length; i++) {
      rem = removeList[i];
      goog.array.remove(milestone.mSuccessors, rem);
      delete this.milestonesMap_[rem.id];
    }
  }

  //Second passage. Clearing structure like Mil -> Work -> Mil -> dummy -> Mil.
  for (uid in this.milestonesMap_) {
    milestone = this.milestonesMap_[uid];
    cantBeShortenedMap = {};

    for (i = 0; i < milestone.mPredecessors.length; i++) {
      mPred = milestone.mPredecessors[i];

      if (mPred.predecessors.length == 1 && mPred.mSuccessors.length < 2 && !mPred.successors.length) {
        //if (mPred.predecessors.length == 1 && mPred.mSuccessors.length < 2 && !mPred.successors.length) {
        predId = String(mPred.predecessors[0].get(anychart.enums.DataField.ID));
        predWork = this.worksMap_[predId];
        var predStartMilestone = predWork.startMilestone;
        for (j = 0; j < milestone.mPredecessors.length; j++) {
          if (i != j) { //not same.
            var anotherPred = milestone.mPredecessors[j];
            if (anotherPred.predecessors.length == 1) {
              var anotherPredId = String(anotherPred.predecessors[0].get(anychart.enums.DataField.ID));
              var anotherPredWork = this.worksMap_[anotherPredId];
              var anotherPredStartMilestone = anotherPredWork.startMilestone;
              if (anotherPredStartMilestone == predStartMilestone) {
                cantBeShortenedMap[mPred.id] = mPred;
              }
            }
          }
        }
      } else {
        cantBeShortenedMap[mPred.id] = mPred;
      }
    }

    removeList.length = 0;
    for (i = 0; i < milestone.mPredecessors.length; i++) {
      mPred = milestone.mPredecessors[i];
      if (!(mPred.id in cantBeShortenedMap)) {
        predId = String(mPred.predecessors[0].get(anychart.enums.DataField.ID));
        predWork = this.worksMap_[predId];
        milestoneToRemove = predWork.finishMilestone;
        predWork.finishMilestone = milestone;
        goog.array.insert(milestone.predecessors, predWork.item);
        removeList.push(milestoneToRemove);
      }
    }

    for (i = 0; i < removeList.length; i++) {
      rem = removeList[i];
      goog.array.remove(milestone.mPredecessors, rem);
      delete this.milestonesMap_[rem.id];
    }
  }

};


/**
 * Calculates milestones.
 * @private
 */
anychart.charts.Pert.prototype.calculateMilestones_ = function() {
  this.milestonesLocation_.length = 0;
  this.milestonesMap_ = {};
  this.createAllMilestones_();
  // this.createAllGammaMilestones_();
  this.clearExcessiveMilestones_();
};


/**
 * Finds most left milestone in face.
 * @param {Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>} face - Face.
 * @return {number}
 * @private
 */
anychart.charts.Pert.prototype.getMostLeftIndex_ = function(face) {
  var minLevel = Infinity;
  var index = 0;
  for (var i = 0; i < face.length; i++) {
    var mil = face[i];
    if (!mil.level) // level is 0.
      return i;

    if (mil.level < minLevel) {
      minLevel = mil.level;
      index = i;
    }
  }
  return index;
};


/**
 * Goes by cycle in face and gets milestones symmetrically.
 * @param {Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>} face - Face.
 * @param {number} startIndex - Index of most left item in face.
 * @param {number} offset - Offset from startIndex back and forth.
 * @return {Array.<(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)>} - [Upper item, Lower item].
 * @private
 */
anychart.charts.Pert.prototype.stepInFace_ = function(face, startIndex, offset) {
  var upperIndex = goog.math.modulo(startIndex + offset, face.length);
  var lowerIndex = goog.math.modulo(startIndex - offset, face.length);
  return [face[upperIndex], face[lowerIndex]];
};


/**
 * Calculates data for customized gamma-algorithm.
 * @private
 */
anychart.charts.Pert.prototype.calculateGamma_ = function() {
  this.prepareGamma_();
  this.buildPaths_();
  this.cutEdges_();
  this.gamma_();
  this.calculateLevels_();
};


/**
 * Creates edge and registers it into this.edgesMap_.
 * @param {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} from - From-milestone.
 * @param {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} to - To-milestone.
 * @return {anychart.charts.Pert.Edge} - Edge.
 * @private
 */
anychart.charts.Pert.prototype.createEdge_ = function(from, to) {
  var edge = {
    from: from,
    to: to,
    flag: false,
    flagPlotted: false,
    work: null,
    id: '',
    isCritical: false
  };

  var hash = this.hash_('e', edge);
  edge.id = hash;
  this.edgesMap_[hash] = edge;
  goog.array.insert(from.edges, edge);
  goog.array.insert(to.edges, edge);
  return edge;
};


/**
 * Preparing data form gamma-algorithm implementation.
 * @private
 */
anychart.charts.Pert.prototype.prepareGamma_ = function() {
  this.edgesMap_ = {};
  var edge;
  for (var i in this.milestonesMap_) {
    var mil = this.milestonesMap_[i];
    var j;
    for (j = 0; j < mil.successors.length; j++) {
      var succ = mil.successors[j];
      var succId = String(succ.get(anychart.enums.DataField.ID));
      var work = this.worksMap_[succId];
      edge = this.createEdge_(mil, work.finishMilestone);
      edge.work = work;
      edge.isCritical = work.isCritical;
    }

    for (j = 0; j < mil.mSuccessors.length; j++) {
      var mSucc = mil.mSuccessors[j];
      edge = this.createEdge_(mil, mSucc);
      edge.isCritical = mil.isCritical && mSucc.isCritical;
    }
  }
};


/**
 * Building paths of graph.
 * @private
 */
anychart.charts.Pert.prototype.buildPaths_ = function() {
  this.paths_.length = 0;
  this.startMilestone_.level = 0;
  var stack = [this.startMilestone_];

  var path = [];
  while (stack.length) {
    var mil = stack.pop();
    var level = mil.level;
    if (path.length > level)
      path.length = level;
    path.push(mil);

    if (mil == this.finishMilestone_)
      this.paths_.push(path.slice(0));

    var j, lev;
    for (j = mil.successors.length; j--;) {
      var succ = mil.successors[j];
      var succId = String(succ.get(anychart.enums.DataField.ID));
      var succWork = this.worksMap_[succId];
      var succMil = succWork.finishMilestone;
      lev = level + 1;
      succMil.level = Math.max(lev, succMil.level);
      this.maxLevel_ = Math.max(succMil.level, this.maxLevel_);
      stack.push(succMil);
    }
    for (j = mil.mSuccessors.length; j--;) {
      var mSucc = mil.mSuccessors[j];
      lev = level + 1;
      mSucc.level = Math.max(lev, mSucc.level);
      this.maxLevel_ = Math.max(mSucc.level, this.maxLevel_);
      stack.push(mSucc);
    }
  }
};


/**
 * Cuts edges.
 * If level of edge's from-milestone differs from level of edge's
 * to-milestone for more than 1, we cut an edge inserting fake milestones
 * and fake edges.
 * @private
 */
anychart.charts.Pert.prototype.cutEdges_ = function() {
  for (var i in this.edgesMap_) {
    var edge = this.edgesMap_[i];
    if (!edge.isFake) {
      var from = edge.from;
      var to = edge.to;
      var diff = to.level - from.level;
      if (diff > 1) {
        var previousMilestone = null;
        var fakeMilestone;
        var succFakeEdge, predFakeEdge;
        for (var j = 0; j < diff - 1; j++) {
          var createPredEdge = !previousMilestone;
          previousMilestone = previousMilestone || from;

          fakeMilestone = {
            isFake: true,
            id: null,
            label: ('Fake milestone ' + j),
            level: (from.level + 1 + j),
            isCritical: edge.isCritical,
            flag: false,
            flagPlotted: false,
            edges: [],
            predFakeEdge: null,
            succFakeEdge: null,
            mPredecessors: [previousMilestone],
            mSuccessors: [],
            realEdge: edge,
            successors: [],
            predecessors: []
          };
          fakeMilestone.id = this.hash_('fm', fakeMilestone);
          this.milestonesMap_[fakeMilestone.id] = /** @type {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} */ (fakeMilestone);

          if (createPredEdge) {
            predFakeEdge = {
              isFake: true,
              from: previousMilestone,
              to: fakeMilestone,
              flag: false,
              flagPlotted: false,
              work: edge.work,
              id: null,
              isCritical: edge.isCritical,
              realEdge: edge
            };
            predFakeEdge.id = this.hash_('fe', predFakeEdge);
            this.edgesMap_[predFakeEdge.id] = /** @type {anychart.charts.Pert.FakeEdge} */ (predFakeEdge);
          } else {
            predFakeEdge = previousMilestone.succFakeEdge;
            predFakeEdge.to = /** @type {(anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone)} */ (fakeMilestone);
          }


          succFakeEdge = /** @type {anychart.charts.Pert.FakeEdge} */ ({
            isFake: true,
            from: fakeMilestone,
            to: null,
            flag: false,
            flagPlotted: false,
            work: edge.work,
            id: null,
            isCritical: edge.isCritical,
            realEdge: edge
          });
          succFakeEdge.id = this.hash_('fe', succFakeEdge);
          this.edgesMap_[succFakeEdge.id] = /** @type {(anychart.charts.Pert.Edge|anychart.charts.Pert.FakeEdge)} */ (succFakeEdge);

          fakeMilestone.succFakeEdge = /** @type {anychart.charts.Pert.FakeEdge} */ (succFakeEdge);
          fakeMilestone.predFakeEdge = /** @type {anychart.charts.Pert.FakeEdge} */ (predFakeEdge);
          fakeMilestone.edges = /** @type {Array.<(anychart.charts.Pert.Edge|anychart.charts.Pert.FakeEdge)>} */ ([succFakeEdge, predFakeEdge]);

          if (previousMilestone.isFake) {
            previousMilestone.mSuccessors.push(fakeMilestone);
            previousMilestone.succFakeEdge.to = /** @type {anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone} */ (fakeMilestone);
          } else {
            if (!edge.work) {
              goog.array.remove(previousMilestone.mSuccessors, to);
              goog.array.insert(previousMilestone.mSuccessors, fakeMilestone);
            }
            goog.array.remove(previousMilestone.edges, edge);
            goog.array.insert(previousMilestone.edges, predFakeEdge);
          }

          previousMilestone = fakeMilestone;
        }
        succFakeEdge.to = to;
        goog.array.remove(to.mPredecessors, from);
        goog.array.insert(to.mPredecessors, fakeMilestone);
        fakeMilestone.mSuccessors.push(to);

        var indexOfToEdge = goog.array.indexOf(to.edges, edge);
        if (indexOfToEdge < 0) indexOfToEdge = 0;
        goog.array.splice(to.edges, indexOfToEdge, 1, succFakeEdge);
        delete this.edgesMap_[edge.id];
      }
    }
  }
};


/**
 * Customized gamma-algorithm implementation.
 * @private
 */
anychart.charts.Pert.prototype.gamma_ = function() {
  this.faces_.length = 0;
  this.startMilestone_.flagPlotted = this.finishMilestone_.flagPlotted = true;
  var currFlag = false;
  var segments = this.createSegments_(currFlag);

  // at this point all vertices except start and finish are flagged true
  var faces = [[this.startMilestone_, this.finishMilestone_]];
  var next;

  while (next = this.getNextSegmentAndFace_(segments, faces)) {
    this.plotSegment_(segments, faces, next[0], next[1]);
    segments = this.createSegments_(currFlag = !currFlag);
  }

  this.faces_ = faces;
};


/**
 * Creates segments.
 * @param {boolean} currentFalseFlag - Current false flag.
 * @return {Array.<anychart.charts.Pert.Segment>}
 * @private
 */
anychart.charts.Pert.prototype.createSegments_ = function(currentFalseFlag) {
  var i, j, edge;
  var segments = [];

  for (i in this.edgesMap_) {
    edge = this.edgesMap_[i];
    if (!edge.flagPlotted && edge.flag == currentFalseFlag) {
      edge.flag = !currentFalseFlag;
      var segment = {
        vertices: {},
        edges: {}
      };
      segment.vertices[edge.from.id] = edge.from;
      segment.vertices[edge.to.id] = edge.to;
      segment.edges[edge.id] = edge;
      var stack = [];
      if (!edge.from.flagPlotted && edge.from.flag == currentFalseFlag) {
        edge.from.flag = !currentFalseFlag;
        stack.push(edge.from);
      }

      if (!edge.to.flagPlotted && edge.to.flag == currentFalseFlag) {
        edge.to.flag = !currentFalseFlag;
        stack.push(edge.to);
      }

      while (stack.length) {
        var startMil = stack.pop();
        for (j = 0; j < startMil.edges.length; j++) {
          edge = startMil.edges[j];
          if (!edge.flagPlotted && edge.flag == currentFalseFlag) {
            edge.flag = !currentFalseFlag;
            segment.edges[edge.id] = edge;
            var finishMil = edge.from == startMil ? edge.to : edge.from;
            if (!finishMil.flagPlotted && finishMil.flag == currentFalseFlag) {
              finishMil.flag = !currentFalseFlag;
              stack.push(finishMil);
            }
            segment.vertices[finishMil.id] = finishMil;
          }
        }
      }
      segments.push(segment);
    }
    edge.flag = !currentFalseFlag;
  }

  for (i in this.milestonesMap_) {
    this.milestonesMap_[i].flag = !currentFalseFlag;
  }

  return segments;
};


/**
 * Gets next segment and face.
 * @param {Array.<anychart.charts.Pert.Segment>} segments - Segments.
 * @param {Array.<Array.<anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone>>} faces - Faces.
 * @return {Array.<number>} - An index of the segment, that should be plotted next and an index of the face to plot to.
 * @private
 */
anychart.charts.Pert.prototype.getNextSegmentAndFace_ = function(segments, faces) {
  var i, j, k;
  var result = null;
  var minFacesCount = Infinity;
  for (i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var facesCount = 0;
    var firstFace = -1;
    for (j = 0; j < faces.length; j++) {
      var face = /** @type {Array.<anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone>} */ (faces[j]);
      var containedInFace = true;
      for (k in segment.vertices) {
        var mil = segment.vertices[k];
        if (mil.flagPlotted) { // contact vertex
          if (face.indexOf(mil) < 0) { // if we have found a contact vertex that is not in the face - exit the cycle
            containedInFace = false;
            break;
          }
        }
      }
      if (containedInFace) { // if the face contains all contact vertices, increasing the counter
        facesCount++;
        if (firstFace < 0) // if it was the first acceptable face - memorize it
          firstFace = j;
        if (facesCount >= minFacesCount) // if there is a segment with less faces count - exit the cycle
          break;
      }
    }
    if (!facesCount)
      throw 'non planar!';
    if (facesCount < minFacesCount) {
      result = [i, firstFace];
      minFacesCount = facesCount;
    }
  }
  // we return an index of the segment, that should be plotted next and an index of the face to plot to
  return result;
};


/**
 * Plots segments.
 * @param {Array.<anychart.charts.Pert.Segment>} segments - Segments.
 * @param {Array.<Array.<anychart.charts.Pert.Milestone>>} faces - Faces.
 * @param {number} segmentIndex - Segments index.
 * @param {number} faceIndex - Face index.
 * @private
 */
anychart.charts.Pert.prototype.plotSegment_ = function(segments, faces, segmentIndex, faceIndex) {
  var milestone;
  var segment = segments[segmentIndex];
  var leftMost = null;
  for (var i in segment.edges) {
    milestone = segment.edges[i].from;
    if (milestone.flagPlotted) { // contact
      if (!leftMost || leftMost.level > milestone.level) {
        leftMost = milestone;
      }
    }
  }
  //if (leftMost == null) debugger;
  var path = [leftMost];
  milestone = leftMost;
  while (milestone) {
    var edges = milestone.edges;
    var next = null;
    for (i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (edge.from == milestone && !edge.flagPlotted) { // looking for outgoing edges only, that are not plotted yet
        edge.flagPlotted = true;
        var finMilestone = edge.to;
        path.push(finMilestone);
        if (!finMilestone.flagPlotted) {
          finMilestone.flagPlotted = true;
          next = finMilestone;
        }
        break;
      }
    }
    milestone = next;
  }
  var face = faces[faceIndex];
  var cutResult = this.cutFace_(face, path);
  goog.array.splice(faces, faceIndex, 1, cutResult[0], cutResult[1]);
};


/**
 * Cuts face.
 * @param {Array.<anychart.charts.Pert.Milestone>} face - Face.
 * @param {Array.<anychart.charts.Pert.Milestone>} path - Path.
 * @return {Array.<Array.<string>>} - Cut face.
 * @private
 */
anychart.charts.Pert.prototype.cutFace_ = function(face, path) {
  var v1 = path[0];
  var v2 = path[path.length - 1];
  var index1 = face.indexOf(v1);
  var index2 = face.indexOf(v2);
  var min, max, inverted;
  if (index1 < index2) {
    min = index1;
    max = index2;
    inverted = false;
  } else {
    min = index2;
    max = index1;
    inverted = true;
  }
  var i;

  var face1 = face.slice(0, min);
  if (inverted) {
    for (i = path.length; i--;) {
      face1.push(path[i]);
    }
  } else {
    face1.push.apply(face1, path);
  }
  face1.push.apply(face1, face.slice(max + 1));

  var face2 = face.slice(min + 1, max);
  if (inverted) {
    face2.push.apply(face2, path);
  } else {
    for (i = path.length; i--;) {
      face2.push(path[i]);
    }
  }
  return [face1, face2];
};


/**
 * Calculates levels.
 * @private
 */
anychart.charts.Pert.prototype.calculateLevels_ = function() {
  this.milestonesLocation_[0] = [this.startMilestone_];
  this.milestonesLocation_[this.maxLevel_] = [this.finishMilestone_];
  if (this.faces_.length > 2) {
    for (var i = 0; i < this.faces_.length; i++) {
      var face = this.faces_[i];
      var mostLeftIndex = this.getMostLeftIndex_(/** @type {Array.<anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone>} */ (face));
      var offset = 0;

      var upper, lower, stepData;
      while (true) {
        offset += 1;
        stepData = this.stepInFace_(/** @type {Array.<anychart.charts.Pert.Milestone|anychart.charts.Pert.FakeMilestone>} */ (face), mostLeftIndex, offset);
        upper = stepData[0];
        lower = stepData[1];
        /*
          NOTE:
          (upper != lower && (upper == this.finishMilestone_ || lower == this.finishMilestone_)
          Condition above literally means that our face is not one of main faces
          where this.startMilestone_ and this.finishMilestone_ are neighbours.
         */
        if ((upper == lower) ||
            (upper != lower && (upper == this.finishMilestone_ || lower == this.finishMilestone_)))
          break;

        upper.lowerMilestone = lower;
        lower.upperMilestone = upper;
      }
    }
  }

  for (var j in this.milestonesMap_) {
    var mil = this.milestonesMap_[j];
    if (mil != this.startMilestone_ && mil != this.finishMilestone_ && !mil.upperMilestone) {
      var level = mil.level;
      this.milestonesLocation_[level] = [mil];
      var child = mil;
      while (child.lowerMilestone) {
        this.milestonesLocation_[level].push(child.lowerMilestone);
        child = child.lowerMilestone;
      }
    }
  }
};

//endregion


//region -- Visual settings for tasks and milestones.
//----------------------------------------------------------------------------------------------------------------------
//
//  Visual settings for tasks and milestones.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets milestones settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.charts.Pert|anychart.core.pert.Milestones} - Chart itself or milestones settings object.
 */
anychart.charts.Pert.prototype.milestones = function(opt_value) {
  if (!this.milestones_) {
    this.milestones_ = new anychart.core.pert.Milestones();
    this.milestones_.listenSignals(this.onMilestonesSignal_, this);
    //Milestones labels don't need to have a parent event target like tasks - labels are inactive.
  }

  if (goog.isDef(opt_value)) {
    this.milestones_.setup(opt_value);
    return this;
  }
  return this.milestones_;
};


/**
 * Listener for milestones invalidation.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.charts.Pert.prototype.onMilestonesSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    state |= anychart.ConsistencyState.PERT_LABELS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    state |= anychart.ConsistencyState.PERT_APPEARANCE;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets/sets tasks settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.charts.Pert|anychart.core.pert.Tasks} - Chart itself or tasks settings object.
 */
anychart.charts.Pert.prototype.tasks = function(opt_value) {
  if (!this.tasks_) {
    this.tasks_ = new anychart.core.pert.Tasks();
    this.tasks_.listenSignals(this.onTasksSignal_, this);
    this.tasks_.setLabelsParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    this.tasks_.setup(opt_value);
    return this;
  }
  return this.tasks_;
};


/**
 * Listener for tasks invalidation.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.charts.Pert.prototype.onTasksSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    state |= anychart.ConsistencyState.PERT_LABELS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    state |= anychart.ConsistencyState.PERT_APPEARANCE;
  }

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets/sets critical path settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.charts.Pert|anychart.core.pert.CriticalPath} - Chart itself or critical path settings object.
 */
anychart.charts.Pert.prototype.criticalPath = function(opt_value) {
  if (!this.criticalPath_) {
    this.criticalPath_ = new anychart.core.pert.CriticalPath();
    this.criticalPath_.milestones().listenSignals(this.onMilestonesSignal_, this);
    this.criticalPath_.tasks().setLabelsParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    this.criticalPath_.setup(opt_value);
    return this;
  }
  return this.criticalPath_;
};
//endregion


//region -- Drawing.
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Milestone layer appearance callback.
 * @param {acgraph.vector.Element} element - Element.
 * @param {number} index - Index.
 * @private
 */
anychart.charts.Pert.prototype.milestonesLayerAppearanceCallback_ = function(element, index) {
  var fill, stroke;
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      var milestone = tag['m'];
      var source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();

      fill = /** @type {acgraph.vector.Fill} */ (milestone.isSelected ? source.selectFill() : source.fill());
      stroke = /** @type {acgraph.vector.Stroke} */ (milestone.isSelected ? source.selectStroke() : source.stroke());
      /** @type {acgraph.vector.Path} */ (element).fill(fill).stroke(stroke);

      var lf = /** @type {anychart.core.ui.LabelsFactory} */ (milestone.isSelected ? source.selectLabels() : source.labels());
      var labelEnabled = !!lf.enabled();
      milestone.relatedLabel.currentLabelsFactory(lf);
      milestone.relatedLabel.enabled(labelEnabled);
      milestone.relatedLabel.draw();
    }
  }
};


/**
 * Work layer appearance callback.
 * @param {acgraph.vector.Element} element - Element.
 * @param {number} index - Index.
 * @private
 */
anychart.charts.Pert.prototype.worksLayerAppearanceCallback_ = function(element, index) {
  var fill, stroke;
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['w'])) {
      var work = tag['w'];
      var source = work.isCritical ? this.criticalPath().tasks() : this.tasks();
      fill = /** @type {acgraph.vector.Fill} */ (work.isSelected ? source.selectFill() : source.fill());
      stroke = /** @type {acgraph.vector.Stroke} */ (work.isSelected ? source.selectStroke() : source.stroke());
      /** @type {acgraph.vector.Path} */ (element).fill(fill).stroke(stroke);

      var upperLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectUpperLabels() : source.upperLabels());
      var lowerLf = /** @type {anychart.core.ui.LabelsFactory} */ (work.isSelected ? source.selectLowerLabels() : source.lowerLabels());
      work.upperLabel.currentLabelsFactory(upperLf);
      work.upperLabel.enabled(!!upperLf.enabled());
      work.upperLabel.draw();
      work.lowerLabel.currentLabelsFactory(lowerLf);
      work.lowerLabel.enabled(!!lowerLf.enabled());
      work.lowerLabel.draw();
    } else if (goog.isDefAndNotNull(tag['d'])) {
      var isCrit = tag['d']; //Rendered and not rendered cases.
      source = isCrit ? this.criticalPath().tasks() : this.tasks();
      fill = /** @type {acgraph.vector.Fill} */ (source.dummyFill());
      stroke = /** @type {acgraph.vector.Stroke} */ (source.dummyStroke());
      /** @type {acgraph.vector.Path} */ (element).fill(fill).stroke(stroke);
    }
  }
};


/** @inheritDoc */
anychart.charts.Pert.prototype.drawContent = function(bounds) {
  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.PERT_CALCULATIONS)) {
    this.calculateActivities_();
    this.markConsistent(anychart.ConsistencyState.PERT_CALCULATIONS);
  }

  if (!this.baseLayer_) { //Dom init.
    this.baseLayer_ = this.rootElement.layer();
    this.registerDisposable(this.baseLayer_);

    this.activitiesLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    });
    this.activitiesLayer_.zIndex(1);
    this.activitiesLayer_.parent(this.baseLayer_);

    this.interactivityLayer_ = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      path.fill('none').stroke({'color': '#fff', 'opacity': 0.0001, 'thickness': 6});
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    });
    this.interactivityLayer_.zIndex(2);
    this.interactivityLayer_.parent(this.baseLayer_);

    this.milestonesLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.milestonesLayer_.zIndex(3);
    this.milestonesLayer_.parent(this.baseLayer_);

    this.labelsLayer_ = this.baseLayer_.layer();
    this.labelsLayer_.zIndex(4);

    this.milestones().labelsContainer(this.labelsLayer_);
    this.criticalPath().milestones().labelsContainer(this.labelsLayer_);
    this.tasks().labelsContainer(this.labelsLayer_);
    this.criticalPath().tasks().labelsContainer(this.labelsLayer_);
  }

  if (!this.milestones().tooltip().container()) {
    this.milestones().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  }

  if (!this.tasks().tooltip().container()) {
    this.tasks().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  }

  if (!this.criticalPath().milestones().tooltip().container()) {
    this.criticalPath().milestones().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  }

  if (!this.criticalPath().tasks().tooltip().container()) {
    this.criticalPath().tasks().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.activitiesLayer_.clear();
    this.interactivityLayer_.clear();
    this.milestonesLayer_.clear();
    this.milestones().clearLabels();
    this.tasks().clearLabels();
    this.criticalPath().milestones().clearLabels();
    this.criticalPath().tasks().clearLabels();

    var i, j;
    var left, top;
    left = bounds.left;
    var str, src, pixelShift;
    for (i = 0; i < this.milestonesLocation_.length; i++) {
      var milVertical = this.milestonesLocation_[i];
      if (milVertical) {
        top = bounds.top;

        for (j = 0; j < milVertical.length; j++) {
          var milestone = milVertical[j];
          if (milestone) {
            if (!milestone.isFake) {
              var milPath = this.milestonesLayer_.genNextChild();
              src = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
              str = milestone.isSelected ? src.selectStroke() : src.stroke();
              pixelShift = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (str)) % 2 == 0 ? 0 : 0.5;

              switch (this.milestones().shape()) {
                case anychart.enums.MilestoneShape.RHOMBUS:
                  milPath.moveTo(left + pixelShift, top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2)
                      .lineTo(left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2, top + pixelShift)
                      .lineTo(left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_, top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2)
                      .lineTo(left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2, top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_)
                      .close();
                  break;
                case anychart.enums.MilestoneShape.RECTANGLE:
                  milPath.moveTo(left + pixelShift, top + pixelShift)
                      .lineTo(left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_, top + pixelShift)
                      .lineTo(left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_, top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_)
                      .lineTo(left + pixelShift, top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_)
                      .close();
                  break;
                case anychart.enums.MilestoneShape.CIRCLE:
                default:
                  var radius = anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;
                  milPath.moveTo(left + pixelShift + radius + radius, top + pixelShift + radius)
                      .arcTo(radius, radius, 0, 360);
              }

              milPath.tag = {'m': milestone};
              milestone.relatedPath = /** @type {acgraph.vector.Path} */ (milPath);

              var labelContextProvider = this.createFormatProvider(true, void 0, void 0, /** @type {anychart.charts.Pert.Milestone} */ (milestone));
              var labelsSource = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
              var label = labelsSource.labels().add(labelContextProvider, {'value': {'x': left, 'y': top}});
              label.width(anychart.charts.Pert.CELL_PIXEL_SIZE_);
              label.height(anychart.charts.Pert.CELL_PIXEL_SIZE_);
              milestone.relatedLabel = label;
            }
            milestone.left = left;
            milestone.top = top;

          }
          top += (anychart.charts.Pert.CELL_PIXEL_SIZE_ + anychart.charts.Pert.CELL_PIXEL_VERTICAL_SPACE_);
        }
      }
      left += (anychart.charts.Pert.CELL_PIXEL_SIZE_ + anychart.charts.Pert.CELL_PIXEL_HORIZONTAL_SPACE_);
    }

    for (i in this.edgesMap_) {
      var edge = this.edgesMap_[i];
      var from = edge.from;
      var to = edge.to;
      var work = edge.work ? edge.work : void 0;

      var activity = work ? this.activitiesMap_[work.id] : void 0;
      var path, interactPath;
      var isCrit = edge.isCritical;

      if (!from.isFake) { //Ignoring non-start fake edges.
        path = this.activitiesLayer_.genNextChild();
        interactPath = this.interactivityLayer_.genNextChild();
        path.tag = work ? {'w': work} : {'d': isCrit};
        interactPath.tag = work ? {'w': work} : {'d': isCrit};

        src = edge.isCritical ? this.criticalPath().tasks() : this.tasks();
        if (work) {
          str = work.isSelected ? src.selectStroke() : src.stroke();
          work.relatedPath = /** @type {acgraph.vector.Path} */ (path);
        } else {
          str = src.dummyStroke();
        }
        pixelShift = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (str)) % 2 == 0 ? 0 : 0.5;

        var startLeft = from.left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_;
        var startTop = from.top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;

        path.moveTo(startLeft, startTop);
        interactPath.moveTo(startLeft, startTop);

        var labelLeft, labelTop;
        var degAngle;
        var isFirstEdge = true;

        if (isFirstEdge) {
          labelLeft = (to.left + pixelShift + from.left + anychart.charts.Pert.CELL_PIXEL_HORIZONTAL_SPACE_) / 2;
          labelTop = (to.top + pixelShift + from.top + anychart.charts.Pert.CELL_PIXEL_SIZE_) / 2;
          var angle = Math.atan((to.top - from.top) / anychart.charts.Pert.CELL_PIXEL_HORIZONTAL_SPACE_);
          degAngle = angle * 180 / Math.PI;
          isFirstEdge = false;
        }

        if (edge.isFake) {
          var fakeEdge = edge;
          var toFakeMilestone = fakeEdge.to;

          while (toFakeMilestone.isFake) {
            left = toFakeMilestone.left + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;
            top = toFakeMilestone.top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;
            path.lineTo(left, top);
            interactPath.lineTo(left, top);
            fakeEdge = toFakeMilestone.succFakeEdge;
            toFakeMilestone = fakeEdge.to;
            // if (!toFakeMilestone.isFake) {
            // //TODO (A.Kudryavtsev): draw arrow!!!
            // }
          }
          var stLeft = left;
          var stTop = top;
          var finLeft = toFakeMilestone.left + pixelShift;
          var finTop = toFakeMilestone.top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;

          var arrowAngle = Math.atan((finTop - stTop) / (finLeft - stLeft));
          var arrowCoords = this.getArrowRotation_(stLeft, /** @type {number} */ (stTop), finLeft, finTop);
          var pathLeft = finLeft - anychart.charts.Pert.ARROW_HEIGHT * Math.cos(arrowAngle);
          var pathTop = finTop - anychart.charts.Pert.ARROW_HEIGHT * Math.sin(arrowAngle);
          var left1 = arrowCoords[0];
          var top1 = arrowCoords[1];
          var left2 = arrowCoords[2];
          var top2 = arrowCoords[3];


          path.moveTo(stLeft, stTop)
              .lineTo(pathLeft, pathTop)
              .moveTo(pathLeft, pathTop)
              .lineTo(left1, top1)
              .lineTo(finLeft, finTop)
              .lineTo(left2, top2)
              .close();

          interactPath.lineTo(finLeft, finTop);


        } else {
          var finLeft = to.left + pixelShift;
          var finTop = to.top + pixelShift + anychart.charts.Pert.CELL_PIXEL_SIZE_ / 2;

          var arrowAngle = Math.atan((finTop - startTop) / (finLeft - startLeft));
          var arrowCoords = this.getArrowRotation_(startLeft, startTop, finLeft, finTop);
          var pathLeft = finLeft - anychart.charts.Pert.ARROW_HEIGHT * Math.cos(arrowAngle);
          var pathTop = finTop - anychart.charts.Pert.ARROW_HEIGHT * Math.sin(arrowAngle);
          var left1 = arrowCoords[0];
          var top1 = arrowCoords[1];
          var left2 = arrowCoords[2];
          var top2 = arrowCoords[3];

          path.moveTo(startLeft, startTop)
              .lineTo(pathLeft, pathTop)
              .moveTo(pathLeft, pathTop)
              .lineTo(left1, top1)
              .lineTo(finLeft, finTop)
              .lineTo(left2, top2)
              .close();

          interactPath.lineTo(finLeft, finTop);
        }


        if (work) {
          var labelsSource = isCrit ? this.criticalPath().tasks() : this.tasks();
          var labelContextProvider = this.createFormatProvider(true, work, activity, void 0);
          var upperLabel = labelsSource.upperLabels().add(labelContextProvider, {
            'value': {
              'x': labelLeft + pixelShift,
              'y': labelTop + pixelShift
            }
          });
          upperLabel.width(to.left - from.left);
          upperLabel.height(anychart.charts.Pert.CELL_PIXEL_SIZE_);
          work.upperLabel = upperLabel;
          upperLabel.rotation(degAngle);
          upperLabel.tag = {'w': work};

          var lowerLabel = labelsSource.lowerLabels().add(labelContextProvider, {
            'value': {
              'x': labelLeft + pixelShift,
              'y': labelTop + pixelShift
            }
          });
          lowerLabel.tag = {'w': work};
          upperLabel.width(to.left - from.left);
          upperLabel.height(anychart.charts.Pert.CELL_PIXEL_SIZE_);
          work.lowerLabel = lowerLabel;
          lowerLabel.rotation(degAngle);
          lowerLabel.tag = {'w': work};

        }
      }
    }

    //Colorize created DOM structure.
    this.invalidate(anychart.ConsistencyState.PERT_APPEARANCE | anychart.ConsistencyState.PERT_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PERT_APPEARANCE)) {
    this.milestonesLayer_.forEachChild(this.milestonesLayerAppearanceCallback_, this);
    this.activitiesLayer_.forEachChild(this.worksLayerAppearanceCallback_, this);
    this.invalidate(anychart.ConsistencyState.PERT_LABELS);
    this.markConsistent(anychart.ConsistencyState.PERT_APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PERT_LABELS)) {
    this.milestones().drawLabels();
    this.tasks().drawLabels();
    this.criticalPath().milestones().drawLabels();
    this.criticalPath().tasks().drawLabels();
    this.markConsistent(anychart.ConsistencyState.PERT_LABELS);
  }
};
//endregion


//region -- Util methods.
//----------------------------------------------------------------------------------------------------------------------
//
//  Utils
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Generates uid with prefix.
 * @param {string} prefix - UID prefix.
 * @param {Object} value - Value.
 * @return {string} - UID with prefix.
 * @private
 */
anychart.charts.Pert.prototype.hash_ = function(prefix, value) {
  return prefix + goog.getUid(value);
};


/**
 * Gets arrow rotation coordinates.
 * @param {number} x1 - x1 coordinate.
 * @param {number} y1 - y1coordinate.
 * @param {number} x2 - x2 coordinate.
 * @param {number} y2 - y2 coordinate.
 * @return {Array.<number>} - Array like [arrowLeft1, attowTop1, arrowLeft2, arrowTop2].
 * @private
 */
anychart.charts.Pert.prototype.getArrowRotation_ = function(x1, y1, x2, y2) {
  var angle = Math.atan((y2 - y1) / (x2 - x1));
  var arrowAngle = Math.atan(anychart.charts.Pert.ARROW_BOTTOM / anychart.charts.Pert.ARROW_HEIGHT);

  var hypotenuse = Math.sqrt(anychart.charts.Pert.ARROW_BOTTOM * anychart.charts.Pert.ARROW_BOTTOM +
      anychart.charts.Pert.ARROW_HEIGHT * anychart.charts.Pert.ARROW_HEIGHT);

  var angleDiff = angle - arrowAngle;
  var left1 = x2 - hypotenuse * Math.cos(angleDiff);
  var top1 = y2 - hypotenuse * Math.sin(angleDiff);

  var angleSum = angle + arrowAngle;
  var left2 = x2 - hypotenuse * Math.cos(angleSum);
  var top2 = y2 - hypotenuse * Math.sin(angleSum);

  return [left1, top1, left2, top2];
};
//endregion


//region -- Disposing, serialization
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / deserialization / disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Pert.prototype.disposeInternal = function() {
  this.startActivities_.length = 0;
  this.finishActivities_.length = 0;
  delete this.worksMap_;
  delete this.activitiesMap_;
  delete this.data_;

  goog.disposeAll(this.milestones(), this.tasks(), this.criticalPath());

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.charts.Pert.prototype.serialize = function() {
  var json = anychart.charts.Pert.base(this, 'serialize');
  json['type'] = this.getType();

  if (this.data_)
    json['treeData'] = this.data_.serializeWithoutMeta();

  json['milestones'] = this.milestones().serialize();
  json['tasks'] = this.tasks().serialize();
  json['criticalPath'] = this.criticalPath().serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Pert.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  if ('treeData' in config) this.data(anychart.data.Tree.fromJson(config['treeData']));
  if ('milestones' in config) this.milestones().setupByJSON(config['milestones']);
  if ('tasks' in config) this.tasks().setupByJSON(config['tasks']);
  if ('criticalPath' in config) this.criticalPath().setupByJSON(config['criticalPath']);

  this.expectedTimeCalculator(config['expectedTimeCalculator']);
};
//endregion.


//exports
anychart.charts.Pert.prototype['tasks'] = anychart.charts.Pert.prototype.tasks;
anychart.charts.Pert.prototype['milestones'] = anychart.charts.Pert.prototype.milestones;
anychart.charts.Pert.prototype['criticalPath'] = anychart.charts.Pert.prototype.criticalPath;
anychart.charts.Pert.prototype['data'] = anychart.charts.Pert.prototype.data;
anychart.charts.Pert.prototype['getType'] = anychart.charts.Pert.prototype.getType;
anychart.charts.Pert.prototype['expectedTimeCalculator'] = anychart.charts.Pert.prototype.expectedTimeCalculator;

