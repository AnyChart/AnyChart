goog.provide('anychart.ui.chartEditor.group.Base');

goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Component');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.group.Base = function(model) {
  anychart.ui.chartEditor.group.Base.base(this, 'constructor');

  /**
   * @protected
   * @type {anychart.ui.chartEditor.steps.Base.Model}
   */
  this.model = model;
};
goog.inherits(anychart.ui.chartEditor.group.Base, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.group.Base.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-group');


/** @enum {string} */
anychart.ui.chartEditor.group.Base.CssClass = {
  HEADER: goog.getCssName('anychart-chart-editor-settings-group-header'),
  CONTENT: goog.getCssName('anychart-chart-editor-settings-group-content')
};


/**
 * @type {boolean}
 * @private
 */
anychart.ui.chartEditor.group.Base.prototype.expanded_ = false;


/**
 * @param {boolean} value
 */
anychart.ui.chartEditor.group.Base.prototype.setExpanded = function(value) {
  this.expanded_ = value;
  if (this.zippy_) {
    this.zippy_.setExpanded(value);
  }
};


/**
 * @type {string}
 * @private
 */
anychart.ui.chartEditor.group.Base.prototype.header_ = 'Settings Group';


/** @param {string} value */
anychart.ui.chartEditor.group.Base.prototype.setHeader = function(value) {
  if (this.header_ != value) {
    this.header_ = value;
    if (this.headerElement_) this.headerElement_.innerHTML = this.header_;
  }
};


/**
 * @type {Element}
 * @private
 */
anychart.ui.chartEditor.group.Base.prototype.headerElement_ = null;


/** @return {Element} */
anychart.ui.chartEditor.group.Base.prototype.getHeaderElement = function() {
  return this.headerElement_;
};


/**
 * @type {Element}
 * @private
 */
anychart.ui.chartEditor.group.Base.prototype.contentElement_ = null;


/** @override */
anychart.ui.chartEditor.group.Base.prototype.getContentElement = function() {
  return this.contentElement_;
};


/** @override */
anychart.ui.chartEditor.group.Base.prototype.disposeInternal = function() {
  goog.dispose(this.zippy_);
  this.zippy_ = null;
  this.headerElement_ = null;
  this.contentElement_ = null;
  anychart.ui.chartEditor.group.Base.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.Base.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Base.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.ui.chartEditor.group.Base.CSS_CLASS);

  var header = goog.dom.createDom(
      goog.dom.TagName.DIV,
      anychart.ui.chartEditor.group.Base.CssClass.HEADER,
      this.header_);
  goog.dom.appendChild(element, header);

  var content = goog.dom.createDom(
      goog.dom.TagName.DIV,
      anychart.ui.chartEditor.group.Base.CssClass.CONTENT);
  goog.dom.appendChild(element, content);

  this.headerElement_ = header;
  this.contentElement_ = content;
  this.zippy_ = new goog.ui.AnimatedZippy(header, content, this.expanded_);
};


/**
 * Update controls
 */
anychart.ui.chartEditor.group.Base.prototype.update = goog.abstractMethod;
