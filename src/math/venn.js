goog.provide('anychart.math.venn');

goog.require('goog.array');


//region -- Type definitions and constants
/**
 * Small numeric value.
 * @const {number}
 */
anychart.math.venn.DELTA = 1e-10;


/**
 * @typedef {{
 *   x: number,
 *   y: number,
 * }}
 */
anychart.math.venn.Point;


/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   radius: number,
 *   setid: (string|undefined)
 * }}
 */
anychart.math.venn.Circle;


/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   radius: number,
 *   rowid: string,
 *   size: number
 * }}
 */
anychart.math.venn.SizedCircle;


/**
 * @typedef {{
 *   angle: number,
 *   parentIndex: Array.<number>,
 *   x: number,
 *   y: number
 * }}
 */
anychart.math.venn.IntersectionPoint;


/**
 * @typedef {{
 *   circle: anychart.math.venn.Circle,
 *   p1: anychart.math.venn.IntersectionPoint,
 *   p2: anychart.math.venn.IntersectionPoint,
 *   width: number
 * }}
 */
anychart.math.venn.Arc;


/**
 * @typedef {{
 *  arcArea: number,
 *  arcs: Array.<anychart.math.venn.Arc>,
 *  area: number,
 *  innerPoints: Array.<anychart.math.venn.IntersectionPoint>,
 *  intersectionPoints: Array.<anychart.math.venn.IntersectionPoint>,
 *  polygonArea: number
 * }}
 */
anychart.math.venn.Stats;


//endregion
//region -- bisect
/**
 * For two starting points that must have opposite signs finds the zeros of a function.
 * @param {function(number):number} f - Function to find its zeros.
 * @param {number} a - Start point.
 * @param {number} b - End point.
 * @param {Object=} opt_parameters
 * @return {number}
 */
anychart.math.venn.bisect = function(f, a, b, opt_parameters) {
  opt_parameters = opt_parameters || {};
  var maxIterations = opt_parameters.maxIterations || 100;
  var tolerance = opt_parameters.tolerance || 1e-10;
  var fA = f(a);
  var fB = f(b);
  var delta = b - a;

  if (fA * fB > 0) {
    throw 'Initial points must have opposite signs';
  }

  if (fA === 0) return a;
  if (fB === 0) return b;

  for (var i = 0; i < maxIterations; ++i) {
    delta /= 2;
    var mid = a + delta;
    var fMid = f(mid);

    if (fMid * fA >= 0) {
      a = mid;
    }

    if ((Math.abs(delta) < tolerance) || (fMid === 0)) {
      return mid;
    }
  }
  return a + delta;
};


//endregion
//region -- blas1
/**
 * Creates array with defined length filled with zeroes.
 * @param {number} len - Length.
 * @return {Array.<number>}
 */
anychart.math.venn.zeros = function(len) {
  var r = new Array(len);
  for (var i = 0; i < len; ++i)
    r[i] = 0;
  return r;
};


/**
 * Creates zero-filled two-dimensional array.
 * @param {number} x - X-length.
 * @param {number} y - Y-length.
 * @return {Array.<Array.<number>>}
 */
anychart.math.venn.zerosM = function(x, y) {
  return goog.array.map(anychart.math.venn.zeros(x), function() {
    return anychart.math.venn.zeros(y);
  });
};


/**
 * @param {Array.<number>} a - .
 * @param {Array.<number>} b - .
 * @return {number}
 */
anychart.math.venn.dot = function(a, b) {
  var ret = 0;
  for (var i = 0; i < a.length; ++i) {
    ret += a[i] * b[i];
  }
  return ret;
};


/**
 * @param {Array.<number>} a - .
 * @return {number}
 */
anychart.math.venn.norm2 = function(a) {
  return Math.sqrt(anychart.math.venn.dot(a, a));
};


/**
 * @param {Array.<number>} ret - Return value.
 * @param {Array.<number>} value - Value.
 * @param {number} c - Coefficient.
 */
anychart.math.venn.scale = function(ret, value, c) {
  for (var i = 0; i < value.length; ++i) {
    ret[i] = value[i] * c;
  }
};


/**
 * Calculates weighted sum.
 * @param {Array.<number>} ret - .
 * @param {number} w1 - .
 * @param {Array.<number>} v1 - .
 * @param {number} w2 - .
 * @param {Array.<number>} v2 - .
 */
anychart.math.venn.weightedSum = function(ret, w1, v1, w2, v2) {
  for (var j = 0; j < ret.length; ++j) {
    ret[j] = w1 * v1[j] + w2 * v2[j];
  }
};


//endregion
//region -- linesearch
/**
 * Searches along line 'pk' for a point that satisfies the wolfe conditions.
 * @param {Function} f - Objective function.
 * @param {Array.<number>} pk - Search direction.
 * @param {Object} current - Object containing current gradient/loss.
 * @param {Object} next - Output: contains next gradient/loss.
 * @param {number} a - Return value.
 * @param {number=} opt_c1 - .
 * @param {number=} opt_c2 - .
 * @return {number} - Step size taken.
 */
anychart.math.venn.wolfeLineSearch = function(f, pk, current, next, a, opt_c1, opt_c2) {
  var phi0 = current.fx;
  var phiPrime0 = anychart.math.venn.dot(current.fxprime, pk);
  var phi = phi0;
  var phi_old = phi0;
  var phiPrime = phiPrime0;
  var a0 = 0;

  a = a || 1;
  opt_c1 = opt_c1 || 1e-6;
  opt_c2 = opt_c2 || 0.1;

  function zoom(a_lo, a_high, phi_lo) {
    for (var iteration = 0; iteration < 16; ++iteration) {
      a = (a_lo + a_high) / 2;
      anychart.math.venn.weightedSum(next.x, 1.0, current.x, a, pk);
      phi = next.fx = f(next.x, next.fxprime);
      phiPrime = anychart.math.venn.dot(next.fxprime, pk);

      if ((phi > (phi0 + opt_c1 * a * phiPrime0)) || (phi >= phi_lo)) {
        a_high = a;
      } else {
        if (Math.abs(phiPrime) <= -opt_c2 * phiPrime0)
          return a;

        if (phiPrime * (a_high - a_lo) >= 0)
          a_high = a_lo;

        a_lo = a;
        phi_lo = phi;
      }
    }

    return 0;
  }

  for (var iteration = 0; iteration < 10; ++iteration) {
    anychart.math.venn.weightedSum(next.x, 1.0, current.x, a, pk);
    phi = next.fx = f(next.x, next.fxprime);
    phiPrime = anychart.math.venn.dot(next.fxprime, pk);
    if ((phi > (phi0 + opt_c1 * a * phiPrime0)) ||
        (iteration && (phi >= phi_old))) {
      return zoom(a0, a, phi_old);
    }

    if (Math.abs(phiPrime) <= -opt_c2 * phiPrime0) {
      return a;
    }

    if (phiPrime >= 0) {
      return zoom(a, a0, phi);
    }

    phi_old = phi;
    a0 = a;
    a *= 2;
  }

  return a;
};


