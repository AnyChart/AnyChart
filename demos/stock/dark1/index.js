var table, mapping, xScale, yScale, stage, controller, chart;
//anychart.DEVELOP = false;
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

  var scrollerMapping = table.mapAs();
  scrollerMapping.addField('value', 6, 'last');
  perfMeter.end('Storage initialization');

  perfMeter.start('Chart creation');
  chart = anychart.stock();
  chart.background('#2B2B2B');
  chart.title({
    fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
    fontWeight: 'normal',
    fontSize: '16px',
    fontColor: '#888888',
    padding: [0, 0, 10, 0],
    text: 'Stock Demo'
  });
  chart.padding(10, 10, 10, 50);

  chart.xScale('ordinal');

  chart.plot(1).height('30%');

  chart.plot(0).ohlc(mapping)
      .fallingStroke('rgb(204,120,50)')
      .risingStroke('rgb(165,194,92)');

  chart.plot(1).column(mapping)
      .stroke(null)
      .fill('#999 .6');

  chart.plot(0).yAxis(0)
      .stroke('#42484D')
      .ticks({
        stroke: '#42484D'
      }).minorTicks({
        stroke: '#373B3E'
      }).labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [0, 5, 0, 0],
        margin: 0
      });
  chart.plot(0).yAxis(1)
      .width(0)
      .orientation('right')
      .stroke('#42484D')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);

  chart.plot(1).yAxis()
      .stroke('#42484D')
      .ticks({
        stroke: '#42484D'
      })
      .minorTicks({
        stroke: '#373B3E'
      }).labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [0, 5, 0, 0],
        margin: 0,
        textFormatter: function() {
          var val = this['tickValue'];
          var neg = val < 0;
          val = Math.abs(val);
          if (val / 1e9 >= 1) {
            return (val / 1e9).toFixed(0) + 'B';
          } else if (val / 1e6 >= 1) {
            return (val / 1e6).toFixed(0) + 'M';
          } else if (val / 1e3 >= 1) {
            return (val / 1e6).toFixed(0) + 'K';
          }
          return neg ? '-' + val : val;
        }
      });
  chart.plot(1).yAxis(1)
      .width(0)
      .orientation('right')
      .stroke('#42484D')
      .labels(false)
      .minorLabels(false)
      .ticks(false)
      .minorTicks(false);


  chart.plot(0).xAxis()
      .enabled(true)
      .background({
        stroke: null,
        fill: '#2B2B2B'
      }).height(25)
      .labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [5, 0, 0, 0],
        margin: 0
      }).minorLabels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [5, 0, 0, 0],
        margin: 0
      });

  chart.plot(1).xAxis()
      .enabled(true)
      .background({
        stroke: null,
        fill: '#2B2B2B'
      }).height(25)
      .labels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [5, 0, 0, 0],
        margin: 0
      }).minorLabels({
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontWeight: 'normal',
        fontSize: '11px',
        fontColor: '#888888',
        padding: [5, 0, 0, 0],
        margin: 0
      });


  //chart.plot(1).width('50%').right(0);
  chart.plot(0).grid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#42484D')
      .zIndex(11)
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).minorGrid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#373B3E')
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(0).grid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#42484D')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(0).minorGrid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#373B3E')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(0).dateTimeHighlighter('#999');
  chart.plot(1).dateTimeHighlighter('#999');

  chart.plot(1).grid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#42484D')
      .zIndex(11)
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).minorGrid(0)
      .evenFill('none')
      .oddFill('none')
      .stroke('#373B3E')
      .layout(anychart.enums.Layout.HORIZONTAL);
  chart.plot(1).grid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#42484D')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(1).minorGrid(1)
      .evenFill('none')
      .oddFill('none')
      .stroke('#373B3E')
      .layout(anychart.enums.Layout.VERTICAL);
  chart.plot(1).xAxis().ticks(true).labels().anchor('leftTop').offsetX(5);

  chart.scroller()
      .enabled(true)
      .thumbs({
        stroke: '#2B2B2B',
        fill: '#545f69',
        autoHide: false
      })
      .outlineStroke('#2B2B2B')
      .fill('#2B2B2B')
      .selectedFill('#42484D')
      //.height('50%');
  chart.scroller().line(scrollerMapping).stroke('#999 .6').selectedStroke('#999');
  //chart.scroller().ohlc(mapping);
  chart.scroller().xAxis()
      .enabled(true)
      //.overlapMode('allow')
      .labels()
        .enabled(true)
        .anchor('leftTop');
  chart.scroller().xAxis().ticks()
      .enabled(true)
      .stroke('#ccc 0.5');
  //chart.scroller().yScale()
  //    .minimumGap(0)
  //    .maximumGap(0);

  chart.selectRange('09-04-1969', '04-14-2009');

  chart.container('container');
  perfMeter.end('Chart creation');

  perfMeter.start('Chart drawing');
  chart.draw();
  perfMeter.end('Chart drawing');

  //chart.plot(0).listen('mouseover', listener);
  //chart.plot(0).listen('mousemove', listener);
  //chart.plot(0).listen('mouseout', listener);
  //chart.plot(0).listen('click', listener);
  //chart.plot(0).listen('mousedown', listener);
  //chart.plot(0).listen('mouseup', listener);
  //
  //chart.plot(1).listen('mouseover', listener);
  //chart.plot(1).listen('mousemove', listener);
  //chart.plot(1).listen('mouseout', listener);
  //chart.plot(1).listen('click', listener);
  //chart.plot(1).listen('mousedown', listener);
  //chart.plot(1).listen('mouseup', listener);
  //
  //chart.scroller().listen('mouseover', listener);
  //chart.scroller().listen('mousemove', listener);
  //chart.scroller().listen('mouseout', listener);
  //chart.scroller().listen('click', listener);
  //chart.scroller().listen('mousedown', listener);
  //chart.scroller().listen('mouseup', listener);
  //
  //chart.listen('mouseover', listener);
  //chart.listen('mousemove', listener);
  //chart.listen('mouseout', listener);
  //chart.listen('click', listener);
  //chart.listen('mousedown', listener);
  //chart.listen('mouseup', listener);

  //chart.listen('selectedrangechangestart', function() {
  //  return false;
  //});
  //chart.listen('selectedrangechangestart', l);
  //chart.listen('selectedrangechangestart', l);
  //chart.listen('selectedrangebeforechange', l);
  //chart.listen('selectedrangechange', l);
  //chart.listen('selectedrangechangefinish', l);

  perfMeter.end('Total');
  perfMeter.print('First drawing performance',
      'Storage initialization',
      'CSV parsing + table filling',
      'Chart creation',
      'Chart drawing',
      'Total');
});

function l(e) {
  console.log(e.type, e.source, e);
}

function listener(e) {
  console.log(e.type,
      'target:', e.target == chart ? 'Chart' : e.target == chart.plot(0) ? 'Plot 0' : e.target == chart.plot(1) ? 'Plot 1' : e.target == chart.scroller() ? 'scroller' : 'Unknown',
      'current target:', e.currentTarget == chart ? 'Chart' : e.currentTarget == chart.plot(0) ? 'Plot 0' : e.currentTarget == chart.plot(1) ? 'Plot 1' : e.target == chart.scroller() ? 'scroller' : 'Unknown'
  );
}
