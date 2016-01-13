goog.provide('anychart.core.utils.AxisLabelsContextProvider');
goog.provide('anychart.core.utils.BaseContextProvider');
goog.provide('anychart.core.utils.GanttContextProvider');
goog.provide('anychart.core.utils.IContextProvider');
goog.provide('anychart.core.utils.ITokenProvider');
goog.provide('anychart.core.utils.LegendContextProvider');
goog.provide('anychart.core.utils.MapPointContextProvider');
goog.provide('anychart.core.utils.PointContextProvider');
goog.provide('anychart.core.utils.SeriesPointContextProvider');
goog.provide('anychart.core.utils.StockSeriesContextProvider');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Context provider interface
 * @interface
 */
anychart.core.utils.IContextProvider = function() {
};


/**
 * Applies reference values.
 */
anychart.core.utils.IContextProvider.prototype.applyReferenceValues;


/**
 * Fetch statistics value by key.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getStat;


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getDataValue;



/**
 * Token provider interface
 * @interface
 */
anychart.core.utils.ITokenProvider = function() {
};


/**
 * Return token type by token name.
 * @param {string} name Token name.
 * @return {anychart.enums.TokenType} Type of the token.
 */
anychart.core.utils.ITokenProvider.prototype.getTokenType;


/**
 * Return token value by token name.
 * @param {string} name Name of the token.
 * @return {*} Value of the token.
 */
anychart.core.utils.ITokenProvider.prototype.getTokenValue;



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



/**
 * @implements {anychart.core.utils.IContextProvider}
 * @param {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline} chartInstance chart instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.PointContextProvider = function(chartInstance, referenceValueNames) {
  anychart.core.utils.PointContextProvider.base(this, 'constructor');
  /**
   * @type {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline}
   */
  this['chart'] = chartInstance;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.PointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['chart'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }
  if (iterator.meta('groupedPoint') == true) {
    this['name'] = 'Other points';
    this['groupedPoint'] = true;
    this['names'] = iterator.meta('names');
    this['values'] = iterator.meta('values');
  }
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getStat = function(opt_key) {
  return /** @type {{statistics:Function, getIterator:Function}} */(this['chart']).statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getDataValue = function(key) {
  return this['chart'].getIterator().get(key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case '%Name':
      return this['name'];
    case '%SeriesYSum':
    case '%DataPlotYSum':
      return this.getStat('sum');
    case '%SeriesYMax':
    case '%DataPlotYMax':
      return this.getStat('max');
    case '%SeriesYMin':
    case '%DataPlotYMin':
      return this.getStat('min');
    case '%SeriesYAverage':
    case '%DataPlotYAverage':
      return this.getStat('average');
    case '%SeriesPointCount':
    case '%DataPlotPointCount':
      return this.getStat('count');
    case '%XValue':
      return this['x'];
  }
  return anychart.core.utils.PointContextProvider.base(this, 'getTokenValue', name);
};



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
  anychart.core.utils.SeriesPointContextProvider.base(this, 'constructor');
  /**
   * @type {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)}
   * @private
   */
  this['series'] = series;

  /**
   * @type {boolean}
   * @private
   */
  this.errorAvailable_ = addErrorInfo;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.SeriesPointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }
  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();
  if (this.errorAvailable_) {
    /** @type {anychart.core.utils.ISeriesWithError} */
    var series = /** @type {anychart.core.utils.ISeriesWithError} */(this['series']);
    /** @type {anychart.enums.ErrorMode} */
    var mode = /** @type {anychart.enums.ErrorMode} */(series.error().mode());
    var error;
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.VALUE) {
      error = series.getErrorValues(false);
      this['valueLowerError'] = error[0];
      this['valueUpperError'] = error[1];
    }
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.X) {
      error = series.getErrorValues(true);
      this['xLowerError'] = error[0];
      this['xUpperError'] = error[1];
    }
  }
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getStat = function(opt_key) {
  return this['series'].statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getIterator().get(key);
};


