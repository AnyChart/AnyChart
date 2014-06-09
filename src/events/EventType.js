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
  LEGEND_ITEM_DOUBLE_CLICK: 'legendItemDoubleClick'
};
