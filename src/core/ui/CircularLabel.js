goog.provide('anychart.core.ui.CircularLabel');
goog.require('acgraph.math');
goog.require('anychart.core.ui.Label');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.math.Coordinate');



/**
 * Circular label element class.
 * @constructor
 * @extends {anychart.core.ui.Label}
 */
anychart.core.ui.CircularLabel = function() {
  anychart.core.ui.CircularLabel.base(this, 'constructor');

  /**
   * X coord of circular center.
   * @type {number}
   * @private
   */
  this.cx_ = NaN;

  /**
   * Y coord of circular center..
   * @type {number}
   * @private
   */
  this.cy_ = NaN;

  /**
   * Parent radius.
   * @type {number}
   * @private
   */
  this.parentRadius_;

  /**
   * Start angle.
   * @type {?number}
   * @private
   */
  this.startAngle_;

  /**
   * Sweep angle.
   * @type {?number}
   * @private
   */
  this.sweepAngle_;
};
goog.inherits(anychart.core.ui.CircularLabel, anychart.core.ui.Label);


/**
 * Pix X coord of center.
 * @param {?(number)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.ui.Label|number} Pix X coord of center or itself for chaining.
 */
anychart.core.ui.CircularLabel.prototype.cx = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.cx_ != opt_value) {
      this.cx_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cx_;
  }
};


/**
 * Pix Y coord of center.
 * @param {?(number)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.ui.Label|number} Pix Y coord of center or itself for chaining.
 */
anychart.core.ui.CircularLabel.prototype.cy = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.cy_ != opt_value) {
      this.cy_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cy_;
  }
};


/**
 * Parent radius.
 * @param {?(number)=} opt_value Parent radius.
 * @return {!anychart.core.ui.Label|number} Parent radius or itself for chaining.
 */
anychart.core.ui.CircularLabel.prototype.parentRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.parentRadius_ != opt_value) {
      this.parentRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.parentRadius_;
  }
};


/**
 * Set start angle.
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.ui.CircularLabel)} .
 */
anychart.core.ui.CircularLabel.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Set sweep angle.
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.ui.CircularLabel)} .
 */
anychart.core.ui.CircularLabel.prototype.sweepAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
    if (this.sweepAngle_ != opt_value) {
      this.sweepAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.sweepAngle_;
  }
};


/** @inheritDoc */
anychart.core.ui.CircularLabel.prototype.drawLabel = function() {
  //bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
  var parentX = parentBounds.left;
  var parentY = parentBounds.top;
  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;
  var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);

  // calculate position
  var position = new goog.math.Coordinate(0, 0);

  if (this.parentBounds() || (!isNaN(this.cx_) && !isNaN(this.cy_))) {
    var offsetX = /** @type {number|string} */(this.offsetX());
    var offsetY = /** @type {number|string} */(this.offsetY());
    var cx = isNaN(this.cx_) ? parentX + parentWidth / 2 : this.cx_;
    var cy = isNaN(this.cy_) ? parentY + parentHeight / 2 : this.cy_;
    var startAngle = goog.isDefAndNotNull(this.startAngle_) ? this.startAngle_ : 0;
    var sweepAngle = goog.isDefAndNotNull(this.sweepAngle_) ? this.sweepAngle_ : 360;
    var radius = goog.isDef(this.parentRadius_) && !isNaN(this.parentRadius_) ?
        anychart.utils.normalizeSize(offsetY, this.parentRadius_) :
        this.parentBounds() ?
            anychart.utils.normalizeSize(offsetY, Math.min(parentWidth, parentHeight) / 2) :
            0;
    var angle = startAngle + anychart.utils.normalizeSize(offsetX, sweepAngle);

    position.x = cx + Math.cos(goog.math.toRadians(angle)) * radius;
    position.y = cy + Math.sin(goog.math.toRadians(angle)) * radius;
  } else {
    position.x = 0;
    position.y = 0;
  }

  var anchor = /** @type {anychart.enums.Anchor} */(this.anchor());
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  this.textX += position.x;
  this.textY += position.y;
  backgroundBounds.left = position.x;
  backgroundBounds.top = position.y;

  this.textElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  this.textElement.translate(/** @type {number} */(this.textX), /** @type {number} */(this.textY));
  var clipRect = new anychart.math.Rect(0, 0, this.textWidth, this.textHeight);
  this.textElement.clip(clipRect);

  return backgroundBounds;
};
