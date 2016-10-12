goog.provide('anychart.core.ui.SeriesTooltip');
goog.require('acgraph.math.Coordinate');
goog.require('anychart.compatibility');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Separator');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TooltipsContainer');
goog.require('anychart.math.Rect');
goog.require('goog.async.Delay');



/**
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.SeriesTooltip = function() {
  goog.base(this);

  /**
   * Tooltip X coordinate.
   * @type {number}
   * @private
   */
  this.x_ = 0;

  /**
   * Tooltip Y coordinate.
   * @type {number}
   * @private
   */
  this.y_ = 0;

  /**
   * @type {Function|string}
   * @private
   */
  this.titleFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * @type {Function|string}
   * @private
   */
  this.textFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * @type {string}
   * @private
   */
  this.valuePrefix_ = '';

  /**
   * @type {string}
   * @private
   */
  this.valuePostfix_ = '';

  /**
   * Delay in milliseconds before tooltip item becomes hidden.
   * @type {number}
   * @private
   */
  this.hideDelay_ = 0;

  /**
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.selectable_ = false;

  /**
   * Pointer events for title and content.
   * @type {boolean}
   * @private
   */
  this.disablePointerEvents_ = false;


  this.rootLayer_ = acgraph.layer();
  this.registerDisposable(this.rootLayer_);
  this.bindHandlersToGraphics(this.rootLayer_);
};
goog.inherits(anychart.core.ui.SeriesTooltip, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.SeriesTooltip.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TOOLTIP_POSITION |
    anychart.ConsistencyState.TOOLTIP_TITLE |
    anychart.ConsistencyState.TOOLTIP_SEPARATOR |
    anychart.ConsistencyState.TOOLTIP_CONTENT |
    anychart.ConsistencyState.TOOLTIP_BACKGROUND;


/**
 * Function to format title.
 * @param {(Function|string)=} opt_value Function to format title text.
 * @return {Function|string|anychart.core.ui.SeriesTooltip} Function to format title text or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.titleFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleFormatter_ != opt_value) {
      this.titleFormatter_ = opt_value;
    }
    return this;
  } else {
    return this.titleFormatter_;
  }
};


/**
 * Function to format content text.
 * @param {(Function|string)=} opt_value Function to format content text.
 * @return {Function|string|anychart.core.ui.SeriesTooltip} Function to format content text or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.textFormatter_ != opt_value) {
      this.textFormatter_ = opt_value;
    }
    return this;
  } else {
    return this.textFormatter_;
  }
};


/**
 * Function to format content text.
 * @param {Function=} opt_value Function to format content text.
 * @return {Function|anychart.core.ui.SeriesTooltip} Function to format content text or itself for method chaining.
 * @deprecated Use {@link #textFormatter} instead.
 */
anychart.core.ui.SeriesTooltip.prototype.contentFormatter = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.contentFormatter()', '.textFormatter()'], true);
  return /** @type {Function} */ (this.textFormatter(opt_value));
};


/**
 * Gets/Sets value prefix.
 * @param {string=} opt_value
 * @return {string|anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.valuePrefix = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.valuePrefix_ != opt_value) {
      this.valuePrefix_ = opt_value;
    }
    return this;
  } else {
    return this.valuePrefix_;
  }
};


/**
 * Gets/Sets value postfix.
 * @param {string=} opt_value
 * @return {string|anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.valuePostfix = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.valuePostfix_ != opt_value) {
      this.valuePostfix_ = opt_value;
    }
    return this;
  } else {
    return this.valuePostfix_;
  }
};


/**
 * Get formatted title.
 * @param {Object} contextProvider
 * @return {string}
 */
anychart.core.ui.SeriesTooltip.prototype.getFormattedTitle = function(contextProvider) {
  contextProvider = goog.object.clone(contextProvider);
  contextProvider['titleText'] = this.title_.getOption(anychart.opt.TEXT);
  var formatter = this.titleFormatter();
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);

  return formatter.call(contextProvider, contextProvider);
};


/**
 * Get formatted content.
 * @param {Object} contextProvider
 * @return {string}
 */
anychart.core.ui.SeriesTooltip.prototype.getFormattedContent = function(contextProvider) {
  contextProvider = goog.object.clone(contextProvider);
  contextProvider['valuePrefix'] = this.valuePrefix_ ? this.valuePrefix_ : '';
  contextProvider['valuePostfix'] = this.valuePostfix_ ? this.valuePostfix_ : '';
  var formatter = this.textFormatter();
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);

  var result = formatter.call(contextProvider, contextProvider);
  return goog.isDefAndNotNull(result) ? result : contextProvider['seriesName'];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip background.
 * @param {(string|Object|null|boolean)=} opt_value Background settings.
 * @return {!(anychart.core.ui.Background|anychart.core.ui.SeriesTooltip)} Background instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.registerDisposable(this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Title.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip title.
 * @param {(null|boolean|Object)=} opt_value Title settings.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.SeriesTooltip)} Title instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.title_.setParentEventTarget(this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.onTitleSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_TITLE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Separator.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip separator.
 * @param {(Object|boolean|null)=} opt_value Separator settings.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.SeriesTooltip)} Separator instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.separator = function(opt_value) {
  if (!this.separator_) {
    this.separator_ = new anychart.core.ui.Separator();
    this.separator_.listenSignals(this.onSeparatorSignal_, this);
    this.registerDisposable(this.separator_);
  }

  if (goog.isDef(opt_value)) {
    this.separator_.setup(opt_value);
    return this;
  } else {
    return this.separator_;
  }
};


