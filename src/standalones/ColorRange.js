goog.provide('anychart.standalones.ColorRange');
goog.require('anychart.core.ui.ColorRange');



/**
 * @constructor
 * @extends {anychart.core.ui.ColorRange}
 */
anychart.standalones.ColorRange = function() {
  anychart.standalones.ColorRange.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ColorRange, anychart.core.ui.ColorRange);
anychart.core.makeStandalone(anychart.standalones.ColorRange, anychart.core.ui.ColorRange);


/**
 * Returns color range instance.
 * @return {!anychart.standalones.ColorRange}
 */
anychart.standalones.colorRange = function() {
  var colorRange = new anychart.standalones.ColorRange();
  colorRange.setupByVal(anychart.getFullTheme('standalones.colorRange'), true);
  return colorRange;
};


/**
 * Returns color range instance.
 * @return {!anychart.standalones.ColorRange}
 * @deprecated Since 7.12.0. Use anychart.standalones.colorRange instead.
 */
anychart.ui.colorRange = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.colorRange()', 'anychart.standalones.colorRange()', null, 'Constructor'], true);
  return anychart.standalones.colorRange();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.ColorRange.prototype;
  goog.exportSymbol('anychart.ui.colorRange', anychart.ui.colorRange);
  goog.exportSymbol('anychart.standalones.colorRange', anychart.standalones.colorRange);
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['colorLineSize'] = proto.colorLineSize;
})();

