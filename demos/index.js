anychart.onDocumentReady(function() {
// The data that have been used for this sample can be taken from the CDN
// http://cdn.anychart.com/csv-data/ixic-daily-short.js

// create data table on loaded data
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());

// map loaded data
  var mapping = dataTable.mapAs({'value': 4});
  var mapping2 = dataTable.mapAs({'value': {column: 4, type: function(values) { return values[Math.floor(values.length / 2)]; }}});
  var mapping3 = dataTable.mapAs({'value': {column: 4, type: {
    reset: function() { this.a = 0; },
    considerItem: function() { this.a++; },
    getResult: function() { return this.a;}
  }}});

// create stock chart
  chart = anychart.stock();

// create first plot on the chart with line series
  var firstPlot = chart.plot(0);
  firstPlot.column(mapping)
  firstPlot.line(mapping2)
  firstPlot.line(mapping3)
  // firstPlot.column(mapping).fill('red 0.1');
  // firstPlot.column(mapping2).fill('green 0.1');
  // firstPlot.column(mapping3).fill('blue 0.1');

// create scroller series with mapped data
  chart.scroller().column(mapping);

// set chart selected date/time range
  chart.selectRange('2005-01-03', '2005-05-20');

// set container id for the chart
  chart.container('container');

// initiate chart drawing
  chart.draw();
});
    