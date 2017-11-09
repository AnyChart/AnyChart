goog.provide('anychart.core.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series');
goog.require('anychart.core.series.RenderingSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesA11y');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.IXScale');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.utils.ISeriesWithError}
 * @implements {anychart.core.IShapeManagerUser}
 */
anychart.core.series.Base = function(chart, plot, type, config) {
  anychart.core.series.Base.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {!anychart.core.IChart}
   */
  this.chart = chart;

  /**
   * Plot reference.
   * @type {!anychart.core.IPlot}
   */
  this.plot = plot;

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};
  this.autoSettings['pointWidth'] = '90%';
  this.autoSettings['isVertical'] = this.chart.isVertical();
  this.autoSettings['minPointLength'] = 0;

  /**
   * Series clip.
   * @type {boolean|anychart.math.Rect}
   * @private
   */
  this.clip_ = false;

  /**
   * Statistics map.
   * @type {Object}
   * @private
   */
  this.statistics_ = {};

  /**
   * Error paths dictionary by stroke object hash.
   * @type {Array.<!acgraph.vector.Path>}
   * @private
   */
  this.errorPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.errorPathsPool_ = null;

  /**
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * Clip element for the root layer to reduce clip instances amount.
   * @type {acgraph.vector.Clip}
   * @private
   */
  this.clipElement_ = null;

  /**
   * A comparison-zeroed value. This value should be substracted from all values series draw.
   * @type {number}
   */
  this.comparisonZero = 0;

  /**
   * @type {anychart.core.utils.SeriesA11y}
   * @private
   */
  this.a11y_ = null;

  /**
   * An array of functions that calculate different parts of meta for the point.
   * @type {Array.<Function>}
   * @protected
   */
  this.metaMakers = [];

  /**
   * Whether to disable stroke scaling.
   * @type {boolean}
   * @protected
   */
  this.disableStrokeScaling = false;

  /**
   * Renderer.
   * @type {anychart.core.series.RenderingSettings}
   * @private
   */
  this.renderingSettings_ = new anychart.core.series.RenderingSettings(this);
  this.renderingSettings_.listenSignals(this.rendererInvalidated_, this);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['negativeFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['risingFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['fallingFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['stroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['lowStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['highStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['negativeStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['risingStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['fallingStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['medianStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['stemStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['whiskerStroke',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['hatchFill',
      anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['negativeHatchFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['risingHatchFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['fallingHatchFill',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['whiskerWidth',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS],
    ['type',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED],
    ['size',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED],
    ['labels', 0, 0],
    ['markers', 0, 0],
    ['outlierMarkers', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_MARKERS_AFTER_INIT_CALLBACK);
  this.normal_.setOption(anychart.core.StateSettings.OUTLIER_MARKERS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_OUTLIER_MARKERS_AFTER_INIT_CALLBACK);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['negativeFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['risingFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['fallingFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['stroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['lowStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['highStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['negativeStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['risingStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['fallingStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['medianStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['stemStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['whiskerStroke', 0, 0, anychart.core.series.Capabilities.ANY],
    ['hatchFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['negativeHatchFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['risingHatchFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['fallingHatchFill', 0, 0, anychart.core.series.Capabilities.ANY],
    ['whiskerWidth', 0, 0, anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS],
    ['type', 0, 0, anychart.core.drawers.Capabilities.IS_MARKER_BASED],
    ['size', 0, 0, anychart.core.drawers.Capabilities.IS_MARKER_BASED],
    ['labels', 0, 0],
    ['markers', 0, 0],
    ['outlierMarkers', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);
  function markAllConsistent(factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
  }
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.hovered_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['color',
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY],
    ['xPointPosition',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.series.Capabilities.ANY],
    ['pointWidth',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.IS_WIDTH_BASED],
    ['maxPointWidth',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.IS_WIDTH_BASED],
    ['minPointLength',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION,
      anychart.core.drawers.Capabilities.IS_WIDTH_BASED,
      this.resetSharedStack
    ],
    ['connectMissingPoints',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING],
    ['displayNegative',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION,
      anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE],
    ['stepDirection',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION],
    ['isVertical',
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.ANY]
  ]);

  this.applyConfig(config, true);
};
goog.inherits(anychart.core.series.Base, anychart.core.VisualBaseWithBounds);
anychart.core.settings.populateAliases(anychart.core.series.Base, [
  'fill',
  'negativeFill',
  'risingFill',
  'fallingFill',
  'stroke',
  'lowStroke',
  'highStroke',
  'negativeStroke',
  'risingStroke',
  'fallingStroke',
  'medianStroke',
  'stemStroke',
  'whiskerStroke',
  'hatchFill',
  'negativeHatchFill',
  'risingHatchFill',
  'fallingHatchFill',
  'whiskerWidth',
  'type',
  'size'
], 'normal');



/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.core.series.Base.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.core.series.Base} .
 */
anychart.core.series.Base.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.labels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.labels());
};


/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.MarkersFactory|anychart.core.series.Base} .
 */
anychart.core.series.Base.prototype.markers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.markers(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.MarkersFactory} */ (this.normal_.markers());
};


/**
 * Getter/setter for outlier markers.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.MarkersFactory|anychart.core.series.Base} .
 */
anychart.core.series.Base.prototype.outlierMarkers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.outlierMarkers(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.MarkersFactory} */ (this.normal_.outlierMarkers());
};


//region --- Class const
/**
 * Consistency states supported by series.
 * @type {number}
 */
anychart.core.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_DATA |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_MARKERS |
    anychart.ConsistencyState.SERIES_OUTLIERS |
    anychart.ConsistencyState.SERIES_ERROR |
    anychart.ConsistencyState.SERIES_COLOR |
    anychart.ConsistencyState.SERIES_CLIP |
    anychart.ConsistencyState.SERIES_POINTS |
    anychart.ConsistencyState.SERIES_SHAPE_MANAGER |
    anychart.ConsistencyState.A11Y;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND |
    anychart.Signal.NEEDS_UPDATE_A11Y;


/**
 * Labels z-index.
 */
anychart.core.series.Base.prototype.LABELS_ZINDEX = anychart.core.shapeManagers.LABELS_ZINDEX;


/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.core.series.Base.prototype.TOKEN_ALIASES = (function() {
  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.BUBBLE_SIZE] = 'size';
  tokenAliases[anychart.enums.StringToken.RANGE_START] = 'low';
  tokenAliases[anychart.enums.StringToken.RANGE_END] = 'high';
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';
  return tokenAliases;
})();


//endregion
//region --- Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.core.series.Base, number):(acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill)>}
 * @private
 */
anychart.core.series.Base.colorResolversCache_ = {};


/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.core.series.Base, anychart.data.IRowInfo, number):*>}
 * @private
 */
anychart.core.series.Base.settingsResolversCache_ = {};


/**
 * If the series should bind handlers to root layer.
 * @type {boolean}
 * @protected
 */
anychart.core.series.Base.prototype.canBeInteractive = true;


/**
 * Series config.
 * @type {!anychart.core.series.TypeConfig}
 */
anychart.core.series.Base.prototype.config;


/**
 * Current drawer instance.
 * @type {!anychart.core.drawers.Base}
 */
anychart.core.series.Base.prototype.drawer;


/**
 * Current series shape manager.
 * @type {!anychart.core.shapeManagers.Base}
 * @protected
 */
anychart.core.series.Base.prototype.shapeManager;


/**
 * @type {!anychart.data.IIterator}
 * @protected
 */
anychart.core.series.Base.prototype.iterator;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.series.Base.prototype.pixelBoundsCache;


/**
 * Series id.
 * @type {string}
 * @private
 */
anychart.core.series.Base.prototype.id_;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.core.series.Base.prototype.name_;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.core.series.Base.prototype.meta_;


/**
 * Series tooltip.
 * @type {anychart.core.ui.Tooltip}
 * @protected
 */
anychart.core.series.Base.prototype.tooltipInternal;


/**
 * Series error.
 * @type {anychart.core.utils.Error}
 * @private
 */
anychart.core.series.Base.prototype.error_;


/**
 * Series labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @protected
 */
anychart.core.series.Base.prototype.labelsInternal;


/**
 * Series hover labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @protected
 */
anychart.core.series.Base.prototype.hoverLabelsInternal;


/**
 * Series select labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @protected
 */
anychart.core.series.Base.prototype.selectLabelsInternal;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.markers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.hoverMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.selectMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.outlierMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.hoverOutlierMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.selectOutlierMarkers_;


/**
 * Dictionary of outlier markers indexes by point index.
 * Need to identify what outliers belongs to point when hover/unhover it.
 * @type {Object.<number, !Array.<number>>}
 * @private
 */
anychart.core.series.Base.prototype.indexToMarkerIndexes_;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * Calculated minimum size value. For inner use.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.minimumSizeValue_ = NaN;


/**
 * Calculated maximum size value. For inner use.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.maximumSizeValue_ = NaN;


//endregion
//region --- Series setup
//----------------------------------------------------------------------------------------------------------------------
//
//  Series setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {string}
 */
anychart.core.series.Base.prototype.getType = function() {
  return this.type_;
};


/**
 * @param {string=} opt_value
 * @return {anychart.core.series.Base|string}
 */
anychart.core.series.Base.prototype.seriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var info = this.chart.getConfigByType(opt_value);
    if (info && /** @type {string} */(info[0]) != this.type_) {
      this.type_ = /** @type {string} */(info[0]); // normalized type
      this.applyConfig(/** @type {anychart.core.series.TypeConfig} */(info[1]), false);
      // since we are changing entire series - we should recalculate and redraw everything
      this.invalidate(
          anychart.ConsistencyState.SERIES_POINTS |
          anychart.ConsistencyState.SERIES_CLIP |
          anychart.ConsistencyState.SERIES_DATA |
          anychart.ConsistencyState.A11Y,
          this.SUPPORTED_SIGNALS);
    }
    return this;
  }
  return this.type_;
};


/**
 * Getter/Setter for series type.
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean=} opt_reapplyClip Reapply clip and zIndex config.
 */
anychart.core.series.Base.prototype.applyConfig = function(config, opt_reapplyClip) {
  var newDrawer = /** @type {!anychart.core.drawers.Base} */(new anychart.core.drawers.AvailableDrawers[config.drawerType](this));
  if (this.config) {
    if (this.rootLayer) {
      // if prev config used own root and the next one doesn't - we should dispose the root layer
      if (!this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT) &&
          this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT, config, newDrawer)) {
        goog.dispose(this.rootLayer);
        this.rootLayer = null;
      } else if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT) &&
          !this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT, config, newDrawer)) {
        this.rootLayer = null;
      }
    }
  }
  this.config = config;

  this.tooltipContext = null;
  this.legendProvider = null;

  goog.dispose(this.drawer);
  this.drawer = newDrawer;

  this.suspendSignalsDispatching();
  this.recreateShapeManager();

  this.themeSettings = this.plot.defaultSeriesSettings()[anychart.utils.toCamelCase(this.type_)] || {};
  this.normal_.setupInternal(true, this.themeSettings);
  this.normal_.setupInternal(true, this.themeSettings['normal']);
  this.hovered_.setupInternal(true, this.themeSettings['hovered']);
  this.selected_.setupInternal(true, this.themeSettings['selected']);

  if (this.supportsOutliers()) {
    this.indexToMarkerIndexes_ = {};
  } else if (this.indexToMarkerIndexes_) {
    delete this.indexToMarkerIndexes_;
  }

  this.autoSettings['xPointPosition'] = 0.5;

  this.applyDefaultsToElements(this.themeSettings, true, true, opt_reapplyClip);
  this.resumeSignalsDispatching(false);
  // here should markers/labels/errors/outliers setup be

  this.renderingSettings_.setDefaults();

  this.setupAutoZIndex();
};


/**
 * Recreates shape manager.
 */
anychart.core.series.Base.prototype.recreateShapeManager = function() {
  goog.dispose(this.shapeManager);
  var smc = (this.config.shapeManagerType == anychart.enums.ShapeManagerTypes.PER_POINT) ?
      anychart.core.shapeManagers.PerPoint :
      anychart.core.shapeManagers.PerSeries;
  this.shapeManager = new smc(
      this,
      this.renderingSettings_.getShapesConfig(),
      this.check(anychart.core.series.Capabilities.ALLOW_INTERACTIVITY),
      null,
      this.config.postProcessor,
      this.disableStrokeScaling);
};


/**
 * @param {Object} defaults
 * @param {boolean=} opt_resetLegendItem Temporary flag.
 * @param {boolean=} opt_default
 * @param {boolean=} opt_reapplyClip
 */
anychart.core.series.Base.prototype.applyDefaultsToElements = function(defaults, opt_resetLegendItem, opt_default, opt_reapplyClip) {
  if (this.supportsError())
    this.error().setupInternal(!!opt_default, defaults['error']);

  if (opt_resetLegendItem)
    this.legendItem().reset();
  this.legendItem().setupInternal(!!opt_default, defaults['legendItem']);

  if ('tooltip' in defaults) {
    this.tooltip().setupInternal(!!opt_default, defaults['tooltip']);
  }

  if (!goog.isDef(opt_reapplyClip))
    opt_reapplyClip = opt_default;

  if (!!opt_reapplyClip) {
    this.clip(defaults['clip']);
    this.zIndex(defaults['zIndex']);
  }

  this.a11y().setupInternal(!!opt_default, defaults['a11y'] || this.plot.defaultSeriesSettings()['a11y']);
};


