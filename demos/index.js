var chart;
anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {x: 1, value: 1},
    {x: 2, value: 2},
    {x: 3, value: 3},
    {x: 4, value: 4},
    {x: 5, value: 5, marker: {size: 10}}
  ]);

  var dataSet2 = anychart.data.set([
    {x: 1, value: 1},
    {x: 2, value: 2},
    {x: 3, value: 3},
    {x: 4, value: 4},
    {x: 5, value: 5}
  ]);

  chart = anychart.radar();

  chart.container('container');

  var line = chart.line(dataSet)
      .tooltip(null)
      .stroke('blue')
      .hoverMarkers({size: 10})
      .hoverStroke('blue');


  chart.draw();

  //line.data(dataSet2);
});