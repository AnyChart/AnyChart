var chart, series;
anychart.onDocumentReady(function() {
  // data
  // var data = anychart.data.set([
  //   [Date.UTC(2010, 0, 01), 10000],
  //   [Date.UTC(2010, 1, 01), 12000],
  //   [Date.UTC(2010, 2, 01), 18000],
  //   [Date.UTC(2010, 3, 01), 11000],
  //   [Date.UTC(2010, 4, 01), 9000],
  //   [Date.UTC(2010, 5, 01), 12000],
  //   [Date.UTC(2010, 6, 01), 15000],
  //   [Date.UTC(2010, 7, 01), 16000],
  //   [Date.UTC(2010, 8, 01), 13000],
  //   [Date.UTC(2010, 9, 01), 19000],
  //   [Date.UTC(2010, 10, 01), 12000],
  //   [Date.UTC(2010, 11, 01), 14000],
  //   [Date.UTC(2010, 11, 31), 13000]
  // ]);

  var data = anychart.data.set([
    [0, 10000],
    [1, 12000],
    [2, 18000]
  ]);

  var dataSet = anychart.data.set();
  dataSet.mapAs()

  // var dataTable = anychart.data.table();
  // dataTable.addData(get_ixic_daily_short_data());

// map loaded data for the ohlc series
  var mapping = dataTable.mapAs();
  mapping.addField('x', 0);
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');

  console.log(mapping);

  // chart type
  chart = anychart.financial(mapping);
  // series = chart.line(data);

  // draw
  chart.container("container");
  chart.draw();
});