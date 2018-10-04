//region --- Requiring and Providing
goog.provide('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.math.Rect');
//endregion



/**
 * @param {boolean=} opt_skipDefaultThemes
 *
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.CircularLabelsFactory = function(opt_skipDefaultThemes) {
  anychart.core.ui.CircularLabelsFactory.base(this, 'constructor', opt_skipDefaultThemes);

  if (!goog.array.contains(this.settingsFieldsForMerge, 'autoRotate'))
    this.settingsFieldsForMerge.push('autoRotate');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['autoRotate', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
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

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'autoRotate',
      anychart.core.settings.booleanNormalizer);

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


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.ui.CircularLabelsFactory.prototype.measureWithoutAutoRotate = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var points = anychart.core.ui.LabelsFactory.prototype.measureWithTransform.call(this, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);
  return anychart.math.Rect.fromCoordinateBox(points);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {Array.<number>} Label bounds.
 */
anychart.core.ui.CircularLabelsFactory.prototype.measureWithTransform = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var rotation, anchor, angle;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.CircularLabelsFactory.Label)) {
    angle = (formatProviderOrLabel.positionProvider() ? formatProviderOrLabel.positionProvider()['value']['angle'] : 0) || 0;
    rotation = formatProviderOrLabel.getRotation(angle);
    anchor = formatProviderOrLabel.getFinalSettings('anchor');
    if (anchor == anychart.enums.Anchor.AUTO)
      anchor = formatProviderOrLabel.getFinalSettings('autoRotate') ?
          anychart.enums.Anchor.CENTER :
          anychart.utils.getAnchorForAngle(angle);
    opt_cacheIndex = goog.isDef(opt_cacheIndex) ? opt_cacheIndex : formatProviderOrLabel.getIndex();
  } else {
    var currentRotation = (goog.isDef(opt_settings) && goog.isDef(opt_settings['rotation']) ? opt_settings['rotation'] : this.getOption('rotation')) || 0;
    var autoRotate = (goog.isDef(opt_settings) && goog.isDef(opt_settings['autoRotate']) ? opt_settings['autoRotate'] : this.getOption('autoRotate')) || false;
    angle = (opt_positionProvider ? opt_positionProvider['value']['angle'] : 0) || 0;
    if (autoRotate) {
      if (angle > 0 && angle < 180)
        rotation = currentRotation + angle + 270;
      else
        rotation = currentRotation + angle + 90;
    } else {
      rotation = currentRotation;
    }
    anchor = goog.isDef(opt_settings) && opt_settings['anchor'] || this.getOption('anchor');
  }

  var bounds = this.getDimension(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);

  var rotationAngle = /** @type {number} */(rotation);
  var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(rotationAngle), point.x, point.y);

  var arr = bounds.toCoordinateBox() || [];
  tx.transform(arr, 0, arr, 0, 4);

  return arr;
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
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.CircularLabelsFactory.Label = function() {
  anychart.core.ui.CircularLabelsFactory.Label.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['autoRotate', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.ui.CircularLabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


//region --- Settings
/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = goog.object.clone(anychart.core.ui.LabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'autoRotate',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.CircularLabelsFactory.Label, anychart.core.ui.CircularLabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Drawing
/**
 * Returns angle for labels.
 * @param {number} angle Label angle position.
 * @return {number} final rotation angle.
 */
anychart.core.ui.CircularLabelsFactory.Label.prototype.getRotation = function(angle) {
  var currentRotation = /** @type {number} */(this.getFinalSettings('rotation'));
  var autoRotate = this.getFinalSettings('autoRotate');
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
  if (!this.mergedSettings)
    this.getMergedSettings();

  var positionFormatter = this.mergedSettings['positionFormatter'];
  var isTextByPath = !!this.textElement.path();
  var anchor = isTextByPath ?
      anychart.enums.Anchor.CENTER :
      anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(this.mergedSettings['anchor']) || anychart.enums.Anchor.LEFT_TOP;

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
      new anychart.math.Rect(0, 0, bounds.width, bounds.height), anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  this.textX += x;
  this.textY += y;
  bounds.left = /** @type {number} */(x);
  bounds.top = /** @type {number} */(y);

  // if (!this.anchPoint)
  //   this.anchPoint = this.container().circle(x, y, 2).fill('red').stroke('black').zIndex(1000);
  // this.anchPoint.center({x: x, y: y});
  //
  // if (!this.labelBounds)
  //   this.labelBounds = this.container().rect().fill('none').stroke('red').zIndex(1000);
  // this.labelBounds.setBounds(new anychart.math.rect(bounds.left, bounds.top, bounds.width, bounds.height));

  this.mergedSettings['rotation'] = this.getRotation(angle);
  if (this.isComplex) {
    this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
  } else {
    this.textElement.setPosition(/** @type {number} */(this.textX), /** @type {number} */(this.textY));
  }
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
