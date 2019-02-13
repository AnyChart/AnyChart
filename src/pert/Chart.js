goog.provide('anychart.pertModule.Chart');

goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.format.Context');
goog.require('anychart.pertModule.CriticalPath');
goog.require('anychart.pertModule.Milestones');
goog.require('anychart.pertModule.Tasks');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.treeDataModule.utils');
goog.require('goog.array');



/**
 * Stock chart class.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 */
anychart.pertModule.Chart = function() {
  anychart.pertModule.Chart.base(this, 'constructor');

  this.addThemes('pert');

  /**
   * Data tree.
   * @private {(anychart.treeDataModule.Tree|anychart.treeDataModule.View)}
   */
  this.data_ = null;

  /**
   * Works map.
   * Allows to determine item's successors and predecessors.
   * @private {Object.<string, anychart.pertModule.Chart.Work>}
   */
  this.worksMap_ = {};

  /**
   * Activity data map.
   * Contains calculated values as earliestStart, earliestFinish, latestStart, latestFinish, duration, slack.
   * @private {Object.<string, anychart.pertModule.Chart.ActivityData>}
   */
  this.activitiesMap_ = {};

  /**
   * Levels data.
   * @private {Array.<Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>>}
   */
  this.levels_ = [];

  /**
   * Start activities.
   * NOTE: activities that do not depend on other activities.
   * @private {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>}
   */
  this.startActivities_ = [];

  /**
   * Finish activities.
   * NOTE: activities that are not dependent on other activities.
   * @private {Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>}
   */
  this.finishActivities_ = [];

  /**
   * Format provider.
   * @private {anychart.format.Context}
   */
  this.formatProvider_ = null;

  /**
   * Finish milestone.
   * @private {?anychart.pertModule.Chart.Milestone}
   */
  this.finishMilestone_ = null;

  /**
   * Start milestone.
   * @private {?anychart.pertModule.Chart.Milestone}
   */
  this.startMilestone_ = null;

  /**
   * Location of milestone in a grid.
   * @private {Array.<Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>>}
   */
  this.milestonesLocation_ = [];

  /**
   * Milestones map.
   * @private {Object.<string, (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>}
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
   * Work path interactivity layer. Contains invisible paths to simplify mouse navigation.
   * @private {anychart.core.utils.TypedLayer}
   */
  this.workPathInteractivityLayer_ = null;

  /**
   * Work labels interactivity layer. Contains invisible paths to simplify mouse navigation.
   * @private {anychart.core.utils.TypedLayer}
   */
  this.workLablesInteractivityLayer_ = null;

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
   * @private {anychart.pertModule.Milestones}
   */
  this.milestones_ = null;

  /**
   * Tasks settings object.
   * @private {anychart.pertModule.Tasks}
   */
  this.tasks_ = null;

  /**
   * Critical path settings object.
   * @private {anychart.pertModule.CriticalPath}
   */
  this.criticalPath_ = null;

  /**
   * Selected works.
   * @private {Array.<anychart.pertModule.Chart.Work>}
   */
  this.selectedWorks_ = [];

  /**
   * Selected milestones.
   * @private {Array.<anychart.pertModule.Chart.Milestone>}
   */
  this.selectedMilestones_ = [];

  /**
   * Edges map.
   * @private {Object.<string, (anychart.pertModule.Chart.Edge|anychart.pertModule.Chart.FakeEdge)>}
   */
  this.edgesMap_ = {};

  /**
   * Paths data.
   * @private {Array.<Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>>}
   */
  this.paths_ = [];

  /**
   * Max paths level.
   * @private {number}
   */
  this.maxLevel_ = 0;

  /**
   * Max height in level.
   * @private {number}
   */
  this.maxLevelHeight_ = 0;

  /**
   * Faces calculated by gamma-algorithm.
   * @private {Array.<Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>>}
   */
  this.faces_ = [];

  /**
   * Default tooltip settings from theme.
   * @type {Object}
   * @private
   */
  this.defaultTooltipSettings_ = null;

  /**
   * @type {anychart.core.ui.Tooltip}
   * @private
   */
  this.tooltip_ = null;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, this.clickHandler_,
      this.handleMouseOverAndMove, null, this.handleMouseDown);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['expectedTimeCalculator', anychart.ConsistencyState.PERT_CALCULATIONS, anychart.Signal.NEEDS_REDRAW],
    ['verticalSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['horizontalSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.pertModule.Chart, anychart.core.SeparateChart);


/**
 * Supported signals.
 * @type {number}
 */
anychart.pertModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pertModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.pertModule.Chart.ActivityData;


/**
 * @typedef {{
 *    id: string,
 *    label: string,
 *    successors: Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>,
 *    predecessors: Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>,
 *    mSuccessors: Array.<anychart.pertModule.Chart.Milestone>,
 *    mPredecessors: Array.<anychart.pertModule.Chart.Milestone>,
 *    level: number,
 *    isCritical: boolean,
 *    left: number,
 *    top: number,
 *    isSelected: boolean,
 *    relatedPath: acgraph.vector.Path,
 *    relatedLabel: anychart.core.ui.LabelsFactory.Label,
 *    isStart: boolean,
 *    creator: ?anychart.pertModule.Chart.Work,
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    edges: Array.<(anychart.pertModule.Chart.Edge|anychart.pertModule.Chart.FakeEdge)>,
 *    upperMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    lowerMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    brokenTo: Array.<anychart.pertModule.Chart.Milestone>,
 *    parent: ?anychart.pertModule.Chart.Milestone,
 *    radius: number,
 *    index: number
 * }}
 */
anychart.pertModule.Chart.Milestone;


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
 *    edges: Array.<(anychart.pertModule.Chart.Edge|anychart.pertModule.Chart.FakeEdge)> ,
 *    realEdge: anychart.pertModule.Chart.Edge,
 *    predFakeEdge: anychart.pertModule.Chart.FakeEdge,
 *    succFakeEdge: anychart.pertModule.Chart.FakeEdge,
 *    mSuccessors: Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>,
 *    mPredecessors: Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>,
 *    successors: Array,
 *    predecessors: Array,
 *    upperMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    lowerMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)
 * }}
 */
anychart.pertModule.Chart.FakeMilestone;


/**
 * Work is actually a wrapper for a TreeDataItem.
 *
 * @typedef {{
 *    id: string,
 *    item: (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem),
 *    successors: Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>,
 *    predecessors: Array.<(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)>,
 *    level: number,
 *    startMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    finishMilestone: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    isCritical: boolean,
 *    isSelected: boolean,
 *    relatedPath: acgraph.vector.Path,
 *    arrowPath: acgraph.vector.Path,
 *    upperLabel: anychart.core.ui.LabelsFactory.Label,
 *    lowerLabel: anychart.core.ui.LabelsFactory.Label,
 *    depLeft: Array.<string>,
 *    depRight: Array.<string>,
 *    isProcessed: boolean,
 *    rotation: number,
 *    labelsInteractivityPath: acgraph.vector.Path
 * }}
 */
anychart.pertModule.Chart.Work;


/**
 * Edge data.
 *
 * @typedef {{
 *    from: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    to: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    work: ?anychart.pertModule.Chart.Work,
 *    id: string,
 *    isCritical: boolean
 * }}
 */
anychart.pertModule.Chart.Edge;


/**
 * Fake edge typedef.
 * Fake edge is actually a part of real edge that connects dummy milestones
 * or real milestone and fake one.
 *
 * @typedef {{
 *    isFake: boolean,
 *    from: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    to: (anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone),
 *    flag: boolean,
 *    flagPlotted: boolean,
 *    work: ?anychart.pertModule.Chart.Work,
 *    id: string,
 *    isCritical: boolean,
 *    realEdge: anychart.pertModule.Chart.Edge
 * }}
 */
anychart.pertModule.Chart.FakeEdge;


/**
 * Edge data.
 * @typedef {{
 *    vertices: Object.<string, anychart.pertModule.Chart.Milestone>,
 *    edges: Object.<string, anychart.pertModule.Chart.Edge>
 * }}
 */
anychart.pertModule.Chart.Segment;


//endregion
//region -- Static constants.
/**
 * Base layer z-index.
 * @type {number}
 */
anychart.pertModule.Chart.BASE_LAYER_Z_INDEX = 2;


