goog.provide('anychart.ui.chartEditor.group.Credits');

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
  this.useEnabledButton(true);
  this.setKey('chart.credits()');

  this.setEnabled(window['anychart']['utils']['printUtilsBoolean']());
};
goog.inherits(anychart.ui.chartEditor.group.Credits, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.Credits.CssClass = {};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.setContentEnabled = function(enabled) {
  anychart.ui.chartEditor.group.Credits.base(this, 'setContentEnabled', enabled);

  if (this.textInputLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.textInputLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.urlInputLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.urlInputLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.logoSrcInputLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.logoSrcInputLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }
};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.disposeInternal = function() {
  this.textInput_ = null;
  this.urlInput_ = null;
  this.logoSrcInput_ = null;

  anychart.ui.chartEditor.group.Credits.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Credits.base(this, 'createDom');

  var content = this.getContentElement();

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

  this.textInput_ = textInput;
  this.urlInput_ = urlInput;
  this.logoSrcInput_ = logoSrcInput;

  this.textInputLabel_ = textInputLabel;
  this.urlInputLabel_ = urlInputLabel;
  this.logoSrcInputLabel_ = logoSrcInputLabel;
};


/** @override */
anychart.ui.chartEditor.group.Credits.prototype.update = function(model) {
  anychart.ui.chartEditor.group.Credits.base(this, 'update', model);

  this.textInput_.update(model);
  this.urlInput_.update(model);
  this.logoSrcInput_.update(model);
};

