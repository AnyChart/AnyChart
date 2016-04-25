goog.provide('anychart.core.MapPoint');
goog.require('anychart.core.Point');



/**
 * Point representing all points that belongs to series-based chart.
 * @param {anychart.core.SeparateChart} parentMap Parent map chart. That own this point.
 * @param {anychart.core.SeparateChart} currentMap Current map chart. Current visible map on stage.
 * @param {Object} properties Feature properties.
 * @param {?string} id Feature geo id.
 * @constructor
 * @extends {anychart.core.Point}
 */
anychart.core.MapPoint = function(parentMap, currentMap, properties, id) {
  goog.base(this, parentMap, NaN);

  /**
   * Feature geo id.
   * @type {?string}
   * @protected
   */
  this.id = id;

  /**
   * Feature properties.
   * @type {Object}
   */
  this.prop = properties;

  /**
   * Current map.
   * @type {anychart.core.SeparateChart}
   */
  this.currentChart = currentMap;
};
goog.inherits(anychart.core.MapPoint, anychart.core.Point);


/**
 * Returns point geo id.
 * @return {?string}
 */
anychart.core.MapPoint.prototype.getId = function() {
  return this.id;
};


/**
 * Returns point geo properties.
 * @return {Object}
 */
anychart.core.MapPoint.prototype.getProperties = function() {
  return this.prop;
};


/**
 * Returns current map. Current visible map on stage.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.MapPoint.prototype.getCurrentChart = function() {
  return this.currentChart;
};


/**
 * Returns point parent map chart. That own this point.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.MapPoint.prototype.getParentChart = function() {
  return this.getChart();
};


//exports
anychart.core.MapPoint.prototype['getId'] = anychart.core.MapPoint.prototype.getId;
anychart.core.MapPoint.prototype['getProperties'] = anychart.core.MapPoint.prototype.getProperties;
anychart.core.MapPoint.prototype['getCurrentChart'] = anychart.core.MapPoint.prototype.getCurrentChart;
anychart.core.MapPoint.prototype['getParentChart'] = anychart.core.MapPoint.prototype.getParentChart;
