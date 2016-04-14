goog.provide('anychart.enums');
goog.require('acgraph');
goog.require('acgraph.vector.primitives');


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
  GANTT_RESOURCE: 'ganttResource',
  GANTT_PROJECT: 'ganttProject',
  LINE: 'line',
  MARKER: 'marker',
  PIE: 'pie',
  PIE_3D: 'pie3d',
  POLAR: 'polar',
  PYRAMID: 'pyramid',
  RADAR: 'radar',
  SCATTER: 'scatter',
  STOCK: 'stock',
  SPARKLINE: 'sparkline',
  HEAT_MAP: 'heatMap'
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
  CIRCULAR: 'circular'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Maps types enum
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gauge types.
 * @enum {string}
 */
anychart.enums.MapTypes = {
  MAP: 'map',
  CHOROPLETH: 'choropleth',
  BUBBLE: 'bubble',
  MARKER: 'marker',
  CONNECTOR: 'connector'
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
anychart.enums.Cursor = acgraph.vector.Cursor;


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
anychart.enums.Anchor = acgraph.vector.Anchor;


/**
 * Normalizes anchor to an anychart.enums.Anchor instance.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.Anchor=} opt_default Default value, if input cannot be recognized. Defaults to LEFT_TOP.
 * @return {anychart.enums.Anchor}
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
  }
  return opt_default || anychart.enums.Anchor.LEFT_TOP;
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
anychart.enums.Position = anychart.enums.Anchor;


/**
 * Normalizes position to an anychart.enums.Position instance.
 * @param {*} value Input to normalize.
 * @param {anychart.enums.Position=} opt_default Default value, if input cannot be recognized. Defaults to LEFT_TOP.
 * @return {anychart.enums.Position}
 */
anychart.enums.normalizePosition = function(value, opt_default) {
  return /** @type {anychart.enums.Position} */(anychart.enums.normalizeAnchor(value, opt_default));
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
    case 'top':
    case 't':
    case 'up':
    case 'u':
      return anychart.enums.Orientation.TOP;
    case 'right':
    case 'r':
      return anychart.enums.Orientation.RIGHT;
    case 'bottom':
    case 'b':
    case 'down':
    case 'd':
      return anychart.enums.Orientation.BOTTOM;
    case 'left':
    case 'l':
      return anychart.enums.Orientation.LEFT;
  }
  return opt_default || anychart.enums.Orientation.TOP;
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
  ARROWHEAD: 'arrowhead'
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
  }
  return null;
};


/**
 * @type {Array.<number>}
 */
anychart.enums.PENTAGON_COS = [
  1 + Math.cos((2 / 5 - .5) * Math.PI),
  1 + Math.cos((4 / 5 - .5) * Math.PI),
  1 + Math.cos((6 / 5 - .5) * Math.PI),
  1 + Math.cos((8 / 5 - .5) * Math.PI),
  1 + Math.cos(1.5 * Math.PI)];


/**
 * @type {Array.<number>}
 */
anychart.enums.PENTAGON_SIN = [
  1 + Math.sin((2 / 5 - .5) * Math.PI),
  1 + Math.sin((4 / 5 - .5) * Math.PI),
  1 + Math.sin((6 / 5 - .5) * Math.PI),
  1 + Math.sin((8 / 5 - .5) * Math.PI),
  1 + Math.sin(1.5 * Math.PI)];


/**
 * Method to get marker drawer.
 * @param {*} type Marker type.
 * @return {function(!acgraph.vector.Path, number, number, number):!acgraph.vector.Path} Marker drawer.
 */
