goog.provide('anychart.axes.Radial');
goog.require('anychart.core.axes.Radial');



/**
 * @constructor
 * @extends {anychart.core.axes.Radial}
 */
anychart.axes.Radial = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Radial, anychart.core.axes.Radial);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @return {!anychart.axes.Radial}
 */
anychart.axes.radial = function() {
  return new anychart.axes.Radial();
};


//exports
goog.exportSymbol('anychart.axes.radial', anychart.axes.radial);
anychart.axes.Radial.prototype['draw'] = anychart.axes.Radial.prototype.draw;
anychart.axes.Radial.prototype['parentBounds'] = anychart.axes.Radial.prototype.parentBounds;
anychart.axes.Radial.prototype['container'] = anychart.axes.Radial.prototype.container;
anychart.axes.Radial.prototype['startAngle'] = anychart.axes.Radial.prototype.startAngle;
