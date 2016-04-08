anychart.onDocumentReady(function() {
  var image_link = 'http://static.anychart.com/images/parks_of_the_world/';

  stage = anychart.graphics.create('container', 600, 600);
  var rect = stage.rect(100, 100, 300, 300);

  rect.fill({
    src: image_link + '1.jpg',
    mode: 'fitMax'
  });
  rect.translate(50, 50);

  rect.listen(acgraph.events.EventType.MOUSEOVER, function(e) {
    rect.setBounds(new acgraph.math.Rect(100, 100, 400, 400));
    rect.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  });

  rect.listen(acgraph.events.EventType.MOUSEOUT, function(e) {
    rect.setBounds(new acgraph.math.Rect(150, 150, 300, 300));
    rect.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  });
});

