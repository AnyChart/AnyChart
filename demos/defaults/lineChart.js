var chart, data;
anychart.onDocumentReady(function() {
  data = [
    {x: 'Department Stores', value: '6371664'},
    {x: 'Discount Stores', value: '7216301'},
    {x: 'Men\'s/Women\'s Stores', value: '1486621'},
    {x: 'Juvenile Specialty Stores', value: '486622'},
    {x: 'All other outlets', value: '900000'}
  ];

  chart = anychart.line()
      .container('container');

  chart.line(data);
  chart.spline(data);
  chart.stepLine(data);

  chart.draw();
});