/**
 * Gets series meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta = function(opt_key) {
  return this['series'].meta(opt_key);
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case '%High':
      return this['high'];
    case '%Low':
      return this['low'];
    case '%Open':
      return this['open'];
    case '%Close':
      return this['close'];
    case '%BubbleSize':
      return this['size'];
    case '%RangeStart':
      return this['low'];
    case '%RangeEnd':
      return this['high'];
    case '%Range':
      return this['high'] - this['low'];
    case '%SeriesName':
      return this['seriesName'];
    case '%SeriesYSum':
      return this.getStat('seriesSum');
    case '%SeriesYMax':
      return this.getStat('seriesMax');
    case '%SeriesYMin':
      return this.getStat('seriesMin');
    case '%SeriesYAverage':
      return this.getStat('seriesAverage');
    case '%SeriesPointCount':
      return this.getStat('seriesPointsCount');
    case '%DataPlotYSum':
      return this.getStat('sum');
    case '%DataPlotYMax':
      return this.getStat('max');
    case '%DataPlotYMin':
      return this.getStat('min');
    case '%DataPlotYAverage':
      return this.getStat('average');
    case '%DataPlotPointCount':
      return this.getStat('pointsCount');
    case '%DataPlotSeriesCount':
      return this['series'].getChart().getSeriesCount();
    case '%YPercentOfSeries':
      return this['value'] * 100 / /** @type {number} */ (this.getStat('seriesSum'));
    case '%YPercentOfTotal':
      return this['value'] * 100 / /** @type {number} */ (this.getStat('sum'));
    case '%XValue':
      return this['x'];
    case '%Name':
      return this.getDataValue('name');
  }
  return anychart.core.utils.SeriesPointContextProvider.base(this, 'getTokenValue', name);
};



/**
 * Stock series context provider.
 * @param {anychart.core.stock.series.Base} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.StockSeriesContextProvider = function(series, referenceValueNames) {
  anychart.core.utils.StockSeriesContextProvider.base(this, 'constructor');
  /**
   * @type {anychart.core.stock.series.Base}
   */
  this['series'] = series;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};
goog.inherits(anychart.core.utils.StockSeriesContextProvider, anychart.core.utils.BaseContextProvider);


/**
 * Applies reference values.
 */
anychart.core.utils.StockSeriesContextProvider.prototype.applyReferenceValues = function() {
  var currentPoint = this['series'].getCurrentPoint();
  var value;
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = currentPoint ? currentPoint.get(value) : NaN;
    if (!goog.isDef(this[value])) this[value] = NaN;
  }
  this['x'] = currentPoint ? currentPoint.getKey() : NaN;
  this['seriesName'] = this['series'].name();
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.StockSeriesContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getCurrentPoint().get(key);
};



/**
 * Context provider for legend itemsTextFormatter function
 * @implements {anychart.core.utils.ITokenProvider}
 * @param {(anychart.core.SeriesBase)=} opt_source Source for statistics and meta.
 * @constructor
 */
anychart.core.utils.LegendContextProvider = function(opt_source) {
  this.source_ = opt_source;
};


/**
 * Fetch statistics value by key.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.LegendContextProvider.prototype.getStat = function(opt_key) {
  return this.source_.statistics(opt_key);
};


/**
 * Gets meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.LegendContextProvider.prototype.getMeta = function(opt_key) {
  if (this.source_.meta)
    return this.source_.meta(opt_key);
};


/** @inheritDoc */
anychart.core.utils.LegendContextProvider.prototype.getTokenValue = function(name) {
  return undefined;
};


/** @inheritDoc */
anychart.core.utils.LegendContextProvider.prototype.getTokenType = function(name) {
  return anychart.enums.TokenType.UNKNOWN;
};



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @extends {anychart.core.utils.SeriesPointContextProvider}
 * @constructor
 */
