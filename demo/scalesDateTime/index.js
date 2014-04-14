var scale1, scale2, scale3, scale4, axis1, axis2, axis3, axis4;

function load() {
  var stage = acgraph.create('100%', '100%', 'container');

  scale1 = new anychart.scales.DateTime();
//  scale1.minimumGap(0);
//  scale1.maximumGap(0);
//  scale1.ticks().count(5);
//  scale1.minorTicks().count(5);
  scale1.startAutoCalc().extendDataRange(Date.UTC(2001, 0), Date.UTC(2002, 0), Date.UTC(2003, 0)).finishAutoCalc();
//
//  scale2 = new anychart.scales.DateTime();
//  scale2.minimumGap(0);
//  scale2.maximumGap(0);
////  scale2.ticks().count(5);
////  scale2.minorTicks().count(5);
//  scale2.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1), Date.UTC(2000, 10, 1)).finishAutoCalc();
//
//  scale3 = new anychart.scales.DateTime();
//  scale3.minimumGap(0);
//  scale3.maximumGap(0);
////  scale3.ticks().count(5);
////  scale3.minorTicks().count(5);
//  scale3.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1, 0), Date.UTC(2000, 0, 14, 0)).finishAutoCalc();
//
//  scale4 = new anychart.scales.DateTime();
//  scale4.minimumGap(0);
//  scale4.maximumGap(0);
////  scale4.ticks().count(5);
////  scale4.minorTicks().count(5);
//  scale4.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1, 0, 0, 0), Date.UTC(2000, 0, 2, 0, 0, 0)).finishAutoCalc();

  axis1 = new anychart.elements.Axis();
  axis1.title().text('10 Years');
  axis1.length(500);
  axis1.offsetY(50);
  axis1.offsetX(0);
  axis1.scale(scale1);
  axis1.labels().textFormatter(function(value) { return new Date(value).toDateString(); });
  axis1.minorLabels().textFormatter(function(value) { return new Date(value).toDateString(); });
  axis1.container(stage);
  axis1.orientation('left');
  axis1.draw();

//  axis2 = new anychart.elements.Axis();
//  axis2.title().text('10 Months');
//  axis2.length(500);
//  axis2.offsetY(50);
//  axis2.offsetX(250);
//  axis2.scale(scale2);
//  axis2.labels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis2.minorLabels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis2.container(stage);
//  axis2.orientation('left');
//  axis2.draw();
//
//  axis3 = new anychart.elements.Axis();
//  axis3.title().text('2 Weeks');
//  axis3.length(500);
//  axis3.offsetY(50);
//  axis3.offsetX(500);
//  axis3.scale(scale3);
//  axis3.labels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis3.minorLabels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis3.container(stage);
//  axis3.orientation('left');
//  axis3.draw();
//
//  axis4 = new anychart.elements.Axis();
//  axis4.title().text('24 Hours');
//  axis4.length(500);
//  axis4.offsetY(50);
//  axis4.offsetX(750);
//  axis4.scale(scale4);
//  axis4.labels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis4.minorLabels().textFormatter(function(value) { return new Date(value).toDateString(); });
//  axis4.container(stage);
//  axis4.orientation('left');
//  axis4.draw();
}

