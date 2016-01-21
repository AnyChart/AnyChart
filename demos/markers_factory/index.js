var chart;
anychart.onDocumentLoad(function() {
  var stage = acgraph.create('container');
  var marker = anychart.ui.markersFactory();
  marker.enabled(true)
      .type('star7')
      .positionFormatter(function() {
        return {x: 20 * (index+1), y: 30};
      });

  for (var index = 0; index < 7; index++) {
    marker.add();
    //Очищаем уже нарисованные маркеры и рисуем оставшиеся
    // их должно быть два.
    if (index==4) {
      marker.clear();
    }
    marker.container(stage).draw();
  }

  //Проверка метода disabledPointerEvents
  var rect = stage.rect(0,60, 400, 240).stroke('grey');
  chart = anychart.column();
  chart.yScale().minimum(0);
  var series = chart.column([2,3,5])
      .markers().enabled(true).size(13);
  series.disablePointerEvents(true);
  chart.bounds(rect.getBounds());
  chart.title().text('disabledPointerEvents(true)');

  chart.container(stage).draw();
  stage.resume();
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
