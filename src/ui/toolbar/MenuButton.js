goog.provide('anychart.ui.toolbar.MenuButton');

goog.require('anychart.ui.toolbar.MenuButtonRenderer');
goog.require('goog.ui.ToolbarMenuButton');



/**
 * A menu button control for a toolbar.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {anychart.ui.menu.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Optional renderer used to
 *     render or decorate the button; defaults to
 *     {@link anychart.ui.toolbar.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ToolbarMenuButton}
 */
anychart.ui.toolbar.MenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) {
  anychart.ui.toolbar.MenuButton.base(this, 'constructor', content, opt_menu, opt_renderer ||
      anychart.ui.toolbar.MenuButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(anychart.ui.toolbar.MenuButton, goog.ui.ToolbarMenuButton);


/** @override */
anychart.ui.toolbar.MenuButton.prototype.handleKeyEventInternal = function(e) {
  // Handle SPACE on keyup and all other keys on keypress.
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    // Prevent page scrolling in Chrome.
    e.preventDefault();
    if (e.type != goog.events.EventType.KEYUP) {
      // Ignore events because KeyCodes.SPACE is handled further down.
      return true;
    }
  } else if (e.type != goog.events.KeyHandler.EventType.KEY) {
    return false;
  }

  var menu = this.getMenu();
  if (menu && menu.isVisible()) {
    return menu.handleKeyEvent(e);
    /*
     TODO (Constantine Melnikov):
     This code was commented because
     to be able to keep the menu opened when the ENTER event for the menu item.
     Used for ganttToolbar in switchLayout item as button.

     The mechanism of hiding the menu via ENTER not broken,
     because ENTER triggers the ACTION event which hides the menu.
     see goog.ui.Control.prototype.performActionInternal
     */
    //// Menu is open.
    //var isEnterOrSpace = e.keyCode == goog.events.KeyCodes.ENTER ||
    //    e.keyCode == goog.events.KeyCodes.SPACE;
    //var handledByMenu = menu.handleKeyEvent(e);
    //if (e.keyCode == goog.events.KeyCodes.ESC || isEnterOrSpace) {
    //  // Dismiss the menu.
    //  this.setOpen(false);
    //  return true;
    //}
    //return handledByMenu;
  }

  if (e.keyCode == goog.events.KeyCodes.DOWN ||
      e.keyCode == goog.events.KeyCodes.UP ||
      e.keyCode == goog.events.KeyCodes.SPACE ||
      e.keyCode == goog.events.KeyCodes.ENTER) {
    // Menu is closed, and the user hit the down/up/space/enter key; open menu.
    this.setOpen(true, e);
    return true;
  }

  // Key event wasn't handled by the component.
  return false;
};
