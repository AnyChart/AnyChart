goog.provide('anychart.core.ChartWithOrthogonalScales');

goog.require('anychart.animations');
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.scales');
goog.require('goog.array');



/**
 * A base class for the chart with series.
 * @constructor
 * @extends {anychart.core.ChartWithSeries}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IPlot}
 * @param {boolean} categorizeData
 */
anychart.core.ChartWithOrthogonalScales = function(categorizeData) {
  anychart.core.ChartWithOrthogonalScales.base(this, 'constructor');

  /**
   * If true, all default chart elements layout is swapped.
   * @type {boolean}
   */
  this.barChartMode = false;

  /**
   * If series data should be sorted and joined
   * @type {boolean}
   */
  this.categorizeData = categorizeData;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * Chart has stacked series.
   * @type {boolean}
   * @protected
   */
  this.hasStackedSeries = false;

  /**
   * @type {number}
   * @private
   */
  this.barGroupsPadding_;

  /**
   * @type {number}
   * @private
   */
  this.barsPadding_;

  /**
   * Y scales hash map by uid.
   * @type {Object.<string, anychart.scales.Base>}
   * @protected
   */
  this.yScales = {};

  /**
   * Y scales hash map by uid.
   * @type {Object.<string, anychart.scales.Base>}
   * @protected
   */
  this.xScales = {};

  /**
   * Drawing plans for each series.
   * @type {Array.<Object>}
   * @private
   */
  this.drawingPlans_ = [];

  /**
   * Drawing plans categorised by X scale.
   * @type {Object.<string, Array.<Object>>}
   * @private
   */
  this.drawingPlansByXScale_ = {};
};
goog.inherits(anychart.core.ChartWithOrthogonalScales, anychart.core.ChartWithSeries);


//region --- Static props and methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Static props and methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ChartWithOrthogonalScales.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCALE_CHART_SCALES |
    anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
    anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
    anychart.ConsistencyState.SCALE_CHART_STATISTICS;


//endregion
//region --- Series specific settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for barGroupsPadding.
 * @param {number=} opt_value .
 * @return {number|anychart.core.ChartWithOrthogonalScales} .
 */
anychart.core.ChartWithOrthogonalScales.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries();
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Getter/setter for barsPadding.
 * @param {number=} opt_value .
 * @return {number|anychart.core.ChartWithOrthogonalScales} .
 */
anychart.core.ChartWithOrthogonalScales.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries();
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.barsPadding_;
};


//endregion
//region --- Scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.allowLegendCategoriesMode = function() {
  return true;
};


/**
 * Checks x scale type.
 * @param {*} scale
 * @return {boolean}
 */
anychart.core.ChartWithOrthogonalScales.prototype.checkXScaleType = function(scale) {
  return scale instanceof anychart.scales.Base;
};


/**
 * Checks y scale type.
 * @param {*} scale
 * @return {boolean}
 */
anychart.core.ChartWithOrthogonalScales.prototype.checkYScaleType = anychart.core.ChartWithOrthogonalScales.prototype.checkXScaleType;


/**
 * Creates scale by passed type.
 * @param {string} value
 * @param {boolean} isXScale
 * @param {boolean} returnNullOnError
 * @return {anychart.scales.Base}
 */
anychart.core.ChartWithOrthogonalScales.prototype.createScaleByType = function(value, isXScale, returnNullOnError) {
  return anychart.scales.Base.fromString(value, returnNullOnError ? null : isXScale);
};


/**
 * Getter/setter for xScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.core.ChartWithOrthogonalScales)} Default chart scale value or itself for method chaining.
 */
anychart.core.ChartWithOrthogonalScales.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = this.createScaleByType(opt_value, true, false);
    }
    if (this.checkXScaleType(opt_value) && this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.xScaleInvalidated, this);
      this.xScale_ = opt_value;
      if (this.xScale_)
        this.xScale_.listenSignals(this.xScaleInvalidated, this);

      var state = anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
      if (this.allowLegendCategoriesMode() &&
          this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
        state |= anychart.ConsistencyState.CHART_LEGEND;
      }
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      // should create default scale
      this.xScale_ = this.createScaleByType('', true, false);
      this.xScale_.listenSignals(this.xScaleInvalidated, this);
    }
    return /** @type {!anychart.scales.Base} */(this.xScale_);
  }
};


/**
 * Chart xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.xScaleInvalidated = function(event) {
  this.suspendSignalsDispatching();
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
    if (this.allowLegendCategoriesMode() &&
        this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
    this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidateSeriesOfScale(this.xScale_);
  }
  this.resumeSignalsDispatching(true);
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.core.ChartWithOrthogonalScales)} Default chart scale value or itself for method chaining.
 */
anychart.core.ChartWithOrthogonalScales.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = this.createScaleByType(opt_value, false, false);
    }
    if (this.checkYScaleType(opt_value) && this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.yScaleInvalidated, this);
      this.yScale_ = opt_value;
      if (this.yScale_)
        this.yScale_.listenSignals(this.yScaleInvalidated, this);

      this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = this.createScaleByType('', false, false);
      this.yScale_.listenSignals(this.yScaleInvalidated, this);
    }
    return /** @type {!anychart.scales.Base} */(this.yScale_);
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.yScaleInvalidated = function(event) {
  this.suspendSignalsDispatching();
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS, anychart.Signal.NEEDS_REDRAW);
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidateSeriesOfScale(this.yScale_);
  this.resumeSignalsDispatching(true);
};


/**
 * Invalidates all series that use this scale.
 * @param {*} scale
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.invalidateSeriesOfScale = function(scale) {
  var foundOne = 0;
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    if (series && series.enabled() && (series.getXScale() == scale || series.yScale() == scale)) {
      foundOne |= series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
    }
  }
  if (foundOne)
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Calculations
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.ensureStatisticsReady = function() {
  this.calculate();
  this.calculateStatistics();
};


/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.drawInternal = function() {
  if (!this.isConsistent(anychart.ConsistencyState.SCALE_CHART_STATISTICS))
    anychart.core.ChartWithOrthogonalScales.base(this, 'drawInternal');
};


/**
 * Performs full calculations of drawing plans and statistics.
 */
anychart.core.ChartWithOrthogonalScales.prototype.calculate = function() {
  anychart.performance.start('Scale calculations');
  this.suspendSignalsDispatching();
  this.makeScaleMaps();
  if (this.categorizeData) {
    this.calculateXScales();
    this.applyXZoom();
    this.calculateYScales();
  } else {
    this.calculateXYScales();
  }
  this.resumeSignalsDispatching(false);
  anychart.performance.end('Scale calculations');
};


/**
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.makeScaleMaps = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS)) {
    anychart.performance.start('Scale maps gathering');
    anychart.core.Base.suspendSignalsDispatching(this.seriesList);
    var i, series;
    var seriesCount = this.seriesList.length;
    var changed = false;
    var xScales = {};
    var yScales = {};
    for (i = 0; i < seriesCount; i++) {
      series = this.seriesList[i];
      if (series) {
        var scale = /** @type {anychart.scales.Base} */(series.xScale());
        var uid = goog.getUid(scale);
        xScales[uid] = scale;
        if (!(uid in this.xScales))
          changed = true;
        scale = /** @type {anychart.scales.Base} */(series.yScale());
        uid = goog.getUid(scale);
        yScales[uid] = scale;
        if (!(uid in this.yScales))
          changed = true;
      }
    }
    this.yScales = yScales;
    this.xScales = xScales;
    if (changed) {
      this.invalidateAnnotations();
      this.invalidate(
          anychart.ConsistencyState.CARTESIAN_ZOOM |
          anychart.ConsistencyState.AXES_CHART_ANNOTATIONS |
          anychart.ConsistencyState.SERIES_CHART_SERIES |
          anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES);
    }
    anychart.core.Base.resumeSignalsDispatchingFalse(this.seriesList);
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS);
    anychart.performance.end('Scale maps gathering');
  }
};


