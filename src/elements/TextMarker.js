goog.provide('anychart.elements.TextMarker');
goog.require('anychart.elements.Text');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.elements.Text}
 */
anychart.elements.TextMarker = function() {
  goog.base(this);

  /**
   * @type {acgraph.vector.Text}
   * @private
   */
  this.markerElement_;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.scale_;

  /**
   * @type {acgraph.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * @type {anychart.utils.Orientation}
   * @private
   */
  this.orientation_;

  /**
   * @type {anychart.elements.TextMarker.Align}
   * @private
   */
  this.align_;

  /**
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_;

  /**
   * @type {number}
   * @private
   */
  this.value_;

  /**
   * @type {string|number}
   * @private
   */
  this.offsetX_;

  /**
   * @type {string|number}
   * @private
   */
  this.offsetY_;

  /**
   * @type {?(string|number)}
   * @private
   */
  this.width_ = null;

  /**
   * @type {?(string|number)}
   * @private
   */
  this.height_ = null;

  this.restoreDefaults();
};
goog.inherits(anychart.elements.TextMarker, anychart.elements.Text);


//----------------------------------------------------------------------------------------------------------------------
//  Enums.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Определяет положение маркера относительно оси
 * @enum {string}
 */
anychart.elements.TextMarker.Align = {
  NEAR: 'near',
  CENTER: 'center',
  FAR: 'far'
};


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.TextMarker.prototype.SUPPORTED_SIGNALS =
    anychart.elements.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.TextMarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BOUNDS;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/** Gets/sets axis scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.TextMarker} Axis scale or itself for chaining.
 */
anychart.elements.TextMarker.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
    }
    return this;
  } else {
    return this.scale_;
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.TextMarker.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS;

  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//  Bounds.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets parentBounds.
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.TextMarker} Bounds or this.
 */
anychart.elements.TextMarker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value ? opt_value.round() : null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.parentBounds_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set align.
 * @param {anychart.elements.TextMarker.Align=} opt_value TextMarker align.
 * @return {anychart.elements.TextMarker.Align|anychart.elements.TextMarker} Align or this.
 */
anychart.elements.TextMarker.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 * Get/set orientation.
 * @param {anychart.utils.Orientation=} opt_value TextMarker orientation.
 * @return {anychart.utils.Orientation|anychart.elements.TextMarker} Orientation or this.
 */
anychart.elements.TextMarker.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.orientation_;
  }
};


/**
 * Get/set text marker anchor settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Text marker anchor settings.
 * @return {anychart.elements.TextMarker|anychart.utils.NinePositions} Text marker anchor settings or itself for chaining call.
 */
anychart.elements.TextMarker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set text marker settings.
 * @param {(string)=} opt_value TextMarker text settings.
 * @return {string|anychart.elements.TextMarker} TextMarker line settings or TextMarker instance for chaining.
 */
anychart.elements.TextMarker.prototype.text = function(opt_value) {
  return /** @type {anychart.elements.TextMarker|string} */(this.textSettings('text', opt_value));
};


/**
 * Get/set value.
 * @param {number=} opt_newValue TextMarker value settings.
 * @return {number|anychart.elements.TextMarker} TextMarker value settings or LineMarker instance for chaining.
 */
anychart.elements.TextMarker.prototype.value = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.value_ != opt_newValue) {
      this.value_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.value_;
  }
};


/**
 * Get/set offset x.
 * @param {(number|string)=} opt_newValue TextMarker value settings.
 * @return {number|string|anychart.elements.TextMarker} TextMarker value settings or TextMarker instance for chaining.
 */
anychart.elements.TextMarker.prototype.offsetX = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.offsetX_ != opt_newValue) {
      this.offsetX_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Get/set offset y.
 * @param {(number|string)=} opt_newValue TextMarker value settings.
 * @return {number|string|anychart.elements.TextMarker} TextMarker value settings or TextMarker instance for chaining.
 */
anychart.elements.TextMarker.prototype.offsetY = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.offsetY_ != opt_newValue) {
      this.offsetY_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter/setter for the width of the text of the marker.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.TextMarker|number|string|null} .
 */
anychart.elements.TextMarker.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter/setter for the height of the text of the marker.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.TextMarker|number|string|null} .
 */
anychart.elements.TextMarker.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/** @inheritDoc */
anychart.elements.TextMarker.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Определяет расположения маркера
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.TextMarker.prototype.isHorizontal = function() {
  return this.orientation_ == anychart.utils.Orientation.TOP ||
      this.orientation_ == anychart.utils.Orientation.BOTTOM;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 */
anychart.elements.TextMarker.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());
  if (!this.checkDrawingNeeded() || !scale)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(this.markerElement(), true);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var isOrdinal = scale instanceof anychart.scales.Ordinal;
    var ratio = scale.transform(this.value_, isOrdinal ? 0.5 : 0);
    if (isNaN(ratio)) return;

    var shift = -.5;

    var parentBounds = /** @type {acgraph.math.Rect} */(this.parentBounds());
    var anchor = /** @type {anychart.utils.NinePositions} */(this.anchor());

    var textElement = this.markerElement();
    textElement.width(null);
    textElement.height(null);

    var isWidthSet = !goog.isNull(this.width());
    var isHeightSet = !goog.isNull(this.height());

    var textElementBounds = textElement.getBounds();

    var width = isWidthSet ?
        Math.ceil(anychart.utils.normalize(/** @type {number|string} */(this.width()), parentBounds.width)) :
        textElementBounds.width;
    if (isWidthSet) textElement.width(width);

    textElementBounds = textElement.getBounds();

    var height = isHeightSet ?
        Math.ceil(anychart.utils.normalize(/** @type {number|string} */(this.height()), parentBounds.height)) :
        textElementBounds.height;
    if (isHeightSet) textElement.height(height);

    var position = /** @type {acgraph.math.Coordinate}*/(this.getTextPosition_(ratio, shift));
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, width, height),
        anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = anychart.utils.normalize(/** @type {number|string} */(this.offsetX()), width);
    var offsetY = anychart.utils.normalize(/** @type {number|string} */(this.offsetY()), height);

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetX, offsetY);
    this.applyTextSettings(textElement, true);

    textElement
        .x(position.x)
        .y(position.y);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.markerElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.markerElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/**
 * Рассчитывает позицию текста по заданныи параметрам orientation и align.
 * @param {number} ratio Scale ratio.
 * @param {number} shift Pixel shift.
 * @return {acgraph.math.Coordinate} text position.
 * @private
 */
