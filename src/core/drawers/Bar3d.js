goog.provide('anychart.core.drawers.Bar3d');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * Bar3d drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Bar3d = function(series) {
  anychart.core.drawers.Bar3d.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Bar3d, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.BAR_3D] = anychart.core.drawers.Bar3d;


/** @inheritDoc */
anychart.core.drawers.Bar3d.prototype.type = anychart.enums.SeriesDrawerTypes.BAR_3D;


/** @inheritDoc */
anychart.core.drawers.Bar3d.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    anychart.core.drawers.Capabilities.IS_3D_BASED |
    anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.Bar3d.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Bar3d.base(this, 'startDrawing', shapeManager);
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
anychart.core.drawers.Bar3d.prototype.drawSubsequentPoint = function(point, state) {
  var zIndex = /** @type {number} */(this.series.getIterator().meta('zIndex'));
  var shapes = this.shapesManager.getShapesGroup(state, null, zIndex + point.getIndex() * 1e-8);
  this.drawPoint_(point, /** @type {Object.<acgraph.vector.Path>} */(shapes));
};


/** @inheritDoc */
anychart.core.drawers.Bar3d.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
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
anychart.core.drawers.Bar3d.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  var bottomSide = shapes[anychart.opt.BOTTOM];
  var backSide = shapes[anychart.opt.BACK];
  var leftSide = shapes[anychart.opt.LEFT];
  var rightSide = shapes[anychart.opt.RIGHT];
  var frontSide = shapes[anychart.opt.FRONT];
  var topSide = shapes[anychart.opt.TOP];
  var rightHatchSide = shapes[anychart.opt.RIGHT_HATCH];
  var frontHatchSide = shapes[anychart.opt.FRONT_HATCH];
  var topHatchSide = shapes[anychart.opt.TOP_HATCH];

  var x3dShift = this.x3dShift_;
  var y3dShift = this.y3dShift_;

  // width in barMode is height
  var height = this.pointWidth;
  var x_ = Math.min(zero, y) + this.x3dSeriesShift_;
  var y_ = x - height / 2 - this.y3dSeriesShift_;
  var width = Math.abs(zero - y);

  var pixelShift = (frontSide.stroke()['thickness'] % 2 / 2) || 0;

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
      .lineTo(x_ + x3dShift + pixelShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + x3dShift, y_ + height - y3dShift)
      .lineTo(x_, y_ + height - pixelShift)
      .close();

  rightSide
      .moveTo(x_ + width, y_)
      .lineTo(x_ + width + x3dShift, y_ - y3dShift + pixelShift)
      .lineTo(x_ + width + x3dShift, y_ + height - y3dShift)
      .lineTo(x_ + width, y_ + height - pixelShift)
      .close();
  rightHatchSide
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
