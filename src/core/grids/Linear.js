goog.provide('anychart.core.grids.Linear');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.grids.Linear = function() {
  anychart.core.grids.Linear.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.evenFillElement_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.lineElementInternal = null;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.oddFill_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.evenFill_;

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.scale_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.isMinor_ = false;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {boolean}
   * @private
   */
  this.drawFirstLine_;

  /**
   * @type {boolean}
   * @private
   */
  this.drawLastLine_;

  /**
   * Assigned axis.
   * @type {anychart.core.axes.Linear}
   * @private
   */
  this.axis_ = null;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;
};
goog.inherits(anychart.core.grids.Linear, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.grids.Linear.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.Linear.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GRIDS_POSITION;


/**
 * Sets the chart series belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.grids.Linear.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.grids.Linear.prototype.getChart = function() {
  return this.chart_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.grids.Linear} Layout or this.
 */
anychart.core.grids.Linear.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var axisOrientation = this.axis_.orientation();
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout} value - Layout value.
 */
anychart.core.grids.Linear.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.grids.Linear} Axis scale or itself for method chaining.
 */
anychart.core.grids.Linear.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    if (this.scale_) {
      return this.scale_;
    } else {
      if (this.axis_)
        return /** @type {?anychart.scales.Base} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Linear.prototype.scaleInvalidated_ = function(event) {
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
//  Axis.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.grids.Linear.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Sets axis.
 * @param {anychart.core.axes.Linear=} opt_value - Value to be set.
 * @return {(anychart.core.axes.Linear|anychart.core.grids.Linear)} - Current value or itself for method chaining.
 */
anychart.core.grids.Linear.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.axis_;
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
anychart.core.grids.Linear.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
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
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Linear)} Grid odd fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.oddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.oddFill_), val)) {
      this.oddFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.oddFill_;
};


/**
 * Get/set grid even fill settings.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Linear)} Grid even fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.evenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.evenFill_), val)) {
      this.evenFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.evenFill_;
};


/**
 * Get/set grid stroke line.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.grids.Linear|acgraph.vector.Stroke)} Grid stroke line settings or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      var oldThickness = this.stroke_ ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.stroke_)) : 0;
      this.stroke_ = stroke;
      var newThickness = this.stroke_ ? acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.stroke_)) : 0;
      var state = anychart.ConsistencyState.APPEARANCE;
      var signal = anychart.Signal.NEEDS_REDRAW;
      if (oldThickness != newThickness) {
        state |= anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS;
        signal |= anychart.Signal.BOUNDS_CHANGED;
      }
      this.invalidate(state, signal);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Whether to draw the first line.
 * @param {boolean=} opt_value Whether grid should draw first line.
 * @return {boolean|anychart.core.grids.Linear} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.drawFirstLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLine_ != opt_value) {
      this.drawFirstLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
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
 * @return {boolean|anychart.core.grids.Linear} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.drawLastLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLine_ != opt_value) {
      this.drawLastLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
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
 * @return {boolean|anychart.core.grids.Linear} Is minor grid or Grid instance for method chaining.
 */
anychart.core.grids.Linear.prototype.isMinor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.isMinor_ != opt_value) {
      this.isMinor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
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
anychart.core.grids.Linear.prototype.drawLineHorizontal = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  ratio == 1 ? y -= shift : y += shift;
  this.lineElementInternal.moveTo(parentBounds.getLeft(), y);
  this.lineElementInternal.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawLineVertical = function(ratio, shift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var x = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
  ratio == 1 ? x += shift : x -= shift;
  this.lineElementInternal.moveTo(x, parentBounds.getBottom());
  this.lineElementInternal.lineTo(x, parentBounds.getTop());
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.grids.Linear.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
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
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, fillSettings, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var y1, y2, checkIndex;
    y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    y2 = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
    checkIndex = 1;
    ratio == checkIndex ? y2 -= shift : y2 += shift;
    prevRatio == checkIndex ? y1 -= shift : y1 += shift;

    path.moveTo(parentBounds.getLeft(), y1);
    path.lineTo(parentBounds.getRight(), y1);
    path.lineTo(parentBounds.getRight(), y2);
    path.lineTo(parentBounds.getLeft(), y2);
    path.close();
  }
};


