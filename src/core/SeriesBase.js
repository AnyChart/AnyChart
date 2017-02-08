goog.provide('anychart.core.SeriesBase');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.BubblePoint');
goog.require('anychart.core.SeriesPoint');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.LegendContextProvider');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.SeriesA11y');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');



//----------------------------------------------------------------------------------------------------------------------
//
//  COMPLETELY TRANSFERED TO ANYCHART.CORE.SERIES
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Base class for all base series.<br/>
 * Base class defines common methods, such as those for:
 * <ul>
 *   <li>Binding series to a scale: <i>xScale, yScale</i></li>
 *   <li>Base color settings: <i>color</i></li>
 * </ul>
 * You can also obtain <i>getIterator, getResetIterator</i> iterators here.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.core.SeriesBase = function(opt_data, opt_csvSettings) {
  anychart.core.SeriesBase.base(this, 'constructor');
  this.data(opt_data || null, opt_csvSettings);

  this.statistics_ = {};

  /**
   * @type {anychart.core.utils.SeriesA11y}
   * @private
   */
  this.a11y_ = null;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);
};
goog.inherits(anychart.core.SeriesBase, anychart.core.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.SeriesBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_UPDATE_A11Y;


/**
 * Consistency states supported by series.
 * @type {number}
 */
anychart.core.SeriesBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.A11Y;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.SeriesBase.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.core.SeriesBase.prototype.name_;


/**
 * Series index.
 * @type {number}
 * @private
 */
anychart.core.SeriesBase.prototype.index_;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.core.SeriesBase.prototype.meta_;


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @protected
 */
anychart.core.SeriesBase.prototype.rawData;


/**
 * @type {!anychart.data.View}
 * @protected
 */
anychart.core.SeriesBase.prototype.dataInternal;


/**
 * @type {anychart.data.View}
 * @protected
 */
anychart.core.SeriesBase.prototype.parentView;


/**
 * @type {goog.Disposable}
 * @protected
 */
anychart.core.SeriesBase.prototype.parentViewToDispose;


/**
 *
 * @type {!anychart.data.Iterator}
 * @protected
 */
anychart.core.SeriesBase.prototype.iterator;


/**
 * @type {Object}
 * @private
 */
anychart.core.SeriesBase.prototype.statistics_;


/**
 * @type {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.SeriesBase.prototype.tooltip_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.SeriesBase.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.SeriesBase.prototype.hoverLabels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.SeriesBase.prototype.selectLabels_ = null;


/**
 * @type {Array.<number>}
 */
anychart.core.SeriesBase.prototype.stateIndex;


/**
 * @type {Array.<anychart.PointState>}
 */
anychart.core.SeriesBase.prototype.stateValue;


/**
 * @type {anychart.PointState|number}
 */
anychart.core.SeriesBase.prototype.seriesState;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.SeriesBase.prototype.fill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.SeriesBase.prototype.hoverFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.SeriesBase.prototype.selectFill_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.core.SeriesBase.prototype.stroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.SeriesBase.prototype.hoverStroke_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.SeriesBase.prototype.selectStroke_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.SeriesBase.prototype.hatchFill_;


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.SeriesBase.prototype.hoverHatchFill_;


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.SeriesBase.prototype.selectHatchFill_;


/**
 * Series color. See this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.SeriesBase.prototype.color_ = null;


/**
 * Series color from chart. See. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.SeriesBase.prototype.autoColor_ = null;


/**
 * Hatch fill type from chart.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.core.SeriesBase.prototype.autoHatchFill;


/**
 * Root layer.
 * @type {acgraph.vector.ILayer}
 * @protected
 */
anychart.core.SeriesBase.prototype.rootLayer = null;


/**
 * Gets root layer of series.
 * @return {acgraph.vector.ILayer}
 */
anychart.core.SeriesBase.prototype.getRootLayer = function() {
  return this.rootLayer;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.SeriesBase.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * Tester if it is series.
 * @return {boolean}
 */
anychart.core.SeriesBase.prototype.isSeries = function() {
  return true;
};


/**
 * Tester if it is chart.
 * @return {boolean}
 */
anychart.core.SeriesBase.prototype.isChart = function() {
  return false;
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.SeriesBase.prototype.isSizeBased = function() {
  return false;
};


/**
 * Sets the chart series belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.SeriesBase.prototype.setChart = function(chart) {
  this.chart = chart;
  this.a11y().parentA11y(/** @type {anychart.core.utils.A11y} */ (/** @type {anychart.core.Chart} */ (this.chart).a11y()));
  this.a11y().parentA11y().applyChangesInChildA11y();
  this.tooltip().parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart.tooltip()));
};


