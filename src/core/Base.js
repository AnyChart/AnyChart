goog.provide('anychart.SignalEvent');
goog.provide('anychart.core.Base');

goog.require('anychart');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.enums');
goog.require('goog.array');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * The list of elements consistency states.
 * @enum {number}
 */
anychart.ConsistencyState = {
  /**
   * So magical consistency state. Used to invalidate entities
   * that don't have own invalidation, can't be drawn but must
   * be able to dispatch signals.
   */
  ONLY_DISPATCHING: 0,
  //---------------------------------- GENERAL STATES ---------------------------------
  /**
   * enabled() has changed.
   */
  ENABLED: 1 << 0,
  /**
   * Container has changed.
   */
  CONTAINER: 1 << 1,
  /**
   * Size has changed.
   */
  BOUNDS: 1 << 2,
  /**
   * Z index has changed.
   */
  Z_INDEX: 1 << 3,
  /**
   * Visual settings have changed (fill, stroke, etc.).
   */
  APPEARANCE: 1 << 4,
  /**
   * Accessibility settings.
   */
  A11Y: 1 << 5,
  //---------------------------------- DATA STATES (BASE) ---------------------------------
  /**
   * Data mask invalidated.
   */
  DATA_MASK: 1 << 0,
  //---------------------------------- CHART STATES (VB) ---------------------------------
  /**
   * Chart background has changed.
   */
  CHART_BACKGROUND: 1 << 6,
  /**
   * Chart title has changed.
   */
  CHART_TITLE: 1 << 7,
  /**
   * Labels have changed.
   */
  CHART_LABELS: 1 << 8,
  // We also add SeparateChart states here to not to add prefix SEPARATE_CHART.
  // But if bullet or spark chart will need some new consistency states, there is a possibility to add 2 here.
  CHART_LEGEND: 1 << 9,
  CHART_CREDITS: 1 << 10,
  CHART_ANIMATION: 1 << 11,
  //---------------------------------- BULLET STATES (CHART) ---------------------------------
  BULLET_DATA: 1 << 12,
  BULLET_SCALES: 1 << 13,
  BULLET_AXES: 1 << 14,
  BULLET_AXES_MARKERS: 1 << 15,
  BULLET_MARKERS: 1 << 16,
  //---------------------------------- CHART WITH SERIES STATES (CHART) ---------------------------------
  SERIES_CHART_PALETTE: 1 << 12,
  SERIES_CHART_MARKER_PALETTE: 1 << 13,
  SERIES_CHART_HATCH_FILL_PALETTE: 1 << 14,
  SERIES_CHART_SERIES: 1 << 15,
  //---------------------------------- CHART WITH ORTHOGONAL SCALES STATES (SERIES_CHART) ---------------------------------
  SCALE_CHART_SCALES: 1 << 16,
  SCALE_CHART_SCALE_MAPS: 1 << 17,
  SCALE_CHART_Y_SCALES: 1 << 18,
  SCALE_CHART_STATISTICS: 1 << 19,
  SCALE_CHART_SCALES_STATISTICS: 1 << 20,
  //---------------------------------- CHART WITH AXES STATES (SCALE_CHART) -------------------------------
  AXES_CHART_AXES: 1 << 21,
  AXES_CHART_AXES_MARKERS: 1 << 22,
  AXES_CHART_GRIDS: 1 << 23,
  AXES_CHART_CROSSHAIR: 1 << 24,
  AXES_CHART_ANNOTATIONS: 1 << 25,
  AXES_CHART_QUARTER: 1 << 26,
  AXES_CHART_CROSSLINES: 1 << 27,
  //---------------------------------- CARTESIAN STATES (AXES_CHART) ---------------------------------
  CARTESIAN_ZOOM: 1 << 28,
  CARTESIAN_X_SCROLLER: 1 << 29,
  CARTESIAN_Y_SCROLLER: 1 << 30,
  //---------------------------------- PYRAMID/FUNNEL STATES (CHART) ---------------------------------
  PYRAMID_FUNNEL_LABELS: 1 << 12,
  PYRAMID_FUNNEL_MARKERS: 1 << 13,
  PYRAMID_FUNNEL_DATA: 1 << 14,
  //---------------------------------- GANTT STATES (CHART) ---------------------------------
  GANTT_DATA: 1 << 12,
  GANTT_POSITION: 1 << 13,
  //---------------------------------- TAG CLOUD STATES (CHART) ---------------------------------
  TAG_CLOUD_DATA: 1 << 12,
  TAG_CLOUD_ANGLES: 1 << 13,
  TAG_CLOUD_TAGS: 1 << 14,
  TAG_CLOUD_COLOR_RANGE: 1 << 15,
  TAG_CLOUD_COLOR_SCALE: 1 << 16,
  TAG_CLOUD_SCALE: 1 << 17,
  //---------------------------------- PIE STATES (CHART) ---------------------------------
  PIE_LABELS: 1 << 12,
  PIE_DATA: 1 << 13,
  PIE_CENTER_CONTENT: 1 << 14,
  //---------------------------------- SPARKLINE STATES (CHART) ---------------------------------
  SPARK_SCALES: 1 << 12,
  SPARK_SERIES: 1 << 13,
  SPARK_AXES_MARKERS: 1 << 14,
  //---------------------------------- MAP STATES (SERIES_CHART) ---------------------------------
  MAP_SCALE: 1 << 16,
  MAP_GEO_DATA: 1 << 18,
  MAP_COLOR_RANGE: 1 << 19,
  MAP_MOVE: 1 << 20,
  MAP_ZOOM: 1 << 21,
  MAP_GEO_DATA_INDEX: 1 << 22,
  MAP_LABELS: 1 << 23,
  MAP_CALLOUT: 1 << 24,
  MAP_AXES: 1 << 25,
  MAP_GRIDS: 1 << 26,
  MAP_CROSSHAIR: 1 << 27,
  //---------------------------------- HEAT MAP STATES (CARTESIAN) ---------------------------------
  HEATMAP_COLOR_SCALE: 1 << 31,
  //---------------------------------- MEKKO STATES (AXES_CHART) ---------------------------------
  MEKKO_CATEGORY_SCALE: 1 << 28,
  //---------------------------------- SERIES STATES (VB) ---------------------------------
  // also combined, due to a very big prefix
  SERIES_HATCH_FILL: 1 << 6, //
  SERIES_MARKERS: 1 << 7, //
  SERIES_LABELS: 1 << 8, //
  SERIES_DATA: 1 << 9,
  SERIES_POINTS: 1 << 10, //
  SERIES_COLOR: 1 << 11, //
  SERIES_CLIP: 1 << 12, //
  SERIES_ERROR: 1 << 13, //
  SERIES_OUTLIERS: 1 << 14, //
  SERIES_SHAPE_MANAGER: 1 << 15,
  SERIES_COLOR_SCALE: 1 << 16,
  //---------------------------------- AXES STATES (VB) ---------------------------------
  CALLOUT_TITLE: 1 << 6,
  CALLOUT_LABELS: 1 << 7,
  CALLOUT_BACKGROUND: 1 << 8,
  //---------------------------------- AXES STATES (VB) ---------------------------------
  // also combined
  AXIS_TITLE: 1 << 6,
  AXIS_LABELS: 1 << 7,
  AXIS_TICKS: 1 << 8,
  AXIS_OVERLAP: 1 << 9,
  //---------------------------------- AXES STATES (AXIS) ---------------------------------
  COLOR_RANGE_MARKER: 1 << 10,
  //---------------------------------- GANTT CONTROLLER STATES (VB) ---------------------------------
  CONTROLLER_DATA: 1 << 6,
  CONTROLLER_VISIBILITY: 1 << 7,
  CONTROLLER_POSITION: 1 << 8,
  //---------------------------------- GANTT TIMELINE STATES (VB) ---------------------------------
  TIMELINE_SCALES: 1 << 9,
  TIMELINE_ELEMENTS_APPEARANCE: 1 << 10,
  TIMELINE_ELEMENTS_LABELS: 1 << 11,
  TIMELINE_MARKERS: 1 << 12,
  TIMELINE_CALENDAR: 1 << 13,
  //---------------------------------- GANTT TIMELINE HEADER STATES (VB) ---------------------------------
  TIMELINE_HEADER_SCALES: 1 << 6,
  //---------------------------------- GANTT TIMELINE HEADER LEVEL STATES (VB) ---------------------------------
  TIMELINE_HEADER_LEVEL_LABELS: 1 << 6,
  TIMELINE_HEADER_LEVEL_TICKS: 1 << 7,
  TIMELINE_HEADER_LEVEL_BACKGROUND: 1 << 8,
  TIMELINE_HEADER_LEVEL_ZOOM: 1 << 9,
  //---------------------------------- GRIDS STATES (VB) ---------------------------------
  // also combined
  GRIDS_POSITION: 1 << 6,
  //---------------------------------- BASE GRIDS STATES (VB) ---------------------------------
  BASE_GRID_REDRAW: 1 << 7,
  BASE_GRID_HOVER: 1 << 8,
  //---------------------------------- BUTTON STATES (VB) ---------------------------------
  BUTTON_BACKGROUND: 1 << 6,
  BUTTON_CURSOR: 1 << 7,
  //---------------------------------- CREDITS STATES (VB) ---------------------------------
  CREDITS_POSITION: 1 << 6,
  CREDITS_REDRAW_IMAGE: 1 << 7,
  //---------------------------------- DATA GRID STATES (BASE GRID) ---------------------------------
  DATA_GRID_GRIDS: 1 << 9,
  //---------------------------------- DATA GRID COLUMN STATES (VB) ---------------------------------
  DATA_GRID_COLUMN_TITLE: 1 << 6,
  DATA_GRID_COLUMN_POSITION: 1 << 7,
  DATA_GRID_COLUMN_BUTTON: 1 << 8,
  DATA_GRID_COLUMN_LABELS_APPEARANCE: 1 << 9,
  DATA_GRID_COLUMN_LABELS_BOUNDS: 1 << 10,
  DATA_GRID_COLUMN_DATA: 1 << 11,
  //---------------------------------- BACKGROUND STATES (VB) ---------------------------------
  BACKGROUND_POINTER_EVENTS: 1 << 6,
  //---------------------------------- LABEL STATES (VB) ---------------------------------
  LABEL_BACKGROUND: 1 << 6,
  LABEL_VISIBILITY: 1 << 7,
  //---------------------------------- LABELS FACTORY STATES (VB) ---------------------------------
  LABELS_FACTORY_BACKGROUND: 1 << 6,
  LABELS_FACTORY_HANDLERS: 1 << 7,
  LABELS_FACTORY_CLIP: 1 << 8,
  LABELS_FACTORY_CONNECTOR: 1 << 9,
  LABELS_FACTORY_CACHE: 1 << 10,
  LABELS_FACTORY_POSITION: 1 << 11,
  //---------------------------------- LEGEND STATES (VB) ---------------------------------
  LEGEND_BACKGROUND: 1 << 6,
  LEGEND_TITLE: 1 << 7,
  LEGEND_SEPARATOR: 1 << 8,
  LEGEND_PAGINATOR: 1 << 9,
  LEGEND_RECREATE_ITEMS: 1 << 10,
  LEGEND_DRAG: 1 << 11,
  //---------------------------------- MARKERS FACTORY STATES (VB) ---------------------------------
  MARKERS_FACTORY_HANDLERS: 1 << 6,
  //---------------------------------- PAGINATOR STATES (VB) ---------------------------------
  PAGINATOR_BACKGROUND: 1 << 6,
  //---------------------------------- SCROLLBAR STATES (VB) ---------------------------------
  SCROLLBAR_POSITION: 1 << 6,
  //---------------------------------- SPLITTER STATES (VB) ---------------------------------
  SPLITTER_POSITION: 1 << 6,
  //---------------------------------- TITLE STATES (VB) ---------------------------------
  TITLE_BACKGROUND: 1 << 6,
  //---------------------------------- TOOLTIP STATES (VB) ---------------------------------
  // actually its for TooltipItem, but tooltip doesn't have any states and we hope they will merge
  TOOLTIP_POSITION: 1 << 6,
  TOOLTIP_TITLE: 1 << 7,
  TOOLTIP_SEPARATOR: 1 << 8,
  TOOLTIP_CONTENT: 1 << 9,
  TOOLTIP_BACKGROUND: 1 << 10,
  TOOLTIP_VISIBILITY: 1 << 11,
  TOOLTIP_MODE: 1 << 12,
  TOOLTIP_ALLOWANCE: 1 << 13, //allowLeaveScreen or allowLeaveChart.
  TOOLTIP_HTML_MODE: 1 << 14, //html-tooltip usage.
  //------------------------------ CIRCULAR/LINEAR GAUGE (CHART) ------------------------------
  //---------------------------------- GAUGE STATES (CHART) ---------------------------------
  GAUGE_POINTERS: 1 << 12,
  GAUGE_KNOB: 1 << 13,
  GAUGE_CAP: 1 << 14,
  GAUGE_AXES: 1 << 15,
  GAUGE_HATCH_FILL: 1 << 16,
  GAUGE_AXIS_MARKERS: 1 << 17,
  GAUGE_SCALE: 1 << 18,
  GAUGE_MARKER_PALETTE: 1 << 19,
  GAUGE_COLOR_SCALE: 1 << 20,
  GAUGE_PALETTE: 1 << 21,
  GAUGE_HATCH_FILL_PALETTE: 1 << 22,
  GAUGE_SCALE_BAR: 1 << 23,
  GAUGE_POINTER_LABELS: 1 << 13, // reset knob state for linear gauge, cause it doesn't need it
  //---------------------------------- TABLE (VB) ---------------------------------------------
  //---------------------------------- TABLE STATES (VB) ---------------------------------
  TABLE_CELL_BOUNDS: 1 << 6,
  TABLE_OVERLAP: 1 << 7,
  TABLE_BORDERS: 1 << 8,
  TABLE_FILLS: 1 << 9,
  TABLE_CONTENT: 1 << 10,
  TABLE_STRUCTURE: 1 << 11,
  //---------------------------------- SCROLLER (VB) ---------------------------------------------
  SCROLLER_THUMBS_SHAPE: 1 << 6,
  SCROLLER_ORIENTATION: 1 << 7,
  SCROLLER_AUTO_HIDE: 1 << 8,
  //---------------------------------- STOCK CHART (CHART) -------------------------------------------
  STOCK_PLOTS_APPEARANCE: 1 << 12,
  STOCK_SCROLLER: 1 << 13,
  STOCK_DATA: 1 << 14,
  STOCK_SCALES: 1 << 15,
  STOCK_GAP: 1 << 16,
  STOCK_SPLITTERS: 1 << 17,
  //---------------------------------- STOCK PLOT (VB) -------------------------------------------
  STOCK_PLOT_BACKGROUND: 1 << 6,
  STOCK_PLOT_SERIES: 1 << 7,
  STOCK_PLOT_AXES: 1 << 8,
  STOCK_PLOT_DT_AXIS: 1 << 9,
  STOCK_PLOT_GRIDS: 1 << 10,
  STOCK_PLOT_LEGEND: 1 << 11,
  STOCK_PLOT_PALETTE: 1 << 12,
  STOCK_PLOT_ANNOTATIONS: 1 << 13,
  STOCK_PLOT_PRICE_INDICATORS: 1 << 14,
  STOCK_PLOT_NO_DATA_LABEL: 1 << 15,
  STOCK_PLOT_EVENT_MARKERS: 1 << 16,
  STOCK_PLOT_TITLE: 1 << 17,
  STOCK_PLOT_AXIS_MARKERS: 1 << 18,
  // stock plot uses this consistency state
  // AXES_CHART_CROSSHAIR: 1 << 24
  //---------------------------------- PRICE INDICATOR STATES (VB) ---------------------------------
  STOCK_PRICE_INDICATOR_LABEL: 1 << 6,
  STOCK_PRICE_INDICATOR_SERIES: 1 << 7,
  //---------------------------------- STOCK DATETIME AXIS (VB) ----------------------------------------
  STOCK_DTAXIS_BACKGROUND: 1 << 6,
  //---------------------------------- STOCK SCROLLER (SCROLLER) ----------------------------------------
  STOCK_SCROLLER_SERIES: 1 << 9,
  STOCK_SCROLLER_AXIS: 1 << 10,
  //---------------------------------- TREE CHART (CHART) ----------------------------------
  TREE_DATA: 1 << 12,
  //---------------------------------- TREE MAP CHART (TREE CHART) ----------------------------------
  TREEMAP_COLOR_SCALE: 1 << 13,
  TREEMAP_NODE_TYPES: 1 << 14,
  TREEMAP_COLOR_RANGE: 1 << 15,
  TREEMAP_HINT_OPACITY: 1 << 16,
  //---------------------------------- SUNBURST_LABELS STATES (TREE CHART) ---------------------------------
  SUNBURST_CENTER_CONTENT: 1 << 13,
  SUNBURST_COLOR_SCALE: 1 << 14,
  SUNBURST_CALCULATIONS: 1 << 15,
  //---------------------------------- PERT CHART (SEPARATE CHART) ----------------------------------
  PERT_DATA: 1 << 12,
  PERT_CALCULATIONS: 1 << 13,
  PERT_LABELS: 1 << 14,
  PERT_APPEARANCE: 1 << 15,
  //---------------------------------- VENN CHART (SEPARATE CHART) ----------------------------------
  VENN_DATA: 1 << 12,
  VENN_LABELS: 1 << 13,
  VENN_APPEARANCE: 1 << 14,
  VENN_MARKERS: 1 << 15,
  //---------------------------------- ANNOTATIONS (VB) ----------------------------------
  ANNOTATIONS_ANCHORS: 1 << 6,
  ANNOTATIONS_LAST_POINT: 1 << 7,
  ANNOTATIONS_SHAPES: 1 << 8,
  ANNOTATIONS_MARKERS: 1 << 9,
  ANNOTATIONS_INTERACTIVITY: 1 << 10,
  ANNOTATIONS_LABELS: 1 << 11,
  ANNOTATIONS_LEVELS: 1 << 12,
  //---------------------------------- ANNOTATIONS (VB) ----------------------------------
  ANNOTATIONS_CONTROLLER_ANNOTATIONS: 1 << 6,
  ANNOTATIONS_CONTROLLER_DRAWING_MODE: 1 << 7,
  //---------------------------------- RESOURCE LIST (VB) --------------------------------
  RESOURCE_LIST_BACKGROUND: 1 << 6,
  RESOURCE_LIST_SCROLL: 1 << 7,
  RESOURCE_LIST_ITEMS: 1 << 8,
  RESOURCE_LIST_DATA: 1 << 9,
  RESOURCE_LIST_IMAGES_SETTINGS: 1 << 10,
  RESOURCE_LIST_NAMES_SETTINGS: 1 << 11,
  RESOURCE_LIST_TYPES_SETTINGS: 1 << 12,
  RESOURCE_LIST_DESCRIPTIONS_SETTINGS: 1 << 13,
  RESOURCE_LIST_TAGS_SETTINGS: 1 << 14,
  RESOURCE_LIST_OVERLAY: 1 << 15,
  //---------------------------------- RESOURCE (CHART) ----------------------------------
  RESOURCE_RESOURCE_LIST: 1 << 12,
  RESOURCE_TIME_LINE: 1 << 13,
  RESOURCE_X_SCROLL: 1 << 14,
  RESOURCE_Y_SCROLL: 1 << 15,
  RESOURCE_GRID: 1 << 16,
  RESOURCE_X_SCALE_RANGE: 1 << 17,
  RESOURCE_X_SCALE_POSITION: 1 << 18,
  RESOURCE_DATA: 1 << 19,
  RESOURCE_Y_RANGE: 1 << 20,
  RESOURCE_RESOURCES: 1 << 21,
  RESOURCE_LOGO: 1 << 22,
  RESOURCE_OVERLAY: 1 << 23,
  RESOURCE_SPLITTER: 1 << 24,
  RESOURCE_CONFLICTS: 1 << 25,
  //---------------------------------- RESOURCE GRID (VB) ----------------------------------
  RESOURCE_GRID_BACKGROUND: 1 << 6,
  RESOURCE_GRID_TICKS: 1 << 7,
  RESOURCE_GRID_POSITION: 1 << 8,
  RESOURCE_GRID_OVERLAY: 1 << 9,
  //---------------------------------- RESOURCE TIMELINE (VB) ----------------------------------
  RESOURCE_TIMELINE_BACKGROUND: 1 << 6,
  RESOURCE_TIMELINE_TICKS: 1 << 7,
  RESOURCE_TIMELINE_LABELS: 1 << 8,
  RESOURCE_TIMELINE_LEVELS: 1 << 9,
  RESOURCE_TIMELINE_OVERLAY: 1 << 10,
  //---------------------------------- RESOURCE LOGO (BACKGROUND) ----------------------------------
  RESOURCE_LOGO_OVERLAY: 1 << 7,
  //---------------------------------- RESOURCE RESOURCE (B) -----------------------------
  RESOURCE_RESOURCE_DATA: 1 << 0,
  RESOURCE_RESOURCE_SCHEDULE: 1 << 1,
  //---------------------------------- RESOURCE CONFLICTS (VB) -----------------------------
  RESOURCE_CONFLICTS_LABELS: 1 << 6,
  RESOURCE_CONFLICTS_CONFLICTS: 1 << 7,
  //---------------------------------- DATE TIME WITH CALENDAR -----------------------------
  DTWC_TS_GRID: 1 << 0,
  DTWC_TS_GRID_ZERO: 1 << 1,
  //----------------------------- QUARTER (BACKGROUND) -----------------------------
  QUARTER_TITLE: 1 << 7,
  QUARTER_LABELS: 1 << 8,
  //----------------------------- EVENT MARKERS (VB) -----------------------------
  EVENT_MARKERS_DATA: 1 << 6,
  //---------------------------------- SANKEY STATES (CHART) ---------------------------------
  SANKEY_DATA: 1 << 12,
  SANKEY_NODE_LABELS: 1 << 13, // node labels
  SANKEY_FLOW_LABELS: 1 << 14, // flow and dropoff labels
  //---------------------------------- SURFACE STATES (CHART) ----------------------------------
  SURFACE_DATA: 1 << 12,
  SURFACE_COLOR_RANGE: 1 << 13,
  SURFACE_COLOR_SCALE: 1 << 14,
  /**
   * Combination of all states.
   */
  ALL: 0xFFFFFFFF
};


