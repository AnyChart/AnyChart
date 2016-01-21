goog.provide('anychart.core.cartesian.series.Candlestick');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.OHLC');



/**
 * Define Candlestick series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#candlestick} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.OHLC}
 */
anychart.core.cartesian.series.Candlestick = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
};
goog.inherits(anychart.core.cartesian.series.Candlestick, anychart.core.cartesian.series.OHLC);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.CANDLESTICK] = anychart.core.cartesian.series.Candlestick;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.risingFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverRisingFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.fallingFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverFallingFill_;


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.risingHatchFill_ = null;


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverRisingHatchFill_;


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.fallingHatchFill_ = null;


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverFallingHatchFill_;


/** @inheritDoc */
anychart.core.cartesian.series.Candlestick.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var x = /** @type {number} */(this.iterator.meta('x'));
    var open = /** @type {number} */(this.iterator.meta('open'));
    var high = /** @type {number} */(this.iterator.meta('high'));
    var low = /** @type {number} */(this.iterator.meta('low'));
    var close = /** @type {number} */(this.iterator.meta('close'));

    var rising = Number(this.iterator.get('open')) < Number(this.iterator.get('close'));

    /** @type {!acgraph.vector.Path} */
    var path = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
    var widthHalf = this.getPointWidth() / 2;

    this.iterator
        .meta('rising', rising)
        .meta('shape', path);

    path.clear()
        .moveTo(x, high)
        .lineTo(x, rising ? close : open)
        .moveTo(x - widthHalf, open)
        .lineTo(x + widthHalf, open)
        .lineTo(x + widthHalf, close)
        .lineTo(x - widthHalf, close)
        .lineTo(x - widthHalf, open)
        .moveTo(x, low)
        .lineTo(x, rising ? open : close);


    this.colorizeShape(pointState);

    this.makeInteractive(path);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    this.iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(this.iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState);
  }
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.cartesian.series.Candlestick.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    var stroke, fill;
    if (!!this.getIterator().meta('rising')) {
      fill = this.getFinalRisingFill(pointState);
      stroke = this.getFinalRisingStroke(pointState);
    } else {
      fill = this.getFinalFallingFill(pointState);
      stroke = this.getFinalFallingStroke(pointState);
    }

    var lineCap = stroke && stroke['dash'] && !anychart.utils.isNone(stroke['dash']) ?
        acgraph.vector.StrokeLineCap.BUTT :
        acgraph.vector.StrokeLineCap.ROUND;

    shape.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.MITER, lineCap);
    shape.fill(fill);
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.cartesian.series.Candlestick.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    var fill;
    if (!!this.getIterator().meta('rising')) {
      fill = this.getFinalRisingHatchFill(pointState);
    } else {
      fill = this.getFinalFallingHatchFill(pointState);
    }

    hatchFillShape
        .stroke(null)
        .fill(fill);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for risingHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.risingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.risingHatchFill_) {
      this.risingHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingHatchFill_;
};


/**
 * Getter/setter for hoverRisingHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverRisingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.hoverRisingHatchFill_ != hatchFill)
      this.hoverRisingHatchFill_ = hatchFill;

    return this;
  }
  return this.hoverRisingHatchFill_;
};


/**
 * Getter/setter for current hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.selectRisingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.selectRisingHatchFill_ != hatchFill)
      this.selectRisingHatchFill_ = hatchFill;

    return this;
  }
  return this.selectRisingHatchFill_;
};


/**
 * Method to get final rising hatch fill, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final rising hatch fill for the current row.
 */
