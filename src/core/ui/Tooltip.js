goog.provide('anychart.core.ui.Tooltip');
goog.require('anychart.compatibility');
goog.require('anychart.core.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.TooltipItem');
goog.require('anychart.core.utils.TooltipsContainer');
goog.require('anychart.enums');
goog.require('goog.dom');
goog.require('goog.userAgent');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.Tooltip = function() {
  goog.base(this);

  /**
   * @type {anychart.core.ui.TooltipItem}
   * @private
   */
  this.item_ = null;

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
   * @type {boolean}
   * @private
   */
  this.allowLeaveScreen_;

  /**
   * @type {boolean}
   * @private
   */
  this.float_ = true;

  /**
   * Used to redraw tooltip without passing any params.
   * @type {Object}
   * @private
   */
  this.textInfoCache_ = null;

  /**
   * Used to redraw tooltip without passing any params.
   * @type {acgraph.math.Coordinate}
   * @private
   */
  this.positionCache_ = null;

  /**
   * @type {string}
   * @private
   */
  this.valuePrefix_;

  /**
   * @type {string}
   * @private
   */
  this.valuePostfix_;
};
goog.inherits(anychart.core.ui.Tooltip, anychart.core.Base);


/**
 * Supported signals. On NEEDS_REDRAW signal you just need to call redraw method,
 * on BOUNDS_CHANGED method you need to recalculate position and textInfo and call show method.
 * @type {number}
 */
anychart.core.ui.Tooltip.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip own settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Function to format title text.
 * @param {(Function|string)=} opt_value Function to format title text.
 * @return {Function|string|anychart.core.ui.Tooltip} Function to format title text or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.titleFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleFormatter_ != opt_value) {
      this.titleFormatter_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.titleFormatter_;
  }
};


/**
 * Function to format content text.
 * @param {(Function|string)=} opt_value Function to format content text.
 * @return {Function|string|anychart.core.ui.Tooltip} Function to format content text or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.textFormatter_ != opt_value) {
      this.textFormatter_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.textFormatter_;
  }
};


/**
 * Function to format content text.
 * @param {Function=} opt_value Function to format content text.
 * @return {Function|anychart.core.ui.Tooltip} Function to format content text or itself for method chaining.
 * @deprecated It shouldn't be used ever.
 */
anychart.core.ui.Tooltip.prototype.contentFormatter = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.contentFormatter()', '.textFormatter()'], true);
  return /** @type {Function} */ (this.textFormatter(opt_value));
};


/**
 * Gets/Sets value prefix.
 * @param {string=} opt_value
 * @return {string|anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.valuePrefix = function(opt_value) {
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
 * @return {string|anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.valuePostfix = function(opt_value) {
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
 * Allow tooltip to leave screen when moving.
 * @param {boolean=} opt_value Allow tooltip to leave screen when moving.
 * @return {!(boolean|anychart.core.ui.Tooltip)} Allow tooltip to leave screen when moving or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.allowLeaveScreen = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.allowLeaveScreen_ != opt_value) {
      this.allowLeaveScreen_ = anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && this.allowLeaveScreen_;
  }
};


/**
 * Defines whether tooltip follows the mouse or not.
 * @param {boolean=} opt_value Follow the mouse or not.
 * @return {!(boolean|anychart.core.ui.Tooltip)} Follow the mouse or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.isFloating = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.float_ != opt_value) {
      this.float_ = opt_value;
      this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.float_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Settings delegated to TooltipItem
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tooltip title.
 * @param {(null|boolean|Object|string)=} opt_value Tooltip settings.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Tooltip)} Title instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.title = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.title(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Title}*/ (this.item_.title());
  }
};


/**
 * Tooltip title separator.
 * @param {(Object|boolean|null)=} opt_value Tooltip separator settings.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.Tooltip)} Separator instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.separator = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.separator(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Separator}*/ (this.item_.separator());
  }
};


/**
 * Tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.Tooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.contentInternal = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.content(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Label}*/ (this.item_.content());
  }
};


