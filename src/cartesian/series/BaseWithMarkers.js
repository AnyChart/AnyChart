goog.provide('anychart.cartesian.series.BaseWithMarkers');

goog.require('anychart.cartesian.series.Base');
goog.require('anychart.elements.Multimarker');



/**
 * A base for all series except marker series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.Base}
 */
anychart.cartesian.series.BaseWithMarkers = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  this.realMarkers_ = new anychart.elements.Multimarker();
  this.realMarkers_.listen(acgraph.events.EventType.MOUSEOVER, this.handleMarkerMouseOver, false, this);
  this.realMarkers_.listen(acgraph.events.EventType.MOUSEOUT, this.handleMarkerMouseOut, false, this);
  this.realMarkers_.listen(acgraph.events.EventType.CLICK, this.handleMarkerBrowserEvents, false, this);
  this.realMarkers_.listen(acgraph.events.EventType.DBLCLICK, this.handleMarkerBrowserEvents, false, this);
  this.registerDisposable(this.realMarkers_);

  this.markers().position(anychart.utils.NinePositions.CENTER);
  this.hoverMarkers().position(anychart.utils.NinePositions.CENTER);
};
goog.inherits(anychart.cartesian.series.BaseWithMarkers, anychart.cartesian.series.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.cartesian.series.BaseWithMarkers.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.MARKERS;


/**
 * @type {anychart.elements.Marker.Type}
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.autoMarkerType_ = anychart.elements.Marker.Type.CIRCLE;


/**
 * @type {anychart.elements.Multimarker}
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.realMarkers_ = null;


/**
 * @type {anychart.elements.Multimarker}
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.markers_ = null;


/**
 * @type {anychart.elements.Multimarker}
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.hoverMarkers_ = null;


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.BaseWithMarkers.prototype.handleMarkerMouseOver = function(event) {
  if (this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event))) {
    if (event && goog.isDef(event['markerIndex'])) {
      this.hoverPoint(event['markerIndex'], event);
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.BaseWithMarkers.prototype.handleMarkerMouseOut = function(event) {
  if (this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event)))
    this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.BaseWithMarkers.prototype.handleMarkerBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
};


/**
 * @param {anychart.elements.Marker.Type} value Auto marker type distributed by the chart.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.setAutoMarkerType = function(value) {
  this.autoMarkerType_ = value;
};


/**
 * Getter for series data markers.
 * @example <t>listingOnly</t>
 * series.markers().size(10);
 * @return {!anychart.elements.Multimarker} Markers instance.
 *//**
 * Setter for series data markers.<br/>
 * <b>Note:</b> Что бы отключить маркеры, надо передать <b>'none'</b> или <b>null</b>.
 * @example <t>listingOnly</t>
 * series.markers(null);
 * @example <t>listingOnly</t>
 * var myMarkers = new anychart.elements.Multimarker()
 *       .size(10)
 *       .type('star5')
 * series.markers(myMarkers);
 * @param {(anychart.elements.Multimarker|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.cartesian.series.BaseWithMarkers} An instance of the {@link anychart.cartesian.series.BaseWithMarkers} class for method chaining.
 */
/**
 * @ignoreDoc
 * @param {(anychart.elements.Multimarker|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.Multimarker|anychart.cartesian.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.elements.Multimarker();
    this.registerDisposable(this.markers_);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multimarker) {
      var data = opt_value.serialize();
      this.markers_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.markers_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.markers_.enabled(false);
    }
    return this;
  }
  return this.markers_;
};


/**
 * Getter for series data markers on hover.
 * @example <t>listingOnly</t>
 * series.hoverMarkers().size(20);
 * @return {!anychart.elements.Multimarker} Markers instance.
 *//**
 * Setter for series data markers on hover.<br/>
 * <b>Note:</b> Что бы отключить маркеры, надо передать <b>'none'</b> или <b>null</b>.
 * @example <t>listingOnly</t>
 * series.hoverMarkers(null);
 * @example <t>listingOnly</t>
 * var myMarkers = new anychart.elements.Multimarker()
 *       .size(10)
 *       .type('star5')
 * series.hoverMarkers(myMarkers);
 * @param {(anychart.elements.Multimarker|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.cartesian.series.BaseWithMarkers} An instance of the {@link anychart.cartesian.series.BaseWithMarkers} class for method chaining.
 */
/**
 * @ignoreDoc
 * @param {(anychart.elements.Multimarker|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.Multimarker|anychart.cartesian.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.elements.Multimarker();
    this.registerDisposable(this.hoverMarkers_);
    // мы его не слушаем, потому что на следующий ховер он все равно переприменится
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multimarker) {
      this.hoverMarkers_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hoverMarkers_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.hoverMarkers_.enabled(false);
    }
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.cartesian.series.BaseWithMarkers.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  this.markers().suspendSignalsDispatching();
  this.hoverMarkers().suspendSignalsDispatching();
  this.realMarkers_.suspendSignalsDispatching();
  this.realMarkers_.deserialize(this.markers_.serialize(true));
  this.realMarkers_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.realMarkers_.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
};


/** @inheritDoc */
anychart.cartesian.series.BaseWithMarkers.prototype.drawPoint = function() {
  goog.base(this, 'drawPoint');
  if (this.enabled() && this.firstPointDrawn) {
    this.drawMarker(false);
  }
};


/** @inheritDoc */
anychart.cartesian.series.BaseWithMarkers.prototype.finalizeDrawing = function() {
  this.realMarkers_.end();
  this.markers().resumeSignalsDispatching(false);
  this.hoverMarkers().resumeSignalsDispatching(false);
  this.realMarkers_.resumeSignalsDispatching(false);

  this.realMarkers_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.markers_)
    this.markers_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.hoverMarkers_)
    this.hoverMarkers_.markConsistent(anychart.ConsistencyState.ALL);

  goog.base(this, 'finalizeDrawing');
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.cartesian.series.BaseWithMarkers.prototype.drawMarker = function(hovered) {
  var pointMarker = this.getIterator().get(hovered ? 'hoverMarker' : 'marker');
  var index = this.getIterator().getIndex();
  var markers = /** @type {anychart.elements.Multimarker} */(hovered ? this.hoverMarkers() : this.markers());
  if (goog.isDef(pointMarker))
    markers.deserializeAt(index, /** @type {Object} */(pointMarker));
  this.realMarkers_.dropCustomSettingsAt(index);
  this.realMarkers_.deserializeAt(index, markers.serializeAt(index, !hovered));
  this.realMarkers_.draw(
      this.createPositionProvider(/** @type {anychart.utils.NinePositions} */(this.realMarkers_.positionAt(index))),
      index);
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.BaseWithMarkers.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.BaseWithMarkers.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);
  this.markers(config['markers']);
  this.hoverMarkers(config['hoverMarkers']);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.getMarkerColor = function() {
  return this.getFinalFill(false, false);
};


/** @inheritDoc */
anychart.cartesian.series.BaseWithMarkers.prototype.restoreDefaults = function() {
  var result = goog.base(this, 'restoreDefaults');

  var fillColor = this.getMarkerColor();
  var strokeColor = /** @type {acgraph.vector.Stroke} */(anychart.color.darken(fillColor));

  var markers = /** @type {anychart.elements.Multimarker} */(this.markers());
  markers.suspendSignalsDispatching();
  markers.enabled(true);
  markers.size(4);
  markers.fill(fillColor);
  markers.stroke(strokeColor);
  markers.type(this.autoMarkerType_);
  markers.resumeSignalsDispatching(false);

  var hoverMarkers = (/** @type {anychart.elements.Multimarker} */(this.hoverMarkers()));
  hoverMarkers.suspendSignalsDispatching();
  hoverMarkers.fill(fillColor);
  hoverMarkers.stroke(strokeColor);
  hoverMarkers.size(6);
  hoverMarkers.type(this.autoMarkerType_);
  hoverMarkers.resumeSignalsDispatching(false);

  return result;
};

