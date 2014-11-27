anychart.onDocumentReady(function(){
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  var chart = anychart.ganttProject();
  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(treeData);

  var dataGrid = chart.getDataGrid();
  dataGrid.column(0).title().text('#');
  dataGrid.column(1).width(200);
  dataGrid.column(2).width(70).textFormatter(function(item) {
    var date = new Date(item.get('actualStart'));
    return date.getFullYear() + '.' + date.getMonth() + '.' + date.getDay();
  }).title().text('Start Time');

  dataGrid.column(3).width(70).textFormatter(function(item) {
    var date = new Date(item.get('actualStart'));
    return date.getFullYear() + '.' + date.getMonth() + '.' + date.getDay();
  }).title().text('End Time');

  chart.draw();

  chart.zoomTo(951350400000, 954201600000);
});