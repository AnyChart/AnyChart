goog.provide('anychart.standalones.grids.Linear3d');
goog.require('anychart.core.grids.Linear3d');



/**
 * @constructor
 * @extends {anychart.core.grids.Linear3d}
 */
anychart.standalones.grids.Linear3d = function() {
  anychart.standalones.grids.Linear3d.base(this, 'constructor');
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
  grid.setup(anychart.getFullTheme('standalones.linearGrid'));
  return grid;
};


//exports
(function() {
  var proto = anychart.standalones.grids.Linear3d.prototype;
  goog.exportSymbol('anychart.standalones.grids.linear3d', anychart.standalones.grids.linear3d);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
