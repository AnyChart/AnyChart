goog.provide('anychart.core.linearGauge.pointers.Led');
goog.require('anychart.core.linearGauge.pointers.Base');



/**
 * Led pointer class.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.linearGauge.pointers.Base}
 * @constructor
 */
anychart.core.linearGauge.pointers.Led = function(gauge, dataIndex) {
  anychart.core.linearGauge.pointers.Led.base(this, 'constructor', gauge, dataIndex);

  /**
   * @type {?(string|number)}
   * @private
   */
  this.gap_ = null;

  /**
   * @type {?(string|number)}
   * @private
   */
  this.size_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.count_ = null;

  /**
   * @type {Object.<string, acgraph.vector.Path>}
   * @private
   */
  this.colorsToPath_ = {};

  /** @inheritDoc */
  this.BOUNDS_DEPENDENT_STATES |= anychart.ConsistencyState.GAUGE_COLOR_SCALE;

  /**
   * Current state of 'gap-size-count' finite automation
   * @type {string}
   * @private
   */
  this.gscState_ = '';
};
goog.inherits(anychart.core.linearGauge.pointers.Led, anychart.core.linearGauge.pointers.Base);


//region --- STATES/SIGNALS ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.linearGauge.pointers.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.GAUGE_COLOR_SCALE;
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.createShapes = function() {
  this.dropColorsToPath();
  if (!this.hatch)
    this.hatch = this.rootLayer.path().zIndex(99);
  else
    this.hatch.clear();

  /**
   * Interactive layer which handles mouse events for pointer.
   */
  if (!this.interactiveLayer_) {
    this.interactiveLayer_ = this.rootLayer.rect()
        .zIndex(100)
        .stroke('none')
        .fill(anychart.color.TRANSPARENT_HANDLER);
  }
  this.makeInteractive(this.interactiveLayer_);
};


/**
 * Drops colorsToPath cache.
 */
anychart.core.linearGauge.pointers.Led.prototype.dropColorsToPath = function() {
  for (var color in this.colorsToPath_) {
    goog.dispose(this.colorsToPath_[color]);
  }
  this.colorsToPath_ = {};
};


/**
 * Resolves color scale invalidation state.
 */
