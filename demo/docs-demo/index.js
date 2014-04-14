var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(400, 100, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  var dataSet = new anychart.data.Set([
    [110, 21, 12, 124],
    [128, 10, 21, 102],
    [117, 57, 32, 114],
    [210, 57, 142, 214]
  ]);

  var chart1 = new anychart.pie.Chart(dataSet.mapAs({'value': [0]}))
      .container(stage)
      .bounds(0, 0, '50%', '50%')
      .draw();
  var chart2 = new anychart.pie.Chart(dataSet.mapAs({'value': [1]}))
      .container(stage)
      .bounds('50%', 0, '50%', '50%')
      .draw();
  var chart3 = new anychart.pie.Chart(dataSet.mapAs({'value': [2]}))
      .container(stage)
      .bounds(0, '50%', '50%', '50%')
      .draw();
  var chart4 = new anychart.pie.Chart(dataSet.mapAs({'value': [3]}))
      .container(stage)
      .bounds('50%', '50%', '50%', '50%')
      .draw();

  chart1.listen(acgraph.events.EventType.PointClick, explodePoint);
//  chart.background().cornerType('round').corners(15);
//  chart.margin(5);

  var watermark = new anychart.elements.Label();
  watermark.text('AnyChart Trial Version')
      .fontOpacity(.05)
      .adjustFontSize(true, false)
      .width('100%')
      .height('100%')
      .vAlign('center')
      .hAlign('center')
      .parentBounds(stage.getBounds())
      .padding(20)
//      .pointerEvents('none')
      .container(stage)
      .draw();
}
function explodePoint(e) {
  console.log(e)
}
