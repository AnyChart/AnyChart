goog.provide('anychart.enums');


/**
 @namespace
 @name anychart.enums
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Chart types enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Chart types.
 * @enum {string}
 */
anychart.enums.ChartTypes = {
  AREA: 'area',
  VERTICAL_AREA: 'verticalArea',
  AREA_3D: 'area3d',
  BAR: 'bar',
  BAR_3D: 'bar3d',
  BOX: 'box',
  BUBBLE: 'bubble',
  BULLET: 'bullet',
  CARTESIAN: 'cartesian',
  CARTESIAN_3D: 'cartesian3d',
  COLUMN: 'column',
  COLUMN_3D: 'column3d',
  FINANCIAL: 'financial',
  FUNNEL: 'funnel',
  LINE: 'line',
  VERTICAL_LINE: 'verticalLine',
  MARKER: 'marker',
  PIE: 'pie',
  PIE_3D: 'pie3d',
  POLAR: 'polar',
  PYRAMID: 'pyramid',
  RADAR: 'radar',
  SCATTER: 'scatter',
  SPARKLINE: 'sparkline',
  HEAT_MAP: 'heatMap',
  TREE_MAP: 'treeMap',
  STOCK: 'stock',
  PERT: 'pert',
  GANTT_RESOURCE: 'ganttResource',
  GANTT_PROJECT: 'ganttProject',
  RESOURCE: 'resource',
  JUMP_LINE: 'jumpLine',
  STICK: 'stick',
  PARETO: 'pareto'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gauge types enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gauge types.
 * @enum {string}
 */
anychart.enums.GaugeTypes = {
  CIRCULAR: 'circular',
  LINEAR: 'linearGauge',
  BULLET: 'bullet',
  THERMOMETER: 'thermometerGauge',
  TANK: 'tankGauge',
  LED: 'ledGauge'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Maps types enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Map types.
 * @enum {string}
 */
anychart.enums.MapTypes = {
  MAP: 'map',
  CHOROPLETH: 'choropleth',
  BUBBLE: 'bubble',
  MARKER: 'marker',
  CONNECTOR: 'connector',
  SEAT_MAP: 'seatMap'
};


/**
 * Map geo data types.
 * @enum {string}
 */
anychart.enums.MapGeoDataTypes = {
  SVG: 'svg',
  TOPO_JSON: 'topojson',
  GEO_JSON: 'geojson'
};


/**
 * Map unbounding regions mode.
 * @enum {string}
 */
anychart.enums.MapUnboundRegionsMode = {
  AS_IS: 'asis',
  HIDE: 'hide'
};


/**
 * Normalizes value to MapUnboundRegionsMode enum.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.MapUnboundRegionsMode=} opt_default Default value, if input cannot be recognized. Defaults to HIDE.
 * @return {anychart.enums.MapUnboundRegionsMode}
 */
anychart.enums.normalizeMapUnboundRegionsMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'asis':
    case 'as-is':
    case 'as is':
    case 'true':
    case '1':
      return anychart.enums.MapUnboundRegionsMode.AS_IS;
    case 'hide':
    case 'none':
    case 'null':
    case 'false':
    case '0':
      return anychart.enums.MapUnboundRegionsMode.HIDE;
  }
  return opt_default || anychart.enums.MapUnboundRegionsMode.HIDE;
};


/**
 * Hover mode enumeration.
 * @enum {string}
 */
anychart.enums.HoverMode = {
  BY_SPOT: 'bySpot',
  BY_X: 'byX',
  SINGLE: 'single'
};


/**
 * Normalizes value to HoverMode enum.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.HoverMode=} opt_default Default value, if input cannot be recognized. Defaults to BY_X.
 * @return {anychart.enums.HoverMode}
 */
anychart.enums.normalizeHoverMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'byspot':
    case 'spot':
    case 'sp':
      return anychart.enums.HoverMode.BY_SPOT;
    case 'byx':
    case 'x':
      return anychart.enums.HoverMode.BY_X;
    case 'single':
    case 's':
      return anychart.enums.HoverMode.SINGLE;
  }
  return opt_default || anychart.enums.HoverMode.BY_X;
};


/**
 * Select mode enumeration.
 * @enum {string}
 */
anychart.enums.SelectionMode = {
  NONE: 'none',
  SINGLE_SELECT: 'singleSelect',
  MULTI_SELECT: 'multiSelect',
  DRILL_DOWN: 'drillDown'
};


/**
 * Normalizes value to SelectionMode enum.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.SelectionMode=} opt_default Default value, if input cannot be recognized. Defaults to NONE.
 * @return {anychart.enums.SelectionMode}
 */
anychart.enums.normalizeSelectMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'none':
    case 'null':
    case 'false':
    case 'n':
    case 'no':
      return anychart.enums.SelectionMode.NONE;
    case 'singleselect':
    case 'single':
    case 'single_select':
    case 's':
    case 'ss':
      return anychart.enums.SelectionMode.SINGLE_SELECT;
    case 'multiselect':
    case 'multi_select':
    case 'multi':
    case 'm':
    case 'ms':
      return anychart.enums.SelectionMode.MULTI_SELECT;
    case 'drill':
    case 'drilldown':
    case 'drill_down':
    case 'd':
      return anychart.enums.SelectionMode.DRILL_DOWN;
  }
  return opt_default || anychart.enums.SelectionMode.NONE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Cursor
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Cursor enum. Defines 15 items.
 * @enum {string}
 */
anychart.enums.Cursor = {
  /** <span style="cursor:default">Default type</span> */
  DEFAULT: 'default',

  /** <span style="cursor:crosshair">Crosshair type</span> */
  CROSSHAIR: 'crosshair',

  /** <span style="cursor:pointer">Pointer type</span> */
  POINTER: 'pointer',

  /** <span style="cursor:move">Move type</span> */
  MOVE: 'move',

  /** <span style="cursor:text">Text type</span> */
  TEXT: 'text',

  /** <span style="cursor:wait">Wait type</span> */
  WAIT: 'wait',

  /** <span style="cursor:help">Help type</span> */
  HELP: 'help',

  /** <span style="cursor:n-resize">N-resize type</span> */
  N_RESIZE: 'n-resize',

  /** <span style="cursor:ne-resize">NE-resize type</span> */
  NE_RESIZE: 'ne-resize',

  /** <span style="cursor:e-resize">E-resize type</span> */
  E_RESIZE: 'e-resize',

  /** <span style="cursor:se-resize">SE-resize type</span> */
  SE_RESIZE: 'se-resize',

  /** <span style="cursor:s-resize">S-resize type</span> */
  S_RESIZE: 's-resize',

  /** <span style="cursor:sw-resize">SW-resize type</span> */
  SW_RESIZE: 'sw-resize',

  /** <span style="cursor:w-resize">W-resize type</span> */
  W_RESIZE: 'w-resize',

  /** <span style="cursor:nw-resize">NW-resize type</span> */
  NW_RESIZE: 'nw-resize',

  /** <span style="cursor:ns-resize">NS-resize type</span> */
  NS_RESIZE: 'ns-resize',

  /** <span style="cursor:ew-resize">EW-resize type</span> */
  EW_RESIZE: 'ew-resize',

  /** <span style="cursor:nwse-resize">NWSE-resize type</span> */
  NWSE_RESIZE: 'nwse-resize',

  /** <span style="cursor:nesw-resize">NESW-resize type</span> */
  NESW_RESIZE: 'nesw-resize'
};


/**
 * Normalizes value to Cursor enum.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.Cursor=} opt_default Default value, if input cannot be recognized. Defaults to DEFAULT.
 * @return {anychart.enums.Cursor}
 */
anychart.enums.normalizeCursor = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'default':
    case 'def':
    case 'd':
      return anychart.enums.Cursor.DEFAULT;
    case 'crosshair':
    case 'cross':
      return anychart.enums.Cursor.CROSSHAIR;
    case 'pointer':
    case 'point':
      return anychart.enums.Cursor.POINTER;
    case 'move':
      return anychart.enums.Cursor.MOVE;
    case 'text':
      return anychart.enums.Cursor.TEXT;
    case 'wait':
      return anychart.enums.Cursor.WAIT;
    case 'help':
      return anychart.enums.Cursor.HELP;
    case 'n-resize':
    case 'north':
    case 'n':
      return anychart.enums.Cursor.N_RESIZE;
    case 'ne-resize':
    case 'northeast':
    case 'ne':
      return anychart.enums.Cursor.NE_RESIZE;
    case 'e-resize':
    case 'east':
    case 'e':
      return anychart.enums.Cursor.E_RESIZE;
    case 'se-resize':
    case 'southeast':
    case 'se':
      return anychart.enums.Cursor.SE_RESIZE;
    case 's-resize':
    case 'south':
    case 's':
      return anychart.enums.Cursor.S_RESIZE;
    case 'sw-resize':
    case 'southwest':
    case 'sw':
      return anychart.enums.Cursor.SW_RESIZE;
    case 'w-resize':
    case 'west':
    case 'w':
      return anychart.enums.Cursor.W_RESIZE;
    case 'nw-resize':
    case 'northwest':
    case 'nw':
      return anychart.enums.Cursor.NW_RESIZE;
  }
  return opt_default || anychart.enums.Cursor.DEFAULT;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Anchor
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Anchor enum. Defines 9 items.
 * @illustration <t>simple</t>
 * var orange = '1 orange 1';
 * var star = stage.star5(stage.width()/2, stage.height()/3, stage.height()/4).fill('yellow', 0.5);
 * var pathBounds = star.getBounds();
 * stage.path().fill('none').stroke(orange)
 *     .moveTo(pathBounds.left, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
 *     .close();
 * stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
 * stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height/2 - 8, 'LEFT_CENTER');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left  + pathBounds.width/2 - 10, pathBounds.top - 18, 'CENTER_TOP');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 20, pathBounds.top + pathBounds.height/2 - 15, 'CENTER');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 23, pathBounds.top + pathBounds.height+ 2, 'CENTER_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5 , pathBounds.top + pathBounds.height/2 - 8, 'RIGHT_CENTER');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
 * @enum {string}
 */
anychart.enums.Anchor = {
  /** The left-top anchor of the element. */
  LEFT_TOP: 'leftTop',

  /** The left-center anchor of the element. */
  LEFT_CENTER: 'leftCenter',

  /** The left-bottom anchor of the element. */
  LEFT_BOTTOM: 'leftBottom',

  /** The center-top anchor of the element. */
  CENTER_TOP: 'centerTop',

  /** The center anchor of the element. */
  CENTER: 'center',

  /** The center-bottom anchor of the element. */
  CENTER_BOTTOM: 'centerBottom',

  /** The right-top anchor of the element. */
  RIGHT_TOP: 'rightTop',

  /** The right-center anchor of the element.*/
  RIGHT_CENTER: 'rightCenter',

  /** The right-bottom anchor of the element. */
  RIGHT_BOTTOM: 'rightBottom',

  /** Auto anchor of the element. Flips anchor depends on position. */
  AUTO: 'auto'
};


/**
 * Normalizes anchor to an anychart.enums.Anchor instance.
 * @param {*} value Input to normalize.
 * @param {T=} opt_default Default value, if input cannot be recognized. Defaults to LEFT_TOP.
 * @return {anychart.enums.Anchor|T}
 * @template T
 */
anychart.enums.normalizeAnchor = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'lefttop':
    case 'topleft':
    case 'lt':
    case 'tl':
      return anychart.enums.Anchor.LEFT_TOP;
    case 'leftcenter':
    case 'centerleft':
    case 'left':
    case 'lc':
    case 'cl':
    case 'l':
      return anychart.enums.Anchor.LEFT_CENTER;
    case 'leftbottom':
    case 'bottomleft':
    case 'lb':
    case 'bl':
      return anychart.enums.Anchor.LEFT_BOTTOM;
    case 'centertop':
    case 'topcenter':
    case 'top':
    case 'ct':
    case 'tc':
    case 't':
      return anychart.enums.Anchor.CENTER_TOP;
    case 'centercenter':
    case 'center':
    case 'c':
      return anychart.enums.Anchor.CENTER;
    case 'centerbottom':
    case 'bottomcenter':
    case 'bottom':
    case 'cb':
    case 'bc':
    case 'b':
      return anychart.enums.Anchor.CENTER_BOTTOM;
    case 'righttop':
    case 'topright':
    case 'tr':
    case 'rt':
      return anychart.enums.Anchor.RIGHT_TOP;
    case 'rightcenter':
    case 'centerright':
    case 'right':
    case 'rc':
    case 'cr':
    case 'r':
      return anychart.enums.Anchor.RIGHT_CENTER;
    case 'rightbottom':
    case 'bottomright':
    case 'rb':
    case 'br':
      return anychart.enums.Anchor.RIGHT_BOTTOM;
    case 'auto':
      return anychart.enums.Anchor.AUTO;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.enums.Anchor.LEFT_TOP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Position enum. Defines 9 items. Similar to Anchor. Distinct by meaning.
 * @illustration <t>simple</t>
 * var orange = '1 orange 1';
 * var star = stage.star5(stage.width()/2, stage.height()/3, stage.height()/4).fill('yellow', 0.5);
 * var pathBounds = star.getBounds();
 * stage.path().fill('none').stroke(orange)
 *     .moveTo(pathBounds.left, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
 *     .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
 *     .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
 *     .close();
 * stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
 * stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height/2 - 8, 'LEFT_CENTER');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
 * stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left  + pathBounds.width/2 - 10, pathBounds.top - 18, 'CENTER_TOP');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 20, pathBounds.top + pathBounds.height/2 - 15, 'CENTER');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width/2 - 23, pathBounds.top + pathBounds.height+ 2, 'CENTER_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width/2, pathBounds.top + pathBounds.height, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5 , pathBounds.top + pathBounds.height/2 - 8, 'RIGHT_CENTER');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height/2, 3).fill('blue');
 * stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
 * stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
 * @enum {string}
 */
anychart.enums.Position = {
  /** The left-top position of the element. */
  LEFT_TOP: 'leftTop',

  /** The left-center position of the element. */
  LEFT_CENTER: 'leftCenter',

  /** The left-bottom position of the element. */
  LEFT_BOTTOM: 'leftBottom',

  /** The center-top position of the element. */
  CENTER_TOP: 'centerTop',

  /** The center position of the element. */
  CENTER: 'center',

  /** The center-bottom position of the element. */
  CENTER_BOTTOM: 'centerBottom',

  /** The right-top position of the element. */
  RIGHT_TOP: 'rightTop',

  /** The right-center position of the element.*/
  RIGHT_CENTER: 'rightCenter',

  /** The right-bottom position of the element. */
  RIGHT_BOTTOM: 'rightBottom'
};


/**
 * Normalizes position to an anychart.enums.Position instance.
 * @param {*} value Input to normalize.
 * @param {T=} opt_default Default value, if input cannot be recognized. Defaults to LEFT_TOP.
 * @return {anychart.enums.Position|T}
 * @template T
 */
anychart.enums.normalizePosition = function(value, opt_default) {
  value = /** @type {anychart.enums.Position} */ (anychart.enums.normalizeAnchor(value, opt_default));
  return (value == anychart.enums.Anchor.AUTO && goog.isDef(opt_default)) ? opt_default : value;
};


/**
 * ChartScroller possible positions.
 * @enum {string}
 */
anychart.enums.ChartScrollerPosition = {
  BEFORE_AXES: 'beforeAxes',
  AFTER_AXES: 'afterAxes'
};


/**
 * Normalizes chart scroller position value.
 * @param {*} value
 * @param {anychart.enums.ChartScrollerPosition=} opt_default Defaults to AFTER_AXES.
 * @return {anychart.enums.ChartScrollerPosition}
 */
anychart.enums.normalizeChartScrollerPosition = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'beforeaxes':
    case 'before':
    case 'ba':
    case 'b':
    case 'inside':
    case 'in':
    case 'i':
      return anychart.enums.ChartScrollerPosition.BEFORE_AXES;
    case 'afteraxes':
    case 'after':
    case 'aa':
    case 'a':
    case 'outside':
    case 'out':
    case 'o':
      return anychart.enums.ChartScrollerPosition.AFTER_AXES;
  }
  return opt_default || anychart.enums.ChartScrollerPosition.AFTER_AXES;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Align.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Align enumeration.
 * @enum {string}
 */
anychart.enums.Align = {
  /**
   * Center align.
   */
  CENTER: 'center',
  /**
   * Left align.
   */
  LEFT: 'left',
  /**
   * Right align.
   */
  RIGHT: 'right',
  /**
   * Top align.
   */
  TOP: 'top',
  /**
   * Bottom align.
   */
  BOTTOM: 'bottom'
};


/**
 * Normalizes user input align to its enumeration values. Also accepts 'middle'. Defaults to opt_default or
 * 'center'.
 *
 * @param {*} value Align to normalize.
 * @param {anychart.enums.Align=} opt_default Align to normalize.
 * @return {anychart.enums.Align} Normalized align.
 */
anychart.enums.normalizeAlign = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'left':
      return anychart.enums.Align.LEFT;
    case 'right':
      return anychart.enums.Align.RIGHT;
    case 'center':
    case 'middle':
      return anychart.enums.Align.CENTER;
    case 'top':
      return anychart.enums.Align.TOP;
    case 'bottom':
      return anychart.enums.Align.BOTTOM;
  }
  return opt_default || anychart.enums.Align.CENTER;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Layout.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Layout enumeration.
 * @enum {string}
 */
anychart.enums.Layout = {
  /**
   * Vertical layout.
   */
  VERTICAL: 'vertical',
  /**
   * Horizontal layout.
   */
  HORIZONTAL: 'horizontal'
};


/**
 * Normalizes user input layout to its enumeration values. Also accepts null. Defaults to opt_default or 'vertical'.
 *
 * @param {*} value - Layout to normalize.
 * @param {anychart.enums.Layout=} opt_default Orientation to normalize.
 * @return {anychart.enums.Layout} Normalized orientation.
 */
anychart.enums.normalizeLayout = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'vertical':
    case 'v':
    case 'vert':
      return anychart.enums.Layout.VERTICAL;
    case 'horizontal':
    case 'h':
    case 'horz':
    case 'horiz':
      return anychart.enums.Layout.HORIZONTAL;
  }
  return opt_default || anychart.enums.Layout.VERTICAL;
};


/**
 * Legend layout enumeration.
 * @enum {string}
 */
anychart.enums.LegendLayout = {
  /**
   * Vertical layout.
   */
  VERTICAL: 'vertical',
  /**
   * Horizontal layout.
   */
  HORIZONTAL: 'horizontal',
  /**
   * Places legend items one by one in vertical columns.
   */
  VERTICAL_EXPANDABLE: 'verticalexpandable',
  /**
   * Places legend items one by one in horizontal rows.
   */
  HORIZONTAL_EXPANDABLE: 'horizontalexpandable'
};


/**
 * Normalizes user input legend layout to its enumeration values. Also accepts null. Defaults to opt_default or 'vertical'.
 *
 * @param {*} value - Layout to normalize.
 * @param {anychart.enums.LegendLayout=} opt_default Orientation to normalize.
 * @return {anychart.enums.LegendLayout} Normalized orientation.
 */
anychart.enums.normalizeLegendLayout = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'vertical':
    case 'v':
    case 'vert':
      return anychart.enums.LegendLayout.VERTICAL;
    case 'horizontal':
    case 'h':
    case 'horz':
    case 'horiz':
      return anychart.enums.LegendLayout.HORIZONTAL;
    case 'verticalexpandable':
    case 'vexpandable':
    case 'evertical':
    case 've':
    case 'vertical_expandable':
      return anychart.enums.LegendLayout.VERTICAL_EXPANDABLE;
    case 'horizontalexpandable':
    case 'expandable':
    case 'hexpandable':
    case 'ehorizontal':
    case 'he':
    case 'horizontal_expandable':
      return anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE;
  }
  return opt_default || anychart.enums.LegendLayout.VERTICAL;
};


/**
 * Polar layout enumeration.
 * @enum {string}
 */
anychart.enums.RadialGridLayout = {
  /**
   * Radial layout.
   */
  RADIAL: 'radial',
  /**
   * Angle layout.
   */
  CIRCUIT: 'circuit'
};


/**
 * Normalizes user input layout to its enumeration values. Also accepts null. Defaults to opt_default or 'radial'.
 *
 * @param {*} value - Layout to normalize.
 * @param {anychart.enums.RadialGridLayout=} opt_default Orientation to normalize.
 * @return {anychart.enums.RadialGridLayout} Normalized orientation.
 */
anychart.enums.normalizePolarLayout = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'radial':
    case 'r':
    case 'rad':
      return anychart.enums.RadialGridLayout.RADIAL;
    case 'circuit':
    case 'c':
    case 'cir':
      return anychart.enums.RadialGridLayout.CIRCUIT;
  }
  return opt_default || anychart.enums.RadialGridLayout.RADIAL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Orientation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Orientation enumeration.
 * @enum {string}
 */
anychart.enums.Orientation = {
  /**
   * Left orientation.
   */
  LEFT: 'left',
  /**
   * Right orientation.
   */
  RIGHT: 'right',
  /**
   * Top orientation.
   */
  TOP: 'top',
  /**
   * Bottom orientation.
   */
  BOTTOM: 'bottom'
};


/**
 * Normalizes user input orientation to its enumeration values. Also accepts null. Defaults to opt_default or 'top'.
 *
 * @param {*} value Orientation to normalize.
 * @param {anychart.enums.Orientation=} opt_default Orientation to normalize.
 * @return {anychart.enums.Orientation} Normalized orientation.
 */
anychart.enums.normalizeOrientation = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'centertop':
    case 'topcenter':
    case 'top':
    case 't':
    case 'up':
    case 'u':
      return anychart.enums.Orientation.TOP;
    case 'rightcenter':
    case 'centerright':
    case 'right':
    case 'r':
      return anychart.enums.Orientation.RIGHT;
    case 'bottomcenter':
    case 'centerbottom':
    case 'bottom':
    case 'b':
    case 'down':
    case 'd':
      return anychart.enums.Orientation.BOTTOM;
    case 'leftcenter':
    case 'centerleft':
    case 'left':
    case 'l':
      return anychart.enums.Orientation.LEFT;
  }
  return opt_default || anychart.enums.Orientation.TOP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position mode.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Position mode enumeration.
 * @enum {string}
 */
anychart.enums.LegendPositionMode = {
  /**
   * Left orientation.
   */
  INSIDE: 'inside',
  /**
   * Right orientation.
   */
  OUTSIDE: 'outside'
};


/**
 * Normalizes user input position mode to its enumeration values. Also accepts null. Defaults to opt_default or 'outside'.
 *
 * @param {*} value Position mode to normalize.
 * @param {anychart.enums.LegendPositionMode=} opt_default Position mode to normalize.
 * @return {anychart.enums.LegendPositionMode} Normalized position mode.
 */
anychart.enums.normalizeLegendPositionMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'inside':
      return anychart.enums.LegendPositionMode.INSIDE;
    case 'outside':
      return anychart.enums.LegendPositionMode.OUTSIDE;
  }
  return opt_default || anychart.enums.LegendPositionMode.OUTSIDE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sort.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sort enumeration.
 * @enum {string}
 */
anychart.enums.Sort = {
  /**
   * Ascending sorting.
   */
  ASC: 'asc',
  /**
   * Descending sorting.
   */
  DESC: 'desc',
  /**
   * No sorting.
   */
  NONE: 'none'
};


/**
 * Normalizes user input sorting to its enumeration values. Also accepts null. Defaults to opt_default or 'none'.
 *
 * @param {*} value Sort to normalize.
 * @param {anychart.enums.Sort=} opt_default Default value.
 * @return {anychart.enums.Sort} Normalized sort.
 */
anychart.enums.normalizeSort = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'asc':
    case 'a':
    case 'forward':
    case 'f':
    case 'straight':
    case 's':
    case 'yes':
    case 'y':
      return anychart.enums.Sort.ASC;
    case 'desc':
    case 'd':
    case 'backward':
    case 'b':
    case 'reversed':
    case 'reverse':
    case 'r':
      return anychart.enums.Sort.DESC;
    case 'none':
    case 'null':
    case 'no':
    case 'nosort':
      return anychart.enums.Sort.NONE;
  }
  return opt_default || anychart.enums.Sort.NONE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  MarkerType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Markers type.
 * @enum {string}
 */
