/**
 * @fileoverview anychart.cartesianModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.cartesian3dModule.entry');

goog.require('anychart.cartesian3dModule.Chart');
goog.require('anychart.cartesian3dModule.drawers.Area');
goog.require('anychart.cartesian3dModule.drawers.Column');


/**
 * Default area 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.cartesian3dModule.Chart} Chart with defaults for area series.
 */
anychart.area3d = function(var_args) {
  var chart = new anychart.cartesian3dModule.Chart();
  chart.addThemes('area3d');
  chart.setType(anychart.enums.ChartTypes.AREA_3D);
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.AREA);
  chart.setupStateSettings();
  chart.setupAxes();
  chart.setupGrids();

  if (arguments.length)
    chart.addSeries.apply(chart, arguments);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.AREA_3D] = anychart.area3d;


/**
 * Default bar 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bar3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.cartesian3dModule.Chart} Chart with defaults for bar series.
 */
anychart.bar3d = function(var_args) {
  var chart = new anychart.cartesian3dModule.Chart();
  chart.addThemes('bar', 'bar3d');
  chart.setType(anychart.enums.ChartTypes.BAR_3D);
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.BAR);

  chart.setupStateSettings();
  chart.setupAxes();
  chart.setupGrids();

  if (arguments.length)
    chart.addSeries.apply(chart, arguments);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.BAR_3D] = anychart.bar3d;


/**
 * Default column 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.cartesian3dModule.Chart} Chart with defaults for column series.
 */
anychart.column3d = function(var_args) {
  var chart = new anychart.cartesian3dModule.Chart();
  chart.addThemes('column', 'column3d');
  chart.setType(anychart.enums.ChartTypes.COLUMN_3D);
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.COLUMN);
  chart.setupStateSettings();
  chart.setupAxes();
  chart.setupGrids();

  if (arguments.length)
    chart.addSeries.apply(chart, arguments);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN_3D] = anychart.column3d;


/**
 * Default line 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.line3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.cartesian3dModule.Chart} Chart with defaults for line series.
 */
anychart.line3d = function(var_args) {
  var chart = new anychart.cartesian3dModule.Chart();
  chart.addThemes('line3d');
  chart.setType(anychart.enums.ChartTypes.LINE_3D);
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.LINE);
  chart.setupStateSettings();
  chart.setupAxes();
  chart.setupGrids();

  if (arguments.length)
    chart.addSeries.apply(chart, arguments);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.LINE_3D] = anychart.line3d;


//exports
goog.exportSymbol('anychart.area3d', anychart.area3d);
goog.exportSymbol('anychart.bar3d', anychart.bar3d);
goog.exportSymbol('anychart.column3d', anychart.column3d);
goog.exportSymbol('anychart.line3d', anychart.line3d);
