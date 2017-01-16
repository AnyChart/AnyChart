goog.provide('anychart.core.linearGauge.pointers.Tank');
goog.require('anychart.color');
goog.require('anychart.core.linearGauge.pointers.Base');



/**
 * Tank pointer class.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.linearGauge.pointers.Base}
 * @constructor
 */
anychart.core.linearGauge.pointers.Tank = function(gauge, dataIndex) {
  anychart.core.linearGauge.pointers.Tank.base(this, 'constructor', gauge, dataIndex);

  /**
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.bodyLayer_ = null;
  /**
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.bulbLayer_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bodyMainPath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bodyTopShadePath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bodyBottomShadePath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bodyMainShadePath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bodyTopBlurPath_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bulbMainPath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bulbTopShadePath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bulbMainShadePath_ = null;
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.bulbTopBlurPath_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.emptyHatch_ = null;
};
goog.inherits(anychart.core.linearGauge.pointers.Tank, anychart.core.linearGauge.pointers.Base);


//region --- PROPERTIES ---
/**
 * Calculated number to find small radius of bulb ellipse
 * @type {number}
 */
anychart.core.linearGauge.pointers.Tank.MULTIPLIER = 0.14880952380;
//endregion


//region --- INHERITED API ----
/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.TANK;
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.getReservedBounds = function(parentWidth, parentHeight) {
  var w = anychart.utils.normalizeSize(/** @type {number|string} */ (this.width()), parentWidth);
  var gap = w * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
  var left, top, right, bottom;
  left = top = right = bottom = 0;

  if (this.isVertical())
    top = bottom = gap;
  else
    left = right = gap;

  return [left, top, right, bottom];
};
//endregion


//region --- BOUNDS ---
/**
 * Calculate tank bounds.
 * @private
 */
anychart.core.linearGauge.pointers.Tank.prototype.calculateBounds_ = function() {
  var isVertical = this.isVertical();
  var bounds = /** @type {anychart.math.Rect} */ (this.parentBounds());
  var scale = this.scale();
  var inverted = scale.inverted();
  var val = this.applyRatioToBounds(this.getEndRatio());
  var totalMin = this.applyRatioToBounds(scale.transform(scale.minimum()));
  var totalMax = this.applyRatioToBounds(scale.transform(scale.maximum()));
  if (isVertical) {
    if (inverted) {
      this.bodyBounds_ = anychart.math.rect(bounds.left, totalMin, bounds.width, val - totalMin);
      this.bulbBounds_ = anychart.math.rect(bounds.left, val, bounds.width, totalMax - val);
    } else {
      this.bodyBounds_ = anychart.math.rect(bounds.left, val, bounds.width, totalMin - val);
      this.bulbBounds_ = anychart.math.rect(bounds.left, totalMax, bounds.width, val - totalMax);
    }
  } else {
    if (inverted) {
      this.bodyBounds_ = anychart.math.rect(val, bounds.top, totalMin - val, bounds.height);
      this.bulbBounds_ = anychart.math.rect(totalMax, bounds.top, val - totalMax, bounds.height);
    } else {
      this.bodyBounds_ = anychart.math.rect(totalMin, bounds.top, val - totalMin, bounds.height);
      this.bulbBounds_ = anychart.math.rect(val, bounds.top, totalMax - val, bounds.height);
    }
  }
  this.pointerBounds = this.bodyBounds_;
};


/**
 * Returns point coordinate.
 * @param {number} wRadius Radius X.
 * @param {number} angle Angle.
 * @return {number} Point x.
 */
anychart.core.linearGauge.pointers.Tank.prototype.getPointX = function(wRadius, angle) {
  if (wRadius <= 0) return 0;
  return wRadius * Math.round(Math.cos(angle * Math.PI / 180) * 1e15) / 1e15;
};


/**
 * Returns point coordinate.
 * @param {number} hRadius Radius Y.
 * @param {number} angle Angle.
 * @return {number} Point y.
 */
anychart.core.linearGauge.pointers.Tank.prototype.getPointY = function(hRadius, angle) {
  if (hRadius <= 0) return 0;
  return hRadius * Math.round(Math.sin(angle * Math.PI / 180) * 1e15) / 1e15;
};
//endregion


//region --- DRAWERS ---
/**
 * Draws main part.
 * @param {acgraph.vector.Path} path Path.
 * @param {anychart.math.Rect} bounds Bounds.
 */
anychart.core.linearGauge.pointers.Tank.prototype.drawMain = function(path, bounds) {
  var isVertical = this.isVertical();
  if (isVertical) {
    var rx = bounds.width / 2;
    var ry = bounds.width * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var right = bounds.left + bounds.width;
    var bottom = bounds.top + bounds.height;
    path
        .moveTo(bounds.left, bounds.top)
        .arcToByEndPoint(right, bounds.top, rx, ry, false, true)
        .lineTo(right, bottom)
        .arcToByEndPoint(bounds.left, bottom, rx, ry, false, true);
  } else {
    var xR = bounds.height * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var yR = bounds.height / 2;

    var yStart = bounds.top + bounds.height / 2 + this.getPointY(yR, 90);
    path.moveTo(bounds.left + this.getPointX(xR, 90), yStart)
        .arcToByEndPoint(bounds.left, bounds.top, xR, yR, true, true)
        .lineTo(bounds.left + bounds.width, bounds.top)
        .arcToByEndPoint(bounds.left + bounds.width, yStart, xR, yR, false, true);
  }
};


/**
 * Draws top shade
 * @param {acgraph.vector.Path} path Path.
 * @param {anychart.math.Rect} bounds Bounds.
 */
anychart.core.linearGauge.pointers.Tank.prototype.drawTopShade = function(path, bounds) {
  var isVertical = this.isVertical();
  if (isVertical) {
    var rx = bounds.width / 2;
    var ry = bounds.width * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    path.moveTo(bounds.left, bounds.top);
    path.arcToByEndPoint(bounds.left, bounds.top - 0.1, rx, ry, true, false);
  } else {
    var xR = bounds.height * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var yR = bounds.height / 2;
    var yStart = bounds.top + bounds.height / 2 + this.getPointY(yR, 90);

    path.moveTo(bounds.left + bounds.width + 1.5, bounds.top + 1);
    path.arcToByEndPoint(bounds.left + bounds.width + 1.5, yStart, xR, yR, true, false);
  }
};


/**
 * Draws bottom shade.
 * @param {acgraph.vector.Path} path Path.
 * @param {anychart.math.Rect} bounds Bounds.
 */
anychart.core.linearGauge.pointers.Tank.prototype.drawBottomShade = function(path, bounds) {
  if (this.isVertical()) {
    var rx = bounds.width / 2;
    var ry = bounds.width * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var right = bounds.left + bounds.width;
    var bottom = bounds.top + bounds.height;
    path.moveTo(bounds.left, bottom - 1);
    path.arcToByEndPoint(right, bottom, rx, ry, false, false);
  } else {
    var xR = bounds.height * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var yR = bounds.height / 2;
    var yStart = bounds.top + bounds.height / 2 + this.getPointY(yR, 90);

    path.moveTo(bounds.left + 1, bounds.top);
    path.arcToByEndPoint(bounds.left, yStart, xR, yR, false, false);
  }
};


/**
 * Draws top blur.
 * @param {acgraph.vector.Path} path Path.
 * @param {anychart.math.Rect} bounds Bounds.
 */
anychart.core.linearGauge.pointers.Tank.prototype.drawTopBlur = function(path, bounds) {
  if (this.isVertical()) {
    path.moveTo(bounds.left, bounds.top);
    path.arcToByEndPoint(bounds.left, bounds.top - 0.1, bounds.width / 2, bounds.width * anychart.core.linearGauge.pointers.Tank.MULTIPLIER, true, false);
  } else {
    var xR = bounds.height * anychart.core.linearGauge.pointers.Tank.MULTIPLIER;
    var yR = bounds.height / 2;
    path.moveTo(bounds.left + bounds.width - 1, bounds.top);
    path.arcToByEndPoint(bounds.left + bounds.width - 1 + 0.1, bounds.top, xR, yR, true, false);
  }
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.createShapes = function() {
  // create layers for different parts of tank pointer.
  if (!this.bodyLayer_) this.bodyLayer_ = this.rootLayer.layer();
  if (!this.bulbLayer_) this.bulbLayer_ = this.rootLayer.layer();
  var inverted = this.scale().inverted();

  // Position of parts depends on scale inversion.
  if (inverted) {
    this.bulbLayer_.zIndex(0);
    this.bodyLayer_.zIndex(1);
  } else {
    this.bodyLayer_.zIndex(0);
    this.bulbLayer_.zIndex(1);
  }

  if (!this.bodyMainPath_)
    this.bodyMainPath_ = this.bodyLayer_.path().zIndex(0);
  else
    this.bodyMainPath_.clear();

  if (!this.bodyTopShadePath_)
    this.bodyTopShadePath_ = this.bodyLayer_.path().zIndex(1);
  else
    this.bodyTopShadePath_.clear();

  if (!this.bodyBottomShadePath_)
    this.bodyBottomShadePath_ = this.bodyLayer_.path().zIndex(2);
  else
    this.bodyBottomShadePath_.clear();
  if (!this.bodyMainShadePath_)
    this.bodyMainShadePath_ = this.bodyLayer_.path().zIndex(3);
  else
    this.bodyMainShadePath_.clear();
  if (!this.bodyTopBlurPath_)
    this.bodyTopBlurPath_ = this.bodyLayer_.path().zIndex(4);
  else
    this.bodyTopBlurPath_.clear();

  if (!this.bulbMainPath_)
    this.bulbMainPath_ = this.bulbLayer_.path().zIndex(0);
  else
    this.bulbMainPath_.clear();

  if (!this.bulbTopShadePath_)
    this.bulbTopShadePath_ = this.bulbLayer_.path().zIndex(1);
  else
    this.bulbTopShadePath_.clear();

  if (!this.bulbMainShadePath_)
    this.bulbMainShadePath_ = this.bulbLayer_.path().zIndex(2);
  else
    this.bulbMainShadePath_.clear();

  if (!this.bulbTopBlurPath_)
    this.bulbTopBlurPath_ = this.bulbLayer_.path().zIndex(3);
  else
    this.bulbTopBlurPath_.clear();

  if (!this.hatch)
    this.hatch = this.rootLayer.path();
  else
    this.hatch.clear();

  if (!this.emptyHatch_) {
    this.emptyHatch_ = this.bulbLayer_.path();
  } else
    this.emptyHatch_.clear();

  this.makeInteractive(this.rootLayer);
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.drawVertical = function() {
  this.calculateBounds_();

  // body layer
  this.drawMain(this.bodyMainPath_, this.bodyBounds_);
  this.drawTopShade(this.bodyTopShadePath_, this.bodyBounds_);
  this.drawBottomShade(this.bodyBottomShadePath_, this.bodyBounds_);
  this.drawMain(this.bodyMainShadePath_, this.bodyBounds_);
  this.drawTopBlur(this.bodyTopBlurPath_, this.bodyBounds_);

  // bulb layer
  this.drawMain(this.bulbMainPath_, this.bulbBounds_);
  this.drawTopShade(this.bulbTopShadePath_, this.bulbBounds_);
  this.drawMain(this.bulbMainShadePath_, this.bulbBounds_);
  this.drawTopBlur(this.bulbTopBlurPath_, this.bulbBounds_);

  this.hatch.deserialize(this.bodyMainPath_.serialize());
  this.emptyHatch_.deserialize(this.bulbMainPath_.serialize());
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.drawHorizontal = anychart.core.linearGauge.pointers.Tank.prototype.drawVertical;


/**
 * Shade.
 * @type {acgraph.vector.Stroke}
 */
anychart.core.linearGauge.pointers.Tank.SHADE = /** @type {acgraph.vector.Stroke} */ ({'thickness': 1, 'opacity': 0.3, 'color': '#FFFFFF'});


/**
 * @type {acgraph.vector.Fill}
 */
anychart.core.linearGauge.pointers.Tank.BODY_SHADE_FILL = /** @type {acgraph.vector.Fill} */ ({
  'angle': 0,
  'keys': [
    {'color': '#FFFFFF', 'offset': '0', 'opacity': 0},
    {'color': '#FFFFFF', 'offset': '0.2', 'opacity': Number(160.0 / 255.0)},
    {'color': '#FFFFFF', 'offset': '0.25', 'opacity': Number(140.0 / 255.0)},
    {'color': '#FFFFFF', 'offset': '0.3', 'opacity': Number(30.0 / 255.0)},
    {'color': '#FFFFFF', 'offset': '0.35', 'opacity': 0},
    {'color': '#FFFFFF', 'offset': '1', 'opacity': 0}
  ]
});


/**
 * @type {acgraph.vector.Fill}
 */
anychart.core.linearGauge.pointers.Tank.BULB_SHADE_FILL = /** @type {acgraph.vector.Fill} */ ({
  'angle': 0,
  'keys': [
    {'color': '#FFFFFF', 'offset': '0', 'opacity': 0},
    {'color': '#FFFFFF', 'offset': '0.2', 'opacity': Number(160.0 / 255.0) * 0.3},
    {'color': '#FFFFFF', 'offset': '0.25', 'opacity': Number(140.0 / 255.0) * 0.3},
    {'color': '#FFFFFF', 'offset': '0.3', 'opacity': Number(30.0 / 255.0) * 0.3},
    {'color': '#FFFFFF', 'offset': '0.35', 'opacity': 0},
    {'color': '#FFFFFF', 'offset': '1', 'opacity': 0}
  ]
});


/**
 * Tank empty part hover fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.linearGauge.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.core.linearGauge.pointers.Tank.prototype.hoverEmptyFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverEmptyFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.hoverEmptyFill_;
};


/**
 * Tank empty part select fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.linearGauge.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.core.linearGauge.pointers.Tank.prototype.selectEmptyFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectEmptyFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.selectEmptyFill_;
};


/**
 * Tank empty part fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.linearGauge.pointers.Base|acgraph.vector.Fill|Function)} .
 */
anychart.core.linearGauge.pointers.Tank.prototype.emptyFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.emptyFill_) {
      this.emptyFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.emptyFill_;
};


/**
 * Method that gets final fill color for empty part of the pointer, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.linearGauge.pointers.Tank.prototype.getFinalEmptyFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && iterator.get('emptyFill')) || this.emptyFill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('selectEmptyFill')) || this.selectEmptyFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('hoverEmptyFill')) || this.hoverEmptyFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


/**
 * Pointer empty part hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.linearGauge.pointers.Base|boolean} Hatch fill.
 */
anychart.core.linearGauge.pointers.Tank.prototype.emptyHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.emptyHatchFill_) {
      this.emptyHatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.emptyHatchFill_;
};


/**
 * Pointer empty part hover hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.linearGauge.pointers.Base|boolean} Hatch fill.
 */
anychart.core.linearGauge.pointers.Tank.prototype.hoverEmptyHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverEmptyHatchFill_)
      this.hoverEmptyHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverEmptyHatchFill_;
};


