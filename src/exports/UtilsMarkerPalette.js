goog.provide('anychart.exports.UtilsMarkerPalette');
goog.require('anychart.utils.MarkerPalette');

goog.exportSymbol('anychart.utils.MarkerPalette', anychart.utils.MarkerPalette);
anychart.utils.MarkerPalette.prototype['markerAt'] = anychart.utils.MarkerPalette.prototype.markerAt;
anychart.utils.MarkerPalette.prototype['markers'] = anychart.utils.MarkerPalette.prototype.markers;
anychart.utils.MarkerPalette.prototype['serialize'] = anychart.utils.MarkerPalette.prototype.serialize;
anychart.utils.MarkerPalette.prototype['deserialize'] = anychart.utils.MarkerPalette.prototype.deserialize;
