goog.provide('anychart.ganttModule.elements.PeriodsElement');

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
anychart.ganttModule.elements.PeriodsElement = function(timeline) {
  anychart.ganttModule.elements.PeriodsElement.base(this, 'constructor', timeline);
};
goog.inherits(anychart.ganttModule.elements.PeriodsElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.PeriodsElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.PERIODS;
};


/** @inheritDoc */
anychart.ganttModule.elements.PeriodsElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(0);
};


/** @inheritDoc */
anychart.ganttModule.elements.PeriodsElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.lighten(this.getPalette().itemAt(0));
};


//endregion

