//region --- Requiring and Providing
goog.provide('anychart.charts.Map');

goog.require('acgraph.events.MouseWheelHandler');
goog.require('acgraph.vector.UnmanagedLayer');
goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.animations.MapAnimationController');
goog.require('anychart.animations.MapCrsAnimation');
goog.require('anychart.animations.MapMoveAnimation');
goog.require('anychart.animations.MapZoomAnimation');
goog.require('anychart.core.MapPoint');
goog.require('anychart.core.SeparateChart');
// goog.require('anychart.core.axes.Map');
goog.require('anychart.core.axes.MapSettings');
goog.require('anychart.core.grids.MapSettings');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.map.projections');
goog.require('anychart.core.map.projections.TwinProjection');
goog.require('anychart.core.map.series.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Callout');
goog.require('anychart.core.ui.ColorRange');
goog.require('anychart.core.ui.MapCrosshair');
goog.require('anychart.core.utils.Animation');
goog.require('anychart.core.utils.BinaryHeap');
goog.require('anychart.core.utils.GeoJSONParser');
goog.require('anychart.core.utils.GeoSVGParser');
goog.require('anychart.core.utils.MapInteractivity');
goog.require('anychart.core.utils.TopoJSONParser');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.core.utils.UnboundRegionsSettings');
goog.require('anychart.math.Rect');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.scales.Geo');
goog.require('anychart.scales.LinearColor');
goog.require('anychart.scales.OrdinalColor');
goog.require('goog.dom');
goog.require('goog.math.AffineTransform');
goog.require('goog.ui.KeyboardShortcutHandler');
//endregion



/**
 * AnyChart Map class.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Map = function() {
  anychart.charts.Map.base(this, 'constructor');

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
   * @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
   */
  this.internalSourceGeoData = [];

  /**
   * Internal represent of geo data.
   * @type {?Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
   */
  this.internalGeoData = null;

  /**
   *
   * @type {Array.<acgraph.vector.Element>}
   */
  this.mapPaths = [];

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * @type {!Array.<anychart.core.map.series.Base>}
   * @private
   */
  this.series_ = [];

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
   * Max size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.maxBubbleSize_;

  /**
   * Min size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.minBubbleSize_;

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

  /**
   * Zoom factor.
   * @type {number}
   * @private
   */
  this.zoomFactor_ = 1.3;

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
   * @type {anychart.animations.MapZoomAnimation|anychart.animations.MapMoveAnimation}
   */
  this.zoomAnimation;

  /**
   * @type {!anychart.animations.MapAnimationController}
   */
  this.mapAnimationController = new anychart.animations.MapAnimationController(this);

  goog.events.listen(this, anychart.enums.EventType.ANIMATION_START, function(e) {
    this.zoomingInProgress = true;
  }, false, this);

  goog.events.listen(this, anychart.enums.EventType.ANIMATION_END, function(e) {
    this.zoomingInProgress = false;
    this.mapTx = this.getMapLayer().getFullTransformation().clone();

    this.invalidateSeries_();

    this.applyLabelsOverlapState_ = true;
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
   * @type {anychart.charts.Map}
   */
  this.currentScene = null;

  /**
   * Root scene.
   * @type {anychart.charts.Map}
   */
  this.rootScene = null;

  /**
   * Bread crumbs path.
   * @type {Array.<anychart.core.MapPoint>}
   */
  this.currentBreadcrumbsPath = [];

  /**
   * Geo data parser.
   * @type {anychart.core.utils.GeoSVGParser|anychart.core.utils.GeoJSONParser|anychart.core.utils.TopoJSONParser}
   */
  this.parser = null;

  /**
   * Array of defined callout elements.
   * @type {Array.<anychart.core.ui.Callout>}
   * @private
   */
  this.callouts_ = [];

  this.unboundRegions(true);
  this.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);

  if (this.supportsBaseHighlight)
    this.eventsHandler.listen(this, [goog.events.EventType.POINTERDOWN, acgraph.events.EventType.TOUCHSTART], this.tapHandler);
};
goog.inherits(anychart.charts.Map, anychart.core.SeparateChart);


//region --- Class constants
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Map.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MAP_SERIES |
    anychart.ConsistencyState.MAP_LABELS |
    anychart.ConsistencyState.MAP_SCALE |
    anychart.ConsistencyState.MAP_GEO_DATA |
    anychart.ConsistencyState.MAP_GEO_DATA_INDEX |
    anychart.ConsistencyState.MAP_PALETTE |
    anychart.ConsistencyState.MAP_COLOR_RANGE |
    anychart.ConsistencyState.MAP_CALLOUT |
    anychart.ConsistencyState.MAP_MARKER_PALETTE |
    anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.MAP_MOVE |
    anychart.ConsistencyState.MAP_ZOOM |
    anychart.ConsistencyState.MAP_AXES |
    anychart.ConsistencyState.MAP_GRIDS |
    anychart.ConsistencyState.MAP_CROSSHAIR;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Map.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEED_UPDATE_OVERLAP;


/**
 * Animation and other timings.
 * @enum {number}
 */
anychart.charts.Map.TIMINGS = {
  ALL_ANIMATION_FINISHED_DELAY: 100,
  DEFAULT_ZOOM_DURATION: 200,
  ZOOM_TO_FEATURE_DURATION: 500,
  ZOOM_TO_HOME_DURATION: 300,
  TEST_DRAG_DELAY: 70
};


/**
 * @type {Object}
 */
anychart.charts.Map.DEFAULT_TX = {
  'default': {
    'crs': 'wsg84',
    'scale': 1
  }
};


/**
 * Root scene name.
 * @type {string}
 */
anychart.charts.Map.ROOT_SCENE_NAME = 'root';


/**
 * Map z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_MAP = 10;


/**
 * Series hatch fill z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_HATCH_FILL = 11;


/**
 * Series labels z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_LABELS = 12;


/**
 * Series markers z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_MARKERS = 13;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_AXIS = 20;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_SERIES = 30;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_HATCH_FILL = 31;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_LABEL = 40;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_MARKER = 40;


/**
 * Color range z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_COLOR_RANGE = 50;


/**
 * Callout z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CALLOUT = 60;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//endregion
//region --- Class properties
/**
 * Map layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.charts.Map.prototype.mapLayer_;


/**
 * Data layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.charts.Map.prototype.dataLayer_;


/**
 * Geo scale.
 * @type {anychart.scales.Geo}
 * @private
 */
anychart.charts.Map.prototype.scale_;


/**
 * Offset focus point x coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.offsetX_ = 0;


/**
 * Offset focus point y coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.offsetY_ = 0;


/**
 * Current zoom increse.
 * @type {number}
 */
anychart.charts.Map.prototype.zoomInc = 1;


/**
 * Full zoom.
 * @type {number}
 */
anychart.charts.Map.prototype.fullZoom = 1;


/**
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.maxZoomLevel_;


/**
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.minZoomLevel_;


/**
 * Map transformations object.
 * @type {Object.<string, Object.<{
 *    scale: number,
 *    crs: (Object|string|Function),
 *    srcCrs: (Object|string|Function),
 *    currProj: anychart.core.map.projections.Base,
 *    srcProj: anychart.core.map.projections.Base,
 *    src: string,
 *    xoffset: number,
 *    yoffset: number,
 *    heatZone: Object.<{left: number, top: number, width: number, height: number}>
 *    }>>}
 */
anychart.charts.Map.prototype.mapTX = null;


/**
 * Allow point selection if is true.
 * @type {boolean}
 * @private
 */
anychart.charts.Map.prototype.allowPointsSelect_;


/**
 * @type {boolean}
 * @private
 */
anychart.charts.Map.prototype.overlapMode_;


/**
 * @type {anychart.core.utils.MapInteractivity}
 * @private
 */
anychart.charts.Map.prototype.interactivity_;


//endregion
//region --- Infrastructure
/** @inheritDoc */
anychart.charts.Map.prototype.getVersionHistoryLink = function() {
  return 'http://anychart.com/products/anymap/history';
};


/** @inheritDoc */
anychart.charts.Map.prototype.getType = function() {
  return anychart.enums.MapTypes.MAP;
};


/**
 * Getter/setter for map default series type.
 * @param {anychart.enums.MapSeriesType=} opt_value Series type.
 * @return {anychart.charts.Map|anychart.enums.MapSeriesType}
 */
anychart.charts.Map.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeMapSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


//endregion
//region --- Interactivity
/**
 * Conrols interactivity.
 * @private
 */
