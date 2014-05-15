anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 42, 13, 75, 13],
    ['P2', 34, 25, 56, 29],
    ['P3', 56, 76, 67, 26],
    ['P4', 22, 86, 42, 39],
    ['P5', 48, 95, 17, 17],
    ['P6', 71, 71, 71, 74],
    ['P7', 55, 55, 55, 35],
    ['P8', 34, 34, 34, 34],
    ['P9', 19, 19, 19, 19],
    ['P10', 22, 22, 22, 42]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create area chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Area Chart');

  //force chart to stack series values
  chart.yScale().stackMode('value');

  //create first series on mapped data
  chart.area(seriesData_1).markers().enabled(true);

  //create second series on mapped data
  chart.area(seriesData_2).markers().enabled(true);

  //create third series on mapped data
  chart.area(seriesData_3).markers().enabled(true);

  //create fourth series on mapped data
  chart.area(seriesData_4).markers().enabled(true);

  //initiate chart drawing
  chart.draw();
});