/**
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.calculateXScales = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    anychart.performance.start('X scales and drawing plan calculation');
    var i, j, series;
    var xScale;
    var seriesCount = this.seriesList.length;
    var drawingPlan, drawingPlans, drawingPlansByYScale, uid, point, val;
    this.drawingPlans_ = [];
    this.drawingPlansByXScale_ = {};
    /**
     * Drawing plans categorised by Y and X scale (Y scale uid is outer index, X scale uid - inner).
     * @type {Object.<string, Object.<string, Array.<Object>>>}
     * @private
     */
    this.drawingPlansByYAndXScale_ = {};
    for (uid in this.xScales) {
      xScale = this.xScales[uid];
      if (xScale.needsAutoCalc())
        xScale.startAutoCalc();
    }
    for (i = 0; i < seriesCount; i++) {
      series = /** @type {anychart.core.series.Cartesian} */(this.seriesList[i]);
      if (!series || !series.enabled()) continue;
      xScale = /** @type {anychart.scales.Base} */(series.xScale());
      uid = goog.getUid(xScale);
      drawingPlans = this.drawingPlansByXScale_[uid];
      if (!drawingPlans)
        this.drawingPlansByXScale_[uid] = drawingPlans = [];
      if (xScale instanceof anychart.scales.Ordinal) {
        var xHashMap, xArray;
        var restricted = !xScale.needsAutoCalc();
        if (drawingPlans.length) {
          drawingPlan = drawingPlans[drawingPlans.length - 1];
          xHashMap = drawingPlan.xHashMap;
          xArray = drawingPlan.xArray;
        } else {
          if (restricted) {
            xArray = xScale.values();
            xHashMap = xScale.getValuesMapInternal();
          } else {
            xArray = [];
            xHashMap = {};
          }
        }
        drawingPlan = series.getOrdinalDrawingPlan(xHashMap, xArray, restricted, xScale.getNamesField() || undefined);
      } else {
        drawingPlan = series.getScatterDrawingPlan(true, xScale instanceof anychart.scales.DateTime);
      }
      drawingPlans.push(drawingPlan);
      this.drawingPlans_.push(drawingPlan);
      drawingPlansByYScale = this.drawingPlansByYAndXScale_[uid];
      if (!drawingPlansByYScale)
        this.drawingPlansByYAndXScale_[uid] = drawingPlansByYScale = {};
      uid = goog.getUid(series.yScale());
      drawingPlans = drawingPlansByYScale[uid];
      if (!drawingPlans)
        drawingPlansByYScale[uid] = drawingPlans = [];
      drawingPlans.push(drawingPlan);
    }
    for (uid in this.drawingPlansByXScale_) {
      drawingPlans = this.drawingPlansByXScale_[uid];
      xScale = /** @type {anychart.scales.Base} */(drawingPlans[0].series.xScale());
      // equalizing drawing plans and populating them with missing points
      if (drawingPlans.length > 1) {
        drawingPlan = drawingPlans[drawingPlans.length - 1];
        if (xScale instanceof anychart.scales.Ordinal) {
          var lastPlanXArray = drawingPlan.xArray;
          // we need to populate other series data with missing points to the length of the last array
          for (i = 0; i < drawingPlans.length - 1; i++) {
            drawingPlan = drawingPlans[i];
            for (j = drawingPlan.data.length; j < lastPlanXArray.length; j++) {
              drawingPlan.data.push(anychart.core.series.Cartesian.makeMissingPoint(lastPlanXArray[j]));
            }
          }
        } else {
          var registry = [];
          var data0, data1, dataLength0, dataLength1, current0, current1, val0, val1, inc0, inc1;
          // step one - we merge first two plans to prevent first light-loaded run on the first source with empty res array
          data0 = drawingPlans[0].data;
          data1 = drawingPlans[1].data;
          dataLength0 = data0.length;
          dataLength1 = data1.length;
          current0 = 0;
          current1 = 0;
          val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
          val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
          while (!isNaN(val0) && !isNaN(val1)) {
            inc0 = val0 <= val1;
            inc1 = val0 >= val1;
            registry.push(inc0 ? val0 : val1);
            if (inc0) {
              current0++;
              val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
            }
            if (inc1) {
              current1++;
              val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            }
          }
          while (!isNaN(val0)) {
            registry.push(val0);
            current0++;
            val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
          }
          while (!isNaN(val1)) {
            registry.push(val1);
            current1++;
            val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
          }

          // step two - we merge i-th source and the merge result of the previous arrays.
          for (i = 2; i < drawingPlans.length; i++) {
            var res = [];
            data0 = registry;
            data1 = drawingPlans[i].data;
            dataLength0 = data0.length;
            dataLength1 = data1.length;
            current0 = 0;
            current1 = 0;
            val0 = current0 < dataLength0 ? data0[current0] : NaN;
            val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            while (!isNaN(val0) && !isNaN(val1)) {
              inc0 = val0 <= val1;
              inc1 = val0 >= val1;
              res.push(inc0 ? val0 : val1);
              if (inc0) {
                current0++;
                val0 = current0 < dataLength0 ? data0[current0] : NaN;
              }
              if (inc1) {
                current1++;
                val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
              }
            }
            while (!isNaN(val0)) {
              res.push(val0);
              current0++;
              val0 = current0 < dataLength0 ? data0[current0] : NaN;
            }
            while (!isNaN(val1)) {
              res.push(val1);
              current1++;
              val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            }
            registry = res;
          }

          // now we've got the registry of unique X'es
          // we should ensure, that all drawing plans have the same length
          for (i = 0; i < drawingPlans.length; i++) {
            drawingPlan = drawingPlans[i];
            data0 = drawingPlan.data;
            dataLength0 = data0.length;
            if (dataLength0 < registry.length) {
              var resultingData = [];
              current0 = 0;
              point = data0[current0];
              val0 = point ? point.data['x'] : NaN;
              for (j = 0; j < registry.length; j++) {
                val1 = registry[j];
                if (val0 <= val1) { // false for val0 == NaN
                  resultingData.push(point);
                  current0++;
                  point = data0[current0];
                  val0 = point ? point.data['x'] : NaN;
                } else {
                  resultingData.push(anychart.core.series.Cartesian.makeMissingPoint(val1));
                }
              }
              drawingPlan.data = resultingData;
            }
          }
        }
      }
      var hasExcludes = false;
      var excludesMap = {};
      for (i = 0; i < drawingPlans.length; i++) {
        drawingPlan = drawingPlans[i];
        series = /** @type {anychart.core.series.Cartesian} */(drawingPlan.series);
        var seriesExcludes = series.getExcludedIndexesInternal();
        if (seriesExcludes.length) {
          hasExcludes = true;
          for (j = 0; j < seriesExcludes.length; j++) {
            var index = seriesExcludes[j];
            excludesMap[index] = true;
            drawingPlan.data[index].meta['missing'] = anychart.core.series.mixPointAbsenceReason(
                drawingPlan.data[index].meta['missing'],
                anychart.core.series.PointAbsenceReason.EXCLUDED_POINT);
          }
        }
      }
      if (hasExcludes) {
        excludesMap = goog.object.filter(excludesMap, function(ignored, index) {
          for (var i = 0; i < drawingPlans.length; i++) {
            var drawingPlan = drawingPlans[i];
            var meta = drawingPlan.data[+index].meta;
            if (!anychart.core.series.filterPointAbsenceReason(meta['missing'],
                anychart.core.series.PointAbsenceReason.EXCLUDED_OR_ARTIFICIAL))
              return false;
          }
          return true;
        });
      }
      drawingPlan = drawingPlans[0];
      if (xScale.needsAutoCalc()) {
        if (xScale instanceof anychart.scales.Ordinal) {
          if (hasExcludes) {
            xHashMap = {};
            xArray = [];
            for (i = 0; i < drawingPlan.data.length; i++) {
              if (!(i in excludesMap)) {
                var xValue = drawingPlan.data[i].data['x'];
                xHashMap[anychart.utils.hash(xValue)] = xArray.length;
                xArray.push(xValue);
              }
            }
          } else {
            xHashMap = drawingPlan.xHashMap;
            xArray = drawingPlan.xArray;
          }
          xScale.setAutoValues(xHashMap, xArray);
        } else if (drawingPlan.data.length) {
          if (hasExcludes) {
            for (i = 0; i < drawingPlan.data.length; i++) {
              if (!(i in excludesMap)) {
                xScale.extendDataRange(drawingPlan.data[i].data['x']);
              }
            }
          } else {
            xScale.extendDataRange(
                drawingPlan.data[0].data['x'],
                drawingPlan.data[drawingPlan.data.length - 1].data['x']);
          }
          if (drawingPlan.series.supportsError()) {
            var iterator;
            var error;
            if (drawingPlan.hasPointXErrors) {
              iterator = drawingPlan.series.getResetIterator();
              while (iterator.advance()) { // we need iterator to make error work :(
                if (!anychart.core.series.filterPointAbsenceReason(iterator.meta('missing'),
                        anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                  error = drawingPlan.series.error().getErrorValues(true);
                  val = iterator.get('x');
                  xScale.extendDataRange(val - error[0], val + error[1]);
                }
              }
            } else if (drawingPlan.series.error().hasGlobalErrorValues()) {
              iterator = drawingPlan.series.getResetIterator();
              iterator.select(0);
              error = drawingPlan.series.error().getErrorValues(true);
              val = iterator.get('x');
              xScale.extendDataRange(val - error[0], val + error[1]);
              iterator.select(drawingPlan.data.length - 1);
              error = drawingPlan.series.error().getErrorValues(true);
              val = iterator.get('x');
              xScale.extendDataRange(val - error[0], val + error[1]);
            }
          }
        }
      }
      if (xScale instanceof anychart.scales.Ordinal) {
        var namesField = xScale.getNamesField();
        // retrieving names
        if (namesField != null) {
          var remainingNames = drawingPlans[0].xArray.length;
          var autoNames = new Array(remainingNames);
          for (i = 0; i < drawingPlans.length; i++) {
            var drawingPlanData = drawingPlans[i].data;
            if (remainingNames > 0) {
              for (j = 0; j < drawingPlanData.length; j++) {
                if (!goog.isDef(autoNames[j]) && goog.isDef(val = drawingPlanData[j].data[namesField])) {
                  autoNames[j] = val;
                  remainingNames--;
                }
              }
            }
          }
          xScale.setAutoNames(autoNames);
        }
      }
    }
    for (uid in this.xScales) {
      xScale = this.xScales[uid];
      if (xScale.needsAutoCalc())
        xScale.finishAutoCalc();
    }
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES);
    anychart.performance.end('X scales and drawing plan calculation');
  }
};


