goog.provide('anychart.core.pert.Milestones');

goog.require('anychart.core.pert.PertVisualElements');
goog.require('anychart.utils');



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
  this.shape_;

  /**
   * Milestone size.
   * @type {number|string}
   * @private
   */
  this.size_;
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
 * Sets milestones size.
 * @param {(number|string)=} opt_value - Value to be set.
 * @return {anychart.core.pert.Milestones|number|string} - Current value or itself for method chaining.
 */
anychart.core.pert.Milestones.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = /** @type {number|string} */ (anychart.utils.normalizeNumberOrPercent(opt_value, 80));
    if (this.size_ != val) {
      this.size_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.size_) ?
      this.size_ :
      (this.parent() ? /** @type {anychart.core.pert.Milestones} */ (this.parent()).size() : 80);
};


/**
 * Sets milestones shape.
 * @param {(anychart.enums.MilestoneShape|string)=} opt_value - Value to be set.
 * @return {anychart.core.pert.Milestones|anychart.enums.MilestoneShape|string} - Current value or itself for method chaining.
 */
anychart.core.pert.Milestones.prototype.shape = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeMilestoneShape(opt_value);
    if (this.shape_ != val) {
      this.shape_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.shape_) ?
      this.shape_ :
      (this.parent() ? /** @type {anychart.core.pert.Milestones} */ (this.parent()).shape() : anychart.enums.MilestoneShape.CIRCLE);
};


/** @inheritDoc */
anychart.core.pert.Milestones.prototype.serialize = function() {
  var json = anychart.core.pert.Milestones.base(this, 'serialize');
  if (goog.isDef(this.shape_))
    json['shape'] = this.shape_;
  if (goog.isDef(this.size_))
    json['size'] = this.size_;
  return json;
};


/** @inheritDoc */
anychart.core.pert.Milestones.prototype.setupByJSON = function(config) {
  anychart.core.pert.Milestones.base(this, 'setupByJSON', config);
  this.shape(config['shape']);
  this.size(config['size']);
};


//exports
anychart.core.pert.Milestones.prototype['color'] = anychart.core.pert.Milestones.prototype.color;

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
anychart.core.pert.Milestones.prototype['size'] = anychart.core.pert.Milestones.prototype.size;
