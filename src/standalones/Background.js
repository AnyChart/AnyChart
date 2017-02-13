goog.provide('anychart.standalones.Background');
goog.require('anychart.core.ui.Background');



/**
 * @constructor
 * @extends {anychart.core.ui.Background}
 */
anychart.standalones.Background = function() {
  anychart.standalones.Background.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Background, anychart.core.ui.Background);
anychart.core.makeStandalone(anychart.standalones.Background, anychart.core.ui.Background);


/**
 * Constructor function.
 * @return {!anychart.standalones.Background}
 */
anychart.standalones.background = function() {
  var background = new anychart.standalones.Background();
  background.setupByVal(anychart.getFullTheme('standalones.background'), true);
  return background;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.Background}
 * @deprecated Since 7.12.0. Use anychart.standalones.background instead.
 */
anychart.ui.background = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.background()', 'anychart.standalones.background()', null, 'Constructor'], true);
  return anychart.standalones.background();
};


//exports
//proto['getRemainingBounds'] = proto.getRemainingBounds;
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.Background.prototype;
  goog.exportSymbol('anychart.standalones.background', anychart.standalones.background);
  goog.exportSymbol('anychart.ui.background', anychart.ui.background);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
