anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '125', '51'],
    ['P2' , '132', '91'],
    ['P3' , '141', '34'],
    ['P4' , '158', '47'],
    ['P5' , '133', '63'],
    ['P6' , '143', '58'],
    ['P7' , '176', '36'],
    ['P8' , '194', '77'],
    ['P9' , '115', '99'],
    ['P10', '134', '106'],
    ['P11', '110', '88'],
    ['P12', '91', '56']
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create area chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Step-Area Chart');

  //create first series on mapped data
  chart.stepArea(seriesData_1);

  //create second series on mapped data
  chart.stepArea(seriesData_2);

  //initiate chart drawing
  chart.draw();
});
