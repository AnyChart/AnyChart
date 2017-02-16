goog.provide('anychart.core.linearGauge.ScaleBar');
goog.require('anychart.core.VisualBase');



/**
 * Base class for ScaleBar.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.core.linearGauge.ScaleBar = function(gauge) {
  anychart.core.linearGauge.ScaleBar.base(this, 'constructor');

  /**
   * @type {anychart.charts.LinearGauge}
   * @protected
   */
  this.gauge = gauge;

  /**
   * Control points.
   * @type {Array.<anychart.core.linearGauge.ScaleBar.ControlPoint>}
   * @private
   */
  this.points_ = [];
};
goog.inherits(anychart.core.linearGauge.ScaleBar, anychart.core.VisualBase);


/**
 * Control point type definition.
 * @includeDoc
 * @typedef {{
 *   height: number,
 *   left: number,
 *   right: number
 * }}
 */
anychart.core.linearGauge.ScaleBar.ControlPoint;


//region --- STATES/SIGNALS ---
/**
 * Supported states.
 * @type {number}
 */
anychart.core.linearGauge.ScaleBar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;
//endregion


//region --- OWN/INHERITED API ---
/**
 * Getter/setter for from.
 * If set as string value will be treated as percent ('55%') or as 'min' or 'max'.
 * If set as an integer will be treated as value of scale. But will not extend scale.
 * @param {(string|number)=} opt_value From From value. In case of string it can be 'max' or 'min'. In case of number - ratio.
 * @return {string|number|anychart.core.linearGauge.ScaleBar} from or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.from = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.from_ != opt_value) {
      this.from_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.from_;
};


/**
 * Getter/setter for to.
 * If set as string value will be treated as percent ('55%') or as 'min' or 'max'.
 * If set as an integer will be treated as value of scale. But will not extend scale.
 * @param {(string|number)=} opt_value To value. In case of string it can be 'max' or 'min'. In case of number - ratio.
 * @return {string|number|anychart.core.linearGauge.ScaleBar} to or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.to = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.to_ != opt_value) {
      this.to_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.to_;
};


/**
 * Getter/setter for scale.
 * @param {anychart.scales.ScatterBase=} opt_value Scale.
 * @return {anychart.core.linearGauge.ScaleBar|anychart.scales.Base} scale or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
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
  if (!this.scale_)
    this.scale_ = /** @type {anychart.scales.ScatterBase} */ (this.gauge.scale());
  return this.scale_;
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.linearGauge.ScaleBar.prototype.scaleInvalidated_ = function(event) {
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
 * @param {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)=} opt_value Led color scale.
 * @return {anychart.core.linearGauge.ScaleBar|anychart.scales.LinearColor|anychart.scales.OrdinalColor} color scale or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);
      this.fill_ = null;
      this.stroke_ = null;
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
anychart.core.linearGauge.ScaleBar.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Scale bar fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.linearGauge.ScaleBar|acgraph.vector.Fill)} .
 */
anychart.core.linearGauge.ScaleBar.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      if (this.colorScale_) {
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
        this.colorScale_ = null;
      }
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Scale bar stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.core.linearGauge.ScaleBar|acgraph.vector.Stroke)} .
 */
anychart.core.linearGauge.ScaleBar.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      if (this.colorScale_) {
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
        this.colorScale_ = null;
      }
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter/setter for points.
 * @param {Array.<anychart.core.linearGauge.ScaleBar.ControlPoint>=} opt_value points.
 * @return {Array.<anychart.core.linearGauge.ScaleBar.ControlPoint>|anychart.core.linearGauge.ScaleBar} points or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.points = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.points_ != opt_value) {
      this.points_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.points_;
};
//endregion


//region --- POSITION/BOUNDS ---
/**
 * Getter/setter for width.
 * @param {string=} opt_value width.
 * @return {string|anychart.core.linearGauge.ScaleBar} width or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for offset.
 * @param {string=} opt_value offset.
 * @return {string|anychart.core.linearGauge.ScaleBar} offset or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.offset = function(opt_value) {
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
anychart.core.linearGauge.ScaleBar.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
};


/**
 * Getter/setter for pointer layout.
 * @param {anychart.enums.Layout=} opt_value Layout.
 * @return {string|anychart.core.linearGauge.ScaleBar} Layout or self for chaining.
 */
