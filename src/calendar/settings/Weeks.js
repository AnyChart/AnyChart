goog.provide('anychart.calendarModule.settings.Weeks');
goog.require('anychart.calendarModule.settings.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsSettings');


/**
 * Class represents weeks settings.
 *
 * @extends {anychart.calendarModule.settings.Base}
 * @constructor
 */
anychart.calendarModule.settings.Weeks = function() {
  anychart.calendarModule.settings.Weeks.base(this, 'constructor');

  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['rightSpace', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['showWeekends', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.calendarModule.settings.Weeks, anychart.calendarModule.settings.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.calendarModule.settings.Weeks.prototype.SUPPORTED_SIGNALS =
  anychart.calendarModule.settings.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.BOUNDS_CHANGED;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.calendarModule.settings.Weeks.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rightSpace', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'showWeekends', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.calendarModule.settings.Weeks, anychart.calendarModule.settings.Weeks.PROPERTY_DESCRIPTORS);


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} event - Event.
 * @private
 */
anychart.calendarModule.settings.Weeks.prototype.onLabelsSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels getter/setter.
 * @param {Object=} opt_value - Config.
 * @return {anychart.calendarModule.settings.Weeks|anychart.core.ui.LabelsSettings}
 */
anychart.calendarModule.settings.Weeks.prototype.labels = function(opt_value) {
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
anychart.calendarModule.settings.Weeks.prototype.setupByJSON = function(config, opt_default) {
  anychart.calendarModule.settings.Weeks.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.calendarModule.settings.Weeks.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('labels' in config)
    this.labels().setupInternal(!!opt_default, config['labels']);
};


/** @inheritDoc */
anychart.calendarModule.settings.Weeks.prototype.serialize = function() {
  var json = anychart.calendarModule.settings.Weeks.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.calendarModule.settings.Weeks.PROPERTY_DESCRIPTORS, json);

  if (this.getCreated('labels'))
    json['labels'] = this.labels().serialize();

  return json;
};


/** @inheritDoc */
anychart.calendarModule.settings.Weeks.prototype.disposeInternal = function() {
  goog.dispose(this.labels_);
  this.labels_ = null;

  anychart.calendarModule.settings.Weeks.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.calendarModule.settings.Weeks.prototype;
  // common
  proto['labels'] = proto.labels;

  // auto generated
  // proto['rightSpace'] = proto.rightSpace;
  // proto['showWeekends'] = proto.showWeekends;
})();