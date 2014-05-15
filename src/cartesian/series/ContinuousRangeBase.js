goog.provide('anychart.cartesian.series.ContinuousRangeBase');

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

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.lowPath = acgraph.path();

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
  this.lowPath.stroke(this.getFinalLowStroke(hover), 3);
  this.lowPath.fill(null);
  this.highPath.stroke(this.getFinalHighStroke(hover), 3);
  this.highPath.fill(null);
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousRangeBase.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {x: iterator.meta('x'), y: iterator.meta('high')};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} An instance of the {@link anychart.cartesian.series.ContinuousRangeBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.highStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
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
 * @return {acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} An instance of the {@link anychart.cartesian.series.ContinuousRangeBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverHighStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverHighStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
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
 * @return {acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} An instance of the {@link anychart.cartesian.series.ContinuousRangeBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.lowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
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
 * @return {acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.ContinuousRangeBase} An instance of the {@link anychart.cartesian.series.ContinuousRangeBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverLowStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverLowStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
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


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousRangeBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (goog.isFunction(this.highStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize highStroke function, you should reset it manually.');
    }
  } else {
    json['highStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.highStroke()));
  }

  if (goog.isFunction(this.hoverHighStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverHighStroke function, you should reset it manually.');
    }
  } else {
    json['hoverHighStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverHighStroke()));
  }

  if (goog.isFunction(this.lowStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize lowStroke function, you should reset it manually.');
    }
  } else {
    json['lowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.lowStroke()));
  }

  if (goog.isFunction(this.hoverLowStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverLowStroke function, you should reset it manually.');
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
  this.hoverMarkers(null);

  return result;
};
