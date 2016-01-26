goog.provide('anychart.core.cartesian.series.SplineArea');

goog.require('anychart.core.cartesian.series.AreaBase');
goog.require('anychart.core.cartesian.series.SplineDrawer');



/**
 * Define SplineArea series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#splineArea} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.AreaBase}
 */
anychart.core.cartesian.series.SplineArea = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  this.needsZero = true;

  /**
   * Spline drawer.
   * @type {!anychart.core.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.cartesian.series.SplineDrawer(this.path);
};
goog.inherits(anychart.core.cartesian.series.SplineArea, anychart.core.cartesian.series.AreaBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.SPLINE_AREA] = anychart.core.cartesian.series.SplineArea;


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    this.finalizeSegment();
    this.queue_.resetDrawer(false);
    this.queue_.setStrokePath(this.strokePath);
    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);
    this.queue_.processPoint(x, y);

    if (this.drawingPlan.stacked) {
      this.zeroesStack = [x, zero, this.iterator.meta('zeroMissing')];
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));

    this.queue_.processPoint(x, y);

    if (this.drawingPlan.stacked) {
      this.zeroesStack.push(x, zero, this.iterator.meta('zeroMissing'));
    } else {
      this.lastDrawnX = x;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.SplineArea.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
  this.queue_.setStrokePath(null);
  if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  } else if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (firstPoint) {
        this.queue_.resetDrawer(true);
        this.path.lineTo(x, y);
        if (!isMissing)
          this.queue_.processPoint(x, y);
        firstPoint = false;
      } else if (isMissing && prevWasMissing) {
        this.path.lineTo(x, y);
      } else if (isMissing) {
        this.queue_.finalizeProcessing();
        this.queue_.resetDrawer(true);
        this.path.lineTo(prevX, y);
        this.path.lineTo(x, y);
      } else if (prevWasMissing) {
        this.path.lineTo(x, prevY);
        this.path.lineTo(x, y);
        this.queue_.processPoint(x, y);
      } else {
        this.queue_.processPoint(x, y);
      }
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.queue_.finalizeProcessing();
    this.zeroesStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.SplineArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.SPLINE_AREA;
};


//anychart.core.cartesian.series.SplineArea.prototype['startDrawing'] = anychart.core.cartesian.series.SplineArea.prototype.startDrawing;//inherited
//exports
anychart.core.cartesian.series.SplineArea.prototype['fill'] = anychart.core.cartesian.series.SplineArea.prototype.fill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverFill'] = anychart.core.cartesian.series.SplineArea.prototype.hoverFill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['selectFill'] = anychart.core.cartesian.series.SplineArea.prototype.selectFill;//inherited

anychart.core.cartesian.series.SplineArea.prototype['stroke'] = anychart.core.cartesian.series.SplineArea.prototype.stroke;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverStroke'] = anychart.core.cartesian.series.SplineArea.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.SplineArea.prototype['selectStroke'] = anychart.core.cartesian.series.SplineArea.prototype.selectStroke;//inherited

anychart.core.cartesian.series.SplineArea.prototype['hatchFill'] = anychart.core.cartesian.series.SplineArea.prototype.hatchFill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['hoverHatchFill'] = anychart.core.cartesian.series.SplineArea.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.SplineArea.prototype['selectHatchFill'] = anychart.core.cartesian.series.SplineArea.prototype.selectHatchFill;//inherited
