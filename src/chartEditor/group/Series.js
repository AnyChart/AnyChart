goog.provide('anychart.chartEditorModule.group.Series');

goog.require('anychart.chartEditorModule.events');
goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.Series');
goog.require('anychart.ui.button.Secondary');
goog.require('goog.ui.Component');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.Series = function(model) {
  anychart.chartEditorModule.group.Series.base(this, 'constructor', model);

  this.setHeader('Series');
};
goog.inherits(anychart.chartEditorModule.group.Series, anychart.chartEditorModule.group.Base);


/** @enum {string} */
anychart.chartEditorModule.group.Series.CssClass = {};


/** @inheritDoc */
anychart.chartEditorModule.group.Series.prototype.disposeInternal = function() {
  this.seriesContainer_ = null;
  this.addSeriesBtn_ = null;

  anychart.chartEditorModule.group.Series.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.group.Series.prototype.createDom = function() {
  anychart.chartEditorModule.group.Series.base(this, 'createDom');
  var content = this.getContentElement();

  var seriesContainer = new goog.ui.Component();
  this.addChild(seriesContainer, true);

  var addSeriesBtn = new anychart.ui.button.Secondary('Add series');
  addSeriesBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  addSeriesBtn.addClassName(goog.getCssName('anychart-chart-editor-add-series-btn'));
  this.addChild(addSeriesBtn, true);

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-micro')));

  this.seriesContainer_ = seriesContainer;
  this.addSeriesBtn_ = addSeriesBtn;
};


/** @inheritDoc */
anychart.chartEditorModule.group.Series.prototype.enterDocument = function() {
  anychart.chartEditorModule.group.Series.base(this, 'enterDocument');
  goog.events.listen(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeriesAction_, false, this);
};


/** @inheritDoc */
anychart.chartEditorModule.group.Series.prototype.exitDocument = function() {
  goog.events.unlisten(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeriesAction_, false, this);
  anychart.chartEditorModule.group.Series.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.chartEditorModule.group.Series.prototype.update = function(model) {
  var seriesCount = this.model.chart['getSeriesCount']();
  var count = Math.max(this.seriesContainer_.getChildCount(), seriesCount);

  for (var i = 0; i < count; i++) {
    var child = this.seriesContainer_.getChildAt(i);
    if (i < seriesCount) {
      if (!child) {
        child = new anychart.chartEditorModule.settings.Series();
        this.seriesContainer_.addChildAt(child, i, true);
      }
      child.setSeriesId(this.model.chart['getSeriesAt'](i)['id']());
      child.setSeriesTypeOptions({'some': 'options'});
      child.update(this.model);
      goog.style.setElementShown(child.getElement(), true);
    } else {
      if (child) goog.style.setElementShown(child.getElement(), false);
    }
  }
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.chartEditorModule.group.Series.prototype.onAddSeriesAction_ = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.ADD_SERIES,
    seriesType: null,
    mapping: void 0,
    rebuild: true
  });
};
