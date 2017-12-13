goog.provide('anychart.math');
goog.provide('anychart.math.Rect');

goog.require('acgraph.math');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');



/**
 @namespace
 @name anychart.math
 */


/**
 * @includeDoc
 * @typedef {{
     x: (string|number),
     y: (string|number)
  }}
 */
anychart.math.CoordinateObject;


/**
 * Identifies an x-y coordinate pair.
 * @includeDoc
 * @typedef {!(
 *  Array.<number> |
 *  {x: number, y:number} |
 *  anychart.math.CoordinateObject |
 *  goog.math.Coordinate
 * )} anychart.math.Coordinate
 */
anychart.math.Coordinate;


/**
 * Tries to normalize anychart.math.Coordinate to goog.math.Coordinate.
 * @param {anychart.math.Coordinate} value anychart.math.Coordinate to normalize.
 * @return {goog.math.Coordinate} Normalized to goog.math.Coordinate value.
 */
anychart.math.normalizeCoordinate = function(value) {
  if (anychart.utils.instanceOf(value, goog.math.Coordinate)) {
    return /** @type {goog.math.Coordinate} */(value);
  } else {
    if (goog.isArray(value)) {
      return new goog.math.Coordinate(value[0], value[1]);
    } else if (goog.isObject(value)) {
      return new goog.math.Coordinate(value['x'], value['y']);
    }
  }
  return new goog.math.Coordinate(0, 0);
};


/**
 * Rounds a given number to a certain number of decimal places.
 * @param {number} num The number to be rounded.
 * @param {number=} opt_digitsCount Optional The number of places after the decimal point.
 * @return {number} The rounded number.
 */
anychart.math.round = function(num, opt_digitsCount) {
  var digitsCount = Math.floor(Math.log(Math.abs(num)) * Math.LOG10E);

  //Note: 14 here is a number of digits stored in floating-point number.
  //      The higher precision is 16 (max for JS floating), but 14 fixes last two digits.
  var tmp = Math.pow(10, Math.min(opt_digitsCount || 0, 14 - digitsCount));
  return Math.round(num * tmp) / tmp || 0;
};


/**
 * Rounds a given number to a certain number of decimal places (precision).
 * @param {number} num The number to be rounded.
 * @param {number=} opt_precision
 * @return {number} The rounded number.
 */
anychart.math.specialRound = function(num, opt_precision) {
  return anychart.math.round(num, opt_precision ? opt_precision : 13 - Math.max(Math.floor(Math.log(Math.abs(num)) * Math.LOG10E), 7));
};


/**
 * Gets given number's precision (number of decimal places).
 * @param {number} num
 * @return {number} Number of decimal places.
 */
anychart.math.getPrecision = function(num) {
  if (!isFinite(num)) return 0;
  var e = 1, p = 0;
  while (Math.round(num * e) / e !== num) {
    e *= 10;
    p++;
  }
  return p;
};


/**
 * Comparison of two numbers numbers for roughly equal with some accuracy.
 * @param {number} value First value to compare.
 * @param {number} value2 Second value to compare.
 * @param {number=} opt_eps Accuracy or neighborhood on which two value roughly equal.
 * @return {boolean} Whether value1 rough equal value2.
 */
anychart.math.roughlyEqual = function(value, value2, opt_eps) {
  var eps = opt_eps || 0.01;
  return Math.abs(value - value2) < eps;
};


/**
 * Safe log of a value.
 * @param {number} val .
 * @param {number=} opt_base Must meet (base > 0 && base != 1).
 * @return {number} .
 */
anychart.math.log = function(val, opt_base) {
  var res = Math.log(Math.max(1e-7, val));
  if (opt_base)
    return res / Math.log(opt_base);
  else
    return res;
};


/**
 * Pow with rounding.
 * @param {number} base
 * @param {number} pow
 * @return {number}
 */
anychart.math.pow = function(base, pow) {
  return anychart.math.round(Math.pow(base, pow), 7);
};


