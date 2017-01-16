goog.provide('anychart.core.grids.Stock');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.grids.Stock = function() {
  anychart.core.grids.Stock.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.oddFillElement_;

  /**
   * @type {acgraph.vector.Path}
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
  this.evenFill_;

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {anychart.scales.Base|anychart.scales.StockScatterDateTime}
   * @private
   */
  this.scale_;

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
   * @type {anychart.core.axes.StockDateTime|anychart.core.axes.Linear}
   * @private
   */
  this.axis_ = null;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;
};
goog.inherits(anychart.core.grids.Stock, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.grids.Stock.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.Stock.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GRIDS_POSITION;


/**
 * Sets the plot that grid belongs to.
 * @param {anychart.core.stock.Plot} plot - Plot instance.
 */
anychart.core.grids.Stock.prototype.setPlot = function(plot) {
  this.plot_ = plot;
};


/**
 * Gets the plot that grid belongs to.
 * @return {anychart.core.stock.Plot}
 */
anychart.core.grids.Stock.prototype.getPlot = function() {
  return this.plot_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.core.grids.Stock} Layout or this.
 */
anychart.core.grids.Stock.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var isHorizontal = false;
    if (this.axis_ instanceof anychart.core.axes.Linear) {
      var axisOrientation = this.axis_.orientation();
      isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    }
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set default layout.
 * @param {anychart.enums.Layout} value - Layout value.
 */
anychart.core.grids.Stock.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|anychart.scales.StockScatterDateTime)=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.scales.StockScatterDateTime|anychart.core.grids.Stock} Axis scale or itself for method chaining.
 */
anychart.core.grids.Stock.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (this.scale_) {
      return this.scale_;
    } else {
      if (this.axis_)
        return /** @type {anychart.scales.Base|anychart.scales.StockScatterDateTime} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Stock.prototype.scaleInvalidated_ = function(event) {
  //if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION) ||
  //    event.hasSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT))
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
        anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//  Axis.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.grids.Stock.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Sets axis.
 * @param {(anychart.core.axes.StockDateTime|anychart.core.axes.Linear)=} opt_value - Value to be set.
 * @return {(anychart.core.axes.StockDateTime|anychart.core.axes.Linear|anychart.core.grids.Stock)} - Current value or itself for method chaining.
 */
anychart.core.grids.Stock.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_) this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
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
anychart.core.grids.Stock.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Stock)} Grid odd fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.oddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.oddFill_), val)) {
      this.oddFill_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Stock)} Grid even fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.evenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.evenFill_), val)) {
      this.evenFill_ = val;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.grids.Stock|acgraph.vector.Stroke)} Grid stroke line settings or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
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
 * @return {boolean|anychart.core.grids.Stock} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.drawFirstLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawFirstLine_ != opt_value) {
      this.drawFirstLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.drawFirstLine_;
  }
};


/**
 * Whether to draw the last line.
 * @param {boolean=} opt_value Whether grid should draw last line.
 * @return {boolean|anychart.core.grids.Stock} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.drawLastLine = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawLastLine_ != opt_value) {
      this.drawLastLine_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.drawLastLine_;
  }
};


/**
 * Whether it is a minor grid or not.
 * @param {boolean=} opt_value Minor or not.
 * @return {boolean|anychart.core.grids.Stock} Is minor grid or Grid instance for method chaining.
 */
