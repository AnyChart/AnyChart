goog.provide('anychart.animations.PieLabelAnimation');
goog.require('anychart.animations.Animation');



/**
 * Pie animation.
 * @constructor
 * @param {anychart.charts.Pie} chart Pie chart instance.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {anychart.animations.Animation}
 */
anychart.animations.PieLabelAnimation = function(chart, duration, opt_acc) {
  anychart.animations.PieLabelAnimation.base(this, 'constructor', null, [], [], duration, opt_acc);

  /**
   * @type {anychart.charts.Pie}
   */
  this.chart = chart;

  /**
   * @type {boolean}
   */
  this.isOutside = this.chart.isOutsideLabels();

  /**
   * @type {?acgraph.vector.Stroke}
   */
  this.connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.chart.connectorStroke());
};
goog.inherits(anychart.animations.PieLabelAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.PieLabelAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  this.startPoint.push(0.00001, 0.00001);
  this.endPoint.push(1, this.connectorStroke['opacity'] || 1);
};


/** @inheritDoc */
anychart.animations.PieLabelAnimation.prototype.onAnimate = function() {
  this.chart.updateLabelsOnAnimate(this.coords[0], this.coords[1], this.isOutside);
};


/** @inheritDoc */
anychart.animations.PieLabelAnimation.prototype.onEnd = function() {
  this.onAnimate();
};


/** @inheritDoc */
anychart.animations.PieLabelAnimation.prototype.disposeInternal = function() {
  this.chart = null;
  this.connectorStroke = null;
  delete this.isOutside;
  anychart.animations.PieLabelAnimation.base(this, 'disposeInternal');
};
