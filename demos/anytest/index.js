var chart;
anychart.onDocumentLoad(function() {
  anytest.setUp(400, 350);

//---------------------Linear Scale-----------------------------------------

  var scale = anychart.scales.linear();
  scale.ticks([1, 2, 3, 4]).minimum(1).maximum(4);

  axis = anychart.axes.linear();
  axis.parentBounds(105, 65, 200, 100)
      .scale(scale)
      .title().enabled(false);
  anytest.drawInStage(axis);

  lineMarker = anychart.axisMarkers.line();
  lineMarker.parentBounds(105, 20, 200, 67)
      .scale(scale)
      .value(1.5)
      .layout('vertical');
  anytest.drawInStage(lineMarker);

  textMarker = anychart.axisMarkers.text();
  textMarker.scale(scale)
      .text('Linear')
      .value(1.5)
      .parentBounds(55, 5, 200, 67);
  anytest.drawInStage(textMarker);

//------------------------Logarithmic scale---------------------------------------

  var scale1 = anychart.scales.log();
  scale1.minimum(0.001).maximum(1000);

  axis1 = anychart.axes.linear();
  axis1.parentBounds(105, 140, 200, 100)
      .scale(scale1)
      .title().enabled(false);
  anytest.drawInStage(axis1);

  linemarker1 = anychart.axisMarkers.line();
  linemarker1.parentBounds(105, 95, 200, 67)
      .scale(scale1)
      .value(0.01)
      .layout(anychart.enums.Layout.VERTICAL);
  anytest.drawInStage(linemarker1);

  textMarker1 = anychart.axisMarkers.text();
  textMarker1.scale(scale1)
      .text('Logarithmic')
      .value(0.01)
      .parentBounds(70, 80, 200, 67);
  anytest.drawInStage(textMarker1);

//------------------------Ordinal scale---------------------------------------

  var scale2 = anychart.scales.ordinal();
  scale2.values(['P1', 2, 'P3', 4, 5, 6]);

  axis2 = anychart.axes.linear();
  axis2.parentBounds(105, 215, 200, 67)
      .scale(scale2);
  axis2.title().enabled(false);
  anytest.drawInStage(axis2);

  linemarker2 = anychart.axisMarkers.line();
  linemarker2.parentBounds(105, 170, 200, 67)
      .scale(scale2)
      .value(2)
      .layout(anychart.enums.Layout.VERTICAL);
  anytest.drawInStage(linemarker2);

  textMarker2 = anychart.axisMarkers.text();
  textMarker2.scale(scale2)
      .text('Ordinal')
      .value(2)
      .parentBounds(75, 160, 200, 67);
  anytest.drawInStage(textMarker2);

//------------------------DateTime scale---------------------------------------

  var scale3 = anychart.scales.dateTime();
  scale3.minimum(Date.UTC(2004, 7, 1)).maximum(Date.UTC(2016, 8, 5));
  scale3.ticks().interval('years', 2);

  axis3 = anychart.axes.linear();
  axis3.parentBounds(105, 290, 200, 67)
      .scale(scale3);
  axis3.title().enabled(false);
  anytest.drawInStage(axis3);

  linemarker3 = anychart.axisMarkers.line();
  linemarker3.parentBounds(105, 245, 200, 67);
  linemarker3.scale(scale3);
  linemarker3.value(1217548800000) //Date.UTC(2008, 08, 01)
      .layout('vertical');
  anytest.drawInStage(linemarker3);

  textMarker3 = anychart.axisMarkers.text();
  textMarker3.scale(scale3)
      .text('DateTime')
      .value(1217548800000) //Date.UTC(2008, 08, 01)
      .parentBounds(100, 240, 200, 67);

  anytest.stageListen().drawInStage(textMarker3);
  anytest.charts4modes(
      'axis', 'lineMarker', 'textMarker',
      'axis1', 'linemarker1', 'textMarker1',
      'axis2', 'lineMarker2', 'textMarker2',
      'axis3', 'linemarker3', 'textMarker3');
  stage.resume();
});


