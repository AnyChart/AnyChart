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
  var res = new anychart.grids.Radar();
  res.setup(anychart.getFullTheme()['standalones']['radarGrid']);
  return res;
};


//exports
goog.exportSymbol('anychart.grids.radar', anychart.grids.radar);
anychart.grids.Radar.prototype['draw'] = anychart.grids.Radar.prototype.draw;
anychart.grids.Radar.prototype['parentBounds'] = anychart.grids.Radar.prototype.parentBounds;
anychart.grids.Radar.prototype['container'] = anychart.grids.Radar.prototype.container;
anychart.grids.Radar.prototype['startAngle'] = anychart.grids.Radar.prototype.startAngle;