/**
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.calculateYScales = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_Y_SCALES)) {
    anychart.performance.start('Y scales calculation');
    var i, j, series;
    var yScale;
    var drawingPlan, drawingPlans, drawingPlansByYScale, uid, point;
    var data, val;
    this.hasStackedSeries = false;
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.startAutoCalc();
    }
    for (uid in this.drawingPlansByYAndXScale_) {
      // calculating zoomed indexes
      var firstIndex, lastIndex;
      data = this.drawingPlansByXScale_[uid][0].data;
      var dataLength = data.length;
      var xScale = this.xScales[uid];
      if (xScale instanceof anychart.scales.Ordinal) {
        if (dataLength) {
          firstIndex = goog.math.clamp(Math.floor(this.getZoomStartRatio() * dataLength - 1), 0, dataLength - 1);
          lastIndex = goog.math.clamp(Math.ceil(this.getZoomEndRatio() * dataLength + 1), 0, dataLength - 1);
        } else {
          firstIndex = NaN;
          lastIndex = NaN;
        }
      } else {
        var firstVal = /** @type {number} */(xScale.inverseTransform(0));
        var lastVal = /** @type {number} */(xScale.inverseTransform(1));
        if (dataLength) {
          /**
           * Comparator function.
           * @param {number} target
           * @param {Object} item
           * @return {number}
           */
          var searcher = function(target, item) {
            return target - item.data['x'];
          };
          firstIndex = goog.array.binarySearch(data, firstVal, searcher);
          if (firstIndex < 0) firstIndex = ~firstIndex - 1;
          firstIndex = goog.math.clamp(firstIndex, 0, dataLength - 1);
          lastIndex = goog.array.binarySearch(data, lastVal, searcher);
          if (lastIndex < 0) lastIndex = ~lastIndex;
          lastIndex = goog.math.clamp(lastIndex, 0, dataLength - 1);
        } else {
          firstIndex = NaN;
          lastIndex = NaN;
        }
      }
      drawingPlansByYScale = this.drawingPlansByYAndXScale_[uid];
      for (var yUid in drawingPlansByYScale) {
        drawingPlans = drawingPlansByYScale[yUid];
        yScale = this.yScales[yUid];
        var yScaleStacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;
        var yScalePercentStacked = yScale.stackMode() == anychart.enums.ScaleStackMode.PERCENT;
        var stack, stackVal;
        if (yScaleStacked) {
          stack = [];
          for (j = firstIndex; j <= lastIndex; j++) {
            stack.push({
              prevPositive: 0,
              positive: 0,
              nextPositive: 0,
              prevNegative: 0,
              negative: 0,
              nextNegative: 0,
              prevMissing: false,
              nextMissing: false,
              missing: false
            });
          }
        }
        for (i = 0; i < drawingPlans.length; i++) {
          drawingPlan = drawingPlans[i];
          series = /** @type {anychart.core.series.Cartesian} */(drawingPlan.series);
          drawingPlan.firstIndex = firstIndex;
          drawingPlan.lastIndex = lastIndex;
          drawingPlan.stacked = yScaleStacked && series.supportsStack();
          this.hasStackedSeries = this.hasStackedSeries || drawingPlan.stacked;
          data = drawingPlan.data;
          if (drawingPlan.stacked || yScalePercentStacked) {
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              stackVal = stack[j - firstIndex];
              point.meta['stackedMissing'] = stackVal.missing;
              if (anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                      anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                stackVal.missing = true;
              } else {
                val = +point.data['value'];
                if (val >= 0) {
                  point.meta['stackedZero'] = stackVal.positive;
                  stackVal.positive += val;
                  point.meta['stackedValue'] = stackVal.positive;
                  if (!yScalePercentStacked) {
                    if (!stackVal.prevMissing) {
                      point.meta['stackedZeroPrev'] = point.meta['stackedValuePrev'] = NaN;
                    } else {
                      point.meta['stackedZeroPrev'] = stackVal.prevPositive;
                      point.meta['stackedValuePrev'] = stackVal.prevPositive + val;
                    }
                    if (!stackVal.nextMissing) {
                      point.meta['stackedZeroNext'] = point.meta['stackedValueNext'] = NaN;
                    } else {
                      point.meta['stackedZeroNext'] = stackVal.nextPositive;
                      point.meta['stackedValueNext'] = stackVal.nextPositive + val;
                    }
                  }
                } else {
                  point.meta['stackedZero'] = stackVal.negative;
                  stackVal.negative += val;
                  point.meta['stackedValue'] = stackVal.negative;
                  if (!yScalePercentStacked) {
                    if (!stackVal.prevMissing) {
                      point.meta['stackedZeroPrev'] = point.meta['stackedValuePrev'] = NaN;
                    } else {
                      point.meta['stackedZeroPrev'] = stackVal.prevNegative;
                      point.meta['stackedValuePrev'] = stackVal.prevNegative + val;
                    }
                    if (!stackVal.nextMissing) {
                      point.meta['stackedZeroNext'] = point.meta['stackedValueNext'] = NaN;
                    } else {
                      point.meta['stackedZeroNext'] = stackVal.nextNegative;
                      point.meta['stackedValueNext'] = stackVal.nextNegative + val;
                    }
                  }
                }
                if (!yScalePercentStacked) {
                  yScale.extendDataRange(point.meta['stackedValuePrev']);
                  yScale.extendDataRange(point.meta['stackedValue']);
                  yScale.extendDataRange(point.meta['stackedValueNext']);
                  point = data[j - 1];
                  if (point) {
                    if (anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                            anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                      stackVal.prevMissing = true;
                    } else {
                      if (val >= 0) {
                        stackVal.prevPositive += val;
                      } else {
                        stackVal.prevNegative += val;
                      }
                    }
                  }
                  point = data[j + 1];
                  if (point) {
                    if (anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                            anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                      stackVal.nextMissing = true;
                    } else {
                      if (val >= 0) {
                        stackVal.nextPositive += val;
                      } else {
                        stackVal.nextNegative += val;
                      }
                    }
                  }
                }
                stackVal.missing = false;
              }
            }
          } else {
            var names = series.getYValueNames();
            var k;
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              if (!anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                  anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                for (k = 0; k < names.length; k++) {
                  yScale.extendDataRange(point.data[names[k]]);
                }
              }
            }
            if (drawingPlan.series.supportsOutliers()) {
              for (j = firstIndex; j <= lastIndex; j++) {
                point = data[j];
                var outliers = point.data['outliers'];
                if (!anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                    anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE) && goog.isArray(outliers)) {
                  for (k = 0; k < outliers.length; k++) {
                    yScale.extendDataRange(outliers[k]);
                  }
                }
              }
            }
            if (drawingPlan.series.supportsError() &&
                (drawingPlan.series.error().hasGlobalErrorValues() ||
                drawingPlan.hasPointYErrors)) {
              var iterator = drawingPlan.series.getResetIterator();
              while (iterator.advance()) { // we need iterator to make error work :(
                if (!anychart.core.series.filterPointAbsenceReason(iterator.meta('missing'),
                        anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                  var error = drawingPlan.series.error().getErrorValues(false);
                  val = anychart.utils.toNumber(iterator.get('value'));
                  yScale.extendDataRange(val - error[0], val + error[1]);
                }
              }
            }
          }
        }
        if (yScalePercentStacked) {
          yScale.extendDataRange(0);
          for (i = 0; i < drawingPlans.length; i++) {
            drawingPlan = drawingPlans[i];
            data = drawingPlan.data;
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              stackVal = stack[j - firstIndex];
              if (anychart.core.series.filterPointAbsenceReason(point.meta['missing'],
                      anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
                point.meta['stackedPositiveZero'] = (point.meta['stackedPositiveZero'] / stackVal.positive * 100) || 0;
                point.meta['stackedNegativeZero'] = (point.meta['stackedNegativeZero'] / stackVal.negative * 100) || 0;
              } else {
                val = point.meta['stackedValue'];
                var sum;
                if (val >= 0) {
                  sum = stackVal.positive;
                  yScale.extendDataRange(100);
                } else {
                  sum = -stackVal.negative;
                  yScale.extendDataRange(-100);
                }
                point.meta['stackedZero'] = (point.meta['stackedZero'] / sum * 100) || 0;
                point.meta['stackedValue'] = (point.meta['stackedValue'] / sum * 100) || 0;
              }
            }
          }
        }
      }
    }
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.finishAutoCalc();
    }


    this.invalidate(anychart.ConsistencyState.SCALE_CHART_STATISTICS);
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_Y_SCALES);
    anychart.performance.end('Y scales calculation');
  }
};


