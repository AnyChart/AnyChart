goog.provide('anychart.ui.chartEditor.steps.ChartType');

goog.require('anychart.ui.chartEditor.ChartTypeSideBar');
goog.require('anychart.ui.chartEditor.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.ui.chartEditor.steps.Base}
 */
anychart.ui.chartEditor.steps.ChartType = function(opt_domHelper) {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'constructor', opt_domHelper);

  this.setName('Chart Type');
  this.setTitle('Chart Type');
};
goog.inherits(anychart.ui.chartEditor.steps.ChartType, anychart.ui.chartEditor.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.ui.chartEditor.steps.ChartType.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartType-step');


/** @enum {string} */
anychart.ui.chartEditor.steps.ChartType.CssClass = {};


/**
 * @private
 */
anychart.ui.chartEditor.steps.ChartType.prototype.checkDataMapping_ = function() {
  var model = this.getSharedModel();

  goog.dom.classlist.enable(this.existDataMappingWarningEl_, goog.getCssName('anychart-hidden'), Boolean(model.dataMappings.length));
  this.enableNextStep(Boolean(model.dataMappings.length));

  goog.dom.classlist.enable(this.fieldsDataMappingWarningEl_, goog.getCssName('anychart-hidden'), Boolean(this.getChartType()));
  this.enableNextStep(Boolean(this.getChartType()));
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.createDom = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();
  var model = this.getSharedModel();

  var className = anychart.ui.chartEditor.steps.ChartType.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();

  var chartTypeSidebar = new anychart.ui.chartEditor.ChartTypeSideBar();
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

  this.checkDataMapping_();
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.enterDocument = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'enterDocument');

  this.update();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.BUILD_CHART,
    container: this.getContentElement()
  });
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.update = function() {
  var model = this.getSharedModel();
  this.chartTypeSidebar_.update(model.presetsList, model);

  this.checkDataMapping_();
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.exitDocument = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'exitDocument');
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'disposeInternal');
};
