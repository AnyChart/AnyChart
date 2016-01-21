goog.provide('anychart.core.cartesian.series.Bar');

goog.require('anychart.core.cartesian.series.BarBase');



/**
 * Define Bar series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#bar} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.BarBase}
 */
anychart.core.cartesian.series.Bar = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
  this.isAnimation_ = false;
  this.needsZero = true;
};
goog.inherits(anychart.core.cartesian.series.Bar, anychart.core.cartesian.series.BarBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.BAR] = anychart.core.cartesian.series.Bar;


/**
 * Whether series in animation now.
 * @param {boolean} value animation state.
 */
anychart.core.cartesian.series.Bar.prototype.setAnimation = function(value) {
  if (goog.isDef(value)) {
    if (this.isAnimation_ != value) {
      this.isAnimation_ = value;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar.prototype.drawSubsequentPoint = function(pointState) {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = /** @type {number} */(this.iterator.meta('x'));
    var y = /** @type {number} */(this.iterator.meta('value'));
    var zero = /** @type {number} */(this.iterator.meta('zero'));
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPointWidth();

    this.iterator.meta('shape', rect);

    if (this.isAnimation_) {
      rect
          .setY(x - barWidth / 2)
          .setHeight(barWidth);
    } else {
      rect
          .setX(Math.min(zero, y))
          .setY(x - barWidth / 2)
          .setWidth(Math.abs(zero - y))
          .setHeight(barWidth);
    }

    this.colorizeShape(pointState);

    this.makeInteractive(rect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    this.iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(this.iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState);
  }
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Bar.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.BAR;
};


//exports
anychart.core.cartesian.series.Bar.prototype['fill'] = anychart.core.cartesian.series.Bar.prototype.fill;
anychart.core.cartesian.series.Bar.prototype['hoverFill'] = anychart.core.cartesian.series.Bar.prototype.hoverFill;
anychart.core.cartesian.series.Bar.prototype['selectFill'] = anychart.core.cartesian.series.Bar.prototype.selectFill;

anychart.core.cartesian.series.Bar.prototype['stroke'] = anychart.core.cartesian.series.Bar.prototype.stroke;
anychart.core.cartesian.series.Bar.prototype['hoverStroke'] = anychart.core.cartesian.series.Bar.prototype.hoverStroke;
anychart.core.cartesian.series.Bar.prototype['selectStroke'] = anychart.core.cartesian.series.Bar.prototype.selectStroke;

anychart.core.cartesian.series.Bar.prototype['hatchFill'] = anychart.core.cartesian.series.Bar.prototype.hatchFill;
anychart.core.cartesian.series.Bar.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Bar.prototype.hoverHatchFill;
anychart.core.cartesian.series.Bar.prototype['selectHatchFill'] = anychart.core.cartesian.series.Bar.prototype.selectHatchFill;
