var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

anychart.onDocumentReady(function() {
  // anychart.licenseKey('anychart-CAT-64a5f14c-5d66a546');
  // stage = anychart.graphics.create('container', 400, 300);

  var dataSet = anychart.data.set([
    {id: 'AU.CT', value: 15, title: 'Australian Capital Territory'},
    {id: 'AU.VI', value: 23, title: 'Victoria'},
    {id: 'AU.WA', value: 86, title: 'Western Australia'}
  ]);
  var dataSetForSeries = dataSet.mapAs({id: 'id'});
  var dataSet2 = anychart.data.set([
    {id: 'AU.QL', value: 16, title: 'Queensland', size: 40},
    {id: 'AU.NS', value: 32, title: 'New South Wales', size: 40},
    {id: 'AU.NT', value: 64, title: 'Northern Territory', size: 40}
  ]);
  dataSetForSeries2 = dataSet2.mapAs({id: 'id'});
  var dataSet3 = anychart.data.set([
    {id: 'AU.TS', value: 28, title: 'Tasmania'},
    {id: 'AU.SA', value: 45, title: 'South Australian'}
  ]);
  dataSetForSeries3 = dataSet3.mapAs({id: 'id'});
  var dataSet4 = anychart.data.set([
    {id: 'AU.TS', size: 28},
    {id: 'AU.SA', size: 45}
  ]);
  dataSetForSeries4 = dataSet4.mapAs({id: 'id'});
  chart = anychart.map();
  // chart.geoIdField('code_hasc');
  var series1 = chart.choropleth(dataSetForSeries);
  series1.geoIdField('code_hasc');

  series1
      .hatchFill('vertical')
      .hoverHatchFill('diagonalbrick');

  chart.geoData(anychart.maps.australia);
  chart.legend(true);
  chart.container('container').draw();
  chart.addSeries(dataSetForSeries2, dataSetForSeries3);
  chart.getSeries(1).geoIdField('code_hasc');
  chart.getSeries(2).geoIdField('code_hasc');


  // dataSet2 = anychart.data.set([]);
  //
  // chart2 = anychart.map();
  // chart2.geoData(anychart.maps.france);
  // chart2.choropleth(dataSet2);
  // chart2.bounds('50%', 0, '50%', '100%');
  // chart2.credits().enabled(false);
  //
  // chart2.container(stage).draw();
  //
  //
  // var data = [];
  // var features = chart2.geoData()['features'];
  // for (var i = 0, len = features.length; i < len; i++) {
  //   var feature = features[i];
  //   if (feature['properties']) {
  //     var id = feature['properties'][chart2.geoIdField()];
  //     data.push({'id': id, 'title': feature['properties']['nom_cl'], 'value': randomExt(100, 1000)});
  //   }
  // }
  // dataSet2.data(data);


  // def2 = chart1.featureScaleFactor('AU.WA');
  // chart1.featureScaleFactor('AU.WA', 0.009);
  // console.log(chart1.featureScaleFactor('AU.WA'), 0.009);
  // chart1.featureScaleFactor('AU.WA', def2);
  //
  //
  // def1 = chart1.featureCrs('AU.WA');
  // chart1.featureCrs('AU.WA', change);
  // console.log(chart1.featureCrs('AU.WA') == change);
  // chart1.featureCrs('AU.WA', def1);


  // result1 = chart1.transform(49, 50);
  // console.log(result1['x'], '-603.2984840397139');
  // console.log(result1['y'], '-246.22451623555497');

  // result2 = chart2.transform(49, 50);
  // console.log(result2['x'], '909.3702720948354');
  // console.log(result2['y'], '-124.09981949083709');
});
