goog.provide('anychart.core.defaultTheme');
goog.require('anychart.color');
goog.require('anychart.format');
goog.require('anychart.math');
goog.require('anychart.utils');


//region --- Aux
//------------------------------------------------------------------------------
//
//  Aux
//
//------------------------------------------------------------------------------
/**
 * @const {string}
 */
anychart.core.defaultTheme.colorStrokeThin = '#EAEAEA';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorStrokeNormal = '#CECECE';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorStrokeBright = '#c1c1c1';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorStrokeExtraBright = '#969EA5';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorFillBackground = '#ffffff';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorFillExtraThin = '#f5f5f5';


/**
 * @const {string}
 */
anychart.core.defaultTheme.colorFillBackgroundReversed = '#212121';


/**
 * @const {string}
 */
anychart.core.defaultTheme.fontColorNormal = '#7c868e';


/**
 * @const {string}
 */
anychart.core.defaultTheme.fontColorBright = '#545f69';


/**
 * @const {string}
 */
anychart.core.defaultTheme.fontColorDark = '#212121';


/**
 * @const {string}
 */
anychart.core.defaultTheme.defaultHoverColor = '#757575';


/**
 * @const {string}
 */
anychart.core.defaultTheme.defaultSelectSolidColor = '#333';


/**
 * @const {string}
 */
anychart.core.defaultTheme.defaultSelectColor = '#333 0.85';


/**
 * @const {string}
 */
anychart.core.defaultTheme.defaultSelectStroke = '1.5 #212121';


/**
 * @const {string}
 */
anychart.core.defaultTheme.fontColorReversedNormal = '#ffffff';


/**
 * @const {string}
 */
anychart.core.defaultTheme.opacityThin = ' 0.3';


/**
 * @const {string}
 */
anychart.core.defaultTheme.opacityStrong = ' 0.7';


/**
 * @const {string}
 */
anychart.core.defaultTheme.risingColor = '#64b5f6';


/**
 * @const {string}
 */
anychart.core.defaultTheme.fallingColor = '#ef6c00';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallTotalFill = '#96a6a6';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallRisingFill = '#64b5f6';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallFallingFill = '#ef6c00';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallTotalStroke = '#697474';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallRisingStroke = '#467fac';


/**
 * @const {string}
 */
anychart.core.defaultTheme.waterfallFallingStroke = '#a74c00';

/**
 * @const {string}
 */
anychart.core.defaultTheme.ganttDefaultStroke = '#cecece';


/**
 * @const {string}
 */
anychart.core.defaultTheme.VALUE_TOKEN_DECIMALS_COUNT_2 = '{%Value}{decimalsCount:2}';


/**
 * @const {string}
 */
anychart.core.defaultTheme.VALUE_TOKEN_DECIMALS_COUNT_10 = '{%Value}';


/**
 * @const {string}
 */
anychart.core.defaultTheme.PERCENT_VALUE_TOKEN = '{%PercentValue}{decimalsCount:1,zeroFillDecimals:true}';


/**
 * @param {*} val - Value to localize.
 * @param {(number|string)=} opt_decimalsCountOrLocale
 * @param {string=} opt_decimalPoint
 * @param {string=} opt_groupsSeparator
 * @param {({factors:Array.<number>,suffixes:Array.<string>}|boolean)=} opt_scale
 * @param {boolean=} opt_zeroFillDecimals
 * @param {string=} opt_scaleSuffixSeparator
 * @param {boolean=} opt_useBracketsForNegative
 * @return {*}
 */