/**
 * Returns animation type.
 * @return {string}
 */
anychart.core.series.Base.prototype.getAnimationType = function() {
  return this.type_;
};


/**
 * Renderer settings invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.series.Base.prototype.rendererInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.SERIES_POINTS;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    state |= anychart.ConsistencyState.SERIES_SHAPE_MANAGER;
  this.invalidate(state, signal);
};


//endregion
//region --- Index/Id/Name/SeriesMeta
//----------------------------------------------------------------------------------------------------------------------
//
//  Index/Id/Name
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns series index in chart.
 * @return {number}
 */
anychart.core.series.Base.prototype.getIndex = function() {
  if (this.isDisposed())
    return -1;
  return goog.array.indexOf(this.plot.getAllSeries(), this);
};


/**
 * Getter/setter for series global index, used in palettes and autoId.
 * @param {number=} opt_value Id of the series.
 * @return {number|anychart.core.series.Base} Id or self for chaining.
 */
anychart.core.series.Base.prototype.autoIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoIndex_ = opt_value;
    return this;
  }
  return this.autoIndex_;
};


/**
 * Setups auto zIndex value based on series type and plot preferences.
 */
anychart.core.series.Base.prototype.setupAutoZIndex = function() {
  var inc = this.autoIndex_ * anychart.core.series.Base.ZINDEX_INCREMENT_MULTIPLIER;
  this.setAutoZIndex(this.plot.getBaseSeriesZIndex(this) + inc);
};


/**
 * Getter/setter for series id.
 * @param {(string)=} opt_value Id of the series.
 * @return {string|anychart.core.series.Base} Id or self for chaining.
 */
anychart.core.series.Base.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.id_ != opt_value) {
      this.id_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.id_ || String(this.autoIndex_);
};


/**
 * Sets and gets series name.
 * @param {string=} opt_value
 * @return {anychart.core.series.Base|string}
 */
anychart.core.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.name_ || ('Series ' + this.getIndex());
};


/**
 * Sets/gets series meta data.
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.core.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
  if (!this.meta_) this.meta_ = {};

  if (goog.isDef(opt_object_or_key)) {
    if (goog.isDef(opt_value)) {
      var value = this.meta_[opt_object_or_key];
      if (!goog.isDef(value) || value != opt_value) {
        this.meta_[opt_object_or_key] = opt_value;
        //TODO: send signal to redraw components that depend on meta (legend)
      }
      return this;
    } else {
      if (goog.isObject(opt_object_or_key)) {
        if (this.meta_ != opt_object_or_key) {
          this.meta_ = opt_object_or_key;
          //TODO: send signal to redraw components that depend on meta (legend)
        }
        return this;
      } else {
        return this.meta_[opt_object_or_key];
      }
    }
  } else {
    return this.meta_;
  }
};


//endregion
//region --- Support testers
//----------------------------------------------------------------------------------------------------------------------
//
//  Support testers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Checks if series supports passed capability.
 * @param {anychart.core.series.Capabilities|anychart.core.drawers.Capabilities|number} capability
 * @param {anychart.core.series.TypeConfig=} opt_config
 * @param {anychart.core.drawers.Base=} opt_drawer
 * @return {boolean}
 */
anychart.core.series.Base.prototype.check = function(capability, opt_config, opt_drawer) {
  var config = opt_config || this.config;
  var drawer = opt_drawer || this.drawer;
  return !!(capability & config.capabilities | capability & drawer.flags);
};


/**
 * Checks if the series supports interactiviy.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsInteractivity = function() {
  return this.check(anychart.core.series.Capabilities.ALLOW_INTERACTIVITY);
};


/**
 * Checks if the series supports overriding settings by points.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsPointSettings = function() {
  return this.check(anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS);
};


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.series.Base.prototype.supportsStack = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_STACK);
};


/**
 * Whether series can be drawn in comparison mode.
 * @return {boolean} .
 */
anychart.core.series.Base.prototype.supportsComparison = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON);
};


/**
 * Tester if the series can have an error. (All except range series, OHLC, Bubble).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsError = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_ERROR) &&
      this.check(anychart.core.series.Capabilities.ALLOW_ERROR);
};


/**
 * Tester if the series has outlierMarkers() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsOutliers = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS);
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsMarkers = function() {
  return this.check(anychart.core.series.Capabilities.SUPPORTS_MARKERS);
};


/**
 * Tester if the series has labels() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsLabels = function() {
  return this.check(anychart.core.series.Capabilities.SUPPORTS_LABELS);
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isSizeBased = function() {
  return this.check(anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE);
};


/**
 * Tester if the series needs heat (HeatMap).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.needsHeat = function() {
  return false;
};


/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isWidthBased = function() {
  return !!this.renderingSettings_.getOption('needsWidth');
};


/**
 * Tester if the series needs zero.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.needsZero = function() {
  return !!this.renderingSettings_.getOption('needsZero');
};


/**
 * Tester if the series should be distributed by width.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isWidthDistributed = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION);
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isDiscreteBased = function() {
  return this.check(anychart.core.drawers.Capabilities.IS_DISCRETE_BASED);
};


/**
 * Tests whether series point supports min length option.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isMinPointLengthBased = function() {
  return this.isDiscreteBased() && this.isWidthBased();
};


/**
 * Tester if the series is area based (area, area3d).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isLineBased = function() {
  return this.check(anychart.core.drawers.Capabilities.IS_LINE_BASED);
};


/**
 * Tester if it is a series.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isSeries = function() {
  return true;
};


/**
 * Tester if it is a chart.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isChart = function() {
  return false;
};


/**
 * If the series has its own root layer.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.hasOwnLayer = function() {
  return !this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT);
};


/**
 * If the series zero line is complex (not a straight line or single point).
 * Needed in Area and PolarArea drawers.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.hasComplexZero = function() {
  return this.planIsStacked();
};


//endregion
//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get point width in case of width-based series.
 * @return {number} Point width.
 */
anychart.core.series.Base.prototype.getPixelPointWidth = function() {
  var pointPixelSize = 0;
  if (this.isWidthBased()) {
    var pointWidth = this.getInheritedOption('pointWidth');
    pointPixelSize = anychart.utils.normalizeSize(/** @type {(number|string)} */(pointWidth), this.getCategoryWidth());

    var maxPointWidth = this.getInheritedOption('maxPointWidth');
    if (goog.isDefAndNotNull(maxPointWidth)) {
      var maxPointPixelSize = anychart.utils.normalizeSize(/** @type {(number|string)} */(maxPointWidth), this.getCategoryWidth());
      pointPixelSize = Math.min(pointPixelSize, maxPointPixelSize);
    }
  }

  return pointPixelSize;
};


/**
 * Returns default series hatch fill.
 * @return {acgraph.vector.HatchFill}
 */
anychart.core.series.Base.prototype.getAutoHatchFill = function() {
  return this.autoHatchFill || acgraph.vector.normalizeHatchFill(anychart.core.series.Base.DEFAULT_HATCH_FILL_TYPE);
};


/**
 * @return {!anychart.core.I3DProvider}
 */
anychart.core.series.Base.prototype.get3DProvider = function() {
  return /** @type {!anychart.core.I3DProvider} */(this.chart);
};


/** @inheritDoc */
anychart.core.series.Base.prototype.getEnableChangeSignals = function() {
  return this.SUPPORTED_SIGNALS;
};


/**
 * Sets automatic bar width to the series.
 * @param {number} value
 */
anychart.core.series.Base.prototype.setAutoPointWidth = function(value) {
  this.autoSettings['pointWidth'] = String(value * 100) + '%';
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoColor = function(value) {
  this.autoSettings['color'] = value;
  this.normal_.markers().setAutoFill(this.getMarkerFill());
  this.normal_.markers().setAutoStroke(this.getMarkerStroke());
  this.normal_.outlierMarkers().setAutoFill(this.getOutliersFill());
  this.normal_.outlierMarkers().setAutoStroke(this.getOutliersStroke());
};


/**
 * Works for autopositioning by a plot, if external value is set - it is not overwritten.
 * @param {number} position .
 */
anychart.core.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoSettings['xPointPosition'] = position;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoSettings['type'] = value;
  this.normal_.markers().setAutoType(value);
  if (this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED))
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS);
};


/**
 * @param {number} min .
 * @param {number} max .
 * @param {number|string} minSize
 * @param {number|string} maxSize
 */
anychart.core.series.Base.prototype.setAutoSizeScale = function(min, max, minSize, maxSize) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
  this.minimumSizeSetting_ = minSize;
  this.maximumSizeSetting_ = maxSize;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoHatchFill = function(value) {
  // auto hatch fill doesn't use autoSettings, because it should not be a default for hatchFill() value
  this.autoHatchFill = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.Base|anychart.core.utils.Padding)} .
 */
anychart.core.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.axesLinesSpace_.set(0);
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
 * Get whisker width in px.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state.
 * @return {number} Whisker width pixel value.
 */
anychart.core.series.Base.prototype.getWhiskerWidth = function(point, pointState) {
  var names = ['whiskerWidth', 'hoverWhiskerWidth', 'selectWhiskerWidth'];

  var stateObject;
  var pointStateName;
  if (pointState == 2) {
    stateObject = this.selected_;
    pointStateName = 'selected';
  } else if (pointState == 1) {
    stateObject = this.hovered_;
    pointStateName = 'hovered';
  } else {
    stateObject = this.normal_;
    pointStateName = 'normal';
  }
  var result;
  var pointStateObject = point.get(pointStateName);
  result = anychart.utils.getFirstDefinedValue(
      goog.isDef(pointStateObject) ? pointStateObject[names[0]] : void 0,
      point.get(names[pointState]),
      stateObject.getOption(names[0]));
  if (!goog.isDefAndNotNull(result))
    result = this.normal_.getOption(names[0]);

  return anychart.utils.normalizeSize(/** @type {(number|string)} */(result), this.pointWidthCache);
};


/**
 * Returns category width in pixels according to current X scale settings.
 * @param {number=} opt_categoryIndex Category index (for series based on ordinal scale with weights).
 * @return {number} Category width in pixels.
 */
anychart.core.series.Base.prototype.getCategoryWidth = goog.abstractMethod;


/**
 * Calculates size scale for the series if needed and compares with minMax members.
 * @param {Array.<number>} minMax Array of two values: [min, max].
 */
anychart.core.series.Base.prototype.calculateSizeScale = function(minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.selfMinimumBubbleValue_ = Number.POSITIVE_INFINITY;
    this.selfMaximumBubbleValue_ = Number.NEGATIVE_INFINITY;

    var iter = this.getDetachedIterator();
    while (iter.advance()) {
      var size = Number(iter.get('size'));
      if (!isNaN(size) && (size >= 0 || this.getOption('displayNegative'))) {
        size = Math.abs(size);
        if (size > this.selfMaximumBubbleValue_)
          this.selfMaximumBubbleValue_ = size;
        if (size < this.selfMinimumBubbleValue_)
          this.selfMinimumBubbleValue_ = size;
      }
    }
  }
  minMax[0] = Math.min(minMax[0], this.selfMinimumBubbleValue_);
  minMax[1] = Math.max(minMax[1], this.selfMaximumBubbleValue_);
};


/**
 * Calculates bubble pixel size.
 * @param {number} size Size value from data.
 * @return {number|undefined} Pixel size of bubble.
 * @protected
 */
anychart.core.series.Base.prototype.calculateSize = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) / (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  if (isNaN(ratio) || !isFinite(ratio))
    ratio = 0.5;
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size);
};


/**
 * @return {string}
 */
anychart.core.series.Base.prototype.getScalesPairIdentifier = function() {
  return goog.getUid(this.getXScale()) + '_' + goog.getUid(this.yScale());
};


/**
 * Returns Y names that the series currently uses.
 * @return {Array.<string>}
 */
anychart.core.series.Base.prototype.getYValueNames = function() {
  return (/** @type {?Array.<string>} */(this.renderingSettings_.getOption('yValues')));
};


/**
 * Returns series root layer (used in animations).
 * @return {acgraph.vector.ILayer}
 */
anychart.core.series.Base.prototype.getRootLayer = function() {
  return this.rootLayer;
};


/**
 * Returns separate chart. LEGACY.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.series.Base.prototype.getChart = function() {
  return /** @type {anychart.core.SeparateChart} */(this.chart);
};


/**
 * Gets wrapped point by index.
 * @param {number} index Point index.
 * @return {anychart.core.Point} Wrapped point.
 */
anychart.core.series.Base.prototype.getPoint = goog.abstractMethod;


//endregion
//region --- Working with data
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns NEW DETACHED data iterator. Advancing this iterator doesn't influence series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getDetachedIterator = goog.abstractMethod;


/**
 * Returns ATTACHED data iterator. Advancing this iterator also advances series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getIterator = function() {
  return this.iterator || this.getResetIterator();
};


/**
 * Returns reset ATTACHED data iterator. Advancing this iterator also advances series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getResetIterator = function() {
  return this.iterator = this.getDetachedIterator();
};


//endregion
//region --- Working with scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with scales
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {anychart.scales.IXScale}
 */
