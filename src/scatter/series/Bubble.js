goog.provide('anychart.scatter.series.Bubble');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.scatter.series.BaseWithMarkers');
goog.require('anychart.utils');



/**
 * Define Bubble series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.scatter.Chart#bubble}.
 * @example
 * anychart.scatter.series.bubble([[1, 1, 3], [2, 1, 1]]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.scatter.series.BaseWithMarkers}
 */
anychart.scatter.series.Bubble = function(data, opt_csvSettings) {
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

  this.hatchFill(false);

  this.markers().position(anychart.enums.Position.CENTER);
  this.labels().position(anychart.enums.Position.CENTER);
};
goog.inherits(anychart.scatter.series.Bubble, anychart.scatter.series.BaseWithMarkers);
anychart.scatter.series.Base.SeriesTypesMap[anychart.enums.ScatterSeriesTypes.BUBBLE] = anychart.scatter.series.Bubble;


// --- DiscreteBase ---
/**
 * @type {anychart.utils.TypedLayer}
 * @protected
 */
anychart.scatter.series.Bubble.prototype.rootElement = null;


/**
 * @type {anychart.utils.TypedLayer}
 * @protected
 */
anychart.scatter.series.Bubble.prototype.hatchFillRootElement = null;
// --- end DiscreteBase ---


/**
 * Supported consistency states. Adds DATA to base series states.
 * @type {number}
 */
