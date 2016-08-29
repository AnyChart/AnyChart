anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {id: "AU.CT", size: 40},
    {id: "AU.VI", size: 70},
    {id: "AU.WA", size: 90},
    {id: "AU.QL", size: 50},
    {id: "AU.NS", size: 80},
    {id: "AU.NT", size: 60},
    {id: "AU.TS", size: 40},
    {id: "AU.SA", size: 50}
  ]);

  var dataSetForSeries = dataSet.mapAs({id: "id"});
  chart = anychart.bubbleMap(dataSetForSeries);
  chart.geoData('anychart.maps.australia');
  // chart.geoIdField("!");
  chart.container('container').draw();
});