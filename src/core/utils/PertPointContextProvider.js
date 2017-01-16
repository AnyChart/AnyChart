goog.provide('anychart.core.utils.PertPointContextProvider');

goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.enums');



/**
 * Pert point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {anychart.charts.Pert} chart - Pert chart instance.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.PertPointContextProvider = function(chart) {
  anychart.core.utils.PertPointContextProvider.base(this, 'constructor');

  this.chartInternal = chart;

  /**
   * @type {anychart.charts.Pert.Work|null|undefined}
   */
  this.work = null;

  /**
   * @type {anychart.charts.Pert.Milestone|null|undefined}
   */
  this.milestone = null;

  /**
   * @type {anychart.charts.Pert.ActivityData|null|undefined}
   */
  this.activityData = null;

};
goog.inherits(anychart.core.utils.PertPointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.PertPointContextProvider.prototype.applyReferenceValues = function() {
  if (this.work) {
    this['item'] = this.work.item;

    this[anychart.enums.DataField.NAME] = this['item'].get(anychart.enums.DataField.NAME);

    var pessimistic = this.work.item.get(anychart.enums.DataField.PESSIMISTIC);
    if (goog.isDef(pessimistic))
      this[anychart.enums.DataField.PESSIMISTIC] = +pessimistic;

    var optimistic = this.work.item.get(anychart.enums.DataField.OPTIMISTIC);
    if (goog.isDef(optimistic))
      this[anychart.enums.DataField.OPTIMISTIC] = +optimistic;

    var mostLikely = this.work.item.get(anychart.enums.DataField.MOST_LIKELY);
    if (goog.isDef(mostLikely))
      this[anychart.enums.DataField.MOST_LIKELY] = +mostLikely;

    var duration = this.work.item.get(anychart.enums.DataField.DURATION);
    if (goog.isDef(duration))
      this[anychart.enums.DataField.DURATION] = +duration;

    this['successors'] = this.work.successors;
    this['predecessors'] = this.work.predecessors;
  }

  if (this.activityData) {
    this['earliestStart'] = this.activityData.earliestStart;
    this['earliestFinish'] = this.activityData.earliestFinish;
    this['latestStart'] = this.activityData.latestStart;
    this['latestFinish'] = this.activityData.latestFinish;
    if (!goog.isDef(this[anychart.enums.DataField.DURATION]))
      this[anychart.enums.DataField.DURATION] = this.activityData.duration;
    this['slack'] = this.activityData.slack;
    this['variance'] = this.activityData.variance;
  }

  if (this.milestone) {
    //this['label'] = this.milestone.label;
    this['successors'] = this.milestone.successors;
    this['predecessors'] = this.milestone.predecessors;
    this['isCritical'] = this.milestone.isCritical;
    if (this.milestone.creator)
      this['creator'] = this.milestone.creator.item;
    this['isStart'] = this.milestone.isStart;
    this['index'] = this.milestone.index;
  }
};


/**
 * Gets statistics.
 * @param {string} key - Key.
 * @return {*}
 */
anychart.core.utils.PertPointContextProvider.prototype.getStat = function(key) {
  if (!key) return void 0;
  if (this.pointInternal && goog.isDef(this.pointInternal.getStat(key))) {
    return this.pointInternal.getStat(key);
  } else if (this.chartInternal && this.chartInternal.getStat(key)) {
    return this.chartInternal.getStat(key);
  } else {
    return this.getDataValue(/** @type {string} */ (key));
  }
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.PertPointContextProvider.prototype.getDataValue = function(key) {
  return this.work.item ? this.work.item.get(key) : void 0;
};



//exports
(function() {
  var proto = anychart.core.utils.PertPointContextProvider.prototype;
  proto['getStat'] = proto.getStat;
  proto['getTokenValue'] = proto.getTokenValue;
  proto['getDataValue'] = proto.getDataValue;
})();

