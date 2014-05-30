anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 22, 23, 25, 33],
    ['P2', 34, 45, 56, 29],
    ['P3', 16, 46, 67, 56],
    ['P4', 32, 86, 32, 49],
    ['P4', 68, 45, 27, 77]
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
  chart.title().text('Column Chart with Columns Overlap');

  //create first series with mapped data
  chart.column(seriesData_1).xPointPosition(0.3);

  //create second series with mapped data
  chart.column(seriesData_2).xPointPosition(0.4);

  //create third series with mapped data
  chart.column(seriesData_3).xPointPosition(0.5);

  //create fourth series with mapped data
  chart.column(seriesData_4).xPointPosition(0.6);

  //initiate chart drawing
  chart.draw();
});