anychart.core.series.Base.prototype.getXScale = function() {
  return /** @type {anychart.scales.IXScale} */(this.chart.xScale());
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.core.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value) {
      var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null,
          anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this);
      if (val) {
        var dispatch = this.yScale_ == val;
        this.yScale_ = /** @type {anychart.scales.Base} */(val);
        this.yScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch)
          this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
              anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
      }
    } else if (this.yScale_) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated, this);
      this.yScale_ = null;
      this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_ || this.plot.yScale();
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.series.Base.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS, signal);
  } else {
    this.dispatchSignal(signal);
  }
};


//endregion
//region --- Different public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Different public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Transforms x to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.series.Base.prototype.transformX = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(this.getXScale().transform(value, opt_subRangeRatio), true);
};


/**
 * Transforms y to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.series.Base.prototype.transformY = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(
      (/** @type {anychart.scales.Base} */(this.yScale())).transform(value, opt_subRangeRatio),
      false);
};


/**
 * Series rendering settings getter/setter.
 * @param {(Object|Function|string)=} opt_value
 * @return {anychart.core.series.Base|anychart.core.series.RenderingSettings}
 */
anychart.core.series.Base.prototype.rendering = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.renderingSettings_.setup(opt_value);
    return this;
  }
  return this.renderingSettings_;
};


//endregion
//region --- Errors
//----------------------------------------------------------------------------------------------------------------------
//
//  Errors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/Setter for an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error.
 * @return {(anychart.core.utils.Error|anychart.core.series.Base)} Series error or self for chaining.
 */
anychart.core.series.Base.prototype.error = function(opt_value) {
  if (!this.supportsError())
    anychart.core.reporting.warning(anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR, undefined, [this.seriesType()]);
  if (!this.error_) {
    this.error_ = new anychart.core.utils.Error(this);
    this.error_.listenSignals(this.onErrorSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.error_.setup(opt_value);
    return this;
  }

  return this.error_;
};


/**
 * Listener for error invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.onErrorSignal_ = function(event) {
  var state = anychart.ConsistencyState.SERIES_POINTS;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.series.Base.prototype.resetErrorPaths = function() {
  if (!this.errorPathsPool_)
    this.errorPathsPool_ = [];
  if (this.errorPaths_) {
    while (this.errorPaths_.length) {
      var path = this.errorPaths_.pop();
      path.clear();
      path.parent(null);
      this.errorPathsPool_.push(path);
    }
  } else
    this.errorPaths_ = [];
};


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 */
anychart.core.series.Base.prototype.getErrorPath = function(stroke) {
  var index = this.getIterator().getIndex();
  var path = this.errorPathsPool_.length ?
      /** @type {!acgraph.vector.Path} */(this.errorPathsPool_.pop()) :
      /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.shapeManagers.ERROR_SHAPES_ZINDEX));

  this.rootLayer.addChild(path);
  this.shapeManager.setupInteractivity(path, this.supportsInteractivity(), index);
  path.stroke(stroke);
  path.fill(null);
  this.errorPaths_.push(path);
  return path;
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number>} Array of lower and upper errors value.
 */
anychart.core.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Returns proper error stroke in current point.
 * @param {boolean} horizontal
 * @return {acgraph.vector.Stroke}
 */
anychart.core.series.Base.prototype.getErrorStroke = function(horizontal) {
  var color = /** @type {acgraph.vector.Stroke|Function} */(horizontal ? this.error().xErrorStroke() : this.error().valueErrorStroke());
  var context;
  if (goog.isFunction(color)) {
    context = this.getColorResolutionContext();
    color = acgraph.vector.normalizeStroke(color.call(context, context));
  }
  var pointColor;
  if (this.supportsPointSettings()) {
    pointColor = this.getPointOption(horizontal ? 'xErrorStroke' : 'valueErrorStroke');
    if (goog.isFunction(pointColor)) {
      context = this.getColorResolutionContext(/** @type {acgraph.vector.Stroke|undefined} */(color));
      pointColor = acgraph.vector.normalizeStroke(pointColor.call(context, context));
    } else if (pointColor) {
      pointColor = acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(pointColor));
    }
  }
  return /** @type {acgraph.vector.Stroke} */(pointColor || color);
};


/**
 * Draws an error.
 * @param {anychart.data.IRowInfo} point
 */
anychart.core.series.Base.prototype.drawError = function(point) {
  if (!point.meta('missing') && this.error().hasAnyErrorValues()) {
    var error = this.error();
    var errorMode = error.mode();
    var isVertical = /** @type {boolean} */(this.getOption('isVertical'));

    switch (errorMode) {
      case anychart.enums.ErrorMode.NONE:
        break;
      case anychart.enums.ErrorMode.X:
        error.draw(true, isVertical);
        break;
      case anychart.enums.ErrorMode.VALUE:
        error.draw(false, isVertical);
        break;
      case anychart.enums.ErrorMode.BOTH:
        error.draw(true, isVertical);
        error.draw(false, isVertical);
        break;
    }
  }
};


//endregion
//region --- Working with clip
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with clip
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Clipping settings
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart
 *    Enable/disable series clip.
 * @return {anychart.core.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SERIES_CLIP, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.clip_;
  }
};


//endregion
//region --- Working with legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with legend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.series.Base)} Legend item settings or self for chaining.
 */
anychart.core.series.Base.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.legendItem_.listenSignals(this.onLegendItemSignal, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @protected
 */
anychart.core.series.Base.prototype.onLegendItemSignal = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


/**
 * Creates legend item data.
 * @param {Function|string} itemsFormat Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Color for legend item.
 */
anychart.core.series.Base.prototype.getLegendItemData = function(itemsFormat) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();

  var json = legendItem.getJSON();
  var baseColor = this.getOption('color');
  var context = this.createLegendContextProvider();

  var formatter = json['text'] || itemsFormat;
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
  json['text'] = goog.isFunction(formatter) ?
      formatter.call(context, context) :
      this.getLegendItemText(context);

  json['disabled'] = 'disabled' in json ? !!json['disabled'] : !this.enabled();
  json['meta'] = /** @type {Object} */ (this.meta());
  if (json['iconType'] == anychart.enums.LegendItemIconType.MARKER && !this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED)) {
    json['iconFill'] = this.normal_.markers().fill();
    json['iconStroke'] = this.normal_.markers().stroke();
  }
  json['iconType'] = this.getLegendIconType(json['iconType'], context);
  json['iconEnabled'] = 'iconEnabled' in json ? !!json['iconEnabled'] : true;
  json['iconStroke'] = this.getLegendIconColor(
      json['iconStroke'],
      anychart.enums.ColorType.STROKE,
      baseColor,
      context);
  json['iconFill'] = this.getLegendIconColor(
      json['iconFill'],
      anychart.enums.ColorType.FILL,
      baseColor,
      context);
  json['iconHatchFill'] = this.getLegendIconColor(
      json['iconHatchFill'],
      anychart.enums.ColorType.HATCH_FILL,
      this.getAutoHatchFill(),
      context);

  if (this.supportsMarkers() && this.normal_.markers().enabled()) {
    json['iconMarkerType'] = json['iconMarkerType'] || this.normal_.markers().type();
    json['iconMarkerFill'] = json['iconMarkerFill'] || this.normal_.markers().fill();
    json['iconMarkerStroke'] = json['iconMarkerStroke'] || this.normal_.markers().stroke();
  } else {
    json['iconMarkerType'] = null;
    json['iconMarkerFill'] = null;
    json['iconMarkerStroke'] = null;
  }
  return /** @type {anychart.core.ui.Legend.LegendItemProvider} */(json);
};


/**
 * Gets legend icon type for the series.
 * @param {*} type
 * @param {Object} context
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.series.Base.prototype.getLegendIconType = function(type, context) {
  if (type == anychart.enums.LegendItemIconType.MARKER) {
    if (this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED)) {
      type = this.getOption('type');
    } else if (this.supportsMarkers()) {
      type = this.normal_.markers().type();
    } else {
      type = anychart.enums.LegendItemIconType.SQUARE;
    }
    if (type == anychart.enums.LegendItemIconType.LINE)
      type = anychart.enums.LegendItemIconType.V_LINE;
  } else if (!goog.isFunction(type)) {
    type = anychart.enums.normalizeLegendItemIconType(type);
  }
  return /** @type {anychart.enums.LegendItemIconType} */ (type);
};


/**
 * Returns default legendItem color.
 * @param {*} legendItemJson
 * @param {anychart.enums.ColorType} colorType
 * @param {*} baseColor
 * @param {Object} context
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 */
anychart.core.series.Base.prototype.getLegendIconColor = function(legendItemJson, colorType, baseColor, context) {
  if (legendItemJson) {
    if (goog.isFunction(legendItemJson)) {
      var ctx = {
        'sourceColor': baseColor
      };
      legendItemJson = legendItemJson.call(ctx, ctx);
    } else {
      legendItemJson = anychart.color.serialize(
          /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(legendItemJson));
    }
  } else {
    var name;
    if (colorType == anychart.enums.ColorType.STROKE) {
      name = 'stroke';
    } else if (colorType == anychart.enums.ColorType.HATCH_FILL) {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL))
        return null;
      name = 'hatchFill';
    } else {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL)) {
        name = 'stroke';
        colorType = anychart.enums.ColorType.STROKE;
      } else {
        name = 'fill';
      }
    }
    var resolver = anychart.color.getColorResolver(name, colorType, false);
    legendItemJson = resolver(this, anychart.PointState.NORMAL, true);
  }
  return legendItemJson;
};


/**
 * Returns default legend item text.
 * @param {Object} context
 * @return {string}
 */
anychart.core.series.Base.prototype.getLegendItemText = function(context) {
  return /** @type {string} */(this.name());
};


//endregion
//region --- Working with tooltip
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with tooltip
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter and setter for the tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.series.Base|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltipInternal) {
    this.tooltipInternal = new anychart.core.ui.Tooltip(0);
    if (this.chart.supportsTooltip()) {
      var chart = /** @type {anychart.core.Chart} */ (this.chart);
      var parent = /** @type {anychart.core.ui.Tooltip} */ (chart.tooltip());
      this.tooltipInternal.parent(parent);
      this.tooltipInternal.chart(chart);
    }
  }
  if (goog.isDef(opt_value)) {
    this.tooltipInternal.setup(opt_value);
    return this;
  } else {
    return this.tooltipInternal;
  }
};


//endregion
//region --- Color resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Color resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor
 * @param {boolean=} opt_ignorePointSettings Whether should take detached iterator.
 * @param {boolean=} opt_ignoreColorScale Whether should use color scale.
 * @return {Object}
 */
anychart.core.series.Base.prototype.getColorResolutionContext = goog.abstractMethod;


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @param {boolean=} opt_ignorePointSettings Whether should take detached iterator.
 * @return {Object}
 */
anychart.core.series.Base.prototype.getHatchFillResolutionContext = goog.abstractMethod;


//endregion
//region --- Settings resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Settings resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.series.Base}
 */
anychart.core.series.Base.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.series.Base}
 */
anychart.core.series.Base.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.series.Base}
 */
