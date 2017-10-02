goog.provide('anychart.mapModule.projections.Proj4Wrapper');
goog.require('anychart.mapModule.projections.Base');



/**
 * Wrapper for proj4js.
 * @param {string} projectionStr .
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Proj4Wrapper = function(projectionStr) {
  /**
   * @type {string}
   * @private
   */
  this.projection_ = projectionStr;

  /**
   * @type {Function}
   * @private
   */
  this.proj4_ = anychart.window['proj4'];
};
goog.inherits(anychart.mapModule.projections.Proj4Wrapper, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Proj4Wrapper.prototype.forward = function(x, y) {
  return this.proj4_(this.projection_).forward([x, y]);
};


/** @inheritDoc */
anychart.mapModule.projections.Proj4Wrapper.prototype.invert = function(x, y) {
  return this.proj4_(this.projection_).inverse([x, y]);
};
