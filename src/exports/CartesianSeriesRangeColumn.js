goog.provide('anychart.exports.CartesianSeriesRangeColumn');
goog.require('anychart.cartesian.series.RangeColumn');

goog.exportSymbol('anychart.cartesian.series.RangeColumn', anychart.cartesian.series.RangeColumn);
anychart.cartesian.series.RangeColumn.prototype['fill'] = anychart.cartesian.series.Base.prototype.fill;
anychart.cartesian.series.RangeColumn.prototype['hoverFill'] = anychart.cartesian.series.Base.prototype.hoverFill;
anychart.cartesian.series.RangeColumn.prototype['stroke'] = anychart.cartesian.series.Base.prototype.stroke;
anychart.cartesian.series.RangeColumn.prototype['hoverStroke'] = anychart.cartesian.series.Base.prototype.hoverStroke;
