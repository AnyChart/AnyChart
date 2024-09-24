goog.provide('anychart.circlePackingModule.Chart');

goog.require('anychart.circlePackingModule.model');
goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.format.Context');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.treeDataModule.utils');
goog.require('anychart.utils');




/**
 * AnyChart Circle Packing chart.
 * 
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.circlePackingModule.Chart = function(opt_data, opt_fillMethod) {
  anychart.circlePackingModule.Chart.base(this, 'constructor');

  this.bindHandlersToComponent(this,
    this.handleMouseOverAndMove,
    this.handleMouseOut,
    this.handleMouseClick,
    this.handleMouseOverAndMove,
    this.handleAll,
    null);

  this.addThemes('circlePacking');

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
   this.palette_ = null;
  

  /**
   * Internal math model to be drawn.
   * 
   * @type {anychart.circlePackingModule.model.Item|null}
   */
  this.model_ = null;


  /**
   * TODO Describe.
   * 
   * @type {Array.<number>}
   */
  this.currentView_ = [];

  /**
   * @type {Array.<anychart.circlePackingModule.model.Item>}
   */
  this.selections_ = [];

  this.data(opt_data, opt_fillMethod);

  // Descriptor Meta set-up for labelsMode
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['labelsMode', anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  var hoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredSelectedDescriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND],
    ['labels', anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND]
  ]);

  this.selected_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  function factoryEnabledNull(factory) {
    factory.enabled(null);
  }
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, factoryEnabledNull);

  this.hovered_ = new anychart.core.StateSettings(this, hoveredSelectedDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, factoryEnabledNull);
};
goog.inherits(anychart.circlePackingModule.Chart, anychart.core.SeparateChart);
anychart.core.settings.populateAliases(anychart.circlePackingModule.Chart, ['fill', 'stroke', 'labels'], 'normal');

/**
 * Descriptor set-up for labelsMode
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circlePackingModule.Chart.DESCRIPTORS = (function(){
  var map = {};
  anychart.core.settings.createDescriptors(map,[
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'labelsMode', anychart.enums.normalizeCirclePackingLabelsMode]
  ]);
  return map;
})();  
anychart.core.settings.populate(anychart.circlePackingModule.Chart, anychart.circlePackingModule.Chart.DESCRIPTORS);

/**
 * Supported signals.
 * @type {number}
 */
 anychart.circlePackingModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
* Supported consistency states.
* @type {number}
*/
anychart.circlePackingModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TREE_DATA |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.CHART_LABELS;


/**
 * Getter/setter for data.
 * 
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_value - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.treeDataModule.Tree|anychart.treeDataModule.View|anychart.circlePackingModule.Chart}
 */
 anychart.circlePackingModule.Chart.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if (anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree) ||
        anychart.utils.instanceOf(opt_value, anychart.treeDataModule.View)) {
      if (opt_value != this.data_) {
        if (this.data_)
          this.data_.unlistenSignals(this.dataInvalidated_, this);
        this.data_ = /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(opt_value);
        this.data_.listenSignals(this.dataInvalidated_, this);
      }
    } else {
      if (this.data_)
        this.data_.unlistenSignals(this.dataInvalidated_, this);
      this.data_ = new anychart.treeDataModule.Tree(/** @type {Array.<Object>} */(opt_value), opt_fillMethod);
      this.data_.listenSignals(this.dataInvalidated_, this);
    }

    this.deselectAll_();
    this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
 anychart.circlePackingModule.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED))
    this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Setup chart state settings after chart has been instantiated.
 */
anychart.circlePackingModule.Chart.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


/**
 * Getter/setter for palette.
 * 
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.circlePackingModule.Chart)} .
 */
 anychart.circlePackingModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
 anychart.circlePackingModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();

    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }

    this.palette_.listenSignals(this.paletteInvalidated_, this);

    if (doDispatch) {
      // TODO Think of invalidating states like anychart.ConsistencyState.SERIES_CHART_PALETTE | anychart.ConsistencyState.CHART_LEGEND
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Internal palette invalidation handler.
 * 
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
 anychart.circlePackingModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    // TODO Think of invalidating states like anychart.ConsistencyState.SERIES_CHART_PALETTE | anychart.ConsistencyState.CHART_LEGEND
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Normal state settings.
 * 
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.circlePackingModule.Chart}
 */
 anychart.circlePackingModule.Chart.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * 
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.circlePackingModule.Chart}
 */
