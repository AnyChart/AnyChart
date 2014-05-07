goog.provide('anychart.exports.CartesianSeriesSpline');
goog.require('anychart.cartesian.series.Spline');

goog.exportSymbol('anychart.cartesian.series.Spline', anychart.cartesian.series.Spline);
anychart.cartesian.series.Spline.prototype['stroke'] = anychart.cartesian.series.Spline.prototype.stroke;
anychart.cartesian.series.Spline.prototype['hoverStroke'] = anychart.cartesian.series.Spline.prototype.hoverStroke;
