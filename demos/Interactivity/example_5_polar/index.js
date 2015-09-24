var chart, stage;

anychart.onDocumentReady(function() {
  var data = [
    [0, 0],
    [10, 1],
    [20, 2],
    [30, 3],
    [40, 4],
    [50, 5],
    [60, 6],
    [70, 7],
    [80, 8],
    [90, 9],
    [100, 10]
  ];

  // create polar chart
  chart = anychart.polar();

  // set container id for the chart
  chart.container('container');

  // set chart yScale settings
  chart.yScale().ticks().interval(2);

  // set chart xScale settings
  chart.xScale().maximum(100);
  chart.xScale().ticks().interval(10);

  // set xAxis labels settings
  chart.xAxis().labels()
      .textFormatter(function() {return this['value'] + '.00'});

  // disable chart title
  chart.title(false);

  // create line series
  //var series1 = chart.area(data).closed(false);
  //series1.markers().enabled(true);

  chart.marker(data)
      .hoverType('star5')
      .selectType('cross');

  // initiate chart drawing
  chart.draw();
});


