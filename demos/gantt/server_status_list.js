
anychart.onDocumentReady(function() {
  var data = anychart.data.tree(rawData, anychart.enums.TreeFillingMethod.AS_TABLE);
  var chart = anychart.ganttResource();
  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(data);

  var dataGrid = chart.getDataGrid();
  dataGrid.column(0).width(90).textFormatter(function(item) {
    return item.get('name');
  }).title().text('Server');
  dataGrid.column(1).width(70).textFormatter(function(item) {
    return item.get('working');
  }).title().text('Working');
  dataGrid.column(2).width(70).textFormatter(function(item) {
    return item.get('maintance');
  }).title().text('Maintance');
  dataGrid.column(3).width(70).textFormatter(function(item) {
    return item.get('broken');
  }).title().text('Broken');


  chart.draw();
  chart.fitAll();
});