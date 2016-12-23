goog.provide('anychart.core.drawers.SplineDrawer');



/**
 * Queue too draw splines. Pass a path in a constuctor and then feed it with a sequence of points.
 * As soon as it has enough points to draw a spline - it draws it.
 * @param {boolean=} opt_rtl If the drawing goes right-to-left (occurs on inverted X scale or on low path of rangeArea).
 * @constructor
 */
anychart.core.drawers.SplineDrawer = function(opt_rtl) {
  /**
   * Queue state.
   * 0 - no items,
   * 1 - one item,
   * 2 - ready to draw first segment,
   * 3 - first segment drawn
   * @type {number}
   * @private
   */
  this.state_ = 0;
  /**
   * @type {number}
   * @private
   */
  this.x1_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.y1_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.x2_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.y2_ = NaN;
  /**
   * @type {boolean}
   * @private
   */
  this.isVertical_ = false;
  /**
   * @type {boolean}
   * @private
   */
  this.rtl_ = !!opt_rtl;
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.v1_ = [];
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.v2_ = [];
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.tan_ = [];
  /**
   * @type {Array.<number>}
   * @private
   */
  this.tangent_ = [];
  /**
   * @type {number}
   * @private
   */
  this.tanLen_ = 1;
};


/**
 * If the drawer is rtl (draws right-to-left on forward layout).
 * @param {boolean=} opt_rtl .
 * @return {!anychart.core.drawers.SplineDrawer|boolean} .
 */
anychart.core.drawers.SplineDrawer.prototype.rtl = function(opt_rtl) {
  if (goog.isDef(opt_rtl)) {
    this.rtl_ = opt_rtl;
    return this;
  }
  return this.rtl_;
};


/**
 * If the drawer is vertical.
 * @param {boolean=} opt_value .
 * @return {!anychart.core.drawers.SplineDrawer|boolean} .
 */
anychart.core.drawers.SplineDrawer.prototype.isVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isVertical_ = opt_value;
    return this;
  }
  return this.isVertical_;
};


/**
 * Processes next spline point.
 * @param {number} x .
 * @param {number} y .
 * @param {boolean=} opt_skip
 */
anychart.core.drawers.SplineDrawer.prototype.processPoint = function(x, y, opt_skip) {
  switch (this.state_) {
    case 3:
      if (this.x2_ == x && this.y2_ == y) break;
      this.drawNextSplinePoint_(this.x1_, this.y1_, this.x2_, this.y2_, x, y, opt_skip);
      this.x1_ = this.x2_;
      this.y1_ = this.y2_;
      this.x2_ = x;
      this.y2_ = y;
      break;
    case 2:
      if (this.x2_ == x && this.y2_ == y) break;
      this.startSplineDrawing_(this.x1_, this.y1_, this.x2_, this.y2_, x, y, opt_skip);
      this.x1_ = this.x2_;
      this.y1_ = this.y2_;
      this.x2_ = x;
      this.y2_ = y;
      this.state_ = 3;
      break;
    case 1:
      if (this.x1_ == x && this.y1_ == y) break;
      this.x2_ = x;
      this.y2_ = y;
      this.state_ = 2;
      break;
    case 0:
      this.x1_ = x;
      this.y1_ = y;
      this.state_ = 1;
      break;
  }
};


/**
 * Finalizes spline drawing.
 */
anychart.core.drawers.SplineDrawer.prototype.finalizeProcessing = function() {
  switch (this.state_) {
    case 3:
      this.finalizeSplineDrawing_(this.x1_, this.y1_, this.x2_, this.y2_);
      break;
    case 2:
      this.drawDummySpline_(this.x1_, this.y1_, this.x2_, this.y2_);
      break;
    case 1:
      this.drawSingleSplinePoint_(this.x1_, this.y1_);
      break;
  }
  this.state_ = 0;
};


/**
 * Sets paths to draw to.
 * @param {Array.<acgraph.vector.Path>} paths Path to set.
 */
anychart.core.drawers.SplineDrawer.prototype.setPaths = function(paths) {
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = paths;
};


/**
 * Resets drawer to its initial state.
 * @param {boolean} backward If the drawing is going to start rtl.
 */
anychart.core.drawers.SplineDrawer.prototype.resetDrawer = function(backward) {
  if (this.rtl_ ^ this.isVertical_) backward = !backward;
  /**
   * @type {number}
   * @private
   */
  this.tangentLengthPercent_ = backward ? -0.25 : 0.25;
};


