goog.provide('anychart.mapModule.drawers.Bubble');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Bubble');
goog.require('anychart.enums');



/**
 * Bubble drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Bubble}
 */
anychart.mapModule.drawers.Bubble = function(series) {
  anychart.mapModule.drawers.Bubble.base(this, 'constructor', series);
};
goog.inherits(anychart.mapModule.drawers.Bubble, anychart.core.drawers.Bubble);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_BUBBLE] = anychart.mapModule.drawers.Bubble;


/** @inheritDoc */
anychart.mapModule.drawers.Bubble.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_BUBBLE;


/** @inheritDoc */
anychart.mapModule.drawers.Bubble.prototype.yValueNames = (function () { return ['id', 'long', 'lat', 'size']; })();


/** @inheritDoc */
anychart.mapModule.drawers.Bubble.prototype.valueFieldName = 'size';
