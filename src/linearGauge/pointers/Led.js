goog.provide('anychart.linearGaugeModule.pointers.Led');
goog.require('anychart.color');
goog.require('anychart.linearGaugeModule.pointers.Base');



/**
 * Led pointer class.
 * @extends {anychart.linearGaugeModule.pointers.Base}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Led = function() {
  anychart.linearGaugeModule.pointers.Led.base(this, 'constructor');

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
   * Contains path and it's fill by color hash.
   * @type {Object.<string, Array>}
   * @private
   */
  this.coloringMeta_ = {};

  /** @inheritDoc */
  this.BOUNDS_DEPENDENT_STATES |= anychart.ConsistencyState.GAUGE_COLOR_SCALE;

  /**
   * Current state of 'gap-size-count' finite automation
   * @type {string}
   * @private
   */
  this.gscState_ = '';

  function getBeforeInvalidationHook(propLetter) {
    return (function() {
      this.updateGscState(propLetter);
    });
  }

  function gapSizeComparator(oldValue, newValue) {
    return (newValue != oldValue && newValue);
  }

  function countComparator(oldValue, newValue) {
    return (newValue != oldValue && !isNaN(newValue));
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['dimmer', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0],
    ['gap', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, getBeforeInvalidationHook('g'), this, gapSizeComparator],
    ['size', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, getBeforeInvalidationHook('s'), this, gapSizeComparator],
    ['count', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, getBeforeInvalidationHook('c'), this, countComparator]
  ]);
};
goog.inherits(anychart.linearGaugeModule.pointers.Led, anychart.linearGaugeModule.pointers.Base);


//region --- STATES/SIGNALS ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.linearGaugeModule.pointers.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.GAUGE_COLOR_SCALE;


//endregion
//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.createShapes = function() {
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
anychart.linearGaugeModule.pointers.Led.prototype.dropColorsToPath = function() {
  for (var colorHash in this.coloringMeta_) {
    goog.dispose(this.coloringMeta_[colorHash][0]);
  }
  this.coloringMeta_ = {};
};


/**
 * Resolves color scale invalidation state.
 */
