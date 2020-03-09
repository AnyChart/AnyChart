goog.provide('anychart.reflow.CanvasMeasuriator');

anychart.reflow.CanvasMeasuriator = function() {

};


anychart.reflow.CanvasMeasuriator.BASELINE = 11;

/**
 *
 * @param style
 * @returns {{calculatedLineHeight: number, baseline: number, styleString: string}}
 * @private
 */
anychart.reflow.CanvasMeasuriator.prototype.getStyleMetrics_ = function(style) {
  // Conditions below are taken according to https://developer.mozilla.org/en-US/docs/Web/CSS/font .
  var styleString = '';
  if ('fontStyle' in style) {
    styleString += style['fontStyle'] + ' ';
  }
  if ('fontVariant' in style) {
    styleString += style['fontVariant'] + ' ';
  }
  if ('fontWeight' in style) {
    styleString += style['fontWeight'] + ' ';
  }
  if ('fontSize' in style) { // Required.
    styleString += style['fontSize'] + 'px ';
  } else {
    styleString += '13px ';
  }
  if ('lineHeight' in style) {
    styleString += style['lineHeight'] + ' ';
  }
  if ('fontFamily' in style) { // Required.
    styleString += style['fontFamily'] + ' ';
  } else {
    styleString += '"Verdana, Helvetica, Arial, sans-serif" ';
  }


  var fontSize = parseFloat(style['fontSize']);
  fontSize = isNaN(fontSize) ? 13 : fontSize;
  var calculatedLineHeight = fontSize < 24 ? fontSize + 3 : Math.round(fontSize * 1.2);
  var baseline = Math.round(calculatedLineHeight * 0.8);
  return {
    calculatedLineHeight: calculatedLineHeight,
    baseline: baseline,
    styleString: styleString
  }

};

/**
 *
 * @param textValue
 * @param style
 * @returns {{width: Number, height: number, baseline: number}}
 */
anychart.reflow.CanvasMeasuriator.prototype.getTextSize = function(textValue, style) {
  // TODO (A.Kudryavtsev): Should we cache text+style calculated metrics somehow?
  anychart.canvas.width = anychart.canvas.width; // This clears canvas.
  var context2D = anychart.getContext('2d');
  var styleMetrics = this.getStyleMetrics_(style);
  context2D.font = styleMetrics.styleString;
  var canvasMeasure = context2D.measureText(text);

  return {
    width: canvasMeasure.width,
    height: styleMetrics.calculatedLineHeight,
    baseline: styleMetrics.baseline
  }
};