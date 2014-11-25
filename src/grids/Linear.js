goog.provide('anychart.grids.Linear');
goog.require('anychart.core.grids.Linear');



/**
 * @constructor
 * @extends {anychart.core.grids.Linear}
 */
anychart.grids.Linear = function() {
  goog.base(this);
};
goog.inherits(anychart.grids.Linear, anychart.core.grids.Linear);


/**
 * Constructor function.
 * @return {!anychart.core.grids.Linear}
 */
anychart.grids.linear = function() {
  return new anychart.grids.Linear();
};


//exports
goog.exportSymbol('anychart.grids.linear', anychart.grids.linear);//doc|ex
