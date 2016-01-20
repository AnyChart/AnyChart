goog.provide('anychart.charts.Map');

goog.require('acgraph.events.MouseWheelHandler');
goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.map.geom');
goog.require('anychart.core.map.scale.Geo');
goog.require('anychart.core.map.series.Base');
goog.require('anychart.core.ui.ColorRange');
goog.require('anychart.core.utils.MapInteractivity');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.core.utils.UnboundRegionsSettings');
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
   * @private
   */
  this.internalGeoData_ = [];

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
   * Wherer animations in progress.
   * @type {boolean}
   * @private
   */
  this.zooming_ = false;

  /**
   * Array of animations timers.
   * @type {Array.<number>}
   */
  this.timers = [];

  /**
   * function for smooth zoom.
   * @type {!Function}
   * @private
   */
  this.smoothZoom_ = goog.bind(function() {
    var tx = this.mapLayer_.getSelfTransformation();

    if ((tx.getScaleX() * this.tempZoom_ > anychart.charts.Map.ZOOM_MIN_RATIO) &&
        (this.zoomDest_ > 1 ? this.zoomProgress_ <= this.zoomDest_ : this.zoomProgress_ >= this.zoomDest_)) {

      var boundsWithoutTx = this.mapLayer_.getBoundsWithoutTransform();
      var boundsWithTx = this.mapLayer_.getBounds();

      this.calcCx_ = this.cx_;
      this.calcCy_ = this.cy_;

      if (this.zoomDest_ < 1 && !boundsWithTx.contains(boundsWithoutTx)) {
        if (boundsWithTx.left >= boundsWithoutTx.left) {
          this.calcCx_ = boundsWithoutTx.left;
        } else if (boundsWithTx.getRight() <= boundsWithoutTx.getRight()) {
          this.calcCx_ = boundsWithoutTx.getRight();
        } else {
          this.calcCx_ = boundsWithoutTx.left - boundsWithTx.left > boundsWithTx.getRight() - boundsWithoutTx.getRight() ?
              boundsWithoutTx.left : boundsWithoutTx.getRight();
        }

        if (boundsWithTx.top >= boundsWithoutTx.top) {
          this.calcCy_ = boundsWithoutTx.top;
        } else if (boundsWithTx.getBottom() <= boundsWithoutTx.getBottom()) {
          this.calcCy_ = boundsWithoutTx.getBottom();
        } else {
          this.calcCy_ = boundsWithoutTx.top - boundsWithTx.top > boundsWithTx.getBottom() - boundsWithoutTx.getBottom() ?
              boundsWithoutTx.top : boundsWithoutTx.getBottom();
        }
      }

      this.mapLayer_.scale(this.tempZoom_, this.tempZoom_, this.calcCx_, this.calcCy_);

      this.zoomProgress_ *= this.tempZoom_;
      this.fullZoom_ *= this.tempZoom_;

      this.zooming_ = true;

      tx = this.mapLayer_.getSelfTransformation();
      this.scale().setMapZoom(tx.getScaleX());
      this.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);

      this.timers.push(setTimeout(this.smoothZoom_, anychart.charts.Map.ZOOM_ANIMATION_DELAY));
    } else {
      if (tx.getScaleX() * this.tempZoom_ <= anychart.charts.Map.ZOOM_MIN_RATIO && !tx.isIdentity()) {
        this.mapLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

        this.fullZoom_ = 1;
        this.stopTimers();

        this.scale().setMapZoom(1);
        this.scale().setOffsetFocusPoint(0, 0);

        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
      } else {
        this.prevTxMatrix_.preScale(this.zoomDest_, this.zoomDest_);
        this.prevTxMatrix_.preTranslate(this.calcCx_ * (1 - this.zoomDest_), this.calcCy_ * (1 - this.zoomDest_));

        this.mapLayer_.setTransformationMatrix(
            anychart.math.specialRound(this.prevTxMatrix_.getScaleX()),
            0,
            0,
            anychart.math.specialRound(this.prevTxMatrix_.getScaleY()),
            this.prevTxMatrix_.getTranslateX(),
            this.prevTxMatrix_.getTranslateY()
        );

        this.fullZoom_ = this.prevTxMatrix_.getScaleX();

        this.scale().setMapZoom(this.fullZoom_);
        this.scale().setOffsetFocusPoint(this.prevTxMatrix_.getTranslateX(), this.prevTxMatrix_.getTranslateY());

        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
      }
      this.stopTimers();

      this.zooming_ = false;
      this.goingToHome_ = false;
    }
  }, this);

  /**
   * Aaync init mouse and keyboard interactivity for cases when map have no stage on draw moment.
   * @type {!Function}
   * @private
   */
  this.initControlsInteractivity_ = goog.bind(function() {
    if (this.container().getStage() && this.container().getStage().container()) {
      var container = /** @type {Node} */(this.container().getStage().container());

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

      this.shortcutHandler.listen(goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, function(e) {
        var bounds = this.mapLayer_.getBoundsWithoutTransform();
        var cx = bounds.left + bounds.width / 2;
        var cy = bounds.top + bounds.height / 2;
        var dx = 0, dy = 0;

        var zoomRatio = 1.3;
        var zoomFactor = 1;
        switch (e.identifier) {
          case 'zoom_in':
            zoomFactor = zoomRatio;
            break;
          case 'zoom_out':
            zoomFactor = 1 / zoomRatio;
            break;
          case 'zoom_full_out':
            zoomFactor = 1 / this.fullZoom_;
            if (this.fullZoom_ != 1) {
              this.goingToHome_ = true;
              this.stopTimers();
            }
            break;
          case 'move_up':
            dx = 0;
            dy = 10 * this.fullZoom_;
            break;
          case 'move_left':
            dx = 10 * this.fullZoom_;
            dy = 0;
            break;
          case 'move_down':
            dx = 0;
            dy = -10 * this.fullZoom_;
            break;
          case 'move_right':
            dx = -10 * this.fullZoom_;
            dy = 0;
            break;
        }

        if (zoomFactor != 1)
          this.zoom(zoomFactor, cx, cy);
        if (dx || dy)
          this.move(dx, dy);
      }, false, this);


      this.mouseWheelHandler = new acgraph.events.MouseWheelHandler(/** @type {Element} */(this.container().getStage().container()));
      this.mouseWheelHandler.listen('mousewheel', function(e) {
        var bounds = this.getPlotBounds();
        var insideBounds = bounds && e.clientX >= bounds.left &&
            e.clientX <= bounds.left + bounds.width &&
            e.clientY >= bounds.top &&
            e.clientY <= bounds.top + bounds.height;

        if (this.interactivity_.mouseWheel() && insideBounds) {
          var zoomRatio = 1.3;
          var zoomFactor = e.detail <= 0 ? e.detail == 0 ? 1 : zoomRatio : 1 / zoomRatio;
          if (this.goingToHome_) zoomFactor = 1 / this.fullZoom_;

          this.prevZoomState_ = this.zoomState_;
          this.zoomState_ = zoomFactor > 1 ? true : zoomFactor == 1 ? !this.prevZoomState_ : false;

          if (this.prevZoomState_ != this.zoomState_)
            this.stopTimers();

          if (zoomFactor < 1 && anychart.math.round(this.fullZoom_, 2) == anychart.charts.Map.ZOOM_MIN_RATIO && !this.mapLayer_.getSelfTransformation().isIdentity()) {
            this.mapLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
            this.fullZoom_ = 1;
            this.goingToHome_ = false;
            this.stopTimers();

            this.scale().setMapZoom(1);
            this.scale().setOffsetFocusPoint(0, 0);

            this.invalidateSeries_();
            this.invalidate(anychart.ConsistencyState.MAP_SERIES, anychart.Signal.NEEDS_REDRAW);
          } else {
            var x = e.clientX;
            var y = e.clientY;

            this.zoom(zoomFactor, x, y);
          }
        }
      }, false, this);


      goog.events.listen(this.container().domElement(), goog.events.EventType.CLICK, function(e) {
        var bounds = this.getPixelBounds();
        var insideBounds = bounds && e.clientX >= bounds.left &&
            e.clientX <= bounds.left + bounds.width &&
            e.clientY >= bounds.top &&
            e.clientY <= bounds.top + bounds.height;

        if (insideBounds) {
          this.mapTextarea.focus();
        }
      }, false, this);


      var startX, startY, drag;
      this.rootElement.listen(goog.events.EventType.DBLCLICK, function(e) {
        var bounds = this.getPlotBounds();
        var insideBounds = bounds && e.clientX >= bounds.left &&
            e.clientX <= bounds.left + bounds.width &&
            e.clientY >= bounds.top &&
            e.clientY <= bounds.top + bounds.height;

        if (insideBounds) {
          var zoomFactor = 1.3;
          var cx = e.clientX;
          var cy = e.clientY;

          this.zoom(zoomFactor, cx, cy);
        }
      }, false, this);

      goog.events.listen(document, goog.events.EventType.MOUSEMOVE, function(e) {
        if (drag && this.interactivity_.drag() && this.fullZoom_ != 1) {
          goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.MOVE);
          this.move(e.clientX - startX, e.clientY - startY);

          startX = e.clientX;
          startY = e.clientY;
        } else {
          goog.style.setStyle(document['body'], 'cursor', '');
        }
      }, false, this);

      this.rootElement.listen(goog.events.EventType.MOUSEDOWN, function(e) {
        var bounds = this.getPlotBounds();
        var insideBounds = bounds && e.clientX >= bounds.left &&
            e.clientX <= bounds.left + bounds.width &&
            e.clientY >= bounds.top &&
            e.clientY <= bounds.top + bounds.height;

        if (insideBounds) {
          startX = e.clientX;
          startY = e.clientY;
          drag = true;
        }
      }, false, this);

      goog.events.listen(document, goog.events.EventType.MOUSEUP, function(e) {
        goog.style.setStyle(document['body'], 'cursor', '');
        drag = false;
      }, false, this);
    } else {
      setTimeout(this.initControlsInteractivity_, 100);
    }
  }, this);

  this.unboundRegions(true);
  this.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);
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
 * @type {Object}
 */
