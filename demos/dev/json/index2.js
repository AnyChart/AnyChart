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

  data2.push({x: i, value: 2900, marker: {type: 'star5', size: 10, enabled: true, fill: 'red'}});

  var y = 0, json;

  var labels = new anychart.elements.Multilabel();
  labels.enabled(true).anchor('bottom').background({fill: 'red', enabled: true});

  var scale = new anychart.scales.Linear();
  scale.ticks().interval(10);

  area = new anychart.cartesian.Chart();
  area
      .bounds(0, y, '100%', 200)
      .container(stage)
      .title(null)
      .legend({enabled: true, width: 50, height: 300, align: 'left'})
      .lineMarker({enabled: true, value: 2, direction: 'vertical', stroke: '2 red'})
      .rangeMarker({enabled: true, from: 1, to: 3, direction: 'vertical', fill: 'yellow 0.5'})
      .textMarker({enabled: true, value: 2, orientation: 'top', align: 'center', text: 'text!'})
  area.legend().paginator({layout: 'vertical'}).title({text: 'legend', enabled: true}).titleSeparator({enabled: true});
  area.spline(data2)
      .yScale(scale)
      .labels(labels);
//      .enabled(true).anchor('bottom').background({fill: 'green', enabled: true});
  area.grid({oddFill: 'white 0.2', evenFill: 'gray 0.2'});
  area.grid({direction: 'vertical', oddFill: 'white 0.2', evenFill: 'gray 0.2'});
  area.xAxis().title(null);
  area.xScale().ticks().interval(3);
  area.draw();

  json = area.serialize();
  anychart.json(json).container(stage2).draw();

  y += 210;
}
