goog.provide('anychart.charts.Venn');

goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.Point');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.venn.Intersections');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
goog.require('anychart.math.venn');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('goog.color');
goog.require('goog.string');



/**
 * Venn chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data - Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @implements {anychart.core.IShapeManagerUser}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @extends {anychart.core.SeparateChart}
 */
anychart.charts.Venn = function(opt_data, opt_csvSettings) {
  anychart.charts.Venn.base(this, 'constructor');

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};

  /**
   * @type {anychart.data.Iterator}
   * @private
   */
  this.iterator_ = null;

  this.data(opt_data, opt_csvSettings);

  /**
   * Data wrapper from anychart data sets to venn algorithm format.
   * @type {Array.<anychart.charts.Venn.DataReflection>}
   * @private
   */
  this.dataReflections_ = [];

  /**
   * @type {anychart.core.shapeManagers.PerPoint}
   * @private
   */
  this.shapeManager_ = null;

  /**
   * Chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;

  /**
   * Circles (not intersections) map.
   * @type {Object}
   * @private
   */
  this.circlesMap_ = {};

  /**
   * @type {Object.<string, anychart.math.venn.Point>}
   * @private
   */
  this.textCenters_ = null;

  this.solution_ = null;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  /**
   * Intersections settings.
   * @type {anychart.core.venn.Intersections}
   * @private
   */
  this.intersections_ = null;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

};
goog.inherits(anychart.charts.Venn, anychart.core.SeparateChart);


//region -- Private fields
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.Venn.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.Venn.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.Venn.prototype.data_;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.charts.Venn.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


//endregion
//region -- Signals and Consistency states
/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Venn.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Venn.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.VENN_DATA |
    anychart.ConsistencyState.VENN_APPEARANCE |
    anychart.ConsistencyState.VENN_LABELS |
    anychart.ConsistencyState.VENN_MARKERS;


//endregion
//region -- Type definitions
/**
 * @typedef {{
 *   sets: Array.<string>,
 *   size: number,
 *   iteratorIndex: number
 * }}
 */
anychart.charts.Venn.DataReflection;


//endregion
//region -- Series-like behaviour
/** @inheritDoc */
anychart.charts.Venn.prototype.getType = function() {
  return anychart.enums.ChartTypes.VENN;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getAllSeries = function() {
  return [this];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.isSizeBased = function() {
  return false;
};


/**
 * Whether charts supports point settings.
 * @return {boolean}
 */
anychart.charts.Venn.prototype.supportsPointSettings = function() {
  return true;
};


/** @inheritDoc **/
anychart.charts.Venn.prototype.applyAppearanceToSeries = function(pointState) {
  var iterator = this.getIterator();
  this.shapeManager_.updateColors(pointState, /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
};


//endregion
//region -- Descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.charts.Venn.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'dataSeparator',
      anychart.core.settings.stringNormalizer,
      anychart.ConsistencyState.VENN_DATA,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE | anychart.ConsistencyState.CHART_LEGEND,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.charts.Venn, anychart.charts.Venn.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.charts.Venn.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getOption = function(name) {
  return goog.isDef(this.ownSettings[name]) ? this.ownSettings[name] : this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.check = function(flags) {
  return true;
};


//endregion
//region -- IShapeManagerUser implementation
/** @inheritDoc */
anychart.charts.Venn.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * @inheritDoc
 */
anychart.charts.Venn.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/** @inheritDoc */
anychart.charts.Venn.prototype.resolveOption = function(name, point, normalizer, opt_seriesName) {
  var iterator = this.getIterator();
  var source = this;
  if (iterator.meta('isIntersection'))
    source = this.intersections();
  //TODO (A.Kudryavtsev): Rework it to resolution chain.
  var val = point.get(name) || source.getOwnOption(name) || this.getOwnOption(name) || source.getThemeOption(name) || this.getThemeOption(name);
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getAutoHatchFill = function() {
  var iterator = this.getIterator();
  return /** @type {acgraph.vector.HatchFill} */ (iterator.meta('hatchFillPaletteFill')) ||
      /** @type {acgraph.vector.HatchFill} */ (acgraph.vector.normalizeHatchFill(anychart.charts.Venn.DEFAULT_HATCH_FILL_TYPE));
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var iterator = this.getIterator();
  var source = this.getAutoHatchFill();
  return {
    'index': iterator.getIndex(),
    'sourceHatchFill': source,
    'iterator': iterator
  };
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var iterator = this.getIterator();
  var source = opt_baseColor || iterator.meta('paletteFill') || this.getOption('color') || 'blue';
  var result = {
    'index': iterator.getIndex(),
    'sourceColor': source,
    'iterator': iterator
  };

  if (iterator.meta('isIntersection')) {
    result['parentColors'] = iterator.meta('parentColors');
    result['parentColorsMap'] = iterator.meta('parentColorsMap');
  }

  return result;
};


//endregion
//region -- Palette
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Venn)} .
 */
anychart.charts.Venn.prototype.palette = function(opt_value) {
  if (acgraph.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (acgraph.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
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
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.Venn.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (acgraph.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();

    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }

    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Venn)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Venn.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.Venn)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Venn.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.paletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Venn.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Labels
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.Venn)} .
 */
anychart.charts.Venn.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Getter/setter for series hover data labels.
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.Venn)} Labels instance or itself for chaining call.
 */
