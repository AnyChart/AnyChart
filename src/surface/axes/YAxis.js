goog.provide('anychart.surfaceModule.axes.YAxis');

goog.require('anychart.math.Rect');
goog.require('anychart.surfaceModule.AxisTicks');
goog.require('anychart.surfaceModule.axes.Base');
goog.require('anychart.surfaceModule.math');
goog.require('goog.math.Coordinate');



//region --- Constructor, signals, consistency states, descriptors
/**
 * Surface chart y axis.
 *
 * @extends {anychart.surfaceModule.axes.Base}
 *
 * @constructor
 */
anychart.surfaceModule.axes.YAxis = function() {
  anychart.surfaceModule.axes.YAxis.base(this, 'constructor');
};
goog.inherits(anychart.surfaceModule.axes.YAxis, anychart.surfaceModule.axes.Base);


/**
 * Finds nearest to view plane point for x and y axes.
 * @return {Array.<number>}
 */
anychart.surfaceModule.axes.YAxis.prototype.findNearestPoint = function() {
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
/** @inheritDoc */
anychart.surfaceModule.axes.YAxis.prototype.drawTitle = function() {
  var title = this.getCreated('title');
  if (title) {
    var lineBounds = this.getLine().getBounds().clone();
    var parentBounds = this.parentBounds();
    title.defaultOrientation(anychart.enums.Orientation.BOTTOM);
    lineBounds.height = parentBounds.getBottom() - lineBounds.top;
    title.parentBounds(lineBounds);
    title.draw();
  }
};


/** @inheritDoc */
anychart.surfaceModule.axes.YAxis.prototype.drawLine = function() {
  this.prepareMatrix();
  var point = this.fixedPosition() ? this.basicStartingPoints_[0] : this.findNearestPoint();

  var nextPoint = [point[0], point[1] == -0.5 ? 0.5 : -0.5, point[2]];

  if (nextPoint[1] == -0.5) {
    var temp = nextPoint;
    nextPoint = point;
    point = temp;
  }

  this.drawLineByPoints(point, nextPoint, /** @type {goog.math.Rect} */(this.parentBounds()));
  this.line.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


/**
 *
 * @param {number} ratio
 * @param {number} offsetY
 * @return {{
 *   x: number,
 *   y: number
 * }}
 */
anychart.surfaceModule.axes.YAxis.prototype.getLabelPosition = function(ratio, offsetY) {
  var bounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var point = this.fixedPosition() ? this.basicStartingPoints_[0] : this.findNearestPoint();
  var nextPoint = [point[0], point[1] == -0.5 ? 0.5 : -0.5, point[2]];

  if (nextPoint[1] == -0.5) {
    var temp = point;
    point = nextPoint;
    nextPoint = temp;
  }

  point = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, point);
  nextPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, nextPoint);

  var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([point, nextPoint], bounds);

  var startX = convertedPoints[0][1];
  var startY = convertedPoints[0][2];
  var endX = convertedPoints[1][1];
  var endY = convertedPoints[1][2];

  var y = (startY * (1 - ratio) + ratio * endY) + offsetY;
  var x = (startX * (1 - ratio) + ratio * endX);

  return {
    x: x,
    y: y
  };
};

//endregion
//region --- Labels


/** @inheritDoc */
anychart.surfaceModule.axes.YAxis.prototype.resolveLabelEnabledState = function(index, values, states) {
  var enabled = anychart.surfaceModule.axes.YAxis.base(this, 'resolveLabelEnabledState', index, values, states);

  if (enabled) {
    var rawAngle = /**@type {number} */(this.rotationZ());
    var inverted = Math.floor(rawAngle * 2 / 360) % 2 !== 0;
    var angle = goog.math.standardAngle(rawAngle);

    angle = inverted ^ this.scale().inverted() ? angle - 180 : angle;

    var indexToHide;

    if ((angle >= 45 && angle <= 90) || (angle > 90 && angle < 135)) {
      indexToHide = inverted ? 0 : values.length - 1;
    }

    return index !== indexToHide;
  }

  return enabled;
};


/** @inheritDoc */
anychart.surfaceModule.axes.YAxis.prototype.getLabelDrawPosition = function(ratio, labelBounds, staggerSize, tickLength, pixelShift, labelsSidePosition, isMajor) {
  var labels = isMajor ? this.labels() : this.minorLabels();
  var zIndex = /** @type {number} */(this.zIndex()) + (this.rotationY_ < 0 ? 2 : -2);

  labels.zIndex(zIndex);

  return this.getLabelPosition(ratio, tickLength + labelBounds.height / 2);
};



/** @inheritDoc */
anychart.surfaceModule.axes.YAxis.prototype.getLabelPositionXY = function(bounds, ratio, lineThickness, tickLength, lineBounds) {
  return this.getLabelPosition(ratio, tickLength);
};
//endregion
