var separator, rb, rect, stage;

function load() {
  document.getElementById('fn').innerHTML = '(function(path, bounds) {\n' +
      '    var centerX = bounds.getLeft() + bounds.width / 2;\n' +
      '    var centerY = bounds.getTop() + bounds.height / 2;\n' +
      '    path\n' +
      '\t.moveTo(centerX, bounds.top)\n' +
      '\t.lineTo(bounds.getRight(), centerY)\n' +
      '\t.lineTo(centerX, bounds.getBottom())\n' +
      '\t.lineTo(bounds.getLeft(), centerY)\n' +
      '\t.close();\n' +
      '});';
  separator = new anychart.core.ui.Separator();
  separator.container('container');
  separator.margin(10, 200, 50, 10).width('100').height('5');
  separator.draw();
  // еще можно поломать все меняя ориентацию и положение тайтла, если его ширина не фиксирована

  stage = separator.container().getStage();
  rect = stage.rect().fill('red .5').stroke('none');

  separator.listen('invalidated', function() {
    separator.draw();
    rb = separator.getRemainingBounds();
    rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
    rect.setBounds(rb);
  });
  rb = separator.getRemainingBounds();
  rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
  rect.setBounds(rb);
}

function oo(value) {
  separator.orientation(value);
}

function mm(side, value) {
  separator.margin()[side](value);
}

function ff(value) {
  separator.fill(value);
}

function ss(value) {
  separator.stroke(value);
}

function drawer(value) {
  var fn = eval(value);
  separator.drawer(fn);
}
