goog.provide('anychart.ui.button.Toggle');

goog.require('anychart.ui.button.Base');
goog.require('goog.ui.Component.State');



/**
 * @param {goog.ui.ControlContent=} opt_content
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.ui.button.Base}
 */
anychart.ui.button.Toggle = function(opt_content, opt_renderer, opt_domHelper) {
  anychart.ui.button.Toggle.base(this, 'constructor', opt_content, opt_renderer, opt_domHelper);

  this.addClassName(goog.ui.INLINE_BLOCK_CLASSNAME);
  this.addClassName('anychart-button-standard');
  this.addClassName(anychart.ui.button.Toggle.CSS_CLASS);

  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
  this.setAutoStates(goog.ui.Component.State.CHECKED, false);
};
goog.inherits(anychart.ui.button.Toggle, anychart.ui.button.Base);


/** @type {string} */
anychart.ui.button.Toggle.CSS_CLASS = goog.getCssName('anychart-button-toggle');
