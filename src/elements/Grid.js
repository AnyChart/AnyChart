goog.provide('anychart.elements.Grid');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.utils');
goog.require('anychart.utils.TypedLayer');



/**
 * Grid.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Grid = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.invert_;

  /**
   * @type {anychart.utils.TypedLayer}
   * @private
   */
  this.oddFillElement_;

  /**
   * @type {anychart.utils.TypedLayer}
   * @private
   */
  this.evenFillElement_;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.lineElement_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.oddFill_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.oddFill_;

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

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
   * @type {boolean}
   * @private
   */
  this.minor_;

  this.restoreDefaults();
};
goog.inherits(anychart.elements.Grid, anychart.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.Grid.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Grid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.POSITION;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid direction.
 * @param {anychart.utils.Direction=} opt_value Grid direction.
 * @return {anychart.utils.Direction|anychart.elements.Grid} Direction or this.
 */
anychart.elements.Grid.prototype.direction = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.direction_ != opt_value) {
      this.direction_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.direction_;
  }
};


/**
 * Get/set grid invert.
 * @param {boolean=} opt_value Grid invert.
 * @return {boolean|anychart.elements.Grid} Invert settings or this.
 */
anychart.elements.Grid.prototype.invert = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.invert_ != opt_value) {
      this.invert_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.invert_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.elements.Grid} An instance of the {@link anychart.elements.Grid} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.Grid} Axis scale or itself for chaining.
 */
anychart.elements.Grid.prototype.scale = function(opt_value) {
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
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.Grid.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

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
 * @return {!anychart.elements.Grid} An instance of the {@link anychart.elements.Grid} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.Grid} Bounds or this.
 */
anychart.elements.Grid.prototype.parentBounds = function(opt_value) {
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
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid odd fill settings.
 * @param {string|acgraph.vector.Fill=} opt_value Grid odd fill settings.
 * @return {string|acgraph.vector.Fill|anychart.elements.Grid} Grid odd fill settings or Grid instance for chaining.
 */
anychart.elements.Grid.prototype.oddFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.oddFill_ != opt_value) {
      this.oddFill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.oddFill_;
  }
};


/**
 * Get/set grid even fill settings.
 * @param {string|acgraph.vector.Fill=} opt_value Grid even fill settings.
 * @return {string|acgraph.vector.Fill|anychart.elements.Grid} Grid even fill settings or Grid instance for chaining.
 */
anychart.elements.Grid.prototype.evenFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.evenFill_ != opt_value) {
      this.evenFill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.evenFill_;
  }
};


/**
 * Get/set grid stroke line.
 * @param {string|acgraph.vector.Stroke=} opt_value Grid stroke line settings.
 * @return {string|acgraph.vector.Stroke|anychart.elements.Grid} Grid stroke line settings or Grid instance for chaining.
 */
anychart.elements.Grid.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Whether to draw the first line.
 * @param {boolean=} opt_value Whenever grid should draw first line.
 * @return {boolean|anychart.elements.Grid} Whenever grid should draw first line or Grid instance for chaining.
 */
anychart.elements.Grid.prototype.drawFirstLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLine_ != opt_value) {
      this.drawFirstLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.drawFirstLine_;
  }
};


/**
 * Whether to draw the last line.
 * @param {boolean=} opt_value Whenever grid should draw last line.
 * @return {boolean|anychart.elements.Grid} Whenever grid should draw first line or Grid instance for chaining.
 */
anychart.elements.Grid.prototype.drawLastLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLine_ != opt_value) {
      this.drawLastLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.drawLastLine_;
  }
};


/**
 * Определяет минорный это грид или нет.
 * @param {boolean=} opt_value Minor or not.
 * @return {boolean|anychart.elements.Grid} Is minor grid or Grid instance for chaining..
 */
