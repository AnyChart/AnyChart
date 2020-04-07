goog.provide('anychart.timelineModule.Chart');


//region -- Requirements.
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.format.Context');
goog.require('anychart.scales.GanttDateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.timelineModule.Axis');
goog.require('anychart.timelineModule.Intersections');
goog.require('anychart.timelineModule.series.Moment');
goog.require('anychart.timelineModule.series.Range');
goog.require('goog.events.MouseWheelHandler');



//endregion
//region -- Constructor.
/**
 *
 * @implements {anychart.core.IPlot}
 * @implements {anychart.core.IChart}
 * @constructor
 * @extends {anychart.core.ChartWithSeries}
 */
anychart.timelineModule.Chart = function() {
  anychart.timelineModule.Chart.base(this, 'constructor');
  this.addThemes('timeline');

  /**
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.xScale_ = new anychart.scales.GanttDateTime();
  this.setupCreated('scale', this.xScale_);
  this.initScale_(this.xScale_);

  /*
    Axis listener should be attached first to scale, so that when chart starts redrawing
    on scale signal, axis is invalidated and will be redrawn correctly.
   */
  var axis = this.axis();
  axis.scale(this.xScale_);

  this.xScale_.listenSignals(this.scaleInvalidated_, this);

  /**
   * Base transformation matrix without any transformations/translations.
   * @type {Array.<number>}
   */
  this.baseTransform = [1, 0, 0, 1, 0, 0];

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * Saved vertical translate.
   * @type {number}
   */
  this.verticalTranslate = 0;

  /**
   * Saved horizontal translate.
   * @type {number}
   */
  this.horizontalTranslate = 0;

  /**
   * Relative offset consists of two components:
   *  1) Axis ratio which lays in [-0.5, 0.5] where 0 is chart center
   *    and uttermost values are half axis height from chart top and bottom.
   *  2) Series offset value, which is relative to axis center line. Used
   *    only when total (absolute) offset is out of the chart bounds minus axis height.
   * @type {{axisRatio: number, seriesOffset: number}}
   * @private
   */
  this.verticalRelativeOffset_ = {
    axisRatio: 0,
    seriesOffset: 0
  };

  /**
   * Automagically translate chart so, that there are no white spaces.
   * Works only if one side has free space and other don't.
   * @type {boolean}
   */
  this.autoChartTranslating = true;

  /**
   * Minimal vertical offset. Defines how much chart can scrolled down.
   * @type {number}
   */
  this.minVerticalOffset = 0;

  /**
   * Maximal vertical offset. Defines how much chart can be scrolled up.
   * @type {number}
   */
  this.maxVerticalOffset = 0;

  this.rangeSeriesList = [];
  this.momentSeriesList = [];
};
goog.inherits(anychart.timelineModule.Chart, anychart.core.ChartWithSeries);


//endregion
//region -- Generating Series.
/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.timelineModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);

  res[anychart.enums.TimelineSeriesType.MOMENT] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MOMENT,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities | anychart.core.series.Capabilities.SUPPORTS_MARKERS,
    anchoredPositionBottom: 'zero'
  };

  res[anychart.enums.TimelineSeriesType.RANGE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionBottom: 'zero'
  };

  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.timelineModule.Chart, anychart.timelineModule.Chart.prototype.seriesConfig);


//endregion
//region -- Consistency states and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.SCALE_CHART_SCALES |
    anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
    anychart.ConsistencyState.CARTESIAN_X_SCROLLER;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Timeline chart states
 * @enum {string}
 */
anychart.timelineModule.Chart.States = {
  SCROLL: 'scroll',
  ZOOM: 'zoom'
};
anychart.consistency.supportStates(anychart.timelineModule.Chart, anychart.enums.Store.TIMELINE_CHART, [
      anychart.timelineModule.Chart.States.SCROLL]);


/**
 * Base z index of range series, used for z index calculation.
 * @type {number}
 */
anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX = 34;


//endregion
//region -- Axis markers.
/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.timelineModule.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.timelineModule.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = this.createRangeMarkerInstance();
    rangeMarker.drawAtAnyRatio(true);

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultRangeMarkerSettings');
    rangeMarker.addThemes(extendedThemes);

    rangeMarker.setChart(this);
    rangeMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    rangeMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Create rangeMarker instance.
 * @return {!(anychart.core.axisMarkers.Range)}
 * @protected
 */
anychart.timelineModule.Chart.prototype.createRangeMarkerInstance = function() {
  return new anychart.core.axisMarkers.Range();
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.timelineModule.Chart)} Text marker instance by index or itself for chaining call.
 */
anychart.timelineModule.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = this.createTextMarkerInstance();
    textMarker.drawAtAnyRatio(true);

    // textMarker.addThemes('cartesianBase.defaultTextMarkerSettings');
    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultTextMarkerSettings');
    textMarker.addThemes(extendedThemes);

    textMarker.setChart(this);
    textMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.textAxesMarkers_[index] = textMarker;
    textMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Create textMarker instance.
 * @return {anychart.core.axisMarkers.Text}
 * @protected
 */
anychart.timelineModule.Chart.prototype.createTextMarkerInstance = function() {
  return new anychart.core.axisMarkers.Text();
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.timelineModule.Chart)} Line marker instance by index or itself for method chaining.
 */
anychart.timelineModule.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = this.createLineMarkerInstance();
    lineMarker.drawAtAnyRatio(true);

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultLineMarkerSettings');
    lineMarker.addThemes(extendedThemes);

    lineMarker.setChart(this);
    lineMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.lineAxesMarkers_[index] = lineMarker;
    lineMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * @return {anychart.core.axisMarkers.Line}
 */
