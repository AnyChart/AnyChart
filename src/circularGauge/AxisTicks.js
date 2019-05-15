goog.provide('anychart.circularGaugeModule.AxisTicks');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Axis ticks class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.circularGaugeModule.AxisTicks = function() {
  anychart.circularGaugeModule.AxisTicks.base(this, 'constructor');

  /**
   * In this class ticks are markers. Its control by MarkersFactory.
   * @type {!anychart.core.ui.MarkersFactory}
   * @private
   */
  this.ticks_ = new anychart.core.ui.MarkersFactory();
  this.ticks_.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
  this.ticks_.setOption('size', 10);
  this.ticks_.setOption('anchor', anychart.enums.Anchor.CENTER);
  this.ticks_.setOption('offsetX', 0);
  this.ticks_.setOption('offsetY', 0);
  this.ticks_.setOption('rotation', 0);
  this.ticks_.setParentEventTarget(this);

  /**
   * @type {Object}
   * @private
   */
  this.contextProvider_ = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['length', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['type', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['fill', 0, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.AxisTicks, anychart.core.VisualBase);


/**
 * Property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.AxisTicks.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function positionNormalizer(value) {
    return anychart.enums.normalizeGaugeSidePosition(value);
  }

  function lengthNormalizer(value) {
    return goog.isNull(value) ? value : anychart.utils.normalizeToPercent(value);
  }

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'length', lengthNormalizer],
    d.TYPE,
    d.STROKE_FUNCTION,
    d.FILL_FUNCTION,
    d.HATCH_FILL,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', positionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.AxisTicks, anychart.circularGaugeModule.AxisTicks.OWN_DESCRIPTORS);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.AxisTicks.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.AxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {number}
 */
anychart.circularGaugeModule.AxisTicks.prototype.getPixLength = function() {
  return this.pixLength_;
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} Normalized color.
 * @protected
 */
anychart.circularGaugeModule.AxisTicks.prototype.normalizeColor = function(color) {
  var context = goog.object.clone(this.contextProvider_);
  return goog.isFunction(color) ?
      color.call(context, context) :
      color;
};


/**
 * @return {number}
 */
anychart.circularGaugeModule.AxisTicks.prototype.getRadius = function() {
  return this.radius_;
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisTicks.prototype.remove = function() {
  if (this.ticks_) this.ticks_.remove();
  if (this.hatchFillElement_) this.hatchFillElement_.remove();
};


/**
 * Start drawing.
 */
anychart.circularGaugeModule.AxisTicks.prototype.startDrawing = function() {
  var length = /** @type {number|string} */(this.getOption('length'));
  this.pixLength_ = goog.isDefAndNotNull(length) ?
      anychart.utils.normalizeSize(length, this.axis_.getPixRadius()) :
      this.axis_.getPixWidth();
  this.radius_ = this.axis_.getPixRadius();
  var position = this.getOption('position');
  if (position == anychart.enums.GaugeSidePosition.OUTSIDE)
    this.radius_ += this.axis_.getPixWidth() / 2 + this.pixLength_ / 2;
  else if (position == anychart.enums.GaugeSidePosition.INSIDE)
    this.radius_ -= this.axis_.getPixWidth() / 2 + this.pixLength_ / 2;

  this.contextProvider_['length'] = this.pixLength_;
  this.contextProvider_['radius'] = this.radius_;
  this.contextProvider_['cx'] = this.axis_.gauge().getCx();
  this.contextProvider_['cy'] = this.axis_.gauge().getCy();

  this.ticks_.clear();
  var stroke = /** @type {Function|acgraph.vector.Stroke} */(this.getOption('stroke'));
  var fill = /** @type {Function|acgraph.vector.Fill} */(this.getOption('fill'));
  if (!goog.isFunction(stroke))
    this.ticks_.setOption('stroke', stroke);
  if (!goog.isFunction(fill))
    this.ticks_.fill(fill);
  this.ticks_.setOption('size', this.pixLength_ / 2);
  var type = /** @type {anychart.enums.MarkerType} */(this.getOption('type'));
  this.ticks_.type(type);

  var hatchFill = this.getOption('hatchFill');

  if (!this.hatchFillElement_ && hatchFill && !anychart.utils.isNone(hatchFill)) {
    this.hatchFillElement_ = new anychart.core.ui.MarkersFactory();
    this.hatchFillElement_.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
    this.hatchFillElement_.setOption('size', 10);
    this.hatchFillElement_.setOption('anchor', anychart.enums.Anchor.CENTER);
    this.hatchFillElement_.setOption('offsetX', 0);
    this.hatchFillElement_.setOption('offsetY', 0);
    this.hatchFillElement_.setOption('rotation', 0);
    this.hatchFillElement_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.hatchFillElement_.zIndex(anychart.circularGaugeModule.Axis.ZINDEX_TICK_HATCH_FILL);
  }

  if (this.hatchFillElement_) {
    this.hatchFillElement_.clear();
    this.hatchFillElement_.disablePointerEvents(true);
    this.hatchFillElement_.setOption('size', this.pixLength_ / 2);
    this.hatchFillElement_.setOption('type', type);
    this.hatchFillElement_.setOption('fill', fill);
    this.hatchFillElement_.setOption('stroke', null);
  }
};


/**
 * @param {number} angle
 * @param {number} tickValue
 */
anychart.circularGaugeModule.AxisTicks.prototype.drawTick = function(angle, tickValue) {
  var angleRad = goog.math.toRadians(angle);

  var cx = this.axis_.gauge().getCx();
  var cy = this.axis_.gauge().getCy();

  var x = cx + this.radius_ * Math.cos(angleRad);
  var y = cy + this.radius_ * Math.sin(angleRad);

  var tick = this.ticks_.add({'value': {'x': x, 'y': y}});
  var rotation;

  if (goog.isDef(tick.getOption('rotation'))) {
    rotation = tick.getOption('rotation');
  } else if (goog.isDef(this.ticks_.getOption('rotation'))) {
    rotation = this.ticks_.getOption('rotation');
  } else {
    rotation = 0;
  }

  this.contextProvider_['rotation'] = rotation + angle + 90;
  this.contextProvider_['x'] = x;
  this.contextProvider_['y'] = y;
  this.contextProvider_['angle'] = goog.math.standardAngle(angle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);
  this.contextProvider_['value'] = tickValue;

  tick.setOption('rotation', rotation + angle + 90);
  var fill = /** @type {acgraph.vector.Fill|Function} */(this.getOption('fill'));
  var stroke = /** @type {acgraph.vector.Stroke|Function} */(this.getOption('stroke'));
  if (goog.isFunction(fill))
    tick.setOption('fill', /** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeFill(
        /** @type {acgraph.vector.Fill} */(this.normalizeColor(fill)))));
  if (goog.isFunction(stroke))
    tick.setOption('stroke', /** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(
        /** @type {acgraph.vector.Stroke} */(this.normalizeColor(stroke)))));

  if (this.hatchFillElement_) {
    var hatchFill = this.hatchFillElement_.add({'value': {'x': x, 'y': y}});
    hatchFill.rotation(rotation + angle + 90);
  }
};


