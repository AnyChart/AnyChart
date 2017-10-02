goog.provide('anychart.pieModule.LabelAnimation');
goog.require('anychart.animations.Animation');



/**
 * Pie animation.
 * @constructor
 * @param {anychart.pieModule.Chart} chart Pie chart instance.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {anychart.animations.Animation}
 */
anychart.pieModule.LabelAnimation = function(chart, duration, opt_acc) {
  anychart.pieModule.LabelAnimation.base(this, 'constructor', null, [], [], duration, opt_acc);

  /**
   * @type {anychart.pieModule.Chart}
   */
  this.chart = chart;

  /**
   * @type {boolean}
   */
  this.isOutside = this.chart.isOutsideLabels();

  /**
   * @type {?acgraph.vector.Stroke}
   */
  this.connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.chart.getOption('connectorStroke'));
};
goog.inherits(anychart.pieModule.LabelAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.pieModule.LabelAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  this.startPoint.push(0.00001, 0.00001);
  this.endPoint.push(1, this.connectorStroke['opacity'] || 1);
};


/** @inheritDoc */
anychart.pieModule.LabelAnimation.prototype.onAnimate = function() {
  this.chart.updateLabelsOnAnimate(this.coords[0], this.coords[1], this.isOutside);
};


/** @inheritDoc */
anychart.pieModule.LabelAnimation.prototype.onEnd = function() {
  this.onAnimate();
};


/** @inheritDoc */
anychart.pieModule.LabelAnimation.prototype.disposeInternal = function() {
  anychart.pieModule.LabelAnimation.base(this, 'disposeInternal');
  this.chart = null;
  this.connectorStroke = null;
  delete this.isOutside;
};
