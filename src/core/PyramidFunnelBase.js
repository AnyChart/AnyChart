goog.provide('anychart.core.PyramidFunnelBase');

goog.require('anychart.animations.AnimationSerialQueue');
goog.require('anychart.animations.PyramidFunnelAnimation');
goog.require('anychart.animations.PyramidFunnelLabelAnimation');
goog.require('anychart.color');
goog.require('anychart.core.Point');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.PointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.palettes');
goog.require('anychart.utils');



/**
 * Pyramid/Funnel Base Chart Class.<br/>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.core.PyramidFunnelBase = function(opt_data, opt_csvSettings) {
  anychart.core.PyramidFunnelBase.base(this, 'constructor');
  this.suspendSignalsDispatching();

  /**
   * The width of the connector compared to the ((bounds.width - baseWidth) / 2), or the pixel width if it is a number.
   * Defaults to 20 px.
   * @type {!(string|number)}
   * @private
   */
  this.connectorLength_;

  /**
   * @type {!acgraph.vector.Stroke}
   * @private
   */
  this.connectorStroke_;

  /**
   * Default fill function.
   * this {{index:number, sourceColor: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a chart point.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.fill_;

  /**
   * Hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hatchFill_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * The width of the pyramid/funnel compared to the width of the bounds, or the pixel width if it is a number.
   * Defaults to 90%.
   * @type {(string|number)}
   * @private
   */
  this.baseWidth_;

  /**
   * Default fill function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a chart point in hover state.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.hoverFill_;

  /**
   * Hover hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hoverHatchFill_;

  /**
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.hoverMarkers_ = null;

  /**
   * Default stroke function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a chart point in hover state.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverStroke_;

  /**
   * Default fill function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a chart point in hover state.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.selectFill_;

  /**
   * Select hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.selectHatchFill_;

  /**
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.selectMarkers_ = null;

  /**
   * Default stroke function for select state.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a chart point in hover state.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.selectStroke_;

  /**
   * @type {!anychart.data.Iterator}
   * @private
   */
  this.iterator_;

  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labels_ = null;

  /**
   * List of all label domains
   * @type {Array.<anychart.core.PyramidFunnelBase.LabelsDomain>}
   */
  this.labelDomains = [];

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markers_ = null;

  /**
   * The minimum height of the point.
   * @type {number}
   * @private
   */
  this.minHeightOfPoint_ = 1;

  /**
   * The height of the neck. (for funnel)
   * @type {!(string|number)}
   * @private
   */
  this.neckHeight_ = NaN;

  /**
   * The width of the neck. (for funnel)
   * @type {!(string|number)}
   * @private
   */
  this.neckWidth_ = NaN;

  /**
   * Chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;

  /**
   * Original view for the chart data.
   * @type {anychart.data.View}
   * @private
   */
  this.parentView_ = null;

  /**
   * Chart point provider.
   * @type {anychart.core.utils.PointContextProvider}
   * @private
   */
  this.pointProvider_;

  /**
   * The distance between points in pixels (or percent) of the bounds height.
   * Defaults to 5.
   * @type {!(string|number)}
   * @private
   */
  this.pointsPadding_ = 3;

  /**
   * Specifies that the pyramid is inverted base up.
   * @type {boolean}
   * @private
   */
  this.reversed_ = false;

  /**
   * Default stroke function.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a chart point.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.stroke_ = (function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor'], .2));
  });

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.data(opt_data || null, opt_csvSettings);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.PyramidFunnelBase, anychart.core.SeparateChart);


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.rawData_;


/**
 * Series element z-index in series root layer.
 * @type {number}
 * @const
 */
anychart.core.PyramidFunnelBase.ZINDEX_PYRAMID_FUNNEL = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 * @const
 */
anychart.core.PyramidFunnelBase.ZINDEX_HATCH_FILL = 31;


/**
 * Z-index for labels connectors.
 * @type {number}
 * @const
 */
anychart.core.PyramidFunnelBase.ZINDEX_LABELS_CONNECTOR = 32;


/**
 * The length of the connector may not be less than the value of this constant.
 * @type {number}
 * @const
 */
anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH = 5;


/**
 * The maximum number of iterations for overlap correction.
 * @type {number}
 * @const
 * @private
 */
anychart.core.PyramidFunnelBase.OVERLAP_CORRECTION_ITERATION_COUNT_MAX_ = 10;


/**
 * Ratio of pyramid/funnel animation duration.
 * Full pyramid/funnel animation consists of 2 serial animations (pyramid/funnel points animation and labels animation).
 * So this ratio shows pyramid/funnel points animation duration.
 * Left ratio goes to labels animation.
 *
 * In default case of 1000ms duration:
 *   pyramid/funnel points animation duration will be 550ms.
 *   labels animation - 450ms.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.PIE_ANIMATION_DURATION_RATIO = 0.85;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
    anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
    anychart.ConsistencyState.PYRAMID_FUNNEL_DATA;


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.getAllSeries = function() {
  return [this];
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.PyramidFunnelBase.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is size based.
 * @return {boolean}
 */
anychart.core.PyramidFunnelBase.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.isSeries = function() {
  return true;
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.data.View|!anychart.core.PyramidFunnelBase)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.PyramidFunnelBase.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      if (opt_value['caption']) this.title(opt_value['caption']);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (this.parentView_ != opt_value || goog.isNull(opt_value)) {

        // drop data cache
        goog.dispose(this.parentViewToDispose_);
        delete this.iterator_;

        /**
         * @type {anychart.data.View}
         */
        var parentView;
        if (opt_value instanceof anychart.data.View) {
          parentView = opt_value;
          this.parentViewToDispose_ = null;
        } else {
          if (opt_value instanceof anychart.data.Set)
            parentView = (this.parentViewToDispose_ = opt_value).mapAs();
          else if (goog.isArray(opt_value) || goog.isString(opt_value))
            parentView = (this.parentViewToDispose_ = new anychart.data.Set(opt_value, opt_csvSettings)).mapAs();
          else
            parentView = (this.parentViewToDispose_ = new anychart.data.Set(null)).mapAs();
          this.registerDisposable(this.parentViewToDispose_);
        }
        this.parentView_ = parentView.derive();
      }

      goog.dispose(this.view_);
      this.view_ = this.parentView_;
      this.view_.listenSignals(this.dataInvalidated_, this);
      this.registerDisposable(this.view_);
      this.invalidate(
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
          anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
          anychart.ConsistencyState.CHART_LEGEND |
          anychart.ConsistencyState.PYRAMID_FUNNEL_DATA,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.DATA_CHANGED
      );
    }
    return this;
  }
  return this.view_;
};


/**
 * Internal data invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
        anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.PYRAMID_FUNNEL_DATA,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.DATA_CHANGED
    );
  }
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current chart view iterator.
 */
anychart.core.PyramidFunnelBase.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.PyramidFunnelBase.prototype.getResetIterator = function() {
  return this.iterator_ = this.view_.getIterator();
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator} Detached iterator.
 */
anychart.core.PyramidFunnelBase.prototype.getDetachedIterator = function() {
  return this.view_.getIterator();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Color.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  var sourceColor, scope;
  if (goog.isFunction(color)) {
    sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().itemAt(index);
    scope = {
      'index': index,
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.colorizePoint_ = function(pointState) {
  var point = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('point'));
  if (goog.isDef(point)) {
    var fillColor = this.getFinalFill(true, pointState);
    point.fill(fillColor);

    var strokeColor = this.getFinalStroke(true, pointState);
    point.stroke(strokeColor);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Palette.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.PyramidFunnelBase)} .
 */
anychart.core.PyramidFunnelBase.prototype.palette = function(opt_value) {
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
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.core.PyramidFunnelBase)} Return current chart markers palette or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.core.PyramidFunnelBase)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();

    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }

    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Fill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.PyramidFunnelBase|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = /** @type {acgraph.vector.Fill}*/(fill);
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter/setter for hoverFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.PyramidFunnelBase|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.hoverFill_) {
      this.hoverFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Getter/setter for the chart points fill in the select state.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.PyramidFunnelBase|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.selectFill_) {
      this.selectFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectFill_;
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && iterator.get('fill')) || this.fill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('selectFill')) || this.selectFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  HatchFill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for hatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.PyramidFunnelBase|Function|boolean} Hatch fill.
 */
anychart.core.PyramidFunnelBase.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hatchFill_);
};


/**
 * Getter/setter for hoverHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.PyramidFunnelBase|Function|boolean} Hatch fill.
 */
anychart.core.PyramidFunnelBase.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.hoverHatchFill_ != hatchFill)
      this.hoverHatchFill_ = hatchFill;

    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hoverHatchFill_);
};


/**
 * Getter/setter for current select hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.PyramidFunnelBase|Function|boolean} Hatch fill.
 */
