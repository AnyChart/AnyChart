goog.provide('anychart.pyramidFunnelModule.LabelAnimation');
goog.require('anychart.animations.Animation');



/**
 * Pie animation.
 * @constructor
 * @param {anychart.pyramidFunnelModule.Chart} chart Pie chart instance.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {anychart.animations.Animation}
 */
anychart.pyramidFunnelModule.LabelAnimation = function(chart, duration, opt_acc) {
  anychart.pyramidFunnelModule.LabelAnimation.base(this, 'constructor', null, [], [], duration, opt_acc);

  /**
   * @type {anychart.pyramidFunnelModule.Chart}
   */
  this.chart = chart;

  /**
   * @type {boolean}
   */
  this.isOutside = !this.chart.isInsideLabels();

  /**
   * @type {?acgraph.vector.Stroke}
   */
  this.connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.chart.getOption('connectorStroke'));
};
goog.inherits(anychart.pyramidFunnelModule.LabelAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.pyramidFunnelModule.LabelAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  this.startPoint.push(0.00001, 0.00001);
  this.endPoint.push(1, this.connectorStroke['opacity'] || 1);
};


/** @inheritDoc */
anychart.pyramidFunnelModule.LabelAnimation.prototype.onAnimate = function() {
  this.chart.updateLabelsOnAnimate(this.coords[0], this.coords[1], this.isOutside);
};


/** @inheritDoc */
anychart.pyramidFunnelModule.LabelAnimation.prototype.onEnd = function() {
  this.onAnimate();
};


/** @inheritDoc */
anychart.pyramidFunnelModule.LabelAnimation.prototype.disposeInternal = function() {
  anychart.pyramidFunnelModule.LabelAnimation.base(this, 'disposeInternal');
  this.chart = null;
  this.connectorStroke = null;
  delete this.isOutside;
};
