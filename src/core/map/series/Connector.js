goog.provide('anychart.core.map.series.Connector');
goog.require('anychart.core.map.series.DiscreteBase');
goog.require('anychart.core.utils.MapConnectorPointContextProvider');



/**
 * Define Connector series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.DiscreteBase}
 */
anychart.core.map.series.Connector = function(opt_data, opt_csvSettings) {
  anychart.core.map.series.Connector.base(this, 'constructor', opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['points'];
  this.referenceValueMeanings = ['points'];
};
goog.inherits(anychart.core.map.series.Connector, anychart.core.map.series.DiscreteBase);
anychart.core.map.series.Base.SeriesTypesMap[anychart.enums.MapSeriesType.CONNECTOR] = anychart.core.map.series.Connector;


/**
 * Width of path for handle events. Used for cases when base connector path very narrow.
 * @type {number}
 * @private
 */
anychart.core.map.series.Connector.prototype.eventHandlerPathWidth_ = 20;


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.getType = function() {
  return anychart.enums.MapSeriesType.CONNECTOR;
};


/**
 * Getter/setter for start connector points size.
 * @param {(number|string)=} opt_value .
 * @return {anychart.core.map.series.Connector|number} .
 */
anychart.core.map.series.Connector.prototype.startSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.startSize_ != opt_value) {
      this.startSize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startSize_;
  }
};


/**
 * Getter/setter for end connector points size.
 * @param {(number|string)=} opt_value .
 * @return {anychart.core.map.series.Connector|number} .
 */
anychart.core.map.series.Connector.prototype.endSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.endSize_ != opt_value) {
      this.endSize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.endSize_;
  }
};


/**
 * Getter/setter for curvature of connector point.
 * @param {(number|string)=} opt_value .
 * @return {anychart.core.map.series.Connector|number} .
 */
