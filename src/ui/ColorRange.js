goog.provide('anychart.ui.ColorRange');
goog.require('anychart.core.ui.ColorRange');



/**
 * @constructor
 * @extends {anychart.core.ui.ColorRange}
 */
anychart.ui.ColorRange = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.ColorRange, anychart.core.ui.ColorRange);


/**
 * Returns color range instance.
 * @return {!anychart.ui.ColorRange}
 */
anychart.ui.colorRange = function() {
  return new anychart.ui.ColorRange();
};


//exports
goog.exportSymbol('anychart.ui.colorRange', anychart.ui.colorRange);
anychart.ui.ColorRange.prototype['padding'] = anychart.ui.ColorRange.prototype.padding;
anychart.ui.ColorRange.prototype['draw'] = anychart.ui.ColorRange.prototype.draw;
anychart.ui.ColorRange.prototype['parentBounds'] = anychart.ui.ColorRange.prototype.parentBounds;
anychart.ui.ColorRange.prototype['container'] = anychart.ui.ColorRange.prototype.container;
anychart.ui.ColorRange.prototype['colorLineSize'] = anychart.ui.ColorRange.prototype.colorLineSize;