/**
 * Internal separator invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.onSeparatorSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.instantPosition_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_SEPARATOR, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Content.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.SeriesTooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.contentInternal = function(opt_value) {
  if (!this.content_) {
    //todo: It does not need a core.ui.Label, instead it is to use core.ui.Text. You can do this in 7.9.0 release.
    //todo: We worry about backward compatibility.
    this.content_ = new anychart.core.ui.Label();
    this.content_.listenSignals(this.onContentSignal_, this);
    this.content_.setParentEventTarget(this);
    this.registerDisposable(this.content_);
  }

  if (goog.isDef(opt_value)) {
    this.content_.setup(opt_value);
    return this;
  } else {
    return this.content_;
  }
};


/**
 * Tooltip content.
 * @deprecated Use methods directly.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.SeriesTooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.content = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.content()', 'method directly'], true);
  return this.contentInternal(opt_value);
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.onContentSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.contentBounds_ = null;
    this.instantPosition_ = null;
    this.invalidate((anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.TOOLTIP_POSITION |
        anychart.ConsistencyState.TOOLTIP_TITLE |
        anychart.ConsistencyState.TOOLTIP_SEPARATOR |
        anychart.ConsistencyState.TOOLTIP_CONTENT |
        anychart.ConsistencyState.TOOLTIP_BACKGROUND),
        anychart.Signal.NEEDS_REDRAW);
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TOOLTIP_CONTENT, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 * @param {(string|number)=} opt_rightOrRightAndLeft
 * @param {(string|number)=} opt_bottom
 * @param {(string|number)=} opt_left
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.SeriesTooltip)} Padding instance or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.onPaddingSignal_, this);
    this.registerDisposable(this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.onPaddingSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.contentBounds_ = null;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * X coordinate of tooltip position.
 * @param {number=} opt_value New value of X coordinate of tooltip position.
 * @return {number|anychart.core.ui.SeriesTooltip} X coordinate of tooltip position of itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.x = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.x_ != opt_value) {
      this.x_ = opt_value;
      this.instantPosition_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.x_;
  }
};


/**
 * Y coordinate of tooltip position.
 * @param {number=} opt_value New value of Y coordinate of tooltip position.
 * @return {number|anychart.core.ui.SeriesTooltip} Y coordinate of tooltip position of itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.y = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.y_ != opt_value) {
      this.y_ = opt_value;
      this.instantPosition_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.y_;
  }
};


/**
 * Getter/setter for tooltip position.
 * @param {(anychart.enums.Position|string)=} opt_value
 * @return {anychart.enums.Position|anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Gets or sets Tooltip anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Tooltip anchor settings.
 * @return {anychart.core.ui.SeriesTooltip|anychart.enums.Anchor} Tooltip anchor settings or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.instantPosition_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Offset by X of tooltip position.
 * @param {number=} opt_value New value of X offset of tooltip position.
 * @return {number|anychart.core.ui.SeriesTooltip} X offset of tooltip position of itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.instantPosition_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Y offset of tooltip position.
 * @param {number=} opt_value New value of Y offset of tooltip position.
 * @return {number|anychart.core.ui.SeriesTooltip} Y offset of tooltip position of itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.instantPosition_ = null;
      this.invalidate(anychart.ConsistencyState.TOOLTIP_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text settings API.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/Sets font size setting for adjust text from.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.minFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.minFontSize(opt_value);
    return this;
  } else {
    return this.content_.minFontSize();
  }
};


/**
 * Gets/Sets font size setting for adjust text to.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.maxFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.maxFontSize(opt_value);
    return this;
  } else {
    return this.content_.maxFontSize();
  }
};


/**
 * Adjusting settings.
 * @param {(boolean|Array.<boolean, boolean>|{width:boolean,height:boolean})=} opt_adjustOrAdjustByWidth Is font needs to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustByHeight Is font needs to be adjusted by height.
 * @return {({width:boolean,height:boolean}|anychart.core.ui.SeriesTooltip)} adjustFontSite setting or self for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustByHeight) {
  if (goog.isDef(opt_adjustOrAdjustByWidth)) {
    this.content_.adjustFontSize(opt_adjustOrAdjustByWidth, opt_adjustByHeight);
    return this;
  } else {
    return this.content_.adjustFontSize();
  }
};


/**
 * Getter/Setter for text font size.
 * @param {string|number=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|string|number}
 */
anychart.core.ui.SeriesTooltip.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontSize(opt_value);
    return this;
  } else {
    return this.content_.fontSize();
  }
};


/**
 * Getter/Setter for the font family.
 * @param {string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|string}
 */
