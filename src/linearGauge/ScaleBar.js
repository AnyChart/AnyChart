goog.provide('anychart.linearGaugeModule.ScaleBar');
goog.require('anychart.core.VisualBase');



/**
 * Base class for ScaleBar.
 * @param {anychart.linearGaugeModule.Chart} gauge Gauge.
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.linearGaugeModule.ScaleBar = function(gauge) {
  anychart.linearGaugeModule.ScaleBar.base(this, 'constructor');

  /**
   * @type {anychart.linearGaugeModule.Chart}
   * @protected
   */
  this.gauge = gauge;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['width', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offset', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['from', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['to', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['points', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.linearGaugeModule.ScaleBar, anychart.core.VisualBase);


/**
 * Control point type definition.
 * @includeDoc
 * @typedef {{
 *   height: number,
 *   left: number,
 *   right: number
 * }}
 */
anychart.linearGaugeModule.ScaleBar.ControlPoint;


//region --- STATES/SIGNALS ---
/**
 * Supported states.
 * @type {number}
 */
anychart.linearGaugeModule.ScaleBar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


//endregion
//region --- DESCRIPTORS
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.ScaleBar.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offset', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'from', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'to', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'points', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.ScaleBar, anychart.linearGaugeModule.ScaleBar.OWN_DESCRIPTORS);


//endregion


//endregion
//region --- OWN/INHERITED API ---
/**
 * Getter/setter for scale.
 * @param {anychart.scales.ScatterBase=} opt_value Scale.
 * @return {anychart.linearGaugeModule.ScaleBar|anychart.scales.Base} scale or self for chaining.
 */
anychart.linearGaugeModule.ScaleBar.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(anychart.utils.instanceOf(opt_value, anychart.scales.ScatterBase))) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['ScaleBar scale', 'scatter', 'linear, log']);
      return this;
    }
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated_, this);
      this.scale_ = opt_value;
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  if (!this.scale_) {
    this.scale_ = /** @type {anychart.scales.ScatterBase} */ (this.gauge.scale());
    this.scale_.listenSignals(this.scaleInvalidated_, this);
  }
  return this.scale_;
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.linearGaugeModule.ScaleBar.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


/**
 * Getter/setter for led color scale.
 * @param {(anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal|Object|anychart.enums.ScaleTypes)=} opt_value Led color scale.
 * @return {anychart.linearGaugeModule.ScaleBar|anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} color scale or self for chaining.
 */
anychart.linearGaugeModule.ScaleBar.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.COLOR_SCALES, null, this.colorScaleInvalidated_, this);
    if (val) {
      var dispatch = this.colorScale_ == val;
      this.colorScale_ = /** @type {anychart.scales.Base} */(val);
      this.colorScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.linearGaugeModule.ScaleBar.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- POSITION/BOUNDS ---
/** @inheritDoc */
anychart.linearGaugeModule.ScaleBar.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
};


/**
 * Getter/setter for pointer layout.
 * @param {anychart.enums.Layout=} opt_value Layout.
 * @return {string|anychart.linearGaugeModule.ScaleBar} Layout or self for chaining.
 */
anychart.linearGaugeModule.ScaleBar.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.layout_ = opt_value;
    return this;
  }
  return this.layout_;
};


/**
 * Whether layout is vertical.
 * @return {boolean} Is layout vertical or not.
 */
anychart.linearGaugeModule.ScaleBar.prototype.isVertical = function() {
  return this.layout_ == anychart.enums.Layout.VERTICAL;
};


//endregion
//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.ScaleBar.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.parent(null);
};


/**
 * Returns finalized value for from/to values.
 * @param {*} value
 * @param {number} defaultValue Number that should be returned by default.
 * @return {number} Finalized value (ratio) for from/to.
 */
anychart.linearGaugeModule.ScaleBar.prototype.getValue = function(value, defaultValue) {
  var scale = this.scale();
  if (goog.isString(value)) {
    value = value.toLowerCase();
    if (value == 'min')
      return scale.transform(scale.minimum());
    else if (value == 'max')
      return scale.transform(scale.maximum());
    else {
      return parseFloat(anychart.utils.normalizeToPercent(value)) / 100;
    }
  } else if (goog.isNumber(value)) {
    value = scale.transform(value);
    return goog.math.clamp(value, 0, 1);
  }
  return defaultValue;
};


/**
 * Applies ratio to bounds.
 * @param {number} ratio Ratio.
 * @param {anychart.math.Rect=} opt_bounds Bounds.
 * @param {boolean=} opt_isVertical Whether to use vertical dimension.
 * @return {number}
 */
anychart.linearGaugeModule.ScaleBar.prototype.applyRatioToBounds = function(ratio, opt_bounds, opt_isVertical) {
  var bounds = goog.isDef(opt_bounds) ? opt_bounds : /** @type {anychart.math.Rect} */ (this.parentBounds());
  var min, range;
  var isVertical = goog.isDef(opt_isVertical) ? opt_isVertical : this.isVertical();
  if (isVertical) {
    min = bounds.getBottom();
    range = -bounds.height;
  } else {
    min = bounds.left;
    range = bounds.width;
  }
  return min + ratio * range;
};


