anychart.onDocumentReady(function() {
  var stage = acgraph.create('container');
// The data that have been used for this sample can be taken from the CDN
// http://cdn.anychart.com/csv-data/csco-daily.js

// create data table on loaded data
  dataTable = anychart.data.table(0, 'MM/dd/yyyy', 2, Date.UTC(2000, 0, 1, 9, 30));
  // dataTable = anychart.data.table();
  dataTable.addData(get_csco_daily_data());

// map loaded data for the ohlc series
  var mapping = dataTable.mapAs({'open': 1, 'high': 2, 'low': 3, 'close': 4});

// map loaded data for the scroller
  var scrollerMapping = dataTable.mapAs();
  scrollerMapping.addField('value', 5);

// create stock stock
  stock = anychart.stock();

// create first plot on the stock
  var plot = stock.plot(0);
  plot.grid().enabled(true);
  plot.grid(1).enabled(true).layout('vertical');
  plot.minorGrid().enabled(true);
  plot.minorGrid(1).enabled(true).layout('vertical');

  stock.tooltip().title().useHtml(true);
  stock.tooltip().titleFormatter(function() {
    var fmt = anychart.format.getDateTimeFormat(anychart.format.getIntervalIdentifier('ms', 'y'));
    return '<b>Original data:</b><br>' + anychart.format.dateTime(
            this['hoveredDate'], 'MM/dd/yyyy', -690
        ) +
        '<br><br><b>Table parsed it as </b><br>(pattern: "MM/dd/yyyy", offset: 2, baseDate: Date.UTC(2000, 0, 1, 9, 30)):' +
        '<br><br><b>That\'s why in table they are stored as </b><br>' + anychart.format.dateTime(
            this['hoveredDate'], 'yyyy/MM/dd HH:mm:ss.SSS ZZZZ'
        ) +
        '<br><br><b>But we can transform the date to other timezone: </b><br>' + anychart.format.dateTime(
            this['hoveredDate'], 'yyyy/MM/dd HH:mm:ss.SSS ZZZZ', 360
        ) +
        '<br><br><b>Suggested format for year-ms is "' + fmt + '":</b><br>' + anychart.format.dateTime(this['hoveredDate'], fmt);
  })

// create EMA indicators with period 50
  plot.ema(dataTable.mapAs({'value': 4})).series().stroke('1.5 #455a64');

  var series = plot.candlestick(mapping).name('CSCO');
  series.legendItem().iconType('risingfalling');

// create scroller series with mapped data
  stock.scroller().candlestick(mapping);

// set container id for the stock
  stock.container(stage);

// set stock selected date/time range
  stock.selectRange('2007-01-03', '2007-05-20');
  stock.width('50%');

// initiate stock drawing
  stock.draw();

  anychart.format.inputDateTimeFormat("dd HH:mm");
  anychart.format.inputBaseDate(Date.UTC(2007, 7));
  chart = anychart.financial();
  chart.candlestick([
    ['28 11:18', 511.53, 514.98, 505.79, 506.40],
    ['29 12:14', 507.84, 513.30, 507.23, 512.88],
    ['30 13:16', 512.36, 515.40, 510.58, 511.40],
    ['31 14:13', 513.10, 516.50, 511.47, 515.25]
  ]);
  chart.getSeriesAt(0).tooltip().titleFormatter(function() {
    return '<b>Original data:</b><br>' + anychart.format.dateTime(
            this['x'], "dd HH:mm"
        ) +
        '<br><br><b>Parsing with params:</b><br>(pattern: "dd HH:mm", baseDate: Date.UTC(2007, 7)):' +
        '<br><br><b>That\'s why we store it as </b><br>' + anychart.format.dateTime(
            this['x'], 'yyyy/MM/dd HH:mm:ss.SSS ZZZZ'
        ) +
        '<br><br><b>But we can transform the date to other timezone: </b><br>' + anychart.format.dateTime(
            this['x'], 'yyyy/MM/dd HH:mm:ss.SSS ZZZZ', 360
        );
  }).title().useHtml(true);
  chart.container(stage);
  chart.left('50%');
  chart.draw();

});
