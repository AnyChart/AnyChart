goog.provide('anychart.graphModule.elements.Group');

goog.require('anychart.graphModule.elements.Base');



/**
 * Use groups for set nodes that has same groupId similar settings.
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Group = function(chart) {
  anychart.graphModule.elements.Group.base(this, 'constructor', chart);

  /**
   * Chart instance.
   * @type {anychart.graphModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Type of element.
   * @type {anychart.graphModule.Chart.Element}
   */
  this.type = anychart.graphModule.Chart.Element.GROUP;

};
goog.inherits(anychart.graphModule.elements.Group, anychart.graphModule.elements.Base);


/** @inheritDoc */
anychart.graphModule.elements.Group.prototype.setupElements = function() {
  this.normal().labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.chart_.nodes().labels()));
  this.hovered().labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.normal().labels()));
  this.selected().labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.normal().labels()));
};