/**
 * Scatter way.
 */
anychart.core.ChartWithOrthogonalScales.prototype.calculateXYScales = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES)) {

    anychart.performance.start('X scales, drawing plans and Y scales calculation');
    anychart.core.Base.suspendSignalsDispatching(this.seriesList);
    var i, j, k, series;
    var xScale, yScale;
    var seriesCount = this.seriesList.length;
    var drawingPlan, drawingPlans, uid, error, val;
    this.drawingPlans_.length = 0;
    this.drawingPlansByXScale_ = {};
    for (uid in this.xScales) {
      xScale = this.xScales[uid];
      if (xScale.needsAutoCalc())
        xScale.startAutoCalc();
    }
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.startAutoCalc();
    }
    for (i = 0; i < seriesCount; i++) {
      series = /** @type {anychart.core.series.Cartesian} */(this.seriesList[i]);
      if (!series || !series.enabled()) continue;
      xScale = /** @type {anychart.scales.Base} */(series.xScale());
      yScale = /** @type {anychart.scales.Base} */(series.yScale());
      drawingPlan = series.getScatterDrawingPlan(false, xScale instanceof anychart.scales.DateTime);
      series = /** @type {anychart.core.series.Cartesian} */(drawingPlan.series);
      var seriesExcludes = series.getExcludedIndexesInternal();
      if (seriesExcludes.length) {
        for (j = 0; j < seriesExcludes.length; j++) {
          var meta = drawingPlan.data[seriesExcludes[j]].meta;
          meta['missing'] = anychart.core.series.mixPointAbsenceReason(
              meta['missing'],
              anychart.core.series.PointAbsenceReason.EXCLUDED_POINT);
        }
      }
      var hasError = series.supportsError() &&
          (drawingPlan.hasPointXErrors || drawingPlan.series.error().hasGlobalErrorValues());
      var iterator = series.getResetIterator();
      var names = series.getYValueNames();
      while (iterator.advance()) { // we need iterator to make error work :(
        if (!anychart.core.series.filterPointAbsenceReason(
            iterator.meta('missing'),
            anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
          val = iterator.get('x');
          xScale.extendDataRange(val);
          if (hasError) {
            error = drawingPlan.series.error().getErrorValues(true);
            val = anychart.utils.toNumber(val);
            xScale.extendDataRange(val - error[0], val + error[1]);
            error = drawingPlan.series.error().getErrorValues(false);
            val = anychart.utils.toNumber(iterator.get('value'));
            yScale.extendDataRange(val - error[0], val + error[1]);
          } else {
            for (k = 0; k < names.length; k++) {
              yScale.extendDataRange(iterator.get(names[k]));
            }
          }
        }
      }
      drawingPlan.firstIndex = 0;
      drawingPlan.lastIndex = drawingPlan.data.length;
      uid = goog.getUid(xScale);
      drawingPlans = this.drawingPlansByXScale_[uid];
      if (!drawingPlans)
        this.drawingPlansByXScale_[uid] = drawingPlans = [];
      drawingPlans.push(drawingPlan);
      this.drawingPlans_.push(drawingPlan);
    }

    for (uid in this.xScales) {
      xScale = this.xScales[uid];
      if (xScale.needsAutoCalc())
        xScale.finishAutoCalc();
    }
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.finishAutoCalc();
    }

    this.invalidate(anychart.ConsistencyState.SCALE_CHART_STATISTICS);

    anychart.core.Base.resumeSignalsDispatchingFalse(this.seriesList);
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES);
    anychart.performance.end('X scales, drawing plans and Y scales calculation');
  }
};


