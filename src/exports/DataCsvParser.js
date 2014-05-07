goog.provide('anychart.exports.DataCsvParser');
goog.require('anychart.data.csv.Parser');

goog.exportSymbol('anychart.data.csv.Parser', anychart.data.csv.Parser);
anychart.data.csv.Parser.prototype['parse'] = anychart.data.csv.Parser.prototype.parse;
anychart.data.csv.Parser.prototype['rowsSeparator'] = anychart.data.csv.Parser.prototype.rowsSeparator;
anychart.data.csv.Parser.prototype['columnsSeparator'] = anychart.data.csv.Parser.prototype.columnsSeparator;
anychart.data.csv.Parser.prototype['ignoreTrailingSpaces'] = anychart.data.csv.Parser.prototype.ignoreTrailingSpaces;
anychart.data.csv.Parser.prototype['ignoreFirstRow'] = anychart.data.csv.Parser.prototype.ignoreFirstRow;