anychart.core.series.Base.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Returns settings resolver function.
 * @param {string} name Name of normal settings.
 * @param {Function} normalizer Normalizer function. Will be called only if the settings piece has come from the point.
 * @param {boolean} canBeHoveredSelected Whether need to resolve hovered selected colors.
 * @param {string=} opt_seriesName Normal settings names.
 * @return {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
 */
anychart.core.series.Base.getSettingsResolver = function(name, normalizer, canBeHoveredSelected, opt_seriesName) {
  if (!name) return anychart.core.series.Base.getUndefined_;
  var hash = goog.getUid(normalizer) + '|' + name + '|' + canBeHoveredSelected + (opt_seriesName ? '|' + opt_seriesName : '');
  opt_seriesName = opt_seriesName || name;
  var result = anychart.core.series.Base.settingsResolversCache_[hash];
  if (!result) {
    anychart.core.series.Base.settingsResolversCache_[hash] = result = function(series, point, state) {
      state = anychart.core.utils.InteractivityState.clarifyState(state);
      var val;
      if (state != anychart.PointState.NORMAL && canBeHoveredSelected) {
        val = series.resolveOption(name, state, point, normalizer, false, opt_seriesName);
        if (goog.isDef(val))
          return val;
      }
      return series.resolveOption(name, 0, point, normalizer, false, opt_seriesName);
    };
  }
  return result;
};


/**
 * Returns undefined.
 * @return {*}
 * @private
 */
anychart.core.series.Base.getUndefined_ = function() {
  return void 0;
};


/**
 * Returns an option value for the current point.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Base.prototype.getPointOption = function(name) {
  return this.supportsPointSettings() ?
      this.getIterator().get(name) :
      undefined;
};


/** @inheritDoc */
anychart.core.series.Base.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.series.Base.prototype.getOption = function(name) {
  var res = this.ownSettings[name];
  if (!goog.isDefAndNotNull(res)) {
    res = this.themeSettings[name];
    if (!goog.isDefAndNotNull(res)) {
      res = this.autoSettings[name];
    }
  }
  return res;
};


/**
 * Gets option like resolution chain.
 * TODO (A.Kudryavtsev): Remove this method on settings inheritance implementation.
 * @param {string} name - Option name.
 * @return {*}
 */
anychart.core.series.Base.prototype.getInheritedOption = function(name) {
  var result;
  if (goog.isDefAndNotNull(this.ownSettings[name])) {
    result = this.ownSettings[name];
  } else if (goog.isDefAndNotNull(/** @type {anychart.core.Base} */ (this.plot).ownSettings[name])) {
    result = /** @type {anychart.core.Base} */ (this.plot).ownSettings[name];
  } else if (goog.isDefAndNotNull(/** @type {anychart.core.Base} */ (this.chart).ownSettings[name])) {
    result = /** @type {anychart.core.Base} */ (this.chart).ownSettings[name];
  } else if (goog.isDefAndNotNull(this.themeSettings[name])) {
    result = this.themeSettings[name];
  } else if (goog.isDefAndNotNull(/** @type {anychart.core.Base} */ (this.plot).themeSettings[name])) {
    result = /** @type {anychart.core.Base} */ (this.plot).themeSettings[name];
  } else if (goog.isDefAndNotNull(/** @type {anychart.core.Base} */ (this.chart).themeSettings[name])) {
    result = /** @type {anychart.core.Base} */ (this.chart).themeSettings[name];
  } else {
    result = this.autoSettings[name];
  }
  return result;
};


/**
 * Returns proper settings due to the state if point settings are supported by the series.
 * @param {string} name
 * @param {number} state
 * @param {anychart.data.IRowInfo} point
 * @param {Function} normalizer
 * @param {boolean} scrollerSelected
 * @param {string=} opt_seriesName - series option name if differs from point names.
 * @param {boolean=} opt_ignorePointSettings
 * @return {*}
 */
anychart.core.series.Base.prototype.resolveOption = function(name, state, point, normalizer, scrollerSelected, opt_seriesName, opt_ignorePointSettings) {
  var val;
  var stateObject = state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_;
  if (opt_ignorePointSettings) {
    return normalizer(stateObject.getOption(name));
  }
  if (this.supportsPointSettings()) {
    var pointStateName = state == 0 ? 'normal' : state == 1 ? 'hovered' : 'selected';
    var pointStateObject = point.get(pointStateName);
    val = anychart.utils.getFirstDefinedValue(
        goog.isDef(pointStateObject) ? pointStateObject[name] : void 0,
        point.get(anychart.color.getPrefixedColorName(state, name)),
        stateObject.getOption(name));
  }
  if (goog.isDef(val)) {
    val = normalizer(val);
  } else {
    name = opt_seriesName || name;
    if (name in this.descriptorsMeta) {
      val = this.getOption(name);
      if (goog.isDef(val))
        return normalizer(val);
    }
    if (scrollerSelected)
      stateObject = this.selected_;
    val = stateObject.ownSettings[name];
    if (!goog.isDefAndNotNull(val)) {
      val = stateObject.themeSettings[name];
      if (!goog.isDefAndNotNull(val) && !state)
        val = this.autoSettings[name];
      if (goog.isDef(val))
        val = normalizer(val);
    }
  }
  return val;
};


//endregion
//region --- Factories optimization
//----------------------------------------------------------------------------------------------------------------------
//
//  Factories optimization
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns container for factory.
 * @return {acgraph.vector.ILayer}
 */
anychart.core.series.Base.prototype.getFactoryContainer = function() {
  return /** @type {acgraph.vector.ILayer} */(this.container());
};


/**
 * Prepares passed factory to be displayed. Returns true, if the factory SHOULD be drawn.
 * @param {anychart.core.ui.LabelsFactory|anychart.core.ui.MarkersFactory} factory
 * @param {boolean} stateFactoriesEnabled
 * @param {boolean} hasPointSettings
 * @param {anychart.core.series.Capabilities|number} isSupported
 * @param {anychart.ConsistencyState|number} consistency
 * @return {boolean}

 */
anychart.core.series.Base.prototype.prepareFactory = function(factory, stateFactoriesEnabled, hasPointSettings, isSupported, consistency) {
  factory.suspendSignalsDispatching();
  if (this.check(isSupported) && ((factory.enabled() !== false) || stateFactoriesEnabled || hasPointSettings)) {
    factory.container(this.getFactoryContainer());
    if (this.hasInvalidationState(consistency)) {
      factory.clear();
      factory.parentBounds(this.pixelBoundsCache);
      return true;
    }
  } else {
    factory.clear();
    factory.container(null);
  }
  factory.draw();
  factory.resumeSignalsDispatching(false);
  return false;
};


/**
 * Draws element(s) for point.
 * @param {Array.<function(this:anychart.core.StateSettings):(anychart.core.ui.LabelsFactory|anychart.core.ui.MarkersFactory)>} seriesFactoryGetters
 * @param {Array.<function(this:anychart.core.IChart):(anychart.core.ui.LabelsFactory|anychart.core.ui.MarkersFactory)>} chartFactoryGetters
 * @param {Array.<string>} overrideNames
 * @param {boolean} hasPointOverrides
 * @param {boolean} isLabel
 * @param {?Array.<number>} positionYs
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @param {boolean} callDraw
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.core.ui.LabelsFactory.Label|null}
 * @protected
 */
anychart.core.series.Base.prototype.drawFactoryElement = function(seriesFactoryGetters, chartFactoryGetters, overrideNames, hasPointOverrides, isLabel, positionYs, point, state, callDraw) {
  var isDraw, positionProvider, i, indexes;
  var index = point.getIndex();
  if (positionYs) {
    indexes = this.indexToMarkerIndexes_[index];
    if (!indexes)
      indexes = this.indexToMarkerIndexes_[index] = [];
  }
  var mainFactory = seriesFactoryGetters[0].call(this.normal_);
  var chartNormalFactory = chartFactoryGetters ? chartFactoryGetters[0].call(this.chart.normal_) : null;

  var pointOverride, statePointOverride, seriesStateFactory, chartStateFactory;
  if (point.meta('missing')) {
    isDraw = false;
    pointOverride = statePointOverride = undefined;
    seriesStateFactory = null;
    chartStateFactory = null;
  } else {
    state = anychart.core.utils.InteractivityState.clarifyState(state);
    var pointStateElement;
    if (this.supportsPointSettings() && hasPointOverrides) {
      pointStateElement = point.get('normal');
      pointStateElement = pointStateElement ? pointStateElement[overrideNames[0]] : void 0;
      pointOverride = anychart.utils.getFirstDefinedValue(pointStateElement, point.get(overrideNames[0]));
      if (state != anychart.PointState.NORMAL) {
        pointStateElement = (state == anychart.PointState.HOVER) ? point.get('hovered') : point.get('selected');
        pointStateElement = pointStateElement ? pointStateElement[overrideNames[0]] : void 0;
        statePointOverride = anychart.utils.getFirstDefinedValue(pointStateElement, point.get(overrideNames[state]));
      }
    } else {
      pointOverride = statePointOverride = undefined;
    }

    var pointOverrideEnabled = pointOverride && goog.isDef(pointOverride['enabled']) ? pointOverride['enabled'] : null;
    var statePointOverrideEnabled = statePointOverride && goog.isDef(statePointOverride['enabled']) ? statePointOverride['enabled'] : null;

    var stateObject = state == 0 ? this.normal_ : state == 1 ? this.hovered_ : this.selected_;
    var chartStateObject = state == 0 ? this.chart.normal_ : state == 1 ? this.chart.hovered_ : this.chart.selected_;
    seriesStateFactory = (state == anychart.PointState.NORMAL) ? null : seriesFactoryGetters[state].call(stateObject);
    chartStateFactory = (state == anychart.PointState.NORMAL || !chartFactoryGetters) ? null : chartFactoryGetters[state].call(chartStateObject);

    isDraw = goog.isNull(statePointOverrideEnabled) ? // has no state marker or null "enabled" in it ?
        (!seriesStateFactory || goog.isNull(seriesStateFactory.enabled()) || !goog.isDef(seriesStateFactory.enabled())) ? // has no state stateFactory or null "enabled" in it ?
            (!chartStateFactory || goog.isNull(chartStateFactory.enabled()) || !goog.isDef(chartStateFactory.enabled())) ? // has no state stateFactory or null "enabled" in it ?
                goog.isNull(pointOverrideEnabled) ? // has no marker in point or null "enabled" in it ?
                    goog.isNull(mainFactory.enabled()) || !goog.isDef(mainFactory.enabled()) ?
                        chartNormalFactory ? chartNormalFactory.enabled() :
                            null :
                        mainFactory.enabled() :
                    pointOverrideEnabled :
                chartStateFactory.enabled() :
            seriesStateFactory.enabled() :
        statePointOverrideEnabled;
  }

  if (isDraw) {
    var formatProvider = isLabel ? this.createLabelsContextProvider() : null;
    if (positionYs) {
      var x = point.meta('x');
      if (/** @type {boolean} */(this.getOption('isVertical'))) {
        for (i = 0; i < positionYs.length; i++) {
          positionProvider = {'value': {'x': positionYs[i], 'y': x}};
          indexes[i] = this.drawSingleFactoryElement(mainFactory, indexes[i], positionProvider, formatProvider,
              chartNormalFactory, seriesStateFactory, chartStateFactory, pointOverride, statePointOverride, callDraw).getIndex();
        }
      } else {
        for (i = 0; i < positionYs.length; i++) {
          positionProvider = {'value': {'x': x, 'y': positionYs[i]}};
          indexes[i] = this.drawSingleFactoryElement(mainFactory, indexes[i], positionProvider, formatProvider,
              chartNormalFactory, seriesStateFactory, chartStateFactory, pointOverride, statePointOverride, callDraw).getIndex();
        }
      }
    } else {
      var statePointOverridePos, seriesStateFactoryPos, chartStateFactoryPos, pointOverridePos, seriesNormalFactoryPos,
          chartNormalFactoryPos, seriesStateThemeFactoryPos, chartStateThemeFactoryPos, seriesNormalThemeFactoryPos,
          chartNormalThemeFactoryPos, position;
      if (isLabel) {
        statePointOverridePos = statePointOverride && goog.isDef(statePointOverride['position']) ? statePointOverride['position'] : void 0;
        seriesStateFactoryPos = seriesStateFactory && goog.isDef(seriesStateFactory.getOwnOption('position')) ? seriesStateFactory.getOwnOption('position') : void 0;
        chartStateFactoryPos = chartStateFactory && goog.isDef(chartStateFactory.getOwnOption('position')) ? chartStateFactory.getOwnOption('position') : void 0;
        pointOverridePos = pointOverride && goog.isDef(pointOverride['position']) ? pointOverride['position'] : void 0;
        seriesNormalFactoryPos = mainFactory && goog.isDef(mainFactory.getOwnOption('position')) ? mainFactory.getOwnOption('position') : void 0;
        chartNormalFactoryPos = chartNormalFactory && goog.isDef(chartNormalFactory.getOwnOption('position')) ? chartNormalFactory.getOwnOption('position') : void 0;
        seriesStateThemeFactoryPos = seriesStateFactory && goog.isDef(seriesStateFactory.getThemeOption('position')) ? seriesStateFactory.getThemeOption('position') : void 0;
        chartStateThemeFactoryPos = chartStateFactory && goog.isDef(chartStateFactory.getThemeOption('position')) ? chartStateFactory.getThemeOption('position') : void 0;
        seriesNormalThemeFactoryPos = mainFactory && goog.isDef(mainFactory.getThemeOption('position')) ? mainFactory.getThemeOption('position') : void 0;
        chartNormalThemeFactoryPos = chartNormalFactory && goog.isDef(chartNormalFactory.getThemeOption('position')) ? chartNormalFactory.getThemeOption('position') : void 0;

        position = anychart.utils.getFirstDefinedValue(
            statePointOverridePos,
            seriesStateFactoryPos,
            chartStateFactoryPos,
            pointOverridePos,
            seriesNormalFactoryPos,
            chartNormalFactoryPos,
            seriesStateThemeFactoryPos,
            chartStateThemeFactoryPos,
            seriesNormalThemeFactoryPos,
            chartNormalThemeFactoryPos,
            'auto');
      } else {
        statePointOverridePos = statePointOverride && goog.isDef(statePointOverride['position']) ? statePointOverride['position'] : void 0;
        seriesStateFactoryPos = seriesStateFactory && goog.isDef(seriesStateFactory['position']()) ? seriesStateFactory['position']() : void 0;
        chartStateFactoryPos = chartStateFactory && goog.isDef(chartStateFactory['position']()) ? chartStateFactory['position']() : void 0;
        pointOverridePos = pointOverride && goog.isDef(pointOverride['position']) ? pointOverride['position'] : void 0;
        seriesNormalFactoryPos = mainFactory && goog.isDef(mainFactory['position']()) ? mainFactory['position']() : void 0;

        position = anychart.utils.getFirstDefinedValue(
            statePointOverridePos,
            seriesStateFactoryPos,
            chartStateFactoryPos,
            pointOverridePos,
            seriesNormalFactoryPos,
            'auto');
      }

      positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position), true);
      return this.drawSingleFactoryElement(mainFactory, index, positionProvider, formatProvider,
          chartNormalFactory, seriesStateFactory, chartStateFactory, pointOverride, statePointOverride, callDraw, /** @type {string} */(position));
    }
  } else {
    if (positionYs) {
      for (i = 0; i < indexes.length; i++) {
        mainFactory.clear(indexes[i]);
      }
    } else {
      mainFactory.clear(index);
    }
  }
  return null;
};


