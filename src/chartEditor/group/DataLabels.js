goog.provide('anychart.chartEditorModule.group.DataLabels');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.DataLabels = function(model) {
  anychart.chartEditorModule.group.DataLabels.base(this, 'constructor', model);

  this.setHeader('Data Labels');
  this.useEnabledButton(true);
  if (this.model.chart['getSeriesCount']) {
    this.setKey(this.getDataLabelsKey_());
  } else {
    this.setKey('chart.labels()');
  }
};
goog.inherits(anychart.chartEditorModule.group.DataLabels, anychart.chartEditorModule.group.Base);


/** @enum {string} */
anychart.chartEditorModule.group.DataLabels.CssClass = {};


/** @override */
anychart.chartEditorModule.group.DataLabels.prototype.disposeInternal = function() {
  this.title_ = null;

  anychart.chartEditorModule.group.DataLabels.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.group.DataLabels.prototype.createDom = function() {
  anychart.chartEditorModule.group.DataLabels.base(this, 'createDom');

  var title = new anychart.chartEditorModule.settings.Title();
  title.allowEnabled(false);
  title.allowEditPosition(false);
  title.allowEditAlign(false);
  title.setTitleKey('format()');
  this.addChild(title, true);

  this.title_ = title;
};


/**
 * @return {Array.<string>}
 * @private
 */
anychart.chartEditorModule.group.DataLabels.prototype.getDataLabelsKey_ = function() {
  var seriesCount = this.model.chart['getSeriesCount']();
  var keys = [];
  for (var i = 0; i < seriesCount; i++) {
    keys.push(goog.string.subs('chart.getSeriesAt(%s).labels()', i));
  }
  return keys;
};


/** @override */
anychart.chartEditorModule.group.DataLabels.prototype.update = function(model) {
  anychart.chartEditorModule.group.DataLabels.base(this, 'update', model);

  if (this.model.chart['getSeriesCount']) {
    this.setKey(this.getDataLabelsKey_());
    this.title_.setKey(this.getDataLabelsKey_());
  } else {
    this.setKey('chart.labels()');
    this.title_.setKey('chart.labels()');
  }

  this.title_.update(model);
};

