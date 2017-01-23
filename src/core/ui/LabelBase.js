goog.provide('anychart.core.ui.LabelBase');
goog.require('acgraph.math');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.math.Coordinate');



/**
 * LabelBase class.
 * @constructor
 * @extends {anychart.core.Text}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.LabelBase = function() {
  anychart.core.ui.LabelBase.base(this, 'constructor');

  /**
   * Label background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Label padding settings.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.width_ = null;

  /**
   * Label width settings.
   * @type {string|number|null}
   * @private
   */
  this.height_ = null;

  /**
   * Label width settings.
   * @type {number}
   * @private
   */
  this.rotation_;

  /**
   * Label position.
   * @type {anychart.enums.Position}
   * @private
   */
  this.position_;

  /**
   * Label anchor settings.
   * @type {?anychart.enums.Anchor}
   * @protected
   */
  this.anchorInternal;

  /**
   * Offset by X coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Label position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Label text element.
   * @type {acgraph.vector.Text}
   * @protected
   */
  this.textElement = null;

  /**
   * Adjust font size by width.
   * @type {boolean}
   * @private
   */
  this.adjustByWidth_ = false;

  /**
   * Adjust font size by height.
   * @type {boolean}
   * @private
   */
  this.adjustByHeight_ = false;

  /**
   * Minimimum font size for adjusting from.
   * @type {number}
   * @private
   */
  this.minFontSize_ = NaN;

  /**
   * Maximum font size for adjusting to.
   * @type {number}
   * @private
   */
  this.maxFontSize_ = NaN;

  /**
   * Root layer to listen events on.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();
  this.bindHandlersToGraphics(this.rootLayer_);
};
goog.inherits(anychart.core.ui.LabelBase, anychart.core.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LabelBase.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.LABEL_BACKGROUND;


//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for text.
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.LabelBase|string} .
 */
anychart.core.ui.LabelBase.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.string.makeSafe(opt_value);
  return /** @type {!anychart.core.ui.LabelBase|string} */(this.textSettings('text', opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelBase|anychart.core.ui.Background)} Returns the background or itself for method chaining.
 */
anychart.core.ui.LabelBase.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelBase.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABEL_BACKGROUND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.ui.LabelBase|anychart.core.utils.Padding} .
 */
anychart.core.ui.LabelBase.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelBase.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for width.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|number|string|null} .
 */
anychart.core.ui.LabelBase.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for height.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|number|string|null} .
 */
anychart.core.ui.LabelBase.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
//todo: not implemented yet
/**
 * Gets or sets label rotation settings.
 * @param {(number)=} opt_value Label rotation settings.
 * @return {number|anychart.core.ui.LabelBase} Label rotation settings or itself for method chaining.
 */
anychart.core.ui.LabelBase.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rotation_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.rotation_;
  }
};


/**
 * Is anchor should be set automatically.
 * @param {number=} opt_value Rotation auto mode.
 * @return {number|anychart.core.ui.LabelBase} Is anchor in auto mode or self for chaining.
 */
anychart.core.ui.LabelBase.prototype.autoRotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoRotation_ != opt_value) {
      this.autoRotation_ = opt_value;
      if (!this.anchor())
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoRotation_;
};


/**
 * Returns final anchor.
 * @return {number}
 */
anychart.core.ui.LabelBase.prototype.getFinalRotation = function() {
  return goog.isDef(this.rotation_) && !isNaN(this.rotation_) ? this.rotation_ : this.autoRotation_;
};


/**
 * Getter/setter for label anchor settings.
 * @param {?(anychart.enums.Anchor|string)=} opt_value .
 * @return {anychart.core.ui.LabelBase|anychart.enums.Anchor} .
 */
anychart.core.ui.LabelBase.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeAnchor(opt_value);
    if (this.anchorInternal != opt_value) {
      this.anchorInternal = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchorInternal;
  }
};


/**
 * Is anchor should be set automatically.
 * @param {anychart.enums.Anchor=} opt_value Anchor auto mode.
 * @return {anychart.enums.Anchor|anychart.core.ui.LabelBase} Is anchor in auto mode or self for chaining.
 */
anychart.core.ui.LabelBase.prototype.autoAnchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoAnchor_ != opt_value) {
      this.autoAnchor_ = opt_value;
      if (!this.anchor())
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoAnchor_;
};


