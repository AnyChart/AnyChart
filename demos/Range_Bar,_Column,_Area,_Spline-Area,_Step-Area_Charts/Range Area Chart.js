anychart.onDocumentReady(function() {
  //create column chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Range Area Chart');

  //create area series with passed data
  chart.rangeArea([
    { low: 182, high: 1122},
    { low: 284, high: 1152},
    { low: 255, high: 1139},
    { low: 412, high: 1142},
    { low: 376, high: 1112},
    { low: 482, high: 1122},
    { low: 384, high: 1152},
    { low: 500, high: 1139},
    { low: 382, high: 1142},
    { low: 488, high: 1112},
    { low: 482, high: 1122},
    { low: 440, high: 1152},
    { low: 299, high: 1139},
    { low: 382, high: 1142},
    { low: 488, high: 1112}
  ]);

  //initiate chart drawing
  chart.draw();
});
