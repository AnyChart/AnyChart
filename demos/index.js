anychart.onDocumentReady(function() {

// create column chart
  chart = anychart.verticalArea([
      [0, 10, 20, 9, 11],
      [1, 11, 17, 10, 14],
      [2, 14, 16, 6, 8],
      [3, 8, 11, 5, 11],
      [4, 11, 14, 3, 5]
  ])


// set container id for the chart
  chart.container('container');

// initiate chart drawing
  chart.draw();
});
