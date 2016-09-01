goog.provide('anychart.core.ui.ChartTooltip');
goog.require('anychart.compatibility');
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.SeriesTooltip');
goog.require('anychart.core.utils.GenericContextProvider');



/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.ChartTooltip = function() {
  goog.base(this);

  this.unionTooltip_ = null;
  this.singleTooltip_ = null;
  this.separatedTooltips_ = [];

  /**
   * @type {anychart.enums.TooltipDisplayMode}
   * @private
   */
  this.displayMode_ = anychart.enums.TooltipDisplayMode.SINGLE;

  /**
   * @type {anychart.enums.TooltipPositionMode}
   * @private
   */
  this.positionMode_ = anychart.enums.TooltipPositionMode.FLOAT;

  /**
   * @type {boolean}
   * @private
   */
  this.allowLeaveChart_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.allowLeaveScreen_ = false;

  /**
   * @type {!Object.<!string, !anychart.core.ui.SeriesTooltip>}
   * @private
   */
  this.tooltipsMap_ = {};


  this.unionTooltip_ = new anychart.core.ui.SeriesTooltip();
  this.registerDisposable(this.unionTooltip_);
};
goog.inherits(anychart.core.ui.ChartTooltip, anychart.core.Base);


/**
 *
 * @param {anychart.core.Chart=} opt_value
 * @return {anychart.core.Chart|anychart.core.ui.ChartTooltip}
 */
anychart.core.ui.ChartTooltip.prototype.chart = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.chart_ = opt_value;
    return this;
  } else {
    return this.chart_;
  }
};


/**
 * Function to format title for union tooltip.
 * @param {Function=} opt_value Function to format title text.
 * @return {Function|anychart.core.ui.ChartTooltip} Function to format title text or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.titleFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.unionTooltip_.titleFormatter() != opt_value) {
      this.unionTooltip_.titleFormatter(opt_value);
    }
    return this;
  } else {
    return /** @type {Function} */(this.unionTooltip_.titleFormatter());
  }
};


/**
 * Function to format content text for union tooltip.
 * @param {Function=} opt_value Function to format content text.
 * @return {Function|anychart.core.ui.ChartTooltip} Function to format content text or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.unionTooltip_.textFormatter() != opt_value) {
      this.unionTooltip_.textFormatter(opt_value);
    }
    return this;
  } else {
    return /** @type {Function} */(this.unionTooltip_.textFormatter());
  }
};


/**
 * Display mode for tooltip.
 * @param {(anychart.enums.TooltipDisplayMode|string)=} opt_value
 * @return {!(anychart.enums.TooltipDisplayMode|anychart.core.ui.ChartTooltip)}
 */
anychart.core.ui.ChartTooltip.prototype.displayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var displayMode = anychart.enums.normalizeTooltipDisplayMode(opt_value);
    if (displayMode != this.displayMode_) {
      this.displayMode_ = displayMode;
    }
    return this;
  }
  return this.displayMode_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for union tooltip position.
 * @param {(anychart.enums.Position|string)=} opt_value
 * @return {anychart.enums.Position|anychart.core.ui.ChartTooltip}
 */
anychart.core.ui.ChartTooltip.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.position(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.Position} */(this.unionTooltip_.position());
  }
};


/**
 * Gets or sets union tooltip anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value union tooltip anchor settings.
 * @return {anychart.enums.Anchor|anychart.core.ui.ChartTooltip} union tooltip anchor settings or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.anchor(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.Anchor} */(this.unionTooltip_.anchor());
  }
};


/**
 * Offset by X of union tooltip position.
 * @param {number=} opt_value New value of X offset of union tooltip position.
 * @return {number|anychart.core.ui.ChartTooltip} X offset of union tooltip position of itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.offsetX(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.offsetX());
  }
};


/**
 * Y offset of union tooltip position.
 * @param {number=} opt_value New value of Y offset of union tooltip position.
 * @return {number|anychart.core.ui.ChartTooltip} Y offset of union tooltip position of itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.offsetY(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.offsetY());
  }
};


/**
 * Position mode for all tooltips.
 * @param {(anychart.enums.TooltipPositionMode|string)=} opt_value
 * @return {!(anychart.enums.TooltipPositionMode|anychart.core.ui.ChartTooltip)}
 */
anychart.core.ui.ChartTooltip.prototype.positionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var positionMode = anychart.enums.normalizeTooltipPositionMode(opt_value);
    if (positionMode != this.positionMode_) {
      this.positionMode_ = positionMode;
    }
    return this;
  }
  return this.positionMode_;
};


