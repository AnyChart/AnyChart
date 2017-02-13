goog.provide('anychart.core.ui.MarkersFactory');
goog.provide('anychart.core.ui.MarkersFactory.Marker');
goog.require('acgraph.math');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.math.Coordinate');



/**
 * Multiple markers class.<br/>
 * Multiple markers are the set of markers with a common settings, such as type (predefined or
 * custom), size, fill and position:
 * <ul>
 *   <li>{@link anychart.core.ui.MarkersFactory#anchor}</li>
 *   <li>{@link anychart.core.ui.MarkersFactory#position}</li>
 *   <li>{@link anychart.core.ui.MarkersFactory#offsetX} and {@link anychart.core.ui.MarkersFactory#offsetY}</li>
 * </ul>
 * Also you can access any marker from the set and change it:
 * @example <t>simple-h100</t>
 * var MMarker = anychart.ui.markersFactory()
 *     .type('star5')
 *     .size(27)
 *     .fill('blue')
 *     .anchor('leftTop')
 *     .stroke('1px #000')
 *     .container(stage);
 *  MMarker.draw({x: 100, y: 30});
 *  MMarker.draw({x: 200, y: 50});
 * @param {boolean=} opt_isNonInteractive
 * @param {boolean=} opt_crispEdges
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.MarkersFactory = function(opt_isNonInteractive, opt_crispEdges) {
  this.suspendSignalsDispatching();
  anychart.core.ui.MarkersFactory.base(this, 'constructor');


  /**
   * If the markers factory should try to draw markers crisply by passing an additional param to the drawers.
   * @type {boolean}
   */
  this.crispEdges = !!opt_crispEdges;

  /**
   * If the markers factory is allowed to listen and intercept events.
   * @type {boolean}
   */
  this.isInteractive = !opt_isNonInteractive;

  /**
   * Elements pool.
   * @type {Array.<anychart.core.ui.MarkersFactory.Marker>}
   * @private
   */
  this.freeToUseMarkersPool_;

  /**
   * Element for measurement.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.measureMarkerElement_;

  /**
   * Markers layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Type of marker.
   * @type {(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.type_;

  /**
   * Marker size.
   * @type {number}
   * @private
   */
  this.size_;

  /**
   * Marker fill settings.
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Marker stroke settings.
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Marker anchor settings.
   * @type {?(anychart.enums.Anchor|string)}
   * @private
   */
  this.anchor_;

  /**
   * Marker position settings.
   * @type {anychart.enums.Position|string}
   * @private
   */
  this.position_;

  /**
   * Offset by X coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Enabled state.
   * @type {?boolean}
   * @private
   */
  this.enabledState_ = null;

  /**
   * Marker position formatter function.
   * @type {Function}
   * @private
   */
  this.positionFormatter_;

  /**
   * Markers array.
   * @type {Array.<anychart.core.ui.MarkersFactory.Marker>}
   * @private
   */
  this.markers_;

  /**
   * Changed settings.
   * @type {Object}
   */
  this.changedSettings = {};

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(true);
};
goog.inherits(anychart.core.ui.MarkersFactory, anychart.core.VisualBase);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.MarkersFactory.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.MarkersFactory.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MARKERS_FACTORY_HANDLERS;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.core.ui.MarkersFactory.HANDLED_EVENT_TYPES_ = {
  /** Click */
  'click': 0x01,

  /** Double click */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over */
  'mouseover': 0x10,

  /** Moise out */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Fires on touch start */
  'touchstart': 0x80,

  /** Fires on touch move */
  'touchmove': 0x100,

  /** Fires on touch end */
  'touchend': 0x200,

  /** Fires on touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Fires on tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.core.ui.MarkersFactory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.MarkersFactory|boolean|null} .
 */
anychart.core.ui.MarkersFactory.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(this.enabledState_) && !!opt_value) {
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
    }
    this.enabledState_ = opt_value;
    if (!goog.isNull(opt_value)) {
      anychart.core.ui.MarkersFactory.base(this, 'enabled', /** @type {boolean} */(opt_value));
    } else {
      anychart.core.ui.MarkersFactory.base(this, 'enabled', true);
    }
    return this;
  }
  return this.enabledState_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for positionFormatter.
 * @param {Function=} opt_value .
 * @return {Function|anychart.core.ui.MarkersFactory} .
 */
