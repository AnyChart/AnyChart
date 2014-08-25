var label1, label2;
var radiusPixel = 0;

function load() {
    var container = 'container';
    var stage = acgraph.create(container, 400, 300);
    var layer = acgraph.layer();
    stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
    /////////////////////////////////////////////////////////

 //   chart = anychart.lineChart();


//  var chart = anychart.lineChart();
  anychart.cartesian.series.candlestick([
  [0, 2, 4, 1, 3],
  [1, 3, 5, 1, 2],
  [2, 2, 5, 1, 4]
 ])
      .fallingFill('red')
      .container(stage).draw();
//  chart.container(stage).draw();



}