anychart.onDocumentLoad(function() {
  var stage = acgraph.create('container',600, 400);

  var chart = anychart.lineChart();
  chart.container(stage);
  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE);
  chart.palette(['red .5', 'blue .5']);

  //data
  var data = anychart.data.set([
    ['P1', 178, 165],
    ['P2', 178, 165],
    ['P3', 197, NaN],
    ['P4', 167, 153],
    ['p5', 167, 153]
  ]);
  var data1 = data.mapAs({x: [0], value: [1]});
  var data2 = data.mapAs({x: [0], value: [2]});

  chart.area(data1).connectMissingPoints(true);
  chart.area(data2).connectMissingPoints(true);


  chart.draw();
});