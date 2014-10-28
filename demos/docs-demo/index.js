var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.lineChart();

  var chart = anychart.financialChart();
  chart.ohlc([
    [Date.UTC(2013, 07, 04), 511.53, 514.98, 505.79, 506.40],
    [Date.UTC(2013, 07, 05), 507.84, 513.30, 507.23, 512.88],
    [Date.UTC(2013, 07, 06), 512.36, 515.40, 510.58, 511.40],
    [Date.UTC(2013, 07, 07), 513.10, 516.50, 511.47, 515.25],
    [Date.UTC(2013, 07, 08), 515.02, 528.00, 514.62, 525.15]
  ]);
  chart.container(stage).draw();
}