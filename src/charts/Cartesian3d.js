/**
 * @fileoverview anychart.charts.Cartesian3d class.
 * @suppress {extraRequire}
 */
goog.provide('anychart.charts.Cartesian3d');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.I3DProvider');
goog.require('anychart.core.axisMarkers.Line3d');
goog.require('anychart.core.axisMarkers.Range3d');
goog.require('anychart.core.axisMarkers.Text3d');
goog.require('anychart.core.drawers.Area3d');
goog.require('anychart.core.drawers.Bar3d');
goog.require('anychart.core.drawers.Column3d');
goog.require('anychart.core.grids.Linear3d');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('goog.color');



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
 * @constructor
 * @extends {anychart.core.CartesianBase}
 * @implements {anychart.core.I3DProvider}
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
 * Coloring post processor for Area 3D series.
 * @param {anychart.core.series.Base} series
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number|anychart.PointState} pointState
 */
anychart.charts.Cartesian3d.areaPostProcessor = function(series, shapes, pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var resolver = anychart.core.series.Base.getColorResolver(
      [anychart.opt.FILL, anychart.opt.HOVER_FILL, anychart.opt.SELECT_FILL], anychart.enums.ColorType.FILL);
  var fill = resolver(series, pointState);
  var opacity = goog.isObject(fill) ? fill['opacity'] : 1;
  var color = goog.isObject(fill) ? fill['color'] : fill;
  var parsedColor = anychart.color.parseColor(color);

  if (goog.isNull(parsedColor)) {
    frontFill = topFill = rightFill = bottomFill = backFill = leftFill = 'none';
  } else {
    color = parsedColor.hex;
    var rgbColor = goog.color.hexToRgb(color);
    var rgbDarken = goog.color.darken(rgbColor, .2);
    var rgbDarken03 = goog.color.darken(rgbColor, .3);
    var rgbMoreDarken = goog.color.darken(rgbColor, .25);
    var rgbLighten = goog.color.lighten(rgbColor, .1);

    var darkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .7));
    var darkBlendedColor2 = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken03, .7));
    var lightBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbDarken, rgbLighten, .1));
    var softDarkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .1));

    frontFill = /** @type {acgraph.vector.Fill} */({
      'angle': 90,
      'opacity': opacity,
      'keys': [
        anychart.color.lighten(darkBlendedColor, .2),
        anychart.color.lighten(color, .3)]
    });
    topFill = /** @type {string} */(anychart.color.lighten(darkBlendedColor2, .2));
    rightFill = bottomFill = /** @type {string} */(anychart.color.lighten(softDarkBlendedColor, .2));
    backFill = lightBlendedColor;
    leftFill = goog.color.rgbArrayToHex(rgbMoreDarken);

  }

  shapes[anychart.opt.BOTTOM].fill({'color': bottomFill, 'opacity': opacity});
  shapes[anychart.opt.BACK].fill({'color': backFill, 'opacity': opacity});
  shapes[anychart.opt.LEFT].fill({'color': leftFill, 'opacity': opacity});
  shapes[anychart.opt.RIGHT].fill({'color': rightFill, 'opacity': opacity});
  shapes[anychart.opt.TOP].fill({'color': topFill, 'opacity': opacity});
  shapes[anychart.opt.FRONT].fill(frontFill);

  // fix for batik (DVF-2068)
  shapes[anychart.opt.TOP].stroke({'color': topFill, 'thickness': 0.8});
};


/**
 * Coloring post processor for Bar 3D and Column 3D series.
 * @param {anychart.core.series.Base} series
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number|anychart.PointState} pointState
 */