anychart.enums.getMarkerDrawer = function(type) {
  type = (String(type)).toLowerCase();
  switch (type) {
    case 'arrowhead':
      return function(path, x, y, radius) {
        var p1x = x + radius / 2;
        var p1y = y;
        var p2x = x - radius / 2;
        var p2y = y - radius / 3;
        var p3x = x - radius / 2;
        var p3y = y + radius / 3;

        path
            .moveTo(p1x, p1y)
            .lineTo(p2x, p2y)
            .lineTo(p3x, p3y)
            .close();

        return path;
      };
    case 'star4':
      return acgraph.vector.primitives.star4;
    case 'star6':
      return acgraph.vector.primitives.star6;
    case 'star7':
      return acgraph.vector.primitives.star7;
    case 'star10':
      return acgraph.vector.primitives.star10;
    case 'diamond':
      return acgraph.vector.primitives.diamond;
    case 'triangleup':
      return acgraph.vector.primitives.triangleUp;
    case 'triangledown':
      return acgraph.vector.primitives.triangleDown;
    case 'cross':
      return acgraph.vector.primitives.cross;
    case 'diagonalcross':
      return acgraph.vector.primitives.diagonalCross;
    case 'circle':
      return function(path, x, y, radius) {
        return acgraph.vector.primitives.pie(path, x, y, radius, 0, 360);
      };
    case 'trapezium':
      return function(path, x, y, radius) {
        var d = radius / 3;
        var halfW = radius / 2;
        var halfL = radius / 2;
        var left = x - halfW;
        var top = y - halfL;

        path.moveTo(left + d, top + radius);
        path.lineTo(left + radius - d, top + radius);
        path.lineTo(left + radius, top);
        path.lineTo(left, top);
        path.close();

        return path;
      };
    case 'pentagon':
      return function(path, x, y, radius) {
        x -= radius;
        y -= radius;
        var pentagonCos = anychart.enums.PENTAGON_COS;
        var pentagonSin = anychart.enums.PENTAGON_SIN;
        path.moveTo(x + radius * pentagonCos[0], y + radius * pentagonSin[0]);
        for (var i = 1; i < 5; i++)
          path.lineTo(x + radius * pentagonCos[i], y + radius * pentagonSin[i]);
        path.lineTo(x + radius * pentagonCos[0], y + radius * pentagonSin[0]);
        path.close();

        return path;
      };
    case 'square':
      return function(path, x, y, size) {
        var left = x - size;
        var top = y - size;
        var right = left + size * 2;
        var bottom = top + size * 2;

        path
            .moveTo(left, top)
            .lineTo(right, top)
            .lineTo(right, bottom)
            .lineTo(left, bottom)
            .lineTo(left, top)
            .close();

        return path;
      };
    case 'line':
      return function(path, x, y, size) {
        var height = size * 2;
        var width = height / 2;

        var halfW = width / 2;
        var halfL = height / 2;

        var left = x - halfW;
        var top = y - halfL;
        var right = left + width;
        var bottom = top + height;

        path
            .moveTo(left, top)
            .lineTo(right, top)
            .lineTo(right, bottom)
            .lineTo(left, bottom)
            .lineTo(left, top)
            .close();

        return path;
      };
    default:
      return acgraph.vector.primitives.star5;
  }
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
  AREA: 'area',
  BAR: 'bar',
  BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  MARKER: 'marker',
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
  SQUARE: 'square'
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

  LEGEND_ITEM_MOUSE_OUT: 'legenditemmouseout',
  LEGEND_ITEM_MOUSE_OVER: 'legenditemmouseover',
  LEGEND_ITEM_MOUSE_MOVE: 'legenditemmousemove',
  LEGEND_ITEM_MOUSE_DOWN: 'legenditemmousedown',
  LEGEND_ITEM_MOUSE_UP: 'legenditemmouseup',
  LEGEND_ITEM_CLICK: 'legenditemclick',
  LEGEND_ITEM_DBLCLICK: 'legenditemdblclick',

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

  //Data tree CRUD events.
  TREE_ITEM_MOVE: 'treeItemMove',
  TREE_ITEM_UPDATE: 'treeItemUpdate',
  TREE_ITEM_CREATE: 'treeItemCreate',
  TREE_ITEM_REMOVE: 'treeItemRemove'
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
  STEP_LINE: 'stepLine'
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
  //AREA: 'area',
  //BAR: 'bar',
  //BOX: 'box',
  //BUBBLE: 'bubble',
  //CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  //MARKER: 'marker',
  OHLC: 'ohlc'
  //RANGE_AREA: 'rangeArea',
  //RANGE_BAR: 'rangeBar',
  //RANGE_COLUMN: 'rangeColumn',
  //RANGE_SPLINE_AREA: 'rangeSplineArea',
  //RANGE_STEP_AREA: 'rangeStepArea',
  //SPLINE: 'spline',
  //SPLINE_AREA: 'splineArea',
  //STEP_AREA: 'stepArea',
  //STEP_LINE: 'stepLine'
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
    case 'column':
      return anychart.enums.StockSeriesType.COLUMN;
    case 'line':
      return anychart.enums.StockSeriesType.LINE;
    case 'ohlc':
      return anychart.enums.StockSeriesType.OHLC;
  }
  return opt_default || anychart.enums.StockSeriesType.LINE;
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
  CONNECT_TO: 'connectTo',
  CONNECTOR_TYPE: 'connectorType',
  START_MARKER: 'startMarker',
  END_MARKER: 'endMarker',
  LABEL: 'label',
  MARKERS: 'markers'
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
anychart.enums.CsvMode = {
  RAW: 'raw',
  SPECIFIC: 'specific',
  GROUPED: 'grouped'
};