anychart.core.ui.SeriesTooltip.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontFamily(opt_value);
    return this;
  } else {
    return this.content_.fontFamily();
  }
};


/**
 * Getter/Setter for the text font color.
 * @param {string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|string}
 */
anychart.core.ui.SeriesTooltip.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontColor(opt_value);
    return this;
  } else {
    return this.content_.fontColor();
  }
};


/**
 * Getter/Setter for the text font opacity.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|number}
 */
anychart.core.ui.SeriesTooltip.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontOpacity(opt_value);
    return this;
  } else {
    return this.content_.fontOpacity();
  }
};


/**
 * Getter/Setter for the text font decoration.
 * @param {(anychart.enums.TextDecoration|string)=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.TextDecoration}
 */
anychart.core.ui.SeriesTooltip.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontDecoration(opt_value);
    return this;
  } else {
    return this.content_.fontDecoration();
  }
};


/**
 * Getter/Setter for the text font style.
 * @param {anychart.enums.FontStyle|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.FontStyle}
 */
anychart.core.ui.SeriesTooltip.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontStyle(opt_value);
    return this;
  } else {
    return this.content_.fontStyle();
  }
};


/**
 * Getter/Setter for the text font variant.
 * @param {anychart.enums.FontVariant|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.FontVariant}
 */
anychart.core.ui.SeriesTooltip.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontVariant(opt_value);
    return this;
  } else {
    return this.content_.fontVariant();
  }
};


/**
 * Getter/Setter for the text font weight.
 * @param {(string|number)=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|string|number}
 */
anychart.core.ui.SeriesTooltip.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.fontWeight(opt_value);
    return this;
  } else {
    return this.content_.fontWeight();
  }
};


/**
 * Getter/Setter for the text letter spacing.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|number|string}
 */
anychart.core.ui.SeriesTooltip.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.letterSpacing(opt_value);
    return this;
  } else {
    return this.content_.letterSpacing();
  }
};


/**
 * Getter/Setter for the text direction.
 * @param {anychart.enums.TextDirection|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.TextDirection}
 */
anychart.core.ui.SeriesTooltip.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.textDirection(opt_value);
    return this;
  } else {
    return this.content_.textDirection();
  }
};


/**
 * Getter/Setter for the text line height.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|number|string}
 */
anychart.core.ui.SeriesTooltip.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.lineHeight(opt_value);
    return this;
  } else {
    return this.content_.lineHeight();
  }
};


/**
 * Getter/Setter for the text indent.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|number}
 */
anychart.core.ui.SeriesTooltip.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.textIndent(opt_value);
    return this;
  } else {
    return this.content_.textIndent();
  }
};


/**
 * Getter/Setter for the text vertical align.
 * @param {anychart.enums.VAlign|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.VAlign}
 */
anychart.core.ui.SeriesTooltip.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.vAlign(opt_value);
    return this;
  } else {
    return this.content_.vAlign();
  }
};


/**
 * Getter/Setter for the text horizontal align.
 * @param {anychart.enums.HAlign|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.HAlign}
 */
anychart.core.ui.SeriesTooltip.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.hAlign(opt_value);
    return this;
  } else {
    return this.content_.hAlign();
  }
};


/**
 * Getter/Setter for the text wrap settings.
 * @param {anychart.enums.TextWrap|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|anychart.enums.TextWrap}
 */
anychart.core.ui.SeriesTooltip.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.textWrap(opt_value);
    return this;
  } else {
    return this.content_.textWrap();
  }
};


/**
 * Getter/Setter for the text overflow settings.
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|acgraph.vector.Text.TextOverflow}
 */
anychart.core.ui.SeriesTooltip.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.textOverflow(opt_value);
    return this;
  } else {
    return this.content_.textOverflow();
  }
};


/**
 * Getter/Setter for the tooltip selectable option.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|boolean}
 */
anychart.core.ui.SeriesTooltip.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.selectable_ != opt_value) {
      this.selectable_ = opt_value;
      this.title_[anychart.opt.SELECTABLE](opt_value);
      this.content_.selectable(opt_value);
    }
    return this;
  } else {
    return this.selectable_;
  }
};


/**
 * Pointer events affect tooltip content and title elements.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|boolean}
 */
anychart.core.ui.SeriesTooltip.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.disablePointerEvents_) {
      this.disablePointerEvents_ = opt_value;
      this.content_.disablePointerEvents(opt_value);
      this.title_[anychart.opt.DISABLE_POINTER_EVENTS](opt_value);
    }
    return this;
  } else {
    return this.disablePointerEvents_;
  }
};


/**
 * Getter/Setter for the useHTML flag.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.SeriesTooltip|boolean}
 */
anychart.core.ui.SeriesTooltip.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.content_.useHtml(opt_value);
    return this;
  } else {
    return this.content_.useHtml();
  }
};


/**
 * Getter/Setter for the full text appearance settings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean)=} opt_value Setting value if used as a setter.
 * @return {!(Object|string|number|boolean|anychart.core.ui.SeriesTooltip)} A copy of settings or the Text for chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    this.content_.textSettings(opt_objectOrName, opt_value);
    return this;
  } else {
    return this.content_.textSettings();
  }
};


/**
 * Draw tooltip.
 * @return {anychart.core.ui.SeriesTooltip}
 */
