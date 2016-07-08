goog.provide('anychart.core.utils.TopoJSONParser');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.utils.GeoJSONParser');



/**
 * Topo JSON parser class.
 * @constructor
 */
anychart.core.utils.TopoJSONParser = function() {
};
goog.addSingletonGetter(anychart.core.utils.TopoJSONParser);


/**
 * Returns parser type.
 * @return {anychart.enums.MapGeoDataTypes}
 */
anychart.core.utils.TopoJSONParser.prototype.getType = function() {
  return anychart.enums.MapGeoDataTypes.TOPO_JSON;
};


/**
 * Parse topo JSON data.
 * @param {Object} data TopoJSON data to parse.
 * @return {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} .
 */
anychart.core.utils.TopoJSONParser.prototype.parse = function(data) {
  var result = [];
  var geoJSONParser = anychart.core.utils.GeoJSONParser.getInstance();
  goog.object.forEach(data['objects'], function(o) {
    var feature = this.feature(data, o);
    result.push.apply(result, geoJSONParser.parse(/** @type {Object} */(feature)));
  }, this);
  return result;
};


/**
 * Absolute transformation.
 * @param {Object} transform Object of transformations settings.
 * @return {Function}
 */
anychart.core.utils.TopoJSONParser.prototype.transformAbsolute = function(transform) {
  if (!transform) return goog.nullFunction;
  var x0,
      y0,
      kx = transform['scale'][0],
      ky = transform['scale'][1],
      dx = transform['translate'][0],
      dy = transform['translate'][1];
  return function(point, i) {
    if (!i) x0 = y0 = 0;
    point[0] = (x0 += point[0]) * kx + dx;
    point[1] = (y0 += point[1]) * ky + dy;
  };
};


/**
 * Relative transformation.
 * @param {Object} transform Object of transformations settings.
 * @return {Function}
 */
anychart.core.utils.TopoJSONParser.prototype.transformRelative = function(transform) {
  if (!transform) return goog.nullFunction;
  var x0,
      y0,
      kx = transform['scale'][0],
      ky = transform['scale'][1],
      dx = transform['translate'][0],
      dy = transform['translate'][1];
  return function(point, i) {
    if (!i) x0 = y0 = 0;
    var x1 = Math.round((point[0] - dx) / kx),
        y1 = Math.round((point[1] - dy) / ky);
    point[0] = x1 - x0;
    point[1] = y1 - y0;
    x0 = x1;
    y0 = y1;
  };
};


/**
 * Array reverse.
 * @param {Array.<*>} array .
 * @param {number} n .
 */
anychart.core.utils.TopoJSONParser.prototype.reverse = function(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
};


/**
 * Bisect.
 * @param {Array.<number>} a .
 * @param {number} x .
 * @return {number}
 */
anychart.core.utils.TopoJSONParser.prototype.bisect = function(a, x) {
  var lo = 0, hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};


/**
 * Returns the GeoJSON Feature or FeatureCollection for the specified object in the given topology. If the specified
 * object is a GeometryCollection, a FeatureCollection is returned, and each geometry in the collection is mapped to a Feature.
 * Otherwise, a Feature is returned.
 * @param {Object} topology Full geo data.
 * @param  {Object} o TopoJSON object.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.feature = function(topology, o) {
  return o['type'] === 'GeometryCollection' ? {
    'type': 'FeatureCollection',
    'features': goog.array.map(o['geometries'], function(o) {
      return this.feature_(topology, o);
    }, this)
  } : this.feature_(topology, o);
};


/**
 * Creates GeoJSON feature.
 * @param {Object} topology Full geo data.
 * @param {Object} o TopoJSON object.
 * @return {Object}
 * @private
 */
anychart.core.utils.TopoJSONParser.prototype.feature_ = function(topology, o) {
  var f = {
    'type': 'Feature',
    'id': o['id'],
    'properties': o['properties'] || {},
    'geometry': this.object(topology, o)
  };
  if (o['id'] == null) delete f['id'];
  return f;
};


