goog.provide('anychart.elements.Text');

goog.require('acgraphexport');
goog.require('anychart.elements.Base');



/**
 *
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.Text = function() {
  goog.base(this);

  /**
   * Settings object.
   * @type {!Object}
   * @protected
   */
  this.settingsObj;

  /**
   * Contains flags for all settings that were changed.
   * @type {!Object.<boolean>}
   * @protected
   */
  this.changedSettings = {
  };

  /**
   * The enumeration of text settings that do not cause a PIXEL_BOUNDS invalidation both with APPEARANCE.
   * @type {Object.<boolean>}
   * @protected
   */
  this.notCauseBoundsChange = {
    'fontColor': true,
    'fontOpacity': true,
    'selectable': true
  };

  this.restoreDefaults();
  this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
};
goog.inherits(anychart.elements.Text, anychart.elements.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.utils.ConsistencyState.APPEARANCE |
        anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Gets or sets text appearance settings.
 * Can be called in 4 different ways:
 * 1) text.textSettings() - returns an object with all text settings by name.
 * 2) text.textSettings(name) - returns a value of asked text setting by its name.
 * 3) text.textSettings(object) - overrides current text settings by passed settings object.
 * 4) text.textSettings(name, value) - overrides text setting NAME with VALUE.
 * Note that if you ask for a text settings and it returns undefined than you probably misspelled the setting name.
 *
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get the whole object.
 * @param {(Object|string|number|boolean)=} opt_value Setting value if used as a setter.
 * @return {!anychart.elements.Text|!Object|string|number} A copy of settings or the Text for chaining.
 */
anychart.elements.Text.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (this.settingsObj[opt_objectOrName] != opt_value) {
          this.settingsObj[opt_objectOrName] = opt_value;
          this.changedSettings[opt_objectOrName] = true;
          if (opt_objectOrName in this.notCauseBoundsChange)
            this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
          else
            this.invalidate(anychart.utils.ConsistencyState.APPEARANCE | anychart.utils.ConsistencyState.PIXEL_BOUNDS);
        }
        return this;
      } else {
        return this.settingsObj[opt_objectOrName];
      }
    } else if (goog.isObject(opt_objectOrName)) {
      for (var item in opt_objectOrName) {
        this.textSettings(item, opt_objectOrName[item]);
      }
    }
    return this;
  }
  return goog.object.clone(this.settingsObj);
};


/**
 * Text font size.
 * @param {string|number=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|string|number} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontSize = function(opt_value) {
  return /** @type {!anychart.elements.Text|string|number} */(this.textSettings('fontSize', opt_value));
};


/**
 * Text font family.
 * @param {string=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|string} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontFamily = function(opt_value) {
  return /** @type {!anychart.elements.Text|string} */(this.textSettings('fontFamily', opt_value));
};


/**
 * Text font color.
 * @param {string=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|string} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontColor = function(opt_value) {
  return /** @type {!anychart.elements.Text|string} */(this.textSettings('fontColor', opt_value));
};


/**
 * Text font opacity.
 * @param {number=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|number} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontOpacity = function(opt_value) {
  return /** @type {!anychart.elements.Text|number} */(this.textSettings('fontOpacity', opt_value));
};


/**
 * Text font decoration.
 * @param {acgraph.vector.Text.Decoration=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.Decoration} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontDecoration = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.Decoration} */(this.textSettings('fontDecoration', opt_value));
};


/**
 * Text font style.
 * @param {acgraph.vector.Text.FontStyle=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.FontStyle} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontStyle = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.FontStyle} */(this.textSettings('fontStyle', opt_value));
};


/**
 * Text font variant.
 * @param {acgraph.vector.Text.FontVariant=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.FontVariant} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontVariant = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.FontVariant} */(this.textSettings('fontVariant', opt_value));
};


/**
 * Text font weight.
 * @param {(string|number)=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|string|number} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.fontWeight = function(opt_value) {
  return /** @type {!anychart.elements.Text|string|number} */(this.textSettings('fontWeight', opt_value));
};


/**
 * Text letter spacing.
 * @param {(number|string)=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|number|string} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.letterSpacing = function(opt_value) {
  return /** @type {!anychart.elements.Text|number|string} */(this.textSettings('letterSpacing', opt_value));
};


/**
 * Text direction.
 * @param {acgraph.vector.Text.Direction=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.Direction} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.direction = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.Direction} */(this.textSettings('direction', opt_value));
};


/**
 * Text line height.
 * @param {(number|string)=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|number|string} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.lineHeight = function(opt_value) {
  return /** @type {!anychart.elements.Text|number|string} */(this.textSettings('lineHeight', opt_value));
};


/**
 * Text indent.
 * @param {number=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|number} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.textIndent = function(opt_value) {
  return /** @type {!anychart.elements.Text|number} */(this.textSettings('textIndent', opt_value));
};


