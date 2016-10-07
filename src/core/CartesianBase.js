goog.provide('anychart.core.CartesianBase');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');



/**
 * CartesianBase chart class.
 * @extends {anychart.core.ChartWithAxes}
 * @implements {anychart.core.utils.IZoomableChart}
 * @constructor
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.core.CartesianBase = function(opt_barChartMode) {
  anychart.core.CartesianBase.base(this, 'constructor', true, opt_barChartMode);

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.xZoom_ = new anychart.core.utils.OrdinalZoom(this, true);

  this.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  this.setType(anychart.enums.ChartTypes.CARTESIAN);
};
goog.inherits(anychart.core.CartesianBase, anychart.core.ChartWithAxes);


//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.core.CartesianBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
    anychart.ConsistencyState.CARTESIAN_ZOOM;


/**
 * Sets chart type. Needed for proper serialization.
 * @param {anychart.enums.ChartTypes} value
 */
anychart.core.CartesianBase.prototype.setType = function(value) {
  /**
   * @type {anychart.enums.ChartTypes}
   * @private
   */
  this.type_ = value;
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getType = function() {
  return this.type_;
};


//endregion
//region --- Zoom and scroller
//----------------------------------------------------------------------------------------------------------------------
//
//  Zoom and scroller
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Invalidates zoom.
 * @param {boolean} forX
 */
anychart.core.CartesianBase.prototype.invalidateZoom = function(forX) {
  // we do not distinguish between x and y zoom because we have only the x one
  this.invalidate(anychart.ConsistencyState.CARTESIAN_ZOOM, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns default scale for given dimension.
 * @param {boolean} forX
 * @return {anychart.scales.Base}
 */
anychart.core.CartesianBase.prototype.getDefaultScale = function(forX) {
  return /** @type {anychart.scales.Base} */(forX ? this.xScale() : this.yScale());
};


/**
 * Ensures that scales are ready for zooming.
 */
anychart.core.CartesianBase.prototype.ensureScalesReadyForZoom = function() {
  this.makeScaleMaps();
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SCALES)) {
    if (!!this.xZoom().getSetup())
      this.calculateXScales();
  }
};


/**
 * Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.core.CartesianBase|anychart.core.utils.OrdinalZoom}
 */
anychart.core.CartesianBase.prototype.xZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.xZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.xZoom_;
};


/**
 * Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.xScroller = function(opt_value) {
  if (!this.xScroller_) {
    this.xScroller_ = new anychart.core.ui.ChartScroller();
    this.xScroller_.setParentEventTarget(this);
    this.xScroller_.listenSignals(this.scrollerInvalidated_, this);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler_);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler_);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.xScroller_.setup(opt_value);
    return this;
  } else {
    return this.xScroller_;
  }
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.CartesianBase.prototype.scrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.CARTESIAN_X_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.core.CartesianBase.prototype.scrollerChangeHandler_ = function(e) {
  if (this.xZoom_.continuous() ^ e.type == anychart.enums.EventType.SCROLLER_CHANGE_FINISH) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    this.xZoom_.setTo(e['startRatio'], e['endRatio']);
    this.resumeSignalsDispatching(true);
  }
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Cartesian(this, this, type, config, true);
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeCartesianSeriesType(type);
};


//endregion
//region --- Bounds
//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.getBoundsWithoutAxes = function(contentAreaBounds, opt_scrollerSize) {
  var scroller = this.xScroller();
  var scrollerBeforeAxes = scroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES;
  scroller.padding(0);
  scroller.parentBounds(contentAreaBounds);
  var scrollerHorizontal = scroller.isHorizontal();
  var scrollerSize = opt_scrollerSize;
  if (scrollerBeforeAxes) {
    if (scrollerHorizontal) {
      scrollerSize = contentAreaBounds.height - scroller.getRemainingBounds().height;
    } else {
      scrollerSize = contentAreaBounds.width - scroller.getRemainingBounds().width;
    }
  } else {
    contentAreaBounds = scroller.getRemainingBounds();
  }
  return anychart.core.CartesianBase.base(this, 'getBoundsWithoutAxes', contentAreaBounds, scrollerSize);
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  var scroller = /** @type {anychart.core.ui.ChartScroller} */(this.xScroller());
  if (scroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES) {
    switch (scroller.orientation()) {
      case anychart.enums.Orientation.TOP:
        scroller.padding()[anychart.opt.TOP](offsets[0] + (this.topAxisPadding_ || 0));
        scroller.padding()[anychart.opt.BOTTOM](0);
        offsets[0] += scrollerSize;
        break;
      case anychart.enums.Orientation.BOTTOM:
        scroller.padding()[anychart.opt.TOP](0);
        scroller.padding()[anychart.opt.BOTTOM](offsets[2] + (this.bottomAxisPadding_ || 0));
        offsets[2] += scrollerSize;
        break;
      case anychart.enums.Orientation.LEFT:
        scroller.padding()[anychart.opt.LEFT](offsets[3] + (this.leftAxisPadding_ || 0));
        scroller.padding()[anychart.opt.RIGHT](0);
        offsets[3] += scrollerSize;
        break;
      case anychart.enums.Orientation.RIGHT:
        scroller.padding()[anychart.opt.LEFT](0);
        scroller.padding()[anychart.opt.RIGHT](offsets[1] + (this.rightAxisPadding_ || 0));
        offsets[1] += scrollerSize;
        break;
    }
  }

  if (scroller.isHorizontal()) {
    scroller.padding()[anychart.opt.LEFT](offsets[3]);
    scroller.padding()[anychart.opt.RIGHT](offsets[1]);
  } else {
    scroller.padding()[anychart.opt.TOP](offsets[0]);
    scroller.padding()[anychart.opt.BOTTOM](offsets[2]);
  }
  return offsets;
};


