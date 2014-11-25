var chart, s1, s2, s3, s4;
anychart.onDocumentReady(function() {
  var data = new anychart.data.Set([
    ['P1', 128.14, -90.54, -43.76, -122.56],
    ['P2', 112.61, 104.19, 61.34, -87.12],
    ['P3', -123.21, 135.12, -34.17, 54.32]
  ]);

  s1 = data.mapAs({x: [0], value: [1]});
  s2 = data.mapAs({x: [0], value: [2]});
  s3 = data.mapAs({x: [0], value: [3]});
  s4 = data.mapAs({x: [0], value: [4]});

  chart = anychart.column()
      .container('container');

  chart.column(s1);
  chart.column(s2);
  chart.column(s3);
  chart.column(s4);

  chart.draw();
});
