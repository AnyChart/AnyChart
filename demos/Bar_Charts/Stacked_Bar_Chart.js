anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 97 , 43, 35, 23],
    ['P2', 84 , 55, 56, 49],
    ['P3', 36 , 99, 77, 76],
    ['P4', 42 , 86, 42, 49],
    ['P5', 128, 45, 67, 97]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create bar chart
  var chart = anychart.barChart();

  //force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Bar Chart');

  //helper function to setup label settings for all series
  var setupSeriesLabels = function(series) {
    var seriesLabels = series.labels();
    seriesLabels.enabled(true);
    seriesLabels.position('center');
    seriesLabels.anchor('center');
    seriesLabels.fontColor('white');
    seriesLabels.fontWeight('bold');
  };

  //temp variable to store series instance
  var series;

  //create first series with mapped data
  series = chart.bar(seriesData_1);
  setupSeriesLabels(series);

  //create second series with mapped data
  series = chart.bar(seriesData_2);
  setupSeriesLabels(series);

  //create third series with mapped data
  series = chart.bar(seriesData_3);
  setupSeriesLabels(series);

  //create fourth series with mapped data
  series = chart.bar(seriesData_4);
  setupSeriesLabels(series);

  //initiate chart drawing
  chart.draw();
});

