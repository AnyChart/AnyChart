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
  var chart = anychart.cartesianChart();
chart.column([1, 4, 5, 7, 2]);
var myGrid = anychart.elements.grid()
   .layout(anychart.enums.Layout.HORIZONTAL);
chart.grid(myGrid);
myGrid.oddFill('none')
   .evenFill('none')
   .layout(anychart.enums.Layout.HORIZONTAL).minor(true);
chart.minorGrid(myGrid)
chart.container(stage).draw();
//  chart.container(stage).draw();



}