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


/** @inheritDoc */
anychart.ui.LabelsFactory.prototype.createLabel = function() {
  return new anychart.ui.LabelsFactory.Label();
};



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.ui.LabelsFactory.Label = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.LabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


/**
 * Constructor function.
 * @return {!anychart.ui.LabelsFactory}
 */
anychart.ui.labelsFactory = function() {
  return new anychart.ui.LabelsFactory();
};


//exports
goog.exportSymbol('anychart.ui.labelsFactory', anychart.ui.labelsFactory);
anychart.ui.LabelsFactory.prototype['draw'] = anychart.ui.LabelsFactory.prototype.draw;
anychart.ui.LabelsFactory.prototype['parentBounds'] = anychart.ui.LabelsFactory.prototype.parentBounds;
anychart.ui.LabelsFactory.prototype['container'] = anychart.ui.LabelsFactory.prototype.container;
anychart.ui.LabelsFactory.prototype['add'] = anychart.ui.LabelsFactory.prototype.add;
anychart.ui.LabelsFactory.prototype['clear'] = anychart.ui.LabelsFactory.prototype.clear;
anychart.ui.LabelsFactory.prototype['measure'] = anychart.ui.LabelsFactory.prototype.measure;
anychart.ui.LabelsFactory.prototype['measureWithTransform'] = anychart.ui.LabelsFactory.prototype.measureWithTransform;