//anychart.core.ui.ChartTooltip.prototype.allowAdjustPosition; // all


/**
 * Allow tooltip to leave chart when moving.
 * @param {boolean=} opt_value Allow tooltip to leave screen when moving.
 * @return {!(boolean|anychart.core.ui.ChartTooltip)} Allow tooltip to leave chart when moving or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.allowLeaveChart = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.allowLeaveChart_) {
      this.allowLeaveChart_ = anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && opt_value;
    }
    return this;
  }
  return anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && this.allowLeaveChart_;
};


/**
 * Allow tooltip to leave screen when moving.
 * @param {boolean=} opt_value Allow tooltip to leave screen when moving.
 * @return {!(boolean|anychart.core.ui.ChartTooltip)} Allow tooltip to leave screen when moving or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.allowLeaveScreen = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.allowLeaveScreen_) {
      this.allowLeaveScreen_ = anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && opt_value;
    }
    return this;
  }
  return anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER && this.allowLeaveScreen_;
};


/**
 * Union tooltip title.
 * @param {(null|boolean|Object)=} opt_value Title settings.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.ChartTooltip)} Title instance or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.title = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.title(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Title} */(this.unionTooltip_.title());
  }
};


/**
 * Union tooltip separator.
 * @param {(Object|boolean|null)=} opt_value Separator settings.
 * @return {!(anychart.core.ui.Separator|anychart.core.ui.ChartTooltip)} Separator instance or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.separator = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.separator(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Separator} */(this.unionTooltip_.separator());
  }
};


/**
 * Union tooltip background.
 * @param {(string|Object|null|boolean)=} opt_value Background settings.
 * @return {!(anychart.core.ui.Background|anychart.core.ui.ChartTooltip)} Background instance or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.background = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.background(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Background} */(this.unionTooltip_.background());
  }
};


/**
 * Union tooltip padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 * @param {(string|number)=} opt_rightOrRightAndLeft
 * @param {(string|number)=} opt_bottom
 * @param {(string|number)=} opt_left
 * @return {!(anychart.core.utils.Padding|anychart.core.ui.ChartTooltip)} Padding instance or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.unionTooltip_.padding(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left);
    return this;
  } else {
    return /** @type {!anychart.core.utils.Padding} */(this.unionTooltip_.padding());
  }
};


/**
 * Enabled union tooltip.
 * @param {boolean=} opt_value
 * @return {anychart.core.ui.ChartTooltip|boolean}
 */
anychart.core.ui.ChartTooltip.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.enabled(opt_value);
    return this;
  } else {
    return /** @type {boolean} */(this.unionTooltip_.enabled());
  }
};


/**
 * Sets/gets delay in milliseconds before union tooltip item becomes hidden.
 * @param {number=} opt_value Delay in milliseconds.
 * @return {number|anychart.core.ui.ChartTooltip} Delay in milliseconds or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.hideDelay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    // we have no need to invalidate anything here
    this.unionTooltip_.hideDelay(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.hideDelay());
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
 * @return {number|anychart.core.ui.ChartTooltip}
 */
anychart.core.ui.ChartTooltip.prototype.minFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.minFontSize(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.minFontSize());
  }
};


/**
 * Gets/Sets font size setting for adjust text to.
 * @param {(number|string)=} opt_value
 * @return {number|anychart.core.ui.ChartTooltip}
 */
anychart.core.ui.ChartTooltip.prototype.maxFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.maxFontSize(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.maxFontSize());
  }
};


/**
 * Adjusting settings.
 * @param {(boolean|Array.<boolean, boolean>|{width:boolean,height:boolean})=} opt_adjustOrAdjustByWidth Is font needs to be adjusted in case of 1 argument and adjusted by width in case of 2 arguments.
 * @param {boolean=} opt_adjustByHeight Is font needs to be adjusted by height.
 * @return {({width:boolean,height:boolean}|anychart.core.ui.ChartTooltip)} adjustFontSite setting or self for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.adjustFontSize = function(opt_adjustOrAdjustByWidth, opt_adjustByHeight) {
  if (goog.isDef(opt_adjustOrAdjustByWidth)) {
    this.unionTooltip_.adjustFontSize(opt_adjustOrAdjustByWidth, opt_adjustByHeight);
    return this;
  } else {
    return /** @type {{width:boolean,height:boolean}} */(this.unionTooltip_.adjustFontSize());
  }
};


/**
 * Getter/Setter for text font size.
 * @param {string|number=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|string|number}
 */
anychart.core.ui.ChartTooltip.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontSize(opt_value);
    return this;
  } else {
    return /** @type {string|number} */(this.unionTooltip_.fontSize());
  }
};


