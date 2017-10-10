goog.provide('anychart.charts.HeatMap');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series.HeatMap');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.scales.OrdinalColor');
goog.require('anychart.themes.merging');



/**
 * AnyChart Hea tMap class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @implements {anychart.core.utils.IZoomableChart}
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.charts.HeatMap = function(opt_data, opt_csvSettings) {
  anychart.charts.HeatMap.base(this, 'constructor', false);

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.yZoom_ = new anychart.core.utils.OrdinalZoom(this, false);

  this.setType(anychart.enums.ChartTypes.HEAT_MAP);
  this.defaultSeriesType(anychart.enums.HeatMapSeriesType.HEAT_MAP);

  var config = anychart.getFullTheme('heatMap');
  this.defaultSeriesSettings({
    'heatMap': anychart.themes.merging.getThemePart(config, 'defaultSeriesSettings.base')
  });

  /**
   * Series instance.
   * @type {anychart.core.series.HeatMap}
   * @private
   */
  this.series_ = /** @type {anychart.core.series.HeatMap} */(this.createSeriesByType('', opt_data || null, opt_csvSettings));
};
goog.inherits(anychart.charts.HeatMap, anychart.core.CartesianBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.HeatMap.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.CartesianBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.HEATMAP_Y_SCROLLER |
    anychart.ConsistencyState.HEATMAP_COLOR_SCALE;


/**
 * Series config for HeatMap chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.HeatMap.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res['heatMap'] = {
    drawerType: anychart.enums.SeriesDrawerTypes.HEAT_MAP,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.rectFillStrokeConfig,
      anychart.core.shapeManagers.rectHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'y',
    anchoredPositionBottom: 'y'
  };
  return res;
})();


//----------------------------------------------------------------------------------------------------------------------
//
//  Overwritten series methods. (for encapsulation series)
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Methods that are proxied to the series.
 * @const {Array.<string>}
 */
anychart.charts.HeatMap.PROXY_METHODS = ([
  'fill',
  'hoverFill',
  'selectFill',
  'stroke',
  'hoverStroke',
  'selectStroke',
  'hatchFill',
  'hoverHatchFill',
  'selectHatchFill',
  'markers',
  'hoverMarkers',
  'selectMarkers'
]);


/**
 * Methods that are proxied from the series.
 * @const {Array.<string>}
 */
anychart.charts.HeatMap.REVERSE_PROXY_METHODS = ([
  'data',
  // 'labels',
  // 'hoverLabels',
  // 'selectLabels',
  'tooltip'
]);


(function() {
  /**
   * A proxy template to make partials for the methods of series.
   * @param {string} name
   * @param {...*} var_args
   * @return {anychart.charts.HeatMap|*}
   * @this {anychart.charts.HeatMap}
   */
  var proxy = function(name, var_args) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
      args.push(arguments[i]);
    var series = this.getSeriesAt(0);
    var res = series[name].apply(series, args);
    return goog.isDef(args[0]) ? this : res;
  };
  var methods = anychart.charts.HeatMap.PROXY_METHODS;
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i];
    anychart.charts.HeatMap.prototype[name] = goog.partial(proxy, name);
  }
})();


/** @inheritDoc */
anychart.charts.HeatMap.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeHeatMapSeriesType(type);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getConfigByType = function(type) {
  return this.getSeriesCount() ? null : anychart.charts.HeatMap.base(this, 'getConfigByType', type);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.HeatMap(this, this, type, config, true);
};


/**
 * Ensures that scales are ready for zooming.
 */
anychart.charts.HeatMap.prototype.ensureScalesReadyForZoom = function() {
  this.makeScaleMaps();
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    if (!!this.xZoom().getSetup() || !!this.yZoom().getSetup())
      this.calculate();
  }
};


/**
 * Y Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.charts.HeatMap|anychart.core.utils.OrdinalZoom}
 */
anychart.charts.HeatMap.prototype.yZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.yZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.yZoom_;
};


