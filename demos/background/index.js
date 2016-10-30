var background, fill;
function load() {
  var stage = acgraph.create().container('container');

  background = anychart.standalones.background()
  background.bounds(100, 100, 400, 200);
  background.container(stage);
  background
      .cornerType('round')
      .corners(50, 30, 15, 55)
      .width(180)
      .stroke('#000 2').fill('yellow');
  background.draw();
}
