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
//region --- Type Definitions.
/**
 * Points required to draw the needle.
 *
 * @typedef {{
 *  angle: number,
 *  cx: number,
 *  cy: number,
 *  pixStartRadius: number,
 *  pixStartWidth: number,
 *  pixMiddleRadius: number,
 *  pixMiddleWidth: number,
 *  pixEndRadius: number,
 *  pixEndWidth: number,
 *  startXLeft: number,
 *  startYLeft: number,
 *  middleXLeft: number,
 *  middleYLeft: number,
 *  endXLeft: number,
 *  endYLeft: number,
 *  startXRight: number,
 *  startYRight: number,
 *  middleXRight: number,
 *  middleYRight: number,
 *  endXRight: number,
 *  endYRight: number
 * }}
 */
anychart.circularGaugeModule.pointers.Needle.Metrics;

//endregion
//region --- Descriptors
/**
 * Properties that should be defined in anychart.circularGaugeModule.pointers.Needle prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.pointers.Needle.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startWidth', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startRadius', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'middleWidth', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'middleRadius', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'endWidth', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'endRadius', anychart.core.settings.nullOrPercentNormalizer]
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

/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.remove = function() {
  anychart.circularGaugeModule.pointers.Needle.base(this, 'remove');
  this.interactivityElement.clear();
};

//endregion
//region --- Drawing
/**
 * TODO Describe.
 *
 * @param {anychart.circularGaugeModule.Axis} axis - Axis.
 * @param {number} value - Value.
 * @param {number=} opt_extension - Area pixel extension for https://anychart.atlassian.net/browse/DVF-4327.
 * @return {anychart.circularGaugeModule.pointers.Needle.Metrics}
 * @private
 */
anychart.circularGaugeModule.pointers.Needle.prototype.getNeedleMetrics_ = function(axis, value, opt_extension) {
  opt_extension = opt_extension || 0;
  var opt_extensionX2 = (opt_extension + opt_extension);

  var gauge = this.gauge();
  var scale = axis.scale();
  var cx = gauge.getCx();
  var cy = gauge.getCy();

  var axisRadius = axis.getPixRadius();
  var axisStartAngle = axis.getStartAngle();
  var axisSweepAngle = axis.getSweepAngle();
  var gaugePixelRadius = gauge.getPixRadius();

  var pixStartRadius = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('startRadius')), gaugePixelRadius);
  pixStartRadius -= opt_extension;

  var pixStartWidth = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('startWidth')), gaugePixelRadius);
  pixStartWidth += opt_extensionX2;

  var endRadius = /** @type {string} */(this.getOption('endRadius'));
  var pixEndRadius = goog.isDefAndNotNull(endRadius) ? anychart.utils.normalizeSize(
      endRadius, gaugePixelRadius) : axisRadius;
  pixEndRadius += opt_extension;

  var endWidth = /** @type {string} */(this.getOption('endWidth'));
  var pixEndWidth = goog.isDefAndNotNull(endWidth) ? anychart.utils.normalizeSize(
      endWidth, gaugePixelRadius) : 0;
  pixEndWidth += opt_extensionX2;

  var middleRadius = /** @type {string} */(this.getOption('middleRadius'));
  var pixMiddleRadius = goog.isDefAndNotNull(middleRadius) ? anychart.utils.normalizeSize(
      middleRadius, gaugePixelRadius) : pixEndRadius * 0.9;
  // pixMiddleRadius += opt_extension;

  var pixMiddleWidth = anychart.utils.normalizeSize(/** @type {string} */(this.getOption('middleWidth')), gaugePixelRadius);
  pixMiddleWidth += opt_extensionX2;

  var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

  var angle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
  var angleLeft = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle + 90);
  var angleRight = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle - 90);

  var angleRad = goog.math.toRadians(angle);
  var angleRadLeft = goog.math.toRadians(angleLeft);
  var angleRadRight = goog.math.toRadians(angleRight);

  var startX = cx + pixStartRadius * Math.cos(angleRad);
  var startY = cy + pixStartRadius * Math.sin(angleRad);
  var middleX = cx + pixMiddleRadius * Math.cos(angleRad);
  var middleY = cy + pixMiddleRadius * Math.sin(angleRad);
  var endX = cx + pixEndRadius * Math.cos(angleRad);
  var endY = cy + pixEndRadius * Math.sin(angleRad);

  return {
    angle: angle,
    cx: cx,
    cy: cy,

    pixStartRadius: pixStartRadius,
    pixStartWidth: pixStartWidth,
    pixMiddleRadius: pixMiddleRadius,
    pixMiddleWidth: pixMiddleWidth,
    pixEndRadius: pixEndRadius,
    pixEndWidth: pixEndWidth,

    startXLeft: startX + pixStartWidth * Math.cos(angleRadLeft),
    startYLeft: startY + pixStartWidth * Math.sin(angleRadLeft),
    startXRight: startX + pixStartWidth * Math.cos(angleRadRight),
    startYRight: startY + pixStartWidth * Math.sin(angleRadRight),

    middleXLeft: middleX + pixMiddleWidth * Math.cos(angleRadLeft),
    middleYLeft: middleY + pixMiddleWidth * Math.sin(angleRadLeft),
    middleXRight: middleX + pixMiddleWidth * Math.cos(angleRadRight),
    middleYRight: middleY + pixMiddleWidth * Math.sin(angleRadRight),

    endXLeft: endX + pixEndWidth * Math.cos(angleRadLeft),
    endYLeft: endY + pixEndWidth * Math.sin(angleRadLeft),
    endXRight: endX + pixEndWidth * Math.cos(angleRadRight),
    endYRight: endY + pixEndWidth * Math.sin(angleRadRight)
  };
};