anychart.core.PyramidFunnelBase.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.selectHatchFill_ != hatchFill)
      this.selectHatchFill_ = hatchFill;

    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.selectHatchFill_);
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (usePointSettings && goog.isDef(iterator.get('selectHatchFill'))) {
      hatchFill = iterator.get('selectHatchFill');
    } else if (goog.isDef(this.selectHatchFill())) {
      hatchFill = this.selectHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(
        /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? /** @type {acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.applyHatchFill = function(pointState) {
  var hatchPoint = /** @type {acgraph.vector.Path} */(this.getIterator().meta('hatchPoint'));
  if (goog.isDefAndNotNull(hatchPoint)) {
    hatchPoint
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Stroke.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter/setter for hoverStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.hoverStroke_) {
      this.hoverStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Getter for the chart points stroke in the select state.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.selectStroke_) {
      this.selectStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectStroke_;
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */((usePointSettings && iterator.get('stroke')) || this.stroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('selectStroke')) || this.selectStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('hoverStroke')) || this.hoverStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.remove = function() {
  this.markers().container(null);
  this.labels().container(null);
  this.clearLabelDomains_();

  if (this.dataLayer_) this.dataLayer_.parent(null);

  anychart.core.PyramidFunnelBase.base(this, 'remove');
};


/**
 * Draw chart chart content items.
 * @param {anychart.math.Rect} bounds Bounds of chart content area.
 */
anychart.core.PyramidFunnelBase.prototype.drawContent = function(bounds) {
  if (this.isConsistent()) return;

  this.calculate();

  var iterator = this.getIterator();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
  }

  // if (!this.tooltip().container()) {
  //   this.tooltip().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  // }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.clear();
    } else {
      this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.registerDisposable(this.dataLayer_);
      this.dataLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_PYRAMID_FUNNEL);
      this.dataLayer_.parent(this.rootElement);
    }

    if (this.hatchLayer_) {
      this.hatchLayer_.clear();
    } else {
      this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.registerDisposable(this.hatchLayer_);
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_HATCH_FILL).disablePointerEvents(true);
    }

    if (this.palette_ && this.palette_ instanceof anychart.palettes.RangeColors) {
      this.palette_.count(iterator.getRowsCount());
    }

    this.pointsPaddingValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.pointsPadding_, bounds.height), 2));
    this.baseWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.baseWidth_, bounds.width), 2));
    this.neckWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.neckWidth_, bounds.width), 2));
    this.neckHeightValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.neckHeight_, bounds.height), 2));
    this.neckYValue_ = bounds.top + bounds.height - this.neckHeightValue_;
    this.centerXValue_ = bounds.width / 2;

    this.connectorLengthValue_ = anychart.utils.normalizeSize(
        this.connectorLength_, ((bounds.width - this.baseWidthValue_) / 2));
    if (this.connectorLengthValue_ < 0) {
      this.connectorLengthValue_ = anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }

    this.boundsValue_ = bounds;

    var startY = 0;
    var value;
    var isMissing;

    var countMissing = iterator.getRowsCount() - anychart.utils.toNumber(this.statistics[anychart.enums.Statistics.COUNT]);
    var paddingPercent = anychart.math.round(this.pointsPaddingValue_ / bounds.height * 100, 2);

    iterator.reset();
    while (iterator.advance()) {
      value = iterator.get('value');
      isMissing = this.isMissing_(value);
      value = this.handleValue_(value);

      var percent = anychart.math.round(value / anychart.utils.toNumber(this.statistics[anychart.enums.Statistics.SUM]) * 100, 2);
      if (isMissing) {
        percent = paddingPercent;
      }

      var height = anychart.math.round(bounds.height / (100 + countMissing * paddingPercent) * percent, 2);
      if (!height) {
        height = this.minHeightOfPoint_;
      }

      iterator.meta('value', value);
      iterator.meta('height', height);
      iterator.meta('startY', startY);
      iterator.meta('missing', isMissing);

      startY += height;

      // If the labels do not fit, then we need to move the center point.
      this.shiftCenterX_();
    }

    // drawPoint_ must be called independently since centerX may be shifted at any iteration of the iterator.
    iterator.reset();
    while (iterator.advance()) {
      var index = iterator.getIndex();
      if (iterator.get('selected'))
        this.state.setPointState(anychart.PointState.SELECT, index);

      this.drawPoint_();
    }

    if (this.drawnConnectors_) {
      for (var i in this.drawnConnectors_) {
        if (this.drawnConnectors_.hasOwnProperty(i))
          this.drawnConnectors_[i].stroke(this.connectorStroke_);
      }
    }

    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS)) {
    if (!this.markers().container()) this.markers_.container(this.rootElement);
    this.markers().clear();

    iterator.reset();
    while (iterator.advance()) {

      this.drawMarker(this.state.seriesState | this.state.getPointStateByIndex(iterator.getIndex()));
    }

    this.markers().draw();
    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS)) {
    if (!this.labels().container()) this.labels_.container(this.rootElement);
    this.labels().clear();
    if (this.connectorsLayer_) {
      this.connectorsLayer_.clear();
    }

    var themePart = this.isInsideLabels() ?
        anychart.getFullTheme('pie.insideLabels') :
        anychart.getFullTheme('pie.outsideLabels');
    this.labels().setAutoColor(themePart['autoColor']);
    this.labels().disablePointerEvents(themePart['disablePointerEvents']);

    if (!this.isInsideLabels()) {
      this.connectorLengthValue_ = anychart.utils.normalizeSize(
          this.connectorLength_, ((bounds.width - this.baseWidthValue_) / 2));
      // foolproof
      if (this.connectorLengthValue_ < 0) {
        this.connectorLengthValue_ = anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
      }

      // init connector element
      if (this.connectorsLayer_) {
        this.connectorsLayer_.clear();
      } else {
        this.connectorsLayer_ = new anychart.core.utils.TypedLayer(function() {
          return acgraph.path();
        }, function(child) {
          (/** @type {acgraph.vector.Path} */ (child)).clear();
        });
        this.registerDisposable(this.connectorsLayer_);
        this.connectorsLayer_.parent(this.rootElement);
        this.connectorsLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_LABELS_CONNECTOR);
      }
      this.connectorsLayer_.clip(bounds);
      this.drawnConnectors_ = [];
    }

    iterator.reset();
    while (iterator.advance()) {
      // fix for change position to inside after draw
      if (this.isInsideLabels()) {
        // reset 'labelWidthForced' meta
        iterator.meta('labelWidthForced', undefined);
      }

      this.drawLabel_(this.state.seriesState | this.state.getPointStateByIndex(iterator.getIndex()));
    }
    this.overlapCorrection_();

    this.labels().draw();
    this.labels().getDomElement().clip(bounds);

    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
  }
};


/**
 * @return {*}
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getProperThemePart = function() {
  return anychart.getFullTheme('pyramid');
};


/**
 * Return the width at a specific Y coordinate.
 * @param {number} y
 * @return {number}
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.getWidthAtY_ = function(y) {
  var width = this.baseWidthValue_;
  var height = this.boundsValue_.height;
  var neckWidth = this.neckWidthValue_;
  var neckHeight = this.neckHeightValue_;
  return y > height - neckHeight || height == neckHeight ?
      neckWidth :
      neckWidth + (width - neckWidth) * ((height - neckHeight - y) / (height - neckHeight));
};


/**
 * All missing values are equal to zero.
 * @param {*} value
 * @return {number}
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.handleValue_ = function(value) {
  return this.isMissing_(value) ? 0 : anychart.utils.toNumber(value);
};


/**
 * Checks that value represents missing point.
 * @param {*} value
 * @return {boolean} Is value represents missing value.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.isMissing_ = function(value) {
  value = anychart.utils.toNumber(value);
  return value <= 0 || !goog.math.isFiniteNumber(value);
};


/**
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.calculatePoint_ = function() {
  var iterator = this.getIterator();
  var index = /** @type {number} */ (iterator.getIndex());

  var bounds = this.boundsValue_;

  /*
   *
   * Funnel/reversed Pyramid (not have neck)
   *
   * x1,y1 ________________ x2,y1
   *  \                         /
   *   \                       /
   *    \                     /
   *     \                   /
   *      \                 /
   *     x3,y2 ________ x4,y2
   *
   *             Neck
   *
   *       |               |
   *       |               |
   *       |               |
   *     x3,y3 _________ x4,y3
   */

  /*
   *
   * Pyramid (not have neck)
   *
   *     x1,y1 _______ x2,y1
   *       /             \
   *      /               \
   *     /                 \
   *    /                   \
   *   /                     \
   *  x3,y2 ______________ x4,y2
   *
   */

  var x1, x2, x3, x4;
  var y1, y2, y3;

  var halfHeight = /** @type {number} */ (iterator.meta('height')) / 2;

  // --------- Y ----------
  y1 = /** @type {number} */ (iterator.meta('startY'));
  y2 = /** @type {number} */ (iterator.meta('height')) + y1;
  y3 = null;

  var pointsPadding = this.pointsPaddingValue_;

  if (pointsPadding) {
    // first point
    if (!index) {
      y2 = y2 - pointsPadding / 2;

      // catch error
      if (y2 < y1) {
        y2 = this.minHeightOfPoint_;
      }

      // last point
    } else if (index == iterator.getRowsCount() - 1) {
      y1 = y1 + pointsPadding / 2;

      // catch error
      if (y1 > y2) {
        y1 = y2 - this.minHeightOfPoint_;
      }

      // between points
    } else {
      y1 = y1 + pointsPadding / 2;
      y2 = y2 - pointsPadding / 2;

      // catch error
      if (y1 > y2) {
        y1 = /** @type {number} */ (iterator.meta('startY') + halfHeight);
        y2 = y1 + this.minHeightOfPoint_;

      }
    }
  }
  // ------- END Y --------

  // --------- X ----------
  var width = this.getWidthAtY_(y1);
  x1 = this.centerXValue_ - width / 2;
  x2 = x1 + width;
  width = this.getWidthAtY_(y2);
  x3 = this.centerXValue_ - width / 2;
  x4 = x3 + width;
  // ------- END X --------

  // Y coordinate must consider the bounds in order to detect the beginning of the neck.
  y1 = y1 + bounds.top;
  y2 = y2 + bounds.top;

  x1 = bounds.left + x1;
  x2 = bounds.left + x2;

  // The top of the neck
  if (this.neckHeightValue_ > 0 && y1 < this.neckYValue_ && y2 > this.neckYValue_) {
    y3 = y2;
    y2 = this.neckYValue_;

    width = this.getWidthAtY_(y2);
    x3 = this.centerXValue_ - width / 2;
    x4 = x3 + width;
  }

  x3 = bounds.left + x3;
  x4 = bounds.left + x4;

  if (!this.reversed_) {
    y1 = bounds.height - (y1 - bounds.top) + bounds.top;
    y2 = bounds.height - (y2 - bounds.top) + bounds.top;
    y3 = (y3 ? bounds.height - (y3 - bounds.top) + bounds.top : null);

    // reverse coordinates (destructuring assignment) for true top/bottom, need for markers positioning
    y1 = [y2, y2 = y1][0];
    x1 = [x3, x3 = x1][0];
    x2 = [x4, x4 = x2][0];
  }

  iterator.meta('x1', x1);
  iterator.meta('x2', x2);
  iterator.meta('x3', x3);
  iterator.meta('x4', x4);
  iterator.meta('y1', y1);
  iterator.meta('y2', y2);
  iterator.meta('y3', y3);
};