anychart.core.ui.MarkersFactory.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.positionFormatter_ = opt_value;
    this.changedSettings['positionFormatter'] = true;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Getter/setter for position.
 * @param {string=} opt_value Markers position settings.
 * @return {anychart.core.ui.MarkersFactory|string} Markers position settings or itself for method chaining.
 */
anychart.core.ui.MarkersFactory.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.changedSettings['position'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Getter/setter for anchor.
 * @param {(anychart.enums.Anchor|string|null)=} opt_value .
 * @return {!anychart.core.ui.MarkersFactory|anychart.enums.Anchor|string|null} .
 */
anychart.core.ui.MarkersFactory.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.enums.normalizeAnchor(opt_value);
    if (this.anchor_ !== opt_value) {
      this.anchor_ = opt_value;
      this.changedSettings['anchor'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Sets rotation angle around an anchor.
 * ({@link acgraph.vector.Element}).
 * @param {number=} opt_value Rotation angle in degrees.
 * @return {number|anychart.core.ui.MarkersFactory} Rotation angle in degrees or Itself for chaining call.
 */
anychart.core.ui.MarkersFactory.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.rotation_ != opt_value) {
      this.rotation_ = opt_value;
      this.changedSettings['rotation'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.rotation_;
  }
};


/**
 * Getter/setter for type.
 * @param {(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.core.ui.MarkersFactory|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.core.ui.MarkersFactory.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!goog.isFunction(opt_value))
      opt_value = anychart.enums.normalizeMarkerType(opt_value);

    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.changedSettings['type'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.type_ || this.autoType_ || anychart.enums.MarkerType.DIAGONAL_CROSS;
  }
};


/**
 * Getter for current type value.
 * @return {?(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)} .
 */
anychart.core.ui.MarkersFactory.prototype.getType = function() {
  return this.type_;
};


/**
 * Sets markers type that parent series have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the series.
 */
anychart.core.ui.MarkersFactory.prototype.setAutoType = function(value) {
  this.autoType_ = value;
};


/**
 * Getter/setter for size.
 * @param {number=} opt_value .
 * @return {anychart.core.ui.MarkersFactory|number} .
 */
anychart.core.ui.MarkersFactory.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.changedSettings['size'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Getter/setter for offsetX.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.MarkersFactory} .
 */
anychart.core.ui.MarkersFactory.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.changedSettings['offsetX'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter/setter for offsetY.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.MarkersFactory} .
 */
anychart.core.ui.MarkersFactory.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.changedSettings['offsetY'] = true;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.core.ui.MarkersFactory} .
 */
anychart.core.ui.MarkersFactory.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.fill_ != color) {
      this.fill_ = color;
      this.changedSettings['fill'] = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_ || this.autoFill_ || 'black';
  }
};


/**
 * Getter for current fill value.
 * @return {?(string|acgraph.vector.Fill)} .
 */
anychart.core.ui.MarkersFactory.prototype.getFill = function() {
  return this.fill_;
};


/**
 * Sets markers fill that parent series have set for it.
 * @param {acgraph.vector.Fill} value Auto fill distributed by the series.
 */
anychart.core.ui.MarkersFactory.prototype.setAutoFill = function(value) {
  this.autoFill_ = value;
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.core.ui.MarkersFactory} .
 */
anychart.core.ui.MarkersFactory.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != color) {
      this.stroke_ = color;
      this.changedSettings['stroke'] = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_ || this.autoStroke_ || 'none';
  }
};


/**
 * Getter for current stroke value.
 * @return {?(string|acgraph.vector.Stroke)} .
 */
anychart.core.ui.MarkersFactory.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * Sets markers stroke that parent series have set for it.
 * @param {acgraph.vector.Stroke} value Auto stroke distributed by the series.
 */
anychart.core.ui.MarkersFactory.prototype.setAutoStroke = function(value) {
  this.autoStroke_ = value;
};


