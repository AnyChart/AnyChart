goog.provide('anychart.chartEditorModule.steps.Data');

goog.require('anychart.chartEditorModule.DataMappings');
goog.require('anychart.chartEditorModule.events');
goog.require('anychart.chartEditorModule.steps.Base');
goog.require('goog.dom.classlist');
goog.require('goog.format.JsonPrettyPrinter');

goog.forwardDeclare('anychart.data.Mapping');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditorModule.steps.Base}
 */
anychart.chartEditorModule.steps.Data = function(opt_domHelper) {
  anychart.chartEditorModule.steps.Data.base(this, 'constructor', opt_domHelper);

  /**
   * @type {anychart.chartEditorModule.DataMappings}
   * @private
   */
  this.dataMappings_ = null;

  /**
   * @type {number}
   * @private
   */
  this.selectedDataSetIndex_ = 0;

  this.setName('Chart Data');
  this.setTitle('Chart Data');
};
goog.inherits(anychart.chartEditorModule.steps.Data, anychart.chartEditorModule.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.chartEditorModule.steps.Data.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-step');


/**
 * DataSet index attribute.
 * @private
 */
anychart.chartEditorModule.steps.Data.DATA_SET_DATA_ATTRIBUTE_ = 'data-index';


/** @override */
anychart.chartEditorModule.steps.Data.prototype.createDom = function() {
  anychart.chartEditorModule.steps.Data.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();

  var className = anychart.chartEditorModule.steps.Data.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();

  this.dataSetsEl_ = dom.createDom(
      goog.dom.TagName.UL,
      goog.getCssName(className, 'data-sets'));
  asideEl.appendChild(this.dataSetsEl_);

  var contentEl = this.getContentElement();
  this.dataPreviewEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'data-preview'),
      dom.createDom(goog.dom.TagName.DIV, goog.getCssName(className, 'data-preview-text'), 'Data Preview'));

  this.dataPreviewContentEl_ = dom.createDom(
      goog.dom.TagName.PRE, goog.getCssName(className, 'data-preview-code'));

  this.dataPreviewEl_.appendChild(this.dataPreviewContentEl_);
  contentEl.appendChild(this.dataPreviewEl_);

  this.updateDataSets_();
};


