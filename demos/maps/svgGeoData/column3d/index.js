var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  $.ajax({
    type: 'GET',
    url: 'column.svg',
    success: function(data) {
      chart = anychart.map();
      chart.geoData(data);
      chart.interactivity().zoomOnMouseWheel(true);
      chart.unboundRegions('asis');

      chart.container(stage).draw();
    }
  });
});