/**
 * List of all possible signals (can be only from 1 << 0 to 1 << 30)
 * @enum {number}
 */
anychart.Signal = {
  NEEDS_REDRAW: 1 << 0,
  NEEDS_REAPPLICATION: 1 << 1,
  NEEDS_RECALCULATION: 1 << 2,
  BOUNDS_CHANGED: 1 << 3,
  DATA_CHANGED: 1 << 4,
  META_CHANGED: 1 << 5,
  NEED_UPDATE_LEGEND: 1 << 6,
  NEED_UPDATE_COLOR_RANGE: 1 << 7,
  NEED_UPDATE_FULL_RANGE_ITEMS: 1 << 8,
  NEED_UPDATE_TICK_DEPENDENT: 1 << 9,
  NEED_UPDATE_OVERLAP: 1 << 10,
  NEEDS_UPDATE_A11Y: 1 << 11,
  NEEDS_REDRAW_LABELS: 1 << 12,
  NEEDS_REDRAW_APPEARANCE: 1 << 13,
  NEEDS_UPDATE_TOOLTIP: 1 << 14,
  ENABLED_STATE_CHANGED: 1 << 15,
  Z_INDEX_STATE_CHANGED: 1 << 16,
  NEED_RECALCULATE_LEGEND: 1 << 17,
  NEEDS_UPDATE_MARKERS: 1 << 18,

  MEASURE_COLLECT: 1 << 19, //Special Measuriator signal to collect texts to measure.
  MEASURE_BOUNDS: 1 << 20 //Special Measuriator signal to measure already collected texts.
};