anychart.charts.Map.DEFAULT_TX = {
  'default': {
    'crs': '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
    'scale': 1
  }
};


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
anychart.charts.Map.ZOOM_MAX_RATIO = 10;


/**
 * Minimum zoom ratio.
 * @type {number}
 */
anychart.charts.Map.ZOOM_MIN_RATIO = 1;


/**
 * Delay between animation frames.
 * @type {number}
 */
anychart.charts.Map.ZOOM_ANIMATION_DELAY = 4;


/**
 * Count of animation frames per one full animation.
 * @type {number}
 */
anychart.charts.Map.ZOOM_ANIMATION_FRAMES = 5;


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
 * Full map offset focus point x coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.fullOffsetX_ = 0;


/**
 * Full map offset focus point y coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.fullOffsetY_ = 0;


/**
 * Origin x coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.cx_ = 0;


/**
 * Origin y coordinate.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.cy_ = 0;


/**
 * Zoom factor.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.zoom_ = 1;


/**
 * Full zoom.
 * @type {number}
 * @private
 */
anychart.charts.Map.prototype.fullZoom_ = 1;


/**
 * Zooming status.
 * @type {boolean}
 * @private
 */
anychart.charts.Map.prototype.zooming_ = false;


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
    this.invalidate(anychart.ConsistencyState.MAP_SCALE, anychart.Signal.NEEDS_REDRAW);
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
    this.colorRange_.setParentEventTarget(this);
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
    instance.setParentEventTarget(this);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);

    var inc = index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);

    instance.setAutoZIndex(anychart.charts.Map.ZINDEX_SERIES + inc);
    instance.labels().setAutoZIndex(anychart.charts.Map.ZINDEX_LABEL + inc + anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER / 2);

    instance.setAutoGeoIdField(this.geoIdField());
    instance.setGeoData(this, this.internalGeoData_);
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


