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
  var res = new anychart.grids.Linear();
  res.setup(anychart.getFullTheme()['standalones']['linearGrid']);
  return res;
};


//exports
goog.exportSymbol('anychart.grids.linear', anychart.grids.linear);
anychart.grids.Linear.prototype['draw'] = anychart.grids.Linear.prototype.draw;
anychart.grids.Linear.prototype['parentBounds'] = anychart.grids.Linear.prototype.parentBounds;
anychart.grids.Linear.prototype['container'] = anychart.grids.Linear.prototype.container;
