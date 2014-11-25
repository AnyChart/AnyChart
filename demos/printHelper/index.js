var chart;

anychart.onDocumentReady(function() {
  //create bar chart
  chart = anychart.bar();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Bar Chart');

  //create area series with passed data
  chart.bar([
    ['P1' , '128.14'],
    ['P2' , '112.61'],
    ['P3' , '163.21'],
    ['P4' , '229.98'],
    ['P5' , '90.54'],
    ['P6' , '104.19'],
    ['P7' , '150.67'],
    ['P8' , '120.43'],
    ['P9' , '143.76'],
    ['P10', '191.34'],
    ['P11', '134.17'],
    ['P12', '145.72'],
    ['P13', '222.56'],
    ['P14', '187.12'],
    ['P15', '154.32'],
    ['P16', '133.08']
  ]);

  //initiate chart drawing
  chart.draw();
});

function printChart() {
  chart.print();
}