/**
 * The list of point states.
 * @enum {number}
 */
anychart.PointState = {
  NORMAL: 0,
  HOVER: 1,
  SELECT: 2,
  ALL: 0xFFFFFFFF
};


/**
 * The list of state settings states.
 * @enum {number}
 */
anychart.SettingsState = {
  NORMAL: 0,
  HOVERED: 1,
  SELECTED: 2
};


/**
 * Consistency store meta information.
 * Keeps information about states that supported by this store.
 * Please see anychart.consistency package for more information.
 * @typedef {
 * Object.<string, {
 *   lastUsedBit: number,
 *   supportedStates: number,
 *   states: Object.<string, number>
 * }>
 * }
 */
anychart.ConsistencyStoreMeta;


/**
 * Consistency storage meta information.
 * Keeps information about store by its name.
 * @typedef {Object.<string, anychart.ConsistencyStoreMeta>}
 */
anychart.ConsistencyStorageMeta;


/**
 * Consistency storage map type definition.
 * Maps store name to store consistency.
 * Information about store structure presented in store meta (@see anychart.ConsistencyStoreMeta).
 * This number is a decimal representation of binary mask.
 *   0 means 0b000 or parseInt('000', 2)
 *   1 means 0b001 or parseInt('001', 2)
 *   4 means 0b100 or parseInt('100', 2)
 * @example
 * {
 *   'serieschart': 1,
 *   'mystorename': 0,
 *   'otherstore': 4
 * }
 * @typedef {Object.<string, number>}
 */
