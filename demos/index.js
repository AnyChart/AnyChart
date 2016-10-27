anychart.onDocumentReady(function() {
  // create data tree on our data
  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);

  // create project gantt chart
  chart = anychart.ganttProject();

  // set container id for the chart
  chart.container('container');

  // set data for the chart
  chart.data(treeData);

  // set start splitter position settings
  chart.splitterPosition(370);

  // chart.getTimeline()
  //     .header()
  //     .lowLevel()
  //     .tilesSeparationStroke('4 red');

  // initiate chart drawing
  chart.draw();
  chart.fitAll();

});
function getData() {
  return [
    {
      "id": "1",
      "name": "Phase 1 - Strategic Plan",
      "progressValue": "14%",
      "actualStart": Date.UTC(2005, 0, 1),
      "actualEnd": Date.UTC(2016, 0, 1)
    }
  ];
}