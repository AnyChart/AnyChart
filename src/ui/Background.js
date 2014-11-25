goog.provide('anychart.ui.Background');
goog.require('anychart.core.ui.Background');



/**
 * @constructor
 * @extends {anychart.core.ui.Background}
 */
anychart.ui.Background = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.Background, anychart.core.ui.Background);


/**
 * Constructor function.
 * @return {!anychart.ui.Background}
 */
anychart.ui.background = function() {
  return new anychart.ui.Background();
};


//exports
goog.exportSymbol('anychart.ui.background', anychart.ui.background);