/**
 * Updates point on animate.
 * @param {anychart.data.Iterator} point
 */
anychart.core.PyramidFunnelBase.prototype.updatePointOnAnimate = function(point) {
  var shape = point.meta('point');
  shape.clear();

  var x1 = point.meta('x1');
  var x2 = point.meta('x2');
  var x3 = point.meta('x3');
  var x4 = point.meta('x4');
  var y1 = point.meta('y1');
  var y2 = point.meta('y2');
  var y3 = point.meta('y3');

  shape.moveTo(x1, y1)
      .lineTo(x2, y1);

  // drawing neck
  if (point.meta('neck')) {
    shape.lineTo(x4, y2)
        .lineTo(x4, y3)
        .lineTo(x3, y3)
        .lineTo(x3, y2);
  } else {
    shape.lineTo(x4, y2)
        .lineTo(x3, y2);
  }
  shape.close();

  var hatchPoint = /** @type {!acgraph.vector.Path} */ (point.meta('hatchPoint'));
  if (hatchPoint) {
    this.getIterator().select(point.getIndex());
    hatchPoint.clear();
    hatchPoint.deserialize(shape.serialize());
    hatchPoint.stroke(null).fill(this.getFinalHatchFill(true, this.state.getPointStateByIndex(point.getIndex())));
  }
};


/**
 * Updates label (and connector) on animate.
 * @param {number} labelOpacity Label opacity.
 * @param {number} connectorOpacity Connector opacity.
 * @param {boolean} isOutside Whether labels has outside position.
 */
anychart.core.PyramidFunnelBase.prototype.updateLabelsOnAnimate = function(labelOpacity, connectorOpacity, isOutside) {
  this.labels().suspendSignalsDispatching().fontOpacity(labelOpacity).draw().resumeSignalsDispatching(false);
  if (isOutside && this.drawnConnectors_) {
    for (var i in this.drawnConnectors_) {
      if (this.drawnConnectors_.hasOwnProperty(i))
        this.drawnConnectors_[i].stroke(anychart.color.setOpacity(this.connectorStroke_, connectorOpacity));
    }
  }
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.doAnimation = function() {
  if (this.animation().enabled() && this.animation().duration() > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationSerialQueue();
      var duration = /** @type {number} */(this.animation().duration());
      var pyramidFunnelDuration = duration * anychart.core.PyramidFunnelBase.PIE_ANIMATION_DURATION_RATIO;
      var pyramidFunnelLabelDuration = duration * (1 - anychart.core.PyramidFunnelBase.PIE_ANIMATION_DURATION_RATIO);

      var pyramidFunnelAnimation = new anychart.animations.PyramidFunnelAnimation(this, pyramidFunnelDuration);
      var pyramidFunnelLabelAnimation = new anychart.animations.PyramidFunnelLabelAnimation(this, pyramidFunnelLabelDuration);

      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pyramidFunnelAnimation));
      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pyramidFunnelLabelAnimation));

      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.ignoreMouseEvents(true);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.ignoreMouseEvents(false);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_END,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.play(false);
    }
  }
};


/**
 * Internal function for drawing a point by arguments.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.drawPoint_ = function() {
  var iterator = this.getIterator();
  var index = /** @type {number} */ (iterator.getIndex());

  var point = this.dataLayer_.genNextChild();
  var hatchPoint = this.hatchLayer_.genNextChild();

  iterator.meta('point', point);
  iterator.meta('hatchPoint', hatchPoint);

  this.calculatePoint_();

  var x1 = iterator.meta('x1');
  var x2 = iterator.meta('x2');
  var x3 = iterator.meta('x3');
  var x4 = iterator.meta('x4');
  var y1 = iterator.meta('y1');
  var y2 = iterator.meta('y2');
  var y3 = iterator.meta('y3');

  point.moveTo(x1, y1)
      .lineTo(x2, y1);

  // drawing neck
  if (y3) {
    point.lineTo(x4, y2)
        .lineTo(x4, y3)
        .lineTo(x3, y3)
        .lineTo(x3, y2);
  } else {
    point.lineTo(x4, y2)
        .lineTo(x3, y2);
  }

  point.close();

  iterator.meta('point', point);

  point.tag = {
    index: index,
    series: this
  };

  var state = this.state.getPointStateByIndex(iterator.getIndex());
  this.colorizePoint_(state);
  if (hatchPoint) {
    hatchPoint.deserialize(point.serialize());
    hatchPoint.tag = {
      index: index,
      series: this
    };
    this.applyHatchFill(state);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };
  var tag = anychart.utils.extractTag(res['domTarget']);
  res['pointIndex'] = anychart.utils.toNumber(tag.index);
  return res;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.PyramidFunnelBase.prototype.makePointEvent = function(event) {
  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }

  pointIndex = anychart.utils.toNumber(pointIndex);

  event['pointIndex'] = pointIndex;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.getPoint = function(index) {
  var point = new anychart.core.Point(this, index);
  var iter = this.getIterator();
  var value;
  if (iter.select(index) &&
      point.exists() && !this.isMissing_(value = /** @type {number} */(point.get('value')))) {

    point.statistics[anychart.enums.Statistics.PERCENT_VALUE] =
        point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] =
            value / /** @type {number} */(this.getStat(anychart.enums.Statistics.SUM)) * 100;
  }

  return point;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.getSeriesStatus = function(event) {
  //todo (blackart) coming soon.
  //var bounds = anychart.math.rect(0, 0, 0, 0);
  //var clientX = event['clientX'];
  //var clientY = event['clientY'];
  //
  //var value, index, iterator;
  //
  //var containerOffset = this.container().getStage().getClientPosition();
  //
  //var x = clientX - containerOffset.x;
  //var y = clientY - containerOffset.y;
  //
  //var minX = bounds.left;
  //var minY = bounds.top;
  //var rangeX = bounds.width;
  //var rangeY = bounds.height;
  //
  //if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
  //  return null;
  //
  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {

  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {

  }

  return points;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.PyramidFunnelBase}  {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) ||
      !this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  //---------------------------------------------------------------------
  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
  }
  this.overlapCorrection_();
  //---------------------------------------------------------------------

  this.hideTooltip();
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.core.PyramidFunnelBase}  {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hoverPoint = function(index, opt_event) {
  if (!this.enabled())
    return this;

  var iterator;
  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);

    iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
    }
    this.overlapCorrection_();


  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);

    if (this.boundsValue_) {
      iterator = this.getResetIterator();
      while (iterator.advance()) {
        this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
      }
      this.overlapCorrection_(this.labels().getLabel(index));
    }
  }

  // for float tooltip
  this.getIterator().select(index[0] || index);
  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.PyramidFunnelBase} An instance of the {@link anychart.core.PyramidFunnelBase} class for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);
  this.overlapCorrection_(null);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Select.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Imitates selects a point of the series by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else
    this.selectSeries();

  return this;
};