anychart.core.ui.SeriesTooltip.prototype.draw = function() {
  if (!this.checkDrawingNeeded()) {
    return this;
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateContentBounds_();
    this.boundsWithoutPadding_ = this.padding().tightenBounds(/** @type {!anychart.math.Rect} */(this.contentBounds_));
    this.titleRemainingBounds_ = null;
    this.separatorRemainingBounds_ = null;
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_POSITION)) {
    this.calculatePosition_();

    // reset translate (for move tooltip)
    this.rootLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.rootLayer_.translate(this.instantPosition_.x, this.instantPosition_.y);

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    background.parentBounds(this.contentBounds_);
    background.container(this.rootLayer_);
    background.resumeSignalsDispatching(false);
    background.draw();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_TITLE)) {
    var title = this.title();
    title.suspendSignalsDispatching();
    title.parentBounds(this.boundsWithoutPadding_);
    title.container(this.rootLayer_);
    title.resumeSignalsDispatching(false);
    title.draw();

    // title bounds
    if (!this.titleRemainingBounds_ && title.enabled())
      this.titleRemainingBounds_ = title.getRemainingBounds();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_TITLE);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_SEPARATOR)) {
    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    separator.suspendSignalsDispatching();
    separator.container(this.rootLayer_);
    separator.parentBounds(this.titleRemainingBounds_ || this.boundsWithoutPadding_);
    separator.resumeSignalsDispatching(false);
    separator.draw();

    //separator bounds
    if (!this.separatorRemainingBounds_ && separator.enabled())
      this.separatorRemainingBounds_ = separator.getRemainingBounds();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_SEPARATOR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TOOLTIP_CONTENT)) {
    var content = /** @type {anychart.core.ui.Label} */(this.contentInternal());
    var remainingBounds = this.separatorRemainingBounds_ || this.titleRemainingBounds_ || this.boundsWithoutPadding_;
    content.suspendSignalsDispatching();
    content.container(this.rootLayer_);
    content.parentBounds(remainingBounds);
    content.resumeSignalsDispatching(false);
    content.draw();

    this.markConsistent(anychart.ConsistencyState.TOOLTIP_CONTENT);
  }

  return this;
};


/**
 * Calculate tooltip all content bounds and cache it to this.contentBounds_.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.calculateContentBounds_ = function() {
  if (!this.contentBounds_) {
    var result = new anychart.math.Rect(0, 0, 0, 0);
    var separatorBounds;
    var tmpWidth = null;

    var title = /** @type {anychart.core.ui.Title} */(this.title());
    if (title.enabled()) {
      title.parentBounds(null);
      // fix for title.width('100%');
      if (anychart.utils.isPercent(title.width())) {
        tmpWidth = /** @type {number|string|null} */(title.width());
        title.width(null);
      }
      var titleBounds = title.getContentBounds();
      result.width = Math.max(result.width, titleBounds.width);
      result.height += titleBounds.height;

      if (tmpWidth) {
        title.width(tmpWidth);
        tmpWidth = null;
      }
    }

    var content = /** @type {anychart.core.ui.Label} */(this.contentInternal());
    if (content.enabled()) {
      content.parentBounds(null);
      if (title.width())
        content.width(/** @type {(number|string)} */(title.width()));
      // fix for content.width('100%');
      if (anychart.utils.isPercent(content.width())) {
        tmpWidth = /** @type {number|string|null} */(content.width());
        content.width(null);
      }
      var contentBounds = content.getContentBounds();
      result.width = Math.max(result.width, contentBounds.width);
      result.height += contentBounds.height;

      if (tmpWidth) {
        content.width(tmpWidth);
        tmpWidth = null;
      }
    }

    // fix for title and content .width('100%');
    if (title.enabled()) {
      title.parentBounds(new anychart.math.Rect(0, 0, result.width, titleBounds.height));
    }
    if (content.enabled()) {
      content.parentBounds(new anychart.math.Rect(0, 0, result.width, contentBounds.height));
    }

    var separator = /** @type {anychart.core.ui.Separator} */(this.separator());
    if (separator.enabled()) {
      separator.parentBounds((title.enabled() || content.enabled()) ? result : null);
      separatorBounds = separator.getContentBounds();
      result.width = Math.max(result.width, separatorBounds.width);
      result.height += separatorBounds.height;
    }

    this.contentBounds_ = this.padding().widenBounds(result);
  }
};


/**
 * Calculate tooltip position and cache it to this.instantPosition_.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.calculatePosition_ = function() {
  this.calculateContentBounds_();

  if (!this.instantPosition_) {
    /** @type {acgraph.math.Coordinate} */
    var position = new acgraph.math.Coordinate(this.x_, this.y_);
    var anchor = anychart.utils.getCoordinateByAnchor(this.contentBounds_, this.anchor_);
    position.x -= anchor.x;
    position.y -= anchor.y;
    anychart.utils.applyOffsetByAnchor(position, this.anchor_, this.offsetX_, this.offsetY_);
    this.instantPosition_ = position;
  }
};


