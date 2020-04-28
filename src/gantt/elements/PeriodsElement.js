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


/** @inheritDoc */
anychart.ganttModule.elements.PeriodsElement.prototype.getHeight = function(dataItem, opt_periodIndex) {
  var pointSettings = this.getPointSettings(dataItem, opt_periodIndex);

  if (pointSettings) {
    var height = pointSettings['height'];

    if (goog.isDefAndNotNull(height))
      return height;
  }

  return anychart.ganttModule.elements.PeriodsElement.base(this, 'getHeight', dataItem, opt_periodIndex);
};


//endregion

