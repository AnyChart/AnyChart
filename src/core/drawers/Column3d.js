goog.provide('anychart.core.drawers.Column3d');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Column3d drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Column3d = function(series) {
  anychart.core.drawers.Column3d.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Column3d, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.COLUMN_3D] = anychart.core.drawers.Column3d;


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.type = anychart.enums.SeriesDrawerTypes.COLUMN_3D;


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.requiredShapes = (function() {
  var res = {};
  res['top'] = anychart.enums.ShapeType.PATH;
  res['bottom'] = anychart.enums.ShapeType.PATH;
  res['left'] = anychart.enums.ShapeType.PATH;
  res['right'] = anychart.enums.ShapeType.PATH;
  res['back'] = anychart.enums.ShapeType.PATH;
  res['front'] = anychart.enums.ShapeType.PATH;
  res['frontHatch'] = anychart.enums.ShapeType.PATH;
  res['rightHatch'] = anychart.enums.ShapeType.PATH;
  res['topHatch'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Column3d.base(this, 'startDrawing', shapeManager);
  /** @type {!anychart.core.I3DProvider} */
  var provider = this.series.get3DProvider();
  var index = this.series.getIndex();
  var stacked = this.series.planIsStacked();
  /**
   * X 3D offset shift.
   * @type {number}
   * @private
   */
  this.x3dSeriesShift_ = provider.getX3DDistributionShift(index, stacked);
  /**
   * Y 3D offset shift.
   * @type {number}
   * @private
   */
  this.y3dSeriesShift_ = provider.getY3DDistributionShift(index, stacked);
  /**
   * X 3D depth shift.
   * @type {number}
   * @private
   */
  this.x3dShift_ = provider.getX3DShift(stacked);
  /**
   * Y 3D depth shift.
   * @type {number}
   * @private
   */
  this.y3dShift_ = provider.getY3DShift(stacked);
};


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.drawSubsequentPoint = function(point, state) {
  var zIndex = /** @type {number} */(this.series.getIterator().meta('zIndex'));
  var shapes = this.shapesManager.getShapesGroup(state, null, zIndex + point.getIndex() * 1e-8);
  this.drawPoint_(point, /** @type {Object.<acgraph.vector.Path>} */(shapes));
};


/** @inheritDoc */
anychart.core.drawers.Column3d.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Column3d.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));
  if (!this.isVertical) {
    x += this.x3dSeriesShift_;
    zero -= this.y3dSeriesShift_;
    y -= this.y3dSeriesShift_;
  }

  var bottomSide = shapes['bottom'];
  var backSide = shapes['back'];
  var leftSide = shapes['left'];
  var rightSide = shapes['right'];
  var frontSide = shapes['front'];
  var topSide = shapes['top'];
  var rightHatchSide = shapes['rightHatch'];
  var frontHatchSide = shapes['frontHatch'];
  var topHatchSide = shapes['topHatch'];

  var x3dShift = this.x3dShift_;
  var y3dShift = this.y3dShift_;

  // width in barMode is height
  var x_, y_, width, height, leftShift, rightShift;
  var pixelShift = (frontSide.stroke()['thickness'] % 2 / 2) || 0;
  if (this.isVertical) {
    height = this.pointWidth;
    x_ = Math.min(zero, y) + this.x3dSeriesShift_;
    y_ = x - height / 2 - this.y3dSeriesShift_;
    width = Math.abs(zero - y);
    leftShift = pixelShift;
    rightShift = 0;
  } else {
    width = this.pointWidth;
    x_ = x - width / 2;
    y_ = Math.min(zero, y);
    height = Math.abs(zero - y);
    rightShift = leftShift = -pixelShift;
  }

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
      .lineTo(x_ + x3dShift + leftShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + x3dShift, y_ + height - y3dShift)
      .lineTo(x_, y_ + height - pixelShift)
      .close();

  rightSide
      .moveTo(x_ + width, y_)
      .lineTo(x_ + width + x3dShift + rightShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
      .lineTo(x_ + width, y_ + height - pixelShift)
      .close();
  rightHatchSide
      .moveTo(x_ + width, y_)
      .lineTo(x_ + width + x3dShift + rightShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
      .lineTo(x_ + width, y_ + height - pixelShift)
      .close();

  frontSide
      .moveTo(x_, y_)
      .lineTo(x_ + width, y_)
      .lineTo(x_ + width, y_ + height)
      .lineTo(x_, y_ + height)
      .close();
  frontHatchSide
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
  topHatchSide
      .moveTo(x_ + pixelShift, y_)
      .lineTo(x_ + width, y_)
      .lineTo(x_ + width + x3dShift - pixelShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + x3dShift, y_ - y3dShift)
      .close();
};
