goog.provide('anychart.ui.chartEditor.DataMappingField');

goog.require('anychart.ui.button.Base');
goog.require('anychart.ui.chartEditor.select.Renderer');
goog.require('goog.ui.Component');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');
goog.require('goog.ui.Separator');

goog.forwardDeclare('anychart.ui.chartEditor.steps.Base.RawMappingField');



/**
 * @param {Array} keys
 * @param {Array} values
 * @param {anychart.ui.chartEditor.steps.Base.RawMappingField} rawMappingField
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.DataMappingField = function(keys, values, rawMappingField) {
  anychart.ui.chartEditor.DataMappingField.base(this, 'constructor');

  /**
   * Keys of mapping.
   * @type {Array<string>}
   * @private
   */
  this.keys_ = keys;

  /**
   * Values from dataSet.
   * @type {Array.<string|number>}
   * @private
   */
  this.values_ = values;

  /**
   * Key-value pair for mapping row.
   * @type {anychart.ui.chartEditor.steps.Base.RawMappingField}
   * @private
   */
  this.rawMappingField_ = rawMappingField;
};
goog.inherits(anychart.ui.chartEditor.DataMappingField, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.DataMappingField.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-mapping-field');


/**
 * CSS classes for other elements.
 * @enum {string}
 */
anychart.ui.chartEditor.DataMappingField.CssClass = {
  KEY_SELECT: goog.getCssName(anychart.ui.chartEditor.DataMappingField.CSS_CLASS, 'key'),
  VALUE_SELECT: goog.getCssName(anychart.ui.chartEditor.DataMappingField.CSS_CLASS, 'value')
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappingField.prototype.createDom = function() {
  anychart.ui.chartEditor.DataMappingField.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var className = anychart.ui.chartEditor.DataMappingField.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  this.renderKeySelect_();
  this.renderValueSelect_();

  this.removeBtn_ = new anychart.ui.button.Base(null, anychart.ui.IconButtonRenderer.getInstance());
  this.removeBtn_.setIcon(goog.getCssName('ac ac-remove'));
  this.removeBtn_.addClassName(goog.getCssName('anychart-chart-editor-remove-mapping-field'));
  this.removeBtn_.setTooltip('Remove field');
  this.addChild(this.removeBtn_, true);
};


/**
 * Render "key" of mapping select.
 * @private
 */
anychart.ui.chartEditor.DataMappingField.prototype.renderKeySelect_ = function() {
  this.keySelect_ = new goog.ui.Select('Select key', null,
      anychart.ui.chartEditor.select.Renderer.getInstance());
  this.keySelect_.addClassName(anychart.ui.chartEditor.DataMappingField.CssClass.KEY_SELECT);

  var option;
  for (var i = 0; i < this.keys_.length; i++) {
    option = new goog.ui.Option(this.keys_[i]);
    if (this.keys_[i][0] == '-') {
      option.setCaption(this.keys_[i].substr(1, this.keys_[i].length));
      option.setEnabled(false);
      this.keySelect_.addItem(new goog.ui.Separator());
    }
    this.keySelect_.addItem(option);
  }
  this.keySelect_.setScrollOnOverflow(true);

  if (goog.isDef(this.rawMappingField_.key))
    this.keySelect_.setValue(this.rawMappingField_.key);

  this.addChild(this.keySelect_, true);
  this.keySelect_.getMenu().getElement().style.overflowY = 'auto';
};


/**
 * Render "value" of mapping select.
 * @private
 */
anychart.ui.chartEditor.DataMappingField.prototype.renderValueSelect_ = function() {
  this.valueSelect_ = new goog.ui.Select('Select value', null,
      anychart.ui.chartEditor.select.Renderer.getInstance());
  this.valueSelect_.addClassName(anychart.ui.chartEditor.DataMappingField.CssClass.VALUE_SELECT);

  var option;
  for (var i = 0; i < this.values_.length; i++) {
    option = new goog.ui.Option(String(this.values_[i]));
    this.valueSelect_.addItem(option);
  }
  this.valueSelect_.setScrollOnOverflow(true);

  if (goog.isDef(this.rawMappingField_.value))
    this.valueSelect_.setValue(String(this.rawMappingField_.value));

  this.addChild(this.valueSelect_, true);
  this.valueSelect_.getMenu().getElement().style.overflowY = 'auto';
};


/**
 * Click handler for removeField button.
 * @private
 */
anychart.ui.chartEditor.DataMappingField.prototype.removeFieldBtnClickHandler_ = function() {
  this.getParent().removeField_(this.rawMappingField_);
  this.getParent().updateFields_();
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappingField.prototype.enterDocument = function() {
  anychart.ui.chartEditor.DataMappingField.base(this, 'enterDocument');

  this.keySelect_.listen(goog.ui.Component.EventType.CHANGE, function(e) {
    var option = /** @type {goog.ui.Select} */(e.target).getSelectedItem();

    this.rawMappingField_.key = option.getCaption();
    //this.getParent().updateFields_();
  }, false, this);

  this.valueSelect_.listen(goog.ui.Component.EventType.CHANGE, function(e) {
    var option = /** @type {goog.ui.Select} */(e.target).getSelectedItem();

    this.rawMappingField_.value = goog.isNumber(this.values_[0]) ? +option.getCaption() : option.getCaption();
    //this.getParent().updateFields_();
  }, false, this);

  this.getHandler().listen(this.removeBtn_, goog.ui.Component.EventType.ACTION, this.removeFieldBtnClickHandler_);
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappingField.prototype.exitDocument = function() {
  anychart.ui.chartEditor.DataMappingField.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappingField.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.DataMappingField.base(this, 'disposeInternal');
};
