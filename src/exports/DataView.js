goog.provide('anychart.exports.DataView');
goog.require('anychart.data.View');

anychart.data.View.prototype['derive'] = anychart.data.View.prototype.derive;
anychart.data.View.prototype['filter'] = anychart.data.View.prototype.filter;//in docs/final
anychart.data.View.prototype['sort'] = anychart.data.View.prototype.sort;//in docs/final
anychart.data.View.prototype['concat'] = anychart.data.View.prototype.concat;//in docs/final
anychart.data.View.prototype['row'] = anychart.data.View.prototype.row;//in docs/final
anychart.data.View.prototype['getRowsCount'] = anychart.data.View.prototype.getRowsCount;//in docs/final
anychart.data.View.prototype['getIterator'] = anychart.data.View.prototype.getIterator;//in docs/final
anychart.data.View.prototype['meta'] = anychart.data.View.prototype.meta;//in docs/final