/**
 * Get the chart series belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.SeriesBase.prototype.getChart = function() {
  return this.chart;
};


/**
 * Returns type of current series.
 * @return {string} Series type.
 */
anychart.core.SeriesBase.prototype.getType = goog.abstractMethod;


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.SeriesBase.prototype.createFormatProvider = goog.abstractMethod;


/**
 * If the series has its own root layer.
 * @return {boolean}
 */
anychart.core.SeriesBase.prototype.hasOwnLayer = function() {
  return true;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series mapping.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.SeriesBase|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.SeriesBase.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.registerDisposable(this.parentViewToDispose);
      this.dataInternal = this.parentView;
      this.dataInternal.listenSignals(this.dataInvalidated_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA | anychart.ConsistencyState.A11Y,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
    }
    return this;
  }
  return this.dataInternal;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.SeriesBase.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.SeriesBase.prototype.getIterator = function() {
  return this.iterator || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.SeriesBase.prototype.getResetIterator = function() {
  return this.iterator = this.data().getIterator();
};


/**
 * Gets asked value from data. Stab for SeriesPoint class where direct index reference needed.
 * @param {number} index
 * @param {string} name
 * @return {*}
 */
anychart.core.SeriesBase.prototype.getValueInternal = function(index, name) {
  return this.data().get(index, name);
};


/**
 * Sets asked value to data. Stab for SeriesPoint class where direct index reference needed.
 * @param {number} index
 * @param {string} name
 * @param {*} value
 */
anychart.core.SeriesBase.prototype.setValueInternal = function(index, name, value) {
  this.data().set(index, name, value);
};


/**
 * Gets stacked zero from data by index. Stab for SeriesPoint class where direct index reference needed.
 * @param {number} index
 * @return {*}
 */
anychart.core.SeriesBase.prototype.getStackedZero = function(index) {
  return this.data().meta(index, 'zero');
};


/**
 * Gets stacked value from data by index. Stab for SeriesPoint class where direct index reference needed.
 * @param {number} index
 * @return {*}
 */
anychart.core.SeriesBase.prototype.getStackedValue = function(index) {
  return this.data().meta(index, 'value');
};


/**
 * Sets/gets series meta data.
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.core.SeriesBase.prototype.meta = function(opt_object_or_key, opt_value) {
  if (!this.meta_) this.meta_ = {};

  if (goog.isDef(opt_object_or_key)) {
    if (goog.isDef(opt_value)) {
      var value = this.meta_[opt_object_or_key];
      if (!goog.isDef(value) || value != opt_value) {
        this.meta_[opt_object_or_key] = opt_value;
        //TODO: send signal to redraw components that depend on meta (legend)
      }
      return this;
    } else {
      if (goog.isObject(opt_object_or_key)) {
        if (this.meta_ != opt_object_or_key) {
          this.meta_ = opt_object_or_key;
          //TODO: send signal to redraw components that depend on meta (legend)
        }
        return this;
      } else {
        return this.meta_[opt_object_or_key];
      }
    }
  } else {
    return this.meta_;
  }
};


/**
 * Sets/gets series name.
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.core.SeriesBase|undefined)} Series name value or itself for method chaining.
 */
anychart.core.SeriesBase.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
      //TODO: send signal to redraw name dependent components, series, legend etc
    }
    return this;
  } else {
    return this.name_ || ('Series ' + this.getIndex());
  }
};


/**
 * Sets/gets series number.
 * @param {number=} opt_value
 * @return {anychart.core.SeriesBase|number}
 */
anychart.core.SeriesBase.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.index_ != opt_value) {
      this.index_ = opt_value;
    }
    return this;
  } else {
    return this.index_;
  }
};