anychart.core.linearGauge.ScaleBar.prototype.layout = function(opt_value) {
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
anychart.core.linearGauge.ScaleBar.prototype.isVertical = function() {
  return this.layout_ == anychart.enums.Layout.VERTICAL;
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.linearGauge.ScaleBar.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.parent(null);
};


/**
 * Returns finalized value for from/to values.
 * @param {*} value
 * @param {number} defaultValue Number that should be returned by default.
 * @return {number} Finalized value (ratio) for from/to.
 */
anychart.core.linearGauge.ScaleBar.prototype.getValue = function(value, defaultValue) {
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
anychart.core.linearGauge.ScaleBar.prototype.applyRatioToBounds = function(ratio, opt_bounds, opt_isVertical) {
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
 * @param {anychart.core.linearGauge.ScaleBar.ControlPoint} a Set of control points.
 * @param {anychart.core.linearGauge.ScaleBar.ControlPoint} b Set of control points.
 * @return {number}
 */
anychart.core.linearGauge.ScaleBar.POINTS_COMPARE = function(a, b) {
  return a['height'] - b['height'];
};


/**
 * Calculates coordinates.
 * @param {number} ratio1 Ratio.
 * @param {number} ratio2 Ratio.
 * @param {anychart.math.Rect} scaleBarBounds Shape bounds.
 * @return {Array}
 */
anychart.core.linearGauge.ScaleBar.prototype.getXY = function(ratio1, ratio2, scaleBarBounds) {
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
anychart.core.linearGauge.ScaleBar.prototype.createClipPath_ = function(scaleBarBounds) {
  var xy, i;
  var isInverted = this.scale().inverted();
  var left, right, height;
  left = isInverted ? 1 - this.points_[0]['left'] : this.points_[0]['left'];
  height = isInverted ? 1 - this.points_[0]['height'] : this.points_[0]['height'];
  xy = this.getXY(left, height, scaleBarBounds);
  this.clipPath_.moveTo(xy[0], xy[1]);
  for (i = 1; i < this.points_.length; i++) {
    left = isInverted ? 1 - this.points_[i]['left'] : this.points_[i]['left'];
    height = isInverted ? 1 - this.points_[i]['height'] : this.points_[i]['height'];
    xy = this.getXY(left, height, scaleBarBounds);
    this.clipPath_.lineTo(xy[0], xy[1]);
  }
  for (i = this.points_.length; i--;) {
    right = isInverted ? this.points_[i]['right'] : 1 - this.points_[i]['right'];
    height = isInverted ? 1 - this.points_[i]['height'] : this.points_[i]['height'];
    xy = this.getXY(right, height, scaleBarBounds);
    this.clipPath_.lineTo(xy[0], xy[1]);
  }
  this.clipPath_.close();
};


/**
 * Draws scale bar.
 * @return {anychart.core.linearGauge.ScaleBar} Self.
 */
anychart.core.linearGauge.ScaleBar.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var i;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  if (!this.points_)
    this.points_ = [];
  goog.array.sort(this.points_, anychart.core.linearGauge.ScaleBar.POINTS_COMPARE);
  if (!this.points_[0] || this.points_[0]['height'] != 0) {
    this.points_.unshift({
      'height': 0,
      'left': 0,
      'right': 0
    });
  }
  if (!this.points_[this.points_.length - 1] || this.points_[this.points_.length - 1]['height'] != 1) {
    this.points_.push({
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
    var from = this.getValue(this.from(), 0);
    var to = this.getValue(this.to(), 1);
    if (from > to) {
      var tmp = from;
      from = to;
      to = tmp;
    }

    this.pixelFrom_ = this.applyRatioToBounds(from);
    this.pixelTo_ = this.applyRatioToBounds(to);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var colorScale = /** @type {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)} */ (this.colorScale());
  var x, y;
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
    if (colorScale instanceof anychart.scales.LinearColor) {
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
    } else if (colorScale instanceof anychart.scales.OrdinalColor) {
      if (colorScale.needsAutoCalc())
        colorScale.startAutoCalc().extendDataRange(0, 1).finishAutoCalc();
      var ranges = colorScale.getProcessedRanges();
      var parentBound = isVertical ? height : width;
      var partLength = parentBound / ranges.length;
      var len;
      var pos;
      for (i = 0, len = ranges.length; i < len; i++) {
        var range = ranges[i];
        var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];
        path = this.paths[i] ? this.paths[i] : this.paths[i] = this.rootLayer.path();
        var shift = 0.5;

        if (isVertical) {
          pos = inverted ? i : (ranges.length - 1 - i);
          y = top + partLength * pos;
          path
              .moveTo(left, y)
              .lineTo(left, y + partLength + shift)
              .lineTo(right, y + partLength + shift)
              .lineTo(right, y)
              .close();
        } else {
          pos = inverted ? (ranges.length - 1 - i) : i;
          x = left + partLength * pos;
          path
              .moveTo(x, top)
              .lineTo(x + partLength + shift, top)
              .lineTo(x + partLength + shift, bottom)
              .lineTo(x, bottom)
              .close();
        }
        path.fill(color).stroke('none');
      }
      this.rootLayer.clip(this.clipPath_);
    } else if (!colorScale) {
      fill = this.fill();
      stroke = this.stroke();
      path = this.paths[0] ? this.paths[0] : this.paths[0] = this.rootLayer.path();
      path
          .moveTo(left, top)
          .lineTo(right, top)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top)
          .close();
      path.fill(fill).stroke(stroke).clip(this.clipPath_);
    }

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};
//endregion


//region --- SETUP/DISPOSING ---
/** @inheritDoc */
anychart.core.linearGauge.ScaleBar.prototype.serialize = function() {
  var json = anychart.core.linearGauge.ScaleBar.base(this, 'serialize');
  json['from'] = this.from();
  json['to'] = this.to();
  json['width'] = this.width();
  json['offset'] = this.offset();

  json['points'] = this.points();

  if (goog.isFunction(this.fill())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['ScaleBar fill']
    );
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.stroke())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['ScaleBar stroke']
    );
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (this.colorScale()) {
    json['colorScale'] = this.colorScale().serialize();
    delete json['fill'];
    delete json['stroke'];
  }

  return json;
};


/** @inheritDoc */
anychart.core.linearGauge.ScaleBar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.linearGauge.ScaleBar.base(this, 'setupByJSON', config, opt_default);
  this.from(config['from']);
  this.to(config['to']);
  this.width(config['width']);
  this.offset(config['offset']);
  this.points(config['points']);
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
      this.colorScale(/** @type {anychart.scales.LinearColor|anychart.scales.OrdinalColor} */ (scale));
  }
  this.fill(config['fill']);
  this.stroke(config['stroke']);
};


/** @inheritDoc */
anychart.core.linearGauge.ScaleBar.prototype.disposeInternal = function() {
  if (this.paths) {
    goog.disposeAll(this.paths);
    this.paths = null;
  }
  goog.dispose(this.colorScale_);
  this.colorScale_ = null;
  this.points_ = [];

  goog.dispose(this.clipPath_);
  this.clipPath_ = null;

  if (this.scale_)
    this.scale_.unlistenSignals(this.scaleInvalidated_, this);
  this.scale_ = null;

  anychart.core.linearGauge.ScaleBar.base(this, 'disposeInternal');
};
//endregion

//exports
(function() {
  var proto = anychart.core.linearGauge.ScaleBar.prototype;
  proto['from'] = proto.from;
  proto['to'] = proto.to;
  proto['width'] = proto.width;
  proto['offset'] = proto.offset;
  proto['scale'] = proto.scale;
  proto['colorScale'] = proto.colorScale;
  proto['fill'] = proto.fill;
  proto['stroke'] = proto.stroke;
  proto['points'] = proto.points;
})();
