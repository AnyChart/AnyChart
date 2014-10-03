anychart.onDocumentReady(function() {
  // Create stage for all charts
  stage = anychart.graphics.create('container');

  //create palette based on brown color (using anychart.color.lighten)
  var palette_1 = anychart.utils.distinctColorPalette();
  palette_1.colors(['#c06a6a', '#d39797', '#e0b6b6']);

  // Create bullet chart
  var chart_1 = anychart.bulletChart([{value: 6, fill: 'black'}, {value: 11, fill: 'brown'}]);
  // Set chart to render on stage
  chart_1.container(stage);
  // Set chart size and position settings
  chart_1.bounds(0, 0, 250, '100%');
  // Set chart layout
  chart_1.layout('vertical');
  // Create chart ranges
  chart_1.range().from(0).to(5);
  chart_1.range(1).from(5).to(10);
  chart_1.range(2).from(10).to(15);
  //set chart to use palette
  chart_1.rangePalette(palette_1);
  // Initiate chart drawing
  chart_1.draw();
});