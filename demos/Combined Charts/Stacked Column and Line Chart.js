anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 96.5, 2040, 1200, 1600],
    ['P2', 77.1, 1794, 1124, 1724],
    ['P3', 73.2, 2026, 1006, 1806],
    ['P4', 61.1, 2341, 921, 1621],
    ['P5', 70.0, 1800, 1500, 1700],
    ['P6', 60.7, 1507, 1007, 1907],
    ['P7', 62.1, 2701, 921, 1821],
    ['P8', 75.1, 1671, 971, 1671],
    ['P9', 80.0, 1980, 1080, 1880],
    ['P10', 54.1, 1041, 1041, 1641],
    ['P11', 51.3, 813, 1113, 1913],
    ['P12', 59.1, 691, 1091, 1691]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create column chart
  var chart = anychart.columnChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Combination of Stacked Column and Line Chart (Dual Y-Axis)');

  //force chart scale to stuck series values
  chart.yScale().stackMode('value');

  //create scale for line series and extraYAxis
  //it force line series to not stuck with over series
  var scale = new anychart.scales.Linear();
  scale.minimum(0);
  scale.maximum(100);
  scale.ticks().interval(10);

  //create line series and set scale for it
  var lineSeries = chart.line(seriesData_1);
  lineSeries.yScale(scale);

  //create extra axis on the right side of chart
  //and set scale for it
  var extraYAxis = chart.yAxis();
  extraYAxis.title('Secondary Y-Axis');
  extraYAxis.orientation('right');
  extraYAxis.scale(scale);

  //setup axis to append '%' symbol to label values
  extraYAxis.labels().textFormatter(function(info) {
    return info.value + '%';
  });

  //create second series with mapped data
  chart.column(seriesData_2);

  //create third series with mapped data
  chart.column(seriesData_3);

  //create fourth series with mapped data
  chart.column(seriesData_4);

  //initiate chart drawing
  chart.draw();
});
