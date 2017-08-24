goog.provide('anychart.stockModule.Grid');
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
anychart.stockModule.Grid = function() {
  anychart.stockModule.Grid.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.lineElement_;

  /**
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {anychart.scales.Base|anychart.stockModule.scales.Scatter}
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
   * @type {anychart.stockModule.Axis|anychart.core.Axis}
   * @private
   */
  this.axis_ = null;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   *
   * @type {Object.<string, acgraph.vector.Path>}
   * @private
   */
  this.fillMap_ = {};
};
goog.inherits(anychart.stockModule.Grid, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.Grid.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Grid.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.GRIDS_POSITION;


//region --- Palette
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.mapModule.elements.Grid)} .
 */
anychart.stockModule.Grid.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.stockModule.Grid.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.Grid.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion


/**
 * Sets the plot that grid belongs to.
 * @param {anychart.stockModule.Plot} plot - Plot instance.
 */
anychart.stockModule.Grid.prototype.setPlot = function(plot) {
  this.plot_ = plot;
};


/**
 * Gets the plot that grid belongs to.
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Grid.prototype.getPlot = function() {
  return this.plot_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set grid layout.
 * @param {anychart.enums.Layout=} opt_value Grid layout.
 * @return {anychart.enums.Layout|anychart.stockModule.Grid} Layout or this.
 */
anychart.stockModule.Grid.prototype.layout = function(opt_value) {
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
    if (this.axis_ instanceof anychart.core.Axis) {
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
anychart.stockModule.Grid.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|anychart.stockModule.scales.Scatter)=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.stockModule.scales.Scatter|anychart.stockModule.Grid} Axis scale or itself for method chaining.
 */
anychart.stockModule.Grid.prototype.scale = function(opt_value) {
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
        return /** @type {anychart.scales.Base|anychart.stockModule.scales.Scatter} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Internal scale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.Grid.prototype.scaleInvalidated_ = function(event) {
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
anychart.stockModule.Grid.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Sets axis.
 * @param {(anychart.stockModule.Axis|anychart.core.Axis)=} opt_value - Value to be set.
 * @return {(anychart.stockModule.Axis|anychart.core.Axis|anychart.stockModule.Grid)} - Current value or itself for method chaining.
 */
anychart.stockModule.Grid.prototype.axis = function(opt_value) {
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
anychart.stockModule.Grid.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * Get/set grid fill settings.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.Grid)} Grid fill settings or Grid instance for method chaining.
 */
anychart.stockModule.Grid.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = anychart.core.settings.fillOrFunctionNormalizer.call(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.fill_), val)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Get/set grid stroke line.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.stockModule.Grid|acgraph.vector.Stroke)} Grid stroke line settings or Grid instance for method chaining.
 */
anychart.stockModule.Grid.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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


//region --- Coloring
/**
 * Creates and returns fill path.
 * @return {acgraph.vector.Path}
 */
anychart.stockModule.Grid.prototype.createFillElement = function() {
  var path = acgraph.path();
  path
      .parent(/** @type {acgraph.vector.ILayer} */(this.container()))
      .zIndex(/** @type {number} */(this.zIndex()))
      .stroke('none');
  this.registerDisposable(path);
  return path;
};


/**
 * Clearing fills cache elements.
 */
anychart.stockModule.Grid.prototype.clearFillElements = function() {
  goog.object.forEach(this.fillMap_, function(value, key) {
    value.clear();
  });
};


/**
 * Returns fill path element.
 * @param {number} index .
 * @return {acgraph.vector.Path}
 */
anychart.stockModule.Grid.prototype.getFillElement = function(index) {
  var fill = /** @type {acgraph.vector.Fill|function} */(this.fill_);
  var fill_, result, hashFill;
  if (goog.isFunction(fill)) {
    var context = {
      'index': index,
      'grid': this,
      'palette': this.palette_ || this.parent_.palette(),
      'sourceColor': 'blue'
    };

    fill_ = fill.call(context);
  } else {
    fill_ = fill;
  }

  var sFill = anychart.color.serialize(fill_);
  hashFill = goog.isString(sFill) ? sFill : JSON.stringify(sFill);
  result = hashFill in this.fillMap_ ? this.fillMap_[hashFill] : (this.fillMap_[hashFill] = this.createFillElement());
  result.fill(fill_);

  return result;
};


//endregion


