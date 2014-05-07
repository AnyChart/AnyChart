goog.provide('anychart.exports.CartesianSeriesOHLC');
goog.require('anychart.cartesian.series.OHLC');

goog.exportSymbol('anychart.cartesian.series.OHLC', anychart.cartesian.series.OHLC);
anychart.cartesian.series.OHLC.prototype['risingStroke'] = anychart.cartesian.series.OHLC.prototype.risingStroke;
anychart.cartesian.series.OHLC.prototype['hoverRisingStroke'] = anychart.cartesian.series.OHLC.prototype.hoverRisingStroke;
anychart.cartesian.series.OHLC.prototype['fallingStroke'] = anychart.cartesian.series.OHLC.prototype.fallingStroke;
anychart.cartesian.series.OHLC.prototype['hoverFallingStroke'] = anychart.cartesian.series.OHLC.prototype.hoverFallingStroke;
