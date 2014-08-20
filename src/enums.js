goog.provide('anychart.enums');
goog.require('acgraph');


/**
 @namespace
 @name anychart.enums
 */


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
  STAR10: 'star10'
};


/**
 * Method to get marker drawer.
 * @param {*} type Marker type.
 * @return {function(!acgraph.vector.Path, number, number, number):acgraph.vector.Path} Marker drawer.
 */
anychart.enums.getMarkerDrawer = function(type) {
  type = (String(type)).toLowerCase();
  switch (type) {
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
  VALUE: 'value',
  RANGE: 'range',
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
  NO_OVERLAP: 'nooverlap',
  /**
   * Allows labels to overlap.
   */
  ALLOW_OVERLAP: 'allowoverlap'
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
  ROUND_INNER: 'roundinner'
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


//----------------------------------------------------------------------------------------------------------------------
//
//  TextMarkerAlign
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets marker position relative to an axis
 * @enum {string}
 */
anychart.enums.TextMarkerAlign = {
  NEAR: 'near',
  CENTER: 'center',
  FAR: 'far'
};


/**
 * Normalizes user input align to its enumeration values. Also accepts 'middle' and null. Defaults to opt_default or
 * 'center'.
 *
 * @param {*} value Align to normalize.
 * @param {anychart.enums.TextMarkerAlign=} opt_default Default align.
 * @return {anychart.enums.TextMarkerAlign} Normalized align.
 */
anychart.enums.normalizeTextMarkerAlign = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'near':
    case 'n':
      return anychart.enums.TextMarkerAlign.NEAR;
    case 'far':
    case 'f':
      return anychart.enums.TextMarkerAlign.FAR;
    case 'center':
    case 'c':
    case 'middle':
    case 'm':
      return anychart.enums.TextMarkerAlign.CENTER;
  }
  return opt_default || anychart.enums.TextMarkerAlign.CENTER;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  TicksPosition
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Ticks position (inside ot outside).
 * @enum {string}
 */
anychart.enums.TicksPosition = {
  /**
   * Inside a chart, no matter where an axis is.
   */
  INSIDE: 'inside',
  /**
   * Outside of a chart, no matter where an axis is.
   */
  OUTSIDE: 'outside'
};


/**
 * Normalizes ticks position
 * @param {*} value Ticks position to normalize.
 * @param {anychart.enums.TicksPosition=} opt_default Custom default value (defaults to OUTSIDE).
 * @return {anychart.enums.TicksPosition}
 */
anychart.enums.normalizeTicksPosition = function(value, opt_default) {
  value = (String(value)).toLowerCase();
  switch (value) {
    case 'inside':
    case 'in':
    case 'i':
    case 'inner':
      return anychart.enums.TicksPosition.INSIDE;
    case 'outside':
    case 'out':
    case 'o':
    case 'outer':
      return anychart.enums.TicksPosition.OUTSIDE;
  }
  return opt_default || anychart.enums.TicksPosition.OUTSIDE;
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

  SPLITTER_CHANGE: 'splitterChange',

  SIGNAL: 'signal'
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


//exports
goog.exportSymbol('anychart.enums.Anchor.LEFT_TOP', anychart.enums.Anchor.LEFT_TOP);
goog.exportSymbol('anychart.enums.Anchor.LEFT_CENTER', anychart.enums.Anchor.LEFT_CENTER);
goog.exportSymbol('anychart.enums.Anchor.LEFT_BOTTOM', anychart.enums.Anchor.LEFT_BOTTOM);
goog.exportSymbol('anychart.enums.Anchor.CENTER_TOP', anychart.enums.Anchor.CENTER_TOP);
goog.exportSymbol('anychart.enums.Anchor.CENTER', anychart.enums.Anchor.CENTER);
goog.exportSymbol('anychart.enums.Anchor.CENTER_BOTTOM', anychart.enums.Anchor.CENTER_BOTTOM);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_TOP', anychart.enums.Anchor.RIGHT_TOP);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_CENTER', anychart.enums.Anchor.RIGHT_CENTER);
goog.exportSymbol('anychart.enums.Anchor.RIGHT_BOTTOM', anychart.enums.Anchor.RIGHT_BOTTOM);

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

goog.exportSymbol('anychart.enums.MapAsTableMode.VALUE', anychart.enums.MapAsTableMode.VALUE);
goog.exportSymbol('anychart.enums.MapAsTableMode.RANGE', anychart.enums.MapAsTableMode.RANGE);
goog.exportSymbol('anychart.enums.MapAsTableMode.OHLC', anychart.enums.MapAsTableMode.OHLC);

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

goog.exportSymbol('anychart.enums.TextMarkerAlign.CENTER', anychart.enums.TextMarkerAlign.CENTER);
goog.exportSymbol('anychart.enums.TextMarkerAlign.NEAR', anychart.enums.TextMarkerAlign.NEAR);
goog.exportSymbol('anychart.enums.TextMarkerAlign.FAR', anychart.enums.TextMarkerAlign.FAR);

goog.exportSymbol('anychart.enums.TicksPosition.INSIDE', anychart.enums.TicksPosition.INSIDE);//in docs/
goog.exportSymbol('anychart.enums.TicksPosition.OUTSIDE', anychart.enums.TicksPosition.OUTSIDE);//in docs/

goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_OUT', anychart.enums.EventType.POINT_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.POINT_MOUSE_OVER', anychart.enums.EventType.POINT_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.POINT_CLICK', anychart.enums.EventType.POINT_CLICK);
goog.exportSymbol('anychart.enums.EventType.POINT_DOUBLE_CLICK', anychart.enums.EventType.POINT_DOUBLE_CLICK);
goog.exportSymbol('anychart.enums.EventType.CHART_DRAW', anychart.enums.EventType.CHART_DRAW);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OUT);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER', anychart.enums.EventType.LEGEND_ITEM_MOUSE_OVER);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE', anychart.enums.EventType.LEGEND_ITEM_MOUSE_MOVE);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_CLICK', anychart.enums.EventType.LEGEND_ITEM_CLICK);
goog.exportSymbol('anychart.enums.EventType.LEGEND_ITEM_DOUBLE_CLICK', anychart.enums.EventType.LEGEND_ITEM_DOUBLE_CLICK);
goog.exportSymbol('anychart.enums.EventType.SCROLL_CHANGE', anychart.enums.EventType.SCROLL_CHANGE);
goog.exportSymbol('anychart.enums.EventType.SPLITTER_CHANGE', anychart.enums.EventType.SPLITTER_CHANGE);
goog.exportSymbol('anychart.enums.EventType.SIGNAL', anychart.enums.EventType.SIGNAL);

goog.exportSymbol('anychart.enums.ScaleStackMode.NONE', anychart.enums.ScaleStackMode.NONE);
goog.exportSymbol('anychart.enums.ScaleStackMode.VALUE', anychart.enums.ScaleStackMode.VALUE);
goog.exportSymbol('anychart.enums.ScaleStackMode.PERCENT', anychart.enums.ScaleStackMode.PERCENT);

goog.exportSymbol('anychart.enums.ScatterTicksMode.LINEAR', anychart.enums.ScatterTicksMode.LINEAR);
goog.exportSymbol('anychart.enums.ScatterTicksMode.LOGARITHMIC', anychart.enums.ScatterTicksMode.LOGARITHMIC);