/**
 * Getter/Setter for the font family.
 * @param {string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|string}
 */
anychart.core.ui.ChartTooltip.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontFamily(opt_value);
    return this;
  } else {
    return /** @type {string} */(this.unionTooltip_.fontFamily());
  }
};


/**
 * Getter/Setter for the text font color.
 * @param {string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|string}
 */
anychart.core.ui.ChartTooltip.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontColor(opt_value);
    return this;
  } else {
    return /** @type {string} */(this.unionTooltip_.fontColor());
  }
};


/**
 * Getter/Setter for the text font opacity.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|number}
 */
anychart.core.ui.ChartTooltip.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontOpacity(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.fontOpacity());
  }
};


/**
 * Getter/Setter for the text font decoration.
 * @param {(anychart.enums.TextDecoration|string)=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.TextDecoration}
 */
anychart.core.ui.ChartTooltip.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontDecoration(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.TextDecoration} */(this.unionTooltip_.fontDecoration());
  }
};


/**
 * Getter/Setter for the text font style.
 * @param {anychart.enums.FontStyle|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.FontStyle}
 */
anychart.core.ui.ChartTooltip.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontStyle(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.FontStyle} */(this.unionTooltip_.fontStyle());
  }
};


/**
 * Getter/Setter for the text font variant.
 * @param {anychart.enums.FontVariant|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.FontVariant}
 */
anychart.core.ui.ChartTooltip.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontVariant(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.FontVariant} */(this.unionTooltip_.fontVariant());
  }
};


/**
 * Getter/Setter for the text font weight.
 * @param {(string|number)=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|string|number}
 */
anychart.core.ui.ChartTooltip.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.fontWeight(opt_value);
    return this;
  } else {
    return /** @type {string|number} */(this.unionTooltip_.fontWeight());
  }
};


/**
 * Getter/Setter for the text letter spacing.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|number|string}
 */
anychart.core.ui.ChartTooltip.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.letterSpacing(opt_value);
    return this;
  } else {
    return /** @type {number|string} */(this.unionTooltip_.letterSpacing());
  }
};


/**
 * Getter/Setter for the text direction.
 * @param {anychart.enums.TextDirection|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.TextDirection}
 */
anychart.core.ui.ChartTooltip.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.textDirection(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.TextDirection} */(this.unionTooltip_.textDirection());
  }
};


/**
 * Getter/Setter for the text line height.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|number|string}
 */
anychart.core.ui.ChartTooltip.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.lineHeight(opt_value);
    return this;
  } else {
    return /** @type {number|string} */(this.unionTooltip_.lineHeight());
  }
};


/**
 * Getter/Setter for the text indent.
 * @param {number=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|number}
 */
anychart.core.ui.ChartTooltip.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.textIndent(opt_value);
    return this;
  } else {
    return /** @type {number} */(this.unionTooltip_.textIndent());
  }
};


/**
 * Getter/Setter for the text vertical align.
 * @param {anychart.enums.VAlign|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.VAlign}
 */
anychart.core.ui.ChartTooltip.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.vAlign(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.VAlign} */(this.unionTooltip_.vAlign());
  }
};


/**
 * Getter/Setter for the text horizontal align.
 * @param {anychart.enums.HAlign|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.HAlign}
 */
anychart.core.ui.ChartTooltip.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.hAlign(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.HAlign} */(this.unionTooltip_.hAlign());
  }
};


/**
 * Getter/Setter for the text wrap settings.
 * @param {anychart.enums.TextWrap|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|anychart.enums.TextWrap}
 */
anychart.core.ui.ChartTooltip.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.textWrap(opt_value);
    return this;
  } else {
    return /** @type {anychart.enums.TextWrap} */(this.unionTooltip_.textWrap());
  }
};


/**
 * Getter/Setter for the text overflow settings.
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|acgraph.vector.Text.TextOverflow}
 */
anychart.core.ui.ChartTooltip.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.textOverflow(opt_value);
    return this;
  } else {
    return /** @type {acgraph.vector.Text.TextOverflow} */(this.unionTooltip_.textOverflow());
  }
};


/**
 * Getter/Setter for the text selectable option.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|boolean}
 */
anychart.core.ui.ChartTooltip.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.selectable(opt_value);
    return this;
  } else {
    return /** @type {boolean} */(this.unionTooltip_.selectable());
  }
};


/**
 * Pointer events.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|boolean}
 */
