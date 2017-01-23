goog.provide('anychart.animations.PyramidFunnelAnimation');
goog.require('anychart.animations.Animation');



/**
 * Funnel/Pyramid animation.
 * @constructor
 * @param {anychart.core.PyramidFunnelBase} chart Pie chart instance.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {anychart.animations.Animation}
 */
anychart.animations.PyramidFunnelAnimation = function(chart, duration, opt_acc) {
  anychart.animations.PyramidFunnelAnimation.base(this, 'constructor', null, [], [], duration, opt_acc);

  /**
   * @type {anychart.core.PyramidFunnelBase}
   */
  this.chart = chart;
};
goog.inherits(anychart.animations.PyramidFunnelAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.PyramidFunnelAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  var iterator = this.chart.getDetachedIterator();
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      var x1 = /** @type {number} */(iterator.meta('x1'));
      var x2 = /** @type {number} */(iterator.meta('x2'));
      var x3 = /** @type {number} */(iterator.meta('x3'));
      var x4 = /** @type {number} */(iterator.meta('x4'));
      var y1 = /** @type {number} */(iterator.meta('y1'));
      var y2 = /** @type {number} */(iterator.meta('y2'));
      var y3 = /** @type {number} */(iterator.meta('y3'));
      iterator.meta('neck', !!y3);
      this.startPoint.push(x1, x2, x3, x4, 0, 0, 0);
      this.endPoint.push(x1, x2, x3, x4, y1, y2, y3 ? y3 : 0);
    }
  }
};


/** @inheritDoc */
anychart.animations.PyramidFunnelAnimation.prototype.onBegin = function() {
  this.chart.updateLabelsOnAnimate(0.00001, 0.00001, !this.chart.isInsideLabels());
};


/** @inheritDoc */
anychart.animations.PyramidFunnelAnimation.prototype.onAnimate = function() {
  var iterator = this.chart.getDetachedIterator();
  var currentCoordIndex = 0;
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      iterator.meta('x1', this.coords[currentCoordIndex++]);
      iterator.meta('x2', this.coords[currentCoordIndex++]);
      iterator.meta('x3', this.coords[currentCoordIndex++]);
      iterator.meta('x4', this.coords[currentCoordIndex++]);
      iterator.meta('y1', this.coords[currentCoordIndex++]);
      iterator.meta('y2', this.coords[currentCoordIndex++]);
      iterator.meta('y3', this.coords[currentCoordIndex++]);
      this.chart.updatePointOnAnimate(iterator);
    }
  }
};


/** @inheritDoc */
anychart.animations.PyramidFunnelAnimation.prototype.onEnd = function() {
  this.onAnimate();
};


/** @inheritDoc */
anychart.animations.PyramidFunnelAnimation.prototype.disposeInternal = function() {
  this.chart = null;
  anychart.animations.PyramidFunnelAnimation.base(this, 'disposeInternal');
};