/**
 * Returns the angle of positive (or negative) direction vector. Result is in degrees, zero is to the right, grows clockwise.
 * @param {boolean} positive
 * @return {number}
 */
anychart.core.series.Base.prototype.getDirectionAngle = function(positive) {
  var isVertical = /** @type {boolean} */ (this.getOption('isVertical'));
  if (this.yScale().inverted())
    positive = !positive;
  return isVertical ?
      (positive ? 0 : 180) :
      (positive ? 270 : 90);
};


/**
 * Returns if the direction should be positive for passed position.
 * @param {string} position
 * @return {boolean}
 */
anychart.core.series.Base.prototype.checkDirectionIsPositive = function(position) {
  var result;
  if (position == 'low' || position == 'lowest')
    result = false;
  else if (position == 'high' || position == 'highest')
    result = true;
  else
    result = (Number(this.getIterator().get(position)) || 0) >= 0;
  return result;
};


/**
 * Resolves auto anchor for fixed geometrical position.
 * @param {anychart.enums.Position} position
 * @return {anychart.enums.Anchor}
 */
anychart.core.series.Base.prototype.resolveAutoAnchorForPosition = function(position) {
  return anychart.utils.flipAnchor(position);
};


/**
 * Resolves anchor in auto mode.
 * @param {?anychart.enums.Position|string} position Position.
 * @param {number} rotation Label rotation angle.
 * @return {anychart.enums.Anchor}
 */
anychart.core.series.Base.prototype.resolveAutoAnchor = function(position, rotation) {
  var normalizedPosition = anychart.enums.normalizePosition(position, null);
  var result;
  if (normalizedPosition) {
    result = this.resolveAutoAnchorForPosition(normalizedPosition);
  } else {
    var positive = this.checkDirectionIsPositive(/** @type {string} */(position));
    var angle = this.getDirectionAngle(positive);
    result = anychart.utils.getAnchorForAngle(angle);
  }
  return anychart.utils.rotateAnchor(result, rotation);
};


/**
 * Checks if label bounds intersect series bounds and flips autoAnchor if needed.
 * @param {anychart.core.ui.LabelsFactory} factory
 * @param {anychart.core.ui.LabelsFactory.Label} label
 */
anychart.core.series.Base.prototype.checkBoundsCollision = function(factory, label) {
  var bounds = anychart.math.Rect.fromCoordinateBox(factory.measureWithTransform(label, undefined, {'anchor': label.autoAnchor()}));
  var anchor = /** @type {anychart.enums.Anchor} */(label.autoAnchor());
  var rotation = /** @type {number} */(label.getFinalSettings('rotation'));
  anchor = anychart.utils.rotateAnchor(anchor, -rotation);
  if (anychart.utils.isRightAnchor(anchor) && bounds.left < this.pixelBoundsCache.left ||
      anychart.utils.isLeftAnchor(anchor) && (bounds.left + bounds.width > this.pixelBoundsCache.left + this.pixelBoundsCache.width)) {
    anchor = anychart.utils.flipAnchorHorizontal(anchor);
  }
  if (anychart.utils.isBottomAnchor(anchor) && bounds.top < this.pixelBoundsCache.top ||
      anychart.utils.isTopAnchor(anchor) && (bounds.top + bounds.height > this.pixelBoundsCache.top + this.pixelBoundsCache.height)) {
    anchor = anychart.utils.flipAnchorVertical(anchor);
  }
  anchor = anychart.utils.rotateAnchor(anchor, rotation);
  label.autoAnchor(anchor);
};


/**
 * Setups label drawing plan.
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {anychart.core.ui.LabelsFactory} chartNormalFactory
 * @param {anychart.core.ui.LabelsFactory} seriesNormalFactory
 * @param {anychart.core.ui.LabelsFactory} chartStateFactory
 * @param {anychart.core.ui.LabelsFactory} seriesStateFactory
 * @param {*} pointOverride
 * @param {*} statePointOverride
 */
anychart.core.series.Base.prototype.setupLabelDrawingPlan = function(label, chartNormalFactory, seriesNormalFactory, chartStateFactory, seriesStateFactory, pointOverride, statePointOverride) {
  label.state('pointState', goog.isObject(statePointOverride) ? statePointOverride : null);
  label.state('seriesState', seriesStateFactory);
  label.state('chartState', chartStateFactory);
  label.state('pointNormal', goog.isObject(pointOverride) ? pointOverride : null);
  label.state('seriesNormal', seriesNormalFactory);
  label.state('chartNormal', chartNormalFactory);
  label.state('seriesStateTheme', seriesStateFactory ? seriesStateFactory.themeSettings : null);
  label.state('chartStateTheme', chartStateFactory ? chartStateFactory.themeSettings : null);
  label.state('auto', label.autoSettings);
  label.state('seriesNormalTheme', seriesNormalFactory.themeSettings);
  label.state('chartNormalTheme', chartNormalFactory ? chartNormalFactory.themeSettings : null);
};


/**
 * Draws one factory element.
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory} factory
 * @param {number|undefined} index
 * @param {*} positionProvider
 * @param {*} formatProvider
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory|null} chartNormalFactory
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory|null} seriesStateFactory
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory|null} chartStateFactory
 * @param {*} pointOverride
 * @param {*} statePointOverride
 * @param {boolean} callDraw
 * @param {(?anychart.enums.Position|string)=} opt_position Position which is needed to calculate label auto anchor.
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.core.ui.LabelsFactory.Label}
 * @protected
 */
anychart.core.series.Base.prototype.drawSingleFactoryElement = function(factory, index, positionProvider, formatProvider,
    chartNormalFactory, seriesStateFactory, chartStateFactory, pointOverride, statePointOverride, callDraw, opt_position) {
  var element = formatProvider ? factory.getLabel(/** @type {number} */(index)) : factory.getMarker(/** @type {number} */(index));
  if (element) {
    if (formatProvider)
      element.formatProvider(formatProvider);
    element.positionProvider(positionProvider);
  } else {
    if (formatProvider)
      element = factory.add(formatProvider, positionProvider, index);
    else
      element = factory.add(positionProvider, index);
  }
  element.resetSettings();
  if (formatProvider) {
    var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(element);
    this.setupLabelDrawingPlan(
        label,
        /** @type {anychart.core.ui.LabelsFactory} */(chartNormalFactory),
        /** @type {anychart.core.ui.LabelsFactory} */(factory),
        /** @type {anychart.core.ui.LabelsFactory} */(chartStateFactory),
        /** @type {anychart.core.ui.LabelsFactory} */(seriesStateFactory),
        pointOverride,
        statePointOverride);

    var anchor = label.getFinalSettings('anchor');
    label.autoVertical(/** @type {boolean} */ (this.getOption('isVertical')));
    if (goog.isDef(opt_position) && anchor == anychart.enums.Anchor.AUTO) {
      label.autoAnchor(this.resolveAutoAnchor(opt_position, Number(label.getFinalSettings('rotation')) || 0));
      this.checkBoundsCollision(/** @type {anychart.core.ui.LabelsFactory} */(factory), label);
    }
  } else {
    element.currentMarkersFactory(seriesStateFactory || factory);
    element.setSettings(/** @type {Object} */(pointOverride), /** @type {Object} */(statePointOverride));
  }

  if (callDraw)
    element.draw();
  return element;
};


//endregion
//region --- Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_OVERLAP);
  }
};


/**
 * Draws label for a point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state - normal, hover or select.
 * @param {boolean} pointStateChanged
 * @protected
 */
anychart.core.series.Base.prototype.drawLabel = function(point, pointState, pointStateChanged) {
  point.meta('label', this.drawFactoryElement(
      [this.normal_.labels, this.hovered_.labels, this.selected_.labels],
      [this.getChart().normal().labels, this.getChart().hovered().labels, this.getChart().selected().labels],
      ['label', 'hoverLabel', 'selectLabel'],
      this.planHasPointLabels(),
      true,
      null,
      point,
      pointState,
      pointStateChanged));
};


/**
 * Additional labels initialization for HeatMap.
 */
anychart.core.series.Base.prototype.additionalLabelsInitialize = function() {
};


//endregion
//region --- Markers
//----------------------------------------------------------------------------------------------------------------------
//
//  Markers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
  }
};


/**
 * Draws marker for the point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean} pointStateChanged
 * @protected
 */
anychart.core.series.Base.prototype.drawMarker = function(point, pointState, pointStateChanged) {
  point.meta('marker', this.drawFactoryElement(
      [this.normal_.markers, this.hovered_.markers, this.selected_.markers],
      null,
      ['marker', 'hoverMarker', 'selectMarker'],
      this.planHasPointMarkers(),
      false,
      null,
      point,
      pointState,
      pointStateChanged));
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getMarkerFill = function() {
  var fillGetter = anychart.color.getColorResolver(
      this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL) ? 'stroke' : 'fill',
      anychart.enums.ColorType.FILL, false);
  var fill = /** @type {acgraph.vector.Fill} */(fillGetter(this, anychart.PointState.NORMAL, true, true));
  return /** @type {acgraph.vector.Fill} */(anychart.color.setOpacity(fill, 1, true));
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Stroke} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getMarkerStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(/** @type {acgraph.vector.Fill} */(this.normal_.markers().fill())));
};


//endregion
//region --- Outliers
//----------------------------------------------------------------------------------------------------------------------
//
//  Outliers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.outlierMarkersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Draws outliers markers for the point.
 * @param {anychart.data.IIterator} iterator
 * @param {anychart.PointState|number} pointState Point state.
 * @param {boolean} pointStateChanged
 * @protected
 */
anychart.core.series.Base.prototype.drawPointOutliers = function(iterator, pointState, pointStateChanged) {
  var outliers = iterator.meta('outliers');
  if (outliers && outliers.length)
    this.drawFactoryElement(
        [this.normal_.outlierMarkers, this.hovered_.outlierMarkers, this.selected_.outlierMarkers],
        null,
        ['outlierMarker', 'hoverOutlierMarker', 'selectOutlierMarker'],
        this.planHasPointOutliers(),
        false,
        /** @type {Array.<number>} */(outliers),
        iterator,
        pointState,
        pointStateChanged);
};


/**
 * Return outlier marker color for series.
 * @return {acgraph.vector.Fill} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getOutliersFill = function() {
  var fillGetter = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
  return /** @type {acgraph.vector.Fill} */(fillGetter(this, anychart.PointState.NORMAL, true));
};


/**
 * Return outlier marker color for series.
 * @return {acgraph.vector.Stroke} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getOutliersStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(
      /** @type {acgraph.vector.Stroke} */(this.normal().outlierMarkers().fill())));
};


/**
 * Find pointIndex by marker index.
 * @param {number} markerIndex
 * @return {number}
 * @protected
 */
anychart.core.series.Base.prototype.getPointIndexByOutlierIndex = function(markerIndex) {
  return +(goog.object.findKey(this.indexToMarkerIndexes_, function(val) {
    return goog.array.some(val, function(value) {
      return value == markerIndex;
    });
  }));
};


//endregion
//region --- Drawing plan related checkers
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing plan related checkers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Should return true if there is a point with a label defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointLabels = function() {
  return false;
};


/**
 * Should return true if there is a point with a marker defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointMarkers = function() {
  return false;
};


/**
 * Should return true if there is a point with an outlier defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointOutliers = function() {
  return false;
};


/**
 * Should return true if there is a point with an error defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointErrors = function() {
  return false;
};


/**
 * Should return true if the series is considered stacked.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planIsStacked = function() {
  return false;
};


/**
 * Should return true if the series X scale is inverted.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planIsXScaleInverted = function() {
  return false;
};


/**
 * Resets point shared field.
 * @param {?anychart.data.IRowInfo} point
 * @private
 */
anychart.core.series.Base.prototype.resetPointStack_ = function(point) {
  if (point) {
    var shared = point.meta('shared');
    if (shared) {
      shared.positiveAnchor = NaN;
      shared.negativeAnchor = NaN;
    }
  }
};


/**
 * Resets point's meta shared object anchors..
 */
anychart.core.series.Base.prototype.resetSharedStack = function() {
  if (this.planIsStacked() && this.isMinPointLengthBased()) {
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      this.resetPointStack_(iterator);
    }
    this.resetPointStack_(this.getPreFirstPoint());
    this.resetPointStack_(this.getPostLastPoint());
  }
};


