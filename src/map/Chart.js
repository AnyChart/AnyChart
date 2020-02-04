//region --- Requiring and Providing
goog.provide('anychart.mapModule.Chart');

goog.require('acgraph.events.MouseWheelHandler');
goog.require('acgraph.vector.UnmanagedLayer');
goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.colorScalesModule.Linear');
goog.require('anychart.colorScalesModule.Ordinal');
goog.require('anychart.colorScalesModule.ui.ColorRange');
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
// goog.require('anychart.mapModule.elements.Axis');
goog.require('anychart.core.map.projections');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Animation');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.mapModule.Interactivity');
goog.require('anychart.mapModule.Point');
goog.require('anychart.mapModule.Series');
goog.require('anychart.mapModule.animation.Controller');
goog.require('anychart.mapModule.animation.Crs');
goog.require('anychart.mapModule.animation.Move');
goog.require('anychart.mapModule.animation.Zoom');
goog.require('anychart.mapModule.elements.AxisSettings');
goog.require('anychart.mapModule.elements.Callout');
goog.require('anychart.mapModule.elements.Crosshair');
goog.require('anychart.mapModule.elements.GridSettings');
goog.require('anychart.mapModule.geom');
goog.require('anychart.mapModule.projections.TwinProjection');
goog.require('anychart.mapModule.scales.Geo');
goog.require('anychart.mapModule.utils.BinaryHeap');
goog.require('anychart.mapModule.utils.GeoJSONParser');
goog.require('anychart.mapModule.utils.GeoSVGParser');
goog.require('anychart.mapModule.utils.TopoJSONParser');
goog.require('anychart.mapModule.utils.UnboundRegionsSettings');
goog.require('anychart.math.Rect');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Coordinate');
goog.require('goog.ui.KeyboardShortcutHandler');
//endregion



/**
 * AnyChart Map class.
 * @implements {anychart.core.IPlot}
 * @implements {anychart.core.IChart}
 * @extends {anychart.core.ChartWithSeries}
 * @constructor
 */
anychart.mapModule.Chart = function() {
  anychart.mapModule.Chart.base(this, 'constructor');

  this.addThemes('map');

  /**
   * Custom crs passed to crs() method.
   * @type {Object|Function|anychart.enums.MapProjections|string}
   * @private
   */
  this.crs_ = null;

  /**
   * Current crs of current view.
   * @type {?string}
   * @private
   */
  this.currentCrs_ = null;

  /**
   * Source geo data.
   * @type {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>}
   */
  this.internalSourceGeoData = [];

  /**
   * Internal represent of geo data.
   * @type {?Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>}
   */
  this.internalGeoData = null;

  /**
   *
   * @type {Array.<acgraph.vector.Element>}
   */
  this.mapPaths = [];

  /**
   * Geo data settings.
   * @type {Node|string|Object|Element}
   * @private
   */
  this.geoData_ = null;

  /**
   * String path to geo json var
   * @type {?string}
   * @private
   */
  this.geoDataStringName_ = null;

  /**
   * Max stroke thickness of series/unbound regions.
   * @type {number}
   * @private
   */
  this.maxStrokeThickness_ = 0;

  /**
   * @type {boolean}
   */
  this.isDesktop = true;

  this.setOption('zoomFactor', 1.3);

  /**
   * Zoom animation duration.
   * @type {number}
   */
  this.zoomDuration = NaN;

  /**
   * Array of animations timers.
   * @type {Array.<number>}
   */
  this.timers = [];

  /**
   * Zoom animation.
   * @type {anychart.mapModule.animation.Zoom|anychart.mapModule.animation.Move}
   */
  this.zoomAnimation;

  /**
   * @type {!anychart.mapModule.animation.Controller}
   */
  this.mapAnimationController = new anychart.mapModule.animation.Controller(this);

  goog.events.listen(this, anychart.enums.EventType.ANIMATION_START, function(e) {
    this.zoomingInProgress = true;
  }, false, this);

  goog.events.listen(this, anychart.enums.EventType.ANIMATION_END, function(e) {
    this.zoomingInProgress = false;
    var series;
    for (var i = this.seriesList.length; i--;) {
      series = this.seriesList[i];
      if (series.needRedrawOnZoomOrMove()) {
        series.mapTx = this.getMapLayer().getFullTransformation().clone();
        series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
        series.draw();
      }
    }

    this.applyLabelsOverlapState_ = true;
    if (!this.noOneLabelDrew)
      this.applyLabelsOverlapState();
  }, false, this);

  /**
   * Whether zoom limit.
   * @type {boolean}
   */
  this.unlimitedZoom = false;

  /**
   * Aaync init mouse and keyboard interactivity for cases when map have no stage on draw moment.
   * @type {!Function}
   * @private
   */
  this.initControlsInteractivity_ = goog.bind(this.controlsInteractivity_, this);

  /**
   * Test function for catching 'click' (tap) event on touch screen devices.
   * @type {!Function}
   */
  this.tapTestFunc = goog.bind(function() {
    if (this.tap)
      this.onMouseDown(this.originEvent);

    this.eventsHandler.unlisten(this, [goog.events.EventType.POINTERDOWN, acgraph.events.EventType.TOUCHSTART], this.testTouchStartHandler, false, this);
    this.testTouchStartHandler = null;
    this.eventsHandler.unlisten(this, [goog.events.EventType.POINTERMOVE, acgraph.events.EventType.TOUCHMOVE], this.testTouchMoveHandler, false, this);
    this.testTouchMoveHandler = null;

    this.tapTesting = false;
  }, this);

  /**
   * Test function for catching 'drag' event.
   * @type {!Function}
   */
  this.dragTestFunc = goog.bind(function() {
    if (!this.itWasDrag) {
      this.onMouseDown(this.originEvent);
    }

    this.eventsHandler.unlisten(this, [goog.events.EventType.POINTERMOVE, acgraph.events.EventType.MOUSEMOVE], this.testDragHandler, false, this);
    this.testDragHandler = null;

    this.mouseMoveTesting = false;
  }, this);

  /**
   * Wrapper for mouseDown handler for async usage.
   * @type {!Function}
   */
  this.acyncMouseDown = goog.bind(this.onMouseDown, this);

  /**
   * Current scene.
   * @type {anychart.mapModule.Chart}
   */
  this.currentScene = null;

  /**
   * Root scene.
   * @type {anychart.mapModule.Chart}
   */
  this.rootScene = null;

  /**
   * Bread crumbs path.
   * @type {Array.<anychart.mapModule.Point>}
   */
  this.currentBreadcrumbsPath = [];

  /**
   * Geo data parser.
   * @type {anychart.mapModule.utils.GeoSVGParser|anychart.mapModule.utils.GeoJSONParser|anychart.mapModule.utils.TopoJSONParser}
   */
  this.parser = null;

  /**
   * Array of defined callout elements.
   * @type {Array.<anychart.mapModule.elements.Callout>}
   * @private
   */
  this.callouts_ = [];

  this.unboundRegions(this.themeSettings['unboundRegions'] || anychart.enums.MapUnboundRegionsMode.AS_IS);

  this.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CHOROPLETH);

  this.eventsHandler.listen(this, [goog.events.EventType.POINTERDOWN, acgraph.events.EventType.TOUCHSTART], this.tapHandler);

  /**
   * @this {anychart.mapModule.Chart}
   */
  function selectMarqueeFillBeforeInvalidation() {
    if (this.inPolygon() && this.ipPath_) {
      this.ipPath_.fill(/** @type {acgraph.vector.Fill} */ (this.getOption('selectPolygonMarqueeFill')));
    }
  }

  /**
   * @this {anychart.mapModule.Chart}
   */
  function selectMarqueeStrokeBeforeInvalidation() {
    if (this.inPolygon() && this.ipPath_) {
      this.ipPath_.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('selectPolygonMarqueeStroke')));
    }
  }

  /**
   * @this {anychart.mapModule.Chart}
   */
  function selectMarqueeMarkerBeforeInvalidation() {
    if (this.inPolygon() && this.ipCloseCircle_) {
      var circleConfig = this.getOption('selectPolygonMarqueeMarker') || {};
      var circleFill = acgraph.vector.normalizeFill(circleConfig['fill']);
      var circleStroke = acgraph.vector.normalizeStroke(circleConfig['stroke']);
      var circleRadius = circleConfig['radius'] || 15;
      this.ipCloseCircle_.stroke(circleStroke);
      this.ipCloseCircle_.fill(circleFill);
      this.ipCloseDelta_ = circleRadius;
    }
  }


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['geoIdField', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.MAP_GEO_DATA_INDEX, anychart.Signal.NEEDS_REDRAW],
    ['overlapMode', anychart.ConsistencyState.MAP_LABELS, anychart.Signal.NEEDS_REDRAW],
    ['minZoomLevel', 0, 0],
    ['maxZoomLevel', 0, 0],
    ['selectPolygonMarqueeFill', 0, 0, 0, selectMarqueeFillBeforeInvalidation],
    ['selectPolygonMarqueeStroke', 0, 0, 0, selectMarqueeStrokeBeforeInvalidation],
    ['selectPolygonMarqueeMarker', 0, 0, 0, selectMarqueeMarkerBeforeInvalidation]
    //['zoomFactor', 0, 0] uncomment when it will be needed
  ]);
};
goog.inherits(anychart.mapModule.Chart, anychart.core.ChartWithSeries);


/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.mapModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);

  res[anychart.enums.MapSeriesType.CONNECTOR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CONNECTOR,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathMapConnectorEventHandlerConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities
  };
  res[anychart.enums.MapSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MAP_MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: (
        anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
        anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0)
  };
  res[anychart.enums.MapSeriesType.BUBBLE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MAP_BUBBLE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.circleFillStrokeConfig,
      anychart.core.shapeManagers.circleHatchConfig,
      anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
      anychart.core.shapeManagers.circleNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.MapSeriesType.CHOROPLETH] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CHOROPLETH,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.foreignPathFillConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.mapModule.Chart, anychart.mapModule.Chart.prototype.seriesConfig);


//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'geoIdField', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'overlapMode', anychart.enums.normalizeLabelsOverlapMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minZoomLevel', anychart.utils.toNumber],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxZoomLevel', anychart.utils.toNumber],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'selectPolygonMarqueeStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'selectPolygonMarqueeFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectPolygonMarqueeMarker', anychart.core.settings.asIsNormalizer]
    //TODO(AntonKagakin): Uncomment descriptor when it will be needed
    // [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomFactor', anychart.core.settings.asIsNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.Chart, anychart.mapModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- Class constants
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.mapModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MAP_LABELS |
    anychart.ConsistencyState.MAP_SCALE |
    anychart.ConsistencyState.MAP_GEO_DATA |
    anychart.ConsistencyState.MAP_GEO_DATA_INDEX |
    anychart.ConsistencyState.MAP_COLOR_RANGE |
    anychart.ConsistencyState.MAP_CALLOUT |
    anychart.ConsistencyState.MAP_MOVE |
    anychart.ConsistencyState.MAP_ZOOM |
    anychart.ConsistencyState.MAP_AXES |
    anychart.ConsistencyState.MAP_GRIDS |
    anychart.ConsistencyState.MAP_CROSSHAIR;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_OVERLAP;


/**
 * Animation and other timings.
 * @enum {number}
 */
anychart.mapModule.Chart.TIMINGS = {
  ALL_ANIMATION_FINISHED_DELAY: 100,
  DEFAULT_ZOOM_DURATION: 200,
  ZOOM_TO_FEATURE_DURATION: 500,
  ZOOM_TO_HOME_DURATION: 300,
  TEST_DRAG_DELAY: 70
};


/**
 * @type {Object}
 */
anychart.mapModule.Chart.DEFAULT_TX = {
  'default': {
    'crs': 'wsg84',
    'scale': 1
  }
};


/**
 * Root scene name.
 * @type {string}
 */
anychart.mapModule.Chart.ROOT_SCENE_NAME = 'root';


/**
 * Map z-index in chart root layer.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_MAP = 10;


/**
 * Choropleth series z-index in chart root layer.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_CHOROPLETH_SERIES = 15;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_AXIS = 20;


/**
 * Color range z-index in chart root layer.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_COLOR_RANGE = 50;


/**
 * Callout z-index in chart root layer.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_CALLOUT = 60;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//endregion
//region --- Class properties
/**
 * Map layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.mapModule.Chart.prototype.mapLayer_;


/**
 * Data layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.mapModule.Chart.prototype.dataLayer_;


/**
 * Geo scale.
 * @type {anychart.mapModule.scales.Geo}
 * @private
 */
anychart.mapModule.Chart.prototype.scale_;


/**
 * Offset focus point x coordinate.
 * @type {number}
 * @private
 */
anychart.mapModule.Chart.prototype.offsetX_ = 0;


/**
 * Offset focus point y coordinate.
 * @type {number}
 * @private
 */
anychart.mapModule.Chart.prototype.offsetY_ = 0;


/**
 * Current zoom increse.
 * @type {number}
 */
anychart.mapModule.Chart.prototype.zoomInc = 1;


/**
 * Full zoom.
 * @type {number}
 */
anychart.mapModule.Chart.prototype.fullZoom = 1;


/**
 * Map transformations object.
 * @type {Object.<string, Object.<{
 *    scale: number,
 *    crs: (Object|string|Function),
 *    srcCrs: (Object|string|Function),
 *    currProj: anychart.mapModule.projections.Base,
 *    srcProj: anychart.mapModule.projections.Base,
 *    src: string,
 *    xoffset: number,
 *    yoffset: number,
 *    heatZone: Object.<{left: number, top: number, width: number, height: number}>
 *    }>>}
 */
anychart.mapModule.Chart.prototype.mapTX = null;


/**
 * @type {anychart.mapModule.Interactivity}
 * @private
 */
anychart.mapModule.Chart.prototype.interactivity_;


//endregion
//region --- Infrastructure
/** @inheritDoc */
anychart.mapModule.Chart.prototype.getVersionHistoryLink = function() {
  return 'https://anychart.com/products/anymap/history';
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.getType = function() {
  return anychart.enums.MapTypes.MAP;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.getXAxisByIndex = function(index) {
  return this.axes().getItems()[index];
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.getYAxisByIndex = function(index) {
  return this.axes().getItems()[index];
};


//endregion
//region --- Interactivity
/**
 * Controls interactivity.
 * @private
 */
anychart.mapModule.Chart.prototype.controlsInteractivity_ = function() {
  if (this.isDisposed())
    return;
  var cnt = this.container();
  var stage = cnt ? cnt.getStage() : null;
  if (stage && this.getPlotBounds()) {
    var container = stage.getDomWrapper();

    if (goog.userAgent.IE)
      container.style['-ms-touch-action'] = 'none';

    if (!anychart.mapTextarea) {
      anychart.mapTextarea = goog.dom.createDom('textarea');
      anychart.mapTextarea.setAttribute('readonly', 'readonly');
      goog.style.setStyle(anychart.mapTextarea, {
        'border': 0,
        'clip': 'rect(0 0 0 0)',
        'height': '1px',
        'margin': '-1px',
        'overflow': 'hidden',
        'padding': '0',
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'width': '1px'
      });
      goog.dom.appendChild(document['body'], anychart.mapTextarea);
      goog.events.listen(anychart.mapTextarea, [goog.events.EventType.FOCUS, goog.events.EventType.FOCUSIN, goog.events.EventType.SELECT], function(e) {
        e.preventDefault();
      });
    }

    this.listen('pointsselect', function(e) {
      anychart.mapTextarea.innerHTML = this.interactivity().getOption('copyFormat').call(e, e);
      anychart.mapTextarea.select();
    }, false, this);

    this.shortcutHandler = new goog.ui.KeyboardShortcutHandler(anychart.mapTextarea);
    var META = goog.ui.KeyboardShortcutHandler.Modifiers.META;
    var CTRL = goog.ui.KeyboardShortcutHandler.Modifiers.CTRL;

    this.shortcutHandler.setAlwaysPreventDefault(true);
    this.shortcutHandler.setAlwaysStopPropagation(true);
    this.shortcutHandler.setAllShortcutsAreGlobal(true);
    this.shortcutHandler.setModifierShortcutsAreGlobal(true);

    this.shortcutHandler.registerShortcut('zoom_in', goog.events.KeyCodes.EQUALS, META);
    this.shortcutHandler.registerShortcut('zoom_out', goog.events.KeyCodes.DASH, META);
    this.shortcutHandler.registerShortcut('zoom_full_out', goog.events.KeyCodes.ZERO, META);

    this.shortcutHandler.registerShortcut('zoom_in', goog.events.KeyCodes.EQUALS, CTRL);
    this.shortcutHandler.registerShortcut('zoom_out', goog.events.KeyCodes.DASH, CTRL);
    this.shortcutHandler.registerShortcut('zoom_full_out', goog.events.KeyCodes.ZERO, CTRL);

    this.shortcutHandler.registerShortcut('zoom_in', goog.events.KeyCodes.NUM_PLUS, META);
    this.shortcutHandler.registerShortcut('zoom_out', goog.events.KeyCodes.NUM_MINUS, META);
    this.shortcutHandler.registerShortcut('zoom_full_out', goog.events.KeyCodes.NUM_ZERO, META);

    this.shortcutHandler.registerShortcut('zoom_in', goog.events.KeyCodes.NUM_PLUS, CTRL);
    this.shortcutHandler.registerShortcut('zoom_out', goog.events.KeyCodes.NUM_MINUS, CTRL);
    this.shortcutHandler.registerShortcut('zoom_full_out', goog.events.KeyCodes.NUM_ZERO, CTRL);

    this.shortcutHandler.registerShortcut('move_left', goog.events.KeyCodes.LEFT);
    this.shortcutHandler.registerShortcut('move_right', goog.events.KeyCodes.RIGHT);
    this.shortcutHandler.registerShortcut('move_up', goog.events.KeyCodes.UP);
    this.shortcutHandler.registerShortcut('move_down', goog.events.KeyCodes.DOWN);

    this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.BACKSPACE);
    this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.ESC);

    var minZoomLevel = /** @type {number} */ (this.getOption('minZoomLevel'));
    var maxZoomLevel = /** @type {number} */ (this.getOption('maxZoomLevel'));

    this.shortcutHandler.listen(goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, function(e) {
      if (!this.interactivity_.getOption('keyboardZoomAndMove'))
        return;

      if (anychart.mapTextarea.chart && anychart.mapTextarea.chart != this)
        return;

      var dx = 0, dy = 0;
      this.isDesktop = true;
      this.zoomDuration = 100;
      var scene = anychart.mapTextarea.chart.getCurrentScene();

      switch (e.identifier) {
        case 'zoom_in':
          scene.zoomIn();
          break;
        case 'zoom_out':
          scene.zoomOut();
          break;
        case 'zoom_full_out':
          scene.fitAll();
          break;
        case 'move_up':
          dx = 0;
          dy = 10 * scene.getZoomLevel();
          scene.move(dx, dy);
          break;
        case 'move_left':
          dx = 10 * scene.getZoomLevel();
          dy = 0;
          scene.move(dx, dy);
          break;
        case 'move_down':
          dx = 0;
          dy = -10 * scene.getZoomLevel();
          scene.move(dx, dy);
          break;
        case 'move_right':
          dx = -10 * scene.getZoomLevel();
          dy = 0;
          scene.move(dx, dy);
          break;
        case 'drill_up':
          var tx = scene.getMapLayer().getSelfTransformation();
          var isDefaultPos = anychart.math.roughlyEqual(scene.getZoomLevel(), minZoomLevel) &&
              anychart.math.roughlyEqual(tx.getTranslateX(), 0) &&
              anychart.math.roughlyEqual(tx.getTranslateY(), 0);

          if (isDefaultPos) {
            scene.getMapLayer().setTransformationMatrix(minZoomLevel, 0, 0, minZoomLevel, 0, 0);
            this.drillUp();
          } else {
            if (!this.drillingInAction) {
              if (scene.zoomAnimation)
                scene.zoomAnimation.stop();
              this.doAfterAnimation(scene, function() {
                this.goingToHome = true;
                this.zoomDuration = anychart.mapModule.Chart.TIMINGS.ZOOM_TO_HOME_DURATION;
                this.zoomTo(minZoomLevel);

                this.doAfterAnimation(this, function() {
                  this.goingToHome = false;
                });
              });
            }
          }
          break;
      }
    }, false, this);

    this.isPreventDefault = goog.bind(function(e) {
      if (!this.container())
        return false;

      var containerPosition = this.container().getStage().getClientPosition();
      var be = e.getBrowserEvent ? e.getBrowserEvent() : e;

      var scene = this.getCurrentScene();
      var zoomFactor = goog.math.clamp(1 - be.deltaY / 120, 0.7, 2);
      var maxZoomFactor = maxZoomLevel;
      var minZoomFactor = minZoomLevel;
      var isMouseWheel = scene.interactivity().getOption('zoomOnMouseWheel');
      var bounds = this.getPlotBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      return (insideBounds || !bounds) && (isMouseWheel && !((zoomFactor > 1 && scene.fullZoom >= maxZoomFactor) || (zoomFactor < 1 && scene.fullZoom <= minZoomFactor)));
    }, this);

    this.mouseWheelHandler = new acgraph.events.MouseWheelHandler(
        container,
        false,
        this.isPreventDefault);

    this.mouseWheelHandler.listen('mousewheel', function(e) {
      var scene = this.getCurrentScene();
      var mapLayer = scene.getMapLayer();

      this.isDesktop = true;
      var containerPosition = this.container().getStage().getClientPosition();
      var bounds = this.getPlotBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      if (this.interactivity_.getOption('zoomOnMouseWheel') && insideBounds) {
        if (scene.goingToHome) return;
        var zoomFactor = goog.math.clamp(1 - e.deltaY / 120, 0.7, 2);

        this.prevZoomState_ = this.zoomState_;
        this.zoomState_ = zoomFactor > 1 ? true : zoomFactor == 1 ? !this.prevZoomState_ : false;

        if (this.prevZoomState_ != this.zoomState_) {
          if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
            scene.zoomAnimation.stop();
          }
        }

        var curZoom = scene.getZoomLevel();
        if (zoomFactor < 1 && anychart.math.roughlyEqual(curZoom, minZoomLevel) && !mapLayer.getSelfTransformation().isIdentity()) {
          mapLayer.setTransformationMatrix(minZoomLevel, 0, 0, minZoomLevel, 0, 0);
          scene.fullZoom = minZoomLevel;
          scene.goingToHome = false;
          if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
            scene.zoomAnimation.stop();
          }

          scene.scale().setMapZoom(minZoomLevel);
          scene.scale().setOffsetFocusPoint(0, 0);

          scene.updateSeriesOnZoomOrMove();
        } else if ((zoomFactor >= 1 && (anychart.math.roughlyEqual(curZoom, maxZoomLevel) || curZoom > maxZoomLevel)) ||
            (zoomFactor <= 1 && (anychart.math.roughlyEqual(curZoom, minZoomLevel) || curZoom < minZoomLevel))) {
          return;
        } else {
          var x = e.clientX - containerPosition.x;
          var y = e.clientY - containerPosition.y;

          scene.zoom(zoomFactor, x, y, 20);
        }
      }
    }, false, this);


    this.mapClickHandler_ = function(e) {
      if (!this.container() || !this.container().getStage())
        return;

      var containerPosition = this.container().getStage().getClientPosition();
      var bounds = this.getPixelBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      if (insideBounds && this.isDesktop) {
        var scrollEl = goog.dom.getDomHelper(anychart.mapTextarea).getDocumentScrollElement();
        var scrollX = scrollEl.scrollLeft;
        var scrollY = scrollEl.scrollTop;

        anychart.mapTextarea.select();
        anychart.mapTextarea.chart = this;
        if (goog.userAgent.GECKO) {
          var newScrollX = scrollEl.scrollLeft;
          var newScrollY = scrollEl.scrollTop;
          setTimeout(function() {
            if (scrollEl.scrollLeft == newScrollX && scrollEl.scrollTop == newScrollY)
              anychart.window.scrollTo(scrollX, scrollY);
          }, 0);
        } else {
          anychart.window.scrollTo(scrollX, scrollY);
        }
      }
    };
    this.mapDbClickHandler_ = function(e) {
      if (this.interactivity_.getOption('zoomOnDoubleClick')) {
        var scene = this.getCurrentScene();
        var containerPosition = this.container().getStage().getClientPosition();
        var bounds = scene.getPlotBounds();

        var insideBounds = bounds &&
            e.clientX >= bounds.left + containerPosition.x &&
            e.clientX <= bounds.left + containerPosition.x + bounds.width &&
            e.clientY >= bounds.top + containerPosition.y &&
            e.clientY <= bounds.top + containerPosition.y + bounds.height;

        if (insideBounds) {
          this.isDesktop = true;
          var zoomFactor = /** @type {number} */ (this.getOption('zoomFactor'));
          var cx = e.clientX;
          var cy = e.clientY;

          this.zoomDuration = 100;
          scene.zoom(zoomFactor, cx, cy);
        }
      }
    };
    this.mapTouchEndHandler_ = function(e) {
      this.touchDist = 0;
      this.endDrag();
      goog.events.unlisten(document, [goog.events.EventType.POINTERMOVE, goog.events.EventType.TOUCHMOVE], this.touchMoveHandler, false, this);
    };

    this.mapMouseLeaveHandler_ = function(e) {
      if (!this.drag) {
        goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, false, this);
        goog.events.unlisten(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, false, this);
      }
    };

    goog.events.listen(this.legend(), [anychart.enums.EventType.DRAG, anychart.enums.EventType.DRAG_START], function(e) {
      this.legendDragInProcess = true;
    }, false, this);
    goog.events.listen(this.legend(), anychart.enums.EventType.DRAG_END, function(e) {
      this.legendDragInProcess = false;
    }, false, this);

    goog.events.listen(container, goog.events.EventType.CLICK, this.mapClickHandler_, false, this);

    goog.events.listen(container, goog.events.EventType.DBLCLICK, this.mapDbClickHandler_, false, this);

    this.touchDist = 0;
    goog.events.listen(container, [goog.events.EventType.POINTERUP, goog.events.EventType.TOUCHEND], this.mapTouchEndHandler_, false, this);

    var startX, startY;
    this.listen(goog.events.EventType.MOUSEDOWN, function(e) {
      var containerPosition = this.container().getStage().getClientPosition();
      var bounds = this.getPlotBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      if (insideBounds) {
        this.isDesktop = true;
        startX = e.clientX;
        startY = e.clientY;

        goog.events.listen(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
        goog.events.listen(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, true, this);
      }
    }, false, this);
    this.mouseMoveHandler = function(e) {
      var scene = this.getCurrentScene();

      if (this.interactivity_.getOption('drag') && scene.getZoomLevel() != 1 && !this.legendDragInProcess) {
        scene.startDrag();

        scene.move(e.clientX - startX, e.clientY - startY);

        this.dispatchEvent(anychart.enums.EventType.DRAG);

        startX = e.clientX;
        startY = e.clientY;
      }
    };
    this.mouseUpHandler = function(e) {
      if (this.itWasDrag) {
        this.endDrag();

        for (var i = this.seriesList.length; i--;) {
          var series = /** @type {anychart.mapModule.Series} */(this.seriesList[i]);
          if (series.needRedrawOnZoomOrMove()) {
            series.mapTx = this.getMapLayer().getFullTransformation().clone();
            series.invalidate(anychart.ConsistencyState.SERIES_POINTS, anychart.Signal.NEEDS_REDRAW);
            series.updateOnZoomOrMove();
          }
        }
      }

      goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
      goog.events.unlisten(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, true, this);
    };

    goog.events.listen(container, goog.events.EventType.MOUSELEAVE, this.mapMouseLeaveHandler_, false, this);
  } else {
    setTimeout(this.initControlsInteractivity_, 100);
  }
};


