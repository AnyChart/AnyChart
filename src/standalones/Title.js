goog.provide('anychart.standalones.Title');
goog.require('anychart.core.ui.Title');
goog.require('anychart.utils');



/**
 * @constructor
 * @extends {anychart.core.ui.Title}
 */
anychart.standalones.Title = function() {
  anychart.standalones.Title.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Title, anychart.core.ui.Title);
anychart.core.makeStandalone(anychart.standalones.Title, anychart.core.ui.Title);


//region --- STANDALONE ---
/** @inheritDoc */
anychart.standalones.Title.prototype.dependsOnContainerSize = function() {
  //TODO(AntonKagakin): should be reworked to getOption
  var width = this.width();
  var height = this.height();
  return anychart.utils.isPercent(width) || anychart.utils.isPercent(height) || goog.isNull(width) || goog.isNull(height);
};


//endregion
/**
 * Constructor function.
 * @return {!anychart.standalones.Title}
 */
anychart.standalones.title = function() {
  var title = new anychart.standalones.Title();
  title.setupInternal(true, anychart.getFullTheme('standalones.title'));
  return title;
};


//exports
(function() {
  var proto = anychart.standalones.Title.prototype;
  goog.exportSymbol('anychart.standalones.title', anychart.standalones.title);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
