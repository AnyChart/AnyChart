goog.provide('anychart.circularGaugeModule.Cap');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.utils');



/**
 * Axis ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.circularGaugeModule.Cap = function() {
  anychart.circularGaugeModule.Cap.base(this, 'constructor');

  /**
   * Root layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();

  /**
   * Cap dom element.
   * @type {acgraph.vector.Circle}
   * @private
   */
  this.domElement_ = acgraph.circle();

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.GAUGE_HATCH_FILL, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.circularGaugeModule.Cap, anychart.core.VisualBase);


anychart.circularGaugeModule.Cap.OWN_DESCRIPTORS = (function(){
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', anychart.core.settings.nullOrPercentNormalizer],
    d.STROKE,
    d.FILL,
    d.HATCH_FILL
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.Cap, anychart.circularGaugeModule.Cap.OWN_DESCRIPTORS);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.Cap.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_HATCH_FILL;


/** @inheritDoc */
anychart.circularGaugeModule.Cap.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


/**
 * Set/get link to gauge.
 * @param {anychart.circularGaugeModule.Chart=} opt_gauge Gauge inst for set.
 * @return {anychart.circularGaugeModule.Cap}
 */
anychart.circularGaugeModule.Cap.prototype.gauge = function(opt_gauge) {
  if (goog.isDef(opt_gauge)) {
    if (this.gauge_ != opt_gauge) {
      this.gauge_ = opt_gauge;
    }
    return this;
  } else {
    return this.gauge_;
  }
};


/**
 * Drawing.
 * @return {anychart.circularGaugeModule.Cap}
 */
anychart.circularGaugeModule.Cap.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.domElement_.fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
    this.domElement_.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  var hatchFill = this.getOption('hatchFill');
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    if (!this.hatchFillElement_ && hatchFill && !anychart.utils.isNone(hatchFill)) {
      this.hatchFillElement_ = acgraph.circle();
      this.hatchFillElement_.parent(this.rootLayer_);
      this.hatchFillElement_.zIndex(1);
    }

    if (this.hatchFillElement_) {
      this.hatchFillElement_.fill(hatchFill);
      this.hatchFillElement_.stroke(null);

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_HATCH_FILL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.domElement_.parent(this.rootLayer_);
    if (this.hatchFillElement_)
      this.hatchFillElement_.parent(this.rootLayer_);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.domElement_.zIndex(0);
    if (this.hatchFillElement_)
      this.hatchFillElement_.zIndex(1);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var pixRadius = anychart.utils.normalizeSize(/** @type {null|string} */(this.getOption('radius')), this.gauge_.getPixRadius());
    var cx = this.gauge_.getCx();
    var cy = this.gauge_.getCy();

    this.domElement_.centerX(cx);
    this.domElement_.centerY(cy);
    this.domElement_.radius(pixRadius < 0 ? 0 : pixRadius);

    if (this.hatchFillElement_) {
      this.hatchFillElement_.centerX(cx);
      this.hatchFillElement_.centerY(cy);
      this.hatchFillElement_.radius(pixRadius);
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.circularGaugeModule.Cap.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.Cap.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.circularGaugeModule.Cap.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.Cap.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.Cap.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.Cap.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.circularGaugeModule.Cap.prototype.disposeInternal = function() {
  goog.disposeAll(this.domElement_, this.hatchFillElement_, this.rootLayer_);
  this.domElement_ = null;
  this.hatchFillElement_ = null;
  this.rootLayer_ = null;
  anychart.circularGaugeModule.Cap.base(this, 'disposeInternal');
};


//exports
// (function() {
//   var proto = anychart.circularGaugeModule.Cap.prototype;
//   proto['radius'] = proto.radius;
//   proto['stroke'] = proto.stroke;
//   proto['fill'] = proto.fill;
//   proto['hatchFill'] = proto.hatchFill;
// })();
