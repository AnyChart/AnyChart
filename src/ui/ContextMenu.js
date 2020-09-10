goog.provide('anychart.ui.ContextMenu');
goog.provide('anychart.ui.ContextMenu.ActionContext');
goog.provide('anychart.ui.ContextMenu.Item');
goog.provide('anychart.ui.ContextMenu.PrepareItemsContext');

goog.require('anychart.enums');
goog.require('anychart.ui.menu.Item');
goog.require('anychart.ui.menu.SubMenu');
goog.require('goog.array');
goog.require('goog.dom.classlist');
goog.require('goog.object');
goog.require('goog.positioning.ViewportClientPosition');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.PopupMenu');

goog.forwardDeclare('anychart.core.Chart');
goog.forwardDeclare('anychart.core.MouseEvent');
goog.forwardDeclare('anychart.core.Point');
goog.forwardDeclare('anychart.core.VisualBase');
goog.forwardDeclare('anychart.format');



/**
 * Context Menu class.
 * @constructor
 * @extends {goog.ui.PopupMenu}
 */
anychart.ui.ContextMenu = function() {
  anychart.ui.ContextMenu.base(this, 'constructor');

  /**
   * Whether context menu is attached.
   * @type {boolean}
   * @private
   */
  this.attached_ = false;

  /**
   * Save link to visual target on which triggered CONTEXTMENU event for ACTION event on items.
   * @type {Element|anychart.core.VisualBase}
   * @private
   */
  this.contextTarget_ = null;

  /**
   * Link to an element which menu is attached to.
   * @type {anychart.core.Chart|anychart.tableModule.Table}
   * @private
   */
  this.menuParent_ = null;

  /**
   * Additional class name(s) to apply to the context menu's root element, if any.
   * @type {?Array<string>}
   * @private
   */
  this.extraClassNames_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.itemsReady_ = false;

  /**
   * Wrapper element to render elements to.
   * @type {Element}
   * @private
   */
  this.wrapper_ = /** @type {Element} */(goog.dom.createDom('div', {'id': 'anychart-menu-wrapper'}));


  /**
   * Items formatter.
   * This function allows you to change provided menu items and change their order.
   * @param {Object.<string, anychart.ui.ContextMenu.Item>} items Provided menu items.
   * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
   * @this {Object.<string, anychart.ui.ContextMenu.Item>}
   * @return {Object.<string, anychart.ui.ContextMenu.Item>}
   * @private
   */
  this.itemsFormatter_ = function(items, context) {
    return items;
  };


  /**
   * Items provider.
   * Function allows you to specify the initial set of items depending on context.
   * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
   * @this {anychart.ui.ContextMenu.PrepareItemsContext}
   * @return {Object.<string, anychart.ui.ContextMenu.Item>}
   * @private
   */
  this.itemsProvider_ = function(context) {
    return {};
  };


  // Set default empty menu.
  this.setModel({});

  /**
   * Wrapper for method .show() for async usage.
   * @type {!Function}
   */
  this.acyncShow = goog.bind(this.show, this);


  this.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var menuItem = /** @type {anychart.ui.menu.Item} */ (e.target);
    var menuItemModel = /** @type {anychart.ui.ContextMenu.Item} */ (menuItem.getModel());
    var actionContext = {
      'type': menuItemModel['eventType'] || goog.ui.Component.EventType.ACTION,
      'event': /** @type {goog.events.Event} */ (e),
      'target': this.contextTarget_,
      'item': menuItemModel
    };

    if (this.menuParent_) {
      actionContext['menuParent'] = this.menuParent_;
      if (goog.isFunction(this.menuParent_['getSelectedPoints'])) {
        actionContext['selectedPoints'] = this.menuParent_['getSelectedPoints']() || [];
      }
    }

    if (goog.isFunction(menuItemModel['action'])) {
      menuItemModel['action'].call(actionContext, actionContext);
    }

    if (menuItemModel['eventType']) {
      this.dispatchEvent(actionContext);
    }
  });
};
goog.inherits(anychart.ui.ContextMenu, goog.ui.PopupMenu);


/** @override */
anychart.ui.ContextMenu.prototype.handleEnterItem = function(e) {
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
 * Whether context menu is enabled or not.
 * @type {?boolean}
 * @private
 */
anychart.ui.ContextMenu.prototype.enabledInternal_ = true;


/**
 * Enable/disable context menu.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.ui.ContextMenu|boolean|null}
 */
anychart.ui.ContextMenu.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabledInternal_ != opt_value) {
      this.enabledInternal_ = opt_value;
    }
    return this;
  } else {
    return this.enabledInternal_;
  }
};