anychart.core.map.series.Connector.prototype.curvature = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || 0;
    if (this.curvature_ != opt_value) {
      this.curvature_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_OVERLAP);
    }
    return this;
  } else {
    return this.curvature_;
  }
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider || opt_force)
    this.pointProvider = new anychart.core.utils.MapConnectorPointContextProvider(this, this.referenceValueNames);
  this.pointProvider.applyReferenceValues();

  return this.pointProvider;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.map.series.Connector.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var scale = /** @type {anychart.scales.Geo} */(this.map.scale());

  var iterator = this.getIterator();

  var points = iterator.get(this.referenceValueNames[0]);
  if (!points || !goog.isArray(points)) return null;

  var result = [];
  var pointsWithoutMissing = [];

  var lat, lon, x, y;
  for (var i = 0, len = points.length; i < len; i += 2) {
    lat = anychart.utils.toNumber(points[i]);
    lon = anychart.utils.toNumber(points[i + 1]);

    var txCoords = scale.transform(lon, lat);

    x = txCoords[0];
    y = txCoords[1];

    if (!isNaN(x) && !isNaN(y)) {
      result.push(x, y);
      pointsWithoutMissing.push(lat, lon);
    }
  }

  iterator.meta('pointsWithoutMissing', pointsWithoutMissing);

  return result;
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var sumDist = /** @type {number} */(iterator.meta('sumDist'));
    var connectorsDist = /** @type {number} */(iterator.meta('connectorsDist'));
    var points = /** @type {Array.<number>} */(iterator.meta('points'));
    var accumDist = 0;

    var normalizedPosition;
    if (goog.isString(position)) {
      switch (position) {
        case 'start':
          normalizedPosition = 0;
          break;
        case 'middle':
          normalizedPosition = .5;
          break;
        case 'end':
          normalizedPosition = 1;
          break;
        default:
          if (anychart.utils.isPercent(position)) {
            normalizedPosition = parseFloat(position) / 100;
          } else {
            normalizedPosition = anychart.utils.toNumber(position);
            if (isNaN(normalizedPosition)) normalizedPosition = .5;
          }
      }
    } else {
      normalizedPosition = anychart.utils.toNumber(position);
      if (isNaN(normalizedPosition)) normalizedPosition = .5;
    }

    //start, end, middle
    //position relative full shortest path passing through all points
    var pixPosition = normalizedPosition * sumDist;
    for (var i = 0, len = points.length; i < len; i += 8) {
      //length of shortest connector path
      var currPathDist = connectorsDist[i / 8];

      if (pixPosition >= accumDist && pixPosition <= accumDist + currPathDist) {
        //calculated pixel position relative current connector
        var pixPosition_ = pixPosition - accumDist;

        //ratio relative current connector
        var t = pixPosition_ / currPathDist;

        //Control points relative scheme
        //https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/B%C3%A9zier_3_big.svg/360px-B%C3%A9zier_3_big.svg.png
        var p0x = points[i];
        var p0y = points[i + 1];
        var p1x = points[i + 2];
        var p1y = points[i + 3];
        var p2x = points[i + 4];
        var p2y = points[i + 5];
        var p3x = points[i + 6];
        var p3y = points[i + 7];

        var q0x = p1x + (p0x - p1x) * (1 - t);
        var q0y = p1y + (p0y - p1y) * (1 - t);

        var q1x = p2x + (p1x - p2x) * (1 - t);
        var q1y = p2y + (p1y - p2y) * (1 - t);

        var q2x = p3x + (p2x - p3x) * (1 - t);
        var q2y = p3y + (p2y - p3y) * (1 - t);

        var r0x = q1x + (q0x - q1x) * (1 - t);
        var r0y = q1y + (q0y - q1y) * (1 - t);

        var r1x = q2x + (q1x - q2x) * (1 - t);
        var r1y = q2y + (q1y - q2y) * (1 - t);

        var bx = r1x + (r0x - r1x) * (1 - t);
        var by = r1y + (r0y - r1y) * (1 - t);


        var horizontal = Math.sqrt(Math.pow(r1x - r0x, 2));
        var vertical = Math.sqrt(Math.pow(r1y - r0y, 2));
        var anglePathNormal = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

        if (r1x < r0x && r1y < r0y) {
          anglePathNormal = anglePathNormal - 180;
        } else if (r1x < r0x && r1y > r0y) {
          anglePathNormal = 180 - anglePathNormal;
        } else if (r1x > r0x && r1y > r0y) {
          //anglePathNormal = anglePathNormal;
        } else if (r1x > r0x && r1y < r0y) {
          anglePathNormal = -anglePathNormal;
        }

        iterator.meta('labelAnchor', this.getAnchorForLabel(goog.math.standardAngle(anglePathNormal + 90)));
        iterator.meta('markerRotation', anglePathNormal);
        iterator.meta('markerAnchor', normalizedPosition == 1 ? anychart.enums.Anchor.RIGHT_CENTER : !normalizedPosition ? anychart.enums.Anchor.LEFT_CENTER : anychart.enums.Anchor.CENTER);

        //todo (blackart) shapes for debug, don't remove.
        //if (!this['q0' + this.getIterator().getIndex()]) this['q0' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['q0' + this.getIterator().getIndex()].centerX(q0x).centerY(q0y).radius(3);
        //
        //if (!this['q1' + this.getIterator().getIndex()]) this['q1' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['q1' + this.getIterator().getIndex()].centerX(q1x).centerY(q1y).radius(3);
        //
        //if (!this['q2' + this.getIterator().getIndex()]) this['q2' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['q2' + this.getIterator().getIndex()].centerX(q2x).centerY(q2y).radius(3);
        //
        //if (!this['r0' + this.getIterator().getIndex()]) this['r0' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['r0' + this.getIterator().getIndex()].centerX(r0x).centerY(r0y).radius(3);
        //
        //if (!this['r1' + this.getIterator().getIndex()]) this['r1' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['r1' + this.getIterator().getIndex()].centerX(r1x).centerY(r1y).radius(3);
        //
        //if (!this['b' + this.getIterator().getIndex()]) this['b' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
        //this['b' + this.getIterator().getIndex()].centerX(bx).centerY(by).radius(3);
        //
        //if (!this['q0q1' + this.getIterator().getIndex()]) this['q0q1' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
        //this['q0q1' + this.getIterator().getIndex()].clear().moveTo(q0x, q0y).lineTo(q1x, q1y);
        //
        //if (!this['q1q2' + this.getIterator().getIndex()]) this['q1q2' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
        //this['q1q2' + this.getIterator().getIndex()].clear().moveTo(q1x, q1y).lineTo(q2x, q2y);
        //
        //if (!this['r0r1' + this.getIterator().getIndex()]) this['r0r1' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
        //this['r0r1' + this.getIterator().getIndex()].clear().moveTo(r0x, r0y).lineTo(r1x, r1y);
      }
      accumDist += currPathDist;
    }

    if (this.map.zoomingInProgress || this.map.moving) {
      var prevTx = this.map.mapTx;
      var tx = this.map.getMapLayer().getFullTransformation().clone();

      if (prevTx) {
        tx.concatenate(prevTx.createInverse());
      }

      var scale = tx.getScaleX();
      var dx = tx.getTranslateX();
      var dy = tx.getTranslateY();
      return {'value': {'x': bx * scale + dx, 'y': by * scale + dy}};
    } else {
      return {'value': {'x': bx, 'y': by}};
    }
  }
  return {'value': {'x': 0, 'y': 0}};
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.startDrawing = function() {
  anychart.core.map.series.Connector.base(this, 'startDrawing');

  this.pixelBoundsCache = this.map.scale().getBounds();
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.applyZoomMoveTransform = function() {
  var iterator = this.getIterator();

  var paths = iterator.meta('shape');
  if (paths) {
    var prevTx = this.map.mapTx;
    var tx = this.map.getMapLayer().getFullTransformation().clone();

    if (prevTx) {
      tx.concatenate(prevTx.createInverse());
    }

    var scale = tx.getScaleX();
    var dx = tx.getTranslateX();
    var dy = tx.getTranslateY();

    for (var i = 0, len = paths.length; i < len; i++) {
      var path = paths[i];
      path.setTransformationMatrix(scale, 0, 0, scale, dx, dy);
    }

    var hatchFill = this.hatchFillRootElement;
    var hatchFillShapes = iterator.meta('hatchFillShape');
    if (hatchFill && hatchFillShapes) {
      for (i = 0, len = hatchFillShapes.length; i < len; i++) {
        hatchFillShapes[i].setTransformationMatrix(scale, 0, 0, scale, dx, dy);
      }
    }
  }

  anychart.core.map.series.Connector.base(this, 'applyZoomMoveTransform');
};


/**
 * Connector drawer.
 * @param {acgraph.vector.Path} path Path element for drawing.
 * @param {number} start_x X coord of start connector point.
 * @param {number} start_y Y coord of start connector point.
 * @param {number} current_x X coord of end connector point ('current' for point consisting of several parts).
 * @param {number} current_y Y coord of end connector point ('current' for point consisting of several parts).
 * @param {number} control1x X coord of end of first curv control line.
 * @param {number} control1y Y coord of end of first curv control line.
 * @param {number} control2x X coord of end of second curv control line.
 * @param {number} control2y Y coord of end of second curv control line.
 * @param {number} startSize Size of connector start.
 * @param {number} endSize Size of connector end.
 * @param {number} curvature Connector curvature.
 * @param {number} directionRltAngle Direction value relative angle.
 * @param {number} curvatureBasePointAngle Angel of curvature base point relative normal.
 * @return {Array.<number>}
 * @private
 */
anychart.core.map.series.Connector.prototype.drawConnector_ = function(path, start_x, start_y, current_x, current_y, control1x, control1y, control2x, control2y, startSize, endSize, curvature, directionRltAngle, curvatureBasePointAngle) {
  var vertical, horizontal, angle, r;
  var controlLength, direction, finalControlLength, controlDirection;

  //calc angle between control line (from end to control1 point) and horizontal line (normal).
  horizontal = Math.sqrt(Math.pow(current_x - control1x, 2));
  vertical = Math.sqrt(Math.pow(current_y - control1y, 2));
  angle = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

  //angle correction
  var angleBtwControl1AndPath;
  if (control1x < current_x && control1y < current_y) {
    angleBtwControl1AndPath = angle;
  } else if (control1x < current_x && control1y > current_y) {
    angleBtwControl1AndPath = -angle;
  } else if (control1x > current_x && control1y > current_y) {
    angleBtwControl1AndPath = angle - 180;
  } else if (control1x > current_x && control1y < current_y) {
    angleBtwControl1AndPath = 180 - angle;
  }

  r = endSize / 2;
  controlDirection = curvature < 0 ? -90 : 90;
  var endCapLine1X = current_x + Math.cos(goog.math.toRadians(angleBtwControl1AndPath + controlDirection)) * r;
  var endCapLine1Y = current_y + Math.sin(goog.math.toRadians(angleBtwControl1AndPath + controlDirection)) * r;

  var endCapLine2X = current_x + Math.cos(goog.math.toRadians(angleBtwControl1AndPath - controlDirection)) * r;
  var endCapLine2Y = current_y + Math.sin(goog.math.toRadians(angleBtwControl1AndPath - controlDirection)) * r;


  //calc angle between control line (from start to control2 point) and horizontal line (normal).
  horizontal = Math.sqrt(Math.pow(start_x - control2x, 2));
  vertical = Math.sqrt(Math.pow(start_y - control2y, 2));
  angle = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

  //angle correction
  var angleBtwControl2AndPath;
  if (control2x < start_x && control2y < start_y) {
    angleBtwControl2AndPath = angle - 180;
  } else if (control2x < start_x && control2y > start_y) {
    angleBtwControl2AndPath = 180 - angle;
  } else if (control2x > start_x && control2y > start_y) {
    angleBtwControl2AndPath = angle;
  } else if (control2x > start_x && control2y < start_y) {
    angleBtwControl2AndPath = -angle;
  }

  r = startSize / 2;
  controlDirection = curvature < 0 ? -90 : 90;
  var startCapLine1X = start_x + Math.cos(goog.math.toRadians(angleBtwControl2AndPath + controlDirection)) * r;
  var startCapLine1Y = start_y + Math.sin(goog.math.toRadians(angleBtwControl2AndPath + controlDirection)) * r;

  var startCapLine2X = start_x + Math.cos(goog.math.toRadians(angleBtwControl2AndPath - controlDirection)) * r;
  var startCapLine2Y = start_y + Math.sin(goog.math.toRadians(angleBtwControl2AndPath - controlDirection)) * r;


  //distance between start and end points.
  var topDist = Math.sqrt(Math.pow(startCapLine1X - endCapLine1X, 2) + Math.pow(startCapLine1Y - endCapLine1Y, 2));
  //Current curve deflection (Maximum = dist / 2 with ratio = 1).
  var pixCurrTopCurveValue = (topDist / 2) * curvature;

  //Coordinates of the center of the shortest path between start and end points..
  var topCx = (startCapLine1X + endCapLine1X) / 2;
  var topCy = (startCapLine1Y + endCapLine1Y) / 2;

  //Base point for curvature of the vertex side
  var topCurveBasePointX = topCx + Math.cos(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrTopCurveValue * 1.2;
  var topCurveBasePointY = topCy + Math.sin(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrTopCurveValue * 1.2;

  controlLength = topDist / 2 * curvature;
  direction = curvature > 0 ? 1 : -1;
  finalControlLength = Math.abs(controlLength) < topDist / 4 ? topDist / 4 * direction : Math.abs(controlLength) > topDist / 2 ? topDist / 2 * direction : controlLength;

  controlDirection = (curvature < 0 ? 90 : -90) * directionRltAngle;
  //First control point of cubic curve
  var topControl1x = topCurveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;
  var topControl1y = topCurveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;

  controlDirection = (curvature < 0 ? -90 : 90) * directionRltAngle;
  //First control point of cubic curve
  var topControl2x = topCurveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;
  var topControl2y = topCurveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;

  path.moveTo(endCapLine1X, endCapLine1Y);
  path.curveTo(topControl1x, topControl1y, topControl2x, topControl2y, startCapLine1X, startCapLine1Y);


  //distance between start and end points.
  var bottomDist = Math.sqrt(Math.pow(startCapLine2X - endCapLine2X, 2) + Math.pow(startCapLine2Y - endCapLine2Y, 2));
  //Current curve deflection (Maximum = dist / 2 with ratio = 1).
  var pixCurrBottomCurveValue = (bottomDist / 2) * curvature;

  //Coordinates of the center of the shortest path between start and end points..
  var bottomCx = (startCapLine2X + endCapLine2X) / 2;
  var bottomCy = (startCapLine2Y + endCapLine2Y) / 2;

  //Base point for curvature of the vertex side
  var bottomCurveBasePointX = bottomCx + Math.cos(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrBottomCurveValue * 1.2;
  var bottomCurveBasePointY = bottomCy + Math.sin(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrBottomCurveValue * 1.2;

  controlLength = bottomDist / 2 * curvature;
  direction = curvature > 0 ? 1 : -1;
  finalControlLength = Math.abs(controlLength) < bottomDist / 4 ? bottomDist / 4 * direction : Math.abs(controlLength) > bottomDist / 2 ? bottomDist / 2 * direction : controlLength;

  controlDirection = (curvature < 0 ? 90 : -90) * directionRltAngle;
  //First control point of cubic curve
  var bottomControl1x = bottomCurveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;
  var bottomControl1y = bottomCurveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;

  controlDirection = (curvature < 0 ? -90 : 90) * directionRltAngle;
  //First control point of cubic curve
  var bottomControl2x = bottomCurveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;
  var bottomControl2y = bottomCurveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * finalControlLength;

  path.lineTo(startCapLine2X, startCapLine2Y);
  path.curveTo(bottomControl2x, bottomControl2y, bottomControl1x, bottomControl1y, endCapLine2X, endCapLine2Y);
  path.close();


  //scheme - https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/B%C3%A9zier_3_big.svg/360px-B%C3%A9zier_3_big.svg.png
  var p0x = start_x;
  var p0y = start_y;
  var p1x = control2x;
  var p1y = control2y;
  var p2x = control1x;
  var p2y = control1y;
  var p3x = current_x;
  var p3y = current_y;

  //todo (blackart) shapes for debug, don't remove.
  //if (!this['control1' + this.getIterator().getIndex()]) this['control1' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('orange');
  //this['control1' + this.getIterator().getIndex()].centerX(control1x).centerY(control1y).radius(3);
  //
  //if (!this['control2' + this.getIterator().getIndex()]) this['control2' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('blue');
  //this['control2' + this.getIterator().getIndex()].centerX(control2x).centerY(control2y).radius(3);
  //
  //if (!this['control1Line' + this.getIterator().getIndex()]) this['control1Line' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
  //this['control1Line' + this.getIterator().getIndex()].clear().moveTo(current_x, current_y).lineTo(control1x, control1y);
  //
  //if (!this['control2Line' + this.getIterator().getIndex()]) this['control2Line' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
  //this['control2Line' + this.getIterator().getIndex()].clear().moveTo(start_x, start_y).lineTo(control2x, control2y);
  //
  //if (!this['control1-2Line' + this.getIterator().getIndex()]) this['control1-2Line' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
  //this['control1-2Line' + this.getIterator().getIndex()].clear().moveTo(control1x, control1y).lineTo(control2x, control2y);
  //
  //if (!this['endCapPoint1' + this.getIterator().getIndex()]) this['endCapPoint1' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('purple');
  //this['endCapPoint1' + this.getIterator().getIndex()].centerX(endCapLine1X).centerY(endCapLine1Y).radius(3);
  //
  //if (!this['endCapPoint2' + this.getIterator().getIndex()]) this['endCapPoint2' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
  //this['endCapPoint2' + this.getIterator().getIndex()].centerX(endCapLine2X).centerY(endCapLine2Y).radius(3);
  //
  //if (!this['endCapLine' + this.getIterator().getIndex()]) this['endCapLine' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
  //this['endCapLine' + this.getIterator().getIndex()].clear().moveTo(endCapLine1X, endCapLine1Y).lineTo(endCapLine2X, endCapLine2Y);
  //
  //if (!this['startCapPoint1' + this.getIterator().getIndex()]) this['startCapPoint1' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('purple');
  //this['startCapPoint1' + this.getIterator().getIndex()].centerX(startCapLine1X).centerY(startCapLine1Y).radius(3);
  //
  //if (!this['startCapPoint2' + this.getIterator().getIndex()]) this['startCapPoint2' + this.getIterator().getIndex()] = this.container().circle().zIndex(1000).stroke('red');
  //this['startCapPoint2' + this.getIterator().getIndex()].centerX(startCapLine2X).centerY(startCapLine2Y).radius(3);
  //
  //if (!this['startCapLine' + this.getIterator().getIndex()]) this['startCapLine' + this.getIterator().getIndex()] = this.container().path().zIndex(1000).stroke('blue');
  //this['startCapLine' + this.getIterator().getIndex()].clear().moveTo(startCapLine1X, startCapLine1Y).lineTo(startCapLine2X, startCapLine2Y);

  return [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y];
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.drawPoint = function(pointState) {
  var iterator = this.getIterator();
  var referenceValues = this.getReferenceCoords();

  if (!referenceValues)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var i, len, current_x, current_y;
    var start_x = 0;
    var start_y = 0;
    var paths = [];
    var points = [];
    var connectorsDist = [];
    var sumDist = 0;

    var controlLength, direction, finalControlLength, controlDirection;

    var userCurvature = iterator.get('curvature');
    var curvature = /** @type {number} */(goog.isDefAndNotNull(userCurvature) ? userCurvature : this.curvature());
    var userStartSize = iterator.get('startSize');
    var startSize = /** @type {number} */(goog.isDefAndNotNull(userStartSize) ? userStartSize : this.startSize());
    var userEndSize = iterator.get('endSize');
    var endSize = /** @type {number} */(goog.isDefAndNotNull(userEndSize) ? userEndSize : this.endSize());

    var needsEventHandlerPath = startSize < 10 || endSize < 10;

    for (i = 0, len = referenceValues.length; i < len; i += 2) {
      /** @type {!acgraph.vector.Path} */
      var path = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
      path.clear();

      current_x = referenceValues[i];
      current_y = referenceValues[i + 1];

      /** @type {acgraph.vector.Path} */
      var eventHandlerPath;
      if (needsEventHandlerPath) {
        eventHandlerPath = /** @type {!acgraph.vector.Path} */(this.rootElement.genNextChild());
        eventHandlerPath.clear();
      }

      if (!isNaN(current_x) && !isNaN(current_y)) {
        if (i != 0) {
          var vertical, horizontal, angle, r;
          //distance between start and end points.
          var dist = Math.sqrt(Math.pow(start_x - current_x, 2) + Math.pow(start_y - current_y, 2));
          //Current curve deflection (Maximum = dist / 2 with ratio = 1).
          var pixCurrCurveValue = (dist / 2) * curvature;

          //Coordinates of the center of the shortest path between start and end points..
          var cx = (start_x + current_x) / 2;
          var cy = (start_y + current_y) / 2;

          //calc angle between shortest path from start to end point and horizontal line (normal).
          horizontal = Math.sqrt(Math.pow(start_x - current_x, 2));
          vertical = Math.sqrt(Math.pow(start_y - current_y, 2));
          var anglePathNormal = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

          var directionRltAngle = 1;
          var curvatureBasePointAngle;
          if (current_x < start_x && current_y < start_y) {
            curvatureBasePointAngle = anglePathNormal - 90;
          } else if (current_x < start_x && current_y > start_y) {
            curvatureBasePointAngle = 270 - anglePathNormal;
          } else if (current_x > start_x && current_y > start_y) {
            curvatureBasePointAngle = anglePathNormal - 90;
            directionRltAngle = -1;
          } else if (current_x > start_x && current_y < start_y) {
            curvatureBasePointAngle = 180 - anglePathNormal + 90;
            directionRltAngle = -1;
          }

          //Base point for curvature of the vertex side
          var curveBasePointX = cx + Math.cos(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrCurveValue * 1.2;
          var curveBasePointY = cy + Math.sin(goog.math.toRadians(/** @type {number} */(curvatureBasePointAngle))) * pixCurrCurveValue * 1.2;

          controlLength = dist / 2 * curvature;
          direction = curvature > 0 ? 1 : -1;
          finalControlLength = Math.abs(controlLength) < dist / 4 ? dist / 4 * direction : Math.abs(controlLength) > dist / 2 ? dist / 2 * direction : controlLength;

          controlDirection = (curvature < 0 ? 90 : -90) * directionRltAngle;
          angle = goog.math.toRadians(curvatureBasePointAngle + controlDirection);
          //First control point of cubic curve
          var control1x = curveBasePointX + Math.cos(angle) * finalControlLength;
          var control1y = curveBasePointY + Math.sin(angle) * finalControlLength;

          controlDirection = (curvature < 0 ? -90 : 90) * directionRltAngle;
          angle = goog.math.toRadians(curvatureBasePointAngle + controlDirection);
          //First control point of cubic curve
          var control2x = curveBasePointX + Math.cos(angle) * finalControlLength;
          var control2y = curveBasePointY + Math.sin(angle) * finalControlLength;

          //todo (blackart) shapes for debug, don't remove.
          //if (!this['shortestPath' + this.getIterator().getIndex()]) this['shortestPath' + this.getIterator().getIndex()] = this.container().path().zIndex(1000);
          //this['shortestPath' + this.getIterator().getIndex()].clear().moveTo(start_x, start_y).lineTo(current_x, current_y);
          //
          //if (!this['curveBasePoint_' + this.getIterator().getIndex()]) this['curveBasePoint_' + this.getIterator().getIndex()] = this.container().circle().stroke('red').zIndex(1000);
          //this['curveBasePoint_' + this.getIterator().getIndex()].centerX(curveBasePointX).centerY(curveBasePointY).radius(3);
          //
          //if (!this['cx' + this.getIterator().getIndex()]) this['cx' + this.getIterator().getIndex()] = this.container().circle().stroke('green').zIndex(1000);
          //this['cx' + this.getIterator().getIndex()].centerX(cx).centerY(cy).radius(3);
          //
          //if (!this['path' + this.getIterator().getIndex()]) this['path' + this.getIterator().getIndex()] = this.container().path().zIndex(1000);
          //this['path' + this.getIterator().getIndex()].clear().moveTo(curveBasePointX, curveBasePointY).lineTo(cx, cy);

          var connectorParams = this.drawConnector_(
              path,
              start_x,
              start_y,
              current_x,
              current_y,
              control1x,
              control1y,
              control2x,
              control2y,
              startSize,
              endSize,
              curvature,
              directionRltAngle,
              /** @type {number} */(curvatureBasePointAngle));


          this.makeInteractive(path);
          paths.push(path);


          var eventHandlerParams;
          if (needsEventHandlerPath) {
            eventHandlerParams = this.drawConnector_(
                eventHandlerPath,
                start_x,
                start_y,
                current_x,
                current_y,
                control1x,
                control1y,
                control2x,
                control2y,
                this.eventHandlerPathWidth_,
                this.eventHandlerPathWidth_,
                curvature,
                directionRltAngle,
                /** @type {number} */(curvatureBasePointAngle));
            this.makeInteractive(/** @type {acgraph.vector.Path} */(eventHandlerPath));
            eventHandlerPath.fill(anychart.color.TRANSPARENT_HANDLER).stroke(null);
          }

          points.push.apply(points, connectorParams);
          connectorsDist.push(dist);
          sumDist += dist;
        }

        start_x = referenceValues[i];
        start_y = referenceValues[i + 1];
      }
    }

    this.getIterator()
        .meta('shape', paths)
        .meta('points', points)
        .meta('sumDist', sumDist)
        .meta('connectorsDist', connectorsDist);

    this.colorizeShape(pointState | this.state.getSeriesState());
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (shape) {
      var hatchFillShapes = [];
      for (i = 0, len = shape.length; i < len; i++) {
        var shape_ = shape[i];
        var hatchFillShape = this.hatchFillRootElement ? /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) : null;

        if (goog.isDef(shape_) && hatchFillShape) {
          hatchFillShape.deserialize(shape_.serialize());
          hatchFillShapes.push(hatchFillShape);
        }
      }
      if (hatchFillShapes.length) {
        iterator.meta('hatchFillShape', hatchFillShapes);
        this.applyHatchFill(pointState | this.state.getSeriesState());
      }
    }
  }

  anychart.core.map.series.Connector.base(this, 'drawPoint', pointState);

  this.applyZoomMoveTransform();
};


/** @inheritDoc */
anychart.core.map.series.Connector.prototype.finalizeDrawing = function() {
  anychart.core.map.series.Connector.base(this, 'finalizeDrawing');
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.map.series.Connector.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    for (var i = 0, len = shape.length; i < len; i++) {
      var stroke, fill;
      var shape_ = shape[i];

      fill = this.getFinalFill(true, pointState);
      stroke = this.getFinalStroke(true, pointState);

      shape_.stroke(stroke, 2, 'none', acgraph.vector.StrokeLineJoin.ROUND);
      shape_.fill(fill);
    }
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.map.series.Connector.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    var fill = this.getFinalHatchFill(true, pointState);
    for (var i = 0, len = hatchFillShape.length; i < len; i++) {
      hatchFillShape[i]
          .stroke(null)
          .fill(fill);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.core.map.series.Connector.prototype.serialize = function() {
  var json = anychart.core.map.series.Connector.base(this, 'serialize');

  json['endSize'] = this.endSize();
  json['startSize'] = this.startSize();
  json['curvature'] = this.curvature();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.map.series.Connector.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.map.series.Connector.base(this, 'setupByJSON', config, opt_default);

  this.endSize(config['endSize']);
  this.startSize(config['startSize']);
  this.curvature(config['curvature']);
};


//exports
(function() {
  var proto = anychart.core.map.series.Connector.prototype;
  proto['fill'] = proto.fill;//inherited
  proto['hoverFill'] = proto.hoverFill;//inherited
  proto['selectFill'] = proto.selectFill;//inherited

  proto['stroke'] = proto.stroke;//inherited
  proto['hoverStroke'] = proto.hoverStroke;//inherited
  proto['selectStroke'] = proto.selectStroke;//inherited

  proto['hatchFill'] = proto.hatchFill;//inherited
  proto['hoverHatchFill'] = proto.hoverHatchFill;//inherited
  proto['selectHatchFill'] = proto.selectHatchFill;//inherited

  proto['endSize'] = proto.endSize;
  proto['startSize'] = proto.startSize;
  proto['curvature'] = proto.curvature;
})();
