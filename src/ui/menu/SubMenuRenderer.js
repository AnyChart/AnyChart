goog.provide('anychart.ui.menu.SubMenuRenderer');

goog.require('anychart.ui.menu.Menu');
goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.style');
goog.require('goog.ui.MenuItemRenderer');



/**
 * Default renderer for {@link anychart.ui.SubMenu}s. Each item has the following
 * structure:
 *    <div class="anychart-submenu">
 *      ...(menuitem content)...
 *      <div class="anychart-menu">
 *        ... (submenu content) ...
 *      </div>
 *    </div>
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
anychart.ui.menu.SubMenuRenderer = function() {
  anychart.ui.menu.SubMenuRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.menu.SubMenuRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(anychart.ui.menu.SubMenuRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
anychart.ui.menu.SubMenuRenderer.CSS_CLASS = goog.getCssName('anychart-submenu');


/**
 * The CSS class for submenus that displays the submenu arrow.
 * @type {string}
 * @private
 */
anychart.ui.menu.SubMenuRenderer.CSS_CLASS_SUBMENU_ = goog.getCssName('anychart-submenu-arrow');


/**
 * Overrides {@link goog.ui.MenuItemRenderer#createDom} by adding
 * the additional class 'anychart-submenu' to the created element,
 * and passes the element to {@link anychart.ui.menu.SubMenuItemRenderer#addArrow_}
 * to add an child element that can be styled to show an arrow.
 * @param {goog.ui.Control} control goog.ui.SubMenu to render.
 * @return {!Element} Root element for the item.
 * @override
 */
anychart.ui.menu.SubMenuRenderer.prototype.createDom = function(control) {
  var subMenu = /** @type {goog.ui.SubMenu} */ (control);
  var element = anychart.ui.menu.SubMenuRenderer.superClass_.createDom.call(this, subMenu);
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, anychart.ui.menu.SubMenuRenderer.CSS_CLASS);
  this.addArrow_(subMenu, element);
  return element;
};


/**
 * Overrides {@link goog.ui.MenuItemRenderer#decorate} by adding the additional class 'anychart-submenu' to the decorated element,
 * and passing the element to renderer to add a child element that can be styled to show an arrow.
 * Also searches the element for a child with the class anychart-menu. If a matching child element is found, creates a
 * anychart.ui.menu.Menu, uses it to decorate the child element, and passes that menu to subMenu.setMenu.
 * @param {goog.ui.Control} control - SubMenu to render.
 * @param {Element} element - Element to decorate.
 * @return {!Element} - Root element for the item.
 * @override
 */
anychart.ui.menu.SubMenuRenderer.prototype.decorate = function(control, element) {
  var subMenu = /** @type {goog.ui.SubMenu} */ (control);
  element = anychart.ui.menu.SubMenuRenderer.superClass_.decorate.call(
      this, subMenu, element);
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, anychart.ui.menu.SubMenuRenderer.CSS_CLASS);
  this.addArrow_(subMenu, element);

  // Search for a child menu and decorate it.
  var childMenuEls = goog.dom.getElementsByTagNameAndClass('div', goog.getCssName('anychart-menu'), element);
  if (childMenuEls.length) {
    var childMenu = new anychart.ui.menu.Menu(subMenu.getDomHelper());
    var childMenuEl = childMenuEls[0];
    // Hide the menu element before attaching it to the document body; see bug 1089244.
    goog.style.setElementShown(childMenuEl, false);
    subMenu.getDomHelper().getDocument().body.appendChild(childMenuEl);
    childMenu.decorate(childMenuEl);
    subMenu.setMenu(childMenu, true);
  }
  return element;
};


/**
 * Takes a menu item's root element, and sets its content to the given text
 * caption or DOM structure.  Overrides the superclass implementation by
 * making sure that the submenu arrow structure is preserved.
 * @param {Element} element The item's root element.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to be
 *     set as the item's content.
 * @override
 */
anychart.ui.menu.SubMenuRenderer.prototype.setContent = function(element, content) {
  // Save the submenu arrow element, if present.
  var contentElement = this.getContentElement(element);
  var arrowElement = contentElement && contentElement.lastChild;
  anychart.ui.menu.SubMenuRenderer.superClass_.setContent.call(this, element, content);
  // If the arrowElement was there, is no longer there, and really was an arrow, reappend it.
  if (arrowElement &&
      contentElement.lastChild != arrowElement &&
      goog.dom.classlist.contains(/** @type {!Element} */ (arrowElement),
          anychart.ui.menu.SubMenuRenderer.CSS_CLASS_SUBMENU_)) {
    contentElement.appendChild(arrowElement);
  }
};


/**
 * Overrides {@link goog.ui.MenuItemRenderer#initializeDom} to tweak
 * the DOM structure for the span.anychart-submenu-arrow element
 * depending on the text direction (LTR or RTL). When the SubMenu is RTL
 * the arrow will be given the additional class of anychart-submenu-arrow-rtl,
 * and the arrow will be moved up to be the first child in the SubMenu's
 * element. Otherwise the arrow will have the class anychart-submenu-arrow-ltr,
 * and be kept as the last child of the SubMenu's element.
 * @param {goog.ui.Control} control goog.ui.SubMenu whose DOM is to be
 *     initialized as it enters the document.
 * @override
 */
anychart.ui.menu.SubMenuRenderer.prototype.initializeDom = function(control) {
  var subMenu = /** @type {goog.ui.SubMenu} */ (control);
  anychart.ui.menu.SubMenuRenderer.superClass_.initializeDom.call(this, subMenu);
  var element = subMenu.getContentElement();
  var arrow = subMenu.getDomHelper().getElementsByTagNameAndClass(
      'span', anychart.ui.menu.SubMenuRenderer.CSS_CLASS_SUBMENU_, element)[0];
  /*
    ACDVF must work with any encoding
      <code>
        //This will not be correctly in ASCII mode in browser.
        var leftArrow = '\u25C4';
        var rightArrow = '\u25BA';
        var nbsp = '\u00A0';
      </code>

    That's why we override some closure library's features.
    In current case we disable arrow's rtl and ltr and set arrow with CSS.
   */
  arrow.innerHTML = '&nbsp;';
  if (arrow != element.lastChild) {
    element.appendChild(arrow);
  }
  var subMenuElement = subMenu.getElement();
  goog.asserts.assert(subMenuElement, 'The sub menu DOM element cannot be null.');
  goog.a11y.aria.setState(subMenuElement, goog.a11y.aria.State.HASPOPUP, 'true');
};


/**
 * Appends a child node with the class goog.getCssName('anychart-submenu-arrow') or
 * 'anychart-submenu-arrow-rtl' which can be styled to show an arrow.
 * @param {goog.ui.SubMenu} subMenu SubMenu to render.
 * @param {Element} element Element to decorate.
 * @private
 */
anychart.ui.menu.SubMenuRenderer.prototype.addArrow_ = function(subMenu, element) {
  var arrow = subMenu.getDomHelper().createDom('span');
  arrow.className = anychart.ui.menu.SubMenuRenderer.CSS_CLASS_SUBMENU_;
  arrow.innerHTML = '&nbsp;';
  this.getContentElement(element).appendChild(arrow);
};
