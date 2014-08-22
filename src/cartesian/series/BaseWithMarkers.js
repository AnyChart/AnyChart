goog.provide('anychart.cartesian.series.BaseWithMarkers');
goog.require('acgraph');
goog.require('anychart.cartesian.series.Base');
goog.require('anychart.elements.MarkersFactory');
goog.require('anychart.enums');



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

  this.markers().listen(acgraph.events.EventType.MOUSEOVER, this.handleMarkerMouseOver, false, this);
  this.markers().listen(acgraph.events.EventType.MOUSEOUT, this.handleMarkerMouseOut, false, this);
  this.markers().listen(acgraph.events.EventType.CLICK, this.handleMarkerBrowserEvents, false, this);
  this.markers().listen(acgraph.events.EventType.DBLCLICK, this.handleMarkerBrowserEvents, false, this);
  this.markers().position(anychart.enums.Position.CENTER);
  this.registerDisposable(this.markers());
  this.registerDisposable(this.hoverMarkers());
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
 * @type {anychart.elements.MarkersFactory}
 * @private
 */
anychart.cartesian.series.BaseWithMarkers.prototype.markers_ = null;


/**
 * @type {anychart.elements.MarkersFactory}
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
 * Getter for series data markers.
 * @example <t>listingOnly</t>
 * series.markers().size(10);
 * @return {!anychart.elements.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn off markers.
 * @example <t>listingOnly</t>
 * var myMarkers = anychart.elements.markersFactory()
 *       .size(10)
 *       .type('star5');
 * series.markers(myMarkers);
 * @example <t>lineChart</t>
 * chart.spline([1, 1.4, 1.2, 2]).markers(null);
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.cartesian.series.BaseWithMarkers} {@link anychart.cartesian.series.BaseWithMarkers} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.MarkersFactory|anychart.cartesian.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.elements.MarkersFactory();
    this.registerDisposable(this.markers_);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.MarkersFactory) {
      var data = opt_value.serialize();
      this.markers_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.markers_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
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
 * @return {!anychart.elements.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers on hover.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn of markers.
 * @example <t>listingOnly</t>
 * series.hoverMarkers(null);
 * @example <t>lineChart</t>
 * var myMarkers = anychart.elements.markersFactory()
 *       .size(10)
 *       .type('star5');
 * chart.spline([1, 1.4, 1.2, 2]).hoverMarkers(myMarkers);
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!anychart.cartesian.series.BaseWithMarkers} {@link anychart.cartesian.series.BaseWithMarkers} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.MarkersFactory|Object|string|null)=} opt_value Series data markers settings.
 * @return {!(anychart.elements.MarkersFactory|anychart.cartesian.series.BaseWithMarkers)} Markers instance or itself for chaining call.
 */
anychart.cartesian.series.BaseWithMarkers.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.elements.MarkersFactory();
    this.registerDisposable(this.hoverMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.MarkersFactory) {
      this.hoverMarkers_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hoverMarkers_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
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
  var markers = this.markers();
  var hoverMarkers = this.hoverMarkers();

  markers.suspendSignalsDispatching();
  hoverMarkers.suspendSignalsDispatching();

  var fillColor = this.getMarkerColor();
  var strokeColor = /** @type {acgraph.vector.Stroke} */(anychart.color.darken(fillColor));

  markers.setAutoFill(fillColor);
  markers.setAutoStroke(strokeColor);
  markers.setAutoType(this.autoMarkerType);

  markers.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  markers.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
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
  this.markers().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBounds() : this.clip());
    var markerDOM = this.markers().getDomElement();
    if (markerDOM) markerDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
  }

  this.markers().resumeSignalsDispatching(false);
  this.hoverMarkers().resumeSignalsDispatching(false);

  this.markers().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverMarkers().markConsistent(anychart.ConsistencyState.ALL);

  goog.base(this, 'finalizeDrawing');
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.cartesian.series.BaseWithMarkers.prototype.drawMarker = function(hovered) {
  var pointMarker = this.getIterator().get('marker');
  var hoverPointMarker = this.getIterator().get('hoverMarker');
  var index = this.getIterator().getIndex();
  var markersFactory = /** @type {anychart.elements.MarkersFactory} */(hovered ? this.hoverMarkers() : this.markers());

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(markerHoverEnabledState) ?
          goog.isNull(this.hoverMarkers().enabled()) ?
              goog.isNull(markerEnabledState) ?
                  this.markers().enabled() :
                  markerEnabledState :
              this.hoverMarkers().enabled() :
          markerHoverEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers().enabled() :
          markerEnabledState;

  if (isDraw) {
    var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
    var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
    var position = (hovered && (markerHoverPosition || this.hoverMarkers().position())) || markerPosition || this.markers().position();

    var positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    marker.resetSettings();
    marker.currentMarkersFactory(markersFactory);
    marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(hoverPointMarker));
    marker.draw();
  } else if (marker) {
    marker.clear();
  }
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

  var markers = /** @type {anychart.elements.MarkersFactory} */(this.markers());
  markers.suspendSignalsDispatching();
  markers.enabled(true);
  markers.size(4);
  markers.resumeSignalsDispatching(false);

  var hoverMarkers = (/** @type {anychart.elements.MarkersFactory} */(this.hoverMarkers()));
  hoverMarkers.suspendSignalsDispatching();
  hoverMarkers.size(6);
  hoverMarkers.resumeSignalsDispatching(false);

  return result;
};


//exports
anychart.cartesian.series.BaseWithMarkers.prototype['startDrawing'] = anychart.cartesian.series.BaseWithMarkers.prototype.startDrawing;//inherited
anychart.cartesian.series.BaseWithMarkers.prototype['drawPoint'] = anychart.cartesian.series.BaseWithMarkers.prototype.drawPoint;//inherited
anychart.cartesian.series.BaseWithMarkers.prototype['finalizeDrawing'] = anychart.cartesian.series.BaseWithMarkers.prototype.finalizeDrawing;//inherited
anychart.cartesian.series.BaseWithMarkers.prototype['markers'] = anychart.cartesian.series.BaseWithMarkers.prototype.markers;//doc|ex
anychart.cartesian.series.BaseWithMarkers.prototype['hoverMarkers'] = anychart.cartesian.series.BaseWithMarkers.prototype.hoverMarkers;//doc|ex
