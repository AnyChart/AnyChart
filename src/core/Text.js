goog.provide('anychart.core.Text');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');



/**
 * This class is responsible of the text formatting, it processes the plain text and the text in HTML format.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.Text = function() {
  goog.base(this);

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
 * Getter for the full text appearance settings.
 * @return {!Object} A copy of settings object.
 *//**
 * Getter for all text appearance settings.<br/>
 * <b>Note:</b> Returns <b>undefined</b> if the name of the setting is wrong.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings('fontFamily');
 * @param {string=} opt_name Setting name.
 * @return {string|number|boolean|undefined} Value of the setting.
 *//**
 * Setter for text appearance settings.<br/>
 * Overrides current text settings by passed settings object.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings({'fontFamily': 'Tahoma', 'fontColor': 'red'});
 * @param {Object=} opt_objectWithSettings Settings object. Complete object looks like this:
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
 *      'textDirection': smth,
 *      'lineHeight': smth,
 *      'textIndent': smth,
 *      'vAlign': smth,
 *      'hAlign': smth,
 *      'textWrap': smth,
 *      'textOverflow': smth,
 *      'selectable': smth,
 *      'useHtml': smth
 *    }</code>.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * Setter for the text appearance settings.<br/>
 * Overrides text setting Value by its Name.
 * @example <t>listingOnly</t>
 * someTextElement.textSettings('fontFamily', 'Tahoma');
 * @param {Object=} opt_name Setting name.
 * @param {(string|number|boolean)=} opt_value Setting value.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean)=} opt_value Setting value if used as a setter.
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
 * Getter for text font size.
 * @return {string|number} Current font size.
 *//**
 * Setter for text font size.
 * @example <t>listingOnly</t>
 * someTextElement.fontSize('18px');
 * someTextElement.fontSize(18);
 * @param {string|number=} opt_value ['16px'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string|number=} opt_value
 * @return {!anychart.core.Text|string|number}
 */
anychart.core.Text.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|string|number} */(this.textSettings('fontSize', opt_value));
};


/**
 * Getter for the font family.
 * @return {string} The current font family.
 *//**
 * Setter for font family.
 * @example <t>listingOnly</t>
 * someTextElement.fontFamily('Tahoma');
 * @param {string=} opt_value ['Arial'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value
 * @return {!anychart.core.Text|string}
 */
anychart.core.Text.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|string} */(this.textSettings('fontFamily', opt_value));
};


/**
 * Getter for the text font color.
 * @return {string} The current font color.
 *//**
 * Setter for the text font color.<br/>
 * {@link http://www.w3schools.com/html/html_colors.asp}
 * @example <t>listingOnly</t>
 * someTextElement.fontColor('rgba(200, 0, 15, .5)');
 * someTextElement.fontColor('red');
 * @param {string=} opt_value ['#000'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value
 * @return {!anychart.core.Text|string}
 */
anychart.core.Text.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|string} */(this.textSettings('fontColor', opt_value));
};


/**
 * Getter for the text font opacity.
 * @return {number} The current font opacity.
 *//**
 * Setter for the text font opacity.<br/>
 * Double value from 0 to 1.
 * @example <t>listingOnly</t>
 * someTextElement.fontOpacity(0.3);
 * @param {number=} opt_value [1] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value
 * @return {!anychart.core.Text|number}
 */
anychart.core.Text.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.core.Text|number} */(this.textSettings('fontOpacity', opt_value));
};


/**
 * Getter for the text font decoration.
 * @return {acgraph.vector.Text.Decoration|string} The current font decoration.
 *//**
 * Setter for the text font decoration.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.fontDecoration('blink');
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value [{@link acgraph.vector.Text.Decoration}.NONE] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.Decoration}
 */
anychart.core.Text.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.Decoration} */(this.textSettings('fontDecoration', opt_value));
};


/**
 * Getter for the text font style.
 * @return {acgraph.vector.Text.FontStyle|string} The current font style.
 *//**
 * Setter for the text font style.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.fontStyle('italic');
 * @param {(acgraph.vector.Text.FontStyle|string)=} opt_value [{@link acgraph.vector.Text.FontStyle}.NORMAL] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontStyle|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.FontStyle}
 */
