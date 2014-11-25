var chart;
anychart.onDocumentReady(function() {
  var data = [
    {x: 1, value: '6371664', size: '5'},
    {x: 2, value: '7216301', size: '8'},
    {x: 3, value: '1486621', size: '8'},
    {x: 4, value: '786622', size: '7'},
    {x: 5, value: '900000', size: '6'}
  ];

  var chart = anychart.cartesian()
      .container('container');

  chart.bubble(data).minimumSize('25%').maximumSize('45%');
  chart.marker(data).type('diamond');

  chart.draw();
});
