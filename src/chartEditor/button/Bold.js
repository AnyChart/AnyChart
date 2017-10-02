goog.provide('anychart.chartEditorModule.button.Bold');

goog.require('anychart.chartEditorModule.button.Toggle');



/**
 * Bold button for text appearance.
 * @constructor
 * @extends {anychart.chartEditorModule.button.Toggle}
 */
anychart.chartEditorModule.button.Bold = function() {
  anychart.chartEditorModule.button.Bold.base(this, 'constructor');

  this.setIcon('ac ac-bold');
  this.setNormalValue('normal');
  this.setCheckedValue('bold');
};
goog.inherits(anychart.chartEditorModule.button.Bold, anychart.chartEditorModule.button.Toggle);