anychart.charts.Venn.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Getter/setter for series select data labels.
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.Venn)} Labels instance or itself for chaining call.
 */
anychart.charts.Venn.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Venn.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.VENN_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Markers
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.Venn)} Markers instance or itself for chaining call.
 */
anychart.charts.Venn.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    this.markers_.setParentEventTarget(this);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for hoverMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.Venn)} Markers instance or itself for chaining call.
 */
anychart.charts.Venn.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();
    this.hoverMarkers_.markConsistent(anychart.ConsistencyState.ALL);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.Venn)} Markers instance or itself for chaining call.
 */
anychart.charts.Venn.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();
    this.selectMarkers_.markConsistent(anychart.ConsistencyState.ALL);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Venn.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.VENN_MARKERS | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
  }
};


//endregion
//region -- Legend
/**
 * @inheritDoc
 */
anychart.charts.Venn.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];

  if (!this.data_)
    return data;

  this.calculate();
  this.updatePaletteFill_();

  var iterator = this.getIterator().reset();
  var x, index;

  while (iterator.advance()) {
    if (!iterator.meta('isMissing')) {
      x = iterator.get('x');
      index = iterator.getIndex();

      var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
      var itemText = null;
      if (goog.isFunction(itemsFormat)) {
        var format = this.createFormatProvider();
        format.pointInternal = this.getPoint(index);
        itemText = itemsFormat.call(format, format);
      }
      if (!goog.isString(itemText)) {
        itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
      }
      var fillResolver = anychart.color.getColorResolver(['fill'], anychart.enums.ColorType.FILL);
      var strokeResolver = anychart.color.getColorResolver(['stroke'], anychart.enums.ColorType.STROKE);
      var hatchFillResolver = anychart.color.getColorResolver(['hatchFill'], anychart.enums.ColorType.HATCH_FILL);
      var intersectionFill;

      if (iterator.meta('isIntersection')) {
        var parentColors = /** @type {Array.<acgraph.vector.Fill>} */ (iterator.meta('parentColors'));
        intersectionFill = this.blendColors_(parentColors);
      }

      var obj = {
        'enabled': true,
        'meta': {
          'pointIndex': index,
          'pointValue': iterator.get('value'),
          'series': this
        },
        'iconType': this.markers().enabled() ? iterator.meta('paletteMarkerType') : anychart.enums.LegendItemIconType.SQUARE,
        'text': itemText,
        'iconStroke': iterator.get('stroke') || strokeResolver(this, anychart.PointState.NORMAL, true),
        'iconFill': iterator.get('fill') || intersectionFill || fillResolver(this, anychart.PointState.NORMAL, true),
        'iconHatchFill': iterator.get('hatchFill') || hatchFillResolver(this, anychart.PointState.NORMAL, true)
      };
      goog.object.extend(obj, legendItem);
      obj['sourceUid'] = goog.getUid(this);
      obj['sourceKey'] = index;
      data.push(/** @type {anychart.core.ui.Legend.LegendItemProvider} */ (obj));

    }
  }

  return data;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;

  var tag = anychart.utils.extractTag(event['domTarget']);
  if (tag)
    tag.series = this;
};


