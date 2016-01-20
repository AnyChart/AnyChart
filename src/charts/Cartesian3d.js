goog.provide('anychart.charts.Cartesian3d');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.axisMarkers.Line3d');
goog.require('anychart.core.axisMarkers.Range3d');
goog.require('anychart.core.axisMarkers.Text3d');
goog.require('anychart.core.grids.Linear3d');
goog.require('anychart.math.Rect');



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
   * @type {number}
   * @private
   */
  this.zAngle_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.zDepth_ = 0;

  /**
   * @type {number|boolean}
   * @private
   */
  this.zPadding_ = false;

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
 * Getter/setter for zDepth.
 * @param {number=} opt_value
 * @return {number|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zDepth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.zDepth_ != opt_value) {
      this.zDepth_ = anychart.utils.toNumber(opt_value);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.zDepth_;
  }
};


/**
 * Getter/setter for zPadding.
 * @param {(number|boolean)=} opt_value
 * @return {number|boolean|anychart.charts.Cartesian3d}
 */
anychart.charts.Cartesian3d.prototype.zPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.zPadding_ != opt_value) {
      this.zPadding_ = opt_value;
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
  var inc = series.index() * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
  var iterator = series.getIterator();
  var value = iterator.get('value');
  var zIndex = anychart.core.CartesianBase.ZINDEX_SERIES;

  if (anychart.utils.toNumber(value) > 0 || !goog.isNumber(value)) {
    if (this.barChartMode) {
      if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE) {
        zIndex -= inc;
      } else {
        zIndex += inc;
      }
    } else {
      if (this.zPadding()) {
        zIndex -= inc;
      } else {
        zIndex += inc;
      }
    }

  } else {
    if (this.barChartMode) {
      zIndex -= inc;
    } else {
      if (this.yScale().stackMode() == anychart.enums.ScaleStackMode.NONE) {
        zIndex += inc;
      } else {
        zIndex -= inc;
      }
    }
  }

  iterator.meta('zIndex', zIndex);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.calculate = function() {
  anychart.charts.Cartesian3d.base(this, 'calculate');

  this.lastEnabledAreaSeriesMap = {};
  goog.object.forEach(this.getAllSeries(), function(series) {
    if (series.enabled()) {
      var iterator = series.getResetIterator();
      while (iterator.advance()) {
        this.setSeriesPointZIndex_(/** @type {anychart.core.cartesian.series.Base} */(series));
      }

      if (series.isAreaBased()) {
        this.lastEnabledAreaSeriesMap[goog.getUid(series.xScale()) + '_' + goog.getUid(series.yScale())] = series.index();
      }
    }
  }, this);

  var angleRad = goog.math.toRadians(this.zAngle_);
  var secondAngle = 90 - this.zAngle_;
  var secondAngleRad = goog.math.toRadians(secondAngle);
  this.x3dShift = Math.round(this.zDepth_ * Math.sin(secondAngleRad));
  this.y3dShift = Math.round(this.zDepth_ * Math.sin(angleRad));

  this.zPaddingXShift_ = Math.round(this.zPadding_ * Math.sin(secondAngleRad));
  this.zPaddingYShift_ = Math.round(this.zPadding_ * Math.sin(angleRad));
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.getContentAreaBounds = function(bounds) {
  var contentAreaBounds = bounds.clone().round();
  contentAreaBounds.top += this.y3dShift;
  contentAreaBounds.height -= this.y3dShift;
  contentAreaBounds.width -= this.x3dShift;
  return contentAreaBounds;
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.setParentBoundsTo3dAxis = function(axis, bounds) {
  axis.parentBounds(new anychart.math.Rect(bounds.left + this.x3dShift, bounds.top - this.y3dShift,
      bounds.width, bounds.height));
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.getSeriesCtor = function(type) {
  return anychart.core.cartesian.series.Base.Series3dTypesMap[type];
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.getSeriesZIndex = function(type, inc) {
  return anychart.core.CartesianBase.ZINDEX_SERIES + inc;
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


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.setupByJSON = function(config) {
  anychart.charts.Cartesian3d.base(this, 'setupByJSON', config);

  this.zAngle(config['zAngle']);
  this.zDepth(config['zDepth']);
  this.zPadding(config['zPadding']);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.serialize = function() {
  var json = anychart.charts.Cartesian3d.base(this, 'serialize');

  json['chart']['zAngle'] = this.zAngle();
  json['chart']['zDepth'] = this.zDepth();
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
anychart.charts.Cartesian3d.prototype['zAngle'] = anychart.charts.Cartesian3d.prototype.zAngle;
anychart.charts.Cartesian3d.prototype['zDepth'] = anychart.charts.Cartesian3d.prototype.zDepth;
anychart.charts.Cartesian3d.prototype['zPadding'] = anychart.charts.Cartesian3d.prototype.zPadding;