/**
 * Whether to draw the first line.
 * @param {boolean=} opt_value Whether grid should draw first line.
 * @return {boolean|anychart.stockModule.Grid} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.stockModule.Grid.prototype.drawFirstLine = function(opt_value) {
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
 * @return {boolean|anychart.stockModule.Grid} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.stockModule.Grid.prototype.drawLastLine = function(opt_value) {
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
 * @return {boolean|anychart.stockModule.Grid} Is minor grid or Grid instance for method chaining.
 */
anychart.stockModule.Grid.prototype.isMinor = function(opt_value) {
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
anychart.stockModule.Grid.prototype.drawLineHorizontal = function(ratio, needsShift) {
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
anychart.stockModule.Grid.prototype.drawLineVertical = function(ratio, needsShift) {
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
anychart.stockModule.Grid.prototype.isHorizontal = function() {
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
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {number} needsShift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawInterlaceHorizontal = function(ratio, prevRatio, path, needsShift) {
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
 * @param {acgraph.vector.Path} path Layer to draw interlace.
 * @param {boolean} needsShift Grid line pixel shift.
 * @protected
 */
anychart.stockModule.Grid.prototype.drawInterlaceVertical = function(ratio, prevRatio, path, needsShift) {
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
 * @return {anychart.stockModule.Grid} An instance of {@link anychart.stockModule.Grid} class for method chaining.
 */
anychart.stockModule.Grid.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Base|anychart.stockModule.scales.Scatter} */(this.scale());

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.lineElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
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
    var isStock = scale instanceof anychart.stockModule.scales.Scatter;
    var ticksArray;
    if (isStock) {
      ticksArray = (/** @type {anychart.stockModule.scales.Scatter} */(scale)).getTicks().toArray(!this.isMinor_);
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

    this.clearFillElements();
    this.lineElement().clear();

    var bounds = this.parentBounds() || anychart.math.rect(0, 0, 0, 0);
    var axesLinesSpace = this.axesLinesSpace();
    var clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));

    // this.evenFillElement().clip(clip);
    // this.oddFillElement().clip(clip);
    this.lineElement().clip(clip);

    var drawInterlace = layout[1];
    var drawLine = layout[0];

    var needsShift = acgraph.vector.getThickness(this.stroke_) % 2 == 1;

    for (var i = 0, count = ticksArray.length; i < count; i++) {
      var tickVal = ticksArray[i];
      if (goog.isArray(tickVal)) tickVal = tickVal[0];
      if (isStock)
        ratio = (/** @type {anychart.stockModule.scales.Scatter} */(scale)).transformAligned(tickVal);
      else
        ratio = scale.transform(tickVal);

      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, ratio, prevRatio, path, needsShift);
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
    if (isOrdinal && goog.isDef(tickVal)) {
      if (this.drawLastLine_) drawLine.call(this, 1, needsShift);
      path = this.getFillElement(i);
      if (path) {
        drawInterlace.call(this, 1, ratio, path, needsShift);
      }
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
anychart.stockModule.Grid.prototype.remove = function() {
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
anychart.stockModule.Grid.prototype.lineElement = function() {
  this.lineElement_ = this.lineElement_ ? this.lineElement_ : acgraph.path();
  this.registerDisposable(this.lineElement_);
  return this.lineElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Grid.prototype.serialize = function() {
  var json = anychart.stockModule.Grid.base(this, 'serialize');
  json['isMinor'] = this.isMinor();
  if (this.layout_) json['layout'] = this.layout_;
  json['palette'] = this.palette().serialize();
  json['drawFirstLine'] = this.drawFirstLine();
  json['drawLastLine'] = this.drawLastLine();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.stockModule.Grid.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Grid.base(this, 'setupByJSON', config, opt_default);
  this.isMinor(config['isMinor']);
  this.layout(config['layout']);
  this.drawFirstLine(config['drawFirstLine']);
  this.drawLastLine(config['drawLastLine']);
  this.palette(config['palette']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.plot_) {
        this.axis((/** @type {anychart.stockModule.Plot} */(this.plot_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.stockModule.Axis || ax instanceof anychart.core.Axis) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Grid.prototype.disposeInternal = function() {
  delete this.stroke_;
  this.axis_ = null;
  this.plot_ = null;
  anychart.stockModule.Grid.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.stockModule.Grid.prototype;
  proto['isMinor'] = proto.isMinor;
  proto['palette'] = proto.palette;
  proto['fill'] = proto.fill;
  proto['layout'] = proto.layout;
  proto['isHorizontal'] = proto.isHorizontal;
  proto['scale'] = proto.scale;
  proto['stroke'] = proto.stroke;
  proto['drawFirstLine'] = proto.drawFirstLine;
  proto['drawLastLine'] = proto.drawLastLine;
  proto['axis'] = proto.axis;
})();
