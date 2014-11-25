var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.lineChart();

 var chart = anychart.scatterChart();
  chart.hatchFillPalette(['percent50', 'diagonalBrick', 'zigzag']);
 chart.marker([
    [4.1, 10],
    [2.3, 6],
    [3.4, 17],
    [1.2, 20]
 ]);
 chart.marker([
    [4.4, 20],
    [2.3, 11],
    [3.1, 22],
    [1.6, 5]
 ]);
 chart.marker([
    [4.8, 1],
    [2.6, 16],
    [3.9, 7],
    [1.1, 12]
 ]);
  chart.container(stage).draw();
}