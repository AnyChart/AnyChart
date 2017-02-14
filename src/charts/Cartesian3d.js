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
 */
anychart.charts.Cartesian3d = function() {
  anychart.charts.Cartesian3d.base(this, 'constructor');

  /**
   * @type {number}
   * @private
   */
  this.zDepthValue_ = 0;

  this.setType(anychart.enums.ChartTypes.CARTESIAN_3D);
};
goog.inherits(anychart.charts.Cartesian3d, anychart.core.CartesianBase);


/**
 * Dispatchs browser mouse events form series.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.charts.Cartesian3d.prototype.dispatchBrowserEventFromSeries = function(event) {
  var tag = anychart.utils.extractTag(event['domTarget']);

  if (tag && tag.series && tag.series.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
    if (!(prevTag && prevTag.series && prevTag.series == tag.series && prevTag.index == tag.index)) {
      var series = /** @type {anychart.core.series.Base} */(tag.series);
      if (series && !series.isDisposed() && series.enabled()) {
        var eventTarget = series.getParentEventTarget();
        series.setParentEventTarget(null);
        series.handleBrowserEvent(event.originalEvent);
        series.setParentEventTarget(eventTarget);
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.handleMouseOverAndMove = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.charts.Cartesian3d.base(this, 'handleMouseOverAndMove', event);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.handleMouseOut = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.charts.Cartesian3d.base(this, 'handleMouseOut', event);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.handleMouseDown = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.charts.Cartesian3d.base(this, 'handleMouseDown', event);
};


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.handleMouseEvent = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.charts.Cartesian3d.base(this, 'handleMouseEvent', event);
};


/**
 * Coloring post processor for Area 3D series.
 * @param {anychart.core.series.Base} series
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number|anychart.PointState} pointState
 */
anychart.charts.Cartesian3d.areaPostProcessor = function(series, shapes, pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var resolver = anychart.core.series.Base.getColorResolver(
      ['fill', 'hoverFill', 'selectFill'], anychart.enums.ColorType.FILL);
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

  shapes['bottom'].fill({'color': bottomFill, 'opacity': opacity});
  shapes['back'].fill({'color': backFill, 'opacity': opacity});
  shapes['left'].fill({'color': leftFill, 'opacity': opacity});
  shapes['right'].fill({'color': rightFill, 'opacity': opacity});
  shapes['top'].fill({'color': topFill, 'opacity': opacity});
  shapes['front'].fill(frontFill);

  // fix for batik (DVF-2068)
  shapes['top'].stroke({'color': topFill, 'thickness': 0.8});
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
      ['fill', 'hoverFill', 'selectFill'], anychart.enums.ColorType.FILL);
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
      'angle': (/** @type {boolean} */(series.getOption('isVertical'))) ? 0 : 90,
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

  shapes['bottom'].fill(/** @type {!acgraph.vector.Fill} */({'color': bottomFill, 'opacity': opacity}));
  shapes['back'].fill(/** @type {!acgraph.vector.Fill} */({'color': backFill, 'opacity': opacity}));
  shapes['left'].fill(/** @type {!acgraph.vector.Fill} */({'color': leftFill, 'opacity': opacity}));
  shapes['right'].fill(/** @type {!acgraph.vector.Fill} */({'color': rightFill, 'opacity': opacity}));
  shapes['top'].fill(/** @type {!acgraph.vector.Fill} */({'color': topFill, 'opacity': opacity}));
  shapes['front'].fill(/** @type {!acgraph.vector.Fill} */(frontFill));
};


/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
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
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.Cartesian3dSeriesType.BAR] = {
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
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
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
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Cartesian3d, anychart.charts.Cartesian3d.prototype.seriesConfig);


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
 * @param {boolean=} opt_isVertical If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian3d} Empty chart.
 */
anychart.cartesian3d = function(opt_isVertical) {
  var chart = new anychart.charts.Cartesian3d();
  chart.setupByVal(anychart.getFullTheme('cartesian3d'), true);
  if (goog.isDef(opt_isVertical))
    chart.barChartMode = !!opt_isVertical;

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN_3D] = anychart.cartesian3d;


