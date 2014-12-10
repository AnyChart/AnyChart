anychart.onDocumentLoad(function() {
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

  //create polar chart
  chart = anychart.polar();

  //set container id for the chart
  chart.container('container');

  //set chart yScale settings
  chart.yScale().ticks().interval(2);

  //set chart xScale settings
  chart.xScale().maximum(100);
  chart.xScale().ticks().interval(10);

  //set xAxis labels settings
  chart.xAxis().labels()
      .textFormatter(function() {return this['value'] + '.00'})
      .fontWeight('bold');

  //disable chart title
  chart.title(false);

  //create line series
  var series1 = chart.line(data).closed(false);
  series1.markers().size(3).fill({keys: ['#8BC9F0', '#1D8BD1'], cx: 0.4, cy: 0.4});
  series1.stroke('3 rgb(29, 139, 209)');

  //initiate chart drawing
  chart.draw();
});