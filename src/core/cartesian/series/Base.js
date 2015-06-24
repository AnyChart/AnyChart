goog.provide('anychart.core.cartesian.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.LegendContextProvider');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Base class for all cartesian series.<br/>
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
 * @implements {anychart.core.utils.ISeriesWithError}
 */
anychart.core.cartesian.series.Base = function(opt_data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
  goog.base(this);
  this.data(opt_data || null, opt_csvSettings);

  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.titleFormatter(function() {
    return this['name'];
  });
  tooltip.contentFormatter(function() {
    return this['x'] + ': ' + this['value'];
  });
  tooltip.resumeSignalsDispatching(false);
  this.statistics_ = {};

  // make label hoverable
  var labels = this.labels();
  labels.disablePointerEvents(false);
  labels.position(anychart.enums.Position.CENTER);
  labels.enabled(false);
  (/** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels())).enabled(null);

  this.hatchFill(false);

  this.resumeSignalsDispatching(false);

  /**
   * Error paths dictionary by stroke object hash.
   * @type {Object.<string, !acgraph.vector.Path>}
   * @private
   */
  this.errorPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsPool_ = null;

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove);
};
goog.inherits(anychart.core.cartesian.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.cartesian.series.Base.SeriesTypesMap = {};


/**
 * For internal use.
 * @param {number} value Calculated bar width ratio.
 */
anychart.core.cartesian.series.Base.prototype.setAutoBarWidth = goog.nullFunction;


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.core.cartesian.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 */
anychart.core.cartesian.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.pixelBoundsCache = null;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.cartesian.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Error path z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_ERROR_PATH = 3;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.name_;


/**
 * Series index.
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.index_;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.clip_ = false;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.rootLayer;


/**
 * Gets root layer of series.
 * @return {acgraph.vector.Layer}
 */
anychart.core.cartesian.series.Base.prototype.getRootLayer = function() {
  return this.rootLayer;
};


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.meta_;


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.data_;


/**
 * @type {Object}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.statistics_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.parentViewToDispose_;


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.axesLinesSpace_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.iterator_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.xScale_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.hoverLabels_ = null;


/**
 * @type {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.tooltip_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.pointPosition_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.autoPointPosition_ = 0.5;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.zeroY = 0;


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.referenceValueNames;


/**
 * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
 * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * Possible values:
 *    'x' - transforms through xScale,
 *    'y' - transforms through yScale,
 *    'z' - gets as zero Y.
 * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
 * @type {!Array.<string>}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.referenceValueMeanings;


/**
 * Whether getReferenceCoords() must support stacking.
 * @type {boolean}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.cartesian.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


/**
 * Series color. See this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.color_ = null;


/**
 * Series color from chart. See. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.autoColor_ = null;


/**
 * Hatch fill type from chart.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.autoHatchFill_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.hatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.hoverHatchFill_;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.fill_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.strokeInternal = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.hoverStroke_ = null;


/**
 * Makes proper clipping. Considered internal.
 */
anychart.core.cartesian.series.Base.prototype.doClip = function() {
  var clip, bounds, axesLinesSpace;
  if (this.clip() && !(this.rootLayer.clip() instanceof acgraph.vector.Clip)) {
    if (goog.isBoolean(this.clip())) {
      bounds = this.pixelBoundsCache;
      axesLinesSpace = this.axesLinesSpace();
      clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
    } else {
      clip = /** @type {!anychart.math.Rect} */(this.clip());
    }
    this.rootLayer.clip(clip);
    var labelDOM = this.labels().getDomElement();
    if (labelDOM) labelDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series statistics.
 * @param {string=} opt_name Statistics parameter name.
 * @param {number=} opt_value Statistics parameter value.
 * @return {anychart.core.cartesian.series.Base|Object.<number>|number}
 */
anychart.core.cartesian.series.Base.prototype.statistics = function(opt_name, opt_value) {
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
 * Getter for series name.
 * @return {string|undefined} Series name value.
 *//**
 * Setter for series name. <br/>
 * Basically, name of series is used in Legend displaying, but it can be used in tooltips as well.
 * @example <t>lineChart</t>
 * var formatterFunc = function(){ return this.seriesName;};
 * chart.line([1,2,3])
 *     .name('My Custom series name')
 *     .tooltip().contentFormatter(formatterFunc);
 * chart.line([2,3,4])
 *     .tooltip().contentFormatter(formatterFunc);
 * chart.legend().enabled(true);
 * @param {string=} opt_value Value to set.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.core.cartesian.series.Base|undefined)} Series name value or itself for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      //TODO: send signal to redraw name dependent components, series, legend etc
    }
    return this;
  } else {
    return this.name_;
  }
};


