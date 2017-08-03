goog.provide('anychart.chartEditorModule.button.Italic');

goog.require('anychart.chartEditorModule.button.Toggle');



/**
 * Italic button for text appearance.
 * @constructor
 * @extends {anychart.chartEditorModule.button.Toggle}
 */
anychart.chartEditorModule.button.Italic = function() {
  anychart.chartEditorModule.button.Italic.base(this, 'constructor');

  this.setIcon('ac ac-italic');
  this.setNormalValue('normal');
  this.setCheckedValue('italic');
};
goog.inherits(anychart.chartEditorModule.button.Italic, anychart.chartEditorModule.button.Toggle);
