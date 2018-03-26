goog.provide('anychart.circularGaugeModule.pointers.Bar');
goog.require('acgraph');
goog.require('anychart.circularGaugeModule.pointers.Base');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.circularGaugeModule.pointers.Base}
 */
anychart.circularGaugeModule.pointers.Bar = function() {
  anychart.circularGaugeModule.pointers.Bar.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.pointers.Bar, anychart.circularGaugeModule.pointers.Base);


//region --- Infrastructure
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Bar.prototype.getType = function() {
  return anychart.enums.CircularGaugePointerType.BAR;
};


//endregion
//region --- Descriptors
/**
 * Properties that should be defined in anychart.circularGaugeModule.pointers.Bar prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.pointers.Bar.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var widthRadiusNormalizer = function(opt_value) {
    return goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
  };
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', widthRadiusNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeGaugeSidePosition],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', widthRadiusNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.pointers.Bar, anychart.circularGaugeModule.pointers.Bar.OWN_DESCRIPTORS);


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Bar.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.axisIndex()));
  if (!this.checkDrawingNeeded())
    return this;

  this.ensureCreated();

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    if (this.hatchFillElement) this.hatchFillElement.clear();
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    return this;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.hatchFill());
    if (!this.hatchFillElement && !anychart.utils.isNone(fill)) {
      this.hatchFillElement = acgraph.path();

      this.hatchFillElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + 1));
    }

    if (this.hatchFillElement) {
      this.hatchFillElement.disablePointerEvents(true);
      this.hatchFillElement.fill(fill);
      this.hatchFillElement.stroke(null);

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_HATCH_FILL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var cx = gauge.getCx();
    var cy = gauge.getCy();

    var scale = axis.scale();

    var iterator = this.getResetIterator();
    iterator.select(/** @type {number} */(this.dataIndex()));
    var value = parseFloat(iterator.get('value'));

    if (scale.isMissing(value)) {
      if (this.domElement) this.domElement.clear();
      if (this.hatchFillElement) this.hatchFillElement.clear();

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      return this;
    }

    if (!this.domElement) {
      this.domElement = acgraph.path();
    } else
      this.domElement.clear();

    var axisRadius = axis.getPixRadius();
    var axisWidth = axis.getPixWidth();
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
    var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : /** @type {number} */(gauge.getOption('sweepAngle')));

    var radius = /** @type {number|string} */(this.getOption('radius'));
    var pixRadius = goog.isDefAndNotNull(radius) ?
        anychart.utils.normalizeSize(radius, gauge.getPixRadius()) :
        axisRadius;
    var width = /** @type {number|string} */(this.getOption('width'));
    var pixWidth = goog.isDefAndNotNull(width) ?
        anychart.utils.normalizeSize(width, gauge.getPixRadius()) :
        axisWidth;

    var shift = (goog.isDef(radius) ? pixWidth / 2 : pixWidth / 2 + axisWidth / 2);

    var position = this.getOption('position');
    if (position == anychart.enums.GaugeSidePosition.OUTSIDE)
      pixRadius += shift;
    else if (position == anychart.enums.GaugeSidePosition.INSIDE)
      pixRadius -= shift;

    var zeroRatio = goog.math.clamp(scale.transform(0), 0, 1);
    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var fromRatio;
    var toRatio;
    if ((axisSweepAngle >= 0) ^ (valueRatio >= zeroRatio)) {
      fromRatio = valueRatio;
      toRatio = zeroRatio;
    } else {
      fromRatio = zeroRatio;
      toRatio = valueRatio;
    }

    var startAngle = goog.math.standardAngle(axisStartAngle + fromRatio * axisSweepAngle);
    var endAngle = goog.math.standardAngle(axisStartAngle + toRatio * axisSweepAngle);
    var sweepAngle = goog.math.standardAngle(endAngle - startAngle);
    if (!sweepAngle) sweepAngle = valueRatio == zeroRatio ? 0 : 360;

    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['radius'] = pixRadius;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['startAngle'] = goog.math.standardAngle(startAngle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);
    this.contextProvider['sweepAngle'] = sweepAngle;
    this.contextProvider['width'] = pixWidth;

    this.domElement.circularArc(
        cx,
        cy,
        pixRadius - pixWidth / 2,
        pixRadius - pixWidth / 2,
        startAngle,
        sweepAngle);

    this.domElement.circularArc(
        cx,
        cy,
        pixRadius + pixWidth / 2,
        pixRadius + pixWidth / 2,
        startAngle + sweepAngle,
        -sweepAngle, true);

    this.domElement.close();

    this.makeInteractive(/** @type {acgraph.vector.Path} */(this.domElement));

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();
      this.hatchFillElement.circularArc(
          cx,
          cy,
          pixRadius - pixWidth / 2,
          pixRadius - pixWidth / 2,
          startAngle,
          sweepAngle);

      this.hatchFillElement.circularArc(
          cx,
          cy,
          pixRadius + pixWidth / 2,
          pixRadius + pixWidth / 2,
          startAngle + sweepAngle,
          -sweepAngle, true);

      this.hatchFillElement.close();
    }

    if (goog.isFunction(this.fill()) || goog.isFunction(this.stroke()))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.circularGaugeModule.pointers.Bar.base(this, 'draw');

  return this;
};


//endregion
//region --- Serialize / Deserialize / Dispose
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Bar.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.pointers.Bar.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.circularGaugeModule.pointers.Bar.OWN_DESCRIPTORS, json, 'Bar pointer');
  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Bar.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.pointers.Bar.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.pointers.Bar.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Bar.prototype.disposeInternal = function() {
  goog.disposeAll(this.domElement, this.hatchFillElement);
  this.domElement = null;
  this.hatchFillElement = null;
  anychart.circularGaugeModule.pointers.Bar.base(this, 'disposeInternal');
};


//endregion


//exports
//(function() {
//  var proto = anychart.circularGaugeModule.pointers.Bar.prototype;
// auto generated
// proto['width'] = proto.width;
// proto['position'] = proto.position;
// proto['radius'] = proto.radius;
//})();
