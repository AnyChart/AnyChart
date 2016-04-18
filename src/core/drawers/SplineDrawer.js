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
  this.rtl_ = !!opt_rtl;
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
 * Processes next spline point.
 * @param {number} x .
 * @param {number} y .
 */
anychart.core.drawers.SplineDrawer.prototype.processPoint = function(x, y) {
  switch (this.state_) {
    case 3:
      if (this.x2_ == x && this.y2_ == y) break;
      this.drawNextSplinePoint_(this.x1_, this.y1_, this.x2_, this.y2_, x, y);
      this.x1_ = this.x2_;
      this.y1_ = this.y2_;
      this.x2_ = x;
      this.y2_ = y;
      break;
    case 2:
      if (this.x2_ == x && this.y2_ == y) break;
      this.startSplineDrawing_(this.x1_, this.y1_, this.x2_, this.y2_, x, y);
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
  if (this.rtl_) backward = !backward;
  /**
   * @type {Array.<number>}
   * @private
   */
  this.tanLeft_ = [];
  /**
   * @type {Array.<number>}
   * @private
   */
  this.tanRight_ = [];
  /**
   * @type {number}
   * @private
   */
  this.tangentLengthPercent_ = backward ? -0.25 : 0.25;
  /**
   * @type {number}
   * @private
   */
  this.tanLenFactor_ = 1;
  /**
   * @type {Array.<number>}
   * @private
   */
  this.v1_ = [];
  /**
   * @type {Array.<number>}
   * @private
   */
  this.v2_ = [];
  /**
   * @type {Array.<number>}
   * @private
   */
  this.tan_ = [];
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.startSplineDrawing_ = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  this.v1_[0] = p2x - p1x;
  this.v1_[1] = p2y - p1y;
  var len = Math.sqrt(this.v1_[0] * this.v1_[0] + this.v1_[1] * this.v1_[1]);
  this.v1_[0] /= -len;
  this.v1_[1] /= -len;

  this.tanLenFactor_ = p2x - p1x;

  this.v2_[0] = p3x - p2x;
  this.v2_[1] = p3y - p2y;
  len = Math.sqrt(this.v2_[0] * this.v2_[0] + this.v2_[1] * this.v2_[1]);
  this.v2_[0] /= len;
  this.v2_[1] /= len;

  this.tan_[0] = this.v2_[0] - this.v1_[0];
  this.tan_[1] = this.v2_[1] - this.v1_[1];
  len = Math.sqrt(this.tan_[0] * this.tan_[0] + this.tan_[1] * this.tan_[1]);
  this.tan_[0] /= len;
  this.tan_[1] /= len;

  if (this.v1_[1] * this.v2_[1] >= 0) {
    if (this.tangentLengthPercent_ < 0)
      this.tan_[0] = -1;
    else
      this.tan_[0] = 1;
    this.tan_[1] = 0;
  }

  this.tanLeft_[0] = -this.tan_[0] * this.tanLenFactor_ * this.tangentLengthPercent_;
  this.tanLeft_[1] = -this.tan_[1] * this.tanLenFactor_ * this.tangentLengthPercent_;

  for (var i = 0; i < this.paths_.length; i++)
    this.paths_[i].quadraticCurveTo(p2x + this.tanLeft_[0], p2y + this.tanLeft_[1], p2x, p2y);

  this.tanLenFactor_ = p3x - p2x;
  this.tanRight_[0] = this.tan_[0] * this.tanLenFactor_ * this.tangentLengthPercent_;
  this.tanRight_[1] = this.tan_[1] * this.tanLenFactor_ * this.tangentLengthPercent_;
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawNextSplinePoint_ = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  this.v1_[0] = -this.v2_[0];
  this.v1_[1] = -this.v2_[1];

  this.v2_[0] = p3x - p2x;
  this.v2_[1] = p3y - p2y;
  var len = Math.sqrt(this.v2_[0] * this.v2_[0] + this.v2_[1] * this.v2_[1]);
  this.v2_[0] /= len;
  this.v2_[1] /= len;

  this.tan_[0] = this.v2_[0] - this.v1_[0];
  this.tan_[1] = this.v2_[1] - this.v1_[1];
  len = Math.sqrt(this.tan_[0] * this.tan_[0] + this.tan_[1] * this.tan_[1]);
  this.tan_[0] /= len;
  this.tan_[1] /= len;

  if (this.v1_[1] * this.v2_[1] >= 0) {
    if (this.tangentLengthPercent_ < 0)
      this.tan_[0] = -1;
    else
      this.tan_[0] = 1;
    this.tan_[1] = 0;
  }

  this.tanLeft_[0] = -this.tan_[0] * this.tanLenFactor_ * this.tangentLengthPercent_;
  this.tanLeft_[1] = -this.tan_[1] * this.tanLenFactor_ * this.tangentLengthPercent_;

  var cp1 = [p1x + this.tanRight_[0], p1y + this.tanRight_[1]];
  var cp2 = [p2x + this.tanLeft_[0], p2y + this.tanLeft_[1]];
  var mp = [(cp1[0] + cp2[0]) / 2, (cp1[1] + cp2[1]) / 2];

  for (var i = 0; i < this.paths_.length; i++)
    this.paths_[i]
        .quadraticCurveTo(cp1[0], cp1[1], mp[0], mp[1])
        .quadraticCurveTo(cp2[0], cp2[1], p2x, p2y);

  this.tanLenFactor_ = p3x - p2x;
  this.tanRight_[0] = this.tan_[0] * this.tanLenFactor_ * this.tangentLengthPercent_;
  this.tanRight_[1] = this.tan_[1] * this.tanLenFactor_ * this.tangentLengthPercent_;
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
  for (var i = 0; i < this.paths_.length; i++)
    this.paths_[i].quadraticCurveTo(p1x + this.tanRight_[0], p1y + this.tanRight_[1], p2x, p2y);
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
  for (var i = 0; i < this.paths_.length; i++)
    this.paths_[i].lineTo(p2x, p2y);
};
