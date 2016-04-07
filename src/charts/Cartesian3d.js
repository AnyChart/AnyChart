goog.provide('anychart.charts.Cartesian3d');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.axisMarkers.Line3d');
goog.require('anychart.core.axisMarkers.Range3d');
goog.require('anychart.core.axisMarkers.Text3d');
goog.require('anychart.core.grids.Linear3d');



/**
 * Cartesian 3d chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.charts.Cartesian3d = function(opt_barChartMode) {
  anychart.charts.Cartesian3d.base(this, 'constructor', opt_barChartMode);

  /**
   * @type {number|string}
   * @private
   */
  this.zAspect_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.zAngle_ = 0;

  /**
   * @type {?number}
   * @private
   */
  this.zDepth_ = null;

  /**
   * @type {number}
   * @private
   */
  this.zDepthValue_ = 0;

  /**
   * @type {boolean}
   * @private
   */
  this.zDistribution_ = false;

  /**
   * @type {number}
   * @private
   */
  this.zPadding_ = 0;

  this.setType(anychart.enums.ChartTypes.CARTESIAN_3D);
};
goog.inherits(anychart.charts.Cartesian3d, anychart.core.CartesianBase);


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian3d();
 * chart.area([20, 7, 10, 14]);
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian3d} Empty chart.
 */
anychart.cartesian3d = function(opt_barChartMode) {
  var chart = new anychart.charts.Cartesian3d(opt_barChartMode);
  chart.setup(anychart.getFullTheme()['cartesian3d']);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN_3D] = anychart.cartesian3d;


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.isMode3d = true;


/**
 * Getter/setter for zAngle.
 * From 0 to 90.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.zAngle_ != opt_value) {
      this.zAngle_ = goog.math.clamp(anychart.utils.toNumber(opt_value), 0, 90);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zAngle_;
  }
};


/**
 * Getter/setter for zAspect.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zAspect = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.zAspect_ != opt_value) {
      this.zAspect_ = goog.isNumber(opt_value) ? Math.max(opt_value, 0) : opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zAspect_;
  }
};


/**
 * Getter/setter for zDepth.
 * @param {(number|null)=} opt_value
 * @return {number|null|anychart.charts.Cartesian3d}
 * @deprecated Deprecated since 7.10.0. Use chart.zAspect instead.
 */
