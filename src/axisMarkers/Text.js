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
  return new anychart.axisMarkers.Text();
};


//exports
goog.exportSymbol('anychart.axisMarkers.text', anychart.axisMarkers.text);