/**
 * Start drag.
 */
anychart.mapModule.Chart.prototype.startDrag = function() {
  if (!this.drag) {
    this.drag = true;
    this.dispatchEvent(anychart.enums.EventType.DRAG_START);
  }
};


/**
 * Drag end.
 */
anychart.mapModule.Chart.prototype.endDrag = function() {
  if (this.drag) {
    this.drag = false;

    if (this.interactivity_.getOption('drag') &&
        this.getCurrentScene().getZoomLevel() != 1 &&
        !this.legendDragInProcess) {
      this.dispatchEvent(anychart.enums.EventType.DRAG_END);
    }
  }
};


/**
 * Handler for specified touch event - tap.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.mapModule.Chart.prototype.tapHandler = function(event) {
  // showing tooltip like on mouseOver
  this.handleMouseOverAndMove(event);
  this.isDesktop = false;
  var containerPosition = this.container().getStage().getClientPosition();
  var bounds = this.getPlotBounds();

  var insideBounds = bounds &&
      event.clientX >= bounds.left + containerPosition.x &&
      event.clientX <= bounds.left + containerPosition.x + bounds.width &&
      event.clientY >= bounds.top + containerPosition.y &&
      event.clientY <= bounds.top + containerPosition.y + bounds.height;

  if (insideBounds) {
    var ev = event.originalEvent || event;
    var originalTouchEvent = ev.getOriginalEvent().getBrowserEvent();

    var touchCount = originalTouchEvent.touches.length;
    if (touchCount == 2) {
      var firsFinger = originalTouchEvent.touches[0];
      var secondFinger = originalTouchEvent.touches[1];

      this.touchDist = anychart.math.vectorLength(firsFinger.pageX, firsFinger.pageY, secondFinger.pageX, secondFinger.pageY);
      this.tap = false;
    } else if (touchCount == 1) {
      this.tap = true;
      this.originEvent = event;
      // this.touchStartEvent = originalTouchEvent;
      if (!this.tapTesting) {
        this.testTouchStartHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.TOUCHSTART, function(e) {
          var originalTouchEvent = e.originalEvent.getOriginalEvent().getBrowserEvent();
          var touchCount = originalTouchEvent.touches.length;
          if (touchCount > 1) {
            this.tap = false;
          }
        });

        this.testTouchMoveHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.TOUCHMOVE, function(e) {
          this.tap = false;
        });

        if (this.interactivity_.getOption('drag') && this.getZoomLevel() != 1) {
          var mapLayer = this.getMapLayer();
          var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
          var boundsWithTx = mapLayer.getBounds();
          if (boundsWithTx.contains(boundsWithoutTx)) {
            originalTouchEvent.preventDefault();
          }
        }

        this.tapTesting = true;
        setTimeout(this.tapTestFunc, 10);
      }

      this.startTouchX = event.clientX;
      this.startTouchY = event.clientY;
      this.drag = true;
    } else {
      this.tap = false;
    }
    goog.events.listen(document, [goog.events.EventType.POINTERMOVE, goog.events.EventType.TOUCHMOVE], this.touchMoveHandler, false, this);
    goog.events.listen(document['body'], [goog.events.EventType.POINTERMOVE, goog.events.EventType.TOUCHMOVE], function(e) {
      return false;//or return e, doesn't matter
    }, false, this);
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.handleMouseDown = function(event) {
  if (this.preventMouseDownInteractivity)
    return;

  this.itWasDrag = false;
  this.originEvent = event;

  if (this.getZoomLevel() == /** @type {number} */ (this.getOption('minZoomLevel'))) {
    setTimeout(this.acyncMouseDown, 0, event);
  } else if (!this.mouseMoveTesting) {
    this.testDragHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.MOUSEMOVE, function(e) {
      this.itWasDrag = !this.legendDragInProcess;
    });

    this.mouseMoveTesting = true;
    setTimeout(this.dragTestFunc, anychart.mapModule.Chart.TIMINGS.TEST_DRAG_DELAY);
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.onMouseDown = function(event) {
  var interactivity = this.interactivity();
  if (interactivity.getOption('selectionMode') == anychart.enums.SelectionMode.DRILL_DOWN) {
    var drillDownMap = this.getCurrentScene().drillDownMap();
    if (drillDownMap) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      var series, index;
      if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory)) {
        var parent = event['target'].getParentEventTarget();
        if (parent.isSeries && parent.isSeries())
          series = parent;
        index = tag;
      } else if (anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend) || this.checkIfColorRange(event['target'])) {
        if (tag) {
          if (tag.points_) {
            series = tag.points_.series;
            index = tag.points_.points;
          } else {
            series = tag.series;
            index = tag.index;
          }
        }
      } else {
        series = tag && tag.series;
        index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
      }

      if (series) {
        var point = series.getPoint(index);
        var pointId = point.get('id');

        var map = drillDownMap[pointId];
        if (map) {
          if (anychart.utils.instanceOf(map, anychart.mapModule.Chart)) {
            this.drillTo(pointId, map);
          } else if (goog.isObject(map)) {
            var map_ = this.internalDrillDownMap[pointId];
            if (!map_) {
              this.internalDrillDownMap[pointId] = anychart.fromJson(map);
            }
            this.drillTo(pointId, this.internalDrillDownMap[pointId]);
          }
        }
      }
    }
  } else {
    anychart.mapModule.Chart.base(this, 'onMouseDown', event);
  }
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.mapModule.Chart.prototype.handleMouseOut = function(event) {
  var scene = this.getCurrentScene();
  var hoverMode = /** @type {anychart.enums.HoverMode} */(scene.interactivity().getOption('hoverMode'));

  var tag = anychart.utils.extractTag(event['domTarget']);
  var forbidTooltip = false;

  var series, index;
  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory)) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend) || scene.checkIfColorRange(event['target'])) {
    if (tag) {
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
        if (goog.isArray(index) && !index.length) index = NaN;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
    }
    forbidTooltip = true;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() &&
      goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt) {
      var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
      var prevIndex = anychart.utils.toNumber(goog.isObject(prevTag) ? prevTag.index : prevTag);

      var ifParent = anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget']);

      if ((!ifParent || (prevIndex != index)) && series.dispatchEvent(evt)) {
        if (hoverMode == anychart.enums.HoverMode.SINGLE && (!isNaN(index) || goog.isArray(index))) {
          series.unhover();
          scene.doAdditionActionsOnMouseOut();
          scene.dispatchEvent(scene.makeInteractivityPointEvent('hovered', event, [{
            series: series,
            points: [],
            nearestPointToCursor: {index: (goog.isArray(index) ? index[0] : index), distance: 0}
          }], false, forbidTooltip));
        }
      }
    }
  }

  if (hoverMode != anychart.enums.HoverMode.SINGLE) {
    if (!anychart.utils.checkIfParent(scene, event['relatedTarget'])) {
      scene.unhover();
      scene.doAdditionActionsOnMouseOut();
      if (scene.prevHoverSeriesStatus)
        scene.dispatchEvent(scene.makeInteractivityPointEvent('hovered', event, scene.prevHoverSeriesStatus, true, forbidTooltip));
      scene.prevHoverSeriesStatus = null;
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.handleMouseEvent = function(event) {
  if (!this.itWasDrag)
    anychart.mapModule.Chart.base(this, 'handleMouseEvent', event);
};


/**
 * Handler for touch move event .
 * @param {anychart.core.MouseEvent} e Event object.
 */
anychart.mapModule.Chart.prototype.touchMoveHandler = function(e) {
  var originalTouchEvent = e.getBrowserEvent();
  var touchCount = originalTouchEvent.touches ? originalTouchEvent.touches.length : 0;
  this.isDesktop = false;

  var scene = this.getCurrentScene();
  var mapLayer = scene.getMapLayer();
  if (touchCount == 2) {
    var firsFinger = originalTouchEvent.touches[0];
    var secondFinger = originalTouchEvent.touches[1];
    var dist = anychart.math.vectorLength(firsFinger.pageX, firsFinger.pageY, secondFinger.pageX, secondFinger.pageY);

    var minX = Math.min(firsFinger.pageX, secondFinger.pageX);
    var minY = Math.min(firsFinger.pageY, secondFinger.pageY);

    var c_x = minX + Math.abs(firsFinger.pageX - secondFinger.pageX) / 2;
    var c_y = minY + Math.abs(firsFinger.pageY - secondFinger.pageY) / 2;

    var isZooming = Math.abs(dist - this.touchDist) > 25;


    var minZoomLevel = /** @type {number} */ (this.getOption('minZoomLevel'));
    var maxZoomLevel = /** @type {number} */ (this.getOption('maxZoomLevel'));
    if (this.interactivity_.getOption('zoomOnMouseWheel') && isZooming) {
      var zoomRatio = 1.3;
      var zoomFactor = (dist - this.touchDist) > 0 ? zoomRatio : 1 / zoomRatio;

      this.touchDist = dist;
      this.prevZoomState_ = this.zoomState_;
      this.zoomState_ = zoomFactor > 1 ? true : zoomFactor == 1 ? !this.prevZoomState_ : false;

      if (this.prevZoomState_ != this.zoomState_) {
        if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
          scene.zoomAnimation.stop();
        }
      }

      if (zoomFactor < 1 && anychart.math.round(scene.getZoomLevel(), 2) == minZoomLevel && !mapLayer.getSelfTransformation().isIdentity()) {
        mapLayer.setTransformationMatrix(minZoomLevel, 0, 0, minZoomLevel, 0, 0);
        scene.fullZoom = minZoomLevel;
        scene.goingToHome = false;
        if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
          scene.zoomAnimation.stop();
        }

        scene.scale().setMapZoom(/** @type {number} */(minZoomLevel));
        scene.scale().setOffsetFocusPoint(0, 0);

        scene.updateSeriesOnZoomOrMove();
      } else if ((zoomFactor > 1 && scene.getZoomLevel() >= maxZoomLevel) || (zoomFactor < 1 && scene.getZoomLevel() <= minZoomLevel)) {
        return;
      } else {
        var bounds = goog.style.getBounds(this.container().domElement());
        var x = c_x - bounds.left;
        var y = c_y - bounds.top;

        // scene.zoomDuration = 1;
        scene.zoom(zoomFactor, x, y);
      }
    }
  } else if (touchCount == 1) {
    if (this.drag && this.interactivity_.getOption('drag') && this.getZoomLevel() != 1) {
      var dx = e.clientX - scene.startTouchX;
      var dy = e.clientY - scene.startTouchY;

      // var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
      // var boundsWithTx = mapLayer.getBounds();
      // var dragRight = boundsWithTx.left >= boundsWithoutTx.left && dx < 0;
      // var dragLeft = boundsWithTx.getRight() <= boundsWithoutTx.getRight() && dx > 0;
      // var dragTop = boundsWithTx.top >= boundsWithoutTx.top && dy < 0;
      // var dragBottom = boundsWithTx.getBottom() <= boundsWithoutTx.getBottom() && dy > 0;

      // if (dragRight || dragLeft || dragTop || dragBottom) {
      //   if (this.touchStartEvent) {
      //     originalTouchEvent.preventDefault();
      //     this.touchStartEvent.preventDefault();
      //   }
      // }

      goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.MOVE);
      scene.move(dx, dy);

      scene.startTouchX = e.clientX;
      scene.startTouchY = e.clientY;
    } else {
      goog.style.setStyle(document['body'], 'cursor', '');
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.getSeriesStatus = function(event) {
  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend)) {
    var tag = anychart.utils.extractTag(event['domTarget']);
    return tag.points;
  }

  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);
  var clientX = event['clientX'];
  var clientY = event['clientY'];

  var index;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;

  if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = /** @type {number} */(interactivity.getOption('spotRadius'));

    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      if (series.enabled()) {
        var iterator = series.getIterator();

        var indexes = [];
        iterator.reset();
        var minLength = Infinity;
        var minLengthIndex;
        while (iterator.advance()) {
          var shape = iterator.meta('shape');
          if (shape) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));

            index = iterator.getIndex();
            var length = anychart.math.vectorLength(pixX, pixY, x, y);
            if (length <= spotRadius) {
              indexes.push(index);
              if (length < minLength) {
                minLength = length;
                minLengthIndex = index;
              }
            }
          }
        }
        if (indexes.length)
          points.push({
            series: series,
            points: indexes,
            lastPoint: indexes[indexes.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
      }
    }
  } else if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.BY_X) {
    //not working yet. coming soon.
  }

  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [], features, prop;
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var series = status.series;
    var eventStatus = {'series': series};
    var iterator = series.getIterator();
    var points = [];
    if (!opt_empty) {
      for (var j = 0; j < status.points.length; j++) {
        var index = status.points[j];
        if (iterator.select(index)) {
          features = iterator.meta('features');
          prop = features && features.length ? features[0]['properties'] : null;
          if (prop) {
            var point = {
              'id': prop[series.getFinalGeoIdField()],
              'index': iterator.getIndex(),
              'properties': prop
            };
            points.push(point);
          } else {
            points.push(index);
          }
        }
      }
    }
    eventStatus['points'] = points;

    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      index = status.nearestPointToCursor.index;
      if (iterator.select(index)) {
        point = {};
        features = iterator.meta('features');
        prop = features && features.length ? features[0]['properties'] : null;
        if (prop) {
          point['id'] = prop[series.getFinalGeoIdField()];
          point['index'] = iterator.getIndex();
          point['properties'] = prop;
        } else {
          point['index'] = iterator.getIndex();
        }
      } else {
        point = index;
      }
      nearestPointToCursor_ = {
        'point': point,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventStatus['nearestPointToCursor'] = nearestPointToCursor_;
    eventSeriesStatus.push(eventStatus);
  }

  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  var colorRange = this.getCurrentScene().getCreated('colorRange');
  index = goog.isArray(index) ? index.length ? index[0] : NaN : index;
  if (colorRange && colorRange.target() && !isNaN(index)) {
    var target = /** @type {anychart.mapModule.Series} */(colorRange.target());
    if (target == series) {
      var iterator = target.getIterator();
      iterator.select(index);
      var value = iterator.get(target.drawer.valueFieldName);
      colorRange.showMarker(/** @type {number} */(value));
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.doAdditionActionsOnMouseOut = function() {
  var colorRange = this.getCurrentScene().getCreated('colorRange');
  if (colorRange && colorRange.enabled()) {
    colorRange.hideMarker();
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.createInteractivitySettings = function() {
  return new anychart.mapModule.Interactivity(this);
};


/**
 * Update series on zoom or moove.
 */
anychart.mapModule.Chart.prototype.updateSeriesOnZoomOrMove = function() {
  this.dataLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

  var tx = this.getMapLayer().getFullTransformation();
  var i;

  if (this.crosshair_) {
    this.crosshair_.update();
  }

  for (i = this.seriesList.length; i--;) {
    var series = this.seriesList[i];
    if (series.enabled()) {
      series.updateOnZoomOrMove();
    }
  }

  for (i = this.callouts_.length; i--;) {
    var callout = this.callouts_[i];
    if (callout.enabled())
      callout.updateOnZoomOrMove();
  }

  if (this.getCreated('axesSettings')) {
    var axes = this.axesSettings_.getItems();
    for (i = 0; i < axes.length; i++) {
      var axis = axes[i];
      if (axis.enabled())
        axis.updateOnZoomOrMove(tx);
    }
  }

  if (this.getCreated('gridsSettings')) {
    var grids = this.gridsSettings_.getItems();
    for (i = grids.length; i--;) {
      var grid = grids[i];
      if (grid.enabled())
        grid.updateOnZoomOrMove(tx);
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.selectByRect = function(marqueeFinishEvent) {
  var append = marqueeFinishEvent['shiftKey'] || marqueeFinishEvent['ctrlKey'] || marqueeFinishEvent['metaKey'];

  var left, top, width, height;
  left = marqueeFinishEvent['left'];
  top = marqueeFinishEvent['top'];
  width = marqueeFinishEvent['width'];
  height = marqueeFinishEvent['height'];

  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    var selectionMode = series.selectionMode() || this.interactivity().getOption('selectionMode');

    // all of the mode except none allow points selection
    if (selectionMode != anychart.enums.SelectionMode.NONE) {
      var pointsInRect = series.getPointsInRect(left, top, width, height);

      // single select only allows one point selected, so it'll be first point returned previously
      if (selectionMode == anychart.enums.SelectionMode.SINGLE_SELECT) {
        append = false;
        pointsInRect = pointsInRect[0];
      }
      series.selectPointInternal(pointsInRect, append);
    }
  }
};


//endregion
//region --- Polygonal select
/**
 * Start selecting by interactive polygon.
 * @param {boolean=} opt_repeat
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.startSelectPolygonMarquee = function(opt_repeat) {
  this.preventMouseDownInteractivity = this.startIPDrawing(this.onSelectPolygonStart, this.onSelectPolygonChange,
      this.onSelectPolygonFinish, opt_repeat,
      /** @type {acgraph.vector.Stroke} */(this.getOption('selectPolygonMarqueeStroke')),
      /** @type {acgraph.vector.Stroke} */(this.getOption('selectPolygonMarqueeFill'))
      );
  return this;
};


/**
 * Starts interactive polygon drawing.
 * @param {?function(Array.<number>,anychart.math.Rect,acgraph.events.BrowserEvent):(boolean)=} opt_onStart
 * @param {?function(Array.<number>,anychart.math.Rect,acgraph.events.BrowserEvent):(boolean)=} opt_onChange
 * @param {?function(Array.<number>,anychart.math.Rect,acgraph.events.BrowserEvent):(boolean)=} opt_onFinish
 * @param {boolean=} opt_repeat
 * @param {acgraph.vector.Stroke|string=} opt_stroke
 * @param {acgraph.vector.Fill|string=} opt_fill
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.startIPDrawing = function(opt_onStart, opt_onChange, opt_onFinish, opt_repeat, opt_stroke, opt_fill) {
  if (!this.rootElement) {
    return false;
  }

  opt_stroke = opt_stroke || 'red 0.5';
  opt_fill = opt_fill || 'red 0.2';
  var circleConfig = this.getOption('selectPolygonMarqueeMarker') || {};
  var circleFill = acgraph.vector.normalizeFill(circleConfig['fill'] || opt_fill);
  var circleStroke = acgraph.vector.normalizeStroke(circleConfig['stroke'] || opt_stroke);
  var circleRadius = circleConfig['radius'] || 15;

  this.ipOnStart = opt_onStart;
  this.ipOnChange = opt_onChange;
  this.ipOnFinish = opt_onFinish;

  this.ipPoints_ = [];
  this.ipMinX_ = +Infinity;
  this.ipMaxX_ = -Infinity;
  this.ipMinY_ = +Infinity;
  this.ipMaxY_ = -Infinity;
  this.inPolygon_ = true;

  this.ipCloseDelta_ = circleRadius;

  this.ipRepeat_ = !!opt_repeat;

  if (!this.ipPath_) {
    this.ipPath_ = this.rootElement.path();
    this.ipClosePath_ = this.rootElement.path();
    this.ipCloseCircle_ = this.rootElement.circle();
  }

  this.ipCloseCircle_.parent(this.rootElement);
  this.ipCloseCircle_.stroke(circleStroke);
  this.ipCloseCircle_.fill(circleFill);
  // this.ipCloseCircle_.radius(circleRadius);
  this.ipCloseCircle_.zIndex(999);

  this.ipClosePath_.parent(this.rootElement);
  this.ipClosePath_.stroke(opt_stroke, 3, '3 3');
  this.ipClosePath_.zIndex(1000);

  this.ipPath_.parent(this.rootElement);
  this.ipPath_.stroke(opt_stroke);
  this.ipPath_.fill(opt_fill);
  this.ipPath_.zIndex(1000);

  this.rootElement.listen(acgraph.events.EventType.MOUSEMOVE, this.polygonDrawingMouseMoveHandler_, true, this);
  this.rootElement.listen(acgraph.events.EventType.DBLCLICK, this.polygonDrawingMouseDblclickHandler_, true, this);
  this.rootElement.listen(acgraph.events.EventType.CLICK, this.polygonDrawingMouseClickHandler_, true, this);

  return true;
};


/**
 * Mouse move handler, draws interactive polygon.
 * @param {acgraph.events.BrowserEvent} event
 * @private
 */
anychart.mapModule.Chart.prototype.polygonDrawingMouseMoveHandler_ = function(event) {
  if (this.ipPoints_.length) {
    var cp = this.container().getStage().getClientPosition();
    var x = event['clientX'] - cp.x;
    var y = event['clientY'] - cp.y;

    var dToStartPoint = goog.math.Coordinate.distance(new goog.math.Coordinate(this.ipPoints_[0], this.ipPoints_[1]),
        new goog.math.Coordinate(x, y));
    var closePolygon = (dToStartPoint <= this.ipCloseDelta_);
    this.ipClosePath_.clear();
    if (closePolygon) {//draws closing line when the point is within close delta to the first point
      this.ipClosePath_.moveTo(x, y);
      this.ipClosePath_.lineTo(this.ipPoints_[0], this.ipPoints_[1]);
    }

    this.ipPath_.clear();
    this.ipPath_.moveTo(this.ipPoints_[0], this.ipPoints_[1]);
    for (var xInd = 2; xInd < this.ipPoints_.length; xInd += 2) {
      this.ipPath_.lineTo(this.ipPoints_[xInd], this.ipPoints_[xInd + 1]);
    }
    this.ipPath_.lineTo(x, y);
  }
};


/**
 * Mouse click handler for interactive polygon, adds points to polygon
 * and cancels interactive polygon drawing if point is within close delta to the first point.
 * @param {acgraph.events.BrowserEvent} event
 * @private
 */
anychart.mapModule.Chart.prototype.polygonDrawingMouseClickHandler_ = function(event) {
  event.stopPropagation();
  event.preventDefault();

  var cp = this.container().getStage().getClientPosition();
  var x, y;
  x = event['clientX'] - cp.x;
  y = event['clientY'] - cp.y;

  this.ipMinX_ = Math.min(x, this.ipMinX_);
  this.ipMaxX_ = Math.max(x, this.ipMaxX_);
  this.ipMinY_ = Math.min(y, this.ipMinY_);
  this.ipMaxY_ = Math.max(y, this.ipMaxY_);

  this.ipPoints_.push(x, y);

  var closePolygon = false;
  //if current point is not the first - check if it's within polygon closing distance to the first point
  if (this.ipPoints_.length > 2) {
    var dToStartPoint = goog.math.Coordinate.distance(new goog.math.Coordinate(this.ipPoints_[0], this.ipPoints_[1]),
        new goog.math.Coordinate(x, y));
    closePolygon = dToStartPoint <= this.ipCloseDelta_; //if distance is less than close delta - polygon closes
  }

  var polygonBounds = new anychart.math.Rect(this.ipMinX_, this.ipMinY_, this.ipMaxX_ - this.ipMinX_, this.ipMaxY_ - this.ipMinY_);
  //polygon closing on click within close radius near the first point
  if (closePolygon) {
    if (goog.isDef(this.ipOnFinish)) {
      this.ipOnFinish.call(this, this.ipPoints_, polygonBounds, event);
    }

    if (this.ipRepeat_) {
      this.resetPolygonElements();
      this.ipPoints_.length = 0;
      this.ipMaxX_ = this.ipMaxY_ = -Infinity;
      this.ipMinX_ = this.ipMinY_ = +Infinity;
    } else {
      this.finishIPDrawing();
    }
  } else if (this.ipPoints_.length == 2) {//current point is first
    //draw close circle on first point added
    this.ipCloseCircle_.centerX(x);
    this.ipCloseCircle_.centerY(y);
    this.ipCloseCircle_.radius(this.ipCloseDelta_);

    if (goog.isDef(this.ipOnStart)) {
      this.ipOnStart.call(this, this.ipPoints_, polygonBounds, event);
    }
  } else {//adding subsequent points
    if (goog.isDef(this.ipOnChange)) {
      this.ipOnChange.call(this, this.ipPoints_, polygonBounds, event);
    }
  }
};


/**
 * Double click handler, cancels interactive polygon drawing.
 * @param {acgraph.events.BrowserEvent} event
 * @private
 */
anychart.mapModule.Chart.prototype.polygonDrawingMouseDblclickHandler_ = function(event) {
  var polygonBounds = new anychart.math.Rect(this.ipMinX_, this.ipMinY_, this.ipMaxX_ - this.ipMinX_, this.ipMaxY_ - this.ipMinY_);
  if (this.ipOnFinish) {
    this.ipOnFinish.call(this, this.ipPoints_, polygonBounds, event);
  }

  if (this.ipRepeat_) {
    this.resetPolygonElements();
    this.ipPoints_.length = 0;
    this.ipMaxX_ = this.ipMaxY_ = -Infinity;
    this.ipMinX_ = this.ipMinY_ = +Infinity;
  } else {
    this.finishIPDrawing();
  }
  event.stopPropagation();
  event.preventDefault();
};


/**
 * Cancels polygon selection.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.cancelPolygonMarquee = function() {
  this.finishIPDrawing();
  return this;
};


/**
 * Cleans up interactive polygon drawing.
 */
anychart.mapModule.Chart.prototype.finishIPDrawing = function() {
  this.inPolygon_ = false;

  this.resetPolygonElements();
  this.ipPath_.parent(null);
  this.ipClosePath_.parent(null);
  this.ipCloseCircle_.parent(null);

  this.rootElement.unlisten(acgraph.events.EventType.MOUSEMOVE, this.polygonDrawingMouseMoveHandler_, true, this);
  this.rootElement.unlisten(acgraph.events.EventType.DBLCLICK, this.polygonDrawingMouseDblclickHandler_, true, this);
  this.rootElement.unlisten(acgraph.events.EventType.CLICK, this.polygonDrawingMouseClickHandler_, true, this);

  this.ipPoints_.length = 0;
  this.ipOnStart = this.ipOnChange = this.ipOnFinish = null;

  this.preventMouseDownInteractivity = false;
};


/**
 * Resets polygon elements but keeps their parent.
 */
anychart.mapModule.Chart.prototype.resetPolygonElements = function() {
  if (this.ipPath_) {
    this.ipPath_.clear();
    this.ipClosePath_.clear();
    this.ipCloseCircle_.radius(0);
  }
};


/**
 * If polygon selection process is going on.
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.inPolygon = function() {
  return !!this.inPolygon_;
};


/**
 * Dispatches selectPolygonStart event.
 * @param {Array.<number>} polygon
 * @param {anychart.math.Rect} polygonBounds
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.onSelectPolygonStart = function(polygon, polygonBounds, browserEvent) {
  return this.dispatchEvent(this.createSelectPolygonEvent(anychart.enums.EventType.SELECT_MARQUEE_START, polygon, polygonBounds, browserEvent));
};


/**
 * Dispatches selectPolygonChange event.
 * @param {Array.<number>} polygon
 * @param {anychart.math.Rect} polygonBounds
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.onSelectPolygonChange = function(polygon, polygonBounds, browserEvent) {
  return this.dispatchEvent(this.createSelectPolygonEvent(anychart.enums.EventType.SELECT_MARQUEE_CHANGE, polygon, polygonBounds, browserEvent));
};


/**
 * Dispatches selectPolygonFinish event.
 * @param {Array.<number>} polygon
 * @param {anychart.math.Rect} polygonBounds
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.onSelectPolygonFinish = function(polygon, polygonBounds, browserEvent) {
  var e = this.createSelectPolygonEvent(anychart.enums.EventType.SELECT_MARQUEE_FINISH, polygon, polygonBounds, browserEvent);
  var rv = this.dispatchEvent(e);
  if (rv) {
    this.selectByPolygon(e);
  }
  return rv;
};


/**
 * @typedef {{
 *  offsetX: number,
 *  offsetY: number,
 *  clientX: number,
 *  clientY: number,
 *  screenX: number,
 *  screenY: number,
 *  button: acgraph.events.BrowserEvent.MouseButton,
 *  actionButton: boolean,
 *  keyCode: number,
 *  charCode: number,
 *  ctrlKey: boolean,
 *  altKey: boolean,
 *  shiftKey: boolean,
 *  metaKey: boolean,
 *  platformModifierKey: boolean,
 *  originalEvent: acgraph.events.BrowserEvent,
 *  polygon: Array.<number>,
 *  polygonBounds: anychart.math.Rect
 * }}
 */
anychart.mapModule.Chart.PolygonEvent;


/**
 * Creates selectPolygon event.
 * It contains 'polygon' field with plain array of polygon points,
 * where odd items of array are x's and even items are y's.
 * And polygonBounds which is rect containing polygon bounds.
 * @param {string} eventType
 * @param {Array.<number>} polygon
 * @param {anychart.math.Rect} polygonBounds
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {anychart.mapModule.Chart.PolygonEvent}
 */
anychart.mapModule.Chart.prototype.createSelectPolygonEvent = function(eventType, polygon, polygonBounds, browserEvent) {
  return {
    type: eventType, // dispatch expects it to be an obfuscated property
    'offsetX': browserEvent['offsetX'],
    'offsetY': browserEvent['offsetY'],
    'clientX': browserEvent['clientX'],
    'clientY': browserEvent['clientY'],
    'screenX': browserEvent['screenX'],
    'screenY': browserEvent['screenY'],
    'button': browserEvent['button'],
    'actionButton': browserEvent['actionButton'],
    'keyCode': browserEvent['keyCode'],
    'charCode': browserEvent['charCode'],
    'ctrlKey': browserEvent['ctrlKey'],
    'altKey': browserEvent['altKey'],
    'shiftKey': browserEvent['shiftKey'],
    'metaKey': browserEvent['metaKey'],
    'platformModifierKey': browserEvent['platformModifierKey'],
    'originalEvent': browserEvent,
    'polygon': polygon,
    'polygonBounds': polygonBounds
  };
};


/**
 * Selects points inside polygon.
 * @param {anychart.mapModule.Chart.PolygonEvent} event
 */
anychart.mapModule.Chart.prototype.selectByPolygon = function(event) {
  var tx = this.getMapLayer().getFullTransformation();

  var polygon = event['polygon'];
  for (var i = 0; i < polygon.length; i += 2) {//convert polygon points according to current zoom and translate
    polygon[i] -= tx.getTranslateX(); polygon[i] /= tx.getScaleX();
    polygon[i + 1] -= tx.getTranslateY(); polygon[i + 1] /= tx.getScaleY();
  }

  var polygonBounds = event['polygonBounds'];
  //convert polygon bounds according to current zoom and translate
  polygonBounds.left -= tx.getTranslateX(); polygonBounds.left /= tx.getScaleX();
  polygonBounds.top -= tx.getTranslateY(); polygonBounds.top /= tx.getScaleY();

  var append = event['shiftKey'] || event['ctrlKey'] || event['metaKey'];

  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    var selectionMode = series.selectionMode() || this.interactivity().getOption('selectionMode');

    // drilldown and multi select allow selecting several points
    if (selectionMode != anychart.enums.SelectionMode.NONE) {
      var pointsInPolygon = series.getPointsInPolygon(polygon, polygonBounds);

      // in single select mode we don't append selected points and select only first point caught in polygon.
      if (selectionMode == anychart.enums.SelectionMode.SINGLE_SELECT) {
        append = false;
        pointsInPolygon = pointsInPolygon[0];
      }
      series.selectPointInternal(pointsInPolygon, append);
    }
  }
  //TODO (A.Kudryavtsev): Do we need to provide more information here?
  this.dispatchEvent({
    'type': anychart.enums.EventType.POINTS_SELECT,
    'points': this.getSelectedPoints(),
    'seriesStatus': [] //TODO left as is for a while.
  });
};


//endregion
//region --- Animations
//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for animation setting.
 * @param {(boolean|Object)=} opt_enabledOrJson Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation|anychart.mapModule.Chart} Animations settings object or self for chaining.
 */
anychart.mapModule.Chart.prototype.crsAnimation = function(opt_enabledOrJson, opt_duration) {
  if (!this.crsAnimation_) {
    this.crsAnimation_ = new anychart.core.utils.Animation();
    this.setupCreated('crsAnimation', this.crsAnimation_);
    this.crsAnimation_.listenSignals(this.onCrsAnimationSignal_, this);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.crsAnimation_.setup.apply(this.crsAnimation_, arguments);
    return this;
  } else {
    return this.crsAnimation_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.mapModule.Chart.prototype.onCrsAnimationSignal_ = function() {
  // this.invalidate(anychart.ConsistencyState.CHART_ANIMATION, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- UI elements
//----------------------------------------------------------------------------------------------------------------------
//
//  Color Range
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for color range.
 * @param {Object=} opt_value Color range settings to set.
 * @return {!(anychart.colorScalesModule.ui.ColorRange|anychart.mapModule.Chart)} Return current chart markers palette or itself for chaining call.
 */
anychart.mapModule.Chart.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.colorScalesModule.ui.ColorRange();
    this.setupCreated('colorRange', this.colorRange_);
    this.colorRange_.listenSignals(this.colorRangeInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.MAP_COLOR_RANGE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.colorRange_.setup(opt_value);
    return this;
  } else {
    return this.colorRange_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.Chart.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE |
        anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.checkIfColorRange = function(target) {
  return anychart.utils.instanceOf(target, anychart.colorScalesModule.ui.ColorRange);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Callout elements
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for callout elements.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Callout settings to set or index of existing callout element to get.
 * @param {(Object|boolean|null)=} opt_value Callout settings to set.
 * @return {!(anychart.mapModule.elements.Callout|anychart.mapModule.Chart)} Callout instance by index or itself for method chaining.
 */
anychart.mapModule.Chart.prototype.callout = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var callout = this.callouts_[index];
  if (!callout) {
    callout = new anychart.mapModule.elements.Callout();
    callout.setParentEventTarget(this);
    callout.addThemes(this.defaultCalloutSettings());
    callout.setupStateSettings();
    this.callouts_[index] = callout;
    callout.listenSignals(this.onCalloutSignal_, this);
    this.invalidate(anychart.ConsistencyState.MAP_CALLOUT | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    callout.setup(value);
    return this;
  } else {
    return callout;
  }
};


/**
 * Internal callout invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.Chart.prototype.onCalloutSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.MAP_CALLOUT;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Default callout settings.
 * @param {Object=} opt_value .
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.defaultCalloutSettings = function(opt_value) {
  if (!this.defaultCalloutSettings_) {
    this.defaultCalloutSettings_ = anychart.getFlatTheme('map.defaultCalloutSettings');
  }

  if (goog.isDef(opt_value)) {
    goog.mixin(this.defaultCalloutSettings_, opt_value);
    return this;
  }

  return this.defaultCalloutSettings_ || {};
};


/**
 * Axes common settings.
 * @param {(boolean|Object)=} opt_value .
 * @return {anychart.mapModule.Chart|anychart.mapModule.elements.AxisSettings}
 */
anychart.mapModule.Chart.prototype.axes = function(opt_value) {
  if (!this.axesSettings_) {
    this.axesSettings_ = new anychart.mapModule.elements.AxisSettings(this);
    this.setupCreated('axesSettings', this.axesSettings_);
    this.axesSettings_.setupElements(true);
    this.axesSettings_.setScale(/** @type {anychart.mapModule.scales.Geo} */(this.scale()));
  }

  if (goog.isDef(opt_value)) {
    this.axesSettings_.setupInternal(false, opt_value);
    return this;
  }
  return this.axesSettings_;
};


/**
 * Listener for axes settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.mapModule.Chart.prototype.onAxesSettingsSignal = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.MAP_AXES;
  }
  this.invalidate(state, signal);
};


/**
 * Grids common settings.
 * @param {(boolean|Object)=} opt_value .
 * @return {anychart.mapModule.Chart|anychart.mapModule.elements.GridSettings}
 */
anychart.mapModule.Chart.prototype.grids = function(opt_value) {
  if (!this.gridsSettings_) {
    this.gridsSettings_ = new anychart.mapModule.elements.GridSettings(this);
    this.setupCreated('gridsSettings', this.gridsSettings_);
    this.gridsSettings_.setupElements(true);
  }

  if (goog.isDef(opt_value)) {
    this.gridsSettings_.setupInternal(false, opt_value);
    return this;
  }
  return this.gridsSettings_;
};


/**
 * Listener for axes settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.mapModule.Chart.prototype.onGridsSettingsSignal = function(event) {
  var state = anychart.ConsistencyState.MAP_GRIDS;
  var signal = anychart.Signal.NEEDS_REDRAW;

  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.mapModule.elements.Crosshair|anychart.mapModule.Chart)}
 */
anychart.mapModule.Chart.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.mapModule.elements.Crosshair();
    this.setupCreated('crosshair', this.crosshair_);
    this.crosshair_.interactivityTarget(this);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.crosshair_.setup(opt_value);
    return this;
  } else {
    return this.crosshair_;
  }
};


/**
 * Listener for crosshair invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.mapModule.Chart.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.MAP_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.mapModule.Chart.prototype.getBaseSeriesZIndex = function(series) {
  return (/** @type {anychart.mapModule.Series} */(series)).isChoropleth() ?
      anychart.mapModule.Chart.ZINDEX_CHOROPLETH_SERIES :
      anychart.core.ChartWithSeries.ZINDEX_SERIES;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.setupSeries = function(series) {
  series.setAutoGeoIdField(/** @type {string} */(this.getOption('geoIdField')));
  if (this.internalGeoData)
    series.setGeoData(this.internalGeoData);

  anychart.mapModule.Chart.base(this, 'setupSeries', series);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.mapModule.Series(this, this, type, config, true);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeMapSeriesType(type);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.seriesInvalidated = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.CHART_LABELS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SERIES_CHART_SERIES;
    if ((/** @type {anychart.mapModule.Series} */(event['target'])).needsUpdateMapAppearance())
      state |= anychart.ConsistencyState.APPEARANCE;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_OVERLAP)) {
    state |= anychart.ConsistencyState.MAP_LABELS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.MAP_GEO_DATA_INDEX;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.MAP_LABELS |
        anychart.ConsistencyState.CHART_LABELS;
    if ((/** @type {anychart.mapModule.Series} */(event['target'])).needsUpdateMapAppearance())
      state |= anychart.ConsistencyState.APPEARANCE;
    for (var i = this.seriesList.length; i--;)
      this.seriesList[i].invalidate(
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.SERIES_DATA |
          anychart.ConsistencyState.SERIES_COLOR_SCALE |
          anychart.ConsistencyState.MAP_GEO_DATA_INDEX
      );
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_COLOR_RANGE)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE;
    var colorRange = this.getCreated('colorRange');
    if (colorRange) {
      colorRange.dropBoundsCache();
      colorRange.invalidate(colorRange.ALL_VISUAL_STATES);
    }
  }

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.mapModule.Chart.prototype.invalidateSeries_ = function() {
  for (var i = this.seriesList.length; i--;)
    this.seriesList[i].invalidate(anychart.ConsistencyState.BOUNDS);
};


//endregion
//region --- Map layering
/**
 * Returns data layer (layer with series)
 * @return {acgraph.vector.Layer}
 */
anychart.mapModule.Chart.prototype.getDataLayer = function() {
  return this.dataLayer_;
};


/**
 * Returns map layer (layer with map)
 * @return {acgraph.vector.Layer}
 */
anychart.mapModule.Chart.prototype.getMapLayer = function() {
  return this.mapLayer_;
};


/**
 * Creates map layer.
 * @param {acgraph.vector.ILayer=} opt_parent .
 * @return {acgraph.vector.Layer}
 */
anychart.mapModule.Chart.prototype.createMapLayer = function(opt_parent) {
  var layer;
  if (this.isSvgGeoData()) {
    layer = acgraph.layer();
  } else {
    layer = new anychart.core.utils.TypedLayer(this.createPath_, this.clearPath_);
  }

  layer.parent(opt_parent);
  layer.setTransformationMatrix(1, 0, 0, 1, 0, 0);

  return layer;
};


/**
 * Creates path.
 * @param {acgraph.vector.ILayer=} opt_parent .
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.mapModule.Chart.prototype.createPath_ = function(opt_parent) {
  var path = opt_parent ? opt_parent.path() : acgraph.path();
  path.disableStrokeScaling(true);
  return path;
};


/**
 * Clear path.
 * @param {!acgraph.vector.Element} path .
 * @private
 */
anychart.mapModule.Chart.prototype.clearPath_ = function(path) {
  path.clear();
  path.parent(null);
  path.removeAllListeners();
  path.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  delete path.tag;
};


/**
 * Clear layer.
 * @param {!acgraph.vector.Layer} layer .
 * @private
 */
anychart.mapModule.Chart.prototype.clearLayer_ = function(layer) {
  var children = layer.removeChildren();
  for (var i = 0, len = children.length; i < len; i++) {
    var child = children[i];
    if (anychart.utils.instanceOf(child, acgraph.vector.Path)) {
      this.clearPath_(/** @type {!acgraph.vector.Path} */(child));
    } else if (anychart.utils.instanceOf(child, acgraph.vector.Layer)) {
      this.clearLayer_(/** @type {!acgraph.vector.Layer} */(child));
    }
  }
};


/**
 * Clear map paths.
 */
anychart.mapModule.Chart.prototype.clear = function() {
  if (this.mapLayer_) {
    if (this.isSvgGeoData()) {
      this.clearLayer_(this.mapLayer_);
    } else {
      this.mapLayer_.clear();
    }
  }
  this.mapPaths.length = 0;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


//endregion
//region --- Geo settings
/**
 * Map scale.
 * @param {(anychart.mapModule.scales.Geo|Object)=} opt_value Scale to set.
 * @return {!(anychart.mapModule.scales.Geo|anychart.mapModule.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.mapModule.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value && anychart.utils.instanceOf(opt_value, anychart.mapModule.scales.Geo)) {
      if (this.scale_ != opt_value) {
        if (this.scale_)
          this.scale_.unlistenSignals(this.geoScaleInvalidated_, this);
        this.scale_ = /** @type {anychart.mapModule.scales.Geo} */(opt_value);
        this.scale_.listenSignals(this.geoScaleInvalidated_, this);

        this.invalidate(anychart.ConsistencyState.MAP_SCALE, anychart.Signal.NEEDS_REDRAW);
      }
    } else {
      if (!this.scale_) {
        this.scale_ = new anychart.mapModule.scales.Geo();
        this.scale_.setupByJSON(this.scale_.themeSettings, true);
        this.scale_.listenSignals(this.geoScaleInvalidated_, this);
      }
      this.scale_.setup(opt_value);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = new anychart.mapModule.scales.Geo();
      this.scale_.setupByJSON(this.scale_.themeSettings, true);
      this.scale_.listenSignals(this.geoScaleInvalidated_, this);
    }
    return this.scale_;
  }
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.mapModule.Chart.prototype.geoScaleInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS;
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }

  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.xScale = function() { return null; };


