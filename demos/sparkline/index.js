var chart, chart1;
anychart.onDocumentLoad(function() {
  anychart.licenseKey('test-key-32db1f79-cc9312c4');

  function random(a, b) {
    return Math.round(Math.random() * (b - a + 1) + a);
  }

  function data() {
    var res = [];
    for (var i = 0, n = 20; i < n; i++) {
      res.push(random(-10, 10));
    }
    return res;
  }

  var time1 = new Date().getTime();
  for (var i = 0, n = 1; i < n; i++) {
    chart = anychart.sparkline(data()).width(250).height(60);
    chart.type('line');

    chart.margin(10);


    //chart.labels().enabled(true);
    //chart.labels().anchor(anychart.enums.Position.CENTER_BOTTOM);
    //chart.labels().position(anychart.enums.Position.CENTER_TOP);

    //chart.markers(true);
    //chart.markers('star5');
    chart.negativeMarkers().enabled(true).stroke('red').fill('green').size(10);
    //chart.minMarkers().enabled(true);
    //chart.maxMarkers().enabled(true);
    //chart.lineMarker({value: -8});
    //chart.textMarker({value: -8, fontSize: 6, anchor: 'bottom', align: 'right'});
    chart.rangeMarker({from: -3, to: 5  });
    //chart.maxLabels()
    //    .enabled(true)
    //    .fontColor('red');
    //
    //chart.minLabels()
    //    .enabled(true)
    //    .fontColor('green');
    //
    //chart.firstFill('blue');
    //chart.lastFill('red');
    //
    chart.clip(true);
    //
    //chart.hatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);

    //chart.pointWidth('70%');
    //chart.padding(10);
    chart.container('container').draw();
  }
  var time2 = new Date().getTime();
  console.log(time2 - time1);

  //var t = chart.toJson();
  //chart1 = anychart.fromJson(t).container('container').draw();
});