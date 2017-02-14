goog.provide('anychart.charts.Pareto');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.series.Pareto');
goog.require('anychart.data.ParetoMapping');
goog.require('anychart.data.ParetoSeriesMapping');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');



/**
 * Pareto chart class.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.charts.Pareto = function() {
  anychart.charts.Pareto.base(this, 'constructor');

  /**
   * Percent scale.
   * @type {anychart.scales.Linear}
   */
  this.percentScale = new anychart.scales.Linear();
  this.percentScale.minimum(0).maximum(100);
};
goog.inherits(anychart.charts.Pareto, anychart.core.CartesianBase);


//region --- Working with data
/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|anychart.data.TableData|Array|string)=} opt_value .
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(anychart.data.View|anychart.charts.Pareto)} .
 * @override
 */
anychart.charts.Pareto.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      if (opt_value['caption']) this.title(opt_value['caption']);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the chart if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.redefineView();
    }
    return this;
  }
  return this.paretoView;
};


/**
 * Updates/creates series.
 */
anychart.charts.Pareto.prototype.updateSeries = function() {
  var columnSeries = this.getSeriesAt(0);
  var lineSeries = this.getSeriesAt(1);

  if (this.columnMapping)
    goog.dispose(this.columnMapping);
  this.columnMapping = this.paretoView.derive();
  if (!columnSeries)
    columnSeries = this[anychart.enums.CartesianSeriesType.COLUMN]();
  columnSeries.data(this.columnMapping);

  if (this.lineMapping)
    goog.dispose(this.lineMapping);
  this.lineMapping = new anychart.data.ParetoSeriesMapping(this.paretoView);
  if (!lineSeries) {
    lineSeries = this[anychart.enums.CartesianSeriesType.LINE]()
        .clip(false).markers(true).yScale(this.percentScale);
  }
  lineSeries.data(this.lineMapping);
};


/**
 * Update scale after redefine view.
 */
anychart.charts.Pareto.prototype.updateScales = function() {
  if (goog.isDef(this.paretoView)) {
    var sum = this.paretoView.getSum();
    var columnSeries = this.getSeriesAt(0);
    var scale;
    if (columnSeries) {
      scale = columnSeries.yScale();
    } else {
      scale = this.yScale();
    }
    scale.minimum(0);
    if (sum)
      scale.maximum(sum);
    else
      scale.maximum(1);
  }
};


/**
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @private
 */
anychart.charts.Pareto.COMPARATOR_ = function(a, b) {
  if (anychart.utils.isNaN(a)) {
    return anychart.utils.isNaN(b) ? -1 : 1;
  }
  if (anychart.utils.isNaN(b)) {
    return -1;
  }
  return b - a;
};


/**
 * Sets new value of this.paretoView depending on current data settings.
 */
anychart.charts.Pareto.prototype.redefineView = function() {
  this.suspendSignalsDispatching();
  if (this.paretoView)
    this.paretoView.unlistenSignals(this.dataInvalidated_, this);
  goog.dispose(this.paretoView);
  this.paretoView = new anychart.data.ParetoMapping(this.parentView.sort('value', anychart.charts.Pareto.COMPARATOR_));
  this.paretoView.listenSignals(this.dataInvalidated_, this);
  this.updateScales();
  this.updateSeries();
  this.resumeSignalsDispatching(true);
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e Event.
 * @private
 */
anychart.charts.Pareto.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.updateScales();
  }
};


//endregion
//region --- Series
/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Pareto.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BOX] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BOX,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathMedianStrokeConfig,
      anychart.core.shapeManagers.pathStemStrokeConfig,
      anychart.core.shapeManagers.pathWhiskerStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'highest',
    anchoredPositionBottom: 'lowest'
  };
  res[anychart.enums.CartesianSeriesType.BUBBLE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BUBBLE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.circleFillStrokeConfig,
      anychart.core.shapeManagers.circleHatchConfig,
      anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
      anychart.core.shapeManagers.circleNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.STICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: (
        anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
        anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
        anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Pareto, anychart.charts.Pareto.prototype.seriesConfig);


/** @inheritDoc */
anychart.charts.Pareto.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Pareto(this, this, type, config, true);
};


