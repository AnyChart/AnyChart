goog.provide('anychart.chartEditorModule.group.CartesianXAxes');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.Axes');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.CartesianXAxes = function(model) {
  anychart.chartEditorModule.group.CartesianXAxes.base(this, 'constructor', model);

  this.setHeader('X-Axis');
  this.useEnabledButton(true);
  this.setKey('chart.xAxis()');
};
goog.inherits(anychart.chartEditorModule.group.CartesianXAxes, anychart.chartEditorModule.group.Base);


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianXAxes.prototype.disposeInternal = function() {
  this.xAxes_ = null;

  anychart.chartEditorModule.group.CartesianXAxes.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianXAxes.prototype.createDom = function() {
  anychart.chartEditorModule.group.CartesianXAxes.base(this, 'createDom');

  var xAxes = new anychart.chartEditorModule.settings.Axes();
  xAxes.setName('X-Axis');
  xAxes.showName(false);
  xAxes.setKey('xAxis');
  xAxes.setCountKey('chart.getXAxesCount()');
  this.addChild(xAxes, true);

  this.xAxes_ = xAxes;
};


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianXAxes.prototype.update = function(model) {
  anychart.chartEditorModule.group.CartesianXAxes.base(this, 'update', model);

  if (this.xAxes_) this.xAxes_.update(model);
};