//endregion
//region -- conjugateGradient
/**
 * @param {Function} f - .
 * @param {Array.<number>} initial - .
 * @param {Object=} opt_params - .
 * @return {Object}
 */
anychart.math.venn.conjugateGradient = function(f, initial, opt_params) {
  var current = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
      next = {x: initial.slice(), fx: 0, fxprime: initial.slice()},
      yk = initial.slice(),
      pk, temp,
      a = 1,
      maxIterations;

  opt_params = opt_params || {};
  maxIterations = opt_params.maxIterations || initial.length * 20;

  current.fx = f(current.x, current.fxprime);
  pk = current.fxprime.slice();
  anychart.math.venn.scale(pk, current.fxprime, -1);

  for (var i = 0; i < maxIterations; ++i) {
    a = anychart.math.venn.wolfeLineSearch(f, pk, current, next, a);

    // todo: history in wrong spot?
    if (opt_params.history) {
      opt_params.history.push({
        x: current.x.slice(),
        fx: current.fx,
        fxprime: current.fxprime.slice(),
        alpha: a
      });
    }

    if (!a) {
      // Point that satifies wolfe conditions is not found. Start new iteration with another direction.
      anychart.math.venn.scale(pk, current.fxprime, -1);
    } else {
      // update direction using Polak–Ribiere CG method.
      anychart.math.venn.weightedSum(yk, 1, next.fxprime, -1, current.fxprime);

      var delta_k = anychart.math.venn.dot(current.fxprime, current.fxprime);
      var beta_k = Math.max(0, anychart.math.venn.dot(yk, next.fxprime) / delta_k);

      anychart.math.venn.weightedSum(pk, beta_k, pk, -1, next.fxprime);

      temp = current;
      current = next;
      next = temp;
    }

    if (anychart.math.venn.norm2(current.fxprime) <= 1e-5) {
      break;
    }
  }

  if (opt_params.history) {
    opt_params.history.push({
      x: current.x.slice(),
      fx: current.fx,
      fxprime: current.fxprime.slice(),
      alpha: a
    });
  }

  return current;
};


//endregion
//region -- nelderMead
/**
 * Minimizes a function using the downhill simplex method.
 * @param {function(Array.<number>):number} f - .
 * @param {Array.<number>} x0 - .
 * @param {Object} parameters - .
 * @return {Object}
 */
anychart.math.venn.nelderMead = function(f, x0, parameters) {
  parameters = parameters || {};
  var maxIterations = parameters.maxIterations || x0.length * 200,
      nonZeroDelta = parameters.nonZeroDelta || 1.05,
      zeroDelta = parameters.zeroDelta || 0.001,
      minErrorDelta = parameters.minErrorDelta || 1e-6,
      minTolerance = parameters.minErrorDelta || 1e-5,
      rho = (parameters.rho !== undefined) ? parameters.rho : 1,
      chi = (parameters.chi !== undefined) ? parameters.chi : 2,
      psi = (parameters.psi !== undefined) ? parameters.psi : -0.5,
      sigma = (parameters.sigma !== undefined) ? parameters.sigma : 0.5,
      maxDiff;

  // initialize simplex.
  var N = x0.length,
      simplex = new Array(N + 1);
  simplex[0] = x0;
  simplex[0].fx = f(x0);
  simplex[0].id = 0;
  for (var i = 0; i < N; ++i) {
    var point = x0.slice();
    point[i] = point[i] ? point[i] * nonZeroDelta : zeroDelta;
    simplex[i + 1] = point;
    simplex[i + 1].fx = f(point);
    simplex[i + 1].id = i + 1;
  }

  function updateSimplex(value) {
    for (var i = 0; i < value.length; i++) {
      simplex[N][i] = value[i];
    }
    simplex[N].fx = value.fx;
  }

  var sortOrder = function(a, b) {
    return a.fx - b.fx;
  };

  var centroid = x0.slice(),
      reflected = x0.slice(),
      contracted = x0.slice(),
      expanded = x0.slice();

  for (var iteration = 0; iteration < maxIterations; ++iteration) {
    simplex.sort(sortOrder);

    if (parameters.history) {
      var sortedSimplex = goog.array.map(simplex, function(x) {
        var state = x.slice();
        state.fx = x.fx;
        state.id = x.id;
        return state;
      });
      sortedSimplex.sort(function(a, b) {
        return a.id - b.id;
      });

      parameters.history.push({
        x: simplex[0].slice(),
        fx: simplex[0].fx,
        simplex: sortedSimplex
      });
    }

    maxDiff = 0;
    for (i = 0; i < N; ++i) {
      maxDiff = Math.max(maxDiff, Math.abs(simplex[0][i] - simplex[1][i]));
    }

    if ((Math.abs(simplex[0].fx - simplex[N].fx) < minErrorDelta) &&
        (maxDiff < minTolerance)) {
      break;
    }

    for (i = 0; i < N; ++i) {
      centroid[i] = 0;
      for (var j = 0; j < N; ++j) {
        centroid[i] += simplex[j][i];
      }
      centroid[i] /= N;
    }

    var worst = simplex[N];
    anychart.math.venn.weightedSum(reflected, 1 + rho, centroid, -rho, worst);
    reflected.fx = f(reflected);

    if (reflected.fx < simplex[0].fx) {
      anychart.math.venn.weightedSum(expanded, 1 + chi, centroid, -chi, worst);
      expanded.fx = f(expanded);
      if (expanded.fx < reflected.fx) {
        updateSimplex(expanded);
      } else {
        updateSimplex(reflected);
      }
    }

    else if (reflected.fx >= simplex[N - 1].fx) {
      var shouldReduce = false;

      if (reflected.fx > worst.fx) {
        anychart.math.venn.weightedSum(contracted, 1 + psi, centroid, -psi, worst);
        contracted.fx = f(contracted);
        if (contracted.fx < worst.fx) {
          updateSimplex(contracted);
        } else {
          shouldReduce = true;
        }
      } else {
        anychart.math.venn.weightedSum(contracted, 1 - psi * rho, centroid, psi * rho, worst);
        contracted.fx = f(contracted);
        if (contracted.fx < reflected.fx) {
          updateSimplex(contracted);
        } else {
          shouldReduce = true;
        }
      }

      if (shouldReduce) {
        if (sigma >= 1) break;

        for (i = 1; i < simplex.length; ++i) {
          anychart.math.venn.weightedSum(simplex[i], 1 - sigma, simplex[0], sigma, simplex[i]);
          simplex[i].fx = f(simplex[i]);
        }
      }
    } else {
      updateSimplex(reflected);
    }
  }

  simplex.sort(sortOrder);
  return {
    fx: simplex[0].fx,
    x: simplex[0]
  };
};