anychart.timelineModule.Chart.prototype.createLineMarkerInstance = function() {
  return new anychart.core.axisMarkers.Line();
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.markerInvalidated_ = function(event) {
  var consistency = anychart.ConsistencyState.AXES_CHART_AXES_MARKERS;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    consistency |= anychart.ConsistencyState.SCALE_CHART_SCALES;
  }
  this.invalidate(consistency, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns instance of today marker. Today marker is line marker with current date, for now.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.axisMarkers.Line|anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.todayMarker = function(opt_value) {
  if (!this.todayMarker_) {
    this.todayMarker_ = this.createLineMarkerInstance();
    this.todayMarker_.drawAtAnyRatio(true);

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultLineMarkerSettings');
    this.todayMarker_.addThemes(extendedThemes);
    this.setupCreated('todayMarker', this.todayMarker_);

    this.todayMarker_.setChart(this);
    this.todayMarker_.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.todayMarker_.listenSignals(this.markerInvalidated_, this);
    var curDate = new Date();
    this.todayMarker_['value'](Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDay()));
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.todayMarker_.setup(opt_value);
    return this;
  }
  return this.todayMarker_;
};


//endregion
//region -- Series points position calculation.
/**
 * This method calculates sizes of range and moment series points.
 * Range point size consists of it path.
 * Moment point size consists of label + background with its paddings.
 * These points are then stacked onto each other, so that they do not
 * intersect and are readable to user.
 */
anychart.timelineModule.Chart.prototype.calculateAndArrangeSeriesPoints = function() {
  var dateMin = +Infinity;
  var dateMax = -Infinity;

  this.drawingPlans = [];
  this.drawingPlansRange = [];
  this.drawingPlansEvent = [];

  var axisHeight = this.getAxisHeight();

  if (this.getSeriesCount() == 0) {
    this.scale().reset();
    this.axis().invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS | anychart.ConsistencyState.AXIS_LABELS);

    this.dateMax = +Infinity;
    this.dateMin = -Infinity;

    this.momentSeriesList.length = 0;
    this.rangeSeriesList.length = 0;

    this.totalRange = {
      sX: 0,
      eX: this.dataBounds.width,
      sY: -this.dataBounds.height / 2,
      eY: this.dataBounds.height / 2
    };

    this.verticalOffsets(0, 0);
    return;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    var minMax = this.prepareSeries();
    dateMin = minMax.min;
    dateMax = minMax.max;

    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_,
        [this.todayMarker_]);

    var valuesToConsider = [];

    for (var mid = 0; mid < markers.length; mid++) {
      var m = markers[mid];
      if (m) {
        if (m.getOption('scaleRangeMode') == anychart.enums.ScaleRangeMode.CONSIDER) {
          var refVals = m.getReferenceValues();
          for (var valId = 0; valId < refVals.length; valId++) {
            valuesToConsider.push(anychart.format.parseDateTime(refVals[valId]).getTime());
          }
        }
      }
    }

    var markersMin = Math.min.apply(null, valuesToConsider);
    var markersMax = Math.max.apply(null, valuesToConsider);

    dateMin = Math.min(dateMin, markersMin);
    dateMax = Math.max(dateMax, markersMax);

    if (dateMin == dateMax) {
      var day = anychart.utils.getIntervalRange(anychart.enums.Interval.DAY, 1);
      dateMin -= day / 2;
      dateMax += day / 2;
    }

    var rangeChanged = (this.dateMin != dateMin || this.dateMax != dateMax);

    if (rangeChanged) {
      this.dateMin = dateMin;
      this.dateMax = dateMax;

      this.scale().setDataRange(this.dateMin, this.dateMax);

      // NeedsZoomTo is set when zoomTo was called on hidden container.
      if (this.xScale_.needsZoomTo) {
        this.xScale_.zoomTo.apply(this.xScale_, this.xScale_.neededZoomToArgs);
        this.xScale_.needsZoomTo = false;
        this.xScale_.neededZoomToArgs = null;
      } else {
        this.scale().suspendSignalsDispatching();
        this.scale().fitAll();
        this.scale().resumeSignalsDispatching(false);
      }
    }

    /*
       =============================
       | Measures moment and range |
       |    series points bounds   |
       =============================
     */
    var intersectingBounds = this.calculatePointsBounds(this.drawingPlans);

    goog.array.sort(intersectingBounds.rangeUp, anychart.timelineModule.Chart.rangeSortCallback);
    goog.array.sort(intersectingBounds.rangeDown, anychart.timelineModule.Chart.rangeSortCallback);

    goog.array.sort(intersectingBounds.momentUp, anychart.timelineModule.Chart.momentSortCallback);
    goog.array.sort(intersectingBounds.momentDown, anychart.timelineModule.Chart.momentSortCallback);

    var scaleTotalRange = this.scale().getTotalRange();

    this.totalRange = {
      sX: +Infinity,
      eX: -Infinity,
      sY: +Infinity,
      eY: -Infinity
    };
    this.totalRange.sX = Math.min(this.totalRange.sX, this.scale().transform(scaleTotalRange.min) * this.dataBounds.width);
    this.totalRange.eX = Math.max(this.totalRange.eX, this.scale().transform(scaleTotalRange.max) * this.dataBounds.width);

    /*
       ===========================
       | Positions series points |
       ===========================
     */
    this.arrangeSeriesPoints(intersectingBounds);

    //fixing white space under the axis
    var halfAxisHeight = axisHeight / 2;

    this.totalRange.sY -= halfAxisHeight;
    this.totalRange.eY += halfAxisHeight;

    var scroller = this.getCreated('scroller');
    var scrollerOrientation;
    var scrollerHeightTop = 0;
    var scrollerHeightBottom = 0;
    if (scroller && scroller.enabled()) {
      scrollerOrientation = scroller.getOption('orientation');
      var scrollerHeight = /** @type {number} */(scroller.getOption('height'));
      switch (scrollerOrientation) {
        case anychart.enums.Orientation.TOP:
          scrollerHeightTop = scrollerHeight;
          break;
        case anychart.enums.Orientation.BOTTOM:
          scrollerHeightBottom = scrollerHeight;
          break;
      }
    }

    var halfHeight = this.dataBounds.height / 2;
    var minOffset = halfHeight - Math.abs(this.totalRange.sY) - scrollerHeightBottom;
    var maxOffset = this.totalRange.eY - halfHeight - scrollerHeightTop;
    // If chart fits into container.
    if ((this.totalRange.eY - this.totalRange.sY) <= this.dataBounds.height) {
      var lookingUp = intersectingBounds.momentUp.length + intersectingBounds.rangeUp.length;
      var lookingDown = intersectingBounds.momentDown.length + intersectingBounds.rangeDown.length;
      if (lookingUp && !lookingDown) {
        this.verticalOffsets(minOffset, minOffset);
      } else if (!lookingUp && lookingDown) {
        this.verticalOffsets(maxOffset, maxOffset);
      } else if (lookingUp && lookingDown) {
        this.verticalOffsets(0, 0);
      }
    } else {
      this.verticalOffsets(minOffset, maxOffset);
    }
  }
};


/**
 * Stores point bounds and some additional information.
 * @typedef {{
 * sX: number,
 * eX: number,
 * sY: number,
 * eY: number,
 * direction: string,
 * series: anychart.core.series.Base,
 * pointId: number,
 * drawingPlan: anychart.core.series.Cartesian.DrawingPlan
 * }}
 */
anychart.timelineModule.Chart.PointBounds;


/**
 * Contains several arrays of point bounds.
 * They are separate for each series type and series type + direction.
 * @typedef {{
 * all: Array.<anychart.timelineModule.Chart.PointBounds>,
 * range: Array.<anychart.timelineModule.Chart.PointBounds>,
 * moment: Array.<anychart.timelineModule.Chart.PointBounds>,
 * rangeUp: Array.<anychart.timelineModule.Chart.PointBounds>,
 * rangeDown: Array.<anychart.timelineModule.Chart.PointBounds>,
 * momentUp: Array.<anychart.timelineModule.Chart.PointBounds>,
 * momentDown: Array.<anychart.timelineModule.Chart.PointBounds>
 * }}
 */
anychart.timelineModule.Chart.SeriesPointBounds;


/**
 * Handles series points positioning. Arranges them so, that they don't overlap with each other.
 * Series pointing up and down are handled separately.
 * First range series are stacked with each other.
 * Then moment series are stacked over range series.
 * @param {anychart.timelineModule.Chart.SeriesPointBounds} intersectingBounds previously calculated point sizes.
 */
