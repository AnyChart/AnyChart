var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1' , '3.6', '2.3', '2.8' , '11.5'],
    ['P2' , '7.1', '4.0', '4.1' , '14.1'],
    ['P3' , '8.5', '6.2', '5.1' , '17.5'],
    ['P4' , '9.2' , '11.8' , '6.5' , '18.9'],
    ['P5' , '10.1', '13.0' , '12.5', '20.8'],
    ['P6' , '11.6', '13.9' , '18.0', '22.9'],
    ['P7' , '16.4', '18.0' , '21.0', '25.2'],
    ['P8' , '18.0', '23.3' , '20.3', '27.0'],
    ['P9' , '13.2', '24.7' , '19.2', '26.5'],
    ['P10' , '12.0', '18.0', '14.4', '25.3'],
    ['P11' , '3.2' , '15.1', '9.2' , '23.4'],
    ['P12' , '4.1' , '11.3', '5.9' , '19.5'],
    ['P13' , '6.3' , '14.2', '5.2' , '17.8'],
    ['P14' , '9.4' , '13.7', '4.7' , '16.2'],
    ['P15' , '11.5', '9.9' , '4.2' , '15.4'],
    ['P16' , '13.5', '12.1', '1.2' , '14.0'],
    ['P17' , '14.8', '13.5', '5.4' , '12.5'],
    ['P18' , '16.6', '15.1', '6.3' , '10.8'],
    ['P19' , '18.1', '17.9', '8.9' , '8.9'],
    ['P20' , '17.0', '18.9', '10.1', '8.0'],
    ['P21' , '16.6', '20.3', '11.5', '6.2'],
    ['P22' , '14.1', '20.7', '12.2', '5.1'],
    ['P23' , '15.7', '21.6', '10' , '3.7'],
    ['P24' , '12.0', '22.5', '8.9' , '1.5']
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create line chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.lineChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Line Chart');

  //create first series with mapped data
  chart.line(seriesData_1);

  //create second series with mapped data
  chart.line(seriesData_2);

  //create third series with mapped data
  chart.line(seriesData_3);

  //initiate chart drawing
  chart.draw();
});