anychart.core.ui.ChartTooltip.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.disablePointerEvents(opt_value);
    return this;
  } else {
    return /** @type {boolean} */(this.unionTooltip_.disablePointerEvents());
  }
};


/**
 * Getter/Setter for the useHTML flag.
 * @param {boolean=} opt_value
 * @return {!anychart.core.ui.ChartTooltip|boolean}
 */
anychart.core.ui.ChartTooltip.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.useHtml(opt_value);
    return this;
  } else {
    return /** @type {boolean} */(this.unionTooltip_.useHtml());
  }
};


/**
 * Getter/Setter for the full text appearance settings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean)=} opt_value Setting value if used as a setter.
 * @return {!(Object|string|number|boolean|anychart.core.ui.ChartTooltip)} A copy of settings or the Text for chaining.
 */
anychart.core.ui.ChartTooltip.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    this.unionTooltip_.textSettings(opt_objectOrName, opt_value);
    return this;
  } else {
    return /** @type {!(Object|string|number|boolean)} */(this.unionTooltip_.textSettings());
  }
};


/**
 * This method was created for resolve bug with Safari 5.1.7
 * @param {anychart.core.ui.SeriesTooltip} tooltip
 * @private
 */
anychart.core.ui.ChartTooltip.prototype.setContainerToTooltip_ = function(tooltip) {
  if (!tooltip.container()) {
    if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
      anychart.core.utils.TooltipsContainer.getInstance().allocTooltip(tooltip);
    } else {
      tooltip.container(this.chart_.container());
    }
  }
};


/**
 * Show tooltip.
 * @param {Array} points
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.core.series.Base} hoveredSeries
 * @param {boolean=} opt_useUnionAsSingle
 * @param {Object=} opt_tooltipContextLoad
 */
anychart.core.ui.ChartTooltip.prototype.show = function(points, clientX, clientY, hoveredSeries, opt_useUnionAsSingle,
    opt_tooltipContextLoad) {

  if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER &&
      anychart.core.utils.TooltipsContainer.getInstance().selectable()) return;

  if (goog.array.isEmpty(points)) return;

  if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SINGLE) {
    var firstPoint = points[0];
    var firstSeries = firstPoint['series'];
    this.singleTooltip_ = opt_useUnionAsSingle ? this.unionTooltip_ : firstSeries.tooltip();

    if (!this.singleTooltip_.enabled()) {
      return;
    }

    // for compile_each (gantt, bullet)
    if (!goog.isDef(firstSeries.createTooltipContextProvider)) {
      return;
    }

    var contextProvider = firstSeries.createTooltipContextProvider();
    contextProvider['clientX'] = clientX;
    contextProvider['clientY'] = clientY;
    this.singleTooltip_.title().autoText(this.singleTooltip_.getFormattedTitle(contextProvider));
    this.singleTooltip_.contentInternal().text(this.singleTooltip_.getFormattedContent(contextProvider));

    this.hideOtherTooltips_([this.singleTooltip_]);
    this.tooltipsMap_[goog.getUid(this.singleTooltip_).toString()] = this.singleTooltip_;

    this.setPositionToTooltip_(this.singleTooltip_, clientX, clientY, firstSeries);
    this.setContainerToTooltip_(this.singleTooltip_);
    this.singleTooltip_.show(clientX, clientY);

  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.UNION) {
    if (!this.unionTooltip_.enabled()) {
      return;
    }

    var unionContext = {
      'clientX' : clientX,
      'clientY': clientY,
      'formattedValues': [],
      'points': []
    };

    var allPoints = [];

    goog.array.forEach(points, function(status) {
      var series = status['series'];
      var tooltip = series.tooltip();

      if (!tooltip.enabled()) {
        return;
      }

      // for compile_each (gantt, bullet)
      if (!goog.isDef(series.createTooltipContextProvider)) {
        return;
      }

      var contextProvider = series.createTooltipContextProvider();
      unionContext['formattedValues'].push(tooltip.getFormattedContent(contextProvider));
      unionContext['points'].push(contextProvider);

      if (goog.isArray(status['points']))
        allPoints.push({
          'series': series,
          'points': goog.array.map(status['points'], function(pointIndex) {
            series.getIterator().select(pointIndex);
            return /** @type {{createTooltipContextProvider:Function}} */(series).createTooltipContextProvider(true);
          })
        });
    });

    if (allPoints.length == points.length)
      unionContext['allPoints'] = allPoints;

    if (!unionContext['formattedValues'].length) {
      return;
    }

    if (opt_tooltipContextLoad)
      goog.object.extend(unionContext, opt_tooltipContextLoad);

    var unionContextProvider = new anychart.core.utils.GenericContextProvider(unionContext, {
      'clientX': anychart.enums.TokenType.NUMBER,
      'clientY': anychart.enums.TokenType.NUMBER
    }, points[0] && points[0]['series'] && points[0]['series'].getChart && points[0]['series'].getChart() || undefined);
    this.unionTooltip_.contentInternal().text(this.unionTooltip_.getFormattedContent(unionContextProvider));
    this.unionTooltip_.title().autoText(this.unionTooltip_.getFormattedTitle(unionContextProvider));

    this.hideOtherTooltips_([this.unionTooltip_]);
    this.tooltipsMap_[goog.getUid(this.unionTooltip_).toString()] = this.unionTooltip_;

    this.setPositionToTooltip_(this.unionTooltip_, clientX, clientY, hoveredSeries);
    this.setContainerToTooltip_(this.unionTooltip_);
    this.unionTooltip_.show(clientX, clientY);


  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SEPARATED) {
    var self = this;
    this.hideOtherTooltips_(this.separatedTooltips_);
    goog.array.clear(this.separatedTooltips_);

    goog.array.forEach(points, function(point) {
      var series = point['series'];
      var tooltip = series.tooltip();

      if (!tooltip.enabled()) {
        return;
      }

      // for compile_each (gantt, bullet)
      if (!goog.isDef(series.createTooltipContextProvider)) {
        return;
      }

      var contextProvider = series.createTooltipContextProvider();
      contextProvider['clientX'] = clientX;
      contextProvider['clientY'] = clientY;
      tooltip.title().autoText(tooltip.getFormattedTitle(contextProvider));
      tooltip.contentInternal().text(tooltip.getFormattedContent(contextProvider));

      self.tooltipsMap_[goog.getUid(tooltip).toString()] = tooltip;

      self.setPositionToTooltip_(tooltip, clientX, clientY, series);
      self.setContainerToTooltip_(tooltip);
      tooltip.show(clientX, clientY);

      self.separatedTooltips_.push(tooltip);
    });
  }
};