/**
 * Text vertical align.
 * @param {acgraph.vector.Text.VAlign=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.VAlign} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.vAlign = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.VAlign} */(this.textSettings('vAlign', opt_value));
};


/**
 * Text horizontal align.
 * @param {acgraph.vector.Text.HAlign=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.HAlign} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.hAlign = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.HAlign} */(this.textSettings('hAlign', opt_value));
};


/**
 * Text wrap settings.
 * @param {acgraph.vector.Text.TextWrap=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.TextWrap} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.textWrap = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.TextWrap} */(this.textSettings('textWrap', opt_value));
};


/**
 * Text overflow settings.
 * @param {acgraph.vector.Text.TextOverflow=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|acgraph.vector.Text.TextOverflow} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.textOverflow = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.TextOverflow} */(this.textSettings('textOverflow', opt_value));
};


/**
 * If the text is selectable.
 * @param {boolean=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|boolean} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.selectable = function(opt_value) {
  return /** @type {!anychart.elements.Text|boolean} */(this.textSettings('selectable', opt_value));
};


/**
 * If the text format should use HTML parsing.
 * @param {boolean=} opt_value Value to set if used as a setter.
 * @return {!anychart.elements.Text|boolean} Asked value or itself for chaining.
 */
anychart.elements.Text.prototype.useHtml = function(opt_value) {
  return /** @type {!anychart.elements.Text|boolean} */(this.textSettings('useHtml', opt_value));
};


/**
 * Applies known changes in settings.
 * @param {!acgraph.vector.Text} textElement Text element to apply settings to.
 * @param {boolean} isInitial If the text element needs initial settings appliance.
 * @protected
 */
anychart.elements.Text.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'fontSize' in this.changedSettings)
    textElement.fontSize(this.settingsObj['fontSize']);
  if (isInitial || 'fontFamily' in this.changedSettings)
    textElement.fontFamily(this.settingsObj['fontFamily']);
  if (isInitial || 'fontColor' in this.changedSettings)
    textElement.color(this.settingsObj['fontColor']);
  if (isInitial || 'direction' in this.changedSettings)
    textElement.direction(this.settingsObj['direction']);
  if ('fontOpacity' in this.changedSettings)
    textElement.opacity(this.settingsObj['fontOpacity']);
  if ('fontDecoration' in this.changedSettings)
    textElement.decoration(this.settingsObj['fontDecoration']);
  if ('fontStyle' in this.changedSettings)
    textElement.fontStyle(this.settingsObj['fontStyle']);
  if ('fontVariant' in this.changedSettings)
    textElement.fontVariant(this.settingsObj['fontVariant']);
  if ('fontWeight' in this.changedSettings)
    textElement.fontWeight(this.settingsObj['fontWeight']);
  if ('letterSpacing' in this.changedSettings)
    textElement.letterSpacing(this.settingsObj['letterSpacing']);
  if ('lineHeight' in this.changedSettings)
    textElement.lineHeight(this.settingsObj['lineHeight']);
  if ('textIndent' in this.changedSettings)
    textElement.textIndent(this.settingsObj['textIndent']);
  if ('vAlign' in this.changedSettings)
    textElement.vAlign(this.settingsObj['vAlign']);
  if ('hAlign' in this.changedSettings)
    textElement.hAlign(this.settingsObj['hAlign']);
  if ('textWrap' in this.changedSettings)
    textElement.textWrap(this.settingsObj['textWrap']);
  if ('textOverflow' in this.changedSettings)
    textElement.textOverflow(this.settingsObj['textOverflow']);
  if ('selectable' in this.changedSettings)
    textElement.selectable(this.settingsObj['selectable']);
};


/**
 * Restore text default settings.
 * @return {anychart.elements.Text} Returns itself for chaining call.
 */
anychart.elements.Text.prototype.restoreDefaults = function() {
  this.settingsObj = {
    'fontSize': goog.global['anychart']['fontSize'],
    'fontFamily': goog.global['anychart']['fontFamily'],
    'fontColor': goog.global['anychart']['fontColor'],
    'fontOpacity': 1,
    'fontDecoration': acgraph.vector.Text.Decoration.NONE,
    'fontStyle': acgraph.vector.Text.FontStyle.NORMAL,
    'fontVariant': acgraph.vector.Text.FontVariant.NORMAL,
    'fontWeight': 'normal',
    'letterSpacing': 'normal',
    'direction': goog.global['anychart']['textDirection'],
    'lineHeight': 'normal',
    'textIndent': '0px',
    'vAlign': acgraph.vector.Text.VAlign.TOP,
    'hAlign': acgraph.vector.Text.HAlign.START,
    'textWrap': acgraph.vector.Text.TextWrap.NO_WRAP,
    'textOverflow': acgraph.vector.Text.TextOverflow.CLIP,
    'selectable': false,
    'useHtml': false
  };
  return this;
};
