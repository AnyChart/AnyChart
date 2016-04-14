var csv, parser;
anychart.onDocumentReady(function() {
  chart = anychart.pie();
  chart.container('container');
  chart.data(
    [
      {
        name: 'P1',
        value: 1
      },
      {
        name: 'P2',
        value: 3
      },
      {
        name: 'P3',
        value: 2
      }
    ]
  );
  chart.draw();
  var columnsSeparator = ',';
  var rowsSeparator = '\n';
  csv = chart.toCsv('specific', {
    columnsSeparator: columnsSeparator,
    rowsSeparator: rowsSeparator
  });
  parser = anychart.data.csv.parser().columnsSeparator(columnsSeparator).rowsSeparator(rowsSeparator);
  console.log(csv);
  console.log(parser.parse(csv));
});