//endregion
//region -- Data
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.Venn|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.Venn.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (acgraph.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (acgraph.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.VENN_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Listener for data invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.charts.Venn.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.VENN_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.charts.Venn.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


/**
 * Data reflection comparator.
 * @param {anychart.charts.Venn.DataReflection} val1 - First value.
 * @param {anychart.charts.Venn.DataReflection} val2 - Second value.
 * @return {number}
 * @private
 */
anychart.charts.Venn.prototype.dataReflectionSort_ = function(val1, val2) {
  return val1.sets.length - val2.sets.length;
};


//endregion
//region -- Intersections
/**
 * Intersections settings getter/setter.
 * @param {Object=} opt_value - Settings object.
 * @return {anychart.core.venn.Intersections|anychart.charts.Venn} - Current value or itself for chaining.
 */
anychart.charts.Venn.prototype.intersections = function(opt_value) {
  if (!this.intersections_) {
    this.intersections_ = new anychart.core.venn.Intersections(this);
    this.intersections_.listenSignals(this.intersectionsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.intersections_.setup(opt_value);
    return this;
  }
  return this.intersections_;
};


/**
 * Internal intersections invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.charts.Venn.prototype.intersectionsInvalidated_ = function(event) {
  var state = 0;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS))
    state |= anychart.ConsistencyState.VENN_LABELS;

  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_MARKERS))
    state |= anychart.ConsistencyState.VENN_MARKERS;

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE))
    state |= anychart.ConsistencyState.VENN_APPEARANCE;

  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND))
    state |= anychart.ConsistencyState.CHART_LEGEND;

  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Interactivity
/** @inheritDoc */
anychart.charts.Venn.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };
  var tag = anychart.utils.extractTag(res['domTarget']);
  res['pointIndex'] = anychart.utils.toNumber(tag.index);
  return res;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.charts.Venn.prototype.makePointEvent = function(event) {
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
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getPoint = function(index) {
  return new anychart.core.Point(this, index);
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Venn} - Self for method chaining.
 */
anychart.charts.Venn.prototype.hoverPoint = function(index, opt_event) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);

  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);
  }
  return this;
};


/**
 * Hovers all points of chart.
 * @return {!anychart.charts.Venn}
 */
anychart.charts.Venn.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


/**
 * If index is passed, hovers a point of the chart by its index, else hovers all points of the chart.
 * @param {(number|Array<number>)=} opt_indexOrIndexes - Point index or array of indexes.
 * @return {!anychart.charts.Venn} - Itself for chaining.
 */
anychart.charts.Venn.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) || !this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.charts.Venn.prototype.applyAppearanceToPoint = function(pointState) {
  var iterator = this.getIterator();
  this.shapeManager_.updateColors(pointState, /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
  this.drawLabel_(pointState, iterator);
  this.drawMarker_(pointState, iterator);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.charts.Venn.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * @param {(anychart.enums.HoverMode)=} opt_value Selection mode.
 * @return {anychart.charts.Venn|anychart.enums.HoverMode} .
 */
anychart.charts.Venn.prototype.hoverMode = function(opt_value) {
  return /** @type {anychart.enums.HoverMode} */ (this.interactivity().hoverMode(opt_value));
};


/**
 * @param {(anychart.enums.SelectionMode|string)=} opt_value Selection mode.
 * @return {anychart.charts.Venn|anychart.enums.SelectionMode|null} .
 */
anychart.charts.Venn.prototype.selectionMode = function(opt_value) {
  return /** @type {anychart.enums.SelectionMode} */ (this.interactivity().selectionMode(opt_value));
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.charts.Venn} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.charts.Venn.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  var unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  }

  return this;
};


/**
 * Selects all points of the chart.
 * @return {!anychart.charts.Venn} - .
 */
anychart.charts.Venn.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.SELECT);

  return this;
};


/**
 * Imitates selects a point of the chart by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.charts.Venn} - itself.
 */
anychart.charts.Venn.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else
    this.selectSeries();

  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Venn.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);
};


/**
 * Returns point state by it's index.
 * @param {number} index
 * @return {anychart.PointState|number}
 */
anychart.charts.Venn.prototype.getPointState = function(index) {
  return this.state.getPointStateByIndex(index);
};


//endregion
//region -- Tooltip
/**
 * Create format provider.
 * @param {boolean=} opt_force - create context provider forcibly.
 * @return {Object} - Object with info for labels formatting.
 * @protected
 */
