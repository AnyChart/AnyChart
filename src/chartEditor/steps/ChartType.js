goog.provide('anychart.chartEditorModule.steps.ChartType');

goog.require('anychart.chartEditorModule.ChartTypeSideBar');
goog.require('anychart.chartEditorModule.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditorModule.steps.Base}
 */
anychart.chartEditorModule.steps.ChartType = function(opt_domHelper) {
  anychart.chartEditorModule.steps.ChartType.base(this, 'constructor', opt_domHelper);

  this.setName('Chart Type');
  this.setTitle('Chart Type');
};
goog.inherits(anychart.chartEditorModule.steps.ChartType, anychart.chartEditorModule.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.chartEditorModule.steps.ChartType.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartType-step');


/** @enum {string} */
anychart.chartEditorModule.steps.ChartType.CssClass = {};


/**
 * @param {boolean=} opt_setDefaultPreset
 * @private
 */
anychart.chartEditorModule.steps.ChartType.prototype.checkDataMapping_ = function(opt_setDefaultPreset) {
  var model = this.getSharedModel();

  var r = this.checkMappings(opt_setDefaultPreset);

  if (opt_setDefaultPreset && r.type) {
    this.dispatchEvent({
      type: anychart.chartEditorModule.events.EventType.SET_PRESET_TYPE,
      category: r.category,
      presetType: r.type
    });
  }

  goog.dom.classlist.enable(this.existDataMappingWarningEl_, goog.getCssName('anychart-hidden'), Boolean(model.dataMappings.length));
  this.enableNextStep(Boolean(model.dataMappings.length));

  goog.dom.classlist.enable(this.fieldsDataMappingWarningEl_, goog.getCssName('anychart-hidden'), r.isValid);
  this.enableNextStep(r.isValid);
};


/** @override */
anychart.chartEditorModule.steps.ChartType.prototype.createDom = function() {
  anychart.chartEditorModule.steps.ChartType.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();

  var className = anychart.chartEditorModule.steps.ChartType.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();

  var chartTypeSidebar = new anychart.chartEditorModule.ChartTypeSideBar();
  chartTypeSidebar.setParentEventTarget(this);
  chartTypeSidebar.render(asideEl);

  this.existDataMappingWarningEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-data-mapping-warning-outer')
      ],
      dom.createDom(
          goog.dom.TagName.DIV,
          [
            goog.ui.INLINE_BLOCK_CLASSNAME,
            goog.getCssName('anychart-data-mapping-warning-inner')
          ],
          'You need at least one Data Mapping to build your chart.'));
  goog.dom.appendChild(this.getContentElement(), this.existDataMappingWarningEl_);


  this.fieldsDataMappingWarningEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-data-mapping-warning-outer')
      ],
      dom.createDom(
          goog.dom.TagName.DIV,
          [
            goog.ui.INLINE_BLOCK_CLASSNAME,
            goog.getCssName('anychart-data-mapping-warning-inner')
          ],
          'Not enough fields in Data Mapping to build your chart.'));
  goog.dom.appendChild(this.getContentElement(), this.fieldsDataMappingWarningEl_);
  this.chartTypeSidebar_ = chartTypeSidebar;

  this.checkDataMapping_(true);
};


/** @override */
anychart.chartEditorModule.steps.ChartType.prototype.enterDocument = function() {
  anychart.chartEditorModule.steps.ChartType.base(this, 'enterDocument');

  this.update();

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.BUILD_CHART,
    container: this.getContentElement()
  });
};


/** @override */
anychart.chartEditorModule.steps.ChartType.prototype.update = function() {
  var model = this.getSharedModel();
  this.chartTypeSidebar_.update(model.presetsList, model);

  this.checkDataMapping_();
};


/** @override */
anychart.chartEditorModule.steps.ChartType.prototype.exitDocument = function() {
  anychart.chartEditorModule.steps.ChartType.base(this, 'exitDocument');
};


/** @override */
anychart.chartEditorModule.steps.ChartType.prototype.disposeInternal = function() {
  anychart.chartEditorModule.steps.ChartType.base(this, 'disposeInternal');
};
