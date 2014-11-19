goog.provide('anychart.cartesian.series.Line');

goog.require('anychart.cartesian.series.ContinuousBase');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#line} or {@link anychart.Chart#lineChart}.
 * @example
 * anychart.cartesian.series.line([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.ContinuousBase}
 */
anychart.cartesian.series.Line = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value'];
  this.referenceValueMeanings = ['x', 'y'];
  this.referenceValuesSupportStack = true;

};
goog.inherits(anychart.cartesian.series.Line, anychart.cartesian.series.ContinuousBase);
anychart.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.LINE] = anychart.cartesian.series.Line;


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.drawFirstPoint = function() {
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
anychart.cartesian.series.Line.prototype.drawSubsequentPoint = function() {
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
anychart.cartesian.series.Line.prototype.strokeInternal = (function() {
  return this['sourceColor'];
});


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, false);
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Line.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.LINE;
};


/** @inheritDoc */
anychart.cartesian.series.Line.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Line.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function for line series.<br/>
 * @example
 * anychart.cartesian.series.line([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Line}
 */
anychart.cartesian.series.line = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Line(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.line', anychart.cartesian.series.line);//doc|ex
anychart.cartesian.series.Line.prototype['stroke'] = anychart.cartesian.series.Line.prototype.stroke;//inherited
anychart.cartesian.series.Line.prototype['hoverStroke'] = anychart.cartesian.series.Line.prototype.hoverStroke;//inherited
