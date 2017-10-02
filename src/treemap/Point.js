goog.provide('anychart.treemapModule.Point');
goog.require('anychart.core.Point');



/**
 * Class that wraps point of series/chart.
 * @param {anychart.treemapModule.Chart} chart Chart which point belongs to.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} node Node that represents point.
 * @extends {anychart.core.Point}
 * @constructor
 */
anychart.treemapModule.Point = function(chart, node) {
  /**
   * Chart which point belongs to.
   * @type {anychart.treemapModule.Chart}
   * @protected
   */
  this.chart = chart;

  /**
   * Node that represents point.
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   */
  this.node = node;

  /**
   * Linear index of the point.
   * @type {number}
   * @protected
   */
  this.index = /** @type {number} */ (node.meta('index'));
};
goog.inherits(anychart.treemapModule.Point, anychart.core.Point);


/**
 * Getter for point linear index.
 * @return {number} Index of point.
 */
anychart.treemapModule.Point.prototype.getIndex = function() {
  return this.index;
};


/**
 * Getter for chart which current point belongs to.
 * @return {anychart.core.SeparateChart} Chart.
 */
anychart.treemapModule.Point.prototype.getChart = function() {
  return this.chart;
};


/**
 * Returns node that was wrapped.
 * @return {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
 */
anychart.treemapModule.Point.prototype.getNode = function() {
  return this.node;
};


/**
 * Gets value from data by path specified.
 * @param {...*} var_args - Arguments.
 * @return {*}
 */
anychart.treemapModule.Point.prototype.get = function(var_args) {
  return this.node.get.apply(this.node, arguments);
};


/**
 * Sets value to the data by path.
 * @param {...*} var_args - Arguments.
 * @return {anychart.treemapModule.Point}
 */
anychart.treemapModule.Point.prototype.set = function(var_args) {
  this.node.set.apply(this.node, arguments);
  return this;
};


/**
 * Getter/setter for hover point state.
 * @param {boolean=} opt_value Hover state to set.
 * @return {(boolean|anychart.treemapModule.Point)} Hover state of self for chaining.
 */
anychart.treemapModule.Point.prototype.hovered = function(opt_value) {
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
 * @return {(boolean|anychart.treemapModule.Point)} Select state of self for chaining.
 */
anychart.treemapModule.Point.prototype.selected = function(opt_value) {
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
anychart.treemapModule.Point.prototype.exists = function() {
  return true;
};


//exports
(function() {
  var proto = anychart.treemapModule.Point.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['getChart'] = proto.getChart;
  proto['getNode'] = proto.getNode;
  proto['get'] = proto.get;
  proto['set'] = proto.set;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['exists'] = proto.exists;
})();
