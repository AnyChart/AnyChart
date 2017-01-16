goog.provide('anychart.core.TreeMapPoint');
goog.require('anychart.core.Point');



/**
 * Class that wraps point of series/chart.
 * @param {anychart.charts.TreeMap} chart Chart which point belongs to.
 * @param {anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem} node Node that represents point.
 * @extends {anychart.core.Point}
 * @constructor
 */
anychart.core.TreeMapPoint = function(chart, node) {
  /**
   * Chart which point belongs to.
   * @type {anychart.charts.TreeMap}
   * @protected
   */
  this.chart = chart;

  /**
   * Node that represents point.
   * @type {anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem}
   */
  this.node = node;

  /**
   * Linear index of the point.
   * @type {number}
   * @protected
   */
  this.index = /** @type {number} */ (node.meta('index'));
};
goog.inherits(anychart.core.TreeMapPoint, anychart.core.Point);


/**
 * Getter for point linear index.
 * @return {number} Index of point.
 */
anychart.core.TreeMapPoint.prototype.getIndex = function() {
  return this.index;
};


/**
 * Getter for chart which current point belongs to.
 * @return {anychart.core.SeparateChart} Chart.
 */
anychart.core.TreeMapPoint.prototype.getChart = function() {
  return this.chart;
};


/**
 * Returns node that was wrapped.
 * @return {anychart.data.Tree.DataItem|anychart.data.TreeView.DataItem}
 */
anychart.core.TreeMapPoint.prototype.getNode = function() {
  return this.node;
};


/**
 * Gets value from data by path specified.
 * @param {...*} var_args - Arguments.
 * @return {*}
 */
anychart.core.TreeMapPoint.prototype.get = function(var_args) {
  return this.node.get.apply(this.node, arguments);
};


/**
 * Sets value to the data by path.
 * @param {...*} var_args - Arguments.
 * @return {anychart.core.TreeMapPoint}
 */
anychart.core.TreeMapPoint.prototype.set = function(var_args) {
  this.node.set.apply(this.node, arguments);
  return this;
};


/**
 * Getter/setter for hover point state.
 * @param {boolean=} opt_value Hover state to set.
 * @return {(boolean|anychart.core.TreeMapPoint)} Hover state of self for chaining.
 */
anychart.core.TreeMapPoint.prototype.hovered = function(opt_value) {
  var state = this.chart.state.hasPointStateByPointIndex(anychart.PointState.HOVER, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        this.chart.hoverPoint(this.index);
      else
        this.chart.unhover(this.index);
      return this;
    }
  }
  return state;
};


/**
 * Getter/setter for select point state.
 * @param {boolean=} opt_value Select state to set.
 * @return {(boolean|anychart.core.TreeMapPoint)} Select state of self for chaining.
 */
anychart.core.TreeMapPoint.prototype.selected = function(opt_value) {
  // node with children can not be selected
  if (this.node.numChildren()) {
    if (goog.isDef(opt_value))
      return this;
    return false;
  }
  var state = this.chart.state.hasPointStateByPointIndex(anychart.PointState.SELECT, this.index);
  if (goog.isDef(opt_value)) {
    if (state != opt_value) {
      if (opt_value)
        this.chart.selectPoint(this.index);
      else
        this.chart.unselect(this.index);
      return this;
    }
  }
  return state;
};


/**
 * Method need to check the existence of the current point.
 * @return {boolean} Whether point exists in dataset or not.
 */
anychart.core.TreeMapPoint.prototype.exists = function() {
  return true;
};


//exports
(function() {
  var proto = anychart.core.TreeMapPoint.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['getChart'] = proto.getChart;
  proto['getNode'] = proto.getNode;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['exists'] = proto.exists;
})();
