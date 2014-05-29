goog.provide('anychart.exports.CartesianSeriesRangeBar');
goog.require('anychart.cartesian.series.RangeBar');

goog.exportSymbol('anychart.cartesian.series.RangeBar', anychart.cartesian.series.RangeBar);
anychart.cartesian.series.RangeBar.prototype['fill'] = anychart.cartesian.series.Base.prototype.fill;
anychart.cartesian.series.RangeBar.prototype['hoverFill'] = anychart.cartesian.series.Base.prototype.hoverFill;
anychart.cartesian.series.RangeBar.prototype['stroke'] = anychart.cartesian.series.Base.prototype.stroke;
anychart.cartesian.series.RangeBar.prototype['hoverStroke'] = anychart.cartesian.series.Base.prototype.hoverStroke;
anychart.cartesian.series.RangeBar.prototype['hatchFill'] = anychart.cartesian.series.RangeBar.prototype.hatchFill;
anychart.cartesian.series.RangeBar.prototype['hoverHatchFill'] = anychart.cartesian.series.RangeBar.prototype.hoverHatchFill;