anychart.circlePackingModule.Chart.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * 
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.circlePackingModule.Chart}
 */
anychart.circlePackingModule.Chart.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Getter/setter for labels.
 * 
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.circlePackingModule.Chart} .
 */
anychart.circlePackingModule.Chart.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.labels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.labels());
};


/**
 * Listener for labels invalidation.
 * 
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.circlePackingModule.Chart.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * @inheritDoc
 */
anychart.circlePackingModule.Chart.prototype.getAllSeries = function() {
  return [];
};


//region Interactivity
/**
 * Internal implementation of hovering.
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item.
 * @param {anychart.PointState} state - State.
 */
anychart.circlePackingModule.Chart.prototype.colorize_ = function(modelItem, state) {
  if (modelItem) {
    var fill = this.resolveColorProperty(modelItem, 'fill', state);
    var stroke = this.resolveColorProperty(modelItem, 'stroke', state);
    var circle = modelItem.domRef;
    circle.fill(fill);
    circle.stroke(stroke);

    // TODO Add labels state.
  }
};


/**
 * Puts obfuscated modelItem's fields to human readable fields of event.
 * 
 * @param {Object} event - Incoming event.
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item.
 */
anychart.circlePackingModule.Chart.prototype.mapModelItemToEvent_ = function (event, modelItem) {
  event['index'] = modelItem.index;
  event['isLeaf'] = modelItem.isLeaf;
  event['weight'] = modelItem.weight;
  event['name'] = modelItem.name;
  event['value'] = modelItem.value;
  event['point'] = modelItem.item; // Single renaming.
  event['cx'] = modelItem.cx;
  event['cy'] = modelItem.cy;
  event['radius'] = modelItem.radius;
  event['bounds'] = modelItem.bounds;
  event['depth'] = modelItem.depth;
};

/**
 * Creates new event object to be dispatched.
 * @param {anychart.core.MouseEvent} event - Incoming event.
 * @return {?Object} - New event object to be dispatched.
 */
anychart.circlePackingModule.Chart.prototype.getInteractivityEvent = function(event) {
  var domTarget = /** @type {acgraph.vector.Element} */ (event['domTarget']);
  var modelItem = /** @type {anychart.circlePackingModule.model.Item} */ (domTarget && domTarget.tag && domTarget.tag.modelItem);
  var type = event.type;

  if (modelItem) {
    switch (type) {
      case acgraph.events.EventType.MOUSEOUT:
        type = anychart.enums.EventType.POINT_MOUSE_OUT;
        break;
      case acgraph.events.EventType.MOUSEOVER:
        type = anychart.enums.EventType.POINT_MOUSE_OVER;
        break;
      case acgraph.events.EventType.MOUSEMOVE:
      case acgraph.events.EventType.TOUCHMOVE:
        type = anychart.enums.EventType.POINT_MOUSE_MOVE;
        break;
      case acgraph.events.EventType.MOUSEDOWN:
      case acgraph.events.EventType.TOUCHSTART:
        type = anychart.enums.EventType.POINT_MOUSE_DOWN;
        break;
      case acgraph.events.EventType.MOUSEUP:
      case acgraph.events.EventType.TOUCHEND:
        type = anychart.enums.EventType.POINT_MOUSE_UP;
        break;
      case acgraph.events.EventType.CLICK:
        type = anychart.enums.EventType.POINT_CLICK;
        break;
      case acgraph.events.EventType.DBLCLICK:
        type = anychart.enums.EventType.POINT_DBLCLICK;
        break;
    }

    var newEvent = {
      'type': type,
      'actualTarget': event.target,
      'target': this,
      'originalEvent': event,
    };

    this.mapModelItemToEvent_(newEvent, modelItem);

    return newEvent;
  }

  return null;
};