anychart.enums.MarkerType = {
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .circle(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  CIRCLE: 'circle',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30);
   * var side = stage.height()/2-5;
   * stage.path()
   *        .moveTo(stage.width()/2 - side, stage.height()/2 - side)
   *        .lineTo(stage.width()/2 + side, stage.height()/2 - side)
   *        .lineTo(stage.width()/2 + side, stage.height()/2 + side)
   *        .lineTo(stage.width()/2 - side, stage.height()/2 + side)
   *        .close()
   */
  SQUARE: 'square',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .triangleUp(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  TRIANGLE_UP: 'triangleUp',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .diamond(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  DIAMOND: 'diamond',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .triangleDown(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  TRIANGLE_DOWN: 'triangleDown',
  TRIANGLE_RIGHT: 'triangleRight',
  TRIANGLE_LEFT: 'triangleLeft',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .cross(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  CROSS: 'cross',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .diagonalCross(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  DIAGONAL_CROSS: 'diagonalCross',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star4(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR4: 'star4',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star5(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR5: 'star5',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star6(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR6: 'star6',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star7(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR7: 'star7',
  /**
   * @illustration
   * stage.width(200)
   *      .height(30)
   *      .star10(stage.width()/2, stage.height()/2, stage.height()/2-5);
   */
  STAR10: 'star10',
  PENTAGON: 'pentagon',
  TRAPEZIUM: 'trapezium',
  LINE: 'line',
  V_LINE: 'vline',
  ARROWHEAD: 'arrowhead',
  ARROW_UP: 'arrowUp',
  ARROW_RIGHT: 'arrowRight',
  ARROW_DOWN: 'arrowDown',
  ARROW_LEFT: 'arrowLeft'
};


/**
 * Method to get marker drawer.
 * @param {*} type Marker type.
 * @param {anychart.enums.MarkerType=} opt_default Default marker type. Defaults to anychart.enums.MarkerType.STAR5.
 * @return {anychart.enums.MarkerType} Normalized marker type.
 */
anychart.enums.normalizeMarkerType = function(type, opt_default) {
  type = (String(type)).toLowerCase();
  switch (type) {
    case 'line':
      return anychart.enums.MarkerType.LINE;
    case 'vline':
      return anychart.enums.MarkerType.V_LINE;
    case 'star4':
      return anychart.enums.MarkerType.STAR4;
    case 'star5':
      return anychart.enums.MarkerType.STAR5;
    case 'star6':
      return anychart.enums.MarkerType.STAR6;
    case 'star7':
      return anychart.enums.MarkerType.STAR7;
    case 'star10':
      return anychart.enums.MarkerType.STAR10;
    case 'diamond':
      return anychart.enums.MarkerType.DIAMOND;
    case 'triangleup':
      return anychart.enums.MarkerType.TRIANGLE_UP;
    case 'triangledown':
      return anychart.enums.MarkerType.TRIANGLE_DOWN;
    case 'triangleleft':
      return anychart.enums.MarkerType.TRIANGLE_LEFT;
    case 'triangleright':
      return anychart.enums.MarkerType.TRIANGLE_RIGHT;
    case 'cross':
      return anychart.enums.MarkerType.CROSS;
    case 'diagonalcross':
      return anychart.enums.MarkerType.DIAGONAL_CROSS;
    case 'circle':
      return anychart.enums.MarkerType.CIRCLE;
    case 'square':
      return anychart.enums.MarkerType.SQUARE;
    case 'trapezoid':
    case 'trapezium':
      return anychart.enums.MarkerType.TRAPEZIUM;
    case 'pentagon':
      return anychart.enums.MarkerType.PENTAGON;
    case 'arrow':
    case 'arrowhead':
      return anychart.enums.MarkerType.ARROWHEAD;
    case 'arrowup':
    case 'up':
      return anychart.enums.MarkerType.ARROW_UP;
    case 'arrowdown':
    case 'down':
      return anychart.enums.MarkerType.ARROW_DOWN;
    case 'arrowright':
    case 'right':
      return anychart.enums.MarkerType.ARROW_RIGHT;
    case 'arrowleft':
    case 'left':
      return anychart.enums.MarkerType.ARROW_LEFT;
  }
  return opt_default || anychart.enums.MarkerType.STAR5;
};


/**
 * Method to get marker drawer.
 * @param {*} type Marker type.
 * @return {anychart.enums.MarkerType|anychart.enums.BulletMarkerType|null} Normalized marker type.
 */
anychart.enums.normalizeAnyMarkerType = function(type) {
  type = (String(type)).toLowerCase();
  switch (type) {
    case 'star4':
      return anychart.enums.MarkerType.STAR4;
    case 'star5':
      return anychart.enums.MarkerType.STAR5;
    case 'star6':
      return anychart.enums.MarkerType.STAR6;
    case 'star7':
      return anychart.enums.MarkerType.STAR7;
    case 'star10':
      return anychart.enums.MarkerType.STAR10;
    case 'diamond':
      return anychart.enums.MarkerType.DIAMOND;
    case 'triangleup':
      return anychart.enums.MarkerType.TRIANGLE_UP;
    case 'triangledown':
      return anychart.enums.MarkerType.TRIANGLE_DOWN;
    case 'triangleleft':
      return anychart.enums.MarkerType.TRIANGLE_LEFT;
    case 'triangleright':
      return anychart.enums.MarkerType.TRIANGLE_RIGHT;
    case 'cross':
      return anychart.enums.MarkerType.CROSS;
    case 'diagonalcross':
      return anychart.enums.MarkerType.DIAGONAL_CROSS;
    case 'circle':
      return anychart.enums.MarkerType.CIRCLE;
    case 'square':
      return anychart.enums.MarkerType.SQUARE;
    case 'x':
      return anychart.enums.BulletMarkerType.X;
    case 'line':
      return anychart.enums.BulletMarkerType.LINE;
    case 'ellipse':
      return anychart.enums.BulletMarkerType.ELLIPSE;
    case 'bar':
      return anychart.enums.BulletMarkerType.BAR;
    case 'trapezoid':
    case 'trapezium':
      return anychart.enums.MarkerType.TRAPEZIUM;
    case 'pentagon':
      return anychart.enums.MarkerType.PENTAGON;
    case 'arrow':
    case 'arrowhead':
      return anychart.enums.MarkerType.ARROWHEAD;
    case 'vline':
      return anychart.enums.MarkerType.V_LINE;
    case 'arrowup':
    case 'up':
      return anychart.enums.MarkerType.ARROW_UP;
    case 'arrowdown':
    case 'down':
      return anychart.enums.MarkerType.ARROW_DOWN;
    case 'arrowright':
    case 'right':
      return anychart.enums.MarkerType.ARROW_RIGHT;
    case 'arrowleft':
    case 'left':
      return anychart.enums.MarkerType.ARROW_LEFT;
  }
  return null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  MapAsTableMode
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Modes enum for anychart.data.mapAsTable() function.
 * @enum {string}
 */
anychart.enums.MapAsTableMode = {
  /**
   * Single values.<br/>
   * Means, that each series is represented by one column in the table + shared X column (own Y values).
   */
  VALUE: 'value',
  /**
   * High-Low values.<br/>
   * Means, that each series is represented by two columns per series + shared X.
   */
  RANGE: 'range',
  /**
   * Open-High-Low-Close values.<br/>
   * Means, that each series is represented by four columns per series + shared X.
   */
  OHLC: 'ohlc'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  TreeFillMethod
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Data fill method.
 * @enum {string}
 */
anychart.enums.TreeFillingMethod = {
  /**
   * Using this method means that the original data will be treated as an array of objects with a hierarchical tree
   * structure.
   *
   * Sample:
   * [code]
   *  var rawData = [
   *    {
   *      _Object_,
   *      children: [ ... ]
   *    },
   *
   *    ...,
   *
   *    {
   *      _Object_,
   *      children: [
   *        {
   *          _Object_,
   *          children: [ ... ]
   *        },
   *        ...
   *      ]
   *    }
   *  ];
   * [/code]
   */
  AS_TREE: 'asTree',

  /**
   * Using this method means that the original data will be treated as a linear array of objects each of which
   * can be given its own ID and the ID of the parent.
   *
   * Sample:
   * [code]
   *  var rawData = [
   *    {
   *      id: _opt_value_,
   *      parent: _opt_value_,
   *      someData: _some_data_
   *    },
   *
   *    ...,
   *
   *    {
   *      id: _opt_value_,
   *      parent: _opt_value_,
   *      someData: _some_data_
   *    }
   *  ];
   * [/code]
   */
  AS_TABLE: 'asTable'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  LabelsOverlapMode
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Overlap mods.
 * @enum {string}
 */
anychart.enums.LabelsOverlapMode = {
  /**
   * Forbids labels overlapping.
   */
  NO_OVERLAP: 'noOverlap',
  /**
   * Allows labels to overlap.
   */
  ALLOW_OVERLAP: 'allowOverlap'
};


/**
 * Normalizes labels overlap mode to enum values.
 * @param {*} value Mode to normalize.
 * @param {anychart.enums.LabelsOverlapMode=} opt_default Default value. Defaults to ALLOW_OVERLAP.
 * @return {anychart.enums.LabelsOverlapMode}
 */
anychart.enums.normalizeLabelsOverlapMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'no':
    case 'false':
    case 'nooverlap':
    case 'none':
    case 'null':
    case 'forbid':
    case '0':
      return anychart.enums.LabelsOverlapMode.NO_OVERLAP;
    case 'yes':
    case 'allow':
    case 'overlap':
    case 'allowoverlap':
    case 'true':
    case '1':
      return anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;
  }
  return opt_default || anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;
};


/**
 * Overlap mods.
 * @enum {string}
 */
anychart.enums.StockLabelsOverlapMode = {
  /**
   * Forbids labels overlapping.
   */
  NO_OVERLAP: 'noOverlap',
  /**
   * Minor labels can overlap other minor labels, but major labels cannot overlap.
   */
  ALLOW_MINOR_OVERLAP: 'allowMinorOverlap',
  /**
   * Minor labels cannot overlap other minor or major labels, but major labels can overlap major labels.
   */
  ALLOW_MAJOR_OVERLAP: 'allowMajorOverlap',
  /**
   * Allows labels to overlap.
   */
  ALLOW_OVERLAP: 'allowOverlap'
};


/**
 * Normalizes labels overlap mode to enum values.
 * @param {*} value Mode to normalize.
 * @param {anychart.enums.StockLabelsOverlapMode=} opt_default Default value. Defaults to ALLOW_OVERLAP.
 * @return {anychart.enums.StockLabelsOverlapMode}
 */
anychart.enums.normalizeStockLabelsOverlapMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'no':
    case 'false':
    case 'nooverlap':
    case 'none':
    case 'null':
    case 'forbid':
    case '0':
      return anychart.enums.StockLabelsOverlapMode.NO_OVERLAP;
    case 'min':
    case 'minor':
    case 'nomajor':
    case 'notmajor':
    case 'forbidmajor':
    case 'allowminor':
    case 'allowminoroverlap':
      return anychart.enums.StockLabelsOverlapMode.ALLOW_MINOR_OVERLAP;
    case 'maj':
    case 'major':
    case 'nominor':
    case 'notminor':
    case 'forbidminor':
    case 'allowmajor':
    case 'allowmajoroverlap':
      return anychart.enums.StockLabelsOverlapMode.ALLOW_MAJOR_OVERLAP;
    case 'yes':
    case 'allow':
    case 'overlap':
    case 'allowoverlap':
    case 'true':
    case '1':
      return anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP;
  }
  return opt_default || anychart.enums.StockLabelsOverlapMode.NO_OVERLAP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  BackgroundCornersType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Types of the corner.
 * @enum {string}
 */
anychart.enums.BackgroundCornersType = {
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Square corners').fontSize(12);
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(5, 10)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   * stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  NONE: 'none',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, true)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND: 'round',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Cut corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .lineTo(20, 10)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  CUT: 'cut',
  /**
   * @illustration
   * stage.width(200).height(30);
   * stage.text(35, 10, 'Round-inner corners')
   * stage.path()
   *   .moveTo(5, 25)
   *   .arcToByEndPoint(20, 10, 15, 15, false, false)
   *   .stroke('3 #F00')
   *  stage.path()
   *   .moveTo(5,30)
   *   .lineTo(5,25)
   *   .moveTo(20, 10)
   *   .lineTo(25, 10)
   *   .stroke('3 #666')
   */
  ROUND_INNER: 'roundInner'
};


/**
 * Normalizes background corner type.
 * @param {*} value Value to normalize.
 * @param {anychart.enums.BackgroundCornersType=} opt_default Custom default value (defaults to DEFAULT).
 * @return {anychart.enums.BackgroundCornersType} normalized value.
 */
anychart.enums.normalizeBackgroundCornerType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'none':
      return anychart.enums.BackgroundCornersType.NONE;
    case 'round':
      return anychart.enums.BackgroundCornersType.ROUND;
    case 'cut':
      return anychart.enums.BackgroundCornersType.CUT;
    case 'roundinner':
      return anychart.enums.BackgroundCornersType.ROUND_INNER;
  }
  return opt_default || anychart.enums.BackgroundCornersType.NONE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  LegendItemIconType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Predefined icons type.
 * @enum {string}
 */
anychart.enums.LegendItemIconType = {
  // icons by series type
  AREA: 'area',
  BAR: 'bar',
  BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  OHLC: 'ohlc',
  RANGE_AREA: 'rangearea',
  RANGE_BAR: 'rangebar',
  RANGE_COLUMN: 'rangecolumn',
  RANGE_SPLINE_AREA: 'rangesplinearea',
  RANGE_STEP_AREA: 'rangesteparea',
  SPLINE: 'spline',
  SPLINE_AREA: 'splinearea',
  STEP_LINE: 'stepline',
  STEP_AREA: 'steparea',
  CIRCLE: 'circle',
  SQUARE: 'square',

  // icons by marker type
  TRIANGLE_UP: 'triangleup',
  TRIANGLE_DOWN: 'triangledown',
  DIAMOND: 'diamond',
  CROSS: 'cross',
  DIAGONAL_CROSS: 'diagonalcross',
  STAR4: 'star4',
  STAR5: 'star5',
  STAR6: 'star6',
  STAR7: 'star7',
  STAR10: 'star10',
  PENTAGON: 'pentagon',
  TRAPEZIUM: 'trapezium',
  ARROWHEAD: 'arrowhead',
  V_LINE: 'vline',
  // special icon types
  MARKER: 'marker',
  RISING_FALLING: 'risingfalling'
};


/**
 * Normalizes legend item icon type.
 * @param {*} value Value to normalize.
 * @param {anychart.enums.LegendItemIconType=} opt_default Custom default value (defaults to DEFAULT).
 * @return {anychart.enums.LegendItemIconType} normalized value.
 */
anychart.enums.normalizeLegendItemIconType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.LegendItemIconType.AREA;
    case 'bar':
      return anychart.enums.LegendItemIconType.BAR;
    case 'bubble':
      return anychart.enums.LegendItemIconType.BUBBLE;
    case 'candlestick':
      return anychart.enums.LegendItemIconType.CANDLESTICK;
    case 'column':
      return anychart.enums.LegendItemIconType.COLUMN;
    case 'line':
      return anychart.enums.LegendItemIconType.LINE;
    case 'marker':
      return anychart.enums.LegendItemIconType.MARKER;
    case 'ohlc':
      return anychart.enums.LegendItemIconType.OHLC;
    case 'rangearea':
      return anychart.enums.LegendItemIconType.RANGE_AREA;
    case 'rangebar':
      return anychart.enums.LegendItemIconType.RANGE_BAR;
    case 'rangecolumn':
      return anychart.enums.LegendItemIconType.RANGE_COLUMN;
    case 'rangesplinearea':
      return anychart.enums.LegendItemIconType.RANGE_SPLINE_AREA;
    case 'rangesteparea':
      return anychart.enums.LegendItemIconType.RANGE_STEP_AREA;
    case 'spline':
      return anychart.enums.LegendItemIconType.SPLINE;
    case 'splinearea':
      return anychart.enums.LegendItemIconType.SPLINE_AREA;
    case 'stepline':
      return anychart.enums.LegendItemIconType.STEP_LINE;
    case 'steparea':
      return anychart.enums.LegendItemIconType.STEP_AREA;
    case 'circle':
      return anychart.enums.LegendItemIconType.CIRCLE;
    case 'square':
      return anychart.enums.LegendItemIconType.SQUARE;
    case 'star4':
      return anychart.enums.LegendItemIconType.STAR4;
    case 'star5':
      return anychart.enums.LegendItemIconType.STAR5;
    case 'star6':
      return anychart.enums.LegendItemIconType.STAR6;
    case 'star7':
      return anychart.enums.LegendItemIconType.STAR7;
    case 'star10':
      return anychart.enums.LegendItemIconType.STAR10;
    case 'diamond':
      return anychart.enums.LegendItemIconType.DIAMOND;
    case 'triangleup':
      return anychart.enums.LegendItemIconType.TRIANGLE_UP;
    case 'triangledown':
      return anychart.enums.LegendItemIconType.TRIANGLE_DOWN;
    case 'cross':
      return anychart.enums.LegendItemIconType.CROSS;
    case 'diagonalcross':
      return anychart.enums.LegendItemIconType.DIAGONAL_CROSS;
    case 'trapezoid':
    case 'trapezium':
      return anychart.enums.LegendItemIconType.TRAPEZIUM;
    case 'pentagon':
      return anychart.enums.LegendItemIconType.PENTAGON;
    case 'arrow':
    case 'arrowhead':
      return anychart.enums.LegendItemIconType.ARROWHEAD;
    case 'vline':
      return anychart.enums.LegendItemIconType.V_LINE;
    case 'rf':
    case 'risingfalling':
      return anychart.enums.LegendItemIconType.RISING_FALLING;
  }
  return opt_default || anychart.enums.LegendItemIconType.SQUARE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  LegendItemsSourceMode
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Predefined icons type.
 * @enum {string}
 */
anychart.enums.LegendItemsSourceMode = {
  DEFAULT: 'default',
  CATEGORIES: 'categories'
};


/**
 * Normalizes legend items source mode.
 * @param {*} value Value to normalize.
 * @param {anychart.enums.LegendItemsSourceMode=} opt_default Custom default value (defaults to DEFAULT).
 * @return {anychart.enums.LegendItemsSourceMode} normalized value.
 */
anychart.enums.normalizeLegendItemsSourceMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'd':
    case 'def':
    case 'default':
      return anychart.enums.LegendItemsSourceMode.DEFAULT;
    case 'c':
    case 'cat':
    case 'categories':
      return anychart.enums.LegendItemsSourceMode.CATEGORIES;
  }
  return opt_default || anychart.enums.LegendItemsSourceMode.DEFAULT;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  BulletMarkerType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Predefined bullet marker type.
 * @enum {string}
 */
anychart.enums.BulletMarkerType = {
  X: 'x',
  LINE: 'line',
  ELLIPSE: 'ellipse',
  BAR: 'bar'
};


/**
 * Normalizes bullet marker position
 * @param {*} value Value to normalize.
 * @param {anychart.enums.BulletMarkerType=} opt_default Custom default value (defaults to BAR).
 * @return {anychart.enums.BulletMarkerType}
 */
anychart.enums.normalizeBulletMarkerType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'x':
      return anychart.enums.BulletMarkerType.X;
    case 'line':
      return anychart.enums.BulletMarkerType.LINE;
    case 'ellipse':
      return anychart.enums.BulletMarkerType.ELLIPSE;
    case 'bar':
      return anychart.enums.BulletMarkerType.BAR;
  }
  return opt_default || anychart.enums.BulletMarkerType.BAR;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  SidePosition
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gauges elements position relative axis.
 * @enum {string}
 */
anychart.enums.GaugeSidePosition = {
  /**
   * Outside of a axis, but closer to the gauge center.
   */
  INSIDE: 'inside',
  /**
   * Inside a axis, no matter where the gauge center is.
   */
  CENTER: 'center',
  /**
   * Outside of a axis, but further from the gauge center.
   */
  OUTSIDE: 'outside'
};


/**
 * Normalizes gauge side position. (ticks, labels)
 * @param {*} value Position to normalize.
 * @param {anychart.enums.GaugeSidePosition=} opt_default Custom default value (defaults to CENTER).
 * @return {anychart.enums.GaugeSidePosition}
 */
anychart.enums.normalizeGaugeSidePosition = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'inside':
    case 'in':
    case 'i':
    case 'inner':
      return anychart.enums.GaugeSidePosition.INSIDE;
    case 'center':
    case 'cen':
    case 'c':
    case 'middle':
    case 'mid':
    case 'm':
      return anychart.enums.GaugeSidePosition.CENTER;
    case 'outside':
    case 'out':
    case 'o':
    case 'outer':
      return anychart.enums.GaugeSidePosition.OUTSIDE;
  }
  return opt_default || anychart.enums.GaugeSidePosition.CENTER;
};


/**
 * Ticks position (inside ot outside).
 * @enum {string}
 */
anychart.enums.SidePosition = {
  /**
   * Inside a chart, no matter where an axis is.
   */
  INSIDE: 'inside',
  /**
   * Half of tick will be inside a chart, other part - outside, no matter where an axis is.
   */
  CENTER: 'center',
  /**
   * Outside of a chart, no matter where an axis is.
   */
  OUTSIDE: 'outside'
};


/**
 * Normalizes ticks position
 * @param {*} value Ticks position to normalize.
 * @param {anychart.enums.SidePosition=} opt_default Custom default value (defaults to OUTSIDE).
 * @return {anychart.enums.SidePosition}
 */
anychart.enums.normalizeSidePosition = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'inside':
    case 'in':
    case 'i':
    case 'inner':
      return anychart.enums.SidePosition.INSIDE;
    case 'outside':
    case 'out':
    case 'o':
    case 'outer':
      return anychart.enums.SidePosition.OUTSIDE;
    case 'middle':
    case 'mid':
    case 'm':
    case 'center':
    case 'c':
      return anychart.enums.SidePosition.CENTER;
  }
  return opt_default || anychart.enums.SidePosition.INSIDE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  PyramidLabelsPosition (and FunnelLabelsPosition)
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Labels position (Inside|OutsideLeft|OutsideLeftInColumn|OutsideRight|OutsideRightInColumn).
 * @enum {string}
 */
anychart.enums.PyramidLabelsPosition = {
  /**
   * Inside a point.
   */
  INSIDE: 'inside',
  /**
   * Outside of a point to the left.
   */
  OUTSIDE_LEFT: 'outsideLeft',
  /**
   * Outside of a point to the left in column.
   */
  OUTSIDE_LEFT_IN_COLUMN: 'outsideLeftInColumn',
  /**
   * Outside of a point to the right.
   */
  OUTSIDE_RIGHT: 'outsideRight',
  /**
   * Outside of a point to the right in column.
   */
  OUTSIDE_RIGHT_IN_COLUMN: 'outsideRightInColumn'
};


/**
 * Normalizes pyramid/funnel labels position
 * @param {*} value Labels position to normalize.
 * @param {anychart.enums.PyramidLabelsPosition=} opt_default Custom default value (defaults to OUTSIDE_LEFT_IN_COLUMN).
 * @return {anychart.enums.PyramidLabelsPosition}
 */
anychart.enums.normalizePyramidLabelsPosition = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'inside':
    case 'in':
    case 'i':
    case 'inner':
      return anychart.enums.PyramidLabelsPosition.INSIDE;
    case 'outside':
    case 'out':
    case 'o':
    case 'outer':
    case 'l':
    case 'left':
    case 'outsideleft':
    case 'outleft':
    case 'ol':
    case 'outerleft':
      return anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT;
    case 'outsideleftincolumn':
    case 'outsideleftcolumn':
    case 'outleftincolumn':
    case 'outleftcolumn':
    case 'olic':
    case 'olc':
    case 'lc':
    case 'outerleftincolumn':
    case 'outerleftcolumn':
      return anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN;
    case 'r':
    case 'right':
    case 'outsideright':
    case 'outright':
    case 'or':
    case 'outerright':
      return anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT;
    case 'outsiderightincolumn':
    case 'outsiderightcolumn':
    case 'outrightincolumn':
    case 'outrightcolumn':
    case 'oric':
    case 'orc':
    case 'rc':
    case 'outerrightincolumn':
    case 'outerrightcolumn':
      return anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN;
  }
  return opt_default || anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  EventType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Event types enumeration.
 * @enum {string}
 */
anychart.enums.EventType = {
  POINT_MOUSE_OUT: 'pointmouseout',
  POINT_MOUSE_OVER: 'pointmouseover',
  POINT_MOUSE_MOVE: 'pointmousemove',
  POINT_MOUSE_DOWN: 'pointmousedown',
  POINT_MOUSE_UP: 'pointmouseup',
  POINT_CLICK: 'pointclick',
  POINT_DBLCLICK: 'pointdblclick',
  //deprecated
  POINT_HOVER: 'pointhover',
  POINTS_SELECT: 'pointsselect',
  POINTS_HOVER: 'pointshover',
  CHART_DRAW: 'chartdraw',
  ANIMATION_START: 'animationstart',
  ANIMATION_END: 'animationend',
  DRILL_CHANGE: 'drillchange',

  ZOOM_START: 'zoomstart',
  ZOOM: 'zoom',
  ZOOM_END: 'zoomend',

  LEGEND_ITEM_MOUSE_OUT: 'legenditemmouseout',
  LEGEND_ITEM_MOUSE_OVER: 'legenditemmouseover',
  LEGEND_ITEM_MOUSE_MOVE: 'legenditemmousemove',
  LEGEND_ITEM_MOUSE_DOWN: 'legenditemmousedown',
  LEGEND_ITEM_MOUSE_UP: 'legenditemmouseup',
  LEGEND_ITEM_CLICK: 'legenditemclick',
  LEGEND_ITEM_DBLCLICK: 'legenditemdblclick',

  DRAG: 'drag',
  DRAG_START: 'dragstart',
  DRAG_END: 'dragend',

  SCROLL_CHANGE: 'scrollchange',

  SPLITTER_CHANGE: 'splitterchange',

  SCROLLER_CHANGE_START: 'scrollerchangestart',
  SCROLLER_CHANGE: 'scrollerchange',
  SCROLLER_CHANGE_FINISH: 'scrollerchangefinish',

  SELECTED_RANGE_CHANGE_START: 'selectedrangechangestart',
  SELECTED_RANGE_BEFORE_CHANGE: 'selectedrangebeforechange',
  SELECTED_RANGE_CHANGE: 'selectedrangechange',
  SELECTED_RANGE_CHANGE_FINISH: 'selectedrangechangefinish',

  //HIGHLIGHT: 'highlight',
  //UNHIGHLIGHT: 'unhighlight',

  SIGNAL: 'signal',

  //Grid events.
  ROW_SELECT: 'rowSelect',
  ROW_CLICK: 'rowClick',
  ROW_DBL_CLICK: 'rowDblClick',
  ROW_MOUSE_OVER: 'rowMouseOver',
  ROW_MOUSE_OUT: 'rowMouseOut',
  ROW_MOUSE_MOVE: 'rowMouseMove',
  ROW_MOUSE_DOWN: 'rowMouseDown',
  ROW_MOUSE_UP: 'rowMouseUp',
  BEFORE_CREATE_CONNECTOR: 'beforeCreateConnector',
  ROW_COLLAPSE_EXPAND: 'rowcollapseexpand',

  //Connectors events.
  CONNECTOR_SELECT: 'connectorselect',
  CONNECTOR_CLICK: 'connectorclick',
  CONNECTOR_DBL_CLICK: 'connectordblclick',
  CONNECTOR_MOUSE_OVER: 'connectormouseover',
  CONNECTOR_MOUSE_OUT: 'connectormouseout',
  CONNECTOR_MOUSE_MOVE: 'connectormousemove',
  CONNECTOR_MOUSE_DOWN: 'connectormousedown',
  CONNECTOR_MOUSE_UP: 'connectormouseup',

  //Data tree CRUD events.
  TREE_ITEM_MOVE: 'treeItemMove',
  TREE_ITEM_UPDATE: 'treeItemUpdate',
  TREE_ITEM_CREATE: 'treeItemCreate',
  TREE_ITEM_REMOVE: 'treeItemRemove',

  // Annotation events
  ANNOTATION_SELECT: 'annotationSelect',
  ANNOTATION_UNSELECT: 'annotationUnselect',
  ANNOTATION_DRAWING_FINISH: 'annotationDrawingFinish',

  // UI events
  CLOSE: 'close',
  COMPLETE: 'complete'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ScaleStackMode
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @enum {string}
 */
anychart.enums.ScaleStackMode = {
  NONE: 'none',
  VALUE: 'value',
  PERCENT: 'percent'
};


/**
 * Normalizes scale stack mode.
 * @param {*} value Stack mode to normalize.
 * @param {anychart.enums.ScaleStackMode=} opt_default Custom default value (defaults to NONE).
 * @return {anychart.enums.ScaleStackMode}
 */
anychart.enums.normalizeScaleStackMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'value':
    case 'values':
    case 'val':
    case 'v':
    case 'true':
    case 'yes':
    case 'y':
    case 't':
    case '1':
      return anychart.enums.ScaleStackMode.VALUE;
    case 'percent':
    case 'ratio':
    case 'relative':
    case 'p':
    case 'r':
      return anychart.enums.ScaleStackMode.PERCENT;
    case 'none':
    case 'null':
    case 'no':
    case 'false':
    case 'f':
    case '0':
    case 'n':
      return anychart.enums.ScaleStackMode.NONE;
  }
  return opt_default || anychart.enums.ScaleStackMode.NONE;
};


/**
 * Enum for scale changes mode. Currently this enum is equal to the ScaleStackMode, so we reuse it.
 * @enum {string}
 */
anychart.enums.ScaleComparisonMode = anychart.enums.ScaleStackMode;


/**
 * Normalizes scale changes mode.
 * @param {*} value Stack mode to normalize.
 * @param {anychart.enums.ScaleComparisonMode=} opt_default Custom default value (defaults to NONE).
 * @return {anychart.enums.ScaleComparisonMode}
 */
anychart.enums.normalizeScaleComparisonMode = anychart.enums.normalizeScaleStackMode;


/**
 * Enum for predefined part of LinearScale.chagnesFrom() acceptable values.
 * @enum {string}
 */
anychart.enums.ScaleCompareWithMode = {
  SERIES_START: 'seriesStart',
  FIRST_VISIBLE: 'firstVisible'
};


/**
 * Normalizes enum part of the value. To completely normalize passed value use
 * anychart.enums.normalizeScaleCompareWithModeMode(value) || anychart.utils.normalizeTimestamp(value)
 * @param {*} value
 * @return {?anychart.enums.ScaleCompareWithMode}
 */
anychart.enums.normalizeScaleCompareWithModeMode = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'series':
    case 'datastart':
    case 'seriesstart':
      return anychart.enums.ScaleCompareWithMode.SERIES_START;
    case 'firstvisible':
    case 'first':
    case 'default':
      return anychart.enums.ScaleCompareWithMode.FIRST_VISIBLE;
  }
  return null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ScatterTicksMode
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Scatter ticks mode enum.
 * @enum {string}
 */
anychart.enums.ScatterTicksMode = {
  /**
   * Scatter ticks go with linear interval, e.g. [1, 2, 3, 4, 5]
   */
  LINEAR: 'linear',
  /**
   * Scatter ticks go with log-linear interval, e.g. [0.1, 1, 10, 100, 1000]
   */
  LOGARITHMIC: 'logarithmic'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  MapSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types for Maps.
 * @enum {string}
 */
anychart.enums.MapSeriesType = {
  CHOROPLETH: 'choropleth',
  BUBBLE: 'bubble',
  MARKER: 'marker',
  CONNECTOR: 'connector'
};


/**
 * Normalizes map series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.MapSeriesType=} opt_default Custom default value (defaults to CHOROPLETH).
 * @return {anychart.enums.MapSeriesType}
 */
anychart.enums.normalizeMapSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'choropleth':
      return anychart.enums.MapSeriesType.CHOROPLETH;
    case 'bubble':
      return anychart.enums.MapSeriesType.BUBBLE;
    case 'marker':
      return anychart.enums.MapSeriesType.MARKER;
    case 'connector':
      return anychart.enums.MapSeriesType.CONNECTOR;
  }
  return opt_default || anychart.enums.MapSeriesType.CHOROPLETH;
};


/**
 * List of names of common map projections.
 * @enum {string}
 */
anychart.enums.MapProjections = {
  BONNE: 'bonne',
  ECKERT1: 'eckert1',
  ECKERT3: 'eckert3',
  FAHEY: 'fahey',
  HAMMER: 'hammer',
  AITOFF: 'aitoff',
  MERCATOR: 'mercator',
  ORTHOGRAPHIC: 'orthographic',
  ROBINSON: 'robinson',
  WAGNER6: 'wagner6',
  WSG84: 'wsg84',
  EQUIRECTANGULAR: 'equirectangular',
  AUGUST: 'august'
};


/**
 * Normalizes map projections names.
 * @param {*} value Projection name to normalize.
 * @return {Object|Function|anychart.enums.MapProjections|string}
 */
anychart.enums.normalizeMapProjections = function(value) {
  switch (String(value).toLowerCase()) {
    case 'bonne':
      return anychart.enums.MapProjections.BONNE;
      break;
    case 'eckert1':
      return anychart.enums.MapProjections.ECKERT1;
      break;
    case 'eckert3':
      return anychart.enums.MapProjections.ECKERT3;
      break;
    case 'fahey':
      return anychart.enums.MapProjections.FAHEY;
      break;
    case 'hammeraitoff':
    case 'hammer-aitoff':
    case 'hammer':
      return anychart.enums.MapProjections.HAMMER;
      break;
    case 'aitoff':
      return anychart.enums.MapProjections.AITOFF;
      break;
    case 'mercator':
      return anychart.enums.MapProjections.MERCATOR;
      break;
    case 'orthographic':
      return anychart.enums.MapProjections.ORTHOGRAPHIC;
      break;
    case 'robinson':
      return anychart.enums.MapProjections.ROBINSON;
      break;
    case 'wagner':
    case 'wagner6':
      return anychart.enums.MapProjections.WAGNER6;
      break;
    case 'undefined':
    case 'null':
    case 'none':
    case 'wsg84':
    case 'base':
    case '+proj=longlat +datum=WGS84 +no_defs':
      return anychart.enums.MapProjections.WSG84;
      break;
    case 'equirectangular':
      return anychart.enums.MapProjections.EQUIRECTANGULAR;
      break;
    case 'august':
      return anychart.enums.MapProjections.AUGUST;
      break;
  }
  return /** @type {Object|Function|anychart.enums.MapProjections|string} */(value);
};


/**
 * List of grid position relative othe map components. Grid z-index.
 * @enum {number}
 */
anychart.enums.MapGridZIndex = {
  UNDER_MAP: 5,
  OVER_MAP: 45
};


/**
 * Defines that middleX and middleY field means.
 * If mode is 'absolute' then coords of middle sets as lat/lon coords.
 * If 'relative' - as ratio of region bounds.
 * @enum {string}
 */
anychart.enums.MapPointMiddlePositionMode = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative'
};


