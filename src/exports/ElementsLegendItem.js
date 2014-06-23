goog.provide('anychart.exports.ElementsLegendItem');
goog.require('anychart.elements.LegendItem');

goog.exportSymbol('anychart.elements.LegendItem', anychart.elements.LegendItem);
anychart.elements.LegendItem.prototype['parentBounds'] = anychart.elements.Legend.prototype.parentBounds;
anychart.elements.LegendItem.prototype['x'] = anychart.elements.Legend.prototype.x;
anychart.elements.LegendItem.prototype['y'] = anychart.elements.Legend.prototype.y;
anychart.elements.LegendItem.prototype['iconType'] = anychart.elements.Legend.prototype.iconType;
anychart.elements.LegendItem.prototype['iconFill'] = anychart.elements.Legend.prototype.iconFill;
anychart.elements.LegendItem.prototype['iconStroke'] = anychart.elements.Legend.prototype.iconStroke;
anychart.elements.LegendItem.prototype['iconTextSpacing'] = anychart.elements.Legend.prototype.iconTextSpacing;
anychart.elements.LegendItem.prototype['maxWidth'] = anychart.elements.Legend.prototype.maxWidth;
anychart.elements.LegendItem.prototype['maxHeight'] = anychart.elements.Legend.prototype.maxHeight;
anychart.elements.LegendItem.prototype['text'] = anychart.elements.Legend.prototype.text;
anychart.elements.LegendItem.prototype['getTextElement'] = anychart.elements.Legend.prototype.getTextElement;
anychart.elements.LegendItem.prototype['getContentBounds'] = anychart.elements.Legend.prototype.getContentBounds;
anychart.elements.LegendItem.prototype['getWidth'] = anychart.elements.Legend.prototype.getWidth;
anychart.elements.LegendItem.prototype['getHeight'] = anychart.elements.Legend.prototype.getHeight;
anychart.elements.LegendItem.prototype['draw'] = anychart.elements.Legend.prototype.draw;
