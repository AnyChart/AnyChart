goog.provide('anychart.ui.chartEditor.DataMapping');

goog.require('anychart.ui.IconButtonRenderer');
goog.require('anychart.ui.button.Base');
goog.require('anychart.ui.chartEditor.DataMappingField');
goog.require('goog.ui.Component');

goog.forwardDeclare('anychart.ui.chartEditor.steps.Base.DataSet');
goog.forwardDeclare('anychart.ui.chartEditor.steps.Base.RawMapping');



/**
 * @param {anychart.ui.chartEditor.steps.Base.RawMapping} rawMapping
 * @param {Array<string|number>} values
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.DataMapping = function(rawMapping, values) {
  anychart.ui.chartEditor.DataMapping.base(this, 'constructor');

  /**
   * The DOM element for the children.
   * @private {Element}
   */
  this.content_ = null;

  /**
   * @type {anychart.ui.chartEditor.steps.Base.RawMapping}
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
};
goog.inherits(anychart.ui.chartEditor.DataMapping, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.DataMapping.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-mapping');


/** @inheritDoc */
anychart.ui.chartEditor.DataMapping.prototype.getContentElement = function() {
  return this.content_;
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMapping.prototype.createDom = function() {
  anychart.ui.chartEditor.DataMapping.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();

  var className = anychart.ui.chartEditor.DataMapping.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  this.titleEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'title'),
      'Data Mapping ' + (this.getParent().indexOfChild(this) + 1));
  element.appendChild(this.titleEl_);

  this.removeMappingBtn_ = new anychart.ui.button.Base(null, anychart.ui.IconButtonRenderer.getInstance());
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


/**
 * Render mapping fields controls.
 * @private
 */
anychart.ui.chartEditor.DataMapping.prototype.renderFields_ = function() {
  for (var i = 0; i < this.rawMapping_.length; i++) {
    this.addChild(new anychart.ui.chartEditor.DataMappingField(this.keys_, this.values_, this.rawMapping_[i]), true);
  }
};


/**
 * Update mapping fields controls.
 * todo: rename to `update`
 * @private
 */
anychart.ui.chartEditor.DataMapping.prototype.updateFields_ = function() {
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
anychart.ui.chartEditor.DataMapping.prototype.addField_ = function() {
  this.rawMapping_.push({
    key: undefined,
    value: undefined
  });
};


/**
 * Remove mapping field from raw mapping.
 * @param {anychart.ui.chartEditor.steps.Base.RawMappingField} rawMappingField
 * @private
 */
anychart.ui.chartEditor.DataMapping.prototype.removeField_ = function(rawMappingField) {
  goog.array.remove(this.rawMapping_, rawMappingField);
};


/**
 * Click handler for addField button.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.ui.chartEditor.DataMapping.prototype.addFieldBtnClickHandler_ = function(e) {
  this.addField_();
  this.updateFields_();
};


/**
 * Click handler for removeMapping button.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.ui.chartEditor.DataMapping.prototype.removeMappingBtnClickHandler_ = function(e) {
  this.getParent().removeMapping_(this.rawMapping_);
  this.getParent().updateMappings_();
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMapping.prototype.enterDocument = function() {
  anychart.ui.chartEditor.DataMapping.base(this, 'enterDocument');

  this.getHandler().listen(this.addFieldBtn_, goog.ui.Component.EventType.ACTION, this.addFieldBtnClickHandler_);
  this.getHandler().listen(this.removeMappingBtn_, goog.ui.Component.EventType.ACTION, this.removeMappingBtnClickHandler_);
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMapping.prototype.exitDocument = function() {
  anychart.ui.chartEditor.DataMapping.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMapping.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.DataMapping.base(this, 'disposeInternal');
};