/**
 * Specifies under what circumstances a given graphics element can be the target element for a pointer event.
 * @param {boolean=} opt_value Pointer events property value.
 * @return {anychart.core.ui.MarkersFactory|boolean} If opt_value defined then returns Element object for chaining else
 * pointer events property value.
 */
anychart.core.ui.MarkersFactory.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.disablePointerEvents_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.disablePointerEvents_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Measure.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculates bounds for the current marker, they can be used, for example, to check overlap.
 * @param {*} positionProvider Object with information about marker with current index,
 *  it must contain <b>x</b> and <b>y</b> fields (with no offsets taken in account).
 *  You can add any custom information of needed.
 * @return {anychart.math.Rect} Markers bounds.
 */
anychart.core.ui.MarkersFactory.prototype.measure = function(positionProvider) {
  var parentWidth, parentHeight, drawer;

  if (!this.measureMarkerElement_) this.measureMarkerElement_ = acgraph.path();

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var type = this.type();
  var size = /** @type {number} */(this.size());
  var anchor = /** @type {anychart.enums.Anchor} */(anychart.enums.normalizeAnchor(this.anchor()));
  var offsetX = /** @type {number} */(this.offsetX());
  var offsetY = /** @type {number} */(this.offsetY());

  drawer = goog.isString(type) ?
      anychart.utils.getMarkerDrawer(type) :
      type;

  this.measureMarkerElement_.clear();
  drawer.call(this, this.measureMarkerElement_, 0, 0, size);

  var markerBounds = /** @type {anychart.math.Rect} */(this.measureMarkerElement_.getBounds());
  var formattedPosition = goog.object.clone(this.positionFormatter_.call(positionProvider, positionProvider));
  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, markerBounds.width, markerBounds.height),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNorm = goog.isDef(this.offsetX_) ? anychart.utils.normalizeSize(offsetX, parentWidth) : 0;
  var offsetYNorm = goog.isDef(this.offsetY_) ? anychart.utils.normalizeSize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

  markerBounds.left = position.x;
  markerBounds.top = position.y;

  return markerBounds;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Clears an array of markers.
 * @param {number=} opt_index If set, removes only the marker that is in passed index.
 * @return {anychart.core.ui.MarkersFactory} Returns self for chaining.
 */
anychart.core.ui.MarkersFactory.prototype.clear = function(opt_index) {
  if (!this.freeToUseMarkersPool_)
    this.freeToUseMarkersPool_ = [];

  if (this.markers_ && this.markers_.length) {
    if (goog.isDef(opt_index)) {
      if (this.markers_[opt_index]) {
        this.markers_[opt_index].clear();
        this.freeToUseMarkersPool_.push(this.markers_[opt_index]);
        delete this.markers_[opt_index];
      }
    } else {
      for (var i = this.markers_.length; i--;) {
        var marker = this.markers_[i];
        if (marker) {
          marker.clear();
          this.freeToUseMarkersPool_.push(marker);
        }
      }
      this.markers_.length = 0;
    }
    this.invalidate(anychart.ConsistencyState.MARKERS_FACTORY_HANDLERS, anychart.Signal.NEEDS_REDRAW);
  } else
    this.markers_ = [];
  return this;
};


/**
 * Returns a marker by index, if there is a marker with such index.
 * @param {number} index Marker index.
 * @return {anychart.core.ui.MarkersFactory.Marker|undefined} Already existing label.
 */
anychart.core.ui.MarkersFactory.prototype.getMarker = function(index) {
  index = +index;
  return this.markers_ && this.markers_[index] ? this.markers_[index] : null;
};


/**
 * Returns object with changed states.
 * @return {Object}
 */
anychart.core.ui.MarkersFactory.prototype.getSettingsChangedStatesObj = function() {
  return this.changedSettings;
};


/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.MarkersFactory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Adds new marker and adds it to a set taking positionProvider into account.<br/>
 * @param {*} positionProvider Object with position settings,
 *  it must contain <b>x</b> and <b>y</b> without offsets.
 *  Can contain any additional info, if needed.
 * @param {number=} opt_index Marker index.
 * @return {!anychart.core.ui.MarkersFactory.Marker} Returns a new marker.
 */
