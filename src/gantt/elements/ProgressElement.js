goog.provide('anychart.ganttModule.elements.ProgressElement');

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
anychart.ganttModule.elements.ProgressElement = function(timeline) {
  anychart.ganttModule.elements.ProgressElement.base(this, 'constructor', timeline);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['drawOverEnd', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.elements.ProgressElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.ProgressElement.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawOverEnd',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.ProgressElement, anychart.ganttModule.elements.ProgressElement.DESCRIPTORS);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.ProgressElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.PROGRESS;
};


/** @inheritDoc */
anychart.ganttModule.elements.ProgressElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(1);
};


/** @inheritDoc */
anychart.ganttModule.elements.ProgressElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.TRANSPARENT_HANDLER;
};


/** @inheritDoc */
anychart.ganttModule.elements.ProgressElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType()]);
};


//endregion



