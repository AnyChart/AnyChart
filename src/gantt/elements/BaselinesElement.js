goog.provide('anychart.ganttModule.elements.BaselinesElement');

//region -- Requirements.
goog.require('anychart.ganttModule.elements.TimelineElement');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.BaselinesElement = function(timeline) {
  anychart.ganttModule.elements.BaselinesElement.base(this, 'constructor', timeline);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['above', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.elements.BaselinesElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'above',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.BaselinesElement, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.BASELINES;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPaletteNormalFill = function() {
  return anychart.color.lighten(this.getPalette().itemAt(1), 0.7);
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.darken(anychart.color.lighten(this.getPalette().itemAt(1), 0.7));
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType(), 'baseline']);
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselinesElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.BaselinesElement.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselinesElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.BaselinesElement.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS, json);
  return json;
};


//endregion


