/**
 * @fileoverview anychart.modules.area3d namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.area3d');

goog.require('anychart.charts.Cartesian3d');
goog.require('anychart.core.drawers.Area3d');
goog.require('anychart.modules.base');


/**
 * Default area 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.charts.Cartesian3d} Chart with defaults for area series.
 */
anychart.area3d = function(var_args) {
  var chart = new anychart.charts.Cartesian3d();

  chart.defaultSeriesType(anychart.enums.Cartesian3dSeriesType.AREA);
  chart.setType(anychart.enums.ChartTypes.AREA_3D);

  chart.setupByVal(anychart.getFullTheme('area3d'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['area'](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.AREA_3D] = anychart.area3d;

//exports
goog.exportSymbol('anychart.area3d', anychart.area3d);
