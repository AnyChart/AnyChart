goog.provide('anychart.core.drawers.map.Marker');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.enums');



/**
 * Marker drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Marker}
 */
anychart.core.drawers.map.Marker = function(series) {
  anychart.core.drawers.map.Marker.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.map.Marker, anychart.core.drawers.Marker);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_MARKER] = anychart.core.drawers.map.Marker;


/** @inheritDoc */
anychart.core.drawers.map.Marker.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_MARKER;


/** @inheritDoc */
anychart.core.drawers.map.Marker.prototype.yValueNames = (['id', 'long', 'lat']);


/** @inheritDoc */
anychart.core.drawers.map.Marker.prototype.drawPointInternal = function(point, state, shapes) {
  anychart.core.drawers.map.Marker.base(this, 'drawPointInternal', point, state, shapes);
  this.shapesManager.updateZIndex(state, shapes);
}