/**
 * Compare function.
 * @param {anychart.linearGaugeModule.ScaleBar.ControlPoint} a Set of control points.
 * @param {anychart.linearGaugeModule.ScaleBar.ControlPoint} b Set of control points.
 * @return {number}
 */
anychart.linearGaugeModule.ScaleBar.POINTS_COMPARE = function(a, b) {
  return a['height'] - b['height'];
};


/**
 * Calculates coordinates.
 * @param {number} ratio1 Ratio.
 * @param {number} ratio2 Ratio.
 * @param {anychart.math.Rect} scaleBarBounds Shape bounds.
 * @return {Array}
 */
anychart.linearGaugeModule.ScaleBar.prototype.getXY = function(ratio1, ratio2, scaleBarBounds) {
  var x, y;
  var isVertical = this.isVertical();
  if (isVertical) {
    x = this.applyRatioToBounds(ratio1, scaleBarBounds, !isVertical);
    y = this.applyRatioToBounds(ratio2, scaleBarBounds, isVertical);
  } else {
    y = this.applyRatioToBounds(ratio1, scaleBarBounds, !isVertical);
    x = this.applyRatioToBounds(ratio2, scaleBarBounds, isVertical);
  }
  return [x, y];
};


/**
 * Creates path to clip scale bar.
 * @param {anychart.math.Rect} scaleBarBounds Shape bounds.
 * @private
 */
anychart.linearGaugeModule.ScaleBar.prototype.createClipPath_ = function(scaleBarBounds) {
  var xy, i;
  var isInverted = this.scale().inverted();
  var left, right, height;
  var points = this.getOption('points');
  left = isInverted ? 1 - points[0]['left'] : points[0]['left'];
  height = isInverted ? 1 - points[0]['height'] : points[0]['height'];
  xy = this.getXY(left, height, scaleBarBounds);
  this.clipPath_.moveTo(xy[0], xy[1]);
  for (i = 1; i < points.length; i++) {
    left = isInverted ? 1 - points[i]['left'] : points[i]['left'];
    height = isInverted ? 1 - points[i]['height'] : points[i]['height'];
    xy = this.getXY(left, height, scaleBarBounds);
    this.clipPath_.lineTo(xy[0], xy[1]);
  }
  for (i = points.length; i--;) {
    right = isInverted ? points[i]['right'] : 1 - points[i]['right'];
    height = isInverted ? 1 - points[i]['height'] : points[i]['height'];
    xy = this.getXY(right, height, scaleBarBounds);
    this.clipPath_.lineTo(xy[0], xy[1]);
  }
  this.clipPath_.close();
};


/**
 * Draws scale bar.
 * @return {anychart.linearGaugeModule.ScaleBar} Self.
 */
