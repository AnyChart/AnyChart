anychart.onDocumentReady(function() {
  //stage for all dashboard elements
  var stage = anychart.graphics.create('container');

  //100% of container size by default
  var stageSize = stage.getSize();

  //create label instance
  var header = anychart.elements.label();
  //set layout bounds
  header.parentBounds(new anychart.math.Rect(0, 0, stageSize.width, stageSize.height));
  //set label position
  header.position('Top');
  header.anchor('CenterTop');
  //set label text
  header.text('Web Marketing Analysis');
  header.padding(10);
  //set label text settings
  header.fontSize(18);
  header.fontColor('#7AA3CC');
  header.fontWeight('normal');
  //set label render on stage
  header.container(stage);
  //initiate label drawing
  header.draw();

  //separator line
  var headerHeight = header.getContentBounds().height;
  stage.path()
      .moveTo(0, headerHeight)
      .lineTo(stageSize.width, headerHeight)
      .stroke('2 #7AA3CC');
});