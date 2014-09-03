goog.provide('anychart.elements.TextMarker');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.elements.Text');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.math');



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
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.TextMarkerAlign}
   * @private
   */
  this.align_;

  /**
   * @type {anychart.enums.Anchor}
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
/**
 * Getter for the axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.elements.TextMarker} An instance of the {@link anychart.elements.TextMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.TextMarker} Axis scale or itself for method chaining.
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
 * Getter for parentBounds.
 * @return {acgraph.math.Rect} Current parent bounds.
 *//**
 * Setter for parentBounds.
 * @param {acgraph.math.Rect=} opt_value Value to set.
 * @return {!anychart.elements.TextMarker} An instance of the {@link anychart.elements.TextMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.TextMarker} Bounds or this.
 */
anychart.elements.TextMarker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value ? opt_value.clone().round() : null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.parentBounds_;
  }
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.VisualBase|anychart.utils.Padding)} .
 */
anychart.elements.TextMarker.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.axesLinesSpace_.set.apply(this.axesLinesSpace_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Padding) {
      this.axesLinesSpace_.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.axesLinesSpace_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.axesLinesSpace_.set(opt_spaceOrTopOrTopAndBottom);
    }
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/Set align.
 * @param {anychart.enums.TextMarkerAlign=} opt_value TextMarker align.
 * @return {anychart.enums.TextMarkerAlign|anychart.elements.TextMarker} Align or this.
 */
anychart.elements.TextMarker.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var align = anychart.enums.normalizeTextMarkerAlign(opt_value);
    if (this.align_ != align) {
      this.align_ = align;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value TextMarker layout.
 * @return {anychart.enums.Layout|anychart.elements.TextMarker} Layout or this.
 */
anychart.elements.TextMarker.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_;
  }
};


/**
 * Get/set text marker anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Text marker anchor settings.
 * @return {anychart.elements.TextMarker|anychart.enums.Anchor} Text marker anchor settings or itself for method chaining.
 */
anychart.elements.TextMarker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
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
 * Get/Set text marker settings.
 * @param {(string)=} opt_value TextMarker text settings.
 * @return {string|anychart.elements.TextMarker} TextMarker line settings or TextMarker instance for method chaining.
 */
anychart.elements.TextMarker.prototype.text = function(opt_value) {
  return /** @type {anychart.elements.TextMarker|string} */(this.textSettings('text', opt_value));
};


/**
 * Get/set value.
 * @param {number=} opt_newValue TextMarker value settings.
 * @return {number|anychart.elements.TextMarker} TextMarker value settings or LineMarker instance for method chaining.
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
 * @return {number|string|anychart.elements.TextMarker} TextMarker value settings or TextMarker instance for method chaining.
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
 * @return {number|string|anychart.elements.TextMarker} TextMarker value settings or TextMarker instance for method chaining.
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
 * Getter for separator width.
 * @return {number|string|null} Current width.
 *//**
 * Setter for separator width.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.TextMarker} An instance of the {@link anychart.elements.TextMarker} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for separator height.
 * @return {number|string|null} Current height.
 *//**
 * Setter for separator height.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.TextMarker} An instance of the {@link anychart.elements.TextMarker} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Defines marker layout
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.TextMarker.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
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
    var ratio = goog.math.clamp(scale.transform(this.value_, 0.5), 0, 1);
    if (isNaN(ratio)) return;

    var shift = -.5;

    var parentBounds = /** @type {acgraph.math.Rect} */(this.parentBounds());
    var anchor = /** @type {anychart.enums.Anchor} */(this.anchor());

    var textElement = this.markerElement();
    textElement.width(null);
    textElement.height(null);

    var isWidthSet = !goog.isNull(this.width());
    var isHeightSet = !goog.isNull(this.height());

    var textElementBounds = textElement.getBounds();

    var width = isWidthSet ?
        Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(this.width()), parentBounds.width)) :
        textElementBounds.width;
    if (isWidthSet) textElement.width(width);

    textElementBounds = textElement.getBounds();

    var height = isHeightSet ?
        Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(this.height()), parentBounds.height)) :
        textElementBounds.height;
    if (isHeightSet) textElement.height(height);

    var position = /** @type {acgraph.math.Coordinate}*/(this.getTextPosition_(ratio, shift));
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, width, height),
        anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = anychart.utils.normalizeSize(/** @type {number|string} */(this.offsetX()), width);
    var offsetY = anychart.utils.normalizeSize(/** @type {number|string} */(this.offsetY()), height);

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
 * Calculates text position using layout and align.
 * @param {number} ratio Scale ratio.
 * @param {number} shift Pixel shift.
 * @return {acgraph.math.Coordinate} text position.
 * @private
 */
