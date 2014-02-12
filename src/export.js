goog.provide('anychartexport');
goog.require('anychart');
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.data.Iterator
//
//----------------------------------------------------------------------------------------------------------------------
anychart.data.Iterator.prototype['select'] = anychart.data.Iterator.prototype.select;//in docs/
anychart.data.Iterator.prototype['reset'] = anychart.data.Iterator.prototype.reset;//in docs/
anychart.data.Iterator.prototype['advance'] = anychart.data.Iterator.prototype.advance;//in docs/
anychart.data.Iterator.prototype['get'] = anychart.data.Iterator.prototype.get;//in docs/
anychart.data.Iterator.prototype['meta'] = anychart.data.Iterator.prototype.meta;//in docs/
anychart.data.Iterator.prototype['getIndex'] = anychart.data.Iterator.prototype.getIndex;//in docs/
anychart.data.Iterator.prototype['getRowsCount'] = anychart.data.Iterator.prototype.getRowsCount;//in docs/
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
//  anychart.elements.Marker
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Marker', anychart.elements.Marker);
anychart.elements.Marker.prototype['parentBounds'] = anychart.elements.Marker.prototype.parentBounds;
anychart.elements.Marker.prototype['anchor'] = anychart.elements.Marker.prototype.anchor;
anychart.elements.Marker.prototype['offsetX'] = anychart.elements.Marker.prototype.offsetX;
anychart.elements.Marker.prototype['offsetY'] = anychart.elements.Marker.prototype.offsetY;
anychart.elements.Marker.prototype['position'] = anychart.elements.Marker.prototype.position;
anychart.elements.Marker.prototype['type'] = anychart.elements.Marker.prototype.type;
anychart.elements.Marker.prototype['size'] = anychart.elements.Marker.prototype.size;
anychart.elements.Marker.prototype['fill'] = anychart.elements.Marker.prototype.fill;
anychart.elements.Marker.prototype['stroke'] = anychart.elements.Marker.prototype.stroke;
anychart.elements.Marker.prototype['draw'] = anychart.elements.Marker.prototype.draw;
goog.exportSymbol('anychart.elements.Marker.Type.CIRCLE', anychart.elements.Marker.Type.CIRCLE);
goog.exportSymbol('anychart.elements.Marker.Type.CROSS', anychart.elements.Marker.Type.CROSS);
goog.exportSymbol('anychart.elements.Marker.Type.DIAGONAL_CROSS', anychart.elements.Marker.Type.DIAGONAL_CROSS);
goog.exportSymbol('anychart.elements.Marker.Type.DIAMOND', anychart.elements.Marker.Type.DIAMOND);
goog.exportSymbol('anychart.elements.Marker.Type.SQUARE', anychart.elements.Marker.Type.SQUARE);
goog.exportSymbol('anychart.elements.Marker.Type.STAR10', anychart.elements.Marker.Type.STAR10);
goog.exportSymbol('anychart.elements.Marker.Type.STAR4', anychart.elements.Marker.Type.STAR4);
goog.exportSymbol('anychart.elements.Marker.Type.STAR5', anychart.elements.Marker.Type.STAR5);
goog.exportSymbol('anychart.elements.Marker.Type.STAR6', anychart.elements.Marker.Type.STAR6);
goog.exportSymbol('anychart.elements.Marker.Type.STAR7', anychart.elements.Marker.Type.STAR7);
goog.exportSymbol('anychart.elements.Marker.Type.STAR10', anychart.elements.Marker.Type.STAR10);
goog.exportSymbol('anychart.elements.Marker.Type.TRIANGLE_DOWN', anychart.elements.Marker.Type.TRIANGLE_DOWN);
goog.exportSymbol('anychart.elements.Marker.Type.TRIANGLE_UP', anychart.elements.Marker.Type.TRIANGLE_UP);
goog.exportSymbol('anychart.elements.Marker.Type.SQUARE', anychart.elements.Marker.Type.SQUARE);
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
//  anychart.elements.Text
//
//----------------------------------------------------------------------------------------------------------------------
anychart.elements.Text.prototype['fontSize'] = anychart.elements.Text.prototype.fontSize;//in docs/
anychart.elements.Text.prototype['fontFamily'] = anychart.elements.Text.prototype.fontFamily;//in docs/
anychart.elements.Text.prototype['fontColor'] = anychart.elements.Text.prototype.fontColor;//in docs/
anychart.elements.Text.prototype['fontOpacity'] = anychart.elements.Text.prototype.fontOpacity;//in docs/
anychart.elements.Text.prototype['fontDecoration'] = anychart.elements.Text.prototype.fontDecoration;//in docs/
anychart.elements.Text.prototype['fontStyle'] = anychart.elements.Text.prototype.fontStyle;//in docs/
anychart.elements.Text.prototype['fontVariant'] = anychart.elements.Text.prototype.fontVariant;//in docs/
anychart.elements.Text.prototype['fontWeight'] = anychart.elements.Text.prototype.fontWeight;//in docs/
anychart.elements.Text.prototype['letterSpacing'] = anychart.elements.Text.prototype.letterSpacing;//in docs/
anychart.elements.Text.prototype['direction'] = anychart.elements.Text.prototype.direction;//in docs/
anychart.elements.Text.prototype['lineHeight'] = anychart.elements.Text.prototype.lineHeight;//in docs/
anychart.elements.Text.prototype['textIndent'] = anychart.elements.Text.prototype.textIndent;//in docs/
anychart.elements.Text.prototype['vAlign'] = anychart.elements.Text.prototype.vAlign;//in docs/
anychart.elements.Text.prototype['hAlign'] = anychart.elements.Text.prototype.hAlign;//in docs/
anychart.elements.Text.prototype['textWrap'] = anychart.elements.Text.prototype.textWrap;//in docs/
anychart.elements.Text.prototype['textOverflow'] = anychart.elements.Text.prototype.textOverflow;//in docs/
anychart.elements.Text.prototype['selectable'] = anychart.elements.Text.prototype.selectable;//in docs/
anychart.elements.Text.prototype['useHtml'] = anychart.elements.Text.prototype.useHtml;//in docs/
anychart.elements.Text.prototype['textSettings'] = anychart.elements.Text.prototype.textSettings;//in docs/
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
//  anychart.elements.Ticks
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.elements.Ticks', anychart.elements.Ticks);
anychart.elements.Ticks.prototype['length'] = anychart.elements.Ticks.prototype.length;
anychart.elements.Ticks.prototype['stroke'] = anychart.elements.Ticks.prototype.stroke;
anychart.elements.Ticks.prototype['position'] = anychart.elements.Ticks.prototype.position;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.math.Rect
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.math.Rect', anychart.math.Rect);

