goog.provide('anychart.pertModule.CriticalPath');

goog.require('anychart.core.Base');
goog.require('anychart.pertModule.Milestones');
goog.require('anychart.pertModule.Tasks');



/**
 * Pert critical path settings collector.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.pertModule.CriticalPath = function() {
  anychart.pertModule.CriticalPath.base(this, 'constructor');

  this.addThemes('criticalPath');

  /**
   * @type {anychart.pertModule.Milestones}
   * @private
   */
  this.milestones_ = null;

  /**
   * @type {anychart.pertModule.Tasks}
   * @private
   */
  this.tasks_ = null;
};
goog.inherits(anychart.pertModule.CriticalPath, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.pertModule.CriticalPath.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_REDRAW;


/**
 * Gets/sets milestones settings object.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.pertModule.CriticalPath|anychart.pertModule.Milestones} - Current value or itself for method chaining.
 */
anychart.pertModule.CriticalPath.prototype.milestones = function(opt_value) {
  if (!this.milestones_) {
    this.milestones_ = new anychart.pertModule.Milestones();
    this.setupCreated('milestones', this.milestones_);
  }

  if (goog.isDef(opt_value)) {
    this.milestones_.setup(opt_value);
    return this;
  }
  return this.milestones_;
};


/**
 * Gets/sets tasks settings object.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.pertModule.CriticalPath|anychart.pertModule.Tasks} - Current value or itself for method chaining.
 */
anychart.pertModule.CriticalPath.prototype.tasks = function(opt_value) {
  if (!this.tasks_) {
    this.tasks_ = new anychart.pertModule.Tasks();
    this.setupCreated('tasks', this.tasks_);
  }

  if (goog.isDef(opt_value)) {
    this.tasks_.setup(opt_value);
    return this;
  }
  return this.tasks_;
};


/** @inheritDoc */
anychart.pertModule.CriticalPath.prototype.serialize = function() {
  var json = anychart.pertModule.CriticalPath.base(this, 'serialize');
  json['tasks'] = this.tasks().serialize();
  json['milestones'] = this.milestones().serialize();
  return json;
};


/** @inheritDoc */
anychart.pertModule.CriticalPath.prototype.setupByJSON = function(config, opt_default) {
  anychart.pertModule.CriticalPath.base(this, 'setupByJSON', config, opt_default);
  if ('milestones' in config) this.milestones().setupByJSON(config['milestones'], opt_default);
  if ('tasks' in config) this.tasks().setupByJSON(config['tasks'], opt_default);
};


//exports
(function() {
  var proto = anychart.pertModule.CriticalPath.prototype;
  proto['tasks'] = proto.tasks;
  proto['milestones'] = proto.milestones;
})();
