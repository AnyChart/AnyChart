goog.provide('anychart.ui.button.Secondary');
goog.require('anychart.ui.button.Base');



/**
 * @param {goog.ui.ControlContent=} opt_content
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.ui.button.Base}
 */
anychart.ui.button.Secondary = function(opt_content, opt_renderer, opt_domHelper) {
  anychart.ui.button.Secondary.base(this, 'constructor', opt_content, opt_renderer, opt_domHelper);
  this.addClassName(anychart.ui.button.Secondary.CSS_CLASS);
};
goog.inherits(anychart.ui.button.Secondary, anychart.ui.button.Base);


/** @type {string} */
anychart.ui.button.Secondary.CSS_CLASS = goog.getCssName('anychart-button-secondary');
