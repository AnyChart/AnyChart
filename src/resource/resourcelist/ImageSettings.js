goog.provide('anychart.resourceModule.resourceList.ImageSettings');
goog.require('anychart.core.settings');
goog.require('anychart.resourceModule.resourceList.SettingsWithMargin');



/**
 * Class representing text settings for resource list items.
 * @extends {anychart.resourceModule.resourceList.SettingsWithMargin}
 * @constructor
 */
anychart.resourceModule.resourceList.ImageSettings = function() {
  anychart.resourceModule.resourceList.ImageSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['size', 0, anychart.Signal.NEEDS_REDRAW],
    ['borderRadius', 0, anychart.Signal.NEEDS_REDRAW],
    ['opacity', 0, anychart.Signal.NEEDS_REDRAW],
    ['align', 0, anychart.Signal.NEEDS_REDRAW],
    ['fittingMode', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.resourceModule.resourceList.ImageSettings, anychart.resourceModule.resourceList.SettingsWithMargin);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.resourceList.ImageSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'borderRadius', anychart.core.settings.arrayNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'opacity', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'align', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fittingMode', anychart.core.settings.stringNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.resourceList.ImageSettings, anychart.resourceModule.resourceList.ImageSettings.PROPERTY_DESCRIPTORS);


//endregion
// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.resourceModule.resourceList.ImageSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.resourceList.ImageSettings.base(this, 'setupByJSON', config, opt_default);
  if (!opt_default)
    anychart.core.settings.deserialize(this, anychart.resourceModule.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.resourceModule.resourceList.ImageSettings.prototype.serialize = function() {
  var json = anychart.resourceModule.resourceList.ImageSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.resourceModule.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, json);
  return json;
};


//endregion
//region --- EXPORTS ---
//exports
//proto['size'] = proto.size;
//proto['borderRadius'] = proto.borderRadius;
//proto['opacity'] = proto.opacity;
//proto['align'] = proto.align;
//proto['fittingMode'] = proto.fittingMode;
//endregion
