goog.provide('anychart.surfaceModule.Axis');
goog.require('anychart.core.Axis');
goog.require('anychart.math.Rect');
goog.require('anychart.surfaceModule.AxisTicks');
goog.require('anychart.surfaceModule.math');
goog.require('goog.math.Coordinate');



//region --- Constructor, signals, consistency states, descriptors
/**
 * Surface chart axis.
 * Depending on orientation setting axis is drawn on Surface chart as X, Y or Z:
 *  anychart.enums.orientation.RIGHT - xAxis
 *  anychart.enums.orientation.BOTTOM - yAxis
 *  anychart.enums.orientation.LEFT - zAxis
 * @extends {anychart.core.Axis}
 * @constructor
 */
anychart.surfaceModule.Axis = function() {
  anychart.surfaceModule.Axis.base(this, 'constructor');

  /**
   * Points of the bottom side of the bounding box of chart.
   * @type {Array.<Array.<number>>}
   * @private
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
   * @private
   */
  this.preparedMatrix_ = [];

  /**
   * Whether axes position is fixed (no jumping around)
   * @type {boolean}
   * @private
   */
  this.fixedPosition_ = false;

};
goog.inherits(anychart.surfaceModule.Axis, anychart.core.Axis);


/**
 * @type {number}
 */
anychart.surfaceModule.Axis.prototype.SUPPORTED_SIGNALS = anychart.core.Axis.prototype.SUPPORTED_SIGNALS;


/**
 * @type {number}
 */
anychart.surfaceModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Axis.prototype.SUPPORTED_CONSISTENCY_STATES;
//endregion
//region --- Matrix, points findind


/**
 * Prepares transformation matrix with given rotations.
 */
anychart.surfaceModule.Axis.prototype.prepareMatrix = function() {
  this.preparedMatrix_ = anychart.surfaceModule.math.createTransformationMatrix(/** @type {number} */(this.rotationZ_),
      /** @type {number} */(this.rotationY_));
};


/**
 * Finds most left point for zAxis.
 * @return {Array.<number>}
 */
anychart.surfaceModule.Axis.prototype.findLeftPoint = function() {
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
anychart.surfaceModule.Axis.prototype.findNearestPoint = function() {
  this.prepareMatrix();
  var depths = [];
  var minDepth = +Infinity;
  var minDepthIndex = 0;
  for (var i = 0; i < this.basicStartingPoints_.length; i++) {
    var depth = anychart.surfaceModule.math.distanceToPoint(/** @type {number} */(this.rotationY_),
        anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, this.basicStartingPoints_[i]));
    if (depth < minDepth) {
      minDepth = depth;
      minDepthIndex = i;
    }
    depths.push(depth);
  }
  return this.basicStartingPoints_[minDepthIndex];
};
//endregion
//region --- Drawing


/** @inheritDoc */
anychart.surfaceModule.Axis.prototype.drawTitle = function() {
  var title = this.getCreated('title');
  if (title) {
    var lineBounds = this.getLine().getBounds().clone();
    var parentBounds = this.parentBounds();
    switch(this.getOption('orientation')) {
      case anychart.enums.Orientation.LEFT:
        title.defaultOrientation(anychart.enums.Orientation.LEFT);
        break;
      case anychart.enums.Orientation.BOTTOM:
        title.defaultOrientation(anychart.enums.Orientation.BOTTOM);
        lineBounds.height = parentBounds.getBottom() - lineBounds.top;
        break;
      case anychart.enums.Orientation.RIGHT:
        title.defaultOrientation(anychart.enums.Orientation.BOTTOM);
        lineBounds.height = parentBounds.getBottom() - lineBounds.top;
        break;
    }
    title.parentBounds(lineBounds);
    title.draw();
  }
};


/**
 * Z axis drawer.
 * @inheritDoc
 */
anychart.surfaceModule.Axis.prototype.drawLeftLine = function(bounds, pixelShift, lineThickness, offset, size) {
  this.prepareMatrix();
  var leftPoint = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findLeftPoint();

  var leftUpper = [leftPoint[0], leftPoint[1], -0.5];

  this.drawLineByPoints(leftPoint, leftUpper, bounds);
};


/**
 * X axis drawer.
 * @inheritDoc
 */
anychart.surfaceModule.Axis.prototype.drawRightLine = function(bounds, pixelShift, lineThickness, offset, size) {
  this.prepareMatrix();
  var point = this.fixedPosition_ ? this.basicStartingPoints_[0].slice() : this.findNearestPoint();

  var nextPoint = [point[0] == -0.5 ? 0.5 : -0.5, point[1], point[2]];

  if (nextPoint[0] == -0.5) {
    var temp = nextPoint;
    nextPoint = point;
    point = temp;
  }

  this.drawLineByPoints(point, nextPoint, bounds);
};


