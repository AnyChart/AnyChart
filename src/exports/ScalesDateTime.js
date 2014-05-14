goog.provide('anychart.exports.ScalesDateTime');
goog.require('anychart.scales.DateTime');

goog.exportSymbol('anychart.scales.DateTime', anychart.scales.DateTime);
anychart.scales.DateTime.prototype['ticks'] = anychart.scales.DateTime.prototype.ticks;
anychart.scales.DateTime.prototype['minorTicks'] = anychart.scales.DateTime.prototype.minorTicks;
