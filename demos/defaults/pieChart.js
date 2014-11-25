var chart;
anychart.onDocumentReady(function() {
  var data = [
    {name: 'Department Stores', value: '6371664'},
    {name: 'Discount Stores', value: '7216301'},
    {name: 'Men\'s/Women\'s Stores', value: '1486621'},
    {name: 'Juvenile Specialty Stores', value: '786622'},
    {name: 'All other outlets', value: '900000'}
  ];

  chart = anychart.pie(data)
      .container('container');
  chart.draw();
});
