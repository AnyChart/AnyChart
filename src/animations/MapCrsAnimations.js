goog.provide('anychart.animations.MapCrsAnimation');
goog.require('anychart.animations.MapAnimation');



/**
 * Map zoom animation.
 * @param {anychart.charts.Map} map
 * @param {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} geoData .
 * @param {anychart.core.map.projections.Base} srcProjection .
 * @param {Object} tx .
 * @param {number} duration
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.MapAnimation}
 */
anychart.animations.MapCrsAnimation = function(map, geoData, srcProjection, tx, duration, opt_silentMode, opt_acc) {
  anychart.animations.MapCrsAnimation.base(this, 'constructor', map, [], [], duration, opt_silentMode, opt_acc);

  /**
   * Map geo data.
   * @type {?Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>}
   */
  this.geoData = geoData;

  /**
   * Source map projection.
   * @type {anychart.core.map.projections.Base}
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
goog.inherits(anychart.animations.MapCrsAnimation, anychart.animations.MapAnimation);


/**
 * Animates projection and calculates geo scale.
 * @param {Array.<number>} coords Array of coords.
 * @param {number} index Current index.
 * @param {anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon} geom Geom object.
 * @this {{
 *    t: number,
 *    tx: Object,
 *    srcProjection: anychart.core.map.projections.Base,
 *    geoScale: anychart.scales.Geo
 * }}
 * @private
 */
anychart.animations.MapCrsAnimation.prototype.calcGeom_ = function(coords, index, geom) {
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
anychart.animations.MapCrsAnimation.prototype.updateCoords = function(t) {
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
      /** @type {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} */(this.geoData),
      callback,
      false,
      true);
  this.map.scale().finishAutoCalc();
  this.map.scale().resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.animations.MapCrsAnimation.prototype.stop = function(opt_gotoEnd) {
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
anychart.animations.MapCrsAnimation.prototype.cycle = function(now) {
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
anychart.animations.MapCrsAnimation.prototype.disposeInternal = function() {
  anychart.animations.MapCrsAnimation.base(this, 'disposeInternal');

  this.geoData = null;
  this.srcProjection = null;
  this.tx = null;
};
