goog.provide('anychart.standalones.LabelsFactory');
goog.provide('anychart.ui.LabelsFactory');
goog.require('anychart.core.ui.LabelsFactory');



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory}
 */
anychart.standalones.LabelsFactory = function() {
  anychart.standalones.LabelsFactory.base(this, 'constructor');
};
goog.inherits(anychart.standalones.LabelsFactory, anychart.core.ui.LabelsFactory);
anychart.core.makeStandalone(anychart.standalones.LabelsFactory, anychart.core.ui.LabelsFactory);


/** @inheritDoc */
anychart.standalones.LabelsFactory.prototype.createLabel = function() {
  return new anychart.standalones.LabelsFactory.Label();
};



/**
 * @constructor
 * @extends {anychart.core.ui.LabelsFactory.Label}
 */
anychart.standalones.LabelsFactory.Label = function() {
  anychart.standalones.LabelsFactory.Label.base(this, 'constructor');
};
goog.inherits(anychart.standalones.LabelsFactory.Label, anychart.core.ui.LabelsFactory.Label);


/**
 * Constructor function.
 * @return {!anychart.standalones.LabelsFactory}
 */
anychart.standalones.labelsFactory = function() {
  var factory = new anychart.standalones.LabelsFactory();
  factory.setup(anychart.getFullTheme('standalones.labelsFactory'));
  return factory;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.LabelsFactory}
 * @deprecated Since 7.12.0. Use anychart.standalones.labelsFactory instead.
 */
anychart.ui.labelsFactory = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.labelsFactory()', 'anychart.standalones.labelsFactory()', null, 'Constructor'], true);
  return anychart.standalones.labelsFactory();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.LabelsFactory.prototype;
  goog.exportSymbol('anychart.ui.labelsFactory', anychart.ui.labelsFactory);
  goog.exportSymbol('anychart.standalones.labelsFactory', anychart.standalones.labelsFactory);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['add'] = proto.add;
  proto['clear'] = proto.clear;
  proto['measure'] = proto.measure;
  proto['measureWithTransform'] = proto.measureWithTransform;
})();
