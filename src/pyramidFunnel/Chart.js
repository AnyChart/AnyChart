goog.provide('anychart.pyramidFunnelModule.Chart');

goog.require('anychart.animations.AnimationSerialQueue');
goog.require('anychart.color');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.Point');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math');
goog.require('anychart.palettes');
goog.require('anychart.pyramidFunnelModule.Animation');
goog.require('anychart.pyramidFunnelModule.LabelAnimation');
goog.require('anychart.utils');



/**
 * Pyramid/Funnel Base Chart Class.<br/>
 * @param {anychart.enums.ChartTypes} type - Type.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @implements {anychart.core.IShapeManagerUser}
 * @constructor
 */
anychart.pyramidFunnelModule.Chart = function(type, opt_data, opt_csvSettings) {
  anychart.pyramidFunnelModule.Chart.base(this, 'constructor');
  this.suspendSignalsDispatching();

  this.setType(type);

  this.addThemes('pieFunnelPyramidBase', type);

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * @type {!anychart.data.Iterator}
   * @private
   */
  this.iterator_;

  /**
   * List of all label domains
   * @type {Array.<anychart.pyramidFunnelModule.Chart.LabelsDomain>}
   */
  this.labelDomains = [];

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * The minimum height of the point.
   * @type {number}
   * @private
   */
  this.minHeightOfPoint_ = 1;

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
   * @type {anychart.format.Context}
   * @private
   */
  this.pointProvider_;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.data(opt_data || null, opt_csvSettings);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['hatchFill',
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.pyramidFunnelModule.Chart} */ function(factory) {
    factory.listenSignals(this.labelsInvalidated_, this);
    factory.setParentEventTarget(this);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW);
  });
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_MARKERS_AFTER_INIT_CALLBACK);

  var interactivityDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(interactivityDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', 0, 0],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, interactivityDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_ = new anychart.core.StateSettings(this, interactivityDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['baseWidth', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['neckHeight', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['neckWidth', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['pointsPadding', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['reversed', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['overlapMode', anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['connectorLength',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.pyramidFunnelModule.Chart, anychart.core.SeparateChart);
anychart.core.settings.populateAliases(anychart.pyramidFunnelModule.Chart, ['fill', 'stroke', 'hatchFill'], 'normal');


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pyramidFunnelModule.Chart}
 */
anychart.pyramidFunnelModule.Chart.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pyramidFunnelModule.Chart}
 */
anychart.pyramidFunnelModule.Chart.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.pyramidFunnelModule.Chart}
 */
anychart.pyramidFunnelModule.Chart.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.rawData_;


/**
 * Series element z-index in series root layer.
 * @type {number}
 * @const
 */
anychart.pyramidFunnelModule.Chart.ZINDEX_PYRAMID_FUNNEL = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 * @const
 */
anychart.pyramidFunnelModule.Chart.ZINDEX_HATCH_FILL = 31;


/**
 * Z-index for labels connectors.
 * @type {number}
 * @const
 */
anychart.pyramidFunnelModule.Chart.ZINDEX_LABELS_CONNECTOR = 32;


/**
 * The length of the connector may not be less than the value of this constant.
 * @type {number}
 * @const
 */
anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH = 5;


/**
 * The maximum number of iterations for overlap correction.
 * @type {number}
 * @const
 * @private
 */
anychart.pyramidFunnelModule.Chart.OVERLAP_CORRECTION_ITERATION_COUNT_MAX_ = 10;


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
anychart.pyramidFunnelModule.Chart.ANIMATION_DURATION_RATIO = 0.85;


/**
 * Supported signals.
 * @type {number}
 */
anychart.pyramidFunnelModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pyramidFunnelModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
    anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
    anychart.ConsistencyState.PYRAMID_FUNNEL_DATA;


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.getAllSeries = function() {
  return [this];
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.pyramidFunnelModule.Chart.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if the series is size based.
 * @return {boolean}
 */
anychart.pyramidFunnelModule.Chart.prototype.isSizeBased = function() {
  return false;
};


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.isSeries = function() {
  return true;
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.data.View|!anychart.pyramidFunnelModule.Chart)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.pyramidFunnelModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
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
        if (anychart.utils.instanceOf(opt_value, anychart.data.View)) {
          parentView = opt_value;
          this.parentViewToDispose_ = null;
        } else {
          if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
            parentView = (this.parentViewToDispose_ = opt_value).mapAs();
          else if (goog.isArray(opt_value) || goog.isString(opt_value))
            parentView = (this.parentViewToDispose_ = new anychart.data.Set(opt_value, opt_csvSettings)).mapAs();
          else
            parentView = (this.parentViewToDispose_ = new anychart.data.Set(null)).mapAs();
        }
        this.parentView_ = parentView.derive();
      }

      goog.dispose(this.view_);
      this.view_ = this.parentView_;
      this.view_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
          anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
          anychart.ConsistencyState.CHART_LEGEND |
          anychart.ConsistencyState.PYRAMID_FUNNEL_DATA |
          anychart.ConsistencyState.CHART_LABELS,
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
anychart.pyramidFunnelModule.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
        anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.PYRAMID_FUNNEL_DATA |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.DATA_CHANGED
    );
  }
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current chart view iterator.
 */
anychart.pyramidFunnelModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.pyramidFunnelModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.view_.getIterator();
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator} Detached iterator.
 */
