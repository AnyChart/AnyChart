var chart;
anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1', 162, 142, 122],
    ['P2', 134, 154, 144],
    ['P3', 116, 126, 116],
    ['P4', 122, 132, 162],
    ['P5', 178, 168, 148],
    ['P6', 144, 154, 194],
    ['P7', 125, 135, 145],
    ['P8', 176, 166, 136],
    ['P9', 156, 188, 118],
    ['P10', 195, 120, 130],
    ['P11', 215, 115, 155],
    ['P12', 176, 136, 166],
    ['P13', 167, 147, 137],
    ['P14', 142, 172, 152],
    ['P15', 117, 137, 177],
    ['P16', 113, 123, 183],
    ['P17', 132, 134, 144],
    ['P18', 146, 146, 166],
    ['P19', 169, 159, 189],
    ['P20', 184, 144, 134]
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('100% Stacked Area Chart');

  //force chart Y Scale to stack values
  chart.yScale().stackMode('percent');

  //create first series with mapped data and specified color
  chart.area(seriesData_1);

  //create second series with mapped data
  chart.area(seriesData_2);

  //create third series with mapped data
  chart.area(seriesData_3);

  //initiate chart drawing
  chart.draw();
});
