goog.provide('anychart.animations.BarAnimation');
goog.require('anychart.animations.Animation');



/**
 * Bar animation.
 * @param {anychart.core.cartesian.series.Bar|anychart.core.cartesian.series.Bar3d} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BarAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  this.labels_ = this.series_.labels();
  this.markers_ = this.series_.markers();

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
  /** @type {Array} */
  this.zero = [];
  var iterator = this.series_.getResetIterator();
  var barHeight = this.series_.getPointWidth();
  while (iterator.advance()) {
    var x = /** @type {number} */ (iterator.meta('x'));
    var y = this.series_.is3d ? /** @type {number} */ (iterator.meta('x3d')) : /** @type {number} */ (iterator.meta('value'));
    var zero = this.series_.is3d ? /** @type {number} */ (iterator.meta('zero3d')) : /** @type {number} */ (iterator.meta('zero'));
    var width = /** @type {number} */ (iterator.meta('zero')) - /** @type {number} */ (iterator.meta('value'));

    var shapeBounds = anychart.math.rect(Math.min(zero, y), x - barHeight / 2, Math.abs(width), barHeight);

    var labelsPosition = this.series_.getLabelsPosition(anychart.PointState.NORMAL);
    var labelProvider = this.series_.is3d ?
        this.series_.createLabelsPositionProvider(labelsPosition)['value'] :
        this.createPositionProvider(shapeBounds, labelsPosition)['value'];

    var markersPosition = this.series_.getMarkersPosition(anychart.PointState.NORMAL);
    var markerProvider = this.createPositionProvider(shapeBounds, markersPosition)['value'];

    this.startPoint.push(0);    // rect
    this.startPoint.push(zero); // labels
    this.startPoint.push(zero); // markers

    this.endPoint.push(width);               // rect
    this.endPoint.push(labelProvider['x']);  // labels
    this.endPoint.push(markerProvider['x']); // marker

    this.zero.push(zero);
  }

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onAnimate = function() {
  if (this.series_.is3d) {
    var iter = this.series_.getResetIterator();
    var index;
    while (iter.advance()) {
      index = iter.getIndex();
      this.animate3dPoint_();
      this.animateLabel_(index, true);
      this.animateMarker_(index, true);
    }
  } else {
    this.series_.getRootElement().forEachChild(function(child, index) {
      child.setX(this.zero[index] - this.coords[index * 3]).setWidth(this.coords[index * 3]);
      this.animateLabel_(index, true);
      this.animateMarker_(index, true);
    }, this);
  }
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onEnd = function() {
  if (this.series_.is3d) {
    var iter = this.series_.getResetIterator();
    var index;
    while (iter.advance()) {
      index = iter.getIndex();
      this.animate3dPoint_();
      this.animateLabel_(index, false);
      this.animateMarker_(index, false);
    }
  } else {
    this.series_.getRootElement().forEachChild(function(child, index) {
      child.setX(this.zero[index] - this.endPoint[index * 3]).setWidth(this.endPoint[index * 3]);
      this.animateLabel_(index, false);
      this.animateMarker_(index, false);
    }, this);
  }
  this.series_.setAnimation(false);
};


/**
 * Animate point.
 * @private
 */
anychart.animations.BarAnimation.prototype.animate3dPoint_ = function() {
  var iter = this.series_.getIterator();
  var height = this.series_.getPointWidth();
  var value = iter.get('value');
  var index, x_, y_, width, pixelShift, x3dShift, y3dShift;
  var bottomSide, backSide, leftSide, rightSide, frontSide, topSide;

  frontSide = iter.meta('frontSide');
  backSide = iter.meta('backSide');
  topSide = iter.meta('topSide');
  bottomSide = iter.meta('bottomSide');
  leftSide = iter.meta('leftSide');
  rightSide = iter.meta('rightSide');

  y_ = /** @type {number} */(iter.meta('y3d'));
  index = iter.getIndex();
  x3dShift = /** @type {number} */(iter.meta('x3dShift'));
  y3dShift = /** @type {number} */(iter.meta('y3dShift'));

  if (frontSide) {
    pixelShift = /** @type {number} */(iter.meta('pixelShift'));
    x_ = this.zero[index] - this.coords[index * 3];
    width = this.coords[index * 3];

    // valueIsNegative
    if (anychart.utils.toNumber(iter.get('value')) < 0) {
      leftSide.clear()
          .moveTo(x_, y_)
          .lineTo(x_ + x3dShift + pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .lineTo(x_, y_ + height - pixelShift)
          .close();

      rightSide.clear()
          .moveTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
          .lineTo(x_ + width, y_ + height - pixelShift)
          .close();

    } else {
      rightSide.clear()
          .moveTo(x_, y_)
          .lineTo(x_ + x3dShift + pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .lineTo(x_, y_ + height - pixelShift)
          .close();

      leftSide.clear()
          .moveTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
          .lineTo(x_ + width, y_ + height - pixelShift)
          .close();
    }

    bottomSide.clear()
        .moveTo(x_ + pixelShift, y_ + height)
        .lineTo(x_ + width, y_ + height)
        .lineTo(x_ + width + x3dShift - pixelShift, y_ + height - y3dShift + pixelShift)
        .lineTo(x_ + x3dShift, y_ + height - y3dShift)
        .close();

    backSide.clear()
        .moveTo(x_ + x3dShift, y_ - y3dShift)
        .lineTo(x_ + x3dShift + width, y_ - y3dShift)
        .lineTo(x_ + x3dShift + width, y_ - y3dShift + height)
        .lineTo(x_ + x3dShift, y_ - y3dShift + height)
        .close();

    frontSide.clear()
        .moveTo(x_, y_)
        .lineTo(x_ + width, y_)
        .lineTo(x_ + width, y_ + height)
        .lineTo(x_, y_ + height)
        .close();

    topSide.clear()
        .moveTo(x_ + pixelShift, y_)
        .lineTo(x_ + width, y_)
        .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
        .lineTo(x_ + x3dShift, y_ - y3dShift)
        .close();
  }
};


/**
 * Animate points label.
 * @param {number} index Points index.
 * @param {boolean} startPhase Start phase flag.
 * @private
 */
anychart.animations.BarAnimation.prototype.animateLabel_ = function(index, startPhase) {
  var label = this.labels_.getLabel(index);
  if (label) {
    var labelPositionProvider = label.positionProvider()['value'];
    var coordIndex = index * 3 + 1;
    var x = startPhase ? this.coords[coordIndex] : this.endPoint[coordIndex];
    label
        .positionProvider({'value': {'x': x, 'y': labelPositionProvider['y']}})
        .draw();
  }
};


/**
 * Animate points marker.
 * @param {number} index Points index.
 * @param {boolean} startPhase Start phase flag.
 * @private
 */
anychart.animations.BarAnimation.prototype.animateMarker_ = function(index, startPhase) {
  var marker = this.markers_.getMarker(index);
  if (marker) {
    var markerPositionProvider = marker.positionProvider()['value'];
    var coordIndex = index * 3 + 2;
    var x = startPhase ? this.coords[coordIndex] : this.endPoint[coordIndex];
    marker
        .positionProvider({'value': {'x': x, 'y': markerPositionProvider['y']}})
        .draw();
  }
};
