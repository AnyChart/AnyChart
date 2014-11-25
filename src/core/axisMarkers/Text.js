goog.provide('anychart.core.axisMarkers.Text');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.Text');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.axisMarkers.Text = function() {
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
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {?number}
   * @private
   */
  this.rotation_ = null;

  /**
   * @type {anychart.enums.Align}
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
goog.inherits(anychart.core.axisMarkers.Text, anychart.core.Text);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
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
 * @return {!anychart.core.axisMarkers.Text} An instance of the {@link anychart.core.axisMarkers.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.core.axisMarkers.Text} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
anychart.core.axisMarkers.Text.prototype.scaleInvalidated_ = function(event) {
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
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.axisMarkers.Text.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.axesLinesSpace_.set.apply(this.axesLinesSpace_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.core.utils.Padding) {
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
 * @param {anychart.enums.Align=} opt_value TextMarker align.
 * @return {anychart.enums.Align|anychart.core.axisMarkers.Text} Align or this.
 */
anychart.core.axisMarkers.Text.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var align = anychart.enums.normalizeAlign(opt_value);
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
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Text} Layout or this.
 */
anychart.core.axisMarkers.Text.prototype.layout = function(opt_value) {
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
 * Get/set rotation in degrees.
 * If null is provided then rotation angle depends on layout: vertical = -90 degrees; horizontal = 0 degrees.
 * @param {?number=} opt_value rotation.
 * @return {number|anychart.core.axisMarkers.Text} Rotation or self for chaining.
 */
anychart.core.axisMarkers.Text.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rotation_ != opt_value) {
      this.rotation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.rotation_;
};


/**
 * Get/set text marker anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Text marker anchor settings.
 * @return {anychart.core.axisMarkers.Text|anychart.enums.Anchor} Text marker anchor settings or itself for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.anchor = function(opt_value) {
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
 * @return {string|anychart.core.axisMarkers.Text} TextMarker line settings or TextMarker instance for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.text = function(opt_value) {
  return /** @type {anychart.core.axisMarkers.Text|string} */(this.textSettings('text', opt_value));
};


/**
 * Get/set value.
 * @param {number=} opt_newValue TextMarker value settings.
 * @return {number|anychart.core.axisMarkers.Text} TextMarker value settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.value = function(opt_newValue) {
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
 * @return {number|string|anychart.core.axisMarkers.Text} TextMarker value settings or TextMarker instance for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.offsetX = function(opt_newValue) {
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
 * @return {number|string|anychart.core.axisMarkers.Text} TextMarker value settings or TextMarker instance for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.offsetY = function(opt_newValue) {
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
 * @return {!anychart.core.axisMarkers.Text} An instance of the {@link anychart.core.axisMarkers.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.axisMarkers.Text|number|string|null} .
 */
anychart.core.axisMarkers.Text.prototype.width = function(opt_value) {
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
 * @return {!anychart.core.axisMarkers.Text} An instance of the {@link anychart.core.axisMarkers.Text} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.axisMarkers.Text|number|string|null} .
 */
anychart.core.axisMarkers.Text.prototype.height = function(opt_value) {
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
anychart.core.axisMarkers.Text.prototype.applyTextSettings = function(textElement, isInitial) {
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
anychart.core.axisMarkers.Text.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.axisMarkers.Text} An instance of {@link anychart.core.axisMarkers.Text} class for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.utils.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(this.markerElement(), true);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var ratio = goog.math.clamp(scale.transform(this.value_, 0.5), 0, 1);
    if (isNaN(ratio)) return this;

    var shift = -.5;

    var parentBounds = /** @type {acgraph.math.Rect} */(this.parentBounds());
    parentBounds = parentBounds.clone().round();
    var anchor = /** @type {anychart.enums.Anchor} */(this.anchor());

    var textElement = this.markerElement();
    textElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);
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

    var angle = anychart.utils.toNumber(this.rotation_);
    var rotation = isNaN(angle) ?
        this.isHorizontal() ?
            0 : -90 :
            angle;

    textElement
        .x(position.x)
        .y(position.y)
        .setRotationByAnchor(rotation);

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

  return this;
};


/**
 * Calculates text position using layout and align.
 * @param {number} ratio Scale ratio.
 * @param {number} shift Pixel shift.
 * @return {acgraph.math.Coordinate} text position.
 * @private
 */
anychart.core.axisMarkers.Text.prototype.getTextPosition_ = function(ratio, shift) {
  var x, y;
  var parentBounds = this.parentBounds();
  parentBounds = parentBounds.clone().round();
  switch (this.layout_) {
    default:
    case anychart.enums.Layout.HORIZONTAL:
      y = Math.round(parentBounds.getTop() + parentBounds.height - (ratio * parentBounds.height));
      ratio == 1 ? y -= shift : y += shift;
      if (this.align_ == anychart.enums.Align.LEFT) {
        x = parentBounds.getLeft();
      } else if (this.align_ == anychart.enums.Align.CENTER) {
        x = parentBounds.getLeft() + parentBounds.width / 2;
      } else {
        x = parentBounds.getRight();
      }
      break;
    case anychart.enums.Layout.VERTICAL:
      x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
      ratio == 1 ? x += shift : x -= shift;
      if (this.align_ == anychart.enums.Align.BOTTOM) {
        y = parentBounds.getBottom();
      } else if (this.align_ == anychart.enums.Align.CENTER) {
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
anychart.core.axisMarkers.Text.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.layout(anychart.enums.Layout.HORIZONTAL);
  this.align(anychart.enums.Align.CENTER);
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
anychart.core.axisMarkers.Text.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.core.axisMarkers.Text.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['layout'] = this.layout();
  data['rotation'] = this.rotation();
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
anychart.core.axisMarkers.Text.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  this.textSettings(value);

  this.layout(value['layout']);
  this.rotation(value['rotation']);
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
anychart.core.axisMarkers.Text.prototype.markerElement = function() {
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
anychart.core.axisMarkers.Text.prototype.disposeInternal = function() {
  goog.dispose(this.markerElement_);
  this.markerElement_ = null;
  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.axisMarkers.Text.prototype['value'] = anychart.core.axisMarkers.Text.prototype.value;
anychart.core.axisMarkers.Text.prototype['scale'] = anychart.core.axisMarkers.Text.prototype.scale;
anychart.core.axisMarkers.Text.prototype['anchor'] = anychart.core.axisMarkers.Text.prototype.anchor;
anychart.core.axisMarkers.Text.prototype['align'] = anychart.core.axisMarkers.Text.prototype.align;
anychart.core.axisMarkers.Text.prototype['layout'] = anychart.core.axisMarkers.Text.prototype.layout;
anychart.core.axisMarkers.Text.prototype['rotation'] = anychart.core.axisMarkers.Text.prototype.rotation;
anychart.core.axisMarkers.Text.prototype['offsetX'] = anychart.core.axisMarkers.Text.prototype.offsetX;
anychart.core.axisMarkers.Text.prototype['offsetY'] = anychart.core.axisMarkers.Text.prototype.offsetY;
anychart.core.axisMarkers.Text.prototype['text'] = anychart.core.axisMarkers.Text.prototype.text;
anychart.core.axisMarkers.Text.prototype['height'] = anychart.core.axisMarkers.Text.prototype.height;
anychart.core.axisMarkers.Text.prototype['width'] = anychart.core.axisMarkers.Text.prototype.width;
anychart.core.axisMarkers.Text.prototype['draw'] = anychart.core.axisMarkers.Text.prototype.draw;
anychart.core.axisMarkers.Text.prototype['isHorizontal'] = anychart.core.axisMarkers.Text.prototype.isHorizontal;
