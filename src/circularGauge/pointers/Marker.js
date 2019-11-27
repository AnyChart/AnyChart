goog.provide('anychart.circularGaugeModule.pointers.Marker');
goog.require('acgraph');
goog.require('anychart.circularGaugeModule.pointers.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Marker pointer class.<br/>
 * @constructor
 * @extends {anychart.circularGaugeModule.pointers.Base}
 */
anychart.circularGaugeModule.pointers.Marker = function() {
  anychart.circularGaugeModule.pointers.Marker.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['size', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['type', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  this.domElement = new anychart.core.ui.MarkersFactory();
  // defaults that was deleted form MarkersFactory
  this.domElement.setParentEventTarget(this);
  this.domElement.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
  this.domElement.setOption('size', 10);
  this.domElement.setOption('anchor', anychart.enums.Anchor.CENTER);
  this.domElement.setOption('offsetX', 0);
  this.domElement.setOption('offsetY', 0);
  this.domElement.setOption('rotation', 0);
};
goog.inherits(anychart.circularGaugeModule.pointers.Marker, anychart.circularGaugeModule.pointers.Base);


//region --- Infrastructure
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Marker.prototype.getType = function() {
  return anychart.enums.CircularGaugePointerType.MARKER;
};


//endregion
//region --- Descriptors
/**
 * Properties that should be defined in anychart.circularGaugeModule.pointers.Marker prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.pointers.Marker.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var typeNormalizer = function(opt_value) {
    return goog.isFunction(opt_value) ?
        opt_value :
        anychart.enums.normalizeMarkerType(opt_value, anychart.enums.MarkerType.LINE);
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeGaugeSidePosition],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', typeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.pointers.Marker, anychart.circularGaugeModule.pointers.Marker.OWN_DESCRIPTORS);


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Marker.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.getOption('axisIndex')));
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

  var type = /** @type {string|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} */(this.getOption('type'));
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.getOption('hatchFill'));
    // by default from config hatchFill is boolean false
    if (!this.hatchFillElement && fill && !anychart.utils.isNone(fill)) {
      this.hatchFillElement = new anychart.core.ui.MarkersFactory();
      this.hatchFillElement.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
      this.hatchFillElement.setOption('size', 10);
      this.hatchFillElement.setOption('anchor', anychart.enums.Anchor.CENTER);
      this.hatchFillElement.setOption('offsetX', 0);
      this.hatchFillElement.setOption('offsetY', 0);
      this.hatchFillElement.setOption('rotation', 0);
      this.hatchFillElement.container(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + 1));
    }

    if (this.hatchFillElement) {
      this.hatchFillElement.disablePointerEvents(true);
      this.hatchFillElement.setOption('fill', fill);
      this.hatchFillElement.setOption('stroke', null);
      this.hatchFillElement.setOption('size', this.pixSize_);
      this.hatchFillElement.setOption('type', type);

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

    var axisRadius = axis.getPixRadius();
    var axisWidth = axis.getPixWidth();
    var axisStartAngle = axis.getStartAngle();
    var axisSweepAngle = axis.getSweepAngle();

    var radius = /** @type {number|string} */(this.getOption('radius'));
    var pixRadius = goog.isDefAndNotNull(radius) ?
        anychart.utils.normalizeSize(radius, gauge.getPixRadius()) :
        axisRadius;
    var size = /** @type {number|string} */(this.getOption('size'));
    this.pixSize_ = goog.isDefAndNotNull(size) ?
        anychart.utils.normalizeSize(size, gauge.getPixRadius()) :
        axisWidth;

    var position = /** @type {anychart.enums.GaugeSidePosition} */(this.getOption('position'));
    if (position == anychart.enums.GaugeSidePosition.OUTSIDE)
      pixRadius += this.pixSize_ + axisWidth / 2;
    else if (position == anychart.enums.GaugeSidePosition.INSIDE)
      pixRadius -= this.pixSize_ + axisWidth / 2;

    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var angle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
    var angleRad = goog.math.toRadians(angle);

    var x = cx + pixRadius * Math.cos(angleRad);
    var y = cy + pixRadius * Math.sin(angleRad);


    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['radius'] = pixRadius;
    this.contextProvider['size'] = this.pixSize_;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(angle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);


    this.domElement.setOption('size', this.pixSize_);
    this.domElement.setOption('type', type);

    var marker = this.domElement.add({'value': {'x': x, 'y': y}}, 0);
    marker.setOption('rotation', angle + 90);

    if (this.hatchFillElement) {
      this.hatchFillElement.setOption('size', this.pixSize_);
      this.hatchFillElement.setOption('type', type);

      var hatchFill = this.hatchFillElement.add({'value': {'x': x, 'y': y}}, 0);
      hatchFill.setOption('rotation', angle + 90);
    }

    if (goog.isFunction(this.getOption('fill')) || goog.isFunction(this.getOption('stroke')))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.circularGaugeModule.pointers.Marker.base(this, 'draw');

  this.domElement.draw();
  if (this.hatchFillElement) this.hatchFillElement.draw();


  if (marker && marker.getDomElement())
    marker.getDomElement().tag = iterator.getIndex();

  return this;
};


//endregion
//region --- Serialize / Deserialize / Disposing
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Marker.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.pointers.Marker.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.circularGaugeModule.pointers.Marker.OWN_DESCRIPTORS, json, 'Marker pointer');

  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Marker.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.pointers.Marker.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.pointers.Marker.OWN_DESCRIPTORS, config, opt_default);
};


//endregion


//exports
//(function() {
//  var proto = anychart.circularGaugeModule.pointers.Marker.prototype;
//  auto generated
//  proto['size'] = proto.size;
//  proto['position'] = proto.position;
//  proto['radius'] = proto.radius;
//  proto['type'] = proto.type;
//})();