anychart.core.ui.MarkersFactory.prototype.add = function(positionProvider, opt_index) {
  var marker, index;
  if (!goog.isDef(this.markers_)) this.markers_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    marker = this.markers_[index];
  }

  if (marker) {
    marker.clear();
  } else {
    marker = this.freeToUseMarkersPool_ && this.freeToUseMarkersPool_.length > 0 ?
        this.freeToUseMarkersPool_.pop() :
        this.createMarker();

    if (goog.isDef(index)) {
      this.markers_[index] = marker;
      marker.setIndex(index);
    } else {
      this.markers_.push(marker);
      marker.setIndex(this.markers_.length - 1);
    }
  }

  marker.positionProvider(positionProvider);
  marker.parentMarkersFactory(this);

  return marker;
};


/**
 * @return {anychart.core.ui.MarkersFactory.Marker}
 * @protected
 */
anychart.core.ui.MarkersFactory.prototype.createMarker = function() {
  return new anychart.core.ui.MarkersFactory.Marker();
};


/**
 * Markers drawing.
 * @return {anychart.core.ui.MarkersFactory} Returns self for method chaining.
 */
anychart.core.ui.MarkersFactory.prototype.draw = function() {
  if (this.isDisposed()) return this;
  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    if (this.isInteractive)
      this.bindHandlersToGraphics(this.layer_);
    this.registerDisposable(this.layer_);
  }
  this.layer_.disablePointerEvents(/** @type {boolean} */(this.disablePointerEvents()));

  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.markers_) {
    goog.array.forEach(this.markers_, function(marker, index) {
      if (marker) {
        marker.container(this.layer_);
        marker.draw();
      }
    }, this);

  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.remove = function() {
  if (this.layer_) this.layer_.remove();
};


/**
 * Gets markers factory root layer;
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.MarkersFactory.prototype.getRootLayer = function() {
  return this.layer_;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.serialize = function() {
  var json = anychart.core.ui.MarkersFactory.base(this, 'serialize');
  if (goog.isNull(json['enabled'])) delete json['enabled'];
  if (goog.isDef(this.disablePointerEvents())) json['disablePointerEvents'] = this.disablePointerEvents();
  if (this.changedSettings['position']) json['position'] = this.position();
  if (this.changedSettings['anchor']) json['anchor'] = this.anchor();
  if (this.changedSettings['offsetX']) json['offsetX'] = this.offsetX();
  if (this.changedSettings['offsetY']) json['offsetY'] = this.offsetY();
  if (this.changedSettings['type']) json['type'] = this.type();
  if (this.changedSettings['rotation']) json['rotation'] = isNaN(this.rotation()) ? null : this.rotation();
  if (goog.isDef(this.size())) json['size'] = this.size();
  if (this.changedSettings['fill'] && goog.isDef(this.fill_))
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill_));
  if (this.changedSettings['stroke'] && goog.isDef(this.stroke_))
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke_));
  return json;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.setupSpecial = function() {
  var arg0 = arguments[0];
  if (goog.isString(arg0)) {
    this.type(arg0);
    this.enabled(true);
    return true;
  }
  return anychart.core.VisualBase.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.MarkersFactory.base(this, 'setupByJSON', config, opt_default);
  this.disablePointerEvents(config['disablePointerEvents']);
  this.position(config['position']);
  this.rotation(config['rotation']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.type(config['type']);
  this.size(config['size']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.positionFormatter(config['positionFormatter']);
  this.enabled('enabled' in config ? config['enabled'] : enabledState);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.disposeInternal = function() {
  goog.disposeAll(this.markers_, this.freeToUseMarkersPool_, this.layer_);

  this.markers_ = null;
  this.freeToUseMarkersPool_ = null;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.ui.MarkersFactory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (target instanceof acgraph.vector.Element) {
    tag = target.tag;
    if (tag instanceof anychart.core.VisualBase || !anychart.utils.isNaN(tag))
      break;
    target = target.parent();
  }
  res['markerIndex'] = anychart.utils.toNumber(tag);
  return res;
};



/**
 *
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.MarkersFactory.Marker = function() {
  anychart.core.ui.MarkersFactory.Marker.base(this, 'constructor');

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * @type {acgraph.vector.Element}
   * @private
   */
  this.markerElement_;

  /**
   *
   * @type {Object.<string, *>}
   */
  this.settingsObj = {};

  this.resetSettings();
};
goog.inherits(anychart.core.ui.MarkersFactory.Marker, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Returns marker DOM element.
 * @return {acgraph.vector.Element}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.getDomElement = function() {
  return this.markerElement_;
};


/**
 * Gets/sets parent MarkersFactory.
 * @param {!anychart.core.ui.MarkersFactory=} opt_value Markers factory.
 * @return {anychart.core.ui.MarkersFactory|anychart.core.ui.MarkersFactory.Marker} Returns MarkersFactory
 * or self for method chaining.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.parentMarkersFactory = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.parentMarkersFactory_ != opt_value) {
      this.parentMarkersFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.parentMarkersFactory_;
  }
};


/**
 * Gets/sets current MarkersFactory to get settings from.
 * @param {anychart.core.ui.MarkersFactory=} opt_value Markes factory.
 * @return {anychart.core.ui.MarkersFactory|anychart.core.ui.MarkersFactory.Marker} Returns MarkersFactory
 * or self for method chaining.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.currentMarkersFactory = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.currentMarkersFactory_ != opt_value) {
      this.currentMarkersFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.currentMarkersFactory_;
  }
};


/**
 * Returns markers index.
 * @return {number}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets markers index.
 * @param {number} index Index to set.
 * @return {anychart.core.ui.MarkersFactory.Marker}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


/**
 * Gets/Sets position formatter.
 * @param {*=} opt_value Position formatter.
 * @return {*} Position formatter or self for chaining.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['positionFormatter'] != opt_value) {
      this.settingsObj['positionFormatter'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj['positionFormatter'];
  }
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or self for chaining.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
};


/**
 * Getter for current position settings of all markers.
 * @param {(anychart.enums.Position|string)=} opt_value Markers position settings.
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.enums.Position|string} Markers position
 * settings or self for chaining call.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.settingsObj['position'] != opt_value) {
      this.settingsObj['position'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {string} */(this.settingsObj['position']);
  }
};


