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

  chart = anychart.radar()
      .container('container')
      .startAngle(0);

  chart.title().text('Comparison Chart');

  chart.yScale().minimum(-.2).maximum(1).ticks().interval(.2);

  chart.yAxis().stroke('rgb(51,51,51)').enabled(true).minorTicks().enabled(false);
  chart.yAxis().ticks().stroke('rgb(51,51,51)');

  chart.xAxis().stroke('rgb(192,192,192)');

  chart.legend().enabled(true).margin().top(20);

  chart.grid(0).oddFill('white').evenFill('white').stroke('rgb(221,221,221)');
  chart.grid(1).oddFill(null).evenFill(null).stroke('rgb(192,192,192)');

  chart.margin().bottom(40);

  var background = chart.background().enabled(true);
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

  var label = chart.label();
  label.text("This chart compares countries by using specific indicators.\n" +
  "For each indicator, the value 1 is assigned to the country that has the highest value.\n" +
  "Other countries have their value computed as a proportion of the country with the highest value.");
  label.anchor(acgraph.vector.Anchor.CENTER_BOTTOM);
  label.position(acgraph.vector.Anchor.CENTER_BOTTOM);
  label.fontWeight('normal');
  label.fontSize(11);
  label.fontFamily('tahoma');
  label.fontColor('rgb(35,35,35)');
  label.offsetY(15);


  var series1 = chart.line(data1).name('USA');
  var series2 = chart.line(data2).name('Russia');
  var series3 = chart.line(data3).name('China');

  series1.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});
  series2.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});
  series3.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});

  chart.draw();
});