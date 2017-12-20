/**
 * @fileoverview anychart.cartesian3dModule.Chart class.
 * @suppress {extraRequire}
 */
goog.provide('anychart.cartesian3dModule.Chart');
goog.require('anychart.cartesian3dModule.Grid');
goog.require('anychart.cartesian3dModule.axisMarkers.Line');
goog.require('anychart.cartesian3dModule.axisMarkers.Range');
goog.require('anychart.cartesian3dModule.axisMarkers.Text');
goog.require('anychart.cartesian3dModule.drawers.Area');
goog.require('anychart.cartesian3dModule.drawers.Column');
goog.require('anychart.cartesian3dModule.drawers.Line');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.I3DProvider');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('goog.array');
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
anychart.cartesian3dModule.Chart = function() {
  anychart.cartesian3dModule.Chart.base(this, 'constructor');

  /**
   * @type {number}
   * @private
   */
  this.zDepthValue_ = 0;

  this.setType(anychart.enums.ChartTypes.CARTESIAN_3D);
};
goog.inherits(anychart.cartesian3dModule.Chart, anychart.core.CartesianBase);


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.cartesian3dModule.Chart.ZINDEX_2D_LINE_SERIES = 32;


/**
 * Dispatchs browser mouse events form series.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.cartesian3dModule.Chart.prototype.dispatchBrowserEventFromSeries = function(event) {
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
anychart.cartesian3dModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.cartesian3dModule.Chart.base(this, 'handleMouseOverAndMove', event);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.handleMouseOut = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.cartesian3dModule.Chart.base(this, 'handleMouseOut', event);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.handleMouseDown = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.cartesian3dModule.Chart.base(this, 'handleMouseDown', event);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.handleMouseEvent = function(event) {
  this.dispatchBrowserEventFromSeries(event);

  anychart.cartesian3dModule.Chart.base(this, 'handleMouseEvent', event);
};


/**
 * Coloring post processor for Area 3D series.
 * @param {anychart.core.series.Base} series
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number|anychart.PointState} pointState
 */
anychart.cartesian3dModule.Chart.areaPostProcessor = function(series, shapes, pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var resolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
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
anychart.cartesian3dModule.Chart.barColumnPostProcessor = function(series, shapes, pointState) {
  var frontFill, topFill, rightFill, bottomFill, backFill, leftFill;
  var resolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, true);
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
 * Coloring post processor for Line 3D series.
 * @param {anychart.core.series.Base} series
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number|anychart.PointState} pointState
 */
anychart.cartesian3dModule.Chart.linePostProcessor = function(series, shapes, pointState) {
  var pathStroke;
  var resolver = anychart.color.getColorResolver(
      'fill', anychart.enums.ColorType.FILL, true);
  var stroke = resolver(series, pointState);
  var opacity = goog.isObject(stroke) ? stroke['opacity'] : 1;
  var color = goog.isObject(stroke) ? stroke['color'] : stroke;
  var parsedColor = anychart.color.parseColor(color);

  if (goog.isNull(parsedColor)) {
    pathStroke = 'none';
  } else {
    color = parsedColor.hex;
    var rgbColor = goog.color.hexToRgb(color);
    var rgbDarken03 = goog.color.darken(rgbColor, .3);
    var darkBlendedColor2 = goog.color.rgbArrayToHex(goog.color.blend(rgbColor, rgbDarken03, .7));

    pathStroke = /** @type {string} */(anychart.color.lighten(darkBlendedColor2, .2));
  }

  shapes['path']
      .fill({
        'color': pathStroke,
        'opacity': opacity
      })
      // fix for batik (DVF-2068)
      .stroke({
        'color': pathStroke,
        'thickness': 0.8
      });
};



/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.cartesian3dModule.Chart.prototype.seriesConfig = (function() {
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
    postProcessor: anychart.cartesian3dModule.Chart.areaPostProcessor,
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
    postProcessor: anychart.cartesian3dModule.Chart.barColumnPostProcessor,
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
    postProcessor: anychart.cartesian3dModule.Chart.barColumnPostProcessor,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.Cartesian3dSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE_3D,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathLine3DConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: anychart.cartesian3dModule.Chart.linePostProcessor,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.Cartesian3dSeriesType.LINE_2D] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeTopZIndexConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities | anychart.core.series.Capabilities.ALLOW_ERROR,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.cartesian3dModule.Chart, anychart.cartesian3dModule.Chart.prototype.seriesConfig);


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
 * @return {!anychart.cartesian3dModule.Chart} Empty chart.
 */