/**
 * For compatibility with core.series.Base.
 * @return {number}
 */
anychart.core.SeriesBase.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Getter/setter for series id.
 * @param {(string|number)=} opt_value Id of the series.
 * @return {string|number|anychart.core.SeriesBase} Id or self for chaining.
 */
anychart.core.SeriesBase.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.id_ != opt_value) {
      this.id_ = opt_value;
    }
    return this;
  } else {
    return this.id_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series statistics.
 * @param {string=} opt_name Statistics parameter name.
 * @param {*=} opt_value Statistics parameter value.
 * @return {anychart.core.SeriesBase|*}
 */
anychart.core.SeriesBase.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Calculate series statistics.
 * TODO (A.Kudryavtsev): In current date (16 Mar 2016) anychart.core.cartesian.series.Base has pretty specific
 * TODO (A.Kudryavtsev): calculation mechanism (calculates drawing plans). It calculates all statistics there in singe passage.
 */
anychart.core.SeriesBase.prototype.calculateStatistics = goog.nullFunction;


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.SeriesBase.prototype.getStat = function(key) {
  if (this.chart) this.chart.calculate();
  return this.statistics_[key];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/sets current series data tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.SeriesBase|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.SeriesBase.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.registerDisposable(this.tooltip_);
    this.tooltip_.chart(this.chart);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates context provider for legend items text formatter function.
 * @return {anychart.core.utils.LegendContextProvider} Legend context provider.
 * @protected
 */
anychart.core.SeriesBase.prototype.createLegendContextProvider = function() {
  if (!this.legendProvider_)
    this.legendProvider_ = new anychart.core.utils.LegendContextProvider(this);
  return this.legendProvider_;
};


/**
 * Return color for legend item.
 * @param {Function} itemsTextFormatter Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Color for legend item.
 */
anychart.core.SeriesBase.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var iconFill, iconStroke, iconHatchFill;
  var ctx = {
    'sourceColor': this.color()
  };
  if (goog.isFunction(legendItem.iconFill())) {
    json['iconFill'] = legendItem.iconFill().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    json['iconStroke'] = legendItem.iconStroke().call(ctx, ctx);
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    ctx['sourceColor'] = this.autoHatchFill;
    json['iconHatchFill'] = legendItem.iconHatchFill().call(ctx, ctx);
  }
  var itemText;
  if (goog.isFunction(itemsTextFormatter)) {
    var format = this.createLegendContextProvider();
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index();

  this.updateLegendItemMarker(json);

  json['iconType'] = this.getLegendIconType(json['iconType']);

  var ret = {
    'meta': /** @type {Object} */ (this.meta()),
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconStroke': this.getFinalStroke(false, anychart.PointState.NORMAL),
    'iconFill': this.getFinalFill(false, anychart.PointState.NORMAL),
    'iconHatchFill': this.getFinalHatchFill(false, anychart.PointState.NORMAL),
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


/**
 * Update legend item marker.
 * @param {Object} json JSON object for update.
 */
anychart.core.SeriesBase.prototype.updateLegendItemMarker = function(json) {
};


/**
 * Gets legend icon type for the series.
 * @param {*} type iconType.
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.SeriesBase.prototype.getLegendIconType = function(type) {
  if (type == anychart.enums.LegendItemIconType.MARKER) {
    if (!this.supportsMarkers()) {
      type = this.type();
    } else {
      var markerType = this.getMarkerType();
      if (markerType)
        type = markerType;
    }
    if (type == anychart.enums.LegendItemIconType.LINE)
      type = anychart.enums.LegendItemIconType.V_LINE;
  } else if (!goog.isFunction(type)) {
    type = anychart.enums.normalizeLegendItemIconType(type);
  }
  return /** @type {anychart.enums.LegendItemIconType} */ (type);
};


/**
 * Returns marker tyoe.
 * @return {?anychart.enums.MarkerType}
 */
anychart.core.SeriesBase.prototype.getMarkerType = function() {
  return null;
};


/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.SeriesBase)} Legend item settings or self for chaining.
 */
anychart.core.SeriesBase.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.registerDisposable(this.legendItem_);
    this.legendItem_.listenSignals(this.onLegendItemSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.SeriesBase.prototype.onLegendItemSignal_ = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * Getter/setter for current series color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.SeriesBase)} .
 */