/**
 * Selects all points of the series. Use <b>unselect</b> method for unselect series.
 * @return {!anychart.core.PyramidFunnelBase} An instance of the {@link anychart.core.PyramidFunnelBase} class for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  //hide tooltip in any case
  this.hideTooltip();

  this.state.setPointState(anychart.PointState.SELECT);
  this.overlapCorrection_(null);

  return this;
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  if (!this.enabled())
    return this;

  var unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  }

  if (this.boundsValue_) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
    }
    var index;
    if (goog.isNumber(indexOrIndexes))
      index = this.labels().getLabel(indexOrIndexes);
    this.overlapCorrection_(index);
  }

  // for float tooltip
  this.getIterator().select(indexOrIndexes[0] || indexOrIndexes);

  return this;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);

  //---------------------------------------------------------------------
  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(this.state.getPointStateByIndex(iterator.getIndex()));
  }
  this.overlapCorrection_();
  //---------------------------------------------------------------------
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Apply appearance.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.PyramidFunnelBase.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizePoint_(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.PyramidFunnelBase.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.PyramidFunnelBase.prototype.applyAppearanceToSeries = function(pointState) {
  this.drawLabel_(pointState);
  this.colorizePoint_(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * The width of the pyramid/funnel in pixels or in percentage of the width of the bounds.
 * Defaults to 90%.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.baseWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.baseWidth_ != opt_value) {
      this.baseWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseWidth_;
};


/**
 * The height of the neck, the lower part of the funnel.
 * In pixels or in percentage of the height of the bounds.
 * Defaults to 25%.
 * For funnel chart ONLY.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.neckHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.neckHeight_ != opt_value) {
      this.neckHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.neckHeight_;
};


/**
 * The width of the neck, the lower part of the funnel.
 * In pixels or in percentage of the width of the bounds.
 * Defaults to 30%.
 * For funnel chart ONLY.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.neckWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.neckWidth_ != opt_value) {
      this.neckWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.neckWidth_;
};


/**
 * The distance between points in pixels (or percent) of the bounds height.
 * Defaults to 5.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.pointsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.pointsPadding_ != opt_value) {
      this.pointsPadding_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.pointsPadding_;
};


/**
 * Method allows you to flip the pyramid upside down.
 * Defaults to false.
 * For Pyramid ONLY.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.reversed = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.reversed_ != opt_value) {
      this.reversed_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.reversed_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.PyramidFunnelBase)} .
 */
anychart.core.PyramidFunnelBase.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.setParentEventTarget(this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Getter/setter for series hover data labels.
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.PyramidFunnelBase)} Labels instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Getter/setter for series select data labels.
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.PyramidFunnelBase)} Labels instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.registerDisposable(this.selectLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.labelsInvalidated_ = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS;
    signal |= anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


/**
 * Allows the labels to cross other labels. ONLY for outside labels.
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value .
 * @return {anychart.enums.LabelsOverlapMode|anychart.core.PyramidFunnelBase} .
 */
anychart.core.PyramidFunnelBase.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeLabelsOverlapMode(opt_value);
    if (this.labelsOverlap_ != val) {
      this.labelsOverlap_ = val;
      this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsOverlap_;
};


/**
 * Getter/setter for connectorLength.
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.core.PyramidFunnelBase|number|string|null} Outside labels margin or self for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.connectorLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.connectorLength_ != opt_value) {
      this.connectorLength_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.connectorLength_;
};


/**
 * Getter/setter for connectorStroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.connectorStroke_) {
      this.connectorStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorStroke_;
};


/**
 * Draws outside label for a point.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 * @return {anychart.core.ui.LabelsFactory.Label} Label.
 */
anychart.core.PyramidFunnelBase.prototype.drawLabel_ = function(pointState) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var selectPointLabel = selected ? iterator.get('selectLabel') : null;

  var index = iterator.getIndex();
  var labelsFactory;
  if (selected) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  }

  var label = this.labels().getLabel(index);

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;
  var labelSelectEnabledState = selectPointLabel && goog.isDef(selectPointLabel['enabled']) ? selectPointLabel['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(labelHoverEnabledState) ?
              goog.isNull(this.hoverLabels().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  this.hoverLabels().enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(this.selectLabels().enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  this.selectLabels().enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  var positionProvider = this.createLabelsPositionProvider_(null, pointState);
  var formatProvider = this.createFormatProvider();

  var isInsideLabels = this.isInsideLabels();

  var isFitToPoint = true;
  if (!hovered && !selected && isInsideLabels && this.overlapMode() == anychart.enums.LabelsOverlapMode.NO_OVERLAP) {
    var labelBounds = labelsFactory.measureWithTransform(formatProvider, positionProvider, /** @type {Object} */(pointLabel), index);
    isFitToPoint = this.isLabelFitsIntoThePoint_(labelBounds);
  }

  if (isDraw && isFitToPoint) {
    if (label) {
      label.resetSettings();
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);

    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));

    if (iterator.meta('labelWidthForced')) {
      label.width(anychart.utils.toNumber(iterator.meta('labelWidthForced')));
      // label height is automatically changed - fix label position
      var labelAnchorFromData = pointLabel && pointLabel['anchor'] ? pointLabel['anchor'] : null;
      var labelAnchorFromHoverData = hoverPointLabel && hoverPointLabel['anchor'] ? hoverPointLabel['anchor'] : null;
      var labelAnchorFromSelectData = selectPointLabel && selectPointLabel['anchor'] ? selectPointLabel['anchor'] : null;

      // don't fix label position if anchor is set
      if (!labelAnchorFromData && !labelAnchorFromHoverData && !labelAnchorFromSelectData) {
        positionProvider = this.createLabelsPositionProvider_(label, pointState);
        label.positionProvider(positionProvider);
      }
    }

    label.draw();

    //todo: this shit should be reworked when labelsFactory will be reworked
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label doesn't know nothing
    //about its DOM element and trying to apply itself setting to it. But nothing will happen because container is empty.
    if ((hovered || selected) && !label.container() && this.labels().getDomElement()) {
      label.container(this.labels().getDomElement());
      if (!label.container().parent()) {
        label.container().parent(/** @type {acgraph.vector.ILayer} */(this.labels().container()));
      }
      label.draw();
    }
  } else if (label) {
    label.clear();
  }

  if (isDraw && !isInsideLabels) {
    this.updateConnector(label, pointState);
  }

  return label;
};


/**
 * Create labels position provider.
 *
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_label Is used for alignment of the label height.
 * @param {(anychart.PointState|number)=} opt_pointState Point state.
 * @return {Object} Object with info for labels formatting.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.createLabelsPositionProvider_ = function(opt_label, opt_pointState) {
  var labelPosition = this.getLabelsPosition_();

  var iterator = this.getIterator();
  var bounds = this.boundsValue_;

  var selected = goog.isDef(opt_pointState) ? this.state.isStateContains(opt_pointState, anychart.PointState.SELECT) : null;
  var hovered = goog.isDef(opt_pointState) ? !selected && this.state.isStateContains(opt_pointState, anychart.PointState.HOVER) : null;

  var normalPointLabel = /** @type {Object} */ (iterator.get('label'));
  var hoverPointLabel = hovered ? /** @type {Object} */ (iterator.get('hoverLabel')) : null;
  var selectPointLabel = selected ? /** @type {Object} */ (iterator.get('hoverLabel')) : null;
  var labelSettings = selectPointLabel || hoverPointLabel || normalPointLabel || {};

  var x1 = anychart.utils.toNumber(iterator.meta('x1'));
  var x2 = anychart.utils.toNumber(iterator.meta('x2'));
  var y1 = anychart.utils.toNumber(iterator.meta('y1'));
  var y2 = anychart.utils.toNumber(iterator.meta('y2'));
  var y3 = anychart.utils.toNumber(iterator.meta('y3'));

  var pointWidth = x2 - x1;
  var pointHeight = y3 ? y3 - y1 : y2 - y1;

  var x = x1;
  var y = y1 + pointHeight / 2;

  var offsetY = anychart.utils.toNumber(labelSettings.offsetY) || 0;

  // get label width and height
  var labelBounds;
  if (opt_label) {
    labelBounds = this.getTrueLabelBounds(opt_label, /** @type {anychart.PointState|number}*/(opt_pointState));
  } else {
    labelBounds = this.labels_.measureWithTransform(this.createFormatProvider(), null, /** @type {Object} */(labelSettings));
    labelBounds = anychart.math.Rect.fromCoordinateBox(labelBounds);
  }

  var labelAnchor = opt_label && opt_label.anchor() || this.labels().anchor();

  if (opt_label) {
    y = opt_label.positionProvider()['value'].y;
  }

  var yForPointWidth = y + offsetY;

  // The label should not go beyond bounds,
  // calculate new Y if anchor in any center position
  if (labelBounds.height > pointHeight &&
      (labelAnchor == anychart.enums.Anchor.LEFT_CENTER ||
      labelAnchor == anychart.enums.Anchor.CENTER ||
      labelAnchor == anychart.enums.Anchor.RIGHT_CENTER)) {

    // bottom
    if ((y + labelBounds.height / 2) > bounds.top + bounds.height) {
      y = (bounds.top + bounds.height) - labelBounds.height / 2;
    }

    // top
    if ((y - labelBounds.height / 2) < bounds.top) {
      y = bounds.top + labelBounds.height / 2;
    }
  }

  var pointWidthAtY = this.getWidthAtYGivenReversed_(yForPointWidth);

  switch (labelPosition) {
    case anychart.enums.PyramidLabelsPosition.INSIDE:
      x += pointWidth / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT:
      x = this.centerXValue_ - pointWidthAtY / 2;
      x = bounds.left + x - this.connectorLengthValue_ - labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN:
      x = bounds.left + labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT:
      x = this.centerXValue_ + pointWidthAtY / 2;
      x = bounds.left + x + this.connectorLengthValue_ + labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN:
      x = bounds.left + bounds.width - labelBounds.width / 2;
      break;
  }

  // labels sub-pixel shift
  // when you set the top|bottom values of the anchor position
  if (labelAnchor == anychart.enums.Anchor.LEFT_TOP ||
      labelAnchor == anychart.enums.Anchor.CENTER_TOP ||
      labelAnchor == anychart.enums.Anchor.RIGHT_TOP) {

    y = y - .5;

  } else if (labelAnchor == anychart.enums.Anchor.LEFT_BOTTOM ||
      labelAnchor == anychart.enums.Anchor.CENTER_BOTTOM ||
      labelAnchor == anychart.enums.Anchor.RIGHT_BOTTOM) {

    y = y + .5;
  }

  return {'value': {'x': x, 'y': y}};
};


