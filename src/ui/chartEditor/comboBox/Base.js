goog.provide('anychart.ui.chartEditor.comboBox.Base');

goog.require('anychart.ui.chartEditor.events');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');

goog.forwardDeclare('goog.events.BrowserEvent');



/**
 * A ComboBox control.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.Menu=} opt_menu Optional menu component.
 *     This menu is disposed of by this control.
 * @param {goog.ui.LabelInput=} opt_labelInput Optional label input.
 *     This label input is disposed of by this control.
 * @constructor
 * @extends {goog.ui.ComboBox}
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base = function(opt_domHelper, opt_menu, opt_labelInput) {
  anychart.ui.chartEditor.comboBox.Base.base(this, 'constructor', opt_domHelper, opt_menu, opt_labelInput);

  // If no value is set.
  this.lastToken_ = '';

  this.options_ = [];
  this.captions_ = [];

  // For fontSize
  this.setUseTypeahead(false);
  this.setValidateFunction(function(value) {
    var numberValue = +value;
    // not a number
    return !(goog.isNull(numberValue) || goog.isBoolean(numberValue) || isNaN(numberValue));
  });
  this.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), 6, 40));
  });
};
goog.inherits(anychart.ui.chartEditor.comboBox.Base, goog.ui.ComboBox);


/**
 * False to don't set item visibility from token. Defaults to true.
 * @type {boolean}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.useTypeahead_ = true;


/**
 * The validate function to be used for set value.
 * @param {string} value The value to check.
 * @return {boolean}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.validateFunction_ = function(value) {
  return true;
};


/**
 * Formatter for set value.
 * @param {string} value
 * @return {string}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.formatterFunction_ = function(value) {
  return value;
};


/**
 * @type {Array.<string>}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.options_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.captions_;


/** @param {Array.<string>} value */
anychart.ui.chartEditor.comboBox.Base.prototype.setOptions = function(value) {
  this.options_ = value;
};


/** @param {Array.<string>} value */
anychart.ui.chartEditor.comboBox.Base.prototype.setCaptions = function(value) {
  this.captions_ = value;
};


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.ui.chartEditor.comboBox.Base.prototype.key_ = '';


/** @param {string|Array.<string>} value */
anychart.ui.chartEditor.comboBox.Base.prototype.setKey = function(value) {
  this.key_ = value;
};


/**
 * False to don't set item visibility from token.
 * This option defaults to true for backwards compatibility.
 * @param {boolean} useTypeahead False to don't use the typeahead.
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setUseTypeahead = function(useTypeahead) {
  this.useTypeahead_ = !!useTypeahead;
  if (!this.useTypeahead_) {
    this.setMatchFunction(goog.string.caseInsensitiveEquals);
  }
};


/**
 * @return {?goog.ui.Control} The currently selected item or null.
 */
anychart.ui.chartEditor.comboBox.Base.prototype.getSelectedItem = function() {
  return this.getMenu().getHighlighted();
};


/**
 * @override
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.createDom = function() {
  // This hack for render menu into the body instead into the same parent as this button.
  var menu = this.getMenu();
  menu.render();
  menu.setParent(this);

  anychart.ui.chartEditor.comboBox.Base.base(this, 'createDom');

  var element = this.getElement();
  var button = this.getElementByClass(goog.getCssName('anychart-combobox-button'));
  if (this.useDropdownArrow_) {
    // Don't use UTF-8. We use css.
    button.innerHTML = '&nbsp';
  }

  goog.dom.classlist.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);

  this.updateOptions();
};


/**
 * @suppress {checkTypes} set option to ComboBoxItem
 */
anychart.ui.chartEditor.comboBox.Base.prototype.updateOptions = function() {
  var optionsCount = this.options_.length;
  var count = Math.max(this.getChildCount(), optionsCount);

  for (var i = 0; i < count; i++) {
    var optionItem = this.getItemAt(i);

    if (i < optionsCount) {
      var option = this.options_[i];
      var caption = this.captions_[i] || option.toString();

      if (!optionItem) {
        optionItem = new goog.ui.ComboBoxItem(caption, option);
        this.addItemAt(optionItem, i);
      } else {
        optionItem.setContent(caption);
        optionItem.setModel(option);
        optionItem.setVisible(true);
      }
    } else {
      optionItem.setVisible(false);
    }
  }
};


