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

  map['fontSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontSize',
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontFamily'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontFamily',
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontColor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontColor',
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontOpacity'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontOpacity',
      anychart.core.settings.ratioNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontDecoration'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontDecoration',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontStyle'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontStyle',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontVariant'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontVariant',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['fontWeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontWeight',
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['letterSpacing'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'letterSpacing',
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['textDirection'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textDirection',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['lineHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'lineHeight',
      anychart.core.settings.numberOrStringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['textIndent'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textIndent',
      anychart.core.settings.numberNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['vAlign'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'vAlign',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['hAlign'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hAlign',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['textWrap'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textWrap',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['textOverflow'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textOverflow',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['selectable'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectable',
      anychart.core.settings.booleanNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['useHtml'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'useHtml',
      anychart.core.settings.booleanNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['disablePointerEvents'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'disablePointerEvents',
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
//proto['fontSize'] = proto.fontSize;
//proto['fontFamily'] = proto.fontFamily;
//proto['fontColor'] = proto.fontColor;
//proto['fontOpacity'] = proto.fontOpacity;
//proto['fontDecoration'] = proto.fontDecoration;
//proto['fontStyle'] = proto.fontStyle;
//proto['fontVariant'] = proto.fontVariant;
//proto['fontWeight'] = proto.fontWeight;
//proto['letterSpacing'] = proto.letterSpacing;
//proto['textDirection'] = proto.textDirection;
//proto['lineHeight'] = proto.lineHeight;
//proto['textIndent'] = proto.textIndent;
//proto['vAlign'] = proto.vAlign;
//proto['hAlign'] = proto.hAlign;
//proto['textWrap'] = proto.textWrap;
//proto['textOverflow'] = proto.textOverflow;
//proto['selectable'] = proto.selectable;
//proto['useHtml'] = proto.useHtml;
//proto['disablePointerEvents'] = proto.disablePointerEvents;
//endregion
