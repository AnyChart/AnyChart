goog.provide('anychart.exports.ScalesLinear');
goog.require('anychart.scales.Linear');

goog.exportSymbol('anychart.scales.Linear', anychart.scales.Linear);
anychart.scales.Linear.prototype['ticks'] = anychart.scales.Linear.prototype.ticks;
anychart.scales.Linear.prototype['minorTicks'] = anychart.scales.Linear.prototype.minorTicks;
