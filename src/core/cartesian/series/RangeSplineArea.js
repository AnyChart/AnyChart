goog.provide('anychart.core.cartesian.series.RangeSplineArea');

goog.require('anychart.core.cartesian.series.ContinuousRangeBase');
goog.require('anychart.core.cartesian.series.SplineDrawer');



/**
 * Define RangeSplineArea series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#rangeSplineArea} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousRangeBase}
 */
anychart.core.cartesian.series.RangeSplineArea = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference points for a series
  this.yValueNames = ['low', 'high'];
  this.seriesSupportsStack = false;

  /**
   * Spline drawer.
   * @type {!anychart.core.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.cartesian.series.SplineDrawer(this.path);
};
goog.inherits(anychart.core.cartesian.series.RangeSplineArea, anychart.core.cartesian.series.ContinuousRangeBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = anychart.core.cartesian.series.RangeSplineArea;


/** @inheritDoc */
anychart.core.cartesian.series.RangeSplineArea.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeSplineArea.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var high = /** @type {number} */(this.iterator.meta('high'));
    var low = /** @type {number} */(this.iterator.meta('low'));

    this.queue_.resetDrawer(false);
    this.queue_.setStrokePath(this.highPath);
    this.path
        .moveTo(x, low)
        .lineTo(x, high);
    this.highPath
        .moveTo(x, high);
    this.queue_.processPoint(x, high);

    this.lowsStack = [x, low];
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeSplineArea.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var high = /** @type {number} */(this.iterator.meta('high'));
    var low = /** @type {number} */(this.iterator.meta('low'));

    this.queue_.processPoint(x, high);

    this.lowsStack.push(x, low);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeSplineArea.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
  this.queue_.setStrokePath(this.lowPath);
  if (this.lowsStack) {
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i]);
      if (firstPoint) {
        this.queue_.resetDrawer(true);
        this.path.lineTo(x, y);
        this.lowPath.moveTo(x, y);
        firstPoint = false;
      }
      this.queue_.processPoint(x, y);
    }
    this.queue_.finalizeProcessing();
    this.lowsStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.RangeSplineArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA;
};


//exports
anychart.core.cartesian.series.RangeSplineArea.prototype['fill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.fill;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['hoverFill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.hoverFill;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['selectFill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.selectFill;//inherited

anychart.core.cartesian.series.RangeSplineArea.prototype['highStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.highStroke;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['hoverHighStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.hoverHighStroke;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['selectHighStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.selectHighStroke;//inherited

anychart.core.cartesian.series.RangeSplineArea.prototype['lowStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.lowStroke;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['hoverLowStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.hoverLowStroke;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['selectLowStroke'] = anychart.core.cartesian.series.RangeSplineArea.prototype.selectLowStroke;//inherited

anychart.core.cartesian.series.RangeSplineArea.prototype['hatchFill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.hatchFill;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['hoverHatchFill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.RangeSplineArea.prototype['selectHatchFill'] = anychart.core.cartesian.series.RangeSplineArea.prototype.selectHatchFill;//inherited
