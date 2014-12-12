var chart, s1;
anychart.onDocumentReady(function() {

  anychart.licenseKey('Irina-d43a427a-1985961f');
  var dataSet = anychart.data.set([
    ['P1' , '322', '242', '162'],
    ['P2' , '324', '254', '90'],
    ['P3' , '329', '226', '50'],
    ['P4' , '342', '232', '77'],
    ['P5' , '348', '268', '35']
  ]);

  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  chart = anychart.column();
  chart.container('container');

  s1 = chart.column(seriesData_1).fill('orange .4');//.hatchFill('diagonalcross');
  chart.column(seriesData_2).fill('red .3');//.hatchFill('diagonalbrick');
  chart.column(seriesData_3).fill('green .7').hatchFill('horizontal');

  chart.legend().enabled(true);
  chart.draw();
  chart.credits(null);
  //chart.dispose();
});
