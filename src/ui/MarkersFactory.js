goog.provide('anychart.ui.MarkersFactory');
goog.require('anychart.core.ui.MarkersFactory');



/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory}
 */
anychart.ui.MarkersFactory = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.MarkersFactory, anychart.core.ui.MarkersFactory);


/** @inheritDoc */
anychart.ui.MarkersFactory.prototype.createMarker = function() {
  return new anychart.ui.MarkersFactory.Marker();
};



/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory.Marker}
 */
anychart.ui.MarkersFactory.Marker = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.MarkersFactory.Marker, anychart.core.ui.MarkersFactory.Marker);


/**
 * Constructor function.
 * @return {!anychart.ui.MarkersFactory}
 */
anychart.ui.markersFactory = function() {
  return new anychart.ui.MarkersFactory();
};


//exports
goog.exportSymbol('anychart.ui.markersFactory', anychart.ui.markersFactory);
anychart.ui.MarkersFactory.prototype['draw'] = anychart.ui.MarkersFactory.prototype.draw;
anychart.ui.MarkersFactory.prototype['parentBounds'] = anychart.ui.MarkersFactory.prototype.parentBounds;
anychart.ui.MarkersFactory.prototype['container'] = anychart.ui.MarkersFactory.prototype.container;
anychart.ui.MarkersFactory.prototype['add'] = anychart.ui.MarkersFactory.prototype.add;
anychart.ui.MarkersFactory.prototype['clear'] = anychart.ui.MarkersFactory.prototype.clear;
anychart.ui.MarkersFactory.prototype['measure'] = anychart.ui.MarkersFactory.prototype.measure;
anychart.ui.MarkersFactory.Marker.prototype['positionFormatter'] = anychart.ui.MarkersFactory.Marker.prototype.positionFormatter;
anychart.ui.MarkersFactory.Marker.prototype['position'] = anychart.ui.MarkersFactory.Marker.prototype.position;
anychart.ui.MarkersFactory.Marker.prototype['anchor'] = anychart.ui.MarkersFactory.Marker.prototype.anchor;
anychart.ui.MarkersFactory.Marker.prototype['offsetX'] = anychart.ui.MarkersFactory.Marker.prototype.offsetX;
anychart.ui.MarkersFactory.Marker.prototype['offsetY'] = anychart.ui.MarkersFactory.Marker.prototype.offsetY;
anychart.ui.MarkersFactory.Marker.prototype['type'] = anychart.ui.MarkersFactory.Marker.prototype.type;
anychart.ui.MarkersFactory.Marker.prototype['size'] = anychart.ui.MarkersFactory.Marker.prototype.size;
anychart.ui.MarkersFactory.Marker.prototype['fill'] = anychart.ui.MarkersFactory.Marker.prototype.fill;
anychart.ui.MarkersFactory.Marker.prototype['stroke'] = anychart.ui.MarkersFactory.Marker.prototype.stroke;
anychart.ui.MarkersFactory.Marker.prototype['enabled'] = anychart.ui.MarkersFactory.Marker.prototype.enabled;
anychart.ui.MarkersFactory.Marker.prototype['draw'] = anychart.ui.MarkersFactory.Marker.prototype.draw;
anychart.ui.MarkersFactory.Marker.prototype['clear'] = anychart.ui.MarkersFactory.Marker.prototype.clear;
anychart.ui.MarkersFactory.Marker.prototype['getIndex'] = anychart.ui.MarkersFactory.Marker.prototype.getIndex;
