goog.provide('anychart.annotationsModule.PatternBase');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.format.Context');



/**
 * Stock chart patterns base.
 * A pattern is identified by lines created by price movement, that is recognizable and has an anticipated target.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.PatternBase = function(chartController) {
  anychart.annotationsModule.PatternBase.base(this, 'constructor', chartController);

  /**
   * Paths array.
   * @type {Array.<acgraph.vector.Path>}
   * @protected
   */
  this.paths_ = null;

  /**
   * Stroke resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Stroke}
   * @protected
   */
  this.strokeResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Stroke} */(
      anychart.annotationsModule.Base.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true));

  /**
   * Fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.Fill}
   * @protected
   */
  this.fillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Fill} */(
      anychart.annotationsModule.Base.getColorResolver('fill', anychart.enums.ColorType.FILL, true));

  /**
   * Hatch fill resolver.
   * @param {anychart.annotationsModule.Base} annotation
   * @param {number} state
   * @return {acgraph.vector.PatternFill}
   * @protected
   */
  this.hatchFillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.PatternFill} */(
      anychart.annotationsModule.Base.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true));
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META);

  /**
   * This is a flag that is setup in labels invalidation processing and that means that the labels should be redrawn
   * after processing
   * @type {boolean}
   * @protected
   */
  this.shouldShowTarget = false;
};
goog.inherits(anychart.annotationsModule.PatternBase, anychart.annotationsModule.Base);
anychart.core.settings.populateAliases(anychart.annotationsModule.PatternBase, ['fill', 'hatchFill', 'stroke'], 'normal');
anychart.core.settings.populate(anychart.annotationsModule.PatternBase, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.PatternBase, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.PatternBase, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.PatternBase, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternBase.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.THREE_POINTS;


/**
 * Show/hide pattern target (draw a line with an arrow tip)
 * @param {boolean} visible
 * @return {Array.<number>|anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternBase.prototype.showTarget = function(visible) {
  this.shouldShowTarget = visible;
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_LAST_POINT);
  return this;
};


//endregion
//region State settings
/** @inheritDoc */
anychart.annotationsModule.PatternBase.prototype.getNormalDescriptorsMeta = function() {
    var base = anychart.annotationsModule.PatternBase.base(this, 'getNormalDescriptorsMeta');
    return goog.array.concat(base, anychart.annotationsModule.FILL_STROKE_DESCRIPTORS_META);
  };


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternBase.prototype.ensureCreated = function() {
    anychart.annotationsModule.PatternBase.base(this, 'ensureCreated');

    if (!this.paths_) {
      // main, hatch, hover
      this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
      this.paths_[0].zIndex(anychart.annotationsModule.Base.STROKE_ZINDEX);
      this.paths_[1].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
      this.paths_[2].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
      this.paths_[3].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
    }
  };


  /** @inheritDoc */
  anychart.annotationsModule.PatternBase.prototype.drawOnePointShape = function(x, y) {
    // for (var i = 0; i < this.paths_.length; i++) {
      // stroke only
      var path = this.paths_[0];
      path.clear();
      path.moveTo(x, y).lineTo(x, y);
    // }
  };


  /** @inheritDoc */
  anychart.annotationsModule.PatternBase.prototype.drawTwoPointsShape = function(x1, y1, x2, y2) {
    // for (var i = 0; i < this.paths_.length; i++) {
      // stroke only
      var path = this.paths_[0];
      path.clear();
      path.moveTo(x1, y1).lineTo(x2, y2);
    // }
  };


  /** @inheritDoc */
  anychart.annotationsModule.PatternBase.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
    // for (var i = 0; i < this.paths_.length; i++) {
      // stroke only
      var path = this.paths_[0];
      path.clear();
      path.moveTo(x1, y1).lineTo(x2, y2).lineTo(x3, y3);
    // }
  };


/**
 * Draws target line with arrow from (tx1, ty1) -> (tx2, ty2)
 * @param {number} tx1
 * @param {number} ty1
 * @param {number} tx2
 * @param {number} ty2
 * @protected
 */
anychart.annotationsModule.PatternBase.prototype.drawTarget = function(tx1, ty1, tx2, ty2) {
    if (!this.shouldShowTarget) {
        return;
    }

    // arrow median point (10% of its length)
    var axm = tx2 - (tx2 - tx1) * 0.1;
    var aym = ty2 - (ty2 - ty1) * 0.1;

    // arrow corners (rotate median segment by 30° -> PI/6 in radians)
    var ax1 = Math.cos(Math.PI / 6) * (tx2 - axm) - Math.sin(Math.PI / 6) * (ty2 - aym);
    var ay1 = Math.sin(Math.PI / 6) * (tx2 - axm) + Math.cos(Math.PI / 6) * (ty2 - aym);

    var ax2 = Math.cos(Math.PI / -6) * (tx2 - axm) - Math.sin(Math.PI / -6) * (ty2 - aym);
    var ay2 = Math.sin(Math.PI / -6) * (tx2 - axm) + Math.cos(Math.PI / -6) * (ty2 - aym);

    // for (var i = 0; i < this.paths_.length; i++) {
        var path = this.paths_[0];
        // target
        path.moveTo(tx1, ty1).lineTo(tx2, ty2);

        // arrow tip
        path.moveTo(tx2, ty2)
            .lineTo(tx2 - ax1, ty2 - ay1);
        path.moveTo(tx2, ty2)
            .lineTo(tx2 - ax2, ty2 - ay2);
    // }
};


/** @inheritDoc */
anychart.annotationsModule.PatternBase.prototype.colorize = function(state) {
    anychart.annotationsModule.PatternBase.base(this, 'colorize', state);
    anychart.annotationsModule.PatternBase.base(this, 'colorize', state);
    this.paths_[0]
        .stroke(this.strokeResolver_(this, state));
    this.paths_[1]
        .stroke(null)
        .fill(this.fillResolver_(this, state));
    this.paths_[2]
        .stroke(null)
        .fill(this.hatchFillResolver_(this, state));
    this.paths_[3]
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
  };


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternBase.prototype.serialize = function() {
    var json = anychart.annotationsModule.PatternBase.base(this, 'serialize');

    anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
    anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
    anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
    anychart.core.settings.serialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');

    // for 4 points patterns
    if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.FOUR_POINTS) {
        anychart.core.settings.serialize(this, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
    }

    return json;
  };


  /** @inheritDoc */
  anychart.annotationsModule.PatternBase.prototype.setupByJSON = function(config, opt_default) {
    anychart.annotationsModule.PatternBase.base(this, 'setupByJSON', config, opt_default);

    anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, config);

    // for 4 points patterns
    if (this.SUPPORTED_ANCHORS == anychart.annotationsModule.AnchorSupport.FOUR_POINTS) {
        anychart.core.settings.deserialize(this, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS, config);
    }
  };


  /** @inheritDoc */
  anychart.annotationsModule.PatternBase.prototype.disposeInternal = function() {
    anychart.annotationsModule.PatternBase.base(this, 'disposeInternal');

    goog.disposeAll(this.paths_);
    delete this.shouldShowTarget;
    delete this.strokeResolver_;
    delete this.fillResolver_;
    delete this.hatchFillResolver_;
  };
//endregion
//export
(function() {
  var proto = anychart.annotationsModule.PatternBase.prototype;
  proto['showTarget'] = proto.showTarget;
})();
