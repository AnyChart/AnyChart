var chart, stage;


anychart.onDocumentReady(function() {
  anychart.theme({radar: {
    defaultSeriesSettings: {
      base: {
        hoverFill: function() {return anychart.color.setOpacity(anychart.color.lighten(this['sourceColor']), .6)},
        selectFill: function() {return anychart.color.setOpacity(anychart.color.darken(this['sourceColor']), .6)}
      }
    }
  }});

  // create data set on our data
  var dataSet = anychart.data.set([
    ['2007', 1368763, 1991297, 431097],
    ['2008', 799873, 1254823, 561983],
    ['2009', 1497653, 1732987, 1019874],
    ['2010', 1351874, 332871, 2027634],
    ['2011', 1582987, 649853, 1961085]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var data1 = dataSet.mapAs({x: [0], value: [1]});
  // map data for the second series, take x from the zero column and value from the second column of data set
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  // map data for the third series, take x from the zero column and value from the third column of data set
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  // create radar chart
  chart = anychart.radar();

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  chart.title('Region Sales by Year (2007-2011) (Stacked)');

  // force chart to stack values by Y scale.
  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE);

  // set yAxis settings
  chart.yAxis().stroke('#545f69');
  chart.yAxis().ticks().stroke('#545f69');

  // set yAxis labels settings
  chart.yAxis().labels().fontColor('#545f69')
      .textFormatter(function() {return this.value / 1000000 + 'M'});

  // set xAxis labels appearance settings
  var xAxisLabels = chart.xAxis().labels();
  xAxisLabels.padding(5);

  // set chart legend settings
  chart.legend()
      .align('center')
      .position('bottom')
      .enabled(true);

  // create first series with mapped data and appearance settings
  var series1 = chart.marker(data1);
  series1.name('Arizona');
  series1.fill('yellow').hoverFill('red');

  // create second series with mapped data and appearance settings
  //var series2 = chart.area(data2);
  //series2.name('Florida');

  // create third series with mapped data and appearance settings
  //var series3 = chart.area(data3);
  //series3.name('Nevada');

  // initiate chart drawing
  chart.draw();
});



