goog.provide('anychart.ui.chartEditor.button.Italic');

goog.require('anychart.ui.chartEditor.button.Toggle');



/**
 * Italic button for text appearance.
 * @constructor
 * @extends {anychart.ui.chartEditor.button.Toggle}
 */
anychart.ui.chartEditor.button.Italic = function() {
  anychart.ui.chartEditor.button.Italic.base(this, 'constructor');

  this.setIcon('ac ac-italic');
  this.setNormalValue('normal');
  this.setCheckedValue('italic');
};
goog.inherits(anychart.ui.chartEditor.button.Italic, anychart.ui.chartEditor.button.Toggle);
