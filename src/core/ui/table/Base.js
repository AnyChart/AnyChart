goog.provide('anychart.core.ui.table.Base');
goog.provide('anychart.core.ui.table.IProxyUser');
goog.require('acgraph');
goog.require('anychart.core.ui.table.Border');
goog.require('anychart.core.ui.table.Padding');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.Disposable');


/**
 * Namespace anychart.core.ui.table
 * @namespace
 * @name anychart.core.ui.table
 */



/**
 * @interface
 */
anychart.core.ui.table.IProxyUser = function() {
};


/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.core.ui.table.IProxyUser|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.core.ui.table.IProxyUser.prototype.settings;



/**
 * Base class for Row, Column and Cell. Contains text settings and lazy settings object initialization.
 * Also knows about table, so it can send messages to the table.
 * @constructor
 * @param {!anychart.core.ui.Table} table
 * @extends {goog.Disposable}
 * @implements {anychart.core.ui.table.IProxyUser}
 */
anychart.core.ui.table.Base = function(table) {
  goog.base(this);

  /**
   * Table instance that created this instance.
   * @type {!anychart.core.ui.Table}
   * @protected
   */
  this.table = table;

  /**
   * Borders proxy object.
   * @type {anychart.core.ui.table.Border}
   * @private
   */
  this.bordersProxy_ = null;

  /**
   * Paddings proxy object.
   * @type {anychart.core.ui.table.Padding}}
   * @private
   */
  this.paddingProxy_ = null;
};
goog.inherits(anychart.core.ui.table.Base, goog.Disposable);


/**
 * Settings accumulator.
 * Possible structure: {!{
 *  // cell fill
 *  fill: (acgraph.vector.Fill|undefined),
 *
 *  // cell border in Cell settings and row/col border in Row/Column settings
 *  topBorder: (acgraph.vector.Stroke|undefined),
 *  rightBorder: (acgraph.vector.Stroke|undefined),
 *  bottomBorder: (acgraph.vector.Stroke|undefined),
 *  leftBorder: (acgraph.vector.Stroke|undefined),
 *
 *  // cell border in Row/Column settings
 *  cellTopBorder: (acgraph.vector.Stroke|undefined),
 *  cellRightBorder: (acgraph.vector.Stroke|undefined),
 *  cellBottomBorder: (acgraph.vector.Stroke|undefined),
 *  cellLeftBorder: (acgraph.vector.Stroke|undefined),
 *
 *  // cell padding
 *  topPadding: (number|undefined),
 *  rightPadding: (number|undefined),
 *  bottomPadding: (number|undefined),
 *  leftPadding: (number|undefined),
 *
 *  // text settings for text cells
 *  fontSize: (string|number|undefined),
 *  fontFamily: (string|undefined),
 *  fontColor: (string|undefined),
 *  fontOpacity: (number|undefined),
 *  fontDecoration: (acgraph.vector.Text.Decoration|undefined),
 *  fontStyle: (acgraph.vector.Text.FontStyle|undefined),
 *  fontVariant: (acgraph.vector.Text.FontVariant|undefined),
 *  fontWeight: (string|number|undefined),
 *  letterSpacing: (string|number|undefined),
 *  textDirection: (acgraph.vector.Text.Direction|undefined),
 *  lineHeight: (string|number|undefined),
 *  textIndent: (number|undefined),
 *  vAlign: (acgraph.vector.Text.VAlign|undefined),
 *  hAlign: (acgraph.vector.Text.HAlign|undefined),
 *  textWrap: (acgraph.vector.Text.TextWrap|undefined),
 *  textOverflow: (acgraph.vector.Text.TextOverflow|undefined),
 *  selectable: (boolean|undefined),
 *  disablePointerEvents: (boolean|undefined),
 *  useHtml: (boolean|undefined)
 * }}
 *
 * @type {!Object}
 */
anychart.core.ui.table.Base.prototype.settingsObj;


