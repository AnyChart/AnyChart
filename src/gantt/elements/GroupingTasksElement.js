goog.provide('anychart.ganttModule.elements.GroupingTasksElement');

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
anychart.ganttModule.elements.GroupingTasksElement = function(timeline) {
  anychart.ganttModule.elements.GroupingTasksElement.base(this, 'constructor', timeline);

  this.addThemes('defaultTimeline.groupingTasks');

  /**
   *
   * @type {anychart.ganttModule.elements.ProgressElement}
   * @private
   */
  this.progress_ = null;
};
goog.inherits(anychart.ganttModule.elements.GroupingTasksElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.GROUPING_TASKS;
};


/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(4);
};


/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.lighten(this.getPalette().itemAt(4));
};


/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.getPointSettingsResolutionOrder = function() {
  // Remove fallback to regular tasks as per DVF-4404.
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType()]);
};


//endregion
//region -- External API.
/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.ProgressElement|anychart.ganttModule.elements.GroupingTasksElement}
 */
anychart.ganttModule.elements.GroupingTasksElement.prototype.progress = function(opt_value) {
  if (!this.progress_) {
    this.progress_ = new anychart.ganttModule.elements.ProgressElement(this.getTimeline());
    this.setupCreated('progress', this.progress_);
    this.progress_.listenSignals(this.progressInvalidated_, this);

    var parent = /** @type {anychart.ganttModule.elements.TimelineElement} */(this.getTimeline().elements());
    this.progress_.parent(parent);
    this.progress_.edit().parent(this.edit());
    //TODO (A.Kudryavtsev): Do we need add this.progress_.edit() parent?
  }

  if (goog.isDef(opt_value)) {
    this.progress_.setup(opt_value);
    return this;
  }
  return this.progress_;
};


/**
 * Visual element invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.GroupingTasksElement.prototype.progressInvalidated_ = function(e) {
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


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.GroupingTasksElement.base(this, 'serialize');
  json['progress'] = this.progress().serialize();
  return json;
};


/** @inheritDoc */
anychart.ganttModule.elements.GroupingTasksElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.GroupingTasksElement.base(this, 'setupByJSON', config, opt_default);
  this.progress().setupInternal(!!opt_default, config['progress']);
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.GroupingTasksElement.prototype;
  proto['progress'] = proto.progress;
})();


//endregion

