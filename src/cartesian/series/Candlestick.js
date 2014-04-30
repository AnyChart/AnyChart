goog.provide('anychart.cartesian.series.Candlestick');

goog.require('anychart.cartesian.series.OHLC');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.OHLC}
 */
anychart.cartesian.series.Candlestick = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);
};
goog.inherits(anychart.cartesian.series.Candlestick, anychart.cartesian.series.OHLC);


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.risingFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.hoverRisingFill_ = (function() {
  return anychart.color.lighten(anychart.color.lighten(this['sourceColor']));
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.fallingFill_ = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.hoverFallingFill_ = (function() {
  return anychart.color.darken(anychart.color.darken(this['sourceColor']));
});


/** @inheritDoc */
anychart.cartesian.series.Candlestick.prototype.drawSubsequentPoint = function() {
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
        .lineTo(x, rising ? close : open)
        .close()
        .moveTo(x - widthHalf, open)
        .lineTo(x + widthHalf, open)
        .lineTo(x + widthHalf, close)
        .lineTo(x - widthHalf, close)
        .close()
        .moveTo(x, low)
        .lineTo(x, rising ? open : close)
        .close();

    this.colorizeShape(false);

    this.makeHoverable(path);
  }

  return true;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.cartesian.series.Candlestick.prototype.colorizeShape = function(hover) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    var stroke, fill;
    if (!!this.getIterator().meta('rising')) {
      fill = this.getFinalRisingFill(hover);
      stroke = this.getFinalRisingStroke(hover);
    } else {
      fill = this.getFinalFallingFill(hover);
      stroke = this.getFinalFallingStroke(hover);
    }
    shape.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.ROUND);
    shape.fill(fill);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Candlestick.prototype.risingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.risingFill_) {
      this.risingFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingFill_;
};


/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Candlestick.prototype.hoverRisingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverRisingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverRisingFill_;
};


/**
 * Метод, получающий финальное значение цвета заливки для растущей текущей точки с учетом всех fallback.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Candlestick.prototype.getFinalRisingFill = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      iterator.get('risingFill') ||
      this.risingFill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              iterator.get('hoverRisingFill') ||
              this.hoverRisingFill() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Candlestick.prototype.fallingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.fallingFill_) {
      this.fallingFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingFill_;
};


/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Candlestick.prototype.hoverFallingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFallingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverFallingFill_;
};


/**
 * Метод, получающий финальное значение цвета заливки для растущей текущей точки с учетом всех fallback.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Candlestick.prototype.getFinalFallingFill = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      iterator.get('fallingFill') ||
      this.fallingFill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              iterator.get('hoverFallingFill') ||
              this.hoverFallingFill() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Candlestick.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'candlestick';

  if (goog.isFunction(this.risingFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize risingFill function, you should reset it manually.');
    }
  } else {
    json['risingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.risingFill()));
  }

  if (goog.isFunction(this.hoverRisingFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverRisingFill function, you should reset it manually.');
    }
  } else {
    json['hoverRisingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverRisingFill()));
  }


  if (goog.isFunction(this.fallingFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize fallingFill function, you should reset it manually.');
    }
  } else {
    json['fallingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fallingFill()));
  }

  if (goog.isFunction(this.hoverFallingFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverFallingFill function, you should reset it manually.');
    }
  } else {
    json['hoverFallingFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFallingFill()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Candlestick.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.risingFill(config['risingFill']);
  this.hoverRisingFill(config['hoverRisingFill']);
  this.fallingFill(config['fallingFill']);
  this.hoverFallingFill(config['hoverFallingFill']);

  this.resumeSignalsDispatching(true);

  return this;
};
