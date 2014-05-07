goog.provide('anychart.exports.CartesianSeriesStepLine');
goog.require('anychart.cartesian.series.StepLine');

goog.exportSymbol('anychart.cartesian.series.StepLine', anychart.cartesian.series.StepLine);
anychart.cartesian.series.StepLine.prototype['stroke'] = anychart.cartesian.series.StepLine.prototype.stroke;
anychart.cartesian.series.StepLine.prototype['hoverStroke'] = anychart.cartesian.series.StepLine.prototype.hoverStroke;