/**
 * Defines that x and y field of label means.
 * If mode is 'absolute' then coords of middle sets as lat/lon coords.
 * If 'relative' - as ratio of region bounds.
 * If 'offset' - as static position in polar coords, x - angle, y - radius. 0 degrees - 12 o'clock position.
 * @enum {string}
 */
anychart.enums.MapPointOutsidePositionMode = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative',
  OFFSET: 'offset'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  CartesianSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.CartesianSeriesType = {
  AREA: 'area',
  BAR: 'bar',
  BOX: 'box',
  BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  JUMP_LINE: 'jumpLine',
  LINE: 'line',
  MARKER: 'marker',
  OHLC: 'ohlc',
  RANGE_AREA: 'rangeArea',
  RANGE_BAR: 'rangeBar',
  RANGE_COLUMN: 'rangeColumn',
  RANGE_SPLINE_AREA: 'rangeSplineArea',
  RANGE_STEP_AREA: 'rangeStepArea',
  SPLINE: 'spline',
  SPLINE_AREA: 'splineArea',
  STEP_AREA: 'stepArea',
  STEP_LINE: 'stepLine',
  STICK: 'stick'
};


/**
 * Normalizes cartesian series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.CartesianSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.CartesianSeriesType}
 */
anychart.enums.normalizeCartesianSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.CartesianSeriesType.AREA;
    case 'bar':
      return anychart.enums.CartesianSeriesType.BAR;
    case 'box':
      return anychart.enums.CartesianSeriesType.BOX;
    case 'bubble':
      return anychart.enums.CartesianSeriesType.BUBBLE;
    case 'candlestick':
      return anychart.enums.CartesianSeriesType.CANDLESTICK;
    case 'column':
      return anychart.enums.CartesianSeriesType.COLUMN;
    case 'jumpline':
      return anychart.enums.CartesianSeriesType.JUMP_LINE;
    case 'stick':
      return anychart.enums.CartesianSeriesType.STICK;
    case 'line':
      return anychart.enums.CartesianSeriesType.LINE;
    case 'marker':
      return anychart.enums.CartesianSeriesType.MARKER;
    case 'ohlc':
      return anychart.enums.CartesianSeriesType.OHLC;
    case 'rangearea':
      return anychart.enums.CartesianSeriesType.RANGE_AREA;
    case 'rangebar':
      return anychart.enums.CartesianSeriesType.RANGE_BAR;
    case 'rangecolumn':
      return anychart.enums.CartesianSeriesType.RANGE_COLUMN;
    case 'rangesplinearea':
      return anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA;
    case 'rangesteparea':
      return anychart.enums.CartesianSeriesType.RANGE_STEP_AREA;
    case 'spline':
      return anychart.enums.CartesianSeriesType.SPLINE;
    case 'splinearea':
      return anychart.enums.CartesianSeriesType.SPLINE_AREA;
    case 'steparea':
      return anychart.enums.CartesianSeriesType.STEP_AREA;
    case 'stepline':
      return anychart.enums.CartesianSeriesType.STEP_LINE;
  }
  return opt_default || anychart.enums.CartesianSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Cartesian3dSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.Cartesian3dSeriesType = {
  AREA: 'area',
  BAR: 'bar',
  COLUMN: 'column'
};


/**
 * Normalizes cartesian 3D series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.Cartesian3dSeriesType=} opt_default Custom default value (defaults to COLUMN).
 * @return {anychart.enums.Cartesian3dSeriesType}
 */
anychart.enums.normalizeCartesian3dSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.Cartesian3dSeriesType.AREA;
    case 'bar':
      return anychart.enums.Cartesian3dSeriesType.BAR;
    case 'column':
      return anychart.enums.Cartesian3dSeriesType.COLUMN;
  }
  return opt_default || anychart.enums.Cartesian3dSeriesType.COLUMN;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  StockSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.StockSeriesType = {
  AREA: 'area',
  // BAR: 'bar',
  // BOX: 'box',
  // BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  MARKER: 'marker',
  OHLC: 'ohlc',
  RANGE_AREA: 'rangeArea',
  // RANGE_BAR: 'rangeBar',
  RANGE_COLUMN: 'rangeColumn',
  RANGE_SPLINE_AREA: 'rangeSplineArea',
  RANGE_STEP_AREA: 'rangeStepArea',
  SPLINE: 'spline',
  SPLINE_AREA: 'splineArea',
  STEP_AREA: 'stepArea',
  STEP_LINE: 'stepLine',
  JUMP_LINE: 'jumpLine',
  STICK: 'stick'
};


/**
 * Normalizes stock series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.StockSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.StockSeriesType}
 */
anychart.enums.normalizeStockSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.StockSeriesType.AREA;
    // case 'bar':
    //   return anychart.enums.StockSeriesType.BAR;
    // case 'box':
    //   return anychart.enums.StockSeriesType.BOX;
    // case 'bubble':
    //   return anychart.enums.StockSeriesType.BUBBLE;
    case 'candlestick':
      return anychart.enums.StockSeriesType.CANDLESTICK;
    case 'column':
      return anychart.enums.StockSeriesType.COLUMN;
    case 'jumpline':
      return anychart.enums.StockSeriesType.JUMP_LINE;
    case 'stick':
      return anychart.enums.StockSeriesType.STICK;
    case 'line':
      return anychart.enums.StockSeriesType.LINE;
    case 'marker':
      return anychart.enums.StockSeriesType.MARKER;
    case 'ohlc':
      return anychart.enums.StockSeriesType.OHLC;
    case 'rangearea':
      return anychart.enums.StockSeriesType.RANGE_AREA;
    // case 'rangebar':
    //   return anychart.enums.StockSeriesType.RANGE_BAR;
    case 'rangecolumn':
      return anychart.enums.StockSeriesType.RANGE_COLUMN;
    case 'rangesplinearea':
      return anychart.enums.StockSeriesType.RANGE_SPLINE_AREA;
    case 'rangesteparea':
      return anychart.enums.StockSeriesType.RANGE_STEP_AREA;
    case 'spline':
      return anychart.enums.StockSeriesType.SPLINE;
    case 'splinearea':
      return anychart.enums.StockSeriesType.SPLINE_AREA;
    case 'steparea':
      return anychart.enums.StockSeriesType.STEP_AREA;
    case 'stepline':
      return anychart.enums.StockSeriesType.STEP_LINE;
  }
  return opt_default || anychart.enums.StockSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  MovingAverageType enum.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all smoothing types.
 * @enum {string}
 */
anychart.enums.MovingAverageType = {
  SMA: 'sma',
  EMA: 'ema'
};


/**
 * Normalizes smoothing type.
 * @param {*} value Smoothing value to normalize.
 * @param {anychart.enums.MovingAverageType=} opt_default Custom default value (defaults to SMA).
 * @return {anychart.enums.MovingAverageType}
 */
anychart.enums.normalizeMovingAverageType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'sma':
      return anychart.enums.MovingAverageType.SMA;
    case 'ema':
      return anychart.enums.MovingAverageType.EMA;
  }
  return opt_default || anychart.enums.MovingAverageType.SMA;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  SparklineSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.SparklineSeriesType = {
  AREA: 'area',
  COLUMN: 'column',
  LINE: 'line',
  WIN_LOSS: 'winLoss'
};


/**
 * Normalizes sparkline series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.SparklineSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.SparklineSeriesType}
 */
anychart.enums.normalizeSparklineSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
    case 'are':
    case 'ar':
    case 'a':
      return anychart.enums.SparklineSeriesType.AREA;
    case 'column':
    case 'col':
    case 'c':
      return anychart.enums.SparklineSeriesType.COLUMN;
    case 'line':
    case 'lin':
    case 'l':
      return anychart.enums.SparklineSeriesType.LINE;
    case 'win':
    case 'loss':
    case 'winloss':
    case 'win_loss':
    case 'wl':
      return anychart.enums.SparklineSeriesType.WIN_LOSS;
  }
  return opt_default || anychart.enums.SparklineSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  LinearGaugePointerTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all linear gauge pointers type.
 * @enum {string}
 */
anychart.enums.LinearGaugePointerType = {
  BAR: 'bar',
  RANGE_BAR: 'rangeBar',
  MARKER: 'marker',
  THERMOMETER: 'thermometer',
  TANK: 'tank',
  LED: 'led'
};


/**
 * Normalizes linear gauge pointers type.
 * @param {*} value Pointer's type to normalize.
 * @param {anychart.enums.LinearGaugePointerType=} opt_default Custom default value (defaults to BAR).
 * @return {anychart.enums.LinearGaugePointerType}
 */
anychart.enums.normalizeLinearGaugePointerType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'bar':
    case 'b':
      return anychart.enums.LinearGaugePointerType.BAR;
    case 'rangebar':
    case 'range':
    case 'rb':
    case 'r':
      return anychart.enums.LinearGaugePointerType.RANGE_BAR;
    case 'marker':
    case 'm':
      return anychart.enums.LinearGaugePointerType.MARKER;
    case 'thermometer':
    case 'ther':
    case 'th':
      return anychart.enums.LinearGaugePointerType.THERMOMETER;
    case 'tank':
    case 't':
      return anychart.enums.LinearGaugePointerType.TANK;
    case 'led':
    case 'l':
      return anychart.enums.LinearGaugePointerType.LED;
  }
  return opt_default || anychart.enums.LinearGaugePointerType.BAR;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gantt specific data item field.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gantt reserved names of field in data items.
 * @enum {string}
 */
anychart.enums.GanttDataFields = {
  ID: 'id',
  CHILDREN: 'children',
  ACTUAL: 'actual',
  ACTUAL_START: 'actualStart',
  ACTUAL_END: 'actualEnd',
  BASELINE: 'baseline',
  BASELINE_START: 'baselineStart',
  BASELINE_END: 'baselineEnd',
  PROGRESS: 'progress',
  PROGRESS_VALUE: 'progressValue',
  MILESTONE: 'milestone',
  NAME: 'name',
  COLLAPSED: 'collapsed',
  ROW_HEIGHT: 'rowHeight',
  PERIODS: 'periods',
  PARENT: 'parent',
  START: 'start',
  END: 'end',
  FILL: 'fill',
  STROKE: 'stroke',
  HOVER_FILL: 'hoverFill',
  HOVER_STROKE: 'hoverStroke',
  CONNECTOR: 'connector',
  CONNECT_TO: 'connectTo', // deprecated since 7.7.0
  CONNECTOR_TYPE: 'connectorType',
  START_MARKER: 'startMarker',
  END_MARKER: 'endMarker',
  LABEL: 'label',
  MARKERS: 'markers'
};


/**
 * Gantt range anchor.
 * @enum {string}
 * TODO (A.Kudryavtsev): Actually is anychart.enums.StockRangeAnchor from DVF-2364-range-selection-ui.
 */
anychart.enums.GanttRangeAnchor = {
  FIRST_DATE: 'firstDate',
  FIRST_VISIBLE_DATE: 'firstVisibleDate',
  LAST_VISIBLE_DATE: 'lastVisibleDate',
  LAST_DATE: 'lastDate'
};


/**
 * Normalizes range anchor.
 * @param {*} value
 * @param {?anychart.enums.GanttRangeAnchor=} opt_default Custom default value (defaults to FIRST_VISIBLE_DATE).
 * @return {?anychart.enums.GanttRangeAnchor}
 * TODO (A.Kudryavtsev): Actually is anychart.enums.normalizeStockRangeAnchor from DVF-2364-range-selection-ui.
 */
anychart.enums.normalizeGanttRangeAnchor = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'firstdate':
    case 'fd':
      return anychart.enums.GanttRangeAnchor.FIRST_DATE;
    case 'firstvisibledate':
    case 'fvd':
      return anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE;
    case 'lastvisibledate':
    case 'lvd':
      return anychart.enums.GanttRangeAnchor.LAST_VISIBLE_DATE;
    case 'lastdate':
    case 'ld':
      return anychart.enums.GanttRangeAnchor.LAST_DATE;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE;
};


/**
 * Timeline visual element types.
 * In current time (21 Jul 2015) doesn't need to be exported.
 * @enum {number}
 */
anychart.enums.TLElementTypes = {
  PARENT: 0,
  BASE: 1,
  PROGRESS: 2,
  BASELINE: 3,
  MILESTONE: 4,
  PERIOD: 5,
  CONNECTOR: 6
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gantt timeline connector types.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Connection types.
 * @enum {string}
 */
anychart.enums.ConnectorType = {
  FINISH_START: 'finishstart',
  FINISH_FINISH: 'finishfinish',
  START_FINISH: 'startfinish',
  START_START: 'startstart'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data Grid column formatting presets.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Column formatting presets.
 * @enum {string}
 */
anychart.enums.ColumnFormats = {
  DIRECT_NUMBERING: 'directNumbering',
  TEXT: 'text',
  SHORT_TEXT: 'shortText',
  PERCENT: 'percent',
  DATE_COMMON_LOG: 'dateCommonLog',
  DATE_ISO_8601: 'dateIso8601',
  DATE_US_SHORT: 'dateUsShort',
  DATE_DMY_DOTS: 'dateDmyDots',
  FINANCIAL: 'financial'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gantt Date Time scale markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gantt Date Time scale markers.
 * @enum {string}
 */
anychart.enums.GanttDateTimeMarkers = {
  START: 'start',
  END: 'end',
  CURRENT: 'current'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Reserved data fields.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Data fields.
 * @enum {string}
 */
anychart.enums.DataField = {
  DEPENDS_ON: 'dependsOn',
  OPTIMISTIC: 'optimistic',
  PESSIMISTIC: 'pessimistic',
  MOST_LIKELY: 'mostLikely',
  EXPECTED: 'expected',
  DURATION: 'duration',
  FROM: 'from',
  TO: 'to',
  ID: 'id',
  NAME: 'name'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  RadarSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.RadarSeriesType = {
  AREA: 'area',
  LINE: 'line',
  MARKER: 'marker'
};


/**
 * Normalizes radar series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.RadarSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.RadarSeriesType}
 */
anychart.enums.normalizeRadarSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.RadarSeriesType.AREA;
    case 'line':
      return anychart.enums.RadarSeriesType.LINE;
    case 'marker':
      return anychart.enums.RadarSeriesType.MARKER;
  }
  return opt_default || anychart.enums.RadarSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  PolarSeriesTypes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.PolarSeriesType = {
  AREA: 'area',
  LINE: 'line',
  MARKER: 'marker'
};


/**
 * Normalizes polar series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.PolarSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.PolarSeriesType}
 */
anychart.enums.normalizePolarSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'area':
      return anychart.enums.PolarSeriesType.AREA;
    case 'line':
      return anychart.enums.PolarSeriesType.LINE;
    case 'marker':
      return anychart.enums.PolarSeriesType.MARKER;
  }
  return opt_default || anychart.enums.PolarSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ScatterSeriesType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.ScatterSeriesType = {
  BUBBLE: 'bubble',
  LINE: 'line',
  MARKER: 'marker'
};


/**
 * Normalizes scatter series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.ScatterSeriesType=} opt_default Custom default value (defaults to LINE).
 * @return {anychart.enums.ScatterSeriesType}
 */
anychart.enums.normalizeScatterSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'bubble':
      return anychart.enums.ScatterSeriesType.BUBBLE;
    case 'line':
      return anychart.enums.ScatterSeriesType.LINE;
    case 'marker':
      return anychart.enums.ScatterSeriesType.MARKER;
  }
  return opt_default || anychart.enums.ScatterSeriesType.LINE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  HeatMapSeriesType
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all series types.
 * @enum {string}
 */
anychart.enums.HeatMapSeriesType = {
  HEAT_MAP: 'heatMap'
};


/**
 * Normalizes scatter series type.
 * @param {*} value Series type to normalize.
 * @param {anychart.enums.HeatMapSeriesType=} opt_default Custom default value (defaults to heatMap).
 * @return {anychart.enums.HeatMapSeriesType}
 */
anychart.enums.normalizeHeatMapSeriesType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'heatmap':
      return anychart.enums.HeatMapSeriesType.HEAT_MAP;
  }
  return opt_default || anychart.enums.HeatMapSeriesType.HEAT_MAP;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scale types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all scale types.
 * @enum {string}
 */
anychart.enums.ScaleTypes = {
  LINEAR: 'linear',
  LOG: 'log',
  DATE_TIME: 'dateTime',
  DATE_TIME_WITH_CALENDAR: 'dateTimeWithCalendar',
  ORDINAL: 'ordinal',
  ORDINAL_COLOR: 'ordinalColor',
  LINEAR_COLOR: 'linearColor'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scatter scale types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all scale types.
 * @enum {string}
 */
anychart.enums.ScatterScaleTypes = {
  LINEAR: 'linear',
  LOG: 'log',
  DATE_TIME: 'dateTime'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gauge scale types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all scale types.
 * @enum {string}
 */
anychart.enums.GaugeScaleTypes = {
  LINEAR: 'linear',
  LOG: 'log'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Maps scale types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * List of all scale types.
 * @enum {string}
 */
anychart.enums.MapsScaleTypes = {
  GEO: 'geo'
};


/**
 * Normalize gauge scale type.
 * @param {string} value .
 * @return {anychart.enums.GaugeScaleTypes|string} .
 */
anychart.enums.normalizeGaugeScaleTypes = function(value) {
  value = (String(value)).toLowerCase();

  switch (value) {
    case 'lin':
    case 'linear':
      return anychart.enums.GaugeScaleTypes.LINEAR;
    case 'log':
    case 'logarithmic':
      return anychart.enums.GaugeScaleTypes.LOG;
  }

  return anychart.enums.GaugeScaleTypes.LINEAR;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  CSV mode enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Csv mode enum.
 * @enum {string}
 */
anychart.enums.ChartDataExportMode = {
  RAW: 'raw',
  SPECIFIC: 'specific',
  GROUPED: 'grouped'
};


/**
 * Normalizes csv mode.
 * By default normalizes as SPECIFIC.
 * @param {string=} opt_value
 * @return {anychart.enums.ChartDataExportMode} Normalized csv mode.
 */
anychart.enums.normalizeChartDataExportMode = function(opt_value) {
  opt_value = (String(opt_value)).toLowerCase();

  switch (opt_value) {
    case 'raw':
      return anychart.enums.ChartDataExportMode.RAW;
    case 'specific':
      return anychart.enums.ChartDataExportMode.SPECIFIC;
    case 'grouped':
      return anychart.enums.ChartDataExportMode.GROUPED;
  }

  return anychart.enums.ChartDataExportMode.SPECIFIC;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Errors, Warnings, Info
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @enum {number}
 */
anychart.enums.ErrorCode = {
  CONTAINER_NOT_SET: 1,
  SCALE_NOT_SET: 2,

  //anychart.core.ui.Table
  WRONG_TABLE_CONTENTS: 3,

  NO_FEATURE_IN_MODULE: 4,

  INCORRECT_SCALE_TYPE: 5,

  EMPTY_CONFIG: 7,

  NO_LEGEND_IN_CHART: 8,

  NO_CREDITS_IN_CHART: 9,

  INVALID_GEO_JSON_OBJECT: 10,

  FEATURE_NOT_SUPPORTED: 11,

  NO_LEGEND_IN_STOCK: 51,

  CSV_DOUBLE_QUOTE_IN_SEPARATOR: 100,

  CSV_PARSING_FAILED: 101,

  TABLE_MAPPING_DIFFERENT_TABLE: 200,
  TABLE_FIELD_NAME_DUPLICATE: 201,
  TABLE_COMPUTER_OUTPUT_FIELD_DUPLICATE: 202,

  WRONG_SHAPES_CONFIG: 300
};


/**
 * @enum {number}
 */
anychart.enums.InfoCode = {
  PERFORMANCE_REPORT: 0,
  BULLET_TOO_MUCH_RANGES: 1,
  BULLET_TOO_MUCH_MEASURES: 2,
  PIE_TOO_MUCH_POINTS: 3
};


/**
 * @enum {number}
 */
anychart.enums.WarningCode = {
  //anychart.data.Tree
  DUPLICATED_DATA_ITEM: 1,
  REFERENCE_IS_NOT_UNIQUE: 2,
  MISSING_PARENT_ID: 3,
  CYCLE_REFERENCE: 4,

  //anychart.data.Mapping
  NOT_MAPPED_FIELD: 5,
  COMPLEX_VALUE_TO_DEFAULT_FIELD: 6,
  NOT_OBJECT_OR_ARRAY: 7,

  CANT_SERIALIZE_FUNCTION: 8,

  //anychart.core.ui.DataGrid incorrect component usage.
  DG_INCORRECT_METHOD_USAGE: 9, //can't be tested now

  GANTT_FIT_TO_TASK: 11,

  SERIES_DOESNT_SUPPORT_ERROR: 12,

  TOOLBAR_CONTAINER: 13,
  TOOLBAR_METHOD_IS_NOT_DEFINED: 14,
  TOOLBAR_CHART_IS_NOT_SET: 15,

  SCALE_TYPE_NOT_SUPPORTED: 16,

  DATA_ITEM_SET_PATH: 17,

  TREEMAP_MANY_ROOTS: 18,

  MISSING_PROJ4: 19,

  TOO_MANY_TICKS: 20,

  TABLE_ALREADY_IN_TRANSACTION: 101,

  STOCK_WRONG_MAPPING: 201,

  FEATURE_ID_NOT_FOUND: 301,

  NOT_FOUND: 404,
  DEPRECATED: 405,
  PARSE_DATETIME: 406,

  IMMUTABLE_MARKER_SCALE: 500,
  IMMUTABLE_MARKER_LAYOUT: 501

};


//----------------------------------------------------------------------------------------------------------------------
//
//  DateTimeTicks Interval
//
//----------------------------------------------------------------------------------------------------------------------
// /**
// * Returns human readable
// * @param {anychart.enums.Interval} value
// * @return {string}
// */
// anychart.enums.denormalizeInterval = function(value) {
//   switch (value) {
//     case anychart.enums.Interval.YEAR:
//       return 'year';
//     case anychart.enums.Interval.SEMESTER:
//       return 'semester';
//     case anychart.enums.Interval.QUARTER:
//       return 'quarter';
//     case anychart.enums.Interval.MONTH:
//       return 'month';
//     case anychart.enums.Interval.THIRD_OF_MONTH:
//       return 'thirdOfMonth';
//     case anychart.enums.Interval.WEEK:
//       return 'week';
//     case anychart.enums.Interval.DAY:
//       return 'day';
//     case anychart.enums.Interval.HOUR:
//       return 'hour';
//     case anychart.enums.Interval.MINUTE:
//       return 'minute';
//     case anychart.enums.Interval.SECOND:
//       return 'second';
//     case anychart.enums.Interval.MILLISECOND:
//       return 'millisecond';
//   }
//   return 'unknown';
// };


/**
 * Additional intervals used in stock. Should merge with main intervals, when the DateTimeTicks will work with
 * DateTimeIntervalGenerator instead of goog.date.Interval.
 * @enum {string}
 */
anychart.enums.Interval = {
  YEAR: 'year',
  SEMESTER: 'semester',
  QUARTER: 'quarter',
  MONTH: 'month',
  THIRD_OF_MONTH: 'thirdofmonth',
  WEEK: 'week',
  DAY: 'day',
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',
  MILLISECOND: 'millisecond'
};


/**
 * Normalizes interval
 * @param {*} value Value to normalize.
 * @param {?anychart.enums.Interval=} opt_default Custom default value (defaults to YEARS).
 * @param {boolean=} opt_allowDateOnly If true - no time intervals are allowed, only day.
 * @return {?anychart.enums.Interval}
 */
anychart.enums.normalizeInterval = function(value, opt_default, opt_allowDateOnly) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'years':
    case 'year':
    case 'yyyy':
    case 'yy':
    case 'y':
      return anychart.enums.Interval.YEAR;
    case 'semesters':
    case 'semester':
    case 'sem':
      return anychart.enums.Interval.SEMESTER;
    case 'quarters':
    case 'quarter':
    case 'q':
      return anychart.enums.Interval.QUARTER;
    case 'months':
    case 'month':
    case 'mm':
    case 'm':
      return anychart.enums.Interval.MONTH;
    case 'thirdofmonths':
    case 'thirdofmonth':
    case 'decades':
    case 'decade':
    case 'tom':
    case 'dec':
      return anychart.enums.Interval.THIRD_OF_MONTH;
    case 'weeks':
    case 'week':
    case 'w':
      return anychart.enums.Interval.WEEK;
    case 'days':
    case 'day':
    case 'dd':
    case 'd':
      return anychart.enums.Interval.DAY;
    case 'hours':
    case 'hour':
    case 'hh':
    case 'h':
      return opt_allowDateOnly ? anychart.enums.Interval.DAY : anychart.enums.Interval.HOUR;
    case 'minutes':
    case 'minute':
    case 'min':
    case 'n':
      return opt_allowDateOnly ? anychart.enums.Interval.DAY : anychart.enums.Interval.MINUTE;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return opt_allowDateOnly ? anychart.enums.Interval.DAY : anychart.enums.Interval.SECOND;
    case 'milliseconds':
    case 'millisecond':
    case 'millis':
    case 'milli':
    case 'ms':
      return opt_allowDateOnly ? anychart.enums.Interval.DAY : anychart.enums.Interval.MILLISECOND;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.enums.Interval.YEAR;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ErrorMode enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @enum {string}
 */
anychart.enums.ErrorMode = {
  NONE: 'none',
  X: 'x',
  VALUE: 'value',
  BOTH: 'both'
};


/**
 * Normalizes error mode
 * @param {*} value Value to normalize.
 * @param {anychart.enums.ErrorMode=} opt_default Custom default value (defaults to BOTH).
 * @return {anychart.enums.ErrorMode}
 */
anychart.enums.normalizeErrorMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'false':
    case 'null':
    case 'none':
      return anychart.enums.ErrorMode.NONE;
    case 'x':
      return anychart.enums.ErrorMode.X;
    case 'y':
    case 'value':
      return anychart.enums.ErrorMode.VALUE;
    case 'true':
    case 'both':
      return anychart.enums.ErrorMode.BOTH;
  }
  return opt_default || anychart.enums.ErrorMode.BOTH;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text hAlign/vAlign
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Horizontal align enum.
 * @enum {string}
 */
anychart.enums.HAlign = {
  /**
   Aligns the text to the left.
   */
  LEFT: 'left',
  /**
   The same as left if direction is left-to-right and right if direction is right-to-left.
   */
  START: 'start',
  /**
   The inline contents are centered within the line box.
   */
  CENTER: 'center',
  /**
   The same as right if direction is left-to-right and left if direction is right-to-left.
   */
  END: 'end',
  /**
   Aligns the text to the right.
   */
  RIGHT: 'right'
};


/**
 * Normalizes HAlign enum.
 * @param {*} value
 * @return {anychart.enums.HAlign}
 */
anychart.enums.normalizeHAlign = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'left':
    case 'l':
      return anychart.enums.HAlign.LEFT;
    case 'right':
    case 'r':
      return anychart.enums.HAlign.RIGHT;
    case 'center':
    case 'middle':
    case 'c':
    case 'm':
      return anychart.enums.HAlign.CENTER;
    case 'start':
    case 's':
      return anychart.enums.HAlign.START;
    case 'end':
    case 'e':
      return anychart.enums.HAlign.END;
  }
  return anychart.enums.HAlign.START;
};


/**
 * Vertical align enum.
 * @enum {string}
 */
anychart.enums.VAlign = {
  /**
   vAlign top.
   */
  TOP: 'top',
  /**
   */
  MIDDLE: 'middle',
  /**
   vAlign bottom.
   */
  BOTTOM: 'bottom'
};


/**
 * Normalizes VAlign enum.
 * @param {*} value
 * @return {anychart.enums.VAlign}
 */
anychart.enums.normalizeVAlign = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'top':
    case 't':
      return anychart.enums.VAlign.TOP;
    case 'bottom':
    case 'b':
      return anychart.enums.VAlign.BOTTOM;
    case 'center':
    case 'middle':
    case 'c':
    case 'm':
      return anychart.enums.VAlign.MIDDLE;
  }
  return anychart.enums.VAlign.TOP;
};


/**
 * Font decoration enumeration.
 * @enum {string}
 */
anychart.enums.TextDecoration = {
  /**
   Blinking text. This value is not supported by some browser and is discussed in CSS3,
   animation is recommended instead.
   */
  BLINK: 'blink',
  /**
   Line through decoration.
   */
  LINE_THROUGH: 'line-through',
  /**
   Overline decoration.
   */
  OVERLINE: 'overline',
  /**
   Underline decoration.
   */
  UNDERLINE: 'underline',
  /**
   Cancels all decorations, including links underline.
   */
  NONE: 'none'
};


/**
 * Normalizes font decoration.
 * @param {*} value
 * @return {anychart.enums.TextDecoration}
 */
anychart.enums.normalizeFontDecoration = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'blink':
    case 'b':
      return anychart.enums.TextDecoration.BLINK;
    case 'line-through':
    case 'line_through':
    case 'linethrough':
    case 'line':
    case 'l':
      return anychart.enums.TextDecoration.LINE_THROUGH;
    case 'overline':
    case 'over':
    case 'o':
      return anychart.enums.TextDecoration.OVERLINE;
    case 'underline':
    case 'under':
    case 'u':
      return anychart.enums.TextDecoration.UNDERLINE;
    case 'none':
    case 'n':
      return anychart.enums.TextDecoration.NONE;
  }
  return anychart.enums.TextDecoration.NONE;
};


/**
 * Font style enumeration.
 * @enum {string}
 */
anychart.enums.FontStyle = {
  /**
   Normal.
   */
  NORMAL: 'normal',
  /**
   Italic.
   */
  ITALIC: 'italic',
  /**
   Oblique.
   */
  OBLIQUE: 'oblique'
};


/**
 * Normalizes font style.
 * @param {*} value
 * @return {anychart.enums.FontStyle}
 */