anychart.charts.Map.prototype.controlsInteractivity_ = function() {
  if (this.isDisposed())
    return;
  var cnt = this.container();
  var stage = cnt ? cnt.getStage() : null;
  if (stage && this.getPlotBounds()) {
    var container = stage.getDomWrapper();

    if (goog.userAgent.IE)
      container.style['-ms-touch-action'] = 'none';

    this.mapTextarea = goog.dom.createDom('textarea');
    this.mapTextarea.setAttribute('readonly', 'readonly');
    goog.style.setStyle(this.mapTextarea, {
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
    goog.dom.appendChild(container, this.mapTextarea);


    this.listen('pointsselect', function(e) {
      this.mapTextarea.innerHTML = this.interactivity().copyFormatter().call(e, e);
      this.mapTextarea.select();
    }, false, this);

    this.shortcutHandler = new goog.ui.KeyboardShortcutHandler(this.mapTextarea);
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

    this.shortcutHandler.listen(goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, function(e) {
      if (!this.interactivity_.keyboardZoomAndMove())
        return;

      var dx = 0, dy = 0;
      this.isDesktop = true;
      this.zoomDuration = 100;
      var scene = this.getCurrentScene();

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
          var isDefaultPos = anychart.math.roughlyEqual(scene.getZoomLevel(), this.minZoomLevel_) &&
              anychart.math.roughlyEqual(tx.getTranslateX(), 0) &&
              anychart.math.roughlyEqual(tx.getTranslateY(), 0);

          if (isDefaultPos) {
            scene.getMapLayer().setTransformationMatrix(this.minZoomLevel_, 0, 0, this.minZoomLevel_, 0, 0);
            this.drillUp();
          } else {
            if (!this.drillingInAction) {
              if (scene.zoomAnimation)
                scene.zoomAnimation.stop();
              this.doAfterAnimation(scene, function() {
                this.goingToHome = true;
                this.zoomDuration = anychart.charts.Map.TIMINGS.ZOOM_TO_HOME_DURATION;
                this.zoomTo(this.minZoomLevel_);

                this.doAfterAnimation(this, function() {
                  this.goingToHome = false;
                });
              });
            }
          }
          break;
      }
    }, false, this);

    var isPreventDefault = goog.bind(function(e) {
      var containerPosition = this.container().getStage().getClientPosition();
      var be = e.getBrowserEvent();

      var scene = this.getCurrentScene();
      var zoomFactor = goog.math.clamp(1 - be.deltaY / 120, 0.7, 2);
      var maxZoomFactor = this.maxZoomLevel_;
      var minZoomFactor = this.minZoomLevel_;
      var isMouseWheel = scene.interactivity().zoomOnMouseWheel();
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
        isPreventDefault);

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

      if (this.interactivity_.zoomOnMouseWheel() && insideBounds) {
        if (scene.goingToHome) return;
        var zoomFactor = goog.math.clamp(1 - e.deltaY / 120, 0.7, 2);

        var maxZoomLevel = this.maxZoomLevel_;
        var minZoomLevel = this.minZoomLevel_;

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
      var containerPosition = this.container().getStage().getClientPosition();
      var bounds = this.getPixelBounds();

      var insideBounds = bounds &&
          e.clientX >= bounds.left + containerPosition.x &&
          e.clientX <= bounds.left + containerPosition.x + bounds.width &&
          e.clientY >= bounds.top + containerPosition.y &&
          e.clientY <= bounds.top + containerPosition.y + bounds.height;

      if (insideBounds) {
        var scrollEl = goog.dom.getDomHelper(this.mapTextarea).getDocumentScrollElement();
        var scrollX = scrollEl.scrollLeft;
        var scrollY = scrollEl.scrollTop;
        this.mapTextarea.focus();
        if (goog.userAgent.GECKO) {
          var newScrollX = scrollEl.scrollLeft;
          var newScrollY = scrollEl.scrollTop;
          setTimeout(function() {
            if (scrollEl.scrollLeft == newScrollX && scrollEl.scrollTop == newScrollY)
              window.scrollTo(scrollX, scrollY);
          }, 0);
        } else {
          window.scrollTo(scrollX, scrollY);
        }
      }
    };
    this.mapDbClickHandler_ = function(e) {
      if (this.interactivity_.zoomOnDoubleClick()) {
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
          var zoomFactor = this.zoomFactor_;
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
      this.updateSeriesOnZoomOrMove();
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
    goog.events.listen(this.legend(), [anychart.enums.EventType.DRAG_END], function(e) {
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

      if (this.interactivity_.drag() && scene.getZoomLevel() != 1 && !this.legendDragInProcess) {
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

        this.mapTx = this.getMapLayer().getFullTransformation().clone();
        for (var i = this.series_.length; i--;) {
          var series = this.series_[i];
          series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
          series.updateOnZoomOrMove();
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
anychart.charts.Map.prototype.startDrag = function() {
  if (!this.drag) {
    this.drag = true;
    this.dispatchEvent(anychart.enums.EventType.DRAG_START);
  }
};


/**
 * Drag end.
 */
anychart.charts.Map.prototype.endDrag = function() {
  if (this.drag) {
    this.drag = false;

    if (this.interactivity_.drag() &&
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
anychart.charts.Map.prototype.tapHandler = function(event) {
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
    originalTouchEvent.preventDefault();
    var touchCount = originalTouchEvent.touches.length;
    if (touchCount == 2) {
      var firsFinger = originalTouchEvent.touches[0];
      var secondFinger = originalTouchEvent.touches[1];

      var dist = Math.sqrt(
          (firsFinger.pageX - secondFinger.pageX) * (firsFinger.pageX - secondFinger.pageX) +
          (firsFinger.pageY - secondFinger.pageY) * (firsFinger.pageY - secondFinger.pageY));

      this.touchDist = dist;
      this.tap = false;
    } else if (touchCount == 1) {
      this.tap = true;
      this.originEvent = event;
      if (!this.tapTesting) {
        this.testTouchStartHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.TOUCHSTART, function(e) {
          var originalTouchEvent = e.originalEvent.getOriginalEvent().getBrowserEvent();
          var touchCount = originalTouchEvent.touches.length;
          if (touchCount > 1)
            this.tap = false;
        });

        this.testTouchMoveHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.TOUCHMOVE, function(e) {
          this.tap = false;
        });

        this.tapTesting = true;
        setTimeout(this.tapTestFunc, 200);
      }

      this.startTouchX = event.clientX;
      this.startTouchY = event.clientY;
      this.drag = true;
    } else {
      this.tap = false;
    }
    goog.events.listen(document, [goog.events.EventType.POINTERMOVE, goog.events.EventType.TOUCHMOVE], this.touchMoveHandler, false, this);
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.handleMouseDown = function(event) {
  this.itWasDrag = false;
  this.originEvent = event;

  if (this.getZoomLevel() == this.minZoomLevel_) {
    setTimeout(this.acyncMouseDown, 0, event);
  } else if (!this.mouseMoveTesting) {
    this.testDragHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.MOUSEMOVE, function(e) {
      this.itWasDrag = !this.legendDragInProcess;
    });

    this.mouseMoveTesting = true;
    setTimeout(this.dragTestFunc, anychart.charts.Map.TIMINGS.TEST_DRAG_DELAY);
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.onMouseDown = function(event) {
  var interactivity = this.interactivity();
  if (interactivity.selectionMode() == anychart.enums.SelectionMode.DRILL_DOWN) {
    var drillDownMap = this.getCurrentScene().drillDownMap();
    if (drillDownMap) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      var series, index;
      if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
        var parent = event['target'].getParentEventTarget();
        if (parent.isSeries && parent.isSeries())
          series = parent;
        index = tag;
      } else if (event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target'])) {
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
          if (map instanceof anychart.charts.Map) {
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
    anychart.charts.Map.base(this, 'onMouseDown', event);
  }
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.charts.Map.prototype.handleMouseOut = function(event) {
  var scene = this.getCurrentScene();
  var hoverMode = scene.interactivity().hoverMode();

  var tag = anychart.utils.extractTag(event['domTarget']);
  var forbidTooltip = false;

  var series, index;
  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend || scene.checkIfColorRange(event['target'])) {
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


/**
 * Allows to select points of the Map.
 * @param {boolean=} opt_value Allow or not.
 * @return {boolean|anychart.charts.Map} Returns allow points select state or current map instance for chaining.
 * @deprecated Since 7.8.0. Use chart.interactivity().selectionMode().
 */
anychart.charts.Map.prototype.allowPointsSelect = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['allowPointsSelect()', 'interactivity().selectionMode()'], true);
  if (goog.isDef(opt_value)) {
    this.interactivity().selectionMode(opt_value ?
        anychart.enums.SelectionMode.MULTI_SELECT :
        anychart.enums.SelectionMode.NONE);
    return this;
  }
  return this.interactivity().selectionMode() != anychart.enums.SelectionMode.NONE;
};


/** @inheritDoc */
anychart.charts.Map.prototype.handleMouseEvent = function(event) {
  if (!this.itWasDrag)
    anychart.charts.Map.base(this, 'handleMouseEvent', event);
};


/**
 * Handler for touch move event .
 * @param {anychart.core.MouseEvent} e Event object.
 */
anychart.charts.Map.prototype.touchMoveHandler = function(e) {
  var originalTouchEvent = e.getBrowserEvent();
  var touchCount = originalTouchEvent.touches.length;
  originalTouchEvent.preventDefault();
  this.isDesktop = false;

  var scene = this.getCurrentScene();
  var mapLayer = scene.getMapLayer();
  if (touchCount == 2) {
    var firsFinger = originalTouchEvent.touches[0];
    var secondFinger = originalTouchEvent.touches[1];
    var dist = Math.sqrt(
        (firsFinger.pageX - secondFinger.pageX) * (firsFinger.pageX - secondFinger.pageX) +
        (firsFinger.pageY - secondFinger.pageY) * (firsFinger.pageY - secondFinger.pageY));

    var minX = Math.min(firsFinger.pageX, secondFinger.pageX);
    var minY = Math.min(firsFinger.pageY, secondFinger.pageY);

    var c_x = minX + Math.abs(firsFinger.pageX - secondFinger.pageX) / 2;
    var c_y = minY + Math.abs(firsFinger.pageY - secondFinger.pageY) / 2;

    var isZooming = Math.abs(dist - this.touchDist) > 25;


    if (this.interactivity_.zoomOnMouseWheel() && isZooming) {
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

      if (zoomFactor < 1 && anychart.math.round(scene.getZoomLevel(), 2) == this.minZoomLevel_ && !mapLayer.getSelfTransformation().isIdentity()) {
        mapLayer.setTransformationMatrix(this.minZoomLevel_, 0, 0, this.minZoomLevel_, 0, 0);
        scene.fullZoom = this.minZoomLevel_;
        scene.goingToHome = false;
        if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
          scene.zoomAnimation.stop();
        }

        scene.scale().setMapZoom(/** @type {number} */(this.minZoomLevel_));
        scene.scale().setOffsetFocusPoint(0, 0);

        scene.updateSeriesOnZoomOrMove();
      } else if ((zoomFactor > 1 && scene.getZoomLevel() >= this.maxZoomLevel_) || (zoomFactor < 1 && scene.getZoomLevel() <= this.minZoomLevel_)) {
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
    if (this.drag && this.interactivity_.drag() && this.getZoomLevel() != 1) {
      goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.MOVE);
      scene.move(e.clientX - scene.startTouchX, e.clientY - scene.startTouchY);

      scene.startTouchX = e.clientX;
      scene.startTouchY = e.clientY;
    } else {
      goog.style.setStyle(document['body'], 'cursor', '');
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.getSeriesStatus = function(event) {
  if (event['target'] instanceof anychart.core.ui.Legend) {
    var tag = anychart.utils.extractTag(event['domTarget']);
    return tag.points;
  }

  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);
  var clientX = event['clientX'];
  var clientY = event['clientY'];

  var value, index;

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

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();

    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
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
            var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
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
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    //not working yet. coming soon.
  }

  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.charts.Map.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
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
anychart.charts.Map.prototype.doAdditionActionsOnMouseOverAndMove = function(index, series) {
  var colorRange = this.getCurrentScene().colorRange();
  index = goog.isArray(index) ? index.length ? index[0] : NaN : index;
  if (colorRange && colorRange.target() && !isNaN(index)) {
    var target = colorRange.target();
    if (target == series) {
      var iterator = target.getIterator();
      iterator.select(index);
      var value = iterator.get(target.referenceValueNames[1]);
      colorRange.showMarker(/** @type {number} */(value));
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.doAdditionActionsOnMouseOut = function() {
  var colorRange = this.getCurrentScene().colorRange();
  if (colorRange && colorRange.enabled()) {
    colorRange.hideMarker();
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.core.utils.MapInteractivity(this);
    this.interactivity_.listenSignals(this.onInteractivitySignal, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value))
      this.interactivity_.setup(opt_value);
    else
      this.interactivity_.hoverMode(/** @type {anychart.enums.HoverMode} */(opt_value));
    return this;
  }
  return this.interactivity_;
};


/**
 * Update series on zoom or moove.
 */
anychart.charts.Map.prototype.updateSeriesOnZoomOrMove = function() {
  this.dataLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

  var tx = this.getMapLayer().getFullTransformation();
  var i;

  if (this.crosshair_) {
    this.crosshair_.update();
  }

  for (i = this.series_.length; i--;) {
    var series = this.series_[i];
    series.updateOnZoomOrMove();
  }

  for (i = this.callouts_.length; i--;) {
    var callout = this.callouts_[i];
    callout.updateOnZoomOrMove();
  }

  if (this.axesSettings_) {
    var axes = this.axesSettings_.getItems();
    for (i = 0; i < axes.length; i++) {
      var axis = axes[i];
      axis.updateOnZoomOrMove(tx);
    }
  }

  if (this.gridSettings_) {
    var grids = this.gridSettings_.getItems();
    for (i = grids.length; i--;) {
      var grid = grids[i];
      grid.updateOnZoomOrMove(tx);
    }
  }
};


//endregion
//region --- Animaions
//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for animation setting.
 * @param {(boolean|Object)=} opt_enabledOrJson Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation|anychart.charts.Map} Animations settings object or self for chaining.
 */
anychart.charts.Map.prototype.crsAnimation = function(opt_enabledOrJson, opt_duration) {
  if (!this.crsAnimation_) {
    this.crsAnimation_ = new anychart.core.utils.Animation();
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
anychart.charts.Map.prototype.onCrsAnimationSignal_ = function() {
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
 * @return {!(anychart.core.ui.ColorRange|anychart.charts.Map)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Map.prototype.colorRange = function(opt_value) {
  if (!this.colorRange_) {
    this.colorRange_ = new anychart.core.ui.ColorRange();
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
anychart.charts.Map.prototype.colorRangeInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.MAP_COLOR_RANGE |
        anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.APPEARANCE;
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
anychart.charts.Map.prototype.checkIfColorRange = function(target) {
  return target instanceof anychart.core.ui.ColorRange;
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
 * @return {!(anychart.core.ui.Callout|anychart.charts.Map)} Callout instance by index or itself for method chaining.
 */
anychart.charts.Map.prototype.callout = function(opt_indexOrValue, opt_value) {
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
    callout = new anychart.core.ui.Callout();
    callout.setParentEventTarget(this);
    callout.setup(this.defaultCalloutSettings());
    this.callouts_[index] = callout;
    this.registerDisposable(callout);
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
anychart.charts.Map.prototype.onCalloutSignal_ = function(event) {
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
anychart.charts.Map.prototype.defaultCalloutSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultCalloutSettings_ = opt_value;
    return this;
  }
  return this.defaultCalloutSettings_ || {};
};


/**
 * Axes common settings.
 * @param {(boolean|Object)=} opt_value .
 * @return {anychart.charts.Map|anychart.core.axes.MapSettings}
 */
anychart.charts.Map.prototype.axes = function(opt_value) {
  if (!this.axesSettings_) {
    this.axesSettings_ = new anychart.core.axes.MapSettings(this);
  }

  if (goog.isDef(opt_value)) {
    this.axesSettings_.setupByVal(opt_value);
    return this;
  }
  return this.axesSettings_;
};


/**
 * Listener for axes settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.charts.Map.prototype.onAxesSettingsSignal = function(event) {
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
 * @return {anychart.charts.Map|anychart.core.grids.MapSettings}
 */
anychart.charts.Map.prototype.grids = function(opt_value) {
  if (!this.gridSettings_) {
    this.gridSettings_ = new anychart.core.grids.MapSettings(this);
  }

  if (goog.isDef(opt_value)) {
    this.gridSettings_.setupByVal(opt_value);
    return this;
  }
  return this.gridSettings_;
};


/**
 * Listener for axes settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.charts.Map.prototype.onGridsSettingsSignal = function(event) {
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
 * @return {!(anychart.core.ui.MapCrosshair|anychart.charts.Map)}
 */
anychart.charts.Map.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.MapCrosshair();
    this.crosshair_.enabled(false);
    this.crosshair_.bindHandlers(this);
    this.registerDisposable(this.crosshair_);
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
anychart.charts.Map.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.MAP_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Coloring
//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Map)} .
 */
anychart.charts.Map.prototype.palette = function(opt_value) {
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
 * @return {!(anychart.palettes.Markers|anychart.charts.Map)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Map.prototype.markerPalette = function(opt_value) {
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
 * Map hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Map)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Map.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
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
anychart.charts.Map.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates choropleth series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.map.series.Base} Passed geo data.
 */
anychart.charts.Map.prototype.choropleth = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.CHOROPLETH, data, opt_csvSettings);
};


/**
 * Creates bubble series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.map.series.Base} Passed geo data.
 */
anychart.charts.Map.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.BUBBLE, data, opt_csvSettings);
};


/**
 * Creates marker series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.map.series.Base} Passed geo data.
 */
anychart.charts.Map.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.MARKER, data, opt_csvSettings);
};


/**
 * Creates bubble series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data SVG|SVGString|GeoJSON|MapNameString.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.map.series.Base} Passed geo data.
 */
anychart.charts.Map.prototype.connector = function(data, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.MapSeriesType.CONNECTOR, data, opt_csvSettings);
};


/**
 * @param {string} type Series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @private
 * @return {anychart.core.map.series.Base}
 */
anychart.charts.Map.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  var ctl;
  type = ('' + type).toLowerCase();
  for (var i in anychart.core.map.series.Base.SeriesTypesMap) {
    if (i.toLowerCase() == type) {
      ctl = anychart.core.map.series.Base.SeriesTypesMap[i];
      break;
    }
  }
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setChart(this);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);

    var inc = index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);

    instance.setAutoZIndex(anychart.charts.Map.ZINDEX_SERIES + inc);
    instance.labels().setAutoZIndex(anychart.charts.Map.ZINDEX_LABEL + inc + anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER / 2);

    instance.setAutoGeoIdField(this.geoIdField());
    instance.setMap(this);
    if (this.internalGeoData)
      instance.setGeoData(this.internalGeoData);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));

    if (instance.supportsMarkers()) {
      instance.markers().setAutoZIndex(anychart.charts.Map.ZINDEX_MARKER + inc);
      instance.markers().setAutoFill((/** @type {anychart.core.map.series.BaseWithMarkers} */ (instance)).getMarkerFill());
      instance.markers().setAutoStroke((/** @type {anychart.core.map.series.BaseWithMarkers} */ (instance)).getMarkerStroke());
    }

    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.MAP_SERIES |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Map.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Sets max size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.maxBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxBubbleSize_ != opt_value) {
      this.maxBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxBubbleSize_;
};


/**
 * Sets min size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.minBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minBubbleSize_ != opt_value) {
      this.minBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minBubbleSize_;
};


/**
 * Add series to chart.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Chart series data.
 * @return {Array.<anychart.core.map.series.Base>} Array of created series.
 */
anychart.charts.Map.prototype.addSeries = function(var_args) {
  var zIndex;
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null, undefined));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i], undefined));
    }
  }
  this.resumeSignalsDispatching(true);
  return rv;
};


/**
 * Find series index by its id.
 * @param {number|string} id Series id.
 * @return {number} Series index or -1 if didn't find.
 */
anychart.charts.Map.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.map.series.Base} Series instance.
 */
anychart.charts.Map.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.map.series.Base} Series instance.
 */
anychart.charts.Map.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.charts.Map.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.charts.Map} Self for method chaining.
 */
anychart.charts.Map.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Map.prototype.seriesInvalidated_ = function(event) {
  var state = 0;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.MAP_SERIES;
    if ((/** @type {anychart.core.map.series.Base} */(event['target'])).needsUpdateMapAppearance())
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
    state |= anychart.ConsistencyState.MAP_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.MAP_LABELS;
    if ((/** @type {anychart.core.map.series.Base} */(event['target'])).needsUpdateMapAppearance())
      state |= anychart.ConsistencyState.APPEARANCE;
    for (var i = this.series_.length; i--;)
      this.series_[i].invalidate(
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.SERIES_DATA |
          anychart.ConsistencyState.MAP_COLOR_SCALE |
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
    var colorRange = this.colorRange();
    colorRange.dropBoundsCache();
    colorRange.invalidate(colorRange.ALL_VISUAL_STATES);
  }

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.charts.Map.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.charts.Map.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1], this.minBubbleSize_, this.maxBubbleSize_);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Map.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.BOUNDS);
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @private
 */
anychart.charts.Map.prototype.invalidateSizeBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  }
};


