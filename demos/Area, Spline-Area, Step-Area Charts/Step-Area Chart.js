var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
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

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Step-Area Chart');

  //create first series with mapped data
  chart.stepLineArea(seriesData_1);//todo: replace with stepArea as it will be renamed

  //create second series with mapped data
  chart.stepLineArea(seriesData_2);//todo: replace with stepArea as it will be renamed

  //initiate chart drawing
  chart.draw();
});