anychart.core.SeriesBase.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.color_ || this.autoColor_ || 'blue';
};


/**
 * Returns labels default font color.
 * @return {string}
 */
anychart.core.SeriesBase.prototype.getLabelsColor = function() {
  var color;
  if (anychart.DEFAULT_THEME != 'v6') {
    color = anychart.color.darken(/** @type {acgraph.vector.Fill} */(this.color()));
    if (goog.isObject(color)) {
      color = /** @type {string|undefined} */(color['color']);
    }
  }
  return /** @type {string} */(color || '');
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.SeriesBase.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
  this.labels().setAutoColor(this.getLabelsColor());
  this.setAutoMarkerColor();
};


/**
 * Sets marker auto colors
 */
anychart.core.SeriesBase.prototype.setAutoMarkerColor = goog.nullFunction;


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.SeriesBase.prototype.setAutoMarkerType = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  HatchFill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for hatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.SeriesBase|Function|boolean} Hatch fill.
 */
anychart.core.SeriesBase.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Getter/setter for hoverHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.SeriesBase|Function|boolean} Hatch fill.
 */
anychart.core.SeriesBase.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hoverHatchFill_)
      this.hoverHatchFill_ = hatchFill;
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.SeriesBase|Function|boolean} Hatch fill.
 */
anychart.core.SeriesBase.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.selectHatchFill_)
      this.selectHatchFill_ = hatchFill;
    return this;
  }
  return this.selectHatchFill_;
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.core.SeriesBase.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    if (usePointSettings && goog.isDef(iterator.get('selectHatchFill'))) {
      hatchFill = iterator.get('selectHatchFill');
    } else if (goog.isDef(this.selectHatchFill())) {
      hatchFill = this.selectHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|string|boolean} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.core.SeriesBase.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill ||
        acgraph.vector.normalizeHatchFill(anychart.core.SeriesBase.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? this.autoHatchFill : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.SeriesBase.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Fill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.SeriesBase|Function} .
 */
anychart.core.SeriesBase.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter/setter for hoverFill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.SeriesBase|Function} .
 */
anychart.core.SeriesBase.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: we don't set anything cause everything is fine?
    return this;
  }
  return this.hoverFill_;
};


/**
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.SeriesBase|Function} .
 */
anychart.core.SeriesBase.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.selectFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    // TODO: we don't set anything cause everything is fine?
    return this;
  }
  return this.selectFill_;
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 */
anychart.core.SeriesBase.prototype.getFinalFill = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */((usePointSettings && iterator.get('fill')) || this.fill());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('selectFill')) || this.selectFill() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Fill|Function} */(
        (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(result));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Stroke.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.SeriesBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.SeriesBase.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter/setter for current hover stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.SeriesBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.SeriesBase.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: we don't set anything cause there is nothing to do?
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Getter/setter for current select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.SeriesBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.SeriesBase.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.selectStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    // TODO: we don't set anything cause there is nothing to do?
    return this;
  }
  return this.selectStroke_;
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {anychart.PointState|number} pointState Point state.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 */
anychart.core.SeriesBase.prototype.getFinalStroke = function(usePointSettings, pointState) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */((usePointSettings && iterator.get('stroke')) || this.stroke());

  var result;
  if (this.state.isStateContains(pointState, anychart.PointState.SELECT)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('selectStroke')) || this.selectStroke() || normalColor),
        normalColor);
  } else if (this.state.isStateContains(pointState, anychart.PointState.HOVER)) {
    result = this.normalizeColor(
        /** @type {acgraph.vector.Stroke|Function} */(
        (usePointSettings && iterator.get('hoverStroke')) || this.hoverStroke() || normalColor),
        normalColor);
  } else {
    result = this.normalizeColor(normalColor);
  }

  return acgraph.vector.normalizeStroke(/** @type {!acgraph.vector.Stroke} */(result));
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.SeriesBase.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for current series data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.SeriesBase)} Labels instance or itself for chaining call.
 */
