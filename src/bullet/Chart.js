goog.provide('anychart.bullet.Chart');

goog.require('anychart.Chart');
goog.require('anychart.elements.Axis');
goog.require('anychart.elements.BulletMarker');
goog.require('anychart.elements.RangeMarker');
goog.require('anychart.enums');
goog.require('anychart.scales');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.MarkerPalette');
goog.require('anychart.utils.RangeColorPalette');



/**
 * Bullet chart.
 * @constructor
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @extends {anychart.Chart}
 */
anychart.bullet.Chart = function(opt_data) {
  goog.base(this);

  /**
   * @type {Array.<anychart.elements.RangeMarker>}
   * @private
   */
  this.ranges_ = [];

  /**
   * @type {Array.<anychart.elements.BulletMarker>}
   * @private
   */
  this.markers_ = [];

  /**
   * Layout of bullet chart.
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_ = anychart.enums.Layout.HORIZONTAL;

  this.data(opt_data);


  //default settings
  this.axis().stroke('0 black');
  this.background().enabled(false);
  this.legend().enabled(false);
  this.margin(10);
  var title = /** @type {anychart.elements.Title} */(this.title());
  title.text('Chart title');
  title.enabled(true);
  title.setDefaultRotation(0);
};
goog.inherits(anychart.bullet.Chart, anychart.Chart);


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.Chart states.
 * @type {number}
 */
anychart.bullet.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCALES |        // scale calculation
    anychart.ConsistencyState.AXES |          // axis
    anychart.ConsistencyState.AXES_MARKERS |  // ranges
    anychart.ConsistencyState.MARKERS |        // value markers
    anychart.ConsistencyState.DATA;           //chart data


/**
 * @type {string}
 */
anychart.bullet.Chart.CHART_TYPE = 'bullet';
anychart.chartTypesMap[anychart.bullet.Chart.CHART_TYPE] = anychart.bullet.Chart;


/**
 * Markers z-index.
 * @type {number}
 */
anychart.bullet.Chart.ZINDEX_MARKER = 2;


/**
 * Ranges z-index.
 * @type {number}
 */
anychart.bullet.Chart.ZINDEX_RANGES = 2;


/**
 * Axis z-index.
 * @type {number}
 */
anychart.bullet.Chart.ZINDEX_AXIS = 2;


/**
 * @ignoreDoc
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {!(anychart.bullet.Chart|anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.bullet.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
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
        anychart.ConsistencyState.DATA |
            anychart.ConsistencyState.SCALES |
            anychart.ConsistencyState.AXES |
            anychart.ConsistencyState.MARKERS |
            anychart.ConsistencyState.AXES_MARKERS,
        anychart.Signal.NEEDS_REDRAW
    );
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.bullet.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.DATA |
            anychart.ConsistencyState.SCALES |
            anychart.ConsistencyState.AXES |
            anychart.ConsistencyState.MARKERS |
            anychart.ConsistencyState.AXES_MARKERS,
        anychart.Signal.NEEDS_REDRAW
    );
  }
};


/**
 * Getter/setter for bullet chart layout.
 * @param {(string|anychart.enums.Layout)=} opt_value [{@link anychart.enums.Layout}.HORIZONTAL] Layout for bullet chart.
 * @return {anychart.enums.Layout|anychart.bullet.Chart} Layout of bullet chart of self for method chaining.
 */
