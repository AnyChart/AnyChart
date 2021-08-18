/**
 * @fileoverview anychart.stockModule.Series file.
 * @suppress {extraRequire}
 */
goog.provide('anychart.stockModule.Series');

goog.require('anychart.color');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Candlestick');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.JumpLine');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers.OHLC');
goog.require('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers.RangeColumn');
goog.require('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers.RangeStick');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers.StepArea');
goog.require('anychart.core.drawers.StepLine');
goog.require('anychart.core.drawers.Stick');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series.Base');
goog.require('anychart.format.Context');
goog.require('anychart.stockModule.data.Table');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @constructor
 * @extends {anychart.core.series.Base}
 */
anychart.stockModule.Series = function(chart, plot, type, config) {
  anychart.stockModule.Series.base(this, 'constructor', chart, plot, type, config);

  /**
   * For formatters.
   * @type {?number}
   */
  this.defaultDecimalDigitsCount = null;

  /**
   * Series data interface.
   * @type {anychart.stockModule.data.TableSelectable}
   * @private
   */
  this.data_ = null;

  /**
   * Original data source.
   * @type {anychart.stockModule.data.Table|anychart.stockModule.data.TableMapping|Array|string}
   * @private
   */
  this.dataSource_ = null;

  /**
   * Contains data instance that should be disposed.
   * @type {goog.disposable.IDisposable}
   * @private
   */
  this.dataToDispose_ = null;

  /**
   * Currently highlighted point.
   * @type {anychart.stockModule.data.TableSelectable.RowProxy}
   * @private
   */
  this.highlightedRow_ = null;

  /**
   * A flag to mark, that the series is in highlight. The highlightedRow_ prop is not enough, because of DVF-2226.
   * @type {boolean}
   * @private
   */
  this.inHighlight_ = false;

  /**
   * Currently last point.
   * @type {anychart.stockModule.data.TableSelectable.RowProxy}
   * @private
   */
  this.lastRow_ = null;

  this.canBeInteractive = false;
};
goog.inherits(anychart.stockModule.Series, anychart.core.series.Base);


//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Series.prototype.getCategoryWidth = function(opt_categoryIndex) {
  var xScale = this.getXScale();
  if (anychart.utils.instanceOf(xScale, anychart.stockModule.scales.Ordinal))
    return this.pixelBoundsCache.width / (xScale.getMaximumIndex() - xScale.getMinimumIndex());
  else {
    var minDistance = (/** @type {anychart.core.IGroupingProvider} */(this.chart)).getCurrentMinDistance();
    return minDistance / (xScale.getMaximum() - xScale.getMinimum()) * this.pixelBoundsCache.width;
  }
};


/**
 * Gets wrapped point by index.
 * @param {number} index - Point index.
 * @return {anychart.core.Point} Wrapped point.
 */