/**
 * Calculates a normalized vector from p1 to p2 and puts it to result.
 * @param {!Array.<number>} result
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.writeDiffVector_ = function(result, p1x, p1y, p2x, p2y) {
  result[0] = p2x - p1x;
  result[1] = p2y - p1y;
  var len = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
  result[0] /= len;
  result[1] /= len;
};


/**
 * Calculates the tangent and puts it to the tan_ vector.
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} p3x
 * @param {number} p3y
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.calcTangent_ = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  // v1 is a normalized vector from p2 to p1
  this.writeDiffVector_(this.v1_, p2x, p2y, p1x, p1y);
  // v2 is a normalized vector from p2 to p3
  this.writeDiffVector_(this.v2_, p2x, p2y, p3x, p3y);

  // tan is a direction of a tangent to the spline that should go through p2
  if (this.v1_[1] * this.v2_[1] >= 0) {
    if (this.tangentLengthPercent_ < 0)
      this.tan_[0] = -1;
    else
      this.tan_[0] = 1;
    this.tan_[1] = 0;
  } else {
    this.writeDiffVector_(this.tan_, this.v1_[0], this.v1_[1], this.v2_[0], this.v2_[1]);
  }
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @param {boolean=} opt_skip
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.startSplineDrawing_ = function(p1x, p1y, p2x, p2y, p3x, p3y, opt_skip) {
  this.calcTangent_(p1x, p1y, p2x, p2y, p3x, p3y);

  if (!opt_skip) {
    // real length of the tangent vector
    var tLen = (p2x - p1x) * this.tangentLengthPercent_;
    var tx = -this.tan_[0] * tLen;
    var ty = -this.tan_[1] * tLen;

    // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(p2x, p2y, p2x + tx, p2y + ty, p1x, p1y).fill(null).stroke('5 black').zIndex(1000);
    // this.paths_[0].getStage().pie(p2x + tx, p2y + ty, 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
    // console.log(tx, ty);

    var i;
    if (this.isVertical_) {
      for (i = 0; i < this.paths_.length; i++)
        this.paths_[i].quadraticCurveTo(p2y + ty, p2x + tx, p2y, p2x);
    } else {
      for (i = 0; i < this.paths_.length; i++)
        this.paths_[i].quadraticCurveTo(p2x + tx, p2y + ty, p2x, p2y);
    }
  }

  this.tanLen_ = (p3x - p2x) * this.tangentLengthPercent_;
  this.tangent_[0] = this.tan_[0] * this.tanLen_;
  this.tangent_[1] = this.tan_[1] * this.tanLen_;
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @param {boolean=} opt_skip
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawNextSplinePoint_ = function(p1x, p1y, p2x, p2y, p3x, p3y, opt_skip) {
  this.calcTangent_(p1x, p1y, p2x, p2y, p3x, p3y);

  if (!opt_skip) {
    var c1x = p1x + this.tangent_[0];
    var c1y = p1y + this.tangent_[1];
    var c2x = p2x - this.tan_[0] * this.tanLen_;
    var c2y = p2y - this.tan_[1] * this.tanLen_;
    var mpx = (c1x + c2x) / 2;
    var mpy = (c1y + c2y) / 2;

    // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(mpx, mpy, c1x, c1y, p1x, p1y).fill(null).stroke('5 black').zIndex(1000);
    // this.paths_[0].getStage().path().moveTo(mpx, mpy).lineTo(p2x, p2y, c2x, c2y, mpx, mpy).fill(null).stroke('5 black').zIndex(1000);
    // this.paths_[0].getStage().pie(mpx, mpy, 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
    // this.paths_[0].getStage().pie(c1x, c1y, 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
    // this.paths_[0].getStage().pie(c2x, c2y, 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
    // console.log(this.tangent_[0], this.tangent_[1], c2x - p2x, c2y - p2y);

    var i;
    if (this.isVertical_) {
      for (i = 0; i < this.paths_.length; i++)
        this.paths_[i]
            .quadraticCurveTo(c1y, c1x, mpy, mpx)
            .quadraticCurveTo(c2y, c2x, p2y, p2x);
    } else {
      for (i = 0; i < this.paths_.length; i++)
        this.paths_[i]
            .quadraticCurveTo(c1x, c1y, mpx, mpy)
            .quadraticCurveTo(c2x, c2y, p2x, p2y);
    }
  }

  this.tanLen_ = (p3x - p2x) * this.tangentLengthPercent_;
  this.tangent_[0] = this.tan_[0] * this.tanLen_;
  this.tangent_[1] = this.tan_[1] * this.tanLen_;
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.finalizeSplineDrawing_ = function(p1x, p1y, p2x, p2y) {
  // this.paths_[0].getStage().pie(p1x + this.tangent_[0], p1y + this.tangent_[1], 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
  // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(p2x, p2y, p1x + this.tangent_[0], p1y + this.tangent_[1], p1x, p1y).fill(null).stroke('5 black').zIndex(1000);
  // console.log(this.tangent_[0], this.tangent_[1]);

  var i;
  if (this.isVertical_) {
    for (i = 0; i < this.paths_.length; i++)
      this.paths_[i].quadraticCurveTo(p1y + this.tangent_[1], p1x + this.tangent_[0], p2y, p2x);
  } else {
    for (i = 0; i < this.paths_.length; i++)
      this.paths_[i].quadraticCurveTo(p1x + this.tangent_[0], p1y + this.tangent_[1], p2x, p2y);
  }
};


/**
 * Point p1
 * @param {number} x .
 * @param {number} y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawSingleSplinePoint_ = function(x, y) {
};


/**
 * Line from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawDummySpline_ = function(p1x, p1y, p2x, p2y) {
  var i;
  if (this.isVertical_) {
    for (i = 0; i < this.paths_.length; i++)
      this.paths_[i].lineTo(p2y, p2x);
  } else {
    for (i = 0; i < this.paths_.length; i++)
      this.paths_[i].lineTo(p2x, p2y);
  }
};
