goog.provide('anychart.circularGaugeModule.pointers.Needle');
goog.require('acgraph');
goog.require('anychart.circularGaugeModule.pointers.Base');
goog.require('anychart.utils');



/**
 * Needle pointer class.<br/>
 * @constructor
 * @extends {anychart.circularGaugeModule.pointers.Base}
 */
anychart.circularGaugeModule.pointers.Needle = function() {
  anychart.circularGaugeModule.pointers.Needle.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['startWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['startRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['middleWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['middleRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['endWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['endRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.pointers.Needle, anychart.circularGaugeModule.pointers.Base);


//region --- Infrastructure
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.getType = function() {
  return anychart.enums.CircularGaugePointerType.NEEDLE;
};


//endregion
//region --- Descriptors
/**
 * Properties that should be defined in anychart.circularGaugeModule.pointers.Needle prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.pointers.Needle.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var normalizer = function(opt_value) {
    return goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startWidth', normalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startRadius', normalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'middleWidth', normalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'middleRadius', normalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'endWidth', normalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'endRadius', normalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.pointers.Needle, anychart.circularGaugeModule.pointers.Needle.OWN_DESCRIPTORS);


//endregion
//region --- Overrides
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.draw = function() {
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
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
    var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : /** @type {number} */(gauge.getOption('sweepAngle')));

    var pixStartRadius = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('startRadius')), gauge.getPixRadius());
    var pixStartWidth = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('startWidth')), gauge.getPixRadius());

    var endRadius = /** @type {string} */(this.getOption('endRadius'));
    var pixEndRadius = goog.isDefAndNotNull(endRadius) ? anychart.utils.normalizeSize(
        endRadius, gauge.getPixRadius()) : axisRadius;

    var endWidth = /** @type {string} */(this.getOption('endWidth'));
    var pixEndWidth = goog.isDefAndNotNull(endWidth) ? anychart.utils.normalizeSize(
        endWidth, gauge.getPixRadius()) : 0;

    var middleRadius = /** @type {string} */(this.getOption('middleRadius'));
    var pixMiddleRadius = goog.isDefAndNotNull(middleRadius) ? anychart.utils.normalizeSize(
        middleRadius, gauge.getPixRadius()) : pixEndRadius * 0.9;

    var pixMiddleWidth = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('middleWidth')), gauge.getPixRadius());

    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var angle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
    var angleLeft = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle + 90);
    var angleRight = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle - 90);

    var angleRad = goog.math.toRadians(angle);
    var angleRadLeft = goog.math.toRadians(angleLeft);
    var angleRadRight = goog.math.toRadians(angleRight);


    var startX = cx + pixStartRadius * Math.cos(angleRad);
    var startY = cy + pixStartRadius * Math.sin(angleRad);

    var startXLeft = startX + pixStartWidth * Math.cos(angleRadLeft);
    var startYLeft = startY + pixStartWidth * Math.sin(angleRadLeft);

    var startXRight = startX + pixStartWidth * Math.cos(angleRadRight);
    var startYRight = startY + pixStartWidth * Math.sin(angleRadRight);


    var middleX = cx + pixMiddleRadius * Math.cos(angleRad);
    var middleY = cy + pixMiddleRadius * Math.sin(angleRad);

    var middleXLeft = middleX + pixMiddleWidth * Math.cos(angleRadLeft);
    var middleYLeft = middleY + pixMiddleWidth * Math.sin(angleRadLeft);

    var middleXRight = middleX + pixMiddleWidth * Math.cos(angleRadRight);
    var middleYRight = middleY + pixMiddleWidth * Math.sin(angleRadRight);


    var endX = cx + pixEndRadius * Math.cos(angleRad);
    var endY = cy + pixEndRadius * Math.sin(angleRad);

    var endXLeft = endX + pixEndWidth * Math.cos(angleRadLeft);
    var endYLeft = endY + pixEndWidth * Math.sin(angleRadLeft);

    var endXRight = endX + pixEndWidth * Math.cos(angleRadRight);
    var endYRight = endY + pixEndWidth * Math.sin(angleRadRight);


    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['startRadius'] = pixStartRadius;
    this.contextProvider['startWidth'] = pixStartWidth;
    this.contextProvider['middleRadius'] = pixMiddleRadius;
    this.contextProvider['middleWidth'] = pixMiddleWidth;
    this.contextProvider['endRadius'] = pixEndRadius;
    this.contextProvider['endWidth'] = pixEndWidth;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(angle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);


    this.domElement
        .moveTo(endXLeft, endYLeft)
        .lineTo(middleXLeft, middleYLeft)
        .lineTo(startXLeft, startYLeft)

        .lineTo(startXRight, startYRight)
        .lineTo(middleXRight, middleYRight)
        .lineTo(endXRight, endYRight);


    this.domElement.close();

    this.makeInteractive(/** @type {acgraph.vector.Path} */(this.domElement));

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();
      this.hatchFillElement
          .moveTo(endXLeft, endYLeft)
          .lineTo(middleXLeft, middleYLeft)
          .lineTo(startXLeft, startYLeft)

          .lineTo(startXRight, startYRight)
          .lineTo(middleXRight, middleYRight)
          .lineTo(endXRight, endYRight);
      this.hatchFillElement.close();
    }

    if (goog.isFunction(this.fill()) || goog.isFunction(this.stroke()))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.circularGaugeModule.pointers.Needle.base(this, 'draw');

  return this;
};


//endregion
//region --- Serialize / Deserialize / Dispose
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.pointers.Needle.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.circularGaugeModule.pointers.Needle.OWN_DESCRIPTORS, json, 'Needle pointer');

  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.pointers.Needle.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.pointers.Needle.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.disposeInternal = function() {
  goog.disposeAll(this.domElement, this.hatchFillElement);
  this.domElement = null;
  this.hatchFillElement = null;
  anychart.circularGaugeModule.pointers.Needle.base(this, 'disposeInternal');
};


//endregion


//exports
//(function() {
//  var proto = anychart.circularGaugeModule.pointers.Needle.prototype;
//  auto generated
//  proto['startRadius'] = proto.startRadius;
//  proto['middleRadius'] = proto.middleRadius;
//  proto['endRadius'] = proto.endRadius;
//  proto['startWidth'] = proto.startWidth;
//  proto['middleWidth'] = proto.middleWidth;
//  proto['endWidth'] = proto.endWidth;
//})();
