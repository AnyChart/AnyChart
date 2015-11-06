goog.provide('anychart.animations.BarAnimation');
goog.require('anychart.animations.Animation');



/**
 * Bar animation.
 * @param {anychart.core.cartesian.series.Bar} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BarAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  this.labels_ = this.series_.labels();
  this.markers_ = this.series_.markers();
  /**
   * @type {Array}
   */
  this.zero;

  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.BarAnimation, anychart.animations.Animation);


/**
 * Creates position provider for label.
 * @param {anychart.math.Rect} shapeBounds .
 * @param {string} position .
 * @return {Object}
 */
anychart.animations.BarAnimation.prototype.createPositionProvider = function(shapeBounds, position) {
  position = anychart.enums.normalizeAnchor(position);
  return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onBegin = function() {
  this.series_.setAnimation(true);
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.cycle = function(now) {
  this.startPoint = [];
  this.endPoint = [];
  this.zero = [];
  var iterator = this.series_.getResetIterator();
  var barHeight = this.series_.getPointWidth();
  while (iterator.advance()) {
    var x = /** @type {number} */ (iterator.meta('x'));
    var y = /** @type {number} */ (iterator.meta('value'));
    var zero = /** @type {number} */ (iterator.meta('zero'));

    var shapeBounds = anychart.math.rect(Math.min(zero, y), x - barHeight / 2, Math.abs(zero - y), barHeight);

    var labelsPosition = this.series_.getLabelsPosition(anychart.PointState.NORMAL);
    var labelProvider = this.createPositionProvider(shapeBounds, labelsPosition)['value'];

    var markersPosition = this.series_.getMarkersPosition(anychart.PointState.NORMAL);
    var markerProvider = this.createPositionProvider(shapeBounds, markersPosition)['value'];

    this.startPoint.push(0);    // rect
    this.startPoint.push(zero); // labels
    this.startPoint.push(zero); // markers

    this.endPoint.push(zero - y);            // rect
    this.endPoint.push(labelProvider['x']);  // labels
    this.endPoint.push(markerProvider['x']); // marker

    this.zero.push(zero);
  }

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setX(this.zero[index] - this.coords[index * 3]).setWidth(this.coords[index * 3]);
    var label = this.labels_.getLabel(index);
    if (label) {
      var labelPositionProvider = label.positionProvider()['value'];
      label
        .positionProvider({'value': {'y': labelPositionProvider['y'], 'x': this.coords[index * 3 + 1]}})
        .draw();
    }
    var marker = this.markers_.getMarker(index);
    if (marker) {
      var markerPositionProvider = marker.positionProvider()['value'];
      marker
        .positionProvider({'value': {'y': markerPositionProvider['y'], 'x': this.coords[index * 3 + 2]}})
        .draw();
    }
  }, this);
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setX(this.zero[index] - this.endPoint[index * 3]).setWidth(this.endPoint[index * 3]);
    var label = this.labels_.getLabel(index);
    if (label) {
      var labelPositionProvider = label.positionProvider()['value'];
      label
        .positionProvider({'value': {'y': labelPositionProvider['y'], 'x': this.endPoint[index * 3 + 1]}})
        .draw();
    }
    var marker = this.markers_.getMarker(index);
    if (marker) {
      var markerPositionProvider = marker.positionProvider()['value'];
      marker
        .positionProvider({'value': {'y': markerPositionProvider['y'], 'x': this.endPoint[index * 3 + 2]}})
        .draw();
    }
  }, this);
  this.series_.setAnimation(false);
};
