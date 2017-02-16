goog.provide('anychart.core.axes.LinearGauge');
goog.require('anychart.core.axes.Linear');



/**
 * Linear Gauge Axis Class.<br/>
 * Any axis must be bound to a scale.<br/>
 * To obtain a new instance of Axis use {@link anychart.axes.linear}.
 * @example <t>simple-h100</t>
 * anychart.axes.linear()
 *    .scale(anychart.scales.linear())
 *    .container(stage).draw();
 * @constructor
 * @extends {anychart.core.axes.Linear}
 */
anychart.core.axes.LinearGauge = function() {
  anychart.core.axes.LinearGauge.base(this, 'constructor');
};
goog.inherits(anychart.core.axes.LinearGauge, anychart.core.axes.Linear);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.core.axes.LinearGauge.prototype.calculateSize = function(parentSize, length, parentBounds) {
  return parentSize;
};
//endregion


//region --- OWN API ---
/**
 * Getter/setter for axis offset.
 * @param {string=} opt_value Percent offset.
 * @return {string|anychart.core.axes.LinearGauge} Offset or self for chaining.
 */
anychart.core.axes.LinearGauge.prototype.offset = function(opt_value) {
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
anychart.core.axes.LinearGauge.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value);
  }
  return anychart.core.axes.LinearGauge.base(this, 'width', opt_value);
};


/** @inheritDoc */
anychart.core.axes.LinearGauge.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Linear gauge axis scale', 'scatter', 'linear, log']);
      return this;
    }
  }
  return anychart.core.axes.LinearGauge.base(this, 'scale', opt_value);
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.axes.LinearGauge.prototype.serialize = function() {
  var json = anychart.core.axes.LinearGauge.base(this, 'serialize');
  json['offset'] = this.offset();
  return json;
};


/** @inheritDoc */
anychart.core.axes.LinearGauge.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.LinearGauge.base(this, 'setupByJSON', config, opt_default);
  this.offset(config['offset']);
};
//endregion

//exports
(function() {
  var proto = anychart.core.axes.LinearGauge.prototype;
  proto['offset'] = proto.offset;
})();
