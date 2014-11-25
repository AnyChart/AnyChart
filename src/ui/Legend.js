goog.provide('anychart.ui.Legend');
goog.require('anychart.core.ui.Legend');



/**
 * @constructor
 * @extends {anychart.core.ui.Legend}
 */
anychart.ui.Legend = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.Legend, anychart.core.ui.Legend);


/**
 * Constructor function.
 * @return {!anychart.ui.Legend}
 */
anychart.ui.legend = function() {
  return new anychart.ui.Legend();
};


//exports
goog.exportSymbol('anychart.ui.legend', anychart.ui.legend);
