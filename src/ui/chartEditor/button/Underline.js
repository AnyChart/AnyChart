goog.provide('anychart.ui.chartEditor.button.Underline');

goog.require('anychart.ui.chartEditor.button.Toggle');



/**
 * Underline button for text appearance.
 * @constructor
 * @extends {anychart.ui.chartEditor.button.Toggle}
 */
anychart.ui.chartEditor.button.Underline = function() {
  anychart.ui.chartEditor.button.Underline.base(this, 'constructor');

  this.setIcon('ac ac-underline');
  this.setNormalValue('normal');
  this.setCheckedValue('underline');
};
goog.inherits(anychart.ui.chartEditor.button.Underline, anychart.ui.chartEditor.button.Toggle);
