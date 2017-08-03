goog.provide('anychart.chartEditorModule.settings.Axis');

goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.select.Base');
goog.require('anychart.chartEditorModule.settings.Title');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.settings.Axis = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'constructor');

  this.enabled_ = true;
};
goog.inherits(anychart.chartEditorModule.settings.Axis, goog.ui.Component);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Axis.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-axis');


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Axis.prototype.name_ = 'Axis';


/** @param {string} value */
anychart.chartEditorModule.settings.Axis.prototype.setName = function(value) {
  this.name_ = value;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Axis.prototype.showName_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.settings.Axis.prototype.showName = function(value) {
  this.showName_ = value;
};


/**
 * @type {number}
 * @private
 */
anychart.chartEditorModule.settings.Axis.prototype.index_ = 0;


/** @param {number} value */
anychart.chartEditorModule.settings.Axis.prototype.setIndex = function(value) {
  if (value != this.index_) {
    this.index_ = value;
    this.updateKeys();
  }
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Axis.prototype.key_ = 'axis';


/** @param {string} value */
anychart.chartEditorModule.settings.Axis.prototype.setKey = function(value) {
  if (value != this.key_) {
    this.key_ = value;
    this.updateKeys();
  }
};


/**
 * Enables/Disables the Axis settings.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the
 *     Axis settings.
 */
anychart.chartEditorModule.settings.Axis.prototype.setEnabled = function(enabled) {
  if (enabled) {
    this.enabled_ = enabled;
  }

  this.forEachChild(function(child) {
    child.setEnabled(enabled);
  });

  if (!enabled) {
    this.enabled_ = enabled;
  }

  if (this.enabledHeader_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.enabledHeader_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.orientationLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.orientationLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.invertedLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.invertedLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }
};


/**
 * @return {boolean} Whether the Axis settings is enabled.
 */
anychart.chartEditorModule.settings.Axis.prototype.isEnabled = function() {
  return this.enabled_;
};


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.disposeInternal = function() {
  this.orientation_ = null;
  this.inverted_ = null;
  this.title_ = null;
  this.labels_ = null;
  anychart.chartEditorModule.settings.Axis.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'createDom');
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Axis.CSS_CLASS);

  if (this.showName_) {
    var enabledHeader = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-header'),
        this.name_);
    goog.dom.appendChild(element, enabledHeader);

    goog.dom.appendChild(element, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));
  }

  //region Orientation
  var orientationLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Orientation');
  goog.dom.appendChild(element, orientationLabel);

  var orientationSelect = new anychart.chartEditorModule.select.Base();
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-select-image'));
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  var orientationSelectMenu = orientationSelect.getMenu();
  orientationSelectMenu.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);
  orientationSelect.setOptions(['left', 'right', 'top', 'bottom']);
  orientationSelect.setCaptions([null, null, null, null]);
  orientationSelect.setIcons(['ac ac-position-left', 'ac ac-position-right', 'ac ac-position-top', 'ac ac-position-bottom']);
  this.addChild(orientationSelect, true);

  goog.dom.appendChild(element, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));
  //endregion

  //region Inverted
  var invertedLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Inverted');
  goog.dom.appendChild(element, invertedLabel);

  var invertedBtn = new anychart.chartEditorModule.checkbox.Base();
  invertedBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  invertedBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-enabled'));
  invertedBtn.setNormalValue(false);
  invertedBtn.setCheckedValue(true);
  invertedBtn.setLabel(invertedLabel);
  this.addChild(invertedBtn, true);

  goog.dom.appendChild(element, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));
  //endregion

  //region Title
  var title = new anychart.chartEditorModule.settings.Title();
  title.allowEditPosition(false);
  this.addChild(title, true);

  goog.dom.appendChild(element, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));
  //endregion

  //region Labels
  var labels = new anychart.chartEditorModule.settings.Title();
  labels.allowEditPosition(false);
  labels.allowEditAlign(false);
  labels.setTitleKey('format()');
  labels.setHeaderText('Labels');
  this.addChild(labels, true);
  //endregion

  this.orientation_ = orientationSelect;
  this.inverted_ = invertedBtn;
  this.title_ = title;
  this.labels_ = labels;

  this.enabledHeader_ = enabledHeader;
  this.orientationLabel_ = orientationLabel;
  this.invertedLabel_ = invertedLabel;

  this.updateKeys();
};


/**
 * Update model keys.
 */
anychart.chartEditorModule.settings.Axis.prototype.updateKeys = function() {
  if (this.orientation_) this.orientation_.setKey(this.genKey('orientation()'));
  if (this.inverted_) this.inverted_.setKey('chart.' + (this.key_ == 'xAxis' ? 'xScale' : 'yScale') + '().inverted()');
  if (this.title_) {
    this.title_.setKey(this.genKey('title()'));
    this.title_.setOrientationKey(this.genKey('title().orientation()'));
  }
  if (this.labels_) this.labels_.setKey(this.genKey('labels()'));
};


/**
 * Update controls.
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 */
anychart.chartEditorModule.settings.Axis.prototype.update = function(model) {
  if (this.orientation_) this.orientation_.update(model);
  if (this.inverted_) this.inverted_.update(model);
  if (this.title_) this.title_.update(model);
  if (this.labels_) this.labels_.update(model);
};


/**
 * @param {string} value
 * @return {string}
 */
anychart.chartEditorModule.settings.Axis.prototype.genKey = function(value) {
  return 'chart.' + this.key_ + '(' + this.index_ + ').' + value;
};