anychart.elements.Grid.prototype.minor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minor_ != opt_value) {
      this.minor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.minor_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Line drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.elements.Grid.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds();
  /** @type {number}*/
  var y;
  if (this.invert()) {
    y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    ratio == 1 ? y -= shift : y += shift;
  } else {
    y = Math.round(parentBounds.getTop() + ratio * parentBounds.height);
    ratio == 0 ? y -= shift : y += shift;
  }
  this.lineElement_.moveTo(parentBounds.getLeft(), y);
  this.lineElement_.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.elements.Grid.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds();
  /** @type {number}*/
  var x;
  if (this.invert()) {
    x = Math.round(parentBounds.getRight() - ratio * parentBounds.width);
    ratio == 0 ? x += shift : x -= shift;
  } else {
    x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    ratio == 1 ? x += shift : x -= shift;
  }
  this.lineElement_.moveTo(x, parentBounds.getBottom());
  this.lineElement_.lineTo(x, parentBounds.getTop());
};


/**
 * Определяет расположения маркера
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.Grid.prototype.isHorizontal = function() {
  return this.direction_ == anychart.utils.Direction.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interlacing drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {anychart.utils.TypedLayer} layer Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.elements.Grid.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, fillSettings, layer, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds();
    var y1, y2, checkIndex;
    if (this.invert()) {
      y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
      y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
      checkIndex = 1;
    } else {
      y1 = Math.round(parentBounds.getTop() + prevRatio * parentBounds.height);
      y2 = Math.round(parentBounds.getTop() + ratio * parentBounds.height);
      checkIndex = 0;
    }
    ratio == checkIndex ? y2 -= shift : y2 += shift;
    prevRatio == checkIndex ? y1 -= shift : y1 += shift;

    var element = layer.genNextChild();

    element.moveTo(parentBounds.getLeft(), y1);
    element.lineTo(parentBounds.getRight(), y1);
    element.lineTo(parentBounds.getRight(), y2);
    element.lineTo(parentBounds.getLeft(), y2);
    element.close();
  }
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {anychart.utils.TypedLayer} layer Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.elements.Grid.prototype.drawInterlaceVertical = function(ratio, prevRatio, fillSettings, layer, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds();
    var x1, x2, checkIndex;
    if (!this.invert()) {
      x1 = Math.round(parentBounds.getRight() - prevRatio * parentBounds.width);
      x2 = Math.round(parentBounds.getRight() - ratio * parentBounds.width);
      checkIndex = 0;
    } else {
      x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
      x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
      checkIndex = 1;
    }
    ratio == checkIndex ? x2 += shift : x2 -= shift;
    prevRatio == checkIndex ? x1 += shift : x1 -= shift;

    var element = layer.genNextChild();

    element.moveTo(x1, parentBounds.getTop());
    element.lineTo(x2, parentBounds.getTop());
    element.lineTo(x2, parentBounds.getBottom());
    element.lineTo(x1, parentBounds.getBottom());
    element.close();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 */
