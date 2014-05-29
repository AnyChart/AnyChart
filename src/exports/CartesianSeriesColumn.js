goog.provide('anychart.exports.CartesianSeriesColumn');
goog.require('anychart.cartesian.series.Column');

goog.exportSymbol('anychart.cartesian.series.Column', anychart.cartesian.series.Column);
anychart.cartesian.series.Column.prototype['fill'] = anychart.cartesian.series.Column.prototype.fill;
anychart.cartesian.series.Column.prototype['hoverFill'] = anychart.cartesian.series.Column.prototype.hoverFill;
anychart.cartesian.series.Column.prototype['stroke'] = anychart.cartesian.series.Column.prototype.stroke;
anychart.cartesian.series.Column.prototype['hoverStroke'] = anychart.cartesian.series.Column.prototype.hoverStroke;
anychart.cartesian.series.Column.prototype['hatchFill'] = anychart.cartesian.series.Column.prototype.hatchFill;
anychart.cartesian.series.Column.prototype['hoverHatchFill'] = anychart.cartesian.series.Column.prototype.hoverHatchFill;