anychart.timelineModule.Chart.prototype.arrangeSeriesPoints = function(intersectingBounds) {
  var range, id, drawingPlanData, i;
  //region upper range and event overlap calculation
  var rangeSeries = [];

  var intersectionsUpper = new anychart.timelineModule.Intersections();

  for (i = 0; i < intersectingBounds.rangeUp.length; i++) {
    range = intersectingBounds.rangeUp[i];

    /*
    Note! Per point zIndex doesn't work cross series. We have to set zIndexes by series first
    and then inside series we can use per point zIndex.
     */
    if (range && rangeSeries.indexOf(range.series) == -1) {
      range.series.zIndex(anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - rangeSeries.length / 100);
      rangeSeries.push(range.series);
    }

    id = range.pointId;
    drawingPlanData = range.drawingPlan.data[id];
    intersectionsUpper.add(range, true);
    this.enlargeTotalRange_(range);
    drawingPlanData.meta['startY'] = range.sY;
    drawingPlanData.meta['endY'] = range.eY;
    drawingPlanData.meta['stateZIndex'] = 1 - range.eY / 1000000;
  }

  for (i = intersectingBounds.momentUp.length - 1; i >= 0; i--) {
    range = intersectingBounds.momentUp[i];
    id = range.pointId;
    intersectionsUpper.add(range);
    this.enlargeTotalRange_(range);
    drawingPlanData = range.drawingPlan.data[id];
    drawingPlanData.meta['minLength'] = range.sY + (range.eY - range.sY) / 2;
  }
  //endregion

  //region lower range and event overlap calculation
  var intersectionsLower = new anychart.timelineModule.Intersections();

  rangeSeries = [];
  for (i = 0; i < intersectingBounds.rangeDown.length; i++) {
    range = intersectingBounds.rangeDown[i];

    /*
    Note! Per point zIndex doesn't work cross series. We have to set zIndexes by series first
    and then inside series we can use per point zIndex.
     */
    if (range && rangeSeries.indexOf(range.series) == -1) {
      range.series.zIndex(anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - rangeSeries.length / 100);
      rangeSeries.push(range.series);
    }

    id = range.pointId;
    drawingPlanData = range.drawingPlan.data[id];
    intersectionsLower.add(range, true);
    drawingPlanData.meta['startY'] = range.sY;
    drawingPlanData.meta['endY'] = range.eY;
    drawingPlanData.meta['stateZIndex'] = 1 - range.eY / 1000000;
    this.enlargeTotalRange_({sX: range.sX, eX: range.eX, sY: -range.eY, eY: -range.sY});
  }

  for (i = intersectingBounds.momentDown.length - 1; i >= 0; i--) {
    range = intersectingBounds.momentDown[i];
    id = range.pointId;
    intersectionsLower.add(range);
    drawingPlanData = range.drawingPlan.data[id];
    drawingPlanData.meta['minLength'] = range.sY + (range.eY - range.sY) / 2;
    this.enlargeTotalRange_({sX: range.sX, eX: range.eX, sY: -range.eY, eY: -range.sY});
  }
  //endregion
};


/**
 * Populates series lists, creates drawing plans, calculates and returns min and max values among all series.
 * @return {{min: number, max: number}} returns min and max point values of series
 */
anychart.timelineModule.Chart.prototype.prepareSeries = function() {
  this.momentSeriesList = [];
  this.rangeSeriesList = [];

  var dateMin = +Infinity;
  var dateMax = -Infinity;
  var rangeNum = 0;
  var momentNum = 0;
  var directions = [anychart.enums.Direction.UP, anychart.enums.Direction.DOWN];

  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    var seriesType = series.seriesType();

    //region set auto/odd-even directions
    var direction = series.getOption('direction');

    switch (direction) {
      case anychart.enums.Direction.ODD_EVEN:
        if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
          series.autoDirection(directions[rangeNum & 1]);
          rangeNum++;
        } else if (seriesType == anychart.enums.TimelineSeriesType.MOMENT) {
          series.autoDirection(directions[momentNum & 1]);
          momentNum++;
        }
        break;
      case anychart.enums.Direction.AUTO:
        if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
          series.autoDirection(anychart.enums.Direction.UP);
        } else if (seriesType == anychart.enums.TimelineSeriesType.MOMENT) {
          series.autoDirection(anychart.enums.Direction.UP);
        }
        break;
    }
    //endregion


    switch (seriesType) {
      case anychart.enums.TimelineSeriesType.MOMENT:
        this.momentSeriesList.push(series);
        break;
      case anychart.enums.TimelineSeriesType.RANGE:
        this.rangeSeriesList.push(series);
        break;
    }

    //region obtaining drawing plan for series
    var drawingPlan = series.getScatterDrawingPlan(false, true);

    // This method should be called after getScatterDrawingPlan, to operate updated data.
    var minMax = this.getSeriesMinMaxValues(series);
    dateMin = Math.min(dateMin, minMax.min);
    dateMax = Math.max(dateMax, minMax.max);

    this.drawingPlans.push(drawingPlan);
    if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
      this.drawingPlansRange.push(drawingPlan);
    } else {
      this.drawingPlansEvent.push(drawingPlan);
    }
    //endregion
  }

  return {min: dateMin, max: dateMax};
};


/**
 * Returns min and max timestamps for series.
 * @param {anychart.core.series.Base} series
 * @return {{min: number, max: number}}
 */
anychart.timelineModule.Chart.prototype.getSeriesMinMaxValues = function(series) {
  var dateMin = +Infinity;
  var dateMax = -Infinity;
  var it = series.getResetIterator();
  var seriesType = series.seriesType();


  if (seriesType == anychart.enums.TimelineSeriesType.MOMENT) {
    while (it.advance()) {
      var date = anychart.utils.normalizeTimestamp(it.get('x'));
      dateMin = Math.min(dateMin, date);
      dateMax = Math.max(dateMax, date);
    }
  } else if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
    while (it.advance()) {
      var start = anychart.utils.normalizeTimestamp(it.get('start'));
      var end = anychart.utils.normalizeTimestamp(it.get('end'));

      // If start value is not valid - point is missing, skip it.
      if (isNaN(start)) continue;

      if (!isNaN(end)) {
        dateMin = Math.min(dateMin, end);
        dateMax = Math.max(dateMax, end);
      }

      dateMin = Math.min(dateMin, start);
      dateMax = Math.max(dateMax, start);
    }
  }

  return {min: dateMin, max: dateMax};
};


/**
 * Returns timeline axis height.
 * @return {number}
 */
anychart.timelineModule.Chart.prototype.getAxisHeight = function() {
  return this.axis().enabled() ? /** @type {number} */(this.axis().getOption('height')) : 0;
};


/**
 * Calculates points bounds for range series.
 * These bounds are then used to position points without intersection.
 * @param {anychart.core.series.Cartesian.DrawingPlan} drawingPlan
 * @return {{
 *  all: Array.<anychart.timelineModule.Chart.PointBounds>,
 *  up: Array.<anychart.timelineModule.Chart.PointBounds>,
 *  down: Array.<anychart.timelineModule.Chart.PointBounds>
 * }}
 */
anychart.timelineModule.Chart.prototype.calculateRangeSeriesPointsBounds = function(drawingPlan) {
  var series = drawingPlan.series;
  var data = drawingPlan.data;
  var boundsRange = [];
  var boundsRangeUp = [];
  var boundsRangeDown = [];
  var startX, endX, startY, endY;
  var axisHeight = this.getAxisHeight();


  var maxTotalRange = this.scale().getTotalRange()['max'];
  var it = series.getResetIterator();
  for (var k = 0; k < data.length; k++) {
    it.select(k);
    var point = data[k];

    var startValue = it.get('start');
    var seriesName = it.get('name') || it.get('x');
    if (!goog.isDefAndNotNull(startValue) || isNaN(startValue) || !goog.isDefAndNotNull(seriesName)) {
      it.meta('missing', true);
      continue;
    }

    startX = this.scale().transform(point.data['start']) * this.dataBounds.width;
    endX = isNaN(point.data['end']) ? this.scale().transform(maxTotalRange) * this.dataBounds.width :
        this.scale().transform(point.data['end']) * this.dataBounds.width;
    startY = 0;
    endY = anychart.utils.normalizeSize(/** @type {number|string} */(series.getOption('height')), this.dataBounds.height);
    var direction = it.get('direction') || series.getFinalDirection();

    var pointBounds = {
      sX: startX,
      eX: endX,
      sY: startY,
      eY: endY,
      direction: direction,
      series: series,
      pointId: k,
      drawingPlan: drawingPlan
    };

    boundsRange.push(pointBounds);
    if (direction == anychart.enums.Direction.UP) {
      boundsRangeUp.push(pointBounds);
    } else {
      boundsRangeDown.push(pointBounds);
    }
    point.meta['axisHeight'] = axisHeight;
  }

  return {
    all: boundsRange,
    up: boundsRangeUp,
    down: boundsRangeDown
  };
};


