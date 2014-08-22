var label1, label2;
var radiusPixel = 0;

function load() {
    var container = 'container';
    var stage = acgraph.create(container, 400, 300);
    var layer = acgraph.layer();
    stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
    /////////////////////////////////////////////////////////

    chart = anychart.lineChart();


  var labelSettings = anychart.elements.labelsFactory();
  labelSettings.enabled(true);
  labelSettings.fontColor('white');
  labelSettings.fontWeight('bold');
  var series = chart.line([1,2,3]);
  series.labels(labelSettings);
  series.labels().enabled(true);

  chart.container(stage).draw();



}