/** @inheritDoc */
anychart.charts.Cartesian3d.prototype.isMode3d = true;


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
  var inc = seriesIndex * anychart.core.ChartWithSeries.ZINDEX_INCREMENT_MULTIPLIER;
  var iterator = series.getIterator();
  var value = anychart.utils.toNumber(iterator.get('value'));
  var zIndex = anychart.core.ChartWithSeries.ZINDEX_SERIES;

  if (value > 0) {
    if (/** @type {boolean} */(series.getOption('isVertical'))) {
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
    if (/** @type {boolean} */(series.getOption('isVertical'))) {
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

  var needAspectCalc = !goog.isDefAndNotNull(this.zDepthInternal) && anychart.utils.isPercent(this.zAspectInternal);
  var seriesCount = this.getSeriesCount();

  var angleRad = goog.math.toRadians(this.zAngleInternal);
  var secondAngle = 90 - this.zAngleInternal;
  var secondAngleRad = goog.math.toRadians(secondAngle);

  var zPaddingValue = this.zPaddingInternal;

  if (needAspectCalc) {
    var aspectRatio = parseFloat(this.zAspectInternal) / 100;
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
    if (goog.isDefAndNotNull(this.zDepthInternal)) {
      this.zDepthValue_ = this.zDepthInternal;

    // not needAspectCalc
    } else {
      if (!this.hasStackedSeries && this.zDistribution()) {
        this.zDepthValue_ = this.zAspectInternal * seriesCount + this.zPaddingInternal * (seriesCount - 1);
      } else {
        this.zDepthValue_ = anychart.utils.toNumber(this.zAspectInternal);
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
anychart.charts.Cartesian3d.prototype.distributeClusters = function(numClusters, drawingPlansOfScale, horizontal) {
  var wSeries;

  if (!this.hasStackedSeries && this.zDistribution()) {
    if (numClusters > 0) {
      numClusters = 1 + /** @type {number} */(this.barGroupsPadding());
      var barWidthRatio = 1 / numClusters;
      for (var i = 0; i < drawingPlansOfScale.length; i++) {
        wSeries = drawingPlansOfScale[i].series;
        if (wSeries.isWidthDistributed() && (horizontal ^ /** @type {boolean} */(wSeries.getOption('isVertical')))) {
          wSeries.setAutoXPointPosition(0.5);
          wSeries.setAutoPointWidth(barWidthRatio);
        }
      }
    }
  } else {
    anychart.charts.Cartesian3d.base(this, 'distributeClusters', numClusters, drawingPlansOfScale, horizontal);
  }
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
anychart.charts.Cartesian3d.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Cartesian3d.base(this, 'setupByJSON', config, opt_default);

  this.zAngle(config['zAngle']);
  if (goog.isDef(config['zDepth'])) this.zDepth(config['zDepth']);
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
  if (goog.isDefAndNotNull(this.zDepthInternal)) {
    // we should not place warning here on serialization.
    json['chart']['zDepth'] = this.zDepthInternal;
  }
  json['chart']['zAspect'] = this.zAspect();
  json['chart']['zDistribution'] = this.zDistribution();
  json['chart']['zPadding'] = this.zPadding();

  return json;
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.charts.Cartesian3d.prototype;
  goog.exportSymbol('anychart.cartesian3d', anychart.cartesian3d);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['barsPadding'] = proto.barsPadding;
  proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['grid'] = proto.grid;
  proto['minorGrid'] = proto.minorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;
  proto['getSeries'] = proto.getSeries;
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['column'] = proto.column;
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
  proto['zAspect'] = proto.zAspect;
  proto['zAngle'] = proto.zAngle;
  proto['zDistribution'] = proto.zDistribution;
  proto['zPadding'] = proto.zPadding;
  proto['getStat'] = proto.getStat;
  proto['zDepth'] = proto.zDepth; // deprecated
})();
