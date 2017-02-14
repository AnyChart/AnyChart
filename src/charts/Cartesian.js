goog.provide('anychart.charts.Cartesian');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.series');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');



/**
 * Cartesian chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.cartesian}</li>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.charts.Cartesian = function() {
  anychart.charts.Cartesian.base(this, 'constructor');
};
goog.inherits(anychart.charts.Cartesian, anychart.core.CartesianBase);


/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Cartesian.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BOX] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BOX,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathMedianStrokeConfig,
      anychart.core.shapeManagers.pathStemStrokeConfig,
      anychart.core.shapeManagers.pathWhiskerStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'highest',
    anchoredPositionBottom: 'lowest'
  };
  res[anychart.enums.CartesianSeriesType.BUBBLE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BUBBLE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.circleFillStrokeConfig,
      anychart.core.shapeManagers.circleHatchConfig,
      anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
      anychart.core.shapeManagers.circleNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: (
        anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
        anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
        anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.STICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Cartesian, anychart.charts.Cartesian.prototype.seriesConfig);


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @param {boolean=} opt_isVertical If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian} Empty chart.
 */
anychart.cartesian = function(opt_isVertical) {
  var chart = new anychart.charts.Cartesian();
  chart.setupByVal(anychart.getFullTheme('cartesian'), true);
  if (goog.isDef(opt_isVertical))
    chart.barChartMode = !!opt_isVertical;
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN] = anychart.cartesian;


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.charts.Cartesian.prototype;
  goog.exportSymbol('anychart.cartesian', anychart.cartesian);
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['barsPadding'] = proto.barsPadding;
  proto['barGroupsPadding'] = proto.barGroupsPadding;
  proto['crosshair'] = proto.crosshair;
  proto['maxBubbleSize'] = proto.maxBubbleSize;
  proto['minBubbleSize'] = proto.minBubbleSize;
  proto['grid'] = proto.grid;
  proto['minorGrid'] = proto.minorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['box'] = proto.box;
  // proto['bubble'] = proto.bubble;
  // proto['candlestick'] = proto.candlestick;
  // proto['column'] = proto.column;
  // proto['line'] = proto.line;
  // proto['marker'] = proto.marker;
  // proto['ohlc'] = proto.ohlc;
  // proto['rangeArea'] = proto.rangeArea;
  // proto['rangeBar'] = proto.rangeBar;
  // proto['rangeColumn'] = proto.rangeColumn;
  // proto['rangeSplineArea'] = proto.rangeSplineArea;
  // proto['rangeStepArea'] = proto.rangeStepArea;
  // proto['spline'] = proto.spline;
  // proto['splineArea'] = proto.splineArea;
  // proto['stepLine'] = proto.stepLine;
  // proto['stepArea'] = proto.stepArea;
  // proto['stick'] = proto.stick;
  // proto['jumpLine'] = proto.jumpLine;
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
  proto['annotations'] = proto.annotations;
})();