/** @inheritDoc */
anychart.mapModule.Chart.prototype.yScale = function() { return null; };


/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|string)=} opt_value Settings object or boolean value like enabled state.
 * @return {string|anychart.mapModule.utils.UnboundRegionsSettings|anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.unboundRegions = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value)) {
      if (!this.unboundRegionsSettings_ || goog.isString(this.unboundRegionsSettings_))
        this.unboundRegionsSettings_ = new anychart.mapModule.utils.UnboundRegionsSettings(this);

      this.unboundRegionsSettings_.setup(opt_value);
    } else {
      this.unboundRegionsSettings_ = anychart.enums.normalizeMapUnboundRegionsMode(opt_value, anychart.enums.MapUnboundRegionsMode.HIDE);
    }

    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  }

  return this.unboundRegionsSettings_;
};


/**
 * Whether geo data type SVG.
 * @return {boolean}
 */
anychart.mapModule.Chart.prototype.isSvgGeoData = function() {
  return this.parser ?
      this.parser.getType() == anychart.enums.MapGeoDataTypes.SVG :
      this.geoData_ ?
      goog.isString(this.geoData_) && goog.string.startsWith(this.geoData_, '<') || goog.dom.isNodeLike(this.geoData_) :
          false;
};


/**
 * Getter/setter geo data.
 * @param {Node|string|Object=} opt_data SVG|SVGString|GeoJSON|MapNameString.
 * @return {Node|string|Object} Passed geo data.
 */
