goog.provide('anychart.ui.chartEditor.ChartTypeSideBar');

goog.require('anychart.ui.chartEditor.group.ChartType');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.ChartTypeSideBar = function() {
  anychart.ui.chartEditor.ChartTypeSideBar.base(this, 'constructor');

};
goog.inherits(anychart.ui.chartEditor.ChartTypeSideBar, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.ChartTypeSideBar.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartTypeSidebar');


/** @inheritDoc */
anychart.ui.chartEditor.ChartTypeSideBar.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.ChartTypeSideBar.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ui.chartEditor.ChartTypeSideBar.prototype.createDom = function() {
  var element = goog.dom.createDom(goog.dom.TagName.DIV, anychart.ui.chartEditor.ChartTypeSideBar.CSS_CLASS);
  this.setElementInternal(element);
};


/**
 * @param {Array.<anychart.ui.chartEditor.steps.Base.Preset>} list
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 */
anychart.ui.chartEditor.ChartTypeSideBar.prototype.update = function(list, model) {
  var itemsCount = list.length;
  var count = Math.max(this.getChildCount(), itemsCount);

  for (var i = 0; i < count; i++) {
    var child = /** @type {anychart.ui.chartEditor.group.ChartType} */(this.getChildAt(i));

    if (i < itemsCount) {
      var item = list[i];
      if (!child) {
        child = new anychart.ui.chartEditor.group.ChartType(model);
        child.setExpanded(item.category == model.presetCategory); // set in only then create new instance
        this.addChildAt(child, i, true);
      }
      child.update(item);
      goog.style.setElementShown(child.getElement(), true);
    } else {
      if (child) goog.style.setElementShown(child.getElement(), false);
    }
  }
};