anychart.core.Text.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.FontStyle} */(this.textSettings('fontStyle', opt_value));
};


/**
 * Getter for the text font variant.
 * @return {acgraph.vector.Text.FontVariant|string} The current font variant.
 *//**
 * Setter for the text font variant.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.FontVariant('small-caps');
 * @param {(acgraph.vector.Text.FontVariant|string)=} opt_value [{@link acgraph.vector.Text.FontVariant}.NORMAL] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontVariant|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.FontVariant}
 */
anychart.core.Text.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.FontVariant} */(this.textSettings('fontVariant', opt_value));
};


/**
 * Getter for the text font weight.
 * @return {string|number} The current font weight.
 *//**
 * Setter for the text font weight.<br/>
 * {@link http://www.w3schools.com/cssref/pr_font_weight.asp}
 * @example <t>listingOnly</t>
 * someTextElement.fontWeight(400);
 * someTextElement.fontWeight('bold');
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value
 * @return {!anychart.core.Text|string|number}
 */
anychart.core.Text.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|string|number} */(this.textSettings('fontWeight', opt_value));
};


/**
 * Getter for the text letter spacing.
 * @return {string|number} The current letter spacing.
 *//**
 * Setter for the text letter spacing.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @example <t>listingOnly</t>
 * someTextElement.letterSpacing('-4px');
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.Text|number|string}
 */
anychart.core.Text.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|number|string} */(this.textSettings('letterSpacing', opt_value));
};


/**
 * Getter for the text direction.
 * @return {acgraph.vector.Text.Direction|string} Current text direction.
 *//**
 * Setter for the text direction.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textDirection('rtl');
 * @param {(acgraph.vector.Text.Direction|string)=} opt_value [{@link acgraph.vector.Text.Direction}.LTR] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.Direction|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.Direction}
 */
anychart.core.Text.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.Direction} */(this.textSettings('textDirection', opt_value));
};


/**
 * Getter for the text line height.
 * @return {string|number} The current text line height.
 *//**
 * Setter for the text line height.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @example <t>listingOnly</t>
 * someTextElement.lineHeight(14);
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value
 * @return {!anychart.core.Text|number|string}
 */
anychart.core.Text.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.Text|number|string} */(this.textSettings('lineHeight', opt_value));
};


/**
 * Getter for the text indent.
 * @return {number} The current text indent.
 *//**
 * Setter for the text indent.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textIndent(0.3);
 * @param {number=} opt_value [0] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value
 * @return {!anychart.core.Text|number}
 */
anychart.core.Text.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.core.Text|number} */(this.textSettings('textIndent', opt_value));
};


/**
 * Getter for the text vertical align.
 * @return {acgraph.vector.Text.VAlign|string} The current text vertical align.
 *//**
 * Setter for the text vertical align.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.vAlign('middle');
 * @param {(acgraph.vector.Text.VAlign|string)=} opt_value [{@link acgraph.vector.Text.VAlign}.TOP] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.VAlign|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.VAlign}
 */
anychart.core.Text.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.VAlign} */(this.textSettings('vAlign', opt_value));
};


/**
 * Getter for the text horizontal align.
 * @return {acgraph.vector.Text.HAlign|string} Th current text horizontal align.
 *//**
 * Setter for the text horizontal align.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.hAlign('center');
 * @param {(acgraph.vector.Text.HAlign|string)=} opt_value [{@link acgraph.vector.Text.HAlign}.START] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.HAlign|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.HAlign}
 */
anychart.core.Text.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.HAlign} */(this.textSettings('hAlign', opt_value));
};


/**
 * Getter for the text wrap settings.
 * @return {acgraph.vector.Text.TextWrap|string} Th current text wrap settings.
 *//**
 * Setter for the text wrap settings.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textWrap('noWrap');
 * @param {(acgraph.vector.Text.TextWrap|string)=} opt_value [{@link acgraph.vector.Text.TextWrap}.BY_LETTER] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextWrap|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.TextWrap}
 */
