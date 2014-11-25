goog.provide('anychart.grids.Polar');
goog.require('anychart.core.grids.Polar');



/**
 * @constructor
 * @extends {anychart.core.grids.Polar}
 */
anychart.grids.Polar = function() {
  goog.base(this);
};
goog.inherits(anychart.grids.Polar, anychart.core.grids.Polar);


/**
 * Constructor function.
 * @return {!anychart.grids.Polar}
 */
anychart.grids.polar = function() {
  return new anychart.grids.Polar();
};


//exports
goog.exportSymbol('anychart.grids.polar', anychart.grids.polar);