anychart.elements.TextMarker.prototype.getTextPosition_ = function(ratio, shift) {
  var x, y;
  var parentBounds = this.parentBounds();
  switch (this.layout_) {
    default:
    case anychart.enums.Layout.HORIZONTAL:
      y = Math.round(parentBounds.getTop() + parentBounds.height - (ratio * parentBounds.height));
      ratio == 1 ? y -= shift : y += shift;
      if (this.align_ == anychart.enums.TextMarkerAlign.NEAR) {
        x = parentBounds.getLeft();
      } else if (this.align_ == anychart.enums.TextMarkerAlign.CENTER) {
        x = parentBounds.getLeft() + parentBounds.width / 2;
      } else {
        x = parentBounds.getRight();
      }
      break;
    case anychart.enums.Layout.VERTICAL:
      x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
      ratio == 1 ? x += shift : x -= shift;
      if (this.align_ == anychart.enums.TextMarkerAlign.NEAR) {
        y = parentBounds.getBottom();
      } else if (this.align_ == anychart.enums.TextMarkerAlign.CENTER) {
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
  this.zIndex(27);
  this.layout(anychart.enums.Layout.HORIZONTAL);
  this.align(anychart.enums.TextMarkerAlign.CENTER);
  this.anchor(anychart.enums.Anchor.CENTER);
  this.value(0);
  this.text('Text marker');
  this.offsetX(0);
  this.offsetY(0);
  this.width(null);
  this.height(null);
  this.fontFamily('Tahoma');
  this.fontSize('11');
  this.fontWeight('bold');
  this.fontColor('#222222');
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
  data['layout'] = this.layout();
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
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  this.textSettings(value);

  this.layout(value['layout']);
  this.align(value['align']);
  this.anchor(value['anchor']);
  this.value(value['value']);
  this.offsetX(value['offsetX']);
  this.offsetY(value['offsetY']);
  this.text(value['text']);
  this.width(value['width']);
  this.height(value['height']);

  this.resumeSignalsDispatching(true);
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


/**
 * Constructor function.
 * @return {!anychart.elements.TextMarker}
 */
anychart.elements.textMarker = function() {
  return new anychart.elements.TextMarker();
};


//exports
goog.exportSymbol('anychart.elements.textMarker', anychart.elements.textMarker);
anychart.elements.TextMarker.prototype['value'] = anychart.elements.TextMarker.prototype.value;
anychart.elements.TextMarker.prototype['scale'] = anychart.elements.TextMarker.prototype.scale;
anychart.elements.TextMarker.prototype['parentBounds'] = anychart.elements.TextMarker.prototype.parentBounds;
anychart.elements.TextMarker.prototype['anchor'] = anychart.elements.TextMarker.prototype.anchor;
anychart.elements.TextMarker.prototype['align'] = anychart.elements.TextMarker.prototype.align;
anychart.elements.TextMarker.prototype['layout'] = anychart.elements.TextMarker.prototype.layout;
anychart.elements.TextMarker.prototype['offsetX'] = anychart.elements.TextMarker.prototype.offsetX;
anychart.elements.TextMarker.prototype['offsetY'] = anychart.elements.TextMarker.prototype.offsetY;
anychart.elements.TextMarker.prototype['text'] = anychart.elements.TextMarker.prototype.text;
anychart.elements.TextMarker.prototype['height'] = anychart.elements.TextMarker.prototype.height;
anychart.elements.TextMarker.prototype['width'] = anychart.elements.TextMarker.prototype.width;
anychart.elements.TextMarker.prototype['draw'] = anychart.elements.TextMarker.prototype.draw;
anychart.elements.TextMarker.prototype['isHorizontal'] = anychart.elements.TextMarker.prototype.isHorizontal;
