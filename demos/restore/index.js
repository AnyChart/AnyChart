anychart.onDocumentLoad(function() {
  chart = anychart.line();
  var dataSet = anychart.data.set([
    ['A1', 1, 5, 2],
    ['A2', 2, 5, 4],
    ['A3', 0, 3, 5],
    ['A4', 1.5, 3, 2],
    ['A5', 5, 7, 1],
    ['A6', 4, 6, -5],
    ['A7', 5, 2, 0.5]
  ]);
  chart.line(dataSet.mapAs({x: [0], value: [1]}));
  chart.spline(dataSet.mapAs({x: [0], value: [2]}));
//draw
  chart.area(dataSet.mapAs({x: [0], value: [3]}));
  chart.removeSeriesAt(2);



  chart.container('container');

  chart.draw();

  xmlSmall = chart.toXml();
  //xmlLarge = chart.toXml(false, true);
  //if (xmlSmall == xmlLarge) console.log('fail large=small');
  //console.log(xmlSmall);
  //console.log('------');
  //console.log(xmlLarge);

  chartRest = anychart.fromXml(xmlSmall);
  chartRest.container('container_restore');

  chartRest.draw();

  xml2 = chartRest.toXml();
  //if (xml2 != xmlLarge) console.log('fail large!=large2');
  chartRest2 = anychart.fromXml(xml2);
  chartRest2.container('container_restore2');

  chartRest2.draw();

});
