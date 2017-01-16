goog.provide('anychart.core.Text');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');



/**
 * This class is responsible of the text formatting, it processes the plain text and the text in HTML format.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.Text = function() {
  anychart.core.Text.base(this, 'constructor');

  /**
   * Settings object.
   * @type {!Object}
   * @protected
   */
  this.settingsObj = {};

  /**
   * Contains the flags for all settings that were changed.
   * @type {!Object.<boolean>}
   * @protected
   */
  this.changedSettings = {};

  /**
   * The enumeration of the text settings that do not cause PIXEL_BOUNDS invalidation both with APPEARANCE.
   * @type {Object.<boolean>}
   * @protected
   */
  this.notCauseBoundsChange = {
    'fontColor': true,
    'fontOpacity': true,
    'selectable': true,
    'disablePointerEvents': true
  };
};
goog.inherits(anychart.core.Text, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Getter/setter for textSettings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|Function)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.core.Text|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.core.Text.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (this.settingsObj[opt_objectOrName] != opt_value) {
          this.settingsObj[opt_objectOrName] = opt_value;
          this.changedSettings[opt_objectOrName] = true;
          var state = anychart.ConsistencyState.APPEARANCE;
          var signal = anychart.Signal.NEEDS_REDRAW;
          if (!(opt_objectOrName in this.notCauseBoundsChange)) {
            state |= anychart.ConsistencyState.BOUNDS;
            signal |= anychart.Signal.BOUNDS_CHANGED;
          }
          this.invalidate(state, signal);
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
 * Getter/setter for fontSize.
 * @param {string|number=} opt_value
 * @return {!anychart.core.Text|string|number}
 */
anychart.core.Text.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|string|number} */(this.textSettings('fontSize', opt_value));
};


/**
 * Getter/setter for fontFamily.
 * @param {string=} opt_value
 * @return {!anychart.core.Text|string}
 */
anychart.core.Text.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|string} */(this.textSettings('fontFamily', opt_value));
};


/**
 * Getter/setter for fontColor.
 * @param {string=} opt_value
 * @return {!anychart.core.Text|string}
 */
anychart.core.Text.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|string} */(this.textSettings('fontColor', opt_value));
};


/**
 * Getter/setter for fontOpacity.
 * @param {number=} opt_value
 * @return {!anychart.core.Text|number}
 */
anychart.core.Text.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.core.Text|number} */(this.textSettings('fontOpacity', opt_value));
};


/**
 * Getter/setter for fontDecoration.
 * @param {(anychart.enums.TextDecoration|string)=} opt_value
 * @return {!anychart.core.Text|anychart.enums.TextDecoration}
 */
anychart.core.Text.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.TextDecoration} */(this.textSettings('fontDecoration', opt_value));
};


/**
 * Getter/setter for fontStyle.
 * @param {anychart.enums.FontStyle|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.FontStyle}
 */
anychart.core.Text.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.FontStyle} */(this.textSettings('fontStyle', opt_value));
};


/**
 * Getter/setter for fontVariant.
 * @param {anychart.enums.FontVariant|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.FontVariant}
 */
anychart.core.Text.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.FontVariant} */(this.textSettings('fontVariant', opt_value));
};


/**
 * Getter/setter for fontWeight.
 * @param {(string|number)=} opt_value
 * @return {!anychart.core.Text|string|number}
 */
anychart.core.Text.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|string|number} */(this.textSettings('fontWeight', opt_value));
};


/**Getter/setter for letterSpacing.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.Text|number|string}
 */
anychart.core.Text.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|number|string} */(this.textSettings('letterSpacing', opt_value));
};


/**
 * Getter/setter for textDirection.
 * @param {anychart.enums.TextDirection|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.TextDirection}
 */
anychart.core.Text.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.TextDirection} */(this.textSettings('textDirection', opt_value));
};


/**
 * Getter/setter for lineHeight.
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.Text|number|string}
 */
anychart.core.Text.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|number|string} */(this.textSettings('lineHeight', opt_value));
};


/**
 * Getter/setter for textIndent.
 * @param {number=} opt_value
 * @return {!anychart.core.Text|number}
 */
anychart.core.Text.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.core.Text|number} */(this.textSettings('textIndent', opt_value));
};