anychart.core.SeriesBase.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.registerDisposable(this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
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
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.SeriesBase)} Labels instance or itself for chaining call.
 */
anychart.core.SeriesBase.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.enabled(null);
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
 * Gets or sets series select data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.SeriesBase)} Labels instance or itself for chaining call.
 */
anychart.core.SeriesBase.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.enabled(null);
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
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.SeriesBase.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_OVERLAP);
  }
};


/**
 * Draws label for a point.
 * @param {anychart.PointState|number} pointState Point state - normal, hover or select.
 * @protected
 */
anychart.core.SeriesBase.prototype.drawLabel = function(pointState) {
  this.configureLabel(pointState, true);
};


/**
 * Gets label position.
 * @param {anychart.PointState|number} pointState Point state - normal, hover or select.
 * @return {string} Position settings.
 */
anychart.core.SeriesBase.prototype.getLabelsPosition = function(pointState) {
  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);

  var iterator = this.getIterator();

  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var selectPointLabel = selected ? iterator.get('selectLabel') : null;

  var labelPosition = pointLabel && pointLabel['position'] ? pointLabel['position'] : null;
  var labelHoverPosition = hoverPointLabel && hoverPointLabel['position'] ? hoverPointLabel['position'] : null;
  var labelSelectPosition = selectPointLabel && selectPointLabel['position'] ? selectPointLabel['position'] : null;

  return hovered || selected ?
      hovered ?
          labelHoverPosition ?
              labelHoverPosition :
              this.hoverLabels().position() ?
                  this.hoverLabels().position() :
                  labelPosition ?
                      labelPosition :
                      this.labels().position() :
          labelSelectPosition ?
              labelSelectPosition :
              this.selectLabels().position() ?
                  this.selectLabels().position() :
                  labelPosition ?
                      labelPosition :
                      this.labels().position() :
      labelPosition ?
          labelPosition :
          this.labels().position();
};


/**
 * Sets drawing labels map.
 * @param {Array.<boolean>=} opt_value .
 * @return {anychart.core.SeriesBase|Array.<boolean>}
 */
anychart.core.SeriesBase.prototype.labelsDrawingMap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!goog.array.equals(this.labelsDrawingMap_, opt_value)) {
      this.labelsDrawingMap_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.labelsDrawingMap_;
};


/**
 * Creates and configures labels.
 * @param {anychart.PointState|number} pointState Point state - normal, hover or select.
 * @param {boolean=} opt_reset Whether reset labels settings.
 * @return {?anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.SeriesBase.prototype.configureLabel = function(pointState, opt_reset) {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  var label = this.labels().getLabel(index);

  var selected = this.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && this.state.isStateContains(pointState, anychart.PointState.HOVER);
  var isDraw, labelsFactory, pointLabel, stateLabel, labelEnabledState, stateLabelEnabledState;

  pointLabel = iterator.get('label');
  labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  if (selected) {
    stateLabel = iterator.get('selectLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    stateLabel = iterator.get('hoverLabel');
    stateLabelEnabledState = stateLabel && goog.isDef(stateLabel['enabled']) ? stateLabel['enabled'] : null;
    labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    stateLabel = null;
    labelsFactory = this.labels_;
  }

  if (selected || hovered) {
    isDraw = goog.isNull(stateLabelEnabledState) ?
        goog.isNull(labelsFactory.enabled()) ?
            goog.isNull(labelEnabledState) ?
                this.labels_.enabled() :
                labelEnabledState :
            labelsFactory.enabled() :
        stateLabelEnabledState;
  } else {
    isDraw = goog.isNull(labelEnabledState) ?
        this.labels_.enabled() :
        labelEnabledState;
  }

  if (isDraw && !(this.labelsDrawingMap_ && goog.isDef(this.labelsDrawingMap_[index]) && !this.labelsDrawingMap_[index])) {
    var position = this.getLabelsPosition(pointState);

    var positionProvider = this.createLabelsPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.createFormatProvider(true);
    formatProvider.pointInternal = this.getPoint(index);

    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    if (opt_reset) {
      label.resetSettings();
      label.currentLabelsFactory(labelsFactory);
      label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(stateLabel));
    }

    return label;
  } else if (label) {
    this.labels_.clear(label.getIndex());
  }
  return null;
};


/**
 * Create label position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.SeriesBase.prototype.createLabelsPositionProvider = function(position) {
  return this.createPositionProvider(position);
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.SeriesBase.prototype.createPositionProvider = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity section.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.SeriesBase.prototype.applyAppearanceToPoint = goog.nullFunction;


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.SeriesBase.prototype.finalizePointAppearance = function() {
  this.labels().draw();
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.SeriesBase.prototype.applyAppearanceToSeries = goog.nullFunction;


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.core.SeriesBase.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events manipulation.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.SeriesBase.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.SeriesBase.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent(res);
  return res;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.SeriesBase.prototype.makePointEvent = function(event) {
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
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

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

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iter,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/**
 * Gets wrapped point by index.
 * @param {number} index Point index.
 * @return {anychart.core.Point} Wrapped point.
 */
