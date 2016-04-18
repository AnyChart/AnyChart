goog.provide('anychart.core.scatter.series.Bubble');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.scatter.series.BaseWithMarkers');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.utils');



/**
 * Define Bubble series type.<br/>
 * Get instance by methods {@link anychart.charts.Scatter#bubble}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.scatter.series.BaseWithMarkers}
 */
anychart.core.scatter.series.Bubble = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * Minimum bubble size.
   * @type {(string|number)}
   * @private
   */
  this.minimumSizeSetting_;

  /**
   * Maximum bubble size.
   * @type {(string|number)}
   * @private
   */
  this.maximumSizeSetting_;

  /**
   * Whether to display negative bubble or not.
   * @type {boolean}
   * @private
   */
  this.displayNegative_ = false;
};
goog.inherits(anychart.core.scatter.series.Bubble, anychart.core.scatter.series.BaseWithMarkers);
anychart.core.scatter.series.Base.SeriesTypesMap[anychart.enums.ScatterSeriesType.BUBBLE] = anychart.core.scatter.series.Bubble;


// --- DiscreteBase ---
/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.scatter.series.Bubble.prototype.rootElement = null;


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.scatter.series.Bubble.prototype.hatchFillRootElement = null;
// --- end DiscreteBase ---


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.negativeFill_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              this['sourceColor'])));
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.hoverNegativeFill_ = (function() {
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
anychart.core.scatter.series.Bubble.prototype.negativeHatchFill_ = null;


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|null)}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.hoverNegativeHatchFill_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.scatter.series.Bubble.prototype.negativeStroke_ = (function() {
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
anychart.core.scatter.series.Bubble.prototype.hoverNegativeStroke_ = (function() {
  return anychart.color.darken(
      anychart.color.darken(
          anychart.color.darken(
              anychart.color.darken(
                  anychart.color.darken(
                      this['sourceColor'])))));
});


/**
 * Getter/setter for minimumSize.
 * @deprecated Use chart.minBubbleSize() instead.
 * @param {(string|number)=} opt_value Minimum size of the bubble.
 * @return {(string|number|anychart.core.scatter.series.Bubble)} Minimum size of the bubble or self for method chaining.
 */
anychart.core.scatter.series.Bubble.prototype.minimumSize = function(opt_value) {
  anychart.utils.warning(anychart.enums.WarningCode.DEPRECATED, null, ['series.minimumSize()', 'chart.minBubbleSize()'], true);
  if (goog.isDef(opt_value)) {
    return this;
  }
  return this.minimumSizeSetting_;
};


/**
 * Getter/setter for maximumSize.
 * @deprecated Use chart.maxBubbleSize() instead.
 * @param {(string|number)=} opt_value maximum size of the bubble.
 * @return {(string|number|anychart.core.scatter.series.Bubble)} maximum size of the bubble or self for method chaining.
 */
anychart.core.scatter.series.Bubble.prototype.maximumSize = function(opt_value) {
  anychart.utils.warning(anychart.enums.WarningCode.DEPRECATED, null, ['series.maximumSize()', 'chart.maxBubbleSize()'], true);
  if (goog.isDef(opt_value)) {
    return this;
  }
  return this.maximumSizeSetting_;
};


/**
 * Getter/setter for displayNegative.
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {(boolean|anychart.core.scatter.series.Bubble)} Display negaitve setting or self for method chaining.
 */
anychart.core.scatter.series.Bubble.prototype.displayNegative = function(opt_value) {
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
anychart.core.scatter.series.Bubble.prototype.isSizeBased = function() {
  return true;
};


/** @inheritDoc */
anychart.core.scatter.series.Bubble.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Bubble.prototype.supportsError = function() {
  return false;
};


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.scatter.series.Bubble.prototype.rootTypedLayerInitializer = function() {
  return acgraph.circle();
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Bubble.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // --- DiscreteBase ---
  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.core.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.core.scatter.series.Base.ZINDEX_SERIES);
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

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (!this.hatchFillRootElement) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.core.scatter.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
  }
  // --- end DiscreteBase ---

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
anychart.core.scatter.series.Bubble.prototype.calculateSizeScale = function(opt_minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.selfMinimumBubbleValue_ = Number.POSITIVE_INFINITY;
    this.selfMaximumBubbleValue_ = Number.NEGATIVE_INFINITY;

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

    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
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
anychart.core.scatter.series.Bubble.prototype.setAutoSizeScale = function(min, max, minSize, maxSize) {
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
anychart.core.scatter.series.Bubble.prototype.calculateSize_ = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) / (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  if (isNaN(ratio) || !isFinite(ratio))
    ratio = 0.5;
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size);
};


/** @inheritDoc */
anychart.core.scatter.series.Bubble.prototype.drawSeriesPoint = function(pointState) {
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

    iterator.meta('x', x).meta('value', y).meta('size', size).meta('shape', circle);

    circle.radius(Math.abs(size)).centerX(x).centerY(y);

    this.colorizeShape(pointState);

    this.makeInteractive(circle);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
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
    this.applyHatchFill(pointState);
  }

  return true;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.scatter.series.Bubble.prototype.colorizeShape = function(pointState) {
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
anychart.core.scatter.series.Bubble.prototype.applyHatchFill = function(pointState) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for negativeStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.scatter.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.negativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * Getter/setter for hoverNegativeStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.scatter.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
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
 * @return {anychart.core.scatter.series.Bubble|acgraph.vector.Stroke|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.selectNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
anychart.core.scatter.series.Bubble.prototype.getFinalNegativeStroke = function(pointState) {
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
 * Getter/setter for negativeFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.scatter.series.Bubble|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.negativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
 * Getter/setter for hoverNegativeFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.scatter.series.Bubble|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
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
 * @return {acgraph.vector.Fill|anychart.core.scatter.series.Bubble|Function} .
 */
anychart.core.scatter.series.Bubble.prototype.selectNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
anychart.core.scatter.series.Bubble.prototype.getFinalNegativeFill = function(pointState) {
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
 * Getter/setter for negativeHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.scatter.series.Bubble.prototype.negativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Getter/setter for hoverNegativeHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.scatter.series.Bubble.prototype.hoverNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.scatter.series.Bubble.prototype.selectNegativeHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
anychart.core.scatter.series.Bubble.prototype.getFinalNegativeHatchFill = function(pointState) {
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
anychart.core.scatter.series.Bubble.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
  this.drawLabel(pointState);
};


/** @inheritDoc */
anychart.core.scatter.series.Bubble.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Bubble.prototype.getType = function() {
  return anychart.enums.ScatterSeriesType.BUBBLE;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Bubble.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
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
  if (goog.isFunction(this.selectNegativeFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series selectNegativeFill']
    );
  } else {
    json['selectNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectNegativeFill()));
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
  if (goog.isFunction(this.selectNegativeStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Bubble Series selectNegativeStroke']
    );
  } else {
    json['selectNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectNegativeStroke()));
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
  if (goog.isFunction(this.selectNegativeHatchFill())) {
    anychart.utils.warning(
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
anychart.core.scatter.series.Bubble.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
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
anychart.core.scatter.series.Bubble.prototype['minimumSize'] = anychart.core.scatter.series.Bubble.prototype.minimumSize;//doc|ex
anychart.core.scatter.series.Bubble.prototype['maximumSize'] = anychart.core.scatter.series.Bubble.prototype.maximumSize;//doc|ex
anychart.core.scatter.series.Bubble.prototype['displayNegative'] = anychart.core.scatter.series.Bubble.prototype.displayNegative;//doc|ex

anychart.core.scatter.series.Bubble.prototype['negativeFill'] = anychart.core.scatter.series.Bubble.prototype.negativeFill;//doc|ex
anychart.core.scatter.series.Bubble.prototype['hoverNegativeFill'] = anychart.core.scatter.series.Bubble.prototype.hoverNegativeFill;//doc|ex
anychart.core.scatter.series.Bubble.prototype['selectNegativeFill'] = anychart.core.scatter.series.Bubble.prototype.selectNegativeFill;

anychart.core.scatter.series.Bubble.prototype['negativeStroke'] = anychart.core.scatter.series.Bubble.prototype.negativeStroke;//doc|ex
anychart.core.scatter.series.Bubble.prototype['hoverNegativeStroke'] = anychart.core.scatter.series.Bubble.prototype.hoverNegativeStroke;//doc|ex
anychart.core.scatter.series.Bubble.prototype['selectNegativeStroke'] = anychart.core.scatter.series.Bubble.prototype.selectNegativeStroke;

anychart.core.scatter.series.Bubble.prototype['negativeHatchFill'] = anychart.core.scatter.series.Bubble.prototype.negativeHatchFill;
anychart.core.scatter.series.Bubble.prototype['hoverNegativeHatchFill'] = anychart.core.scatter.series.Bubble.prototype.hoverNegativeHatchFill;
anychart.core.scatter.series.Bubble.prototype['selectNegativeHatchFill'] = anychart.core.scatter.series.Bubble.prototype.selectNegativeHatchFill;

anychart.core.scatter.series.Bubble.prototype['fill'] = anychart.core.scatter.series.Bubble.prototype.fill;//inherited
anychart.core.scatter.series.Bubble.prototype['hoverFill'] = anychart.core.scatter.series.Bubble.prototype.hoverFill;//inherited
anychart.core.scatter.series.Bubble.prototype['selectFill'] = anychart.core.scatter.series.Bubble.prototype.selectFill;//inherited

anychart.core.scatter.series.Bubble.prototype['stroke'] = anychart.core.scatter.series.Bubble.prototype.stroke;//inherited
anychart.core.scatter.series.Bubble.prototype['hoverStroke'] = anychart.core.scatter.series.Bubble.prototype.hoverStroke;//inherited
anychart.core.scatter.series.Bubble.prototype['selectStroke'] = anychart.core.scatter.series.Bubble.prototype.selectStroke;//inherited

anychart.core.scatter.series.Bubble.prototype['hatchFill'] = anychart.core.scatter.series.Bubble.prototype.hatchFill;//inherited
anychart.core.scatter.series.Bubble.prototype['hoverHatchFill'] = anychart.core.scatter.series.Bubble.prototype.hoverHatchFill;//inherited
anychart.core.scatter.series.Bubble.prototype['selectHatchFill'] = anychart.core.scatter.series.Bubble.prototype.selectHatchFill;//inherited
