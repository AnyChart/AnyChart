goog.provide('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.ITokenProvider');
goog.require('anychart.enums');



/**
 * Base class for context providers.
 * @implements {anychart.core.utils.ITokenProvider}
 * @constructor
 */
anychart.core.utils.BaseContextProvider = function() {
};


/** @inheritDoc */
anychart.core.utils.BaseContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case '%YPercentOfCategory':
    case '%XPercentOfSeries':
    case '%XPercentOfTotal':
    case '%BubbleSizePercentOfCategory':
    case '%BubbleSizePercentOfSeries':
    case '%BubbleSizePercentOfTotal':
    case '%SeriesFirstXValue':
    case '%SeriesFirstYValue':
    case '%SeriesLastXValue':
    case '%SeriesLastYValue':
    case '%SeriesXSum':
    case '%SeriesBubbleSizeSum':
    case '%SeriesXMax':
    case '%SeriesXMin':
    case '%SeriesBubbleMaxSize':
    case '%SeriesBubbleMinSize':
    case '%SeriesXAverage':
    case '%SeriesBubbleSizeAverage':
    case '%SeriesYMedian':
    case '%SeriesXMedian':
    case '%SeriesBubbleSizeMedian':
    case '%SeriesYMode':
    case '%SeriesXMode':
    case '%SeriesBubbleSizeMode':
    case '%SeriesYAxisName':
    case '%SeriesXAxisName':
    case '%SeriesYRangeMax':
    case '%SeriesYRangeMin':
    case '%SeriesYRangeSum':
    case '%CategoryYPercentOfTotal':
    case '%CategoryYSum':
    case '%CategoryYAverage':
    case '%CategoryYMedian':
    case '%CategoryYMode':
    case '%CategoryName':
    case '%CategoryYRangeMax':
    case '%CategoryYRangeMin':
    case '%CategoryYRangeSum':
    case '%DataPlotXSum':
    case '%DataPlotBubbleSizeSum':
    case '%DataPlotXMax':
    case '%DataPlotXMin':
    case '%DataPlotBubbleMaxSize':
    case '%DataPlotBubbleMinSize':
    case '%DataPlotXAverage':
    case '%DataPlotBubbleSizeAverage':
    case '%DataPlotMaxYValuePointName':
    case '%DataPlotMinYValuePointName':
    case '%DataPlotMaxYValuePointSeriesName':
    case '%DataPlotMinYValuePointSeriesName':
    case '%DataPlotMaxYSumSeriesName':
    case '%DataPlotMinYSumSeriesName':
    case '%DataPlotYRangeMax':
    case '%DataPlotYRangeMin':
    case '%DataPlotYRangeSum':
    case '%Icon':
      return void 0;
    case '%Value':
    case '%YValue':
      return this['value'];
    case '%Index':
      return this['index'];
    default:
      return this.getDataValue(name.substr(1));
  }
};


