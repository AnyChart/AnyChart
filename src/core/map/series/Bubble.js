goog.provide('anychart.core.map.series.Bubble');
goog.require('anychart.core.map.series.DiscreteBase');



/**
 * Define Bubble series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.DiscreteBase}
 */
anychart.core.map.series.Bubble = function(opt_data, opt_csvSettings) {
  anychart.core.map.series.Bubble.base(this, 'constructor', opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['id', 'long', 'lat', 'size'];
  this.referenceValueMeanings = ['id', 'x', 'y', 'n'];
};
goog.inherits(anychart.core.map.series.Bubble, anychart.core.map.series.DiscreteBase);
anychart.core.map.series.Base.SeriesTypesMap[anychart.enums.MapSeriesType.BUBBLE] = anychart.core.map.series.Bubble;


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.getType = function() {
  return anychart.enums.MapSeriesType.BUBBLE;
};


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.map.series.Bubble.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.map.series.Bubble.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.map.series.Bubble.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.map.series.Bubble.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * Negative fill.
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.negativeFill_;


/**
 * Hover negative fill.
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeFill_;


/**
 * Select negative fill.
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.selectNegativeFill_;


/**
 * Negative hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.negativeHatchFill_ = null;


/**
 * Hover negative hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeHatchFill_;


/**
 * Select negative hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.selectNegativeHatchFill_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.negativeStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.map.series.Bubble.prototype.selectNegativeStroke_;


/**
 * Getter for current negative value option.
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {(boolean|anychart.core.map.series.Bubble)} Display negaitve setting or self for method chaining.
 */
anychart.core.map.series.Bubble.prototype.displayNegative = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.displayNegative_ != opt_value) {
      this.displayNegative_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.displayNegative_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for negative stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Bubble.prototype.negativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
                                                                    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.negativeStroke_) {
      this.negativeStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeStroke_;
};


/**
 * Getter/setter for hover negative stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
                                                                         opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverNegativeStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverNegativeStroke_;
};


/**
 * Getter/setter for select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.map.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.map.series.Bubble.prototype.selectNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
                                                                          opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectNegativeStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectNegativeStroke_;
};


/**
 * Method that gets final negative stroke, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.map.series.Bubble.prototype.getFinalNegativeStroke = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(iterator.get('negativeStroke') || this.negativeStroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        iterator.get('selectNegativeStroke') || this.selectNegativeStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        iterator.get('hoverNegativeStroke') || this.hoverNegativeStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Getter/setter for negative series fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Bubble|Function} .
 */
anychart.core.map.series.Bubble.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                  opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.negativeFill_) {
      this.negativeFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeFill_;
};


/**
 * Getter/setter for hover negative series fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.map.series.Bubble|Function} .
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                       opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverNegativeFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverNegativeFill_;
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
 * @return {acgraph.vector.Fill|anychart.core.map.series.Bubble|Function} .
 */
anychart.core.map.series.Bubble.prototype.selectNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
                                                                        opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectNegativeFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.selectNegativeFill_;
};


/**
 * Method to get final negative fill, with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.map.series.Bubble.prototype.getFinalNegativeFill = function(pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(iterator.get('negativeFill') || this.negativeFill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('selectNegativeFill') || this.selectNegativeFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        iterator.get('hoverNegativeFill') || this.hoverNegativeFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * Getter/setter for negative hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Bubble.prototype.negativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.negativeHatchFill_) {
      this.negativeHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeHatchFill_;
};


/**
 * Getter/setter for current hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Bubble.prototype.hoverNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.hoverNegativeHatchFill_ != hatchFill)
      this.hoverNegativeHatchFill_ = hatchFill;

    return this;
  }
  return this.hoverNegativeHatchFill_;
};


/**
 * Getter/setter for select hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.map.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.map.series.Bubble.prototype.selectNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.selectNegativeHatchFill_ != hatchFill)
      this.selectNegativeHatchFill_ = hatchFill;

    return this;
  }
  return this.selectNegativeHatchFill_;
};


/**
 * Method to get final negative hatch fill with all fallbacks taken into account.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final negative hatch fill for the current row.
 */
