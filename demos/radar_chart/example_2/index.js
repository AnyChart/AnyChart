var chart;
anychart.onDocumentLoad(function() {
  var dataSet = anychart.data.set([
        ['January', 8.1, 2.3],
        ['February', 8.4, 2.1],
        ['March', 11.4, 3.9],
        ['April', 14.2, 5.5],
        ['May', 17.9, 8.7],
        ['June', 21.1, 11.7],
        ['July', 23.5, 13.9],
        ['August', 23.2, 13.7],
        ['September', 19.9, 11.4],
        ['October', 15.6, 8.4],
        ['November', 11.2, 4.9],
        ['December', 8.3, 2.7]
      ]);


  var data1 = dataSet.mapAs({x: [0], value: [1]});
  var data2 = dataSet.mapAs({x: [0], value: [2]});

  chart = /** @type {anychart.charts.Radar} */(anychart.radar())
      .container('container')
      .startAngle(0);

  chart.title().text('Average temperature in London');

  chart.yScale().minimum(0).maximum(25).ticks().interval(5);

  var yAxis = chart.yAxis()
      .stroke('rgb(51,51,51)')
      .enabled(true);
  yAxis.minorTicks().enabled(true);
  yAxis.labels().fontWeight('bold');
  yAxis.ticks().stroke('rgb(51,51,51)');

  var xAxis = chart.xAxis().stroke('rgb(192,192,192)');
  xAxis.labels().padding(5);

  chart.legend()
      .align(anychart.enums.Align.TOP)
      .position(anychart.enums.Orientation.RIGHT)
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .enabled(true);

  chart.grid(0).oddFill('rgb(255, 255, 255)').evenFill('rgb(250, 250, 250)').stroke('rgb(221,221,221)');
  chart.grid(1).oddFill(null).evenFill(null).stroke('rgb(192,192,192)');

  chart.margin().bottom(40);

  var background = chart.background().enabled(true);
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

  chart.palette(['rgb(38, 123, 182) .5', 'rgb(119, 145, 34) .5']);

  var series1 = chart.area(data1).name('Day (max)').stroke('2 rgb(26, 85, 127)');
  series1.markers().fill('rgb(110, 178, 224)').size(3).enabled(true);
  series1.hatchFill(acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL, '#fff .5', 2, 5);

  var series2 = chart.area(data2).name('Night (min)').stroke('2 rgb(89, 109, 25)');
  series2.markers().fill('rgb(194, 220, 108)').size(2).enabled(true);
  series2.hatchFill(acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL, '#fff .5', 2, 5);

  series1.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});
  series2.tooltip().contentFormatter(function() {return '• ' + this.x + ': ' + this.value.toFixed(2)});

  chart.draw();
});