/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var evt = this.getInteractivityEvent(event);

  if (evt && this.dispatchEvent(evt)) {
    // Default behavior.
    var domTarget = event['domTarget'];
    var modelItem = domTarget && domTarget.tag && domTarget.tag.modelItem;
    if (modelItem) {
      if (!goog.array.contains(this.selections_, modelItem)) {
        this.colorize_(modelItem, anychart.PointState.HOVER);
      }

      var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
      var formatProvider = this.createFormatProvider(modelItem);
      tooltip.showFloat(event['originalEvent']['clientX'], event['originalEvent']['clientY'], formatProvider);
    }
  }
};


/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.handleMouseOut = function(event) {
  var evt = this.getInteractivityEvent(event);

  if (evt && this.dispatchEvent(evt)) {
    // Default behavior.
    var domTarget = event['domTarget'];
    var modelItem = domTarget && domTarget.tag && domTarget.tag.modelItem;
    if (modelItem && !goog.array.contains(this.selections_, modelItem)) {
      this.colorize_(modelItem, anychart.PointState.NORMAL);
    }
    this.tooltip().hide();
  }
};

/** 
 * All remaining events handler.
 * 
 * @param {anychart.core.MouseEvent} event - Incoming event.
 */
anychart.circlePackingModule.Chart.prototype.handleAll = function (event) {
  var evt = this.getInteractivityEvent(event);
  
  if (evt) {
    this.dispatchEvent(evt);
  }
};


/**
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item to extract view from.
 * @param {Array.<number>=} opt_view - Current view for recursion.
 * @return {Array.<number>} - Current view.
 */
anychart.circlePackingModule.Chart.prototype.extractView_ = function(modelItem, opt_view) {
  opt_view = opt_view || [];

  if (modelItem.isRoot) {
    return opt_view;
  } else if (!modelItem.isLeaf) {
    opt_view.unshift(modelItem.index);
  }

  return this.extractView_(modelItem.parent, opt_view);
};


/**
 * Removes all selections.
 */
anychart.circlePackingModule.Chart.prototype.deselectAll_ = function() {
  var stage = this.container();
  if (stage) {
    stage.suspend();
    
    for (var i = 0; i < this.selections_.length; i++){
      this.colorize_(this.selections_[i], anychart.PointState.NORMAL);
    }

    this.selections_.length = 0;

    stage.resume();
  }
};


/**
 * Click event handler.
 * Is not preventable for a while.
 * 
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.circlePackingModule.Chart.prototype.handleMouseClick = function(event) {
  var clickEvent = this.getInteractivityEvent(event);

  if (clickEvent && this.dispatchEvent(clickEvent)) {
    // Default behavior.
    var domTarget = event['domTarget'];
    var modelItem = domTarget && domTarget.tag && domTarget.tag.modelItem;

    if (modelItem) {
      if ((!goog.userAgent.MAC && event.ctrlKey) || (goog.userAgent.MAC && event.metaKey)) {
        // Adding/removing from existing selection.
        if (goog.array.contains(this.selections_, modelItem)) {
          goog.array.remove(this.selections_, modelItem);
          this.colorize_(modelItem, anychart.PointState.NORMAL);
        } else {
          this.selections_.push(modelItem);
          this.colorize_(modelItem, anychart.PointState.SELECT);
        }
      } else {
        this.deselectAll_();
        this.selections_.push(modelItem);
        this.colorize_(modelItem, anychart.PointState.SELECT);
      }
    } else {
      this.deselectAll_();
    }
  } else {
    this.deselectAll_();
  }

  this.dispatchSelectionChange_();
};


/**
 * Selection change dispatcher since it can not be prevented directly.
 */
anychart.circlePackingModule.Chart.prototype.dispatchSelectionChange_ = function() {
  var event = {
    'type': anychart.enums.EventType.POINTS_SELECT,
    'points': []
  };

  for (var i = 0; i < this.selections_.length; i++) {
    event['points'].push(this.selections_[i].item);
  }

  this.dispatchEvent(event);
};


