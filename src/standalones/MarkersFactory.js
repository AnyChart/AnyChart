goog.provide('anychart.standalones.MarkersFactory');
goog.require('anychart.core.ui.MarkersFactory');



/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory}
 */
anychart.standalones.MarkersFactory = function() {
  anychart.standalones.MarkersFactory.base(this, 'constructor');
};
goog.inherits(anychart.standalones.MarkersFactory, anychart.core.ui.MarkersFactory);
anychart.core.makeStandalone(anychart.standalones.MarkersFactory, anychart.core.ui.MarkersFactory);


/** @inheritDoc */
anychart.standalones.MarkersFactory.prototype.createMarker = function() {
  return new anychart.standalones.MarkersFactory.Marker();
};



/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory.Marker}
 */
anychart.standalones.MarkersFactory.Marker = function() {
  anychart.standalones.MarkersFactory.Marker.base(this, 'constructor');
};
goog.inherits(anychart.standalones.MarkersFactory.Marker, anychart.core.ui.MarkersFactory.Marker);


/**
 * Constructor function.
 * @return {!anychart.standalones.MarkersFactory}
 */
anychart.standalones.markersFactory = function() {
  var factory = new anychart.standalones.MarkersFactory();
  factory.setup(anychart.getFullTheme('standalones.markersFactory'));
  return factory;
};


//exports
(function() {
  var proto = anychart.standalones.MarkersFactory.prototype;
  goog.exportSymbol('anychart.standalones.markersFactory', anychart.standalones.markersFactory);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['add'] = proto.add;
  proto['clear'] = proto.clear;
  proto['measure'] = proto.measure;

  proto = anychart.standalones.MarkersFactory.Marker.prototype;
  proto['enabled'] = proto.enabled;
  proto['draw'] = proto.draw;
  proto['clear'] = proto.clear;
  proto['getIndex'] = proto.getIndex;
})();
