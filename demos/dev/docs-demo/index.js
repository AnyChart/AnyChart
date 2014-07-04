var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(600, 400, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

 // Слева
 var rect = stage.rect(5, 5, 200, 90).fill('none').stroke('1 grey')
 label1 = new anychart.elements.Label()
     .text('Not adjusted text')
     .parentBounds(rect.getBounds())
     .container(stage);
 label1.draw();
 // Справа
 rect = stage.rect(210, 5, 200, 90).fill('none').stroke('1 grey')
 label2 = new anychart.elements.Label()
     .text('Adjusted text')
     .adjustFontSize(true)
     .width('100%')
     .height('100%')
     .parentBounds(rect.getBounds())
     .container(stage).draw();

}