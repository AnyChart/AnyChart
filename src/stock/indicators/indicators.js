/**
 * @fileoverview anychart.stockModule.indicators namespace file.
 * @suppress {extraRequire}
 */
goog.provide('anychart.stockModule.indicators');
goog.require('anychart.stockModule.indicators.ADL');
goog.require('anychart.stockModule.indicators.AMA');
goog.require('anychart.stockModule.indicators.ATR');
goog.require('anychart.stockModule.indicators.Aroon');
goog.require('anychart.stockModule.indicators.BBands');
goog.require('anychart.stockModule.indicators.BBandsB');
goog.require('anychart.stockModule.indicators.BBandsWidth');
goog.require('anychart.stockModule.indicators.CCI');
goog.require('anychart.stockModule.indicators.CHO');
goog.require('anychart.stockModule.indicators.CMF');
goog.require('anychart.stockModule.indicators.DMI');
goog.require('anychart.stockModule.indicators.EMA');
goog.require('anychart.stockModule.indicators.KDJ');
goog.require('anychart.stockModule.indicators.MACD');
goog.require('anychart.stockModule.indicators.MFI');
goog.require('anychart.stockModule.indicators.MMA');
goog.require('anychart.stockModule.indicators.Momentum');
goog.require('anychart.stockModule.indicators.PSAR');
goog.require('anychart.stockModule.indicators.RSI');
goog.require('anychart.stockModule.indicators.RoC');
goog.require('anychart.stockModule.indicators.SMA');
goog.require('anychart.stockModule.indicators.Stochastic');
goog.require('anychart.stockModule.indicators.WilliamsR');

/**
 * @namespace
 * @name anychart.stockModule.indicators
 */


/**
 * Indicators config for plot.
 * @type {!Object.<Function>}
 */
anychart.stockModule.indicators.config = (function() {
  var res = {};
  res[anychart.enums.StockIndicatorTypes.ADL] = anychart.stockModule.indicators.ADL;
  res[anychart.enums.StockIndicatorTypes.AMA] = anychart.stockModule.indicators.AMA;
  res[anychart.enums.StockIndicatorTypes.AROON] = anychart.stockModule.indicators.Aroon;
  res[anychart.enums.StockIndicatorTypes.ATR] = anychart.stockModule.indicators.ATR;
  res[anychart.enums.StockIndicatorTypes.BBANDS] = anychart.stockModule.indicators.BBands;
  res[anychart.enums.StockIndicatorTypes.BBANDS_B] = anychart.stockModule.indicators.BBandsB;
  res[anychart.enums.StockIndicatorTypes.BBANDS_WIDTH] = anychart.stockModule.indicators.BBandsWidth;
  res[anychart.enums.StockIndicatorTypes.CCI] = anychart.stockModule.indicators.CCI;
  res[anychart.enums.StockIndicatorTypes.CHO] = anychart.stockModule.indicators.CHO;
  res[anychart.enums.StockIndicatorTypes.CMF] = anychart.stockModule.indicators.CMF;
  res[anychart.enums.StockIndicatorTypes.DMI] = anychart.stockModule.indicators.DMI;
  res[anychart.enums.StockIndicatorTypes.EMA] = anychart.stockModule.indicators.EMA;
  res[anychart.enums.StockIndicatorTypes.KDJ] = anychart.stockModule.indicators.KDJ;
  res[anychart.enums.StockIndicatorTypes.MACD] = anychart.stockModule.indicators.MACD;
  res[anychart.enums.StockIndicatorTypes.MFI] = anychart.stockModule.indicators.MFI;
  res[anychart.enums.StockIndicatorTypes.MMA] = anychart.stockModule.indicators.MMA;
  res[anychart.enums.StockIndicatorTypes.MOMENTUM] = anychart.stockModule.indicators.Momentum;
  res[anychart.enums.StockIndicatorTypes.PSAR] = anychart.stockModule.indicators.PSAR;
  res[anychart.enums.StockIndicatorTypes.ROC] = anychart.stockModule.indicators.RoC;
  res[anychart.enums.StockIndicatorTypes.RSI] = anychart.stockModule.indicators.RSI;
  res[anychart.enums.StockIndicatorTypes.SMA] = anychart.stockModule.indicators.SMA;
  res[anychart.enums.StockIndicatorTypes.STOCHASTIC] = anychart.stockModule.indicators.Stochastic;
  res[anychart.enums.StockIndicatorTypes.WILLIAMS_R] = anychart.stockModule.indicators.WilliamsR;
  return res;
})();


/**
 * @param {!Function} plotConstructor
 */
anychart.stockModule.indicators.generateIndicatorsConstructors = function(plotConstructor) {
  var prototype = plotConstructor.prototype;
  var methodGenerator = function(name) {
    return function(var_args) { // arguments here are [mapping, .....];
      var indicatorParameters = [this];
      for (var i = 0; i < arguments.length; i++) {
        indicatorParameters[i + 1] = arguments[i];
      }
      var indicatorConstructor = anychart.stockModule.indicators.config[name];
      var result = new indicatorConstructor(indicatorParameters);
      this.indicators_.push(result);
      return result;
    };
  };
  for (var i in anychart.stockModule.indicators.config) {
    var methodName = anychart.utils.toCamelCase(i);

    /**
     * @param {!anychart.stockModule.data.TableMapping} mapping
     * @param {...*} var_args arguments for indicator constructor
     * @return {anychart.stockModule.indicators.Base}
     * @this {anychart.stockModule.Plot|anychart.stockModule.Scroller}
     */
    prototype[methodName] = methodGenerator(i);
  }
};
