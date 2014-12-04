var chart;
anychart.onDocumentLoad(function() {

  var data1 = [
    ['P0', 134],
    ['P1', 142],
    ['P2', 134],
    ['P3', 156],
    ['P4', NaN],
    ['P5', 148],
    ['P6', 138],
    ['P7', 158],
    ['P8', 118],
    ['P9', 128],
    ['P10', NaN],
    ['P11', NaN]
  ];

  var data2 = [
    ['P0', 116],
    ['P1', 92],
    ['P2', 150],
    ['P3', 176],
    ['P4', 189],
    ['P5', 138],
    ['P6', 258],
    ['P7', 118],
    ['P8', 36],
    ['P9', 68],
    ['P10', 98],
    ['P11', 88]
  ];

  var data3 = [
    ['P0', 256],
    ['P1', 262],
    ['P2', 220],
    ['P3', 216],
    ['P4', 262],
    ['P5', 238],
    ['P6', 218],
    ['P7', 298],
    ['P8', 206],
    ['P9', 298],
    ['P10', 238],
    ['P11', 258]
  ];

  var data4 = [
    ['P0', -116],
    ['P1', -92],
    ['P2', -150],
    ['P3', -176],
    ['P4', -189],
    ['P5', -138],
    ['P6', -258],
    ['P7', -118],
    ['P8', -36],
    ['P9', -68],
    ['P10', -98],
    ['P11', -88]
  ];

  var data5 = [
    ['P0', -256],
    ['P1', -262],
    ['P2', -220],
    ['P3', -216],
    ['P4', -262],
    ['P5', -238],
    ['P6', -218],
    ['P7', -298],
    ['P8', -206],
    ['P9', -298],
    ['P10', -238],
    ['P11', -258]
  ];

  chart = anychart.radar()
      .container('container')
      .startAngle(0);

  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE);
  chart.xScale().inverted(true);

  chart.palette(['blue .5', 'yellow .5', 'green .5', 'red .5']);
  chart.yAxis().enabled(true);
  chart.xAxis().enabled(true);

  //chart.grid(0).enabled(false);
  chart.grid(anychart.grids.radar().layout(anychart.enums.RadialGridLayout.CIRCUIT).isMinor(true));
  //chart.line(data1).connectMissingPoints(false);
  chart.area(data2);
  //chart.area(data3);
  //chart.area(data4);
  //chart.area(data5);

  chart.draw();
});