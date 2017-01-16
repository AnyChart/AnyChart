goog.provide('anychart.core.polar.series.Line');

goog.require('anychart.core.polar.series.ContinuousBase');
goog.require('anychart.core.utils.TypedLayer');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.charts.Polar#line}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.polar.series.ContinuousBase}
 */
anychart.core.polar.series.Line = function(opt_data, opt_csvSettings) {
  anychart.core.polar.series.Line.base(this, 'constructor', opt_data, opt_csvSettings);
  // legacy
  this.stroke(function() {
    return this['sourceColor'];
  });
  this.hoverStroke(function() {
    return anychart.color.lighten(this['sourceColor']);
  });


  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.currentStrokePath;

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @protected
   */
  this.strokeLayer;
};
goog.inherits(anychart.core.polar.series.Line, anychart.core.polar.series.ContinuousBase);
anychart.core.polar.series.Base.SeriesTypesMap[anychart.enums.PolarSeriesType.LINE] = anychart.core.polar.series.Line;


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.startDrawing = function() {
  anychart.core.polar.series.Line.base(this, 'startDrawing');

  this.currentStrokePath = null;

  if (this.strokeLayer) {
    this.strokeLayer.clear();
  } else {
    this.strokeLayer = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      this.makeInteractive(path, true);
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    }, undefined, this);
    this.strokeLayer.zIndex(anychart.core.polar.series.Base.ZINDEX_SERIES + .1);
    this.strokeLayer.parent(this.rootLayer);
  }
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.drawFirstPoint = function(pointState) {
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

    for (var i = 0, len = valuePoint.length; i < len; i += 9) {
      if (valuePoint[i]) {
        this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
      }
    }

    var x = valuePoint[valuePoint.length - 2];
    var y = valuePoint[valuePoint.length - 1];

    if (!this.currentStrokePath) this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
    this.currentStrokePath.moveTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.drawSubsequentPoint = function(pointState) {
  var valuePoint = this.getValuePointCoords();
  if (!valuePoint)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var P2x, P2y, P3x, P3y, P4x, P4y;
    for (var i = 0, len = valuePoint.length; i < len; i += 9) {
      if (valuePoint[i]) {
        var startX = valuePoint[i + 1];
        var startY = valuePoint[i + 2];

        this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
        this.currentStrokePath.moveTo(startX, startY);
      }
      P2x = valuePoint[i + 3];
      P2y = valuePoint[i + 4];
      P3x = valuePoint[i + 5];
      P3y = valuePoint[i + 6];
      P4x = valuePoint[i + 7];
      P4y = valuePoint[i + 8];

      this.currentStrokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
    }
    this.getIterator().meta('x', P4x).meta('value', P4y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.firstPointIsMissing &&
        this.closed() &&
        goog.isDefAndNotNull(this.prevValuePointCoords) &&
        goog.isDefAndNotNull(this.firstValuePointCoords)) {

      var valuePoint = this.approximateCurve(this.prevValuePointCoords, this.firstValuePointCoords, false);

      if (!valuePoint) {
        this.currentStrokePath.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
      } else {
        var P2x, P2y, P3x, P3y, P4x, P4y;
        for (var i = 0, len = valuePoint.length; i < len; i += 9) {
          if (valuePoint[i]) {
            var startX = valuePoint[i + 1];
            var startY = valuePoint[i + 2];

            this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
            this.currentStrokePath.moveTo(startX, startY);
          }
          P2x = valuePoint[i + 3];
          P2y = valuePoint[i + 4];
          P3x = valuePoint[i + 5];
          P3y = valuePoint[i + 6];
          P4x = valuePoint[i + 7];
          P4y = valuePoint[i + 8];

          this.currentStrokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
        }
      }
    }
  }

  anychart.core.polar.series.Line.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.colorizeShape = function(pintState) {
  var stroke = this.getFinalStroke(false, pintState);

  this.strokeLayer.forEachChild(function(path) {
    path.stroke(stroke);
    path.fill(null);
  }, this);
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, anychart.PointState.NORMAL);
};


/** @inheritDoc */
anychart.core.polar.series.Line.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/**
 * @inheritDoc
 */
anychart.core.polar.series.Line.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.LINE;
};


//proto['finalizeDrawing'] = proto.finalizeDrawing;
//exports
(function() {
  var proto = anychart.core.polar.series.Line.prototype;
  proto['stroke'] = proto.stroke;//inherited
  proto['hoverStroke'] = proto.hoverStroke;//inherited
  proto['selectStroke'] = proto.selectStroke;//inherited
  proto['getType'] = proto.getType;
})();