/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.core.ui.table.Base|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.core.ui.table.Base.prototype.settings = function(opt_name, opt_value, opt_state, opt_signal) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      var shouldInvalidate = false;
      if (goog.isNull(opt_value)) {
        if (this.settingsObj && this.settingsObj[opt_name]) {
          delete this.settingsObj[opt_name];
          shouldInvalidate = true;
        }
      } else {
        if (!this.settingsObj) this.settingsObj = {};
        if (this.settingsObj[opt_name] != opt_value) {
          this.settingsObj[opt_name] = opt_value;
          shouldInvalidate = true;
        }
      }
      if (shouldInvalidate)
        this.table.invalidate(+opt_state || anychart.ConsistencyState.TABLE_CONTENT, +opt_signal || anychart.Signal.NEEDS_REDRAW);
      return this;
    } else {
      return this.settingsObj && this.settingsObj[opt_name];
    }
  }
  return this.settingsObj || {};
};


/**
 * Getter for text font size.
 * @return {string|number} Current font size.
 *//**
 * Setter for text font size.
 * @param {string|number=} opt_value ['16px'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string|number=} opt_value .
 * @return {!anychart.core.ui.table.Base|string|number} .
 */
anychart.core.ui.table.Base.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.table.Base|string|number} */(this.settings('fontSize', opt_value));
};


/**
 * Getter for the font family.
 * @return {string} The current font family.
 *//**
 * Setter for font family.
 * @param {string=} opt_value ['Arial'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.table.Base|string} .
 */
anychart.core.ui.table.Base.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.table.Base|string} */(this.settings('fontFamily', opt_value));
};


/**
 * Getter for the text font color.
 * @return {string} The current font color.
 *//**
 * Setter for the text font color.<br/>
 * {@link http://www.w3schools.com/html/html_colors.asp}
 * @param {string=} opt_value ['#000'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.table.Base|string} .
 */
anychart.core.ui.table.Base.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.table.Base|string} */(this.settings('fontColor', opt_value));
};


/**
 * Getter for the text font opacity.
 * @return {number} The current font opacity.
 *//**
 * Setter for the text font opacity.<br/>
 * Double value from 0 to 1.
 * @param {number=} opt_value [1] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.core.ui.table.Base|number} .
 */
anychart.core.ui.table.Base.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.core.ui.table.Base|number} */(this.settings('fontOpacity', opt_value));
};


/**
 * Getter for the text font decoration.
 * @return {acgraph.vector.Text.Decoration|string} The current font decoration.
 *//**
 * Setter for the text font decoration.
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value [{@link acgraph.vector.Text.Decoration}.NONE] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.Decoration} .
 */
anychart.core.ui.table.Base.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.Decoration} */(this.settings('fontDecoration', opt_value));
};


/**
 * Getter for the text font style.
 * @return {acgraph.vector.Text.FontStyle|string} The current font style.
 *//**
 * Setter for the text font style.
 * @param {(acgraph.vector.Text.FontStyle|string)=} opt_value [{@link acgraph.vector.Text.FontStyle}.NORMAL] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontStyle|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.FontStyle} .
 */
anychart.core.ui.table.Base.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.FontStyle} */(this.settings('fontStyle', opt_value));
};


/**
 * Getter for the text font variant.
 * @return {acgraph.vector.Text.FontVariant|string} The current font variant.
 *//**
 * Setter for the text font variant.
 * @param {(acgraph.vector.Text.FontVariant|string)=} opt_value [{@link acgraph.vector.Text.FontVariant}.NORMAL] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontVariant|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.FontVariant} .
 */
anychart.core.ui.table.Base.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.FontVariant} */(this.settings('fontVariant', opt_value));
};


/**
 * Getter for the text font weight.
 * @return {string|number} The current font weight.
 *//**
 * Setter for the text font weight.<br/>
 * {@link http://www.w3schools.com/cssref/pr_font_weight.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {!anychart.core.ui.table.Base|string|number} .
 */
anychart.core.ui.table.Base.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.table.Base|string|number} */(this.settings('fontWeight', opt_value));
};


/**
 * Getter for the text letter spacing.
 * @return {string|number} The current letter spacing.
 *//**
 * Setter for the text letter spacing.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.core.ui.table.Base|number|string} .
 */
anychart.core.ui.table.Base.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.table.Base|number|string} */(this.settings('letterSpacing', opt_value));
};


/**
 * Getter for the text direction.
 * @return {acgraph.vector.Text.Direction|string} Current text direction.
 *//**
 * Setter for the text direction.
 * @param {(acgraph.vector.Text.Direction|string)=} opt_value [{@link acgraph.vector.Text.Direction}.LTR] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.Direction|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.Direction} .
 */
