goog.provide('anychart.core.resource.resourceList.TextSettings');
goog.require('anychart.core.resource.resourceList.SettingsWithMargin');
goog.require('anychart.core.settings');



/**
 * Class representing text settings for resource list items.
 * @extends {anychart.core.resource.resourceList.SettingsWithMargin}
 * @constructor
 */
anychart.core.resource.resourceList.TextSettings = function() {
  anychart.core.resource.resourceList.TextSettings.base(this, 'constructor');
};
goog.inherits(anychart.core.resource.resourceList.TextSettings, anychart.core.resource.resourceList.SettingsWithMargin);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.FONT_SIZE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_SIZE,
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_FAMILY] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_FAMILY,
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_COLOR] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_COLOR,
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_OPACITY] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_OPACITY,
      anychart.core.settings.ratioNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_DECORATION] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_DECORATION,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_STYLE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_STYLE,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_VARIANT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_VARIANT,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FONT_WEIGHT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_WEIGHT,
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.LETTER_SPACING] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.LETTER_SPACING,
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.TEXT_DIRECTION] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_DIRECTION,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.LINE_HEIGHT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.LINE_HEIGHT,
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.TEXT_INDENT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_INDENT,
      anychart.core.settings.numberNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.V_ALIGN] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.V_ALIGN,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.H_ALIGN] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.H_ALIGN,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.TEXT_WRAP] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_WRAP,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.TEXT_OVERFLOW] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_OVERFLOW,
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.SELECTABLE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SELECTABLE,
      anychart.core.settings.booleanNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.USE_HTML] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.USE_HTML,
      anychart.core.settings.booleanNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.DISABLE_POINTER_EVENTS] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DISABLE_POINTER_EVENTS,
      anychart.core.settings.booleanNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.resourceList.TextSettings, anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS);
//endregion


// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.resource.resourceList.TextSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.resourceList.TextSettings.base(this, 'setupByJSON', config, opt_default);
  if (!opt_default)
    anychart.core.settings.deserialize(this, anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.resource.resourceList.TextSettings.prototype.serialize = function() {
  var json = anychart.core.resource.resourceList.TextSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, json);
  return json;
};
//endregion


//region --- EXPORTS ---
//exports
//anychart.core.resource.resourceList.TextSettings.prototype['fontSize'] = anychart.core.resource.resourceList.TextSettings.prototype.fontSize;
//anychart.core.resource.resourceList.TextSettings.prototype['fontFamily'] = anychart.core.resource.resourceList.TextSettings.prototype.fontFamily;
//anychart.core.resource.resourceList.TextSettings.prototype['fontColor'] = anychart.core.resource.resourceList.TextSettings.prototype.fontColor;
//anychart.core.resource.resourceList.TextSettings.prototype['fontOpacity'] = anychart.core.resource.resourceList.TextSettings.prototype.fontOpacity;
//anychart.core.resource.resourceList.TextSettings.prototype['fontDecoration'] = anychart.core.resource.resourceList.TextSettings.prototype.fontDecoration;
//anychart.core.resource.resourceList.TextSettings.prototype['fontStyle'] = anychart.core.resource.resourceList.TextSettings.prototype.fontStyle;
//anychart.core.resource.resourceList.TextSettings.prototype['fontVariant'] = anychart.core.resource.resourceList.TextSettings.prototype.fontVariant;
//anychart.core.resource.resourceList.TextSettings.prototype['fontWeight'] = anychart.core.resource.resourceList.TextSettings.prototype.fontWeight;
//anychart.core.resource.resourceList.TextSettings.prototype['letterSpacing'] = anychart.core.resource.resourceList.TextSettings.prototype.letterSpacing;
//anychart.core.resource.resourceList.TextSettings.prototype['textDirection'] = anychart.core.resource.resourceList.TextSettings.prototype.textDirection;
//anychart.core.resource.resourceList.TextSettings.prototype['lineHeight'] = anychart.core.resource.resourceList.TextSettings.prototype.lineHeight;
//anychart.core.resource.resourceList.TextSettings.prototype['textIndent'] = anychart.core.resource.resourceList.TextSettings.prototype.textIndent;
//anychart.core.resource.resourceList.TextSettings.prototype['vAlign'] = anychart.core.resource.resourceList.TextSettings.prototype.vAlign;
//anychart.core.resource.resourceList.TextSettings.prototype['hAlign'] = anychart.core.resource.resourceList.TextSettings.prototype.hAlign;
//anychart.core.resource.resourceList.TextSettings.prototype['textWrap'] = anychart.core.resource.resourceList.TextSettings.prototype.textWrap;
//anychart.core.resource.resourceList.TextSettings.prototype['textOverflow'] = anychart.core.resource.resourceList.TextSettings.prototype.textOverflow;
//anychart.core.resource.resourceList.TextSettings.prototype['selectable'] = anychart.core.resource.resourceList.TextSettings.prototype.selectable;
//anychart.core.resource.resourceList.TextSettings.prototype['useHtml'] = anychart.core.resource.resourceList.TextSettings.prototype.useHtml;
//anychart.core.resource.resourceList.TextSettings.prototype['disablePointerEvents'] = anychart.core.resource.resourceList.TextSettings.prototype.disablePointerEvents;
//endregion