/**
 * Tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.Tooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.content = anychart.core.ui.Tooltip.prototype.contentInternal;


/**
 * Tooltip background.
 * @param {(string|Object|null|boolean)=} opt_value Tooltip background settings.
 * @return {!(anychart.core.ui.Background|anychart.core.ui.Tooltip)} Background instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.background = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.background(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Background}*/ (this.item_.background());
  }
};


/**
 * Tooltip padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Tooltip padding settings.
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.Tooltip)} Padding instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.padding = function(opt_value) {
  this.maybeCreateTooltipItem_();
  if (goog.isDef(opt_value)) {
    this.item_.padding.apply(this.item_, arguments);
    return this;
  } else {
    return /** @type {!anychart.core.utils.Padding}*/ (this.item_.padding());
  }
};


/**
 * Offset by X of tooltip position.
 * @param {number=} opt_value New value of X offset of tooltip position.
 * @return {!(number|anychart.core.ui.Tooltip)} X offset of tooltip position of itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.offsetX = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.offsetX(opt_value);
    return this;
  } else {
    return /** @type {number}*/ (this.item_.offsetX());
  }
};


/**
 * Y offset of tooltip position.
 * @param {number=} opt_value New value of Y offset of tooltip position.
 * @return {!(number|anychart.core.ui.Tooltip)} Y offset of tooltip position of itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.offsetY = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.offsetY(opt_value);
    return this;
  } else {
    return /** @type {number}*/ (this.item_.offsetY());
  }
};


/**
 * Gets or sets Tooltip anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Tooltip anchor settings.
 * @return {!(anychart.core.ui.Tooltip|anychart.enums.Anchor)} Tooltip anchor settings or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.anchor = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.anchor(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.Anchor}*/ (this.item_.anchor());
  }
};


/**
 * Sets/gets delay in milliseconds before tooltip becomes invisible on visible(false) call.
 * @param {number=} opt_value Delay in milliseconds before tooltip becomes invisible on visible(false) call.
 * @return {!(number|anychart.core.ui.Tooltip)} delay in milliseconds before tooltip becomes invisible on visible(false) call or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.hideDelay = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.hideDelay(opt_value);
    return this;
  } else {
    return /** @type {number}*/ (this.item_.hideDelay());
  }
};


/**
 * Enabled for tooltip.
 * @param {boolean=} opt_value
 * @return {anychart.core.ui.Tooltip|boolean}
 */
anychart.core.ui.Tooltip.prototype.enabled = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.enabled(opt_value);
    return this;
  } else {
    return /** @type {boolean} */(this.item_.enabled());
  }
};


/**
 * Create tooltip item if it is not created yet.
 * @private
 */
anychart.core.ui.Tooltip.prototype.maybeCreateTooltipItem_ = function() {
  if (!this.item_) {
    this.item_ = new anychart.core.ui.TooltipItem();
    this.item_.visible(false);
    this.registerDisposable(this.item_);
  }
};


/**
 * Get/set container to tooltip.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value
 * @return {acgraph.vector.ILayer|anychart.core.ui.Tooltip}
 */
