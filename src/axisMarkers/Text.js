goog.provide('anychart.axisMarkers.Text');
goog.require('anychart.core.axisMarkers.Text');



/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Text}
 */
anychart.axisMarkers.Text = function() {
  goog.base(this);
};
goog.inherits(anychart.axisMarkers.Text, anychart.core.axisMarkers.Text);


/**
 * Constructor function.
 * @return {!anychart.axisMarkers.Text}
 */
anychart.axisMarkers.text = function() {
  var res = new anychart.axisMarkers.Text();
  res.setup(anychart.getFullTheme()['standalones']['textAxisMarker']);
  return res;
};


//exports
goog.exportSymbol('anychart.axisMarkers.text', anychart.axisMarkers.text);
anychart.axisMarkers.Text.prototype['draw'] = anychart.axisMarkers.Text.prototype.draw;
anychart.axisMarkers.Text.prototype['parentBounds'] = anychart.axisMarkers.Text.prototype.parentBounds;
anychart.axisMarkers.Text.prototype['container'] = anychart.axisMarkers.Text.prototype.container;