/**
 * Calculates all statistics for the chart.
 */
anychart.core.ChartWithOrthogonalScales.prototype.calculateStatistics = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_STATISTICS)) {
    anychart.performance.start('Statistics calculation');

    this.resetStatistics();

    //category statistics calculation.
    var totalPointsCount = 0;
    var totalYSum = 0;
    var totalYMax = -Infinity;
    var totalYMin = Infinity;
    var totalMaxYSum = -Infinity;
    var totalMinYSum = Infinity;
    var maxYSeriesName, minYSeriesName;
    var maxYSumSeriesName, minYSumSeriesName;
    var totalXSum = 0;
    var totalXMax = -Infinity;
    var totalXMin = Infinity;
    var totalMaxXSum = -Infinity;
    var totalMinXSum = Infinity;
    var maxXSeriesName, minXSeriesName;
    var maxXSumSeriesName, minXSumSeriesName;
    var totalSizeSum = 0;
    var totalSizeMax = -Infinity;
    var totalSizeMin = Infinity;
    var hasBubbleSeries = false;

    for (var i in this.drawingPlansByXScale_) { //iterating by scales.
      var plans = this.drawingPlansByXScale_[i];

      var len, valsArr;
      if (this.categorizeData) {
        anychart.performance.start('Statistics categorize init cycle');
        len = plans[0].data.length;
        valsArr = new Array(len);
        for (var ii = 0; ii < len; ii++) valsArr[ii] = [];
        anychart.performance.end('Statistics categorize init cycle');
      }

      var plan, ser;
      var isRangeSeries, isBubbleSeries;

      //iterating by plans for each series.
      for (var j = 0; j < plans.length; j++) {
        plan = plans[j];
        ser = plan.series;
        if (!ser || !ser.enabled()) continue;

        var sName = ser.name();
        var seriesValues = [];
        var seriesXes = [];
        var seriesSizes = [];
        isRangeSeries = ser.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED | anychart.core.drawers.Capabilities.IS_OHLC_BASED);
        isBubbleSeries = ser.isSizeBased();
        if (isBubbleSeries) hasBubbleSeries = true;

        var pointsCount = 0;
        var seriesYMin = Infinity;
        var seriesYMax = -Infinity;
        var seriesYSum = 0;
        var seriesRangeMin = Infinity;
        var seriesRangeMax = -Infinity;
        var seriesXMin = Infinity;
        var seriesXMax = -Infinity;
        var seriesXSum = 0;
        var seriesSizeMin = Infinity;
        var seriesSizeMax = -Infinity;
        var seriesSizeSum = 0;

        anychart.performance.start('Statistics main cycle');
        for (var d = 0; d < plan.data.length; d++) { //iterating by points in series.
          var pointObj = plan.data[d];
          var pointVal = NaN;

          if (!anychart.core.series.filterPointAbsenceReason(pointObj.meta['missing'],
              anychart.core.series.PointAbsenceReason.ARTIFICIAL_POINT))
            pointsCount++;
          if (!anychart.core.series.filterPointAbsenceReason(pointObj.meta['missing'],
              anychart.core.series.PointAbsenceReason.ANY_BUT_RANGE)) {
            if (isRangeSeries) {
              pointVal = anychart.utils.toNumber(pointObj.data['open']);
              if (!isNaN(pointVal)) {
                seriesYMax = Math.max(pointVal, seriesYMax);
                seriesYMin = Math.min(pointVal, seriesYMin);
              }
              pointVal = anychart.utils.toNumber(pointObj.data['close']);
              if (!isNaN(pointVal)) {
                seriesYMax = Math.max(pointVal, seriesYMax);
                seriesYMin = Math.min(pointVal, seriesYMin);
              }
              var h = anychart.utils.toNumber(pointObj.data['high']);
              var l = anychart.utils.toNumber(pointObj.data['low']);
              seriesYMax = Math.max(h, l, seriesYMax);
              seriesYMin = Math.min(h, l, seriesYMin);
              pointVal = h - l;
              seriesRangeMax = Math.max(pointVal, seriesRangeMax);
              seriesRangeMin = Math.min(pointVal, seriesRangeMin);
            } else {
              if (isBubbleSeries) {
                pointVal = anychart.utils.toNumber(pointObj.data['size']);
                seriesSizeMax = Math.max(pointVal, seriesSizeMax);
                seriesSizeMin = Math.min(pointVal, seriesSizeMin);
                seriesSizeSum += pointVal;
                seriesSizes.push(pointVal);
              }
              pointVal = anychart.utils.toNumber(pointObj.data['value']);
              seriesYMax = Math.max(pointVal, seriesYMax);
              seriesYMin = Math.min(pointVal, seriesYMin);
            }

            seriesYSum += pointVal;
            seriesValues.push(pointVal);
            if (this.categorizeData) {
              valsArr[d].push(pointVal);
            } else {
              pointVal = anychart.utils.toNumber(pointObj.data['x']);
              seriesXMax = Math.max(pointVal, seriesXMax);
              seriesXMin = Math.min(pointVal, seriesXMin);
              seriesXSum += pointVal;
              seriesXes.push(pointVal);
            }
          }
        }
        anychart.performance.end('Statistics main cycle');

        totalPointsCount += pointsCount;
        totalYSum += seriesYSum;
        if (seriesYMax > totalYMax) {
          totalYMax = seriesYMax;
          maxYSeriesName = sName;
        }
        if (seriesYMin < totalYMin) {
          totalYMin = seriesYMin;
          minYSeriesName = sName;
        }
        if (seriesYSum > totalMaxYSum) {
          totalMaxYSum = seriesYSum;
          maxYSumSeriesName = sName;
        }
        if (seriesYSum < totalMinYSum) {
          totalMinYSum = seriesYSum;
          minYSumSeriesName = sName;
        }
        totalXSum += seriesXSum;
        if (seriesXMax > totalXMax) {
          totalXMax = seriesXMax;
          maxXSeriesName = sName;
        }
        if (seriesXMin < totalXMin) {
          totalXMin = seriesXMin;
          minXSeriesName = sName;
        }
        if (seriesXSum > totalMaxXSum) {
          totalMaxXSum = seriesXSum;
          maxXSumSeriesName = sName;
        }
        if (seriesXSum < totalMinXSum) {
          totalMinXSum = seriesXSum;
          minXSumSeriesName = sName;
        }

        var avg = pointsCount ? seriesYSum / pointsCount : 0;
        ser.statistics(anychart.enums.Statistics.SERIES_SUM, seriesYSum);
        ser.statistics(anychart.enums.Statistics.SERIES_MIN, seriesYMin);
        ser.statistics(anychart.enums.Statistics.SERIES_MAX, seriesYMax);
        ser.statistics(anychart.enums.Statistics.SERIES_AVERAGE, avg);
        ser.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT, pointsCount);
        ser.statistics(anychart.enums.Statistics.SERIES_POINT_COUNT, pointsCount);

        ser.statistics(anychart.enums.Statistics.SUM, seriesYSum);
        ser.statistics(anychart.enums.Statistics.MAX, seriesYMax);
        ser.statistics(anychart.enums.Statistics.MIN, seriesYMin);
        ser.statistics(anychart.enums.Statistics.AVERAGE, avg);
        ser.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);

        if (isRangeSeries) {
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_MAX, seriesRangeMax);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_MIN, seriesRangeMin);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_SUM, seriesYSum);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_AVERAGE, avg);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_MODE, anychart.math.mode(seriesValues));
          ser.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_MEDIAN, anychart.math.median(seriesValues));
        } else {
          if (isBubbleSeries) {
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MAX_SIZE, seriesSizeMax);
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MIN_SIZE, seriesSizeMin);
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM, seriesSizeSum);
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_AVERAGE, pointsCount ? seriesSizeSum / pointsCount : 0);
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MODE, anychart.math.mode(seriesSizes));
            ser.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MEDIAN, anychart.math.median(seriesSizes));
            totalSizeSum += seriesSizeSum;
            totalSizeMax = Math.max(totalSizeMax, seriesSizeMax);
            totalSizeMin = Math.min(totalSizeMin, seriesSizeMin);
          }
          ser.statistics(anychart.enums.Statistics.SERIES_Y_MAX, seriesYMax);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_MIN, seriesYMin);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_SUM, seriesYSum);
          ser.statistics(anychart.enums.Statistics.SERIES_FIRST_Y_VALUE, seriesValues[0]);
          ser.statistics(anychart.enums.Statistics.SERIES_LAST_Y_VALUE, seriesValues[seriesValues.length - 1]);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_AVERAGE, avg);
          ser.statistics(anychart.enums.Statistics.SERIES_Y_MODE, anychart.math.mode(seriesValues));
          ser.statistics(anychart.enums.Statistics.SERIES_Y_MEDIAN, anychart.math.median(seriesValues));
        }

        if (!this.categorizeData) {
          ser.statistics(anychart.enums.Statistics.SERIES_X_MAX, seriesXMax);
          ser.statistics(anychart.enums.Statistics.SERIES_X_MIN, seriesXMin);
          ser.statistics(anychart.enums.Statistics.SERIES_X_SUM, seriesXSum);
          ser.statistics(anychart.enums.Statistics.SERIES_FIRST_X_VALUE, seriesXes[0]);
          ser.statistics(anychart.enums.Statistics.SERIES_LAST_X_VALUE, seriesXes[seriesValues.length - 1]);
          ser.statistics(anychart.enums.Statistics.SERIES_X_AVERAGE, pointsCount ? seriesXSum / pointsCount : 0);
          ser.statistics(anychart.enums.Statistics.SERIES_X_MODE, anychart.math.mode(seriesXes));
          ser.statistics(anychart.enums.Statistics.SERIES_X_MEDIAN, anychart.math.median(seriesXes));
        }
      }

      if (this.categorizeData) {
        anychart.performance.start('Statistics categorize cycle');
        var catSumArr = new Array(len);
        var catYMinArr = new Array(len);
        var catYMaxArr = new Array(len);

        var catYAvgArr = new Array(len);
        var catYMedArr = new Array(len);
        var catYModArr = new Array(len);

        for (d = 0; d < len; d++) {
          var catValues = valsArr[d];
          var catYSum = 0;
          var catYMin = Infinity;
          var catYMax = -Infinity;

          for (var v = 0; v < catValues.length; v++) {
            var temp = catValues[v];
            catYSum += temp;
            catYMin = Math.min(catYMin, temp);
            catYMax = Math.max(catYMax, temp);
          }

          catSumArr[d] = catYSum;
          catYMinArr[d] = catYMin;
          catYMaxArr[d] = catYMax;
          catYAvgArr[d] = catYSum / catValues.length;
          catYMedArr[d] = anychart.math.median(catValues);
          catYModArr[d] = anychart.math.mode(catValues);
        }

        for (j = 0; j < plans.length; j++) {
          plan = plans[j];
          ser = plan.series;
          if (!ser || !ser.enabled()) continue;
          isRangeSeries = ser.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED | anychart.core.drawers.Capabilities.IS_OHLC_BASED);

          if (isRangeSeries) {
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM_ARR_, catSumArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN_ARR_, catYMinArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX_ARR_, catYMaxArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_AVG_ARR_, catYAvgArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN_ARR_, catYMedArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE_ARR_, catYModArr);
          } else {
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_SUM_ARR_, catSumArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_MIN_ARR_, catYMinArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_MAX_ARR_, catYMaxArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_AVG_ARR_, catYAvgArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_MEDIAN_ARR_, catYMedArr);
            ser.statistics(anychart.enums.Statistics.CATEGORY_Y_MODE_ARR_, catYModArr);
          }
        }
      }
      anychart.performance.end('Statistics categorize cycle');
    }

    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_SUM, totalYSum);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_SUM, totalYSum);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_MAX, totalYMax);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MAX, totalYMax);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_MIN, totalYMin);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MIN, totalYMin);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE, totalPointsCount ? totalYSum / totalPointsCount : 0);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT, this.drawingPlans_.length);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_POINT_COUNT, totalPointsCount);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME, maxYSeriesName);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME, minYSeriesName);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME, maxYSumSeriesName);
    this.statistics(anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME, minYSumSeriesName);
    if (hasBubbleSeries) {
      this.statistics(anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM, totalSizeSum);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_BUBBLE_MIN_SIZE, totalSizeMin);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_BUBBLE_MAX_SIZE, totalSizeMax);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_AVERAGE, totalPointsCount ? totalSizeSum / totalPointsCount : 0);
    }
    if (!this.categorizeData) {
      this.statistics(anychart.enums.Statistics.DATA_PLOT_X_SUM, totalXSum);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_X_MAX, totalXMax);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_X_MIN, totalXMin);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_X_AVERAGE, totalPointsCount ? totalXSum / totalPointsCount : 0);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME, maxXSeriesName);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME, minXSeriesName);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME, maxXSumSeriesName);
      this.statistics(anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME, minXSumSeriesName);
    }

    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_STATISTICS);
    anychart.performance.end('Statistics calculation');
  }
};


