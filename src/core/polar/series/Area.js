goog.provide('anychart.core.polar.series.Area');

goog.require('anychart.core.polar.series.ContinuousBase');
goog.require('anychart.core.utils.TypedLayer');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.charts.Polar#area}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.polar.series.ContinuousBase}
 */
anychart.core.polar.series.Area = function(opt_data, opt_csvSettings) {
  anychart.core.polar.series.Area.base(this, 'constructor', opt_data, opt_csvSettings);

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.currentStrokePath;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.currentFillPath;

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @protected
   */
  this.fillLayer;

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @protected
   */
  this.strokeLayer;

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @protected
   */
  this.hatchFillLayer;
};
goog.inherits(anychart.core.polar.series.Area, anychart.core.polar.series.ContinuousBase);
anychart.core.polar.series.Base.SeriesTypesMap[anychart.enums.PolarSeriesType.AREA] = anychart.core.polar.series.Area;


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.startDrawing = function() {
  anychart.core.polar.series.Area.base(this, 'startDrawing');

  this.currentStrokePath = null;
  this.currentFillPath = null;

  if (this.fillLayer) {
    this.fillLayer.clear();
  } else {
    this.fillLayer = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      this.makeInteractive(path, true);
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
    }, undefined, this);
    this.fillLayer.zIndex(anychart.core.polar.series.Base.ZINDEX_SERIES);
    this.fillLayer.parent(this.rootLayer);
  }


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


  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillLayer) {
      this.hatchFillLayer.clear();
    } else {
      this.hatchFillLayer = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.hatchFillLayer.parent(this.rootLayer);
      this.hatchFillLayer.zIndex(anychart.core.polar.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillLayer.disablePointerEvents(true);
    }
  }
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.drawFirstPoint = function(pointState) {
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
        this.currentFillPath = /** @type {acgraph.vector.Path} */(this.fillLayer.genNextChild());
        this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
      }
    }

    if (!this.currentFillPath) this.currentFillPath = /** @type {acgraph.vector.Path} */(this.fillLayer.genNextChild());
    if (!this.currentStrokePath) this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());

    var x = valuePoint[valuePoint.length - 2];
    var y = valuePoint[valuePoint.length - 1];

    this.currentFillPath
        .moveTo(this.cx, this.cy)
        .lineTo(x, y);
    this.currentStrokePath
        .moveTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.drawSubsequentPoint = function(pointState) {
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

        this.currentFillPath = /** @type {acgraph.vector.Path} */(this.fillLayer.genNextChild());
        this.currentFillPath.moveTo(this.cx, this.cy).lineTo(startX, startY);
      }
      P2x = valuePoint[i + 3];
      P2y = valuePoint[i + 4];
      P3x = valuePoint[i + 5];
      P3y = valuePoint[i + 6];
      P4x = valuePoint[i + 7];
      P4y = valuePoint[i + 8];

      this.currentFillPath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
      this.currentStrokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
    }

    this.getIterator().meta('x', P4x).meta('value', P4y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.firstPointIsMissing &&
        this.closed() &&
        goog.isDefAndNotNull(this.prevValuePointCoords) &&
        goog.isDefAndNotNull(this.firstValuePointCoords)) {

      var valuePoint = this.approximateCurve(this.prevValuePointCoords, this.firstValuePointCoords, false);
      if (!valuePoint) {
        this.currentFillPath.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
        this.currentStrokePath.lineTo(this.firstValuePointCoords[0], this.firstValuePointCoords[1]);
      } else {
        var P2x, P2y, P3x, P3y, P4x, P4y;
        for (var i = 0, len = valuePoint.length; i < len; i += 9) {
          if (valuePoint[i]) {
            var startX = valuePoint[i + 1];
            var startY = valuePoint[i + 2];

            this.currentStrokePath = /** @type {acgraph.vector.Path} */(this.strokeLayer.genNextChild());
            this.currentStrokePath.moveTo(startX, startY);

            this.currentFillPath = /** @type {acgraph.vector.Path} */(this.fillLayer.genNextChild());
            this.currentFillPath.moveTo(this.cx, this.cy).lineTo(startX, startY);
          }
          P2x = valuePoint[i + 3];
          P2y = valuePoint[i + 4];
          P3x = valuePoint[i + 5];
          P3y = valuePoint[i + 6];
          P4x = valuePoint[i + 7];
          P4y = valuePoint[i + 8];

          this.currentFillPath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
          this.currentStrokePath.curveTo(P2x, P2y, P3x, P3y, P4x, P4y);
        }
      }
    }
  }

  anychart.core.polar.series.Area.base(this, 'finalizeDrawing');
};


/**
 * @inheritDoc
 */
anychart.core.polar.series.Area.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.AREA;
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.colorizeShape = function(pointState) {
  var fill = this.getFinalFill(false, pointState);
  var stroke = this.getFinalStroke(false, pointState);

  this.fillLayer.forEachChild(function(path) {
    path.stroke(null);
    path.fill(fill);
  }, this);

  this.strokeLayer.forEachChild(function(path) {
    path.stroke(stroke);
    path.fill(null);
  }, this);
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillLayer) {
      this.fillLayer.forEachChild(function(path) {
        /** @type {acgraph.vector.Path} */(this.hatchFillLayer.genNextChild()).deserialize(path.serialize());
      }, this);
      var seriesState = this.state.getSeriesState();
      this.applyHatchFill(seriesState);
    }
  }
};


/** @inheritDoc */
anychart.core.polar.series.Area.prototype.applyHatchFill = function(pointState) {
  if (this.hatchFillLayer) {
    this.hatchFillLayer.forEachChild(function(path) {
      path.stroke(null);
      path.fill(this.getFinalHatchFill(false, pointState));
    }, this);
  }
};


/**
 * @inheritDoc
 */
anychart.core.polar.series.Area.prototype.setupByJSON = function(config, opt_default) {
  return anychart.core.polar.series.Area.base(this, 'setupByJSON', config, opt_default);
};


//exports
(function() {
  var proto = anychart.core.polar.series.Area.prototype;
  proto['fill'] = proto.fill;//inherited
  proto['hoverFill'] = proto.hoverFill;//inherited
  proto['selectFill'] = proto.selectFill;//inherited
  proto['stroke'] = proto.stroke;//inherited
  proto['hoverStroke'] = proto.hoverStroke;//inherited
  proto['selectStroke'] = proto.selectStroke;//inherited
  proto['hatchFill'] = proto.hatchFill;//inherited
  proto['hoverHatchFill'] = proto.hoverHatchFill;//inherited
  proto['selectHatchFill'] = proto.selectHatchFill;//inherited
  proto['finalizeDrawing'] = proto.finalizeDrawing;//inherited
  proto['getType'] = proto.getType;
})();