anychart.bullet.Chart.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLayout(opt_value, anychart.enums.Layout.HORIZONTAL);
    if (this.layout_ != opt_value) {
      this.layout_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.AXES |
              anychart.ConsistencyState.TITLE |
              anychart.ConsistencyState.MARKERS |
              anychart.ConsistencyState.AXES_MARKERS |
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
anychart.bullet.Chart.prototype.updateLayoutDefaults = function() {
  var i, count, rangeLayout;
  var isHorizontal = this.isHorizontal();
  var markersLayout = /** @type {anychart.enums.Layout} */(this.layout());
  var title = this.title();
  title.setDefaultRotation(0);
  var axis = this.axis();

  if (isHorizontal) {
    rangeLayout = anychart.enums.Layout.VERTICAL;
    axis.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
    title.setDefaultOrientation(anychart.enums.Orientation.LEFT);
  } else {
    axis.setDefaultOrientation(anychart.enums.Orientation.LEFT);
    title.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
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
 * Checks for horizontal layout.
 * @return {boolean} Is layout horizontal.
 */
anychart.bullet.Chart.prototype.isHorizontal = function() {
  return (this.layout_ == anychart.enums.Layout.HORIZONTAL);
};


/**
 * Getter/setter for default bullet chart scale.
 * @param {anychart.scales.Base=} opt_value Scale to set.
 * @return {!(anychart.scales.Base|anychart.bullet.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.bullet.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.SCALES |
              anychart.ConsistencyState.AXES |
              anychart.ConsistencyState.MARKERS |
              anychart.ConsistencyState.AXES_MARKERS,
          anychart.Signal.NEEDS_REDRAW
      );
    }
    return this;
  } else {
    if (!this.scale_) {
      this.scale_ = new anychart.scales.Linear();
      this.scale_.minimumGap(0);
      this.scale_.maximumGap(0);
      this.scale_.ticks().count(3, 5);
    }
    return this.scale_;
  }
};


/**
 * Getter/setter for bullet chart axis.
 * @param {anychart.elements.Axis=} opt_value
 * @return {(anychart.elements.Axis|anychart.bullet.Chart)}
 */
anychart.bullet.Chart.prototype.axis = function(opt_value) {
  if (!this.axis_) {
    this.axis_ = new anychart.elements.Axis();
    this.axis_.zIndex(anychart.bullet.Chart.ZINDEX_AXIS);
    this.axis_.title().enabled(false);
    this.registerDisposable(this.axis_);
    this.axis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(
        anychart.ConsistencyState.AXES |
            anychart.ConsistencyState.MARKERS |
            anychart.ConsistencyState.AXES_MARKERS |
            anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW |
            anychart.Signal.BOUNDS_CHANGED
    );
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Axis) {
      this.axis_.deserialize(opt_value.serialize());
      if (this.axis_.zIndex() == 0) this.axis_.zIndex(anychart.bullet.Chart.ZINDEX_AXIS);
    } else if (goog.isObject(opt_value)) {
      this.axis_.deserialize(opt_value);
      if (this.axis_.zIndex() == 0) this.axis_.zIndex(anychart.bullet.Chart.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(opt_value)) {
      this.axis_.enabled(false);
    }
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
anychart.bullet.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Getter/setter for bullet chart ranges.
 * @param {(number|anychart.elements.RangeMarker|Object|string|null)=} opt_indexOrValue Chart range settings to set.
 * @param {(anychart.elements.RangeMarker|Object|string|null)=} opt_value Chart range settings to set.
 * @return {!(anychart.elements.RangeMarker|anychart.bullet.Chart)} Range instance by index or itself for chaining call.
 */
anychart.bullet.Chart.prototype.range = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var range = this.ranges_[index];
  if (!range) {
    range = new anychart.elements.RangeMarker();
    range.zIndex(anychart.bullet.Chart.ZINDEX_RANGES);
    this.ranges_[index] = range;
    this.registerDisposable(range);
    range.listenSignals(this.onRangeSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.RangeMarker) {
      range.deserialize(value.serialize());
      if (range.zIndex() == 0) range.zIndex(anychart.bullet.Chart.ZINDEX_RANGES);
    } else if (goog.isObject(value)) {
      range.deserialize(value);
      if (range.zIndex() == 0) range.zIndex(anychart.bullet.Chart.ZINDEX_RANGES);
    } else if (anychart.utils.isNone(value)) {
      range.enabled(false);
    }
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
anychart.bullet.Chart.prototype.onRangeSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @ignoreDoc
 * @param {(anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {!(anychart.utils.DistinctColorPalette|anychart.bullet.Chart)} .
 */
anychart.bullet.Chart.prototype.rangePalette = function(opt_value) {
  if (!this.rangePalette_) {
    this.rangePalette_ = new anychart.utils.DistinctColorPalette();
    this.rangePalette_.colors(['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']);
    this.rangePalette_.listenSignals(this.onRangePaletteSignal_, this);
    this.registerDisposable(this.rangePalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.DistinctColorPalette) {
      this.rangePalette_.cloneFrom(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.rangePalette_.colors(opt_value);
    }
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
anychart.bullet.Chart.prototype.onRangePaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart markers palette settings.
 * @param {(Array.<anychart.enums.MarkerType>|Object|anychart.utils.MarkerPalette)=} opt_value Chart marker palette settings to set.
 * @return {anychart.utils.MarkerPalette|anychart.bullet.Chart} Return current chart markers palette or itself for chaining call.
 */
anychart.bullet.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.utils.MarkerPalette();
    this.markerPalette_.markers(['bar', 'line', 'x', 'ellipse']);
    this.markerPalette_.listenSignals(this.onPaletteSignal_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.MarkerPalette) {
      this.markerPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markerPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.markerPalette_.markers(opt_value);
    }

    this.invalidate(anychart.ConsistencyState.MARKERS, anychart.Signal.NEEDS_REDRAW);
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
anychart.bullet.Chart.prototype.onPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.bullet.Chart.prototype.createLegendItemsProvider = function() {
  var data = [];
  var iterator = this.data_.getIterator().reset();


  while (iterator.advance()) {
    var index = iterator.getIndex();
    var x = iterator.get('x');

    data.push({
      'index': index,
      'text': String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x')),
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'iconStroke': 'none',
      'iconFill': iterator.get('fill'),
      'iconHatchFill': 'none',
      'iconMarker': null
    });
  }
  return data;
};


/**
 * Calculate chart scale.
 */
anychart.bullet.Chart.prototype.calculate = function() {
  var i, count;
  /** @type {anychart.elements.BulletMarker} */
  var marker;
  /** @type {anychart.elements.RangeMarker} */
  var range;
  var scale = /** @type {anychart.scales.Base} */(this.scale());

  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
  }

  for (i = 0, count = this.markers_.length; i < count; i++) {
    marker = this.markers_[i];
    if (goog.isDefAndNotNull(marker)) {
      if (!marker.scale()) {
        marker.scale(scale);
      }
      if (marker.type() == anychart.enums.BulletMarkerType.BAR) {
        scale.extendDataRange(0);
      }
      scale.extendDataRange(marker.value());
    }
  }

  for (i = 0, count = this.ranges_.length; i < count; i++) {
    range = this.ranges_[i];
    if (goog.isDefAndNotNull(range)) {
      if (!range.scale()) {
        range.scale(scale);
      }
      scale.extendDataRange(range.from());
      scale.extendDataRange(range.to());
    }

    if (scale.needsAutoCalc()) {
      scale.finishAutoCalc();
    }
  }

  var axis = this.axis();
  if (!axis.scale()) {
    axis.scale(/** @type {anychart.scales.Base} */(this.scale()));
  }
};


/** @inheritDoc */
anychart.bullet.Chart.prototype.draw = function() {
  //we should update layout before draw
  var isHorizontal = this.isHorizontal();
  var title = this.title();
  var axis = this.axis();

  if (isHorizontal) {
    axis.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
    title.setDefaultOrientation(anychart.enums.Orientation.LEFT);
  } else {
    axis.setDefaultOrientation(anychart.enums.Orientation.LEFT);
    title.setDefaultOrientation(anychart.enums.Orientation.BOTTOM);
  }
  return goog.base(this, 'draw');
};


/**
 * Draw bullet chart c items.
 * @param {anychart.math.Rect} bounds Bounds of bullet chart content area.
 */
anychart.bullet.Chart.prototype.drawContent = function(bounds) {
  if (!this.checkDrawingNeeded())
    return;

  var i, count;

  if (this.hasInvalidationState(anychart.ConsistencyState.DATA)) {
    this.createMarkers_();
    this.markConsistent(anychart.ConsistencyState.DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    this.calculate();
    this.markConsistent(anychart.ConsistencyState.SCALES);
  }

  var axis = this.axis();
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
    axis.suspendSignalsDispatching();
    if (!axis.container() && axis.enabled()) {
      axis.container(this.rootElement);
    }
    axis.parentBounds(bounds);
    axis.length(NaN); //todo: hack to drop axis length cache, need consultation with Sergey Medvedev to drop it.
    axis.resumeSignalsDispatching(false);
    axis.draw();
    this.markConsistent(anychart.ConsistencyState.AXES);
  }

  var boundsWithoutAxis = axis.getRemainingBounds();
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_MARKERS)) {
    for (i = 0, count = this.ranges_.length; i < count; i++) {
      var range = this.ranges_[i];
      if (range) {
        range.suspendSignalsDispatching();
        range.setDefaultLayout(
            this.isHorizontal() ?
                anychart.enums.Layout.VERTICAL :
                anychart.enums.Layout.HORIZONTAL
        );
        range.setDefaultFill(/** @type {acgraph.vector.Fill} */(this.rangePalette().colorAt(i)));
        range.parentBounds(boundsWithoutAxis);
        range.container(this.rootElement);
        range.axesLinesSpace(0);
        range.draw();
        range.resumeSignalsDispatching(false);
      }
    }
    if (count > 5) {
      anychart.utils.info(anychart.enums.InfoCode.BULLET_TOO_MUCH_RANGES, [count]);
    }
    this.markConsistent(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MARKERS)) {
    for (i = 0, count = this.markers_.length; i < count; i++) {
      var marker = this.markers_[i];
      marker.suspendSignalsDispatching();
      marker.parentBounds(boundsWithoutAxis);
      marker.setDefaultType(/** @type {anychart.enums.BulletMarkerType} */(this.markerPalette().markerAt(i)));
      marker.setDefaultLayout(/** @type {anychart.enums.Layout} */(this.layout()));
      marker.draw();
      marker.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.MARKERS);
  }
};


/**
 * Create makers.
 * @private
 */
anychart.bullet.Chart.prototype.createMarkers_ = function() {
  goog.array.forEach(this.markers_, function(marker) {
    goog.dispose(marker);
  });

  var iterator = this.data_.getIterator().reset();

  var rowsCount = iterator.getRowsCount();
  if (rowsCount > 2) {
    anychart.utils.info(anychart.enums.InfoCode.BULLET_TOO_MUCH_MEASURES, [rowsCount]);
  }

  while (iterator.advance()) {
    this.createMarker_(iterator);
  }
};


/**
 * @param {anychart.data.Iterator} iterator Iterator.
 * @return {anychart.elements.BulletMarker} Bullet marker.
 * @private
 */
anychart.bullet.Chart.prototype.createMarker_ = function(iterator) {
  var index = iterator.getIndex();
  var marker = new anychart.elements.BulletMarker();
  this.markers_[index] = marker;
  this.registerDisposable(marker);

  //common
  marker.scale(/** @type {anychart.scales.Base} */(this.scale()));
  marker.container(this.rootElement);

  //defaults
  marker.zIndex(anychart.bullet.Chart.ZINDEX_MARKER);
  marker.setDefaultFill('black');
  marker.setDefaultStroke('none');

  //settings from data
  marker.value(/** @type {string|number} */(iterator.get('value')));
  marker.type(/** @type {string} */(iterator.get('type')));
  marker.gap(/** @type {string|number} */(iterator.get('gap')));
  marker.fill(/** @type {acgraph.vector.Fill} */(iterator.get('fill')));
  marker.stroke(/** @type {acgraph.vector.Stroke} */(iterator.get('stroke')));

  return marker;
};


//exports
anychart.bullet.Chart.prototype['layout'] = anychart.bullet.Chart.prototype.layout;
anychart.bullet.Chart.prototype['rangePalette'] = anychart.bullet.Chart.prototype.rangePalette;
anychart.bullet.Chart.prototype['markerPalette'] = anychart.bullet.Chart.prototype.markerPalette;
anychart.bullet.Chart.prototype['scale'] = anychart.bullet.Chart.prototype.scale;
anychart.bullet.Chart.prototype['axis'] = anychart.bullet.Chart.prototype.axis;
anychart.bullet.Chart.prototype['range'] = anychart.bullet.Chart.prototype.range;
anychart.bullet.Chart.prototype['draw'] = anychart.bullet.Chart.prototype.draw;
