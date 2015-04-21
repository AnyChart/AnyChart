var chart;
anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
    ['P1', 297, 243, 235, 223],
    ['P2', 184, 255, 156, 249],
    ['P3', 136, 199, 177, 276],
    ['P4', 142, 186, 242, 249],
    ['P5', 228, 145, 267, 297]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the second series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  chart = anychart.bar();

  chart.xAxis(null).yAxis(null);
  chart.yScale().stackMode('percent');

  chart.container('container');

  chart.title(null);

  var setupSeriesLabels = function(series) {
    var seriesLabels = series.labels(null);
    //seriesLabels.enabled(true);
    //seriesLabels.position('center');
    //seriesLabels.anchor('center');
    //seriesLabels.fontColor('white');
    //seriesLabels.fontWeight('bold');
    series.tooltip().hideDelay(100);
  };

  var series;

  series = chart.bar(seriesData_1);
  setupSeriesLabels(series);

  chart.draw();
});