/**
 * Update position (used for float position only)
 * @param {number} clientX
 * @param {number} clientY
 */
anychart.core.ui.ChartTooltip.prototype.updatePosition = function(clientX, clientY) {
  if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SINGLE) {
    this.setPositionToTooltip_(this.singleTooltip_, clientX, clientY);
    this.singleTooltip_.show(clientX, clientY);

  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.UNION) {
    this.setPositionToTooltip_(this.unionTooltip_, clientX, clientY);
    this.unionTooltip_.show(clientX, clientY);

  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SEPARATED) {
    var self = this;

    goog.object.forEach(this.tooltipsMap_, function(tooltip) {
      self.setPositionToTooltip_(tooltip, clientX, clientY);
      tooltip.show(clientX, clientY);
    });
  }
};


/**
 *
 * @param {anychart.core.ui.SeriesTooltip} tooltip
 * @param {number} clientX
 * @param {number} clientY
 * @param {anychart.core.series.Base|anychart.charts.TreeMap=} opt_series
 * @private
 */
anychart.core.ui.ChartTooltip.prototype.setPositionToTooltip_ = function(tooltip, clientX, clientY, opt_series) {
  var x, y, chartPixelBounds, pixelBounds, position, anchoredPositionCoordinate;
  var chartOffset = goog.style.getClientPosition(/** @type {Element} */(this.chart_.container().getStage().container()));

  if (this.positionMode_ == anychart.enums.TooltipPositionMode.FLOAT) {
    if (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER) {
      x = clientX;
      y = clientY;
    } else {
      x = clientX - chartOffset.x;
      y = clientY - chartOffset.y;
    }

  } else if (this.positionMode_ == anychart.enums.TooltipPositionMode.POINT) {
    position = this.displayMode_ == anychart.enums.TooltipDisplayMode.UNION ? this.position() : tooltip.position();
    var positionProvider = opt_series.createPositionProvider(/** @type {anychart.enums.Position} */(position), true)['value'];
    x = positionProvider['x'] +
        (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER ? chartOffset.x : 0);
    y = positionProvider['y'] +
        (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER ? chartOffset.y : 0);

  } else if (this.positionMode_ == anychart.enums.TooltipPositionMode.CHART) {
    chartPixelBounds = this.chart_.getPixelBounds();
    position = this.displayMode_ == anychart.enums.TooltipDisplayMode.UNION ? this.position() : tooltip.position();
    anchoredPositionCoordinate = anychart.utils.getCoordinateByAnchor(chartPixelBounds, /** @type {anychart.enums.Position} */(position));
    x = anchoredPositionCoordinate.x +
        (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER ? chartOffset.x : 0);
    y = anchoredPositionCoordinate.y +
        (anychart.compatibility.ALLOW_GLOBAL_TOOLTIP_CONTAINER ? chartOffset.y : 0);
  }

  if (!this.allowLeaveScreen()) {
    // Set position for get actual pixel bounds.
    tooltip.x(x);
    tooltip.y(y);
    pixelBounds = tooltip.getPixelBounds();
    var windowBox = goog.dom.getViewportSize();

    if (pixelBounds.left < 0) {
      x -= pixelBounds.left;
    }

    if (pixelBounds.top < 0) {
      y -= pixelBounds.top;
    }

    if (pixelBounds.getRight() > windowBox.width) {
      x -= pixelBounds.getRight() - windowBox.width;
    }

    if (pixelBounds.getBottom() > windowBox.height) {
      y -= pixelBounds.getBottom() - windowBox.height;
    }

  }

  if (!this.allowLeaveChart()) {
    // Set position for get actual pixel bounds.
    tooltip.x(x);
    tooltip.y(y);
    pixelBounds = tooltip.getPixelBounds();
    chartPixelBounds = this.chart_.getPixelBounds();
    if (!chartOffset) {
      chartOffset = goog.style.getClientPosition(/** @type {Element} */(this.chart_.container().getStage().container()));
    }

    if (pixelBounds.left < chartOffset.x + chartPixelBounds.left) {
      x -= pixelBounds.left - chartOffset.x - chartPixelBounds.left;
    }

    if (pixelBounds.top < chartOffset.y + chartPixelBounds.top) {
      y -= pixelBounds.top - chartOffset.y - chartPixelBounds.top;
    }

    if (pixelBounds.getRight() > chartOffset.x + chartPixelBounds.getRight()) {
      x -= pixelBounds.getRight() - chartOffset.x - chartPixelBounds.getRight();
    }

    if (pixelBounds.getBottom() > chartOffset.y + chartPixelBounds.getBottom()) {
      y -= pixelBounds.getBottom() - chartOffset.y - chartPixelBounds.getBottom();
    }
  }

  tooltip.x(x);
  tooltip.y(y);
};


