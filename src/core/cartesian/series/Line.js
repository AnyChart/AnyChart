goog.provide('anychart.core.cartesian.series.Line');

goog.require('anychart.core.cartesian.series.ContinuousBase');



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
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = false;

};
goog.inherits(anychart.core.cartesian.series.Line, anychart.core.cartesian.series.ContinuousBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.LINE] = anychart.core.cartesian.series.Line;


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.lineTo(x, y);

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/** @inheritDoc */
anychart.core.cartesian.series.Line.prototype.getMarkerFill = function() {
  var stroke = this.getFinalStroke(false, false);
  if (goog.isObject(stroke)) {
    delete stroke['thickness'];
    delete stroke['dash'];
    delete stroke['lineCap'];
    delete stroke['lineJoin'];
  }
  return stroke;
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


//exports
anychart.core.cartesian.series.Line.prototype['stroke'] = anychart.core.cartesian.series.Line.prototype.stroke;//inherited
anychart.core.cartesian.series.Line.prototype['hoverStroke'] = anychart.core.cartesian.series.Line.prototype.hoverStroke;//inherited
//only for standalone and deprecated
anychart.core.cartesian.series.Line.prototype['draw'] = anychart.core.cartesian.series.Line.prototype.draw;//doc|ex
anychart.core.cartesian.series.Line.prototype['drawPoint'] = anychart.core.cartesian.series.Line.prototype.drawPoint;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['drawMissing'] = anychart.core.cartesian.series.Line.prototype.drawMissing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['startDrawing'] = anychart.core.cartesian.series.Line.prototype.startDrawing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['finalizeDrawing'] = anychart.core.cartesian.series.Line.prototype.finalizeDrawing;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['getIterator'] = anychart.core.cartesian.series.Line.prototype.getIterator;//doc|need-ex
anychart.core.cartesian.series.Line.prototype['getResetIterator'] = anychart.core.cartesian.series.Line.prototype.getResetIterator;//doc|need-ex
