goog.provide('anychart.core.ui.DataArea');
goog.require('anychart.consistency');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');



/**
 * DataArea class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.DataArea = function() {
  anychart.core.ui.DataArea.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.DataArea, anychart.core.VisualBase);
anychart.consistency.supportStates(anychart.core.ui.DataArea, anychart.enums.Store.DATA_AREA, anychart.enums.State.APPEARANCE);


//region State / Signal
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.DataArea.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


//endregion
//region Infrastructure
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.ui.DataArea|anychart.core.ui.Background} .
 */
anychart.core.ui.DataArea.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Background invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.ui.DataArea.prototype.backgroundInvalidated_ = function(e) {
  this.invalidateState(anychart.enums.Store.DATA_AREA, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Drawing
/** @inheritDoc */
anychart.core.ui.DataArea.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.parent(null);
};


/**
 * Applies clip to rootLayer.
 * @param {acgraph.vector.Path} clip
 */
anychart.core.ui.DataArea.prototype.applyClip = function(clip) {
  if (this.rootLayer)
    this.rootLayer.clip(clip);
};


/**
 * Draws background for data area
 * @return {anychart.core.ui.DataArea} Self.
 */
anychart.core.ui.DataArea.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidateState(anychart.enums.Store.DATA_AREA, anychart.enums.State.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.DATA_AREA, anychart.enums.State.APPEARANCE)) {
    var background = this.getCreated('background');
    if (background) {
      background.suspendSignalsDispatching();
      if (!background.container()) background.container(this.rootLayer);
      background.parentBounds(/** @type {anychart.math.Rect} */ (this.parentBounds()));
      background.resumeSignalsDispatching(false);
      background.draw();
    }
    this.markStateConsistent(anychart.enums.Store.DATA_AREA, anychart.enums.State.APPEARANCE);
  }

  return this;
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.core.ui.DataArea.prototype.serialize = function() {
  var json = anychart.core.ui.DataArea.base(this, 'serialize');
  json['background'] = this.background().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.DataArea.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.DataArea.base(this, 'setupByJSON', config, opt_default);
  this.background().setupInternal(!!opt_default, config['background']);
};


/** @inheritDoc */
anychart.core.ui.DataArea.prototype.disposeInternal = function() {
  goog.disposeAll(this.background_);
  this.background_ = null;
  anychart.core.ui.DataArea.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function() {
  var proto = anychart.core.ui.DataArea.prototype;
  proto['background'] = proto.background;
})();
//endregion
