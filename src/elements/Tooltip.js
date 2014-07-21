goog.provide('anychart.elements.Tooltip');
goog.require('anychart.Base');
goog.require('anychart.elements.TooltipItem');
goog.require('anychart.utils.TooltipsContainer');



/**
 * @constructor
 * @extends {anychart.Base}
 */
anychart.elements.Tooltip = function() {
  goog.base(this);

  /**
   * @type {anychart.elements.TooltipItem}
   * @private
   */
  this.item_ = null;

  /**
   * @type {Function}
   * @private
   */
  this.titleFormatter_ = null;

  /**
   * @type {Function}
   * @private
   */
  this.textFormatter_ = null;

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

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Tooltip, anychart.Base);


/**
 * Supported signals. On NEEDS_REDRAW signal you just need to call redraw method,
 * on BOUNDS_CHANGED method you need to recalculate position and textInfo and call show method.
 * @type {number}
 */
anychart.elements.Tooltip.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip own settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Function to format title text.
 * @param {Function=} opt_value Function to format title text.
 * @return {Function|anychart.elements.Tooltip} Function to format title text or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.titleFormatter = function(opt_value) {
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
 * @return {Function|anychart.elements.Tooltip} Function to format content text or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.textFormatter = function(opt_value) {
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
 * Allow tooltip to leave screen when moving.
 * @param {boolean=} opt_value Allow tooltip to leave screen when moving.
 * @return {!(boolean|anychart.elements.Tooltip)} Allow tooltip to leave screen when moving or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.allowLeaveScreen = function(opt_value) {
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
 * @return {!(boolean|anychart.elements.Tooltip)} Follow the mouse or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.isFloating = function(opt_value) {
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
 * @param {(anychart.elements.Title|Object|string|null)=} opt_value Tooltip settings.
 * @return {!(anychart.elements.Title|anychart.elements.Tooltip)} Title instance or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.title = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.title(opt_value);
    return this;
  } else {
    return /** @type {!anychart.elements.Title}*/ (this.item_.title());
  }
};


/**
 * Tooltip title separator.
 * @param {(anychart.elements.Separator|Object|string|null)=} opt_value Tooltip separator settings.
 * @return {!(anychart.elements.Separator|anychart.elements.Tooltip)} Separator instance or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.separator = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.separator(opt_value);
    return this;
  } else {
    return /** @type {!anychart.elements.Separator}*/ (this.item_.separator());
  }
};


/**
 * Tooltip content.
 * @param {(anychart.elements.Label|Object|string|null)=} opt_value Content settings.
 * @return {!(anychart.elements.Label|anychart.elements.Tooltip)} Labels instance or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.content = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.content(opt_value);
    return this;
  } else {
    return /** @type {!anychart.elements.Label}*/ (this.item_.content());
  }
};


/**
 * Tooltip background.
 * @param {(anychart.elements.Background|Object|string|null)=} opt_value Tooltip background settings.
 * @return {!(anychart.elements.Background|anychart.elements.Tooltip)} Background instance or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.background = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.background(opt_value);
    return this;
  } else {
    return /** @type {!anychart.elements.Background}*/ (this.item_.background());
  }
};


/**
 * Tooltip padding.
 * @param {(anychart.utils.Padding|Object|string|null)=} opt_value Tooltip padding settings.
 * @return {!(anychart.utils.Padding|anychart.elements.Tooltip)} Padding instance or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.padding = function(opt_value) {
  this.maybeCreateTooltipItem_();
  if (goog.isDef(opt_value)) {
    this.item_.padding(opt_value);
    return this;
  } else {
    return /** @type {!anychart.utils.Padding}*/ (this.item_.padding());
  }
};


/**
 * Offset by X of tooltip position.
 * @param {number=} opt_value New value of X offset of tooltip position.
 * @return {!(number|anychart.elements.Tooltip)} X offset of tooltip position of itself for method chaining.
 */