/**
 * Y axis drawer.
 * @inheritDoc
 */
anychart.surfaceModule.Axis.prototype.drawBottomLine = function(bounds, pixelShift, lineThickness, offset, size) {
  this.prepareMatrix();
  var point = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findNearestPoint();

  var nextPoint = [point[0], point[1] == -0.5 ? 0.5 : -0.5, point[2]];

  if (nextPoint[1] == -0.5) {
    var temp = nextPoint;
    nextPoint = point;
    point = temp;
  }

  this.drawLineByPoints(point, nextPoint, bounds);
};


/**
 * Draws line from one point to another.
 * @param {Array.<number>} point first nontransformed point.
 * @param {Array.<number>} nextPoint second nontransformed point.
 * @param {anychart.math.Rect} bounds in which axis is drawn.
 */
anychart.surfaceModule.Axis.prototype.drawLineByPoints = function(point, nextPoint, bounds) {
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
anychart.surfaceModule.Axis.prototype.updateZIndex = function() {
  anychart.surfaceModule.Axis.base(this, 'updateZIndex');
  var zIndex = this.zIndex() + 2 - anychart.surfaceModule.math.distanceToPath(/** @type {number} */(this.rotationY_), [this.startPoint_, this.endPoint_]);
  this.line.zIndex(zIndex);
  this.ticks().zIndex(zIndex);
  this.minorTicks().zIndex(zIndex);
};


/** @inheritDoc */
anychart.surfaceModule.Axis.prototype.drawLine = function() {
  var orientation = this.getOption('orientation');
  var lineDrawer;
  if (orientation == anychart.enums.Orientation.LEFT) {
    lineDrawer = this.drawLeftLine;
  } else if (orientation == anychart.enums.Orientation.RIGHT) {
    lineDrawer = this.drawRightLine;
  } else if (orientation == anychart.enums.Orientation.BOTTOM) {
    lineDrawer = this.drawBottomLine;
  }

  lineDrawer.call(this, /** @type {goog.math.Rect} */(this.parentBounds()), 0, 1, 0, 0);

  this.line.stroke(this.getOption('stroke'));
};


/** @inheritDoc */
anychart.surfaceModule.Axis.prototype.getLabelDrawPosition = function(ratio, labelBounds, staggerSize, tickLength, pixelShift, labelsSidePosition, isMajor) {
  var bounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var labels, ticks;
  if (isMajor) {
    labels = this.labels();
  } else {
    labels = this.minorLabels();
  }

  var x = 0;
  var y = 0;
  var nextPoint, startX, startY, endX, endY;
  var width = bounds.width;
  var height = bounds.height;
  var fixedPosition = this.fixedPosition_;
  var zIndex = this.zIndex();
  var orientation = this.getOption('orientation');
  var point = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findNearestPoint();
  switch (orientation) {
    case anychart.enums.Orientation.RIGHT:
      nextPoint = [point[0] == -0.5 ? 0.5 : -0.5, point[1], point[2]];

      if (nextPoint[0] == -0.5) {
        var temp = point;
        point = nextPoint;
        nextPoint = temp;
      }

      point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
      nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);

      // hack, bc we can only set zIndex for labelsFactory as a whole, not individual labels
      zIndex = this.zIndex() + (this.rotationY_ < 0 ? 2 : -2);

      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], /** @type {goog.math.Rect} */(bounds));

      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      x = (startX * (1 - ratio) + ratio * endX);
      y = (startY * (1 - ratio) + ratio * endY) + tickLength + labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.BOTTOM:
      nextPoint = [point[0], point[1] == -0.5 ? 0.5 : -0.5, point[2]];

      if (nextPoint[1] == -0.5) {
        var temp = point;
        point = nextPoint;
        nextPoint = temp;
      }

      point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
      nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);
      var m = ratio;
      var n = 1 - ratio;

      var labelPoint = [];
      labelPoint.push((m * nextPoint[0] + n * point[0]));
      labelPoint.push((m * nextPoint[1] + n * point[1]));
      labelPoint.push((m * nextPoint[2] + n * point[2]));

      // hack, bc we can only set zIndex for labelsFactory as a whole, not individual labels
      zIndex = this.zIndex() + (this.rotationY_ < 0 ? 2 : -2);

      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], bounds);

      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      x = (startX * (1 - ratio) + ratio * endX);
      y = (startY * (1 - ratio) + ratio * endY) + tickLength + labelBounds.height / 2;
      break;
    case anychart.enums.Orientation.LEFT:
      var leftPoint = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findLeftPoint();
      var leftUpper = [leftPoint[0], leftPoint[1], -0.5];
      leftPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftPoint);
      leftUpper = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftUpper);
      zIndex = this.zIndex() + 2;

      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([leftPoint, leftUpper], bounds);

      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      var heightOfLine = Math.abs(startY - endY);
      var minY = Math.min(startY, endY);
      y = (minY + heightOfLine) - heightOfLine * ratio;
      x = startX - tickLength - labelBounds.width / 2;
      break;
  }
  // override labels zIndex
  labels.zIndex(/** @type {number} */(zIndex));
  return {x: x, y: y};
};
//endregion


