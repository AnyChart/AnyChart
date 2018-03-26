goog.provide('anychart.ganttModule.elements.MilestonesElement');

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
anychart.ganttModule.elements.MilestonesElement = function(timeline) {
  anychart.ganttModule.elements.MilestonesElement.base(this, 'constructor', timeline);
};
goog.inherits(anychart.ganttModule.elements.MilestonesElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.MilestonesElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.MILESTONES;
};


/** @inheritDoc */
anychart.ganttModule.elements.MilestonesElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(9);
};


/** @inheritDoc */
anychart.ganttModule.elements.MilestonesElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.darken(this.getPalette().itemAt(9));
};


/** @inheritDoc */
anychart.ganttModule.elements.MilestonesElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType(), 'milestone', 'actual']);
};

//endregion

