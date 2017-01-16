goog.provide('anychart.core.grids.Polar');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.grids.Polar = function() {
  anychart.core.grids.Polar.base(this, 'constructor');

  /**
   * @type {anychart.core.utils.TypedLayer}
   * @private
   */
  this.oddFillElement_;

  /**
   * @type {anychart.core.utils.TypedLayer}
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
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_;

  /**
   * @type {boolean}
   * @private
   */
  this.isMinor_ = false;

  /**
   * @type {anychart.enums.RadialGridLayout}
   * @private
   */
  this.layout_;

  /**
   * @type {number}
   * @private
   */
  this.startAngle_;

  /**
   * @type {boolean}
   * @private
   */
  this.drawLastLine_;

  /**
   * @type {anychart.enums.RadialGridLayout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.RadialGridLayout.CIRCUIT;

  /**
   * Assigned axis.
   * @type {anychart.core.axes.Polar|anychart.core.axes.Radial}
   * @private
   */
  this.axis_ = null;

  /**
   * Chart instance.
   * @type {anychart.charts.Polar}
   * @private
   */
  this.chart_ = null;
};
goog.inherits(anychart.core.grids.Polar, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.grids.Polar.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.Polar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GRIDS_POSITION;


/**
 * Sets the chart series belongs to.
 * @param {anychart.charts.Polar} chart Chart instance.
 */
anychart.core.grids.Polar.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart series belongs to.
 * @return {anychart.charts.Polar}
 */
anychart.core.grids.Polar.prototype.getChart = function() {
  return this.chart_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Set default layout.
 * @param {anychart.enums.RadialGridLayout} value - Layout value.
 */
anychart.core.grids.Polar.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate) this.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
};


/**
 * Get/set grid layout.
 * @param {anychart.enums.RadialGridLayout=} opt_value Grid layout.
 * @return {anychart.enums.RadialGridLayout|anychart.core.grids.Polar} Layout or this.
 */
anychart.core.grids.Polar.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizePolarLayout(opt_value, anychart.enums.RadialGridLayout.CIRCUIT);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var isCircuit = this.axis_ instanceof anychart.core.axes.Radial;
    return isCircuit ? anychart.enums.RadialGridLayout.CIRCUIT : anychart.enums.RadialGridLayout.RADIAL;
  } else {
    return this.defaultLayout_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for yScale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.grids.Polar} Axis yScale or itself for method chaining.
 */
anychart.core.grids.Polar.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.yScaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.yScale_) {
    return this.yScale_;
  } else if (this.axis_ && this.axis_ instanceof anychart.core.axes.Radial) {
    return /**@type {anychart.scales.Base} */ (this.axis_.scale());
  } else if (this.chart_) {
    return /**@type {anychart.scales.Base} */ (this.chart_.yScale());
  } else {
    return null;
  }
};


/**
 * Internal yScale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Polar.prototype.yScaleInvalidated_ = function(event) {
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


/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.grids.Polar} Axis xScale or itself for method chaining.
 */
anychart.core.grids.Polar.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.xScaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.xScale_) {
    return this.xScale_;
  } else if (this.axis_ && this.axis_ instanceof anychart.core.axes.Radar) {
    return /**@type {anychart.scales.Base} */ (this.axis_.scale());
  } else if (this.chart_) {
    return /**@type {anychart.scales.Base} */ (this.chart_.xScale());
  } else {
    return null;
  }
};


/**
 * Internal xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.grids.Polar.prototype.xScaleInvalidated_ = function(event) {
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
anychart.core.grids.Polar.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Sets axis.
 * @param {(anychart.core.axes.Polar|anychart.core.axes.Radial)=} opt_value - Value to be set.
 * @return {(anychart.core.axes.Polar|anychart.core.axes.Radial|anychart.core.grids.Polar)} - Current value or itself for method chaining.
 */
anychart.core.grids.Polar.prototype.axis = function(opt_value) {
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
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Polar)} Grid odd fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Polar.prototype.oddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {!(acgraph.vector.Fill|anychart.core.grids.Polar)} Grid even fill settings or Grid instance for method chaining.
 */
