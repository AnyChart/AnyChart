goog.provide('anychart.cartesian.series.ContinuousRangeBase');
goog.require('acgraph');
goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * A base for all continuous series, like lines, splines, areas, etc.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.ContinuousRangeBase = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.highPath = acgraph.path();
  this.highPath.zIndex(anychart.cartesian.series.Base.ZINDEX_SERIES + 0.1);
  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.lowPath = acgraph.path();
  this.lowPath.zIndex(anychart.cartesian.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.highPath, this.lowPath);
};
goog.inherits(anychart.cartesian.series.ContinuousRangeBase, anychart.cartesian.series.ContinuousBase);


/**
 * Pairs of zero coords + missing or not (boolean) in case of stacked y scale.
 * E.g. [x1:number, zeroY1:number, isMissing1:boolean, x2:number, zeroY2:number, isMissing2:boolean, ...]
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.lowsStack;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.highStroke_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.lowStroke_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // No points were drawn before
  this.lowsStack = null;
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.colorizeShape = function(hover) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, hover));
  this.lowPath.stroke(this.getFinalLowStroke(hover), 1);
  this.lowPath.fill(null);
  this.highPath.stroke(this.getFinalHighStroke(hover), 1);
  this.highPath.fill(null);
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('high')}};
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
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .lowStroke('4 orange')
 *   .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .lowStroke('orange', 3, '5 2', 'round')
 *   .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.highStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.highStroke_) {
      this.highStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.highStroke_;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .hoverHighStroke('4 orange')
 *   .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .hoverHighStroke('orange', 3, '5 2', 'round')
 *   .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverHighStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverHighStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.getFinalHighStroke = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('highStroke') ||
      this.highStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              iterator.get('hoverHighStroke') ||
              this.hoverHighStroke() ||
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
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .lowStroke('4 orange')
 *   .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .lowStroke('orange', 3, '5 2', 'round')
 *   .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.lowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.lowStroke_) {
      this.lowStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.lowStroke_;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .hoverLowStroke('4 orange')
 *   .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * anychart.cartesian.series.rangeArea([
 *     [0, 2, 3],
 *     [1, 3, 6],
 *     [2, 2, 4]
 *   ])
 *   .hoverLowStroke('orange', 3, '5 2', 'round')
 *   .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} {@link anychart.cartesian.series.ContinuousRangeBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverLowStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverLowStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.getFinalLowStroke = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('lowStroke') ||
      this.lowStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              iterator.get('hoverLowStroke') ||
              this.hoverLowStroke() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());
      this.applyHatchFill(false);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.calculateStatistics = function() {
  this.statistics('seriesMax', -Infinity);
  this.statistics('seriesMin', Infinity);
  this.statistics('seriesSum', 0);
  this.statistics('seriesAverage', 0);
  this.statistics('seriesPointsCount', this.getIterator().getRowsCount());
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (goog.isFunction(this.highStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize highStroke function, please reset it manually.');
    }
  } else {
    json['highStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.highStroke()));
  }

  if (goog.isFunction(this.hoverHighStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverHighStroke function, please reset it manually.');
    }
  } else {
    json['hoverHighStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverHighStroke()));
  }

  if (goog.isFunction(this.lowStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize lowStroke function, please reset it manually.');
    }
  } else {
    json['lowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.lowStroke()));
  }

  if (goog.isFunction(this.hoverLowStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverLowStroke function, please reset it manually.');
    }
  } else {
    json['hoverLowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverLowStroke()));
  }
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.highStroke(config['highStroke']);
  this.hoverHighStroke(config['hoverHighStroke']);
  this.lowStroke(config['lowStroke']);
  this.hoverLowStroke(config['hoverLowStroke']);

  this.resumeSignalsDispatching(false);
  return this;
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  this.markers(null);
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.content().hAlign('left');
  tooltip.contentFormatter(function() {
    return 'High: ' + parseFloat(this['high']).toFixed(2) + '\n' +
        'Low: ' + parseFloat(this['low']).toFixed(2);
  });

  return result;
};


//exports
anychart.cartesian.series.ContinuousRangeBase.prototype['fill'] = anychart.cartesian.series.ContinuousRangeBase.prototype.fill;//inherited
anychart.cartesian.series.ContinuousRangeBase.prototype['hoverFill'] = anychart.cartesian.series.ContinuousRangeBase.prototype.hoverFill;//inherited
anychart.cartesian.series.ContinuousRangeBase.prototype['highStroke'] = anychart.cartesian.series.ContinuousRangeBase.prototype.highStroke;//doc|ex
anychart.cartesian.series.ContinuousRangeBase.prototype['hoverHighStroke'] = anychart.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke;//doc|ex
anychart.cartesian.series.ContinuousRangeBase.prototype['lowStroke'] = anychart.cartesian.series.ContinuousRangeBase.prototype.lowStroke;//doc|ex
anychart.cartesian.series.ContinuousRangeBase.prototype['hoverLowStroke'] = anychart.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke;//doc|ex
anychart.cartesian.series.ContinuousRangeBase.prototype['hatchFill'] = anychart.cartesian.series.ContinuousRangeBase.prototype.hatchFill;//inherited
anychart.cartesian.series.ContinuousRangeBase.prototype['hoverHatchFill'] = anychart.cartesian.series.ContinuousRangeBase.prototype.hoverHatchFill;//inherited
