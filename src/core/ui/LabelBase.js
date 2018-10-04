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
   * @type {anychart.math.Rect|undefined}
   * @private
   */
  this.bgBounds_ = void 0;

  /**
   * Label padding settings.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Label text element.
   * @type {acgraph.vector.Text}
   * @protected
   */
  this.textElement = null;

  /**
   * Root layer to listen events on.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();
  this.bindHandlersToGraphics(this.rootLayer_);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['text', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['rotation', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['adjustFontSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['minFontSize', 0, 0, 0, this.minMaxBeforeInvalidationHook],
    ['maxFontSize', 0, 0, 0, this.minMaxBeforeInvalidationHook]
  ]);


  this.descriptorsMeta['disablePointerEvents'].beforeInvalidationHook = function() {
    this.background()['disablePointerEvents'](this.getOwnOption('disablePointerEvents'));
  };


};
goog.inherits(anychart.core.ui.LabelBase, anychart.core.Text);
anychart.core.settings.populate(anychart.core.ui.LabelBase, anychart.core.Text.TEXT_DESCRIPTORS);


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


//region -- Descriptors.
/**
 * Before invalidation hook for minFontSize and maxFontSize props.
 */
anychart.core.ui.LabelBase.prototype.minMaxBeforeInvalidationHook = function() {
  if (this.adjustEnabled_())
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelBase.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'position',
      anychart.enums.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'width',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'height',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anchor',
      function(value) {
        return goog.isNull(value) ? null : anychart.enums.normalizeAnchor(value);
      });

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetX',
      anychart.utils.normalizeNumberOrPercent);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetY',
      anychart.utils.normalizeNumberOrPercent);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'rotation',
      anychart.core.settings.numberOrNullNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'adjustFontSize',
      anychart.core.settings.adjustFontSizeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minFontSize',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxFontSize',
      anychart.core.settings.numberNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LabelBase, anychart.core.ui.LabelBase.DESCRIPTORS);


//endregion
//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
//region -- Parental relations.
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.parent = function(opt_value) {
  var parent = /** @type {anychart.core.ui.LabelBase} */ (anychart.core.ui.LabelBase.base(this, 'parent'));

  if (goog.isDef(opt_value)) {
    if (parent != opt_value) {
      anychart.core.ui.LabelBase.base(this, 'parent', opt_value);
      if (goog.isNull(opt_value)) {
        this.background().parent(null);
        this.padding().parent(null);
      } else {
        this.background().dropThemes().parent((/** @type {anychart.core.ui.LabelBase} */ (opt_value)).background());
        this.padding().parent((/** @type {anychart.core.ui.LabelBase} */ (opt_value)).padding());
      }
    }
    return this;
  }

  return parent;
};


//endregion
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

    //TODO (A.Kudryavtsev): Actually is lazy setup stupid hack.
    this.background_.needsForceSignalsDispatching(true);

    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
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

    this.setupCreated('padding', this.padding_);
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


/**
 * Is anchor should be set automatically.
 * @param {number=} opt_value Rotation auto mode.
 * @return {number|anychart.core.ui.LabelBase} Is anchor in auto mode or self for chaining.
 */
anychart.core.ui.LabelBase.prototype.autoRotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoRotation_ != opt_value) {
      this.autoRotation_ = opt_value;
      if (!this.getOption('anchor'))
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
  var rot = this.getOption('rotation');
  return goog.isDefAndNotNull(rot) && !isNaN(rot) ? rot : this.autoRotation_;
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
      if (!this.getOption('anchor'))
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
  return /** @type {?anychart.enums.Anchor} */(this.getOption('anchor') || this.autoAnchor());
};


/**
 * Helper method.
 * @private
 * @return {boolean} is adjustment enabled.
 */