/**
 * Get label bounds given hover and forced the width of the label.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!anychart.math.Rect}
 */
anychart.core.PyramidFunnelBase.prototype.getTrueLabelBounds = function(label, pointState) {
  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var normalPointLabel = /** @type {Object} */ (this.data().get(label.getIndex(), 'label'));
  var hoverPointLabel = hovered ? /** @type {Object} */ (this.data().get(label.getIndex(), 'hoverLabel')) : null;
  var selectPointLabel = selected ? /** @type {Object} */ (this.data().get(label.getIndex(), 'selectLabel')) : null;

  var labelSettings = selectPointLabel || hoverPointLabel || normalPointLabel || {};

  if (this.data().meta(label.getIndex(), 'labelWidthForced')) {
    labelSettings = goog.object.clone(labelSettings);
    labelSettings.width = label.width();
  }

  var iterator = this.getIterator();
  iterator.select(label.getIndex());
  label.formatProvider(this.createFormatProvider());
  var labelBounds = this.labels_.measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object} */(labelSettings));

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};


/**
 * To place the labels so that they do not overlap.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel If label is hovered.
 */
anychart.core.PyramidFunnelBase.prototype.overlapCorrection_ = function(opt_hoveredLabel) {
  if (this.overlapMode() != anychart.enums.LabelsOverlapMode.NO_OVERLAP || this.isInsideLabels() || !this.labels().enabled()) {
    return;
  }

  this.clearLabelDomains_();
  this.overlapCorrectionIterationCount_ = 0;

  var pointState = this.state.getSeriesState() | (opt_hoveredLabel ? this.state.getPointStateByIndex(opt_hoveredLabel.getIndex()) : 0);
  this.checkOverlapWithSiblings_(pointState, opt_hoveredLabel);
};


/**
 * Check overlap with sibling labels.
 * It is the recursive method.
 *
 * @param {anychart.PointState|number} pointState Point state.
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel If label is hovered.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.checkOverlapWithSiblings_ = function(pointState, opt_hoveredLabel) {
  if (this.overlapCorrectionIterationCount_ == anychart.core.PyramidFunnelBase.OVERLAP_CORRECTION_ITERATION_COUNT_MAX_) {
    return;
  }

  var count = this.getIterator().getRowsCount();
  var intersectionExist = false;
  var index;
  var label;
  var labelBounds;
  var siblingLabel;
  var siblingLabelBounds;

  for (var i = 0; i < count - 1; i++) {
    if (this.reversed_) {
      index = i;
    } else {
      // Invert the cycle
      index = count - 1 - i;
    }

    label = this.labels().getLabel(index);
    if (!label || label.enabled() == false) {
      continue;
    }
    labelBounds = this.getTrueLabelBounds(label, pointState);

    siblingLabel = this.reversed_ ? this.getNextEnabledLabel(label) : this.getPreviousEnabledLabel(label);

    // for disabled labels
    if (!siblingLabel) {
      continue;
    }
    siblingLabelBounds = this.getTrueLabelBounds(siblingLabel, pointState);

    var labelDomain = this.getLabelsDomainByLabel(label);
    var siblingLabelDomain = this.getLabelsDomainByLabel(siblingLabel);
    if (labelDomain && siblingLabelDomain && labelDomain == siblingLabelDomain) {
      continue;
    }

    // if intersection exist
    if (siblingLabelBounds.top <= labelBounds.top + labelBounds.height) {
      intersectionExist = true;

      if (labelDomain && siblingLabelDomain) {
        this.mergeLabelsDomains(labelDomain, siblingLabelDomain);

      } else if (!labelDomain && siblingLabelDomain) {
        this.putLabelIntoLabelsDomain_(siblingLabel, label);

      } else {
        // labelDomain && !siblingLabelDomain OR !labelDomain && !siblingLabelDomain
        this.putLabelIntoLabelsDomain_(label, siblingLabel);
      }
    }
  }

  if (intersectionExist) {
    goog.array.forEach(this.labelDomains, function(labelDomain) {
      labelDomain.recalculateLabelsPosition(opt_hoveredLabel);
    });

    this.overlapCorrectionIterationCount_++;
    this.checkOverlapWithSiblings_(pointState, opt_hoveredLabel);
  }
};


/**
 *
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.PyramidFunnelBase.prototype.getNextEnabledLabel = function(label) {
  if (!label) {
    return null;
  }
  var count = this.getIterator().getRowsCount();

  // label is last
  if (label.getIndex() == count - 1) {
    return null;
  }

  var startIndex = label.getIndex() + 1;
  var testLabel;

  for (var i = startIndex; i <= count - 1; i++) {
    testLabel = this.labels().getLabel(i);
    if (testLabel && testLabel.enabled() !== false) {
      return testLabel;
    }
  }

  return null;
};


/**
 *
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.PyramidFunnelBase.prototype.getPreviousEnabledLabel = function(label) {
  if (!label) {
    return null;
  }

  // label is first
  if (label.getIndex() == 0) {
    return null;
  }

  var startIndex = label.getIndex() - 1;
  var testLabel;

  for (var i = startIndex; i >= 0; i--) {
    testLabel = this.labels().getLabel(i);
    if (testLabel && testLabel.enabled() !== false) {
      return testLabel;
    }
  }

  return null;
};


/**
 * If the label has a domain then push added label into this domain.
 * Otherwise we create a new domain for label and push added label into this domain.
 *
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {anychart.core.ui.LabelsFactory.Label} addedLabel
 */
anychart.core.PyramidFunnelBase.prototype.putLabelIntoLabelsDomain_ = function(label, addedLabel) {
  var foundDomain = this.getLabelsDomainByLabel(label);

  if (!goog.isNull(foundDomain)) {
    foundDomain.addLabel(addedLabel);

  } else {
    var newLabelsDomain;

    newLabelsDomain = new anychart.core.PyramidFunnelBase.LabelsDomain(this);
    newLabelsDomain.addLabel(label);
    newLabelsDomain.addLabel(addedLabel);

    this.labelDomains.push(newLabelsDomain);
  }
};


/**
 * If the label is already contained in another domain, to find this domain.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {?anychart.core.PyramidFunnelBase.LabelsDomain}
 */
anychart.core.PyramidFunnelBase.prototype.getLabelsDomainByLabel = function(label) {
  if (!this.labelDomains.length) {
    return null;
  }

  return goog.array.find(this.labelDomains, function(labelDomain) {
    return goog.array.indexOf(labelDomain.labels, label) !== -1;
  });
};


/**
 *
 * @protected
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} targetDomain
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} sourceDomain
 * @return {anychart.core.PyramidFunnelBase.LabelsDomain}
 */
anychart.core.PyramidFunnelBase.prototype.mergeLabelsDomains = function(targetDomain, sourceDomain) {
  var targetDomainIndex = targetDomain.labels[0].getIndex();
  var sourceDomainIndex = sourceDomain.labels[0].getIndex();

  /*
   * Marge labels with preservation of sorting.
   * if reversed == true then ascending pseudo sorting
   * if reversed == false then descending pseudo sorting
   *
   * This method was simplified by using mathematical logic (by Alexander Ky).
   */
  targetDomain.labels = (this.reversed_ == targetDomainIndex < sourceDomainIndex) ?
      goog.array.concat(targetDomain.labels, sourceDomain.labels) :
      goog.array.concat(sourceDomain.labels, targetDomain.labels);

  goog.array.remove(this.labelDomains, sourceDomain);

  return targetDomain;
};


/**
 * To clear an array of label domains.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.clearLabelDomains_ = function() {
  if (!this.labelDomains.length) {
    return;
  }

  goog.array.forEach(this.labelDomains, function(labelDomain) {
    labelDomain.clear();
  });

  this.labelDomains.length = 0;
};


/**
 * To remove the label domain.
 * @protected
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} labelDomain
 */
anychart.core.PyramidFunnelBase.prototype.removeLabelDomain = function(labelDomain) {
  if (!this.labelDomains.length) {
    return;
  }

  labelDomain.clear();
  goog.array.remove(this.labelDomains, labelDomain);
};