/**
 * Return Tooltip pixel bounds.
 * @return {anychart.math.Rect} Tooltip pixel bounds.
 */
anychart.core.ui.SeriesTooltip.prototype.getPixelBounds = function() {
  this.calculatePosition_(); //also calculate content bounds, because it needs it.
  return new anychart.math.Rect(this.instantPosition_.x, this.instantPosition_.y, this.contentBounds_.width, this.contentBounds_.height);
};


/**
 * Return Tooltip content bounds.
 * @return {anychart.math.Rect} Tooltip content bounds.
 */
anychart.core.ui.SeriesTooltip.prototype.getContentBounds = function() {
  this.calculateContentBounds_();
  return this.contentBounds_;
};


/**
 * Sets/gets delay in milliseconds before tooltip item becomes hidden.
 * @param {number=} opt_value Delay in milliseconds.
 * @return {number|anychart.core.ui.SeriesTooltip} Delay in milliseconds or itself for method chaining.
 */
anychart.core.ui.SeriesTooltip.prototype.hideDelay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    // we have no need to invalidate anything here
    if (this.hideDelay_ != opt_value) {
      this.hideDelay_ = opt_value;
      this.createDelayObject_();
    }
    return this;
  } else {
    return this.hideDelay_;
  }
};


/**
 * Create timer object for hiding with delay, if hiding process has already started,
 * mark timer to recreate after hiding process ends.
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.createDelayObject_ = function() {
  // This wrapper with 'refreshDaley_' necessary to avoid memory leaks when changing hideDelay_ value.
  if (this.delay_ && this.delay_.isActive()) {
    this.refreshDaley_ = true;

  } else {
    goog.dispose(this.delay_);
    this.delay_ = new goog.async.Delay(function() {
      this.remove();
      if (this.refreshDaley_) {
        this.refreshDaley_ = false;
        this.createDelayObject_();
      }
    }, this.hideDelay_, this);
  }
};


/**
 * Show tooltip.
 * @param {number} clientX
 * @param {number} clientY
 */
anychart.core.ui.SeriesTooltip.prototype.show = function(clientX, clientY) {
  if (!this.rootLayer_.parent()) {
    this.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  if (this.delay_ && this.delay_.isActive()) this.delay_.stop();
  this.draw();

  var domElement = this.rootLayer_.domElement();

  // like selectable && enabled
  if (this.selectable_ && domElement) {
    domElement.style['pointer-events'] = 'all';

    this.createTriangle_(clientX, clientY);

    // bug fix (separated mode, the points are on top of one another)
    goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);

  } else if (domElement) {
    domElement.style['pointer-events'] = 'none';
  }
};


/**
 * Create triangle trajectory for selectable.
 * @param {number} x3
 * @param {number} y3
 * @return {Array.<number>|null}
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.createTriangle_ = function(x3, y3) {
  var pixelBounds = this.getPixelBounds();
  var x1, x2, y1, y2;

  // shift for boundary position
  var shift = 2;

  if (x3 < pixelBounds.getLeft()) {
    if (y3 < pixelBounds.getTop()) {
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      y3 += shift;

    } else {
      x1 = x2 = pixelBounds.getLeft() + shift;
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      x3 -= shift;
    }

  } else if (x3 > pixelBounds.getRight()) {
    if (y3 < pixelBounds.getTop()) {
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();
      y1 = pixelBounds.getBottom();
      y2 = pixelBounds.getTop();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();
      y1 = pixelBounds.getBottom();
      y2 = pixelBounds.getTop();

      y3 += shift;

    } else {
      x1 = x2 = pixelBounds.getRight() - shift;
      y1 = pixelBounds.getTop();
      y2 = pixelBounds.getBottom();

      x3 += shift;
    }

  } else {
    if (y3 < pixelBounds.getTop()) {
      y1 = y2 = pixelBounds.getTop() + shift;
      x1 = pixelBounds.getRight();
      x2 = pixelBounds.getLeft();

      y3 -= shift;

    } else if (y3 > pixelBounds.getBottom()) {
      y1 = y2 = pixelBounds.getBottom() - shift;
      x1 = pixelBounds.getLeft();
      x2 = pixelBounds.getRight();

      y3 += shift;

    } else {
      return null;
    }
  }

  this.triangle_ = [x1, y1, x2, y2, x3, y3];
  return this.triangle_;
};


/**
 * @param {goog.events.BrowserEvent} event
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.movementOutsideThePoint_ = function(event) {
  if (this.isInTriangle_(event['clientX'], event['clientY'])) {

    if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
      anychart.core.utils.TooltipsContainer.getInstance().selectable(true);
    }

  } else {
    goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
    goog.events.unlisten(this.rootLayer_.domElement(), goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);
    goog.events.unlisten(this.rootLayer_.domElement(), goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);

    this.hideSelectable_(event);
  }
};


/**
 * Cursor is in triangle trajectory to tooltip.
 * @param {number} clientX
 * @param {number} clientY
 * @return {boolean}
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.isInTriangle_ = function(clientX, clientY) {
  if (!this.triangle_) return false;

  var x1 = this.triangle_[0];
  var y1 = this.triangle_[1];
  var x2 = this.triangle_[2];
  var y2 = this.triangle_[3];
  var x3 = this.triangle_[4];
  var y3 = this.triangle_[5];

  var orientation1 = anychart.math.isPointOnLine(x1, y1, x2, y2, clientX, clientY);
  var orientation2 = anychart.math.isPointOnLine(x2, y2, x3, y3, clientX, clientY);
  var orientation3 = anychart.math.isPointOnLine(x3, y3, x1, y1, clientX, clientY);

  return (orientation1 == orientation2) && (orientation2 == orientation3);
};


/**
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.tooltipEnter_ = function() {
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
  goog.events.unlisten(this.rootLayer_.domElement(), goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);

  this.triangle_ = null;
};


/**
 * @param {goog.events.BrowserEvent} event
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.tooltipLeave_ = function(event) {
  goog.events.unlisten(this.rootLayer_.domElement(), goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);

  this.hideSelectable_(event);
};


/**
 * Hide the tooltip with delay (if specified).
 * @param {boolean=} opt_force Ignore tooltips hide delay.
 * @param {anychart.core.MouseEvent=} opt_event
 * @return {boolean} Returns true if the tooltip was hidden.
 */
