var table, table2, mapping, mapping2, chart, currentDate, currentVal;
var n = 100000;

anychart.onDocumentReady(function() {
  var data = generate5MinsOHLCData(new Date(1970, 0), 1000000, 5, 10, 100);
  var data2 = generate5MinsOHLCData(new Date(1990, 0), 1000000, 5, 10, 100);
  //var data = generateDailyOHLCData(new Date(1000, 0), n, 1000, 100, false);
  //var data2 = generateDailyOHLCData(new Date(1100, 0), n, 2000, 100, true);
  if (data.lastDate < data2.lastDate) {
    currentDate = data2.lastDate;
    currentVal = data2.lastValue;
  } else {
    currentDate = data.lastDate;
    currentVal = data.lastValue;
  }
  perfMeter.start('Total');
  perfMeter.start('Storage initialization');
  table = anychart.data.table(0);
  table.addData(data.data);

  mapping = table.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');
  mapping.addField('value', 5, 'sum'); // volume

  table2 = anychart.data.table(0);
  table2.addData(data2.data);

  mapping2 = table2.mapAs();
  mapping2.addField('open', 1, 'first');
  mapping2.addField('high', 2, 'max');
  mapping2.addField('low', 3, 'min');
  mapping2.addField('close', 4, 'last');
  mapping2.addField('value', 5, 'sum'); // volume
  //preloadAggregate();
  perfMeter.end('Storage initialization');

  perfMeter.start('Drawing total');
  chart = anychart.stock();
  chart.padding(10, 10, 10, 75);
  chart.margin(0);
  chart.title('STOCK!');
  chart.plot(0).background().enabled(false).stroke('black').fill('none');
  chart.plot(0).ohlc(mapping);
  chart.plot(0).ohlc(mapping2);
  chart.plot(0).yAxis().enabled(true).drawFirstLabel(true).drawLastLabel(true);
  chart.plot(0).xAxis().enabled(true).background({fill: 'none'}).labels({fontWeight: 'bold'}).minorLabels(true).overlapMode('no');
  chart.plot(1).top('75%');
  chart.plot(1).background().enabled(false).stroke('black').fill('none');
  chart.plot(1).column(mapping).fill('#c00 0.5').stroke('#a00');
  chart.plot(1).column(mapping2).fill('#0c0 0.5').stroke('#0a0');
  chart.plot(1).yAxis().enabled(true).drawFirstLabel(true).drawLastLabel(false);
  chart.plot(1).xAxis().enabled(true).background({fill: 'none'}).labels({fontWeight: 'bold'}).minorLabels(true).overlapMode('no');
  chart.xScale('scatter');
  //chart.xScale().fullMaximum(table2.getStorage())
  chart.scroller(true);
  chart.container('container');
  chart.draw();
  perfMeter.end('Total');
  perfMeter.print('First drawing performance',
      'Storage initialization',
      'Drawing total',
      'Total');
});
