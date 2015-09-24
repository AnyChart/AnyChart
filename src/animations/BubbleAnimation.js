goog.provide('anychart.animations.BubbleAnimation');
goog.require('anychart.animations.Animation');



/**
 * Animation for bubble series.
 * @param {anychart.core.cartesian.series.Bubble} series Bubble series.
 * @param {number} duration Animation duration.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BubbleAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  this.labels_ = this.series_.labels();
  this.markers_ = this.series_.markers();

  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.BubbleAnimation, anychart.animations.Animation);


/**
 * Creates position provider for label.
 * @param {anychart.math.Rect} shapeBounds .
 * @param {string} position .
 * @return {Object}
 */
anychart.animations.BubbleAnimation.prototype.createPositionProvider = function(shapeBounds, position) {
  position = anychart.enums.normalizeAnchor(position);
  return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onBegin = function() {
  this.series_.setAnimation(true);
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.cycle = function(now) {
  this.startPoint = [];
  this.endPoint = [];
  var iterator = this.series_.getResetIterator();
  while (iterator.advance()) {
    var x = /** @type {number} */ (iterator.meta('x'));
    var y = /** @type {number} */ (iterator.meta('value'));
    var size = Math.abs(iterator.meta('size'));

    var shapeBounds = anychart.math.rect(x - size, y - size, size * 2, size * 2);

    var labelsPosition = this.series_.getLabelsPosition(anychart.PointState.NORMAL);
    var labelProvider = this.createPositionProvider(shapeBounds, labelsPosition)['value'];

    var markersPosition = this.series_.getMarkersPosition(anychart.PointState.NORMAL);
    var markerProvider = this.createPositionProvider(shapeBounds, markersPosition)['value'];

    this.startPoint.push(0);
    this.startPoint.push(x);
    this.startPoint.push(y);
    this.startPoint.push(x);
    this.startPoint.push(y);

    this.endPoint.push(size);
    this.endPoint.push(labelProvider['x']);
    this.endPoint.push(labelProvider['y']);
    this.endPoint.push(markerProvider['x']);
    this.endPoint.push(markerProvider['y']);
  }

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.radius(this.coords[index * 5]);
    var label = this.labels_.getLabel(index);
    if (label) {
      label
        .positionProvider({'value': {
            'x': this.coords[index * 5 + 1],
            'y': this.coords[index * 5 + 2]}})
        .draw();
    }

    var marker = this.markers_.getMarker(index);
    if (marker) {
      marker
        .positionProvider({'value': {
            'x': this.coords[index * 5 + 3],
            'y': this.coords[index * 5 + 4]}})
        .draw();
    }
  }, this);
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.radius(this.endPoint[index * 5]);
    var label = this.labels_.getLabel(index);
    if (label) {
      label
        .positionProvider({'value': {
            'x': this.endPoint[index * 5 + 1],
            'y': this.endPoint[index * 5 + 2]}})
        .draw();
    }

    var marker = this.markers_.getMarker(index);
    if (marker) {
      marker
        .positionProvider({'value': {
            'x': this.endPoint[index * 5 + 3],
            'y': this.endPoint[index * 5 + 4]}})
        .draw();
    }
  }, this);
  this.series_.setAnimation(false);
};
