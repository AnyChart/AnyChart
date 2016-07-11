var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  $.ajax({
    type: 'GET',
    url: 'Boeing_737.svg',
    success: function(data) {
      chart = anychart.seatMap();
      chart.geoData(data);

      chart.interactivity().zoomOnMouseWheel(true);
      // chart.interactivity().keyboardZoomAndMove(true);

      chart.unboundRegions(true);

      chart.container(stage).draw();
    }
  });
});
