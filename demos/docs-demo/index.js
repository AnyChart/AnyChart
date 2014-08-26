var label1, label2;
var radiusPixel = 0;

function load() {
    var container = 'container';
    var stage = acgraph.create(container, 400, 300);
    var layer = acgraph.layer();
    stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
    /////////////////////////////////////////////////////////

    chart = anychart.lineChart();


  * var tooltipSettings = anychart.elements.tooltip();
  * tooltipSettings
  *     .background()
  *     .stroke('2 #cc8800').fill('grey 0.5');
  * chart.line([1, 2, 1.2, 3.2]).tooltip(tooltipSettings);

  chart.container(stage).draw();



}