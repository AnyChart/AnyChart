goog.provide('anychart.core.ChoroplethPoint');
goog.require('anychart.core.SeriesPoint');



/**
 * Point representing bubble points that belongs to cartesian or scatter chart.
 * @param {anychart.core.SeriesBase} series Series.
 * @param {number} index Point index in series.
 * @constructor
 * @extends {anychart.core.SeriesPoint}
 */
anychart.core.ChoroplethPoint = function(series, index) {
  goog.base(this, series, index);
};
goog.inherits(anychart.core.ChoroplethPoint, anychart.core.SeriesPoint);


/**
 * Getter for bubble point radius.
 * @return {Object} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.getFeatureProp = function() {
  var iterator = this.series.getIterator();
  iterator.select(this.index);
  return  /** @type {Object}*/(iterator.meta('regionProperties'));
};


/**
 * Getter for bubble point radius.
 * @return {anychart.math.Rect} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.getFeatureBounds = function() {
  var iterator = this.series.getIterator();
  iterator.select(this.index);
  var featureElement = iterator.meta('regionShape');
  return /** @type {anychart.math.Rect} */(featureElement.getBoundsWithTransform(featureElement.getFullTransformation()));
};


/**
 * Gets X value of feature middle position.
 * @param {number=} opt_value Value of middle x coord.
 * @return {number|anychart.core.ChoroplethPoint} middleX value in ratio relative feature bounds.
 */
anychart.core.ChoroplethPoint.prototype.middleX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.set('middle-x', opt_value);
    return this;
  } else {
    var iterator = this.series.getIterator();
    iterator.select(this.index);

    var properties = /** @type {Object}*/(iterator.meta('regionProperties'));
    var midX = this.get('middle-x');

    return /** @type {number}*/(goog.isDef(midX) ? midX : properties['middle-x']);
  }
};


/**
 * Gets Y value of feature middle position.
 * * @param {number=} opt_value Value of middle y coord.
 * @return {number|anychart.core.ChoroplethPoint} middleY value in ratio relative feature bounds.
 */
anychart.core.ChoroplethPoint.prototype.middleY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.set('middle-y', opt_value);
    return this;
  } else {
    var iterator = this.series.getIterator();
    iterator.select(this.index);

    var properties = /** @type {Object}*/(iterator.meta('regionProperties'));
    var midY = this.get('middle-y');

    return /** @type {number}*/(goog.isDef(midY) ? midY : properties['middle-y']);
  }
};


/**
 * It gets/sets feature translation.
 * @param {number=} opt_dx Offset x coordinate.
 * @param {number=} opt_dy Offset y coordinate.
 * @return {Array.<number>|anychart.core.ChoroplethPoint} Itself for chaining or feature translation.
 */
anychart.core.ChoroplethPoint.prototype.translation = function(opt_dx, opt_dy) {
  var map = /** @type {anychart.charts.Map} */(this.getChart());
  if (goog.isDef(opt_dx) || goog.isDef(opt_dy)) {
    map.featureTranslation(this.getFeatureProp()[this.series.getFinalGeoIdField()], opt_dx, opt_dy);
    return this;
  } else {
    return /** @type {Array.<number>} */(map.featureTranslation(this.getFeatureProp()[this.series.getFinalGeoIdField()]));
  }
};


/**
 * It moves feature.
 * @param {number} dx Offset x coordinate.
 * @param {number} dy Offset y coordinate.
 * @return {anychart.core.ChoroplethPoint} Itself for chaining or feature translation.
 */
anychart.core.ChoroplethPoint.prototype.translate = function(dx, dy) {
  var map = /** @type {anychart.charts.Map} */(this.getChart());
  map.translateFeature(this.getFeatureProp()[this.series.getFinalGeoIdField()], dx, dy);
  return this;
};


/**
 * It changes crs to feature or returns current feature crs.
 * @param {string=} opt_crs String crs representation.
 * @return {string|anychart.core.ChoroplethPoint} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.crs = function(opt_crs) {
  var map = /** @type {anychart.charts.Map} */(this.getChart());
  if (goog.isDef(opt_crs)) {
    map.featureCrs(this.getFeatureProp()[this.series.getFinalGeoIdField()], opt_crs);
    return this;
  } else {
    return /** @type {string} */(map.featureCrs(this.getFeatureProp()[this.series.getFinalGeoIdField()], opt_crs));
  }
};


/**
 * It scales feature or gets current scale.
 * @param {number=} opt_scale Scale value.
 * @return {number|anychart.core.ChoroplethPoint} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.scaleFactor = function(opt_scale) {
  var map = /** @type {anychart.charts.Map} */(this.getChart());
  if (goog.isDef(opt_scale)) {
    map.featureScaleFactor(this.getFeatureProp()[this.series.getFinalGeoIdField()], opt_scale);
    return this;
  } else {
    return /** @type {number} */(map.featureScaleFactor(this.getFeatureProp()[this.series.getFinalGeoIdField()], opt_scale));
  }
};



//exports
anychart.core.ChoroplethPoint.prototype['getFeatureProp'] = anychart.core.ChoroplethPoint.prototype.getFeatureProp;
anychart.core.ChoroplethPoint.prototype['getFeatureBounds'] = anychart.core.ChoroplethPoint.prototype.getFeatureBounds;
anychart.core.ChoroplethPoint.prototype['middleX'] = anychart.core.ChoroplethPoint.prototype.middleX;
anychart.core.ChoroplethPoint.prototype['middleY'] = anychart.core.ChoroplethPoint.prototype.middleY;
anychart.core.ChoroplethPoint.prototype['translation'] = anychart.core.ChoroplethPoint.prototype.translation;
anychart.core.ChoroplethPoint.prototype['translate'] = anychart.core.ChoroplethPoint.prototype.translate;
anychart.core.ChoroplethPoint.prototype['crs'] = anychart.core.ChoroplethPoint.prototype.crs;
anychart.core.ChoroplethPoint.prototype['scaleFactor'] = anychart.core.ChoroplethPoint.prototype.scaleFactor;
