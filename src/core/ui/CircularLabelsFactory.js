goog.provide('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.math.Rect');



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.CircularLabelsFactory = function() {
  anychart.core.ui.CircularLabelsFactory.base(this, 'constructor');

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

  if (!goog.array.contains(this.settingsFieldsForMerge, 'autoRotate'))
    this.settingsFieldsForMerge.push('autoRotate');
};
goog.inherits(anychart.core.ui.CircularLabelsFactory, anychart.core.ui.LabelsFactory);


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
      this.changedSettings['autoRotate'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoRotate_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Measurement.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.getDimension = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var text;
  var textElementBounds;
  var textWidth;
  var textHeight;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;
  var formatProvider;
  var positionProvider;

  if (!this.measureCustomLabel_) {
    this.measureCustomLabel_ = new anychart.core.ui.CircularLabelsFactory.Label();
  } else {
    this.measureCustomLabel_.clear();
  }

  if (formatProviderOrLabel instanceof anychart.core.ui.CircularLabelsFactory.Label) {
    var label = (/** @type {anychart.core.ui.LabelsFactory.Label} */(formatProviderOrLabel));
    this.measureCustomLabel_.setup(label.serialize());
    formatProvider = label.formatProvider();
    positionProvider = opt_positionProvider || label.positionProvider() || {'value' : {'angle': 0, 'radius': 0}};
  } else {
    formatProvider = formatProviderOrLabel;
    positionProvider = opt_positionProvider || {'value' : {'angle': 0, 'radius': 0}};
  }
  this.measureCustomLabel_.setSettings(opt_settings);

  var isHtml = goog.isDef(this.measureCustomLabel_.useHtml()) ? this.measureCustomLabel_.useHtml() : this.useHtml();

  //we should ask text element about bounds only after text format and text settings are applied

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var padding = opt_settings && opt_settings['padding'] ? this.measureCustomLabel_.padding() : this.padding();
  var widthSettings = this.measureCustomLabel_.width() || this.width();
  var heightSettings = this.measureCustomLabel_.height() || this.height();
  var offsetY = /** @type {number|string} */(this.measureCustomLabel_.offsetY() || this.offsetY());
  if (!goog.isDef(offsetY)) offsetY = 0;
  var offsetX = /** @type {number|string} */(this.measureCustomLabel_.offsetX() || this.offsetX());
  if (!goog.isDef(offsetX)) offsetX = 0;
  var anchor = /** @type {string} */(this.measureCustomLabel_.anchor() || this.anchor());


  if (!this.measureTextElement_) {
    this.measureTextElement_ = acgraph.text();
    this.measureTextElement_.attr('aria-hidden', 'true');
  }
  text = this.callTextFormatter(/** @type {Function} */(this.textFormatter()), formatProvider, opt_cacheIndex);
  this.measureTextElement_.width(null);
  this.measureTextElement_.height(null);
  if (isHtml) {
    this.measureTextElement_.htmlText(goog.isDefAndNotNull(text) ? String(text) : null);
  } else {
    this.measureTextElement_.text(goog.isDefAndNotNull(text) ? String(text) : null);
  }

  this.applyTextSettings(this.measureTextElement_, true);
  this.measureCustomLabel_.applyTextSettings(this.measureTextElement_, false);

  //define is width and height set from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(widthSettings), parentWidth));
    textWidth = padding.tightenWidth(width);
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    outerBounds.width = padding.widenWidth(width);
  }

  if (goog.isDef(textWidth)) this.measureTextElement_.width(textWidth);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(heightSettings), parentHeight));
    textHeight = padding.tightenHeight(height);
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    outerBounds.height = padding.widenHeight(height);
  }

  if (goog.isDef(textHeight)) this.measureTextElement_.height(textHeight);

  var formattedPosition = goog.object.clone(this.positionFormatter().call(positionProvider, positionProvider));
  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;

  var cx = 0;
  var cy = 0;

  if (parentBounds || (!isNaN(this.cx()) && !isNaN(this.cy()))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;

    cx = isNaN(this.cx()) ? parentX + parentWidth / 2 : this.cx();
    cy = isNaN(this.cy()) ? parentY + parentHeight / 2 : this.cy();

    var sweepAngle = goog.isDefAndNotNull(this.sweepAngle()) ? /** @type {number} */(this.sweepAngle()) : 360;

    var offsetRadius = goog.isDef(this.parentRadius()) && !isNaN(this.parentRadius()) ?
        anychart.utils.normalizeSize(offsetY, /** @type {number} */(this.parentRadius())) :
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

  return /**@type {anychart.math.Rect} */(outerBounds);
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.CircularLabelsFactory.Label();
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.serialize = function() {
  var json = anychart.core.ui.CircularLabelsFactory.base(this, 'serialize');
  if (this.changedSettings['autoRotate']) json['autoRotate'] = this.autoRotate();
  return json;
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.CircularLabelsFactory.base(this, 'setupByJSON', config, opt_default);
  this.autoRotate(config['autoRotate']);
};



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.CircularLabelsFactory.Label = function() {
  anychart.core.ui.CircularLabelsFactory.Label.base(this, 'constructor');
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
  var offsetX = this.mergedSettings['offsetX'] || 0;
  var offsetY = this.mergedSettings['offsetY'] || 0;

  var parentLabelsFactory = this.parentLabelsFactory();

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;
  var cx = 0;
  var cy = 0;

  if (parentBounds || (!isNaN(parentLabelsFactory.cx()) && !isNaN(parentLabelsFactory.cy()))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;
    var parentWidth = parentBounds.width;
    var parentHeight = parentBounds.height;

    cx = isNaN(parentLabelsFactory.cx()) ? parentX + parentWidth / 2 : parentLabelsFactory.cx();
    cy = isNaN(parentLabelsFactory.cy()) ? parentY + parentHeight / 2 : parentLabelsFactory.cy();

    var sweepAngle = goog.isDefAndNotNull(parentLabelsFactory.sweepAngle()) ? parentLabelsFactory.sweepAngle() : 360;

    var offsetRadius = goog.isDef(parentLabelsFactory.parentRadius()) && !isNaN(parentLabelsFactory.parentRadius()) ?
        anychart.utils.normalizeSize(offsetY, parentLabelsFactory.parentRadius()) :
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
  bounds.left = x;
  bounds.top = y;

  this.mergedSettings['rotation'] = this.getRotation_(angle);
  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.serialize = function() {
  var json = anychart.core.ui.CircularLabelsFactory.Label.base(this, 'serialize');
  if (goog.isDef(this.autoRotate())) json['autoRotate'] = this.autoRotate();
  return json;
};


/** @inheritDoc */
anychart.core.ui.CircularLabelsFactory.Label.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.CircularLabelsFactory.Label.base(this, 'setupByJSON', config, opt_default);
  this.autoRotate(config['autoRotate']);
};


//exports
(function() {
  var proto = anychart.core.ui.CircularLabelsFactory.prototype;
  proto['autoRotate'] = proto.autoRotate;
  proto = anychart.core.ui.CircularLabelsFactory.Label.prototype;
  proto['autoRotate'] = proto.autoRotate;
})();
