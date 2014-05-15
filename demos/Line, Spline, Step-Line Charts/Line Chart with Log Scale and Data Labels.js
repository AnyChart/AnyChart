var chart;

anychart.onDocumentReady(function() {
  //create line chart
  chart = new anychart.lineChart();

  //set container for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Line chart with Logarithmic Y-Axis and Data Labels');

  //create logarithmic scale
  var logScale = new anychart.scales.Logarithmic();
  logScale.minimum(1);

  //set scale for the chart, this scale will be used in all scale dependent entries such axes, grids, etc
  chart.yScale(logScale);

  //create first series with mapped data
  var series = chart.line([
    ['P1', '112.61 '],
    ['P2', '163.21 '],
    ['P3', '229.98 '],
    ['P4', '2790.54'],
    ['P5', '4104.19'],
    ['P6', '3250.67'],
    ['P7', '5720.43'],
    ['P8', '43.76'],
    ['P9', '61.34'],
    ['P10', '34.17'],
    ['P11', '45.72'],
    ['P12', '122.56 '],
    ['P13', '87.12'],
    ['P14', '54.32'],
    ['P15', '33.08']
  ]);

  //enable series data labels
  series.labels()
      .enabled(true)
      .anchor('bottom')
      .fontWeight('bold');

  //initiate chart drawing
  chart.draw();
});