/**
 * Returns true if the label fits into the point. ONLY inside position.
 * @private
 * @param {Array.<number>} labelBounds .
 * @return {boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isLabelFitsIntoThePoint_ = function(labelBounds) {
  var iterator = this.getIterator();
  var pointBounds = [
    iterator.meta('x1'), iterator.meta('y1'),
    iterator.meta('x2'), iterator.meta('y1'),
    iterator.meta('x4'), iterator.meta('y2'),
    iterator.meta('x3'), iterator.meta('y2')];

  var result = true, i, len, k, k1;
  var p1x, p1y, p2x, p2y;
  var l1x, l1y, l2x, l2y;

  for (i = 0, len = pointBounds.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;

    p1x = pointBounds[i];
    p1y = pointBounds[i + 1];
    p2x = pointBounds[k];
    p2y = pointBounds[k1];

    l1x = labelBounds[i];
    l1y = labelBounds[i + 1];
    l2x = labelBounds[k];
    l2y = labelBounds[k1];

    // if start neck and bottom line (check relative bottom line)
    if (iterator.meta('y3') && i == 4) {
      p1y = anychart.utils.toNumber(iterator.meta('y3'));
      p2y = anychart.utils.toNumber(iterator.meta('y3'));
    }

    // e.g. top point of the pyramid
    if (p1x == p2x) {
      p2x += .01; // fix for create line for intersect checking
    }

    result = result && anychart.math.isPointOnLine(p1x, p1y, p2x, p2y, l1x, l1y) == 1;
    result = result && anychart.math.isPointOnLine(p1x, p1y, p2x, p2y, l2x, l2y) == 1;
  }

  return result;
};


/**
 * @return {!boolean} Define, is labels have inside position.
 */
anychart.core.PyramidFunnelBase.prototype.isInsideLabels = function() {
  return this.getLabelsPosition_() == anychart.enums.PyramidLabelsPosition.INSIDE;
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInColumn_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInLeftPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInRightPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN);
};


/**
 * Shifts centerX if the label does not fit on width. And sets a new width for the label.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.shiftCenterX_ = function() {
  if (!this.labels().enabled()) {
    return;
  }

  if (this.isInsideLabels()) {
    return;
  }

  // As shiftCenterX_ called before drawing points,
  // it is necessary to calculate in advance the coordinates of each point.
  this.calculatePoint_();

  var iterator = this.getIterator();
  // reset 'labelWidthForced' meta
  iterator.meta('labelWidthForced', undefined);

  var bounds = this.boundsValue_;

  // X coordinates at Y
  var pointXLeft;
  var pointXRight;

  var labelData = iterator.get('label');
  var labelPositionProvider = this.createLabelsPositionProvider_();
  var formatProvider = this.createFormatProvider();

  var labelBounds = this.labels().measureWithTransform(formatProvider, labelPositionProvider, /** @type {Object} */(labelData));
  labelBounds = anychart.math.Rect.fromCoordinateBox(labelBounds);

  var labelX1 = labelBounds.left;
  var labelX2 = labelBounds.left + labelBounds.width;

  var numberToShift;
  var halfBaseWidth;
  var maxShift;
  var newLabelWidth;
  var minLabelWidth = 10;

  var pointWidthAtY = this.reversed_ ?
      this.getWidthAtY_(labelBounds.top - bounds.top) :
      this.getWidthAtY_(bounds.height - (labelBounds.top + labelBounds.height) + bounds.top);

  // in left
  if (this.isInLeftPosition_()) {
    pointXLeft = this.centerXValue_ - pointWidthAtY / 2;
    pointXLeft = bounds.left + pointXLeft;

    // calculate the maximum possible shift
    halfBaseWidth = this.baseWidthValue_ / 2;
    maxShift = bounds.width - this.centerXValue_ - halfBaseWidth;

    if (this.isInColumn_()) {
      // The connector must not be less than anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH
      if (labelX2 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH > pointXLeft) {
        numberToShift = labelX2 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - pointXLeft;

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ + maxShift;

          // re-calculate pointXLeft
          pointXLeft = this.centerXValue_ - pointWidthAtY / 2;
          pointXLeft = bounds.left + pointXLeft;

          newLabelWidth = pointXLeft - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - labelX1;

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ + numberToShift;
        }
      }

      // not column
    } else {
      if (labelX1 < bounds.left) {
        numberToShift = Math.abs(bounds.left - labelX1);

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ + maxShift;

          // re-calculate pointXLeft
          pointXLeft = this.centerXValue_ - pointWidthAtY / 2;

          newLabelWidth = pointXLeft - this.connectorLengthValue_;

          if (newLabelWidth < minLabelWidth) {
            newLabelWidth = minLabelWidth;
          }

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ + numberToShift;
        }
      }
    }

    // in right
  } else if (this.isInRightPosition_()) {
    pointXRight = this.centerXValue_ + pointWidthAtY / 2;
    pointXRight = pointXRight + bounds.left;

    // calculate the maximum possible shift
    halfBaseWidth = this.baseWidthValue_ / 2;
    maxShift = bounds.width - (bounds.width - this.centerXValue_) - halfBaseWidth;

    if (this.isInColumn_()) {
      // labelX1 can be less than zero if it is too long
      if (labelX1 < 0 || labelX1 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH < pointXRight) {
        numberToShift = Math.abs(pointXRight - labelX1 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH);

        if (labelX1 < 0 || numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ - maxShift;

          // re-calculate pointXLeft
          pointXRight = this.centerXValue_ + pointWidthAtY / 2;
          pointXRight = pointXRight + bounds.left;

          newLabelWidth = labelX2 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - pointXRight;

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ - numberToShift;
        }
      }

      // not column
    } else {
      if (labelX2 > bounds.left + bounds.width) {
        numberToShift = labelX2 - (bounds.left + bounds.width);

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ - maxShift;

          newLabelWidth = bounds.left + bounds.width - labelX1 + maxShift;

          if (newLabelWidth < minLabelWidth) {
            newLabelWidth = minLabelWidth;
          }

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ - numberToShift;
        }
      }
    }
  }
};


/**
 * @private
 * @return {anychart.enums.PyramidLabelsPosition}
 */
anychart.core.PyramidFunnelBase.prototype.getLabelsPosition_ = function() {
  return anychart.enums.normalizePyramidLabelsPosition(this.labels().position());
};


/**
 * Draws connector line for label.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.PyramidFunnelBase.prototype.drawConnectorLine_ = function(label, path, pointState) {
  var bounds = this.boundsValue_;
  var index = label.getIndex();

  // '.data()' drawing connector should occur regardless of the position of the iterator.
  // Since the connectors can be redrawn several times through the method of
  // anychart.core.PyramidFunnelBase.LabelsDomain.prototype.applyLabelsPosition_
  var pointPath = this.data().meta(index, 'point');
  var pointBounds = pointPath.getBounds();
  var labelBounds = this.getTrueLabelBounds(label, pointState);

  var x0 = labelBounds.left;
  var y0 = labelBounds.top + (labelBounds.height / 2);
  var x1;
  var y1 = pointBounds.top + (pointBounds.height / 2);

  var pointWidthAtY = this.getWidthAtYGivenReversed_(y1);

  // in left
  if (this.isInLeftPosition_()) {
    x0 = x0 + labelBounds.width;

    x1 = this.centerXValue_ - pointWidthAtY / 2;
    x1 = x1 + bounds.left;

    if (x0 > x1 && (Math.abs(y1 - y0) < anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }

    // in right
  } else if (this.isInRightPosition_()) {
    x1 = this.centerXValue_ + pointWidthAtY / 2;
    x1 = x1 + bounds.left;

    if (x0 < x1 && (Math.abs(y1 - y0) < anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }
  }

  // y1 + .001 is svg shit (for work gradient stroke on horizontal line)
  // see http://www.w3.org/TR/SVG/coords.html#ObjectBoundingBox
  // http://stackoverflow.com/questions/13223636/svg-gradient-for-perfectly-horizontal-path
  path.clear().moveTo(x0, y0).lineTo(x1, y1 + .001);
};


/**
 * Update or create label connector.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {anychart.PointState|number} pointState If label is hovered.
 */
anychart.core.PyramidFunnelBase.prototype.updateConnector = function(label, pointState) {
  var labelIndex = label.getIndex();

  if (this.drawnConnectors_[labelIndex]) {
    this.drawConnectorLine_(label, this.drawnConnectors_[labelIndex], pointState);
  } else {
    var connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
    this.drawnConnectors_[labelIndex] = connectorPath;
    connectorPath.stroke(this.connectorStroke_);
    this.drawConnectorLine_(label, connectorPath, pointState);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.PyramidFunnelBase)} Markers instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();

    this.markers_.listenSignals(this.markersInvalidated_, this);
    this.markers_.setParentEventTarget(this);
    this.registerDisposable(this.markers_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for hoverMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.PyramidFunnelBase)} Markers instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();

    this.registerDisposable(this.hoverMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * Getter/setter for series data markers on select.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.PyramidFunnelBase)} Markers instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();

    this.registerDisposable(this.selectMarkers_);
    // don't listen to it, for it will be reapplied at the next select
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Listener for markers invalidation.
 * @private
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.core.PyramidFunnelBase.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Return marker fill color for point.
 * @return {!acgraph.vector.Fill} Marker color for point.
 */
anychart.core.PyramidFunnelBase.prototype.getMarkerFill = function() {
  return this.getFinalFill(false, anychart.PointState.NORMAL);
};


/**
 * Return marker stroke color for point.
 * @return {!acgraph.vector.Stroke} Marker color for point.
 */
