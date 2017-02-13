goog.provide('anychart.standalones.Label');
goog.require('anychart.core.ui.Label');



/**
 * @constructor
 * @extends {anychart.core.ui.Label}
 */
anychart.standalones.Label = function() {
  anychart.standalones.Label.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Label, anychart.core.ui.Label);
anychart.core.makeStandalone(anychart.standalones.Label, anychart.core.ui.Label);


/**
 * Constructor function.
 * @return {!anychart.standalones.Label}
 */
anychart.standalones.label = function() {
  var label = new anychart.standalones.Label();
  label.setup(anychart.getFullTheme('standalones.label'));
  return label;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.Label}
 * @deprecated Since 7.12.0. Use anychart.standalones.label instead.
 */
anychart.ui.label = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.label()', 'anychart.standalones.label()', null, 'Constructor'], true);
  return anychart.standalones.label();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.Label.prototype;
  goog.exportSymbol('anychart.ui.label', anychart.ui.label);
  goog.exportSymbol('anychart.standalones.label', anychart.standalones.label);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
