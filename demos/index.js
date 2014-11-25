var chart;
anychart.onDocumentLoad(function() {
  anychart.licenseKey('test-key-32db1f79-cc9312c4');
  //create chart
  chart = anychart.cartesianChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Multi-Series Bubble Chart');

  //create chart X axis with default settings
  chart.xAxis();

  //create chart Y axis with default settings
  chart.yAxis();

  //create horizontal chart grid
  chart.grid().layout('horizontal');

  //create vertical chart grid
  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .layout('vertical');

  //create vertical minor chart grid
  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .layout('vertical');

  //create marker series
  chart.bubble([
    ['P1', 142, 7],
    ['P2', 134, 20],
    ['P3', 156, 12],
    ['P4', 122, 18],
    ['P5', 148, 23]
  ]);

  //create marker series
  chart.bubble([
    ['P1', 13, 11],
    ['P2', 25, 5],
    ['P3', 76, 19],
    ['P4', 86, 2],
    ['P5', 95, 24]
  ]);

  //create marker series
  chart.bubble([
    ['P1', 75, 4],
    ['P2', 56, 7],
    ['P3', 67, 14],
    ['P4', 42, 18],
    ['P5', 17, 4]
  ]);

  //create marker series
  chart.bubble([
    ['P1', 13, 4],
    ['P2', 29, 4],
    ['P3', 26, 4],
    ['P4', 39, 4],
    ['P5', 17, 4]
  ]);

  //initiate chart drawing
  chart.draw();
});