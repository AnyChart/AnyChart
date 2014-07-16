var chart;
function load() {
  chart = new anychart.lineChart();
  var series = chart.line([1, 2, 3, 4, 5, 6, 7]);
  chart.container('container');
  series.tooltip().enabled(true).textFormatter(function() {
    return this.x + ': ' + this.value + ' wtf!!' + '\n' + this.seriesName + ': hUI!';
  });
  chart.draw();
}