/**
 * Normalizes csv mode.
 * By default normalizes as SPECIFIC.
 * @param {string=} opt_value
 * @return {anychart.enums.CsvMode} Normalized csv mode.
 */
anychart.enums.normalizeCsvMode = function(opt_value) {
  opt_value = (String(opt_value)).toLowerCase();

  switch (opt_value) {
    case 'raw':
      return anychart.enums.CsvMode.RAW;
    case 'specific':
      return anychart.enums.CsvMode.SPECIFIC;
    case 'grouped':
      return anychart.enums.CsvMode.GROUPED;
  }

  return anychart.enums.CsvMode.SPECIFIC;
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

  NO_LEGEND_IN_STOCK: 51,

  CSV_DOUBLE_QUOTE_IN_SEPARATOR: 100,

  CSV_PARSING_FAILED: 101,

  TABLE_MAPPING_DIFFERENT_TABLE: 200,
  TABLE_FIELD_NAME_DUPLICATE: 201,
  TABLE_COMPUTER_OUTPUT_FIELD_DUPLICATE: 202
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

  BULLET_CHART_OUT_OF_RANGE: 10,

  GANTT_FIT_TO_TASK: 11,

  SERIES_DOESNT_SUPPORT_ERROR: 12,

  TOOLBAR_CONTAINER: 13,
  TOOLBAR_METHOD_IS_NOT_DEFINED: 14,
  TOOLBAR_CHART_IS_NOT_SET: 15,

  SCALE_TYPE_NOT_SUPPORTED: 16,

  DATA_ITEM_SET_PATH: 17,

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
///**
// * Returns human readable
// * @param {anychart.enums.Interval} value
// * @return {string}
// */
//anychart.enums.denormalizeInterval = function(value) {
//  switch (value) {
//    case anychart.enums.Interval.YEAR:
//      return 'years';
//    case anychart.enums.Interval.MONTH:
//      return 'months';
//    case anychart.enums.Interval.DAY:
//      return 'days';
//    case anychart.enums.Interval.HOUR:
//      return 'hours';
//    case anychart.enums.Interval.MINUTE:
//      return 'minutes';
//    case anychart.enums.Interval.SECOND:
//      return 'seconds';
//    case anychart.enums.Interval.MILLISECOND:
//      return 'milliseconds';
//  }
//  return 'unknown';
//};


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
 * @param {anychart.enums.Interval=} opt_default Custom default value (defaults to YEARS).
 * @return {anychart.enums.Interval}
 */
anychart.enums.normalizeInterval = function(value, opt_default) {
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
      return anychart.enums.Interval.HOUR;
    case 'minutes':
    case 'minute':
    case 'min':
    case 'n':
      return anychart.enums.Interval.MINUTE;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return anychart.enums.Interval.SECOND;
    case 'milliseconds':
    case 'millisecond':
    case 'millis':
    case 'milli':
    case 'ms':
      return anychart.enums.Interval.MILLISECOND;
  }
  return opt_default || anychart.enums.Interval.YEAR;
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
anychart.enums.HAlign = acgraph.vector.Text.HAlign;


/**
 * Normalizes HAlign enum.
 * @param {*} value
 * @return {acgraph.vector.Text.HAlign}
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
anychart.enums.VAlign = acgraph.vector.Text.VAlign;


/**
 * Normalizes VAlign enum.
 * @param {*} value
 * @return {acgraph.vector.Text.VAlign}
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
anychart.enums.TextDecoration = acgraph.vector.Text.Decoration;


/**
 * Normalizes font decoration.
 * @param {*} value
 * @return {acgraph.vector.Text.Decoration}
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
anychart.enums.FontStyle = acgraph.vector.Text.FontStyle;


/**
 * Normalizes font style.
 * @param {*} value
 * @return {acgraph.vector.Text.FontStyle}
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
anychart.enums.FontVariant = acgraph.vector.Text.FontVariant;


/**
 * Normalizes font variant.
 * @param {*} value
 * @return {acgraph.vector.Text.FontVariant}
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
anychart.enums.TextDirection = acgraph.vector.Text.Direction;


/**
 * Normalizes text direction.
 * @param {*} value
 * @return {acgraph.vector.Text.Direction}
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
anychart.enums.TextWrap = acgraph.vector.Text.TextWrap;


/**
 * Normalizes font style.
 * @param {*} value
 * @return {acgraph.vector.Text.TextWrap}
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
  DATA_CHANGE: 'dataUpdate'
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
 * Token types enum.
 * @enum {string}
 */
anychart.enums.TokenType = {
  UNKNOWN: '',
  NUMBER: 'number',
  STRING: 'string',
  DATE_TIME: 'datetime'
};


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
goog.exportSymbol('anychart.enums.EventType.POINT_HOVER', anychart.enums.EventType.POINT_HOVER);
goog.exportSymbol('anychart.enums.EventType.POINTS_SELECT', anychart.enums.EventType.POINTS_SELECT);
goog.exportSymbol('anychart.enums.EventType.POINTS_HOVER', anychart.enums.EventType.POINTS_HOVER);
goog.exportSymbol('anychart.enums.EventType.DRILL_CHANGE', anychart.enums.EventType.DRILL_CHANGE);
goog.exportSymbol('anychart.enums.EventType.CHART_DRAW', anychart.enums.EventType.CHART_DRAW);
goog.exportSymbol('anychart.enums.EventType.ANIMATION_START', anychart.enums.EventType.ANIMATION_START);
goog.exportSymbol('anychart.enums.EventType.ANIMATION_END', anychart.enums.EventType.ANIMATION_END);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE', anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_DOWN', anychart.enums.EventType.LEGEND_ITEM_MOUSE_DOWN);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_UP', anychart.enums.EventType.LEGEND_ITEM_MOUSE_UP);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_CLICK', anychart.enums.EventType.LEGEND_ITEM_CLICK);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_DBLCLICK', anychart.enums.EventType.LEGEND_ITEM_DBLCLICK);
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
goog.exportSymbol('anychart.enums.EventType.ROW_COLLAPSE_EXPAND', anychart.enums.EventType.ROW_COLLAPSE_EXPAND);
goog.exportSymbol('anychart.enums.EventType.BEFORE_CREATE_CONNECTOR', anychart.enums.EventType.BEFORE_CREATE_CONNECTOR);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_CREATE', anychart.enums.EventType.TREE_ITEM_CREATE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_MOVE', anychart.enums.EventType.TREE_ITEM_MOVE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_REMOVE', anychart.enums.EventType.TREE_ITEM_REMOVE);
goog.exportSymbol('anychart.enums.EventType.TREE_ITEM_UPDATE', anychart.enums.EventType.TREE_ITEM_UPDATE);

