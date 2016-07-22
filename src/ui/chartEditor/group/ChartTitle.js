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
  this.useEnabledButton(true);
  this.setKey('chart.title()');
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
  title.allowEnabled(false);
  title.setKey(this.getKey());
  title.setPositionKey('orientation()');
  this.addChild(title, true);

  this.title_ = title;
};


/** @override */
anychart.ui.chartEditor.group.ChartTitle.prototype.update = function(model) {
  anychart.ui.chartEditor.group.ChartTitle.base(this, 'update', model);
  this.title_.update(model);
};

