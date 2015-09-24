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
  chart.background('#fff');
  chart.title({
    fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
    fontWeight: 'normal',
    fontSize: '16px',
    fontColor: '#7c868e',
    padding: 0,
    text: 'Stock Demo'
  });
  chart.padding(10, 10, 10, 50);

  chart.xScale('scatter');

  chart.plot(1).height('30%');

  chart.plot(0).ohlc(mapping)
      .fallingStroke('1.4 #ef6c00')
      .risingStroke('1.4 #1976d2');

  chart.plot(1).column(mapping)
      .stroke(null)
      .fill('#64b5f6 .8');

  chart.plot(0).yAxis(0)
      .stroke('#CECECE')
      .ticks({
        stroke: '#CECECE'
      }).minorTicks({
        stroke: '#EAEAEA'
      }).labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [0, 5, 0, 0],
        margin: 0
      });
  chart.plot(0).yAxis(1)
      .width(0)
      .orientation('right')
      .stroke('#CECECE')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);

  chart.plot(1).yAxis()

  chart.plot(1).yAxis()
      .stroke('#CECECE')
      .ticks({
        stroke: '#CECECE'
      })
      .minorTicks({
        stroke: '#EAEAEA'
      }).labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [0, 5, 0, 0],
        margin: 0,
        textFormatter: function() {
          var val = this['tickValue'];
          if (val / 1e9 > 1) {
            return (val / 1e9).toFixed(0) + 'B';
          } else if (val / 1e6 > 1) {
            return (val / 1e6).toFixed(0) + 'M';
          } else if (val / 1e3 > 1) {
            return (val / 1e6).toFixed(0) + 'K';
          }
          return val;
        }
      });
  chart.plot(1).yAxis(1)
      .width(0)
      .orientation('right')
      .stroke('#CECECE')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);


  chart.plot(0).xAxis()
      .enabled(true)
      .background({
        stroke: null,
        fill: '#FFF'
      }).height(25)
      .labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [5, 0, 0, 0],
        margin: 0,
        textFormatter: function() {
          var date = this['tickValue'];
          switch (this['groupingUnit']) {
            case 'year':
            case 'semester':
            case 'quarter':
            case 'month':
            case 'thirdofmonth':
              return anychart.utils.formatDateTime(date, 'yyyy');
            case 'week':
            case 'day':
              return anychart.utils.formatDateTime(date, 'yyyy MMM');
            case 'hour':
              return anychart.utils.formatDateTime(date, 'yyyy MMM dd');
            case 'minute':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'second':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'millisecond':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
          }
          return anychart.utils.formatDateTime(date, 'yyyy MMM dd');
        }
      }).minorLabels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [5, 0, 0, 0],
        margin: 0,
        textFormatter: function() {
          var date = this['tickValue'];
          switch (this['groupingUnit']) {
            case 'year':
            case 'semester':
            case 'quarter':
            case 'month':
            case 'thirdofmonth':
              return anychart.utils.formatDateTime(date, 'yyyy');
            case 'week':
            case 'day':
              return anychart.utils.formatDateTime(date, 'MMM');
            case 'hour':
              return anychart.utils.formatDateTime(date, 'MMM dd');
            case 'minute':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'second':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
            case 'millisecond':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
          }
          return anychart.utils.formatDateTime(date, 'HH:mm:ss.SSS');
        }
      });

  chart.plot(1).xAxis()
      .enabled(true)
      .background({
        stroke: null,
        fill: '#FFF'
      }).height(25)
      .labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [5, 0, 0, 0],
        margin: 0,
        textFormatter: function() {
          var date = this['tickValue'];
          switch (this['groupingUnit']) {
            case 'year':
            case 'semester':
            case 'quarter':
            case 'month':
            case 'thirdofmonth':
              return anychart.utils.formatDateTime(date, 'yyyy');
            case 'week':
            case 'day':
              return anychart.utils.formatDateTime(date, 'yyyy MMM');
            case 'hour':
              return anychart.utils.formatDateTime(date, 'yyyy MMM dd');
            case 'minute':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'second':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'millisecond':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
          }
          return anychart.utils.formatDateTime(date, 'yyyy MMM dd');
        }
      }).minorLabels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#7c868e',
        padding: [5, 0, 0, 0],
        margin: 0,
        textFormatter: function() {
          var date = this['tickValue'];
          switch (this['groupingUnit']) {
            case 'year':
            case 'semester':
            case 'quarter':
            case 'month':
            case 'thirdofmonth':
              return anychart.utils.formatDateTime(date, 'yyyy');
            case 'week':
            case 'day':
              return anychart.utils.formatDateTime(date, 'MMM');
            case 'hour':
              return anychart.utils.formatDateTime(date, 'MMM dd');
            case 'minute':
              return anychart.utils.formatDateTime(date, 'dd HH:mm');
            case 'second':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
            case 'millisecond':
              return anychart.utils.formatDateTime(date, 'HH:mm:ss');
          }
          return anychart.utils.formatDateTime(date, 'HH:mm:ss.SSS');
        }
      });


  chart.plot(0).grid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#CECECE')
      .zIndex(11)
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).minorGrid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#EAEAEA')
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).grid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#CECECE')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(0).minorGrid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#EAEAEA')
      .layout(anychart.enums.Layout.VERTICAL);

  chart.plot(1).grid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#CECECE')
      .zIndex(11)
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).minorGrid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#EAEAEA')
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).grid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#CECECE')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(1).minorGrid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#EAEAEA')
      .layout(anychart.enums.Layout.VERTICAL);

  chart.scroller()
      .enabled(true);

  chart.selectRange('09-04-1969', '04-14-2009');

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