anychart.core.map.series.Bubble.prototype.getFinalNegativeHatchFill = function(pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (goog.isDef(iterator.get('negativeHatchFill'))) {
    normalHatchFill = iterator.get('negativeHatchFill');
  } else {
    normalHatchFill = this.negativeHatchFill();
  }

  var negativeHatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (goog.isDef(iterator.get('selectHatchFill'))) {
      negativeHatchFill = iterator.get('selectHatchFill');
    } else if (goog.isDef(this.selectNegativeHatchFill())) {
      negativeHatchFill = this.selectNegativeHatchFill();
    } else {
      negativeHatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (goog.isDef(iterator.get('hoverHatchFill'))) {
      negativeHatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverNegativeHatchFill())) {
      negativeHatchFill = this.hoverNegativeHatchFill();
    } else {
      negativeHatchFill = normalHatchFill;
    }
  } else {
    negativeHatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(negativeHatchFill)));
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.isSizeBased = function() {
  return true;
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.needDrawHatchFill = function() {
  return !!(
      this.hatchFill() ||
      this.hoverHatchFill() ||
      this.selectHatchFill() ||
      this.negativeHatchFill() ||
      this.hoverNegativeHatchFill() ||
      this.selectNegativeHatchFill()
  );
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.calculateSizeScale = function(opt_minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.selfMinimumBubbleValue_ = Number.POSITIVE_INFINITY;
    this.selfMaximumBubbleValue_ = Number.NEGATIVE_INFINITY;

    var size;
    var iter = this.data().getIterator();
    while (iter.advance()) {
      size = +/** @type {number} */(iter.get('size'));
      if (size > 0 || this.displayNegative_) {
        size = Math.abs(size);
        if (size > this.selfMaximumBubbleValue_)
          this.selfMaximumBubbleValue_ = size;
        if (size < this.selfMinimumBubbleValue_)
          this.selfMinimumBubbleValue_ = size;
      }
    }

    this.minimumBubbleValue_ = this.selfMinimumBubbleValue_;
    this.maximumBubbleValue_ = this.selfMaximumBubbleValue_;
  }
  if (opt_minMax) {
    this.minimumBubbleValue_ = opt_minMax[0] = Math.min(opt_minMax[0], this.selfMinimumBubbleValue_);
    this.maximumBubbleValue_ = opt_minMax[1] = Math.max(opt_minMax[1], this.selfMaximumBubbleValue_);
  } else if (isNaN(this.minimumBubbleValue_) || isNaN(this.maximumBubbleValue_)) {
    this.minimumBubbleValue_ = this.selfMinimumBubbleValue_;
    this.maximumBubbleValue_ = this.selfMaximumBubbleValue_;
  }
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.setAutoSizeScale = function(min, max, minSize, maxSize) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
  this.minimumSizeSetting_ = minSize;
  this.maximumSizeSetting_ = maxSize;
};


/**
 * Calculates bubble pixel size.
 * @param {number} size Size value from data.
 * @return {number|undefined} Pixel size of bubble.
 * @private
 */
anychart.core.map.series.Bubble.prototype.calculateSize_ = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) / (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  if (isNaN(ratio) || !isFinite(ratio))
    ratio = 0.5;
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size);
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.rootTypedLayerInitializer = function() {
  return acgraph.path();
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.createPositionProvider = function(position) {
  var referenceValues = this.getReferenceCoords();

  var x, y;
  if (referenceValues) {
    x = referenceValues[0];
    y = referenceValues[1];
  } else {
    x = 0;
    y = 0;
  }
  return {'value': {'x': x, 'y': y}};
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'n') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (anychart.utils.isNaN(val)) return null;
    res.push(val);
  }
  return res;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.map.series.Bubble.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;

  var scale = /** @type {anychart.scales.Geo} */(this.map.scale());
  var iterator = this.getIterator();
  var fail = false;

  var id = iterator.get(this.referenceValueNames[0]);
  var x = iterator.get(this.referenceValueNames[1]);
  var y = iterator.get(this.referenceValueNames[2]);
  var size = iterator.get(this.referenceValueNames[3]);

  var arrayMappingWithRegion = anychart.utils.isNaN(x) && x == id;

  x = parseFloat(x);
  y = parseFloat(y);

  var txCoords = scale.transform(x, y);
  if (!isNaN(x))
    x = txCoords[0];
  if (!isNaN(y) && !arrayMappingWithRegion)
    y = txCoords[1];

  if (isNaN(x) || isNaN(y)) {
    var features = iterator.meta('features');
    var prop = features && features.length ? features[0]['properties'] : null;
    if (prop) {
      iterator.meta('regionId', id);
      var position = this.getPositionByRegion()['value'];
      if (isNaN(x))
        x = position['x'];
      if (isNaN(y) || arrayMappingWithRegion)
        y = position['y'];
    } else {
      fail = true;
    }
  }

  if (anychart.utils.isNaN(size)) {
    fail = true;
  }

  return fail ? null : [x, y, size];
};


