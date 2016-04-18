anychart.onDocumentReady(function() {
// The data that have been used for this sample can be taken from the CDN
// http://cdn.anychart.com/csv-data/ixic-daily-short.js

// create data table on loaded data
  var dataTable = anychart.data.table();
  dataTable.addData(get_ixic_daily_short_data());

  //anychart.theme('coffee');

// map loaded data
  var mapping = dataTable.mapAs({'value': 1});
  var mapping1 = dataTable.mapAs({'value': 2});
  var mapping2 = dataTable.mapAs({'value': 3});
  var mapping3 = dataTable.mapAs({'value': 4});

// create stock chart
  chart = anychart.stock();

// create first plot on the chart with line series
  var firstPlot = chart.plot(0);
  firstPlot.column(mapping);
  firstPlot.line(mapping1);
  firstPlot.spline(mapping2);
  firstPlot.marker(mapping3);
//
// // create second plot on the chart
//   var secondPlot = chart.plot(1);
//
// // turn on second plot grids
//   secondPlot.grid().enabled(true);
//   secondPlot.grid(1).enabled(true).layout('vertical');
//
// // create line series on the second plot
//   var secondSeries = secondPlot.line(mapping);
//   secondSeries.stroke('3 #64b5f6');
//
// // create third plot
//   var thirdPlot = chart.plot(2);
//
// // turn on third plot grids and minor grids
//   thirdPlot.grid().enabled(true);
//   thirdPlot.grid(1).enabled(true).layout('vertical');
//   thirdPlot.minorGrid().enabled(true);
//   thirdPlot.minorGrid(1).enabled(true).layout('vertical');
//
// // create line series on the third plot
//   var thirdSeries = thirdPlot.line(mapping);
//   thirdSeries.stroke({color: '#64b5f6', thickness: 3, dash: '10 5'});

// create scroller series with mapped data
  chart.scroller().height(200).stepArea(mapping);

// set chart selected date/time range
  // chart.selectRange('2005-01-03', '2005-05-20');

// set container id for the chart
  chart.container('container');

// initiate chart drawing
  chart.draw();
});