/**
 * Returns final anchor.
 * @return {?anychart.enums.Anchor}
 */
anychart.core.ui.LabelBase.prototype.getFinalAnchor = function() {
  return /** @type {?anychart.enums.Anchor} */(this.anchor() || this.autoAnchor());
};


/**
 * Getter/setter for offsetX.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelBase} .
 */
anychart.core.ui.LabelBase.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetX_ = /** @type {number|string} */ (anychart.utils.normalizeNumberOrPercent(opt_value));
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter/setter for offsetY.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelBase} .
 */
anychart.core.ui.LabelBase.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.offsetY_ = /** @type {number|string} */ (anychart.utils.normalizeNumberOrPercent(opt_value));
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter/setter for position.
 * @param {(anychart.enums.Position|string)=} opt_value .
 * @return {!anychart.core.ui.LabelBase|anychart.enums.Position} .
 */
anychart.core.ui.LabelBase.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Helper method.
 * @private
 * @return {boolean} is adjustment enabled.
 */
anychart.core.ui.LabelBase.prototype.adjustEnabled_ = function() {
  return (this.adjustByWidth_ || this.adjustByHeight_);
};


/**
 * Getter/setter for minFontSize.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.LabelBase}
 */
anychart.core.ui.LabelBase.prototype.minFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minFontSize_ != +opt_value) {
      this.minFontSize_ = +opt_value;
      // we don't need to invalidate bounds if adjusting is not enabled
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.minFontSize_;
};


/**
 * Getter/setter for maxFontSize.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.LabelBase}
 */
anychart.core.ui.LabelBase.prototype.maxFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxFontSize_ != +opt_value) {
      this.maxFontSize_ = +opt_value;
      // we don't need to invalidate bounds if adjusting is not enabled
      if (this.adjustEnabled_())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxFontSize_;
};


/**
 * Getter/setter for adjustFontSize.
 * @param {(boolean|Array.<boolean, boolean>|{width:boolean,height:boolean})=} opt_adjustOrAdjustByWidth Is font needs to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustByHeight Is font needs to be adjusted by height.
 * @return {({width:boolean,height:boolean}|anychart.core.ui.LabelBase)} adjustFontSite setting or self for method chaining.
 */
