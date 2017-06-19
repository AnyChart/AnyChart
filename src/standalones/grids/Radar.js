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
  grid.setup(anychart.getFullTheme('standalones.radarGrid'));
  return grid;
};


//exports
(function() {
  var proto = anychart.standalones.grids.Radar.prototype;
  goog.exportSymbol('anychart.standalones.grids.radar', anychart.standalones.grids.radar);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['startAngle'] = proto.startAngle;
  proto['innerRadius'] = proto.innerRadius;
})();