/**
 * Calculates points bounds for moment series, taking markers and label settings into account.
 * These bounds are then used to position points without intersection.
 * @param {anychart.core.series.Cartesian.DrawingPlan} drawingPlan
 * @return {{all: Array, up: Array, down: Array}}
 */
anychart.timelineModule.Chart.prototype.calculateMomentSeriesPointsBounds = function(drawingPlan) {
  var series = drawingPlan.series;
  var data = drawingPlan.data;
  var boundsMoment = [];
  var boundsMomentUp = [];
  var boundsMomentDown = [];
  var startX, endX, startY, endY;
  var axisHeight = this.getAxisHeight();

  var labelsFactory = series.labels();
  /*
    Drop cached text values.
    If cache is not dropped, after applying new label formatter,
    factory still returns previous text bounds down here.
   */
  labelsFactory.dropCallsCache();

  var markersFactory = series.markers();
  var markersFactoryEnabled = markersFactory.enabled();
  var markersFactorySize = markersFactoryEnabled ? /** @type {number} */(markersFactory.getOption('size')) : 0;
  var it = series.getIterator();

  for (var k = 0; k < data.length; k++) {
    it.select(k);

    if (!goog.isDefAndNotNull(it.get('value')) || !goog.isDefAndNotNull(it.get('x'))) {
      it.meta('missing', true);
      continue;
    }

    var label = labelsFactory.getLabel(k);
    //create labels context provider
    var formatProvider = series.updateContext(new anychart.format.Context());
    /*
      We reapply format provider each time, because series on
      each redraw, that involves labels updating, reset iterator.
      Series iterator is bound to label formatProvider and should
      be pointing at the label we currently draw/measure.
     */
    goog.isNull(label) ?
        label = labelsFactory.add(formatProvider, {'value': {'x': 0, 'y': 0}}, k) :
        label.formatProvider(formatProvider);

    // Drop cached settings, so that label will be measured with up to date settings.
    label.dropMergedSettings();
    var labelBounds = labelsFactory.measure(label);

    var offsetX = labelsFactory.getOption('offsetX') || 0;

    var point = data[k];
    startX = this.scale().transform(point.data['x']) * this.dataBounds.width - markersFactorySize;
    endX = startX + labelBounds.width + offsetX + markersFactorySize;
    startY = 50 - labelBounds.height / 2;
    endY = 50 + labelBounds.height / 2;
    var direction = it.get('direction') || series.getFinalDirection();

    var pointBounds = {
      sX: startX,
      eX: endX,
      sY: startY,
      eY: endY,
      direction: direction,
      series: series,
      pointId: k,
      drawingPlan: drawingPlan
    };

    boundsMoment.push(pointBounds);

    direction == anychart.enums.Direction.UP ?
      boundsMomentUp.push(pointBounds) :
      boundsMomentDown.push(pointBounds);

    point.meta['axisHeight'] = axisHeight;
  }

  return {
    all: boundsMoment,
    up: boundsMomentUp,
    down: boundsMomentDown
  };
};


/**
 * Calculates bounds that points of series will have after they are drawn.
 * These bounds are then used to position points without intersection.
 * @param {Array.<anychart.core.series.Cartesian.DrawingPlan>} drawingPlans
 * @return {anychart.timelineModule.Chart.SeriesPointBounds}
 */
anychart.timelineModule.Chart.prototype.calculatePointsBounds = function(drawingPlans) {
  var data;
  var series;
  var drawingPlan;

  var bounds = [];
  var boundsRange = [];
  var boundsRangeUp = [];
  var boundsRangeDown = [];
  var boundsMoment = [];
  var boundsMomentUp = [];
  var boundsMomentDown = [];

  for (var i = 0; i < drawingPlans.length; i++) {
    drawingPlan = drawingPlans[i];
    series = drawingPlan.series;
    data = drawingPlan.data;
    var seriesType = series.seriesType();
    var seriesBoundsObject;

    if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
      seriesBoundsObject = this.calculateRangeSeriesPointsBounds(drawingPlan);
      bounds = goog.array.concat(bounds, seriesBoundsObject.all);
      boundsRange = goog.array.concat(boundsRange, seriesBoundsObject.all);
      boundsRangeUp = goog.array.concat(boundsRangeUp, seriesBoundsObject.up);
      boundsRangeDown = goog.array.concat(boundsRangeDown, seriesBoundsObject.down);
    } else if (seriesType == anychart.enums.TimelineSeriesType.MOMENT) {
      seriesBoundsObject = this.calculateMomentSeriesPointsBounds(drawingPlan);
      bounds = goog.array.concat(bounds, seriesBoundsObject.all);
      boundsMoment = goog.array.concat(boundsMoment, seriesBoundsObject.all);
      boundsMomentUp = goog.array.concat(boundsMomentUp, seriesBoundsObject.up);
      boundsMomentDown = goog.array.concat(boundsMomentDown, seriesBoundsObject.down);
    }
  }

  return {
    all: bounds, // all bounds, both range and series
    range: boundsRange, // only range points bounds
    moment: boundsMoment, // only moment points bounds
    rangeUp: boundsRangeUp, // only points of range series directed up
    rangeDown: boundsRangeDown, // only points of range series directed down
    momentUp: boundsMomentUp, // only points of moment series directed up
    momentDown: boundsMomentDown // only points of moment series directed down
  };
};


//endregion
//region -- Chart Infrastructure Overrides.
/**
 * Set vertical offset range.
 * @param {number} min - Minimal offset
 * @param {number} max - Maximal offset
 * @return {anychart.timelineModule.Chart|{min: number, max: number}}
 */
anychart.timelineModule.Chart.prototype.verticalOffsets = function(min, max) {
  if (goog.isDef(min)) {
    if (min != this.minVerticalOffset || max != this.maxVerticalOffset) {
      this.minVerticalOffset = min;
      this.maxVerticalOffset = max;
      this.invalidateState(
        anychart.enums.Store.TIMELINE_CHART,
        anychart.timelineModule.Chart.States.SCROLL,
        anychart.Signal.NEEDS_REDRAW
      );
    }
    return this;
  }

  return {
    min: this.minVerticalOffset,
    max: this.maxVerticalOffset
  };
};


/**
 * Callback used for range series bounds sorting.
 * @param {anychart.timelineModule.Intersections.Range} a
 * @param {anychart.timelineModule.Intersections.Range} b
 * @return {number}
 */
anychart.timelineModule.Chart.rangeSortCallback = function(a, b) {
  var diff = a.sX - b.sX;
  if (diff == 0) {
    return b.eX - a.eX;
  }
  return diff;
};


/**
 * Callback used for event series bounds sorting.
 * @param {anychart.timelineModule.Intersections.Range} a
 * @param {anychart.timelineModule.Intersections.Range} b
 * @return {number}
 */
anychart.timelineModule.Chart.momentSortCallback = function(a, b) {
  var diff = a.sX - b.sX;
  if (diff == 0) {
    return a.eX - b.eX;
  }
  return diff;
};


/**
 * Widens total range of chart with passed range.
 * @param {anychart.timelineModule.Intersections.Range} range
 * @private
 */
