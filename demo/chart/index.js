var chart;
function load() {
  chart = new anychart.Chart();
  chart.container('container');
  chart.background().fill('red');
  chart.draw();

  chart.margin().left(100);
  chart.margin().right(100);

}
