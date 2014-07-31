goog.provide('anychart.cartesian.series.Bubble');

goog.require('anychart.cartesian.series.DiscreteBase');
goog.require('anychart.color');
goog.require('anychart.utils');



/**
 * Define Bubble series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.cartesian.Chart#bubble}.
 * @example <t>simple</t>
 * new anychart.cartesian.series.Bubble([[1, 1, 3], [2, 1, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.DiscreteBase}
 */
anychart.cartesian.series.Bubble = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  /**
   * Minimum bubble size.
   * @type {(string|number)}
   * @private
   */
  this.minimumSizeSetting_ = '10%';

  /**
   * Maximum bubble size.
   * @type {(string|number)}
   * @private
   */
  this.maximumSizeSetting_ = '95%';

  /**
   * Whether to display negative bubble or not.
   * @type {boolean}
   * @private
   */
  this.displayNegative_ = false;

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'size'];
  this.referenceValueMeanings = ['x', 'y', 'n'];
  this.referenceValuesSupportStack = false;

  this.markers().position(anychart.utils.NinePositions.CENTER);
  this.labels().position(anychart.utils.NinePositions.CENTER);
};
goog.inherits(anychart.cartesian.series.Bubble, anychart.cartesian.series.DiscreteBase);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.BUBBLE] = anychart.cartesian.series.Bubble;


/**
 * Supported consistency states. Adds DATA to base series states.
 * @type {number}
 */
anychart.cartesian.series.Bubble.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.negativeFill_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              this['sourceColor'])));
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeFill_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              anychart.color.darken(
                  this['sourceColor']))));
});


/**
 * Hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.negativeHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverNegativeHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.negativeStroke_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              anychart.color.darken(
                  this['sourceColor']))));
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              anychart.color.darken(
                  anychart.color.darken(
                      this['sourceColor'])))));
});


/**
 * Getter for current minimum bubble size.
 * @return {(string|number)} Minimum size of the bubble.
 *//**
 * Setter for minimum bubble size.
 * @example <t>simple</t>
 * new anychart.cartesian.series.Bubble([
 *      [1, 2, 3],
 *      [2, 2, 2],
 *      [3, 2, 1],
 *      ])
 *    .minimumSize(20)
 *    .maximumSize(80)
 *    .markers(null)
 *    .container(stage)
 *    .draw();
 * @param {(string|number)=} opt_value ['10%'] Minimum size of the bubble.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Minimum size of the bubble.
 * @return {(string|number|anychart.cartesian.series.Bubble)} Minimum size of the bubble or self for method chaining.
 */
anychart.cartesian.series.Bubble.prototype.minimumSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isString(opt_value) || goog.isNumber(opt_value)) ? opt_value : NaN;
    if (this.minimumSizeSetting_ != val) {
      this.minimumSizeSetting_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minimumSizeSetting_;
};


/**
 * Getter for current maximum bubble size.
 * @return {(string|number)} Maximum size of the bubble.
 *//**
 * Setter for maximum bubble size.<br/>
 * See example at {@link anychart.cartesian.series.Bubble#minimumSize}.
 * @param {(string|number)=} opt_value ['95%'] Maximum size of the bubble.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value maximum size of the bubble.
 * @return {(string|number|anychart.cartesian.series.Bubble)} maximum size of the bubble or self for method chaining.
 */
anychart.cartesian.series.Bubble.prototype.maximumSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isString(opt_value) || goog.isNumber(opt_value)) ? opt_value : NaN;
    if (this.maximumSizeSetting_ != val) {
      this.maximumSizeSetting_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maximumSizeSetting_;
};


/**
 * Getter for current negative value option.
 * @return {boolean} Display negaitve setting .
 *//**
 * Setter for negative value option.<br/>
 * <b>Note:</b> Отрицательные значения обрабатываются по модулю, но выделяются заливкой другого цвета.
 * См {@link anychart.cartesian.series.Bubble#negativeFill}, {@link anychart.cartesian.series.Bubble#negativeStroke}
 * @example <t>simple</t>
 * new anychart.cartesian.series.Bubble([
 *       [1, 2, 3],
 *       [2, 2, 2],
 *       [3, 2, 1],
 *       [4, 2, -1],
 *       [5, 2, -2]])
 *     .displayNegative(true)
 *     .markers(null)
 *     .container(stage)
 *     .draw();
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {(boolean|anychart.cartesian.series.Bubble)} Display negaitve setting or self for method chaining.
 */
