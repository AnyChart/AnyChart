var chart, stage, scroller, scroller2;

anychart.onDocumentReady(function() {
  stage = anychart.graphics.create('container', 500, 500);

  var data = [];
  for (var i = 0; i < 500; i++) {
    data.push(Math.round(Math.random() * 1000 + 10) * i / 250);
  }
  chart = anychart.bar(data);
  //chart.column(data);
  //chart.bottom(50);
  //chart.xScale().ticks();
  //chart.xAxis(0).orientation('b').ticks(true).labels(true);
  //chart.xAxis(1).orientation('b').ticks(true).labels(true);
  //chart.xAxis(2).orientation('t').ticks(true).labels(true);
  //chart.xAxis(3).orientation('t').ticks(true).labels(true);
  //
  //chart.yAxis(0).orientation('l').ticks(true).labels(true);
  //chart.yAxis(1).orientation('l').ticks(true).labels(true);
  //chart.yAxis(2).orientation('r').ticks(true).labels(true);
  //chart.yAxis(3).orientation('r').ticks(true).labels(true);

  //chart.yAxis(0).orientation('b').ticks(true).labels(true);
  //chart.yAxis(1).orientation('b').ticks(true).labels(true);
  //chart.yAxis(2).orientation('t').ticks(true).labels(true);
  //chart.yAxis(3).orientation('t').ticks(true).labels(true);
  //
  //chart.xAxis(0).orientation('l').ticks(true).labels(true);
  //chart.xAxis(1).orientation('l').ticks(true).labels(true);
  //chart.xAxis(2).orientation('r').ticks(true).labels(true);
  //chart.xAxis(3).orientation('r').ticks(true).labels(true);
  chart.xScroller(true);
  //chart.xScroller().fill('red 0.5').selectedFill('green 0.5').position('b');
  //chart.xScroller().allowRangeChange(true).thumbs().enabled(false);

  //chart.xScale('linear');
  //chart.xAxis(false);
  //chart.xAxis().overlapMode('allow');
  //chart.xZoom().setToValues(20, 30)
  //scroller = anychart.ui.scroller();
  //scroller.height(50);
  //scroller.startRatio(0.6).endRatio(0.6125).allowRangeChange(true);
  //scroller.autoHide(true);
  //scroller.startRatio(0).endRatio(1).allowRangeChange(false);

  chart.xZoom().setToPointsCount(10, true);//.continuous(false)
  console.log(chart.xZoom().getStartRatio());
  //chart.xZoom().setTo(scroller.startRatio(), scroller.endRatio());
  //chart.xZoom().setTo(scroller.startRatio(), scroller.endRatio());
  chart.container(stage).draw();

  //scroller.container(stage).draw();

  //scroller.listen('scrollerchange', function(e) {
  //  chart.xZoom().setTo(e.startRatio, e.endRatio);
  //});
});

