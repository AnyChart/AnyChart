var chart;
anychart.onDocumentLoad(function() {
  var dataSet = anychart.data.set([
        ['Strength', 136, 199, 43],
        ['Agility', 79, 125, 56],
        ['Stamina', 149, 173, 101],
        ['Intellect', 135, 33, 202],
        ['Spirit', 158, 64, 196]
      ]);


  var data1 = dataSet.mapAs({x: [0], value: [1]});
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  chart = anychart.radar()
      .container('container')
      .startAngle(0);

  chart.title().text('WoW base stats comparison radar chart: Shaman vs Warrior vs Priest');

  chart.yScale().minimum(0).maximum(250).ticks().interval(50);

  chart.yAxis().stroke('rgb(51,51,51)').enabled(true).minorTicks().enabled(false);
  chart.yAxis().ticks().stroke('rgb(51,51,51)');

  var xAxis = chart.xAxis().stroke('rgb(192,192,192)');
  xAxis.labels().fontWeight('bold').padding(5);

  chart.legend()
      .align(anychart.enums.Align.TOP)
      .position(anychart.enums.Orientation.RIGHT)
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .enabled(true);

  chart.grid(0).oddFill('white').evenFill('white').stroke('rgb(221,221,221)');
  chart.grid(1).oddFill(null).evenFill(null).stroke('rgb(192,192,192)');


  var background = chart.background().enabled(true);
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);


  var series1 = chart.line(data1).name('Shaman');
  series1.markers().size(3);
  var series2 = chart.line(data2).name('Warrior');
  series2.markers().size(2);
  var series3 = chart.line(data3).name('Priest');
  series3.markers().size(3);

  series1.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});
  series2.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});
  series3.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});

  chart.draw();
});