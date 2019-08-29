goog.provide('anychart.math');
goog.provide('anychart.math.Point2D');
goog.provide('anychart.math.Polynomial');
goog.provide('anychart.math.Rect');

goog.require('acgraph.math');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Line');
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
 * @includeDoc
 * @typedef {{
     x: number,
     y: number
  }}
 */
anychart.math.NumericCoordinateObject;


/**
 * @typedef {{
     left: number,
     top: number,
     width: number,
     height: number
  }}
 */
anychart.math.BoundsObject;


/**
 * @typedef {{
     width: number,
     height: number
  }}
 */
anychart.math.SizeObject;


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
  // AntonKagakin DVF-3975
  // looks like this method was buggy
  // it work incorrectly with 0.000..001 numbers cause digitsCount
  // resolved to negative and precision was always from 6 to 0,
  // depending on non-float digits count
  var digitsCount = Math.floor(Math.log(Math.abs(num)) * Math.LOG10E);
  var calculatedPrecision;
  if (digitsCount < 0) {
    calculatedPrecision = Math.min(anychart.math.getPrecision(num), 14);
  } else
    calculatedPrecision = 13 - Math.max(digitsCount, 7);
  return anychart.math.round(num, opt_precision ? opt_precision : calculatedPrecision);
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
    return anychart.math.specialRound(res / Math.log(opt_base), 14);
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
 * Check is rect1 contains rect2.
 * @param {goog.math.Rect|Array.<number>} rect1 .
 * @param {goog.math.Rect|Array.<number>} rect2 .
 * @return {boolean}
 */