/**
 * Y Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.yScroller = function(opt_value) {
  if (!this.yScroller_) {
    this.yScroller_ = new anychart.core.ui.ChartScroller();
    this.yScroller_.setParentEventTarget(this);
    this.yScroller_.listenSignals(this.yScrollerInvalidated_, this);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler);
    this.invalidate(
        anychart.ConsistencyState.HEATMAP_Y_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.yScroller_.setup(opt_value);
    return this;
  } else {
    return this.yScroller_;
  }
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.yScrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.HEATMAP_Y_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.scrollerChangeHandler = function(e) {
  var zoom = e.target == this.xScroller() ? /** @type {anychart.core.utils.OrdinalZoom} */(this.xZoom()) : this.yZoom_;
  if (zoom.continuous() ^ e.type == anychart.enums.EventType.SCROLLER_CHANGE_FINISH) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    zoom.setTo(e['startRatio'], e['endRatio']);
    this.resumeSignalsDispatching(true);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.checkXScaleType = function(scale) {
  var res = (acgraph.utils.instanceOf(scale, anychart.scales.Ordinal)) && !scale.isColorScale();
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['HeatMap chart scale', 'ordinal']);
  return res;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.onGridSignal = function(event) {
  this.series_.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SERIES_CHART_SERIES,
      anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.checkYScaleType = anychart.charts.HeatMap.prototype.checkXScaleType;


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  value = String(value).toLowerCase();
  return (returnNullOnError && value != 'ordinal' && value != 'ord' && value != 'discrete') ?
      null :
      anychart.scales.ordinal();
};


/**
 * Color scale.
 * @param {anychart.scales.OrdinalColor=} opt_value
 * @return {anychart.charts.HeatMap|anychart.scales.OrdinalColor}
 */
anychart.charts.HeatMap.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.HeatMap.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    // we need to calculate statistics
    this.calculate();
    var scale = this.colorScale();
    if (scale && acgraph.utils.instanceOf(scale, anychart.scales.OrdinalColor)) {
      var series = this.series_;
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        data.push({
          'text': range.name,
          'iconEnabled': true,
          'iconType': anychart.enums.LegendItemIconType.SQUARE,
          'iconFill': range.color,
          'disabled': !this.enabled(),
          'sourceUid': goog.getUid(this),
          'sourceKey': i,
          'meta': {
            series: series,
            scale: scale,
            range: range
          }
        });
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.series.HeatMap} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
  }
};


/**
 * Labels display mode.
 * @param {(string|anychart.enums.LabelsDisplayMode)=} opt_value Mode to set.
 * @return {string|anychart.enums.LabelsDisplayMode|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.labelsDisplayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLabelsDisplayMode(opt_value);
    if (this.labelDisplayMode_ != opt_value) {
      this.labelDisplayMode_ = opt_value;
      this.series_.invalidate(anychart.ConsistencyState.SERIES_LABELS);
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelDisplayMode_;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      nearestPointToCursor_ = {
        'index': status.nearestPointToCursor.index,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventSeriesStatus.push({
      'series': this,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var currentPoint = anychart.charts.HeatMap.base(this, 'makeCurrentPoint', seriesStatus, event, opt_empty);

  currentPoint['series'] = this;

  return currentPoint;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getPoint = function(index) {
  return this.series_.getPoint(index);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Creates tooltip context provider.
 * @return {anychart.format.Context}
 */
