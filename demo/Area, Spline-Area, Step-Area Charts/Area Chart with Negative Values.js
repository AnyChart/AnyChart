var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '322', '242', '162'],
    ['P2' , '324', '254', '90'],
    ['P3' , '329', '226', '50'],
    ['P4' , '342', '232', '77'],
    ['P5' , '348', '268', '35'],
    ['P6' , '334', '254', '-45'],
    ['P7' , '325', '235', '-88'],
    ['P8' , '316', '266', '-120'],
    ['P9' , '318', '288', '-156'],
    ['P10', '330', '220', '-123'],
    ['P11', '355', '215', '-88'],
    ['P12', '366', '236', '-66'],
    ['P13', '337', '247', '-45'],
    ['P14', '352', '172', '-29'],
    ['P15', '377', '37', '-45'],
    ['P16', '383', '23', '-88'],
    ['P17', '344', '34', '-132'],
    ['P18', '366', '46', '-146'],
    ['P19', '389', '59', '-169'],
    ['P20', '334', '44', '-184']
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Spline-Area Chart');

  //create first series with mapped data and specified color
  var firstSeries = chart.splineArea(seriesData_1);
  firstSeries.color('#EEEE25');

  //create second series with mapped data
  chart.splineArea(seriesData_2);

  //create third series with mapped data
  chart.splineArea(seriesData_3);

  //initiate chart drawing
  chart.draw();
});
