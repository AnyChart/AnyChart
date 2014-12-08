var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.line();

 chart = anychart.scatter();
 chart.bubble([
      [4, 2, 1],
      [1, 2, 3],
      [2, 2, 2],
      [3, 2, 1],
      ])
    .maximumSize(80)
 chart.container(stage).draw();

}