anychart.cartesian.series.Bubble.prototype.displayNegative = function(opt_value) {
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


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.rootTypedLayerInitializer = function() {
  return acgraph.circle();
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  var categoryWidth = (this.xScale().getPointWidthRatio() || (1 / this.getIterator().getRowsCount())) *
      this.pixelBounds().width / 2;

  /**
   * Calculated minimum size value. For inner use.
   * @type {!number}
   * @private
   */
  this.minimumSizeValue_ = anychart.utils.normalize(this.minimumSizeSetting_, categoryWidth);

  /**
   * Calculated maximum size value. For inner use.
   * @type {!number}
   * @private
   */
  this.maximumSizeValue_ = anychart.utils.normalize(this.maximumSizeSetting_, categoryWidth);

  this.calculateSizeScale();
};


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.cartesian.series.Bubble.prototype.calculateSizeScale = function(opt_minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.selfMinimumBubbleValue_ = Number.MAX_VALUE;
    this.selfMaximumBubbleValue_ = -Number.MAX_VALUE;

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

    this.markConsistent(anychart.ConsistencyState.DATA);
  }
  if (opt_minMax) {
    opt_minMax[0] = Math.min(opt_minMax[0], this.selfMinimumBubbleValue_);
    opt_minMax[1] = Math.max(opt_minMax[1], this.selfMaximumBubbleValue_);
  }
};


/**
 *
 * @param {number} min .
 * @param {number} max .
 * @return {!anychart.cartesian.series.Bubble} .
 */
anychart.cartesian.series.Bubble.prototype.setAutoSizeScale = function(min, max) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
  return this;
};


/**
 * Calculates bubble pixel size.
 * @param {number} size Size value from data.
 * @return {number|undefined} Pixel size of bubble.
 * @private
 */
