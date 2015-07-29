var palette, stage, index, count;
function load() {
  index;
  count = 12;

  stage = acgraph.create('container', '100%', '100%');
  palette = new anychart.palettes.DistinctColors();
  palette.listen('invalidated', function() {
    stage.removeChildren();
    draw();
  });
  draw();

  palette.colorAt(0, 'green');
  palette.colors(['red', 'green', 'blue']);
  draw();
}

function draw() {
  for (index = 0; index <= count; index++) {
    var rect = stage.rect(40 * index, 40, 30, 30);
    rect.fill(palette.colorAt(index));
  }
}