/**
 * Calculates array's median.
 * @param {Array.<number>} arr - Input array.
 * @return {number} - Median value.
 */
anychart.math.median = function(arr) {
  var a = goog.array.clone(arr);
  goog.array.sort(a);
  var half = Math.floor(a.length / 2);
  return (a.length % 2) ? a[half] : (a[half - 1] + a[half]) / 2.0;
};


/**
 * Calculates array's mode.
 * @param {Array.<number>} arr - Input array.
 * @return {number} - Mode value.
 */
anychart.math.mode = function(arr) {
  var valuesMap = {};
  var maxElement = arr[0];
  var maxCount = 1;
  for (var i = 0; i < arr.length; i++) {
    var val = arr[i];
    if (goog.isDef(valuesMap[val])) {
      valuesMap[val]++;
    } else {
      valuesMap[val] = 1;
    }

    if (valuesMap[val] > maxCount) {
      maxElement = val;
      maxCount = valuesMap[val];
    }
  }
  return maxElement;
};


/**
 * Cheking rectangles intersection. Rectangle described by an array of its vertices.
 * We consider that two rectangles do not intersect, if we find a side of any of two rectangles
 * relative to which all vertices of another rect lie towards the same direction or lie on this side.
 * @param {Array.<number>=} opt_first First rect.
 * @param {Array.<number>=} opt_second Second rect.
 * @return {boolean} Returns true if rectangles intersect, false
 * if rectangles do not intersect.
 */
anychart.math.checkRectIntersection = function(opt_first, opt_second) {
  var result = false, k, k1, i, len;
  if (!opt_first || !opt_second) return false;
  for (i = 0, len = opt_first.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result = result || anychart.math.checkPointsRelativeLine(
        opt_first[i], opt_first[i + 1], opt_first[k], opt_first[k1], opt_second);
  }
  for (i = 0, len = opt_second.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result = result || anychart.math.checkPointsRelativeLine(
        opt_second[i], opt_second[i + 1], opt_second[k], opt_second[k1], opt_first);
  }
  return !result;
};


/**
 * Cheking rectangles intersection. Rectangle described by an array of its vertices.
 * We consider that two rectangles do not intersect, if we find a side of any of two rectangles
 * relative to which all vertices of another rect lie towards the same direction or lie on this side.
 * @param {Array.<number>=} opt_first First rect.
 * @param {Array.<number>=} opt_second Second rect.
 * @return {boolean|Array.<boolean>} Returns true if rectangles intersect, false
 * if rectangles do not intersect.
 */
anychart.math.checkRectIntersectionExt = function(opt_first, opt_second) {
  var result = [], k, k1, i, len;
  if (!opt_first || !opt_second) return false;
  for (i = 0, len = opt_first.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result.push(anychart.math.checkPointsRelativeLine(
        opt_first[i], opt_first[i + 1], opt_first[k], opt_first[k1], opt_second));
  }
  for (i = 0, len = opt_second.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result.push(anychart.math.checkPointsRelativeLine(
        opt_second[i], opt_second[i + 1], opt_second[k], opt_second[k1], opt_first));
  }
  return result;
};


/**
 * Check an array of points position in relation to
 * a line defined by two points.
 * @param {number} p1x X coordinate of the first point.
 * @param {number} p1y Y coordinate of the first point.
 * @param {number} p2x X coordinate of the second point.
 * @param {number} p2y Y coordinate of the second point.
 * @param {Array.<number>} pointsArr Array of points to check against the line
 * defined by two points.
 * @return {boolean} If all points from an array lie on the line or lie towards the same direction,
 * returns true, returns false otherwise.
 */
anychart.math.checkPointsRelativeLine = function(p1x, p1y, p2x, p2y, pointsArr) {
  var ok = true;
  for (var j = 0, len = pointsArr.length; j < len - 1; j = j + 2) {
    ok = ok && anychart.math.isPointOnLine(p1x, p1y, p2x, p2y, pointsArr[j], pointsArr[j + 1]) <= 0;
  }
  return ok;
};


