goog.provide('anychart.standalones.grids.Radar');
goog.require('anychart.core.grids.Radar');



/**
 * @constructor
 * @extends {anychart.core.grids.Radar}
 */
anychart.standalones.grids.Radar = function() {
  anychart.standalones.grids.Radar.base(this, 'constructor');
};
goog.inherits(anychart.standalones.grids.Radar, anychart.core.grids.Radar);
anychart.core.makeStandalone(anychart.standalones.grids.Radar, anychart.core.grids.Radar);


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Radar}
 */
anychart.standalones.grids.radar = function() {
  var grid = new anychart.standalones.grids.Radar();
  grid.setup(anychart.getFullTheme()['standalones']['radarGrid']);
  return grid;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.grids.Radar}
 * @deprecated Since 7.12.0. Use anychart.standalones.grids.radar instead.
 */
anychart.grids.radar = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.grids.radar', 'anychart.standalones.grids.radar'], true);
  return anychart.standalones.grids.radar();
};


//exports
goog.exportSymbol('anychart.grids.radar', anychart.grids.radar);
goog.exportSymbol('anychart.standalones.grids.radar', anychart.standalones.grids.radar);
anychart.standalones.grids.Radar.prototype['draw'] = anychart.standalones.grids.Radar.prototype.draw;
anychart.standalones.grids.Radar.prototype['parentBounds'] = anychart.standalones.grids.Radar.prototype.parentBounds;
anychart.standalones.grids.Radar.prototype['container'] = anychart.standalones.grids.Radar.prototype.container;
anychart.standalones.grids.Radar.prototype['startAngle'] = anychart.standalones.grids.Radar.prototype.startAngle;
