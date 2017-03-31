//region --- Requiring and Providing
goog.provide('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.math.Rect');
//endregion



/**
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.CircularLabelsFactory = function() {
  anychart.core.ui.CircularLabelsFactory.base(this, 'constructor');

  if (!goog.array.contains(this.settingsFieldsForMerge, 'autoRotate'))
    this.settingsFieldsForMerge.push('autoRotate');
};
goog.inherits(anychart.core.ui.CircularLabelsFactory, anychart.core.ui.LabelsFactory);


//region --- Settings
/**
 * Pix X coord of center.
 * @param {?(number)=} opt_value Pixel value of radial center.
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
 * @param {?(number)=} opt_value Pixel value of radial center.
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
 * @param {?(number)=} opt_value Parent radius.
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


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = goog.object.clone(anychart.core.ui.LabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS);

  map['autoRotate'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'autoRotate',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.CircularLabelsFactory, anychart.core.ui.CircularLabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Measurement
/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.getDimensionInternal = function(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor) {
  var parentWidth, parentHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;

  var cx = 0;
  var cy = 0;
  var factoryCx = this.cx();
  var factoryCy = this.cy();
  var factorySweepAngle = /** @type {number} */(this.sweepAngle());
  var factoryParentRadius = /** @type {number} */(this.parentRadius());

  if (parentBounds || (!isNaN(factoryCx) && !isNaN(factoryCy))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;

    cx = isNaN(factoryCx) ? parentX + parentWidth / 2 : factoryCx;
    cy = isNaN(factoryCy) ? parentY + parentHeight / 2 : factoryCy;

    var sweepAngle = goog.isDefAndNotNull(factorySweepAngle) ? factorySweepAngle : 360;

    var offsetRadius = goog.isDef(factoryParentRadius) && !isNaN(factoryParentRadius) ?
        anychart.utils.normalizeSize(offsetY, factoryParentRadius) :
        parentBounds ?
            anychart.utils.normalizeSize(offsetY, Math.min(parentWidth, parentHeight) / 2) :
            0;

    angle += anychart.utils.normalizeSize(offsetX, sweepAngle);
    radius += offsetRadius;
    radiusY += offsetRadius;
  }

  var x = cx + goog.math.angleDx(angle, radius);
  var y = cy + goog.math.angleDy(angle, radiusY);

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  outerBounds.left = /** @type {number} */(x);
  outerBounds.top = /** @type {number} */(y);

  return /** @type {anychart.math.Rect} */(outerBounds);
};


//endregion
//region --- Labels management
/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.CircularLabelsFactory.Label();
};
//endregion



/**
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.CircularLabelsFactory.Label = function() {
  anychart.core.ui.CircularLabelsFactory.Label.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.CircularLabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


//region --- Settings
/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = goog.object.clone(anychart.core.ui.LabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);
  map['autoRotate'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'autoRotate',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.CircularLabelsFactory.Label, anychart.core.ui.CircularLabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Drawing
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
  var offsetX = this.mergedSettings['offsetX'] || 0;
  var offsetY = this.mergedSettings['offsetY'] || 0;

  var factory = /** @type {anychart.core.ui.CircularLabelsFactory} */(this.getFactory());

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;
  var cx = 0;
  var cy = 0;
  var factoryCx = factory.cx();
  var factoryCy = factory.cy();
  var factorySweepAngle = /** @type {number} */(factory.sweepAngle());
  var factoryParentRadius = /** @type {number} */(factory.parentRadius());

  if (parentBounds || (!isNaN(factoryCx) && !isNaN(factoryCy))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;
    var parentWidth = parentBounds.width;
    var parentHeight = parentBounds.height;

    cx = isNaN(factoryCx) ? parentX + parentWidth / 2 : factoryCx;
    cy = isNaN(factoryCy) ? parentY + parentHeight / 2 : factoryCy;

    var sweepAngle = goog.isDefAndNotNull(factorySweepAngle) ? factorySweepAngle : 360;

    var offsetRadius = goog.isDef(factoryParentRadius) && !isNaN(factoryParentRadius) ?
        anychart.utils.normalizeSize(offsetY, factoryParentRadius) :
        parentBounds ?
            anychart.utils.normalizeSize(offsetY, Math.min(parentWidth, parentHeight) / 2) :
            0;

    angle += anychart.utils.normalizeSize(offsetX, sweepAngle);
    radius += offsetRadius;
    radiusY += offsetRadius;
  }

  var x = cx + goog.math.angleDx(angle, radius);
  var y = cy + goog.math.angleDy(angle, radiusY);

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, bounds.width, bounds.height),
      anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  this.textX += x;
  this.textY += y;
  bounds.left = /** @type {number} */(x);
  bounds.top = /** @type {number} */(y);

  this.mergedSettings['rotation'] = this.getRotation_(angle);
  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
};


//endregion
//region --- Exports
//exports
(function() {
  // var proto = anychart.core.ui.CircularLabelsFactory.prototype;
  // proto['autoRotate'] = proto.autoRotate;
  // proto = anychart.core.ui.CircularLabelsFactory.Label.prototype;
  // proto['autoRotate'] = proto.autoRotate;
})();
//endregion
