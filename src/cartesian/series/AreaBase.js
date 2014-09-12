goog.provide('anychart.cartesian.series.AreaBase');
goog.require('acgraph');
goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * A base for all continuous areas series as area, spline area.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.AreaBase = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.strokePath = acgraph.path();
  this.strokePath.zIndex(anychart.cartesian.series.Base.ZINDEX_SERIES + 0.1);

  this.paths.push(this.strokePath);
};
goog.inherits(anychart.cartesian.series.AreaBase, anychart.cartesian.series.ContinuousBase);


/**
 * Last drawn X in case of non-stacked scalthis.pathse, NaN otherwise.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.AreaBase.prototype.lastDrawnX;


/**
 * Pairs of zero coords + missing or not (boolean) in case of stacked y scale.
 * E.g. [x1:number, zeroY1:number, isMissing1:boolean, x2:number, zeroY2:number, isMissing2:boolean, ...]
 * @type {Array.<(number|boolean)>}
 * @protected
 */
anychart.cartesian.series.AreaBase.prototype.zeroesStack;


/**
 * @inheritDoc
 */
anychart.cartesian.series.AreaBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');

  // No points were drawn before
  this.zeroesStack = null;
  this.lastDrawnX = NaN;
};


/** @inheritDoc */
anychart.cartesian.series.AreaBase.prototype.colorizeShape = function(hover) {
  this.path.stroke(null);
  this.path.fill(this.getFinalFill(false, hover));
  this.strokePath.stroke(this.getFinalStroke(false, hover));
  this.strokePath.fill(null);
};


/** @inheritDoc */
anychart.cartesian.series.AreaBase.prototype.finalizeHatchFill = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (this.hatchFillPath) {
      this.hatchFillPath.deserialize(this.path.serialize());
      this.applyHatchFill(false);
    }
  }
};


/** @inheritDoc */
anychart.cartesian.series.AreaBase.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  this.markers(null);

  return result;
};

//exports
anychart.cartesian.series.AreaBase.prototype['startDrawing'] = anychart.cartesian.series.AreaBase.prototype.startDrawing;//inherited