/**
 * Getter for anchor settings of all markers.
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!(anychart.core.ui.MarkersFactory.Marker|anychart.enums.Anchor|string)} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.enums.normalizeAnchor(opt_value);
    if (this.settingsObj['anchor'] !== opt_value) {
      this.settingsObj['anchor'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {string} */(this.settingsObj['anchor']);
  }
};


/**
 * Rotates a marker around an anchor.
 * ({@link acgraph.vector.Element}). Method resets transformation and applies a new one.
 * @param {number=} opt_value Rotation angle in degrees.
 * @return {number|anychart.core.ui.MarkersFactory.Marker} Rotation angle in degrees or self for chaining call.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.settingsObj['rotation'] !== opt_value) {
      this.settingsObj['rotation'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return /** @type {number} */(this.settingsObj['rotation']);
  }
};


/**
 * Getter for current type settings of all markers.
 * @param {(anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.core.ui.MarkersFactory.Marker|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['type'] != opt_value) {
      this.settingsObj['type'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {string|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} */(this.settingsObj['type']);
  }
};


/**
 * Getter for current size settings of all markers.
 * @param {number=} opt_value .
 * @return {anychart.core.ui.MarkersFactory.Marker|number} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['size'] != opt_value) {
      this.settingsObj['size'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {number} */(this.settingsObj['size']);
  }
};


/**
 * Getter for current offsetX settings of all markers.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['offsetX'] != opt_value) {
      this.settingsObj['offsetX'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {number} */(this.settingsObj['offsetX']);
  }
};


/**
 * Getter for current offsetY settings of all markers.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['offsetY'] != opt_value) {
      this.settingsObj['offsetY'] = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {number} */(this.settingsObj['offsetY']);
  }
};