/**
 * Check a point position against a line defined by two points.
 * @param {number} p1x X coordinate of the first point.
 * @param {number} p1y Y coordinate of the first point.
 * @param {number} p2x X coordinate of the second point.
 * @param {number} p2y Y coordinate of the second point.
 * @param {number} p3x X coordinate of a point to check.
 * @param {number} p3y X coordinate of a point to check.
 * @return {number} Returns 0 if a point lies on a line, in other cases a sign of a number
 * defines a direction.
 */
anychart.math.isPointOnLine = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  var result = (p1y - p2y) * p3x + (p2x - p1x) * p3y + (p1x * p2y - p2x * p1y);
  return !result ? 0 : result > 0 ? 1 : -1;
};


/**
 * Checks whether segment have intersection with rect.
 * @param {number} x1 X coord of first segment point.
 * @param {number} y1 Y coord of first segment point.
 * @param {number} x2 X coord of second segment point.
 * @param {number} y2 Y coord of second segment point.
 * @param {Array.<number>=} opt_rect Array of rect coords.
 * @return {boolean}
 */
anychart.math.checkRectIntersectionWithSegment = function(x1, y1, x2, y2, opt_rect) {
  var result = false, k, k1, i, len;
  if (!opt_rect) return false;

  for (i = 0, len = opt_rect.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;
    result = result || anychart.math.checkSegmentsIntersection(
        opt_rect[i], opt_rect[i + 1], opt_rect[k], opt_rect[k1], x1, y1, x2, y2);
  }
  return result;
};


/**
 * Check intersection for vertical aor horizontal segments.
 * @param {number} a Coord of first point of first segment.
 * @param {number} b Coord of second point of first segment.
 * @param {number} c Coord of first point of second segment.
 * @param {number} d Coord of second point of second segment.
 * @return {boolean} Whether segments have intersection.
 */
anychart.math.intersectVerticalOrHorizontalSegments = function(a, b, c, d) {
  var temp;
  if (a > b) {
    temp = a;
    a = b;
    b = temp;
  }

  if (c > d) {
    temp = c;
    c = d;
    d = temp;
  }

  return Math.max(a, c) <= Math.min(b, d);
};


/**
 * Calculates oriented area od triangle.
 * @param {number} x1 X coord of fist point of triangle.
 * @param {number} y1 Y coord of fist point of triangle.
 * @param {number} x2 X coord of second point of triangle.
 * @param {number} y2 Y coord of second point of triangle.
 * @param {number} x3 X coord of third point of triangle.
 * @param {number} y3 Y coord of third point of triangle.
 * @return {number} Triangle area.
 */
anychart.math.calcOrientedTriangleArea = function(x1, y1, x2, y2, x3, y3) {
  return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
};


/**
 * Checks two segments intersection.
 * @param {number} x1 X coord of first point of first segment.
 * @param {number} y1 Y coord of first point of first segment.
 * @param {number} x2 X coord of second point of first segment.
 * @param {number} y2 Y coord of second point of first segment.
 * @param {number} x3 X coord of first point of second segment.
 * @param {number} y3 Y coord of first point of second segment.
 * @param {number} x4 X coord of second point of second segment.
 * @param {number} y4 Y coord of second point of second segment.
 * @return {boolean} Whether segments have intersection.
 */
anychart.math.checkSegmentsIntersection = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  return anychart.math.intersectVerticalOrHorizontalSegments(x1, x2, x3, x4) &&
      anychart.math.intersectVerticalOrHorizontalSegments(y1, y2, y3, y4) &&
      anychart.math.calcOrientedTriangleArea(x1, y1, x2, y2, x3, y3) * anychart.math.calcOrientedTriangleArea(x1, y1, x2, y2, x4, y4) <= 0 &&
      anychart.math.calcOrientedTriangleArea(x3, y3, x4, y4, x1, y1) * anychart.math.calcOrientedTriangleArea(x3, y3, x4, y4, x2, y2) <= 0;
};


