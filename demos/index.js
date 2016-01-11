var chart;
anychart.onDocumentReady(function() {
  chart = anychart.line();

  var dataset = [
    [
      '2592',
      new Date('2004-04-01T00:00:00')
    ],
    [
      '2485',
      new Date('2004-04-02T00:15:00')
    ],
    [
      '2379',
      new Date('2004-04-03T00:30:00')
    ],
    [
      '2379',
      new Date('2004-04-04T00:30:00')
    ],
    [
      '2166',
      new Date('2004-04-05T01:00:00')
    ]];


  var dataSet = anychart.data.set(dataset);
  var seriesData_a = dataSet.mapAs({x: [1], value: [0]});
  chart.line(seriesData_a).markers(true);

  var scale = anychart.scales.dateTime();
  chart.xScale(scale);
  chart.xAxis(0).labels().textFormatter(function() {
    return this['tickValue'];
  });
  chart.xScroller(true);

  chart.container('container').draw();
});
