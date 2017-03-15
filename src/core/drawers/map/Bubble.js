goog.provide('anychart.core.drawers.map.Bubble');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Bubble');
goog.require('anychart.enums');



/**
 * Bubble drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Bubble}
 */
anychart.core.drawers.map.Bubble = function(series) {
  anychart.core.drawers.map.Bubble.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.map.Bubble, anychart.core.drawers.Bubble);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_BUBBLE] = anychart.core.drawers.map.Bubble;


/** @inheritDoc */
anychart.core.drawers.map.Bubble.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_BUBBLE;


/** @inheritDoc */
anychart.core.drawers.map.Bubble.prototype.yValueNames = (['id', 'long', 'lat', 'size']);


/** @inheritDoc */
anychart.core.drawers.map.Bubble.prototype.valueFieldName = 'size';
