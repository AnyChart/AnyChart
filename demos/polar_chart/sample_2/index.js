var chart;
anychart.onDocumentLoad(function() {
  var data4 = [
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

  chart = anychart.polar()
      .container('container')
      .startAngle(0);

  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE);
  chart.yScale().ticks().interval(2);
  chart.xScale().maximum(100);
  chart.xScale().ticks().interval(10);
  chart.yAxis().minorTicks().enabled(false);
  chart.xAxis().labels()
      .textFormatter(function() {return this['value'] + '.00'})
      .fontWeight('bold');
  chart.title(null);
  chart.background()
      .enabled(true)
      .stroke('2 #2466B1')
      .corners(10);
  chart.margin(20);
  chart.padding(10);

  chart.grid(1).oddFill(null).evenFill(null);
  chart.grid(0).oddFill('white');

  var series1 = chart.line(data4).closed(false);
  series1.markers().size(3).fill({keys: ['#8BC9F0', '#1D8BD1'], cx: 0.4, cy: 0.4});
  series1.stroke('3 #1D8BD1');

  chart.draw();
});