anychart.charts.Venn.prototype.createFormatProvider = function(opt_force) {
  var iterator = this.getIterator();

  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var x = iterator.get('x');
  var name = goog.isDef(iterator.get('name')) ? iterator.get('name') : x;
  var values = {
    'x': {value: x, type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: name, type: anychart.enums.TokenType.STRING},
    'isIntersection': {value: !!iterator.meta('isIntersection'), type: anychart.enums.TokenType.STRING}
  };

  return this.pointProvider_.propagate(values);
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.charts.Venn.prototype.showTooltip = function(opt_event) {
  if (opt_event && opt_event['target'] == this.legend()) {
    return;
  }

  var iterator = this.getIterator();

  // var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(iterator.meta('tooltip'));
  tooltip.hide(true);
  var formatProvider = this.createFormatProvider();
  if (opt_event) {
    tooltip.showFloat(opt_event['clientX'], opt_event['clientY'], formatProvider);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.Venn.prototype.updateTooltip = function(event) {
  var iterator = this.getIterator();
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(iterator.meta('tooltip'));
  tooltip.updatePosition(event['clientX'], event['clientY']);
};


//endregion
//region -- Draw and calculation
/**
 * Preprocessing with two passages. Finds incorrect data and marks it as missing.
 * @private
 */
anychart.charts.Venn.prototype.findMissings_ = function() {
  var iterator = this.getResetIterator();

  var singleCirclesMap = {};
  var splittedDataArr = [];
  var iterX, iterIndex;

  while (iterator.advance()) { //first passage.
    iterX = iterator.get('x');
    iterIndex = iterator.getIndex();
    if (goog.isArray(iterX)) {
      if (iterX.length == 1)
        singleCirclesMap[String(iterX[0])] = iterX;
      splittedDataArr[iterIndex] = iterX;
    } else {
      var x = String(iterX);
      var separator = this.getOption('dataSeparator');
      var splittedData = x.split(separator);
      if (splittedData.length == 1)
        singleCirclesMap[x] = x;
      splittedDataArr[iterIndex] = splittedData;
    }
  }

  for (var i = 0; i < splittedDataArr.length; i++) {
    var splitted = splittedDataArr[i];
    if (splitted && splitted.length > 1) {
      for (var j = 0; j < splitted.length; j++) {
        var val = splitted[j];
        if (!(val in singleCirclesMap)) {
          iterator.select(i);
          iterator.meta('isMissing', true);
          break;
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Venn.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.VENN_DATA) && this.data_) {
    this.invalidate(anychart.ConsistencyState.VENN_APPEARANCE);
    this.findMissings_();
    this.dataReflections_.length = 0;
    this.circlesMap_ = {};
    this.solution_ = null;
    var iterator = this.getResetIterator();
    var separator = this.getOption('dataSeparator');

    while (iterator.advance()) {
      if (!iterator.meta('isMissing')) {
        var iterX = iterator.get('x');
        var value = Number(iterator.get('value'));
        var index = iterator.getIndex();
        var reflection = /** @type {anychart.charts.Venn.DataReflection} */ ({size: value, iteratorIndex: index});
        if (goog.isArray(iterX)) {
          reflection.sets = iterX;
          if (iterX.length == 1) {
            this.circlesMap_[iterX.join(separator)] = reflection;
          }
        } else {
          var x = String(iterX);
          var splittedData = x.split(separator);
          reflection.sets = splittedData;
          if (splittedData.length == 1) {
            this.circlesMap_[x] = reflection;
          }
        }

        this.dataReflections_.push(reflection);
      }
    }

    //This sort allows to get raw data order independence.
    goog.array.stableSort(this.dataReflections_, this.dataReflectionSort_);

    this.updatePaletteFill_();

    var solution = anychart.math.venn.venn(this.dataReflections_);
    this.solution_ = anychart.math.venn.normalizeSolution(solution, Math.PI / 2, null);

    this.markConsistent(anychart.ConsistencyState.VENN_DATA);
  }
};


/**
 * Updates palette fill.
 * @private
 */
anychart.charts.Venn.prototype.updatePaletteFill_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.VENN_APPEARANCE)) {
    var iterator = this.getResetIterator();
    for (var i = 0; i < this.dataReflections_.length; i++) {
      var refl = this.dataReflections_[i];
      var iteratorIndex = refl.iteratorIndex;
      iterator.select(iteratorIndex);
      var sets = refl.sets;

      var set;
      var isIntersection = false;
      var tooltip = this.tooltip();
      var fillResolver = anychart.color.getColorResolver(['fill'], anychart.enums.ColorType.FILL);
      // var hatchFillResolver = anychart.color.getColorResolver(['hatchFill'], anychart.enums.ColorType.HATCH_FILL);
      if (sets.length == 1) { //Main circle, not an intersection.
        var color = this.palette().itemAt(i);
        iterator.meta('paletteFill', color);
        set = sets[0];
        this.circlesMap_[set].paletteFill = color;
        this.circlesMap_[set].resolvedFill = fillResolver(this, anychart.PointState.NORMAL, true);
      } else {
        var parentColors = [];
        var parentColorsMap = {};
        for (var j = 0; j < sets.length; j++) {
          set = sets[j];
          var parent = this.circlesMap_[set];
          parentColors.push(parent.resolvedFill);
          parentColorsMap[set] = parent.resolvedFill;
        }
        iterator.meta('parentColors', parentColors);
        iterator.meta('parentColorsMap', parentColorsMap);
        isIntersection = true;
        tooltip = this.intersections().tooltip();
      }
      iterator.meta('hatchFillPaletteFill', iterator.get('hatchFill') || this.hatchFillPalette().itemAt(i));
      iterator.meta('isIntersection', isIntersection);
      iterator.meta('paletteMarkerType', this.markerPalette().itemAt(i));
      iterator.meta('tooltip', tooltip);
    }
  }
};


/** @inheritDoc */
anychart.charts.Venn.prototype.drawContent = function(bounds) {
  this.calculate();

  var i, refl, iteratorIndex, iterator;

  if (!this.shapeManager_) {
    this.shapeManager_ = new anychart.core.shapeManagers.PerPoint(this, [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ], true);

    this.shapeManager_.setContainer(this.rootElement);
  }

  if (bounds.width > 0 && bounds.height > 0) {
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
      this.shapeManager_.clearShapes();
      var circles = anychart.math.venn.scaleSolution(this.solution_, bounds.width, bounds.height, 0);
      this.textCenters_ = anychart.math.venn.computeTextCentres(circles, this.dataReflections_);

      for (i = 0; i < this.dataReflections_.length; i++) {
        refl = this.dataReflections_[i];
        iteratorIndex = refl.iteratorIndex;
        iterator = this.getIterator();
        iterator.select(iteratorIndex);
        var sets = refl.sets;

        var setData = [];
        var set;
        if (sets.length == 1) { //Main circle, not an intersection.
          set = sets[0];
          setData.push(circles[set]);
        } else {
          for (var j = 0; j < sets.length; j++) {
            set = sets[j];
            setData.push(circles[set]);
          }
        }

        var stats = /** @type {anychart.math.venn.Stats} */ ({});
        anychart.math.venn.intersectionArea(setData, stats);

        var group = this.shapeManager_.getShapesGroup(this.getPointState(iteratorIndex));
        var fillPath = /** @type {acgraph.vector.Path} */ (group['fill']);
        var hatchFillPath = /** @type {acgraph.vector.Path} */ (group['hatchFill']);
        var strokePath = /** @type {acgraph.vector.Path} */ (group['stroke']);
        this.drawArc_(fillPath, stats, bounds);
        this.drawArc_(hatchFillPath, stats, bounds);
        this.drawArc_(strokePath, stats, bounds);
      }
      this.invalidate(anychart.ConsistencyState.VENN_LABELS | anychart.ConsistencyState.VENN_MARKERS);
      this.markConsistent(anychart.ConsistencyState.VENN_APPEARANCE);
    }

    var textCenter, positionProvider;
    if (this.hasInvalidationState(anychart.ConsistencyState.VENN_LABELS)) {
      this.labels().clear();

      this.labels().container(this.rootElement);

      for (i = 0; i < this.dataReflections_.length; i++) {
        refl = this.dataReflections_[i];
        iteratorIndex = refl.iteratorIndex;
        iterator = this.getIterator();
        iterator.select(iteratorIndex);
        textCenter = this.textCenters_[iteratorIndex];
        var labelsFormatProvider = this.createFormatProvider(true);
        positionProvider = {
          'value': {
            'x': bounds.left + textCenter.x,
            'y': bounds.top + textCenter.y
          }
        };
        var label = this.labels().add(labelsFormatProvider, positionProvider, iteratorIndex);
        iterator.meta('label', label);
        this.drawLabel_(this.state.getPointStateByIndex(iteratorIndex), iterator);
      }

      this.labels().draw();
      this.intersections().markLabelsConsistent();
      this.markConsistent(anychart.ConsistencyState.VENN_LABELS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.VENN_MARKERS)) {
      this.markers().container(this.rootElement);
      this.markers().clear();

      for (i = 0; i < this.dataReflections_.length; i++) {
        refl = this.dataReflections_[i];
        iteratorIndex = refl.iteratorIndex;
        iterator = this.getIterator();
        iterator.select(iteratorIndex);
        textCenter = this.textCenters_[iteratorIndex];
        positionProvider = {
          'value': {
            'x': bounds.left + textCenter.x + 0.5,
            'y': bounds.top + textCenter.y + 0.5
          }
        };
        var marker = this.markers().add(positionProvider, iteratorIndex);
        iterator.meta('marker', marker);
        this.drawMarker_(this.state.getPointStateByIndex(iteratorIndex), iterator);
      }

      this.markers().draw();
      this.intersections().markMarkersConsistent();
      this.markConsistent(anychart.ConsistencyState.VENN_MARKERS);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.VENN_APPEARANCE)) {
      this.updatePaletteFill_();

      iterator = this.getResetIterator();
      while (iterator.advance()) {
        this.shapeManager_.updateColors(this.getPointState(iterator.getIndex()),
            /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
      }
      this.markConsistent(anychart.ConsistencyState.VENN_APPEARANCE);
    }
  }

};


/**
 *
 * @param {Array.<acgraph.vector.Fill>} colors - Colors to blend.
 * @private
 * @return {acgraph.vector.Fill} - .
 */
anychart.charts.Venn.prototype.blendColors_ = function(colors) {
  if (colors.length) {
    var blended;
    for (var i = 0; i < colors.length; i++) {
      var norm = /** @type {acgraph.vector.SolidFill} */ (acgraph.vector.normalizeFill(colors[i]));
      blended = blended ? anychart.color.blend(blended, norm) : norm;
    }
    return blended || 'black';
  } else {
    return 'black';
  }
};


/**
 * Draws arcs.
 * @param {acgraph.vector.Path} path - Arc path.
 * @param {anychart.math.venn.Stats} stats - Stats storage.
 * @param {anychart.math.Rect} bounds - Bounds.
 * @private
 */
anychart.charts.Venn.prototype.drawArc_ = function(path, stats, bounds) {
  var arcs = stats.arcs;
  if (!arcs.length)
    return;

  var pixelShift = 0;

  if (arcs.length == 1) {
    var circle = arcs[0].circle;
    path.moveTo(circle.x + pixelShift + circle.radius + bounds.left, circle.y + pixelShift + bounds.top)
        .arcTo(circle.radius, circle.radius, 0, 360);
  } else if (arcs.length > 1) {
    path.moveTo(arcs[0].p2.x + bounds.left, arcs[0].p2.y + bounds.top);
    for (var i = 0; i < arcs.length; ++i) {
      var arc = arcs[i];
      path.arcToByEndPoint(arc.p1.x + bounds.left, arc.p1.y + bounds.top, arc.circle.radius, arc.circle.radius, arc.width > arc.circle.radius, true);
    }
    path.close();
  }
};


/**
 * Draws a label with its state settings.
 * @param {anychart.PointState|number} state - State.
 * @param {!anychart.data.IIterator} iterator - Iterator.
 * @private
 */
anychart.charts.Venn.prototype.drawLabel_ = function(state, iterator) {
  var label = /** @type {anychart.core.ui.LabelsFactory.Label} */ (iterator.meta('label'));
  if (label && !iterator.meta('isMissing')) {
    var source = iterator.meta('isIntersection') ? this.intersections() : this;
    state = anychart.core.utils.InteractivityState.clarifyState(state);

    var hovered = this.state.isStateContains(state, anychart.PointState.HOVER);
    var selected = this.state.isStateContains(state, anychart.PointState.SELECT);

    var pointLabel = iterator.get('label') || null;
    var hoverLabel = iterator.get('hoverLabel') || null;
    var selectLabel = iterator.get('selectLabel') || null;

    var pointState = selected ? selectLabel : hovered ? hoverLabel : null;
    var pointNormal = pointLabel;

    var intersectionsState = selected ? source.selectLabels() : hovered ? source.hoverLabels() : null;
    var intersectionsNormal = source.labels();

    var chartState = selected ? this.selectLabels() : hovered ? this.hoverLabels() : null;
    var chartNormal = this.labels();

    var intersectionsStateTheme = selected ? source.selectLabels().themeSettings : hovered ? source.hoverLabels().themeSettings : null;
    var intersectionsNormalTheme = source.labels().themeSettings;
    var chartStateTheme = selected ? this.selectLabels().themeSettings : hovered ? this.hoverLabels().themeSettings : null;
    var chartNormalTheme = this.labels().themeSettings;

    var pointStateLabelsEnabled = pointState && goog.isDef(pointState['enabled']) ? pointState['enabled'] : null;
    var normalPointLabelsEnabled = pointNormal && goog.isDef(pointNormal['enabled']) ? pointNormal['enabled'] : null;
    var intersectionsStateLabelsEnabled = intersectionsState && !goog.isNull(intersectionsState.enabled()) ? intersectionsState.enabled() : null;
    var intersectionsNormalEnabled = intersectionsNormal && !goog.isNull(intersectionsNormal.enabled()) ? intersectionsNormal.enabled() : null;
    var chartStateLabelsEnabled = chartState ? chartState.enabled() : null;
    var chartNormalEnabled = chartNormal.enabled();

    var draw = false;
    if (goog.isNull(pointStateLabelsEnabled)) {
      if (goog.isNull(normalPointLabelsEnabled)) {
        if (goog.isNull(intersectionsStateLabelsEnabled)) {
          if (goog.isNull(intersectionsNormalEnabled)) {
            if (goog.isNull(chartStateLabelsEnabled)) {
              draw = chartNormalEnabled;
            } else {
              draw = chartStateLabelsEnabled;
            }
          } else {
            draw = intersectionsNormalEnabled;
          }
        } else {
          draw = intersectionsStateLabelsEnabled;
        }
      } else {
        draw = normalPointLabelsEnabled;
      }
    } else {
      draw = pointStateLabelsEnabled;
    }

    if (draw) {
      label.resetSettings();
      label.enabled(true);

      label.state('labelOwnSettings', label.ownSettings, 0);
      label.state('pointState', /** @type {?Object} */ (pointState), 1);
      label.state('pointNormal', /** @type {?Object} */ (pointLabel), 2);

      label.state('intersectionsState', intersectionsState, 3);
      label.state('intersectionsNormal', intersectionsNormal, 4);
      label.state('chartState', chartState, 5);
      label.state('chartNormal', chartNormal, 6);

      label.state('intersectionsStateTheme', intersectionsStateTheme, 7);
      label.state('chartStateTheme', chartStateTheme, 8);
      label.state('auto', label.autoSettings, 9);

      label.state('intersectionsNormalTheme', intersectionsNormalTheme || null, 10);
      label.state('chartNormalTheme', chartNormalTheme || null, 11);
    } else {
      label.enabled(false);
    }
    label.draw();


  }
};


/**
 * Draws a label with its state settings.
 * @param {anychart.PointState|number} state - State.
 * @param {!anychart.data.IIterator} iterator - Iterator.
 * @private
 */
anychart.charts.Venn.prototype.drawMarker_ = function(state, iterator) {
  var marker = iterator.meta('marker');

  if (marker && !iterator.meta('isMissing')) {
    var isIntersection = !!iterator.meta('isIntersection');
    var source = isIntersection ? this.intersections() : this;
    var chartFactory = this.markers();
    state = anychart.core.utils.InteractivityState.clarifyState(state);

    var hovered = this.state.isStateContains(state, anychart.PointState.HOVER);
    var selected = this.state.isStateContains(state, anychart.PointState.SELECT);

    var pointMarker = iterator.get('marker') || {};
    var hoverMarker = iterator.get('hoverMarker');
    var selectMarker = iterator.get('selectMarker');
    if (selected) {
      goog.object.extend(/** @type {Object} */ (pointMarker), /** @type {Object} */ (selectMarker) || {});
    } else if (hovered) {
      goog.object.extend(/** @type {Object} */ (pointMarker), /** @type {Object} */ (hoverMarker) || {});
    }
    var extendedPointMarker = pointMarker;

    var pointState = selected ? selectMarker : hovered ? hoverMarker : pointMarker;
    var sourceState = selected ? source.selectMarkers() : hovered ? source.hoverMarkers() : source.markers();
    var chartState = selected ? this.selectMarkers() : hovered ? this.hoverMarkers() : this.markers();

    var pointMarkersEnabled = pointState && goog.isDef(pointState['enabled']) ? pointState['enabled'] : null;
    var sourceMarkersEnabled = sourceState.enabled();

    var draw = false;

    if (goog.isNull(pointMarkersEnabled)) { //no point state specified.
      if (goog.isNull(sourceMarkersEnabled)) { //should take settings from parent.
        draw = chartFactory.enabled();
      } else {
        draw = sourceMarkersEnabled;
      }
    } else {
      draw = pointMarkersEnabled;
    }

    if (draw) {
      var chartNormalMarkerConfig = this.markers().serialize();
      var chartStateMarkerConfig = selected ? this.selectMarkers().serialize() : hovered ? this.hoverMarkers().serialize() : {};

      var intersectionNormalConfig = isIntersection ? this.intersections().markers().serialize() : {};
      var intersectionStateConfig = isIntersection ? sourceState.serialize() : {};

      goog.object.extend(/** @type {Object} */ (chartNormalMarkerConfig), /** @type {Object} */ (chartStateMarkerConfig),
          /** @type {Object} */ (intersectionNormalConfig), /** @type {Object} */ (intersectionStateConfig),
          /** @type {Object} */ (extendedPointMarker));
      pointMarker = chartNormalMarkerConfig;

      if (!goog.isDef(pointMarker.type)) {
        pointMarker.type = sourceState.getType() || chartState.getType() || iterator.meta('paletteMarkerType');
      }

      if (!goog.isDef(pointMarker.fill)) {
        var intersectionFill = iterator.meta('paletteFill');
        if (isIntersection) {
          var parentColors = /** @type {Array.<acgraph.vector.Fill>} */ (iterator.meta('parentColors'));
          intersectionFill = this.blendColors_(parentColors);
          intersectionFill.opacity = 1; //TODO (A.Kudryavtsev): is it correct here?
        }
        pointMarker.fill = sourceState.getFill() || chartState.getFill() || intersectionFill;
      }

      marker.resetSettings();
      marker.enabled(true);
      marker.currentMarkersFactory(sourceState);
      marker.setSettings(/** @type {Object} */(pointMarker), /** @type {Object} */(pointState));

    } else {
      marker.currentMarkersFactory(sourceState);
      marker.enabled(false);
    }
    marker.draw();
  }

};


//endregion
//region -- Serialization/Deserialization
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.charts.Venn.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.charts.Venn.prototype.serialize = function() {
  var json = anychart.charts.Venn.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Venn');

  json['type'] = this.getType();
  json['data'] = this.data().serialize();

  json['labels'] = this.labels().serialize();
  json['selectLabels'] = this.selectLabels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();

  json['markers'] = this.markers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();

  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();

  json['intersections'] = this.intersections().serialize();

  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Venn.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Venn.base(this, 'setupByJSON', config, opt_default);
  if (opt_default)
    this.themeSettings = config;
  else
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);

  this.data(config['data']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.hoverLabels().setupInternal(!!opt_default, config['hoverLabels']);
  this.selectLabels().setupInternal(!!opt_default, config['selectLabels']);

  this.palette().setupInternal(!!opt_default, config['palette']);
  this.markerPalette().setupInternal(!!opt_default, config['markerPalette']);
  this.hatchFillPalette().setupInternal(!!opt_default, config['hatchFillPalette']);

  this.markers().setupInternal(!!opt_default, config['markers']);
  this.hoverMarkers().setupInternal(!!opt_default, config['hoverMarkers']);
  this.selectMarkers().setupInternal(!!opt_default, config['selectMarkers']);

  this.intersections().setupInternal(!!opt_default, config['intersections']);
};


//endregion

//exports
(function() {
  var proto = anychart.charts.Venn.prototype;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
  proto['intersections'] = proto.intersections;

  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['palette'] = proto.palette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['markerPalette'] = proto.markerPalette;

  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
})();

