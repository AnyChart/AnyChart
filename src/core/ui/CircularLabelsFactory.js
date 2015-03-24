goog.provide('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.LabelsFactory');



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.CircularLabelsFactory = function() {
  goog.base(this);

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

  /**
   * Auto rotate.
   * @type {boolean}
   * @private
   */
  this.autoRotate_ = false;

  this.settingsFieldsForMerge.push('autoRotate');
};
goog.inherits(anychart.core.ui.CircularLabelsFactory, anychart.core.ui.LabelsFactory);


/**
 * Pix X coord of center.
 * @param {(number|null)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.ui.CircularLabelsFactory|number} Pix X coord of center or itself for chaining.
 */
anychart.core.ui.CircularLabelsFactory.prototype.cx = function(opt_value) {
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
 * @param {(number|null)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.ui.CircularLabelsFactory|number} Pix Y coord of center or itself for chaining.
 */
anychart.core.ui.CircularLabelsFactory.prototype.cy = function(opt_value) {
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
 * @param {(number|null)=} opt_value Parent radius.
 * @return {!anychart.core.ui.CircularLabelsFactory|number} Parent radius or itself for chaining.
 */
anychart.core.ui.CircularLabelsFactory.prototype.parentRadius = function(opt_value) {
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
 * @return {(number|anychart.core.ui.CircularLabelsFactory)} .
 */
anychart.core.ui.CircularLabelsFactory.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Set sweep angle.
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.ui.CircularLabelsFactory)} .
 */
anychart.core.ui.CircularLabelsFactory.prototype.sweepAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
    if (this.sweepAngle_ != opt_value) {
      this.sweepAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.sweepAngle_;
  }
};


/**
 * Auto rotates a label around an anchor.
 * @param {boolean=} opt_value Whether label auto rotate.
 * @return {boolean|anychart.core.ui.CircularLabelsFactory} Self for chaining call.
 */
anychart.core.ui.CircularLabelsFactory.prototype.autoRotate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.autoRotate_ !== opt_value) {
      this.autoRotate_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['autoRotate'] = true;
    return this;
  } else {
    return this.autoRotate_;
  }
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.CircularLabelsFactory.Label();
};



/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (this.changedSettings['autoRotate']) json['autoRotate'] = this.autoRotate();
  return json;
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.autoRotate(config['autoRotate']);
};


/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.CircularLabelsFactory.Label = function() {
  goog.base(this);
};
goog.inherits(anychart.core.ui.CircularLabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


/**
 * Auto rotates a label around an anchor.
 * @param {boolean=} opt_value Whether label auto rotate.
 * @return {boolean|anychart.core.ui.CircularLabelsFactory.Label} Self for chaining call.
 */
anychart.core.ui.CircularLabelsFactory.Label.prototype.autoRotate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.settingsObj.autoRotate !== opt_value) {
      this.settingsObj.autoRotate = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj.autoRotate;
  }
};


/**
 * Returns angle for labels.
 * @param {number} angle Label angle position.
 * @return {number} final rotation angle.
 * @private
 */
anychart.core.ui.CircularLabelsFactory.Label.prototype.getRotation_ = function(angle) {
  var currentRotation = this.mergedSettings['rotation'];
  var autoRotate = this.mergedSettings['autoRotate'];
  if (autoRotate) {
    if (angle > 0 && angle < 180)
      return currentRotation + angle + 270;
    else
      return currentRotation + angle + 90;
  } else {
    return currentRotation;
  }
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.drawLabel = function(bounds, parentBounds) {
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var anchor = this.mergedSettings['anchor'];
  var offsetX = this.mergedSettings['offsetX'];
  var offsetY = this.mergedSettings['offsetY'];

  //bounds
  var parentX = parentBounds.left;
  var parentY = parentBounds.top;
  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;

  var parentLabelsFactory = this.parentLabelsFactory();
  var currentLabelsFactory = this.currentLabelsFactory() ? this.currentLabelsFactory() : parentLabelsFactory;
  var labelsFactory = currentLabelsFactory ? currentLabelsFactory : parentLabelsFactory;

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];

  if (parentBounds || (!isNaN(labelsFactory.cx()) && !isNaN(labelsFactory.cy()))) {
    var cx = isNaN(labelsFactory.cx()) ? parentX + parentWidth / 2 : labelsFactory.cx();
    var cy = isNaN(labelsFactory.cy()) ? parentY + parentHeight / 2 : labelsFactory.cy();

    var sweepAngle = goog.isDefAndNotNull(labelsFactory.sweepAngle()) ? labelsFactory.sweepAngle() : 360;

    var offsetRadius = goog.isDef(labelsFactory.parentRadius()) && !isNaN(labelsFactory.parentRadius()) ?
        anychart.utils.normalizeSize(offsetY, labelsFactory.parentRadius()) :
        parentBounds ?
            anychart.utils.normalizeSize(offsetY, Math.min(parentWidth, parentHeight) / 2) :
            0;

    angle += anychart.utils.normalizeSize(offsetX, sweepAngle);
    radius += offsetRadius;
  }

  var x = cx + Math.cos(goog.math.toRadians(angle)) * radius;
  var y = cy + Math.sin(goog.math.toRadians(angle)) * radius;

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, bounds.width, bounds.height),
      anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  this.textX += x;
  this.textY += y;
  bounds.left = x;
  bounds.top = y;

  this.mergedSettings['rotation'] = this.getRotation_(angle);
  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isDef(this.autoRotate())) json['autoRotate'] = this.autoRotate();
  return json;
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.autoRotate(config['autoRotate']);
};


anychart.core.ui.CircularLabelsFactory.prototype['autoRotate'] = anychart.core.ui.CircularLabelsFactory.prototype.autoRotate;
anychart.core.ui.CircularLabelsFactory.Label.prototype['autoRotate'] = anychart.core.ui.CircularLabelsFactory.Label.prototype.autoRotate;
