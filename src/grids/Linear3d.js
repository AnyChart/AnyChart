goog.provide('anychart.grids.Linear3d');
goog.require('anychart.core.grids.Linear3d');



/**
 * @constructor
 * @extends {anychart.core.grids.Linear3d}
 */
anychart.grids.Linear3d = function() {
  anychart.grids.Linear3d.base(this, 'constructor');
};
goog.inherits(anychart.grids.Linear3d, anychart.core.grids.Linear3d);


/**
 * Constructor function.
 * @return {!anychart.core.grids.Linear3d}
 */
anychart.grids.linear3d = function() {
  var res = new anychart.grids.Linear3d();
  res.setup(anychart.getFullTheme()['standalones']['linearGrid']);
  return res;
};


//exports
goog.exportSymbol('anychart.grids.linear3d', anychart.grids.linear3d);
anychart.grids.Linear3d.prototype['draw'] = anychart.grids.Linear3d.prototype.draw;
anychart.grids.Linear3d.prototype['parentBounds'] = anychart.grids.Linear3d.prototype.parentBounds;
anychart.grids.Linear3d.prototype['container'] = anychart.grids.Linear3d.prototype.container;
