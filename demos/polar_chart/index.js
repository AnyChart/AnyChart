var chart;
anychart.onDocumentReady(function() {
  chart = anychart.polar();
  chart.marker(['4', 10, -1, 10, 4]).size(55);
  chart.grid()
      .oddFill('none')
      .evenFill('none')
      .stroke('2 blue .5')
      .layout('circuit');
  chart.xAxis().stroke('5 red');
  chart.legend(false);
  chart.container('container').draw();
});