goog.provide('anychart.charts.Bullet');

goog.require('anychart.core.Chart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.bullet.Marker');
goog.require('anychart.core.reporting');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.palettes');
goog.require('anychart.scales');
goog.require('anychart.utils');



/**
 * Bullet chart class.<br/>
 * <b>Note:</b> Use these methods to get an instance of this class:
 *  <ul>
 *      <li>{@link anychart.bullet}</li>
 *      <li>{@link anychart.bullet}</li>
 *  </ul>
 * @constructor
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.Chart}
 */
anychart.charts.Bullet = function(opt_data, opt_csvSettings) {
  anychart.charts.Bullet.base(this, 'constructor');

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.ranges_ = [];

  /**
   * @type {Array.<anychart.core.bullet.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   * Layout of bullet chart.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /** @inheritDoc */
  this.allowCreditsDisabling = true;

  this.data(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.charts.Bullet, anychart.core.Chart);


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.Bullet.prototype.rawData_;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.Chart states.
 * @type {number}
 */
anychart.charts.Bullet.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BULLET_SCALES |        // scale calculation
    anychart.ConsistencyState.BULLET_AXES |          // axis
    anychart.ConsistencyState.BULLET_AXES_MARKERS |  // ranges
    anychart.ConsistencyState.BULLET_MARKERS |       // value markers
    anychart.ConsistencyState.BULLET_DATA;           // chart data


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.charts.Bullet.prototype.defaultRangeSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeSettings_ || {};
};


/**
 * Getter/setter for marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.charts.Bullet.prototype.defaultMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultMarkerSettings_ || {};
};


/** @inheritDoc */
anychart.charts.Bullet.prototype.getType = function() {
  return anychart.enums.ChartTypes.BULLET;
};


/**
 * Getter/setter for bullet data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {!(anychart.charts.Bullet|anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.Bullet.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (opt_value instanceof anychart.data.View) {
        this.data_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      } else if (opt_value instanceof anychart.data.Set) {
        this.data_ = opt_value.mapAs();
      } else {
        opt_value = goog.isArray(opt_value) || goog.isString(opt_value) ? opt_value : null;
        this.data_ = new anychart.data.Set(opt_value, opt_csvSettings).mapAs();
      }
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(
          anychart.ConsistencyState.BULLET_DATA |
          anychart.ConsistencyState.BULLET_SCALES |
          anychart.ConsistencyState.BULLET_AXES |
          anychart.ConsistencyState.BULLET_MARKERS |
          anychart.ConsistencyState.BULLET_AXES_MARKERS,
          anychart.Signal.NEEDS_REDRAW
      );
    }
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Bullet.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.BULLET_DATA |
            anychart.ConsistencyState.BULLET_SCALES |
            anychart.ConsistencyState.BULLET_AXES |
            anychart.ConsistencyState.BULLET_MARKERS |
            anychart.ConsistencyState.BULLET_AXES_MARKERS,
        anychart.Signal.NEEDS_REDRAW
    );
  }
};


/**
 * Getter/setter for bullet chart layout.
 * @param {(string|anychart.enums.Layout)=} opt_value [{@link anychart.enums.Layout}.HORIZONTAL] Layout for bullet chart.
 * @return {anychart.enums.Layout|anychart.charts.Bullet} Layout of bullet chart of self for method chaining.
 */
anychart.charts.Bullet.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value, anychart.enums.Layout.HORIZONTAL);
    if (this.layout_ != opt_value) {
      this.layout_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.BULLET_AXES |
              anychart.ConsistencyState.CHART_TITLE |
              anychart.ConsistencyState.BULLET_MARKERS |
              anychart.ConsistencyState.BULLET_AXES_MARKERS |
              anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW |
              anychart.Signal.BOUNDS_CHANGED
      );
    }
    return this;
  }
  return this.layout_;
};


/**
 * Update Bullet Chart internal elements default layout settings depend on Bullet Chart layout.
 */
anychart.charts.Bullet.prototype.updateLayoutDefaults = function() {
  var i, count, rangeLayout;
  var isHorizontal = this.isHorizontal();
  var markersLayout = /** @type {anychart.enums.Layout} */(this.layout());
  var title = this.title();
  title.setDefaultRotation(0);
  var axis = this.axis();

  if (isHorizontal) {
    rangeLayout = anychart.enums.Layout.VERTICAL;
    axis.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
    title.defaultOrientation(anychart.enums.Orientation.LEFT);
  } else {
    axis.setDefaultOrientation(anychart.enums.Orientation.LEFT);
    title.defaultOrientation(anychart.enums.Orientation.BOTTOM);
    rangeLayout = anychart.enums.Layout.HORIZONTAL;
  }

  for (i = 0, count = this.ranges_.length; i < count; i++) {
    var range = this.ranges_[i];
    if (range) {
      range.setDefaultLayout(rangeLayout);
    }
  }

  for (i = 0, count = this.markers_.length; i < count; i++) {
    var marker = this.markers_[i];
    marker.setDefaultLayout(markersLayout);
  }
};


