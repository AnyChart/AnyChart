goog.provide('anychart.ui.chartEditor.button.Bold');

goog.require('anychart.ui.chartEditor.button.Toggle');



/**
 * Bold button for text appearance.
 * @constructor
 * @extends {anychart.ui.chartEditor.button.Toggle}
 */
anychart.ui.chartEditor.button.Bold = function() {
  anychart.ui.chartEditor.button.Bold.base(this, 'constructor');

  this.setIcon('ac ac-bold');
  this.setNormalValue('normal');
  this.setCheckedValue('bold');
};
goog.inherits(anychart.ui.chartEditor.button.Bold, anychart.ui.chartEditor.button.Toggle);