/** @inheritDoc */
anychart.circularGaugeModule.pointers.Needle.prototype.draw = function() {
  var axis = this.gauge().getAxis(/** @type {number} */(this.getOption('axisIndex')));
  if (!this.checkDrawingNeeded())
    return this;

  this.ensureCreated();

  if (!axis || !axis.enabled()) {
    this.interactivityElement.clear();
    if (this.domElement) this.domElement.clear();
    if (this.hatchFillElement) this.hatchFillElement.clear();
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    return this;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.getOption('hatchFill'));
    if (!this.hatchFillElement && fill && !anychart.utils.isNone(fill)) {
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
    var scale = axis.scale();

    var iterator = this.getResetIterator();
    iterator.select(/** @type {number} */(this.dataIndex()));

    var value = parseFloat(iterator.get('value'));
    var m = this.getNeedleMetrics_(axis, value);

    if (scale.isMissing(value)) {
      this.interactivityElement.clear();
      if (this.domElement) this.domElement.clear();
      if (this.hatchFillElement) this.hatchFillElement.clear();

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      return this;
    }

    if (!this.domElement) {
      this.domElement = acgraph.path();
    }

    this.contextProvider['cx'] = m.cx;
    this.contextProvider['cy'] = m.cy;
    this.contextProvider['startRadius'] = m.pixStartRadius;
    this.contextProvider['startWidth'] = m.pixStartWidth;
    this.contextProvider['middleRadius'] = m.pixMiddleRadius;
    this.contextProvider['middleWidth'] = m.pixMiddleWidth;
    this.contextProvider['endRadius'] = m.pixEndRadius;
    this.contextProvider['endWidth'] = m.pixEndWidth;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(m.angle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);

    this.domElement
      .clear()
      .moveTo(m.endXLeft, m.endYLeft)
      .lineTo(m.middleXLeft, m.middleYLeft)
      .lineTo(m.startXLeft, m.startYLeft)
      .lineTo(m.startXRight, m.startYRight)
      .lineTo(m.middleXRight, m.middleYRight)
      .lineTo(m.endXRight, m.endYRight)
      .close();

    if (this.hatchFillElement) {
      this.hatchFillElement
        .clear()
        .moveTo(m.endXLeft, m.endYLeft)
        .lineTo(m.middleXLeft, m.middleYLeft)
        .lineTo(m.startXLeft, m.startYLeft)
        .lineTo(m.startXRight, m.startYRight)
        .lineTo(m.middleXRight, m.middleYRight)
        .lineTo(m.endXRight, m.endYRight)
        .close();
    }

    var extensionMetrics = this.getNeedleMetrics_(axis, value, 5); // opt_extension is hardcoded for a while.
    this.interactivityElement
      .clear()
      .moveTo(extensionMetrics.endXLeft, extensionMetrics.endYLeft)
      .lineTo(extensionMetrics.middleXLeft, extensionMetrics.middleYLeft)
      .lineTo(extensionMetrics.startXLeft, extensionMetrics.startYLeft)
      .lineTo(extensionMetrics.startXRight, extensionMetrics.startYRight)
      .lineTo(extensionMetrics.middleXRight, extensionMetrics.middleYRight)
      .lineTo(extensionMetrics.endXRight, extensionMetrics.endYRight)
      .close();

    this.makeInteractive(this.interactivityElement);

    if (goog.isFunction(this.getOption('fill')) || goog.isFunction(this.getOption('stroke')))
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
