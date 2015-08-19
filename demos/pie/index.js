var chart;
function load() {
  chart = anychart.pie([1,5,8,3]);
  chart.hatchFill(true);
  chart.container('container').draw();
  //chart.data([5,6,7])

}
