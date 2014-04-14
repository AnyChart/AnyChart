var data, dataSet, mapping, view1, view2, view3, title, ticker, scale;

function load() {
  scale = new anychart.scales.Linear();
  scale.listenSignals(function(e) { console.log(e); });
}

function load1() {
  //all scale features
  scale = new anychart.scales.Linear();

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(0, 1);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(0, 1);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(0.00023, 0.00065);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(0.00023, 0.00065);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(1, 10);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(1, 10);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(0, 11);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(0, 11);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(1, 10);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(1, 10);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(0, 1);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(0, 1);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(0.00023, 0.00065);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(0.00023, 0.00065);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('linear');
  scale.minorTicks().mode('linear');
  scale.resetDataRange().extendDataRange(150000000, 150000100);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale.ticks().mode('log');
  scale.minorTicks().mode('log');
  scale.resetDataRange().extendDataRange(150000000, 150000100);
  console.log(scale.minimum(), scale.maximum(), scale.ticks().get(), scale.minorTicks().get());

  scale = new anychart.scales.Ordinal();
  scale.values(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().interval(2);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().interval(3);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([0, 3, 6, 9]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([1, 3, 6, 9]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([3, 3, 6, 6]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([3, 3, 6, 4]);
  console.log(scale.ticks().get(), scale.ticks().names());


  var stage = acgraph.create('100%', '100%', 'container');

  var scale1 = new anychart.scales.Logarithmic();
  scale1.ticks().mode('linear');
  scale1.minorTicks().mode('linear');
  scale1.resetDataRange().extendDataRange(.01, 1001);

  var scale2 = new anychart.scales.Logarithmic();
  scale2.ticks().mode('linear');
  scale2.minorTicks().mode('log');
  scale2.resetDataRange().extendDataRange(.01, 1001);

  var scale3 = new anychart.scales.Logarithmic();
  scale3.ticks().mode('log');
  scale3.minorTicks().mode('linear');
  scale3.resetDataRange().extendDataRange(.01, 1001);

  var scale4 = new anychart.scales.Logarithmic();
  scale4.ticks().mode('log');
  scale4.minorTicks().mode('log');
  scale4.resetDataRange().extendDataRange(.01, 1001);

  var axis1 = new anychart.elements.Axis();
  axis1.title().text('Linear Linear');
  axis1.length(500);
  axis1.offsetX(250);
  axis1.scale(scale1);
  axis1.container(stage);
  axis1.orientation('top');
  axis1.draw();

  var axis2 = new anychart.elements.Axis();
  axis2.title().text('Linear Log');
  axis2.length(500);
  axis2.offsetY(50);
  axis2.scale(scale2);
  axis2.container(stage);
  axis2.orientation('right');
  axis2.draw();

  var axis3 = new anychart.elements.Axis();
  axis3.title().text('Log Linear');
  axis3.length(500);
  axis3.offsetX(250);
  axis3.scale(scale3);
  axis3.container(stage);
  axis3.orientation('bottom');
  axis3.draw();

  var axis4 = new anychart.elements.Axis();
  axis4.title().text('Log Log');
  axis4.length(500);
  axis4.offsetY(50);
  axis4.scale(scale4);
  axis4.container(stage);
  axis4.orientation('left');
  axis4.draw();
}