anychart.ConsistencyStorage;



/**
 * Class implements all the work with consistency states.
 * invalidate() and markConsistent() are used to change states.
 * isConsistent() and hasInvalidationState() are used to check states.
 * @constructor
 * @name anychart.core.Base
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {goog.events.EventTarget}
 */
anychart.core.Base = function() {
  anychart.core.Base.base(this, 'constructor');

  /**
   * Own settings.
   * @type {!Object}
   */
  this.ownSettings = {};

  /**
   * Theme settings settings.
   * @type {!Object}
   */
  this.themeSettings = {};

  /**
   * Descriptors meta.
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = {};

  /**
   * Whether to dispatch signals even if current consistency state is not effective.
   * @type {boolean}
   * @private
   */
  this.needsForceSignalsDispatching_ = false;

  /**
   * Themes chain for current instances in order from less specific to more specific.
   *
   * Can contain strings (names in defaultTheme objects, for example 'title' or 'chart.title')
   * of theme objects.
   *
   * @type {Array.<Object|string>}
   * @protected
   */
  this.themes_ = [];


  /**
   * Default themes that could be restored by restoreDefaultThemes() method
   * @type {Array.<Object|string>}
   * @private
   */
  this.defaultThemes_ = [];


  /**
   * Map for all getter instances states in format:
   * {
   *   'getterName1': {
   *     'themes': ['theme1', 'theme2'],
   *     'enabled': boolean,
   *     'instance': null|anychart.core.Base
   *   }
   * }
   *
   * This map is used to check if instance should be created or it already exists.
   *
   * @type {Object}
   * @private
   */
  this.createdMap_ = {};

  /**
   * Consistency storage map.
   * Please see type definition for more information.
   * @type {anychart.ConsistencyStorage}
   */
  this.consistencyStorage = {};

  // Marks storage as inconsistent.
  this.invalidateStorage();
};
goog.inherits(anychart.core.Base, goog.events.EventTarget);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.Base.prototype.SUPPORTED_SIGNALS = 0;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Current consistency state. Equals zero when element is consistent.
 * @type {number}
 * @private
 */
anychart.core.Base.prototype.consistency_ = 0;


/**
 * If NaN - no dispatching suspend is active.
 * If a number - contains the cumulative signal for all suspended states that had to be dispatched during the suspend.
 * @type {number}
 * @protected
 */
anychart.core.Base.prototype.suspendedDispatching = NaN;


/**
 * Dispatching suspend level to support suspend-resume stacking.
 * @type {number}
 * @protected
 */
anychart.core.Base.prototype.suspensionLevel = 0;


//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.Base.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.Base.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.Base.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.Base.prototype.getOption = function(name) {
  return this.hasOwnOption(name) ? this.getOwnOption(name) : this.getThemeOption(name);
};


/** @inheritDoc */
anychart.core.Base.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.Base.prototype.check = function(flags) {
  return true;
};


/** @inheritDoc */
anychart.core.Base.prototype.getCapabilities = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ? meta.capabilities : 0;
};


/** @inheritDoc */
anychart.core.Base.prototype.getConsistencyState = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ? (meta.consistency || 0) : 0;
};


/** @inheritDoc */
anychart.core.Base.prototype.getSignal = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ? (meta.signal || 0) : 0;
};


/** @inheritDoc */
anychart.core.Base.prototype.getHookContext = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ? (meta.context || this) : this;
};


/** @inheritDoc */
anychart.core.Base.prototype.getHook = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ? (meta.beforeInvalidationHook || goog.nullFunction) : goog.nullFunction;
};


