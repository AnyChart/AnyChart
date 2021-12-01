goog.provide('anychart.surfaceModule.axes.ZAxis');

goog.require('anychart.math.Rect');
goog.require('anychart.surfaceModule.AxisTicks');
goog.require('anychart.surfaceModule.axes.Base');
goog.require('anychart.surfaceModule.math');
goog.require('goog.math.Coordinate');



//region --- Constructor, signals, consistency states, descriptors
/**
 * Surface chart z axis.
 *
 * @extends {anychart.surfaceModule.axes.Base}
 *
 * @constructor
 */
anychart.surfaceModule.axes.ZAxis = function() {
  anychart.surfaceModule.axes.ZAxis.base(this, 'constructor');
};
goog.inherits(anychart.surfaceModule.axes.ZAxis, anychart.surfaceModule.axes.Base);


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.surfaceModule.axes.ZAxis.prototype.drawTitle = function() {
  var title = this.getCreated('title');
  if (title) {
    var lineBounds = this.getLine().getBounds().clone();
    title.defaultOrientation(anychart.enums.Orientation.LEFT);
    title.parentBounds(lineBounds);
    title.draw();
  }
};


/** @inheritDoc */
anychart.surfaceModule.axes.ZAxis.prototype.drawLine = function() {
  this.prepareMatrix();
  var leftPoint = this.fixedPosition() ? this.basicStartingPoints_[0] : this.findLeftPoint();

  var leftUpper = [leftPoint[0], leftPoint[1], -0.5];

  this.drawLineByPoints(leftPoint, leftUpper, /** @type {goog.math.Rect} */(this.parentBounds()));
  this.line.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
};


/**
 *
 * @param {number} ratio
 * @param {number} offsetX
 * @return {{
 *   x: number,
 *   y: number
 * }}
 */
anychart.surfaceModule.axes.ZAxis.prototype.getLabelPosition = function(ratio, offsetX) {
  var bounds = /** @type {goog.math.Rect} */(this.parentBounds());
  var leftPoint = this.fixedPosition() ? this.basicStartingPoints_[0] : this.findLeftPoint();
  var leftUpper = [leftPoint[0], leftPoint[1], -0.5];

  leftPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftPoint);
  leftUpper = anychart.surfaceModule.math.applyTransformationMatrixToPoint(this.preparedMatrix_, leftUpper);

  var convertedPoints = anychart.surfaceModule.math.pointsToScreenCoordinates([leftPoint, leftUpper], bounds);

  var startX = convertedPoints[0][1];
  var startY = convertedPoints[0][2];
  var endX = convertedPoints[1][1];
  var endY = convertedPoints[1][2];

  var heightOfLine = Math.abs(startY - endY);
  var minY = Math.min(startY, endY);

  var y = (minY + heightOfLine) - heightOfLine * ratio;
  var x = startX + offsetX;

  return {
    x: x,
    y: y
  };
};


//endregion
//region --- Labels
/** @inheritDoc */
anychart.surfaceModule.axes.ZAxis.prototype.getLabelDrawPosition = function(ratio, labelBounds, staggerSize, tickLength, pixelShift, labelsSidePosition, isMajor) {
  var labels = isMajor ? this.labels() : this.minorLabels();
  var zIndex = /** @type {number} */(this.zIndex()) + 2;

  labels.zIndex(zIndex);

  return this.getLabelPosition(ratio, -tickLength - labelBounds.width / 2);
};


/** @inheritDoc */
anychart.surfaceModule.axes.ZAxis.prototype.getLabelPositionXY = function(bounds, ratio, lineThickness, tickLength, lineBounds) {
  return this.getLabelPosition(ratio, -tickLength);
};
//endregion

