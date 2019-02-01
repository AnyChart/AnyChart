goog.provide('anychart.heatmapModule.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.colorScalesModule.Ordinal');
goog.require('anychart.core.Axis');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');
goog.require('anychart.heatmapModule.Series');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.themes.merging');



/**
 * AnyChart Hea tMap class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @implements {anychart.core.utils.IZoomableChart}
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.heatmapModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.heatmapModule.Chart.base(this, 'constructor', false);

  this.addThemes('heatMap');

  this.setType(anychart.enums.ChartTypes.HEAT_MAP);
  this.setOption('defaultSeriesType', anychart.enums.HeatMapSeriesType.HEAT_MAP);

  /**
   * Series instance.
   * @type {anychart.heatmapModule.Series}
   * @private
   */
  this.series_ = /** @type {anychart.heatmapModule.Series} */(this.createSeriesByType(/** @type {string} */ (this.getOption('defaultSeriesType')), opt_data || null, opt_csvSettings));

  /**
   * @this {anychart.heatmapModule.Chart}
   */
  function beforeInvalidation() {
    this.series_.invalidate(anychart.ConsistencyState.SERIES_LABELS);
  }
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['labelsDisplayMode', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, beforeInvalidation]
  ]);
};
goog.inherits(anychart.heatmapModule.Chart, anychart.core.CartesianBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.heatmapModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.CartesianBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.HEATMAP_COLOR_SCALE;


/**
 * Series config for HeatMap chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.heatmapModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.HeatMapSeriesType.HEAT_MAP] = {
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
anychart.heatmapModule.Chart.PROXY_METHODS = ([
  'normal',
  'hovered',
  'selected'
]);


/**
 * Methods that are proxied from the series.
 * @const {Array.<string>}
 */
anychart.heatmapModule.Chart.REVERSE_PROXY_METHODS = ([
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
   * @return {anychart.heatmapModule.Chart|*}
   * @this {anychart.heatmapModule.Chart}
   */
  var proxy = function(name, var_args) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
      args.push(arguments[i]);
    var series = this.getSeriesAt(0);
    var res = series[name].apply(series, args);
    return goog.isDef(args[0]) ? this : res;
  };
  var methods = anychart.heatmapModule.Chart.PROXY_METHODS;
  for (var i = 0; i < methods.length; i++) {
    var name = methods[i];
    anychart.heatmapModule.Chart.prototype[name] = goog.partial(proxy, name);
  }
})();
anychart.core.settings.populateAliases(anychart.heatmapModule.Chart, ['fill', 'stroke', 'hatchFill', 'labels', 'markers'], 'normal');


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.heatmapModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'labelsDisplayMode',
      anychart.enums.normalizeLabelsDisplayMode);
  return map;
})();
anychart.core.settings.populate(anychart.heatmapModule.Chart, anychart.heatmapModule.Chart.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeHeatMapSeriesType(type);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.getConfigByType = function(type) {
  return this.getSeriesCount() ? null : anychart.heatmapModule.Chart.base(this, 'getConfigByType', type);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.heatmapModule.Series(this, this, type, config, true);
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.heatmapModule.Chart.prototype.getXScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ORDINAL;
};


/**
 * @return {Array}
 */
anychart.heatmapModule.Chart.prototype.getXScaleWrongTypeError = function() {
  return ['HeatMap chart scale', 'ordinal'];
};


/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.heatmapModule.Chart.prototype.getYScaleDefaultType = function() {
  return anychart.enums.ScaleTypes.ORDINAL;
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.onGridSignal = function(event) {
  this.series_.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SERIES_CHART_SERIES,
      anychart.Signal.NEEDS_REDRAW);
};


/**
 * Color scale.
 * @param {(anychart.colorScalesModule.Ordinal|Object|anychart.enums.ScaleTypes)=} opt_value
 * @return {anychart.heatmapModule.Chart|anychart.colorScalesModule.Ordinal}
 */
anychart.heatmapModule.Chart.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value) && this.colorScale_) {
      this.colorScale_ = null;
      this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
          anychart.Signal.NEEDS_REDRAW);
    } else {
      var val = anychart.scales.Base.setupScale(this.colorScale_, opt_value, null, anychart.scales.Base.ScaleTypes.COLOR_SCALES,
          ['HeatMap chart color scale', 'ordinal-color, linear-color'], this.colorScaleInvalidated_, this);
      if (val) {
        var dispatch = this.colorScale_ == val;
        this.colorScale_ = val;
        this.colorScale_.resumeSignalsDispatching(dispatch);
        if (!dispatch)
          this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
              anychart.Signal.NEEDS_REDRAW);
      }
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
anychart.heatmapModule.Chart.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    // we need to calculate statistics
    this.calculate();
    var scale = this.colorScale();
    if (scale && anychart.utils.instanceOf(scale, anychart.colorScalesModule.Ordinal)) {
      var series = this.series_;
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        if (range.name !== 'default') {
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
  }
  return data;
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */ (this.legend().getOption('itemsSourceMode'));
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
        if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
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
anychart.heatmapModule.Chart.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.heatmapModule.Series} */(meta.series);
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
        if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
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
anychart.heatmapModule.Chart.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
  }
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
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
      'series': status.series,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var currentPoint = anychart.heatmapModule.Chart.base(this, 'makeCurrentPoint', seriesStatus, event, opt_empty);

  currentPoint['series'] = this;

  return currentPoint;
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.getPoint = function(index) {
  return this.series_.getPoint(index);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


/**
 * Creates tooltip context provider.
 * @return {anychart.format.Context}
 */
anychart.heatmapModule.Chart.prototype.createTooltipContextProvider = function() {
  return this.series_.createTooltipContextProvider();
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.calculateXYScales = function() {
  var needsCalc = this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_Y_SCALES);

  anychart.heatmapModule.Chart.base(this, 'calculateXYScales');

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
    if (this.series_)
      this.series_.invalidate(anychart.ConsistencyState.SERIES_COLOR);
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES);

    this.markConsistent(anychart.ConsistencyState.HEATMAP_COLOR_SCALE);
  }
};


