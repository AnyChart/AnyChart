goog.provide('anychart.standalones.axes.Linear');
goog.require('anychart.core.axes.Linear');



/**
 * @constructor
 * @extends {anychart.core.axes.Linear}
 */
anychart.standalones.axes.Linear = function() {
  anychart.standalones.axes.Linear.base(this, 'constructor');
};
goog.inherits(anychart.standalones.axes.Linear, anychart.core.axes.Linear);
anychart.core.makeStandalone(anychart.standalones.axes.Linear, anychart.core.axes.Linear);


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @example <t>simple-h100</t>
 * anychart.standalones.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @return {!anychart.standalones.axes.Linear}
 */
anychart.standalones.axes.linear = function() {
  var axis = new anychart.standalones.axes.Linear();
  axis.setup(anychart.getFullTheme('standalones.linearAxis'));
  return axis;
};


/**
 * Returns axis instance.<br/>
 * <b>Note:</b> Any axis must be bound to a scale.
 * @example <t>simple-h100</t>
 * anychart.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @return {!anychart.standalones.axes.Linear}
 * @deprecated Since 7.12.0. Use anychart.standalones.axes.linear instead.
 */
anychart.axes.linear = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.axes.linear()', 'anychart.standalones.axes.linear()', null, 'Constructor'], true);
  return anychart.standalones.axes.linear();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.axes.Linear.prototype;
  goog.exportSymbol('anychart.axes.linear', anychart.axes.linear);
  goog.exportSymbol('anychart.standalones.axes.linear', anychart.standalones.axes.linear);
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
