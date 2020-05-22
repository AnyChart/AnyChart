goog.provide('anychart.tableModule.elements.Base');
goog.provide('anychart.tableModule.elements.IProxyUser');
goog.require('acgraph');
goog.require('anychart.enums');
goog.require('anychart.tableModule.elements.Border');
goog.require('anychart.tableModule.elements.Padding');
goog.require('anychart.utils');
goog.require('goog.Disposable');


/**
 * Namespace anychart.tableModule.elements
 * @namespace
 * @name anychart.tableModule.elements
 */



/**
 * @interface
 */
anychart.tableModule.elements.IProxyUser = function() {
};


/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.tableModule.elements.IProxyUser|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.tableModule.elements.IProxyUser.prototype.settings = function(opt_name, opt_value, opt_state, opt_signal) {};



/**
 * Base class for Row, Column and Cell. Contains text settings and lazy settings object initialization.
 * Also knows about table, so it can send messages to the table.
 * @constructor
 * @param {!anychart.tableModule.Table} table
 * @extends {goog.Disposable}
 * @implements {anychart.tableModule.elements.IProxyUser}
 */
anychart.tableModule.elements.Base = function(table) {
  anychart.tableModule.elements.Base.base(this, 'constructor');

  /**
   * Table instance that created this instance.
   * @type {!anychart.tableModule.Table}
   * @protected
   */
  this.table = table;

  /**
   * Borders proxy object.
   * @type {anychart.tableModule.elements.Border}
   * @private
   */
  this.bordersProxy_ = null;

  /**
   * Paddings proxy object.
   * @type {anychart.tableModule.elements.Padding}}
   * @private
   */
  this.paddingProxy_ = null;
};
goog.inherits(anychart.tableModule.elements.Base, goog.Disposable);


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
 *  fontDecoration: (anychart.enums.TextDecoration|undefined),
 *  fontStyle: (anychart.enums.FontStyle|undefined),
 *  fontVariant: (anychart.enums.FontVariant|undefined),
 *  fontWeight: (string|number|undefined),
 *  letterSpacing: (string|number|undefined),
 *  textDirection: (anychart.enums.TextDirection|undefined),
 *  textShadow: (acgraph.vector.TextShadow|string|undefined),
 *  lineHeight: (string|number|undefined),
 *  textIndent: (number|undefined),
 *  vAlign: (anychart.enums.VAlign|undefined),
 *  hAlign: (anychart.enums.HAlign|undefined),
 *  wordWrap: (string|undefined),
 *  wordBreak: (string|undefined),
 *  textOverflow: (acgraph.vector.Text.TextOverflow|undefined),
 *  selectable: (boolean|undefined),
 *  disablePointerEvents: (boolean|undefined),
 *  useHtml: (boolean|undefined)
 * }}
 *
 * @type {!Object}
 */
anychart.tableModule.elements.Base.prototype.settingsObj;


/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.tableModule.elements.Base|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.tableModule.elements.Base.prototype.settings = function(opt_name, opt_value, opt_state, opt_signal) {
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
 * Getter/setter for fontSize.
 * @param {string|number=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string|number} .
 */
anychart.tableModule.elements.Base.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|string|number} */(this.settings('fontSize', opt_value));
};


/**
 * Getter/setter for fontFamily.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string} .
 */
anychart.tableModule.elements.Base.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|string} */(this.settings('fontFamily', opt_value));
};


/**
 * Getter/setter for fontColor.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string} .
 */
anychart.tableModule.elements.Base.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|string} */(this.settings('fontColor', opt_value));
};


/**
 * Getter/setter for fontOpacity.
 * @param {number=} opt_value .
 * @return {!anychart.tableModule.elements.Base|number} .
 */
anychart.tableModule.elements.Base.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.tableModule.elements.Base|number} */(this.settings('fontOpacity', opt_value));
};


/**
 * Getter/setter for fontDecoration.
 * @param {(anychart.enums.TextDecoration|string)=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.TextDecoration} .
 */
anychart.tableModule.elements.Base.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.TextDecoration} */(this.settings('fontDecoration', opt_value));
};


/**
 * Getter/setter for fontStyle.
 * @param {anychart.enums.FontStyle|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.FontStyle} .
 */