anychart.enums.normalizeFontStyle = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'normal':
    case 'n':
      return anychart.enums.FontStyle.NORMAL;
    case 'italic':
    case 'i':
      return anychart.enums.FontStyle.ITALIC;
    case 'oblique':
    case 'o':
      return anychart.enums.FontStyle.OBLIQUE;
  }
  return anychart.enums.FontStyle.NORMAL;
};


/**
 * Font variant enumeration.
 * @enum {string}
 */
anychart.enums.FontVariant = {
  /**
   Leave lovercase as is.
   */
  NORMAL: 'normal',
  /**
   Make lowercase smaller.
   */
  SMALL_CAP: 'small-caps'
};


/**
 * Normalizes font variant.
 * @param {*} value
 * @return {anychart.enums.FontVariant}
 */
anychart.enums.normalizeFontVariant = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'normal':
    case 'n':
      return anychart.enums.FontVariant.NORMAL;
    case 'small-caps':
    case 'small_caps':
    case 'smallcaps':
    case 'small':
    case 'caps':
    case 'sc':
    case 's':
    case 'c':
      return anychart.enums.FontVariant.SMALL_CAP;
  }
  return anychart.enums.FontVariant.NORMAL;
};


/**
 * Text direction enumeration.
 * @enum {string}
 */
anychart.enums.TextDirection = {
  /**
   Left to right.
   */
  LTR: 'ltr',
  /**
   Right to left.
   */
  RTL: 'rtl'
};


/**
 * Normalizes text direction.
 * @param {*} value
 * @return {anychart.enums.TextDirection}
 */
anychart.enums.normalizeTextDirection = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'ltr':
    case 'l':
      return anychart.enums.TextDirection.LTR;
    case 'rtl':
    case 'r':
      return anychart.enums.TextDirection.RTL;
  }
  return anychart.enums.TextDirection.LTR;
};


/**
 * Text wrap settings enumeration.
 * @enum {string}
 */
anychart.enums.TextWrap = {
  /**
   No wrap.
   */
  NO_WRAP: 'noWrap',
  /**
   Wrap by symbol.
   */
  BY_LETTER: 'byLetter'
};


/**
 * Normalizes font style.
 * @param {*} value
 * @return {anychart.enums.TextWrap}
 */
anychart.enums.normalizeTextWrap = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'nowrap':
    case 'no':
    case 'n':
      return anychart.enums.TextWrap.NO_WRAP;
    default:
      return anychart.enums.TextWrap.BY_LETTER;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Stock
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Aggregation type for table columns.
 * @enum {string}
 */
anychart.enums.AggregationType = {
  /**
   * Choose the first non-NaN value in a group as a value of a point.
   */
  FIRST: 'first',

  /**
   * Choose the last non-NaN value in a group as a value of a point.
   */
  LAST: 'last',

  /**
   * Choose the biggest non-NaN value in a group as a value of a point.
   */
  MAX: 'max',

  /**
   * Choose the lowest non-NaN value in a group as a value of a point.
   */
  MIN: 'min',

  /**
   * Calculate average value in a group and use it as a value of a point.
   */
  AVERAGE: 'average',

  /**
   * Calculate average value in a group using other column values as weights and use it as a value of a point.
   */
  WEIGHTED_AVERAGE: 'weightedAverage',

  /**
   * Choose the first non-undefined value as a value of a point.
   */
  FIRST_VALUE: 'firstValue',

  /**
   * Choose the last non-undefined value as a value of a point.
   */
  LAST_VALUE: 'lastValue',

  /**
   * Calculate the sum of values in a group and use it as a value of a point.
   */
  SUM: 'sum',

  /**
   * Put all non-undefined values in a group to an array and us it as a value of a point.
   */
  LIST: 'list'
};


/**
 * Normalizes passed value to a normal aggregation type.
 * @param {*} value
 * @return {anychart.enums.AggregationType}
 */
anychart.enums.normalizeAggregationType = function(value) {
  value = String(value).toLowerCase();
  switch (value) {
    case 'first':
    case 'open':
      return anychart.enums.AggregationType.FIRST;
    case 'last':
    case 'close':
      return anychart.enums.AggregationType.LAST;
    case 'max':
    case 'high':
    case 'maximum':
    case 'highest':
      return anychart.enums.AggregationType.MAX;
    case 'min':
    case 'low':
    case 'minimum':
    case 'lowest':
      return anychart.enums.AggregationType.MIN;
    case 'average':
    case 'avg':
      return anychart.enums.AggregationType.AVERAGE;
    case 'weightedaverage':
    case 'weightedavg':
    case 'wavg':
    case 'weights':
    case 'weighted':
      return anychart.enums.AggregationType.WEIGHTED_AVERAGE;
    case 'firstvalue':
    case 'firstval':
    case 'openvalue':
    case 'openval':
      return anychart.enums.AggregationType.FIRST_VALUE;
    case 'lastvalue':
    case 'lastval':
    case 'closevalue':
    case 'closeval':
    case 'fill':
    case 'hoverfill':
    case 'risingfill':
    case 'hoverrisingfill':
    case 'fallingfill':
    case 'hoverfallingfill':
    case 'stroke':
    case 'hoverstroke':
    case 'lowstroke':
    case 'hoverlowstroke':
    case 'highstroke':
    case 'hoverhighstroke':
    case 'risingstroke':
    case 'hoverrisingstroke':
    case 'fallingstroke':
    case 'hoverfallingstroke':
    case 'hatchfill':
    case 'hoverhatchfill':
    case 'risinghatchfill':
    case 'hoverrisinghatchfill':
    case 'fallinghatchfill':
    case 'hoverfallinghatchfill':
    case 'marker':
    case 'hovermarker':
      return anychart.enums.AggregationType.LAST_VALUE;
    case 'sum':
    case 'add':
      return anychart.enums.AggregationType.SUM;
    case 'list':
    case 'group':
    case 'array':
      return anychart.enums.AggregationType.LIST;
    default:
      return anychart.enums.AggregationType.LAST;
  }
};


// /**
//  * X determining mode.
//  * @enum {string}
//  */
// anychart.enums.XGroupingMode = {
//   FIRST: 'first',
//   LAST: 'last'
// };
//
//
// /**
//  * Normalizes X grouping mode.
//  * @param {*} value
//  * @return {anychart.enums.XGroupingMode|Function}
//  */
// anychart.enums.normalizeXGroupingMode = function(value) {
//   var res;
//   if (goog.isFunction(value)) {
//     res = value;
//   } else {
//     res = String(value).toLowerCase();
//     if (res != 'last')
//       res = anychart.enums.XGroupingMode.FIRST;
//   }
//   return /** @type {anychart.enums.XGroupingMode|Function} */(res);
// };


/**
 * Enum for data table search modes.
 * @enum {string}
 */
anychart.enums.TableSearchMode = {
  EXACT_OR_PREV: 'exactOrPrev',
  EXACT: 'exact',
  EXACT_OR_NEXT: 'exactOrNext',
  NEAREST: 'nearest'
};


/**
 * Normalization for data table search mode.
 * @param {*} value
 * @return {anychart.enums.TableSearchMode}
 */
anychart.enums.normalizeTableSearchMode = function(value) {
  if (!value) return anychart.enums.TableSearchMode.EXACT;
  value = String(value).toLowerCase();
  switch (value) {
    case 'exact':
    case 'e':
    default:
      return anychart.enums.TableSearchMode.EXACT;
    case 'exactornext':
    case 'next':
    case 'n':
      return anychart.enums.TableSearchMode.EXACT_OR_NEXT;
    case 'exactorprev':
    case 'prev':
    case 'p':
      return anychart.enums.TableSearchMode.EXACT_OR_PREV;
    case 'nearest':
    case 'near':
    case 'closest':
    case 'close':
    case 'c':
      return anychart.enums.TableSearchMode.NEAREST;
  }
};


/**
 * Scroller range changing possible initiators.
 * @enum {string}
 */
anychart.enums.ScrollerRangeChangeSource = {
  THUMB_DRAG: 'thumbDrag',
  SELECTED_RANGE_DRAG: 'selectedRangeDrag',
  BACKGROUND_CLICK: 'backgroundClick'
};


/**
 * Stock range changing possible initiators.
 * @enum {string}
 */
anychart.enums.StockRangeChangeSource = {
  SCROLLER_THUMB_DRAG: 'scrollerThumbDrag',
  SCROLLER_DRAG: 'scrollerDrag',
  SCROLLER_CLICK: 'scrollerClick',
  PLOT_DRAG: 'plotDrag',
  DATA_CHANGE: 'dataUpdate',
  SELECT_RANGE: 'selectRange'
};


/**
 * Stock period range type.
 * @enum {string}
 */
anychart.enums.StockRangeType = {
  UNIT: 'Unit',
  YTD: 'YTD',
  QTD: 'QTD',
  MTD: 'MTD',
  MAX: 'Max'
};


/**
 * Normalizes StockRangePeriodType enum.
 * @param {*} value
 * @param {?anychart.enums.StockRangeType=} opt_default Custom default value (defaults to MAX).
 * @return {?anychart.enums.StockRangeType}
 */
anychart.enums.normalizeStockRangeType = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'unit':
    case 'u':
      return anychart.enums.StockRangeType.UNIT;
    case 'ytd':
      return anychart.enums.StockRangeType.YTD;
    case 'qtd':
      return anychart.enums.StockRangeType.QTD;
    case 'mtd':
      return anychart.enums.StockRangeType.MTD;
    case 'max':
      return anychart.enums.StockRangeType.MAX;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.enums.StockRangeType.MAX;
};


/**
 * Stock range anchor.
 * @enum {string}
 */
anychart.enums.StockRangeAnchor = {
  FIRST_DATE: 'firstDate',
  FIRST_VISIBLE_DATE: 'firstVisibleDate',
  LAST_VISIBLE_DATE: 'lastVisibleDate',
  LAST_DATE: 'lastDate'
};


/**
 * Normalizes range anchor.
 * @param {*} value
 * @param {?anychart.enums.StockRangeAnchor=} opt_default Custom default value (defaults to LAST_DATE).
 * @return {?anychart.enums.StockRangeAnchor}
 */
anychart.enums.normalizeStockRangeAnchor = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'firstdate':
    case 'fd':
      return anychart.enums.StockRangeAnchor.FIRST_DATE;
    case 'firstvisibledate':
    case 'fvd':
      return anychart.enums.StockRangeAnchor.FIRST_VISIBLE_DATE;
    case 'lastvisibledate':
    case 'lvd':
      return anychart.enums.StockRangeAnchor.LAST_VISIBLE_DATE;
    case 'lastdate':
    case 'ld':
      return anychart.enums.StockRangeAnchor.LAST_DATE;
  }
  return goog.isDef(opt_default) ? opt_default : anychart.enums.StockRangeAnchor.LAST_DATE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @enum {string}
 */
anychart.enums.TooltipDisplayMode = {
  UNION: 'union',
  SEPARATED: 'separated',
  SINGLE: 'single'
};


/**
 * Normalizes tooltips display mode.
 * @param {*} value
 * @return {anychart.enums.TooltipDisplayMode}
 */
anychart.enums.normalizeTooltipDisplayMode = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'union':
    case 'u':
      return anychart.enums.TooltipDisplayMode.UNION;
    case 'separated':
    case 'sp':
      return anychart.enums.TooltipDisplayMode.SEPARATED;
    case 'single':
    case 's':
      return anychart.enums.TooltipDisplayMode.SINGLE;
  }
  return anychart.enums.TooltipDisplayMode.SINGLE;
};


/**
 * @enum {string}
 */
anychart.enums.TooltipPositionMode = {
  FLOAT: 'float',
  POINT: 'point',
  CHART: 'chart'
};


/**
 * Normalizes tooltips position mode.
 * @param {*} value
 * @return {anychart.enums.TooltipPositionMode}
 */
anychart.enums.normalizeTooltipPositionMode = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'float':
    case 'fl':
      return anychart.enums.TooltipPositionMode.FLOAT;
    case 'point':
    case 'pt':
    case 'p':
      return anychart.enums.TooltipPositionMode.POINT;
    case 'chart':
    case 'ch':
    case 'c':
      return anychart.enums.TooltipPositionMode.CHART;
  }
  return anychart.enums.TooltipPositionMode.FLOAT;
};


/**
 * @enum {string}
 */
anychart.enums.CrosshairDisplayMode = {
  FLOAT: 'float',
  STICKY: 'sticky'
};


/**
 * Normalizes tooltips position mode.
 * @param {*} value
 * @return {anychart.enums.CrosshairDisplayMode}
 */
anychart.enums.normalizeCrosshairDisplayMode = function(value) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'float':
    case 'fl':
    case 'f':
      return anychart.enums.CrosshairDisplayMode.FLOAT;
    case 'sticky':
    case 'st':
    case 's':
      return anychart.enums.CrosshairDisplayMode.STICKY;
  }
  return anychart.enums.CrosshairDisplayMode.FLOAT;
};


/**
 * @enum {string}
 */
anychart.enums.LabelsDisplayMode = {
  ALWAYS_SHOW: 'alwaysShow',
  CLIP: 'clip',
  DROP: 'drop'
};


/**
 * Normalizes labels display mode.
 * @param {*} value Display mode to normalize.
 * @param {anychart.enums.LabelsDisplayMode=} opt_default Custom default value (defaults to CLIP).
 * @return {anychart.enums.LabelsDisplayMode}
 */
anychart.enums.normalizeLabelsDisplayMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'clip':
    case 'c':
      return anychart.enums.LabelsDisplayMode.CLIP;
    case 'drop':
    case 'd':
      return anychart.enums.LabelsDisplayMode.DROP;
    case 'alwaysshow':
    case 'always':
    case 'show':
    case 'none':
    case 'null':
    case 'no':
    case 'false':
    case 'f':
    case '0':
    case 'n':
      return anychart.enums.LabelsDisplayMode.ALWAYS_SHOW;
  }
  return opt_default || anychart.enums.LabelsDisplayMode.CLIP;
};


/**
 * @enum {string}
 */
anychart.enums.AdjustFontSizeMode = {
  SAME: 'same',
  DIFFERENT: 'different'
};


/**
 * Normalizes adjust font size mode.
 * @param {*} value Mode mode to normalize.
 * @param {anychart.enums.AdjustFontSizeMode=} opt_default Custom default value (defaults to DIFFERENT).
 * @return {anychart.enums.AdjustFontSizeMode}
 */
anychart.enums.normalizeAdjustFontSizeMode = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'same':
    case 's':
      return anychart.enums.AdjustFontSizeMode.SAME;
    case 'different':
    case 'diff':
    case 'd':
      return anychart.enums.AdjustFontSizeMode.DIFFERENT;
  }
  return opt_default || anychart.enums.AdjustFontSizeMode.DIFFERENT;
};


/**
 * @enum {string}
 */
anychart.enums.StepDirection = {
  CENTER: 'center',
  FORWARD: 'forward',
  BACKWARD: 'backward'
};


/**
 * Normalizes step direction.
 * @param {*} value - Value to normalize.
 * @param {anychart.enums.StepDirection=} opt_default - Custom default value (defaults to CENTER).
 * @return {anychart.enums.StepDirection}
 */
anychart.enums.normalizeStepDirection = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'forward':
    case 'fwd':
    case 'f':
      return anychart.enums.StepDirection.FORWARD;
    case 'backward':
    case 'bwd':
    case 'b':
      return anychart.enums.StepDirection.BACKWARD;
  }
  return opt_default || anychart.enums.StepDirection.CENTER;
};


/**
 * Token types enum.
 * @enum {string}
 */
anychart.enums.TokenType = {
  UNKNOWN: '',
  NUMBER: 'number',
  STRING: 'string',
  DATE_TIME: 'datetime',
  PERCENT: 'percent'
};


/**
 * String token enum.
 * @enum {string}
 */
anychart.enums.StringToken = {
  /**
   Average.
   */
  AVERAGE: '%Average',
  ///**
  // The average value of all points in series that are bound this axis.
  // */
  //AXIS_AVERAGE: '%AxisAverage',
  ///**
  // The maximal bubble size of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_MAX: '%AxisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_MIN: '%AxisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_SUM: '%AxisBubbleSizeSum',
  ///**
  // The maximal value of all points in series that are bound this axis.
  // */
  //AXIS_MAX: '%AxisMax',
  ///**
  // The median value of all points in series that are bound this axis.
  // */
  //AXIS_MEDIAN: '%AxisMedian',
  ///**
  // The minimal value of all points in series that are bound this axis.
  // */
  //AXIS_MIN: '%AxisMin',
  ///**
  // The mode value of all points in series that are bound this axis.
  // */
  //AXIS_MODE: '%AxisMode',
  /**
   The name of the axis.
   */
  AXIS_NAME: '%AxisName',
  /**
   The maximal scale value.
   */
  AXIS_SCALE_MAX: '%AxisScaleMax',
  /**
   The minimal scale value.
   */
  AXIS_SCALE_MIN: '%AxisScaleMin',
  ///**
  // The sum of all y values of all points in series that are bound this axis.
  // */
  //AXIS_SUM: '%AxisSum',
  /**
   The bubble size value of this point (Bubble chart).
   */
  BUBBLE_SIZE: '%BubbleSize',
  /**
   The percentage of all the points with the same name this point represents (Categorized charts).
   */
  BUBBLE_SIZE_PERCENT_OF_CATEGORY: '%BubbleSizePercentOfCategory',
  /**
   The percentage of the series this point represents.
   */
  BUBBLE_SIZE_PERCENT_OF_SERIES: '%BubbleSizePercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  BUBBLE_SIZE_PERCENT_OF_TOTAL: '%BubbleSizePercentOfTotal',
  /**
   The name of the category.
   */
  CATEGORY_NAME: '%CategoryName',
  /**
   The average of all the points within this category.
   */
  CATEGORY_Y_AVERAGE: '%CategoryYAverage',
  /**
   The median of all the points within this category.
   */
  CATEGORY_Y_MEDIAN: '%CategoryYMedian',
  /**
   The mode of all the points within this category.
   */
  CATEGORY_Y_MODE: '%CategoryYMode',
  /**
   The percent of all the data on the chart this category represents.
   */
  CATEGORY_Y_PERCENT_OF_TOTAL: '%CategoryYPercentOfTotal',
  /**
   Cat y range average.
   */
  CATEGORY_Y_RANGE_AVERAGE: '%CategoryYRangeAverage',
  /**
   The maximal range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MAX: '%CategoryYRangeMax',
  /**
   The minimal range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MIN: '%CategoryYRangeMin',
  /**
   The median range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MEDIAN: '%CategoryYRangeMedian',
  /**
   The mode range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MODE: '%CategoryYRangeMode',
  /**
   The sum of all ranges in this category (Range charts).
   */
  CATEGORY_Y_RANGE_SUM: '%CategoryYRangeSum',
  /**
   Category Y range percent of total (Range charts).
   */
  CATEGORY_Y_RANGE_PERCENT_OF_TOTAL: '%CategoryYRangePercentOfTotal',
  /**
   The sum of all the points within this category.
   */
  CATEGORY_Y_SUM: '%CategoryYSum',
  /**
   The close value of this point (OHLC, Candlestick).
   */
  CLOSE: '%Close',
  /**
   The maximal of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_MAX_SIZE: '%DataPlotBubbleMaxSize',
  /**
   The minimal of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_MIN_SIZE: '%DataPlotBubbleMinSize',
  /**
   The average bubble size of all the points (Scatter plot charts).
   */
  DATA_PLOT_BUBBLE_SIZE_AVERAGE: '%DataPlotBubbleSizeAverage',
  /**
   The sum of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_SIZE_SUM: '%DataPlotBubbleSizeSum',
  /**
   The name of the series with a maximal sum of the points y values.
   */
  DATA_PLOT_MAX_Y_SUM_SERIES_NAME: '%DataPlotMaxYSumSeriesName',
  /**
   The name of the point with a maximal of all the points y values.
   */
  DATA_PLOT_MAX_Y_VALUE_POINT_NAME: '%DataPlotMaxYValuePointName',
  /**
   The name of the series with a maximal of all the points y values.
   */
  DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME: '%DataPlotMaxYValuePointSeriesName',
  /**
   The name of the series with a minimal sum of the points y values.
   */
  DATA_PLOT_MIN_Y_SUM_SERIES_NAME: '%DataPlotMinYSumSeriesName',
  /**
   The name of the point with a minimal of all the points y values.
   */
  DATA_PLOT_MIN_Y_VALUE_POINT_NAME: '%DataPlotMinYValuePointName',
  /**
   The name of the series with a minimal of all the points y values.
   */
  DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME: '%DataPlotMinYValuePointSeriesName',
  /**
   The number of the points within the chart.
   */
  DATA_PLOT_POINT_COUNT: '%DataPlotPointCount',
  /**
   The number of the series within the chart.
   */
  DATA_PLOT_SERIES_COUNT: '%DataPlotSeriesCount',
  /**
   The average x value of all the points (Scatter plot charts).
   */
  DATA_PLOT_X_AVERAGE: '%DataPlotXAverage',
  /**
   The maximal of all the points x values (Scatter plot chart).
   */
  DATA_PLOT_X_MAX: '%DataPlotXMax',
  /**
   The minimal of all the points x values (Scatter plot chart).
   */
  DATA_PLOT_X_MIN: '%DataPlotXMin',
  /**
   The sum of all the points x values (Scatter plot charts).
   */
  DATA_PLOT_X_SUM: '%DataPlotXSum',
  /**
   The average y value of all the points.
   */
  DATA_PLOT_Y_AVERAGE: '%DataPlotYAverage',
  /**
   The maximal of all the points y values.
   */
  DATA_PLOT_Y_MAX: '%DataPlotYMax',
  /**
   The minimal of all the points y values.
   */
  DATA_PLOT_Y_MIN: '%DataPlotYMin',
  /**
   The maximal of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_MAX: '%DataPlotYRangeMax',
  /**
   The minimal of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_MIN: '%DataPlotYRangeMin',
  /**
   The sum of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_SUM: '%DataPlotYRangeSum',
  /**
   The sum of all the points y values.
   */
  DATA_PLOT_Y_SUM: '%DataPlotYSum',
  /**
   The high value of this point (OHLC, Candlestick).
   */
  HIGH: '%High',
  ///**
  // Returns series or point specific icon.
  // */
  //ICON: '%Icon',
  /**
   The index of this point in the series this point represents (zero-based).
   */
  INDEX: '%Index',
  /**
   The low value of this point (OHLC, Candlestick).
   */
  LOW: '%Low',
  /**
   The name of this point.
   */
  NAME: '%Name',
  /**
   The open value of this point (OHLC, Candlestick).
   */
  OPEN: '%Open',
  /**
   PERT chart statistics - standard deviation for critical path.
   */
  PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION: '%PertChartCriticalPathStandardDeviation',
  /**
   PERT chart statistics - project duration.
   */
  PERT_CHART_PROJECT_DURATION: '%PertChartProjectDuration',
  /**
   The range of this point (RangeEnd - RangeStart).
   */
  RANGE: '%Range',
  /**
   The ending value of this point (Range charts).
   */
  RANGE_END: '%RangeEnd',
  /**
   The starting value of this point (Range charts).
   */
  RANGE_START: '%RangeStart',
  /**
   The maximal bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_MAX_SIZE: '%SeriesBubbleMaxSize',
  /**
   The minimal bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_MIN_SIZE: '%SeriesBubbleMinSize',
  /**
   The average bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_AVERAGE: '%SeriesBubbleSizeAverage',
  /**
   The median bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_MEDIAN: '%SeriesBubbleSizeMedian',
  /**
   The mode bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_MODE: '%SeriesBubbleSizeMode',
  /**
   The sum of all the points bubble sizes (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_SUM: '%SeriesBubbleSizeSum',
  /**
   The x value of the first point in this series (Scatter plot charts).
   */
  SERIES_FIRST_X_VALUE: '%SeriesFirstXValue',
  /**
   The y value of the first point in this series.
   */
  SERIES_FIRST_Y_VALUE: '%SeriesFirstYValue',
  /**
   The x value of the last point in this series (Scatter plot charts).
   */
  SERIES_LAST_X_VALUE: '%SeriesLastXValue',
  /**
   The y value of the first point in this series.
   */
  SERIES_LAST_Y_VALUE: '%SeriesLastYValue',
  /**
   Series min value.
   */
  SERIES_MIN: '%SeriesMin',
  /**
   Series max value.
   */
  SERIES_MAX: '%SeriesMax',
  /**
   The name of this series.
   */
  SERIES_NAME: '%SeriesName',
  /**
   The number of points in this series.
   */
  SERIES_POINT_COUNT: '%SeriesPointCount',
  /**
   The number of points in this series.
   */
  SERIES_POINTS_COUNT: '%SeriesPointsCount',
  /**
   The average x value of all the points within this series.
   */
  SERIES_X_AVERAGE: '%SeriesXAverage',
  /**
   The title text of the X Axis.
   */
  SERIES_X_AXIS_NAME: '%SeriesXAxisName',
  /**
   The maximal x value of all the elements within this series (Scatter plot charts).
   */
  SERIES_X_MAX: '%SeriesXMax',
  /**
   The median x value of all the points within this series (Scatter plot charts).
   */
  SERIES_X_MEDIAN: '%SeriesXMedian',
  /**
   The minimal x value of all the elements within this series (Scatter plot charts).
   */
  SERIES_X_MIN: '%SeriesXMin',
  /**
   The mode x value of all the points within this series (Scatter plot charts).
   */
  SERIES_X_MODE: '%SeriesXMode',
  /**
   The sum of all the points x values (Scatter plot charts).
   */
  SERIES_X_SUM: '%SeriesXSum',
  /**
   The average y value of all the points within this series.
   */
  SERIES_Y_AVERAGE: '%SeriesYAverage',
  /**
   The title text of the Y Axis.
   */
  SERIES_Y_AXIS_NAME: '%SeriesYAxisName',
  /**
   The maximal y value of all the elements within this series.
   */
  SERIES_Y_MAX: '%SeriesYMax',
  /**
   The median y value of all the points within this series.
   */
  SERIES_Y_MEDIAN: '%SeriesYMedian',
  /**
   The minimal y value of all the elements within this series.
   */
  SERIES_Y_MIN: '%SeriesYMin',
  /**
   The mode y value of all the points within this series.
   */
  SERIES_Y_MODE: '%SeriesYMode',
  /**
   The maximal range in this series (Range charts).
   */
  SERIES_Y_RANGE_MAX: '%SeriesYRangeMax',
  /**
   The minimal range in this series (Range charts).
   */
  SERIES_Y_RANGE_MIN: '%SeriesYRangeMin',
  /**
   The sum of all ranges in this series (Range charts).
   */
  SERIES_Y_RANGE_SUM: '%SeriesYRangeSum',
  /**
   The sum of all the points y values.
   */
  SERIES_Y_SUM: '%SeriesYSum',
  /**
   The y value of this point.
   */
  VALUE: '%Value',
  /**
   The percent y value of this point.
   */
  PERCENT_VALUE: '%PercentValue',
  ///**
  // The average x value of all points in series.
  // */
  //X_AXIS_AVERAGE: '%XAxisAverage',
  ///**
  // The maximal bubble size of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_MAX: '%XAxisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_MIN: '%XAxisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_SUM: '%XAxisBubbleSizeSum',
  ///**
  // The maximal x value of all points in series.
  // */
  //X_AXIS_MAX: '%XAxisMax',
  ///**
  // The median x value of all points in series.
  // */
  //X_AXIS_MEDIAN: '%XAxisMedian',
  ///**
  // The minimal x value of all points in series.
  // */
  //X_AXIS_MIN: '%XAxisMin',
  ///**
  // The mode x value of all points in series.
  // */
  //X_AXIS_MODE: '%XAxisMode',
  ///**
  // The name of the axis.
  // */
  //X_AXIS_NAME: '%XAxisName',
  ///**
  // The maximal scale value.
  // */
  //X_AXIS_SCALE_MAX: '%XAxisScaleMax',
  ///**
  // The minimal scale value.
  // */
  //X_AXIS_SCALE_MIN: '%XAxisScaleMin',
  ///**
  // The sum of all x values of all points in series.
  // */
  //X_AXIS_SUM: '%XAxisSum',
  /**
   The percentage of the series this point represents (Scatter Plot charts).
   */
  X_PERCENT_OF_SERIES: '%XPercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  X_PERCENT_OF_TOTAL: '%XPercentOfTotal',
  /**
   The x value of this point (Scatter Plot charts).
   */
  X_VALUE: '%XValue',
  ///**
  // The average y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_AVERAGE: '%YAxisAverage',
  ///**
  // The maximal bubble size of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_MAX: '%YAxisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_MIN: '%YAxisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_SUM: '%YAxisBubbleSizeSum',
  ///**
  // The maximal y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MAX: '%YAxisMax',
  ///**
  // The median y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MEDIAN: '%YAxisMedian',
  ///**
  // The minimal y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MIN: '%YAxisMin',
  ///**
  // The mode y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MODE: '%YAxisMode',
  ///**
  // The name of the axis.
  // */
  //Y_AXIS_NAME: '%YAxisName',
  ///**
  // The maximal scale value.
  // */
  //Y_AXIS_SCALE_MAX: '%YAxisScaleMax',
  ///**
  // The minimal scale value.
  // */
  //Y_AXIS_SCALE_MIN: '%YAxisScaleMin',
  ///**
  // The sum of all y values of all points in series that are bound this axis.
  // */
  //Y_AXIS_SUM: '%YAxisSum',
  /**
   The percentage of all the points with the same name this point represents.
   */
  Y_PERCENT_OF_CATEGORY: '%YPercentOfCategory',
  /**
   The percentage of the series this point represents.
   */
  Y_PERCENT_OF_SERIES: '%YPercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  Y_PERCENT_OF_TOTAL: '%YPercentOfTotal',
  /**
   The y value of this point.*/
  Y_VALUE: '%YValue',

  /**
   * Cumulative frequency of the point. Used in pareto series.
   */
  CUMULATIVE_FREQUENCY: '%CF',

  /**
   * Relative frequency of the point. Used in pareto series.
   */
  RELATIVE_FREQUENCY: '%RF',

  /**
   * Resource index that holds the activity. Used in Resource charts.
   */
  RESOURCE_INDEX: 'resourceIndex',

  /**
   * Activity index. Used in Resource charts.
   */
  ACTIVITY_INDEX: 'activityIndex',

  /**
   * Activity start date. Used in Resource charts.
   */
  START: 'start',

  /**
   * Activity end date. Used in Resource charts.
   */
  END: 'end',

  /**
   * Activity minutes per day. Used in Resource charts.
   */
  MINUTES_PER_DAY: 'minutesPerDay'
};


