anychart.onDocumentReady(function() {
  dataSet = anychart.data.set([
    {'id': 'IT.MO', size: 10},
    {'id': 'IT.BO', size: 13},
    {'id': 'IT.SP', size: 12}
  ]);
  chart = anychart.map();
  chart.geoData(anychart.maps['italy']);
  series = chart.bubble(dataSet).labels(true);
  series.overlapMode('allowOverlap');
  series.geoIdField('id');
  chart.container('container').draw();
  debugger;
  a = chart.toJson();
  chart.dispose();
  chart = anychart.fromJson(a);
  chart.container('container').draw();
});