//endregion
//region --- Drawing points
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing points
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Base.prototype.remove = function() {
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.shapeManager.setContainer(null);
  } else if (this.rootLayer) {
    this.rootLayer.remove();
  }

  // just a remove should be here, but the labelsFactory's remove() is very odd
  var labels = this.normal_.labels();
  if (labels.getDomElement()) {
    labels.getDomElement().remove();
    labels.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  var markers = this.normal_.markers();
  if (markers) {
    markers.remove();
    markers.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  var outlierMarkers = this.normal_.outlierMarkers();
  if (outlierMarkers) {
    outlierMarkers.remove();
    outlierMarkers.invalidate(anychart.ConsistencyState.CONTAINER);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for accessibility setting.
 * @param {(boolean|Object)=} opt_enabledOrJson - Whether to enable accessibility.
 * @return {anychart.core.utils.SeriesA11y|anychart.core.series.Base} - Accessibility settings object or self for chaining.
 */
anychart.core.series.Base.prototype.a11y = function(opt_enabledOrJson) {
  if (!this.a11y_) {
    this.a11y_ = new anychart.core.utils.SeriesA11y(this);
    this.registerDisposable(this.a11y_);
    this.a11y_.listenSignals(this.onA11ySignal_, this);
    if (anychart.utils.instanceOf(this.chart, anychart.core.Chart)) {
      this.a11y_.parentA11y(/** @type {anychart.core.utils.A11y} */ (/** @type {anychart.core.Chart} */ (this.chart).a11y()));
      this.a11y_.parentA11y().applyChangesInChildA11y();
    }
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.a11y_.setup.apply(this.a11y_, arguments);
    return this;
  } else {
    return this.a11y_;
  }
};


/**
 * Creates a11y text info.
 * @return {Object}
 */
anychart.core.series.Base.prototype.createA11yTextInfo = function() {
  return this.createTooltipContextProvider();
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.series.Base.prototype.onA11ySignal_ = function() {
  this.invalidate(anychart.ConsistencyState.A11Y, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draws the series.
 * @return {anychart.core.series.Base}
 */
anychart.core.series.Base.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  anychart.performance.start('Series draw()');
  this.suspendSignalsDispatching();

  // DVF-2334 - reapplying auto colors to elements to ensure color consistency
  // maybe we will be able to remove this in future refactorings
  if (goog.isDef(this.autoSettings['color']) &&
      this.hasInvalidationState(
          anychart.ConsistencyState.SERIES_MARKERS |
          anychart.ConsistencyState.SERIES_LABELS |
          anychart.ConsistencyState.SERIES_OUTLIERS)) {
    this.setAutoColor(this.autoSettings['color']);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_SHAPE_MANAGER)) {
    this.recreateShapeManager();
    this.markConsistent(anychart.ConsistencyState.SERIES_SHAPE_MANAGER);
  }

  // resolving bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = this.getPixelBounds();
    this.boundsWithoutAxes = this.axesLinesSpace_ ?
        this.axesLinesSpace_.tightenBounds(this.pixelBoundsCache) :
        this.pixelBoundsCache;
    var size = Math.min(this.pixelBoundsCache.height, this.pixelBoundsCache.width);
    this.minimumSizeValue_ = anychart.utils.normalizeSize(this.minimumSizeSetting_, size);
    this.maximumSizeValue_ = anychart.utils.normalizeSize(this.maximumSizeSetting_, size);
    this.invalidate(anychart.ConsistencyState.SERIES_CLIP |
        anychart.ConsistencyState.SERIES_POINTS |
        anychart.ConsistencyState.SERIES_COLOR);
  }

  // calculating pixel positions
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.getResetIterator();
    this.prepareData();
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS | anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.A11Y,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_UPDATE_A11Y);
    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS |
        anychart.ConsistencyState.SERIES_MARKERS |
        anychart.ConsistencyState.SERIES_ERROR |
        anychart.ConsistencyState.SERIES_OUTLIERS);
  }

  /** @type {Array.<Function>} */
  var elementsDrawers = [];
  var factoriesToFinalize = [];
  var factory, i, state, stateFactoriesEnabled;
  var labelsAreToBeRedrawn = false;
  var COMMON_STATES = anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.SERIES_POINTS;

  // preparing to draw different series parts
  if (this.hasInvalidationState(COMMON_STATES)) {
    this.prepareRootLayer();
    this.prepareAdditional();
    // we do not mark any states consistent here - we do it later.
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_LABELS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.LabelsFactory} */(this.normal_.labels());
    stateFactoriesEnabled = /** @type {boolean} */(this.hovered_.labels().enabled() || this.selected_.labels().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointLabels(),
            anychart.core.series.Capabilities.SUPPORTS_LABELS, anychart.ConsistencyState.SERIES_LABELS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + this.LABELS_ZINDEX + (this.planIsStacked() ? 1 : 0)));
      // see DVF-2259
      factory.invalidate(anychart.ConsistencyState.Z_INDEX);
      if (this.check(anychart.core.series.Capabilities.SUPPORTS_LABELS))
        elementsDrawers.push(this.drawLabel);
      factoriesToFinalize.push(factory);
      labelsAreToBeRedrawn = true;
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_MARKERS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.MarkersFactory} */(this.normal_.markers());
    stateFactoriesEnabled = /** @type {boolean} */(this.hovered_.markers().enabled() || this.selected_.markers().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointMarkers(),
            anychart.core.series.Capabilities.SUPPORTS_MARKERS, anychart.ConsistencyState.SERIES_MARKERS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + anychart.core.shapeManagers.MARKERS_ZINDEX + (this.planIsStacked() ? 1 : 0)));
      if (this.check(anychart.core.series.Capabilities.SUPPORTS_MARKERS))
        elementsDrawers.push(this.drawMarker);
      factoriesToFinalize.push(factory);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_ERROR | COMMON_STATES)) {
    this.resetErrorPaths();
    if (this.supportsError() &&
        (this.error().mode() != anychart.enums.ErrorMode.NONE) &&
        (this.planHasPointErrors() || this.error().hasGlobalErrorValues())) {
      elementsDrawers.push(this.drawError);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_ERROR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_OUTLIERS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.MarkersFactory} */(this.normal_.outlierMarkers());
    stateFactoriesEnabled = /** @type {boolean} */(this.hovered_.outlierMarkers().enabled() || this.selected_.outlierMarkers().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointOutliers(),
            anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS, anychart.ConsistencyState.SERIES_OUTLIERS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + anychart.core.shapeManagers.OUTLIERS_ZINDEX));
      if (this.check(anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS))
        elementsDrawers.push(this.drawPointOutliers);
      factoriesToFinalize.push(factory);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_OUTLIERS);
  }

  var elementsDrawersLength = elementsDrawers.length;

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS)) {
    anychart.performance.start('Series drawing points');
    var columns = this.retrieveDataColumns();
    var iterator;
    if (columns) {
      var yValueNames = this.getYValueNames();
      this.prepareMetaMakers(columns, yValueNames);
      if (labelsAreToBeRedrawn)
        this.additionalLabelsInitialize();
      this.startDrawing();

      iterator = this.getResetIterator();
      // currently this section is actual only for Stock, because
      // Cartesian processes preFirst point as a regular point in iterator
      var point = this.getPreFirstPoint();
      if (point) {
        this.makePointMeta(point, yValueNames, columns);
        this.drawPoint(point, this.getPointState(point.getIndex()));
      }

      // main points drawing cycle
      iterator.reset();
      while (iterator.advance()) {
        iterator.meta('destinationValue', NaN); //for animation-after-draw purposes.
        state = this.getPointState(iterator.getIndex());
        this.makePointMeta(iterator, yValueNames, columns);
        this.drawPoint(iterator, state);
        for (i = 0; i < elementsDrawersLength; i++)
          elementsDrawers[i].call(this, iterator, state, false);
      }

      // currently this section is actual only for Stock, because
      // Cartesian processes preFirst point as a regular point in iterator
      point = this.getPostLastPoint();
      if (point) {
        this.makePointMeta(point, yValueNames, columns);
        this.drawPoint(point, this.getPointState(point.getIndex()));
      }

      this.finalizeDrawing();
    } else {
      iterator = this.getResetIterator();
      while (iterator.advance()) {
        this.makeMissing(iterator, this.getYValueNames(), NaN);
      }
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.Z_INDEX);

    if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
      this.invalidate(anychart.ConsistencyState.SERIES_CLIP);
    }
    anychart.performance.end('Series drawing points');
  } else if (elementsDrawersLength) {
    if (labelsAreToBeRedrawn)
      this.additionalLabelsInitialize();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      state = this.getPointState(iterator.getIndex());
      for (i = 0; i < elementsDrawersLength; i++)
        elementsDrawers[i].call(this, iterator, state, false);
    }
  }

  for (i = 0; i < factoriesToFinalize.length; i++) {
    factory = factoriesToFinalize[i];
    factory.draw();
    factory.resumeSignalsDispatching(false);
  }
  // no other elements depend on CONTAINER or SERIES_POINTS
  this.markConsistent(COMMON_STATES);

  // if the series had only color settings changed, than we get here
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_COLOR)) {
    this.updateColors();
    this.markConsistent(anychart.ConsistencyState.SERIES_COLOR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.applyZIndex();
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CLIP)) {
    this.applyClip();
    this.markConsistent(anychart.ConsistencyState.SERIES_CLIP);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.A11Y)) {
    this.a11y().applyA11y();
    this.markConsistent(anychart.ConsistencyState.A11Y);
  }

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  this.resumeSignalsDispatching(false);

  anychart.performance.end('Series draw()');

  return this;
};


/**
 * Starts drawing.
 * @protected
 */
anychart.core.series.Base.prototype.startDrawing = function() {
  this.drawer.startDrawing(this.shapeManager);
};


/**
 * Draws point.
 * @param {anychart.data.IRowInfo} point
 * @param {number|anychart.PointState} state
 * @protected
 */
anychart.core.series.Base.prototype.drawPoint = function(point, state) {
  this.drawer.drawPoint(point, state);
};


/**
 * Finalizes drawing.
 * @protected
 */
anychart.core.series.Base.prototype.finalizeDrawing = function() {
  this.drawer.finalizeDrawing();
};


/**
 * Prepares root layer(s) and shapeManager(s) to be drawn.
 * @protected
 */
anychart.core.series.Base.prototype.prepareRootLayer = function() {
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.rootLayer = this.container();
  } else {
    if (!this.rootLayer) {
      this.rootLayer = acgraph.layer();
      if (this.canBeInteractive)
        this.bindHandlersToGraphics(this.rootLayer);
    }
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  }
  // we should clear shape manager before changing container, because it would cause a big overhead in that case.
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS))
    this.shapeManager.clearShapes();

  this.shapeManager.setContainer(this.rootLayer);
};


/**
 * Prepares additional properties.
 * @protected
 */
anychart.core.series.Base.prototype.prepareAdditional = function() {
  this.categoryWidthCache = this.getCategoryWidth();
  this.pointWidthCache = this.getPixelPointWidth();
};


/**
 * Applies ZIndex to the series.
 */
anychart.core.series.Base.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.drawer.updateZIndex(zIndex);
  } else {
    this.rootLayer.zIndex(zIndex);
  }
};


/**
 * Returns full clip bounds for current clip settings.
 * @return {!anychart.math.Rect}
 */
anychart.core.series.Base.prototype.calcFullClipBounds = function() {
  var clip = this.clip_;
  if (goog.isBoolean(clip)) {
    clip = this.boundsWithoutAxes;
    if (this.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
      clip = (/** @type {anychart.math.Rect} */(clip)).clone();
      var provider = this.get3DProvider();
      var yShift = provider.getY3DFullShift();
      clip.top -= yShift;
      clip.height += yShift;
      clip.width += provider.getX3DFullShift();
    }
  }
  return /** @type {!anychart.math.Rect} */(clip);
};


/**
 * Makes proper clipping.
 * @param {anychart.math.Rect=} opt_customClip Custom temporary clip to apply.
 */
anychart.core.series.Base.prototype.applyClip = function(opt_customClip) {
  var clip = opt_customClip || this.clip_;
  if (goog.isBoolean(clip)) {
    if (clip) {
      clip = this.calcFullClipBounds();
    } else {
      clip = null;
    }
  }
  var clipElement;
  if (clip) {
    if (!this.clipElement_)
      this.clipElement_ = acgraph.clip();
    this.clipElement_.shape(clip);
    clipElement = this.clipElement_;
  } else {
    clipElement = null;
  }
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.shapeManager.applyClip(clipElement);
  } else {
    this.rootLayer.clip(clipElement);
  }
  if (this.supportsLabels()) {
    var labelDOM = this.normal_.labels().getDomElement();
    if (labelDOM) labelDOM.clip(clipElement);
  }
  if (this.supportsMarkers()) {
    var markerDOM = this.normal_.markers().getDomElement();
    if (markerDOM) markerDOM.clip(clipElement);
  }
  if (this.supportsOutliers()) {
    markerDOM = this.normal_.outlierMarkers().getDomElement();
    if (markerDOM) markerDOM.clip(clipElement);
  }
};


/**
 * Separately updates color settings on shapes.
 * @protected
 */
anychart.core.series.Base.prototype.updateColors = function() {
  if (anychart.utils.instanceOf(this.shapeManager, anychart.core.shapeManagers.PerPoint)) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.shapeManager.updateColors(this.getPointState(iterator.getIndex()),
          /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
    }
  } else {
    this.shapeManager.updateColors(this.getSeriesState());
  }
};


//endregion
//region --- Extracting data
//----------------------------------------------------------------------------------------------------------------------
//
//  Extracting data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * This function is supposed to react on data changes.
 */
anychart.core.series.Base.prototype.prepareData = function() {
};


/**
 * Retrieves an array of column indexes matching asked column names from the current mapping.
 * @return {?Array.<(number|string)>}
 * @protected
 */
anychart.core.series.Base.prototype.retrieveDataColumns = function() {
  return this.getYValueNames();
};


/**
 * Returns point state by it's index.
 * @param {number} index
 * @return {anychart.PointState|number}
 */
anychart.core.series.Base.prototype.getPointState = function(index) {
  return anychart.PointState.NORMAL;
};