/**
 * Arrow height.
 * @type {number}
 */
anychart.pertModule.Chart.ARROW_HEIGHT = 10;


/**
 * Arrow half bottom.
 * @type {number}
 */
anychart.pertModule.Chart.ARROW_BOTTOM = 3;


//endregion
//region -- Type and context provider.
/** @inheritDoc */
anychart.pertModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.PERT;
};


/**
 * Creates format provider and applies reference values.
 * @param {boolean=} opt_force - Force create.
 * @param {anychart.pertModule.Chart.Work=} opt_work - Work data.
 * @param {anychart.pertModule.Chart.ActivityData=} opt_activityData - Activity data.
 * @param {anychart.pertModule.Chart.Milestone=} opt_milestone - Milestone data.
 * @return {anychart.format.Context} - Format provider.
 */
anychart.pertModule.Chart.prototype.createFormatProvider = function(opt_force, opt_work, opt_activityData, opt_milestone) {
  if (!this.formatProvider_ || opt_force)
    this.formatProvider_ = new anychart.format.Context();

  var values = {};
  var dataSource = null;

  if (opt_work) {
    values['item'] = {value: opt_work.item, type: anychart.enums.TokenType.UNKNOWN};
    dataSource = opt_work.item;
    values[anychart.enums.DataField.NAME] = {value: opt_work.item.get(anychart.enums.DataField.NAME), type: anychart.enums.TokenType.STRING};

    var pessimistic = opt_work.item.get(anychart.enums.DataField.PESSIMISTIC);
    if (goog.isDef(pessimistic))
      values[anychart.enums.DataField.PESSIMISTIC] = {value: +pessimistic, type: anychart.enums.TokenType.NUMBER};

    var optimistic = opt_work.item.get(anychart.enums.DataField.OPTIMISTIC);
    if (goog.isDef(optimistic))
      values[anychart.enums.DataField.OPTIMISTIC] = {value: +optimistic, type: anychart.enums.TokenType.NUMBER};

    var mostLikely = opt_work.item.get(anychart.enums.DataField.MOST_LIKELY);
    if (goog.isDef(mostLikely))
      values[anychart.enums.DataField.MOST_LIKELY] = {value: +mostLikely, type: anychart.enums.TokenType.NUMBER};

    var duration = opt_work.item.get(anychart.enums.DataField.DURATION);
    if (goog.isDef(duration))
      values[anychart.enums.DataField.DURATION] = {value: +duration, type: anychart.enums.TokenType.NUMBER};

    values['successors'] = {value: opt_work.successors, type: anychart.enums.TokenType.UNKNOWN};
    values['predecessors'] = {value: opt_work.predecessors, type: anychart.enums.TokenType.UNKNOWN};

    values['isCritical'] = {value: opt_work.isCritical, type: anychart.enums.TokenType.STRING};
  }

  if (opt_activityData) {
    values['earliestStart'] = {value: opt_activityData.earliestStart, type: anychart.enums.TokenType.NUMBER};
    values['earliestFinish'] = {value: opt_activityData.earliestFinish, type: anychart.enums.TokenType.NUMBER};
    values['latestStart'] = {value: opt_activityData.latestStart, type: anychart.enums.TokenType.NUMBER};
    values['latestFinish'] = {value: opt_activityData.latestFinish, type: anychart.enums.TokenType.NUMBER};
    if (!goog.isDef(values[anychart.enums.DataField.DURATION]))
      values[anychart.enums.DataField.DURATION] = {value: opt_activityData.duration, type: anychart.enums.TokenType.NUMBER};
    values['slack'] = {value: opt_activityData.slack, type: anychart.enums.TokenType.NUMBER};
    values['variance'] = {value: opt_activityData.variance, type: anychart.enums.TokenType.NUMBER};
  }

  if (opt_milestone) {
    values['successors'] = {value: opt_milestone.successors, type: anychart.enums.TokenType.UNKNOWN};
    values['predecessors'] = {value: opt_milestone.predecessors, type: anychart.enums.TokenType.UNKNOWN};
    values['isCritical'] = {value: opt_milestone.isCritical, type: anychart.enums.TokenType.STRING};
    if (opt_milestone.creator)
      values['creator'] = {value: opt_milestone.creator.item, type: anychart.enums.TokenType.UNKNOWN};
    values['isStart'] = {value: opt_milestone.isStart, type: anychart.enums.TokenType.STRING};
    values['index'] = {value: opt_milestone.index, type: anychart.enums.TokenType.NUMBER};
  }

  this.formatProvider_
      .statisticsSources([this])
      .dataSource(dataSource);

  return /** @type {anychart.format.Context} */ (this.formatProvider_.propagate(values));
};


//endregion
//region -- Tooltip
/** @inheritDoc */
anychart.pertModule.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(0);
  tooltip.chart(this);
  tooltip.listenSignals(this.onTooltipSignal_, this);
  return tooltip;
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.pertModule.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


/**
 * Sets tooltip settings.
 *  NOTE: Suspend tooltip's signals dispatching before calling this method to avoid
 *  applying old this.textInfoCache_ (old contextProvider). Suspension must cover show() method too.
 * @param {Object=} opt_settings1 - Regular tooltip settings (task or milestone).
 * @param {Object=} opt_settings2 - Critical tooltip settings (crit.task or crit.milestone).
 * @private
 */
anychart.pertModule.Chart.prototype.applyTooltipSettings_ = function(opt_settings1, opt_settings2) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var enabled = true;
  if (goog.isBoolean(this.defaultTooltipSettings_['enabled'])) enabled = this.defaultTooltipSettings_['enabled'];
  tooltip.setup(this.defaultTooltipSettings_);

  if (opt_settings1 && goog.isBoolean(opt_settings1['enabled'])) enabled = opt_settings1['enabled'];
  tooltip.setup(opt_settings1);

  if (opt_settings2 && goog.isBoolean(opt_settings2['enabled'])) enabled = opt_settings2['enabled'];
  tooltip.setup(opt_settings2);

  tooltip.enabled(enabled);
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
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @param {Array.<anychart.treeDataModule.Tree.Dependency>=} opt_deps - Dependencies.
 * @return {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.pertModule.Chart)} - Current value or itself for method chaining.
 */
