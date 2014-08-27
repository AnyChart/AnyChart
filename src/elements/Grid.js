goog.provide('anychart.elements.Grid');
goog.require('acgraph');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.enums');
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
  this.oddFill_ = '#FFFFFF';

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.evenFill_ = '#F5F5F5';

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = '#C1C1C1';

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
  this.isMinor_ = false;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * @type {boolean}
   * @private
   */
  this.drawFirstLine_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.drawLastLine_ = true;

  this.suspendSignalsDispatching();
  this.zIndex(10);
  this.resumeSignalsDispatching(true);
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
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.elements.Grid} Layout or this.
 */
anychart.elements.Grid.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_;
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
 * @return {!anychart.elements.Grid} {@link anychart.elements.Grid} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.Grid} Axis scale or itself for method chaining.
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
 * @return {!anychart.elements.Grid} {@link anychart.elements.Grid} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.Grid} Bounds or this.
 */
anychart.elements.Grid.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      if (opt_value) {
        this.parentBounds_ = opt_value ? opt_value.clone().round() : null;
      }

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
anychart.elements.Grid.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid odd fill settings.
 * @param {string|acgraph.vector.Fill=} opt_value Grid odd fill settings.
 * @return {string|acgraph.vector.Fill|anychart.elements.Grid} Grid odd fill settings or Grid instance for method chaining.
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
 * @return {string|acgraph.vector.Fill|anychart.elements.Grid} Grid even fill settings or Grid instance for method chaining.
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
 * @return {string|acgraph.vector.Stroke|anychart.elements.Grid} Grid stroke line settings or Grid instance for method chaining.
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
 * @param {boolean=} opt_value Whether grid should draw first line.
 * @return {boolean|anychart.elements.Grid} Whether grid should draw first line or Grid instance for method chaining.
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
 * @param {boolean=} opt_value Whether grid should draw last line.
 * @return {boolean|anychart.elements.Grid} Whether grid should draw first line or Grid instance for method chaining.
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
 * Whether it is a minor grid or not.
 * @param {boolean=} opt_value Minor or not.
 * @return {boolean|anychart.elements.Grid} Is minor grid or Grid instance for method chaining.
 */
anychart.elements.Grid.prototype.isMinor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.isMinor_ != opt_value) {
      this.isMinor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POSITION | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.isMinor_;
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
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;
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
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;
  this.lineElement_.moveTo(x, parentBounds.getBottom());
  this.lineElement_.lineTo(x, parentBounds.getTop());
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.Grid.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interlaced drawing.
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
    y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    checkIndex = 1;
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
    x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
    x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    checkIndex = 1;
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
    var layout;
    var fill;
    /** @type {anychart.utils.TypedLayer} */
    var layer;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale_ instanceof anychart.scales.Ordinal;
    var ticks = isOrdinal ? scale.ticks() : this.isMinor() ? scale.minorTicks() : scale.ticks();
    var ticksArray = ticks.get();

    if (this.isHorizontal()) {
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    this.lineElement().clear();

    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.evenFillElement().clip(clip);
    this.oddFillElement().clip(clip);
    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

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
  data['layout'] = this.layout();
  data['oddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.oddFill()));
  data['evenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.evenFill()));
  data['drawFirstLine'] = this.drawFirstLine();
  data['drawLastLine'] = this.drawLastLine();
  data['isMinor'] = this.isMinor();

  return data;
};


/** @inheritDoc */
anychart.elements.Grid.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  if (goog.isDef(value['parentBounds'])) this.parentBounds(value['parentBounds']);
  if (goog.isDef(value['stroke'])) this.stroke(value['stroke']);
  if (goog.isDef(value['layout'])) this.layout(value['layout']);
  if (goog.isDef(value['oddFill'])) this.oddFill(value['oddFill']);
  if (goog.isDef(value['evenFill'])) this.evenFill(value['evenFill']);
  if (goog.isDef(value['drawFirstLine'])) this.drawFirstLine(value['drawFirstLine']);
  if (goog.isDef(value['drawLastLine'])) this.drawLastLine(value['drawLastLine']);
  if (goog.isDef(value['isMinor'])) this.isMinor(value['isMinor']);

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


/**
 * Constructor function.
 * @return {!anychart.elements.Grid}
 */
anychart.elements.grid = function() {
  return new anychart.elements.Grid();
};


//exports
goog.exportSymbol('anychart.elements.grid', anychart.elements.grid);
anychart.elements.Grid.prototype['isMinor'] = anychart.elements.Grid.prototype.isMinor;
anychart.elements.Grid.prototype['oddFill'] = anychart.elements.Grid.prototype.oddFill;
anychart.elements.Grid.prototype['evenFill'] = anychart.elements.Grid.prototype.evenFill;
anychart.elements.Grid.prototype['layout'] = anychart.elements.Grid.prototype.layout;
anychart.elements.Grid.prototype['isHorizontal'] = anychart.elements.Grid.prototype.isHorizontal;
anychart.elements.Grid.prototype['scale'] = anychart.elements.Grid.prototype.scale;
anychart.elements.Grid.prototype['parentBounds'] = anychart.elements.Grid.prototype.parentBounds;
anychart.elements.Grid.prototype['stroke'] = anychart.elements.Grid.prototype.stroke;
anychart.elements.Grid.prototype['drawFirstLine'] = anychart.elements.Grid.prototype.drawFirstLine;
anychart.elements.Grid.prototype['drawLastLine'] = anychart.elements.Grid.prototype.drawLastLine;
anychart.elements.Grid.prototype['draw'] = anychart.elements.Grid.prototype.draw;