anychart.core.grids.Polar.prototype.evenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.grids.Polar)} .
 */
anychart.core.grids.Polar.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Get/set grid stroke line.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.grids.Polar|acgraph.vector.Stroke)} Grid stroke line settings or Grid instance for method chaining.
 */
anychart.core.grids.Polar.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Whether to draw the last line.
 * @param {boolean=} opt_value Whether grid should draw last line.
 * @return {boolean|anychart.core.grids.Polar} Whether grid should draw first line or Grid instance for method chaining.
 */
anychart.core.grids.Polar.prototype.drawLastLine = function(opt_value) {
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
 * @return {boolean|anychart.core.grids.Polar} Is minor grid or Grid instance for method chaining.
 */
anychart.core.grids.Polar.prototype.isMinor = function(opt_value) {
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
 * @protected
 */
anychart.core.grids.Polar.prototype.drawLineCircuit = function(ratio) {
  var radius = this.radius_ * ratio;
  this.lineElement_.circularArc(this.cx_, this.cy_, radius, radius, 0, 360);
};


/**
 * Draw vertical line.
 * @param {number} x .
 * @param {number} y .
 * @param {number} xPixelShift .
 * @param {number} yPixelShift .
 * @protected
 */
anychart.core.grids.Polar.prototype.drawLineRadial = function(x, y, xPixelShift, yPixelShift) {
  this.lineElement_.moveTo(x + xPixelShift, y + yPixelShift);
  this.lineElement_.lineTo(this.cx_ + xPixelShift, this.cy_ + yPixelShift);
};


/**
 * Whether marker is radial
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.grids.Polar.prototype.isRadial = function() {
  return this.layout() == anychart.enums.RadialGridLayout.RADIAL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interlaced drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw radial line.
 * @param {number} ratio Scale ratio to draw grid interlace.
 * @param {number} prevRatio Previous yScale ratio to draw grid interlace.
 * @param {anychart.core.utils.TypedLayer} layer Layer to draw interlace.
 * @protected
 */
anychart.core.grids.Polar.prototype.drawInterlaceCircuit = function(ratio, prevRatio, layer) {
  if (!isNaN(prevRatio)) {
    var x, y, angleRad, radius;
    var element = layer.genNextChild();

    radius = this.radius_ * ratio;
    angleRad = goog.math.toRadians(0);
    x = Math.round(this.cx_ + radius * Math.cos(angleRad));
    y = Math.round(this.cy_ + radius * Math.sin(angleRad));
    element.moveTo(x, y);

    element.circularArc(this.cx_, this.cy_, radius, radius, 0, 360);

    radius = this.radius_ * prevRatio;
    angleRad = goog.math.toRadians(360);
    x = Math.round(this.cx_ + radius * Math.cos(angleRad));
    y = Math.round(this.cy_ + radius * Math.sin(angleRad));
    element.lineTo(x, y);

    element.circularArc(this.cx_, this.cy_, radius, radius, 360, -360);

    element.close();
  }
};


/**
 * Draw angle line.
 * @param {number} angle .
 * @param {number} sweep .
 * @param {number} x .
 * @param {number} y .
 * @param {number} prevX .
 * @param {number} prevY .
 * @param {anychart.core.utils.TypedLayer} layer Layer to draw interlace.
 * @protected
 */
anychart.core.grids.Polar.prototype.drawInterlaceRadial = function(angle, sweep, x, y, prevX, prevY, layer) {
  if (!(isNaN(prevX) && isNaN(prevY))) {

    var element = layer.genNextChild();

    element.circularArc(this.cx_, this.cy_, this.radius_, this.radius_, angle, -sweep);
    element.lineTo(this.cx_, this.cy_);
    element.close();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.grids.Polar} An instance of {@link anychart.core.grids.Polar} class for method chaining.
 */
anychart.core.grids.Polar.prototype.draw = function() {
  var xScale = /** @type {anychart.scales.ScatterBase} */(this.xScale());
  var yScale = /** @type {anychart.scales.ScatterBase|anychart.scales.Ordinal} */(this.yScale());

  if (!xScale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.isRadial() && !yScale) {
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

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS_POSITION) ||
      this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {

    var layout;
    if (this.isRadial()) {
      layout = [this.drawLineRadial, this.drawInterlaceRadial];
    } else {
      layout = [this.drawLineCircuit, this.drawInterlaceCircuit];
    }

    this.evenFillElement().clear();
    this.oddFillElement().clear();
    this.lineElement().clear();

    var isOrdinal, ticks, ticksArray, ticksArrLen;
    /** @type {anychart.core.utils.TypedLayer} */
    var layer;

    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.radius_ = Math.min(parentBounds.width, parentBounds.height) / 2;
    this.cx_ = Math.round(parentBounds.left + parentBounds.width / 2);
    this.cy_ = Math.round(parentBounds.top + parentBounds.height / 2);

    var startAngle = this.startAngle() - 90;
    this.evenFillElement().clip(parentBounds);
    this.oddFillElement().clip(parentBounds);
    this.lineElement().clip(parentBounds);

    var drawLine = layout[0];
    var drawInterlace = layout[1];
    var i;

    if (this.isRadial()) {
      ticks = this.isMinor() ? xScale.minorTicks() : xScale.ticks();
      ticksArray = ticks.get();
      ticksArrLen = ticksArray.length - 1;

      var sweep = 360 / ticksArrLen;
      var angleRad, x, y, prevX = NaN, prevY = NaN, xRatio, angle;

      var lineThickness = this.stroke()['thickness'] ? this.stroke()['thickness'] : 1;
      var xPixelShift, yPixelShift;
      for (i = 0; i < ticksArrLen; i++) {
        xRatio = xScale.transform(ticksArray[i]);
        angle = goog.math.standardAngle(startAngle + 360 * xRatio);
        angleRad = goog.math.toRadians(angle);

        xPixelShift = 0;
        yPixelShift = 0;
        if (!angle) {
          yPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
        } else if (angle == 90) {
          xPixelShift = lineThickness % 2 == 0 ? 0 : -.5;
        } else if (angle == 180) {
          yPixelShift = lineThickness % 2 == 0 ? 0 : .5;
        } else if (angle == 270) {
          xPixelShift = lineThickness % 2 == 0 ? 0 : .5;
        }

        x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
        y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));
        layer = i % 2 == 0 ? this.evenFillElement_ : this.oddFillElement_;

        drawInterlace.call(this, angle, sweep, x, y, prevX, prevY, layer);
        if (!i) {
          if (this.drawLastLine_) drawLine.call(this, x, y, xPixelShift, yPixelShift);
        } else
          drawLine.call(this, x, y, xPixelShift, yPixelShift);

        prevX = x;
        prevY = y;
      }

      //draw last line on ordinal
      layer = i % 2 == 0 ? this.evenFillElement_ : this.oddFillElement_;
      angle = goog.math.standardAngle(startAngle);
      angleRad = angle * Math.PI / 180;
      x = Math.round(this.cx_ + this.radius_ * Math.cos(angleRad));
      y = Math.round(this.cy_ + this.radius_ * Math.sin(angleRad));
      drawInterlace.call(this, angle, sweep, x, y, prevX, prevY, layer);
    } else {
      isOrdinal = yScale instanceof anychart.scales.Ordinal;
      ticks = isOrdinal ? yScale.ticks() : this.isMinor() ? yScale.minorTicks() : yScale.ticks();
      ticksArray = ticks.get();
      ticksArrLen = ticksArray.length;

      var prevRatio = NaN;
      for (i = 0; i < ticksArrLen; i++) {
        var tickVal = ticksArray[i];
        var leftTick, rightTick;
        if (goog.isArray(tickVal)) {
          leftTick = tickVal[0];
          rightTick = tickVal[1];
        } else
          leftTick = rightTick = tickVal;

        var ratio = yScale.transform(leftTick);

        layer = i % 2 == 0 ? this.evenFillElement_ : this.oddFillElement_;

        if (i == ticksArrLen - 1) {
          if (isOrdinal) {
            drawInterlace.call(this, ratio, prevRatio, layer);
            layer = i % 2 == 0 ? this.oddFillElement_ : this.evenFillElement_;
            drawInterlace.call(this, yScale.transform(rightTick, 1), ratio, layer);
          } else {
            drawInterlace.call(this, ratio, prevRatio, layer);
          }
        } else {
          drawInterlace.call(this, ratio, prevRatio, layer);
        }

        if (i == ticksArrLen - 1) {
          if (isOrdinal) {
            drawLine.call(this, ratio);
            if (this.drawLastLine_) drawLine.call(this, yScale.transform(rightTick, 1));
          } else {
            if (this.drawLastLine_) drawLine.call(this, ratio);
          }
        } else if (i != 0) {
          drawLine.call(this, ratio);
        }
        prevRatio = ratio;
      }
    }

    this.markConsistent(anychart.ConsistencyState.GRIDS_POSITION);
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

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Polar.prototype.remove = function() {
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
anychart.core.grids.Polar.prototype.lineElement = function() {
  this.lineElement_ = this.lineElement_ ? this.lineElement_ : acgraph.path();
  this.registerDisposable(this.lineElement_);
  return this.lineElement_;
};


/**
 * @return {!anychart.core.utils.TypedLayer} Grid odd fill element.
 * @protected
 */
anychart.core.grids.Polar.prototype.oddFillElement = function() {
  this.oddFillElement_ = this.oddFillElement_ ?
      this.oddFillElement_ :
      new anychart.core.utils.TypedLayer(function() {
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
 * @return {!anychart.core.utils.TypedLayer} Grid event fill element.
 * @protected
 */
anychart.core.grids.Polar.prototype.evenFillElement = function() {
  this.evenFillElement_ = this.evenFillElement_ ?
      this.evenFillElement_ :
      new anychart.core.utils.TypedLayer(function() {
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
/** @inheritDoc */
anychart.core.grids.Polar.prototype.serialize = function() {
  var json = anychart.core.grids.Polar.base(this, 'serialize');
  json['isMinor'] = this.isMinor();
  if (this.layout_) json['layout'] = this.layout_;
  json['drawLastLine'] = this.drawLastLine();
  //json['startAngle'] = this.startAngle();
  json['oddFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.oddFill()));
  json['evenFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.evenFill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.grids.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.grids.Polar.base(this, 'setupByJSON', config, opt_default);
  this.isMinor(config['isMinor']);
  this.layout(config['layout']);
  this.drawLastLine(config['drawLastLine']);
  //this.startAngle(config['startAngle']);
  this.oddFill(config['oddFill']);
  this.evenFill(config['evenFill']);
  this.stroke(config['stroke']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.chart_) {
        this.axis((/** @type {anychart.charts.Polar} */(this.chart_)).getAxisByIndex(ax));
      }
    } else if (ax instanceof anychart.core.axes.Radial || ax instanceof anychart.core.axes.Polar) {
      this.axis(ax);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.grids.Polar.prototype.disposeInternal = function() {
  delete this.stroke_;
  this.axis_ = null;
  this.chart_ = null;
  anychart.core.grids.Polar.base(this, 'disposeInternal');
};


//proto['startAngle'] = proto.startAngle;
//exports
(function() {
  var proto = anychart.core.grids.Polar.prototype;
  proto['isMinor'] = proto.isMinor;
  proto['oddFill'] = proto.oddFill;
  proto['evenFill'] = proto.evenFill;
  proto['layout'] = proto.layout;
  proto['isRadial'] = proto.isRadial;
  proto['yScale'] = proto.yScale;
  proto['xScale'] = proto.xScale;
  proto['stroke'] = proto.stroke;
  proto['drawLastLine'] = proto.drawLastLine;
  proto['axis'] = proto.axis;
})();