anychart.tableModule.elements.Base.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.FontStyle} */(this.settings('fontStyle', opt_value));
};


/**
 * Getter/setter for fontVariant.
 * @param {anychart.enums.FontVariant|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.FontVariant} .
 */
anychart.tableModule.elements.Base.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.FontVariant} */(this.settings('fontVariant', opt_value));
};


/**
 * Getter/setter for fontWeight.
 * @param {(string|number)=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string|number} .
 */
anychart.tableModule.elements.Base.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|string|number} */(this.settings('fontWeight', opt_value));
};


/**
 * Getter/setter for letterSpacing.
 * @param {(number|string)=} opt_value .
 * @return {!anychart.tableModule.elements.Base|number|string} .
 */
anychart.tableModule.elements.Base.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|number|string} */(this.settings('letterSpacing', opt_value));
};


/**
 * Getter/setter for textDirection.
 * @param {anychart.enums.TextDirection|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.TextDirection} .
 */
anychart.tableModule.elements.Base.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.TextDirection} */(this.settings('textDirection', opt_value));
};


/**
 * Getter/setter for textShadow.
 * @param {(acgraph.vector.TextShadow|string)=} opt_value - Text shadow settings.
 * @return {!anychart.tableModule.Table|string} - Chart instance or textShadow settings.
 */
anychart.tableModule.elements.Base.prototype.textShadow = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = acgraph.vector.normalizeTextShadow(opt_value);
  }
  return /** @type {!anychart.tableModule.Table|string} */(this.settings('textShadow', opt_value));
};


/**
 * Getter/setter for lineHeight.
 * @param {(number|string)=} opt_value .
 * @return {!anychart.tableModule.elements.Base|number|string} .
 */
anychart.tableModule.elements.Base.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|number|string} */(this.settings('lineHeight', opt_value));
};


/**
 * Getter/setter for textIndent.
 * @param {number=} opt_value .
 * @return {!anychart.tableModule.elements.Base|number} .
 */
anychart.tableModule.elements.Base.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.tableModule.elements.Base|number} */(this.settings('textIndent', opt_value));
};


/**
 * Getter/setter for vAlign.
 * @param {anychart.enums.VAlign|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.VAlign} .
 */
anychart.tableModule.elements.Base.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.VAlign} */(this.settings('vAlign', opt_value));
};


/**
 * Getter/setter for hAlign.
 * @param {anychart.enums.HAlign|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|anychart.enums.HAlign} .
 */
anychart.tableModule.elements.Base.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.tableModule.elements.Base|anychart.enums.HAlign} */(this.settings('hAlign', opt_value));
};


/**
 * Getter/setter for wordWrap.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string} .
 */
anychart.tableModule.elements.Base.prototype.wordWrap = function(opt_value) {
  return /** @type {!anychart.tableModule.elements.Base|string} */(this.settings('wordWrap', opt_value));
};


/**
 * Getter/setter for wordBreak.
 * @param {string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|string} .
 */
anychart.tableModule.elements.Base.prototype.wordBreak = function(opt_value) {
  return /** @type {!anychart.tableModule.elements.Base|string} */(this.settings('wordBreak', opt_value));
};


/**
 * Getter/setter for textOverflow.
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value .
 * @return {!anychart.tableModule.elements.Base|acgraph.vector.Text.TextOverflow} .
 */
anychart.tableModule.elements.Base.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.tableModule.elements.Base|acgraph.vector.Text.TextOverflow} */(this.settings('textOverflow', opt_value));
};


/**
 * Getter/setter for selectable.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.elements.Base|boolean} .
 */
anychart.tableModule.elements.Base.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.elements.Base|boolean} */(this.settings('selectable', opt_value));
};


/**
 * Getter/setter for disablePointerEvents.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.elements.Base|boolean} .
 */
anychart.tableModule.elements.Base.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.elements.Base|boolean} */(this.settings('disablePointerEvents', opt_value));
};


/**
 * Getter/setter for useHtml.
 * @param {boolean=} opt_value .
 * @return {!anychart.tableModule.elements.Base|boolean} .
 */
anychart.tableModule.elements.Base.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.tableModule.elements.Base|boolean} */(this.settings('useHtml', opt_value));
};


