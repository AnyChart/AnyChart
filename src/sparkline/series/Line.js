goog.provide('anychart.sparklineModule.series.Line');

goog.require('anychart.sparklineModule.series.ContinuousBase');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Use method {@link anychart.sparklineModule.Chart#line} to get this series.
 * @param {!anychart.sparklineModule.Chart} chart Chart.
 * @constructor
 * @extends {anychart.sparklineModule.series.ContinuousBase}
 */
anychart.sparklineModule.series.Line = function(chart) {
  anychart.sparklineModule.series.Line.base(this, 'constructor', chart);
};
goog.inherits(anychart.sparklineModule.series.Line, anychart.sparklineModule.series.ContinuousBase);
anychart.sparklineModule.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.LINE] = anychart.sparklineModule.series.Line;


/** @inheritDoc */
anychart.sparklineModule.series.Line.prototype.drawFirstPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.sparklineModule.series.Line.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    this.path.lineTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.sparklineModule.series.Line.prototype.getMarkerFill = function() {
  return this.chart.getFinalStroke();
};


/** @inheritDoc */
anychart.sparklineModule.series.Line.prototype.getMarkerStroke = function() {
  return anychart.color.darken(/** @type {acgraph.vector.Stroke|string} */(this.chart.getFinalStroke()));
};


/** @inheritDoc */
anychart.sparklineModule.series.Line.prototype.getDefaults = function() {
  var settings = anychart.sparklineModule.series.Line.base(this, 'getDefaults');

  settings['stroke'] = {
    'color': '#64b5f6',
    'thickness': 1.5
  };
  settings['fill'] = {
    'color': '#64b5f6',
    'opacity': 0.5
  };

  return settings;
};

