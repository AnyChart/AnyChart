goog.provide('anychart.core.cartesian.series.ContinuousRangeBase');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.ContinuousBase');



/**
 * A base for all continuous series, like lines, splines, areas, etc.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousBase}
 */
anychart.core.cartesian.series.ContinuousRangeBase = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.seriesSupportsError = false;

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.highPath = acgraph.path();
  this.highPath.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES + 0.1);
  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.lowPath = acgraph.path();
  this.lowPath.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.highPath, this.lowPath);
};
goog.inherits(anychart.core.cartesian.series.ContinuousRangeBase, anychart.core.cartesian.series.ContinuousBase);


/**
 * Pairs of zero coords + missing or not (boolean) in case of stacked y scale.
 * E.g. [x1:number, zeroY1:number, isMissing1:boolean, x2:number, zeroY2:number, isMissing2:boolean, ...]
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.lowsStack;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.highStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectHighStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.lowStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectLowStroke_;


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // No points were drawn before
  this.lowsStack = null;
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.colorizeShape = function(pointState) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, pointState));
  this.lowPath.stroke(this.getFinalLowStroke(pointState), 1);
  this.lowPath.fill(null);
  this.highPath.stroke(this.getFinalHighStroke(pointState), 1);
  this.highPath.fill(null);
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('high')}};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for highStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.highStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter/setter for hoverHighStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectHighStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
                                                                                         opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectHighStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectHighStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.getFinalHighStroke = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(iterator.get('highStroke') || this.highStroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('selectHighStroke')) || this.selectHighStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('hoverHighStroke')) || this.hoverHighStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Getter/setter for lowStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.lowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter/setter for hoverLowStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.ContinuousRangeBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectLowStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
                                                                                        opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectLowStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectLowStroke_;
};


/**
 * Method that gets final color of the line, all fallbacks are taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.getFinalLowStroke = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(iterator.get('lowStroke') || this.lowStroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('selectLowStroke')) || this.selectLowStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (iterator.get('hoverLowStroke')) || this.hoverLowStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());

      var seriesState = this.state.getSeriesState();
      this.applyHatchFill(seriesState);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (goog.isFunction(this.highStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series highStroke']
    );
  } else {
    json['highStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.highStroke()));
  }

  if (goog.isFunction(this.hoverHighStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverHighStroke']
    );
  } else {
    json['hoverHighStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverHighStroke()));
  }

  if (goog.isFunction(this.selectHighStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectHighStroke']
    );
  } else {
    if (goog.isDef(this.selectHighStroke_)) {
      json['selectHighStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectHighStroke()));
    }
  }

  if (goog.isFunction(this.lowStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series lowStroke']
    );
  } else {
    json['lowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.lowStroke()));
  }

  if (goog.isFunction(this.hoverLowStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverLowStroke']
    );
  } else {
    json['hoverLowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverLowStroke()));
  }

  if (goog.isFunction(this.selectLowStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series selectLowStroke']
    );
  } else {
    if (goog.isDef(this.selectLowStroke_)) {
      json['selectLowStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectLowStroke()));
    }
  }
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousRangeBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.highStroke(config['highStroke']);
  this.hoverHighStroke(config['hoverHighStroke']);
  this.selectHighStroke(config['selectHighStroke']);

  this.lowStroke(config['lowStroke']);
  this.hoverLowStroke(config['hoverLowStroke']);
  this.selectLowStroke(config['selectLowStroke']);
};


//exports
anychart.core.cartesian.series.ContinuousRangeBase.prototype['fill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.fill;//inherited
anychart.core.cartesian.series.ContinuousRangeBase.prototype['hoverFill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverFill;//inherited
anychart.core.cartesian.series.ContinuousRangeBase.prototype['selectFill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectFill;//inherited

anychart.core.cartesian.series.ContinuousRangeBase.prototype['highStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.highStroke;//doc|ex
anychart.core.cartesian.series.ContinuousRangeBase.prototype['hoverHighStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverHighStroke;//doc|ex
anychart.core.cartesian.series.ContinuousRangeBase.prototype['selectHighStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectHighStroke;//doc|ex

anychart.core.cartesian.series.ContinuousRangeBase.prototype['lowStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.lowStroke;//doc|ex
anychart.core.cartesian.series.ContinuousRangeBase.prototype['hoverLowStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverLowStroke;//doc|ex
anychart.core.cartesian.series.ContinuousRangeBase.prototype['selectLowStroke'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectLowStroke;//doc|ex

anychart.core.cartesian.series.ContinuousRangeBase.prototype['hatchFill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.hatchFill;//inherited
anychart.core.cartesian.series.ContinuousRangeBase.prototype['hoverHatchFill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.ContinuousRangeBase.prototype['selectHatchFill'] = anychart.core.cartesian.series.ContinuousRangeBase.prototype.selectHatchFill;//inherited
