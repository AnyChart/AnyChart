anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish', 12814, 3054, 4376, 4229],
    ['Eyebrow pencil', 13012, 5067, 3987, 3932],
    ['Rouge', 11624, 7004, 3574, 5221],
    ['Pomade', 8814, 9054, 4376, 9256],
    ['Eyeshadows', 12998, 12043, 4572, 3308],
    ['Eyeliner', 12321, 15067, 3417, 5432],
    ['Foundation', 10342, 10119, 5231, 13701],
    ['Lip gloss', 22998, 12043, 4572, 4008],
    ['Mascara', 11261, 10419, 6134, 18712]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the second series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  chart = anychart.column();

  // turn on chart animation
  chart.animation(true);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('percent');

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  chart.title('Regional ratio of cosmetic products sales');
  chart.title().padding([0,0,10,0]);

  // set yAxis labels formatting, force it to add % to values
  chart.yAxis(0).labels().textFormatter(function(info) {
    return info.value + '%';
  });

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.stroke('2 #fff 1');
    series.name(name);
    series.hoverStroke('2 #fff 1');
    series.tooltip().titleFormatter(function(){
      return this.x
    });
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeries(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeries(series, 'Nevada');

  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,25,0]);

  // initiate chart drawing
  chart.draw();
});