anychart.core.defaultTheme.locNum = function(val, opt_decimalsCountOrLocale, opt_decimalPoint, opt_groupsSeparator,
                      opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator, opt_useBracketsForNegative) {
  var val_ = (val === null) || (typeof val == 'boolean') || (val == '') ? NaN : +/** @type {number} */(val);
  return isNaN(val_) ? val : anychart.format.number(val_, opt_decimalsCountOrLocale, opt_decimalPoint, opt_groupsSeparator,
      opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator, opt_useBracketsForNegative);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnValue = function() {
  return anychart.core.defaultTheme.locNum(this['value']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnValueAsIs = function() {
  return this['value'];
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnName = function() {
  return this['name'] || this['getData']('id');
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnMilestoneName = function() {
  if (this['creator']) {
    return this['index'];
  } else {
    return this['isStart'] ? 'S' : 'F';
  }
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnNameWithValue = function() {
  var name = this['name'] || this['getData']('id');
  return name + '\n' + anychart.core.defaultTheme.locNum(this['value']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnValueWithPrefixPostfix = function() {
  return this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'];
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnX = function() {
  return this['x'];
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnDateTimeX = function() {
  return anychart.format.date(this['x']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnDateTimeTickValue = function() {
  return anychart.format.date(this['tickValue']);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnSourceColor = function() {
  return this['sourceColor'];
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnSourceColor70 = function() {
  return anychart.color.setOpacity(this['sourceColor'], 0.7, true);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnSourceColor65 = function() {
  return anychart.color.setOpacity(this['sourceColor'], 0.65, true);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnSourceColor50 = function() {
  return anychart.color.setOpacity(this['sourceColor'], 0.50, true);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnSourceColor85 = function() {
  return anychart.color.setOpacity(this['sourceColor'], 0.85, true);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnDarkenSourceColor = function() {
  return anychart.color.darken(this['sourceColor']);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnLightenSourceColor = function() {
  return anychart.color.lighten(this['sourceColor']);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnLightenSourceColor50 = function() {
  return anychart.color.setOpacity(anychart.color.lighten(this['sourceColor']), 0.5, true);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnStrokeSourceColor = function() {
  return anychart.color.setThickness(this['sourceColor'], 1.5);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnStrokeSourceColor1 = function() {
  return anychart.color.setThickness(this['sourceColor'], 1);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnLightenStrokeSourceColor = function() {
  return anychart.color.setThickness(/** @type {acgraph.vector.Stroke} */(anychart.color.lighten(this['sourceColor'])), 1.5);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnLightenStrokeSourceColor1 = function() {
  return anychart.color.setThickness(/** @type {acgraph.vector.Stroke} */(anychart.color.lighten(this['sourceColor'])), 1);
};


/**
 * @this {{
 *    sourceColor: (acgraph.vector.SolidFill|string)
 * }}
 * @return {*}
 */
anychart.core.defaultTheme.returnThickenedStrokeSourceColor = function() {
  return anychart.color.setThickness(this['sourceColor'], 1.5);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnDashedStrokeSourceColor = function() {
  return {
    'color': this['sourceColor'],
    'dash': '6 4'
  };
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnRangeTooltipContentFormatter = function() {
  return 'High: ' + anychart.core.defaultTheme.locNum(this['high']) + '\n' +
      'Low: ' + anychart.core.defaultTheme.locNum(this['low']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnRangeLabelsContentFormatter = function() {
  return anychart.core.defaultTheme.locNum(this['high']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.OHLCTooltipFormatter = function() {
  return 'Open: ' + anychart.core.defaultTheme.locNum(this['open']) + '\n' +
      'High: ' + anychart.core.defaultTheme.locNum(this['high']) + '\n' +
      'Low: ' + anychart.core.defaultTheme.locNum(this['low']) + '\n' +
      'Close: ' + anychart.core.defaultTheme.locNum(this['close']);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.returnStrokeWithThickness = function() {
  return anychart.color.setThickness(this['sourceColor'], 1.5);
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.chartA11yTitleFormatter = function() {
  /** @type {anychart.core.Chart} */
  var chart = this['chart'];
  var title = chart.getCreated('title');
  var titleText = title && title.enabled() && title.text() ? title.text() : '';
  var type = chart.getType();
  var typeText = type || 'Anychart ';
  return typeText + ' chart ' + (titleText ? ' entitled ' + titleText : '');
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.pieA11yTitleFormatter = function() {
  /** @type {anychart.pieModule.Chart} */
  var chart = this['chart'];
  var res = anychart.core.defaultTheme.chartA11yTitleFormatter.apply(this);
  res += ', with ' + chart.getStat('count') + ' points. ';
  res += 'Min value is ' + chart.getStat('min') + ', max value is ' + chart.getStat('max') + '.';
  return res;
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.bulletA11yTitleFormatter = function() {
  var res = anychart.core.defaultTheme.chartA11yTitleFormatter.apply(this);
  return res + '. ';
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.cartesianBaseA11yTitleFormatter = function() {
  /** @type {anychart.core.CartesianBase} */
  var chart = this['chart'];
  var res = anychart.core.defaultTheme.chartA11yTitleFormatter.call(this);
  var seriesLength = chart.getSeriesCount();

  var seriesMap = {};
  for (var i = 0; i < seriesLength; i++) {
    var ser = chart.getSeriesAt(i);
    var type = ser.seriesType();
    if (seriesMap.hasOwnProperty(type)) {
      seriesMap[type] += 1;
    } else {
      seriesMap[type] = 1;
    }
  }

  res += ', with ';
  for (var key in seriesMap) {
    res += seriesMap[key] + ' ' + key + ' series, ';
  }
  res += '. ';

  var yScale = chart.yScale();
  var xScale = chart.xScale();
  var xType = xScale.getType();
  var yType = yScale.getType();
  var min,
      max;

  if (yType == 'ordinal') { //By xml-scheme, enums.ScaleTypes
    var yVals = yScale.values();
    res += 'Y-scale with ' + yVals.length + ' categories: ';
    for (var y = 0; y < yVals.length; y++) {
      res += yVals[y] + ', ';
    }
    res += '. ';
  } else {
    min = yScale.minimum();
    max = yScale.maximum();
    if (yType == 'date-time') {
      min = anychart.format.dateTime(min);
      max = anychart.format.dateTime(max);
    }
    res += 'Y-scale minimum value is ' + min + ' , maximum value is ' + max + '. ';
  }

  if (xType == 'ordinal') {
    var xVals = xScale.values();
    res += 'X-scale with ' + xVals.length + ' categories: ';
    for (var x = 0; x < xVals.length; x++) {
      res += xVals[x] + ', ';
    }
    res += '. ';
  } else {
    min = xScale.minimum();
    max = xScale.maximum();
    if (xType == 'date-time') {
      min = anychart.format.dateTime(min);
      max = anychart.format.dateTime(max);
    }
    res += 'X-scale minimum value is ' + min + ' , maximum value is ' + max + '. ';
  }

  return res;
};


/**
 * @this {*}
 * @return {*}
 */
anychart.core.defaultTheme.scatterA11yTitleFormatter = function() {
  /** @type {anychart.scatterModule.Chart} */
  var chart = this['chart'];
  var res = anychart.core.defaultTheme.chartA11yTitleFormatter.call(this);
  var seriesLength = chart.getSeriesCount();

  var seriesMap = {};
  for (var i = 0; i < seriesLength; i++) {
    var ser = chart.getSeriesAt(i);
    var type = ser.getType();
    if (seriesMap.hasOwnProperty(type)) {
      seriesMap[type] += 1;
    } else {
      seriesMap[type] = 1;
    }
  }

  res += ', with ';
  for (var key in seriesMap) {
    res += seriesMap[key] + ' ' + key + ' series, ';
  }
  res += '. ';

  var yScale = chart.yScale();
  var xScale = chart.xScale();
  var xType = xScale.getType();
  var yType = yScale.getType();
  var min,
      max;

  if (yType == 'ordinal') { //By xml-scheme, enums.ScaleTypes
    var yVals = yScale.values();
    res += 'Y-scale with ' + yVals.length + ' categories: ';
    for (var y = 0; y < yVals.length; y++) {
      res += yVals[y] + ', ';
    }
    res += '. ';
  } else {
    min = yScale.minimum();
    max = yScale.maximum();
    if (yType == 'date-time') {
      min = anychart.format.dateTime(min);
      max = anychart.format.dateTime(max);
    }
    res += 'Y-scale minimum value is ' + min + ', maximum value is ' + max + '. ';
  }

  if (xType == 'ordinal') {
    var xVals = xScale.values();
    res += 'X-scale with ' + xVals.length + ' categories: ';
    for (var x = 0; x < xVals.length; x++) {
      res += xVals[x] + ', ';
    }
    res += '. ';
  } else {
    min = xScale.minimum();
    max = xScale.maximum();
    if (xType == 'date-time') {
      min = anychart.format.dateTime(min);
      max = anychart.format.dateTime(max);
    }
    res += 'X-scale minimum value is ' + min + ', maximum value is ' + max + '. ';
  }

  return res;
};

/**
 * @param {*} contextProvider
 * @return {*}
 */
anychart.core.defaultTheme.tooltipTitleFormatter = function(contextProvider) {
  switch (contextProvider['xScaleType']) {
    case 'date-time':
      return anychart.format.date(contextProvider['x']);
    default:
      return anychart.core.defaultTheme.locNum(contextProvider['x']);
  }
};
//endregion


goog.exportSymbol('anychart.themes.defaultTheme', {
  'palette': {
    'type': 'distinct',
    'items': ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']
  },
  'hatchFillPalette': {
    'items': ['backward-diagonal', 'forward-diagonal', 'horizontal', 'vertical', 'dashed-backward-diagonal', 'grid', 'dashed-forward-diagonal', 'dashed-horizontal', 'dashed-vertical', 'diagonal-cross', 'diagonal-brick', 'divot', 'horizontal-brick', 'vertical-brick', 'checker-board', 'confetti', 'plaid', 'solid-diamond', 'zig-zag', 'weave', 'percent-05', 'percent-10', 'percent-20', 'percent-25', 'percent-30', 'percent-40', 'percent-50', 'percent-60', 'percent-70', 'percent-75', 'percent-80', 'percent-90']
  },
  'hatchFillPaletteFor3D': {
    'items': ['backward-diagonal', 'forward-diagonal', 'dashed-backward-diagonal', 'grid', 'dashed-forward-diagonal', 'dashed-horizontal', 'dashed-vertical', 'diagonal-cross', 'diagonal-brick', 'divot', 'horizontal-brick', 'vertical-brick', 'checker-board', 'confetti', 'plaid', 'solid-diamond', 'zig-zag', 'weave', 'percent-05', 'percent-10', 'percent-20', 'percent-25', 'percent-30', 'percent-40', 'percent-50', 'percent-60', 'percent-70', 'percent-75', 'percent-80', 'percent-90', 'horizontal', 'vertical']
  },
  'markerPalette': {
    'items': ['circle', 'diamond', 'square', 'triangle-down', 'triangle-up', 'diagonal-cross', 'pentagon', 'cross', 'v-line', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
  },

  'defaultScaleSettings': {
    'linear': {
      'maxTicksCount': 1000,
      'inverted': false,
      'maximum': null,
      'minimum': null,
      'minimumGap': 0.1,
      'maximumGap': 0.1,
      'softMinimum': null,
      'softMaximum': null,
      'alignMinimum': true,
      'alignMaximum': true,
      'ticks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'minCount': 4,
        'maxCount': 6,
        'interval': NaN,
        'allowFractional': true
      },
      'minorTicks': {
        'mode': 'linear',
        'base': 0,
        'explicit': null,
        'count': 5,
        'interval': NaN,
        'allowFractional': true
      },
      'stackMode': 'none',
      'stackDirection': 'direct',
      'stickToZero': true
    },
    'ordinal': {
      'type': 'ordinal',
      'inverted': false,
      'mode': 'discrete',
      'names': [],
      'ticks': {
        'maxCount': 100
      }
    },
    'log': {
      'type': 'log',
      'logBase': 10,
      'ticks': {
        'mode': 'log'
      },
      'minorTicks': {
        'mode': 'log'
      }
    },
    'dateTime': {
      'type': 'date-time',
      'alignMinimum': false,
      'alignMaximum': false,
      'minimumGap': 0,
      'maximumGap': 0,
      'ticks': {
        'count': 4
      },
      'minorTicks': {
        'count': 4
      }
    }
  },

  'defaultFontSettings': {
    'fontSize': 13,
    'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
    'fontColor': anychart.core.defaultTheme.fontColorNormal,
    'textDirection': 'ltr',
    'fontOpacity': 1,
    'fontDecoration': 'none',
    'fontStyle': 'normal',
    'fontVariant': 'normal',
    'fontWeight': 'normal',
    'letterSpacing': 'normal',
    'lineHeight': 'normal',
    'textIndent': 0,
    'textShadow': 'none',
    'vAlign': 'top',
    'hAlign': 'start',
    'wordWrap': 'normal',
    'wordBreak': 'normal',
    'textOverflow': '',
    'selectable': false,
    'disablePointerEvents': false,
    'useHtml': false
  },

  'defaultBackground': {
    'enabled': false,
    'fill': anychart.core.defaultTheme.colorFillBackground,
    'stroke': 'none',
    'cornerType': 'round',
    'corners': 0
  },

  'defaultSeparator': {
    'enabled': false,
    'fill': anychart.core.defaultTheme.colorStrokeNormal + anychart.core.defaultTheme.opacityThin,
    'width': '100%',
    'height': 1,
    'margin': {'top': 5, 'right': 0, 'bottom': 5, 'left': 0},
    'orientation': 'top',
    'stroke': 'none',
    'zIndex': 1
  },

  'defaultLabelFactory': {
    'enabled': false,
    'offsetX': 0,
    'offsetY': 0,
    'width': null,
    'height': null,
    'clip': null,
    'fontSize': 12,
    'minFontSize': 8,
    'maxFontSize': 72,
    'textShadow': 'none',
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'anchor': 'center',
    'padding': 4,
    'rotation': 0,
    'format': anychart.core.defaultTheme.returnValue,
    'positionFormatter': anychart.core.defaultTheme.returnValue
  },

  'defaultSimpleLabelsSettings': {
    'fontSize': 13,
    'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
    'fontColor': anychart.core.defaultTheme.fontColorNormal,
    'textDirection': 'ltr',
    'fontOpacity': 1,
    'fontDecoration': 'none',
    'fontStyle': 'normal',
    'fontVariant': 'normal',
    'fontWeight': 'normal',
    'letterSpacing': 'normal',
    'lineHeight': 'normal',
    'textIndent': 0,
    'textShadow': 'none',
    'vAlign': 'top',
    'hAlign': 'left',
    'wordWrap': null,
    'wordBreak': null,
    'textOverflow': false,
    'selectable': false,
    'useHtml': false,
    'allowMultiline': false,

    'padding': 4,
    // 'format': '',
    'width': null,
    'height': null,
    'anchor': 'left-top',
    'position': 'left-top',
    'offsetX': 0,
    'offsetY': 0,
    'enabled': true,
    'disablePointerEvents': true
  },


  'defaultMarkerFactory': {
    'anchor': 'center',
    'size': 6,
    'offsetX': 0,
    'offsetY': 0,
    'rotation': 0,
    'positionFormatter': anychart.core.defaultTheme.returnValue
  },

  'defaultTitle': {
    'enabled': false,
    'fontSize': 16,
    'text': 'Title text',
    'width': null,
    'height': null,
    'align': 'center',
    'hAlign': 'center',
    'padding': 0,
    'margin': 0
  },

  'defaultTooltip': {
    'enabled': true,
    'title': {
      'fontColor': anychart.core.defaultTheme.fontColorReversedNormal,
      'text': '',
      'fontSize': 14,
      'rotation': 0,
      'align': 'left',
      'hAlign': 'left',
      'orientation': 'top',
      'zIndex': 1,
      'background': {
        'fill': 'none',
        'stroke': 'none'
      }
    },
    'contentInternal': {
      'enabled': true,
      'fontSize': 12,
      'minFontSize': 9,
      'maxFontSize': 13,
      'fontColor': anychart.core.defaultTheme.fontColorReversedNormal,
      'hAlign': 'left',
      'text': 'Tooltip Text',
      'width': '100%',
      'height': '100%',
      'anchor': 'left-top',
      'offsetX': 0,
      'offsetY': 0,
      'position': 'left-top',
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'padding': 0,
      'rotation': 0,
      'zIndex': 1,
      'background': {
        'disablePointerEvents': false,
        'fill': 'none',
        'stroke': 'none'
      }
    },
    'fontSize': 12,
    'minFontSize': 9,
    'maxFontSize': 13,
    'fontColor': anychart.core.defaultTheme.fontColorReversedNormal,
    'text': 'Tooltip Text',
    'width': null,
    'height': null,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'background': {
      'enabled': true,
      'fill': anychart.core.defaultTheme.colorFillBackgroundReversed + anychart.core.defaultTheme.opacityStrong,
      'corners': 3,
      'zIndex': 0,
      'cornerType': 'round'
    },
    'offsetX': 10,
    'offsetY': 10,
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'valuePrefix': '',
    'valuePostfix': '',
    'position': 'left-top',
    'anchor': 'left-top',
    'hideDelay': 0,
    'titleFormat': anychart.core.defaultTheme.returnValue,
    'format': anychart.core.defaultTheme.returnValueWithPrefixPostfix,
    'unionFormat': '{%joinedFormattedValues}',
    'zIndex': 0,
    'allowLeaveChart': true,
    'allowLeaveScreen': false,
    'allowLeaveStage': false
  },

  'defaultAxis': {
    'enabled': true,
    'startAngle': 0,
    'drawLastLabel': true,
    'drawFirstLabel': true,
    'staggerMaxLines': 2,
    'staggerMode': false,
    'staggerLines': null,
    'width': null,
    'overlapMode': 'no-overlap',
    'stroke': anychart.core.defaultTheme.colorStrokeNormal,
    'title': {
      'padding': 5,
      'fontSize': 13,
      'text': 'Axis title',
      'fontColor': anychart.core.defaultTheme.fontColorBright,
      'zIndex': 35
    },
    'labels': {
      'enabled': true,
      'format': anychart.core.defaultTheme.returnValue,
      'position': 'outside',
      'zIndex': 35
    },
    'minorLabels': {
      'fontSize': 9,
      'format': anychart.core.defaultTheme.returnValue,
      'position': 'outside',
      'zIndex': 35
    },
    'ticks': {
      'enabled': true,
      'length': 6,
      'position': 'outside',
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'zIndex': 35
    },
    'minorTicks': {
      'enabled': false,
      'length': 4,
      'position': 'outside',
      'stroke': anychart.core.defaultTheme.colorStrokeThin,
      'zIndex': 35
    },
    'zIndex': 35
  },

  'defaultGridSettings': {
    'enabled': true,
    'isMinor': false,
    'drawFirstLine': true,
    'drawLastLine': true,
    /**
     * @this {*}
     * @return {*}
     */
    'fill': function() {
      return this['palette'].itemAt(this['index']);
    },
    'palette': {
      'items': ['none']
    },
    'stroke': anychart.core.defaultTheme.colorStrokeNormal,
    'scale': 1,
    'zIndex': 11
  },

  'defaultMinorGridSettings': {
    'isMinor': true,
    'stroke': anychart.core.defaultTheme.colorStrokeThin,
    'zIndex': 10
  },

  'defaultLineMarkerSettings': {
    'enabled': true,
    'value': 0,
    'layout': null,
    'stroke': {
      'color': '#7c868e',
      'thickness': 2,
      'opacity': 1,
      'dash': '',
      'lineJoin': 'miter',
      'lineCap': 'square'
    },
    'zIndex': 25.2,
    'scale': 1,
    'scaleRangeMode': 'none'
  },

  'defaultTextMarkerSettings': {
    'fontSize': 12,
    'value': 0,
    'anchor': 'auto',
    'align': 'center',
    'layout': null,
    'text': 'Text marker',
    'zIndex': 25.3,
    'scale': 1,
    'scaleRangeMode': 'none',
    'rotation': null
  },

  'defaultRangeMarkerSettings': {
    'enabled': true,
    'from': 0,
    'to': 0,
    'layout': null,
    'fill': anychart.core.defaultTheme.colorStrokeBright + ' 0.4',
    'zIndex': 25.1,
    'scale': 1,
    'scaleRangeMode': 'none'
  },

  'defaultLegend': {
    'enabled': false,
    'vAlign': 'bottom',
    'fontSize': 12,
    'textOverflow': '...',
    'itemsLayout': 'horizontal',
    'itemsHAlign': 'left',
    'positionMode': 'outside',
    'itemsSpacing': 15,
    'items': null,
    'itemsFormat': null,
    'itemsSourceMode': 'default',
    'inverted': false,
    'hoverCursor': 'pointer',
    'iconTextSpacing': 5,
    'iconSize': 15,
    'width': null,
    'height': null,
    'position': 'top',
    'align': 'center',
    'padding': {'top': 0, 'right': 10, 'bottom': 10, 'left': 10},
    'margin': 0,
    'title': {
      'fontSize': 15
    },
    'paginator': {
      'enabled': true,
      'fontSize': 12,
      'fontColor': anychart.core.defaultTheme.fontColorBright,
      'orientation': 'right',
      'layout': 'horizontal',
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 5},
      'margin': 0,
      'zIndex': 30,
      'buttonsSettings': {
        'normal': {
          'stroke': '#757575',
          'fill': '#9e9e9e'
        },
        'hover': {
          'stroke': '#546e7a',
          'fill': anychart.core.defaultTheme.fontColorNormal
        },
        'pushed': {
          'stroke': anychart.core.defaultTheme.fontColorNormal,
          'fill': '#9e9e9e'
        },
        'disabled': {
          'stroke': null,
          'fill': '#e0e0e0'
        }
      }
    },
    'titleFormat': null,
    'tooltip': {
      'enabled': false,
      'allowLeaveScreen': true
    },
    'drag': false,
    'maxWidth': null,
    'maxHeight': null,
    'zIndex': 200
  },

  'defaultCrosshairLabel': {
    'x': 0,
    'y': 0,
    'axisIndex': 0,
    'anchor': null,
    'format': anychart.core.defaultTheme.returnValue,
    'enabled': true,
    'fontSize': 12,
    'minFontSize': 8,
    'maxFontSize': 16,
    'fontColor': anychart.core.defaultTheme.fontColorReversedNormal,
    'fontWeight': 400,
    'disablePointerEvents': true,
    'text': 'Label text',
    'background': {
      'enabled': true,
      'disablePointerEvents': true,
      'fill': anychart.core.defaultTheme.colorFillBackgroundReversed + anychart.core.defaultTheme.opacityStrong,
      'corners': 3,
      'zIndex': 0
    },
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'width': null,
    'height': null,
    'offsetX': 0,
    'offsetY': 0,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'rotation': 0
  },

  'defaultCallout': {
    'enabled': true,
    'orientation': 'left',
    'title': {'enabled': false},
    'padding': 0,
    'margin': 0,
    'align': 'center',
    'labels': {
      'enabled': true,
      'vAlign': 'middle',
      'hAlign': 'center',
      'positionFormatter': anychart.core.defaultTheme.returnValue,
      'adjustFontSize': false,
      'connectorStroke': null
    }
  },

  'defaultScroller': {
    'enabled': false,
    'fill': '#f7f7f7',
    'selectedFill': '#ddd',
    'outlineStroke': 'none',
    'height': 16,
    'minHeight': null,
    'maxHeight': null,
    'autoHide': false,
    'orientation': 'bottom',
    'position': 'after-axes',
    'allowRangeChange': true,
    'thumbs': {
      'enabled': true,
      'autoHide': false,
      'normal': {
        'fill': '#E9E9E9',
        'stroke': '#7c868e'
      },
      'hovered': {
        'fill': '#ffffff',
        'stroke': anychart.core.defaultTheme.defaultHoverColor
      }
    },
    'inverted': false,
    'zIndex': 35
  },

  'defaultLabelSettings': {
    'enabled': true,
    'text': 'Chart label',
    'width': null,
    'height': null,
    'anchor': 'left-top',
    'position': 'left-top',
    'offsetX': 0,
    'offsetY': 0,
    'minFontSize': 8,
    'maxFontSize': 72,
    'adjustFontSize': {
      'width': false,
      'height': false
    },
    'rotation': 0,
    'zIndex': 50
  },

  'defaultButtonSettings': {
    'padding': [3, 5],
    'normal': {
      'hAlign': 'center',
      'vAlign': 'middle',
      'background': {
        'enabled': true,
        'stroke': '#dedede',
        'fill': '#e7e7e7',
        'corners': [0]
      },
      'content': 'Button',
      'disablePointerEvents': true,
      'selectable': false,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'minFontSize': 8,
      'maxFontSize': 72
    },
    'hovered': {},
    'selected': {}
  },

  'defaultNoDataLabel': {
    'padding': {},
    'disablePointerEvents': false,
    'enabled': false,
    'background': {
      'zIndex': 0,
      'enabled': false,
      'visible': false,
      'disablePointerEvents': false
    },
    'fontFamily': 'Arial',
    'fontColor': 'black',
    'fontWeight': 'bold',
    'fontSize': 15,
    'position': 'center',
    'anchor': 'center',
    'zIndex': 999999,
    'text': 'No data.'
  },

  'stageCredits': {
    'text': 'AnyChart',
    'url': 'https://www.anychart.com/?utm_source=registered',
    'alt': 'AnyChart - JavaScript Charts designed to be embedded and integrated{{anychart-version}}',
    'imgAlt': 'AnyChart - JavaScript Charts',
    'logoSrc': 'https://static.anychart.com/logo.png'
  },

  'chart': {
    'zIndex': 0,
    'enabled': true,
    'padding': {'top': 10, 'right': 20, 'bottom': 15, 'left': 10},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'autoRedraw': true,
    'background': {'enabled': true, 'zIndex': 0.5},
    'contextMenu': {
      'fromTheme': true, // suppress NO_FEATURE_IN_MODULE warning
      'enabled': true
    },
    'title': {
      'text': 'Chart Title',
      'padding': {'top': 0, 'right': 0, 'bottom': 10, 'left': 0},
      'zIndex': 80,
      'background': {
        'zIndex': 0
      }
    },
    'animation': {
      'enabled': false,
      'duration': 1000
    },
    'interactivity': {
      'hoverMode': 'single',
      'selectionMode': 'multi-select',
      'spotRadius': 2,
      'multiSelectOnClick': false,
      'unselectOnClickOutOfPoint': true
    },
    'tooltip': {
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true
      },
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return anychart.core.defaultTheme.tooltipTitleFormatter(this['points'][0]);
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        return this['formattedValues'].join('\n');
      }
    },
    'bounds': {
      'top': null,
      'right': null,
      'bottom': null,
      'left': null,
      'width': null,
      'height': null,
      'minWidth': null,
      'minHeight': null,
      'maxWidth': null,
      'maxHeight': null
    },
    'credits': {},
    'defaultSeriesSettings': {
      'base': {
        'enabled': true,
        'isVertical': null,
        'background': {'enabled': true},
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormat': function() {
            return anychart.core.defaultTheme.tooltipTitleFormatter(this);
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return this['seriesName'] + ': ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['value']) + this['valuePostfix'];
          }
        },
        'normal': {
          'fill': anychart.core.defaultTheme.returnSourceColor65,
          'stroke': anychart.core.defaultTheme.returnStrokeSourceColor,

          'lowStroke': anychart.core.defaultTheme.returnStrokeSourceColor,
          'highStroke': anychart.core.defaultTheme.returnStrokeSourceColor,
          'lowFill': anychart.core.defaultTheme.returnSourceColor,
          'highFill': anychart.core.defaultTheme.returnSourceColor,

          'negativeFill': anychart.core.defaultTheme.returnSourceColor,
          'negativeStroke': anychart.core.defaultTheme.returnStrokeSourceColor,

          'risingFill': anychart.core.defaultTheme.returnSourceColor,
          'risingStroke': anychart.core.defaultTheme.returnStrokeSourceColor,
          'fallingFill': anychart.core.defaultTheme.returnSourceColor,
          'fallingStroke': anychart.core.defaultTheme.returnStrokeSourceColor,

          'risingHatchFill': false,
          'fallingHatchFill': false,

          'hatchFill': false,
          'labels': {
            'enabled': null,
            'anchor': 'auto',
            'position': 'value'
          },
          'minLabels': {'enabled': null},
          'maxLabels': {'enabled': null},
          'outlierMarkers': {'enabled': null},
          'markers': {
            'enabled': false,
            'disablePointerEvents': false,
            'position': 'value',
            'positionFormatter': anychart.core.defaultTheme.returnValue,
            'size': 4
          }
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.returnSourceColor,
          'stroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,

          'lowFill': anychart.core.defaultTheme.returnSourceColor,
          'highFill': anychart.core.defaultTheme.returnSourceColor,
          'lowStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
          'highStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,

          'negativeFill': anychart.core.defaultTheme.returnSourceColor,
          'negativeStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,

          'risingFill': anychart.core.defaultTheme.returnSourceColor,
          'fallingFill': anychart.core.defaultTheme.returnSourceColor,
          'risingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,
          'fallingStroke': anychart.core.defaultTheme.returnLightenStrokeSourceColor,

          'risingHatchFill': null,
          'fallingHatchFill': null,

          'hatchFill': null,
          'labels': {'enabled': null},
          'minLabels': {'enabled': null},
          'maxLabels': {'enabled': null},
          'outlierMarkers': {'enabled': null},
          'markers': {
            'enabled': null,
            'size': 6
          }
        },
        'selected': {
          'fill': anychart.core.defaultTheme.defaultSelectColor,
          'stroke': anychart.core.defaultTheme.defaultSelectColor,

          'lowStroke': anychart.core.defaultTheme.defaultSelectColor,
          'highStroke': anychart.core.defaultTheme.defaultSelectColor,
          'lowFill': anychart.core.defaultTheme.defaultSelectColor,
          'highFill': anychart.core.defaultTheme.defaultSelectColor,

          'negativeFill': anychart.core.defaultTheme.defaultSelectColor,
          'negativeStroke': anychart.core.defaultTheme.defaultSelectColor,

          'risingFill': anychart.core.defaultTheme.defaultSelectColor,
          'risingStroke': anychart.core.defaultTheme.defaultSelectColor,
          'fallingFill': anychart.core.defaultTheme.defaultSelectColor,
          'fallingStroke': anychart.core.defaultTheme.defaultSelectColor,

          'risingHatchFill': null,
          'fallingHatchFill': null,

          'hatchFill': null,
          'labels': {'enabled': null},
          'minLabels': {'enabled': null},
          'maxLabels': {'enabled': null},
          'outlierMarkers': {'enabled': null},
          'markers': {
            'enabled': null,
            'fill': anychart.core.defaultTheme.defaultSelectColor,
            'stroke': anychart.core.defaultTheme.defaultSelectStroke,
            'size': 6
          }
        },
        'legendItem': {
          'enabled': true,
          'iconType': 'square'
        },
        'clip': true,
        'color': null,
        'xScale': null,
        'yScale': null,
        'error': {
          'mode': 'both',
          'xError': null,
          'xUpperError': null,
          'xLowerError': null,
          'valueError': null,
          'valueUpperError': null,
          'valueLowerError': null,
          'xErrorWidth': 10,
          'valueErrorWidth': 10,
          'xErrorStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'valueErrorStroke': anychart.core.defaultTheme.returnDarkenSourceColor
        },
        'pointWidth': null,
        'connectMissingPoints': false,
        'a11y': {
          'enabled': false,
          'titleFormat': 'Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}'
        }
      },
      'marker': {
        'normal': {
          'fill': anychart.core.defaultTheme.returnSourceColor,
          'stroke': anychart.core.defaultTheme.returnStrokeWithThickness,
          'size': 4,
          'labels': {
            'offsetY': 3
          }
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.returnLightenSourceColor,
          'stroke': anychart.core.defaultTheme.returnStrokeWithThickness,
          'size': 6
        },
        'selected': {
          'fill': anychart.core.defaultTheme.defaultSelectColor,
          'stroke': anychart.core.defaultTheme.defaultSelectStroke,
          'size': 6
        },
        'legendItem': {
          'iconStroke': 'none'
        }
      },
      'bubble': {
        'normal': {
          'fill': anychart.core.defaultTheme.returnSourceColor70,
          /**
           * @this {*}
           * @return {*}
           */
          'negativeFill': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor'])));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'negativeStroke': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(anychart.color.darken((this['sourceColor'])))));
          },
          'negativeHatchFill': false,
          'labels': {
            'anchor': 'center'
          }
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.returnSourceColor50,
          /**
           * @this {*}
           * @return {*}
           */
          'negativeFill': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor']))));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'negativeStroke': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor'])))));
          },
          'negativeHatchFill': null
        },
        'selected': {
          /**
           * @this {*}
           * @return {*}
           */
          'negativeFill': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor'])));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'negativeStroke': function() {
            return anychart.color.darken(anychart.color.darken(anychart.color.darken(anychart.color.darken(this['sourceColor']))));
          },
          'negativeHatchFill': null
        },
        'displayNegative': false,
        'legendItem': {
          'iconStroke': 'none'
        }
      },
      'areaLike': {
        'normal': {
          'fill': anychart.core.defaultTheme.returnSourceColor65
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.returnSourceColor65,
          'markers': {
            'enabled': true
          }
        },
        'selected': {
          'markers': {
            'enabled': true
          }
        },
        'legendItem': {
          'iconStroke': 'none'
        },
        'stepDirection': 'center'
      },
      'barLike': {
        'normal': {
          'fill': anychart.core.defaultTheme.returnSourceColor85
        },
        'hovered': {
          'fill': anychart.core.defaultTheme.returnSourceColor65
        },
        'legendItem': {
          'iconStroke': 'none'
        }
      },
      'lineLike': {
        'hovered': {
          'markers': {
            'enabled': true
          }
        },
        'selected': {
          'markers': {
            'enabled': true
          }
        },
        'stepDirection': 'center'
      },
      'rangeLike': {
        'normal': {
          'labels': {
            'format': anychart.core.defaultTheme.returnRangeLabelsContentFormatter,
            'position': 'high'
          },
          'markers': {
            'position': 'high'
          }
        },
        'tooltip': {
          'format': anychart.core.defaultTheme.returnRangeTooltipContentFormatter
        }
      },
      'candlestick': {
        'normal': {
          'risingFill': anychart.core.defaultTheme.risingColor,
          'risingStroke': anychart.core.defaultTheme.risingColor,
          'fallingFill': anychart.core.defaultTheme.fallingColor,
          'fallingStroke': anychart.core.defaultTheme.fallingColor,
          'risingHatchFill': false,
          'fallingHatchFill': false,
          'markers': {
            'position': 'high'
          },
          'labels': {
            'position': 'high',
            'format': anychart.core.defaultTheme.returnX
          }
        },
        'hovered': {
          'risingFill': anychart.core.defaultTheme.returnLightenSourceColor,
          'risingStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'fallingFill': anychart.core.defaultTheme.returnLightenSourceColor,
          'fallingStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'risingHatchFill': null,
          'fallingHatchFill': null
        },
        'selected': {
          'risingFill': anychart.core.defaultTheme.defaultSelectColor,
          'risingStroke': anychart.core.defaultTheme.defaultSelectColor,
          'fallingFill': anychart.core.defaultTheme.defaultSelectColor,
          'fallingStroke': anychart.core.defaultTheme.defaultSelectColor,
          'risingHatchFill': null,
          'fallingHatchFill': null
        },
        'tooltip': {
          'format': anychart.core.defaultTheme.OHLCTooltipFormatter
        }
      },
      'column': {
        'isVertical': false,
        'normal': {
          'labels': {
            'offsetY': 3
          }
        }
      },
      'ohlc': {
        'normal': {
          'risingStroke': anychart.core.defaultTheme.risingColor,
          'fallingStroke': anychart.core.defaultTheme.fallingColor,
          'markers': {
            'position': 'high'
          },
          'labels': {
            'position': 'high',
            'format': anychart.core.defaultTheme.returnX
          }
        },
        'hovered': {
          'risingStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'fallingStroke': anychart.core.defaultTheme.returnDarkenSourceColor
        },
        'selected': {
          'risingStroke': '3 ' + anychart.core.defaultTheme.defaultSelectColor,
          'fallingStroke': '3 ' + anychart.core.defaultTheme.defaultSelectColor
        },
        'tooltip': {
          'format': anychart.core.defaultTheme.OHLCTooltipFormatter
        }
      },
      'stick': {
        'normal': {
          'stroke': anychart.core.defaultTheme.returnStrokeSourceColor1
        }
      },
      'jumpLine': {
        'pointWidth': '100%'
      },
      'hilo': {
        'pointWidth': 1
      }
    },
    'chartLabels': [],
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'a11y': {
      'enabled': true,
      'titleFormat': anychart.core.defaultTheme.chartA11yTitleFormatter,
      'mode': 'chart-elements'
    },
    'normal': {
      'labels': {'enabled': false},
      'minLabels': {'enabled': null},
      'maxLabels': {'enabled': null}
    },
    'hovered': {
      'labels': {'enabled': null},
      'minLabels': {'enabled': null},
      'maxLabels': {'enabled': null}
    },
    'selected': {
      'labels': {'enabled': null},
      'minLabels': {'enabled': null},
      'maxLabels': {'enabled': null}
    },
    'crossing': {
      'stroke': 'none'
    },
    'baseline': 0,

    'defaultQuarterSettings': {
      'enabled': false,
      'zIndex': 1,
      'fill': 'none',
      'stroke': 'none',
      'title': {
        'padding': 5
      },
      'defaultLabelSettings': {
        'text': 'Quarter label',
        'anchor': 'center',
        'position': 'center'
      },
      'margin': {},
      'padding': {}
    },

    'quarters': {
      'rightTop': {
        'fill': '#e3f2fd',
        'title': {
          'orientation': 'top'
        }
      },
      'leftTop': {
        'title': {
          'orientation': 'top'
        }
      },
      'leftBottom': {
        'fill': '#e3f2fd',
        'title': {
          'orientation': 'bottom'
        }
      },
      'rightBottom': {
        'title': {
          'orientation': 'bottom'
        }
      }
    },
    'selectRectangleMarqueeFill': '#d3d3d3 0.4',
    'selectRectangleMarqueeStroke': '#d3d3d3',

    'maxPointWidth': '100%',
    'minPointLength': 0,
    'dataArea': {
      'zIndex': 10, // series zIndex = 30
      'background': {
        'fill': 'none'
      }
    }
  },

  'cartesianBase': {
    'defaultSeriesSettings': {
      'base': {
        'normal': {
          'labels': {
            'enabled': null,
            'format': anychart.core.defaultTheme.VALUE_TOKEN_DECIMALS_COUNT_2
          }
        }
      },
      'bar': {
        'isVertical': true,
        'normal': {
          'labels': {
            'offsetY': 3
          }
        },
        'tooltip': {
          'anchor': 'left-top'
        }
      },
      'column': {
        'tooltip': {
          'anchor': 'left-top'
        }
      },
      'rangeColumn': {
        'isVertical': false,
        'tooltip': {
          'anchor': 'left-top',
          'offsetX': 10
        }
      },
      'rangeBar': {
        'normal': {
          'labels': {
            'offsetY': 3
          }
        },
        'isVertical': true
      },
      'box': {
        'normal': {
          'medianStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'stemStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'whiskerStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'whiskerWidth': 0,
          'outlierMarkers': {
            'enabled': true,
            'disablePointerEvents': false,
            'position': 'center',
            'rotation': 0,
            'anchor': 'center',
            'offsetX': 0,
            'offsetY': 0,
            'type': 'circle',
            'size': 3,
            'positionFormatter': anychart.core.defaultTheme.returnValue
          },
          'markers': {
            'position': 'median'
          },
          'labels': {
            'position': 'highest',
            /**
             * @this {*}
             * @return {*}
             */
            'format': function() {
              return 'Highest: ' + anychart.core.defaultTheme.locNum(this['highest']) + '\n' +
                  'Median: ' + anychart.core.defaultTheme.locNum(this['median']) + '\n' +
                  'Lowest: ' + anychart.core.defaultTheme.locNum(this['lowest']);
            }
          }
        },
        'hovered': {
          'medianStroke': anychart.core.defaultTheme.returnSourceColor,
          'stemStroke': anychart.core.defaultTheme.returnSourceColor,
          'whiskerStroke': anychart.core.defaultTheme.returnDarkenSourceColor,
          'whiskerWidth': null,
          'outlierMarkers': {
            'enabled': null,
            'size': 4
          }
        },
        'selected': {
          'medianStroke': anychart.core.defaultTheme.defaultSelectColor,
          'stemStroke': anychart.core.defaultTheme.defaultSelectColor,
          'whiskerStroke': anychart.core.defaultTheme.defaultSelectColor,
          'whiskerWidth': null,
          'outlierMarkers': {
            'enabled': null,
            'size': 4,
            'fill': anychart.core.defaultTheme.defaultSelectColor,
            'stroke': anychart.core.defaultTheme.defaultSelectStroke
          }
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormat': function() {
            return this['name'] || this['x'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'format': function() {
            return 'Lowest: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['lowest']) + this['valuePostfix'] + '\n' +
                'Q1: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['q1']) + this['valuePostfix'] + '\n' +
                'Median: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['median']) + this['valuePostfix'] + '\n' +
                'Q3: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['q3']) + this['valuePostfix'] + '\n' +
                'Highest: ' + this['valuePrefix'] + anychart.core.defaultTheme.locNum(this['highest']) + this['valuePostfix'];
          }
        }
      }
    },
    'defaultXAxisSettings': {
      'orientation': 'bottom',
      'title': {
        'text': 'X-Axis',
        'padding': {'top': 5, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'labels': {
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var scale = this['scale'];
          var value = this['tickValue'];
          switch (scale.getType()) {
            case 'ordinal':
              return this['value'];
            case 'date-time':
              var unit = this['intervalUnit'];
              return anychart.format.dateTime(value,
                  anychart.format.getDateTimeFormat(
                      anychart.format.getIntervalIdentifier(
                          unit, unit, 'charts')));
            default:
              return anychart.format.number(this['value']);
          }
        }
      },
      'minorLabels': {
        /**
         * @this {*}
         * @return {string}
         */
        'format': function() {
          var scale = this['scale'];
          var value = this['tickValue'];
          switch (scale.getType()) {
            case 'ordinal':
              return this['value'];
            case 'date-time':
              var unit = this['minorIntervalUnit'];
              return anychart.format.dateTime(value,
                  anychart.format.getDateTimeFormat(
                      anychart.format.getIntervalIdentifier(
                          unit, anychart.utils.getParentInterval(unit), 'charts')));
            default:
              return anychart.format.number(this['value']);
          }
        }
      },
      'scale': 0
    },
    'defaultYAxisSettings': {
      'orientation': 'left',
      'title': {
        'text': 'Y-Axis',
        'padding': {'top': 0, 'right': 0, 'bottom': 5, 'left': 0}
      },
      'labels': {
        'format': anychart.core.defaultTheme.VALUE_TOKEN_DECIMALS_COUNT_10
      },
      'scale': 1
    },
    'defaultAnnotationSettings': {},
    'annotations': {
      'annotationsList': [],
      'zIndex': 2000
    },
    'xAxes': [{}],
    'yAxes': [{}],
    'xGrids': [],
    'yGrids': [],
    'xMinorGrids': [],
    'yMinorGrids': [],
    'series': [],
    'lineAxesMarkers': [],
    'rangeAxesMarkers': [],
    'textAxesMarkers': [],
    'xScale': 0,
    'yScale': 1,
    'barsPadding': 0.4,
    'barGroupsPadding': 0.8,
    'maxBubbleSize': '20%',
    'minBubbleSize': '5%',
    'isVertical': false,
    'scales': [
      {
        'type': 'ordinal'
      },
      {
        'type': 'linear'
      }
    ],
    'yScroller': {
      'orientation': 'left',
      'inverted': false
    },
    'crosshair': {
      'enabled': false,
      'displayMode': 'float',
      'xStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'yStroke': anychart.core.defaultTheme.colorStrokeExtraBright,
      'zIndex': 41,
      'xLabels': [{'enabled': null}],
      'yLabels': [{'enabled': null}]
    },
    'xZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'yZoom': {
      'continuous': true,
      'startRatio': 0,
      'endRatio': 1
    },
    'a11y': {
      'titleFormat': anychart.core.defaultTheme.cartesianBaseA11yTitleFormatter
    }
  },

  'pieFunnelPyramidBase': {
    'mode3d': false,
    'animation': {
      'duration': 500
    },
    'normal': {
      'fill': anychart.core.defaultTheme.returnSourceColor,
      'stroke': 'none',
      'hatchFill': null,
      'labels': {
        'enabled': true,
        'fontColor': null,
        'position': 'inside',
        'disablePointerEvents': false,
        'autoRotate': false,
        'zIndex': 34,
        /**
         * @this {*}
         * @return {*}
         */
        'format': function() {
          return this['name'] ? this['name'] : this['x'];
        }
      },
      'markers': {
        'enabled': false,
        'position': 'center',
        'positionFormatter': anychart.core.defaultTheme.returnValue,
        'zIndex': 33
      }
    },
    'hovered': {
      'fill': anychart.core.defaultTheme.returnLightenSourceColor,
      'stroke': anychart.core.defaultTheme.returnSourceColor,
      'labels': {
        'enabled': null
      },
      'markers': {
        'enabled': null
      }
    },
    'selected': {
      'fill': anychart.core.defaultTheme.defaultSelectColor,
      'stroke': anychart.core.defaultTheme.defaultSelectStroke,
      'labels': {
        'enabled': null
      },
      'markers': {
        'enabled': null
      }
    },
    'connectorStroke': anychart.core.defaultTheme.colorStrokeNormal,
    'overlapMode': 'no-overlap',
    'connectorLength': 20,
    'baseWidth': '70%',
    'neckWidth': null,
    'neckHeight': null,
    'pointsPadding': 0,
    'forceHoverLabels': true,
    'outsideLabels': {
      'disablePointerEvents': false,
      'autoColor': anychart.core.defaultTheme.fontColorBright
    },
    'insideLabels': {
      'disablePointerEvents': true,
      'autoColor': anychart.core.defaultTheme.fontColorReversedNormal
    },
    'legend': {
      'enabled': true,
      'padding': {'top': 10, 'right': 10, 'bottom': 0, 'left': 10},
      'position': 'bottom'
    },
    'tooltip': {
      'title': {'enabled': true},
      'separator': {'enabled': true},
      /**
       * @this {*}
       * @return {*}
       */
      'titleFormat': function() {
        return this['name'] || this['x'];
      },
      /**
       * @this {*}
       * @return {*}
       */
      'format': function() {
        return 'Value: ' + anychart.core.defaultTheme.locNum(this['value']) + '\nPercent Value: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
      }
    },
    'interactivity': {
      'hoverMode': 'single'
    }
  },

  'defaultScrollBar': {
    'barSize': 10,
    'backgroundFill': '#e0e0e0',
    'backgroundStroke': '#d5d5d5',
    'sliderFill': '#d5d5d5',
    'sliderStroke': '#656565',
    'mouseOverOpacity': 0.45,
    'mouseOutOpacity': 0.25,
    'handlePositionChange': true,
    'startRatio': '0',
    'endRatio': '1',
    'buttonsVisible': false,
    'cornersRadius': 5
  },

  // standalone components
  'standalones': {
    'background': {
      'enabled': true,
      'zIndex': 0
    },
    'label': {
      'enabled': true,
      'text': 'Label text',
      'padding': 0,
      'width': null,
      'height': null,
      'anchor': 'left-top',
      'position': 'left-top',
      'offsetX': 0,
      'offsetY': 0,
      'minFontSize': 8,
      'maxFontSize': 72,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'rotation': 0,
      'zIndex': 0
    },
    'labelsFactory': {
      'enabled': true,
      'zIndex': 0
    },
    'legend': {
      'enabled': true,
      'zIndex': 0
    },
    'markersFactory': {
      'enabled': true,
      'zIndex': 0
    },
    'title': {
      'enabled': true,
      'zIndex': 0
    },
    'linearAxis': {
      'enabled': true,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'polarAxis': {
      'enabled': true,
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radarAxis': {
      'enabled': true,
      'startAngle': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true}
    },
    'radialAxis': {
      'enabled': true,
      'startAngle': 0,
      'innerRadius': 0,
      'zIndex': 0,
      'ticks': {'enabled': true},
      'minorTicks': {'enabled': true},
      'minorLabels': {
        'padding': {
          'top': 1,
          'right': 1,
          'bottom': 0,
          'left': 1
        }
      }
    },
    'linearGrid': {
      'enabled': true,
      'scale': null,
      'zIndex': 0
    },
    'polarGrid': {
      'enabled': true,
      'layout': 'circuit',
      'zIndex': 0
    },
    'radarGrid': {
      'enabled': true,
      'layout': 'circuit',
      'zIndex': 0
    },
    'lineAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'textAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'rangeAxisMarker': {
      'enabled': true,
      'zIndex': 0
    },
    'scroller': {
      'enabled': true
    }
  }
});
