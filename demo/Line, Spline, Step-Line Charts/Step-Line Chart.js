var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data, also we can pud data directly to series
  var dataSet = new anychart.data.Set([
    ['P1' , '51', '125'],
    ['P2' , '91', '132'],
    ['P3' , '34', '141'],
    ['P4' , '47' , '158'],
    ['P5' , '63', '133'],
    ['P6' , '58', '143'],
    ['P7' , '36', '176'],
    ['P8' , '77', '194'],
    ['P9' , '99', '115'],
    ['P10' , '106', '134'],
    ['P11' , '88', '110'],
    ['P12' , '56', '91']
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create line chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.lineChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Step Line Chart');

  //create first series with mapped data
  chart.stepLine(seriesData_1);

  //create second series with mapped data
  chart.stepLine(seriesData_2);

  //initiate chart drawing
  chart.draw();
});
