goog.provide('anychart.animations.BubbleAnimation');
goog.require('anychart.animations.Animation');



/**
 * Animation for bubble series.
 * @param {anychart.core.series.Cartesian} series Bubble series.
 * @param {number} duration Animation duration.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BubbleAnimation = function(series, duration, opt_acc) {
  anychart.animations.BubbleAnimation.base(this, 'constructor', series, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.BubbleAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  var iterator = this.series.getDetachedIterator();
  // we would use variable number of arguments per point - from zero to five
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      var size = /** @type {number} */(iterator.meta('size'));
      // we need this to make the drawer choose appropriate shape.
      this.startPoint.push(size < 0 ? -1e-5 : 0);
      this.endPoint.push(size);
      var centerX = /** @type {number} */(iterator.meta('x'));
      var centerY = /** @type {number} */(iterator.meta('value'));
      var positionProvider;
      var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(iterator.meta('label'));
      if (label) {
        positionProvider = label.positionProvider()['value'];
        this.startPoint.push(centerX, centerY);
        this.endPoint.push(positionProvider['x'], positionProvider['y']);
      }
      var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(iterator.meta('marker'));
      if (marker) {
        positionProvider = marker.positionProvider()['value'];
        this.startPoint.push(centerX, centerY);
        this.endPoint.push(positionProvider['x'], positionProvider['y']);
      }
    }
  }
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onAnimate = function() {
  var iterator = this.series.getDetachedIterator();
  var currentCoordIndex = 0;
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      iterator.meta('size', this.coords[currentCoordIndex++]);
      this.series.drawer.updatePointOnAnimate(iterator);
      var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(iterator.meta('label'));
      if (label) {
        label.positionProvider({'value': {
          'x': this.coords[currentCoordIndex++],
          'y': this.coords[currentCoordIndex++]
        }});
        label.draw();
      }
      var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(iterator.meta('marker'));
      if (marker) {
        marker.positionProvider({'value': {
          'x': this.coords[currentCoordIndex++],
          'y': this.coords[currentCoordIndex++]
        }});
        marker.draw();
      }
    }
  }
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onEnd = function() {
  this.onAnimate();
};
