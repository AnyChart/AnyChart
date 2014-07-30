var label1, label2;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(container, 600, 400);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

    stage.path()
        .moveTo(stage.width() / 2, 0)
        .lineTo(stage.width() / 2, stage.height());
    var bg = new anychart.elements.Label().background();
    var lbl = new anychart.elements.Label()
        .parentBounds(new anychart.math.Rect(0, 0, stage.width()/2, stage.height()))
        .width(stage.width() / 3)
        .height(stage.height() - 20)
        .background(bg.fill('yellow'))
        .text('fill: yellow\nopacity: 1')
        .padding(10);
    lbl.background().enabled(true);
    lbl.container(stage).draw();

    lbl = new anychart.elements.Label()
        .parentBounds(new anychart.math.Rect(stage.width()/2, 0, stage.width()/2, stage.height()))
        .width(stage.width() / 3)
        .height(stage.height() - 20)
        .background(bg.fill('yellow 0.2'))
        .text('fill: yellow\nopacity: 0.2')
        .padding(10);
    lbl.background().enabled(true);
    lbl.container(stage).draw();

}