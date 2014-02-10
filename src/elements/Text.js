goog.provide('anychart.elements.Text');

goog.require('acgraphexport');
goog.require('anychart.elements.Base');



/**
 * Class is responsible for formatting the text. Processes the plain text and the text in html format.
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
 * Getter for full text appearance settings.
 * @return {!Object} A copy of settings object.
 *//**
 * Getter for all text appearance settings.<br/>
 * <b>Note:</b> Возвращает <b>undefined</b>, если имя настройки указано неверно.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings('fontFamily');
 * @param {string=} opt_name Наименование настройки.
 * @return {string|number|boolean|undefined} Значение указанной настройки.
 *//**
 * Setter for text appearance settings.<br/>
 * Overrides current text settings by passed settings object.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings({'fontFamily': 'Tahoma', 'color': 'red'});
 * @param {Object=} opt_objectWithSettings Объект с настройками. Полный объект выглядит так:
 * <code>   {
 *      'fontSize': smth,
 *      'fontFamily': smth,
 *      'fontColor': smth,
 *      'fontOpacity': smth,
 *      'fontDecoration': smth,
 *      'fontStyle': smth,
 *      'fontVariant': smth,
 *      'fontWeight': smth,
 *      'letterSpacing': smth,
 *      'direction': smth,
 *      'lineHeight': smth,
 *      'textIndent': smth,
 *      'vAlign': smth,
 *      'hAlign': smth,
 *      'textWrap': smth,
 *      'textOverflow': smth,
 *      'selectable': smth,
 *      'useHtml': smth
 *    }</code>
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * Setter for text appearance settings.<br/>
 * Overrides text setting Value by it's Name.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings('fontFamily', 'Tahoma');
 * @param {Object=} opt_name Наименование настройки.
 * @param {(string|number|boolean)=} opt_value Setting value.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get the whole object.
 * @param {(Object|string|number|boolean)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.elements.Text|Object|string|number|boolean)} A copy of settings or the Text for chaining.
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
 * Getter for text font size.
 * @return {string|number} Current font size.
 *//**
 * Setter for text font size.
 * @example <t>listingOnly</t>
 * someTextElement.fontSize('18px');
 * someTextElement.fontSize(18);
 * @param {string|number=} opt_value ['16px'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {string|number=} opt_value .
 * @return {!anychart.elements.Text|string|number} .
 */
anychart.elements.Text.prototype.fontSize = function(opt_value) {
  return /** @type {!anychart.elements.Text|string|number} */(this.textSettings('fontSize', opt_value));
};


/**
 * Getter for font family.
 * @return {string} Current font family.
 *//**
 * Setter for font family.
 * @example <t>listingOnly</t>
 * someTextElement.fontFamily('Tahoma');
 * @param {string=} opt_value ['Arial'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.elements.Text|string} .
 */
anychart.elements.Text.prototype.fontFamily = function(opt_value) {
  return /** @type {!anychart.elements.Text|string} */(this.textSettings('fontFamily', opt_value));
};


/**
 * Getter for text font color.
 * @return {string} Current font color.
 *//**
 * Setter for text font color.<br/>
 * {@link http://www.w3schools.com/html/html_colors.asp}
 * @example <t>listingOnly</t>
 * someTextElement.fontColor('rgba(200, 0, 15, .5)');
 * someTextElement.fontColor('red');
 * @param {string=} opt_value ['#000'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.elements.Text|string} .
 */
anychart.elements.Text.prototype.fontColor = function(opt_value) {
  return /** @type {!anychart.elements.Text|string} */(this.textSettings('fontColor', opt_value));
};


/**
 * Getter for text font opacity.
 * @return {number} Current font opacity.
 *//**
 * Setter for text font opacity.<br/>
 * Double value from 0 to 1.
 * @example <t>listingOnly</t>
 * someTextElement.fontOpacity(0.3);
 * @param {number=} opt_value [1] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.elements.Text|number} .
 */
anychart.elements.Text.prototype.fontOpacity = function(opt_value) {
  return /** @type {!anychart.elements.Text|number} */(this.textSettings('fontOpacity', opt_value));
};


/**
 * Getter for text font decoration.
 * @return {acgraph.vector.Text.Decoration|string} Current font decoration.
 *//**
 * Setter for text font decoration.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.fontDecoration('blink');
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value [{@link acgraph.vector.Text.Decoration}.NONE] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.Decoration} .
 */
anychart.elements.Text.prototype.fontDecoration = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.Decoration} */(this.textSettings('fontDecoration', opt_value));
};


/**
 * Getter for text font style.
 * @return {acgraph.vector.Text.FontStyle|string} Current font style.
 *//**
 * Setter for text font style.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.fontStyle('italic');
 * @param {(acgraph.vector.Text.FontStyle|string)=} opt_value [{@link acgraph.vector.Text.FontStyle}.NORMAL] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontStyle|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.FontStyle} .
 */
anychart.elements.Text.prototype.fontStyle = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.FontStyle} */(this.textSettings('fontStyle', opt_value));
};


/**
 * Getter for text font variant.
 * @return {acgraph.vector.Text.FontVariant|string} Current font variant.
 *//**
 * Setter for text font variant.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.FontVariant('small-caps');
 * @param {(acgraph.vector.Text.FontVariant|string)=} opt_value [{@link acgraph.vector.Text.FontVariant}.NORMAL] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontVariant|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.FontVariant} .
 */
anychart.elements.Text.prototype.fontVariant = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.FontVariant} */(this.textSettings('fontVariant', opt_value));
};


