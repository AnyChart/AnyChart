goog.provide('anychart.chartEditorModule.group.Base');

goog.require('anychart.chartEditorModule.checkbox.Base');

goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Component');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.group.Base = function(model) {
  anychart.chartEditorModule.group.Base.base(this, 'constructor');

  /**
   * @protected
   * @type {anychart.chartEditorModule.steps.Base.Model}
   */
  this.model = model;

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;
};
goog.inherits(anychart.chartEditorModule.group.Base, goog.ui.Component);


/** @type {string} */
anychart.chartEditorModule.group.Base.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-group');


/** @enum {string} */
anychart.chartEditorModule.group.Base.CssClass = {
  HEADER: goog.getCssName('anychart-chart-editor-settings-group-header'),
  CONTENT: goog.getCssName('anychart-chart-editor-settings-group-content')
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.expanded_ = false;


/**
 * @param {boolean} value
 */
anychart.chartEditorModule.group.Base.prototype.setExpanded = function(value) {
  this.expanded_ = value;
  if (this.zippy_) {
    this.zippy_.setExpanded(value);
  }
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.header_ = 'Settings Group';


/** @param {string} value */
anychart.chartEditorModule.group.Base.prototype.setHeader = function(value) {
  if (this.header_ != value) {
    this.header_ = value;
    if (this.headerElement_) this.headerElement_.innerHTML = this.header_;
  }
};


/**
 * @type {Element}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.headerElement_ = null;


/** @return {Element} */
anychart.chartEditorModule.group.Base.prototype.getHeaderElement = function() {
  return this.headerElement_;
};


/**
 * @type {Element}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.contentElement_ = null;


/** @override */
anychart.chartEditorModule.group.Base.prototype.getContentElement = function() {
  return this.contentElement_;
};


/**
 * @type {string|Array.<string>}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.key_ = '';


/** @param {string|Array.<string>} value */
anychart.chartEditorModule.group.Base.prototype.setKey = function(value) {
  if (this.key_ != value) {
    this.key_ = value;
    this.updateKeys();
  }
};


/**
 * @return {string|Array.<string>}
 */
anychart.chartEditorModule.group.Base.prototype.getKey = function() {
  return this.key_;
};


/**
 * @param {string} value
 * @return {Array.<string>}
 */
anychart.chartEditorModule.group.Base.prototype.genKey = function(value) {
  var keys = goog.isArray(this.key_) ? this.key_ : [this.key_];
  var result = [];

  for (var i = 0, count = keys.length; i < count; i++) {
    result.push(keys[i] + value);
  }

  return result;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.useEnabledButton_ = false;


/**
 * @param {boolean} value
 * @protected
 */
anychart.chartEditorModule.group.Base.prototype.useEnabledButton = function(value) {
  this.useEnabledButton_ = value;
};


/**
 * Enables/Disables the all group controls.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the
 *     all group controls.
 * @protected
 */
anychart.chartEditorModule.group.Base.prototype.setEnabled = function(enabled) {
  this.enabled_ = true;

  if (this.isInDocument()) {
    this.applyEnabled_(enabled);
  }

  this.enabled_ = enabled;
};


/**
 * @param {boolean} enabled
 * @private
 */
anychart.chartEditorModule.group.Base.prototype.applyEnabled_ = function(enabled) {
  if (this.useEnabledButton_)
    this.enabledBtn_.setEnabled(enabled);

  this.setContentEnabled(enabled);

  this.enabled_ = enabled;
};


/**
 * @return {boolean} Whether the all group controls is enabled.
 */
anychart.chartEditorModule.group.Base.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * Enables/Disables the group content controls.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the
 *     group content controls.
 * @protected
 */
anychart.chartEditorModule.group.Base.prototype.setContentEnabled = function(enabled) {
  this.forEachChild(function(child) {
    if (goog.isFunction(child.setEnabled)) {
      child.setEnabled(enabled);
    }
  });
};


/** @override */
anychart.chartEditorModule.group.Base.prototype.disposeInternal = function() {
  goog.dispose(this.zippy_);
  this.enabledBtn_ = null;
  this.zippy_ = null;
  this.headerElement_ = null;
  this.contentElement_ = null;
  anychart.chartEditorModule.group.Base.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.group.Base.prototype.createDom = function() {
  anychart.chartEditorModule.group.Base.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.group.Base.CSS_CLASS);

  var header = goog.dom.createDom(
      goog.dom.TagName.DIV,
      anychart.chartEditorModule.group.Base.CssClass.HEADER,
      this.header_);

  if (this.useEnabledButton_) {
    var enabledBtn = new anychart.chartEditorModule.checkbox.Base();
    enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
    enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-enabled'));
    enabledBtn.setNormalValue(false);
    enabledBtn.setCheckedValue(true);
    enabledBtn.render(header);
    enabledBtn.setParent(this);
    this.enabledBtn_ = enabledBtn;
  }

  goog.dom.appendChild(element, header);

  var content = goog.dom.createDom(
      goog.dom.TagName.DIV,
      anychart.chartEditorModule.group.Base.CssClass.CONTENT);
  goog.dom.appendChild(element, content);

  this.headerElement_ = header;
  this.contentElement_ = content;
  this.zippy_ = new goog.ui.AnimatedZippy(header, content, this.expanded_);

  this.updateKeys();
};


/** @inheritDoc */
anychart.chartEditorModule.group.Base.prototype.enterDocument = function() {
  anychart.chartEditorModule.group.Base.base(this, 'enterDocument');

  this.applyEnabled_(this.isEnabled());
};


/**
 * Update controls.
 * @param {anychart.chartEditorModule.steps.Base.Model|anychart.chartEditorModule.steps.Base.Preset} model
 */
anychart.chartEditorModule.group.Base.prototype.update = function(model) {
  if (this.enabledBtn_) this.enabledBtn_.update(model);

  if (this.isEnabled()) {
    var enabledKey = this.genKey('.enabled()');
    var enabled = Boolean(anychart.chartEditorModule.Controller.getset(
        /** @type {anychart.chartEditorModule.steps.Base.Model} */(model),
        goog.isArray(enabledKey) ? enabledKey[0] : enabledKey));

    this.setContentEnabled(enabled);
  }
};


/**
 * Update ui keys.
 */
anychart.chartEditorModule.group.Base.prototype.updateKeys = function() {
  if (this.enabledBtn_) {
    this.enabledBtn_.setKey(this.genKey('.enabled()'));
  }
};