anychart.core.ui.table.Base.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.Direction} */(this.settings('textDirection', opt_value));
};


/**
 * Getter for the text line height.
 * @return {string|number} The current text line height.
 *//**
 * Setter for the text line height.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.core.ui.table.Base|number|string} .
 */
anychart.core.ui.table.Base.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.table.Base|number|string} */(this.settings('lineHeight', opt_value));
};


/**
 * Getter for the text indent.
 * @return {number} The current text indent.
 *//**
 * Setter for the text indent.
 * @param {number=} opt_value [0] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.core.ui.table.Base|number} .
 */
anychart.core.ui.table.Base.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.core.ui.table.Base|number} */(this.settings('textIndent', opt_value));
};


/**
 * Getter for the text vertical align.
 * @return {acgraph.vector.Text.VAlign|string} The current text vertical align.
 *//**
 * Setter for the text vertical align.
 * @param {(acgraph.vector.Text.VAlign|string)=} opt_value [{@link acgraph.vector.Text.VAlign}.TOP] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.VAlign|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.VAlign} .
 */
anychart.core.ui.table.Base.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.VAlign} */(this.settings('vAlign', opt_value));
};


/**
 * Getter for the text horizontal align.
 * @return {acgraph.vector.Text.HAlign|string} Th current text horizontal align.
 *//**
 * Setter for the text horizontal align.
 * @param {(acgraph.vector.Text.HAlign|string)=} opt_value [{@link acgraph.vector.Text.HAlign}.START] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.HAlign|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.HAlign} .
 */
anychart.core.ui.table.Base.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.HAlign} */(this.settings('hAlign', opt_value));
};


/**
 * Getter for the text wrap settings.
 * @return {acgraph.vector.Text.TextWrap|string} Th current text wrap settings.
 *//**
 * Setter for the text wrap settings.
 * @param {(acgraph.vector.Text.TextWrap|string)=} opt_value [{@link acgraph.vector.Text.TextWrap}.BY_LETTER] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextWrap|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.TextWrap} .
 */
anychart.core.ui.table.Base.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextWrap(opt_value);
  }
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.TextWrap} */(this.settings('textWrap', opt_value));
};


/**
 * Getter for the text overflow settings.
 * @return {acgraph.vector.Text.TextOverflow|string} The current text overflow settings.
 *//**
 * Setter for the text overflow settings.
 * @param {(acgraph.vector.Text.TextOverflow|string)=} opt_value [{@link acgraph.vector.Text.TextOverflow}.CLIP] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value .
 * @return {!anychart.core.ui.table.Base|acgraph.vector.Text.TextOverflow} .
 */
anychart.core.ui.table.Base.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.table.Base|acgraph.vector.Text.TextOverflow} */(this.settings('textOverflow', opt_value));
};


/**
 * Getter for the text selectable option.
 * @return {boolean} The current text selectable option.
 *//**
 * Setter for the text selectable.<br/>
 * This options defines whether the text can be selected. If set to <b>false</b> one can't select the text.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.table.Base|boolean} .
 */
anychart.core.ui.table.Base.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.table.Base|boolean} */(this.settings('selectable', opt_value));
};


/**
 * Gets current state of disablePointerEvents option.
 * @return {boolean} If pointer events are disabled.
 *//**
 * Setter for the text disablePointerEvents option.<br/>
 * This options defines whether the text should pass mouse events through.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.table.Base|boolean} .
 */
anychart.core.ui.table.Base.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.table.Base|boolean} */(this.settings('disablePointerEvents', opt_value));
};


/**
 * Getter for the useHtml flag.
 * @return {boolean} The current value of useHTML flag.
 *//**
 * Setter for flag useHtml.<br/>
 * This property defines whether HTML text should be parsed.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.table.Base} An instance of {@link anychart.core.ui.table.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.table.Base|boolean} .
 */
anychart.core.ui.table.Base.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.table.Base|boolean} */(this.settings('useHtml', opt_value));
};