anychart.core.Text.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextWrap(opt_value);
  }
  return /** @type {!anychart.core.Text|acgraph.vector.Text.TextWrap} */(this.textSettings('textWrap', opt_value));
};


/**
 * Getter for the text overflow settings.
 * @return {acgraph.vector.Text.TextOverflow|string} The current text overflow settings.
 *//**
 * Setter for the text overflow settings.<br/>
 * @example <t>listingOnly</t>
 * someTextElement.textOverflow(acgraph.vector.Text.TextOverflow.ELLIPSIS);
 * @param {(acgraph.vector.Text.TextOverflow|string)=} opt_value [{@link acgraph.vector.Text.TextOverflow}.CLIP] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value
 * @return {!anychart.core.Text|acgraph.vector.Text.TextOverflow}
 */
anychart.core.Text.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.Text|acgraph.vector.Text.TextOverflow} */(this.textSettings('textOverflow', opt_value));
};


/**
 * Getter for the text selectable option.
 * @return {boolean} The current text selectable option.
 *//**
 * Setter for the text selectable.<br/>
 * This options defines whether the text can be selected. If set to <b>false</b> one can't select the text.
 * @example <t>listingOnly</t>
 * someTextElement.selectable(true);
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for the useHTML flag.
 * @return {boolean} The current value of useHTML flag.
 *//**
 * Setter for flag useHTML.<br/>
 * This property defines whether HTML text should be parsed.
 * @example <t>listingOnly</t>
 * someTextElement.useHtml(true);
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.Text} An instance of {@link anychart.core.Text} class for method chaining.
 *//**
 * @ignoreDoc
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
  var json = goog.base(this, 'serialize');
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
anychart.core.Text.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
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
anychart.core.Text.prototype['fontSize'] = anychart.core.Text.prototype.fontSize;//in docs/final
anychart.core.Text.prototype['fontFamily'] = anychart.core.Text.prototype.fontFamily;//in docs/final
anychart.core.Text.prototype['fontColor'] = anychart.core.Text.prototype.fontColor;//in docs/final
anychart.core.Text.prototype['fontOpacity'] = anychart.core.Text.prototype.fontOpacity;//in docs/final
anychart.core.Text.prototype['fontDecoration'] = anychart.core.Text.prototype.fontDecoration;//in docs/final
anychart.core.Text.prototype['fontStyle'] = anychart.core.Text.prototype.fontStyle;//in docs/final
anychart.core.Text.prototype['fontVariant'] = anychart.core.Text.prototype.fontVariant;//in docs/final
anychart.core.Text.prototype['fontWeight'] = anychart.core.Text.prototype.fontWeight;//in docs/final
anychart.core.Text.prototype['letterSpacing'] = anychart.core.Text.prototype.letterSpacing;//in docs/final
anychart.core.Text.prototype['textDirection'] = anychart.core.Text.prototype.textDirection;//in docs/final
anychart.core.Text.prototype['lineHeight'] = anychart.core.Text.prototype.lineHeight;//in docs/final
anychart.core.Text.prototype['textIndent'] = anychart.core.Text.prototype.textIndent;//in docs/final
anychart.core.Text.prototype['vAlign'] = anychart.core.Text.prototype.vAlign;//in docs/final
anychart.core.Text.prototype['hAlign'] = anychart.core.Text.prototype.hAlign;//in docs/final
anychart.core.Text.prototype['textWrap'] = anychart.core.Text.prototype.textWrap;//in docs/final
anychart.core.Text.prototype['textOverflow'] = anychart.core.Text.prototype.textOverflow;//in docs/final
anychart.core.Text.prototype['selectable'] = anychart.core.Text.prototype.selectable;//in docs/final
anychart.core.Text.prototype['disablePointerEvents'] = anychart.core.Text.prototype.disablePointerEvents;//in docs/final
anychart.core.Text.prototype['useHtml'] = anychart.core.Text.prototype.useHtml;//in docs/final
anychart.core.Text.prototype['textSettings'] = anychart.core.Text.prototype.textSettings;//in docs/final