goog.exportSymbol('anychart.enums.ScaleStackMode.NONE', anychart.enums.ScaleStackMode.NONE);
goog.exportSymbol('anychart.enums.ScaleStackMode.VALUE', anychart.enums.ScaleStackMode.VALUE);
goog.exportSymbol('anychart.enums.ScaleStackMode.PERCENT', anychart.enums.ScaleStackMode.PERCENT);

goog.exportSymbol('anychart.enums.ScatterTicksMode.LINEAR', anychart.enums.ScatterTicksMode.LINEAR);
goog.exportSymbol('anychart.enums.ScatterTicksMode.LOGARITHMIC', anychart.enums.ScatterTicksMode.LOGARITHMIC);

goog.exportSymbol('anychart.enums.SparklineSeriesType.AREA', anychart.enums.SparklineSeriesType.AREA);
goog.exportSymbol('anychart.enums.SparklineSeriesType.LINE', anychart.enums.SparklineSeriesType.LINE);
goog.exportSymbol('anychart.enums.SparklineSeriesType.COLUMN', anychart.enums.SparklineSeriesType.COLUMN);
goog.exportSymbol('anychart.enums.SparklineSeriesType.WIN_LOSS', anychart.enums.SparklineSeriesType.WIN_LOSS);

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

goog.exportSymbol('anychart.enums.Interval.YEARS', anychart.enums.Interval.YEAR);//deprecated since >7.6.0
goog.exportSymbol('anychart.enums.Interval.MONTHS', anychart.enums.Interval.MONTH);//deprecated since >7.6.0
goog.exportSymbol('anychart.enums.Interval.DAYS', anychart.enums.Interval.DAY);//deprecated since >7.6.0
goog.exportSymbol('anychart.enums.Interval.HOURS', anychart.enums.Interval.HOUR);//deprecated since >7.6.0
goog.exportSymbol('anychart.enums.Interval.MINUTES', anychart.enums.Interval.MINUTE);//deprecated since >7.6.0
goog.exportSymbol('anychart.enums.Interval.SECONDS', anychart.enums.Interval.SECOND);//deprecated since >7.6.0

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