anychart.timelineModule.Chart.prototype.enlargeTotalRange_ = function(range) {
  this.totalRange.sX = Math.min(this.totalRange.sX, range.sX);
  this.totalRange.eX = Math.max(this.totalRange.eX, range.eX);
  this.totalRange.sY = Math.min(this.totalRange.sY, range.sY);
  this.totalRange.eY = Math.max(this.totalRange.eY, range.eY);
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.timelineLayer_) {
    this.timelineLayer_ = this.rootElement.layer();
    this.timelineLayer_.zIndex(1);

    this.eventsHandler.listenOnce(this, anychart.enums.EventType.CHART_DRAW, this.initInteractivity_);
  }

  /*
  Separate layer for axes markers to keep them in the visible area on vertical scroll.
   */
  if (!this.axesMarkersLayer_) {
    this.axesMarkersLayer_ = this.rootElement.layer();
    this.axesMarkersLayer_.zIndex(0.5);
  }

  if (!this.axisLayer_) {
    this.axisLayer_ = this.rootElement.layer();
    this.axisLayer_.zIndex(1);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dataBounds = bounds.clone();
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
    this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // calculate needs data bounds populated for event series overlap processing
  this.calculateAndArrangeSeriesPoints();

  var scroller = this.getCreated('scroller');
  var axis = this.getCreated('axis');

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_X_SCROLLER)) {
    if (scroller) {
      scroller.container(this.rootElement);
      scroller.parentBounds(this.dataBounds);
      scroller.draw();
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL)) {
    var matrix = this.timelineLayer_.getTransformationMatrix();

    this.verticalTranslate = this.getAbsoluteOffset(this.verticalRelativeOffset_);

    //fix horizontal translate going places
    if (this.totalRange && (this.horizontalTranslate + this.dataBounds.getRight() > (this.totalRange.eX + this.dataBounds.left))) {
      this.horizontalTranslate = (this.totalRange.eX - this.dataBounds.getRight() + this.dataBounds.left);
    }
    else if (this.totalRange && (this.horizontalTranslate + this.dataBounds.getLeft() < (this.totalRange.sX + this.dataBounds.left))) {
      this.horizontalTranslate = (this.totalRange.sX - this.dataBounds.getLeft() + this.dataBounds.left);
    }

    this.verticalTranslate = goog.math.clamp(this.verticalTranslate, this.minVerticalOffset, this.maxVerticalOffset);

    matrix[4] = -this.horizontalTranslate;
    matrix[5] = this.verticalTranslate;
    this.timelineLayer_.setTransformationMatrix.apply(this.timelineLayer_, matrix);

    var clipBounds = this.dataBounds.clone();
    clipBounds.left += this.horizontalTranslate;
    clipBounds.top -= this.verticalTranslate;
    this.timelineLayer_.clip(clipBounds);

    //remove verticalTranslation for axes markers
    matrix[5] = 0;
    this.axesMarkersLayer_.setTransformationMatrix.apply(this.axesMarkersLayer_, matrix);
    clipBounds.top = this.dataBounds.top;
    this.axesMarkersLayer_.clip(clipBounds);

    //make axis stick to lower and upper bounds of viewport
    var axisVerticalTranslate = this.verticalTranslate;
    var axisHeightHalf = 0;
    if (axis) {
      axisHeightHalf = /** @type {number} */(axis.getOption('height')) / 2;
    }

    var scrollerHeightTop = 0;
    var scrollerHeightBottom = 0;
    var scrollerOrientation;
    if (scroller && scroller.enabled()) {
      var scrollerHeight = /** @type {number} */(scroller.getOption('height'));
      scrollerOrientation = /** @type {anychart.enums.Orientation} */(scroller.getOption('orientation'));
      if (scrollerOrientation == anychart.enums.Orientation.TOP) {
        scrollerHeightTop = scrollerHeight;
      } else if (scrollerOrientation == anychart.enums.Orientation.BOTTOM) {
        scrollerHeightBottom = scrollerHeight;
      }
    }

    clipBounds = this.dataBounds.clone();
    clipBounds.left += this.horizontalTranslate;
    if (this.verticalTranslate > (this.dataBounds.height / 2 - axisHeightHalf) - scrollerHeightBottom) {
      axisVerticalTranslate = this.dataBounds.height / 2 - axisHeightHalf - scrollerHeightBottom;
    } else if (this.verticalTranslate < -(this.dataBounds.height / 2) + axisHeightHalf + scrollerHeightTop) {
      axisVerticalTranslate = -(this.dataBounds.height / 2) + axisHeightHalf + scrollerHeightTop;
    }
    matrix[5] = axisVerticalTranslate;
    this.axisLayer_.setTransformationMatrix.apply(this.axisLayer_, matrix);
    this.axisLayer_.clip(clipBounds);

    //redraw series labels on scroll to fit them into visible area if possible
    for (var i = 0; i < this.rangeSeriesList.length; i++) {
      var series = this.rangeSeriesList[i];
      series.invalidate(anychart.ConsistencyState.SERIES_LABELS);
      series.parentBounds(this.dataBounds);
      series.container(this.timelineLayer_);
      series.draw();
    }
    this.markStateConsistent(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    this.invalidate(
      anychart.ConsistencyState.SERIES_CHART_SERIES |
      anychart.ConsistencyState.AXES_CHART_AXES |
      anychart.ConsistencyState.AXES_CHART_AXES_MARKERS
    );
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    for (var i = 0; i < this.seriesList.length; i++) {
      var series = this.seriesList[i];
      series.parentBounds(this.dataBounds);
      series.container(this.timelineLayer_);
      series.draw();
    }

    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    if (axis) {
      axis.parentBounds(this.dataBounds);
      axis.container(this.axisLayer_);
      axis.draw();
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_,
        [this.todayMarker_]);

    for (i = 0; i < markers.length; i++) {
      var axesMarker = markers[i];

      if (axesMarker) {
        /*
        When scale range changes - markers (except from text marker) do not redraw themselves.
        Invalidating their bounds fixes this problem.
        */
        axesMarker.invalidate(anychart.ConsistencyState.BOUNDS);

        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          axesMarker.autoScale(this.xScale_);
        axesMarker.parentBounds(this.dataBounds);
        axesMarker.container(this.axesMarkersLayer_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS);
  }
};


/**
 * @param {goog.events.MouseWheelEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.handleMouseWheel_ = function(event) {
  var range = this.scale().getRange();
  var totalRange = this.scale().getTotalRange();
  var ratio = 0.1;//how much of current range we want to cut after zoom
  var matrix;

  var dx = event['deltaX'];
  var dy = event['deltaY'];

  if (goog.userAgent.WINDOWS) {
    dx *= 15;
    dy *= 15;
  }

  var currentDate, leftDate, rightDate;

  if (!event['shiftKey'] && this.interactivity().getOption('zoomOnMouseWheel')) {//zooming
    event.preventDefault();
    var zoomIn = event['deltaY'] < 0;
    if ((range['min']) <= totalRange['min'] && (range['max']) >= totalRange['max'] && !zoomIn)
      return;

    var mouseX = event['clientX'];

    currentDate = this.scale().inverseTransform((mouseX + this.horizontalTranslate) / this.dataBounds.width);
    leftDate = this.scale().inverseTransform(this.horizontalTranslate / this.dataBounds.width);
    rightDate = this.scale().inverseTransform((this.horizontalTranslate + this.dataBounds.width) / this.dataBounds.width);

    this.suspendSignalsDispatching();
    var anchor = (mouseX - this.dataBounds.left) / this.dataBounds.width;
    if (zoomIn) {
      this.zoomIn(1.2, anchor);
    } else {
      this.zoomOut(1.2, anchor);
    }
    this.resumeSignalsDispatching(true);
  }

  if (this.interactivity().getOption('scrollOnMouseWheel')) {
    event.preventDefault();
    this.move(0, dy);
  }
};


/**
 * Translate chart using given offsets.
 * @param {number} dx
 * @param {number} dy
 */
anychart.timelineModule.Chart.prototype.move = function(dx, dy) {
  this.moveTo(this.horizontalTranslate + dx, this.verticalTranslate - dy);
};


/**
 * Translate chart using x and y.
 * @param {number} x
 * @param {number} y
 */
anychart.timelineModule.Chart.prototype.moveTo = function(x, y) {
  var range = this.scale().getRange();
  var totalRange = this.scale().getTotalRange();

  var dx = x - this.horizontalTranslate;
  var dy = y - this.verticalTranslate;

  if (this.timelineLayer_) {
    this.horizontalTranslate = x;
    this.verticalTranslate = y;

    if (dx != 0) {
      if (this.horizontalTranslate + this.dataBounds.getRight() > (this.totalRange.eX + this.dataBounds.left)) {
        this.horizontalTranslate = (this.totalRange.eX - this.dataBounds.getRight() + this.dataBounds.left);
      }
      else if (this.horizontalTranslate + this.dataBounds.getLeft() < (this.totalRange.sX + this.dataBounds.left)) {
        this.horizontalTranslate = (this.totalRange.sX - this.dataBounds.getLeft() + this.dataBounds.left);
      }
    }

    if (dy != 0) {
      this.verticalTranslate = goog.math.clamp(y, this.minVerticalOffset, this.maxVerticalOffset);
    }

    // Update vertical translate ratio.
    var height = this.dataBounds.height - this.getAxisHeight();
    var verticalTranslateRatio = this.verticalTranslate / height;
    // clamp vertical translate ratio inbetween -0.5 and 0.5 and save it as axis translate ratio
    var axisRatio = goog.math.clamp(verticalTranslateRatio, -0.5, 0.5);
    this.verticalRelativeOffset_.axisRatio = axisRatio;
    // how much series must be shifted against axis
    this.verticalRelativeOffset_.seriesOffset = (verticalTranslateRatio - axisRatio) * height;

    var leftDate = this.scale().inverseTransform(this.horizontalTranslate / this.dataBounds.width);
    var rightDate = this.scale().inverseTransform((this.horizontalTranslate + this.dataBounds.width) / this.dataBounds.width);
    var offset = leftDate - range['min'];

    var delta = totalRange['max'] - totalRange['min'];
    this.scroller().setRangeInternal((leftDate - totalRange['min']) / delta, (rightDate - totalRange['min']) / delta);

    //this is hack to redraw axis ticks and labels using offset
    this.suspendSignalsDispatching();

    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES);
    this.axis().offset(offset);
    this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);

    this.resumeSignalsDispatching(true);
  }
};