/**
 * Draw horizontal line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous scale ratio to draw grid interlace.
 * @param {string} fillSettings Interlace fill settings.
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} shift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Linear.prototype.drawInterlaceVertical = function(ratio, prevRatio, fillSettings, path, shift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var x1, x2, checkIndex;
    x1 = Math.round(parentBounds.getLeft() + prevRatio * parentBounds.width);
    x2 = Math.round(parentBounds.getLeft() + ratio * parentBounds.width);
    checkIndex = 1;
    ratio == checkIndex ? x2 += shift : x2 -= shift;
    prevRatio == checkIndex ? x1 += shift : x1 -= shift;

    path.moveTo(x1, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getTop());
    path.lineTo(x2, parentBounds.getBottom());
    path.lineTo(x1, parentBounds.getBottom());
    path.close();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.grids.Linear} An instance of {@link anychart.core.grids.Linear} class for method chaining.
 */
anychart.core.grids.Linear.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

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

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.oddFillElement().fill(/** @type {acgraph.vector.Fill} */(this.oddFill()));
    this.evenFillElement().fill(/** @type {acgraph.vector.Fill} */(this.evenFill()));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout;
    var fill;
    var path;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = this.scale() instanceof anychart.scales.Ordinal;
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

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    if (this.getChart() && this.getChart().isMode3d) {
      this.x3dShift = this.getChart().x3dShift;
      this.y3dShift = this.getChart().y3dShift;

      var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.stroke())) / 2;
      bounds.top -= this.y3dShift + strokeThickness;
      bounds.height += this.y3dShift + strokeThickness;
      bounds.width += this.x3dShift;
    }
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.evenFillElement().clip(clip);
    this.oddFillElement().clip(clip);
    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var pixelShift = -this.lineElement().strokeThickness() % 2 / 2;

    // zeroTick
    if (this.getChart() && this.getChart().isMode3d && this.isHorizontal()) {
      drawLine.call(this, 0, pixelShift);
    }

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      ratio = scale.transform(tickVal);

      if (i % 2 == 0) {
        fill = this.evenFill_;
        path = this.evenFillElement_;
      } else {
        fill = this.oddFill_;
        path = this.oddFillElement_;
      }

      if (fill != 'none') {
        drawInterlace.call(this, ratio, prevRatio, fill, path, pixelShift);
      }

      if (!i) {
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
      path = this.evenFillElement_;
    } else {
      fill = this.oddFill_;
      path = this.oddFillElement_;
    }

    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.drawLastLine_) drawLine.call(this, 1, pixelShift);
      drawInterlace.call(this, 1, ratio, fill, path, pixelShift);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.remove = function() {
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
anychart.core.grids.Linear.prototype.lineElement = function() {
  this.lineElementInternal = this.lineElementInternal ? this.lineElementInternal : acgraph.path();
  this.registerDisposable(this.lineElementInternal);
  return this.lineElementInternal;
};


/**
 * @return {!acgraph.vector.Path} Grid odd fill element.
 * @protected
 */
anychart.core.grids.Linear.prototype.oddFillElement = function() {
  if (!this.oddFillElement_) {
    this.oddFillElement_ = acgraph.path();
    this.oddFillElement_.stroke('none');
    this.registerDisposable(this.oddFillElement_);
  }

  return this.oddFillElement_;
};


/**
 * @return {!acgraph.vector.Path} Grid event fill element.
 * @protected
 */
anychart.core.grids.Linear.prototype.evenFillElement = function() {
  if (!this.evenFillElement_) {
    this.evenFillElement_ = acgraph.path();
    this.evenFillElement_.stroke('none');
    this.registerDisposable(this.evenFillElement_);
  }

  return this.evenFillElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.serialize = function() {
  var json = anychart.core.grids.Linear.base(this, 'serialize');
  json['isMinor'] = this.isMinor();
  if (this.layout_) json['layout'] = this.layout_;
  json['drawFirstLine'] = this.drawFirstLine();
  json['drawLastLine'] = this.drawLastLine();
  json['oddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.oddFill()));
  json['evenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.evenFill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.grids.Linear.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.grids.Linear.base(this, 'setupByJSON', config, opt_default);
  this.isMinor(config['isMinor']);
  if ('layout' in config && config['layout']) this.layout(config['layout']);
  this.drawFirstLine(config['drawFirstLine']);
  this.drawLastLine(config['drawLastLine']);
  this.oddFill(config['oddFill']);
  this.evenFill(config['evenFill']);
  this.stroke(config['stroke']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.chart_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.chart_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.core.axes.Linear) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Linear.prototype.disposeInternal = function() {
  delete this.stroke_;
  this.axis_ = null;
  this.chart_ = null;
  anychart.core.grids.Linear.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.grids.Linear.prototype;
  proto['isMinor'] = proto.isMinor;
  proto['oddFill'] = proto.oddFill;
  proto['evenFill'] = proto.evenFill;
  proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['stroke'] = proto.stroke;
  proto['drawFirstLine'] = proto.drawFirstLine;
  proto['drawLastLine'] = proto.drawLastLine;
  proto['axis'] = proto.axis;
})();