anychart.mapModule.Chart.prototype.geoData = function(opt_data) {
  if (goog.isDef(opt_data)) {
    if (goog.isString(opt_data) && !goog.string.startsWith(opt_data, '<')) {
      this.geoDataStringName_ = opt_data;
      var configPath = opt_data.split('.');
      opt_data = anychart.window;
      for (var i = 0, len = configPath.length; i < len; i++) {
        opt_data = opt_data[configPath[i]];
      }
    } else {
      this.geoDataStringName_ = null;
    }

    if (this.geoData_ != opt_data) {
      this.geoData_ = opt_data;

      this.invalidate(anychart.ConsistencyState.MAP_SCALE |
          anychart.ConsistencyState.MAP_GEO_DATA |
          anychart.ConsistencyState.SERIES_CHART_SERIES |
          anychart.ConsistencyState.MAP_GEO_DATA_INDEX |
          anychart.ConsistencyState.MAP_COLOR_RANGE |
          anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE |
          anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoData_;
};


/**
 * Returns indexed geo data.
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.getIndexedGeoData = function() {
  return this.indexedGeoData_;
};


//endregion
//region --- Labels overlap
/**
 * Calculates which labels need to draw and sets the label drawing map to every map series.
 */
anychart.mapModule.Chart.prototype.applyLabelsOverlapState = function() {
  var series, i, j, len, len_, iterator, pointCount, label;
  var bounds1, bounds2, maps, seriesMap, label1, label2;

  maps = {};
  seriesMap = {};

  var globalOverlapForbidden = !(/** @type {anychart.enums.LabelsOverlapMode} */ (this.getOption('overlapMode')) == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP);

  this.noOneLabelDrew = true;

  for (i = this.seriesList.length; i--;) {
    series = this.seriesList[i];
    var seriesType = series.getType();

    if (goog.isBoolean(this.applyLabelsOverlapState_) ? !this.applyLabelsOverlapState_ : !this.applyLabelsOverlapState_[seriesType])
      continue;

    iterator = series.getIterator();
    pointCount = iterator.getRowsCount();

    var seriesOverlapForbidden = (goog.isNull(series.overlapMode()) && globalOverlapForbidden) ||
        series.overlapMode() == anychart.enums.LabelsOverlapMode.NO_OVERLAP;

    var labelsByType = maps[seriesType] ? maps[seriesType] : maps[seriesType] = [];

    for (j = 0, len = pointCount; j < len; j++) {
      label = {};
      label.series = series;
      label.bounds = series.getLabelBounds(j, anychart.PointState.NORMAL);

      this.noOneLabelDrew = this.noOneLabelDrew && !label.bounds;

      // var ind = 'label_' + series.getIndex() + '_' + j;
      // if (!this[ind]) this[ind] = this.container().rect();
      // this[ind].setBounds(anychart.math.Rect.fromCoordinateBox(label.bounds));

      label.index = j;
      label.intersects = [];
      label.state = true;

      iterator.select(label.index);
      var point = iterator.meta('currentPointElement');
      var prop;
      if (point) prop = point['properties'];

      var dataOverlapForbidden = iterator.get('overlapMode');
      var pointOverlapForbidden = goog.isDefAndNotNull(dataOverlapForbidden) ?
          dataOverlapForbidden : prop && goog.isDefAndNotNull(prop['overlapMode']) ? prop['overlapMode'] : null;

      label.isOverlapForbidden = (!goog.isDefAndNotNull(pointOverlapForbidden) && seriesOverlapForbidden) ||
          (goog.isDefAndNotNull(pointOverlapForbidden) &&
          anychart.enums.normalizeLabelsOverlapMode(pointOverlapForbidden) == anychart.enums.LabelsOverlapMode.NO_OVERLAP);

      var dataLabelRank = iterator.get('labelrank');

      label.rank = parseFloat(goog.isDef(dataLabelRank) ? dataLabelRank : prop && goog.isDef(prop['labelrank']) ? prop['labelrank'] : 0);

      labelsByType.push(label);
    }

    seriesMap[series.getIndex()] = [];
  }

  goog.object.forEach(maps, function(value) {
    for (i = 0, len = value.length; i < len; i++) {
      label1 = value[i];

      bounds1 = label1.bounds;

      for (j = 0, len_ = value.length; j < len_; j++) {
        label2 = value[j];
        bounds2 = label2.bounds;

        if (i == j)
          continue;

        if (anychart.math.checkRectIntersection(bounds1, bounds2)) {
          label1.intersects.push(label2);
        }
      }
      label1.heepKey = label1.intersects.length;
    }

    var bh = new anychart.mapModule.utils.BinaryHeap(value, function(a, b) {
      a = a ? a.heepKey : NaN;
      b = b ? b.heepKey : NaN;

      return a > b ? 1 : 0;
    });

    while (value.length) {
      var label = bh.pop();

      if (label.state && label.isOverlapForbidden) {
        for (i = 0, len = label.intersects.length; i < len; i++) {
          var intersect = label.intersects[i];

          if (!(intersect.state && label.state))
            continue;

          if (label.isOverlapForbidden && !intersect.isOverlapForbidden) {
            label.state = false;
          } else if (label.rank == intersect.rank) {
            if (label.series.getIndex() <= intersect.series.getIndex()) {
              label.state = false;
            }
          } else if (label.rank < intersect.rank) {
            label.state = false;
          }
        }

        if (!label.state) {
          for (i = 0, len = label.intersects.length; i < len; i++) {
            intersect = label.intersects[i];
            intersect.heepKey--;
            var index = goog.array.indexOf(value, intersect);
            if (index != -1) {
              bh.shiftDown(index);
            }
          }
        }
      }

      seriesMap[label.series.getIndex()][label.index] = label.state;
    }
  });

  for (i = this.seriesList.length; i--;) {
    series = this.seriesList[i];
    series.suspendSignalsDispatching();
    series.labelsDrawingMap(seriesMap[series.getIndex()]);
    series.draw();
    series.resumeSignalsDispatching(false);
  }
};


//endregion
//region --- Drawing
/**
 * Geo data post processing: calc geo scale and change crs if need.
 * @param {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} geoData .
 * @param {Function} callback .
 * @param {boolean} isInit .
 * @param {boolean} isChangeCrs .
 */
anychart.mapModule.Chart.prototype.postProcessGeoData = function(geoData, callback, isInit, isChangeCrs) {
  var i, j, len, geom_, geometries_;
  for (i = 0, len = geoData.length; i < len; i++) {
    var geom = geoData[i];
    if (geom) {
      if (isInit) {
        geom_ = {};
        if (goog.object.containsKey(geom, 'properties')) {
          geom_['properties'] = goog.object.clone(geom['properties']);
        }
      } else if (isChangeCrs) {
        geom_ = this.internalGeoData[i];
      }
      if (goog.object.containsKey(geom, 'geometries')) {
        var geometries = geom['geometries'];
        if (isInit)
          geometries_ = [];
        else if (isChangeCrs)
          geometries_ = geom_['geometries'];
        var geomsLen = geometries.length;
        for (j = 0; j < geomsLen; j++) {
          var output = isInit ? geometries_[j] = {} : isChangeCrs ? geometries_[j] : null;
          this.iterateGeometry_(geometries[j], callback, output, isInit);
        }
      } else {
        this.iterateGeometry_(
            /** @type {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon} */(geom),
            /** @type {Function} */(callback),
            /** @type {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon} */(geom_),
            isInit
        );
      }
      if (isInit)
        this.internalGeoData[i] = /** @type {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection} */(geom_);
    }
  }
};


/**
 * Draw geometry.
 * @param {Object} geometry .
 * @param {acgraph.vector.ILayer} parent .
 * @param {Function=} opt_transform .
 * @private
 */
anychart.mapModule.Chart.prototype.drawGeometry_ = function(geometry, parent, opt_transform) {
  if (!geometry) return;

  var domElement, j, geomsLen, tx, features;

  if (this.isSvgGeoData()) {
    if (goog.object.containsKey(geometry, 'type')) {
      if (geometry['type'] == 'group') {
        if (!geometry.domElement)
          geometry.domElement = this.createMapLayer(parent);

        features = geometry['features'];
        geomsLen = features.length;
        for (j = 0; j < geomsLen; j++) {
          this.drawGeometry_(features[j], geometry.domElement, opt_transform);
        }

        goog.object.forEach(geometry['attrs'], function(value, key) {
          if (key == 'id') {
            geometry.domElement.id(value);
          } else if (key == 'clip-path') {
            value.domElement = this.parser.createPathByCommands(value['commands'], value.domElement);
            geometry.domElement.clip(value.domElement);
          } else {
            geometry.domElement.attr(key, value);
          }
        }, this);
      } else if (geometry['type'] == 'image') {
        if (!geometry.domElement)
          geometry.domElement = parent.image();
        var bounds = geometry['bounds'];

        geometry.domElement.x(bounds.left);
        geometry.domElement.y(bounds.top);
        geometry.domElement.width(bounds.width);
        geometry.domElement.height(bounds.height);

        geometry.domElement.src(geometry['attrs']['xlink:href']);
      } else if (geometry['type'] == 'path') {
        if (!geometry.domElement)
          geometry.domElement = this.createPath_(parent);
        this.parser.createPathByCommands(geometry['commands'], geometry.domElement);

        goog.object.forEach(geometry['attrs'], function(value, key) {
          if (key == 'id') {
            geometry.domElement.id(value);
          } else if (key == 'clip-path') {
            value.domElement = this.parser.createPathByCommands(value['commands'], value.domElement);
            geometry.domElement.clip(value.domElement);
          } else {
            var bounds;
            if (key == 'fill') {
              var fill;
              if (goog.isObject(value)) {
                if (value['type'] && value['type'] == 'pattern') {
                  bounds = value['bounds'];
                  if (!value.domElement) {
                    value.domElement = acgraph.patternFill(bounds);

                    value.domElement.parent(parent);
                    value.domElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);

                    features = value['features'];
                    geomsLen = features.length;
                    for (j = 0; j < geomsLen; j++) {
                      this.drawGeometry_(features[j], value.domElement, null);
                    }
                  }
                  fill = value.domElement;
                } else {
                  fill = value;
                }
              } else {
                fill = value;
              }
              geometry.domElement.fill(fill);
            } else if (key == 'stroke') {
              var stroke;
              if (goog.isObject(value)) {
                if (value['type'] && value['type'] == 'pattern') {
                  bounds = value['bounds'];
                  if (!value.domElement) {
                    value.domElement = acgraph.patternFill(bounds);

                    value.domElement.parent(parent);
                    value.domElement.setTransformationMatrix(1, 0, 0, 1, 0, 0);

                    features = value['features'];
                    geomsLen = features.length;
                    for (j = 0; j < geomsLen; j++) {
                      this.drawGeometry_(features[j], value.domElement, null);
                    }
                  }
                  stroke = value.domElement;
                } else {
                  stroke = value;
                }
              } else {
                stroke = value;
              }
              geometry.domElement.stroke(stroke);
            } else {
              geometry.domElement.attr(key, value);
            }
          }
        }, this);
      } else if (geometry['type'] == 'text') {
        if (!geometry.domElement) {
          geometry.domElement = new acgraph.vector.UnmanagedLayer();
        }

        var content = geometry['cloneNode'].cloneNode(true);
        content.removeAttribute('transform');

        geometry.domElement.content(content);
      }
    }
    if (geometry.domElement) {
      tx = geometry['tx'] ? geometry['tx'].self : null;
      if (tx) {
        geometry.domElement.setTransformationMatrix(
            tx.getScaleX(),
            tx.getShearY(),
            tx.getShearX(),
            tx.getScaleY(),
            tx.getTranslateX(),
            tx.getTranslateY()
        );
      }

      geometry.domElement.parent(parent);
      if (geometry['type'] != 'group') {
        this.mapPaths.push(geometry.domElement);
      }
    }
  } else {
    domElement = parent.genNextChild();
    geometry.domElement = domElement;
    this.mapPaths.push(domElement);

    if (goog.object.containsKey(geometry, 'geometries')) {
      var geometries = geometry['geometries'];
      geomsLen = geometries.length;
      for (j = 0; j < geomsLen; j++) {
        this.iterateGeometry_(geometries[j], this.drawGeom_);
      }
    } else {
      this.iterateGeometry_(/** @type {Object} */(geometry), this.drawGeom_);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    for (var i = this.seriesList.length; i--;) {
      var series = this.seriesList[i];
      series.setGeoData(/** @type {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} */(this.internalGeoData));
    }

    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA);
  }
};


/**
 * Function for draw geoms.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon} geom Geom object.
 * @private
 */
anychart.mapModule.Chart.prototype.drawGeom_ = function(coords, index, geom) {
  var x, y;
  var xy = this.scale().scaleToPx(coords[index], coords[index + 1]);
  x = xy[0];
  y = xy[1];

  if (goog.object.containsKey(geom, 'coordinates')) {
    geom.domElement.moveTo(x, y).lineTo(x, y);
  } else {
    if (!index) geom.domElement.moveTo(x, y);
    else geom.domElement.lineTo(x, y);
  }
};


/**
 * Function for calculate geo scale.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon} geom Geom object.
 * @this {{
 *    tx: Object,
 *    projection1: anychart.mapModule.projections.Base,
 *    projection2: anychart.mapModule.projections.Base,
 *    geoScale: anychart.mapModule.scales.Geo,
 *    map: anychart.mapModule.Chart
 * }}
 * @private
 */
anychart.mapModule.Chart.prototype.calcGeom_ = function(coords, index, geom) {
  var x, y, projected, bounds;
  var geoScale = this.geoScale;

  if (this.map.isSvgGeoData()) {
    if (geom['type'] == 'image' || geom['type'] == 'text') {
      bounds = acgraph.getRenderer().measureElement(geom['cloneNode']);

      geoScale.extendDataRangeInternal(bounds.getLeft(), bounds.getTop(), bounds.getRight(), bounds.getBottom());
    } else if (geom['type'] == 'path') {
      if (!this.map.measurePath)
        this.map.measurePath = acgraph.path();

      this.map.parser.createPathByCommands(geom['commands_tx'] ? geom['commands_tx'] : geom['commands'], this.map.measurePath);

      bounds = this.map.measurePath.getBounds();

      geoScale.extendDataRangeInternal(bounds.getLeft(), bounds.getTop(), bounds.getRight(), bounds.getBottom());
    }
  } else {
    if (this.projection2) {
      x = ((coords[index] - this.tx.xoffset) / this.tx.scale);
      y = ((coords[index + 1] - this.tx.yoffset) / this.tx.scale);

      if (this.projection1) {
        projected = this.projection1.invert(x, y);
        x = projected[0];
        y = projected[1];
      }

      projected = this.projection2.forward(x, y);

      coords[index] = projected[0] * this.tx.scale + this.tx.xoffset;
      coords[index + 1] = projected[1] * this.tx.scale + this.tx.yoffset;
    }

    geoScale.extendDataRangeInternal(coords[index], coords[index + 1]);
  }
};


/**
 * Draw geometry.
 * @param {Object} geom Geometry.
 * @param {Function} callBack DOM element.
 * @param {Object=} opt_output Output object for clone geometry.
 * @param {boolean=} opt_initGeoData .
 * @private
 */
anychart.mapModule.Chart.prototype.iterateGeometry_ = function(geom, callBack, opt_output, opt_initGeoData) {
  var j, k, m, geomsLen, pointsLen;
  var polygones_, polygone_, holes_, paths_, path;

  if (!geom) return;
  if (goog.object.containsKey(geom, 'polygones')) {
    var polygones = geom['polygones'];
    geomsLen = polygones.length;
    if (opt_initGeoData)
      polygones_ = [];
    else if (opt_output)
      polygones_ = opt_output['polygones'];

    for (j = 0; j < geomsLen; j++) {
      var polygone = polygones[j];
      var outerPath = polygone['outerPath'];
      var holes = polygone['holes'];

      if (opt_initGeoData) {
        outerPath = goog.array.clone(outerPath);
        polygone_ = {
          'outerPath': outerPath,
          'holes': []
        };
      } else if (opt_output) {
        polygone_ = polygones_[j];
        outerPath = polygone_['outerPath'] = goog.array.clone(outerPath);
        holes_ = polygone_['holes'];
      }

      pointsLen = outerPath.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, outerPath, k, geom);
      }

      pointsLen = holes.length;
      for (k = 0; k < pointsLen; k++) {
        var hole = holes[k];
        if (opt_initGeoData) {
          hole = goog.array.clone(hole);
          polygone_['holes'].push(hole);
        } else if (opt_output) {
          hole = holes_[k] = goog.array.clone(hole);
        }

        for (m = 0; m < hole.length - 1; m += 2) {
          callBack.call(this, hole, m, geom);
        }
      }

      if (opt_initGeoData)
        polygones_.push(polygone_);
    }
    if (opt_initGeoData)
      opt_output['polygones'] = polygones_;
  } else if (goog.object.containsKey(geom, 'paths')) {
    var paths = geom['paths'];
    geomsLen = paths.length;
    if (opt_initGeoData)
      paths_ = [];
    else if (opt_output)
      paths_ = opt_output['paths'];

    for (j = 0; j < geomsLen; j++) {
      path = paths[j];

      if (opt_initGeoData) {
        path = goog.array.clone(path);
        paths_.push(path);
      } else if (opt_output) {
        path = paths_[j] = goog.array.clone(path);
      }

      pointsLen = path.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, path, k, geom);
      }
    }
    if (opt_initGeoData)
      opt_output['paths'] = paths_;
  } else if (goog.object.containsKey(geom, 'coordinates')) {
    var coords = geom['coordinates'];
    pointsLen = coords.length;
    if (opt_initGeoData) {
      coords = goog.array.clone(coords);
      opt_output['coordinates'] = coords;
    } else if (opt_output) {
      coords = opt_output['coordinates'] = goog.array.clone(coords);
    }
    for (k = 0; k < pointsLen - 1; k += 2) {
      callBack.call(this, coords, k, geom);
    }
  } else if (goog.object.containsKey(geom, 'type')) {
    if (geom['type'] == 'path') {
      if (opt_initGeoData || opt_output) {
        opt_output['type'] = geom['type'];
        opt_output['commands'] = geom['commands'];
        opt_output['commands_tx'] = geom['commands_tx'];
        opt_output['attrs'] = geom['attrs'];
        opt_output['properties'] = geom['properties'];
        opt_output['tx'] = geom['tx'];
      }

      callBack.call(this, null, 0, geom);
    } else if (geom['type'] == 'image') {
      if (opt_initGeoData || opt_output) {
        opt_output['type'] = geom['type'];
        opt_output['bounds'] = geom['bounds'];
        opt_output['attrs'] = geom['attrs'];
        opt_output['properties'] = geom['properties'];
        opt_output['sourceNode'] = geom['sourceNode'];
        opt_output['cloneNode'] = geom['cloneNode'];
        opt_output['tx'] = geom['tx'];
      }

      callBack.call(this, null, 0, geom);
    } else if (geom['type'] == 'text') {
      if (opt_initGeoData || opt_output) {
        opt_output['type'] = geom['type'];
        opt_output['text'] = geom['text'];
        opt_output['cloneNode'] = geom['cloneNode'];
        opt_output['attrs'] = geom['attrs'];
        opt_output['properties'] = geom['properties'];
        opt_output['tx'] = geom['tx'];
      }

      callBack.call(this, null, 0, geom);
    } else if (geom['type'] == 'group') {
      var features = geom['features'];
      var featuresLength = features.length;
      var features_;

      if (opt_initGeoData) {
        features_ = [];
      } else if (opt_output) {
        features_ = opt_output['features'];
      }

      for (k = 0; k < featuresLength; k++) {
        var feature = features[k];
        var feature_;

        if (opt_initGeoData) {
          feature_ = {};
          if (goog.object.containsKey(feature, 'properties')) {
            feature_['properties'] = feature['properties'];
          }
        } else if (opt_output) {
          feature_ = feature;
        }

        this.iterateGeometry_(feature, callBack, feature_, opt_initGeoData);

        if (opt_initGeoData)
          features_.push(feature_);
      }

      if (opt_initGeoData)
        opt_output['features'] = features_;

      if (opt_initGeoData || opt_output) {
        opt_output['type'] = geom['type'];
        opt_output['attrs'] = geom['attrs'];
        opt_output['tx'] = geom['tx'];
      }
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.drawCredits = function(parentBounds) {
  var rootScene = this.getRootScene();
  return /** @type {!anychart.math.Rect} */(this == rootScene ? anychart.mapModule.Chart.base(this, 'drawCredits', parentBounds) : parentBounds);
};


/**
 * Returns bounds without callout elements.
 * @param {anychart.math.Rect} bounds
 * @return {anychart.math.Rect}
 */
anychart.mapModule.Chart.prototype.getBoundsWithoutCallouts = function(bounds) {
  var i, callout, remainingBounds, orientation;
  var callouts = this.callouts_;

  var boundsWithoutCallouts = bounds.clone();
  var topOffset = 0;
  var bottomOffset = 0;
  var leftOffset = 0;
  var rightOffset = 0;

  for (i = callouts.length; i--;) {
    callout = /** @type {anychart.mapModule.elements.Callout} */(callouts[i]);
    if (callout && callout.enabled()) {
      callout.parentBounds(bounds);
      orientation = callout['orientation']();

      if (orientation == anychart.enums.Orientation.TOP) {
        remainingBounds = callout.getRemainingBounds();
        topOffset = bounds.height - remainingBounds.height;
      } else if (orientation == anychart.enums.Orientation.BOTTOM) {
        remainingBounds = callout.getRemainingBounds();
        bottomOffset = bounds.height - remainingBounds.height;
      } else if (orientation == anychart.enums.Orientation.LEFT) {
        remainingBounds = callout.getRemainingBounds();
        leftOffset = bounds.width - remainingBounds.width;
      } else if (orientation == anychart.enums.Orientation.RIGHT) {
        remainingBounds = callout.getRemainingBounds();
        rightOffset = bounds.width - remainingBounds.width;
      }
    }
  }

  boundsWithoutCallouts.left += leftOffset;
  boundsWithoutCallouts.top += topOffset;
  boundsWithoutCallouts.width -= rightOffset + leftOffset;
  boundsWithoutCallouts.height -= bottomOffset + topOffset;

  return boundsWithoutCallouts;
};


/**
 * Returns bounds without axes elements.
 * @param {anychart.math.Rect} bounds
 * @return {anychart.math.Rect}
 */
anychart.mapModule.Chart.prototype.getBoundsWithoutAxes = function(bounds) {
  //todo (blackart) don't remove. Debug purpose.
  // if (!this.boundsssss) this.boundsssss = this.container().rect().zIndex(1000).stroke('red');
  // this.boundsssss.setBounds(bounds);

  var boundsWithoutAxis = bounds.clone();
  if (this.getCreated('axesSettings')) {
    var leftOffset = 0;
    var topOffset = 0;
    var rightOffset = 0;
    var bottomOffset = 0;

    boundsWithoutAxis = bounds.clone();

    var axes = this.axesSettings_.getItems();
    var axis;
    for (var i = 0; i < axes.length; i++) {
      axis = axes[i];
      if (axis.getOption('enabled')) {
        axis.parentBounds(bounds);

        var remainingBounds = axis.getRemainingBounds();

        var leftOffset_ = bounds.left - remainingBounds.left;
        if (leftOffset < leftOffset_ && remainingBounds.left) leftOffset = leftOffset_;

        var topOffset_ = bounds.top - remainingBounds.top;
        if (topOffset < topOffset_ && remainingBounds.top) topOffset = topOffset_;

        var rightOffset_ = remainingBounds.getRight() - bounds.getRight();
        if (rightOffset < rightOffset_ && remainingBounds.getRight()) rightOffset = rightOffset_;

        var bottomOffset_ = remainingBounds.getBottom() - bounds.getBottom();
        if (bottomOffset < bottomOffset_ && remainingBounds.getBottom()) bottomOffset = bottomOffset_;

        axis.invalidate(anychart.ConsistencyState.BOUNDS);
      }
    }

    boundsWithoutAxis.left += leftOffset;
    boundsWithoutAxis.top += topOffset;
    boundsWithoutAxis.width -= leftOffset + rightOffset;
    boundsWithoutAxis.height -= topOffset + bottomOffset;
  }

  //todo (blackart) don't remove. Debug purpose.
  // if (!this.boundsWithoutAxis) this.boundsWithoutAxis = stage.rect().zIndex(1000);
  // this.boundsWithoutAxis.setBounds(boundsWithoutAxis);

  return boundsWithoutAxis;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.calculate = function() {
  var i, series, tx, len, geom;
  var scale = this.scale();
  var needRecalculateLatLonScaleRange = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    var geoData = this.geoData();

    if (goog.isDefAndNotNull(geoData)) {
      geoData = goog.isString(this.geoData_) && !goog.string.startsWith(/** @type {string} */(geoData), '<') ?
          anychart.window['anychart']['maps'][this.geoData_] : this.geoData_;

      if (goog.isString(geoData) && goog.string.startsWith(geoData, '<') || goog.dom.isNodeLike(geoData)) {
        this.parser = anychart.mapModule.utils.GeoSVGParser.getInstance();
      } else if (geoData['type'].toLowerCase() === 'topology') {
        this.parser = anychart.mapModule.utils.TopoJSONParser.getInstance();
      } else {
        this.parser = anychart.mapModule.utils.GeoJSONParser.getInstance();
      }

      this.internalSourceGeoData = this.parser.parse(/** @type {Object} */(geoData));

      goog.dispose(this.internalGeoData);
      this.internalGeoData = null;

      var geoIdFromGeoData = geoData['ac-geoFieldId'];
      if (geoIdFromGeoData)
        this.setOption('geoIdField', geoIdFromGeoData);

      this.mapTX = {};

      var mapTx = geoData['ac-tx'] || {};

      var defaultTx = mapTx['default'];
      if (!defaultTx)
        defaultTx = mapTx['default'] = goog.object.clone(anychart.mapModule.Chart.DEFAULT_TX['default']);

      goog.object.forEach(mapTx || anychart.mapModule.Chart.DEFAULT_TX, function(value, key) {
        var tx_ = {};

        tx_.crs = goog.isDef(value['crs']) ? anychart.enums.normalizeMapProjections(value['crs']) : defaultTx.crs;
        tx_.srcCrs = tx_.crs;
        tx_.curProj = anychart.mapModule.projections.getProjection(tx_.crs);
        tx_.srcProj = anychart.mapModule.projections.getProjection(tx_.srcCrs);
        tx_.scale = value['scale'] || defaultTx.scale || 1;
        tx_.xoffset = goog.isDef(value['xoffset']) ? parseFloat(value['xoffset']) : 0;
        tx_.yoffset = goog.isDef(value['yoffset']) ? parseFloat(value['yoffset']) : 0;
        if (goog.isDef(value['heatZone'])) {
          tx_.heatZone = goog.isArray(value['heatZone']) ? value['heatZone'] : anychart.math.Rect.fromJSON(value['heatZone']);
        }

        this.mapTX[key] = tx_;
      }, this);

      var geoScaleSettings = geoData['scale'];
      if (geoScaleSettings) {
        scale.setMapLimits(
            'minLon' in geoScaleSettings ? geoScaleSettings['minLon'] : NaN,
            'maxLon' in geoScaleSettings ? geoScaleSettings['maxLon'] : NaN,
            'minLat' in geoScaleSettings ? geoScaleSettings['minLat'] : NaN,
            'maxLat' in geoScaleSettings ? geoScaleSettings['maxLat'] : NaN
        );
      } else {
        scale.setMapLimits(NaN, NaN, NaN, NaN);
      }
    }

    if (!this.mapLayer_) {
      this.mapLayer_ = this.createMapLayer(/** @type {acgraph.vector.ILayer} */(this.rootElement));
      this.mapLayer_.zIndex(anychart.mapModule.Chart.ZINDEX_MAP);
      if (this.getRootScene() == this)
        this.initControlsInteractivity_();
    } else {
      this.clear();
    }

    if (this.isSvgGeoData() && !this.svgRootLayer_) {
      this.svgRootLayer_ = this.createMapLayer(/** @type {acgraph.vector.ILayer} */(this.mapLayer_));
    }

    if (!this.dataLayer_) {
      this.dataLayer_ = this.rootElement.layer();
      this.dataLayer_.zIndex(anychart.core.ChartWithSeries.ZINDEX_SERIES);
    }

    needRecalculateLatLonScaleRange = true;
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.MAP_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SCALE)) {
    if (this.mapTX) {
      scale.setTxMap(this.mapTX);
      if (this.mapLayer_) {
        var mtx = this.mapLayer_.getSelfTransformation();
        scale.setMapZoom(mtx.getScaleX());
        scale.setOffsetFocusPoint(mtx.getTranslateX(), mtx.getTranslateY());

        //if (this.getZoomLevel() != this.getOption('minZoomLevel')) {
        //scene.zoomInc = this.getOption('minZoomLevel');
        //}
      }

      tx = this.mapTX ? this.mapTX['default'] : null;

      var firstDrawing = !this.currentCrs_;
      var crs = goog.isNull(this.crs_) ? tx.srcCrs : this.crs_;
      var initInternalGeoData = !this.internalGeoData;

      this.newCrs_ = null;
      if (firstDrawing && this.crs_) {
        this.newCrs_ = this.crs_;
      } else if ((this.currentCrs_ != tx.crs || this.currentCrs_ != crs) && !firstDrawing && !this.isSvgGeoData()) {
        this.newCrs_ = crs;
      }

      var changeProjection = !!this.newCrs_ && !this.isSvgGeoData();

      var destinationProjection, currentProjection, sourceProjection;

      if ((tx.crs != this.newCrs_ && tx.srcCrs != this.newCrs_) ||
          (this.getCreated('crsAnimation') && this.crsAnimation_.getOption('enabled'))) {
        if (!anychart.mapModule.projections.isBaseProjection(tx.srcCrs)) {
          sourceProjection = tx.srcProj;
        }
        if (changeProjection) {
          destinationProjection = anychart.mapModule.projections.getProjection(this.newCrs_);
        }
      }
      currentProjection = tx.curProj;

      if (firstDrawing) {
        this.currentCrs_ = crs;
      }
      if (changeProjection) {
        if (this.crsMapAnimation && this.crsMapAnimation.isPlaying()) {
          this.crsMapAnimation.stop();
          this.crsMapAnimation.dispose();
          this.crsMapAnimation = null;
        }
        this.currentCrs_ = this.newCrs_;
        tx.crs = this.currentCrs_;
        tx.curProj = anychart.mapModule.projections.getProjection(tx.crs);
      }

      if (initInternalGeoData) {
        geoData = this.internalSourceGeoData;
        this.internalGeoData = [];
      } else if (changeProjection) {
        geoData = this.internalSourceGeoData;
      } else {
        geoData = this.internalGeoData;
      }

      var crsAnimation = this.getCreated('crsAnimation');
      if ((this.crsMapAnimation && this.crsMapAnimation.isStopped()) || !this.crsMapAnimation) {
        var isAnimate = crsAnimation && /** @type {boolean} */(crsAnimation.getOption('enabled')) &&
            /** @type {number} */(crsAnimation.getOption('duration')) > 0 && !initInternalGeoData && changeProjection;
        if (isAnimate) {
          tx.curProj = new anychart.mapModule.projections.TwinProjection(
              /** @type {anychart.mapModule.projections.Base} */(currentProjection),
              /** @type {anychart.mapModule.projections.Base} */(destinationProjection));
          this.crsMapAnimation = new anychart.mapModule.animation.Crs(
              this,
              /** @type {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} */(geoData),
              sourceProjection,
              tx,
              /** @type {number} */(crsAnimation.getOption('duration')),
              this != this.getCurrentScene());
          this.crsMapAnimation.listenOnce(goog.fx.Transition.EventType.END,
              /**
               * @this {{map: anychart.mapModule.Chart, tx: Object}}
               */
              function() {
                this.map.crsMapAnimation.stop();
                this.map.crsMapAnimation.dispose();
                this.tx.curProj = this.tx.curProj.destProjection;
              }, true, {map: this, tx: /** @type {Object} */(tx)});
          this.crsMapAnimation.play();

        } else {
          var callback = goog.bind(this.calcGeom_, {
            tx: tx,
            projection1: sourceProjection,
            projection2: destinationProjection,
            geoScale: this.scale(),
            map: this
          });

          scale.defWhetherIsSvgDataType(this.isSvgGeoData());
          scale.suspendSignalsDispatching();
          scale.startAutoCalc(needRecalculateLatLonScaleRange);

          this.postProcessGeoData(
              /** @type {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} */(geoData),
              callback,
              initInternalGeoData,
              changeProjection);

          scale.finishAutoCalc();
          scale.resumeSignalsDispatching(true);

          if (this.isSvgGeoData()) {
            scale.autoInvert(false, true);

            this.svgRootLayer_.parent(this.getMapLayer());
            this.svgRootLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
          } else {
            scale.autoInvert(false, false);
          }
        }
      }

      var max = -Infinity;
      var min = Infinity;
      var sum = 0;
      var pointsCount = 0;

      for (i = this.seriesList.length; i--;) {
        series = this.seriesList[i];
        series.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);

        //----------------------------------calc statistics for series
        series.calculateStatistics();
        max = Math.max(max, /** @type {number} */(series.statistics(anychart.enums.Statistics.SERIES_MAX)));
        min = Math.min(min, /** @type {number} */ (series.statistics(anychart.enums.Statistics.SERIES_MIN)));
        sum += /** @type {number} */(series.statistics(anychart.enums.Statistics.SERIES_SUM));
        pointsCount += /** @type {number} */(series.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT));
        //----------------------------------end calc statistics for series
      }

      //----------------------------------calc statistics for series
      //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series

      var average = sum / pointsCount;
      for (i = 0; i < this.seriesList.length; i++) {
        series = this.seriesList[i];
        series.statistics(anychart.enums.Statistics.MAX, max);
        series.statistics(anychart.enums.Statistics.MIN, min);
        series.statistics(anychart.enums.Statistics.SUM, sum);
        series.statistics(anychart.enums.Statistics.AVERAGE, average);
        series.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);
        var seriesStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(series['stroke']()));
        if (seriesStrokeThickness > this.maxStrokeThickness_) {
          this.maxStrokeThickness_ = seriesStrokeThickness;
        }
      }
      //----------------------------------end calc statistics for series
    }
    this.markConsistent(anychart.ConsistencyState.MAP_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA_INDEX)) {
    var geoIdField = /** @type {string} */ (this.getOption('geoIdField'));
    this.indexedGeoData_ = {};
    this.indexedGeoData_[geoIdField] = {};
    if (this.internalGeoData) {
      for (i = this.seriesList.length; i--;) {
        series = this.seriesList[i];
        if (goog.isDef(series.geoIdField()) && series.geoIdField() != geoIdField) {
          this.indexedGeoData_[series.geoIdField()] = {};
        }
      }

      for (i = 0, len = this.internalGeoData.length; i < len; i++) {
        geom = this.internalGeoData[i];
        this.featureTraverser(geom, function(feature) {
          var prop = feature['properties'];
          if (prop) {
            for (var index in this.indexedGeoData_) {
              if (index in prop) {
                this.indexedGeoData_[index][prop[index]] = feature;
              }
            }
          }
        }, this);
      }
    }
    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA_INDEX);
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.specialDraw = function(bounds) {
  anychart.mapModule.Chart.base(this, 'specialDraw', this.contentBounds);
  this.dataArea().applyClip(this.scale().getViewSpace());
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.drawContent = function(bounds) {
  this.getRootScene();

  var i, series, tx, dx, dy, cx, cy, len, geom, callout;
  var maxZoomLevel = /** @type {number} */ (this.getOption('maxZoomLevel'));
  var minZoomLevel = /** @type {number} */ (this.getOption('minZoomLevel'));
  var boundsWithoutTx, boundsWithTx, seriesType;
  var axes, axis, grids, grid;

  var scale = this.scale();

  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    for (i = this.seriesList.length; i--;) {
      series = this.seriesList[i];
      series.suspendSignalsDispatching();
      series.container(this.dataLayer_);
      if (series.isChoropleth())
        series.calculate();
      series.resumeSignalsDispatching(false);
    }
    this.applyLabelsOverlapState_ = {};
    this.calcBubbleSizes();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    for (i = 0, len = this.callouts_.length; i < len; i++) {
      callout = this.callouts_[i];
      callout.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    if (this.getCreated('axesSettings')) {
      axes = this.axesSettings_.getItems();
      for (i = 0, len = axes.length; i < len; i++) {
        axis = axes[i];
        axis.labels().dropCallsCache();
        axis.minorLabels().dropCallsCache();
        axis.invalidate(axis.ALL_VISUAL_STATES);
      }
    }

    if (this.getCreated('gridsSettings')) {
      grids = this.gridsSettings_.getItems();
      for (i = 0, len = grids.length; i < len; i++) {
        grid = grids[i];
        grid.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.GRIDS_POSITION);
      }
    }

    this.invalidate(anychart.ConsistencyState.MAP_GRIDS);
    this.invalidate(anychart.ConsistencyState.MAP_AXES);
    this.invalidate(anychart.ConsistencyState.MAP_CALLOUT);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.getCreated('colorRange')) {
      var targetSeries;
      for (i = 0, len = this.seriesList.length; i < len; i++) {
        if (this.seriesList[i].isChoropleth())
          targetSeries = this.seriesList[i];
      }
      if (targetSeries) {
        this.colorRange_.suspendSignalsDispatching();
        this.colorRange_.scale(targetSeries.colorScale());
        this.colorRange_.target(targetSeries);
        this.colorRange_.setParentEventTarget(this.getRootScene());
        this.colorRange_.resumeSignalsDispatching(false);
        this.invalidate(anychart.ConsistencyState.BOUNDS);
      }
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_CALLOUT)) {
    for (i = 0, len = this.callouts_.length; i < len; i++) {
      callout = this.callouts_[i];
      if (callout) {
        var assignedItems = [];
        var items = callout.items();
        var itemIndex = 0;
        for (var j = 0, len_ = items.length; j < len_; j++) {
          var item = items[j];
          for (var k = 0, len__ = this.seriesList.length; k < len__; k++) {
            series = this.seriesList[k];
            var seriesPoint = series.getPointById(item);
            if (seriesPoint) {
              assignedItems[itemIndex] = seriesPoint;
              itemIndex++;
            }
          }

        }
        callout.suspendSignalsDispatching();
        callout.setProcessedItems(assignedItems);
        callout.setParentEventTarget(this.getRootScene());
        callout.container(this.rootElement);
        callout.zIndex(anychart.mapModule.Chart.ZINDEX_CALLOUT);
        callout.resumeSignalsDispatching(false);
      }
    }
  }

  var mapLayer = this.getMapLayer();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var contentAreaBounds;
    if (this.colorRange_) {
      this.colorRange_.parentBounds(bounds.clone().round());
      contentAreaBounds = this.colorRange_.getRemainingBounds();
    } else {
      contentAreaBounds = bounds.clone();
    }

    this.rootElement.clip(this.getPixelBounds());

    var unboundRegionsStrokeThickness = goog.isObject(this.unboundRegions()) ?
        acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.unboundRegions().stroke())) : 0;

    if (unboundRegionsStrokeThickness > this.maxStrokeThickness_)
      this.maxStrokeThickness_ = unboundRegionsStrokeThickness;

    contentAreaBounds.left = contentAreaBounds.left + this.maxStrokeThickness_ / 2;
    contentAreaBounds.top = contentAreaBounds.top + this.maxStrokeThickness_ / 2;
    contentAreaBounds.width = contentAreaBounds.width - this.maxStrokeThickness_;
    contentAreaBounds.height = contentAreaBounds.height - this.maxStrokeThickness_;

    var boundsWithoutCallouts = this.getBoundsWithoutCallouts(contentAreaBounds);

    // if (!this.allBoundsRect) this.allBoundsRect = this.container().rect().zIndex(1000);
    // this.allBoundsRect.setBounds(boundsWithoutCallouts);

    var boundsWithoutAxes = this.getBoundsWithoutAxes(boundsWithoutCallouts);
    var dataBounds = boundsWithoutAxes.clone();

    // if (!this.dataBoundsRect) this.dataBoundsRect = stage.rect().zIndex(1000);
    // this.dataBoundsRect.setBounds(dataBounds);

    dataBounds.left = dataBounds.left + this.maxStrokeThickness_ / 2;
    dataBounds.top = dataBounds.top + this.maxStrokeThickness_ / 2;
    dataBounds.width = dataBounds.width - this.maxStrokeThickness_;
    dataBounds.height = dataBounds.height - this.maxStrokeThickness_;

    scale.setBounds(dataBounds);
    this.dataBounds_ = dataBounds;

    if (this.getCreated('axesSettings')) {
      axes = this.axesSettings_.getItems();
      for (i = 0, len = axes.length; i < len; i++) {
        axis = axes[i];
        axis.dropBoundsCache();
      }
    }

    //todo (blackart) this is harcode! remove this shit when we to kill world map
    if (this.mapLayer_ && this.mapTX && !this.mapTX['default'].xoffset) {
      this.mapLayer_.clip(scale.getViewSpace());
    }

    this.clear();

    if (this.isSvgGeoData()) {
      scale.calculate();
      this.svgRootLayer_.parent(this.getMapLayer());
      this.svgRootLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
      this.svgRootLayer_.scale(scale.ratio, scale.ratio, 0, 0);

      var xy = scale.scaleToPx(0, 0);
      tx = new goog.math.AffineTransform(1, 0, 0, 1, xy[0], xy[1]);

      tx.concatenate(this.svgRootLayer_.getSelfTransformation());
      this.svgRootLayer_.setTransformationMatrix(tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleY(), tx.getTranslateX(), tx.getTranslateY());
    }

    if (this.internalGeoData) {
      var parent = this.isSvgGeoData() ? this.svgRootLayer_ : this.mapLayer_;

      for (i = 0, len = this.internalGeoData.length; i < len; i++) {
        geom = this.internalGeoData[i];
        this.drawGeometry_(geom, parent);
      }
    }

    for (i = this.seriesList.length; i--;) {
      series = this.seriesList[i];
      series.parentBounds(this.dataBounds_);
      series.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    var state = anychart.ConsistencyState.MAP_LABELS;
    if (this.isSvgGeoData())
      state |= anychart.ConsistencyState.APPEARANCE;
    this.invalidate(state);
  }

  var viewSpacePath;
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_ZOOM)) {
    var srcZoom = this.getZoomLevel();
    var dstZoom = this.zoomInc * srcZoom;

    tx = this.getMapLayer().getFullTransformation();
    dx = tx.getTranslateX();
    dy = tx.getTranslateY();

    if (!((srcZoom == minZoomLevel && dstZoom < minZoomLevel) ||
        (srcZoom == maxZoomLevel && dstZoom > maxZoomLevel)) &&
        mapLayer || this.unlimitedZoom) {

      var isInit = !(goog.isDef(this.cx) && goog.isDef(this.cy));
      if (isNaN(this.cx) || isNaN(this.cy)) {
        bounds = this.scale().getViewSpace().getBoundsWithoutTransform();

        var plotBoundsCx = bounds.left + bounds.width / 2;
        var plotBoundsCy = bounds.top + bounds.height / 2;

        cx = (plotBoundsCx - dx) / tx.getScaleX();
        cy = (plotBoundsCy - dy) / tx.getScaleY();

        if (isNaN(this.cx)) this.cx = cx;
        if (isNaN(this.cy)) this.cy = cy;
      }

      var zoomOut = this.zoomInc < 1;

      if (!this.unlimitedZoom) {
        if (dstZoom > maxZoomLevel) {
          this.zoomInc = maxZoomLevel / this.getZoomLevel();
          dstZoom = this.zoomInc * srcZoom;
        } else if (dstZoom < minZoomLevel && zoomOut) {
          this.zoomInc = minZoomLevel / this.getZoomLevel();
          dstZoom = this.zoomInc * srcZoom;
        }
      }


      var duration = this.zoomDuration || anychart.mapModule.Chart.TIMINGS.DEFAULT_ZOOM_DURATION;

      if ((!this.zoomAnimation || this.zoomAnimation.isStopped()) && !isInit) {
        this.zoomSource = srcZoom;
        this.zoomDest = dstZoom;

        var equalZoom = anychart.math.roughlyEqual(this.zoomSource, this.zoomDest, 0.00001);
        var allowZoom = (equalZoom && this.allowMoveOnEqualZoomLevels || !equalZoom) &&
            this != this.getCurrentScene() ? true : this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START));

        if (allowZoom) {
          if (anychart.window['anychart']['ui']['ContextMenu']) {
            var contextMenu = this.contextMenu();
            if (contextMenu.isVisible()) contextMenu.hide();
          }

          viewSpacePath = this.getMapLayer();
          boundsWithTx = viewSpacePath.getBounds();

          cx = (this.cx - dx) / this.zoomSource;
          cy = (this.cy - dy) / this.zoomSource;

          if (!this.unlimitedZoom) {
            if (cx < boundsWithTx.left)
              cx = boundsWithTx.left;
            else if (cx > boundsWithTx.getRight())
              cx = boundsWithTx.getRight();

            if (cy < boundsWithTx.top)
              cy = boundsWithTx.top;
            else if (cy > boundsWithTx.getBottom())
              cy = boundsWithTx.getBottom();
          }

          var dx_ = cx * (1 - this.zoomSource);
          var dy_ = cy * (1 - this.zoomSource);

          this.zoomAnimation = new anychart.mapModule.animation.Zoom(
              this,
              [srcZoom, dx, dy],
              [dstZoom, dx_, dy_],
              duration,
              this != this.getCurrentScene());

          this.zoomAnimation
              .play();
        } else if (equalZoom) {
          var scene = this.getCurrentScene();
          var sceneLayer = scene.getMapLayer();
          bounds = sceneLayer.getBounds();
          cx = bounds.left + bounds.width / 2;
          cy = bounds.top + bounds.height / 2;
          tx = sceneLayer.getTransformationMatrix();
          dx = cx * (1 - scene.fullZoom);
          dy = cy * (1 - scene.fullZoom);

          this.getMapLayer().setTransformationMatrix(scene.fullZoom, 0, 0, scene.fullZoom, dx, dy);

          this.scale().setMapZoom(scene.fullZoom);
          this.scale().setOffsetFocusPoint(dx, dy);

          this.updateSeriesOnZoomOrMove();
        }
      }
    }

    this.allowMoveOnEqualZoomLevels = false;
    this.zoomDuration = NaN;
    this.zoomInc = 1;
    this.markConsistent(anychart.ConsistencyState.MAP_ZOOM);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_MOVE)) {
    if (this.getZoomLevel() != minZoomLevel && mapLayer) {
      // viewSpacePath = this.scale().getViewSpace();
      boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
      boundsWithTx = mapLayer.getBoundsWithTransform(mapLayer.getFullTransformation());

      if (this.lastZoomIsUnlimited) {
        if ((boundsWithTx.left + this.offsetX >= boundsWithoutTx.left) && this.offsetX > 0) {
          dx = 0;
        } else if ((boundsWithTx.getRight() + this.offsetX <= boundsWithoutTx.getRight()) && this.offsetX < 0) {
          dx = 0;
        } else {
          dx = this.offsetX;
        }
      } else if (boundsWithTx.left + this.offsetX >= boundsWithoutTx.left) {
        dx = boundsWithoutTx.left - boundsWithTx.left;
      } else if (boundsWithTx.getRight() + this.offsetX <= boundsWithoutTx.getRight()) {
        dx = boundsWithoutTx.getRight() - boundsWithTx.getRight();
      } else {
        dx = this.offsetX;
      }

      if (this.lastZoomIsUnlimited) {
        if ((boundsWithTx.top + this.offsetY >= boundsWithoutTx.top) && this.offsetY > 0) {
          dy = 0;
        } else if ((boundsWithTx.getBottom() + this.offsetY <= boundsWithoutTx.getBottom()) && this.offsetY < 0) {
          dy = 0;
        } else {
          dy = this.offsetY;
        }
      } else if (boundsWithTx.top + this.offsetY >= boundsWithoutTx.top) {
        dy = boundsWithoutTx.top - boundsWithTx.top;
      } else if (boundsWithTx.getBottom() + this.offsetY <= boundsWithoutTx.getBottom()) {
        dy = boundsWithoutTx.getBottom() - boundsWithTx.getBottom();
      } else {
        dy = this.offsetY;
      }

      dx = dx / this.getZoomLevel();
      dy = dy / this.getZoomLevel();

      this.offsetX = 0;
      this.offsetY = 0;

      if (dx || dy) {
        this.moving = true;
        mapLayer.appendTransformationMatrix(1, 0, 0, 1, dx, dy);

        tx = mapLayer.getSelfTransformation();
        this.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());
        this.updateSeriesOnZoomOrMove();
      }

      //debug shapes
      // var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
      // var boundsWithTx = mapLayer.getBounds();
      //
      // if (!this.bwt) this.bwt = this.container().rect().zIndex(1000);
      // this.bwt.setBounds(boundsWithoutTx);
      //
      // if (!this.bwit) this.bwit = this.container().rect().zIndex(1000);
      // this.bwit.setBounds(boundsWithTx);
    }

    this.markConsistent(anychart.ConsistencyState.MAP_MOVE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_AXES)) {
    if (this.getCreated('axesSettings')) {
      axes = this.axesSettings_.getItems();
      for (i = 0; i < axes.length; i++) {
        axis = axes[i];
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.MAP_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GRIDS)) {
    if (this.getCreated('gridsSettings')) {
      grids = this.gridsSettings_.getItems();
      for (i = 0, len = grids.length; i < len; i++) {
        grid = grids[i];
        grid.suspendSignalsDispatching();
        grid.scale(/** @type {anychart.mapModule.scales.Geo} */(this.scale()));
        grid.container(this.rootElement);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.MAP_GRIDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_CROSSHAIR)) {
    var crosshair = /** @type {anychart.core.ui.Crosshair} */(this.crosshair());
    crosshair.suspendSignalsDispatching();
    crosshair.parentBounds(contentAreaBounds);
    crosshair.container(this.rootElement);
    crosshair.draw();
    crosshair.resumeSignalsDispatching(false);

    this.markConsistent(anychart.ConsistencyState.MAP_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var path;
    var unboundRegions = this.unboundRegions();
    if (unboundRegions == anychart.enums.MapUnboundRegionsMode.AS_IS) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        path = this.mapPaths[i];
        path.visible(true);
        path.removeAllListeners();
        delete path.tag;
      }
    } else if (goog.isObject(unboundRegions) && unboundRegions.enabled()) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        path = this.mapPaths[i];
        path.visible(true);
        path.removeAllListeners();
        delete path.tag;
        if (anychart.utils.instanceOf(path, acgraph.vector.Shape)) {
          path
              .fill(unboundRegions.fill())
              .stroke(unboundRegions.stroke());
        }
      }
    } else {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        path = this.mapPaths[i];
        path.visible(false);
        path.removeAllListeners();
        delete path.tag;
      }
    }

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    for (i = this.seriesList.length; i--;) {
      series = this.seriesList[i];

      seriesType = series.getType();
      this.applyLabelsOverlapState_[seriesType] = this.applyLabelsOverlapState_[seriesType] || !series.isConsistent();

      series.suspendSignalsDispatching();
      series.setParentEventTarget(this.getRootScene());
      series.setAutoGeoIdField(/** @type {string} */(this.getOption('geoIdField')));
      series.draw();
      series.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_LABELS)) {
    this.applyLabelsOverlapState();
    this.markConsistent(anychart.ConsistencyState.MAP_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.getCreated('colorRange')) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.container(this.rootElement);
      this.colorRange_.zIndex(anychart.mapModule.Chart.ZINDEX_COLOR_RANGE);
      this.colorRange_.draw();
      this.colorRange_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.MAP_COLOR_RANGE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_CALLOUT)) {
    for (i = 0, len = this.callouts_.length; i < len; i++) {
      callout = this.callouts_[i];
      if (callout) {
        callout.suspendSignalsDispatching();
        callout.container(this.rootElement);
        callout.zIndex(anychart.mapModule.Chart.ZINDEX_CALLOUT);
        callout.draw();
        callout.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.MAP_CALLOUT);
  }
};