/**
 * Dummy for zoom support in Scatter standalone module.
 * @return {number}
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.getZoomStartRatio = function() {
  return 0;
};


/**
 * Dummy for zoom support in Scatter standalone module.
 * @return {number}
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.getZoomEndRatio = function() {
  return 1;
};


/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.prepare3d = function() {};


/**
 * Applies modifications (like zoom) on the calculated x scales.
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.applyXZoom = function() {};


/**
 * Spread Column and Bar series to categories width
 */
anychart.core.ChartWithOrthogonalScales.prototype.distributeSeries = function() {
  if (this.categorizeData) {
    var i;
    var scale;
    var drawingPlansOfScale;
    var aSeries;
    var id;
    var xId;
    var numColumnClusters;
    var numBarClusters;
    var seenScalesWithColumns;
    var seenScalesWithBars;
    // spreading column and bar series to the total width of X categories
    for (xId in this.drawingPlansByXScale_) {
      // no need to do this if the scale is not ordinal
      if (!(this.xScales[xId] instanceof anychart.scales.Ordinal || this.xScales[xId] instanceof anychart.scales.DateTime))
        continue;
      drawingPlansOfScale = this.drawingPlansByXScale_[xId];
      // Our task is to calculate the number of column and bar clusters.
      // One column cluster is a column series, if axis is not stacked,
      // or all series of stacked axis, if there is at least one column.
      // One bar cluster is a bar series, if axis is not stacked,
      // or all series of stacked axis, if there is at least one bar.
      numColumnClusters = 0;
      numBarClusters = 0;
      seenScalesWithColumns = {};
      seenScalesWithBars = {};
      for (i = 0; i < drawingPlansOfScale.length; i++) {
        aSeries = drawingPlansOfScale[i].series;
        scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
        id = goog.getUid(scale);
        if (aSeries.isWidthDistributed()) {
          if (aSeries.getOption('isVertical')) {
            if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
              numBarClusters++;
            } else {
              if (!(id in seenScalesWithBars)) {
                numBarClusters++;
                seenScalesWithBars[id] = true;
              }
            }
          } else {
            if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
              numColumnClusters++;
            } else {
              if (!(id in seenScalesWithColumns)) {
                numColumnClusters++;
                seenScalesWithColumns[id] = true;
              }
            }
          }
        }
      }

      this.distributeClusters(numColumnClusters, drawingPlansOfScale, true);
      this.distributeClusters(numBarClusters, drawingPlansOfScale, false);
    }
  }
};


