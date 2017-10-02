goog.provide('anychart.mapModule.Point');
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
anychart.mapModule.Point = function(parentMap, currentMap, properties, id) {
  anychart.mapModule.Point.base(this, 'constructor', parentMap, NaN);

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
goog.inherits(anychart.mapModule.Point, anychart.core.Point);


/** @inheritDoc */
anychart.mapModule.Point.prototype.get = function(field) {
  return goog.isFunction(this.chart.data) ?
      (/** @type {{data:Function}} */(this.chart)).data().get(this.index, field) :
      undefined;
};


/**
 * Returns point geo id.
 * @return {?string}
 */
anychart.mapModule.Point.prototype.getId = function() {
  return this.id;
};


/**
 * Returns point geo properties.
 * @return {Object}
 */
anychart.mapModule.Point.prototype.getProperties = function() {
  return this.prop;
};


/**
 * Returns current map. Current visible map on stage.
 * @return {anychart.core.SeparateChart}
 */
anychart.mapModule.Point.prototype.getCurrentChart = function() {
  return this.currentChart;
};


/**
 * Returns point parent map chart. That own this point.
 * @return {anychart.core.SeparateChart}
 */
anychart.mapModule.Point.prototype.getParentChart = function() {
  return this.getChart();
};


//exports
(function() {
  var proto = anychart.mapModule.Point.prototype;
  proto['getId'] = proto.getId;
  proto['getProperties'] = proto.getProperties;
  proto['getCurrentChart'] = proto.getCurrentChart;
  proto['getParentChart'] = proto.getParentChart;
  proto['get'] = proto.get; // dummy
})();