/**
 * Initialises mouse drag interactivity.
 * @private
 */
anychart.timelineModule.Chart.prototype.initInteractivity_ = function() {
  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
        this.container().getStage().getDomWrapper(),
        false);
    this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_, false, this);
  }

  this.rootElement.listen(goog.events.EventType.MOUSEDOWN, this.mouseDownHandler, true, this);
};


/**
 *
 * @param {anychart.core.MouseEvent} event
 */
anychart.timelineModule.Chart.prototype.mouseDownHandler = function(event) {
  var bounds = this.dataBounds;

  var scroller = this.getCreated('scroller');
  if (scroller && scroller.enabled()) {
    bounds = scroller.getRemainingBounds();
  }

  var containerPosition = this.container().getStage().getClientPosition();
  var insideBounds = bounds &&
      event.clientX >= bounds.left + containerPosition.x &&
      event.clientX <= bounds.left + containerPosition.x + bounds.width &&
      event.clientY >= bounds.top + containerPosition.y &&
      event.clientY <= bounds.top + containerPosition.y + bounds.height;
  if (insideBounds) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startTranslateHorizontal = this.horizontalTranslate;
    this.startTranslateVertical = this.verticalTranslate;

    this.rootElement.listen(goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
    goog.events.listen(anychart.document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, true, this);
  }
};


/**
 *
 * @param {anychart.core.MouseEvent} event
 */
anychart.timelineModule.Chart.prototype.mouseMoveHandler = function(event) {
  this.autoChartTranslating = false;
  this.move((this.startX - event.clientX), (this.startY - event.clientY));
  this.startX = event.clientX;
  this.startY = event.clientY;
};


/**
 *
 * @param {anychart.core.MouseEvent} event
 */
anychart.timelineModule.Chart.prototype.mouseUpHandler = function(event) {
  this.rootElement.unlisten(goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
  goog.events.unlisten(document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, true, this);
};


/**
 *
 * @param {Object=} opt_value
 * @return {anychart.timelineModule.Chart|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Chart.prototype.axis = function(opt_value) {
  if (!this.axis_) {
    this.axis_ = new anychart.timelineModule.Axis();
    this.axis_.listenSignals(this.axisInvalidated_, this);
    anychart.measuriator.register(this.axis_);
    this.setupCreated('axis', this.axis_);
  }

  if (goog.isDef(opt_value)) {
    this.axis_.setup(opt_value);
    return this;
  }

  return this.axis_;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.xScale = function() {
  return this.scale();
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.axisInvalidated_ = function(event) {
  var consistency = anychart.ConsistencyState.AXES_CHART_AXES;
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_RECALCULATION)) {
    consistency |= anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(consistency, anychart.Signal.NEEDS_REDRAW);
};


/**
 *
 * @param {Object=} opt_value Scale configuration.
 * @return {anychart.timelineModule.Chart|anychart.scales.GanttDateTime} Scale instance or chart.
 */
anychart.timelineModule.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_.setup(opt_value);
    return this;
  }

  return this.xScale_;
};


/**
 * Sets custom zoom levels for timeline scale.
 * @param {anychart.scales.GanttDateTime} scale
 * @private
 */
