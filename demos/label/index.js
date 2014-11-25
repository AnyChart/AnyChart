var label;
function load() {
  var stage = acgraph.create('container', '100%' , '100%');
  stage.rect(100, 100, 300, 300).fill('pink');
  label = new anychart.core.ui.Label();
  label.container(stage);
  label.position('center');
  label.text('Some label text');
  label.anchor('center');
  label.padding(10, 5, 10, 5);
  label.offsetX(0);
  label.offsetY(0);
  label.width(200);
  label.height(200);
  label.fontSize(14);
  label.background().fill('green .5').stroke('none');
  label.parentBounds(new anychart.math.Rect(100, 100, 300, 300));
  label.draw();

  label.listen('signal', function() {
    label.draw();
  });
}

function oo(value) {
  label.position(value);
}

function aa(value) {
  label.anchor(value);
}