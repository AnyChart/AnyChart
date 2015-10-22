var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {
  var dataTable = anychart.data.table('date');
  dataTable.addData(date_string());
  var mapping = dataTable.mapAs({value:'value'});
  chart = anychart.stock();
  chart.padding(10,10,10,50);
  chart.plot().line(mapping);
  chart.container('container').draw();
});