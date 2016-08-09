anychart.onDocumentReady(function() {
  chart = anychart.bar3d();
  bar = chart.bar([3]);
  // bar.fill('red');
  // bar.hoverFill('red');
  // bar.selectFill('red');
  // bar.hatchFill(acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD);
  // bar.hoverHatchFill(acgraph.vector.HatchFill.HatchFillType.CONFETTI);
  bar.selectHatchFill(acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD);

  var eventsForSeries = [
    //ACDVF
    anychart.enums.EventType.POINT_CLICK,
    // anychart.enums.EventType.POINT_DBLCLICK,
    //
    // anychart.enums.EventType.POINT_MOUSE_DOWN,
    // anychart.enums.EventType.POINT_MOUSE_MOVE,
    // anychart.enums.EventType.POINT_MOUSE_OUT,
    // anychart.enums.EventType.POINT_MOUSE_OVER,
    // anychart.enums.EventType.POINT_MOUSE_UP,

    //graphics
    acgraph.events.EventType.CLICK,
    // acgraph.events.EventType.DBLCLICK,
    // acgraph.events.EventType.MOUSEDOWN,
    // acgraph.events.EventType.MOUSEUP,
    // acgraph.events.EventType.MOUSEOVER,
    // acgraph.events.EventType.MOUSEOUT,
    // acgraph.events.EventType.MOUSEMOVE
  ];

  var eventsForChart = [
    //ACDVF
    anychart.enums.EventType.POINT_CLICK,
    anychart.enums.EventType.POINT_DBLCLICK,

    anychart.enums.EventType.POINTS_SELECT,
    anychart.enums.EventType.POINTS_HOVER,

    anychart.enums.EventType.POINT_MOUSE_DOWN,
    anychart.enums.EventType.POINT_MOUSE_MOVE,
    anychart.enums.EventType.POINT_MOUSE_OUT,
    anychart.enums.EventType.POINT_MOUSE_OVER,
    anychart.enums.EventType.POINT_MOUSE_UP,

    //graphics
    acgraph.events.EventType.CLICK,
    acgraph.events.EventType.DBLCLICK,
    acgraph.events.EventType.MOUSEDOWN,
    acgraph.events.EventType.MOUSEUP,
    acgraph.events.EventType.MOUSEOVER,
    acgraph.events.EventType.MOUSEOUT,
    acgraph.events.EventType.MOUSEMOVE
  ];

  goog.events.listen(bar, eventsForSeries, function(e) {
    console.log('series', e.type);
  });

  goog.events.listen(chart, eventsForChart, function(e) {
    // console.log('chart', e.type);
  });

  chart.container('container').draw();
});