anychart.core.SeriesBase.prototype.getPoint = function(index) {
  var point;
  if (this.isSizeBased()) {
    point = new anychart.core.BubblePoint(this, index);
  } else {
    point = new anychart.core.SeriesPoint(this, index);
  }

  if (this.chart) {
    this.chart.calculate();
    var chartStat = this.chart.statistics;
    var val = /** @type {number} */ (point.get('value'));
    var size = /** @type {number} */ (point.get('size')); //Bubble.

    point.statistics[anychart.enums.Statistics.INDEX] = index;
    if (goog.isDef(val)) point.statistics[anychart.enums.Statistics.VALUE] = val;
    var v;

    if (goog.isNumber(chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM])) {
      v = val / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM]);
      point.statistics[anychart.enums.Statistics.X_PERCENT_OF_TOTAL] = v * 100;
    }

    if (goog.isNumber(this.statistics(anychart.enums.Statistics.SERIES_X_SUM))) {
      v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_X_SUM));
      point.statistics[anychart.enums.Statistics.X_PERCENT_OF_SERIES] = v * 100;
    }

    if (goog.isNumber(this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM))) {
      v = size / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM));
      point.statistics[anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_SERIES] = v * 100;
      v = size / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM]);
      point.statistics[anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_TOTAL] = v * 100;
      point.statistics[anychart.enums.Statistics.BUBBLE_SIZE] = size;
    }

    var chartSumArr = chartStat[anychart.enums.Statistics.CATEGORY_Y_SUM_ARR_];
    var x = /** @type {number} */ (point.get('x'));

    if (chartSumArr) {
      point.statistics[anychart.enums.Statistics.CATEGORY_NAME] = x;
      var catSum = chartSumArr[index];

      v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_SERIES] = v * 100;
      v = val / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] = v * 100;
      v = val / catSum;
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY] = v * 100;
      v = catSum / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_PERCENT_OF_TOTAL] = v * 100;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_SUM] = catSum;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MAX] = chartStat[anychart.enums.Statistics.CATEGORY_Y_MAX_ARR_][index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MIN] = chartStat[anychart.enums.Statistics.CATEGORY_Y_MIN_ARR_][index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_AVERAGE] = chartStat[anychart.enums.Statistics.CATEGORY_Y_AVG_ARR_][index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MEDIAN] = chartStat[anychart.enums.Statistics.CATEGORY_Y_MEDIAN_ARR_][index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MODE] = chartStat[anychart.enums.Statistics.CATEGORY_Y_MODE_ARR_][index];
    } else {
      v = x / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_X_SUM));
      point.statistics[anychart.enums.Statistics.X_PERCENT_OF_SERIES] = v * 100;
      v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_SERIES] = v * 100;
      v = x / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM]);
      point.statistics[anychart.enums.Statistics.X_PERCENT_OF_TOTAL] = v * 100;
      v = val / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM]);
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] = v * 100;

    }
  }

  return point;
};


/**
 * Get point index by event. Used for events from data layer only
 * @param {anychart.core.MouseEvent} event .
 * @protected
 * @return {number} Point index.
 */
