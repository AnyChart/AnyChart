goog.provide('anychart.timelineModule.ConnectorSettings');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.timelineModule.ConnectorSettings = function() {
  anychart.timelineModule.ConnectorSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['length', 0, anychart.Signal.NEEDS_REDRAW],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.timelineModule.ConnectorSettings, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.timelineModule.ConnectorSettings.prototype.SUPPORTED_SIGNALS = anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


/**
 * Connector settings property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.ConnectorSettings.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.STROKE,
    d.LENGTH
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.ConnectorSettings, anychart.timelineModule.ConnectorSettings.PROPERTY_DESCRIPTORS);
