var labels;
function load() {
  var index;
  var count = 12;

  labels = new anychart.elements.Multilabel();
  labels.container('container');


  for (index = 0; index <= count; index++) {
    labels.draw(null, null);
  }
  labels.end();
  labels.listen('invalidated', function() {
    labels.end();

    for (index = 0; index <= count; index++) {
      labels.draw(null, null);
    }
  });


}