anychart.pertModule.Chart.prototype.data = function(opt_data, opt_fillMethod, opt_deps) {
  if (goog.isDef(opt_data)) {
    if (anychart.utils.instanceOf(opt_data, anychart.treeDataModule.Tree) || anychart.utils.instanceOf(opt_data, anychart.treeDataModule.View)) {
      if (this.data_ != opt_data) {
        if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this);
        this.data_ = /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(opt_data);
      }
    } else {
      if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this);
      this.data_ = new anychart.treeDataModule.Tree(/** @type {Array.<Object>} */(opt_data), opt_fillMethod, opt_deps);
    }
    this.data_.listenSignals(this.dataInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.PERT_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * @inheritDoc
 */
anychart.pertModule.Chart.prototype.resizeHandler = function(evt) {
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
anychart.pertModule.Chart.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.PERT_DATA | anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Abstract methods.
//----------------------------------------------------------------------------------------------------------------------
//
//  Abstract methods implementation.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.pertModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  //TODO (A.Kudryavtsev): Implement.
  return [];
};


/** @inheritDoc */
anychart.pertModule.Chart.prototype.getAllSeries = function() {
  return [];
};


//endregion
//region -- Mouse interactivty.
//----------------------------------------------------------------------------------------------------------------------
//
//  Mouse interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
// /**
//  * Hides tooltips excepting one.
//  * @param {anychart.core.ui.Tooltip=} opt_exception - Tooltip to be left.
//  * @private
//  */
// anychart.pertModule.Chart.prototype.hideOtherTooltips_ = function(opt_exception) {
//   if (opt_exception != this.milestones().tooltip()) this.milestones().tooltip().hide();
//   if (opt_exception != this.tasks().tooltip()) this.tasks().tooltip().hide();
//   if (opt_exception != this.criticalPath().milestones().tooltip()) this.criticalPath().milestones().tooltip().hide();
//   if (opt_exception != this.criticalPath().tasks().tooltip()) this.criticalPath().tasks().tooltip().hide();
// };


/** @inheritDoc */
anychart.pertModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];

  var label;

  var fill, stroke, source;
  var work, activity, milestone;
  var tooltip = /** @type {anychart.core.ui.Tooltip} */ (this.tooltip());
  var critConfig;
  var formatProvider;
  var tag = domTarget.tag;
  var state = anychart.PointState.NORMAL;
  var hideTooltip = true;

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      milestone = tag['m'];
      formatProvider = this.createFormatProvider(true, void 0, void 0, milestone);

      source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
      state = milestone.isSelected ? anychart.PointState.SELECT : anychart.PointState.HOVER;

      fill = source.getFinalFill(state, formatProvider);
      stroke = source.getFinalStroke(state, formatProvider);
      domTarget.fill(fill).stroke(stroke);

      hideTooltip = false;
      critConfig = milestone.isCritical ? this.criticalPath().milestones().getCurrentTooltipConfig() : void 0;
      tooltip.suspendSignalsDispatching();
      this.applyTooltipSettings_(this.milestones().getCurrentTooltipConfig(), critConfig);
      tooltip.showFloat(event['clientX'], event['clientY'], formatProvider);
      tooltip.resumeSignalsDispatching(true);

      label = milestone.relatedLabel;
      if (label) {
        var enabled = true;
        var labels = this.milestones().normal().labels();
        label.setSettings(labels.textSettings());
        enabled = this.labelsEnabled_(labels, enabled);

        if (milestone.isSelected) {
          var selectLabels = this.milestones().selected().labels();
          label.setSettings(selectLabels.textSettings());
          enabled = this.labelsEnabled_(selectLabels, enabled);
        } else {
          var hoverLabels = this.milestones().hovered().labels();
          label.setSettings(hoverLabels.textSettings());
          enabled = this.labelsEnabled_(hoverLabels, enabled);
        }

        if (milestone.isCritical) {
          var critLabels = this.criticalPath().milestones().normal().labels();
          label.setSettings(critLabels.textSettings());
          enabled = this.labelsEnabled_(critLabels, enabled);

          if (milestone.isSelected) {
            var critSelectLabels = this.criticalPath().milestones().selected().labels();
            label.setSettings(critSelectLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectLabels, enabled);
          } else {
            var critHoverLabels = this.criticalPath().milestones().hovered().labels();
            label.setSettings(critHoverLabels.textSettings());
            enabled = this.labelsEnabled_(critHoverLabels, enabled);
          }
        }
        label.enabled(enabled);
        label.draw();
      }

    } else if (goog.isDefAndNotNull(tag['w'])) {
      work = tag['w'];
      activity = this.activitiesMap_[work.id];
      formatProvider = this.createFormatProvider(true, work, activity, void 0);

      state = work.isSelected ? anychart.PointState.SELECT : anychart.PointState.HOVER;
      source = work.isCritical ? this.criticalPath().tasks() : this.tasks();

      fill = source.getFinalFill(state, formatProvider);
      stroke = source.getFinalStroke(state, formatProvider);

      work.relatedPath.stroke(stroke);
      work.arrowPath.fill(fill).stroke(stroke);

      var upperLabel = work.upperLabel;
      var lowerLabel = work.lowerLabel;

      if (upperLabel) {
        var enabled = true;

        var upperLabels = this.tasks().normal().upperLabels();
        upperLabel.setSettings(upperLabels.textSettings());
        enabled = this.labelsEnabled_(upperLabels, enabled);

        if (work.isSelected) {
          var selectUpperLabels = this.tasks().selected().upperLabels();
          upperLabel.setSettings(selectUpperLabels.textSettings());
          enabled = this.labelsEnabled_(selectUpperLabels, enabled);
        } else {
          var hoverUpperLabels = this.tasks().hovered().upperLabels();
          upperLabel.setSettings(hoverUpperLabels.textSettings());
          enabled = this.labelsEnabled_(hoverUpperLabels, enabled);
        }

        if (work.isCritical) {
          var critUpperLabels = this.criticalPath().tasks().normal().upperLabels();
          upperLabel.setSettings(critUpperLabels.textSettings());
          enabled = this.labelsEnabled_(critUpperLabels, enabled);

          if (work.isSelected) {
            var critSelectUpperLabels = this.criticalPath().tasks().selected().upperLabels();
            upperLabel.setSettings(critSelectUpperLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectUpperLabels, enabled);
          } else {
            var critHoverUpperLabels = this.criticalPath().tasks().hovered().upperLabels();
            upperLabel.setSettings(critHoverUpperLabels.textSettings());
            enabled = this.labelsEnabled_(critHoverUpperLabels, enabled);
          }
        }
        upperLabel.enabled(enabled);
        upperLabel.draw();
      }

      if (lowerLabel) {
        var enabled = true;

        var lowerLabels = this.tasks().normal().lowerLabels();
        lowerLabel.setSettings(lowerLabels.textSettings());
        enabled = this.labelsEnabled_(lowerLabels, enabled);

        if (work.isSelected) {
          var selectLowerLabels = this.tasks().selected().lowerLabels();
          lowerLabel.setSettings(selectLowerLabels.textSettings());
          enabled = this.labelsEnabled_(selectLowerLabels, enabled);
        } else {
          var hoverLowerLabels = this.tasks().hovered().lowerLabels();
          lowerLabel.setSettings(hoverLowerLabels.textSettings());
          enabled = this.labelsEnabled_(hoverLowerLabels, enabled);
        }


        if (work.isCritical) {
          var critLowerLabels = this.criticalPath().tasks().normal().lowerLabels();
          lowerLabel.setSettings(critLowerLabels.textSettings());
          enabled = this.labelsEnabled_(critLowerLabels, enabled);

          if (work.isSelected) {
            var critSelectLowerLabels = this.criticalPath().tasks().selected().lowerLabels();
            lowerLabel.setSettings(critSelectLowerLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectLowerLabels, enabled);
          } else {
            var critHoverLowerLabels = this.criticalPath().tasks().hovered().lowerLabels();
            lowerLabel.setSettings(critHoverLowerLabels.textSettings());
            enabled = this.labelsEnabled_(critHoverLowerLabels, enabled);
          }
        }

        lowerLabel.enabled(enabled);
        lowerLabel.draw();
      }

      hideTooltip = false;
      critConfig = work.isCritical ? this.criticalPath().tasks().getCurrentTooltipConfig() : void 0;
      tooltip.suspendSignalsDispatching();
      this.applyTooltipSettings_(this.tasks().getCurrentTooltipConfig(), critConfig);
      tooltip.showFloat(event['clientX'], event['clientY'], formatProvider);
      tooltip.resumeSignalsDispatching(true);
    }
  }

  if (hideTooltip) this.tooltip().hide();
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.pertModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var fill, stroke, source;
  var label;
  var formatProvider;
  var tag = domTarget.tag;
  var state = anychart.PointState.NORMAL;

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      var milestone = tag['m'];
      source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
      formatProvider = this.createFormatProvider(true, void 0, void 0, milestone);
      state = milestone.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

      fill = source.getFinalFill(state, formatProvider);
      stroke = source.getFinalStroke(state, formatProvider);

      label = milestone.relatedLabel;
      if (label) {
        var enabled = true;
        var labels = this.milestones().normal().labels();
        label.setSettings(labels.textSettings());
        enabled = this.labelsEnabled_(labels, enabled);

        if (milestone.isSelected) {
          var selectLabels = this.milestones().selected().labels();
          label.setSettings(selectLabels.textSettings());
          enabled = this.labelsEnabled_(selectLabels, enabled);
        }

        if (milestone.isCritical) {
          var critLabels = this.criticalPath().milestones().normal().labels();
          label.setSettings(critLabels.textSettings());
          enabled = this.labelsEnabled_(critLabels, enabled);

          if (milestone.isSelected) {
            var critSelectLabels = this.criticalPath().milestones().selected().labels();
            label.setSettings(critSelectLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectLabels, enabled);
          }
        }
        label.enabled(enabled);
        label.draw();
      }
      domTarget.fill(fill).stroke(stroke);
    } else if (goog.isDefAndNotNull(tag['w'])) {
      var work = tag['w'];
      var activity = this.activitiesMap_[work.id];

      formatProvider = this.createFormatProvider(true, work, activity, void 0);
      state = work.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

      source = work.isCritical ? this.criticalPath().tasks() : this.tasks();
      fill = source.getFinalFill(state, formatProvider);
      stroke = source.getFinalStroke(state, formatProvider);

      work.relatedPath.stroke(stroke);
      work.arrowPath.fill(fill).stroke(stroke);

      var upperLabel = work.upperLabel;
      var lowerLabel = work.lowerLabel;

      if (upperLabel) {
        var enabled = true;

        var upperLabels = this.tasks().normal().upperLabels();
        upperLabel.setSettings(upperLabels.textSettings());
        enabled = this.labelsEnabled_(upperLabels, enabled);

        if (work.isSelected) {
          var selectUpperLabels = this.tasks().selected().upperLabels();
          upperLabel.setSettings(selectUpperLabels.textSettings());
          enabled = this.labelsEnabled_(selectUpperLabels, enabled);
        }

        if (work.isCritical) {
          var critUpperLabels = this.criticalPath().tasks().normal().upperLabels();
          upperLabel.setSettings(critUpperLabels.textSettings());
          enabled = this.labelsEnabled_(critUpperLabels, enabled);

          if (work.isSelected) {
            var critSelectUpperLabels = this.criticalPath().tasks().selected().upperLabels();
            upperLabel.setSettings(critSelectUpperLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectUpperLabels, enabled);
          }
        }
        upperLabel.enabled(enabled);
        upperLabel.draw();
      }

      if (lowerLabel) {
        var enabled = true;

        var lowerLabels = this.tasks().normal().lowerLabels();
        lowerLabel.setSettings(lowerLabels.textSettings());
        enabled = this.labelsEnabled_(lowerLabels, enabled);

        if (work.isSelected) {
          var selectLowerLabels = this.tasks().selected().lowerLabels();
          lowerLabel.setSettings(selectLowerLabels.textSettings());
          enabled = this.labelsEnabled_(selectLowerLabels, enabled);
        }

        if (work.isCritical) {
          var critLowerLabels = this.criticalPath().tasks().normal().lowerLabels();
          lowerLabel.setSettings(critLowerLabels.textSettings());
          enabled = this.labelsEnabled_(critLowerLabels, enabled);

          if (work.isSelected) {
            var critSelectLowerLabels = this.criticalPath().tasks().selected().lowerLabels();
            lowerLabel.setSettings(critSelectLowerLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectLowerLabels, enabled);
          }
        }
        lowerLabel.enabled(enabled);
        lowerLabel.draw();
      }

    }
  }
};


