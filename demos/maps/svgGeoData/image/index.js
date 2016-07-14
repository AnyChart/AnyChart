var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  stage
      .rect(100, 100, 500, 500)
      .fill({'src': 'http://i.ebayimg.com/images/g/aeMAAOSw8vZXMYKf/s-l1600.jpg'})
      .rotateByAnchor(45);

  // stage
  //     .image('http://i.ebayimg.com/images/g/aeMAAOSw8vZXMYKf/s-l1600.jpg', 100, 100, 100, 100)
  //     .rotateByAnchor(45);

  var data = stage.toSvg();

  console.log(data);

  chart = anychart.map();
  chart.geoData(data);
  chart.interactivity().zoomOnMouseWheel(true);
  chart.unboundRegions('asis');

  chart.container(stage).draw();
});
