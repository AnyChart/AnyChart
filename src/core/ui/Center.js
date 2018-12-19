//region --- Requiring and Providing
goog.provide('anychart.core.ui.Center');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.core.ICenterContentChart} chart .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.core.ui.Center = function(chart) {
  anychart.core.ui.Center.base(this, 'constructor');

  /**
   * Owner.
   * @type {anychart.core.ICenterContentChart}
   */
  this.chart = chart;

  /**
   * Parent title.
   * @type {anychart.core.ui.Center}
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
goog.inherits(anychart.core.ui.Center, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Center.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Center.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Center.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Center.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Center.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Center.prototype.getHighPriorityResolutionChain = function() {
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
anychart.core.ui.Center.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
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
anychart.core.settings.populate(anychart.core.ui.Center, anychart.core.ui.Center.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Complex methods
/**
 * Content.
 * @param {(acgraph.vector.Element|anychart.core.VisualBase|Object)=} opt_value
 * @return {acgraph.vector.Element|anychart.core.VisualBase|anychart.core.ui.Center}
 */
anychart.core.ui.Center.prototype.content = function(opt_value) {
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
 * Getter for the chart chart center point.<br/>
 * <b>Note:</b> Works only after {@link anychart.pieModule.Chart#draw} is called.
 * @return {anychart.math.Coordinate} XY coordinate of the current chart center.
 */
anychart.core.ui.Center.prototype.getPoint = function() {
  var centerCoords = this.chart.getCenterCoords();
  return {'x': centerCoords[0], 'y': centerCoords[1]};
};


/**
 * Returns chart center content bounds.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Center.prototype.getBounds = function() {
  var centerContentBounds = this.chart.getCenterContentBounds();
  return centerContentBounds ? centerContentBounds.clone() : anychart.math.rect(0, 0, 0, 0);
};


//endregion
//region --- Utils
/**
 * Clearing center content.
 */
anychart.core.ui.Center.prototype.clearContent = function() {
  if (this.contentToClear) {
    var content = this.contentToClear;
    if (anychart.utils.instanceOf(content, acgraph.vector.Element)) {
      this.contentLayer.getStage().unlisten(acgraph.vector.Stage.EventType.RENDER_FINISH, this.chart.acgraphElementsListener, false, this.chart);
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
      this.realContent.unlisten(anychart.enums.EventType.CHART_DRAW, this.chart.chartsListener, false, this.chart);
      content.resumeSignalsDispatching(false);
    }
    this.contentToClear = null;
  }
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.core.ui.Center.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Center.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  if ('content' in config)
    this.content(config['content']);
};


/** @inheritDoc */
anychart.core.ui.Center.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axes props');

  if (this.realContent && anychart.utils.instanceOf(this.realContent, anychart.core.Chart))
    json['content'] = (/** @type {anychart.core.Chart} */(this.realContent)).toJson();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Center.prototype.disposeInternal = function() {
  this.contentToClear = this.realContent;
  this.clearContent();
  this.content_ = null;
  this.realContent = null;
  goog.disposeAll(this.contentLayer);
  this.contentLayer = null;

  anychart.core.ui.Center.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.Center.prototype;
  // proto['stroke'] = proto.stroke;
  // proto['fill'] = proto.fill;

  proto['content'] = proto.content;
  proto['getPoint'] = proto.getPoint;
  proto['getBounds'] = proto.getBounds;
})();
//endregion
