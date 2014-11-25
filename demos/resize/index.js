var pieChart, cartesianChart;
anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', '100%', '100%');

  pieChart = new anychart.charts.Pie([
    {x: 'Department Stores', y: 6371664, exploded: true},
    {x: 'Discount Stores', y: 7216301},
    {x: 'Men\'s/Women\'s Stores', y: 1486621},
    {x: 'Juvenile Specialty Stores', y: 786622},
    {x: 'All other outlets', y: 900000}
  ]);
  pieChart.container(stage);
  pieChart.bounds(0, 0, '50%', '40%');
  pieChart.draw();

  cartesianChart = new anychart.charts.Cartesian();
  cartesianChart.container(stage);
  cartesianChart.xAxis();
  cartesianChart.yAxis();
  cartesianChart.bounds(0, '45%', '40%', '40%');
  cartesianChart.line([10, 30, 20, 40, 80, 50]);
  cartesianChart.draw();
});