anychart.core.ui.SeriesTooltip.prototype.hide = function(opt_force, opt_event) {
  if (opt_force) {
    if (this.delay_) this.delay_.stop();
    this.remove();
    return true;
  }

  if (this.selectable_ && opt_event) {
    var clientX = opt_event['originalEvent']['clientX'];
    var clientY = opt_event['originalEvent']['clientY'];
    var pixelBounds = this.getPixelBounds();
    var distance = pixelBounds.distance(new acgraph.math.Coordinate(clientX, clientY));

    // cursor inside the tooltip
    if (!distance) {
      goog.events.listen(this.rootLayer_.domElement(), goog.events.EventType.MOUSELEAVE, this.hideSelectable_, false, this);

      this.triangle_ = null;
      return false;
    }

    if (this.isInTriangle_(clientX, clientY)) {
      goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE, this.movementOutsideThePoint_, false, this);
      goog.events.listen(this.rootLayer_.domElement(), goog.events.EventType.MOUSEENTER, this.tooltipEnter_, false, this);
      goog.events.listen(this.rootLayer_.domElement(), goog.events.EventType.MOUSELEAVE, this.tooltipLeave_, false, this);
      return false;
    }

    this.triangle_ = null;
  }

  if (!this.hideDelay_) {
    this.remove();
    return true;

  } else {
    if (!this.delay_.isActive()) this.delay_.start();
    return false;
  }
};


/**
 * Hide the tooltip with delay (if specified). Used for selectable mode.
 * @param {goog.events.BrowserEvent} event
 * @return {boolean|undefined}
 * @private
 */
anychart.core.ui.SeriesTooltip.prototype.hideSelectable_ = function(event) {
  var browserEvent = event.getBrowserEvent();
  // Right button - show context menu
  if (browserEvent.buttons == 2) {
    return true;
  }

  if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
    anychart.core.utils.TooltipsContainer.getInstance().selectable(false);
  }

  goog.events.unlisten(this.rootLayer_.domElement(), goog.events.EventType.MOUSELEAVE, this.hideSelectable_, false, this);
  this.triangle_ = null;

  if (!this.hideDelay_) {
    this.hide(true);

  } else {
    if (!this.delay_.isActive()) this.delay_.start();
  }
};


/** @inheritDoc */
anychart.core.ui.SeriesTooltip.prototype.remove = function() {
  this.rootLayer_.parent(null);
};


/**
 * Allow tooltip to leave screen when moving.
 * @param {boolean=} opt_value Allow tooltip to leave screen when moving.
 * @deprecated Use chart.tooltip().allowLeaveScreen() instead.
 */
anychart.core.ui.SeriesTooltip.prototype.allowLeaveScreen = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['series.tooltip().allowLeaveScreen()', 'chart.tooltip().allowLeaveScreen()'], true);
};


/**
 * Allow tooltip to leave screen when moving.
 */
anychart.core.ui.SeriesTooltip.prototype.allowLeaveScreenInternal = anychart.core.ui.SeriesTooltip.prototype.allowLeaveScreen;


/**
 * Enabled 'float' position mode for all tooltips.
 * @param {boolean=} opt_value
 * @deprecated Use chart.tooltip().positionMode('float') instead.
 */
anychart.core.ui.SeriesTooltip.prototype.isFloating = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['series.tooltip().isFloating()', 'chart.tooltip().positionMode()'], true);
};


/**
 * Enabled 'float' position mode for all tooltips.
 */
anychart.core.ui.SeriesTooltip.prototype.isFloatingInternal = anychart.core.ui.SeriesTooltip.prototype.isFloating;


