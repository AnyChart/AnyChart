var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(600, 400, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  var dataSet = new anychart.data.Set([
    ['03-14', 107101, 1472897, 120712, 1036542],
    ['03-15', 114212, 1077489, 125311, 1153214],
    ['03-16', 105321, 1524121, 210012, 2196482],
    ['03-17', 118421, 1651112, 170127, 1504787],
    ['03-18', 107613, 1501902, 132739, 1174230],
    ['03-19', 110261, 1620912, 125219, 1104324],
    ['03-20', 103812, 1500511, 115214, 1002097]
  ]);

  chart = new anychart.cartesian.Chart();
  chart.title().text('Visits and Views');


  var xAxis = chart.xAxis();
  xAxis.title('Days');

  var mainScale = chart.yScale();
  mainScale.ticks().count(10);
  var additionalScale = new anychart.scales.Linear();
  additionalScale.ticks().count(10);

  var yAxisLeft = chart.yAxis().orientation('left');
  yAxisLeft.title('Visits').scale(mainScale);
  yAxisLeft.labels().textFormatter(function(obj) {
    obj.value += '';
    x = obj.value.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  });
  var yAxisRight = chart.yAxis().orientation('right');
  yAxisRight.title('Views').scale(additionalScale);
  yAxisRight.labels().textFormatter(function(obj) {
    obj.value += '';
    x = obj.value.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  });

  chart.grid().scale(mainScale);
  chart.minorGrid()
      .scale(mainScale)
      .oddFill('none')
      .evenFill('none')
      .stroke('grey .1');
  chart.grid()
      .scale(chart.xScale())
      .direction('vertical')
      .oddFill('none')
      .evenFill('none')
      .stroke('grey .3');


  chart.line(dataSet.mapAs({'value': [1], 'x': [0]}))
      .name('Visit somepage.com')
      .yScale(mainScale)
      .markers()
      .size(3)
      .type('circle')
      .enabled(true);
  chart.line(dataSet.mapAs({'value': [2], 'x': [0]}))
      .name('Views of somepage.com')
      .yScale(additionalScale)
      .markers()
      .size(3)
      .type('circle')
      .enabled(true);
  chart.line(dataSet.mapAs({'value': [3], 'x': [0]}))
      .name('Visit otherpage.com')
      .yScale(mainScale)
      .markers()
      .size(3)
      .type('circle')
      .enabled(true);
  chart.line(dataSet.mapAs({'value': [4], 'x': [0]}))
      .name('Views of otherpage.com')
      .yScale(additionalScale)
      .markers()
      .size(3)
      .type('circle')
      .enabled(true);

  chart.legend()
      .position('bottom')
      .title(null)
      .titleSeparator(null)
      .enabled(true)
      .itemsLayout('horizontal')
      .padding(10);

  chart.background(null);
  chart.margin(5);

  chart
      .container(stage)
      .draw();

  var watermark = new anychart.elements.Label();
  watermark.text('AnyChart Trial Version')
      .fontOpacity(.15)
      .adjustFontSize(true, false)
      .width('100%')
      .height('100%')
      .vAlign('center')
      .hAlign('center')
      .parentBounds(stage.getBounds())
      .padding(20)
//      .pointerEvents('none')
      .container(stage)
      .draw();
}
