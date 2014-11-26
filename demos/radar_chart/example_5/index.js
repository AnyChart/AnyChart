var chart;
anychart.onDocumentLoad(function() {
  var dataSet = anychart.data.set([
    [2007, 1368763, 1991297, 431097],
    [2008, 799873, 1254823, 561983],
    [2009, 1497653, 1732987, 1019874],
    [2010, 1351874, 332871, 2027634],
    [2011, 1582987, 649853, 1961085]
  ]);

  var data1 = dataSet.mapAs({x: [0], value: [1]});
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  chart = anychart.radar()
      .container('container')
      .startAngle(0);

  chart.title().text('Products Sales by Year (2007-2011) (Stacked)');

  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE).minimum(0).maximum(5000000);
  chart.yScale().ticks().interval(1000000);

  var yAxis = chart.yAxis().stroke('rgb(51,51,51)').enabled(true);
  yAxis.ticks().stroke('rgb(51,51,51)');
  yAxis.minorTicks().enabled(false);
  yAxis.labels().textFormatter(function() {return this.value / 1000000 + 'M'});

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

  chart.palette(['rgb(29, 139, 209) .6', 'rgb(241, 104, 60) .6' , 'rgb(42, 214, 42) .6']);


  var series1 = chart.area(data1).name('Product A').stroke('rgb(19, 93, 140)');
  series1.markers().enabled(true).size(3);
  var series2 = chart.area(data2).name('Product B').stroke('rgb(164, 48, 11)');
  series2.markers().enabled(true).size(2);
  var series3 = chart.area(data3).name('Product C').stroke('rgb(26, 139, 26)');
  series3.markers().enabled(true).size(3);

  chart.draw();
});