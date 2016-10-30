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
  title.setupByVal(anychart.getFullTheme()['standalones']['title'], true);
  return title;
};


/**
 * Constructor function.
 * @deprecated Since 7.12.0. Use anychart.standalones.title instead.
 * @return {!anychart.standalones.Title}
 */
anychart.ui.title = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.title', 'anychart.standalones.title'], true);
  return anychart.standalones.title();
};


//exports
goog.exportSymbol('anychart.standalones.title', anychart.standalones.title);
goog.exportSymbol('anychart.ui.title', anychart.ui.title);
anychart.standalones.Title.prototype['draw'] = anychart.standalones.Title.prototype.draw;
anychart.standalones.Title.prototype['parentBounds'] = anychart.standalones.Title.prototype.parentBounds;
anychart.standalones.Title.prototype['container'] = anychart.standalones.Title.prototype.container;
