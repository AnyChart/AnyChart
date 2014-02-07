goog.provide('anychartexport');
goog.require('anychart');
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.data.Set
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.data.Set', anychart.data.Set);
anychart.data.Set.prototype['data'] = anychart.data.Set.prototype.data;
anychart.data.Set.prototype['mapAs'] = anychart.data.Set.prototype.mapAs;
anychart.data.Set.prototype['row'] = anychart.data.Set.prototype.row;
anychart.data.Set.prototype['getRowsCount'] = anychart.data.Set.prototype.getRowsCount;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.data.View
//
//----------------------------------------------------------------------------------------------------------------------
anychart.data.View.prototype['derive'] = anychart.data.View.prototype.derive;
anychart.data.View.prototype['filter'] = anychart.data.View.prototype.filter;
anychart.data.View.prototype['sort'] = anychart.data.View.prototype.sort;
anychart.data.View.prototype['concat'] = anychart.data.View.prototype.concat;
anychart.data.View.prototype['row'] = anychart.data.View.prototype.row;
anychart.data.View.prototype['getRowsCount'] = anychart.data.View.prototype.getRowsCount;
anychart.data.View.prototype['getIterator'] = anychart.data.View.prototype.getIterator;
anychart.data.View.prototype['meta'] = anychart.data.View.prototype.meta;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.data.Iterator
//
//----------------------------------------------------------------------------------------------------------------------
anychart.data.Iterator.prototype['select'] = anychart.data.Iterator.prototype.select;
anychart.data.Iterator.prototype['reset'] = anychart.data.Iterator.prototype.reset;
anychart.data.Iterator.prototype['advance'] = anychart.data.Iterator.prototype.advance;
anychart.data.Iterator.prototype['get'] = anychart.data.Iterator.prototype.get;
anychart.data.Iterator.prototype['getMeta'] = anychart.data.Iterator.prototype.getMeta;
anychart.data.Iterator.prototype['getMeta'] = anychart.data.Iterator.prototype.getMeta;
anychart.data.Iterator.prototype['getIndex'] = anychart.data.Iterator.prototype.getIndex;
anychart.data.Iterator.prototype['getRowsCount'] = anychart.data.Iterator.prototype.getRowsCount;
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
goog.exportSymbol('anychart.Chart', anychart.Chart);
anychart.Chart.prototype['title'] = anychart.Chart.prototype.title;
anychart.Chart.prototype['background'] = anychart.Chart.prototype.background;
anychart.Chart.prototype['margin'] = anychart.Chart.prototype.margin;
anychart.Chart.prototype['padding'] = anychart.Chart.prototype.padding;
anychart.Chart.prototype['draw'] = anychart.Chart.prototype.draw;

//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.pie.Chart
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
anychart.pie.Chart.prototype['getCenterPoint'] = anychart.pie.Chart.prototype.getCenterPoint;
anychart.pie.Chart.prototype['getPixelRadius'] = anychart.pie.Chart.prototype.getPixelRadius;
anychart.pie.Chart.prototype['getPixelInnerRadius'] = anychart.pie.Chart.prototype.getPixelInnerRadius;
anychart.pie.Chart.prototype['fill'] = anychart.pie.Chart.prototype.fill;
anychart.pie.Chart.prototype['stroke'] = anychart.pie.Chart.prototype.stroke;
anychart.pie.Chart.prototype['hoverFill'] = anychart.pie.Chart.prototype.hoverFill;
anychart.pie.Chart.prototype['hoverStroke'] = anychart.pie.Chart.prototype.hoverStroke;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Title
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Title', anychart.elements.Title);
anychart.elements.Title.prototype['parentBounds'] = anychart.elements.Title.prototype.parentBounds;
anychart.elements.Title.prototype['text'] = anychart.elements.Title.prototype.text;
anychart.elements.Title.prototype['background'] = anychart.elements.Title.prototype.background;
anychart.elements.Title.prototype['width'] = anychart.elements.Title.prototype.width;
anychart.elements.Title.prototype['height'] = anychart.elements.Title.prototype.height;
anychart.elements.Title.prototype['margin'] = anychart.elements.Title.prototype.margin;
anychart.elements.Title.prototype['padding'] = anychart.elements.Title.prototype.padding;
anychart.elements.Title.prototype['align'] = anychart.elements.Title.prototype.align;
anychart.elements.Title.prototype['orientation'] = anychart.elements.Title.prototype.orientation;
anychart.elements.Title.prototype['draw'] = anychart.elements.Title.prototype.draw;
anychart.elements.Title.prototype['getRemainingBounds'] = anychart.elements.Title.prototype.getRemainingBounds;

