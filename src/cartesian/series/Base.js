goog.provide('anychart.cartesian.series.Base');
goog.require('acgraph');
goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.color');
goog.require('anychart.data');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.enums');



/**
 * Base class for all cartesian series.<br/>
 * Base class defines common methods, such as those for:
 * <ul>
 *   <li>Binding series to a scale: <i>xScale, yScale</i></li>
 *   <li>Base color settings: <i>color</i></li>
 * </ul>
 * You can also obtain <i>getIterator, getResetIterator</i> iterators here.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.cartesian.series.Base = function(data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  goog.base(this);
  this.data(data, opt_csvSettings);

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
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
  (/** @type {anychart.elements.LabelsFactory} */(this.hoverLabels())).enabled(null);

  this.hatchFill(false);

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.cartesian.series.Base, anychart.VisualBaseWithBounds);


/**
 * Map of series constructors by type.
 * @type {Object.<anychart.enums.CartesianSeriesType, Function>}
 */
anychart.cartesian.series.Base.SeriesTypesMap = {};


/**
 * For internal use.
 * @param {number} value Calculated bar width ratio.
 */
anychart.cartesian.series.Base.prototype.setAutoBarWidth = goog.nullFunction;


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.cartesian.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 */
anychart.cartesian.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


/**
 * Supported signals.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS |
    anychart.ConsistencyState.DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.cartesian.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.cartesian.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.cartesian.series.Base.prototype.name_;


/**
 * Series index.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.index_;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.cartesian.series.Base.prototype.clip_ = false;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.cartesian.series.Base.prototype.rootLayer;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.cartesian.series.Base.prototype.meta_;


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.data_;


/**
 * @type {Object}
 * @private
 */
anychart.cartesian.series.Base.prototype.statistics_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentViewToDispose_;


/**
 * @type {anychart.utils.Padding}
 * @private
 */
anychart.cartesian.series.Base.prototype.axesLinesSpace_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.cartesian.series.Base.prototype.iterator_;


/**
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.xScale_ = null;


/**
 * @type {anychart.elements.LabelsFactory}
 * @private
 */
anychart.cartesian.series.Base.prototype.labels_ = null;


/**
 * @type {anychart.elements.LabelsFactory}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverLabels_ = null;


/**
 * @type {anychart.elements.Tooltip}
 * @private
 */
anychart.cartesian.series.Base.prototype.tooltip_ = null;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.pointPosition_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoPointPosition_ = 0.5;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.zeroY = 0;


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValueNames;


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
anychart.cartesian.series.Base.prototype.referenceValueMeanings;


/**
 * Whether getReferenceCoords() must support stacking.
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.cartesian.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


/**
 * Series color. See this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.color_ = null;


/**
 * Series color from chart. See. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoColor_ = null;


/**
 * Hatch fill type from chart.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.cartesian.series.Base.prototype.autoHatchFill_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null|boolean)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverHatchFill_;


/**
 * @type {anychart.enums.MarkerType}
 * @protected
 */
