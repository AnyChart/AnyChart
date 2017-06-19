goog.provide('anychart.standalones.axisMarkers.Text');
goog.require('anychart.core.axisMarkers.Text');



/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Text}
 */
anychart.standalones.axisMarkers.Text = function() {
  anychart.standalones.axisMarkers.Text.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axisMarkers.Text, anychart.core.axisMarkers.Text);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Text, anychart.core.axisMarkers.Text);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Text}
 */
anychart.standalones.axisMarkers.text = function() {
  var text = new anychart.standalones.axisMarkers.Text();
  text.setup(anychart.getFullTheme('standalones.textAxisMarker'));
  return text;
};


//exports
(function() {
  var proto = anychart.standalones.axisMarkers.Text.prototype;
  goog.exportSymbol('anychart.standalones.axisMarkers.text', anychart.standalones.axisMarkers.text);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
