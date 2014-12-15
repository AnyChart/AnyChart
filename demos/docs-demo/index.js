var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 600, 300);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  //   chart = anychart.line();

  var layer = acgraph.layer();
  stage.width(600);
  var text = stage.text(0,0,'Click to resume').fontSize(14);
  text.x(20).y(10);
  var rect = stage.rect(0, 0, 100, 100).fill('white .01').stroke(null);
  anychart.graphics.events.listen(rect, anychart.graphics.events.EventType.CLICK, function(){
    stage.resume();
    text.text(null);
    rect.fill('none');
  });
  stage.suspend();
  stage.text(10, 10, 'new text line');
  stage.circle(stage.width()/2, stage.height()/2, 50).fill('red 0.2').stroke('2 blue');
  layer.parent(stage);
}