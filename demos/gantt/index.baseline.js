var stage, chart, data;

function zoomIn() {
  chart.zoomIn();
}

function zoomOut() {
  chart.zoomOut();
}

function formatDate(dateUnit) {
  if (dateUnit < 10) dateUnit = '0' + dateUnit;
  return dateUnit + '';
}

var labelTextSettingsOverrider = function(label, dataItem) {
  if (dataItem.numChildren()) {
    label.fontWeight('bold').fontStyle('italic');
  }
};

anychart.onDocumentReady(function() {
  stage = acgraph.create('container', '100%', '100%');

  data = anychart.data.tree(rawData, anychart.enums.TreeFillingMethod.AS_TABLE);

  chart = anychart.ganttProject();

  chart.container(stage);
  chart.bounds(0, 0, '100%', '100%');
  chart.data(data);
  chart.splitterPosition(460);

  var dataGrid = chart.getDataGrid();

  dataGrid.column(0).cellTextSettings().hAlign('center').padding(0, 0, 0, 0);

  dataGrid.column(1).width(200);

  var baselineStartColumn = dataGrid.column(2);
  baselineStartColumn.title().text('Baseline Start');
  baselineStartColumn.width(100);
  baselineStartColumn.textFormatter(function(item) {
    var field = item.get(anychart.enums.GanttDataFields.BASELINE_START);

    if (field) {
      var baselineStart = new Date(field);
      return formatDate(baselineStart.getUTCMonth() + 1) + '/' +
          formatDate(baselineStart.getUTCDate()) + '/' +
          baselineStart.getUTCFullYear() + ' ' +
          formatDate(baselineStart.getUTCHours()) + ':' +
          formatDate(baselineStart.getUTCMinutes());
    } else {
      var actualStart = item.get(anychart.enums.GanttDataFields.ACTUAL_START);
      var actualEnd = item.get(anychart.enums.GanttDataFields.ACTUAL_END);
      if ((actualStart == actualEnd) || (actualStart && !actualEnd)) {
        var start = new Date(actualStart);
        return formatDate(start.getUTCMonth() + 1) + '/' +
            formatDate(start.getUTCDate()) + '/' +
            start.getUTCFullYear() + ' ' +
            formatDate(start.getUTCHours()) + ':' +
            formatDate(start.getUTCMinutes());
      }
      return '';
    }
  });


  var baselineEndColumn = dataGrid.column(3);
  baselineEndColumn.title().text('Baseline End');
  baselineEndColumn.width(100);
  baselineEndColumn.textFormatter(function(item) {
    var field = item.get(anychart.enums.GanttDataFields.BASELINE_END);
    if (field) {
      var baselineEnd = new Date(field);
      return formatDate((baselineEnd.getUTCMonth() + 1)) + '/' +
          formatDate(baselineEnd.getUTCDate()) + '/' +
          baselineEnd.getUTCFullYear() + ' ' +
          formatDate(baselineEnd.getUTCHours()) + ':' +
          formatDate(baselineEnd.getUTCMinutes());
    } else {
      return '';
    }
  });


  dataGrid.column(1).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(2).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(3).cellTextSettingsOverrider(labelTextSettingsOverrider);

  chart.draw();

  chart.zoomTo(Date.UTC(2010, 0, 8, 15), Date.UTC(2010, 3, 25, 20));
});










