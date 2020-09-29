goog.provide('anychart.resourceModule.resourceList.TextSettings');

goog.require('anychart.core.settings');
goog.require('anychart.resourceModule.resourceList.Settings');



/**
 * Class representing text settings for resource list items.
 * @extends {anychart.resourceModule.resourceList.Settings}
 * @constructor
 */
anychart.resourceModule.resourceList.TextSettings = function() {
  anychart.resourceModule.resourceList.TextSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fontSize', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontFamily', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontColor', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontOpacity', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontDecoration', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontStyle', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontVariant', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fontWeight', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['letterSpacing', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['textDirection', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['lineHeight', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['textIndent', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['vAlign', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['hAlign', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['wordWrap', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['wordBreak', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['textOverflow', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['textShadow', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['selectable', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['useHtml', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['disablePointerEvents', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.resourceModule.resourceList.TextSettings, anychart.resourceModule.resourceList.Settings);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontSize', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontVariant', anychart.enums.normalizeFontVariant],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'letterSpacing', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textDirection', anychart.enums.normalizeTextDirection],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'lineHeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textIndent', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'vAlign', anychart.enums.normalizeVAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hAlign', anychart.enums.normalizeHAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordWrap', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordBreak', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textOverflow', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textShadow', acgraph.vector.normalizeTextShadow],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectable', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'useHtml', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'disablePointerEvents', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.resourceList.TextSettings, anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS);


//endregion
// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.resourceModule.resourceList.TextSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.resourceList.TextSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.resourceModule.resourceList.TextSettings.prototype.serialize = function() {
  var json = anychart.resourceModule.resourceList.TextSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, json);
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
//proto['wordWrap'] = proto.wordWrap;
//proto['wordBreak'] = proto.wordBreak;
//proto['textOverflow'] = proto.textOverflow;
//proto['selectable'] = proto.selectable;
//proto['useHtml'] = proto.useHtml;
//proto['disablePointerEvents'] = proto.disablePointerEvents;
//endregion
