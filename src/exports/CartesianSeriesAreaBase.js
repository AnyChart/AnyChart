goog.provide('anychart.exports.CartesianSeriesAreaBase');
goog.require('anychart.cartesian.series.AreaBase');

anychart.cartesian.series.AreaBase.prototype['startDrawing'] = anychart.cartesian.series.Base.prototype.startDrawing;
anychart.cartesian.series.AreaBase.prototype['fill'] = anychart.cartesian.series.Base.prototype.fill;
anychart.cartesian.series.AreaBase.prototype['hoverFill'] = anychart.cartesian.series.Base.prototype.hoverFill;
anychart.cartesian.series.AreaBase.prototype['stroke'] = anychart.cartesian.series.Base.prototype.stroke;
anychart.cartesian.series.AreaBase.prototype['hoverStroke'] = anychart.cartesian.series.Base.prototype.hoverStroke;
