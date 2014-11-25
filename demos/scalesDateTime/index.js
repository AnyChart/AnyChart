var scale1, scale2, scale3, scale4, scale5, scale6, axis1, axis2, axis3, axis4, axis5, axis6;
var scale7, scale8, scale9, scale10, scale11, scale12, axis7, axis8, axis9, axis10, axis11, axis12;
var scale13, scale14, scale15, scale16, scale17, scale18, axis13, axis14, axis15, axis16, axis17, axis18;

function load() {
  var stage = acgraph.create('container', '100%', '100%');
  stage.path().moveTo(0, 310).lineTo(1500, 310).moveTo(0, 610).lineTo(1500, 610)
      .moveTo(250, 0).lineTo(250, 920)
      .moveTo(500, 0).lineTo(500, 920)
      .moveTo(750, 0).lineTo(750, 920)
      .moveTo(1000, 0).lineTo(1000, 920)
      .moveTo(1250, 0).lineTo(1250, 920);

  scale1 = new anychart.scales.DateTime();
  scale1.minimumGap(0);
  scale1.maximumGap(0);
  scale1.startAutoCalc().extendDataRange(Date.UTC(1979, 0), Date.UTC(1991, 0)).finishAutoCalc();

  scale2 = new anychart.scales.DateTime();
  scale2.minimumGap(0);
  scale2.maximumGap(0);
  scale2.startAutoCalc().extendDataRange(Date.UTC(2000, 2), Date.UTC(2000, 38)).finishAutoCalc();

  scale3 = new anychart.scales.DateTime();
  scale3.minimumGap(0);
  scale3.maximumGap(0);
  scale3.startAutoCalc().extendDataRange(Date.UTC(2000, 2), Date.UTC(2000, 16)).finishAutoCalc();

  scale4 = new anychart.scales.DateTime();
  scale4.minimumGap(0);
  scale4.maximumGap(0);
  scale4.startAutoCalc().extendDataRange(Date.UTC(2000, 7), Date.UTC(2000, 15)).finishAutoCalc();

  scale5 = new anychart.scales.DateTime();
  scale5.minimumGap(0);
  scale5.maximumGap(0);
  scale5.startAutoCalc().extendDataRange(Date.UTC(2000, 1), Date.UTC(2000, 3)).finishAutoCalc();

  scale6 = new anychart.scales.DateTime();
  scale6.minimumGap(0);
  scale6.maximumGap(0);
  scale6.startAutoCalc().extendDataRange(Date.UTC(2000, 7, 1), Date.UTC(2000, 7, 22)).finishAutoCalc();

  scale7 = new anychart.scales.DateTime();
  scale7.minimumGap(0);
  scale7.maximumGap(0);
  scale7.startAutoCalc().extendDataRange(Date.UTC(2000, 3, 4), Date.UTC(2000, 3, 18)).finishAutoCalc();

  scale8 = new anychart.scales.DateTime();
  scale8.minimumGap(0);
  scale8.maximumGap(0);
  scale8.startAutoCalc().extendDataRange(Date.UTC(2000, 1, 11), Date.UTC(2000, 1, 22)).finishAutoCalc();

  scale9 = new anychart.scales.DateTime();
  scale9.minimumGap(0);
  scale9.maximumGap(0);
  scale9.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1, 0, 0, 0), Date.UTC(2000, 0, 4)).finishAutoCalc();

  scale10 = new anychart.scales.DateTime();
  scale10.minimumGap(0);
  scale10.maximumGap(0);
  scale10.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 7, 15), Date.UTC(2000, 0, 7, 34)).finishAutoCalc();

  scale11 = new anychart.scales.DateTime();
  scale11.minimumGap(0);
  scale11.maximumGap(0);
  scale11.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1, 0), Date.UTC(2000, 0, 1, 8)).finishAutoCalc();

  scale12 = new anychart.scales.DateTime();
  scale12.minimumGap(0);
  scale12.maximumGap(0);
  scale12.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 1, 13, 14), Date.UTC(2000, 0, 1, 13, 31)).finishAutoCalc();

  scale13 = new anychart.scales.DateTime();
  scale13.minimumGap(0);
  scale13.maximumGap(0);
  scale13.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 5, 3, 38), Date.UTC(2000, 0, 5, 3, 41)).finishAutoCalc();

  scale14 = new anychart.scales.DateTime();
  scale14.minimumGap(0);
  scale14.maximumGap(0);
  scale14.startAutoCalc().extendDataRange(Date.UTC(2000, 0, 8, 13, 56, 15), Date.UTC(2000, 0, 8, 13, 57, 21)).finishAutoCalc();

  scale15 = new anychart.scales.DateTime();
  scale15.minimumGap(0);
  scale15.maximumGap(0);
  scale15.startAutoCalc().extendDataRange(Date.UTC(2000, 2, 18, 16, 27, 37), Date.UTC(2000, 2, 18, 16, 27, 50)).finishAutoCalc();

  scale16 = new anychart.scales.DateTime();
  scale16.minimumGap(0);
  scale16.maximumGap(0);
  scale16.startAutoCalc().extendDataRange(Date.UTC(2000, 3, 24, 4, 35, 7, 15), Date.UTC(2000, 3, 24, 4, 35, 8, 15)).finishAutoCalc();

  scale17 = new anychart.scales.DateTime();
  scale17.minimumGap(0);
  scale17.maximumGap(0);
  scale17.startAutoCalc().extendDataRange(Date.UTC(2000, 3, 24, 4, 35, 7, 15), Date.UTC(2000, 3, 24, 4, 35, 7, 615)).finishAutoCalc();

  scale18 = new anychart.scales.DateTime();
  scale18.minimumGap(0);
  scale18.maximumGap(0);
  scale18.startAutoCalc().extendDataRange(Date.UTC(2000, 3, 24, 4, 35, 7, 18), Date.UTC(2000, 3, 24, 4, 35, 7, 32)).finishAutoCalc();

  axis1 = new anychart.core.axes.Linear();
  axis1.title().text('12 Years');
  axis1.length(280);
  axis1.offsetY(20);
  axis1.offsetX(0);
  axis1.scale(scale1);
  axis1.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis1.minorLabels().enabled(true);
  axis1.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis1.overlapMode(anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP);
  axis1.staggerMode(false);
  axis1.container(stage);
  axis1.orientation('left');
  axis1.draw();

  axis2 = new anychart.core.axes.Linear();
  axis2.title().text('36 Months');
  axis2.length(280);
  axis2.offsetY(20);
  axis2.offsetX(250);
  axis2.scale(scale2);
  axis2.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis2.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis2.minorLabels().enabled(true);
  axis2.staggerMode(false);
  axis2.container(stage);
  axis2.orientation('left');
  axis2.draw();

  axis3 = new anychart.core.axes.Linear();
  axis3.title().text('14 Month');
  axis3.length(280);
  axis3.offsetY(20);
  axis3.offsetX(500);
  axis3.scale(scale3);
  axis3.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis3.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis3.minorLabels().enabled(true);
  axis3.staggerMode(false);
  axis3.container(stage);
  axis3.orientation('left');
  axis3.draw();

  axis4 = new anychart.core.axes.Linear();
  axis4.title().text('8 Month');
  axis4.length(280);
  axis4.offsetY(20);
  axis4.offsetX(750);
  axis4.scale(scale4);
  axis4.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis4.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis4.minorLabels().enabled(true);
  axis4.staggerMode(false);
  axis4.container(stage);
  axis4.orientation('left');
  axis4.draw();

  axis5 = new anychart.core.axes.Linear();
  axis5.title().text('2 Month');
  axis5.length(280);
  axis5.offsetY(20);
  axis5.offsetX(1000);
  axis5.scale(scale5);
  axis5.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis5.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis5.minorLabels().enabled(true);
  axis5.staggerMode(false);
  axis5.container(stage);
  axis5.orientation('left');
  axis5.draw();

  axis6 = new anychart.core.axes.Linear();
  axis6.title().text('3 Weeks');
  axis6.length(280);
  axis6.offsetY(20);
  axis6.offsetX(1250);
  axis6.scale(scale6);
  axis6.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis6.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis6.minorLabels().enabled(true);
  axis6.staggerMode(false);
  axis6.container(stage);
  axis6.orientation('left');
  axis6.draw();


  axis7 = new anychart.core.axes.Linear();
  axis7.title().text('2 Weeks');
  axis7.length(280);
  axis7.offsetY(320);
  axis7.offsetX(0);
  axis7.scale(scale7);
  axis7.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis7.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis7.minorLabels().enabled(true);
  axis7.staggerMode(false);
  axis7.container(stage);
  axis7.orientation('left');
  axis7.draw();

  axis8 = new anychart.core.axes.Linear();
  axis8.title().text('11 days');
  axis8.length(280);
  axis8.offsetY(320);
  axis8.offsetX(250);
  axis8.scale(scale8);
  axis8.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis8.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis8.minorLabels().enabled(true);
  axis8.staggerMode(false);
  axis8.container(stage);
  axis8.orientation('left');
  axis8.draw();

  axis9 = new anychart.core.axes.Linear();
  axis9.title().text('3 days');
  axis9.length(280);
  axis9.offsetY(320);
  axis9.offsetX(500);
  axis9.scale(scale9);
  axis9.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis9.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis9.minorLabels().enabled(true);
  axis9.staggerMode(false);
  axis9.container(stage);
  axis9.orientation('left');
  axis9.draw();

  axis10 = new anychart.core.axes.Linear();
  axis10.title().text('19 hours');
  axis10.length(280);
  axis10.offsetY(320);
  axis10.offsetX(750);
  axis10.scale(scale10);
  axis10.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis10.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis10.minorLabels().enabled(true);
  axis10.staggerMode(false);
  axis10.container(stage);
  axis10.orientation('left');
  axis10.draw();

  axis11 = new anychart.core.axes.Linear();
  axis11.title().text('8 hours');
  axis11.length(280);
  axis11.offsetY(320);
  axis11.offsetX(1000);
  axis11.scale(scale11);
  axis11.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis11.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis11.minorLabels().enabled(true);
  axis11.staggerMode(false);
  axis11.container(stage);
  axis11.orientation('left');
  axis11.draw();

  axis12 = new anychart.core.axes.Linear();
  axis12.title().text('17 minutes');
  axis12.length(280);
  axis12.offsetY(320);
  axis12.offsetX(1250);
  axis12.scale(scale12);
  axis12.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis12.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis12.minorLabels().enabled(true);
  axis12.staggerMode(false);
  axis12.container(stage);
  axis12.orientation('left');
  axis12.draw();

  axis13 = new anychart.core.axes.Linear();
  axis13.title().text('3 minutes');
  axis13.length(280);
  axis13.offsetY(620);
  axis13.offsetX(0);
  axis13.scale(scale13);
  axis13.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis13.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis13.minorLabels().enabled(true);
  axis13.staggerMode(false);
  axis13.container(stage);
  axis13.orientation('left');
  axis13.draw();

  axis14 = new anychart.core.axes.Linear();
  axis14.title().text('66 seconds');
  axis14.length(280);
  axis14.offsetY(620);
  axis14.offsetX(250);
  axis14.scale(scale14);
  axis14.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis14.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis14.minorLabels().enabled(true);
  axis14.staggerMode(false);
  axis14.container(stage);
  axis14.orientation('left');
  axis14.draw();

  axis15 = new anychart.core.axes.Linear();
  axis15.title().text('13 seconds');
  axis15.length(280);
  axis15.offsetY(620);
  axis15.offsetX(500);
  axis15.scale(scale15);
  axis15.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis15.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis15.minorLabels().enabled(true);
  axis15.staggerMode(false);
  axis15.container(stage);
  axis15.orientation('left');
  axis15.draw();

  axis16 = new anychart.core.axes.Linear();
  axis16.title().text('1 second');
  axis16.length(280);
  axis16.offsetY(620);
  axis16.offsetX(750);
  axis16.scale(scale16);
  axis16.labels().textFormatter(function(value) { return new Date(value.value).toUTCString(); }).fontWeight('bold');
  axis16.minorLabels().textFormatter(function(value) { return new Date(value.value).toUTCString(); });
  axis16.minorLabels().enabled(true);
  axis16.staggerMode(false);
  axis16.container(stage);
  axis16.orientation('left');
  axis16.draw();

  axis17 = new anychart.core.axes.Linear();
  axis17.title().text('600 milliseconds');
  axis17.length(280);
  axis17.offsetY(620);
  axis17.offsetX(1000);
  axis17.scale(scale17);
  axis17.labels().textFormatter(function(value) { var tmp = new Date(value.value); return tmp.getUTCSeconds() + '.' + tmp.getUTCMilliseconds(); }).fontWeight('bold');
  axis17.minorLabels().textFormatter(function(value) { var tmp = new Date(value.value); return tmp.getUTCSeconds() + '.' + tmp.getUTCMilliseconds(); });
  axis17.minorLabels().enabled(true);
  axis17.staggerMode(false);
  axis17.container(stage);
  axis17.orientation('left');
  axis17.draw();

  axis18 = new anychart.core.axes.Linear();
  axis18.title().text('14 milliseconds');
  axis18.length(280);
  axis18.offsetY(620);
  axis18.offsetX(1250);
  axis18.scale(scale18);
  axis18.labels().textFormatter(function(value) { var tmp = new Date(value.value); return tmp.getUTCSeconds() + '.' + tmp.getUTCMilliseconds(); }).fontWeight('bold');
  axis18.minorLabels().textFormatter(function(value) { var tmp = new Date(value.value); return tmp.getUTCSeconds() + '.' + tmp.getUTCMilliseconds(); });
  axis18.minorLabels().enabled(true);
  axis18.staggerMode(false);
  axis18.container(stage);
  axis18.orientation('left');
  axis18.draw();
}