/**
 * Statistics enum.
 * @enum {string}
 */
anychart.enums.Statistics = {
  /**
   Average.
   */
  AVERAGE: 'average',
  ///**
  // The average value of all points in series that are bound this axis.
  // */
  //AXIS_AVERAGE: 'axisAverage',
  ///**
  // The maximal bubble size of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_MAX: 'axisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_MIN: 'axisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series that are bound this axis.
  // */
  //AXIS_BUBBLE_SIZE_SUM: 'axisBubbleSizeSum',
  ///**
  // The maximal value of all points in series that are bound this axis.
  // */
  //AXIS_MAX: 'axisMax',
  ///**
  // The median value of all points in series that are bound this axis.
  // */
  //AXIS_MEDIAN: 'axisMedian',
  ///**
  // The minimal value of all points in series that are bound this axis.
  // */
  //AXIS_MIN: 'axisMin',
  ///**
  // The mode value of all points in series that are bound this axis.
  // */
  //AXIS_MODE: 'axisMode',
  ///**
  // The name of the axis.
  // */
  //AXIS_NAME: 'axisName',
  ///**
  // The maximal scale value.
  // */
  //AXIS_SCALE_MAX: 'axisScaleMax',
  ///**
  // The minimal scale value.
  // */
  //AXIS_SCALE_MIN: 'axisScaleMin',
  ///**
  // The sum of all y values of all points in series that are bound this axis.
  // */
  //AXIS_SUM: 'axisSum',
  /**
   The bubble size value of this point (Bubble chart).
   */
  BUBBLE_SIZE: 'bubbleSize',
  /**
   The percentage of all the points with the same name this point represents (Categorized charts).
   */
  BUBBLE_SIZE_PERCENT_OF_CATEGORY: 'bubbleSizePercentOfCategory',
  /**
   The percentage of the series this point represents.
   */
  BUBBLE_SIZE_PERCENT_OF_SERIES: 'bubbleSizePercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  BUBBLE_SIZE_PERCENT_OF_TOTAL: 'bubbleSizePercentOfTotal',
  /**
   The name of the category.
   */
  CATEGORY_NAME: 'categoryName',
  /**
   The average of all the points within this category.
   */
  CATEGORY_Y_AVERAGE: 'categoryYAverage',
  /**
   The max of all the points within this category.
   */
  CATEGORY_Y_MAX: 'categoryYMax',
  /**
   The median of all the points within this category.
   */
  CATEGORY_Y_MEDIAN: 'categoryYMedian',
  /**
   The min of all the points within this category.
   */
  CATEGORY_Y_MIN: 'categoryYMin',
  /**
   The mode of all the points within this category.
   */
  CATEGORY_Y_MODE: 'categoryYMode',
  /**
   The percent of all the data on the chart this category represents.
   */
  CATEGORY_Y_PERCENT_OF_TOTAL: 'categoryYPercentOfTotal',
  /**
   The average range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_AVERAGE: 'categoryYRangeAverage',
  /**
   The maximal range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MAX: 'categoryYRangeMax',
  /**
   The median range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MEDIAN: 'categoryYRangeMedian',
  /**
   The minimal range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MIN: 'categoryYRangeMin',
  /**
   The mode range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_MODE: 'categoryYRangeMode',
  /**
   The minimal range in this category (Range charts).
   */
  CATEGORY_Y_RANGE_PERCENT_OF_TOTAL: 'categoryYRangePercentOfTotal',
  /**
   The sum of all ranges in this category (Range charts).
   */
  CATEGORY_Y_RANGE_SUM: 'categoryYRangeSum',
  /**
   The sum of all the points within this category.
   */
  CATEGORY_Y_SUM: 'categoryYSum',
  /**
   The close value of this point (OHLC, Candlestick).
   */
  CLOSE: 'close',
  /**
   Count.
   */
  COUNT: 'count',
  /**
   The maximal of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_MAX_SIZE: 'dataPlotBubbleMaxSize',
  /**
   The minimal of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_MIN_SIZE: 'dataPlotBubbleMinSize',
  /**
   The average bubble size of all the points (Scatter plot charts).
   */
  DATA_PLOT_BUBBLE_SIZE_AVERAGE: 'dataPlotBubbleSizeAverage',
  /**
   The sum of all the points bubble sizes (Bubble chart).
   */
  DATA_PLOT_BUBBLE_SIZE_SUM: 'dataPlotBubbleSizeSum',
  /**
   The name of the series with a maximal sum of the points x values.
   */
  DATA_PLOT_MAX_X_SUM_SERIES_NAME: 'dataPlotMaxXSumSeriesName',
  /**
   The name of the series with a maximal sum of the points y values.
   */
  DATA_PLOT_MAX_Y_SUM_SERIES_NAME: 'dataPlotMaxYSumSeriesName',
  ///**
  // The name of the point with a maximal of all the points y values.
  // */
  //DATA_PLOT_MAX_Y_VALUE_POINT_NAME: 'dataPlotMaxYValuePointName',
  /**
   The name of the series with a maximal of all the points x values.
   */
  DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME: 'dataPlotMaxXValuePointSeriesName',
  /**
   The name of the series with a maximal of all the points y values.
   */
  DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME: 'dataPlotMaxYValuePointSeriesName',
  /**
   The name of the series with a minimal sum of the points x values.
   */
  DATA_PLOT_MIN_X_SUM_SERIES_NAME: 'dataPlotMinXSumSeriesName',
  /**
   The name of the series with a minimal sum of the points y values.
   */
  DATA_PLOT_MIN_Y_SUM_SERIES_NAME: 'dataPlotMinYSumSeriesName',
  ///**
  // The name of the point with a minimal of all the points y values.
  // */
  //DATA_PLOT_MIN_Y_VALUE_POINT_NAME: 'dataPlotMinYValuePointName',
  /**
   The name of the series with a minimal of all the points x values.
   */
  DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME: 'dataPlotMinXValuePointSeriesName',
  /**
   The name of the series with a minimal of all the points y values.
   */
  DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME: 'dataPlotMinYValuePointSeriesName',
  /**
   The number of the points within the chart.
   */
  DATA_PLOT_POINT_COUNT: 'dataPlotPointCount',
  /**
   The number of the series within the chart.
   */
  DATA_PLOT_SERIES_COUNT: 'dataPlotSeriesCount',
  /**
   The average x value of all the points (Scatter plot charts).
   */
  DATA_PLOT_X_AVERAGE: 'dataPlotXAverage',
  /**
   The maximal of all the points x values (Scatter plot chart).
   */
  DATA_PLOT_X_MAX: 'dataPlotXMax',
  /**
   The minimal of all the points x values (Scatter plot chart).
   */
  DATA_PLOT_X_MIN: 'dataPlotXMin',
  /**
   The sum of all the points x values (Scatter plot charts).
   */
  DATA_PLOT_X_SUM: 'dataPlotXSum',
  /**
   The average y value of all the points.
   */
  DATA_PLOT_Y_AVERAGE: 'dataPlotYAverage',
  /**
   The maximal of all the points y values.
   */
  DATA_PLOT_Y_MAX: 'dataPlotYMax',
  /**
   The minimal of all the points y values.
   */
  DATA_PLOT_Y_MIN: 'dataPlotYMin',
  /**
   The maximal of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_MAX: 'dataPlotYRangeMax',
  /**
   The minimal of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_MIN: 'dataPlotYRangeMin',
  /**
   The sum of the ranges of the points within the chart.
   */
  DATA_PLOT_Y_RANGE_SUM: 'dataPlotYRangeSum',
  /**
   The sum of all the points y values.
   */
  DATA_PLOT_Y_SUM: 'dataPlotYSum',
  /**
   The high value of this point (OHLC, Candlestick).
   */
  HIGH: 'high',
  ///**
  // Returns series or point specific icon.
  // */
  //ICON: 'icon',
  /**
   The index of this point in the series this point represents (zero-based).
   */
  INDEX: 'index',
  /**
   The low value of this point (OHLC, Candlestick).
   */
  LOW: 'low',
  /**
   Max.
   */
  MAX: 'max',
  /**
   Min.
   */
  MIN: 'min',
  /**
   The name of this point.
   */
  NAME: 'name',
  /**
   The open value of this point (OHLC, Candlestick).
   */
  OPEN: 'open',
  /**
   Points count.
   */
  POINTS_COUNT: 'pointsCount',
  /**
   PERT chart statistics - Standard deviation for critical path.
   */
  PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION: 'pertChartCriticalPathStandardDeviation',
  /**
   PERT chart statistics - duration of project.
   */
  PERT_CHART_PROJECT_DURATION: 'pertChartProjectDuration',
  /**
   The range of this point (RangeEnd - RangeStart).
   */
  RANGE: 'range',
  /**
   The ending value of this point (Range charts).
   */
  RANGE_END: 'rangeEnd',
  /**
   The starting value of this point (Range charts).
   */
  RANGE_START: 'rangeStart',
  /**
   Series average.
   */
  SERIES_AVERAGE: 'seriesAverage',
  /**
   The maximal bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_MAX_SIZE: 'seriesBubbleMaxSize',
  /**
   The minimal bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_MIN_SIZE: 'seriesBubbleMinSize',
  /**
   The average bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_AVERAGE: 'seriesBubbleSizeAverage',
  /**
   The median bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_MEDIAN: 'seriesBubbleSizeMedian',
  /**
   The mode bubble size value of all the points within this series (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_MODE: 'seriesBubbleSizeMode',
  /**
   The sum of all the points bubble sizes (Bubble chart).
   */
  SERIES_BUBBLE_SIZE_SUM: 'seriesBubbleSizeSum',
  /**
   The x value of the first point in this series (Scatter plot charts).
   */
  SERIES_FIRST_X_VALUE: 'seriesFirstXValue',
  /**
   The y value of the first point in this series.
   */
  SERIES_FIRST_Y_VALUE: 'seriesFirstYValue',
  /**
   The x value of the last point in this series (Scatter plot charts).
   */
  SERIES_LAST_X_VALUE: 'seriesLastXValue',
  /**
   The y value of the first point in this series.
   */
  SERIES_LAST_Y_VALUE: 'seriesLastYValue',
  /**
   Series max.
   */
  SERIES_MAX: 'seriesMax',
  /**
   Series min.
   */
  SERIES_MIN: 'seriesMin',
  /**
   The name of this series.
   */
  SERIES_NAME: 'seriesName',
  /**
   The number of points in this series.
   */
  SERIES_POINT_COUNT: 'seriesPointCount',
  /**
   The number of points in this series.
   */
  SERIES_POINTS_COUNT: 'seriesPointsCount',
  /**
   Series sum.
   */
  SERIES_SUM: 'seriesSum',
  /**
   The average x value of all the points within this series.
   */
  SERIES_X_AVERAGE: 'seriesXAverage',
  ///**
  // The title text of the X Axis.
  // */
  //SERIES_X_AXIS_NAME: 'seriesXAxisName',
  /**
   The maximal x value of all the elements within this series (Scatter plot charts).
   */
  SERIES_X_MAX: 'seriesXMax',
  /**
   The median x value of all the points within this series (Scatter plot charts).
   */
  SERIES_X_MEDIAN: 'seriesXMedian',
  /**
   The minimal x value of all the elements within this series (Scatter plot charts).
   */
  SERIES_X_MIN: 'seriesXMin',
  /**
   The mode x value of all the points within this series (Scatter plot charts).
   */
  SERIES_X_MODE: 'seriesXMode',
  /**
   The sum of all the points x values (Scatter plot charts).
   */
  SERIES_X_SUM: 'seriesXSum',
  /**
   The average y value of all the points within this series.
   */
  SERIES_Y_AVERAGE: 'seriesYAverage',
  ///**
  // The title text of the Y Axis.
  // */
  //SERIES_Y_AXIS_NAME: 'seriesYAxisName',
  /**
   The maximal y value of all the elements within this series.
   */
  SERIES_Y_MAX: 'seriesYMax',
  /**
   The median y value of all the points within this series.
   */
  SERIES_Y_MEDIAN: 'seriesYMedian',
  /**
   The minimal y value of all the elements within this series.
   */
  SERIES_Y_MIN: 'seriesYMin',
  /**
   The mode y value of all the points within this series.
   */
  SERIES_Y_MODE: 'seriesYMode',
  /**
   The average of all ranges in this series (Range charts).
   */
  SERIES_Y_RANGE_AVERAGE: 'seriesYRangeAverage',
  /**
   The maximal range in this series (Range charts).
   */
  SERIES_Y_RANGE_MAX: 'seriesYRangeMax',
  /**
   The median range in this series (Range charts).
   */
  SERIES_Y_RANGE_MEDIAN: 'seriesYRangeMedian',
  /**
   The minimal range in this series (Range charts).
   */
  SERIES_Y_RANGE_MIN: 'seriesYRangeMin',
  /**
   The mode range in this series (Range charts).
   */
  SERIES_Y_RANGE_MODE: 'seriesYRangeMode',
  /**
   The sum of all ranges in this series (Range charts).
   */
  SERIES_Y_RANGE_SUM: 'seriesYRangeSum',
  /**
   The sum of all the points y values.
   */
  SERIES_Y_SUM: 'seriesYSum',
  /**
   The sum of all the points y values.
   */
  SUM: 'sum',
  /**
   The y value of this point.
   */
  VALUE: 'value',
  /**
   The percent y value of this point.
   */
  PERCENT_VALUE: 'percentValue',
  ///**
  // The average x value of all points in series.
  // */
  //X_AXIS_AVERAGE: 'xAxisAverage',
  ///**
  // The maximal bubble size of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_MAX: 'xAxisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_MIN: 'xAxisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series.
  // */
  //X_AXIS_BUBBLE_SIZE_SUM: 'xAxisBubbleSizeSum',
  ///**
  // The maximal x value of all points in series.
  // */
  //X_AXIS_MAX: 'xAxisMax',
  ///**
  // The median x value of all points in series.
  // */
  //X_AXIS_MEDIAN: 'xAxisMedian',
  ///**
  // The minimal x value of all points in series.
  // */
  //X_AXIS_MIN: 'xAxisMin',
  ///**
  // The mode x value of all points in series.
  // */
  //X_AXIS_MODE: 'xAxisMode',
  ///**
  // The name of the axis.
  // */
  //X_AXIS_NAME: 'xAxisName',
  ///**
  // The maximal scale value.
  // */
  //X_AXIS_SCALE_MAX: 'xAxisScaleMax',
  ///**
  // The minimal scale value.
  // */
  //X_AXIS_SCALE_MIN: 'xAxisScaleMin',
  ///**
  // The sum of all x values of all points in series.
  // */
  //X_AXIS_SUM: 'xAxisSum',
  /**
   The percentage of the series this point represents (Scatter Plot charts).
   */
  X_PERCENT_OF_SERIES: 'xPercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  X_PERCENT_OF_TOTAL: 'xPercentOfTotal',
  /**
   The x value of this point (Scatter Plot charts).
   */
  X_VALUE: 'xValue',
  ///**
  // The average y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_AVERAGE: 'yAxisAverage',
  ///**
  // The maximal bubble size of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_MAX: 'yAxisBubbleSizeMax',
  ///**
  // The minimal bubble size of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_MIN: 'yAxisBubbleSizeMin',
  ///**
  // The sum of all bubble sizes of all points in series that are bound this axis.
  // */
  //Y_AXIS_BUBBLE_SIZE_SUM: 'yAxisBubbleSizeSum',
  ///**
  // The maximal y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MAX: 'yAxisMax',
  ///**
  // The median y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MEDIAN: 'yAxisMedian',
  ///**
  // The minimal y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MIN: 'yAxisMin',
  ///**
  // The mode y value of all points in series that are bound this axis.
  // */
  //Y_AXIS_MODE: 'yAxisMode',
  ///**
  // The name of the axis.
  // */
  //Y_AXIS_NAME: 'yAxisName',
  ///**
  // The maximal scale value.
  // */
  //Y_AXIS_SCALE_MAX: 'yAxisScaleMax',
  ///**
  // The minimal scale value.
  // */
  //Y_AXIS_SCALE_MIN: 'yAxisScaleMin',
  ///**
  // The sum of all y values of all points in series that are bound this axis.
  // */
  //Y_AXIS_SUM: 'yAxisSum',
  /**
   The percentage of all the points with the same name this point represents.
   */
  Y_PERCENT_OF_CATEGORY: 'yPercentOfCategory',
  /**
   The percentage of the series this point represents.
   */
  Y_PERCENT_OF_SERIES: 'yPercentOfSeries',
  /**
   The percentage of all the series on the chart this point represents.
   */
  Y_PERCENT_OF_TOTAL: 'yPercentOfTotal',
  /**
   The y value of this point.*/
  Y_VALUE: 'yValue',

  //--------------------------------------------------------------------------------------------------------------------
  // Private values. Do not export.
  //--------------------------------------------------------------------------------------------------------------------
  CATEGORY_Y_SUM_ARR_: 'catYSumArr_',
  CATEGORY_Y_MIN_ARR_: 'catYMinArr_',
  CATEGORY_Y_MAX_ARR_: 'catYMaxArr_',
  CATEGORY_Y_AVG_ARR_: 'catYAvgArr_',
  CATEGORY_Y_MEDIAN_ARR_: 'catYMedianArr_',
  CATEGORY_Y_MODE_ARR_: 'catYModeArr_',

  CATEGORY_Y_RANGE_SUM_ARR_: 'catYRangeSumArr_',
  CATEGORY_Y_RANGE_MIN_ARR_: 'catYRangeMinArr_',
  CATEGORY_Y_RANGE_MAX_ARR_: 'catYRangeMaxArr_',
  CATEGORY_Y_RANGE_AVG_ARR_: 'catYRangeAvgArr_',
  CATEGORY_Y_RANGE_MEDIAN_ARR_: 'catYRangeMedianArr_',
  CATEGORY_Y_RANGE_MODE_ARR_: 'catYRangeModeArr_'

};


//region General series related enums
//----------------------------------------------------------------------------------------------------------------------
//
//  General series related enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * A enum for the drawer settings normalizer type.
 * @enum {string}
 */
anychart.enums.SeriesFieldHandlerTypes = {
  FILL: 'fill',
  STROKE: 'stroke',
  HATCH_FILL: 'hatchFill'
};


/**
 * Drawers type.
 * @enum {number}
 */
anychart.enums.SeriesDrawerTypes = {
  BASE: 0,
  AREA: 1,
  AREA_3D: 2,
  BOX: 3,
  BUBBLE: 4,
  CANDLESTICK: 5,
  COLUMN: 6,
  COLUMN_3D: 7,
  LINE: 8,
  MARKER: 9,
  OHLC: 10,
  RANGE_AREA: 11,
  RANGE_COLUMN: 12,
  RANGE_SPLINE_AREA: 13,
  RANGE_STEP_AREA: 14,
  SPLINE: 15,
  SPLINE_AREA: 16,
  STEP_AREA: 17,
  STEP_LINE: 18,
  JUMP_LINE: 19,
  STICK: 20
};


/**
 * Shape manager type enum.
 * @enum {number}
 */
anychart.enums.ShapeManagerTypes = {
  PER_SERIES: 1,
  PER_POINT: 2
};


/**
 * Shape type enum.
 * @enum {string}
 */
anychart.enums.ShapeType = {
  PATH: 'path',
  CIRCLE: 'circle',
  RECT: 'rect',
  ELLIPSE: 'ellipse'
};


/**
 * Color type.
 * @enum {number}
 */
anychart.enums.ColorType = {
  FILL: 1,
  STROKE: 2,
  HATCH_FILL: 3
};


/**
 * Series properties handler type.
 * @enum {number}
 */
anychart.enums.PropertyHandlerType = {
  SINGLE_ARG: 0,
  MULTI_ARG: 1
};
//endregion


/**
 * Accessibility mode.
 * @enum {string}
 */
anychart.enums.A11yMode = {
  CHART_ELEMENTS: 'chartElements',
  DATA_TABLE: 'dataTable'
};


/**
 * Normalizes a11y mode.
 * @param {anychart.enums.A11yMode|string} mode - A11y mode.
 * @return {anychart.enums.A11yMode} - Normalized mode.
 */
anychart.enums.normalizeA11yMode = function(mode) {
  var value = (String(mode)).toLowerCase();
  switch (value) {
    case 'chartelements':
      return anychart.enums.A11yMode.CHART_ELEMENTS;
    case 'datatable':
      return anychart.enums.A11yMode.DATA_TABLE;
  }
  return anychart.enums.A11yMode.CHART_ELEMENTS;
};


//region Annotations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Enum of annotation types.
 * @enum {string}
 */
anychart.enums.AnnotationTypes = {
  RAY: 'ray',
  LINE: 'line',
  INFINITE_LINE: 'infiniteLine',
  VERTICAL_LINE: 'verticalLine',
  HORIZONTAL_LINE: 'horizontalLine',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  TRIANGLE: 'triangle',
  TREND_CHANNEL: 'trendChannel',
  ANDREWS_PITCHFORK: 'andrewsPitchfork',
  FIBONACCI_FAN: 'fibonacciFan',
  FIBONACCI_ARC: 'fibonacciArc',
  FIBONACCI_RETRACEMENT: 'fibonacciRetracement',
  FIBONACCI_TIMEZONES: 'fibonacciTimezones',
  MARKER: 'marker'
  // LABEL: 'label'
};


/**
 * Normalizes annotation type string to a enum.
 * @param {*} value
 * @return {anychart.enums.AnnotationTypes}
 */
anychart.enums.normalizeAnnotationType = function(value) {
  value = String(value).toLowerCase();
  switch (value) {
    case 'ray':
      return anychart.enums.AnnotationTypes.RAY;
    case 'line':
    case 'interval':
      return anychart.enums.AnnotationTypes.LINE;
    case 'iline':
    case 'infiniteline':
      return anychart.enums.AnnotationTypes.INFINITE_LINE;
    case 'vline':
    case 'verticalline':
      return anychart.enums.AnnotationTypes.VERTICAL_LINE;
    case 'hline':
    case 'horizontalline':
      return anychart.enums.AnnotationTypes.HORIZONTAL_LINE;
    case 'rect':
    case 'rectangle':
      return anychart.enums.AnnotationTypes.RECTANGLE;
    case 'circle':
    case 'ellipse':
      return anychart.enums.AnnotationTypes.ELLIPSE;
    case 'tri':
    case 'triangle':
      return anychart.enums.AnnotationTypes.TRIANGLE;
    case 'trend':
    case 'channel':
    case 'trendchannel':
      return anychart.enums.AnnotationTypes.TREND_CHANNEL;
    case 'fork':
    case 'pitchfork':
    case 'andrewspitchfork':
      return anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK;
    case 'fan':
    case 'ffan':
    case 'fibonaccifan':
      return anychart.enums.AnnotationTypes.FIBONACCI_FAN;
    case 'arc':
    case 'farc':
    case 'fibonacciarc':
      return anychart.enums.AnnotationTypes.FIBONACCI_ARC;
    case 'ret':
    case 'retracement':
    case 'fretracement':
    case 'fibonacciretracement':
      return anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT;
    case 'tz':
    case 'ftz':
    case 'timezones':
    case 'ftimezones':
    case 'fibonaccitimezones':
      return anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES;
    case 'arrow':
    case 'marker':
      return anychart.enums.AnnotationTypes.MARKER;
      // case 'label':
      //   return anychart.enums.AnnotationTypes.LABEL;
  }
  return anychart.enums.AnnotationTypes.LINE;
};
//endregion


/**
 * Paper sizes.
 * @enum {string}
 */
anychart.enums.PaperSize = {
  /**
   * It measures 8.5 by 11 inches (215.9 mm x 279.4 mm). US Letter size is a recognized standard adopted by the American National Standards Institute (ANSI) whereas the A4 is the International Standard (ISO) used in most countries.
   */
  US_LETTER: 'usletter',

  /**
   * The base A0 size of paper is defined as having an area of 1 m2. Rounded to the nearest millimetre, the A0 paper size is 841 by 1,189 millimetres (33.1 in × 46.8 in). Successive paper sizes in the series A1, A2, A3, and so forth, are defined by halving the preceding paper size across the larger dimension.
   */
  A0: 'a0',

  /**
   * A1 measures 594 × 841 millimeters or 23.4 × 33.1 inches.
   */
  A1: 'a1',

  /**
   * A2 measures 420 × 594 millimeters or 16.5 × 23.4 inches.
   */
  A2: 'a2',

  /**
   * The A3 size print measures 29.7 x 42.0cm, 11.69 x 16.53 inches, if mounted 40.6 x 50.8cm, 15.98 x 20 inches. The A4 size print measures 21.0 x 29.7cm, 8.27 x 11.69 inches, if mounted 30.3 x 40.6cm, 11.93 x 15.98 inches.
   */
  A3: 'a3',

  /**
   * A transitional size called PA4 (210 mm × 280 mm or 8.27 in × 11.02 in) was proposed for inclusion into the ISO 216 standard in 1975. It has the height of Canadian P4 paper (215 mm × 280 mm, about 8½ in × 11 in) and the width of international A4 paper (210 mm × 297 mm or 8.27 in × 11.69 in).
   */
  A4: 'a4',

  /**
   * A5 measures 148 × 210 millimeters or 5.83 × 8.27 inches.
   */
  A5: 'a5',

  /**
   * A6 measures 105 × 148 millimeters or 4.13 × 5.83 inches. In PostScript, its dimensions are rounded off to 298 × 420 points. The matching envelope format is C6 (114 × 162 mm).
   */
  A6: 'a6'
};


/**
 * Prettify name of paper size. Used in anychart.ui.ganttToolbar.
 * @param {anychart.enums.PaperSize} paperSize - Paper size.
 * @return {string} - Prettified name of paper size.
 */