/**
 * Whether an bullet chart is horizontal.
 * @return {boolean} If the bullet chart is horizontal.
 */
anychart.charts.Bullet.prototype.isHorizontal = function() {
  return (this.layout_ == anychart.enums.Layout.HORIZONTAL);
};


/**
 * Getter/setter for bullet scale.
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes)=} opt_value Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Bullet)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Bullet.prototype.scale = function(opt_value) {
  if (!this.scale_) {
    this.scale_ = new anychart.scales.Linear();
    this.scale_.minimumGap(0);
    this.scale_.maximumGap(0);
    this.scale_.ticks().count(3, 5);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.BULLET_SCALES |
          anychart.ConsistencyState.BULLET_AXES |
          anychart.ConsistencyState.BULLET_MARKERS |
          anychart.ConsistencyState.BULLET_AXES_MARKERS,
          anychart.Signal.NEEDS_REDRAW
      );
    }
    return this;
  }

  return this.scale_;
};


/**
 * Getter/setter for bullet chart axis.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.axes.Linear|anychart.charts.Bullet)}
 */
anychart.charts.Bullet.prototype.axis = function(opt_value) {
  if (!this.axis_) {
    this.axis_ = new anychart.core.axes.Linear();
    this.axis_.setParentEventTarget(this);
    this.registerDisposable(this.axis_);
    this.axis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(
        anychart.ConsistencyState.BULLET_AXES |
            anychart.ConsistencyState.BULLET_MARKERS |
            anychart.ConsistencyState.BULLET_AXES_MARKERS |
            anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW |
            anychart.Signal.BOUNDS_CHANGED
    );
  }

  if (goog.isDef(opt_value)) {
    this.axis_.setup(opt_value);
    return this;
  } else {
    return this.axis_;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Bullet.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.BULLET_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for bullet chart ranges.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.charts.Bullet)} Range instance by index or itself for method chaining.
 */
