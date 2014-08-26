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
  chart = anychart.cartesianChart();
  chart.marker([10, 11, 17, 7, 21])
      .type('star4')
      .hoverType('star6');
  chart.container(stage).draw();
//  chart.container(stage).draw();



}