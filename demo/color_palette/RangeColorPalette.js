var palette, stage, index, count;
function load() {
  index;
  count = 20;

  stage = acgraph.create('100%', '100%', 'container');
  palette = new anychart.utils.RangeColorPalette();

  palette.listen('invalidated', function() {
//    stage.removeChildren();
    draw();
  });

  var bounds = new acgraph.math.Rect(40, 30, 40 * count - 10, 50);
  var keys = [{color: 'red', offset: 0}, {color: 'green', offset: 0.3}, {color: 'blue', offset: 1}];
  var lg = new acgraph.vector.LinearGradient(keys, 0.9, 0, bounds);
  stage.rect().setBounds(bounds).fill(lg);
  palette.colors(lg).count(count);
  palette.colorAt(17, 'yellow');
//  palette.restoreDefaults();
//  draw();
}

function draw() {


  for (index = 0; index < count; index++) {
    var rect = stage.rect(40 + 40 * index, 40, 30, 30);
    rect.fill(palette.colorAt(index));
  }
}
