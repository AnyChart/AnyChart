goog.provide('anychart.ui.menu.Menu');

goog.require('goog.ui.Menu');



/**
 * A basic menu class.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.MenuRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Menu}
 */
anychart.ui.menu.Menu = function(opt_domHelper, opt_renderer) {
  anychart.ui.menu.Menu.base(this, 'constructor', opt_domHelper, opt_renderer);

  /**
   * Scrollable container.
   * @type {Element}
   * @private
   */
  this.scrollableContainer_ = null;
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


/**
 * Get scrollable container.
 * @return {Element}
 */
anychart.ui.menu.Menu.prototype.getScrollableContainer = function() {
  return this.scrollableContainer_;
};


/**
 * @type {string}
 */
anychart.ui.menu.Menu.CSS_CLASS_SCROLLABLE = goog.getCssName('anychart-menu-scrollable');


/**
 * Creates the container's DOM.
 * @override
 */
anychart.ui.menu.Menu.prototype.createDom = function() {
  anychart.ui.menu.Menu.superClass_.createDom.call(this);

  this.scrollableContainer_ = this.getDomHelper().createDom(goog.dom.TagName.DIV, anychart.ui.menu.Menu.CSS_CLASS_SCROLLABLE);
  this.getDomHelper().insertChildAt(this.getElement(), this.scrollableContainer_, 0);
};


/** @override */
anychart.ui.menu.Menu.prototype.setHighlightedIndex = function(index) {
  anychart.ui.menu.Menu.base(this, 'setHighlightedIndex', index);

  // Support scrollable container.
  var child = this.getChildAt(index);
  if (child) {
    goog.style.scrollIntoContainerView(child.getElement(), this.getScrollableContainer());
  }
};
