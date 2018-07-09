goog.provide('anychart.mapModule.drawers.Marker');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.enums');



/**
 * Marker drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Marker}
 */
anychart.mapModule.drawers.Marker = function(series) {
  anychart.mapModule.drawers.Marker.base(this, 'constructor', series);
};
goog.inherits(anychart.mapModule.drawers.Marker, anychart.core.drawers.Marker);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MAP_MARKER] = anychart.mapModule.drawers.Marker;


/** @inheritDoc */
anychart.mapModule.drawers.Marker.prototype.type = anychart.enums.SeriesDrawerTypes.MAP_MARKER;


/** @inheritDoc */
anychart.mapModule.drawers.Marker.prototype.yValueNames = (function () { return ['id', 'long', 'lat']; })();


/** @inheritDoc */
anychart.mapModule.drawers.Marker.prototype.updatePointInternal = function(point, state) {
  anychart.mapModule.drawers.Marker.base(this, 'updatePointInternal', point, state);

  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  this.shapesManager.updateZIndex(state, shapes);
};


/** @inheritDoc */
anychart.mapModule.drawers.Marker.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);
  var names = this.getShapeNames(value, this.prevValue);

  var shapeNames = {};
  shapeNames[names.path] = true;
  shapeNames[names.hatchFill] = true;

  point.meta('names', names);

  var shapes = shapesManager.getShapesGroup(state, shapeNames, state);

  this.drawPointInternal(point, state, shapes, names);

  this.prevValue = value;
};
