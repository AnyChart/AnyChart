goog.provide('anychart.linearGaugeModule.Axis');
goog.require('anychart.core.Axis');



/**
 * Linear Gauge Axis Class.<br/>
 * Any axis must be bound to a scale.<br/>
 * To obtain a new instance of Axis use {@link anychart.standalones.axes.linear}.
 * @example <t>simple-h100</t>
 * anychart.standalones.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @constructor
 * @extends {anychart.core.Axis}
 */
anychart.linearGaugeModule.Axis = function() {
  anychart.linearGaugeModule.Axis.base(this, 'constructor');
};
goog.inherits(anychart.linearGaugeModule.Axis, anychart.core.Axis);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.calculateSize = function(parentSize, length, parentBounds) {
  return parentSize;
};


//endregion
//region --- OWN API ---
/**
 * Getter/setter for axis offset.
 * @param {string=} opt_value Percent offset.
 * @return {string|anychart.linearGaugeModule.Axis} Offset or self for chaining.
 */
anychart.linearGaugeModule.Axis.prototype.offset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.offset_ != opt_value) {
      this.offset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.offset_;
};


/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value);
  }
  return anychart.linearGaugeModule.Axis.base(this, 'width', opt_value);
};


/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(anychart.utils.instanceOf(opt_value, anychart.scales.ScatterBase))) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Linear gauge axis scale', 'scatter', 'linear, log, date-time']);
      return this;
    }
  }
  return anychart.linearGaugeModule.Axis.base(this, 'scale', opt_value);
};


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.Axis.base(this, 'serialize');
  json['offset'] = this.offset();
  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.Axis.base(this, 'setupByJSON', config, opt_default);
  this.offset(config['offset']);
};
//endregion

//exports
(function() {
  var proto = anychart.linearGaugeModule.Axis.prototype;
  proto['offset'] = proto.offset;
})();
