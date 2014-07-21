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
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.CANDLESTICK] = anychart.cartesian.series.Candlestick;


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


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.risingHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.hoverRisingHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.fallingHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Candlestick.prototype.hoverFallingHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/** @inheritDoc */
anychart.cartesian.series.Candlestick.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  var iterator;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var x = referenceValues[0];
    var open = referenceValues[1];
    var high = referenceValues[2];
    var low = referenceValues[3];
    var close = referenceValues[4];

    iterator = this.getIterator();

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

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator = this.getIterator();
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }

    this.applyHatchFill(false);
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


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.cartesian.series.Candlestick.prototype.applyHatchFill = function(hover) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    var fill;
    if (!!this.getIterator().meta('rising')) {
      fill = this.getFinalRisingHatchFill(hover);
    } else {
      fill = this.getFinalFallingHatchFill(hover);
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
 * Set/get rising hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Rising hatch fill.
 */
anychart.cartesian.series.Candlestick.prototype.risingHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    var hatchFill = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.risingHatchFill_) {
      this.risingHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.risingHatchFill_;
};


/**
 * Set/get hover rising hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hover rising hatch fill.
 */
anychart.cartesian.series.Candlestick.prototype.hoverRisingHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    this.hoverRisingHatchFill_ = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);
    return this;
  }
  return this.hoverRisingHatchFill_;
};


/**
 * Method to get final rising hatch fill, with all fallbacks taken into account.
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final rising hatch fill for the current row.
 */
anychart.cartesian.series.Candlestick.prototype.getFinalRisingHatchFill = function(hover) {
  var iterator = this.getIterator();
  var normalHatchFill = /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
      iterator.get('risingHatchFill') || this.risingHatchFill());

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(hover ?
      this.normalizeHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
          iterator.get('hoverRisingHatchFill') || this.hoverRisingHatchFill() || normalHatchFill), normalHatchFill) :
      this.normalizeHatchFill(normalHatchFill));
};


/**
 * Set/get falling hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Falling hatch fill.
 */
anychart.cartesian.series.Candlestick.prototype.fallingHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    var hatchFill = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.fallingHatchFill_) {
      this.fallingHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fallingHatchFill_;
};


/**
 * Set/get hover falling hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hover falling hatch fill.
 */
anychart.cartesian.series.Candlestick.prototype.hoverFallingHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    this.hoverFallingHatchFill_ = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);
    return this;
  }
  return this.hoverFallingHatchFill_;
};


/**
 * Method to get final falling hatch fill, with all fallbacks taken into account.
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final falling hatch fill for the current row.
 */
anychart.cartesian.series.Candlestick.prototype.getFinalFallingHatchFill = function(hover) {
  var iterator = this.getIterator();
  var normalHatchFill = /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
      iterator.get('fallingHatchFill') || this.fallingHatchFill());

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(hover ?
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
              iterator.get('hoverFallingHatchFill') ||
              this.hoverFallingHatchFill() || normalHatchFill),
          normalHatchFill) :
      this.normalizeHatchFill(normalHatchFill));
};


/**
 * Common fill. Note: it can accept function as a first parameter.
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
 * Common fill. Note: it can accept function as a first parameter.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Candlestick.prototype.hoverRisingFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverRisingFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverRisingFill_;
};


/**
 * Method to get final stroke, with all fallbacks taken into account.
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
 * Common fill. Note: it can accept function as a first parameter.
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
 * Common fill. Note: it can accept function as a first parameter.
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
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverFallingFill_;
};


/**
 * Method to get final rising point stroke, with all fallbacks taken into account.
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
  json['seriesType'] = anychart.cartesian.series.Type.CANDLESTICK;

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


  if (goog.isFunction(this.fallingHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize fallingHatchFill function, you should reset it manually.');
    }
  } else {
    json['fallingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fallingHatchFill()));
  }

  if (goog.isFunction(this.hoverFallingHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverFallingHatchFill function, you should reset it manually.');
    }
  } else {
    json['hoverFallingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFallingHatchFill()));
  }


  if (goog.isFunction(this.risingHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize risingHatchFill function, you should reset it manually.');
    }
  } else {
    json['risingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.risingHatchFill()));
  }

  if (goog.isFunction(this.hoverRisingHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverRisingHatchFill function, you should reset it manually.');
    }
  } else {
    json['hoverRisingHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverRisingHatchFill()));
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

  this.risingHatchFill(config['risingHatchFill']);
  this.hoverRisingHatchFill(config['hoverRisingHatchFill']);
  this.fallingHatchFill(config['fallingHatchFill']);
  this.hoverFallingHatchFill(config['hoverFallingHatchFill']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Candlestick}
 */
anychart.cartesian.series.candlestick = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Candlestick(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.candlestick', anychart.cartesian.series.candlestick);
anychart.cartesian.series.Candlestick.prototype['risingFill'] = anychart.cartesian.series.Candlestick.prototype.risingFill;
anychart.cartesian.series.Candlestick.prototype['hoverRisingFill'] = anychart.cartesian.series.Candlestick.prototype.hoverRisingFill;
anychart.cartesian.series.Candlestick.prototype['fallingFill'] = anychart.cartesian.series.Candlestick.prototype.fallingFill;
anychart.cartesian.series.Candlestick.prototype['hoverFallingFill'] = anychart.cartesian.series.Candlestick.prototype.hoverFallingFill;
anychart.cartesian.series.Candlestick.prototype['risingHatchFill'] = anychart.cartesian.series.Candlestick.prototype.risingHatchFill;
anychart.cartesian.series.Candlestick.prototype['hoverRisingHatchFill'] = anychart.cartesian.series.Candlestick.prototype.hoverRisingHatchFill;
anychart.cartesian.series.Candlestick.prototype['fallingHatchFill'] = anychart.cartesian.series.Candlestick.prototype.fallingHatchFill;
anychart.cartesian.series.Candlestick.prototype['hoverFallingHatchFill'] = anychart.cartesian.series.Candlestick.prototype.hoverFallingHatchFill;