/**
 * Hide tooltips with delay (if specified {@see #hideDelay}).
 * @param {boolean=} opt_force Ignore tooltips hide delay.
 * @param {anychart.core.MouseEvent=} opt_event
 */
anychart.core.ui.ChartTooltip.prototype.hide = function(opt_force, opt_event) {
  if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SINGLE) {
    if (this.singleTooltip_ && this.singleTooltip_.hide(opt_force, opt_event)) {
      delete this.tooltipsMap_[goog.getUid(this.singleTooltip_).toString()];
    }

  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.UNION) {
    if (this.unionTooltip_.hide(opt_force, opt_event)) {
      delete this.tooltipsMap_[goog.getUid(this.unionTooltip_).toString()];
    }

  } else if (this.displayMode_ == anychart.enums.TooltipDisplayMode.SEPARATED) {
    goog.array.forEach(this.separatedTooltips_, function(tooltip) {
      if (tooltip.hide(opt_force, opt_event)) {
        delete this.tooltipsMap_[goog.getUid(tooltip).toString()];
      }
    }, this);
    goog.array.clear(this.separatedTooltips_);
  }
};


/**
 * Hide tooltips except passed array of tooltips. Hide delay will be ignored.
 * @param {!Array.<anychart.core.ui.SeriesTooltip>} ignoreTooltips
 * @private
 */
anychart.core.ui.ChartTooltip.prototype.hideOtherTooltips_ = function(ignoreTooltips) {
  // DVF-1444 - remove all previously shown tooltips.
  goog.object.forEach(this.tooltipsMap_, function(otherTooltip, uid) {
    var exclude = goog.array.some(ignoreTooltips, function(tooltip) {
      return goog.getUid(tooltip) == uid;
    });
    if (exclude) return;

    otherTooltip.hide(true);
    delete this.tooltipsMap_[uid];
  }, this);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Deprecated.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Function to format content text for union tooltip.
 * @param {Function=} opt_value Function to format content text.
 * @return {Function|anychart.core.ui.ChartTooltip} Function to format content text or itself for method chaining.
 * @deprecated Use {@link #textFormatter} instead.
 */
anychart.core.ui.ChartTooltip.prototype.contentFormatter = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.contentFormatter()', '.textFormatter()'], true);
  return this.textFormatter(opt_value);
};


/**
 * Union tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.ChartTooltip)} Labels instance or itself for method chaining.
 */
anychart.core.ui.ChartTooltip.prototype.contentInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.unionTooltip_.contentInternal(opt_value);
    return this;
  } else {
    return /** @type {!anychart.core.ui.Label} */(this.unionTooltip_.contentInternal());
  }
};


