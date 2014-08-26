anychart.onDocumentReady(function() {

  //create pie chart with passed data
  var chart = anychart.pieChart([
    ['Department Stores', 6371664],
    ['Discount Stores', 7216301],
    ['Men\'s/Women\'s Stores', 1486621],
    ['Juvenile Specialty Stores', 786622],
    ['All other outlets', 900000]
  ]);

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('ACME Corp. apparel sales through different retail channels');

  //create empty area in pie chart
  chart.innerRadius('40%');
  chart.labelsPosition('outside');
  chart.labels().fontColor('black');

  //initiate chart drawing
  chart.draw();
});
