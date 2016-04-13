goog.provide('anychart.charts.Map');

goog.require('acgraph.events.MouseWheelHandler');
goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.animations.MapAnimationController');
goog.require('anychart.animations.MapMoveAnimation');
goog.require('anychart.animations.MapZoomAnimation');
goog.require('anychart.core.MapPoint');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.map.scale.Geo');
goog.require('anychart.core.map.series.Base');
goog.require('anychart.core.ui.ColorRange');
goog.require('anychart.core.utils.MapInteractivity');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.core.utils.UnboundRegionsSettings');
goog.require('anychart.math.Rect');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.scales.LinearColor');
goog.require('anychart.scales.OrdinalColor');
goog.require('anychart.utils.GeoJSONParser');
goog.require('goog.dom');
goog.require('goog.ui.KeyboardShortcutHandler');



/**
 * AnyChart Map class.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Map = function() {
  anychart.charts.Map.base(this, 'constructor');

  /**
   * Internal represent of geo data.
   * @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
   */
  this.internalGeoData = [];

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
   * @type {Node|string|Object}
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
  this.initControlsInteractivity_ = goog.bind(function() {
    if (this.container().getStage() && this.container().getStage().container() && this.getPlotBounds()) {
      var container = /** @type {Node} */(this.container().getStage().container());

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

      this.shortcutHandler.registerShortcut('move_left', goog.events.KeyCodes.LEFT);
      this.shortcutHandler.registerShortcut('move_right', goog.events.KeyCodes.RIGHT);
      this.shortcutHandler.registerShortcut('move_up', goog.events.KeyCodes.UP);
      this.shortcutHandler.registerShortcut('move_down', goog.events.KeyCodes.DOWN);

      this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.BACKSPACE);
      this.shortcutHandler.registerShortcut('drill_up', goog.events.KeyCodes.ESC);

      this.shortcutHandler.listen(goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, function(e) {
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
            if (scene.zoomAnimation)
              scene.zoomAnimation.stop();
            this.doAfterAnimation(scene, function() {
              this.goingToHome = true;
              this.zoomDuration = 300;
              this.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR);
              this.doAfterAnimation(this, function() {
                this.goingToHome = false;
              });
            });
            break;
          case 'move_up':
            dx = 0;
            dy = 10 * scene.zoomLevel();
            scene.move(dx, dy);
            break;
          case 'move_left':
            dx = 10 * scene.zoomLevel();
            dy = 0;
            scene.move(dx, dy);
            break;
          case 'move_down':
            dx = 0;
            dy = -10 * scene.zoomLevel();
            scene.move(dx, dy);
            break;
          case 'move_right':
            dx = -10 * scene.zoomLevel();
            dy = 0;
            scene.move(dx, dy);
            break;
          case 'drill_up':
            if (scene.zoomLevel() == anychart.charts.Map.ZOOM_MIN_FACTOR) {
              this.drillUp();
            } else {
              if (scene.zoomAnimation)
                scene.zoomAnimation.stop();
              this.doAfterAnimation(scene, function() {
                this.goingToHome = true;
                this.zoomDuration = 300;
                this.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR);
                this.doAfterAnimation(this, function() {
                  this.goingToHome = false;
                });
              });
            }
            break;
        }
      }, false, this);

      this.mouseWheelHandler = new acgraph.events.MouseWheelHandler(/** @type {Element} */(this.container().getStage().container()), false, /** @type {acgraph.math.Rect}*/(this.getPlotBounds()));
      this.mouseWheelHandler.listen('mousewheel', function(e) {
        var scene = this.getCurrentScene();
        var mapLayer = scene.getMapLayer();

        this.isDesktop = true;
        var containerPosition = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
        var bounds = this.getPlotBounds();

        var insideBounds = bounds &&
            e.clientX >= bounds.left + containerPosition.x &&
            e.clientX <= bounds.left + containerPosition.x + bounds.width &&
            e.clientY >= bounds.top + containerPosition.y &&
            e.clientY <= bounds.top + containerPosition.y + bounds.height;

        if (this.interactivity_.mouseWheel() && insideBounds) {
          if (scene.goingToHome) return;
          var zoomFactor = goog.math.clamp(1 - e.deltaY / 120, 0.7, 2);

          var maxZoomFactor = anychart.charts.Map.ZOOM_MAX_FACTOR;
          var minZoomFactor = anychart.charts.Map.ZOOM_MIN_FACTOR;

          this.prevZoomState_ = this.zoomState_;
          this.zoomState_ = zoomFactor > 1 ? true : zoomFactor == 1 ? !this.prevZoomState_ : false;

          if (this.prevZoomState_ != this.zoomState_) {
            if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
              scene.zoomAnimation.stop();
            }
          }

          if (zoomFactor < 1 && anychart.math.round(scene.zoomLevel(), 2) == minZoomFactor && !mapLayer.getSelfTransformation().isIdentity()) {
            mapLayer.setTransformationMatrix(anychart.charts.Map.ZOOM_MIN_FACTOR, 0, 0, anychart.charts.Map.ZOOM_MIN_FACTOR, 0, 0);
            scene.fullZoom = anychart.charts.Map.ZOOM_MIN_FACTOR;
            scene.goingToHome = false;
            if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
              scene.zoomAnimation.stop();
            }

            scene.scale().setMapZoom(anychart.charts.Map.ZOOM_MIN_FACTOR);
            scene.scale().setOffsetFocusPoint(0, 0);

            scene.updateSeriesOnZoomOrMove();
          } else if ((zoomFactor > 1 && scene.zoomLevel() >= maxZoomFactor) || (zoomFactor < 1 && scene.zoomLevel() <= minZoomFactor)) {
            return;
          } else {
            var x = e.clientX - containerPosition.x;
            var y = e.clientY - containerPosition.y;

            scene.zoom(zoomFactor, x, y);
          }
        }
      }, false, this);

      this.mapClickHandler_ = function(e) {
        var containerPosition = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
        var bounds = this.getPixelBounds();

        var insideBounds = bounds &&
            e.clientX >= bounds.left + containerPosition.x &&
            e.clientX <= bounds.left + containerPosition.x + bounds.width &&
            e.clientY >= bounds.top + containerPosition.y &&
            e.clientY <= bounds.top + containerPosition.y + bounds.height;

        if (insideBounds) {
          var scrollX = window.scrollX;
          var scrollY = window.scrollY;
          this.mapTextarea.focus();
          window.scrollTo(scrollX, scrollY);
        }
      };
      this.mapDbClickHandler_ = function(e) {
        var scene = this.getCurrentScene();
        var containerPosition = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
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
      };
      this.mapTouchEndHandler_ = function(e) {
        goog.style.setStyle(document['body'], 'cursor', '');
        this.touchDist = 0;
        this.drag_ = false;
        goog.events.unlisten(document, [goog.events.EventType.POINTERMOVE, goog.events.EventType.TOUCHMOVE], this.touchMoveHandler, false, this);
        this.updateSeriesOnZoomOrMove();
      };
      this.mapMouseEnterHandler_ = function(e) {
        this.mouseOverChart = true;
        goog.events.listen(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, false, this);
        goog.events.listen(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, false, this);
      };
      this.mapMouseLeaveHandler_ = function(e) {
        if (!this.drag_) {
          this.mouseOverChart = false;
          goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, false, this);
          goog.events.unlisten(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, false, this);
        }
      };

      goog.events.listen(this.container().getStage().container(), goog.events.EventType.CLICK, this.mapClickHandler_, false, this);

      goog.events.listen(this.container().getStage().container(), goog.events.EventType.DBLCLICK, this.mapDbClickHandler_, false, this);

      this.touchDist = 0;
      goog.events.listen(this.container().getStage().container(), [goog.events.EventType.POINTERUP, goog.events.EventType.TOUCHEND], this.mapTouchEndHandler_, false, this);


      this.listen(goog.events.EventType.MOUSEDOWN, function(e) {
        var containerPosition = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
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
          this.drag_ = true;
        }
      }, false, this);
      this.mouseMoveHandler = function(e) {
        var scene = this.getCurrentScene();

        if (this.drag_ && this.interactivity_.drag() && scene.zoomLevel() != 1) {
          goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.MOVE);
          scene.move(e.clientX - startX, e.clientY - startY);

          startX = e.clientX;
          startY = e.clientY;
        } else {
          goog.style.setStyle(document['body'], 'cursor', '');
        }
      };
      this.mouseUpHandler = function(e) {
        goog.style.setStyle(document['body'], 'cursor', '');
        this.drag_ = false;

        if (!this.mouseOverChart) {
          goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, false, this);
          goog.events.unlisten(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, false, this);
        }
      };

      var startX, startY;
      goog.events.listen(this.container().getStage().container(), goog.events.EventType.MOUSEENTER, this.mapMouseEnterHandler_, false, this);


      goog.events.listen(this.container().getStage().container(), goog.events.EventType.MOUSELEAVE, this.mapMouseLeaveHandler_, false, this);
    } else {
      setTimeout(this.initControlsInteractivity_, 100);
    }
  }, this);

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

  this.unboundRegions(true);
  this.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);

  if (this.supportsBaseHighlight)
    this.eventsHandler.listen(this, [goog.events.EventType.POINTERDOWN, acgraph.events.EventType.TOUCHSTART], this.tapHandler);
};
goog.inherits(anychart.charts.Map, anychart.core.SeparateChart);


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Map.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MAP_SERIES |
    anychart.ConsistencyState.MAP_SCALE |
    anychart.ConsistencyState.MAP_GEO_DATA |
    anychart.ConsistencyState.MAP_PALETTE |
    anychart.ConsistencyState.MAP_COLOR_RANGE |
    anychart.ConsistencyState.MAP_MARKER_PALETTE |
    anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.MAP_MOVE |
    anychart.ConsistencyState.MAP_ZOOM;