/**
 * Adds the given class name to the list of classes to be applied to the
 * context menu's root element.
 * @param {string} className Additional class name to be applied to the
 *     context menu's root element.
 */
anychart.ui.ContextMenu.prototype.addClassName = function(className) {
  if (className) {
    if (this.extraClassNames_) {
      if (!goog.array.contains(this.extraClassNames_, className)) {
        this.extraClassNames_.push(className);
      }
    } else {
      this.extraClassNames_ = [className];
    }
  }

  if (this.getElement() && this.extraClassNames_ && this.extraClassNames_.length) {
    goog.dom.classlist.addAll(this.getElement(), this.extraClassNames_);
  }
};


/**
 * Removes the given class name from the list of classes to be applied to
 * the context menu's root element.
 * @param {string} className Class name to be removed from the context menu's root
 *     element.
 */
anychart.ui.ContextMenu.prototype.removeClassName = function(className) {
  if (className && this.extraClassNames_ &&
      goog.array.remove(this.extraClassNames_, className)) {

    if (this.getElement()) {
      goog.dom.classlist.remove(this.getElement(), className);
    }

    if (!this.extraClassNames_.length) {
      this.extraClassNames_ = null;
    }
  }
};


/**
 * Getter/setter for current context menu items.
 * @param {Object.<string, anychart.ui.ContextMenu.Item>=} opt_value Items.
 * @return {(Object.<string, anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} Context menu items or self for chaining.
 */
anychart.ui.ContextMenu.prototype.items = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.itemsProvider(function() {
      return /** @type {Object.<string, anychart.ui.ContextMenu.Item>} */ (opt_value);
    });
    if (!opt_value.length) this.hide();
    this.setModel(opt_value);
    return this;
  }
  return /** @type {Object.<string, anychart.ui.ContextMenu.Item>} */ (this.getModel());
};


/**
 * Getter/setter for items provider.
 * Items provider called before items formatter.
 * @param {function(this:anychart.ui.ContextMenu.PrepareItemsContext,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Object.<string, anychart.ui.ContextMenu.Item>=} opt_value Formatter function.
 * @return {(function(this:anychart.ui.ContextMenu.PrepareItemsContext,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Object.<string, anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} Formatter function or self for chaining.
 */
anychart.ui.ContextMenu.prototype.itemsProvider = function(opt_value) {
  if (goog.isFunction(opt_value)) {
    if (this.itemsProvider_ != opt_value) {
      this.itemsProvider_ = opt_value;
      this.itemsReady_ = false;
    }
    return this;
  }
  return this.itemsProvider_;
};


/**
 * Getter/setter for items formatter.
 * @param {function(this:Object.<string, anychart.ui.ContextMenu.Item>, Object.<string, anychart.ui.ContextMenu.Item>,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Object.<string, anychart.ui.ContextMenu.Item>=} opt_value - Formatter function.
 * @return {(function(this:Object.<string, anychart.ui.ContextMenu.Item>, Object.<string, anychart.ui.ContextMenu.Item>,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Object.<string, anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} - Formatter function or self for chaining.
 */
anychart.ui.ContextMenu.prototype.itemsFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.itemsFormatter_ != opt_value) {
      this.itemsFormatter_ = opt_value;
    }
    return this;
  }
  return this.itemsFormatter_;
};


/**
 * Handler browser's contextmenu event.
 * @param {goog.events.Event|anychart.core.MouseEvent} e
 * @private
 */
anychart.ui.ContextMenu.prototype.handleContextMenu_ = function(e) {
  if (!this.enabledInternal_) return;
  //a workaround for Android devices
  if (this.chart_)
    this.chart_.tooltip().hide();

  this.contextTarget_ = e['target'];
  this.prepareItems_(e, this.contextTarget_);

  if (!goog.isObject(this.items()) || goog.object.isEmpty(this.items())) return;
  goog.isFunction(e['getOriginalEvent']) ? e['getOriginalEvent']().preventDefault() : e.preventDefault();

  if (this.menuParent_ && goog.isFunction(this.menuParent_['getType']) && this.menuParent_['getType']() == anychart.enums.MapTypes.MAP) {
    //because Map has async interactivity model
    setTimeout(this.acyncShow, 0, e['clientX'], e['clientY']);
  } else {
    this.show(e['clientX'], e['clientY']);
  }
};


/**
 *
 * @param {?(goog.events.Event|anychart.core.MouseEvent)} event
 * @param {Element|anychart.core.VisualBase} target
 * @return {boolean} true if items successfully prepared and it's more than 0
 * @private
 */
