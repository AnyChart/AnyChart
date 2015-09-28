var colorAxisLines = '#CECECE';
var colorAxisFont = '#7c868e';
var strokeSeriesColor = '#1581B4';
var darkAccentColor = '#545f69';
var fontColor = '#212121';
var tooltipContourColor = '#c1c1c1';

var palette = anychart.palettes.distinctColors().items(['#1f73b4', '#fff', '#dd2c00', '#ffd54f', '#505558']);


var getRandom = function(min, max) {
  return Math.random() * (max - min) + min;
};
var getRandomInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getData = function (length, k1, k2, k3) {
  var array = [];
  var step = (getRandom(0, 1) + Math.log(length) * Math.LOG10E) / length;
  var current = 0;
  for (var i = 0; i < length; i++) {
    array.push([
      i,
      Math.sin(current),
      Math.sin(k1 * current) * Math.cos(k1 * current),
      Math.sin(current) + Math.sin(k2 * current),
      //Math.sin(current) * 5 * Math.pow(Math.cos(current), 2),
      Math.sin(k2 * current)/k3,
      Math.cos(current) - Math.sin(k3 * current)
    ]);
    current = current + step;
  }
  return array;
};



var setupSeriesForLine = function (dataIndex) {
  var series = chart.plot(0).line(dataSet.mapAs({value: dataIndex, index: 0, line1: 1, line2: 2, line3: 3, line4: 4, line5: 5}));
  series.stroke(palette.itemAt(dataIndex - 1));
  series.tooltip().textFormatter(function() {
    return 'Series ' + (this['series'].getIndex() + 1) + ': ' + this['value'].toFixed(5);
  });
};

var lineChart = function () {
  var lChart = anychart.stock();
  lChart.padding([30, 0, 20, 20]);
  lChart.background('#f73');
  lChart.plot(0).background('#f73');
  lChart.title().enabled(false);
  lChart.scroller(false);
  lChart.plot(0).legend(false);
  lChart.plot(0).xAxis(false);
  lChart.plot(0).yAxis(false);
  lChart.plot(0).grid().stroke('#ffffff 0.2').oddFill(null).evenFill(null).zIndex(11);

  return lChart;
};

var currentDataCount = 0;
var pointsPerSeries = 20000;
var stage = null;
var chart = null;
var dataSet = null;
var init = false;


var setChartLeft = function() {
  //var descWidth = $('#speed-test-description').width();
  //$('#chart-container').css({'left': descWidth});
};


var drawChart = function () {
  if (!dataSet)
    dataSet = anychart.data.table(0);
  if (currentDataCount)
    dataSet.removeFirst(currentDataCount);
  dataSet.addData(
      getData(pointsPerSeries, getRandomInteger(1, 7),getRandomInteger(1, 7),getRandomInteger(1, 7))
  );
  currentDataCount = pointsPerSeries;
  console.time("Drawing " + pointsPerSeries * 5 + " points");
  if (!init) {
    init = true;
    //stage = acgraph.create('chart-container');
    stage = acgraph.create('container');
    chart = lineChart();
    setupSeriesForLine(1);
    setupSeriesForLine(2);
    setupSeriesForLine(3);
    setupSeriesForLine(4);
    setupSeriesForLine(5);
    chart.tooltip().titleFormatter(function() {
      var item = /** @type {number} */(this['hoveredDate']);
      return 'Row #' + item;
    })
    chart.container(stage);
    chart.draw();
  }
  console.timeEnd("Drawing " + pointsPerSeries * 5 + " points");
};

var changeDataSet = function (n) {
  //pointsPerSeries = parseInt($('#dataLength').val()) / 5;
  pointsPerSeries = n;
  drawChart();
};

anychart.onDocumentReady(function () {
  setTimeout(function () {
    var a = performance.now();
    setChartLeft();
    drawChart();
    //console.log('Drawn', pointsPerSeries * 5, 'in', (performance.now() - a).toFixed(2), 'ms');
  }, 1)

});

//var setupBigTooltip = function (series) {
//  series.tooltip(true);
//  series.tooltip({
//    background: {fill: 'white', stroke: tooltipContourColor, corners: 3, cornerType: 'ROUND'},
//    padding: [8, 13, 8, 13],
//    anchor: 'LEFT_TOP',
//    offsetX: 10,
//    offsetY: 15
//  });
//  series.tooltip().content().useHtml(true).textSettings({
//    fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
//    fontWeight: 'normal',
//    fontSize: '12px',
//    hAlign: 'left',
//    fontColor: fontColor
//  });
//  series.tooltip().contentFormatter(function () {
//    var span_for_names = '<span style="color:' + darkAccentColor + '; font-size: 13px">';
//    var span_for_title = '<span style="color:' + colorAxisFont + '; font-size: 14px">';
//    var result = span_for_title + 'Point ' + this.index + ' </span><br/><br/>';
//    result = result + span_for_names + 'Blue line: </span>' + this.getDataValue('line1').toFixed(4) + '<br/>';
//    result = result + span_for_names + 'White line: </span>' + this.getDataValue('line2').toFixed(4) + '<br/>';
//    result = result + span_for_names + 'Red line: </span>' + this.getDataValue('line3').toFixed(4) + '<br/>';
//    result = result + span_for_names + 'Yellow line: </span>' + this.getDataValue('line4').toFixed(4) + '<br/>';
//    result = result + span_for_names + 'Dark line: </span>' + this.getDataValue('line5').toFixed(4) + '<br/>';
//    return result;
//  });
//};