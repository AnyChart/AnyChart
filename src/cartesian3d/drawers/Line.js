goog.provide('anychart.cartesian3dModule.drawers.Line');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Line3d drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.cartesian3dModule.drawers.Line = function(series) {
  anychart.cartesian3dModule.drawers.Line.base(this, 'constructor', series);
};
goog.inherits(anychart.cartesian3dModule.drawers.Line, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.LINE_3D] = anychart.cartesian3dModule.drawers.Line;


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.type = anychart.enums.SeriesDrawerTypes.LINE_3D;


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.requiredShapes = (function() {
  var res = {};
  res['path'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.updateZIndex = function(point) {
  var iterator = this.series.getDetachedIterator();
  while (iterator.advance()) {
    var shapes = /** @type {Object.<acgraph.vector.Shape>} */(iterator.meta('shapes'));
    if (shapes) {
      var zIndex = /** @type {number} */(iterator.meta('zIndex'));
      this.shapesManager.updateZIndex(zIndex + iterator.getIndex() * 1e-8, shapes);
    }
  }
};


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.startDrawing = function(shapeManager) {
  anychart.cartesian3dModule.drawers.Line.base(this, 'startDrawing', shapeManager);
  /**
   * Hack for topSide drawing (for correct fill paths).
   * @type {boolean}
   * @private
   */
  this.evenTopSide_ = true;
  /** @type {!anychart.core.I3DProvider} */
  var provider = this.series.get3DProvider();
  var index = this.series.getIndex();
  /**
   * X 3D offset shift.
   * @type {number}
   * @private
   */
  this.x3dSeriesShift_ = provider.getX3DDistributionShift(index, false);
  /**
   * Y 3D offset shift.
   * @type {number}
   * @private
   */
  this.y3dSeriesShift_ = provider.getY3DDistributionShift(index, false);
  /**
   * X 3D depth shift.
   * @type {number}
   * @private
   */
  this.x3dShift_ = provider.getX3DShift(false);
  /**
   * Y 3D depth shift.
   * @type {number}
   * @private
   */
  this.y3dShift_ = provider.getY3DShift(false);
};


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.drawFirstPoint = function(point, state) {
  /**
   * @type {number}
   */
  this.lastDrawnX = /** @type {number} */(point.meta('x')) + this.x3dSeriesShift_;
  /**
   * @type {number}
   */
  this.lastDrawnY = /** @type {number} */(point.meta('value')) - this.y3dSeriesShift_;
};


/** @inheritDoc */
anychart.cartesian3dModule.drawers.Line.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta('x')) + this.x3dSeriesShift_;
  var y = /** @type {number} */(point.meta('value')) - this.y3dSeriesShift_;

  if (this.evenTopSide_) {
    shapes['path']
        .moveTo(this.lastDrawnX, this.lastDrawnY)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
        .lineTo(x + this.x3dShift_, y - this.y3dShift_)
        .lineTo(x, y)
        .close();
  } else {
    // reverse drawing
    shapes['path']
        .moveTo(this.lastDrawnX, this.lastDrawnY)
        .lineTo(x, y)
        .lineTo(x + this.x3dShift_, y - this.y3dShift_)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
        .close();
  }

  this.evenTopSide_ = !this.evenTopSide_;

  this.lastDrawnX = x;
  this.lastDrawnY = y;
};