anychart.core.utils.MapPointContextProvider = function(series, referenceValueNames) {
  anychart.core.utils.MapPointContextProvider.base(this, 'constructor', series, referenceValueNames, false);
};
goog.inherits(anychart.core.utils.MapPointContextProvider, anychart.core.utils.SeriesPointContextProvider);


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }

  var regionId = iterator.meta('regionId');
  if (regionId)
    this['id'] = regionId;

  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();

  var pointGeoProp = iterator.meta('regionProperties');
  if (pointGeoProp) {
    this['name'] = pointGeoProp['name'];
    this['regionProperties'] = pointGeoProp;
  }
};



/**
 * Axis context provider.
 * @param {anychart.core.axes.Linear|anychart.core.axes.Circular|anychart.core.axes.Polar|anychart.core.axes.Radar|anychart.core.axes.Radial} axis Axis.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.AxisLabelsContextProvider = function(axis, index, value) {
  anychart.core.utils.AxisLabelsContextProvider.base(this, 'constructor');
  this['axis'] = axis;
  var scale = axis.scale();

  var labelText, labelValue;
  if (scale instanceof anychart.scales.Linear) {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  } else if (scale instanceof anychart.scales.Ordinal) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
  } else if (scale instanceof anychart.scales.DateTime) {
    var date = new Date(value);
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var yy = date.getFullYear();

    mm = mm < 10 ? '0' + mm : '' + mm;
    dd = dd < 10 ? '0' + dd : '' + dd;

    labelText = mm + '-' + dd + '-' + yy;
    labelValue = value;
  }
  this['index'] = index;
  this['value'] = labelText;
  this['tickValue'] = labelValue;
  this['max'] = goog.isDef(scale.max) ? scale.max : null;
  this['min'] = goog.isDef(scale.min) ? scale.min : null;
  this['scale'] = scale;
  //TODO as soon as it is possible:
  //sum -- the sum data values from series bound to this axis (depends on orientation)
  //average -- the sum divided by the number of points
  //median -- axis median
  //mode -- axis mode
};
goog.inherits(anychart.core.utils.AxisLabelsContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case '%YAxisSum':
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
    case '%AxisBubbleSizeMax':
    case '%AxisBubbleSizeMin':
    case '%AxisAverage':
    case '%AxisMedian':
    case '%AxisMode':
      return undefined;
    case '%AxisName':
      return this['axis'].title().text();
    case '%AxisScaleMax':
      return this['max'];
    case '%AxisScaleMin':
      return this['min'];
  }
  return anychart.core.utils.AxisLabelsContextProvider.base(this, 'getTokenValue', name);
};


/** @inheritDoc */
anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenType = function(name) {
  switch (name) {
    case '%AxisScaleMax':
    case '%AxisScaleMin':
    case '%Index':
      return anychart.enums.TokenType.NUMBER;
    default:
      return anychart.enums.TokenType.STRING;
  }
};


/**
 * Dummy.
 * @return {undefined}
 */
anychart.core.utils.AxisLabelsContextProvider.prototype.getDataValue = function() {
  return undefined;
};



/**
 * Gantt context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {boolean=} opt_isResources - Whether gantt chart is resources chart.
 * @constructor
 */
