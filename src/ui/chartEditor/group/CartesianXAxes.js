goog.provide('anychart.ui.chartEditor.group.CartesianXAxes');

goog.require('anychart.ui.chartEditor.checkbox.Base');
goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Axes');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.CartesianXAxes = function(model) {
  anychart.ui.chartEditor.group.CartesianXAxes.base(this, 'constructor', model);

  this.setHeader('X-Axis');
};
goog.inherits(anychart.ui.chartEditor.group.CartesianXAxes, anychart.ui.chartEditor.group.Base);


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianXAxes.prototype.disposeInternal = function() {
  this.enabledBtn_ = null;
  this.xAxes_ = null;

  anychart.ui.chartEditor.group.CartesianXAxes.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianXAxes.prototype.createDom = function() {
  anychart.ui.chartEditor.group.CartesianXAxes.base(this, 'createDom');

  var enabledBtn = new anychart.ui.chartEditor.checkbox.Base();
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-enabled'));
  enabledBtn.setNormalValue(false);
  enabledBtn.setCheckedValue(true);
  enabledBtn.setKey('chart.xAxis().enabled()');
  enabledBtn.render(this.getHeaderElement());
  enabledBtn.setParent(this);

  var xAxes = new anychart.ui.chartEditor.settings.Axes();
  xAxes.setName('X-Axis');
  xAxes.showName(false);
  xAxes.setKey('xAxis');
  xAxes.setCountKey('chart.getXAxesCount()');
  this.addChild(xAxes, true);

  this.enabledBtn_ = enabledBtn;
  this.xAxes_ = xAxes;
};


/** @inheritDoc */
anychart.ui.chartEditor.group.CartesianXAxes.prototype.update = function() {
  if (this.enabledBtn_) this.enabledBtn_.update(this.model);
  if (this.xAxes_) this.xAxes_.update(this.model);
};