anychart.charts.Cartesian3d.barColumnPostProcessor = function(series, shapes, pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var resolver = anychart.core.series.Base.getColorResolver(
      [anychart.opt.FILL, anychart.opt.HOVER_FILL, anychart.opt.SELECT_FILL], anychart.enums.ColorType.FILL);
  var fill = resolver(series, pointState);
  var opacity = goog.isObject(fill) ? fill['opacity'] : 1;
  var color = goog.isObject(fill) ? fill['color'] : fill;
  var parsedColor = anychart.color.parseColor(color);

  if (goog.isNull(parsedColor)) {
    frontFill = rightFill = topFill = bottomFill = backFill = leftFill = 'none';
  } else {
    color = parsedColor.hex;
    var rgbColor = goog.color.hexToRgb(color);

    var rgbDarken = goog.color.darken(rgbColor, .2);
    var rgbMoreDarken = goog.color.darken(rgbColor, .25);
    var rgbLighten = goog.color.lighten(rgbColor, .1);

    var darkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .7));
    var lightBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbDarken, rgbLighten, .1));
    var softDarkBlendedColor = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken, .1));

    frontFill = {
      'angle': series.isBarBased() ? 0 : 90,
      'opacity': opacity,
      'keys': [
        anychart.color.lighten(darkBlendedColor, .2),
        anychart.color.lighten(color, .3)]
    };
    rightFill = anychart.color.lighten(softDarkBlendedColor, .2);
    topFill = anychart.color.lighten(darkBlendedColor, .2);
    bottomFill = goog.color.rgbArrayToHex(rgbDarken);
    backFill = lightBlendedColor;
    leftFill = goog.color.rgbArrayToHex(rgbMoreDarken);

  }

  shapes[anychart.opt.BOTTOM].fill(/** @type {!acgraph.vector.Fill} */({'color': bottomFill, 'opacity': opacity}));
  shapes[anychart.opt.BACK].fill(/** @type {!acgraph.vector.Fill} */({'color': backFill, 'opacity': opacity}));
  shapes[anychart.opt.LEFT].fill(/** @type {!acgraph.vector.Fill} */({'color': leftFill, 'opacity': opacity}));
  shapes[anychart.opt.RIGHT].fill(/** @type {!acgraph.vector.Fill} */({'color': rightFill, 'opacity': opacity}));
  shapes[anychart.opt.TOP].fill(/** @type {!acgraph.vector.Fill} */({'color': topFill, 'opacity': opacity}));
  shapes[anychart.opt.FRONT].fill(/** @type {!acgraph.vector.Fill} */(frontFill));
};


/**
 * Series config for Cartesian chart.
 * @type {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Cartesian3d.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.Cartesian3dSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA_3D,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathTopArea3DConfig,
      anychart.core.shapeManagers.pathBottom3DConfig,
      anychart.core.shapeManagers.pathLeft3DConfig,
      anychart.core.shapeManagers.pathRight3DConfig,
      anychart.core.shapeManagers.pathBack3DConfig,
      anychart.core.shapeManagers.pathFront3DConfig,
      // anychart.core.shapeManagers.pathRight3DHatchConfig,
      // anychart.core.shapeManagers.pathTop3DHatchConfig,
      anychart.core.shapeManagers.pathFront3DHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: anychart.charts.Cartesian3d.areaPostProcessor,
    capabilities: capabilities,
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
  };
  res[anychart.enums.Cartesian3dSeriesType.BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BAR_3D,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathTop3DConfig,
      anychart.core.shapeManagers.pathBottom3DConfig,
      anychart.core.shapeManagers.pathLeft3DConfig,
      anychart.core.shapeManagers.pathRight3DConfig,
      anychart.core.shapeManagers.pathBack3DConfig,
      anychart.core.shapeManagers.pathFront3DConfig,
      anychart.core.shapeManagers.pathFront3DHatchConfig,
      anychart.core.shapeManagers.pathRight3DHatchConfig,
      anychart.core.shapeManagers.pathTop3DHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: anychart.charts.Cartesian3d.barColumnPostProcessor,
    capabilities: capabilities,
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
  };
  res[anychart.enums.Cartesian3dSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN_3D,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathTop3DConfig,
      anychart.core.shapeManagers.pathBottom3DConfig,
      anychart.core.shapeManagers.pathLeft3DConfig,
      anychart.core.shapeManagers.pathRight3DConfig,
      anychart.core.shapeManagers.pathBack3DConfig,
      anychart.core.shapeManagers.pathFront3DConfig,
      anychart.core.shapeManagers.pathFront3DHatchConfig,
      anychart.core.shapeManagers.pathRight3DHatchConfig,
      anychart.core.shapeManagers.pathTop3DHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: anychart.charts.Cartesian3d.barColumnPostProcessor,
    capabilities: capabilities,
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
  };
  return res;
})();


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
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['chart.zDepth', 'chart.zAspect with chart.zPadding']);
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


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getX3DDistributionShift = function(seriesIndex, seriesIsStacked) {
  var x3dShift;
  if (seriesIsStacked || !this.zDistribution()) {
    x3dShift = 0;
  } else {
    var seriesCount = this.getSeriesCount();
    var drawIndex = seriesCount - seriesIndex - 1;
    x3dShift = (this.getX3DShift(seriesIsStacked) + this.zPaddingXShift) * drawIndex;
  }
  return x3dShift;
};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getY3DDistributionShift = function(seriesIndex, seriesIsStacked) {
  var y3dShift;
  if (seriesIsStacked || !this.zDistribution()) {
    y3dShift = 0;
  } else {
    var seriesCount = this.getSeriesCount();
    var drawIndex = seriesCount - seriesIndex - 1;
    y3dShift = (this.getY3DShift(seriesIsStacked) + this.zPaddingYShift) * drawIndex;
  }
  return y3dShift;
};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getX3DShift = function(seriesIsStacked) {
  var seriesCount = this.getSeriesCount();
  var zPaddingShift = this.zPaddingXShift;
  var seriesShift = this.x3dShift;
  if (!seriesIsStacked && this.zDistribution()) {
    seriesShift = (seriesShift - zPaddingShift * (seriesCount - 1)) / seriesCount;
  }
  return seriesShift;
};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getY3DShift = function(seriesIsStacked) {
  var seriesCount = this.getSeriesCount();
  var zPaddingShift = this.zPaddingYShift;
  var seriesShift = this.y3dShift;
  if (!seriesIsStacked && this.zDistribution()) {
    seriesShift = (seriesShift - zPaddingShift * (seriesCount - 1)) / seriesCount;
  }
  return seriesShift;
};


/**
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getX3DFullShift = function() {
  return this.x3dShift;
};


/**
 * @return {number}
 */