anychart.core.ui.Tooltip.prototype.container = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
      anychart.core.utils.TooltipsContainer.getInstance().allocTooltip(this.item_);
    } else {
      this.item_.container(opt_value);
    }
    return this;
  } else {
    return /** @type {acgraph.vector.ILayer} */(this.item_.container());
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Show tooltip using textInfo and position info objects.
 * @param {Object} textInfo Object with info about series and charts to format title and content text.
 * @param {acgraph.math.Coordinate} position Position of a tooltip.
 * @return {!anychart.core.ui.Tooltip} Itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.show = function(textInfo, position) {
  this.maybeCreateTooltipItem_();

  this.textInfoCache_ = textInfo;
  this.positionCache_ = position;

  this.textInfoCache_['valuePrefix'] = this.valuePrefix_ ? this.valuePrefix_ : '';
  this.textInfoCache_['valuePostfix'] = this.valuePostfix_ ? this.valuePostfix_ : '';

  var formatter = this.titleFormatter_;
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
  var titleText = formatter.call(textInfo, textInfo);

  formatter = this.textFormatter_;
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
  var contentText = formatter.call(textInfo, textInfo);

  this.item_.suspendSignalsDispatching();
  this.item_.content().text(contentText);
  this.item_.title().text(titleText);

  var realPosition = this.processPosition_(position);

  this.item_.x(realPosition.x);
  this.item_.y(realPosition.y);
  this.item_.visible(true);
  this.item_.draw();
  this.item_.resumeSignalsDispatching(false);

  return this;
};


/**
 * Hide tooltip.
 * @param {boolean=} opt_force Ignore tooltips hide delay.
 * @return {!anychart.core.ui.Tooltip} Itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.hide = function(opt_force) {
  this.item_.hide(opt_force);
  return this;
};


/**
 * Redraw tooltip item and apply all new settings.
 */
anychart.core.ui.Tooltip.prototype.redraw = function() {
  if (this.item_ && this.item_.visible() && this.item_.enabled()) {
    this.item_.suspendSignalsDispatching();

    var formatter = this.titleFormatter_;
    if (goog.isString(formatter))
      formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
    var titleText = formatter.call(this.textInfoCache_, this.textInfoCache_);

    formatter = this.textFormatter_;
    if (goog.isString(formatter))
      formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
    var contentText = formatter.call(this.textInfoCache_, this.textInfoCache_);

    var realPosition = this.processPosition_(this.positionCache_);

    this.item_.x(realPosition.x);
    this.item_.y(realPosition.y);
    this.item_.title().text(titleText);
    this.item_.content().text(contentText);
    this.item_.draw();
    this.item_.resumeSignalsDispatching(false);
  }
};


/**
 * @private
 * @param {acgraph.math.Coordinate} position Tooltip estimated position.
 * @return {acgraph.math.Coordinate} Processed tooltip position.
 */
anychart.core.ui.Tooltip.prototype.processPosition_ = function(position) {
  if (this.allowLeaveScreen()) {
    return position;

  } else {
    var chartOffset = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
    if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
      // we need this to get actual pixel bounds
      this.item_.x(position.x);
      this.item_.y(position.y);
    } else {
      this.item_.x(position.x - chartOffset.x);
      this.item_.y(position.y - chartOffset.y);

      position.x -= chartOffset.x;
      position.y -= chartOffset.y;
    }

    var pixelBounds = this.item_.getPixelBounds();
    var windowBox = goog.dom.getViewportSize(goog.dom.getWindow());

    if (pixelBounds.left < 0) {
      position.x -= pixelBounds.left;
    }

    if (pixelBounds.top < 0) {
      position.y -= pixelBounds.top;
    }

    if (pixelBounds.getRight() > windowBox.width) {
      position.x -= pixelBounds.getRight() - windowBox.width;
    }

    if (pixelBounds.getBottom() > windowBox.height) {
      position.y -= pixelBounds.getBottom() - windowBox.height;
    }

    var document = goog.dom.getDocument();
    if (goog.userAgent.IE && (!goog.userAgent.isVersionOrHigher('7') || document.documentMode && document.documentMode <= 6)) {
      var html = document.documentElement;
      var body = document.body;

      var scrollTop = html.scrollTop || body && body.scrollTop || 0;
      scrollTop -= html.clientTop;
      var scrollLeft = html.scrollLeft || body && body.scrollLeft || 0;
      scrollLeft -= html.clientLeft;

      position.x += scrollLeft;
      position.y += scrollTop;
    }

    return position;
  }
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.disposeInternal = function() {
  if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
    anychart.core.utils.TooltipsContainer.getInstance().release(this.item_);
  }
  goog.base(this, 'disposeInternal');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (this.valuePrefix_)
    json['valuePrefix'] = this.valuePrefix();
  if (this.valuePostfix_)
    json['valuePostfix'] = this.valuePostfix();

  json['title'] = this.title().serialize();
  json['separator'] = this.separator().serialize();
  json['content'] = this.contentInternal().serialize();
  json['background'] = this.background().serialize();

  var padding = this.padding().serialize();
  if (!padding['left']) delete padding['left'];
  if (!padding['top']) delete padding['top'];
  if (!padding['right']) delete padding['right'];
  if (!padding['bottom']) delete padding['bottom'];
  if (!goog.object.isEmpty(padding)) json['padding'] = padding;

  if (goog.isDef(this.allowLeaveScreen_))
    json['allowLeaveScreen'] = this.allowLeaveScreen_;

  if (this.offsetX())
    json['offsetX'] = this.offsetX();
  if (this.offsetY())
    json['offsetY'] = this.offsetY();

  if (this.anchor())
    json['anchor'] = this.anchor();

  if (goog.isDef(this.hideDelay()))
    json['hideDelay'] = this.hideDelay();

  json['enabled'] = this.enabled();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.valuePrefix(config['valuePrefix']);
  this.valuePostfix(config['valuePostfix']);
  this.allowLeaveScreen(config['allowLeaveScreen']);
  this.title(config['title']);
  this.separator(config['separator']);
  this.contentInternal(config['content']);
  this.background(config['background']);
  this.padding(config['padding']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.anchor(config['anchor']);
  this.hideDelay(config['hideDelay']);
  this.enabled('enabled' in config ? config['enabled'] : true);
  this.titleFormatter(config['titleFormatter']);
  this.textFormatter(config['textFormatter'] || config['contentFormatter']);
};


//exports
anychart.core.ui.Tooltip.prototype['valuePrefix'] = anychart.core.ui.Tooltip.prototype.valuePrefix;
anychart.core.ui.Tooltip.prototype['valuePostfix'] = anychart.core.ui.Tooltip.prototype.valuePostfix;
anychart.core.ui.Tooltip.prototype['titleFormatter'] = anychart.core.ui.Tooltip.prototype.titleFormatter;
anychart.core.ui.Tooltip.prototype['textFormatter'] = anychart.core.ui.Tooltip.prototype.textFormatter;
anychart.core.ui.Tooltip.prototype['contentFormatter'] = anychart.core.ui.Tooltip.prototype.contentFormatter;
anychart.core.ui.Tooltip.prototype['isFloating'] = anychart.core.ui.Tooltip.prototype.isFloating;
anychart.core.ui.Tooltip.prototype['allowLeaveScreen'] = anychart.core.ui.Tooltip.prototype.allowLeaveScreen;
anychart.core.ui.Tooltip.prototype['title'] = anychart.core.ui.Tooltip.prototype.title;
anychart.core.ui.Tooltip.prototype['separator'] = anychart.core.ui.Tooltip.prototype.separator;
anychart.core.ui.Tooltip.prototype['content'] = anychart.core.ui.Tooltip.prototype.content;
anychart.core.ui.Tooltip.prototype['background'] = anychart.core.ui.Tooltip.prototype.background;
anychart.core.ui.Tooltip.prototype['padding'] = anychart.core.ui.Tooltip.prototype.padding;
anychart.core.ui.Tooltip.prototype['offsetX'] = anychart.core.ui.Tooltip.prototype.offsetX;
anychart.core.ui.Tooltip.prototype['offsetY'] = anychart.core.ui.Tooltip.prototype.offsetY;
anychart.core.ui.Tooltip.prototype['anchor'] = anychart.core.ui.Tooltip.prototype.anchor;
anychart.core.ui.Tooltip.prototype['hide'] = anychart.core.ui.Tooltip.prototype.hide;
anychart.core.ui.Tooltip.prototype['hideDelay'] = anychart.core.ui.Tooltip.prototype.hideDelay;
anychart.core.ui.Tooltip.prototype['enabled'] = anychart.core.ui.Tooltip.prototype.enabled;
