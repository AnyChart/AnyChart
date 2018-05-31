//region --- Requiring and Providing
goog.provide('anychart.radarPolarBaseModule.RadialAxisTicks');
goog.require('anychart.core.AxisTicks');
//endregion



/**
 * Axis radar ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.AxisTicks}
 */
anychart.radarPolarBaseModule.RadialAxisTicks = function() {
  anychart.radarPolarBaseModule.RadialAxisTicks.base(this, 'constructor');
};
goog.inherits(anychart.radarPolarBaseModule.RadialAxisTicks, anychart.core.AxisTicks);


//region --- Drawers
/**
 * Axis ticks drawer for top orientation.
 * @param {number} x .
 * @param {number} y .
 * @param {number} x1 .
 * @param {number} y1 .
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.drawTick = function(x, y, x1, y1) {
  this.path.moveTo(x, y);
  this.path.lineTo(x1, y1);
};
//endregion
