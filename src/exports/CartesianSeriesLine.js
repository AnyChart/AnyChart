goog.provide('anychart.exports.CartesianSeriesLine');
goog.require('anychart.cartesian.series.Line');

goog.exportSymbol('anychart.cartesian.series.Line', anychart.cartesian.series.Line);
anychart.cartesian.series.Line.prototype['stroke'] = anychart.cartesian.series.Line.prototype.stroke;
anychart.cartesian.series.Line.prototype['hoverStroke'] = anychart.cartesian.series.Line.prototype.hoverStroke;