anychart.linearGaugeModule.pointers.Led.prototype.resolveColorScaleInvalidation = function() {
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
anychart.linearGaugeModule.pointers.Led.prototype.drawVertical = function() {
  var color;
  var dh, ratio;
  this.dropColorsToPath();
  this.resolveColorScaleInvalidation();
  var bounds = /** @type {!anychart.math.Rect} */ (this.parentBounds());
  this.pointerBounds = bounds;
  this.interactiveLayer_.setBounds(bounds);

  var isVertical = this.isVertical();
  var height = isVertical ? bounds.height : bounds.width;

  var gap = anychart.utils.normalizeSize(/** @type {string|number} */ (this.getOption('gap')), height);
  var size = anychart.utils.normalizeSize(/** @type {string|number} */ (this.getOption('size')), height);
  var count = anychart.utils.normalizeSize(/** @type {string|number} */ (this.getOption('count')), height);

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
    if (criteria) {
      var dimmer = this.getOption('dimmer');
      color = /** @type {string} */(goog.isFunction(dimmer) ? dimmer.call({'color' : color}, color) : dimmer);
    }
    var colorHash = anychart.color.hash(color);
    if (goog.isNull(color))
      color = 'none';

    if (goog.isNull(currentColor) || (color != currentColor)) {
      currentColor = color;
      if (!(colorHash in this.coloringMeta_)) {
        this.coloringMeta_[colorHash] = [this.rootLayer.path(), color];
      } else {
        this.coloringMeta_[colorHash][0].clear();
      }
    }

    path = this.coloringMeta_[colorHash][0];

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
anychart.linearGaugeModule.pointers.Led.prototype.drawHorizontal = anychart.linearGaugeModule.pointers.Led.prototype.drawVertical;


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.colorizePointer = function(pointerState) {
  var meta;
  for (var colorHash in this.coloringMeta_) {
    meta = this.coloringMeta_[colorHash];
    meta[0].stroke('none').fill(meta[1]);
  }

  var hatch = /** @type {acgraph.vector.Fill} */ (this.hatchFillResolver(this, pointerState, false));
  this.hatch.stroke('none').fill(hatch);
};


//endregion
//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.LED;
};


//endregion
//region --- OWN/SPECIFIC API ---
/**
 * Calculates ratio by given bound.
 * @param {number} bound Bound.
 * @return {number} Ratio.
 */
anychart.linearGaugeModule.pointers.Led.prototype.getRatioByBound = function(bound) {
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
 * Initializes gsc state from own\theme settings.
 */
anychart.linearGaugeModule.pointers.Led.prototype.initGscFromOptions = function() {
  var g = this.getOption('gap');
  var s = this.getOption('size');
  var c = this.getOption('count');
  if (goog.isDef(g) && !goog.isNull(g)) this.updateGscState('g');
  if (goog.isDef(s) && !goog.isNull(s)) this.updateGscState('s');
  if (goog.isDef(c) && !goog.isNull(c)) this.updateGscState('c');
};


/**
 * Finite automation for gap, size and count settings. Allows to exist only two of these three settings.
 * @param {string} propLetter Property letter.
 */
anychart.linearGaugeModule.pointers.Led.prototype.updateGscState = function(propLetter) {
  var gscState = this.gscState_;
  if (gscState.length < 2) {
      // Initialization before first render
      this.gscState_ += propLetter;
  } else if (gscState.charAt(1) != propLetter) {
    var pop = gscState.charAt(0);
    gscState = (gscState + propLetter).slice(1);
    this.gscState_ = gscState;

    if (pop != propLetter) {
      switch (pop) {
        case 'g':
          this.setOption('gap', null);
          break;
        case 's':
          this.setOption('size', null);
          break;
        case 'c':
          this.setOption('count', null);
          break;
      }
    }
  }
};


/**
 * Properties that should be defined in anychart.linearGaugeModule.pointers.Led prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.pointers.Led.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function percentNormalizer(value) {
      return anychart.utils.normalizeToPercent(value, true);
  }

  function naturalNumberWithoutZeroNormalizer(value) {
    return anychart.utils.normalizeToNaturalNumber(value, NaN);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'dimmer', anychart.core.settings.fillOrFunctionSimpleNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'gap', percentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', percentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'count', naturalNumberWithoutZeroNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.pointers.Led, anychart.linearGaugeModule.pointers.Led.OWN_DESCRIPTORS);


/**
 * Getter/setter for led color scale.
 * @param {(anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal|Object|anychart.enums.ScaleTypes)=} opt_value Led color scale.
 * @return {anychart.linearGaugeModule.pointers.Led} Color scale or self for chaining.
 */
anychart.linearGaugeModule.pointers.Led.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) && this.colorScale_) {
      this.colorScale_ = null;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
    } else {
      var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null,
          anychart.scales.Base.ScaleTypes.COLOR_SCALES, null, this.colorScaleInvalidated_, this);
      if (val) {
        var dispatch = this.colorScale_ == val;
        this.colorScale_ = val;
        this.setupCreated('colorScale', this.colorScale_);
        this.colorScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch) {
          this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
        }
      }
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
anychart.linearGaugeModule.pointers.Led.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GAUGE_COLOR_SCALE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.pointers.Led.base(this, 'serialize');

  json['colorScale'] = this.colorScale().serialize();

  anychart.core.settings.serialize(this, anychart.linearGaugeModule.pointers.Led.OWN_DESCRIPTORS, json, 'Led pointer');

  return json;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.pointers.Led.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.pointers.Led.OWN_DESCRIPTORS, config, opt_default);

  this.initGscFromOptions();

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
      this.colorScale(/** @type {anychart.colorScalesModule.Linear|anychart.colorScalesModule.Ordinal} */ (scale));
  }
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Led.prototype.disposeInternal = function() {
  goog.dispose(this.interactiveLayer_);
  this.interactiveLayer_ = null;

  this.dropColorsToPath();

  // we can't dispose color scale because it may be user-created instance
  // goog.dispose(this.colorScale_);
  // this.colorScale_ = null;
  anychart.linearGaugeModule.pointers.Led.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.linearGaugeModule.pointers.Led.prototype;
  proto['colorScale'] = proto.colorScale;
  //auto
  //proto['gap'] = proto.gap;
  //proto['size'] = proto.size;
  //proto['count'] = proto.count;
})();