/**
 * Getter for series clip settings.
 * @return {boolean|anychart.math.Rect} Current clip settings.
 *//**
 * Setter for series clip settings. Clips visible part of a series by a rectangle (or chart).
 * @example <t>lineChart</t>
 * chart.yScale().minimum(2);
 * chart.line([1, 4, 7, 1]).clip(false);
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.cartesian.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.cartesian.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.clip_;
  }
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.cartesian.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


/**
 * Sets/gets series number.
 * @param {number=} opt_value
 * @return {anychart.core.cartesian.series.Base|number}
 */
anychart.core.cartesian.series.Base.prototype.index = function(opt_value) {
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
 * Getter for series meta data.
 * @param {*=} opt_key Metadata key.
 * @return {*} Metadata object by key.
 *//**
 * Setter for series meta data.
 * @example <t>lineChart</t>
 * chart.line([1,2,3]).meta({
 *     'location': 'QA',
 *     'source': 'http://some-url.dmn',
 *     'imageSRC': 'http://some-url.dmn/getImage.php?bySomeParam=Value'
 * });
 * @param {*=} opt_object Object to replace metadata.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Add/Replace meta data for series by key.
 * @example <t>lineChart</t>
 * var series = chart.line([1,2,3]);
 * series.meta('location', 'QA');
 * series.meta('source', 'http://some-url.dmn');
 * series.meta('imageSRC', 'http://some-url.dmn/getImage.php?bySomeParam=Value');
 * @param {string=} opt_key Metadata key.
 * @param {*=} opt_value Metadata value.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
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
 * Getter for series mapping.
 * @return {!anychart.data.View} Returns current mapping.
 *//**
 * Setter for series mapping.
 * @example <t>listingOnly</t>
 * series.data([20, 7, 10, 14]);
 *  // or
 * series.data([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 *  // or
 * series.data([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *   // or
 *  series.data(
 *    '17;21;11.1;4\n'+
 *    '11;11;0.21;0\n'+
 *    '21;17;23.1;1\n'+
 *    '10;.4;14;4.4\n',
 *    {'rowsSeparator': '\n', columnsSeparator: ';'})
 * @example <t>lineChart</t>
 * chart.line().data([1,2,3]);
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.cartesian.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.cartesian.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
    if (opt_value instanceof anychart.data.View)
      this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
    else if (opt_value instanceof anychart.data.Set)
      this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
    else
      this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
    this.registerDisposable(this.parentViewToDispose_);
    this.data_ = this.parentView_;
    this.data_.listenSignals(this.dataInvalidated_, this);
    // DATA is supported only in Bubble, so we invalidate only for it.
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_DATA,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.cartesian.series.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 */
anychart.core.cartesian.series.Base.prototype.resetCategorisation = function() {
  if (this.data_ != this.parentView_)
    goog.dispose(this.data_);
  this.data_ = /** @type {!anychart.data.View} */(this.parentView_);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.core.cartesian.series.Base.prototype.categoriseData = function(categories) {
  this.data_ = this.parentView_.prepare('x', categories);
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.cartesian.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.cartesian.series.Base.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.core.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
  }

  if (anychart.core.utils.Error.isErrorAvailableForScale(yScale) && this.isErrorAvailable()) {
    var errValues = this.getErrorValues(false);
    errValues[0] = +res[0] - errValues[0];
    errValues[1] = +res[0] + errValues[1];
    res = res.concat(errValues);
  }
  return res;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<number>|null} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var val = iterator.get(this.referenceValueNames[i]);

    if (!goog.isDef(val)) {
      if (stacked && this.referenceValuesSupportStack)
        fail = true;
      else
        return null;
    }

    var pix;

    switch (this.referenceValueMeanings[i]) {
      case 'x':
        pix = xScale.isMissing(val) ? NaN : this.applyRatioToBounds(
            xScale.transform(val, /** @type {number} */(this.xPointPosition())),
            true);
        break;
      case 'y':
        if (this.referenceValuesSupportStack)
          val = yScale.applyStacking(val);
        else if (yScale.isMissing(val))
          val = NaN;
        pix = this.applyRatioToBounds(yScale.transform(val, 0.5), false);
        break;
      case 'z':
        if (stacked) {
          if (this.referenceValuesSupportStack)
            val = yScale.getPrevVal(val);
          else if (yScale.isMissing(val))
            val = NaN;
          pix = this.applyRatioToBounds(goog.math.clamp(yScale.transform(val, 0.5), 0, 1), false);
        } else {
          pix = this.zeroY;
        }
        break;
      case 'n':
        pix = /** @type {number} */(+val);
        break;
    }

    if (isNaN(pix)) fail = true;

    res.push(pix);
  }
  return fail ? null : res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns current position of the point on an ordinal scale.
 * @return {number} Current x-point position.
 *//**
 * Sets position of the point on an oridnal scale.
 * @illustration <t>simple-h100</t>
 * stage.path()
 *     .moveTo(20, 50)
 *     .lineTo(380, 50)
 *     .moveTo(20, 55)
 *     .lineTo(20,45)
 *     .moveTo(100, 55)
 *     .lineTo(100,45)
 *     .moveTo(180, 55)
 *     .lineTo(180,45)
 *     .moveTo(260, 55)
 *     .lineTo(260,45)
 *     .stroke('2px black');
 * stage.text(40, 60, 'Point 1');
 * stage.text(118, 60, 'Point 2');
 * stage.text(200, 60, 'Point 3');
 * stage.text(350, 60, 'X-Axis');
 * stage.path()
 *     .moveTo(20, 20)
 *     .lineTo(100, 20)
 *     .stroke('blue');
 * stage.text(12, 13, '0').color('blue');
 * stage.text(102, 13, '1').color('blue');
 * stage.text(142, 30, '0.7').color('blue');
 * stage.circle(150, 47, 4).fill('lightblue');
 * stage.text(182, 30, '0.1').color('blue');
 * stage.circle(190, 47, 4).fill('lightblue');
 * @illustrationDesc
 * Points get a place on ordinal scale, the size of the place can be set manually.<br/>
 * If there are more than one seties, place size is calculated to fit all.
 * @example
 * var chart = anychart.column();
 * chart.column([1, 3, 3]).xPointPosition(0.3);
 * chart.column([1.2, 2.3, 2.3]).xPointPosition(0.5);
 * chart.column([1, 2.5, 1]).xPointPosition(0.7);
 * chart.container(stage).draw();
 * @param {number=} opt_position [0.5] Point position (in 0 to 1 range). <br/>
 *   For bars, columns and ohlc series it's autocalculated if chart contains more than one series.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_position [0.5] Point position (in 0 to 1 range).
 * @return {number|anychart.core.cartesian.series.Base} .
 */
anychart.core.cartesian.series.Base.prototype.xPointPosition = function(opt_position) {
  if (goog.isDef(opt_position)) {
    if (this.pointPosition_ != +opt_position) {
      this.pointPosition_ = +opt_position;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return isNaN(this.pointPosition_) ? this.autoPointPosition_ : this.pointPosition_;
};


/**
 * Works for autopositioning by a plot, if external value is set - it is not overwritten.
 * @param {number} position .
 * @return {anychart.core.cartesian.series.Base} .
 */
anychart.core.cartesian.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoPointPosition_ = +position;
  return this;
};


/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isWidthBased = function() {
  return false;
};


/**
 * Tester if the series is bar based (bar, rangeBar).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isBarBased = function() {
  return false;
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isSizeBased = function() {
  return false;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.hasMarkers = function() {
  return false;
};


/**
 * Tester if the series has outlierMarkers() method.
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.hasOutlierMarkers = function() {
  return false;
};


/**
 * Tester if the series can have an error. (All except range series, OHLC, Bubble).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isErrorAvailable = function() {
  return true;
};


/**
 * This method is here for compatability.
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.cartesian.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.outlierMarkers = function(opt_value) {
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws series into the current container. If series has no scales - creates them.
 * @return {anychart.core.cartesian.series.Base} An instance of {@link anychart.core.cartesian.series.Base} class for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.draw = function() {
  this.suspendSignalsDispatching();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  var iterator;
  var value;
  var scale;
  if (!(scale = this.xScale()))
    this.xScale(scale = new anychart.scales.Ordinal());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = iterator.get('x');
      if (goog.isDef(value))
        scale.extendDataRange(value);
    }
    scale.finishAutoCalc();
  }
  this.categoriseData(scale.getCategorisation());
  if (!(scale = this.yScale()))
    this.yScale(scale = new anychart.scales.Linear());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value)
        scale.extendDataRange.apply(/** @type {anychart.scales.Base} */(scale), value);
    }
    scale.finishAutoCalc();
  }

  iterator = this.getResetIterator();
  this.startDrawing();
  while (iterator.advance())
    this.drawPoint();
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 */
anychart.core.cartesian.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint();
    else
      this.firstPointDrawn = this.drawFirstPoint();
    if (this.firstPointDrawn) {
      this.drawLabel(this.hoverStatus == this.getIterator().getIndex());
      if (this.isErrorAvailable())
        this.drawError();
    }
  }
};


