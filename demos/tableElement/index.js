anychart.onDocumentLoad(function() {
  var table = anychart.ui.table();

  var series_1 = anychart.line([1, 2, 3, 4, 5]);
  var series_2 = anychart.line([1, 2, 3, 4, 5]);
  var series_3 = anychart.line([5, 4, 3, 2, 1]);

  var series_4 = anychart.line([1, 2, 3, 4, 5]);
  var series_5 = anychart.line([1, 2, 3, 4, 5]);
  var series_6 = anychart.line([5, 4, 3, 2, 1]);

  table.container('container');
  table.contents([
    [series_1, 'Some text', series_4, 'Some more text'],
    [series_2, 'Some text', series_5, 'Some more text'],
    [series_3, 'Some text', series_6, 'Some more text']
  ]);

  table.draw();
});