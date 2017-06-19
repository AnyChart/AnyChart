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
  colorRange.setupInternal(true, anychart.getFullTheme('standalones.colorRange'));
  return colorRange;
};


//exports
(function() {
  var proto = anychart.standalones.ColorRange.prototype;
  goog.exportSymbol('anychart.standalones.colorRange', anychart.standalones.colorRange);
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['colorLineSize'] = proto.colorLineSize;
})();