anychart.ui.ContextMenu.prototype.prepareItems_ = function(event, target) {
  var context = {
    'event': event,
    'target': target,
    'menu': this
  };

  if (this.menuParent_) {
    var stage = this.menuParent_['container']() ? this.menuParent_['container']()['getStage']() : null;
    if (goog.isNull(stage) || goog.style.getComputedStyle(stage['domElement'](), 'border-style') == 'none') return false;

    context['menuParent'] = this.menuParent_;
    context['chart'] = this.menuParent_; // NOTE: This is added to follow the typedef and make api demos work well.

    if (goog.isFunction(this.menuParent_['getSelectedPoints'])) {
      context['selectedPoints'] = this.menuParent_['getSelectedPoints']() || [];
    }

    context = this.menuParent_.patchContextMenuContext(context);
  }

  // Flow: itemsProvider -> itemsFormatter -> items -> render
  var providedItems = /** @type {Object.<string, anychart.ui.ContextMenu.Item>} */ (anychart.utils.recursiveClone(this.itemsProvider_.call(context, context)));
  var formattedItems = this.itemsFormatter_.call(providedItems, providedItems, context);
  this.setModel(formattedItems);

  this.itemsReady_ = true;

  return !goog.object.isEmpty(formattedItems);
};


/** @inheritDoc */
anychart.ui.ContextMenu.prototype.render = function(opt_parentElement) {
  anychart.ui.ContextMenu.base(this, 'render', opt_parentElement);
  if (this.extraClassNames_ && this.extraClassNames_.length) {
    goog.dom.classlist.addAll(this.getElement(), this.extraClassNames_);
  }
};


/**
 * Attaches the context menu to a chart or DOM element.  A menu can
 * only be attached to a target once, since attaching the same menu for
 * multiple targets doesn't make sense.
 * This method will render the context menu in the document.body.
 * @param {Element|anychart.core.Chart|anychart.tableModule.Table} target Target whose click event should trigger the context menu.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {anychart.ui.ContextMenu} Self for chaining.
 * @suppress {checkTypes}
 */
anychart.ui.ContextMenu.prototype.attach = function(target, opt_capture) {
  if (target && !this.attached_) {
    this.attached_ = true;
    if (goog.isObject(target) && goog.isFunction(target['listen'])) {
      this.menuParent_ = target;
      this.menuParent_['listen'](goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture, this);
    } else {
      this.getHandler().listen(target, goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture);
    }
  }
  return this;
};


/**
 * Detaches a context menu from a given element or chart.
 * @param {Element=} opt_target Element whose click event should trigger the contect menu.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {anychart.ui.ContextMenu} Self for chaining.
 * @suppress {checkTypes}
 */
anychart.ui.ContextMenu.prototype.detach = function(opt_target, opt_capture) {
  if (this.attached_) {
    if (goog.isDefAndNotNull(this.menuParent_) && goog.isFunction(this.menuParent_['unlisten'])) {
      this.attached_ = !this.menuParent_['unlisten'](goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture, this);

    } else if (goog.events.getListener(opt_target, goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture, this)) {
      this.getHandler().unlisten(opt_target, goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture);
      this.attached_ = false;
    }
    if (!this.attached_) this.hide();
  }
  return this;
};


/**
 * Shows the menu immediately at the given client coordinates.
 * You must specify a set of menu items using itemsProvider/itemsFormatter before calling this method.
 * @param {number} x The client-X associated with the show event.
 * @param {number} y The client-Y associated with the show event.
 */
anychart.ui.ContextMenu.prototype.show = function(x, y) {
  if ((this.itemsReady_ && !goog.object.isEmpty(this.items())) || this.prepareItems_(null, this.menuParent_)) {
    var stage = this.menuParent_ ? this.menuParent_.container().getStage() : null;
    var container = (stage && stage.fullScreen()) ? stage.getDomWrapper() : anychart.document.body;
    if (this.wrapper_.parentNode != container)
      container.appendChild(this.wrapper_);

    if (!this.isInDocument()) {
      this.render(this.wrapper_);
    }
    this.makeMenu_();

    var position = new goog.positioning.ViewportClientPosition(x, y);
    position.setLastResortOverflow(
        goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN |
        goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN);
    this.showWithPosition(position);
  }
};


/**
 * To make the menu.
 * @private
 */
anychart.ui.ContextMenu.prototype.makeMenu_ = function() {
  this.clear_();
  this.makeLevel_(this, /** @type {Object.<string, anychart.ui.ContextMenu.Item>} */ (this.items()));
};


/**
 * Clear menu.
 * @private
 */
