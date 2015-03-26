goog.provide('anychart.core.scatter.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Base class for all scatter series.<br/>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.utils.ISeriesWithError}
 */
anychart.core.scatter.series.Base = function(opt_data, opt_csvSettings) {
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
  this.labels().disablePointerEvents(false);
  this.labels().listen(acgraph.events.EventType.MOUSEOVER, this.handleLabelMouseOver, false, this);
  this.labels().listen(acgraph.events.EventType.MOUSEOUT, this.handleLabelMouseOut, false, this);
  this.labels().position(anychart.enums.Position.CENTER);
  this.labels().enabled(false);
  (/** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels())).enabled(null);

  /**
   * @type {(acgraph.vector.Stroke|Function|null)}
   * @private
   */
  this.stroke_ = (function() {
    return anychart.color.darken(this['sourceColor']);
  });

  /**
   * @type {(acgraph.vector.Fill|Function|null)}
   * @private
   */
  this.fill_ = (function() {
    return this['sourceColor'];
  });


  /**
   * @type {(acgraph.vector.Fill|Function|null)}
   * @private
   */
  this.hoverFill_ = (function() {
    return anychart.color.lighten(this['sourceColor']);
  });


  /**
   * Hatch fill.
   * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
   * @private
   */
  this.hatchFill_ = (function() {
    return this['sourceHatchFill'];
  });


  /**
   * Hover hatch fill.
   * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
   * @private
   */
  this.hoverHatchFill_;

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

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.scatter.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.scatter.series.Base.SeriesTypesMap = {};


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.core.scatter.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 */
anychart.core.scatter.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.pixelBoundsCache;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.scatter.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.scatter.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.scatter.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Error path z-index in series root layer.
 * @type {number}
 */
anychart.core.scatter.series.Base.ZINDEX_ERROR_PATH = 3;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.core.scatter.series.Base.prototype.name_;


/**
 * Series index.
 * @type {number}
 * @private
 */
anychart.core.scatter.series.Base.prototype.index_;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.core.scatter.series.Base.prototype.clip_ = false;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.rootLayer;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.core.scatter.series.Base.prototype.meta_;


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.core.scatter.series.Base.prototype.data_;


/**
 * @type {Object}
 * @private
 */
anychart.core.scatter.series.Base.prototype.statistics_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.core.scatter.series.Base.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.core.scatter.series.Base.prototype.parentViewToDispose_;


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.scatter.series.Base.prototype.axesLinesSpace_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.core.scatter.series.Base.prototype.iterator_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.pointDrawn = false;


/**
 * @type {anychart.scales.ScatterBase}
 * @private
 */
anychart.core.scatter.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.ScatterBase}
 * @private
 */
anychart.core.scatter.series.Base.prototype.xScale_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.scatter.series.Base.prototype.labels_ = null;


/**
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.scatter.series.Base.prototype.hoverLabels_ = null;


/**
 * @type {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.scatter.series.Base.prototype.tooltip_ = null;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.zeroY = 0;


/**
 * Series color. See this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.scatter.series.Base.prototype.color_ = null;


/**
 * Series color from chart. See. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.core.scatter.series.Base.prototype.autoColor_ = null;


/**
 * Hatch fill type from chart.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.autoHatchFill_;


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.core.scatter.series.Base.prototype.hoverStroke_ = null;


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleLabelMouseOver = function(event) {
  if (event && goog.isDef(event['labelIndex'])) {
    this.hoverPoint(event['labelIndex'], event);
    var labelElement = this.labels().getLabel(event['labelIndex']).getDomElement();
    acgraph.events.listen(labelElement, acgraph.events.EventType.MOUSEMOVE, this.handleLabelMouseMove, false, this);
  } else
    this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleLabelMouseOut = function(event) {
  var labelElement = this.labels().getLabel(event['labelIndex']).getDomElement();
  acgraph.events.unlisten(labelElement, acgraph.events.EventType.MOUSEMOVE, this.handleLabelMouseMove, false, this);
  this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleLabelMouseMove = function(event) {
  if (event && goog.isDef(event.target['__tagIndex']))
    this.hoverPoint(event.target['__tagIndex'], event);
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
 * @return {anychart.core.scatter.series.Base|Object.<number>|number}
 */
anychart.core.scatter.series.Base.prototype.statistics = function(opt_name, opt_value) {
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
 * @example
 * chart = anychart.scatterChart();
 * var formatterFunc = function(){ return this.seriesName;};
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series
 *     .name('My Custom series name')
 *     .tooltip()
 *          .contentFormatter(formatterFunc);
 * chart.legend().enabled(true);
 * chart.container(stage).draw();
 * @param {string=} opt_value Value to set.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.core.scatter.series.Base|undefined)} Series name value or itself for method chaining.
 */
anychart.core.scatter.series.Base.prototype.name = function(opt_value) {
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
 * @example
 * chart = anychart.scatterChart();
 * chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]).clip(false);
 * chart.yScale().minimum(11);
 * chart.container(stage).draw();
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.scatter.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.scatter.series.Base.prototype.clip = function(opt_value) {
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
anychart.core.scatter.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * @return {anychart.core.scatter.series.Base|number}
 */
anychart.core.scatter.series.Base.prototype.index = function(opt_value) {
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
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.meta({
 *     'location': 'QA',
 *     'source': 'http://some-url.dmn',
 *     'imageSRC': 'http://some-url.dmn/getImage.php?bySomeParam=Value'
 * });
 * chart.container(stage).draw();
 * @param {*=} opt_object Object to replace metadata.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Add/Replace meta data for series by key.
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.meta('location', 'QA');
 * series.meta('source', 'http://some-url.dmn');
 * series.meta('imageSRC', 'http://some-url.dmn/getImage.php?bySomeParam=Value');
 * chart.container(stage).draw();
 * @param {string=} opt_key Metadata key.
 * @param {*=} opt_value Metadata value.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.core.scatter.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
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
 * @example
 * chart = anychart.scatterChart();
 * chart.marker()
 *        .data([
 *           [4.1, 10],
 *           [2.3, 6],
 *           [3.4, 17],
 *           [1.2, 20]
 *        ]);
 * chart.container(stage).draw();
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.scatter.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.scatter.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
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
    this.data_ = this.parentView_.derive();
    this.data_.listenSignals(this.onDataSignal_, this);
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
anychart.core.scatter.series.Base.prototype.onDataSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.scatter.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.scatter.series.Base.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are 'x', 'value'.
 * If there are several values return array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<number>|null} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.scatter.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.ScatterBase} */(this.yScale());
  var xScale = /** @type {anychart.scales.ScatterBase} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;

  var valX = iterator.get('x');
  var valY = iterator.get('value');

  if (!goog.isDef(valX) || !goog.isDef(valY)) {
    return null;
  }

  var pixX = xScale.isMissing(valX) ? NaN : this.applyRatioToBounds(xScale.transform(valX), true);
  if (yScale.isMissing(valY))
    valY = NaN;
  var pixY = this.applyRatioToBounds(yScale.transform(valY), false);

  if (isNaN(pixX) || isNaN(pixY)) fail = true;

  res.push(pixX, pixY);

  return fail ? null : res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.isSizeBased = function() {
  return false;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.hasMarkers = function() {
  return false;
};


/**
 * Tester if the series can have an error. (line, marker).
 * @return {boolean}
 */
