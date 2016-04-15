goog.provide('anychart.core.map.projections.Proj4Wrapper');
goog.require('anychart.core.map.projections.Base');



/**
 * Wrapper for proj4js.
 * @param {string} projectionStr .
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Proj4Wrapper = function(projectionStr) {
  /**
   * @type {string}
   * @private
   */
  this.projection_ = projectionStr;

  /**
   * @type {Function}
   * @private
   */
  this.proj4_ = window['proj4'];
};
goog.inherits(anychart.core.map.projections.Proj4Wrapper, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Proj4Wrapper.prototype.forward = function(x, y) {
  return this.proj4_(this.projection_).forward([x, y]);
};


/** @inheritDoc */
anychart.core.map.projections.Proj4Wrapper.prototype.invert = function(x, y) {
  return this.proj4_(this.projection_).inverse([x, y]);
};
