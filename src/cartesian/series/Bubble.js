goog.provide('anychart.cartesian.series.Bubble');

goog.require('anychart.cartesian.series.DiscreteBase');



/**
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

  // Определяем значения опорных полей серии.
  this.referenceValueNames = ['x', 'value', 'size'];
  this.referenceValueMeanings = ['x', 'y', 'n'];
  this.referenceValuesSupportStack = false;

  this.markers().position(anychart.utils.NinePositions.CENTER);
  this.hoverMarkers().position(anychart.utils.NinePositions.CENTER);
  this.labels().position(anychart.utils.NinePositions.CENTER);
  this.hoverLabels().position(anychart.utils.NinePositions.CENTER);
};
goog.inherits(anychart.cartesian.series.Bubble, anychart.cartesian.series.DiscreteBase);


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
 * Getter/setter for minimum bubble size.
 * @param {(string|number)=} opt_value Minimum size of the bubble.
 * @return {(string|number|anychart.cartesian.series.Bubble)} Minimum size of the bubble or self for chaining.
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
 * Getter/setter for maximum bubble size.
 * @param {(string|number)=} opt_value Maximum size of the bubble.
 * @return {(string|number|anychart.cartesian.series.Bubble)} Maximum size of the bubble or self for chaining.
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
 * Getter/setter for negative value option.
 * @param {boolean=} opt_value Whether to display negative value.
 * @return {(boolean|anychart.cartesian.series.Bubble)} Display negaitve setting or self for chaining.
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


/** @inheritDoc */
anychart.cartesian.series.Bubble.prototype.createPositionProvider = function(position) {
  var shape = this.getIterator().meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    return anychart.utils.getCoordinateByAnchor(shapeBounds, position);
  } else {
    var iterator = this.getIterator();
    return {x: iterator.meta('x'), y: iterator.meta('y')};
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
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
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
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.Bubble.prototype.hoverNegativeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin,
    opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverNegativeStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverNegativeStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
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
anychart.cartesian.series.Bubble.prototype.hoverNegativeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy,
    opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverNegativeFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverNegativeFill_;
};


/**
 * Метод, получающий финальное значение цвета заливки для растущей текущей точки с учетом всех fallback.
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
 * @inheritDoc
 */
anychart.cartesian.series.Bubble.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'bubble';
  json['minimumSize'] = this.minimumSize();
  json['maximumSize'] = this.maximumSize();
  json['displayNegative'] = this.displayNegative();

  if (goog.isFunction(this.negativeFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize negativeFill function, you should reset it manually.');
    }
  } else {
    json['negativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.negativeFill()));
  }

  if (goog.isFunction(this.hoverNegativeFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverNegativeFill function, you should reset it manually.');
    }
  } else {
    json['hoverNegativeFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverNegativeFill()));
  }

  if (goog.isFunction(this.negativeStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize negativeStroke function, you should reset it manually.');
    }
  } else {
    json['negativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.negativeStroke()));
  }

  if (goog.isFunction(this.hoverNegativeStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverNegativeStroke function, you should reset it manually.');
    }
  } else {
    json['hoverNegativeStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverNegativeStroke()));
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

  this.resumeSignalsDispatching(true);

  return this;
};