anychart.core.utils.GanttContextProvider = function(opt_isResources) {
  /**
   * @type {boolean}
   * @private
   */
  this['isResources'] = !!opt_isResources;

  /**
   * Current tree data item.
   * TODO (A.Kudryavtsev): Make kind of analogue with another context providers (kind of series.getIterator())?
   * @type {anychart.data.Tree.DataItem}
   */
  this.currentItem = null;

  /**
   * Current period (in use for resources chart).
   * @type {Object|undefined}
   */
  this.currentPeriod;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.applyReferenceValues = function() {

  //TODO (A.Kudryavtsev): NOTE!!! All work with dates will be redone after i18n is implemented!!!
  if (this.currentItem) {
    this['item'] = this.currentItem;
    this['name'] = this.currentItem.get(anychart.enums.GanttDataFields.NAME);
    this['id'] = this.currentItem.get(anychart.enums.GanttDataFields.ID);

    if (this['isResources']) {
      this['minPeriodDate'] = this.currentItem.meta('minPeriodDate');
      this['maxPeriodDate'] = this.currentItem.meta('maxPeriodDate');
      this['period'] = this.currentPeriod || void 0;
      this['periodStart'] = this.currentPeriod ?
          anychart.utils.normalizeTimestamp(this.currentPeriod[anychart.enums.GanttDataFields.START]) :
          void 0;
      this['periodEnd'] = this.currentPeriod ?
          anychart.utils.normalizeTimestamp(this.currentPeriod[anychart.enums.GanttDataFields.END]) :
          void 0;
    } else {
      this['actualStart'] = anychart.utils.normalizeTimestamp(this.currentItem.get(anychart.enums.GanttDataFields.ACTUAL_START));
      this['actualEnd'] = anychart.utils.normalizeTimestamp(this.currentItem.get(anychart.enums.GanttDataFields.ACTUAL_END));
      this['progressValue'] = this.currentItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE);

      var isParent = !!this.currentItem.numChildren();
      this['autoStart'] = isParent ? this.currentItem.meta('autoStart') : void 0;
      this['actualEnd'] = isParent ? this.currentItem.meta('actualEnd') : void 0;
      this['autoProgress'] = isParent ? this.currentItem.meta('autoProgress') : void 0;
    }
  }
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getDataValue = function(key) {
  return this.currentItem ? this.currentItem.get(key) : void 0;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getStat = function(opt_key) {
  return void 0; //TODO (A.Kudryavtsev): TBA on gantt statistics implementation.
};


/**
 * Gets series meta by key.
 * @param {string} key - Key.
 * @return {*} Meta value by key.
 */
anychart.core.utils.GanttContextProvider.prototype.getMetaValue = function(key) {
  return this.currentItem ? this.currentItem.meta(key) : void 0;
};


//exports
anychart.core.utils.BaseContextProvider.prototype['getTokenValue'] = anychart.core.utils.BaseContextProvider.prototype.getTokenValue;
anychart.core.utils.BaseContextProvider.prototype['getTokenType'] = anychart.core.utils.BaseContextProvider.prototype.getTokenType;
anychart.core.utils.PointContextProvider.prototype['getStat'] = anychart.core.utils.PointContextProvider.prototype.getStat;
anychart.core.utils.PointContextProvider.prototype['getDataValue'] = anychart.core.utils.PointContextProvider.prototype.getDataValue;
anychart.core.utils.PointContextProvider.prototype['getTokenValue'] = anychart.core.utils.PointContextProvider.prototype.getTokenValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getStat'] = anychart.core.utils.SeriesPointContextProvider.prototype.getStat;
anychart.core.utils.SeriesPointContextProvider.prototype['getDataValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta;
anychart.core.utils.SeriesPointContextProvider.prototype['getTokenValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getTokenValue;
anychart.core.utils.LegendContextProvider.prototype['getStat'] = anychart.core.utils.LegendContextProvider.prototype.getStat;
anychart.core.utils.LegendContextProvider.prototype['getMeta'] = anychart.core.utils.LegendContextProvider.prototype.getMeta;
anychart.core.utils.LegendContextProvider.prototype['getTokenType'] = anychart.core.utils.LegendContextProvider.prototype.getTokenType;
anychart.core.utils.LegendContextProvider.prototype['getTokenValue'] = anychart.core.utils.LegendContextProvider.prototype.getTokenValue;
anychart.core.utils.AxisLabelsContextProvider.prototype['getTokenValue'] = anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenValue;
anychart.core.utils.AxisLabelsContextProvider.prototype['getTokenType'] = anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenType;
anychart.core.utils.GanttContextProvider.prototype['getDataValue'] = anychart.core.utils.GanttContextProvider.prototype.getDataValue;
anychart.core.utils.GanttContextProvider.prototype['getStat'] = anychart.core.utils.GanttContextProvider.prototype.getStat;
anychart.core.utils.GanttContextProvider.prototype['getMetaValue'] = anychart.core.utils.GanttContextProvider.prototype.getMetaValue;
