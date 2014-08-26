var label1, label2;
var radiusPixel = 0;

function load() {
    var container = 'container';
    var stage = acgraph.create(container, 600, 400);
    var layer = acgraph.layer();
    stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
    /////////////////////////////////////////////////////////

 //   chart = anychart.lineChart();


//  var chart = anychart.lineChart();
  anychart.cartesian.series.rangeArea([['A1', 1, 4],['A2', 7, 1]]).container(stage).draw();



//  chart.container(stage).draw();



}