/**
 * This method is used by a parallel iterator in case series needs to
 * draw a missing point (given series has no such X, and other
 * series has it).
 */
anychart.core.cartesian.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE && this.referenceValuesSupportStack) {
    for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
      if (this.referenceValueMeanings[i] == 'y')
        this.yScale().applyStacking(NaN);
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.cartesian.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;
  this.pixelBoundsCache = this.getPixelBounds();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false));

  this.checkDrawingNeeded();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.resetErrorPaths();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - +this.axesLinesSpace().bottom();
  var min = bounds.getTop() + +this.axesLinesSpace().top();

  return goog.math.clamp(value, min, max);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.cartesian.series.Base.prototype.finalizeDrawing = function() {
  this.labels().draw();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.doClip();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);

  if (this.labels_)
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.hoverLabels_)
    this.hoverLabels_.markConsistent(anychart.ConsistencyState.ALL);
  // This check need to prevent finalizeDrawing to mark CONTAINER consistency state in case when series was disabled by
  // series.enabled(false).
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.markConsistent(anychart.ConsistencyState.ALL & !anychart.ConsistencyState.CONTAINER);
  } else {
    this.markConsistent(anychart.ConsistencyState.ALL);
  }
};


/**
 * Gets label position.
 * @param {boolean} hovered Whether labels hovered.
 * @return {string} Position settings.
 */