/**
 * Checks whether rect is out of circle bounds.
 * @param {number} cx X coord of circle center.
 * @param {number} cy Y coord of circle center.
 * @param {number} radius Circle radius.
 * @param {Array.<number>=} opt_rect Array of rect coords.
 * @return {boolean}
 */
anychart.math.checkForRectIsOutOfCircleBounds = function(cx, cy, radius, opt_rect) {
  var result = false, i, len;
  if (!opt_rect) return false;

  for (i = 0, len = opt_rect.length; i < len - 1; i = i + 2) {
    result = result || anychart.math.checkForPointIsOutOfCircleBounds(opt_rect[i], opt_rect[i + 1], cx, cy, radius);
  }
  return result;
};


/**
 * Checks whether point is out of circle bounds.
 * @param {number} x1 X coord of point.
 * @param {number} y1 Y coord of point.
 * @param {number} cx X coord of circle center.
 * @param {number} cy Y coord of circle center.
 * @param {number} r Circle radius.
 * @return {boolean} if point out of circle bounds then returns true.
 */
anychart.math.checkForPointIsOutOfCircleBounds = function(x1, y1, cx, cy, r) {
  return (cx - x1) * (cx - x1) + (cy - y1) * (cy - y1) > r * r;
};


/**
 * Clips a line defined by two points with a given rect and returns an array of four coordinates (two points) or null.
 * The resulting points are returned in the same direction as the original vector lays.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {anychart.math.Rect} rect
 * @return {?Array.<number>}
 */
anychart.math.clipLineByRect = function(x1, y1, x2, y2, rect) {
  var rectRight = rect.left + rect.width;
  var rectBottom = rect.top + rect.height;
  var k = (y2 - y1) / (x2 - x1);
  var rx1, rx2, ry1, ry2, missing = false;

  if (isNaN(k)) { // two points overlap -> no line, single point
    if (x1 < rect.left || x1 > rectRight || y1 < rect.top || y1 > rectBottom) {
      // missing rect
      missing = true;
    } else {
      rx1 = rx2 = x1;
      ry1 = ry2 = y1;
    }
  } else if (!k) { // horizontal line
    if (y1 < rect.top || y1 > rectBottom) {
      // missing rect
      missing = true;
    } else {
      rx1 = rect.left;
      rx2 = rectRight;
      ry1 = ry2 = y1;
    }
  } else if (isFinite(k)) { // non-vertical and non-horizontal line
    var b = y1 - x1 * k;
    var leftY = k * rect.left + b;
    var rightY = k * rectRight + b;
    if ((leftY < rect.top && rightY < rect.top) ||
        (leftY > rectBottom && rightY > rectBottom)) {
      // the line is above or below the rect
      missing = true;
    } else {
      var topX = (rect.top - b) / k;
      var bottomX = (rectBottom - b) / k;
      if (leftY < rect.top) {
        // the line goes through the top side of the rect
        rx1 = topX;
        ry1 = rect.top;
      } else if (leftY > rectBottom) {
        // the line goes through the bottom side of the rect
        rx1 = bottomX;
        ry1 = rectBottom;
      } else {
        // the line goes through the left side of the rect
        rx1 = rect.left;
        ry1 = leftY;
      }
      if (rightY < rect.top) {
        // the line goes through the top side of the rect
        rx2 = topX;
        ry2 = rect.top;
      } else if (rightY > rectBottom) {
        // the line goes through the bottom side of the rect
        rx2 = bottomX;
        ry2 = rectBottom;
      } else {
        // the line goes through the right side of the rect
        rx2 = rectRight;
        ry2 = rightY;
      }
    }
  } else { // vertical line
    if (x1 < rect.left || x1 > rectRight) {// missing rect
      missing = true;
    } else {
      rx1 = rx2 = x1;
      ry1 = rect.top;
      ry2 = rectBottom;
    }
  }
  if (missing)
    return null;
  if (x1 > x2 || (x1 == x2 && y1 > y2)) {
    var tmp = rx1;
    rx1 = rx2;
    rx2 = tmp;
    tmp = ry1;
    ry1 = ry2;
    ry2 = tmp;
  }
  return [rx1, ry1, rx2, ry2];
};


