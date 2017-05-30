goog.provide('anychart.core.drawers.MapBubble');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Bubble');
goog.require('anychart.enums');



/**
 * Bubble drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Bubble}
 */
anychart.core.drawers.MapBubble = function(series) {
  anychart.core.drawers.MapBubble.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.MapBubble, anychart.core.drawers.Bubble);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_BUBBLE] = anychart.core.drawers.MapBubble;


/** @inheritDoc */
anychart.core.drawers.MapBubble.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_BUBBLE;


/** @inheritDoc */
anychart.core.drawers.MapBubble.prototype.yValueNames = (['id', 'long', 'lat', 'size']);


/** @inheritDoc */
anychart.core.drawers.MapBubble.prototype.valueFieldName = 'size';