anychart.charts.Bullet.prototype.range = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var range = this.ranges_[index];
  if (!range) {
    range = new anychart.core.axisMarkers.Range();
    range.setup(this.defaultRangeSettings());
    this.ranges_[index] = range;
    this.registerDisposable(range);
    range.listenSignals(this.onRangeSignal_, this);
    this.invalidate(anychart.ConsistencyState.BULLET_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    range.setup(value);
    return this;
  } else {
    return range;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Bullet.prototype.onRangeSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.BULLET_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for bullet range palette.
 * @param {(anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.DistinctColors|anychart.charts.Bullet)} .
 */
anychart.charts.Bullet.prototype.rangePalette = function(opt_value) {
  if (!this.rangePalette_) {
    this.rangePalette_ = new anychart.palettes.DistinctColors();
    this.rangePalette_.items(['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']);
    this.rangePalette_.listenSignals(this.onRangePaletteSignal_, this);
    this.registerDisposable(this.rangePalette_);
  }

  if (goog.isDef(opt_value)) {
    this.rangePalette_.setup(opt_value);
    return this;
  } else {
    return this.rangePalette_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Bullet.prototype.onRangePaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BULLET_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for bullet marker palette.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value .
 * @return {!(anychart.palettes.Markers|anychart.charts.Bullet)} .
 */
anychart.charts.Bullet.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.items(['bar', 'line', 'x', 'ellipse']);
    this.markerPalette_.listenSignals(this.onPaletteSignal_, this);
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
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Bullet.prototype.onPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BULLET_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Calculate chart scale.
 */
anychart.charts.Bullet.prototype.calculate = function() {
  var i, count;
  /** @type {anychart.core.bullet.Marker} */
  var marker;
  /** @type {anychart.core.axisMarkers.Range} */
  var range;
  var scale = /** @type {anychart.scales.Base} */(this.scale());

  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
  }

  for (i = 0, count = this.markers_.length; i < count; i++) {
    marker = this.markers_[i];
    if (goog.isDefAndNotNull(marker)) {
      marker.scale(scale);
      if (marker.type() == anychart.enums.BulletMarkerType.BAR) {
        scale.extendDataRange(0);
      }
      scale.extendDataRange(marker.value());
    }
  }

  for (i = 0, count = this.ranges_.length; i < count; i++) {
    range = this.ranges_[i];
    if (goog.isDefAndNotNull(range)) {
      range.scale(scale);
      scale.extendDataRange(range.from());
      scale.extendDataRange(range.to());
    }

    if (scale.needsAutoCalc()) {
      scale.finishAutoCalc();
    }
  }

  var axis = this.axis();
  axis.scale(/** @type {anychart.scales.Base} */(this.scale()));
};


/** @inheritDoc */
anychart.charts.Bullet.prototype.drawInternal = function() {
  //we must update layout before draw
  var isHorizontal = this.isHorizontal();
  var title = this.title();
  var axis = this.axis();

  if (isHorizontal) {
    axis.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
    title.defaultOrientation(anychart.enums.Orientation.LEFT);
  } else {
    axis.setDefaultOrientation(anychart.enums.Orientation.LEFT);
    title.defaultOrientation(anychart.enums.Orientation.BOTTOM);
  }
  return anychart.charts.Bullet.base(this, 'drawInternal');
};


/**
 * Draw bullet chart c items.
 * @param {anychart.math.Rect} bounds Bounds of bullet chart content area.
 */
anychart.charts.Bullet.prototype.drawContent = function(bounds) {
  if (!this.checkDrawingNeeded())
    return;

  var i, count;

  if (this.hasInvalidationState(anychart.ConsistencyState.BULLET_DATA)) {
    this.createMarkers_();
    this.markConsistent(anychart.ConsistencyState.BULLET_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BULLET_SCALES)) {
    this.calculate();
    this.markConsistent(anychart.ConsistencyState.BULLET_SCALES);
  }

  var axis = this.axis();
  if (this.hasInvalidationState(anychart.ConsistencyState.BULLET_AXES | anychart.ConsistencyState.BOUNDS)) {
    axis.suspendSignalsDispatching();
    if (!axis.container() && axis.enabled()) {
      axis.container(this.rootElement);
    }
    axis.parentBounds(bounds);
    axis.padding(0); //todo: hack to drop axis length cache, need consultation with Sergey Medvedev to drop it.
    axis.resumeSignalsDispatching(false);
    axis.draw();
    this.markConsistent(anychart.ConsistencyState.BULLET_AXES);
  }

  var boundsWithoutAxis = axis.enabled() ? axis.getRemainingBounds() : bounds;
  if (this.hasInvalidationState(anychart.ConsistencyState.BULLET_AXES_MARKERS | anychart.ConsistencyState.BOUNDS)) {
    for (i = 0, count = this.ranges_.length; i < count; i++) {
      var range = this.ranges_[i];
      if (range) {
        range.suspendSignalsDispatching();
        range.setDefaultLayout(
            this.isHorizontal() ?
                anychart.enums.Layout.VERTICAL :
                anychart.enums.Layout.HORIZONTAL
        );
        range.setDefaultFill(/** @type {acgraph.vector.Fill} */(this.rangePalette().itemAt(i)));
        range.parentBounds(boundsWithoutAxis);
        range.container(this.rootElement);
        range.axesLinesSpace(0);
        range.draw();
        range.resumeSignalsDispatching(false);
      }
    }
    if (count > 5) {
      anychart.core.reporting.info(anychart.enums.InfoCode.BULLET_TOO_MUCH_RANGES, [count]);
    }
    this.markConsistent(anychart.ConsistencyState.BULLET_AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BULLET_MARKERS | anychart.ConsistencyState.BOUNDS)) {
    for (i = 0, count = this.markers_.length; i < count; i++) {
      var marker = this.markers_[i];
      marker.suspendSignalsDispatching();
      marker.parentBounds(boundsWithoutAxis);
      marker.setDefaultType(/** @type {anychart.enums.BulletMarkerType} */(this.markerPalette().itemAt(i)));
      marker.setDefaultLayout(/** @type {anychart.enums.Layout} */(this.layout()));
      marker.draw();
      marker.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.BULLET_MARKERS);
  }
};


/**
 * Create makers.
 * @private
 */
anychart.charts.Bullet.prototype.createMarkers_ = function() {
  goog.array.forEach(this.markers_, function(marker) {
    goog.dispose(marker);
  });
  this.markers_.length = 0;

  var iterator = this.data_.getIterator().reset();

  var rowsCount = iterator.getRowsCount();
  if (rowsCount > 2) {
    anychart.core.reporting.info(anychart.enums.InfoCode.BULLET_TOO_MUCH_MEASURES, [rowsCount]);
  }

  while (iterator.advance()) {
    this.createMarker_(iterator);
  }
};


/**
 * @param {anychart.data.Iterator} iterator Iterator.
 * @return {anychart.core.bullet.Marker} Bullet marker.
 * @private
 */
anychart.charts.Bullet.prototype.createMarker_ = function(iterator) {
  var index = iterator.getIndex();
  var marker = new anychart.core.bullet.Marker();
  marker.suspendSignalsDispatching();
  this.markers_[index] = marker;
  this.registerDisposable(marker);

  //common
  marker.scale(/** @type {anychart.scales.Base} */(this.scale()));
  marker.container(this.rootElement);

  //defaults
  var settings = this.defaultMarkerSettings();
  marker.zIndex(settings['zIndex']);
  marker.setDefaultFill(settings['fill']);
  marker.setDefaultStroke(settings['stroke']);
  marker.setDefaultType(/** @type {anychart.enums.BulletMarkerType} */(this.markerPalette().itemAt(index)));

  //settings from data
  marker.value(/** @type {string|number} */(iterator.get('value')));
  marker.type(/** @type {string} */(iterator.get('type')));
  marker.gap(/** @type {string|number} */(iterator.get('gap')));
  marker.fill(/** @type {acgraph.vector.Fill} */(iterator.get('fill')));
  marker.stroke(/** @type {acgraph.vector.Stroke} */(iterator.get('stroke')));
  marker.resumeSignalsDispatching(false);
  marker.listenSignals(this.markerInvalidated_, this);

  return marker;
};


/**
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.Bullet.prototype.markerInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.BULLET_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.charts.Bullet.prototype.makePointEvent = function(event) {
  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);

  event['pointIndex'] = pointIndex;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'pie': this,
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Select a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Bullet}  {@link anychart.charts.Bullet} instance for method chaining.
 */
anychart.charts.Bullet.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Bullet}  {@link anychart.charts.Bullet} instance for method chaining.
 */
anychart.charts.Bullet.prototype.hoverPoint = function(index, opt_event) {
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Bullet.prototype.getAllSeries = function() {
  return [this];
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.charts.Bullet|anychart.enums.HoverMode} .
 */
anychart.charts.Bullet.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


/** @inheritDoc */
anychart.charts.Bullet.prototype.serialize = function() {
  var json = anychart.charts.Bullet.base(this, 'serialize');
  json['type'] = anychart.enums.ChartTypes.BULLET;
  json['layout'] = this.layout();
  json['data'] = this.data().serialize();
  json['rangePalette'] = this.rangePalette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['scale'] = this.scale().serialize();
  json['axis'] = this.axis().serialize();
  var res = [];
  for (var i = 0; i < this.ranges_.length; i++)
    res.push(this.ranges_[i].serialize());
  json['ranges'] = res;
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Bullet.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Bullet.base(this, 'setupByJSON', config, opt_default);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeSettings(config['defaultRangeMarkerSettings']);

  if ('defaultMarkerSettings' in config)
    this.defaultMarkerSettings(config['defaultMarkerSettings']);

  this.data(config['data']);
  this.layout(config['layout']);
  this.rangePalette(config['rangePalette']);
  this.markerPalette(config['markerPalette']);

  var scaleJson = config['scale'];
  var scale;
  if (goog.isString(scaleJson)) {
    scale = anychart.scales.Base.fromString(scaleJson, null);
  } else if (goog.isObject(scaleJson)) {
    scale = anychart.scales.Base.fromString(scaleJson['type'], false);
    scale.setup(scaleJson);
  } else {
    scale = null;
  }
  if (scale)
    this.scale(scale);

  this.axis(config['axis']);
  var ranges = config['ranges'];
  if (goog.isArray(ranges))
    for (var i = 0; i < ranges.length; i++)
      this.range(i, ranges[i]);
};


//exports
(function() {
  var proto = anychart.charts.Bullet.prototype;
  proto['data'] = proto.data;//doc|ex
  proto['layout'] = proto.layout;//doc|ex
  proto['rangePalette'] = proto.rangePalette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;//doc|ex
  proto['scale'] = proto.scale;//doc|ex
  proto['axis'] = proto.axis;//doc|ex
  proto['range'] = proto.range;//doc|ex
  proto['isHorizontal'] = proto.isHorizontal;//doc
  proto['getType'] = proto.getType;//doc
})();
