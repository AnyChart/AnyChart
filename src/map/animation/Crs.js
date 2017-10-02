goog.provide('anychart.mapModule.animation.Crs');
goog.require('anychart.mapModule.animation.Base');



/**
 * Map zoom animation.
 * @param {anychart.mapModule.Chart} map
 * @param {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} geoData .
 * @param {anychart.mapModule.projections.Base} srcProjection .
 * @param {Object} tx .
 * @param {number} duration
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.mapModule.animation.Base}
 */
anychart.mapModule.animation.Crs = function(map, geoData, srcProjection, tx, duration, opt_silentMode, opt_acc) {
  anychart.mapModule.animation.Crs.base(this, 'constructor', map, [], [], duration, opt_silentMode, opt_acc);

  /**
   * Map geo data.
   * @type {?Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>}
   */
  this.geoData = geoData;

  /**
   * Source map projection.
   * @type {anychart.mapModule.projections.Base}
   */
  this.srcProjection = srcProjection;

  /**
   * Transform object.
   * @type {Object}
   */
  this.tx = tx;

  /**
   * Acceleration function, which must return a number between 0 and 1 for
   * inputs between 0 and 1.
   * @type {Function|undefined}
   */
  this.accel = opt_acc;
};
goog.inherits(anychart.mapModule.animation.Crs, anychart.mapModule.animation.Base);


/**
 * Animates projection and calculates geo scale.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon} geom Geom object.
 * @this {{
 *    t: number,
 *    tx: Object,
 *    srcProjection: anychart.mapModule.projections.Base,
 *    geoScale: anychart.mapModule.scales.Geo
 * }}
 * @private
 */
anychart.mapModule.animation.Crs.prototype.calcGeom_ = function(coords, index, geom) {
  var x, y, p0, p1;

  x = ((coords[index] - this.tx.xoffset) / this.tx.scale);
  y = ((coords[index + 1] - this.tx.yoffset) / this.tx.scale);

  if (this.srcProjection) {
    p0 = this.srcProjection.invert(x, y);
    x = p0[0];
    y = p0[1];
  }

  p1 = this.tx.curProj.forward(x, y);

  coords[index] = p1[0] * this.tx.scale + this.tx.xoffset;
  coords[index + 1] = p1[1] * this.tx.scale + this.tx.yoffset;

  this.geoScale.extendDataRangeInternal(coords[index], coords[index + 1]);
};


/**
 * Calculates current coordinates, based on the current state.  Applies
 * the accelleration function if it exists.
 * @param {number} t Percentage of the way through the animation as a decimal.
 */
anychart.mapModule.animation.Crs.prototype.updateCoords = function(t) {
  if (goog.isFunction(this.accel)) {
    t = this.accel(t);
  }

  var callback = goog.bind(this.calcGeom_, {
    t: t,
    tx: this.tx,
    srcProjection: this.srcProjection,
    geoScale: this.map.scale()
  });

  this.tx.curProj.ratio(t);
  this.map.scale().suspendSignalsDispatching();
  this.map.scale().startAutoCalc(false);
  this.map.postProcessGeoData(
      /** @type {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} */(this.geoData),
      callback,
      false,
      true);
  this.map.scale().finishAutoCalc();
  this.map.scale().resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.mapModule.animation.Crs.prototype.stop = function(opt_gotoEnd) {
  goog.fx.anim.unregisterAnimation(this);
  this.setStateStopped();

  if (!!opt_gotoEnd) {
    this.progress = 1;
  }

  this.updateCoords(this.progress);

  this.onStop();
  this.onEnd();
};


/** @inheritDoc */
anychart.mapModule.animation.Crs.prototype.cycle = function(now) {
  if (this.isStopped())
    return;

  this.progress = (now - this.startTime) / (this.endTime - this.startTime);

  if (this.progress >= 1) {
    this.progress = 1;
  }

  this.lastFrame = now;

  this.updateCoords(this.progress);

  // Animation has finished.
  if (this.progress == 1) {
    this.setStateStopped();
    goog.fx.anim.unregisterAnimation(this);

    this.onFinish();
    this.onEnd();

    // Animation is still under way.
  } else if (this.isPlaying()) {
    this.onAnimate();
  }
};


/** @inheritDoc */
anychart.mapModule.animation.Crs.prototype.disposeInternal = function() {
  anychart.mapModule.animation.Crs.base(this, 'disposeInternal');

  this.geoData = null;
  this.srcProjection = null;
  this.tx = null;
};
