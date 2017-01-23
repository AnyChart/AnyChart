goog.provide('anychart.animations.ColumnAnimation');
goog.require('anychart.animations.Animation');



/**
 * Bar animation.
 * @param {anychart.core.series.Cartesian} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.ColumnAnimation = function(series, duration, opt_acc) {
  anychart.animations.ColumnAnimation.base(this, 'constructor', series, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.ColumnAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.update = function() {
  /** @type {boolean} */
  this.isBarAnimation = /** @type {boolean} */(this.series.getOption('isVertical'));
  this.startPoint.length = this.endPoint.length = 0;
  var iterator = this.series.getDetachedIterator();
  // we would use variable number of arguments per point - from zero to five
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      var x = /** @type {number} */(iterator.meta('x'));
      var value = /** @type {number} */(iterator.meta('value'));
      var zero = /** @type {number} */(iterator.meta('zero'));
      // we need this to make the drawer choose appropriate shape.
      this.startPoint.push(zero);
      this.endPoint.push(value);
      var positionProvider;
      var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(iterator.meta('label'));
      if (label) {
        positionProvider = label.positionProvider()['value'];
        if (this.isBarAnimation)
          this.startPoint.push(zero, x);
        else
          this.startPoint.push(x, zero);
        this.endPoint.push(positionProvider['x'], positionProvider['y']);
      }
      var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(iterator.meta('marker'));
      if (marker) {
        positionProvider = marker.positionProvider()['value'];
        if (this.isBarAnimation)
          this.startPoint.push(zero, x);
        else
          this.startPoint.push(x, zero);
        this.endPoint.push(positionProvider['x'], positionProvider['y']);
      }
    }
  }
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onAnimate = function() {
  var iterator = this.series.getDetachedIterator();
  var currentCoordIndex = 0;
  while (iterator.advance()) {
    if (!iterator.meta('missing')) {
      iterator.meta('value', this.coords[currentCoordIndex++]);
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
anychart.animations.ColumnAnimation.prototype.onEnd = function() {
  this.onAnimate();
};
