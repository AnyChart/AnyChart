goog.provide('anychart.core.utils.AxisLabelsContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.enums');



/**
 * Axis context provider.
 * @param {anychart.core.axes.Linear|anychart.core.axes.Circular|anychart.core.axes.Polar|anychart.core.axes.Radar|anychart.core.axes.Radial} axis Axis.
 * @param {number} index Label index.
 * @param {string|number} value Label value.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.AxisLabelsContextProvider = function(axis, index, value) {
  anychart.core.utils.AxisLabelsContextProvider.base(this, 'constructor');
  this['axis'] = axis;
  var scale = axis.scale();

  var labelText, labelValue;
  if (scale instanceof anychart.scales.Linear) {
    labelText = parseFloat(value);
    labelValue = parseFloat(value);
  } else if (scale instanceof anychart.scales.Ordinal) {
    labelText = scale.ticks().names()[index];
    labelValue = value;
  } else if (scale instanceof anychart.scales.DateTime) {
    var date = new Date(value);
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var yy = date.getFullYear();

    mm = mm < 10 ? '0' + mm : '' + mm;
    dd = dd < 10 ? '0' + dd : '' + dd;

    labelText = mm + '-' + dd + '-' + yy;
    labelValue = value;
  }
  this['index'] = index;
  this['value'] = labelText;
  this['tickValue'] = labelValue;
  this['max'] = goog.isDef(scale.max) ? scale.max : null;
  this['min'] = goog.isDef(scale.min) ? scale.min : null;
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
      return this['axis'].title().text();
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
anychart.core.utils.AxisLabelsContextProvider.prototype['getTokenValue'] = anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenValue;
anychart.core.utils.AxisLabelsContextProvider.prototype['getTokenType'] = anychart.core.utils.AxisLabelsContextProvider.prototype.getTokenType;