//endregion
//region --- Feature manipulation
/**
 * Traverser for complex feature.
 * @param {Object} feature Geo feature.
 * @param {!Function} f Function for applying to feature children.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
anychart.mapModule.Chart.prototype.featureTraverser = function(feature, f, opt_obj) {
  if (feature['type'] == 'group') {
    for (var i = 0, len = feature['features'].length; i < len; i++) {
      var feature_ = feature['features'][i];
      f.call(opt_obj, feature);
      this.featureTraverser(feature_, f, opt_obj);
    }
  } else {
    f.call(opt_obj, feature);
  }
};


/**
 * It returns feature by its id.
 * @param {string} id
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.getFeatureById = function(id) {
  if (!this.internalGeoData)
    return null;
  for (var i = 0, len = this.internalGeoData.length; i < len; i++) {
    var feature_ = this.internalGeoData[i];
    if (feature_['properties'][this.getOption('geoIdField')] == id) {
      return feature_;
    }
  }
  return null;
};


/**
 * Translate feature on passed dx and dy.
 * @param {string} id Feature id.
 * @param {number} dx Offset x coordinate.
 * @param {number} dy Offset y coordinate.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.translateFeature = function(id, dx, dy) {
  var feature = this.getFeatureById(id);
  var bounds, latLon, current_tx, featureTx;
  if (feature && !this.isSvgGeoData()) {
    bounds = feature.domElement.getBoundsWithoutTransform();
    latLon = this.scale().inverseTransform(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2);
    current_tx = this.scale().pickTx(latLon[0], latLon[1])[0];
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;

    dx = dx / this.getZoomLevel();
    dy = dy / this.getZoomLevel();

    var startCoords_ = this.scale().pxToScale(bounds.left, bounds.top);
    var endCoords_ = this.scale().pxToScale(bounds.left + dx, bounds.top + dy);

    var dx_ = endCoords_[0] - startCoords_[0];
    var dy_ = endCoords_[1] - startCoords_[1];

    for (var i = 0, len = feature['polygones'].length; i < len; i++) {
      var polygon = feature['polygones'][i];
      var outerPath = polygon['outerPath'];
      for (var j = 0; j < outerPath.length - 1; j += 2) {
        outerPath[j] += dx_;
        outerPath[j + 1] += dy_;
      }

      var holes = polygon['holes'];
      for (j = 0; j < holes.length - 1; j += 2) {
        holes[j] += dx_;
        holes[j + 1] += dy_;
      }
    }

    featureTx.xoffset = featureTx.xoffset ? featureTx.xoffset + dx_ : dx_;
    featureTx.yoffset = featureTx.yoffset ? featureTx.yoffset + dy_ : dy_;

    bounds.left += dx;
    bounds.top += dy;

    var leftTop = this.scale().pxToScale(bounds.left, bounds.top);
    var widthHeight = this.scale().pxToScale(bounds.left + bounds.width, bounds.top + bounds.height);

    featureTx.heatZone = anychart.math.rect(
        leftTop[0], leftTop[1], Math.abs(widthHeight[0] - leftTop[0]), Math.abs(widthHeight[1] - leftTop[1]));

    this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * Translating feature.
 * @param {string} id Feature id.
 * @param {number=} opt_dx Offset x coordinate.
 * @param {number=} opt_dy Offset y coordinate.
 * @return {anychart.mapModule.Chart|Array.<number>}
 */
