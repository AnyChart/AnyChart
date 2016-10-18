var chart, rangePicker, rangeSelector, rangePicker_external, rangeSelector_external;
anychart.onDocumentReady(function() {
// The data that have been used for this sample can be taken from the CDN
// http://cdn.anychart.com/csv-data/msft-daily-short.js
// http://cdn.anychart.com/csv-data/orcl-daily-short.js
// http://cdn.anychart.com/csv-data/csco-daily-short.js
// http://cdn.anychart.com/csv-data/ibm-daily-short.js

// create data tables on loaded data
  var msftDataTable = anychart.data.table();
  msftDataTable.addData(get_msft_daily_short_data());

// create stock chart
  chart = anychart.stock();

// create first plot on the chart with column series
  var firstPlot = chart.plot(0);
// create area series on the first plot
  firstPlot.area(msftDataTable.mapAs({'value': 4})).name('MSFT');

// create scroller series with mapped data
  chart.scroller().area(msftDataTable.mapAs({'value': 4}));

// set chart selected date/time range
  chart.selectRange('2005-01-03', '2005-11-20');

  rangePicker = anychart.ui.rangePicker();
  rangePicker.render(chart);

  rangeSelector = anychart.ui.rangeSelector();
  rangeSelector.render(chart);
  rangeSelector.ranges(rangeSelector.ranges().concat([{
    'text': 'Vocation',
    'startDate': '2006 Jul 16',
    'endDate': '2007 May 29',
  },{
    'type': 'Unit',
    'unit': 'Day',
    'count': 10,
    'anchor': 'fd',
    'text': '10D'
  },{
    'type': 'Unit',
    'unit': 'm',
    'count': 10,
    'anchor': 'fd',
    'text': '10M'
  },{
    'type': 'Unit',
    'unit': 'decade',
    'count': 1,
    'anchor': 'fd',
    'text': '1DEC'
  },{
    'type': 'MTD',
    'text': 'MTD'
  },{
    'type': 'QTD',
    'text': 'QTD'
  }]));

// set container id for the chart
  chart.container('container');

// initiate chart drawing
  chart.draw();




  rangePicker_external = anychart.ui.rangePicker();
  rangePicker_external.target(chart);
  rangePicker_external.render(document.getElementById('container_for_selection_ui'));




  rangeSelector_external = anychart.ui.rangeSelector();
  rangeSelector_external.target(chart);
  rangeSelector_external.render(document.getElementById('container_for_selection_ui'));

  rangePicker.format('dd-mm-yy');
  rangePicker_external.format('dd-mm-yy');
});
    