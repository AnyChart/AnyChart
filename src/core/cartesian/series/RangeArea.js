goog.provide('anychart.core.cartesian.series.RangeArea');

goog.require('anychart.core.cartesian.series.ContinuousRangeBase');



/**
 * Define RangeArea series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#rangeArea} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousRangeBase}
 */
anychart.core.cartesian.series.RangeArea = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference points for a series
  this.yValueNames = ['low', 'high'];
  this.seriesSupportsStack = false;
};
goog.inherits(anychart.core.cartesian.series.RangeArea, anychart.core.cartesian.series.ContinuousRangeBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.RANGE_AREA] = anychart.core.cartesian.series.RangeArea;


/** @inheritDoc */
anychart.core.cartesian.series.RangeArea.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var high = /** @type {number} */(this.iterator.meta('high'));
    var low = /** @type {number} */(this.iterator.meta('low'));

    this.path
        .moveTo(x, low)
        .lineTo(x, high);
    this.highPath
        .moveTo(x, high);

    this.lowsStack = [x, low];
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeArea.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var high = /** @type {number} */(this.iterator.meta('high'));
    var low = /** @type {number} */(this.iterator.meta('low'));

    this.path.lineTo(x, high);
    this.highPath.lineTo(x, high);

    this.lowsStack.push(x, low);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.RangeArea.prototype.finalizeSegment = function() {
  if (this.lowsStack) {
    /** @type {boolean} */
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i]);
      this.path.lineTo(x, y);
      if (first) {
        this.lowPath.moveTo(x, y);
        first = false;
      } else {
        this.lowPath.lineTo(x, y);
      }
    }
    this.path.close();
    this.lowsStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.RangeArea.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.RANGE_AREA;
};


//exports
anychart.core.cartesian.series.RangeArea.prototype['fill'] = anychart.core.cartesian.series.RangeArea.prototype.fill;//inherited
anychart.core.cartesian.series.RangeArea.prototype['hoverFill'] = anychart.core.cartesian.series.RangeArea.prototype.hoverFill;//inherited
anychart.core.cartesian.series.RangeArea.prototype['selectFill'] = anychart.core.cartesian.series.RangeArea.prototype.selectFill;//inherited

anychart.core.cartesian.series.RangeArea.prototype['highStroke'] = anychart.core.cartesian.series.RangeArea.prototype.highStroke;//inherited
anychart.core.cartesian.series.RangeArea.prototype['hoverHighStroke'] = anychart.core.cartesian.series.RangeArea.prototype.hoverHighStroke;//inherited
anychart.core.cartesian.series.RangeArea.prototype['selectHighStroke'] = anychart.core.cartesian.series.RangeArea.prototype.selectHighStroke;//inherited

anychart.core.cartesian.series.RangeArea.prototype['lowStroke'] = anychart.core.cartesian.series.RangeArea.prototype.lowStroke;//inherited
anychart.core.cartesian.series.RangeArea.prototype['hoverLowStroke'] = anychart.core.cartesian.series.RangeArea.prototype.hoverLowStroke;//inherited
anychart.core.cartesian.series.RangeArea.prototype['selectLowStroke'] = anychart.core.cartesian.series.RangeArea.prototype.selectLowStroke;//inherited

anychart.core.cartesian.series.RangeArea.prototype['hatchFill'] = anychart.core.cartesian.series.RangeArea.prototype.hatchFill;//inherited
anychart.core.cartesian.series.RangeArea.prototype['hoverHatchFill'] = anychart.core.cartesian.series.RangeArea.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.RangeArea.prototype['selectHatchFill'] = anychart.core.cartesian.series.RangeArea.prototype.selectHatchFill;//inherited