/**
 * Getter/setter for vAlign.
 * @param {anychart.enums.VAlign|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.VAlign}
 */
anychart.core.Text.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.VAlign} */(this.textSettings('vAlign', opt_value));
};


/**
 * Getter/setter for hAlign.
 * @param {anychart.enums.HAlign|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.HAlign}
 */
anychart.core.Text.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.HAlign} */(this.textSettings('hAlign', opt_value));
};


/**
 * Getter/setter for textWrap.
 * @param {anychart.enums.TextWrap|string=} opt_value
 * @return {!anychart.core.Text|anychart.enums.TextWrap}
 */
anychart.core.Text.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextWrap(opt_value);
  }
  return /** @type {!anychart.core.Text|anychart.enums.TextWrap} */(this.textSettings('textWrap', opt_value));
};


/**
 * Getter/setter for textOverflow.
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.TextOverflow}
 */
anychart.core.Text.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|acgraph.vector.Text.TextOverflow} */(this.textSettings('textOverflow', opt_value));
};


/**
 * Getter/setter for selectable.
 * @param {boolean=} opt_value
 * @return {!anychart.core.Text|boolean}
 */
anychart.core.Text.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.Text|boolean} */(this.textSettings('selectable', opt_value));
};


/**
 * Pointer events.
 * @param {boolean=} opt_value
 * @return {!anychart.core.Text|boolean}
 */
anychart.core.Text.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.Text|boolean} */(this.textSettings('disablePointerEvents', opt_value));
};


/**
 * Getter/setter for useHtml.
 * @param {boolean=} opt_value
 * @return {!anychart.core.Text|boolean}
 */
anychart.core.Text.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.Text|boolean} */(this.textSettings('useHtml', opt_value));
};


/**
 * Applies known changes in settings.
 * @param {!acgraph.vector.Text} textElement Text element to apply settings to.
 * @param {boolean} isInitial If the text element needs initial settings application.
 * @protected
 */
anychart.core.Text.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'fontSize' in this.changedSettings)
    textElement.fontSize(this.settingsObj['fontSize']);
  if (isInitial || 'fontFamily' in this.changedSettings)
    textElement.fontFamily(this.settingsObj['fontFamily']);
  if (isInitial || 'fontColor' in this.changedSettings)
    textElement.color(/** @type {string} */(this.fontColor()));
  if (isInitial || 'textDirection' in this.changedSettings)
    textElement.direction(this.settingsObj['textDirection']);
  if (isInitial || 'textWrap' in this.changedSettings)
    textElement.textWrap(this.settingsObj['textWrap']);
  if ('fontOpacity' in this.changedSettings)
    textElement.opacity(this.settingsObj['fontOpacity']);
  if ('fontDecoration' in this.changedSettings)
    textElement.decoration(this.settingsObj['fontDecoration']);
  if (isInitial || 'fontStyle' in this.changedSettings)
    textElement.fontStyle(this.settingsObj['fontStyle']);
  if ('fontVariant' in this.changedSettings)
    textElement.fontVariant(this.settingsObj['fontVariant']);
  if (isInitial || 'fontWeight' in this.changedSettings)
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
  if ('textOverflow' in this.changedSettings)
    textElement.textOverflow(this.settingsObj['textOverflow']);
  if (isInitial || 'selectable' in this.changedSettings)
    textElement.selectable(this.settingsObj['selectable']);
  if (isInitial || 'disablePointerEvents' in this.changedSettings)
    textElement.disablePointerEvents(!!this.settingsObj['disablePointerEvents']);
};


/** @inheritDoc */
anychart.core.Text.prototype.serialize = function() {
  var json = anychart.core.Text.base(this, 'serialize');
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
anychart.core.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.Text.base(this, 'setupByJSON', config, opt_default);
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
(function() {
  var proto = anychart.core.Text.prototype;
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
  proto['textWrap'] = proto.textWrap;//in docs/final
  proto['textOverflow'] = proto.textOverflow;//in docs/final
  proto['selectable'] = proto.selectable;//in docs/final
  proto['disablePointerEvents'] = proto.disablePointerEvents;//in docs/final
  proto['useHtml'] = proto.useHtml;//in docs/final
  proto['textSettings'] = proto.textSettings;//in docs/final
})();
