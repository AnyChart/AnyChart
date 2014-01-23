goog.provide('anychartexport');

goog.require('anychart');

anychart.elements.Base.prototype['container'] = anychart.elements.Base.prototype.container;
anychart.elements.Base.prototype['zIndex'] = anychart.elements.Base.prototype.zIndex;

anychart.Chart.prototype['title'] = anychart.Chart.prototype.title;
anychart.Chart.prototype['background'] = anychart.Chart.prototype.background;
anychart.Chart.prototype['margin'] = anychart.Chart.prototype.margin;
anychart.Chart.prototype['padding'] = anychart.Chart.prototype.padding;
anychart.Chart.prototype['draw'] = anychart.Chart.prototype.draw;

goog.exportSymbol('anychart.pie.Chart', anychart.pie.Chart);

anychart.pie.Chart.prototype['data'] = anychart.pie.Chart.prototype.data;
anychart.pie.Chart.prototype['setOtherPoint'] = anychart.pie.Chart.prototype.setOtherPoint;
anychart.pie.Chart.prototype['otherPointType'] = anychart.pie.Chart.prototype.otherPointType;
anychart.pie.Chart.prototype['otherPointFilter'] = anychart.pie.Chart.prototype.otherPointFilter;
anychart.pie.Chart.prototype['radius'] = anychart.pie.Chart.prototype.radius;
anychart.pie.Chart.prototype['innerRadius'] = anychart.pie.Chart.prototype.innerRadius;
anychart.pie.Chart.prototype['startAngle'] = anychart.pie.Chart.prototype.startAngle;
anychart.pie.Chart.prototype['explode'] = anychart.pie.Chart.prototype.explode;
anychart.pie.Chart.prototype['sort'] = anychart.pie.Chart.prototype.sort;