anychart.ui.ContextMenu.prototype.clear_ = function() {
  var menuItem;
  while (this.hasChildren()) {
    menuItem = this.getChildAt(0);
    this.removeChild(menuItem);
    menuItem.dispose();
  }
};


/**
 * Context menu item comparison function.
 * @param {anychart.ui.ContextMenu.Item} item1 - .
 * @param {anychart.ui.ContextMenu.Item} item2 - .
 * @return {number}
 * @private
 */
anychart.ui.ContextMenu.prototype.itemSort_ = function(item1, item2) {
  if (!goog.isNumber(item1['index'])) return 1;
  if (!goog.isNumber(item2['index'])) return -1;
  return item1['index'] - item2['index'] || 1; //Avoid item replacement.
};


/**
 * To make one level of menu. Recursive function.
 * @param {anychart.ui.ContextMenu|anychart.ui.menu.Menu|anychart.ui.menu.SubMenu} menu
 * @param {Object.<string, anychart.ui.ContextMenu.Item>} model
 * @private
 */
anychart.ui.ContextMenu.prototype.makeLevel_ = function(menu, model) {
  var itemData;
  var sortedModel = [];

  for (var key in model) {
    var modelItem = model[key];
    if (model.hasOwnProperty(key))
      goog.array.binaryInsert(sortedModel, modelItem, this.itemSort_);
  }

  for (var i = 0; i < sortedModel.length; i++) {
    itemData = sortedModel[i];

    // Prepare classNames array
    if (goog.isDefAndNotNull(itemData)) {
      var classNames = goog.isString(itemData['classNames']) ? itemData['classNames'].split(' ') : itemData['classNames'] || [];
    }

    var itemText = anychart.format.getMessage(itemData['text']) || '';

    // treat as separator
    if (!itemData['text']) {
      this.addItemToMenu_(menu, new goog.ui.MenuSeparator());

      // treat as subMenu
    } else if (itemData['subMenu']) {
      var subMenu = new anychart.ui.menu.SubMenu(itemText, this.wrapper_);
      if (classNames.length) subMenu.addClassName(classNames.join(' '));
      if (goog.isBoolean(itemData['enabled'])) subMenu.setEnabled(itemData['enabled']);

      this.makeLevel_(subMenu, itemData['subMenu']);
      this.addItemToMenu_(menu, subMenu);

      if (goog.isDef(itemData['iconClass'])) this.setIconTo_(subMenu, itemData['iconClass']);

      // treat as menu item
    } else {
      var menuItemText;
      if (itemData['href']) {
        menuItemText = goog.dom.createDom(goog.dom.TagName.A,
            {
              'href': itemData['href'],
              'target': itemData['target'] || '_blank'
            }, itemText);

        classNames.unshift('anychart-menuitem-link');
      } else {
        menuItemText = itemText;
      }

      var menuItem = new anychart.ui.menu.Item(menuItemText, itemData);
      if (classNames.length) menuItem.addClassName(classNames.join(' '));
      if (goog.isBoolean(itemData['enabled'])) menuItem.setEnabled(itemData['enabled']);
      if (goog.isBoolean(itemData['scrollable'])) menuItem.scrollable(itemData['scrollable']);

      this.addItemToMenu_(menu, menuItem);

      if (goog.isDef(itemData['iconClass'])) this.setIconTo_(menuItem, itemData['iconClass']);
    }
  }
};


/**
 * Right add menuItem to menu or subMenu.
 * @param {anychart.ui.ContextMenu|anychart.ui.menu.Menu|anychart.ui.menu.SubMenu} menu
 * @param {anychart.ui.menu.Item|goog.ui.MenuSeparator|anychart.ui.menu.SubMenu} item
 * @private
 */
anychart.ui.ContextMenu.prototype.addItemToMenu_ = function(menu, item) {
  anychart.utils.instanceOf(menu, anychart.ui.menu.SubMenu) ? menu.addItem(item) : menu.addChild(item, true);
};


/**
 * Set icon to menu item.
 * @param {anychart.ui.menu.Item|anychart.ui.menu.SubMenu} item
 * @param {string=} opt_icon
 * @param {number=} opt_index
 * @private
 */
anychart.ui.ContextMenu.prototype.setIconTo_ = function(item, opt_icon, opt_index) {
  var element = item.getElement();
  if (element) {
    var iconElement = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.I, null, element)[0];
    if (opt_icon) {
      if (iconElement) {
        goog.dom.classlist.set(iconElement, opt_icon);
        goog.style.setElementShown(iconElement, true);
      } else {
        iconElement = goog.dom.createDom(goog.dom.TagName.I, opt_icon);
        goog.a11y.aria.setState(iconElement, goog.a11y.aria.State.HIDDEN, true);
        goog.dom.insertChildAt(element, iconElement, opt_index || 0);
      }
    } else {
      if (iconElement) goog.style.setElementShown(iconElement, false);
    }
  }
};


