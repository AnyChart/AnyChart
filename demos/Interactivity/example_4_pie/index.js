var chart, stage;

anychart.onDocumentReady(function() {
  stage = anychart.graphics.create('container');

  // create pie chart with passed data
  chart = anychart.pie([
    ['Department Stores', 6371664],
    ['Discount Stores', 7216301],
    ['Men\'s/Women\'s Stores', 1486621],
    ['Juvenile Specialty Stores', 786622],
    ['All other outlets', 900000]
  ]);
  chart.bounds(0, 0, '50%', '100%');

  // set container id for the chart
  chart.container(stage);

  // set chart title text settings
  chart.title('ACME Corp. apparel sales through different retail channels');

  // set legend title text settings
  chart.legend(true);
  chart.legend().title('Retail channels');

  // set legend position and items layout
  chart.legend().position('bottom');
  chart.legend().itemsLayout('horizontal');
  chart.legend().align('center');

  //chart.listen('pointMouseOver', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointMouseOut', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointsHover', function(e) {
  //  console.log(e.type);
  //});

  // initiate chart drawing
  chart.draw();

  // create pie chart with passed data
  chart = anychart.pie([
    ['Department Stores', 6371664],
    ['Discount Stores', 7216301],
    ['Men\'s/Women\'s Stores', 1486621],
    ['Juvenile Specialty Stores', 786622],
    ['All other outlets', 900000]
  ]);
  chart.bounds('50%', 0, '50%', '100%');

  // set container id for the chart
  chart.container(stage);

  chart.interactivity('single');

  // set chart title text settings
  chart.title('ACME Corp. apparel sales through different retail channels');

  // set legend title text settings
  chart.legend(true);
  chart.legend().title('Retail channels');

  // set legend position and items layout
  chart.legend().position('bottom');
  chart.legend().itemsLayout('horizontal');
  chart.legend().align('center');

  //chart.listen('pointMouseOver', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointMouseOut', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointsHover', function(e) {
  //  console.log(e.type);
  //});

  // initiate chart drawing
  chart.draw();
});


