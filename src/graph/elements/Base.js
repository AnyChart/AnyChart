//region Require
goog.provide('anychart.graphModule.elements.Base');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.format.Context');


//endregion
//region Constructor
/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 */
anychart.graphModule.elements.Base = function(chart) {
  anychart.graphModule.elements.Base.base(this, 'constructor');

  this.chart_ = chart;

  /**
   * Type of element
   * @type {anychart.graphModule.Chart.Element}
   */
  this.type;

  /**
   * Pool of path elements.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathPool_ = [];

  /**
   * Pool of text elements.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.textPool_ = [];

  /**
   * @type {{
   *  normal: Object<string, anychart.core.ui.LabelsSettings>,
   *  hovered: Object<string, anychart.core.ui.LabelsSettings>,
   *  selected: Object<string, anychart.core.ui.LabelsSettings>
   *    }}
   */
  this.settingsForLabels = {
    'normal': {},
    'hovered': {},
    'selected': {}
  };

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['shape', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, anychart.Signal.NEEDS_REDRAW_LABELS],
    ['width', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['height', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);

  /**
   * Object with settings for normal state.
   * @private
   */
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['shape', 0, 0],
    ['labels', 0, 0],
    ['width', 0, 0],
    ['height', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);

  function labelsCallback (labels) {
    labels.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
  }

  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, labelsCallback);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, labelsCallback);
};
goog.inherits(anychart.graphModule.elements.Base, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Base, ['fill', 'stroke', 'labels', 'shape', 'height', 'width'], 'normal');


//endregion
//region Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS =
  anychart.Signal.NEEDS_REDRAW_APPEARANCE |
  anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
  anychart.Signal.MEASURE_BOUNDS | //Signal for Measuriator to measure the bounds of collected labels.
  anychart.Signal.NEEDS_REDRAW_LABELS |
  anychart.Signal.NEEDS_REDRAW |
  anychart.Signal.BOUNDS_CHANGED |
  anychart.Signal.NEEDS_REAPPLICATION |
  anychart.Signal.ENABLED_STATE_CHANGED;


//endregion
//region StateSettings
/**
 * Setup elements.
 */
anychart.graphModule.elements.Base.prototype.setupElements = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);

  this.normal_.labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.chart_.labels()));
  this.hovered_.labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.normal_.labels()));
  this.selected_.labels().parent(/** @type {anychart.core.ui.LabelsSettings} */(this.normal_.labels()));
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region Settings resolve
/**
 * Return stroke for element
 * @param {Object} context
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)=} opt_element
 * @return {acgraph.vector.Stroke}
 */
anychart.graphModule.elements.Base.prototype.getStroke = function(context, opt_element) {
  /** @type {acgraph.vector.Stroke|Function} */
  var stroke;

  if (goog.isDef(opt_element)) {
    stroke = /** @type {acgraph.vector.Stroke|Function} */(this.resolveSettings(opt_element, 'stroke'));
  } else {
    stroke = /** @type {acgraph.vector.Stroke|Function} */(this.normal_.getOption('stroke'));
  }

  if (goog.isFunction(stroke)) {
    stroke = stroke.call(context, context);
  }
  return /** @type {acgraph.vector.Stroke} */(stroke);
};


/**
 * Return fill for element
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @param {Object} context
 * @return {acgraph.vector.Fill}
 */
anychart.graphModule.elements.Base.prototype.getFill = function(element, context) {
  var fill = /** @type {acgraph.vector.Fill} */(this.resolveSettings(element, 'fill'));

  if (goog.isFunction(fill)) {
    fill = fill.call(context, context);
  }
  return fill;
};


/**
 * Return type of element.
 * @return {anychart.graphModule.Chart.Element}
 */
anychart.graphModule.elements.Base.prototype.getType = function() {
  return this.type;
};


/**
 * Resolve labels settings for passed element.
 * @param {(anychart.graphModule.Chart.Node|anychart.graphModule.Chart.Edge)} element
 * @return {anychart.core.ui.LabelsSettings} instance of LabelSettings.
 */
