goog.provide('anychart.ui.chartEditor.group.Series');

goog.require('anychart.ui.button.Secondary');
goog.require('anychart.ui.chartEditor.events');
goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.settings.Series');

goog.require('goog.ui.Component');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.Series = function(model) {
  anychart.ui.chartEditor.group.Series.base(this, 'constructor', model);

  this.setHeader('Series');
};
goog.inherits(anychart.ui.chartEditor.group.Series, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.Series.CssClass = {};


/** @inheritDoc */
anychart.ui.chartEditor.group.Series.prototype.disposeInternal = function() {
  this.seriesContainer_ = null;
  this.addSeriesBtn_ = null;

  anychart.ui.chartEditor.group.Series.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Series.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Series.base(this, 'createDom');
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
anychart.ui.chartEditor.group.Series.prototype.enterDocument = function() {
  anychart.ui.chartEditor.group.Series.base(this, 'enterDocument');
  goog.events.listen(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeriesAction_, false, this);
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Series.prototype.exitDocument = function() {
  goog.events.unlisten(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeriesAction_, false, this);
  anychart.ui.chartEditor.group.Series.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Series.prototype.update = function() {
  var seriesCount = this.model.chart['getSeriesCount']();
  var count = Math.max(this.seriesContainer_.getChildCount(), seriesCount);

  for (var i = 0; i < count; i++) {
    var child = this.seriesContainer_.getChildAt(i);
    if (i < seriesCount) {
      if (!child) {
        child = new anychart.ui.chartEditor.settings.Series();
        this.seriesContainer_.addChildAt(child, i, true);
      }
      child.setSeriesId(this.model.chart['getSeriesAt'](i)['id']());
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
anychart.ui.chartEditor.group.Series.prototype.onAddSeriesAction_ = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.ADD_SERIES,
    seriesType: null,
    mapping: undefined,
    rebuild: true
  });
};