/**
 * Clips a ray defined by a start point and an other point on the ray with a given rect and returns
 * an array of four coordinates (two points) or null.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {anychart.math.Rect} rect
 * @return {?Array.<number>}
 */
anychart.math.clipRayByRect = function(x1, y1, x2, y2, rect) {
  var res = anychart.math.clipLineByRect(x1, y1, x2, y2, rect);
  if (res) { // the line intersects the rect
    // we calculate three 1-dimensional vectors:
    //  v0 - original ray vector
    //  v1 - a vector from the ray start to the first returned point
    //  v1 - a vector from the ray start to the second returned point
    var v0, v1, v2;
    v0 = x2 - x1;
    if (v0) { // non-vertical line
      v1 = res[0] - x1;
      v2 = res[2] - x1;
    } else { // vertical line or point, using Y coords instead of X
      v0 = y2 - y1;
      if (v0) { // the ray exists
        v1 = res[1] - y1;
        v2 = res[3] - y1;
      } else { // the ray is a point, just returning the result
        return res;
      }
    }
    if (v2 * v0 < 0) { // the whole ray is out of clipping rect
      res = null;
    } else if (v0 * v1 < 0) { // the first returned point lays on the opposite side of the start point, clipping
      res[0] = x1;
      res[1] = y1;
    }
  }
  return res;
};


/**
 * Clips a segment defined by a two points with a given rect and returns an array of four coordinates (two points) or null.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {anychart.math.Rect} rect
 * @return {?Array.<number>}
 */
anychart.math.clipSegmentByRect = function(x1, y1, x2, y2, rect) {
  var res = anychart.math.clipLineByRect(x1, y1, x2, y2, rect);
  if (res) { // the line intersects the rect
    // we calculate three 1-dimensional vectors:
    //  v0 - original segment vector
    //  v11 - point1 -> res1 vector
    //  v12 - point1 -> res2 vector
    //  v21 - point2 -> res1 vector
    //  v22 - point2 -> res2 vector
    var v0, v11, v12, v21, v22;
    v0 = x2 - x1;
    if (v0) { // non-vertical line
      v11 = res[0] - x1;
      v12 = res[2] - x1;
      v21 = res[0] - x2;
      v22 = res[2] - x2;
    } else { // vertical line or point, using Y coords instead of X
      v0 = y2 - y1;
      if (v0) { // the ray exists
        v11 = res[1] - y1;
        v12 = res[3] - y1;
        v21 = res[1] - y2;
        v22 = res[3] - y2;
      } else { // the segment is a point, just returning the result
        return res;
      }
    }
    if (v12 * v0 < 0 || v21 * v0 > 0) {
      res = null;
    } else {
      if (v11 * v0 < 0) {
        res[0] = x1;
        res[1] = y1;
      }
      if (v22 * v0 > 0) {
        res[2] = x2;
        res[3] = y2;
      }
    }
  }
  return res;
};


/**
 * Calculates a set of params to draw a line in polar coords. Returns an array where each 7 elements
 * represent one cubic curve to be drawn. The first element is a 0 or 1 - whether a new path needed,
 * the other six elements are three XY coordinate pairs of two control point and an end point.
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} fromXRatio
 * @param {number} fromYRatio
 * @param {number} toX
 * @param {number} toY
 * @param {number} toXRatio
 * @param {number} toYRatio
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} innerRadius
 * @param {number} zeroAngle
 * @param {boolean} counterClockwise
 * @return {Array.<number>}
 */
