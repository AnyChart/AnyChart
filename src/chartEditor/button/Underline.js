goog.provide('anychart.chartEditorModule.button.Underline');

goog.require('anychart.chartEditorModule.button.Toggle');



/**
 * Underline button for text appearance.
 * @constructor
 * @extends {anychart.chartEditorModule.button.Toggle}
 */
anychart.chartEditorModule.button.Underline = function() {
  anychart.chartEditorModule.button.Underline.base(this, 'constructor');

  this.setIcon('ac ac-underline');
  this.setNormalValue('normal');
  this.setCheckedValue('underline');
};
goog.inherits(anychart.chartEditorModule.button.Underline, anychart.chartEditorModule.button.Toggle);
