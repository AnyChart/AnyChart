goog.provide('anychart.ganttModule.elements.ConnectorElement');

//region -- Requirements.
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');

goog.require('goog.array');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.elements.ConnectorElement = function(timeline) {
  anychart.ganttModule.elements.ConnectorElement.base(this, 'constructor');

  /**
   * State settings state holder.
   * @type {anychart.core.settings.IObjectWithSettings}
   */
  this.stateHolder = this;

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.timeline_ = timeline;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['previewStroke', 0, anychart.Signal.NEEDS_REAPPLICATION]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
  this.normal_ = new anychart.core.StateSettings(this.stateHolder, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var selectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(selectedDescriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0]
  ]);
  this.selected_ = new anychart.core.StateSettings(this.stateHolder, selectedDescriptorsMeta, anychart.PointState.SELECT);

};
goog.inherits(anychart.ganttModule.elements.ConnectorElement, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.ganttModule.elements.ConnectorElement, ['fill', 'stroke'], 'normal');


//endregion
//region -- Consistency states and signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW_APPEARANCE | //Needs to redraw visual connector settings.
    anychart.Signal.NEEDS_REAPPLICATION; //Needs to redraw edit settings.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Descriptors.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.ConnectorElement.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'previewStroke', anychart.core.settings.strokeNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.ConnectorElement, anychart.ganttModule.elements.ConnectorElement.DESCRIPTORS);


//endregion
//region -- State settings.
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.elements.ConnectorElement}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.elements.ConnectorElement}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Sets state settings up.
 */
anychart.ganttModule.elements.ConnectorElement.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


//endregion
//region -- Color resolution.
/**
 * Gets color context.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From-item.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} toItem - To-item.
 * @param {anychart.PointState} state - State.
 * @param {string} colorName - 'fill' or 'stroke'.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connector type.
 * @param {number=} opt_fromPeriodIndex - From-period index.
 * @param {number=} opt_toPeriodIndex - To-period index.
 * @return {Object}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getColorResolutionContext = function(fromItem, toItem, state, colorName, opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex) {
  var rv = {
    'sourceColor': colorName == 'stroke' ? this.getSourceStrokeColor(state) : this.getSourceFillColor(state),
    'fromItem': fromItem,
    'fromItemIndex': fromItem.meta('index'),
    'toItem': toItem,
    'toItemIndex': toItem.meta('index'),
    'connType': opt_connType || anychart.enums.ConnectorType.FINISH_START
  };

  if (goog.isDef(opt_fromPeriodIndex)) {
    rv['fromPeriod'] = fromItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_fromPeriodIndex];
    rv['fromPeriodIndex'] = opt_fromPeriodIndex;
  }
  if (goog.isDef(opt_toPeriodIndex)) {
    rv['toPeriod'] = toItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_toPeriodIndex];
    rv['toPeriodIndex'] = opt_toPeriodIndex;
  }
  return rv;
};


/**
 * Gets color.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From-item.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} toItem - To-item.
 * @param {anychart.PointState} state - State.
 * @param {string} colorName - 'fill' or 'stroke'.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connector type.
 * @param {number=} opt_fromPeriodIndex - From-period index.
 * @param {number=} opt_toPeriodIndex - To-period index.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getColor = function(fromItem, toItem, state, colorName, opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex) {
  //TODO (A.Kudryavtsev): In current implementation (6 Mar 2018) only 'normal' and 'selected' are supported.
  var isNormal = (state === anychart.PointState.NORMAL);
  var colorSource = isNormal ? this.normal() : this.selected();
  var stateColor = colorSource.getOption(colorName);

  var color;
  var normalizer = (colorName == 'stroke') ?
      anychart.core.settings.strokeOrFunctionSimpleNormalizer :
      anychart.core.settings.fillOrFunctionSimpleNormalizer;
  if (goog.isFunction(stateColor)) {
    var context = this.getColorResolutionContext(fromItem, toItem, state, colorName, opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(normalizer(stateColor.call(context, context)));
  } else {
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(normalizer(stateColor));
  }
  return color;
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getPaletteNormalFill = function() {
  return '#545f69';
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getPaletteNormalStroke = function() {
  return '#545f69';
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getPaletteSelectedFill = function() {
  return '#545f69';
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getPaletteSelectedStroke = function() {
  return anychart.color.setThickness(/** @type {acgraph.vector.Stroke} */(anychart.color.lighten(this.getPalette().itemAt(2))), 2);
};


/**
 * Gets source fill color.
 * @param {anychart.PointState} state - State.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getSourceFillColor = function(state) {
  return state == anychart.PointState.NORMAL ?
      this.getPaletteNormalFill() :
      this.getPaletteSelectedFill();
};


/**
 * Gets source fill color.
 * @param {anychart.PointState} state - State.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getSourceStrokeColor = function(state) {
  return state == anychart.PointState.NORMAL ?
      this.getPaletteNormalStroke() :
      this.getPaletteSelectedStroke();
};


/**
 * Gets palette.
 * @return {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getPalette = function() {
  var paletteSource = /** @type {anychart.ganttModule.IInteractiveGrid} */(this.getTimeline().interactivityHandler);
  return /** @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} */ (paletteSource.palette());
};


//endregion
//region -- Internal API.
/**
 * Gets type.
 * @return {anychart.enums.TLElementTypes}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.CONNECTORS;
};


/**
 * Gets current related timeline.
 * @return {anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getTimeline = function() {
  return this.timeline_;
};


/**
 * Gets fill represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From-item.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} toItem - To-item.
 * @param {anychart.PointState} state - State.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connector type.
 * @param {number=} opt_fromPeriodIndex - From-period index.
 * @param {number=} opt_toPeriodIndex - To-period index.
 * @return {acgraph.vector.Fill}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getFill = function(fromItem, toItem, state, opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex) {
  return /** @type {acgraph.vector.Fill} */ (this.getColor(fromItem, toItem, state, 'fill', opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex));
};


/**
 * Gets stroke represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From-item.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} toItem - To-item.
 * @param {anychart.PointState} state - State.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connector type.
 * @param {number=} opt_fromPeriodIndex - From-period index.
 * @param {number=} opt_toPeriodIndex - To-period index.
 * @return {acgraph.vector.Stroke}
 */
anychart.ganttModule.elements.ConnectorElement.prototype.getStroke = function(fromItem, toItem, state, opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex) {
  return /** @type {acgraph.vector.Stroke} */ (this.getColor(fromItem, toItem, state, 'stroke', opt_connType, opt_fromPeriodIndex, opt_toPeriodIndex));
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.ConnectorElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.ConnectorElement.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.ConnectorElement.DESCRIPTORS, config, opt_default);
  this.normal().setupInternal(!!opt_default, config);
  this.normal().setupInternal(!!opt_default, config['normal']);
  this.selected().setupInternal(!!opt_default, config['selected']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.ConnectorElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.ConnectorElement.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.ConnectorElement.DESCRIPTORS, json, void 0, void 0, true);
  json['normal'] = this.normal().serialize();
  json['selected'] = this.selected().serialize();
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.elements.ConnectorElement.prototype.disposeInternal = function() {
  goog.disposeAll(this.normal_, this.selected_);
  anychart.ganttModule.elements.ConnectorElement.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.ConnectorElement.prototype;
  proto['normal'] = proto.normal;
  proto['selected'] = proto.selected;
})();


//endregion
