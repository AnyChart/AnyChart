goog.provide('anychart.standalones.grids.Polar');
goog.require('anychart.core.grids.Polar');



/**
 * @constructor
 * @extends {anychart.core.grids.Polar}
 */
anychart.standalones.grids.Polar = function() {
  anychart.standalones.grids.Polar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Polar, anychart.core.grids.Polar);
anychart.core.makeStandalone(anychart.standalones.grids.Polar, anychart.core.grids.Polar);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Polar}
 */
anychart.standalones.grids.polar = function() {
  var grid = new anychart.standalones.grids.Polar();
  grid.setup(anychart.getFullTheme()['standalones']['polarGrid']);
  return grid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Polar}
 * @deprecated Since 7.12.0. Use anychart.standalones.grids.polar instead.
 */
anychart.grids.polar = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.grids.polar', 'anychart.standalones.grids.polar'], true);
  return anychart.standalones.grids.polar();
};


//exports
goog.exportSymbol('anychart.grids.polar', anychart.grids.polar);
goog.exportSymbol('anychart.standalones.grids.polar', anychart.standalones.grids.polar);
anychart.standalones.grids.Polar.prototype['draw'] = anychart.standalones.grids.Polar.prototype.draw;
anychart.standalones.grids.Polar.prototype['parentBounds'] = anychart.standalones.grids.Polar.prototype.parentBounds;
anychart.standalones.grids.Polar.prototype['container'] = anychart.standalones.grids.Polar.prototype.container;
anychart.standalones.grids.Polar.prototype['startAngle'] = anychart.standalones.grids.Polar.prototype.startAngle;