/**
 * @inheritDoc
 */
anychart.core.map.series.Bubble.prototype.startDrawing = function() {
  anychart.core.map.series.Bubble.base(this, 'startDrawing');

  this.pixelBoundsCache = this.map.scale().getBounds();

  this.calculateSizeScale();

  var size = Math.min(this.pixelBoundsCache.height, this.pixelBoundsCache.width);

  /**
   * Calculated minimum size value. For inner use.
   * @type {number}
   * @private
   */
  this.minimumSizeValue_ = anychart.utils.normalizeSize(this.minimumSizeSetting_, size);

  /**
   * Calculated maximum size value. For inner use.
   * @type {number}
   * @private
   */
  this.maximumSizeValue_ = anychart.utils.normalizeSize(this.maximumSizeSetting_, size);
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.applyZoomMoveTransform = function() {
  var domElement, trX, trY, selfTx;
  var iterator = this.getIterator();
  var referenceValues = this.getReferenceCoords();

  if (referenceValues) {
    var xPrev = /** @type {number} */(this.getIterator().meta('x'));
    var yPrev = /** @type {number} */(this.getIterator().meta('value'));

    var xNew = referenceValues[0];
    var yNew = referenceValues[1];

    domElement = iterator.meta('shape');
    selfTx = domElement.getSelfTransformation();

    trX = (selfTx ? -selfTx.getTranslateX() : 0) + xNew - xPrev;
    trY = (selfTx ? -selfTx.getTranslateY() : 0) + yNew - yPrev;

    domElement.translate(trX, trY);


    var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
    if (goog.isDefAndNotNull(hatchFillShape)) {
      hatchFillShape.translate(trX, trY);
    }
  }
  anychart.core.map.series.Bubble.base(this, 'applyZoomMoveTransform');
};


/** @inheritDoc */
anychart.core.map.series.Bubble.prototype.drawPoint = function(pointState) {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];
    var size = this.calculateSize_(referenceValues[2]);

    if (size < 0 && !this.displayNegative_) return;

    /** @type {!acgraph.vector.Path} */
    var circle = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());

    this.getIterator().meta('x', x).meta('value', y).meta('size', size).meta('shape', circle);

    var radius = Math.abs(size);
    circle.moveTo(x + radius, y).arcToAsCurves(radius, radius, 0, 360);

    this.colorizeShape(pointState | this.state.getSeriesState());
    this.makeInteractive(circle);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var iterator = this.getIterator();
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState | this.state.getSeriesState());
  }

  anychart.core.map.series.Bubble.base(this, 'drawPoint', pointState);
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.map.series.Bubble.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  var size = anychart.utils.toNumber(this.getIterator().meta('size'));
  if (goog.isDef(shape) && !isNaN(size)) {
    var stroke, fill;

    if (size < 0) {
      fill = this.getFinalNegativeFill(pointState);
      stroke = this.getFinalNegativeStroke(pointState);
    } else {
      fill = this.getFinalFill(true, pointState);
      stroke = this.getFinalStroke(true, pointState);
    }
    shape.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.ROUND);
    shape.fill(fill);
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.map.series.Bubble.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  var size = anychart.utils.toNumber(this.getIterator().meta('size'));
  if (goog.isDefAndNotNull(hatchFillShape) && !isNaN(size)) {
    var fill;
    if (size < 0) {
      fill = this.getFinalNegativeHatchFill(pointState);
    } else {
      fill = this.getFinalHatchFill(true, pointState);
    }
    hatchFillShape
        .stroke(null)
        .fill(fill);
  }
};