anychart.math.getPolarLineParams = function(fromX, fromY, fromXRatio, fromYRatio, toX, toY, toXRatio, toYRatio, cx, cy, radius, innerRadius, zeroAngle, counterClockwise) {
  var quarterStep;
  if (counterClockwise) {
    if (fromXRatio < toXRatio) {
      fromXRatio += 1;
    }
    quarterStep = -.25;
  } else {
    if (toXRatio < fromXRatio) {
      toXRatio += 1;
    }
    quarterStep = .25;
  }
  // searching full quarters to split the curve
  var startQuarter = Math.ceil(fromXRatio / quarterStep) * quarterStep;
  var endQuarter = Math.floor(toXRatio / quarterStep) * quarterStep;
  if (fromXRatio == startQuarter)
    startQuarter += quarterStep;
  if (toXRatio == endQuarter)
    endQuarter -= quarterStep;
  var yRatioDivider = (toXRatio - fromXRatio) / (toYRatio - fromYRatio);
  var result = [];
  for (var ratio = startQuarter; (ratio - endQuarter) * quarterStep <= 0; ratio += quarterStep) {
    var angle = anychart.math.round(zeroAngle + ratio * Math.PI * 2, 4);
    var rRatio = (ratio - fromXRatio) / yRatioDivider + fromYRatio;
    var r = innerRadius + (radius - innerRadius) * rRatio;
    var x = anychart.math.angleDx(angle, r, cx);
    var y = anychart.math.angleDy(angle, r, cy);
    result.push(fromXRatio % 1 == 0 ? 1 : 0);
    anychart.math.getPolarLineParams_(fromX, fromY, fromXRatio, fromYRatio, x, y, ratio, rRatio, cx, cy, radius, innerRadius, zeroAngle, result);
    fromX = x;
    fromY = y;
    fromXRatio = ratio;
    fromYRatio = rRatio;
  }
  result.push(fromXRatio % 1 == 0 ? 1 : 0);
  anychart.math.getPolarLineParams_(fromX, fromY, fromXRatio, fromYRatio, toX, toY, toXRatio, toYRatio, cx, cy, radius, innerRadius, zeroAngle, result);
  return result;
};


/**
 * Calculates a set of params to draw a line in polar coords. Returns an array where each 6 elements
 * represent one cubic curve by three XY coordinate pairs of two control point and an end point.
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} fromXRatio
 * @param {number} fromYRatio
 * @param {number} toX
 * @param {number} toY
 * @param {number} toXRatio
 * @param {number} toYRatio
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} innerRadius
 * @param {number} zeroAngle
 * @param {boolean} counterClockwise
 * @return {Array.<number>}
 */
anychart.math.getPolarLineParamsSimple = function(fromX, fromY, fromXRatio, fromYRatio, toX, toY, toXRatio, toYRatio, cx, cy, radius, innerRadius, zeroAngle, counterClockwise) {
  var quarterStep;
  if (counterClockwise) {
    if (fromXRatio < toXRatio) {
      fromXRatio += 1;
    }
    quarterStep = -.25;
  } else {
    if (toXRatio < fromXRatio) {
      toXRatio += 1;
    }
    quarterStep = .25;
  }
  var yRatioDivider = (toXRatio - fromXRatio) / (toYRatio - fromYRatio);
  var result = [];
  for (var ratio = fromXRatio + quarterStep; (ratio - toXRatio) * quarterStep < 0; ratio += quarterStep) {
    var angle = anychart.math.round(zeroAngle + ratio * Math.PI * 2, 4);
    var rRatio = (ratio - fromXRatio) / yRatioDivider + fromYRatio;
    var r = innerRadius + (radius - innerRadius) * rRatio;
    var x = anychart.math.angleDx(angle, r, cx);
    var y = anychart.math.angleDy(angle, r, cy);
    anychart.math.getPolarLineParams_(fromX, fromY, fromXRatio, fromYRatio, x, y, ratio, rRatio, cx, cy, radius, innerRadius, zeroAngle, result);
    fromX = x;
    fromY = y;
    fromXRatio = ratio;
    fromYRatio = rRatio;
  }
  anychart.math.getPolarLineParams_(fromX, fromY, fromXRatio, fromYRatio, toX, toY, toXRatio, toYRatio, cx, cy, radius, innerRadius, zeroAngle, result);
  return result;
};


