goog.provide('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.enums');



/**
 * Axis context provider.
 * @param {anychart.core.axes.Linear|anychart.core.axes.Circular|anychart.core.axes.Polar|anychart.core.axes.Radar|anychart.core.axes.Radial} axis Axis.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @param {*=} opt_rightValue
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.AxisLabelsContextProvider = function(axis, index, value, opt_rightValue) {
  anychart.core.utils.AxisLabelsContextProvider.base(this, 'constructor');
  this['axis'] = axis;
  var scale = axis.scale();

  var labelText, labelValue;
  var addRange = true;
  if (scale instanceof anychart.scales.Ordinal) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
    addRange = false;
  } else if (scale instanceof anychart.scales.DateTime) {
    labelText = anychart.format.date(/** @type {number} */(value));
    labelValue = value;
  } else {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  }
  this['index'] = index;
  this['value'] = labelText;
  this['tickValue'] = labelValue;
  if (addRange) {
    this['max'] = goog.isDef(scale.max) ? scale.max : null;
    this['min'] = goog.isDef(scale.min) ? scale.min : null;
  }
  this['scale'] = scale;
  //TODO as soon as it is possible:
  //sum -- the sum data values from series bound to this axis (depends on orientation)
  //average -- the sum divided by the number of points
  //median -- axis median
  //mode -- axis mode
};
goog.inherits(anychart.core.utils.AxisLabelsContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.AXIS_NAME:
      return this['axis'].title()['text']();
    case anychart.enums.StringToken.AXIS_SCALE_MAX:
      return this['max'];
    case anychart.enums.StringToken.AXIS_SCALE_MIN:
      return this['min'];
  }
  return anychart.core.utils.AxisLabelsContextProvider.base(this, 'getTokenValue', name);
};


/** @inheritDoc */
anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenType = function(name) {
  var scale = this['axis'].scale();

  switch (name) {
    case anychart.enums.StringToken.AXIS_SCALE_MAX:
    case anychart.enums.StringToken.AXIS_SCALE_MIN:
    case anychart.enums.StringToken.INDEX:
      return anychart.enums.TokenType.NUMBER;
    case anychart.enums.StringToken.VALUE:
      if (scale instanceof anychart.scales.Linear) {
        return anychart.enums.TokenType.NUMBER;
      } else if (scale instanceof anychart.scales.Ordinal) {
        return anychart.enums.TokenType.STRING;
      } else if (scale instanceof anychart.scales.DateTime) {
        return anychart.enums.TokenType.STRING;
      }
  }
  return anychart.core.utils.AxisLabelsContextProvider.base(this, 'getTokenType', name);
};


/**
 * Dummy.
 * @return {undefined}
 */
anychart.core.utils.AxisLabelsContextProvider.prototype.getDataValue = function() {
  return undefined;
};


//exports
(function() {
  var proto = anychart.core.utils.AxisLabelsContextProvider.prototype;
  proto['getTokenValue'] = proto.getTokenValue;
  proto['getTokenType'] = proto.getTokenType;
})();