anychart.charts.Cartesian3d.prototype.zDepth = function(opt_value) {
  anychart.utils.warning(anychart.enums.WarningCode.DEPRECATED, null, ['chart.zDepth', 'chart.zAspect with chart.zPadding']);
  if (goog.isDef(opt_value)) {
    if (this.zDepth_ != opt_value) {
      this.zDepth_ = goog.isNull(opt_value) ? opt_value : anychart.utils.toNumber(opt_value);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zDepth_;
  }
};


/**
 * Getter/setter for distributing series on the z-axis.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zDistribution = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.zDistribution_ != opt_value) {
      this.zDistribution_ = opt_value;
      this.invalidate(
          anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zDistribution_;
  }
};


/**
 * Getter/setter for zPadding.
 * Value must be more than zero.
 * @param {(number)=} opt_value
 * @return {number|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.zPadding_ !== opt_value) {
      this.zPadding_ = Math.max(opt_value, 0);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zPadding_;
  }
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.createGridInstance = function() {
  return new anychart.core.grids.Linear3d();
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.createLineMarkerInstance = function() {
  var axisMarker = new anychart.core.axisMarkers.Line3d();
  axisMarker.setChart(this);
  return axisMarker;
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.createRangeMarkerInstance = function() {
  var axisMarker = new anychart.core.axisMarkers.Range3d();
  axisMarker.setChart(this);
  return axisMarker;
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.createTextMarkerInstance = function() {
  var axisMarker = new anychart.core.axisMarkers.Text3d();
  axisMarker.setChart(this);
  return axisMarker;
};


/**
 * Set zIndex for point.
 * @param {anychart.core.cartesian.series.Base} series
 * @private
 */
anychart.charts.Cartesian3d.prototype.setSeriesPointZIndex_ = function(series) {
  var seriesIndex = series.index();
  var inc = seriesIndex * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
  var iterator = series.getIterator();
  var value = iterator.get('value');
  var zIndex = anychart.core.CartesianBase.ZINDEX_SERIES;

  if (anychart.utils.toNumber(value) > 0 || !goog.isNumber(value)) {
    if (series.isBarBased()) {
      if (!series.drawingPlan.stacked) {
        if (this.zDistribution()) {
          zIndex += inc;
        } else {
          zIndex -= inc;
        }
      } else {
        zIndex += inc;
      }
    } else {
      zIndex += inc;
    }

  } else {
    if (series.isBarBased()) {
      zIndex -= inc;
    } else {
      if (!series.drawingPlan.stacked) {
        zIndex += inc;
      } else {
        zIndex -= inc;
      }
    }
  }

  iterator.meta('zIndex', zIndex);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.prepare3d = function() {
  this.lastEnabledAreaSeriesMap = {};
  var allSeries = this.getAllSeries();
  var series;
  for (var i = 0; i < allSeries.length; i++) {
    series = allSeries[i];
    if (series && series.enabled()) {
      if (series.drawingPlan.stacked && series.hasMarkers()) {
        var inc = series.index() * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
        series.markers().setAutoZIndex(anychart.core.CartesianBase.ZINDEX_MARKER + inc);
      }

      if (series.isAreaBased()) {
        this.lastEnabledAreaSeriesMap[goog.getUid(series.xScale()) + '_' + goog.getUid(series.yScale())] = series.index();
      } else {
        var iterator = series.getResetIterator();
        while (iterator.advance()) {
          this.setSeriesPointZIndex_(/** @type {anychart.core.cartesian.series.Base} */(series));
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.getContentAreaBounds = function(bounds) {
  var contentAreaBounds = bounds.clone().round();
  var boundsWithoutAxes = this.getBoundsWithoutAxes(contentAreaBounds);

  var needAspectCalc = !goog.isDefAndNotNull(this.zDepth_) && anychart.utils.isPercent(this.zAspect_);
  var seriesCount = this.getSeriesCount();

  var angleRad = goog.math.toRadians(this.zAngle_);
  var secondAngle = 90 - this.zAngle_;
  var secondAngleRad = goog.math.toRadians(secondAngle);

  var zPaddingValue = this.zPadding_;

  if (needAspectCalc) {
    var aspectRatio = parseFloat(this.zAspect_) / 100;
    var xAspectRatio = aspectRatio * Math.sin(secondAngleRad);
    var yAspectRatio = aspectRatio * Math.sin(angleRad);
    var x3dShiftRatio = 0;
    var y3dShiftRatio = 0;

    var allSeries = this.getAllSeries();
    var series;
    for (var i = 0; i < allSeries.length; i++) {
      series = allSeries[i];
      if (series && series.enabled()) {
        var xScale = series.xScale();
        var catCount = xScale.getType() == anychart.enums.ScaleTypes.ORDINAL ? xScale.values().length : series.getIterator().getRowsCount();
        var catWidthRatio = 1 / catCount;
        var barWidthRatio;
        var barWidthRatioOfTotalWidth;

        if (series.drawingPlan.stacked || this.zDistribution()) {
          barWidthRatio = 1 / (1 + /** @type {number} */(this.barGroupsPadding()));
        } else {
          barWidthRatio = 1 / (seriesCount + (seriesCount - 1) * this.barsPadding() + this.barGroupsPadding());
        }

        barWidthRatioOfTotalWidth = catWidthRatio * barWidthRatio;

        if (!series.drawingPlan.stacked && this.zDistribution()) {
          x3dShiftRatio += barWidthRatioOfTotalWidth * xAspectRatio;
          y3dShiftRatio += barWidthRatioOfTotalWidth * yAspectRatio;

        } else if (!x3dShiftRatio) {
          x3dShiftRatio = barWidthRatioOfTotalWidth * xAspectRatio;
          y3dShiftRatio = barWidthRatioOfTotalWidth * yAspectRatio;
        }
      }
    }

    this.zPaddingXShift = Math.round(zPaddingValue * Math.sin(secondAngleRad));
    this.zPaddingYShift = Math.round(zPaddingValue * Math.sin(angleRad));

    var axisBoundsWidth = this.barChartMode ?
        boundsWithoutAxes.height / (1 + x3dShiftRatio) :
        boundsWithoutAxes.width / (1 + x3dShiftRatio);

    this.x3dShift = axisBoundsWidth * x3dShiftRatio;
    this.y3dShift = axisBoundsWidth * y3dShiftRatio;
    if (!this.hasStackedSeries && this.zDistribution()) {
      this.x3dShift += this.zPaddingXShift * (seriesCount - 1);
      this.y3dShift += this.zPaddingYShift * (seriesCount - 1);
    }
    // Accuracy!
    this.x3dShift = Math.round(this.x3dShift);
    this.y3dShift = Math.round(this.y3dShift);

  } else {
    if (goog.isDefAndNotNull(this.zDepth_)) {
      this.zDepthValue_ = this.zDepth_;

    // not needAspectCalc
    } else {
      if (!this.hasStackedSeries && this.zDistribution()) {
        this.zDepthValue_ = this.zAspect_ * seriesCount + this.zPadding_ * (seriesCount - 1);
      } else {
        this.zDepthValue_ = anychart.utils.toNumber(this.zAspect_);
      }
    }

    this.x3dShift = Math.round(this.zDepthValue_ * Math.sin(secondAngleRad));
    this.y3dShift = Math.round(this.zDepthValue_ * Math.sin(angleRad));

    // zPadding * (seriesCount - 1) must be less than zDepth.
    var zPaddingCount = seriesCount - 1;
    if (zPaddingValue * zPaddingCount >= this.zDepthValue_) {
      zPaddingValue = (this.zDepthValue_ - seriesCount) / zPaddingCount;
    }

    this.zPaddingXShift = Math.round(zPaddingValue * Math.sin(secondAngleRad));
    this.zPaddingYShift = Math.round(zPaddingValue * Math.sin(angleRad));
  }

  // value must be > 0 and not NaN
  this.x3dShift = Math.max(this.x3dShift, 0) || 0;
  this.y3dShift = Math.max(this.y3dShift, 0) || 0;
  this.zPaddingXShift = Math.max(this.zPaddingXShift, 0) || 0;
  this.zPaddingYShift = Math.max(this.zPaddingYShift, 0) || 0;

  contentAreaBounds.top += this.y3dShift;
  contentAreaBounds.height -= this.y3dShift;
  contentAreaBounds.width -= this.x3dShift;

  return contentAreaBounds;
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.getSeriesCtor = function(type) {
  return anychart.core.cartesian.series.Base.Series3dTypesMap[type];
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.distributeColumnClusters = function(numColumnClusters, drawingPlansOfScale) {
  var wSeries;

  if (!this.hasStackedSeries && this.zDistribution()) {
    if (numColumnClusters > 0) {
      numColumnClusters = 1 + /** @type {number} */(this.barGroupsPadding());
      var barWidthRatio = 1 / numColumnClusters;
      for (var i = 0; i < drawingPlansOfScale.length; i++) {
        wSeries = drawingPlansOfScale[i].series;
        if (wSeries.isWidthBased() && !wSeries.isBarBased()) {
          wSeries.setAutoXPointPosition(0.5);
          wSeries.setAutoBarWidth(barWidthRatio);
        }
      }
    }
  } else {
    anychart.charts.Cartesian3d.base(this, 'distributeColumnClusters', numColumnClusters, drawingPlansOfScale);
  }
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.distributeBarClusters = function(numBarClusters, drawingPlansOfScale) {
  var wSeries;

  if (!this.hasStackedSeries && this.zDistribution()) {
    if (numBarClusters > 0) {
      numBarClusters = 1 + /** @type {number} */(this.barGroupsPadding());
      var barWidthRatio = 1 / numBarClusters;
      for (var i = 0; i < drawingPlansOfScale.length; i++) {
        wSeries = drawingPlansOfScale[i].series;
        if (wSeries.isBarBased()) {
          wSeries.setAutoXPointPosition(0.5);
          wSeries.setAutoBarWidth(barWidthRatio);
        }
      }
    }
  } else {
    anychart.charts.Cartesian3d.base(this, 'distributeBarClusters', numBarClusters, drawingPlansOfScale);
  }
};


/**
 * Adds 3D Bar series.
 * @example
 * var chart = anychart.bar3d();
 * chart.bar([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Bar3d} instance for method chaining.
 */
anychart.charts.Cartesian3d.prototype.bar = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.Cartesian3dSeriesType.BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds 3D Column series.
 * @example
 * var chart = anychart.column3d();
 * chart.column([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Column3d} instance for method chaining.
 */
anychart.charts.Cartesian3d.prototype.column = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.Cartesian3dSeriesType.COLUMN,
      data,
      opt_csvSettings
  );
};


/**
 * Adds 3D Area series.
 * @example
 * var chart = anychart.area3d();
 * chart.area([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Area3d} instance for method chaining.
 */
anychart.charts.Cartesian3d.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.Cartesian3dSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.charts.Cartesian3d.prototype.setupByJSON = function(config) {
  anychart.charts.Cartesian3d.base(this, 'setupByJSON', config);

  this.zAngle(config['zAngle']);
  if (config['zDepth']) this.zDepth(config['zDepth']);
  this.zAspect(config['zAspect']);
  this.zDistribution(config['zDistribution']);
  this.zPadding(config['zPadding']);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.charts.Cartesian3d.prototype.serialize = function() {
  var json = anychart.charts.Cartesian3d.base(this, 'serialize');

  json['chart']['zAngle'] = this.zAngle();
  if (goog.isDefAndNotNull(this.zDepth_)) json['chart']['zDepth'] = this.zDepth();
  json['chart']['zAspect'] = this.zAspect();
  json['chart']['zDistribution'] = this.zDistribution();
  json['chart']['zPadding'] = this.zPadding();

  return json;
};


//exports
goog.exportSymbol('anychart.cartesian3d', anychart.cartesian3d);
anychart.charts.Cartesian3d.prototype['xScale'] = anychart.charts.Cartesian3d.prototype.xScale;
anychart.charts.Cartesian3d.prototype['yScale'] = anychart.charts.Cartesian3d.prototype.yScale;
anychart.charts.Cartesian3d.prototype['barsPadding'] = anychart.charts.Cartesian3d.prototype.barsPadding;
anychart.charts.Cartesian3d.prototype['barGroupsPadding'] = anychart.charts.Cartesian3d.prototype.barGroupsPadding;
anychart.charts.Cartesian3d.prototype['crosshair'] = anychart.charts.Cartesian3d.prototype.crosshair;
anychart.charts.Cartesian3d.prototype['grid'] = anychart.charts.Cartesian3d.prototype.grid;
anychart.charts.Cartesian3d.prototype['minorGrid'] = anychart.charts.Cartesian3d.prototype.minorGrid;
anychart.charts.Cartesian3d.prototype['xAxis'] = anychart.charts.Cartesian3d.prototype.xAxis;
anychart.charts.Cartesian3d.prototype['yAxis'] = anychart.charts.Cartesian3d.prototype.yAxis;
anychart.charts.Cartesian3d.prototype['getSeries'] = anychart.charts.Cartesian3d.prototype.getSeries;
anychart.charts.Cartesian3d.prototype['area'] = anychart.charts.Cartesian3d.prototype.area;
anychart.charts.Cartesian3d.prototype['bar'] = anychart.charts.Cartesian3d.prototype.bar;
anychart.charts.Cartesian3d.prototype['column'] = anychart.charts.Cartesian3d.prototype.column;
anychart.charts.Cartesian3d.prototype['lineMarker'] = anychart.charts.Cartesian3d.prototype.lineMarker;
anychart.charts.Cartesian3d.prototype['rangeMarker'] = anychart.charts.Cartesian3d.prototype.rangeMarker;
anychart.charts.Cartesian3d.prototype['textMarker'] = anychart.charts.Cartesian3d.prototype.textMarker;
anychart.charts.Cartesian3d.prototype['palette'] = anychart.charts.Cartesian3d.prototype.palette;
anychart.charts.Cartesian3d.prototype['markerPalette'] = anychart.charts.Cartesian3d.prototype.markerPalette;
anychart.charts.Cartesian3d.prototype['hatchFillPalette'] = anychart.charts.Cartesian3d.prototype.hatchFillPalette;
anychart.charts.Cartesian3d.prototype['getType'] = anychart.charts.Cartesian3d.prototype.getType;
anychart.charts.Cartesian3d.prototype['defaultSeriesType'] = anychart.charts.Cartesian3d.prototype.defaultSeriesType;
anychart.charts.Cartesian3d.prototype['addSeries'] = anychart.charts.Cartesian3d.prototype.addSeries;
anychart.charts.Cartesian3d.prototype['getSeriesAt'] = anychart.charts.Cartesian3d.prototype.getSeriesAt;
anychart.charts.Cartesian3d.prototype['getSeriesCount'] = anychart.charts.Cartesian3d.prototype.getSeriesCount;
anychart.charts.Cartesian3d.prototype['removeSeries'] = anychart.charts.Cartesian3d.prototype.removeSeries;
anychart.charts.Cartesian3d.prototype['removeSeriesAt'] = anychart.charts.Cartesian3d.prototype.removeSeriesAt;
anychart.charts.Cartesian3d.prototype['removeAllSeries'] = anychart.charts.Cartesian3d.prototype.removeAllSeries;
anychart.charts.Cartesian3d.prototype['getPlotBounds'] = anychart.charts.Cartesian3d.prototype.getPlotBounds;
anychart.charts.Cartesian3d.prototype['xZoom'] = anychart.charts.Cartesian3d.prototype.xZoom;
anychart.charts.Cartesian3d.prototype['xScroller'] = anychart.charts.Cartesian3d.prototype.xScroller;
anychart.charts.Cartesian3d.prototype['zAspect'] = anychart.charts.Cartesian3d.prototype.zAspect;
anychart.charts.Cartesian3d.prototype['zAngle'] = anychart.charts.Cartesian3d.prototype.zAngle;
anychart.charts.Cartesian3d.prototype['zDistribution'] = anychart.charts.Cartesian3d.prototype.zDistribution;
anychart.charts.Cartesian3d.prototype['zDepth'] = anychart.charts.Cartesian3d.prototype.zDepth;
anychart.charts.Cartesian3d.prototype['zPadding'] = anychart.charts.Cartesian3d.prototype.zPadding;
