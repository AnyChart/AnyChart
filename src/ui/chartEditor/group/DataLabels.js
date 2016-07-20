goog.provide('anychart.ui.chartEditor.group.DataLabels');

goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Title');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.DataLabels = function(model) {
  anychart.ui.chartEditor.group.DataLabels.base(this, 'constructor', model);

  this.setHeader('Data Labels');
};
goog.inherits(anychart.ui.chartEditor.group.DataLabels, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.DataLabels.CssClass = {};


/** @override */
anychart.ui.chartEditor.group.DataLabels.prototype.disposeInternal = function() {
  this.title_ = null;

  anychart.ui.chartEditor.group.DataLabels.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.DataLabels.prototype.createDom = function() {
  anychart.ui.chartEditor.group.DataLabels.base(this, 'createDom');

  var title = new anychart.ui.chartEditor.settings.Title();
  title.allowEditPosition(false);
  title.allowEditAlign(false);
  title.setTitleKey('textFormatter()');
  title.setEnabledButtonContainer(this.getHeaderElement());
  this.addChild(title, true);

  this.title_ = title;
};


/** @override */
anychart.ui.chartEditor.group.DataLabels.prototype.update = function() {

  if (this.model.chart['getSeriesCount']) {
    var seriesCount = this.model.chart['getSeriesCount']();
    var keys = [];
    for (var i = 0; i < seriesCount; i++) {
      keys.push(goog.string.subs('chart.getSeriesAt(%s).labels()', i));
    }
    this.title_.setKey(keys);
  } else {
    this.title_.setKey('chart.labels()');
  }

  this.title_.update(this.model);
};