anychart.cartesian.series.Bubble.prototype.calculateSize_ = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) /
      (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size) || this.maximumBubbleValue_;
};


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var x = referenceValues[0];
    var y = referenceValues[1];
    var size = this.calculateSize_(referenceValues[2]);

    if (size < 0 && !this.displayNegative_) return false;

    /** @type {!acgraph.vector.Circle} */
    var circle = /** @type {!acgraph.vector.Circle} */(this.rootElement.genNextChild());

    this.getIterator().meta('x', x).meta('y', y).meta('size', size).meta('shape', circle);

    circle.radius(Math.abs(size)).centerX(x).centerY(y);

    this.colorizeShape(false);

    this.makeHoverable(circle);
  }


  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        (/** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild())) :
        null;
    var iterator = this.getIterator();
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
anychart.cartesian.series.Bubble.prototype.colorizeShape = function(hover) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  var size = +/** @type {number} */(this.getIterator().meta('size'));
  if (goog.isDef(shape) && !isNaN(size)) {
    var stroke, fill;

    if (size < 0) {
      fill = this.getFinalNegativeFill(hover);
      stroke = this.getFinalNegativeStroke(hover);
    } else {
      fill = this.getFinalFill(true, hover);
      stroke = this.getFinalStroke(true, hover);
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
anychart.cartesian.series.Bubble.prototype.applyHatchFill = function(hover) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  var size = +/** @type {number} */(this.getIterator().meta('size'));
  if (goog.isDefAndNotNull(hatchFillShape) && !isNaN(size)) {
    var fill;
    if (size < 0) {
      fill = this.getFinalNegativeHatchFill(hover);
    } else {
      fill = this.getFinalHatchFill(true, hover);
    }
    hatchFillShape
        .stroke(null)
        .fill(fill);
  }
};


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.categoriseData = function(categories) {
  goog.base(this, 'categoriseData', categories);
  this.invalidate(anychart.ConsistencyState.DATA);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * Stroke settings are described are:
 * {@link http://docs.anychart.com/__VERSION__/Elements_Fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings
 *    or fill settings.
 * @param {number=} opt_thickness [1] Stroke thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings
 *    or fill settings.
 * @param {number=} opt_thickness [1] Stroke thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Bubble.prototype.negativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.negativeStroke_) {
      this.negativeStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeStroke_;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for stroke settings.
 * Stroke settings are described at:
 * {@link http://docs.anychart.com/__VERSION__/Elements_Fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings
 *    or fill settings.
 * @param {number=} opt_thickness [1] Stroke thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Stroke settings
 *    or fill settings.
 * @param {number=} opt_thickness [1] Stroke thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverNegativeStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverNegativeStroke_;
};


/**
 * Method that gets final negative stroke, with all fallbacks taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Bubble.prototype.getFinalNegativeStroke = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      iterator.get('negativeStroke') ||
      this.negativeStroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              iterator.get('hoverNegativeStroke') ||
              this.hoverNegativeStroke() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Getter for the current series negative values.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Setter for series negative values fill by function.
 * @param {function():acgraph.vector.Fill=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -is a color returned by color() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Setter for series negative values fill by one value.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/Reference_Articles/elements-fill}<br/>
 * <b>Note:</b> <u>color</u> methid sets <u>fill</u> and <b>stroke</b>, which means it is not wise to pass
 * image fill here - stroke doesn't support it.
 * @shortDescription Setter for series color by one value.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys Color or gradient.
 * @param {number=} opt_opacityOrAngleOrCx Opacity, or gradient angle, or CenterX for radial gradient.
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy Fill
 *  mode or CenterY for radial gradient.
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode Opacity
 *  or fill mode.
 * @param {number=} opt_opacity Opacity (value from 0 to 1).
 * @param {number=} opt_fx The focus-point x-coordinate.
 * @param {number=} opt_fy The focus-point y-coordinate.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Bubble.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.negativeFill_) {
      this.negativeFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeFill_;
};


/**
 * Getter for the current series negative values.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Setter for series negative values fill by function.
 * @param {function():acgraph.vector.Fill=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -is a color returned by color() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Setter for series negative values fill by one value.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/Reference_Articles/elements-fill}<br/>
 * <b>Note:</b> <u>color</u> methid sets <u>fill</u> and <b>stroke</b>, which means it is not wise to pass
 * image fill here - stroke doesn't support it.
 * @shortDescription Setter for series color by one value.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys Color or gradient.
 * @param {number=} opt_opacityOrAngleOrCx Opacity, or gradient angle, or CenterX for radial gradient.
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy Fill
 *  mode or CenterY for radial gradient.
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode Opacity
 *  or fill mode.
 * @param {number=} opt_opacity Opacity (value from 0 to 1).
 * @param {number=} opt_fx The focus-point x-coordinate.
 * @param {number=} opt_fy The focus-point y-coordinate.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverNegativeFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // TODO: We don't set anything cause everything is fine?
    return this;
  }
  return this.hoverNegativeFill_;
};


/**
 * Method to get final negative fill, with all fallbacks taken into account.
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Bubble.prototype.getFinalNegativeFill = function(hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      iterator.get('negativeFill') ||
      this.negativeFill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              iterator.get('hoverNegativeFill') ||
              this.hoverNegativeFill() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Getter for current hatch fill settings for negative values.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hatch fill settings for negative values.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hatch fill.
 */
anychart.cartesian.series.Base.prototype.negativeHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    var hatchFill = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.negativeHatchFill_) {
      this.negativeHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeHatchFill_;
};


/**
 * Getter for current hover hatch fill settings for negative values.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hover hatch fill settings for negative values.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hatch fill.
 */
anychart.cartesian.series.Base.prototype.hoverNegativeHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    this.hoverNegativeHatchFill_ = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);
    return this;
  }
  return this.hoverNegativeHatchFill_;
};


/**
 * Method to get final negative hatch fill with all fallbacks taken into account.
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final negative hatch fill for the current row.
 */