anychart.charts.Cartesian3d.prototype.getY3DFullShift = function() {
  return this.y3dShift;
};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @param {string} scalesIds
 * @return {boolean}
 */
anychart.charts.Cartesian3d.prototype.shouldDrawTopSide = function(seriesIndex, seriesIsStacked, scalesIds) {
  return !seriesIsStacked || seriesIndex == this.lastEnabledAreaSeriesMap[scalesIds];
};


/**
 * @return {boolean}
 */
anychart.charts.Cartesian3d.prototype.yInverted = function() {
  return /** @type {boolean} */(this.yScale().inverted());
};


/**
 * @return {boolean}
 */
anychart.charts.Cartesian3d.prototype.xInverted = function() {
  return /** @type {boolean} */(this.xScale().inverted());
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
 * @param {anychart.core.series.Cartesian} series
 * @private
 */
anychart.charts.Cartesian3d.prototype.setSeriesPointZIndex_ = function(series) {
  var seriesIndex = series.getIndex();
  var inc = seriesIndex * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
  var iterator = series.getIterator();
  var value = anychart.utils.toNumber(iterator.get('value'));
  var zIndex = anychart.core.CartesianBase.ZINDEX_SERIES;

  if (value > 0) {
    if (series.isBarBased()) {
      if (!series.planIsStacked()) {
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

  } else if (value < 0) {
    if (series.isBarBased()) {
      zIndex -= inc;
    } else {
      if (!series.planIsStacked()) {
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
  /** @type {Object.<string, number>} */
  this.lastEnabledAreaSeriesMap = {};
  var allSeries = this.getAllSeries();
  var series;
  for (var i = 0; i < allSeries.length; i++) {
    series = allSeries[i];
    if (series && series.enabled()) {
      // if (series.planIsStacked() && series.supportsMarkers()) {
      //   var inc = i * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
      //   series.markers().setAutoZIndex(anychart.core.CartesianBase.ZINDEX_MARKER + inc);
      // }

      if (series.isDiscreteBased()) {
        var iterator = series.getResetIterator();
        while (iterator.advance()) {
          this.setSeriesPointZIndex_(/** @type {anychart.core.series.Cartesian} */(series));
        }
      } else {
        this.lastEnabledAreaSeriesMap[series.getScalesPairIdentifier()] = i;
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

        if (series.planIsStacked() || this.zDistribution()) {
          barWidthRatio = 1 / (1 + /** @type {number} */(this.barGroupsPadding()));
        } else {
          barWidthRatio = 1 / (seriesCount + (seriesCount - 1) * this.barsPadding() + this.barGroupsPadding());
        }

        barWidthRatioOfTotalWidth = catWidthRatio * barWidthRatio;

        if (!series.planIsStacked() && this.zDistribution()) {
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
          wSeries.setAutoPointWidth(barWidthRatio);
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
          wSeries.setAutoPointWidth(barWidthRatio);
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.cartesian.series.Bar3d} instance for method chaining.
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.cartesian.series.Column3d} instance for method chaining.
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.cartesian.series.Area3d} instance for method chaining.
 */
anychart.charts.Cartesian3d.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.Cartesian3dSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var tag = anychart.utils.extractTag(e['target']);
  var series = tag && tag.series;
  if (series && !series.isDisposed() && series.enabled()) {
    return series.makeBrowserEvent(e);
  }
  return anychart.charts.Cartesian3d.base(this, 'makeBrowserEvent', e);
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
anychart.charts.Cartesian3d.prototype['zPadding'] = anychart.charts.Cartesian3d.prototype.zPadding;
anychart.charts.Cartesian3d.prototype['getStat'] = anychart.charts.Cartesian3d.prototype.getStat;
anychart.charts.Cartesian3d.prototype['zDepth'] = anychart.charts.Cartesian3d.prototype.zDepth; // deprecated
