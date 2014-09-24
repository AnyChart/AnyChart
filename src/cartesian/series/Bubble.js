goog.provide('anychart.cartesian.series.Bubble');
goog.require('acgraph');
goog.require('anychart.cartesian.series.DiscreteBase');
goog.require('anychart.color');
goog.require('anychart.utils');



/**
 * Define Bubble series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.cartesian.Chart#bubble}.
 * @example
 * anychart.cartesian.series.bubble([[1, 1, 3], [2, 1, 1]]).container(stage).draw();
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

  this.markers().position(anychart.enums.Position.CENTER);
  this.labels().position(anychart.enums.Position.CENTER);
};
goog.inherits(anychart.cartesian.series.Bubble, anychart.cartesian.series.DiscreteBase);
anychart.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.BUBBLE] = anychart.cartesian.series.Bubble;


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
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.negativeHatchFill_ = null;


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeHatchFill_;


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
 * @example
 * anychart.cartesian.series.bubble([
 *      [0, 2, 1],
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
 * Setter for maximum bubble size.
 * @example
 * anychart.cartesian.series.bubble([
 *      [0, 2, 1],
 *      [1, 2, 3],
 *      [2, 2, 2],
 *      [3, 2, 1],
 *      ])
 *    .minimumSize(20)
 *    .maximumSize(80)
 *    .markers(null)
 *    .container(stage)
 *    .draw();
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
 * <b>Note:</b> Negative values are sized basing on absolute value, but shown in a different color.
 * See {@link anychart.cartesian.series.Bubble#negativeFill}, {@link anychart.cartesian.series.Bubble#negativeStroke},
 *   {@link anychart.cartesian.series.Bubble#negativeHatchFill}
 * @example
 * anychart.cartesian.series.bubble([
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
anychart.cartesian.series.Bubble.prototype.isSizeBased = function() {
  return true;
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
  this.minimumSizeValue_ = anychart.utils.normalizeSize(this.minimumSizeSetting_, categoryWidth);

  /**
   * Calculated maximum size value. For inner use.
   * @type {!number}
   * @private
   */
  this.maximumSizeValue_ = anychart.utils.normalizeSize(this.maximumSizeSetting_, categoryWidth);

  this.calculateSizeScale();
};


/** @inheritDoc */
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


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.setAutoSizeScale = function(min, max) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
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
    var iterator = this.getIterator();
    var hatchFillShape = iterator.meta('hatchFillShape');
    if (!hatchFillShape) {
      hatchFillShape = this.hatchFillRootElement ?
          /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
          null;
      iterator.meta('hatchFillShape', hatchFillShape);
    }
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
  var size = anychart.utils.toNumber(this.getIterator().meta('size'));
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
  var size = anychart.utils.toNumber(this.getIterator().meta('size'));
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
 * Setter for series stroke by function.<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeStroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 *   )
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Bubble.prototype.negativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeStroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 *   )
 *  .container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeStroke('orange', 3, '5 2', 'round')
 *  .container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill(['red', 'orange'])
 *  .container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @shortDescription Fill as a string or an object.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill('green', 0.3)
 *  .container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill(['black', 'yellow'], 45, true, 0.5)
 *  .container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 *  .container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 *   })
 *  .container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Bubble|Function} .
 */
anychart.cartesian.series.Bubble.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill(['red', 'orange'])
 *  .container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @shortDescription Fill as a string or an object.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill('green', 0.3)
 *  .container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill(['black', 'yellow'], 45, true, 0.5)
 *  .container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 *  .container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 *   })
 *  .container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.cartesian.series.Bubble} {@link anychart.cartesian.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Bubble|Function} .
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeHatchFill('diamiond', 'grey', 5, 5)
 *  .container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.cartesian.series.Bubble.prototype.negativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.negativeHatchFill_) {
      this.negativeHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.negativeHatchFill_;
};


/**
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}<br/>
 * <b>Note:</b> Works only with {@link anychart.cartesian.series.Bubble#displayNegative}.
 * @example
 * anychart.cartesian.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeHatchFill('diamiond', 'grey', 5, 5)
 *  .container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Method to get final negative hatch fill with all fallbacks taken into account.
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final negative hatch fill for the current row.
 */
anychart.cartesian.series.Bubble.prototype.getFinalNegativeHatchFill = function(hover) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (goog.isDef(iterator.get('negativeHatchFill'))) {
    normalHatchFill = iterator.get('negativeHatchFill');
  } else {
    normalHatchFill = this.negativeHatchFill();
  }

  var hatchFill;
  if (hover) {
    if (goog.isDef(iterator.get('hoverNegativeHatchFill'))) {
      hatchFill = iterator.get('hoverNegativeHatchFill');
    } else if (goog.isDef(this.hoverNegativeHatchFill())) {
      hatchFill = this.hoverNegativeHatchFill();
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
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.BUBBLE;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
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

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.contentFormatter(function() {
    return parseFloat(this.value).toFixed(2);
  });

  return result;
};


/**
 * Constructor function for bubble series.
 * @example
 * anychart.cartesian.series.bubble([
 *     [1, 1.0, 2],
 *     [2, 1.6, 7],
 *     [3, 1.2, 4],
 *     [4, 1.9, 3],
 * ]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Bubble}
 */
anychart.cartesian.series.bubble = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Bubble(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.bubble', anychart.cartesian.series.bubble);//doc|ex
anychart.cartesian.series.Bubble.prototype['minimumSize'] = anychart.cartesian.series.Bubble.prototype.minimumSize;//doc|ex
anychart.cartesian.series.Bubble.prototype['maximumSize'] = anychart.cartesian.series.Bubble.prototype.maximumSize;//doc|ex
anychart.cartesian.series.Bubble.prototype['displayNegative'] = anychart.cartesian.series.Bubble.prototype.displayNegative;//doc|ex
anychart.cartesian.series.Bubble.prototype['negativeFill'] = anychart.cartesian.series.Bubble.prototype.negativeFill;//doc|ex
anychart.cartesian.series.Bubble.prototype['hoverNegativeFill'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeFill;//doc|ex
anychart.cartesian.series.Bubble.prototype['negativeStroke'] = anychart.cartesian.series.Bubble.prototype.negativeStroke;//doc|ex
anychart.cartesian.series.Bubble.prototype['hoverNegativeStroke'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke;//doc|ex
anychart.cartesian.series.Bubble.prototype['negativeHatchFill'] = anychart.cartesian.series.Bubble.prototype.negativeHatchFill;
anychart.cartesian.series.Bubble.prototype['hoverNegativeHatchFill'] = anychart.cartesian.series.Bubble.prototype.hoverNegativeHatchFill;
anychart.cartesian.series.Bubble.prototype['fill'] = anychart.cartesian.series.Bubble.prototype.fill;//inherited
anychart.cartesian.series.Bubble.prototype['hoverFill'] = anychart.cartesian.series.Bubble.prototype.hoverFill;//inherited
anychart.cartesian.series.Bubble.prototype['stroke'] = anychart.cartesian.series.Bubble.prototype.stroke;//inherited
anychart.cartesian.series.Bubble.prototype['hoverStroke'] = anychart.cartesian.series.Bubble.prototype.hoverStroke;//inherited
anychart.cartesian.series.Bubble.prototype['hatchFill'] = anychart.cartesian.series.Bubble.prototype.hatchFill;//inherited
anychart.cartesian.series.Bubble.prototype['hoverHatchFill'] = anychart.cartesian.series.Bubble.prototype.hoverHatchFill;//inherited
