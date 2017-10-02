goog.provide('anychart.pieModule.Animation');
goog.require('anychart.animations.Animation');



/**
 * Pie animation.
 * @constructor
 * @param {anychart.pieModule.Chart} chart Pie chart instance.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {anychart.animations.Animation}
 */
anychart.pieModule.Animation = function(chart, duration, opt_acc) {
  anychart.pieModule.Animation.base(this, 'constructor', null, [], [], duration, opt_acc);

  /**
   * @type {anychart.pieModule.Chart}
   */
  this.chart = chart;
};
goog.inherits(anychart.pieModule.Animation, anychart.animations.Animation);


/** @inheritDoc */
anychart.pieModule.Animation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  var iterator = this.chart.getDetachedIterator();
  // we would use variable number of arguments per point - from zero to five
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      var start = /** @type {number} */(iterator.meta('start'));
      var sweep = /** @type {number} */(iterator.meta('sweep'));
      var radius = this.chart.getPixelRadius();
      var innerRadius = this.chart.getPixelInnerRadius();
      // we need this to make the drawer choose appropriate shape.
      this.startPoint.push(this.chart.getStartAngle(), 0, 0, 0);
      this.endPoint.push(start, sweep, radius, innerRadius);
    }
  }
};


/** @inheritDoc */
anychart.pieModule.Animation.prototype.onBegin = function() {
  this.chart.updateLabelsOnAnimate(0.00001, 0.00001, this.chart.isOutsideLabels());
};


/** @inheritDoc */
anychart.pieModule.Animation.prototype.onAnimate = function() {
  var iterator = this.chart.getDetachedIterator();
  var currentCoordIndex = 0;
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      iterator.meta('start', this.coords[currentCoordIndex++]);
      iterator.meta('sweep', this.coords[currentCoordIndex++]);
      iterator.meta('radius', this.coords[currentCoordIndex++]);
      iterator.meta('innerRadius', this.coords[currentCoordIndex++]);
      this.chart.updatePointOnAnimate(iterator);
    }
  }
};


/** @inheritDoc */
anychart.pieModule.Animation.prototype.onEnd = function() {
  this.onAnimate();
};


/** @inheritDoc */
anychart.pieModule.Animation.prototype.disposeInternal = function() {
  anychart.pieModule.Animation.base(this, 'disposeInternal');
  this.chart = null;
};
