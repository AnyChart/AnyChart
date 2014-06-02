goog.provide('anychart.exports.Chart');
goog.require('anychart.Chart');

goog.exportSymbol('anychart.Chart', anychart.Chart);//in docs/final
anychart.Chart.prototype['title'] = anychart.Chart.prototype.title;//in docs/final
anychart.Chart.prototype['background'] = anychart.Chart.prototype.background;//in docs/final
anychart.Chart.prototype['margin'] = anychart.Chart.prototype.margin;//in docs/final
anychart.Chart.prototype['padding'] = anychart.Chart.prototype.padding;//in docs/final
anychart.Chart.prototype['print'] = anychart.Chart.prototype.print;
anychart.Chart.prototype['legend'] = anychart.Chart.prototype.legend;
anychart.Chart.prototype['chartLabel'] = anychart.Chart.prototype.chartLabel;
anychart.Chart.prototype['draw'] = anychart.Chart.prototype.draw;//in docs/final
anychart.Chart.prototype['toJson'] = anychart.Chart.prototype.toJson;
anychart.Chart.prototype['toXml'] = anychart.Chart.prototype.toXml;
