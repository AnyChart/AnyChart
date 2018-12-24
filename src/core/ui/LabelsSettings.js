goog.provide('anychart.core.ui.LabelsSettings');


//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');

goog.require('goog.cssom');



//endregion
//region -- Constructor.
/**
 * Labels settings simple storage.
 *
 * DEVELOPER NOTES:
 * Factory contains the following types of settings:
 *  - Settings that must be applied to text, but don't change
 *    the text's bounds (fontColor, opacity).
 *  - Settings that must be applied to text and change the
 *    text's bounds (format, fontSize, fontFamily, etc...)
 *  - Settings that must not be applied to text itself, don't
 *    change the text's bound, but affect for example text
 *    positioning (anchor, padding, etc...)
 *  Depending on one if these characteristics, different signals are dispatched.
 *
 * DEVELOPER NOTES:
 * Try to flatten settings before multiple labelsSettings.getOption(...) usage.
 * Getting value from flat object is faster than the getOption() resolving.
 *
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.core.ui.LabelsSettings = function() {
  anychart.core.ui.LabelsSettings.base(this, 'constructor');

  /**
   * TODO (A.Kudryavtsev): Add typedef?
   * @type {?Object}
   * @private
   */
  this.flatSettings_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * Parent labels settings (@see anychart.core.settings.IResolvable)
   * @type {?anychart.core.ui.LabelsSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * Padding settings.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Dummy background. Not supported.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * CSS class.
   * @type {string}
   * @const
   */
  this.cssClass = anychart.core.ui.LabelsSettings.CSS_CLASS_PREFIX + goog.getUid(this);

  /**
   * CSS Style element cache. Not used for a while.
   * @type {Element}
   */
  this.styleElement = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['adjustFontSize', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['fontVariant', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['letterSpacing', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['textDirection', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['textIndent', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['textOverflow', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['useHtml', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['wordBreak', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['wordWrap', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['fontColor', 0, anychart.Signal.NEEDS_REDRAW, 0, this.resetFlatSettings], //Doesn't affect bounds.
    ['fontDecoration', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['fontFamily', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['fontOpacity', 0, anychart.Signal.NEEDS_REDRAW, 0, this.resetFlatSettings], //Doesn't affect bounds.
    ['fontSize', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['fontStyle', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['fontWeight', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['hAlign', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['lineHeight', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['maxFontSize', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['minFontSize', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['vAlign', 0, anychart.Signal.NEEDS_REDRAW, 0, this.resetFlatSettings],
    ['anchor', 0, anychart.Signal.NEEDS_REAPPLICATION, 0], //Has no BOUNDS_CHANGED because affects only positioning, not bounds.
    ['height', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['offsetX', 0, anychart.Signal.NEEDS_REAPPLICATION, 0], //Has no BOUNDS_CHANGED because affects only positioning, not bounds.
    ['offsetY', 0, anychart.Signal.NEEDS_REAPPLICATION, 0], //Has no BOUNDS_CHANGED because affects only positioning, not bounds.
    ['position', 0, anychart.Signal.NEEDS_REAPPLICATION, 0], //Has no BOUNDS_CHANGED because affects only positioning, not bounds.
    ['rotation', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['width', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['allowMultiline', 0, anychart.Signal.BOUNDS_CHANGED, 0, this.resetFlatSettings],
    ['zIndex', 0, 0], //TODO (A.Kudryavtsev): Not supported for a while.
    ['clip', 0, 0] ////TODO (A.Kudryavtsev): Not supported for a while.
  ]);

  this.addThemes('defaultSimpleLabelsSettings');
};
goog.inherits(anychart.core.ui.LabelsSettings, anychart.core.Base);


//endregion
//region -- Static.
/**
 * CSS class prefix.
 * @type {string}
 */
anychart.core.ui.LabelsSettings.CSS_CLASS_PREFIX = 'anychart-labels-settings-';


//endregion
//region -- Signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LabelsSettings.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW | // Regular redraw, no bounds affecting changes.
    anychart.Signal.BOUNDS_CHANGED | // Settings that affect the text bounds only.
    anychart.Signal.NEEDS_REAPPLICATION; // Settings not related to text itself (like padding).


//endregion
//region -- Descriptors.
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'adjustFontSize', anychart.core.settings.adjustFontSizeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontVariant', anychart.enums.normalizeFontVariant],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'letterSpacing', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textDirection', anychart.enums.normalizeTextDirection],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textIndent', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textOverflow', anychart.core.settings.boolOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'useHtml', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordBreak', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordWrap', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hAlign', anychart.enums.normalizeHAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'lineHeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minFontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxFontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'vAlign', anychart.enums.normalizeVAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizePosition],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zIndex', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowMultiline', anychart.core.settings.boolOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LabelsSettings, anychart.core.ui.LabelsSettings.DESCRIPTORS);


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent object.
 * @param {anychart.core.ui.LabelsSettings=} opt_value - Parent to set.
 * @return {anychart.core.ui.LabelsSettings}
 */
anychart.core.ui.LabelsSettings.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (goog.isNull(opt_value)) { //removing parent tooltip.
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.padding().parent(null);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.padding().parent(this.parent_.padding());
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.ui.LabelsSettings.prototype.parentInvalidated_ = function(e) {
  this.dispatchSignal(e.signals);
};


//endregion
//region -- IResolvable implementation
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.LabelsSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Private API.
/**
 * Sets flat settings cache to null.
 */
anychart.core.ui.LabelsSettings.prototype.resetFlatSettings = function() {
  this.flatSettings_ = null;
  // this.installStyle();
};


/**
 * Gets CSS string.
 * @return {string}
 * @private
 */
anychart.core.ui.LabelsSettings.prototype.getCssString_ = function() {
  var cssString = '.' + this.cssClass + '{';
  var style = this.flatten();
  if (style['fontStyle']) {
    cssString += 'font-style: ' + style['fontStyle'] + ';';
  }

  if (style['fontVariant']) {
    cssString += 'font-variant: ' + style['fontVariant'] + ';';
  }

  if (style['fontFamily']) {
    cssString += 'font-family: ' + style['fontFamily'] + ';';
  }

  if (style['fontSize']) {
    cssString += 'font-size: ' + style['fontSize'] + 'px;';
  }

  if (style['fontWeight']) {
    cssString += 'font-weight: ' + style['fontWeight'] + ';';
  }

  if (style['letterSpacing']) {
    cssString += 'letter-spacing: ' + style['letterSpacing'] + ';';
  }

  if (style['fontDecoration']) {
    cssString += 'text-decoration: ' + style['fontDecoration'] + ';';
  }

  if (style['fontColor']) {
    cssString += 'fill: ' + style['fontColor'] + ';';
  }

  if (style['fontOpacity']) {
    cssString += 'opacity: ' + style['fontOpacity'] + ';';
  }

  if (style['disablePointerEvents']) {
    cssString += 'pointer-events: ' + (style['disablePointerEvents'] ? 'none' : '') + ';';
  }

  cssString += '}';
  return cssString;
};


/**
 * Sets flat settings cache to null.
 * NOTE: This method installs simple CSS style to <head> of page.
 *  That's why it breaks texts when server-exporting is used:
 *  export server gets just SVG-string, it doesn't know anything
 *  about CSS of page.
 *  Looks like a very beautiful feature (it's easier to modify style
 *  and perform browser update instead of passing through the texts
 *  and update text settings).
 *  But server exporting breaks this beauty.
 */
anychart.core.ui.LabelsSettings.prototype.installStyle = function() {
  var cssString = this.getCssString_();
  if (this.styleElement) {
    this.styleElement.innerHTML = cssString;
  } else {
    this.styleElement = goog.cssom.addCssText(cssString);
  }
};


//endregion
//region -- Developer API.
/**
 * Returns merged flat settings object.
 * @return {!Object}
 */
anychart.core.ui.LabelsSettings.prototype.flatten = function() {
  if (!this.flatSettings_) {
    this.flatSettings_ = {};
    for (var key in anychart.core.ui.LabelsSettings.DESCRIPTORS) {
      if (anychart.core.ui.LabelsSettings.DESCRIPTORS.hasOwnProperty(key)) {
        this.flatSettings_[key] = this.getOption(key);
      }
    }
  }
  return /** @type {!Object} */ (this.flatSettings_);
};


/**
 * Call formatter to get text value by context.
 * @param {anychart.format.Context} context - Context.
 * @return {string} - Formatted text.
 */
anychart.core.ui.LabelsSettings.prototype.getText = function(context) {
  var format = /** @type {string|Function} */(this.getOption('format') || anychart.utils.DEFAULT_FORMATTER);
  if (goog.isString(format))
    format = anychart.core.utils.TokenParser.getInstance().getFormat(format);
  var val = format.call(context, context);
  val = goog.isDef(val) ? String(val) : '';
  return val;
};


/**
 * Checks whether the text cannot be placed correctly without bounds calculation.
 * @return {boolean} - If text needs bounds calculation to be placed correctly.
 */
anychart.core.ui.LabelsSettings.prototype.needsBoundsCalculation = function() {
  return (this.considerHAlign() || this.considerWordWrap() || this.considerTextOverflow() || this.considerWordBreak());
};


/**
 * Checks whether texts needs to calculate its bounds because of hAlign option value.
 * @return {boolean}
 */
anychart.core.ui.LabelsSettings.prototype.considerHAlign = function() {
  var conf = this.flatten();
  var widthIsSet = goog.isDefAndNotNull(conf['width']);
  return widthIsSet && conf['hAlign'] != acgraph.vector.Text.HAlign.LEFT;
};


/**
 * Checks whether texts needs consider hAlign for positioning purposes.
 * @return {boolean}
 */
anychart.core.ui.LabelsSettings.prototype.considerVAlign = function() {
  var conf = this.flatten();
  var heightIsSet = goog.isDefAndNotNull(conf['height']);
  return heightIsSet && conf['vAlign'] != acgraph.vector.Text.VAlign.TOP;
};


/**
 * Checks whether texts needs to calculate its bounds because of wordWrap option value.
 * @return {boolean}
 */
anychart.core.ui.LabelsSettings.prototype.considerWordWrap = function() {
  var conf = this.flatten();
  var widthIsSet = goog.isDefAndNotNull(conf['width']);
  return widthIsSet && conf['wordWrap'] == anychart.enums.WordWrap.BREAK_WORD;
};


/**
 * Checks whether texts needs to calculate its bounds because of wordBreak option value.
 * @return {boolean}
 */
anychart.core.ui.LabelsSettings.prototype.considerWordBreak = function() {
  var conf = this.flatten();
  var widthIsSet = goog.isDefAndNotNull(conf['width']);
  return widthIsSet && conf['wordBreak'];
};


/**
 * Checks whether texts needs to calculate its bounds because of textOverflow option value.
 * @return {boolean}
 */
anychart.core.ui.LabelsSettings.prototype.considerTextOverflow = function() {
  var conf = this.flatten();
  var widthIsSet = goog.isDefAndNotNull(conf['width']);
  return widthIsSet && conf['textOverflow'];
};


//endregion
//region -- Public API.
/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.ui.LabelsSettings|anychart.core.utils.Padding} .
 */
anychart.core.ui.LabelsSettings.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.setupCreated('padding', this.padding_);
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 *
 * @param {anychart.SignalEvent} e - Signal event, yours, captain Obvious.
 * @private
 */
anychart.core.ui.LabelsSettings.prototype.paddingInvalidated_ = function(e) {
  /*
    One more time:
    padding doesn't affect the bounds of whole text and there's no need to
    make Measuriator remeasure text's bounds.
    It also doesn't need to reapply any on text settings, it's a signal for
    LabelsSettings holder to reposition the labels.
    That's why dispatches NEEDS_REAPPLICATION without BOUNDS_CHANGED or NEEDS_REDRAW.
   */
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * Dummy background to avoid console blood.
 * TODO (A.Kudryavtsev): NOT SUPPORTED for a while.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsSettings|anychart.core.ui.Background)} Returns the background or itself for chaining.
 */
anychart.core.ui.LabelsSettings.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
  }

  if (goog.isDef(opt_value)) {
    return this;
  }
  return this.background_;
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.LabelsSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.LabelsSettings.DESCRIPTORS, config, opt_default);
  this.padding().setupInternal(!!opt_default, config['padding']);
  // if ('padding' in config)
  //   this.padding(config['padding']);
};


/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.serialize = function() {
  var json = anychart.core.ui.LabelsSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.LabelsSettings.DESCRIPTORS, json, void 0, void 0, true);
  var padding = this.getCreated('padding');
  if (padding)
    json['padding'] = padding.serialize();
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.core.ui.LabelsSettings.prototype.disposeInternal = function() {
  this.flatSettings_ = null;
  this.parent(null);
  this.padding_ = null;
  goog.dispose(this.background_);
  this.background_ = null;
  anychart.core.ui.LabelsSettings.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.core.ui.LabelsSettings.prototype;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
})();


//endregion