//endregion


/**
 * Builds drawing model by data tree.
 */
anychart.circlePackingModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TREE_DATA)) {
    var data = /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data());
    this.model_ = anychart.circlePackingModule.model.create(data);
    this.invalidate(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Draws model on the screen.
 * 
 * @param {Array.<anychart.circlePackingModule.model.Item>|undefined} children - Model item to be drawn.
 */
anychart.circlePackingModule.Chart.prototype.drawModel_ = function(children) {
  // TODO Add No-Data-Label.
  if (children && children.length) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var circle = /** @type {!acgraph.vector.Circle} */(this.dataLayer_.genNextChild());
      child.domRef = circle;
      circle.centerX(child.cx);
      circle.centerY(child.cy);
      circle.radius(child.radius);
      anychart.utils.nameElement(circle, child.name + ', child of ' + (child.parent ? child.parent.name : 'null'));
      circle.zIndex(31);
      circle.tag = {
        modelItem: child
      };

      this.drawModel_(child.children);
    }
  }
};


/**
 * Draws model on the screen.
 * 
 * @param {Array.<anychart.circlePackingModule.model.Item>|undefined} children - Model item to be drawn.
 * @private
 */
 anychart.circlePackingModule.Chart.prototype.colorizeModel_ = function(children) {
  // TODO Add No-Data-Label.
  if (children && children.length) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var fill = this.resolveColorProperty(child, 'fill', anychart.PointState.NORMAL);
      var stroke = this.resolveColorProperty(child, 'stroke', anychart.PointState.NORMAL);
      var circle = child.domRef;
      circle.fill(fill);
      circle.stroke(stroke);
      this.colorizeModel_(child.children);
    }
  }
};


/**
 * Creates format provider.
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - .
 * @return {anychart.format.Context} - Context provider.
 */
anychart.circlePackingModule.Chart.prototype.createFormatProvider = function(modelItem) {
  if (!this.formatProvider_) {
    this.formatProvider_ = new anychart.format.Context();
  }

  var values = {
    'item': {value: modelItem.item, type: anychart.enums.TokenType.UNKNOWN},
    'value': {value: modelItem.value, type: anychart.enums.TokenType.NUMBER},
    'name': {value: modelItem.name, type: anychart.enums.TokenType.STRING},
    'depth': {value: modelItem.depth, type: anychart.enums.TokenType.NUMBER},
    'index': {value: modelItem.index, type: anychart.enums.TokenType.NUMBER},
    'weight': {value: modelItem.weight, type: anychart.enums.TokenType.NUMBER},
    'isLeaf': {value: modelItem.isLeaf, type: anychart.enums.TokenType.STRING}
  };

  this.formatProvider_.dataSource(modelItem.item);
  return /** @type {anychart.format.Context} */ (this.formatProvider_.propagate(values));
};


