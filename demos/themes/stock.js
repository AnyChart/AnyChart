function create_column_stock() {
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());
  var mapping = dataTable.mapAs();
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('value', 1, 'column');

  var scrollMapping = dataTable.mapAs();
  scrollMapping.addField('value', 5);

  var chart = anychart.stock();
  var plot1 = chart.plot(0);
  plot1.column(mapping);

  var plot2 = chart.plot(2);
  plot2.rangeColumn(mapping);
  chart.scroller().column(scrollMapping);
  chart.selectRange('2007-04-01', '2008-08-28');
  return chart;
}
function create_line_stock() {
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());
  var dataSet1 = dataTable.mapAs({'value': 2});
  var dataSet2 = dataTable.mapAs({'value': 3});
  var dataSet3 = dataTable.mapAs({'value': 4});
  var scrollMapping = dataTable.mapAs();
  scrollMapping.addField('value', 5);

  var chart = anychart.stock();
  chart.title().enabled(true).text('Stock with grids and x-axis background');
  var plot1 = chart.plot(0);
  plot1.xAxis().background().enabled(true);
  plot1.grid().enabled(true);
  plot1.minorGrid().enabled(true);

  plot1.marker(dataSet1);
  plot1.line(dataSet2);

  var plot2 = chart.plot(2);
  plot2.spline(dataSet3);
  plot2.xAxis().background().enabled(true);
  plot2.grid().enabled(true);
  plot2.minorGrid().enabled(true);
  chart.scroller().line(scrollMapping);
  chart.selectRange('2007-04-01', '2008-08-28');
  return chart;
}
function create_ohlc_stock() {
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());
  var mapping = dataTable.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');

  var scrollMapping = dataTable.mapAs();
  scrollMapping.addField('value', 5);

  var chart = anychart.stock();
  var plot1 = chart.plot(0);
  plot1.ohlc(mapping);

  var plot2 = chart.plot(2);
  plot2.candlestick(mapping);
  chart.scroller().candlestick(mapping);
  chart.selectRange('2007-04-01', '2008-08-28');
  return chart;
}
function create_area_stock() {
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());
  var mapping = dataTable.mapAs();
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('value', 1, 'column');

  var scrollMapping = dataTable.mapAs();
  scrollMapping.addField('value', 5);

  var chart = anychart.stock();
  var plot1 = chart.plot(0);
  plot1.area(mapping);

  var plot2 = chart.plot(2);
  plot2.rangeArea(mapping);

  var plot3 = chart.plot(3);
  plot3.stepArea(mapping);

  chart.scroller().stepArea(scrollMapping);
  chart.selectRange('2007-04-01', '2008-08-28');
  return chart;
}