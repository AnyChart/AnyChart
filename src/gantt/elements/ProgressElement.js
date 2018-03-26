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
};
goog.inherits(anychart.ganttModule.elements.ProgressElement, anychart.ganttModule.elements.TimelineElement);


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



