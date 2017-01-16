goog.provide('anychart.core.axisMarkers.PathBase');
goog.require('acgraph');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');



/**
 * Markers base.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axisMarkers.PathBase = function() {
  anychart.core.axisMarkers.PathBase.base(this, 'constructor');

  /**
   * Current value.
   * @type {*}
   * @protected
   */
  this.val;

  /**
   * Current scale.
   * @type {anychart.scales.Base|anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_;

  /**
   * Assigned axis.
   * @type {anychart.core.axes.Linear}
   * @private
   */
  this.axis_ = null;

  /**
   * Parent chart instance.
   * @type {anychart.core.SeparateChart}
   * @private
   */
  this.chart_ = null;

  /**
   * Marker element.
   * @type {acgraph.vector.Path} - Marker line element.
   * @private
   */
  this.markerElement_;

};
goog.inherits(anychart.core.axisMarkers.PathBase, anychart.core.VisualBase);


/**
 * @typedef {{
 *  from: (anychart.enums.GanttDateTimeMarkers|number),
 *  to: (anychart.enums.GanttDateTimeMarkers|number)
 * }}
 */
anychart.core.axisMarkers.PathBase.Range;


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart} chart - Chart instance.
 */
anychart.core.axisMarkers.PathBase.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.axisMarkers.PathBase.prototype.getChart = function() {
  return this.chart_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker layout.
 * @param {anychart.enums.Layout=} opt_value - Layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.PathBase} - Layout or this.
 */
anychart.core.axisMarkers.PathBase.prototype.layout = goog.abstractMethod;


/**
 * Getter/setter for default scale.
 * Works with instances of anychart.scales.Base only.
 * @param {(anychart.scales.Base|anychart.scales.GanttDateTime)=} opt_value - Scale.
 * @return {anychart.scales.Base|anychart.scales.GanttDateTime|!anychart.core.axisMarkers.PathBase} - Axis scale or
 *  itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.scaleInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = opt_value;
      if (this.scale_)
        this.scale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    if (this.scale_) {
      return /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */ (this.scale_);
    } else {
      if (this.axis_)
        return /** @type {?anychart.scales.Base} */ (this.axis_.scale());
      return null;
    }
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  this.invalidate(anychart.ConsistencyState.BOUNDS, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for value.
 * @param {*=} opt_value - Value to be set.
 * @return {*} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.valueInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.val !== opt_value) {
      this.val = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.val;
};


//----------------------------------------------------------------------------------------------------------------------
//  Axis.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.axisMarkers.PathBase.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Sets axis for marker.
 * @param {anychart.core.axes.Linear=} opt_value - Value to be set.
 * @return {(anychart.core.axes.Linear|anychart.core.axisMarkers.PathBase)} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_)
        this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);

      if (this.scale_)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = null;

      this.invalidate(anychart.ConsistencyState.BOUNDS,
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
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom - Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft - Right or right and left space.
 * @param {(string|number)=} opt_bottom - Bottom space.
 * @param {(string|number)=} opt_left - Left space.
 * @return {!(anychart.core.axisMarkers.PathBase|anychart.core.utils.Padding)} .
 */
anychart.core.axisMarkers.PathBase.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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


/**
 * Whether marker is horizontal.
 * @return {boolean} - If the marker is horizontal.
 */
anychart.core.axisMarkers.PathBase.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Additional action on bounds invalidation.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.boundsInvalidated = goog.nullFunction();


/**
 * Additional action on appearance invalidation.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.appearanceInvalidated = goog.nullFunction();


/**
 * Drawing.
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.draw = function() {
  if (!this.scale()) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

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

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.appearanceInvalidated();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.boundsInvalidated();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/**
 * For case of line marker.
 * @protected
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.drawLine = function() {
  var scale = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */ (this.scale());

  if (!scale) { //Here we can get null.
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  var el = /** @type {acgraph.vector.Path} */ (this.markerElement());

  var ratio = scale.transform(this.val, 0.5);
  if (isNaN(ratio)) return this;
  el.clear();

  if (ratio >= 0 && ratio <= 1) {
    var shift = el.strokeThickness() % 2 == 0 ? 0 : -.5;
    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();

    if (this.isHorizontal()) {
      var y = Math.round(bounds.getTop() + bounds.height - ratio * bounds.height);
      ratio == 1 ? y -= shift : y += shift;
      el.moveTo(bounds.getLeft(), y);
      el.lineTo(bounds.getRight(), y);
    } else {
      var x = Math.round(bounds.getLeft() + ratio * bounds.width);
      ratio == 1 ? x += shift : x -= shift;
      el.moveTo(x, bounds.getTop());
      el.lineTo(x, bounds.getBottom());
    }
    el.clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
  }
  return this;
};


/**
 * For case of range marker.
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.drawRange = function() {
  var range = /** @type {anychart.core.axisMarkers.PathBase.Range} */ (this.val);

  var scale = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */ (this.scale());

  if (!scale) { //Here we can get null.
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  var el = /** @type {acgraph.vector.Path} */ (this.markerElement());
  el.clear();

  var to = range.to;
  var from = range.from;

  //Safe transformation to ratio.
  var fromScaleRatio = scale.transform(from);
  var toScaleRatio = scale.transform(to);

  //Safe comparison - comparing numbers.
  if (fromScaleRatio > toScaleRatio) {
    to = range.from;
    from = range.to;
  }

  var fromRatio = scale.transform(from, 0);
  var toRatio = scale.transform(to, 1);

  var ratioMinValue = Math.min(toRatio, fromRatio);
  var ratioMaxValue = Math.max(toRatio, fromRatio);

  if (isNaN(ratioMinValue) || isNaN(ratioMaxValue)) return this;

  if (ratioMaxValue >= 0 && ratioMinValue <= 1) { //range or part of it is visible.
    // clamping to prevent range marker go out from the bounds. Ratio should be between 0 and 1.
    ratioMinValue = goog.math.clamp(ratioMinValue, 0, 1);
    ratioMaxValue = goog.math.clamp(ratioMaxValue, 0, 1);

    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();

    if (this.isHorizontal()) {
      var y_max = Math.floor(bounds.getBottom() - bounds.height * ratioMaxValue);
      var y_min = Math.ceil(bounds.getBottom() - bounds.height * ratioMinValue);
      var x_start = bounds.getLeft();
      var x_end = bounds.getRight();
      el.moveTo(x_start, y_max)
          .lineTo(x_end, y_max)
          .lineTo(x_end, y_min)
          .lineTo(x_start, y_min)
          .close();
    } else {
      var y_start = bounds.getBottom();
      var y_end = bounds.getTop();
      var x_min = Math.floor(bounds.getLeft() + (bounds.width * ratioMinValue));
      var x_max = Math.ceil(bounds.getLeft() + (bounds.width * ratioMaxValue));
      el.moveTo(x_min, y_start)
          .lineTo(x_min, y_end)
          .lineTo(x_max, y_end)
          .lineTo(x_max, y_start)
          .close();
    }
    el.clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
  }
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create marker element.
 * @return {!acgraph.vector.Path} - Marker line element.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.markerElement = function() {
  if (!this.markerElement_) {
    this.markerElement_ = /** @type {!acgraph.vector.Path} */(acgraph.path());
    this.registerDisposable(this.markerElement_);
  }
  return this.markerElement_;
};


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.PathBase.base(this, 'setupByJSON', config, opt_default);
  if ('layout' in config && config['layout']) this.layout(config['layout']);
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


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.chart_ = null;
  anychart.core.axisMarkers.PathBase.base(this, 'disposeInternal');
};
