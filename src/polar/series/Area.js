goog.provide('anychart.polar.series.Area');

goog.require('anychart.polar.series.ContinuousBase');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.polar.Chart#area} or {@link anychart.Chart#areaChart}.
 * @example
 * anychart.polar.series.area([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.polar.series.ContinuousBase}
 */
anychart.polar.series.Area = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.strokePath = acgraph.path();
  this.strokePath.zIndex(anychart.polar.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.strokePath);
};
goog.inherits(anychart.polar.series.Area, anychart.polar.series.ContinuousBase);
anychart.polar.series.Base.SeriesTypesMap[anychart.enums.PolarSeriesType.AREA] = anychart.polar.series.Area;


/** @inheritDoc */
anychart.polar.series.Area.prototype.drawFirstPoint = function() {
  var valuePoint = this.getValuePointCoords();

  if (!valuePoint) {
    if (!goog.isDefAndNotNull(this.firstPointIsMissing)) this.firstPointIsMissing = true;
    return false;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!goog.isDefAndNotNull(this.firstPointIsMissing) || (this.closed() && this.connectMissing)) {
      this.firstValuePointCoords = this.prevValuePointCoords.slice();
      this.firstPointIsMissing = false;
    }

    var x = valuePoint[4];
    var y = valuePoint[5];

    this.path
        .moveTo(this.cx, this.cy)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.polar.series.Area.prototype.drawSubsequentPoint = function() {
  var valuePoint = this.getValuePointCoords();
  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    for (var i = 0, len = valuePoint.length; i < len; i += 6) {
      var P2x = valuePoint[i];
      var P2y = valuePoint[i + 1];
      var P3x = valuePoint[i + 2];
      var P3y = valuePoint[i + 3];
      var P4x = valuePoint[i + 4];
      var P4y = valuePoint[i + 5];

      this.path.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
      this.strokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
    }

    this.getIterator().meta('x', P4x).meta('y', P4y);
  }

  return true;
};


/** @inheritDoc */
anychart.polar.series.Area.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.firstPointIsMissing && this.closed()) {
      var valuePoint = this.approximateCurve(this.prevValuePointCoords, this.firstValuePointCoords);
      if (!valuePoint) {
        this.path.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
        this.strokePath.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
      } else {
        for (var i = 0, len = valuePoint.length; i < len; i += 6) {
          var P2x = valuePoint[i];
          var P2y = valuePoint[i + 1];
          var P3x = valuePoint[i + 2];
          var P3y = valuePoint[i + 3];
          var P4x = valuePoint[i + 4];
          var P4y = valuePoint[i + 5];

          this.path.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
          this.strokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
        }
      }
    }
  }

  goog.base(this, 'finalizeDrawing');
};


/**
 * @inheritDoc
 */
anychart.polar.series.Area.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.AREA;
};


/** @inheritDoc */
anychart.polar.series.Area.prototype.colorizeShape = function(hover) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, hover));
  this.strokePath.stroke(this.getFinalStroke(false, hover));
  this.strokePath.fill(null);
};


/** @inheritDoc */
anychart.polar.series.Area.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());
      this.applyHatchFill(false);
    }
  }
};


/** @inheritDoc */
anychart.polar.series.Area.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  this.markers(null);

  return result;
};


/**
 * @inheritDoc
 */
anychart.polar.series.Area.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for area series.
 * @example
 * anychart.polar.series.area([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.polar.series.Area} {@link anychart.polar.series.Area} instance for method chaining.
 */
anychart.polar.series.area = function(data, opt_csvSettings) {
  return new anychart.polar.series.Area(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.polar.series.area', anychart.polar.series.area);
anychart.polar.series.Area.prototype['fill'] = anychart.polar.series.Area.prototype.fill;
anychart.polar.series.Area.prototype['hoverFill'] = anychart.polar.series.Area.prototype.hoverFill;
anychart.polar.series.Area.prototype['stroke'] = anychart.polar.series.Area.prototype.stroke;
anychart.polar.series.Area.prototype['hoverStroke'] = anychart.polar.series.Area.prototype.hoverStroke;
anychart.polar.series.Area.prototype['hatchFill'] = anychart.polar.series.Area.prototype.hatchFill;
anychart.polar.series.Area.prototype['hoverHatchFill'] = anychart.polar.series.Area.prototype.hoverHatchFill;
anychart.polar.series.Area.prototype['finalizeDrawing'] = anychart.polar.series.Area.prototype.finalizeDrawing;
