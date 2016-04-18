goog.provide('anychart.ui.menu.Menu');

goog.require('anychart.ui.menu.Renderer');
goog.require('goog.ui.Menu');



/**
 * A basic menu class.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {anychart.ui.menu.Renderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link anychart.ui.menu.Renderer}.
 * @constructor
 * @extends {goog.ui.Menu}
 */
anychart.ui.menu.Menu = function(opt_domHelper, opt_renderer) {
  anychart.ui.menu.Menu.base(this, 'constructor', opt_domHelper,
      opt_renderer || anychart.ui.menu.Renderer.getInstance());
};
goog.inherits(anychart.ui.menu.Menu, goog.ui.Menu);
goog.tagUnsealableClass(anychart.ui.menu.Menu);


/** @override */
anychart.ui.menu.Menu.prototype.handleEnterItem = function(e) {
  if (this.getAllowAutoFocus()) {
    var target = this.getKeyEventTarget();
    // IE<9 dies on focus to hidden element
    if (target.offsetWidth != 0) {
      target.focus();
    }
  }

  return true;
};
