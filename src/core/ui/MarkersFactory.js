goog.provide('anychart.core.ui.MarkersFactory');
goog.provide('anychart.core.ui.MarkersFactory.Marker');
goog.provide('anychart.standalones.MarkersFactory');
goog.provide('anychart.standalones.MarkersFactory.Marker');
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
 * var MMarker = anychart.standalones.markersFactory()
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
 * @param {boolean=} opt_skipDefaultThemes
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.MarkersFactory = function(opt_isNonInteractive, opt_crispEdges, opt_skipDefaultThemes) {
  this.suspendSignalsDispatching();
  anychart.core.ui.MarkersFactory.base(this, 'constructor');

  if (!opt_skipDefaultThemes)
    this.addDefaultThemes(anychart.themes.DefaultThemes['markersFactory']);

  delete this.themeSettings['enabled'];

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
   * Enabled state.
   * @type {?boolean}
   * @private
   */
  this.enabledState_ = null;

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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['position',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW, 0],
    ['positionFormatter',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['size',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['rotation',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['type',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(true);
};
goog.inherits(anychart.core.ui.MarkersFactory, anychart.core.VisualBase);


/**
 * Own property descriptors
 * */
anychart.core.ui.MarkersFactory.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.FILL,
    anychart.core.settings.descriptors.STROKE,
    anychart.core.settings.descriptors.OFFSET_X,
    anychart.core.settings.descriptors.OFFSET_Y,
    anychart.core.settings.descriptors.POSITION_FORMATTER,
    anychart.core.settings.descriptors.ROTATION,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.stringOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', function(val) {
      return goog.isNull(val) ? val : anychart.enums.normalizeAnchor(val);
    }],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', function(val) {
      if (!goog.isFunction(val))
        val = anychart.enums.normalizeMarkerType(val);
      return val;
    }]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.MarkersFactory, anychart.core.ui.MarkersFactory.OWN_DESCRIPTORS);


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



/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.flattenThemes = function() {
  anychart.core.ui.MarkersFactory.base(this, 'flattenThemes');

  //Fill changedSettings object with object from theme.
  for (var key in this.themeSettings) {
    if (key in this.descriptorsMeta) {
      this.changedSettings[key] = true;
    }
  }
};


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
    this.supportsEnabledSuspension = !goog.isNull(this.ownSettings['enabled']);
    // if (!goog.isNull(opt_value)) {
    anychart.core.ui.MarkersFactory.base(this, 'enabled', /** @type {boolean} */(opt_value));
    // } else {
    //   anychart.core.ui.MarkersFactory.base(this, 'enabled', true);
    // }
    return this;
  }
  return this.enabledState_;
};


/**
 * Getter for current type value.
 * @return {?(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)} .
 */
anychart.core.ui.MarkersFactory.prototype.getType = function() {
  return this.ownSettings['type'] || this.themeSettings['type'];
};


/**
 * Sets markers type that parent series have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the series.
 */
anychart.core.ui.MarkersFactory.prototype.setAutoType = function(value) {
  this.autoType_ = value;
};


/**
 * Getter for current fill value.
 * @return {?(string|acgraph.vector.Fill)} .
 */
anychart.core.ui.MarkersFactory.prototype.getFill = function() {
  return goog.isDef(this.ownSettings['fill']) ? this.ownSettings['fill'] : this.themeSettings['fill'];
};


/**
 * Sets markers fill that parent series have set for it.
 * @param {acgraph.vector.Fill} value Auto fill distributed by the series.
 */
