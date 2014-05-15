var chart;
anychart.onDocumentReady(function() {
  var data = [
    {name: 'Department Stores', value: '63'},
    {name: 'Discount Stores', value: '72'},
    {name: 'Men\'s/Women\'s Stores', value: '14'},
    {name: 'Juvenile Specialty Stores', value: '7'},
    {name: 'All other outlets', value: '9'}
  ];

  chart = anychart.pieChart(data)
      .container('container');
  chart.draw();
});