/**
 * Getter for current fill settings of all markers.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.settingsObj['fill'] != color) {
      this.settingsObj['fill'] = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {acgraph.vector.Fill} */(this.settingsObj['fill']);
  }
};


/**
 * Getter for current stroke settings of all markers.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. Defaults to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {acgraph.vector.Stroke|string|anychart.core.ui.MarkersFactory.Marker} .
 */
anychart.core.ui.MarkersFactory.Marker.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.settingsObj['stroke'] != color) {
      this.settingsObj['stroke'] = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {acgraph.vector.Stroke} */(this.settingsObj['stroke']);
  }
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj['enabled'] != opt_value) {
      this.settingsObj['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** @type {boolean} */(this.settingsObj['enabled']);
  }
};


/**
 * Resets marker to the initial state, but leaves DOM elements intact, but without the parent.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.clear = function() {
  this.resetSettings();
  if (this.markerElement_) {
    this.markerElement_.parent(null);
    this.markerElement_.removeAllListeners();
  }
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Reset settings.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.resetSettings = function() {
  if (this.settingsObj['padding']) {
    goog.dispose(this.settingsObj['padding']);
  }
  this.settingsObj = {};
  this.superSettingsObj = {};
};


/**
 * Sets settings.
 * @param {Object=} opt_settings1 Settings1.
 * @param {Object=} opt_settings2 Settings2.
 * @return {!anychart.core.ui.MarkersFactory.Marker} Returns self for chaining.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.setSettings = function(opt_settings1, opt_settings2) {
  if (goog.isDef(opt_settings1)) {
    this.setup(opt_settings1);
  }
  if (goog.isDef(opt_settings2)) this.superSettingsObj = opt_settings2;

  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
      anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Merge settings.
 * @param {*} pointSettings Custom settings from a point.
 * @param {*} pointSuperSettings Custom settings from a point (hover usually).
 * @param {*} factorySettings Settings from the parent factory.
 * @param {*} factorySuperSettings Settings from the current factory.
 * @param {boolean} isFactorySettingsChanged
 * @return {*} Final settings.
 * @private
 */
anychart.core.ui.MarkersFactory.Marker.prototype.getFinalSettings_ = function(
    pointSettings,
    pointSuperSettings,
    factorySettings,
    factorySuperSettings,
    isFactorySettingsChanged) {

  var notSelfSettings = this.currentMarkersFactory() && this.parentMarkersFactory() != this.currentMarkersFactory();

  return notSelfSettings ?
      goog.isDef(pointSuperSettings) ?
          pointSuperSettings :
          isFactorySettingsChanged ?
              factorySuperSettings :
              goog.isDef(pointSettings) ?
                  pointSettings :
                  factorySettings :
      goog.isDef(pointSettings) ?
          pointSettings :
          factorySettings;
};


/**
 * Returns final value of settings with passed name.
 * @param {string} value Name of settings.
 * @return {*} settings value.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.getFinalSettings = function(value) {
  var parentMarkersFactory = this.parentMarkersFactory();
  var currentMarkersFactory = this.currentMarkersFactory() ? this.currentMarkersFactory() : parentMarkersFactory;
  var isSingleMarker = !(parentMarkersFactory && currentMarkersFactory);
  var settingsChangedStates;
  var notSelfSettings = currentMarkersFactory != parentMarkersFactory;
  if (notSelfSettings)
    settingsChangedStates = currentMarkersFactory.getSettingsChangedStatesObj();

  var result;
  if (value == 'enabled') {
    result = this.getFinalSettings_(
        this.enabled(),
        this.superSettingsObj['enabled'],
        !isSingleMarker && parentMarkersFactory.enabled(),
        !isSingleMarker && currentMarkersFactory.enabled(),
        !goog.isNull(isSingleMarker ? null : currentMarkersFactory.enabled()));
  } else {
    result = this.getFinalSettings_(
        this[value](),
        this.superSettingsObj[value],
        isSingleMarker ? undefined : parentMarkersFactory[value](),
        isSingleMarker ? undefined : currentMarkersFactory[value](),
        !!(settingsChangedStates && settingsChangedStates[value]));
  }
  return result;
};


/**
 * Marker drawing.
 * @return {anychart.core.ui.MarkersFactory.Marker}
 */