anychart.pyramidFunnelModule.Chart.prototype.getDetachedIterator = function() {
  return this.view_.getIterator();
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.colorizePoint_ = function(pointState) {
  var point = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('point'));
  if (goog.isDef(point)) {
    var fillResolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
    var fillColor = /** @type {acgraph.vector.Fill} */ (fillResolver(this, pointState, false, true));
    point.fill(fillColor);

    var strokeResolver = anychart.color.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true);
    var strokeColor = /** @type {acgraph.vector.Stroke} */ (strokeResolver(this, pointState, false, true));
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
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.pyramidFunnelModule.Chart)} .
 */
anychart.pyramidFunnelModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
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
 * @return {!(anychart.palettes.Markers|anychart.pyramidFunnelModule.Chart)} Return current chart markers palette or itself for chaining call.
 */
anychart.pyramidFunnelModule.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.setupCreated('markerPalette', this.markerPalette_);
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
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
 * @return {!(anychart.palettes.HatchFills|anychart.pyramidFunnelModule.Chart)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.pyramidFunnelModule.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.setupCreated('hatchFillPalette', this.hatchFillPalette_);
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
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
anychart.pyramidFunnelModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
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
anychart.pyramidFunnelModule.Chart.prototype.paletteInvalidated_ = function(event) {
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
anychart.pyramidFunnelModule.Chart.prototype.markerPaletteInvalidated_ = function(event) {
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
anychart.pyramidFunnelModule.Chart.prototype.hatchFillPaletteInvalidated_ = function(event) {
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
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.pyramidFunnelModule.Chart.prototype.applyHatchFill = function(pointState) {
  var hatchPoint = /** @type {acgraph.vector.Path} */(this.getIterator().meta('hatchPoint'));
  if (goog.isDefAndNotNull(hatchPoint)) {
    var hatchFillResolver = anychart.color.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
    var color = hatchFillResolver(this, pointState, false);
    hatchPoint
        .stroke(null)
        .fill(color);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.remove = function() {
  this.clearLabelDomains_();

  if (this.dataLayer_) this.dataLayer_.parent(null);

  anychart.pyramidFunnelModule.Chart.base(this, 'remove');
};


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.beforeDraw = function() {
  var iterator = this.getIterator();
  if (this.palette_ && anychart.utils.instanceOf(this.palette_, anychart.palettes.RangeColors)) {
    this.palette_.setAutoCount(iterator.getRowsCount());
  }
};


/**
 * Draw chart chart content items.
 * @param {anychart.math.Rect} bounds Bounds of chart content area.
 */
anychart.pyramidFunnelModule.Chart.prototype.drawContent = function(bounds) {
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
      this.dataLayer_.zIndex(anychart.pyramidFunnelModule.Chart.ZINDEX_PYRAMID_FUNNEL);
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
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(anychart.pyramidFunnelModule.Chart.ZINDEX_HATCH_FILL).disablePointerEvents(true);
    }

    this.pointsPaddingValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('pointsPadding')), bounds.height), 2));
    this.baseWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('baseWidth')), bounds.width), 2));
    this.neckWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('neckWidth')), bounds.width), 2));
    this.neckHeightValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('neckHeight')), bounds.height), 2));
    this.neckYValue_ = bounds.top + bounds.height - this.neckHeightValue_;
    this.centerXValue_ = bounds.width / 2;

    this.connectorLengthValue_ = anychart.utils.normalizeSize(
        /** @type {number|string} */ (this.getOption('connectorLength')), ((bounds.width - this.baseWidthValue_) / 2));
    if (this.connectorLengthValue_ < 0) {
      this.connectorLengthValue_ = anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH;
    }

    this.boundsValue_ = bounds;

    var startY = 0;
    var value;
    var isMissing;

    var countMissing = iterator.getRowsCount() - anychart.utils.toNumber(this.statistics(anychart.enums.Statistics.COUNT));
    var paddingPercent = anychart.math.round(this.pointsPaddingValue_ / bounds.height * 100, 2);

    iterator.reset();
    while (iterator.advance()) {
      value = iterator.get('value');
      isMissing = this.isMissing_(value);
      value = this.handleValue_(value);

      var percent = anychart.math.round(value / anychart.utils.toNumber(this.statistics(anychart.enums.Statistics.SUM)) * 100, 2);
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
      if (String(iterator.get('state')).toLowerCase() == 'selected')
        this.state.setPointState(anychart.PointState.SELECT, index);

      this.drawPoint_();
    }

    if (this.drawnConnectors_) {
      for (var i = 0; i < this.drawnConnectors_.length; i++) {
        var conn = this.drawnConnectors_[i];
        if (conn)
          conn.stroke(this.getOption('connectorStroke'));
      }
    }

    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS)) {
    if (!this.markers().container()) this.markers().container(this.rootElement);
    this.markers().clear();

    iterator.reset();
    while (iterator.advance()) {

      this.drawMarker(this.state.seriesState | this.state.getPointStateByIndex(iterator.getIndex()));
    }

    this.markers().draw();
    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS)) {
    if (!this.labels().container()) this.labels().container(this.rootElement);
    this.labels().clear();
    if (this.connectorsLayer_) {
      this.connectorsLayer_.clear();
    }

    var themePart = this.isInsideLabels() ?
        this.themeSettings['insideLabels'] :
        this.themeSettings['outsideLabels'];

    this.labels().setAutoColor(themePart['autoColor']);
    this.labels()['disablePointerEvents'](themePart['disablePointerEvents']);

    if (!this.isInsideLabels()) {
      this.connectorLengthValue_ = anychart.utils.normalizeSize(
          /** @type {number|string} */ (this.getOption('connectorLength')), ((bounds.width - this.baseWidthValue_) / 2));
      // foolproof
      if (this.connectorLengthValue_ < 0) {
        this.connectorLengthValue_ = anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH;
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
        this.connectorsLayer_.parent(this.rootElement);
        this.connectorsLayer_.zIndex(anychart.pyramidFunnelModule.Chart.ZINDEX_LABELS_CONNECTOR);
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
 * Return the width at a specific Y coordinate.
 * @param {number} y
 * @return {number}
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.getWidthAtY_ = function(y) {
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
anychart.pyramidFunnelModule.Chart.prototype.handleValue_ = function(value) {
  return this.isMissing_(value) ? 0 : anychart.utils.toNumber(value);
};


/**
 * Checks that value represents missing point.
 * @param {*} value
 * @return {boolean} Is value represents missing value.
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.isMissing_ = function(value) {
  value = anychart.utils.toNumber(value);
  return value <= 0 || !isFinite(value);
};


/**
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.calculatePoint_ = function() {
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

  if (!this.getOption('reversed')) {
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
anychart.pyramidFunnelModule.Chart.prototype.updatePointOnAnimate = function(point) {
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
    var pointState = this.state.getPointStateByIndex(point.getIndex());
    var hatchFillResolver = anychart.color.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true);
    hatchPoint.stroke(null).fill(hatchFillResolver(this, pointState, false));
  }
};


/**
 * Updates label (and connector) on animate.
 * @param {number} labelOpacity Label opacity.
 * @param {number} connectorOpacity Connector opacity.
 * @param {boolean} isOutside Whether labels has outside position.
 */
anychart.pyramidFunnelModule.Chart.prototype.updateLabelsOnAnimate = function(labelOpacity, connectorOpacity, isOutside) {
  var labels = this.labels();
  labels.suspendSignalsDispatching();
  labels['fontOpacity'](labelOpacity);
  labels.draw();
  labels.resumeSignalsDispatching(false);
  if (isOutside && this.drawnConnectors_) {
    for (var i = 0; i < this.drawnConnectors_.length; i++) {
      var conn = this.drawnConnectors_[i];
      if (conn) {
        var ownStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
        var opacity = anychart.color.setOpacity(ownStroke, connectorOpacity);
        conn.stroke(opacity);
      }
    }
  }
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.doAnimation = function() {
  var animation = this.getCreated('animation');
  if (animation && animation.getOption('enabled') && /** @type {number} */(animation.getOption('duration')) > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationSerialQueue();
      var duration = /** @type {number} */(animation.getOption('duration'));
      var pyramidFunnelDuration = duration * anychart.pyramidFunnelModule.Chart.ANIMATION_DURATION_RATIO;
      var pyramidFunnelLabelDuration = duration * (1 - anychart.pyramidFunnelModule.Chart.ANIMATION_DURATION_RATIO);

      var pyramidFunnelAnimation = new anychart.pyramidFunnelModule.Animation(this, pyramidFunnelDuration);
      var pyramidFunnelLabelAnimation = new anychart.pyramidFunnelModule.LabelAnimation(this, pyramidFunnelLabelDuration);

      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pyramidFunnelAnimation));
      this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (pyramidFunnelLabelAnimation));

      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.connStrokeBackup_ = this.getOption('connectorStroke');
        this.setOption('connectorStroke', 'none');
        this.ignoreMouseEvents(true);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);

      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.setOption('connectorStroke', this.connStrokeBackup_);
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
anychart.pyramidFunnelModule.Chart.prototype.drawPoint_ = function() {
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
anychart.pyramidFunnelModule.Chart.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.VisualBase.prototype.makeBrowserEvent.call(this, e);
  var tag = anychart.utils.extractTag(res['domTarget']);
  res['pointIndex'] = anychart.utils.toNumber(tag.index);
  return res;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.handleMouseEvent = function(event) {
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
anychart.pyramidFunnelModule.Chart.prototype.makePointEvent = function(event) {
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
anychart.pyramidFunnelModule.Chart.prototype.getPoint = function(index) {
  var point = new anychart.core.Point(this, index);
  var iter = this.getIterator();
  var value;
  if (iter.select(index) &&
      point.exists() && !this.isMissing_(value = /** @type {number} */(point.get('value')))) {

    var val = anychart.math.round(value / /** @type {number} */(this.getStat(anychart.enums.Statistics.SUM)) * 100, 2);
    point.statistics(anychart.enums.Statistics.PERCENT_VALUE, val);
    point.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, val);
  }

  return point;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.getSeriesStatus = function(event) {
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
  // var points = [];
  // var interactivity = this.interactivity();
  // var i, len, series;
  //
  // if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
  //
  // } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
  //
  // }
  //
  // return points;
  return [];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.pyramidFunnelModule.Chart}  {@link anychart.pyramidFunnelModule.Chart} instance for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.unhover = function(opt_indexOrIndexes) {
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
 * @return {!anychart.pyramidFunnelModule.Chart}  {@link anychart.pyramidFunnelModule.Chart} instance for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.hoverPoint = function(index, opt_event) {
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
 * @return {!anychart.pyramidFunnelModule.Chart} An instance of the {@link anychart.pyramidFunnelModule.Chart} class for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.hoverSeries = function() {
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
 * @return {!anychart.pyramidFunnelModule.Chart} {@link anychart.pyramidFunnelModule.Chart} instance for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.select = function(opt_indexOrIndexes) {
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
 * @return {!anychart.pyramidFunnelModule.Chart} An instance of the {@link anychart.pyramidFunnelModule.Chart} class for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.selectSeries = function() {
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
 * @return {!anychart.pyramidFunnelModule.Chart} {@link anychart.pyramidFunnelModule.Chart} instance for method chaining.
 */
anychart.pyramidFunnelModule.Chart.prototype.selectPoint = function(indexOrIndexes, opt_event) {
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
anychart.pyramidFunnelModule.Chart.prototype.unselect = function(opt_indexOrIndexes) {
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
/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.applyAppearanceToPoint = function(pointState, opt_value) {
  this.colorizePoint_(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);

  return opt_value;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.getStartValueForAppearanceReduction = goog.nullFunction;


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.pyramidFunnelModule.Chart.prototype.applyAppearanceToSeries = function(pointState) {
  this.drawLabel_(pointState);
  this.colorizePoint_(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pyramidFunnelModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baseWidth',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'neckHeight',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'neckWidth',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'pointsPadding',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'reversed',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'overlapMode',
      anychart.enums.normalizeLabelsOverlapMode);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'connectorLength',
      anychart.core.settings.asIsNormalizer);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'connectorStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.pyramidFunnelModule.Chart, anychart.pyramidFunnelModule.Chart.PROPERTY_DESCRIPTORS);


//region --- anychart.core.IShapeManagerUser implementation
/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var val;
  var stateObject = state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_;
  if (opt_ignorePointSettings) {
    val = stateObject.getOption(name);
  } else {
    var pointStateName = state == 0 ? 'normal' : state == 1 ? 'hovered' : 'selected';
    var pointStateObject = point.get(pointStateName);
    val = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject[name] : void 0,
        point.get(anychart.color.getPrefixedColorName(state, name)),
        stateObject.getOption(name));
  }
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.getAutoHatchFill = function() {
  return /** @type {acgraph.vector.HatchFill} */ (
      acgraph.vector.normalizeHatchFill(this.hatchFillPalette().itemAt(this.getIterator().getIndex()) ||
      acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK));
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  return {
    'index': index,
    'sourceHatchFill': this.getAutoHatchFill(),
    'iterator': iterator
  };
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var iterator = this.getIterator();
  return {
    'index': iterator.getIndex(),
    'sourceColor': opt_baseColor || this.palette().itemAt(iterator.getIndex()) || 'blue',
    'iterator': iterator
  };
};
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.pyramidFunnelModule.Chart} .
 */
anychart.pyramidFunnelModule.Chart.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.labels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.labels());
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.labelsInvalidated_ = function(event) {
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
 * Draws outside label for a point.
 * @private
 * @param {anychart.PointState|number} pointState Point state.
 * @return {anychart.core.ui.LabelsFactory.Label} Label.
 */
anychart.pyramidFunnelModule.Chart.prototype.drawLabel_ = function(pointState) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointLabel = iterator.get('normal');
  pointLabel = goog.isDef(pointLabel) ? pointLabel['label'] : void 0;
  var hoverPointLabel = iterator.get('hovered');
  hoverPointLabel = goog.isDef(hoverPointLabel) ? hoverPointLabel['label'] : void 0;
  var selectPointLabel = iterator.get('selected');
  selectPointLabel = goog.isDef(selectPointLabel) ? selectPointLabel['label'] : void 0;

  pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, iterator.get('label'));
  hoverPointLabel = hovered ? anychart.utils.getFirstDefinedValue(hoverPointLabel, iterator.get('hoverLabel')) : null;
  selectPointLabel = selected ? anychart.utils.getFirstDefinedValue(selectPointLabel, iterator.get('selectLabel')) : null;

  var index = iterator.getIndex();
  var labelsFactory, stateFactory = null;
  var hoverLabels = this.hovered().labels();
  var selectLabels = this.selected().labels();
  if (selected) {
    stateFactory = labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(selectLabels);
  } else if (hovered) {
    stateFactory = labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hoverLabels);
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
              goog.isNull(hoverLabels.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  hoverLabels.enabled() :
              labelHoverEnabledState :
          goog.isNull(labelSelectEnabledState) ?
              goog.isNull(selectLabels.enabled()) ?
                  goog.isNull(labelEnabledState) ?
                      this.labels().enabled() :
                      labelEnabledState :
                  selectLabels.enabled() :
              labelSelectEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  var positionProvider = this.createLabelsPositionProvider_(null, pointState);
  var formatProvider = this.createFormatProvider();

  var isInsideLabels = this.isInsideLabels();

  var isFitToPoint = true;
  if (!hovered && !selected && isInsideLabels && this.getOption('overlapMode') == anychart.enums.LabelsOverlapMode.NO_OVERLAP) {
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

    label.currentLabelsFactory(stateFactory);
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hovered ? hoverPointLabel : selectPointLabel));

    if (iterator.meta('labelWidthForced')) {
      label['width'](anychart.utils.toNumber(iterator.meta('labelWidthForced')));
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
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label knows nothing
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
anychart.pyramidFunnelModule.Chart.prototype.createLabelsPositionProvider_ = function(opt_label, opt_pointState) {
  var labelPosition = this.getLabelsPosition_();

  var iterator = this.getIterator();
  var bounds = this.boundsValue_;

  var selected = goog.isDef(opt_pointState) ? this.state.isStateContains(opt_pointState, anychart.PointState.SELECT) : null;
  var hovered = goog.isDef(opt_pointState) ? !selected && this.state.isStateContains(opt_pointState, anychart.PointState.HOVER) : null;

  var pointLabel = iterator.get('normal');
  pointLabel = goog.isDef(pointLabel) ? pointLabel['label'] : void 0;
  var hoverPointLabel = iterator.get('hovered');
  hoverPointLabel = goog.isDef(hoverPointLabel) ? hoverPointLabel['label'] : void 0;
  var selectPointLabel = iterator.get('selected');
  selectPointLabel = goog.isDef(selectPointLabel) ? selectPointLabel['label'] : void 0;

  pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, iterator.get('label'));
  hoverPointLabel = hovered ? anychart.utils.getFirstDefinedValue(hoverPointLabel, iterator.get('hoverLabel')) : null;
  selectPointLabel = selected ? anychart.utils.getFirstDefinedValue(selectPointLabel, iterator.get('selectLabel')) : null;
  var labelSettings = selectPointLabel || hoverPointLabel || pointLabel || {};

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
    labelBounds = this.getTrueLabelBounds(opt_label, /** @type {anychart.PointState|number} */(opt_pointState));
  } else {
    labelBounds = this.labels().measureWithTransform(this.createFormatProvider(), null, /** @type {Object} */(labelSettings));
    labelBounds = anychart.math.Rect.fromCoordinateBox(labelBounds);
  }

  var labelAnchor = opt_label && opt_label.getOption('anchor') || this.labels().getOption('anchor');

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
anychart.pyramidFunnelModule.Chart.prototype.getTrueLabelBounds = function(label, pointState) {
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
  var labelBounds = this.labels().measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object} */(labelSettings));

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};


/**
 * To place the labels so that they do not overlap.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel If label is hovered.
 */
anychart.pyramidFunnelModule.Chart.prototype.overlapCorrection_ = function(opt_hoveredLabel) {
  if (this.getOption('overlapMode') != anychart.enums.LabelsOverlapMode.NO_OVERLAP || this.isInsideLabels() || !this.labels().enabled()) {
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
anychart.pyramidFunnelModule.Chart.prototype.checkOverlapWithSiblings_ = function(pointState, opt_hoveredLabel) {
  if (this.overlapCorrectionIterationCount_ == anychart.pyramidFunnelModule.Chart.OVERLAP_CORRECTION_ITERATION_COUNT_MAX_) {
    return;
  }

  var count = this.getIterator().getRowsCount();
  var intersectionExist = false;
  var index;
  var label;
  var labelBounds;
  var siblingLabel;
  var siblingLabelBounds;

  var reversed = /** @type {boolean} */ (this.getOption('reversed'));
  for (var i = 0; i < count - 1; i++) {
    if (reversed) {
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

    siblingLabel = reversed ? this.getNextEnabledLabel(label) : this.getPreviousEnabledLabel(label);

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
anychart.pyramidFunnelModule.Chart.prototype.getNextEnabledLabel = function(label) {
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
anychart.pyramidFunnelModule.Chart.prototype.getPreviousEnabledLabel = function(label) {
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
anychart.pyramidFunnelModule.Chart.prototype.putLabelIntoLabelsDomain_ = function(label, addedLabel) {
  var foundDomain = this.getLabelsDomainByLabel(label);

  if (!goog.isNull(foundDomain)) {
    foundDomain.addLabel(addedLabel);

  } else {
    var newLabelsDomain;

    newLabelsDomain = new anychart.pyramidFunnelModule.Chart.LabelsDomain(this);
    newLabelsDomain.addLabel(label);
    newLabelsDomain.addLabel(addedLabel);

    this.labelDomains.push(newLabelsDomain);
  }
};


/**
 * If the label is already contained in another domain, to find this domain.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {?anychart.pyramidFunnelModule.Chart.LabelsDomain}
 */
anychart.pyramidFunnelModule.Chart.prototype.getLabelsDomainByLabel = function(label) {
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
 * @param {anychart.pyramidFunnelModule.Chart.LabelsDomain} targetDomain
 * @param {anychart.pyramidFunnelModule.Chart.LabelsDomain} sourceDomain
 * @return {anychart.pyramidFunnelModule.Chart.LabelsDomain}
 */
anychart.pyramidFunnelModule.Chart.prototype.mergeLabelsDomains = function(targetDomain, sourceDomain) {
  var targetDomainIndex = targetDomain.labels[0].getIndex();
  var sourceDomainIndex = sourceDomain.labels[0].getIndex();

  /*
   * Marge labels with preservation of sorting.
   * if reversed == true then ascending pseudo sorting
   * if reversed == false then descending pseudo sorting
   *
   * This method was simplified by using mathematical logic (by Alexander Ky).
   */
  targetDomain.labels = (this.getOption('reversed') == (targetDomainIndex < sourceDomainIndex)) ?
      goog.array.concat(targetDomain.labels, sourceDomain.labels) :
      goog.array.concat(sourceDomain.labels, targetDomain.labels);

  goog.array.remove(this.labelDomains, sourceDomain);

  return targetDomain;
};


/**
 * To clear an array of label domains.
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.clearLabelDomains_ = function() {
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
 * @param {anychart.pyramidFunnelModule.Chart.LabelsDomain} labelDomain
 */
anychart.pyramidFunnelModule.Chart.prototype.removeLabelDomain = function(labelDomain) {
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
anychart.pyramidFunnelModule.Chart.prototype.isLabelFitsIntoThePoint_ = function(labelBounds) {
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
anychart.pyramidFunnelModule.Chart.prototype.isInsideLabels = function() {
  return this.getLabelsPosition_() == anychart.enums.PyramidLabelsPosition.INSIDE;
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.pyramidFunnelModule.Chart.prototype.isInColumn_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.pyramidFunnelModule.Chart.prototype.isInLeftPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.pyramidFunnelModule.Chart.prototype.isInRightPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN);
};


/**
 * Shifts centerX if the label does not fit on width. And sets a new width for the label.
 * @private
 */
anychart.pyramidFunnelModule.Chart.prototype.shiftCenterX_ = function() {
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

  var pointWidthAtY = this.getOption('reversed') ?
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
      // The connector must not be less than anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH
      if (labelX2 + anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH > pointXLeft) {
        numberToShift = labelX2 + anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH - pointXLeft;

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ + maxShift;

          // re-calculate pointXLeft
          pointXLeft = this.centerXValue_ - pointWidthAtY / 2;
          pointXLeft = bounds.left + pointXLeft;

          newLabelWidth = pointXLeft - anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH - labelX1;

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
      if (labelX1 < 0 || labelX1 - anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH < pointXRight) {
        numberToShift = Math.abs(pointXRight - labelX1 + anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH);

        if (labelX1 < 0 || numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ - maxShift;

          // re-calculate pointXLeft
          pointXRight = this.centerXValue_ + pointWidthAtY / 2;
          pointXRight = pointXRight + bounds.left;

          newLabelWidth = labelX2 - anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH - pointXRight;

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
anychart.pyramidFunnelModule.Chart.prototype.getLabelsPosition_ = function() {
  return anychart.enums.normalizePyramidLabelsPosition(this.labels().getOption('position'));
};


/**
 * Draws connector line for label.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.pyramidFunnelModule.Chart.prototype.drawConnectorLine_ = function(label, path, pointState) {
  var bounds = this.boundsValue_;
  var index = label.getIndex();

  // '.data()' drawing connector should occur regardless of the position of the iterator.
  // Since the connectors can be redrawn several times through the method of
  // anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.applyLabelsPosition_
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

    if (x0 > x1 && (Math.abs(y1 - y0) < anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 - anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH;
    }

    // in right
  } else if (this.isInRightPosition_()) {
    x1 = this.centerXValue_ + pointWidthAtY / 2;
    x1 = x1 + bounds.left;

    if (x0 < x1 && (Math.abs(y1 - y0) < anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 + anychart.pyramidFunnelModule.Chart.MIN_CONNECTOR_LENGTH;
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
anychart.pyramidFunnelModule.Chart.prototype.updateConnector = function(label, pointState) {
  var labelIndex = label.getIndex();

  if (this.drawnConnectors_[labelIndex]) {
    this.drawConnectorLine_(label, this.drawnConnectors_[labelIndex], pointState);
  } else {
    var connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
    this.drawnConnectors_[labelIndex] = connectorPath;
    connectorPath.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke')));
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
 * @return {anychart.core.ui.MarkersFactory|anychart.pyramidFunnelModule.Chart} Markers instance or itself for chaining call.
 */
anychart.pyramidFunnelModule.Chart.prototype.markers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.markers(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.MarkersFactory} */ (this.normal_.markers());
};


/**
 * Listener for markers invalidation.
 * @private
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.pyramidFunnelModule.Chart.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Return marker fill color for point.
 * @return {!acgraph.vector.Fill} Marker color for point.
 */
anychart.pyramidFunnelModule.Chart.prototype.getMarkerFill = function() {
  var fillGetter = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
  var fill = /** @type {acgraph.vector.Fill} */(fillGetter(this, anychart.PointState.NORMAL, true, true));
  return /** @type {acgraph.vector.Fill} */(anychart.color.setOpacity(fill, 1, true));
};


/**
 * Return marker stroke color for point.
 * @return {!acgraph.vector.Stroke} Marker color for point.
 */
anychart.pyramidFunnelModule.Chart.prototype.getMarkerStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(this.getMarkerFill()));
};


/**
 * Create points position provider.
 * @private
 * @param {string} anchorPosition Understands anychart.enums.Anchor and some additional values.
 * @return {Object} Object with info for markers position.
 */
anychart.pyramidFunnelModule.Chart.prototype.createMarkersPositionProvider_ = function(anchorPosition) {
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
anychart.pyramidFunnelModule.Chart.prototype.getWidthAtYGivenReversed_ = function(y) {
  var bounds = this.boundsValue_;
  return this.getOption('reversed') ?
      this.getWidthAtY_(y - bounds.top) :
      this.getWidthAtY_(bounds.height - y + bounds.top);
};


/**
 * Draws marker for the point.
 * @protected
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.pyramidFunnelModule.Chart.prototype.drawMarker = function(pointState) {
  var iterator = this.getIterator();

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var pointMarker = iterator.get('normal');
  pointMarker = goog.isDef(pointMarker) ? pointMarker['marker'] : void 0;
  var hoverPointMarker = iterator.get('hovered');
  hoverPointMarker = goog.isDef(hoverPointMarker) ? hoverPointMarker['marker'] : void 0;
  var selectPointMarker = iterator.get('selected');
  selectPointMarker = goog.isDef(selectPointMarker) ? selectPointMarker['marker'] : void 0;

  pointMarker = anychart.utils.getFirstDefinedValue(pointMarker, iterator.get('marker'));
  hoverPointMarker = anychart.utils.getFirstDefinedValue(hoverPointMarker, iterator.get('hoverMarker'));
  selectPointMarker = anychart.utils.getFirstDefinedValue(selectPointMarker, iterator.get('selectMarker'));

  var index = this.getIterator().getIndex();
  var markersFactory;
  var hoverMarkers = this.hovered().markers();
  var selectMarkers = this.selected().markers();
  if (selected) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(selectMarkers);
  } else if (hovered) {
    markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(hoverMarkers);
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
              goog.isNull(hoverMarkers.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers().enabled() :
                      markerEnabledState :
                  hoverMarkers.enabled() :
              markerHoverEnabledState :
          goog.isNull(markerSelectEnabledState) ?
              goog.isNull(selectMarkers.enabled()) ?
                  goog.isNull(markerEnabledState) ?
                      this.markers().enabled() :
                      markerEnabledState :
                  selectMarkers.enabled() :
              markerSelectEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers().enabled() :
          markerEnabledState;

  if (isDraw) {
    var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
    var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
    var markerSelectPosition = selectPointMarker && selectPointMarker['position'] ? selectPointMarker['position'] : null;

    var position = (hovered && (markerHoverPosition || hoverMarkers.getOption('position'))) ||
        (selected && (markerSelectPosition || selectMarkers.getOption('position'))) ||
        markerPosition || this.markers().getOption('position');

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
    var finalMarkerHoverType = goog.isDef(markerHoverType) ? markerHoverType : hoverMarkers.getType();
    var markerSelectType = selectPointMarker && selectPointMarker['type'];
    var finalMarkerSelectType = goog.isDef(markerSelectType) ? markerSelectType : selectMarkers.getType();

    if (selected && goog.isDef(finalMarkerSelectType))
      markerSettings.type = finalMarkerSelectType;
    else if (hovered && goog.isDef(finalMarkerHoverType))
      markerSettings.type = finalMarkerHoverType;
    else
      markerSettings.type = finalMarkerType;

    var markerFill = pointMarker && pointMarker['fill'];
    var finalMarkerFill = goog.isDef(markerFill) ? markerFill : (this.markers().getFill() || this.getMarkerFill());
    var markerHoverFill = hoverPointMarker && hoverPointMarker['fill'];
    var finalMarkerHoverFill = goog.isDef(markerHoverFill) ? markerHoverFill : hoverMarkers.getFill();
    var markerSelectFill = selectPointMarker && selectPointMarker['fill'];
    var finalMarkerSelectFill = goog.isDef(markerSelectFill) ? markerSelectFill : selectMarkers.getFill();

    if (selected && goog.isDef(finalMarkerSelectFill))
      markerSettings.fill = finalMarkerSelectFill;
    else if (hovered && goog.isDef(finalMarkerHoverFill))
      markerSettings.fill = finalMarkerHoverFill;
    else
      markerSettings.fill = finalMarkerFill;

    var markerStroke = pointMarker && pointMarker['stroke'];
    var finalMarkerStroke = goog.isDef(markerStroke) ? markerStroke : (this.markers().getStroke() || this.getMarkerStroke());
    var markerHoverStroke = hoverPointMarker && hoverPointMarker['stroke'];
    var finalMarkerHoverStroke = goog.isDef(markerHoverStroke) ? markerHoverStroke : (hoverMarkers.getStroke() || this.getMarkerStroke());
    var markerSelectStroke = selectPointMarker && selectPointMarker['stroke'];
    var finalMarkerSelectStroke = goog.isDef(markerSelectStroke) ? markerSelectStroke : (selectMarkers.getStroke() || this.getMarkerStroke());

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
/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(0);
  this.setupCreated('tooltip', tooltip);
  tooltip.chart(this);
  tooltip.listenSignals(this.onTooltipSignal_, this);
  return tooltip;
};


/**
 * Tooltip invalidation handler.
 * @private
 * @param {anychart.SignalEvent} event Event object.
 */
anychart.pyramidFunnelModule.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.pyramidFunnelModule.Chart.prototype.showTooltip = function(opt_event) {
  var legend = this.getCreated('legend');
  if (opt_event && legend && opt_event['target'] == legend) {
    return;
  }

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (opt_event) {
    tooltip.showFloat(opt_event['clientX'], opt_event['clientY'], formatProvider);
    // for float
    this.listen(goog.events.EventType.MOUSEMOVE, this.showTooltip);
  }
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.pyramidFunnelModule.Chart.prototype.hideTooltip = function() {
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
anychart.pyramidFunnelModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_DATA)) {
    this.resetStatistics();

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
    this.statistics(anychart.enums.Statistics.COUNT, count);
    this.statistics(anychart.enums.Statistics.MIN, min);
    this.statistics(anychart.enums.Statistics.MAX, max);
    this.statistics(anychart.enums.Statistics.SUM, sum);
    this.statistics(anychart.enums.Statistics.AVERAGE, anychart.math.round(avg || NaN, anychart.math.getPrecision(sum || 0)));

    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_DATA);
  }
};


/**
 * Create chart label/tooltip format provider.
 * @return {anychart.format.Context} Object with info for labels/tooltip formatting.
 * @protected
 */
anychart.pyramidFunnelModule.Chart.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();

  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var values = {
    'x': {value: iterator.get('x'), type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'name': {value: iterator.get('name'), type: anychart.enums.TokenType.STRING},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN}
  };

  this.pointProvider_.propagate(values);

  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.pyramidFunnelModule.Chart.prototype.createTooltipContextProvider = function() {
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
anychart.pyramidFunnelModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();
  var index;

  while (iterator.advance()) {
    index = iterator.getIndex();

    var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
    var itemText = null;
    if (goog.isFunction(itemsFormat)) {
      var format = this.createFormatProvider();
      format.pointInternal = this.getPoint(index);
      itemText = itemsFormat.call(format, format);
    }
    if (!goog.isString(itemText)) {
      itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
    }

    var fillResolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
    var strokeResolver = anychart.color.getColorResolver('stroke', anychart.enums.ColorType.STROKE, false);
    var hatchFillResolver = anychart.color.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, false);

    var obj = {
      'enabled': true,
      'meta': {
        'pointIndex': index,
        'pointValue': iterator.get('value'),
        series: this
      },
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'text': itemText,
      'iconStroke': /** @type {acgraph.vector.Stroke} */ (strokeResolver(this, anychart.PointState.NORMAL, false)),
      'iconFill': /** @type {acgraph.vector.Fill} */ (fillResolver(this, anychart.PointState.NORMAL, false)),
      'iconHatchFill': /** @type {acgraph.vector.HatchFill} */ (hatchFillResolver(this, anychart.PointState.NORMAL, false))
    };
    goog.object.extend(obj, legendItem);
    obj['sourceUid'] = goog.getUid(this);
    obj['sourceKey'] = index;
    data.push(obj);
  }

  return data;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.pyramidFunnelModule.Chart|anychart.enums.SelectionMode|null} .
 */
anychart.pyramidFunnelModule.Chart.prototype.selectionMode = function(opt_value) {
  return null;
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.pyramidFunnelModule.Chart|anychart.enums.HoverMode} .
 */
anychart.pyramidFunnelModule.Chart.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */(this.hoverMode_);
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.isNoData = function() {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.serialize = function() {
  var json = anychart.pyramidFunnelModule.Chart.base(this, 'serialize');

  json['data'] = this.data().serialize();

  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['tooltip'] = this.tooltip().serialize();

  anychart.core.settings.serialize(this, anychart.pyramidFunnelModule.Chart.PROPERTY_DESCRIPTORS, json);
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return {'chart': json};
};


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.pyramidFunnelModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.pyramidFunnelModule.Chart.PROPERTY_DESCRIPTORS, config);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
  this.data(config['data']);

  this.hatchFillPalette(config['hatchFillPalette']);
  this.markerPalette(config['markerPalette']);

  this.palette(config['palette']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);
};


/**
 * @inheritDoc
 */
anychart.pyramidFunnelModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.animationQueue_,
      this.normal_,
      this.hovered_,
      this.selected_,
      this.parentViewToDispose_,
      this.parentView_,
      this.view_,
      this.palette_,
      this.hatchFillPalette_,
      this.markerPalette_,
      this.dataLayer_,
      this.hatchLayer_,
      this.connectorsLayer_);
  this.animationQueue_ = null;
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  this.parentViewToDispose_ = null;
  this.parentView_ = null;
  this.view_ = null;
  delete this.iterator_;
  this.palette_ = null;
  this.hatchFillPalette_ = null;
  this.markerPalette_ = null;
  this.dataLayer_ = null;
  this.hatchLayer_ = null;
  this.connectorsLayer_ = null;
  anychart.pyramidFunnelModule.Chart.base(this, 'disposeInternal');
};



//----------------------------------------------------------------------------------------------------------------------
//
//  LabelsDomain.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Labels domain for overlap mode.
 * @constructor
 * @param {!anychart.pyramidFunnelModule.Chart} chart .
 */
anychart.pyramidFunnelModule.Chart.LabelsDomain = function(chart) {
  /**
   * Link to chart.
   * @type {!anychart.pyramidFunnelModule.Chart}
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
anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.addLabel = function(label) {
  this.labels.push(label);
  if (this.chart.getOption('reversed')) {
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
anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.clear = function() {
  this.labels.length = 0;
};


/**
 * To calculate the coordinates of the labels given the overlap mode.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel
 */
anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.recalculateLabelsPosition = function(opt_hoveredLabel) {
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
anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.applyLabelsPosition_ = function(opt_hoveredLabel) {
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
      var prevLabelPositionBottom = prevLabelPosition.y + prevLabelBounds.height / 2 + (prevLabel.getOption('offsetY') || 0);
      var currentLabelPositionTop = labelNewY - labelBounds.height / 2 + (label.getOption('offsetY') || 0);

      if (currentLabelPositionTop < prevLabelPositionBottom) {
        labelNewY += prevLabelPositionBottom - currentLabelPositionTop;
      }
    }

    label.positionProvider({'value': {'x': labelPositionProvider.x, 'y': labelNewY}});
    // Always draw label, because hover and unhover (with offsets and rotations and other bounds changers).
    label.draw();
    domain.chart.updateConnector(label, pointState);

    labelsHeightSum += labelBounds.height;
    labelsOffsetYSum += label.getOption('offsetY') || 0;

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
anychart.pyramidFunnelModule.Chart.LabelsDomain.prototype.getLabelBounds_ = function(label, pointState) {
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
  var labelBounds = this.chart.labels().measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object} */(labelSettings));

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};


/** @inheritDoc */
anychart.pyramidFunnelModule.Chart.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


//exports
(function() {
  var proto = anychart.pyramidFunnelModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
  proto['palette'] = proto.palette;
  proto['tooltip'] = proto.tooltip;

  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['markerPalette'] = proto.markerPalette;

  proto['labels'] = proto.labels;
  proto['markers'] = proto.markers;

  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;

  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
  proto['getPoint'] = proto.getPoint;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  // auto generated
  // proto['baseWidth'] = proto.baseWidth;
  // proto['neckHeight'] = proto.neckHeight;
  // proto['neckWidth'] = proto.neckWidth;
  // proto['pointsPadding'] = proto.pointsPadding;
  // proto['reversed'] = proto.reversed;
  // proto['overlapMode'] = proto.overlapMode;
  // proto['connectorLength'] = proto.connectorLength;
  // proto['connectorStroke'] = proto.connectorStroke;
  // proto['fill'] = proto.fill;
  // proto['hoverFill'] = proto.hoverFill;
  // proto['selectFill'] = proto.selectFill;
  // proto['hatchFill'] = proto.hatchFill;
  // proto['hoverHatchFill'] = proto.hoverHatchFill;
  // proto['selectHatchFill'] = proto.selectHatchFill;
  // proto['stroke'] = proto.stroke;
  // proto['hoverStroke'] = proto.hoverStroke;
  // proto['selectStroke'] = proto.selectStroke;
})();
