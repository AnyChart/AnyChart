goog.provide('anychart.exports.CartesianSeriesBar');
goog.require('anychart.cartesian.series.Bar');

goog.exportSymbol('anychart.cartesian.series.Bar', anychart.cartesian.series.Bar);
anychart.cartesian.series.Bar.prototype['fill'] = anychart.cartesian.series.Bar.prototype.fill;
anychart.cartesian.series.Bar.prototype['hoverFill'] = anychart.cartesian.series.Bar.prototype.hoverFill;
anychart.cartesian.series.Bar.prototype['stroke'] = anychart.cartesian.series.Bar.prototype.stroke;
anychart.cartesian.series.Bar.prototype['hoverStroke'] = anychart.cartesian.series.Bar.prototype.hoverStroke;
anychart.cartesian.series.Bar.prototype['hatchFill'] = anychart.cartesian.series.Bar.prototype.hatchFill;
anychart.cartesian.series.Bar.prototype['hoverHatchFill'] = anychart.cartesian.series.Bar.prototype.hoverHatchFill;
