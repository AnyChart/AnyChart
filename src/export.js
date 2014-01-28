goog.provide('anychartexport');

goog.require('anychart');

goog.exportSymbol('anychart.data.Set', anychart.data.Set);
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Base
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.Base.prototype['container'] = anychart.elements.Base.prototype.container;
anychart.elements.Base.prototype['zIndex'] = anychart.elements.Base.prototype.zIndex;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.BaseWithBounds
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.BaseWithBounds.prototype['bounds'] = anychart.elements.BaseWithBounds.prototype.bounds;
anychart.elements.BaseWithBounds.prototype['pixelBounds'] = anychart.elements.BaseWithBounds.prototype.pixelBounds;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.Chart
//
//----------------------------------------------------------------------------------------------------------------------
anychart.Chart.prototype['title'] = anychart.Chart.prototype.title;
anychart.Chart.prototype['background'] = anychart.Chart.prototype.background;
anychart.Chart.prototype['margin'] = anychart.Chart.prototype.margin;
anychart.Chart.prototype['padding'] = anychart.Chart.prototype.padding;
anychart.Chart.prototype['draw'] = anychart.Chart.prototype.draw;

//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.Pie.Chart
//
//----------------------------------------------------------------------------------------------------------------------
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
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.scales.Linear', anychart.scales.Linear);
goog.exportSymbol('anychart.scales.Ordinal', anychart.scales.Ordinal);

anychart.scales.Base.prototype['stackMode'] = anychart.scales.Base.prototype.stackMode;

anychart.scales.Linear.prototype['transform'] = anychart.scales.Linear.prototype.transform;
anychart.scales.Linear.prototype['inverseTransform'] = anychart.scales.Linear.prototype.inverseTransform;
anychart.scales.Linear.prototype['ticks'] = anychart.scales.Linear.prototype.ticks;
anychart.scales.Linear.prototype['minorTicks'] = anychart.scales.Linear.prototype.minorTicks;
anychart.scales.Linear.prototype['minimum'] = anychart.scales.Linear.prototype.minimum;
anychart.scales.Linear.prototype['maximum'] = anychart.scales.Linear.prototype.maximum;

anychart.scales.Ordinal.prototype['transform'] = anychart.scales.Ordinal.prototype.transform;
anychart.scales.Ordinal.prototype['inverseTransform'] = anychart.scales.Ordinal.prototype.inverseTransform;
anychart.scales.Ordinal.prototype['ticks'] = anychart.scales.Ordinal.prototype.ticks;
anychart.scales.Ordinal.prototype['values'] = anychart.scales.Ordinal.prototype.values;

anychart.scales.LinearTicks.prototype['interval'] = anychart.scales.LinearTicks.prototype.interval;
anychart.scales.LinearTicks.prototype['count'] = anychart.scales.LinearTicks.prototype.count;
anychart.scales.LinearTicks.prototype['base'] = anychart.scales.LinearTicks.prototype.base;
anychart.scales.LinearTicks.prototype['set'] = anychart.scales.LinearTicks.prototype.set;
anychart.scales.LinearTicks.prototype['get'] = anychart.scales.LinearTicks.prototype.get;

anychart.scales.OrdinalTicks.prototype['interval'] = anychart.scales.OrdinalTicks.prototype.interval;
anychart.scales.OrdinalTicks.prototype['set'] = anychart.scales.OrdinalTicks.prototype.set;
anychart.scales.OrdinalTicks.prototype['get'] = anychart.scales.OrdinalTicks.prototype.get;
anychart.scales.OrdinalTicks.prototype['names'] = anychart.scales.OrdinalTicks.prototype.names;
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
