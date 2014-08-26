var labels;
var count = 5;
var index;

function load() {
  labels = new anychart.elements.LabelsFactory();
  labels.container('container');
  labels.clear();

  for (index = 1; index <= count; index++) {
    var formatProvider = {value: 'Label: ' + index};
    var positionProvider = {value: {x: 100 * index, y: 100}};

    labels.add(formatProvider, positionProvider);
  }
  labels.draw();


  labels.fontColor('red');
  labels.fontSize(25);
  labels.textFormatter(function() {
    return 'dfsdfsdf';
  });
  labels.background().enabled(true);
  labels.background().fill('green 0.3');


  labels.draw();
}

