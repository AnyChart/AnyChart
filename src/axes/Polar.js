goog.provide('anychart.axes.Polar');
goog.require('anychart.core.axes.Polar');



/**
 * @constructor
 * @extends {anychart.core.axes.Polar}
 */
anychart.axes.Polar = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Polar, anychart.core.axes.Polar);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Polar}
 */
anychart.axes.polar = function() {
  return new anychart.axes.Polar();
};


//exports
goog.exportSymbol('anychart.axes.polar', anychart.axes.polar);
anychart.axes.Polar.prototype['draw'] = anychart.axes.Polar.prototype.draw;
anychart.axes.Polar.prototype['parentBounds'] = anychart.axes.Polar.prototype.parentBounds;
anychart.axes.Polar.prototype['container'] = anychart.axes.Polar.prototype.container;
anychart.axes.Polar.prototype['startAngle'] = anychart.axes.Polar.prototype.startAngle;