anychart.core.ui.LabelBase.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustByHeight) {
  // if values are set as an array ( [true, true] [true, false] [false, true] [false, false] ) rather than a set of two arguments, simply expand their
  if (goog.isArray(opt_adjustOrAdjustByWidth)) {
    return this.adjustFontSize.apply(this, opt_adjustOrAdjustByWidth);
  } else if (goog.isObject(opt_adjustOrAdjustByWidth)) {
    this.adjustFontSize(opt_adjustOrAdjustByWidth['width'], opt_adjustOrAdjustByWidth['height']);
    return this;
  }
  var stateToInvalidate = 0;
  // if 2 params are set
  if (goog.isDef(opt_adjustByHeight)) {
    if (this.adjustByWidth_ != !!opt_adjustOrAdjustByWidth) {
      this.adjustByWidth_ = !!opt_adjustOrAdjustByWidth;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    if (this.adjustByHeight_ != !!opt_adjustByHeight) {
      this.adjustByHeight_ = !!opt_adjustByHeight;
      stateToInvalidate |= anychart.ConsistencyState.BOUNDS;
    }
    this.invalidate(stateToInvalidate, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  // if only one param is set -  adjusting for the both
  } else if (goog.isDef(opt_adjustOrAdjustByWidth)) {
    if (!(this.adjustByWidth_ == this.adjustByHeight_ && this.adjustByWidth_ == opt_adjustOrAdjustByWidth)) {
      this.adjustByWidth_ = this.adjustByHeight_ = /** @type {boolean} */ (opt_adjustOrAdjustByWidth);
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return {'width': this.adjustByWidth_, 'height': this.adjustByHeight_};
};


/**
 * @inheritDoc
 */
anychart.core.ui.LabelBase.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.disablePointerEvents_) {
      this.disablePointerEvents_ = opt_value;
      anychart.core.ui.LabelBase.base(this, 'disablePointerEvents', opt_value);
      this.background()['disablePointerEvents'](opt_value);
    }
    return this;
  } else {
    return this.disablePointerEvents_;
  }
};


/**
 * Getter for root layer.
 * @return {!acgraph.vector.Layer}
 */
anychart.core.ui.LabelBase.prototype.getRootLayer = function() {
  return this.rootLayer_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Check
 * @param {number} width
 * @param {number} height
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.core.ui.LabelBase.prototype.check_ = function(width, height, originWidth, originHeight) {
  if (this.adjustByWidth_ && this.adjustByHeight_) {
    if (width > originWidth || height > originHeight) {
      return 1;
    } else if (width < originWidth || height < originHeight) {
      return -1;
    }
  } else if (this.adjustByWidth_) {
    if (width < originWidth) {
      return -1;
    } else if (width > originWidth) {
      return 1;
    }
  } else if (this.adjustByHeight_) {
    if (height < originHeight) {
      return -1;
    } else if (height > originHeight) {
      return 1;
    }
  }

  return 0;
};


/**
 * Adjust font size by width/height.
 * @param {number} originWidth
 * @param {number} originHeight
 * @return {number}
 * @private
 */
anychart.core.ui.LabelBase.prototype.calculateFontSize_ = function(originWidth, originHeight) {
  /** @type {number} */
  var fontSize = Math.round((this.maxFontSize_ + this.minFontSize_) / 2);

  /** @type {number} */
  var from = this.minFontSize_;

  /** @type {number} */
  var to = this.maxFontSize_;

  /** @type {number} */
  var checked;

  var settings = this.changedSettings;
  var text = acgraph.text();
  text.attr('aria-hidden', 'true');
  this.applyTextSettings(text, true);
  this.changedSettings = settings;

  // check if the maximal value is ok
  text.fontSize(this.maxFontSize_);
  if (this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight) <= 0) {
    return this.maxFontSize_;
  }
  // set initial fontSize - that's half way between min and max
  text.fontSize(fontSize);
  // check sign
  var sign = checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);

  // divide in half and iterate waiting for the sign to change
  while (from != to) {
    if (checked < 0) {
      from = Math.min(fontSize + 1, to);
      fontSize += Math.floor((to - fontSize) / 2);
    } else if (checked > 0) {
      to = Math.max(fontSize - 1, from);
      fontSize -= Math.ceil((fontSize - from) / 2);
    } else {
      break;
    }
    text.fontSize(fontSize);
    checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);
    // sign chaneged if product is negative, 0 is an exit too
    if (sign * checked <= 0) {
      break;
    }
  }

  if (!checked) {
    // size is exactly ok for the bounds set
    goog.dispose(text);
    return fontSize;
  }

  // iterate increase/decrease font size until sign changes again
  do {
    fontSize += sign;
    text.fontSize(fontSize);
    checked = this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight);
  } while (sign * checked < 0);

  goog.dispose(text);
  // decrease font size only if we've been increasing it - we are looking for size to fit in bounds
  if (sign > 0) fontSize -= sign;
  return fontSize;
};


/**
 * Calculate label bounds.
 * @private
 */
