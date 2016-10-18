goog.provide('anychart.standalones.grids.Linear3d');
goog.require('anychart.core.grids.Linear3d');



/**
 * @constructor
 * @extends {anychart.core.grids.Linear3d}
 */
anychart.standalones.grids.Linear3d = function() {
  anychart.standalones.grids.Linear3d.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Linear3d, anychart.core.grids.Linear3d);
anychart.core.makeStandalone(anychart.standalones.grids.Linear3d, anychart.core.grids.Linear3d);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear3d}
 */
anychart.standalones.grids.linear3d = function() {
  var grid = new anychart.standalones.grids.Linear3d();
  grid.setup(anychart.getFullTheme()['standalones']['linearGrid']);
  return grid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear3d}
 * @deprecated Since 7.12.0. Use anychart.standalones.grids.linear3d instead.
 */
anychart.grids.linear3d = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.grids.linear3d', 'anychart.standalones.grids.linear3d'], true);
  return anychart.standalones.grids.linear3d();
};


//exports
goog.exportSymbol('anychart.grids.linear3d', anychart.grids.linear3d);
goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.standalones.grids.linear3d);
anychart.standalones.grids.Linear3d.prototype['draw'] = anychart.standalones.grids.Linear3d.prototype.draw;
anychart.standalones.grids.Linear3d.prototype['parentBounds'] = anychart.standalones.grids.Linear3d.prototype.parentBounds;
anychart.standalones.grids.Linear3d.prototype['container'] = anychart.standalones.grids.Linear3d.prototype.container;
