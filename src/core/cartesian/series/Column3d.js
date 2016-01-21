goog.provide('anychart.core.cartesian.series.Column3d');
goog.require('anychart.core.cartesian.series.WidthBased');
goog.require('anychart.math.Rect');



/**
 * Define 3D Column series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian3d#bar3d} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.WidthBased}
 */
anychart.core.cartesian.series.Column3d = function(opt_data, opt_csvSettings) {
  anychart.core.cartesian.series.Column3d.base(this, 'constructor', opt_data, opt_csvSettings);

  /**
   * Used paths for 3d shapes.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = [];

  /**
   * Cleared paths.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.clearedPathsPool_ = [];

  this.needsZero = true;

  this.isAnimation_ = false;
};
goog.inherits(anychart.core.cartesian.series.Column3d, anychart.core.cartesian.series.WidthBased);
anychart.core.cartesian.series.Base.Series3dTypesMap[anychart.enums.Cartesian3dSeriesType.COLUMN] = anychart.core.cartesian.series.Column3d;


/**
 * Get paths.
 * @private
 * @return {!acgraph.vector.Path}
 */
anychart.core.cartesian.series.Column3d.prototype.genNextPath_ = function() {
  var child = this.clearedPathsPool_.pop();
  if (!child) {
    var rootElement = this.container();
    child = rootElement.path();
  }
  this.paths_.push(child);
  return child;
};


/**
 * Clear paths.
 * @private
 * @return {anychart.core.cartesian.series.Column3d}
 */
anychart.core.cartesian.series.Column3d.prototype.clearPaths_ = function() {
  while (this.paths_.length) {
    // clear paths immediately because this methods uses for remove series.
    this.clearedPathsPool_.push(this.paths_.pop().clear());
  }

  return this;
};


/**
 * Remove paths.
 * @private
 * @return {anychart.core.cartesian.series.Column3d}
 */
anychart.core.cartesian.series.Column3d.prototype.removePaths_ = function() {
  for (var i = 0; i < this.paths_.length; i++)
    this.paths_[i].remove();
  this.paths_.length = 0;

  return this;
};


/**
 * Whether series in animation now.
 * @param {boolean} value animation state.
 */
anychart.core.cartesian.series.Column3d.prototype.setAnimation = function(value) {
  if (goog.isDef(value)) {
    if (this.isAnimation_ != value) {
      this.isAnimation_ = value;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Column3d.prototype.startDrawing = function() {
  anychart.core.cartesian.series.Column3d.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.clearPaths_();
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Column3d.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    var bottomSide = this.genNextPath_();
    var backSide = this.genNextPath_();
    var leftSide = this.genNextPath_();
    var rightSide = this.genNextPath_();
    var frontSide = this.genNextPath_();
    var topSide = this.genNextPath_();

    var inc = this.iterator.getIndex() * 1e-4;
    var zIndex = /** @type {number} */(this.iterator.meta('zIndex'));
    bottomSide.zIndex(zIndex + inc);
    backSide.zIndex(zIndex + inc);
    leftSide.zIndex(zIndex + inc);
    rightSide.zIndex(zIndex + inc);
    frontSide.zIndex(zIndex + inc);
    topSide.zIndex(zIndex + inc);

    this.iterator
        .meta('shape', frontSide)
        .meta('frontSide', frontSide)
        .meta('backSide', backSide)
        .meta('topSide', topSide)
        .meta('bottomSide', bottomSide)
        .meta('leftSide', leftSide)
        .meta('rightSide', rightSide);

    if (!this.isAnimation_) {
      var x3dShift = this.getChart().x3dShift;
      var y3dShift = this.getChart().y3dShift;

      var width = this.getPointWidth();
      var x_ = x - width / 2;
      var y_ = Math.min(zero, y);
      var height = Math.abs(zero - y);

      var bounds3d = new anychart.math.Rect(x_, y_ - y3dShift, width + x3dShift, height + y3dShift);
      this.iterator.meta('bounds3d', bounds3d);
      var pixelShift = this.getFinalStroke(true, pointState)['thickness'] % 2 / 2;
      if (isNaN(pixelShift)) pixelShift = 0;

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

      leftSide
          .moveTo(x_, y_)
          .lineTo(x_ + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
          .lineTo(x_ + x3dShift, y_ + height - y3dShift)
          .lineTo(x_, y_ + height - pixelShift)
          .close();

      rightSide
          .moveTo(x_ + width, y_)
          .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
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

    } else {
      //todo: animation
      //rect
      //    .setX(x - barWidth / 2)
      //    .setWidth(barWidth);
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

  //todo: hatchFill
  //if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
  //  var hatchFillShape = this.hatchFillRootElement ?
  //      /** @type {!acgraph.vector.Path} */(this.hatchFillRootElement.genNextChild()) :
  //      null;
  //  this.iterator.meta('hatchFillShape', hatchFillShape);
  //  var shape = /** @type {acgraph.vector.Shape} */(this.iterator.meta('shape'));
  //  if (goog.isDef(shape) && hatchFillShape) {
  //    hatchFillShape.deserialize(shape.serialize());
  //  }
  //  this.applyHatchFill(pointState);
  //}

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Column3d.prototype.colorizeShape = function(pointState) {
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
      'angle': 90,
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
    rightFill = anychart.color.lighten(softDarkBlendedColor, .2);
    topFill = anychart.color.lighten(darkBlendedColor, .2);
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
anychart.core.cartesian.series.Column3d.prototype.doClip = function() {
  var clip, bounds, axesLinesSpace;
  var x3dShift = this.getChart().x3dShift;
  var y3dShift = this.getChart().y3dShift;

  if (!(this.rootLayer.clip() instanceof acgraph.vector.Clip)) {
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
  }
};


/**
 * Apply clip rect to 3d shape.
 * @private
 */
anychart.core.cartesian.series.Column3d.prototype.doClipShape_ = function() {
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

  if (!(frontSide.clip() instanceof acgraph.vector.Clip)) {
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
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Column3d.prototype.createLabelsPositionProvider = function(position) {
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
anychart.core.cartesian.series.Column3d.prototype.disposeInternal = function() {
  this.removePaths_();
  anychart.core.cartesian.series.Column3d.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.cartesian.series.Column3d.prototype.remove = function() {
  this.clearPaths_();
  anychart.core.cartesian.series.Column3d.base(this, 'remove');
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Column3d.prototype.getType = function() {
  return anychart.enums.Cartesian3dSeriesType.COLUMN;
};


//exports
anychart.core.cartesian.series.Column3d.prototype['fill'] = anychart.core.cartesian.series.Column3d.prototype.fill;
anychart.core.cartesian.series.Column3d.prototype['hoverFill'] = anychart.core.cartesian.series.Column3d.prototype.hoverFill;
anychart.core.cartesian.series.Column3d.prototype['selectFill'] = anychart.core.cartesian.series.Column3d.prototype.selectFill;

anychart.core.cartesian.series.Column3d.prototype['stroke'] = anychart.core.cartesian.series.Column3d.prototype.stroke;
anychart.core.cartesian.series.Column3d.prototype['hoverStroke'] = anychart.core.cartesian.series.Column3d.prototype.hoverStroke;
anychart.core.cartesian.series.Column3d.prototype['selectStroke'] = anychart.core.cartesian.series.Column3d.prototype.selectStroke;

anychart.core.cartesian.series.Column3d.prototype['hatchFill'] = anychart.core.cartesian.series.Column3d.prototype.hatchFill;
anychart.core.cartesian.series.Column3d.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Column3d.prototype.hoverHatchFill;
anychart.core.cartesian.series.Column3d.prototype['selectHatchFill'] = anychart.core.cartesian.series.Column3d.prototype.selectHatchFill;