/**
 * Sets Y axis rotation.
 * @param {number=} opt_value
 * @return {anychart.surfaceModule.Axis|number}
 */
anychart.surfaceModule.Axis.prototype.rotationY = function(opt_value) {
  opt_value = anychart.core.settings.numberNormalizer(opt_value);
  if (goog.isDef(opt_value)) {
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
 * @return {anychart.surfaceModule.Axis|number}
 */
anychart.surfaceModule.Axis.prototype.rotationZ = function(opt_value) {
  opt_value = anychart.core.settings.numberNormalizer(opt_value);
  if (goog.isDef(opt_value)) {
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


/** @inheritDoc */
anychart.surfaceModule.Axis.prototype.createTicks = function() {
  return new anychart.surfaceModule.AxisTicks();
};


/** @inheritDoc */
anychart.surfaceModule.Axis.prototype.getLabelPositionXY = function(bounds, ratio, lineThickness, tickLength, lineBounds) {
  bounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var x = 0;
  var y = 0;
  var nextPoint, startX, startY, endX, endY;
  var width = bounds.width;
  var height = bounds.height;
  var zIndex = this.zIndex();
  var orientation = this.getOption('orientation');
  var point = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findNearestPoint();
  switch (orientation) {
    case anychart.enums.Orientation.RIGHT:
      nextPoint = [point[0] == -0.5 ? 0.5 : -0.5, point[1], point[2]];

      if (nextPoint[0] == -0.5) {
        var temp = point;
        point = nextPoint;
        nextPoint = temp;
      }

      point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
      nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);

      // hack, bc we can only set zIndex for labelsFactory as a whole, not individual labels
      if (/** @type {number} */(this.rotationY_) < 0)
        zIndex = this.zIndex() + 2;
      else
        zIndex = this.zIndex() - 2;

      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], /** @type {goog.math.Rect} */(bounds));

      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      x = (startX * (1 - ratio) + ratio * endX);
      y = (startY * (1 - ratio) + ratio * endY) + tickLength;
      break;
    case anychart.enums.Orientation.BOTTOM:
      nextPoint = [point[0], point[1] == -0.5 ? 0.5 : -0.5, point[2]];

      if (nextPoint[1] == -0.5) {
        var temp = point;
        point = nextPoint;
        nextPoint = temp;
      }

      point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
      nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);
      var m = ratio;
      var n = 1 - ratio;

      var labelPoint = [];
      labelPoint.push((m * nextPoint[0] + n * point[0]));
      labelPoint.push((m * nextPoint[1] + n * point[1]));
      labelPoint.push((m * nextPoint[2] + n * point[2]));

      // hack, bc we can only set zIndex for labelsFactory as a whole, not individual labels
      if (/** @type {number} */(this.rotationY_) < 0)
        zIndex = this.zIndex() + 2;
      else
        zIndex = this.zIndex() - 2;
      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], bounds);
    
      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      x = (startX * (1 - ratio) + ratio * endX);
      y = (startY * (1 - ratio) + ratio * endY) + tickLength;
      break;
    case anychart.enums.Orientation.LEFT:
      var leftPoint = this.fixedPosition_ ? this.basicStartingPoints_[0] : this.findLeftPoint();
      var leftUpper = [leftPoint[0], leftPoint[1], -0.5];
      leftPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftPoint);
      leftUpper = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftUpper);
      zIndex = this.zIndex() + 2 - anychart.surfaceModule.math.distanceToPath(/** @type {number} */(this.rotationY_), [leftPoint, leftUpper]);

      var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([leftPoint, leftUpper], bounds);
    
      startX = convertedPoints[0][1];
      startY = convertedPoints[0][2];
      endX = convertedPoints[1][1];
      endY = convertedPoints[1][2];

      var heightOfLine = Math.abs(startY - endY);
      var minY = Math.min(startY, endY);
      y = (minY + heightOfLine) - heightOfLine * ratio;
      x = startX - tickLength;
      break;
  }
  return {x: x, y: y};
};


/**
 * Getter of fixed position setting.
 * @return {boolean}
 */
anychart.surfaceModule.Axis.prototype.fixedPosition = function() {
  return this.fixedPosition_;
};