anychart.graphModule.elements.Base.prototype.resolveLabelSettings = function(element) {
  var state = /** @type {anychart.SettingsState} */(this.state(element));
  var stringState = anychart.utils.pointStateToName(state);
  var id = this.getElementId(element);
  var dataRow = element.dataRow;

  var groupSettings = this.chart_.group(/** @type {string} */(element.groupId));
  if (!this.settingsForLabels[stringState][id]) {
    var specificLblSettings;

    var iterator = this.getIterator();
    iterator.select(dataRow);

    var labelSettingFromData = iterator.get('labels');
    var labelSettingForState = iterator.get(stringState);
    labelSettingForState = labelSettingForState ? labelSettingForState['labels'] ? labelSettingForState['labels'] : {} : {};
    var setting = /** @type {Object} */(labelSettingFromData || {});
    goog.mixin(setting, labelSettingForState);
    if (!goog.object.isEmpty(setting)) {
      specificLblSettings = new anychart.core.ui.LabelsSettings(true);
      specificLblSettings.setup(setting);
    }

    var finalLblSetting = this[stringState]()['labels']();
    if (!finalLblSetting.parent()) {
      if (state == anychart.SettingsState.NORMAL) {
        finalLblSetting.parent(this.chart_.labels());
      } else {
        finalLblSetting.parent(this.normal_.labels());
      }
    }

    //settings for nodes from groups.
    var groupLabelSettings = groupSettings ? groupSettings[stringState]()['labels']() : void 0;
    if (groupLabelSettings) {
      if (!groupLabelSettings.parent()) {
        if (state == anychart.SettingsState.NORMAL) {
          groupLabelSettings.parent(this.chart_.nodes().labels());
        } else {
          groupLabelSettings.parent(groupSettings.normal().labels());
        }
      }
      finalLblSetting = groupLabelSettings;
    }
    if (specificLblSettings) {
      finalLblSetting = specificLblSettings.parent(finalLblSetting);
    }
    finalLblSetting.resolutionChainCache(null);//reset resolution chain.
    finalLblSetting.listenSignals(this.labelsInvalidated_, this);

    this.settingsForLabels[stringState][id] = finalLblSetting;
  }
  return /** @type {anychart.core.ui.LabelsSettings} */(this.settingsForLabels[stringState][id]);
};


/**
 * Setup or return state for element.
 * @param {anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge} element
 * @param {anychart.SettingsState=} opt_state
 * @return {anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge |anychart.SettingsState}
 */
anychart.graphModule.elements.Base.prototype.state = function(element, opt_state) {
  if (goog.isDefAndNotNull(opt_state)) {
    element.currentState = opt_state;
    return element;
  }
  return element.currentState || anychart.SettingsState.NORMAL;
};


/**
 * Labels signal listener.
 * Proxy signal to chart.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.graphModule.elements.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    this.dispatchSignal(anychart.Signal.MEASURE_COLLECT);
  }
  this.chart_.labelsSettingsInvalidated(event, this.getType());
};


//endregion
//region Utils
/**
 * Create new path or get it from pool and return it.
 * @return {acgraph.vector.Path}
 */
anychart.graphModule.elements.Base.prototype.getPath = function() {
  var path = this.pathPool_.pop();
  if (!path) {
    path = acgraph.path();
  }
  path.clear();
  return path;
};


/**
 * Create path for every element.
 */
anychart.graphModule.elements.Base.prototype.createPathes = function() {
  /**
   * @type {Array.<(anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge)>}
   */
  var elements;
  if (this.getType() == anychart.graphModule.Chart.Element.NODE) {
    elements = this.chart_.getNodesArray();
  } else {
    elements = this.chart_.getEdgesArray();
  }
  for (var i = 0, length = elements.length; i < length; i++) {
    var element = elements[i];
    this.createPath(element);
  }
};


/**
 * Create new text or get it from pool and return it.
 * @return {anychart.core.ui.OptimizedText}
 */
