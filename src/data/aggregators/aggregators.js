goog.provide('anychart.data.aggregators');
goog.require('anychart.data.aggregators.Average');
goog.require('anychart.data.aggregators.First');
goog.require('anychart.data.aggregators.FirstValue');
goog.require('anychart.data.aggregators.Last');
goog.require('anychart.data.aggregators.LastValue');
goog.require('anychart.data.aggregators.List');
goog.require('anychart.data.aggregators.Max');
goog.require('anychart.data.aggregators.Min');
goog.require('anychart.data.aggregators.Sum');
goog.require('anychart.data.aggregators.WeightedAverage');
goog.require('anychart.enums');


/**
 * Creates and returns proper data aggregator according to passed type.
 * @param {anychart.enums.AggregationType} type
 * @param {number} sourceColumn
 * @param {number=} opt_weightsColumn
 * @return {!anychart.data.aggregators.Base}
 */
anychart.data.aggregators.create = function(type, sourceColumn, opt_weightsColumn) {
  switch (type) {
    case anychart.enums.AggregationType.AVERAGE:
      return new anychart.data.aggregators.Average(sourceColumn);
    case anychart.enums.AggregationType.FIRST:
      return new anychart.data.aggregators.First(sourceColumn);
    case anychart.enums.AggregationType.FIRST_VALUE:
      return new anychart.data.aggregators.FirstValue(sourceColumn);
    case anychart.enums.AggregationType.LAST_VALUE:
      return new anychart.data.aggregators.LastValue(sourceColumn);
    case anychart.enums.AggregationType.LIST:
      return new anychart.data.aggregators.List(sourceColumn, opt_weightsColumn);
    case anychart.enums.AggregationType.MAX:
      return new anychart.data.aggregators.Max(sourceColumn);
    case anychart.enums.AggregationType.MIN:
      return new anychart.data.aggregators.Min(sourceColumn);
    case anychart.enums.AggregationType.SUM:
      return new anychart.data.aggregators.Sum(sourceColumn);
    case anychart.enums.AggregationType.WEIGHTED_AVERAGE:
      return new anychart.data.aggregators.WeightedAverage(sourceColumn);
    default:
    case anychart.enums.AggregationType.LAST:
      return new anychart.data.aggregators.Last(sourceColumn);
  }
};


/**
 * Returns hash string for passed params.
 * @param {anychart.enums.AggregationType} type
 * @param {number} sourceColumn
 * @param {number=} opt_weightsColumn
 * @return {string}
 */
anychart.data.aggregators.getHash = function(type, sourceColumn, opt_weightsColumn) {
  switch (type) {
    case anychart.enums.AggregationType.AVERAGE:
      return 'a' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.FIRST:
      return 'f' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.FIRST_VALUE:
      return 'o' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.LAST_VALUE:
      return 'c' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.LIST:
      return 'g' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.MAX:
      return 'x' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.MIN:
      return 'n' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.SUM:
      return 's' + sourceColumn.toFixed(0);
    case anychart.enums.AggregationType.WEIGHTED_AVERAGE:
      return 'w' + sourceColumn.toFixed(0) + ':' + opt_weightsColumn.toFixed(0);
    default:
    case anychart.enums.AggregationType.LAST:
      return 'l' + sourceColumn.toFixed(0);
  }
};