anychart.core.linearGauge.pointers.Led.prototype.resolveColorScaleInvalidation = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_COLOR_SCALE)) {
    if (this.colorScale_) {
      if (this.colorScale_.needsAutoCalc()) {
        this.colorScale_.startAutoCalc();
        this.colorScale_.extendDataRange(this.scale().minimum(), this.scale().maximum());
        this.colorScale_.finishAutoCalc();
      } else {
        this.colorScale_.resetDataRange();
        this.colorScale_.extendDataRange(this.scale().minimum(), this.scale().maximum());
      }
    }
    this.markConsistent(anychart.ConsistencyState.GAUGE_COLOR_SCALE);
  }
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.drawVertical = function() {
  var color;
  var dh, ratio;
  this.dropColorsToPath();
  this.resolveColorScaleInvalidation();
  var bounds = /** @type {!anychart.math.Rect} */ (this.parentBounds());
  this.pointerBounds = bounds;
  this.interactiveLayer_.setBounds(bounds);

  var isVertical = this.isVertical();
  var height = isVertical ? bounds.height : bounds.width;

  var gap = anychart.utils.normalizeSize(/** @type {string|number} */ (this.gap()), height);
  var size = anychart.utils.normalizeSize(/** @type {string|number} */ (this.size()), height);
  var count = anychart.utils.normalizeSize(/** @type {string|number} */ (this.count()), height);

  if (!isNaN(gap) && !isNaN(size)) {
    // calculate how many indicators can be drawn with given size and gap
    count = Math.floor((height + gap) / (size + gap));

    // adjusting size and gap
    dh = height - (count * (size + gap) - gap);
    ratio = height / (height - dh);

    size = size * ratio;
    gap = gap * ratio;

  } else if (!isNaN(gap) && !isNaN(count)) {
    size = (height - (count - 1) * gap) / count;

  } else if (!isNaN(size) && !isNaN(count)) {
    gap = (height - count * size) / (count - 1);
  }

  var left, right, top, bottom;
  var ledRatio, botRatio;
  var currentColor = null;
  var path;
  var criteria;

  if (isVertical) {
    left = bounds.left;
    right = bounds.left + bounds.width;
    top = bounds.top + bounds.height - size;
    bottom = top + size;
  } else {
    left = bounds.left;
    right = left + size;
    top = bounds.top;
    bottom = bounds.top + bounds.height;
  }

  var value;
  ledRatio = this.getEndRatio();

  for (var i = 0; i < count; i++) {
    botRatio = anychart.math.round(goog.math.clamp(this.getRatioByBound(isVertical ? bottom : left), 0, 1), 7);
    ratio = anychart.math.round(goog.math.clamp(this.getRatioByBound(isVertical ? top : right), 0, 1), 7);
    value = this.scale_.inverseTransform(ratio);
    color = this.colorScale_.valueToColor(value);
    criteria = this.scale_.inverted() ? ratio <= ledRatio : botRatio >= ledRatio;
    if (criteria && goog.isFunction(this.dimmer_))
      color = this.dimmer_.call({'color' : color}, color);
    if (goog.isNull(color))
      color = 'none';
    if (goog.isNull(currentColor)) {
      currentColor = color;
      if (!(color in this.colorsToPath_))
        this.colorsToPath_[color] = this.rootLayer.path().clear();
      else
        path = this.colorsToPath_[color].clear();
      path = this.colorsToPath_[color];
    } else {
      if (color != currentColor) {
        currentColor = color;
        if (!(color in this.colorsToPath_))
          this.colorsToPath_[color] = this.rootLayer.path().clear();
        else
          path = this.colorsToPath_[color].clear();
      }
      path = this.colorsToPath_[color];
    }

    path
        .moveTo(left, top)
        .lineTo(right, top)
        .lineTo(right, bottom)
        .lineTo(left, bottom)
        .lineTo(left, top);
    if (!criteria)
      this.hatch
          .moveTo(left, top)
          .lineTo(right, top)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top);

    if (isVertical) {
      bottom = top - gap;
      top = bottom - size;
    } else {
      left = right + gap;
      right = left + size;
    }
  }
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.drawHorizontal = anychart.core.linearGauge.pointers.Led.prototype.drawVertical;


/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.colorizePointer = function(pointerState) {
  for (var color in this.colorsToPath_) {
    this.colorsToPath_[color].stroke('none').fill(color);
  }

  var hatch = this.getFinalHatchFill(true, pointerState);
  this.hatch.stroke('none').fill(hatch);
};
//endregion


//region --- INHERITED API ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.LED;
};
//endregion


//region --- OWN/SPECIFIC API ---
/**
 * Calculates ratio by given bound.
 * @param {number} bound Bound.
 * @return {number} Ratio.
 */
anychart.core.linearGauge.pointers.Led.prototype.getRatioByBound = function(bound) {
  var bounds = this.parentBounds();
  var min, range;
  if (this.isVertical()) {
    min = bounds.getBottom();
    range = -bounds.height;
  } else {
    min = bounds.left;
    range = bounds.width;
  }
  return (bound - min) / range;
};


/**
 * Getter/setter for dimmer.
 * @param {Function=} opt_value dimmer.
 * @return {Function|anychart.core.linearGauge.pointers.Led} dimmer or self for chaining.
 */
anychart.core.linearGauge.pointers.Led.prototype.dimmer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.dimmer_ != opt_value) {
      this.dimmer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.dimmer_;
};


/**
 * Finite automation for gap, size and count settings. Allows to exist only two of these three settings.
 * @param {string} propLetter Property letter.
 */
