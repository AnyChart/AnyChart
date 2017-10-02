goog.provide('anychart.chartEditorModule.group.CartesianYAxes');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.Axes');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.CartesianYAxes = function(model) {
  anychart.chartEditorModule.group.CartesianYAxes.base(this, 'constructor', model);

  this.setHeader('Y-Axis');
  this.useEnabledButton(true);
  this.setKey('chart.yAxis()');
};
goog.inherits(anychart.chartEditorModule.group.CartesianYAxes, anychart.chartEditorModule.group.Base);


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianYAxes.prototype.disposeInternal = function() {
  this.yAxes_ = null;

  anychart.chartEditorModule.group.CartesianYAxes.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianYAxes.prototype.createDom = function() {
  anychart.chartEditorModule.group.CartesianYAxes.base(this, 'createDom');

  var yAxes = new anychart.chartEditorModule.settings.Axes();
  yAxes.setName('Y-Axis');
  yAxes.showName(false);
  yAxes.setKey('yAxis');
  yAxes.setCountKey('chart.getYAxesCount()');
  this.addChild(yAxes, true);

  this.yAxes_ = yAxes;
};


/** @inheritDoc */
anychart.chartEditorModule.group.CartesianYAxes.prototype.update = function(model) {
  anychart.chartEditorModule.group.CartesianYAxes.base(this, 'update', model);

  if (this.yAxes_) this.yAxes_.update(model);
};