anychart.enums.normalizePaperSizeCaption = function(paperSize) {
  if (paperSize == anychart.enums.PaperSize.US_LETTER) return 'US Letter';
  return goog.string.toTitleCase(paperSize);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Pert enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * A enum for milestones shape.
 * @enum {string}
 */
anychart.enums.MilestoneShape = {
  CIRCLE: 'circle',
  RHOMBUS: 'rhombus',
  RECTANGLE: 'rectangle'
};


/**
 * Normalizes milestone type string to a enum.
 * @param {*} value
 * @return {anychart.enums.MilestoneShape}
 */
anychart.enums.normalizeMilestoneShape = function(value) {
  value = String(value).toLowerCase();
  switch (value) {
    case 'rhomb':
    case 'rhombus':
      return anychart.enums.MilestoneShape.RHOMBUS;
    case 'rect':
    case 'rectangle':
      return anychart.enums.MilestoneShape.RECTANGLE;
    default:
      return anychart.enums.MilestoneShape.CIRCLE;
  }
};


// DVF-1826
// goog.exportSymbol('anychart.enums.XGroupingMode.FIRST', anychart.enums.XGroupingMode.FIRST);
// goog.exportSymbol('anychart.enums.XGroupingMode.LAST', anychart.enums.XGroupingMode.LAST);


//region --- Locale DateTime Interval Format Names
//------------------------------------------------------------------------------
//
//  Locale DateTime Interval Format Names
//
//------------------------------------------------------------------------------
/**
 * Locale date time interval format names.
 * @enum {string}
 */
anychart.enums.LocaleDateTimeFormat = {
  YEAR: 'year',
  YEAR_SEMESTER: 'year_semester',
  YEAR_QUARTER: 'year_quarter',
  YEAR_MONTH: 'year_month',
  YEAR_THIRD_OF_MONTH: 'year_third_of_month',
  YEAR_WEEK: 'year_week',
  YEAR_DAY: 'year_day',
  YEAR_HOUR: 'year_hour',
  YEAR_MINUTE: 'year_minute',
  YEAR_SECOND: 'year_second',
  YEAR_MILLISECOND: 'year_millisecond',
  SEMESTER: 'semester',
  SEMESTER_QUARTER: 'semester_quarter',
  SEMESTER_MONTH: 'semester_month',
  SEMESTER_THIRD_OF_MONTH: 'semester_third_of_month',
  SEMESTER_WEEK: 'semester_week',
  SEMESTER_DAY: 'semester_day',
  SEMESTER_HOUR: 'semester_hour',
  SEMESTER_MINUTE: 'semester_minute',
  SEMESTER_SECOND: 'semester_second',
  SEMESTER_MILLISECOND: 'semester_millisecond',
  QUARTER: 'quarter',
  QUARTER_MONTH: 'quarter_month',
  QUARTER_THIRD_OF_MONTH: 'quarter_third_of_month',
  QUARTER_WEEK: 'quarter_week',
  QUARTER_DAY: 'quarter_day',
  QUARTER_HOUR: 'quarter_hour',
  QUARTER_MINUTE: 'quarter_minute',
  QUARTER_SECOND: 'quarter_second',
  QUARTER_MILLISECOND: 'quarter_millisecond',
  MONTH: 'month',
  MONTH_THIRD_OF_MONTH: 'month_third_of_month',
  MONTH_WEEK: 'month_week',
  MONTH_DAY: 'month_day',
  MONTH_HOUR: 'month_hour',
  MONTH_MINUTE: 'month_minute',
  MONTH_SECOND: 'month_second',
  MONTH_MILLISECOND: 'month_millisecond',
  THIRD_OF_MONTH: 'third_of_month',
  THIRD_OF_MONTH_WEEK: 'third_of_month_week',
  THIRD_OF_MONTH_DAY: 'third_of_month_day',
  THIRD_OF_MONTH_HOUR: 'third_of_month_hour',
  THIRD_OF_MONTH_MINUTE: 'third_of_month_minute',
  THIRD_OF_MONTH_SECOND: 'third_of_month_second',
  THIRD_OF_MONTH_MILLISECOND: 'third_of_month_millisecond',
  WEEK: 'week',
  WEEK_DAY: 'week_day',
  WEEK_HOUR: 'week_hour',
  WEEK_MINUTE: 'week_minute',
  WEEK_SECOND: 'week_second',
  WEEK_MILLISECOND: 'week_millisecond',
  DAY: 'day',
  DAY_HOUR: 'day_hour',
  DAY_MINUTE: 'day_minute',
  DAY_SECOND: 'day_second',
  DAY_MILLISECOND: 'day_millisecond',
  HOUR: 'hour',
  HOUR_MINUTE: 'hour_minute',
  HOUR_SECOND: 'hour_second',
  HOUR_MILLISECOND: 'hour_millisecond',
  MINUTE: 'minute',
  MINUTE_SECOND: 'minute_second',
  MINUTE_MILLISECOND: 'minute_millisecond',
  SECOND: 'second',
  SECOND_MILLISECOND: 'second_millisecond',
  MILLISECOND: 'millisecond'
};


/**
 * Locale date time interval format prefixes.
 * @enum {string}
 */
anychart.enums.IntervalFormatPrefix = {
  NONE: '',
  FULL: 'full'
};


//endregion
//region --- Calendar items
//------------------------------------------------------------------------------
//
//  Calendar items
//
//------------------------------------------------------------------------------
/**
 * Availability period.
 * @enum {string}
 */
anychart.enums.AvailabilityPeriod = {
  YEAR: 'year',
  WEEK: 'week',
  DAY: 'day',
  NONE: 'none'
};


/**
 * Normalizes availability period.
 * @param {*} value
 * @return {anychart.enums.AvailabilityPeriod}
 */
anychart.enums.normalizeAvailabilityPeriod = function(value) {
  value = String(value).toLowerCase();
  switch (value) {
    case 'y':
    case 'year':
      return anychart.enums.AvailabilityPeriod.YEAR;
    case 'w':
    case 'week':
      return anychart.enums.AvailabilityPeriod.WEEK;
    case 'd':
    case 'day':
      return anychart.enums.AvailabilityPeriod.DAY;
  }
  return anychart.enums.AvailabilityPeriod.NONE;
};


//endregion
//region --- Resource Chart items
//------------------------------------------------------------------------------
//
//  Resource Chart items
//
//------------------------------------------------------------------------------
/**
 * Time tracking mode.
 * @enum {string}
 */
anychart.enums.TimeTrackingMode = {
  AVAILABILITY_PER_CHART: 'availabilityPerChart',
  AVAILABILITY_PER_RESOURCE: 'availabilityPerResource',
  ACTIVITY_PER_CHART: 'activityPerChart',
  ACTIVITY_PER_RESOURCE: 'activityPerResource'
};


/**
 * Normalizes time tracking mode string.
 * @param {*} value
 * @return {anychart.enums.TimeTrackingMode}
 */
anychart.enums.normalizeTimeTrackingMode = function(value) {
  value = String(value).toLowerCase();
  switch (value) {
    case 'availabilityperchart':
      return anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART;
    case 'availabilityperresource':
      return anychart.enums.TimeTrackingMode.AVAILABILITY_PER_RESOURCE;
    case 'activityperchart':
      return anychart.enums.TimeTrackingMode.ACTIVITY_PER_CHART;
    //case 'activityperresource':
    default:
      return anychart.enums.TimeTrackingMode.ACTIVITY_PER_RESOURCE;
  }
};


//endregion


//exports
goog.exportSymbol('anychart.enums.RadialGridLayout.CIRCUIT', anychart.enums.RadialGridLayout.CIRCUIT);
goog.exportSymbol('anychart.enums.RadialGridLayout.RADIAL', anychart.enums.RadialGridLayout.RADIAL);

goog.exportSymbol('anychart.enums.HoverMode.BY_SPOT', anychart.enums.HoverMode.BY_SPOT);
goog.exportSymbol('anychart.enums.HoverMode.BY_X', anychart.enums.HoverMode.BY_X);

goog.exportSymbol('anychart.enums.SelectionMode.NONE', anychart.enums.SelectionMode.NONE);
goog.exportSymbol('anychart.enums.SelectionMode.SINGLE_SELECT', anychart.enums.SelectionMode.SINGLE_SELECT);
goog.exportSymbol('anychart.enums.SelectionMode.MULTI_SELECT', anychart.enums.SelectionMode.MULTI_SELECT);
goog.exportSymbol('anychart.enums.SelectionMode.DRILL_DOWN', anychart.enums.SelectionMode.DRILL_DOWN);

goog.exportSymbol('anychart.enums.Anchor.LEFT_TOP', anychart.enums.Anchor.LEFT_TOP);
goog.exportSymbol('anychart.enums.Anchor.LEFT_CENTER', anychart.enums.Anchor.LEFT_CENTER);
goog.exportSymbol('anychart.enums.Anchor.LEFT_BOTTOM', anychart.enums.Anchor.LEFT_BOTTOM);
goog.exportSymbol('anychart.enums.Anchor.CENTER_TOP', anychart.enums.Anchor.CENTER_TOP);
goog.exportSymbol('anychart.enums.Anchor.CENTER', anychart.enums.Anchor.CENTER);
goog.exportSymbol('anychart.enums.Anchor.CENTER_BOTTOM', anychart.enums.Anchor.CENTER_BOTTOM);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_TOP', anychart.enums.Anchor.RIGHT_TOP);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_CENTER', anychart.enums.Anchor.RIGHT_CENTER);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_BOTTOM', anychart.enums.Anchor.RIGHT_BOTTOM);
goog.exportSymbol('anychart.enums.Anchor.AUTO', anychart.enums.Anchor.AUTO);

goog.exportSymbol('anychart.enums.Cursor.DEFAULT', anychart.enums.Cursor.DEFAULT);
goog.exportSymbol('anychart.enums.Cursor.CROSSHAIR', anychart.enums.Cursor.CROSSHAIR);
goog.exportSymbol('anychart.enums.Cursor.POINTER', anychart.enums.Cursor.POINTER);
goog.exportSymbol('anychart.enums.Cursor.MOVE', anychart.enums.Cursor.MOVE);
goog.exportSymbol('anychart.enums.Cursor.TEXT', anychart.enums.Cursor.TEXT);
goog.exportSymbol('anychart.enums.Cursor.WAIT', anychart.enums.Cursor.WAIT);
goog.exportSymbol('anychart.enums.Cursor.HELP', anychart.enums.Cursor.HELP);
goog.exportSymbol('anychart.enums.Cursor.N_RESIZE', anychart.enums.Cursor.N_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.NE_RESIZE', anychart.enums.Cursor.NE_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.E_RESIZE', anychart.enums.Cursor.E_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.SE_RESIZE', anychart.enums.Cursor.SE_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.S_RESIZE', anychart.enums.Cursor.S_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.SW_RESIZE', anychart.enums.Cursor.SW_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.W_RESIZE', anychart.enums.Cursor.W_RESIZE);
goog.exportSymbol('anychart.enums.Cursor.NW_RESIZE', anychart.enums.Cursor.NW_RESIZE);

goog.exportSymbol('anychart.enums.Position.LEFT_TOP', anychart.enums.Position.LEFT_TOP);
goog.exportSymbol('anychart.enums.Position.LEFT_CENTER', anychart.enums.Position.LEFT_CENTER);
goog.exportSymbol('anychart.enums.Position.LEFT_BOTTOM', anychart.enums.Position.LEFT_BOTTOM);
goog.exportSymbol('anychart.enums.Position.CENTER_TOP', anychart.enums.Position.CENTER_TOP);
goog.exportSymbol('anychart.enums.Position.CENTER', anychart.enums.Position.CENTER);
goog.exportSymbol('anychart.enums.Position.CENTER_BOTTOM', anychart.enums.Position.CENTER_BOTTOM);
goog.exportSymbol('anychart.enums.Position.RIGHT_TOP', anychart.enums.Position.RIGHT_TOP);
goog.exportSymbol('anychart.enums.Position.RIGHT_CENTER', anychart.enums.Position.RIGHT_CENTER);
goog.exportSymbol('anychart.enums.Position.RIGHT_BOTTOM', anychart.enums.Position.RIGHT_BOTTOM);

goog.exportSymbol('anychart.enums.Align.CENTER', anychart.enums.Align.CENTER);
goog.exportSymbol('anychart.enums.Align.LEFT', anychart.enums.Align.LEFT);
goog.exportSymbol('anychart.enums.Align.RIGHT', anychart.enums.Align.RIGHT);
goog.exportSymbol('anychart.enums.Align.TOP', anychart.enums.Align.TOP);
goog.exportSymbol('anychart.enums.Align.BOTTOM', anychart.enums.Align.BOTTOM);

goog.exportSymbol('anychart.enums.Orientation.LEFT', anychart.enums.Orientation.LEFT);
goog.exportSymbol('anychart.enums.Orientation.RIGHT', anychart.enums.Orientation.RIGHT);
goog.exportSymbol('anychart.enums.Orientation.TOP', anychart.enums.Orientation.TOP);
goog.exportSymbol('anychart.enums.Orientation.BOTTOM', anychart.enums.Orientation.BOTTOM);

goog.exportSymbol('anychart.enums.Layout.HORIZONTAL', anychart.enums.Layout.HORIZONTAL);
goog.exportSymbol('anychart.enums.Layout.VERTICAL', anychart.enums.Layout.VERTICAL);

goog.exportSymbol('anychart.enums.LegendLayout.HORIZONTAL', anychart.enums.LegendLayout.HORIZONTAL);
goog.exportSymbol('anychart.enums.LegendLayout.VERTICAL', anychart.enums.LegendLayout.VERTICAL);
goog.exportSymbol('anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE', anychart.enums.LegendLayout.HORIZONTAL_EXPANDABLE);
goog.exportSymbol('anychart.enums.LegendLayout.VERTICAL_EXPANDABLE', anychart.enums.LegendLayout.VERTICAL_EXPANDABLE);


goog.exportSymbol('anychart.enums.LegendPositionMode.INSIDE', anychart.enums.LegendPositionMode.INSIDE);
goog.exportSymbol('anychart.enums.LegendPositionMode.OUTSIDE', anychart.enums.LegendPositionMode.OUTSIDE);

goog.exportSymbol('anychart.enums.Sort.NONE', anychart.enums.Sort.NONE);
goog.exportSymbol('anychart.enums.Sort.ASC', anychart.enums.Sort.ASC);
goog.exportSymbol('anychart.enums.Sort.DESC', anychart.enums.Sort.DESC);

goog.exportSymbol('anychart.enums.BulletMarkerType.X', anychart.enums.BulletMarkerType.X);
goog.exportSymbol('anychart.enums.BulletMarkerType.BAR', anychart.enums.BulletMarkerType.BAR);
goog.exportSymbol('anychart.enums.BulletMarkerType.ELLIPSE', anychart.enums.BulletMarkerType.ELLIPSE);
goog.exportSymbol('anychart.enums.BulletMarkerType.LINE', anychart.enums.BulletMarkerType.LINE);

goog.exportSymbol('anychart.enums.MarkerType.CIRCLE', anychart.enums.MarkerType.CIRCLE);
goog.exportSymbol('anychart.enums.MarkerType.SQUARE', anychart.enums.MarkerType.SQUARE);
goog.exportSymbol('anychart.enums.MarkerType.TRIANGLE_UP', anychart.enums.MarkerType.TRIANGLE_UP);
goog.exportSymbol('anychart.enums.MarkerType.DIAMOND', anychart.enums.MarkerType.DIAMOND);
goog.exportSymbol('anychart.enums.MarkerType.TRIANGLE_DOWN', anychart.enums.MarkerType.TRIANGLE_DOWN);
goog.exportSymbol('anychart.enums.MarkerType.TRIANGLE_LEFT', anychart.enums.MarkerType.TRIANGLE_LEFT);
goog.exportSymbol('anychart.enums.MarkerType.TRIANGLE_RIGHT', anychart.enums.MarkerType.TRIANGLE_RIGHT);
goog.exportSymbol('anychart.enums.MarkerType.CROSS', anychart.enums.MarkerType.CROSS);
goog.exportSymbol('anychart.enums.MarkerType.DIAGONAL_CROSS', anychart.enums.MarkerType.DIAGONAL_CROSS);
goog.exportSymbol('anychart.enums.MarkerType.STAR4', anychart.enums.MarkerType.STAR4);
goog.exportSymbol('anychart.enums.MarkerType.STAR5', anychart.enums.MarkerType.STAR5);
goog.exportSymbol('anychart.enums.MarkerType.STAR6', anychart.enums.MarkerType.STAR6);
goog.exportSymbol('anychart.enums.MarkerType.STAR7', anychart.enums.MarkerType.STAR7);
goog.exportSymbol('anychart.enums.MarkerType.STAR10', anychart.enums.MarkerType.STAR10);
goog.exportSymbol('anychart.enums.MarkerType.PENTAGON', anychart.enums.MarkerType.PENTAGON);
goog.exportSymbol('anychart.enums.MarkerType.TRAPEZIUM', anychart.enums.MarkerType.TRAPEZIUM);
goog.exportSymbol('anychart.enums.MarkerType.LINE', anychart.enums.MarkerType.LINE);

goog.exportSymbol('anychart.enums.MapAsTableMode.VALUE', anychart.enums.MapAsTableMode.VALUE);//doc
goog.exportSymbol('anychart.enums.MapAsTableMode.RANGE', anychart.enums.MapAsTableMode.RANGE);//doc
goog.exportSymbol('anychart.enums.MapAsTableMode.OHLC', anychart.enums.MapAsTableMode.OHLC);//doc

goog.exportSymbol('anychart.enums.MapProjections.BONNE', anychart.enums.MapProjections.BONNE);
goog.exportSymbol('anychart.enums.MapProjections.AITOFF', anychart.enums.MapProjections.AITOFF);
goog.exportSymbol('anychart.enums.MapProjections.AUGUST', anychart.enums.MapProjections.AUGUST);
goog.exportSymbol('anychart.enums.MapProjections.ECKERT1', anychart.enums.MapProjections.ECKERT1);
goog.exportSymbol('anychart.enums.MapProjections.ECKERT3', anychart.enums.MapProjections.ECKERT3);
goog.exportSymbol('anychart.enums.MapProjections.EQUIRECTANGULAR', anychart.enums.MapProjections.EQUIRECTANGULAR);
goog.exportSymbol('anychart.enums.MapProjections.FAHEY', anychart.enums.MapProjections.FAHEY);
goog.exportSymbol('anychart.enums.MapProjections.HAMMER', anychart.enums.MapProjections.HAMMER);
goog.exportSymbol('anychart.enums.MapProjections.MERCATOR', anychart.enums.MapProjections.MERCATOR);
goog.exportSymbol('anychart.enums.MapProjections.ORTHOGRAPHIC', anychart.enums.MapProjections.ORTHOGRAPHIC);
goog.exportSymbol('anychart.enums.MapProjections.ROBINSON', anychart.enums.MapProjections.ROBINSON);
goog.exportSymbol('anychart.enums.MapProjections.WAGNER6', anychart.enums.MapProjections.WAGNER6);
goog.exportSymbol('anychart.enums.MapProjections.WSG84', anychart.enums.MapProjections.WSG84);

goog.exportSymbol('anychart.enums.MapGridZIndex.UNDER_MAP', anychart.enums.MapGridZIndex.UNDER_MAP);
goog.exportSymbol('anychart.enums.MapGridZIndex.OVER_MAP', anychart.enums.MapGridZIndex.OVER_MAP);

goog.exportSymbol('anychart.enums.MapUnboundRegionsMode.AS_IS', anychart.enums.MapUnboundRegionsMode.AS_IS);
goog.exportSymbol('anychart.enums.MapUnboundRegionsMode.HIDE', anychart.enums.MapUnboundRegionsMode.HIDE);

goog.exportSymbol('anychart.enums.MapPointMiddlePositionMode.ABSOLUTE', anychart.enums.MapPointMiddlePositionMode.ABSOLUTE);
goog.exportSymbol('anychart.enums.MapPointMiddlePositionMode.RELATIVE', anychart.enums.MapPointMiddlePositionMode.RELATIVE);

goog.exportSymbol('anychart.enums.MapPointOutsidePositionMode.RELATIVE', anychart.enums.MapPointOutsidePositionMode.RELATIVE);
goog.exportSymbol('anychart.enums.MapPointOutsidePositionMode.ABSOLUTE', anychart.enums.MapPointOutsidePositionMode.ABSOLUTE);
goog.exportSymbol('anychart.enums.MapPointOutsidePositionMode.OFFSET', anychart.enums.MapPointOutsidePositionMode.OFFSET);

goog.exportSymbol('anychart.enums.TreeFillingMethod.AS_TREE', anychart.enums.TreeFillingMethod.AS_TREE);
goog.exportSymbol('anychart.enums.TreeFillingMethod.AS_TABLE', anychart.enums.TreeFillingMethod.AS_TABLE);

goog.exportSymbol('anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP', anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP);
goog.exportSymbol('anychart.enums.LabelsOverlapMode.NO_OVERLAP', anychart.enums.LabelsOverlapMode.NO_OVERLAP);

goog.exportSymbol('anychart.enums.BackgroundCornersType.NONE', anychart.enums.BackgroundCornersType.NONE);//in docs/final
goog.exportSymbol('anychart.enums.BackgroundCornersType.ROUND', anychart.enums.BackgroundCornersType.ROUND);//in docs/final
goog.exportSymbol('anychart.enums.BackgroundCornersType.CUT', anychart.enums.BackgroundCornersType.CUT);//in docs/final
goog.exportSymbol('anychart.enums.BackgroundCornersType.ROUND_INNER', anychart.enums.BackgroundCornersType.ROUND_INNER);//in docs/final

goog.exportSymbol('anychart.enums.LegendItemIconType.AREA', anychart.enums.LegendItemIconType.AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.BAR', anychart.enums.LegendItemIconType.BAR);
goog.exportSymbol('anychart.enums.LegendItemIconType.BUBBLE', anychart.enums.LegendItemIconType.BUBBLE);
goog.exportSymbol('anychart.enums.LegendItemIconType.CANDLESTICK', anychart.enums.LegendItemIconType.CANDLESTICK);
goog.exportSymbol('anychart.enums.LegendItemIconType.COLUMN', anychart.enums.LegendItemIconType.COLUMN);
goog.exportSymbol('anychart.enums.LegendItemIconType.LINE', anychart.enums.LegendItemIconType.LINE);
goog.exportSymbol('anychart.enums.LegendItemIconType.MARKER', anychart.enums.LegendItemIconType.MARKER);
goog.exportSymbol('anychart.enums.LegendItemIconType.OHLC', anychart.enums.LegendItemIconType.OHLC);
goog.exportSymbol('anychart.enums.LegendItemIconType.RANGE_AREA', anychart.enums.LegendItemIconType.RANGE_AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.RANGE_BAR', anychart.enums.LegendItemIconType.RANGE_BAR);
goog.exportSymbol('anychart.enums.LegendItemIconType.RANGE_COLUMN', anychart.enums.LegendItemIconType.RANGE_COLUMN);
goog.exportSymbol('anychart.enums.LegendItemIconType.RANGE_SPLINE_AREA', anychart.enums.LegendItemIconType.RANGE_SPLINE_AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.RANGE_STEP_AREA', anychart.enums.LegendItemIconType.RANGE_STEP_AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.SPLINE', anychart.enums.LegendItemIconType.SPLINE);
goog.exportSymbol('anychart.enums.LegendItemIconType.SPLINE_AREA', anychart.enums.LegendItemIconType.SPLINE_AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.STEP_LINE', anychart.enums.LegendItemIconType.STEP_LINE);
goog.exportSymbol('anychart.enums.LegendItemIconType.STEP_AREA', anychart.enums.LegendItemIconType.STEP_AREA);
goog.exportSymbol('anychart.enums.LegendItemIconType.CIRCLE', anychart.enums.LegendItemIconType.CIRCLE);
goog.exportSymbol('anychart.enums.LegendItemIconType.SQUARE', anychart.enums.LegendItemIconType.SQUARE);

goog.exportSymbol('anychart.enums.LegendItemsSourceMode.DEFAULT', anychart.enums.LegendItemsSourceMode.DEFAULT);
goog.exportSymbol('anychart.enums.LegendItemsSourceMode.CATEGORIES', anychart.enums.LegendItemsSourceMode.CATEGORIES);

goog.exportSymbol('anychart.enums.SidePosition.INSIDE', anychart.enums.SidePosition.INSIDE);//in docs/
goog.exportSymbol('anychart.enums.SidePosition.OUTSIDE', anychart.enums.SidePosition.OUTSIDE);//in docs/

goog.exportSymbol('anychart.enums.PyramidLabelsPosition.INSIDE', anychart.enums.PyramidLabelsPosition.INSIDE);
goog.exportSymbol('anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT', anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT);
goog.exportSymbol('anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN', anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
goog.exportSymbol('anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT', anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT);
goog.exportSymbol('anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN', anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN);

goog.exportSymbol('anychart.enums.GaugeSidePosition.INSIDE', anychart.enums.GaugeSidePosition.INSIDE);
goog.exportSymbol('anychart.enums.GaugeSidePosition.CENTER', anychart.enums.GaugeSidePosition.CENTER);
goog.exportSymbol('anychart.enums.GaugeSidePosition.OUTSIDE', anychart.enums.GaugeSidePosition.OUTSIDE);

goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_OUT', anychart.enums.EventType.POINT_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_OVER', anychart.enums.EventType.POINT_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_DOWN', anychart.enums.EventType.POINT_MOUSE_DOWN);
goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_UP', anychart.enums.EventType.POINT_MOUSE_UP);
goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_MOVE', anychart.enums.EventType.POINT_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.POINT_CLICK', anychart.enums.EventType.POINT_CLICK);
goog.exportSymbol('anychart.enums.EventType.POINT_DBLCLICK', anychart.enums.EventType.POINT_DBLCLICK);
//deprecated
goog.exportSymbol('anychart.enums.EventType.POINT_HOVER', anychart.enums.EventType.POINT_HOVER);
goog.exportSymbol('anychart.enums.EventType.POINTS_SELECT', anychart.enums.EventType.POINTS_SELECT);
goog.exportSymbol('anychart.enums.EventType.POINTS_HOVER', anychart.enums.EventType.POINTS_HOVER);
goog.exportSymbol('anychart.enums.EventType.DRILL_CHANGE', anychart.enums.EventType.DRILL_CHANGE);
goog.exportSymbol('anychart.enums.EventType.CHART_DRAW', anychart.enums.EventType.CHART_DRAW);
goog.exportSymbol('anychart.enums.EventType.ANIMATION_START', anychart.enums.EventType.ANIMATION_START);
goog.exportSymbol('anychart.enums.EventType.ANIMATION_END', anychart.enums.EventType.ANIMATION_END);
goog.exportSymbol('anychart.enums.EventType.ZOOM_START', anychart.enums.EventType.ZOOM_START);
goog.exportSymbol('anychart.enums.EventType.ZOOM', anychart.enums.EventType.ZOOM);
goog.exportSymbol('anychart.enums.EventType.ZOOM_END', anychart.enums.EventType.ZOOM_END);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE', anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_DOWN', anychart.enums.EventType.LEGEND_ITEM_MOUSE_DOWN);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_UP', anychart.enums.EventType.LEGEND_ITEM_MOUSE_UP);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_CLICK', anychart.enums.EventType.LEGEND_ITEM_CLICK);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_DBLCLICK', anychart.enums.EventType.LEGEND_ITEM_DBLCLICK);

goog.exportSymbol('anychart.enums.EventType.DRAG_START', anychart.enums.EventType.DRAG_START);
goog.exportSymbol('anychart.enums.EventType.DRAG', anychart.enums.EventType.DRAG);
goog.exportSymbol('anychart.enums.EventType.DRAG_END', anychart.enums.EventType.DRAG_END);

goog.exportSymbol('anychart.enums.EventType.SCROLL_CHANGE', anychart.enums.EventType.SCROLL_CHANGE);
goog.exportSymbol('anychart.enums.EventType.SPLITTER_CHANGE', anychart.enums.EventType.SPLITTER_CHANGE);
goog.exportSymbol('anychart.enums.EventType.SIGNAL', anychart.enums.EventType.SIGNAL);
goog.exportSymbol('anychart.enums.EventType.ROW_SELECT', anychart.enums.EventType.ROW_SELECT);
goog.exportSymbol('anychart.enums.EventType.ROW_CLICK', anychart.enums.EventType.ROW_CLICK);
goog.exportSymbol('anychart.enums.EventType.ROW_DBL_CLICK', anychart.enums.EventType.ROW_DBL_CLICK);
goog.exportSymbol('anychart.enums.EventType.ROW_MOUSE_OVER', anychart.enums.EventType.ROW_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.ROW_MOUSE_OUT', anychart.enums.EventType.ROW_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.ROW_MOUSE_MOVE', anychart.enums.EventType.ROW_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.ROW_MOUSE_DOWN', anychart.enums.EventType.ROW_MOUSE_DOWN);
goog.exportSymbol('anychart.enums.EventType.ROW_MOUSE_UP', anychart.enums.EventType.ROW_MOUSE_UP);

goog.exportSymbol('anychart.enums.EventType.CONNECTOR_SELECT', anychart.enums.EventType.CONNECTOR_SELECT);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_CLICK', anychart.enums.EventType.CONNECTOR_CLICK);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_DBL_CLICK', anychart.enums.EventType.CONNECTOR_DBL_CLICK);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_MOUSE_OVER', anychart.enums.EventType.CONNECTOR_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_MOUSE_OUT', anychart.enums.EventType.CONNECTOR_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_MOUSE_MOVE', anychart.enums.EventType.CONNECTOR_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_MOUSE_DOWN', anychart.enums.EventType.CONNECTOR_MOUSE_DOWN);
goog.exportSymbol('anychart.enums.EventType.CONNECTOR_MOUSE_UP', anychart.enums.EventType.CONNECTOR_MOUSE_UP);

goog.exportSymbol('anychart.enums.EventType.ROW_COLLAPSE_EXPAND', anychart.enums.EventType.ROW_COLLAPSE_EXPAND);
goog.exportSymbol('anychart.enums.EventType.BEFORE_CREATE_CONNECTOR', anychart.enums.EventType.BEFORE_CREATE_CONNECTOR);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_CREATE', anychart.enums.EventType.TREE_ITEM_CREATE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_MOVE', anychart.enums.EventType.TREE_ITEM_MOVE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_REMOVE', anychart.enums.EventType.TREE_ITEM_REMOVE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_UPDATE', anychart.enums.EventType.TREE_ITEM_UPDATE);

goog.exportSymbol('anychart.enums.ScaleStackMode.NONE', anychart.enums.ScaleStackMode.NONE);
goog.exportSymbol('anychart.enums.ScaleStackMode.VALUE', anychart.enums.ScaleStackMode.VALUE);
goog.exportSymbol('anychart.enums.ScaleStackMode.PERCENT', anychart.enums.ScaleStackMode.PERCENT);

goog.exportSymbol('anychart.enums.ScaleComparisonMode.NONE', anychart.enums.ScaleComparisonMode.NONE);
goog.exportSymbol('anychart.enums.ScaleComparisonMode.VALUE', anychart.enums.ScaleComparisonMode.VALUE);
goog.exportSymbol('anychart.enums.ScaleComparisonMode.PERCENT', anychart.enums.ScaleComparisonMode.PERCENT);

goog.exportSymbol('anychart.enums.ScaleCompareWithMode.SERIES_START', anychart.enums.ScaleCompareWithMode.SERIES_START);
goog.exportSymbol('anychart.enums.ScaleCompareWithMode.FIRST_VISIBLE', anychart.enums.ScaleCompareWithMode.FIRST_VISIBLE);

goog.exportSymbol('anychart.enums.ScatterTicksMode.LINEAR', anychart.enums.ScatterTicksMode.LINEAR);
goog.exportSymbol('anychart.enums.ScatterTicksMode.LOGARITHMIC', anychart.enums.ScatterTicksMode.LOGARITHMIC);

goog.exportSymbol('anychart.enums.SparklineSeriesType.AREA', anychart.enums.SparklineSeriesType.AREA);
goog.exportSymbol('anychart.enums.SparklineSeriesType.LINE', anychart.enums.SparklineSeriesType.LINE);
goog.exportSymbol('anychart.enums.SparklineSeriesType.COLUMN', anychart.enums.SparklineSeriesType.COLUMN);
goog.exportSymbol('anychart.enums.SparklineSeriesType.WIN_LOSS', anychart.enums.SparklineSeriesType.WIN_LOSS);

goog.exportSymbol('anychart.enums.LinearGaugePointerType.BAR', anychart.enums.LinearGaugePointerType.BAR);
goog.exportSymbol('anychart.enums.LinearGaugePointerType.RANGE_BAR', anychart.enums.LinearGaugePointerType.RANGE_BAR);
goog.exportSymbol('anychart.enums.LinearGaugePointerType.THERMOMETER', anychart.enums.LinearGaugePointerType.THERMOMETER);
goog.exportSymbol('anychart.enums.LinearGaugePointerType.MARKER', anychart.enums.LinearGaugePointerType.MARKER);
goog.exportSymbol('anychart.enums.LinearGaugePointerType.TANK', anychart.enums.LinearGaugePointerType.TANK);
goog.exportSymbol('anychart.enums.LinearGaugePointerType.LED', anychart.enums.LinearGaugePointerType.LED);