/**
 * Returns series state.
 * @return {anychart.PointState|number}
 */
anychart.core.series.Base.prototype.getSeriesState = function() {
  return anychart.PointState.NORMAL;
};


/**
 * Returns if the point is in visible subset (due to zoom).
 * @param {anychart.data.IRowInfo} point
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isPointVisible = function(point) {
  return true;
};


/**
 * Should return pre-first point if it exists.
 * @return {?anychart.data.IRowInfo}
 * @protected
 */
anychart.core.series.Base.prototype.getPreFirstPoint = function() {
  return null;
};


/**
 * Should return post-last point if it exists.
 * @return {?anychart.data.IRowInfo}
 * @protected
 */
anychart.core.series.Base.prototype.getPostLastPoint = function() {
  return null;
};


//endregion
//region --- Data to Pixels transformation
//----------------------------------------------------------------------------------------------------------------------
//
//  Data to Pixels transformation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio
 * @param {boolean} xDirection
 * @return {number}
 * @protected
 */
anychart.core.series.Base.prototype.applyRatioToBounds = function(ratio, xDirection) {
  var min, range;
  if (!!(xDirection ^ /** @type {boolean} */(this.getOption('isVertical')))) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return min + ratio * range;
};


/**
 * Transforms a single X ratio and an array of Y ratios to an array of coord pairs.
 * @param {number} x
 * @param {Array.<number>} ys
 * @return {Array.<number>}
 */
anychart.core.series.Base.prototype.ratiosToPixelPairs = function(x, ys) {
  var result = [];
  var xPix = this.applyRatioToBounds(x, true);
  for (var i = 0; i < ys.length; i++) {
    result.push(xPix, this.applyRatioToBounds(ys[i], false));
  }
  return result;
};


/**
 * Applies axes lines info to passed pixel value.
 * @param {number} value
 * @return {number}
 */
anychart.core.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var max, min;
  if (/** @type {boolean} */(this.getOption('isVertical'))) {
    min = this.boundsWithoutAxes.left;
    max = min + this.boundsWithoutAxes.width;
  } else {
    min = this.boundsWithoutAxes.top;
    max = min + this.boundsWithoutAxes.height;
  }
  return goog.math.clamp(value, min, max);
};


/**
 * If the series should consider the meta empty in makePointMeta.
 * @return {boolean}
 * @protected
 */
anychart.core.series.Base.prototype.considerMetaEmpty = function() {
  return false;
};


/**
 * Makes passed row missing.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {number} xRatio
 * @protected
 */
anychart.core.series.Base.prototype.makeMissing = function(rowInfo, yNames, xRatio) {
  var xPix = this.applyRatioToBounds(xRatio, true);
  rowInfo.meta('x', xPix);
  for (var i = 0; i < yNames.length; i++) {
    rowInfo.meta(yNames[i], undefined);
    rowInfo.meta(yNames[i] + 'X', xPix);
  }
};


/**
 * Populates rowInfo meta with points pixel positions.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Object.<string, number>} map
 * @param {number} xRatio
 */
anychart.core.series.Base.prototype.makePointsMetaFromMap = function(rowInfo, map, xRatio) {
  var names = [];
  var ys = [];
  for (var i in map) {
    names.push(i);
    ys.push(map[i]);
  }
  var points = this.ratiosToPixelPairs(xRatio, ys);
  for (var j = 0; j < names.length; j++) {
    rowInfo.meta(names[j] + 'X', points[j * 2]);
    rowInfo.meta(names[j], points[j * 2 + 1]);
  }
  rowInfo.meta('x', points[0]);
};


/**
 * Applies min point length settings for stacked plan.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeMinPointLengthStackedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  if (!rowInfo.meta('missing')) {
    var shared = rowInfo.meta('shared');

    var y = /** @type {number} */ (rowInfo.meta('value'));
    var zero = /** @type {number} */ (rowInfo.meta('zero'));
    var rawVal = rowInfo.get('value');
    var val = Number(rowInfo.get('value'));
    //Condition below also fixes XML restoration.
    var isZero = goog.isNull(rawVal) ? false : (!isNaN(val) && val == 0); //Draw zero to positive side. Considers closure compiler obfuscation.
    var diff = Math.abs(y - zero);
    var height = Math.max(diff, this.minPointLengthCache_);

    var newZero, newY;
    var positive = zero >= y;
    if (isZero) {
      var isVertical = /** @type {boolean} */ (this.getOption('isVertical'));
      var inverted = this.yScale().inverted();
      positive = !(isVertical ^ inverted);
    }

    if (positive) {
      height = -height;
      if (isNaN(shared.positiveAnchor)) {//Drawing first point.
        shared.positiveAnchor = zero + height;
        newZero = zero;
        newY = shared.positiveAnchor;
      } else {
        newZero = Math.min(zero, shared.positiveAnchor);
        newY = newZero + height;
        shared.positiveAnchor = newY;
      }
    } else {
      if (isNaN(shared.negativeAnchor)) {//Drawing first point.
        shared.negativeAnchor = zero + height;
        newZero = zero;
        newY = shared.negativeAnchor;
      } else {
        newZero = Math.max(zero, shared.negativeAnchor);
        newY = newZero + height;
        shared.negativeAnchor = newY;
      }
    }

    rowInfo.meta('value', newY);
    rowInfo.meta('zero', newZero);
  }
  return pointMissing;
};


/**
 * Applies min point length settings for unstacked plan.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeMinPointLengthUnstackedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  if (!rowInfo.meta('missing')) {
    var y = /** @type {number} */ (rowInfo.meta('value'));
    var zero = /** @type {number} */ (rowInfo.meta('zero'));
    var rawVal = rowInfo.get('value');
    var val = Number(rowInfo.get('value'));
    //Condition below also fixes XML restoration.
    var isZero = goog.isNull(rawVal) ? false : (!isNaN(val) && val == 0); //Draw zero to positive side. Considers closure compiler obfuscation.
    var diff = Math.abs(y - zero);
    var height = Math.max(diff, this.minPointLengthCache_);

    var positive = zero >= y;
    if (isZero) {
      var isVertical = /** @type {boolean} */ (this.getOption('isVertical'));
      var inverted = this.yScale().inverted();
      positive = !(isVertical ^ inverted);
    }

    if (positive)
      height = -height;
    rowInfo.meta('value', zero + height);
  }
  return pointMissing;
};


/**
 * Applies min point length settings for ranged plan.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeMinPointLengthRangedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  if (!rowInfo.meta('missing')) {
    var high = /** @type {number} */(rowInfo.meta('high'));
    var low = /** @type {number} */(rowInfo.meta('low'));
    var center = (high + low) / 2;
    var diff = Math.abs(low - high);
    var height = Math.max(diff, this.minPointLengthCache_) / 2;
    if (high >= low)
      height = -height;
    rowInfo.meta('high', center - height);
    rowInfo.meta('low', center + height);
  }
  return pointMissing;
};


/**
 * Prepares Stacked part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeStackedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var map = {
    'value': yScale.transform(rowInfo.meta('stackedValue'), 0.5),
    'zero': goog.math.clamp(yScale.transform(rowInfo.meta('stackedZero'), 0.5), 0, 1),
    'prevValue': yScale.transform(rowInfo.meta('stackedValuePrev'), 0.5),
    'prevZero': yScale.transform(rowInfo.meta('stackedZeroPrev'), 0.5),
    'nextValue': yScale.transform(rowInfo.meta('stackedValueNext'), 0.5),
    'nextZero': yScale.transform(rowInfo.meta('stackedZeroNext'), 0.5)
  };
  this.makePointsMetaFromMap(rowInfo, map, xRatio);
  rowInfo.meta('zeroMissing', rowInfo.meta('stackedMissing'));
  return pointMissing;
};


/**
 * Prepares Unstacked part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeUnstackedMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var map = {};
  for (var i = 0; i < yColumns.length; i++) {
    var val = yScale.transform(yScale.applyComparison(rowInfo.getColumn(yColumns[i]), this.comparisonZero), 0.5);
    if (isNaN(val)) pointMissing |= anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING;
    map[yNames[i]] = val;
  }
  this.makePointsMetaFromMap(rowInfo, map, xRatio);
  return pointMissing;
};


/**
 * Prepares Zero part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeZeroMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('zeroX', rowInfo.meta('x'));
  rowInfo.meta('zero', this.zeroY);
  rowInfo.meta('zeroMissing', false);
  return pointMissing;
};


/**
 * Prepares outliers part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeSizeMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  // negative sizes should be filtered out on drawing plan calculation stage
  // by settings missing reason VALUE_FIELD_MISSING
  rowInfo.meta('size', this.calculateSize(Number(rowInfo.get('size'))));
  return pointMissing;
};


/**
 * Prepares outliers part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.Base.prototype.makeOutliersMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var outliers = [];
  var outliersSource = rowInfo.get('outliers');
  if (goog.isArray(outliersSource)) {
    for (var i = 0; i < outliersSource.length; i++) {
      if (!yScale.isMissing(outliersSource[i]))
        outliers.push(
            this.applyRatioToBounds(
                yScale.transform(
                    yScale.applyComparison(
                        outliersSource[i],
                        this.comparisonZero),
                    0.5),
                false));
    }
  }
  rowInfo.meta('outliers', outliers);
  return pointMissing;
};


/**
 * Prepares meta makers pipe.
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @protected
 */
anychart.core.series.Base.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.length = 0;
  if (this.planIsStacked()) {
    this.metaMakers.push(this.makeStackedMeta);
  } else {
    this.metaMakers.push(this.makeUnstackedMeta);
    if (this.needsZero()) {
      this.metaMakers.push(this.makeZeroMeta);
    }
  }
  if (this.isMinPointLengthBased() && this.yScale().stackMode() != anychart.enums.ScaleStackMode.PERCENT) {
    var minPointLength = /** @type {string|number} */ (this.getInheritedOption('minPointLength'));
    var isVertical = /** @type {boolean} */ (this.getOption('isVertical'));
    var dimension = isVertical ? this.pixelBoundsCache.width : this.pixelBoundsCache.height;
    this.minPointLengthCache_ = Math.abs(anychart.utils.normalizeSize(minPointLength, dimension));

    var isRangeSeries = this.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED | anychart.core.drawers.Capabilities.IS_OHLC_BASED);
    if (isRangeSeries) {
      this.metaMakers.push(this.makeMinPointLengthRangedMeta);
    } else if (this.planIsStacked()) {
      this.metaMakers.push(this.makeMinPointLengthStackedMeta);
    } else {
      this.metaMakers.push(this.makeMinPointLengthUnstackedMeta);
    }
  }
  if (this.isSizeBased()) {
    this.metaMakers.push(this.makeSizeMeta);
  }
  if (this.supportsOutliers()) {
    this.metaMakers.push(this.makeOutliersMeta);
  }
  if (this.needsZero()) {
    var scale = /** @type {anychart.scales.Base} */(this.yScale());
    this.zeroYRatio = goog.math.clamp((scale && scale.transform(0, 0.5)) || 0, 0, 1);
    this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(this.zeroYRatio, false));
  }
};


/**
 * Fetches correct xPointPosition.
 * @return {number}
 */
anychart.core.series.Base.prototype.getXPointPosition = function() {
  return /** @type {number} */(this.getOption('xPointPosition'));
};


/**
 * Calculates pixel value
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @protected
 */
anychart.core.series.Base.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var pointMissing = this.considerMetaEmpty() ?
      0 :
      (Number(rowInfo.meta('missing')) || 0) & ~anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  if (!this.isPointVisible(rowInfo))
    pointMissing |= anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  var xRatio = this.getXScale().transformInternal(
      rowInfo.getX(),
      rowInfo.getIndex(),
      this.getXPointPosition());
  if (pointMissing) {
    this.makeMissing(rowInfo, yNames, xRatio);
  } else {
    for (var i = 0; i < this.metaMakers.length; i++) {
      pointMissing = this.metaMakers[i].call(this, rowInfo, yNames, yColumns, pointMissing, xRatio);
    }
  }
  rowInfo.meta('missing', pointMissing);
};


//endregion
//region --- Format/Position providers generation
//----------------------------------------------------------------------------------------------------------------------
//
//  Format/Position providers generation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates statistics source to update the context.
 * @param {anychart.data.IRowInfo} rowInfo
 * @return {Array.<anychart.core.BaseContext.StatisticsSource>}
 * @protected
 */
anychart.core.series.Base.prototype.createStatisticsSource = function(rowInfo) {
  return [this.getPoint(rowInfo.getIndex()), this, this.getChart()];
};


/**
 * Returns custom token values list.
 * @param {anychart.data.IRowInfo} rowInfo
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>}
 * @protected
 */
anychart.core.series.Base.prototype.getCustomTokenValues = function(rowInfo) {
  var tokenCustomValues = {};
  var diff = /** @type {number} */ (rowInfo.get('high')) - /** @type {number} */ (rowInfo.get('low'));
  tokenCustomValues[anychart.enums.StringToken.RANGE] = {
    value: diff,
    type: anychart.enums.TokenType.NUMBER
  };
  tokenCustomValues[anychart.enums.StringToken.NAME] = {
    value: rowInfo.get('name'),
    type: anychart.enums.TokenType.STRING
  };
  return tokenCustomValues;
};


