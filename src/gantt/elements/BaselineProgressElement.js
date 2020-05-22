goog.provide('anychart.ganttModule.elements.BaselineProgressElement');

//region -- Requirements.
goog.require('anychart.ganttModule.elements.ProgressElement');



//endregion
//region -- Constructor.
/**
 * Baseline progress element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.ProgressElement}
 */
anychart.ganttModule.elements.BaselineProgressElement = function(timeline) {
  anychart.ganttModule.elements.BaselineProgressElement.base(this, 'constructor', timeline);
};
goog.inherits(anychart.ganttModule.elements.BaselineProgressElement, anychart.ganttModule.elements.ProgressElement);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.BaselineProgressElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.BASELINE_PROGRESS;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineProgressElement.prototype.getPaletteNormalFill = function() {
  return 'green'; // TODO (A.Kudryavtsev): Kind of not-palette issue.
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineProgressElement.prototype.getPointSettingsResolutionOrder = function() {
  // Regular task's progress is removed from this resolution during the DVF-4397.
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType(), anychart.enums.GanttDataFields.BASELINE_PROGRESS]);
};


//endregion



