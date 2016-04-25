goog.provide('anychart.core.drawers.Area3d');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


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
    this.shapesManager.replaceZIndex(anychart.opt.LEFT, anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex(anychart.opt.RIGHT, anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX);
  } else {
    this.shapesManager.replaceZIndex(anychart.opt.LEFT, anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex(anychart.opt.RIGHT, anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX);
  }

  if (provider.yInverted()) {
    this.shapesManager.replaceZIndex(anychart.opt.TOP, anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex(anychart.opt.BOTTOM, anychart.core.shapeManagers.TOP_SHAPES_ZINDEX);
  } else {
    this.shapesManager.replaceZIndex(anychart.opt.TOP, anychart.core.shapeManagers.TOP_SHAPES_ZINDEX);
    this.shapesManager.replaceZIndex(anychart.opt.BOTTOM, anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX);
  }
};


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState, null, /** @type {number} */(this.series.zIndex()));
  var x = /** @type {number} */(point.meta(anychart.opt.X)) + this.x3dSeriesShift_;
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO)) - this.y3dSeriesShift_;
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE)) - this.y3dSeriesShift_;

  shapes[anychart.opt.FRONT]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.FRONT_HATCH]
      .moveTo(x, zero)
      .lineTo(x, y);

  if (this.series.planIsStacked()) {
    /**
     * @type {Array.<number|boolean>}
     */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    shapes[anychart.opt.BACK]
        .moveTo(x + this.x3dShift_, zero - this.y3dShift_)
        .lineTo(x + this.x3dShift_, y - this.y3dShift_);

    shapes[anychart.opt.BOTTOM]
        .moveTo(x, zero)
        .lineTo(x + this.x3dShift_, zero - this.y3dShift_);

    shapes[anychart.opt.LEFT]
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
  var x = /** @type {number} */(point.meta(anychart.opt.X)) + this.x3dSeriesShift_;
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO)) - this.y3dSeriesShift_;
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE)) - this.y3dSeriesShift_;

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    shapes[anychart.opt.BOTTOM].lineTo(x + this.x3dShift_, zero - this.y3dShift_);
    shapes[anychart.opt.BACK].lineTo(x + this.x3dShift_, y - this.y3dShift_);
  }

  if (this.isNeedDrawTopSide_) {
    var currentPoint = shapes[anychart.opt.FRONT].getCurrentPoint();
    if (this.evenTopSide_) {
      shapes[anychart.opt.TOP]
          .moveTo(currentPoint.x, currentPoint.y)
          .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_)
          .lineTo(x, y)
          .close();
      // shapes[anychart.opt.TOP_HATCH]
      //     .moveTo(currentPoint.x, currentPoint.y)
      //     .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
      //     .lineTo(x + this.x3dShift_, y - this.y3dShift_)
      //     .lineTo(x, y)
      //     .close();
    } else {
      // reverse drawing
      shapes[anychart.opt.TOP]
          .moveTo(currentPoint.x, currentPoint.y)
          .lineTo(x, y)
          .lineTo(x + this.x3dShift_, y - this.y3dShift_)
          .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
          .close();
      // shapes[anychart.opt.TOP_HATCH]
      //     .moveTo(currentPoint.x, currentPoint.y)
      //     .lineTo(x, y)
      //     .lineTo(x + this.x3dShift_, y - this.y3dShift_)
      //     .lineTo(currentPoint.x + this.x3dShift_, currentPoint.y - this.y3dShift_)
      //     .close();
    }

    this.evenTopSide_ = !this.evenTopSide_;
  }

  shapes[anychart.opt.FRONT].lineTo(x, y);
  shapes[anychart.opt.FRONT_HATCH].lineTo(x, y);

  this.lastDrawnX = x;
  this.lastDrawnY = y;
  this.lastDrawnZero = zero;
};


/** @inheritDoc */
anychart.core.drawers.Area3d.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var front = shapes[anychart.opt.FRONT];
  var frontHatch = shapes[anychart.opt.FRONT_HATCH];
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

    shapes[anychart.opt.BACK]
        .lineTo(this.lastDrawnX + this.x3dShift_, this.zeroY - this.y3dShift_)
        .close();

    shapes[anychart.opt.BOTTOM]
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }

  if (!isNaN(this.lastDrawnX)) {
    shapes[anychart.opt.RIGHT]
        .moveTo(this.lastDrawnX, this.lastDrawnZero)
        .lineTo(this.lastDrawnX, this.lastDrawnY)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
        .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnZero - this.y3dShift_)
        .close();
    // shapes[anychart.opt.RIGHT_HATCH]
    //     .moveTo(this.lastDrawnX, this.lastDrawnZero)
    //     .lineTo(this.lastDrawnX, this.lastDrawnY)
    //     .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnY - this.y3dShift_)
    //     .lineTo(this.lastDrawnX + this.x3dShift_, this.lastDrawnZero - this.y3dShift_)
    //     .close();
  }
};
