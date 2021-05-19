goog.provide('anychart.calendarModule.settings.Years');
goog.require('anychart.calendarModule.settings.Base');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Margin');


/**
 * Class represents years settings.
 * Actually this is settings for plots.
 *
 * @extends {anychart.calendarModule.settings.Base}
 * @constructor
 */
anychart.calendarModule.settings.Years = function() {
  anychart.calendarModule.settings.Years.base(this, 'constructor');

  this.title_ = null;
  this.background_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['inverted', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['monthsPerRow', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['underSpace', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.calendarModule.settings.Years, anychart.calendarModule.settings.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.calendarModule.settings.Years.prototype.SUPPORTED_SIGNALS =
  anychart.calendarModule.settings.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.BOUNDS_CHANGED;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.calendarModule.settings.Years.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'inverted', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'monthsPerRow', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'underSpace', anychart.core.settings.numberNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.calendarModule.settings.Years, anychart.calendarModule.settings.Years.PROPERTY_DESCRIPTORS);


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value - Title settings
 * @return {anychart.calendarModule.settings.Years|anychart.core.ui.Title} Title or self for chaining.
 */
anychart.calendarModule.settings.Years.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.setupCreated('title', this.title_);
    this.title_.listenSignals(this.onTitleSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  }

  return this.title_;
};


/**
 * Title invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.calendarModule.settings.Years.prototype.onTitleSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value - Background settings.
 * @return {anychart.calendarModule.settings.Years|anychart.core.ui.Background}
 */
anychart.calendarModule.settings.Years.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.setupCreated('background', this.background_);
    this.background_.listenSignals(this.onBackgroundSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }

  return this.background_;
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.calendarModule.settings.Years.prototype.onBackgroundSignal_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.calendarModule.settings.Years.prototype.setupByJSON = function(config, opt_default) {
  anychart.calendarModule.settings.Years.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.calendarModule.settings.Years.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);

};


/** @inheritDoc */
anychart.calendarModule.settings.Years.prototype.serialize = function() {
  var json = anychart.calendarModule.settings.Years.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.calendarModule.settings.Years.PROPERTY_DESCRIPTORS, json);

  if (this.getCreated('title'))
    json['title'] = this.title().serialize();

  if (this.getCreated('background'))
    json['background'] = this.background().serialize();

  return json;
};


/** @inheritDoc */
anychart.calendarModule.settings.Years.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.title_,
    this.background_
  );

  this.title_ = null;
  this.background_ = null;

  anychart.calendarModule.settings.Years.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.calendarModule.settings.Years.prototype;
  proto['title'] = proto.title;
  proto['background'] = proto.background;

  // auto generated
  // proto['format'] = proto.format;
  // proto['inverted'] = proto.inverted;
  // proto['monthsPerRow'] = proto.monthsPerRow;
  // proto['underSpace'] = proto.underSpace;
})();
