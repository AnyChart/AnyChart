var chart;
anychart.onDocumentReady(function() {
  /*var credits = new anychart.core.ui.Credits();
  credits.parentBounds(new anychart.math.Rect(0, 0, 200, 200));
  credits.container('container').draw();
  credits.listenSignals(credits.draw);
  credits.parentBounds(new anychart.math.Rect(0, 0, 300, 300));*/
  var data = [
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
  ];

  var stage = acgraph.create('container', '100%', '100%');
  var left = ['0%', '50%', '0%', '50%'];
  var top = ['0%', '0%', '50%', '50%'];
  var type = ['column', 'line', 'spline', 'bar'];
  var i;
  var charts = [];
  for (i = 0; i < type.length; i++) {
    chart = anychart.cartesian();
    chart.xAxis();
    chart.yAxis();
    chart.bounds()
      .left(left[i])
      .top(top[i])
      .width('50%')
      .height('50%');
    chart.title().enabled(false);
    chart.container(stage);
    chart[type[i]](data);
    chart.draw();
    charts.push(chart);
  }
  //charts[0].credits('none');
  //charts[0].credits(true);
  //var credits = charts[0].credits();
  //credits.text('text');
  //credits.url('http://google.com');
  //credits.title('fuck!');
  //credits.logoSrc('');
});
