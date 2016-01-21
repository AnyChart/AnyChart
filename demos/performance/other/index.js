var chart, rowHeight, colWidth, stage;
anychart.onDocumentReady(function() {
  var n = 4;
  var cols = Math.min(Math.floor(Math.sqrt(n)));
  var rows = Math.floor(n / cols);
  colWidth = 100 / rows;
  rowHeight = 100 / rows;

  stage = anychart.graphics.create('container');

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

  anychart.performance.start('Preparation');
  chart = anychart.cartesian();
  chart.title(n + ' points');
  chart.xScale('linear');
  chart.xScale().stickToZero(false);
  chart.interactivity().hoverMode('byX');
  chart.line(data);
  chart.left((row * rowHeight).toFixed(2) + '%');
  chart.top((col * colWidth).toFixed(2) + '%');
  chart.width(colWidth.toFixed(2) + '%');
  chart.height(rowHeight.toFixed(2) + '%');
  chart.container(stage);
  anychart.performance.end('Preparation');

  chart.draw();

  anychart.performance.end('Total ' + n);
}