anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['P1', 174, 5854, 3242, 162],
    ['P2', 197, 4171, 3171, 134],
    ['P3', 155, 1375, 700, 116],
    ['P4', 15, 1875, 1287, 122],
    ['P5', 66, 2246, 1856, 178],
    ['P6', 85, 2696, 1126, 100],
    ['P7', 37, 1287, 987, 125],
    ['P8', 10, 2140, 1610, 176],
    ['P9', 44, 1603, 903, 111],
    ['P10', 322, 1628, 928, 134]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // create column chart
  chart = anychart.column();

  // turn on chart animation
  chart.animation(true);

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  chart.title('Combination of Column, Spline-Area and Spline Chart');

  // create scale for line series and extraYAxis
  // it force line series to not stuck values with over series
  var scale = anychart.scales.linear();

  // create extra axis on the right side of chart
  var extraYAxis = chart.yAxis(1);
  extraYAxis.title('Secondary Y-Axis');
  extraYAxis.orientation('right');
  extraYAxis.scale(scale);

  // create second series with mapped data
  chart.column(seriesData_2);

  // create third series with mapped data
  var splineArea = chart.splineArea(seriesData_3);

  // create line series and set scale for it
  var lineSeries = chart.spline(seriesData_1);
  lineSeries.yScale(scale);
  lineSeries.stroke('2.5 #ef6c00');

  // initiate chart drawing
  chart.draw();
});