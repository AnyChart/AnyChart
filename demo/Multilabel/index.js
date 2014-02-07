var labels;
function load() {
  var index;
  var count = 12;

  labels = new anychart.elements.Multilabel();
  labels.container('container');
  labels.reset();

  for (index = 0; index <= count; index++) {
    labels.draw();
  }
  labels.end();

  // invalidate handler
  labels.listen('invalidated', function() {
    for (index = 0; index <= count; index++) {
      labels.draw();
    }
    this.end();
  });
}

function setPositionFormatter() {
  labels.positionFormatter(function(positionProvider, index) {
    return {x: 30 + 100 * index, y: 20};
  });
}

function setTextFormatter() {
  labels.textFormatter(function(formatProvider, index) {
    return 'New' + formatProvider['value'] + ': ' + index;
  });
}