/** @inheritDoc */
anychart.core.ui.SeriesTooltip.prototype.disposeInternal = function() {
  if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
    anychart.core.utils.TooltipsContainer.getInstance().release(this);
  }
  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.SeriesTooltip.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['valuePrefix'] = this.valuePrefix();
  json['valuePostfix'] = this.valuePostfix();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();

  json['title'] = this.title().serialize();
  json['separator'] = this.separator().serialize();
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['hideDelay'] = this.hideDelay();

  // From Label (content)
  json['minFontSize'] = this.minFontSize();
  json['maxFontSize'] = this.maxFontSize();
  json['adjustFontSize'] = this.adjustFontSize();

  // From Text
  if (goog.isDef(this.fontSize())) json['fontSize'] = this.fontSize();
  if (goog.isDef(this.fontFamily())) json['fontFamily'] = this.fontFamily();
  if (goog.isDef(this.fontColor())) json['fontColor'] = this.fontColor();
  if (goog.isDef(this.fontOpacity())) json['fontOpacity'] = this.fontOpacity();
  if (goog.isDef(this.fontDecoration())) json['fontDecoration'] = this.fontDecoration();
  if (goog.isDef(this.fontStyle())) json['fontStyle'] = this.fontStyle();
  if (goog.isDef(this.fontVariant())) json['fontVariant'] = this.fontVariant();
  if (goog.isDef(this.fontWeight())) json['fontWeight'] = this.fontWeight();
  if (goog.isDef(this.letterSpacing())) json['letterSpacing'] = this.letterSpacing();
  if (goog.isDef(this.textDirection())) json['textDirection'] = this.textDirection();
  if (goog.isDef(this.lineHeight())) json['lineHeight'] = this.lineHeight();
  if (goog.isDef(this.textIndent())) json['textIndent'] = this.textIndent();
  if (goog.isDef(this.vAlign())) json['vAlign'] = this.vAlign();
  if (goog.isDef(this.hAlign())) json['hAlign'] = this.hAlign();
  if (goog.isDef(this.textWrap())) json['textWrap'] = this.textWrap();
  if (goog.isDef(this.textOverflow())) json['textOverflow'] = this.textOverflow();
  if (goog.isDef(this.selectable())) json['selectable'] = this.selectable();
  if (goog.isDef(this.disablePointerEvents())) json['disablePointerEvents'] = this.disablePointerEvents();
  if (goog.isDef(this.useHtml())) json['useHtml'] = this.useHtml();

  return json;
};


/** @inheritDoc */
anychart.core.ui.SeriesTooltip.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.titleFormatter(config['titleFormatter']);
  this.textFormatter(config['textFormatter'] || config['contentFormatter']);
  this.valuePrefix(config['valuePrefix']);
  this.valuePostfix(config['valuePostfix']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  if (goog.isDef(config['allowLeaveScreen'])) {
    this.allowLeaveScreenInternal(config['allowLeaveScreen']);
  }
  if (goog.isDef(config['isFloating'])) {
    this.isFloatingInternal(config['isFloating']);
  }

  this.title(config[anychart.opt.TITLE]);

  this.separator(config['separator']);
  this.contentInternal(config['content']);

  this.background(config[anychart.opt.BACKGROUND]);

  this.padding(config[anychart.opt.PADDING]);

  this.hideDelay(config['hideDelay']);

  this.minFontSize(config['minFontSize']);
  this.maxFontSize(config['maxFontSize']);
  this.adjustFontSize(config['adjustFontSize']);

  this.fontSize(config['fontSize']);
  this.fontFamily(config['fontFamily']);
  this.fontColor(config['fontColor']);
  this.fontOpacity(config['fontOpacity']);
  this.fontDecoration(config['fontDecoration']);
  this.fontStyle(config['fontStyle']);
  this.fontVariant(config['fontVariant']);
  this.fontWeight(config['fontWeight']);
  this.letterSpacing(config['letterSpacing']);
  this.textDirection(config['textDirection']);
  this.lineHeight(config['lineHeight']);
  this.textIndent(config['textIndent']);
  this.vAlign(config['vAlign']);
  this.hAlign(config['hAlign']);
  this.textWrap(config['textWrap']);
  this.textOverflow(config['textOverflow']);
  this.selectable(config['selectable']);
  this.disablePointerEvents(config['disablePointerEvents']);
  this.useHtml(config['useHtml']);
};


//exports
anychart.core.ui.SeriesTooltip.prototype['titleFormatter'] = anychart.core.ui.SeriesTooltip.prototype.titleFormatter;
anychart.core.ui.SeriesTooltip.prototype['textFormatter'] = anychart.core.ui.SeriesTooltip.prototype.textFormatter;
anychart.core.ui.SeriesTooltip.prototype['valuePrefix'] = anychart.core.ui.SeriesTooltip.prototype.valuePrefix;
anychart.core.ui.SeriesTooltip.prototype['valuePostfix'] = anychart.core.ui.SeriesTooltip.prototype.valuePostfix;

