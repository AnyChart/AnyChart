goog.provide('anychart.standalones.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Range');



/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Range}
 */
anychart.standalones.axisMarkers.Range = function() {
  anychart.standalones.axisMarkers.Range.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axisMarkers.Range, anychart.core.axisMarkers.Range);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Range, anychart.core.axisMarkers.Range);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Range}
 */
anychart.standalones.axisMarkers.range = function() {
  var res = new anychart.standalones.axisMarkers.Range();
  res.setup(anychart.getFullTheme('standalones.rangeAxisMarker'));
  return res;
};


/**
 * Constructor function.
 * @deprecated Since 7.12.0. Use anychart.standalones.axisMarkers.range instead.
 * @return {!anychart.standalones.axisMarkers.Range}
 */
anychart.axisMarkers.range = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.axisMarkers.range()', 'anychart.standalones.axisMarkers.range()', null, 'Constructor'], true);
  return anychart.standalones.axisMarkers.range();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.axisMarkers.Range.prototype;
  goog.exportSymbol('anychart.axisMarkers.range', anychart.axisMarkers.range);
  goog.exportSymbol('anychart.standalones.axisMarkers.range', anychart.standalones.axisMarkers.range);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