/**
 * Update data sets UI in left column.
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.updateDataSets_ = function() {
  var dom = this.getDomHelper();
  var className = anychart.chartEditorModule.steps.Data.CSS_CLASS;
  var sharedModel = this.getSharedModel();

  // Clear old data sets
  goog.dom.removeChildren(this.dataSetsEl_);

  var dataSet;
  var dataSetEl;
  for (var i = 0; i < sharedModel.dataSets.length; i++) {
    dataSet = sharedModel.dataSets[i];
    dataSetEl = dom.createDom(
        goog.dom.TagName.LI,
        goog.getCssName(className, 'data-set'),
        dataSet.name);
    dataSetEl.setAttribute(anychart.chartEditorModule.steps.Data.DATA_SET_DATA_ATTRIBUTE_, String(dataSet.index));

    this.dataSetsEl_.appendChild(dataSetEl);
  }

  this.selectDataSet_(this.selectedDataSetIndex_);
};


/**
 * Update data preview content.
 * @param {number} index
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.updateDataPreview_ = function(index) {
  var sharedModel = this.getSharedModel();
  var dataSet = sharedModel.dataSets[index];
  var dataSetData = dataSet.instance.data();

  var settings = new goog.format.JsonPrettyPrinter.SafeHtmlDelimiters();
  settings.lineBreak = '';
  settings.objectStart = '\n{';
  settings.arrayStart = '\n[';
  settings.space = '';
  settings.propertySeparator = ', ';
  settings.nameValueSeparator = ': ';

  var f = new goog.format.JsonPrettyPrinter(settings);
  var htmlStr = f.format(dataSetData);
  htmlStr = htmlStr.slice(0, -1).substring(3);
  this.dataPreviewContentEl_.innerHTML = htmlStr;
};


/**
 * @param {number} index
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.updateDataMappings_ = function(index) {
  if (this.dataMappings_) {
    this.dataMappings_.dispose();
    this.dataMappings_ = null;
  }

  var sharedModel = this.getSharedModel();
  var dataSet = sharedModel.dataSets[index];
  var rawData = dataSet.instance.data();

  // we work with arrays or objects only.
  if (goog.isArrayLike(rawData[0]) || goog.isObject(rawData[0])) {
    this.dataMappings_ = new anychart.chartEditorModule.DataMappings(dataSet);
    this.dataMappings_.render(this.getContentElement());
  }
};


/**
 * Get selected dataSet.
 * @return {anychart.chartEditorModule.steps.Base.DataSet}
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.getSelectedDataSet_ = function() {
  return this.getSharedModel().dataSets[this.selectedDataSetIndex_];
};


/**
 * Select data set.
 * @param {number} index
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.selectDataSet_ = function(index) {
  var sharedModel = this.getSharedModel();
  if (!sharedModel.dataSets.length) return;

  this.selectedDataSetIndex_ = index;

  var className = anychart.chartEditorModule.steps.Data.CSS_CLASS;
  var activeClass = goog.getCssName('anychart-active');

  var activeDataSetEl = goog.dom.getElementByClass(activeClass, this.dataSetsEl_);
  if (activeDataSetEl) goog.dom.classlist.remove(activeDataSetEl, activeClass);

  var dataSetsElements = this.dataSetsEl_.getElementsByClassName(goog.getCssName(className, 'data-set'));
  var dataSetEl = dataSetsElements[index];
  goog.dom.classlist.add(dataSetEl, activeClass);

  this.updateDataPreview_(index);
  this.updateDataMappings_(index);
};


/**
 * Click handler for dataSet list.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.dataSetsClickHandler_ = function(e) {
  var className = anychart.chartEditorModule.steps.Data.CSS_CLASS;
  var itemClass = goog.getCssName(className, 'data-set');
  var element = /** @type {!Element} */(e.target);
  if (goog.dom.classlist.contains(element, itemClass)) {
    var dataStepIndex = Number(element.getAttribute(anychart.chartEditorModule.steps.Data.DATA_SET_DATA_ATTRIBUTE_));
    this.selectDataSet_(dataStepIndex);
  }
};


/** @inheritDoc */
anychart.chartEditorModule.steps.Data.prototype.enterDocument = function() {
  anychart.chartEditorModule.steps.Data.base(this, 'enterDocument');

  this.getHandler().listen(this.dataPreviewContentEl_, goog.events.EventType.WHEEL, this.handleWheel);

  this.getHandler().listen(this.dataSetsEl_, goog.events.EventType.CLICK, this.dataSetsClickHandler_);
  this.listen(anychart.chartEditorModule.events.EventType.CHANGE_STEP, this.onChangeStep_);
};


/**
 *
 * @param {Object} e
 * @private
 */
anychart.chartEditorModule.steps.Data.prototype.onChangeStep_ = function(e) {
  var sharedModel = this.getSharedModel();
  this.updateSharedDataMappings();

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.REMOVE_ALL_SERIES
  });

  // build series
  for (var i = 0, count = sharedModel.dataMappings.length; i < count; i++) {
    this.dispatchEvent({
      type: anychart.chartEditorModule.events.EventType.ADD_SERIES,
      seriesType: null,
      mapping: i,
      rebuild: false
    });
  }

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.SET_CHART_DATA,
    value: 0,
    rebuild: false
  });
};


/** @inheritDoc */
anychart.chartEditorModule.steps.Data.prototype.update = function() {
  this.updateDataSets_();
};


/** @inheritDoc */
anychart.chartEditorModule.steps.Data.prototype.exitDocument = function() {
  anychart.chartEditorModule.steps.Data.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.chartEditorModule.steps.Data.prototype.disposeInternal = function() {
  anychart.chartEditorModule.steps.Data.base(this, 'disposeInternal');
};
