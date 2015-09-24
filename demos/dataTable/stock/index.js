var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {
  perfMeter.start('Total');
  perfMeter.start('Storage initialization');
  table = anychart.data.table(0);
  perfMeter.start('CSV parsing + table filling');
  var data = getData();
  for (var q = 0; q < data.length; q++)
    table.addData(data[q], {ignoreFirstRow: true});
  perfMeter.end('CSV parsing + table filling');

  mapping = table.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');
  mapping.addField('value', 5, 'sum');
  perfMeter.end('Storage initialization');

  perfMeter.start('Chart creation');
  chart = anychart.stock();
  chart.title('STOCK!');
  chart.padding(10, 10, 10, 50);
  chart.plot(0).ohlc(mapping);
  chart.plot(0).yAxis();
  chart.plot(0).grid(0).layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).minorGrid().evenFill('none').oddFill('none').stroke('black 0.1').layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).grid(1).evenFill('none').oddFill('none').layout(anychart.enums.Layout.VERTICAL);
  chart.plot(0).xAxis().enabled(true).background({fill: 'none'}).labels({fontWeight: 'bold'}).minorLabels(true);
  chart.plot(1).height('30%');
  chart.plot(1).column(mapping);
  chart.plot(1).grid(0).layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).minorGrid().evenFill('none').oddFill('none').stroke('black 0.1').layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).grid(1).evenFill('none').oddFill('none').layout(anychart.enums.Layout.VERTICAL);
  chart.plot(1).yAxis().labels().textFormatter(function() {
    var val = this['tickValue'];
    if (val / 1e9 > 1) {
      return (val / 1e9).toFixed(0) + 'B';
    } else if (val / 1e6 > 1) {
      return (val / 1e6).toFixed(0) + 'M';
    } else if (val / 1e3 > 1) {
      return (val / 1e6).toFixed(0) + 'K';
    }
    return val;
  });
  chart.plot(1).xAxis().enabled(true).background({fill: 'none'}).labels({fontWeight: 'bold'}).minorLabels(true);
  chart.scroller().enabled(true);
  chart.container('container');
  perfMeter.end('Chart creation');

  perfMeter.start('Chart drawing');
  chart.draw();
  perfMeter.end('Chart drawing');

  perfMeter.end('Total');
  perfMeter.print('First drawing performance',
      'Storage initialization',
      'CSV parsing + table filling',
      'Chart creation',
      'Chart drawing',
      'Total');
});
