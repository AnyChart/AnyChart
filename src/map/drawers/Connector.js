goog.provide('anychart.mapModule.drawers.Connector');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Area drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.mapModule.drawers.Connector = function(series) {
  anychart.mapModule.drawers.Connector.base(this, 'constructor', series);

  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.curvatureGetter_ = anychart.core.series.Base.getSettingsResolver(
      'curvature',
      anychart.utils.toNumber,
      false,
      'curvature');
  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.startSizeGetter_ = anychart.core.series.Base.getSettingsResolver(
      'startSize',
      anychart.core.settings.numberNormalizer,
      false,
      'startSize');
  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.endSizeGetter_ = anychart.core.series.Base.getSettingsResolver(
      'endSize',
      anychart.core.settings.numberNormalizer,
      false,
      'endSize');

  /**
   * Width of path for handle events. Used for cases when base connector path very narrow.
   * @type {number}
   * @private
   */
  this.eventHandlerPathWidth_ = 20;
};
goog.inherits(anychart.mapModule.drawers.Connector, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.CONNECTOR] = anychart.mapModule.drawers.Connector;


/** @inheritDoc */
anychart.mapModule.drawers.Connector.prototype.type = anychart.enums.SeriesDrawerTypes.CONNECTOR;


/** @inheritDoc */
anychart.mapModule.drawers.Connector.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.mapModule.drawers.Connector.prototype.yValueNames = (function () { return ['points']; })();


/** @inheritDoc */
anychart.mapModule.drawers.Connector.prototype.requiredShapes = (function() {
  var res = {};
  res['path'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.mapModule.drawers.Connector.prototype.drawSubsequentPoint = function(point, state) {
  var startSize = /** @type {number} */(this.startSizeGetter_(this.series, point, state));
  var endSize = /** @type {number} */(this.endSizeGetter_(this.series, point, state));

  var shapeNames = {};
  shapeNames['eventHandler'] = startSize < 10 || endSize < 10;
  shapeNames['path'] = true;
  shapeNames['hatchFill'] = true;

  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state, shapeNames));
  this.drawPoint_(point, shapes, startSize, endSize);
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @param {anychart.data.IRowInfo} iterator .
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.mapModule.drawers.Connector.prototype.getReferenceCoords = function(iterator) {
  var refValues = this.getYValueNames();

  var scale = /** @type {anychart.mapModule.scales.Geo} */(this.series.getChart().scale());

  var points = iterator.get(refValues[0]);
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
anychart.mapModule.drawers.Connector.prototype.drawConnector_ = function(path, start_x, start_y, current_x, current_y, control1x, control1y, control2x, control2y, startSize, endSize, curvature, directionRltAngle, curvatureBasePointAngle) {
  var vertical, horizontal, angle, r;
  var controlLength, direction, finalControlLength, controlDirection;

  //calc angle between control line (from end to control1 point) and horizontal line (normal).
  horizontal = Math.abs(current_x - control1x);
  vertical = Math.abs(current_y - control1y);
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
  horizontal = Math.abs(start_x - control2x);
  vertical = Math.abs(start_y - control2y);
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
  var topDist = anychart.math.vectorLength(startCapLine1X, startCapLine1Y, endCapLine1X, endCapLine1Y);
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
  var bottomDist = anychart.math.vectorLength(startCapLine2X, startCapLine2Y, endCapLine2X, endCapLine2Y);
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


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point .
 * @param {Object.<acgraph.vector.Shape>} shapes .
 * @param {number} startSize .
 * @param {number} endSize .
 * @private
 */
anychart.mapModule.drawers.Connector.prototype.drawPoint_ = function(point, shapes, startSize, endSize) {
  var curvature = /** @type {number} */(this.curvatureGetter_(this.series, point, 0));

  var i, len, current_x, current_y;
  var start_x = 0;
  var start_y = 0;
  var points = [];
  var connectorsDist = [];
  var sumDist = 0;

  var controlLength, direction, finalControlLength, controlDirection;
  var needsEventHandlerPath = startSize < 10 || endSize < 10;

  var referenceValues = this.getReferenceCoords(point);

  for (i = 0, len = referenceValues.length; i < len; i += 2) {
    /** @type {!acgraph.vector.Path} */
    var path = /** @type {!acgraph.vector.Path} */(shapes['path']);
    var hatchFillPath = /** @type {!acgraph.vector.Path} */(shapes['hatchFill']);

    current_x = referenceValues[i];
    current_y = referenceValues[i + 1];

    /** @type {acgraph.vector.Path} */
    var eventHandlerPath;
    if (needsEventHandlerPath) {
      eventHandlerPath =  /** @type {acgraph.vector.Path} */(shapes['eventHandler']);
    }

    if (!isNaN(current_x) && !isNaN(current_y)) {
      if (i != 0) {
        var vertical, horizontal, angle;
        //distance between start and end points.
        var dist = anychart.math.vectorLength(start_x, start_y, current_x, current_y);
        //Current curve deflection (Maximum = dist / 2 with ratio = 1).
        var pixCurrCurveValue = (dist / 2) * curvature;

        //Coordinates of the center of the shortest path between start and end points..
        var cx = (start_x + current_x) / 2;
        var cy = (start_y + current_y) / 2;

        //calc angle between shortest path from start to end point and horizontal line (normal).
        horizontal = Math.abs(start_x - current_x);
        vertical = Math.abs(start_y - current_y);
        var anglePathNormal = anychart.math.round(goog.math.toDegrees(Math.atan(vertical / horizontal)), 7);

        var directionRltAngle = 1;
        var curvatureBasePointAngle;
        if (current_x <= start_x && current_y <= start_y) {
          curvatureBasePointAngle = anglePathNormal - 90;
        } else if (current_x <= start_x && current_y >= start_y) {
          curvatureBasePointAngle = 270 - anglePathNormal;
        } else if (current_x >= start_x && current_y >= start_y) {
          curvatureBasePointAngle = anglePathNormal - 90;
          directionRltAngle = -1;
        } else if (current_x >= start_x && current_y <= start_y) {
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

        if (needsEventHandlerPath) {
          this.drawConnector_(
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
        }

        hatchFillPath.deserialize(path.serializePathArgs());
        points.push.apply(points, connectorParams);
        connectorsDist.push(dist);
        sumDist += dist;
      }

      start_x = referenceValues[i];
      start_y = referenceValues[i + 1];
    }
  }

  point
      .meta('points', points)
      .meta('sumDist', sumDist)
      .meta('connectorsDist', connectorsDist);
};