anychart.core.ui.LabelBase.prototype.calculateLabelBounds_ = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  //TODO(AntonKagakin): need to rework autoWidth/autoHeight logic
  //and crop size if width/height is more than parentBounds
  //1) if no width/height but paretnBounds, width/height = parentBounds
  //2) if no bounds but adjustByWidth||Height => calculate to minFontSize
  //3) ...

  // canAdjustBy = !auto
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(this.width_)) {
      this.backgroundWidth = width = anychart.utils.normalizeSize(/** @type {number|string} */(this.width_), parentWidth);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(this.height_)) {
      this.backgroundHeight = height = anychart.utils.normalizeSize(/** @type {number|string} */(this.height_), parentHeight);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (!anychart.utils.isNaN(this.width_)) {
      autoWidth = false;
      this.backgroundWidth = width = anychart.utils.toNumber(this.width_);
    } else {
      autoWidth = true;
      width = 0;
    }
    if (!anychart.utils.isNaN(this.height_)) {
      autoHeight = false;
      this.backgroundHeight = height = anychart.utils.toNumber(this.height_);
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();

  this.textElement.width(null);
  this.textElement.height(null);

  if (autoWidth) {
    width += this.textElement.getBounds().width;
    this.textWidth = width;
    this.backgroundWidth = padding.widenWidth(width);
  } else {
    width = this.textWidth = padding.tightenWidth(width);
  }

  this.textElement.width(this.textWidth);

  if (autoHeight) {
    height += this.textElement.getBounds().height;
    this.textHeight = height;
    this.backgroundHeight = padding.widenHeight(height);
  } else {
    height = this.textHeight = padding.tightenHeight(height);
  }

  this.textElement.height(this.textHeight);

  var canAdjustByWidth = !autoWidth;
  var canAdjustByHeight = !autoHeight;

  var needAdjust = ((canAdjustByWidth && this.adjustByWidth_) || (canAdjustByHeight && this.adjustByHeight_));

  this.suspendSignalsDispatching();
  if (needAdjust) {
    var calculatedFontSize = this.calculateFontSize_(width, height);
    this.fontSize(calculatedFontSize);
    this.textElement.fontSize(calculatedFontSize);
    if (autoWidth) {
      this.textElement.width(null);
      this.textWidth = this.textElement.getBounds().width;
      this.textElement.width(this.textWidth);
      this.backgroundWidth = padding.widenWidth(this.textWidth);
    }
    if (autoHeight) {
      this.textElement.height(null);
      this.textHeight = this.textElement.getBounds().height;
      this.textElement.height(this.textHeight);
      this.backgroundHeight = padding.widenHeight(this.textHeight);
    }
  } else if (this.adjustByWidth_ || this.adjustByHeight_) {
    this.fontSize(this.minFontSize_);
    this.textElement.fontSize(this.minFontSize_);
    if (autoWidth) {
      this.textElement.width(null);
      this.textWidth = this.textElement.getBounds().width;
      this.textElement.width(this.textWidth);
      this.backgroundWidth = padding.widenWidth(this.textWidth);
    }
    if (autoHeight) {
      this.textElement.height(null);
      this.textHeight = this.textElement.getBounds().height;
      this.textElement.height(this.textHeight);
      this.backgroundHeight = padding.widenHeight(this.textHeight);
    }
  }
  this.resumeSignalsDispatching(false);

  this.textX = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), this.backgroundWidth);
  this.textY = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), this.backgroundHeight);
};


/**
 * Label drawing.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.ui.LabelBase.prototype.drawLabel = function() {
  //bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds()) || anychart.math.rect(0, 0, 0, 0);
  var parentX = parentBounds.left;
  var parentY = parentBounds.top;
  var parentWidth = parentBounds.width;
  var parentHeight = parentBounds.height;
  var backgroundBounds = new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);

  // calculate position
  var position = new goog.math.Coordinate(0, 0);

  if (this.parentBounds()) {
    switch (this.position_) {
      case anychart.enums.Position.LEFT_TOP:
        position.x = parentX;
        position.y = parentY;
        break;

      case anychart.enums.Position.LEFT_CENTER:
        position.x = parentX;
        position.y = parentY + parentHeight / 2;
        break;

      case anychart.enums.Position.LEFT_BOTTOM:
        position.x = parentX;
        position.y = parentY + parentHeight;
        break;

      case anychart.enums.Position.CENTER_TOP:
        position.x = parentX + parentWidth / 2;
        position.y = parentY;
        break;

      case anychart.enums.Position.CENTER:
        position.x = parentX + parentWidth / 2;
        position.y = parentY + parentHeight / 2;
        break;

      case anychart.enums.Position.CENTER_BOTTOM:
        position.x = parentX + parentWidth / 2;
        position.y = parentY + parentHeight;
        break;

      case anychart.enums.Position.RIGHT_TOP:
        position.x = parentX + parentWidth;
        position.y = parentY;
        break;

      case anychart.enums.Position.RIGHT_CENTER:
        position.x = parentX + parentWidth;
        position.y = parentY + parentHeight / 2;
        break;

      case anychart.enums.Position.RIGHT_BOTTOM:
        position.x = parentX + parentWidth;
        position.y = parentY + parentHeight;
        break;
    }
  } else {
    position.x = 0;
    position.y = 0;
  }

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight),
      this.getFinalAnchor());

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalizeSize(this.offsetX_, parentWidth) : 0;
  var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalizeSize(this.offsetY_, parentHeight) : 0;
  anychart.utils.applyOffsetByAnchor(position, this.getFinalAnchor(), offsetX, offsetY);

  this.textX += position.x;
  this.textY += position.y;
  backgroundBounds.left = position.x;
  backgroundBounds.top = position.y;

  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
  //var clip = this.textElement.clip();
  //if (clip) {
  //  clip.shape(this.textX, this.textY, this.textWidth, this.textHeight);
  //} else {
  //  clip = acgraph.clip(this.textX, this.textY, this.textWidth, this.textHeight);
  //  this.textElement.clip(clip);
  //}

  return backgroundBounds;
};


/**
 * Render label content.
 * @return {!anychart.core.ui.LabelBase} {@link anychart.core.ui.LabelBase} instance for method chaining.
 */
