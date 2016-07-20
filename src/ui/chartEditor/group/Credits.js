goog.provide('anychart.ui.chartEditor.group.Credits');

goog.require('anychart.ui.chartEditor.checkbox.Base');
goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Input');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.Credits = function(model) {
  anychart.ui.chartEditor.group.Credits.base(this, 'constructor', model);

  this.setHeader('Credits');
};
goog.inherits(anychart.ui.chartEditor.group.Credits, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.Credits.CssClass = {};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.disposeInternal = function() {
  goog.dispose(this.enabledBtn_);
  this.enabledBtn_ = null;
  this.textInput_ = null;
  this.urlInput_ = null;
  this.logoSrcInput_ = null;

  anychart.ui.chartEditor.group.Credits.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Credits.base(this, 'createDom');

  var content = this.getContentElement();

  var enabledBtn = new anychart.ui.chartEditor.checkbox.Base();
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  enabledBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-enabled'));
  enabledBtn.setKey('chart.credits().enabled()');
  enabledBtn.setNormalValue(false);
  enabledBtn.setCheckedValue(true);
  enabledBtn.render(this.getHeaderElement());
  enabledBtn.setParent(this);

  var textInputLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Text');
  goog.dom.appendChild(content, textInputLabel);

  var textInput = new anychart.ui.chartEditor.settings.Input();
  textInput.setKey('chart.credits().text()');
  this.addChild(textInput, true);
  goog.dom.classlist.add(textInput.getElement(), goog.getCssName('anychart-chart-editor-settings-control-right'));

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var urlInputLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Url');
  goog.dom.appendChild(content, urlInputLabel);

  var urlInput = new anychart.ui.chartEditor.settings.Input();
  urlInput.setKey('chart.credits().url()');
  this.addChild(urlInput, true);
  goog.dom.classlist.add(urlInput.getElement(), goog.getCssName('anychart-chart-editor-settings-control-right'));

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var logoSrcInputLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Logo url');
  goog.dom.appendChild(content, logoSrcInputLabel);

  var logoSrcInput = new anychart.ui.chartEditor.settings.Input();
  logoSrcInput.setKey('chart.credits().logoSrc()');
  this.addChild(logoSrcInput, true);
  goog.dom.classlist.add(logoSrcInput.getElement(), goog.getCssName('anychart-chart-editor-settings-control-right'));

  this.enabledBtn_ = enabledBtn;
  this.textInput_ = textInput;
  this.urlInput_ = urlInput;
  this.logoSrcInput_ = logoSrcInput;
};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.update = function() {
  this.enabledBtn_.update(this.model);
  this.textInput_.update(this.model);
  this.urlInput_.update(this.model);
  this.logoSrcInput_.update(this.model);
};

