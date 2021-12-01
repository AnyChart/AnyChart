goog.provide('anychart.surfaceModule.axes.Base');

goog.require('anychart.core.Axis');
goog.require('anychart.math.Rect');
goog.require('anychart.surfaceModule.AxisTicks');
goog.require('anychart.surfaceModule.math');
goog.require('goog.math.Coordinate');



//region --- Constructor, signals, consistency states, descriptors
/**
 * Base surface chart axis.
 *
 * @extends {anychart.core.Axis}
 *
 * @constructor
 */
anychart.surfaceModule.axes.Base = function() {
  anychart.surfaceModule.axes.Base.base(this, 'constructor');

  /**
   * Points of the bottom side of the bounding box of chart.
   * @type {Array.<Array.<number>>}
   * @protected
   */
  this.basicStartingPoints_ = [ // bottom plane points
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5]
  ];

  /**
   * Prepared transformation matrix.
   * @type {Array.<number>}
   * @protected
   */
  this.preparedMatrix_ = [];

  /**
   * Whether axes position is fixed (no jumping around)
   * @type {boolean}
   * @protected
   */
  this.fixedPosition_ = false;

};
goog.inherits(anychart.surfaceModule.axes.Base, anychart.core.Axis);


//endregion
//region --- Matrix, points finding
/**
 * Prepares transformation matrix with given rotations.
 */
anychart.surfaceModule.axes.Base.prototype.prepareMatrix = function() {
  this.preparedMatrix_ =
    anychart.surfaceModule.math.createTransformationMatrix(/** @type {number} */(this.rotationZ_), /** @type {number} */(this.rotationY_));
};


/**
 * Finds most left point for zAxis.
 * @return {Array.<number>}
 */
anychart.surfaceModule.axes.Base.prototype.findLeftPoint = function() {
  this.prepareMatrix();
  var rotatedPoints = [];
  var left = [0, 0, 0];
  var leftRotated = [0, 0, 0];
  for (var i = 0; i < this.basicStartingPoints_.length; i++) {
    var point = this.basicStartingPoints_[i];
    rotatedPoints.push(anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point));
    if (rotatedPoints[i][1] < leftRotated[1]) {
      left = point;
      leftRotated = rotatedPoints[i];
    }
  }
  return left;
};


/**
 * Finds nearest to view plane point for x and y axes.
 * @return {Array.<number>}
 */
anychart.surfaceModule.axes.Base.prototype.findNearestPoint = function() {
  this.prepareMatrix();
  var minDepth = +Infinity;
  var minDepthIndex = 0;
  for (var i = 0; i < this.basicStartingPoints_.length; i++) {
    var depth = anychart.surfaceModule.math.distanceToPoint(/** @type {number} */(this.rotationY_),
        anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, this.basicStartingPoints_[i]));
    if (depth < minDepth) {
      minDepth = depth;
      minDepthIndex = i;
    }
  }
  return this.basicStartingPoints_[minDepthIndex];
};


//endregion
//region --- Drawing
/**
 * Draws line from one point to another.
 * @param {Array.<number>} point first nontransformed point.
 * @param {Array.<number>} nextPoint second nontransformed point.
 * @param {anychart.math.Rect} bounds in which axis is drawn.
 */
anychart.surfaceModule.axes.Base.prototype.drawLineByPoints = function(point, nextPoint, bounds) {
  point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
  nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);
  this.startPoint_ = point.slice();
  this.endPoint_ = nextPoint.slice();
  var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], bounds);

  var startX = convertedPoints[0][1];
  var startY = convertedPoints[0][2];
  var endX = convertedPoints[1][1];
  var endY = convertedPoints[1][2];

  var zIndex = this.zIndex() + 2 - anychart.surfaceModule.math.distanceToPath(/** @type {number} */(this.rotationY_), [point, nextPoint]);
  var line = this.getLine();
  line.clear();
  line.moveTo(startX, startY)
      .lineTo(endX, endY);

  var ticks = this.ticks();
  var minorTicks = this.minorTicks();

  anychart.core.Base.suspendSignalsDispatching(ticks, minorTicks);

  ticks.startEndPoints([startX, startY], [endX, endY]);
  ticks.zIndex(zIndex);
  minorTicks.startEndPoints([startX, startY], [endX, endY]);
  minorTicks.zIndex(zIndex);

  anychart.core.Base.resumeSignalsDispatchingTrue(ticks, minorTicks);
};


/** @inheritDoc */
anychart.surfaceModule.axes.Base.prototype.updateZIndex = function() {
  anychart.surfaceModule.axes.Base.base(this, 'updateZIndex');
  var zIndex = this.zIndex() + 2 - anychart.surfaceModule.math.distanceToPath(/** @type {number} */(this.rotationY_), [this.startPoint_, this.endPoint_]);
  this.line.zIndex(zIndex);
  this.ticks().zIndex(zIndex);
  this.minorTicks().zIndex(zIndex);
};


//endregion
//region --- Overrides
/** @inheritDoc */
anychart.surfaceModule.axes.Base.prototype.createTicks = function() {
  return new anychart.surfaceModule.AxisTicks();
};


//endregion
//region --- Transformations
/**
 * Sets Y axis rotation.
 * @param {number=} opt_value
 * @return {anychart.surfaceModule.axes.Base|number}
 */
anychart.surfaceModule.axes.Base.prototype.rotationY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.core.settings.numberNormalizer(opt_value);
    if (this.rotationY_ != opt_value) {
      this.rotationY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.BOUNDS_CHANGED);
      this.dropBoundsCache(); //this is for labels overlap to work
    }
    return this;
  }
  return this.rotationY_;
};


/**
 * Sets Z axis rotation.
 * @param {number=} opt_value
 * @return {anychart.surfaceModule.axes.Base|number}
 */
anychart.surfaceModule.axes.Base.prototype.rotationZ = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.core.settings.numberNormalizer(opt_value);
    if (this.rotationZ_ != opt_value) {
      this.rotationZ_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.BOUNDS_CHANGED);
      this.dropBoundsCache(); //this is for labels overlap to work
    }
    return this;
  }
  return this.rotationZ_;
};


/**
 * Getter of fixed position setting.
 * @return {boolean}
 */
anychart.surfaceModule.axes.Base.prototype.fixedPosition = function() {
  return this.fixedPosition_;
};
//endregion
