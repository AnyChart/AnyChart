var chart;
anychart.onDocumentReady(function() {
  chart = anychart.pie([1, 5, 8, 3]);
  chart.group(function(value) {
    return value >= 4;
  });

  chart.container('container').draw();

  // 1
  var data = chart.data();
  var rowNumber = data.getRowsCount() - 1;
  console.log(data.meta(rowNumber, 'names'), data.meta(rowNumber, 'values'));

  // 2
  var iterator = data.getIterator();
  iterator.select(rowNumber);
  console.log(iterator.meta('names'), iterator.meta('values'));
});
