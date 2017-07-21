goog.provide('anychart.chartEditorModule.select.FontFamily');
goog.require('anychart.chartEditorModule.select.Base');



/**
 * @constructor
 * @extends {anychart.chartEditorModule.select.Base}
 */
anychart.chartEditorModule.select.FontFamily = function() {
  anychart.chartEditorModule.select.FontFamily.base(this, 'constructor');

  this.setOptions([
    'Arial, Helvetica, sans-serif',
    'Arial Black, Gadget, sans-serif',
    'Comic Sans MS, cursive, sans-serif',
    'Impact, Charcoal, sans-serif',
    'Lucida Sans Unicode, Lucida Grande, sans-serif',
    'Tahoma, Geneva, sans-serif',
    'Trebuchet MS, Helvetica, sans-serif',
    'Verdana, Helvetica, Arial, sans-serif',
    '"Lucida Console", Monaco, monospace',
    '"Source Sans Pro", sans-serif'
  ]);
  this.setCaptions([
    'Arial',
    'Arial Black',
    'Comic Sans MS',
    'Impact',
    'Lucida Sans Unicode',
    'Tahoma',
    'Trebuchet MS',
    'Verdana',
    'Lucida Console',
    'Source Sans Pro'
  ]);
};
goog.inherits(anychart.chartEditorModule.select.FontFamily, anychart.chartEditorModule.select.Base);