/**
 * Creates GeoJSON geometry.
 * @param {Object} topology Full geo data.
 * @param {Object} o TopoJSON object.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.object = function(topology, o) {
  var absolute = this.transformAbsolute(topology['transform']);
  var arcs = topology['arcs'];

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
      points.push(p = goog.array.slice(a[k], 0));
      absolute(p, k);
    }
    if (i < 0) anychart.core.utils.TopoJSONParser.getInstance().reverse(points, n);
  }

  function point(p) {
    p = goog.array.slice(p, 0);
    absolute(p, 0);
    return p;
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
    if (points.length < 2) points.push(goog.array.slice(points[0], 0));
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) points.push(goog.array.slice(points[0], 0));
    return points;
  }

  function polygon(arcs) {
    return goog.array.map(arcs, ring);
  }

  function geometry(o) {
    var t = o['type'];
    return t === 'GeometryCollection' ? {'type': t, 'geometries': goog.array.map(o['geometries'], geometry)}
        : t in geometryType ? {'type': t, 'coordinates': geometryType[t](o)}
        : null;
  }

  var geometryType = {
    'Point': function(o) {
      return point(o['coordinates']);
    },
    'MultiPoint': function(o) {
      return goog.array.map(o['coordinates'], point);
    },
    'LineString': function(o) {
      return line(o['arcs']);
    },
    'MultiLineString': function(o) {
      return goog.array.map(o['arcs'], line);
    },
    'Polygon': function(o) {
      return polygon(o['arcs']);
    },
    'MultiPolygon': function(o) {
      return goog.array.map(o['arcs'], polygon);
    }
  };

  return geometry(o);
};


/**
 * Stitch arcs.
 * @param {Object} topology Full geo data.
 * @param {Array} arcs Arcs.
 * @return {Array}
 */
