goog.provide('anychart.core.drawers.Area3d');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Area3d drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Area3d = function(series) {
  anychart.core.drawers.Area3d.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Area3d, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.AREA_3D] = anychart.core.drawers.Area3d;


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.type = anychart.enums.SeriesDrawerTypes.AREA_3D;


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.requiredShapes = (function() {
  var res = {};
  res['top'] = anychart.enums.ShapeType.PATH;
  res['bottom'] = anychart.enums.ShapeType.PATH;
  res['left'] = anychart.enums.ShapeType.PATH;
  res['right'] = anychart.enums.ShapeType.PATH;
  res['back'] = anychart.enums.ShapeType.PATH;
  res['front'] = anychart.enums.ShapeType.PATH;
  // res['rightHatch'] = anychart.enums.ShapeType.PATH;
  // res['topHatch'] = anychart.enums.ShapeType.PATH;
  res['frontHatch'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Area3d.base(this, 'startDrawing', shapeManager);
  /**
   * Hack for topSide drawing (for correct fill paths).
   * @type {boolean}
   * @private
   */
  this.evenTopSide_ = true;
  /** @type {!anychart.core.I3DProvider} */
  var provider = this.series.get3DProvider();
  var index = this.series.getIndex();
  var stacked = this.series.planIsStacked();
  /**
   * True if need draw the topSide.
   * @type {boolean}
   * @private
   */
  this.isNeedDrawTopSide_ = provider.shouldDrawTopSide(index, stacked, this.series.getScalesPairIdentifier());
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

  if (provider.xInverted()) {
    this.shapesManager.replaceZIndex('left', anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex('right', anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX);
  } else {
    this.shapesManager.replaceZIndex('left', anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex('right', anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX);
  }

  if (provider.yInverted()) {
    this.shapesManager.replaceZIndex('top', anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex('bottom', anychart.core.shapeManagers.TOP_SHAPES_ZINDEX);
  } else {
    this.shapesManager.replaceZIndex('top', anychart.core.shapeManagers.TOP_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex('bottom', anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState, null, /** @type {number} */(this.series.zIndex()));
  var x = /** @type {number} */(point.meta('x')) + this.x3dSeriesShift_;
  var zero = /** @type {number} */(point.meta('zero')) - this.y3dSeriesShift_;
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value')) - this.y3dSeriesShift_;

  shapes['front']
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes['frontHatch']
      .moveTo(x, zero)
      .lineTo(x, y);

  if (this.series.planIsStacked()) {
    /**
     * @type {Array.<number|boolean>}
     */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    shapes['back']
        .moveTo(x + this.x3dShift_, zero - this.y3dShift_)
        .lineTo(x + this.x3dShift_, y - this.y3dShift_);

    shapes['bottom']
        .moveTo(x, zero)
        .lineTo(x + this.x3dShift_, zero - this.y3dShift_);

    shapes['left']
        .moveTo(x, zero)
        .lineTo(x, y)
        .lineTo(x + this.x3dShift_, y - this.y3dShift_)
        .lineTo(x + this.x3dShift_, zero - this.y3dShift_)
        .close();
  }

  /**
   * @type {number}
   */
  this.lastDrawnX = x;
  /**
   * @type {number}
   */
  this.lastDrawnY = y;
  /**
   * @type {number}
   */
  this.lastDrawnZero = zero;
  /**
   * @type {number}
   */
  this.zeroY = zero;
};


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta('x')) + this.x3dSeriesShift_;
  var zero = /** @type {number} */(point.meta('zero')) - this.y3dSeriesShift_;
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value')) - this.y3dSeriesShift_;

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    shapes['bottom'].lineTo(x + this.x3dShift_, zero - this.y3dShift_);
    shapes['back'].lineTo(x + this.x3dShift_, y - this.y3dShift_);
  }

  if (this.isNeedDrawTopSide_) {
    var currentPoint = shapes['front'].getCurrentPoint();
    if (this.evenTopSide_) {
      shapes['top']
          .moveTo(currentPoint.x, currentPoint.y)
          .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_)
          .lineTo(x, y)
          .close();
      // shapes['topHatch']
      //     .moveTo(currentPoint.x, currentPoint.y)
      //     .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
      //     .lineTo(x + this.x3dShift_, y - this.y3dShift_)
      //     .lineTo(x, y)
      //     .close();
    } else {
      // reverse drawing
      shapes['top']
          .moveTo(currentPoint.x, currentPoint.y)
          .lineTo(x, y)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_)
          .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
          .close();
      // shapes['topHatch']
      //     .moveTo(currentPoint.x, currentPoint.y)
      //     .lineTo(x, y)
      //     .lineTo(x + this.x3dShift_, y - this.y3dShift_)
      //     .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
      //     .close();
    }

    this.evenTopSide_ = !this.evenTopSide_;
  }

  shapes['front'].lineTo(x, y);
  shapes['frontHatch'].lineTo(x, y);

  this.lastDrawnX = x;
  this.lastDrawnY = y;
  this.lastDrawnZero = zero;
};


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var front = shapes['front'];
  var frontHatch = shapes['frontHatch'];
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
        front.lineTo(prevX, y);
        frontHatch.lineTo(prevX, y);
      } else if (prevWasMissing && !isNaN(prevY)) {
        front.lineTo(x, prevY);
        frontHatch.lineTo(x, prevY);
      }
      front.lineTo(x, y);
      frontHatch.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    front.close();
    frontHatch.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    front
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
    frontHatch
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();

    shapes['back']
        .lineTo(this.lastDrawnX + this.x3dShift_, this.zeroY - this.y3dShift_)
        .close();

    shapes['bottom']
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }

  if (!isNaN(this.lastDrawnX)) {
    shapes['right']
        .moveTo(this.lastDrawnX, this.lastDrawnZero)
        .lineTo(this.lastDrawnX, this.lastDrawnY)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnZero - this.y3dShift_)
        .close();
    // shapes['rightHatch']
    //     .moveTo(this.lastDrawnX, this.lastDrawnZero)
    //     .lineTo(this.lastDrawnX, this.lastDrawnY)
    //     .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
    //     .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnZero - this.y3dShift_)
    //     .close();
  }
};
