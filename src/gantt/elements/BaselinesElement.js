goog.provide('anychart.ganttModule.elements.BaselinesElement');

//region -- Requirements.
goog.require('anychart.ganttModule.elements.BaselineProgressElement');
goog.require('anychart.ganttModule.elements.TimelineElement');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.BaselinesElement = function(timeline) {
  anychart.ganttModule.elements.BaselinesElement.base(this, 'constructor', timeline);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['above', 0, anychart.Signal.NEEDS_REDRAW],
    ['disableWithRelatedTask', 0, anychart.Signal.NEEDS_REDRAW] // DVF-4389.
  ]);
};
goog.inherits(anychart.ganttModule.elements.BaselinesElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'above',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'disableWithRelatedTask',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.BaselinesElement, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.BASELINES;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPaletteNormalFill = function() {
  return anychart.color.lighten(this.getPalette().itemAt(1), 0.7);
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.darken(anychart.color.lighten(this.getPalette().itemAt(1), 0.7));
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselinesElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType(), 'baseline']);
};


//endregion
//region -- Progress.
/**
 * Visual element invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.BaselinesElement.prototype.progressInvalidated_ = function(e) {
  var signal = 0;
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    signal |= anychart.Signal.NEEDS_REDRAW_LABELS;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    signal |= anychart.Signal.NEEDS_REDRAW_APPEARANCE;
  }
  this.dispatchSignal(signal);
};


/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.ProgressElement|anychart.ganttModule.elements.BaselinesElement}
 */
anychart.ganttModule.elements.BaselinesElement.prototype.progress = function(opt_value) {
  if (!this.progress_) {
    this.progress_ = new anychart.ganttModule.elements.BaselineProgressElement(this.getTimeline());
    this.setupCreated('progress', this.progress_);
    this.progress_.setupStateSettings();
    var par = /** @type {anychart.ganttModule.elements.TimelineElement} */ (this.getTimeline().elements());
    this.progress_.parent(par);
    this.progress_.edit().parent(this.edit());

    this.progress_.listenSignals(this.progressInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.progress_.setup(opt_value);
    return this;
  }
  return this.progress_;
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselinesElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.BaselinesElement.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS, config, opt_default);
  this.progress().setupInternal(!!opt_default, config['progress']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselinesElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.BaselinesElement.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.BaselinesElement.DESCRIPTORS, json, void 0, void 0, true);
  json['progress'] = this.progress().serialize();
  return json;
};


//endregion

//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.BaselinesElement.prototype;
  proto['progress'] = proto.progress;
})();


//endregion