/**
 * Getter for text font weight.
 * @return {string|number} Current font weight.
 *//**
 * Setter for text font weight.<br/>
 * {@link http://www.w3schools.com/cssref/pr_font_weight.asp}
 * @example <t>listingOnly</t>
 * someTextElement.fontWeight(400);
 * someTextElement.fontWeight('bold');
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {!anychart.elements.Text|string|number} .
 */
anychart.elements.Text.prototype.fontWeight = function(opt_value) {
  return /** @type {!anychart.elements.Text|string|number} */(this.textSettings('fontWeight', opt_value));
};


/**
 * Getter for text letter spacing.
 * @return {string|number} Current letter spacing.
 *//**
 * Setter for text letter spacing.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @example <t>listingOnly</t>
 * someTextElement.letterSpacing('-4px');
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.elements.Text|number|string} .
 */
anychart.elements.Text.prototype.letterSpacing = function(opt_value) {
  return /** @type {!anychart.elements.Text|number|string} */(this.textSettings('letterSpacing', opt_value));
};


/**
 * Getter for text direction.
 * @return {acgraph.vector.Text.Direction|string} Current text direction.
 *//**
 * Setter for text direction.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.direction('rtl');
 * @param {(acgraph.vector.Text.Direction|string)=} opt_value [{@link acgraph.vector.Text.Direction}.LTR] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.Direction|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.Direction} .
 */
anychart.elements.Text.prototype.direction = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.Direction} */(this.textSettings('direction', opt_value));
};


/**
 * Getter for text line height.
 * @return {string|number} Current text line height.
 *//**
 * Setter for text line height.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @example <t>listingOnly</t>
 * someTextElement.lineHeight(14);
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.elements.Text|number|string} .
 */
anychart.elements.Text.prototype.lineHeight = function(opt_value) {
  return /** @type {!anychart.elements.Text|number|string} */(this.textSettings('lineHeight', opt_value));
};


/**
 * Getter for text indent.
 * @return {number} Current text indent.
 *//**
 * Setter for text indent.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textIndent(0.3);
 * @param {number=} opt_value [0] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.elements.Text|number} .
 */
anychart.elements.Text.prototype.textIndent = function(opt_value) {
  return /** @type {!anychart.elements.Text|number} */(this.textSettings('textIndent', opt_value));
};


/**
 * Getter for text vertical align.
 * @return {acgraph.vector.Text.VAlign|string} Current text vertical align.
 *//**
 * Setter for text vertical align.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.vAlign('middle');
 * @param {(acgraph.vector.Text.VAlign|string)=} opt_value [{@link acgraph.vector.Text.VAlign}.TOP] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.VAlign|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.VAlign} .
 */
anychart.elements.Text.prototype.vAlign = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.VAlign} */(this.textSettings('vAlign', opt_value));
};


/**
 * Getter for text horizontal align.
 * @return {acgraph.vector.Text.HAlign|string} Current text horizontal align.
 *//**
 * Setter for text horizontal align.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.hAlign('center');
 * @param {(acgraph.vector.Text.HAlign|string)=} opt_value [{@link acgraph.vector.Text.HAlign}.START] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.VAlign|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.HAlign} .
 */
anychart.elements.Text.prototype.hAlign = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.HAlign} */(this.textSettings('hAlign', opt_value));
};


/**
 * Getter for text wrap settings.
 * @return {acgraph.vector.Text.TextWrap|string} Current text wrap settings.
 *//**
 * Setter for text wrap settings.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textWrap('noWrap');
 * @param {(acgraph.vector.Text.TextWrap|string)=} opt_value [{@link acgraph.vector.Text.TextWrap}.BY_LETTER] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextWrap|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.TextWrap} .
 */
anychart.elements.Text.prototype.textWrap = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.TextWrap} */(this.textSettings('textWrap', opt_value));
};


/**
 * Getter for text overflow settings.
 * @return {acgraph.vector.Text.TextOverflow|string} Current text overflow settings.
 *//**
 * Setter for text overflow settings.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textOverflow(acgraph.vector.Text.TextOverflow.ELLIPSIS);
 * @param {(acgraph.vector.Text.TextOverflow|string)=} opt_value [{@link acgraph.vector.Text.TextOverflow}.CLIP] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value .
 * @return {!anychart.elements.Text|acgraph.vector.Text.TextOverflow} .
 */
anychart.elements.Text.prototype.textOverflow = function(opt_value) {
  return /** @type {!anychart.elements.Text|acgraph.vector.Text.TextOverflow} */(this.textSettings('textOverflow', opt_value));
};


/**
 * Getter for text selectable.
 * @return {boolean} Current text selectable.
 *//**
 * Setter for text selectable.<br/>
 * Данное свойство определяет восприимчивость текста к выделению. Если устанавливется <b>false</b>, то текст невозможно
 * будет выделить.
 * @example <t>listingOnly</t>
 * someTextElement.selectable(true);
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.elements.Text|boolean} .
 */
anychart.elements.Text.prototype.selectable = function(opt_value) {
  return /** @type {!anychart.elements.Text|boolean} */(this.textSettings('selectable', opt_value));
};


/**
 * Getter for flag useHTML.
 * @return {boolean} Current flag useHTML.
 *//**
 * Setter for flag useHTML.<br/>
 * Данное свойство определяет надо ли парсить HTML текст.
 * @example <t>listingOnly</t>
 * someTextElement.useHtml(true);
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.elements.Text} Экземпляр класса {@link anychart.elements.Text} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.elements.Text|boolean} .
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
    'textIndent': 0,
    'vAlign': acgraph.vector.Text.VAlign.TOP,
    'hAlign': acgraph.vector.Text.HAlign.START,
    'textWrap': acgraph.vector.Text.TextWrap.BY_LETTER,
    'textOverflow': acgraph.vector.Text.TextOverflow.CLIP,
    'selectable': false,
    'useHtml': false
  };
};