//endregion
//region -- circleintersection
/**
 * Calculates intersection area.
 * Returns the intersection area of a bunch of circles (where each circle is an object having an x,y and radius property).
 * @param {Array.<anychart.math.venn.Circle>} circles - Circles data.
 * @param {anychart.math.venn.Stats=} opt_stats - Stats storage. Collects intersection arcs data.
 * @return {number}
 */
anychart.math.venn.intersectionArea = function(circles, opt_stats) {
  var intersectionPoints = anychart.math.venn.getIntersectionPoints(circles);

  var innerPoints = goog.array.filter(intersectionPoints, function(p) {
    return anychart.math.venn.containedInCircles(p, circles);
  });

  var arcArea = 0, polygonArea = 0, arcs = [], i;

  if (innerPoints.length > 1) {
    var center = anychart.math.venn.getCenter(innerPoints);
    for (i = 0; i < innerPoints.length; ++i) {
      var p = innerPoints[i];
      p.angle = Math.atan2(p.x - center.x, p.y - center.y);
    }
    innerPoints.sort(function(a, b) {
      return b.angle - a.angle;
    });

    var p2 = innerPoints[innerPoints.length - 1];
    for (i = 0; i < innerPoints.length; ++i) {
      var p1 = innerPoints[i];

      polygonArea += (p2.x + p1.x) * (p1.y - p2.y);

      var midPoint = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
      var arc = null;

      for (var j = 0; j < p1.parentIndex.length; ++j) {
        if (p2.parentIndex.indexOf(p1.parentIndex[j]) > -1) {
          var circle = circles[p1.parentIndex[j]],
              a1 = Math.atan2(p1.x - circle.x, p1.y - circle.y),
              a2 = Math.atan2(p2.x - circle.x, p2.y - circle.y);

          var angleDiff = (a2 - a1);
          if (angleDiff < 0) {
            angleDiff += 2 * Math.PI;
          }

          var a = a2 - angleDiff / 2;
          var width = anychart.math.venn.distance(midPoint, {
            x: circle.x + circle.radius * Math.sin(a),
            y: circle.y + circle.radius * Math.cos(a)
          });

          if ((arc === null) || (arc.width > width)) {
            arc = {
              circle: circle,
              width: width,
              p1: p1,
              p2: p2
            };
          }
        }
      }

      if (arc !== null) {
        arcs.push(arc);
        arcArea += anychart.math.venn.circleArea(arc.circle.radius, arc.width);
        p2 = p1;
      }
    }
  } else {
    var smallest = circles[0];
    for (i = 1; i < circles.length; ++i) {
      if (circles[i].radius < smallest.radius) {
        smallest = circles[i];
      }
    }

    var disjoint = false;
    for (i = 0; i < circles.length; ++i) {
      if (anychart.math.venn.distance(circles[i], smallest) > Math.abs(smallest.radius - circles[i].radius)) {
        disjoint = true;
        break;
      }
    }

    if (disjoint) {
      arcArea = polygonArea = 0;
    } else {
      arcArea = smallest.radius * smallest.radius * Math.PI;
      arcs.push({
        circle: smallest,
        p1: {x: smallest.x, y: smallest.y + smallest.radius},
        p2: {x: smallest.x - anychart.math.venn.DELTA, y: smallest.y + smallest.radius},
        width: smallest.radius * 2
      });
    }
  }

  polygonArea /= 2;
  if (opt_stats) {
    opt_stats.area = arcArea + polygonArea;
    opt_stats.arcArea = arcArea;
    opt_stats.polygonArea = polygonArea;
    opt_stats.arcs = arcs;
    opt_stats.innerPoints = innerPoints;
    opt_stats.intersectionPoints = intersectionPoints;
  }

  return arcArea + polygonArea;
};


/**
 * Returns whether a point is contained by all of a list of circles.
 * @param {anychart.math.venn.IntersectionPoint} point - Point.
 * @param {Array.<anychart.math.venn.Circle>} circles - Circles.
 * @return {boolean}
 */
anychart.math.venn.containedInCircles = function(point, circles) {
  for (var i = 0; i < circles.length; ++i) {
    if (anychart.math.venn.distance(point, circles[i]) > circles[i].radius + anychart.math.venn.DELTA) {
      return false;
    }
  }
  return true;
};


/**
 * Gets all intersection points between a bunch of circles.
 * @param {Array.<anychart.math.venn.Circle>} circles - Circles.
 * @return {Array.<anychart.math.venn.IntersectionPoint>} - Inetrsection poits.
 */
anychart.math.venn.getIntersectionPoints = function(circles) {
  var ret = [];
  for (var i = 0; i < circles.length; ++i) {
    for (var j = i + 1; j < circles.length; ++j) {
      var intersect = anychart.math.venn.circleCircleIntersection(circles[i],
          circles[j]);
      for (var k = 0; k < intersect.length; ++k) {
        var p = intersect[k];
        p.parentIndex = [i, j];
        ret.push(p);
      }
    }
  }
  return ret;
};


/**
 * Calculates circular inregral.
 * @param {number} r - .
 * @param {number} x - .
 * @return {number} - Calculated result.
 */
