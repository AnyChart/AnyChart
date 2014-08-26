anychart.onDocumentReady(function() {
  //create bar chart
  var chart = anychart.barChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Bar Chart');
//  chart.bounds('1%', '55%', '33%', '30%');

  //create area series with passed data
  chart.bar([
    ['P1' , '128.14'],
    ['P2' , '112.61'],
    ['P3' , '163.21']
  ]);

  //initiate chart drawing
  chart.draw();
});
