anychart.onDocumentLoad(function() {
  var chart = anychart.polarChart();
  chart.yScale().ticks().interval(5);
  chart.xScale().ticks().interval(2);
  var fillSettings = {
    keys: ['.35 white', '.9 gray'],
    angle: -231,
    mode: chart.bounds()
  };

  chart.grid(0).oddFill(fillSettings).evenFill(fillSettings).stroke('black');
  chart.grid(1).oddFill(null).evenFill(null).stroke('black');

  var series = chart.line([
    {x: '0', value: 80},
    {x: '3', value: 0},
    {x: '6', value: 80},
    {x: '9', value: 0},
    {x: '12', value: 80},
    {x: '15', value: 0},
    {x: '18', value: 80},
    {x: '21', value: 0},
    {x: '24', value: 0},
    {x: '3', value: 80},
    {x: '6', value: 0},
    {x: '9', value: 80},
    {x: '12', value: 0},
    {x: '15', value: 80},
    {x: '18', value: 0},
    {x: '21', value: 80},
    {x: '24', value: 0},
    {x: '21', value: 0}
  ]);

  chart.container('container');
  chart.draw();
});


