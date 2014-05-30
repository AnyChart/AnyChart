anychart.onDocumentReady(function() {
  //create data set on our data
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

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create area chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Area Chart with Negative Values');

  //using fill function we can create a pretty gradient for the series
  //note that we using series sourceColor here, which can be configured separately for each series by 'color' method
  var fillFunction = function() {
    return {keys: [
      {offset: 0, color: this.sourceColor},
      {offset: 1, color: anychart.color.darken(this.sourceColor)}
    ], angle: -90, opacity: 1};
  };

  //create first area series on mapped data, specify series fill function and color
  chart.area(seriesData_1).color('#EEEE25').fill(fillFunction);

  //create second area series on mapped data and specify series fill function
  chart.area(seriesData_2).fill(fillFunction);

  //create second area series on mapped data and specify series fill function
  chart.area(seriesData_3).fill(fillFunction);

  //initiate chart drawing
  chart.draw();
});
