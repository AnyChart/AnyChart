var chart;
anychart.onDocumentLoad(function() {
  chart = anychart.line([1,2,3,4,5,6,7,8,9]);
  chart.crosshair(true);
  chart.xAxis().ticks(true);
  chart.container('container').draw();
});

function a(a) {
  var config = chart.toJson(false, !!a);
  console.log(config);
  chart.dispose();
  chart = anychart.fromJson(config);
  chart.container('container').draw();
}

function b(a) {
  var config = chart.toXml(false, !!a);
  console.log(config);
  chart.dispose();
  chart = anychart.fromXml(config);
  chart.container('container').draw();
}

