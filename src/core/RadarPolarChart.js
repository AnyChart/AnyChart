goog.provide('anychart.core.RadarPolarChart');

goog.require('anychart.core.ChartWithOrthogonalScales');
goog.require('anychart.core.axes.Radial');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.palettes');
goog.require('anychart.scales');



/**
 * Common chart class for radar and polar.
 * @param {boolean} categorizeData
 * @constructor
 * @extends {anychart.core.ChartWithOrthogonalScales}
 */
anychart.core.RadarPolarChart = function(categorizeData) {
  anychart.core.RadarPolarChart.base(this, 'constructor', categorizeData);

  /**
   * @type {Array.<anychart.core.grids.Radar|anychart.core.grids.Polar>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Radar|anychart.core.grids.Polar>}
   * @private
   */
  this.minorGrids_ = [];
};
goog.inherits(anychart.core.RadarPolarChart, anychart.core.ChartWithOrthogonalScales);


/**
 * Start angle for the first slice of a pie chart.
 * @type {(string|number)}
 * @private
 */
anychart.core.RadarPolarChart.prototype.startAngle_;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.ChartWithSeries states.
 * @type {number}
 */
anychart.core.RadarPolarChart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithOrthogonalScales.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.AXES_CHART_GRIDS;


//region --- Specific settings
//------------------------------------------------------------------------------
//
//  Specific settings
//
//------------------------------------------------------------------------------
/**
 * Set chart start angle.
 * @example
 * var chart = anychart.polar([1, 1.2, 1.4, 1.6, 1.2]);
 * chart.startAngle(45);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.RadarPolarChart)} .
 */
anychart.core.RadarPolarChart.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Inner radius getter/setter. Can be in pixels or percent of main radius.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.core.RadarPolarChart}
 */
anychart.core.RadarPolarChart.prototype.innerRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.normalizeNumberOrPercent(opt_value, this.innerRadius_);
    if (this.innerRadius_ != value) {
      this.innerRadius_ = value;
      for (var i = 0; i < this.seriesList.length; i++) {
        this.seriesList[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
      }
      this.invalidate(
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.innerRadius_;
};


/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.getPlotBounds = function() {
  return this.dataBounds;
};


//endregion
//region --- Grids
//------------------------------------------------------------------------------
//
//  Grids
//
//------------------------------------------------------------------------------
/**
 * Create Grid instance.
 * @return {!(anychart.core.grids.Radar|anychart.core.grids.Polar)}
 * @protected
 */
anychart.core.RadarPolarChart.prototype.createGridInstance = goog.abstractMethod;


/**
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Radar|anychart.core.grids.Polar|anychart.core.RadarPolarChart)} Grid instance by index or itself for method chaining.
 */
anychart.core.RadarPolarChart.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.RADIAL);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for minorGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Radar|anychart.core.grids.Polar|anychart.core.RadarPolarChart)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.RadarPolarChart.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.CIRCUIT);
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @protected
 */
anychart.core.RadarPolarChart.prototype.onGridSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.core.RadarPolarChart.prototype.defaultGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultGridSettings_ = opt_value;
    return this;
  }
  return this.defaultGridSettings_ || {};
};


/**
 * Getter/setter for minor grid default settings.
 * @param {Object=} opt_value Object with minor grid settings.
 * @return {Object}
 */
anychart.core.RadarPolarChart.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


//endregion
//region --- Axes
//------------------------------------------------------------------------------
//
//  Axes
//
//------------------------------------------------------------------------------
/**
 * Creates proper axis instance.
 * @return {anychart.core.axes.Radar|anychart.core.axes.Polar}
 */
anychart.core.RadarPolarChart.prototype.createXAxisInstance = goog.abstractMethod;


/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Radar|anychart.core.axes.Polar|anychart.core.RadarPolarChart)} Axis instance by index or itself for method chaining.
 */
anychart.core.RadarPolarChart.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = this.createXAxisInstance();
    this.xAxis_.setParentEventTarget(this);
    this.registerDisposable(this.xAxis_);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS);
  }

  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 * Getter/setter for yAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Radial|anychart.core.RadarPolarChart)} Axis instance by index or itself for method chaining.
 */
anychart.core.RadarPolarChart.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.core.axes.Radial();
    this.yAxis_.setParentEventTarget(this);
    this.registerDisposable(this.yAxis_);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS);
  }

  if (goog.isDef(opt_value)) {
    this.yAxis_.setup(opt_value);
    return this;
  } else {
    return this.yAxis_;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.RadarPolarChart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES_CHART_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. 0 is x-axes 1 is y-axes, another numbers return undefined.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Polar|anychart.core.axes.Radar|anychart.core.axes.Radial|undefined}
 */
anychart.core.RadarPolarChart.prototype.getAxisByIndex = function(index) {
  switch (index) {
    case 0:
      return this.xAxis_;
    case 1:
      return this.yAxis_;
    default:
      return void 0;
  }
};


