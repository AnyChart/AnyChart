goog.provide('anychart.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Range');



/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Range}
 */
anychart.axisMarkers.Range = function() {
  goog.base(this);
};
goog.inherits(anychart.axisMarkers.Range, anychart.core.axisMarkers.Range);


/**
 * Constructor function.
 * @return {!anychart.axisMarkers.Range}
 */
anychart.axisMarkers.range = function() {
  var res = new anychart.axisMarkers.Range();
  res.setup(anychart.getFullTheme()['standalones']['rangeAxisMarker']);
  return res;
};


//exports
goog.exportSymbol('anychart.axisMarkers.range', anychart.axisMarkers.range);
anychart.axisMarkers.Range.prototype['draw'] = anychart.axisMarkers.Range.prototype.draw;
anychart.axisMarkers.Range.prototype['parentBounds'] = anychart.axisMarkers.Range.prototype.parentBounds;
anychart.axisMarkers.Range.prototype['container'] = anychart.axisMarkers.Range.prototype.container;
