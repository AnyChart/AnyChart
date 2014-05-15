anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '162', '42'],
    ['P2' , '134', '54'],
    ['P3' , '116', '26'],
    ['P4' , '122', '32'],
    ['P5' , '178', '68'],
    ['P6' , '144', '54'],
    ['P7' , '125', '35'],
    ['P8' , '176', '66'],
    ['P9' , '156', 'missing'],  //data row with missing value, it also can be null or NaN
    ['P10', '195', '120'],
    ['P11', '215', '115'],
    ['P12', '176', '36'],
    ['P13', '167', '47'],
    ['P14', '142', '72'],
    ['P15', '117', '37'],
    ['P16', '113', '23'],
    ['P17', '132', 'missing'],  //data row with missing value, it also can be null or NaN
    ['P18', '146', '46'],
    ['P19', '169', '59'],
    ['P20', '184', '44']
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
  chart.title().text('Spline-Area Chart with Missing Points');

  //using fill function we can create a pretty gradient for the series
  //note that we using series sourceColor here, which can be configured separately for each series by 'color' method
  var fillFunction = function() {
    return {keys: [
      {offset: 0, color: this.sourceColor},
      {offset: 1, color: anychart.color.darken(this.sourceColor)}
    ], angle: -90, opacity: 1};
  };

  //create first area series on mapped data, specify series fill function and color
  chart.splineArea(seriesData_1).fill(fillFunction);

  //create second area series on mapped data and specify series fill function
  chart.splineArea(seriesData_2).color('#EEEE25').fill(fillFunction);

  //initiate chart drawing
  chart.draw();
});
