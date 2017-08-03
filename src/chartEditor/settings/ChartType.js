goog.provide('anychart.chartEditorModule.settings.ChartType');

goog.require('goog.ui.Control');



/**
 * @constructor
 * @extends {goog.ui.Control}
 */
anychart.chartEditorModule.settings.ChartType = function() {
  anychart.chartEditorModule.settings.ChartType.base(this, 'constructor');

  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
  this.setAutoStates(goog.ui.Component.State.CHECKED, false);
};
goog.inherits(anychart.chartEditorModule.settings.ChartType, goog.ui.Control);


/** @type {string} */
anychart.chartEditorModule.settings.ChartType.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-chart-type');


/** @inheritDoc */
anychart.chartEditorModule.settings.ChartType.prototype.createDom = function() {
  anychart.chartEditorModule.settings.ChartType.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);
  goog.dom.classlist.add(element, goog.getCssName('anychart-thumbnail'));
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.ChartType.CSS_CLASS);

  this.image_ = goog.dom.createDom(goog.dom.TagName.IMG);
  goog.dom.appendChild(element, this.image_);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.ChartType.prototype.enterDocument = function() {
  anychart.chartEditorModule.settings.ChartType.base(this, 'enterDocument');
  goog.events.listen(this, goog.ui.Component.EventType.ACTION, this.onAction_, false, this);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.ChartType.prototype.exitDocument = function() {
  goog.events.listen(this, goog.ui.Component.EventType.ACTION, this.onAction_, false, this);
  anychart.chartEditorModule.settings.ChartType.base(this, 'exitDocument');
};


/**
 * @param {string} category
 * @param {{type: string, image: string, caption: string}} data
 * @param {boolean} checked
 */
anychart.chartEditorModule.settings.ChartType.prototype.update = function(category, data, checked) {
  this.setChecked(checked);
  this.setModel({category: category, presetType: data.type});

  //this.caption_.innerHTML = data.caption;
  goog.dom.setProperties(this.image_, {
    'src': 'https://cdn.anychart.com/images/chartopedia/' + data.image,
    'alt': data.caption,
    'title': data.caption
  });
};


/** @private */
anychart.chartEditorModule.settings.ChartType.prototype.onAction_ = function() {
  var model = /** @type {{category: string, presetType: string}} */(this.getModel());
  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.SET_PRESET_TYPE,
    category: model.category,
    presetType: model.presetType
  });
};