anychart.cartesian.series.Base.prototype.getFinalNegativeHatchFill = function(hover) {
  var iterator = this.getIterator();
  var normalHatchFill = /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
      iterator.get('negativeHatchFill') ||
      this.negativeHatchFill());
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(hover ?
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
              iterator.get('hoverNegativeHatchFill') ||
              this.hoverNegativeHatchFill() ||
              normalHatchFill),
          normalHatchFill) :
      this.normalizeHatchFill(normalHatchFill));
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = anychart.cartesian.series.Type.BUBBLE;
  json['minimumSize'] = this.minimumSize();
  json['maximumSize'] = this.maximumSize();
  json['displayNegative'] = this.displayNegative();

  if (goog.isFunction(this.negativeFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize negativeFill function, please reset it manually.');
    }
  } else {
    json['negativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeFill()));
  }

  if (goog.isFunction(this.hoverNegativeFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverNegativeFill function, please reset it manually.');
    }
  } else {
    json['hoverNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeFill()));
  }

  if (goog.isFunction(this.negativeStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize negativeStroke function, please reset it manually.');
    }
  } else {
    json['negativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.negativeStroke()));
  }

  if (goog.isFunction(this.hoverNegativeStroke())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverNegativeStroke function, please reset it manually.');
    }
  } else {
    json['hoverNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverNegativeStroke()));
  }

  if (goog.isFunction(this.negativeHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize negativeHatchFill function, please reset it manually.');
    }
  } else {
    json['negativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeHatchFill()));
  }

  if (goog.isFunction(this.hoverNegativeHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We can not serialize hoverNegativeHatchFill function, please reset it manually.');
    }
  } else {
    json['hoverNegativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeHatchFill()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.minimumSize(config['minimumSize']);
  this.maximumSize(config['maximumSize']);
  this.displayNegative(config['displayNegative']);

  this.negativeFill(config['negativeFill']);
  this.hoverNegativeFill(config['hoverNegativeFill']);
  this.negativeStroke(config['negativeStroke']);
  this.hoverNegativeStroke(config['hoverNegativeStroke']);
  this.negativeHatchFill(config['negativeHatchFill']);
  this.hoverNegativeHatchFill(config['hoverNegativeHatchFill']);

  this.resumeSignalsDispatching(true);

  return this;
};


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  this.markers(null);
  this.hoverMarkers(null);

  return result;
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Bubble}
 */
anychart.cartesian.series.bubble = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Bubble(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.bubble', anychart.cartesian.series.bubble);
anychart.cartesian.series.Bubble.prototype['minimumSize'] = anychart.cartesian.series.Bubble.prototype.minimumSize;
anychart.cartesian.series.Bubble.prototype['maximumSize'] = anychart.cartesian.series.Bubble.prototype.maximumSize;
anychart.cartesian.series.Bubble.prototype['displayNegative'] = anychart.cartesian.series.Bubble.prototype.displayNegative;//in docs/
anychart.cartesian.series.Bubble.prototype['fill'] = anychart.cartesian.series.Bubble.prototype.fill;//in docs/
anychart.cartesian.series.Bubble.prototype['hoverFill'] = anychart.cartesian.series.Bubble.prototype.hoverFill;//in docs/
anychart.cartesian.series.Bubble.prototype['stroke'] = anychart.cartesian.series.Bubble.prototype.stroke;//in docs/
anychart.cartesian.series.Bubble.prototype['hoverStroke'] = anychart.cartesian.series.Bubble.prototype.hoverStroke;//in docs/
anychart.cartesian.series.Bubble.prototype['negativeFill'] = anychart.cartesian.series.Bubble.prototype.negativeFill;//in docs/
anychart.cartesian.series.Bubble.prototype['hoverNegativeFill'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeFill;//in docs/
anychart.cartesian.series.Bubble.prototype['negativeStroke'] = anychart.cartesian.series.Bubble.prototype.negativeStroke;//in docs/
anychart.cartesian.series.Bubble.prototype['hoverNegativeStroke'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke;//in docs/
anychart.cartesian.series.Bubble.prototype['hatchFill'] = anychart.cartesian.series.Bubble.prototype.hatchFill;//in docs/
anychart.cartesian.series.Bubble.prototype['hoverHatchFill'] = anychart.cartesian.series.Bubble.prototype.hoverHatchFill;//in docs/
anychart.cartesian.series.Bubble.prototype['negativeHatchFill'] = anychart.cartesian.series.Bubble.prototype.negativeHatchFill;
anychart.cartesian.series.Bubble.prototype['hoverNegativeHatchFill'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeHatchFill;