/**
 * Getter for border settings object.
 * @return {!anychart.core.ui.table.Border} Current bor settings.
 *//**
 * Setter for cell border settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Pass <b>null</b> to reset to default settings.<br/>
 * <b>Note:</b> <u>lineJoin</u> settings not working here.
 * @shortDescription Setter for cell border settings.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
 * table.getCell(1,1).border('orange', 3, '5 2', 'round');
 * table.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.ui.table.Base} {@link anychart.core.ui.table.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.table.Base|anychart.core.ui.table.Border} .
 */
anychart.core.ui.table.Base.prototype.border = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.table.suspendSignalsDispatching();
    this.settings('border',
        /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    // we remove specific border settings to make common border settings work
    for (var i = 0; i < 4; i++)
      this.settings(anychart.core.ui.table.Border.propNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.table.resumeSignalsDispatching(true);
    return this;
  }
  return this.bordersProxy_ || (this.bordersProxy_ = new anychart.core.ui.table.Border(this, false));
};


/**
 * Cell padding settings. This method should be called padding() in Cell and cellPadding in Row and Column. So we call
 * if paddingInternal and make aliases to it.
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!anychart.core.ui.table.Base|anychart.core.ui.table.Padding} .
 * @protected
 */
anychart.core.ui.table.Base.prototype.paddingInternal = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    var top, right, bottom, left;
    var argsLen;
    if (goog.isArray(opt_spaceOrTopOrTopAndBottom)) {
      var tmp = opt_spaceOrTopOrTopAndBottom;
      opt_spaceOrTopOrTopAndBottom = tmp[0];
      opt_rightOrRightAndLeft = tmp[1];
      opt_bottom = tmp[2];
      opt_left = tmp[3];
      argsLen = tmp.length;
    } else
      argsLen = arguments.length;
    if (argsLen == 0) {
      left = bottom = right = top = 0;
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['top']) || 0;
      right = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['right']) || 0;
      bottom = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['bottom']) || 0;
      left = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['left']) || 0;
    } else if (argsLen == 1) {
      left = bottom = right = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
    } else if (argsLen == 2) {
      bottom = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
    } else if (argsLen == 3) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
    } else if (argsLen >= 4) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
      left = anychart.utils.toNumberOrString(opt_left) || 0;
    }
    this.table.suspendSignalsDispatching();
    this.settings(anychart.core.ui.table.Padding.propNames[0], top, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[1], right, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[2], bottom, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[3], left, anychart.ConsistencyState.TABLE_CONTENT);
    this.table.resumeSignalsDispatching(true);
    return this;
  }
  return this.paddingProxy_ || (this.paddingProxy_ = new anychart.core.ui.table.Padding(this));
};


///** @inheritDoc */
//anychart.core.ui.table.Base.prototype.serialize = function() {
//  var json = goog.base(this, 'serialize');
//  if (goog.isDef(this.fontSize())) json['fontSize'] = this.fontSize();
//  if (goog.isDef(this.fontFamily())) json['fontFamily'] = this.fontFamily();
//  if (goog.isDef(this.fontColor())) json['fontColor'] = this.fontColor();
//  if (goog.isDef(this.fontOpacity())) json['fontOpacity'] = this.fontOpacity();
//  if (goog.isDef(this.fontDecoration())) json['fontDecoration'] = this.fontDecoration();
//  if (goog.isDef(this.fontStyle())) json['fontStyle'] = this.fontStyle();
//  if (goog.isDef(this.fontVariant())) json['fontVariant'] = this.fontVariant();
//  if (goog.isDef(this.fontWeight())) json['fontWeight'] = this.fontWeight();
//  if (goog.isDef(this.letterSpacing())) json['letterSpacing'] = this.letterSpacing();
//  if (goog.isDef(this.textDirection())) json['textDirection'] = this.textDirection();
//  if (goog.isDef(this.lineHeight())) json['lineHeight'] = this.lineHeight();
//  if (goog.isDef(this.textIndent())) json['textIndent'] = this.textIndent();
//  if (goog.isDef(this.vAlign())) json['vAlign'] = this.vAlign();
//  if (goog.isDef(this.hAlign())) json['hAlign'] = this.hAlign();
//  if (goog.isDef(this.textWrap())) json['textWrap'] = this.textWrap();
//  if (goog.isDef(this.textOverflow())) json['textOverflow'] = this.textOverflow();
//  if (goog.isDef(this.selectable())) json['selectable'] = this.selectable();
//  if (goog.isDef(this.disablePointerEvents())) json['disablePointerEvents'] = this.disablePointerEvents();
//  if (goog.isDef(this.useHtml())) json['useHtml'] = this.useHtml();
//  return json;
//};
//
//
///** @inheritDoc */
//anychart.core.ui.table.Base.prototype.setupByJSON = function(config) {
//  goog.base(this, 'setupByJSON', config);
//  this.fontSize(config['fontSize']);
//  this.fontFamily(config['fontFamily']);
//  this.fontColor(config['fontColor']);
//  this.fontOpacity(config['fontOpacity']);
//  this.fontDecoration(config['fontDecoration']);
//  this.fontStyle(config['fontStyle']);
//  this.fontVariant(config['fontVariant']);
//  this.fontWeight(config['fontWeight']);
//  this.letterSpacing(config['letterSpacing']);
//  this.textDirection(config['textDirection']);
//  this.lineHeight(config['lineHeight']);
//  this.textIndent(config['textIndent']);
//  this.vAlign(config['vAlign']);
//  this.hAlign(config['hAlign']);
//  this.textWrap(config['textWrap']);
//  this.textOverflow(config['textOverflow']);
//  this.selectable(config['selectable']);
//  this.disablePointerEvents(config['disablePointerEvents']);
//  this.useHtml(config['useHtml']);
//};