anychart.mapModule.Chart.prototype.featureTranslation = function(id, opt_dx, opt_dy) {
  var feature = this.getFeatureById(id);
  var bounds, latLon, current_tx, featureTx;
  if (feature) {
    bounds = feature.domElement.getBoundsWithoutTransform();
    latLon = this.scale().inverseTransform(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2);
    current_tx = this.scale().pickTx(latLon[0], latLon[1])[0];
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
  }

  if (goog.isDef(opt_dx) || goog.isDef(opt_dy)) {
    if (feature && !this.isSvgGeoData()) {
      var offsetX = featureTx.xoffset || 0;
      var offsetY = featureTx.yoffset || 0;

      var offsetX_px = offsetX * this.scale().ratio;
      var offsetY_px = offsetY * this.scale().ratio;

      opt_dx = goog.isDef(opt_dx) ? opt_dx : offsetX_px;
      opt_dy = goog.isDef(opt_dy) ? opt_dy : offsetY_px;

      opt_dx = opt_dx / this.getZoomLevel();
      opt_dy = opt_dy / this.getZoomLevel();

      var dx_ = (opt_dx - offsetX_px) / this.scale().ratio;
      var dy_ = (opt_dy - offsetY_px) / this.scale().ratio;

      for (var i = 0, len = feature['polygones'].length; i < len; i++) {
        var polygon = feature['polygones'][i];
        var outerPath = polygon['outerPath'];
        for (var j = 0; j < outerPath.length - 1; j += 2) {
          outerPath[j] += dx_;
          outerPath[j + 1] += dy_;
        }

        var holes = polygon['holes'];
        for (j = 0; j < holes.length - 1; j += 2) {
          holes[j] += dx_;
          holes[j + 1] += dy_;
        }
      }

      featureTx.xoffset = featureTx.xoffset ? featureTx.xoffset + dx_ : dx_;
      featureTx.yoffset = featureTx.yoffset ? featureTx.yoffset + dy_ : dy_;

      bounds.left += opt_dx - offsetX_px;
      bounds.top += opt_dy - offsetY_px;

      var leftTop = this.scale().pxToScale(bounds.left, bounds.top);
      var widthHeight = this.scale().pxToScale(bounds.left + bounds.width, bounds.top + bounds.height);

      featureTx.heatZone = anychart.math.rect(
          leftTop[0], leftTop[1], Math.abs(widthHeight[0] - leftTop[0]), Math.abs(widthHeight[1] - leftTop[1]));

      this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return feature ? [(featureTx.xoffset * this.scale().ratio) || 0, (featureTx.yoffset * this.scale().ratio) || 0] : [NaN, NaN];
};


/**
 * Gets/sets feature scale factor.
 * @param {string} id Feature id.
 * @param {number=} opt_ratio Scale ratio.
 * @return {anychart.mapModule.Chart|number}
 */
anychart.mapModule.Chart.prototype.featureScaleFactor = function(id, opt_ratio) {
  var feature = this.getFeatureById(id);
  var scale, bounds, latLon, current_tx, featureTx;
  if (feature) {
    scale = this.scale();
    bounds = feature.domElement.getBounds();
    latLon = scale.inverseTransform(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2);
    current_tx = scale.pickTx(latLon[0], latLon[1])[0];
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
  }

  if (goog.isDef(opt_ratio)) {
    if (feature && !this.isSvgGeoData()) {
      var ratio = anychart.utils.toNumber(opt_ratio) || 1;

      var xoffset = featureTx.xoffset || 0;
      var yoffset = featureTx.yoffset || 0;

      var defaultScale = this.mapTX['default'].scale || anychart.mapModule.Chart.DEFAULT_TX['default']['scale'];
      var scale_ = (featureTx.scale ? featureTx.scale : defaultScale);

      var leftTop = scale.pxToScale(bounds.left, bounds.top);
      var rightBottom = scale.pxToScale(bounds.left + bounds.width, bounds.top + bounds.height);

      var left = ((leftTop[0] - xoffset) / scale_ * ratio) + xoffset;
      var top = ((leftTop[1] - yoffset) / scale_ * ratio) + yoffset;
      var right = ((rightBottom[0] - xoffset) / scale_ * ratio) + xoffset;
      var bottom = ((rightBottom[1] - yoffset) / scale_ * ratio) + yoffset;

      leftTop = scale.scaleToPx(left, top);
      rightBottom = scale.scaleToPx(right, bottom);

      var bounds_ = anychart.math.rect(leftTop[0], leftTop[1], Math.abs(rightBottom[0] - leftTop[0]), Math.abs(rightBottom[1] - leftTop[1]));

      var startCoords = scale.pxToScale(bounds_.left + bounds_.width / 2, bounds_.top + bounds_.height / 2);
      var endCoords = scale.pxToScale(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);

      var dx = endCoords[0] - startCoords[0];
      var dy = endCoords[1] - startCoords[1];

      leftTop = scale.pxToScale(bounds_.left, bounds_.top);
      rightBottom = scale.pxToScale(bounds_.left + bounds_.width, bounds_.top + bounds_.height);

      leftTop[0] += dx;
      leftTop[1] += dy;
      rightBottom[0] += dx;
      rightBottom[1] += dy;

      for (var i = 0, len = feature['polygones'].length; i < len; i++) {
        var polygon = feature['polygones'][i];
        var outerPath = polygon['outerPath'];
        for (var j = 0; j < outerPath.length - 1; j += 2) {
          outerPath[j] = (outerPath[j] - xoffset) / scale_ * ratio + xoffset + dx;
          outerPath[j + 1] = (outerPath[j + 1] - yoffset) / scale_ * ratio + yoffset + dy;
        }
        var holes = polygon['holes'];
        for (j = 0; j < holes.length - 1; j += 2) {
          holes[j] = (holes[j] - xoffset) / scale_ * ratio + xoffset + dx;
          holes[j + 1] = (holes[j + 1] - yoffset) / scale_ * ratio + yoffset + dy;
        }
      }

      featureTx.heatZone = anychart.math.rect(
          leftTop[0], leftTop[1], Math.abs(rightBottom[0] - leftTop[0]), Math.abs(rightBottom[1] - leftTop[1]));

      featureTx.xoffset = featureTx.xoffset ? featureTx.xoffset + dx : dx;
      featureTx.yoffset = featureTx.yoffset ? featureTx.yoffset + dy : dy;
      featureTx.scale = ratio;

      this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return feature ? featureTx.scale || this.mapTX['default'].scale || 1 : NaN;
};


/**
 * @param {Object} feature Feature.
 * @param {string=} opt_crs Crs.
 * @return {anychart.mapModule.Chart|string}
 * @private
 */
anychart.mapModule.Chart.prototype.featureCrs_ = function(feature, opt_crs) {
  var scale = this.scale();
  var bounds = feature.domElement.getBounds();
  var latLon = scale.inverseTransform(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2);

  var current_tx = scale.pickTx(latLon[0], latLon[1])[0];

  if (!goog.isDef(opt_crs)) {
    return goog.isDef(current_tx.crs) ? current_tx.crs : this.mapTX['default'].crs;
  } else if (!this.isSvgGeoData()) {
    var x, y, scaledCoord, x_, y_;

    var projected, oldProjection, newProjection;

    feature.domElement.clear();

    var id = feature['properties'][this.getOption('geoIdField')];
    var featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
    var old_crs = featureTx.crs || this.mapTX['default'].crs || anychart.mapModule.Chart.DEFAULT_TX['default']['crs'];
    var new_crs = opt_crs;

    oldProjection = anychart.mapModule.projections.getProjection(old_crs);
    newProjection = anychart.mapModule.projections.getProjection(new_crs);

    var xoffset = featureTx.xoffset || 0;
    var yoffset = featureTx.yoffset || 0;
    var featureScale = featureTx.scale || this.mapTX['default'].scale || anychart.mapModule.Chart.DEFAULT_TX['default']['scale'];

    for (var i = 0, len = feature['polygones'].length; i < len; i++) {
      var polygon = feature['polygones'][i];
      var outerPath = polygon['outerPath'];
      for (var j = 0; j < outerPath.length - 1; j += 2) {
        x_ = ((outerPath[j] - xoffset) / featureScale);
        y_ = ((outerPath[j + 1] - yoffset) / featureScale);

        projected = oldProjection.invert(x_, y_);
        projected = newProjection.forward(projected[0], projected[1]);

        outerPath[j] = projected[0] * featureScale + xoffset;
        outerPath[j + 1] = projected[1] * featureScale + yoffset;

        scaledCoord = scale.scaleToPx(outerPath[j], outerPath[j + 1]);

        x = scaledCoord[0];
        y = scaledCoord[1];

        if (!j)
          feature.domElement.moveTo(x, y);
        else
          feature.domElement.lineTo(x, y);
      }
      var holes = polygon['holes'];
      for (j = 0; j < holes.length - 1; j += 2) {
        x_ = ((holes[j] - xoffset) / featureScale);
        y_ = ((holes[j + 1] - yoffset) / featureScale);

        projected = oldProjection.invert(x_, y_);
        projected = newProjection.forward(projected[0], projected[1]);

        holes[j] = projected[0] * featureScale + xoffset;
        holes[j + 1] = projected[1] * featureScale + yoffset;

        scaledCoord = scale.scaleToPx(holes[j], holes[j + 1]);

        x = scaledCoord[0];
        y = scaledCoord[1];

        if (!j)
          feature.domElement.moveTo(x, y);
        else
          feature.domElement.lineTo(x, y);
      }
    }

    var bounds_ = feature.domElement.getBoundsWithoutTransform();
    var startCoords = scale.pxToScale(bounds_.left + bounds_.width / 2, bounds_.top + bounds_.height / 2);
    var endCoords = scale.pxToScale(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);

    var dx = endCoords[0] - startCoords[0];
    var dy = endCoords[1] - startCoords[1];

    for (i = 0, len = feature['polygones'].length; i < len; i++) {
      polygon = feature['polygones'][i];
      outerPath = polygon['outerPath'];
      for (j = 0; j < outerPath.length - 1; j += 2) {
        outerPath[j] += dx;
        outerPath[j + 1] += dy;
      }

      holes = polygon['holes'];
      for (j = 0; j < holes.length - 1; j += 2) {
        holes[j] += dx;
        holes[j + 1] += dy;
      }
    }

    feature.domElement.setPosition(bounds.left + bounds.width / 2 - bounds_.width / 2, bounds.top + bounds.height / 2 - bounds_.height / 2);

    bounds_ = feature.domElement.getBounds();

    var leftTop = scale.pxToScale(bounds_.left, bounds_.top);
    var widthHeight = scale.pxToScale(bounds_.left + bounds_.width, bounds_.top + bounds_.height);

    featureTx.heatZone = anychart.math.rect(
        leftTop[0], leftTop[1], Math.abs(widthHeight[0] - leftTop[0]), Math.abs(widthHeight[1] - leftTop[1]));
    featureTx.xoffset = featureTx.xoffset ? featureTx.xoffset + dx : dx;
    featureTx.yoffset = featureTx.yoffset ? featureTx.yoffset + dy : dy;
    featureTx.crs = new_crs;
    featureTx.curProj = newProjection;
    featureTx.srcCrs = old_crs;
    featureTx.srcProj = oldProjection;

    this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * Sets crs to feature.
 * @param {string} id Feature id.
 * @param {string=} opt_crs String crs representation.
 * @return {anychart.mapModule.Chart|string}
 */
anychart.mapModule.Chart.prototype.featureCrs = function(id, opt_crs) {
  var feature = this.getFeatureById(id);
  if (!feature) return null;

  return this.featureCrs_(feature, opt_crs);
};


/**
 * Sets crs to map.
 * @param {(Object|Function|anychart.enums.MapProjections|string)=} opt_value Name of common projection
 * (anychart.enums.MapProjections) or projection string representation or projection Object or Function
 * (like d3 projection, example - https://github.com/d3/d3-geo-projection/blob/master/src/bonne.js).
 * @return {Object|Function|anychart.enums.MapProjections|string|anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.crs = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeMapProjections(opt_value);
    if (this.crs_ != opt_value) {
      this.crs_ = opt_value;
      this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.crs_ || this.currentCrs_ || anychart.mapModule.Chart.DEFAULT_TX['default']['crs'];
};


//endregion
//region --- Drilling
//----------------------------------------------------------------------------------------------------------------------
//
//  Drilling.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Makes visible root layer.
 */
anychart.mapModule.Chart.prototype.show = function() {
  this.rootElement.visible(true);
};


/**
 * Makes hidden root layer.
 */
anychart.mapModule.Chart.prototype.hide = function() {
  this.rootElement.visible(false);

  var root = this.getRootScene();
  if (root.prevHoverSeriesStatus) {
    root.dispatchEvent(this.makeInteractivityPointEvent('hovered', {'target': this}, root.prevHoverSeriesStatus, true, true));
    root.prevHoverSeriesStatus = null;
  }
  root.unlisten(goog.events.EventType.MOUSEMOVE, root.updateTooltip);

  var colorRange = this.getCreated('colorRange');
  if (colorRange && colorRange.enabled()) {
    colorRange.hideMarker();
  }
};


/**
 * Returns root scene (map).
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.getRootScene = function() {
  var rootScene = this.rootScene;
  if (!rootScene) {
    this.scenes = {};
    rootScene = this.scenes[anychart.mapModule.Chart.ROOT_SCENE_NAME] = this;
    this.sceneId = anychart.mapModule.Chart.ROOT_SCENE_NAME;
    this.currentScene = rootScene;
    this.rootScene = rootScene;
  }

  return rootScene;
};


/**
 * Returns current scene (map).
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.getCurrentScene = function() {
  return this.getRootScene().currentScene;
};


/**
 * Drill down map.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.drillDownMap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value)) {
      this.drilldownMap_ = opt_value;

      if (this.internalDrillDownMap) {
        goog.object.forEach(this.internalDrillDownMap, function(value) {
          value.dispose();
        });
      }
      this.internalDrillDownMap = {};
    }
    return this;
  }

  return this.drilldownMap_;
};


/**
 * Do something after animation.
 * @param {anychart.mapModule.Chart} scene Scene.
 * @param {Function} callback Callback.
 * @param {...*} var_args Arguments.
 */
anychart.mapModule.Chart.prototype.doAfterAnimation = function(scene, callback, var_args) {
  var opt_args = goog.array.slice(arguments, 2);
  if (scene.zoomAnimation) {
    scene.zoomAnimation.listenOnce(goog.fx.Transition.EventType.END, function(e) {
      callback.apply(this, opt_args);
    }, false, scene);
  } else {
    callback.apply(scene, opt_args);
  }
};


/**
 * Returns bread crumbs path.
 * @return {!Array.<anychart.mapModule.Point>}
 */
anychart.mapModule.Chart.prototype.getDrilldownPath = function() {
  var root = this.getRootScene();
  var path = [new anychart.mapModule.Point(null, this, null, null)];
  path.push.apply(path, goog.array.slice(root.currentBreadcrumbsPath, 0));
  return path;
};


/**
 * Returns drill change event object.
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.createDrillChangeEvent = function() {
  var path = this.getDrilldownPath();
  return {
    'type': anychart.enums.EventType.DRILL_CHANGE,
    'path': path,
    'current': path[path.length - 1]
  };
};


/**
 * Drill to map.
 * @param {?string} id .
 * @param {anychart.mapModule.Chart=} opt_map .
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.drillTo = function(id, opt_map) {
  var map = opt_map;
  var root = this.getRootScene();
  var scene = this.getCurrentScene();
  if (map == scene || root.drillingInAction)
    return this;

  if (goog.isNull(id) || id == 'null') {
    this.drillUp_(root, root.currentBreadcrumbsPath.length);
    return this;
  }

  if (goog.isDef(opt_map)) {
    this.drillDown_(id, opt_map);
  } else {
    if (this.drilldownMap_ && this.drilldownMap_[id]) {
      this.drillDown_(id, this.drilldownMap_[id]);
    } else {
      var target;
      for (var i = root.currentBreadcrumbsPath.length; i--;) {
        var crumb = root.currentBreadcrumbsPath[i];
        if (crumb.getId() == id) {
          target = /** @type {anychart.mapModule.Chart} */(crumb.getCurrentChart());
          break;
        }
      }

      if (target) {
        this.drillUp_(target, root.currentBreadcrumbsPath.length - 1 - i);
      } else {
        anychart.core.reporting.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
      }
      return this;
    }
  }
  return this;
};


/**
 *
 * @param {string} id .
 * @param {anychart.mapModule.Chart} target .
 * @private
 */
anychart.mapModule.Chart.prototype.drillDown_ = function(id, target) {
  if (!this.container())
    return;

  var root = this.getRootScene();
  var scene = this.getCurrentScene();
  var newScene = target;

  root.drillingInAction = true;

  var feature = scene.getFeatureById(id);
  var featureBounds, featureProperties;
  if (feature) {
    featureBounds = feature.domElement.getAbsoluteBounds();
    featureProperties = feature['properties'];
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
    var plotBounds = root.getPlotBounds();
    if (plotBounds) {
      var cx = plotBounds.left + plotBounds.width / 2 - 1;
      var cy = plotBounds.top + plotBounds.height / 2 - 1;
      featureBounds = new anychart.math.Rect(cx, cy, 1, 1);
    } else {
      featureBounds = new anychart.math.Rect(0, 0, 1, 1);
    }
    featureProperties = {};
    featureProperties[scene.getOption('geoIdField')] = id;
  }

  var mapDefaultTheme = anychart.getFlatTheme('map');

  if (newScene.getOption('maxZoomLevel') == mapDefaultTheme['maxZoomLevel']) {
    newScene.setOption('maxZoomLevel', (/** @type {number} */(scene.getOption('maxZoomLevel'))));
  }

  if (newScene.getOption('minZoomLevel') == mapDefaultTheme['minZoomLevel']) {
    newScene.setOption('minZoomLevel', (/** @type {number} */(scene.getOption('minZoomLevel'))));
  }

  if (newScene.getSeriesCount() && !newScene.getSeries(0).colorScale()) {
    var sourceScale = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(scene.getSeries(0).colorScale());
    newScene.getSeries(0).colorScale(sourceScale);
  }

  if (newScene.getSeriesCount() && newScene.getSeries(0).seriesType() == 'choropleth' && !newScene.getCreated('colorRange') && scene.getCreated('colorRange')) {
    var sourceColorRange = scene.colorRange();
    newScene.colorRange(sourceColorRange.serialize());

    var colorRange = /** @type {anychart.colorScalesModule.ui.ColorRange} */(newScene.colorRange());
    colorRange.labels()['format'](/** @type {Function|string} */(sourceColorRange.labels()['format']()));
    colorRange.labels()['positionFormatter'](/** @type {Function} */(sourceColorRange.labels()['positionFormatter']()));
    colorRange.minorLabels()['format'](/** @type {Function|string} */(sourceColorRange.minorLabels()['format']()));
    colorRange.minorLabels()['positionFormatter'](/** @type {Function} */(sourceColorRange.minorLabels()['positionFormatter']()));
  }

  if (!newScene.getCreated('legend') && scene.getCreated('legend')) {
    var sourceLegend = scene.legend();
    newScene.legend(sourceLegend.serialize());
  }

  newScene.parentScene = scene;
  newScene.rootScene = this.getRootScene();
  newScene
      .enabled(true)
      .container(/** @type {acgraph.vector.ILayer} */(this.container()))
      .draw();
  newScene.hide();
  newScene.sceneId = id;
  newScene.setParentEventTarget(root);


  var zoomParam = newScene.zoomToBounds(featureBounds, undefined, true);
  newScene.unlimitedZoom = true;
  newScene.zoomDuration = 0;
  newScene.zoomTo(1 / zoomParam[0], zoomParam[1], zoomParam[2]);


  this.doAfterAnimation(newScene, function(newScene, scene, root, featureBounds, featureProperties) {
    if (!root.drillingInAction)
      return;

    scene.tooltip().hide(null);
    scene.hide();
    scene.unhover();

    root.currentScene = newScene;
    root.currentBreadcrumbsPath.push(new anychart.mapModule.Point(scene, newScene, featureProperties, this.sceneId));
    // root.dispatchEvent(this.createDrillChangeEvent());

    newScene.show();
    newScene.tooltip().hide(null);

    var zoomParam = newScene.zoomToBounds(featureBounds, undefined, true);
    newScene.zoomDuration = 400;
    newScene.unlimitedZoom = true;

    newScene.zoomTo(this.getOption('minZoomLevel'), zoomParam[1], zoomParam[2]);

    this.doAfterAnimation(newScene, function(root) {
      this.zoomTo(this.getOption('minZoomLevel'));
      root.drillingInAction = false;
      setTimeout(goog.bind(function() { this.dispatchEvent(this.createDrillChangeEvent()); }, root), 0);
    }, root);
  }, newScene, scene, root, featureBounds, featureProperties);
};


/**
 * @return {boolean}
 * @private
 */
anychart.mapModule.Chart.prototype.readyForDrillUp_ = function() {
  var scene = this.getCurrentScene();
  var sceneLayer = scene.getMapLayer();
  var minZoom = /** @type {number} */(scene.getOption('minZoomLevel'));
  var bounds = sceneLayer.getBounds();
  var cx = bounds.left + bounds.width / 2;
  var cy = bounds.top + bounds.height / 2;
  var tx = sceneLayer.getTransformationMatrix();
  var dx = cx * (1 - minZoom);
  var dy = cy * (1 - minZoom);

  return anychart.math.roughlyEqual(scene.getZoomLevel(), minZoom) &&
      anychart.math.roughlyEqual(tx[4], dx) &&
      anychart.math.roughlyEqual(tx[5], dy);
};


/**
 *
 * @param {anychart.mapModule.Chart} target
 * @param {number=} opt_levels number of levels up.
 * @private
 */
anychart.mapModule.Chart.prototype.drillUp_ = function(target, opt_levels) {
  var root = this.getRootScene();
  var source = this.getCurrentScene();
  if (source == target)
    return;

  root.drillingInAction = true;

  source.zoomDuration = 700;
  if (!source.readyForDrillUp_()) {
    source.zoomTo(/** @type {number} */(this.getOption('minZoomLevel')));
  }
  var levels = opt_levels || 1;

  this.doAfterAnimation(source, function(target, root) {
    var crumb = root.currentBreadcrumbsPath[root.currentBreadcrumbsPath.length - levels];
    var feature = target.getFeatureById(crumb.getId());

    var zoom, cx, cy;
    if (!feature) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [this.sceneId]);
      zoom = 10;
    } else {
      var domEl = feature.domElement;
      var featureBounds = domEl.getAbsoluteBounds();
      var zoomParam = this.zoomToBounds(featureBounds);

      zoom = zoomParam[0];
      cx = zoomParam[1];
      cy = zoomParam[2];
    }

    this.unlimitedZoom = true;
    this.zoomDuration = 400;
    this.zoomTo(1 / zoom, cx, cy);

    this.doAfterAnimation(this, function(target, root) {
      this.zoomTo(this.getOption('minZoomLevel'));

      this.hide();
      this.unhover();
      this.enabled(false);

      root.currentScene = target;
      root.drillingInAction = false;

      goog.array.splice(root.currentBreadcrumbsPath, root.currentBreadcrumbsPath.length - levels, levels);

      target.tooltip().hide(null);
      this.tooltip().hide(null);

      target.show();
      setTimeout(goog.bind(function() { this.dispatchEvent(this.createDrillChangeEvent()); }, root), 0);
    }, target, root);
  }, target, root);
};


