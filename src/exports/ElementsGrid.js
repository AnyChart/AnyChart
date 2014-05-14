goog.provide('anychart.exports.ElementsGrid');
goog.require('anychart.elements.Grid');

goog.exportSymbol('anychart.elements.Grid', anychart.elements.Grid);
anychart.elements.Grid.prototype['minor'] = anychart.elements.Grid.prototype.minor;
anychart.elements.Grid.prototype['oddFill'] = anychart.elements.Grid.prototype.oddFill;
anychart.elements.Grid.prototype['evenFill'] = anychart.elements.Grid.prototype.evenFill;
anychart.elements.Grid.prototype['direction'] = anychart.elements.Grid.prototype.direction;
anychart.elements.Grid.prototype['scale'] = anychart.elements.Grid.prototype.scale;
anychart.elements.Grid.prototype['parentBounds'] = anychart.elements.Grid.prototype.parentBounds;
anychart.elements.Grid.prototype['stroke'] = anychart.elements.Grid.prototype.stroke;
anychart.elements.Grid.prototype['drawFirstLine'] = anychart.elements.Grid.prototype.drawFirstLine;
anychart.elements.Grid.prototype['drawLastLine'] = anychart.elements.Grid.prototype.drawLastLine;
anychart.elements.Grid.prototype['draw'] = anychart.elements.Grid.prototype.draw;
