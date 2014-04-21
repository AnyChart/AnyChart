goog.provide('anychart.cartesian.series.OHLC');

goog.require('anychart.cartesian.series.WidthBased');
goog.require('anychart.utils.TypedLayer');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.WidthBased}
 */
anychart.cartesian.series.OHLC = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Определяем значения опорных полей серии.
  this.referenceValueNames = ['x', 'open', 'high', 'low', 'close'];
  this.referenceValueMeanings = ['x', 'y', 'y', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.cartesian.series.OHLC, anychart.cartesian.series.WidthBased);


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.OHLC.prototype.risingStroke_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.OHLC.prototype.hoverRisingStroke_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.OHLC.prototype.fallingStroke_ = (function() {
  return anychart.color.darken(anychart.color.darken(this['sourceColor']));
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.OHLC.prototype.hoverFallingStroke_ = (function() {
  return anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor'])));
});


/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.rootTypedLayerInitializer = function() {
  return acgraph.path();
};


/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var x = referenceValues[0];
    var open = referenceValues[1];
    var high = referenceValues[2];
    var low = referenceValues[3];
    var close = referenceValues[4];

    var iterator = this.getIterator();

    var rising = iterator.get('open') < iterator.get('close');

    /** @type {!acgraph.vector.Path} */
    var path = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
    var widthHalf = this.getPointWidth() / 2;

    iterator
        .meta('x', x)
        .meta('open', open)
        .meta('high', high)
        .meta('low', low)
        .meta('close', close)
        .meta('rising', rising)
        .meta('shape', path);

    path.clear()
        .moveTo(x, high)
        .lineTo(x, low)
        .close()
        .moveTo(x - widthHalf, open)
        .lineTo(x, open)
        .close()
        .moveTo(x + widthHalf, close)
        .lineTo(x, close)
        .close();

    this.colorizeShape(false);

    this.makeHoverable(path);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.colorizeShape = function(hover) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    var stroke;
    if (!!this.getIterator().meta('rising')) {
      stroke = this.getFinalRisingStroke(hover);
    } else {
      stroke = this.getFinalFallingStroke(hover);
    }
    shape.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.ROUND);
  }
};


/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.createPositionProvider = function(position) {
  var shape = this.getIterator().meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    return anychart.utils.getCoordinateByAnchor(shapeBounds, position);
  } else {
    var iterator = this.getIterator();
    return {x: iterator.meta('x'), y: iterator.meta('close')};
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.OHLC.prototype.risingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.risingStroke_) {
      this.risingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingStroke_;
};


/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.OHLC.prototype.hoverRisingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverRisingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverRisingStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.OHLC.prototype.getFinalRisingStroke = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('risingStroke') ||
      this.risingStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              iterator.get('hoverRisingStroke') ||
              this.hoverRisingStroke() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.OHLC.prototype.fallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.fallingStroke_) {
      this.fallingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingStroke_;
};


/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.OHLC.prototype.hoverFallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverFallingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverFallingStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.OHLC.prototype.getFinalFallingStroke = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('fallingStroke') ||
      this.fallingStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              iterator.get('hoverFallingStroke') ||
              this.hoverFallingStroke() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.OHLC.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'ohlc';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.OHLC.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


