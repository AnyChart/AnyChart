var stage, scale, header;
var PIXEL_STEP = 40;


anychart.onDocumentReady(function() {
  stage = acgraph.create('container', '100%', '100%');

  scale = new anychart.scales.GanttDateTime();

  var min = Date.UTC(2000, 3, 1);
  var max = Date.UTC(2000, 6, 30);

  scale.setRange(min, max);

  header = new anychart.core.gantt.TimelineHeader();
  header.container(stage);
  header.scale(scale);
  header.bounds().set(0, 30, '60%', 60);
  header.draw();

  header.listen('signal', header.draw, false, header);
});

function zoomIn() {
  scale.zoomIn();
}

function zoomOut() {
  scale.zoomOut();
}

function leftScr() {
  scale.ratioScroll(- PIXEL_STEP / stage.width());
}

function rightScr() {
  scale.ratioScroll(PIXEL_STEP / stage.width());
}









