goog.provide('anychart.mapModule.animation.Zoom');
goog.require('anychart.mapModule.animation.Base');



/**
 * Map zoom animation.
 * @param {anychart.mapModule.Chart} map
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.mapModule.animation.Base}
 */
anychart.mapModule.animation.Zoom = function(map, start, end, duration, opt_silentMode, opt_acc) {
  anychart.mapModule.animation.Zoom.base(this, 'constructor', map, start, end, duration, opt_silentMode, opt_acc);

  this.isRlyMove = false;
};
goog.inherits(anychart.mapModule.animation.Zoom, anychart.mapModule.animation.Base);


/**
 * Does zoom.
 * @param {number} zoom Zoom value.
 * @private
 */
anychart.mapModule.animation.Zoom.prototype.doZoom_ = function(zoom) {
  if (!this.map.geoData()) return;
  var mapLayer = this.map.getMapLayer();

  var boundsWithoutTx = mapLayer.getBoundsWithoutTransform().round();
  var boundsWithTx = mapLayer.getBounds().round();

  var cx = this.map.cx;
  var cy = this.map.cy;

  var zoomInc = this.map.zoomDest / this.map.zoomSource;

  if (!this.map.unlimitedZoom) {
    if (zoomInc < 1 && !boundsWithTx.contains(boundsWithoutTx)) {
      var zoomParam = this.map.zoomToBounds(boundsWithoutTx, boundsWithTx);
      cx = zoomParam[1];
      cy = zoomParam[2];
    }

    if (cx < boundsWithTx.left)
      cx = boundsWithTx.left;
    else if (cx > boundsWithTx.getRight())
      cx = boundsWithTx.getRight();

    if (cy < boundsWithTx.top)
      cy = boundsWithTx.top;
    else if (cy > boundsWithTx.getBottom())
      cy = boundsWithTx.getBottom();
  }

  var zoomMultiplier = zoom / this.map.getZoomLevel();

  mapLayer.scale(zoomMultiplier, zoomMultiplier, cx, cy);

  this.map.fullZoom = zoom;

  var tx = mapLayer.getSelfTransformation();
  this.map.scale().setMapZoom(tx.getScaleX());
  this.map.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());
  this.map.updateSeriesOnZoomOrMove();

  //debug shapes
  // var mapLayer = this.map.getMapLayer();
  // var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
  // var boundsWithTx = mapLayer.getBounds();
  //
  // if (!this.map.bwt) this.map.bwt = this.map.container().rect().zIndex(1000);
  // this.map.bwt.setBounds(boundsWithoutTx);
  //
  // if (!this.map.bwit) this.map.bwit = this.map.container().rect().zIndex(1000);
  // this.map.bwit.setBounds(boundsWithTx);
};


/**
 * Does move.
 * @param {number} dx .
 * @param {number} dy .
 * @private
 */
anychart.mapModule.animation.Zoom.prototype.doMove_ = function(dx, dy) {
  var tx = this.map.getMapLayer().getSelfTransformation();
  this.map.getMapLayer().setTransformationMatrix(tx.getScaleX(), 0, 0, tx.getScaleY(), dx, dy);

  this.map.scale().setMapZoom(tx.getScaleX());
  this.map.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

  this.map.updateSeriesOnZoomOrMove();

  //debug shapes
  // var mapLayer = this.map.getMapLayer();
  // var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
  // var boundsWithTx = mapLayer.getBounds();
  //
  // if (!this.map.bwt) this.map.bwt = this.map.container().rect().zIndex(1000);
  // this.map.bwt.setBounds(boundsWithoutTx);
  //
  // if (!this.map.bwit) this.map.bwit = this.map.container().rect().zIndex(1000);
  // this.map.bwit.setBounds(boundsWithTx);
};


/** @inheritDoc */
anychart.mapModule.animation.Zoom.prototype.onBegin = function() {
  this.isRlyMove = anychart.math.roughlyEqual(this.startPoint[0], this.endPoint[0], 0.00001) && this.map.allowMoveOnEqualZoomLevels;

  anychart.mapModule.animation.Zoom.base(this, 'onBegin');
};


/** @inheritDoc */
anychart.mapModule.animation.Zoom.prototype.onAnimate = function() {
  if (this.isRlyMove) {
    var currDx = this.coords[1];
    var currDy = this.coords[2];
    this.doMove_(currDx, currDy);
  } else {
    var currZoom = this.coords[0];
    this.doZoom_(currZoom);
  }

  if (!this.silentMode)
    this.map.getRootScene().dispatchEvent(this.map.createZoomEvent(anychart.enums.EventType.ZOOM));

  anychart.mapModule.animation.Zoom.base(this, 'onAnimate');
};


/** @inheritDoc */
anychart.mapModule.animation.Zoom.prototype.onFinish = function() {
  if (this.map.geoData()) {
    var currZoom = this.coords[0];
    var currDx = this.coords[1];
    var currDy = this.coords[2];

    if (this.isRlyMove) {
      this.doMove_(currDx, currDy);
    } else {
      var tx = this.map.getMapLayer().getSelfTransformation();
      var minZoom = /** @type {number} */(this.map.getOption('minZoomLevel'));

      if (!this.map.unlimitedZoom && currZoom <= minZoom && !tx.isIdentity() || this.map.zoomDest == minZoom) {
        this.map.getMapLayer().setTransformationMatrix(minZoom, 0, 0, minZoom, 0, 0);
        this.map.fullZoom = minZoom;

        this.map.scale().setMapZoom(minZoom);
        this.map.scale().setOffsetFocusPoint(0, 0);
        this.map.updateSeriesOnZoomOrMove();
      } else {
        this.doZoom_(currZoom);
      }
    }
  }
  this.map.lastZoomIsUnlimited = this.map.unlimitedZoom;
  this.map.unlimitedZoom = false;
  this.map.zoomDuration = NaN;

  //debug shapes
  // var mapLayer = this.map.getMapLayer();
  // var boundsWithoutTx = mapLayer.getBoundsWithoutTransform();
  // var boundsWithTx = mapLayer.getBounds();
  //
  // if (!this.map.bwt) this.map.bwt = this.map.container().rect().zIndex(1000);
  // this.map.bwt.setBounds(boundsWithoutTx);
  //
  // if (!this.map.bwit) this.map.bwit = this.map.container().rect().zIndex(1000);
  // this.map.bwit.setBounds(boundsWithTx);

  anychart.mapModule.animation.Zoom.base(this, 'onFinish');
};


/** @inheritDoc */
anychart.mapModule.animation.Zoom.prototype.onEnd = function() {
  if (!this.silentMode)
    this.map.getRootScene().dispatchEvent(this.map.createZoomEvent(anychart.enums.EventType.ZOOM_END));

  anychart.mapModule.animation.Zoom.base(this, 'onEnd');

  this.map.zoomAnimation = null;
  this.map = null;
  this.dispose();
};