anychart.math.venn.circleIntegral = function(r, x) {
  var y = Math.sqrt(r * r - x * x);
  return x * y + r * r * Math.atan2(x, y);
};


/**
 * Returns the area of a circle of radius r - up to width.
 * @param {number} r - .
 * @param {number} width - .
 * @return {number} - Area.
 */
anychart.math.venn.circleArea = function(r, width) {
  return anychart.math.venn.circleIntegral(r, width - r) - anychart.math.venn.circleIntegral(r, -r);
};


/**
 * Euclidean distance between two points.
 * @param {anychart.math.venn.SizedCircle|anychart.math.venn.Point} p1 - .
 * @param {anychart.math.venn.SizedCircle|anychart.math.venn.Point} p2 - .
 * @return {number}
 */
anychart.math.venn.distance = function(p1, p2) {
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
};


/**
 * Returns the overlap area of two circles of radius r1 and r2 - that have their centers separated by distance d.
 * Simpler faster circle intersection for only two circles.
 * @param {number} r1 - .
 * @param {number} r2 - .
 * @param {number} d - .
 * @return {number} - .
 */
anychart.math.venn.circleOverlap = function(r1, r2, d) {
  if (d >= r1 + r2) {
    return 0;
  }

  if (d <= Math.abs(r1 - r2)) {
    return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
  }

  var w1 = r1 - (d * d - r2 * r2 + r1 * r1) / (2 * d);
  var w2 = r2 - (d * d - r1 * r1 + r2 * r2) / (2 * d);
  return anychart.math.venn.circleArea(r1, w1) + anychart.math.venn.circleArea(r2, w2);
};


/**
 * Given two circles (containing a x/y/radius attributes), returns the intersecting points if possible.
 * Note: doesn't handle cases where there are infinitely many intersection points (circles are equivalent):, or only one intersection point.
 * @param {anychart.math.venn.Circle} p1 - .
 * @param {anychart.math.venn.Circle} p2 - .
 * @return {Array.<anychart.math.venn.Point>} - .
 */
anychart.math.venn.circleCircleIntersection = function(p1, p2) {
  var d = anychart.math.venn.distance(p1, p2),
      r1 = p1.radius,
      r2 = p2.radius;

  if ((d >= (r1 + r2)) || (d <= Math.abs(r1 - r2))) {
    return [];
  }

  var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d),
      h = Math.sqrt(r1 * r1 - a * a),
      x0 = p1.x + a * (p2.x - p1.x) / d,
      y0 = p1.y + a * (p2.y - p1.y) / d,
      rx = -(p2.y - p1.y) * (h / d),
      ry = -(p2.x - p1.x) * (h / d);

  return [{x: x0 + rx, y: y0 - ry}, {x: x0 - rx, y: y0 + ry}];
};


/**
 * Returns the center of a bunch of points.
 * @param {Array.<anychart.math.venn.IntersectionPoint>} points - Intersection points.
 * @return {anychart.math.venn.Point} - Center point.
 */
anychart.math.venn.getCenter = function(points) {
  var center = {x: 0, y: 0};
  for (var i = 0; i < points.length; ++i) {
    center.x += points[i].x;
    center.y += points[i].y;
  }
  center.x /= points.length;
  center.y /= points.length;
  return center;
};


//endregion
//region -- layout
/**
 * Given a list of set objects, and their corresponding overlaps.
 * Updates the (x, y, radius) attribute on each set such that their positions roughly correspond to the desired overlaps.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - Data reflections.
 * @param {Object=} opt_parameters - .
 * @return {Object.<string, anychart.math.venn.SizedCircle>} - Solution object, the map of sized circles.
 */
anychart.math.venn.venn = function(areas, opt_parameters) {
  opt_parameters = opt_parameters || {};
  opt_parameters.maxIterations = opt_parameters.maxIterations || 500;
  var initialLayout = opt_parameters.initialLayout || anychart.math.venn.bestInitialLayout;

  areas = anychart.math.venn.addMissingAreas(areas);

  var circles = initialLayout(areas);

  var initial = [], setids = [], setid;
  for (setid in circles) {
    if (circles.hasOwnProperty(setid)) {
      initial.push(circles[setid].x);
      initial.push(circles[setid].y);
      setids.push(setid);
    }
  }

  var totalFunctionCalls = 0;
  var solution = anychart.math.venn.nelderMead(
      function(values) {
        totalFunctionCalls += 1;
        var current = {};
        for (var i = 0; i < setids.length; ++i) {
          var setid = setids[i];
          current[setid] = {
            x: values[2 * i],
            y: values[2 * i + 1],
            radius: circles[setid].radius
            // size : circles[setid].size
          };
        }
        return anychart.math.venn.lossFunction(current, areas);
      },
      initial,
      opt_parameters);

  var positions = solution.x;
  for (var i = 0; i < setids.length; ++i) {
    setid = setids[i];
    circles[setid].x = positions[2 * i];
    circles[setid].y = positions[2 * i + 1];
  }

  return circles;
};


/**
 * Returns the distance necessary for two circles of radius r1 + r2 to have the overlap area 'overlap'.
 * @param {number} r1 - Radius1.
 * @param {number} r2 - Radius2.
 * @param {number} overlap - Overlap.
 * @return {number} - Distance.
 */
anychart.math.venn.distanceFromIntersectArea = function(r1, r2, overlap) {
  if (Math.min(r1, r2) * Math.min(r1, r2) * Math.PI <= overlap + anychart.math.venn.DELTA) {
    return Math.abs(r1 - r2);
  }

  return anychart.math.venn.bisect(function(distance) {
    return anychart.math.venn.circleOverlap(r1, r2, distance) - overlap;
  }, 0, r1 + r2);
};


/**
 * Missing pair-wise intersection area data can cause problems:
 * treating as an unknown means that sets will be laid out overlapping, which isn't what people expect.
 * To reflect that we want disjoint sets here, set the overlap to 0 for all missing pairwise set intersections.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - .
 * @return {Array.<anychart.charts.Venn.DataReflection>} - .
 */
