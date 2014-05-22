anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '10', '30'],
    ['P2' , '12', '32'],
    ['P3' , '11', '35'],
    ['P4' , '15' , '40'],
    ['P5' , '20', '42'],
    ['P6' , '22', '35'],
    ['P7' , '21', '36'],
    ['P8' , '25', '31'],
    ['P9' , '31', '35'],
    ['P10' , '32', '36'],
    ['P11' , '28', '40'],
    ['P12' , '29', '42'],
    ['P13' , '40', '40'],
    ['P14' , '41', '38'],
    ['P15' , '45', '40'],
    ['P16' , '50', '40'],
    ['P17' , '65', '38'],
    ['P18' , '45', '36'],
    ['P19' , '50', '30'],
    ['P20' , '51', '29'],
    ['P21' , '65', '28'],
    ['P22' , '60', '25'],
    ['P23' , '62', '28'],
    ['P24' , '65', '29'],
    ['P25' , '45', '30'],
    ['P26' , '55', '40'],
    ['P27' , '59', '32'],
    ['P28' , '52', '33'],
    ['P29' , '53', '34'],
    ['P30' , '40', '30'],
    ['P31' , '45', '35']
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create line chart
  var chart = anychart.lineChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Spline Chart');

  //create first series with mapped data
  chart.spline(seriesData_1);

  //create second series with mapped data
  chart.spline(seriesData_2);

  //initiate chart drawing
  chart.draw();
});
