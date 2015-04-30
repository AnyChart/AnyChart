var chart, pie;
anychart.onDocumentReady(function() {
  chart = anychart.line();
  chart.yScale().stickToZero(false);
  chart.spline([10, 10, 10]).labels(true).markers(true);
  chart.box([[0, 10, 20, 30, 40, 50, [60, 70]], [1, 10, 20, 30, 40, 50, [60, 70]], [2, 10, 20, 30, 40, 50, [60, 70]]]).labels(true).markers(true);
  chart.candlestick([[0, 10, 20, 30, 40, 50], [1, 10, 20, 30, 40, 50], [2, 10, 20, 30, 40, 50]]).labels(true).markers(true);
  chart.rangeArea([[0, 10, 20, 30, 40, 50], [1, 10, 20, 30, 40, 50], [2, 10, 20, 30, 40, 50]]).labels(true).markers(true);
  chart.marker([0, 0, 0]).labels(true);
  chart.listen('click', function(e) {console.log('chart click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.listen('pointClick', function(e) {console.log('chart point click', e.pointIndex);});
  chart.getSeries(0).listen('click', function(e) {console.log('series 0 click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(0).listen('pointClick', function(e) {console.log('series 0 point click', e.pointIndex);});
  chart.getSeries(0).labels().listen('click', function(e) {console.log('series 0 labels click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(0).markers().listen('click', function(e) {console.log('series 0 markers click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(1).listen('click', function(e) {console.log('series 1 click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(1).listen('pointClick', function(e) {console.log('series 1 point click', e.pointIndex);});
  chart.getSeries(1).labels().listen('click', function(e) {console.log('series 1 labels click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(1).markers().listen('click', function(e) {console.log('series 1 markers click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(1).outlierMarkers().listen('click', function(e) {console.log('series 1 outlier markers click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(2).listen('click', function(e) {console.log('series 2 click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(2).listen('pointClick', function(e) {console.log('series 2 point click', e.pointIndex);});
  chart.getSeries(2).labels().listen('click', function(e) {console.log('series 2 labels click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(2).markers().listen('click', function(e) {console.log('series 2 markers click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(3).listen('click', function(e) {console.log('series 3 click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(3).listen('pointClick', function(e) {console.log('series 3 point click', e.pointIndex);});
  chart.getSeries(3).labels().listen('click', function(e) {console.log('series 3 labels click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(3).markers().listen('click', function(e) {console.log('series 3 markers click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(4).listen('click', function(e) {console.log('series 4 click', e.pointIndex, e.markerIndex, e.labelIndex);});
  chart.getSeries(4).listen('pointClick', function(e) {console.log('series 4 point click', e.pointIndex);});

  //chart.ohlc([
  //  {open: 10, high: 30, low: 0, close: 20},
  //  {open: 10, high: 30, low: 0, close: 20, label: {position: 'top'}},
  //  {open: 10, high: 30, low: 0, close: 20}
  //]).labels({position: 'left'});

  chart.container('container').draw();

  pie = anychart.pie([1, 2, 3]);
  pie.labels(true);
  pie.listen('click', function(e) {console.log('pie click', e.pointIndex, e.markerIndex, e.labelIndex);});
  pie.labels().listen('click', function(e) {console.log('pie labels click', e.pointIndex, e.markerIndex, e.labelIndex);});
  pie.listen('pointClick', function(e) {console.log('pie point click', e.pointIndex); });
  var q = NaN;
  pie.listen('pointClick', function(e) {
    if (isNaN(q)) {
      q = e.pointIndex;
      return true;
    } else if (e.pointIndex == q) {
      q = NaN;
      return true;
    } else {
      pie.explodeSlice(q, false);
      q = e.pointIndex;
      pie.explodeSlice(q, true);
      return false;
    }
  });
  pie.container('container1').draw();
});