anychart.cartesian3d = function() {
  var chart = new anychart.cartesian3dModule.Chart();
  chart.setupInternal(true, anychart.getFullTheme('cartesian3d'));
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN_3D] = anychart.cartesian3d;


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.normalizeCartesian3dSeriesType(type);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.isMode3d = function() {
  return true;
};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.cartesian3dModule.Chart.prototype.getX3DDistributionShift = function(seriesIndex, seriesIsStacked) {
  var x3dShift;
  if (seriesIsStacked || !this.getOption('zDistribution')) {
    x3dShift = 0;
  } else {
    var seriesCount = this.get3DSeriesCount_();
    seriesIndex = this.get3DSeriesIndex_(seriesIndex);
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
anychart.cartesian3dModule.Chart.prototype.getY3DDistributionShift = function(seriesIndex, seriesIsStacked) {
  var y3dShift;
  if (seriesIsStacked || !this.getOption('zDistribution')) {
    y3dShift = 0;
  } else {
    var seriesCount = this.get3DSeriesCount_();
    seriesIndex = this.get3DSeriesIndex_(seriesIndex);
    var drawIndex = seriesCount - seriesIndex - 1;
    y3dShift = (this.getY3DShift(seriesIsStacked) + this.zPaddingYShift) * drawIndex;
  }
  return y3dShift;
};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.cartesian3dModule.Chart.prototype.getX3DShift = function(seriesIsStacked) {
  var seriesCount = this.get3DSeriesCount_();
  var zPaddingShift = this.zPaddingXShift;
  var seriesShift = this.x3dShift;
  if (!seriesIsStacked && this.getOption('zDistribution')) {
    seriesShift = (seriesShift - zPaddingShift * (seriesCount - 1)) / seriesCount;
  }
  return seriesShift;
};


/**
 * @param {boolean} seriesIsStacked
 * @return {number}
 */
anychart.cartesian3dModule.Chart.prototype.getY3DShift = function(seriesIsStacked) {
  var seriesCount = this.get3DSeriesCount_();
  var zPaddingShift = this.zPaddingYShift;
  var seriesShift = this.y3dShift;
  if (!seriesIsStacked && this.getOption('zDistribution')) {
    seriesShift = (seriesShift - zPaddingShift * (seriesCount - 1)) / seriesCount;
  }
  return seriesShift;
};


/**
 * @return {number}
 */
anychart.cartesian3dModule.Chart.prototype.getX3DFullShift = function() {
  return this.x3dShift;
};


/**
 * @return {number}
 */
anychart.cartesian3dModule.Chart.prototype.getY3DFullShift = function() {
  return this.y3dShift;
};


/**
 * @param {number} seriesIndex
 * @param {boolean} seriesIsStacked
 * @param {string} scalesIds
 * @return {boolean}
 */
anychart.cartesian3dModule.Chart.prototype.shouldDrawTopSide = function(seriesIndex, seriesIsStacked, scalesIds) {
  return !seriesIsStacked || seriesIndex == this.lastEnabledAreaSeriesMap[scalesIds];
};


/**
 * @return {boolean}
 */
anychart.cartesian3dModule.Chart.prototype.yInverted = function() {
  return /** @type {boolean} */(this.yScale().inverted());
};


/**
 * @return {boolean}
 */
anychart.cartesian3dModule.Chart.prototype.xInverted = function() {
  return /** @type {boolean} */(this.xScale().inverted());
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.createGridInstance = function() {
  return new anychart.cartesian3dModule.Grid();
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.createLineMarkerInstance = function() {
  var axisMarker = new anychart.cartesian3dModule.axisMarkers.Line();
  axisMarker.setChart(this);
  return axisMarker;
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.createRangeMarkerInstance = function() {
  var axisMarker = new anychart.cartesian3dModule.axisMarkers.Range();
  axisMarker.setChart(this);
  return axisMarker;
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.createTextMarkerInstance = function() {
  var axisMarker = new anychart.cartesian3dModule.axisMarkers.Text();
  axisMarker.setChart(this);
  return axisMarker;
};


/**
 * Set zIndex for point.
 * @param {anychart.core.series.Cartesian} series
 * @param {number} directIndex
 * @private
 */
anychart.cartesian3dModule.Chart.prototype.setSeriesPointZIndex_ = function(series, directIndex) {
  var iterator = series.getIterator();
  var inc = directIndex * anychart.core.series.Base.ZINDEX_INCREMENT_MULTIPLIER;
  var value = anychart.utils.toNumber(iterator.get('value'));
  var zIndex = anychart.core.ChartWithSeries.ZINDEX_SERIES;
  var yMult = this.yScale().inverted() ? -1 : 1;
  var xMult = this.xScale().inverted() ? 1 : -1;


  if (value >= 0) {
    if (/** @type {boolean} */(series.getOption('isVertical'))) {
      if (!series.planIsStacked()) {
        if (this.getOption('zDistribution')) {
          zIndex += inc;
        } else {
          zIndex -= (inc * xMult * yMult);
        }
      } else {
        zIndex += (inc * yMult);
      }
    } else {
      zIndex += (inc * yMult);
    }

  } else if (value < 0) {
    if (/** @type {boolean} */(series.getOption('isVertical'))) {
      zIndex -= (inc * xMult * yMult);
    } else {
      if (!series.planIsStacked()) {
        zIndex += inc;
      } else {
        zIndex -= (inc * yMult);
      }
    }
  }

  iterator.meta('zIndex', zIndex);
  iterator.meta('directIndex', directIndex);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.prepare3d = function() {
  /** @type {Object.<string, number>} */
  this.lastEnabledAreaSeriesMap = {};
  var allSeries = this.getAllSeries();
  var series;
  var isStacked = /** @type {anychart.enums.ScaleStackMode} */ (this.yScale().stackMode()) != anychart.enums.ScaleStackMode.NONE;
  var stackDirection = /** @type {anychart.enums.ScaleStackDirection} */ (this.yScale().stackDirection());
  var stackIsDirect = stackDirection == anychart.enums.ScaleStackDirection.DIRECT;

  for (var i = 0; i < allSeries.length; i++) {
    var directIndex = allSeries.length - i - 1;
    var actualIndex = isStacked && stackIsDirect ? directIndex : i;
    series = allSeries[actualIndex];
    if (series && series.enabled()) {
      if (series.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
        if (series.isDiscreteBased()) {
          var iterator = series.getResetIterator();
          while (iterator.advance()) {
            this.setSeriesPointZIndex_(/** @type {anychart.core.series.Cartesian} */(series), i);
          }
        } else if (series.supportsStack()) {
          this.lastEnabledAreaSeriesMap[series.getScalesPairIdentifier()] = actualIndex;
        }
      } else {
        series.setAutoZIndex(series.autoIndex() * anychart.core.series.Base.ZINDEX_INCREMENT_MULTIPLIER + anychart.cartesian3dModule.Chart.ZINDEX_2D_LINE_SERIES);
      }
    }
  }
};


/**
 * @return {number}
 * @private
 */
anychart.cartesian3dModule.Chart.prototype.get3DSeriesCount_ = function() {
  return goog.array.count(this.seriesList, function(series) {
    return !!(series && series.enabled() && series.check(anychart.core.drawers.Capabilities.IS_3D_BASED));
  });
};


/**
 * @param {number} index
 * @return {number}
 * @private
 */
anychart.cartesian3dModule.Chart.prototype.get3DSeriesIndex_ = function(index) {
  var res = 0;
  for (var i = 0, len = Math.min(this.seriesList.length - 1, index); i <= len; i++) {
    var series = this.seriesList[i];
    if (series && series.enabled() && series.check(anychart.core.drawers.Capabilities.IS_3D_BASED))
      res++;
  }
  return res - 1;
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.getContentAreaBounds = function(bounds) {
  var contentAreaBounds = bounds.clone().round();
  var boundsWithoutAxes = this.getBoundsWithoutAxes(contentAreaBounds);
  var seriesCount = this.get3DSeriesCount_();

  var zAngle = /** @type {number} */ (this.getOption('zAngle'));
  var zAspect = /** @type {number} */ (this.getOption('zAspect'));
  var zPadding = /** @type {number} */ (this.getOption('zPadding'));
  var zDistribution = /** @type {number} */ (this.getOption('zDistribution'));

  var angleRad = goog.math.toRadians(zAngle);
  var secondAngle = 90 - zAngle;
  var secondAngleRad = goog.math.toRadians(secondAngle);

  if (anychart.utils.isPercent(zAspect)) {
    var aspectRatio = parseFloat(zAspect) / 100;
    var xAspectRatio = aspectRatio * Math.sin(secondAngleRad);
    var yAspectRatio = aspectRatio * Math.sin(angleRad);
    var x3dShiftRatio = 0;
    var y3dShiftRatio = 0;

    var allSeries = this.getAllSeries();
    var series;
    for (var i = 0; i < allSeries.length; i++) {
      series = allSeries[i];
      if (series && series.enabled() && series.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
        var xScale = series.xScale();
        var catCount = xScale.getType() == anychart.enums.ScaleTypes.ORDINAL ? xScale.values().length : series.getIterator().getRowsCount();
        var catWidthRatio = 1 / catCount;
        var barWidthRatio;
        var barWidthRatioOfTotalWidth;

        var barsPadding = /** @type {number} */ (this.getOption('barsPadding'));
        var barGroupsPadding = /** @type {number} */ (this.getOption('barGroupsPadding'));
        if (series.planIsStacked() || zDistribution) {
          barWidthRatio = 1 / (1 + barGroupsPadding);
        } else {
          barWidthRatio = 1 / (seriesCount + (seriesCount - 1) * barsPadding + barGroupsPadding);
        }

        barWidthRatioOfTotalWidth = catWidthRatio * barWidthRatio;

        if (!series.planIsStacked() && zDistribution) {
          x3dShiftRatio += barWidthRatioOfTotalWidth * xAspectRatio;
          y3dShiftRatio += barWidthRatioOfTotalWidth * yAspectRatio;
        } else if (!x3dShiftRatio) {
          x3dShiftRatio = barWidthRatioOfTotalWidth * xAspectRatio;
          y3dShiftRatio = barWidthRatioOfTotalWidth * yAspectRatio;
        }
      }
    }

    this.zPaddingXShift = Math.round(zPadding * Math.sin(secondAngleRad));
    this.zPaddingYShift = Math.round(zPadding * Math.sin(angleRad));

    var axisBoundsWidth = this.isVerticalInternal ?
        boundsWithoutAxes.height / (1 + x3dShiftRatio) :
        boundsWithoutAxes.width / (1 + x3dShiftRatio);

    this.x3dShift = axisBoundsWidth * x3dShiftRatio;
    this.y3dShift = axisBoundsWidth * y3dShiftRatio;
    if (!this.hasStackedSeries && zDistribution) {
      this.x3dShift += this.zPaddingXShift * (seriesCount - 1);
      this.y3dShift += this.zPaddingYShift * (seriesCount - 1);
    }
    // Accuracy!
    this.x3dShift = Math.round(this.x3dShift);
    this.y3dShift = Math.round(this.y3dShift);

  } else {
    if (!this.hasStackedSeries && zDistribution) {
      this.zDepthValue_ = zAspect * seriesCount + zPadding * (seriesCount - 1);
    } else {
      this.zDepthValue_ = anychart.utils.toNumber(zAspect);
    }

    this.x3dShift = Math.round(this.zDepthValue_ * Math.sin(secondAngleRad));
    this.y3dShift = Math.round(this.zDepthValue_ * Math.sin(angleRad));

    // zPadding * (seriesCount - 1) must be less than zDepth.
    var zPaddingCount = seriesCount - 1;
    if (zPadding * zPaddingCount >= this.zDepthValue_) {
      zPadding = (this.zDepthValue_ - seriesCount) / zPaddingCount;
    }

    this.zPaddingXShift = Math.round(zPadding * Math.sin(secondAngleRad));
    this.zPaddingYShift = Math.round(zPadding * Math.sin(angleRad));
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
anychart.cartesian3dModule.Chart.prototype.distributeClusters = function(numClusters, drawingPlansOfScale, horizontal) {
  var wSeries;

  if (!this.hasStackedSeries && /** @type {boolean} */ (this.getOption('zDistribution'))) {
    if (numClusters > 0) {
      numClusters = 1 + /** @type {number} */(this.getOption('barGroupsPadding'));
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
    anychart.cartesian3dModule.Chart.base(this, 'distributeClusters', numClusters, drawingPlansOfScale, horizontal);
  }
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var tag = anychart.utils.extractTag(e['target']);
  var series = tag && tag.series;
  if (series && !series.isDisposed() && series.enabled()) {
    return series.makeBrowserEvent(e);
  }
  return anychart.cartesian3dModule.Chart.base(this, 'makeBrowserEvent', e);
};


/** @inheritDoc */
anychart.cartesian3dModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.cartesian3dModule.Chart.base(this, 'setupByJSON', config, opt_default);
};


//exports
(function() {
  var proto = anychart.cartesian3dModule.Chart.prototype;
  goog.exportSymbol('anychart.cartesian3d', anychart.cartesian3d);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  // auto generated from ChartWithOrthogonalScales
  // proto['barsPadding'] = proto.barsPadding;
  // proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xMinorGrid'] = proto.xMinorGrid;
  proto['yMinorGrid'] = proto.yMinorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['column'] = proto.column;
  // proto['line'] = proto.line;
  // proto['line2d'] = proto.line2d;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['xZoom'] = proto.xZoom;
  proto['xScroller'] = proto.xScroller;
  //proto['zAspect'] = proto.zAspect;
  //proto['zAngle'] = proto.zAngle;
  //proto['zDistribution'] = proto.zDistribution;
  //proto['zPadding'] = proto.zPadding;
  proto['getStat'] = proto.getStat;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
})();