anychart.elements.Grid.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());
  if (!this.checkDrawingNeeded() || !scale)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.evenFillElement().zIndex(zIndex);
    this.oddFillElement().zIndex(zIndex);
    this.lineElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.evenFillElement().parent(container);
    this.oddFillElement().parent(container);
    this.lineElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var direction;
    var fill;
    /** @type {anychart.utils.TypedLayer} */
    var layer;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale_ instanceof anychart.scales.Ordinal;
    var ticks = isOrdinal ? scale.ticks() : this.minor() ? scale.minorTicks() : scale.ticks();
    var ticksArray = ticks.get();

    if (this.isHorizontal()) {
      direction = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      direction = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    this.lineElement().clear();

    var drawInterlace = direction[1];
    var drawLine = direction[0];

    var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      ratio = scale.transform(tickVal);

      if (i % 2 == 0) {
        fill = this.evenFill_;
        layer = this.evenFillElement_;
      } else {
        fill = this.oddFill_;
        layer = this.oddFillElement_;
      }

      if (fill) {
        drawInterlace.call(this, ratio, prevRatio, fill, layer, pixelShift);
      }

      if (i == 0) {
        if (this.drawFirstLine_)
          drawLine.call(this, ratio, pixelShift);
      } else if (i == count - 1) {
        if (this.drawLastLine_ || isOrdinal)
          drawLine.call(this, ratio, pixelShift);
      } else {
        drawLine.call(this, ratio, pixelShift);
      }

      prevRatio = ratio;
    }

    //draw last line on ordinal
    if (i % 2 == 0) {
      fill = this.evenFill_;
      layer = this.evenFillElement_;
    } else {
      fill = this.oddFill_;
      layer = this.oddFillElement_;
    }

    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.drawLastLine_) drawLine.call(this, 1, pixelShift);
      drawInterlace.call(this, 1, ratio, fill, layer, pixelShift);
    }

    this.markConsistent(anychart.ConsistencyState.POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.oddFillElement().forEachChild(function(child) {
      child.fill(this.oddFill());
    }, this);

    this.evenFillElement().forEachChild(function(child) {
      child.fill(this.evenFill());
    }, this);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


/**
 * Restore defaults.
 */
anychart.elements.Grid.prototype.restoreDefaults = function() {
  this.zIndex(10);
  this.suspendSignalsDispatching();
  this.direction(anychart.utils.Direction.HORIZONTAL);
  this.invert(false);
  this.minor(false);
  this.oddFill('rgb(245,245,245)');
  this.evenFill('rgb(255,255,255)');
  this.stroke('rgb(193,193,193)');
  this.drawFirstLine(true);
  this.drawLastLine(true);
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Grid.prototype.remove = function() {
  this.evenFillElement().parent(null);
  this.oddFillElement().parent(null);
  this.lineElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Elements creation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {!acgraph.vector.Path} Grid line element.
 */
anychart.elements.Grid.prototype.lineElement = function() {
  this.lineElement_ = this.lineElement_ ? this.lineElement_ : acgraph.path();
  this.registerDisposable(this.lineElement_);
  return this.lineElement_;
};


/**
 * @return {!anychart.utils.TypedLayer} Grid odd fill element.
 * @protected
 */
anychart.elements.Grid.prototype.oddFillElement = function() {
  this.oddFillElement_ = this.oddFillElement_ ?
      this.oddFillElement_ :
      new anychart.utils.TypedLayer(function() {
        var path = acgraph.path();
        path.stroke('none');
        path.zIndex(this.zIndex_);
        return path;
      }, function(child) {
        child.clear();
      }, undefined, this);
  this.registerDisposable(this.oddFillElement_);

  return this.oddFillElement_;
};


/**
 * @return {!anychart.utils.TypedLayer} Grid event fill element.
 * @protected
 */
anychart.elements.Grid.prototype.evenFillElement = function() {
  this.evenFillElement_ = this.evenFillElement_ ?
      this.evenFillElement_ :
      new anychart.utils.TypedLayer(function() {
        var path = acgraph.path();
        path.stroke('none');
        path.zIndex(this.zIndex_);
        return path;
      }, function(child) {
        child.clear();
      }, undefined, this);
  this.registerDisposable(this.evenFillElement_);

  return this.evenFillElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.Grid.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['parentBounds'] = this.parentBounds();
  data['stroke'] = this.stroke();
  data['direction'] = this.direction();
  data['oddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.oddFill()));
  data['evenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.evenFill()));
  data['drawFirstLine'] = this.drawFirstLine();
  data['drawLastLine'] = this.drawLastLine();
  data['minor'] = this.minor();

  return data;
};


/** @inheritDoc */
anychart.elements.Grid.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  if (goog.isDef(value['parentBounds'])) this.parentBounds(value['parentBounds']);
  if (goog.isDef(value['stroke'])) this.stroke(value['stroke']);
  if (goog.isDef(value['direction'])) this.direction(value['direction']);
  if (goog.isDef(value['oddFill'])) this.oddFill(value['oddFill']);
  if (goog.isDef(value['evenFill'])) this.evenFill(value['evenFill']);
  if (goog.isDef(value['drawFirstLine'])) this.drawFirstLine(value['drawFirstLine']);
  if (goog.isDef(value['drawLastLine'])) this.drawLastLine(value['drawLastLine']);
  if (goog.isDef(value['minor'])) this.minor(value['minor']);

  this.resumeSignalsDispatching(true);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Grid.prototype.disposeInternal = function() {
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};