anychart.timelineModule.Chart.prototype.initScale_ = function(scale) {
  var levels = [
    [{'unit': 'minute', 'count': 10}, {'unit': 'hour', 'count': 1}, {'unit': 'day', 'count': 1}],
    [{'unit': 'hour', 'count': 4}, {'unit': 'hour', 'count': 12}, {'unit': 'day', 'count': 1}],
    [{'unit': 'day', 'count': 1}, {'unit': 'day', 'count': 2}, {'unit': 'week', 'count': 1}],
    [{'unit': 'day', 'count': 2}, {'unit': 'week', 'count': 1}, {'unit': 'month', 'count': 1}],
    [{'unit': 'month', 'count': 1}, {'unit': 'quarter', 'count': 1}, {'unit': 'year', 'count': 1}],
    [{'unit': 'quarter', 'count': 1}, {'unit': 'year', 'count': 1}, {'unit': 'year', 'count': 10}],
    [{'unit': 'year', 'count': 1}, {'unit': 'year', 'count': 10}, {'unit': 'year', 'count': 50}],
    [{'unit': 'year', 'count': 10}, {'unit': 'year', 'count': 50}, {'unit': 'year', 'count': 200}]
  ];
  scale.zoomLevels(levels);
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.updateZoomState_();
    // Reset horizontal translation, because chart should be redrawn to match updated scale range.
    this.moveTo(0, this.verticalTranslate);
    this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.createSeriesInstance = function(type, config) {
  if (type == anychart.enums.TimelineSeriesType.MOMENT) {
    return new anychart.timelineModule.series.Moment(this, this, type, config, true);
  } else {
    return new anychart.timelineModule.series.Range(this, this, type, config, true);
  }
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getYAxisByIndex = function(index) {
  return null;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getXAxisByIndex = function(index) {
  return null;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.yScale = function() {
  if (!this.yScale_) {
    this.yScale_ = new anychart.scales.Linear();
  }
  return this.yScale_;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.isVertical = function(opt_value) {
  return false;
};


/**
 *
 * @param {string|number|Date} startDate
 * @param {string|number|Date} endDate
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.zoomTo = function(startDate, endDate) {
  this.suspendSignalsDispatching();
  var startTimestamp = anychart.utils.normalizeTimestamp(startDate);
  var endTimestamp = anychart.utils.normalizeTimestamp(endDate);
  this.scale().zoomTo(startTimestamp, endTimestamp);
  var scroller = this.getCreated('scroller');
  if (scroller) {
    var totalRange = this.scale().getTotalRange();
    var delta = totalRange['max'] - totalRange['min'];
    scroller.setRangeInternal((startTimestamp - totalRange['min']) / delta, (endTimestamp - totalRange['min']) / delta);
  }
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Reset zoom/scroll manipulations.
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.fitAll = function() {
  this.suspendSignalsDispatching();
  this.autoChartTranslating = true;
  this.scroll(0);
  this.scale().fitAll();
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Scrolls chart vertically.
 * @param {number=} opt_value scroll value, negative means showing upper half of chart, positive - lower half,
 * zero - center chart.
 * @return {number|anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.scroll = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.verticalTranslate != opt_value) {
      this.moveTo(this.horizontalTranslate, opt_value);
      return this;
    }
  }

  return this.verticalTranslate;
};


/**
 * Getter and setter of vertical offset ratio.
 * Relative offset consists of two components:
 *  1) Axis ratio which lays in [-0.5, 0.5] where 0 is chart center
 *    and uttermost values are half axis height from chart top and bottom.
 *  2) Series offset value, which is relative to axis center line. Used
 *    only when total (absolute) offset is out of the chart bounds minus axis height.
 * @param {{axisRatio: number, seriesOffset: number}=} opt_value - vertical offset ratio.
 * @return {anychart.timelineModule.Chart|{axisRatio: number, seriesOffset: number}}
 */
anychart.timelineModule.Chart.prototype.verticalRelativeOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var axisRatio = goog.isDef(opt_value.axisRatio) ?
        goog.math.clamp(opt_value.axisRatio, -0.5, 0.5) :
        0;
    var seriesOffset = (goog.isDef(opt_value.seriesOffset) && Math.abs(axisRatio) == 0.5) ?
        opt_value.seriesOffset :
        0;

    if (this.verticalRelativeOffset_.axisRatio !== axisRatio || this.verticalRelativeOffset_.seriesOffset !== seriesOffset) {
      this.verticalRelativeOffset_ = {
        axisRatio: axisRatio,
        seriesOffset: seriesOffset
      };

      this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL);
    }
    return this;
  }

  return this.verticalRelativeOffset_;
};


/**
 * Converts offset based on combination of ratio and absolute values to absolute.
 * @param {{axisRatio: number, seriesOffset: number}} value
 * @return {number}
 */
anychart.timelineModule.Chart.prototype.getAbsoluteOffset = function(value) {
  var axisRatio = value.axisRatio;
  var seriesOffset = value.seriesOffset;

  var absoluteOffset = axisRatio * (this.dataBounds.height - this.axis().height());
  if (Math.abs(axisRatio) == 0.5) {
    absoluteOffset += seriesOffset;
  }

  return absoluteOffset;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.TIMELINE;
};


/**
 * Scroller getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart scroller settings.
 * @return {anychart.core.ui.ChartScroller|anychart.timelineModule.Chart} Itself for chaining.
 */
anychart.timelineModule.Chart.prototype.scroller = function(opt_value) {
  if (!this.scroller_) {
    this.scroller_ = new anychart.core.ui.ChartScroller();
    this.scroller_.setParentEventTarget(this);
    this.scroller_.listenSignals(this.scrollerInvalidated_, this);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler);
    this.setupCreated('scroller', this.scroller_);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.scroller_.setup(opt_value);
    return this;
  } else {
    return this.scroller_;
  }
};


/**
 * Scroller invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.scrollerInvalidated_ = function(event) {
  var state = anychart.ConsistencyState.CARTESIAN_X_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * Scroller zoom change handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} event
 */
anychart.timelineModule.Chart.prototype.scrollerChangeHandler = function(event) {
  var totalRange = this.scale().getTotalRange();

  var totalRangeDelta = totalRange['max'] - totalRange['min'];

  var startRatio = event['startRatio'];
  var endRatio = event['endRatio'];

  var scrollerStart = totalRange['min'] + startRatio * totalRangeDelta;
  var scrollerEnd = totalRange['min'] + endRatio * totalRangeDelta;

  this.zoomTo(scrollerStart, scrollerEnd);
};


/**
 * Events overlap settings. Doesn't work and isn't public right now.
 * @param {*=} opt_value
 * @return {anychart.timelineModule.Chart|*}
 */
anychart.timelineModule.Chart.prototype.momentsOverlap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.momentsOverlap_ = opt_value;
    return this;
  }
  return this.momentsOverlap_;
};


/**
 * Method for ui.Zoom.
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.getCurrentScene = function() {
  return this;
};


/**
 * @param {number=} opt_zoomFactor How much to zoom in.
 * @param {number=} opt_anchor Number in [0; 1] range, telling which point in visible range we anchor to.
 * By default it's 0.5 (center).
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.zoomIn = function(opt_zoomFactor, opt_anchor) {
  var defaultZoomFactor = 1.6;
  var scale = this.scale();
  var visibleRange = scale.getRange();
  var anchor = goog.isDef(opt_anchor) ? opt_anchor : 0.5;
  var tr = scale.getTotalRange()['max'] - scale.getTotalRange()['min'];

  var horizontalTranslateRatio = this.horizontalTranslate / this.dataBounds.width;
  var horizontalTranslateDate = scale.inverseTransform(horizontalTranslateRatio);
  visibleRange = {
    'min': horizontalTranslateDate,
    'max': horizontalTranslateDate + (visibleRange['max'] - visibleRange['min'])
  };

  opt_zoomFactor = opt_zoomFactor ? (1 / opt_zoomFactor) : (1 / defaultZoomFactor);
  var range = visibleRange['max'] - visibleRange['min'];

  /*
  Restrict maximum zoom to avoid ranges and axis disappear.
  This happens because they are drawn all the way from the start tick to the end one,
  thus going out of on-screen visible range.*/
  if ((range / tr) < 0.0002) {
    return this;
  }

  var msInterval = Math.round(range * (opt_zoomFactor - 1));
  var newMin = visibleRange['min'] - msInterval * anchor;
  var newMax = visibleRange['max'] + msInterval * (1 - anchor);
  if (Math.abs(newMin - newMax) <= anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE) {
    var middle = (visibleRange['min'] + visibleRange['max']) / 2;
    newMin = middle - anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE * anchor;
    newMax = middle + anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE * (1 - anchor);
  }
  scale.zoomTo(newMin, newMax);
  return this;
};