/**
 * Pointer empty part select hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.linearGauge.pointers.Base|boolean} Hatch fill.
 */
anychart.core.linearGauge.pointers.Tank.prototype.selectEmptyHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectEmptyHatchFill_)
      this.selectEmptyHatchFill_ = hatchFill;
    return this;
  }
  return this.selectEmptyHatchFill_;
};


/**
 * Method that gets the final hatch fill for an empty part of the pointer, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill.
 */
anychart.core.linearGauge.pointers.Tank.prototype.getFinalEmptyHatchFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('emptyHatchFill'))) {
    normalHatchFill = iterator.get('emptyHatchFill');
  } else {
    normalHatchFill = this.emptyHatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (usePointSettings && goog.isDef(iterator.get('selectEmptyHatchFill'))) {
      hatchFill = iterator.get('selectEmptyHatchFill');
    } else if (goog.isDef(this.selectEmptyHatchFill())) {
      hatchFill = this.selectEmptyHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (usePointSettings && goog.isDef(iterator.get('hoverEmptyHatchFill'))) {
      hatchFill = iterator.get('hoverEmptyHatchFill');
    } else if (goog.isDef(this.hoverEmptyHatchFill())) {
      hatchFill = this.hoverEmptyHatchFill();
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


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.colorizePointer = function(pointerState) {
  var isVertical = this.isVertical();
  var angle = isVertical ? 0 : 90;

  var color = this.getFinalFill(true, pointerState);
  var colorDarken = anychart.color.darken(color);
  var colorLighten = anychart.color.lighten(color);
  var fill = /** @type {acgraph.vector.Fill} */ ({
    'angle': angle,
    'keys': [
      {'color': colorDarken, 'offset': '0', 'opacity': 1},
      {'color': colorDarken, 'offset': '0.05', 'opacity': 1},
      {'color': colorLighten, 'offset': '0.85', 'opacity': 1},
      {'color': colorLighten, 'offset': '0.85', 'opacity': 1},
      {'color': colorDarken, 'offset': '1', 'opacity': 1}
    ]
  });
  this.bodyMainPath_.fill(fill);
  this.bodyMainPath_.stroke('none');

  this.bodyTopShadePath_.fill('none');
  this.bodyTopShadePath_.stroke(anychart.core.linearGauge.pointers.Tank.SHADE);

  anychart.core.linearGauge.pointers.Tank.BODY_SHADE_FILL['angle'] = angle;
  this.bodyMainShadePath_.fill(anychart.core.linearGauge.pointers.Tank.BODY_SHADE_FILL);
  this.bodyMainShadePath_.stroke('none');

  fill = /** @type {acgraph.vector.Fill} */ ({
    'angle': isVertical ? 50 : 140,
    'keys': [
      {'color': '#FFFFFF', 'offset': '0', 'opacity': 0.1},
      {'color': colorDarken, 'offset': '1', 'opacity': 1}
    ]
  });
  this.bodyTopBlurPath_.fill(fill);
  this.bodyTopBlurPath_.stroke('none');

  this.bodyBottomShadePath_.fill('none');
  this.bodyBottomShadePath_.stroke(anychart.core.linearGauge.pointers.Tank.SHADE);

  ////////////////////
  var emptyColor = this.getFinalEmptyFill(true, pointerState);
  colorDarken = anychart.color.darken(emptyColor);
  colorLighten = anychart.color.lighten(emptyColor);
  var opacity = anychart.color.getOpacity(emptyColor);

  fill = /** @type {acgraph.vector.Fill} */ ({
    'angle': -angle,
    'keys': [
      {'color': colorDarken, 'offset': '0', 'opacity': opacity},
      {'color': colorDarken, 'offset': '0.05', 'opacity': opacity},
      {'color': colorLighten, 'offset': '0.85', 'opacity': opacity},
      {'color': colorLighten, 'offset': '0.85', 'opacity': opacity},
      {'color': colorDarken, 'offset': '1', 'opacity': opacity}
    ]
  });
  this.bulbMainPath_.fill(fill);
  this.bulbMainPath_.stroke('none');

  this.bulbTopShadePath_.fill('none');
  this.bulbTopShadePath_.stroke(anychart.core.linearGauge.pointers.Tank.SHADE);

  anychart.core.linearGauge.pointers.Tank.BULB_SHADE_FILL['angle'] = angle;
  this.bulbMainShadePath_.fill(anychart.core.linearGauge.pointers.Tank.BULB_SHADE_FILL);
  this.bulbMainShadePath_.stroke('none');

  fill = /** @type {acgraph.vector.Fill} */ ({
    'angle': isVertical ? 50 : 140,
    'keys': [
      {'color': '#FFFFFF', 'offset': '0', 'opacity': opacity * 0.1},
      {'color': colorDarken, 'offset': '1', 'opacity': opacity}
    ]
  });
  this.bulbTopBlurPath_.fill(fill);
  this.bulbTopBlurPath_.stroke('none');

  var hatch = this.getFinalHatchFill(true, pointerState);
  this.hatch.fill(hatch);
  this.hatch.stroke('none');

  hatch = this.getFinalEmptyHatchFill(true, pointerState);
  this.emptyHatch_.fill(hatch);
  this.emptyHatch_.stroke('none');
};
//endregion


//region --- JSON/DISPOSING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.serialize = function() {
  var json = anychart.core.linearGauge.pointers.Tank.base(this, 'serialize');

  if (goog.isFunction(this.emptyFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer emptyFill']
    );
  } else {
    json['emptyFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.emptyFill()));
  }
  if (goog.isFunction(this.hoverEmptyFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hoverEmptyFill']
    );
  } else {
    json['hoverEmptyFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverEmptyFill()));
  }
  if (goog.isFunction(this.selectEmptyFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer selectEmptyFill']
    );
  } else {
    json['selectEmptyFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectEmptyFill()));
  }

  if (goog.isFunction(this.emptyHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer emptyHatchFill']
    );
  } else {
    if (goog.isDef(this.emptyHatchFill()))
      json['emptyHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.emptyHatchFill()));
  }
  if (goog.isFunction(this.hoverEmptyHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer hoverEmptyHatchFill']
    );
  } else {
    if (goog.isDef(this.hoverEmptyHatchFill()))
      json['hoverEmptyHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverEmptyHatchFill()));
  }
  if (goog.isFunction(this.selectEmptyHatchFill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer selectEmptyHatchFill']
    );
  } else {
    if (goog.isDef(this.selectEmptyHatchFill()))
      json['selectEmptyHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectEmptyHatchFill()));
  }
  return json;
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.linearGauge.pointers.Tank.base(this, 'setupByJSON', config, opt_default);

  this.emptyFill(config['emptyFill']);
  this.hoverEmptyFill(config['hoverEmptyFill']);
  this.selectEmptyFill(config['selectEmptyFill']);

  this.emptyHatchFill(config['emptyHatchFill']);
  this.hoverEmptyHatchFill(config['hoverEmptyHatchFill']);
  this.selectEmptyHatchFill(config['selectEmptyHatchFill']);
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Tank.prototype.disposeInternal = function() {
  // we do not need to dispose this paths, because they will be disposed on parent's layer disposing.
  this.bodyMainPath_ = null;
  this.bodyTopShadePath_ = null;
  this.bodyBottomShadePath_ = null;
  this.bodyMainShadePath_ = null;
  this.bodyTopBlurPath_ = null;
  this.bulbMainPath_ = null;
  this.bulbTopShadePath_ = null;
  this.bulbMainShadePath_ = null;
  this.bulbTopBlurPath_ = null;

  goog.disposeAll(this.bodyLayer_, this.bulbLayer_, this.emptyHatch_);
  this.bodyLayer_ = null;
  this.bulbLayer_ = null;
  this.emptyHatch_ = null;

  anychart.core.linearGauge.pointers.Tank.base(this, 'disposeInternal');
};
//endregion

//exports
(function() {
  var proto = anychart.core.linearGauge.pointers.Tank.prototype;
  proto['emptyFill'] = proto.emptyFill;
  proto['hoverEmptyFill'] = proto.hoverEmptyFill;
  proto['selectEmptyFill'] = proto.selectEmptyFill;
  proto['emptyHatchFill'] = proto.emptyHatchFill;
  proto['hoverEmptyHatchFill'] = proto.hoverEmptyHatchFill;
  proto['selectEmptyHatchFill'] = proto.selectEmptyHatchFill;
})();
