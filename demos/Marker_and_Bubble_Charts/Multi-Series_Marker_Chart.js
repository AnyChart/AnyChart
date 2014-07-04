anychart.onDocumentReady(function() {
  //create chart
  var chart = new anychart.cartesian.Chart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Multi-Series Marker Chart');

  //create chart X axis with default settings
  chart.xAxis();

  //create chart Y axis with default settings
  chart.yAxis();

  //create horizontal chart grid
  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  //create vertical chart grid
  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  //create vertical minor chart grid
  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.VERTICAL);

  //create marker series
  chart.marker([
    ['P1', 142],
    ['P2', 134],
    ['P3', 156],
    ['P4', 122],
    ['P5', 148]
  ]);

  //create marker series
  chart.marker([
    ['P1', 13],
    ['P2', 25],
    ['P3', 76],
    ['P4', 86],
    ['P5', 95]
  ]);

  //create marker series
  chart.marker([
    ['P1', 75],
    ['P2', 56],
    ['P3', 67],
    ['P4', 42],
    ['P5', 17]
  ]);

  //create marker series
  chart.marker([
    ['P1', 13],
    ['P2', 29],
    ['P3', 26],
    ['P4', 39],
    ['P5', 17]
  ]);

  //initiate chart drawing
  chart.draw();
});
