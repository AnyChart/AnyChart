goog.provide('anychart.ui.chartEditor.group.ChartTitle');

goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Title');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.ChartTitle = function(model) {
  anychart.ui.chartEditor.group.ChartTitle.base(this, 'constructor', model);

  this.setHeader('Chart Title');
};
goog.inherits(anychart.ui.chartEditor.group.ChartTitle, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.ChartTitle.CssClass = {};


/** @override */
anychart.ui.chartEditor.group.ChartTitle.prototype.disposeInternal = function() {
  goog.dispose(this.title_);
  this.title_ = null;

  anychart.ui.chartEditor.group.ChartTitle.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.ChartTitle.prototype.createDom = function() {
  anychart.ui.chartEditor.group.ChartTitle.base(this, 'createDom');

  var title = new anychart.ui.chartEditor.settings.Title();
  title.setKey('chart.title()');
  title.setPositionKey('orientation()');
  title.setEnabledButtonContainer(this.getHeaderElement());
  this.addChild(title, true);

  this.title_ = title;
};


/** @override */
anychart.ui.chartEditor.group.ChartTitle.prototype.update = function() {
  this.title_.update(this.model);
};

