goog.provide('anychart.ui.LabelsFactory');
goog.require('anychart.core.ui.LabelsFactory');



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.ui.LabelsFactory = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.LabelsFactory, anychart.core.ui.LabelsFactory);


/**
 * Constructor function.
 * @return {!anychart.ui.LabelsFactory}
 */
anychart.ui.labelsFactory = function() {
  return new anychart.ui.LabelsFactory();
};


//exports
goog.exportSymbol('anychart.ui.labelsFactory', anychart.ui.labelsFactory);
