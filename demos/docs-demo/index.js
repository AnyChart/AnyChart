var chart;
function load() {
  var container = 'container';
  var stage = acgraph.create(container, 400, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////


  chart = anychart.columnChart();
  chart.column([1.1, 1.6, 1.4, 1.9]).hoverFill('red');
  chart.container(stage).draw();
  console.log('CAT:action(mouseClick,205,163)');
  console.log('CAT:action(mouseMove,275,130)');
  console.log('CAT:action(mouseMove,354,208)');

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
function log(var_args){
  console.log.apply(console, arguments);
}