/**
 * Draws labels.
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item to be drawn.
 */
 anychart.circlePackingModule.Chart.prototype.drawLabels_ = function(modelItem) {
  var labels = this.labels();
  labels.clear();
  labels.suspendSignalsDispatching();

  if (labels.enabled()) {
    if (modelItem) {
      var labelsAdjustFontSize = labels.textSettings()['adjustFontSize'];
      var adjustByWidth = labelsAdjustFontSize['width'];
      var adjustByHeight = labelsAdjustFontSize['height'];
      var widthOption = labels.getOption('width');
      var heightOption = labels.getOption('height');
      var anchorOption = labels.getOwnAndAutoOption('anchor');
      var positionOption = labels.getOwnAndAutoOption('position');
      var isLabelsModeLeaves = this.getOption('labelsMode') === anychart.enums.CirclePackingLabelsMode.LEAVES;
      var labeledChildren = this.getLabeledChildren_();

      for (var i = 0; i < labeledChildren.length; i++) {
        var child = labeledChildren[i];
        var context = this.createFormatProvider(child);
        var label = labels.add(context, null);

        /*
          If labelsMode is 'leaves' then if the user has set up any of anchor or position options on the label or
          label factory level keep them, otherwise use 'center'.
        */
        if (isLabelsModeLeaves) {
          var labelAnchor = label.getOwnAndAutoOption('anchor') || anchorOption || 'center';
          var labelPosition = label.getOwnAndAutoOption('position') || positionOption || 'center';
          label['anchor'](labelAnchor);
          label['position'](labelPosition);
        }

        /*
          In case of enabling adjustFontSize() without any bounds set to labels
          '70%' below is not a random number: B≈A×0.7071 where A - diameter of the Circumscribing Circle and 
          B - a side of Circumscribed square.
         */
        widthOption = widthOption || (adjustByWidth ? '70%' : widthOption);
        heightOption = heightOption || (adjustByHeight ? '70%' : heightOption);

        /*
          Truncate labels behavior 
          null - default, unrestricted width/height of label
          100 - maximum label width/height equals to 100 pixels
          '100px' - maximum label width/height equals to 100 pixels
          '100%' - child.bounds.width/height
         */
        var normalizedWidth = anychart.utils.normalizeSize(/** @type {number|string}*/(widthOption), child.bounds.width);
        var normalizedHeight = anychart.utils.normalizeSize(/** @type {number|string}*/(heightOption), child.bounds.height);
        label.width(normalizedWidth);
        label.height(normalizedHeight); 

        // Position is defined 
        var position = anychart.enums.normalizeAnchor(label.getFinalSettings('position'));
        var positionProvider = {
            'value': anychart.utils.getCoordinateByAnchor(/** @type {goog.math.Rect} */(child.bounds), position)
        };

        label.positionProvider(positionProvider);
        label.draw();        
      }
    }
  }

  labels.resumeSignalsDispatching(true);
  labels.draw();
};


/**
 * Recursive method to make an array of all the leaf children of a model item provided for drawLabels_ method.
 * 
 * @param {Array.<anychart.circlePackingModule.model.Item>|undefined} children
 * @returns {Array} childrenArray
 */
anychart.circlePackingModule.Chart.prototype.concatChildren_ = function(children) {
  var childrenArray = [];
  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    if (child.isLeaf) {
      childrenArray.push(child);
    } else {
      var childDirectDescendants = child.children;
      var allChildDescendant = this.concatChildren_(childDirectDescendants);
      childrenArray = childrenArray.concat(childrenArray, allChildDescendant);
    }
  }
  return childrenArray;
};


/**
 * A method to get children of a current model to draw labels  
 * 
 * @returns {Array|null|undefined} childrenArray
 */
anychart.circlePackingModule.Chart.prototype.getLabeledChildren_ = function() {
  var model = this.getCurrentModel_();
  var modelChildren = model.children;

  // Labels behavior according to labelsMode.
  if (this.getOption('labelsMode') === anychart.enums.CirclePackingLabelsMode.LEAVES) {
    modelChildren = this.concatChildren_(modelChildren);
  }
  return modelChildren;
};


/**
 * Gets the source color for item.
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} - .
 */
anychart.circlePackingModule.Chart.prototype.getModelItemSourceColor_ = function(modelItem) {
  if (modelItem.parent.isRoot) {
    return this.palette().itemAt(modelItem.index);
  }
  return anychart.color.lighten(this.getModelItemSourceColor_(modelItem.parent));
};


/**
 * Gets color resolution context.
 * 
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item to get info from.
 * @return {Object} - Context object.
 */
anychart.circlePackingModule.Chart.prototype.getColorContext = function(modelItem) {
  return {
    'sourceColor': this.getModelItemSourceColor_(modelItem),
    'item': modelItem.item,
    'value': modelItem.value,
    'name': modelItem.name,
    'depth': modelItem.depth,
    'index': modelItem.index,
    'weight': modelItem.weight,
    'isLeaf': modelItem.isLeaf
  };
};


/**
 * Resolves color.
 *
 * @param {anychart.circlePackingModule.model.Item} modelItem - Model item to deal with.
 * @param {string} propName - 'fill' or 'stroke'.
 * @param {anychart.PointState} state - State to process.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} - .
 */
