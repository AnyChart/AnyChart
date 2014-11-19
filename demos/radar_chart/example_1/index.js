var chart;
anychart.onDocumentLoad(function() {
  var dataSet = anychart.data.set([
        ['GDP', 1, 0.11982978723404256, 0.6180425531914894],
        ['GDP Real Growth Rate', 0.3666666666666667, 0.5583333333333333, 0.7583333333333333],
        ['Infant Mortality', 0.06578947368421052, 0.15576923076923077, 0.24473684210526317],
        ['Life Expectancy', 0.9576093653727663, 0.8268638324091188, 0.8905730129390017],
        ['Population', 0.22638827767366515, 0.10979008847837246, 1],
        ['Area', 0.5390698290165805, 1, 0.5487479259581779],
        ['Density', 0.02995156531259858, 0.00783120233080335, 0.1299664111937944],
        ['Population Growth Rate', 0.3087248322147651, -0.12416107382550336, 0.19463087248322147]
      ]);

  var data1 = dataSet.mapAs({x: [0], value: [1]});
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  chart = anychart.radarChart()
      .container('container')
      .startAngle(0);

  chart.title().text('Comparison Chart');

  chart.yScale().minimum(-.2).maximum(1).ticks().interval(.2);
  chart.yAxis().enabled(true).minorTicks().enabled(false);

  chart.legend().enabled(true).margin().top(20);

  chart.grid(0).oddFill('white').evenFill('white');
  chart.grid(1).oddFill(null).evenFill(null);

  chart.background()
      .enabled(true);
  chart.margin(20);
  chart.padding(10);

  chart.line(data1).name('USA');
  chart.line(data2).name('Russia');
  chart.line(data3).name('China');

  chart.draw();
});