anychart.core.cartesian.series.Base.prototype.getLabelsPosition = function(hovered) {
  var pointLabel = this.getIterator().get('label');
  var hoverPointLabel = hovered ? this.getIterator().get('hoverLabel') : null;
  var labelPosition = pointLabel && pointLabel['position'] ? pointLabel['position'] : null;
  var labelHoverPosition = hoverPointLabel && hoverPointLabel['position'] ? hoverPointLabel['position'] : null;
  return hovered ?
      labelHoverPosition ?
          labelHoverPosition :
          this.hoverLabels().position() ?
              this.hoverLabels().position() :
              labelPosition ?
                  labelPosition :
                  this.labels().position() :
      labelPosition ?
          labelPosition :
          this.labels().position();
};


/**
 * Draws marker for a point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawLabel = function(hovered) {
  var pointLabel = this.getIterator().get('label');
  var hoverPointLabel = hovered ? this.getIterator().get('hoverLabel') : null;
  var index = this.getIterator().getIndex();
  var labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

  var label = this.labels().getLabel(index);

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(this.hoverLabels().enabled()) ?
              goog.isNull(labelEnabledState) ?
                  this.labels().enabled() :
                  labelEnabledState :
              this.hoverLabels().enabled() :
          labelHoverEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  if (isDraw) {
    var position = this.getLabelsPosition(hovered);

    var positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position));
    var formatProvider = this.createFormatProvider();
    if (label) {
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);
    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    label.resetSettings();
    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hoverPointLabel));
    label.draw();
  } else if (label) {
    label.clear();
  }
};


/**
 * Show data point tooltip.
 * @protected
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.core.cartesian.series.Base.prototype.showTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());

  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(opt_event['clientX'], opt_event['clientY']));
  } else {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.hideTooltip = function() {
  /** @type {anychart.core.ui.Tooltip} */(this.tooltip()).hide();
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.createFormatProvider = function() {
  if (!this.pointProvider_)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, this.referenceValueNames,
        this.isErrorAvailable() && anychart.core.utils.Error.isErrorAvailableForScale(this.xScale_));
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('y')}};
  }
};


/**
 * Draws first point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawFirstPoint = function() {
  return this.drawSubsequentPoint();
};


/**
 * Draws subsequent point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  var min, range;
  if (horizontal) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = goog.base(this, 'makeBrowserEvent', e);
  res['pointIndex'] = this.getIndexByEvent(res);
  return res;
};


/**
 * Get point index by event. Used for events from data layer only
 * @param {anychart.core.MouseEvent} event .
 * @protected
 * @return {number} Point index.
 */
