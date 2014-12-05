goog.provide('anychart.axes.Linear');
goog.require('anychart.core.axes.Linear');



/**
 * @constructor
 * @extends {anychart.core.axes.Linear}
 */
anychart.axes.Linear = function() {
  goog.base(this);
};
goog.inherits(anychart.axes.Linear, anychart.core.axes.Linear);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @example <t>simple-h100</t>
 * anychart.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @return {!anychart.axes.Linear}
 */
anychart.axes.linear = function() {
  return new anychart.axes.Linear();
};


//exports
goog.exportSymbol('anychart.axes.linear', anychart.axes.linear);//doc|ex
anychart.axes.Linear.prototype['padding'] = anychart.axes.Linear.prototype.padding;
anychart.axes.Linear.prototype['draw'] = anychart.axes.Linear.prototype.draw;
anychart.axes.Linear.prototype['parentBounds'] = anychart.axes.Linear.prototype.parentBounds;
anychart.axes.Linear.prototype['container'] = anychart.axes.Linear.prototype.container;
