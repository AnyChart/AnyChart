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
  background.setupInternal(true, anychart.getFullTheme('standalones.background'));
  return background;
};


//exports
//proto['getRemainingBounds'] = proto.getRemainingBounds;
(function() {
  var proto = anychart.standalones.Background.prototype;
  goog.exportSymbol('anychart.standalones.background', anychart.standalones.background);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
