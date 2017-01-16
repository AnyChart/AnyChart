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
anychart.core.pert.Milestones.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.pert.Milestones.base(this, 'setupByJSON', config, opt_default);
  this.shape(config['shape']);
  this.size(config['size']);
};


//exports
(function() {
  var proto = anychart.core.pert.Milestones.prototype;
  proto['color'] = proto.color;

  proto['fill'] = proto.fill;
  proto['hoverFill'] = proto.hoverFill;
  proto['selectFill'] = proto.selectFill;

  proto['stroke'] = proto.stroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['selectStroke'] = proto.selectStroke;

  proto['labels'] = proto.labels;
  proto['selectLabels'] = proto.selectLabels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['tooltip'] = proto.tooltip;
  proto['shape'] = proto.shape;
  proto['size'] = proto.size;
})();
