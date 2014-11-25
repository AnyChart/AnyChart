goog.provide('anychart.ui.Title');
goog.require('anychart.core.ui.Title');



/**
 * @constructor
 * @extends {anychart.core.ui.Title}
 */
anychart.ui.Title = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.Title, anychart.core.ui.Title);


/**
 * Constructor function.
 * @return {!anychart.ui.Title}
 */
anychart.ui.title = function() {
  return new anychart.ui.Title();
};


//exports
goog.exportSymbol('anychart.ui.title', anychart.ui.title);
