anychart.onDocumentLoad(function() {
  var stage = acgraph.create('container',600, 400);
  var chart = anychart.lineChart();
  acgraph.events.listen(stage, acgraph.events.EventType.RENDER_FINISH, function (e){
    document.getElementById('status').innerHTML = 'chart draw';
    console.log('chart draw');
  });
  stage.suspend();

  var data = anychart.data.set([
    ['P1', 178, 165, 154, 143, 132],
    ['P2', 167, 153, 144, 133, 122]
  ]);
  var data1 = data.mapAs({x: [0], value: [1]});
  var data2 = data.mapAs({x: [0], value: [2]});
  var data3 = data.mapAs({x: [0], value: [3]});
  var data4 = data.mapAs({x: [0], value: [4]});
  var data5 = data.mapAs({x: [0], value: [5]});
  chart.marker(data1)
      .hoverSize(30)
      .size(20)
      .hatchFill('diagonalcross')
      .hoverHatchFill('diagonalcross')
      .type('star5');
  chart.marker(data2)
      .hoverSize(50)
      .size(20)
      .hatchFill('diagonalbrick')
      .type('star4');
  chart.marker(data3)
      .hoverSize(30)
      .size(20)
      .hoverHatchFill('horizontal')
      .hatchFill('zigzag');
  chart.marker(data4)
      .hoverSize(30)
      .size(20)
      .hatchFill('checkerboard')
      .type('square');
  chart.marker(data5)
      .hoverSize(30)
      .size(20)
      .hatchFill('percent30')
      .hoverHatchFill('vertical')
      .type('circle');
  chart.container(stage);
  chart.draw();
  stage.resume();
});