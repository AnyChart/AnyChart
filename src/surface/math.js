goog.provide('anychart.surfaceModule.math');


/**
 * Scale factor to fit object vertically into screen bounds.
 * @type {number}
 * @const
 */
anychart.surfaceModule.math.verticalScaleFactor = 1.75;


/**
 * Scale factor to fit object horizontally into screen bounds.
 * @type {number}
 * @const
 */
anychart.surfaceModule.math.horizontalScaleFactor = 1.48;


/**
 * Prepares transformation matrix for points rotation.
 * @param {number} yaw Z axis rotation in degrees
 * @param {number} pitch Y axis rotation in degrees
 * @return {Array.<number>} transformation matrix.
 */
anychart.surfaceModule.math.createTransformationMatrix = function(yaw, pitch) {
  // degrees to radians
  yaw = Math.PI / 180 * yaw;
  pitch = Math.PI / 180 * pitch;

  var sinA = Math.sin(yaw);
  var cosA = Math.cos(yaw);
  var sinB = Math.sin(pitch);
  var cosB = Math.cos(pitch);

  return [cosA * cosB, -sinA * cosB, sinB,
          sinA, cosA, 0,
          -sinB * cosA, sinA * sinB, cosB];
};


/**
 * Transforms points with prepared matrix.
 * @param {Array.<number>} matrix which is applied to point.
 * @param {Array.<number>} point to which matrix is applied.
 * @return {Array.<number>} Resulting point, modified by matrix.
 */
anychart.surfaceModule.math.applyTransformationMatrixToPoint = function(matrix, point) {
  var x = point[0] * matrix[0] + point[1] * matrix[1] + point[2] * matrix[2];
  var y = point[0] * matrix[3] + point[1] * matrix[4] + point[2] * matrix[5];
  var z = point[0] * matrix[6] + point[1] * matrix[7] + point[2] * matrix[8];
  return [x, y, z];
};


/**
 * Calculates distance from view plane to point.
 * Calculating distance from point rotated by Y and using this distance to set zIndex fixes drawing glitches.
 * This glitches occur if zIndex is set as plane x value of modified point or distance from unmodified pointForDepth
 * and surface is rotated along y axis.
 * @param {number} rotationY
 * @param {Array.<number>} point modified by matrix.
 * @return {number} It returns distance to point.
 */
anychart.surfaceModule.math.distanceToPoint = function(rotationY, point) {
  return anychart.surfaceModule.math.distanceToPath(rotationY, [point]);
};


/**
 * Calculates distance to path from camera, with given rotation along Y axis containing more than one point
 * @param {number} rotationY
 * @param {Array.<Array.<number>>} points
 * @return {number}
 */
anychart.surfaceModule.math.distanceToPath = function(rotationY, points) {
  var matrix = anychart.surfaceModule.math.createTransformationMatrix(0, rotationY);
  var pointForDepth = anychart.surfaceModule.math.applyTransformationMatrixToPoint(matrix, [-1, 0, 0]);
  var a = pointForDepth[0];
  var b = pointForDepth[1];
  var c = pointForDepth[2];
  var d = a * a + b * b + c * c;

  var distance = 0;

  for (var i = 0; i < points.length; i++) {
    var p0 = points[i];
    distance += Math.abs(a * p0[0] + b * p0[1] + c * p0[2] - d) / (Math.sqrt(d));
  }

  distance /= points.length;

  return distance;
};


/**
 * Calculates distance between two points.
 * @param {Array.<number>} from First point.
 * @param {Array.<number>} to Second point.
 * @return {number} Distance between from and to points.
 */
anychart.surfaceModule.math.distanceFromPointToPoint = function(from, to) {
  var a = from[0];
  var b = from[1];
  var c = from[2];
  var d = a * a + b * b + c * c;

  return Math.abs(a * to[0] + b * to[1] + c * to[2] - d) / (Math.sqrt(d));
};


/**
 * Converts given point to screen coordinates. Returns all of 3 coordinates, with only last two converted.
 * So [x, y, z] => [unused, x, y].
 * Also can imitate perspective.
 * @param {Array.<number>} point To convert to screen coordinates. X, Y and Z values are ratios.
 * @param {anychart.math.Rect} bounds In which point will be drawn.
 * @param {boolean=} opt_weakPerspective Imitates perspective
 * @return {Array.<number>}
 */
anychart.surfaceModule.math.pointToScreenCoordinates = function(point, bounds, opt_weakPerspective) {
  point = point.slice();
  var horizontalScaleFactor = anychart.surfaceModule.math.horizontalScaleFactor;
  var verticalScaleFactor = anychart.surfaceModule.math.verticalScaleFactor;

  var depth = -point[0];
  var newMax = 1;
  var newMin = 0.9;
  var oldMax = 0.5;
  var oldMin = -0.5;
  var fac;
  if (opt_weakPerspective) {
    // Converts value from one range into another, preserving value ratio.
    // This factor is then used to simulate simple one point perspective.
    fac = (depth - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
  } else {
    fac = 1;
  }
  point[1] = fac * (bounds.left + point[1] * bounds.width / horizontalScaleFactor) + bounds.width / 2;
  point[2] = fac * (bounds.top + point[2] * bounds.height / verticalScaleFactor) + bounds.height / 2;

  return point;
};


/**
 * Converts given points array to screen coordinates. Returns all of 3 coordinates, with only last two converted.
 * So [x, y, z] => [unused, x, y].
 * @param {Array.<Array.<number>>} points with start values in range of [-0.5; 0.5], modified by matrix.
 * @param {anychart.math.Rect} bounds of area where points will be drawn.
 * @return {Array.<Array.<number>>} points in screen coordinates.
 */
anychart.surfaceModule.math.pointsToScreenCoordinates = function(points, bounds) {
  points = points.slice();
  for (var i = 0; i < points.length; i++) {
    points[i] = anychart.surfaceModule.math.pointToScreenCoordinates(points[i], bounds);
  }
  return points;
};
