goog.provide('anychart.calendarModule.settings.Months');
goog.require('anychart.calendarModule.settings.Base');
goog.require('anychart.core.ui.LabelsSettings');


/**
 * Class represents months settings.
 *
 * @extends {anychart.calendarModule.settings.Base}
 * @constructor
 */
anychart.calendarModule.settings.Months = function() {
  anychart.calendarModule.settings.Months.base(this, 'constructor');

  /**
   * Months labels settings
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['underSpace', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['noDataStroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.calendarModule.settings.Months, anychart.calendarModule.settings.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.calendarModule.settings.Months.prototype.SUPPORTED_SIGNALS =
  anychart.calendarModule.settings.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.BOUNDS_CHANGED;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.calendarModule.settings.Months.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'underSpace', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'noDataStroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.calendarModule.settings.Months, anychart.calendarModule.settings.Months.PROPERTY_DESCRIPTORS);


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.settings.Months.prototype.onLabelsSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels getter/setter.
 * @param {Object=} opt_value - Config.
 * @return {anychart.calendarModule.settings.Months|anychart.core.ui.LabelsSettings}
 */
anychart.calendarModule.settings.Months.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labels_);
    this.labels_.listenSignals(this.onLabelsSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }

  return this.labels_;
};


/** @inheritDoc */
anychart.calendarModule.settings.Months.prototype.setupByJSON = function(config, opt_default) {
  anychart.calendarModule.settings.Months.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.calendarModule.settings.Months.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('labels' in config)
    this.labels().setupInternal(!!opt_default, config['labels']);
};


/** @inheritDoc */
anychart.calendarModule.settings.Months.prototype.serialize = function() {
  var json = anychart.calendarModule.settings.Months.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.calendarModule.settings.Months.PROPERTY_DESCRIPTORS, json);

  if (this.getCreated('labels'))
    json['labels'] = this.labels().serialize();

  return json;
};


/** @inheritDoc */
anychart.calendarModule.settings.Months.prototype.disposeInternal = function() {
  goog.dispose(this.labels_);
  this.labels_ = null;

  anychart.calendarModule.settings.Months.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.calendarModule.settings.Months.prototype;
  proto['labels'] = proto.labels;
  // auto generated
  // proto['underSpace'] = proto.underSpace;
  // proto['stroke'] = proto.stroke;
  // proto['noDataStroke'] = proto.noDataStroke;
})();