anychart.core.SeriesBase.prototype.getIndexByEvent = function(event) {
  return anychart.utils.toNumber(anychart.utils.extractTag(event['domTarget']).index);
};


/** @inheritDoc */
anychart.core.SeriesBase.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.core.SeriesBase.prototype.makeInteractive = function(element, opt_seriesGlobal) {
  if (!element) return;
  element.tag = {series: this};
  if (opt_seriesGlobal) {
    element.tag.index = true;
  } else {
    element.tag.index = this.getIterator().getIndex();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.SeriesBase}  {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/**
 * Removes hover from the series or point by index.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.SeriesBase} {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) || !this.enabled())
    return this;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @return {!anychart.core.SeriesBase}  {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.hoverPoint = function(index) {
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
  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
  }
  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.SeriesBase} An instance of the {@link anychart.core.SeriesBase} class for method chaining.
 */
anychart.core.SeriesBase.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for accessibility setting.
 * @param {(boolean|Object)=} opt_enabledOrJson - Whether to enable accessibility.
 * @return {anychart.core.utils.SeriesA11y|anychart.core.SeriesBase} - Accessibility settings object or self for chaining.
 */
anychart.core.SeriesBase.prototype.a11y = function(opt_enabledOrJson) {
  if (!this.a11y_) {
    this.a11y_ = new anychart.core.utils.SeriesA11y(this);
    this.registerDisposable(this.a11y_);
    this.a11y_.listenSignals(this.onA11ySignal_, this);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.a11y_.setup.apply(this.a11y_, arguments);
    return this;
  } else {
    return this.a11y_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.SeriesBase.prototype.onA11ySignal_ = function() {
  this.invalidate(anychart.ConsistencyState.A11Y, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_UPDATE_A11Y);
};


/**
 * Draws a11y.
 */
anychart.core.SeriesBase.prototype.drawA11y = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.A11Y)) {
    this.a11y().applyA11y(this.createFormatProvider());
    this.markConsistent(anychart.ConsistencyState.A11Y);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Select.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Imitates selects a point of the series by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.core.SeriesBase} {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else
    this.selectSeries();

  return this;
};


/**
 * Deselects all points or points by index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.core.SeriesBase} {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);

  return this;
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.core.SeriesBase} {@link anychart.core.SeriesBase} instance for method chaining.
 */
anychart.core.SeriesBase.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  if (!this.enabled())
    return this;

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
 * Selects all points of the series. Use <b>unselect</b> method for unselect series.
 * @return {!anychart.core.SeriesBase} An instance of the {@link anychart.core.SeriesBase} class for method chaining.
 */
anychart.core.SeriesBase.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.SELECT);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity modes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Selection mode.
 * @type {?anychart.enums.SelectionMode}
 * @private
 */
anychart.core.SeriesBase.prototype.selectionMode_;


/**
 * Selection mode.
 * @type {anychart.enums.HoverMode}
 * @private
 */
anychart.core.SeriesBase.prototype.hoverMode_;


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.core.SeriesBase|anychart.enums.SelectionMode|null} .
 */
anychart.core.SeriesBase.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.core.SeriesBase|anychart.enums.HoverMode} .
 */
anychart.core.SeriesBase.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHoverMode(opt_value);
    if (opt_value != this.hoverMode_) {
      this.hoverMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.HoverMode}*/(this.hoverMode_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  AllowPointsSelect. (Deprecated)
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Allows to select points of the series.
 * @param {?boolean=} opt_value Allow or not.
 * @return {null|boolean|anychart.core.SeriesBase} Returns allow points select state or current series instance for chaining.
 * @deprecated Since 7.13.0 in Map series and was never introduced in public API of other series, but was exported. Use this.selectionMode() instead.
 */
anychart.core.SeriesBase.prototype.allowPointsSelect = function(opt_value) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['allowPointsSelect()', 'selectionMode()'], true);
  if (goog.isDef(opt_value)) {
    this.selectionMode(goog.isBoolean(opt_value) ?
        (opt_value ?
            anychart.enums.SelectionMode.MULTI_SELECT :
            anychart.enums.SelectionMode.NONE) :
        opt_value);
    return this;
  }
  return goog.isNull(this.selectionMode()) ? null : this.selectionMode() != anychart.enums.SelectionMode.NONE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//------------------------------------------- ---------------------------------------------------------------------------
