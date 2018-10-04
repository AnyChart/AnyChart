goog.provide('anychart.core.SeriesPoint');
goog.require('anychart.core.Point');



/**
 * Point representing all points that belongs to series-based chart.
 * @param {anychart.core.series.Base} series Series.
 * @param {number} index Point index in series.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.core.SeriesPoint = function(series, index) {
  anychart.core.SeriesPoint.base(this, 'constructor', series.getChart(), index);

  /**
   * Series point belongs to.
   * @type {anychart.core.series.Base}
   * @protected
   */
  this.series = series;
};
goog.inherits(anychart.core.SeriesPoint, anychart.core.Point);


/**
 * Getter for series which current point belongs to.
 * @return {anychart.core.series.Base} Series.
 */
anychart.core.SeriesPoint.prototype.getSeries = function() {
  return this.series;
};


/** @inheritDoc */
anychart.core.SeriesPoint.prototype.get = function(field) {
  return this.series.getValueInternal(this.index, field);
};


/** @inheritDoc */
anychart.core.SeriesPoint.prototype.set = function(field, value) {
  this.series.setValueInternal(this.index, field, value);
  return this;
};


/**
 * Returns stack value of the point.
 * @return {number}
 */
anychart.core.SeriesPoint.prototype.getStackValue = function() {
  return /** @type {number} */ (this.series.getStackedValue(this.index));
};


/**
 * Returns stack zero of the point.
 * @return {number}
 */
anychart.core.SeriesPoint.prototype.getStackZero = function() {
  return /** @type {number} */ (this.series.getStackedZero(this.index));
};


/** @inheritDoc */
anychart.core.SeriesPoint.prototype.selected = function(opt_value) {
  var series = this.getSeries();
  var state = series.state.hasPointStateByPointIndex(anychart.PointState.SELECT, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        series.select(this.index);
      else
        series.unselect(this.index);
      return this;
    }
  }
  return state;
};


/** @inheritDoc */
anychart.core.SeriesPoint.prototype.hovered = function(opt_value) {
  var series = this.getSeries();
  var state = series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        series.hover(this.index);
      else
        series.unhover(this.index);
      return this;
    }
  }
  return state;
};


/**
 * Method need to check the existence of the current point.
 * @return {boolean} Whether point exists in dataset or not.
 */
anychart.core.SeriesPoint.prototype.exists = function() {
  return (this.index < this.series.getIterator().getRowsCount());
};


/** @inheritDoc */
anychart.core.SeriesPoint.prototype.ensureStatisticsReady = function() {
  anychart.core.SeriesPoint.base(this, 'ensureStatisticsReady');
  var chart = /** @type {anychart.core.CartesianBase} */ (this.chart);
  var series = /** @type {anychart.core.series.Base} */ (this.series);
  var isRangeSeries = series.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED | anychart.core.drawers.Capabilities.IS_OHLC_BASED);

  var val = /** @type {number} */ (isRangeSeries ? (/** @type {number} */ (this.get('high')) - /** @type {number} */ (this.get('low'))) : this.get('value'));

  this.statistics(anychart.enums.Statistics.INDEX, this.index);
  if (goog.isDef(val)) this.statistics(anychart.enums.Statistics.VALUE, val);

  var size = /** @type {number} */ (this.get('size')); //Bubble.
  var v;

  if (goog.isNumber(chart.statistics(anychart.enums.Statistics.DATA_PLOT_X_SUM))) {
    v = val / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_X_SUM));
    this.statistics(anychart.enums.Statistics.X_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
  }

  if (goog.isNumber(series.statistics(anychart.enums.Statistics.SERIES_X_SUM))) {
    v = val / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_X_SUM));
    this.statistics(anychart.enums.Statistics.X_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
  }

  if (goog.isNumber(series.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM))) {
    v = size / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM));
    this.statistics(anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
    v = size / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM));
    this.statistics(anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
    this.statistics(anychart.enums.Statistics.BUBBLE_SIZE, size);
  }

  var sumArr = isRangeSeries ?
      series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM_ARR_) :
      series.statistics(anychart.enums.Statistics.CATEGORY_Y_SUM_ARR_);
  var x = /** @type {number} */ (this.get('x'));

  if (sumArr) {
    this.statistics(anychart.enums.Statistics.CATEGORY_NAME, x);
    var catSum = sumArr[this.index];

    if (isRangeSeries) {
      v = val / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_SUM));
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
      v = val / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
      v = val / catSum;
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY, anychart.math.round(v * 100, 2));
      v = catSum / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM, catSum);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX, series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN, series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_AVERAGE, series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_AVG_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN, series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE, series.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE_ARR_)[this.index]);
    } else {
      v = val / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
      v = val / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
      v = val / catSum;
      this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY, anychart.math.round(v * 100, 2));
      v = catSum / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_SUM, catSum);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_MAX, series.statistics(anychart.enums.Statistics.CATEGORY_Y_MAX_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_MIN, series.statistics(anychart.enums.Statistics.CATEGORY_Y_MIN_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_AVERAGE, series.statistics(anychart.enums.Statistics.CATEGORY_Y_AVG_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_MEDIAN, series.statistics(anychart.enums.Statistics.CATEGORY_Y_MEDIAN_ARR_)[this.index]);
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_MODE, series.statistics(anychart.enums.Statistics.CATEGORY_Y_MODE_ARR_)[this.index]);
    }
  } else {
    v = x / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_X_SUM));
    this.statistics(anychart.enums.Statistics.X_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
    v = val / /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
    this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_SERIES, anychart.math.round(v * 100, 2));
    v = x / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_X_SUM));
    this.statistics(anychart.enums.Statistics.X_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
    v = val / /** @type {number} */ (chart.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
    this.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, anychart.math.round(v * 100, 2));
  }
};


//exports
(function() {
  var proto = anychart.core.SeriesPoint.prototype;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['getSeries'] = proto.getSeries;
  proto['getStackValue'] = proto.getStackValue;
  proto['getStackZero'] = proto.getStackZero;
  proto['exists'] = proto.exists;
})();
