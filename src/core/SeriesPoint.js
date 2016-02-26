goog.provide('anychart.core.SeriesPoint');
goog.require('anychart.core.Point');



/**
 * Point representing all points that belongs to series-based chart.
 * @param {anychart.core.SeriesBase} series Series.
 * @param {number} index Point index in series.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.core.SeriesPoint = function(series, index) {
  goog.base(this, series.getChart(), index);

  /**
   * Series point belongs to.
   * @type {anychart.core.SeriesBase}
   * @protected
   */
  this.series = series;
};
goog.inherits(anychart.core.SeriesPoint, anychart.core.Point);


/**
 * Getter for series which current point belongs to.
 * @return {anychart.core.SeriesBase} Series.
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


//exports
anychart.core.SeriesPoint.prototype['get'] = anychart.core.SeriesPoint.prototype.get;
anychart.core.SeriesPoint.prototype['set'] = anychart.core.SeriesPoint.prototype.set;
anychart.core.SeriesPoint.prototype['hovered'] = anychart.core.SeriesPoint.prototype.hovered;
anychart.core.SeriesPoint.prototype['selected'] = anychart.core.SeriesPoint.prototype.selected;
anychart.core.SeriesPoint.prototype['getSeries'] = anychart.core.SeriesPoint.prototype.getSeries;
anychart.core.SeriesPoint.prototype['getStackValue'] = anychart.core.SeriesPoint.prototype.getStackValue;
anychart.core.SeriesPoint.prototype['getStackZero'] = anychart.core.SeriesPoint.prototype.getStackZero;
anychart.core.SeriesPoint.prototype['exists'] = anychart.core.SeriesPoint.prototype.exists;
