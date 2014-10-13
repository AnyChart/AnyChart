var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 100);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.lineChart();


  var bulletChart = anychart.bullet.chart([
    {value: 9, type: 'bar', fill: 'blue 0.5', gap: 0.3},
    {value: 10, type: 'X', stroke: 'blue 4'},
 ]);
 bulletChart.range().from(0).to(6);
 bulletChart.range(1).from(6).to(12);
 bulletChart.container(stage).draw();

}