goog.exportSymbol('anychart.enums.TableSearchMode.EXACT_OR_PREV', anychart.enums.TableSearchMode.EXACT_OR_PREV);
goog.exportSymbol('anychart.enums.TableSearchMode.EXACT', anychart.enums.TableSearchMode.EXACT);
goog.exportSymbol('anychart.enums.TableSearchMode.EXACT_OR_NEXT', anychart.enums.TableSearchMode.EXACT_OR_NEXT);
goog.exportSymbol('anychart.enums.TableSearchMode.NEAREST', anychart.enums.TableSearchMode.NEAREST);

goog.exportSymbol('anychart.enums.ChartScrollerPosition.AFTER_AXES', anychart.enums.ChartScrollerPosition.AFTER_AXES);
goog.exportSymbol('anychart.enums.ChartScrollerPosition.BEFORE_AXES', anychart.enums.ChartScrollerPosition.BEFORE_AXES);

goog.exportSymbol('anychart.enums.LabelsDisplayMode.ALWAYS_SHOW', anychart.enums.LabelsDisplayMode.ALWAYS_SHOW);
goog.exportSymbol('anychart.enums.LabelsDisplayMode.DROP', anychart.enums.LabelsDisplayMode.DROP);
goog.exportSymbol('anychart.enums.LabelsDisplayMode.CLIP', anychart.enums.LabelsDisplayMode.CLIP);

goog.exportSymbol('anychart.enums.TokenType.UNKNOWN', anychart.enums.TokenType.UNKNOWN);
goog.exportSymbol('anychart.enums.TokenType.NUMBER', anychart.enums.TokenType.NUMBER);
goog.exportSymbol('anychart.enums.TokenType.STRING', anychart.enums.TokenType.STRING);
goog.exportSymbol('anychart.enums.TokenType.DATE_TIME', anychart.enums.TokenType.DATE_TIME);

goog.exportSymbol('anychart.enums.CsvMode.RAW', anychart.enums.CsvMode.RAW);
goog.exportSymbol('anychart.enums.CsvMode.SPECIFIC', anychart.enums.CsvMode.SPECIFIC);
goog.exportSymbol('anychart.enums.CsvMode.GROUPED', anychart.enums.CsvMode.GROUPED);