anychart.math.rectContains = function(rect1, rect2) {
  if (!rect1 || !rect2)
    return false;

  var isRect1 = anychart.utils.instanceOf(rect1, goog.math.Rect);
  var isRect2 = anychart.utils.instanceOf(rect2, goog.math.Rect);

  var left1, left2, right1, right2, top1, top2, bottom1, bottom2;
  if (isRect1 && isRect2) {
    return rect1.contains(/** @type {goog.math.Rect} */(rect2));
  } else if (isRect1) {
    rect2 = /** @type {Array.<number>} */(rect2);
    left1 = rect1.left;
    left2 = rect2[0];
    right1 = rect1.getRight();
    right2 = rect2[2];
    top1 = rect1.top;
    top2 = rect2[1];
    bottom1 = rect1.getBottom();
    bottom2 = rect2[5];
  } else if (isRect2) {
    rect1 = /** @type {Array.<number>} */(rect1);
    left1 = rect1[0];
    left2 = rect2.left;
    right1 = rect1[2];
    right2 = rect2.getRight();
    top1 = rect1[1];
    top2 = rect2.top;
    bottom1 = rect1[5];
    bottom2 = rect2.getBottom();
  } else {
    rect2 = /** @type {Array.<number>} */(rect2);
    rect1 = /** @type {Array.<number>} */(rect1);
    left1 = rect1[0];
    left2 = rect2[0];
    right1 = rect1[2];
    right2 = rect2[2];
    top1 = rect1[1];
    top2 = rect2[1];
    bottom1 = rect1[5];
    bottom2 = rect2[5];
  }

  return left1 <= left2 &&
      right1 >= right2 &&
      top1 <= top2 &&
      bottom1 >= bottom2;
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
 * Checks if point is inside the polygon by raytracing.
 * It works by tracing ray from outside of the polygon bounds to the given point
 * and then counting intersections of this ray with segments of polygon.
 * If number of intersections is odd - point is inside the polygon.
 * If number is even - point is outside of bounds.
 *                   point outside
 *           _____     \/  ____
 *   ray >--!-----!----o--!--o | <- point inside
 *          |     |_______|    |
 *          |__________________| <- U-shaped polygon
 * ! - intersections
 * o - points
 * @param {number} x1 of point
 * @param {number} y1 of point
 * @param {Array.<number>} polygon points where odd are x's, even are y's
 * @param {anychart.math.Rect=} opt_polygonBounds it's advised to path polygon bounds for better performance
 * @return {boolean}
 */
anychart.math.isPointInsidePolygon = function(x1, y1, polygon, opt_polygonBounds) {
  var minX = +Infinity;
  if (goog.isDef(opt_polygonBounds)) {
    //if point is outside of the polygon bounding box - it's definitely outside of the polygon
    if (x1 < opt_polygonBounds.getLeft() || x1 > opt_polygonBounds.getRight() || y1 < opt_polygonBounds.getTop() || y1 > opt_polygonBounds.getBottom()) {
      return false;
    }
  } else {
    for (var i = 0; i < polygon.length; i += 2) {
      minX = Math.min(minX, polygon[i]);
    }
  }

  var secondPoint = goog.isDef(opt_polygonBounds) ? {x: opt_polygonBounds.left - 100, y: 0} : {x: minX, y: 0};

  var curX;
  var prevX = polygon.length - 2;
  var isInside = false;
  for (curX = 0; curX < polygon.length; curX += 2) {
    /*
    We trace a ray from outside of the polygon bounding box (from secondPoint).
    If this ray hits polygon edges odd number of times - point is inside the polygon.
    If it hits even number of times - point is outside the bounding box.
     */
    if (anychart.math.checkSegmentsIntersection(
        polygon[curX], polygon[curX + 1],
        polygon[prevX], polygon[prevX + 1],
        x1, y1,
        secondPoint.x, secondPoint.y)) {
      isInside = !isInside;
    }

    prevX = curX;
  }

  return isInside;
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
 * Returns shortest distance from given segment to point.
 * @param {number} x1 first point of segment X coordinate
 * @param {number} y1 first point of segment Y coordinate
 * @param {number} x2 second point of segment X coordinate
 * @param {number} y2 second point of segment Y coordinate
 * @param {number} px point X coordinate
 * @param {number} py point Y coordinate
 * @return {number}
 */
anychart.math.getClosestDistanceFromSegmentToPoint = function(x1, y1, x2, y2, px, py) {
  var line = new goog.math.Line(x1, y1, x2, y2);
  var closestPoint = line.getClosestSegmentPoint(px, py);
  return goog.math.Coordinate.distance(closestPoint, new goog.math.Coordinate(px, py));
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
 * @param {number} p0x
 * @param {number} p0y
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
anychart.math.getQuadraticCurveDistanceByPoint = function(p0x, p0y, p1x, p1y, p2x, p2y, x, y) {
  var t = NaN, t1x, t2x, t1y, t2y;
  if (p0x - 2 * p1x + p2x != 0) {
    t1x = (p0x - p1x + Math.sqrt((p0x - 2 * p1x + p2x) * x + p1x * p1x - p0x * p2x)) / (p0x - 2 * p1x + p2x);
    t2x = (p0x - p1x - Math.sqrt((p0x - 2 * p1x + p2x) * x + p1x * p1x - p0x * p2x)) / (p0x - 2 * p1x + p2x);

    t1y = (p0y - p1y + Math.sqrt((p0y - 2 * p1y + p2y) * y + p1y * p1y - p0y * p2y)) / (p0y - 2 * p1y + p2y);
    t2y = (p0y - p1y - Math.sqrt((p0y - 2 * p1y + p2y) * y + p1y * p1y - p0y * p2y)) / (p0y - 2 * p1y + p2y);
    t = (t1x > 0 && t1x < 1) ? t1x :
        (t2x > 0 && t2x < 1) ? t2x :
            (t1y > 0 && t1y < 1) ? t1y :
                (t2y > 0 && t2y < 1) ? t2y : NaN ;
  } else if (p0x != p1x) {
    t = (x - p0x) / (2 * (p1x - p0x));
  } else if (p0x == p1x && p1x != p2x) {
    t = Math.sqrt((x - p0x) / (p2x - p1x));
  }

  return t;
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
 * Computes the difference region between this rectangle and {@code rect}. The
 * return value is a rectangle or null defining the remaining region from passed side
 * of this rectangle after the other has been subtracted.
 * @param {goog.math.Rect} rect A Rectangle.
 * @param {anychart.enums.Orientation} side .
 * @return {goog.math.Rect} An rectangle which
 *     define the difference area of this rectangle minus passed rectangle relative side.
 */
anychart.math.Rect.prototype.differenceBySide = function(rect, side) {
  var result = null;

  var top = this.top;
  var height = this.height;

  var ar = this.left + this.width;
  var ab = this.top + this.height;

  var br = rect.left + rect.width;
  var bb = rect.top + rect.height;

  // Subtract off any area on top where this extends past rect
  switch (side) {
    case anychart.enums.Orientation.TOP:
      if (rect.top > this.top) {
        result = new goog.math.Rect(this.left, this.top, this.width, rect.top - this.top);
      }
      break;
    case anychart.enums.Orientation.BOTTOM:
      // Subtract off any area on bottom where this extends past rect
      if (bb < ab) {
        result = new goog.math.Rect(this.left, bb, this.width, ab - bb);
      }
      break;
    case anychart.enums.Orientation.LEFT:
      // Subtract any area on left where this extends past rect
      if (rect.left > this.left) {
        result = new goog.math.Rect(this.left, top, rect.left - this.left, height);
      }
      break;
    case anychart.enums.Orientation.RIGHT:
      // Subtract any area on right where this extends past rect
      if (br < ar) {
        result = new goog.math.Rect(br, top, ar - br, height);
      }
      break;
  }

  return result;
};


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
//region --- Point 2D
/**
 * Class point 2d.
 * @param {number} x
 * @param {number} y
 * @constructor
 */
anychart.math.Point2D = function(x, y) {
  if (arguments.length > 0) {
    this.init(x, y);
  }
};


/**
 * @param {number} x
 * @param {number} y
 */
anychart.math.Point2D.prototype.init = function(x, y) {
  this.x = x;
  this.y = y;
};


/**
 * @param {anychart.math.Point2D} that
 * @return {anychart.math.Point2D}
 */
anychart.math.Point2D.prototype.add = function(that) {
  return new anychart.math.Point2D(this.x + that.x, this.y + that.y);
};


/**
 * @param {number} scalar
 * @return {anychart.math.Point2D}
 */
anychart.math.Point2D.prototype.multiply = function(scalar) {
  return new anychart.math.Point2D(this.x * scalar, this.y * scalar);
};


/**
 * @param {anychart.math.Point2D} that
 * @return {boolean}
 */
anychart.math.Point2D.prototype.lte = function(that) {
  return (this.x <= that.x && this.y <= that.y);
};


/**
 * @param {anychart.math.Point2D} that
 * @return {boolean}
 */
anychart.math.Point2D.prototype.gte = function(that) {
  return (this.x >= that.x && this.y >= that.y);
};


/**
 * @param {anychart.math.Point2D} that
 * @param {number} t
 * @return {anychart.math.Point2D}
 */
anychart.math.Point2D.prototype.lerp = function(that, t) {
  return new anychart.math.Point2D(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
};


/**
 * @param {anychart.math.Point2D} that
 * @return {anychart.math.Point2D}
 */
anychart.math.Point2D.prototype.min = function(that) {
  return new anychart.math.Point2D(Math.min(this.x, that.x), Math.min(this.y, that.y));
};


/**
 * @param {anychart.math.Point2D} that
 * @return {anychart.math.Point2D}
 */
anychart.math.Point2D.prototype.max = function(that) {
  return new anychart.math.Point2D(Math.max(this.x, that.x), Math.max(this.y, that.y));
};


//endregion
//region --- Polynomial
/**
 * @param {...number} var_args
 * @constructor
 */
anychart.math.Polynomial = function(var_args) {
  this.init(arguments);
};


/**
 * @type {number}
 */
anychart.math.Polynomial.TOLERANCE = 1e-6;


/**
 * @type {number}
 */
anychart.math.Polynomial.ACCURACY = 6;


/**
 * @param {Array.<number>|Arguments} coefs
 */
anychart.math.Polynomial.prototype.init = function(coefs) {
  this.coefs = [];
  for (var i = coefs.length - 1; i >= 0; i--)
    this.coefs.push(coefs[i]);
};


/**
 * @param {number} x
 * @return {number}
 */
anychart.math.Polynomial.prototype.eval = function(x) {
  var result = 0;
  for (var i = this.coefs.length - 1; i >= 0; i--) result = result * x + this.coefs[i];
  return result;
};


/**
 * Simplify.
 */
anychart.math.Polynomial.prototype.simplify = function() {
  for (var i = this.getDegree(); i >= 0; i--) {
    if (Math.abs(this.coefs[i]) <= anychart.math.Polynomial.TOLERANCE) this.coefs.pop(); else break;
  }
};


/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
anychart.math.Polynomial.prototype.bisection = function(min, max) {
  var minValue = this.eval(min);
  var maxValue = this.eval(max);
  var result;
  if (Math.abs(minValue) <= anychart.math.Polynomial.TOLERANCE) result = min; else if (Math.abs(maxValue) <= anychart.math.Polynomial.TOLERANCE) result = max; else if (minValue * maxValue <= 0) {
    var tmp1 = Math.log(max - min);
    var tmp2 = Math.log(10) * anychart.math.Polynomial.ACCURACY;
    var iters = Math.ceil((tmp1 + tmp2) / Math.log(2));
    for (var i = 0; i < iters; i++) {
      result = 0.5 * (min + max);
      var value = this.eval(result);
      if (Math.abs(value) <= anychart.math.Polynomial.TOLERANCE) {
        break;
      }
      if (value * minValue < 0) {
        max = result;
        maxValue = value;
      } else {
        min = result;
        minValue = value;
      }
    }
  }
  return /** @type {number} */(result);
};


/**
 * @return {number}
 */
anychart.math.Polynomial.prototype.getDegree = function() {
  return this.coefs.length - 1;
};


/**
 * @return {anychart.math.Polynomial}
 */
anychart.math.Polynomial.prototype.getDerivative = function() {
  var derivative = new anychart.math.Polynomial();
  for (var i = 1; i < this.coefs.length; i++) {
    derivative.coefs.push(i * this.coefs[i]);
  }
  return derivative;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getRoots = function() {
  var result;
  this.simplify();
  switch (this.getDegree()) {
    case 0:
      result = [];
      break;
    case 1:
      result = this.getLinearRoot();
      break;
    case 2:
      result = this.getQuadraticRoots();
      break;
    case 3:
      result = this.getCubicRoots();
      break;
    case 4:
      result = this.getQuarticRoots();
      break;
    default:
      result = [];
  }
  return result;
};


/**
 * @param {number} min
 * @param {number} max
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getRootsInInterval = function(min, max) {
  var roots = [];
  var root;
  if (this.getDegree() == 1) {
    root = this.bisection(min, max);
    if (root != null) roots.push(root);
  } else {
    var deriv = this.getDerivative();
    var droots = deriv.getRootsInInterval(min, max);
    if (droots.length > 0) {
      root = this.bisection(min, droots[0]);
      if (root != null) roots.push(root);
      for (var i = 0; i <= droots.length - 2; i++) {
        root = this.bisection(droots[i], droots[i + 1]);
        if (root != null) roots.push(root);
      }
      root = this.bisection(droots[droots.length - 1], max);
      if (root != null) roots.push(root);
    } else {
      root = this.bisection(min, max);
      if (root != null) roots.push(root);
    }
  }
  return roots;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getLinearRoot = function() {
  var result = [];
  var a = this.coefs[1];
  if (a != 0) result.push(-this.coefs[0] / a);
  return result;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getQuadraticRoots = function() {
  var results = [];
  if (this.getDegree() == 2) {
    var a = this.coefs[2];
    var b = this.coefs[1] / a;
    var c = this.coefs[0] / a;
    var d = b * b - 4 * c;
    if (d > 0) {
      var e = Math.sqrt(d);
      results.push(0.5 * (-b + e));
      results.push(0.5 * (-b - e));
    } else if (d == 0) {
      results.push(0.5 * -b);
    }
  }
  return results;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getCubicRoots = function() {
  var results = [];
  var disrim;
  if (this.getDegree() == 3) {
    var c3 = this.coefs[3];
    var c2 = this.coefs[2] / c3;
    var c1 = this.coefs[1] / c3;
    var c0 = this.coefs[0] / c3;
    var a = (3 * c1 - c2 * c2) / 3;
    var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
    var offset = c2 / 3;
    var discrim = b * b / 4 + a * a * a / 27;
    var halfB = b / 2;
    if (Math.abs(discrim) <= anychart.math.Polynomial.TOLERANCE) disrim = 0;
    if (discrim > 0) {
      var e = Math.sqrt(discrim);
      var tmp;
      var root;
      tmp = -halfB + e;
      if (tmp >= 0) root = Math.pow(tmp, 1 / 3); else root = -Math.pow(-tmp, 1 / 3);
      tmp = -halfB - e;
      if (tmp >= 0) root += Math.pow(tmp, 1 / 3); else root -= Math.pow(-tmp, 1 / 3);
      results.push(root - offset);
    } else if (discrim < 0) {
      var distance = Math.sqrt(-a / 3);
      var angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var sqrt3 = Math.sqrt(3);
      results.push(2 * distance * cos - offset);
      results.push(-distance * (cos + sqrt3 * sin) - offset);
      results.push(-distance * (cos - sqrt3 * sin) - offset);
    } else {
      var tmp;
      if (halfB >= 0) tmp = -Math.pow(halfB, 1 / 3); else tmp = Math.pow(-halfB, 1 / 3);
      results.push(2 * tmp - offset);
      results.push(-tmp - offset);
    }
  }
  return results;
};


/**
 * @return {Array.<number>}
 */
anychart.math.Polynomial.prototype.getQuarticRoots = function() {
  var results = [];
  if (this.getDegree() == 4) {
    var c4 = this.coefs[4];
    var c3 = this.coefs[3] / c4;
    var c2 = this.coefs[2] / c4;
    var c1 = this.coefs[1] / c4;
    var c0 = this.coefs[0] / c4;
    var resolveRoots = new anychart.math.Polynomial(1, -c2, c3 * c1 - 4 * c0, -c3 * c3 * c0 + 4 * c2 * c0 - c1 * c1).getCubicRoots();
    var y = resolveRoots[0];
    var discrim = c3 * c3 / 4 - c2 + y;
    if (Math.abs(discrim) <= anychart.math.Polynomial.TOLERANCE) discrim = 0;
    if (discrim > 0) {
      var e = Math.sqrt(discrim);
      var t1 = 3 * c3 * c3 / 4 - e * e - 2 * c2;
      var t2 = (4 * c3 * c2 - 8 * c1 - c3 * c3 * c3) / (4 * e);
      var plus = t1 + t2;
      var minus = t1 - t2;
      if (Math.abs(plus) <= anychart.math.Polynomial.TOLERANCE) plus = 0;
      if (Math.abs(minus) <= anychart.math.Polynomial.TOLERANCE) minus = 0;
      if (plus >= 0) {
        var f = Math.sqrt(plus);
        results.push(-c3 / 4 + (e + f) / 2);
        results.push(-c3 / 4 + (e - f) / 2);
      }
      if (minus >= 0) {
        var f = Math.sqrt(minus);
        results.push(-c3 / 4 + (f - e) / 2);
        results.push(-c3 / 4 - (f + e) / 2);
      }
    } else if (discrim < 0) {
    } else {
      var t2 = y * y - 4 * c0;
      if (t2 >= -anychart.math.Polynomial.TOLERANCE) {
        if (t2 < 0) t2 = 0;
        t2 = 2 * Math.sqrt(t2);
        t1 = 3 * c3 * c3 / 4 - 2 * c2;
        if (t1 + t2 >= anychart.math.Polynomial.TOLERANCE) {
          var d = Math.sqrt(t1 + t2);
          results.push(-c3 / 4 + d / 2);
          results.push(-c3 / 4 - d / 2);
        }
        if (t1 - t2 >= anychart.math.Polynomial.TOLERANCE) {
          var d = Math.sqrt(t1 - t2);
          results.push(-c3 / 4 + d / 2);
          results.push(-c3 / 4 - d / 2);
        }
      }
    }
  }
  return results;
};


//endregion
/**
 * @param {number} p0x .
 * @param {number} p0y .
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} a0x .
 * @param {number} a0y .
 * @param {number} a1x .
 * @param {number} a1y .
 * @return {Array.<number>}
 */
anychart.math.intersectBezier2Line = function(p0x, p0y, p1x, p1y, p2x, p2y, a0x, a0y, a1x, a1y) {
  var p1 = new anychart.math.Point2D(p0x, p0y);
  var p2 = new anychart.math.Point2D(p1x, p1y);
  var p3 = new anychart.math.Point2D(p2x, p2y);
  var a1 = new anychart.math.Point2D(a0x, a0y);
  var a2 = new anychart.math.Point2D(a1x, a1y);

  var a, b;             // temporary variables
  var c2, c1, c0;       // coefficients of quadratic
  var cl;               // c coefficient for normal form of line
  var n;                // normal for normal form of line
  var nc2, nc1, nc0;
  var min = a1.min(a2); // used to determine if point is on line segment
  var max = a1.max(a2); // used to determine if point is on line segment
  var result = [];

  a = p2.multiply(-2);
  c2 = p1.add(a.add(p3));

  a = p1.multiply(-2);
  b = p2.multiply(2);
  c1 = a.add(b);

  c0 = new anychart.math.Point2D(p1.x, p1.y);

  // Convert line to normal form: ax + by + c = 0
  // Find normal to line: negative inverse of original line's slope
  n = new anychart.math.Point2D(a1.y - a2.y, a2.x - a1.x);

  nc2 = n.x * c2.x + n.y * c2.y;
  nc1 = n.x * c1.x + n.y * c1.y;
  nc0 = n.x * c0.x + n.y * c0.y;

  // Determine new c coefficient
  cl = a1.x * a2.y - a2.x * a1.y;

  // Transform cubic coefficients to line's coordinate system and find roots
  // of cubic
  var polynomial = new anychart.math.Polynomial(nc2, nc1, nc0 + cl);
  var roots = polynomial.getRoots();

  // Any roots in closed interval [0,1] are intersections on Bezier, but
  // might not be on the line segment.
  // Find intersections and calculate point coordinates
  for (var i = 0; i < roots.length; i++) {
    var t = roots[i];
    if (0 <= t && t <= 1) {
      // We're within the Bezier curve
      // Find point on Bezier
      var p4 = p1.lerp(p2, t);
      var p5 = p2.lerp(p3, t);
      var p6 = p4.lerp(p5, t);

      // See if point is on line segment
      // Had to make special cases for vertical and horizontal lines due
      // to slight errors in calculation of p6
      if (a1.x == a2.x) {
        if (min.y <= p6.y && p6.y <= max.y) {
          result.push(p6);
        }
      } else if (a1.y == a2.y) {
        if (min.x <= p6.x && p6.x <= max.x) {
          result.push(p6);
        }
      } else if (p6.gte(min) && p6.lte(max)) {
        result.push(p6);
      }
    }
  }

  return result;
};


/**
 * @param {number} a0x .
 * @param {number} a0y .
 * @param {number} a1x .
 * @param {number} a1y .
 * @param {number} a2x .
 * @param {number} a2y .
 * @param {number} b0x .
 * @param {number} b0y .
 * @param {number} b1x .
 * @param {number} b1y .
 * @param {number} b2x .
 * @param {number} b2y
 * @return {Array.<number>}
 */
anychart.math.intersectBezier2Bezier2 = function(a0x, a0y, a1x, a1y, a2x, a2y, b0x, b0y, b1x, b1y, b2x, b2y) {
  var a1 = new anychart.math.Point2D(a0x, a0y);
  var a2 = new anychart.math.Point2D(a1x, a1y);
  var a3 = new anychart.math.Point2D(a2x, a2y);
  var b1 = new anychart.math.Point2D(b0x, b0y);
  var b2 = new anychart.math.Point2D(b1x, b1y);
  var b3 = new anychart.math.Point2D(b2x, b2y);

  var a, b;
  var c12, c11, c10;
  var c22, c21, c20;
  var result = [];
  var poly;

  a = a2.multiply(-2);
  c12 = a1.add(a.add(a3));

  a = a1.multiply(-2);
  b = a2.multiply(2);
  c11 = a.add(b);

  c10 = new anychart.math.Point2D(a1.x, a1.y);

  a = b2.multiply(-2);
  c22 = b1.add(a.add(b3));

  a = b1.multiply(-2);
  b = b2.multiply(2);
  c21 = a.add(b);

  c20 = new anychart.math.Point2D(b1.x, b1.y);
  var v0, v1, v2, v3, v4, v5, v6;

  if (c12.y == 0) {
    v0 = c12.x * (c10.y - c20.y);
    v1 = v0 - c11.x * c11.y;
    v2 = v0 + v1;
    v3 = c11.y * c11.y;

    poly = new anychart.math.Polynomial(
        c12.x * c22.y * c22.y,
        2 * c12.x * c21.y * c22.y,
        c12.x * c21.y * c21.y - c22.x * v3 - c22.y * v0 - c22.y * v1,
        -c21.x * v3 - c21.y * v0 - c21.y * v1,
        (c10.x - c20.x) * v3 + (c10.y - c20.y) * v1
    );
  } else {
    v0 = c12.x * c22.y - c12.y * c22.x;
    v1 = c12.x * c21.y - c21.x * c12.y;
    v2 = c11.x * c12.y - c11.y * c12.x;
    v3 = c10.y - c20.y;
    v4 = c12.y * (c10.x - c20.x) - c12.x * v3;
    v5 = -c11.y * v2 + c12.y * v4;
    v6 = v2 * v2;

    poly = new anychart.math.Polynomial(
        v0 * v0,
        2 * v0 * v1,
        (-c22.y * v6 + c12.y * v1 * v1 + c12.y * v0 * v4 + v0 * v5) / c12.y,
        (-c21.y * v6 + c12.y * v1 * v4 + v1 * v5) / c12.y,
        (v3 * v6 + v4 * v5) / c12.y
    );
  }

  var roots = poly.getRoots();
  for (var i = 0; i < roots.length; i++) {
    var s = roots[i];

    if (0 <= s && s <= 1) {
      var xRoots = new anychart.math.Polynomial(
          c12.x,
          c11.x,
          c10.x - c20.x - s * c21.x - s * s * c22.x
      ).getRoots();
      var yRoots = new anychart.math.Polynomial(
          c12.y,
          c11.y,
          c10.y - c20.y - s * c21.y - s * s * c22.y
      ).getRoots();

      if (xRoots.length > 0 && yRoots.length > 0) {
        var TOLERANCE = 1e-4;

        checkRoots:
            for (var j = 0; j < xRoots.length; j++) {
              var xRoot = xRoots[j];

              if (0 <= xRoot && xRoot <= 1) {
                for (var k = 0; k < yRoots.length; k++) {
                  if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                    result.push(c22.multiply(s * s).add(c21.multiply(s).add(c20)));
                    break checkRoots;
                  }
                }
              }
            }
      }
    }
  }

  return result;
};


/**
 * @param {number} a1x .
 * @param {number} a1y .
 * @param {number} a2x .
 * @param {number} a2y .
 * @param {number} b1x .
 * @param {number} b1y .
 * @param {number} b2x .
 * @param {number} b2y .
 * @return {anychart.math.Point2D}
 */
anychart.math.intersectLineLine = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
  var result;

  var ua_t = (b2x - b1x) * (a1y - b1y) - (b2y - b1y) * (a1x - b1x);
  var ub_t = (a2x - a1x) * (a1y - b1y) - (a2y - a1y) * (a1x - b1x);
  var u_b = (b2y - b1y) * (a2x - a1x) - (b2x - b1x) * (a2y - a1y);

  if (u_b != 0) {
    var ua = ua_t / u_b;
    var ub = ub_t / u_b;

    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      result = new anychart.math.Point2D(a1x + ua * (a2x - a1x), a1y + ua * (a2y - a1y));
    } else {
      //no intersection
      result = null;
    }
  } else {
    if (ua_t == 0 || ub_t == 0) {
      //coincident
      result = null;
    } else {
      //parallel
      result = null;
    }
  }

  return result;
};



//exports
goog.exportSymbol('anychart.math.rect', anychart.math.rect);