anychart.math.venn.addMissingAreas = function(areas) {
  areas = areas.slice();

  var ids = [], pairs = {}, i, j, a, b;
  for (i = 0; i < areas.length; ++i) {
    var area = areas[i];
    if (area.sets.length == 1) {
      ids.push(area.sets[0]);
    } else if (area.sets.length == 2) {
      a = area.sets[0];
      b = area.sets[1];
      pairs[[a, b]] = true;
      pairs[[b, a]] = true;
    }
  }
  //TODO (A.Kudryavtsev): Extremely suspicious sorting because a and b are strings. Commented for a while.
  // ids.sort(function(a, b) {
  //   return a > b;
  // });

  for (i = 0; i < ids.length; ++i) {
    a = ids[i];
    for (j = i + 1; j < ids.length; ++j) {
      b = ids[j];
      if (!([a, b] in pairs)) {
        areas.push({sets: [a, b], size: 0, iteratorIndex: NaN});
      }
    }
  }
  return areas;
};


/**
 * Returns two matrices, one of the euclidean distances between the sets and the other indicating
 * if there are subset or disjoint set relationships.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - .
 * @param {Array.<anychart.charts.Venn.DataReflection>} sets - .
 * @param {Object.<string, number>} setids - .
 * @return {Object}
 */
anychart.math.venn.getDistanceMatrices = function(areas, sets, setids) {
  var distances = anychart.math.venn.zerosM(sets.length, sets.length),
      constraints = anychart.math.venn.zerosM(sets.length, sets.length);

  areas = goog.array.filter(areas, function(x) {
    return x.sets.length == 2;
  });
  goog.array.map(areas, function(current) {
    var left = setids[current.sets[0]],
        right = setids[current.sets[1]],
        r1 = Math.sqrt(sets[left].size / Math.PI),
        r2 = Math.sqrt(sets[right].size / Math.PI),
        distance = anychart.math.venn.distanceFromIntersectArea(r1, r2, current.size);

    distances[left][right] = distances[right][left] = distance;

    var c = 0;
    if (current.size + anychart.math.venn.DELTA >= Math.min(sets[left].size, sets[right].size)) {
      c = 1;
    } else if (current.size <= anychart.math.venn.DELTA) {
      c = -1;
    }
    constraints[left][right] = constraints[right][left] = c;
  });

  return {distances: distances, constraints: constraints};
};


/**
 * Computes the gradient and loss simultaneously for our constrained MDS optimizer.
 * @param {Array.<number>} x - .
 * @param {Array.<number>} fxprime - .
 * @param {Array.<Array.<number>>} distances - .
 * @param {Array.<Array.<number>>} constraints - .
 * @return {number}
 */
anychart.math.venn.constrainedMDSGradient = function(x, fxprime, distances, constraints) {
  var loss = 0, i;
  for (i = 0; i < fxprime.length; ++i) {
    fxprime[i] = 0;
  }

  for (i = 0; i < distances.length; ++i) {
    var xi = x[2 * i], yi = x[2 * i + 1];
    for (var j = i + 1; j < distances.length; ++j) {
      var xj = x[2 * j], yj = x[2 * j + 1];
      var dij = distances[i][j];
      var constraint = constraints[i][j];

      var squaredDistance = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi);
      var distance = Math.sqrt(squaredDistance);
      var delta = squaredDistance - dij * dij;

      if (((constraint > 0) && (distance <= dij)) || ((constraint < 0) && (distance >= dij))) {
        continue;
      }

      loss += 2 * delta * delta;

      fxprime[2 * i] += 4 * delta * (xi - xj);
      fxprime[2 * i + 1] += 4 * delta * (yi - yj);

      fxprime[2 * j] += 4 * delta * (xj - xi);
      fxprime[2 * j + 1] += 4 * delta * (yj - yi);
    }
  }
  return loss;
};


/**
 * Takes the best working variant of either constrained MDS or greedy.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - .
 * @param {Object} params - .
 * @return {Object.<string, anychart.math.venn.SizedCircle>} - .
 */
anychart.math.venn.bestInitialLayout = function(areas, params) {
  var initial = anychart.math.venn.greedyLayout(areas);

  if (areas.length >= 8) {
    var constrained = anychart.math.venn.constrainedMDSLayout(areas, params),
        constrainedLoss = anychart.math.venn.lossFunction(constrained, areas),
        greedyLoss = anychart.math.venn.lossFunction(initial, areas);

    if (constrainedLoss + 1e-8 < greedyLoss) {
      initial = constrained;
    }
  }
  return initial;
};


/**
 * Use the constrained MDS variant to generate an initial layout.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - Data reflections.
 * @param {Object} params - .
 * @return {Object}
 */
anychart.math.venn.constrainedMDSLayout = function(areas, params) {
  params = params || {};
  var restarts = params.restarts || 10;

  var sets = [], setids = {}, i;
  for (i = 0; i < areas.length; ++i) {
    var area = areas[i];
    if (area.sets.length == 1) {
      setids[area.sets[0]] = sets.length;
      sets.push(area);
    }
  }

  var matrices = anychart.math.venn.getDistanceMatrices(areas, sets, setids),
      distances = matrices.distances,
      constraints = matrices.constraints;

  var norm = anychart.math.venn.norm2(goog.array.map(distances, anychart.math.venn.norm2)) / (distances.length);
  distances = goog.array.map(distances, function(row) {
    return goog.array.map(row, function(value) {
      return value / norm;
    });
  });

  var obj = function(x, fxprime) {
    return anychart.math.venn.constrainedMDSGradient(x, fxprime, distances, constraints);
  };

  var best, current;
  var counter = 0;
  for (i = 0; i < restarts; ++i) {
    var initial = [];

    //This generates pseudo-random array for calculating gradient.
    //Allows to get the same result on any chart render.
    for (var z = 0; z < distances.length * 2; z++) {
      var t = 1 / (z + 1 + counter);
      initial.push(t * Math.abs(Math.sin(i)));
    }

    current = anychart.math.venn.conjugateGradient(obj, initial, params);
    if (!best || (current.fx < best.fx)) {
      best = current;
    }
  }
  var positions = best.x;

  var circles = {};
  for (i = 0; i < sets.length; ++i) {
    var set = sets[i];
    circles[set.sets[0]] = {
      x: positions[2 * i] * norm,
      y: positions[2 * i + 1] * norm,
      radius: Math.sqrt(set.size / Math.PI)
    };
  }

  return circles;
};


/**
 * Lays out a Venn diagram greedily, going from most overlapped sets to least overlapped,
 * attempting to position each new set such that the overlapping areas to already positioned sets are basically right.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - .
 * @return {Object.<string, anychart.math.venn.SizedCircle>} - .
 */
