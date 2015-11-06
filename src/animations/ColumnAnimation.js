goog.provide('anychart.animations.ColumnAnimation');
goog.require('anychart.animations.Animation');



/**
 * Column animation.
 * @param {anychart.core.cartesian.series.Column} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.ColumnAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  this.labels_ = this.series_.labels();
  this.markers_ = this.series_.markers();

  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.ColumnAnimation, anychart.animations.Animation);


/**
 * Creates position provider for label.
 * @param {anychart.math.Rect} shapeBounds .
 * @param {string} position .
 * @return {Object}
 */
anychart.animations.ColumnAnimation.prototype.createPositionProvider = function(shapeBounds, position) {
  position = anychart.enums.normalizeAnchor(position);
  return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onBegin = function() {
  this.series_.setAnimation(true);
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.cycle = function(now) {
  this.startPoint = [];
  this.endPoint = [];
  /** @type {Array} */
  this.zero = [];
  var iterator = this.series_.getResetIterator();
  var columnHeight = this.series_.getPointWidth();
  while (iterator.advance()) {
    var x = /** @type {number} */ (iterator.meta('x'));
    var y = /** @type {number} */ (iterator.meta('value'));
    var zero = /** @type {number} */ (iterator.meta('zero'));

    var shapeBounds = anychart.math.rect(x - columnHeight / 2, Math.min(zero, y), columnHeight, Math.abs(zero - y));

    var labelsPosition = this.series_.getLabelsPosition(anychart.PointState.NORMAL);
    var labelProvider = this.createPositionProvider(shapeBounds, labelsPosition)['value'];

    var markersPosition = this.series_.getMarkersPosition(anychart.PointState.NORMAL);
    var markerProvider = this.createPositionProvider(shapeBounds, markersPosition)['value'];

    this.startPoint.push(0);    // rect
    this.startPoint.push(zero); // labels
    this.startPoint.push(zero); // markers

    this.endPoint.push(zero - y);            // rect
    this.endPoint.push(labelProvider['y']);  // labels
    this.endPoint.push(markerProvider['y']); // marker

    this.zero.push(zero);
  }

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setY(this.zero[index] - this.coords[index * 3]).setHeight(this.coords[index * 3]);
    var label = this.labels_.getLabel(index);
    if (label) {
      var labelPositionProvider = label.positionProvider()['value'];
      label
        .positionProvider({'value': {'x': labelPositionProvider['x'], 'y': this.coords[index * 3 + 1]}})
        .draw();
    }
    var marker = this.markers_.getMarker(index);
    if (marker) {
      var markerPositionProvider = marker.positionProvider()['value'];
      marker
        .positionProvider({'value': {'x': markerPositionProvider['x'], 'y': this.coords[index * 3 + 2]}})
        .draw();
    }
  }, this);
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setY(this.zero[index] - this.endPoint[index * 3]).setHeight(this.endPoint[index * 3]);
    var label = this.labels_.getLabel(index);
    if (label) {
      var labelPositionProvider = label.positionProvider()['value'];
      label
        .positionProvider({'value': {'x': labelPositionProvider['x'], 'y': this.endPoint[index * 3 + 1]}})
        .draw();
    }
    var marker = this.markers_.getMarker(index);
    if (marker) {
      var markerPositionProvider = marker.positionProvider()['value'];
      marker
        .positionProvider({'value': {'x': markerPositionProvider['x'], 'y': this.endPoint[index * 3 + 2]}})
        .draw();
    }
  }, this);
  this.series_.setAnimation(false);
};