anychart.core.cartesian.series.Base.prototype.getIndexByEvent = function(event) {
  return anychart.utils.toNumber(anychart.utils.extractTag(event['domTarget']));
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.handleMouseOverAndMove = function(event) {
  var evt = this.makePointEvent(event);
  if (evt &&
      ((anychart.utils.checkIfParent(this, event['relatedTarget']) && !isNaN(this.hoverStatus)) ||
      this.dispatchEvent(evt))) {
    // we don't want to dispatch if this an out-over from the same point
    // in case of move we will always dispatch, because checkIfParent(this, undefined) will return false
    this.hoverPoint(/** @type {number} */ (evt['pointIndex']), event);
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.handleMouseOut = function(event) {
  var evt = this.makePointEvent(event);
  var prevTag = anychart.utils.toNumber(anychart.utils.extractTag(event['relatedDomTarget']));
  var index = evt['pointIndex'];
  if (anychart.utils.checkIfParent(this, event['relatedTarget']) && (isNaN(prevTag) || prevTag == index)) {
    // this means we got an out-over on the same point, for example - from the point to inside label
    // in this case we skip dispatching the event and unhovering to avoid possible label disappearance
    this.hoverPoint(/** @type {number} */ (index), event);
  } else if (this.dispatchEvent(evt)) {
    this.unhover();
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.makePointEvent = function(event) {
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
    'originalEvent': event
  };
};


/**
 * Series hover status. NaN - not hovered, -1 - series hovered, non-negative number - point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.hoverStatus = NaN;


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.cartesian.series.Base} An instance of the {@link anychart.core.cartesian.series.Base} class for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.core.cartesian.series.Base}  {@link anychart.core.cartesian.series.Base} instance for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {number=} opt_index
 * @return {!anychart.core.cartesian.series.Base}  {@link anychart.core.cartesian.series.Base} instance for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.hover = function(opt_index) {
  if (goog.isDef(opt_index)) this.hoverPoint(opt_index);
  else this.hoverSeries();
  return this;
};


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.makeHoverable = function(element, opt_seriesGlobal) {
  if (!element) return;
  if (opt_seriesGlobal)
    element.tag = true;
  else
    element.tag = this.getIterator().getIndex();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series X scale.
 * @return {anychart.scales.Base} Current series X Scale.
 *//**
 * Setter for series X scale.
 * @example <t>lineChart</t>
 * var secondScale = anychart.scales.ordinal();
 * chart.xAxis(1)
 *     .scale(secondScale)
 *     .orientation('top')
 *     .title('DateTime axis');
 * chart.line([
 *    ['A1', 2],
 *    ['A2', 2.4],
 *    ['A3', 1]
 * ]);
 * chart.line([
 *    ['2014-01-01', 1],
 *    ['2014-01-02', 2],
 *    ['2014-01-03', 3]
 * ]).xScale(secondScale);
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.core.cartesian.series.Base}  {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.cartesian.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Getter for current series Y scale.
 * @return {anychart.scales.Base} Current series Y Scale.
 *//**
 * Setter for series Y scale.
 * @example <t>lineChart</t>
 * var secondScale = anychart.scales.linear();
 * chart.yAxis(1).scale(secondScale);
 * chart.yAxis(1).orientation('right');
 * chart.line([2, 3, 4]);
 * chart.line([200, 213, 321]).yScale(secondScale);
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.core.cartesian.series.Base}  {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.cartesian.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series data tooltip.
 * @example <t>lineChart</t>
 * chart.line([1, 2, 1.2, 3.2]).tooltip()
 *     .background()
 *       .stroke('2 #cc8800').fill('grey 0.5');
 * @return {!anychart.core.ui.Tooltip} Tooltip instance.
 *//**
 * Setter for series data tooltip.
 * @example <t>lineChart</t>
 * chart.line([1, 2, 1.2, 3.2]).tooltip(false);
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!anychart.core.cartesian.series.Base} An instance of the {@link anychart.core.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.cartesian.series.Base|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series data labels.
 * @example <t>lineChart</t>
 * chart.line([1,2,3]).labels()
 *    .fontColor('white')
 *    .fontWeight('bold');
 * @return {!anychart.core.ui.LabelsFactory} Labels instance.
 *//**
 * Setter for series data labels.
 * @example <t>lineChart</t>
 * chart.line([1,2,3]).labels(true);
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!anychart.core.cartesian.series.Base} An instance of the {@link anychart.core.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.registerDisposable(this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate series statisctics.
 */
anychart.core.cartesian.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var values = this.getReferenceScaleValues();
    if (values) {
      var y = anychart.utils.toNumber(values[0]);
      if (!isNaN(y)) {
        seriesMax = Math.max(seriesMax, y);
        seriesMin = Math.min(seriesMin, y);
        seriesSum += y;
      }
    }
    seriesPointsCount++;
  }
  var seriesAverage = seriesSum / seriesPointsCount;

  this.statistics('seriesMax', seriesMax);
  this.statistics('seriesMin', seriesMin);
  this.statistics('seriesSum', seriesSum);
  this.statistics('seriesAverage', seriesAverage);
  this.statistics('seriesPointsCount', seriesPointsCount);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * Getter for current series color.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Sets color settings using an object or a string.<br/>
 * <b>Note: </b> <u>color</u> methods sets <b>fill</b> and <b>stroke</b> settings, which means it is not wise to pass
 * image fill here - stroke doesn't accept image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid color</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color('green');
 * @example <c>Linear gradient color</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color(['green', 'yellow']);
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Linear gradient.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color(['black', 'yellow'], 45, true, 0.5);
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Radial gradient.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.cartesian.series.Base)} .
 */
anychart.core.cartesian.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.cartesian.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.cartesian.series.Base.prototype.setAutoMarkerType = goog.abstractMethod;


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.cartesian.series.Base.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill_ = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


/**
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}
 * @example
 * var chart = anychart.column();
 * chart.column([0.3, 3, 2.2, 1.7]).hatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Getter for current hover hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hover hatch fill settings.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_HatchFill}
 * @example
 * var chart = anychart.column();
 * chart.column([0.3, 3, 2.2, 1.7]).hoverHatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.cartesian.series.Base.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.core.cartesian.series.Base.prototype.getFinalHatchFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (hover) {
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
anychart.core.cartesian.series.Base.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill_ ||
        acgraph.vector.normalizeHatchFill(anychart.core.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE);
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? this.autoHatchFill_ : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green');
 * @example <c>Linear gradient fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['green', 'yellow']);
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['black', 'yellow'], 45, true, 0.5);
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.area([1, 4, 7, 1]).fill({
 *  src: 'http://static.anychart.com/underwater.jpg',
 *  mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green');
 * @example <c>Linear gradient fill</c><t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['green', 'yellow']);
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['black', 'yellow'], 45, true, 0.5);
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>lineChart</t>
 * chart.area([1, 4, 7, 1]).hoverFill({
 *  src: 'http://static.anychart.com/underwater.jpg',
 *  mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.cartesian.series.Base|Function} .
 */
anychart.core.cartesian.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.getFinalFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && iterator.get('fill')) || this.fill());
  var result = /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              (usePointSettings && iterator.get('hoverFill')) || this.hoverFill() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
  return acgraph.vector.normalizeFill(result);
};


