goog.provide('anychart.standalones.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Line');



/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Line}
 */
anychart.standalones.axisMarkers.Line = function() {
  anychart.standalones.axisMarkers.Line.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axisMarkers.Line, anychart.core.axisMarkers.Line);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Line, anychart.core.axisMarkers.Line);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Line}
 */
anychart.standalones.axisMarkers.line = function() {
  var line = new anychart.standalones.axisMarkers.Line();
  line.setup(anychart.getFullTheme('standalones.lineAxisMarker'));
  return line;
};


/**
 * Constructor function.
 * @deprecated Since 7.12.0. Use anychart.standalones.axisMarkers.line instead.
 * @return {!anychart.standalones.axisMarkers.Line}
 */
anychart.axisMarkers.line = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.axisMarkers.line()', 'anychart.standalones.axisMarkers.line()', null, 'Constructor'], true);
  return anychart.standalones.axisMarkers.line();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.axisMarkers.Line.prototype;
  goog.exportSymbol('anychart.axisMarkers.line', anychart.axisMarkers.line);
  goog.exportSymbol('anychart.standalones.axisMarkers.line', anychart.standalones.axisMarkers.line);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
