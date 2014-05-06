var chart;
anychart.onDocumentReady(function() {
  //create DataSet on our data
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

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take value from fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Area Chart');

  //force chart Y Scale to stack values
  chart.yScale().stackMode('value');

  //create first series with mapped data and specified color
  chart.area(seriesData_1);

  //create second series with mapped data
  chart.area(seriesData_2);

  //create third series with mapped data
  chart.area(seriesData_3);

  //create fourth series with mapped data
  chart.area(seriesData_4);

  //initiate chart drawing
  chart.draw();
});
