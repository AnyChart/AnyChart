anychart.onDocumentReady(function() {
  //create area chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Spline-Area Chart');

  //create area series with passed data
  chart.splineArea([
    ['P1' , '1042'],
    ['P2' , '2210'],
    ['P3' , '2994'],
    ['P4' , '2115'],
    ['P5' , '2844'],
    ['P6' , '1987'],
    ['P7' , '1662'],
    ['P8' , '1327'],
    ['P9' , '1826'],
    ['P10', '1699'],
    ['P11', '1511'],
    ['P12', '1904'],
    ['P13', '1957'],
    ['P14', '1296']
  ]);

  //initiate chart drawing
  chart.draw();
});