/**
 * @param {number} aX
 * @param {number} aY
 * @param {number} aXRatio
 * @param {number} aYRatio
 * @param {number} dX
 * @param {number} dY
 * @param {number} dXRatio
 * @param {number} dYRatio
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} innerRadius
 * @param {number} zeroAngle
 * @param {Array.<number>} result
 * @private
 */
anychart.math.getPolarLineParams_ = function(aX, aY, aXRatio, aYRatio, dX, dY, dXRatio, dYRatio, cx, cy, radius, innerRadius, zeroAngle, result) {
  var aAngle = anychart.math.round(zeroAngle + aXRatio * Math.PI * 2, 4);
  var dAngle = anychart.math.round(zeroAngle + dXRatio * Math.PI * 2, 4);
  var stepAngle = (dAngle - aAngle) / 3;
  var bAngle = anychart.math.round(aAngle + stepAngle, 4);
  var cAngle = anychart.math.round(dAngle - stepAngle, 4);
  var stepYRatio = (dYRatio - aYRatio) / 3;
  var bRadius = innerRadius + (aYRatio + stepYRatio) * (radius - innerRadius);
  var cRadius = innerRadius + (dYRatio - stepYRatio) * (radius - innerRadius);
  var bX = anychart.math.angleDx(bAngle, bRadius, cx);
  var bY = anychart.math.angleDy(bAngle, bRadius, cy);
  var cX = anychart.math.angleDx(cAngle, cRadius, cx);
  var cY = anychart.math.angleDy(cAngle, cRadius, cy);
  var p2X = (-5 * aX + 18 * bX - 9 * cX + 2 * dX) / 6;
  var p2Y = (-5 * aY + 18 * bY - 9 * cY + 2 * dY) / 6;
  var p3X = (2 * aX - 9 * bX + 18 * cX - 5 * dX) / 6;
  var p3Y = (2 * aY - 9 * bY + 18 * cY - 5 * dY) / 6;
  result.push(p2X, p2Y, p3X, p3Y, dX, dY);
};


/**
 * Projects an array of passed points on a line set by a a vector (vx, vy) and a point on the line (x0, y0).
 * @param {Array.<number>} points
 * @param {number} vx
 * @param {number} vy
 * @param {number} x0
 * @param {number} y0
 */
anychart.math.projectToLine = function(points, vx, vy, x0, y0) {
  var i, x, offset;
  if (vx && vy) {
    // real case
    var x1 = x0 + vx;
    var y1 = y0 + vy;
    var nk = vx / vy;
    var k = vy / vx;
    var b = (y1 * x0 - y0 * x1) / vx;
    for (i = 0; i < points.length; i += 2) {
      var px = points[i];
      var py = points[i + 1];
      points[i] = x = (py + px * nk + b) / (nk + k);
      points[i + 1] = x * k - b;
    }
  } else {
    if (!vx) {
      if (!vy) { // dead case
        return;
      }
      // vertical vector - shortcutting
      x = x0;
      offset = 0;
    } else {
      // horizontal vector - shortcutting
      x = y0;
      offset = 1;
    }
    for (i = 0; i < points.length; i += 2) {
      points[i + offset] = x;
    }
  }
};


/**
 * Returns the length of the vector set by two coordinate pairs.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {number}
 */