/** @inheritDoc */
anychart.core.utils.BaseContextProvider.prototype.getTokenType = function(name) {
  switch (name) {
    case '%YPercentOfCategory':
    case '%XPercentOfSeries':
    case '%XPercentOfTotal':
    case '%BubbleSizePercentOfCategory':
    case '%BubbleSizePercentOfSeries':
    case '%BubbleSizePercentOfTotal':
    case '%SeriesFirstXValue':
    case '%SeriesFirstYValue':
    case '%SeriesLastXValue':
    case '%SeriesLastYValue':
    case '%SeriesXSum':
    case '%SeriesBubbleSizeSum':
    case '%SeriesXMax':
    case '%SeriesXMin':
    case '%SeriesBubbleMaxSize':
    case '%SeriesBubbleMinSize':
    case '%SeriesXAverage':
    case '%SeriesBubbleSizeAverage':
    case '%SeriesYMedian':
    case '%SeriesXMedian':
    case '%SeriesBubbleSizeMedian':
    case '%SeriesYMode':
    case '%SeriesXMode':
    case '%SeriesBubbleSizeMode':
    case '%SeriesYAxisName':
    case '%SeriesXAxisName':
    case '%SeriesYRangeMax':
    case '%SeriesYRangeMin':
    case '%SeriesYRangeSum':
    case '%CategoryYPercentOfTotal':
    case '%CategoryYSum':
    case '%CategoryYAverage':
    case '%CategoryYMedian':
    case '%CategoryYMode':
    case '%CategoryName':
    case '%CategoryYRangeMax':
    case '%CategoryYRangeMin':
    case '%CategoryYRangeSum':
    case '%DataPlotXSum':
    case '%DataPlotBubbleSizeSum':
    case '%DataPlotXMax':
    case '%DataPlotXMin':
    case '%DataPlotBubbleMaxSize':
    case '%DataPlotBubbleMinSize':
    case '%DataPlotXAverage':
    case '%DataPlotBubbleSizeAverage':
    case '%DataPlotMaxYValuePointName':
    case '%DataPlotMinYValuePointName':
    case '%DataPlotMaxYValuePointSeriesName':
    case '%DataPlotMinYValuePointSeriesName':
    case '%DataPlotMaxYSumSeriesName':
    case '%DataPlotMinYSumSeriesName':
    case '%DataPlotYRangeMax':
    case '%DataPlotYRangeMin':
    case '%DataPlotYRangeSum':
    /*case '%YAxisSum':
    case '%YAxisBubbleSizeSum':
    case '%YAxisMax':
    case '%YAxisMin':
    case '%YAxisScaleMax':
    case '%YAxisScaleMin':
    case '%YAxisBubbleSizeMax':
    case '%YAxisBubbleSizeMin':
    case '%YAxisAverage':
    case '%YAxisMedian':
    case '%YAxisMode':
    case '%YAxisName':
    case '%XAxisSum':
    case '%XAxisBubbleSizeSum':
    case '%XAxisMax':
    case '%XAxisMin':
    case '%XAxisScaleMax':
    case '%XAxisScaleMin':
    case '%XAxisBubbleSizeMax':
    case '%XAxisBubbleSizeMin':
    case '%XAxisAverage':
    case '%XAxisMedian':
    case '%XAxisMode':
    case '%XAxisName':
    case '%AxisSum':
    case '%AxisBubbleSizeSum':
    case '%AxisMax':
    case '%AxisMin':
    case '%AxisScaleMax':
    case '%AxisScaleMin':
    case '%AxisBubbleSizeMax':
    case '%AxisBubbleSizeMin':
    case '%AxisAverage':
    case '%AxisMedian':
    case '%AxisMode':
    case '%AxisName':*/
    case '%Icon':
      return anychart.enums.TokenType.UNKNOWN;
    case '%Value':
    case '%YValue':
    case '%YPercentOfSeries':
    case '%YPercentOfTotal':
    case '%High':
    case '%Low':
    case '%Open':
    case '%Close':
    case '%XValue':
    case '%BubbleSize':
    case '%Index':
    case '%RangeStart':
    case '%RangeEnd':
    case '%Range':
    case '%SeriesYSum':
    case '%SeriesYMax':
    case '%SeriesYMin':
    case '%SeriesYAverage':
    case '%SeriesPointCount':
    case '%DataPlotYSum':
    case '%DataPlotYMax':
    case '%DataPlotYMin':
    case '%DataPlotYAverage':
    case '%DataPlotPointCount':
    case '%DataPlotSeriesCount':
      return anychart.enums.TokenType.NUMBER;
    case '%Name':
    case '%SeriesName':
    default:
      return anychart.enums.TokenType.STRING;
  }
};


//exports
anychart.core.utils.BaseContextProvider.prototype['getTokenValue'] = anychart.core.utils.BaseContextProvider.prototype.getTokenValue;
anychart.core.utils.BaseContextProvider.prototype['getTokenType'] = anychart.core.utils.BaseContextProvider.prototype.getTokenType;
