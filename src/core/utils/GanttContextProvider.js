goog.provide('anychart.core.utils.GanttContextProvider');

goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.enums');



/**
 * Gantt context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {boolean=} opt_isResources - Whether gantt chart is resources chart.
 * @constructor
 */
anychart.core.utils.GanttContextProvider = function(opt_isResources) {
  /**
   * @type {boolean}
   * @private
   */
  this['isResources'] = !!opt_isResources;

  /**
   * Current tree data item.
   * TODO (A.Kudryavtsev): Make kind of analogue with another context providers (kind of series.getIterator())?
   * @type {anychart.data.Tree.DataItem}
   */
  this.currentItem = null;

  /**
   * Current period (in use for resources chart).
   * @type {Object|undefined}
   */
  this.currentPeriod;

  /**
   * Current period index (in use for resources chart).
   * @type {number|undefined}
   */
  this.currentPeriodIndex = -1;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.applyReferenceValues = function() {
  if (this.currentItem) {
    this['item'] = this.currentItem;
    this['name'] = this.currentItem.get(anychart.enums.GanttDataFields.NAME);
    this['id'] = this.currentItem.get(anychart.enums.GanttDataFields.ID);

    if (this['isResources']) {
      this['minPeriodDate'] = this.currentItem.meta('minPeriodDate');
      this['maxPeriodDate'] = this.currentItem.meta('maxPeriodDate');
      this['period'] = this.currentPeriod || void 0;
      this['periodIndex'] = (goog.isDefAndNotNull(this.currentPeriodIndex) && this.currentPeriodIndex >= 0) ? this.currentPeriodIndex : void 0;
      this['periodStart'] = this.currentPeriod ?
          this.currentItem.getMeta(anychart.enums.GanttDataFields.PERIODS, this.currentPeriodIndex, anychart.enums.GanttDataFields.START) :
          void 0;
      this['periodEnd'] = this.currentPeriod ?
          this.currentItem.getMeta(anychart.enums.GanttDataFields.PERIODS, this.currentPeriodIndex, anychart.enums.GanttDataFields.END) :
          void 0;
    } else {
      this['actualStart'] = this.currentItem.meta(anychart.enums.GanttDataFields.ACTUAL_START);
      this['actualEnd'] = this.currentItem.meta(anychart.enums.GanttDataFields.ACTUAL_END);
      this['progressValue'] = this.currentItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE);

      var isParent = !!this.currentItem.numChildren();
      this['autoStart'] = isParent ? this.currentItem.meta('autoStart') : void 0;
      this['autoEnd'] = isParent ? this.currentItem.meta('autoEnd') : void 0;
      this['autoProgress'] = isParent ? this.currentItem.meta('autoProgress') : void 0;
    }
  }
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getDataValue = function(key) {
  return this.currentItem ? this.currentItem.get(key) : void 0;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getStat = function(key) {
  return void 0; //TODO (A.Kudryavtsev): TBA on gantt statistics implementation.
};


/**
 * Gets series meta by key.
 * @param {string} key - Key.
 * @return {*} Meta value by key.
 */
anychart.core.utils.GanttContextProvider.prototype.getMetaValue = function(key) {
  return this.currentItem ? this.currentItem.meta(key) : void 0;
};

//exports
(function() {
  var proto = anychart.core.utils.GanttContextProvider.prototype;
  proto['getDataValue'] = proto.getDataValue;
  proto['getStat'] = proto.getStat;
  proto['getMetaValue'] = proto.getMetaValue;
})();
