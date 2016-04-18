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
  /**
   * If this animation is rotated (as for bar).
   * @type {boolean}
   */
  this.isBarAnimation = false;
};
goog.inherits(anychart.animations.ColumnAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.update = function() {
  this.startPoint.length = this.endPoint.length = 0;
  var iterator = this.series.getDetachedIterator();
  // we would use variable number of arguments per point - from zero to five
  while (iterator.advance()) {
    if (!iterator.meta(anychart.opt.MISSING)) {
      var x = /** @type {number} */(iterator.meta(anychart.opt.X));
      var value = /** @type {number} */(iterator.meta(anychart.opt.VALUE));
      var zero = /** @type {number} */(iterator.meta(anychart.opt.ZERO));
      // we need this to make the drawer choose appropriate shape.
      this.startPoint.push(zero);
      this.endPoint.push(value);
      var positionProvider;
      var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(iterator.meta(anychart.opt.LABEL));
      if (label) {
        positionProvider = label.positionProvider()[anychart.opt.VALUE];
        if (this.isBarAnimation)
          this.startPoint.push(zero, x);
        else
          this.startPoint.push(x, zero);
        this.endPoint.push(positionProvider[anychart.opt.X], positionProvider[anychart.opt.Y]);
      }
      var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(iterator.meta(anychart.opt.MARKER));
      if (marker) {
        positionProvider = marker.positionProvider()[anychart.opt.VALUE];
        if (this.isBarAnimation)
          this.startPoint.push(zero, x);
        else
          this.startPoint.push(x, zero);
        this.endPoint.push(positionProvider[anychart.opt.X], positionProvider[anychart.opt.Y]);
      }
    }
  }
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onAnimate = function() {
  var iterator = this.series.getDetachedIterator();
  var currentCoordIndex = 0;
  while (iterator.advance()) {
    if (!iterator.meta(anychart.opt.MISSING)) {
      iterator.meta(anychart.opt.VALUE, this.coords[currentCoordIndex++]);
      this.series.drawer.updatePointOnAnimate(iterator);
      var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(iterator.meta(anychart.opt.LABEL));
      if (label) {
        label.positionProvider({'value': {
          'x': this.coords[currentCoordIndex++],
          'y': this.coords[currentCoordIndex++]
        }});
        label.draw();
      }
      var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(iterator.meta(anychart.opt.MARKER));
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
