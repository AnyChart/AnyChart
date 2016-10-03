goog.provide('anychart.core.ui.resourceList.TextSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.resourceList.SettingsWithMargin');



/**
 * Class representing text settings for resource list items.
 * @extends {anychart.core.ui.resourceList.SettingsWithMargin}
 * @constructor
 */
anychart.core.ui.resourceList.TextSettings = function() {
  anychart.core.ui.resourceList.TextSettings.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.resourceList.TextSettings, anychart.core.ui.resourceList.SettingsWithMargin);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.FONT_SIZE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_SIZE,
    normalizer: anychart.core.settings.stringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_FAMILY] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_FAMILY,
    normalizer: anychart.core.settings.stringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_COLOR] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_COLOR,
    normalizer: anychart.core.settings.stringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_OPACITY] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_OPACITY,
    normalizer: anychart.core.settings.ratioNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_DECORATION] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_DECORATION,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_STYLE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_STYLE,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_VARIANT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_VARIANT,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.FONT_WEIGHT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.FONT_WEIGHT,
    normalizer: anychart.core.settings.numberOrStringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.LETTER_SPACING] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.LETTER_SPACING,
    normalizer: anychart.core.settings.numberOrStringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.TEXT_DIRECTION] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.TEXT_DIRECTION,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.LINE_HEIGHT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.LINE_HEIGHT,
    normalizer: anychart.core.settings.numberOrStringNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.TEXT_INDENT] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.TEXT_INDENT,
    normalizer: anychart.core.settings.numberNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.V_ALIGN] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.V_ALIGN,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.H_ALIGN] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.H_ALIGN,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.TEXT_WRAP] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.TEXT_WRAP,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.TEXT_OVERFLOW] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.TEXT_OVERFLOW,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.SELECTABLE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.SELECTABLE,
    normalizer: anychart.core.settings.booleanNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.USE_HTML] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.USE_HTML,
    normalizer: anychart.core.settings.booleanNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.DISABLE_POINTER_EVENTS] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.DISABLE_POINTER_EVENTS,
    normalizer: anychart.core.settings.booleanNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.resourceList.TextSettings, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS);
//endregion


// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.TextSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.TextSettings.base(this, 'setupByJSON', config, opt_default);
  if (!opt_default)
    anychart.core.settings.deserialize(this, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.resourceList.TextSettings.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.TextSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, json);
  return json;
};
//endregion


//region --- EXPORTS ---
//exports
//anychart.core.ui.resourceList.TextSettings.prototype['fontSize'] = anychart.core.ui.resourceList.TextSettings.prototype.fontSize;
//anychart.core.ui.resourceList.TextSettings.prototype['fontFamily'] = anychart.core.ui.resourceList.TextSettings.prototype.fontFamily;
//anychart.core.ui.resourceList.TextSettings.prototype['fontColor'] = anychart.core.ui.resourceList.TextSettings.prototype.fontColor;
//anychart.core.ui.resourceList.TextSettings.prototype['fontOpacity'] = anychart.core.ui.resourceList.TextSettings.prototype.fontOpacity;
//anychart.core.ui.resourceList.TextSettings.prototype['fontDecoration'] = anychart.core.ui.resourceList.TextSettings.prototype.fontDecoration;
//anychart.core.ui.resourceList.TextSettings.prototype['fontStyle'] = anychart.core.ui.resourceList.TextSettings.prototype.fontStyle;
//anychart.core.ui.resourceList.TextSettings.prototype['fontVariant'] = anychart.core.ui.resourceList.TextSettings.prototype.fontVariant;
//anychart.core.ui.resourceList.TextSettings.prototype['fontWeight'] = anychart.core.ui.resourceList.TextSettings.prototype.fontWeight;
//anychart.core.ui.resourceList.TextSettings.prototype['letterSpacing'] = anychart.core.ui.resourceList.TextSettings.prototype.letterSpacing;
//anychart.core.ui.resourceList.TextSettings.prototype['textDirection'] = anychart.core.ui.resourceList.TextSettings.prototype.textDirection;
//anychart.core.ui.resourceList.TextSettings.prototype['lineHeight'] = anychart.core.ui.resourceList.TextSettings.prototype.lineHeight;
//anychart.core.ui.resourceList.TextSettings.prototype['textIndent'] = anychart.core.ui.resourceList.TextSettings.prototype.textIndent;
//anychart.core.ui.resourceList.TextSettings.prototype['vAlign'] = anychart.core.ui.resourceList.TextSettings.prototype.vAlign;
//anychart.core.ui.resourceList.TextSettings.prototype['hAlign'] = anychart.core.ui.resourceList.TextSettings.prototype.hAlign;
//anychart.core.ui.resourceList.TextSettings.prototype['textWrap'] = anychart.core.ui.resourceList.TextSettings.prototype.textWrap;
//anychart.core.ui.resourceList.TextSettings.prototype['textOverflow'] = anychart.core.ui.resourceList.TextSettings.prototype.textOverflow;
//anychart.core.ui.resourceList.TextSettings.prototype['selectable'] = anychart.core.ui.resourceList.TextSettings.prototype.selectable;
//anychart.core.ui.resourceList.TextSettings.prototype['useHtml'] = anychart.core.ui.resourceList.TextSettings.prototype.useHtml;
//anychart.core.ui.resourceList.TextSettings.prototype['disablePointerEvents'] = anychart.core.ui.resourceList.TextSettings.prototype.disablePointerEvents;
//endregion