/**
 * Drill up.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.drillUp = function() {
  var root = this.getRootScene();

  var scene = this.getCurrentScene();
  var parentScene = scene.parentScene;

  if (!parentScene || root.drillingInAction) {
    root.drillingInAction = false;
    return this;
  }

  this.drillUp_(parentScene);

  return this;
};


//endregion
//region --- Map navigation
//----------------------------------------------------------------------------------------------------------------------
//
//  Zoom / move.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates zoom event.
 * @param {string} type .
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.createZoomEvent = function(type) {
  return {
    'type': type,
    'target': this.getCurrentScene(),
    'from': this.zoomSource,
    'current': this.fullZoom,
    'to': this.zoomDest
  };
};


/**
 * Current map zoom level.
 * @return {number}
 */
anychart.mapModule.Chart.prototype.getZoomLevel = function() {
  return this.fullZoom;
};


/**
 * Zooms the map to passed zoom level and coordinates.
 * @param {number} value Zoom level for zooming.
 * @param {number=} opt_cx X coord of zoom point.
 * @param {number=} opt_cy Y coord of zoom point.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.zoomTo = function(value, opt_cx, opt_cy, opt_duration) {
  if (!this.unlimitedZoom)
    value = goog.math.clamp(value, /** @type {number} */(this.getOption('minZoomLevel')), /** @type {number} */(this.getOption('maxZoomLevel')));
  return this.zoom(value / this.getZoomLevel(), opt_cx, opt_cy, opt_duration);
};


/**
 * Zoom to feature for passed id.
 * @param {string|Array.<string>} id Feature id.
 * @param {number=} opt_duration Duration of zoom animation.
 */
