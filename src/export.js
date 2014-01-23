goog.provide('anychartexport');

goog.require('anychart');

goog.exportSymbol('anychart.data.Set', anychart.data.Set);

anychart.elements.Base.prototype['container'] = anychart.elements.Base.prototype.container;
anychart.elements.Base.prototype['zIndex'] = anychart.elements.Base.prototype.zIndex;

anychart.elements.BaseWithBounds.prototype['pixelBounds'] = anychart.elements.BaseWithBounds.prototype.pixelBounds;

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
anychart.pie.Chart.prototype['labels'] = anychart.pie.Chart.prototype.labels;
anychart.pie.Chart.prototype['radius'] = anychart.pie.Chart.prototype.radius;
anychart.pie.Chart.prototype['innerRadius'] = anychart.pie.Chart.prototype.innerRadius;
anychart.pie.Chart.prototype['startAngle'] = anychart.pie.Chart.prototype.startAngle;
anychart.pie.Chart.prototype['explode'] = anychart.pie.Chart.prototype.explode;
anychart.pie.Chart.prototype['sort'] = anychart.pie.Chart.prototype.sort;
//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.Background.prototype['fill'] = anychart.elements.Background.prototype.fill;
anychart.elements.Background.prototype['stroke'] = anychart.elements.Background.prototype.stroke;
anychart.elements.Background.prototype['cornerType'] = anychart.elements.Background.prototype.cornerType;
anychart.elements.Background.prototype['corners'] = anychart.elements.Background.prototype.corners;
// ----------------------------------------------------------------------------------------------------------------------
//
//  Multilabel.
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.Multilabel.prototype['background'] = anychart.elements.Multilabel.prototype.background;
anychart.elements.Multilabel.prototype['textFormatter'] = anychart.elements.Multilabel.prototype.textFormatter;
anychart.elements.Multilabel.prototype['positionFormatter'] = anychart.elements.Multilabel.prototype.positionFormatter;
anychart.elements.Multilabel.prototype['position'] = anychart.elements.Multilabel.prototype.position;
anychart.elements.Multilabel.prototype['anchor'] = anychart.elements.Multilabel.prototype.anchor;
anychart.elements.Multilabel.prototype['width'] = anychart.elements.Multilabel.prototype.width;
anychart.elements.Multilabel.prototype['height'] = anychart.elements.Multilabel.prototype.height;
anychart.elements.Multilabel.prototype['end'] = anychart.elements.Multilabel.prototype.end;
anychart.elements.Multilabel.prototype['draw'] = anychart.elements.Multilabel.prototype.draw;
anychart.elements.Multilabel.prototype['restoreDefaults'] = anychart.elements.Multilabel.prototype.restoreDefaults;
//----------------------------------------------------------------------------------------------------------------------
//
//  Text.
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.Text.prototype['fontSize'] = anychart.elements.Text.prototype.fontSize;
anychart.elements.Text.prototype['fontFamily'] = anychart.elements.Text.prototype.fontFamily;
anychart.elements.Text.prototype['fontColor'] = anychart.elements.Text.prototype.fontColor;
anychart.elements.Text.prototype['fontOpacity'] = anychart.elements.Text.prototype.fontOpacity;
anychart.elements.Text.prototype['fontDecoration'] = anychart.elements.Text.prototype.fontDecoration;
anychart.elements.Text.prototype['fontStyle'] = anychart.elements.Text.prototype.fontStyle;
anychart.elements.Text.prototype['fontVariant'] = anychart.elements.Text.prototype.fontVariant;
anychart.elements.Text.prototype['fontWeight'] = anychart.elements.Text.prototype.fontWeight;
anychart.elements.Text.prototype['letterSpacing'] = anychart.elements.Text.prototype.letterSpacing;
anychart.elements.Text.prototype['direction'] = anychart.elements.Text.prototype.direction;
anychart.elements.Text.prototype['lineHeight'] = anychart.elements.Text.prototype.lineHeight;
anychart.elements.Text.prototype['textIndent'] = anychart.elements.Text.prototype.textIndent;
anychart.elements.Text.prototype['vAlign'] = anychart.elements.Text.prototype.vAlign;
anychart.elements.Text.prototype['hAlign'] = anychart.elements.Text.prototype.hAlign;
anychart.elements.Text.prototype['textWrap'] = anychart.elements.Text.prototype.textWrap;
anychart.elements.Text.prototype['textOverflow'] = anychart.elements.Text.prototype.textOverflow;
anychart.elements.Text.prototype['selectable'] = anychart.elements.Text.prototype.selectable;
anychart.elements.Text.prototype['useHtml'] = anychart.elements.Text.prototype.useHtml;

// ----------------------------------------------------------------------------------------------------------------------
//
//  Invalidatable.
//
//----------------------------------------------------------------------------------------------------------------------
anychart.utils.Invalidatable.prototype['listen'] = anychart.utils.Invalidatable.prototype.listen;
//----------------------------------------------------------------------------------------------------------------------
//
//  Palettes.
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.utils.ColorPalette', anychart.utils.ColorPalette);
anychart.utils.ColorPalette.prototype['colorAt'] = anychart.utils.ColorPalette.prototype.colorAt;
anychart.utils.ColorPalette.prototype['colors'] = anychart.utils.ColorPalette.prototype.colors;
anychart.utils.ColorPalette.prototype['restoreDefaults'] = anychart.utils.ColorPalette.prototype.restoreDefaults;
