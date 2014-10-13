var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.lineChart();


  var chart = anychart.lineChart();

  var line = chart.line([1, 4, 2, 6]);
  var title = chart.title();
  title.text('MouseOver the title and click on line series.');
  var counter = 0;
  line.listen(anychart.enums.EventType.POINT_MOUSE_OUT, function(e){
    title.fontColor('green');
  });
  line.listen(anychart.enums.EventType.POINT_MOUSE_OVER, function(e){
    title.fontColor('red');
  });
  line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
    title.text('You can\'t click here anymore.').fontColor('black');
    line.removeAllListeners();
  });

  chart.container(stage).draw();

}