goog.provide('anychart.animations.ColumnAnimation');
goog.require('anychart.animations.Animation');



/**
 * Column animation.
 * @param {anychart.core.cartesian.series.Column|anychart.core.cartesian.series.Column3d} series
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
  var columnWidth = this.series_.getPointWidth();
  while (iterator.advance()) {
    var x = /** @type {number} */ (iterator.meta('x'));
    var y = this.series_.is3d ? /** @type {number} */ (iterator.meta('y3d')) : /** @type {number} */ (iterator.meta('value'));
    var zero = this.series_.is3d ? /** @type {number} */ (iterator.meta('zero3d')) : /** @type {number} */ (iterator.meta('zero'));
    var height = /** @type {number} */ (iterator.meta('zero')) - /** @type {number} */ (iterator.meta('value'));

    var shapeBounds = anychart.math.rect(x - columnWidth / 2, Math.min(zero, y), columnWidth, Math.abs(height));

    var labelsPosition = this.series_.getLabelsPosition(anychart.PointState.NORMAL);
    var labelProvider = this.series_.is3d ?
        this.series_.createLabelsPositionProvider(labelsPosition)['value'] :
        this.createPositionProvider(shapeBounds, labelsPosition)['value'];

    var markersPosition = this.series_.getMarkersPosition(anychart.PointState.NORMAL);
    var markerProvider = this.createPositionProvider(shapeBounds, markersPosition)['value'];

    this.startPoint.push(0);    // rect
    this.startPoint.push(zero); // labels
    this.startPoint.push(zero); // markers

    this.endPoint.push(height);              // rect
    this.endPoint.push(labelProvider['y']);  // labels
    this.endPoint.push(markerProvider['y']); // marker

    this.zero.push(zero);
  }

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onAnimate = function() {
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
      child.setY(this.zero[index] - this.coords[index * 3]).setHeight(this.coords[index * 3]);
      this.animateLabel_(index, true);
      this.animateMarker_(index, true);
    }, this);
  }
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onEnd = function() {
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
      child.setY(this.zero[index] - this.endPoint[index * 3]).setHeight(this.endPoint[index * 3]);
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
anychart.animations.ColumnAnimation.prototype.animate3dPoint_ = function() {
  var iter = this.series_.getIterator();
  var width = this.series_.getPointWidth();
  var index, x_, y_, height, pixelShift, x3dShift, y3dShift;
  var bottomSide, backSide, leftSide, rightSide, frontSide, topSide;

  frontSide = iter.meta('frontSide');
  backSide = iter.meta('backSide');
  topSide = iter.meta('topSide');
  bottomSide = iter.meta('bottomSide');
  leftSide = iter.meta('leftSide');
  rightSide = iter.meta('rightSide');

  x_ = iter.meta('x3d');
  index = iter.getIndex();
  x3dShift = /** @type {number} */(iter.meta('x3dShift'));
  y3dShift = /** @type {number} */(iter.meta('y3dShift'));

  if (frontSide) {
    pixelShift = /** @type {number} */(iter.meta('pixelShift'));
    y_ = this.zero[index] - this.coords[index * 3];
    height = this.coords[index * 3];

    // valueIsNegative
    if (anychart.utils.toNumber(iter.get('value')) < 0) {
      topSide.clear()
          .moveTo(x_ + pixelShift, y_ + height)
          .lineTo(x_ + width, y_ + height)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ + height - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .close();

      bottomSide.clear()
          .moveTo(x_ + pixelShift, y_)
          .lineTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ - y3dShift)
          .close();

    } else {
      bottomSide.clear()
          .moveTo(x_ + pixelShift, y_ + height)
          .lineTo(x_ + width, y_ + height)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ + height - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .close();

      topSide.clear()
          .moveTo(x_ + pixelShift, y_)
          .lineTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ - y3dShift)
          .close();
    }

    backSide.clear()
        .moveTo(x_ + x3dShift, y_ - y3dShift)
        .lineTo(x_ + x3dShift + width, y_ - y3dShift)
        .lineTo(x_ + x3dShift + width, y_ - y3dShift + height)
        .lineTo(x_ + x3dShift, y_ - y3dShift + height)
        .close();

    leftSide.clear()
        .moveTo(x_, y_)
        .lineTo(x_ + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
        .lineTo(x_ + x3dShift, y_ + height - y3dShift)
        .lineTo(x_, y_ + height - pixelShift)
        .close();

    rightSide.clear()
        .moveTo(x_ + width, y_)
        .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
        .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
        .lineTo(x_ + width, y_ + height - pixelShift)
        .close();

    frontSide.clear()
        .moveTo(x_, y_)
        .lineTo(x_ + width, y_)
        .lineTo(x_ + width, y_ + height)
        .lineTo(x_, y_ + height)
        .close();
  }
};


/**
 * Animate points label.
 * @param {number} index Points index.
 * @param {boolean} startPhase Start phase flag.
 * @private
 */
anychart.animations.ColumnAnimation.prototype.animateLabel_ = function(index, startPhase) {
  var label = this.labels_.getLabel(index);
  if (label) {
    var labelPositionProvider = label.positionProvider()['value'];
    var coordIndex = index * 3 + 1;
    var y = startPhase ? this.coords[coordIndex] : this.endPoint[coordIndex];
    label
        .positionProvider({'value': {'x': labelPositionProvider['x'], 'y': y}})
        .draw();
  }
};


/**
 * Animate points marker.
 * @param {number} index Points index.
 * @param {boolean} startPhase Start phase flag.
 * @private
 */
anychart.animations.ColumnAnimation.prototype.animateMarker_ = function(index, startPhase) {
  var marker = this.markers_.getMarker(index);
  if (marker) {
    var markerPositionProvider = marker.positionProvider()['value'];
    var coordIndex = index * 3 + 2;
    var y = startPhase ? this.coords[coordIndex] : this.endPoint[coordIndex];
    marker
        .positionProvider({'value': {'x': markerPositionProvider['x'], 'y': y}})
        .draw();
  }
};
