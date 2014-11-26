var chart;
anychart.onDocumentLoad(function() {
  var data = [
    ["P1", 1368763],
    ["P2", 7998],
    ["P3", 149653],
    ["P4", 351874],
    ["P5", 3582987],
    ["P6", 99],
    ["P7", 187]
  ];

  chart = anychart.radar()
      .container('container')
      .startAngle(0);

  chart.title(null);

  chart.yScale(anychart.scales.log().minimum(10).maximum(10000000));
  chart.yScale().ticks().set([10, 100, 1000, 10000, 100000, 1000000, 10000000]);

  chart.yAxis().stroke('rgb(51,51,51)').enabled(true).minorTicks().enabled(false);
  chart.yAxis().ticks().stroke('rgb(51,51,51)');
  chart.yAxis().labels().textFormatter(function() {
    var q = this.value % 1000;
    if (q == 0) {
      var t = this.value / 1000;
      var n = Math.round((Math.log(t))/(Math.log(10)));
      var p = Math.floor(n / 3);

      var result = '';
      for (var i = 0; i <= p; i++) {
        result += ',000';
      }
      return (this.value / Math.pow(1000, (p + 1))) + result;
    } else {
      return this.value;
    }
  });

  var xAxis = chart.xAxis().stroke('rgb(192,192,192)');
  xAxis.labels().fontWeight('bold').padding(5);

  chart.legend().enabled(false);

  chart.grid(0).oddFill('white').evenFill('white').stroke('rgb(221,221,221)');
  chart.grid(1).oddFill(null).evenFill(null).stroke('rgb(192,192,192)');

  var background = chart.background().enabled(true);
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

  var series1 = chart.line(data).name('Shaman');
  series1.markers().size(3);

  chart.draw();
});