/**
 * Getter for current stroke settings.
 * @return {!acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example <t>lineChart</t>
 * chart.line([1, 4, 7, 1]).stroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 * );
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example <t>lineChart</t>
 * chart.line([1, 4, 7, 1]).stroke('orange', 3, '5 2', 'round');
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.strokeInternal) {
      this.strokeInternal = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.strokeInternal;
};


/**
 * Getter for current stroke settings.
 * @return {!acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for series stroke by function.<br/>
 * <b>Note:</b> For all ContiniousBase series (line/spline/area etc) hoverStroke works only with hoverSeries.
 * @example <t>lineChart</t>
 * chart.line([1.5, 4.5, 7.5, 1.5]).hoverStroke(
 *      function(){
 *        return '5 '+ this.sourceColor;
 *      }
 * );
 * chart.column([1, 4, 7, 1]).hoverStroke(
 *      function(){
 *        return '5 '+ this.sourceColor;
 *      }
 * );
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Function that looks like <code>function(){
 *    // this.sourceColor - color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> For all ContiniousBase series (line/spline/area etc) hoverStroke works only with hoverSeries.
 * @example <t>lineChart</t>
 * chart.line([1.5, 4.5, 7.5, 1.5]).hoverStroke('orange', 3, '5 2', 'round');
 * chart.column([1, 4, 7, 1]).hoverStroke('orange', 3, '5 2', 'round');
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.cartesian.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.getFinalStroke = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && iterator.get('stroke')) ||
      this.stroke());
  var result = /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              (iterator.get('hoverStroke') && usePointSettings) ||
              this.hoverStroke() ||
              normalColor),
          normalColor) :
      this.normalizeColor(normalColor));

  return acgraph.vector.normalizeStroke(result);
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.normalizeColor = function(color, var_args) {
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


/**
 * Creates context provider for legend items text formatter function.
 * @return {anychart.core.utils.LegendContextProvider} Legend context provider.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.createLegendContextProvider_ = function() {
  if (!this.legendProvider_)
    this.legendProvider_ = new anychart.core.utils.LegendContextProvider(this);
  return this.legendProvider_;
};


/**
 * Creates legend item config.
 * @param {Function} itemsTextFormatter Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Legend item config.
 */
