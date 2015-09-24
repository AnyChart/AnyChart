var candle_data = [
  ['White', 507, 511, 506, 510],
  ['Black', 510, 511, 506, 507],
  ['Long lower shadow', 508.5, 511, 506, 510],
  ['Long upper shadow', 508.5, 511, 506, 507],
  ['Hammer', 510, 511, 506, 511],
  ['Inverted hammer', 507, 511, 506, 506],
  ['Spinning top white', 508, 511, 506, 509],
  ['Spinning top black', 509, 511, 506, 508],
  ['Doji', 508.5, 510, 507, 508.5],
  ['Long legged doji', 508.5, 511, 506, 508.5],
  ['Dragonfly doji', 511, 511, 506, 511],
  ['Gravestone doji', 506, 511, 506, 506],
  ['Marubozu white', 506, 511, 506, 511],
  ['Marubozu black', 511, 511, 506, 506]
];

var ohlc_data = [
    {x: Date.UTC(2007, 7, 28), open:511.53, high:514.98, low:505.79, close:506.40},
    {x: Date.UTC(2007, 7, 29), open:507.84, high:513.30, low:507.23, close:512.88},
    {x: Date.UTC(2007, 7, 30), open:512.36, high:515.40, low:510.58, close:511.40},
    {x: Date.UTC(2007, 7, 31), open:513.10, high:516.50, low:511.47, close:515.25},
    {x: Date.UTC(2007, 8, 4), open:515.02, high:528.00, low:514.62, close:525.15}
];

var FinancialChart_1 = function() {
  var chart = anychart.financial();

  var xLabels = chart.xAxis().labels();
  xLabels.textFormatter(function() {
      return this.value;
  });
  xLabels.rotation(-90).padding(0, 15, 0, 0);
  chart.xScale(anychart.scales.ordinal());
  chart.candlestick(candle_data);
  return chart;
};

var FinancialChart_2 = function() {
  var chart = anychart.financial();
  chart.title('Minimum and Maximum Value');

  chart.xScale()
    .minimum(Date.UTC(2007, 7, 27))
    .maximum(Date.UTC(2007, 8, 5))
    .ticks().interval(0, 0, 1);

  chart.ohlc(ohlc_data);

  chart.yScale().minimum('505').maximum('530').ticks().interval(5);

  chart.xAxis().title('Day');
  chart.yAxis().title('Price');

  chart.xAxis().staggerLines(1).labels().textFormatter(function(value) {
    var date = new Date(value['tickValue']);
    var options = {
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  });
  return chart;
};

var FinancialChart_3 = function() {
  var chart = anychart.financial();
  chart.title('Minimum and Maximum Value');

  chart.xScale()
    .minimum(Date.UTC(2007, 7, 27))
    .maximum(Date.UTC(2007, 8, 5))
      .ticks().interval(0, 0, 1);

  var series = chart.ohlc(ohlc_data);
  series.labels().enabled(true);
  series.markers().enabled(true);

  chart.yScale().minimum('505').maximum('530').ticks().interval(5);

  chart.xAxis().title('Day');
  chart.yAxis().title('Price');

  chart.xAxis().staggerLines(1).labels().textFormatter(function(value) {
    var date = new Date(value['tickValue']);
    var options = {
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  });
  return chart;
};


anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="financial_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="financial_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="financial_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = FinancialChart_1();
  chart1.container('financial_1');
  chart1.draw();
  var chart2 = FinancialChart_2();
  chart2.container('financial_2');
  chart2.draw();
  var chart3 = FinancialChart_3();
  chart3.container('financial_3');
  chart3.draw();
});