anychart.elements.TextMarker.prototype.getTextPosition_ = function(ratio, shift) {
  var x, y;
  var parentBounds = this.parentBounds();
  switch (this.orientation_) {
    default:
    case anychart.utils.Orientation.LEFT:
      y = Math.round(parentBounds.getTop() + parentBounds.height - (ratio * parentBounds.height));
      ratio == 1 ? y -= shift : y += shift;
      if (this.align_ == anychart.elements.TextMarker.Align.NEAR) {
        x = parentBounds.getLeft();
      } else if (this.align_ == anychart.elements.TextMarker.Align.CENTER) {
        x = parentBounds.getLeft() + parentBounds.width / 2;
      } else {
        x = parentBounds.getRight();
      }
      break;
    case anychart.utils.Orientation.TOP:
      x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
      ratio == 1 ? x += shift : x -= shift;
      if (this.align_ == anychart.elements.TextMarker.Align.NEAR) {
        y = parentBounds.getTop();
      } else if (this.align_ == anychart.elements.TextMarker.Align.CENTER) {
        y = parentBounds.getTop() + parentBounds.height / 2;
      } else {
        y = parentBounds.getBottom();
      }
      break;
    case anychart.utils.Orientation.RIGHT:
      y = Math.round(parentBounds.getTop() + parentBounds.height - (ratio * parentBounds.height));
      ratio == 1 ? y -= shift : y += shift;
      if (this.align_ == anychart.elements.TextMarker.Align.NEAR) {
        x = parentBounds.getRight();
      } else if (this.align_ == anychart.elements.TextMarker.Align.CENTER) {
        x = parentBounds.getLeft() + parentBounds.width / 2;
      } else {
        x = parentBounds.getLeft();
      }
      break;
    case anychart.utils.Orientation.BOTTOM:
      x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
      ratio == 1 ? x += shift : x -= shift;
      if (this.align_ == anychart.elements.TextMarker.Align.NEAR) {
        y = parentBounds.getBottom();
      } else if (this.align_ == anychart.elements.TextMarker.Align.CENTER) {
        y = parentBounds.getTop() + parentBounds.height / 2;
      } else {
        y = parentBounds.getTop();
      }
      break;
  }
  return new acgraph.math.Coordinate(x, y);
};


/**
 * Restore defaults.
 */
anychart.elements.TextMarker.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.zIndex(70);
  this.orientation(anychart.utils.Orientation.LEFT);
  this.align(anychart.elements.TextMarker.Align.CENTER);
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.value(0);
  this.text('Text marker');
  this.offsetX(0);
  this.offsetY(0);
  this.width(null);
  this.height(null);
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.TextMarker.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.TextMarker.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['orientation'] = this.orientation();
  data['align'] = this.align();
  data['anchor'] = this.anchor();
  data['value'] = this.value();
  data['offsetX'] = this.offsetX();
  data['offsetY'] = this.offsetY();
  data['text'] = this.text();
  data['width'] = this.width();
  data['height'] = this.height();
  return data;
};


/** @inheritDoc */
anychart.elements.TextMarker.prototype.deserialize = function(value) {
  goog.base(this, 'deserialize', value);
  if (goog.isDef(value['orientation'])) this.orientation(value['orientation']);
  if (goog.isDef(value['align'])) this.align(value['align']);
  if (goog.isDef(value['anchor'])) this.anchor(value['anchor']);
  if (goog.isDef(value['value'])) this.value(value['value']);
  if (goog.isDef(value['offsetX'])) this.offsetX(value['offsetX']);
  if (goog.isDef(value['offsetY'])) this.offsetY(value['offsetY']);
  if (goog.isDef(value['text'])) this.text(value['text']);
  if (goog.isDef(value['width'])) this.width(value['width']);
  if (goog.isDef(value['height'])) this.height(value['height']);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create marker element.
 * @return {!acgraph.vector.Text} AxisMarker line element.
 * @protected
 */
anychart.elements.TextMarker.prototype.markerElement = function() {
  if (!this.markerElement_) {
    this.markerElement_ = acgraph.text();
    this.registerDisposable(this.markerElement_);
  }
  return this.markerElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.TextMarker.prototype.disposeInternal = function() {
  goog.dispose(this.markerElement_);
  this.markerElement_ = null;
  goog.base(this, 'disposeInternal');
};
