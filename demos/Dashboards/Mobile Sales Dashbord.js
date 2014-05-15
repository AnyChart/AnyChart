var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet1 = new anychart.data.Set([
    [1, 10, 1.2],
    [2, 20, 1.3],
    [3, 30, 1.5],
    [4, 25, 1.6],
    [5, 11, 1.4]
  ]);

  var dataSet2 = new anychart.data.Set([
    [1, -0.489863522578899, 0.848138677816903],
    [2, -0.385774774190865, 0.779071607989758],
    [3, 0.085320462046806, 0.665356275004035],
    [4, 0.661951933364362, 1.48857802967009],
    [5, 0.275939368771361, 1.78112017585948],
    [6, 0.327782217100161, 0.910945756785081],
    [7, -0.353034448974316, 0.51492272900181],
    [8, -1.52464778559499, 0.260972126042923],
    [9, -0.593361686260142, 0.162759391666744],
    [10, -0.282102011275525, 0.828140289442679],
    [11, -1.23059300530264, 0.451152587985225],
    [12, -1.24995265027972, -0.31266194270582],
    [13, -1.37795240635888, -0.589722591726911],
    [14, -2.52518734732884, -0.95184304656081],
    [15, -1.70164913297708, -1.54184969446708],
    [16, -2.80066758524658, -1.31031245938982],
    [17, -2.21871327339612, -0.895693067878342],
    [18, -1.86045028588756, -1.26512897818588],
    [19, -2.13514441304614, -1.08943821214579],
    [20, -1.36106428148275, -0.751109295408758]
  ]);

  //helper function to setup same settings for all six charts


  var stage = acgraph.create('100%', '100%', 'container');

  var background = new anychart.elements.Background();
  background.bounds('-50%', '-15%', '200%', '130%');
  background.container(stage);
  background.fill({src: 'iphone-bg.svg', mode: 'stretch'});
  background.draw();

  var title = new anychart.elements.Title();
  title.container(stage);
  title.margin().top('120%');
  title.text('Sales Dashboard');
  title.fontWeight('normal');
  title.fontSize(20);
  title.fontColor('rgb(64,73,140)');
  title.draw();

  //header
  stage.text(320, 230, 'Key metrics').fontSize(12);
  stage.text(415, 230, 'Last 12 Months').fontSize(12);
  stage.text(530, 230, 'Current').fontSize(12);
  stage.text(595, 230, 'Variance from Plan').fontSize(12);

  //column 1
  stage.text(320, 255, 'Sales').fontSize(12);
  stage.text(320, 275, 'Expenses').fontSize(12);
  stage.text(320, 295, 'Profit').fontSize(12);
  stage.text(320, 315, 'Units Sold').fontSize(12);
  stage.text(320, 335, 'Market Share').fontSize(12);
  stage.text(320, 355, 'Customer Sat.').fontSize(12);

  //column 2
  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 255, 100, 10));
  series.draw();

  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 275, 100, 10));
  series.draw();

  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 295, 100, 10));
  series.draw();


  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 315, 100, 10));
  series.draw();


  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 335, 100, 10));
  series.draw();

  var series = new anychart.cartesian.series.Line([2, 4, 3, 6, 12, 8, 9, 10, 14]);
  series.markers(null);
  series.container(stage);
  series.pixelBounds(new anychart.math.Rect(410, 355, 100, 10));
  series.draw();

  //column 3
  stage.text(530, 255, '47.2M').fontSize(12).hAlign('right').width(45);
  stage.text(530, 275, '33.4M').fontSize(12).hAlign('right').width(45);
  stage.text(530, 295, '13.8M').fontSize(12).hAlign('right').width(45);
  stage.text(530, 315, '165K').fontSize(12).hAlign('right').width(45);
  stage.text(530, 335, '13%').fontSize(12).hAlign('right').width(45);
  stage.text(530, 355, '84%').fontSize(12).hAlign('right').width(45);

  //column 4

  var bar = new anychart.cartesian.series.Bar([10, 20]);
  bar.pixelBounds(new anychart.math.Rect(590, 255, 200, 10));
  bar.container(stage);
  bar.bounds(590, 255, 100, 10);
  bar.markers(null);
  bar.draw();




});
