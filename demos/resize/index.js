var chart, stage, container;
anychart.onDocumentReady(function() {
  container = document.getElementById('container');
  var stage = acgraph.create(container, '100%', '100%');

  chart = anychart.pie([4,7,4]);
  chart.container(stage).draw();

  stage.listen(acgraph.vector.Stage.EventType.STAGE_RESIZE,
      function() {
        console.log('resize');
      });
});