anychart.core.ui.MarkersFactory.Marker.prototype.draw = function() {
  if (this.isDisposed()) return this;
  var parentMarkersFactory = this.parentMarkersFactory();
  var currentMarkersFactory = this.currentMarkersFactory() ? this.currentMarkersFactory() : parentMarkersFactory;
  var isSingleMarker = !(parentMarkersFactory && currentMarkersFactory);
  var settingsChangedStates;
  var notSelfSettings = currentMarkersFactory != parentMarkersFactory;
  if (notSelfSettings)
    settingsChangedStates = currentMarkersFactory.getSettingsChangedStatesObj();
  if (!this.markerElement_) this.markerElement_ = acgraph.path();

  var enabled = this.getFinalSettings_(
      this.enabled(),
      this.superSettingsObj['enabled'],
      !isSingleMarker && parentMarkersFactory.enabled(),
      !isSingleMarker && currentMarkersFactory.enabled(),
      !goog.isNull(isSingleMarker ? null : currentMarkersFactory.enabled()));

  if (goog.isNull(enabled)) enabled = true;

  if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED) ||
      !isSingleMarker && currentMarkersFactory.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      this.markerElement_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ALL);
      return this;
    } else {
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER) ||
      !isSingleMarker && currentMarkersFactory.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (enabled) {
      if (!isSingleMarker && parentMarkersFactory.getDomElement()) {
        if (!this.container()) this.container(/** @type {acgraph.vector.ILayer} */(parentMarkersFactory.getDomElement()));
        if (!this.container().parent()) {
          this.container().parent(/** @type {acgraph.vector.ILayer} */(parentMarkersFactory.container()));
        }
      }
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX) ||
      !isSingleMarker && currentMarkersFactory.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.container() && !isSingleMarker) this.container().zIndex(/** @type {number} */(parentMarkersFactory.zIndex()));
    this.markerElement_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE) ||
      !isSingleMarker && currentMarkersFactory.hasInvalidationState(anychart.ConsistencyState.APPEARANCE) ||
      !isSingleMarker && currentMarkersFactory.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {

    var settingsFields = ['anchor', 'type', 'size', 'offsetY', 'offsetX', 'fill', 'stroke', 'positionFormatter', 'rotation'];
    var settings = {};

    if (isSingleMarker)
      this.applyDefaultsForSingle_();

    for (var i = 0, len = settingsFields.length; i < len; i++) {
      var field = settingsFields[i];
      settings[field] = this.getFinalSettings_(
          this[field](),
          this.superSettingsObj[field],
          isSingleMarker ? undefined : parentMarkersFactory[field](),
          isSingleMarker ? undefined : currentMarkersFactory[field](),
          !!(settingsChangedStates && settingsChangedStates[field]));

    }

    var drawer = goog.isString(settings['type']) ?
        anychart.utils.getMarkerDrawer(settings['type']) :
        settings['type'];

    //define parent bounds
    var parentWidth, parentHeight;
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    if (parentBounds) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    }

    this.markerElement_.clear();

    var anchor = /** @type {anychart.enums.Anchor} */(anychart.enums.normalizeAnchor(settings['anchor']));

    var strokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(settings['stroke']));
    if (this.parentMarkersFactory_ && this.parentMarkersFactory_.crispEdges)
      drawer.call(this, this.markerElement_, 0, 0, settings['size'], strokeThickness);
    else
      drawer.call(this, this.markerElement_, 0, 0, settings['size']);
    var markerBounds = this.markerElement_.getBoundsWithoutTransform();

    var positionProvider = this.positionProvider();
    var formattedPosition = goog.object.clone(settings['positionFormatter'].call(positionProvider, positionProvider));
    var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(new anychart.math.Rect(0, 0, markerBounds.width, markerBounds.height), anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetXNorm = goog.isDef(settings['offsetX']) ?
        anychart.utils.normalizeSize(/** @type {string|number} */(settings['offsetX']), parentWidth) : 0;
    var offsetYNorm = goog.isDef(settings['offsetY']) ?
        anychart.utils.normalizeSize(/** @type {string|number} */(settings['offsetY']), parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

    markerBounds.left = position.x + markerBounds.width / 2;
    markerBounds.top = position.y + markerBounds.height / 2;

    this.markerElement_.clear();
    if (this.parentMarkersFactory_ && this.parentMarkersFactory_.crispEdges)
      drawer.call(this, this.markerElement_, markerBounds.left, markerBounds.top, settings['size'], strokeThickness);
    else
      drawer.call(this, this.markerElement_, markerBounds.left, markerBounds.top, settings['size']);

    this.markerElement_.fill(settings['fill']);
    this.markerElement_.stroke(settings['stroke']);

    //clear all transform of element
    this.markerElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    //Sets rotation.
    this.markerElement_.setRotation(/** @type {number} */(settings['rotation'] || 0),
        position.x + anchorCoordinate.x, position.y + anchorCoordinate.y);

    this.markerElement_.tag = this.getIndex();

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  return this;
};


/**
 * Defaults for standalone use.
 * @private
 */
anychart.core.ui.MarkersFactory.Marker.prototype.applyDefaultsForSingle_ = function() {
  this.suspendSignalsDispatching();
  if (!goog.isDef(this.positionFormatter())) this.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
  if (!goog.isDef(this.size())) this.size(10);
  if (!goog.isDef(this.anchor())) this.anchor(anychart.enums.Anchor.CENTER);
  if (!goog.isDef(this.offsetX())) this.offsetX(0);
  if (!goog.isDef(this.offsetY())) this.offsetY(0);
  if (!goog.isDef(this.rotation())) this.rotation(0);
  this.resumeSignalsDispatching(false);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.serialize = function() {
  var json = anychart.core.ui.MarkersFactory.Marker.base(this, 'serialize');
  if (goog.isDef(this.position())) json['position'] = this.position();
  if (goog.isDef(this.rotation())) json['rotation'] = isNaN(this.rotation()) ? null : this.rotation();
  if (goog.isDef(this.anchor())) json['anchor'] = this.anchor();
  if (goog.isDef(this.offsetX())) json['offsetX'] = this.offsetX();
  if (goog.isDef(this.offsetY())) json['offsetY'] = this.offsetY();
  if (goog.isDef(this.type())) json['type'] = this.type();
  if (goog.isDef(this.size())) json['size'] = this.size();
  if (goog.isDef(this.fill())) json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  if (goog.isDef(this.stroke())) json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  if (!goog.isDef(this.enabled())) delete json['enabled'];

  return json;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.MarkersFactory.Marker.base(this, 'setupByJSON', config, opt_default);
  this.position(config['position']);
  this.rotation(config['rotation']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.type(config['type']);
  this.size(config['size']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.positionFormatter(config['positionFormatter']);
  if (!goog.isDef(config['enabled'])) delete this.settingsObj['enabled'];
  this.enabled('enabled' in config ? config['enabled'] : enabledState);
};


//exports
(function() {
  var proto = anychart.core.ui.MarkersFactory.prototype;
  proto['positionFormatter'] = proto.positionFormatter;
  proto['position'] = proto.position;
  proto['anchor'] = proto.anchor;
  proto['offsetX'] = proto.offsetX;
  proto['offsetY'] = proto.offsetY;
  proto['rotation'] = proto.rotation;
  proto['type'] = proto.type;
  proto['size'] = proto.size;
  proto['fill'] = proto.fill;
  proto['stroke'] = proto.stroke;
  proto['disablePointerEvents'] = proto.disablePointerEvents;
  proto['enabled'] = proto.enabled;

  proto = anychart.core.ui.MarkersFactory.Marker.prototype;
  proto['positionFormatter'] = proto.positionFormatter;
  proto['position'] = proto.position;
  proto['anchor'] = proto.anchor;
  proto['offsetX'] = proto.offsetX;
  proto['offsetY'] = proto.offsetY;
  proto['rotation'] = proto.rotation;
  proto['type'] = proto.type;
  proto['size'] = proto.size;
  proto['fill'] = proto.fill;
  proto['stroke'] = proto.stroke;
})();