anychart.charts.HeatMap.prototype.createTooltipContextProvider = function() {
  return this.series_.createTooltipContextProvider();
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getBoundsWithoutAxes = function(contentAreaBounds, opt_scrollerSize) {
  var yScroller = /** @type {anychart.core.ui.ChartScroller} */(this.yScroller());
  var res = this.resetScrollerPosition(yScroller, contentAreaBounds);
  this.yScrollerSize_ = res.scrollerSize;
  return anychart.charts.HeatMap.base(this, 'getBoundsWithoutAxes', res.contentAreaBounds, opt_scrollerSize);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  offsets = anychart.charts.HeatMap.base(this, 'applyScrollerOffset', offsets, scrollerSize);
  var yScroller = /** @type {anychart.core.ui.ChartScroller} */(this.yScroller());
  return this.applyScrollerOffsetInternal(offsets, yScroller, this.yScrollerSize_);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getBoundsChangedSignal = function() {
  return anychart.charts.HeatMap.base(this, 'getBoundsChangedSignal') |
      anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
      anychart.ConsistencyState.HEATMAP_Y_SCROLLER;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.drawElements = function() {
  anychart.charts.HeatMap.base(this, 'drawElements');
  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_Y_SCROLLER)) {
    this.yScroller().container(this.rootElement);
    this.yScroller().draw();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.applyComplexZoom = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_ZOOM)) {
    var start, factor;

    start = this.xZoom().getStartRatio();
    factor = 1 / (this.xZoom().getEndRatio() - start);
    this.xScale().setZoom(factor, start);

    start = this.yZoom().getStartRatio();
    factor = 1 / (this.yZoom().getEndRatio() - start);
    this.yScale().setZoom(factor, start);

    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.yScroller().setRangeInternal(this.yZoom().getStartRatio(), this.yZoom().getEndRatio());

    this.markConsistent(anychart.ConsistencyState.CARTESIAN_ZOOM);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_X_SCROLLER | anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.calculateXYScales = function() {
  var needsCalc = this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_Y_SCALES);

  anychart.charts.HeatMap.base(this, 'calculateXYScales');

  if (needsCalc) {
    var xFieldName, yFieldName, valueIndex, name;
    var xAutoNames = null;
    var yAutoNames = null;
    var yScale = this.yScale();
    var xScale = this.xScale();
    var xScaleNamesField = xScale.getNamesField();
    var yScaleNamesField = yScale.getNamesField();

    if (xScaleNamesField || yScaleNamesField) {
      if (xScaleNamesField) {
        xFieldName = xScaleNamesField;
        xAutoNames = [];
      }

      if (yScaleNamesField) {
        yFieldName = yScaleNamesField;
        yAutoNames = [];
      }

      var iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        if (xScaleNamesField) {
          valueIndex = xScale.getIndexByValue(iterator.get('x'));
          name = iterator.get(xFieldName);
          if (!goog.isDef(xAutoNames[valueIndex]))
            xAutoNames[valueIndex] = name || iterator.get('x') || iterator.get('heat');
        }


        if (yScaleNamesField) {
          valueIndex = yScale.getIndexByValue(iterator.get('y'));
          name = iterator.get(yFieldName);
          if (!goog.isDef(yAutoNames[valueIndex]))
            yAutoNames[valueIndex] = name || iterator.get('y') || iterator.get('heat');
        }
      }

      if (xScaleNamesField)
        xScale.setAutoNames(xAutoNames);
      if (yScaleNamesField)
        yScale.setAutoNames(yAutoNames);
    }
    this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_COLOR_SCALE)) {
    if (this.colorScale_ && this.colorScale_.needsAutoCalc()) {
      this.colorScale_.startAutoCalc();
      iterator = this.series_.getIterator();
      iterator.reset();
      while (iterator.advance()) {
        this.colorScale_.extendDataRange(iterator.get('heat'));
      }
      this.colorScale_.finishAutoCalc();
    }
    this.series_.invalidate(anychart.ConsistencyState.SERIES_COLOR);
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES);
    this.markConsistent(anychart.ConsistencyState.HEATMAP_COLOR_SCALE);
  }
};


/**
 * Getter/setter for mapping.
 * @param {?(anychart.data.View|anychart.data.Set|anychart.data.DataSettings|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.HeatMap|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.HeatMap.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }
    this.series_.data(opt_value, opt_csvSettings);
    return this;
  }
  return /** @type {!anychart.data.View} */(this.series_.data());
};


