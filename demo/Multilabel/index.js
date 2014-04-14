var labels;
var count = 8;
var index;
var boundsRects = [];

function load() {
  labels = new anychart.elements.Multilabel();
  labels.container('container');
  labels.background().enabled(true);
  labels.width(30);
  draw();

  // invalidate handler
  labels.listenSignals(function() {
    draw();
  });
}

function draw() {
  var rect;

  /*for (index = 0; index <= boundsRects.length; index++) {
    rect = boundsRects[index];

    if (rect) {
      boundsRects[index].dispose();
      boundsRects.splice(index, 1);
    }

  }*/

  for (index = 1; index <= count; index++) {
    var formatProvider = 'Label: ' + index;
    var positionProvider = {x: 100 * index, y: 100};

//    var bounds = labels.measure(formatProvider, positionProvider, index);
//    console.log(bounds);
//    rect = labels.container().rect().setBounds(bounds);
//    boundsRects[index] = (rect);

    labels.draw(formatProvider, positionProvider);
  }
  labels.end();


}
