goog.provide('anychart.core.cartesian.series.Area3d');
goog.require('anychart.core.cartesian.series.AreaBase');



/**
 * Define 3D Area series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian3d#area3d} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.Area3d = function(opt_data, opt_csvSettings) {
  anychart.core.cartesian.series.Area3d.base(this, 'constructor', opt_data, opt_csvSettings);

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.hatchFillTopPath_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.hatchFillRightPath_ = null;

  /**
   * Hack for topSide drawing (for correct fill paths).
   * @type {boolean}
   * @private
   */
  this.evenTopSide_ = true;

  this.bottomSide = acgraph.path();
  this.backSide = acgraph.path();
  this.leftSide = acgraph.path();
  this.rightSide = acgraph.path();
  this.topSide = acgraph.path();

  this.bottomSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.2);
  this.backSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.2);
  this.leftSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.2);
  this.rightSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES);
  this.topSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.1);

  this.needsZero = true;
};
goog.inherits(anychart.core.cartesian.series.Area3d, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.Series3dTypesMap[anychart.enums.Cartesian3dSeriesType.AREA] = anychart.core.cartesian.series.Area3d;


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.is3d = true;


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.startDrawing = function() {
  anychart.core.cartesian.series.Area3d.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.backSide.parent(this.rootLayer);
    this.bottomSide.parent(this.rootLayer);
    this.leftSide.parent(this.rootLayer);
    this.topSide.parent(this.rootLayer);

    if (this.getChart().yScale().inverted()) {
      this.bottomSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.1);
    }

    if (this.getChart().xScale().inverted()) {
      this.rightSide.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.2);
    }

    this.bottomSide.clear();
    this.backSide.clear();
    this.leftSide.clear();
    this.rightSide.clear();
    this.topSide.clear();

    this.makeInteractive(this.bottomSide, true);
    this.makeInteractive(this.backSide, true);
    this.makeInteractive(this.leftSide, true);
    this.makeInteractive(this.rightSide, true);
    this.makeInteractive(this.topSide, true);

    // reset value for preserving the order of the drawing when redrawing.
    this.evenTopSide_ = true;

    /**
     * True if need draw the topSide.
     * @type {boolean}
     * @private
     */
    this.isNeedDrawTopSide_ = !this.drawingPlan.stacked ||
        this.index() == this.getChart().lastEnabledAreaSeriesMap[goog.getUid(this.xScale()) + '_' + goog.getUid(this.yScale())];

    this.x3dShift_ = this.getChart().x3dShift;
    this.y3dShift_ = this.getChart().y3dShift;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (!this.hatchFillTopPath_) {
      this.hatchFillTopPath_ = acgraph.path();
      this.hatchFillTopPath_.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES - 0.01);
      this.hatchFillTopPath_.disablePointerEvents(true);
    }

    if (!this.hatchFillRightPath_) {
      this.hatchFillRightPath_ = acgraph.path();
      this.hatchFillRightPath_.zIndex(anychart.core.cartesian.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRightPath_.disablePointerEvents(true);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.hatchFillTopPath_) this.hatchFillTopPath_.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    if (this.hatchFillRightPath_) this.hatchFillRightPath_.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));
    var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
    var seriesIndex = this.index();
    var seriesCount = chart.getSeriesCount();
    var drawIndex = seriesCount - 1 - seriesIndex;
    var zPaddingXShift = chart.zPaddingXShift;
    var zPaddingYShift = chart.zPaddingYShift;

    if (!this.drawingPlan.stacked && chart.zDistribution()) {
      this.x3dShift_ = chart.x3dShift / seriesCount - zPaddingXShift * (seriesCount - 1) / seriesCount;
      this.y3dShift_ = chart.y3dShift / seriesCount - zPaddingYShift * (seriesCount - 1) / seriesCount;

      this.x3dShift_ = Math.max(this.x3dShift_, 0);
      this.y3dShift_ = Math.max(this.y3dShift_, 0);

      x += this.x3dShift_ * drawIndex + zPaddingXShift * drawIndex;
      y -= this.y3dShift_ * drawIndex + zPaddingYShift * drawIndex;
      zero -= this.y3dShift_ * drawIndex + zPaddingYShift * drawIndex;
    }

    this.path
        .moveTo(x, zero)
        .lineTo(x, y);

    if (this.drawingPlan.stacked) {
      this.zeroesStack = [x, zero, this.iterator.meta('zeroMissing')];
    } else {
      this.backSide
          .moveTo(x + this.x3dShift_, zero - this.y3dShift_)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_);

      this.bottomSide
          .moveTo(x, zero)
          .lineTo(x + this.x3dShift_, zero - this.y3dShift_);

      this.leftSide
          .moveTo(x, zero)
          .lineTo(x, y)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_)
          .lineTo(x + this.x3dShift_, zero - this.y3dShift_)
          .close();

    }

    this.lastDrawnX = x;
    this.lastDrawnY = y;
    this.lastDrawnZero = zero;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
    var seriesIndex = this.index();
    var seriesCount = chart.getSeriesCount();
    var drawIndex = seriesCount - 1 - seriesIndex;

    if (!this.drawingPlan.stacked && chart.zDistribution()) {
      x += this.x3dShift_ * drawIndex + chart.zPaddingXShift * drawIndex;
      y -= this.y3dShift_ * drawIndex + chart.zPaddingYShift * drawIndex;
      zero -= this.y3dShift_ * drawIndex + chart.zPaddingYShift * drawIndex;
    }

    if (this.drawingPlan.stacked) {
      this.zeroesStack.push(x, zero, this.iterator.meta('zeroMissing'));
    } else {
      this.bottomSide.lineTo(x + this.x3dShift_, zero - this.y3dShift_);
      this.backSide.lineTo(x + this.x3dShift_, y - this.y3dShift_);
    }

    if (this.isNeedDrawTopSide_) {
      var currentPoint = this.path.getCurrentPoint();
      if (this.evenTopSide_) {
        this.topSide
            .moveTo(currentPoint.x, currentPoint.y)
            .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
            .lineTo(x + this.x3dShift_, y - this.y3dShift_)
            .lineTo(x, y)
            .close();
      } else {
        // reverse drawing
        this.topSide
            .moveTo(currentPoint.x, currentPoint.y)
            .lineTo(x, y)
            .lineTo(x + this.x3dShift_, y - this.y3dShift_)
            .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
            .close();
      }

      this.evenTopSide_ = !this.evenTopSide_;
    }

    this.path.lineTo(x, y);

    this.lastDrawnX = x;
    this.lastDrawnY = y;
    this.lastDrawnZero = zero;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.finalizeSegment = function() {
  var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
  var seriesIndex = this.index();
  var seriesCount = chart.getSeriesCount();
  var drawIndex = seriesCount - 1 - seriesIndex;
  var zeroY = this.zeroY;

  if (!this.drawingPlan.stacked && chart.zDistribution()) {
    zeroY -= this.y3dShift_ * drawIndex + chart.zPaddingYShift * drawIndex;
  }

  if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (isMissing && !isNaN(prevX)) {
        this.path.lineTo(prevX, y);
      } else if (prevWasMissing && !isNaN(prevY)) {
        this.path.lineTo(x, prevY);
      }
      this.path.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.path.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, zeroY)
        .close();

    this.backSide
        .lineTo(this.lastDrawnX + this.x3dShift_, zeroY - this.y3dShift_)
        .close();

    this.bottomSide
        .lineTo(this.lastDrawnX, zeroY)
        .close();
  }

  if (!isNaN(this.lastDrawnX)) {
    this.rightSide
        .moveTo(this.lastDrawnX, this.lastDrawnZero)
        .lineTo(this.lastDrawnX, this.lastDrawnY)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnZero - this.y3dShift_)
        .close();
    this.rightSide.parent(this.rootLayer);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.colorizeShape = function(pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var stroke = this.getFinalStroke(true, pointState);
  var fill = this.getFinalFill(true, pointState);
  var opacity = goog.isObject(fill) ? fill['opacity'] : 1;
  var color = goog.isObject(fill) ? fill['color'] : fill;
  var parsedColor = anychart.color.parseColor(color);

  if (!goog.isNull(parsedColor)) {
    color = parsedColor.hex;
    var rgbColor = goog.color.hexToRgb(color);

    var rgbDarken = goog.color.darken(rgbColor, .2);
    var rgbDarken03 = goog.color.darken(rgbColor, .3);
    var rgbMoreDarken = goog.color.darken(rgbColor, .25);
    var rgbLighten = goog.color.lighten(rgbColor, .1);

    var darkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .7));
    var darkBlendedColor2 = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken03, .7));
    var lightBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbDarken, rgbLighten, .1));
    var softDarkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .1));

    frontFill = /** @type {acgraph.vector.Fill} */({
      'angle': 90,
      'keys': [{
        'offset': 0,
        'opacity': opacity,
        'color': /** @type {string} */(anychart.color.lighten(darkBlendedColor, .2))
      },{
        'offset': 1,
        'opacity': opacity,
        'color': /** @type {string} */(anychart.color.lighten(color, .3))
      }]
    });
    topFill = /** @type {string} */(anychart.color.lighten(darkBlendedColor2, .2));
    rightFill = bottomFill = /** @type {string} */(anychart.color.lighten(softDarkBlendedColor, .2));
    backFill = lightBlendedColor;
    leftFill = goog.color.rgbArrayToHex(rgbMoreDarken);

  } else {
    frontFill = topFill = rightFill = bottomFill = backFill = leftFill = 'none';
  }

  this.bottomSide.stroke(stroke);
  this.bottomSide.fill({'color': bottomFill, 'opacity': opacity});

  this.backSide.stroke(stroke);
  this.backSide.fill({'color': backFill, 'opacity': opacity});

  this.leftSide.stroke(stroke);
  this.leftSide.fill({'color': leftFill, 'opacity': opacity});

  this.rightSide.stroke(stroke);
  this.rightSide.fill({'color': rightFill, 'opacity': opacity});

  this.topSide.stroke(null);
  this.topSide.fill({'color': topFill, 'opacity': opacity});

  this.path.stroke(stroke);
  this.path.fill(frontFill);
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillTopPath_) this.hatchFillTopPath_.deserialize(this.topSide.serialize());
    if (this.hatchFillRightPath_) this.hatchFillRightPath_.deserialize(this.rightSide.serialize());
  }

  anychart.core.cartesian.series.Area3d.base(this, 'finalizeHatchFill');
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.applyHatchFill = function(pointState) {
  anychart.core.cartesian.series.Area3d.base(this, 'applyHatchFill', pointState);

  if (this.hatchFillTopPath_) {
    this.hatchFillTopPath_.fill(this.getFinalHatchFill(false, pointState));
    this.hatchFillTopPath_.stroke(null);
  }

  if (this.hatchFillRightPath_) {
    this.hatchFillRightPath_.fill(this.getFinalHatchFill(false, pointState));
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.doClip = function() {
  var clip, bounds, axesLinesSpace;

  var x3dShift = this.getChart().x3dShift;
  var y3dShift = this.getChart().y3dShift;

  clip = /** @type {!anychart.math.Rect|boolean} */ (this.clip());
  if (goog.isBoolean(clip)) {
    if (clip) {
      bounds = this.pixelBoundsCache;
      axesLinesSpace = this.axesLinesSpace();
      clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
      clip.top -= y3dShift;
      clip.height += y3dShift;
      clip.width += x3dShift;
    }
  }
  this.rootLayer.clip(/** @type {anychart.math.Rect} */ (clip || null));
  var labelDOM = this.labels().getDomElement();
  if (labelDOM) labelDOM.clip(/** @type {anychart.math.Rect} */(clip || null));

  var markerDOM = this.markers().getDomElement();
  if (markerDOM) markerDOM.clip(/** @type {anychart.math.Rect} */(clip || null));
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var x = /** @type {number} */(iterator.meta('x'));
  var y = /** @type {number} */(iterator.meta('value'));

  var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
  var seriesIndex = this.index();
  var seriesCount = chart.getSeriesCount();
  var drawIndex = seriesCount - 1 - seriesIndex;

  if (!this.drawingPlan.stacked && chart.zDistribution()) {
    x += this.x3dShift_ * drawIndex + chart.zPaddingXShift * drawIndex;
    y -= this.y3dShift_ * drawIndex + chart.zPaddingYShift * drawIndex;
  }

  return {'value': {'x': x, 'y': y}};
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.createLabelsPositionProvider = function(position) {
  var iterator = this.getIterator();
  var x = /** @type {number} */(iterator.meta('x'));
  var y = /** @type {number} */(iterator.meta('value'));

  var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
  var seriesIndex = this.index();
  var seriesCount = chart.getSeriesCount();
  var drawIndex = seriesCount - 1 - seriesIndex;

  if (!this.drawingPlan.stacked && chart.zDistribution()) {
    x += this.x3dShift_ * drawIndex + chart.zPaddingXShift * drawIndex;
    y -= this.y3dShift_ * drawIndex + chart.zPaddingYShift * drawIndex;
  }

  return {'value': {'x': x + this.x3dShift_, 'y': y - this.y3dShift_}};
};


/** @inheritDoc */
anychart.core.cartesian.series.Area3d.prototype.remove = function() {
  this.bottomSide.clear();
  this.backSide.clear();
  this.leftSide.clear();
  this.rightSide.clear();
  this.topSide.clear();

  anychart.core.cartesian.series.Area3d.base(this, 'remove');
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Area3d.prototype.getType = function() {
  return anychart.enums.Cartesian3dSeriesType.AREA;
};


//exports
anychart.core.cartesian.series.Area3d.prototype['fill'] = anychart.core.cartesian.series.Area3d.prototype.fill;
anychart.core.cartesian.series.Area3d.prototype['hoverFill'] = anychart.core.cartesian.series.Area3d.prototype.hoverFill;
anychart.core.cartesian.series.Area3d.prototype['selectFill'] = anychart.core.cartesian.series.Area3d.prototype.selectFill;

anychart.core.cartesian.series.Area3d.prototype['stroke'] = anychart.core.cartesian.series.Area3d.prototype.stroke;
anychart.core.cartesian.series.Area3d.prototype['hoverStroke'] = anychart.core.cartesian.series.Area3d.prototype.hoverStroke;
anychart.core.cartesian.series.Area3d.prototype['selectStroke'] = anychart.core.cartesian.series.Area3d.prototype.selectStroke;

anychart.core.cartesian.series.Area3d.prototype['hatchFill'] = anychart.core.cartesian.series.Area3d.prototype.hatchFill;
anychart.core.cartesian.series.Area3d.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Area3d.prototype.hoverHatchFill;
anychart.core.cartesian.series.Area3d.prototype['selectHatchFill'] = anychart.core.cartesian.series.Area3d.prototype.selectHatchFill;
