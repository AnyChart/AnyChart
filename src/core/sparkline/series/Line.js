goog.provide('anychart.core.sparkline.series.Line');

goog.require('anychart.core.sparkline.series.ContinuousBase');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Sparkline#line} to get this series.
 * @param {!anychart.charts.Sparkline} chart Chart.
 * @constructor
 * @extends {anychart.core.sparkline.series.ContinuousBase}
 */
anychart.core.sparkline.series.Line = function(chart) {
  anychart.core.sparkline.series.Line.base(this, 'constructor', chart);
};
goog.inherits(anychart.core.sparkline.series.Line, anychart.core.sparkline.series.ContinuousBase);
anychart.core.sparkline.series.Base.SeriesTypesMap[anychart.enums.SparklineSeriesType.LINE] = anychart.core.sparkline.series.Line;


/** @inheritDoc */
anychart.core.sparkline.series.Line.prototype.drawFirstPoint = function() {
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
anychart.core.sparkline.series.Line.prototype.drawSubsequentPoint = function() {
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
anychart.core.sparkline.series.Line.prototype.getMarkerFill = function() {
  return this.chart.getFinalStroke();
};


/** @inheritDoc */
anychart.core.sparkline.series.Line.prototype.getMarkerStroke = function() {
  return anychart.color.darken(/** @type {acgraph.vector.Stroke|string} */(this.chart.getFinalStroke()));
};


/** @inheritDoc */
anychart.core.sparkline.series.Line.prototype.getDefaults = function() {
  var settings = anychart.core.sparkline.series.Line.base(this, 'getDefaults');

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