anychart.math.venn.greedyLayout = function(areas) {
  var circles = {}, setOverlaps = {}, set;
  for (var i = 0; i < areas.length; ++i) {
    var area = areas[i];
    if (area.sets.length == 1) {
      set = area.sets[0];
      circles[set] = {
        x: 1e10, y: 1e10,
        rowid: circles.length,
        size: area.size,
        radius: Math.sqrt(area.size / Math.PI)
      };
      setOverlaps[set] = [];
    }
  }
  areas = goog.array.filter(areas, function(a) {
    return a.sets.length == 2;
  });

  for (i = 0; i < areas.length; ++i) {
    var current = areas[i];
    var weight = current.hasOwnProperty('weight') ? current.weight : 1.0;
    var left = current.sets[0], right = current.sets[1];

    if (current.size + anychart.math.venn.DELTA >= Math.min(circles[left].size, circles[right].size)) {
      weight = 0;
    }

    setOverlaps[left].push({set: right, size: current.size, weight: weight});
    setOverlaps[right].push({set: left, size: current.size, weight: weight});
  }

  var mostOverlapped = [];
  for (set in setOverlaps) {
    if (setOverlaps.hasOwnProperty(set)) {
      var size = 0;
      for (i = 0; i < setOverlaps[set].length; ++i) {
        size += setOverlaps[set][i].size * setOverlaps[set][i].weight;
      }
      mostOverlapped.push({set: set, size: size});
    }
  }

  function sortOrder(a, b) {
    return b.size - a.size;
  }

  mostOverlapped.sort(sortOrder);

  var positioned = {};

  function isPositioned(element) {
    return element.set in positioned;
  }

  function positionSet(point, index) {
    circles[index].x = point.x;
    circles[index].y = point.y;
    positioned[index] = true;
  }

  positionSet({x: 0, y: 0}, mostOverlapped[0].set);

  for (i = 1; i < mostOverlapped.length; ++i) {
    var setIndex = mostOverlapped[i].set;
    var overlap = goog.array.filter(setOverlaps[setIndex], isPositioned);
    set = circles[setIndex];
    overlap.sort(sortOrder);

    if (overlap.length === 0) {
      throw 'ERROR: missing pairwise overlap information';
    }

    var points = [];
    for (var j = 0; j < overlap.length; ++j) {
      var p1 = circles[overlap[j].set],
          d1 = anychart.math.venn.distanceFromIntersectArea(set.radius, p1.radius,
              overlap[j].size);

      points.push({x: p1.x + d1, y: p1.y});
      points.push({x: p1.x - d1, y: p1.y});
      points.push({y: p1.y + d1, x: p1.x});
      points.push({y: p1.y - d1, x: p1.x});

      for (var k = j + 1; k < overlap.length; ++k) {
        var p2 = circles[overlap[k].set],
            d2 = anychart.math.venn.distanceFromIntersectArea(set.radius, p2.radius,
                overlap[k].size);

        var extraPoints = anychart.math.venn.circleCircleIntersection(
            {x: p1.x, y: p1.y, radius: d1},
            {x: p2.x, y: p2.y, radius: d2});

        for (var l = 0; l < extraPoints.length; ++l) {
          points.push(extraPoints[l]);
        }
      }
    }

    var bestLoss = 1e50, bestPoint = points[0];
    for (j = 0; j < points.length; ++j) {
      circles[setIndex].x = points[j].x;
      circles[setIndex].y = points[j].y;
      var loss = anychart.math.venn.lossFunction(circles, areas);
      if (loss < bestLoss) {
        bestLoss = loss;
        bestPoint = points[j];
      }
    }

    positionSet(bestPoint, setIndex);
  }

  return circles;
};


/**
 * Given a bunch of sets, and the desired overlaps between these sets - computes the distance from the actual overlaps
 * to the desired overlaps.
 * Note that this method ignores overlaps of more than 2 circles.
 * @param {Object.<string, anychart.math.venn.SizedCircle>} sets - Sets map.
 * @param {Array.<anychart.charts.Venn.DataReflection>} overlaps - Overlaps data.
 * @return {number}
 */
anychart.math.venn.lossFunction = function(sets, overlaps) {
  var output = 0;

  function getCircles(indices) {
    return goog.array.map(indices, function(i) {
      return sets[i];
    });
  }

  for (var i = 0; i < overlaps.length; ++i) {
    var area = overlaps[i], overlap;
    if (area.sets.length == 1) {
      continue;
    } else if (area.sets.length == 2) {
      var left = sets[area.sets[0]],
          right = sets[area.sets[1]];
      overlap = anychart.math.venn.circleOverlap(left.radius, right.radius, anychart.math.venn.distance(left, right));
    } else {
      overlap = anychart.math.venn.intersectionArea(getCircles(area.sets));
    }

    var weight = area.hasOwnProperty('weight') ? area.weight : 1.0;
    output += weight * (overlap - area.size) * (overlap - area.size);
  }

  return output;
};


/**
 * Orientates a bunch of circles to point in orientation.
 * @param {Array.<anychart.math.venn.Circle>} circles - .
 * @param {number} orientation - .
 * @param {?Function} orientationOrder - Sort function.
 */
anychart.math.venn.orientateCircles = function(circles, orientation, orientationOrder) {
  if (orientationOrder === null) {
    circles.sort(function(a, b) {
      return b.radius - a.radius;
    });
  } else {
    circles.sort(orientationOrder);
  }

  var i;
  if (circles.length > 0) {
    var largestX = circles[0].x,
        largestY = circles[0].y;

    for (i = 0; i < circles.length; ++i) {
      circles[i].x -= largestX;
      circles[i].y -= largestY;
    }
  }

  if (circles.length > 1) {
    var rotation = Math.atan2(circles[1].x, circles[1].y) - orientation,
        c = Math.cos(rotation),
        s = Math.sin(rotation), x, y;

    for (i = 0; i < circles.length; ++i) {
      x = circles[i].x;
      y = circles[i].y;
      circles[i].x = c * x - s * y;
      circles[i].y = s * x + c * y;
    }
  }

  if (circles.length > 2) {
    var angle = Math.atan2(circles[2].x, circles[2].y) - orientation;
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle > 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    if (angle > Math.PI) {
      var slope = circles[1].y / (1e-10 + circles[1].x);
      for (i = 0; i < circles.length; ++i) {
        var d = (circles[i].x + slope * circles[i].y) / (1 + slope * slope);
        circles[i].x = 2 * d - circles[i].x;
        circles[i].y = 2 * d * slope - circles[i].y;
      }
    }
  }
};


