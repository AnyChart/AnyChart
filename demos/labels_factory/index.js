var labels;
var count = 1;
var index;

function load() {
  labels = new anychart.core.ui.LabelsFactory();
  labels.container('container');
  labels.clear();

  for (index = 1; index <= count; index++) {
    var formatProvider = {value: 'Label: ' + index};
    var positionProvider = {value: {x: 300 * index * 2, y: 300}};

    labels.add(formatProvider, positionProvider)
        .padding('40%', 10, '20%', 20);
  }
  labels.draw();


  labels.width(100);
  labels.height(100);
  labels.fontColor('red');
  labels.fontSize(25);
  labels.textFormatter(function() {
    return 'A';
  });
  labels.background().enabled(true);
  labels.background().fill('green 0.3');


  labels.draw();
}