/**
 * Animation and other timings.
 * @enum {number}
 */
anychart.charts.Map.TIMINGS = {
  ALL_ANIMATION_FINISHED_DELAY: 300,
  DEFAULT_ZOOM_DURATION: 20,
  TEST_DRAG_DELAY: 70
};


/**
 * @type {Object}
 */
anychart.charts.Map.DEFAULT_TX = {
  'default': {
    'crs': '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
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
 * Series labels z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_LABELS = 11;


/**
 * Series markers z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_MARKERS = 12;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_SERIES = 30;


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
 * Series hatch fill z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_CHORPLETH_HATCH_FILL = 60;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_AXIS = 100;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Maximum zoom ratio.
 * @type {number}
 */
anychart.charts.Map.ZOOM_MAX_FACTOR = 10;


/**
 * Minimum zoom ratio.
 * @type {number}
 */
anychart.charts.Map.ZOOM_MIN_FACTOR = 1;


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
 * @type {anychart.core.map.scale.Geo}
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
 * Origin x coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.cx_;


/**
 * Origin y coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.cy_;


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
 * Map transformations object.
 * @type {Object.<string, Object.<{scale: number, src: string, xoffset: number, yoffset: number, heatZone: Object.<{left: number, top: number, width: number, height: number}>}>>}
 */
anychart.charts.Map.prototype.mapTX = null;


/**
 * Allow point selection if is true.
 * @type {boolean}
 * @private
 */
anychart.charts.Map.prototype.allowPointsSelect_;


/**
 * Handler for specified touch event - tap.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.charts.Map.prototype.tapHandler = function(event) {
  this.isDesktop = false;
  var containerPosition = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));
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
      this.drag_ = true;
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
  if (!this.mouseMoveTesting) {
    this.testDragHandler = this.eventsHandler.listenOnce(this, acgraph.events.EventType.MOUSEMOVE, function(e) {
      this.itWasDrag = true;
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


/** @inheritDoc */
anychart.charts.Map.prototype.handleMouseOverAndMove = function(event) {
  if (!this.drag_) {
    anychart.charts.Map.base(this, 'handleMouseOverAndMove', event);
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.handleMouseOut = function(event) {
  if (!this.drag_) {
    anychart.charts.Map.base(this, 'handleMouseOut', event);
  }
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


    if (this.interactivity_.mouseWheel() && isZooming) {
      var zoomFactor = goog.math.clamp(1 - e.deltaY / 120, 0.7, 2);
      if (scene.goingToHome) zoomFactor = 1 / scene.zoomLevel();

      this.prevZoomState_ = this.zoomState_;
      this.zoomState_ = zoomFactor > 1 ? true : zoomFactor == 1 ? !this.prevZoomState_ : false;

      if (this.prevZoomState_ != this.zoomState_) {
        if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
          scene.zoomAnimation.stop();
        }
      }

      if (zoomFactor < 1 && anychart.math.round(scene.zoomLevel(), 2) == anychart.charts.Map.ZOOM_MIN_FACTOR && !mapLayer.getSelfTransformation().isIdentity()) {
        mapLayer.setTransformationMatrix(anychart.charts.Map.ZOOM_MIN_FACTOR, 0, 0, anychart.charts.Map.ZOOM_MIN_FACTOR, 0, 0);
        scene.fullZoom = anychart.charts.Map.ZOOM_MIN_FACTOR;
        scene.goingToHome = false;
        if (scene.zoomAnimation && scene.zoomAnimation.isPlaying()) {
          scene.zoomAnimation.stop();
        }

        scene.scale().setMapZoom(anychart.charts.Map.ZOOM_MIN_FACTOR);
        scene.scale().setOffsetFocusPoint(0, 0);

        scene.updateSeriesOnZoomOrMove();
      } else {
        var bounds = goog.style.getBounds(this.container().domElement());
        var x = c_x - bounds.left;
        var y = c_y - bounds.top;

        scene.zoomDuration = 1;
        scene.zoom(zoomFactor, x, y);
      }
    }
  } else if (touchCount == 1) {
    if (this.drag_ && this.interactivity_.drag() && this.zoomLevel() != 1) {
      goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.MOVE);
      scene.move(e.clientX - scene.startTouchX, e.clientY - scene.startTouchY);

      scene.startTouchX = e.clientX;
      scene.startTouchY = e.clientY;
    } else {
      goog.style.setStyle(document['body'], 'cursor', '');
    }
  }
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


/** @inheritDoc */
anychart.charts.Map.prototype.getType = function() {
  return anychart.enums.MapTypes.MAP;
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
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoIdField_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Map scale.
 * @param {anychart.core.map.scale.Geo=} opt_value Scale to set.
 * @return {!(anychart.core.map.scale.Geo|anychart.charts.Map)} Default chart scale value or itself for method chaining.
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
      this.scale_ = new anychart.core.map.scale.Geo();
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
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|boolean)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.UnboundRegionsSettings|anychart.charts.Map}
 */
anychart.charts.Map.prototype.unboundRegions = function(opt_value) {
  if (!this.unboundRegionsSettings_)
    this.unboundRegionsSettings_ = new anychart.core.utils.UnboundRegionsSettings(this);

  if (goog.isDef(opt_value)) {
    this.unboundRegionsSettings_.setup(opt_value);
    return this;
  }
  return this.unboundRegionsSettings_;
};


/**
 * Allows to select points of the Map.
 * @param {boolean=} opt_value Allow or not.
 * @return {boolean|anychart.charts.Map} Returns allow points select state or current map instance for chaining.
 * @deprecated use chart.interactivity().selectionMode().
 */
anychart.charts.Map.prototype.allowPointsSelect = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.interactivity().selectionMode(opt_value ?
        anychart.enums.SelectionMode.MULTI_SELECT :
        anychart.enums.SelectionMode.NONE);
    return this;
  }
  return this.interactivity().selectionMode() != anychart.enums.SelectionMode.NONE;
};


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
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


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
    if (i.toLowerCase() == type)
      ctl = anychart.core.map.series.Base.SeriesTypesMap[i];
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
    instance.setGeoData(this, this.internalGeoData);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));

    if (instance.hasMarkers()) {
      instance.markers().setAutoZIndex(anychart.charts.Map.ZINDEX_MARKER + inc);
      instance.markers().setAutoFill((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerFill());
      instance.markers().setAutoStroke((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerStroke());
    }

    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.MAP_SERIES |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
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
    state = anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.APPEARANCE;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.MAP_SERIES | anychart.ConsistencyState.CHART_LEGEND;
    this.invalidateSeries_();
    for (var i = this.series_.length; i--;)
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_DATA);
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
 * Getter/setter geo data.
 * @param {Node|string|Object=} opt_data SVG|SVGString|GeoJSON|MapNameString.
 * @return {Node|string|Object} Passed geo data.
 */
anychart.charts.Map.prototype.geoData = function(opt_data) {
  if (goog.isDef(opt_data)) {
    if (goog.isString(opt_data)) {
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
          anychart.ConsistencyState.MAP_COLOR_RANGE |
          anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
          anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.geoData_;
};


/** @inheritDoc */
anychart.charts.Map.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


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
 * Returns map layer (layer with map)
 * @return {acgraph.vector.Layer}
 */
anychart.charts.Map.prototype.getContentLayer = function() {
  return this.mapContentLayer_;
};


/**
 * Clear map paths.
 */
anychart.charts.Map.prototype.clear = function() {
  if (this.mapLayer_) this.mapLayer_.clear();
  this.mapPaths.length = 0;
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
 * Update series on zoom or moove.
 */
anychart.charts.Map.prototype.updateSeriesOnZoomOrMove = function() {
  this.dataLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

  for (var i = this.series_.length; i--;) {
    var series = this.series_[i];
    series.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
    series.updateOnZoomOrMove();
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Map.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
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
    if (index == 0) geom.domElement.moveTo(x, y);
    else geom.domElement.lineTo(x, y);
  }
};


/**
 * Function for calculate geo scale.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @private
 */
anychart.charts.Map.prototype.calcGeom_ = function(coords, index, geom) {
  this.scale().extendDataRangeX(coords[index]);
  this.scale().extendDataRangeY(coords[index + 1]);
};


/**
 * Draw geometry.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geometry.
 * @param {function(
 *            this: anychart.charts.Map,
 *            Array.<number>,
 *            number,
 *            (anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon)
 *         )} callBack DOM element.
 * @private
 */
anychart.charts.Map.prototype.iterateGeometry_ = function(geom, callBack) {
  var j, k, m, geomsLen, pointsLen;
  if (!geom) return;
  if (goog.object.containsKey(geom, 'polygones')) {
    var polygones = geom['polygones'];
    geomsLen = polygones.length;
    for (j = 0; j < geomsLen; j++) {
      var polygone = polygones[j];
      var outerPath = polygone['outerPath'];
      var holes = polygone['holes'];
      pointsLen = outerPath.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, outerPath, k, geom);
      }

      pointsLen = holes.length;
      for (k = 0; k < pointsLen; k++) {
        var hole = holes[k];
        for (m = 0; m < hole.length - 1; m += 2) {
          callBack.call(this, hole, m, geom);
        }
      }
    }
  } else if (goog.object.containsKey(geom, 'paths')) {
    var paths = geom['paths'];
    geomsLen = paths.length;
    for (j = 0; j < geomsLen; j++) {
      var path = paths[j];
      pointsLen = path.length;
      for (k = 0; k < pointsLen - 1; k += 2) {
        callBack.call(this, path, k, geom);
      }
    }
  } else if (goog.object.containsKey(geom, 'coordinates')) {
    var coords = geom['coordinates'];
    pointsLen = coords.length;
    for (k = 0; k < pointsLen - 1; k += 2) {
      callBack.call(this, coords, k, geom);
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.drawCredits = function(parentBounds) {
  var rootScene = this.getRootScene();
  return this == rootScene ? anychart.charts.Map.base(this, 'drawCredits', parentBounds) : rootScene.credits().getRemainingBounds();
};


/**
 * Geo data processing.
 */
anychart.charts.Map.prototype.processGeoData = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    var geoData = this.geoData();
    if (goog.isDefAndNotNull(geoData)) {
      if ((goog.isString(geoData) && goog.string.startsWith(geoData, '<')) || goog.dom.isNodeLike(geoData)) {
        //todo (blackart): Here will be svg parsing. coming soon ...
      }
      this.internalGeoData = anychart.utils.GeoJSONParser.getInstance().parse(/** @type {Object} */(geoData));

      var geoIdFromGeoData = geoData['ac-geoFieldId'];
      if (geoIdFromGeoData)
        this.geoIdField(geoIdFromGeoData);


      this.mapTX = {};
      goog.object.forEach(geoData['ac-tx'] || anychart.charts.Map.DEFAULT_TX, function(value, key) {
        var tx_ = {};

        if (goog.isDef(value['crs'])) tx_.crs = value['crs'];
        if (goog.isDef(value['scale'])) tx_.scale = parseFloat(value['scale']);
        if (goog.isDef(value['xoffset'])) tx_.xoffset = parseFloat(value['xoffset']);
        if (goog.isDef(value['yoffset'])) tx_.yoffset = parseFloat(value['yoffset']);
        if (goog.isDef(value['heatZone'])) tx_.heatZone = anychart.math.Rect.fromJSON(value['heatZone']);

        this.mapTX[key] = tx_;
      }, this);

      if (!this.mapTX['default'])
        this.mapTX['default'] = anychart.charts.Map.DEFAULT_TX['default'];


      if (!this.mapContentLayer_) {
        this.mapContentLayer_ = this.rootElement.layer();
        this.mapContentLayer_.zIndex(anychart.charts.Map.ZINDEX_MAP);
      }

      if (!this.mapLayer_) {
        this.mapLayer_ = new anychart.core.utils.TypedLayer(function() {
          var path = acgraph.path();
          path.disableStrokeScaling(true);
          return path;
        }, function(path) {
          if (path) {
            path.clear();
            path.parent(null);
            path.removeAllListeners();
            path.setTransformationMatrix(1, 0, 0, 1, 0, 0);
            delete path.tag;
          }
        });
        this.mapLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.mapContentLayer_));
        this.mapLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

        if (this.getRootScene() == this)
          this.initControlsInteractivity_();

      } else {
        this.clear();
      }

      if (!this.dataLayer_) {
        this.dataLayer_ = this.mapContentLayer_.layer();
      }

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.MAP_GEO_DATA);
  }
};


/**
 * Calculate geo scale.
 */
anychart.charts.Map.prototype.calculate = function() {
  this.processGeoData();

  var i, series;
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SCALE)) {
    var scale = this.scale();
    scale.startAutoCalc();
    scale.setTxMap(this.mapTX);

    if (this.mapLayer_) {
      var tx = this.mapLayer_.getSelfTransformation();
      scale.setMapZoom(tx.getScaleX());
      scale.setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

      //if (this.zoomLevel() != anychart.charts.Map.ZOOM_MIN_FACTOR) {
      //scene.zoomInc = anychart.charts.Map.ZOOM_MIN_FACTOR;
      //}
    }

    var j, len;
    for (i = 0, len = this.internalGeoData.length; i < len; i++) {
      var geom = this.internalGeoData[i];
      if (geom) {
        if (goog.object.containsKey(geom, 'geometries')) {
          var geometries = geom['geometries'];
          var geomsLen = geometries.length;
          for (j = 0; j < geomsLen; j++) {
            this.iterateGeometry_(geometries[j], this.calcGeom_);
          }
        } else {
          this.iterateGeometry_(
              /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom),
              this.calcGeom_);
        }
      }
    }
    scale.finishAutoCalc();

    var max = -Infinity;
    var min = Infinity;
    var sum = 0;
    var pointsCount = 0;

    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.setGeoData(this, this.internalGeoData);
      series.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);

      //----------------------------------calc statistics for series
      series.calculateStatistics();
      max = Math.max(max, /** @type {number} */(series.statistics('seriesMax')));
      min = Math.min(min, /** @type {number} */ (series.statistics('seriesMin')));
      sum += /** @type {number} */(series.statistics('seriesSum'));
      pointsCount += /** @type {number} */(series.statistics('seriesPointsCount'));
      //----------------------------------end calc statistics for series
      series.calculate();
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series

    this.maxStrokeThickness_ = 0;
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

    this.markConsistent(anychart.ConsistencyState.MAP_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_SERIES)) {
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
      series.container(this.dataLayer_);
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.drawContent = function(bounds) {
  this.getRootScene();

  var i, series, tx;
  var maxZoomFactor = anychart.charts.Map.ZOOM_MAX_FACTOR;
  var minZoomFactor = anychart.charts.Map.ZOOM_MIN_FACTOR;
  var boundsWithoutTx, boundsWithTx;

  this.calculate();

  var mapLayer = this.getMapLayer();

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_COLOR_RANGE)) {
    if (this.colorRange_) {
      var targetSeries;
      for (i = 0; i < this.series_.length; i++) {
        if (this.series_[i].isChoropleth())
          targetSeries = this.series_[i];
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

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var scale = this.scale();
    var contentAreaBounds;
    if (this.colorRange_) {
      this.colorRange_.parentBounds(bounds.clone().round());
      contentAreaBounds = this.colorRange_.getRemainingBounds();
    } else {
      contentAreaBounds = bounds.clone();
    }

    var unboundRegionsStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.unboundRegionsSettings_.stroke()));
    if (unboundRegionsStrokeThickness > this.maxStrokeThickness_)
      this.maxStrokeThickness_ = unboundRegionsStrokeThickness;

    var dataBounds = contentAreaBounds.clone();
    dataBounds.left = contentAreaBounds.left + this.maxStrokeThickness_ / 2;
    dataBounds.top = contentAreaBounds.top + this.maxStrokeThickness_ / 2;
    dataBounds.width = contentAreaBounds.width - this.maxStrokeThickness_;
    dataBounds.height = contentAreaBounds.height - this.maxStrokeThickness_;

    scale.setBounds(dataBounds);
    this.dataBounds_ = dataBounds;
    if (this.mouseWheelHandler)
      this.mouseWheelHandler.setBounds(/** @type {acgraph.math.Rect}*/(this.getPlotBounds()));

    if (this.mapContentLayer_)
      this.mapContentLayer_.clip(contentAreaBounds);

    this.clear();

    var j, len;
    for (i = 0, len = this.internalGeoData.length; i < len; i++) {
      var geom = this.internalGeoData[i];
      if (!geom) continue;

      var domElement = this.mapLayer_.genNextChild();
      geom.domElement = domElement;
      this.mapPaths.push(domElement);

      if (goog.object.containsKey(geom, 'geometries')) {
        var geometries = geom['geometries'];
        var geomsLen = geometries.length;
        for (j = 0; j < geomsLen; j++) {
          this.iterateGeometry_(geometries[j], this.drawGeom_);
        }
      } else {
        this.iterateGeometry_(
            /** @type {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} */(geom),
            this.drawGeom_);
      }
    }

    for (i = this.series_.length; i--;) {
      this.series_[i].invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_ZOOM)) {
    if (!((this.zoomLevel() == minZoomFactor && this.zoomInc * this.zoomLevel() < minZoomFactor) ||
        (this.zoomLevel() == maxZoomFactor && this.zoomLevel() * this.zoomInc > maxZoomFactor)) && mapLayer || this.unlimitedZoom) {

      if (isNaN(this.cx) || isNaN(this.cy)) {
        boundsWithoutTx = mapLayer.getBoundsWithoutTransform();

        var defaultCx = boundsWithoutTx.left + boundsWithoutTx.width / 2;
        var defaultCy = boundsWithoutTx.top + boundsWithoutTx.height / 2;

        if (isNaN(this.cx)) this.cx = defaultCx;
        if (isNaN(this.cy)) this.cy = defaultCy;
      }

      var zoomIn = this.zoomInc > 1;
      var zoomOut = this.zoomInc < 1;
      var noZoom = this.zoomInc == 1;

      if (!this.unlimitedZoom) {
        if ((this.zoomLevel() > maxZoomFactor && zoomIn) || (this.zoomLevel() < minZoomFactor && zoomOut))
          noZoom = true;
        else if ((this.zoomLevel() > maxZoomFactor && zoomOut) || (this.zoomLevel() < minZoomFactor && zoomIn))
          noZoom = false;
        else if (this.zoomLevel() * this.zoomInc > maxZoomFactor)
          this.zoomInc = maxZoomFactor / this.zoomLevel();
        else if (this.zoomLevel() * this.zoomInc < minZoomFactor && zoomOut)
          this.zoomInc = minZoomFactor / this.zoomLevel();
      }

      if (!noZoom || this.unlimitedZoom) {
        if (!this.zoomAnimation || this.zoomAnimation.isStopped()) {
          this.zoomSource = this.zoomLevel();
          this.zoomDest = this.zoomInc * this.zoomLevel();

          var duration = this.zoomDuration || anychart.charts.Map.TIMINGS.DEFAULT_ZOOM_DURATION;

          this.zoomAnimation = new anychart.animations.MapZoomAnimation(this, [this.zoomLevel()], [this.zoomDest], duration, this != this.getCurrentScene());
          this.zoomAnimation
              .play();
        }
      }
    }

    this.zoomDuration = NaN;
    this.zoomInc = 1;
    this.markConsistent(anychart.ConsistencyState.MAP_ZOOM);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_MOVE)) {
    if (this.zoomLevel() != minZoomFactor && mapLayer) {
      boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
      boundsWithTx = mapLayer.getBounds();

      var dx, dy;
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

      dx = dx / this.zoomLevel();
      dy = dy / this.zoomLevel();

      this.offsetX = 0;
      this.offsetY = 0;

      if (dx || dy) {
        mapLayer.appendTransformationMatrix(1, 0, 0, 1, dx, dy);

        tx = mapLayer.getSelfTransformation();
        this.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

        if (this.isDesktop) {
          this.updateSeriesOnZoomOrMove();
        } else {
          this.getDataLayer().appendTransformationMatrix(1, 0, 0, 1, dx * this.zoomLevel(), dy * this.zoomLevel());
        }
      }
    }

    this.markConsistent(anychart.ConsistencyState.MAP_MOVE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.unboundRegionsSettings_ && this.unboundRegionsSettings_.enabled()) {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        this.mapPaths[i].visible(true)
            .fill(this.unboundRegionsSettings_.fill())
            .stroke(this.unboundRegionsSettings_.stroke());
      }
    } else {
      for (i = 0, len = this.mapPaths.length; i < len; i++) {
        this.mapPaths[i].visible(false);
      }
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.MAP_SERIES);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_PALETTE |
      anychart.ConsistencyState.MAP_MARKER_PALETTE |
      anychart.ConsistencyState.MAP_HATCH_FILL_PALETTE |
      anychart.ConsistencyState.MAP_SERIES))
  {
    this.calcBubbleSizes_();
    for (i = this.series_.length; i--;) {
      series = this.series_[i];
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
      series.setAutoGeoIdField(/** @type {string} */(this.geoIdField()));
      series.draw();
    }
    this.markConsistent(anychart.ConsistencyState.MAP_SERIES);
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
};


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
  // we need to calculate statistics
  this.calculate();

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