//exports
anychart.core.ui.table.Base.prototype['fontSize'] = anychart.core.ui.table.Base.prototype.fontSize;//in docs/final
anychart.core.ui.table.Base.prototype['fontFamily'] = anychart.core.ui.table.Base.prototype.fontFamily;//in docs/final
anychart.core.ui.table.Base.prototype['fontColor'] = anychart.core.ui.table.Base.prototype.fontColor;//in docs/final
anychart.core.ui.table.Base.prototype['fontOpacity'] = anychart.core.ui.table.Base.prototype.fontOpacity;//in docs/final
anychart.core.ui.table.Base.prototype['fontDecoration'] = anychart.core.ui.table.Base.prototype.fontDecoration;//in docs/final
anychart.core.ui.table.Base.prototype['fontStyle'] = anychart.core.ui.table.Base.prototype.fontStyle;//in docs/final
anychart.core.ui.table.Base.prototype['fontVariant'] = anychart.core.ui.table.Base.prototype.fontVariant;//in docs/final
anychart.core.ui.table.Base.prototype['fontWeight'] = anychart.core.ui.table.Base.prototype.fontWeight;//in docs/final
anychart.core.ui.table.Base.prototype['letterSpacing'] = anychart.core.ui.table.Base.prototype.letterSpacing;//in docs/final
anychart.core.ui.table.Base.prototype['textDirection'] = anychart.core.ui.table.Base.prototype.textDirection;//in docs/final
anychart.core.ui.table.Base.prototype['lineHeight'] = anychart.core.ui.table.Base.prototype.lineHeight;//in docs/final
anychart.core.ui.table.Base.prototype['textIndent'] = anychart.core.ui.table.Base.prototype.textIndent;//in docs/final
anychart.core.ui.table.Base.prototype['vAlign'] = anychart.core.ui.table.Base.prototype.vAlign;//in docs/final
anychart.core.ui.table.Base.prototype['hAlign'] = anychart.core.ui.table.Base.prototype.hAlign;//in docs/final
anychart.core.ui.table.Base.prototype['textWrap'] = anychart.core.ui.table.Base.prototype.textWrap;//in docs/final
anychart.core.ui.table.Base.prototype['textOverflow'] = anychart.core.ui.table.Base.prototype.textOverflow;//in docs/final
anychart.core.ui.table.Base.prototype['selectable'] = anychart.core.ui.table.Base.prototype.selectable;//in docs/final
anychart.core.ui.table.Base.prototype['disablePointerEvents'] = anychart.core.ui.table.Base.prototype.disablePointerEvents;//in docs/final
anychart.core.ui.table.Base.prototype['useHtml'] = anychart.core.ui.table.Base.prototype.useHtml;//in docs/final
anychart.core.ui.table.Base.prototype['border'] = anychart.core.ui.table.Base.prototype.border;//doc|ex