anychart.graphModule.elements.Base.prototype.getText = function() {
  var text = this.textPool_.pop();
  if (!text) {
    text = new anychart.core.ui.OptimizedText();
  }
  return text;
};


/**
 * Return text of element if exist or create new and return it.
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {anychart.core.ui.OptimizedText}
 */
anychart.graphModule.elements.Base.prototype.getTextOptimizedText = function(element) {
  if (!element.optimizedText) {
    element.optimizedText = this.getText();
  }
  return element.optimizedText;
};


/**
 * Returns iterator.
 * @return {!anychart.data.Iterator} iterator
 */
anychart.graphModule.elements.Base.prototype.getIterator = goog.abstractMethod;


/**
 * Dispatch signal we need measure labels.
 */
anychart.graphModule.elements.Base.prototype.needsMeasureLabels = function() {
  this.dispatchSignal(anychart.Signal.MEASURE_BOUNDS);
};


/**
 * Return format provider for element.
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {anychart.format.Context}
 */
anychart.graphModule.elements.Base.prototype.createFormatProvider = function(element) {
  if (!this.formatProvider_) {
    this.formatProvider_ = new anychart.format.Context();
  }
  var values = {};

  var iterator = this.getIterator();
  iterator.select(element.dataRow);
  this.formatProvider_.dataSource(iterator);
  values['type'] = {value: this.getType(), type: anychart.enums.TokenType.STRING};
  values['id'] = {value: element.id, type: anychart.enums.TokenType.STRING};

  if (this.getType() == anychart.graphModule.Chart.Element.NODE) {
    var edges = element.connectedEdges;
    var siblings = /**Array.<string>*/([]);
    for (var i = 0; i < edges.length; i++) {
      var edge = this.chart_.getEdgeById(edges[i]);
      var from = edge.from;
      var to = edge.to;
      var siblingId;
      if(from != element.id) {
        siblingId = from;
      } else {
        siblingId = to;
      }
      siblings.push(siblingId);
    }

    values['siblings'] = {value: siblings, type: anychart.enums.TokenType.UNKNOWN};
  }

  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};


/**
 * Fills text with style and text value.
 * @param {!(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @protected
 */
anychart.graphModule.elements.Base.prototype.setupText = function(element) {
  var labels = this.resolveLabelSettings(element);
  var enabled = labels.enabled();

  if (enabled) {
    var text = this.getTextOptimizedText(element);
    var provider = this.createFormatProvider(element);
    var textVal = labels.getText(provider);
    text.text(textVal);
    var flatSettings = labels.flatten();
    if (labels.getOption('anchor') == anychart.enums.Anchor.AUTO) {
      flatSettings = goog.object.clone(flatSettings); //LabelSetting can store cached settings. Create clone for each label if anchor is auto.
      if (element.labelPosition) {
        flatSettings['position'] = element.labelPosition;
      } else {
        flatSettings['position'] = anychart.enums.Position.CENTER_BOTTOM;
      }
      if (element.labelAnchor) {
        flatSettings['anchor'] = element.labelAnchor;
      } else {
        flatSettings['anchor'] = anychart.enums.Anchor.CENTER_TOP;
      }
    }
    text.style(flatSettings);
    text.prepareComplexity();
    text.applySettings();
  }
};


/**
 * Return enabled state for element.
 * @param {!(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {boolean}
 */
anychart.graphModule.elements.Base.prototype.isLabelEnabled = function(element) {
  var labelSettings = this.resolveLabelSettings(element);
  return labelSettings.enabled();
};


/**
 * Create tag object for element and return it.
 * @param {(anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge)} element
 * @return {anychart.graphModule.Chart.Tag}
 */
anychart.graphModule.elements.Base.prototype.createTag = function(element) {
  var tag = /** @type {anychart.graphModule.Chart.Tag} */({});
  tag.type = this.getType();
  tag.id = this.getElementId(element);
  tag.currentState = /** @type {anychart.SettingsState} */(this.state(element));
  return tag;
};


/**
 * Return array of nodes.
 * @return {Array<anychart.graphModule.Chart.Edge>}
 */
