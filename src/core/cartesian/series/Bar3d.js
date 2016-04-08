goog.provide('anychart.core.cartesian.series.Bar3d');
goog.require('anychart.core.cartesian.series.BarBase');
goog.require('anychart.math.Rect');



/**
 * Define 3D Bar series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian3d#bar3d} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.BarBase}
 */
anychart.core.cartesian.series.Bar3d = function(opt_data, opt_csvSettings) {
  anychart.core.cartesian.series.Bar3d.base(this, 'constructor', opt_data, opt_csvSettings);

  /**
   * Used paths for 3d shapes.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = [];

  /**
   * Used paths for hatchFill.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.hatchFillPaths_ = [];

  /**
   * Cleared paths.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.clearedPathsPool_ = [];

  this.needsZero = true;

  this.isAnimation_ = false;
};
goog.inherits(anychart.core.cartesian.series.Bar3d, anychart.core.cartesian.series.BarBase);
anychart.core.cartesian.series.Base.Series3dTypesMap[anychart.enums.Cartesian3dSeriesType.BAR] = anychart.core.cartesian.series.Bar3d;


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.is3d = true;


/**
 * Get paths.
 * @param {boolean} isHatchFill Path is hatchFill.
 * @private
 * @return {!acgraph.vector.Path}
 */
anychart.core.cartesian.series.Bar3d.prototype.genNextPath_ = function(isHatchFill) {
  var child = this.clearedPathsPool_.pop();
  if (!child) {
    var rootElement = this.container();
    child = rootElement.path();
  }
  isHatchFill ? this.hatchFillPaths_.push(child) : this.paths_.push(child);
  return child;
};


/**
 * Clear paths.
 * @param {boolean} isHatchFill Path is hatchFill.
 * @private
 * @return {anychart.core.cartesian.series.Bar3d}
 */
anychart.core.cartesian.series.Bar3d.prototype.clearPaths_ = function(isHatchFill) {
  var paths = isHatchFill ? this.hatchFillPaths_ : this.paths_;
  while (paths.length) {
    // clear paths immediately because this methods uses for remove series.
    this.clearedPathsPool_.push(paths.pop().clear());
  }

  return this;
};


/**
 * Remove all paths.
 * @private
 * @return {anychart.core.cartesian.series.Bar3d}
 */
anychart.core.cartesian.series.Bar3d.prototype.removePaths_ = function() {
  var paths = goog.array.concat(this.paths_, this.hatchFillPaths_);
  for (var i = 0; i < paths.length; i++)
    paths[i].remove();
  paths.length = 0;

  return this;
};


/**
 * Whether series in animation now.
 * @param {boolean} value animation state.
 */
anychart.core.cartesian.series.Bar3d.prototype.setAnimation = function(value) {
  if (goog.isDef(value)) {
    if (this.isAnimation_ != value) {
      this.isAnimation_ = value;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.startDrawing = function() {
  anychart.core.cartesian.series.Bar3d.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.clearPaths_(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    this.clearPaths_(true);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.drawSubsequentPoint = function(pointState) {
  var inc = this.iterator.getIndex() * 1e-4;
  var zIndex = /** @type {number} */(this.iterator.meta('zIndex'));

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    var bottomSide = this.genNextPath_(false);
    var backSide = this.genNextPath_(false);
    var leftSide = this.genNextPath_(false);
    var rightSide = this.genNextPath_(false);
    var frontSide = this.genNextPath_(false);
    var topSide = this.genNextPath_(false);

    bottomSide.zIndex(zIndex - inc);
    backSide.zIndex(zIndex - inc);
    leftSide.zIndex(zIndex - inc);
    rightSide.zIndex(zIndex - inc);
    frontSide.zIndex(zIndex - inc);
    topSide.zIndex(zIndex - inc);

    this.iterator
        .meta('shape', frontSide)
        .meta('frontSide', frontSide)
        .meta('backSide', backSide)
        .meta('topSide', topSide)
        .meta('bottomSide', bottomSide)
        .meta('leftSide', leftSide)
        .meta('rightSide', rightSide);

    var chart = /** @type {anychart.charts.Cartesian3d} */(this.getChart());
    var seriesIndex = this.index();
    var seriesCount = chart.getSeriesCount();
    var drawIndex = seriesCount - 1 - seriesIndex;
    var zPaddingXShift = chart.zPaddingXShift;
    var zPaddingYShift = chart.zPaddingYShift;
    var x3dShift = chart.x3dShift;
    var y3dShift = chart.y3dShift;

    // width in barMode is height
    var height = this.getPointWidth();
    var x_ = Math.min(zero, y);
    var y_ = x - height / 2;
    var width = Math.abs(zero - y);
    var zero3d = zero;

    if (!this.drawingPlan.stacked && chart.zDistribution()) {
      x3dShift = x3dShift / seriesCount - zPaddingXShift * (seriesCount - 1) / seriesCount;
      y3dShift = y3dShift / seriesCount - zPaddingYShift * (seriesCount - 1) / seriesCount;

      x3dShift = Math.max(x3dShift, 0);
      y3dShift = Math.max(y3dShift, 0);

      x_ += x3dShift * drawIndex + zPaddingXShift * drawIndex;
      y_ -= y3dShift * drawIndex + zPaddingYShift * drawIndex;

      zero3d += x3dShift * drawIndex + zPaddingXShift * drawIndex;
    }

    this.iterator
        .meta('x3d', x_) // for animation (marker)
        .meta('y3d', y_) // for animation
        .meta('zero3d', zero3d) // for animation
        .meta('x3dShift', x3dShift)
        .meta('y3dShift', y3dShift);

    var bounds3d = new anychart.math.Rect(x_, y_ - y3dShift, width + x3dShift, height + y3dShift);
    this.iterator.meta('bounds3d', bounds3d);
    var pixelShift = this.getFinalStroke(true, pointState)['thickness'] % 2 / 2;
    if (isNaN(pixelShift)) pixelShift = 0;
    this.iterator.meta('pixelShift', pixelShift);

    if (!this.isAnimation_) {
      leftSide
          .moveTo(x_, y_)
          .lineTo(x_ + x3dShift + pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .lineTo(x_, y_ + height - pixelShift)
          .close();

      bottomSide
          .moveTo(x_ + pixelShift, y_ + height)
          .lineTo(x_ + width, y_ + height)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ + height - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .close();

      backSide
          .moveTo(x_ + x3dShift, y_ - y3dShift)
          .lineTo(x_ + x3dShift + width, y_ - y3dShift)
          .lineTo(x_ + x3dShift + width, y_ - y3dShift + height)
          .lineTo(x_ + x3dShift, y_ - y3dShift + height)
          .close();

      rightSide
          .moveTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
          .lineTo(x_ + width, y_ + height - pixelShift)
          .close();

      frontSide
          .moveTo(x_, y_)
          .lineTo(x_ + width, y_)
          .lineTo(x_ + width, y_ + height)
          .lineTo(x_, y_ + height)
          .close();

      topSide
          .moveTo(x_ + pixelShift, y_)
          .lineTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ - y3dShift)
          .close();
    }

    this.colorizeShape(pointState);
    this.doClipShape_();

    this.makeInteractive(bottomSide);
    this.makeInteractive(backSide);
    this.makeInteractive(leftSide);
    this.makeInteractive(rightSide);
    this.makeInteractive(frontSide);
    this.makeInteractive(topSide);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillBottomSide = this.genNextPath_(true);
    var hatchFillBackSide = this.genNextPath_(true);
    var hatchFillLeftSide = this.genNextPath_(true);
    var hatchFillRightSide = this.genNextPath_(true);
    var hatchFillFrontSide = this.genNextPath_(true);
    var hatchFillTopSide = this.genNextPath_(true);

    this.iterator.meta('hatchFillBottomSide', hatchFillBottomSide);
    this.iterator.meta('hatchFillBackSide', hatchFillBackSide);
    this.iterator.meta('hatchFillLeftSide', hatchFillLeftSide);
    this.iterator.meta('hatchFillRightSide', hatchFillRightSide);
    this.iterator.meta('hatchFillFrontSide', hatchFillFrontSide);
    this.iterator.meta('hatchFillTopSide', hatchFillTopSide);

    bottomSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('bottomSide'));
    backSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('backSide'));
    leftSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('leftSide'));
    rightSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('rightSide'));
    frontSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('frontSide'));
    topSide = /** @type {acgraph.vector.Path} */(this.iterator.meta('topSide'));

    if (goog.isDef(frontSide) && hatchFillFrontSide) {
      hatchFillBottomSide.deserialize(bottomSide.serialize());
      hatchFillBackSide.deserialize(backSide.serialize());
      hatchFillLeftSide.deserialize(leftSide.serialize());
      hatchFillRightSide.deserialize(rightSide.serialize());
      hatchFillFrontSide.deserialize(frontSide.serialize());
      hatchFillTopSide.deserialize(topSide.serialize());

      var hatchFillFactor = 1e-8;
      hatchFillBottomSide.zIndex(zIndex - inc - hatchFillFactor);
      hatchFillBackSide.zIndex(zIndex - inc - hatchFillFactor);
      hatchFillLeftSide.zIndex(zIndex - inc - hatchFillFactor);
      hatchFillRightSide.zIndex(zIndex - inc + hatchFillFactor);
      hatchFillFrontSide.zIndex(zIndex - inc + hatchFillFactor);
      hatchFillTopSide.zIndex(zIndex - inc + hatchFillFactor);

      this.makeInteractive(hatchFillBottomSide);
      this.makeInteractive(hatchFillBackSide);
      this.makeInteractive(hatchFillLeftSide);
      this.makeInteractive(hatchFillRightSide);
      this.makeInteractive(hatchFillFrontSide);
      this.makeInteractive(hatchFillTopSide);
    }
    this.applyHatchFill(pointState);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.applyHatchFill = function(pointState) {
  var iter = this.getIterator();
  var hatchFillBottomSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillBottomSide'));
  var hatchFillBackSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillBackSide'));
  var hatchFillLeftSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillLeftSide'));
  var hatchFillRightSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillRightSide'));
  var hatchFillFrontSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillFrontSide'));
  var hatchFillTopSide = /** @type {acgraph.vector.Path} */(iter.meta('hatchFillTopSide'));
  if (goog.isDefAndNotNull(hatchFillFrontSide)) {
    var finalHatchFill = this.getFinalHatchFill(true, pointState);
    hatchFillBottomSide.stroke(null).fill(finalHatchFill);
    hatchFillBackSide.stroke(null).fill(finalHatchFill);
    hatchFillLeftSide.stroke(null).fill(finalHatchFill);
    hatchFillRightSide.stroke(null).fill(finalHatchFill);
    hatchFillFrontSide.stroke(null).fill(finalHatchFill);
    hatchFillTopSide.stroke(null).fill(finalHatchFill);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.colorizeShape = function(pointState) {
  var iter = this.getIterator();
  var frontSide = iter.meta('frontSide');
  var backSide = iter.meta('backSide');
  var topSide = iter.meta('topSide');
  var bottomSide = iter.meta('bottomSide');
  var leftSide = iter.meta('leftSide');
  var rightSide = iter.meta('rightSide');

  var frontFill, rightFill, topFill, bottomFill, backFill, leftFill;
  var stroke = this.getFinalStroke(true, pointState);
  var fill = this.getFinalFill(true, pointState);
  var opacity = goog.isObject(fill) ? fill['opacity'] : 1;
  var color = goog.isObject(fill) ? fill['color'] : fill;
  var parsedColor = anychart.color.parseColor(color);

  if (!goog.isNull(parsedColor)) {
    color = parsedColor.hex;
    var rgbColor = goog.color.hexToRgb(color);

    var rgbDarken = goog.color.darken(rgbColor, .2);
    var rgbMoreDarken = goog.color.darken(rgbColor, .25);
    var rgbLighten = goog.color.lighten(rgbColor, .1);

    var darkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .7));
    var lightBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbDarken, rgbLighten, .1));
    var softDarkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .1));

    frontFill = {
      'angle': 0,
      'keys': [{
        'position': 1,
        'opacity': opacity,
        'color': anychart.color.lighten(darkBlendedColor, .2)
      },{
        'position': 0,
        'opacity': opacity,
        'color': anychart.color.lighten(color, .3)
      }]
    };
    rightFill = anychart.color.lighten(darkBlendedColor, .2);
    topFill = anychart.color.lighten(softDarkBlendedColor, .2);
    bottomFill = goog.color.rgbArrayToHex(rgbDarken);
    backFill = lightBlendedColor;
    leftFill = goog.color.rgbArrayToHex(rgbMoreDarken);

  } else {
    frontFill = rightFill = topFill = bottomFill = backFill = leftFill = 'none';
  }

  bottomSide.stroke(stroke);
  bottomSide.fill({'color': bottomFill, 'opacity': opacity});

  backSide.stroke(stroke);
  backSide.fill({'color': backFill, 'opacity': opacity});

  leftSide.stroke(stroke);
  leftSide.fill({'color': leftFill, 'opacity': opacity});

  rightSide.stroke(stroke);
  rightSide.fill({'color': rightFill, 'opacity': opacity});

  frontSide.stroke(stroke);
  frontSide.fill(frontFill);

  topSide.stroke(stroke);
  topSide.fill({'color': topFill, 'opacity': opacity});
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.doClip = function() {
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


/**
 * Apply clip rect to 3d shape.
 * @private
 */
anychart.core.cartesian.series.Bar3d.prototype.doClipShape_ = function() {
  var clip, bounds, axesLinesSpace;

  var x3dShift = this.getChart().x3dShift;
  var y3dShift = this.getChart().y3dShift;

  var iter = this.getIterator();
  var frontSide = iter.meta('frontSide');
  var backSide = iter.meta('backSide');
  var topSide = iter.meta('topSide');
  var bottomSide = iter.meta('bottomSide');
  var leftSide = iter.meta('leftSide');
  var rightSide = iter.meta('rightSide');

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

  frontSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
  backSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
  topSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
  bottomSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
  leftSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
  rightSide.clip(/** @type {anychart.math.Rect} */ (clip || null));
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.createLabelsPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  var bounds3d = iterator.meta('bounds3d');
  if (shape || bounds3d) {
    var shapeBounds = bounds3d || shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.disposeInternal = function() {
  this.removePaths_();
  anychart.core.cartesian.series.Bar3d.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.remove = function() {
  this.clearPaths_(true);
  this.clearPaths_(false);
  anychart.core.cartesian.series.Bar3d.base(this, 'remove');
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar3d.prototype.getType = function() {
  return anychart.enums.Cartesian3dSeriesType.BAR;
};


//exports
anychart.core.cartesian.series.Bar3d.prototype['fill'] = anychart.core.cartesian.series.Bar3d.prototype.fill;
anychart.core.cartesian.series.Bar3d.prototype['hoverFill'] = anychart.core.cartesian.series.Bar3d.prototype.hoverFill;
anychart.core.cartesian.series.Bar3d.prototype['selectFill'] = anychart.core.cartesian.series.Bar3d.prototype.selectFill;

anychart.core.cartesian.series.Bar3d.prototype['stroke'] = anychart.core.cartesian.series.Bar3d.prototype.stroke;
anychart.core.cartesian.series.Bar3d.prototype['hoverStroke'] = anychart.core.cartesian.series.Bar3d.prototype.hoverStroke;
anychart.core.cartesian.series.Bar3d.prototype['selectStroke'] = anychart.core.cartesian.series.Bar3d.prototype.selectStroke;

anychart.core.cartesian.series.Bar3d.prototype['hatchFill'] = anychart.core.cartesian.series.Bar3d.prototype.hatchFill;
anychart.core.cartesian.series.Bar3d.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Bar3d.prototype.hoverHatchFill;
anychart.core.cartesian.series.Bar3d.prototype['selectHatchFill'] = anychart.core.cartesian.series.Bar3d.prototype.selectHatchFill;
