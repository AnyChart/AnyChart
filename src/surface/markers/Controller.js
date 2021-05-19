goog.provide('anychart.surfaceModule.markers.Controller');

goog.require('acgraph.vector.Layer');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
goog.require('anychart.surfaceModule.markers.Marker');
goog.require('anychart.surfaceModule.markers.droplines.Controller');



/**
 * Markers controller. Create, setup and resolves marker settings.
 *
 * @param {anychart.surfaceModule.Chart} chart - Surface instance.
 *
 * @extends {anychart.core.VisualBase}
 *
 * @constructor
 */
anychart.surfaceModule.markers.Controller = function(chart) {
  anychart.surfaceModule.markers.Controller.base(this, 'constructor');

  /**
   * Surface instance.
   *
   * @type {anychart.surfaceModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Array of currently used markers.
   *
   * @type {Array.<anychart.surfaceModule.markers.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   * Markers mapping.
   * Override default mapping because of 'size' data field.
   * @const
   * @private
   */
  this.mapping_ = {
    'x': [0, 'x'],
    'y': [1, 'y'],
    'z': [2, 'z']
  };


  this.rootLayer_ = acgraph.layer();

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REDRAW],
    ['size', 0, anychart.Signal.NEEDS_REDRAW],
    ['fill', 0, anychart.Signal.NEEDS_REDRAW],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['type', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.surfaceModule.markers.Controller, anychart.core.VisualBase);


/**
 * Supported signals.
 * @type {number}
 */
anychart.surfaceModule.markers.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.core.settings.markerTypeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeOrFunctionNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.surfaceModule.markers.Controller, anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS);


// region --- Droplines
/**
 * Droplines invalidation handler.
 * @private
 */
anychart.surfaceModule.markers.Controller.prototype.invalidateDroplines_ = function() {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/Setter for markers droplines.
 *
 * @param {Object=} opt_config
 * @return {anychart.surfaceModule.markers.Controller|anychart.surfaceModule.markers.droplines.Controller}
 */
anychart.surfaceModule.markers.Controller.prototype.droplines = function(opt_config) {
  if (!this.droplines_) {
    this.droplines_ = new anychart.surfaceModule.markers.droplines.Controller();
    this.setupCreated('droplines', this.droplines_);
    this.droplines_.listenSignals(this.invalidateDroplines_, this);
  }

  if (goog.isDef(opt_config)) {
    this.droplines_.setup(opt_config);
    return this;
  }

  return this.droplines_;
};


// endregion
//region --- Markers
/**
 * Instantiate marker.
 * @return {anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Controller.prototype.createMaker = function() {
  return new anychart.surfaceModule.markers.Marker(this, this.droplines().getDropline());
};


/**
 * Return already created marker instance or create new.
 *
 * @param {{
 *   data: Array.<number>,
 *   index: number
 * }} point Marker data.
 *
 * @return {!anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Controller.prototype.getMarker = function(point) {
  var marker = this.createMaker();

  marker.data(point.data);
  marker.index(point.index);

  return marker;
};


/**
 * Setup marker.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 *
 * @param {anychart.math.Rect} bounds
 */
anychart.surfaceModule.markers.Controller.prototype.setupMarker = function(marker, bounds) {
  var markerData = marker.data();

  var markerPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(
    this.chart_.transformationMatrix_,
    this.chart_.scalePoint(/** @type {Array.<number>}*/(markerData))
  );

  var markerCoordinates = anychart.surfaceModule.math.pointToScreenCoordinates(markerPoint, bounds);

  marker.coordinates(markerCoordinates);
  marker.zIndex(this.chart_.calculateZIndexForPoint(markerPoint));

  var droplinePoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(
    this.chart_.transformationMatrix_,
    this.chart_.scalePoint([markerData[0], markerData[1], this.chart_.zScale().minimum()])
  );

  var droplineCoordinates = anychart.surfaceModule.math.pointToScreenCoordinates(droplinePoint, bounds);

  this.droplines().setupDropline(marker.getDropline(), {
    from: markerCoordinates,
    to: droplineCoordinates
  });
};


/**
 * Return array of markers.
 *
 * @return {Array.<anychart.surfaceModule.markers.Marker>}
 */
anychart.surfaceModule.markers.Controller.prototype.getMarkers = function() {
  if (!this.markers_.length) {
    if (this.data_) {
      var iterator = this.data_.getIterator();

      while (iterator.advance()) {
        var x = iterator.get('x');
        var y = iterator.get('y');
        var z = iterator.get('z');
        if (goog.isNumber(x) && goog.isNumber(y) && goog.isNumber(z)) {
          var marker = this.getMarker({
            index: iterator.getIndex(),
            data: [x, y, z]
          });
          this.markers_.push(marker);
        }
      }
    }
  }
  return this.markers_;
};


// endregion
//region --- Drawing
/**
 * Draw all created markers.
 *
 * @param {anychart.math.Rect} bounds - Parent bounds.
 */
anychart.surfaceModule.markers.Controller.prototype.draw = function(bounds) {
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/**@type {acgraph.vector.Layer}*/(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  var marker;
  var markers = this.getMarkers();

  for (var i = 0; i < markers.length; i++) {
    marker = markers[i];
    this.setupMarker(marker, bounds);
  }

  markers.sort(function(a, b) {
    return b.zIndex() - a.zIndex();
  });

  for (i = 0; i < markers.length; i++) {
    marker = markers[i];
    marker.container(this.rootLayer_);
    marker.draw();
  }
};


// endregion
// region --- Data
/**
 * Return iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.surfaceModule.markers.Controller.prototype.getIterator = function() {
  return this.data_.getIterator();
};


/**
 *
 * @private
 */
anychart.surfaceModule.markers.Controller.prototype.dataInvalidated_ = function() {
  goog.disposeAll(this.markers_);
  this.markers_.length = 0;

  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings
 * @return {anychart.surfaceModule.markers.Controller|anychart.data.View}
 */
anychart.surfaceModule.markers.Controller.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (this.data_)
        this.data_.unlistenSignals(this.dataInvalidated_, this);

      goog.disposeAll(
        this.data_,
        this.parentViewToDispose_
      );

      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs(this.mapping_);
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs(this.mapping_);
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.dataInvalidated_();
    }
    return this;
  }
  return this.data_;
};


