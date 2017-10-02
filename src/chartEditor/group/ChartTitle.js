goog.provide('anychart.chartEditorModule.group.ChartTitle');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.ChartTitle = function(model) {
  anychart.chartEditorModule.group.ChartTitle.base(this, 'constructor', model);

  this.setHeader('Chart Title');
  this.useEnabledButton(true);
  this.setKey('chart.title()');
};
goog.inherits(anychart.chartEditorModule.group.ChartTitle, anychart.chartEditorModule.group.Base);


/** @enum {string} */
anychart.chartEditorModule.group.ChartTitle.CssClass = {};


/** @override */
anychart.chartEditorModule.group.ChartTitle.prototype.disposeInternal = function() {
  goog.dispose(this.title_);
  this.title_ = null;

  anychart.chartEditorModule.group.ChartTitle.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.group.ChartTitle.prototype.createDom = function() {
  anychart.chartEditorModule.group.ChartTitle.base(this, 'createDom');

  var title = new anychart.chartEditorModule.settings.Title();
  title.allowEnabled(false);
  title.setKey(this.getKey());
  title.setPositionKey('orientation()');
  this.addChild(title, true);

  this.title_ = title;
};


/** @override */
anychart.chartEditorModule.group.ChartTitle.prototype.update = function(model) {
  anychart.chartEditorModule.group.ChartTitle.base(this, 'update', model);
  this.title_.update(model);
};

