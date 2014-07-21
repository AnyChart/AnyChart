goog.provide('anychart.cartesian.series.Bar');

goog.require('anychart.cartesian.series.BarBase');



/**
 * Define Bar series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.cartesian.Chart#bar} or {@link anychart.Chart#barChart}.
 * @example <t>simple</t>
 * new anychart.cartesian.series.Bar([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.BarBase}
 */
anychart.cartesian.series.Bar = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.cartesian.series.Bar, anychart.cartesian.series.BarBase);
anychart.cartesian.series.seriesTypesMap[anychart.cartesian.series.Type.BAR] = anychart.cartesian.series.Bar;


/** @inheritDoc */
anychart.cartesian.series.Bar.prototype.drawSubsequentPoint = function() {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    /** @type {!acgraph.vector.Rect} */
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPointWidth();

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y).meta('shape', rect);
    rect.setY(x - barWidth / 2).setX(Math.min(zero, y)).setHeight(barWidth).setWidth(Math.abs(zero - y));

    this.colorizeShape(false);

    this.makeHoverable(rect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    var iterator = this.getIterator();
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }

    this.applyHatchFill(false);
  }

  return true;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bar.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = anychart.cartesian.series.Type.BAR;
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Bar.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.cartesian.series.Bar}
 */
anychart.cartesian.series.bar = function(data, opt_csvSettings) {
  return new anychart.cartesian.series.Bar(data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.cartesian.series.bar', anychart.cartesian.series.bar);
anychart.cartesian.series.Bar.prototype['fill'] = anychart.cartesian.series.Bar.prototype.fill;//in docs/
anychart.cartesian.series.Bar.prototype['hoverFill'] = anychart.cartesian.series.Bar.prototype.hoverFill;//in docs/
anychart.cartesian.series.Bar.prototype['stroke'] = anychart.cartesian.series.Bar.prototype.stroke;//in docs/
anychart.cartesian.series.Bar.prototype['hoverStroke'] = anychart.cartesian.series.Bar.prototype.hoverStroke;//in docs/
anychart.cartesian.series.Bar.prototype['hatchFill'] = anychart.cartesian.series.Bar.prototype.hatchFill;//in docs/
anychart.cartesian.series.Bar.prototype['hoverHatchFill'] = anychart.cartesian.series.Bar.prototype.hoverHatchFill;//in docs/
