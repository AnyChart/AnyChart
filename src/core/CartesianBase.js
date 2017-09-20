goog.provide('anychart.core.CartesianBase');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');



/**
 * CartesianBase chart class.
 * @param {boolean=} opt_categorizeData
 * @extends {anychart.core.ChartWithAxes}
 * @implements {anychart.core.utils.IZoomableChart}
 * @constructor
 */
anychart.core.CartesianBase = function(opt_categorizeData) {
  anychart.core.CartesianBase.base(this, 'constructor', goog.isDef(opt_categorizeData) ? opt_categorizeData : true);

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.xZoom_ = new anychart.core.utils.OrdinalZoom(this, true);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['zAngle', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['zAspect', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['zDistribution', anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['zPadding', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.CartesianBase, anychart.core.ChartWithAxes);


//region --- 3D
//----------------------------------------------------------------------------------------------------------------------
//
//  3D
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.CartesianBase.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function zAngleNormalizer(opt_value) {
    return goog.math.clamp(anychart.utils.toNumber(opt_value), 0, 90);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'zAngle',
      zAngleNormalizer);

  function zAspectNormalizer(opt_value) {
    return goog.isNumber(opt_value) ? Math.max(opt_value, 0) : opt_value;
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'zAspect',
      zAspectNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'zDistribution',
      anychart.core.settings.booleanNormalizer);

  function zPaddingNormalizer(opt_value) {
    return Math.max(anychart.utils.toNumber(opt_value), 0) || 0;
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'zPadding',
      zPaddingNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.core.CartesianBase, anychart.core.CartesianBase.PROPERTY_DESCRIPTORS);


//endregion
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
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
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
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler);
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
 * @protected
 */
anychart.core.CartesianBase.prototype.scrollerChangeHandler = function(e) {
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
  var scroller = /** @type {anychart.core.ui.ChartScroller} */(this.xScroller());
  var res = this.resetScrollerPosition(scroller, contentAreaBounds);
  return anychart.core.CartesianBase.base(this, 'getBoundsWithoutAxes', res.contentAreaBounds, res.scrollerSize);
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  return this.applyScrollerOffsetInternal(offsets, /** @type {anychart.core.ui.ChartScroller} */(this.xScroller()), scrollerSize);
};


/**
 * Resets scroller position and returns new contentAreaBounds and scrollerSize if nessesary.
 * @param {anychart.core.ui.ChartScroller} scroller
 * @param {anychart.math.Rect} contentAreaBounds
 * @return {{contentAreaBounds: anychart.math.Rect, scrollerSize: number}}
 * @protected
 */
anychart.core.CartesianBase.prototype.resetScrollerPosition = function(scroller, contentAreaBounds) {
  var scrollerBeforeAxes = scroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES;
  scroller.padding(0);
  scroller.parentBounds(contentAreaBounds);
  var scrollerHorizontal = scroller.isHorizontal();
  var scrollerSize = NaN;
  if (scrollerBeforeAxes) {
    if (scrollerHorizontal) {
      scrollerSize = contentAreaBounds.height - scroller.getRemainingBounds().height;
    } else {
      scrollerSize = contentAreaBounds.width - scroller.getRemainingBounds().width;
    }
  } else {
    contentAreaBounds = scroller.getRemainingBounds();
  }
  return {contentAreaBounds: contentAreaBounds, scrollerSize: scrollerSize};
};


/**
 *
 * @param {Array.<number>} offsets
 * @param {anychart.core.ui.ChartScroller} scroller
 * @param {number} scrollerSize
 * @return {Array.<number>}
 * @protected
 */
anychart.core.CartesianBase.prototype.applyScrollerOffsetInternal = function(offsets, scroller, scrollerSize) {
  if (scroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES) {
    switch (scroller.orientation()) {
      case anychart.enums.Orientation.TOP:
        scroller.padding()['top'](offsets[0] + (this.topAxisPadding_ || 0));
        scroller.padding()['bottom'](0);
        offsets[0] += scrollerSize;
        break;
      case anychart.enums.Orientation.BOTTOM:
        scroller.padding()['top'](0);
        scroller.padding()['bottom'](offsets[2] + (this.bottomAxisPadding_ || 0));
        offsets[2] += scrollerSize;
        break;
      case anychart.enums.Orientation.LEFT:
        scroller.padding()['left'](offsets[3] + (this.leftAxisPadding_ || 0));
        scroller.padding()['right'](0);
        offsets[3] += scrollerSize;
        break;
      case anychart.enums.Orientation.RIGHT:
        scroller.padding()['left'](0);
        scroller.padding()['right'](offsets[1] + (this.rightAxisPadding_ || 0));
        offsets[1] += scrollerSize;
        break;
    }
  }

  if (scroller.isHorizontal()) {
    scroller.padding()['left'](offsets[3]);
    scroller.padding()['right'](offsets[1]);
  } else {
    scroller.padding()['top'](offsets[0]);
    scroller.padding()['bottom'](offsets[2]);
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
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
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
  anychart.core.CartesianBase.base(this, 'drawElements');
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_X_SCROLLER)) {
    this.xScroller().container(this.rootElement);
    this.xScroller().draw();
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }
};


//endregion
//region --- CSV
//------------------------------------------------------------------------------
//
//  CSV
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.shouldAddCsvRow = function(mode, series, x) {
  var xScale = this.getCsvSourceXScale(series);
  var left = xScale.transform(x, 0);
  var right = xScale.transform(x, 1);
  return mode != anychart.enums.ChartDataExportMode.SELECTED ||
      (Math.min(left, right) <= 1 && Math.max(left, right) >= 0);
};



/**
 * @param {*} series
 * @return {anychart.scales.IXScale}
 * @protected
 */
anychart.core.CartesianBase.prototype.getCsvSourceXScale = function(series) {
  return (/** @type {anychart.core.series.Base} */(series)).getXScale();
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.core.CartesianBase.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.CartesianBase.PROPERTY_DESCRIPTORS, config);
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
  anychart.core.settings.serialize(this, anychart.core.CartesianBase.PROPERTY_DESCRIPTORS, json);
  json['type'] = this.getType();
  json['xScroller'] = this.xScroller().serialize();
  json['xZoom'] = this.xZoom().serialize();
  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.core.CartesianBase.prototype.disposeInternal = function() {
  anychart.core.CartesianBase.base(this, 'disposeInternal');
  goog.dispose(this.xScroller_);
  this.xScroller_ = null;
};


//endregion