anychart.scatter.series.Bubble.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.scatter.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.DATA;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.scatter.series.Bubble.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.scatter.series.Bubble.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.scatter.series.Bubble.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.scatter.series.Bubble.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.fill_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.negativeFill_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              this['sourceColor'])));
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.hoverNegativeFill_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              anychart.color.darken(
                  this['sourceColor']))));
});


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.hatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.hoverHatchFill_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.negativeHatchFill_ = null;


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.hoverNegativeHatchFill_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.scatter.series.Bubble.prototype.negativeStroke_ = (function() {
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
anychart.scatter.series.Bubble.prototype.hoverNegativeStroke_ = (function() {
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
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value Minimum size of the bubble.
 * @return {(string|number|anychart.scatter.series.Bubble)} Minimum size of the bubble or self for method chaining.
 */
anychart.scatter.series.Bubble.prototype.minimumSize = function(opt_value) {
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
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value maximum size of the bubble.
 * @return {(string|number|anychart.scatter.series.Bubble)} maximum size of the bubble or self for method chaining.
 */
anychart.scatter.series.Bubble.prototype.maximumSize = function(opt_value) {
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
 * See {@link anychart.scatter.series.Bubble#negativeFill}, {@link anychart.scatter.series.Bubble#negativeStroke},
 *   {@link anychart.scatter.series.Bubble#negativeHatchFill}
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {(boolean|anychart.scatter.series.Bubble)} Display negaitve setting or self for method chaining.
 */
anychart.scatter.series.Bubble.prototype.displayNegative = function(opt_value) {
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


// ----------------------
// --- DiscreteBase ---
// ----------------------
/** @inheritDoc */
anychart.scatter.series.Bubble.prototype.hoverSeries = function() {
  this.unhover();
  return this;
};


/** @inheritDoc */
anychart.scatter.series.Bubble.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) {
    if (this.getIterator().select(index))
      this.showTooltip(event);
    return this;
  }
  this.unhover();
  if (this.getIterator().select(index)) {
    this.colorizeShape(true);
    this.applyHatchFill(true);
    this.drawMarker(true);
    this.drawLabel(true);
    this.showTooltip(event);
  }
  this.hoverStatus = index;
  return this;
};


/** @inheritDoc */
anychart.scatter.series.Bubble.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.getIterator().select(this.hoverStatus)) {
    var rect = /** @type {acgraph.vector.Rect} */(this.getIterator().meta('shape'));
    if (goog.isDef(rect)) {
      this.colorizeShape(false);
      this.applyHatchFill(false);
      this.drawMarker(false);
      this.drawLabel(false);
    }
    this.hideTooltip();
  }
  this.hoverStatus = NaN;
  return this;
};
// ----------------------
// --- ContinuousBase ---
// ----------------------


/** @inheritDoc */
anychart.scatter.series.Bubble.prototype.isSizeBased = function() {
  return true;
};


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.scatter.series.Bubble.prototype.rootTypedLayerInitializer = function() {
  return acgraph.circle();
};


/**
 * @inheritDoc
 */
anychart.scatter.series.Bubble.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // --- DiscreteBase ---
  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.scatter.series.Base.ZINDEX_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var clip, bounds, axesLinesSpace;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.clip()) {
      if (goog.isBoolean(this.clip())) {
        bounds = this.pixelBoundsCache;
        axesLinesSpace = this.axesLinesSpace();
        clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
      } else {
        clip = /** @type {!anychart.math.Rect} */(this.clip());
      }
      this.rootLayer.clip(clip);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.rootElement.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (!this.hatchFillRootElement) {
      this.hatchFillRootElement = new anychart.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.scatter.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
  }
  // --- end DiscreteBase ---

  var categoryWidth = (this.xScale().getPointWidthRatio() || (1 / this.getIterator().getRowsCount())) *
      this.pixelBoundsCache.width / 2;

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
anychart.scatter.series.Bubble.prototype.calculateSizeScale = function(opt_minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.selfMinimumBubbleValue_ = Number.MAX_VALUE;
    this.selfMaximumBubbleValue_ = -Number.MAX_VALUE;

    var size;
    var iterator = this.data().getIterator();
    while (iterator.advance()) {
      size = +/** @type {number} */(iterator.get('size'));
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
anychart.scatter.series.Bubble.prototype.setAutoSizeScale = function(min, max) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
};


/**
 * Calculates bubble pixel size.
 * @param {number} size Size value from data.
 * @return {number|undefined} Pixel size of bubble.
 * @private
 */
anychart.scatter.series.Bubble.prototype.calculateSize_ = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) /
      (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size) || this.maximumBubbleValue_;
};


/** @inheritDoc */
anychart.scatter.series.Bubble.prototype.drawSeriesPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  var iterator = this.getIterator();
  var size = iterator.get('size');
  var pixSize = anychart.utils.toNumber(size);
  if (isNaN(pixSize))
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    size = this.calculateSize_(pixSize);

    if (size < 0 && !this.displayNegative_) return false;

    /** @type {!acgraph.vector.Circle} */
    var circle = /** @type {!acgraph.vector.Circle} */(this.rootElement.genNextChild());

    iterator.meta('x', x).meta('y', y).meta('size', size).meta('shape', circle);

    circle.radius(Math.abs(size)).centerX(x).centerY(y);

    this.colorizeShape(false);

    this.makeHoverable(circle);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
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
anychart.scatter.series.Bubble.prototype.colorizeShape = function(hover) {
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
anychart.scatter.series.Bubble.prototype.applyHatchFill = function(hover) {
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
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.scatter.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.scatter.series.Bubble.prototype.negativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.scatter.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.scatter.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
anychart.scatter.series.Bubble.prototype.getFinalNegativeStroke = function(hover) {
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
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green');
 * @example <c>Linear gradient fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['green', 'yellow']);
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['black', 'yellow'], 45, true, 0.5);
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.area([1, 4, 7, 1]).fill({
 *  src: 'http://static.anychart.com/underwater.jpg',
 *  mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.scatter.series.Base|Function} .
 */
anychart.scatter.series.Bubble.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green');
 * @example <c>Linear gradient fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['green', 'yellow']);
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['black', 'yellow'], 45, true, 0.5);
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.area([1, 4, 7, 1]).hoverFill({
 *  src: 'http://static.anychart.com/underwater.jpg',
 *  mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.scatter.series.Base|Function} .
 */
anychart.scatter.series.Bubble.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.hoverFill_;
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .negativeFill(['red', 'orange'])
 *  .container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @shortDescription Fill as a string or an object.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.scatter.series.Bubble|Function} .
 */
anychart.scatter.series.Bubble.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
 *   [1, 1.0, 2],
 *   [2, 1.6, -7],
 *   [3, 1.2, -4],
 *   [4, 1.9, 3]
 * ])
 *  .displayNegative(true)
 *  .hoverNegativeFill(['red', 'orange'])
 *  .container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @shortDescription Fill as a string or an object.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Bubble} {@link anychart.scatter.series.Bubble} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.scatter.series.Bubble|Function} .
 */
