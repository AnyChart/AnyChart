var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {

  var n = 300000;
  //rawData = generate5MinsOHLCData(new Date(1970, 0), n, 100, 10, 100);
  rawData = get_msft_data();

  perfMeter.start('Total');

  perfMeter.start('Storage initialization');

  table = anychart.data.table(0);
  table.addData(rawData);
  mapping = table.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');
  mapping.addField('value', 4, 'last');

  //var c = table.createComputer(mapping);
  //c.addOutputField('asdf', 'qwer');
  //c.setContext({a: 100});
  //c.setCalculationFunction(function(row) {
  //  row.set('asdf', row.get('value') + this.a);
  //});

  perfMeter.end('Storage initialization');

  perfMeter.start('Chart creation');

  chart = anychart.stock();
  chart.padding(10, 10, 10, 50);
  //chart.plot(0).line(mapping);
  chart.plot(0).height('40%');
  chart.plot(0).ohlc(mapping);
  chart.plot(0).ema(mapping).series().stroke('green');
  chart.plot(0).sma(mapping).series().stroke('red');

  var macd = chart.plot(1).macd(mapping);
  macd.macdSeries().stroke('#808');
  macd.signalSeries().stroke('#f0f');
  chart.plot(1).yAxis();

  chart.plot(2).rsi(mapping);
  chart.plot(2).yAxis();

  chart.plot(3).roc(mapping, 20);
  chart.plot(3).yAxis();

  //chart.plot(0).line(table, {value: c.getFieldIndex('asdf')});

  chart.plot(0).yAxis();
  //chart.plot(0).xAxis(false);
  //chart.plot(0).legend(true);
  chart.scroller().line(mapping);
  //chart.scroller().sma(mapping, 20).series().stroke('red').selectedStroke('red');
  chart.title('Stock Demo');
  chart.container('container');

  perfMeter.end('Chart creation');

  perfMeter.start('Chart drawing');
  chart.draw();
  perfMeter.end('Chart drawing');

  perfMeter.end('Total');
  perfMeter.print('First drawing performance',
      'Storage initialization',
      'Chart creation',
      'Chart drawing',
      'Total');
  rawData.data = null;

  //chart.title().listen('click', toggleStream);
});


var streamId, upd;
function toggleStream() {
  if (isNaN(streamId)) {
    //button.value = 'Stop Stream';
    streamId = setInterval(stream, 80);
  } else {
    //button.value = 'Start Stream';
    clearInterval(streamId)
    streamId = NaN;
  }
}

function stream(points) {
  var addCount = 10000;
  rawData = generate5MinsOHLCData(rawData.lastDate, addCount, rawData.lastValue, 10, rawData.lastVolume)
  perfMeter.start(addCount);
  table.addData(rawData.data, true);
  rawData.data = null;
  perfMeter.end(addCount);
  perfMeter.print('Streaming',
      addCount);
}