/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 */
anychart.ui.chartEditor.comboBox.Base.prototype.update = function(model) {
  //todo: rework, need silently update selects
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
  var value = String(anychart.ui.chartEditor.Controller.getset(model, goog.isArray(this.key_) ? this.key_[0] : this.key_));
  this.setValue(value);
  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @override */
anychart.ui.chartEditor.comboBox.Base.prototype.enterDocument = function() {
  anychart.ui.chartEditor.comboBox.Base.base(this, 'enterDocument');

  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @override */
anychart.ui.chartEditor.comboBox.Base.prototype.exitDocument = function() {
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);

  anychart.ui.chartEditor.comboBox.Base.base(this, 'exitDocument');
};


/**
 * Dismisses the menu and resets the value of the edit field.
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.dismiss = function() {
  anychart.ui.chartEditor.comboBox.Base.base(this, 'dismiss');

  this.input_.blur();
};


/**
 * Set validate function.
 * @param {function(string):boolean} validateFunction
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setValidateFunction = function(validateFunction) {
  this.validateFunction_ = validateFunction;
};


/**
 * @return {function(string):boolean} The validate function.
 */
anychart.ui.chartEditor.comboBox.Base.prototype.getValidateFunction = function() {
  return this.validateFunction_;
};


/**
 * Set formatter function.
 * @param {function(string):string} formatterFunction
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setFormatterFunction = function(formatterFunction) {
  this.formatterFunction_ = formatterFunction;
};


/**
 * @return {function(string):string} The formatter function.
 */
anychart.ui.chartEditor.comboBox.Base.prototype.getFormatterFunction = function() {
  return this.formatterFunction_;
};


/**
 * Sets the current value of the combo box.
 * @param {string} value The new value.
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setValue = function(value) {
  goog.log.info(this.logger_, 'setValue() - ' + value);
  if (this.lastToken_ != value && this.validateFunction_(value)) {
    value = this.formatterFunction_(value);
    this.lastToken_ = value;
    this.labelInput_.setValue(value);
    this.handleInputChange_();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};


/**
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.onInputBlur_ = function(e) {
  anychart.ui.chartEditor.comboBox.Base.base(this, 'onInputBlur_', e);

  this.labelInput_.setValue(/** @type {string} */(this.lastToken_));
};


/**
 * Handles keyboard events from the input box.  Returns true if the combo box
 * was able to handle the event, false otherwise.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the combo box.
 * @protected
 * @suppress {visibility|accessControls}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.handleKeyEvent = function(e) {
  var isMenuVisible = this.menu_.isVisible();
  var token;

  // anychart fix
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    token = this.getTokenText_();
    if (this.validateFunction_(token)) {
      this.dismiss();
      this.setValue(token);
      return true;
    } else {
      return false;
    }
  }
  // anychart fix end

  // The menu is either hidden or didn't handle the event.
  var handled = false;

  // Give the menu a chance to handle the event.
  if (isMenuVisible && this.menu_.handleKeyEvent(e)) {
    // anychart fix
    switch (e.keyCode) {
      case goog.events.KeyCodes.UP:
      case goog.events.KeyCodes.DOWN:
        // Set caption
        this.labelInput_.setValue(/** @type {string} */(this.menu_.getHighlighted().getModel()));
        this.input_.select();
        handled = true;
        break;
    }
    // anychart fix end
    return true;
  }

  switch (e.keyCode) {
    case goog.events.KeyCodes.ESC:
      this.labelInput_.setValue(/** @type {string} */(this.lastToken_));
      // If the menu is visible and the user hit Esc, dismiss the menu.
      if (isMenuVisible) {
        goog.log.fine(this.logger_,
            'Dismiss on Esc: ' + this.labelInput_.getValue());
        this.dismiss();
        handled = true;
        // anychart fix
        e.stopPropagation();
        // anychart fix end
      }
      break;
    case goog.events.KeyCodes.TAB:
      // If the menu is open and an option is highlighted, activate it.
      if (isMenuVisible) {
        var highlighted = this.menu_.getHighlighted();
        if (highlighted) {
          goog.log.fine(this.logger_,
              'Select on Tab: ' + this.labelInput_.getValue());
          highlighted.performActionInternal(e);
          handled = true;
        }
      }
      break;
    case goog.events.KeyCodes.UP:
    case goog.events.KeyCodes.DOWN:
      // If the menu is hidden and the user hit the up/down arrow, show it.
      if (!isMenuVisible) {
        goog.log.fine(this.logger_, 'Up/Down - maybe show menu');
        this.maybeShowMenu_(true);
        handled = true;
      }
      break;
  }

  if (handled) {
    e.preventDefault();
  }

  return handled;
};