//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Background
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Background', anychart.elements.Background);
anychart.elements.Background.prototype['fill'] = anychart.elements.Background.prototype.fill;
anychart.elements.Background.prototype['stroke'] = anychart.elements.Background.prototype.stroke;
anychart.elements.Background.prototype['cornerType'] = anychart.elements.Background.prototype.cornerType;
anychart.elements.Background.prototype['corners'] = anychart.elements.Background.prototype.corners;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Label
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Label', anychart.elements.Label);
anychart.elements.Label.prototype['background'] = anychart.elements.Label.prototype.background;
anychart.elements.Label.prototype['padding'] = anychart.elements.Label.prototype.padding;
anychart.elements.Label.prototype['width'] = anychart.elements.Label.prototype.width;
anychart.elements.Label.prototype['height'] = anychart.elements.Label.prototype.height;
anychart.elements.Label.prototype['parentBounds'] = anychart.elements.Label.prototype.parentBounds;
anychart.elements.Label.prototype['rotation'] = anychart.elements.Label.prototype.rotation;
anychart.elements.Label.prototype['anchor'] = anychart.elements.Label.prototype.anchor;
anychart.elements.Label.prototype['offsetX'] = anychart.elements.Label.prototype.offsetX;
anychart.elements.Label.prototype['offsetY'] = anychart.elements.Label.prototype.offsetY;
anychart.elements.Label.prototype['position'] = anychart.elements.Label.prototype.position;
anychart.elements.Label.prototype['draw'] = anychart.elements.Label.prototype.draw;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Multilabel
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Multilabel', anychart.elements.Multilabel);
anychart.elements.Multilabel.prototype['background'] = anychart.elements.Multilabel.prototype.background;
anychart.elements.Multilabel.prototype['textFormatter'] = anychart.elements.Multilabel.prototype.textFormatter;
anychart.elements.Multilabel.prototype['positionFormatter'] = anychart.elements.Multilabel.prototype.positionFormatter;
anychart.elements.Multilabel.prototype['position'] = anychart.elements.Multilabel.prototype.position;
anychart.elements.Multilabel.prototype['anchor'] = anychart.elements.Multilabel.prototype.anchor;
anychart.elements.Multilabel.prototype['width'] = anychart.elements.Multilabel.prototype.width;
anychart.elements.Multilabel.prototype['height'] = anychart.elements.Multilabel.prototype.height;
anychart.elements.Multilabel.prototype['end'] = anychart.elements.Multilabel.prototype.end;
anychart.elements.Multilabel.prototype['reset'] = anychart.elements.Multilabel.prototype.reset;
anychart.elements.Multilabel.prototype['draw'] = anychart.elements.Multilabel.prototype.draw;
anychart.elements.Multilabel.prototype['restoreDefaults'] = anychart.elements.Multilabel.prototype.restoreDefaults;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.scales.Base
//
//----------------------------------------------------------------------------------------------------------------------
anychart.scales.Base.prototype['stackMode'] = anychart.scales.Base.prototype.stackMode;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.scales.Linear
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.scales.Linear', anychart.scales.Linear);
anychart.scales.Linear.prototype['transform'] = anychart.scales.Linear.prototype.transform;
anychart.scales.Linear.prototype['inverseTransform'] = anychart.scales.Linear.prototype.inverseTransform;
anychart.scales.Linear.prototype['ticks'] = anychart.scales.Linear.prototype.ticks;
anychart.scales.Linear.prototype['minorTicks'] = anychart.scales.Linear.prototype.minorTicks;
anychart.scales.Linear.prototype['minimum'] = anychart.scales.Linear.prototype.minimum;
anychart.scales.Linear.prototype['maximum'] = anychart.scales.Linear.prototype.maximum;
anychart.scales.LinearTicks.prototype['interval'] = anychart.scales.LinearTicks.prototype.interval;
anychart.scales.LinearTicks.prototype['count'] = anychart.scales.LinearTicks.prototype.count;
anychart.scales.LinearTicks.prototype['base'] = anychart.scales.LinearTicks.prototype.base;
anychart.scales.LinearTicks.prototype['set'] = anychart.scales.LinearTicks.prototype.set;
anychart.scales.LinearTicks.prototype['get'] = anychart.scales.LinearTicks.prototype.get;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.scales.Ordinal
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.scales.Ordinal', anychart.scales.Ordinal);
anychart.scales.Ordinal.prototype['transform'] = anychart.scales.Ordinal.prototype.transform;
anychart.scales.Ordinal.prototype['inverseTransform'] = anychart.scales.Ordinal.prototype.inverseTransform;
anychart.scales.Ordinal.prototype['ticks'] = anychart.scales.Ordinal.prototype.ticks;
anychart.scales.Ordinal.prototype['values'] = anychart.scales.Ordinal.prototype.values;
anychart.scales.OrdinalTicks.prototype['interval'] = anychart.scales.OrdinalTicks.prototype.interval;
anychart.scales.OrdinalTicks.prototype['set'] = anychart.scales.OrdinalTicks.prototype.set;
anychart.scales.OrdinalTicks.prototype['get'] = anychart.scales.OrdinalTicks.prototype.get;
anychart.scales.OrdinalTicks.prototype['names'] = anychart.scales.OrdinalTicks.prototype.names;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.elements.Text
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
//  anychart.utils.Invalidatable
//
//----------------------------------------------------------------------------------------------------------------------
anychart.utils.Invalidatable.prototype['listen'] = anychart.utils.Invalidatable.prototype.listen;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.utils.ColorPalette
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.utils.DistinctColorPalette', anychart.utils.DistinctColorPalette);
anychart.utils.DistinctColorPalette.prototype['colorAt'] = anychart.utils.DistinctColorPalette.prototype.colorAt;
anychart.utils.DistinctColorPalette.prototype['colors'] = anychart.utils.DistinctColorPalette.prototype.colors;
anychart.utils.DistinctColorPalette.prototype['restoreDefaults'] = anychart.utils.DistinctColorPalette.prototype.restoreDefaults;

goog.exportSymbol('anychart.utils.RangeColorPalette', anychart.utils.RangeColorPalette);
anychart.utils.RangeColorPalette.prototype['colorAt'] = anychart.utils.RangeColorPalette.prototype.colorAt;
anychart.utils.RangeColorPalette.prototype['colors'] = anychart.utils.RangeColorPalette.prototype.colors;
anychart.utils.RangeColorPalette.prototype['count'] = anychart.utils.RangeColorPalette.prototype.count;
anychart.utils.RangeColorPalette.prototype['restoreDefaults'] = anychart.utils.RangeColorPalette.prototype.restoreDefaults;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.math.Rect
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.math.Rect', anychart.math.Rect);
