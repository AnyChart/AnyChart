goog.provide('anychart.core.cartesian.series.AreaBase');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.ContinuousBase');



/**
 * A base for all continuous areas series as area, spline area.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousBase}
 */
anychart.core.cartesian.series.AreaBase = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.strokePath = acgraph.path();
  this.strokePath.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.strokePath);
};
goog.inherits(anychart.core.cartesian.series.AreaBase, anychart.core.cartesian.series.ContinuousBase);


/**
 * Last drawn X in case of non-stacked scalthis.pathse, NaN otherwise.
 * @type {number}
 * @protected
 */
anychart.core.cartesian.series.AreaBase.prototype.lastDrawnX;


/**
 * Pairs of zero coords + missing or not (boolean) in case of stacked y scale.
 * E.g. [x1:number, zeroY1:number, isMissing1:boolean, x2:number, zeroY2:number, isMissing2:boolean, ...]
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.core.cartesian.series.AreaBase.prototype.zeroesStack;


/** @inheritDoc */
anychart.core.cartesian.series.AreaBase.prototype.isAreaBased = function() {
  return true;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.AreaBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // No points were drawn before
  this.zeroesStack = null;
  this.lastDrawnX = NaN;
};


/** @inheritDoc */
anychart.core.cartesian.series.AreaBase.prototype.colorizeShape = function(pointState) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, pointState));
  this.strokePath.stroke(this.getFinalStroke(false, pointState));
  this.strokePath.fill(null);
};


/** @inheritDoc */
anychart.core.cartesian.series.AreaBase.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());

      var seriesState = this.state.getSeriesState();
      this.applyHatchFill(seriesState);
    }
  }
};
