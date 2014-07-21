goog.provide('anychart.scales');

goog.require('anychart.scales.DateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Logarithmic');
goog.require('anychart.scales.Ordinal');

/**
 @namespace
 @name anychart.scales
 */


/**
 * Returns an instance of the scale.
 * @param {string} type json config.
 * @return {!anychart.scales.Base} Class constructor.
 */
anychart.scales.createByType = function(type) {
  var scale;

  if (type == 'ordinal') {
    scale = new anychart.scales.Ordinal();
  } else if (type == 'linear') {
    scale = new anychart.scales.Linear();
  } else if (type == 'datetime') {
    scale = new anychart.scales.DateTime();
  } else {
    throw 'Unknown scale type: ' + type + '\nIt can be contains in other modules, see module list for details.';
  }

  return scale;
};
