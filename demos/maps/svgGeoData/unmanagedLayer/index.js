var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  var l = stage.unmanagedLayer();
  l.content('<circle id="11" fill="green" stroke="#000000" stroke-miterlimit="10" cx="132.14" cy="187.445" r="120"/>');


  var data = stage.toSvg();

  chart = anychart.map(data);
  chart.geoData(data);
  chart.interactivity().zoomOnMouseWheel(true);
  chart.unboundRegions('asis');

  chart.container(stage).draw();
});
