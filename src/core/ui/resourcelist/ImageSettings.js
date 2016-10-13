goog.provide('anychart.core.ui.resourceList.ImageSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.resourceList.SettingsWithMargin');



/**
 * Class representing text settings for resource list items.
 * @extends {anychart.core.ui.resourceList.SettingsWithMargin}
 * @constructor
 */
anychart.core.ui.resourceList.ImageSettings = function() {
  anychart.core.ui.resourceList.ImageSettings.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.resourceList.ImageSettings, anychart.core.ui.resourceList.SettingsWithMargin);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.resourceList.ImageSettings.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.SIZE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SIZE,
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.BORDER_RADIUS] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.BORDER_RADIUS,
      anychart.core.settings.arrayNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.OPACITY] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.OPACITY,
      anychart.core.settings.ratioNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.ALIGN] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ALIGN,
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.FITTING_MODE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FITTING_MODE,
      anychart.core.settings.stringNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.resourceList.ImageSettings, anychart.core.ui.resourceList.ImageSettings.PROPERTY_DESCRIPTORS);
//endregion


// region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.ImageSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.ImageSettings.base(this, 'setupByJSON', config, opt_default);
  if (!opt_default)
    anychart.core.settings.deserialize(this, anychart.core.ui.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.resourceList.ImageSettings.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.ImageSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, json);
  return json;
};
//endregion


//region --- EXPORTS ---
//exports
//anychart.core.ui.resourceList.ImageSettings.prototype['size'] = anychart.core.ui.resourceList.ImageSettings.prototype.size;
//anychart.core.ui.resourceList.ImageSettings.prototype['borderRadius'] = anychart.core.ui.resourceList.ImageSettings.prototype.borderRadius;
//anychart.core.ui.resourceList.ImageSettings.prototype['opacity'] = anychart.core.ui.resourceList.ImageSettings.prototype.opacity;
//anychart.core.ui.resourceList.ImageSettings.prototype['align'] = anychart.core.ui.resourceList.ImageSettings.prototype.align;
//anychart.core.ui.resourceList.ImageSettings.prototype['fittingMode'] = anychart.core.ui.resourceList.ImageSettings.prototype.fittingMode;
//endregion