/**
 * MouseMove event handler.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {goog.events.Event} event - Browser event.
 * @private
 */
anychart.surfaceModule.markers.Controller.prototype.handleMouseOverAndMove_ = function(marker, event) {
  this.tooltip().showFloat(event.clientX, event.clientY, this.getContextProviderForMarker(marker, this.getBaseContext(marker)));
};


// endregion
//region --- Events
/**
 * MouseOut event handler.
 * @private
 */
anychart.surfaceModule.markers.Controller.prototype.handleMouseOut_ = function() {
  this.tooltip().hide();
};


/**
 * Mouse events handler.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {goog.events.Event} event - Browser event.
 */
anychart.surfaceModule.markers.Controller.prototype.handleMarkerMouseEvents = function(marker, event) {
  if (event.type === goog.events.EventType.MOUSEMOVE || event.type === goog.events.EventType.MOUSEOVER) {
    this.handleMouseOverAndMove_(marker, event);
  } else if (event.type === goog.events.EventType.MOUSEOUT) {
    this.handleMouseOut_();
  }
};


//endregion
//region --- Settings resolving
/**
 * Resolves option value.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {string} option - Option name.
 * @return {*}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveDataOption = function(marker, option) {
  var iterator = this.getIterator();

  iterator.select(/**@type {number}*/(marker.index()));

  return iterator.get(option);
};


/**
 * Resolve option value.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @param {string} name - Option name.
 * @return {*}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveOption = function(marker, name) {
  var option = this.resolveDataOption(marker, name) || this.getOption(name);
  if (goog.isFunction(option)) {
    var context = this.getContextProviderForMarker(marker, this.getExtendedContext(marker));
    return option.call(context, context);
  }

  return option;
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {acgraph.vector.Fill}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveFill = function(marker) {
  return  /**@type {acgraph.vector.Fill} */(this.resolveOption(marker, 'fill'));
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {acgraph.vector.Stroke}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveStroke = function(marker) {
  return /**@type {acgraph.vector.Stroke} */(this.resolveOption(marker, 'stroke'));
};


/**
 * Resolve marker type.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {string}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveType = function(marker) {
  return /**@type {string}*/(this.resolveOption(marker, 'type'));
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {number}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveSize = function(marker) {
  return /**@type {number}*/(this.resolveOption(marker, 'size'));
};


/**
 * Resolve marker drawer.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {function(!acgraph.vector.Path, number, number, number, number=): !acgraph.vector.Path}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveDrawer = function(marker) {
  return anychart.utils.getMarkerDrawer(this.resolveType(marker));
};


//endregion
//region --- Tooltip
/**
 * Returns context that contains base marker info.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getBaseContext = function(marker) {
  var index = marker.index();
  var data = marker.data();
  var context = /**@type{anychart.format.Context}*/({});

  context['index'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: index
  };

  context['x'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: data[0]
  };

  context['y'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: data[1]
  };

  context['z'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: data[2]
  };

  return context;
};


/**
 * Returns context that contains base point info extended by color info.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getExtendedContext = function(marker) {
  var context = this.getBaseContext(marker);

  context['sourceColor'] = {
    type: anychart.enums.TokenType.UNKNOWN,
    value: this.chart_.resolveColor(marker.data()[2])
  };

  return context;
};


/**
 * Return context provider for marker.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @param {Object} context
 *
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getContextProviderForMarker = function(marker, context) {
  if (!this.contextProvider_) {
    this.contextProvider_ = new anychart.format.Context();
  }

  var index = marker.index();
  var iterator = this.getIterator();
  iterator.select(/**@type{number}*/(index));

  this.contextProvider_.dataSource(iterator);

  return /** @type {anychart.format.Context} */(this.contextProvider_.propagate(context));
};


/**
 * Getter/Setter for markers tooltip.
 *
 * @param {Object=} opt_value - Configuration object.
 *
 * @return {anychart.surfaceModule.markers.Controller|anychart.core.ui.Tooltip}
 */
anychart.surfaceModule.markers.Controller.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart_.tooltip()));
    this.tooltip_.chart(this.chart_);
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  }

  return this.tooltip_;
};


//endregion
// region --- Overrides
/** @inheritDoc */
anychart.surfaceModule.markers.Controller.prototype.serialize = function() {
  var rv = {};
  anychart.core.settings.serialize(this, anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS, rv);

  var data = this.data();
  if (data) {
    rv['data'] = data.serialize();
  }

  return rv;
};


/** @inheritDoc */
anychart.surfaceModule.markers.Controller.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.settings.deserialize(this, anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS, json, opt_default);
  var data = json['data'];
  if (data) {
    this.data(data);
  }
};


/** @inheritDoc */
anychart.surfaceModule.markers.Controller.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.markers_,
    this.droplines_,
    this.rootLayer_
  );

  this.markers_.length = 0;
  this.chart_ = null;
};


// endregion
(function() {
  var proto = anychart.surfaceModule.markers.Controller.prototype;
  proto['droplines'] = proto.droplines;
  proto['tooltip'] = proto.tooltip;
}());
