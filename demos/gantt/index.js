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
  if (!dataItem.getParent()) {
    label.fontColor('#0055aa').fontWeight('bold').fontSize(12).fontStyle('italic');
  } else {
    if (dataItem.numChildren()) {
      label.fontColor('#559955').fontWeight('bold').fontStyle('italic');
    }
  }
};

anychart.onDocumentReady(function() {
  stage = acgraph.create('container', '100%', '100%');

  data = anychart.data.tree(rawData, anychart.enums.TreeFillingMethod.AS_TABLE);

  chart = anychart.ganttProject();

  chart.container(stage);
  chart.bounds(0, 0, '100%', '100%');
  chart.data(data);
  chart.splitterPosition(350);

  var dataGrid = chart.dataGrid();
  var timeline = chart.getTimeline();

  dataGrid.cellEvenFill('#fcfcfc');
  timeline.cellEvenFill('#fcfcfc');


  dataGrid.column(0).cellTextSettings().hAlign('center').padding(0, 0, 0, 0);

  dataGrid.column(1).width(250);

  var actualStartColumn = dataGrid.column(2);
  actualStartColumn.title().text('Actual Start');
  actualStartColumn.width(100);
  actualStartColumn.textFormatter(function(item) {
    var actualStart = new Date(item.get(anychart.enums.GanttDataFields.ACTUAL_START));

    return formatDate(actualStart.getUTCMonth() + 1) + '/' +
        formatDate(actualStart.getUTCDate()) + '/' +
        actualStart.getUTCFullYear() + ' ' +
        formatDate(actualStart.getUTCHours()) + ':' +
        formatDate(actualStart.getUTCMinutes());
  });


  var actualEndColumn = dataGrid.column(3);
  actualEndColumn.title().text('Actual End');
  actualEndColumn.width(100);
  actualEndColumn.textFormatter(function(item) {
    var field = item.get(anychart.enums.GanttDataFields.ACTUAL_END);
    if (field) {
      var actualEnd = new Date(field);
      return formatDate((actualEnd.getUTCMonth() + 1)) + '/' +
          formatDate(actualEnd.getUTCDate()) + '/' +
          actualEnd.getUTCFullYear() + ' ' +
          formatDate(actualEnd.getUTCHours()) + ':' +
          formatDate(actualEnd.getUTCMinutes());
    } else {
      return '';
    }
  });

  var progressColumn = dataGrid.column(4);
  progressColumn.title().text('Progress');
  progressColumn.textFormatter(function(item) {
    var progress = item.get(anychart.enums.GanttDataFields.PROGRESS);
    var actualEnd = item.get(anychart.enums.GanttDataFields.ACTUAL_END);

    if (actualEnd) {
      return progress || '';
    } else {
      return ''; //Is milestone
    }
  });


  dataGrid.column(1).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(2).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(3).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(4).cellTextSettingsOverrider(labelTextSettingsOverrider);

  chart.draw();

});










