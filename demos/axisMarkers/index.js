var axis1, axis2, axis3, axis4;
var parentBounds, container, drawer;
var textMarker, lineMarker, rangeMarker;

function load() {
  var chart = anychart.column();
  var logScale = anychart.scales.log();
  chart.column([0.5, 4, 0.9, 7, 2.5]);
  chart.yAxis(1).orientation('right').scale(logScale);

  chart.textMarker()
      .scale(chart.yScale())
      .value(3)
      .text('Left textMarker')
      .align('left');

  chart.textMarker(1)
      .scale(logScale)
      .value(3)
      .text('Right textMarker')
      .align('right');

  chart.textMarker(2)
      .scale(chart.xScale())
      .value(2)
      .text('VERTICAL!!! –¿¡Œ“¿≈“!!!')
      .layout('vertical')
      .align('center');

  chart.container('container').draw();

}