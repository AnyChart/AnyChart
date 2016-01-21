goog.provide('anychart.core.cartesian.series.Line');
goog.require('anychart.core.cartesian.series.ContinuousBase');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#line} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.ContinuousBase}
 */
anychart.core.cartesian.series.Line = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.seriesSupportsStack = false;

  // legacy
  /**
   * Field names certain type of series needs from data set.
   * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
   * @type {!Array.<string>}
   */
  this.referenceValueNames = ['x', 'value'];
  /**
   * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
   * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
   * Possible values:
   *    'x' - transforms through xScale,
   *    'y' - transforms through yScale,
   *    'z' - gets as zero Y.
   * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
   * @type {!Array.<string>}
   */
  this.referenceValueMeanings = ['x', 'y'];

  // legacy
  this.stroke(function() {
    return this['sourceColor'];
  });
};
goog.inherits(anychart.core.cartesian.series.Line, anychart.core.cartesian.series.ContinuousBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.LINE] = anychart.core.cartesian.series.Line;


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.drawFirstPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    this.path.moveTo(x, y);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));

    this.path.lineTo(x, y);
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.getMarkerFill = function() {
  var stroke = this.getFinalStroke(false, anychart.PointState.NORMAL);
  if (goog.isObject(stroke)) {
    delete stroke['thickness'];
    delete stroke['dash'];
    delete stroke['lineCap'];
    delete stroke['lineJoin'];
  }
  return stroke;
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Line.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.LINE;
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Line.prototype.setupByJSON = function(config) {
  return goog.base(this, 'setupByJSON', config);
};


//region LEGACY STANDALONE
//----------------------------------------------------------------------------------------------------------------------
//
//  LEGACY STANDALONE
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for line series.<br/>
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.core.cartesian.series.Line}
 * @deprecated Use anychart.line instead.
 */
anychart.core.cartesian.series.line = function(data, opt_csvSettings) {
  return new anychart.core.cartesian.series.Line(data, opt_csvSettings);
};


/**
 * DO NOT PUBLISH.
 */
anychart.core.cartesian.series.Line.prototype.resetCategorisation = function() {
  if (this.dataInternal != this.parentView)
    goog.dispose(this.dataInternal);
  this.dataInternal = /** @type {!anychart.data.View} */(this.parentView);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.core.cartesian.series.Line.prototype.categoriseData = function(categories) {
  this.dataInternal = this.parentView.prepare('x', categories);
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.core.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
  }

  if (anychart.core.utils.Error.isErrorAvailableForScale(yScale) && this.isErrorAvailable()) {
    var errValues = this.getErrorValues(false);
    errValues[0] = +res[0] - errValues[0];
    errValues[1] = +res[0] + errValues[1];
    res = res.concat(errValues);
  }
  return res;
};


/**
 * Draws series into the current container. If series has no scales - creates them.
 * @return {anychart.core.cartesian.series.Base} An instance of {@link anychart.core.cartesian.series.Base} class for method chaining.
 */
anychart.core.cartesian.series.Line.prototype.draw = function() {
  this.suspendSignalsDispatching();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  var iterator;
  var value;
  var scale;
  if (!(scale = this.xScale()))
    this.xScale(scale = new anychart.scales.Ordinal());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = iterator.get('x');
      if (goog.isDef(value))
        scale.extendDataRange(value);
    }
    scale.finishAutoCalc();
  }
  this.categoriseData(scale.getCategorisation());
  if (!(scale = this.yScale()))
    this.yScale(scale = new anychart.scales.Linear());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value)
        scale.extendDataRange.apply(/** @type {anychart.scales.Base} */(scale), value);
    }
    scale.finishAutoCalc();
  }

  iterator = this.getResetIterator();
  this.startDrawing();

  while (iterator.advance()) {
    var index = iterator.getIndex();
    if (iterator.get('selected'))
      this.state.setPointState(anychart.PointState.SELECT, index);

    this.drawPoint(this.state.getPointStateByIndex(index));
  }
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};
//endregion


//exports
anychart.core.cartesian.series.Line.prototype['stroke'] = anychart.core.cartesian.series.Line.prototype.stroke;//inherited
anychart.core.cartesian.series.Line.prototype['hoverStroke'] = anychart.core.cartesian.series.Line.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.Line.prototype['selectStroke'] = anychart.core.cartesian.series.Line.prototype.selectStroke;//inherited
//only for standalone and deprecated
anychart.core.cartesian.series.Line.prototype['draw'] = anychart.core.cartesian.series.Line.prototype.draw;//doc|ex
anychart.core.cartesian.series.Line.prototype['drawPoint'] = anychart.core.cartesian.series.Line.prototype.drawPoint;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['drawMissing'] = anychart.core.cartesian.series.Line.prototype.drawMissing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['startDrawing'] = anychart.core.cartesian.series.Line.prototype.startDrawing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['finalizeDrawing'] = anychart.core.cartesian.series.Line.prototype.finalizeDrawing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['getIterator'] = anychart.core.cartesian.series.Line.prototype.getIterator;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['getResetIterator'] = anychart.core.cartesian.series.Line.prototype.getResetIterator;//doc|need-ex
