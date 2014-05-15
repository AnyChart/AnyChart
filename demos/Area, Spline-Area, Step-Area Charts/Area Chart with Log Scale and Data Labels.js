anychart.onDocumentReady(function() {
  //create area chart
  var chart = anychart.areaChart();

  //set container for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Area Chart with Logarithmic Y-Axis and Data Labels');

  //create logarithmic scale
  var logScale = anychart.scales.log();
  logScale.minimum(1); //set scale minimum value

  //set scale for the chart
  //it force to use passed scale in all scale dependent entries such axes, grids, crosshairs etc
  chart.yScale(logScale);

  //create area series on passed data
  var series = chart.area([
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

  //set series data labels settings
  series.labels()
      .enabled(true)       //enable data labels settings which is disabled by default
      .fontWeight('bold');

  //initiate chart drawing
  chart.draw();
});