//endregion
//region --- Calculations
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.applyXZoom = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_ZOOM)) {
    for (var i in this.xScales) {
      var start = this.xZoom().getStartRatio();
      var factor = 1 / (this.xZoom().getEndRatio() - start);
      (/** @type {anychart.scales.Base} */(this.xScales[i])).setZoom(factor, start);
    }
    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_ZOOM);
    this.invalidate(
        anychart.ConsistencyState.SERIES_CHART_Y_SCALES |
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.AXES_CHART_ANNOTATIONS);
  }
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getZoomStartRatio = function() {
  return this.xZoom_.getStartRatio();
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getZoomEndRatio = function() {
  return this.xZoom_.getEndRatio();
};


//endregion
//region --- Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.getBoundsChangedSignal = function() {
  return anychart.core.CartesianBase.base(this, 'getBoundsChangedSignal') | anychart.ConsistencyState.CARTESIAN_X_SCROLLER;
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.drawElements = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_X_SCROLLER)) {
    this.xScroller().container(this.rootElement);
    this.xScroller().draw();
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }

  anychart.core.CartesianBase.base(this, 'drawElements');
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.setupByJSONWithScales = function(config, scalesInstances) {
  anychart.core.CartesianBase.base(this, 'setupByJSONWithScales', config, scalesInstances);

  this.barGroupsPadding(config['barGroupsPadding']);
  this.barsPadding(config['barsPadding']);
  this.xScroller(config['xScroller']);

  var xZoom = config['xZoom'];
  if (goog.isObject(xZoom) && (goog.isNumber(xZoom['scale']) || goog.isString(xZoom['scale']))) {
    var tmp = xZoom['scale'];
    xZoom['scale'] = scalesInstances[xZoom['scale']];
    this.xZoom(xZoom);
    xZoom['scale'] = tmp;
  } else {
    this.xZoom(xZoom);
  }
};


/**
 * @inheritDoc
 */
anychart.core.CartesianBase.prototype.serialize = function() {
  var json = anychart.core.CartesianBase.base(this, 'serialize');
  json['type'] = this.type_;
  json['barGroupsPadding'] = this.barGroupsPadding();
  json['barsPadding'] = this.barsPadding();
  json['xScroller'] = this.xScroller().serialize();
  json['xZoom'] = this.xZoom().serialize();
  return {'chart': json};
};


//endregion