//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.pie.Chart
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.pie.Chart', anychart.pie.Chart);//in docs/
goog.exportSymbol('anychart.pie.Chart.OtherPointType.DROP', anychart.pie.Chart.OtherPointType.DROP);//in docs/
goog.exportSymbol('anychart.pie.Chart.OtherPointType.GROUP', anychart.pie.Chart.OtherPointType.GROUP);//in docs/
goog.exportSymbol('anychart.pie.Chart.OtherPointType.NONE', anychart.pie.Chart.OtherPointType.NONE);//in docs/
anychart.pie.Chart.prototype['data'] = anychart.pie.Chart.prototype.data;//in docs/
anychart.pie.Chart.prototype['otherPointType'] = anychart.pie.Chart.prototype.otherPointType;//in docs/
anychart.pie.Chart.prototype['otherPointFilter'] = anychart.pie.Chart.prototype.otherPointFilter;//in docs/
anychart.pie.Chart.prototype['setOtherPoint'] = anychart.pie.Chart.prototype.setOtherPoint;//in docs/
anychart.pie.Chart.prototype['labels'] = anychart.pie.Chart.prototype.labels;//in docs/
anychart.pie.Chart.prototype['radius'] = anychart.pie.Chart.prototype.radius;//in docs/
anychart.pie.Chart.prototype['innerRadius'] = anychart.pie.Chart.prototype.innerRadius;//in docs/
anychart.pie.Chart.prototype['startAngle'] = anychart.pie.Chart.prototype.startAngle;//in docs/
anychart.pie.Chart.prototype['explode'] = anychart.pie.Chart.prototype.explode;//in docs/
anychart.pie.Chart.prototype['sort'] = anychart.pie.Chart.prototype.sort;//in docs/
anychart.pie.Chart.prototype['getCenterPoint'] = anychart.pie.Chart.prototype.getCenterPoint;//in docs/
anychart.pie.Chart.prototype['getPixelRadius'] = anychart.pie.Chart.prototype.getPixelRadius;//in docs/
anychart.pie.Chart.prototype['getPixelInnerRadius'] = anychart.pie.Chart.prototype.getPixelInnerRadius;//in docs/
anychart.pie.Chart.prototype['palette'] = anychart.pie.Chart.prototype.palette;//in docs/

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
//  anychart.utils.Invalidatable
//
//----------------------------------------------------------------------------------------------------------------------
anychart.utils.Invalidatable.prototype['listen'] = anychart.utils.Invalidatable.prototype.listen;
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.utils.ColorPalette
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.utils.Sort.NONE', anychart.utils.Sort.NONE);
goog.exportSymbol('anychart.utils.Sort.ASC', anychart.utils.Sort.ASC);
goog.exportSymbol('anychart.utils.Sort.DESC', anychart.utils.Sort.DESC);
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
//  anychart.math
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.math.Rect', anychart.math.Rect);
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.color
//
//----------------------------------------------------------------------------------------------------------------------
goog.exportSymbol('anychart.color.blend', anychart.color.blend);
goog.exportSymbol('anychart.color.lighten', anychart.color.lighten);
goog.exportSymbol('anychart.color.darken', anychart.color.darken);

