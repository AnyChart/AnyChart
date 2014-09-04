anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 128.14, 90.54, 43.76, 122.56],
    ['P2', 112.61, 104.19, 61.34, 187.12],
    ['P3', 163.21, 150.67, 34.17, 54.32],
    ['P4', 229.98, 120.43, 45.72, 33.08]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create column chart
  var chart = anychart.columnChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title()
      .text('Multi-Series Bar Chart')
      .margin('40%', '50%', '40%', 0)
      //.margin(0)
      .padding(0)
      //.padding('20%', 0, '40%', 10)
      .background().fill('blue .3').enabled(true);

  //helper function to setup label settings for all series
  var setupSeriesLabels = function(series) {
    var seriesLabels = series.labels();
    seriesLabels.enabled(true);
    seriesLabels.position('centerleft');
    seriesLabels.anchor('center');
    seriesLabels.offsetX(10);
    seriesLabels.fontWeight('bold');
    seriesLabels.rotation(-45);
    seriesLabels.offsetY(-15);
    seriesLabels.offsetX(20);
    series.tooltip().enabled(false);
  };

  //temp variable to store series instance
  var series;

  //create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeriesLabels(series);

  //create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeriesLabels(series);

  //create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeriesLabels(series);

  //create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeriesLabels(series);

  //initiate chart drawing
  chart.draw();


  chart.container().rect().setBounds(chart.title().getContentBounds());
});