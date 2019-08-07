goog.provide('anychart.ganttModule.elements.TasksElement');

//region -- Requirements.
goog.require('anychart.ganttModule.elements.ProgressElement');
goog.require('anychart.ganttModule.elements.TimelineElement');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.TasksElement = function(timeline) {
  anychart.ganttModule.elements.TasksElement.base(this, 'constructor', timeline);

  this.addThemes('defaultTimeline.tasks');

  /**
   *
   * @type {anychart.ganttModule.elements.ProgressElement}
   * @private
   */
  this.progress_ = null;
};
goog.inherits(anychart.ganttModule.elements.TasksElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.TASKS;
};


/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(0);
};


/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.lighten(this.getPalette().itemAt(0));
};


/**
 * Visual element invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.TasksElement.prototype.progressInvalidated_ = function(e) {
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


/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType(), 'actual']);
};


//endregion
//region -- External API.
/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.ProgressElement|anychart.ganttModule.elements.TasksElement}
 */
anychart.ganttModule.elements.TasksElement.prototype.progress = function(opt_value) {
  if (!this.progress_) {
    this.progress_ = new anychart.ganttModule.elements.ProgressElement(this.getTimeline());
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
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.TasksElement.base(this, 'serialize');
  json['progress'] = this.progress().serialize();
  return json;
};


/** @inheritDoc */
anychart.ganttModule.elements.TasksElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.TasksElement.base(this, 'setupByJSON', config, opt_default);
  this.progress().setupInternal(!!opt_default, config['progress']);
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.TasksElement.prototype;
  proto['progress'] = proto.progress;
})();


//endregion