anychart.circlePackingModule.Chart.prototype.resolveColorProperty = function(modelItem, propName, state)  {
  var st = state === anychart.PointState.NORMAL ? 
    'normal' :
    (state === anychart.PointState.HOVER ? 'hovered': 'selected');

  var stateValue = this[st]().getOption(propName); // Construction is smth like this.hovered().getOption('stroke');

  if (goog.isFunction(stateValue)) {
    var ctx = this.getColorContext(modelItem);
    return stateValue.call(ctx, ctx);
  } else {
    return stateValue;
  }
};


/**
 * Initializes basic required DOM-structure.
 * 
 * @private
 */
anychart.circlePackingModule.Chart.prototype.initDom_ = function() {
  if (!this.dataLayer_) {
    this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
      return acgraph.circle();
    }, goog.nullFunction);

    this.dataLayer_.zIndex(30);
    anychart.utils.nameElement(this.dataLayer_, 'Data layer');
    this.dataLayer_.parent(this.rootElement);

    this.labelsLayer_ = this.rootElement.layer();
    anychart.utils.nameElement(this.labelsLayer_, 'Labels layer');
    this.labelsLayer_.zIndex(32);
    this.normal().labels().container(this.labelsLayer_);
  }
};


/**
 * Gets currently drilled view.
 * Not used as it's needed in current implementation.
 * Will be used on drill-down mechanism implementation.
 * 
 * @return {anychart.circlePackingModule.model.Item} - The current view.
 */
anychart.circlePackingModule.Chart.prototype.getCurrentModel_ = function() {
  var model = this.model_;

  for (var i = 0; i < this.currentView_.length; i++) {
    var curr = this.currentView_[i];
    model = model.children[curr];
  }
  
  return model;
};


/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent()) {
    return;
  }

  this.initDom_();

  anychart.utils.nameElement(this.rootElement, 'Root element');

  this.calculate();

  // In current implementation, model is always this.model_. It will be fixed on drilling down in future.
  var model = /** @type {anychart.circlePackingModule.model.Item} */ (this.getCurrentModel_());

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    anychart.circlePackingModule.model.applyBounds(model, bounds);
    this.dataLayer_.clear();
    this.drawModel_(this.model_.children); // This also will define dom-references for each model item.
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.colorizeModel_(this.model_.children);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LABELS)) {
    this.drawLabels_(model);
    this.markConsistent(anychart.ConsistencyState.CHART_LABELS);
  }
};


/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.serialize = function() {
  var json = anychart.circlePackingModule.Chart.base(this, 'serialize');

  json['data'] = this.data().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['palette'] = this.palette().serialize();

  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();
  json['selected'] = this.selected().serialize();

  return json;
};


/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.circlePackingModule.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('data' in config)
    this.data(config['data']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  if ('normal' in config)
    this.normal().setupInternal(!!opt_default, config['normal']);

  if ('hovered' in config)
    this.hovered().setupInternal(!!opt_default, config['hovered']);

  if ('selected' in config)
    this.selected().setupInternal(!!opt_default, config['selected']);

  if ('palette' in config)
    this.palette(config['palette']);
};

/** @inheritDoc */
anychart.circlePackingModule.Chart.prototype.toCsv = function (opt_chartDataExportMode, opt_csvSettings) {
  return anychart.treeDataModule.utils.toCsv(
      /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data()), opt_csvSettings);
};


//region --- Exports
//exports
/**
 * @suppress {deprecated}
 */
 (function() {
  var proto = anychart.circlePackingModule.Chart.prototype;
  proto['data'] = proto.data;//doc|ex|
  proto['labels'] = proto.labels;//doc|ex
  proto['palette'] = proto.palette;//doc|ex
  proto['tooltip'] = proto.tooltip;
  // proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  // proto['getPoint'] = proto.getPoint;
  proto['toCsv'] = proto.toCsv;

  // proto['hover'] = proto.hover;
  // proto['unhover'] = proto.unhover;

  // proto['select'] = proto.select;
  // proto['unselect'] = proto.unselect;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion