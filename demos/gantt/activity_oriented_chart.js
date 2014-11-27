anychart.onDocumentReady(function(){
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  var chart = anychart.ganttProject();
  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(treeData);

  chart.draw();

  chart.zoomTo(951350400000, 954201600000);
});