//endregion
//region --- Drawing
//------------------------------------------------------------------------------
//
//  Drawing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.setupSeriesBeforeDraw = function(series, opt_topAxisPadding, opt_rightAxisPadding, opt_bottomAxisPadding, opt_leftAxisPadding) {
  if (series.getOwnOption('startAngle') != this.startAngle_) {
    series.setOption('startAngle', this.startAngle_);
    series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.beforeSeriesDraw = function() {
  this.distributeSeries();
};


/**
 * Draw radar polar chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.core.RadarPolarChart.prototype.drawContent = function(bounds) {
  var i, count, axis;

  this.calculate();

  if (this.isConsistent()) {
    return;
  }

  anychart.core.Base.suspendSignalsDispatching(this.xAxis_, this.yAxis_);

  var axisInvalidated = false;

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES_CHART_AXES)) {
    axis = this.xAxis();
    if (!axis.scale()) {
      axis.scale(/** @type {anychart.scales.Base} */(this.xScale()));
    }
    axis.dropLabelCallsCache();

    axis = this.yAxis();
    if (!axis.scale()) {
      axis.scale(/** @type {anychart.scales.Base} */(this.yScale()));
    }
    axis.dropLabelCallsCache();

    axisInvalidated = true;
  }

  // calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    axis = this.xAxis();
    axis.startAngle(this.startAngle_);
    axis.parentBounds(contentAreaBounds);
    this.dataBounds = axis.getRemainingBounds().round();

    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES |
        anychart.ConsistencyState.AXES_CHART_GRIDS |
        anychart.ConsistencyState.SERIES_CHART_SERIES);

    axisInvalidated = true;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (axisInvalidated) {
          grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
        }
        grid.parentBounds(this.dataBounds);
        grid.innerRadius(this.innerRadius_);
        grid.container(this.rootElement);
        grid.startAngle(this.startAngle_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    axis = this.xAxis();
    axis.container(this.rootElement);
    // parent bounds and angle were already set for xAxis at BOUNDS
    // axis.startAngle(this.startAngle_);
    // axis.parentBounds(bounds.clone().round());
    axis.draw();

    axis = this.yAxis();
    axis.container(this.rootElement);
    axis.startAngle(this.startAngle_);
    axis.innerRadius(this.innerRadius_);
    axis.parentBounds(this.dataBounds.clone());
    axis.draw();

    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  this.drawSeries(0, 0, 0, 0);

  anychart.core.Base.resumeSignalsDispatchingFalse(this.xAxis_, this.yAxis_);
};


//endregion
//region --- Interactivity
//------------------------------------------------------------------------------
//
//  Interactivity
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.getSeriesStatus = function(event) {
  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var value, index;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var radius = Math.min(this.dataBounds.width, this.dataBounds.height) / 2;
  var cx = Math.round(this.dataBounds.left + this.dataBounds.width / 2);
  var cy = Math.round(this.dataBounds.top + this.dataBounds.height / 2);

  var clientRadius = anychart.math.vectorLength(cx, cy, x, y);

  if (clientRadius > radius)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;
  var iterator;
  var dx, dy, angle;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var leftSideRatio, rightSideRatio;
    if (clientRadius - spotRadius >= 0) {
      dx = cx - x;
      dy = cy - y;

      angle = Math.atan(dx / dy);
      if (angle <= 0)
        angle += Math.PI;
      if (dx < 0 || (angle == Math.PI && dy > 0))
        angle += Math.PI;
      angle += this.startAngle_;
      goog.math.modulo(/** @type {number} */(angle), Math.PI * 2);


      var dAngle = Math.asin(spotRadius / clientRadius);
      var leftSideAngle = angle + dAngle;
      var rightSideAngle = angle - dAngle;

      leftSideRatio = 1 - (leftSideAngle / (Math.PI * 2));
      rightSideRatio = 1 - (rightSideAngle / (Math.PI * 2));
    } else {
      leftSideRatio = 0;
      rightSideRatio = 1;
    }

    var minValue, maxValue;
    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      if (series.enabled()) {
        minValue = /** @type {number} */(series.xScale().inverseTransform(leftSideRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(rightSideRatio));

        var indexes = this.categorizeData ?
            series.findInRangeByX(minValue, maxValue) :
            series.data().findInRangeByX(minValue, maxValue);

        if (rightSideRatio >= 1) {
          index = series.data().findInUnsortedDataByX(0);
          goog.array.extend(indexes, index);
        }

        iterator = series.getDetachedIterator();

        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            var pointX = /** @type {number} */(iterator.meta('x'));
            var pointY = /** @type {number} */(iterator.meta('value'));

            var length = anychart.math.vectorLength(pointX, pointY, x, y);
            if (length <= spotRadius) {
              ind.push(index);
              if (length < minLength) {
                minLength = length;
                minLengthIndex = index;
              }
            }
          }
        }
        if (ind.length)
          points.push({
            series: series,
            points: ind,
            lastPoint: ind[ind.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
      }
    }
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    dx = cx - x;
    dy = cy - y;

    angle = Math.atan(dx / dy);
    if (angle <= 0)
      angle += Math.PI;
    if (dx < 0 || (angle == Math.PI && dy > 0))
      angle += Math.PI;
    angle += this.startAngle_;
    goog.math.modulo(/** @type {number} */(angle), Math.PI * 2);

    var ratio = 1 - (angle / (Math.PI * 2));
    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      value = series.xScale().inverseTransform(ratio);
      if (this.categorizeData) {
        var tmp = series.findX(value);
        index = tmp >= 0 ? [tmp] : [];
      } else {
        index = series.data().findInUnsortedDataByX(anychart.utils.toNumber(value));
      }

      var dataCache = series.data().cachedScatterValues;
      if (dataCache && goog.isDef(dataCache.lastNotNaNValueIndex) && dataCache.lastNotNaNValueIndex != -1) {
        iterator = series.getIterator();
        iterator.select(dataCache.lastNotNaNValueIndex);
        var lastNotNaNValue = iterator.get('x');
        var lastNotNaNValueRatio = series.xScale().transform(lastNotNaNValue);
        if (ratio > lastNotNaNValueRatio && ratio > lastNotNaNValueRatio + (1 - lastNotNaNValueRatio) / 2) {
          index = series.data().findInUnsortedDataByX(0);
        }
      }

      iterator = series.getDetachedIterator();
      minLength = Infinity;
      if (index.length) {
        var resultIndex = [];
        for (j = 0; j < index.length; j++) {
          if (iterator.select(index[j])) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));
            length = anychart.math.vectorLength(pixX, pixY, x, y);
            if (length < minLength) {
              minLength = length;
              minLengthIndex = index[j];
            }

            resultIndex.push(index[j]);
          }
        }

        points.push({
          series: series,
          points: resultIndex,
          lastPoint: resultIndex[index.length - 1],
          nearestPointToCursor: {index: minLengthIndex, distance: minLength}
        });
      }
    }
  }
  return /** @type {Array.<Object>} */(points);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.serialize = function() {
  var json = anychart.core.RadarPolarChart.base(this, 'serialize');
  json['type'] = this.getType();
  return {'chart': json};
};


