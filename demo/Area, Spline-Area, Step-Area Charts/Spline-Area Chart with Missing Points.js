var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '162', '42'],
    ['P2' , '134', '54'],
    ['P3' , '116', '26'],
    ['P4' , '122', '32'],
    ['P5' , '178', '68'],
    ['P6' , '144', '54'],
    ['P7' , '125', '35'],
    ['P8' , '176', '66'],
    ['P9' , '156', 'Missing'],
    ['P10', '195', '120'],
    ['P11', '215', '115'],
    ['P12', '176', '36'],
    ['P13', '167', '47'],
    ['P14', '142', '72'],
    ['P15', '117', '37'],
    ['P16', '113', '23'],
    ['P17', '132', 'Missing'],
    ['P18', '146', '46'],
    ['P19', '169', '59'],
    ['P20', '184', '44']
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Spline-Area Chart with Missing Points');

  //create first series with mapped data
  chart.splineArea(seriesData_1);//todo: replace with stepArea as it will be renamed

  //create second series with mapped data
  chart.splineArea(seriesData_2);//todo: replace with stepArea as it will be renamed

  //initiate chart drawing
  chart.draw();
});

