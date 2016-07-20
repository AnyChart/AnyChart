goog.provide('anychart.ui.chartEditor.group.CartesianYAxes');

goog.require('anychart.ui.chartEditor.checkbox.Base');
goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Axes');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.CartesianYAxes = function(model) {
  anychart.ui.chartEditor.group.CartesianYAxes.base(this, 'constructor', model);

  this.setHeader('Y-Axis');
};
goog.inherits(anychart.ui.chartEditor.group.CartesianYAxes, anychart.ui.chartEditor.group.Base);


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianYAxes.prototype.disposeInternal = function() {
  this.enabledBtn_ = null;
  this.yAxes_ = null;

  anychart.ui.chartEditor.group.CartesianYAxes.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianYAxes.prototype.createDom = function() {
  anychart.ui.chartEditor.group.CartesianYAxes.base(this, 'createDom');

  var enabledBtn = new anychart.ui.chartEditor.checkbox.Base();
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-enabled'));
  enabledBtn.setNormalValue(false);
  enabledBtn.setCheckedValue(true);
  enabledBtn.setKey('chart.yAxis().enabled()');
  enabledBtn.render(this.getHeaderElement());
  enabledBtn.setParent(this);

  var yAxes = new anychart.ui.chartEditor.settings.Axes();
  yAxes.setName('Y-Axis');
  yAxes.showName(false);
  yAxes.setKey('yAxis');
  yAxes.setCountKey('chart.getYAxesCount()');
  this.addChild(yAxes, true);

  this.enabledBtn_ = enabledBtn;
  this.yAxes_ = yAxes;
};


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianYAxes.prototype.update = function() {
  if (this.enabledBtn_) this.enabledBtn_.update(this.model);
  if (this.yAxes_) this.yAxes_.update(this.model);
};