anychart.core.ui.SeriesTooltip.prototype['position'] = anychart.core.ui.SeriesTooltip.prototype.position;
anychart.core.ui.SeriesTooltip.prototype['anchor'] = anychart.core.ui.SeriesTooltip.prototype.anchor;
anychart.core.ui.SeriesTooltip.prototype['offsetX'] = anychart.core.ui.SeriesTooltip.prototype.offsetX;
anychart.core.ui.SeriesTooltip.prototype['offsetY'] = anychart.core.ui.SeriesTooltip.prototype.offsetY;

anychart.core.ui.SeriesTooltip.prototype['title'] = anychart.core.ui.SeriesTooltip.prototype.title;
anychart.core.ui.SeriesTooltip.prototype['separator'] = anychart.core.ui.SeriesTooltip.prototype.separator;
anychart.core.ui.SeriesTooltip.prototype['background'] = anychart.core.ui.SeriesTooltip.prototype.background;
anychart.core.ui.SeriesTooltip.prototype['padding'] = anychart.core.ui.SeriesTooltip.prototype.padding;
anychart.core.ui.SeriesTooltip.prototype['hide'] = anychart.core.ui.SeriesTooltip.prototype.hide;
anychart.core.ui.SeriesTooltip.prototype['hideDelay'] = anychart.core.ui.SeriesTooltip.prototype.hideDelay;

// text API
anychart.core.ui.SeriesTooltip.prototype['minFontSize'] = anychart.core.ui.SeriesTooltip.prototype.minFontSize;
anychart.core.ui.SeriesTooltip.prototype['maxFontSize'] = anychart.core.ui.SeriesTooltip.prototype.maxFontSize;
anychart.core.ui.SeriesTooltip.prototype['adjustFontSize'] = anychart.core.ui.SeriesTooltip.prototype.adjustFontSize;
anychart.core.ui.SeriesTooltip.prototype['fontSize'] = anychart.core.ui.SeriesTooltip.prototype.fontSize;
anychart.core.ui.SeriesTooltip.prototype['fontFamily'] = anychart.core.ui.SeriesTooltip.prototype.fontFamily;
anychart.core.ui.SeriesTooltip.prototype['fontColor'] = anychart.core.ui.SeriesTooltip.prototype.fontColor;
anychart.core.ui.SeriesTooltip.prototype['fontOpacity'] = anychart.core.ui.SeriesTooltip.prototype.fontOpacity;
anychart.core.ui.SeriesTooltip.prototype['fontDecoration'] = anychart.core.ui.SeriesTooltip.prototype.fontDecoration;
anychart.core.ui.SeriesTooltip.prototype['fontStyle'] = anychart.core.ui.SeriesTooltip.prototype.fontStyle;
anychart.core.ui.SeriesTooltip.prototype['fontVariant'] = anychart.core.ui.SeriesTooltip.prototype.fontVariant;
anychart.core.ui.SeriesTooltip.prototype['fontWeight'] = anychart.core.ui.SeriesTooltip.prototype.fontWeight;
anychart.core.ui.SeriesTooltip.prototype['letterSpacing'] = anychart.core.ui.SeriesTooltip.prototype.letterSpacing;
anychart.core.ui.SeriesTooltip.prototype['textDirection'] = anychart.core.ui.SeriesTooltip.prototype.textDirection;
anychart.core.ui.SeriesTooltip.prototype['lineHeight'] = anychart.core.ui.SeriesTooltip.prototype.lineHeight;
anychart.core.ui.SeriesTooltip.prototype['textIndent'] = anychart.core.ui.SeriesTooltip.prototype.textIndent;
anychart.core.ui.SeriesTooltip.prototype['vAlign'] = anychart.core.ui.SeriesTooltip.prototype.vAlign;
anychart.core.ui.SeriesTooltip.prototype['hAlign'] = anychart.core.ui.SeriesTooltip.prototype.hAlign;
anychart.core.ui.SeriesTooltip.prototype['textWrap'] = anychart.core.ui.SeriesTooltip.prototype.textWrap;
anychart.core.ui.SeriesTooltip.prototype['textOverflow'] = anychart.core.ui.SeriesTooltip.prototype.textOverflow;
anychart.core.ui.SeriesTooltip.prototype['selectable'] = anychart.core.ui.SeriesTooltip.prototype.selectable;
anychart.core.ui.SeriesTooltip.prototype['disablePointerEvents'] = anychart.core.ui.SeriesTooltip.prototype.disablePointerEvents;
anychart.core.ui.SeriesTooltip.prototype['useHtml'] = anychart.core.ui.SeriesTooltip.prototype.useHtml;
anychart.core.ui.SeriesTooltip.prototype['textSettings'] = anychart.core.ui.SeriesTooltip.prototype.textSettings;

// Deprecated
anychart.core.ui.SeriesTooltip.prototype['contentFormatter'] = anychart.core.ui.SeriesTooltip.prototype.contentFormatter;
anychart.core.ui.SeriesTooltip.prototype['content'] = anychart.core.ui.SeriesTooltip.prototype.content;
anychart.core.ui.SeriesTooltip.prototype['allowLeaveScreen'] = anychart.core.ui.SeriesTooltip.prototype.allowLeaveScreen;
anychart.core.ui.SeriesTooltip.prototype['isFloating'] = anychart.core.ui.SeriesTooltip.prototype.isFloating;
