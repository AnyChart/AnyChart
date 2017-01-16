goog.provide('anychart.ui.chartEditor.select.Base');

goog.require('anychart.ui.chartEditor.events');
goog.require('anychart.ui.chartEditor.select.Renderer');

goog.require('goog.ui.Option');
goog.require('goog.ui.Select');



/**
 *
 * @param {goog.ui.ControlContent=} opt_caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 *     Defaults to no caption.
 * @param {goog.ui.Menu=} opt_menu Menu containing selection options.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the control; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Select}
 */
anychart.ui.chartEditor.select.Base = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.ui.chartEditor.select.Base.base(this, 'constructor', opt_caption, opt_menu,
      opt_renderer || anychart.ui.chartEditor.select.Renderer.getInstance(),
      opt_domHelper, opt_menuRenderer);

  this.options_ = [];
  this.captions_ = [];
  this.icons_ = [];
};
goog.inherits(anychart.ui.chartEditor.select.Base, goog.ui.Select);


/**
 * @type {Array.<string>}
 * @private
 */
anychart.ui.chartEditor.select.Base.prototype.options_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.ui.chartEditor.select.Base.prototype.captions_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.ui.chartEditor.select.Base.prototype.icons_;


/**
 * Set model for options.
 * @param {Array.<string>} value
 */
anychart.ui.chartEditor.select.Base.prototype.setOptions = function(value) {
  this.options_ = value;
};


/**
 * Set caption for options.
 * @param {Array.<?string>} value
 */
anychart.ui.chartEditor.select.Base.prototype.setCaptions = function(value) {
  this.captions_ = value;
};


/**
 * Set caption for options.
 * @param {Array.<string>} value
 */
anychart.ui.chartEditor.select.Base.prototype.setIcons = function(value) {
  this.icons_ = value;
};


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.ui.chartEditor.select.Base.prototype.key_ = '';


/** @param {string|Array.<string>} value */
anychart.ui.chartEditor.select.Base.prototype.setKey = function(value) {
  this.key_ = value;
};


/**
 * Gets key.
 * @return {string|Array.<string>}
 */
anychart.ui.chartEditor.select.Base.prototype.getKey = function() {
  return this.key_;
};


/** @override */
anychart.ui.chartEditor.select.Base.prototype.createDom = function() {
  anychart.ui.chartEditor.select.Base.base(this, 'createDom');

  this.updateOptions();
};


/**
 * Update options.
 */
anychart.ui.chartEditor.select.Base.prototype.updateOptions = function() {
  var optionsCount = this.options_.length;
  var count = Math.max(this.getChildCount(), optionsCount);

  for (var i = 0; i < count; i++) {
    var optionItem = this.getItemAt(i);

    if (i < optionsCount) {
      var option = this.options_[i];
      var caption = this.captions_[i];
      var icon = this.icons_[i];
      var content = this.createContentElements(option, caption, icon);


      if (!optionItem) {
        optionItem = new goog.ui.Option(content, option);
        this.addItemAt(optionItem, i);
      } else {
        optionItem.setContent(content);
        optionItem.setModel(option);
        optionItem.setVisible(true);
      }
    } else {
      optionItem.setVisible(false);
    }
  }
};


/**
 * @param {string} option
 * @param {string} caption
 * @param {string} icon
 * @return {Array|string}
 */
anychart.ui.chartEditor.select.Base.prototype.createContentElements = function(option, caption, icon) {
  if (!goog.isDefAndNotNull(option)) return this.getCaption();
  caption = goog.isDef(caption) ? caption : option.toString();
  var content = [];
  if (caption) content.push(caption);
  if (icon) content.push(goog.dom.createDom(goog.dom.TagName.I, [goog.getCssName('anychart-chart-editor-icon'), icon]));
  return content;
};


/** @param {anychart.ui.chartEditor.steps.Base.Model} model */
anychart.ui.chartEditor.select.Base.prototype.update = function(model) {
  //todo: rework, need silently update selects
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
  var value = anychart.ui.chartEditor.Controller.getset(model, goog.isArray(this.key_) ? this.key_[0] : this.key_);
  var index = this.options_.indexOf(value);
  this.setSelectedIndex(index);
  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @override */
anychart.ui.chartEditor.select.Base.prototype.enterDocument = function() {
  anychart.ui.chartEditor.select.Base.base(this, 'enterDocument');

  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @override */
anychart.ui.chartEditor.select.Base.prototype.exitDocument = function() {
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);

  anychart.ui.chartEditor.select.Base.base(this, 'exitDocument');
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.ui.chartEditor.select.Base.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
  for (var i = 0, count = keys.length; i < count; i++) {
    this.dispatchEvent({
      type: anychart.ui.chartEditor.events.EventType.CHANGE_MODEL,
      key: keys[i],
      value: this.getSelectedItem().getModel()
    });
  }
  this.dispatchEvent(anychart.ui.chartEditor.events.EventType.UPDATE_EDITOR);
};


/**
 * @override
 * @suppress {visibility}
 */
anychart.ui.chartEditor.select.Base.prototype.updateCaption = function() {
  var selectedIndex = this.getSelectedIndex();
  var item = this.getSelectedItem();
  var option = this.options_[selectedIndex];
  var caption = this.captions_[selectedIndex];
  var icon = this.icons_[selectedIndex];
  var content = this.createContentElements(option, caption, icon);

  this.setContent(content);

  var contentElement = this.getRenderer().getContentElement(this.getElement());
  // Despite the ControlRenderer interface indicating the return value is
  // {Element}, many renderers cast element.firstChild to {Element} when it is
  // really {Node}. Checking tagName verifies this is an {!Element}.
  if (contentElement && this.getDomHelper().isElement(contentElement)) {
    if (this.initialAriaLabel_ == null) {
      this.initialAriaLabel_ = goog.a11y.aria.getLabel(contentElement);
    }
    var itemElement = item ? item.getElement() : null;
    goog.a11y.aria.setLabel(contentElement, itemElement ?
        goog.a11y.aria.getLabel(itemElement) : this.initialAriaLabel_);
    this.updateAriaActiveDescendant_();
  }
};