anychart.core.utils.TopoJSONParser.prototype.stitchArcs = function(topology, arcs) {
  var stitchedArcs = {},
      fragmentByStart = {},
      fragmentByEnd = {},
      fragments = [],
      emptyIndex = -1;

  // Stitch empty arcs first, since they may be subsumed by other arcs.
  goog.array.forEach(arcs, function(i, j) {
    var arc = topology['arcs'][i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });

  goog.array.forEach(arcs, function(i) {
    var e = ends(i),
        start = e[0],
        end = e[1],
        f, g;

    if (f = fragmentByEnd[start]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start;
      if (g = fragmentByEnd[start]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
    }
  });

  function ends(i) {
    var arc = topology['arcs'][i < 0 ? ~i : i], p0 = arc[0], p1;
    if (topology['transform']) p1 = [0, 0], goog.array.forEach(arc, function(dp) {
      p1[0] += dp[0], p1[1] += dp[1];
    });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p0] : [p0, p1];
  }

  function flush(fragmentByEnd, fragmentByStart) {
    for (var k in fragmentByEnd) {
      var f = fragmentByEnd[k];
      delete fragmentByStart[f.start];
      delete f.start;
      delete f.end;
      goog.array.forEach(f, function(i) {
        stitchedArcs[i < 0 ? ~i : i] = 1;
      });
      fragments.push(f);
    }
  }

  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  goog.array.forEach(arcs, function(i) {
    if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
  });

  return fragments;
};


/**
 * Returns the GeoJSON MultiLineString geometry object representing the mesh for the specified object in the given topology.
 * This is useful for rendering strokes in complicated objects efficiently, as edges that are shared by multiple features
 * are only stroked once.
 *
 * An optional filter function may be specified to prune arcs from the returned mesh using the topology. The filter
 * function is called once for each candidate arc and takes two arguments, a and b, two geometry objects that share
 * that arc. Each arc is only included in the resulting mesh if the filter function returns true. For typical map
 * topologies the geometries a and b are adjacent polygons and the candidate arc is their boundary. If an arc is only
 * used by a single geometry then a and b are identical. This property is useful for separating interior and exterior
 * boundaries; an easy way to produce a mesh of interior boundaries is:
 *
 *    var interiors = anychart.core.utils.TopoJSONParser.getInstance().mesh(topology, object, function(a, b) { return a !== b; });
 *
 * @param {Object} topology Full geo data.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.mesh = function(topology) {
  return this.object(topology, this.meshArcs.apply(this, arguments));
};


/**
 * Equivalent to 'mesh' method, but returns a TopoJSON MultiLineString object rather than GeoJSON.
 * @param {Object} topology Full geo data.
 * @param {Object} o
 * @param {Function=} opt_filter Filter function.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.meshArcs = function(topology, o, opt_filter) {
  var arcs = [];

  function arc(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
  }

  function line(arcs) {
    goog.array.forEach(arcs, arc);
  }

  function polygon(arcs) {
    goog.array.forEach(arcs, line);
  }

  function geometry(o) {
    if (o['type'] === 'GeometryCollection') {
      goog.array.forEach(o['geometries'], geometry);
    } else if (o['type'] in geometryType) {
      geom = o;
      geometryType[o['type']](o['arcs']);
    }
  }

  if (arguments.length > 1) {
    var geomsByArc = [],
        geom;

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: function(arcs) {
        goog.array.forEach(arcs, polygon);
      }
    };

    geometry(o);

    var callback = arguments.length < 3 ?
        function(geoms) {
          arcs.push(geoms[0].i);
        } :
        function(geoms) {
          if (opt_filter(geoms[0].g, geoms[geoms.length - 1].g)) {
            arcs.push(geoms[0].i);
          }
        };

    goog.array.forEach(geomsByArc, callback);
  } else {
    for (var i = 0, n = topology['arcs'].length; i < n; ++i)
      arcs.push(i);
  }

  return {'type': 'MultiLineString', 'arcs': this.stitchArcs(topology, arcs)};
};


/**
 * Cartesian triangle area.
 * @param {Array.<Array.<number>>} triangle Vertices coords of triangle.
 * @return {number}
 */
anychart.core.utils.TopoJSONParser.prototype.cartesianTriangleArea = function(triangle) {
  var a = triangle[0], b = triangle[1], c = triangle[2];
  return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
};


/**
 * Ring.
 * @param {Array.<Array.<number>>} ring
 * @return {number}
 */
anychart.core.utils.TopoJSONParser.prototype.ring = function(ring) {
  var i = -1,
      n = ring.length,
      a,
      b = ring[n - 1],
      area = 0;

  while (++i < n) {
    a = b;
    b = ring[i];
    area += a[0] * b[1] - a[1] * b[0];
  }

  return area / 2;
};


/**
 * Returns the GeoJSON MultiPolygon geometry object representing the union for the specified array of Polygon and
 * MultiPolygon objects in the given topology. Interior borders shared by adjacent polygons are removed.
 * @param {Object} topology Full geo data.
 * @param {...Object} var_args Objects to merge.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.merge = function(topology, var_args) {
  return this.object(topology, this.mergeArcs.apply(this, arguments));
};


/**
 * Equivalent to 'merge' method, but returns a TopoJSON MultiPolygon object rather than GeoJSON.
 * @param {Object} topology Full geo data.
 * @param {Array.<Object>} objects TopoJSON objects to merge.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.mergeArcs = function(topology, objects) {
  var polygonsByArc = {},
      polygons = [],
      components = [];

  goog.array.forEach(objects, function(o) {
    if (o['type'] === 'Polygon') register(o['arcs']);
    else if (o['type'] === 'MultiPolygon') goog.array.forEach(o['arcs'], register);
  });

  function register(polygon) {
    goog.array.forEach(polygon, function(ring$$) {
      goog.array.forEach(ring$$, function(arc) {
        (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
      });
    });
    polygons.push(polygon);
  }

  function area(ring$$) {
    return Math.abs(this.ring(this.object(topology, {type: 'Polygon', arcs: [ring$$]})['coordinates'][0]));
  }

  goog.array.forEach(polygons, function(polygon) {
    if (!polygon._) {
      var component = [],
          neighbors = [polygon];
      polygon._ = 1;
      components.push(component);
      while (polygon = neighbors.pop()) {
        component.push(polygon);
        goog.array.forEach(polygon, function(ring$$) {
          goog.array.forEach(ring$$, function(arc) {
            goog.array.forEach(polygonsByArc[arc < 0 ? ~arc : arc], function(polygon) {
              if (!polygon._) {
                polygon._ = 1;
                neighbors.push(polygon);
              }
            });
          });
        });
      }
    }
  });

  goog.array.forEach(polygons, function(polygon) {
    delete polygon._;
  });

  return {
    'type': 'MultiPolygon',
    'arcs': goog.array.map(components, function(polygons) {
      var arcs = [], n;

      // Extract the exterior (unique) arcs.
      goog.array.forEach(polygons, function(polygon) {
        goog.array.forEach(polygon, function(ring$$) {
          goog.array.forEach(ring$$, function(arc) {
            if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
              arcs.push(arc);
            }
          });
        });
      });

      // Stitch the arcs into one or more rings.
      arcs = this.stitchArcs(topology, arcs);

      // If more than one ring is returned,
      // at most one of these rings can be the exterior;
      // choose the one with the greatest absolute area.
      if ((n = arcs.length) > 1) {
        for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
          if ((ki = area(arcs[i])) > k) {
            t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
          }
        }
      }

      return arcs;
    })
  };
};


/**
 * Returns an array representing the set of neighboring objects for each object in the specified objects array. The
 * returned array has the same number of elements as the input array; each element i in the returned array is the array
 * of indexes for neighbors of object i in the input array. For example, if the specified objects array contains the
 * features foo and bar, and these features are neighbors, the returned array will be [​[1], [0]​], indicating that foo
 * is a neighbor of bar and vice versa. Each array of neighbor indexes for each object is guaranteed to be sorted in
 * ascending order.
 * @param {Array.<Object>} objects Set of objects to check.
 * @return {Array.<Object>}
 */
anychart.core.utils.TopoJSONParser.prototype.neighbors = function(objects) {
  var indexesByArc = {}, // arc index -> array of object indexes
      neighbors = goog.array.map(objects, function() {
        return [];
      });

  function line(arcs, i) {
    goog.array.forEach(arcs, function(a) {
      if (a < 0) a = ~a;
      var o = indexesByArc[a];
      if (o) o.push(i);
      else indexesByArc[a] = [i];
    });
  }

  function polygon(arcs, i) {
    goog.array.forEach(arcs, function(arc) {
      line(arc, i);
    });
  }

  function geometry(o, i) {
    if (o['type'] === 'GeometryCollection') goog.array.forEach(o['geometries'], function(o) {
      geometry(o, i);
    });
    else if (o['type'] in geometryType) geometryType[o['type']](o['arcs'], i);
  }

  var geometryType = {
    'LineString': line,
    'MultiLineString': polygon,
    'Polygon': polygon,
    'MultiPolygon': function(arcs, i) {
      goog.array.forEach(arcs, function(arc) {
        polygon(arc, i);
      });
    }
  };

  goog.array.forEach(objects, geometry);

  for (var i in indexesByArc) {
    for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
      for (var k = j + 1; k < m; ++k) {
        var ij = indexes[j], ik = indexes[k], n;
        if ((n = neighbors[ij])[i = this.bisect(n, ik)] !== ik) n.splice(i, 0, ik);
        if ((n = neighbors[ik])[i = this.bisect(n, ij)] !== ij) n.splice(i, 0, ij);
      }
    }
  }

  return neighbors;
};


