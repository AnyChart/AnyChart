goog.provide('anychart.core.cartesian.series.StepLine');

goog.require('anychart.core.cartesian.series.ContinuousBase');



/**
 * Define StepLine series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#stepLine} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousBase}
 */
anychart.core.cartesian.series.StepLine = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.seriesSupportsStack = false;

  // legacy
  this.stroke(function() {
    return this['sourceColor'];
  });
  this.hoverStroke(function() {
    return anychart.color.lighten(this['sourceColor']);
  });
};
goog.inherits(anychart.core.cartesian.series.StepLine, anychart.core.cartesian.series.ContinuousBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.STEP_LINE] = anychart.core.cartesian.series.StepLine;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.StepLine.prototype.prevX_;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.StepLine.prototype.prevY_;


/** @inheritDoc */
anychart.core.cartesian.series.StepLine.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    this.path.moveTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.StepLine.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    var midX = (x + this.prevX_) / 2;
    this.path
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.StepLine.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, anychart.PointState.NORMAL);
};


/** @inheritDoc */
anychart.core.cartesian.series.StepLine.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.StepLine.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.STEP_LINE;
};


/** @inheritDoc */
anychart.core.cartesian.series.StepLine.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


//exports
anychart.core.cartesian.series.StepLine.prototype['stroke'] = anychart.core.cartesian.series.StepLine.prototype.stroke;//inherited
anychart.core.cartesian.series.StepLine.prototype['hoverStroke'] = anychart.core.cartesian.series.StepLine.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.StepLine.prototype['selectStroke'] = anychart.core.cartesian.series.StepLine.prototype.selectStroke;//inherited