/**
 * @param {number=} opt_zoomFactor How much to zoom out.
 * @param {number=} opt_anchor Number in [0; 1] range, telling which point in visible range we anchor to.
 * By default it's 0.5 (center).
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.zoomOut = function(opt_zoomFactor, opt_anchor) {
  opt_zoomFactor = opt_zoomFactor || 1.6;
  var scale = this.scale();
  var visibleRange = scale.getRange();
  var anchor = goog.isDef(opt_anchor) ? opt_anchor : 0.5;

  var horizontalTranslateRatio = this.horizontalTranslate / this.dataBounds.width;
  var horizontalTranslateDate = scale.inverseTransform(horizontalTranslateRatio);
  visibleRange = {
    'min': horizontalTranslateDate,
    'max': horizontalTranslateDate + (visibleRange['max'] - visibleRange['min'])
  };

  var msInterval = Math.round((visibleRange['max'] - visibleRange['min']) * (opt_zoomFactor - 1));

  var newMin = visibleRange['min'] - msInterval * anchor;
  var newMax = visibleRange['max'] + msInterval * (1 - anchor);

  scale.zoomTo(newMin, newMax);
  return this;
};


/**
 * Update zoom state values to keep up with current scale zoom ranges.
 * @param {{min: number, max: number}=} opt_range
 * @private
 */
anychart.timelineModule.Chart.prototype.updateZoomState_ = function(opt_range) {
  var scale = this.scale();
  var totalRange = scale.getTotalRange();
  var range = opt_range || scale.getRange();

  var currentZoom = (totalRange['max'] - totalRange['min']) / (range['max'] - range['min']);
  this.zoomState = currentZoom;
  this.prevZoomState = currentZoom;
};


/**
 *
 * @return {anychart.math.Rect}
 */
anychart.timelineModule.Chart.prototype.getDataBounds = function() {
  return this.dataBounds.clone();
};


/**
 *
 * @return {number}
 */
anychart.timelineModule.Chart.prototype.getHorizontalTranslate = function() {
  return this.horizontalTranslate;
};


//endregion
//region -- Palette.
//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.timelineModule.Chart.base(this, 'setupByJSON', config, opt_default);
  if (config['scale']) {
    this.scale(config['scale']);
    this.dateMin = config['scale']['dataMinimum'];
    this.dateMax = config['scale']['dataMaximum'];
  }

  if (config['axis']) {
    this.axis(config['axis']);
  }

  this.verticalRelativeOffset(config['verticalRelativeOffset']);

  this.setupElements(config['lineAxesMarkers'], this.lineMarker);
  this.setupElements(config['textAxesMarkers'], this.textMarker);
  this.setupElements(config['rangeAxesMarkers'], this.rangeMarker);

  if (config['todayMarker']) {
    this.todayMarker(config['todayMarker']);
  }

  this.setupSeriesByJSON(config);
};


/**
 * Creates series from passed json config.
 * @param {Object} config
 */
anychart.timelineModule.Chart.prototype.setupSeriesByJSON = function(config) {
  var json;
  var series = config['series'];
  if (goog.isArray(series)) {
    for (var i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = json['seriesType'] || this.getOption('defaultSeriesType');
      var seriesInstance = this.createSeriesByType(seriesType, json);
      if (seriesInstance) {
        seriesInstance.setup(json);
      }
    }
  }
};


/**
 * @param {Object} config
 * @param {Function} itemConstructor
 */
anychart.timelineModule.Chart.prototype.setupElements = function(config, itemConstructor) {
  for (var i = 0; i < config.length; i++) {
    var item = itemConstructor.call(this, i);
    item.setup(config[i]);
  }
};


/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.serialize = function() {
  var json = anychart.timelineModule.Chart.base(this, 'serialize');

  json['scale'] = this.scale().serialize();
  json['axis'] = this.axis().serialize();

  var i;
  json['lineAxesMarkers'] = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    json['lineAxesMarkers'].push(this.lineAxesMarkers_[i].serialize());
  }

  json['textAxesMarkers'] = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    json['textAxesMarkers'].push(this.textAxesMarkers_[i].serialize());
  }

  json['rangeAxesMarkers'] = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    json['rangeAxesMarkers'].push(this.rangeAxesMarkers_[i].serialize());
  }

  if (goog.isDef(this.todayMarker_)) {
    json['todayMarker'] = this.todayMarker_.serialize();
  }

  this.serializeSeries(json);

  json['type'] = this.getType();

  json['verticalRelativeOffset'] = this.verticalRelativeOffset();

  return {'chart': json};
};


/**
 * @param {!Object} json
 */
anychart.timelineModule.Chart.prototype.serializeSeries = function(json) {
  var i;
  var config;
  var seriesList = [];
  for (i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    config = series.serialize();
    seriesList.push(config);
  }
  if (seriesList.length)
    json['series'] = seriesList;
};


/**
 * Force update scale range to the current visible range.
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.forceScaleUpdate = function() {
  var visibleRange = this.getVisibleRange();
  this.scale().setRange(visibleRange['min'], visibleRange['max']);
  return this;
};


/**
 * Returns visible scale range taking horizontal translate into account.
 * @return {{min: number, max: number}}
 */
anychart.timelineModule.Chart.prototype.getVisibleRange = function() {
  var scale = this.scale();
  var scaleVisibleRange = scale.getRange();
  var horizontalTranslateRatio = this.horizontalTranslate / this.dataBounds.width;
  var horizontalTranslateDate = scale.inverseTransform(horizontalTranslateRatio);

  return {
    'min': horizontalTranslateDate,
    'max': horizontalTranslateDate + (scaleVisibleRange['max'] - scaleVisibleRange['min'])
  };
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.disposeInternal = function() {
  this.xScale_.unlistenSignals(this.scaleInvalidated_, this);
  this.axis_.unlistenSignals(this.axisInvalidated_, this);
  this.rootElement.unlisten(goog.events.EventType.MOUSEDOWN, this.mouseDownHandler, true, this);
  this.rootElement.unlisten(goog.events.EventType.MOUSEMOVE, this.mouseMoveHandler, true, this);
  goog.events.unlisten(anychart.document, goog.events.EventType.MOUSEUP, this.mouseUpHandler, true, this);
  this.mouseWheelHandler_.unlisten(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_, false, this);

  goog.disposeAll(this.axis_, this.xScale_, this.yScale_, this.lineAxesMarkers_, this.textAxesMarkers_,
      this.rangeAxesMarkers_, this.timelineLayer_, this.todayMarker_, this.axesMarkersLayer_);
  this.axis_ = null;
  this.xScale_ = null;
  this.yScale_ = null;
  this.lineAxesMarkers_.length = 0;
  this.textAxesMarkers_.length = 0;
  this.rangeAxesMarkers_.length = 0;
  this.todayMarker_ = null;
  this.timelineLayer_ = null;
  this.axesMarkersLayer_ = null;
  anychart.timelineModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.timelineModule.Chart.prototype;
  proto['axis'] = proto.axis;
  proto['scale'] = proto.scale;
  proto['fitAll'] = proto.fitAll;
  proto['fit'] = proto.fitAll;
  proto['zoomTo'] = proto.zoomTo;
  proto['getType'] = proto.getType;

  proto['getCurrentScene'] = proto.getCurrentScene;
  proto['zoomIn'] = proto.zoomIn;
  proto['zoomOut'] = proto.zoomOut;

  proto['getSeries'] = proto.getSeries;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;

  proto['scroll'] = proto.scroll;
  proto['lineMarker'] = proto.lineMarker;
  proto['textMarker'] = proto.textMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['todayMarker'] = proto.todayMarker;
  proto['scroller'] = proto.scroller;

  proto['forceScaleUpdate'] = proto.forceScaleUpdate;
  proto['getVisibleRange'] = proto.getVisibleRange;
  proto['verticalRelativeOffset'] = proto.verticalRelativeOffset;
})();
//exports

//endregion