/**
 * Getter for data bounds of the chart.
 * @return {anychart.math.Rect}
 */
anychart.charts.Map.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


/**
 * Clear map paths.
 */
anychart.charts.Map.prototype.clear = function() {
  if (this.mapLayer_) this.mapLayer_.clear();
  this.mapPaths.length = 0;
};


/**
 * Stops all animation timers. And stops animation.
 */
anychart.charts.Map.prototype.stopTimers = function() {
  for (var i = 0, len = this.timers.length; i < len; i++) {
    clearTimeout(this.timers[i]);
  }
  this.timers.length = 0;
  this.zooming_ = false;
};


/**
 * Geo data processing.
 */
anychart.charts.Map.prototype.processGeoData = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_GEO_DATA)) {
    if (goog.isDefAndNotNull(this.geoData_)) {
      if ((goog.isString(this.geoData_) && goog.string.startsWith(this.geoData_, '<')) || goog.dom.isNodeLike(this.geoData_)) {
        //todo (blackart): Here will be svg parsing. coming soon ...
      }
      var geoData = goog.isString(this.geoData_) ? goog.dom.getWindow()['anychart']['maps'][this.geoData_] : this.geoData_;
      this.internalGeoData_ = anychart.utils.GeoJSONParser.getInstance().parse(/** @type {Object} */(geoData));
      var geoIdFromGeoData = geoData['ac-geoFieldId'];
      if (geoIdFromGeoData)
        this.geoIdField(geoIdFromGeoData);

      this.mapTX = {};
      goog.object.forEach(geoData['ac-tx'] || anychart.charts.Map.DEFAULT_TX, function(value, key) {
        var tx_ = {};

        if (goog.isDef(value['crs'])) tx_.crs = value['crs'];
        if (goog.isDef(value['scale'])) tx_.scale = value['scale'];
        if (goog.isDef(value['xoffset'])) tx_.xoffset = value['xoffset'];
        if (goog.isDef(value['yoffset'])) tx_.yoffset = value['yoffset'];
        if (goog.isDef(value['heatZone'])) tx_.heatZone = anychart.math.Rect.fromJSON(value['heatZone']);

        this.mapTX[key] = tx_;
      }, this);

      if (!this.mapTX['default'])
        this.mapTX['default'] = anychart.charts.Map.DEFAULT_TX['default'];


      if (!this.dataLayer_) {
        this.dataLayer_ = this.rootElement.layer();
        this.dataLayer_.zIndex(anychart.charts.Map.ZINDEX_MAP);
      }

      if (!this.mapLayer_) {
        this.mapLayer_ = new anychart.core.utils.TypedLayer(function() {
          var path = acgraph.path();
          path.vectorEffect('non-scaling-stroke');
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
        this.mapLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.dataLayer_));

        this.mapLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

        this.initControlsInteractivity_();
      } else {
        this.clear();
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
    scale.setMapZoom(this.zoom_);
    this.scale().setOffsetFocusPoint(this.offsetX_, this.offsetY_);
    var j, len;
    for (i = 0, len = this.internalGeoData_.length; i < len; i++) {
      var geom = this.internalGeoData_[i];
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
      series.setGeoData(this, this.internalGeoData_);
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
anychart.charts.Map.prototype.drawContent = function(bounds) {
  var i, series, tx;
  var maxRatio = anychart.charts.Map.ZOOM_MAX_RATIO;
  var minRatio = anychart.charts.Map.ZOOM_MIN_RATIO;
  var boundsWithoutTx, boundsWithTx;

  this.calculate();

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

    if (this.dataLayer_)
      this.dataLayer_.clip(contentAreaBounds);

    this.clear();

    var j, len;
    for (i = 0, len = this.internalGeoData_.length; i < len; i++) {
      var geom = this.internalGeoData_[i];
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
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_ZOOM)) {
    if (!((this.fullZoom_ == minRatio && this.zoom_ * this.fullZoom_ < minRatio) ||
        (this.fullZoom_ == maxRatio && this.fullZoom_ * this.zoom_ > maxRatio)) && this.mapLayer_) {

      boundsWithoutTx = this.mapLayer_.getBoundsWithoutTransform();
      boundsWithTx = this.mapLayer_.getBounds();

      if (isNaN(this.cx_) || isNaN(this.cy_)) {
        var defaultCx = boundsWithoutTx.left + boundsWithoutTx.width / 2;
        var defaultCy = boundsWithoutTx.top + boundsWithoutTx.height / 2;

        if (isNaN(this.cx_)) this.cx_ = defaultCx;
        if (isNaN(this.cy_)) this.cy_ = defaultCy;
      }

      var minSide = Math.min(boundsWithoutTx.width, boundsWithoutTx.height);

      if (minSide * this.fullZoom_ * this.zoom_ / minSide > maxRatio)
        this.zoom_ = maxRatio / this.fullZoom_;

      if (this.fullZoom_ * this.zoom_ < minRatio)
        this.zoom_ = minRatio / this.fullZoom_;

      if (this.zooming_)
        this.stopTimers();

      if (this.zoom_ != 1) {
        this.prevTxMatrix_ = this.mapLayer_.getSelfTransformation().clone();
        this.tempZoom_ = Math.pow(this.zoom_, 1 / anychart.charts.Map.ZOOM_ANIMATION_FRAMES);
        this.zoomProgress_ = this.tempZoom_;
        this.zoomDest_ = this.zoom_;

        this.smoothZoom_();
      }
      this.zoom_ = 1;
    }
    this.markConsistent(anychart.ConsistencyState.MAP_ZOOM);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MAP_MOVE)) {
    this.scale().setOffsetFocusPoint(this.offsetX_, this.offsetY_);

    if (this.fullZoom_ != minRatio && this.mapLayer_) {
      boundsWithoutTx = this.mapLayer_.getBoundsWithoutTransform();
      boundsWithTx = this.mapLayer_.getBounds();

      var dx, dy;

      if (boundsWithTx.left + this.offsetX_ >= boundsWithoutTx.left) {
        dx = boundsWithoutTx.left - boundsWithTx.left;
      } else if (boundsWithTx.getRight() + this.offsetX_ <= boundsWithoutTx.getRight()) {
        dx = boundsWithoutTx.getRight() - boundsWithTx.getRight();
      } else {
        dx = this.offsetX_;
      }

      if (boundsWithTx.top + this.offsetY_ >= boundsWithoutTx.top) {
        dy = boundsWithoutTx.top - boundsWithTx.top;
      } else if (boundsWithTx.getBottom() + this.offsetY_ <= boundsWithoutTx.getBottom()) {
        dy = boundsWithoutTx.getBottom() - boundsWithTx.getBottom();
      } else {
        dy = this.offsetY_;
      }

      dx = dx / this.fullZoom_;
      dy = dy / this.fullZoom_;

      //this.fullOffsetX_ += this.offsetX_;
      //this.fullOffsetY_ += this.offsetY_;

      this.offsetX_ = 0;
      this.offsetY_ = 0;

      if (dx || dy) {
        this.mapLayer_.appendTransformationMatrix(1, 0, 0, 1, dx, dy);

        tx = this.mapLayer_.getSelfTransformation();
        this.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.MAP_SERIES);
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
  index = goog.isArray(index) && index.length ? index[0] : index;
  if (this.colorRange_ && this.colorRange_.target()) {
    var target = this.colorRange_.target();
    if (target == series) {
      var iterator = target.getIterator();
      iterator.select(index);
      var value = iterator.get(target.referenceValueNames[1]);
      this.colorRange_.showMarker(value);
    }
  }
};


/** @inheritDoc */
anychart.charts.Map.prototype.doAdditionActionsOnMouseOut = function() {
  if (this.colorRange_ && this.colorRange_.enabled()) {
    this.colorRange_.hideMarker();
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
 * @private
 */
anychart.charts.Map.prototype.getFeatureById_ = function(id) {
  for (var i = 0, len = this.internalGeoData_.length; i < len; i++) {
    var feature_ = this.internalGeoData_[i];
    if (feature_['properties'][this.geoIdField_] == id) {
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
  var feature = this.getFeatureById_(id);
  var bounds, latLon, current_tx, featureTx;
  if (feature) {
    bounds = feature.domElement.getBoundsWithoutTransform();
    latLon = this.scale().inverseTransform(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    current_tx = this.scale().pickTx(latLon[0], latLon[1]);
    featureTx = current_tx == this.mapTX['default'] ? (this.mapTX[id] = {}) : current_tx;

    dx = dx / this.fullZoom_;
    dy = dy / this.fullZoom_;

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
  var feature = this.getFeatureById_(id);
  var bounds, latLon, current_tx, featureTx;
  if (feature) {
    bounds = feature.domElement.getBoundsWithoutTransform();
    latLon = this.scale().inverseTransform(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
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

      opt_dx = opt_dx / this.fullZoom_;
      opt_dy = opt_dy / this.fullZoom_;

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
  var feature = this.getFeatureById_(id);
  var scale, bounds, latLon, current_tx, featureTx;
  if (feature) {
    scale = this.scale();
    bounds = feature.domElement.getBounds();
    latLon = scale.inverseTransform(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
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

  return feature ? featureTx.scale || 1 : NaN;
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
  var latLon = scale.inverseTransform(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
  var current_tx = scale.pickTx(latLon[0], latLon[1]);

  if (!goog.isDef(opt_crs)) {
    return current_tx.crs;
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
  var feature = this.getFeatureById_(id);
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
    for (var i = 0, len = this.internalGeoData_.length; i < len; i++) {
      this.featureCrs_(this.internalGeoData_[i], opt_value);
    }
    this.mapTX['default'].crs = opt_value;
    return this;
  }
  return this.mapTX['default'].crs;
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
    if ((this.fullZoom_ == anychart.charts.Map.ZOOM_MIN_RATIO && value < 1) ||
        (this.fullZoom_ == anychart.charts.Map.ZOOM_MAX_RATIO && value > 1)) {
      return this;
    }

    if (value != 1) {
      this.zoom_ = value;
      state = anychart.ConsistencyState.MAP_ZOOM;
      signal = anychart.Signal.NEEDS_REDRAW;
    }

    opt_cx = anychart.utils.toNumber(opt_cx);
    opt_cy = anychart.utils.toNumber(opt_cy);

    if (this.cx_ != opt_cx || this.cy_ != opt_cy) {
      this.cx_ = opt_cx;
      this.cy_ = opt_cy;
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
        this.offsetX_ = dx;

        state = anychart.ConsistencyState.MAP_MOVE;
        signal = anychart.Signal.NEEDS_REDRAW;
      }
    }

    if (goog.isDef(dy)) {
      dy = anychart.utils.toNumber(dy);
      if (!isNaN(dy)) {
        this.offsetY_ = dy;

        state = anychart.ConsistencyState.MAP_MOVE;
        signal = anychart.Signal.NEEDS_REDRAW;
      }
    }

    this.invalidate(state, signal);
  }

  return this;
};


/**
 * Exports map to GeoJSON format.
 * @return {Object}
 */
anychart.charts.Map.prototype.toGeoJSON = function() {
  return anychart.utils.GeoJSONParser.getInstance().exportToGeoJSON(this.internalGeoData_, this.mapTX);
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

  return {'map': json};
};


/** @inheritDoc */
anychart.charts.Map.prototype.disposeInternal = function() {
  goog.dispose(this.shortcutHandler);
  this.shortcutHandler = null;

  goog.dispose(this.mouseWheelHandler);
  this.mouseWheelHandler = null;

  if (this.mapTextarea) {
    goog.dom.removeNode(this.mapTextarea);
    this.mapTextarea = null;
  }

  anychart.charts.Map.base(this, 'disposeInternal');
};


//exports
goog.exportSymbol('anychart.charts.Map.DEFAULT_TX', anychart.charts.Map.DEFAULT_TX);
anychart.charts.Map.prototype['getType'] = anychart.charts.Map.prototype.getType;
anychart.charts.Map.prototype['geoData'] = anychart.charts.Map.prototype.geoData;
anychart.charts.Map.prototype['choropleth'] = anychart.charts.Map.prototype.choropleth;
anychart.charts.Map.prototype['bubble'] = anychart.charts.Map.prototype.bubble;
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