/**
 * If index is passed, hovers a point by its index, else hovers all points.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.hover = function(opt_indexOrIndexes) {
  this.series_.hover(opt_indexOrIndexes);
  return this;
};


/**
 * Imitates selects a point by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.select = function(opt_indexOrIndexes) {
  this.series_.select(opt_indexOrIndexes);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.serialize = function() {
  var json = anychart.charts.HeatMap.base(this, 'serialize');
  var chart = json['chart'];
  // dirty dirty hack...
  delete chart['barsPadding'];
  delete chart['barGroupsPadding'];
  delete chart['crosshair'];
  delete chart['defaultSeriesType'];
  return json;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  var scale;
  var json = config['colorScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], null);
    if (scale)
      scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(/** @type {anychart.scales.OrdinalColor} */(scale));

  anychart.charts.HeatMap.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  this.labelsDisplayMode(config['labelsDisplayMode']);
  this.yScroller(config['yScroller']);

  var yZoom = config['yZoom'];
  if (goog.isObject(yZoom) && (goog.isNumber(yZoom['scale']) || goog.isString(yZoom['scale']))) {
    var tmp = yZoom['scale'];
    yZoom['scale'] = scalesInstances[yZoom['scale']];
    this.yZoom(yZoom);
    yZoom['scale'] = tmp;
  } else {
    this.yZoom(yZoom);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.charts.HeatMap.base(this, 'serializeWithScales', json, scales, scaleIds);
  json['yScroller'] = this.yScroller().serialize();
  json['yZoom'] = this.yZoom().serialize();
  json['labelsDisplayMode'] = this.labelsDisplayMode();

  this.serializeScale(json, 'colorScale', /** @type {anychart.scales.Base} */(this.colorScale()), scales, scaleIds);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.setupSeriesByJSON = function(config, scalesInstances, opt_default) {
  var seriesConfig = {};
  var methods = anychart.charts.HeatMap.PROXY_METHODS;
  var i, method;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      seriesConfig[method] = config[method];
  }
  methods = anychart.charts.HeatMap.REVERSE_PROXY_METHODS;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      seriesConfig[method] = config[method];
  }
  this.series_.setupByJSON(seriesConfig, opt_default);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.serializeSeries = function(json, scales, scaleIds) {
  var config = this.series_.serialize();
  var methods = anychart.charts.HeatMap.PROXY_METHODS;
  var i, method;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      json[method] = config[method];
  }
  methods = anychart.charts.HeatMap.REVERSE_PROXY_METHODS;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      json[method] = config[method];
  }
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.disposeInternal = function() {
  anychart.charts.HeatMap.base(this, 'disposeInternal');
  goog.disposeAll(this.yScroller_);
  this.yScroller_ = null;
  this.series_ = null;
};


//exports
(function() {
  var proto = anychart.charts.HeatMap.prototype;
  proto['getType'] = proto.getType;
  proto['grid'] = proto.grid;
  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['labelsDisplayMode'] = proto.labelsDisplayMode;
  // generated methods:
  // proto['fill'] = proto.fill;
  // proto['hoverFill'] = proto.hoverFill;
  // proto['selectFill'] = proto.selectFill;
  // proto['stroke'] = proto.stroke;
  // proto['hoverStroke'] = proto.hoverStroke;
  // proto['selectStroke'] = proto.selectStroke;
  // proto['hatchFill'] = proto.hatchFill;
  // proto['hoverHatchFill'] = proto.hoverHatchFill;
  // proto['selectHatchFill'] = proto.selectHatchFill;
  // proto['labels'] = proto.labels;
  // proto['hoverLabels'] = proto.hoverLabels;
  // proto['selectLabels'] = proto.selectLabels;
  // proto['markers'] = proto.markers;
  // proto['hoverMarkers'] = proto.hoverMarkers;
  // proto['selectMarkers'] = proto.selectMarkers;
  proto['hover'] = proto.hover;
  proto['select'] = proto.select;
  proto['unhover'] = proto.unhover;
  proto['unselect'] = proto.unselect;
  proto['data'] = proto.data;
  proto['colorScale'] = proto.colorScale;
  proto['xZoom'] = proto.xZoom;
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
  proto['annotations'] = proto.annotations;
})();
