goog.provide('anychart.standalones.grids.Linear');
goog.require('anychart.core.grids.Linear');



/**
 * @constructor
 * @extends {anychart.core.grids.Linear}
 */
anychart.standalones.grids.Linear = function() {
  anychart.standalones.grids.Linear.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Linear, anychart.core.grids.Linear);
anychart.core.makeStandalone(anychart.standalones.grids.Linear, anychart.core.grids.Linear);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear}
 */
anychart.standalones.grids.linear = function() {
  var grid = new anychart.standalones.grids.Linear();
  grid.setup(anychart.getFullTheme('standalones.linearGrid'));
  return grid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Linear}
 * @deprecated Since 7.12.0. Use anychart.standalones.grids.linear instead.
 */
anychart.grids.linear = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.grids.linear()', 'anychart.standalones.grids.linear()', null, 'Constructor'], true);
  return anychart.standalones.grids.linear();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.grids.Linear.prototype;
  goog.exportSymbol('anychart.grids.linear', anychart.grids.linear);
  goog.exportSymbol('anychart.standalones.grids.linear', anychart.standalones.grids.linear);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