anychart.graphModule.elements.Base.prototype.getElementsArray = function() {
  return this.chart_.getEdgesArray();
};


/**
 * Returns context for color resolution.
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)=} opt_element
 * @return {Object}
 */
anychart.graphModule.elements.Base.prototype.getColorResolutionContext = function(opt_element) {
  var type = this.getType();
  var paletteItem = type == anychart.graphModule.Chart.Element.NODE ? 1 : 0;
  var palette = this.chart_.palette();
  if (goog.isDef(opt_element)) {
    var id = opt_element.id;
    return {
      'index': opt_element.index,
      'type': type,
      'id': id,
      'sourceColor': palette.itemAt(paletteItem)
    };
  }
  return {'sourceColor': palette.itemAt(paletteItem)};
};


//endregion
//region Setup and dispose
/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Base.base(this, 'setupByJSON', config, opt_default);
  if ('tooltip' in config) {
    this.tooltip().setup(config['tooltip']);
  }
  this.normal_.setup(config);
  this.normal_.setup(config['normal']);
  this.hovered_.setup(config['hovered']);
  this.selected_.setup(config['selected']);
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Base.base(this, 'serialize');
  var normal, hovered, selected;

  normal = this.normal_.serialize();
  hovered = this.hovered_.serialize();
  selected = this.selected_.serialize();

  if (!goog.object.isEmpty(normal)) {
    var labels = normal.labels;
    if (labels && goog.object.isEmpty(labels)) {
      delete normal['labels'];
    }
    if (!goog.object.isEmpty(normal)) {
      json['normal'] = normal;
    }
  }
  if (!goog.object.isEmpty(hovered)) {
    labels = hovered.labels;
    if (labels && goog.object.isEmpty(labels)) {
      delete hovered['labels'];
    }
    if (!goog.object.isEmpty(hovered)) {
      json['hovered'] = hovered;
    }
  }

  if (!goog.object.isEmpty(selected)) {
    labels = selected.labels;
    if (labels && goog.object.isEmpty(labels)) {
      delete selected['labels'];
    }
    if (!goog.object.isEmpty(selected)) {
      json['selected'] = selected;
    }
  }

  return json;
};


/**
 * Reset DOM of passed element and add it in pool.
 * @param {anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node} element
 */
anychart.graphModule.elements.Base.prototype.clear = function(element) {
  var path = element.path;
  if (path) {
    path.tag = null;
    path.clear();
    path.parent(null);
    this.pathPool_.push(path);
    element.path = null;
  }

  path = element.hoverPath;
  if (path) {
    path.tag = null;
    path.clear();
    path.parent(null);
    this.pathPool_.push(path);
    element.hoverPath = null;
  }

  var optimizedText = element.optimizedText;
  if (optimizedText) {
    element.optimizedText = null;
    optimizedText.renderTo(null);
    this.textPool_.push(optimizedText);
  }
};


/**
 * Reset dom of all elements.
 */
anychart.graphModule.elements.Base.prototype.clearAll = function() {
  var elements = this.getElementsArray();
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    this.clear(element);
  }
};


/**
 * Dispose all created labels settings.
 */
anychart.graphModule.elements.Base.prototype.resetLabelSettings = function() {
  for (var labelSettings in this.settingsForLabels) {
    for (var setting in this.settingsForLabels[labelSettings]) {
      var lblSetting = this.settingsForLabels[labelSettings][setting];
      lblSetting.disposeInternal();
    }
  }
  this.settingsForLabels = {
    'normal': {},
    'hovered': {},
    'selected': {}
  };
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.disposeInternal = function() {
  var i;
  for (i = 0; i < this.textPool_.length; i++) {
    this.textPool_[i].dispose();
  }
  for (i = 0; i < this.pathPool_.length; i++) {
    this.pathPool_[i].disposeInternal();
  }

  this.textPool_.length = 0;
  this.pathPool_.length = 0;

  this.resetLabelSettings();
};


//endregion
//region Export
(function() {
  var proto = anychart.graphModule.elements.Base.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
