goog.provide('anychart.axes.Radar');
goog.require('anychart.core.axes.Radar');



/**
 * @constructor
 * @extends {anychart.core.axes.Radar}
 */
anychart.axes.Radar = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Radar, anychart.core.axes.Radar);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Radar}
 */
anychart.axes.radar = function() {
  return new anychart.axes.Radar();
};


//exports
goog.exportSymbol('anychart.axes.radar', anychart.axes.radar);
