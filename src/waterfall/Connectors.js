goog.provide('anychart.waterfallModule.Connectors');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.LabelsFactory');



/**
 * Waterfall connectors settings.
 *
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.waterfallModule.Connectors = function() {
  anychart.waterfallModule.Connectors.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(
      this.descriptorsMeta,
      [
        ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
      ]
  );
};
goog.inherits(anychart.waterfallModule.Connectors, anychart.core.Base);


/**
 * Connectors properties.
 *
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.Connectors.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.Connectors, anychart.waterfallModule.Connectors.OWN_DESCRIPTORS);


/**
 * Supported signals.
 *
 * @type {number}
 */
anychart.waterfallModule.Connectors.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_REDRAW_LABELS;


/**
 * Connectors labels.
 *
 * @param {Object=} opt_value - Labels settings.
 *
 * @return {anychart.core.ui.LabelsFactory|anychart.waterfallModule.Connectors}
 */
anychart.waterfallModule.Connectors.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('labels', this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
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
 * Labels invalidation listener.
 *
 * @private
 */
anychart.waterfallModule.Connectors.prototype.labelsInvalidated_ = function() {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/** @inheritDoc */
anychart.waterfallModule.Connectors.prototype.serialize = function() {
  var json = anychart.waterfallModule.Connectors.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.waterfallModule.Connectors.OWN_DESCRIPTORS, json);
  json['labels'] = this.labels().serialize();

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.Connectors.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.Connectors.base(this, 'setupByJSON', config, opt_default);

  this.labels().setupInternal(!!opt_default, config['labels']);

  anychart.core.settings.deserialize(this, anychart.waterfallModule.Connectors.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.waterfallModule.Connectors.prototype.disposeInternal = function() {
  goog.dispose(this.labels_);
  anychart.waterfallModule.Connectors.base(this, 'disposeInternal');
};


(function() {
  var proto = anychart.waterfallModule.Connectors.prototype;
  //generated automatically
  //proto['stroke'] = proto.stroke;

  proto['labels'] = proto.labels;
})();