anychart.core.ui.MarkersFactory.prototype.setAutoFill = function(value) {
  this.autoFill_ = value;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.getOption = function(name) {
  var val = anychart.core.ui.MarkersFactory.base(this, 'getOption', name);
  if (!val) {
    if (name == 'stroke') {
      val = this.autoStroke_ || 'none';
    } else if (name == 'fill') {
      val = this.autoFill_ || 'black';
    } else if (name == 'type') {
      val = this.autoType_ || anychart.enums.MarkerType.DIAGONAL_CROSS;
    }
  }
  return val;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.setOption = function(name, value) {
  anychart.core.ui.MarkersFactory.base(this, 'setOption', name, value);
  this.changedSettings[name] = true;
};


/**
 * Getter for current stroke value.
 * @return {?(string|acgraph.vector.Stroke)} .
 */
anychart.core.ui.MarkersFactory.prototype.getStroke = function() {
  return goog.isDef(this.ownSettings['stroke']) ? this.ownSettings['stroke'] : this.themeSettings['stroke'];
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

  var type = this.getOption('type');
  var size = /** @type {number} */(this.getOption('size'));
  var anchor = /** @type {anychart.enums.Anchor} */(this.getOption('anchor'));
  var offsetX = /** @type {number} */(this.getOption('offsetX'));
  var offsetY = /** @type {number} */(this.getOption('offsetY'));

  drawer = goog.isString(type) ?
      anychart.utils.getMarkerDrawer(type) :
      type;

  this.measureMarkerElement_.clear();
  drawer.call(this, this.measureMarkerElement_, 0, 0, size);

  var markerBounds = /** @type {anychart.math.Rect} */(this.measureMarkerElement_.getBounds());
  var formattedPosition = goog.object.clone(this.getOption('positionFormatter').call(positionProvider, positionProvider));
  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, markerBounds.width, markerBounds.height),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNorm = goog.isDef(offsetX) ? anychart.utils.normalizeSize(offsetX, parentWidth) : 0;
  var offsetYNorm = goog.isDef(offsetY) ? anychart.utils.normalizeSize(offsetY, parentHeight) : 0;

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
      this.invalidate(anychart.ConsistencyState.MARKERS_FACTORY_HANDLERS, anychart.Signal.NEEDS_REDRAW);
    }
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
  // anychart.core.settings.serialize(this, anychart.core.ui.MarkersFactory.OWN_DESCRIPTORS, json);
  delete json['enabled'];
  var enabledState = this.enabled();
  if (goog.isDef(enabledState))
    json['enabled'] = enabledState;
  if (goog.isDef(this.disablePointerEvents())) json['disablePointerEvents'] = this.disablePointerEvents();
  if (this.changedSettings['position']) json['position'] = this.getOption('position');
  if (this.changedSettings['anchor']) json['anchor'] = this.getOption('anchor');
  if (this.changedSettings['offsetX']) json['offsetX'] = this.getOption('offsetX');
  if (this.changedSettings['offsetY']) json['offsetY'] = this.getOption('offsetY');
  if (this.changedSettings['type']) json['type'] = this.getOption('type');
  if (this.changedSettings['rotation']) json['rotation'] = isNaN(this.getOption('rotation')) ? null : this.getOption('rotation');
  if (goog.isDef(this.getOption('size'))) json['size'] = this.getOption('size');
  if (this.changedSettings['fill'] && goog.isDef(this.ownSettings['fill']))
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.ownSettings['fill']));
  if (this.changedSettings['stroke'] && goog.isDef(this.ownSettings['stroke']))
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.ownSettings['stroke']));
  return json;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isString(arg0)) {
    return {
      'type': arg0,
      'enabled': true
    };
  }
  return null;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    var type = 'type';
    if (this[type])
      this[type](resolvedValue[type]);
    else
      this.setOption(type, resolvedValue[type]);
    this.enabled(resolvedValue['enabled']);
    return true;
  }
  return anychart.core.VisualBase.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.MarkersFactory.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    for (var i in config) {
      this.themeSettings[i] = config[i];
      this.changedSettings[i] = true;
    }
  } else {
    anychart.core.settings.deserialize(this, anychart.core.ui.MarkersFactory.Marker.OWN_DESCRIPTORS, config);
  }
  this.disablePointerEvents(config['disablePointerEvents']);
  this.enabled('enabled' in config ? config['enabled'] : enabledState);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.disposeInternal = function() {
  goog.disposeAll(this.markers_, this.freeToUseMarkersPool_, this.layer_);

  this.markers_ = null;
  this.freeToUseMarkersPool_ = null;
  this.layer_ = null;

  anychart.core.ui.MarkersFactory.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.ui.MarkersFactory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (anychart.utils.instanceOf(tag, anychart.core.VisualBase) || !anychart.utils.isNaN(tag))
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

  delete this.themeSettings['enabled'];

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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['position',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['stroke',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['positionFormatter',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['size',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['rotation',
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['type',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW
    ]
  ]);
  this.resetSettings();
};
goog.inherits(anychart.core.ui.MarkersFactory.Marker, anychart.core.VisualBase);


/**
 * Own property descriptors
 * */
anychart.core.ui.MarkersFactory.Marker.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.ANCHOR,
    anychart.core.settings.descriptors.OFFSET_X,
    anychart.core.settings.descriptors.OFFSET_Y,
    anychart.core.settings.descriptors.POSITION_FORMATTER,
    anychart.core.settings.descriptors.ROTATION,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', function(val) {
      if (!goog.isFunction(val))
        val = anychart.enums.normalizeMarkerType(val);
      return val;
    }]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.MarkersFactory.Marker, anychart.core.ui.MarkersFactory.Marker.OWN_DESCRIPTORS);


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


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.setOption = function(name, value) {
  this.settingsObj[name] = value;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.getOption = function(name) {
  var val = goog.isDef(this.settingsObj[name]) ? this.settingsObj[name] : this.themeSettings[name];

  if (!goog.isDef(val)) {
    if (name == 'stroke') {
      val = this.autoStroke_;
    } else if (name == 'fill') {
      val = this.autoFill_;
    }
  }
  return val;
};


/**
 * Sets markers fill that parent series have set for it.
 * @param {acgraph.vector.Fill} value Auto fill distributed by the series.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.setAutoFill = function(value) {
  this.autoFill_ = value;
};


/**
 * Sets markers fill that parent series have set for it.
 * @param {acgraph.vector.Stroke} value Auto fill distributed by the series.
 */
anychart.core.ui.MarkersFactory.Marker.prototype.setAutoStroke = function(value) {
  this.autoStroke_ = value;
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
    return /** @type {boolean} */(goog.isDef(this.settingsObj['enabled']) ? this.settingsObj['enabled'] : this.themeSettings['enabled']);
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
  this.themeSettings = {};
  this.settingsObj = {};
  this.superSettingsObj = {};
  delete this.autoFill_;
  delete this.autoStroke_;
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
      var pointSettings = this[field]();
      var pointSuperSettings = this.superSettingsObj[field];
      var factorySettings = isSingleMarker ? undefined : parentMarkersFactory[field] ?
          parentMarkersFactory[field]() : parentMarkersFactory.getOption(field);
      var factorySuperSettings = isSingleMarker ? undefined : currentMarkersFactory[field] ?
          currentMarkersFactory[field]() : currentMarkersFactory.getOption(field);
      var isFactorySettingsChanged = !!(settingsChangedStates && settingsChangedStates[field]);

      settings[field] = this.getFinalSettings_(pointSettings,
          pointSuperSettings,
          factorySettings,
          factorySuperSettings,
          isFactorySettingsChanged);
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
  if (!goog.isDef(this.getOption('positionFormatter'))) this.setOption('positionFormatter', anychart.utils.DEFAULT_FORMATTER);
  if (!goog.isDef(this.getOption('size'))) this.setOption('size', 10);
  if (!goog.isDef(this.getOption('anchor'))) this.setOption('anchor', anychart.enums.Anchor.CENTER);
  if (!goog.isDef(this.getOption('offsetX'))) this.setOption('offsetX', 0);
  if (!goog.isDef(this.getOption('offsetY'))) this.setOption('offsetY', 0);
  if (!goog.isDef(this.getOption('rotation'))) this.setOption('rotation', 0);
  this.resumeSignalsDispatching(false);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.serialize = function() {
  var json = anychart.core.ui.MarkersFactory.Marker.base(this, 'serialize');
  delete json['enabled'];
  var enabledState = this.enabled();
  if (goog.isDefAndNotNull(enabledState))
    json['enabled'] = enabledState;
  if (goog.isDef(this.getOption('position'))) json['position'] = this.getOption('position');
  if (goog.isDef(this.getOption('rotation'))) json['rotation'] = isNaN(this.getOption('rotation')) ? null : this.getOption('rotation');
  if (goog.isDef(this.getOption('anchor'))) json['anchor'] = this.getOption('anchor');
  if (goog.isDef(this.getOption('offsetX'))) json['offsetX'] = this.getOption('offsetX');
  if (goog.isDef(this.getOption('offsetY'))) json['offsetY'] = this.getOption('offsetY');
  if (goog.isDef(this.getOption('type'))) json['type'] = this.getOption('type');
  if (goog.isDef(this.getOption('size'))) json['size'] = this.getOption('size');
  if (goog.isDef(this.getOption('fill'))) json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
  if (goog.isDef(this.getOption('stroke'))) json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

  return json;
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.MarkersFactory.Marker.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.MarkersFactory.Marker.OWN_DESCRIPTORS, config);
  if (!goog.isDef(config['enabled'])) {
    delete this.settingsObj['enabled'];
  }
  this.enabled('enabled' in config ? config['enabled'] : enabledState);
};


/** @inheritDoc */
anychart.core.ui.MarkersFactory.Marker.prototype.disposeInternal = function() {
  goog.dispose(this.markerElement_);
  this.markerElement_ = null;
  anychart.core.ui.MarkersFactory.Marker.base(this, 'disposeInternal');
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory}
 */
anychart.standalones.MarkersFactory = function() {
  anychart.standalones.MarkersFactory.base(this, 'constructor');
};
goog.inherits(anychart.standalones.MarkersFactory, anychart.core.ui.MarkersFactory);
anychart.core.makeStandalone(anychart.standalones.MarkersFactory, anychart.core.ui.MarkersFactory);


/** @inheritDoc */
anychart.standalones.MarkersFactory.prototype.createMarker = function() {
  return new anychart.standalones.MarkersFactory.Marker();
};



/**
 * @constructor
 * @extends {anychart.core.ui.MarkersFactory.Marker}
 */
anychart.standalones.MarkersFactory.Marker = function() {
  anychart.standalones.MarkersFactory.Marker.base(this, 'constructor');
};
goog.inherits(anychart.standalones.MarkersFactory.Marker, anychart.core.ui.MarkersFactory.Marker);


/**
 * Constructor function.
 * @return {!anychart.standalones.MarkersFactory}
 */
anychart.standalones.markersFactory = function() {
  var factory = new anychart.standalones.MarkersFactory();
  factory.setup(anychart.getFlatTheme('standalones.markersFactory'));
  return factory;
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.MarkersFactory.prototype;
  // auto generated
  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['rotation'] = proto.rotation;
  // proto['type'] = proto.type;
  // proto['size'] = proto.size;
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;
  proto['disablePointerEvents'] = proto.disablePointerEvents;
  proto['enabled'] = proto.enabled;

  proto = anychart.core.ui.MarkersFactory.Marker.prototype;
  // auto generated
  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['rotation'] = proto.rotation;
  // proto['type'] = proto.type;
  // proto['size'] = proto.size;
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;

  proto = anychart.standalones.MarkersFactory.prototype;
  goog.exportSymbol('anychart.standalones.markersFactory', anychart.standalones.markersFactory);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['add'] = proto.add;
  proto['clear'] = proto.clear;
  proto['measure'] = proto.measure;

  proto = anychart.standalones.MarkersFactory.Marker.prototype;
  proto['enabled'] = proto.enabled;
  proto['draw'] = proto.draw;
  proto['clear'] = proto.clear;
  proto['getIndex'] = proto.getIndex;
})();