/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.core.RadarPolarChart.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  this.startAngle(config['startAngle']);
  this.innerRadius(config['innerRadius']);
  this.defaultGridSettings(config['defaultGridSettings']);
  this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  this.setupElementsWithScales(config['grids'], this.grid, scalesInstances);
  this.setupElementsWithScales(config['minorGrids'], this.minorGrid, scalesInstances);

  var json = config['xAxis'];
  this.xAxis().setupByVal(json, opt_default);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
    this.xAxis().scale(scalesInstances[json['scale']]);

  json = config['yAxis'];
  this.yAxis(json);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
    this.yAxis().scale(scalesInstances[json['scale']]);
};


/** @inheritDoc */
anychart.core.RadarPolarChart.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.core.RadarPolarChart.base(this, 'serializeWithScales', json, scales, scaleIds);

  var axesIds = [];
  json['startAngle'] = this.startAngle();
  json['innerRadius'] = this.innerRadius();

  json['xAxis'] = this.serializeAxis_(/** @type {anychart.core.axes.Radar|anychart.core.axes.Polar} */(this.xAxis()), scales, scaleIds, axesIds);
  json['yAxis'] = this.serializeAxis_(/** @type {anychart.core.axes.Radial} */(this.yAxis()), scales, scaleIds, axesIds);

  this.serializeElementsWithScales(json, 'grids', this.grids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'minorGrids', this.minorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
};


/**
 * Serializes an axis and returns its config.
 * @param {anychart.core.axes.Radar|anychart.core.axes.Polar|anychart.core.axes.Radial} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.RadarPolarChart.prototype.serializeAxis_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.grids.Radar|anychart.core.grids.Polar} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.RadarPolarChart.prototype.serializeGrid_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.xScale()), scales, scaleIds);
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.yScale()), scales, scaleIds);
  var axis = /** @type {anychart.core.axes.Linear} */(item.axis());
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = axis instanceof anychart.core.axes.Radial ?
            anychart.enums.RadialGridLayout.CIRCUIT :
            anychart.enums.RadialGridLayout.RADIAL;
      }
      if (!('scale' in config)) { //doesn't override the scale already set.
        this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(axis.scale()), scales, scaleIds);
      }
    } else {
      config['axis'] = axisIndex;
    }
  }
  return config;
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.core.RadarPolarChart.prototype;
  proto['xScale'] = proto.xScale;//doc|ex
  proto['yScale'] = proto.yScale;//doc|ex
  proto['grid'] = proto.grid;//doc|ex
  proto['minorGrid'] = proto.minorGrid;//doc|ex
  proto['xAxis'] = proto.xAxis;//doc|ex
  proto['yAxis'] = proto.yAxis;//doc|ex
  proto['getSeries'] = proto.getSeries;//doc|ex
  // autoexport
  // proto['area'] = proto.area;//doc|ex
  // proto['line'] = proto.line;//doc|ex
  // proto['marker'] = proto.marker;//doc|ex
  proto['palette'] = proto.palette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;//doc|ex
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['startAngle'] = proto.startAngle;//doc|ex
  proto['innerRadius'] = proto.innerRadius;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
})();
//endregion
