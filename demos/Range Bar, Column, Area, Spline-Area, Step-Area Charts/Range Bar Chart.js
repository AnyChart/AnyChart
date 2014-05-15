var chart;

anychart.onDocumentReady(function() {
  //create column chart
  chart = anychart.barChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Range Bar Chart');

  //create area series with passed data
  chart.rangeBar([
    { low: 12, high: 122},
    { low: 24, high: 152},
    { low: 36, high: 139},
    { low: 42, high: 142},
    { low: 58, high: 112},
    { low: 42, high: 122},
    { low: 34, high: 152},
    { low: 56, high: 139},
    { low: 22, high: 142},
    { low: 48, high: 112},
    { low: 42, high: 122},
    { low: 34, high: 152},
    { low: 56, high: 139},
    { low: 22, high: 142},
    { low: 48, high: 112}
  ]);

  //initiate chart drawing
  chart.draw();
});