anychart.scatter.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
anychart.scatter.series.Bubble.prototype.getFinalNegativeFill = function(hover) {
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
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}
 * @example
 * var chart = anychart.columnChart();
 * chart.column([0.3, 3, 2.2, 1.7]).hatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.scatter.series.Bubble.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Getter for current hover hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hover hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}
 * @example
 * var chart = anychart.columnChart();
 * chart.column([0.3, 3, 2.2, 1.7]).hoverHatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.scatter.series.Bubble.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverHatchFill_)
      this.hoverHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}<br/>
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.scatter.series.Bubble.prototype.negativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * <b>Note:</b> Works only with {@link anychart.scatter.series.Bubble#displayNegative}.
 * @example
 * anychart.scatter.series.bubble([
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
 * @return {!anychart.scatter.series.Base} {@link anychart.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.scatter.series.Bubble.prototype.hoverNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
anychart.scatter.series.Bubble.prototype.getFinalNegativeHatchFill = function(hover) {
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
anychart.scatter.series.Bubble.prototype.createFormatProvider = function() {
  var provider = goog.base(this, 'createFormatProvider');
  provider['size'] = this.getIterator().get('size');
  return provider;
};


/**
 * @inheritDoc
 */
anychart.scatter.series.Bubble.prototype.getType = function() {
  return anychart.enums.ScatterSeriesTypes.BUBBLE;
};


/**
 * @inheritDoc
 */
anychart.scatter.series.Bubble.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['minimumSize'] = this.minimumSize();
  json['maximumSize'] = this.maximumSize();
  json['displayNegative'] = this.displayNegative();

  if (goog.isFunction(this.negativeFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeFill']
    );
  } else {
    json['negativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeFill()));
  }

  if (goog.isFunction(this.hoverNegativeFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeFill']
    );
  } else {
    json['hoverNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeFill()));
  }

  if (goog.isFunction(this.negativeStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeStroke']
    );
  } else {
    json['negativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.negativeStroke()));
  }

  if (goog.isFunction(this.hoverNegativeStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeStroke']
    );
  } else {
    json['hoverNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverNegativeStroke()));
  }

  if (goog.isFunction(this.negativeHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series negativeHatchFill']
    );
  } else {
    json['negativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeHatchFill()));
  }

  if (goog.isFunction(this.hoverNegativeHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series hoverNegativeHatchFill']
    );
  } else {
    json['hoverNegativeHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeHatchFill()));
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.scatter.series.Bubble.prototype.deserialize = function(config) {
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
anychart.scatter.series.Bubble.prototype.restoreDefaults = function() {
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
 * anychart.scatter.series.bubble([
 *     [1, 1.0, 2],
 *     [2, 1.6, 7],
 *     [3, 1.2, 4],
 *     [4, 1.9, 3],
 * ]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.scatter.series.Bubble}
 */
anychart.scatter.series.bubble = function(data, opt_csvSettings) {
  return new anychart.scatter.series.Bubble(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.scatter.series.bubble', anychart.scatter.series.bubble);
// --- DiscreteBase ---
anychart.scatter.series.Bubble.prototype['hoverSeries'] = anychart.scatter.series.Bubble.prototype.hoverSeries;//inherited
anychart.scatter.series.Bubble.prototype['hoverPoint'] = anychart.scatter.series.Bubble.prototype.hoverPoint;//inherited
anychart.scatter.series.Bubble.prototype['unhover'] = anychart.scatter.series.Bubble.prototype.unhover;//inherited
// --- end DiscreteBase ---
anychart.scatter.series.Bubble.prototype['minimumSize'] = anychart.scatter.series.Bubble.prototype.minimumSize;
anychart.scatter.series.Bubble.prototype['maximumSize'] = anychart.scatter.series.Bubble.prototype.maximumSize;
anychart.scatter.series.Bubble.prototype['displayNegative'] = anychart.scatter.series.Bubble.prototype.displayNegative;
anychart.scatter.series.Bubble.prototype['negativeFill'] = anychart.scatter.series.Bubble.prototype.negativeFill;
anychart.scatter.series.Bubble.prototype['hoverNegativeFill'] = anychart.scatter.series.Bubble.prototype.hoverNegativeFill;
anychart.scatter.series.Bubble.prototype['negativeStroke'] = anychart.scatter.series.Bubble.prototype.negativeStroke;
anychart.scatter.series.Bubble.prototype['hoverNegativeStroke'] = anychart.scatter.series.Bubble.prototype.hoverNegativeStroke;
anychart.scatter.series.Bubble.prototype['negativeHatchFill'] = anychart.scatter.series.Bubble.prototype.negativeHatchFill;
anychart.scatter.series.Bubble.prototype['hoverNegativeHatchFill'] = anychart.scatter.series.Bubble.prototype.hoverNegativeHatchFill;
anychart.scatter.series.Bubble.prototype['fill'] = anychart.scatter.series.Bubble.prototype.fill;//inherited
anychart.scatter.series.Bubble.prototype['hoverFill'] = anychart.scatter.series.Bubble.prototype.hoverFill;//inherited
anychart.scatter.series.Bubble.prototype['stroke'] = anychart.scatter.series.Bubble.prototype.stroke;//inherited
anychart.scatter.series.Bubble.prototype['hoverStroke'] = anychart.scatter.series.Bubble.prototype.hoverStroke;//inherited
anychart.scatter.series.Bubble.prototype['hatchFill'] = anychart.scatter.series.Bubble.prototype.hatchFill;//inherited
anychart.scatter.series.Bubble.prototype['hoverHatchFill'] = anychart.scatter.series.Bubble.prototype.hoverHatchFill;//inherited
