goog.provide('anychart.ui.ContextMenu');
goog.provide('anychart.ui.ContextMenu.ActionContext');
goog.provide('anychart.ui.ContextMenu.Item');
goog.provide('anychart.ui.ContextMenu.PrepareItemsContext');

goog.require('anychart.enums');
goog.require('anychart.ui.menu.Item');
goog.require('anychart.ui.menu.SubMenu');
goog.require('goog.dom.classlist');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.PopupMenu');

goog.forwardDeclare('anychart.core.Chart');
goog.forwardDeclare('anychart.core.MouseEvent');
goog.forwardDeclare('anychart.core.Point');
goog.forwardDeclare('anychart.core.VisualBase');



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
   * Link to chart.
   * @type {anychart.core.Chart}
   * @private
   */
  this.chart_ = null;

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
   * Items formatter.
   * This function allows you to change provided menu items and change their order.
   * @param {Array.<anychart.ui.ContextMenu.Item>} items Provided menu items.
   * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
   * @this {Array.<anychart.ui.ContextMenu.Item>}
   * @return {Array.<anychart.ui.ContextMenu.Item>}
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
   * @return {Array.<anychart.ui.ContextMenu.Item>}
   * @private
   */
  this.itemsProvider_ = function(context) {
    return [];
  };


  // Set default empty menu.
  this.setModel([]);

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

    if (this.chart_ && goog.isFunction(this.chart_['getSelectedPoints'])) {
      actionContext['chart'] = this.chart_;
      actionContext['selectedPoints'] = this.chart_['getSelectedPoints']() || [];
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
 * @param {Array.<anychart.ui.ContextMenu.Item>=} opt_value Items.
 * @return {(Array.<anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} Context menu items or self for chaining.
 */
anychart.ui.ContextMenu.prototype.items = function(opt_value) {
  if (goog.isArray(opt_value)) {
    this.itemsProvider(function() {
      return /** @type {Array<anychart.ui.ContextMenu.Item>} */ (opt_value);
    });
    if (!opt_value.length) this.hide();
    this.setModel(opt_value);
    return this;
  }
  return /** @type {Array.<anychart.ui.ContextMenu.Item>} */ (this.getModel());
};


/**
 * Getter/setter for items provider.
 * Items provider called before items formatter.
 * @param {function(this:anychart.ui.ContextMenu.PrepareItemsContext,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Array.<anychart.ui.ContextMenu.Item>=} opt_value Formatter function.
 * @return {(function(this:anychart.ui.ContextMenu.PrepareItemsContext,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Array.<anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} Formatter function or self for chaining.
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
 * @param {function(this:Array.<anychart.ui.ContextMenu.Item>, Array.<anychart.ui.ContextMenu.Item>,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Array.<anychart.ui.ContextMenu.Item>=} opt_value Formatter function.
 * @return {(function(this:Array.<anychart.ui.ContextMenu.Item>, Array.<anychart.ui.ContextMenu.Item>,
 *     anychart.ui.ContextMenu.PrepareItemsContext):Array.<anychart.ui.ContextMenu.Item>|anychart.ui.ContextMenu)} Formatter function or self for chaining.
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
  this.contextTarget_ = e['target'];
  this.prepareItems_(e, this.contextTarget_);

  if (!goog.isArray(this.items()) || !this.items().length) return;
  goog.isFunction(e['getOriginalEvent']) ? e['getOriginalEvent']().preventDefault() : e.preventDefault();

  if (this.chart_ && goog.isFunction(this.chart_['getType']) && this.chart_['getType']() == anychart.enums.MapTypes.MAP) {
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

  if (this.chart_ && goog.isFunction(this.chart_['getSelectedPoints'])) {
    var stage = this.chart_['container']() ? this.chart_['container']()['getStage']() : null;
    if (goog.isNull(stage) || goog.style.getComputedStyle(stage['domElement'](), 'border-style') == 'none') return false;
    context['chart'] = this.chart_;
    context['selectedPoints'] = this.chart_['getSelectedPoints']() || [];
  }

  // Flow: itemsProvider -> itemsFormatter -> items -> render
  var providedItems = goog.array.clone(this.itemsProvider_.call(context, context));
  var formattedItems = this.itemsFormatter_.call(providedItems, providedItems, context);
  this.setModel(formattedItems);

  this.itemsReady_ = true;

  return !!formattedItems.length;
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
 * @param {Element|anychart.core.Chart} target Target whose click event should trigger the context menu.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @return {anychart.ui.ContextMenu} Self for chaining.
 * @suppress {checkTypes}
 */
anychart.ui.ContextMenu.prototype.attach = function(target, opt_capture) {
  if (target && !this.attached_) {
    this.attached_ = true;
    if (goog.isObject(target) && goog.isFunction(target['listen'])) {
      this.chart_ = target;
      this.chart_['listen'](goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture, this);
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
    if (goog.isDefAndNotNull(this.chart_) && goog.isFunction(this.chart_['unlisten'])) {
      this.attached_ = !this.chart_['unlisten'](goog.events.EventType.CONTEXTMENU, this.handleContextMenu_, opt_capture, this);

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
  if ((this.itemsReady_ && this.items().length) || this.prepareItems_(null, this.chart_)) {
    if (!this.isInDocument()) {
      this.render();
    }
    this.makeMenu_();
    this.showMenu({}, x, y);
  }
};


/**
 * To make the menu.
 * @private
 */
anychart.ui.ContextMenu.prototype.makeMenu_ = function() {
  this.clear_();
  this.makeLevel_(this, /** @type {Array.<anychart.ui.ContextMenu.Item>} */ (this.items()));
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
 * To make one level of menu. Recursive function.
 * @param {anychart.ui.ContextMenu|anychart.ui.menu.Menu|anychart.ui.menu.SubMenu} menu
 * @param {Array.<anychart.ui.ContextMenu.Item>} model
 * @private
 */
anychart.ui.ContextMenu.prototype.makeLevel_ = function(menu, model) {
  var itemData;
  for (var i = 0; i < model.length; i++) {
    itemData = model[i];

    // Prepare classNames array
    if (goog.isDefAndNotNull(itemData)) {
      var classNames = goog.isString(itemData['classNames']) ? itemData['classNames'].split(' ') : itemData['classNames'] || [];
    }

    // treat as separator
    if (!goog.isDefAndNotNull(itemData)) {
      this.addItemToMenu_(menu, new goog.ui.MenuSeparator());

    // treat as subMenu
    } else if (itemData['subMenu']) {
      var subMenu = new anychart.ui.menu.SubMenu(itemData['text']);
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
            }, itemData['text'] || '');

        classNames.unshift('anychart-menuitem-link');
      } else {
        menuItemText = itemData['text'] || '';
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
  acgraph.utils.instanceOf(menu, anychart.ui.menu.SubMenu) ? menu.addItem(item) : menu.addChild(item, true);
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
 * Hint: null|undefined - it is separator.
 *
 * @typedef {{
 *  text: string,
 *  href: string,
 *  target: string,
 *  eventType: string,
 *  action: function(this:anychart.ui.ContextMenu.ActionContext, anychart.ui.ContextMenu.ActionContext),
 *  iconClass: string,
 *  subMenu: Array.<anychart.ui.ContextMenu.Item>,
 *  enabled: boolean,
 *  scrollable: boolean,
 *  classNames: (string|Array.<string>),
 *  meta: *
 * }|null|undefined}
 */
anychart.ui.ContextMenu.Item;


/** @inheritDoc */
anychart.ui.ContextMenu.prototype.disposeInternal = function() {
  if (goog.isDefAndNotNull(this.chart_)) this.detach();
  this.contextTarget_ = null;
  this.chart_ = null;
  this.extraClassNames_ = null;

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
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.ui.ContextMenu.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
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