anychart.linearGaugeModule.ScaleBar.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var i;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  var points = /** @type {Array.<anychart.linearGaugeModule.ScaleBar.ControlPoint>} */(this.getOption('points'));
  if (!points) {
    points = [];
    this.setOption('points', points);
  }
  goog.array.sort(points, anychart.linearGaugeModule.ScaleBar.POINTS_COMPARE);
  if (!points[0] || points[0]['height'] != 0) {
    points.unshift({
      'height': 0,
      'left': 0,
      'right': 0
    });
  }
  if (!points[points.length - 1] || points[points.length - 1]['height'] != 1) {
    points.push({
      'height': 1,
      'left': 0,
      'right': 0
    });
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var from = this.getValue(this.getOption('from'), 0);
    var to = this.getValue(this.getOption('to'), 1);
    if (from > to) {
      var tmp = from;
      from = to;
      to = tmp;
    }

    this.pixelFrom_ = this.applyRatioToBounds(from);
    this.pixelTo_ = this.applyRatioToBounds(to);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var colorScale = /** @type {(anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal)} */ (this.colorScale());
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (!this.clipPath_)
      this.clipPath_ = acgraph.path();
    else
      this.clipPath_.clear();

    if (!this.paths) {
      this.paths = [];
    } else {
      for (i = 0; i < this.paths.length; i++)
        this.paths[i].clear();
    }

    var left, top, right, bottom, width, height;
    var bounds = /** @type {!anychart.math.Rect} */ (this.parentBounds());
    var isVertical = this.isVertical();
    if (isVertical) {
      left = bounds.left;
      width = bounds.width;
      right = /** @type {number} */ (left + width);
      top = this.pixelTo_;
      bottom = this.pixelFrom_;
      height = Math.abs(bottom - top);
    } else {
      left = this.pixelFrom_;
      right = this.pixelTo_;
      width = Math.abs(left - right);
      top = bounds.top;
      height = bounds.height;
      bottom = /** @type {number} */ (top + height);
    }

    var scaleBarBounds = anychart.math.rect(left, top, width, height);
    this.createClipPath_(scaleBarBounds);

    var colors;
    if (colorScale)
      colors = colorScale.colors();
    var inverted = this.scale().inverted();
    var path, fill, stroke;

    // if one of fill/stroke is set - use them
    // only if there no fill/stroke - use color scale
    fill = this.getOption('fill');
    stroke = this.getOption('stroke');
    var fillIsSet = goog.isDefAndNotNull(fill);
    var strokeIsSet = goog.isDefAndNotNull(stroke);
    if (fillIsSet || strokeIsSet) {
      path = this.paths[0] ? this.paths[0] : this.paths[0] = this.rootLayer.path();
      path
          .moveTo(left, top)
          .lineTo(right, top)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top)
          .close();

      path.fill(fill || null);
      path.stroke(stroke || null);
      path.clip(this.clipPath_);
    } else if (anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Linear)) {
      var offsets = goog.array.map(colors, function(color) {
        return color['offset'];
      });
      colors = /** @type {Array} */ (inverted ? colorScale.colors().reverse() : colorScale.colors());
      if (inverted)
        colors = goog.array.map(colors, function(color, index) {
          var newColor = {};
          newColor['color'] = color['color'];
          newColor['offset'] = offsets[index];
          newColor['opacity'] = color['opacity'];
          return newColor;
        });
      fill = acgraph.vector.normalizeFill(colors);
      if (isVertical)
        fill['angle'] = 90;
      else
        fill['angle'] = 0;
      path = this.paths[0] ? this.paths[0] : this.paths[0] = this.rootLayer.path();
      path
          .moveTo(left, top)
          .lineTo(right, top)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top)
          .close();
      path.fill(fill).stroke('none');
      path.clip(this.clipPath_);
    } else if (anychart.utils.instanceOf(colorScale, anychart.colorScalesModule.Ordinal)) {
      if (colorScale.needsAutoCalc())
        colorScale.startAutoCalc().extendDataRange(0, 1).finishAutoCalc();
      var ranges = colorScale.getProcessedRanges();
      var scale = this.scale();

      // exclude default range from drawing logic
      var len = ranges.length - 1;
      for (i = 0; i < len; i++) {
        var range = ranges[i];
        var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];
        path = this.paths[i] ? this.paths[i] : this.paths[i] = this.rootLayer.path();
        path.clear();

        var shift = 0.5;

        var start = goog.isDef(range['start']) ? range['start'] : scale.minimum();
        var end = goog.isDef(range['end']) ? range['end'] : scale.maximum();
        var pixelStart = this.applyRatioToBounds(scale.transform(start));
        var pixelEnd = this.applyRatioToBounds(scale.transform(end));
        if (isNaN(pixelStart) || isNaN(pixelEnd))
          continue;

        if (isVertical) {
          path
              .moveTo(left, pixelStart)
              .lineTo(left, pixelEnd + shift)
              .lineTo(right, pixelEnd + shift)
              .lineTo(right, pixelStart)
              .close();
        } else {
          path
              .moveTo(pixelStart, top)
              .lineTo(pixelEnd + shift, top)
              .lineTo(pixelEnd + shift, bottom)
              .lineTo(pixelStart, bottom)
              .close();
        }
        path.fill(color).stroke('none');
      }
      this.rootLayer.clip(this.clipPath_);
    }

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


//endregion
//region --- SETUP/DISPOSING ---
/** @inheritDoc */
anychart.linearGaugeModule.ScaleBar.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.ScaleBar.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.linearGaugeModule.ScaleBar.OWN_DESCRIPTORS, json, 'ScaleBar');

  if (this.colorScale()) {
    json['colorScale'] = this.colorScale().serialize();
  }

  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.ScaleBar.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.ScaleBar.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.ScaleBar.OWN_DESCRIPTORS, config, opt_default);
  var json, scale;
  if ('colorScale' in config) {
    json = config['colorScale'];
    scale = null;
    if (goog.isString(json)) {
      scale = anychart.scales.Base.fromString(json, null);
    } else if (goog.isObject(json)) {
      scale = anychart.scales.Base.fromString(json['type'], null);
      if (scale)
        scale.setup(json);
    }
    if (scale)
      this.colorScale(/** @type {anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} */ (scale));
  }
};


/** @inheritDoc */
anychart.linearGaugeModule.ScaleBar.prototype.disposeInternal = function() {
  if (this.paths) {
    goog.disposeAll(this.paths);
    this.paths = null;
  }
  goog.dispose(this.colorScale_);
  this.colorScale_ = null;

  goog.dispose(this.clipPath_);
  this.clipPath_ = null;

  if (this.scale_)
    this.scale_.unlistenSignals(this.scaleInvalidated_, this);
  this.scale_ = null;

  anychart.linearGaugeModule.ScaleBar.base(this, 'disposeInternal');
};
//endregion

//exports
(function() {
  var proto = anychart.linearGaugeModule.ScaleBar.prototype;
  //auto generated
  //proto['from'] = proto.from;
  //proto['to'] = proto.to;
  //proto['width'] = proto.width;
  //proto['offset'] = proto.offset;
  //proto['points'] = proto.points;
  //proto['fill'] = proto.fill;
  //proto['stroke'] = proto.stroke;
  proto['scale'] = proto.scale;
  proto['colorScale'] = proto.colorScale;
})();