/**
 * Renders ticks.
 * @return {!anychart.circularGaugeModule.AxisTicks} {@link anychart.circularGaugeModule.AxisTicks} instance for method chaining.
 */
anychart.circularGaugeModule.AxisTicks.prototype.finalizeDrawing = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());

    var multiplier = anychart.circularGaugeModule.Chart.ZINDEX_MULTIPLIER * 0.1;
    this.ticks_.zIndex(zIndex + anychart.circularGaugeModule.Axis.ZINDEX_TICK * multiplier);
    if (this.hatchFillElement_)
      this.hatchFillElement_.zIndex(zIndex + anychart.circularGaugeModule.Axis.ZINDEX_TICK_HATCH_FILL * multiplier);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.ticks_.container(/** @type {acgraph.vector.ILayer} */ (this.container()));
    if (this.hatchFillElement_)
      this.hatchFillElement_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.ticks_.draw();

  if (this.hatchFillElement_)
    this.hatchFillElement_.draw();

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  return this;
};


/**
 * Link to axis.
 * @param {anychart.circularGaugeModule.Axis} axis Axis to set.
 */
anychart.circularGaugeModule.AxisTicks.prototype.setAxis = function(axis) {
  this.axis_ = axis;
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisTicks.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.AxisTicks.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.circularGaugeModule.AxisTicks.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.AxisTicks.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.AxisTicks.OWN_DESCRIPTORS, config, opt_default);
};


//exports
// (function() {
//   var proto = anychart.circularGaugeModule.AxisTicks.prototype;
//   proto['length'] = proto.length;
//   proto['type'] = proto.type;
//   proto['stroke'] = proto.stroke;
//   proto['fill'] = proto.fill;
//   proto['hatchFill'] = proto.hatchFill;
//   proto['position'] = proto.position;
// })();