/**
 * @param {string} token The token.
 * @private
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setItemVisibilityFromToken_ = function(token) {
  goog.log.info(this.logger_, 'setItemVisibilityFromToken_() - ' + token);
  var isVisibleItem = false;
  var count = 0;
  var recheckHidden = !this.matchFunction_(token, /** @type {string} */(this.lastToken_));

  for (var i = 0, n = this.menu_.getChildCount(); i < n; i++) {
    var item = this.menu_.getChildAt(i);
    if (item instanceof goog.ui.MenuSeparator) {
      // Ensure that separators are only shown if there is at least one visible
      // item before them.
      item.setVisible(isVisibleItem);
      isVisibleItem = false;
    } else if (item instanceof goog.ui.MenuItem) {
      if (!item.isVisible() && !recheckHidden) continue;

      var caption = item.getCaption();
      var visible = !this.useTypeahead_ || // anychart fixed
          this.isItemSticky_(item) ||
          caption && this.matchFunction_(caption.toLowerCase(), token);
      if (this.useTypeahead_ && // anychart fixed
          typeof item.setFormatFromToken == 'function') {
        item.setFormatFromToken(token);
      }
      item.setVisible(!!visible);
      isVisibleItem = visible || isVisibleItem;

    } else {
      // Assume all other items are correctly using their visibility.
      isVisibleItem = item.isVisible() || isVisibleItem;
    }

    if (!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) {
      count++;
    }
  }

  this.visibleCount_ = count;
};


/**
 * @private
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.handleInputChange_ = function() {
  var token = this.getTokenText_();
  // anychart fixed
  if (this.useTypeahead_) {
    this.setItemVisibilityFromToken_(token);
  }

  if (goog.dom.getActiveElement(this.getDomHelper().getDocument()) ==
      this.input_) {
    // Do not alter menu visibility unless the user focus is currently on the
    // combobox (otherwise programmatic changes may cause the menu to become
    // visible).
    this.maybeShowMenu_(false);
  }
  var highlighted = this.menu_.getHighlighted();
  if (this.useTypeahead_ && // anychart fixed
      (token == '' || !highlighted || !highlighted.isVisible())) {
    this.setItemHighlightFromToken_(token);
  }
  // anychart fixed
  //this.lastToken_ = token;
  //this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * @param {string} token The token.
 * @private
 * @suppress {visibility}
 */
anychart.ui.chartEditor.comboBox.Base.prototype.setItemHighlightFromToken_ = function(token) {
  goog.log.info(this.logger_, 'setItemHighlightFromToken_() - ' + token);

  if (token == '') {
    this.menu_.setHighlightedIndex(-1);
    return;
  }

  for (var i = 0, n = this.menu_.getChildCount(); i < n; i++) {
    var item = this.menu_.getChildAt(i);
    var caption = item.getCaption();
    if (caption && this.matchFunction_(caption.toLowerCase(), token)) {
      this.menu_.setHighlightedIndex(i);
      if (this.useTypeahead_ && item.setFormatFromToken) { // anychart fixed
        item.setFormatFromToken(token);
      }
      return;
    }
  }
  this.menu_.setHighlightedIndex(-1);
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.ui.chartEditor.comboBox.Base.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
  for (var i = 0, count = keys.length; i < count; i++) {
    this.dispatchEvent({
      type: anychart.ui.chartEditor.events.EventType.CHANGE_MODEL,
      key: keys[i],
      value: this.getToken()
    });
  }
  this.dispatchEvent(anychart.ui.chartEditor.events.EventType.UPDATE_EDITOR);
};