/**
 * Union-find clustering to get disjoint sets.
 * @param {Array.<anychart.math.venn.Circle>} circles - .
 * @return {Array.<Array.<anychart.math.venn.Circle>>} - .
 */
anychart.math.venn.disjointCluster = function(circles) {
  circles = goog.array.map(circles, /** @type {function(anychart.math.venn.Circle)} */ (function(circle) {
    circle.parent = circle;
    return circle;
  }));

  function find(circle) {
    if (circle.parent !== circle) {
      circle.parent = find(circle.parent);
    }
    return circle.parent;
  }

  function union(x, y) {
    var xRoot = find(x);
    xRoot.parent = find(y);
  }

  for (var i = 0; i < circles.length; ++i) {
    for (var j = i + 1; j < circles.length; ++j) {
      var maxDistance = circles[i].radius + circles[j].radius;
      if (anychart.math.venn.distance(circles[i], circles[j]) + anychart.math.venn.DELTA < maxDistance) {
        union(circles[j], circles[i]);
      }
    }
  }

  var disjointClusters = {}, setid;
  for (i = 0; i < circles.length; ++i) {
    setid = find(circles[i]).parent.setid;
    if (!(setid in disjointClusters)) {
      disjointClusters[setid] = [];
    }
    disjointClusters[setid].push(circles[i]);
  }

  goog.array.map(circles, function(circle) {
    delete circle.parent;
  });

  var ret = [];
  for (setid in disjointClusters) {
    if (disjointClusters.hasOwnProperty(setid)) {
      ret.push(disjointClusters[setid]);
    }
  }
  return ret;
};


/**
 * @param {Array.<anychart.math.venn.Circle>} circles - .
 * @return {Object} - .
 */
anychart.math.venn.getBoundingBox = function(circles) {
  var minMax = function(d) {
    var hi = Math.max.apply(null, goog.array.map(circles, function(c) {
      return c[d] + c.radius;
    }));

    var lo = Math.min.apply(null, goog.array.map(circles, function(c) {
      return c[d] - c.radius;
    }));
    return {max: hi, min: lo};
  };

  return {xRange: minMax('x'), yRange: minMax('y')};
};


/**
 * @param {Object.<string, anychart.math.venn.SizedCircle>} solution - .
 * @param {number} orientation - .
 * @param {?function(number, number): number} orientationOrder - .
 * @return {Object.<string, anychart.math.venn.Circle>} - .
 */
anychart.math.venn.normalizeSolution = function(solution, orientation, orientationOrder) {
  if (orientation === null) {
    orientation = Math.PI / 2;
  }

  var circles = [], i, setid;
  for (setid in solution) {
    if (solution.hasOwnProperty(setid)) {
      var previous = solution[setid];
      circles.push({
        x: previous.x,
        y: previous.y,
        radius: previous.radius,
        setid: setid
      });
    }
  }

  var clusters = anychart.math.venn.disjointCluster(circles);

  for (i = 0; i < clusters.length; ++i) {
    anychart.math.venn.orientateCircles(clusters[i], orientation, orientationOrder);
    var bounds = anychart.math.venn.getBoundingBox(clusters[i]);
    clusters[i].size = (bounds.xRange.max - bounds.xRange.min) * (bounds.yRange.max - bounds.yRange.min);
    clusters[i].bounds = bounds;
  }
  clusters.sort(function(a, b) {
    return b.size - a.size;
  });

  circles = clusters[0];
  var returnBounds = circles.bounds;

  var spacing = (returnBounds.xRange.max - returnBounds.xRange.min) / 50;

  function addCluster(cluster, right, bottom) {
    if (!cluster) return;

    var bounds = cluster.bounds, xOffset, yOffset, centreing;

    if (right) {
      xOffset = returnBounds.xRange.max - bounds.xRange.min + spacing;
    } else {
      xOffset = returnBounds.xRange.max - bounds.xRange.max;
      centreing = (bounds.xRange.max - bounds.xRange.min) / 2 -
          (returnBounds.xRange.max - returnBounds.xRange.min) / 2;
      if (centreing < 0) xOffset += centreing;
    }

    if (bottom) {
      yOffset = returnBounds.yRange.max - bounds.yRange.min + spacing;
    } else {
      yOffset = returnBounds.yRange.max - bounds.yRange.max;
      centreing = (bounds.yRange.max - bounds.yRange.min) / 2 -
          (returnBounds.yRange.max - returnBounds.yRange.min) / 2;
      if (centreing < 0) yOffset += centreing;
    }

    for (var j = 0; j < cluster.length; ++j) {
      cluster[j].x += xOffset;
      cluster[j].y += yOffset;
      circles.push(cluster[j]);
    }
  }

  var index = 1;
  while (index < clusters.length) {
    addCluster(clusters[index], true, false);
    addCluster(clusters[index + 1], false, true);
    addCluster(clusters[index + 2], true, true);
    index += 3;

    returnBounds = anychart.math.venn.getBoundingBox(circles);
  }

  var ret = {};
  for (i = 0; i < circles.length; ++i) {
    ret[circles[i].setid] = circles[i];
  }
  return ret;
};


/**
 * Scales a solution from venn.venn or venn.greedyLayout such that it fits in a rectangle of width/height - with
 * padding around the borders. Also centers the diagram in the available space at the same time.
 * @param {Object.<string, anychart.math.venn.Circle>} solution - .
 * @param {number} width - .
 * @param {number} height - .
 * @param {number} padding - .
 * @return {Object.<string, anychart.math.venn.Circle>} - .
 */