//endregion
//region --- Scales
/** @inheritDoc */
anychart.charts.Pareto.prototype.checkXScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.Ordinal);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Pareto chart xScale', 'ordinal']);
  return res;
};


/** @inheritDoc */
anychart.charts.Pareto.prototype.checkYScaleType = function(scale) {
  var res = (scale instanceof anychart.scales.ScatterBase);
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Pareto chart yScale', 'scatter', 'linear, log']);
  return res;
};


//endregion
//region --- CSV
/** @inheritDoc */
anychart.charts.Pareto.prototype.createSpecificCsvHeaders = function(headers, headersLength, scatterPolar) {
  headers['value'] = headersLength++;
  headers['CF'] = headersLength++;
  headers['RF'] = headersLength++;
  return headersLength;
};


/** @inheritDoc */
anychart.charts.Pareto.prototype.onBeforeRowsValuesSpreading = function(seriesData, csvRows, headers, rowIndex, groupingField) {
  var seriesMapping = seriesData.getRowMapping(rowIndex);
  var isParetoMapping = seriesMapping instanceof anychart.data.ParetoMapping;

  if (isParetoMapping) {
    csvRows[groupingField][headers['value']] = seriesMapping.getValue(rowIndex);
    csvRows[groupingField][headers['CF']] = seriesMapping.getCumulativeFrequency(rowIndex);
    csvRows[groupingField][headers['RF']] = seriesMapping.getRelativeFrequency(rowIndex);
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.charts.Pareto.prototype.drawContent = function(bounds) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SCALE_MAPS)) {
    this.updateScales();
  }
  return anychart.charts.Pareto.base(this, 'drawContent', bounds);
};


//endregion
//region --- Setup/dispose
/** @inheritDoc */
anychart.charts.Pareto.prototype.disposeInternal = function() {
  goog.disposeAll(this.paretoView, this.parentView, this.parentViewToDispose, this.columnMapping, this.lineMapping);
  this.paretoView = null;
  this.parentView = null;
  this.parentViewToDispose = null;
  this.columnMapping = null;
  this.lineMapping = null;
  goog.dispose(this.percentScale);
  this.percentScale = null;
  anychart.charts.Pareto.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.charts.Pareto.prototype.serialize = function() {
  var json = anychart.charts.Pareto.base(this, 'serialize');
  if (goog.isDef(this.data()))
    json['chart']['data'] = this.data().serialize();
  return json;
};


/** @inheritDoc */
anychart.charts.Pareto.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Pareto.base(this, 'setupByJSON', config, opt_default);
  if (!!opt_default)
    this.yAxis(1).scale(this.percentScale);
  if ('data' in config)
    this.data(config['data']);
};
//endregion

//exports
(function() {
  var proto = anychart.charts.Pareto.prototype;
  proto['data'] = proto.data;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['barsPadding'] = proto.barsPadding;
  proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['maxBubbleSize'] = proto.maxBubbleSize;
  proto['minBubbleSize'] = proto.minBubbleSize;
  proto['grid'] = proto.grid;
  proto['minorGrid'] = proto.minorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['box'] = proto.box;
  // proto['bubble'] = proto.bubble;
  // proto['candlestick'] = proto.candlestick;
  // proto['column'] = proto.column;
  // proto['line'] = proto.line;
  // proto['marker'] = proto.marker;
  // proto['ohlc'] = proto.ohlc;
  // proto['rangeArea'] = proto.rangeArea;
  // proto['rangeBar'] = proto.rangeBar;
  // proto['rangeColumn'] = proto.rangeColumn;
  // proto['rangeSplineArea'] = proto.rangeSplineArea;
  // proto['rangeStepArea'] = proto.rangeStepArea;
  // proto['spline'] = proto.spline;
  // proto['splineArea'] = proto.splineArea;
  // proto['stepLine'] = proto.stepLine;
  // proto['stepArea'] = proto.stepArea;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['xZoom'] = proto.xZoom;
  proto['xScroller'] = proto.xScroller;
  proto['getStat'] = proto.getStat;
  proto['annotations'] = proto.annotations;
})();