anychart.core.PyramidFunnelBase.prototype.getMarkerStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(this.getMarkerFill()));
};


/**
 * Create points position provider.
 * @private
 * @param {string} anchorPosition Understands anychart.enums.Anchor and some additional values.
 * @return {Object} Object with info for markers position.
 */
anychart.core.PyramidFunnelBase.prototype.createMarkersPositionProvider_ = function(anchorPosition) {
  anchorPosition = anychart.enums.normalizeAnchor(anchorPosition);

  var bounds = this.boundsValue_;
  var iterator = this.getIterator();
  var point = iterator.meta('point');
  var pointBounds = point.getBounds();

  var x = /** @type {number} */ (iterator.meta('x1'));
  var y = /** @type {number} */ (iterator.meta('y1'));

  var pointWidthAtY;

  switch (anchorPosition) {
    case anychart.enums.Anchor.LEFT_TOP:
      y = iterator.meta('y1');
      x = iterator.meta('x1');
      break;

    case anychart.enums.Anchor.LEFT_CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_ - pointWidthAtY / 2;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.LEFT_BOTTOM:
      y += pointBounds.height;
      x = iterator.meta('x3');
      break;

    case anychart.enums.Anchor.CENTER_TOP:
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.CENTER_BOTTOM:
      y += pointBounds.height;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.RIGHT_TOP:
      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x += pointWidthAtY;
      break;

    case anychart.enums.Anchor.RIGHT_CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_ + pointWidthAtY / 2;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.RIGHT_BOTTOM:
      x = iterator.meta('x4');
      y += pointBounds.height;
      break;
  }

  return {'value': {'x': x, 'y': y}};
};


/**
 * Get current width of funnel at Y-coordinate given reversed flag.
 * @param {number} y Y-coordinate.
 * @return {number} current width of funnel.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.getWidthAtYGivenReversed_ = function(y) {
  var bounds = this.boundsValue_;
  return this.reversed_ ?
      this.getWidthAtY_(y - bounds.top) :
      this.getWidthAtY_(bounds.height - y + bounds.top);
};


/**
 * Draws marker for the point.
 * @protected
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.PyramidFunnelBase.prototype.drawMarker = function(pointState) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointMarker = iterator.get('marker');
  var hoverPointMarker = iterator.get('hoverMarker');
  var selectPointMarker = iterator.get('selectMarker');


  var index = this.getIterator().getIndex();
  var markersFactory;
  if (selected) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.selectMarkers());
  } else if (hovered) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.hoverMarkers());
  } else {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());
  }

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;
  var markerSelectEnabledState = selectPointMarker && goog.isDef(selectPointMarker['enabled']) ? selectPointMarker['enabled'] : null;

  var isDraw = hovered || selected ?
      hovered ?
          goog.isNull(markerHoverEnabledState) ?
              goog.isNull(this.hoverMarkers().enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers().enabled() :
                      markerEnabledState :
                  this.hoverMarkers().enabled() :
              markerHoverEnabledState :
          goog.isNull(markerSelectEnabledState) ?
              goog.isNull(this.selectMarkers().enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers().enabled() :
                      markerEnabledState :
                  this.selectMarkers().enabled() :
              markerSelectEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers().enabled() :
          markerEnabledState;

  if (isDraw) {
    var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
    var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
    var markerSelectPosition = selectPointMarker && selectPointMarker['position'] ? selectPointMarker['position'] : null;

    var position = (hovered && (markerHoverPosition || this.hoverMarkers().position())) ||
        (selected && (markerSelectPosition || this.selectMarkers().position())) ||
        markerPosition || this.markers().position();

    var positionProvider = this.createMarkersPositionProvider_(/** @type {anychart.enums.Position|string} */(position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    var markerSettings = {};
    var settingsPropsList = ['position', 'anchor', 'offsetX', 'offsetY', 'type', 'size', 'fill', 'stroke', 'enabled'];
    if (pointMarker) {
      goog.array.forEach(settingsPropsList, function(prop) {
        if (prop in pointMarker) {
          markerSettings[prop] = pointMarker[prop];
        }
      });
    }

    var markerType = pointMarker && pointMarker['type'];
    var finalMarkerType = goog.isDef(markerType) ? markerType : (this.markers().getType() || this.markerPalette().itemAt(index));
    var markerHoverType = hoverPointMarker && hoverPointMarker['type'];
    var finalMarkerHoverType = goog.isDef(markerHoverType) ? markerHoverType : this.hoverMarkers().getType();
    var markerSelectType = selectPointMarker && selectPointMarker['type'];
    var finalMarkerSelectType = goog.isDef(markerSelectType) ? markerSelectType : this.selectMarkers().getType();

    if (selected && goog.isDef(finalMarkerSelectType))
      markerSettings.type = finalMarkerSelectType;
    else if (hovered && goog.isDef(finalMarkerHoverType))
      markerSettings.type = finalMarkerHoverType;
    else
      markerSettings.type = finalMarkerType;

    var markerFill = pointMarker && pointMarker['fill'];
    var finalMarkerFill = goog.isDef(markerFill) ? markerFill : (this.markers().getFill() || this.getMarkerFill());
    var markerHoverFill = hoverPointMarker && hoverPointMarker['fill'];
    var finalMarkerHoverFill = goog.isDef(markerHoverFill) ? markerHoverFill : this.hoverMarkers().getFill();
    var markerSelectFill = selectPointMarker && selectPointMarker['fill'];
    var finalMarkerSelectFill = goog.isDef(markerSelectFill) ? markerSelectFill : this.selectMarkers().getFill();

    if (selected && goog.isDef(finalMarkerSelectFill))
      markerSettings.fill = finalMarkerSelectFill;
    else if (hovered && goog.isDef(finalMarkerHoverFill))
      markerSettings.fill = finalMarkerHoverFill;
    else
      markerSettings.fill = finalMarkerFill;

    var markerStroke = pointMarker && pointMarker['stroke'];
    var finalMarkerStroke = goog.isDef(markerStroke) ? markerStroke : (this.markers().getStroke() || this.getMarkerStroke());
    var markerHoverStroke = hoverPointMarker && hoverPointMarker['stroke'];
    var finalMarkerHoverStroke = goog.isDef(markerHoverStroke) ? markerHoverStroke : (this.hoverMarkers().getStroke() || this.getMarkerStroke());
    var markerSelectStroke = selectPointMarker && selectPointMarker['stroke'];
    var finalMarkerSelectStroke = goog.isDef(markerSelectStroke) ? markerSelectStroke : (this.selectMarkers().getStroke() || this.getMarkerStroke());

    if (selected && goog.isDef(finalMarkerSelectStroke))
      markerSettings.stroke = finalMarkerSelectStroke;
    else if (hovered && goog.isDef(finalMarkerHoverStroke))
      markerSettings.stroke = finalMarkerHoverStroke;
    else
      markerSettings.stroke = finalMarkerStroke;

    marker.resetSettings();
    marker.currentMarkersFactory(markersFactory);
    marker.setSettings(/** @type {Object} */(markerSettings), /** @type {Object} */(hovered ? hoverPointMarker : selectPointMarker));

    marker.draw();

  } else if (marker) {
    marker.clear();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.PyramidFunnelBase|anychart.core.ui.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.SUPPORTS_ALLOW_LEAVE_SCREEN);
    this.tooltip_.chart(this);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Tooltip invalidation handler.
 * @private
 * @param {anychart.SignalEvent} event Event object.
 */
anychart.core.PyramidFunnelBase.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.showTooltip = function(opt_event) {
  if (opt_event && opt_event['target'] == this.legend()) {
    return;
  }

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (opt_event) {
    tooltip.showFloat(opt_event['clientX'], opt_event['clientY'], formatProvider);
    // for float
    this.listen(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  }
  // if (tooltip.isFloating() && opt_event) {
  //   tooltip.show(
  //       formatProvider,
  //       new goog.math.Coordinate(opt_event['clientX'], opt_event['clientY']));
  //
  //   // for float
  //   this.listen(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  //
  // } else {
  //   tooltip.show(
  //       formatProvider,
  //       new goog.math.Coordinate(0, 0));
  // }
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  this.unlisten(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  // if (tooltip.isFloating()) {
  //   this.unlisten(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  // }

  tooltip.hide();
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_DATA)) {
    this.statistics = {};

    var iterator = this.data().getIterator();
    var value;
    var missingPoints = 0;
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var sum = 0;
    while (iterator.advance()) {
      value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
      // if missing
      if (this.isMissing_(value)) {
        missingPoints++;
      } else {
        value = this.handleValue_(value);
        min = Math.min(value, min);
        max = Math.max(value, max);
        sum += value;
      }
    }

    var count = iterator.getRowsCount() - missingPoints; // do not count missing points
    var avg;
    if (!count) min = max = sum = avg = undefined;
    else avg = sum / count;
    this.statistics[anychart.enums.Statistics.COUNT] = count;
    this.statistics[anychart.enums.Statistics.MIN] = min;
    this.statistics[anychart.enums.Statistics.MAX] = max;
    this.statistics[anychart.enums.Statistics.SUM] = sum;
    this.statistics[anychart.enums.Statistics.AVERAGE] = avg;

    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_DATA);
  }
};