anychart.core.linearGauge.pointers.Led.prototype.updateGscState = function(propLetter) {
  if (this.gscState_.length < 2) {
    // Initialization before first render
    this.gscState_ += propLetter;

  } else if (this.gscState_.charAt(1) != propLetter) {
    var pop = this.gscState_.charAt(0);
    this.gscState_ = (this.gscState_ + propLetter).slice(1);

    if (pop != propLetter) {
      switch (pop) {
        case 'g':
          this.gap_ = null;
          break;
        case 's':
          this.size_ = null;
          break;
        case 'c':
          this.count_ = null;
          break;
      }
    }
  }
};


/**
 * Getter/setter for led gap.
 * @param {number|string=} opt_value Led gap.
 * @return {number|string|anychart.core.linearGauge.pointers.Led} Gap or self for chaining.
 */
anychart.core.linearGauge.pointers.Led.prototype.gap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value, true);
    if (opt_value) {
      this.updateGscState('g');

      if (this.gap_ != opt_value) {
        this.gap_ = opt_value;
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.gap_;
};


/**
 * Getter/setter for led size.
 * @param {number|string=} opt_value Led size.
 * @return {number|string|anychart.core.linearGauge.pointers.Led} Size or self for chaining.
 */
anychart.core.linearGauge.pointers.Led.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value, true);
    if (opt_value) {
      this.updateGscState('s');

      if (this.size_ != opt_value) {
        this.size_ = opt_value;
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.size_;
};


/**
 * Getter/setter for led interval.
 * @param {number=} opt_value Led interval.
 * @return {number|anychart.core.linearGauge.pointers.Led} Interval or self for chaining.
 */
anychart.core.linearGauge.pointers.Led.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, NaN);
    if (!isNaN(opt_value)) {
      this.updateGscState('c');

      if (this.count_ != opt_value) {
        this.count_ = opt_value;
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  }
  return this.count_;
};


/**
 * Getter/setter for led color scale.
 * @param {(anychart.scales.LinearColor|anychart.scales.OrdinalColor)=} opt_value Led color scale.
 * @return {anychart.core.linearGauge.pointers.Led} Color scale or self for chaining.
 */
anychart.core.linearGauge.pointers.Led.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.linearGauge.pointers.Led.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
  }
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.serialize = function() {
  var json = anychart.core.linearGauge.pointers.Led.base(this, 'serialize');

  if (this.gscState_.indexOf('g') != -1)
    json['gap'] = this.gap_;

  if (this.gscState_.indexOf('s') != -1)
    json['size'] = this.size_;

  if (this.gscState_.indexOf('c') != -1)
    json['count'] = this.count_;

  json['colorScale'] = this.colorScale().serialize();

  if (goog.isFunction(this.dimmer())) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Pointer dimmer']
    );
  } else {
    json['dimmer'] = this.dimmer();
  }

  return json;
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.linearGauge.pointers.Led.base(this, 'setupByJSON', config, opt_default);

  this.gap(config['gap']);
  this.size(config['size']);
  this.count(config['count']);
  this.dimmer(config['dimmer']);

  if ('colorScale' in config) {
    var json = config['colorScale'];
    var scale = null;
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
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Led.prototype.disposeInternal = function() {
  goog.dispose(this.interactiveLayer_);
  this.interactiveLayer_ = null;

  this.dropColorsToPath();

  goog.dispose(this.colorScale_);
  this.colorScale_ = null;
  anychart.core.linearGauge.pointers.Led.base(this, 'disposeInternal');
};
//endregion


//exports
(function() {
  var proto = anychart.core.linearGauge.pointers.Led.prototype;
  proto['dimmer'] = proto.dimmer;
  proto['gap'] = proto.gap;
  proto['size'] = proto.size;
  proto['count'] = proto.count;
  proto['colorScale'] = proto.colorScale;
})();
