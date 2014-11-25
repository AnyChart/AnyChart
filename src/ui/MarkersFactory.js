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


/**
 * Constructor function.
 * @return {!anychart.ui.MarkersFactory}
 */
anychart.ui.markersFactory = function() {
  return new anychart.ui.MarkersFactory();
};


//exports
goog.exportSymbol('anychart.ui.markersFactory', anychart.ui.markersFactory);
