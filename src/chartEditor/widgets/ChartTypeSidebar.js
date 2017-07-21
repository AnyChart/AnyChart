goog.provide('anychart.chartEditorModule.ChartTypeSideBar');

goog.require('anychart.chartEditorModule.group.ChartType');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.ChartTypeSideBar = function() {
  anychart.chartEditorModule.ChartTypeSideBar.base(this, 'constructor');

};
goog.inherits(anychart.chartEditorModule.ChartTypeSideBar, goog.ui.Component);


/** @type {string} */
anychart.chartEditorModule.ChartTypeSideBar.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartTypeSidebar');


/** @inheritDoc */
anychart.chartEditorModule.ChartTypeSideBar.prototype.disposeInternal = function() {
  anychart.chartEditorModule.ChartTypeSideBar.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.ChartTypeSideBar.prototype.createDom = function() {
  var element = goog.dom.createDom(goog.dom.TagName.DIV, anychart.chartEditorModule.ChartTypeSideBar.CSS_CLASS);
  this.setElementInternal(element);
};


/**
 * @param {Array.<anychart.chartEditorModule.steps.Base.Preset>} list
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 */
anychart.chartEditorModule.ChartTypeSideBar.prototype.update = function(list, model) {
  var itemsCount = list.length;
  var count = Math.max(this.getChildCount(), itemsCount);

  for (var i = 0; i < count; i++) {
    var child = /** @type {anychart.chartEditorModule.group.ChartType} */(this.getChildAt(i));

    if (i < itemsCount) {
      var item = list[i];
      if (!child) {
        child = new anychart.chartEditorModule.group.ChartType(model);
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