anychart.stockModule.Series.prototype.getPoint = function(index) {
  //TODO (A.Kudryavtsev): Add for stock statistics?
  return null;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getPointOption = function(name) {
  return undefined;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getPreFirstPoint = function() {
  var row = this.data_.getPreFirstRow();
  if (row)
    this.getIterator().specialSelect(row.row);
  return row;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getPostLastPoint = function() {
  var row = this.data_.getPostLastRow();
  if (row)
    this.getIterator().specialSelect(row.row);
  return row;
};


/**
 * Getter for the main stock chart.
 * @return {anychart.stockModule.Chart}
 */
anychart.stockModule.Series.prototype.getMainChart = function() {
  return /** @type {anychart.stockModule.Chart} */(this.chart);
};


/**
 * Setups comparison zero.
 */
anychart.stockModule.Series.prototype.updateComparisonZero = function() {
  /** @type {?anychart.stockModule.data.TableSelectable.RowProxy} */
  var row;
  var scale = this.yScale();
  if (this.supportsComparison() && !this.planIsStacked() && (anychart.utils.instanceOf(scale, anychart.scales.Linear))) {
    var mode = /** @type {anychart.enums.ScaleComparisonMode} */(scale.comparisonMode());
    if (mode != anychart.enums.ScaleComparisonMode.NONE) {
      row = this.data_.getRowByDataSource(/** @type {anychart.enums.ComparisonDataSource|number} */(scale.compareWith()), this.drawer.valueFieldName);
    }
  }
  // if we have found a row to get value from - we cast it to number
  // if anything went wrong - we get 0 value and fail to make a comparison, which is a good result
  this.comparisonZero = Number(row && row.get(this.drawer.valueFieldName)) || 0;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.chartHasLabelOverrides = function() {
  return false;
};


//endregion
//region Working with data
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets and sets data for the series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_value
 * @param {Object.<({column: (number|string), type: anychart.enums.AggregationType, weights: (number|string)}|number|string)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string|anychart.stockModule.Series}
 */
anychart.stockModule.Series.prototype.data = function(opt_value, opt_mappingSettings, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    var chart = this.getMainChart();
    chart.suspendSignalsDispatching();
    var data;
    // deregistering data source
    if (this.data_) {
      data = this.data_;
      // we need this zeroing to let the chart check if the data source is still relevant
      this.data_ = null;
      chart.deregisterSource(/** @type {!anychart.stockModule.data.TableSelectable} */(data));
    }

    // disposing previously created data
    if (this.dataToDispose_) {
      goog.dispose(this.dataToDispose_);
      this.dataToDispose_ = null;
    }

    // saving source value here
    this.dataSource_ = opt_value;

    // creating data table if needed
    if (!(anychart.utils.instanceOf(opt_value, anychart.stockModule.data.Table)) && !(anychart.utils.instanceOf(opt_value, anychart.stockModule.data.TableMapping))) {
      data = new anychart.stockModule.data.Table();
      if (opt_value)
        data.addData(/** @type {!(Array.<Array.<*>>|string)} */(opt_value), false, opt_csvSettings);
      this.dataToDispose_ = opt_value = data;
    }

    // creating data mapping if needed
    if (anychart.utils.instanceOf(opt_value, anychart.stockModule.data.Table)) {
      opt_value = opt_value.mapAs(opt_mappingSettings);
      if (!opt_mappingSettings) {
        opt_value.addField('value', 1, anychart.enums.AggregationType.AVERAGE);
        opt_value.addField('size', 2, anychart.enums.AggregationType.SUM);
        opt_value.addField('open', 1, anychart.enums.AggregationType.FIRST);
        opt_value.addField('high', 2, anychart.enums.AggregationType.MAX);
        opt_value.addField('low', 3, anychart.enums.AggregationType.MIN);
        opt_value.addField('close', 4, anychart.enums.AggregationType.LAST);
        opt_value.addField('volume', 5, anychart.enums.AggregationType.SUM);
      }
      if (!this.dataToDispose_)
        this.dataToDispose_ = opt_value;
    }

    // applying passed value if it is suitable.
    if (anychart.utils.instanceOf(opt_value, anychart.stockModule.data.TableMapping)) {
      this.data_ = opt_value.createSelectable();
      this.registerDataSource();
    } else {
      this.dataSource_ = null;
    }
    chart.resumeSignalsDispatching(true);
    return this;
  }
  return this.dataSource_;
};


/**
 * Registers current selectable in the main chart.
 * @protected
 */
anychart.stockModule.Series.prototype.registerDataSource = function() {
  this.getMainChart().registerSource(/** @type {!anychart.stockModule.data.TableSelectable} */(this.getSelectableData()), false);
};


/**
 * Returns current series data as TableSelectable (if any data is set).
 * @return {anychart.stockModule.data.TableSelectable}
 */
anychart.stockModule.Series.prototype.getSelectableData = function() {
  return this.data_;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getDetachedIterator = function() {
  return this.data_.getIterator();
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.considerMetaEmpty = function() {
  return true;
};


//endregion
//region Path manager interface methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Path manager interface methods
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Series.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var pointProvider = this.getPointProvider();

  var iterator = !!opt_ignorePointSettings ? this.getDetachedIterator() : this.getIterator();
  var index = iterator.getIndex();

  pointProvider
      .dataSource(iterator)
      .statisticsSources([this.getPoint(index), this]);

  var scaledColor;
  var source = opt_baseColor || this.getOption('color') || 'blue';
  var x = iterator.getX();
  var value = iterator.get('value');
  var name = goog.isDef(iterator.get('name')) ? iterator.get('name') : x;
  var values = {
    'x': {value: x, type: anychart.enums.TokenType.DATE_TIME},
    'value': {value: value, type: anychart.enums.TokenType.NUMBER},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'iterator': {value: iterator, type: anychart.enums.TokenType.UNKNOWN},
    'autoColor': {value: source, type: anychart.enums.TokenType.UNKNOWN},
    'chart': {value: this.chart, type: anychart.enums.TokenType.UNKNOWN},
    'plot': {value: this.plot, type: anychart.enums.TokenType.UNKNOWN},
    'series': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: name, type: anychart.enums.TokenType.STRING},
    'isIntersection': {value: !!iterator.meta('isIntersection'), type: anychart.enums.TokenType.STRING}
  };

  var ignoreColorScale = goog.isDef(opt_ignoreColorScale) && opt_ignoreColorScale;
  var colorScale = this.colorScale();
  if (colorScale && !ignoreColorScale) {
    if (goog.isDef(value))
      scaledColor = colorScale.valueToColor(value);

    values['scaledColor'] = {value: scaledColor, type: anychart.enums.TokenType.UNKNOWN};
    values['colorScale'] = {value: colorScale, type: anychart.enums.TokenType.UNKNOWN};
  }

  values['sourceColor'] = {value: scaledColor || source, type: anychart.enums.TokenType.UNKNOWN};

  return pointProvider.propagate(values);
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var pointProvider = this.getPointProvider();

  var iterator = !!opt_ignorePointSettings ? this.getDetachedIterator() : this.getIterator();
  var index = iterator.getIndex();

  pointProvider
      .dataSource(iterator)
      .statisticsSources([this.getPoint(index), this]);

  var source = this.getAutoHatchFill();
  var x = iterator.getX();
  var value = iterator.get('value');
  var name = goog.isDef(iterator.get('name')) ? iterator.get('name') : x;
  var values = {
    'x': {value: x, type: anychart.enums.TokenType.DATE_TIME},
    'value': {value: value, type: anychart.enums.TokenType.NUMBER},
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'iterator': {value: iterator, type: anychart.enums.TokenType.UNKNOWN},
    'sourceHatchFill': {value: source, type: anychart.enums.TokenType.UNKNOWN},
    'plot': {value: this.plot, type: anychart.enums.TokenType.UNKNOWN},
    'chart': {value: this.chart, type: anychart.enums.TokenType.UNKNOWN},
    'series': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'name': {value: name, type: anychart.enums.TokenType.STRING}
  };

  return pointProvider.propagate(values);
};


//endregion
//region Drawing points
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing points
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Series.prototype.retrieveDataColumns = function() {
  // we do not report empty data drawing because it is not actually an error
  if (!this.data_) return null;
  var fields = this.getYValueNames();
  var res = [];
  for (var i = 0; i < fields.length; i++) {
    var column = this.data_.getFieldColumn(fields[i]);
    if (!goog.isString(column) && isNaN(column)) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.STOCK_WRONG_MAPPING, undefined, [this.seriesType(), fields[i]]);
      return null;
    }
    res.push(column);
  }
  return res;
};


/**
 * Returns values, needed to be counted on in scale min/max determining.
 * @param {boolean=} opt_skipOutOfRangeRows
 * @return {!Array.<number>}
 */
anychart.stockModule.Series.prototype.getScaleReferenceValues = function(opt_skipOutOfRangeRows) {
  var columns = this.retrieveDataColumns();
  var res = [];
  if (columns) {
    var yScale = /** @type {anychart.scales.Base} */(this.yScale());
    var i, len = columns.length;
    for (i = 0; i < len; i++) {
      var column = columns[i];
      res.push(yScale.applyComparison(this.data_.getColumnMin(column, opt_skipOutOfRangeRows), this.comparisonZero));
      res.push(yScale.applyComparison(this.data_.getColumnMax(column, opt_skipOutOfRangeRows), this.comparisonZero));
    }
  }
  return res;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.planHasPointLabels = function() {
  var column = this.data_.getFieldColumn('label');
  var minColumn = this.data_.getFieldColumn('minLabel');
  var maxColumn = this.data_.getFieldColumn('maxLabel');
  return goog.isString(column) || !isNaN(column) ||
      goog.isString(minColumn) || !isNaN(minColumn) ||
      goog.isString(maxColumn) || !isNaN(maxColumn);
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.planHasPointMarkers = function() {
  var column = this.data_.getFieldColumn('marker');
  return (goog.isString(column) || !isNaN(column));
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.planIsStacked = function() {
  return this.supportsStack() && this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE;
};


//endregion
//region Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Prepares series data for highlight.
 * @param {number} value
 * @return {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.Series.prototype.getClosestPointByX = function(value) {
  return this.data_.search(value, anychart.enums.TableSearchMode.EXACT);
};


/**
 * Updates last row. Used in plot.
 */
anychart.stockModule.Series.prototype.updateLastRow = function() {
  this.lastRow_ = this.data_.getLastVisibleRow();
};


/**
 * Highlights series data.
 * @param {number} value
 * @param {number} stickyValue
 */
anychart.stockModule.Series.prototype.highlight = function(value, stickyValue) {
  this.highlightedRow_ = this.getClosestPointByX(value);
  this.inHighlight_ = true;

  this.highlightStickyRow_(anychart.PointState.NORMAL);
  this.highlightedStyckyRow_ = this.highlightedRow_ ? this.highlightedRow_ : this.getClosestPointByX(stickyValue);
  this.highlightStickyRow_(anychart.PointState.HOVER);
};


/**
 * Removes series highlight.
 */
anychart.stockModule.Series.prototype.removeHighlight = function() {
  this.highlightedRow_ = null;
  this.inHighlight_ = false;

  this.highlightStickyRow_(anychart.PointState.NORMAL);
  this.getIterator().reset();
};


/**
 * Hover marker processing
 * @param {anychart.PointState} state Point hover state
 * @private
 */
anychart.stockModule.Series.prototype.highlightStickyRow_ = function(state) {
  if (this.highlightedStyckyRow_ && this.enabled()) {
    var iterator = this.getIterator();
    iterator.specialSelect(this.highlightedStyckyRow_.row, this.highlightedStyckyRow_.getIndex());

    if (this.chart.getAllowPointSettings()) {
      if (this.isDiscreteBased()) {
        this.shapeManager.updateColors(state,
            /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
      }
      var metaName = anychart.utils.instanceOf(this.shapeManager, anychart.core.shapeManagers.PerPoint) ? 'shapes' : 'shapeNames';
      var shapes = /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta(metaName));

      this.shapeManager.updateMarkersColors(state, shapes);
      this.drawer.updatePoint(iterator, state);
    }

    if (this.check(anychart.core.series.Capabilities.SUPPORTS_MARKERS))
      this.drawMarker(iterator, state, true);

    if (state == anychart.PointState.NORMAL)
      this.highlightedStyckyRow_ = null;
  }
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getSeriesState = function() {
  return this.seriesState;
};


/**
 * WE DO NOT CURRENTLY EXPORT THIS METHOD.
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.stockModule.Series}
 */
anychart.stockModule.Series.prototype.hoverSeries = function() {
  if (!(this.seriesState & anychart.PointState.HOVER)) {
    this.seriesState = anychart.PointState.HOVER;
    this.invalidate(anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/**
 * WE DO NOT CURRENTLY EXPORT THIS METHOD.
 * Removes hover from the series or point by index.
 * @return {!anychart.stockModule.Series}
 */
anychart.stockModule.Series.prototype.unhover = function() {
  if (this.seriesState != anychart.PointState.NORMAL) {
    this.seriesState = anychart.PointState.NORMAL;
    this.invalidate(anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
  return this;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getPointState = function(index) {
  return this.getSeriesState();
};


//endregion
//region Format/position formatters generation
//----------------------------------------------------------------------------------------------------------------------
//
//  Format/position formatters generation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Series.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    this.tooltipContext = new anychart.format.Context();
  }
  return this.updateContext(this.tooltipContext, this.getCurrentPoint());
};


/**
 * Creates context provider for legend items text formatter function.
 * @param {(Array.<Object.<string, anychart.core.BaseContext.TypedValue>>)=} opt_addValues - Values to add.
 * @return {Object} Legend context provider.
 * @protected
 */
anychart.stockModule.Series.prototype.createLegendContextProvider = function(opt_addValues) {
  if (!this.legendProvider)
    this.legendProvider = new anychart.format.Context();
  this.legendProvider = this.updateContext(this.legendProvider, this.getCurrentPoint());

  if (opt_addValues) {
    var values = this.legendProvider.contextValues();
    for (var i = 0; i < opt_addValues.length; i++) {
      goog.mixin(values, opt_addValues[i]);
    }
    this.legendProvider.propagate();
  }

  return this.legendProvider;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getContextProviderValues = function(provider, rowInfo) {
  var grouping = /** @type {anychart.stockModule.Grouping} */((/** @type {anychart.stockModule.Chart} */(this.chart)).grouping());
  var result = anychart.stockModule.Series.base(this, 'getContextProviderValues', provider, rowInfo);
  result['defaultDecimalDigitsCount'] = {
    value: this.defaultDecimalDigitsCount,
    type: anychart.enums.TokenType.NUMBER
  };
  result['dataIntervalUnit'] = {
    value: grouping.getCurrentDataInterval()['unit'],
    type: anychart.enums.TokenType.STRING
  };
  result['dataIntervalUnitCount'] = {
    value: grouping.getCurrentDataInterval()['count'],
    type: anychart.enums.TokenType.NUMBER
  };
  result['isGrouped'] = {
    value: grouping.isGrouped(),
    type: anychart.enums.TokenType.UNKNOWN
  };
  return result;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getXTypeInContext = function() {
  return anychart.enums.TokenType.DATE_TIME;
};


/**
 * Returns current point for the legend.
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.Series.prototype.getCurrentPoint = function() {
  return this.inHighlight_ ? this.highlightedRow_ : this.lastRow_;
};


//endregion
//region Legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
// /** @inheritDoc */
// anychart.stockModule.Series.prototype.onLegendItemSignal = function(event) {
//   var signal = anychart.Signal.NEED_UPDATE_LEGEND;
//   var force = false;
//   //if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
//   //  signal |= anychart.Signal.BOUNDS_CHANGED;
//   //  force = true;
//   //}
//   this.dispatchSignal(signal, force);
// };


/** @inheritDoc */
anychart.stockModule.Series.prototype.getLegendIconColor = function(legendItemJson, colorType, baseColor, context) {
  if (!legendItemJson && this.check(anychart.core.drawers.Capabilities.IS_OHLC_BASED)) {
    var name;
    var rising = context['open'] < context['close'];
    if (colorType == anychart.enums.ColorType.STROKE) {
      name = rising ? 'risingStroke' : 'fallingStroke';
    } else if (colorType == anychart.enums.ColorType.HATCH_FILL) {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL))
        return null;
      name = rising ? 'risingHatchFill' : 'fallingHatchFill';
    } else {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL)) {
        name = rising ? 'risingStroke' : 'fallingStroke';
        colorType = anychart.enums.ColorType.STROKE;
      } else {
        name = rising ? 'risingFill' : 'fallingFill';
      }
    }
    var resolver = anychart.color.getColorResolver(name, colorType, false);
    return resolver(this, anychart.PointState.NORMAL, true);
  } else {
    return anychart.stockModule.Series.base(this, 'getLegendIconColor', legendItemJson, colorType, baseColor, context);
  }
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getLegendIconType = function(type, context) {
  if (String(type).toLowerCase() == anychart.enums.LegendItemIconType.RISING_FALLING) {
    if (this.check(anychart.core.drawers.Capabilities.IS_OHLC_BASED)) {
      return (context['open'] < context['close']) ?
          anychart.enums.LegendItemIconType.TRIANGLE_UP :
          anychart.enums.LegendItemIconType.TRIANGLE_DOWN;
    }
  }
  return anychart.stockModule.Series.base(this, 'getLegendIconType', type, context);
};


/**
 * Formats number.
 * @param {*} val - Value to format.
 * @return {*} - Result.
 * @private
 */
anychart.stockModule.Series.prototype.localizeNumber_ = function(val) {
  return (typeof val == 'number') ? anychart.format.number(val, this.defaultDecimalDigitsCount || undefined) : val;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.getLegendItemText = function(context) {
  var missing;
  var result;
  if (this.check(anychart.core.drawers.Capabilities.IS_OHLC_BASED)) {
    missing = isNaN(context['high']) || isNaN(context['low']) || isNaN(context['open']) || isNaN(context['close']);
    result = ': (O: ' + this.localizeNumber_(context['open']) +
        '; H: ' + this.localizeNumber_(context['high']) +
        '; L: ' + this.localizeNumber_(context['low']) +
        '; C: ' + this.localizeNumber_(context['close']) + ')';
  } else if (this.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED)) {
    missing = isNaN(context['high']) || isNaN(context['low']);
    result = ': (H: ' + this.localizeNumber_(context['high']) +
        '; L: ' + this.localizeNumber_(context['low']) + ')';
  } else {
    missing = isNaN(context['value']);
    result = ': ' + this.localizeNumber_(context['value']);
  }
  return this.name() + (missing ? '' : result);
};


//endregion
//region Allow point settings
/**
 * Reconfigure series with allowPointSettings flag.
 * NOTE: Some series can not be affected with allowPointSettings flag
 * @see anychart.stockModule.Chart.ALLOWED_POINT_SETTINGS
 * @param {boolean=} opt_value
 * @return {boolean|anychart.stockModule.Series}
 */
anychart.stockModule.Series.prototype.allowPointSettings = function(opt_value) {
  var type = this.getType();
  var allowFlag = anychart.stockModule.Chart.ALLOWED_POINT_SETTINGS[type];
  if (!goog.isNull(allowFlag)) {
    if (goog.isDef(opt_value))
      return this;
    else
      return allowFlag;
  }

  var chartSettings = /** @type {boolean} */(this.chart.getAllowPointSettings ? this.chart.getAllowPointSettings() : false);
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (!goog.isDef(this.allowPointSettings_))
      this.allowPointSettings_ = chartSettings;
    if (this.allowPointSettings_ != opt_value) {
      this.allowPointSettings_ = opt_value;
      var config = /** @type {anychart.core.series.TypeConfig} */ (this.chart.getConfigByType(this.getType())[1]);
      this.applyConfig(config, false);
      this.invalidate(
          anychart.ConsistencyState.SERIES_POINTS |
          anychart.ConsistencyState.SERIES_CLIP |
          anychart.ConsistencyState.SERIES_DATA |
          anychart.ConsistencyState.A11Y,
          this.SUPPORTED_SIGNALS);
    }
    return this;
  }

  return goog.isDef(this.allowPointSettings_) ? this.allowPointSettings_ : chartSettings;
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.applyConfig = function(config, opt_reapplyClip) {
  var newConfig = /** @type {anychart.core.series.TypeConfig} */(goog.object.clone(config));
  var allowFlag = !anychart.utils.instanceOf(this, anychart.stockModule.ScrollerSeries) && this.allowPointSettings();

  newConfig.capabilities |= (allowFlag && anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS);
  newConfig.shapeManagerType = allowFlag ? anychart.enums.ShapeManagerTypes.PER_POINT : anychart.enums.ShapeManagerTypes.PER_SERIES;
  anychart.stockModule.Series.base(this, 'applyConfig', newConfig, opt_reapplyClip);
};


//endregion
//region Serialization/Deserialization/Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization/Deserialization/Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.stockModule.Series.prototype.serialize = function() {
  var json = anychart.stockModule.Series.base(this, 'serialize');
  return json;
};


/**
 * @inheritDoc
 */
anychart.stockModule.Series.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Series.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.stockModule.Series.prototype.disposeInternal = function() {
  if (this.data_) {
    var data = this.data_;
    // we need this zeroing to let the chart check if the data source is still relevant
    this.data_ = null;
    this.getMainChart().deregisterSource(/** @type {!anychart.stockModule.data.TableSelectable} */(data));
  }

  this.highlightedRow_ = null;
  this.lastRow_ = null;

  anychart.stockModule.Series.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.Series.prototype;
  proto['data'] = proto.data;
  proto['allowPointSettings'] = proto.allowPointSettings;
})();
