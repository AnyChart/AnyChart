//region --- Requiring and Providing
goog.provide('anychart.pieModule.Center');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.pieModule.Chart} pie .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.pieModule.Center = function(pie) {
  anychart.pieModule.Center.base(this, 'constructor');

  /**
   * Owner.
   * @type {anychart.pieModule.Chart}
   */
  this.pie = pie;

  /**
   * Parent title.
   * @type {anychart.pieModule.Center}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.pieModule.Center, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.pieModule.Center.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.pieModule.Center.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.pieModule.Center.prototype.isResolvable = function() {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.pieModule.Center.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.pieModule.Center.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.pieModule.Center.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.pieModule.Center.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.pieModule.Center.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.pieModule.Center, anychart.pieModule.Center.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Complex methods
/**
 * Content.
 * @param {(acgraph.vector.Element|anychart.core.VisualBase|Object)=} opt_value
 * @return {acgraph.vector.Element|anychart.core.VisualBase|anychart.pieModule.Center}
 */
anychart.pieModule.Center.prototype.content = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.content_ != opt_value) {
      this.contentToClear = anychart.utils.instanceOf(opt_value, acgraph.vector.Element) ||
          anychart.utils.instanceOf(opt_value, anychart.core.VisualBase) ? this.content_ : this.realContent;
      this.content_ = /** @type {acgraph.vector.Element|anychart.core.VisualBase|string} */(opt_value);
      this.realContent = opt_value;

      if (!this.contentLayer)
        this.contentLayer = acgraph.layer();

      if (anychart.utils.instanceOf(opt_value, acgraph.vector.Element)) {
        this.contentLayer.addChild(/** @type {!acgraph.vector.Element} */(opt_value));
      } else if (anychart.utils.instanceOf(opt_value, anychart.core.VisualBase)) {
        opt_value.suspendSignalsDispatching();
        opt_value.container(this.contentLayer);
      } else {
        var inst = anychart.fromJson(/** @type {Object} */(opt_value));
        if (inst) {
          this.realContent = inst;
          inst.suspendSignalsDispatching();
          inst.container(this.contentLayer);
        } else {
          this.realContent = null;
        }
      }

      this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.content_;
};


/**
 * Getter for the pie chart center point.<br/>
 * <b>Note:</b> Works only after {@link anychart.pieModule.Chart#draw} is called.
 * @example
 *  var pieInnerRadius = 40
 *  var pie = anychart.pie([10, 14, 8, 12])
 *      .container(stage)
 *      .innerRadius(pieInnerRadius+10)
 *      .draw();
 *  var pieCenter = pie.center().getPoint();
 *  var labelBounds = anychart.math.rect(
 *      pieCenter.x - pieInnerRadius,
 *      pieCenter.y - pieInnerRadius,
 *      pieCenter.x + pieInnerRadius,
 *      pieCenter.y + pieInnerRadius
 *  );
 *  anychart.standalones.label()
 *      .text('Pie\ninner\nlabel')
 *      .parentBounds(labelBounds)
 *      .container(stage)
 *      .hAlign('center')
 *      .vAlign('center')
 *      .adjustFontSize(true)
 *      .width(2*pieInnerRadius)
 *      .height(2*pieInnerRadius)
 *      .draw();
 * @return {anychart.math.Coordinate} XY coordinate of the current pie chart center.
 */
anychart.pieModule.Center.prototype.getPoint = function() {
  return {'x': this.pie.cx, 'y': this.pie.cy};
};


/**
 * Returns pie center content bounds.
 * @return {anychart.math.Rect}
 */
anychart.pieModule.Center.prototype.getBounds = function() {
  return this.pie.centerContentBounds ? this.pie.centerContentBounds.clone() : anychart.math.rect(0, 0, 0, 0);
};


//endregion
//region --- Utils
/**
 * Clearing center content.
 */
anychart.pieModule.Center.prototype.clearContent = function() {
  if (this.contentToClear) {
    var content = this.contentToClear;
    if (anychart.utils.instanceOf(content, acgraph.vector.Element)) {
      this.contentLayer.getStage().unlisten(acgraph.vector.Stage.EventType.RENDER_FINISH, this.pie.acgraphElemetnsListener, false, this.pie);
      content.remove();
    } else {
      content.suspendSignalsDispatching();
      if (anychart.utils.instanceOf(content, anychart.core.ui.LabelsFactory.Label)) {
        var label = /** @type {anychart.core.ui.LabelsFactory.Label} */(content);
        if (label.parentLabelsFactory())
          label.parentLabelsFactory().clear(label.getIndex());
      } else if (anychart.utils.instanceOf(content, anychart.core.ui.MarkersFactory.Marker)) {
        var marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(content);
        if (marker.parentMarkersFactory())
          marker.parentMarkersFactory().clear(marker.getIndex());
      } else if (anychart.utils.instanceOf(content, anychart.core.VisualBase)) {
        content.container(null);
        content.remove();
      }
      this.realContent.unlisten(anychart.enums.EventType.CHART_DRAW, this.pie.chartsListener, false, this.pie);
      content.resumeSignalsDispatching(false);
    }
    this.contentToClear = null;
  }
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.pieModule.Center.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.pieModule.Center.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }

  this.content(config['content']);
};


/** @inheritDoc */
anychart.pieModule.Center.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axes props');

  if (this.realContent && anychart.utils.instanceOf(this.realContent, anychart.core.Chart))
    json['content'] = (/** @type {anychart.core.Chart} */(this.realContent)).toJson();

  return json;
};


/**
 * @inheritDoc
 */
anychart.pieModule.Center.prototype.disposeInternal = function() {
  this.contentToClear = this.realContent;
  this.clearContent();
  this.content_ = null;
  this.realContent = null;
  goog.disposeAll(this.contentLayer);
  this.contentLayer = null;

  anychart.pieModule.Center.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.pieModule.Center.prototype;
  // proto['stroke'] = proto.stroke;
  // proto['fill'] = proto.fill;

  proto['content'] = proto.content;
  proto['getPoint'] = proto.getPoint;
  proto['getBounds'] = proto.getBounds;
})();
//endregion
