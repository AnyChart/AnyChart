goog.provide('anychart.chartEditorModule.DataMapping');

goog.require('anychart.chartEditorModule.DataMappingField');
goog.require('anychart.chartEditorModule.IconButtonRenderer');
goog.require('anychart.ui.button.Base');
goog.require('goog.ui.Component');

goog.forwardDeclare('anychart.chartEditorModule.steps.Base.DataSet');
goog.forwardDeclare('anychart.chartEditorModule.steps.Base.RawMapping');



/**
 * @param {anychart.chartEditorModule.steps.Base.RawMapping} rawMapping
 * @param {Array<string|number>} values
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.DataMapping = function(rawMapping, values) {
  anychart.chartEditorModule.DataMapping.base(this, 'constructor');

  /**
   * The DOM element for the children.
   * @private {Element}
   */
  this.content_ = null;

  /**
   * @type {anychart.chartEditorModule.steps.Base.RawMapping}
   * @private
   */
  this.rawMapping_ = rawMapping;

  /**
   * Keys array for mapping.
   * @type {Array<string>}
   * @private
   */
  this.keys_ = [
    'x',
    'value',
    'size', // bubble series
    'open',
    'high',
    'low',
    'close',

    '-Box/Whisker fields',
    'lowest',
    'q1',
    'median',
    'q3',
    'highest',
    'outliers'

    // '-Maps fields',
    // 'id',
    // 'lat',
    // 'long',
    // 'points',  //connector series

    // '-Heat Map fields',
    // 'y',
    // 'heat'
  ];

  /**
   * Values array for mapping.
   * @type {Array.<string|number>}
   * @private
   */
  this.values_ = values;

  /**
   * @type {string}
   * @private
   */
  this.name_ = '';

  /**
   * @type {string}
   * @private
   */
  this.dataSetName_ = '';
};
goog.inherits(anychart.chartEditorModule.DataMapping, goog.ui.Component);


/** @type {string} */
anychart.chartEditorModule.DataMapping.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-mapping');


/** @inheritDoc */
anychart.chartEditorModule.DataMapping.prototype.getContentElement = function() {
  return this.content_;
};


/** @inheritDoc */
anychart.chartEditorModule.DataMapping.prototype.createDom = function() {
  anychart.chartEditorModule.DataMapping.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();


  var className = anychart.chartEditorModule.DataMapping.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  this.name_ = 'Data Mapping ' + (this.getParent().indexOfChild(this) + 1);
  this.dataSetName_ = this.getParent().getDataSet()['name'];

  this.titleEl_ = dom.createDom(goog.dom.TagName.DIV, goog.getCssName(className, 'title'), this.name_);
  element.appendChild(this.titleEl_);

  this.removeMappingBtn_ = new anychart.ui.button.Base(null, anychart.chartEditorModule.IconButtonRenderer.getInstance());
  this.removeMappingBtn_.setIcon(goog.getCssName('ac ac-remove'));
  this.removeMappingBtn_.addClassName(goog.getCssName('anychart-chart-editor-remove-mapping'));
  this.removeMappingBtn_.setTooltip('Remove data mapping');
  this.removeMappingBtn_.render(element);

  this.content_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'content'));
  element.appendChild(this.content_);

  this.addFieldBtn_ = new anychart.ui.button.Base('Add field');
  this.addFieldBtn_.addClassName(goog.getCssName('anychart-chart-editor-add-mapping-field'));
  this.addFieldBtn_.render(element);

  this.updateFields_();
};


/** @return {string} */
anychart.chartEditorModule.DataMapping.prototype.getTitle = function() {
  return (this.name_ + ' :: ' + this.dataSetName_).split('Data ').join('');
};


/**
 * Render mapping fields controls.
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.renderFields_ = function() {
  for (var i = 0; i < this.rawMapping_.length; i++) {
    this.addChild(new anychart.chartEditorModule.DataMappingField(this.keys_, this.values_, this.rawMapping_[i]), true);
  }
};


/**
 * Update mapping fields controls.
 * todo: rename to `update`
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.updateFields_ = function() {
  this.removeChildren(true);

  if (!this.rawMapping_.length) {
    this.addField_();
  }

  this.renderFields_();
};


/**
 * Add mapping field to raw mapping.
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.addField_ = function() {
  this.rawMapping_.push({
    key: undefined,
    value: undefined
  });
};


/**
 * Remove mapping field from raw mapping.
 * @param {anychart.chartEditorModule.steps.Base.RawMappingField} rawMappingField
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.removeField_ = function(rawMappingField) {
  goog.array.remove(this.rawMapping_, rawMappingField);
};


/**
 * Click handler for addField button.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.addFieldBtnClickHandler_ = function(e) {
  this.addField_();
  this.updateFields_();
};


/**
 * Click handler for removeMapping button.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.chartEditorModule.DataMapping.prototype.removeMappingBtnClickHandler_ = function(e) {
  this.getParent().removeMapping_(this.rawMapping_);
  this.getParent().updateMappings_();
};


/** @inheritDoc */
anychart.chartEditorModule.DataMapping.prototype.enterDocument = function() {
  anychart.chartEditorModule.DataMapping.base(this, 'enterDocument');

  this.getHandler().listen(this.addFieldBtn_, goog.ui.Component.EventType.ACTION, this.addFieldBtnClickHandler_);
  this.getHandler().listen(this.removeMappingBtn_, goog.ui.Component.EventType.ACTION, this.removeMappingBtnClickHandler_);
};


/** @inheritDoc */
anychart.chartEditorModule.DataMapping.prototype.exitDocument = function() {
  anychart.chartEditorModule.DataMapping.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.chartEditorModule.DataMapping.prototype.disposeInternal = function() {
  anychart.chartEditorModule.DataMapping.base(this, 'disposeInternal');
};
