goog.provide('anychart.cartesian.series.OHLC');
goog.require('acgraph');
goog.require('anychart.cartesian.series.WidthBased');
goog.require('anychart.utils.TypedLayer');



/**
 * Define OHLC series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#ohlc}.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.WidthBased}
 */
anychart.cartesian.series.OHLC = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'open', 'high', 'low', 'close'];
  this.referenceValueMeanings = ['x', 'y', 'y', 'y', 'y'];
  this.referenceValuesSupportStack = false;
};
goog.inherits(anychart.cartesian.series.OHLC, anychart.cartesian.series.WidthBased);
anychart.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.OHLC] = anychart.cartesian.series.OHLC;


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
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .risingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    })
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .risingStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.OHLC.prototype.risingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverRisingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    })
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverRisingStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.OHLC.prototype.hoverRisingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Method that gets final color of the line, all fallbacks are taken into account.
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
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .fallingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    })
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .fallingStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.OHLC.prototype.fallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverFallingStroke(
 *    function(){
 *      return '3 '+ this.sourceColor;
 *    })
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.ohlc([
 *   [0, 2, 4, 1, 3],
 *   [1, 3, 5, 1, 2],
 *   [2, 2, 5, 1, 4]
 *  ])
 *  .hoverFallingStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.OHLC} {@link anychart.cartesian.series.OHLC} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.OHLC|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.OHLC.prototype.hoverFallingStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Method that gets final color of the line, all fallbacks are taken into account.
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.calculateStatistics = function() {
  this.statistics('seriesMax', -Infinity);
  this.statistics('seriesMin', Infinity);
  this.statistics('seriesSum', 0);
  this.statistics('seriesAverage', 0);
  this.statistics('seriesPointsCount', this.getIterator().getRowsCount());
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.OHLC.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.OHLC;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.OHLC.prototype.serialize = function() {
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
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.OHLC.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);
  this.risingStroke(config['risingStroke']);
  this.hoverRisingStroke(config['hoverRisingStroke']);
  this.fallingStroke(config['fallingStroke']);
  this.hoverFallingStroke(config['hoverFallingStroke']);
  this.resumeSignalsDispatching(true);
  return this;
};


/** @inheritDoc */
anychart.cartesian.series.OHLC.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  this.markers(null);

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.content().hAlign('left');
  tooltip.contentFormatter(function() {
    return 'O: ' + parseFloat(this['open']).toFixed(4) + '\n' +
        'H: ' + parseFloat(this['high']).toFixed(4) + '\n' +
        'L: ' + parseFloat(this['low']).toFixed(4) + '\n' +
        'C: ' + parseFloat(this['close']).toFixed(4) + '\n';
  });

  var labels = /** @type {anychart.elements.LabelsFactory} */(this.labels());
  labels.textFormatter(function() {
    return this['x'];
  });
  labels.offsetY(-10);

  return result;
};


/**
 * Constructor function for OHLC series.
 * @example
 * anychart.cartesian.series.ohlc([
 *  [0, 2, 4, 1, 3],
 *  [1, 3, 5, 1, 2],
 *  [2, 2, 5, 1, 4]
 * ]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.OHLC}
 */
anychart.cartesian.series.ohlc = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.OHLC(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.ohlc', anychart.cartesian.series.ohlc);//doc|ex
anychart.cartesian.series.OHLC.prototype['risingStroke'] = anychart.cartesian.series.OHLC.prototype.risingStroke;//doc|ex
anychart.cartesian.series.OHLC.prototype['hoverRisingStroke'] = anychart.cartesian.series.OHLC.prototype.hoverRisingStroke;//doc|ex
anychart.cartesian.series.OHLC.prototype['fallingStroke'] = anychart.cartesian.series.OHLC.prototype.fallingStroke;//doc|ex
anychart.cartesian.series.OHLC.prototype['hoverFallingStroke'] = anychart.cartesian.series.OHLC.prototype.hoverFallingStroke;//doc|ex