anychart.core.scatter.series.Base.prototype.isErrorAvailable = function() {
  return true;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error or self for chaining.
 * @return {(anychart.core.utils.Error|anychart.core.scatter.series.Base)}
 */
anychart.core.scatter.series.Base.prototype.error = function(opt_value) {
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
anychart.core.scatter.series.Base.prototype.onErrorSignal_ = function(event) {
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
anychart.core.scatter.series.Base.prototype.resetErrorPaths = function() {
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
 * @protected
 */
anychart.core.scatter.series.Base.prototype.getErrorPath = function(stroke) {
  var hash = '' + this.getIterator().getIndex() + anychart.utils.hash(stroke);
  if (hash in this.errorPaths_)
    return this.errorPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.scatter.series.Base.ZINDEX_ERROR_PATH));

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
anychart.core.scatter.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Draws an error.
 */
anychart.core.scatter.series.Base.prototype.drawError = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var error = this.error();
    var errorMode = error.mode();
    var isBarBased = false;

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
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 */
anychart.core.scatter.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.pointDrawn = this.drawSeriesPoint()) {
      this.drawLabel(false);
      if (this.isErrorAvailable())
        this.drawError();
    }
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.scatter.series.Base.prototype.startDrawing = function() {
  this.pointDrawn = false;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.registerDisposable(this.rootLayer);
  }

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.pixelBoundsCache = /** @type {anychart.math.Rect} */(this.getPixelBounds());

  this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false));

  this.checkDrawingNeeded();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.resetErrorPaths();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(this.pixelBoundsCache);
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.applyAxesLinesSpace = function(value) {
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
anychart.core.scatter.series.Base.prototype.finalizeDrawing = function() {
  this.labels().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBoundsCache : this.clip());
    var labelDOM = this.labels().getDomElement();
    if (labelDOM) labelDOM.clip(/** @type {acgraph.math.Rect} */(bounds));
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
 * Draws marker for a point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.drawLabel = function(hovered) {
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
    var labelPosition = pointLabel && pointLabel['position'] ? pointLabel['position'] : null;
    var labelHoverPosition = hoverPointLabel && hoverPointLabel['position'] ? hoverPointLabel['position'] : null;
    var position = hovered ?
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
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.core.scatter.series.Base.prototype.showTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());

  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(opt_event.clientX, opt_event.clientY));
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
anychart.core.scatter.series.Base.prototype.hideTooltip = function() {
  /** @type {anychart.core.ui.Tooltip} */(this.tooltip()).hide();
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.createFormatProvider = function() {
  if (!this.pointProvider_) {
    var referenceValueNames = this.isSizeBased() ? ['x', 'value', 'size'] : ['x', 'value'];
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, referenceValueNames,
        this.isErrorAvailable() && anychart.core.utils.Error.isErrorAvailableForScale(this.xScale_));
  }
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.createPositionProvider = function(position) {
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
 * Draws series point.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.drawSeriesPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {acgraph.math.Rect} */
  var bounds = this.pixelBoundsCache;
  var min, range;
  if (horizontal) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleMouseOver = function(event) {
  var res = this.dispatchEvent(new anychart.core.scatter.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target) {
      if (goog.isDef(event.target['__tagIndex'])) {
        this.hoverPoint(/** @type {number} */ (event.target['__tagIndex']), event);
        acgraph.events.listen(
            event.target,
            acgraph.events.EventType.MOUSEMOVE,
            this.handleMouseMove,
            false,
            this);
      } else if (event.target['__tagSeriesGlobal'])
        this.hoverSeries();
      else
        this.unhover();
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleMouseMove = function(event) {
  var res = this.dispatchEvent(new anychart.core.scatter.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target && goog.isDef(event.target['__tagIndex'])) {
      if (!goog.isNull(event.target['__tagIndex'])) {
        this.hoverPoint(/** @type {number} */ (event.target['__tagIndex']), event);
      }
    }
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleMouseOut = function(event) {
  var res = this.dispatchEvent(new anychart.core.scatter.series.Base.BrowserEvent(this, event));
  if (res) {
    acgraph.events.unlisten(
        event.target,
        acgraph.events.EventType.MOUSEMOVE,
        this.handleMouseMove,
        false,
        this);
    this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event
 * @protected
 */
anychart.core.scatter.series.Base.prototype.handleBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.core.scatter.series.Base.BrowserEvent(this, event));
};


/**
 * Series hover status. NaN - not hovered, -1 - series hovered, non-negative number - point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.core.scatter.series.Base.prototype.hoverStatus = NaN;


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.scatter.series.Base} An instance of the {@link anychart.core.scatter.series.Base} class for method chaining.
 */
anychart.core.scatter.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.core.scatter.series.Base}  {@link anychart.core.scatter.series.Base} instance for method chaining.
 */
anychart.core.scatter.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 */
anychart.core.scatter.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.core.scatter.series.Base.prototype.makeHoverable = function(element, opt_seriesGlobal) {
  if (!element) return;
  if (opt_seriesGlobal)
    element['__tagSeriesGlobal'] = true;
  else
    element['__tagIndex'] = this.getIterator().getIndex();
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOver, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.CLICK, this.handleBrowserEvents, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.DBLCLICK, this.handleBrowserEvents, false, this);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series X scale.
 * @return {anychart.scales.ScatterBase} Current series X Scale.
 *//**
 * Setter for series X scale.
 * @example
 * chart = anychart.scatterChart();
 * chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * var secondScale = anychart.scales.log();
 * chart.xAxis(1)
 *     .scale(secondScale)
 *     .stroke('red')
 *     .orientation('top')
 *     .title('Log axis');
 * chart.xAxis(0).stroke('blue');
 * chart.marker([
 *    [4.1, 12],
 *    [32.3, 14],
 *    [163.4, 6],
 *    [761.2, 12]
 * ]).xScale(secondScale);
 * chart.container(stage).draw();
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.core.scatter.series.Base}  {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.ScatterBase=} opt_value Value to set.
 * @return {(anychart.scales.ScatterBase|!anychart.core.scatter.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.onScaleSignal_, this);
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.onScaleSignal_, this);
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
 * @return {anychart.scales.ScatterBase} Current series Y Scale.
 *//**
 * Setter for series Y scale.
 * @example
 * chart = anychart.scatterChart();
 * chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * var secondScale = anychart.scales.log();
 * chart.yAxis(1).scale(secondScale);
 * chart.yAxis(1).orientation('right').stroke('red');
 * chart.yAxis(0).stroke('blue');
 * chart.marker([
 *    [4.4, 30],
 *    [2.8, 6],
 *    [3.0, 127],
 *    [1.5, 620]
 * ]).yScale(secondScale);
 * chart.container(stage).draw();
 * @param {anychart.scales.ScatterBase=} opt_value Value to set.
 * @return {!anychart.core.scatter.series.Base}  {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.ScatterBase=} opt_value Value to set.
 * @return {(anychart.scales.ScatterBase|!anychart.core.scatter.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.onScaleSignal_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.onScaleSignal_, this);
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
anychart.core.scatter.series.Base.prototype.onScaleSignal_ = function(event) {
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
 * @return {!anychart.core.ui.Tooltip} Tooltip instance.
 *//**
 * Setter for series data tooltip.
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.tooltip()
 *     .background()
 *     .stroke('2 #cc8800').fill('grey 0.5');
 * chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * <b>Note:</b> Pass <b>null</b> or <b>'none'</b> to turn off tooltip.
 * @return {!anychart.core.scatter.series.Base} An instance of the {@link anychart.core.scatter.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.scatter.series.Base|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.tooltip = function(opt_value) {
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
anychart.core.scatter.series.Base.prototype.onTooltipSignal_ = function(event) {
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
 * @return {!anychart.core.ui.LabelsFactory} Labels instance.
 *//**
 * Setter for series data labels.
 * @example
 * chart = anychart.scatter();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.labels()
 *    .fontColor('white')
 *    .fontWeight('bold');
 * chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * <b>Note:</b> Pass <b>null</b> or <b>'none'</b> to turn off a label.
 * @return {!anychart.core.scatter.series.Base} An instance of the {@link anychart.core.scatter.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.scatter.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.scatter.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.hoverLabels = function(opt_value) {
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
anychart.core.scatter.series.Base.prototype.labelsInvalidated_ = function(event) {
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
anychart.core.scatter.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var value = iterator.get('value');
    if (value) {
      var y = anychart.utils.toNumber(value);
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
 * @example <c>Solid color</c>
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.color('green');
 * chart.container(stage).draw();
 * @example <c>Linear gradient color</c>
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.color(['green', 'yellow']);
 * chart.container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.color('green', 0.4);
 * chart.container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Linear gradient.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.color(['black', 'yellow'], 45, true, 0.5);
 * chart.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Radial gradient.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 * chart = anychart.scatterChart();
 * var series = chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * series.color(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81)
 * chart.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.scatter.series.Base)} .
 */
anychart.core.scatter.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = anychart.utils.isNone(opt_fillOrColorOrKeys) ? null : acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.color_ || this.autoColor_ || 'blue';
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.scatter.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.scatter.series.Base.prototype.setAutoMarkerType = goog.abstractMethod;


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.scatter.series.Base.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill_ = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.core.scatter.series.Base.prototype.getFinalHatchFill = function(usePointSettings, hover) {
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
anychart.core.scatter.series.Base.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill_ ||
        acgraph.vector.normalizeHatchFill(anychart.core.scatter.series.Base.DEFAULT_HATCH_FILL_TYPE);
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
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.scatter.series.Base.prototype.getFinalFill = function(usePointSettings, hover) {
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.scatter.series.Base|Function} .
 */
anychart.core.scatter.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.scatter.series.Base|Function} .
 */
anychart.core.scatter.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    return this;
  }
  return this.hoverFill_;
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.scatter.series.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.SERIES_HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.scatter.series.Base|Function|boolean} Hatch fill.
 */
anychart.core.scatter.series.Base.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
 * Getter for current stroke settings.
 * @return {!acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @example
 * chart = anychart.scatter();
 * chart.line([
 *   [4.1, 8],
 *   [2.3, 6],
 *   [3.4, 15],
 *   [1.2, 18]
 * ]).stroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 * );
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 * chart = anychart.scatter();
 * chart.line([
 *   [4.1, 8],
 *   [2.3, 6],
 *   [3.4, 15],
 *   [1.2, 18]
 * ]).stroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.scatter.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.scatter.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter for current stroke settings.
 * @return {!acgraph.vector.Stroke} Current stroke settings.
 *//**
 * Setter for series stroke by function.<br/>
 * <b>Note:</b> For all ContiniousBase series (line/spline/area etc) hoverStroke works only with hoverSeries.
 * @example
 * chart = anychart.scatter();
 * chart.line([
 *   [4.1, 8],
 *   [2.3, 6],
 *   [3.4, 15],
 *   [1.2, 18]
 * ]).hoverStroke(
 *      function(){
 *        return '5 '+ this.sourceColor;
 *      }
 * );
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Function that looks like <code>function(){
 *    // this.sourceColor - color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * Setter for stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> For all ContiniousBase series (line/spline/area etc) hoverStroke works only with hoverSeries.
 * @example
 * chart = anychart.scatter();
 * chart.line([
 *   [4.1, 8],
 *   [2.3, 6],
 *   [3.4, 15],
 *   [1.2, 18]
 * ]).hoverStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.scatter.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.core.scatter.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
anychart.core.scatter.series.Base.prototype.getFinalStroke = function(usePointSettings, hover) {
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
anychart.core.scatter.series.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color_ || this.autoColor_ || 'blue';
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
 * Return color for legend item.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Color for legend item.
 */
anychart.core.scatter.series.Base.prototype.getLegendItemData = function() {
  return /** @type {!anychart.core.ui.Legend.LegendItemProvider} */ ({
    'index': this.index(),
    'text': goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index(),
    'iconType': this.getLegendIconType() || anychart.enums.LegendItemIconType.SQUARE,
    'iconStroke': this.getFinalStroke(false, false),
    'iconFill': this.getLegendIconFill(),
    'iconHatchFill': this.getLegendIconHatchFill(),
    'iconMarker': null,
    'meta': this.meta()
  });
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Restore series default settings.
 * @return {anychart.core.scatter.series.Base} Return itself for chaining call.
 */
anychart.core.scatter.series.Base.prototype.restoreDefaults = function() {
  return this;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.ScatterSeriesTypes} Series type.
 */
anychart.core.scatter.series.Base.prototype.getType = goog.abstractMethod;


/**
 * Gets legend icon type for the series.
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.scatter.series.Base.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.SQUARE);
};


/**
 * Gets color for legend item fill.
 * @return {?acgraph.vector.Fill}
 */
anychart.core.scatter.series.Base.prototype.getLegendIconFill = function() {
  return /** @type {acgraph.vector.Fill} */(this.getFinalFill(false, false));
};


/**
 * Gets hatch for legend item hatch fill.
 * @return {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)}
 */
anychart.core.scatter.series.Base.prototype.getLegendIconHatchFill = function() {
  return /** @type {(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(this.getFinalHatchFill(false, false));
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));
  if (goog.isDef(this.name()))
    json['name'] = this.name();
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  json['data'] = this.data().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['error'] = this.error().serialize();
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
anychart.core.scatter.series.Base.prototype.setupByJSON = function(config) {
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
  this.error(config['error']);
  this.name(config['name']);
  this.meta(config['meta']);
  if ('data' in config)
    this.data(config['data'] || null);
  this.labels(config['labels']);
  this.hoverLabels(config['hoverLabels']);
  this.tooltip(config['tooltip']);
  this.clip(config['clip']);
};



/**
 * Encapsulates browser event for acgraph.
 * @param {anychart.core.scatter.series.Base} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.core.scatter.series.Base.BrowserEvent = function(target, opt_e) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, target);

  /**
   * Point index.
   * @type {number}
   */
  this['pointIndex'] = opt_e && opt_e.target && opt_e.target['__tagIndex'];
  if (isNaN(this['pointIndex']))
    this['pointIndex'] = -1;

  /**
   * Series data iterator ready for the point capturing.
   * @type {!anychart.data.Iterator}
   */
  this['iterator'] = target.data().getIterator();
  this['iterator'].select(this['pointIndex']) || this['iterator'].reset();

  /**
   * Series.
   * @type {anychart.core.scatter.series.Base}
   */
  this['series'] = target;
};
goog.inherits(anychart.core.scatter.series.Base.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.core.scatter.series.Base.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.core.scatter.series.Base.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  var type = e.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DOUBLE_CLICK;
      break;
  }
  this.type = type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};


//anychart.core.scatter.series.Base.prototype['drawPoint'] = anychart.core.scatter.series.Base.prototype.drawPoint;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['startDrawing'] = anychart.core.scatter.series.Base.prototype.startDrawing;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['finalizeDrawing'] = anychart.core.scatter.series.Base.prototype.finalizeDrawing;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['getIterator'] = anychart.core.scatter.series.Base.prototype.getIterator;//doc|need-ex
//anychart.core.scatter.series.Base.prototype['getResetIterator'] = anychart.core.scatter.series.Base.prototype.getResetIterator;//doc|need-ex
//exports
anychart.core.scatter.series.Base.prototype['clip'] = anychart.core.scatter.series.Base.prototype.clip;//doc|ex
anychart.core.scatter.series.Base.prototype['color'] = anychart.core.scatter.series.Base.prototype.color;//doc|ex
anychart.core.scatter.series.Base.prototype['name'] = anychart.core.scatter.series.Base.prototype.name;//doc|ex
anychart.core.scatter.series.Base.prototype['meta'] = anychart.core.scatter.series.Base.prototype.meta;//doc|ex
anychart.core.scatter.series.Base.prototype['data'] = anychart.core.scatter.series.Base.prototype.data;//doc
anychart.core.scatter.series.Base.prototype['labels'] = anychart.core.scatter.series.Base.prototype.labels;//doc|ex
anychart.core.scatter.series.Base.prototype['hoverLabels'] = anychart.core.scatter.series.Base.prototype.hoverLabels;//doc|ex
anychart.core.scatter.series.Base.prototype['tooltip'] = anychart.core.scatter.series.Base.prototype.tooltip;//doc|ex
anychart.core.scatter.series.Base.prototype['xScale'] = anychart.core.scatter.series.Base.prototype.xScale;//doc|ex
anychart.core.scatter.series.Base.prototype['yScale'] = anychart.core.scatter.series.Base.prototype.yScale;//doc|ex
anychart.core.scatter.series.Base.prototype['error'] = anychart.core.scatter.series.Base.prototype.error;
