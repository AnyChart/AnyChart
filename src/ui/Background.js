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
  var res = new anychart.ui.Background();
  res.setup(anychart.getFullTheme()['standalones']['background']);
  return res;
};


//exports
goog.exportSymbol('anychart.ui.background', anychart.ui.background);
anychart.ui.Background.prototype['draw'] = anychart.ui.Background.prototype.draw;
anychart.ui.Background.prototype['parentBounds'] = anychart.ui.Background.prototype.parentBounds;
anychart.ui.Background.prototype['container'] = anychart.ui.Background.prototype.container;