//----------------------------------------------------------------------------------------------------------------------
//
//  Events.
//
//----------------------------------------------------------------------------------------------------------------------
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

  var containerOffset = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));

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
  var eventSeriesStatus = [];
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
          var prop = iterator.meta('regionProperties');
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
        prop = iterator.meta('regionProperties');
        if (prop) {
          point['id'] = prop[series.getFinalGeoIdField()];
          point['index'] = iterator.getIndex();
          point['properties'] = prop;
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


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.charts.Map.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.ALL & ~(anychart.ConsistencyState.CHART_ANIMATION | anychart.ConsistencyState.MAP_GEO_DATA),
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
      this.interactivity_.hoverMode(opt_value);
    return this;
  }
  return this.interactivity_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Map editing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * It returns feature by its id.
 * @param {string} id
 * @return {Object}
 */
anychart.charts.Map.prototype.getFeatureById = function(id) {
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
  if (feature) {
    bounds = feature.domElement.getBoundsWithoutTransform();
    latLon = this.scale().inverseTransform(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2);
    current_tx = this.scale().pickTx(latLon[0], latLon[1]);
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;

    dx = dx / this.zoomLevel();
    dy = dy / this.zoomLevel();

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
    current_tx = this.scale().pickTx(latLon[0], latLon[1]);
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
  }

  if (goog.isDef(opt_dx) || goog.isDef(opt_dy)) {
    if (feature) {
      var offsetX = featureTx.xoffset || 0;
      var offsetY = featureTx.yoffset || 0;

      var offsetX_px = offsetX * this.scale().ratio;
      var offsetY_px = offsetY * this.scale().ratio;

      opt_dx = goog.isDef(opt_dx) ? opt_dx : offsetX_px;
      opt_dy = goog.isDef(opt_dy) ? opt_dy : offsetY_px;

      opt_dx = opt_dx / this.zoomLevel();
      opt_dy = opt_dy / this.zoomLevel();

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
    current_tx = scale.pickTx(latLon[0], latLon[1]);
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
  }

  if (goog.isDef(opt_ratio)) {
    if (feature) {
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

  var current_tx = scale.pickTx(latLon[0], latLon[1]);

  if (!goog.isDef(opt_crs)) {
    return goog.isDef(current_tx.crs) ? current_tx.crs : this.mapTX['default'].crs;
  } else {
    var x, y, scaledCoord, x_, y_;

    var projected;

    feature.domElement.clear();

    var id = feature['properties'][this.geoIdField_];
    var featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;
    var old_crs = featureTx.crs || this.mapTX['default'].crs || anychart.charts.Map.DEFAULT_TX['default']['crs'];
    var new_crs = opt_crs;
    var xoffset = featureTx.xoffset || 0;
    var yoffset = featureTx.yoffset || 0;
    var featureScale = featureTx.scale || this.mapTX['default'].scale || anychart.charts.Map.DEFAULT_TX['default']['scale'];

    for (var i = 0, len = feature['polygones'].length; i < len; i++) {
      var polygon = feature['polygones'][i];
      var outerPath = polygon['outerPath'];
      for (var j = 0; j < outerPath.length - 1; j += 2) {
        x_ = ((outerPath[j] - xoffset) / featureScale);
        y_ = ((outerPath[j + 1] - yoffset) / featureScale);

        projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

        outerPath[j] = projected[0] * featureScale + xoffset;
        outerPath[j + 1] = projected[1] * featureScale + yoffset;

        scaledCoord = scale.scaleToPx(outerPath[j], outerPath[j + 1]);

        x = scaledCoord[0];
        y = scaledCoord[1];

        if (j == 0)
          feature.domElement.moveTo(x, y);
        else
          feature.domElement.lineTo(x, y);
      }
      var holes = polygon['holes'];
      for (j = 0; j < holes.length - 1; j += 2) {
        x_ = ((holes[j] - xoffset) / featureScale);
        y_ = ((holes[j + 1] - yoffset) / featureScale);

        projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

        holes[j] = projected[0] * featureScale + xoffset;
        holes[j + 1] = projected[1] * featureScale + yoffset;

        scaledCoord = scale.scaleToPx(holes[j], holes[j + 1]);

        x = scaledCoord[0];
        y = scaledCoord[1];

        if (j == 0)
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
 * @param {string=} opt_value String crs representation.
 * @return {string|anychart.charts.Map}
 */
anychart.charts.Map.prototype.crs = function(opt_value) {
  if (goog.isDef(opt_value)) {

    var scale = this.scale();
    var x, y, scaledCoord, x_, y_;
    var projected;

    for (var k = 0, len = this.internalGeoData.length; k < len; k++) {
      var feature = this.internalGeoData[k];
      var bounds = feature.domElement.getBounds();
      var latLon = scale.inverseTransform(
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2);

      var current_tx = scale.pickTx(latLon[0], latLon[1]);

      if (current_tx == this.mapTX['default']) {
        feature.domElement.clear();

        var featureTx = this.mapTX['default'];
        var old_crs = featureTx.crs || anychart.charts.Map.DEFAULT_TX['default']['crs'];
        var new_crs = opt_value;
        var xoffset = featureTx.xoffset || 0;
        var yoffset = featureTx.yoffset || 0;
        var featureScale = featureTx.scale || anychart.charts.Map.DEFAULT_TX['default']['scale'];

        for (var i = 0, len_ = feature['polygones'].length; i < len_; i++) {
          var polygon = feature['polygones'][i];
          var outerPath = polygon['outerPath'];
          for (var j = 0; j < outerPath.length - 1; j += 2) {
            x_ = ((outerPath[j] - xoffset) / featureScale);
            y_ = ((outerPath[j + 1] - yoffset) / featureScale);

            projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

            outerPath[j] = projected[0] * featureScale + xoffset;
            outerPath[j + 1] = projected[1] * featureScale + yoffset;

            scaledCoord = scale.scaleToPx(outerPath[j], outerPath[j + 1]);

            x = scaledCoord[0];
            y = scaledCoord[1];

            if (j == 0)
              feature.domElement.moveTo(x, y);
            else
              feature.domElement.lineTo(x, y);
          }
          var holes = polygon['holes'];
          for (j = 0; j < holes.length - 1; j += 2) {
            x_ = ((holes[j] - xoffset) / featureScale);
            y_ = ((holes[j + 1] - yoffset) / featureScale);

            projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

            holes[j] = projected[0] * featureScale + xoffset;
            holes[j + 1] = projected[1] * featureScale + yoffset;

            scaledCoord = scale.scaleToPx(holes[j], holes[j + 1]);

            x = scaledCoord[0];
            y = scaledCoord[1];

            if (j == 0)
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

        for (i = 0, len_ = feature['polygones'].length; i < len_; i++) {
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
      }
    }

    this.mapTX['default'].crs = opt_value;
    this.invalidate(anychart.ConsistencyState.MAP_SCALE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.mapTX['default'].crs;
};


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
anychart.charts.Map.prototype.getCurrentPath = function() {
  var root = this.getRootScene();
  return goog.array.slice(root.currentBreadcrumbsPath, 0);
};


/**
 * Returns drill change event object.
 * @return {Object}
 */
anychart.charts.Map.prototype.createDrillChangeEvent = function() {
  return {
    'type': anychart.enums.EventType.DRILL_CHANGE,
    'path': this.getCurrentPath(),
    'currentMap': this.getCurrentScene()
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
        anychart.utils.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
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
    featureBounds = feature.domElement.getBoundsWithTransform(scene.getMapLayer().getFullTransformation());
    featureProperties = feature['properties'];
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
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
  var theme = anychart.getFullTheme();
  var diff = anychart.themes.merging.demerge(json, theme);
  var mapDiff = diff['map'];
  var series = mapDiff['series'];

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



  var zoomParam = newScene.zoomToBounds(featureBounds);
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
    root.dispatchEvent(this.createDrillChangeEvent());

    newScene.show();
    newScene.tooltip().hide(null);

    var zoomParam = newScene.zoomToBounds(featureBounds);
    newScene.zoomDuration = 400;
    newScene.unlimitedZoom = true;

    newScene.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR, zoomParam[1], zoomParam[2]);

    this.doAfterAnimation(newScene, function(root) {
      this.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR);
      root.drillingInAction = false;
    }, root);
  }, newScene, scene, root, featureBounds, featureProperties);
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
  source.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR);

  var levels = opt_levels || 1;

  this.doAfterAnimation(source, function(target, root) {
    var crumb = root.currentBreadcrumbsPath[root.currentBreadcrumbsPath.length - levels];
    var feature = target.getFeatureById(crumb.getId());

    var zoom, cx, cy;
    if (!feature) {
      anychart.utils.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [this.sceneId]);
      zoom = 10;
    } else {
      var domEl = feature.domElement;
      var featureBounds = domEl.getBoundsWithTransform(target.getMapLayer().getFullTransformation());
      var zoomParam = this.zoomToBounds(featureBounds);

      zoom = zoomParam[0];
      cx = zoomParam[1];
      cy = zoomParam[2];
    }

    this.unlimitedZoom = true;
    this.zoomDuration = 400;
    this.zoomTo(1 / zoom, cx, cy);

    target.tooltip().hide(null);
    this.tooltip().hide(null);

    this.doAfterAnimation(this, function(target, root) {
      this.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR);

      this.hide();
      this.unhover();
      this.enabled(false);

      root.currentScene = target;
      root.drillingInAction = false;

      goog.array.splice(root.currentBreadcrumbsPath, root.currentBreadcrumbsPath.length - levels, levels);
      root.dispatchEvent(this.createDrillChangeEvent());

      target.show();
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Zoom / move.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Current map zoom level.
 * @return {number}
 */
anychart.charts.Map.prototype.zoomLevel = function() {
  return this.fullZoom;
};


/**
 * Zooms the map to passed zoom level and coordinates.
 * @param {number} value Zoom level for zooming.
 * @param {number=} opt_cx X coord of zoom point.
 * @param {number=} opt_cy Y coord of zoom point.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomTo = function(value, opt_cx, opt_cy) {
  if (!this.unlimitedZoom)
    value = goog.math.clamp(value, anychart.charts.Map.ZOOM_MIN_FACTOR, anychart.charts.Map.ZOOM_MAX_FACTOR);
  return this.zoom(value / this.zoomLevel(), opt_cx, opt_cy);
};


/**
 * Zoom to feature for passed id.
 * @param {string} id Feature id.
 */
anychart.charts.Map.prototype.zoomToFeature = function(id) {
  var feature = this.getFeatureById(id);
  if (!feature) {
    anychart.utils.warning(anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND, null, [id]);
    return;
  }

  var domEl = feature.domElement;
  var tx = domEl.getFullTransformation();

  var goToHome = this.prevZoomedFeature && feature == this.prevZoomedFeature && this.prevTx && tx.equals(this.prevTx);

  var featureBounds;
  if (goToHome) {
    featureBounds = domEl.getBounds();
  } else {
    featureBounds = domEl.getBoundsWithTransform(tx);
  }
  var sourceZoom = tx.getScaleX();
  var zoomParam = this.zoomToBounds(featureBounds);
  var zoom = zoomParam[0];
  var cx = zoomParam[1];
  var cy = zoomParam[2];

  this.doAfterAnimation(this, function() {
    this.zoomDuration = isNaN(this.zoomDuration) ? 500 : this.zoomDuration;
    if (goToHome) {
      this.zoomTo(anychart.charts.Map.ZOOM_MIN_FACTOR, cx, cy);
      this.prevZoomedFeature = null;
      this.prevTx = null;
    } else {
      this.unlimitedZoom = true;
      if (anychart.math.roughlyEqual(sourceZoom, zoom, 0.00001)) {
        this.zoomAnimation = new anychart.animations.MapMoveAnimation(this, [this.prevTx.getTranslateX() - cx, this.prevTx.getTranslateY() - cy], [this.prevTx.getTranslateX(), this.prevTx.getTranslateY()], 500);
        this.zoomAnimation.play();
      } else {
        this.zoomTo(zoom, cx, cy);
      }
      this.prevZoomedFeature = feature;
      if (this.zoomAnimation) {
        this.zoomAnimation.listenOnce(goog.fx.Transition.EventType.END, function(e) {
          if (this.prevZoomedFeature) {
            this.prevTx = this.prevZoomedFeature.domElement.getFullTransformation().clone();
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
 * @return {Array.<number>}
 */
anychart.charts.Map.prototype.zoomToBounds = function(bounds, opt_sourceBounds) {
  var x = bounds.left + bounds.width / 2;
  var y = bounds.top + bounds.height / 2;

  var sourceBounds = goog.isDef(opt_sourceBounds) ? opt_sourceBounds : this.getPlotBounds();
  var plotBoundsCx = sourceBounds.left + sourceBounds.width / 2;
  var plotBoundsCy = sourceBounds.top + sourceBounds.height / 2;

  var widthRatio = bounds.width / sourceBounds.width;
  var heightRatio = bounds.height / sourceBounds.height;

  var cx, cy;
  var zoom = 1 / Math.max(widthRatio, heightRatio);
  if (anychart.math.roughlyEqual(zoom, 1, 0.0000001)) {
    cx = plotBoundsCx - x;
    cy = plotBoundsCy - y;
  } else {
    cx = (plotBoundsCx - zoom * x) / (1 - zoom);
    cy = (plotBoundsCy - zoom * y) / (1 - zoom);
  }
  zoom *= this.zoomLevel();

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
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomIn = function() {
  return this.zoom(this.zoomFactor_);
};


/**
 * Zoom out.
 * @return {anychart.charts.Map}
 */
anychart.charts.Map.prototype.zoomOut = function() {
  return this.zoom(1 / this.zoomFactor_);
};


/**
 * It increases map zoom on passed value.
 * @param {number} value Zoom value.
 * @param {number=} opt_cx Center X value.
 * @param {number=} opt_cy Center Y value.
 * @return {anychart.charts.Map} Returns itself for chaining.
 */
anychart.charts.Map.prototype.zoom = function(value, opt_cx, opt_cy) {
  if (goog.isDef(value)) {
    var state = 0;
    var signal = 0;

    value = anychart.utils.toNumber(value);
    if (((this.zoomLevel() == anychart.charts.Map.ZOOM_MIN_FACTOR && value < 1) ||
        (this.zoomLevel() == anychart.charts.Map.ZOOM_MAX_FACTOR && value > 1)) && !this.unlimitedZoom) {
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
  return {'x': lonLat[0], 'long': lonLat[0], 'y': lonLat[1] , 'lat': lonLat[1]};
};


/**
 * Exports map to GeoJSON format.
 * @return {Object}
 */
anychart.charts.Map.prototype.toGeoJSON = function() {
  return anychart.utils.GeoJSONParser.getInstance().exportToGeoJSON(this.internalGeoData, this.mapTX);
};


/** @inheritDoc */
anychart.charts.Map.prototype.checkIfColorRange = function(target) {
  return target instanceof anychart.core.ui.ColorRange;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Map.prototype.setupByJSON = function(config) {
  anychart.charts.Map.base(this, 'setupByJSON', config);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  this.defaultSeriesType(config['defaultSeriesType']);
  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.colorRange(config['colorRange']);
  this.unboundRegions(config['unboundRegions']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);
  this.geoIdField(config['geoIdField']);
  this.geoData(config['geoData']);
  if (goog.isDef(config['allowPointsSelect'])) {
    this.interactivity().selectionMode(
        config['allowPointsSelect'] ? anychart.enums.SelectionMode.MULTI_SELECT : anychart.enums.SelectionMode.NONE);
  }

  var i, json, scale;
  if (config['geoScale']) {
    scale = new anychart.core.map.scale.Geo();
    scale.setup(config['geoScale']);
    this.scale(scale);
  }

  var series = config['series'];
  var scales = config['colorScales'];
  var drillDownMap = config['drillDownMap'];

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
        if (goog.isObject(json)) {
          if ('colorScale' in json) seriesInst.colorScale(scalesInstances[json['colorScale']]);
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
  json['unboundRegions'] = this.unboundRegions().serialize();
  json['colorRange'] = this.colorRange().serialize();
  json['geoScale'] = this.scale().serialize();
  json['minBubbleSize'] = this.minBubbleSize();
  json['maxBubbleSize'] = this.maxBubbleSize();
  json['geoIdField'] = this.geoIdField();
  json['geoData'] = this.geoDataStringName_ ? this.geoDataStringName_ : this.geoData_;

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
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['colorScales'] = scales;

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

  if (this.container() && this.container().getStage() && this.container().getStage().container()) {
    var container = this.container().getStage().container();
    goog.events.unlisten(container, goog.events.EventType.CLICK, this.mapClickHandler_, false, this);
    goog.events.unlisten(container, goog.events.EventType.DBLCLICK, this.mapDbClickHandler_, false, this);
    goog.events.unlisten(container, goog.events.EventType.POINTERUP, this.mapTouchEndHandler_, false, this);
    goog.events.unlisten(container, goog.events.EventType.TOUCHEND, this.mapTouchEndHandler_, false, this);
    goog.events.unlisten(container, goog.events.EventType.MOUSEENTER, this.mapMouseEnterHandler_, false, this);
    goog.events.unlisten(container, goog.events.EventType.MOUSELEAVE, this.mapMouseLeaveHandler_, false, this);
  }

  if (this.mapTextarea) {
    goog.dom.removeNode(this.mapTextarea);
    delete this.mapTextarea;
  }

  anychart.charts.Map.base(this, 'disposeInternal');
};


//exports
goog.exportSymbol('anychart.charts.Map.DEFAULT_TX', anychart.charts.Map.DEFAULT_TX);
anychart.charts.Map.prototype['getType'] = anychart.charts.Map.prototype.getType;
anychart.charts.Map.prototype['geoData'] = anychart.charts.Map.prototype.geoData;
anychart.charts.Map.prototype['choropleth'] = anychart.charts.Map.prototype.choropleth;
anychart.charts.Map.prototype['bubble'] = anychart.charts.Map.prototype.bubble;
anychart.charts.Map.prototype['marker'] = anychart.charts.Map.prototype.marker;
anychart.charts.Map.prototype['connector'] = anychart.charts.Map.prototype.connector;
anychart.charts.Map.prototype['unboundRegions'] = anychart.charts.Map.prototype.unboundRegions;
anychart.charts.Map.prototype['colorRange'] = anychart.charts.Map.prototype.colorRange;
anychart.charts.Map.prototype['palette'] = anychart.charts.Map.prototype.palette;
anychart.charts.Map.prototype['markerPalette'] = anychart.charts.Map.prototype.markerPalette;
anychart.charts.Map.prototype['hatchFillPalette'] = anychart.charts.Map.prototype.hatchFillPalette;
anychart.charts.Map.prototype['getSeries'] = anychart.charts.Map.prototype.getSeries;
anychart.charts.Map.prototype['allowPointsSelect'] = anychart.charts.Map.prototype.allowPointsSelect;
anychart.charts.Map.prototype['minBubbleSize'] = anychart.charts.Map.prototype.minBubbleSize;
anychart.charts.Map.prototype['maxBubbleSize'] = anychart.charts.Map.prototype.maxBubbleSize;
anychart.charts.Map.prototype['geoIdField'] = anychart.charts.Map.prototype.geoIdField;
anychart.charts.Map.prototype['defaultSeriesType'] = anychart.charts.Map.prototype.defaultSeriesType;
anychart.charts.Map.prototype['addSeries'] = anychart.charts.Map.prototype.addSeries;
anychart.charts.Map.prototype['getSeriesAt'] = anychart.charts.Map.prototype.getSeriesAt;
anychart.charts.Map.prototype['getSeriesCount'] = anychart.charts.Map.prototype.getSeriesCount;
anychart.charts.Map.prototype['removeSeries'] = anychart.charts.Map.prototype.removeSeries;
anychart.charts.Map.prototype['removeSeriesAt'] = anychart.charts.Map.prototype.removeSeriesAt;
anychart.charts.Map.prototype['removeAllSeries'] = anychart.charts.Map.prototype.removeAllSeries;
anychart.charts.Map.prototype['getPlotBounds'] = anychart.charts.Map.prototype.getPlotBounds;

anychart.charts.Map.prototype['interactivity'] = anychart.charts.Map.prototype.interactivity;

anychart.charts.Map.prototype['toGeoJSON'] = anychart.charts.Map.prototype.toGeoJSON;
anychart.charts.Map.prototype['featureTranslation'] = anychart.charts.Map.prototype.featureTranslation;
anychart.charts.Map.prototype['translateFeature'] = anychart.charts.Map.prototype.translateFeature;
anychart.charts.Map.prototype['featureScaleFactor'] = anychart.charts.Map.prototype.featureScaleFactor;
anychart.charts.Map.prototype['featureCrs'] = anychart.charts.Map.prototype.featureCrs;
anychart.charts.Map.prototype['crs'] = anychart.charts.Map.prototype.crs;

anychart.charts.Map.prototype['zoom'] = anychart.charts.Map.prototype.zoom;
anychart.charts.Map.prototype['move'] = anychart.charts.Map.prototype.move;

anychart.charts.Map.prototype['transform'] = anychart.charts.Map.prototype.transform;
anychart.charts.Map.prototype['inverseTransform'] = anychart.charts.Map.prototype.inverseTransform;

anychart.charts.Map.prototype['zoomToFeature'] = anychart.charts.Map.prototype.zoomToFeature;
anychart.charts.Map.prototype['zoomTo'] = anychart.charts.Map.prototype.zoomTo;

anychart.charts.Map.prototype['drillTo'] = anychart.charts.Map.prototype.drillTo;
anychart.charts.Map.prototype['drillUp'] = anychart.charts.Map.prototype.drillUp;
anychart.charts.Map.prototype['drillDownMap'] = anychart.charts.Map.prototype.drillDownMap;
anychart.charts.Map.prototype['getCurrentPath'] = anychart.charts.Map.prototype.getCurrentPath;
