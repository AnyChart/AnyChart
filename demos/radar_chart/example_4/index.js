anychart.onDocumentLoad(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
    ['2007', 1368763, 1991297, 431097],
    ['2008', 799873, 1254823, 561983],
    ['2009', 1497653, 1732987, 1019874],
    ['2010', 1351874, 332871, 2027634],
    ['2011', 1582987, 649853, 1961085]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var data1 = dataSet.mapAs({x: [0], value: [1]});
  //map data for the second series, take x from the zero column and value from the second column of data set
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  //map data for the third series, take x from the zero column and value from the third column of data set
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  //create radar chart
  chart = anychart.radar();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Products Sales by Year (2007-2011) (Stacked)');

  //force chart to stack values by Y scale.
  chart.yScale().stackMode(anychart.enums.ScaleStackMode.PERCENT);

  //set yAxis labels formatting settings
  chart.yAxis().labels().textFormatter(function() {
    return this.value + '%'
  });

  //set xAxis labels appearance settings
  var xAxisLabels = chart.xAxis().labels();
  xAxisLabels.fontWeight('bold').padding(5);

  //set chart legend settings
  chart.legend({
    align: 'top',
    position: 'right',
    itemsLayout: 'vertical'
  });

  //create first series with mapped data and appearance settings
  var series1 = chart.area(data1);
  series1.name('Product A');
  series1.fill('rgb(29, 139, 209) .6').stroke('rgb(19, 93, 140)');
  series1.markers().enabled(true).size(3);

  //create second series with mapped data and appearance settings
  var series2 = chart.area(data2);
  series2.name('Product B');
  series2.fill('rgb(241, 104, 60) .6').stroke('rgb(164, 48, 11)');
  series2.markers().enabled(true).size(3);

  //create third series with mapped data and appearance settings
  var series3 = chart.area(data3);
  series3.name('Product C');
  series3.fill('rgb(42, 214, 42) .6').stroke('rgb(26, 139, 26)');
  series3.markers().enabled(true).size(3);

  //initiate chart drawing
  chart.draw();
});