anychart.onDocumentLoad(function() {
  var chart;
  var dataSet1 = anychart.data.set([
    {id: "CA", name: "Canada", value: "A1"},
    {id: "IT", name: "Italy", value: "A1"}
  ]);
  var dataSet2 = anychart.data.set([
    {id: "CA.NS", size:8, value:111},
    {id: "CA.ON", size:8, value:100},
    {id: "CA.PE", size:2, value:101}
  ]);
  var dataSet3 = anychart.data.set([
    {id: "IT.MO", size:8, value:111},
    {id: "IT.RN", size:2, value:101}
  ]);
  var map1 = anychart.map();
  var map2 = anychart.map();

  map1.geoData('anychart.maps.italy');
  map2.geoData('anychart.maps.canada');
  map1.choropleth(dataSet3);
  map2.choropleth(dataSet2);

  chart = anychart.map();
  chart.interactivity().selectionMode(anychart.enums.SelectionMode.DRILL_DOWN);
  chart.geoData('anychart.maps.world');
  chart.legend(true);
  chart.choropleth(dataSet1);
  chart.drillDownMap({
    'IT': map1,
    'CA': map2
  });
  chart.container('container').draw();
});