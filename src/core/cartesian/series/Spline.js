goog.provide('anychart.core.cartesian.series.Spline');

goog.require('anychart.core.cartesian.series.ContinuousBase');
goog.require('anychart.core.cartesian.series.SplineDrawer');



/**
 * Define Spline series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#spline} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousBase}
 */
anychart.core.cartesian.series.Spline = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.seriesSupportsStack = false;

  /**
   * Spline drawer.
   * @type {!anychart.core.cartesian.series.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.cartesian.series.SplineDrawer(this.path);

  // legacy
  this.stroke(function() {
    return this['sourceColor'];
  });
  this.hoverStroke(function() {
    return anychart.color.lighten(this['sourceColor']);
  });
};
goog.inherits(anychart.core.cartesian.series.Spline, anychart.core.cartesian.series.ContinuousBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.SPLINE] = anychart.core.cartesian.series.Spline;


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.queue_.rtl(!!(this.xScale() && this.xScale().inverted()));
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    this.finalizeSegment();
    this.queue_.resetDrawer(false);
    this.path.moveTo(x, y);
    this.queue_.processPoint(x, y);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    this.queue_.processPoint(x, y);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, anychart.PointState.NORMAL);
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.finalizeSegment = function() {
  this.queue_.finalizeProcessing();
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Spline.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.SPLINE;
};


/** @inheritDoc */
anychart.core.cartesian.series.Spline.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


//exports
anychart.core.cartesian.series.Spline.prototype['stroke'] = anychart.core.cartesian.series.Spline.prototype.stroke;//inherited
anychart.core.cartesian.series.Spline.prototype['hoverStroke'] = anychart.core.cartesian.series.Spline.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.Spline.prototype['selectStroke'] = anychart.core.cartesian.series.Spline.prototype.selectStroke;//inherited