/**
 * Getter/setter for mapping.
 * @param {?(anychart.data.View|anychart.data.Set|anychart.data.DataSettings|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.heatmapModule.Chart|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.heatmapModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
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
 * @return {!anychart.heatmapModule.Chart} instance for method chaining.
 */
anychart.heatmapModule.Chart.prototype.hover = function(opt_indexOrIndexes) {
  this.series_.hover(opt_indexOrIndexes);
  return this;
};


/**
 * Imitates selects a point by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.heatmapModule.Chart} instance for method chaining.
 */
anychart.heatmapModule.Chart.prototype.select = function(opt_indexOrIndexes) {
  this.series_.select(opt_indexOrIndexes);
  return this;
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.getCsvData = function(mode) {
  this.calculate();

  var selected = mode == anychart.enums.ChartDataExportMode.SELECTED;
  var tmp = this.getScaleHashes_(/** @type {anychart.scales.Ordinal} */(this.xScale()), selected);
  var xValues = tmp.values;
  var xNames = tmp.names;
  tmp = this.getScaleHashes_(/** @type {anychart.scales.Ordinal} */(this.yScale()), selected);
  var yValues = tmp.values;
  var yNames = tmp.names;

  var data = [];
  for (var i = 0; i < yNames.length; i++) {
    data.push([yNames[i]]);
  }

  var iterator = this.series_.getDetachedIterator();
  while (iterator.advance()) {
    var x = xValues[anychart.utils.hash(iterator.get('x'))];
    var y = yValues[anychart.utils.hash(iterator.get('y'))];
    var value = String(iterator.get('heat'));
    if (!isNaN(x) && !isNaN(y)) {
      // mind names column
      data[y][x + 1] = value;
    }
  }

  xNames.unshift('#');
  return {headers: xNames, data: data};
};


/**
 * @param {anychart.scales.Ordinal} scale
 * @param {boolean} filterByZoom
 * @return {{values: Object.<number>, names: Array.<string>}}
 * @private
 */
anychart.heatmapModule.Chart.prototype.getScaleHashes_ = function(scale, filterByZoom) {
  var result = {};
  var index = 0;
  var values = /** @type {Array} */(scale.values());
  var names = [];
  if (values) {
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      var left = scale.transform(value, 0);
      var right = scale.transform(value, 1);
      if (!filterByZoom || (Math.min(left, right) <= 1 && Math.max(left, right) >= 0)) {
        result[anychart.utils.hash(value)] = index++;
        names.push(String(value));
      }
    }
  }
  return {values: result, names: names};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.serialize = function() {
  var json = anychart.heatmapModule.Chart.base(this, 'serialize');
  var chart = json['chart'];
  // dirty dirty hack...
  delete chart['barsPadding'];
  delete chart['barGroupsPadding'];
  delete chart['crosshair'];
  delete chart['defaultSeriesType'];
  return json;
};


/**
 * @param {Object|string} config
 * @param {Object} scalesInstances
 * Setup colorScale for heatMap
 */
anychart.heatmapModule.Chart.prototype.setupColorScale = function(config, scalesInstances) {
  var scale;
  if (goog.isNumber(config)) {
    scale = scalesInstances[config];
  } else if (goog.isString(config)) {
    scale = anychart.scales.Base.fromString(config, null);
    if (!scale)
      scale = scalesInstances[config];
  } else if (goog.isObject(config)) {
    scale = anychart.scales.Base.fromString(config['type'], null);
    if (scale)
      scale.setup(config);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(/** @type {anychart.colorScalesModule.Ordinal} */(scale));
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  this.setupColorScale(config['colorScale'], scalesInstances);

  anychart.heatmapModule.Chart.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  anychart.core.settings.deserialize(this, anychart.heatmapModule.Chart.PROPERTY_DESCRIPTORS, config);
};


/**
 * @inheritDoc
 */
anychart.heatmapModule.Chart.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.heatmapModule.Chart.base(this, 'serializeWithScales', json, scales, scaleIds);
  anychart.core.settings.serialize(this, anychart.heatmapModule.Chart.PROPERTY_DESCRIPTORS, json);

  this.serializeScale(json, 'colorScale', /** @type {anychart.scales.Base} */(this.colorScale()), scales, scaleIds);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.setupSeriesByJSON = function(config, scalesInstances, opt_default) {
  var seriesConfig = {};
  var methods = anychart.heatmapModule.Chart.PROXY_METHODS;
  var i, method;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      seriesConfig[method] = config[method];
  }
  methods = anychart.heatmapModule.Chart.REVERSE_PROXY_METHODS;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      seriesConfig[method] = config[method];
  }
  this.series_.setupByJSON(seriesConfig, opt_default);
};


/** @inheritDoc */
anychart.heatmapModule.Chart.prototype.serializeSeries = function(json, scales, scaleIds) {
  var config = this.series_.serialize();
  var methods = anychart.heatmapModule.Chart.PROXY_METHODS;
  var i, method;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      json[method] = config[method];
  }
  methods = anychart.heatmapModule.Chart.REVERSE_PROXY_METHODS;
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    if (goog.isDef(config[method]))
      json[method] = config[method];
  }
};


/**
 * @inheritDoc
 */
anychart.heatmapModule.Chart.prototype.disposeInternal = function() {
  anychart.heatmapModule.Chart.base(this, 'disposeInternal');
  this.series_ = null;
};


//exports
(function() {
  var proto = anychart.heatmapModule.Chart.prototype;
  proto['getType'] = proto.getType;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  // generated methods:
  // proto['labelsDisplayMode'] = proto.labelsDisplayMode;
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
