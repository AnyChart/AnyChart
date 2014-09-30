var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.lineChart();


 var chart = anychart.columnChart();

* var data = anychart.data.set([
*     {x: 'A1', value: 8, fill: 'yellow'},
*     {x: 'A2', value: 11, fill: 'orange'},
*     {x: 'A3', value: 12, fill: 'red'},
*     {x: 'A4', value: 9, fill: 'grey'}
* ]);
* chart.column(data);
* chart.container(stage).draw();
* var view = data.mapAs();
* var pointX = view.get(2, 'x');
* var pointFill = view.get(2, 'fill');
*   chart.title().text('point \''+ pointX +'\' has \'' + pointFill + '\' fill.');


}