anychart.math.venn.scaleSolution = function(solution, width, height, padding) {
  var circles = [], setids = [];
  for (var setid in solution) {
    if (solution.hasOwnProperty(setid)) {
      setids.push(setid);
      circles.push(solution[setid]);
    }
  }

  width -= 2 * padding;
  height -= 2 * padding;

  var bounds = anychart.math.venn.getBoundingBox(circles),
      xRange = bounds.xRange,
      yRange = bounds.yRange,
      xScaling = width / (xRange.max - xRange.min),
      yScaling = height / (yRange.max - yRange.min),
      scaling = Math.min(yScaling, xScaling),

      xOffset = (width - (xRange.max - xRange.min) * scaling) / 2,
      yOffset = (height - (yRange.max - yRange.min) * scaling) / 2;

  var scaled = {};
  for (var i = 0; i < circles.length; ++i) {
    var circle = circles[i];
    scaled[setids[i]] = {
      radius: scaling * circle.radius,
      x: padding + xOffset + (circle.x - xRange.min) * scaling,
      y: padding + yOffset + (circle.y - yRange.min) * scaling
    };
  }

  return scaled;
};


//endregion
//region -- layout
/**
 *
 * @param {Object.<string, anychart.math.venn.Circle>} circles - Circles.
 * @return {Object.<Array.<string>>} - .
 */
anychart.math.venn.getOverlappingCircles = function(circles) {
  var ret = {}, circleids = [];
  for (var circleid in circles) {
    circleids.push(circleid);
    ret[circleid] = [];
  }
  for (var i = 0; i < circleids.length; i++) {
    var a = circles[circleids[i]];
    for (var j = i + 1; j < circleids.length; ++j) {
      var b = circles[circleids[j]],
          d = anychart.math.venn.distance(a, b);

      if (d + b.radius <= a.radius + 1e-10) {
        ret[circleids[j]].push(circleids[i]);

      } else if (d + a.radius <= b.radius + 1e-10) {
        ret[circleids[i]].push(circleids[j]);
      }
    }
  }
  return ret;
};


/**
 *
 * @param {anychart.math.venn.Point} current - .
 * @param {Array.<anychart.math.venn.Circle>} interior - .
 * @param {Array.<anychart.math.venn.Circle>} exterior - .
 * @return {number}
 */
anychart.math.venn.circleMargin = function(current, interior, exterior) {
  var margin = interior[0].radius - anychart.math.venn.distance(interior[0], current), i, m;
  for (i = 1; i < interior.length; ++i) {
    m = interior[i].radius - anychart.math.venn.distance(interior[i], current);
    if (m <= margin) {
      margin = m;
    }
  }

  for (i = 0; i < exterior.length; ++i) {
    m = anychart.math.venn.distance(exterior[i], current) - exterior[i].radius;
    if (m <= margin) {
      margin = m;
    }
  }
  return margin;
};


/**
 * Computes text centre.
 * @param {Array.<anychart.math.venn.Circle>} interior - .
 * @param {Array.<anychart.math.venn.Circle>} exterior - .
 * @return {anychart.math.venn.Point} - Text center.
 */
anychart.math.venn.computeTextCentre = function(interior, exterior) {
  var points = [], i;
  for (i = 0; i < interior.length; ++i) {
    var c = interior[i];
    points.push({x: c.x, y: c.y});
    points.push({x: c.x + c.radius / 2, y: c.y});
    points.push({x: c.x - c.radius / 2, y: c.y});
    points.push({x: c.x, y: c.y + c.radius / 2});
    points.push({x: c.x, y: c.y - c.radius / 2});
  }
  var initial = points[0], margin = anychart.math.venn.circleMargin(points[0], interior, exterior);
  for (i = 1; i < points.length; ++i) {
    var m = anychart.math.venn.circleMargin(points[i], interior, exterior);
    if (m >= margin) {
      initial = points[i];
      margin = m;
    }
  }

  var solution = anychart.math.venn.nelderMead(
      function(p) {
        return -1 * anychart.math.venn.circleMargin({x: p[0], y: p[1]}, interior, exterior);
      },
      [initial.x, initial.y],
      {maxIterations: 500, minErrorDelta: 1e-10}).x;
  var ret = {x: solution[0], y: solution[1]};

  var valid = true;
  for (i = 0; i < interior.length; ++i) {
    if (anychart.math.venn.distance(ret, interior[i]) > interior[i].radius) {
      valid = false;
      break;
    }
  }

  for (i = 0; i < exterior.length; ++i) {
    if (anychart.math.venn.distance(ret, exterior[i]) < exterior[i].radius) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    if (interior.length == 1) {
      ret = {x: interior[0].x, y: interior[0].y};
    } else {
      var areaStats = /** @type {anychart.math.venn.Stats} */ ({});
      anychart.math.venn.intersectionArea(interior, areaStats);

      if (areaStats.arcs.length === 0) {
        ret = {'x': 0, 'y': -1000, disjoint: true};

      } else if (areaStats.arcs.length == 1) {
        ret = {
          'x': areaStats.arcs[0].circle.x,
          'y': areaStats.arcs[0].circle.y
        };

      } else if (exterior.length) {
        ret = anychart.math.venn.computeTextCentre(interior, []);

      } else {
        ret = anychart.math.venn.getCenter(goog.array.map(areaStats.arcs, function(a) {
          return a.p1;
        }));
      }
    }
  }

  return ret;
};


/**
 * Calculates text centers.
 * @param {Object.<string, anychart.math.venn.Circle>} circles - Circles data.
 * @param {Array.<anychart.charts.Venn.DataReflection>} areas - Areas.
 * @return {Array.<anychart.math.venn.Point>} - Text centers.
 */
anychart.math.venn.computeTextCentres = function(circles, areas) {
  var ret = [];
  var overlapped = anychart.math.venn.getOverlappingCircles(circles);

  for (var i = 0; i < areas.length; ++i) {
    var area = areas[i].sets;
    var areaids = {};
    var exclude = {};
    var iteratorIndex = areas[i].iteratorIndex;

    for (var j = 0; j < area.length; ++j) {
      areaids[area[j]] = true;
      var overlaps = overlapped[area[j]];
      for (var k = 0; k < overlaps.length; ++k) {
        exclude[overlaps[k]] = true;
      }
    }

    var interior = [], exterior = [];
    for (var setid in circles) {
      if (setid in areaids) {
        interior.push(circles[setid]);
      } else if (!(setid in exclude)) {
        exterior.push(circles[setid]);
      }
    }
    var centre = anychart.math.venn.computeTextCentre(interior, exterior);
    ret[iteratorIndex] = centre;
    if (centre.disjoint && (areas[i].size > 0)) {
      console.log('WARNING: area ' + area + ' not represented on screen');
    }
  }
  return ret;
};


//endregion