/**
 * Distribute column clusters.
 * @param {number} numClusters
 * @param {Array.<Object>} drawingPlansOfScale
 * @param {boolean} horizontal
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.distributeClusters = function(numClusters, drawingPlansOfScale, horizontal) {
  var scale;
  var id;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;

  if (numClusters > 0) {
    numClusters = numClusters + (numClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
    barWidthRatio = 1 / numClusters;
    currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
    seenScales = {};
    for (var i = 0; i < drawingPlansOfScale.length; i++) {
      wSeries = drawingPlansOfScale[i].series;
      if (wSeries.isWidthDistributed() && (horizontal ^ (/** @type {boolean} */(wSeries.getOption('isVertical'))))) {
        scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
        if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
          wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
          wSeries.setAutoPointWidth(barWidthRatio);
          currPosition += barWidthRatio * (1 + this.barsPadding_);
        } else {
          id = goog.getUid(scale);
          if (id in seenScales) {
            wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
          } else {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
            seenScales[id] = currPosition;
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          }
        }
      }
    }
  }
};


//endregion
//region --- Animation
//----------------------------------------------------------------------------------------------------------------------
//
//  Animation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.doAnimation = function() {
  if (this.animation().enabled() && this.animation().duration() > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationParallelQueue();
      var duration = /** @type {number} */(this.animation().duration());
      for (var i = 0; i < this.seriesList.length; i++) {
        var series = this.seriesList[i];
        if (series.enabled() && !series.rendering().needsCustomPointDrawer()) {
          var ctl = anychart.animations.AnimationBySeriesType[series.getAnimationType()];
          if (ctl)
            this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (new ctl(series, duration)));
        }
      }
      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.ignoreMouseEvents(true);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);
      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.ignoreMouseEvents(false);
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_END,
          'chart': this
        });
      }, false, this);
      this.animationQueue_.play(false);
    }
  }
};


//endregion
//region --- Context menu
//----------------------------------------------------------------------------------------------------------------------
//
//  Context menu
//
//----------------------------------------------------------------------------------------------------------------------
/** @override */
anychart.core.ChartWithOrthogonalScales.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  var newItems = isPointContext ?
      anychart.core.ChartWithOrthogonalScales.contextMenuMap.chartWithSeriesPoint.concat(items) :
      anychart.core.ChartWithOrthogonalScales.contextMenuMap.chartWithSeriesDefault.concat(items);

  var excludedPoints = this.getExcludedPoints();
  var excludedPointsItem = isPointContext ? newItems[1] : newItems[0];
  excludedPointsItem['subMenu'].length = 0;
  excludedPointsItem['enabled'] = false;

  if (excludedPoints.length) {
    var footer = [null, anychart.core.ChartWithOrthogonalScales.contextMenuItems.includeAllPoints];
    var excludedPointsModel = [];
    var seriesType;

    for (var i = 0; i < excludedPoints.length; i++) {
      seriesType = excludedPoints[i].getSeries().seriesType();
      var value;
      if (seriesType == anychart.enums.CartesianSeriesType.CANDLESTICK ||
          seriesType == anychart.enums.CartesianSeriesType.OHLC) {
        value = 'o - ' + excludedPoints[i].get('open') + ', h - ' + excludedPoints[i].get('high') +
            ', l - ' + excludedPoints[i].get('low') + ', c - ' + excludedPoints[i].get('close');

      } else if (seriesType == anychart.enums.CartesianSeriesType.BOX) {
        value = 'high - ' + excludedPoints[i].get('high') + ', low - ' + excludedPoints[i].get('low');

        // range charts
      } else if (seriesType == anychart.enums.CartesianSeriesType.RANGE_AREA ||
          seriesType == anychart.enums.CartesianSeriesType.RANGE_BAR ||
          seriesType == anychart.enums.CartesianSeriesType.RANGE_COLUMN ||
          seriesType == anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA ||
          seriesType == anychart.enums.CartesianSeriesType.RANGE_STEP_AREA) {
        value = 'high - ' + excludedPoints[i].get('high') + ', low - ' + excludedPoints[i].get('low');

      } else if (seriesType == anychart.enums.CartesianSeriesType.BUBBLE) {
        value = 'x - ' + excludedPoints[i].get('x') + ', y - ' + excludedPoints[i].get('value') +
            ', size - ' + excludedPoints[i].get('size');

      } else {
        value = excludedPoints[i].get('value');
      }

      excludedPointsModel.push({
        'text': excludedPoints[i].getSeries().name() + ': ' + value,
        'eventType': 'anychart.include',
        'scrollable': true,
        'action': goog.bind(excludedPoints[i].getSeries().includePoint, excludedPoints[i].getSeries(), excludedPoints[i].getIndex())
      });
    }

    excludedPointsItem['subMenu'] = excludedPointsModel.concat(footer);
    excludedPointsItem['enabled'] = true;
  }

  return /** @type {Array.<anychart.ui.ContextMenu.Item>} */ (anychart.utils.recursiveClone(newItems));
};


/**
 * Get excluded points.
 * @return {Array.<anychart.core.SeriesPoint>}
 */
anychart.core.ChartWithOrthogonalScales.prototype.getExcludedPoints = function() {
  return goog.array.reduce(
      goog.array.map(this.seriesList, function(series) {
        return series.getExcludedPoints();
      }),
      function(result, seriesPoints) {
        return goog.array.join(result, seriesPoints);
      },
      []
  );
};


/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.core.ChartWithOrthogonalScales.contextMenuItems = {
  // Item 'Exclude Point'.
  excludePoint: {
    'text': 'Exclude',
    'eventType': 'anychart.exclude',
    'action': function(context) {
      context['chart'].suspendSignalsDispatching();
      var selectedPoints = context['selectedPoints'];
      var selectedPoint;
      for (var i = 0; i < selectedPoints.length; i++) {
        selectedPoint = selectedPoints[i];
        if (goog.isFunction(selectedPoint.getSeries)) {
          selectedPoint.getSeries().excludePoint(selectedPoint.getIndex());
        }
      }
      context['chart'].resumeSignalsDispatching(true);
    }
  },

  // Item-subMenu 'Excluded Points'.
  excludedPoints: {
    'text': 'Include',
    'subMenu': [],
    'enabled': false
  },

  // Item 'Include all points'.
  includeAllPoints: {
    'text': 'Include All',
    'eventType': 'anychart.includeAll',
    'action': function(context) {
      context['chart'].suspendSignalsDispatching();
      var series, i;
      var allSeries = context['chart'].getAllSeries();
      for (i = 0; i < allSeries.length; i++) {
        series = allSeries[i];
        if (!goog.isFunction(series.includeAllPoints)) continue;
        series.includeAllPoints();
      }
      context['chart'].resumeSignalsDispatching(true);
    }
  },

  // Item 'Keep Only'.
  keepOnly: {
    'text': 'Keep only',
    'eventType': 'anychart.keepOnly',
    'action': function(context) {
      context['chart'].suspendSignalsDispatching();
      // We don't use context['selectedPoints'] because it call .keepOnlyPoints() for each point.
      // Current implementation call .keepOnlyPoints() for each series.
      var selectedPointsIndexes, series, i;
      var allSeries = context['chart'].getAllSeries();
      for (i = 0; i < allSeries.length; i++) {
        series = allSeries[i];
        if (!series || !series.state) continue;
        selectedPointsIndexes = series.state.getIndexByPointState(anychart.PointState.SELECT);
        series.keepOnlyPoints(selectedPointsIndexes);
      }
      context['chart'].resumeSignalsDispatching(true);
    }
  }
};