anychart.core.cartesian.series.Candlestick.prototype.getFinalRisingHatchFill = function(pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (goog.isDef(iterator.get('risingHatchFill'))) {
    normalHatchFill = iterator.get('risingHatchFill');
  } else {
    normalHatchFill = this.risingHatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (goog.isDef(iterator.get('selectRisingHatchFill'))) {
      hatchFill = iterator.get('selectRisingHatchFill');
    } else if (goog.isDef(this.selectRisingHatchFill())) {
      hatchFill = this.selectRisingHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (goog.isDef(iterator.get('hoverRisingHatchFill'))) {
      hatchFill = iterator.get('hoverRisingHatchFill');
    } else if (goog.isDef(this.hoverRisingHatchFill())) {
      hatchFill = this.hoverRisingHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Getter/setter for fallingHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.fallingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.fallingHatchFill_) {
      this.fallingHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingHatchFill_;
};


/**
 * Getter/setter for hoverFallingHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverFallingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverFallingHatchFill_)
      this.hoverFallingHatchFill_ = hatchFill;

    return this;
  }
  return this.hoverFallingHatchFill_;
};


/**
 * Getter/setter for current hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Candlestick.prototype.selectFallingHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectFallingHatchFill_)
      this.selectFallingHatchFill_ = hatchFill;

    return this;
  }
  return this.selectFallingHatchFill_;
};


/**
 * Method to get final falling hatch fill, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final falling hatch fill for the current row.
 */
anychart.core.cartesian.series.Candlestick.prototype.getFinalFallingHatchFill = function(pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (goog.isDef(iterator.get('fallingHatchFill'))) {
    normalHatchFill = iterator.get('fallingHatchFill');
  } else {
    normalHatchFill = this.fallingHatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (goog.isDef(iterator.get('selectFallingHatchFill'))) {
      hatchFill = iterator.get('selectFallingHatchFill');
    } else if (goog.isDef(this.selectFallingHatchFill())) {
      hatchFill = this.selectFallingHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (goog.isDef(iterator.get('hoverFallingHatchFill'))) {
      hatchFill = iterator.get('hoverFallingHatchFill');
    } else if (goog.isDef(this.hoverFallingHatchFill())) {
      hatchFill = this.hoverFallingHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Getter/setter for risingFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.risingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                           opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.risingFill_) {
      this.risingFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingFill_;
};


/**
 * Getter/setter for hoverRisingFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverRisingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverRisingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverRisingFill_;
};


/**
 * Getter/setter for select series fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.selectRisingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectRisingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectRisingFill_;
};


/**
 * Method to get final stroke, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.Candlestick.prototype.getFinalRisingFill = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(iterator.get('risingFill') || this.risingFill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('selectRisingFill') || this.selectRisingFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('hoverRisingFill') || this.hoverRisingFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * Getter/setter for fallingFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.fallingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                            opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fallingFill_) {
      this.fallingFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingFill_;
};


/**
 * Getter/setter for hoverFallingFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.hoverFallingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                                 opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFallingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverFallingFill_;
};


/**
 * Getter/setter for select series falling fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Candlestick.prototype.selectFallingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectFallingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectFallingFill_;
};


/**
 * Method to get final rising point stroke, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.Candlestick.prototype.getFinalFallingFill = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(iterator.get('fallingFill') || this.fallingFill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('selectFallingFill') || this.selectFallingFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('hoverFallingFill') || this.hoverFallingFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/** @inheritDoc */
anychart.core.cartesian.series.Candlestick.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Candlestick.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.CANDLESTICK;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Candlestick.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (goog.isFunction(this.risingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series risingFill']
    );
  } else {
    json['risingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.risingFill()));
  }

  if (goog.isFunction(this.hoverRisingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series hoverRisingFill']
    );
  } else {
    json['hoverRisingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverRisingFill()));
  }

  if (goog.isFunction(this.selectRisingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series selectRisingFill']
    );
  } else {
    json['selectRisingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectRisingFill()));
  }


  if (goog.isFunction(this.fallingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series fallingFill']
    );
  } else {
    json['fallingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fallingFill()));
  }

  if (goog.isFunction(this.hoverFallingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series hoverFallingFill']
    );
  } else {
    json['hoverFallingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFallingFill()));
  }

  if (goog.isFunction(this.selectFallingFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series selectFallingFill']
    );
  } else {
    json['selectFallingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFallingFill()));
  }


  if (goog.isFunction(this.fallingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series fallingHatchFill']
    );
  } else {
    json['fallingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fallingHatchFill()));
  }

  if (goog.isFunction(this.hoverFallingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series hoverFallingHatchFill']
    );
  } else {
    json['hoverFallingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFallingHatchFill()));
  }

  if (goog.isFunction(this.selectFallingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series selectFallingHatchFill']
    );
  } else {
    json['selectFallingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFallingHatchFill()));
  }


  if (goog.isFunction(this.risingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series risingHatchFill']
    );
  } else {
    json['risingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.risingHatchFill()));
  }

  if (goog.isFunction(this.hoverRisingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series hoverRisingHatchFill']
    );
  } else {
    json['hoverRisingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverRisingHatchFill()));
  }

  if (goog.isFunction(this.selectRisingHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Candlestick Series selectRisingHatchFill']
    );
  } else {
    json['selectRisingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectRisingHatchFill()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Candlestick.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.risingFill(config['risingFill']);
  this.hoverRisingFill(config['hoverRisingFill']);
  this.selectRisingFill(config['hoverRisingFill']);

  this.fallingFill(config['fallingFill']);
  this.hoverFallingFill(config['hoverFallingFill']);
  this.selectFallingFill(config['hoverFallingFill']);

  this.risingHatchFill(config['risingHatchFill']);
  this.hoverRisingHatchFill(config['hoverRisingHatchFill']);
  this.selectRisingHatchFill(config['hoverRisingHatchFill']);

  this.fallingHatchFill(config['fallingHatchFill']);
  this.hoverFallingHatchFill(config['hoverFallingHatchFill']);
  this.selectFallingHatchFill(config['hoverFallingHatchFill']);
};


//exports
anychart.core.cartesian.series.Candlestick.prototype['risingFill'] = anychart.core.cartesian.series.Candlestick.prototype.risingFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['hoverRisingFill'] = anychart.core.cartesian.series.Candlestick.prototype.hoverRisingFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['selectRisingFill'] = anychart.core.cartesian.series.Candlestick.prototype.selectRisingFill;

anychart.core.cartesian.series.Candlestick.prototype['fallingFill'] = anychart.core.cartesian.series.Candlestick.prototype.fallingFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['hoverFallingFill'] = anychart.core.cartesian.series.Candlestick.prototype.hoverFallingFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['selectFallingFill'] = anychart.core.cartesian.series.Candlestick.prototype.selectFallingFill;

anychart.core.cartesian.series.Candlestick.prototype['risingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.risingHatchFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['hoverRisingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.hoverRisingHatchFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['selectRisingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.selectRisingHatchFill;

anychart.core.cartesian.series.Candlestick.prototype['fallingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.fallingHatchFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['hoverFallingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.hoverFallingHatchFill;//doc|ex
anychart.core.cartesian.series.Candlestick.prototype['selectFallingHatchFill'] = anychart.core.cartesian.series.Candlestick.prototype.selectFallingHatchFill;
