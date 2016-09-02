var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {
  table = anychart.data.table();
  table.addData(get_msft_data());
  var mapping = table.mapAs({high: 2, low: 3, value: 4});

  //var c = anychart.math.aroon.createComputer(mapping, 20);

  chart = anychart.stock();
  chart.padding(10, 10, 10, 50);
  chart.plot().line(mapping);
  chart.plot(1).height('33%');
  chart.plot(1).aroon(mapping, 20);
  //chart.plot(1).line(table, {value: c.getFieldIndex('upResult')}).stroke('blue');
  //chart.plot(1).line(table, {value: c.getFieldIndex('downResult')}).stroke('red');
  chart.container('container').draw();
});