/**
 * Menu map.
 * @type {Object.<string, Array.<anychart.ui.ContextMenu.Item>>}
 */
anychart.core.ChartWithOrthogonalScales.contextMenuMap = {
  // Cartesian 'Default menu'. (will be added to 'main')
  chartWithSeriesDefault: [
    anychart.core.ChartWithOrthogonalScales.contextMenuItems.excludedPoints,
    null
  ],
  // Cartesian 'Point menu'. (will be added to 'main')
  chartWithSeriesPoint: [
    anychart.core.ChartWithOrthogonalScales.contextMenuItems.excludePoint,
    anychart.core.ChartWithOrthogonalScales.contextMenuItems.excludedPoints,
    anychart.core.ChartWithOrthogonalScales.contextMenuItems.keepOnly,
    null
  ]
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.getSeriesStatus = function(event) {
  var bounds = this.dataBounds || anychart.math.rect(0, 0, 0, 0);
  var clientX = event['clientX'];
  var clientY = event['clientY'];

  var value, index, iterator;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series, names;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var minRatio, maxRatio;
    if (this.barChartMode) {
      minRatio = (rangeY - (y - spotRadius - minY)) / rangeY;
      maxRatio = (rangeY - (y + spotRadius - minY)) / rangeY;

      //swap values for bar
      var x_tmp = x;
      x = y;
      y = x_tmp;
    } else {
      minRatio = (x - spotRadius - minX) / rangeX;
      maxRatio = (x + spotRadius - minX) / rangeX;
    }

    var minValue, maxValue;
    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      if (series && series.enabled()) {
        minValue = /** @type {number} */(series.xScale().inverseTransform(minRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(maxRatio));

        var indexes = this.categorizeData ?
            series.findInRangeByX(minValue, maxValue) :
            series.data().findInRangeByX(minValue, maxValue);

        iterator = series.getResetIterator();
        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            if (!iterator.meta('missing')) {
              var pixX = /** @type {number} */(iterator.meta('x'));
              var pickValue = false;
              names = series.getYValueNames();
              for (var k = 0; k < names.length; k++) {
                var pixY = /** @type {number} */(iterator.meta(names[k]));

                var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
                pickValue = pickValue || length <= spotRadius;
                if (length < minLength) {
                  minLength = length;
                  minLengthIndex = index;
                }
              }
              if (pickValue) {
                ind.push(index);
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
    var ratio = ((this.barChartMode) ?
        ((rangeY - (y - minY)) / rangeY) :
        ((x - minX) / rangeX));

    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      if (series && series.enabled()) {
        value = series.xScale().inverseTransform(ratio);
        if (this.categorizeData) {
          var tmp = series.findX(value);
          index = tmp >= 0 ? [tmp] : [];
        } else {
          index = series.data().findInUnsortedDataByX(anychart.utils.toNumber(value));
        }
        iterator = series.getIterator();
        minLength = Infinity;
        if (index.length) {
          for (j = 0; j < index.length; j++) {
            if (iterator.select(index[j])) {
              pixX = /** @type {number} */(iterator.meta('x'));
              names = series.getYValueNames();
              for (k = 0; k < names.length; k++) {
                pixY = /** @type {number} */(iterator.meta(names[k]));
                length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
                if (length < minLength) {
                  minLength = length;
                  minLengthIndex = index[j];
                }
              }
            }
          }

          points.push({
            series: series,
            points: index,
            lastPoint: index[index.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
        }
      }
    }
  }

  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.core.ChartWithOrthogonalScales.prototype.onInteractivitySignal = function() {
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setup with scale instances.
 * @param {!Object} config
 * @param {Object.<anychart.scales.Base>} scalesInstances
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.setupByJSONWithScales = function(config, scalesInstances) {
  this.defaultSeriesType(config['defaultSeriesType']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);
  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.defaultSeriesSettings(config['defaultSeriesSettings']);

  var i, json;
  var series = config['series'];
  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = json['seriesType'] || this.defaultSeriesType();
      var data = json['data'];
      var seriesInst = this.createSeriesByType(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('xScale' in json && json['xScale'] > 1) seriesInst.xScale(scalesInstances[json['xScale']]);
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
};


/**
 * @inheritDoc
 */
anychart.core.ChartWithOrthogonalScales.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ChartWithOrthogonalScales.base(this, 'setupByJSON', config, opt_default);

  var type = this.getType();
  var i, json, scale;
  var scales = config['scales'];
  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = config['xScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], true);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.xScale(scale);

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  this.setupByJSONWithScales(config, scalesInstances);
};


/**
 * Setups elements defined by an array of json with scale instances map.
 * @param {*} items
 * @param {Function} itemConstructor
 * @param {Object} scaleInstances
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.setupElementsWithScales = function(items, itemConstructor, scaleInstances) {
  if (goog.isArray(items)) {
    for (var i = 0; i < items.length; i++) {
      var json = items[i];
      var element = itemConstructor.call(this, i);
      element.setup(json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
        element.scale(scaleInstances[json['scale']]);
    }
  }
};


/**
 * Serializes a list of items and writes it to json[propName] if the resulting list is not empty.
 * @param {!Object} json
 * @param {string} propName
 * @param {Array.<T>} list
 * @param {function(T, Array, Object, Array):Object} serializer
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @protected
 * @template T
 */
anychart.core.ChartWithOrthogonalScales.prototype.serializeElementsWithScales = function(json, propName, list, serializer, scales, scaleIds, axesIds) {
  var res = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item) {
      res.push(serializer.call(this, item, scales, scaleIds, axesIds));
    }
  }
  if (res.length) {
    json[propName] = res;
  }
};


/**
 * Serialization function with scales context.
 * @param {!Object} json
 * @param {Array.<Object>} scales
 * @param {Object} scaleIds
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.serializeWithScales = function(json, scales, scaleIds) {
  var i;
  var scale;
  var config;
  var seriesList = [];
  for (i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    config = series.serialize();
    scale = series.xScale();
    this.serializeScale(config, 'xScale', /** @type {anychart.scales.Base} */(series.xScale()), scales, scaleIds);
    this.serializeScale(config, 'yScale', /** @type {anychart.scales.Base} */(series.yScale()), scales, scaleIds);
    seriesList.push(config);
  }
  if (seriesList.length)
    json['series'] = seriesList;
};


/**
 * Serializes scale.
 * @param {Object} json
 * @param {string} propName
 * @param {anychart.scales.Base} scale
 * @param {Array} scales
 * @param {Object} scaleIds
 * @protected
 */
anychart.core.ChartWithOrthogonalScales.prototype.serializeScale = function(json, propName, scale, scales, scaleIds) {
  if (scale) {
    var objId = goog.getUid(scale);
    if (!(objId in scaleIds)) {
      scaleIds[objId] = scales.length;
      scales.push(scale.serialize());
    }
    json[propName] = scaleIds[objId];
  }
};


/**
 * @inheritDoc
 */
anychart.core.ChartWithOrthogonalScales.prototype.serialize = function() {
  var json = anychart.core.ChartWithOrthogonalScales.base(this, 'serialize');
  var scaleIds = {};
  var scales = [];

  this.serializeScale(json, 'xScale', /** @type {anychart.scales.Base} */(this.xScale()), scales, scaleIds);
  this.serializeScale(json, 'yScale', /** @type {anychart.scales.Base} */(this.yScale()), scales, scaleIds);

  this.serializeWithScales(json, scales, scaleIds);

  json['scales'] = scales;
  return json;
};


//endregion
