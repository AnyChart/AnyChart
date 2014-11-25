goog.provide('anychart.core.ui.Tooltip');
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.TooltipItem');
goog.require('anychart.core.utils.TooltipsContainer');
goog.require('anychart.enums');



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
   * @type {Function}
   * @private
   */
  this.titleFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * @type {Function}
   * @private
   */
  this.contentFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * @type {boolean}
   * @private
   */
  this.allowLeaveScreen_ = false;

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
 * @param {Function=} opt_value Function to format title text.
 * @return {Function|anychart.core.ui.Tooltip} Function to format title text or itself for method chaining.
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
 * @param {Function=} opt_value Function to format content text.
 * @return {Function|anychart.core.ui.Tooltip} Function to format content text or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.contentFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.contentFormatter_ != opt_value) {
      this.contentFormatter_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.contentFormatter_;
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
      this.allowLeaveScreen_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.allowLeaveScreen_;
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
 * @param {(anychart.core.ui.Title|Object|string|null)=} opt_value Tooltip settings.
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
 * @param {(anychart.core.ui.Separator|Object|string|null)=} opt_value Tooltip separator settings.
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
 * @param {(anychart.core.ui.Label|Object|string|null)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.Tooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.content = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.content(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Label}*/ (this.item_.content());
  }
};


/**
 * Tooltip background.
 * @param {(anychart.core.ui.Background|Object|string|null)=} opt_value Tooltip background settings.
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
 * @param {(anychart.core.utils.Padding|Object|string|null)=} opt_value Tooltip padding settings.
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.Tooltip)} Padding instance or itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.padding = function(opt_value) {
  this.maybeCreateTooltipItem_();
  if (goog.isDef(opt_value)) {
    this.item_.padding(opt_value);
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
    this.item_ = anychart.core.utils.TooltipsContainer.getInstance().alloc();
    this.item_.suspendSignalsDispatching();
    this.item_.visible(false);
    this.registerDisposable(this.item_);
    this.item_.resumeSignalsDispatching(true);
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

  var titleText = this.titleFormatter_.call(textInfo, textInfo);
  var contentText = this.contentFormatter_.call(textInfo, textInfo);

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
 * Show tooltip using textInfo and position info objects.
 * @return {!anychart.core.ui.Tooltip} Itself for method chaining.
 */
anychart.core.ui.Tooltip.prototype.hide = function() {
  if (this.item_ && this.item_.visible()) {
    this.item_.suspendSignalsDispatching();
    this.item_.visible(false);
    this.item_.draw();
    this.item_.resumeSignalsDispatching(false);
  }
  return this;
};


/**
 * Redraw tooltip item and apply all new settings.
 */
anychart.core.ui.Tooltip.prototype.redraw = function() {
  if (this.item_ && this.item_.visible() && this.item_.enabled()) {
    this.item_.suspendSignalsDispatching();
    var titleText = this.titleFormatter_.call(this.textInfoCache_, this.textInfoCache_);
    var contentText = this.contentFormatter_.call(this.textInfoCache_, this.textInfoCache_);
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
  if (this.allowLeaveScreen_) {
    return position;
  } else {
    //we need this to get actual pixel bounds
    this.item_.x(position.x);
    this.item_.y(position.y);
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

    return position;
  }
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.disposeInternal = function() {
  anychart.core.utils.TooltipsContainer.getInstance().release(this.item_);
  goog.base(this, 'disposeInternal');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.serialize = function() {
  this.maybeCreateTooltipItem_();
  var json = goog.base(this, 'serialize');
  var itemJson = this.item_.serialize();
  goog.object.extend(json, itemJson);

  json['allowLeaveScreen'] = this.allowLeaveScreen();
  json['isFloating'] = this.isFloating();
  json['content'] = this.content().serialize();
  json['title'] = this.title().serialize();

  if (goog.isFunction(this.titleFormatter_)) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Tooltip titleFormatter']
    );
  }

  if (goog.isFunction(this.contentFormatter_)) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Tooltip contentFormatter']
    );
  }
  return json;
};


/** @inheritDoc */
anychart.core.ui.Tooltip.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.maybeCreateTooltipItem_();
  this.item_.deserialize(config);
  this.contentFormatter_ = config['contentFormatter'] || this.contentFormatter_;
  this.titleFormatter_ = config['titleFormatter'] || this.titleFormatter_;
  this.isFloating(config['isFloating']);
  this.allowLeaveScreen(config['allowLeaveScreen']);

  this.resumeSignalsDispatching(true);

  return this;
};


//exports
anychart.core.ui.Tooltip.prototype['titleFormatter'] = anychart.core.ui.Tooltip.prototype.titleFormatter;
anychart.core.ui.Tooltip.prototype['contentFormatter'] = anychart.core.ui.Tooltip.prototype.contentFormatter;
anychart.core.ui.Tooltip.prototype['allowLeaveScreen'] = anychart.core.ui.Tooltip.prototype.allowLeaveScreen;
anychart.core.ui.Tooltip.prototype['isFloating'] = anychart.core.ui.Tooltip.prototype.isFloating;
anychart.core.ui.Tooltip.prototype['title'] = anychart.core.ui.Tooltip.prototype.title;
anychart.core.ui.Tooltip.prototype['separator'] = anychart.core.ui.Tooltip.prototype.separator;
anychart.core.ui.Tooltip.prototype['content'] = anychart.core.ui.Tooltip.prototype.content;
anychart.core.ui.Tooltip.prototype['background'] = anychart.core.ui.Tooltip.prototype.background;
anychart.core.ui.Tooltip.prototype['padding'] = anychart.core.ui.Tooltip.prototype.padding;
anychart.core.ui.Tooltip.prototype['offsetX'] = anychart.core.ui.Tooltip.prototype.offsetX;
anychart.core.ui.Tooltip.prototype['offsetY'] = anychart.core.ui.Tooltip.prototype.offsetY;
anychart.core.ui.Tooltip.prototype['anchor'] = anychart.core.ui.Tooltip.prototype.anchor;
anychart.core.ui.Tooltip.prototype['hideDelay'] = anychart.core.ui.Tooltip.prototype.hideDelay;
anychart.core.ui.Tooltip.prototype['show'] = anychart.core.ui.Tooltip.prototype.show;
anychart.core.ui.Tooltip.prototype['hide'] = anychart.core.ui.Tooltip.prototype.hide;
anychart.core.ui.Tooltip.prototype['redraw'] = anychart.core.ui.Tooltip.prototype.redraw;
anychart.core.ui.Tooltip.prototype['enabled'] = anychart.core.ui.Tooltip.prototype.enabled;