/**
 * Area comparing.
 * @param {Array.<Array.<number>>} a Area a.
 * @param {Array.<Array.<number>>} b Area b.
 * @return {number}
 */
anychart.core.utils.TopoJSONParser.prototype.compareArea = function(a, b) {
  return a[1][2] - b[1][2];
};


/**
 * Min area heap.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.minAreaHeap = function() {
  var heap = {},
      array = [],
      size = 0;

  heap.push = function(object) {
    up(array[object._ = size] = object, size++);
    return size;
  };

  heap.pop = function() {
    if (size <= 0) return;
    var removed = array[0], object;
    if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
    return removed;
  };

  heap.remove = function(removed) {
    var i = removed._, object;
    if (array[i] !== removed) return; // invalid request
    if (i !== --size) object = array[size], (this.compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
    return i;
  };

  function up(object, i) {
    while (i > 0) {
      var j = ((i + 1) >> 1) - 1,
          parent = array[j];
      if (this.compareArea(object, parent) >= 0) break;
      array[parent._ = i] = parent;
      array[object._ = i = j] = object;
    }
  }

  function down(object, i) {
    while (true) {
      var r = (i + 1) << 1,
          l = r - 1,
          j = i,
          child = array[j];
      if (l < size && this.compareArea(array[l], child) < 0) child = array[j = l];
      if (r < size && this.compareArea(array[r], child) < 0) child = array[j = r];
      if (j === i) break;
      array[child._ = i] = child;
      array[object._ = i = j] = object;
    }
  }

  return heap;
};


/**
 * Presimplify.
 * @param {Object} topology Full geo data.
 * @param {Function} triangleArea Triangle area.
 * @return {Object}
 */
anychart.core.utils.TopoJSONParser.prototype.presimplify = function(topology, triangleArea) {
  var absolute = this.transformAbsolute(topology['transform']),
      relative = this.transformRelative(topology['transform']),
      heap = this.minAreaHeap();

  if (!triangleArea) triangleArea = this.cartesianTriangleArea;

  goog.array.forEach(topology['arcs'], function(arc) {
    var triangles = [],
        maxArea = 0,
        triangle,
        i,
        n,
        p;

    // To store each point’s effective area, we create a new array rather than
    // extending the passed-in point to workaround a Chrome/V8 bug (getting
    // stuck in smi mode). For midpoints, the initial effective area of
    // Infinity will be computed in the next step.
    for (i = 0, n = arc.length; i < n; ++i) {
      p = arc[i];
      absolute(arc[i] = [p[0], p[1], Infinity], i);
    }

    for (i = 1, n = arc.length - 1; i < n; ++i) {
      triangle = arc.slice(i - 1, i + 2);
      triangle[1][2] = triangleArea(triangle);
      triangles.push(triangle);
      heap.push(triangle);
    }

    for (i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }

    while (triangle = heap.pop()) {
      var previous = triangle.previous,
          next = triangle.next;

      // If the area of the current point is less than that of the previous point
      // to be eliminated, use the latter's area instead. This ensures that the
      // current point cannot be eliminated without eliminating previously-
      // eliminated points.
      if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;
      else maxArea = triangle[1][2];

      if (previous) {
        previous.next = next;
        previous[2] = triangle[2];
        update(previous);
      }

      if (next) {
        next.previous = previous;
        next[0] = triangle[0];
        update(next);
      }
    }

    goog.array.forEach(arc, relative);
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1][2] = triangleArea(triangle);
    heap.push(triangle);
  }

  return topology;
};
