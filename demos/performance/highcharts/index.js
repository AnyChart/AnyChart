var chart, rowHeight, colWidth, stage, cols, rows;
$(function() {
  var n = 4;
  cols = Math.min(Math.floor(Math.sqrt(n)));
  rows = Math.floor(n / cols);
  colWidth = 100 / rows;
  rowHeight = 100 / rows;

  var k = 1000;
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      draw(k, i, j);
      k *= 10;
    }
  }

  anychart.performance.printTree(0, true);
});


function draw(n, row, col){
  var data = [];
  for (var i = 0; i < n; i++) {
    data.push(Math.sin(i / 180 * Math.PI * 360 * 4 / n));
  }

  anychart.performance.start('Total ' + n);

  $('#container' + (col + row * cols)).highcharts({
    title: {
      text: n + ' points'
    },
    yAxis: {
      visible: false
    },
    xAxis: {
      visible: false
    },
    legend: {
      enabled: false
    },
    series: [{
      animation: false,
      name: 'Tokyo',
      data: data
    }]
  });

  anychart.performance.end('Total ' + n);

}