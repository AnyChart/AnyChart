goog.provide('anychart.core.utils.ResourceChartContextProvider');
goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.core.utils.ITokenProvider');
goog.require('anychart.enums');



/**
 * Resource chart tooltip context provider.
 * @param {anychart.charts.Resource} chart
 * @implements {anychart.core.utils.ITokenProvider}
 * @implements {anychart.core.utils.IContextProvider}
 * @constructor
 */
anychart.core.utils.ResourceChartContextProvider = function(chart) {
  /**
   * @type {anychart.charts.Resource}
   */
  this.chart = chart;

  this['chart'] = chart;
};


/** @inheritDoc */
anychart.core.utils.ResourceChartContextProvider.prototype.applyReferenceValues = function() {
  var iter = this.chart.getIterator();
  var resourceIndex = iter.getResourceIndex();
  var activityIndex = iter.getActivityIndex();
  var resource = this.chart.getResource(resourceIndex);
  var activity = resource.getActivity(activityIndex);
  var iterator = this.chart.getDataIterator();
  iterator.select(resourceIndex);
  var start = Infinity;
  var end = -Infinity;
  var intervals = [];
  for (var i = 0; i < activity.intervals.length; i++) {
    var interval = activity.intervals[i];
    start = Math.min(start, interval.start);
    end = Math.max(end, interval.end);
    intervals.push({
      'start': interval.start,
      'end': interval.end,
      'minutesPerDay': interval.minutesPerDay
    });
  }

  this.iterator_ = iterator;
  this['resourceIndex'] = resourceIndex;
  this['activityIndex'] = activityIndex;
  this['activity'] = activity.data;
  this['name'] = activity.data['name'];
  this['intervals'] = intervals;
  this['start'] = start;
  this['end'] = end;
  this['minutesPerDay'] = (intervals.length == 1) ? intervals[0]['minutesPerDay'] : NaN;
};


/**
 * Fetch statistics value by its key or a whole object if no key provided.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.ResourceChartContextProvider.prototype.getStat = function(opt_key) {
  if (goog.isDef(opt_key)) {
    return this.chart.getStat(opt_key);
  }
  this.chart.ensureStatisticsReady();
  return this.chart.statistics;
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.ResourceChartContextProvider.prototype.getDataValue = function(key) {
  return this.iterator_.get(key);
};


/** @inheritDoc */
anychart.core.utils.ResourceChartContextProvider.prototype.getTokenValue = function(name) {
  var origName = name.substr(1);
  switch (origName) {
    case 'resourceIndex':
    case 'activityIndex':
    case 'name':
    case 'minutesPerDay':
      return this[origName];
    case 'start':
    case 'end':
      return new Date(this[origName]);
  }

  var statName = origName.charAt(0).toLowerCase() + origName.slice(1);

  return this.chart.getStat(statName);
};


/** @inheritDoc */
anychart.core.utils.ResourceChartContextProvider.prototype.getTokenType = function(name) {
  name = name.substr(1);
  switch (name) {
    case 'resourceIndex':
    case 'activityIndex':
    case 'minutesPerDay':
      return anychart.enums.TokenType.NUMBER;
    case 'start':
    case 'end':
      return anychart.enums.TokenType.DATE_TIME;
    // case 'name':
    default:
      return anychart.enums.TokenType.STRING;
  }
};


//exports
(function() {
  var proto = anychart.core.utils.ResourceChartContextProvider.prototype;
  proto['getTokenValue'] = proto.getTokenValue;
  proto['getTokenType'] = proto.getTokenType;
  proto['getStat'] = proto.getStat;
  proto['getDataValue'] = proto.getDataValue;
})();