goog.exportSymbol('anychart.enums.GanttDataFields.ACTUAL', anychart.enums.GanttDataFields.ACTUAL);
goog.exportSymbol('anychart.enums.GanttDataFields.ACTUAL_START', anychart.enums.GanttDataFields.ACTUAL_START);
goog.exportSymbol('anychart.enums.GanttDataFields.ACTUAL_END', anychart.enums.GanttDataFields.ACTUAL_END);
goog.exportSymbol('anychart.enums.GanttDataFields.BASELINE_START', anychart.enums.GanttDataFields.BASELINE_START);
goog.exportSymbol('anychart.enums.GanttDataFields.BASELINE_END', anychart.enums.GanttDataFields.BASELINE_END);
goog.exportSymbol('anychart.enums.GanttDataFields.CHILDREN', anychart.enums.GanttDataFields.CHILDREN);
goog.exportSymbol('anychart.enums.GanttDataFields.PROGRESS', anychart.enums.GanttDataFields.PROGRESS);
goog.exportSymbol('anychart.enums.GanttDataFields.PROGRESS_VALUE', anychart.enums.GanttDataFields.PROGRESS_VALUE);
goog.exportSymbol('anychart.enums.GanttDataFields.MILESTONE', anychart.enums.GanttDataFields.MILESTONE);
goog.exportSymbol('anychart.enums.GanttDataFields.NAME', anychart.enums.GanttDataFields.NAME);
goog.exportSymbol('anychart.enums.GanttDataFields.COLLAPSED', anychart.enums.GanttDataFields.COLLAPSED);
goog.exportSymbol('anychart.enums.GanttDataFields.ROW_HEIGHT', anychart.enums.GanttDataFields.ROW_HEIGHT);
goog.exportSymbol('anychart.enums.GanttDataFields.ID', anychart.enums.GanttDataFields.ID);
goog.exportSymbol('anychart.enums.GanttDataFields.PERIODS', anychart.enums.GanttDataFields.PERIODS);
goog.exportSymbol('anychart.enums.GanttDataFields.PARENT', anychart.enums.GanttDataFields.PARENT);
goog.exportSymbol('anychart.enums.GanttDataFields.START', anychart.enums.GanttDataFields.START);
goog.exportSymbol('anychart.enums.GanttDataFields.END', anychart.enums.GanttDataFields.END);
goog.exportSymbol('anychart.enums.GanttDataFields.FILL', anychart.enums.GanttDataFields.FILL);
goog.exportSymbol('anychart.enums.GanttDataFields.STROKE', anychart.enums.GanttDataFields.STROKE);
goog.exportSymbol('anychart.enums.GanttDataFields.HOVER_FILL', anychart.enums.GanttDataFields.HOVER_FILL);
goog.exportSymbol('anychart.enums.GanttDataFields.HOVER_STROKE', anychart.enums.GanttDataFields.HOVER_STROKE);
goog.exportSymbol('anychart.enums.GanttDataFields.CONNECT_TO', anychart.enums.GanttDataFields.CONNECT_TO);
goog.exportSymbol('anychart.enums.GanttDataFields.CONNECTOR', anychart.enums.GanttDataFields.CONNECTOR);
goog.exportSymbol('anychart.enums.GanttDataFields.CONNECTOR_TYPE', anychart.enums.GanttDataFields.CONNECTOR_TYPE);
goog.exportSymbol('anychart.enums.GanttDataFields.START_MARKER', anychart.enums.GanttDataFields.START_MARKER);
goog.exportSymbol('anychart.enums.GanttDataFields.END_MARKER', anychart.enums.GanttDataFields.END_MARKER);
goog.exportSymbol('anychart.enums.GanttDataFields.LABEL', anychart.enums.GanttDataFields.LABEL);

goog.exportSymbol('anychart.enums.GanttRangeAnchor.FIRST_DATE', anychart.enums.GanttRangeAnchor.FIRST_DATE);
goog.exportSymbol('anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE', anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE);
goog.exportSymbol('anychart.enums.GanttRangeAnchor.LAST_DATE', anychart.enums.GanttRangeAnchor.LAST_DATE);
goog.exportSymbol('anychart.enums.GanttRangeAnchor.LAST_VISIBLE_DATE', anychart.enums.GanttRangeAnchor.LAST_VISIBLE_DATE);

goog.exportSymbol('anychart.enums.ConnectorType.FINISH_START', anychart.enums.ConnectorType.FINISH_START);
goog.exportSymbol('anychart.enums.ConnectorType.FINISH_FINISH', anychart.enums.ConnectorType.FINISH_FINISH);
goog.exportSymbol('anychart.enums.ConnectorType.START_FINISH', anychart.enums.ConnectorType.START_FINISH);
goog.exportSymbol('anychart.enums.ConnectorType.START_START', anychart.enums.ConnectorType.START_START);

goog.exportSymbol('anychart.enums.ColumnFormats.DIRECT_NUMBERING', anychart.enums.ColumnFormats.DIRECT_NUMBERING);
goog.exportSymbol('anychart.enums.ColumnFormats.TEXT', anychart.enums.ColumnFormats.TEXT);
goog.exportSymbol('anychart.enums.ColumnFormats.SHORT_TEXT', anychart.enums.ColumnFormats.SHORT_TEXT);
goog.exportSymbol('anychart.enums.ColumnFormats.PERCENT', anychart.enums.ColumnFormats.PERCENT);
goog.exportSymbol('anychart.enums.ColumnFormats.DATE_COMMON_LOG', anychart.enums.ColumnFormats.DATE_COMMON_LOG);
goog.exportSymbol('anychart.enums.ColumnFormats.DATE_ISO_8601', anychart.enums.ColumnFormats.DATE_ISO_8601);
goog.exportSymbol('anychart.enums.ColumnFormats.DATE_US_SHORT', anychart.enums.ColumnFormats.DATE_US_SHORT);
goog.exportSymbol('anychart.enums.ColumnFormats.DATE_DMY_DOTS', anychart.enums.ColumnFormats.DATE_DMY_DOTS);
goog.exportSymbol('anychart.enums.ColumnFormats.FINANCIAL', anychart.enums.ColumnFormats.FINANCIAL);

goog.exportSymbol('anychart.enums.GanttDateTimeMarkers.START', anychart.enums.GanttDateTimeMarkers.START);
goog.exportSymbol('anychart.enums.GanttDateTimeMarkers.END', anychart.enums.GanttDateTimeMarkers.END);
goog.exportSymbol('anychart.enums.GanttDateTimeMarkers.CURRENT', anychart.enums.GanttDateTimeMarkers.CURRENT);


goog.exportSymbol('anychart.enums.DataField.DEPENDS_ON', anychart.enums.DataField.DEPENDS_ON);
goog.exportSymbol('anychart.enums.DataField.OPTIMISTIC', anychart.enums.DataField.OPTIMISTIC);
goog.exportSymbol('anychart.enums.DataField.PESSIMISTIC', anychart.enums.DataField.PESSIMISTIC);
goog.exportSymbol('anychart.enums.DataField.MOST_LIKELY', anychart.enums.DataField.MOST_LIKELY);
goog.exportSymbol('anychart.enums.DataField.EXPECTED', anychart.enums.DataField.EXPECTED);
goog.exportSymbol('anychart.enums.DataField.FROM', anychart.enums.DataField.FROM);
goog.exportSymbol('anychart.enums.DataField.TO', anychart.enums.DataField.TO);
goog.exportSymbol('anychart.enums.DataField.ID', anychart.enums.DataField.ID);
goog.exportSymbol('anychart.enums.DataField.NAME', anychart.enums.DataField.NAME);

goog.exportSymbol('anychart.enums.Interval.YEARS', anychart.enums.Interval.YEAR);//deprecated since 7.7.0
goog.exportSymbol('anychart.enums.Interval.MONTHS', anychart.enums.Interval.MONTH);//deprecated since 7.7.0
goog.exportSymbol('anychart.enums.Interval.DAYS', anychart.enums.Interval.DAY);//deprecated since 7.7.0
goog.exportSymbol('anychart.enums.Interval.HOURS', anychart.enums.Interval.HOUR);//deprecated since 7.7.0
goog.exportSymbol('anychart.enums.Interval.MINUTES', anychart.enums.Interval.MINUTE);//deprecated since 7.7.0
goog.exportSymbol('anychart.enums.Interval.SECONDS', anychart.enums.Interval.SECOND);//deprecated since 7.7.0

goog.exportSymbol('anychart.enums.Interval.YEAR', anychart.enums.Interval.YEAR);
goog.exportSymbol('anychart.enums.Interval.SEMESTER', anychart.enums.Interval.SEMESTER);
goog.exportSymbol('anychart.enums.Interval.QUARTER', anychart.enums.Interval.QUARTER);
goog.exportSymbol('anychart.enums.Interval.MONTH', anychart.enums.Interval.MONTH);
goog.exportSymbol('anychart.enums.Interval.THIRD_OF_MONTH', anychart.enums.Interval.THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.Interval.WEEK', anychart.enums.Interval.WEEK);
goog.exportSymbol('anychart.enums.Interval.DAY', anychart.enums.Interval.DAY);
goog.exportSymbol('anychart.enums.Interval.HOUR', anychart.enums.Interval.HOUR);
goog.exportSymbol('anychart.enums.Interval.MINUTE', anychart.enums.Interval.MINUTE);
goog.exportSymbol('anychart.enums.Interval.SECOND', anychart.enums.Interval.SECOND);
goog.exportSymbol('anychart.enums.Interval.MILLISECOND', anychart.enums.Interval.MILLISECOND);

goog.exportSymbol('anychart.enums.ErrorMode.NONE', anychart.enums.ErrorMode.NONE);
goog.exportSymbol('anychart.enums.ErrorMode.X', anychart.enums.ErrorMode.X);
goog.exportSymbol('anychart.enums.ErrorMode.VALUE', anychart.enums.ErrorMode.VALUE);
goog.exportSymbol('anychart.enums.ErrorMode.BOTH', anychart.enums.ErrorMode.BOTH);

goog.exportSymbol('anychart.enums.ScaleTypes.LINEAR', anychart.enums.ScaleTypes.LINEAR);
goog.exportSymbol('anychart.enums.ScaleTypes.LOG', anychart.enums.ScaleTypes.LOG);
goog.exportSymbol('anychart.enums.ScaleTypes.DATE_TIME', anychart.enums.ScaleTypes.DATE_TIME);
goog.exportSymbol('anychart.enums.ScaleTypes.ORDINAL', anychart.enums.ScaleTypes.ORDINAL);

goog.exportSymbol('anychart.enums.ScatterScaleTypes.LINEAR', anychart.enums.ScatterScaleTypes.LINEAR);
goog.exportSymbol('anychart.enums.ScatterScaleTypes.LOG', anychart.enums.ScatterScaleTypes.LOG);
goog.exportSymbol('anychart.enums.ScatterScaleTypes.DATE_TIME', anychart.enums.ScatterScaleTypes.DATE_TIME);

goog.exportSymbol('anychart.enums.GaugeScaleTypes.LINEAR', anychart.enums.GaugeScaleTypes.LINEAR);
goog.exportSymbol('anychart.enums.GaugeScaleTypes.LOG', anychart.enums.GaugeScaleTypes.LOG);

goog.exportSymbol('anychart.enums.AggregationType.AVERAGE', anychart.enums.AggregationType.AVERAGE);
goog.exportSymbol('anychart.enums.AggregationType.FIRST', anychart.enums.AggregationType.FIRST);
goog.exportSymbol('anychart.enums.AggregationType.FIRST_VALUE', anychart.enums.AggregationType.FIRST_VALUE);
goog.exportSymbol('anychart.enums.AggregationType.LAST', anychart.enums.AggregationType.LAST);
goog.exportSymbol('anychart.enums.AggregationType.LAST_VALUE', anychart.enums.AggregationType.LAST_VALUE);
goog.exportSymbol('anychart.enums.AggregationType.LIST', anychart.enums.AggregationType.LIST);
goog.exportSymbol('anychart.enums.AggregationType.MAX', anychart.enums.AggregationType.MAX);
goog.exportSymbol('anychart.enums.AggregationType.MIN', anychart.enums.AggregationType.MIN);
goog.exportSymbol('anychart.enums.AggregationType.SUM', anychart.enums.AggregationType.SUM);
goog.exportSymbol('anychart.enums.AggregationType.WEIGHTED_AVERAGE', anychart.enums.AggregationType.WEIGHTED_AVERAGE);

goog.exportSymbol('anychart.enums.TooltipDisplayMode.UNION', anychart.enums.TooltipDisplayMode.UNION);
goog.exportSymbol('anychart.enums.TooltipDisplayMode.SEPARATED', anychart.enums.TooltipDisplayMode.SEPARATED);
goog.exportSymbol('anychart.enums.TooltipDisplayMode.SINGLE', anychart.enums.TooltipDisplayMode.SINGLE);

goog.exportSymbol('anychart.enums.TooltipPositionMode.FLOAT', anychart.enums.TooltipPositionMode.FLOAT);
goog.exportSymbol('anychart.enums.TooltipPositionMode.POINT', anychart.enums.TooltipPositionMode.POINT);
goog.exportSymbol('anychart.enums.TooltipPositionMode.CHART', anychart.enums.TooltipPositionMode.CHART);

goog.exportSymbol('anychart.enums.CrosshairDisplayMode.FLOAT', anychart.enums.CrosshairDisplayMode.FLOAT);
goog.exportSymbol('anychart.enums.CrosshairDisplayMode.STICKY', anychart.enums.CrosshairDisplayMode.STICKY);

goog.exportSymbol('anychart.enums.StockLabelsOverlapMode.NO_OVERLAP', anychart.enums.StockLabelsOverlapMode.NO_OVERLAP);
goog.exportSymbol('anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP', anychart.enums.StockLabelsOverlapMode.ALLOW_OVERLAP);
goog.exportSymbol('anychart.enums.StockLabelsOverlapMode.ALLOW_MAJOR_OVERLAP', anychart.enums.StockLabelsOverlapMode.ALLOW_MAJOR_OVERLAP);
goog.exportSymbol('anychart.enums.StockLabelsOverlapMode.ALLOW_MINOR_OVERLAP', anychart.enums.StockLabelsOverlapMode.ALLOW_MINOR_OVERLAP);

goog.exportSymbol('anychart.enums.StockRangeType.UNIT', anychart.enums.StockRangeType.UNIT);
goog.exportSymbol('anychart.enums.StockRangeType.YTD', anychart.enums.StockRangeType.YTD);
goog.exportSymbol('anychart.enums.StockRangeType.QTD', anychart.enums.StockRangeType.QTD);
goog.exportSymbol('anychart.enums.StockRangeType.MTD', anychart.enums.StockRangeType.MTD);
goog.exportSymbol('anychart.enums.StockRangeType.MAX', anychart.enums.StockRangeType.MAX);

goog.exportSymbol('anychart.enums.StockRangeAnchor.FIRST_DATE', anychart.enums.StockRangeAnchor.FIRST_DATE);
goog.exportSymbol('anychart.enums.StockRangeAnchor.FIRST_VISIBLE_DATE', anychart.enums.StockRangeAnchor.FIRST_VISIBLE_DATE);
goog.exportSymbol('anychart.enums.StockRangeAnchor.LAST_VISIBLE_DATE', anychart.enums.StockRangeAnchor.LAST_VISIBLE_DATE);
goog.exportSymbol('anychart.enums.StockRangeAnchor.LAST_DATE', anychart.enums.StockRangeAnchor.LAST_DATE);

goog.exportSymbol('anychart.enums.TableSearchMode.EXACT_OR_PREV', anychart.enums.TableSearchMode.EXACT_OR_PREV);
goog.exportSymbol('anychart.enums.TableSearchMode.EXACT', anychart.enums.TableSearchMode.EXACT);
goog.exportSymbol('anychart.enums.TableSearchMode.EXACT_OR_NEXT', anychart.enums.TableSearchMode.EXACT_OR_NEXT);
goog.exportSymbol('anychart.enums.TableSearchMode.NEAREST', anychart.enums.TableSearchMode.NEAREST);

goog.exportSymbol('anychart.enums.ChartScrollerPosition.AFTER_AXES', anychart.enums.ChartScrollerPosition.AFTER_AXES);
goog.exportSymbol('anychart.enums.ChartScrollerPosition.BEFORE_AXES', anychart.enums.ChartScrollerPosition.BEFORE_AXES);

goog.exportSymbol('anychart.enums.LabelsDisplayMode.ALWAYS_SHOW', anychart.enums.LabelsDisplayMode.ALWAYS_SHOW);
goog.exportSymbol('anychart.enums.LabelsDisplayMode.DROP', anychart.enums.LabelsDisplayMode.DROP);
goog.exportSymbol('anychart.enums.LabelsDisplayMode.CLIP', anychart.enums.LabelsDisplayMode.CLIP);

goog.exportSymbol('anychart.enums.StepDirection.CENTER', anychart.enums.StepDirection.CENTER);
goog.exportSymbol('anychart.enums.StepDirection.FORWARD', anychart.enums.StepDirection.FORWARD);
goog.exportSymbol('anychart.enums.StepDirection.BACKWARD', anychart.enums.StepDirection.BACKWARD);

goog.exportSymbol('anychart.enums.TokenType.UNKNOWN', anychart.enums.TokenType.UNKNOWN);
goog.exportSymbol('anychart.enums.TokenType.NUMBER', anychart.enums.TokenType.NUMBER);
goog.exportSymbol('anychart.enums.TokenType.STRING', anychart.enums.TokenType.STRING);
goog.exportSymbol('anychart.enums.TokenType.DATE_TIME', anychart.enums.TokenType.DATE_TIME);

//goog.exportSymbol('anychart.enums.StringToken.AXIS_AVERAGE', anychart.enums.StringToken.AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_BUBBLE_SIZE_MAX', anychart.enums.StringToken.AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_BUBBLE_SIZE_MIN', anychart.enums.StringToken.AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_BUBBLE_SIZE_SUM', anychart.enums.StringToken.AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_MAX', anychart.enums.StringToken.AXIS_MAX);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_MEDIAN', anychart.enums.StringToken.AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_MIN', anychart.enums.StringToken.AXIS_MIN);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_MODE', anychart.enums.StringToken.AXIS_MODE);
goog.exportSymbol('anychart.enums.StringToken.AXIS_NAME', anychart.enums.StringToken.AXIS_NAME);
goog.exportSymbol('anychart.enums.StringToken.AXIS_SCALE_MAX', anychart.enums.StringToken.AXIS_SCALE_MAX);
goog.exportSymbol('anychart.enums.StringToken.AXIS_SCALE_MIN', anychart.enums.StringToken.AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.AXIS_SUM', anychart.enums.StringToken.AXIS_SUM);
goog.exportSymbol('anychart.enums.StringToken.BUBBLE_SIZE', anychart.enums.StringToken.BUBBLE_SIZE);
goog.exportSymbol('anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_CATEGORY', anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_CATEGORY);
goog.exportSymbol('anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_SERIES', anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_TOTAL', anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_NAME', anychart.enums.StringToken.CATEGORY_NAME);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_AVERAGE', anychart.enums.StringToken.CATEGORY_Y_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_MEDIAN', anychart.enums.StringToken.CATEGORY_Y_MEDIAN);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_MODE', anychart.enums.StringToken.CATEGORY_Y_MODE);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_PERCENT_OF_TOTAL', anychart.enums.StringToken.CATEGORY_Y_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_AVERAGE', anychart.enums.StringToken.CATEGORY_Y_RANGE_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL', anychart.enums.StringToken.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_MAX', anychart.enums.StringToken.CATEGORY_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_MIN', anychart.enums.StringToken.CATEGORY_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_MEDIAN', anychart.enums.StringToken.CATEGORY_Y_RANGE_MEDIAN);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_MODE', anychart.enums.StringToken.CATEGORY_Y_RANGE_MODE);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_RANGE_SUM', anychart.enums.StringToken.CATEGORY_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.StringToken.CATEGORY_Y_SUM', anychart.enums.StringToken.CATEGORY_Y_SUM);
goog.exportSymbol('anychart.enums.StringToken.CLOSE', anychart.enums.StringToken.CLOSE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_BUBBLE_MAX_SIZE', anychart.enums.StringToken.DATA_PLOT_BUBBLE_MAX_SIZE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_BUBBLE_MIN_SIZE', anychart.enums.StringToken.DATA_PLOT_BUBBLE_MIN_SIZE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_AVERAGE', anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_SUM', anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_SUM);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MAX_Y_SUM_SERIES_NAME', anychart.enums.StringToken.DATA_PLOT_MAX_Y_SUM_SERIES_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_NAME', anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME', anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MIN_Y_SUM_SERIES_NAME', anychart.enums.StringToken.DATA_PLOT_MIN_Y_SUM_SERIES_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_NAME', anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME', anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_POINT_COUNT', anychart.enums.StringToken.DATA_PLOT_POINT_COUNT);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_SERIES_COUNT', anychart.enums.StringToken.DATA_PLOT_SERIES_COUNT);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_X_AVERAGE', anychart.enums.StringToken.DATA_PLOT_X_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_X_MAX', anychart.enums.StringToken.DATA_PLOT_X_MAX);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_X_MIN', anychart.enums.StringToken.DATA_PLOT_X_MIN);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_X_SUM', anychart.enums.StringToken.DATA_PLOT_X_SUM);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_AVERAGE', anychart.enums.StringToken.DATA_PLOT_Y_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_MAX', anychart.enums.StringToken.DATA_PLOT_Y_MAX);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_MIN', anychart.enums.StringToken.DATA_PLOT_Y_MIN);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MAX', anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MIN', anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_RANGE_SUM', anychart.enums.StringToken.DATA_PLOT_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.StringToken.DATA_PLOT_Y_SUM', anychart.enums.StringToken.DATA_PLOT_Y_SUM);
goog.exportSymbol('anychart.enums.StringToken.HIGH', anychart.enums.StringToken.HIGH);
goog.exportSymbol('anychart.enums.StringToken.INDEX', anychart.enums.StringToken.INDEX);
goog.exportSymbol('anychart.enums.StringToken.LOW', anychart.enums.StringToken.LOW);
goog.exportSymbol('anychart.enums.StringToken.NAME', anychart.enums.StringToken.NAME);
goog.exportSymbol('anychart.enums.StringToken.OPEN', anychart.enums.StringToken.OPEN);
goog.exportSymbol('anychart.enums.StringToken.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION', anychart.enums.StringToken.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION);
goog.exportSymbol('anychart.enums.StringToken.PERT_CHART_PROJECT_DURATION', anychart.enums.StringToken.PERT_CHART_PROJECT_DURATION);
goog.exportSymbol('anychart.enums.StringToken.RANGE', anychart.enums.StringToken.RANGE);
goog.exportSymbol('anychart.enums.StringToken.RANGE_END', anychart.enums.StringToken.RANGE_END);
goog.exportSymbol('anychart.enums.StringToken.RANGE_START', anychart.enums.StringToken.RANGE_START);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_MAX_SIZE', anychart.enums.StringToken.SERIES_BUBBLE_MAX_SIZE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_MIN_SIZE', anychart.enums.StringToken.SERIES_BUBBLE_MIN_SIZE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_SIZE_AVERAGE', anychart.enums.StringToken.SERIES_BUBBLE_SIZE_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MEDIAN', anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MEDIAN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MODE', anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MODE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_BUBBLE_SIZE_SUM', anychart.enums.StringToken.SERIES_BUBBLE_SIZE_SUM);
goog.exportSymbol('anychart.enums.StringToken.SERIES_FIRST_X_VALUE', anychart.enums.StringToken.SERIES_FIRST_X_VALUE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_FIRST_Y_VALUE', anychart.enums.StringToken.SERIES_FIRST_Y_VALUE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_LAST_X_VALUE', anychart.enums.StringToken.SERIES_LAST_X_VALUE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_LAST_Y_VALUE', anychart.enums.StringToken.SERIES_LAST_Y_VALUE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_MIN', anychart.enums.StringToken.SERIES_MIN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_MAX', anychart.enums.StringToken.SERIES_MAX);
goog.exportSymbol('anychart.enums.StringToken.SERIES_NAME', anychart.enums.StringToken.SERIES_NAME);
goog.exportSymbol('anychart.enums.StringToken.SERIES_POINT_COUNT', anychart.enums.StringToken.SERIES_POINT_COUNT);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_AVERAGE', anychart.enums.StringToken.SERIES_X_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_AXIS_NAME', anychart.enums.StringToken.SERIES_X_AXIS_NAME);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_MAX', anychart.enums.StringToken.SERIES_X_MAX);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_MEDIAN', anychart.enums.StringToken.SERIES_X_MEDIAN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_MIN', anychart.enums.StringToken.SERIES_X_MIN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_MODE', anychart.enums.StringToken.SERIES_X_MODE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_X_SUM', anychart.enums.StringToken.SERIES_X_SUM);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_AVERAGE', anychart.enums.StringToken.SERIES_Y_AVERAGE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_AXIS_NAME', anychart.enums.StringToken.SERIES_Y_AXIS_NAME);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_MAX', anychart.enums.StringToken.SERIES_Y_MAX);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_MEDIAN', anychart.enums.StringToken.SERIES_Y_MEDIAN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_MIN', anychart.enums.StringToken.SERIES_Y_MIN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_MODE', anychart.enums.StringToken.SERIES_Y_MODE);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_RANGE_MAX', anychart.enums.StringToken.SERIES_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_RANGE_MIN', anychart.enums.StringToken.SERIES_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_RANGE_SUM', anychart.enums.StringToken.SERIES_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.StringToken.SERIES_Y_SUM', anychart.enums.StringToken.SERIES_Y_SUM);
goog.exportSymbol('anychart.enums.StringToken.VALUE', anychart.enums.StringToken.VALUE);
goog.exportSymbol('anychart.enums.StringToken.PERCENT_VALUE', anychart.enums.StringToken.PERCENT_VALUE);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_AVERAGE', anychart.enums.StringToken.X_AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_MAX', anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_MIN', anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_SUM', anychart.enums.StringToken.X_AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_MAX', anychart.enums.StringToken.X_AXIS_MAX);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_MEDIAN', anychart.enums.StringToken.X_AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_MIN', anychart.enums.StringToken.X_AXIS_MIN);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_MODE', anychart.enums.StringToken.X_AXIS_MODE);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_NAME', anychart.enums.StringToken.X_AXIS_NAME);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_SCALE_MAX', anychart.enums.StringToken.X_AXIS_SCALE_MAX);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_SCALE_MIN', anychart.enums.StringToken.X_AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.X_AXIS_SUM', anychart.enums.StringToken.X_AXIS_SUM);
goog.exportSymbol('anychart.enums.StringToken.X_PERCENT_OF_SERIES', anychart.enums.StringToken.X_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.StringToken.X_PERCENT_OF_TOTAL', anychart.enums.StringToken.X_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.StringToken.X_VALUE', anychart.enums.StringToken.X_VALUE);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_AVERAGE', anychart.enums.StringToken.Y_AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_MAX', anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_MIN', anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_SUM', anychart.enums.StringToken.Y_AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_MAX', anychart.enums.StringToken.Y_AXIS_MAX);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_MEDIAN', anychart.enums.StringToken.Y_AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_MIN', anychart.enums.StringToken.Y_AXIS_MIN);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_MODE', anychart.enums.StringToken.Y_AXIS_MODE);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_NAME', anychart.enums.StringToken.Y_AXIS_NAME);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_SCALE_MAX', anychart.enums.StringToken.Y_AXIS_SCALE_MAX);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_SCALE_MIN', anychart.enums.StringToken.Y_AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.StringToken.Y_AXIS_SUM', anychart.enums.StringToken.Y_AXIS_SUM);
goog.exportSymbol('anychart.enums.StringToken.Y_PERCENT_OF_CATEGORY', anychart.enums.StringToken.Y_PERCENT_OF_CATEGORY);
goog.exportSymbol('anychart.enums.StringToken.Y_PERCENT_OF_SERIES', anychart.enums.StringToken.Y_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.StringToken.Y_PERCENT_OF_TOTAL', anychart.enums.StringToken.Y_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.StringToken.Y_VALUE', anychart.enums.StringToken.Y_VALUE);
goog.exportSymbol('anychart.enums.StringToken.RESOURCE_INDEX', anychart.enums.StringToken.RESOURCE_INDEX);//7.13.0
goog.exportSymbol('anychart.enums.StringToken.ACTIVITY_INDEX', anychart.enums.StringToken.ACTIVITY_INDEX);//7.13.0
goog.exportSymbol('anychart.enums.StringToken.START', anychart.enums.StringToken.START);//7.13.0
goog.exportSymbol('anychart.enums.StringToken.END', anychart.enums.StringToken.END);//7.13.0
goog.exportSymbol('anychart.enums.StringToken.MINUTES_PER_DAY', anychart.enums.StringToken.MINUTES_PER_DAY);//7.13.0

