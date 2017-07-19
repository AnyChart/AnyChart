goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.settings.IObjectWithSettings');



/**
 * Class representing state settings (normal, hover, selected)
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta Descriptors for state.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.StateSettings = function(descriptorsMeta) {
  anychart.core.StateSettings.base(this, 'constructor');

  /**
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = descriptorsMeta;
  var a = [
    'fill',
    'negativeFill',
    'risingFill',
    'fallingFill',
    'stroke',
    'lowStroke',
    'highStroke',
    'negativeStroke',
    'risingStroke',
    'fallingStroke',
    'medianStroke',
    'stemStroke',
    'whiskerStroke',
    'hatchFill',
    'negativeHatchFill',
    'risingHatchFill',
    'fallingHatchFill',
    'whiskerWidth',
    'type',
    'size',

    'hoverFill',
    'hoverNegativeFill',
    'hoverRisingFill',
    'hoverFallingFill',
    'hoverStroke',
    'hoverLowStroke',
    'hoverHighStroke',
    'hoverNegativeStroke',
    'hoverRisingStroke',
    'hoverFallingStroke',
    'hoverMedianStroke',
    'hoverStemStroke',
    'hoverWhiskerStroke',
    'hoverHatchFill',
    'hoverNegativeHatchFill',
    'hoverRisingHatchFill',
    'hoverFallingHatchFill',
    'hoverWhiskerWidth',
    'hoverType',
    'hoverSize',

    'selectFill',
    'selectNegativeFill',
    'selectRisingFill',
    'selectFallingFill',
    'selectStroke',
    'selectLowStroke',
    'selectHighStroke',
    'selectNegativeStroke',
    'selectRisingStroke',
    'selectFallingStroke',
    'selectMedianStroke',
    'selectStemStroke',
    'selectWhiskerStroke',
    'selectHatchFill',
    'selectNegativeHatchFill',
    'selectRisingHatchFill',
    'selectFallingHatchFill',
    'selectWhiskerWidth',
    'selectType',
    'selectSize'
  ];
};
goog.inherits(anychart.core.StateSettings, anychart.core.Base);


/**
 * .
 */
anychart.core.StateSettings.prototype.dummy = function() {};


//region --- Setup / Serialize / Dispose
/** @inheritDoc */
anychart.core.StateSettings.prototype.disposeInternal = function() {
  anychart.core.StateSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.StateSettings.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  /**
   * @type {!Object.<string, Array>}
   */
  var descriptors = anychart.core.settings.descriptors;

  anychart.core.settings.createDescriptor(map, descriptors.FILL);

  return map;
})();
anychart.core.settings.populate(anychart.core.StateSettings, anychart.core.StateSettings.PROPERTY_DESCRIPTORS);


//endregion
//region --- Complex objects
/**
 * Labels.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} event Signal event.
 * @private
 */
anychart.core.StateSettings.prototype.labelsInvalidated_ = function(event) {
  var meta = this.descriptorsMeta['labels'];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    if (meta.beforeInvalidationHook) {
      meta.beforeInvalidationHook.call(meta.context || this);
    }
    this.invalidate(meta.consistency, meta.signal);
  }
};


//endregion
//region --- Exports
//endregion
