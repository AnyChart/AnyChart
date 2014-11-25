var paginator, rb, rect, container, stage;

function load() {
  paginator = new anychart.core.ui.Paginator();
  paginator.container('container');
  paginator.background({'fill': 'pink'});
  paginator.draw();

  stage = paginator.container().getStage();
  rect = stage.rect().fill('red .5').stroke('none');

  var redrawer = function() {
    paginator.draw();
    rb = paginator.getRemainingBounds();
    rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
    rect.setBounds(rb);
  };
  paginator.listenSignals(redrawer);
  rb = paginator.getRemainingBounds();
  rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
  rect.setBounds(rb);
}

function oo(value) {
  paginator.orientation(value);
}

function ll(value) {
  paginator.layout(value);
}

function on(value) {
  var on;
  if (value == 'enable') {
    on = true;
    this.value = 'disable';
  } else {
    on = false;
    this.value = 'enable';
  }
  paginator.enabled(on);
}
