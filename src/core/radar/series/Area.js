goog.provide('anychart.core.radar.series.Area');

goog.require('anychart.core.radar.series.ContinuousBase');



/**
 * Define Area series type.<br/>
 * <b>Note:</b> Better for use method {@link anychart.charts.Radar#area}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.radar.series.ContinuousBase}
 */
anychart.core.radar.series.Area = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.strokePath = acgraph.path();
  this.strokePath.zIndex(anychart.core.radar.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.strokePath);

  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.core.radar.series.Area, anychart.core.radar.series.ContinuousBase);
anychart.core.radar.series.Base.SeriesTypesMap[anychart.enums.RadarSeriesType.AREA] = anychart.core.radar.series.Area;


/**
 * Last drawn X in case of non-stacked scalthis.pathse, NaN otherwise.
 * @type {number}
 * @protected
 */
anychart.core.radar.series.Area.prototype.lastDrawnX;


/**
 * @type {Object.<number>}
 * @protected
 */
anychart.core.radar.series.Area.prototype.firstDrawnZeroPoint;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.radar.series.Area.prototype.firstPointIsMissing;


/**
 * Pairs of zero coords + missing or not (boolean) in case of stacked y scale.
 * E.g. [x1:number, zeroY1:number, isMissing1:boolean, x2:number, zeroY2:number, isMissing2:boolean, ...]
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.core.radar.series.Area.prototype.zeroesStack;


/**
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.core.radar.series.Area.prototype.firstMissings;


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var zeroMissing = this.yScale().isStackValMissing();
    var zeroPoint = this.getZeroPointCoords();
    var valuePoint = this.getValuePointCoords();

    var xZero = zeroPoint[0];
    var yZero = zeroPoint[1];

    if (!goog.isDef(this.firstPointIsMissing))
      this.firstPointIsMissing = !valuePoint || !zeroPoint;

    if (!valuePoint || !zeroPoint) {
      if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE && !valuePoint && !this.firstDrawnPoint) {
        if (!this.firstMissings) this.firstMissings = [];
        this.firstMissings.push(xZero, yZero, zeroMissing);
      }
      return false;
    }

    this.finalizeSegment();

    var x = valuePoint[0];
    var y = valuePoint[1];

    if (!goog.isDefAndNotNull(this.firstDrawnPoint)) {
      this.firstDrawnPoint = {x: x, y: y};
      this.firstDrawnZeroPoint = {x: xZero, y: yZero};
    }

    this.path
        .moveTo(xZero, yZero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack = [xZero, yZero, zeroMissing];

    this.getIterator().meta('x', x).meta('value', y).meta('xZero', xZero).meta('yZero', yZero);
  }

  return true;
};


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {

    var zeroMissing = this.yScale().isStackValMissing();
    var zeroPoint = this.getZeroPointCoords();
    var valuePoint = this.getValuePointCoords();

    if (zeroPoint) {
      var xZero = zeroPoint[0];
      var yZero = zeroPoint[1];

      if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE) {
        if (valuePoint || this.connectMissing) this.zeroesStack.push(xZero, yZero, zeroMissing);
      }
    }

    if (!valuePoint || !zeroPoint) {
      return false;
    }

    var x = valuePoint[0];
    var y = valuePoint[1];

    this.path.lineTo(x, y);
    this.strokePath.lineTo(x, y);

    if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE)
      this.lastDrawnX = x;

    this.getIterator().meta('x', x).meta('value', y).meta('xZero', xZero).meta('yZero', yZero);
  }

  return true;
};


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.finalizeSegment = function() {
  if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i - 0]);

      if (isMissing && !isNaN(prevX))
        this.path.lineTo(prevX, y);
      //else if (prevWasMissing && !isNaN(prevY))
      //  this.path.lineTo(x, prevY);

      this.path.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.path.close();
    this.zeroesStack = null;
  }
};


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.finalizeDrawing = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.connectMissing || !this.firstPointIsMissing) {

      if (goog.isDefAndNotNull(this.firstDrawnPoint)) {
        this.path.lineTo(this.firstDrawnPoint.x, this.firstDrawnPoint.y);
        this.strokePath.lineTo(this.firstDrawnPoint.x, this.firstDrawnPoint.y);

        if (this.zeroesStack) {
          if (this.firstMissings) goog.array.extend(this.zeroesStack, this.firstMissings);

          if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE)
            this.zeroesStack.push(this.firstDrawnZeroPoint.x, this.firstDrawnZeroPoint.y, false);
        }
      }
    }
  }

  goog.base(this, 'finalizeDrawing');
};


/**
 * @inheritDoc
 */
anychart.core.radar.series.Area.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.AREA;
};


/**
 * @inheritDoc
 */
anychart.core.radar.series.Area.prototype.startDrawing = function() {
  // No points were drawn before
  this.firstMissings = null;
  this.firstDrawnZeroPoint = null;
  delete this.firstPointIsMissing;
  this.zeroesStack = null;
  this.lastDrawnX = NaN;

  goog.base(this, 'startDrawing');
};


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.colorizeShape = function(pointState) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, pointState));
  this.strokePath.stroke(this.getFinalStroke(false, pointState));
  this.strokePath.fill(null);
};


/** @inheritDoc */
anychart.core.radar.series.Area.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());

      var seriesState = this.state.getSeriesState();
      this.applyHatchFill(seriesState);
    }
  }
};


//anychart.core.radar.series.Area.prototype['startDrawing'] = anychart.core.radar.series.Area.prototype.startDrawing;
//anychart.core.radar.series.Area.prototype['finalizeDrawing'] = anychart.core.radar.series.Area.prototype.finalizeDrawing;
//exports
anychart.core.radar.series.Area.prototype['fill'] = anychart.core.radar.series.Area.prototype.fill;//inherited
anychart.core.radar.series.Area.prototype['hoverFill'] = anychart.core.radar.series.Area.prototype.hoverFill;//inherited
anychart.core.radar.series.Area.prototype['selectFill'] = anychart.core.radar.series.Area.prototype.selectFill;//inherited

anychart.core.radar.series.Area.prototype['stroke'] = anychart.core.radar.series.Area.prototype.stroke;//inherited
anychart.core.radar.series.Area.prototype['hoverStroke'] = anychart.core.radar.series.Area.prototype.hoverStroke;//inherited
anychart.core.radar.series.Area.prototype['selectStroke'] = anychart.core.radar.series.Area.prototype.selectStroke;//inherited

anychart.core.radar.series.Area.prototype['hatchFill'] = anychart.core.radar.series.Area.prototype.hatchFill;//inherited
anychart.core.radar.series.Area.prototype['hoverHatchFill'] = anychart.core.radar.series.Area.prototype.hoverHatchFill;//inherited
anychart.core.radar.series.Area.prototype['selectHatchFill'] = anychart.core.radar.series.Area.prototype.selectHatchFill;//inherited
anychart.core.radar.series.Area.prototype['getType'] = anychart.core.radar.series.Area.prototype.getType;
