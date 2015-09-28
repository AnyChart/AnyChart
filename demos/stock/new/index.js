var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {
  perfMeter.start('Total');
  perfMeter.start('Storage initialization');
  table = anychart.data.table(0);
  table2 = anychart.data.table(0);

  perfMeter.start('Table filling');
  //debugger;

  var n = 100000;
  res1 = generate5MinsOHLCData(new Date(1970, 0), n, 5, 10, 100);
  table.addData(res1.data);
  res1.data = null;
  res2 = generate5MinsOHLCData(new Date(1970, 0), n, 5, 10, 100);
  table2.addData(res2.data);
  res2.data = null;

  perfMeter.end('Table filling');

  mapping = table.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('high', 2, 'max');
  mapping.addField('low', 3, 'min');
  mapping.addField('close', 4, 'last');
  mapping.addField('value', 5, 'sum');
  mapping2 = table2.mapAs();
  mapping2.addField('open', 1, 'first');
  mapping2.addField('high', 2, 'max');
  mapping2.addField('low', 3, 'min');
  mapping2.addField('close', 4, 'last');
  mapping2.addField('value', 5, 'sum');

  scrollerMapping = table.mapAs();
  scrollerMapping.addField('value', 4, 'last');
  scrollerMapping2 = table2.mapAs();
  scrollerMapping2.addField('value', 4, 'last');

  perfMeter.end('Storage initialization');

  perfMeter.start('Chart creation');

  chart = anychart.stock();

  //chart.plot(0).background().stroke('#ccc');
  //chart.plot(1).background().stroke('#ccc');

  chart.plot(0).ohlc(mapping)
  chart.plot(0).ohlc(mapping2)

  chart.plot(1).column(mapping)
  chart.plot(1).column(mapping2)

  chart.scroller().column(scrollerMapping);
  chart.scroller().column(scrollerMapping2);

  chart.padding(10, 10, 10, 50);
  chart.title('Stock Demo');
  chart.plot(1).height('30%');


  chart.plot(0).yAxis()
  chart.plot(1).yAxis().labels({
        textFormatter: function() {
          var val = this['tickValue'];
          var neg = val < 0;
          val = Math.abs(val);
          if (val / 1e15 >= 1) {
            return (val / 1e9).toFixed(0) + 'Q';
          } else if (val / 1e12 >= 1) {
            return (val / 1e9).toFixed(0) + 'T';
          } else if (val / 1e9 >= 1) {
            return (val / 1e9).toFixed(0) + 'B';
          } else if (val / 1e6 >= 1) {
            return (val / 1e6).toFixed(0) + 'M';
          } else if (val / 1e3 >= 1) {
            return (val / 1e3).toFixed(0) + 'K';
          }
          return neg ? '-' + val : val;
        }
      });

  chart.container('container');

  // Правая заглушка

  chart.plot(0).yAxis(1)
      .width(0)
      .orientation('right')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);
  chart.plot(1).yAxis(1)
      .width(0)
      .orientation('right')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);


  // Все гриды
  chart.plot(0).grid(0).layout('h');
  chart.plot(0).minorGrid(0).layout('h');
  chart.plot(0).grid(1).layout('v');
  chart.plot(0).minorGrid(1).layout('v');
  chart.plot(1).grid(0).layout('h');
  chart.plot(1).minorGrid(0).layout('h');
  chart.plot(1).grid(1).layout('v');
  chart.plot(1).minorGrid(1).layout('v');

  //chart.plot(0).legend().background().stroke('#ccc').enabled(true).corners(0);
  //chart.plot(1).legend().background().stroke('#ccc').enabled(true).corners(0);

  //chart.selectRange('09-04-1969', '04-14-2009');

  perfMeter.end('Chart creation');

  perfMeter.start('Chart drawing');
  chart.draw();
  perfMeter.end('Chart drawing');

  perfMeter.end('Total');
  perfMeter.print('First drawing performance',
      'Storage initialization',
      'Table filling',
      'Chart creation',
      'Chart drawing',
      'Total');
});


var streamId, upd;
function toggleStream() {
  if (isNaN(streamId)) {
    //button.value = 'Stop Stream';
    streamId = setInterval(stream, 50);
  } else {
    //button.value = 'Start Stream';
    clearInterval(streamId)
    streamId = NaN;
  }
}

function stream(points) {
  var addCount = points || 100;
  res1 = generate5MinsOHLCData(res1.lastDate, addCount, res1.lastValue, 10, res1.lastVolume)
  table.addData(res1.data, true);
  res1.data = null;
  res2 = generate5MinsOHLCData(res2.lastDate, addCount, res2.lastValue, 10, res2.lastVolume)
  table2.addData(res2.data, true);
  res2.data = null;
}