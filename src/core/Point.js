goog.provide('anychart.core.Point');



/**
 * Class that wraps point of series/chart.
 * @param {anychart.core.SeparateChart} chart Chart points belongs to.
 * @param {number} index Point index in chart.
 * @constructor
 */
anychart.core.Point = function(chart, index) {
  /**
   * Chart point belongs to.
   * @type {anychart.core.SeparateChart}
   * @protected
   */
  this.chart = chart;

  /**
   * Index of the point
   * @type {number}
   * @protected
   */
  this.index = anychart.utils.normalizeToNaturalNumber(index, 0, true);

  /**
   * Statistics object.
   * @type {Object.<string, *>}
   */
  this.statistics = {};
};


/**
 * Getter for point index in chart/series.
 * @return {number} Index of point.
 */
anychart.core.Point.prototype.getIndex = function() {
  return this.index;
};


/**
 * Getter for chart which current point belongs to.
 * @return {anychart.core.SeparateChart} Chart.
 */
anychart.core.Point.prototype.getChart = function() {
  return this.chart;
};


/**
 * Fetches a field value from point data row by its name.
 * @param {string} field Field in data row.
 * @return {*}
 */
anychart.core.Point.prototype.get = function(field) {
  return (/** @type {{data:Function}} */(this.chart)).data().get(this.index, field);
};


/**
 * Sets the field of the point data row to the specified value.
 * @param {string} field Field.
 * @param {*} value Value to set.
 * @return {anychart.core.Point}
 */
anychart.core.Point.prototype.set = function(field, value) {
  (/** @type {{data:Function}} */(this.chart)).data().set(this.index, field, value);
  return this;
};


/**
 * Getter/setter for hover point state.
 * @param {boolean=} opt_value Hover state to set.
 * @return {(boolean|anychart.core.Point)} Hover state of self for chaining.
 */
anychart.core.Point.prototype.hovered = function(opt_value) {
  var chart = /** @type {anychart.charts.Funnel|anychart.charts.Pyramid} */ (this.getChart());
  var state = chart.state.hasPointStateByPointIndex(anychart.PointState.HOVER, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        chart.hover(this.index);
      else
        chart.unhover(this.index);
      return this;
    }
  }
  return state;
};


/**
 * Getter/setter for select point state.
 * @param {boolean=} opt_value Select state to set.
 * @return {(boolean|anychart.core.Point)} Select state of self for chaining.
 */
anychart.core.Point.prototype.selected = function(opt_value) {
  var chart = /** @type {anychart.charts.Funnel|anychart.charts.Pyramid} */ (this.getChart());
  var state = chart.state.hasPointStateByPointIndex(anychart.PointState.SELECT, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        chart.select(this.index);
      else
        chart.unselect(this.index);
      return this;
    }
  }
  return state;
};


/**
 * Method need to check the existence of the current point.
 * @return {boolean} Whether point exists in dataset or not.
 */
anychart.core.Point.prototype.exists = function() {
  return (this.index < (/** @type {{data:Function}} */(this.chart)).data().getRowsCount());
};


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.Point.prototype.getStat = function(key) {
  return goog.isDef(this.statistics[key]) ? this.statistics[key] : this.get(key);
};


//exports
(function() {
  var proto = anychart.core.Point.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['getChart'] = proto.getChart;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['exists'] = proto.exists;
  proto['getStat'] = proto.getStat;
})();
