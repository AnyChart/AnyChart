goog.provide('anychart.themes.defaultTheme');


(function() {
  var global = this;

  //region --- Aux functions
  //------------------------------------------------------------------------------
  //
  //  Aux functions
  //
  //------------------------------------------------------------------------------
  var colorStrokeThin = '#EAEAEA';
  var colorStrokeNormal = '#CECECE';
  var colorStrokeBright = '#c1c1c1';
  var colorStrokeExtraBright = '#969EA5';

  var colorFillBackground = '#ffffff';
  var colorFillExtraThin = '#f5f5f5';
  var colorFillBackgroundReversed = '#212121';

  var fontColorNormal = '#7c868e';
  var fontColorBright = '#545f69';
  var fontColorDark = '#212121';

  var defaultHoverColor = '#757575';
  var defaultSelectSolidColor = '#333';
  var defaultSelectColor = '#333 0.85';
  var defaultSelectStroke = '1.5 #212121';

  var stockScrollerUnselected = '#999 0.6';

  var fontColorReversedNormal = '#ffffff';
  var opacityThin = ' 0.3';
  var opacityStrong = ' 0.7';

  var risingColor = '#64b5f6';
  var fallingColor = '#ef6c00';


  /**
   * @const {string}
   */
  var VALUE_TOKEN_DECIMALS_COUNT_2 = '{%Value}{decimalsCount:2}';


  /**
   * @const {string}
   */
  var VALUE_TOKEN_DECIMALS_COUNT_10 = '{%Value}{decimalsCount:10}';


  /**
   * @const {string}
   */
  var PERCENT_VALUE_TOKEN = '{%PercentValue}{decimalsCount:1,zeroFillDecimals:true}';


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
  var locNum = function(val, opt_decimalsCountOrLocale, opt_decimalPoint, opt_groupsSeparator,
                        opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator, opt_useBracketsForNegative) {
    var val_ = (val === null) || (typeof val == 'boolean') || (val == '') ? NaN : +/** @type {number} */(val);
    return isNaN(val_) ? val : global['anychart']['format']['number'](val_, opt_decimalsCountOrLocale, opt_decimalPoint, opt_groupsSeparator,
        opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator, opt_useBracketsForNegative);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnValue = function() {
    return locNum(this['value']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var notRoundedValue = function() {
    return locNum(this['value'], 10);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnName = function() {
    return this['name'] || this['getDataValue']('id');
  };

  var returnMilestoneName = function() {
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
  var returnNameWithValue = function() {
    var name = this['name'] || this['getDataValue']('id');
    return name + '\n' + locNum(this['value']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnValueWithPrefixPostfix = function() {
    return this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'];
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnX = function() {
    return this['x'];
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnDateTimeX = function() {
    return global['anychart']['format']['date'](this['x']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnDateTimeTickValue = function() {
    return global['anychart']['format']['date'](this['tickValue']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor = function() {
    return this['sourceColor'];
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor70 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.7, true);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor65 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.65, true);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor50 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.50, true);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor85 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnDarkenSourceColor = function() {
    return global['anychart']['color']['darken'](this['sourceColor']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnLightenSourceColor = function() {
    return global['anychart']['color']['lighten'](this['sourceColor']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnStrokeSourceColor = function() {
    return global['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnStrokeSourceColor1 = function() {
    return global['anychart']['color']['setThickness'](this['sourceColor'], 1);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnLightenStrokeSourceColor = function() {
    return global['anychart']['color']['setThickness'](global['anychart']['color']['lighten'](this['sourceColor']), 1.5);
  };

  /**
   * @this {*}
   * @return {*}
   */
  var returnThickenedStrokeSourceColor = function() {
    return global['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnDashedStrokeSourceColor = function() {
    return {'color': this['sourceColor'], 'dash': '6 4'};
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnThickenedDashedStrokeSourceColor = function() {
    return {'color': this['sourceColor'], 'dash': '6 4', 'thickness': 1.5};
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnRangeTooltipContentFormatter = function() {
    return 'High: ' + locNum(this['high']) + '\n' +
        'Low: ' + locNum(this['low']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnRangeLabelsContentFormatter = function() {
    return locNum(this['high']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var OHLCTooltipFormatter = function() {
    return 'Open: ' + locNum(this['open']) + '\n' +
        'High: ' + locNum(this['high']) + '\n' +
        'Low: ' + locNum(this['low']) + '\n' +
        'Close: ' + locNum(this['close']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var StockSimpleTooltipFormatter = function() {
    var val = locNum(this['value']);
    return this['seriesName'] + ': ' + this['valuePrefix'] + val + this['valuePostfix'];
  };


  /**
   * @this {*}
   * @return {*}
   */
  var StockRangeTooltipFormatter = function() {
    return this['seriesName'] + ':\n' +
        '  High: ' + locNum(this['high']) + '\n' +
        '  Low: ' + locNum(this['low']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var StockOHLCTooltipFormatter = function() {
    return this['seriesName'] + ':\n' +
        '  Open: ' + locNum(this['open']) + '\n' +
        '  High: ' + locNum(this['high']) + '\n' +
        '  Low: ' + locNum(this['low']) + '\n' +
        '  Close: ' + locNum(this['close']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnStrokeWithThickness = function() {
    return global['anychart']['color']['setThickness'](this['sourceColor'], 1.5);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var chartA11yTitleFormatter = function() {
    var chart = this['chart'];
    var title = chart['title']();
    var titleText = title && title['enabled']() && title['text']() ? title['text']() : '';
    var type = chart['getType']();
    var typeText = type || 'Anychart ';
    return typeText + ' chart ' + (titleText ? ' entitled ' + titleText : '');
  };


  /**
   * @this {*}
   * @return {*}
   */
  var pieA11yTitleFormatter = function() {
    var chart = this['chart'];
    var res = chartA11yTitleFormatter.apply(this);
    res += ', with ' + chart['getStat']('count') + ' points. ';
    res += 'Min value is ' + chart['getStat']('min') + ', max value is ' + chart['getStat']('max') + '.';
    return res;
  };


  /**
   * @this {*}
   * @return {*}
   */
  var bulletA11yTitleFormatter = function() {
    var res = chartA11yTitleFormatter.apply(this);
    return res + '. ';
  };


  /**
   * @this {*}
   * @return {*}
   */
  var cartesianBaseA11yTitleFormatter = function() {
    var chart = this['chart'];
    var res = chartA11yTitleFormatter.call(this);
    var seriesLength = chart['getSeriesCount']();

    var seriesMap = {};
    for (var i = 0; i < seriesLength; i++) {
      var ser = chart['getSeriesAt'](i);
      var type = ser['seriesType']();
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

    var yScale = chart['yScale']();
    var xScale = chart['xScale']();
    var xType = xScale['getType']();
    var yType = yScale['getType']();

    if (yType == 'ordinal') { //By xml-scheme, enums.ScaleTypes
      var yVals = yScale['values']();
      res += 'Y-scale with ' + yVals.length + ' categories: ';
      for (var y = 0; y < yVals.length; y++) {
        res += yVals[y] + ', ';
      }
      res += '. ';
    } else if (yType == 'dateTime') {
      res += 'Y-scale minimum value is ' + global['anychart']['format']['dateTime'](yScale['minimum']()) +
          ' , maximum value is ' + global['anychart']['format']['dateTime'](yScale['maximum']()) + '. ';
    } else { // log/linear.
      res += 'Y-scale minimum value is ' + yScale['minimum']() + ' , maximum value is ' + yScale['maximum']() + '. ';
    }

    if (xType == 'ordinal') {
      var xVals = xScale['values']();
      res += 'X-scale with ' + xVals.length + ' categories: ';
      for (var x = 0; x < xVals.length; x++) {
        res += xVals[x] + ', ';
      }
      res += '. ';
    } else if (xType == 'dateTime') {
      res += 'X-scale minimum value is ' + global['anychart']['format']['dateTime'](xScale['minimum']()) +
          ' , maximum value is ' + global['anychart']['format']['dateTime'](xScale['maximum']()) + '. ';
    } else { // log/linear.
      res += 'X-scale minimum value is ' + xScale['minimum']() + ' , maximum value is ' + xScale['maximum']() + '. ';
    }

    return res;
  };


  /**
   * @this {*}
   * @return {*}
   */
  var stockBaseA11yTitleFormatter = function() {
    var chart = this['chart'];
    var res = chartA11yTitleFormatter.call(this);
    var seriesLength = chart['getSeriesCount']();

    var seriesMap = {};
    for (var i = 0; i < seriesLength; i++) {
      var ser = chart['getSeriesAt'](i);
      var type = ser['seriesType']();
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

    var xScale = chart['xScale']();

    res += 'X-scale minimum value is ' + global['anychart']['format']['dateTime'](xScale['getMinimum']()) +
        ' , maximum value is ' + global['anychart']['format']['dateTime'](xScale['getMaximum']()) + '. ';

    return res;
  };


  /**
   * @this {*}
   * @return {*}
   */
  var scatterA11yTitleFormatter = function() {
    var chart = this['chart'];
    var res = chartA11yTitleFormatter.call(this);
    var seriesLength = chart['getSeriesCount']();

    var seriesMap = {};
    for (var i = 0; i < seriesLength; i++) {
      var ser = chart['getSeriesAt'](i);
      var type = ser['getType']();
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

    var yScale = chart['yScale']();
    var xScale = chart['xScale']();
    var xType = xScale['getType']();
    var yType = yScale['getType']();

    if (yType == 'ordinal') { //By xml-scheme, enums.ScaleTypes
      var yVals = yScale['values']();
      res += 'Y-scale with ' + yVals.length + ' categories: ';
      for (var y = 0; y < yVals.length; y++) {
        res += yVals[y] + ', ';
      }
      res += '. ';
    } else if (yType == 'dateTime') {
      res += 'Y-scale minimum value is ' + global['anychart']['format']['dateTime'](yScale['minimum']()) +
          ' , maximum value is ' + global['anychart']['format']['dateTime'](yScale['maximum']()) + '. ';
    } else { // log/linear.
      res += 'Y-scale minimum value is ' + yScale['minimum']() + ' , maximum value is ' + yScale['maximum']() + '. ';
    }

    if (xType == 'ordinal') {
      var xVals = xScale['values']();
      res += 'X-scale with ' + xVals.length + ' categories: ';
      for (var x = 0; x < xVals.length; x++) {
        res += xVals[x] + ', ';
      }
      res += '. ';
    } else if (xType == 'dateTime') {
      res += 'X-scale minimum value is ' + global['anychart']['format']['dateTime'](xScale['minimum']()) +
          ' , maximum value is ' + global['anychart']['format']['dateTime'](xScale['maximum']()) + '. ';
    } else { // log/linear.
      res += 'X-scale minimum value is ' + xScale['minimum']() + ' , maximum value is ' + xScale['maximum']() + '. ';
    }

    return res;
  };

  /**
   * @param {*} contextProvider
   * @return {*}
   */
  var tooltipTitleFormatter = function(contextProvider) {
    switch (contextProvider['xScaleType']) {
      case 'dateTime':
        return window['anychart']['format']['date'](contextProvider['x']);
      default:
        return locNum(contextProvider['x']);
    }
  };
  //endregion

  global['anychart'] = global['anychart'] || {};
  global['anychart']['themes'] = global['anychart']['themes'] || {};
  global['anychart']['themes']['defaultTheme'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']
    },
    'hatchFillPalette': {
      'items': ['backwardDiagonal', 'forwardDiagonal', 'horizontal', 'vertical', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90']
    },
    'hatchFillPaletteFor3D': {
      'items': ['backwardDiagonal', 'forwardDiagonal', 'dashedBackwardDiagonal', 'grid', 'dashedForwardDiagonal', 'dashedHorizontal', 'dashedVertical', 'diagonalCross', 'diagonalBrick', 'divot', 'horizontalBrick', 'verticalBrick', 'checkerBoard', 'confetti', 'plaid', 'solidDiamond', 'zigZag', 'weave', 'percent05', 'percent10', 'percent20', 'percent25', 'percent30', 'percent40', 'percent50', 'percent60', 'percent70', 'percent75', 'percent80', 'percent90', 'horizontal', 'vertical']
    },
    'markerPalette': {
      'items': ['circle', 'diamond', 'square', 'triangleDown', 'triangleUp', 'diagonalCross', 'pentagon', 'cross', 'vline', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
    },

    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#90caf9', '#01579b', rangesCount);
        //return global['anychart']['color']['blendedHueProgression']('#ffd54f', '#ef6c00', rangesCount); //todo: delete after final choice
      }
    },

    'defaultLinearColorScale': {'colors': ['#90caf9', '#01579b']},

    'defaultFontSettings': {
      'fontSize': 13,
      'fontFamily': 'Verdana, Helvetica, Arial, sans-serif',
      'fontColor': fontColorNormal,
      'textDirection': 'ltr',
      'fontOpacity': 1,
      'fontDecoration': 'none',
      'fontStyle': 'normal',
      'fontVariant': 'normal',
      'fontWeight': 'normal',
      'letterSpacing': 'normal',
      'lineHeight': 'normal',
      'textIndent': 0,
      'vAlign': 'top',
      'hAlign': 'start',
      'textWrap': 'byLetter',
      'textOverflow': '',
      'selectable': false,
      'disablePointerEvents': false,
      'useHtml': false
    },

    'defaultBackground': {
      'enabled': false,
      'fill': colorFillBackground,
      'stroke': 'none',
      'cornerType': 'round',
      'corners': 0
    },

    'defaultSeparator': {
      'enabled': false,
      'fill': colorStrokeNormal + opacityThin,
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
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'anchor': 'center',
      'padding': {'top': 4, 'right': 4, 'bottom': 4, 'left': 4},
      'rotation': 0,
      'textFormatter': returnValue,
      'positionFormatter': returnValue
    },

    'defaultMarkerFactory': {
      'anchor': 'center',
      'size': 6,
      'offsetX': 0,
      'offsetY': 0,
      'rotation': 0,
      'positionFormatter': returnValue
    },

    'defaultTitle': {
      'enabled': false,
      'fontSize': 16,
      'text': 'Title text',
      'width': null,
      'height': null,
      'align': 'center',
      'hAlign': 'center',
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
    },

    'defaultTooltip': {
      'enabled': true,
      'title': {
        'enabled': false,
        'fontColor': fontColorReversedNormal,
        'text': '',
        'fontSize': 14,
        'rotation': 0,
        'width': null,
        'height': null,
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
        'fontColor': fontColorReversedNormal,
        'hAlign': 'left',
        'text': 'Tooltip Text',
        'width': null,
        'height': null,
        'anchor': 'leftTop',
        'offsetX': 0,
        'offsetY': 0,
        'position': 'leftTop',
        'adjustFontSize': {
          'width': false,
          'height': false
        },
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
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
      'fontColor': fontColorReversedNormal,
      // 'hAlign': 'left',
      'text': 'Tooltip Text',
      'width': null,
      'height': null,
      'adjustFontSize': {
        'width': false,
        'height': false
      },
      'background': {
        'enabled': true,
        'fill': colorFillBackgroundReversed + opacityStrong,
        'corners': 3,
        'zIndex': 0,
        'cornerType': 'round'
      },
      'offsetX': 10,
      'offsetY': 10,
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'valuePrefix': '',
      'valuePostfix': '',
      'position': 'leftTop',
      'anchor': 'leftTop',
      'hideDelay': 0,
      'titleFormatter': returnValue,
      'textFormatter': returnValueWithPrefixPostfix,
      'unionTextFormatter': function() {
        return this['formattedValues'].join('\n');
      },
      'zIndex': 0
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
      'overlapMode': 'noOverlap',
      'stroke': colorStrokeNormal,
      'title': {
        'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
        'enabled': false,
        'fontSize': 13,
        'text': 'Axis title',
        'fontColor': fontColorBright,
        'zIndex': 35
      },
      'labels': {
        'enabled': true,
        'textFormatter': notRoundedValue,
        'positionFormatter': returnValue,
        'zIndex': 35
      },
      'minorLabels': {
        'enabled': false,
        'fontSize': 9,
        'textFormatter': notRoundedValue,
        'positionFormatter': returnValue,
        'zIndex': 35
      },
      'ticks': {
        'enabled': true,
        'length': 6,
        'position': 'outside',
        'stroke': colorStrokeNormal,
        'zIndex': 35
      },
      'minorTicks': {
        'enabled': false,
        'length': 4,
        'position': 'outside',
        'stroke': colorStrokeThin,
        'zIndex': 35
      },
      'zIndex': 35
    },

    'defaultGridSettings': {
      'enabled': true,
      'isMinor': false,
      'drawFirstLine': true,
      'drawLastLine': true,
      'oddFill': 'none',
      'evenFill': 'none',
      'stroke': colorStrokeNormal,
      'scale': 1,
      'zIndex': 11
    },

    'defaultMinorGridSettings': {
      'isMinor': true,
      'stroke': colorStrokeThin,
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
      'scale': 1
    },

    'defaultTextMarkerSettings': {
      'enabled': true,
      'fontSize': 12,
      'value': 0,
      'anchor': 'center',
      'align': 'center',
      'layout': null,
      'offsetX': 0,
      'offsetY': 0,
      'text': 'Text marker',
      'width': null,
      'height': null,
      'zIndex': 25.3,
      'scale': 1
    },

    'defaultRangeMarkerSettings': {
      'enabled': true,
      'from': 0,
      'to': 0,
      'layout': null,
      'fill': colorStrokeBright + ' 0.4',
      'zIndex': 25.1,
      'scale': 1
    },

    'defaultLegend': {
      'enabled': false,
      'vAlign': 'bottom',
      'fontSize': 12,
      'textOverflow': '...',
      'itemsLayout': 'horizontal',
      'positionMode': 'outside',
      'itemsSpacing': 15,
      'items': null,
      'itemsFormatter': null,
      'itemsTextFormatter': null,
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
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'title': {
        'fontSize': 15
      },
      'paginator': {
        'enabled': true,
        'fontSize': 12,
        'fontColor': fontColorBright,
        'orientation': 'right',
        'layout': 'horizontal',
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 5},
        'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
        'zIndex': 30,
        'buttonsSettings': {
          'normal': {
            'stroke': '#757575',
            'fill': '#9e9e9e'
          },
          'hover': {
            'stroke': '#546e7a',
            'fill': fontColorNormal
          },
          'pushed': {
            'stroke': fontColorNormal,
            'fill': '#9e9e9e'
          },
          'disabled': {
            'stroke': null,
            'fill': '#e0e0e0'
          }
        }
      },
      'titleFormatter': null,
      'tooltip': {
        'enabled': false,
        'allowLeaveScreen': false,
        'allowLeaveChart': true,
        'title': {'enabled': false}
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
      'textFormatter': returnValue,
      'enabled': true,
      'fontSize': 12,
      'minFontSize': 8,
      'maxFontSize': 16,
      'fontColor': fontColorReversedNormal,
      'fontWeight': 400,
      'disablePointerEvents': true,
      'text': 'Label text',
      'background': {
        'enabled': true,
        'disablePointerEvents': true,
        'fill': colorFillBackgroundReversed + opacityStrong,
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

    'defaultColorRange': {
      'enabled': false,
      'stroke': '#B9B9B9',
      'orientation': 'bottom',
      'title': {'enabled': false},
      'colorLineSize': 10,
      'padding': {'top': 10, 'right': 0, 'bottom': 0, 'left': 0},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'align': 'center',
      'length': '50%',
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'positionFormatter': returnValue,
        'enabled': true,
        'disablePointerEvents': false,
        'position': 'center',
        'rotation': 0,
        'anchor': 'center',
        'offsetX': 0,
        'offsetY': 0,
        'type': 'triangleDown',
        'fill': defaultSelectColor,
        'stroke': 'none',
        'size': 7
      },
      'labels': {
        'offsetX': 0,
        'offsetY': 0,
        'fontSize': 11,
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
      },
      'ticks': {
        'stroke': '#B9B9B9', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#B9B9B9', 'position': 'outside', 'length': 3, 'enabled': false
      }
    },

    'defaultCallout': {
      'enabled': true,
      'orientation': 'left',
      'title': {'enabled': false},
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'align': 'center',
      'labels': {
        'enabled': true,
        'vAlign': 'center',
        'hAlign': 'center',
        'positionFormatter': returnValue,
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
      'position': 'afterAxes',
      'allowRangeChange': true,
      'thumbs': {
        'enabled': true,
        'autoHide': false,
        'fill': '#E9E9E9',
        'stroke': '#7c868e',
        'hoverFill': '#ffffff',
        'hoverStroke': defaultHoverColor
      },
      'inverted': false,
      'zIndex': 35
    },

    'defaultGroupingSettings': {
      'enabled': true,
      'forced': false,
      'levels': [
        {'unit': 'millisecond', 'count': 1},
        {'unit': 'millisecond', 'count': 5},
        {'unit': 'millisecond', 'count': 10},
        {'unit': 'millisecond', 'count': 25},
        {'unit': 'millisecond', 'count': 50},
        {'unit': 'millisecond', 'count': 100},
        {'unit': 'millisecond', 'count': 250},
        {'unit': 'millisecond', 'count': 500},
        {'unit': 'second', 'count': 1},
        {'unit': 'second', 'count': 5},
        {'unit': 'second', 'count': 10},
        {'unit': 'second', 'count': 20},
        {'unit': 'second', 'count': 30},
        {'unit': 'minute', 'count': 1},
        {'unit': 'minute', 'count': 5},
        {'unit': 'minute', 'count': 15},
        {'unit': 'minute', 'count': 30},
        {'unit': 'hour', 'count': 1},
        {'unit': 'hour', 'count': 2},
        {'unit': 'hour', 'count': 6},
        {'unit': 'hour', 'count': 12},
        {'unit': 'day', 'count': 1},
        {'unit': 'week', 'count': 1},
        {'unit': 'month', 'count': 1},
        {'unit': 'month', 'count': 3},
        {'unit': 'month', 'count': 6},
        {'unit': 'year', 'count': 1}
      ],
      'maxVisiblePoints': 500,
      'minPixPerPoint': NaN
    },

    'stageCredits': {
      'text': 'AnyChart',
      'url': 'http://www.anychart.com/?utm_source=registered',
      'alt': 'AnyChart - JavaScript Charts designed to be embedded and integrated',
      'imgAlt': 'AnyChart - JavaScript Charts',
      'logoSrc': 'https://static.anychart.com/logo.png'
    },

    'chart': {
      'enabled': true,
      'padding': {'top': 10, 'right': 20, 'bottom': 15, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'background': {'enabled': true, 'zIndex': 1},
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
        'selectionMode': 'multiSelect',
        'spotRadius': 2,
        'allowMultiSeriesSelection': true
      },
      'tooltip': {
        'allowLeaveScreen': false,
        'allowLeaveChart': true,
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
        'titleFormatter': function() {
          return tooltipTitleFormatter(this['points'][0]);
        },
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
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
            'titleFormatter': function() {
              return tooltipTitleFormatter(this);
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return this['seriesName'] + ': ' + this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'];
            },
            'zIndex': 0
          },
          'hatchFill': false,
          'hoverHatchFill': null,
          'selectHatchFill': null,
          'labels': {
            'anchor': 'auto',
            'position': 'value'
          },
          'hoverLabels': {'enabled': null},
          'selectLabels': {'enabled': null},
          'markers': {
            'enabled': false,
            'disablePointerEvents': false,
            'position': 'value',
            'positionFormatter': returnValue,
            'size': 4
          },
          'hoverMarkers': {
            'enabled': null,
            'size': 6
          },
          'selectMarkers': {
            'enabled': null,
            'fill': defaultSelectColor,
            'stroke': defaultSelectStroke,
            'size': 6
          },
          'legendItem': {
            'enabled': true,
            'iconType': 'square'
          },
          'fill': returnSourceColor65,
          'hoverFill': returnSourceColor,
          'selectFill': defaultSelectColor,
          'stroke': returnStrokeSourceColor,
          'hoverStroke': returnLightenStrokeSourceColor,
          'selectStroke': defaultSelectColor,
          'lowStroke': returnStrokeSourceColor,
          'hoverLowStroke': returnLightenStrokeSourceColor,
          'selectLowStroke': defaultSelectColor,
          'highStroke': returnStrokeSourceColor,
          'hoverHighStroke': returnLightenStrokeSourceColor,
          'selectHighStroke': defaultSelectColor,
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
            'xErrorStroke': returnDarkenSourceColor,
            'valueErrorStroke': returnDarkenSourceColor
          },
          'pointWidth': null,
          'connectMissingPoints': false,
          'a11y': {
            'enabled': false,
            'titleFormatter': 'Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}'
          }
        },
        'marker': {
          'fill': returnSourceColor,
          'stroke': returnStrokeWithThickness,
          'hoverFill': returnLightenSourceColor,
          'hoverStroke': returnStrokeWithThickness,
          'selectFill': defaultSelectColor,
          'selectStroke': defaultSelectStroke,
          'size': 4,
          'hoverSize': 6,
          'selectSize': 6,
          'legendItem': {
            'iconStroke': 'none'
          },
          'labels': {
            'offsetY': 3
          }
        },
        'bubble': {
          'fill': returnSourceColor70,
          'hoverFill': returnSourceColor50,
          'displayNegative': false,
          /**
           * @this {*}
           * @return {*}
           */
          'negativeFill': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](this['sourceColor'])));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'hoverNegativeFill': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](
                        global['anychart']['color']['darken'](this['sourceColor']))));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'selectNegativeFill': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](this['sourceColor'])));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'negativeStroke': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](
                        global['anychart']['color']['darken'](this['sourceColor']))));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'hoverNegativeStroke': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](
                        global['anychart']['color']['darken'](
                            global['anychart']['color']['darken'](this['sourceColor'])))));
          },
          /**
           * @this {*}
           * @return {*}
           */
          'selectNegativeStroke': function() {
            return global['anychart']['color']['darken'](
                global['anychart']['color']['darken'](
                    global['anychart']['color']['darken'](
                        global['anychart']['color']['darken'](this['sourceColor']))));
          },
          'negativeHatchFill': false,
          'hoverNegativeHatchFill': null,
          'selectNegativeHatchFill': null,
          'legendItem': {
            'iconStroke': 'none'
          },
          'labels': {
            'anchor': 'center'
          }
        },
        'areaLike': {
          'fill': returnSourceColor65,
          'hoverFill': returnSourceColor65,
          'hoverMarkers': {
            'enabled': true
          },
          'selectMarkers': {
            'enabled': true
          },
          'legendItem': {
            'iconStroke': 'none'
          },
          'stepDirection': 'center'
        },
        'barLike': {
          'fill': returnSourceColor85,
          'hoverFill': returnSourceColor65,
          'legendItem': {
            'iconStroke': 'none'
          }
        },
        'lineLike': {
          'hoverMarkers': {
            'enabled': true
          },
          'selectMarkers': {
            'enabled': true
          },
          'stepDirection': 'center'
        },
        'rangeLike': {
          'labels': {
            'textFormatter': returnRangeLabelsContentFormatter,
            'position': 'high'
          },
          'markers': {
            'position': 'high'
          },
          'tooltip': {
            // 'titleFormatter': returnX,
            'textFormatter': returnRangeTooltipContentFormatter
          }
        },
        'candlestick': {
          'risingFill': risingColor,
          'risingStroke': risingColor,
          'hoverRisingFill': returnLightenSourceColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingFill': fallingColor,
          'fallingStroke': fallingColor,
          'hoverFallingFill': returnLightenSourceColor,
          'hoverFallingStroke': returnDarkenSourceColor,

          'risingHatchFill': false,
          'hoverRisingHatchFill': null,
          'selectRisingHatchFill': null,
          'fallingHatchFill': false,
          'hoverFallingHatchFill': null,
          'selectFallingHatchFill': null,
          'selectFallingFill': defaultSelectColor,
          'selectRisingFill': defaultSelectColor,
          'selectRisingStroke': defaultSelectColor,
          'selectFallingStroke': defaultSelectColor,
          'tooltip': {
            'textFormatter': OHLCTooltipFormatter
          },
          'markers': {
            'position': 'high'
          },
          'labels': {
            'position': 'high',
            'textFormatter': returnX
          }
        },
        'column': {
          'isVertical': false,
          'labels': {
            'offsetY': 3
          }
        },
        'ohlc': {
          'risingStroke': risingColor,
          'hoverRisingStroke': returnDarkenSourceColor,
          'fallingStroke': fallingColor,
          'hoverFallingStroke': returnDarkenSourceColor,
          'selectRisingStroke': '3 ' + defaultSelectColor,
          'selectFallingStroke': '3 ' + defaultSelectColor,
          'tooltip': {
            'textFormatter': OHLCTooltipFormatter
          },
          'markers': {
            'position': 'high'
          },
          'labels': {
            'position': 'high',
            'textFormatter': returnX
          }
        },
        'stick': {
          'stroke': returnStrokeSourceColor1
        },
        'jumpLine': {
          'pointWidth': '100%'
        }
      },
      'defaultLabelSettings': {
        'enabled': true,
        'text': 'Chart label',
        'width': null,
        'height': null,
        'anchor': 'leftTop',
        'position': 'leftTop',
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
      'chartLabels': [],
      'maxBubbleSize': '20%',
      'minBubbleSize': '5%',
      'a11y': {
        'enabled': true,
        'titleFormatter': chartA11yTitleFormatter,
        'mode': 'chartElements'
      },
      'defaultAnnotationSettings': {
        'base': {
          'enabled': true,
          'fill': returnSourceColor50,
          'stroke': returnSourceColor,
          'hatchFill': null,
          'hoverFill': returnSourceColor70,
          'hoverStroke': returnDarkenSourceColor,
          'selectFill': returnSourceColor70,
          'selectStroke': returnDarkenSourceColor,
          'markers': {
            'enabled': false,
            'size': 5,
            'type': 'square',
            'fill': '#ffff66',
            'stroke': '#333333'
          },
          'hoverMarkers': {
            'enabled': null
          },
          'selectMarkers': {
            'enabled': true
          },
          'labels': {
            'enabled': true,
            'position': 'centerTop',
            'anchor': 'centerTop',
            /**
             * @return {*}
             * @this {*}
             */
            'textFormatter': function() {
              return this['level'];
            }
          },
          'hoverLabels': {
            'enabled': null
          },
          'selectLabels': {
            'enabled': null
          },
          'color': '#e06666',
          'allowEdit': true,
          'hoverGap': 5
        },
        'ray': {},
        'line': {},
        'infiniteLine': {},
        'verticalLine': {},
        'horizontalLine': {},
        'rectangle': {},
        'ellipse': {},
        'triangle': {},
        'trendChannel': {},
        'andrewsPitchfork': {},
        'fibonacciFan': {
          'levels': [
            0,
            0.382,
            0.5,
            0.618,
            1
          ],
          'timeLevels': [
            0,
            0.382,
            0.5,
            0.618,
            1
          ]
        },
        'fibonacciArc': {
          'levels': [
            0.236,
            0.382,
            0.5,
            0.618,
            0.764,
            1
          ]
        },
        'fibonacciRetracement': {
          'levels': [
            0,
            0.236,
            0.382,
            0.5,
            0.618,
            0.764,
            1,
            1.236,
            1.382,
            1.5,
            1.618,
            1.764,
            2.618,
            4.236
          ],
          'labels': {
            'position': 'leftCenter',
            'anchor': 'rightCenter'
          }
        },
        'fibonacciTimezones': {
          'levels': [
            0,
            1,
            2,
            3,
            5,
            8,
            13,
            21,
            34,
            55,
            89,
            144,
            233,
            377,
            610,
            987,
            1597,
            2584,
            4181,
            6765,
            10946,
            17711,
            28657,
            46368,
            75025,
            121393,
            196418,
            317811,
            514229,
            832040,
            1346269,
            2178309,
            3524578,
            5702887,
            9227465,
            14930352,
            24157817,
            39088169
          ]
        },
        'marker': {
          'markerType': 'arrowUp',
          'size': 20,
          'anchor': 'centerTop',
          'offsetX': 0,
          'offsetY': 0
        },
        'label': {}
      }
    },

    'cartesianBase': {
      'defaultSeriesSettings': {
        'base': {
          'labels': {
            'textFormatter': VALUE_TOKEN_DECIMALS_COUNT_2
          }
        },
        'bar': {
          'isVertical': true,
          'labels': {
            'offsetY': 3
          },
          'tooltip': {
            'anchor': 'leftTop'
          }
        },
        'column': {
          'tooltip': {
            'anchor': 'leftTop'
          }
        },
        'rangeColumn': {
          'isVertical': false,
          'tooltip': {
            'anchor': 'leftTop',
            'offsetX': 10
          }
        },
        'rangeBar': {
          'isVertical': true,
          'labels': {
            'offsetY': 3
          }
        },
        'box': {
          'medianStroke': returnDarkenSourceColor,
          'hoverMedianStroke': returnSourceColor,
          'selectMedianStroke': defaultSelectColor,
          'stemStroke': returnDarkenSourceColor,
          'hoverStemStroke': returnSourceColor,
          'selectStemStroke': defaultSelectColor,
          'whiskerStroke': returnDarkenSourceColor,
          'hoverWhiskerStroke': returnDarkenSourceColor,
          'selectWhiskerStroke': defaultSelectColor,
          'whiskerWidth': 0,
          'hoverWhiskerWidth': null,
          'selectWhiskerWidth': null,
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
            'positionFormatter': returnValue
          },
          'hoverOutlierMarkers': {
            'enabled': null,
            'size': 4
          },
          'selectOutlierMarkers': {
            'enabled': null,
            'size': 4,
            'fill': defaultSelectColor,
            'stroke': defaultSelectStroke
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
            'textFormatter': function() {
              return 'Highest: ' + locNum(this['highest']) + '\n' +
                  'Median: ' + locNum(this['median']) + '\n' +
                  'Lowest: ' + locNum(this['lowest']);
            }
          },
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'titleFormatter': function() {
              return this['name'] || this['x'];
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'Lowest: ' + this['valuePrefix'] + locNum(this['lowest']) + this['valuePostfix'] + '\n' +
                  'Q1: ' + this['valuePrefix'] + locNum(this['q1']) + this['valuePostfix'] + '\n' +
                  'Median: ' + this['valuePrefix'] + locNum(this['median']) + this['valuePostfix'] + '\n' +
                  'Q3: ' + this['valuePrefix'] + locNum(this['q3']) + this['valuePostfix'] + '\n' +
                  'Highest: ' + this['valuePrefix'] + locNum(this['highest']) + this['valuePostfix'];
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
          'textFormatter': VALUE_TOKEN_DECIMALS_COUNT_10
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
          'textFormatter': VALUE_TOKEN_DECIMALS_COUNT_10
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
      'grids': [],
      'minorGrids': [],
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
          'type': 'ordinal',
          'inverted': false,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'crosshair': {
        'enabled': false,
        'displayMode': 'float',
        'xStroke': colorStrokeExtraBright,
        'yStroke': colorStrokeExtraBright,
        'zIndex': 41
      },
      'xZoom': {
        'continuous': true,
        'startRatio': 0,
        'endRatio': 1
      },
      'a11y': {
        'titleFormatter': cartesianBaseA11yTitleFormatter
      }
    },

    // merge with cartesianBase
    'cartesian': {
      'defaultSeriesType': 'line',
      'isVertical': false,
      'xAxes': [],
      'yAxes': []
    },

    // merge with cartesianBase
    'area': {
      'defaultSeriesType': 'area',
      'tooltip': {
        'displayMode': 'union'
      },
      'interactivity': {
        'hoverMode': 'byX'
      }
    },
    'bar': {
      'isVertical': true,
      'defaultSeriesType': 'bar',
      'defaultXAxisSettings': {
        'orientation': 'left'
      },
      'defaultYAxisSettings': {
        'orientation': 'bottom'
      },
      'scales': [
        {
          'type': 'ordinal',
          'inverted': true,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'tooltip': {
        'displayMode': 'single',
        'position': 'rightCenter',
        'anchor': 'leftCenter'
      },
      'xScroller': {
        'orientation': 'left'
      }
    },
    'column': {
      'defaultSeriesType': 'column',
      'tooltip': {
        'displayMode': 'single',
        'position': 'centerTop',
        'anchor': 'centerBottom',
        'offsetX': 0,
        'offsetY': 10
      }
    },
    'line': {
      'defaultSeriesType': 'line',
      'tooltip': {
        'displayMode': 'union'
      },
      'interactivity': {
        'hoverMode': 'byX'
      }
    },
    'box': {
      'defaultSeriesType': 'box'
    },
    'financial': {
      'defaultSeriesType': 'candlestick',
      'defaultSeriesSettings': {
        'candlestick': {
          'tooltip': {
            'titleFormatter': returnDateTimeX
          },
          'labels': {
            'textFormatter': returnDateTimeX
          }
        },
        'ohlc': {
          'tooltip': {
            'titleFormatter': returnDateTimeX
          },
          'labels': {
            'textFormatter': returnDateTimeX
          }
        }
      },
      'xAxes': [
        {
          'labels': {
            'textFormatter': returnDateTimeTickValue
          },
          'minorLabels': {
            'textFormatter': returnDateTimeTickValue
          }
        }
      ],
      'scales': [
        {
          'type': 'dateTime',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'count': 4
          },
          'minorTicks': {
            'count': 4
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ]
    },
    'verticalLine': {
      'isVertical': true,
      'defaultSeriesType': 'line',
      'defaultXAxisSettings': {
        'orientation': 'left'
      },
      'defaultYAxisSettings': {
        'orientation': 'bottom'
      },
      'scales': [
        {
          'type': 'ordinal',
          'inverted': true,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'tooltip': {
        'displayMode': 'union'
      },
      'interactivity': {
        'hoverMode': 'byX'
      },
      'xScroller': {
        'orientation': 'left'
      }
    },
    'verticalArea': {
      'isVertical': true,
      'defaultSeriesType': 'area',
      'defaultXAxisSettings': {
        'orientation': 'left'
      },
      'defaultYAxisSettings': {
        'orientation': 'bottom'
      },
      'scales': [
        {
          'type': 'ordinal',
          'inverted': true,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'tooltip': {
        'displayMode': 'union'
      },
      'interactivity': {
        'hoverMode': 'byX'
      },
      'xScroller': {
        'orientation': 'left'
      }
    },
    'pareto': {
      'defaultSeriesType': 'column',
      'tooltip': {
        'displayMode': 'union'
      },
      'interactivity': {
        'hoverMode': 'byX'
      },
      'yAxes': [
        {
          'orientation': 'left'
        },
        {
          'orientation': 'right',
          'labels': {
            'textFormatter': '{%Value}%'
          }
        }
      ]
    },

    // merges with nothing
    'cartesian3dBase': {
      'defaultSeriesType': 'column',
      'zAngle': 45,
      'zAspect': '50%',
      'zDistribution': false,
      'zPadding': 10,
      'defaultSeriesSettings': {
        'base': {
          'stroke': 'none',
          'fill': returnSourceColor,
          'hoverStroke': returnSourceColor,
          'hoverFill': returnLightenSourceColor,
          'selectStroke': returnSourceColor,
          'selectFill': defaultSelectSolidColor,
          'tooltip': {
            'anchor': 'leftTop',
            'position': 'leftTop'
          }
        }
      }
    },
    // merge with area
    'bar3d': {
      'defaultSeriesType': 'bar',
      'grids': [
        {},
        {
          'enabled': true,
          'layout': 'horizontal',
          'scale': 0
        }
      ]
    },
    // merge with column
    'column3d': {
      'defaultSeriesType': 'column',
      'grids': [
        {},
        {
          'enabled': true,
          'layout': 'vertical',
          'scale': 0
        }
      ]
    },
    // merge with area
    'area3d': {
      'defaultSeriesType': 'area',
      'zDistribution': true,
      'zPadding': 5,
      'grids': [
        {},
        {
          'enabled': true,
          'layout': 'vertical',
          'scale': 0
        }
      ]
    },
    // merge with cartesian
    'cartesian3d': {},

    // merge with chart
    'pieFunnelPyramidBase': {
      'animation': {
        'duration': 500
      },
      'fill': returnSourceColor,
      'stroke': 'none',
      'hoverFill': returnLightenSourceColor,
      'hoverStroke': returnSourceColor,
      'selectFill': defaultSelectColor,
      'selectStroke': defaultSelectStroke,
      'connectorStroke': colorStrokeNormal,
      'overlapMode': 'noOverlap',
      'connectorLength': 20,
      'hatchFill': null,
      'forceHoverLabels': false,
      'labels': {
        'enabled': true,
        'fontColor': null,
        'position': 'inside',
        'disablePointerEvents': false,
        'anchor': 'center',
        'rotation': 0,
        'autoRotate': false,
        'width': null,
        'height': null,
        'zIndex': 34,
        'positionFormatter': returnValue,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return this['name'] ? this['name'] : this['x'];
        }
      },
      'outsideLabels': {
        'disablePointerEvents': false,
        'autoColor': fontColorBright
      },
      'insideLabels': {
        'disablePointerEvents': true,
        'autoColor': fontColorReversedNormal
      },
      'hoverLabels': {
        'enabled': null
      },
      'selectLabels': {
        'enabled': null
      },
      'legend': {
        'enabled': true,
        'padding': {'top': 10, 'right': 10, 'bottom': 0, 'left': 10},
        'position': 'bottom'
      },
      'markers': {
        'enabled': false,
        'position': 'center',
        'positionFormatter': returnValue,
        'zIndex': 33
      },
      'hoverMarkers': {
        'enabled': null
      },
      'selectMarkers': {
        'enabled': null
      },
      'tooltip': {
        'enabled': true,
        'title': {'enabled': true},
        'separator': {'enabled': true},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          return this['name'] || this['x'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return 'Value: ' + locNum(this['value']) + '\nPercent Value: ' + (this['value'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
        }
      },
      'interactivity': {
        'hoverMode': 'single'
      }
    },
    // merge with pieFunnelPyramidBase
    'pie': {
      'animation': {
        'duration': 2000
      },
      'title': {
        'text': 'Pie Chart'
      },
      'group': false,
      'sort': 'none',
      'radius': '45%',
      'innerRadius': 0,
      'startAngle': 0,
      'explode': 15,
      'outsideLabelsCriticalAngle': 60,
      'outsideLabelsSpace': 30,
      'insideLabelsOffset': '50%',
      'labels': {
        'textFormatter': PERCENT_VALUE_TOKEN + '%'
      },
      'a11y': {
        'titleFormatter': pieA11yTitleFormatter
      }
    },
    'funnel': {
      'title': {
        'text': 'Funnel Chart'
      },
      'baseWidth': '70%',
      'neckWidth': '30%',
      'neckHeight': '25%',
      'pointsPadding': 0,
      'labels': {
        'position': 'outsideLeftInColumn'
      }
    },
    'pyramid': {
      'title': {
        'text': 'Pyramid Chart'
      },
      'baseWidth': '70%',
      'pointsPadding': 0,
      'legend': {
        'inverted': true
      },
      'labels': {
        'position': 'outsideLeftInColumn'
      },
      'reversed': false
    },

    // merge with pie
    'pie3d': {
      'explode': '5%',
      'connectorLength': '15%',
      //'legend': {
      'legendItem': {
        'iconStroke': null
      }
      //}
    },

    // merge with chart
    'scatter': {
      'defaultSeriesType': 'marker',
      'legend': {
        'enabled': false
      },
      'defaultSeriesSettings': {
        'base': {
          'clip': true,
          'color': null,
          'tooltip': {
            /**
             * @this {*}
             * @return {string}
             */
            'titleFormatter': function() {
              return this['seriesName'];
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'x: ' + this['x'] + '\ny: ' + this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'];
            }
          },
          'xScale': null,
          'yScale': null,
          'a11y': {
            'enabled': false,
            'titleFormatter': 'Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}'
          }
        },
        'bubble': {
          'labels': {
            'anchor': 'center'
          },
          'displayNegative': false,
          'negativeFill': returnDarkenSourceColor,
          'hoverNegativeFill': returnDarkenSourceColor,
          'negativeStroke': returnDarkenSourceColor,
          'hoverNegativeStroke': returnDarkenSourceColor,
          'negativeHatchFill': null,
          'hoverNegativeHatchFill': undefined,
          'hatchFill': false,
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'X: ' + this['x'] + '\nY: ' + this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'] + '\nSize: ' + locNum(this['size']);
            }
          }
        },
        'line': {
          'connectMissingPoints': false
        },
        'marker': {
          'size': 5,
          'hoverSize': 7,
          'selectSize': 7
        }
      },
      'defaultAnnotationSettings': {},
      'defaultXAxisSettings': {
        'orientation': 'bottom',
        'scale': 0,
        'title': {
          'text': 'X-Axis'
        }
      },
      'defaultYAxisSettings': {
        'orientation': 'left',
        'scale': 1,
        'title': {
          'text': 'Y-Axis'
        }
      },
      'series': [],
      'grids': [],
      'minorGrids': [],
      'xAxes': [{}],
      'yAxes': [{}],
      'lineAxesMarkers': [],
      'rangeAxesMarkers': [],
      'textAxesMarkers': [],
      'scales': [
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'xScale': 0,
      'yScale': 1,
      'maxBubbleSize': '20%',
      'minBubbleSize': '5%',
      'crosshair': {
        'enabled': false,
        'displayMode': 'float',
        'xStroke': colorStrokeExtraBright,
        'yStroke': colorStrokeExtraBright,
        'zIndex': 41
      },
      'a11y': {
        'titleFormatter': scatterA11yTitleFormatter
      },
      'annotations': {
        'annotationsList': [],
        'zIndex': 2000
      }
    },
    // merge with scatter
    'marker': {},
    'bubble': {},

    // merge with chart
    'radar': {
      'defaultSeriesType': 'line',
      'defaultSeriesSettings': {
        'base': {
          'enabled': true,
          'hatchFill': null,
          'a11y': {
            'enabled': true,
            'titleFormatter': 'Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}'
          }
        },
        'area': {},
        'line': {},
        'marker': {}
      },
      'xAxis': {
        'scale': 0,
        'zIndex': 25
      },
      'startAngle': 0,
      'grids': [{}, {'layout': 'circuit'}],
      'minorGrids': [],
      'scales': [
        {
          'type': 'ordinal',
          'inverted': false,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'xScale': 0,
      'yScale': 1,
      'a11y': {
        'titleFormatter': scatterA11yTitleFormatter
      }
    },
    // merge with chart
    'polar': {
      'defaultSeriesType': 'marker',
      'defaultSeriesSettings': {
        'base': {
          'enabled': true,
          'hatchFill': null,
          'closed': true
        },
        'area': {},
        'line': {},
        'marker': {}
      },
      'xAxis': {
        'scale': 0,
        'zIndex': 25
      },
      'startAngle': 0,
      'grids': [{}, {'layout': 'circuit'}],
      'minorGrids': [],
      'scales': [
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'xScale': 0,
      'yScale': 1,
      'a11y': {
        'titleFormatter': scatterA11yTitleFormatter
      }
    },

    // merge with chart
    'bullet': {
      'background': {
        'enabled': true
      },
      'layout': 'horizontal',
      'defaultRangeMarkerSettings': {
        'enabled': true,
        'from': 0,
        'to': 0,
        'zIndex': 2
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'defaultMarkerSettings': {
        'fill': '#64b5f6',
        'stroke': '2 #64b5f6',
        'zIndex': 2
      },
      'rangePalette': {
        'type': 'distinct',
        'items': ['#828282', '#a8a8a8', '#c2c2c2', '#d4d4d4', '#e1e1e1']
      },
      'markerPalette': {
        'items': ['bar', 'line', 'x', 'ellipse']
      },
      'axis': {
        'enabled': false,
        'title': {
          'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
          'margin': {'top': 0, 'right': 0, 'bottom': 10, 'left': 0}
        },
        'labels': {
          'fontSize': 9,
          'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
        },
        'minorLabels': {
          'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
        },
        'ticks': {
          'enabled': false
        },
        'orientation': null,
        'zIndex': 3
      },
      'title': {
        'rotation': 0
      },
      'scale': {
        'type': 'linear',
        'ticks': {
          'mode': 'linear',
          'base': 0,
          'explicit': null,
          'minCount': 2,
          'maxCount': 5,
          'interval': NaN
        },
        'minorTicks': {
          'mode': 'linear',
          'base': 0,
          'explicit': null,
          'count': 5,
          'interval': NaN
        },
        'stackMode': 'none',
        'stickToZero': true,
        'minimumGap': 0,
        'maximumGap': 0,
        'softMinimum': null,
        'softMaximum': null,
        'minimum': null,
        'maximum': null,
        'inverted': false
      },
      'ranges': [],
      'a11y': {
        'titleFormatter': bulletA11yTitleFormatter
      }
    },
    // merge with chart
    'sparkline': {
      'background': {'enabled': true},
      'title': {
        'enabled': false,
        'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
        'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
        'orientation': 'right',
        'rotation': 0
      },
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'padding': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'hatchFill': null,
      'markers': {},

      'firstMarkers': {
        'fill': '#64b5f6'
      },
      'lastMarkers': {
        'fill': '#64b5f6'
      },
      'negativeMarkers': {
        'fill': '#ef6c00'
      },
      'minMarkers': {
        'fill': '#455a64'
      },
      'maxMarkers': {
        'fill': '#dd2c00'
      },

      'labels': {},
      'firstLabels': {},
      'lastLabels': {},
      'negativeLabels': {},
      'minLabels': {
        'fontSize': 9,
        'padding': {
          'top': 3,
          'right': 0,
          'bottom': 3,
          'left': 0
        },
        'fontColor': '#303f46'
      },
      'maxLabels': {
        'fontSize': 9,
        'padding': {
          'top': 3,
          'right': 0,
          'bottom': 3,
          'left': 0
        },
        'fontColor': '#9b1f00'
      },

      'lineAxesMarkers': [],
      'rangeAxesMarkers': [],
      'textAxesMarkers': [],
      'scales': [
        {
          'type': 'ordinal',
          'inverted': false,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],
      'xScale': 0,
      'yScale': 1,
      'clip': true,
      'seriesType': 'line',
      'connectMissingPoints': false,
      'pointWidth': '95%',

      'tooltip': {
        'title': false,
        'separator': false,
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          return this['x'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return 'x: ' + this['x'] + '\ny: ' + locNum(this['value']);
        }
      },

      'defaultSeriesSettings': {
        'base': {
          'markers': {
            'enabled': false,
            'position': 'center',
            'anchor': 'center',
            'type': 'circle',
            'size': 1.8,
            'stroke': 'none'
          },
          'hoverMarkers': {
            'enabled': true
          },
          'labels': {
            'enabled': false,
            'fontSize': 8,
            'background': {
              'enabled': false
            },
            'position': 'center',
            'anchor': 'centerBottom'
          },
          'minLabels': {
            'position': 'centerBottom',
            'anchor': 'centerBottom'
          },
          'maxLabels': {
            'position': 'centerTop',
            'anchor': 'topCenter'
          },
          'color': '#64b5f6'
        },
        'area': {
          'stroke': '#64b5f6',
          'fill': '#64b5f6 0.5'
        },
        'column': {
          'markers': {
            'position': 'centerTop'
          },
          'labels': {
            'position': 'centerTop',
            'anchor': 'centerBottom'
          },
          'negativeMarkers': {
            'position': 'centerBottom'
          },
          'negativeLabels': {
            'position': 'centerBottom',
            'anchor': 'centerTop'
          },
          'fill': '#64b5f6',
          'negativeFill': '#ef6c00'
        },
        'line': {
          'stroke': '#64b5f6'
        },
        'winLoss': {
          'markers': {
            'position': 'centerTop',
            'anchor': 'centerTop'
          },
          'labels': {
            'position': 'centerTop',
            'anchor': 'centerTop'
          },
          'negativeMarkers': {
            'position': 'centerBottom',
            'anchor': 'centerBottom'
          },
          'negativeLabels': {
            'position': 'centerBottom',
            'anchor': 'centerBottom'
          },
          'fill': '#64b5f6',
          'negativeFill': '#ef6c00'
        }
      }
    },

    // merge with chart
    'map': {
      'defaultCalloutSettings': {},
      'defaultSeriesSettings': {
        'base': {
          /**
           * @this {*}
           * @return {*}
           */
          'fill': function() {
            return this['scaledColor'] || this['sourceColor'];
          },
          'hoverFill': defaultHoverColor,
          'selectFill': defaultSelectColor,
          'stroke': returnDarkenSourceColor,
          'hoverStroke': {'thickness': 0.5, 'color': '#545f69'},
          'selectStroke': {'thickness': 0.5, 'color': '#545f69'},
          'hatchFill': false,
          'labels': {
            'anchor': 'centerBottom',
            'enabled': false,
            'adjustFontSize': {
              'width': true,
              'height': true
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              if (this['getDataValue']('name')) {
                return this['getDataValue']('name');
              } else if (this['name']) {
                return this['name'];
              } else if (this['getDataValue']('id')) {
                return this['getDataValue']('id');
              } else {
                return 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
              }
            }
          },
          'hoverLabels': {
            'enabled': null
          },
          'selectLabels': {
            'enabled': null
          },
          'markers': {
            'enabled': false,
            'disablePointerEvents': false
          },
          'hoverMarkers': {'enabled': null},
          'selectMarkers': {'enabled': null},
          'color': null,
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'titleFormatter': function() {
              return this['name'] || this['getDataValue']('name') || 'Tooltip title';
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'];
            }
          },
          'xScale': null,
          'yScale': null,
          'a11y': {
            'titleFormatter': 'Series named {%SeriesName}'
          }
        },
        'choropleth': {
          'labels': {
            'fontColor': fontColorDark,
            'anchor': null
          },
          'markers': {
            'anchor': null
          },
          'colorScale': {}
        },
        'connector': {
          'startSize': 0,
          'endSize': 0,
          'curvature': .3,
          'stroke': returnSourceColor,
          'hoverStroke': returnLightenSourceColor,
          'selectStroke': '2 ' + defaultSelectColor,
          'markers': {
            'position': 'middle',
            'enabled': true,
            'size': 15,
            'stroke': '1.5 #f7f7f7',
            'rotation': null,
            'anchor': null,
            'type': 'arrowhead'
          },
          'hoverMarkers': {
            'stroke': '1.5 #f7f7f7',
            'size': 15
          },
          'selectMarkers': {
            'fill': defaultSelectColor,
            'stroke': '1.5 #f7f7f7',
            'size': 15
          },
          'labels': {
            'enabled': false,
            'position': 'middle',
            'anchor': null,
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'from: ' + this['startPoint']['lat'] + ',' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ',' + this['endPoint']['long'];
            }
          },
          'tooltip': {
            'title': {
              'enabled': false
            },
            'separator': {
              'enabled': false
            },
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'from: ' + this['startPoint']['lat'] + ', ' + this['startPoint']['long'] + '\nto: ' + this['endPoint']['lat'] + ', ' + this['endPoint']['long'];
            }
          }
        },
        'bubble': {
          'labels': {
            'anchor': 'center'
          },
          'hoverFill': defaultHoverColor,
          'selectFill': defaultSelectColor,
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              return 'Id: ' + this['id'] + '\nValue: ' + this['valuePrefix'] + locNum(this['size']) + this['valuePostfix'];
            }
          }
        },
        'marker': {
          'labels': {
            'enabled': true
          },
          'hoverLabels': {
            'fontWeight': 'bold'
          },
          'selectLabels': {
            'fontWeight': 'bold'
          },
          'tooltip': {
            /**
             * @this {*}
             * @return {*}
             */
            'textFormatter': function() {
              var result;
              if (this['id']) {
                result = 'Id: ' + this['id'];
              } else {
                result = 'lat: ' + this['lat'] + '\nlong: ' + this['long'];
              }
              if (this['value'])
                result += '\nValue: ' + this['valuePrefix'] + locNum(this['value']) + this['valuePostfix'];
              return result;
            }
          }
        }
      },
      'colorRange': {
        'zIndex': 50
      },
      'geoScale': {
        'maxTicksCount': 1000,
        'precision': 2
      },
      'callouts': [],
      'axesSettings': {
        'enabled': false,
        'title': {
          'enabled': false,
          'padding': 5,
          'fontSize': 13,
          'text': 'Axis title',
          'fontColor': fontColorBright,
          'zIndex': 35
        },
        'labels': {
          'enabled': true,
          'padding': 2,
          'rotation': null,
          'fontSize': 10,
          'anchor': null
        },
        'minorLabels': {
          'enabled': false,
          'padding': 2,
          'rotation': null,
          'fontSize': 9,
          'anchor': null
        },
        'overlapMode': 'noOverlap',
        'ticks': {
          'enabled': true,
          'length': 5,
          'position': 'outside',
          'stroke': colorStrokeNormal
        },
        'minorTicks': {
          'enabled': false,
          'length': 2,
          'position': 'outside',
          'stroke': colorStrokeNormal
        },
        'drawFirstLabel': true,
        'drawLastLabel': true,
        'stroke': colorStrokeNormal
      },
      'gridsSettings': {
        'enabled': false,
        'drawFirstLine': true,
        'drawLastLine': true,
        'oddFill': 'none',
        'evenFill': 'none',
        'stroke': colorStrokeNormal,
        'minorStroke': 'none',
        'zIndex': 5
      },
      'crosshair': {
        'enabled': false,
        'xStroke': colorStrokeExtraBright,
        'yStroke': colorStrokeExtraBright,
        'zIndex': 110,
        'xLabel': {
          'axisIndex': 2
        },
        'yLabel': {
          'axisIndex': 3
        }
      },
      'unboundRegions': {'enabled': true, 'fill': '#F7F7F7', 'stroke': '#e0e0e0'},
      'maxBubbleSize': '20%',
      'minBubbleSize': '5%',
      'geoIdField': 'id',
      'interactivity': {
        'copyFormatter': function() {
          var ths = arguments[0];
          var seriesStatus = ths['seriesStatus'];
          var result = '';
          for (var i = 0, len = seriesStatus.length; i < len; i++) {
            var status = seriesStatus[i];
            if (!status['points'].length) continue;
            result += 'Series ' + status['series'].index() + ':\n';
            for (var j = 0, len_ = status['points'].length; j < len_; j++) {
              var point = status['points'][j];
              result += 'id: ' + point['id'] + ' index: ' + point['index'];
              if (j != len_ - 1) result += '\n';
            }
            if (i != len - 1) result += '\n';
          }
          return result || 'no selected points';
        },
        'drag': true,
        'zoomOnMouseWheel': false,
        'keyboardZoomAndMove': true,
        'zoomOnDoubleClick': false
      },
      'minZoomLevel': 1,
      'maxZoomLevel': 10,
      'overlapMode': 'noOverlap',
      'crsAnimation': {
        'enabled': true,
        'duration': 300
      },
      'legend': {
        'enabled': false,
        'tooltip': {
          'contentInternal': {
            'background': {
              'disablePointerEvents': false
            }
          }
        }
      }
    },
    // merge with map
    'choropleth': {},
    // merge with map
    'bubbleMap': {},
    // merge with map
    'markerMap': {},
    // merge with map
    'connector': {},
    // merge with map
    'seatMap': {},

    // merge with chart
    'circularGauge': {
      'title': {
        'enabled': false
      },
      'defaultAxisSettings': {
        'startAngle': null,
        'labels': {'position': 'inside', 'adjustFontSize': true},
        'minorLabels': {'position': 'inside', 'adjustFontSize': true},
        'fill': colorStrokeNormal,
        'ticks': {
          'hatchFill': false,
          'type': 'line',
          'position': 'center',
          'length': null,
          'fill': fontColorBright,
          'stroke': 'none'
        },
        'minorTicks': {
          'hatchFill': false,
          'type': 'line',
          'position': 'center',
          'length': null,
          'fill': fontColorBright,
          'stroke': 'none'
        },
        'zIndex': 10,
        'cornersRounding': '0%'
      },
      'defaultPointerSettings': {
        'base': {
          'enabled': true,
          'fill': fontColorBright,
          'stroke': fontColorBright,
          'hatchFill': false,
          'axisIndex': 0
        },
        'bar': {
          'position': 'center'
        },
        'marker': {
          'size': 4,
          'hoverSize': 6,
          'selectSize': 6,
          'position': 'inside',
          'type': 'triangleUp'
        },
        'knob': {
          'fill': colorStrokeNormal,
          'stroke': colorStrokeBright,
          'verticesCount': 6,
          'verticesCurvature': .5,
          'topRatio': .5,
          'bottomRatio': .5
        }
      },
      'defaultRangeSettings': {
        'enabled': true,
        'axisIndex': 0,
        'fill': fontColorNormal + opacityStrong,
        'position': 'center',
        'startSize': 0,
        'endSize': '10%',
        'cornersRounding': '0%'
      },
      'fill': colorFillExtraThin,
      'stroke': colorStrokeThin,
      'startAngle': 0,
      'sweepAngle': 360,
      'cap': {
        'enabled': false,
        'fill': colorStrokeThin,
        'stroke': colorStrokeNormal,
        'hatchFill': false,
        'radius': '15%',
        'zIndex': 50
      },
      'circularPadding': '10%',
      'encloseWithStraightLine': false,
      'axes': [],
      'bars': [],
      'markers': [],
      'needles': [],
      'knobs': [],
      'ranges': [],
      'tooltip': {
        'title': {'enabled': false},
        'separator': {'enabled': false},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          return this['index'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return 'Value: ' + locNum(this['value']);
        }
      }
    },
    'linearGauge': {
      'padding': 10,
      'markerPalette': {
        'items': ['circle', 'diamond', 'square', 'triangleDown', 'triangleUp', 'triangleLeft', 'triangleRight', 'diagonalCross', 'pentagon', 'cross', 'vline', 'star5', 'star4', 'trapezium', 'star7', 'star6', 'star10']
      },
      'globalOffset': '0%',
      'layout': 'vertical',
      'tooltip': {
        'titleFormatter': function() {
          return this['name'];
        },
        'textFormatter': function() {
          if (this['high'])
            return returnRangeTooltipContentFormatter.call(this);
          else
            return 'Value: ' + locNum(this['value']);
        }
      },
      'scales': [
        {
          'type': 'linear',
          'maxTicksCount': 1000,
          'inverted': false,
          'maximum': null,
          'minimum': null,
          'minimumGap': 0.1,
          'maximumGap': 0.1,
          'softMinimum': null,
          'softMaximum': null,
          'ticks': {
            'mode': 'linear',
            'base': 0,
            'minCount': 4,
            'maxCount': 6
          },
          'minorTicks': {
            'mode': 'linear',
            'base': 0,
            'count': 5
          },
          'stackMode': 'none',
          'stickToZero': true
        }
      ],

      'defaultAxisSettings': {
        'enabled': true,
        'width': '10%',
        'offset': '0%'
      },
      'defaultScaleBarSettings': {
        'enabled': true,
        'width': '10%',
        'offset': '0%',
        'from': 'min',
        'to': 'max',
        'colorScale': {
          'type': 'ordinalColor',
          'inverted': false,
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        'points': [
          {
            'height': 0,
            'left': 0,
            'right': 0
          },
          {
            'height': 1,
            'left': 0,
            'right': 0
          }
        ]
      },
      'defaultPointerSettings': {
        'base': {
          'enabled': true,
          'selectionMode': 'single',
          'width': '10%',
          'offset': '0%',
          'legendItem': {
            'enabled': true
          },
          'label': {
            'enabled': false,
            'zIndex': 0,
            'position': 'centerTop',
            'anchor': 'center'
          },
          'hoverLabel': {
            'enabled': null
          },
          'selectLabel': {
            'enabled': null
          },
          'stroke': returnStrokeSourceColor,
          'hoverStroke': returnLightenStrokeSourceColor,
          'selectStroke': returnDarkenSourceColor,
          'fill': returnSourceColor,
          'hoverFill': returnLightenSourceColor,
          'selectFill': returnDarkenSourceColor
        },
        'bar': {},
        'rangeBar': {
          'label': {
            'textFormatter': function() {
              return locNum(this['high']);
            }
          }
        },
        'marker': {'width': '3%'},
        'tank': {
          'emptyFill': '#fff 0.3',
          'hoverEmptyFill': returnSourceColor,
          'selectEmptyFill': returnSourceColor,
          'emptyHatchFill': null
          //'hoverEmptyHatchFill': null,
          //'selectEmptyHatchFill': null
        },
        'thermometer': {
          /**
           * @this {*}
           * @return {*}
           */
          'fill': function() {
            var sourceColor = this['sourceColor'];
            var darken = global['anychart']['color']['darken'](sourceColor);
            var key1 = {
              'color': darken
            };
            var key2 = {
              'color': sourceColor
            };
            var key3 = {
              'color': darken
            };
            var isVertical = this['isVertical'];
            return {
              'angle': isVertical ? 0 : 90,
              'keys': [key1, key2, key3]
            };
          },
          'width': '3%',
          'bulbRadius': '120%',
          'bulbPadding': '3%'
        },
        'led': {
          /**
           * @this {*}
           * @return {*}
           */
          'dimmer': function(color) {
            return global['anychart']['color']['darken'](color);
          },
          'gap': '1%',
          'size': '2%',
          'count': null,
          'colorScale': {
            'type': 'ordinalColor',
            'inverted': false,
            'ticks': {
              // 'interval': 1,
              'maxCount': 100
            }
          }
        }
      }
    },
    'thermometerGauge': {},
    'tankGauge': {},
    'ledGauge': {},
    'bulletGauge': {},

    // merge with chart
    'heatMap': {
      'scales': [
        {
          'type': 'ordinal',
          'inverted': false,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'ordinal',
          'inverted': true,
          'names': [],
          'ticks': {
            // 'interval': 1,
            'maxCount': 100
          }
        },
        {
          'type': 'ordinalColor'
        }
      ],
      'xScale': 0,
      'yScale': 1,
      'colorScale': 2,
      'background': {
        'enabled': true
      },
      'xAxes': [{
        'orientation': 'top'
      }],
      'yAxes': [{}],
      'grids': [],
      'tooltip': {
        'enabled': true,
        'title': {
          'enabled': true,
          'fontSize': 13,
          'fontWeight': 'normal'
        },
        'contentInternal': {'fontSize': 11},
        'separator': {'enabled': true},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          return this['name'] || this['x'];
        },
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          if (this['heat'] === undefined) {
            var value = 'Value: ' + this['valuePrefix'] + this['heat'] + this['valuePostfix'];
            if (!isNaN(+this['heat']))
              value += '\n' + 'Percent Value: ' + (this['heat'] * 100 / this['getStat']('sum')).toFixed(1) + '%';
            return value;
          } else {
            return 'x: ' + this['x'] + '\ny: ' + this['y'];
          }
        }
      },
      'legendItem': {
        'iconStroke': null
      },
      'legend': {
        'itemsSourceMode': 'categories'
      },
      'defaultXAxisSettings': {
        'enabled': true,
        'orientation': 'bottom',
        'ticks': {'enabled': false},
        'title': {
          'text': 'X-Axis'
        }
      },
      'defaultYAxisSettings': {
        'enabled': true,
        'orientation': 'left',
        'ticks': {'enabled': false},
        'title': {
          'text': 'Y-Axis'
        }
      },
      /**
       * @this {*}
       * @return {*}
       */
      'fill': function() {
        var color;
        if (this['colorScale']) {
          var value = this['iterator']['get']('heat');
          color = this['colorScale']['valueToColor'](value);
        } else {
          color = global['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        }
        return color;
      },
      'stroke': '1 #ffffff',
      'hoverStroke': '1.5 #ffffff',
      'hoverFill': defaultHoverColor,
      'selectStroke': '2 #ffffff',
      'selectFill': defaultSelectColor,
      'labels': {
        'enabled': true,
        'fontSize': 11,
        'adjustFontSize': {
          'width': true,
          'height': true
        },
        'minFontSize': 7,
        'maxFontSize': 13,
        'hAlign': 'center',
        'vAlign': 'center',
        'textWrap': 'noWrap',
        'fontWeight': 'normal',
        'fontColor': '#212121',
        'selectable': false,
        'background': {
          'enabled': false
        },
        'padding': {
          'top': 2,
          'right': 4,
          'bottom': 2,
          'left': 4
        },
        'position': 'center',
        'anchor': 'center',
        'offsetX': 0,
        'offsetY': 0,
        'rotation': 0,
        'width': null,
        'height': null,
        /**
         * @this {*}
         * @return {*}
         */
        'textFormatter': function() {
          return locNum(this['heat']);
        },
        'positionFormatter': returnValue
      },
      'hoverLabels': {
        'fontColor': '#f5f5f5',
        'enabled': null
      },
      'selectLabels': {
        'fontColor': '#fff',
        'enabled': null
      },
      'markers': {
        'enabled': false,
        'disablePointerEvents': false,
        'position': 'center',
        'rotation': 0,
        'anchor': 'center',
        'offsetX': 0,
        'offsetY': 0,
        'size': 4,
        'positionFormatter': returnValue,
        'fill': '#dd2c00',
        'type': 'circle'
      },
      'hoverMarkers': {
        'enabled': null,
        'size': 6
      },
      'selectMarkers': {
        'enabled': null,
        'size': 6,
        'fill': defaultSelectColor,
        'stroke': defaultSelectStroke
      },
      'labelsDisplayMode': 'drop',
      'hatchFill': false,
      'clip': true,
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
      'yScroller': {
        'orientation': 'right',
        'inverted': true
      },
      'a11y': {
        'titleFormatter': chartA11yTitleFormatter
      }
    },

    'treeMap': {
      'sort': 'desc',
      'labelsDisplayMode': 'clip',
      'headersDisplayMode': 'alwaysShow',
      'colorRange': {
        'zIndex': 50
      },
      'colorScale': {
        'type': 'ordinalColor'
      },
      'tooltip': {
        'enabled': true,
        'titleFormatter': returnName,
        'textFormatter': returnValue
      },
      'legend': {
        'itemsSourceMode': 'categories'
      },
      'maxDepth': 1,
      'hintDepth': 0,
      'hintOpacity': 0.4,
      'maxHeadersHeight': '25',
      'headers': {
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'center',
        'position': 'leftTop',
        'anchor': 'leftTop',
        'rotation': 0,
        'background': {
          'enabled': true,
          'fill': '#F7F7F7',
          'stroke': '#e0e0e0'
        },
        'textFormatter': returnName
      },
      'hoverHeaders': {
        'enabled': true,
        'fontColor': defaultSelectColor,
        'background': {
          'fill': '#e0e0e0',
          'stroke': '#e0e0e0'
        }
      },
      'labels': {
        'enabled': true,
        'hAlign': 'center',
        'vAlign': 'center',
        'position': 'leftTop',
        'anchor': 'leftTop',
        'rotation': 0,
        'fontColor': fontColorDark,
        'textFormatter': returnNameWithValue
      },
      'hoverLabels': {
        'enabled': null,
        'fontWeight': 'bold'
      },
      'selectLabels': {
        'enabled': null,
        'fontColor': '#fafafa'
      },
      'markers': {
        'enabled': false,
        'position': 'center',
        'size': 6,
        'fill': '#dd2c00',
        'type': 'circle'
      },
      'hoverMarkers': {
        'enabled': null,
        'size': 8
      },
      'selectMarkers': {
        'enabled': null,
        'size': 8,
        'fill': defaultSelectColor,
        'stroke': defaultSelectStroke
      },
      /**
       * @this {*}
       * @return {*}
       */
      'fill': function() {
        var color;
        if (this['colorScale']) {
          color = this['colorScale']['valueToColor'](this['value']);
        } else {
          color = global['anychart']['color']['setOpacity'](this['sourceColor'], 0.85, true);
        }
        return color;
      },
      'stroke': '#e0e0e0',
      'hoverFill': returnLightenSourceColor,
      'hoverStroke': returnDarkenSourceColor,
      'selectFill': defaultSelectColor,
      'selectStroke': defaultSelectStroke,
      'hatchFill': false,
      'hoverHatchFill': false,
      'selectHatchFill': false
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
      'buttonsVisible': false
    },

    'defaultDataGrid': {
      'isStandalone': true,
      'headerHeight': 25,
      'backgroundFill': '#fff',
      'columnStroke': '#cecece',
      'rowStroke': '#cecece',
      'rowOddFill': '#fff',
      'rowEvenFill': '#fff',
      'rowFill': '#fff',
      'hoverFill': '#F8FAFB',
      'rowSelectedFill': '#ebf1f4',
      'zIndex': 5,
      'editing': false,
      'editStructurePreviewFill': {
        'color': '#4285F4',
        'opacity': 0.2
      },
      'editStructurePreviewStroke': {
        'color': '#4285F4',
        'thickness': 2
      },
      'editStructurePreviewDashStroke': {
        'color': '#4285F4',
        'dash': '4 4'
      },
      'headerFill': '#f7f7f7',
      'tooltip': {
        'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
        'title': {
          'enabled': true,
          'fontSize': '14px',
          'fontWeight': 'normal',
          'fontColor': '#e5e5e5'
        },
        'separator': {
          'enabled': true
        },
        'anchor': 'leftTop',
        'contentInternal': {
          'hAlign': 'left'
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          var name = this['name'];
          return (name !== void 0) ? name + '' : '';
        }
      },
      'defaultColumnSettings': {
        'width': 90,
        'buttonCursor': 'pointer',
        //'defaultWidth': undefined,
        'cellTextSettings': {
          'enabled': true,
          'anchor': 'leftTop',
          'vAlign': 'middle',
          'padding': {
            'top': 0,
            'right': 5,
            'bottom': 0,
            'left': 5
          },
          'textWrap': 'noWrap',
          'background': null,
          'rotation': 0,
          'width': null,
          'height': null,
          'fontSize': 11,
          'minFontSize': 8,
          'maxFontSize': 72,
          'disablePointerEvents': true
        },
        'depthPaddingMultiplier': 0,
        'collapseExpandButtons': false,
        'title': {
          'enabled': true,
          'margin': {
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
          },
          'textWrap': 'noWrap',
          'hAlign': 'center',
          'vAlign': 'middle',
          'background': {
            'enabled': false
          }
        },
        /**
         * @this {*}
         * @return {string}
         */
        'textFormatter': function() {
          return '';
        }
      },
      'columns': [
        {
          'width': 50,
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var val = this['item']['meta']('index');
            return (val != null) ? (val + 1) + '' : '';
          },
          'title': {
            'text': '#'
          }
        },
        {
          'width': 170,
          'collapseExpandButtons': true,
          'depthPaddingMultiplier': 15,
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var val = this['name'];
            return (val != null) ? (val + '') : '';
          },
          'title': {
            'text': 'Name'
          }
        }
      ]
    },

    'defaultTimeline': {
      'isStandalone': true,
      'columnStroke': '#cecece',
      'rowStroke': '#cecece',
      'backgroundFill': 'none',
      'rowOddFill': '#fff',
      'rowEvenFill': '#fff',
      'rowFill': '#fff',

      'hoverFill': '#F8FAFB',
      'rowSelectedFill': '#ebf1f4',

      'zIndex': 5,
      'headerHeight': 70,
      'editing': false,

      'connectorPreviewStroke': {
        'color': '#545f69',
        'dash': '3 3'
      },

      'editPreviewFill': {
        'color': '#fff',
        'opacity': 0.00001
      },

      'editPreviewStroke': {
        'color': '#aaa',
        'dash': '3 3'
      },

      'editProgressFill': '#EAEAEA',
      'editProgressStroke': '#545f69',
      'editIntervalThumbFill': '#EAEAEA',
      'editIntervalThumbStroke': '#545f69',
      'editConnectorThumbFill': '#EAEAEA',
      'editConnectorThumbStroke': '#545f69',

      'editStructurePreviewFill': {
        'color': '#4285F4',
        'opacity': 0.2
      },

      'editStructurePreviewStroke': {
        'color': '#4285F4',
        'thickness': 2
      },

      'editStructurePreviewDashStroke': {
        'color': '#4285F4',
        'dash': '4 4'
      },

      'baseFill': '#7ec1f5',
      'baseStroke': '#74b2e2',
      'progressFill': '#1976d2',
      'progressStroke': {
        'color': '#fff',
        'opacity': 0.00001
      },

      'editStartConnectorMarkerType': 'circle',
      'editStartConnectorMarkerSize': 10,
      'editStartConnectorMarkerHorizontalOffset': 0,
      'editStartConnectorMarkerVerticalOffset': 0,
      'editFinishConnectorMarkerType': 'circle',
      'editFinishConnectorMarkerSize': 10,
      'editFinishConnectorMarkerHorizontalOffset': 0,
      'editFinishConnectorMarkerVerticalOffset': 0,
      'editIntervalWidth': 3,

      'baselineFill': '#d5ebfc',
      'baselineStroke': '#bfd1e0',
      'parentFill': '#455a64',
      'parentStroke': '#2f3f46',
      'milestoneFill': '#ffa000',
      'milestoneStroke': '#d26104',
      'connectorFill': '#545f69',
      'connectorStroke': '#545f69',
      'selectedElementFill': '#ef6c00',
      'selectedElementStroke': '#bc5704',
      'selectedConnectorStroke': '2 #bc5704',
      'baselineAbove': false,
      'tooltip': {
        'padding': {'top': 5, 'right': 5, 'bottom': 5, 'left': 5},
        'title': {
          'enabled': true,
          'fontSize': '14px',
          'fontWeight': 'normal',
          'fontColor': '#e5e5e5'
        },
        'separator': {
          'enabled': true
        },
        'anchor': 'leftTop',
        'contentInternal': {
          'hAlign': 'left'
        },
        'zIndex': 100,
        'allowLeaveChart': true
      },
      'labels': {
        'enabled': true,
        'anchor': 'leftCenter',
        'position': 'rightCenter',
        'padding': {
          'top': 3,
          'right': 5,
          'bottom': 3,
          'left': 5
        },
        'vAlign': 'middle',
        'textWrap': 'noWrap',
        'background': null,
        'rotation': 0,
        'width': null,
        'height': null,
        'fontSize': 11,
        'minFontSize': 8,
        'maxFontSize': 72,
        'zIndex': 40,
        'disablePointerEvents': true
      },
      'markers': {
        'anchor': 'centerTop',
        'zIndex': 50,
        'type': 'star5',
        'fill': '#ff0',
        'stroke': '2 red'
      },
      'defaultLineMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 1.5
      },
      'defaultRangeMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 1
      },
      'defaultTextMarkerSettings': {
        'layout': 'vertical',
        'zIndex': 2,
        'textWrap': 'byLetter'
      },
      'header': {
        'backgroundFill': '#cecece',
        'levelsSeparationStroke': '#cecece',

        'topLevel': {
          'tileFill': '#f7f7f7',
          'tilesSeparationStroke': '#cecece',
          'labels': {
            'enabled': true,
            'anchor': 'leftTop',
            'fontSize': 10,
            'vAlign': 'middle',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            },
            'background': null,
            'disablePointerEvents': true
          }
        },

        'midLevel': {
          'tileFill': '#f7f7f7',
          'tilesSeparationStroke': '#cecece',
          'labels': {
            'enabled': true,
            'anchor': 'leftTop',
            'fontSize': 10,
            'vAlign': 'middle',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            },
            'background': null,
            'disablePointerEvents': true
          }
        },

        'lowLevel': {
          'tileFill': '#f7f7f7',
          'tilesSeparationStroke': '#cecece',
          'labels': {
            'enabled': true,
            'anchor': 'leftTop',
            'fontSize': 10,
            'vAlign': 'middle',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            },
            'background': null,
            'disablePointerEvents': true
          }
        }

      }
    },

    // merge with chart
    'ganttBase': {
      'splitterPosition': '30%',
      'headerHeight': 70,
      'rowHoverFill': '#F8FAFB',
      'rowSelectedFill': '#ebf1f4',
      'rowStroke': '#cecece',
      'editing': false,
      'title': {
        'enabled': false
      },
      'legend': {
        'enabled': false
      },
      'background': {
        'fill': '#fff'
      },
      'margin': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'padding': {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      },
      'dataGrid': {
        'isStandalone': false,
        'backgroundFill': 'none',
        'tooltip': {
          'zIndex': 100,
          'allowLeaveChart': true
        }
      },
      'timeline': {
        'isStandalone': false
      }
    },

    'ganttResource': {
      'dataGrid': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['minPeriodDate'];
            var endDate = this['maxPeriodDate'];
            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '');
          }
        }
      },
      'timeline': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['periodStart'] || this['minPeriodDate'];
            var endDate = this['periodEnd'] || this['maxPeriodDate'];
            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '');
          }
        }
      }
    },
    'ganttProject': {
      'dataGrid': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['actualStart'] || this['autoStart'];
            var endDate = this['actualEnd'] || this['autoEnd'];
            var progress = this['progressValue'];

            if (progress === void 0) {
              var auto = this['autoProgress'] * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');
          }
        }
      },
      'timeline': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['actualStart'] || this['autoStart'];
            var endDate = this['actualEnd'] || this['autoEnd'];
            var progress = this['progressValue'];

            if (progress === void 0) {
              var auto = this['autoProgress'] * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');

          }
        }
      }
    },

    'stock': {
      'grouping': {},
      'scrollerGrouping': {
        'levels': [
          {'unit': 'millisecond', 'count': 1},
          {'unit': 'millisecond', 'count': 2},
          {'unit': 'millisecond', 'count': 5},
          {'unit': 'millisecond', 'count': 10},
          {'unit': 'millisecond', 'count': 25},
          {'unit': 'millisecond', 'count': 50},
          {'unit': 'millisecond', 'count': 100},
          {'unit': 'millisecond', 'count': 250},
          {'unit': 'millisecond', 'count': 500},
          {'unit': 'second', 'count': 1},
          {'unit': 'second', 'count': 2},
          {'unit': 'second', 'count': 5},
          {'unit': 'second', 'count': 10},
          {'unit': 'second', 'count': 20},
          {'unit': 'second', 'count': 30},
          {'unit': 'minute', 'count': 1},
          {'unit': 'minute', 'count': 2},
          {'unit': 'minute', 'count': 5},
          {'unit': 'minute', 'count': 10},
          {'unit': 'minute', 'count': 20},
          {'unit': 'minute', 'count': 30},
          {'unit': 'hour', 'count': 1},
          {'unit': 'hour', 'count': 2},
          {'unit': 'hour', 'count': 3},
          {'unit': 'hour', 'count': 4},
          {'unit': 'hour', 'count': 6},
          {'unit': 'hour', 'count': 12},
          {'unit': 'day', 'count': 1},
          {'unit': 'day', 'count': 2},
          {'unit': 'day', 'count': 4},
          {'unit': 'week', 'count': 1},
          {'unit': 'week', 'count': 2},
          {'unit': 'month', 'count': 1},
          {'unit': 'month', 'count': 2},
          {'unit': 'month', 'count': 3},
          {'unit': 'month', 'count': 6},
          {'unit': 'year', 'count': 1}
        ],
        'maxVisiblePoints': NaN,
        'minPixPerPoint': 1
      },
      'defaultAnnotationSettings': {},
      'defaultPlotSettings': {
        'annotations': {
          'annotationsList': [],
          'zIndex': 2000
        },
        'background': {
          'enabled': false
        },
        'defaultSeriesSettings': {
          'base': {
            'pointWidth': '75%',
            'tooltip': {
              'textFormatter': StockSimpleTooltipFormatter
            },
            'legendItem': {'iconStroke': 'none'}
          },
          'lineLike': {
            'hoverMarkers': {
              'enabled': null
            },
            'selectMarkers': {
              'enabled': null
            }
          },
          'rangeLike': {
            'tooltip': {
              'textFormatter': StockRangeTooltipFormatter
            }
          },
          'candlestick': {
            'tooltip': {
              'textFormatter': StockOHLCTooltipFormatter
            }
          },
          'column': {
            'stroke': 'none'
          },
          'rangeColumn': {
            'stroke': 'none'
          },
          'ohlc': {
            'tooltip': {
              'textFormatter': StockOHLCTooltipFormatter
            }
          }
        },
        'defaultGridSettings': {
          'scale': 0
        },
        'defaultMinorGridSettings': {
          'scale': 0
        },
        'defaultYAxisSettings': {
          'enabled': true,
          'orientation': 'left',
          'title': {
            'enabled': false,
            'text': 'Y-Axis'
          },
          'staggerMode': false,
          'staggerLines': null,
          'ticks': {
            'enabled': true
          },
          'width': 50,
          'labels': {
            'fontSize': '11px',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            }
          },
          'minorLabels': {
            'fontSize': '11px',
            'padding': {
              'top': 0,
              'right': 5,
              'bottom': 0,
              'left': 5
            }
          },
          'scale': 0
        },
        'xAxis': {
          'enabled': true,
          'orientation': 'bottom',
          'background': {
            'stroke': '#cecece',
            'fill': '#F7F7F7'
          },
          'height': 25,
          'scale': 0,
          'ticks': {
            'enabled': false
          },
          'labels': {
            'enabled': true,
            'fontSize': '11px',
            'padding': {
              'top': 5,
              'right': 5,
              'bottom': 5,
              'left': 5
            },
            'anchor': 'centerTop',
            /**
             * @this {*}
             * @return {string}
             */
            'textFormatter': function() {
              var date = this['tickValue'];
              return global['anychart']['format']['dateTime'](date,
                  global['anychart']['format']['getDateTimeFormat'](
                      global['anychart']['format']['getIntervalIdentifier'](this['majorIntervalUnit'])));
            }
          },
          'minorLabels': {
            'enabled': true,
            'anchor': 'centerTop',
            'fontSize': '11px',
            'padding': {
              'top': 5,
              'right': 0,
              'bottom': 5,
              'left': 0
            },
            /**
             * @this {*}
             * @return {string}
             */
            'textFormatter': function() {
              var date = this['tickValue'];
              return global['anychart']['format']['dateTime'](date,
                  global['anychart']['format']['getDateTimeFormat'](
                      global['anychart']['format']['getIntervalIdentifier'](
                          this['minorIntervalUnit'],
                          this['majorIntervalUnit']
                      )));
            }
          }
        },
        'dateTimeHighlighter': '#B9B9B9',
        'legend': {
          'enabled': true,
          'vAlign': 'bottom',
          'iconSize': 13,
          'position': 'top',
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            var date = this['value'];
            return global['anychart']['format']['dateTime'](date,
                global['anychart']['format']['getDateTimeFormat'](
                    global['anychart']['format']['getIntervalIdentifier'](
                        this['dataIntervalUnit'], null, 'full'
                    )));
          },
          'align': 'left',
          'padding': {
            'top': 10,
            'right': 10,
            'bottom': 10,
            'left': 10
          },
          'title': {
            'enabled': true,
            'fontSize': 12,
            'text': '',
            'background': {
              'enabled': false,
              'fill': {
                'keys': [
                  '#fff',
                  '#f3f3f3',
                  '#fff'
                ],
                'angle': '90'
              },
              'stroke': {
                'keys': [
                  '#ddd',
                  '#d0d0d0'
                ],
                'angle': '90'
              }
            },
            'margin': {
              'top': 0,
              'right': 15,
              'bottom': 0,
              'left': 0
            },
            'padding': {
              'top': 0,
              'right': 0,
              'bottom': 0,
              'left': 0
            },
            'orientation': 'left',
            'align': 'left',
            'hAlign': 'left',
            'rotation': 0
          },
          'titleSeparator': {
            'enabled': false,
            'width': '100%',
            'height': 1,
            'margin': {
              'top': 3,
              'right': 0,
              'bottom': 3,
              'left': 0
            },
            'orientation': 'top',
            'fill': ['#000 0', '#000', '#000 0'],
            'stroke': 'none'
          }
        },
        'scales': [
          {
            'type': 'linear',
            'maxTicksCount': 1000,
            'inverted': false,
            'maximum': null,
            'minimum': null,
            'minimumGap': 0.1,
            'maximumGap': 0.1,
            'softMinimum': null,
            'softMaximum': null,
            'ticks': {
              'mode': 'linear',
              'base': 0,
              'minCount': 4,
              'maxCount': 6
            },
            'minorTicks': {
              'mode': 'linear',
              'base': 0,
              'count': 5
            },
            'stackMode': 'none',
            'stickToZero': true
          }
        ],
        'yScale': 0,
        'zIndex': 10,
        'yAxes': [{}]
      },
      'padding': [20, 30, 20, 60],
      'plots': [{}],
      'scroller': {
        'defaultSeriesSettings': {
          'base': {
            'color': '#64b5f6',
            'fill': stockScrollerUnselected,
            'selectFill': returnSourceColor,
            'stroke': stockScrollerUnselected,
            'selectStroke': returnSourceColor,
            'lowStroke': stockScrollerUnselected,
            'selectLowStroke': returnSourceColor,
            'highStroke': stockScrollerUnselected,
            'selectHighStroke': returnSourceColor,
            'pointWidth': '75%'
          },
          'marker': {
            'fill': stockScrollerUnselected,
            'stroke': stockScrollerUnselected,
            'selectFill': returnSourceColor,
            'selectStroke': returnSourceColor
          },
          'areaLike': {
            'fill': stockScrollerUnselected
          },
          'barLike': {
            'fill': stockScrollerUnselected
          },
          'candlestick': {
            'risingFill': stockScrollerUnselected,
            'risingStroke': stockScrollerUnselected,
            'fallingFill': stockScrollerUnselected,
            'fallingStroke': stockScrollerUnselected,
            'selectFallingFill': fallingColor,
            'selectRisingFill': risingColor,
            'selectRisingStroke': risingColor,
            'selectFallingStroke': fallingColor
          },
          'ohlc': {
            'risingStroke': stockScrollerUnselected,
            'fallingStroke': stockScrollerUnselected,
            'selectRisingStroke': risingColor,
            'selectFallingStroke': fallingColor
          },
          'stick': {
            'stroke': stockScrollerUnselected,
            'selectStroke': returnStrokeSourceColor1
          },
          'jumpLine': {
            'stroke': stockScrollerUnselected,
            'selectStroke': returnStrokeSourceColor1
          }
        },
        'enabled': true,
        'fill': 'none',
        'selectedFill': '#1976d2 0.2',
        'outlineStroke': '#cecece',
        'height': 40,
        'minHeight': null,
        'maxHeight': null,
        'zIndex': 40,
        'xAxis': {
          'background': {
            'enabled': false
          },
          'minorTicks': {
            'enabled': true,
            'stroke': '#cecece'
          },
          'labels': {
            'enabled': true,
            'fontSize': '11px',
            'padding': {
              'top': 5,
              'right': 5,
              'bottom': 5,
              'left': 5
            },
            'anchor': 'leftTop',
            /**
             * @this {*}
             * @return {string}
             */
            'textFormatter': function() {
              var date = this['tickValue'];
              return global['anychart']['format']['dateTime'](date,
                  global['anychart']['format']['getDateTimeFormat'](
                      global['anychart']['format']['getIntervalIdentifier'](this['majorIntervalUnit'])));
            }
          },
          'minorLabels': {
            'enabled': true,
            'anchor': 'leftTop',
            'fontSize': '11px',
            'padding': {
              'top': 5,
              'right': 5,
              'bottom': 5,
              'left': 5
            },
            /**
             * @this {*}
             * @return {string}
             */
            'textFormatter': function() {
              var date = this['tickValue'];
              return global['anychart']['format']['dateTime'](date,
                  global['anychart']['format']['getDateTimeFormat'](
                      global['anychart']['format']['getIntervalIdentifier'](
                          this['minorIntervalUnit'],
                          this['majorIntervalUnit']
                      )));
            }
          },
          'zIndex': 75
        }
      },
      'tooltip': {
        'allowLeaveScreen': false,
        'allowLeaveChart': true,
        'displayMode': 'union',
        'positionMode': 'float',
        'title': {
          'enabled': true,
          'fontSize': 13
        },
        'separator': {'enabled': true},
        /**
         * @this {*}
         * @return {*}
         */
        'titleFormatter': function() {
          var date = this['hoveredDate'];
          return global['anychart']['format']['dateTime'](date,
              global['anychart']['format']['getDateTimeFormat'](
                  global['anychart']['format']['getIntervalIdentifier'](
                      this['dataIntervalUnit'], null, 'full'
                  )));
        }
      },
      'a11y': {
        'titleFormatter': chartA11yTitleFormatter
      }
    },

    'pert': {
      'tooltip': {
        'enabled': false
      },
      'horizontalSpacing': '15%',
      'verticalSpacing': '25%',
      /**
       * @this {*}
       * @return {*}
       */
      'expectedTimeCalculator': function() {
        if (this['duration'] === void 0) {
          var pessimistic = this['pessimistic'];
          var optimistic = this['optimistic'];
          var mostLikely = this['mostLikely'];
          return Math.round(((optimistic + 4 * mostLikely + pessimistic) / 6) * 100) / 100; //Round to 2 digits after floating point.
        } else {
          return Number(this['duration']);
        }
      },
      'background': {
        'zIndex': 0
      },
      'milestones': {
        'shape': 'circle',
        'size': '5%',
        'labels': {
          'enabled': true,
          'anchor': 'leftTop',
          'vAlign': 'middle',
          'hAlign': 'center',
          'fontColor': '#fff',
          'disablePointerEvents': true,
          'textFormatter': returnMilestoneName
        },
        'hoverLabels': {
          'fontColor': '#fff',
          'fontOpacity': 1
        },
        'selectLabels': {
          'fontWeight': 'bold'
        },

        'color': '#64b5f6',

        'fill': returnSourceColor85,
        'stroke': 'none',

        'hoverFill': returnLightenSourceColor,
        'hoverStroke': returnThickenedStrokeSourceColor,

        'selectFill': defaultSelectColor,
        'selectStroke': defaultSelectColor,

        'tooltip': {
          'title': {'enabled': true},
          'separator': {'enabled': true},
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            if (this['creator']) {
              return 'Milestone - ' + this['index'];
            } else {
              return 'Milestone - ' + (this['isStart'] ? 'Start' : 'Finish');
            }
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var result = '';
            var i = 0;
            if (this['successors'] && this['successors'].length) {
              result += 'Successors:';
              for (i = 0; i < this['successors'].length; i++) {
                result += '\n - ' + this['successors'][i].get('name');
              }
              if (this['predecessors'] && this['predecessors'].length)
                result += '\n\n';
            }
            if (this['predecessors'] && this['predecessors'].length) {
              result += 'Predecessors:';
              for (i = 0; i < this['predecessors'].length; i++) {
                result += '\n - ' + this['predecessors'][i].get('name');
              }
            }
            return result;
          }
        }
      },
      'tasks': {
        'color': '#64b5f6',

        'fill': returnSourceColor85,
        'stroke': returnSourceColor85,

        'hoverFill': returnLightenSourceColor,
        'hoverStroke': returnThickenedStrokeSourceColor,

        'selectFill': defaultSelectColor,
        'selectStroke': defaultSelectColor,

        'dummyFill': returnSourceColor85,
        'dummyStroke': returnDashedStrokeSourceColor,

        'upperLabels': {
          'enabled': true,
          'anchor': 'centerBottom',
          'vAlign': 'bottom',
          'hAlign': 'center',
          'fontSize': 10,
          'contColor': '#333',
          'padding': {
            'top': 1,
            'right': 10,
            'bottom': 1,
            'left': 10
          },
          'textWrap': 'noWrap',
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return this['name'];
          }
        },
        'hoverUpperLabels': {'fontWeight': 'bold'},
        'selectUpperLabels': {'fontWeight': 'bold'},

        'lowerLabels': {
          'enabled': true,
          'anchor': 'centerTop',
          'vAlign': 'top',
          'hAlign': 'center',
          'fontSize': 9,
          'fontOpacity': 0.5,
          'contColor': '#333',
          'textWrap': 'noWrap',
          'padding': {
            'top': 1,
            'right': 5,
            'bottom': 1,
            'left': 5
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            return 't: ' + locNum(this['duration']);
          }
        },
        'hoverLowerLabels': {'fontWeight': 'bold'},
        'selectLowerLabels': {'fontWeight': 'bold'},
        'tooltip': {
          'title': {'enabled': true},
          'separator': {'enabled': true},
          /**
           * @this {*}
           * @return {*}
           */
          'titleFormatter': function() {
            return this['name'];
          },
          /**
           * @this {*}
           * @return {*}
           */
          'textFormatter': function() {
            var result = 'Earliest start: ' + locNum(this['earliestStart']) + '\nEarliest finish: ' + locNum(this['earliestFinish']) +
                '\nLatest start: ' + locNum(this['latestStart']) + '\nLatest finish: ' + locNum(this['latestFinish']) +
                '\nDuration: ' + locNum(this['duration']) + '\nSlack: ' + locNum(this['slack']);
            if (!isNaN(this['variance'])) result += '\nStandard deviation: ' + Math.round(this['variance'] * 100) / 100;
            return result;
          }
        }
      },

      'criticalPath': {
        'tasks': {
          'color': '#e06666',
          'lowerLabels': {
            'textWrap': 'noWrap'
          },
          'upperLabels': {
            'textWrap': 'noWrap'
          }
        }
      }
    },

    'resource': {
      'calendar': {},
      'conflicts': {
        'labels': {
          'enabled': true,
          'anchor': 'leftTop',
          'hAlign': 'center',
          'fontSize': '8pt',
          'padding': 0,
          'fontColor': '#F4F4F4',
          'textFormatter': '{%hours}h ({%percent}%)'
        },
        'fill': '#dd2c00',
        'stroke': 'none',
        'hatchFill': null,
        'height': 15,
        'zIndex': 100
      },
      'overlay': {
        'enabled': false
      },
      'activities': {
        'labels': {
          'enabled': true,
          'anchor': 'leftTop',
          'fontColor': '#F4F4F4',
          'textFormatter': '{%name} ({%hoursPerDayRounded}h)',
          'position': 'leftTop'
        },
        'hoverLabels': {'enabled': null},
        'selectLabels': {'enabled': null},
        'fill': '#1976d2',
        'hoverFill': returnLightenSourceColor,
        'selectFill': defaultSelectSolidColor,
        'stroke': null,
        'hoverStroke': returnSourceColor,
        'selectStroke': returnSourceColor,
        'hatchFill': false,
        'hoverHatchFill': null,
        'selectHatchFill': null
      },
      'resourceList': {
        'oddFill': 'none',
        'evenFill': 'none',
        'enabled': true,
        'width': '100%',
        'height': '100%',
        'background': {
          'enabled': true,
          'fill': '#F3F7FA',
          'stroke': 'none',
          'cornerType': 'none',
          'corners': 0
        },
        'images': {
          'borderRadius': 10,
          'opacity': 1,
          'align': 'none',
          'fittingMode': 'meet',
          'size': '25%',
          'margin': {
            'top': 5,
            'right': 0,
            'bottom': 5,
            'left': 5
          }
        },
        'baseSettings': {
          'margin': {
            'top': 2,
            'right': 0,
            'bottom': 3,
            'left': 5
          },
          'fontSize': 15,
          'textWrap': 'noWrap',
          'textOverflow': '...',
          'fontFamily': '"Helvetica Neue","Helvetica",sans-serif'
        },
        'names': {
          'margin': {
            'top': 5
          },
          'fontSize': 17,
          'fontWeight': 'bold',
          'fontColor': '#000'
        },
        'types': {
          'fontSize': 10,
          'fontColor': fontColorDark
        },
        'descriptions': {
          'fontSize': 12,
          'fontColor': '#959CA0',
          'fontWeight': 'bold'
        },
        'tags': {
          'fontSize': 9,
          'fontColor': fontColorDark,
          'background': {
            'enabled': true,
            'fill': '#eee',
            'stroke': '#ccc',
            'cornerType': 'round',
            'corners': 4
          },
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'margin': {
            'top': 2,
            'right': 0,
            'bottom': 3,
            'left': 5
          }
        },
        'drawTopLine': false,
        'drawRightLine': false,
        'drawBottomLine': true,
        'drawLeftLine': false,
        'stroke': '#ccc',
        'zIndex': 2,
        'overlay': true
      },
      'logo': {
        'enabled': true,
        'fill': '#E7ECF0',
        'stroke': 'none',
        'bottomStroke': '#ccc',
        'zIndex': 2,
        'overlay': false
      },
      'timeLine': {
        'enabled': true,
        'background': {
          'enabled': false
        },
        'overlay': {
          'enabled': false
        },
        'zIndex': 2,
        'vAlign': 'center',
        'hAlign': 'center',
        'textWrap': 'noWrap',
        'textOverflow': '',
        'fill': 'none',
        'stroke': '#ccc',
        'padding': [2, 10, 2, 10],
        'fontSize': 11,
        'fontWeight': 'bold',
        'fontFamily': '"Helvetica Neue", Helvetica, sans-serif',
        'drawTopLine': false,
        'drawRightLine': false,
        'drawBottomLine': true,
        'drawLeftLine': false
      },
      'grid': {
        'overlay': {
          'enabled': false
        },
        'background': {
          'enabled': false,
          'fill': '#F3F7FA'
        },
        'oddFill': '#fff',
        'evenFill': '#fff',
        'oddHolidayFill': '#F4F4F4 .7',
        'evenHolidayFill': '#F4F4F4 .7',
        'oddHatchFill': null,
        'evenHatchFill': null,
        'oddHolidayHatchFill': null,
        'evenHolidayHatchFill': null,
        'horizontalStroke': '#ccc',
        'verticalStroke': '#ccc',
        'drawTopLine': false,
        'drawRightLine': false,
        'drawBottomLine': true,
        'drawLeftLine': false,
        'zIndex': 2
      },
      'xScale': {
        'minimumGap': 0.01,
        'maximumGap': 0.01
      },
      'horizontalScrollBar': {
        'enabled': true,
        'allowRangeChange': false,
        'autoHide': true,
        'orientation': 'bottom',
        'thumbs': false,
        'fill': null,
        'zIndex': 1010
      },
      'verticalScrollBar': {
        'enabled': true,
        'allowRangeChange': false,
        'autoHide': true,
        'orientation': 'right',
        'thumbs': false,
        'fill': null,
        'zIndex': 1010
      },
      'zoomLevels': [
        {
          'id': 'days',
          'levels': [
            {
              'unit': 'day',
              'count': 1,
              'formats': [
                'MMM\ndd  EEEE'
              ],
              // 'fontColor': '#ABB6BC',
              'textFormatter': function() {
                return this['value'].toUpperCase();
              },
              'hAlign': 'left',
              'textWrap': 'allowWrap'
            }
          ],
          'unit': 'day',
          'count': 1,
          'unitPixSize': 220
        },
        {
          'id': 'weeks',
          'levels': [
            {
              'unit': 'day',
              'count': 1,
              'formats': [
                'dd EEE',
                'dd'
              ],
              'hAlign': 'left',
              'fill': '#fff',
              'fontColor': '#ABB6BC',
              'textFormatter': function() {
                return this['value'].toUpperCase();
              },
              'height': 30
            },
            {
              'unit': 'week',
              'count': 1,
              'formats': [
                'w MMM'
              ],
              'fill': '#F0F5F8',
              'textFormatter': function() {
                return this['value'].toUpperCase();
              }
            }
          ],
          'unit': 'day',
          'count': 1,
          'unitPixSize': 100
        },
        {
          'id': 'months',
          'levels': [
            {
              'unit': 'day',
              'count': 1,
              'formats': [
                'd EEE',
                'd'
              ],
              'hAlign': 'center',
              'padding': [2, 5, 2, 5],
              'fill': '#fff',
              'textFormatter': function() {
                return this['value'].toUpperCase();
              },
              'height': 30
            },
            {
              'unit': 'week',
              'count': 1,
              'formats': [
                'w MMM'
              ],
              'fill': '#F0F5F8',
              'textFormatter': function() {
                return this['value'].toUpperCase();
              }
            }
          ],
          'unit': 'day',
          'count': 1,
          'unitPixSize': 25
        }
      ],
      'zoomLevel': 0,
      'padding': [0, 0, 0, 0],
      'margin': [20, 20, 20, 20],
      'resourceListWidth': 260,
      'timeLineHeight': 52,
      'cellPadding': [2, 2, 2, 2],
      'minRowHeight': 50,
      'pixPerHour': 25,
      'defaultMinutesPerDay': 60,
      'splitterStroke': '#ccc',
      'timeTrackingMode': 'activityPerResource',
      'background': {
        'enabled': true,
        'stroke': '#ccc'
      },
      'tooltip': {
        'allowLeaveScreen': false,
        'allowLeaveChart': true,
        'displayMode': 'single',
        'positionMode': 'float',
        'title': {
          'enabled': true,
          'fontSize': 13
        },
        'separator': {'enabled': true},
        'titleFormatter': '{%name}',
        /** @this {*} */
        'textFormatter': function() {
          var format = window['anychart']['format']['date'];
          return 'Starts: ' + format(this['start']) +
              '\nEnds: ' + format(this['end']);
        }
      }
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
        'padding': {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        'width': null,
        'height': null,
        'anchor': 'leftTop',
        'position': 'leftTop',
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
      'dataGrid': {
        'enabled': true,
        'zIndex': 0
      },
      'scroller': {
        'enabled': true
      },
      'resourceList': {
        'width': '33%',
        'height': '100%',
        'background': {
          'enabled': true,
          'fill': '#ccc',
          'stroke': '#ccc',
          'cornerType': 'none',
          'corners': 0
        },
        'rowHeight': null,
        'minRowHeight': '20%',
        'maxRowHeight': '50%',
        'images': {
          'borderRadius': 10,
          'opacity': 1,
          'align': 'none',
          'fittingMode': 'meet',
          'size': '25%',
          'margin': {
            'top': 5,
            'right': 0,
            'bottom': 5,
            'left': 5
          }
        },
        'baseSettings': {
          'margin': {
            'top': 2,
            'right': 0,
            'bottom': 3,
            'left': 5
          },
          'fontSize': 15,
          'textWrap': 'noWrap',
          'textOverflow': '...'
        },
        'names': {
          'margin': {
            'top': 5
          }
        },
        'types': {
          'fontSize': 10,
          'fontColor': fontColorDark
        },
        'descriptions': {
          'fontSize': 12,
          'fontColor': fontColorBright,
          'fontStyle': 'oblique'
        },
        'tags': {
          'fontSize': 9,
          'fontColor': fontColorDark,
          'background': {
            'enabled': true,
            'fill': '#eee',
            'stroke': '#ccc',
            'cornerType': 'round',
            'corners': 4
          },
          'padding': {
            'top': 5,
            'right': 5,
            'bottom': 5,
            'left': 5
          },
          'margin': {
            'top': 2,
            'right': 0,
            'bottom': 3,
            'left': 5
          }
        }
      },
      'colorRange': {
        'enabled': true,
        'zIndex': 50
      },
      'projectTimeline': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['actualStart'] || this['autoStart'];
            var endDate = this['actualEnd'] || this['autoEnd'];
            var progress = this['progressValue'];

            if (progress === void 0) {
              var auto = this['autoProgress'] * 100;
              progress = (Math.round(auto * 100) / 100 || 0) + '%';
            }

            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '') +
                (progress ? '\nComplete: ' + progress : '');

          }
        }
      },
      'resourceTimeline': {
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormatter': function() {
            return this['name'] || '';
          },
          /**
           * @this {*}
           * @return {string}
           */
          'textFormatter': function() {
            var startDate = this['periodStart'] || this['minPeriodDate'];
            var endDate = this['periodEnd'] || this['maxPeriodDate'];
            return (startDate ? 'Start Date: ' + global['anychart']['format']['dateTime'](startDate) : '') +
                (endDate ? '\nEnd Date: ' + global['anychart']['format']['dateTime'](endDate) : '');
          }
        }
      }
    }
  };
}).call(this);
