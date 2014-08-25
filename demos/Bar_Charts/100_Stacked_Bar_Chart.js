anychart.onDocumentReady(function() {

  //data
  var data = [
    ['White', 507, 511, 506, 510],
    ['Black', 510, 511, 506, 507],
    ['Long lower shadow', 508.5, 511, 506, 510],
    ['Long upper shadow', 508.5, 511, 506, 507],
    ['Hammer', 510, 511, 506, 511],
    ['Inverted hammer', 507, 511, 506,506],
    ['Spinning top white', 508, 511, 506, 509],
    ['Spinning top black', 509, 511, 506, 508],
    ['Doji', 508.5, 510, 507, 508.5],
    ['Long legged doji', 508.5, 511, 506, 508.5],
    ['Dragonfly doji', 511, 511, 506, 511],
    ['Gravestone doji', 506, 511, 506, 506],
    ['Marubozu white', 506, 511, 506, 511],
    ['Marubozu black', 511, 511, 506, 506]
  ];

  //chart type
  chart = anychart.lineChart();

  //disabling titles
  chart.title().enabled(false);
  chart.xAxis().title().enabled(false);
  chart.yAxis().title().enabled(false);

  //rotate x axis labels
  chart.xAxis().labels().rotation(-90);

  //adjust x scale type
  chart.xScale(anychart.scales.ordinal());

  //set data and adjust colors
  chart.candlestick(data)
      .fallingFill('black')
      .fallingStroke('black')
      .risingFill('white')
      .risingStroke('black')
      .tooltip().enabled(true);

  //draw
  chart.container('container').draw();
});