/**
 * Create chart label/tooltip format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels/tooltip formatting.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force) {
    this.pointProvider_ = new anychart.core.utils.PointContextProvider(this, ['x', 'value', 'name']);
  }
  this.pointProvider_.applyReferenceValues();

  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.core.PyramidFunnelBase.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();
  var x, index;

  while (iterator.advance()) {
    x = iterator.get('x');
    index = iterator.getIndex();

    var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
    var itemText = null;
    if (goog.isFunction(itemsTextFormatter)) {
      var format = this.createFormatProvider();
      format.pointInternal = this.getPoint(index);
      itemText = itemsTextFormatter.call(format, format);
    }
    if (!goog.isString(itemText)) {
      itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
    }
    var obj = {
      'enabled': true,
      'meta': {
        'pointIndex': index,
        'pointValue': iterator.get('value'),
        series: this
      },
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'text': itemText,
      'iconStroke': this.getFinalStroke(true, anychart.PointState.NORMAL),
      'iconFill': this.getFinalFill(true, anychart.PointState.NORMAL),
      'iconHatchFill': this.getFinalHatchFill(true, anychart.PointState.NORMAL)
    };
    goog.object.extend(obj, legendItem);
    obj['sourceUid'] = goog.getUid(this);
    obj['sourceKey'] = index;
    data.push(obj);
  }

  return data;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.core.PyramidFunnelBase|anychart.enums.SelectionMode|null} .
 */
anychart.core.PyramidFunnelBase.prototype.selectionMode = function(opt_value) {
  return null;
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.core.PyramidFunnelBase|anychart.enums.HoverMode} .
 */
anychart.core.PyramidFunnelBase.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.serialize = function() {
  var json = anychart.core.PyramidFunnelBase.base(this, 'serialize');

  json['type'] = anychart.enums.ChartTypes.PYRAMID;
  json['data'] = this.data().serialize();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['tooltip'] = this.tooltip().serialize();

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  json['baseWidth'] = this.baseWidth();
  json['overlapMode'] = this.overlapMode();
  json['pointsPadding'] = this.pointsPadding();
  json['connectorLength'] = this.connectorLength();

  if (goog.isFunction(this['connectorStroke'])) {
    if (goog.isFunction(this.connectorStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' connectorStroke']
      );
    } else {
      json['connectorStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.connectorStroke()));
    }
  }

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' selectFill']
      );
    } else {
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
    }
  }

  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' selectStroke']
      );
    } else {
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }

  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverHatchFill']
      );
    } else {
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
    }
  }
  if (goog.isFunction(this['selectHatchFill'])) {
    if (goog.isFunction(this.selectHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' selectHatchFill']
      );
    } else {
      json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectHatchFill()));
    }
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.PyramidFunnelBase.base(this, 'setupByJSON', config, opt_default);

  this.baseWidth(config['baseWidth']);
  this.connectorLength(config['connectorLength']);
  this.connectorStroke(config['connectorStroke']);
  this.data(config['data']);

  this.hatchFillPalette(config['hatchFillPalette']);
  this.markerPalette(config['markerPalette']);

  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.selectFill(config['selectFill']);

  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.selectHatchFill(config['selectHatchFill']);

  this.labels().setup(config['labels']);
  this.hoverLabels().setup(config['hoverLabels']);
  this.selectLabels().setup(config['selectLabels']);

  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.selectStroke(config['selectStroke']);

  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);

  this.overlapMode(config['overlapMode']);
  this.palette(config['palette']);
  this.pointsPadding(config['pointsPadding']);

  if ('tooltip' in config)
    this.tooltip().setupByVal(config['tooltip'], opt_default);
};



//----------------------------------------------------------------------------------------------------------------------
//
//  LabelsDomain.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Labels domain for overlap mode.
 * @constructor
 * @param {!anychart.core.PyramidFunnelBase} chart .
 */
anychart.core.PyramidFunnelBase.LabelsDomain = function(chart) {
  /**
   * Link to chart.
   * @type {!anychart.core.PyramidFunnelBase}
   */
  this.chart = chart;

  /**
   * Domain labels.
   * @type {Array.<anychart.core.ui.LabelsFactory.Label>}
   */
  this.labels = [];

  /**
   * Top left domain position.
   * @type {number}
   */
  this.y;
};


/**
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.addLabel = function(label) {
  this.labels.push(label);
  if (this.chart.reversed_) {
    // ascending
    goog.array.sort(this.labels, function(a, b) {
      return a.getIndex() - b.getIndex();
    });
  } else {
    // descending
    goog.array.sort(this.labels, function(a, b) {
      return b.getIndex() - a.getIndex();
    });
  }
};


/**
 * To clear an array of labels.
 * @protected
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.clear = function() {
  this.labels.length = 0;
};


/**
 * To calculate the coordinates of the labels given the overlap mode.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.recalculateLabelsPosition = function(opt_hoveredLabel) {
  if (this.labels.length < 2) {
    this.chart.removeLabelDomain(this);
    return;
  }

  var label, pointState, labelBounds, labelPointPath, labelPointBounds;
  var firstPointTop = 0;
  var pointsHeight = 0;
  var domainHeight = 0;

  for (var i = 0, len = this.labels.length; i < len; i++) {
    label = this.labels[i];
    pointState = this.chart.state.getSeriesState() | this.chart.state.getPointStateByIndex(label.getIndex());
    labelBounds = this.getLabelBounds_(label, pointState);
    labelPointPath = this.chart.data().meta(label.getIndex(), 'point');
    labelPointBounds = labelPointPath.getBounds();

    if (!i) {
      firstPointTop = labelPointBounds.top;
    }

    domainHeight += labelBounds.height;
    pointsHeight += labelPointBounds.height;
  }

  pointsHeight += this.chart.pointsPaddingValue_ * (len - 1);
  var domainCenterY = firstPointTop + pointsHeight / 2;
  var domainY = domainCenterY - domainHeight / 2;

  var bounds = this.chart.boundsValue_;
  // bottom boundary
  if (domainY + domainHeight > bounds.top + bounds.height) {
    domainY = bounds.top + bounds.height - domainHeight;
  }
  // top boundary
  if (domainY < bounds.top) {
    domainY = bounds.top;
  }
  this.y = domainY;

  this.applyLabelsPosition_(opt_hoveredLabel);
};


/**
 * Reposition the labels by relative to the top of this domain.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.applyLabelsPosition_ = function(opt_hoveredLabel) {
  var domain = this;

  var labelsHeightSum = 0;
  var labelsOffsetYSum = 0;

  var prevLabel = null;
  var prevLabelBounds = null;
  var prevLabelPosition = null;

  var pointState = this.chart.state.getSeriesState() | (opt_hoveredLabel ? this.chart.state.getPointStateByIndex(opt_hoveredLabel.getIndex()) : 0);

  goog.array.forEach(this.labels, function(label) {
    var labelPositionProvider = label.positionProvider()['value'];
    var labelBounds = domain.getLabelBounds_(label, pointState);
    var labelNewY = domain.y + labelsHeightSum + labelsOffsetYSum + labelBounds.height / 2;

    // Need to preserve the order of the labels.
    if (prevLabel && prevLabelBounds && prevLabelPosition) {
      var prevLabelPositionBottom = prevLabelPosition.y + prevLabelBounds.height / 2 + (prevLabel.offsetY() || 0);
      var currentLabelPositionTop = labelNewY - labelBounds.height / 2 + (label.offsetY() || 0);

      if (currentLabelPositionTop < prevLabelPositionBottom) {
        labelNewY += prevLabelPositionBottom - currentLabelPositionTop;
      }
    }

    label.positionProvider({'value': {'x': labelPositionProvider.x, 'y': labelNewY}});
    // Always draw label, because hover and unhover (with offsets and rotations and other bounds changers).
    label.draw();
    domain.chart.updateConnector(label, pointState);

    labelsHeightSum += labelBounds.height;
    labelsOffsetYSum += label.offsetY() || 0;

    prevLabel = label;
    prevLabelBounds = labelBounds;
    prevLabelPosition = {'x': labelPositionProvider.x, 'y': labelNewY};
  });
};


/**
 * Get label bounds given hover and forced the width of the label.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {anychart.PointState|number} pointState
 * @return {!anychart.math.Rect}
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.getLabelBounds_ = function(label, pointState) {
  var selected = this.chart.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.chart.state.isStateContains(pointState, anychart.PointState.HOVER);

  var normalPointLabel = /** @type {Object} */ (this.chart.data().get(label.getIndex(), 'label'));
  var hoverPointLabel = hovered ? /** @type {Object} */ (this.chart.data().get(label.getIndex(), 'hoverLabel')) : null;
  var selectPointLabel = selected ? /** @type {Object} */ (this.chart.data().get(label.getIndex(), 'selectLabel')) : null;

  var labelSettings = selectPointLabel || hoverPointLabel || normalPointLabel || {};

  if (this.chart.data().meta(label.getIndex(), 'labelWidthForced')) {
    labelSettings = goog.object.clone(labelSettings);
    labelSettings.width = label.width();
  }

  var iterator = this.chart.getIterator();
  iterator.select(label.getIndex());
  label.formatProvider(this.chart.createFormatProvider());
  var labelBounds = this.chart.labels_.measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object} */(labelSettings));

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};