/** @inheritDoc */
anychart.core.Base.prototype.getInvalidationCondition = function(fieldName) {
  var meta = this.descriptorsMeta[fieldName];
  return meta ?
      (meta.invalidationCondition || anychart.core.settings.DEFAULT_INVALIDATION_CONDITION) :
      anychart.core.settings.DEFAULT_INVALIDATION_CONDITION;
};


/** @inheritDoc */
anychart.core.Base.prototype.getParentState = function() {
  return null;
};


//endregion


/**
 * Whether to dispatch signals even if current consistency state is not effective.
 * @param {boolean=} opt_value - Value to set.
 * @return {boolean|anychart.core.Base}
 */
anychart.core.Base.prototype.needsForceSignalsDispatching = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.needsForceSignalsDispatching_ = opt_value;
    return this;
  }
  return this.needsForceSignalsDispatching_;
};


/**
 * Adds a signal events listener.
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener Callback
 *     method.
 * @param {SCOPE=} opt_scope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE
 */
anychart.core.Base.prototype.listenSignals = function(listener, opt_scope) {
  return this.listen(anychart.enums.EventType.SIGNAL, listener, false, opt_scope);
};


/**
 * Removes a signal events listener.
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener Callback
 *     method.
 * @param {SCOPE=} opt_scope Object in whose scope to call the
 *     listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE
 */
anychart.core.Base.prototype.unlistenSignals = function(listener, opt_scope) {
  return this.unlisten(anychart.enums.EventType.SIGNAL, listener, false, opt_scope);
};


//region --- New Consistency State Model
//region -- Properties
/**
 * @type {anychart.ConsistencyStorageMeta}
 */
anychart.core.Base.prototype.consistencyStorageMeta;


//endregion
//region -- Helpers
/**
 * State sum reducer.
 * @param {number} stateSum Last state.
 * @param {string} stateName State name.
 * @return {number} Calculated sum of all states (using bitwise OR)
 * @this {anychart.ConsistencyStoreMeta}
 */
anychart.core.Base.STATE_SUM_REDUCER = function(stateSum, stateName) {
  return (stateSum | (this.states[stateName] || 0));
};


/**
 * Ensures that store and store meta exists.
 * @param {!string} storeName Store name.
 * @private
 * @return {boolean}
 */
anychart.core.Base.prototype.storeExists_ = function(storeName) {
  return ((storeName in this.consistencyStorageMeta) && (storeName in this.consistencyStorage));
};


//endregion
//region -- Invalidate
/**
 * Invalidates state in store.
 * @example
 * A.prototype.foo = function() {
 *   this.invalidateState('mystore', 'mystate', 1);
 * }
 * // NB: A extends your very base class that supports states behaviour.
 *
 * @param {!string} storeName Name of the store.
 * @param {!string} stateName Name of the state.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if state have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.Base.prototype.invalidateState = function(storeName, stateName, opt_signal) {
  if (this.storeExists_(storeName)) {
    var storeMeta = this.consistencyStorageMeta[storeName];
    var state = storeMeta.states[stateName] || 0;
    var effective = state & ~this.consistencyStorage[storeName];
    this.consistencyStorage[storeName] |= effective;
    if (effective || this.needsForceSignalsDispatching())
      this.dispatchSignal(opt_signal || 0);
    return effective;
  }
  return 0;
};


/**
 * Invalidates states in store.
 * Code is similar to invalidateState despite of calculation of state-to-invalidate.
 * This method exists only to remove checking whether stateName(s) parameter is array or not.
 * @example
 * A.prototype.foo = function() {
 *   this.invalidateMultiState('mystore', ['mystate1', 'mystate2'], 1);
 * }
 * // NB: A extends your very base class that supports states behaviour.
 *
 * @param {!string} storeName Name of the store.
 * @param {!Array.<string>} stateNames Name of the states.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.Base.prototype.invalidateMultiState = function(storeName, stateNames, opt_signal) {
  if (this.storeExists_(storeName)) {
    var storeMeta = this.consistencyStorageMeta[storeName];
    var state = goog.array.reduce(stateNames, anychart.core.Base.STATE_SUM_REDUCER, 0, storeMeta);
    var effective = state & ~this.consistencyStorage[storeName];
    this.consistencyStorage[storeName] |= effective;
    if (effective || this.needsForceSignalsDispatching())
      this.dispatchSignal(opt_signal || 0);
    return effective;
  }
  return 0;
};


/**
 * Fully invalidates store.
 * @example
 * A.prototype.foo = function() {
 *   this.invalidateStore('mystore');
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName Name of the store.
 */
anychart.core.Base.prototype.invalidateStore = function(storeName) {
  if (this.storeExists_(storeName)) {
    this.consistencyStorage[storeName] |= this.consistencyStorageMeta[storeName].supportedStates;
  }
};


/**
 * Fully invalidates consistency storage.
 * You should probably do this in the very base class (e.g. anychart.core.Base);
 * @example
 * anychart.core.Base = function() {
 *   // constructor code here
 *   this.consistencyStorage = {};
 *   this.invalidateStorage();
 * }
 * If classes extending your very base class adds states support (through out anychart.consistency.supportStates method)
 * then this method called in a base class will automatically invalidate all states in all stores in a prototype chain.
 * Do remember that this very base class in a constructor should define consistencyStorage object to work with before
 * method call.
 */
anychart.core.Base.prototype.invalidateStorage = function() {
  for (var storeName in this.consistencyStorageMeta) {
    this.consistencyStorage[storeName] = this.consistencyStorageMeta[storeName].supportedStates;
  }
};


//endregion
//region -- Mark consistent
/**
 * Marks state as consistent in the store.
 * @example
 * A.prototype.foo = function() {
 *   this.markStateConsistent('mystore', 'mystate');
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName Name of the store.
 * @param {!string} stateName Name of the state.
 */
anychart.core.Base.prototype.markStateConsistent = function(storeName, stateName) {
  if (this.storeExists_(storeName)) {
    var state = this.consistencyStorageMeta[storeName].states[stateName] || 0;
    this.consistencyStorage[storeName] &= ~state;
  }
};


/**
 * Mark states as consistent in the store.
 * Code is similar to markStateConsistent despite of calculation of state-to-mark.
 * This method exists only to remove checking whether stateName(s) parameter is array or not.
 * @example
 * A.prototype.foo = function() {
 *   this.markMultiStateConsistent('mystore', ['mystate1', 'mystate2']);
 * }
 * // NB: A extends your very base class that supports states behaviour.
 *
 * @param {!string} storeName Name of the store.
 * @param {Array.<string>} stateNames Name of the states.
 */
anychart.core.Base.prototype.markMultiStateConsistent = function(storeName, stateNames) {
  if (this.storeExists_(storeName)) {
    var storeMeta = this.consistencyStorageMeta[storeName];
    var state = goog.array.reduce(stateNames, anychart.core.Base.STATE_SUM_REDUCER, 0, storeMeta);
    this.consistencyStorage[storeName] &= ~state;
  }
};


/**
 * Marks store as consistent.
 * @example
 * A.prototype.foo = function() {
 *   this.markStoreConsistent('mystore');
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName Name of the store.
 */
anychart.core.Base.prototype.markStoreConsistent = function(storeName) {
  if (storeName in this.consistencyStorage) {
    this.consistencyStorage[storeName] = 0;
  }
};


/**
 * Marks storage consistent.
 * @example
 * A.prototype.foo = function() {
 *   this.markStorageConsistent();
 * }
 * // NB: A extends your very base class that supports states behaviour.
 */
