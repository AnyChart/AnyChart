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
  var chart = anychart.pieChart([5, 2, 1, 3, 1, 3]);
  chart.labels()
      .fontColor('black')
      .position('outside');
  chart.connectorLength(20);
  chart.container(container).draw();
//  chart.container(stage).draw();



}