/**
 * @typedef {{
 *  event: (goog.events.Event|anychart.core.MouseEvent),
 *  target: (Element|anychart.core.VisualBase),
 *  menu: anychart.ui.ContextMenu,
 *  selectedPoints: (Array.<anychart.core.Point>|undefined),
 *  chart: (anychart.core.Chart|undefined)
 * }}
 */
anychart.ui.ContextMenu.PrepareItemsContext;


/**
 * @typedef {{
 *  type: string,
 *  event: goog.events.Event,
 *  target: (Element|anychart.core.VisualBase),
 *  item: anychart.ui.ContextMenu.Item,
 *  selectedPoints: (Array.<anychart.core.Point>|undefined),
 *  chart: (anychart.core.Chart|undefined)
 * }}
 */
anychart.ui.ContextMenu.ActionContext;


/**
 * Hint: if text is empty or null or undefined - it is separator.
 *
 * @typedef {{
 *  text: string,
 *  index: number,
 *  href: string,
 *  target: string,
 *  eventType: string,
 *  action: function(this:anychart.ui.ContextMenu.ActionContext, anychart.ui.ContextMenu.ActionContext),
 *  iconClass: string,
 *  subMenu: Object.<string, anychart.ui.ContextMenu.Item>,
 *  enabled: boolean,
 *  scrollable: boolean,
 *  classNames: (string|Array.<string>),
 *  meta: *
 * }}
 */
anychart.ui.ContextMenu.Item;


/** @inheritDoc */
anychart.ui.ContextMenu.prototype.disposeInternal = function() {
  if (goog.isDefAndNotNull(this.menuParent_)) this.detach();
  this.contextTarget_ = null;
  this.menuParent_ = null;
  this.extraClassNames_ = null;
  this.wrapper_ = null;

  anychart.ui.ContextMenu.base(this, 'disposeInternal');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.ui.ContextMenu.prototype.serialize = function() {
  var json = {};

  json['enabled'] = this.enabled();

  if (this.extraClassNames_) {
    json['extraClassNames'] = goog.array.clone(this.extraClassNames_);
  }
  return json;
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args Arguments to setup the instance.
 * @return {anychart.ui.ContextMenu} Returns itself for chaining.
 */
anychart.ui.ContextMenu.prototype.setup = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isDef(arg0)) {
    if (!this.setupSpecial(arg0) && goog.isObject(arg0)) {
      this.setupByJSON(arg0);
    }
  }
  return this;
};


/**
 *
 * @param {...*} var_args
 * @return {Object|null}
 */
anychart.ui.ContextMenu.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/**
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.ui.ContextMenu.prototype.setupSpecial = function(var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[0]);
  if (resolvedValue) {
    this.enabled(resolvedValue['enabled']);
    return true;
  }
  return false;
};


/**
 * Setups current instance using passed JSON object.
 * @param {!Object} config
 * @protected
 */
anychart.ui.ContextMenu.prototype.setupByJSON = function(config) {
  this.enabled('enabled' in config ? config['enabled'] : true);
  var extraClassNames = config['extraClassNames'];
  if (extraClassNames) {
    for (var i = 0, len = extraClassNames.length; i < len; i++) {
      var className = extraClassNames[i];
      this.addClassName(className);
    }
  }
};


/**
 * Constructor function for context menu.
 * @return {anychart.ui.ContextMenu}
 */
anychart.ui.contextMenu = function() {
  return new anychart.ui.ContextMenu();
};


//exports
(function() {
  var proto = anychart.ui.ContextMenu.prototype;
  goog.exportSymbol('anychart.ui.contextMenu', anychart.ui.contextMenu);
  proto['serialize'] = proto.serialize;
  proto['setup'] = proto.setup;
  proto['enabled'] = proto.enabled;
  proto['addClassName'] = proto.addClassName;
  proto['removeClassName'] = proto.removeClassName;
  proto['attach'] = proto.attach;
  proto['detach'] = proto.detach;
  proto['listen'] = proto.listen;
  proto['unlisten'] = proto.unlisten;
  proto['show'] = proto.show;
  proto['hide'] = proto.hide;
  proto['items'] = proto.items;
  proto['itemsProvider'] = proto.itemsProvider;
  proto['itemsFormatter'] = proto.itemsFormatter;
})();