/**
 * Getter/setter for border.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.tableModule.elements.Base|anychart.tableModule.elements.Border} .
 */
anychart.tableModule.elements.Base.prototype.border = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.table.suspendSignalsDispatching();
    this.settings('border',
        /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    // we remove specific border settings to make common border settings work
    for (var i = 0; i < 4; i++)
      this.settings(anychart.tableModule.elements.Border.propNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.table.resumeSignalsDispatching(true);
    return this;
  }
  return this.bordersProxy_ || (this.bordersProxy_ = new anychart.tableModule.elements.Border(this, false));
};


/**
 * Cell padding settings. This method should be called padding() in Cell and cellPadding in Row and Column. So we call
 * if paddingInternal and make aliases to it.
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!anychart.tableModule.elements.Base|anychart.tableModule.elements.Padding} .
 * @protected
 */
anychart.tableModule.elements.Base.prototype.paddingInternal = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
    if (!argsLen) {
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
    this.settings(anychart.tableModule.elements.Padding.propNames[0], top, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[1], right, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[2], bottom, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.tableModule.elements.Padding.propNames[3], left, anychart.ConsistencyState.TABLE_CONTENT);
    this.table.resumeSignalsDispatching(true);
    return this;
  }
  return this.paddingProxy_ || (this.paddingProxy_ = new anychart.tableModule.elements.Padding(this));
};


///** @inheritDoc */
//anychart.tableModule.elements.Base.prototype.serialize = function() {
//  var json = anychart.tableModule.elements.Base.base(this, 'serialize');
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
//  if (goog.isDef(this.wordWrap())) json['wordWrap'] = this.wordWrap();
//  if (goog.isDef(this.wordBreak())) json['wordBreak'] = this.wordBreak();
//  if (goog.isDef(this.textOverflow())) json['textOverflow'] = this.textOverflow();
//  if (goog.isDef(this.selectable())) json['selectable'] = this.selectable();
//  if (goog.isDef(this.disablePointerEvents())) json['disablePointerEvents'] = this.disablePointerEvents();
//  if (goog.isDef(this.useHtml())) json['useHtml'] = this.useHtml();
//  return json;
//};
//
//
///** @inheritDoc */
//anychart.tableModule.elements.Base.prototype.setupByJSON = function(config) {
//  anychart.tableModule.elements.Base.base(this, 'setupByJSON', config);
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
//  this.wordWrap(config['wordWrap']);
//  this.wordBreak(config['wordBreak']);
//  this.textOverflow(config['textOverflow']);
//  this.selectable(config['selectable']);
//  this.disablePointerEvents(config['disablePointerEvents']);
//  this.useHtml(config['useHtml']);
//};


//exports
(function() {
  var proto = anychart.tableModule.elements.Base.prototype;
  proto['fontSize'] = proto.fontSize;//in docs/final
  proto['fontFamily'] = proto.fontFamily;//in docs/final
  proto['fontColor'] = proto.fontColor;//in docs/final
  proto['fontOpacity'] = proto.fontOpacity;//in docs/final
  proto['fontDecoration'] = proto.fontDecoration;//in docs/final
  proto['fontStyle'] = proto.fontStyle;//in docs/final
  proto['fontVariant'] = proto.fontVariant;//in docs/final
  proto['fontWeight'] = proto.fontWeight;//in docs/final
  proto['letterSpacing'] = proto.letterSpacing;//in docs/final
  proto['textDirection'] = proto.textDirection;//in docs/final
  proto['lineHeight'] = proto.lineHeight;//in docs/final
  proto['textIndent'] = proto.textIndent;//in docs/final
  proto['vAlign'] = proto.vAlign;//in docs/final
  proto['hAlign'] = proto.hAlign;//in docs/final
  proto['wordWrap'] = proto.wordWrap;//in docs/final
  proto['wordBreak'] = proto.wordBreak;//in docs/final
  proto['textOverflow'] = proto.textOverflow;//in docs/final
  proto['selectable'] = proto.selectable;//in docs/final
  proto['disablePointerEvents'] = proto.disablePointerEvents;//in docs/final
  proto['useHtml'] = proto.useHtml;//in docs/final
  proto['border'] = proto.border;//doc|ex
})();

