goog.provide('anychart.core.drawers.MapMarker');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.enums');



/**
 * Marker drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Marker}
 */
anychart.core.drawers.MapMarker = function(series) {
  anychart.core.drawers.MapMarker.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.MapMarker, anychart.core.drawers.Marker);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_MARKER] = anychart.core.drawers.MapMarker;


/** @inheritDoc */
anychart.core.drawers.MapMarker.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_MARKER;


/** @inheritDoc */
anychart.core.drawers.MapMarker.prototype.yValueNames = (['id', 'long', 'lat']);


/** @inheritDoc */
anychart.core.drawers.MapMarker.prototype.updatePointInternal = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  // this can happen before first draw in Cartesian.prepareData()
  if (shapes) {
    shapes['path'].clear();
    shapes['hatchFill'].clear();
    this.drawPointInternal(point, state, shapes);
  }
  this.shapesManager.updateZIndex(state, shapes);
};


/** @inheritDoc */
anychart.core.drawers.MapMarker.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(state, undefined, state);
  this.drawPointInternal(point, state, shapes);
};
