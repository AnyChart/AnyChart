var chart;
function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////


//  chart = anychart.columnChart();
//
//  chart.spline([1.1, 1.6, 1.4, 1.9]);
//  var scale = anychart.scales.ordinal();
//    scale.values(['A1', 'A2', 'A3', 'B1', 'B2']);
//  scale.ticks().set([0,3]);
//  chart.yAxis(1).orientation('right').scale(scale);
//
//  chart.container(stage).draw();

  label = anychart.elements.label()
      .text('Some Large text')
      .width(80)
      .offsetY(5)
      .offsetX(10);
  label.background().enabled(true).fill('none').stroke('1 #00F');
  label.container(stage).draw();

}
function resizeChart(w, h) {
  w = w || chart.width() || 400;
  h = h || chart.height() || 300;
  w+=10;
  h+=10;
  console.log('resize chart from (', chart.width(), chart.height(), ') to (', w, h, ')');
  chart.width(w);
  chart.height(h);
}