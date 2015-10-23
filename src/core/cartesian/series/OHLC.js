goog.provide('anychart.core.cartesian.series.OHLC');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.WidthBased');
goog.require('anychart.core.utils.TypedLayer');



/**
 * Define OHLC series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#ohlc} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.WidthBased}
 */
anychart.core.cartesian.series.OHLC = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'open', 'high', 'low', 'close'];
  this.referenceValueMeanings = ['x', 'y', 'y', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.core.cartesian.series.OHLC, anychart.core.cartesian.series.WidthBased);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.OHLC] = anychart.core.cartesian.series.OHLC;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.risingStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.hoverRisingStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.selectRisingStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.fallingStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.hoverFallingStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.OHLC.prototype.selectFallingStroke_;


/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.rootTypedLayerInitializer = function() {
  return acgraph.path();
};


/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.drawSubsequentPoint = function(pointState) {
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

    var rising = Number(iterator.get('open')) < Number(iterator.get('close'));

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
        .moveTo(x - widthHalf, open)
        .lineTo(x, open)
        .moveTo(x + widthHalf, close)
        .lineTo(x, close);

    this.colorizeShape(pointState);

    this.makeInteractive(path);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    var stroke;
    if (!!this.getIterator().meta('rising')) {
      stroke = this.getFinalRisingStroke(pointState);
    } else {
      stroke = this.getFinalFallingStroke(pointState);
    }
    var lineCap = stroke && stroke['dash'] && !anychart.utils.isNone(stroke['dash']) ?
        acgraph.vector.StrokeLineCap.BUTT :
        acgraph.vector.StrokeLineCap.ROUND;

    shape.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.MITER, lineCap);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('close')}};
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .risingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    });
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .risingStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.risingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.risingStroke_) {
      this.risingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingStroke_;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverRisingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    });
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverRisingStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.hoverRisingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverRisingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverRisingStroke_;
};


/**
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.selectRisingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectRisingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectRisingStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.OHLC.prototype.getFinalRisingStroke = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(iterator.get('risingStroke') || this.risingStroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('selectRisingStroke')) || this.selectRisingStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('hoverRisingStroke')) || this.hoverRisingStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .fallingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    });
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .fallingStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.fallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.fallingStroke_) {
      this.fallingStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingStroke_;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverFallingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    });
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverFallingStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.OHLC} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.hoverFallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverFallingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverFallingStroke_;
};


/**
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.OHLC.prototype.selectFallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectFallingStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectFallingStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.OHLC.prototype.getFinalFallingStroke = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(iterator.get('fallingStroke') || this.fallingStroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('selectFallingStroke')) || this.selectFallingStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('hoverFallingStroke')) || this.hoverFallingStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.OHLC.prototype.calculateStatistics = function() {
  this.statistics('seriesMax', -Infinity);
  this.statistics('seriesMin', Infinity);
  this.statistics('seriesSum', 0);
  this.statistics('seriesAverage', 0);
  this.statistics('seriesPointsCount', this.getIterator().getRowsCount());
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.OHLC.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.OHLC;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.OHLC.prototype.isErrorAvailable = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.OHLC.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (goog.isFunction(this.risingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  risingStroke']
    );
  } else {
    json['risingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.risingStroke()));
  }

  if (goog.isFunction(this.hoverRisingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  hoverRisingStroke']
    );
  } else {
    json['hoverRisingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverRisingStroke()));
  }

  if (goog.isFunction(this.selectRisingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  selectRisingStroke']
    );
  } else {
    json['selectRisingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectRisingStroke()));
  }


  if (goog.isFunction(this.fallingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  fallingStroke']
    );
  } else {
    json['fallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.fallingStroke()));
  }

  if (goog.isFunction(this.hoverFallingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  hoverFallingStroke']
    );
  } else {
    json['hoverFallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverFallingStroke()));
  }

  if (goog.isFunction(this.selectFallingStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['OHLC Series  selectFallingStroke']
    );
  } else {
    json['selectFallingStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectFallingStroke()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.OHLC.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.risingStroke(config['risingStroke']);
  this.hoverRisingStroke(config['hoverRisingStroke']);
  this.selectRisingStroke(config['selectRisingStroke']);
  this.fallingStroke(config['fallingStroke']);
  this.hoverFallingStroke(config['hoverFallingStroke']);
  this.selectFallingStroke(config['selectFallingStroke']);
};


//exports
anychart.core.cartesian.series.OHLC.prototype['risingStroke'] = anychart.core.cartesian.series.OHLC.prototype.risingStroke;//doc|ex
anychart.core.cartesian.series.OHLC.prototype['hoverRisingStroke'] = anychart.core.cartesian.series.OHLC.prototype.hoverRisingStroke;//doc|ex
anychart.core.cartesian.series.OHLC.prototype['selectRisingStroke'] = anychart.core.cartesian.series.OHLC.prototype.selectRisingStroke;
anychart.core.cartesian.series.OHLC.prototype['fallingStroke'] = anychart.core.cartesian.series.OHLC.prototype.fallingStroke;//doc|ex
anychart.core.cartesian.series.OHLC.prototype['hoverFallingStroke'] = anychart.core.cartesian.series.OHLC.prototype.hoverFallingStroke;//doc|ex
anychart.core.cartesian.series.OHLC.prototype['selectFallingStroke'] = anychart.core.cartesian.series.OHLC.prototype.selectFallingStroke;
