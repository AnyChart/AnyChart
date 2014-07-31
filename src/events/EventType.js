goog.provide('anychart.events.EventType');


/**
 * Event types enumeration.
 * @enum {string}
 */
anychart.events.EventType = {
  POINT_MOUSE_OUT: 'pointMouseOut',
  POINT_MOUSE_OVER: 'pointMouseOver',
  POINT_CLICK: 'pointClick',
  POINT_DOUBLE_CLICK: 'pointDoubleClick',
  CHART_DRAW: 'chartDraw',

  LEGEND_ITEM_MOUSE_OUT: 'legendItemMouseOut',
  LEGEND_ITEM_MOUSE_OVER: 'legendItemMouseOver',
  LEGEND_ITEM_MOUSE_MOVE: 'legendItemMouseMove',
  LEGEND_ITEM_CLICK: 'legendItemClick',
  LEGEND_ITEM_DOUBLE_CLICK: 'legendItemDoubleClick',

  SCROLL_CHANGE: 'scrollChange',

  SPLITTER_CHANGE: 'splitterChange'
};


//exports
goog.exportSymbol('anychart.events.EventType.POINT_MOUSE_OUT', anychart.events.EventType.POINT_MOUSE_OUT);
goog.exportSymbol('anychart.events.EventType.POINT_MOUSE_OVER', anychart.events.EventType.POINT_MOUSE_OVER);
goog.exportSymbol('anychart.events.EventType.POINT_CLICK', anychart.events.EventType.POINT_CLICK);
goog.exportSymbol('anychart.events.EventType.POINT_DOUBLE_CLICK', anychart.events.EventType.POINT_DOUBLE_CLICK);
goog.exportSymbol('anychart.events.EventType.CHART_DRAW', anychart.events.EventType.CHART_DRAW);
goog.exportSymbol('anychart.events.EventType.SCROLL_CHANGE', anychart.events.EventType.SCROLL_CHANGE);
goog.exportSymbol('anychart.events.EventType.SPLITTER_CHANGE', anychart.events.EventType.SPLITTER_CHANGE);