/**
 * Returns context provider values to propagate to it.
 * @param {anychart.format.Context} provider - Format context.
 * @param {anychart.data.IRowInfo} rowInfo
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>}
 * @protected
 */
anychart.core.series.Base.prototype.getContextProviderValues = function(provider, rowInfo) {
  var scale = this.getXScale();
  var values = {
    'chart': {
      value: this.getChart(),
      type: anychart.enums.TokenType.UNKNOWN
    },
    'series': {
      value: this,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'xScale': {
      value: scale,
      type: anychart.enums.TokenType.UNKNOWN
    },
    'index': {
      value: rowInfo.getIndex(),
      type: anychart.enums.TokenType.NUMBER
    },
    'x': {
      value: rowInfo.getX(),
      type: anychart.enums.TokenType.STRING
    },
    'seriesName': {
      value: this.name(),
      type: anychart.enums.TokenType.STRING
    }
  };

  if (scale && goog.isFunction(scale.getType))
    values['xScaleType'] = {
      value: scale.getType(),
      type: anychart.enums.TokenType.STRING
    };

  if (this.isSizeBased())
    values['size'] = {
      value: rowInfo.get('size'),
      type: anychart.enums.TokenType.NUMBER
    };

  if (this.supportsError()) {
    /** @type {anychart.core.utils.ISeriesWithError} */
    var series = /** @type {anychart.core.utils.ISeriesWithError} */(this);
    /** @type {anychart.enums.ErrorMode} */
    var mode = /** @type {anychart.enums.ErrorMode} */(series.error().mode());
    var error;
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.VALUE) {
      error = series.getErrorValues(false);
      values['valueLowerError'] = {
        value: error[0],
        type: anychart.enums.TokenType.NUMBER
      };
      values['valueUpperError'] = {
        value: error[1],
        type: anychart.enums.TokenType.NUMBER
      };
    }
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.X) {
      error = series.getErrorValues(true);
      values['xLowerError'] = {
        value: error[0],
        type: anychart.enums.TokenType.NUMBER
      };
      values['xUpperError'] = {
        value: error[1],
        type: anychart.enums.TokenType.NUMBER
      };
    }
  }

  var refValueNames = this.getYValueNames();
  for (var i = 0; i < refValueNames.length; i++) {
    var refName = refValueNames[i];
    values[refName] = {
      value: rowInfo.get(refName),
      type: anychart.enums.TokenType.NUMBER
    };
  }
  return values;
};


/**
 * Applies required data to format context.
 * @param {anychart.format.Context} provider - Format context.
 * @param {anychart.data.IRowInfo=} opt_rowInfo - Data source.
 * @return {anychart.format.Context} - Updated format context.
 */
anychart.core.series.Base.prototype.updateContext = function(provider, opt_rowInfo) {
  var rowInfo = opt_rowInfo || this.getIterator();

  provider
      .statisticsSources(this.createStatisticsSource(rowInfo))
      .dataSource(rowInfo)
      .tokenAliases(this.TOKEN_ALIASES)
      .tokenCustomValues(this.getCustomTokenValues(rowInfo));

  return /** @type {anychart.format.Context} */ (provider.propagate(this.getContextProviderValues(provider, rowInfo)));
};


/**
 * Creates labels format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.series.Base.prototype.createLabelsContextProvider = function() {
  return this.updateContext(new anychart.format.Context());
};


/**
 * Creates tooltip context provider.
 * @return {anychart.format.Context}
 */
anychart.core.series.Base.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    /**
     * Tooltip context cache.
     * @type {anychart.format.Context}
     * @protected
     */
    this.tooltipContext = new anychart.format.Context();
  }
  return this.updateContext(this.tooltipContext);
};


/**
 * Creates context provider for legend items text formatter function.
 * @return {Object} Legend context provider.
 * @protected
 */
anychart.core.series.Base.prototype.createLegendContextProvider = function() {
  if (!this.legendProvider_)
    this.legendProvider_ = new anychart.format.Context(void 0, void 0, [this, this.chart]);

  var values = {
    'series': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'chart': {value: this.getChart(), type: anychart.enums.TokenType.UNKNOWN}
  };
  this.legendProvider_.statisticsSources([this, this.chart]);

  return this.legendProvider_.propagate(values);
};


/**
 * Creates position provider based on point geometry.
 * @param {anychart.enums.Anchor} anchor
 * @return {Object}
 * @protected
 */
anychart.core.series.Base.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var x = /** @type {number} */(iterator.meta('x'));
  var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop));
  var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom));
  var bounds = new anychart.math.Rect(x, Math.min(top, bottom), 0, Math.abs(bottom - top));
  if (this.isWidthBased()) {
    bounds.left -= this.pointWidthCache / 2;
    bounds.width += this.pointWidthCache;
  }
  if (this.isSizeBased()) {
    var size = /** @type {number} */(iterator.meta('size'));
    bounds.left -= size;
    bounds.top -= size;
    bounds.width += size + size;
    bounds.height += size + size;
  }
  if (/** @type {boolean} */(this.getOption('isVertical'))) {
    var tmp = bounds.left;
    bounds.left = bounds.top;
    bounds.top = tmp;
    tmp = bounds.height;
    bounds.height = bounds.width;
    bounds.width = tmp;
  }
  return anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
};


/**
 * Creates position provider based on data value.
 * @param {string} position
 * @return {Object}
 * @protected
 */
anychart.core.series.Base.prototype.createPositionProviderByData = function(position) {
  var iterator = this.getIterator();
  var x = iterator.meta('x');
  var val = iterator.meta(position);
  if (!goog.isDef(val)) {
    val = iterator.get(position);
    if (goog.isDef(val)) {
      if (this.planIsStacked()) {
        val += iterator.meta('stackedZero');
      }
      val = this.transformY(val);
    } else {
      val = NaN;
    }
  }
  var point;
  if (/** @type {boolean} */(this.getOption('isVertical')))
    point = {'x': val, 'y': x};
  else
    point = {'x': x, 'y': val};
  return point;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @param {boolean=} opt_shift3D If true, adds a 3D shift if possible.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.series.Base.prototype.createPositionProvider = function(position, opt_shift3D) {
  var point;
  if (this.getIterator().meta('missing')) {
    point = {'x': NaN, 'y': NaN};
  } else {
    var anchor = anychart.enums.normalizePosition(position, null);
    if (anchor) {
      point = this.createPositionProviderByGeometry(/** @type {anychart.enums.Anchor} */(anchor));
    } else {
      point = this.createPositionProviderByData(position);
      if (isNaN(point['x']) || isNaN(point['y']))
        point = this.createPositionProviderByGeometry(anychart.enums.Anchor.CENTER_TOP);
    }

    if (opt_shift3D && this.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
      var provider3D = this.get3DProvider();
      var index = this.getIndex();
      point['x'] += provider3D.getX3DDistributionShift(index, this.planIsStacked());
      point['y'] -= provider3D.getY3DDistributionShift(index, this.planIsStacked());
    }
  }
  return {'value': point};
};


//endregion
//region --- Optimized Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Optimized Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.series.Base.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'xPointPosition',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'pointWidth',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxPointWidth',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minPointLength',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxPointWidth',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minPointLength',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'connectMissingPoints',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'displayNegative',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'stepDirection',
      anychart.enums.normalizeStepDirection);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'isVertical',
      anychart.core.settings.boolOrNullNormalizer);

  return map;
})();


// populating series base prototype with properties
anychart.core.settings.populate(anychart.core.series.Base, anychart.core.series.Base.PROPERTY_DESCRIPTORS);


//endregion
//region --- Statistics
//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series statistics.
 * @param {string=} opt_name Statistics parameter name.
 * @param {*=} opt_value Statistics parameter value.
 * @return {anychart.core.series.Base|Object.<number>|number}
 */
anychart.core.series.Base.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name.toLowerCase()] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name.toLowerCase()];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Calculate series statistics.
 */
anychart.core.series.Base.prototype.calculateStatistics = goog.nullFunction;


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.series.Base.prototype.getStat = function(key) {
  this.chart.ensureStatisticsReady();
  return this.statistics(key);
};


//endregion
//region --- Serialization/Deserialization/Dispose
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization/Deserialization/Dispose
//
//----------------------------------------------------------------------------------------------------------------------
// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * @inheritDoc
 */
anychart.core.series.Base.prototype.serialize = function() {
  var json = anychart.core.series.Base.base(this, 'serialize');

  json['seriesType'] = this.seriesType();
  json['clip'] = anychart.utils.instanceOf(this.clip_, anychart.math.Rect) ? this.clip_.serialize() : this.clip_;

  if (this.meta_)
    json['meta'] = this.meta();
  if (this.id_)
    json['id'] = this.id();
  if (this.name_)
    json['name'] = this.name();
  if (this.autoIndex_ != this.getIndex())
    json['autoIndex'] = this.autoIndex();

  if (this.supportsInteractivity()) {
    json['tooltip'] = this.tooltip().serialize();
    json['legendItem'] = this.legendItem().serialize();
  }

  if (this.supportsError()) {
    json['error'] = this.error().serialize();
  }

  anychart.core.settings.serialize(this, anychart.core.series.Base.PROPERTY_DESCRIPTORS, json);
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  json['a11y'] = this.a11y().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.series.Base.base(this, 'setupByJSON', config, opt_default);

  this.id(config['id']);
  this.autoIndex(config['autoIndex']);
  this.name(config['name']);
  this.meta(config['meta']);
  this.clip(config['clip']);
  this.a11y(config['a11y']);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
  anychart.core.settings.deserialize(this, anychart.core.series.Base.PROPERTY_DESCRIPTORS, config);

  this.applyDefaultsToElements(config, false, opt_default);
};


/** @inheritDoc */
anychart.core.series.Base.prototype.disposeInternal = function() {
  goog.disposeAll(this.errorPaths_, this.errorPathsPool_);
  if (!this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    goog.dispose(this.rootLayer);
  }
  goog.disposeAll(
      this.shapeManager,
      this.drawer,
      this.normal_,
      this.hovered_,
      this.selected_,
      this.tooltipInternal,
      this.legendItem_,
      this.error_,
      this.renderingSettings_
  );
  this.rootLayer = null;
  this.errorPaths_ = null;
  this.yScale_ = null;
  delete this.chart;
  delete this.plot;
  delete this.iterator;
  delete this.themeSettings;
  delete this.autoSettings;
  delete this.ownSettings;
  delete this.shapeManager;
  delete this.drawer;
  delete this.tooltipInternal;
  delete this.legendItem_;
  delete this.error_;
  delete this.renderingSettings_;
  anychart.core.series.Base.base(this, 'disposeInternal');
};


//endregion
//region --- These methods don't have non-exported versions
//----------------------------------------------------------------------------------------------------------------------
//
//  These methods don't have non-exported versions
//
//----------------------------------------------------------------------------------------------------------------------

//fill
//hoverFill
//selectFill
//negativeFill
//hoverNegativeFill
//selectNegativeFill
//risingFill
//hoverRisingFill
//selectRisingFill
//fallingFill
//hoverFallingFill
//selectFallingFill

//stroke
//hoverStroke
//selectStroke
//lowStroke
//hoverLowStroke
//selectLowStroke
//highStroke
//hoverHighStroke
//selectHighStroke
//negativeStroke
//hoverNegativeStroke
//selectNegativeStroke
//risingStroke
//hoverRisingStroke
//selectRisingStroke
//fallingStroke
//hoverFallingStroke
//selectFallingStroke
//medianStroke
//hoverMedianStroke
//selectMedianStroke
//stemStroke
//hoverStemStroke
//selectStemStroke
//whiskerStroke
//hoverWhiskerStroke
//selectWhiskerStroke

//hatchFill
//hoverHatchFill
//selectHatchFill
//negativeHatchFill
//hoverNegativeHatchFill
//selectNegativeHatchFill
//risingHatchFill
//hoverRisingHatchFill
//selectRisingHatchFill
//fallingHatchFill
//hoverFallingHatchFill
//selectFallingHatchFill

//color
//xPointPosition
//pointWidth
//connectMissingPoints
//displayNegative
//whiskerWidth
//hoverWhiskerWidth
//selectWhiskerWidth
//type
//hoverType
//selectType
//size
//hoverSize
//selectSize
//endSize;
//startSize;
//curvature;

//endregion

//exports
(function() {
  var proto = anychart.core.series.Base.prototype;
  proto['a11y'] = proto.a11y;

  proto['getType'] = proto.getType;//legacy for scatter
  proto['seriesType'] = proto.seriesType;
  proto['name'] = proto.name;
  proto['id'] = proto.id;
  proto['meta'] = proto.meta;
  proto['getIndex'] = proto.getIndex;

  proto['yScale'] = proto.yScale;

  proto['labels'] = proto.labels;//doc|ex
  proto['markers'] = proto.markers;//doc|ex
  proto['outlierMarkers'] = proto.outlierMarkers;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;

  proto['tooltip'] = proto.tooltip;
  proto['legendItem'] = proto.legendItem;
  proto['clip'] = proto.clip;
  proto['error'] = proto.error;

  proto['transformX'] = proto.transformX;
  proto['transformY'] = proto.transformY;

  proto['getPixelBounds'] = proto.getPixelBounds;
  proto['getPixelPointWidth'] = proto.getPixelPointWidth;

  proto['getStat'] = proto.getStat;

  proto['rendering'] = proto.rendering;
})();
