goog.provide('anychart.chartEditorModule.group.ChartType');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.settings.ChartType');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.ChartType = function(model) {
  anychart.chartEditorModule.group.ChartType.base(this, 'constructor', model);

  this.setHeader('Chart Type');
};
goog.inherits(anychart.chartEditorModule.group.ChartType, anychart.chartEditorModule.group.Base);


/** @enum {string} */
anychart.chartEditorModule.group.ChartType.CssClass = {};


/** @override */
anychart.chartEditorModule.group.ChartType.prototype.disposeInternal = function() {


  anychart.chartEditorModule.group.ChartType.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.group.ChartType.prototype.createDom = function() {
  anychart.chartEditorModule.group.ChartType.base(this, 'createDom');


};


/** @override */
anychart.chartEditorModule.group.ChartType.prototype.update = function(item) {
  this.setHeader(item.caption);

  var itemsCount = item.list.length;
  var count = Math.max(this.getChildCount(), itemsCount);

  for (var i = 0; i < count; i++) {
    var child = /** @type {anychart.chartEditorModule.settings.ChartType} */(this.getChildAt(i));

    if (i < itemsCount) {

      if (!child) {
        child = new anychart.chartEditorModule.settings.ChartType();
        this.addChildAt(child, i, true);
      }

      var listItem = /** @type {{type: string, caption: string, image: string, seriesType: string}} */(item.list[i]);
      child.update(item.category, listItem, listItem.type == this.model.presetType);
      child.setEnabled(anychart.chartEditorModule.group.ChartType.isReferenceValuesPresent(listItem.referenceNames, this.model));
      goog.style.setElementShown(child.getElement(), true);
    } else {
      if (child) goog.style.setElementShown(child.getElement(), false);
    }
  }
};


/**
 * @param {Array<string>} values
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @return {boolean}
 */
anychart.chartEditorModule.group.ChartType.isReferenceValuesPresent = function(values, model) {
  if (!model.dataMappings.length) return false;
  var result = true;

  for (var i = 0, count = values.length; i < count; i++) {
    var name = /** @type {number|string} */(values[i]);
    for (var j = 0, m = model.dataMappings.length; j < m; j++) {
      var mapping = model.dataMappings[j];
      var presentInArrayMapping = mapping['getArrayMapping']() != anychart.window['anychart']['data']['Mapping']['DEFAULT_ARRAY_MAPPING'] &&
          mapping['getArrayMapping']()[name];
      var presentInObjectMapping = mapping['getObjectMapping']() != anychart.window['anychart']['data']['Mapping']['DEFAULT_OBJECT_MAPPING'] &&
          mapping['getObjectMapping']()[name];

      result = result && (presentInArrayMapping || presentInObjectMapping);
    }
  }

  return result;
};
