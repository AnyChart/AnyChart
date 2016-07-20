goog.provide('anychart.core.pert.Milestones');

goog.require('anychart.core.pert.PertVisualElements');



/**
 * Pert milestones settings collector.
 * @constructor
 * @extends {anychart.core.pert.PertVisualElements}
 */
anychart.core.pert.Milestones = function() {
  anychart.core.pert.Milestones.base(this, 'constructor');

  /**
   * Milestone shape.
   * @type {anychart.enums.MilestoneShape|string}
   * @private
   */
  this.shape_ = anychart.enums.MilestoneShape.CIRCLE;
};
goog.inherits(anychart.core.pert.Milestones, anychart.core.pert.PertVisualElements);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.pert.Milestones.prototype.SUPPORTED_SIGNALS =
    anychart.core.pert.PertVisualElements.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


/**
 * Sets milestones shape.
 * @param {(anychart.enums.MilestoneShape|string)=} opt_value - Value to be set.
 * @return {anychart.core.pert.Milestones|anychart.enums.MilestoneShape|string} - Current value or itself for method chaining.
 */
anychart.core.pert.Milestones.prototype.shape = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.shape_ != opt_value) {
      this.shape_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.shape_;
};


/** @inheritDoc */
anychart.core.pert.Milestones.prototype.serialize = function() {
  var json = anychart.core.pert.Milestones.base(this, 'serialize');
  json['shape'] = this.shape_;
  return json;
};


/** @inheritDoc */
anychart.core.pert.Milestones.prototype.setupByJSON = function(config) {
  anychart.core.pert.Milestones.base(this, 'setupByJSON', config);
  this.shape(config['shape']);
};


//exports
anychart.core.pert.Milestones.prototype['fill'] = anychart.core.pert.Milestones.prototype.fill;
anychart.core.pert.Milestones.prototype['hoverFill'] = anychart.core.pert.Milestones.prototype.hoverFill;
anychart.core.pert.Milestones.prototype['selectFill'] = anychart.core.pert.Milestones.prototype.selectFill;
anychart.core.pert.Milestones.prototype['stroke'] = anychart.core.pert.Milestones.prototype.stroke;
anychart.core.pert.Milestones.prototype['hoverStroke'] = anychart.core.pert.Milestones.prototype.hoverStroke;
anychart.core.pert.Milestones.prototype['selectStroke'] = anychart.core.pert.Milestones.prototype.selectStroke;
anychart.core.pert.Milestones.prototype['labels'] = anychart.core.pert.Milestones.prototype.labels;
anychart.core.pert.Milestones.prototype['selectLabels'] = anychart.core.pert.Milestones.prototype.selectLabels;
anychart.core.pert.Milestones.prototype['hoverLabels'] = anychart.core.pert.Milestones.prototype.hoverLabels;
anychart.core.pert.Milestones.prototype['tooltip'] = anychart.core.pert.Milestones.prototype.tooltip;
anychart.core.pert.Milestones.prototype['shape'] = anychart.core.pert.Milestones.prototype.shape;