/**
 * Handler for click event.
 * @param {anychart.core.MouseEvent} event - Event object.
 * @private
 */
anychart.pertModule.Chart.prototype.clickHandler_ = function(event) {
  var ctrl = event.metaKey || event.ctrlKey;
  var i = 0;
  var milestone, work;

  var domTarget = /** @type {acgraph.vector.Element} */ (event['domTarget']);
  var tag = domTarget.tag;

  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory)) {
    var labelIndex = event['labelIndex'];
    var l = event['target'].getLabel(labelIndex);
    tag = l.tag;
  }

  if ((anychart.utils.instanceOf(domTarget, acgraph.vector.Element))) {
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
anychart.pertModule.Chart.prototype.makeInteractivityEvent_ = function() {
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
//region -- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pertModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'expectedTimeCalculator',
      anychart.core.settings.asIsNormalizer);
  function verticalSpacingNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, 20);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'verticalSpacing',
      verticalSpacingNormalizer);
  function horizontalSpacingNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, 20);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'horizontalSpacing',
      horizontalSpacingNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.pertModule.Chart, anychart.pertModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region -- Calculations.
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.pertModule.Chart.prototype.calculate = function() {
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
              var found = this.data_.searchItems(anychart.enums.DataField.ID, dependsOn)[0];
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
anychart.pertModule.Chart.prototype.calculateActivities_ = function() {
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
  this.statistics(anychart.enums.Statistics.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION, Math.sqrt(sum));

  this.markConsistent(anychart.ConsistencyState.PERT_CALCULATIONS);
};


/**
 * Calculates earliest start and earliest finish, latest start and latest finish for given activity.
 * @param {string} id - Activity id.
 * @private
 */
anychart.pertModule.Chart.prototype.calculateActivity_ = function(id) {
  var workData = this.worksMap_[id];

  if (!(id in this.activitiesMap_)) {
    this.activitiesMap_[id] = /** @type {anychart.pertModule.Chart.ActivityData} */ ({});

    var opt = Number(workData.item.get(anychart.enums.DataField.OPTIMISTIC));
    var pess = Number(workData.item.get(anychart.enums.DataField.PESSIMISTIC));
    //Can be NaN
    this.activitiesMap_[id].variance = anychart.math.round(Math.pow(((pess - opt) / 6), 2), 3);
  }

  var activity = this.activitiesMap_[id];

  if (!goog.isDef(activity.duration)) {
    var formatProvider = this.createFormatProvider(false, workData, activity);
    activity.duration = anychart.math.round(/** @type {number} */ (/** @type {Function} */ (this.getOption('expectedTimeCalculator')).call(formatProvider, formatProvider)), 3);
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
    activity.earliestStart = anychart.math.round(max, 3);
    activity.earliestFinish = anychart.math.round(max + duration, 3);
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
      this.statistics(anychart.enums.Statistics.PERT_CHART_PROJECT_DURATION, val);
    }
    activity.latestFinish = anychart.math.round(val, 3);
    activity.latestStart = anychart.math.round(val - duration, 3);
    activity.slack = anychart.math.round(val - activity.earliestFinish, 3);
  }

};


/**
 * Adds mSuccessor and mPredecessor.
 * @param {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} successorMilestone - Successor milestone.
 * @param {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} predecessorMilestone - Predecessor milestone.
 * @return {boolean} - Whether milestones are not the same.
 * @private
 */
anychart.pertModule.Chart.prototype.addMilestoneSuccessors_ = function(successorMilestone, predecessorMilestone) {
  if (successorMilestone == predecessorMilestone) return false;
  goog.array.insert(successorMilestone.mPredecessors, predecessorMilestone);
  goog.array.insert(predecessorMilestone.mSuccessors, successorMilestone);
  return true;
};


/**
 * Creates empty milestone object. Also registers milestone in milestones map.
 * @param {?anychart.pertModule.Chart.Work} creator - Work that creates milestone or null.
 * @param {boolean} isStart - Whether milestone is start.
 * @param {string=} opt_label - Optional label.
 * @return {anychart.pertModule.Chart.Milestone} - Empty object.
 * @private
 */
