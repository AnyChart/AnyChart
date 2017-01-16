goog.provide('anychart.ui.chartEditor.select.FontFamily');
goog.require('anychart.ui.chartEditor.select.Base');



/**
 * @constructor
 * @extends {anychart.ui.chartEditor.select.Base}
 */
anychart.ui.chartEditor.select.FontFamily = function() {
  anychart.ui.chartEditor.select.FontFamily.base(this, 'constructor');

  this.setOptions([
    'Arial, Helvetica, sans-serif',
    'Arial Black, Gadget, sans-serif',
    'Comic Sans MS, cursive, sans-serif',
    'Impact, Charcoal, sans-serif',
    'Lucida Sans Unicode, Lucida Grande, sans-serif',
    'Tahoma, Geneva, sans-serif',
    'Trebuchet MS, Helvetica, sans-serif',
    'Verdana, Helvetica, Arial, sans-serif'
  ]);
  this.setCaptions([
    'Arial',
    'Arial Black',
    'Comic Sans MS',
    'Impact',
    'Lucida Sans Unicode',
    'Tahoma',
    'Trebuchet MS',
    'Verdana'
  ]);
};
goog.inherits(anychart.ui.chartEditor.select.FontFamily, anychart.ui.chartEditor.select.Base);