anychart.core.Base.prototype.markStorageConsistent = function() {
  for (var storeName in this.consistencyStorage) {
    this.consistencyStorage[storeName] = 0;
  }
};


//endregion
//region -- Is consistent
/**
 * Checks whether store consistent or not.
 * @example
 * A.prototype.foo = function() {
 *   this.isStoreConsistent();
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName
 * @return {boolean}
 */
anychart.core.Base.prototype.isStoreConsistent = function(storeName) {
  return (storeName in this.consistencyStorage) && !this.consistencyStorage[storeName];
};


/**
 * Checks whether storage consistent or not.
 * @return {boolean}
 */
anychart.core.Base.prototype.isStorageConsistent = function() {
  for (var storeName in this.consistencyStorage) {
    if (this.consistencyStorage[storeName])
      return false;
  }
  return true;
};


//endregion
//region -- Has invalidation state
/**
 * Checks if a store has a consistency state.
 * @example
 * A.prototype.foo = function() {
 *   if (this.hasStateInvalidation('mystore', 'mystate')) {
 *     // do something
 *     this.markStateConsistent('mystore', 'mystate');
 *   };
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName
 * @param {!string} stateName
 * @return {boolean}
 */
anychart.core.Base.prototype.hasStateInvalidation = function(storeName, stateName) {
  if (this.storeExists_(storeName)) {
    var storeMeta = this.consistencyStorageMeta[storeName];
    var state = storeMeta.states[stateName] || 0;
    return !!(this.consistencyStorage[storeName] & state);
  }
  return false;
};


/**
 * Checks if a store has a consistency states.
 * @example
 * A.prototype.foo = function() {
 *   if (this.hasMultiStateInvalidation('mystore', ['mystate1', 'mystate2'])) {
 *     // do something
 *     this.markMultiStateConsistent('mystore', 'mystate');
 *   };
 * }
 * // NB: A extends your very base class that supports states behaviour.
 * @param {!string} storeName
 * @param {!Array.<string>} stateNames
 * @return {boolean}
 */
anychart.core.Base.prototype.hasMultiStateInvalidation = function(storeName, stateNames) {
  if (this.storeExists_(storeName)) {
    var storeMeta = this.consistencyStorageMeta[storeName];
    var state = goog.array.reduce(stateNames, anychart.core.Base.STATE_SUM_REDUCER, 0, storeMeta);
    return !!(this.consistencyStorage[storeName] & state);
  }
  return false;
};