anychart.core.ui.LabelBase.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = this.createTextElement_();

  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.background_) this.background_.container(this.rootLayer_).draw();
    if (this.textElement) this.textElement.parent(this.rootLayer_);
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.background_) this.background_.zIndex(0);
    if (this.textElement) this.textElement.zIndex(1);
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();

    var backgroundBounds = this.drawLabel();

    this.invalidate(anychart.ConsistencyState.LABEL_BACKGROUND);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.LABEL_BACKGROUND)) {
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.parentBounds(backgroundBounds);
      this.background_.draw();
      this.background_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.LABEL_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    var rotation = /** @type {number} */(this.getFinalRotation());
    var anchor = /** @type {anychart.enums.Anchor} */(this.getFinalAnchor());

    if (!goog.isDef(rotation) || isNaN(rotation)) {
      rotation = 0;
    }

    var coordinateByAnchor = anychart.utils.getCoordinateByAnchor(/** @type {anychart.math.Rect} */(backgroundBounds), anchor);
    this.rootLayer_.setRotation(/** @type {number} */(rotation), coordinateByAnchor.x, coordinateByAnchor.y);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.remove = function() {
  this.rootLayer_.parent(null);
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  anychart.core.ui.LabelBase.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Create text element if it does not exists yet. Return flag, if text element is created or not.
 * @return {boolean} Whether text element created or not.
 * @private
 */
anychart.core.ui.LabelBase.prototype.createTextElement_ = function() {
  var isInitial;
  if (isInitial = !this.textElement) {
    this.textElement = acgraph.text();
    this.textElement.attr('aria-hidden', 'true');
  }
  return isInitial;
};


/**
 * Return label content bounds.
 * @return {anychart.math.Rect} Label content bounds.
 */
anychart.core.ui.LabelBase.prototype.getContentBounds = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var isInitial = this.createTextElement_();
    this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement), isInitial);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();
  }

  return new anychart.math.Rect(0, 0, this.backgroundWidth, this.backgroundHeight);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.serialize = function() {
  var json = anychart.core.ui.LabelBase.base(this, 'serialize');
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  if (goog.isDefAndNotNull(this.width_))
    json['width'] = this.width_;
  if (goog.isDefAndNotNull(this.height_))
    json['height'] = this.height_;
  if (goog.isDef(this.anchorInternal))
    json['anchor'] = this.anchorInternal;
  if (goog.isDefAndNotNull(this.offsetX_))
    json['offsetX'] = this.offsetX_;
  if (goog.isDefAndNotNull(this.offsetY_))
    json['offsetY'] = this.offsetY();
  if (goog.isDef(this.text()))
    json['text'] = this.text();
  if (!isNaN(this.minFontSize_))
    json['minFontSize'] = this.minFontSize_;
  if (!isNaN(this.maxFontSize_))
    json['maxFontSize'] = this.maxFontSize_;
  json['adjustFontSize'] = this.adjustFontSize();
  if (goog.isDef(this.rotation_))
    json['rotation'] = this.rotation_;
  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isString(args[0])) {
    this.text(args[0]);
    this.enabled(true);
    return true;
  }
  return anychart.core.Text.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.LabelBase.base(this, 'setupByJSON', config, opt_default);

  if ('background' in config)
    this.background(config['background']);

  if ('padding' in config)
    this.padding(config['padding']);

  this.width(config['width']);
  this.height(config['height']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.text(config['text']);
  this.minFontSize(config['minFontSize']);
  this.maxFontSize(config['maxFontSize']);
  this.adjustFontSize(config['adjustFontSize']);
  this.rotation(config['rotation']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.disposeInternal = function() {
  goog.dispose(this.padding_);
  goog.dispose(this.background_);
  goog.dispose(this.textElement);
  anychart.core.ui.LabelBase.base(this, 'disposeInternal');
};
