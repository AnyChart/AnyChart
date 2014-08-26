var labels;
var hoverLabels;
var count = 1;
var index;
var boundsRects = [];

function load() {
  labels = new anychart.elements.LabelsFactory();
  labels.container('container');
  labels.background().enabled(true);
  labels.width(30).rotation(45);


  hoverLabels = new anychart.elements.LabelsFactory();
  hoverLabels.background().enabled(true);
  hoverLabels.rotation(180);




  /*labels.listenSignals(function() {
    labels.draw();
  });*/

  labels.listen(acgraph.events.EventType.MOUSEOVER, function(e) {
    var label = e.target;
    label.currentLabelsFactory(hoverLabels);
    label.draw();
  }, false);

  labels.listen(acgraph.events.EventType.MOUSEOUT, function(e) {
    var label = e.target;
    label.currentLabelsFactory(labels);
    label.draw();
  }, false);


  draw();


}

function draw() {
  console.log('draw');
  var rect;

  /*for (index = 0; index <= boundsRects.length; index++) {
    rect = boundsRects[index];

    if (rect) {
      boundsRects[index].dispose();
      boundsRects.splice(index, 1);
    }

  }*/
  labels.clear();

  for (index = 1; index <= count; index++) {
    var formatProvider = 'Label: ' + index;
    var positionProvider = {x: 100 * index, y: 100};


    var arr = labels.measureWithTransform(formatProvider, positionProvider);
    var path1 = labels.container().path().stroke('2 red');
    path1.moveTo(arr[0], arr[1]);
    for (var i = 0, len = arr.length; i < len-1; i+=2) {
      path1.lineTo(arr[i], arr[i+1]);
    }
    path1.close();


    var bounds = labels.measure(formatProvider, positionProvider);
    labels.container().rect().setBounds(bounds).stroke('2 green');


    labels.add(formatProvider, positionProvider);
  }
  labels.draw();
}
