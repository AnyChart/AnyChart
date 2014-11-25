var chart, s1, s2, s3, s4;
anychart.onDocumentReady(function() {
  var data = new anychart.data.Set([
    ['P1', 162, 42],
    ['P2', 134, 54],
    ['P3', 116, 26],
    ['P4', 122, 32],
    ['P5', 178, 68],
    ['P6', 144, 54],
    ['P7', 125, 35],
    ['P8', 176, 66],
    ['P9', 156, 'Missing'],
    ['P10', 195 , 120],
    ['P11', 215 , 115],
    ['P12', 176 , 36],
    ['P13', 167 , 47],
    ['P14', 142 , 72],
    ['P15', 117 , 37],
    ['P16', 113 , 23],
    ['P17', 132 , 'Missing'],
    ['P18', 146 , 46],
    ['P19', 169 , 59],
    ['P20', 184 , 44]
  ]);

  s1 = data.mapAs({x: [0], value: [1]});
  s2 = data.mapAs({x: [0], value: [2]});

  chart = anychart.area()
      .container('container');


  chart.draw();
});