anychart.core.grids.Stock.prototype.isMinor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.isMinor_ != opt_value) {
      this.isMinor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
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
 * @param {number} needsShift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Stock.prototype.drawLineHorizontal = function(ratio, needsShift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  /** @type {number}*/
  var y = Math.round(parentBounds.getBottom() - ratio * parentBounds.height);
  var shift = needsShift ? 0.5 : 0;
  ratio == 1 ? y += shift : y -= shift;
  this.lineElement_.moveTo(parentBounds.getLeft(), y);
  this.lineElement_.lineTo(parentBounds.getRight(), y);
};


/**
 * Draw vertical line.
 * @param {number} ratio Scale ratio to draw grid line.
 * @param {number} needsShift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Stock.prototype.drawLineVertical = function(ratio, needsShift) {
  var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
  var x = Math.floor((parentBounds.getLeft() + ratio * parentBounds.width) * 2);
  if (needsShift ^ (x % 2 == 1))
    x += 1;
  x /= 2;
  this.lineElement_.moveTo(x, parentBounds.getBottom());
  this.lineElement_.lineTo(x, parentBounds.getTop());
};


/**
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.grids.Stock.prototype.isHorizontal = function() {
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
 * @param {number} needsShift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Stock.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, fillSettings, path, needsShift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var shift = needsShift ? 0.5 : 0;

    var y1 = Math.round(parentBounds.getBottom() - prevRatio * parentBounds.height);
    prevRatio == 1 ? y1 += shift : y1 -= shift;

    var y2 = Math.floor(parentBounds.getBottom() - ratio * parentBounds.height);
    ratio == 1 ? y2 += shift : y2 -= shift;

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
 * @param {boolean} needsShift Grid line pixel shift.
 * @protected
 */
anychart.core.grids.Stock.prototype.drawInterlaceVertical = function(ratio, prevRatio, fillSettings, path, needsShift) {
  if (!isNaN(prevRatio)) {
    var parentBounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);

    var x1 = Math.floor((parentBounds.getLeft() + prevRatio * parentBounds.width) * 2);
    if (needsShift ^ (x1 % 2 == 1))
      x1 += 1;
    x1 /= 2;

    var x2 = Math.floor((parentBounds.getLeft() + ratio * parentBounds.width) * 2);
    if (needsShift ^ (x2 % 2 == 1))
      x2 += 1;
    x2 /= 2;

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
 * @return {anychart.core.grids.Stock} An instance of {@link anychart.core.grids.Stock} class for method chaining.
 */
anychart.core.grids.Stock.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Base|anychart.scales.StockScatterDateTime} */(this.scale());

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

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS)) {
    var layout;
    var fill;
    var path;
    var ratio;
    var prevRatio = NaN;
    var isOrdinal = scale instanceof anychart.scales.Ordinal;
    var isStock = scale instanceof anychart.scales.StockScatterDateTime;
    var ticksArray;
    if (isStock) {
      ticksArray = (/** @type {anychart.scales.StockScatterDateTime} */(scale)).getTicks().toArray(!this.isMinor_);
    } else if (isOrdinal) {
      ticksArray = (/** @type {anychart.scales.Ordinal} */(scale)).ticks().get();
    } else if (this.isMinor_) {
      ticksArray = (/** @type {anychart.scales.Linear} */(scale)).minorTicks().get();
    } else {
      ticksArray = (/** @type {anychart.scales.Linear} */(scale)).ticks().get();
    }

    if (this.isHorizontal()) {
      layout = [this.drawLineHorizontal, this.drawInterlaceHorizontal];
    } else {
      layout = [this.drawLineVertical, this.drawInterlaceVertical];
    }

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    this.lineElement().clear();

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    this.evenFillElement().clip(clip);
    this.oddFillElement().clip(clip);
    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var needsShift = acgraph.vector.getThickness(this.stroke_) % 2 == 1;

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      if (isStock)
        ratio = (/** @type {anychart.scales.StockScatterDateTime} */(scale)).transformAligned(tickVal);
      else
        ratio = scale.transform(tickVal);

      if (i % 2 == 0) {
        fill = this.evenFill_;
        path = this.evenFillElement_;
      } else {
        fill = this.oddFill_;
        path = this.oddFillElement_;
      }

      if (fill != 'none') {
        drawInterlace.call(this, ratio, prevRatio, fill, path, needsShift);
      }

      if (!i) {
        if (this.drawFirstLine_)
          drawLine.call(this, ratio, needsShift);
      } else if (i == count - 1) {
        if (this.drawLastLine_ || isOrdinal)
          drawLine.call(this, ratio, needsShift);
      } else {
        drawLine.call(this, ratio, needsShift);
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
      if (this.drawLastLine_) drawLine.call(this, 1, needsShift);
      drawInterlace.call(this, 1, ratio, fill, path, needsShift);
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION & anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.lineElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke()));
    this.oddFillElement().fill(/** @type {acgraph.vector.Fill} */(this.oddFill()));
    this.evenFillElement().fill(/** @type {acgraph.vector.Fill} */(this.evenFill()));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Stock.prototype.remove = function() {
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
anychart.core.grids.Stock.prototype.lineElement = function() {
  this.lineElement_ = this.lineElement_ ? this.lineElement_ : acgraph.path();
  this.registerDisposable(this.lineElement_);
  return this.lineElement_;
};


/**
 * @return {!acgraph.vector.Path} Grid odd fill element.
 * @protected
 */
anychart.core.grids.Stock.prototype.oddFillElement = function() {
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
anychart.core.grids.Stock.prototype.evenFillElement = function() {
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
anychart.core.grids.Stock.prototype.serialize = function() {
  var json = anychart.core.grids.Stock.base(this, 'serialize');
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
anychart.core.grids.Stock.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.grids.Stock.base(this, 'setupByJSON', config, opt_default);
  this.isMinor(config['isMinor']);
  this.layout(config['layout']);
  this.drawFirstLine(config['drawFirstLine']);
  this.drawLastLine(config['drawLastLine']);
  this.oddFill(config['oddFill']);
  this.evenFill(config['evenFill']);
  this.stroke(config['stroke']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.plot_) {
        this.axis((/** @type {anychart.core.stock.Plot} */(this.plot_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.core.axes.StockDateTime || ax instanceof anychart.core.axes.Linear) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Stock.prototype.disposeInternal = function() {
  delete this.stroke_;
  this.axis_ = null;
  this.plot_ = null;
  anychart.core.grids.Stock.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.grids.Stock.prototype;
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