anychart.core.ui.LabelBase.prototype.adjustEnabled_ = function() {
  var adjustFontSize = this.getOption('adjustFontSize');
  return /** @type {boolean} */ ((adjustFontSize && (adjustFontSize.width || adjustFontSize.height)));
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
  var adjustFontSize = this.getOption('adjustFontSize');
  if (adjustFontSize) {
    if (adjustFontSize.width && adjustFontSize.height) {
      if (width > originWidth || height > originHeight) {
        return 1;
      } else if (width < originWidth || height < originHeight) {
        return -1;
      }
    } else if (adjustFontSize.width) {
      if (width < originWidth) {
        return -1;
      } else if (width > originWidth) {
        return 1;
      }
    } else if (adjustFontSize.height) {
      if (height < originHeight) {
        return -1;
      } else if (height > originHeight) {
        return 1;
      }
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
  var minFontSize = /** @type {number} */ (this.getOption('minFontSize'));
  var maxFontSize = /** @type {number} */ (this.getOption('maxFontSize'));
  /** @type {number} */
  var fontSize = Math.round((maxFontSize + minFontSize) / 2);

  /** @type {number} */
  var from = minFontSize;

  /** @type {number} */
  var to = maxFontSize;

  /** @type {number} */
  var checked;

  var text = acgraph.text();
  text.attr('aria-hidden', 'true');
  this.applyTextSettings(text, true);

  // check if the maximal value is ok
  text.fontSize(/** @type {number} */ (maxFontSize));
  if (this.check_(text.getBounds().width, text.getBounds().height, originWidth, originHeight) <= 0) {
    return /** @type {number} */ (maxFontSize);
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
 * Gets bounds for this.calculateLabelBounds_ label width and height correct calculation.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.LabelBase.prototype.getLabelsParentBounds = function() {
  return /** @type {anychart.math.Rect} */ (this.parentBounds());
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
  var w = this.getOption('width');
  var h = this.getOption('height');
  var whBounds = this.getLabelsParentBounds();
  if (parentBounds && whBounds) {
    if (goog.isDefAndNotNull(w)) {
      this.backgroundWidth = width = anychart.utils.normalizeSize(/** @type {number|string} */(w), whBounds.width);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(h)) {
      this.backgroundHeight = height = anychart.utils.normalizeSize(/** @type {number|string} */(h), whBounds.height);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (!anychart.utils.isNaN(w)) {
      autoWidth = false;
      this.backgroundWidth = width = anychart.utils.toNumber(w);
    } else {
      autoWidth = true;
      width = 0;
    }
    if (!anychart.utils.isNaN(h)) {
      autoHeight = false;
      this.backgroundHeight = height = anychart.utils.toNumber(h);
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

  var adjustFontSize = this.getOption('adjustFontSize');

  var needAdjust = (adjustFontSize && ((canAdjustByWidth && adjustFontSize.width) || (canAdjustByHeight && adjustFontSize.height)));

  this.suspendSignalsDispatching();
  if (needAdjust) {
    var calculatedFontSize = this.calculateFontSize_(width, height);
    this['fontSize'](calculatedFontSize);
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
  } else if (adjustFontSize && (adjustFontSize.width || adjustFontSize.height)) {
    this['fontSize'](this.getOption('minFontSize'));
    this.textElement.fontSize(/** @type {number|string} */ (this.getOption('minFontSize')));
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
 * Gets position overridable method.
 * @return {anychart.enums.Position}
 */
anychart.core.ui.LabelBase.prototype.getPosition = function() {
  return /** @type {anychart.enums.Position} */ (this.getOption('position')) || anychart.enums.Position.CENTER;
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
    switch (this.getPosition()) {
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

  var offsetX = goog.isDef(/** @type {number|string} */ (this.getOption('offsetX'))) ?
      anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('offsetX')), parentWidth) :
      0;
  var offsetY = goog.isDef(/** @type {number|string} */ (this.getOption('offsetY'))) ?
      anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('offsetY')), parentHeight) :
      0;
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

  var background = this.getCreated('background');
  if (background && !background.container())
    background.container(this.rootLayer_);

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (background) background.draw();
    if (this.textElement) this.textElement.parent(this.rootLayer_);
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (background) background.zIndex(0);
    if (this.textElement) this.textElement.zIndex(1);
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateLabelBounds_();

    this.bgBounds_ = this.drawLabel();

    this.invalidate(anychart.ConsistencyState.LABEL_BACKGROUND);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.LABEL_BACKGROUND)) {
    if (background) {
      background.needsForceSignalsDispatching(false);
      background.suspendSignalsDispatching();
      background.parentBounds(this.bgBounds_);
      background.draw();
      background.resumeSignalsDispatching(false);
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

    var coordinateByAnchor = anychart.utils.getCoordinateByAnchor(/** @type {anychart.math.Rect} */(this.bgBounds_), anchor);
    this.rootLayer_.setRotation(/** @type {number} */(rotation), coordinateByAnchor.x, coordinateByAnchor.y);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.remove = function() {
  this.rootLayer_.parent(null);
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
  anychart.core.settings.serialize(this, anychart.core.Text.TEXT_DESCRIPTORS, json, 'Label Base Text');
  anychart.core.settings.serialize(this, anychart.core.ui.LabelBase.DESCRIPTORS, json, 'Label Base');

  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isString(arg0)) {
    return {
      'text': arg0,
      'enabled': true
    };
  }
  return null;
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault) {
      if (this.themeSettings['text'] !== resolvedValue['text']) {
        this.themeSettings['text'] = resolvedValue['text'];
        this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    } else {
      if (this.ownSettings['text'] !== resolvedValue['text']) {
        this.ownSettings['text'] = resolvedValue['text'];
        this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
    this.enabled(resolvedValue['enabled']);
    return true;
  }

  return anychart.core.VisualBase.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.LabelBase.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.Text.TEXT_DESCRIPTORS, config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.LabelBase.DESCRIPTORS, config, opt_default);

  this.background().setupInternal(!!opt_default, config['background']);
  this.padding().setupInternal(!!opt_default, config['padding']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelBase.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.padding_,
      this.background_,
      this.textElement,
      this.rootLayer_);

  delete this.padding_;
  delete this.background_;
  delete this.textElement;
  delete this.rootLayer_;
  anychart.core.ui.LabelBase.base(this, 'disposeInternal');
};