anychart.core.cartesian.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();
  var json = legendItem.serialize();
  var iconFill, iconStroke, iconHatchFill;
  if (goog.isFunction(legendItem.iconFill())) {
    iconFill = legendItem.iconFill().call(this.color());
  }
  if (goog.isFunction(legendItem.iconStroke())) {
    iconStroke = legendItem.iconStroke().call(this.color());
  }
  if (goog.isFunction(legendItem.iconHatchFill())) {
    iconHatchFill = legendItem.iconHatchFill().call(this.autoHatchFill_);
  }
  var itemText;
  if (goog.isFunction(itemsTextFormatter)) {
    var format = this.createLegendContextProvider_();
    itemText = itemsTextFormatter.call(format, format);
  }
  if (!goog.isString(itemText))
    itemText = goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index();

  var ret = {
    'meta': /** @type {Object} */ (this.meta()),
    'text': /** @type {string} */ (itemText),
    'iconEnabled': true,
    'iconType': this.getLegendIconType(),
    'iconStroke': iconStroke || this.getFinalStroke(false, false),
    'iconFill': iconFill || this.getFinalFill(false, false),
    'iconHatchFill': iconHatchFill || this.getFinalHatchFill(false, false),
    'disabled': !this.enabled()
  };
  goog.object.extend(ret, json);
  return ret;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Restore series default settings.
 * @return {anychart.core.cartesian.series.Base} Return itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.restoreDefaults = function() {
  return this;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.CartesianSeriesType} Series type.
 */
anychart.core.cartesian.series.Base.prototype.getType = goog.abstractMethod;


/**
 * Gets legend icon type for the series.
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.cartesian.series.Base.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.SQUARE);
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getEnableChangeSignals = function() {
  return goog.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


/**
 * Getter/Setter for an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error.
 * @return {(anychart.core.utils.Error|anychart.core.cartesian.series.Base)} Series error or self for chaining.
 */
anychart.core.cartesian.series.Base.prototype.error = function(opt_value) {
  if (!this.isErrorAvailable())
    anychart.utils.warning(anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR, undefined, [this.getType()]);
  if (!this.error_) {
    this.error_ = new anychart.core.utils.Error(this);
    this.registerDisposable(this.error_);
    this.error_.listenSignals(this.onErrorSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.error_.setup(opt_value);
    return this;
  }

  return this.error_;
};


/**
 * Listener for error invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.onErrorSignal_ = function(event) {
  var state = anychart.ConsistencyState.APPEARANCE;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.cartesian.series.Base.prototype.resetErrorPaths = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.errorPaths_) {
    for (var hash in this.errorPaths_) {
      var path = this.errorPaths_[hash];
      path.clear();
      path.parent(null);
      delete this.errorPaths_[hash];
    }
  } else
    this.errorPaths_ = {};
};


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 */
anychart.core.cartesian.series.Base.prototype.getErrorPath = function(stroke) {
  var hash = '' + this.getIterator().getIndex() + anychart.utils.hash(stroke);
  if (hash in this.errorPaths_)
    return this.errorPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.cartesian.series.Base.ZINDEX_ERROR_PATH));

    this.rootLayer.addChild(path);
    this.makeHoverable(path);
    path.stroke(stroke);
    path.fill(null);
    this.errorPaths_[hash] = path;
    return path;
  }
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.cartesian.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Draws an error.
 */
anychart.core.cartesian.series.Base.prototype.drawError = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var error = this.error();
    var errorMode = error.mode();
    var isBarBased = this.isBarBased();

    switch (errorMode) {
      case anychart.enums.ErrorMode.NONE:
        break;
      case anychart.enums.ErrorMode.X:
        error.draw(true, isBarBased);
        break;
      case anychart.enums.ErrorMode.VALUE:
        error.draw(false, isBarBased);
        break;
      case anychart.enums.ErrorMode.BOTH:
        error.draw(true, isBarBased);
        error.draw(false, isBarBased);
        break;
    }
  }
};


/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.cartesian.series.Base)} Legend item settings or self for chaining.
 */