anychart.cartesian.series.Base.prototype.autoMarkerType;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.fill_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.cartesian.series.Base.prototype.strokeInternal = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverStroke_ = null;


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseOver = function(event) {
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
anychart.cartesian.series.Base.prototype.handleLabelMouseOut = function(event) {
  var labelElement = this.labels().getLabel(event['labelIndex']).getDomElement();
  acgraph.events.unlisten(labelElement, acgraph.events.EventType.MOUSEMOVE, this.handleLabelMouseMove, false, this);
  this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseMove = function(event) {
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
 * @return {anychart.cartesian.series.Base|Object.<number>|number}
 */
anychart.cartesian.series.Base.prototype.statistics = function(opt_name, opt_value) {
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.cartesian.series.Base|undefined)} Series name value or itself for method chaining.
 */
anychart.cartesian.series.Base.prototype.name = function(opt_value) {
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
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.cartesian.series.Base|boolean|anychart.math.Rect} .
 */
anychart.cartesian.series.Base.prototype.clip = function(opt_value) {
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
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.VisualBase|anychart.utils.Padding)} .
 */
anychart.cartesian.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (arguments.length > 0) {
    if (arguments.length > 1) {
      this.axesLinesSpace_.set.apply(this.axesLinesSpace_, arguments);
    } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Padding) {
      this.axesLinesSpace_.deserialize(opt_spaceOrTopOrTopAndBottom.serialize());
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      this.axesLinesSpace_.deserialize(opt_spaceOrTopOrTopAndBottom);
    } else {
      this.axesLinesSpace_.set(opt_spaceOrTopOrTopAndBottom);
    }
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


/**
 * Sets/gets series number.
 * @param {number=} opt_value
 * @return {anychart.cartesian.series.Base|number}
 */
anychart.cartesian.series.Base.prototype.index = function(opt_value) {
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
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Add/Replace meta data for series by key.
 * @example <t>lineChart</t>
 * var series = chart.line([1,2,3]);
 * series.meta('location', 'QA');
 * series.meta('source', 'http://some-url.dmn');
 * series.meta('imageSRC', 'http://some-url.dmn/getImage.php?bySomeParam=Value');
 * @param {string=} opt_key Metadata key.
 * @param {*=} opt_value Metadata value.
 * @return {anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.cartesian.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
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
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.cartesian.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.cartesian.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
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
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.DATA,
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
anychart.cartesian.series.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 */
anychart.cartesian.series.Base.prototype.resetCategorisation = function() {
  if (this.data_ != this.parentView_)
    goog.dispose(this.data_);
  this.data_ = /** @type {!anychart.data.View} */(this.parentView_);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.cartesian.series.Base.prototype.categoriseData = function(categories) {
  this.data_ = this.parentView_.prepare('x', categories);
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.cartesian.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.cartesian.series.Base.prototype.getResetIterator = function() {
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
anychart.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = this.yScale();
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
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
anychart.cartesian.series.Base.prototype.getReferenceCoords = function() {
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
 * var chart = anychart.columnChart();
 * chart.column([1, 3, 3]).xPointPosition(0.3);
 * chart.column([1.2, 2.3, 2.3]).xPointPosition(0.5);
 * chart.column([1, 2.5, 1]).xPointPosition(0.7);
 * chart.container(stage).draw();
 * @param {number=} opt_position [0.5] Point position (in 0 to 1 range). <br/>
 *   For bars, columns and ohlc series it's autocalculated if chart contains more than one series.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_position [0.5] Point position (in 0 to 1 range).
 * @return {number|anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.xPointPosition = function(opt_position) {
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
 * @return {anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoPointPosition_ = +position;
  return this;
};


/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.cartesian.series.Base.prototype.isWidthBased = function() {
  return false;
};


/**
 * Tester if the series is bar based (bar, rangeBar).
 * @return {boolean}
 */
anychart.cartesian.series.Base.prototype.isBarBased = function() {
  return false;
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.cartesian.series.Base.prototype.isSizeBased = function() {
  return false;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.cartesian.series.Base.prototype.hasMarkers = function() {
  return false;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws series into the current container. If series has no scales - creates them.
 * @example
 * anychart.cartesian.series.line([1, 2, 1.3, 3])
 *    .container(stage)
 *    .draw(300, 300);
 * @param {number=} opt_parentWidth [0] Optional width of the parent container for series bounds calculation. By default use 100%.
 * @param {number=} opt_parentHeight [0] Optional height of the parent container for series bounds calculation. By default use 100%.
 * @return {anychart.cartesian.series.Base} An instance of {@link anychart.cartesian.series.Base} class for method chaining.
 */
anychart.cartesian.series.Base.prototype.draw = function(opt_parentWidth, opt_parentHeight) {
  this.suspendSignalsDispatching();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
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

  var hasParentBounds = goog.isDef(opt_parentWidth) && goog.isDef(opt_parentHeight);
  if (hasParentBounds)
    this.pixelBounds(/** @type {anychart.math.Rect} */(this.pixelBounds(opt_parentWidth, opt_parentHeight)));

  iterator = this.getResetIterator();
  this.startDrawing();
  while (iterator.advance())
    this.drawPoint();
  this.finalizeDrawing();

  if (hasParentBounds) this.pixelBounds(null);
  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 */
anychart.cartesian.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint();
    else
      this.firstPointDrawn = this.drawFirstPoint();
    if (this.firstPointDrawn) {
      this.drawLabel(false);
    }
  }
};


/**
 * This method is used by a parallel iterator in case series needs to
 * draw a missing point (given series has no such X, and other
 * series has it).
 */
anychart.cartesian.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE && this.referenceValuesSupportStack) {
    for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
      if (this.referenceValueMeanings[i] == 'y')
        this.yScale().applyStacking(NaN);
    }
  }
};


/** @inheritDoc */
anychart.cartesian.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.cartesian.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;

  if (!this.rootLayer)
    this.rootLayer = acgraph.layer();

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false));

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.cartesian.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBounds();
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
anychart.cartesian.series.Base.prototype.finalizeDrawing = function() {
  this.labels().draw();

  if (this.clip()) {
    var bounds = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.clip()) ? this.pixelBounds() : this.clip());
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
anychart.cartesian.series.Base.prototype.drawLabel = function(hovered) {
  var pointLabel = this.getIterator().get('label');
  var hoverPointLabel = hovered ? this.getIterator().get('hoverLabel') : null;
  var index = this.getIterator().getIndex();
  var labelsFactory = /** @type {anychart.elements.LabelsFactory} */(hovered ? this.hoverLabels() : this.labels());

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
anychart.cartesian.series.Base.prototype.showTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());

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
anychart.cartesian.series.Base.prototype.hideTooltip = function() {
  /** @type {anychart.elements.Tooltip} */(this.tooltip()).hide();
};


/**
 * Create base series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  var provider = {
    'index': index,
    'seriesName': this.name_ ? this.name_ : 'Series: ' + this.index_,
    'seriesPointsCount': this.statistics('seriesPointsCount'),
    'pointsCount': this.statistics('pointsCount')
  };

  var seriesMax = this.statistics('seriesMax');
  var seriesMin = this.statistics('seriesMin');
  var seriesSum = this.statistics('seriesSum');
  var seriesAverage = this.statistics('seriesAverage');
  var max = this.statistics('max');
  var min = this.statistics('min');
  var sum = this.statistics('sum');
  var average = this.statistics('average');

  provider['seriesMax'] = seriesMax;
  provider['seriesMin'] = seriesMin;
  provider['seriesSum'] = seriesSum;
  provider['seriesAverage'] = seriesAverage;
  provider['max'] = max;
  provider['min'] = min;
  provider['sum'] = sum;
  provider['average'] = average;

  var referenceName;
  for (var i in this.referenceValueNames) {
    referenceName = this.referenceValueNames[i];
    provider[referenceName] = iterator.get(referenceName);
  }

  return provider;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createPositionProvider = function(position) {
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
anychart.cartesian.series.Base.prototype.drawFirstPoint = function() {
  return this.drawSubsequentPoint();
};


/**
 * Draws subsequent point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.cartesian.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {acgraph.math.Rect} */
  var bounds = /** @type {acgraph.math.Rect} */(this.pixelBounds());
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
 * Get point index by event.
 * @param {acgraph.events.Event} event .
 * @protected
 * @return {?number} Point index.
 */
anychart.cartesian.series.Base.prototype.getIndexByEvent = function(event) {
  if (goog.isDef(event.target['__tagIndex']))
    return event.target['__tagIndex'];
  else
    return null;
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOver = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target) {
      var index = this.getIndexByEvent(event);
      if (!goog.isNull(index)) {
        this.hoverPoint(/** @type {number} */ (index), event);
        acgraph.events.listen(
            event.target,
            acgraph.events.EventType.MOUSEMOVE,
            this.handleMouseMove,
            false,
            this);
      }
      // TODO(AntonKagakin):
      // Due to the fact that continious series can get point index by the coordinate
      // we comment this for now - so no series selection.
      // Let's wait for feedback on this.
      //else if (event.target['__tagSeriesGlobal'])
      //  this.hoverSeries();
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
anychart.cartesian.series.Base.prototype.handleMouseMove = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target) {
      var index = this.getIndexByEvent(event);
      if (!goog.isNull(index)) {
        this.hoverPoint(/** @type {number} */ (index), event);
      }
    }
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOut = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
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
anychart.cartesian.series.Base.prototype.handleBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
};


/**
 * Series hover status. NaN - not hovered, -1 - series hovered, non-negative number - point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.hoverStatus = NaN;


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 */
anychart.cartesian.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.cartesian.series.Base}  {@link anychart.cartesian.series.Base} instance for method chaining.
 */
anychart.cartesian.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 */
anychart.cartesian.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * Temporarily works only for acgraph.vector.Element.
 * @param {acgraph.vector.Element} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.cartesian.series.Base.prototype.makeHoverable = function(element, opt_seriesGlobal) {
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
 * @return {!anychart.cartesian.series.Base}  {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.xScale = function(opt_value) {
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
 * @return {!anychart.cartesian.series.Base}  {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.yScale = function(opt_value) {
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
anychart.cartesian.series.Base.prototype.scaleInvalidated_ = function(event) {
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
 * @return {anychart.elements.Tooltip} Tooltip instance.
 *//**
 * Setter for series data tooltip.
 * @example <t>lineChart</t>
 * var tooltipSettings = anychart.elements.tooltip();
 * tooltipSettings
 *     .background()
 *     .stroke('2 #cc8800').fill('grey 0.5');
 * chart.line([1, 2, 1.2, 3.2]).tooltip(tooltipSettings);
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * <b>Note:</b> Pass <b>null</b> or <b>'none'</b> to turn off tooltip.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {!(anychart.cartesian.series.Base|anychart.elements.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.elements.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Tooltip) {
      this.tooltip_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.tooltip_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.tooltip_.enabled(false);
    }
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
anychart.cartesian.series.Base.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series data labels.
 * @return {anychart.elements.LabelsFactory} Labels instance.
 *//**
 * Setter for series data labels.
 * @example <t>lineChart</t>
 * var labelSettings = anychart.elements.labelsFactory();
 * labelSettings.enabled(true);
 * labelSettings.fontColor('white');
 * labelSettings.fontWeight('bold');
 * var series = chart.line([1,2,3]);
 * series.labels(labelSettings);
 * @param {(anychart.elements.LabelsFactory|Object|string|null)=} opt_value Series data labels settings.
 * <b>Note:</b> Pass <b>null</b> or <b>'none'</b> to turn off a label.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.LabelsFactory|Object|string|null)=} opt_value Series data labels settings.
 * @return {!(anychart.elements.LabelsFactory|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.LabelsFactory();
    this.registerDisposable(this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.labels_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labels_.enabled(false);
    }
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(anychart.elements.LabelsFactory|Object|string|null)=} opt_value Series data labels settings.
 * @return {!(anychart.elements.LabelsFactory|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.elements.LabelsFactory();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.LabelsFactory) {
      this.hoverLabels_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hoverLabels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.hoverLabels_.enabled(false);
    }
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
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
anychart.cartesian.series.Base.prototype.calculateStatistics = function() {
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).color('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.cartesian.series.Base)} .
 */
anychart.cartesian.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : acgraph.vector.normalizeFill.apply(null, arguments);
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
anychart.cartesian.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoMarkerType = value;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoHatchFill = function(value) {
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
 * var chart = anychart.columnChart();
 * chart.column([0.3, 3, 2.2, 1.7]).hatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.cartesian.series.Base.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
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
 * var chart = anychart.columnChart();
 * chart.column([0.3, 3, 2.2, 1.7]).hoverHatchFill('diamiond', 'grey', 5, 5);
 * chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function|boolean} Hatch fill.
 */
anychart.cartesian.series.Base.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
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
anychart.cartesian.series.Base.prototype.getFinalHatchFill = function(usePointSettings, hover) {
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
anychart.cartesian.series.Base.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = this.autoHatchFill_ ||
        acgraph.vector.normalizeHatchFill(anychart.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE);
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).fill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>lineChart</t>
 * chart.column([1, 4, 7, 1]).hoverFill('green', 0.4);
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
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
anychart.cartesian.series.Base.prototype.getFinalFill = function(usePointSettings, hover) {
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.strokeInternal) {
      this.strokeInternal = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
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
 * @return {!anychart.cartesian.series.Base} {@link anychart.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
anychart.cartesian.series.Base.prototype.getFinalStroke = function(usePointSettings, hover) {
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
anychart.cartesian.series.Base.prototype.normalizeColor = function(color, var_args) {
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
 * Return color for legend item.
 * @return {!anychart.elements.Legend.LegendItemProvider} Color for legend item.
 */
anychart.cartesian.series.Base.prototype.getLegendItemData = function() {
  return /** @type {!anychart.elements.Legend.LegendItemProvider} */ ({
    'index': this.index(),
    'text': goog.isDef(this.name()) ? this.name() : 'Series: ' + this.index(),
    'iconType': this.getLegendIconType() || anychart.enums.LegendItemIconType.SQUARE,
    'iconStroke': this.getFinalStroke(false, false),
    'iconFill': this.getFinalFill(false, false),
    'iconHatchFill': this.getFinalHatchFill(false, false),
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
 * @return {anychart.cartesian.series.Base} Return itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.restoreDefaults = function() {
  return this;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.CartesianSeriesType} Series type.
 */
anychart.cartesian.series.Base.prototype.getType = goog.abstractMethod;


/**
 * Gets legend icon type for the series.
 * @return {anychart.enums.LegendItemIconType}
 */
anychart.cartesian.series.Base.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(this.getType());
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['name'] = this.name();
  json['seriesType'] = this.getType();

  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));

  if (goog.isFunction(this.fill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series fill']
    );
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.hoverFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverFill']
    );
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }

  if (goog.isFunction(this.stroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series stroke']
    );
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (goog.isFunction(this.hoverStroke())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverStroke']
    );
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }

  if (goog.isFunction(this.hatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hatchFill']
    );
  } else {
    json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }

  if (goog.isFunction(this.hoverHatchFill())) {
    anychart.utils.warning(
        anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
        null,
        ['Series hoverHatchFill']
    );
  } else {
    json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverHatchFill()));
  }

  json['tooltip'] = this.tooltip().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.data(config['data']);
  this.name(config['name']);
  this.color(config['color']);
  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.tooltip(config['tooltip']);
  this.labels(config['labels']);
  this.hoverLabels(config['hoverLabels']);

  this.resumeSignalsDispatching(false);

  return this;
};



/**
 * Encapsulates browser event for acgraph.
 * @param {anychart.cartesian.series.Base} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent = function(target, opt_e) {
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
   * @type {anychart.cartesian.series.Base}
   */
  this['series'] = target;
};
goog.inherits(anychart.cartesian.series.Base.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
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


//exports
anychart.cartesian.series.Base.prototype['clip'] = anychart.cartesian.series.Base.prototype.clip;//doc|ex
anychart.cartesian.series.Base.prototype['color'] = anychart.cartesian.series.Base.prototype.color;//doc|ex
anychart.cartesian.series.Base.prototype['name'] = anychart.cartesian.series.Base.prototype.name;//doc|ex
anychart.cartesian.series.Base.prototype['meta'] = anychart.cartesian.series.Base.prototype.meta;//doc|ex
anychart.cartesian.series.Base.prototype['data'] = anychart.cartesian.series.Base.prototype.data;//doc|ex
anychart.cartesian.series.Base.prototype['draw'] = anychart.cartesian.series.Base.prototype.draw;//doc|ex
anychart.cartesian.series.Base.prototype['drawPoint'] = anychart.cartesian.series.Base.prototype.drawPoint;//doc|need-ex
anychart.cartesian.series.Base.prototype['drawMissing'] = anychart.cartesian.series.Base.prototype.drawMissing;//doc|need-ex
anychart.cartesian.series.Base.prototype['startDrawing'] = anychart.cartesian.series.Base.prototype.startDrawing;//doc|need-ex
anychart.cartesian.series.Base.prototype['finalizeDrawing'] = anychart.cartesian.series.Base.prototype.finalizeDrawing;//doc|need-ex
anychart.cartesian.series.Base.prototype['labels'] = anychart.cartesian.series.Base.prototype.labels;//doc|ex
anychart.cartesian.series.Base.prototype['tooltip'] = anychart.cartesian.series.Base.prototype.tooltip;//doc/ex
anychart.cartesian.series.Base.prototype['getIterator'] = anychart.cartesian.series.Base.prototype.getIterator;//doc|need-ex
anychart.cartesian.series.Base.prototype['getResetIterator'] = anychart.cartesian.series.Base.prototype.getResetIterator;//doc|need-ex
anychart.cartesian.series.Base.prototype['xPointPosition'] = anychart.cartesian.series.Base.prototype.xPointPosition;//doc|ex
anychart.cartesian.series.Base.prototype['xScale'] = anychart.cartesian.series.Base.prototype.xScale;//doc|ex
anychart.cartesian.series.Base.prototype['yScale'] = anychart.cartesian.series.Base.prototype.yScale;//doc|ex