//endregion
//endregion


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.Base.prototype.invalidate = function(state, opt_signal) {
  state &= this.SUPPORTED_CONSISTENCY_STATES;
  var effective = state & ~this.consistency_;
  this.consistency_ |= effective;
  if (effective || this.needsForceSignalsDispatching())
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


/**
 * Clears consistency state.
 * @param {anychart.ConsistencyState|number} state State(s) to be cleared.
 */
anychart.core.Base.prototype.markConsistent = function(state) {
  this.consistency_ &= ~state;
};


/**
 * Checks if an element has any consistency state set.
 * @param {number=} opt_allowState
 * @return {boolean} True if it has it.
 */
anychart.core.Base.prototype.isConsistent = function(opt_allowState) {
  return !(this.consistency_ & ~(opt_allowState || 0)) && this.isStorageConsistent();
};


/**
 * Checks of an element has a consistency state(s).
 * @param {anychart.ConsistencyState|number} state State(s) to be checked.
 * @return {boolean} True if it has it.
 */
anychart.core.Base.prototype.hasInvalidationState = function(state) {
  return !!(this.consistency_ & state);
};


/**
 * Sends invalidation event to listeners.
 *
 * NOTE: YOU CAN ONLY SEND SIGNALS FROM SUPPORTED_SIGNALS MASK!
 *
 * @param {anychart.Signal|number} signal Invalidation signal(s).
 * @param {boolean=} opt_force Force to dispatch signal.
 * @param {(Object.<string, *>)=} opt_meta - Meta key-value config to be copied to signal event.
 */
anychart.core.Base.prototype.dispatchSignal = function(signal, opt_force, opt_meta) {
  signal &= this.SUPPORTED_SIGNALS;
  if (!signal) return;
  if (isNaN(this.suspendedDispatching) || !!opt_force) {
    // Hack to prevent Signal events bubbling. May be we should use all advantages of bubbling but not now.
    var parent = this.getParentEventTarget();
    this.setParentEventTarget(null);
    var ev = new anychart.SignalEvent(this, signal, opt_meta);
    this.dispatchEvent(ev);
    this.setParentEventTarget(parent);
  } else {
    this.suspendedDispatching |= signal;
  }
};


/**
 * Suspends dispatching of invalidation events. The dispatching can be resumed with or without cumulative dispatching
 * of all affected states.
 * @return {!anychart.core.Base} Itself for chaining.
 */
anychart.core.Base.prototype.suspendSignalsDispatching = function() {
  this.suspensionLevel++;
  if (isNaN(this.suspendedDispatching))
    this.suspendedDispatching = 0;
  return this;
};


/**
 * Resumes dispatching of invalidation events.
 * @param {boolean} doDispatchSuspendedSignals Whether to dispatch all signals that were to be dispatched while the
 *    suspend or not.
 * @return {!anychart.core.Base} Itself for chaining.
 */
anychart.core.Base.prototype.resumeSignalsDispatching = function(doDispatchSuspendedSignals) {
  if (isNaN(this.suspendedDispatching) || --this.suspensionLevel)
    return this;
  var eventsToDispatch = this.suspendedDispatching;
  this.suspendedDispatching = NaN;
  if (doDispatchSuspendedSignals && eventsToDispatch)
    this.dispatchSignal(eventsToDispatch);
  return this;
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.Base.prototype.serialize = function() {
  return {};
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {...*} var_args Arguments to setup the instance.
 * @return {anychart.core.Base} Returns itself for chaining.
 * @final
 */
anychart.core.Base.prototype.setup = function(var_args) {
  var args = [false];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return this.setupInternal.apply(this, args);
};


/**
 * Setups the element using passed configuration. It can handle JSON objects or special values that setups
 * instances in special ways. The first parameter states, whether the settings should be applied as obtained
 * from the theme, or from the user.
 * @param {boolean} isDefault
 * @param {...*} var_args
 * @return {anychart.core.Base}
 * @final
 */
anychart.core.Base.prototype.setupInternal = function(isDefault, var_args) {
  var mainArg = arguments[1];
  if (goog.isDef(mainArg)) {
    this.suspendSignalsDispatching();
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    if (!this.setupSpecial.apply(this, args) && goog.isObject(mainArg)) {
      this.setupByJSON(mainArg, isDefault);
    }
    this.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Setups current instance using passed JSON object.
 * @param {!Object} json .
 * @param {boolean=} opt_default Identifies that we should setup defaults.
 */
anychart.core.Base.prototype.setupByJSON = function(json, opt_default) {
};


/**
 * Special objects to setup current instance.
 * @param {boolean} isDefault
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.Base.prototype.setupSpecial = function(isDefault, var_args) {
  return false;
};


/**
 *
 * @param {...*} var_args
 * @return {Object|null}
 */
anychart.core.Base.prototype.resolveSpecialValue = function(var_args) {
  return null;
};


//region --- Theme Map Processing
//------------------------------------------------------------------------------
//
//  Theme Map Processing
//
//------------------------------------------------------------------------------
/**
 * Add theme or multiple themes to instance themes chain.
 *
 * Must be ordered from basic (less specific) theme to very specific.
 * Example: this.addThemes('chartDefault', 'pieDefault', 'myCustomPie')
 *
 * @param {...(Object|string)|Array.<Object|string>} var_args Themes as string names (keys) from defaultTheme object or json settings objects.
 *
 * @return {Array.<Object|string>}
 */
anychart.core.Base.prototype.addThemes = function(var_args) {
  if (goog.isArray(arguments[0])) {
    return this.addThemes.apply(this, arguments[0]);
  }

  var addedThemes = [];
  if (arguments.length) {
    for (var i = 0; i < arguments.length; i++) {
      var th = arguments[i];
      if (goog.isObject(th) || this.themes_.indexOf(/** @type {string} */(th)) == -1) {
        this.themes_.push(th);
        addedThemes.push(th);
      }
    }
    this.flattenThemes();
  }

  return addedThemes;
};


/**
 * Reset themes queue and drop themeSettings.
 *
 * @param {boolean=} opt_dropDefaultThemes true if need to drop default themes.
 * @return {anychart.core.Base} Self for chaining.
 */
anychart.core.Base.prototype.dropThemes = function(opt_dropDefaultThemes) {
  this.themes_.length = 0;
  this.themeSettings = {};
  if (opt_dropDefaultThemes)
    this.defaultThemes_.length = 0;
  return this;
};


/**
 * Add themes and save added theme names as default
 * @param {...(Object|string)|Array.<Object|string>} var_args
 */
anychart.core.Base.prototype.addDefaultThemes = function(var_args) {
  this.defaultThemes_ = this.addThemes(var_args);
};


/**
 * Reapply themes that are stored as defaults
 */
anychart.core.Base.prototype.restoreDefaultThemes = function() {
  if (this.defaultThemes_.length)
    this.addThemes.apply(this, this.defaultThemes_);
};


/**
 * Returns themes chain of current instance.
 *
 * @return {Array.<string|Object>}
 */
anychart.core.Base.prototype.getThemes = function() {
  return this.themes_.length ? this.themes_ : [this.themeSettings];
};


/**
 * Creates array with themes that are sub-themes of ancestor's themes.
 *
 * Example:
 *
 * Calling this.addExtendedThemes(['chart', 'pieFunnelBase', 'pie'], 'title')
 * will return such array of themes ['chart.title', 'pieFunnelBase.title', 'pie.title']
 *
 * This works with objects too:
 *
 * Calling this.createExtendedThemes([{'a': 'A', 'title': {'fontColor': 'red'}}, 'pie.legend'], 'title')
 * will add return such array of themes [{'fontColor': 'red'}, 'pie.legend.title']
 *
 * @param {Array.<string|Object>} sourceThemes Ancestor's themes to be used as base themes
 * @param {string} extendThemeName Name of the sub-theme
 * @return {Array.<string|Object>} Array of extended themes
 */
anychart.core.Base.prototype.createExtendedThemes = function(sourceThemes, extendThemeName) {
  var resultThemes = [];
  for (var i = 0; i < sourceThemes.length; i++) {
    var th = sourceThemes[i];
    if (th) {
      if (goog.isString(th)) {
        resultThemes.push(th + '.' + extendThemeName);
      } else if (goog.isDef(th[extendThemeName])) {
        var objClone = goog.object.clone(th[extendThemeName]);
        resultThemes.push(objClone);
      }
    }
  }

  return resultThemes;
};


/**
 * Creates simply merged (not recursively) json setting object
 * from instance themes chain and saves it as themeSettings
 */
anychart.core.Base.prototype.flattenThemes = function() {
  var flatTheme = this.themeSettings || {}; // this one is to preserve themeSettings['enabled'] = true from VisualBase constructor

  for (var i = 0; i < this.themes_.length; i++) {
    var theme = this.themes_[i];
    if (goog.isString(theme))
      flatTheme = anychart.getFlatTheme(theme, flatTheme, goog.bind(this.resolveSpecialValue, this));
    else if (goog.isObject(theme))
      goog.mixin(flatTheme, theme);
  }

  this.themeSettings = /** @type {!Object} */(flatTheme);
};


/**
 * Special getter for inner usage to get any child entity, that can be get by api getters.
 * Should be used instead of using api getters for performance purpose.
 *
 * Checks if entity instance is enabled by theme and should be created, creates instance by calling it's api getter and returns this instance.
 * Otherwise returns false.
 *
 * @param {string} getterName Name of the getter function
 * @param {boolean=} opt_ignoreEnabled Ignore enabled field
 * @param {Function=} opt_getterFunction
 * @return {boolean|anychart.core.Base|null}
 */
anychart.core.Base.prototype.getCreated = function(getterName, opt_ignoreEnabled, opt_getterFunction) {
  if (!goog.isDef(this.createdMap_[getterName]))
    this.createdMap_[getterName] = {themes: anychart.themes.DefaultThemes[getterName]};

  if (this.createdMap_[getterName].instance)
    return this.createdMap_[getterName].instance;

  if (goog.isDef(this.createdMap_[getterName].enabled))
    return this.createdMap_[getterName].enabled;

  // Check if entity is enabled by default theme
  var themes = this.createdMap_[getterName].themes ? goog.array.clone(this.createdMap_[getterName].themes) : [];
  var extendedThemes = this.createExtendedThemes(this.getThemes(), getterName);
  themes.push.apply(themes, extendedThemes);

  if (opt_ignoreEnabled) {
    this.setCreated(getterName, opt_getterFunction);
    return this.createdMap_[getterName].instance;

  } else {
    var baseThemes = anychart.getThemes();
    for (var i = themes.length; i--;) {
      var theme = themes[i];
      if (goog.isString(theme)) {
        var splitPath = theme.split('.');
        for (var t = baseThemes.length; t--;) {
          theme = baseThemes[t];
          for (var j = 0; j < splitPath.length; j++) {
            if (theme) {
              var part = splitPath[j];
              theme = theme[part];
            }
          }
          if (goog.isDef(theme)) {
            //goog.isNull condition covers cases like {'background': null}
            if (goog.isBoolean(theme) || goog.isNull(theme))
              theme = {'enabled': !!theme};

            if (goog.isDef(theme['enabled'])) {
              if (theme['enabled'])
                this.setCreated(getterName, opt_getterFunction);
              else
                this.createdMap_[getterName].enabled = false;
              return this.createdMap_[getterName].instance ? this.createdMap_[getterName].instance : null;
            }
          }
        }
      }
    }
  }
  return null;
};


/**
 * Creates instance of child entity by calling its api getter.
 *
 * @param {string} getterName Name of the getter function
 * @param {Function=} opt_getterFunction Getter function if getter is not exported
 */
anychart.core.Base.prototype.setCreated = function(getterName, opt_getterFunction) {
  this.createdMap_[getterName].enabled = true;

  opt_getterFunction = goog.isFunction(opt_getterFunction) ? opt_getterFunction : this[getterName];
  var instance = /** @type {anychart.core.Base} */(opt_getterFunction.call(this));

  if (!this.createdMap_[getterName].instance) {
    this.setupCreated(getterName, instance);
  }
};


/**
 * Setups created instance of child entity and updates this.createdMap_[getterName]
 *
 * @param {string} getterName Name of the getter that creates instance of child entity
 * @param {anychart.core.Base} instance Child entity instance
 */
anychart.core.Base.prototype.setupCreated = function(getterName, instance) {
  var extendedThemes = this.createExtendedThemes(this.getThemes(), getterName);
  instance.addThemes(extendedThemes);

  if (!goog.isDef(this.createdMap_[getterName]))
    this.createdMap_[getterName] = {};
  this.createdMap_[getterName].instance = instance;
};
//endregion


/**
 * Dispatches external event with a timeout to detach it from the other code execution frame.
 * @param {goog.events.EventLike} event Event object.
 */
anychart.core.Base.prototype.dispatchDetachedEvent = function(event) {
  anychart.utils.dispatchDetachedEvent(this, event);
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.suspendSignalsDispatching = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.suspendSignalsDispatching.apply(null, obj);
    else if (anychart.utils.instanceOf(obj, anychart.core.Base))
      (/** @type {anychart.core.Base} */(obj)).suspendSignalsDispatching();
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.resumeSignalsDispatchingTrue = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.resumeSignalsDispatchingTrue.apply(null, obj);
    else if (anychart.utils.instanceOf(obj, anychart.core.Base))
      (/** @type {anychart.core.Base} */(obj)).resumeSignalsDispatching(true);
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.resumeSignalsDispatchingFalse = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.resumeSignalsDispatchingFalse.apply(null, obj);
    else if (anychart.utils.instanceOf(obj, anychart.core.Base))
      (/** @type {anychart.core.Base} */(obj)).resumeSignalsDispatching(false);
  }
};



/**
 * Special event for changes in dirty states.
 * @param {anychart.core.Base} target Event target.
 * @param {number} invalidatedStates Changes effectively happened with the target.
 * @param {Object=} opt_meta - Metadata to attach to signal event.
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.SignalEvent = function(target, invalidatedStates, opt_meta) {
  anychart.SignalEvent.base(this, 'constructor', anychart.enums.EventType.SIGNAL, target);

  /**
   * Aspects of the object that were hasSignal.
   * @type {number}
   */
  this.signals = invalidatedStates;

  if (opt_meta)
    goog.mixin(this, opt_meta);
};
goog.inherits(anychart.SignalEvent, goog.events.Event);


/**
 * Checks if an element has consistency state that was sent.
 * @param {anychart.Signal|number} state State(s) to be checked.
 * @return {boolean} True if element has it (one of it).
 */
anychart.SignalEvent.prototype.hasSignal = function(state) {
  return !!(this.signals & state);
};


/**
 * If target needs redraw.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsRedraw = function() {
  return this.hasSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * If target signalled bounds change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetBoundsChanged = function() {
  return this.hasSignal(anychart.Signal.BOUNDS_CHANGED);
};


/**
 * If target signalled data change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetDataChanged = function() {
  return this.hasSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * If target signalled meta change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetMetaChanged = function() {
  return this.hasSignal(anychart.Signal.META_CHANGED);
};


/**
 * If target needs to be reapplied.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsReapplication = function() {
  return this.hasSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * If target needs to be recalculated.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsRecalculation = function() {
  return this.hasSignal(anychart.Signal.NEEDS_RECALCULATION);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
anychart.core.Base.prototype.dispatchEvent = function(e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else if ('type' in e) {
    e.type = String(e.type).toLowerCase();
  }
  return anychart.core.Base.base(this, 'dispatchEvent', e);
};


/**
 * Adds an event listener to an implementing object.<br/>
 * The listener can be added to an object once, and if it is added one more time,
 * its key will be returned.<br/>
 * <b>Note</b> Notice that if the existing listener is one-off (added
 * using listenOnce), it will cease to be such after calling the listen() method.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *    counter++;
 *    title.text('You clicked ' + counter + ' times. Click again.');
 *  });
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.core.Base.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Adds an event listener to an implementing object.<br/>
 * <b>After the event is called, its handler will be deleted.</b><br>
 * If the event handler being added already exists, listenOnce will do nothing. <br/>
 * <b>Note</b> In particular, if the handler is already registered using listen(), listenOnce()
 * <b>will not</b> make it one-off. Similarly, if a one-off listener already exists,
 * listenOnce will not change it (it wil remain one-off).
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *    counter++;
 *    title.text('You can\'t click anymore.');
 *  });
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.core.Base.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes a listener added using listen() or listenOnce() methods.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series. You have 3 clicks.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, customListener);
 * var counter = 3;
 * function customListener(e){
 *     counter--;
 *     title.text('Click on line series. You have ' + counter + ' clicks.');
 *     if (!counter) {
 *         line.unlisten(anychart.enums.EventType.POINT_CLICK, customListener);
 *         title.text('You have no more clicks');
 *     }
 * }
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.core.Base.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes an event listener which was added with listen() by the key returned by listen() or listenOnce().
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series. You have 3 clicks.');
 * var counter = 0;
 * var listenKey = line.listen(anychart.enums.EventType.POINT_CLICK, customListener);
 * var counter = 3;
 * function customListener(e){
 *     counter--;
 *     title.text('Click on line series. You have ' + counter + ' clicks.');
 *     if (!counter) {
 *         line.unlistenByKey(listenKey);
 *         title.text('You have no more clicks');
 *     }
 * }
 * @param {!goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.core.Base.prototype.unlistenByKey = function(key) {
  return anychart.core.Base.base(this, 'unlistenByKey', key);
};


/**
 * Removes all listeners from an object. You can also optionally remove listeners of some particular type.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('MouseOver the title and click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_MOUSE_OUT, function(e){
 *   title.fontColor('green');
 * });
 * line.listen(anychart.enums.EventType.POINT_MOUSE_OVER, function(e){
 *   title.fontColor('red');
 * });
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *   title.text('You can\'t click here anymore.').fontColor('black');
 *   line.removeAllListeners();
 * });
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
anychart.core.Base.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return anychart.core.Base.base(this, 'removeAllListeners', opt_type);
};


//exports
(function() {
  var proto = anychart.core.Base.prototype;
  proto['listen'] = proto.listen;//doc|ex
  proto['listenOnce'] = proto.listenOnce;//doc|ex
  proto['unlisten'] = proto.unlisten;//doc|ex
  proto['unlistenByKey'] = proto.unlistenByKey;//doc|ex
  proto['removeAllListeners'] = proto.removeAllListeners;//doc|ex
  proto['dispose'] = proto.dispose;
  proto['isConsistent'] = proto.isConsistent; // Added for debug purposes! Do not add to API and docs.
  proto = anychart.SignalEvent.prototype;
  proto['targetNeedsRedraw'] = proto.targetNeedsRedraw;//doc
  proto['targetBoundsChanged'] = proto.targetBoundsChanged;//doc
  proto['targetDataChanged'] = proto.targetDataChanged;//doc
  proto['targetMetaChanged'] = proto.targetMetaChanged;//doc
  proto['targetNeedsReapplication'] = proto.targetNeedsReapplication;//doc
  proto['targetNeedsRecalculation'] = proto.targetNeedsRecalculation;//doc
  goog.exportSymbol('anychart.PointState.NORMAL', anychart.PointState.NORMAL);
  goog.exportSymbol('anychart.PointState.HOVER', anychart.PointState.HOVER);
  goog.exportSymbol('anychart.PointState.SELECT', anychart.PointState.SELECT);
})();
