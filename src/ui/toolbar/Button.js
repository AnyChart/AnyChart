goog.provide('anychart.ui.toolbar.Button');

goog.require('anychart.ui.toolbar.ButtonRenderer');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.registry');



/**
 * A button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *     render or decorate the button; defaults to
 *     {@link goog.ui.ToolbarButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ToolbarButton}
 */
anychart.ui.toolbar.Button = function(content, opt_renderer, opt_domHelper) {
  anychart.ui.toolbar.Button.base(this, 'constructor', content, opt_renderer ||
      anychart.ui.toolbar.ButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(anychart.ui.toolbar.Button, goog.ui.ToolbarButton);


// Registers a decorator factory function for toolbar buttons.
goog.ui.registry.setDecoratorByClassName(
    anychart.ui.toolbar.ButtonRenderer.CSS_CLASS,
    function() {
      return new anychart.ui.toolbar.Button(null);
    });