anychart.core.cartesian.series.Base.prototype.legendItem = function(opt_value) {
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
anychart.core.cartesian.series.Base.prototype.onLegendItemSignal_ = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));
  if (!isNaN(this.pointPosition_))
    json['xPointPosition'] = this.pointPosition_;
  if (goog.isDef(this.name()))
    json['name'] = this.name();
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  json['data'] = this.data().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['tooltip'] = this.tooltip().serialize();
  if (this.isErrorAvailable())
    json['error'] = this.error().serialize();
  json['legendItem'] = this.legendItem().serialize();
  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.utils.warning(
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
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.utils.warning(
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
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverHatchFill']
      );
    } else {
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
    }
  }
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  if (goog.isFunction(this['fill']))
    this.fill(config['fill']);
  if (goog.isFunction(this['hoverFill']))
    this.hoverFill(config['hoverFill']);
  if (goog.isFunction(this['stroke']))
    this.stroke(config['stroke']);
  if (goog.isFunction(this['hoverStroke']))
    this.hoverStroke(config['hoverStroke']);
  if (goog.isFunction(this['hatchFill']))
    this.hatchFill(config['hatchFill']);
  if (goog.isFunction(this['hoverHatchFill']))
    this.hoverHatchFill(config['hoverHatchFill']);
  this.color(config['color']);
  if (this.isErrorAvailable())
    this.error(config['error']);
  this.xPointPosition(config['xPointPosition']);
  this.name(config['name']);
  this.meta(config['meta']);
  if ('data' in config)
    this.data(config['data'] || null);
  this.labels(config['labels']);
  this.hoverLabels(config['hoverLabels']);
  this.tooltip(config['tooltip']);
  this.clip(config['clip']);
  this.legendItem(config['legendItem']);
};


//anychart.core.cartesian.series.Base.prototype['draw'] = anychart.core.cartesian.series.Base.prototype.draw;//doc|ex
//anychart.core.cartesian.series.Base.prototype['drawPoint'] = anychart.core.cartesian.series.Base.prototype.drawPoint;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['drawMissing'] = anychart.core.cartesian.series.Base.prototype.drawMissing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['startDrawing'] = anychart.core.cartesian.series.Base.prototype.startDrawing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['finalizeDrawing'] = anychart.core.cartesian.series.Base.prototype.finalizeDrawing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['getIterator'] = anychart.core.cartesian.series.Base.prototype.getIterator;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['getResetIterator'] = anychart.core.cartesian.series.Base.prototype.getResetIterator;//doc|need-ex
//exports
anychart.core.cartesian.series.Base.prototype['clip'] = anychart.core.cartesian.series.Base.prototype.clip;//doc|ex
anychart.core.cartesian.series.Base.prototype['color'] = anychart.core.cartesian.series.Base.prototype.color;//doc|ex
anychart.core.cartesian.series.Base.prototype['name'] = anychart.core.cartesian.series.Base.prototype.name;//doc|ex
anychart.core.cartesian.series.Base.prototype['meta'] = anychart.core.cartesian.series.Base.prototype.meta;//doc|ex
anychart.core.cartesian.series.Base.prototype['data'] = anychart.core.cartesian.series.Base.prototype.data;//doc|ex
anychart.core.cartesian.series.Base.prototype['labels'] = anychart.core.cartesian.series.Base.prototype.labels;//doc|ex
anychart.core.cartesian.series.Base.prototype['hoverLabels'] = anychart.core.cartesian.series.Base.prototype.hoverLabels;
anychart.core.cartesian.series.Base.prototype['tooltip'] = anychart.core.cartesian.series.Base.prototype.tooltip;//doc/ex
anychart.core.cartesian.series.Base.prototype['xPointPosition'] = anychart.core.cartesian.series.Base.prototype.xPointPosition;//doc|ex
anychart.core.cartesian.series.Base.prototype['xScale'] = anychart.core.cartesian.series.Base.prototype.xScale;//doc|ex
anychart.core.cartesian.series.Base.prototype['yScale'] = anychart.core.cartesian.series.Base.prototype.yScale;//doc|ex
anychart.core.cartesian.series.Base.prototype['error'] = anychart.core.cartesian.series.Base.prototype.error;
anychart.core.cartesian.series.Base.prototype['legendItem'] = anychart.core.cartesian.series.Base.prototype.legendItem;
anychart.core.cartesian.series.Base.prototype['hover'] = anychart.core.cartesian.series.Base.prototype.hover;
