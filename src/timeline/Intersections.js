goog.provide('anychart.timelineModule.Intersections');



/**
 *
 * @constructor
 */
anychart.timelineModule.Intersections = function() {
  /**
   * @type {Array.<anychart.timelineModule.Intersections.Range>}
   * @private
   */
  this.ranges_ = [];
};


/**
 *
 * @param {anychart.timelineModule.Intersections.Range} a
 * @param {anychart.timelineModule.Intersections.Range} b
 * @return {number}
 * @private
 */
anychart.timelineModule.Intersections.prototype.insertCompareByX_ = function(a, b) {
  var diff = a.sX - b.sX;
  if (diff == 0) {
    diff = a.eX - b.eX;
    if (diff == 0) {
      return -1;
    }
    return diff;
  }
  return a.sX - b.sX;
};


/**
 *
 * @param {anychart.timelineModule.Intersections.Range} a
 * @param {anychart.timelineModule.Intersections.Range} b
 * @return {number}
 * @private
 */
anychart.timelineModule.Intersections.prototype.insertCompareByY_ = function(a, b) {
  var diff = a.sY - b.sY;
  if (diff == 0) {// this fixes ranges that start from 0
    return a.eY - b.eY;
  }
  return a.sY - b.sY;
};


/**
 *
 * @param {anychart.timelineModule.Intersections.Range} a
 * @param {anychart.timelineModule.Intersections.Range} b
 * @return {boolean}
 */
anychart.timelineModule.Intersections.prototype.intersectByY = function(a, b) {
  return (a.sY <= b.eY && a.sY >= b.sY) || (a.eY <= b.eY && a.eY >= b.sY) ||
      (b.sY <= a.eY && b.sY >= a.sY) || (b.eY <= a.eY && b.eY >= a.sY);
};


/**
 *
 * @param {anychart.timelineModule.Intersections.Range} range
 * @param {boolean=} opt_startsFromZero - if we should keep sY 0, needed for ranges
 */
anychart.timelineModule.Intersections.prototype.add = function(range, opt_startsFromZero) {
  var height = range.eY - range.sY;
  range.sY = 0;
  range.eY = height;

  var failed = false;
  if (!goog.array.binaryInsert(this.ranges_, range, this.insertCompareByX_)) {
    failed = true;
  }

  var xIntersections = [];
  var sortedY = [];
  var halfBeforeRange = true;
  var i;
  for (i = 0; i < this.ranges_.length; i++) {
    var r = this.ranges_[i];
    if (r != range) {
      if ((r.eX > range.sX && halfBeforeRange) || (r.sX < range.eX && !halfBeforeRange)) {
        xIntersections.push(r);
        goog.array.binaryInsert(sortedY, r, this.insertCompareByY_);
      }
    } else {
      halfBeforeRange = false;
    }
  }


  for (i = 0; i < sortedY.length; i++) {
    var r = sortedY[i];
    if (this.intersectByY(range, r)) {
      if (!opt_startsFromZero) {
        range.sY = r.eY;
        range.eY = range.sY + height;
      } else {
        range.eY = r.eY + height;
      }
    }
  }
};


/**
 * @typedef {{
 * sX: number,
 * eX: number,
 * sY: number,
 * eY: number
 * }}
 */
anychart.timelineModule.Intersections.Range;
