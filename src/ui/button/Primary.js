goog.provide('anychart.ui.button.Primary');
goog.require('anychart.ui.button.Base');



/**
 * @param {goog.ui.ControlContent=} opt_content
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.ui.button.Base}
 */
anychart.ui.button.Primary = function(opt_content, opt_renderer, opt_domHelper) {
  anychart.ui.button.Primary.base(this, 'constructor', opt_content, opt_renderer, opt_domHelper);
  this.addClassName(anychart.ui.button.Primary.CSS_CLASS);
};
goog.inherits(anychart.ui.button.Primary, anychart.ui.button.Base);


/** @type {string} */
anychart.ui.button.Primary.CSS_CLASS = goog.getCssName('anychart-button-primary');