anychart.elements.Tooltip.prototype.offsetX = function(opt_value) {
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
 * @return {!(number|anychart.elements.Tooltip)} Y offset of tooltip position of itself for method chaining.
 */
anychart.elements.Tooltip.prototype.offsetY = function(opt_value) {
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
 * @param {(anychart.utils.NinePositions|string)=} opt_value Tooltip anchor settings.
 * @return {!(anychart.elements.Tooltip|anychart.utils.NinePositions)} Tooltip anchor settings or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.anchor = function(opt_value) {
  this.maybeCreateTooltipItem_();

  if (goog.isDef(opt_value)) {
    this.item_.anchor(opt_value);
    return this;
  } else {
    return /** @type {anychart.utils.NinePositions}*/ (this.item_.anchor());
  }
};


/**
 * Sets/gets delay in milliseconds before tooltip becomes invisible on visible(false) call.
 * @param {number=} opt_value Delay in milliseconds before tooltip becomes invisible on visible(false) call.
 * @return {!(number|anychart.elements.Tooltip)} delay in milliseconds before tooltip becomes invisible on visible(false) call or itself for method chaining.
 */
anychart.elements.Tooltip.prototype.hideDelay = function(opt_value) {
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
 * @return {anychart.elements.Tooltip|boolean}
 */
anychart.elements.Tooltip.prototype.enabled = function(opt_value) {
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
anychart.elements.Tooltip.prototype.maybeCreateTooltipItem_ = function() {
  if (!this.item_) {
    this.item_ = anychart.utils.TooltipsContainer.getInstance().alloc();
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
 * @return {!anychart.elements.Tooltip} Itself for method chaining.
 */
anychart.elements.Tooltip.prototype.show = function(textInfo, position) {
  this.maybeCreateTooltipItem_();

  this.textInfoCache_ = textInfo;
  this.positionCache_ = position;

  var titleText = this.titleFormatter_.call(textInfo);
  var contentText = this.textFormatter_.call(textInfo);
  var realPosition = this.processPosition_(position);

  this.item_.suspendSignalsDispatching();
  this.item_.x(realPosition.x);
  this.item_.y(realPosition.y);
  this.item_.title().text(titleText);
  this.item_.content().text(contentText);
  this.item_.visible(true);
  this.item_.draw();
  this.item_.resumeSignalsDispatching(false);

  return this;
};


/**
 * Show tooltip using textInfo and position info objects.
 * @return {!anychart.elements.Tooltip} Itself for method chaining.
 */
anychart.elements.Tooltip.prototype.hide = function() {
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
anychart.elements.Tooltip.prototype.redraw = function() {
  if (this.item_ && this.item_.visible() && this.item_.enabled()) {
    this.item_.suspendSignalsDispatching();
    var titleText = this.titleFormatter_.call(this.textInfoCache_);
    var contentText = this.textFormatter_.call(this.textInfoCache_);
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
anychart.elements.Tooltip.prototype.processPosition_ = function(position) {
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
anychart.elements.Tooltip.prototype.disposeInternal = function() {
  anychart.utils.TooltipsContainer.getInstance().release(this.item_);
  goog.base(this, 'disposeInternal');
};


/**
 * Restore title default settings.
 */
anychart.elements.Tooltip.prototype.restoreDefaults = function() {
  this.titleFormatter_ = function() {
    return this['titleText'];
  };
  this.textFormatter_ = function() {
    return this['contentText'];
  };
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Tooltip.prototype.serialize = function() {
  this.maybeCreateTooltipItem_();
  var json = goog.base(this, 'serialize');
  var itemJson = this.item_.serialize();
  goog.object.extend(json, itemJson);

  json['allowLeaveScreen'] = this.allowLeaveScreen();
  json['isFloating'] = this.isFloating();
  json['content'] = this.content().serialize();
  json['title'] = this.title().serialize();

  if (goog.isFunction(this.titleFormatter_)) {
    if (window.console) {
      window.console.log('Warning: We can not serialize titleFormatter function, please reset it manually.');
    }
  }

  if (goog.isFunction(this.textFormatter_)) {
    if (window.console) {
      window.console.log('Warning: We can not serialize textFormatter function, please reset it manually.');
    }
  }
  return json;
};


/** @inheritDoc */
anychart.elements.Tooltip.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.maybeCreateTooltipItem_();
  this.item_.deserialize(config);
  this.textFormatter_ = config['textFormatter'] || this.textFormatter_;
  this.titleFormatter_ = config['titleFormatter'] || this.titleFormatter_;
  this.isFloating(config['isFloating']);
  this.allowLeaveScreen(config['allowLeaveScreen']);

  this.resumeSignalsDispatching(true);

  return this;
};


//exports
goog.exportSymbol('anychart.elements.Tooltip', anychart.elements.Tooltip);
anychart.elements.Tooltip.prototype['titleFormatter'] = anychart.elements.Tooltip.prototype.titleFormatter;
anychart.elements.Tooltip.prototype['textFormatter'] = anychart.elements.Tooltip.prototype.textFormatter;
anychart.elements.Tooltip.prototype['allowLeaveScreen'] = anychart.elements.Tooltip.prototype.allowLeaveScreen;
anychart.elements.Tooltip.prototype['isFloating'] = anychart.elements.Tooltip.prototype.isFloating;
anychart.elements.Tooltip.prototype['title'] = anychart.elements.Tooltip.prototype.title;
anychart.elements.Tooltip.prototype['separator'] = anychart.elements.Tooltip.prototype.separator;
anychart.elements.Tooltip.prototype['content'] = anychart.elements.Tooltip.prototype.content;
anychart.elements.Tooltip.prototype['background'] = anychart.elements.Tooltip.prototype.background;
anychart.elements.Tooltip.prototype['padding'] = anychart.elements.Tooltip.prototype.padding;
anychart.elements.Tooltip.prototype['offsetX'] = anychart.elements.Tooltip.prototype.offsetX;
anychart.elements.Tooltip.prototype['offsetY'] = anychart.elements.Tooltip.prototype.offsetY;
anychart.elements.Tooltip.prototype['anchor'] = anychart.elements.Tooltip.prototype.anchor;
anychart.elements.Tooltip.prototype['hideDelay'] = anychart.elements.Tooltip.prototype.hideDelay;
anychart.elements.Tooltip.prototype['show'] = anychart.elements.Tooltip.prototype.show;
anychart.elements.Tooltip.prototype['hide'] = anychart.elements.Tooltip.prototype.hide;
anychart.elements.Tooltip.prototype['redraw'] = anychart.elements.Tooltip.prototype.redraw;
anychart.elements.Tooltip.prototype['enabled'] = anychart.elements.Tooltip.prototype.enabled;