//endregion
//region --- Map layering
/**
 * Returns data layer (layer with series)
 * @return {acgraph.vector.Layer}
 */
anychart.charts.Map.prototype.getDataLayer = function() {
  return this.dataLayer_;
};


/**
 * Returns map layer (layer with map)
 * @return {acgraph.vector.Layer}
 */
anychart.charts.Map.prototype.getMapLayer = function() {
  return this.mapLayer_;
};


/**
 * Creates map layer.
 * @param {acgraph.vector.ILayer=} opt_parent .
 * @return {acgraph.vector.Layer}
 */
anychart.charts.Map.prototype.createMapLayer = function(opt_parent) {
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
anychart.charts.Map.prototype.createPath_ = function(opt_parent) {
  var path = opt_parent ? opt_parent.path() : acgraph.path();
  path.disableStrokeScaling(true);
  return path;
};


/**
 * Clear path.
 * @param {!acgraph.vector.Element} path .
 * @private
 */
anychart.charts.Map.prototype.clearPath_ = function(path) {
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
anychart.charts.Map.prototype.clearLayer_ = function(layer) {
  var children = layer.removeChildren();
  for (var i = 0, len = children.length; i < len; i++) {
    var child = children[i];
    if (child instanceof acgraph.vector.Path) {
      this.clearPath_(child);
    } else if (child instanceof acgraph.vector.Layer) {
      this.clearLayer_(child);
    }
  }
};


/**
 * Clear map paths.
 */
anychart.charts.Map.prototype.clear = function() {
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
anychart.charts.Map.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


//endregion
//region --- Geo settings
/**
 * Map scale.
 * @param {anychart.scales.Geo=} opt_value Scale to set.
 * @return {!(anychart.scales.Geo|anychart.charts.Map)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Map.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      if (this.scale_)
        this.scale_.unlistenSignals(this.geoScaleInvalidated_, this);
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.geoScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.MAP_SCALE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = new anychart.scales.Geo();
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
anychart.charts.Map.prototype.geoScaleInvalidated_ = function(event) {
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


/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|boolean)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.UnboundRegionsSettings|anychart.charts.Map}
 */
anychart.charts.Map.prototype.unboundRegions = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value)) {
      if (!this.unboundRegionsSettings_ || goog.isString(this.unboundRegionsSettings_))
        this.unboundRegionsSettings_ = new anychart.core.utils.UnboundRegionsSettings(this);

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
 * Sets/gets geo id field.
 * @param {string=} opt_value Geo id.
 * @return {string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.geoIdField = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.geoIdField_) {
      this.geoIdField_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.MAP_GEO_DATA_INDEX,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoIdField_;
};


/**
 * Whether geo data type SVG.
 * @return {boolean}
 */
anychart.charts.Map.prototype.isSvgGeoData = function() {
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
anychart.charts.Map.prototype.geoData = function(opt_data) {
  if (goog.isDef(opt_data)) {
    if (goog.isString(opt_data) && !goog.string.startsWith(opt_data, '<')) {
      this.geoDataStringName_ = opt_data;
      var configPath = opt_data.split('.');
      opt_data = goog.dom.getWindow();
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
          anychart.ConsistencyState.MAP_SERIES |
          anychart.ConsistencyState.MAP_GEO_DATA_INDEX |
          anychart.ConsistencyState.MAP_COLOR_RANGE |
          anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
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
anychart.charts.Map.prototype.getIndexedGeoData = function() {
  return this.indexedGeoData_;
};


//endregion
//region --- Labels overlap
/**
 * Global labels overlap settings for map series.
 * Defines show label if it don't intersect with other anyone label or not show.
 * This settings can be overrided by series same settings.
 * @param {(anychart.enums.LabelsOverlapMode|string|boolean)=} opt_value .
 * @return {anychart.enums.LabelsOverlapMode|anychart.charts.Map} .
 */
anychart.charts.Map.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeLabelsOverlapMode(opt_value) == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;
    if (this.overlapMode_ != val) {
      this.overlapMode_ = val;
      this.invalidate(anychart.ConsistencyState.MAP_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.overlapMode_ ?
      anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP :
      anychart.enums.LabelsOverlapMode.NO_OVERLAP;
};


/**
 * Calculates which labels need to draw and sets the label drawing map to every map series.
 */
anychart.charts.Map.prototype.applyLabelsOverlapState = function() {
  var series, i, j, len, len_, iterator, pointCount, label;
  var bounds1, bounds2, maps, seriesMap, label1, label2, index1, index2;
  var series1, series2;

  maps = {};
  seriesMap = {};

  var globalOverlapForbidden = !this.overlapMode_;

  for (i = this.series_.length; i--;) {
    series = this.series_[i];
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

      series1 = label1.series;
      index1 = label1.index;
      bounds1 = label1.bounds;

      for (j = 0, len_ = value.length; j < len_; j++) {
        label2 = value[j];

        series2 = label2.series;
        index2 = label2.index;
        bounds2 = label2.bounds;

        if (i == j)
          continue;

        if (anychart.math.checkRectIntersection(bounds1, bounds2)) {
          label1.intersects.push(label2);
        }
      }
      label1.heepKey = label1.intersects.length;
    }

    var bh = new anychart.core.utils.BinaryHeap(value, function(a, b) {
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

  for (i = this.series_.length; i--;) {
    series = this.series_[i];
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
 * @param {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} geoData .
 * @param {Function} callback .
 * @param {boolean} isInit .
 * @param {boolean} isChangeCrs .
 */
anychart.charts.Map.prototype.postProcessGeoData = function(geoData, callback, isInit, isChangeCrs) {
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
            /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom),
            /** @type {Function} */(callback),
            /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom_),
            isInit
        );
      }
      if (isInit)
        this.internalGeoData[i] = /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection} */(geom_);
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
anychart.charts.Map.prototype.drawGeometry_ = function(geometry, parent, opt_transform) {
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
    for (var i = this.series_.length; i--;) {
      var series = this.series_[i];
      series.setGeoData(/** @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} */(this.internalGeoData));
    }

    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA);
  }
};


/**
 * Function for draw geoms.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @private
 */
anychart.charts.Map.prototype.drawGeom_ = function(coords, index, geom) {
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
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @this {{
 *    tx: Object,
 *    projection1: anychart.core.map.projections.Base,
 *    projection2: anychart.core.map.projections.Base,
 *    geoScale: anychart.scales.Geo,
 *    map: anychart.charts.Map
 * }}
 * @private
 */
anychart.charts.Map.prototype.calcGeom_ = function(coords, index, geom) {
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
anychart.charts.Map.prototype.iterateGeometry_ = function(geom, callBack, opt_output, opt_initGeoData) {
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
anychart.charts.Map.prototype.drawCredits = function(parentBounds) {
  var rootScene = this.getRootScene();
  return /** @type {!anychart.math.Rect} */(this == rootScene ? anychart.charts.Map.base(this, 'drawCredits', parentBounds) : parentBounds);
};


/**
 * Returns bounds without callout elements.
 * @param {anychart.math.Rect} bounds
 * @return {anychart.math.Rect}
 */
anychart.charts.Map.prototype.getBoundsWithoutCallouts = function(bounds) {
  var i, callout, remainingBounds, orientation;
  var callouts = this.callouts_;

  var boundsWithoutCallouts = bounds.clone();
  var topOffset = 0;
  var bottomOffset = 0;
  var leftOffset = 0;
  var rightOffset = 0;

  for (i = callouts.length; i--;) {
    callout = /** @type {anychart.core.ui.Callout} */(callouts[i]);
    if (callout && callout.enabled()) {
      callout.parentBounds(bounds);
      orientation = callout.orientation();

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
anychart.charts.Map.prototype.getBoundsWithoutAxes = function(bounds) {
  //todo (blackart) don't remove. Debug purpose.
  // if (!this.boundsssss) this.boundsssss = this.container().rect().zIndex(1000).stroke('red');
  // this.boundsssss.setBounds(bounds);

  var boundsWithoutAxis = bounds.clone();
  if (this.axesSettings_) {
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
anychart.charts.Map.prototype.drawContent = function(bounds) {
  this.getRootScene();

  var i, series, tx, dx, dy, cx, cy, len, geom, callout;
  var maxZoomLevel = this.maxZoomLevel_;
  var minZoomLevel = this.minZoomLevel_;
  var boundsWithoutTx, boundsWithTx, seriesType;
  var axes, axis, grids, grid;

  var scale = this.scale();
  var needRecalculateLatLonScaleRange = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    var geoData = this.geoData();

    if (goog.isDefAndNotNull(geoData)) {
      geoData = goog.isString(this.geoData_) && !goog.string.startsWith(/** @type {string} */(geoData), '<') ?
          goog.dom.getWindow()['anychart']['maps'][this.geoData_] : this.geoData_;

      if (goog.isString(geoData) && goog.string.startsWith(geoData, '<') || goog.dom.isNodeLike(geoData)) {
        this.parser = anychart.core.utils.GeoSVGParser.getInstance();
      } else if (geoData['type'].toLowerCase() === 'topology') {
        this.parser = anychart.core.utils.TopoJSONParser.getInstance();
      } else {
        this.parser = anychart.core.utils.GeoJSONParser.getInstance();
      }

      this.internalSourceGeoData = this.parser.parse(/** @type {Object} */(geoData));

      goog.dispose(this.internalGeoData);
      this.internalGeoData = null;

      var geoIdFromGeoData = geoData['ac-geoFieldId'];
      if (geoIdFromGeoData)
        this.geoIdField(geoIdFromGeoData);

      this.mapTX = {};

      var mapTx = geoData['ac-tx'] || {};

      var defaultTx = mapTx['default'];
      if (!defaultTx)
        defaultTx = mapTx['default'] = goog.object.clone(anychart.charts.Map.DEFAULT_TX['default']);

      goog.object.forEach(mapTx || anychart.charts.Map.DEFAULT_TX, function(value, key) {
        var tx_ = {};

        tx_.crs = goog.isDef(value['crs']) ? anychart.enums.normalizeMapProjections(value['crs']) : defaultTx.crs;
        tx_.srcCrs = tx_.crs;
        tx_.curProj = anychart.core.map.projections.getProjection(tx_.crs);
        tx_.srcProj = anychart.core.map.projections.getProjection(tx_.srcCrs);
        tx_.scale = goog.isDef(value['scale']) ? parseFloat(value['scale']) : 1;
        tx_.xoffset = goog.isDef(value['xoffset']) ? parseFloat(value['xoffset']) : 0;
        tx_.yoffset = goog.isDef(value['yoffset']) ? parseFloat(value['yoffset']) : 0;
        if (goog.isDef(value['heatZone'])) {
          tx_.heatZone = goog.isArray(value['heatZone']) ? value['heatZone'] : anychart.math.Rect.fromJSON(value['heatZone']);
        }

        this.mapTX[key] = tx_;
      }, this);
    }

    if (!this.mapLayer_) {
      this.mapLayer_ = this.createMapLayer(/** @type {acgraph.vector.ILayer} */(this.rootElement));
      this.mapLayer_.zIndex(anychart.charts.Map.ZINDEX_MAP);
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
      this.dataLayer_.zIndex(anychart.charts.Map.ZINDEX_SERIES);
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

        //if (this.getZoomLevel() != this.minZoomLevel_) {
        //scene.zoomInc = this.minZoomLevel_;
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

      if ((tx.crs != this.newCrs_ && tx.srcCrs != this.newCrs_) || this.crsAnimation_.enabled()) {
        if (!anychart.core.map.projections.isBaseProjection(tx.srcCrs)) {
          sourceProjection = tx.srcProj;
        }
        if (changeProjection) {
          destinationProjection = anychart.core.map.projections.getProjection(this.newCrs_);
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
        tx.curProj = anychart.core.map.projections.getProjection(tx.crs);
      }

      if (initInternalGeoData) {
        geoData = this.internalSourceGeoData;
        this.internalGeoData = [];
      } else if (changeProjection) {
        geoData = this.internalSourceGeoData;
      } else {
        geoData = this.internalGeoData;
      }

      if ((this.crsMapAnimation && this.crsMapAnimation.isStopped()) || !this.crsMapAnimation) {
        var isAnimate = this.crsAnimation_ && this.crsAnimation_.enabled() && this.crsAnimation_.duration() > 0 && !initInternalGeoData && changeProjection;
        if (isAnimate) {
          tx.curProj = new anychart.core.map.projections.TwinProjection(
              /** @type {anychart.core.map.projections.Base} */(currentProjection),
              /** @type {anychart.core.map.projections.Base} */(destinationProjection));
          this.crsMapAnimation = new anychart.animations.MapCrsAnimation(
              this,
              /** @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} */(geoData),
              sourceProjection,
              tx,
              /** @type {number} */(this.crsAnimation_.duration()),
              this != this.getCurrentScene());
          this.crsMapAnimation.listenOnce(goog.fx.Transition.EventType.END,
              /**
               * @this {{map: anychart.charts.Map, tx: Object}}
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
              /** @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} */(geoData),
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

      for (i = this.series_.length; i--;) {
        series = this.series_[i];
        series.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);

        //----------------------------------calc statistics for series
        series.calculateStatistics();
        max = Math.max(max, /** @type {number} */(series.statistics('seriesMax')));
        min = Math.min(min, /** @type {number} */ (series.statistics('seriesMin')));
        sum += /** @type {number} */(series.statistics('seriesSum'));
        pointsCount += /** @type {number} */(series.statistics('seriesPointsCount'));
        //----------------------------------end calc statistics for series
        // series.calculate();
      }

      //----------------------------------calc statistics for series
      //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series

      var average = sum / pointsCount;
      for (i = 0; i < this.series_.length; i++) {
        series = this.series_[i];
        series.statistics('max', max);
        series.statistics('min', min);
        series.statistics('sum', sum);
        series.statistics('average', average);
        series.statistics('pointsCount', pointsCount);
        var seriesStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(series.stroke()));
        if (seriesStrokeThickness > this.maxStrokeThickness_) {
          this.maxStrokeThickness_ = seriesStrokeThickness;
        }
      }
      //----------------------------------end calc statistics for series
    }
    this.markConsistent(anychart.ConsistencyState.MAP_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA_INDEX)) {
    this.indexedGeoData_ = {};
    this.indexedGeoData_[this.geoIdField_] = {};
    if (this.internalGeoData) {
      for (i = this.series_.length; i--;) {
        series = this.series_[i];
        if (goog.isDef(series.geoIdField()) && series.geoIdField() != this.geoIdField_) {
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

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.suspendSignalsDispatching();
      series.container(this.dataLayer_);
      series.resumeSignalsDispatching(false);
    }
    this.applyLabelsOverlapState_ = {};
    this.calcBubbleSizes_();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    for (i = 0, len = this.callouts_.length; i < len; i++) {
      callout = this.callouts_[i];
      callout.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    if (this.axesSettings_) {
      axes = this.axesSettings_.getItems();
      for (i = 0, len = axes.length; i < len; i++) {
        axis = axes[i];
        axis.labels().dropCallsCache();
        axis.minorLabels().dropCallsCache();
        if (!axis.scale())
          axis.scale(/** @type {anychart.scales.Geo} */(this.scale()));
        axis.invalidate(axis.ALL_VISUAL_STATES);
      }
    }

    if (this.gridSettings_) {
      grids = this.gridSettings_.getItems();
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
    if (this.colorRange_) {
      var targetSeries;
      for (i = 0, len = this.series_.length; i < len; i++) {
        if (this.series_[i].isChoropleth())
          targetSeries = this.series_[i];
      }
      if (targetSeries) {
        targetSeries.calculate();
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
          for (var k = 0, len__ = this.series_.length; k < len__; k++) {
            series = this.series_[k];
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
        callout.zIndex(anychart.charts.Map.ZINDEX_CALLOUT);
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

    var unboundRegionsStrokeThickness = goog.isObject(this.unboundRegionsSettings_) ?
        acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.unboundRegionsSettings_.stroke())) : 0;

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

    if (this.axesSettings_) {
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

    for (i = this.series_.length; i--;) {
      this.series_[i].invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    var state = anychart.ConsistencyState.MAP_LABELS;
    if (this.isSvgGeoData())
      state |= anychart.ConsistencyState.APPEARANCE;
    this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
  }

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


      var duration = this.zoomDuration || anychart.charts.Map.TIMINGS.DEFAULT_ZOOM_DURATION;

      if ((!this.zoomAnimation || this.zoomAnimation.isStopped()) && !isInit) {
        this.zoomSource = srcZoom;
        this.zoomDest = dstZoom;

        var equalZoom = anychart.math.roughlyEqual(this.zoomSource, this.zoomDest, 0.00001);
        var allowZoom = (equalZoom && this.allowMoveOnEqualZoomLevels || !equalZoom) &&
            this != this.getCurrentScene() ? true : this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START));

        if (allowZoom) {
          if (goog.global['anychart']['ui']['ContextMenu']) {
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

          this.zoomAnimation = new anychart.animations.MapZoomAnimation(
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
      var viewSpacePath = this.scale().getViewSpace();
      boundsWithoutTx = viewSpacePath.getBoundsWithoutTransform();
      boundsWithTx = viewSpacePath.getBoundsWithTransform(mapLayer.getFullTransformation());

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

        if (this.isDesktop) {
          this.updateSeriesOnZoomOrMove();
        } else {
          this.getDataLayer().appendTransformationMatrix(1, 0, 0, 1, dx * this.getZoomLevel(), dy * this.getZoomLevel());
        }
      }
    }

    this.markConsistent(anychart.ConsistencyState.MAP_MOVE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_AXES)) {
    if (this.axesSettings_) {
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
    if (this.gridSettings_) {
      grids = this.gridSettings_.getItems();
      for (i = 0, len = grids.length; i < len; i++) {
        grid = grids[i];
        grid.suspendSignalsDispatching();
        grid.setScale(/** @type {anychart.scales.Geo} */(this.scale()));
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
    crosshair.xAxis(this.axesSettings_.getItems()[this.crosshair_.xLabel().axisIndex()]);
    crosshair.yAxis(this.axesSettings_.getItems()[this.crosshair_.yLabel().axisIndex()]);
    crosshair.draw();
    crosshair.resumeSignalsDispatching(false);

    this.markConsistent(anychart.ConsistencyState.MAP_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var path;
    if (this.unboundRegionsSettings_ == anychart.enums.MapUnboundRegionsMode.AS_IS) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        path = this.mapPaths[i];
        path.visible(true);
        path.removeAllListeners();
        delete path.tag;
      }
    } else if (goog.isObject(this.unboundRegionsSettings_) && this.unboundRegionsSettings_.enabled()) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        path = this.mapPaths[i];
        path.visible(true);
        path.removeAllListeners();
        delete path.tag;
        if (path instanceof acgraph.vector.Shape) {
          path
              .fill(this.unboundRegionsSettings_.fill())
              .stroke(this.unboundRegionsSettings_.stroke());
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
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_PALETTE) &&
      this.hasInvalidationState(anychart.ConsistencyState.MAP_MARKER_PALETTE) &&
      this.hasInvalidationState(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE) &&
      this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];

      seriesType = series.getType();
      this.applyLabelsOverlapState_[seriesType] = this.applyLabelsOverlapState_[seriesType] || !series.isConsistent();

      series.suspendSignalsDispatching();
      series.setParentEventTarget(this.getRootScene());
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
      series.setAutoGeoIdField(/** @type {string} */(this.geoIdField()));
      var seriesIndex = /** @type {number} */ (series.index());
      series.setAutoColor(this.palette().itemAt(seriesIndex));
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(seriesIndex)));
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(seriesIndex)));
      series.draw();

      series.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.MAP_PALETTE | anychart.ConsistencyState.MAP_MARKER_PALETTE |
        anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE | anychart.ConsistencyState.MAP_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoColor(this.palette().itemAt(/** @type {number} */ (series.index())));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(/** @type {number} */ (series.index()))));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(/** @type {number} */ (series.index()))));
      series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    }
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);
    this.markConsistent(anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];

      seriesType = series.getType();
      this.applyLabelsOverlapState_[seriesType] = this.applyLabelsOverlapState_[seriesType] || !series.isConsistent();

      series.suspendSignalsDispatching();
      series.setParentEventTarget(this.getRootScene());
      series.setAutoGeoIdField(/** @type {string} */(this.geoIdField()));
      series.draw();
      series.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.MAP_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_LABELS)) {
    this.applyLabelsOverlapState();
    this.markConsistent(anychart.ConsistencyState.MAP_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      this.colorRange_.suspendSignalsDispatching();
      this.colorRange_.container(this.rootElement);
      this.colorRange_.zIndex(anychart.charts.Map.ZINDEX_COLOR_RANGE);
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
        callout.zIndex(anychart.charts.Map.ZINDEX_CALLOUT);
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
 * @param {!Function} f Function for applying to feature chilren.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
anychart.charts.Map.prototype.featureTraverser = function(feature, f, opt_obj) {
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
anychart.charts.Map.prototype.getFeatureById = function(id) {
  if (!this.internalGeoData)
    return null;
  for (var i = 0, len = this.internalGeoData.length; i < len; i++) {
    var feature_ = this.internalGeoData[i];
    if (feature_['properties'][this.geoIdField()] == id) {
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
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.translateFeature = function(id, dx, dy) {
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
 * @return {anychart.charts.Map|Array.<number>}
 */
anychart.charts.Map.prototype.featureTranslation = function(id, opt_dx, opt_dy) {
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
 * @return {anychart.charts.Map|number}
 */
anychart.charts.Map.prototype.featureScaleFactor = function(id, opt_ratio) {
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

      var defaultScale = this.mapTX['default'].scale || anychart.charts.Map.DEFAULT_TX['default']['scale'];
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
 * @return {anychart.charts.Map|string}
 * @private
 */
anychart.charts.Map.prototype.featureCrs_ = function(feature, opt_crs) {
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

    var id = feature['properties'][this.geoIdField_];
    var featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
    var old_crs = featureTx.crs || this.mapTX['default'].crs || anychart.charts.Map.DEFAULT_TX['default']['crs'];
    var new_crs = opt_crs;

    oldProjection = anychart.core.map.projections.getProjection(old_crs);
    newProjection = anychart.core.map.projections.getProjection(new_crs);

    var xoffset = featureTx.xoffset || 0;
    var yoffset = featureTx.yoffset || 0;
    var featureScale = featureTx.scale || this.mapTX['default'].scale || anychart.charts.Map.DEFAULT_TX['default']['scale'];

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
 * @return {anychart.charts.Map|string}
 */
anychart.charts.Map.prototype.featureCrs = function(id, opt_crs) {
  var feature = this.getFeatureById(id);
  if (!feature) return null;

  return this.featureCrs_(feature, opt_crs);
};


/**
 * Sets crs to map.
 * @param {(Object|Function|anychart.enums.MapProjections|string)=} opt_value Name of common projection
 * (anychart.enums.MapProjections) or projection string representation or projection Object or Function
 * (like d3 projection, example - https://github.com/d3/d3-geo-projection/blob/master/src/bonne.js).
 * @return {Object|Function|anychart.enums.MapProjections|string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.crs = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeMapProjections(opt_value);
    if (this.crs_ != opt_value) {
      this.crs_ = opt_value;
      this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.crs_ || this.currentCrs_ || anychart.charts.Map.DEFAULT_TX['default']['crs'];
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
anychart.charts.Map.prototype.show = function() {
  this.rootElement.visible(true);
};


/**
 * Makes hidden root layer.
 */
anychart.charts.Map.prototype.hide = function() {
  this.rootElement.visible(false);

  var root = this.getRootScene();
  if (root.prevHoverSeriesStatus) {
    root.dispatchEvent(this.makeInteractivityPointEvent('hovered', {'target': this}, root.prevHoverSeriesStatus, true, true));
    root.prevHoverSeriesStatus = null;
  }
  root.unlisten(goog.events.EventType.MOUSEMOVE, root.updateTooltip);

  if (this.colorRange().enabled()) {
    this.colorRange().hideMarker();
  }
};


/**
 * Returns root scene (map).
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.getRootScene = function() {
  var rootScene = this.rootScene;
  if (!rootScene) {
    this.scenes = {};
    rootScene = this.scenes[anychart.charts.Map.ROOT_SCENE_NAME] = this;
    this.sceneId = anychart.charts.Map.ROOT_SCENE_NAME;
    this.currentScene = rootScene;
    this.rootScene = rootScene;
  }

  return rootScene;
};


/**
 * Returns current scene (map).
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.getCurrentScene = function() {
  return this.getRootScene().currentScene;
};


/**
 * Drill down map.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.charts.Map.prototype.drillDownMap = function(opt_value) {
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
 * @param {anychart.charts.Map} scene Scene.
 * @param {Function} callback Callback.
 * @param {...*} var_args Arguments.
 */
anychart.charts.Map.prototype.doAfterAnimation = function(scene, callback, var_args) {
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
 * @return {!Array.<anychart.core.MapPoint>}
 */
anychart.charts.Map.prototype.getDrilldownPath = function() {
  var root = this.getRootScene();
  var path = [new anychart.core.MapPoint(null, this, null, null)];
  path.push.apply(path, goog.array.slice(root.currentBreadcrumbsPath, 0));
  return path;
};


/**
 * Returns drill change event object.
 * @return {Object}
 */
anychart.charts.Map.prototype.createDrillChangeEvent = function() {
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
 * @param {anychart.charts.Map=} opt_map .
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.drillTo = function(id, opt_map) {
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
          target = /** @type {anychart.charts.Map}*/(crumb.getCurrentChart());
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
 * @param {anychart.charts.Map} target .
 * @private
 */
anychart.charts.Map.prototype.drillDown_ = function(id, target) {
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
    featureProperties[scene.geoIdField()] = id;
  }

  var json = newScene.serialize();
  var theme = {'map': anychart.getFullTheme('map')};
  var diff = anychart.themes.merging.demerge(json, theme);
  var mapDiff = diff['map'];
  var series = mapDiff['series'];

  if (!goog.isDef(mapDiff['maxZoomLevel'])) {
    newScene.maxZoomLevel(/** @type {number} */(scene.maxZoomLevel()));
  }

  if (!goog.isDef(mapDiff['minZoomLevel'])) {
    newScene.minZoomLevel(/** @type {number} */(scene.minZoomLevel()));
  }

  if (series && series.length && !goog.isDef(series[0]['colorScale'])) {
    var sourceScale = /** @type {anychart.scales.OrdinalColor|anychart.scales.LinearColor} */(scene.getSeries(0).colorScale());
    newScene.getSeries(0).colorScale(sourceScale);
  }

  if (series && series.length && series[0]['seriesType'] == 'choropleth' && !mapDiff['colorRange']) {
    var sourceColorRange = scene.colorRange();
    newScene.colorRange(sourceColorRange.serialize());

    var colorRange = /** @type {anychart.core.ui.ColorRange} */(newScene.colorRange());
    colorRange.labels().textFormatter(/** @type {Function|string} */(sourceColorRange.labels().textFormatter()));
    colorRange.labels().positionFormatter(/** @type {Function} */(sourceColorRange.labels().positionFormatter()));
    colorRange.minorLabels().textFormatter(/** @type {Function|string} */(sourceColorRange.minorLabels().textFormatter()));
    colorRange.minorLabels().positionFormatter(/** @type {Function} */(sourceColorRange.minorLabels().positionFormatter()));
  }

  if (!mapDiff['legend']) {
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
    root.currentBreadcrumbsPath.push(new anychart.core.MapPoint(scene, newScene, featureProperties, this.sceneId));
    // root.dispatchEvent(this.createDrillChangeEvent());

    newScene.show();
    newScene.tooltip().hide(null);

    var zoomParam = newScene.zoomToBounds(featureBounds, undefined, true);
    newScene.zoomDuration = 400;
    newScene.unlimitedZoom = true;

    newScene.zoomTo(this.minZoomLevel_, zoomParam[1], zoomParam[2]);

    this.doAfterAnimation(newScene, function(root) {
      this.zoomTo(this.minZoomLevel_);
      root.drillingInAction = false;
      setTimeout(goog.bind(function() {this.dispatchEvent(this.createDrillChangeEvent())}, root), 0);
    }, root);
  }, newScene, scene, root, featureBounds, featureProperties);
};


/**
 * @return {boolean}
 * @private
 */
anychart.charts.Map.prototype.readyForDrillUp_ = function() {
  var scene = this.getCurrentScene();
  var sceneLayer = scene.getMapLayer();
  var minZoom = /** @type {number} */(scene.minZoomLevel());
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
 * @param {anychart.charts.Map} target
 * @param {number=} opt_levels number of levels up.
 * @private
 */
anychart.charts.Map.prototype.drillUp_ = function(target, opt_levels) {
  var root = this.getRootScene();
  var source = this.getCurrentScene();
  if (source == target)
    return;

  root.drillingInAction = true;

  source.zoomDuration = 700;
  if (!source.readyForDrillUp_()) {
    source.zoomTo(/** @type {number} */(this.minZoomLevel_));
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
      this.zoomTo(this.minZoomLevel_);

      this.hide();
      this.unhover();
      this.enabled(false);

      root.currentScene = target;
      root.drillingInAction = false;

      goog.array.splice(root.currentBreadcrumbsPath, root.currentBreadcrumbsPath.length - levels, levels);

      target.tooltip().hide(null);
      this.tooltip().hide(null);

      target.show();
      setTimeout(goog.bind(function() {this.dispatchEvent(this.createDrillChangeEvent())}, root), 0);
    }, target, root);
  }, target, root);
};


/**
 * Drill up.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.drillUp = function() {
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
anychart.charts.Map.prototype.createZoomEvent = function(type) {
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
anychart.charts.Map.prototype.getZoomLevel = function() {
  return this.fullZoom;
};


/**
 * Max zoom level.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Map}
 */
anychart.charts.Map.prototype.maxZoomLevel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.maxZoomLevel_ != opt_value) {
      this.maxZoomLevel_ = opt_value;
    }
    return this;
  }

  return this.maxZoomLevel_;
};


/**
 * Min zoom level.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Map}
 */
anychart.charts.Map.prototype.minZoomLevel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.minZoomLevel_ != opt_value) {
      this.minZoomLevel_ = opt_value;
    }
    return this;
  }

  return this.minZoomLevel_;
};


/**
 * Zooms the map to passed zoom level and coordinates.
 * @param {number} value Zoom level for zooming.
 * @param {number=} opt_cx X coord of zoom point.
 * @param {number=} opt_cy Y coord of zoom point.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomTo = function(value, opt_cx, opt_cy, opt_duration) {
  if (!this.unlimitedZoom)
    value = goog.math.clamp(value, /** @type {number} */(this.minZoomLevel_), /** @type {number} */(this.maxZoomLevel_));
  return this.zoom(value / this.getZoomLevel(), opt_cx, opt_cy, opt_duration);
};


/**
 * Zoom to feature for passed id.
 * @param {string|Array.<string>} id Feature id.
 * @param {number=} opt_duration Duration of zoom animation.
 */
anychart.charts.Map.prototype.zoomToFeature = function(id, opt_duration) {
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
    this.zoomDuration = goog.isDef(opt_duration) ? opt_duration : isNaN(this.zoomDuration) ? anychart.charts.Map.TIMINGS.ZOOM_TO_FEATURE_DURATION : this.zoomDuration;
    if (goToHome) {
      if (anychart.math.roughlyEqual(srcZoom, zoom, 0.00001)) {
        if (this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START))) {
          this.zoomAnimation = new anychart.animations.MapZoomAnimation(
              this, [1, dx, dy], [1, dx + cx, dy + cy], this.zoomDuration);
          this.zoomAnimation.play();
        }
      } else {
        this.zoomTo(this.minZoomLevel_, cx, cy, this.zoomDuration);
      }

      this.prevZoomedFeature = null;
      this.prevTx = null;
    } else {
      if (anychart.math.roughlyEqual(srcZoom, zoom, 0.00001)) {
        if (this.getRootScene().dispatchEvent(this.createZoomEvent(anychart.enums.EventType.ZOOM_START))) {
          this.zoomAnimation = new anychart.animations.MapZoomAnimation(
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
anychart.charts.Map.prototype.zoomToBounds = function(bounds, opt_sourceBounds, opt_fullZoomOut) {
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
    zoom = Math.max(Math.min(zoom * scene.getZoomLevel(), scene.maxZoomLevel()), scene.minZoomLevel()) / scene.getZoomLevel();

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
 * Zoom factor.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomFactor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.zoomFactor_ = opt_value;
    return this;
  }

  return this.zoomFactor_;
};


/**
 * Zoom in.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomIn = function(opt_duration) {
  return this.zoom(this.zoomFactor_, undefined, undefined, opt_duration);
};


/**
 * Zoom out.
 * @param {number=} opt_duration Duration of zoom animation.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomOut = function(opt_duration) {
  return this.zoom(1 / this.zoomFactor_, undefined, undefined, opt_duration);
};


/**
 * Fit all.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.fitAll = function() {
  if (!this.drillingInAction) {
    if (this.zoomAnimation)
      this.zoomAnimation.stop();
    this.doAfterAnimation(this, function() {
      this.goingToHome = true;
      this.zoomDuration = anychart.charts.Map.TIMINGS.ZOOM_TO_HOME_DURATION;

      var scene = this.getCurrentScene();
      scene.zoomTo(scene.minZoomLevel());

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
 * @return {anychart.charts.Map} Returns itself for chaining.
 */
anychart.charts.Map.prototype.zoom = function(value, opt_cx, opt_cy, opt_duration) {
  if (goog.isDef(value)) {
    var state = 0;
    var signal = 0;

    if (goog.isDef(opt_duration))
      this.zoomDuration = opt_duration;

    value = anychart.utils.toNumber(value);
    if (((this.getZoomLevel() == this.minZoomLevel_ && value < 1) ||
        (this.getZoomLevel() == this.maxZoomLevel_ && value > 1)) && !this.unlimitedZoom) {
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
 * @return {anychart.charts.Map} Returns itself for chaining.
 */
anychart.charts.Map.prototype.move = function(dx, dy) {
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
anychart.charts.Map.prototype.transform = function(xLong, yLat) {
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
anychart.charts.Map.prototype.inverseTransform = function(x, y) {
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
anychart.charts.Map.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];

  var series, scale, itemData;
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      series = this.series_[i];
      scale = series.colorScale();
      itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.index();
      itemData['meta'] = {
        scale: scale
      };
      data.push(itemData);
    }
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.colorRange_ && this.colorRange_.enabled() && this.colorRange_.target() &&
        this.colorRange_.scale() instanceof anychart.scales.OrdinalColor) {
      scale = this.colorRange_.scale();
      series = this.colorRange_.target();
    } else {
      for (i = 0, count = this.series_.length; i < count; i++) {
        series = this.series_[i];
        if (series.colorScale() instanceof anychart.scales.OrdinalColor) {
          scale = series.colorScale();
          break;
        }
      }
    }
    if (scale) {
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
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
  return data;
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT || mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.Map.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
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
        var pointValue = iterator.get(series.referenceValueNames[1]);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
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
anychart.charts.Map.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.hoverSeries();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.map.series.Base} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get(series.referenceValueNames[1]);
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
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
anychart.charts.Map.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    var sourceKey = item.sourceKey();
    if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
      return;
    series = this.getSeries(/** @type {number} */ (sourceKey));
    if (series)
      series.unhover();
  } else if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
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
//region --- Setup and Dispose
/**
 * Exports map to GeoJSON format.
 * @return {Object}
 */
anychart.charts.Map.prototype.toGeoJSON = function() {
  return anychart.core.utils.GeoJSONParser.getInstance().exportToGeoJSON(this.internalGeoData, this.mapTX);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.charts.Map.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Map.base(this, 'setupByJSON', config, opt_default);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultCalloutSettings' in config)
    this.defaultCalloutSettings(config['defaultCalloutSettings']);

  this.defaultSeriesType(config['defaultSeriesType']);
  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.colorRange(config['colorRange']);
  this.unboundRegions(config['unboundRegions']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);
  this.geoIdField(config['geoIdField']);
  this.overlapMode(config['overlapMode']);
  this.minZoomLevel(config['minZoomLevel']);
  this.maxZoomLevel(config['maxZoomLevel']);

  var geoData = config['geoData'];
  if (geoData) {
    this.geoData(/** @type {string} */(goog.string.startsWith(geoData, '{') ? JSON.parse(geoData) : geoData));
  }
  if (goog.isDef(config['allowPointsSelect'])) {
    this.allowPointsSelect(config['allowPointsSelect']);
  }

  this.crsAnimation(config['crsAnimation']);
  this.crs(config['crs']);

  var i, json, scale;
  if (config['geoScale']) {
    scale = new anychart.scales.Geo();
    scale.setup(config['geoScale']);
    this.scale(scale);
  }

  var series = config['series'];
  var scales = config['colorScales'];
  var drillDownMap = config['drillDownMap'];

  if ('callouts' in config) {
    var callouts = config['callouts'];
    for (var j = 0, len = callouts.length; j < len; j++) {
      var callout = callouts[j];
      if (callout) {
        this.callout(j, callout);
      }
    }
  }

  if ('axesSettings' in config) {
    this.axes().setupByVal(config['axesSettings'], opt_default);
  }
  if ('gridsSettings' in config) {
    this.grids().setupByVal(config['gridsSettings'], opt_default);
  }

  this.crosshair(config['crosshair']);

  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      var type = goog.isString(json) ? json : json['type'];
      type = (type + '').toLowerCase();
      switch (type) {
        case 'ordinalcolor':
          scale = new anychart.scales.OrdinalColor();
          break;
        case 'linearcolor':
          scale = new anychart.scales.LinearColor();
          break;
        default:
          scale = new anychart.scales.LinearColor();
      }
      if (goog.isObject(json))
        scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.defaultSeriesType()).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
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

  if (goog.isObject(drillDownMap)) {
    this.drilldownMap_ = {};
    goog.object.forEach(drillDownMap, function(value, key) {
      this.drillDownMap()[key] = anychart.fromJson(value);
    }, this);
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.serialize = function() {
  var json = anychart.charts.Map.base(this, 'serialize');

  json['type'] = this.getType();
  json['defaultSeriesType'] = this.defaultSeriesType();
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['unboundRegions'] = goog.isString(this.unboundRegions()) ? this.unboundRegions() : this.unboundRegions().serialize();
  json['colorRange'] = this.colorRange().serialize();
  json['geoScale'] = this.scale().serialize();
  json['minBubbleSize'] = this.minBubbleSize();
  json['maxBubbleSize'] = this.maxBubbleSize();
  json['geoIdField'] = this.geoIdField();
  json['overlapMode'] = this.overlapMode();
  json['minZoomLevel'] = this.minZoomLevel();
  json['maxZoomLevel'] = this.maxZoomLevel();

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
  for (var i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
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

  json['axesSettings'] = this.axes().serialize();
  json['gridsSettings'] = this.grids().serialize();
  json['crosshair'] = this.crosshair().serialize();

  if (this.drilldownMap_) {
    json['drillDownMap'] = {};
    goog.object.forEach(this.drilldownMap_, function(value, key) {
      var mapJson;
      if (value instanceof anychart.charts.Map) {
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
anychart.charts.Map.prototype.disposeInternal = function() {
  goog.dispose(this.shortcutHandler);
  this.shortcutHandler = null;

  goog.dispose(this.mouseWheelHandler);
  this.mouseWheelHandler = null;

  if (this.container() && this.container().getStage()) {
    var container = this.container().getStage().getDomWrapper();
    if (this.mapClickHandler_) goog.events.unlisten(container, goog.events.EventType.CLICK, this.mapClickHandler_, false, this);
    if (this.mapDbClickHandler_) goog.events.unlisten(container, goog.events.EventType.DBLCLICK, this.mapDbClickHandler_, false, this);
    if (this.mapTouchEndHandler_) goog.events.unlisten(container, goog.events.EventType.POINTERUP, this.mapTouchEndHandler_, false, this);
    if (this.mapTouchEndHandler_) goog.events.unlisten(container, goog.events.EventType.TOUCHEND, this.mapTouchEndHandler_, false, this);
    if (this.mapMouseLeaveHandler_) goog.events.unlisten(container, goog.events.EventType.MOUSELEAVE, this.mapMouseLeaveHandler_, false, this);
  }

  if (this.mapTextarea) {
    goog.dom.removeNode(this.mapTextarea);
    delete this.mapTextarea;
  }

  anychart.charts.Map.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.charts.Map.prototype;
  goog.exportSymbol('anychart.charts.Map.DEFAULT_TX', anychart.charts.Map.DEFAULT_TX);
  proto['getType'] = proto.getType;
  proto['geoData'] = proto.geoData;
  proto['choropleth'] = proto.choropleth;
  proto['bubble'] = proto.bubble;
  proto['marker'] = proto.marker;
  proto['connector'] = proto.connector;
  proto['unboundRegions'] = proto.unboundRegions;
  proto['colorRange'] = proto.colorRange;
  proto['callout'] = proto.callout;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getSeries'] = proto.getSeries;
  proto['allowPointsSelect'] = proto.allowPointsSelect;
  proto['minBubbleSize'] = proto.minBubbleSize;
  proto['maxBubbleSize'] = proto.maxBubbleSize;
  proto['geoIdField'] = proto.geoIdField;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['overlapMode'] = proto.overlapMode;

  proto['interactivity'] = proto.interactivity;

  proto['axes'] = proto.axes;
  proto['grids'] = proto.grids;
  proto['crosshair'] = proto.crosshair;

  proto['crsAnimation'] = proto.crsAnimation;

  proto['toGeoJSON'] = proto.toGeoJSON;
  proto['featureTranslation'] = proto.featureTranslation;
  proto['translateFeature'] = proto.translateFeature;
  proto['featureScaleFactor'] = proto.featureScaleFactor;
  proto['featureCrs'] = proto.featureCrs;
  proto['crs'] = proto.crs;

  proto['zoom'] = proto.zoom;
  proto['move'] = proto.move;

  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;

  proto['zoomToFeature'] = proto.zoomToFeature;
  proto['zoomTo'] = proto.zoomTo;
  proto['getZoomLevel'] = proto.getZoomLevel;
  proto['maxZoomLevel'] = proto.maxZoomLevel;
  // proto['minZoomLevel'] = proto.minZoomLevel;

  proto['drillTo'] = proto.drillTo;
  proto['drillUp'] = proto.drillUp;
  proto['drillDownMap'] = proto.drillDownMap;
  proto['getDrilldownPath'] = proto.getDrilldownPath;
})();
//endregion