anychart.pertModule.Chart.prototype.createEmptyMilestone_ = function(creator, isStart, opt_label) {
  var result = /** @type {anychart.pertModule.Chart.Milestone} */ ({
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
    edges: [],
    index: -1
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
anychart.pertModule.Chart.prototype.createAllMilestones_ = function() {
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
        if (!predWork.finishMilestone)
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
 * @param {anychart.pertModule.Chart.Work} work - Work to be processed.
 * @private
 */
anychart.pertModule.Chart.prototype.processWork_ = function(work) {
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
anychart.pertModule.Chart.prototype.createAllGammaMilestones_ = function() {
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
anychart.pertModule.Chart.prototype.clearExcessiveMilestones_ = function() {
  var uid, i, j, mSucc, mPred, milestone;
  var succId, succWork, predId, predWork, cantBeShortenedMap, milestoneToRemove, rem;

  var removeList = [];

  //First passage. Clearing structure like Mil -> dummy -> Mil -> Work -> Mil.
  for (uid in this.milestonesMap_) {
    milestone = this.milestonesMap_[uid];
    cantBeShortenedMap = {};

    for (i = 0; i < milestone.mSuccessors.length; i++) {
      mSucc = milestone.mSuccessors[i];

      if (mSucc.successors.length == 1 && mSucc.mPredecessors.length < 2 && !mSucc.predecessors.length) {
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
anychart.pertModule.Chart.prototype.calculateMilestones_ = function() {
  this.milestonesLocation_.length = 0;
  this.milestonesMap_ = {};
  this.createAllMilestones_();
  // this.createAllGammaMilestones_();
  this.clearExcessiveMilestones_();
};


/**
 * Finds most left milestone in face.
 * @param {Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>} face - Face.
 * @return {number}
 * @private
 */
anychart.pertModule.Chart.prototype.getMostLeftIndex_ = function(face) {
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
 * @param {Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>} face - Face.
 * @param {number} startIndex - Index of most left item in face.
 * @param {number} offset - Offset from startIndex back and forth.
 * @return {Array.<(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)>} - [Upper item, Lower item].
 * @private
 */
anychart.pertModule.Chart.prototype.stepInFace_ = function(face, startIndex, offset) {
  var upperIndex = goog.math.modulo(startIndex + offset, face.length);
  var lowerIndex = goog.math.modulo(startIndex - offset, face.length);
  return [face[upperIndex], face[lowerIndex]];
};


/**
 * Calculates data for customized gamma-algorithm.
 * @private
 */
anychart.pertModule.Chart.prototype.calculateGamma_ = function() {
  this.prepareGamma_();
  this.buildPaths_();
  this.cutEdges_();
  this.gamma_();
  this.calculateLevels_();
};


/**
 * Creates edge and registers it into this.edgesMap_.
 * @param {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} from - From-milestone.
 * @param {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} to - To-milestone.
 * @return {anychart.pertModule.Chart.Edge} - Edge.
 * @private
 */
anychart.pertModule.Chart.prototype.createEdge_ = function(from, to) {
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
anychart.pertModule.Chart.prototype.prepareGamma_ = function() {
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
anychart.pertModule.Chart.prototype.buildPaths_ = function() {
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
anychart.pertModule.Chart.prototype.cutEdges_ = function() {
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
            predecessors: [],
            radius: 0
          };
          fakeMilestone.id = this.hash_('fm', fakeMilestone);
          this.milestonesMap_[fakeMilestone.id] = /** @type {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} */ (fakeMilestone);

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
            this.edgesMap_[predFakeEdge.id] = /** @type {anychart.pertModule.Chart.FakeEdge} */ (predFakeEdge);
          } else {
            predFakeEdge = previousMilestone.succFakeEdge;
            predFakeEdge.to = /** @type {(anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone)} */ (fakeMilestone);
          }


          succFakeEdge = /** @type {anychart.pertModule.Chart.FakeEdge} */ ({
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
          this.edgesMap_[succFakeEdge.id] = /** @type {(anychart.pertModule.Chart.Edge|anychart.pertModule.Chart.FakeEdge)} */ (succFakeEdge);

          fakeMilestone.succFakeEdge = /** @type {anychart.pertModule.Chart.FakeEdge} */ (succFakeEdge);
          fakeMilestone.predFakeEdge = /** @type {anychart.pertModule.Chart.FakeEdge} */ (predFakeEdge);
          fakeMilestone.edges = /** @type {Array.<(anychart.pertModule.Chart.Edge|anychart.pertModule.Chart.FakeEdge)>} */ ([succFakeEdge, predFakeEdge]);

          if (previousMilestone.isFake) {
            previousMilestone.mSuccessors.push(fakeMilestone);
            previousMilestone.succFakeEdge.to = /** @type {anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone} */ (fakeMilestone);
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
anychart.pertModule.Chart.prototype.gamma_ = function() {
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
 * @return {Array.<anychart.pertModule.Chart.Segment>}
 * @private
 */
anychart.pertModule.Chart.prototype.createSegments_ = function(currentFalseFlag) {
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
 * @param {Array.<anychart.pertModule.Chart.Segment>} segments - Segments.
 * @param {Array.<Array.<anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone>>} faces - Faces.
 * @return {Array.<number>} - An index of the segment, that should be plotted next and an index of the face to plot to.
 * @private
 */
anychart.pertModule.Chart.prototype.getNextSegmentAndFace_ = function(segments, faces) {
  var i, j, k;
  var result = null;
  var minFacesCount = Infinity;
  for (i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var facesCount = 0;
    var firstFace = -1;
    for (j = 0; j < faces.length; j++) {
      var face = /** @type {Array.<anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone>} */ (faces[j]);
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
 * @param {Array.<anychart.pertModule.Chart.Segment>} segments - Segments.
 * @param {Array.<Array.<anychart.pertModule.Chart.Milestone>>} faces - Faces.
 * @param {number} segmentIndex - Segments index.
 * @param {number} faceIndex - Face index.
 * @private
 */
anychart.pertModule.Chart.prototype.plotSegment_ = function(segments, faces, segmentIndex, faceIndex) {
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
 * @param {Array.<anychart.pertModule.Chart.Milestone>} face - Face.
 * @param {Array.<anychart.pertModule.Chart.Milestone>} path - Path.
 * @return {Array.<Array.<string>>} - Cut face.
 * @private
 */
anychart.pertModule.Chart.prototype.cutFace_ = function(face, path) {
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
anychart.pertModule.Chart.prototype.calculateLevels_ = function() {
  this.milestonesLocation_[0] = [this.startMilestone_];
  this.milestonesLocation_[this.maxLevel_] = [this.finishMilestone_];
  this.maxLevelHeight_ = 1;
  var i, j;

  if (this.faces_.length > 2) {
    for (i = 0; i < this.faces_.length; i++) {
      var face = this.faces_[i];
      var mostLeftIndex = this.getMostLeftIndex_(/** @type {Array.<anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone>} */ (face));
      var offset = 0;

      var upper, lower, stepData;
      while (true) {
        offset += 1;
        stepData = this.stepInFace_(/** @type {Array.<anychart.pertModule.Chart.Milestone|anychart.pertModule.Chart.FakeMilestone>} */ (face), mostLeftIndex, offset);
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

  for (j in this.milestonesMap_) {
    var mil = this.milestonesMap_[j];
    if (mil != this.startMilestone_ && mil != this.finishMilestone_ && !mil.upperMilestone) {
      var level = mil.level;
      this.milestonesLocation_[level] = [mil];
      var child = mil;
      while (child.lowerMilestone) {
        this.milestonesLocation_[level].push(child.lowerMilestone);
        child = child.lowerMilestone;
        this.maxLevelHeight_ = Math.max(this.maxLevelHeight_, this.milestonesLocation_[level].length);
      }
    }
  }

  var index = 0;
  for (i = 0; i < this.milestonesLocation_.length; i++) {
    var column = this.milestonesLocation_[i];
    for (j = 0; j < column.length; j++) {
      var milestone = column[j];
      if (milestone && !milestone.isFake) {
        milestone.index = index++;
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
 * Listener for milestones invalidation.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.pertModule.Chart.prototype.onMilestonesSignal_ = function(event) {
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
 * Listener for tasks invalidation.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.pertModule.Chart.prototype.onTasksSignal_ = function(event) {
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
 * Gets/sets milestones settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.pertModule.Chart|anychart.pertModule.Milestones} - Chart itself or milestones settings object.
 */
anychart.pertModule.Chart.prototype.milestones = function(opt_value) {
  if (!this.milestones_) {
    this.milestones_ = new anychart.pertModule.Milestones();
    this.setupCreated('milestones', this.milestones_);
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
 * Gets/sets tasks settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.pertModule.Chart|anychart.pertModule.Tasks} - Chart itself or tasks settings object.
 */
anychart.pertModule.Chart.prototype.tasks = function(opt_value) {
  if (!this.tasks_) {
    this.tasks_ = new anychart.pertModule.Tasks();
    this.setupCreated('tasks', this.tasks_);
    this.tasks_.listenSignals(this.onTasksSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.tasks_.setup(opt_value);
    return this;
  }
  return this.tasks_;
};


/**
 * Gets/sets critical path settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.pertModule.Chart|anychart.pertModule.CriticalPath} - Chart itself or critical path settings object.
 */
anychart.pertModule.Chart.prototype.criticalPath = function(opt_value) {
  if (!this.criticalPath_) {
    this.criticalPath_ = new anychart.pertModule.CriticalPath();
    this.criticalPath_.milestones().listenSignals(this.onMilestonesSignal_, this);
    this.criticalPath_.milestones().parent(/** @type {anychart.pertModule.Milestones} */ (this.milestones()));
    this.criticalPath_.tasks().listenSignals(this.onTasksSignal_, this);
    this.criticalPath_.tasks().parent(/** @type {anychart.pertModule.Tasks} */ (this.tasks()));
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
anychart.pertModule.Chart.prototype.milestonesLayerAppearanceCallback_ = function(element, index) {
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      var milestone = tag['m'];
      var source = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();

      var formatProvider = this.createFormatProvider(true, void 0, void 0, milestone);
      var state = milestone.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

      var fill = source.getFinalFill(state, formatProvider);
      var stroke = source.getFinalStroke(state, formatProvider);

      /** @type {acgraph.vector.Path} */ (element).fill(fill).stroke(stroke);
    }
  }
};


/**
 * Milestone layer labels callback.
 * @param {acgraph.vector.Element} element - Element.
 * @param {number} index - Index.
 * @private
 */
anychart.pertModule.Chart.prototype.milestonesLayerLabelsCallback_ = function(element, index) {
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['m'])) {
      var milestone = tag['m'];
      var label = milestone.relatedLabel;
      var enabled = true;
      if (label) {
        var normalLf = this.milestones().normal().labels();
        label.setSettings(normalLf.textSettings());
        enabled = this.labelsEnabled_(normalLf, enabled);
        if (milestone.isSelected) {
          var selectLf = this.milestones().selected().labels();
          label.setSettings(selectLf.textSettings());
          enabled = this.labelsEnabled_(selectLf, enabled);
        }

        if (milestone.isCritical) {
          var critLf = this.criticalPath().milestones().normal().labels();
          label.setSettings(critLf.textSettings());
          enabled = this.labelsEnabled_(critLf, enabled);
          if (milestone.isSelected) {
            var critSelectLf = this.criticalPath().milestones().selected().labels();
            label.setSettings(critSelectLf.textSettings());
            enabled = this.labelsEnabled_(critSelectLf, enabled);
          }
        }
        label.enabled(enabled);
        label.draw();
      }
    }
  }
};


/**
 * Work layer labels callback.
 * @param {acgraph.vector.Element} element - Element.
 * @param {number} index - Index.
 * @private
 */
anychart.pertModule.Chart.prototype.worksLayerLabelsCallback_ = function(element, index) {
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['w'])) {
      var work = tag['w'];
      var path = work.labelsInteractivityPath;
      path.clear();
      path.setTransformationMatrix(1, 0, 0, 1, 0, 0); //Resets rotation.
      var resetMeasure = {'width': null, 'height': null, 'rotation': 0, 'padding': [0, 0, 0, 0]};

      var upperLabel = work.upperLabel;
      var lowerLabel = work.lowerLabel;

      if (upperLabel) {
        var enabled = true;

        var upperLabels = this.tasks().normal().upperLabels();
        enabled = this.labelsEnabled_(upperLabels, enabled);

        upperLabel.setSettings(upperLabels.textSettings());
        if (work.isSelected) {
          var selectUpperLabels = this.tasks().selected().upperLabels();
          upperLabel.setSettings(selectUpperLabels.textSettings());
          enabled = this.labelsEnabled_(selectUpperLabels, enabled);
        }

        if (work.isCritical) {
          var critUpperLabels = this.criticalPath().tasks().normal().upperLabels();
          upperLabel.setSettings(critUpperLabels.textSettings());
          enabled = this.labelsEnabled_(critUpperLabels, enabled);
          if (work.isSelected) {
            var critSelectUpperLabels = this.criticalPath().tasks().selected().upperLabels();
            upperLabel.setSettings(critSelectUpperLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectUpperLabels, enabled);
          }
        }
        upperLabel.enabled(enabled);
        upperLabel.draw();

        var upperBounds = upperLabels.getDimension(upperLabel, void 0, resetMeasure);
        path.moveTo(upperBounds.left, upperBounds.top)
            .lineTo(upperBounds.left + upperBounds.width, upperBounds.top)
            .lineTo(upperBounds.left + upperBounds.width, upperBounds.top + upperBounds.height)
            .lineTo(upperBounds.left, upperBounds.top + upperBounds.height)
            .close();

      }

      if (lowerLabel) {
        var enabled = true;

        var lowerLabels = this.tasks().normal().lowerLabels();
        lowerLabel.setSettings(lowerLabels.textSettings());
        enabled = this.labelsEnabled_(lowerLabels, enabled);
        if (work.isSelected) {
          var selectLowerLabels = this.tasks().selected().lowerLabels();
          lowerLabel.setSettings(selectLowerLabels.textSettings());
          enabled = this.labelsEnabled_(selectLowerLabels, enabled);
        }

        if (work.isCritical) {
          var critLowerLabels = this.criticalPath().tasks().normal().lowerLabels();
          lowerLabel.setSettings(critLowerLabels.textSettings());
          enabled = this.labelsEnabled_(critLowerLabels, enabled);
          if (work.isSelected) {
            var critSelectLowerLabels = this.criticalPath().tasks().selected().lowerLabels();
            lowerLabel.setSettings(critSelectLowerLabels.textSettings());
            enabled = this.labelsEnabled_(critSelectLowerLabels, enabled);
          }
        }
        lowerLabel.enabled(enabled);
        lowerLabel.draw();

        var lowerBounds = lowerLabels.getDimension(lowerLabel, void 0, resetMeasure);
        path.moveTo(lowerBounds.left, lowerBounds.top)
            .lineTo(lowerBounds.left + lowerBounds.width, lowerBounds.top)
            .lineTo(lowerBounds.left + lowerBounds.width, lowerBounds.top + lowerBounds.height)
            .lineTo(lowerBounds.left, lowerBounds.top + lowerBounds.height)
            .close();
      }
      path.rotateByAnchor(work.rotation, anychart.enums.Anchor.CENTER);

    }
  }
};


/**
 * Work layer appearance callback.
 * @param {acgraph.vector.Element} element - Element.
 * @param {number} index - Index.
 * @private
 */
anychart.pertModule.Chart.prototype.worksLayerAppearanceCallback_ = function(element, index) {
  var fill, stroke;
  var formatProvider;
  var tag = element.tag;

  if (tag) {
    if (goog.isDefAndNotNull(tag['w'])) {
      var work = tag['w'];
      var activity = this.activitiesMap_[work.id];

      var source = work.isCritical ? this.criticalPath().tasks() : this.tasks();

      formatProvider = this.createFormatProvider(true, work, activity, void 0);
      var state = work.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

      fill = source.getFinalFill(state, formatProvider);
      stroke = source.getFinalStroke(state, formatProvider);

      if (tag['a']) {
        if (goog.isObject(stroke)) {
          stroke = goog.object.clone(stroke);
          delete stroke['dash'];
        }
        /** @type {acgraph.vector.Path} */ (element).fill(fill);
      }
      /** @type {acgraph.vector.Path} */ (element).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    } else if (goog.isDefAndNotNull(tag['d'])) {
      var isCrit = tag['d']; //Rendered and not rendered cases.
      source = isCrit ? this.criticalPath().tasks() : this.tasks();
      formatProvider = this.createFormatProvider(false, void 0, void 0, void 0);

      fill = source.getFinalDummyFill(formatProvider);
      stroke = source.getFinalDummyStroke(formatProvider);

      if (tag['a']) {
        if (goog.isObject(stroke)) {
          stroke = goog.object.clone(stroke);
          delete stroke['dash'];
        }
        /** @type {acgraph.vector.Path} */ (element).fill(fill);
      }
      /** @type {acgraph.vector.Path} */ (element).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
    }
  }
};


/** @inheritDoc */
anychart.pertModule.Chart.prototype.drawContent = function(bounds) {
  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.PERT_CALCULATIONS)) {
    this.calculateActivities_();
    this.markConsistent(anychart.ConsistencyState.PERT_CALCULATIONS);
  }

  if (!this.baseLayer_) { //Dom init.
    this.baseLayer_ = this.rootElement.layer();

    this.activitiesLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    });
    this.activitiesLayer_.zIndex(1);
    this.activitiesLayer_.parent(this.baseLayer_);

    this.workPathInteractivityLayer_ = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      path.fill('none').stroke({'color': '#fff', 'opacity': 0.0001, 'thickness': 6});
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    });
    this.workPathInteractivityLayer_.zIndex(3);
    this.workPathInteractivityLayer_.parent(this.baseLayer_);

    this.milestonesLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    });
    this.milestonesLayer_.zIndex(3);
    this.milestonesLayer_.parent(this.baseLayer_);

    this.labelsLayer_ = this.baseLayer_.layer();
    this.labelsLayer_.zIndex(4);

    this.workLablesInteractivityLayer_ = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      path.fill({'color': '#fff', 'opacity': 0.0001}).stroke({'color': '#fff', 'opacity': 0.0001, 'thickness': 2});
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
      (/** @type {acgraph.vector.Path} */ (child)).setTransformationMatrix(1, 0, 0, 1, 0, 0);
    });
    this.workLablesInteractivityLayer_.zIndex(5);
    this.workLablesInteractivityLayer_.parent(this.baseLayer_);

    this.milestones().labelsContainer(this.labelsLayer_);
    this.criticalPath().milestones().labelsContainer(this.labelsLayer_);
    this.tasks().labelsContainer(this.labelsLayer_);
    this.criticalPath().tasks().labelsContainer(this.labelsLayer_);

    this.milestones().drawLabels();
    this.tasks().drawLabels();
    this.criticalPath().milestones().drawLabels();
    this.criticalPath().tasks().drawLabels();
  }

  this.tooltip().containerProvider(this);
  this.milestones().tooltip().containerProvider(this);
  this.tasks().tooltip().containerProvider(this);
  this.criticalPath().milestones().tooltip().containerProvider(this);
  this.criticalPath().tasks().tooltip().containerProvider(this);

  // if (!this.tooltip().container()) {
  //   this.tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }

  // if (!this.milestones().tooltip().container()) {
  //   this.milestones().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }
  //
  // if (!this.tasks().tooltip().container()) {
  //   this.tasks().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }
  //
  // if (!this.criticalPath().milestones().tooltip().container()) {
  //   this.criticalPath().milestones().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }
  //
  // if (!this.criticalPath().tasks().tooltip().container()) {
  //   this.criticalPath().tasks().tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.activitiesLayer_.clear();
    this.workPathInteractivityLayer_.clear();
    this.milestonesLayer_.clear();
    this.workLablesInteractivityLayer_.clear();
    this.milestones().clearLabels();
    this.tasks().clearLabels();
    // this.criticalPath().milestones().clearLabels();
    // this.criticalPath().tasks().clearLabels();

    var verticalStep = anychart.utils.normalizeSize(/** @type {number} */ (this.getOption('verticalSpacing')), bounds.height);
    var horizontalStep = anychart.utils.normalizeSize(/** @type {number} */ (this.getOption('horizontalSpacing')), bounds.width);

    var i, j;
    var left, top;
    var str, src, pixelShift;
    var critSource, size;
    var fullSize = (this.maxLevel_ >= this.maxLevelHeight_) ? bounds.width : bounds.height;

    var critSize = anychart.utils.normalizeSize(/** @type {string|number} */ (this.criticalPath().milestones().getOption('size')), fullSize);
    var normSize = anychart.utils.normalizeSize(/** @type {string|number} */ (this.milestones().getOption('size')), fullSize);
    var maxSize = Math.max(normSize, critSize);
    left = bounds.left + maxSize / 2;

    for (i = 0; i < this.milestonesLocation_.length; i++) {
      var milVertical = this.milestonesLocation_[i];
      if (milVertical) {
        top = bounds.top + maxSize / 2;

        for (j = 0; j < milVertical.length; j++) {
          var milestone = milVertical[j];
          if (milestone) {
            if (!milestone.isFake) {
              var milPath = this.milestonesLayer_.genNextChild();
              src = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
              str = milestone.isSelected ? src.selected().getOption('stroke') : src.normal().getOption('stroke');
              pixelShift = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (str)) % 2 == 0 ? 0 : 0.5;

              critSource = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
              size = anychart.utils.normalizeSize(/** @type {string|number} */ (critSource.getOption('size')), fullSize);
              var halfSize = Math.round(size / 2);
              milestone.radius = halfSize;

              switch (critSource.getOption('shape')) {
                case anychart.enums.MilestoneShape.RHOMBUS:
                  milPath.moveTo(left + pixelShift - halfSize, top + pixelShift)
                      .lineTo(left + pixelShift, top + pixelShift - halfSize)
                      .lineTo(left + pixelShift + halfSize, top + pixelShift)
                      .lineTo(left + pixelShift, top + pixelShift + halfSize)
                      .close();
                  break;
                case anychart.enums.MilestoneShape.RECTANGLE:
                  milPath.moveTo(left + pixelShift - halfSize, top + pixelShift - halfSize)
                      .lineTo(left + pixelShift + halfSize, top + pixelShift - halfSize)
                      .lineTo(left + pixelShift + halfSize, top + pixelShift + halfSize)
                      .lineTo(left + pixelShift - halfSize, top + pixelShift + halfSize)
                      .close();
                  break;
                case anychart.enums.MilestoneShape.CIRCLE:
                default:
                  milPath.moveTo(left + pixelShift + halfSize, top + pixelShift)
                      .arcTo(halfSize, halfSize, 0, 360);
              }

              milPath.tag = {'m': milestone};
              milestone.relatedPath = /** @type {acgraph.vector.Path} */ (milPath);

              var labelContextProvider = this.createFormatProvider(true, void 0, void 0, /** @type {anychart.pertModule.Chart.Milestone} */ (milestone));
              var labelsSource = milestone.isCritical ? this.criticalPath().milestones() : this.milestones();
              var label = this.milestones().normal().labels().add(labelContextProvider, {
                'value': {
                  'x': left - halfSize,
                  'y': top - halfSize
                }
              });
              label.setSettings(/** @type {Object} */ (labelsSource.normal().labels().textSettings()));
              label['width'](size);
              label['height'](size);
              milestone.relatedLabel = label;
            }
            milestone.left = left;
            milestone.top = top;

          }
          top += verticalStep;
        }
      }
      left += horizontalStep;
    }

    for (i in this.edgesMap_) {
      var edge = this.edgesMap_[i];
      var from = edge.from;
      var to = edge.to;
      var work = edge.work ? edge.work : void 0;

      var activity = work ? this.activitiesMap_[work.id] : void 0;
      var path, interactPath, arrowPath;
      var isCrit = edge.isCritical;

      if (!from.isFake) { //Ignoring non-start fake edges.
        path = this.activitiesLayer_.genNextChild();
        arrowPath = this.activitiesLayer_.genNextChild();
        interactPath = this.workPathInteractivityLayer_.genNextChild();
        path.tag = work ? {'w': work} : {'d': isCrit};
        arrowPath.tag = work ? {'w': work} : {'d': isCrit};
        arrowPath.tag['a'] = true;
        interactPath.tag = work ? {'w': work} : {'d': isCrit};

        src = edge.isCritical ? this.criticalPath().tasks() : this.tasks();
        var formatProvider = this.createFormatProvider(true, work, activity, void 0);

        if (work) {
          var state = work.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;
          str = src.getFinalStroke(state, formatProvider);
          work.relatedPath = /** @type {acgraph.vector.Path} */ (path);
          work.labelsInteractivityPath = /** @type {acgraph.vector.Path} */ (this.workLablesInteractivityLayer_.genNextChild());
          work.labelsInteractivityPath.tag = {'w': work};

          work.arrowPath = /** @type {acgraph.vector.Path} */ (arrowPath);
        } else {
          str = src.getFinalDummyStroke(formatProvider);
        }
        pixelShift = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (str)) % 2 == 0 ? 0 : 0.5;

        var startLeft = from.left + pixelShift + (from.radius || 0);
        var startTop = from.top + pixelShift;

        path.moveTo(startLeft, startTop);
        interactPath.moveTo(startLeft, startTop);

        var labelLeft, labelTop;
        var isFirstEdge = true;

        if (isFirstEdge) {
          labelLeft = (startLeft + to.left - to.radius) / 2;
          labelTop = (to.top + startTop) / 2;
          var angle = Math.atan((to.top - from.top) / (to.left - to.radius - from.left - from.radius));
          if (work) work.rotation = angle * 180 / Math.PI;
          isFirstEdge = false;
        }

        if (edge.isFake) {
          var fakeEdge = edge;
          var toFakeMilestone = fakeEdge.to;

          while (toFakeMilestone.isFake) {
            left = toFakeMilestone.left + pixelShift;
            top = toFakeMilestone.top + pixelShift;
            path.lineTo(left, top);
            interactPath.lineTo(left, top);
            fakeEdge = toFakeMilestone.succFakeEdge;
            toFakeMilestone = fakeEdge.to;
          }
          var stLeft = left;
          var stTop = top;
          var finLeft = toFakeMilestone.left + pixelShift - (toFakeMilestone.radius || 0);
          var finTop = toFakeMilestone.top + pixelShift;

          var arrowAngle = Math.atan((finTop - stTop) / (finLeft - stLeft));
          var arrowCoords = this.getArrowRotation_(stLeft, /** @type {number} */ (stTop), finLeft, finTop);
          var pathLeft = finLeft - anychart.pertModule.Chart.ARROW_HEIGHT * Math.cos(arrowAngle);
          var pathTop = finTop - anychart.pertModule.Chart.ARROW_HEIGHT * Math.sin(arrowAngle);
          var left1 = arrowCoords[0];
          var top1 = arrowCoords[1];
          var left2 = arrowCoords[2];
          var top2 = arrowCoords[3];

          path.moveTo(stLeft, stTop)
              .lineTo(pathLeft, pathTop);

          arrowPath.moveTo(pathLeft, pathTop)
              .lineTo(left1, top1)
              .lineTo(finLeft, finTop)
              .lineTo(left2, top2)
              .close();

          interactPath.lineTo(finLeft, finTop);

        } else {
          var finLeft = to.left + pixelShift - (to.radius || 0);
          var finTop = to.top + pixelShift;

          var arrowAngle = Math.atan((finTop - startTop) / (finLeft - startLeft));
          var arrowCoords = this.getArrowRotation_(startLeft, startTop, finLeft, finTop);
          var pathLeft = finLeft - anychart.pertModule.Chart.ARROW_HEIGHT * Math.cos(arrowAngle);
          var pathTop = finTop - anychart.pertModule.Chart.ARROW_HEIGHT * Math.sin(arrowAngle);
          var left1 = arrowCoords[0];
          var top1 = arrowCoords[1];
          var left2 = arrowCoords[2];
          var top2 = arrowCoords[3];

          path.moveTo(startLeft, startTop)
              .lineTo(pathLeft, pathTop);

          arrowPath.moveTo(pathLeft, pathTop)
              .lineTo(left1, top1)
              .lineTo(finLeft, finTop)
              .lineTo(left2, top2)
              .close();

          interactPath.lineTo(finLeft, finTop);
        }

        if (work) {
          var w = to.left - to.radius - from.left - from.radius;
          var h = to.top - from.top;

          var hyp = anychart.math.vectorLength(0, 0, w, h);

          var labelContextProvider = this.createFormatProvider(true, work, activity, void 0);
          var upperLabel = this.tasks().normal().upperLabels().add(labelContextProvider, {
            'value': {
              'x': labelLeft + pixelShift,
              'y': labelTop + pixelShift
            }
          });

          work.upperLabel = upperLabel;

          upperLabel['width'](hyp);
          upperLabel['height'](bounds.height);

          upperLabel['rotation'](work.rotation);
          upperLabel.tag = {'w': work};

          var lowerLabel = this.tasks().normal().lowerLabels().add(labelContextProvider, {
            'value': {
              'x': labelLeft + pixelShift,
              'y': labelTop + pixelShift
            }
          });
          lowerLabel['width'](hyp);
          lowerLabel['height'](bounds.height);
          work.lowerLabel = lowerLabel;
          lowerLabel['rotation'](work.rotation);
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

    this.milestonesLayer_.forEachChild(this.milestonesLayerLabelsCallback_, this);
    this.activitiesLayer_.forEachChild(this.worksLayerLabelsCallback_, this);

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
anychart.pertModule.Chart.prototype.hash_ = function(prefix, value) {
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
anychart.pertModule.Chart.prototype.getArrowRotation_ = function(x1, y1, x2, y2) {
  var angle = Math.atan((y2 - y1) / (x2 - x1));
  var arrowAngle = Math.atan(anychart.pertModule.Chart.ARROW_BOTTOM / anychart.pertModule.Chart.ARROW_HEIGHT);

  var hypotenuse = anychart.math.vectorLength(0, 0, anychart.pertModule.Chart.ARROW_BOTTOM, anychart.pertModule.Chart.ARROW_HEIGHT);

  var angleDiff = angle - arrowAngle;
  var left1 = x2 - hypotenuse * Math.cos(angleDiff);
  var top1 = y2 - hypotenuse * Math.sin(angleDiff);

  var angleSum = angle + arrowAngle;
  var left2 = x2 - hypotenuse * Math.cos(angleSum);
  var top2 = y2 - hypotenuse * Math.sin(angleSum);

  return [left1, top1, left2, top2];
};


/**
 * Gets LF enabled state as boolean.
 * @param {Object} labelsFactory - Labels factory.
 * @param {boolean} defaultVal - Default.
 * @return {boolean}
 * @private
 */
anychart.pertModule.Chart.prototype.labelsEnabled_ = function(labelsFactory, defaultVal) {
  return goog.isBoolean(/** @type {anychart.core.ui.LabelsFactory} */ (labelsFactory).enabled()) ?
      /** @type {boolean} */ (/** @type {anychart.core.ui.LabelsFactory} */ (labelsFactory).enabled()) :
      defaultVal;
};


//endregion
//region -- No Data
/** @inheritDoc */
anychart.pertModule.Chart.prototype.isNoData = function() {
  if (!this.data_)
    return true;
  return (!this.data_.numChildren());
};


//endregion
//region -- Disposing, serialization
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / deserialization / disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.pertModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  return anychart.treeDataModule.utils.toCsv(
      /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data()), opt_csvSettings);
};


/** @inheritDoc */
anychart.pertModule.Chart.prototype.disposeInternal = function() {
  this.startActivities_.length = 0;
  this.finishActivities_.length = 0;
  delete this.worksMap_;
  delete this.activitiesMap_;
  delete this.data_;

  goog.disposeAll(this.milestones(), this.tasks(), this.criticalPath());
  goog.disposeAll(this.workPathInteractivityLayer_, this.workLablesInteractivityLayer_,
      this.milestonesLayer_, this.activitiesLayer_, this.labelsLayer_, this.baseLayer_);

  this.workPathInteractivityLayer_ = null;
  this.workLablesInteractivityLayer_ = null;
  this.milestonesLayer_ = null;
  this.activitiesLayer_ = null;
  this.labelsLayer_ = null;
  this.baseLayer_ = null;

  anychart.pertModule.Chart.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.pertModule.Chart.prototype.serialize = function() {
  var json = anychart.pertModule.Chart.base(this, 'serialize');

  if (this.data_)
    json['treeData'] = this.data_.serializeWithoutMeta();

  json['milestones'] = this.milestones().serialize();
  json['tasks'] = this.tasks().serialize();
  json['criticalPath'] = this.criticalPath().serialize();

  anychart.core.settings.serialize(this, anychart.pertModule.Chart.PROPERTY_DESCRIPTORS, json);

  return {'chart': json};
};


/** @inheritDoc */
anychart.pertModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.pertModule.Chart.base(this, 'setupByJSON', config, opt_default);

  this.defaultTooltipSettings_ = /** @type {Object} */(anychart.getFullTheme('defaultTooltip'));

  if ('treeData' in config) this.data(anychart.treeDataModule.Tree.fromJson(config['treeData']));
  if ('milestones' in config) this.milestones().setupByJSON(config['milestones'], opt_default);
  if ('tasks' in config) this.tasks().setupByJSON(config['tasks'], opt_default);
  if ('criticalPath' in config) this.criticalPath().setupByJSON(config['criticalPath'], opt_default);

  anychart.core.settings.deserialize(this, anychart.pertModule.Chart.PROPERTY_DESCRIPTORS, config);
};
//endregion.


//exports
(function() {
  var proto = anychart.pertModule.Chart.prototype;
  // auto generated
  // proto['expectedTimeCalculator'] = proto.expectedTimeCalculator;
  // proto['verticalSpacing'] = proto.verticalSpacing;
  // proto['horizontalSpacing'] = proto.horizontalSpacing;
  proto['getType'] = proto.getType;
  proto['tasks'] = proto.tasks;
  proto['milestones'] = proto.milestones;
  proto['criticalPath'] = proto.criticalPath;
  proto['data'] = proto.data;
  proto['toCsv'] = proto.toCsv;
})();


