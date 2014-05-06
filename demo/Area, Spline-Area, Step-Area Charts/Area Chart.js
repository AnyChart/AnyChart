var chart;

anychart.onDocumentReady(function() {
  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.areaChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Area Chart');

  //create area series with passed data
  chart.area([
    ['P1' , '162'],
    ['P2' , '134'],
    ['P3' , '116'],
    ['P4' , '122'],
    ['P5' , '178'],
    ['P6' , '144'],
    ['P7' , '125'],
    ['P8' , '176'],
    ['P9' , '156'],
    ['P10', '195'],
    ['P11', '135'],
    ['P12', '176'],
    ['P13', '167'],
    ['P14', '142'],
    ['P15', '117'],
    ['P16', '113'],
    ['P17', '132'],
    ['P18', '146'],
    ['P19', '169'],
    ['P20', '184']
  ]);

  //initiate chart drawing
  chart.draw();
});