/**
 * Union tooltip content.
 * @param {(Object|boolean|null|string)=} opt_value Content settings.
 * @return {!(anychart.core.ui.Label|anychart.core.ui.ChartTooltip)} Labels instance or itself for method chaining.
 * @deprecated Use methods directly.
 */
anychart.core.ui.ChartTooltip.prototype.content = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.content()', 'method directly'], true);
  return this.contentInternal(opt_value);
};


/**
 * Enabled 'float' position mode for all tooltips.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.ui.ChartTooltip)}
 */
anychart.core.ui.ChartTooltip.prototype.isFloatingInternal = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['.isFloating()', '.positionMode()'], true);
  if (goog.isDef(opt_value)) {
    this.positionMode(opt_value ? anychart.enums.TooltipPositionMode.FLOAT : anychart.enums.TooltipPositionMode.POINT);
    return this;
  } else {
    return this.positionMode() == anychart.enums.TooltipPositionMode.FLOAT;
  }
};


/**
 * Enabled 'float' position mode for all tooltips.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.ui.ChartTooltip)}
 * @deprecated Use {@link #positionMode} instead.
 */
anychart.core.ui.ChartTooltip.prototype.isFloating = anychart.core.ui.ChartTooltip.prototype.isFloatingInternal;


/** @inheritDoc */
anychart.core.ui.ChartTooltip.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['displayMode'] = this.displayMode();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['positionMode'] = this.positionMode();
  //json['allowAdjustPosition'] = this.allowAdjustPosition();
  json['allowLeaveChart'] = this.allowLeaveChart();
  json['allowLeaveScreen'] = this.allowLeaveScreen();

  json['title'] = this.title().serialize();
  json['separator'] = this.separator().serialize();
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['enabled'] = this.enabled();
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
anychart.core.ui.ChartTooltip.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.ChartTooltip.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.titleFormatter(config['titleFormatter']);
  this.textFormatter(config['textFormatter'] || config['contentFormatter']);
  this.displayMode(config['displayMode']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  if (goog.isDef(config['isFloating'])) {
    this.isFloatingInternal(config['isFloating']);
  }
  this.positionMode(config['positionMode']);
  //this.allowAdjustPosition(config['allowAdjustPosition']);
  this.allowLeaveChart(config['allowLeaveChart']);
  this.allowLeaveScreen(config['allowLeaveScreen']);

  this.title(config['title']);
  this.separator(config['separator']);
  this.contentInternal(config['content']);
  this.background(config['background']);
  this.padding(config['padding']);
  this.enabled(config['enabled']);
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


//anychart.core.ui.ChartTooltip.prototype['allowAdjustPosition'] = anychart.core.ui.ChartTooltip.prototype.allowAdjustPosition;

//exports
anychart.core.ui.ChartTooltip.prototype['titleFormatter'] = anychart.core.ui.ChartTooltip.prototype.titleFormatter;
anychart.core.ui.ChartTooltip.prototype['textFormatter'] = anychart.core.ui.ChartTooltip.prototype.textFormatter;
anychart.core.ui.ChartTooltip.prototype['displayMode'] = anychart.core.ui.ChartTooltip.prototype.displayMode;

anychart.core.ui.ChartTooltip.prototype['position'] = anychart.core.ui.ChartTooltip.prototype.position;
anychart.core.ui.ChartTooltip.prototype['anchor'] = anychart.core.ui.ChartTooltip.prototype.anchor;
anychart.core.ui.ChartTooltip.prototype['offsetX'] = anychart.core.ui.ChartTooltip.prototype.offsetX;
anychart.core.ui.ChartTooltip.prototype['offsetY'] = anychart.core.ui.ChartTooltip.prototype.offsetY;
anychart.core.ui.ChartTooltip.prototype['positionMode'] = anychart.core.ui.ChartTooltip.prototype.positionMode;
anychart.core.ui.ChartTooltip.prototype['allowLeaveChart'] = anychart.core.ui.ChartTooltip.prototype.allowLeaveChart;
anychart.core.ui.ChartTooltip.prototype['allowLeaveScreen'] = anychart.core.ui.ChartTooltip.prototype.allowLeaveScreen;

anychart.core.ui.ChartTooltip.prototype['title'] = anychart.core.ui.ChartTooltip.prototype.title;
anychart.core.ui.ChartTooltip.prototype['separator'] = anychart.core.ui.ChartTooltip.prototype.separator;
anychart.core.ui.ChartTooltip.prototype['background'] = anychart.core.ui.ChartTooltip.prototype.background;
anychart.core.ui.ChartTooltip.prototype['padding'] = anychart.core.ui.ChartTooltip.prototype.padding;
anychart.core.ui.ChartTooltip.prototype['enabled'] = anychart.core.ui.ChartTooltip.prototype.enabled;
anychart.core.ui.ChartTooltip.prototype['hide'] = anychart.core.ui.ChartTooltip.prototype.hide;
anychart.core.ui.ChartTooltip.prototype['hideDelay'] = anychart.core.ui.ChartTooltip.prototype.hideDelay;

// text API
anychart.core.ui.ChartTooltip.prototype['minFontSize'] = anychart.core.ui.ChartTooltip.prototype.minFontSize;
anychart.core.ui.ChartTooltip.prototype['maxFontSize'] = anychart.core.ui.ChartTooltip.prototype.maxFontSize;
anychart.core.ui.ChartTooltip.prototype['adjustFontSize'] = anychart.core.ui.ChartTooltip.prototype.adjustFontSize;
anychart.core.ui.ChartTooltip.prototype['fontSize'] = anychart.core.ui.ChartTooltip.prototype.fontSize;
anychart.core.ui.ChartTooltip.prototype['fontFamily'] = anychart.core.ui.ChartTooltip.prototype.fontFamily;
anychart.core.ui.ChartTooltip.prototype['fontColor'] = anychart.core.ui.ChartTooltip.prototype.fontColor;
anychart.core.ui.ChartTooltip.prototype['fontOpacity'] = anychart.core.ui.ChartTooltip.prototype.fontOpacity;
anychart.core.ui.ChartTooltip.prototype['fontDecoration'] = anychart.core.ui.ChartTooltip.prototype.fontDecoration;
anychart.core.ui.ChartTooltip.prototype['fontStyle'] = anychart.core.ui.ChartTooltip.prototype.fontStyle;
anychart.core.ui.ChartTooltip.prototype['fontVariant'] = anychart.core.ui.ChartTooltip.prototype.fontVariant;
anychart.core.ui.ChartTooltip.prototype['fontWeight'] = anychart.core.ui.ChartTooltip.prototype.fontWeight;
anychart.core.ui.ChartTooltip.prototype['letterSpacing'] = anychart.core.ui.ChartTooltip.prototype.letterSpacing;
anychart.core.ui.ChartTooltip.prototype['textDirection'] = anychart.core.ui.ChartTooltip.prototype.textDirection;
anychart.core.ui.ChartTooltip.prototype['lineHeight'] = anychart.core.ui.ChartTooltip.prototype.lineHeight;
anychart.core.ui.ChartTooltip.prototype['textIndent'] = anychart.core.ui.ChartTooltip.prototype.textIndent;
anychart.core.ui.ChartTooltip.prototype['vAlign'] = anychart.core.ui.ChartTooltip.prototype.vAlign;
anychart.core.ui.ChartTooltip.prototype['hAlign'] = anychart.core.ui.ChartTooltip.prototype.hAlign;
anychart.core.ui.ChartTooltip.prototype['textWrap'] = anychart.core.ui.ChartTooltip.prototype.textWrap;
anychart.core.ui.ChartTooltip.prototype['textOverflow'] = anychart.core.ui.ChartTooltip.prototype.textOverflow;
anychart.core.ui.ChartTooltip.prototype['selectable'] = anychart.core.ui.ChartTooltip.prototype.selectable;
anychart.core.ui.ChartTooltip.prototype['disablePointerEvents'] = anychart.core.ui.ChartTooltip.prototype.disablePointerEvents;
anychart.core.ui.ChartTooltip.prototype['useHtml'] = anychart.core.ui.ChartTooltip.prototype.useHtml;
anychart.core.ui.ChartTooltip.prototype['textSettings'] = anychart.core.ui.ChartTooltip.prototype.textSettings;

//deprecated
anychart.core.ui.ChartTooltip.prototype['contentFormatter'] = anychart.core.ui.ChartTooltip.prototype.contentFormatter;
anychart.core.ui.ChartTooltip.prototype['content'] = anychart.core.ui.ChartTooltip.prototype.content;
anychart.core.ui.ChartTooltip.prototype['isFloating'] = anychart.core.ui.ChartTooltip.prototype.isFloating;
