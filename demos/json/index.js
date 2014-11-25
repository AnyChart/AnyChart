var stage, stage2;
var area, bar, bubble, candlestick, column, line, markers, ohlc, rangeArea, rangeBar, rangeColumn, rangeSplineArea,
    rangeStepArea, spline, splineArea, stepLine, stepArea;


function load() {
  stage = acgraph.create('container', '100%', '100%');
  stage2 = acgraph.create('container2', '100%', '100%');

  var data1 = [];
  var data2 = [];
  var d1 = [], d2 = [];
  var t1, t2;
  var vals = [];
  for (var i = 0; i < 20; i++) {
    if (t1 = (Math.random() > 0)) {
      d1.push(i);
      data1.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) - 500,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) - 990,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    if (t2 = (Math.random() > 0.2)) {
      d2.push(i);
      data2.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) - 390,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    vals.push(i);
  }

  console.log(data2);

  var y = 0, json;

  area = new anychart.charts.Cartesian();
  area
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .area(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  area.draw();

  json = area.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  bar = new anychart.charts.Cartesian();
  bar
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'bar chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .bar(data2)
      .markers({type: 'star5', size: 11, enabled: true, fill: 'orange'})
      .pointWidth(2);
  bar.draw();

  json = bar.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  bubble = new anychart.charts.Cartesian();
  bubble
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'bubble chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  bubble
      .bubble(data2)
      .minimumSize(10)
      .maximumSize(40)
      .displayNegative(true)

      .negativeStroke('10 ' + goog.color.names.purple)
      .stroke('5 green')

      .negativeFill('red')
      .fill('yellow')

      .hoverNegativeStroke('5 ' + goog.color.names.aqua)
      .hoverStroke('15 ' + goog.color.names.blanchedalmond)

      .hoverFill(['red', 'blue'])
      .hoverNegativeFill(['yellow', 'green']);
  bubble.draw();

  json = bubble.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  candlestick = new anychart.charts.Cartesian();
  candlestick
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'candlestick chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  candlestick
      .candlestick(data2)
      .risingFill('red')
      .hoverRisingFill('green')
      .fallingFill('blue')
      .hoverFallingFill('yellow');
  candlestick.draw();

  json = candlestick.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  column = new anychart.charts.Cartesian();
  column
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'column chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  column
      .column(data2);
  column.draw();

  json = column.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  line = new anychart.charts.Cartesian();
  line
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'line chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  line
      .line(data2)
      .markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  line.draw();

  json = line.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  markers = new anychart.charts.Cartesian();
  markers
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'markers chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  markers
      .marker(data2)
      .size(5)
      .hoverSize(15)
      .type('diagonalcross')
      .hoverType('star10');
  markers.draw();

  json = markers.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  ohlc = new anychart.charts.Cartesian();
  ohlc
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'ohlc chart', fontSize: 14, fontColor: 'red', hAlign: 'center'});
  ohlc
      .ohlc(data2)
      .risingStroke('red')
      .hoverRisingStroke('green')
      .fallingStroke('blue')
      .hoverFallingStroke('yellow');
  ohlc.draw();

  json = ohlc.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  rangeArea = new anychart.charts.Cartesian();
  rangeArea
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'range area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .rangeArea(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  rangeArea.draw();

  json = rangeArea.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  rangeBar = new anychart.charts.Cartesian();
  rangeBar
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'range bar chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .rangeBar(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  rangeBar.draw();

  json = rangeBar.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  rangeColumn = new anychart.charts.Cartesian();
  rangeColumn
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'range column chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .rangeColumn(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  rangeColumn.rangeColumn(data1).markers(null);
  rangeColumn.draw();

  json = rangeColumn.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  rangeSplineArea = new anychart.charts.Cartesian();
  rangeSplineArea
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'range spline area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .rangeSplineArea(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  rangeSplineArea.draw();

  json = rangeSplineArea.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  rangeStepArea = new anychart.charts.Cartesian();
  rangeStepArea
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'range step line area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .rangeStepArea(data2).markers({type: 'star5', size: 11, enabled: true, fill: 'orange'});
  rangeStepArea.draw();

  json = rangeStepArea.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  spline = new anychart.charts.Cartesian();
  spline
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'spline chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .spline(data2);
  spline.draw();

  json = spline.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  splineArea = new anychart.charts.Cartesian();
  splineArea
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'spline area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .splineArea(data2);
  splineArea.draw();

  json = splineArea.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  stepLine = new anychart.charts.Cartesian();
  stepLine
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'step line chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .stepLine(data2);
  stepLine.draw();

  json = stepLine.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;

  stepArea = new anychart.charts.Cartesian();
  stepArea
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title({text: 'step line area chart', fontSize: 14, fontColor: 'red', hAlign: 'center'})
      .stepArea(data2);
  stepArea.draw();

  json = stepArea.serialize();
  anychart.json(json).container(stage2).draw();
}