anychart.mapModule.Chart.prototype.zoomToFeature = function(id, opt_duration) {
  var scene = this.getCurrentScene();
  var features = [];
  if (!goog.isArray(id))
    id = [id];

  var bounds, domEl, feature;
  var zoomSessionId = '';
  for (var i = 0, len = id.length; i < len; i++) {
    var featureId = id[i];
    feature = scene.getFeatureById(featureId);
    if (feature) {
      zoomSessionId += featureId + ';';
      features.push(feature);
    }
  }

  if (!features.length) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
    return;
  }

  var tx = scene.getMapLayer().getFullTransformation();
  var goToHome = this.prevZoomedFeature && zoomSessionId == this.prevZoomedFeature && this.prevTx && tx.equals(this.prevTx);

  for (i = 0, len = features.length; i < len; i++) {
    feature = features[i];
    domEl = feature.domElement;
    if (!bounds) {
      bounds = goToHome ? domEl.getBounds() : domEl.getAbsoluteBounds();
    } else {
      bounds.boundingRect(goToHome ? domEl.getBounds() : domEl.getAbsoluteBounds());
    }
  }

  var srcZoom = tx.getScaleX();
  var dx = tx.getTranslateX();
  var dy = tx.getTranslateY();

  var zoomParam = scene.zoomToBounds(bounds, undefined, goToHome);
  var zoom = zoomParam[0];
  var cx = zoomParam[1];
  var cy = zoomParam[2];

  this.doAfterAnimation(scene, function() {
    this.allowMoveOnEqualZoomLevels = true;
    this.zoomDuration = goog.isDef(opt_duration) ? opt_duration : isNaN(this.zoomDuration) ? anychart.mapModule.Chart.TIMINGS.ZOOM_TO_FEATURE_DURATION : this.zoomDuration;
    if (goToHome) {
      if (anychart.math.roughlyEqual(srcZoom, zoom, 0.00001)) {
        if (this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START))) {
          this.zoomAnimation = new anychart.mapModule.animation.Zoom(
              this, [1, dx, dy], [1, dx + cx, dy + cy], this.zoomDuration);
          this.zoomAnimation.play();
        }
      } else {
        this.zoomTo(this.getOption('minZoomLevel'), cx, cy, this.zoomDuration);
      }

      this.prevZoomedFeature = null;
      this.prevTx = null;
    } else {
      if (anychart.math.roughlyEqual(srcZoom, zoom, 0.00001)) {
        if (this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START))) {
          this.zoomAnimation = new anychart.mapModule.animation.Zoom(
              this, [1, dx, dy], [1, dx + cx, dy + cy], this.zoomDuration);
          this.zoomAnimation.play();
        }
      } else {
        this.zoomTo(zoom, cx, cy, this.zoomDuration);
      }
      this.prevZoomedFeature = zoomSessionId;

      if (this.zoomAnimation) {
        this.zoomAnimation.listenOnce(goog.fx.Transition.EventType.END, function(e) {
          if (this.prevZoomedFeature) {
            this.prevTx = this.getCurrentScene().getMapLayer().getFullTransformation().clone();
          } else {
            this.prevTx = null;
          }
        }, false, this);
      }
    }
  });
};


/**
 * Zoom to passed bounds.
 * @param {anychart.math.Rect} bounds .
 * @param {anychart.math.Rect=} opt_sourceBounds .
 * @param {boolean=} opt_fullZoomOut .
 * @return {Array.<number>}
 */
anychart.mapModule.Chart.prototype.zoomToBounds = function(bounds, opt_sourceBounds, opt_fullZoomOut) {
  var scene = this.getCurrentScene();
  var x = bounds.left + bounds.width / 2;
  var y = bounds.top + bounds.height / 2;

  var sourceBounds = goog.isDef(opt_sourceBounds) ? opt_sourceBounds : scene.getPlotBounds();
  var plotBoundsCx = sourceBounds.left + sourceBounds.width / 2;
  var plotBoundsCy = sourceBounds.top + sourceBounds.height / 2;

  var widthRatio = bounds.width / sourceBounds.width;
  var heightRatio = bounds.height / sourceBounds.height;

  var cx, cy;
  var zoom = 1 / Math.max(widthRatio, heightRatio);

  if (!opt_fullZoomOut)
    zoom = Math.max(Math.min(zoom * scene.getZoomLevel(), /** @type {number} */ (scene.getOption('maxZoomLevel'))), /** @type {number} */ (scene.getOption('minZoomLevel'))) / scene.getZoomLevel();

  if (anychart.math.roughlyEqual(zoom, 1, 0.0000001)) {
    cx = plotBoundsCx - x;
    cy = plotBoundsCy - y;
  } else {
    cx = (plotBoundsCx - zoom * x) / (1 - zoom);
    cy = (plotBoundsCy - zoom * y) / (1 - zoom);
  }
  zoom *= scene.getZoomLevel();

  return [zoom, cx, cy];
};


/**
 * Zoom in.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.zoomIn = function(opt_duration) {
  return this.zoom(/** @type {number} */ (this.getOption('zoomFactor')), undefined, undefined, opt_duration);
};


/**
 * Zoom out.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.zoomOut = function(opt_duration) {
  return this.zoom(1 / /** @type {number} */ (this.getOption('zoomFactor')), undefined, undefined, opt_duration);
};


/**
 * Fit all.
 * @return {anychart.mapModule.Chart}
 */
anychart.mapModule.Chart.prototype.fitAll = function() {
  if (!this.drillingInAction) {
    if (this.zoomAnimation)
      this.zoomAnimation.stop();
    this.doAfterAnimation(this, function() {
      this.goingToHome = true;
      this.zoomDuration = anychart.mapModule.Chart.TIMINGS.ZOOM_TO_HOME_DURATION;

      var scene = this.getCurrentScene();
      scene.zoomTo(scene.getOption('minZoomLevel'));

      this.doAfterAnimation(this, function() {
        this.goingToHome = false;
      });
    });
  }
  return this;
};


/**
 * It increases map zoom on passed value.
 * @param {number} value Zoom value.
 * @param {number=} opt_cx Center X value.
 * @param {number=} opt_cy Center Y value.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.mapModule.Chart} Returns itself for chaining.
 */
anychart.mapModule.Chart.prototype.zoom = function(value, opt_cx, opt_cy, opt_duration) {
  if (goog.isDef(value)) {
    var state = 0;
    var signal = 0;

    if (goog.isDef(opt_duration))
      this.zoomDuration = opt_duration;

    value = anychart.utils.toNumber(value);
    if (((this.getZoomLevel() == /** @type {number} */ (this.getOption('minZoomLevel')) && value < 1) ||
        (this.getZoomLevel() == /** @type {number} */ (this.getOption('maxZoomLevel')) && value > 1)) && !this.unlimitedZoom) {
      return this;
    }

    if (value != 1) {
      this.zoomInc = value;
      state = anychart.ConsistencyState.MAP_ZOOM;
      signal = anychart.Signal.NEEDS_REDRAW;
    }

    opt_cx = anychart.utils.toNumber(opt_cx);
    opt_cy = anychart.utils.toNumber(opt_cy);

    if (this.cx != opt_cx || this.cy != opt_cy) {
      this.cx = opt_cx;
      this.cy = opt_cy;
      state = anychart.ConsistencyState.MAP_ZOOM;
      signal = anychart.Signal.NEEDS_REDRAW;
    }

    this.allowMoveOnEqualZoomLevels = true;
    this.invalidate(state, signal);
  }
  return this;
};


/**
 * It moves focus point for map. By default focus point is [0,0].
 * @param {number} dx Offset x coordinate.
 * @param {number} dy Offset y coordinate.
 * @return {anychart.mapModule.Chart} Returns itself for chaining.
 */
anychart.mapModule.Chart.prototype.move = function(dx, dy) {
  if (goog.isDef(dx) || goog.isDef(dy)) {
    var state = 0;
    var signal = 0;

    if (goog.isDef(dx)) {
      dx = anychart.utils.toNumber(dx);
      if (!isNaN(dx)) {
        this.offsetX = dx;

        state = anychart.ConsistencyState.MAP_MOVE;
        signal = anychart.Signal.NEEDS_REDRAW;
      }
    }

    if (goog.isDef(dy)) {
      dy = anychart.utils.toNumber(dy);
      if (!isNaN(dy)) {
        this.offsetY = dy;

        state = anychart.ConsistencyState.MAP_MOVE;
        signal = anychart.Signal.NEEDS_REDRAW;
      }
    }

    this.invalidate(state, signal);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coordinates transformation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Transform coords in lat/lon to pixel values relative map data bounds.
 * Use map.localToGlobal(x, y) for convert returned coordinates to global coords (relative document)
 * @param {number} xLong Longitude in degrees.
 * @param {number} yLat Latitude in degrees.
 * @return {Object.<string, number>} Transformed value adjust local map data bounds.
 */
anychart.mapModule.Chart.prototype.transform = function(xLong, yLat) {
  var pixCoords = this.scale().transform(xLong, yLat);
  return {'x': pixCoords[0], 'y': pixCoords[1]};
};


/**
 * Transform coords in pixel value in coordinate system relative map data bounds to degrees values (lon/lat).
 * Use map.globalToLocal(x, y) for convert global coordinates to coordinates relative map data bounds.
 * @param {number} x X pixel value to transform.
 * @param {number} y Y pixel value to transform.
 * @return {Object.<string, number>} Object with ton/lat coordinates.
 */
anychart.mapModule.Chart.prototype.inverseTransform = function(x, y) {
  var lonLat = this.scale().inverseTransform(x, y);
  return {'x': lonLat[0], 'long': lonLat[0], 'y': lonLat[1], 'lat': lonLat[1]};
};


//endregion
//region --- Legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.mapModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];

  var series, scale, itemData;
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    for (i = 0, count = this.seriesList.length; i < count; i++) {
      series = this.seriesList[i];
      scale = series.colorScale();
      itemData = series.getLegendItemData(itemsFormat);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.id();
      itemData['meta'] = {
        scale: scale
      };
      data.push(itemData);
    }
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target() &&
        anychart.utils.instanceOf(this.colorRange_.scale(), anychart.colorScalesModule.Ordinal)) {
      scale = this.colorRange_.scale();
      series = this.colorRange_.target();
    } else {
      for (i = 0, count = this.seriesList.length; i < count; i++) {
        series = this.seriesList[i];
        if (anychart.utils.instanceOf(series.colorScale(), anychart.colorScalesModule.Ordinal)) {
          scale = series.colorScale();
          break;
        }
      }
    }
    if (scale) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        if (range.name !== 'default') {
          data.push({
            'text': range.name,
            'iconEnabled': true,
            'iconType': anychart.enums.LegendItemIconType.SQUARE,
            'iconFill': range.color,
            'disabled': !this.enabled(),
            'sourceUid': goog.getUid(this),
            'sourceKey': i,
            'meta': {
              series: series,
              scale: scale,
              range: range
            }
          });
        }
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT || mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series) {
      series.enabled(!series.enabled());
      if (series.enabled())
        series.hoverSeries();
      else
        series.unhover();
    }
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var pointValue = iterator.get(series.drawer.valueFieldName);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
        event.points_ = {
          series: series,
          points: points
        };
      } else {
        event.points_ = [{
          series: series,
          points: points,
          lastPoint: points[points.length - 1],
          nearestPointToCursor: {index: points[points.length - 1], distance: 0}
        }];
      }
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.hoverSeries();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.mapModule.Series} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get(series.drawer.valueFieldName);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }

      if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
        this.colorRange_.showMarker((range.start + range.end) / 2);
      }
    }
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.unhover();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target()) {
      this.colorRange_.hideMarker();
    }
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
anychart.mapModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  // only RAW is supported
  var result = this.getRawCsvData();
  return anychart.utils.serializeCsv(result.headers, result.data, opt_csvSettings);
};


//endregion
//region --- Context menu
/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.mapModule.Chart.contextMenuItems = {
  // Select submenu containing both marquee and polygon for map chart
  'select-submenu': {
    'index': 9,
    'text': 'Select points',
    'iconClass': 'ac ac-mouse-pointer',
    'subMenu': {
      'select-polygon': {
        'index': 9.2,
        'text': 'Polygon',
        'iconClass': 'ac ac-pentagon',
        'eventType': 'anychart.startSelectPolygonMarquee',
        'action': function(context) {
          context['menuParent'].startSelectPolygonMarquee(false);
        }
      },
      'select-marquee': {
        'index': 9.3,
        'text': 'Marquee',
        'iconClass': 'ac ac-square',
        'eventType': 'anychart.startSelectMarquee',
        'action': function(context) {
          context['menuParent'].startSelectRectangleMarquee(false);
        }
      }
    }
  }
};


/**
 * Menu map.
 * @type {Object.<string, Object.<string, anychart.ui.ContextMenu.Item>>}
 */
anychart.mapModule.Chart.contextMenuMap = {
  'select-submenu': {
    'select-submenu': anychart.mapModule.Chart.contextMenuItems['select-submenu']
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  var newItems = {};
  goog.object.extend(newItems, /** @type {Object} */(anychart.utils.recursiveClone(anychart.mapModule.Chart.contextMenuMap['select-submenu'])), items);
  return newItems;
};


//endregion
//region --- Setup and Dispose
/**
 * Exports map to GeoJSON format.
 * @return {Object}
 */
anychart.mapModule.Chart.prototype.toGeoJSON = function() {
  return anychart.mapModule.utils.GeoJSONParser.getInstance().exportToGeoJSON(this.internalGeoData, this.mapTX);
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.mapModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultCalloutSettings' in config)
    this.defaultCalloutSettings(config['defaultCalloutSettings']);

  if ('colorRange' in config)
    this.colorRange().setupInternal(!!opt_default, config['colorRange']);

  if ('unboundRegions' in config)
    this.unboundRegions(config['unboundRegions']);

  anychart.core.settings.deserialize(this, anychart.mapModule.Chart.PROPERTY_DESCRIPTORS, config);

  var geoData = config['geoData'];
  if (geoData) {
    this.geoData(/** @type {string} */(goog.string.startsWith(geoData, '{') ? JSON.parse(geoData) : geoData));
  }

  this.crsAnimation(config['crsAnimation']);
  this.crs(config['crs']);

  var i, json, scale;
  if (config['geoScale']) {
    scale = new anychart.mapModule.scales.Geo();
    scale.setup(config['geoScale']);
    this.scale(scale);
  }

  if ('callouts' in config) {
    var callouts = config['callouts'];
    for (var j = 0, len = callouts.length; j < len; j++) {
      var callout = callouts[j];
      if (callout) {
        this.callout(j, callout);
      }
    }
  }

  if ('axesSettings' in config)
    this.axes().setupInternal(!!opt_default, config['axesSettings']);

  if ('gridsSettings' in config)
    this.grids().setupInternal(!!opt_default, config['gridsSettings']);

  if ('crosshair' in config)
    this.crosshair(config['crosshair']);

  var scales = config['colorScales'];
  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      var type = goog.isString(json) ? json : json['type'];
      type = String(type).toLowerCase();
      switch (type) {
        case anychart.enums.ScaleTypes.ORDINAL_COLOR:
          scale = anychart.scales.ordinalColor();
          break;
        case anychart.enums.ScaleTypes.LINEAR_COLOR:
          scale = anychart.scales.linearColor();
          break;
        default:
          scale = anychart.scales.linearColor();
      }
      if (goog.isObject(json))
        scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  var series = config['series'];
  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.getOption('defaultSeriesType')).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json) && 'colorScale' in json) {
          var colorScale = json['colorScale'];
          if (goog.isNumber(colorScale)) {
            seriesInst.colorScale(scalesInstances[colorScale]);
          } else {
            type = goog.isString(colorScale) ? colorScale : colorScale['type'];
            scale = anychart.scales.Base.fromString(type, null);
            if (scale && goog.isObject(colorScale))
              scale.setup(colorScale);

          }
        }
      }
    }
  }

  var drillDownMap = config['drillDownMap'];
  if (goog.isObject(drillDownMap)) {
    this.drilldownMap_ = {};
    goog.object.forEach(drillDownMap, function(value, key) {
      this.drillDownMap()[key] = anychart.fromJson(value);
    }, this);
  }
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.serialize = function() {
  var json = anychart.mapModule.Chart.base(this, 'serialize');

  json['unboundRegions'] = goog.isString(this.unboundRegions()) ? this.unboundRegions() : this.unboundRegions().serialize();

  if (this.getCreated('colorRange'))
    json['colorRange'] = this.colorRange().serialize();

  json['geoScale'] = this.scale().serialize();

  anychart.core.settings.serialize(this, anychart.mapModule.Chart.PROPERTY_DESCRIPTORS, json);

  var geoData;
  if (this.geoDataStringName_) {
    geoData = this.geoDataStringName_;
  } else if (this.isSvgGeoData()) {
    if (goog.isString(this.geoData_)) {
      geoData = this.geoData_;
    } else {
      geoData = this.geoData_.nodeName == '#document' ? this.geoData_.documentElement.outerHTML : this.geoData_.outerHTML;
    }
  } else {
    geoData = JSON.stringify(this.geoData_);
  }

  if (goog.isDef(geoData))
    json['geoData'] = geoData;

  json['crsAnimation'] = this.crsAnimation().serialize();
  if (goog.isObject(this.crs_)) {
    anychart.core.reporting.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Map crs']
    );
  } else if (this.crs_) {
    json['crs'] = this.crs_;
  }

  var series = [];
  var scalesIds = {};
  var scales = [];
  for (var i = 0; i < this.seriesList.length; i++) {
    var series_ = this.seriesList[i];
    var config = series_.serialize();

    var scale = series_.colorScale();
    if (scale) {
      var objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['colorScale'] = scales.length - 1;
      } else {
        config['colorScale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
    }
    series.push(config);
  }

  var callouts = [];
  for (var j = 0, len = this.callouts_.length; j < len; j++) {
    var callout = this.callouts_[j];
    if (callout) {
      callouts[j] = callout.serialize();
    }
  }
  if (callouts.length)
    json['callouts'] = callouts;

  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['colorScales'] = scales;

  if (this.getCreated('axesSettings'))
    json['axesSettings'] = this.axes().serialize();

  if (this.getCreated('gridsSettings'))
    json['gridsSettings'] = this.grids().serialize();

  if (this.getCreated('crosshair'))
    json['crosshair'] = this.crosshair().serialize();

  if (this.drilldownMap_) {
    json['drillDownMap'] = {};
    goog.object.forEach(this.drilldownMap_, function(value, key) {
      var mapJson;
      if (anychart.utils.instanceOf(value, anychart.mapModule.Chart)) {
        mapJson = value.serialize();
      } else {
        mapJson = value;
      }
      json['drillDownMap'][key] = mapJson;
    }, this.drilldownMap_);
  }

  return {'map': json};
};


/** @inheritDoc */
anychart.mapModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.shortcutHandler,
      this.mouseWheelHandler,
      this.crosshair_,
      this.colorRange_,
      this.callouts_,
      this.axesSettings_,
      this.gridSettings_,
      this.crsAnimation_,
      this.ipPath_,
      this.ipClosePath_,
      this.ipCloseCircle_);
  this.shortcutHandler = null;
  this.mouseWheelHandler = null;
  this.crosshair_ = null;
  this.colorRange_ = null;
  this.callouts_.length = 0;
  this.axesSettings_ = null;
  this.gridSettings_ = null;
  this.crsAnimation_ = null;
  this.ipPath_ = null;
  this.ipClosePath_ = null;
  this.ipCloseCircle_ = null;

  if (this.container() && this.container().getStage()) {
    var container = this.container().getStage().getDomWrapper();
    if (this.mapClickHandler_) goog.events.unlisten(container, goog.events.EventType.CLICK, this.mapClickHandler_, false, this);
    if (this.mapDbClickHandler_) goog.events.unlisten(container, goog.events.EventType.DBLCLICK, this.mapDbClickHandler_, false, this);
    if (this.mapTouchEndHandler_) goog.events.unlisten(container, goog.events.EventType.POINTERUP, this.mapTouchEndHandler_, false, this);
    if (this.mapTouchEndHandler_) goog.events.unlisten(container, goog.events.EventType.TOUCHEND, this.mapTouchEndHandler_, false, this);
    if (this.mapMouseLeaveHandler_) goog.events.unlisten(container, goog.events.EventType.MOUSELEAVE, this.mapMouseLeaveHandler_, false, this);
  }

  anychart.mapModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.mapModule.Chart.prototype;
  //
  goog.exportSymbol('anychart.mapModule.Chart.DEFAULT_TX', anychart.mapModule.Chart.DEFAULT_TX);
  proto['getType'] = proto.getType;
  //geo
  proto['geoData'] = proto.geoData;
  proto['unboundRegions'] = proto.unboundRegions;
  // auto generated
  // proto['geoIdField'] = proto.geoIdField;
  // proto['maxZoomLevel'] = proto.maxZoomLevel;
  // proto['minZoomLevel'] = proto.minZoomLevel;
  // proto['overlapMode'] = proto.overlapMode;
  proto['toGeoJSON'] = proto.toGeoJSON;
  proto['toCsv'] = proto.toCsv;
  //series constructors generated automatically
  // proto['choropleth'] = proto.choropleth;
  // proto['bubble'] = proto.bubble;
  // proto['marker'] = proto.marker;
  // proto['connector'] = proto.connector;
  //series
  proto['getSeries'] = proto.getSeries;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  // proto['maxBubbleSize'] = proto.maxBubbleSize;
  // proto['minBubbleSize'] = proto.minBubbleSize;
  //ui
  proto['colorRange'] = proto.colorRange;
  proto['callout'] = proto.callout;
  proto['axes'] = proto.axes;
  proto['grids'] = proto.grids;
  proto['crosshair'] = proto.crosshair;
  //palette
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  //bounds
  proto['getPlotBounds'] = proto.getPlotBounds;
  //interactivity
  proto['crsAnimation'] = proto.crsAnimation;
  //feature manipulation
  proto['featureTranslation'] = proto.featureTranslation;
  proto['translateFeature'] = proto.translateFeature;
  proto['featureScaleFactor'] = proto.featureScaleFactor;
  proto['featureCrs'] = proto.featureCrs;
  proto['crs'] = proto.crs;
  //scale
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
  //zoom & move
  proto['zoom'] = proto.zoom;
  proto['move'] = proto.move;
  proto['zoomToFeature'] = proto.zoomToFeature;
  proto['zoomTo'] = proto.zoomTo;
  proto['getZoomLevel'] = proto.getZoomLevel;
  proto['getCurrentScene'] = proto.getCurrentScene;
  proto['fitAll'] = proto.fitAll;
  proto['zoomIn'] = proto.zoomIn;
  proto['zoomOut'] = proto.zoomOut;
  //drilling
  proto['drillTo'] = proto.drillTo;
  proto['drillUp'] = proto.drillUp;
  proto['drillDownMap'] = proto.drillDownMap;
  proto['getDrilldownPath'] = proto.getDrilldownPath;
  //polygon select
  proto['startSelectPolygonMarquee'] = proto.startSelectPolygonMarquee;
  proto['inPolygon'] = proto.inPolygon;
  proto['cancelPolygonMarquee'] = proto.cancelPolygonMarquee;
  // auto generated
  // proto['selectPolygonMarqueeFill'] = proto.selectPolygonMarqueeFill
  // proto['selectPolygonMarqueeStroke'] = proto.selectPolygonMarqueeStroke
})();
//endregion
