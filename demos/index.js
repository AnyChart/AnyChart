anychart.onDocumentLoad(function() {
  var chart = anychart.columnChart();

  chart.column([
    ['P1' , 11],
    ['P2' , 8],
    ['P3' , 18],
    ['P4' , 16],
    ['P5' , 26],
    ['P6' , 30],
    ['P7' , 6],
    ['P8' , 20]

  ]);

  chart.container('container');
  chart.draw();

  chart.lineMarker().value(9).stroke('1 red').layout('horizontal');
  chart.textMarker().value(36).text('36TextMarker');
  chart.rangeMarker().from(18).to(27);

  chart.yAxis().title(null);
  chart.xAxis().title(null);
  chart.title(null);
});