goog.exportSymbol('anychart.enums.Statistics.AVERAGE', anychart.enums.Statistics.AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_AVERAGE', anychart.enums.Statistics.AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_BUBBLE_SIZE_MAX', anychart.enums.Statistics.AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_BUBBLE_SIZE_MIN', anychart.enums.Statistics.AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_BUBBLE_SIZE_SUM', anychart.enums.Statistics.AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_MAX', anychart.enums.Statistics.AXIS_MAX);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_MEDIAN', anychart.enums.Statistics.AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_MIN', anychart.enums.Statistics.AXIS_MIN);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_MODE', anychart.enums.Statistics.AXIS_MODE);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_NAME', anychart.enums.Statistics.AXIS_NAME);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_SCALE_MAX', anychart.enums.Statistics.AXIS_SCALE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_SCALE_MIN', anychart.enums.Statistics.AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.AXIS_SUM', anychart.enums.Statistics.AXIS_SUM);
goog.exportSymbol('anychart.enums.Statistics.BUBBLE_SIZE', anychart.enums.Statistics.BUBBLE_SIZE);
goog.exportSymbol('anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_CATEGORY', anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_CATEGORY);
goog.exportSymbol('anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_SERIES', anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_TOTAL', anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_NAME', anychart.enums.Statistics.CATEGORY_NAME);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_AVERAGE', anychart.enums.Statistics.CATEGORY_Y_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_MAX', anychart.enums.Statistics.CATEGORY_Y_MAX);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_MEDIAN', anychart.enums.Statistics.CATEGORY_Y_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_MIN', anychart.enums.Statistics.CATEGORY_Y_MIN);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_MODE', anychart.enums.Statistics.CATEGORY_Y_MODE);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_PERCENT_OF_TOTAL', anychart.enums.Statistics.CATEGORY_Y_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_AVERAGE', anychart.enums.Statistics.CATEGORY_Y_RANGE_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX', anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN', anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN', anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE', anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL', anychart.enums.Statistics.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM', anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.Statistics.CATEGORY_Y_SUM', anychart.enums.Statistics.CATEGORY_Y_SUM);
goog.exportSymbol('anychart.enums.Statistics.CLOSE', anychart.enums.Statistics.CLOSE);
goog.exportSymbol('anychart.enums.Statistics.COUNT', anychart.enums.Statistics.COUNT);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_BUBBLE_MAX_SIZE', anychart.enums.Statistics.DATA_PLOT_BUBBLE_MAX_SIZE);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_BUBBLE_MIN_SIZE', anychart.enums.Statistics.DATA_PLOT_BUBBLE_MIN_SIZE);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_AVERAGE', anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM', anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME);
//goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_NAME', anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME);
//goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_NAME', anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME', anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_POINT_COUNT', anychart.enums.Statistics.DATA_PLOT_POINT_COUNT);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT', anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_X_AVERAGE', anychart.enums.Statistics.DATA_PLOT_X_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_X_MAX', anychart.enums.Statistics.DATA_PLOT_X_MAX);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_X_MIN', anychart.enums.Statistics.DATA_PLOT_X_MIN);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_X_SUM', anychart.enums.Statistics.DATA_PLOT_X_SUM);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE', anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_MAX', anychart.enums.Statistics.DATA_PLOT_Y_MAX);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_MIN', anychart.enums.Statistics.DATA_PLOT_Y_MIN);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MAX', anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MIN', anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_RANGE_SUM', anychart.enums.Statistics.DATA_PLOT_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.Statistics.DATA_PLOT_Y_SUM', anychart.enums.Statistics.DATA_PLOT_Y_SUM);
goog.exportSymbol('anychart.enums.Statistics.HIGH', anychart.enums.Statistics.HIGH);
//goog.exportSymbol('anychart.enums.Statistics.ICON', anychart.enums.Statistics.ICON);
goog.exportSymbol('anychart.enums.Statistics.INDEX', anychart.enums.Statistics.INDEX);
goog.exportSymbol('anychart.enums.Statistics.LOW', anychart.enums.Statistics.LOW);
goog.exportSymbol('anychart.enums.Statistics.NAME', anychart.enums.Statistics.NAME);
goog.exportSymbol('anychart.enums.Statistics.MAX', anychart.enums.Statistics.MAX);
goog.exportSymbol('anychart.enums.Statistics.MIN', anychart.enums.Statistics.MIN);
goog.exportSymbol('anychart.enums.Statistics.OPEN', anychart.enums.Statistics.OPEN);
goog.exportSymbol('anychart.enums.Statistics.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION', anychart.enums.Statistics.PERT_CHART_CRITICAL_PATH_STANDARD_DEVIATION);
goog.exportSymbol('anychart.enums.Statistics.PERT_CHART_PROJECT_DURATION', anychart.enums.Statistics.PERT_CHART_PROJECT_DURATION);
goog.exportSymbol('anychart.enums.Statistics.POINTS_COUNT', anychart.enums.Statistics.POINTS_COUNT);
goog.exportSymbol('anychart.enums.Statistics.RANGE', anychart.enums.Statistics.RANGE);
goog.exportSymbol('anychart.enums.Statistics.RANGE_END', anychart.enums.Statistics.RANGE_END);
goog.exportSymbol('anychart.enums.Statistics.RANGE_START', anychart.enums.Statistics.RANGE_START);
goog.exportSymbol('anychart.enums.Statistics.SERIES_AVERAGE', anychart.enums.Statistics.SERIES_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_MAX_SIZE', anychart.enums.Statistics.SERIES_BUBBLE_MAX_SIZE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_MIN_SIZE', anychart.enums.Statistics.SERIES_BUBBLE_MIN_SIZE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_SIZE_AVERAGE', anychart.enums.Statistics.SERIES_BUBBLE_SIZE_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MEDIAN', anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MODE', anychart.enums.Statistics.SERIES_BUBBLE_SIZE_MODE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM', anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM);
goog.exportSymbol('anychart.enums.Statistics.SERIES_FIRST_X_VALUE', anychart.enums.Statistics.SERIES_FIRST_X_VALUE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_FIRST_Y_VALUE', anychart.enums.Statistics.SERIES_FIRST_Y_VALUE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_LAST_X_VALUE', anychart.enums.Statistics.SERIES_LAST_X_VALUE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_LAST_Y_VALUE', anychart.enums.Statistics.SERIES_LAST_Y_VALUE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_MIN', anychart.enums.Statistics.SERIES_MIN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_MAX', anychart.enums.Statistics.SERIES_MAX);
goog.exportSymbol('anychart.enums.Statistics.SERIES_NAME', anychart.enums.Statistics.SERIES_NAME);
goog.exportSymbol('anychart.enums.Statistics.SERIES_POINT_COUNT', anychart.enums.Statistics.SERIES_POINT_COUNT);
goog.exportSymbol('anychart.enums.Statistics.SERIES_POINTS_COUNT', anychart.enums.Statistics.SERIES_POINTS_COUNT);
goog.exportSymbol('anychart.enums.Statistics.SERIES_SUM', anychart.enums.Statistics.SERIES_SUM);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_AVERAGE', anychart.enums.Statistics.SERIES_X_AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.SERIES_X_AXIS_NAME', anychart.enums.Statistics.SERIES_X_AXIS_NAME);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_MAX', anychart.enums.Statistics.SERIES_X_MAX);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_MEDIAN', anychart.enums.Statistics.SERIES_X_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_MIN', anychart.enums.Statistics.SERIES_X_MIN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_MODE', anychart.enums.Statistics.SERIES_X_MODE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_X_SUM', anychart.enums.Statistics.SERIES_X_SUM);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_AVERAGE', anychart.enums.Statistics.SERIES_Y_AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_AXIS_NAME', anychart.enums.Statistics.SERIES_Y_AXIS_NAME);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_MAX', anychart.enums.Statistics.SERIES_Y_MAX);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_MEDIAN', anychart.enums.Statistics.SERIES_Y_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_MIN', anychart.enums.Statistics.SERIES_Y_MIN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_MODE', anychart.enums.Statistics.SERIES_Y_MODE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_AVERAGE', anychart.enums.Statistics.SERIES_Y_RANGE_AVERAGE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_MAX', anychart.enums.Statistics.SERIES_Y_RANGE_MAX);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_MEDIAN', anychart.enums.Statistics.SERIES_Y_RANGE_MEDIAN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_MIN', anychart.enums.Statistics.SERIES_Y_RANGE_MIN);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_MODE', anychart.enums.Statistics.SERIES_Y_RANGE_MODE);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_RANGE_SUM', anychart.enums.Statistics.SERIES_Y_RANGE_SUM);
goog.exportSymbol('anychart.enums.Statistics.SERIES_Y_SUM', anychart.enums.Statistics.SERIES_Y_SUM);
goog.exportSymbol('anychart.enums.Statistics.SUM', anychart.enums.Statistics.SUM);
goog.exportSymbol('anychart.enums.Statistics.VALUE', anychart.enums.Statistics.VALUE);
goog.exportSymbol('anychart.enums.Statistics.PERCENT_VALUE', anychart.enums.Statistics.PERCENT_VALUE);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_AVERAGE', anychart.enums.Statistics.X_AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_MAX', anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_MIN', anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_SUM', anychart.enums.Statistics.X_AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_MAX', anychart.enums.Statistics.X_AXIS_MAX);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_MEDIAN', anychart.enums.Statistics.X_AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_MIN', anychart.enums.Statistics.X_AXIS_MIN);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_MODE', anychart.enums.Statistics.X_AXIS_MODE);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_NAME', anychart.enums.Statistics.X_AXIS_NAME);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_SCALE_MAX', anychart.enums.Statistics.X_AXIS_SCALE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_SCALE_MIN', anychart.enums.Statistics.X_AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.X_AXIS_SUM', anychart.enums.Statistics.X_AXIS_SUM);
goog.exportSymbol('anychart.enums.Statistics.X_PERCENT_OF_SERIES', anychart.enums.Statistics.X_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.Statistics.X_PERCENT_OF_TOTAL', anychart.enums.Statistics.X_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.Statistics.X_VALUE', anychart.enums.Statistics.X_VALUE);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_AVERAGE', anychart.enums.Statistics.Y_AXIS_AVERAGE);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_MAX', anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_MIN', anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_SUM', anychart.enums.Statistics.Y_AXIS_BUBBLE_SIZE_SUM);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_MAX', anychart.enums.Statistics.Y_AXIS_MAX);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_MEDIAN', anychart.enums.Statistics.Y_AXIS_MEDIAN);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_MIN', anychart.enums.Statistics.Y_AXIS_MIN);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_MODE', anychart.enums.Statistics.Y_AXIS_MODE);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_NAME', anychart.enums.Statistics.Y_AXIS_NAME);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_SCALE_MAX', anychart.enums.Statistics.Y_AXIS_SCALE_MAX);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_SCALE_MIN', anychart.enums.Statistics.Y_AXIS_SCALE_MIN);
//goog.exportSymbol('anychart.enums.Statistics.Y_AXIS_SUM', anychart.enums.Statistics.Y_AXIS_SUM);
goog.exportSymbol('anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY', anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY);
goog.exportSymbol('anychart.enums.Statistics.Y_PERCENT_OF_SERIES', anychart.enums.Statistics.Y_PERCENT_OF_SERIES);
goog.exportSymbol('anychart.enums.Statistics.Y_PERCENT_OF_TOTAL', anychart.enums.Statistics.Y_PERCENT_OF_TOTAL);
goog.exportSymbol('anychart.enums.Statistics.Y_VALUE', anychart.enums.Statistics.Y_VALUE);

goog.exportSymbol('anychart.enums.ChartDataExportMode.RAW', anychart.enums.ChartDataExportMode.RAW);
goog.exportSymbol('anychart.enums.ChartDataExportMode.SPECIFIC', anychart.enums.ChartDataExportMode.SPECIFIC);
goog.exportSymbol('anychart.enums.ChartDataExportMode.GROUPED', anychart.enums.ChartDataExportMode.GROUPED);

goog.exportSymbol('anychart.enums.MapSeriesType.CHOROPLETH', anychart.enums.MapSeriesType.CHOROPLETH);
goog.exportSymbol('anychart.enums.MapSeriesType.BUBBLE', anychart.enums.MapSeriesType.BUBBLE);
goog.exportSymbol('anychart.enums.MapSeriesType.MARKER', anychart.enums.MapSeriesType.MARKER);
goog.exportSymbol('anychart.enums.MapSeriesType.CONNECTOR', anychart.enums.MapSeriesType.CONNECTOR);

goog.exportSymbol('anychart.enums.CartesianSeriesType.AREA', anychart.enums.CartesianSeriesType.AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.BAR', anychart.enums.CartesianSeriesType.BAR);
goog.exportSymbol('anychart.enums.CartesianSeriesType.BOX', anychart.enums.CartesianSeriesType.BOX);
goog.exportSymbol('anychart.enums.CartesianSeriesType.BUBBLE', anychart.enums.CartesianSeriesType.BUBBLE);
goog.exportSymbol('anychart.enums.CartesianSeriesType.CANDLESTICK', anychart.enums.CartesianSeriesType.CANDLESTICK);
goog.exportSymbol('anychart.enums.CartesianSeriesType.COLUMN', anychart.enums.CartesianSeriesType.COLUMN);
goog.exportSymbol('anychart.enums.CartesianSeriesType.LINE', anychart.enums.CartesianSeriesType.LINE);
goog.exportSymbol('anychart.enums.CartesianSeriesType.MARKER', anychart.enums.CartesianSeriesType.MARKER);
goog.exportSymbol('anychart.enums.CartesianSeriesType.OHLC', anychart.enums.CartesianSeriesType.OHLC);
goog.exportSymbol('anychart.enums.CartesianSeriesType.RANGE_AREA', anychart.enums.CartesianSeriesType.RANGE_AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.RANGE_BAR', anychart.enums.CartesianSeriesType.RANGE_BAR);
goog.exportSymbol('anychart.enums.CartesianSeriesType.RANGE_COLUMN', anychart.enums.CartesianSeriesType.RANGE_COLUMN);
goog.exportSymbol('anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA', anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.RANGE_STEP_AREA', anychart.enums.CartesianSeriesType.RANGE_STEP_AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.SPLINE', anychart.enums.CartesianSeriesType.SPLINE);
goog.exportSymbol('anychart.enums.CartesianSeriesType.SPLINE_AREA', anychart.enums.CartesianSeriesType.SPLINE_AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.STEP_AREA', anychart.enums.CartesianSeriesType.STEP_AREA);
goog.exportSymbol('anychart.enums.CartesianSeriesType.STEP_LINE', anychart.enums.CartesianSeriesType.STEP_LINE);

goog.exportSymbol('anychart.enums.Cartesian3dSeriesType.AREA', anychart.enums.Cartesian3dSeriesType.AREA);
goog.exportSymbol('anychart.enums.Cartesian3dSeriesType.BAR', anychart.enums.Cartesian3dSeriesType.BAR);
goog.exportSymbol('anychart.enums.Cartesian3dSeriesType.COLUMN', anychart.enums.Cartesian3dSeriesType.COLUMN);

goog.exportSymbol('anychart.enums.ScatterSeriesType.BUBBLE', anychart.enums.ScatterSeriesType.BUBBLE);
goog.exportSymbol('anychart.enums.ScatterSeriesType.LINE', anychart.enums.ScatterSeriesType.LINE);
goog.exportSymbol('anychart.enums.ScatterSeriesType.MARKER', anychart.enums.ScatterSeriesType.MARKER);

goog.exportSymbol('anychart.enums.SparklineSeriesType.AREA', anychart.enums.SparklineSeriesType.AREA);
goog.exportSymbol('anychart.enums.SparklineSeriesType.COLUMN', anychart.enums.SparklineSeriesType.COLUMN);
goog.exportSymbol('anychart.enums.SparklineSeriesType.LINE', anychart.enums.SparklineSeriesType.LINE);
goog.exportSymbol('anychart.enums.SparklineSeriesType.WIN_LOSS', anychart.enums.SparklineSeriesType.WIN_LOSS);

goog.exportSymbol('anychart.enums.StockSeriesType.AREA', anychart.enums.StockSeriesType.AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.CANDLESTICK', anychart.enums.StockSeriesType.CANDLESTICK);
goog.exportSymbol('anychart.enums.StockSeriesType.COLUMN', anychart.enums.StockSeriesType.COLUMN);
goog.exportSymbol('anychart.enums.StockSeriesType.LINE', anychart.enums.StockSeriesType.LINE);
goog.exportSymbol('anychart.enums.StockSeriesType.MARKER', anychart.enums.StockSeriesType.MARKER);
goog.exportSymbol('anychart.enums.StockSeriesType.OHLC', anychart.enums.StockSeriesType.OHLC);
goog.exportSymbol('anychart.enums.StockSeriesType.RANGE_AREA', anychart.enums.StockSeriesType.RANGE_AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.RANGE_COLUMN', anychart.enums.StockSeriesType.RANGE_COLUMN);
goog.exportSymbol('anychart.enums.StockSeriesType.RANGE_SPLINE_AREA', anychart.enums.StockSeriesType.RANGE_SPLINE_AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.RANGE_STEP_AREA', anychart.enums.StockSeriesType.RANGE_STEP_AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.SPLINE', anychart.enums.StockSeriesType.SPLINE);
goog.exportSymbol('anychart.enums.StockSeriesType.SPLINE_AREA', anychart.enums.StockSeriesType.SPLINE_AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.STEP_AREA', anychart.enums.StockSeriesType.STEP_AREA);
goog.exportSymbol('anychart.enums.StockSeriesType.STEP_LINE', anychart.enums.StockSeriesType.STEP_LINE);

goog.exportSymbol('anychart.enums.MovingAverageType.SMA', anychart.enums.MovingAverageType.SMA);
goog.exportSymbol('anychart.enums.MovingAverageType.EMA', anychart.enums.MovingAverageType.EMA);

goog.exportSymbol('anychart.enums.RadarSeriesType.AREA', anychart.enums.RadarSeriesType.AREA);
goog.exportSymbol('anychart.enums.RadarSeriesType.LINE', anychart.enums.RadarSeriesType.LINE);
goog.exportSymbol('anychart.enums.RadarSeriesType.MARKER', anychart.enums.RadarSeriesType.MARKER);

goog.exportSymbol('anychart.enums.PolarSeriesType.AREA', anychart.enums.PolarSeriesType.AREA);
goog.exportSymbol('anychart.enums.PolarSeriesType.LINE', anychart.enums.PolarSeriesType.LINE);
goog.exportSymbol('anychart.enums.PolarSeriesType.MARKER', anychart.enums.PolarSeriesType.MARKER);

goog.exportSymbol('anychart.enums.MilestoneShape.CIRCLE', anychart.enums.MilestoneShape.CIRCLE);
goog.exportSymbol('anychart.enums.MilestoneShape.RHOMBUS', anychart.enums.MilestoneShape.RHOMBUS);
goog.exportSymbol('anychart.enums.MilestoneShape.RECTANGLE', anychart.enums.MilestoneShape.RECTANGLE);

goog.exportSymbol('anychart.enums.AnnotationTypes.RAY', anychart.enums.AnnotationTypes.RAY);
goog.exportSymbol('anychart.enums.AnnotationTypes.LINE', anychart.enums.AnnotationTypes.LINE);
goog.exportSymbol('anychart.enums.AnnotationTypes.INFINITE_LINE', anychart.enums.AnnotationTypes.INFINITE_LINE);
goog.exportSymbol('anychart.enums.AnnotationTypes.VERTICAL_LINE', anychart.enums.AnnotationTypes.VERTICAL_LINE);
goog.exportSymbol('anychart.enums.AnnotationTypes.HORIZONTAL_LINE', anychart.enums.AnnotationTypes.HORIZONTAL_LINE);
goog.exportSymbol('anychart.enums.AnnotationTypes.RECTANGLE', anychart.enums.AnnotationTypes.RECTANGLE);
goog.exportSymbol('anychart.enums.AnnotationTypes.ELLIPSE', anychart.enums.AnnotationTypes.ELLIPSE);
goog.exportSymbol('anychart.enums.AnnotationTypes.TRIANGLE', anychart.enums.AnnotationTypes.TRIANGLE);
goog.exportSymbol('anychart.enums.AnnotationTypes.TREND_CHANNEL', anychart.enums.AnnotationTypes.TREND_CHANNEL);
goog.exportSymbol('anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK', anychart.enums.AnnotationTypes.ANDREWS_PITCHFORK);
goog.exportSymbol('anychart.enums.AnnotationTypes.FIBONACCI_FAN', anychart.enums.AnnotationTypes.FIBONACCI_FAN);
goog.exportSymbol('anychart.enums.AnnotationTypes.FIBONACCI_ARC', anychart.enums.AnnotationTypes.FIBONACCI_ARC);
goog.exportSymbol('anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT', anychart.enums.AnnotationTypes.FIBONACCI_RETRACEMENT);
goog.exportSymbol('anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES', anychart.enums.AnnotationTypes.FIBONACCI_TIMEZONES);
goog.exportSymbol('anychart.enums.AnnotationTypes.MARKER', anychart.enums.AnnotationTypes.MARKER);

goog.exportSymbol('anychart.enums.A11yMode.CHART_ELEMENTS', anychart.enums.A11yMode.CHART_ELEMENTS);
goog.exportSymbol('anychart.enums.A11yMode.DATA_TABLE', anychart.enums.A11yMode.DATA_TABLE);

goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR', anychart.enums.LocaleDateTimeFormat.YEAR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_SEMESTER', anychart.enums.LocaleDateTimeFormat.YEAR_SEMESTER);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_QUARTER', anychart.enums.LocaleDateTimeFormat.YEAR_QUARTER);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_MONTH', anychart.enums.LocaleDateTimeFormat.YEAR_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_THIRD_OF_MONTH', anychart.enums.LocaleDateTimeFormat.YEAR_THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_WEEK', anychart.enums.LocaleDateTimeFormat.YEAR_WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_DAY', anychart.enums.LocaleDateTimeFormat.YEAR_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_HOUR', anychart.enums.LocaleDateTimeFormat.YEAR_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_MINUTE', anychart.enums.LocaleDateTimeFormat.YEAR_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_SECOND', anychart.enums.LocaleDateTimeFormat.YEAR_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.YEAR_MILLISECOND', anychart.enums.LocaleDateTimeFormat.YEAR_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER', anychart.enums.LocaleDateTimeFormat.SEMESTER);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_QUARTER', anychart.enums.LocaleDateTimeFormat.SEMESTER_QUARTER);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_MONTH', anychart.enums.LocaleDateTimeFormat.SEMESTER_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_THIRD_OF_MONTH', anychart.enums.LocaleDateTimeFormat.SEMESTER_THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_WEEK', anychart.enums.LocaleDateTimeFormat.SEMESTER_WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_DAY', anychart.enums.LocaleDateTimeFormat.SEMESTER_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_HOUR', anychart.enums.LocaleDateTimeFormat.SEMESTER_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_MINUTE', anychart.enums.LocaleDateTimeFormat.SEMESTER_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_SECOND', anychart.enums.LocaleDateTimeFormat.SEMESTER_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SEMESTER_MILLISECOND', anychart.enums.LocaleDateTimeFormat.SEMESTER_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER', anychart.enums.LocaleDateTimeFormat.QUARTER);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_MONTH', anychart.enums.LocaleDateTimeFormat.QUARTER_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_THIRD_OF_MONTH', anychart.enums.LocaleDateTimeFormat.QUARTER_THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_WEEK', anychart.enums.LocaleDateTimeFormat.QUARTER_WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_DAY', anychart.enums.LocaleDateTimeFormat.QUARTER_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_HOUR', anychart.enums.LocaleDateTimeFormat.QUARTER_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_MINUTE', anychart.enums.LocaleDateTimeFormat.QUARTER_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_SECOND', anychart.enums.LocaleDateTimeFormat.QUARTER_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.QUARTER_MILLISECOND', anychart.enums.LocaleDateTimeFormat.QUARTER_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH', anychart.enums.LocaleDateTimeFormat.MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_THIRD_OF_MONTH', anychart.enums.LocaleDateTimeFormat.MONTH_THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_WEEK', anychart.enums.LocaleDateTimeFormat.MONTH_WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_DAY', anychart.enums.LocaleDateTimeFormat.MONTH_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_HOUR', anychart.enums.LocaleDateTimeFormat.MONTH_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_MINUTE', anychart.enums.LocaleDateTimeFormat.MONTH_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_SECOND', anychart.enums.LocaleDateTimeFormat.MONTH_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MONTH_MILLISECOND', anychart.enums.LocaleDateTimeFormat.MONTH_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_WEEK', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_DAY', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_HOUR', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_MINUTE', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_SECOND', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_MILLISECOND', anychart.enums.LocaleDateTimeFormat.THIRD_OF_MONTH_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK', anychart.enums.LocaleDateTimeFormat.WEEK);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK_DAY', anychart.enums.LocaleDateTimeFormat.WEEK_DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK_HOUR', anychart.enums.LocaleDateTimeFormat.WEEK_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK_MINUTE', anychart.enums.LocaleDateTimeFormat.WEEK_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK_SECOND', anychart.enums.LocaleDateTimeFormat.WEEK_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.WEEK_MILLISECOND', anychart.enums.LocaleDateTimeFormat.WEEK_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.DAY', anychart.enums.LocaleDateTimeFormat.DAY);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.DAY_HOUR', anychart.enums.LocaleDateTimeFormat.DAY_HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.DAY_MINUTE', anychart.enums.LocaleDateTimeFormat.DAY_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.DAY_SECOND', anychart.enums.LocaleDateTimeFormat.DAY_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.DAY_MILLISECOND', anychart.enums.LocaleDateTimeFormat.DAY_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.HOUR', anychart.enums.LocaleDateTimeFormat.HOUR);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.HOUR_MINUTE', anychart.enums.LocaleDateTimeFormat.HOUR_MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.HOUR_SECOND', anychart.enums.LocaleDateTimeFormat.HOUR_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.HOUR_MILLISECOND', anychart.enums.LocaleDateTimeFormat.HOUR_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MINUTE', anychart.enums.LocaleDateTimeFormat.MINUTE);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MINUTE_SECOND', anychart.enums.LocaleDateTimeFormat.MINUTE_SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MINUTE_MILLISECOND', anychart.enums.LocaleDateTimeFormat.MINUTE_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SECOND', anychart.enums.LocaleDateTimeFormat.SECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.SECOND_MILLISECOND', anychart.enums.LocaleDateTimeFormat.SECOND_MILLISECOND);
goog.exportSymbol('anychart.enums.LocaleDateTimeFormat.MILLISECOND', anychart.enums.LocaleDateTimeFormat.MILLISECOND);

goog.exportSymbol('anychart.enums.IntervalFormatPrefix.NONE', anychart.enums.IntervalFormatPrefix.NONE);
goog.exportSymbol('anychart.enums.IntervalFormatPrefix.FULL', anychart.enums.IntervalFormatPrefix.FULL);

goog.exportSymbol('anychart.enums.AvailabilityPeriod.YEAR', anychart.enums.AvailabilityPeriod.YEAR);
goog.exportSymbol('anychart.enums.AvailabilityPeriod.WEEK', anychart.enums.AvailabilityPeriod.WEEK);
goog.exportSymbol('anychart.enums.AvailabilityPeriod.DAY', anychart.enums.AvailabilityPeriod.DAY);
goog.exportSymbol('anychart.enums.AvailabilityPeriod.NONE', anychart.enums.AvailabilityPeriod.NONE);

goog.exportSymbol('anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART', anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART);
goog.exportSymbol('anychart.enums.TimeTrackingMode.AVAILABILITY_PER_RESOURCE', anychart.enums.TimeTrackingMode.AVAILABILITY_PER_RESOURCE);
goog.exportSymbol('anychart.enums.TimeTrackingMode.ACTIVITY_PER_CHART', anychart.enums.TimeTrackingMode.ACTIVITY_PER_CHART);
goog.exportSymbol('anychart.enums.TimeTrackingMode.ACTIVITY_PER_RESOURCE', anychart.enums.TimeTrackingMode.ACTIVITY_PER_RESOURCE);


goog.exportSymbol('anychart.enums.ShapeType.PATH', anychart.enums.ShapeType.PATH);
goog.exportSymbol('anychart.enums.ShapeType.CIRCLE', anychart.enums.ShapeType.CIRCLE);
goog.exportSymbol('anychart.enums.ShapeType.ELLIPSE', anychart.enums.ShapeType.ELLIPSE);
goog.exportSymbol('anychart.enums.ShapeType.RECT', anychart.enums.ShapeType.RECT);

goog.exportSymbol('anychart.enums.FontStyle.NORMAL', anychart.enums.FontStyle.NORMAL);
goog.exportSymbol('anychart.enums.FontStyle.ITALIC', anychart.enums.FontStyle.ITALIC);
goog.exportSymbol('anychart.enums.FontStyle.OBLIQUE', anychart.enums.FontStyle.OBLIQUE);

goog.exportSymbol('anychart.enums.FontVariant.NORMAL', anychart.enums.FontVariant.NORMAL);
goog.exportSymbol('anychart.enums.FontVariant.SMALL_CAP', anychart.enums.FontVariant.SMALL_CAP);

goog.exportSymbol('anychart.enums.HAlign.LEFT', anychart.enums.HAlign.LEFT);
goog.exportSymbol('anychart.enums.HAlign.START', anychart.enums.HAlign.START);
goog.exportSymbol('anychart.enums.HAlign.CENTER', anychart.enums.HAlign.CENTER);
goog.exportSymbol('anychart.enums.HAlign.END', anychart.enums.HAlign.END);
goog.exportSymbol('anychart.enums.HAlign.RIGHT', anychart.enums.HAlign.RIGHT);

goog.exportSymbol('anychart.enums.VAlign.TOP', anychart.enums.VAlign.TOP);
goog.exportSymbol('anychart.enums.VAlign.MIDDLE', anychart.enums.VAlign.MIDDLE);
goog.exportSymbol('anychart.enums.VAlign.BOTTOM', anychart.enums.VAlign.BOTTOM);

goog.exportSymbol('anychart.enums.TextWrap.NO_WRAP', anychart.enums.TextWrap.NO_WRAP);
goog.exportSymbol('anychart.enums.TextWrap.BY_LETTER', anychart.enums.TextWrap.BY_LETTER);





