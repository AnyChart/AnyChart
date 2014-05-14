goog.provide('anychart.exports.CartesianSeriesBar');
goog.require('anychart.cartesian.series.Bar');

goog.exportSymbol('anychart.cartesian.series.Bar', anychart.cartesian.series.Bar);
anychart.cartesian.series.Bar.prototype['fill'] = anychart.cartesian.series.Base.prototype.fill;
anychart.cartesian.series.Bar.prototype['hoverFill'] = anychart.cartesian.series.Base.prototype.hoverFill;
anychart.cartesian.series.Bar.prototype['stroke'] = anychart.cartesian.series.Base.prototype.stroke;
anychart.cartesian.series.Bar.prototype['hoverStroke'] = anychart.cartesian.series.Base.prototype.hoverStroke;
