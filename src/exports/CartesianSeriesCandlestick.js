goog.provide('anychart.exports.CartesianSeriesCandlestick');
goog.require('anychart.cartesian.series.Candlestick');

goog.exportSymbol('anychart.cartesian.series.Candlestick', anychart.cartesian.series.Candlestick);
anychart.cartesian.series.Candlestick.prototype['risingFill'] = anychart.cartesian.series.Candlestick.prototype.risingFill;
anychart.cartesian.series.Candlestick.prototype['hoverRisingFill'] = anychart.cartesian.series.Candlestick.prototype.hoverRisingFill;
anychart.cartesian.series.Candlestick.prototype['fallingFill'] = anychart.cartesian.series.Candlestick.prototype.fallingFill;
anychart.cartesian.series.Candlestick.prototype['hoverFallingFill'] = anychart.cartesian.series.Candlestick.prototype.hoverFallingFill;
