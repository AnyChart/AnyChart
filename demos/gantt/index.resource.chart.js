var stage, chart, data;

function zoomIn() {
  chart.zoomIn();
}

function zoomOut() {
  chart.zoomOut();
}

anychart.onDocumentReady(function() {

  data = anychart.data.tree(rawData, anychart.enums.TreeFillingMethod.AS_TABLE);

  chart = anychart.ganttResource();

  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(data);

  var dataGrid = chart.dataGrid();

  dataGrid.column(1).width(250);

  var alsoColumn = dataGrid.column(2);
  alsoColumn.title().text('Also');
  alsoColumn.textFormatter(function(item) {
    return item.get('also');
  });

  chart.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
    console.log(e);
  });

  chart.draw();

});