/**
 * @inheritDoc
 */
anychart.core.map.series.Bubble.prototype.serialize = function() {
  var json = anychart.core.map.series.Bubble.base(this, 'serialize');
  json['displayNegative'] = this.displayNegative();

  if (goog.isFunction(this.negativeFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeFill']
    );
  } else {
    json['negativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeFill()));
  }
  if (goog.isFunction(this.hoverNegativeFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeFill']
    );
  } else {
    json['hoverNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeFill()));
  }
  if (goog.isFunction(this.selectNegativeFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series selectNegativeFill']
    );
  } else {
    json['selectNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectNegativeFill()));
  }

  if (goog.isFunction(this.negativeStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeStroke']
    );
  } else {
    json['negativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.negativeStroke()));
  }
  if (goog.isFunction(this.hoverNegativeStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeStroke']
    );
  } else {
    json['hoverNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverNegativeStroke()));
  }
  if (goog.isFunction(this.selectNegativeStroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series selectNegativeStroke']
    );
  } else {
    json['selectNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectNegativeStroke()));
  }

  if (goog.isFunction(this.negativeHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeHatchFill']
    );
  } else {
    json['negativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeHatchFill()));
  }
  if (goog.isFunction(this.hoverNegativeHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeHatchFill']
    );
  } else {
    json['hoverNegativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeHatchFill()));
  }
  if (goog.isFunction(this.selectNegativeHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series selectNegativeHatchFill']
    );
  } else {
    json['selectNegativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectNegativeHatchFill()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.map.series.Bubble.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.map.series.Bubble.base(this, 'setupByJSON', config, opt_default);
  this.displayNegative(config['displayNegative']);

  this.negativeFill(config['negativeFill']);
  this.hoverNegativeFill(config['hoverNegativeFill']);
  this.selectNegativeFill(config['selectNegativeFill']);

  this.negativeStroke(config['negativeStroke']);
  this.hoverNegativeStroke(config['hoverNegativeStroke']);
  this.selectNegativeStroke(config['selectNegativeStroke']);

  this.negativeHatchFill(config['negativeHatchFill']);
  this.hoverNegativeHatchFill(config['hoverNegativeHatchFill']);
  this.selectNegativeHatchFill(config['selectNegativeHatchFill']);
};


//exports
(function() {
  var proto = anychart.core.map.series.Bubble.prototype;
  proto['displayNegative'] = proto.displayNegative;//doc|ex

  proto['negativeFill'] = proto.negativeFill;//doc|ex
  proto['hoverNegativeFill'] = proto.hoverNegativeFill;//doc|ex
  proto['selectNegativeFill'] = proto.selectNegativeFill;

  proto['negativeStroke'] = proto.negativeStroke;//doc|ex
  proto['hoverNegativeStroke'] = proto.hoverNegativeStroke;//doc|ex
  proto['selectNegativeStroke'] = proto.selectNegativeStroke;

  proto['negativeHatchFill'] = proto.negativeHatchFill;
  proto['hoverNegativeHatchFill'] = proto.hoverNegativeHatchFill;
  proto['selectNegativeHatchFill'] = proto.selectNegativeHatchFill;

  proto['fill'] = proto.fill;//inherited
  proto['hoverFill'] = proto.hoverFill;//inherited
  proto['selectFill'] = proto.selectFill;//inherited

  proto['stroke'] = proto.stroke;//inherited
  proto['hoverStroke'] = proto.hoverStroke;//inherited
  proto['selectStroke'] = proto.selectStroke;//inherited

  proto['hatchFill'] = proto.hatchFill;//inherited
  proto['hoverHatchFill'] = proto.hoverHatchFill;//inherited
  proto['selectHatchFill'] = proto.selectHatchFill;//inherited
})();
