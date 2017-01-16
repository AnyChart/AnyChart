goog.provide('anychart.core.pert.CriticalPath');

goog.require('anychart.core.Base');
goog.require('anychart.core.pert.Milestones');
goog.require('anychart.core.pert.Tasks');



/**
 * Pert critical path settings collector.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.pert.CriticalPath = function() {
  anychart.core.pert.CriticalPath.base(this, 'constructor');

  /**
   * @type {anychart.core.pert.Milestones}
   * @private
   */
  this.milestones_ = null;

  /**
   * @type {anychart.core.pert.Tasks}
   * @private
   */
  this.tasks_ = null;
};
goog.inherits(anychart.core.pert.CriticalPath, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.pert.CriticalPath.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW_LABELS |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE |
    anychart.Signal.NEEDS_REDRAW;


/**
 * Gets/sets milestones settings object.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.core.pert.CriticalPath|anychart.core.pert.Milestones} - Current value or itself for method chaining.
 */
anychart.core.pert.CriticalPath.prototype.milestones = function(opt_value) {
  if (!this.milestones_) {
    this.milestones_ = new anychart.core.pert.Milestones();
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
 * @return {anychart.core.pert.CriticalPath|anychart.core.pert.Tasks} - Current value or itself for method chaining.
 */
anychart.core.pert.CriticalPath.prototype.tasks = function(opt_value) {
  if (!this.tasks_) {
    this.tasks_ = new anychart.core.pert.Tasks();
  }

  if (goog.isDef(opt_value)) {
    this.tasks_.setup(opt_value);
    return this;
  }
  return this.tasks_;
};


/** @inheritDoc */
anychart.core.pert.CriticalPath.prototype.serialize = function() {
  var json = anychart.core.pert.CriticalPath.base(this, 'serialize');
  json['tasks'] = this.tasks().serialize();
  json['milestones'] = this.milestones().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.pert.CriticalPath.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.pert.CriticalPath.base(this, 'setupByJSON', config, opt_default);
  if ('milestones' in config) this.milestones().setupByJSON(config['milestones']);
  if ('tasks' in config) this.tasks().setupByJSON(config['tasks']);
};


//exports
(function() {
  var proto = anychart.core.pert.CriticalPath.prototype;
  proto['tasks'] = proto.tasks;
  proto['milestones'] = proto.milestones;
})();
