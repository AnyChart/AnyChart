goog.provide('anychart.grids.Radar');
goog.require('anychart.core.grids.Radar');



/**
 * @constructor
 * @extends {anychart.core.grids.Radar}
 */
anychart.grids.Radar = function() {
  goog.base(this);
};
goog.inherits(anychart.grids.Radar, anychart.core.grids.Radar);


/**
 * Constructor function.
 * @return {!anychart.grids.Radar}
 */
anychart.grids.radar = function() {
  return new anychart.grids.Radar();
};


//exports
goog.exportSymbol('anychart.grids.radar', anychart.grids.radar);
