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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['width', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offset', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.linearGaugeModule.Axis, anychart.core.Axis);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.calculateSize = function(parentSize, length, parentBounds) {
  return parentSize;
};


/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.getAllowedScaleTypes = function() {
  return anychart.scales.Base.ScaleTypes.SCATTER_OR_DATE_TIME;
};


//endregion
//region --- DESCRIPTORS ---
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.Axis.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offset', anychart.utils.normalizeToPercent]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.Axis, anychart.linearGaugeModule.Axis.OWN_DESCRIPTORS);


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.Axis.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.linearGaugeModule.Axis.OWN_DESCRIPTORS, json, 'Axis');
  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.Axis.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.Axis.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.Axis.OWN_DESCRIPTORS, config, opt_default);
};
//endregion

//exports
//(function() {
//  var proto = anychart.linearGaugeModule.Axis.prototype;
//  auto generated
//  proto['offset'] = proto.offset;
//})();
