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
  anychart.core.ChoroplethPoint.base(this, 'constructor', series, index);
};
goog.inherits(anychart.core.ChoroplethPoint, anychart.core.SeriesPoint);


/**
 * Getter for bubble point radius.
 * @return {Object} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.getFeatureProp = function() {
  var iterator = this.series.getIterator();
  iterator.select(this.index);
  var features = iterator.meta('features');
  return /** @type {Object}*/(features[0]['properties']);
};


/**
 * Getter for bubble point radius.
 * @return {anychart.math.Rect} Radius in pixels.
 */
anychart.core.ChoroplethPoint.prototype.getFeatureBounds = function() {
  var iterator = this.series.getIterator();
  iterator.select(this.index);
  var features = iterator.meta('features');
  var featureElement = features[0].domElement;
  return /** @type {anychart.math.Rect} */(featureElement.getAbsoluteBounds());
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

    var features = iterator.meta('features');
    var properties = features && features.length ? features[0]['properties'] : null;
    var midX = this.get('middle-x');

    return /** @type {number}*/(goog.isDef(midX) ? midX : properties ? properties['middle-x'] : .5);
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

    var features = iterator.meta('features');
    var properties = features && features.length ? features[0]['properties'] : null;
    var midY = this.get('middle-y');

    return /** @type {number}*/(goog.isDef(midY) ? midY : properties ? properties['middle-y'] : .5);
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
(function() {
  var proto = anychart.core.ChoroplethPoint.prototype;
  proto['getFeatureProp'] = proto.getFeatureProp;
  proto['getFeatureBounds'] = proto.getFeatureBounds;
  proto['middleX'] = proto.middleX;
  proto['middleY'] = proto.middleY;
  proto['translation'] = proto.translation;
  proto['translate'] = proto.translate;
  proto['crs'] = proto.crs;
  proto['scaleFactor'] = proto.scaleFactor;
})();