anychart.math.vectorLength = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns an X coordinate of the point on a circle of radius r with center at cx.
 * @param {number} radians
 * @param {number} r
 * @param {number=} opt_cx
 * @return {number}
 */
anychart.math.angleDx = function(radians, r, opt_cx) {
  return (opt_cx || 0) + r * anychart.math.round(Math.cos(radians), 8);
};


/**
 * Returns an Y coordinate of the point on a circle of radius r with center at cy.
 * @param {number} radians
 * @param {number} r
 * @param {number=} opt_cy
 * @return {number}
 */
anychart.math.angleDy = function(radians, r, opt_cy) {
  return (opt_cy || 0) + r * anychart.math.round(Math.sin(radians), 8);
};



/**
 * Define rectangle.
 * @param {number} x X-coordinate of top-left point.
 * @param {number} y Y-coordinate of top-left point.
 * @param {number} w Width.
 * @param {number} h Height.
 * @constructor
 * @includeDoc
 */
anychart.math.Rect = goog.math.Rect;


/**
 * Compares rectangles for equality.
 * @param {anychart.math.Rect} a A Rectangle.
 * @param {anychart.math.Rect} b A Rectangle.
 * @return {boolean} True iff the rectangles have the same left, top, width,
 *     and height, or if both are null.
 */
anychart.math.Rect.equals = goog.math.Rect.equals;


//region --- Declarations for IDEA ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Declarations for IDEA
//
//----------------------------------------------------------------------------------------------------------------------
// Prevents IDEA from throwing warnings about undefined fields.
/**
 * @type {number}
 */
anychart.math.Rect.prototype.left;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.top;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.width;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.height;


/**
 * @return {!anychart.math.Rect} A copy of a rectangle.
 */
anychart.math.Rect.prototype.clone;


/**
 * @return {!Array.<number>}
 */
anychart.math.Rect.prototype.toCoordinateBox = function() {
  return [this.left, this.top,
    this.left + this.width, this.top,
    this.left + this.width, this.top + this.height,
    this.left, this.top + this.height];
};


/**
 * @param {Array.<number>} value .
 * @return {!anychart.math.Rect} .
 */
anychart.math.Rect.fromCoordinateBox = function(value) {
  /** @type {anychart.math.Rect} */
  var rect = new anychart.math.Rect(0, 0, 0, 0);
  var bounds = new anychart.math.Rect(value[0], value[1], 0, 0);
  for (var i = 2, len = value.length; i < len; i += 2) {
    rect.left = value[i];
    rect.top = value[i + 1];
    bounds.boundingRect(rect);
  }
  return bounds;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Rect.prototype.toArray = function() {
  return [this.left, this.top, this.width, this.height];
};


/**
 * @param {Array.<number>} arr Array representing the rectangle.
 * @return {!anychart.math.Rect} .
 */
anychart.math.Rect.fromArray = function(arr) {
  return new anychart.math.Rect(arr[0], arr[1], arr[2], arr[3]);
};


/**
 * Serializes the rect.
 * @return {!Object}
 */
anychart.math.Rect.prototype.serialize = function() {
  return {
    'left': this.left,
    'top': this.top,
    'width': this.width,
    'height': this.height
  };
};


/**
 * Creates the rect and setups it from the config.
 * @param {Object} config
 * @return {!anychart.math.Rect} Deserialized rect.
 */
anychart.math.Rect.fromJSON = function(config) {
  return new anychart.math.Rect(
      +config['left'] || 0,
      +config['top'] || 0,
      +config['width'] || 0,
      +config['height'] || 0);
};


//endregion
/**
 * Constructor function.
 * @param {number} x X-coordinate.
 * @param {number} y Y-coordinate.
 * @param {number} w Width.
 * @param {number} h Height.
 * @return {!anychart.math.Rect}
 */
anychart.math.rect = function(x, y, w, h) {
  return new anychart.math.Rect(x, y, w, h);
};


//exports
goog.exportSymbol('anychart.math.rect', anychart.math.rect);