/**
 * Serializes and returns data. Extracted for overridabillity.
 * @return {!Object}
 * @protected
 */
anychart.core.SeriesBase.prototype.serializeData = function() {
  return this.data().serialize();
};


// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * @inheritDoc
 */
anychart.core.SeriesBase.prototype.serialize = function() {
  var json = anychart.core.SeriesBase.base(this, 'serialize');
  if (this.color_)
    json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color_));
  if (goog.isDef(this.name()))
    json['name'] = this.name();
  json['data'] = this.serializeData();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['tooltip'] = this.tooltip().serialize();
  json['legendItem'] = this.legendItem().serialize();
  json['a11y'] = this.a11y().serialize();

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectFill']
      );
    } else {
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectStroke']
      );
    } else {
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hatchFill']
      );
    } else {
      if (this.hatchFill())
        json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverHatchFill']
      );
    } else {
      if (this.hoverHatchFill())
        json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
            (this.hoverHatchFill()));
    }
  }
  if (goog.isFunction(this['selectHatchFill'])) {
    if (goog.isFunction(this.selectHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectHatchFill']
      );
    } else {
      if (this.selectHatchFill())
        json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
            (this.selectHatchFill()));
    }
  }
  if (goog.isDef(this.selectionMode()))
    json['selectionMode'] = this.selectionMode();
  return json;
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.core.SeriesBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.SeriesBase.base(this, 'setupByJSON', config, opt_default);
  if (goog.isFunction(this['fill']))
    this.fill(config['fill']);

  if (goog.isFunction(this['hoverFill']))
    this.hoverFill(config['hoverFill']);

  if (goog.isFunction(this['selectFill']))
    this.selectFill(config['selectFill']);

  if (goog.isFunction(this['stroke']))
    this.stroke(config['stroke']);

  if (goog.isFunction(this['hoverStroke']))
    this.hoverStroke(config['hoverStroke']);

  if (goog.isFunction(this['selectStroke']))
    this.selectStroke(config['selectStroke']);

  if (goog.isFunction(this['hatchFill']))
    this.hatchFill(config['hatchFill']);

  if (goog.isFunction(this['hoverHatchFill']))
    this.hoverHatchFill(config['hoverHatchFill']);

  if (goog.isFunction(this['selectHatchFill']))
    this.selectHatchFill(config['selectHatchFill']);

  this.color(config['color']);
  this.name(config['name']);
  this.meta(config['meta']);
  if ('data' in config)
    this.data(config['data'] || null);
  this.labels().setup(config['labels']);
  this.hoverLabels().setup(config['hoverLabels']);
  this.selectLabels().setup(config['selectLabels']);

  if ('tooltip' in config)
    this.tooltip().setupByVal(config['tooltip'], opt_default);

  this.legendItem(config['legendItem']);
  if (goog.isDef(config['allowPointsSelect'])) {
    this.allowPointsSelect(config['allowPointsSelect']);
  }
  this.selectionMode(config['selectionMode']);
  this.a11y(config['a11y']);

};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.core.SeriesBase.prototype;
  proto['a11y'] = proto.a11y;//doc|ex

  proto['color'] = proto.color;//doc|ex
  proto['name'] = proto.name;//doc|ex
  proto['id'] = proto.id;
  proto['meta'] = proto.meta;//doc|ex
  proto['data'] = proto.data;//doc|ex
  proto['tooltip'] = proto.tooltip;

  proto['labels'] = proto.labels;//doc|ex
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['unhover'] = proto.unhover;
  proto['unselect'] = proto.unselect;

  proto['hover'] = proto.hover;
  proto['select'] = proto.select;
  proto['selectionMode'] = proto.selectionMode;
  proto['allowPointsSelect'] = proto.allowPointsSelect;

  proto['legendItem'] = proto.legendItem;
  proto['getPixelBounds'] = proto.getPixelBounds;
  proto['getPoint'] = proto.getPoint;

  proto['getStat'] = proto.getStat;
})();
