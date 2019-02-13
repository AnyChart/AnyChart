//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.Callout');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.math.Rect');
//endregion



/**
 * Color range.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.mapModule.elements.Callout = function() {
  anychart.mapModule.elements.Callout.base(this, 'constructor');

  this.addThemes('defaultCallout');

  /**
   * @type {?number}
   * @private
   */
  this.internalItemLength_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.internalItemSize_ = null;

  this.bindHandlersToComponent(this);

  var normalHoveredSelectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalHoveredSelectedDescriptorsMeta, [
    ['labels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalHoveredSelectedDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

  function afterInitCallback(factory) {
    factory.enabled(null);
  }
  this.hovered_ = new anychart.core.StateSettings(this, normalHoveredSelectedDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, afterInitCallback);

  this.selected_ = new anychart.core.StateSettings(this, normalHoveredSelectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR,  anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, afterInitCallback);

  this.ALL_VISUAL_STATES = anychart.ConsistencyState.CALLOUT_TITLE |
      anychart.ConsistencyState.CALLOUT_LABELS |
      anychart.ConsistencyState.CALLOUT_BACKGROUND;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['orientation', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['align', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['length', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.mapModule.elements.Callout, anychart.core.VisualBase);
anychart.core.settings.populateAliases(anychart.mapModule.elements.Callout, ['labels'], 'normal');


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.elements.Callout.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  /**
   * @param {*} value
   * @return {anychart.enums.Orientation} Normalized orientation.
   */
  var orientationNormalizer = function(value) {
    return anychart.enums.normalizeOrientation(value, anychart.enums.Orientation.RIGHT);
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'orientation', orientationNormalizer],
    anychart.core.settings.descriptors.ALIGN,
    anychart.core.settings.descriptors.LENGTH,
    anychart.core.settings.descriptors.WIDTH
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.Callout, anychart.mapModule.elements.Callout.PROPERTY_DESCRIPTORS);


//region --- Class constants
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.Callout.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CALLOUT_TITLE |
    anychart.ConsistencyState.CALLOUT_LABELS |
    anychart.ConsistencyState.CALLOUT_BACKGROUND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.Callout.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Title z-index.
 * @type {number}
 */
anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_TITLE = 2;


/**
 * Labels z-index.
 * @type {number}
 */
anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_LABELS = 1;


/**
 * Background z-index.
 * @type {number}
 */
anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_BACKGROUND = 0;


//endregion
//region --- Settings
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.elements.Callout.prototype.labelsInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.CALLOUT_LABELS;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Callout position and size.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.mapModule.elements.Callout|anychart.core.utils.Padding)} .
 */
anychart.mapModule.elements.Callout.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.setupCreated('padding', this.padding_);
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.mapModule.elements.Callout|anychart.core.utils.Margin)} .
 */
anychart.mapModule.elements.Callout.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.setupCreated('margin', this.margin_);
    this.margin_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.mapModule.elements.Callout.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Callout elements.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Callout items.
 * @param {Array.<string>=} opt_value Items.
 * @return {Array.<string>|anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.items = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.items_ != opt_value) {
      this.items_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.items_ || [];
};


/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {!(anychart.core.ui.Background|anychart.mapModule.elements.Callout)} .
 */
anychart.mapModule.elements.Callout.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.setupCreated('background', this.background_);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.elements.Callout.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CALLOUT_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.mapModule.elements.Callout)} Axis title or itself for method chaining.
 */
anychart.mapModule.elements.Callout.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.setupCreated('title', this.title_);
    this.title_.listenSignals(this.titleInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  }
  return this.title_;
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.elements.Callout.prototype.titleInvalidated_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state = this.ALL_VISUAL_STATES;
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.CALLOUT_TITLE;
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.invalidate(state, signal);
};


//endregion
//region --- Interactivity
/**
 * Update callout connector elements on zoom or move map interactivity.
 * @return {anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.updateOnZoomOrMove = function() {
  for (var i = 0, len = this.normal().labels().labelsCount(); i < len; i++) {
    var label = this.normal().labels().getLabel(i);
    var connector = label.getConnectorElement();

    var item = this.processedItems_[i];
    var series = item.getSeries();
    var iterator = series.getResetIterator();
    iterator.select(item.getIndex());

    var positionProvider = this.createPositionProvider(label.getIndex())['value'];
    var middlePoint = series.getMiddlePoint();

    connector
        .clear()
        .moveTo(positionProvider['x'], positionProvider['y'])
        .lineTo(middlePoint['x'], middlePoint['y']);

  }
  return this;
};


/** @inheritDoc */
anychart.mapModule.elements.Callout.prototype.handleMouseEvent = function(event) {
  var labelIndex = goog.isDef(event['labelIndex']) ? event['labelIndex'] : event['domTarget'].labelIndex;
  var item = this.processedItems_[labelIndex];

  event['domTarget'].tag = {
    series: item.getSeries(),
    index: item.getIndex()
  };

  event['pointIndex'] = item.getIndex();
};


//endregion
//region --- Internal settings/properties
/**
 * Sets processed items.
 * @param {Array.<Object>} value Items properties.
 */
anychart.mapModule.elements.Callout.prototype.setProcessedItems = function(value) {
  this.processedItems_ = value;
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.mapModule.elements.Callout.prototype.isHorizontal = function() {
  var orientation = this.getOption('orientation');
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


//endregion//
//region --- Layering
/**
 * Returns callout root layer.
 * @return {acgraph.vector.Layer}
 */
anychart.mapModule.elements.Callout.prototype.getRootLayer = function() {
  if (!this.layer) this.layer = acgraph.layer();
  return this.layer;
};


//endregion
//region --- Bounds
/**
 * Returns remaining parent bounds to use elsewhere.
 * @example <t>simple-h100</t>
 * var axis = anychart.standalones.axes.linear();
 * axis
 *     .orientation('left')
 *     .scale(anychart.scales.ordinal().values([1,2,3]))
 *     .container(stage).draw();
 * var label = anychart.standalones.label();
 * label
 *     .parentBounds(axis.getRemainingBounds())
 *     .width('100%')
 *     .height('100%')
 *     .padding(15)
 *     .background()
 *       .enabled(true)
 *       .fill('blue 0.2')
 * label.container(stage).draw();
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.mapModule.elements.Callout.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    var remainingBounds = parentBounds.clone();

    if (this.enabled()) {
      var calloutBounds = this.getPixelBounds();

      var heightOffset = calloutBounds.height;
      var widthOffset = calloutBounds.width;

      switch (this.getOption('orientation')) {
        case anychart.enums.Orientation.TOP:
          remainingBounds.height -= heightOffset;
          remainingBounds.top += heightOffset;
          break;
        case anychart.enums.Orientation.RIGHT:
          remainingBounds.width -= widthOffset;
          break;
        case anychart.enums.Orientation.BOTTOM:
          remainingBounds.height -= heightOffset;
          break;
        case anychart.enums.Orientation.LEFT:
          remainingBounds.width -= widthOffset;
          remainingBounds.left += widthOffset;
          break;
      }
    }

    return remainingBounds;
  } else {
    return new anychart.math.Rect(0, 0, 0, 0);
  }
};


/**
 * Gets axis pixel bounds.
 * @return {anychart.math.Rect} Pixel bounds.
 */
anychart.mapModule.elements.Callout.prototype.getPixelBounds = function() {
  if (!this.fullBounds || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());

    if (parentBounds) {
      var parentLength, parentSize;

      parentBounds.top = Math.round(parentBounds.top);
      parentBounds.left = Math.round(parentBounds.left);
      parentBounds.width = Math.round(parentBounds.width);
      parentBounds.height = Math.round(parentBounds.height);

      if (this.isHorizontal()) {
        parentLength = parentBounds.width;
        parentSize = parentBounds.height;
      } else {
        parentLength = parentBounds.height;
        parentSize = parentBounds.width;
      }

      var maxLabelLength = 0;
      var maxLabelSize = 0;

      this.internalItemLength_ = null;
      this.internalItemSize_ = null;

      for (var i = 0, len = this.processedItems_.length; i < len; i++) {
        var item = this.processedItems_[i];

        var label = new anychart.core.ui.LabelsFactory.Label();
        this.configureLabel(item, label);
        label.parentLabelsFactory().dropCallsCache();
        var labelBounds = label.getFinalSettings('enabled') ? label.parentLabelsFactory().measure(label) : anychart.math.rect(0, 0, 0, 0);
        label.parentLabelsFactory().dropCallsCache();

        if (labelBounds.height > maxLabelSize)
          maxLabelSize = labelBounds.height;

        if (labelBounds.width > maxLabelLength)
          maxLabelLength = labelBounds.width;
      }

      if (!this.isHorizontal()) {
        var temp = maxLabelLength;
        maxLabelLength = maxLabelSize;
        maxLabelSize = temp;
      }

      var itemsCount = this.processedItems_.length;
      var autoLength = !goog.isDefAndNotNull(this.getOption('length'));
      var autoSize = !goog.isDefAndNotNull(this.getOption('width'));

      var length = goog.isDefAndNotNull(this.getOption('length')) ?
          anychart.utils.normalizeSize(/** @type {null|number|string} */(this.getOption('length')), parentLength) :
          maxLabelLength * itemsCount;

      var size = goog.isDefAndNotNull(this.getOption('width')) ?
          anychart.utils.normalizeSize(/** @type {null|number|string} */(this.getOption('width')), parentSize) :
          maxLabelSize;

      var titleSize = 0;
      var titleLength = 0;
      var affectSize = false;
      var affectLength = false;

      var titleOrientation;
      var title = this.title();
      if (title.enabled()) {
        if (!title.container()) title.container(/** @type {acgraph.vector.ILayer} */(this.container()));
        title.suspendSignalsDispatching();
        title.parentBounds(parentBounds);
        title.defaultOrientation(/** @type {anychart.enums.Orientation} */(this.getOption('orientation')));

        if (this.isHorizontal()) {
          titleSize = title.getContentBounds().height;
          titleLength = title.getContentBounds().width;
        } else {
          titleSize = title.getContentBounds().width;
          titleLength = title.getContentBounds().height;
        }

        titleOrientation = title.getOption('orientation') || title.defaultOrientation();
        if (titleOrientation == anychart.enums.Orientation.TOP || titleOrientation == anychart.enums.Orientation.BOTTOM) {
          affectSize = this.isHorizontal();
          affectLength = !this.isHorizontal();
        } else {
          affectSize = !this.isHorizontal();
          affectLength = this.isHorizontal();
        }
        title.resumeSignalsDispatching(false);
      }

      var x, y;
      var padding = this.padding();
      var topPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), parentBounds.height);
      var rightPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('right')), parentBounds.width);
      var bottomPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('bottom')), parentBounds.height);
      var leftPad = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), parentBounds.width);

      var margin = this.margin();
      var topMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('top')), parentBounds.height);
      var rightMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('right')), parentBounds.width);
      var bottomMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('bottom')), parentBounds.height);
      var leftMargin = anychart.utils.normalizeSize(/** @type {number|string} */(margin.getOption('left')), parentBounds.width);

      var itemSize;
      if (autoLength && !autoSize) {
        itemSize = size - (affectSize ? titleSize : 0);
        length = Math.min(affectLength ? itemSize * itemsCount + titleLength : Math.max(itemSize * itemsCount, titleLength), parentLength);
        this.internalItemLength_ = (length - (affectLength ? titleLength : 0)) / itemsCount;
        this.internalItemSize_ = itemSize;
      } else if (!autoLength && autoSize) {
        itemSize = (length - (affectLength ? titleLength : 0)) / itemsCount;
        size = Math.min(affectSize ? itemSize + titleSize : Math.max(itemSize, titleSize), parentSize);
        this.internalItemLength_ = itemSize;
        this.internalItemSize_ = size - (affectSize ? titleSize : 0);
      } else if (autoLength && autoSize) {
        var l = Math.min(length, parentLength - (affectLength ? titleLength : 0)) / itemsCount;
        var s = Math.max(size, affectLength ? titleSize : 0);

        if (Math.max(l, s) * itemsCount + bottomPad + topPad + bottomMargin + topMargin > parentLength) {
          itemSize = (parentLength - (bottomPad + topPad + bottomMargin + topMargin) - (affectLength ? titleLength : 0)) / itemsCount;
        } else {
          itemSize = Math.max(l, s);
        }

        length = affectLength ? (itemSize * itemsCount) + titleLength : Math.max(itemSize * itemsCount, titleLength);
        size = affectSize ? (itemSize + titleSize) : Math.max(itemSize, titleSize);
        this.internalItemLength_ = itemSize;
        this.internalItemSize_ = itemSize;
      } else {
        this.internalItemLength_ = (length - (affectLength ? titleLength : 0)) / itemsCount;
        this.internalItemSize_ = size - (affectSize ? titleSize : 0);
      }

      var align = this.getOption('align');
      var offset;
      if (this.isHorizontal()) {
        if (length + rightPad + leftPad + rightMargin + leftMargin > parentLength) {
          length = parentLength - (rightPad + leftPad + rightMargin + leftMargin);
        }
        if (align == anychart.enums.Align.LEFT || align == anychart.enums.Align.TOP) {
          offset = leftPad + leftMargin;
        } else if (align == anychart.enums.Align.RIGHT || align == anychart.enums.Align.BOTTOM) {
          offset = parentLength - length - rightPad - rightMargin;
        } else if (align == anychart.enums.Align.CENTER) {
          offset = (parentLength - length) / 2;
        }
      } else {
        if (length + bottomPad + topPad + bottomMargin + topMargin > parentLength) {
          length = parentLength - (bottomPad + topPad + bottomMargin + topMargin);
        }
        if (align == anychart.enums.Align.LEFT || align == anychart.enums.Align.TOP) {
          offset = topPad + topMargin;
        } else if (align == anychart.enums.Align.RIGHT || align == anychart.enums.Align.BOTTOM) {
          offset = parentLength - length - bottomPad - bottomMargin;
        } else if (align == anychart.enums.Align.CENTER) {
          offset = (parentLength - length) / 2;
        }
      }

      var width, height;
      switch (this.getOption('orientation')) {
        case anychart.enums.Orientation.TOP:
          y = parentBounds.top + topPad + topMargin;
          x = parentBounds.left + offset;
          height = size;
          width = length;

          this.labelSpace = new anychart.math.Rect(x, y, this.internalItemLength_, this.internalItemSize_);
          break;
        case anychart.enums.Orientation.RIGHT:
          y = parentBounds.top + offset;
          x = parentBounds.left + parentBounds.width - size - rightPad - rightMargin;
          height = length;
          width = size;
          this.labelSpace = new anychart.math.Rect(x, y, this.internalItemSize_, this.internalItemLength_);
          break;
        case anychart.enums.Orientation.BOTTOM:
          y = parentBounds.top + parentBounds.height - size - bottomPad - bottomMargin;
          x = parentBounds.left + offset;
          height = size;
          width = length;
          this.labelSpace = new anychart.math.Rect(x, y, this.internalItemLength_, this.internalItemSize_);
          break;
        case anychart.enums.Orientation.LEFT:
          y = parentBounds.top + offset;
          x = parentBounds.left + leftPad + leftMargin;
          height = length;
          width = size;

          this.labelSpace = new anychart.math.Rect(x, y, this.internalItemSize_, this.internalItemLength_);
          break;
      }

      if (title.enabled()) {
        titleOrientation = title.getOption('orientation') || title.defaultOrientation();
        switch (titleOrientation) {
          case anychart.enums.Orientation.TOP:
            this.labelSpace.left = x;
            this.labelSpace.top = y + (this.isHorizontal() ? titleSize : titleLength);
            break;
          case anychart.enums.Orientation.LEFT:
            this.labelSpace.left = x + (this.isHorizontal() ? titleLength : titleSize);
            this.labelSpace.top = y;
            break;
        }
      }

      this.contentBounds = new anychart.math.Rect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
      this.paddingBounds = new anychart.math.Rect(
          this.contentBounds.left - leftPad,
          this.contentBounds.top - topPad,
          this.contentBounds.width + leftPad + rightPad,
          this.contentBounds.height + topPad + bottomPad);
      this.fullBounds = new anychart.math.Rect(
          this.paddingBounds.left - leftMargin,
          this.paddingBounds.top - topMargin,
          this.paddingBounds.width + leftMargin + rightMargin,
          this.paddingBounds.height + topMargin + bottomMargin);

    } else {
      this.fullBounds = new anychart.math.Rect(0, 0, 0, 0);
    }

    // if (!this.contentBounds_) this.contentBounds_ = this.container().rect().zIndex(1000);
    // this.contentBounds_.setBounds(this.contentBounds);
    //
    // if (!this.paddingBounds__) this.paddingBounds__ = this.container().rect().zIndex(1000);
    // this.paddingBounds__.setBounds(this.paddingBounds);
    //
    // if (!this.fullBounds__) this.fullBounds__ = this.container().rect().zIndex(1000);
    // this.fullBounds__.setBounds(this.fullBounds);
    //
    // if (!this.parentBounds__) this.parentBounds__ = this.container().rect().zIndex(1000);
    // this.parentBounds__.setBounds(this.parentBounds());

    this.invalidate(this.ALL_VISUAL_STATES);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  return this.fullBounds;
};


/**
 * Creates position provider for callout label.
 * @param {number} index
 * @return {Object}
 */
anychart.mapModule.elements.Callout.prototype.createPositionProvider = function(index) {
  if (goog.isNull(this.internalItemLength_) || goog.isNull(this.internalItemSize_)) {
    return {'value': {'x': 0, 'y': 0}};
  } else {
    var x, y;
    var bounds = this.labelSpace;

    switch (this.getOption('orientation')) {
      case anychart.enums.Orientation.TOP:
        x = bounds.left + this.internalItemLength_ * index + this.internalItemLength_ / 2;
        y = bounds.top + this.internalItemSize_;
        break;
      case anychart.enums.Orientation.RIGHT:
        x = bounds.left;
        y = bounds.top + this.internalItemLength_ * index + this.internalItemLength_ / 2;
        break;
      case anychart.enums.Orientation.BOTTOM:
        x = bounds.left + this.internalItemLength_ * index + this.internalItemLength_ / 2;
        y = bounds.top;
        break;
      case anychart.enums.Orientation.LEFT:
        x = bounds.left + this.internalItemSize_;
        y = bounds.top + this.internalItemLength_ * index + this.internalItemLength_ / 2;
        break;
    }

    return {'value': {'x': x, 'y': y}};
  }
};


//endregion
//region --- Drawing
/**
 * Configure label with series labels settings.
 * @param {anychart.core.ui.LabelsFactory.Label} label Label for settings applying.
 * @param {anychart.mapModule.Series} series Series of label.
 * @param {anychart.PointState|number} index Point index.
 * @param {number} pointState Point state.
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.mapModule.elements.Callout.prototype.configureSeriesLabel = function(label, series, index, pointState) {
  var iterator = series.getIterator();

  var selected = series.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && series.state.isStateContains(pointState, anychart.PointState.HOVER);
  var currentLabelsFactory, pointLabel, stateLabel;
  var parentLabelsFactory = series.normal().labels();

  pointLabel = iterator.get('normal');
  pointLabel = pointLabel ? pointLabel['label'] : void 0;
  pointLabel = anychart.utils.getFirstDefinedValue(pointLabel, iterator.get('label'));
  if (selected) {
    stateLabel = iterator.get('selected');
    stateLabel = stateLabel ? stateLabel['label'] : void 0;
    stateLabel = anychart.utils.getFirstDefinedValue(stateLabel, iterator.get('selectLabel'));
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(series.selected().labels());
  } else if (hovered) {
    stateLabel = iterator.get('hovered');
    stateLabel = stateLabel ? stateLabel['label'] : void 0;
    stateLabel = anychart.utils.getFirstDefinedValue(stateLabel, iterator.get('hoverLabel'));
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(series.hovered().labels());
  } else {
    stateLabel = null;
    currentLabelsFactory = null;
  }

  var formatProvider = series.createFormatProvider(true);
  formatProvider.pointInternal = series.getPoint(index);

  label.formatProvider(formatProvider);
  label.parentLabelsFactory(/** @type {!anychart.core.ui.LabelsFactory} */(parentLabelsFactory));
  label.currentLabelsFactory(/** @type {!anychart.core.ui.LabelsFactory} */(currentLabelsFactory));
  label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(stateLabel));

  parentLabelsFactory.dropCallsCache();

  return label;
};


/**
 * Labal configuring.
 * @param {Object} item .
 * @param {anychart.core.ui.LabelsFactory.Label} label .
 * @param {anychart.PointState|number=} opt_pointState .
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.mapModule.elements.Callout.prototype.configureLabel = function(item, label, opt_pointState) {
  var pointIndex = item.getIndex();

  var series = /** @type {anychart.mapModule.Series} */(item.getSeries());
  var iterator = series.getResetIterator();
  iterator.select(pointIndex);

  var pointState = goog.isDef(opt_pointState) ? opt_pointState : series.state.getPointStateByIndex(pointIndex);
  item.state = pointState;

  this.configureSeriesLabel(label, series, pointIndex, pointState);

  var selected = series.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && series.state.isStateContains(pointState, anychart.PointState.HOVER);
  var calloutLabelsFactory;

  var labels = this.normal().labels();
  if (selected) {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selected().labels());
  } else if (hovered) {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hovered().labels());
  } else {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(labels);
  }

  var parentSettings = labels.getChangedSettings();
  parentSettings['enabled'] = labels.enabled();

  var currentSettings = calloutLabelsFactory.getChangedSettings();
  currentSettings['enabled'] = goog.isNull(calloutLabelsFactory.enabled()) ? parentSettings['enabled'] : calloutLabelsFactory.enabled();

  label.setSettings(parentSettings, label.state('pointState') ? goog.object.extend(label.state('pointState'), currentSettings) : currentSettings);

  var positionProvider = this.createPositionProvider(label.getIndex());
  positionProvider['connectorPoint'] = {'value': series.getMiddlePoint()};
  label.positionProvider(positionProvider);

  if (this.isHorizontal()) {
    label['width'](this.internalItemLength_);
    label['height'](this.internalItemSize_);
  } else {
    label['width'](this.internalItemSize_);
    label['height'](this.internalItemLength_);
  }

  switch (this.getOption('orientation')) {
    case anychart.enums.Orientation.TOP:
      label['anchor'](anychart.enums.Anchor.CENTER_BOTTOM);
      break;
    case anychart.enums.Orientation.RIGHT:
      label['anchor'](anychart.enums.Anchor.LEFT_CENTER);
      break;
    case anychart.enums.Orientation.BOTTOM:
      label['anchor'](anychart.enums.Anchor.CENTER_TOP);
      break;
    case anychart.enums.Orientation.LEFT:
      label['anchor'](anychart.enums.Anchor.RIGHT_CENTER);
      break;
  }


  var shapes = iterator.meta('shapes');
  if (shapes) {
    var fill = iterator.meta('fill');
    var stroke = iterator.meta('stroke');

    label.background()
        .enabled(true)
        .fill(fill)
        .stroke(stroke);
  }

  return label;
};


/**
 * Calculates labels.
 */
anychart.mapModule.elements.Callout.prototype.calculateLabels = function() {
  var labels = this.normal().labels();
  if (!labels.container()) labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  labels.parentBounds(/** @type {anychart.math.Rect} */(this.parentBounds()));
  labels.clear();

  for (var i = 0, len = this.processedItems_.length; i < len; i++) {
    var item = this.processedItems_[i];
    var label = labels.add(null, null);

    this.configureLabel(item, label);

    if (!label.getFinalSettings('enabled'))
      continue;

    var positionProvider = label.positionProvider();

    var x = positionProvider['value']['x'];
    var y = positionProvider['value']['y'];
    var width, height;

    switch (this.getOption('orientation')) {
      case anychart.enums.Orientation.TOP:
        x -= this.internalItemLength_ / 2;
        y -= this.internalItemSize_;
        width = this.internalItemLength_;
        height = this.internalItemSize_;
        break;
      case anychart.enums.Orientation.RIGHT:
        y -= this.internalItemLength_ / 2;
        width = this.internalItemSize_;
        height = this.internalItemLength_;
        break;
      case anychart.enums.Orientation.BOTTOM:
        x -= this.internalItemSize_ / 2;
        width = this.internalItemLength_;
        height = this.internalItemSize_;
        break;
      case anychart.enums.Orientation.LEFT:
        x -= this.internalItemSize_;
        y -= this.internalItemLength_ / 2;
        width = this.internalItemSize_;
        height = this.internalItemLength_;
        break;
    }

    if (this.handlerLayer) {
      var handlerRect = this.handlerLayer.genNextChild();
      handlerRect
          .moveTo(x, y)
          .lineTo(x + width, y)
          .lineTo(x + width, y + height)
          .lineTo(x, y + height)
          .close();

      handlerRect.labelIndex = i;
      handlerRect.stroke(null).fill(anychart.color.TRANSPARENT_HANDLER);
    }
  }
};


/**
 * Drawing.
 * @return {anychart.mapModule.elements.Callout}
 */
anychart.mapModule.elements.Callout.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var labels = this.normal().labels();
  if (!this.chart && this.processedItems_ && this.processedItems_.length) {
    this.chart = this.processedItems_[0].getChart();

    goog.events.listen(this.chart, anychart.enums.EventType.POINTS_HOVER, function(e) {
      var label;
      var seriesStatus = e['seriesStatus'];
      for (var k = 0, len__ = this.processedItems_.length; k < len__; k++) {
        var item = this.processedItems_[k];
        var index = item.getIndex();
        for (var i = 0, len = seriesStatus.length; i < len; i++) {
          var status = seriesStatus[i];
          var series = status['series'];

          if (series != item.getSeries())
            continue;

          var found = false;
          var points = status['points'];
          for (var j = 0, len_ = points.length; j < len_; j++) {
            var point = points[j];
            if (item.getIndex() == point['index']) {
              label = this.configureLabel(item, labels.getLabel(k), series.state.getPointStateByIndex(index));
              label.draw();
              label.parentLabelsFactory().dropCallsCache();
              found = true;
              break;
            }
          }

          if (!found && item.state == anychart.PointState.HOVER) {
            label = this.configureLabel(item, labels.getLabel(k), anychart.PointState.NORMAL);
            label.draw();
            label.parentLabelsFactory().dropCallsCache();
          }
        }
      }
    }, false, this);

    goog.events.listen(this.chart, anychart.enums.EventType.POINTS_SELECT, function(e) {
      var label;
      var seriesStatus = e['seriesStatus'];
      for (var k = 0, len__ = this.processedItems_.length; k < len__; k++) {
        var item = this.processedItems_[k];
        var index = item.getIndex();
        for (var i = 0, len = seriesStatus.length; i < len; i++) {
          var status = seriesStatus[i];
          var series = status['series'];

          if (series != item.getSeries())
            continue;

          var found = false;
          var points = status['points'];
          for (var j = 0, len_ = points.length; j < len_; j++) {
            var point = points[j];
            if (item.getIndex() == point['index']) {
              label = this.configureLabel(item, labels.getLabel(k), series.state.getPointStateByIndex(index));
              label.draw();
              label.parentLabelsFactory().dropCallsCache();
              found = true;
              break;
            }
          }

          if (!found && series.state.isStateContains(item.state, anychart.PointState.SELECT)) {
            label = this.configureLabel(item, labels.getLabel(k), series.state.getPointStateByIndex(index));
            label.draw();
            label.parentLabelsFactory().dropCallsCache();
          }
        }
      }
    }, false, this);
  }

  this.getRootLayer();

  if (!this.handlerLayer) {
    this.handlerLayer = new anychart.core.utils.TypedLayer(function() {
      return acgraph.path();
    }, function(child) {
      child.clear();
    }, undefined, this);

    this.bindHandlersToGraphics(this.handlerLayer);
    this.handlerLayer.setParentEventTarget(this);
  }

  this.title().suspendSignalsDispatching();
  labels.suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.layer.zIndex(zIndex);
    this.title().zIndex(anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_TITLE);
    labels.zIndex(anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_LABELS);
    this.background().zIndex(anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_BACKGROUND);
    this.handlerLayer.zIndex(anychart.mapModule.elements.Callout.ZINDEX_CALLOUT_LABELS + .1);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.layer.parent(container);
    this.title().container(this.layer);
    labels.container(this.layer);
    this.background().container(this.layer);
    this.handlerLayer.parent(this.layer);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALLOUT_BACKGROUND)) {
    var background = this.background();
    background.suspendSignalsDispatching();
    background.parentBounds(this.paddingBounds);
    background.container(this.layer);
    background.draw();
    background.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.CALLOUT_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALLOUT_TITLE)) {
    var title = this.title();
    title.parentBounds(this.contentBounds);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.CALLOUT_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CALLOUT_LABELS)) {
    this.handlerLayer.clear();
    this.calculateLabels();
    labels.invalidate(anychart.ConsistencyState.Z_INDEX);
    labels.draw();
    for (var i = 0, len = labels.labelsCount(); i < len; i++) {
      var label = labels.getLabel(i);
      label.parentLabelsFactory().dropCallsCache();
      //todo (blackart) don't remove
      // var connector = label.getConnectorElement();
      // if (connector)
      //   connector.clip(this.chart.getPlotBounds());
    }


    this.markConsistent(anychart.ConsistencyState.CALLOUT_LABELS);
  }

  this.title().resumeSignalsDispatching(false);
  labels.resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.mapModule.elements.Callout.prototype.remove = function() {
  if (this.title_) this.title_.remove();
  if (this.labels_) this.labels_.remove();
};


//endregion
//region --- Setup and dispose
/**
 * Setup own settings of the state settings to make possible parent to child relations mechanism to work.
 */
anychart.mapModule.elements.Callout.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setup(this.normal_.themeSettings);

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setup(this.hovered_.themeSettings);

  this.setupCreated('selected', this.selected_);
  this.selected_.setup(this.selected_.themeSettings);
};


/** @inheritDoc */
anychart.mapModule.elements.Callout.prototype.serialize = function() {
  var json = anychart.mapModule.elements.Callout.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.mapModule.elements.Callout.PROPERTY_DESCRIPTORS, json);

  json['title'] = this.title().serialize();
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['margin'] = this.margin().serialize();
  json['items'] = this.items();

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.Callout.prototype.setupByJSON = function(config, opt_default) {
  this.suspendSignalsDispatching();

  anychart.mapModule.elements.Callout.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.mapModule.elements.Callout.PROPERTY_DESCRIPTORS, config);

  if ('title' in config)
    this.title(config['title']);

  if ('background' in config)
    this.background(config['background']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);

  this.items(config['items']);

  this.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.mapModule.elements.Callout.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.padding_,
      this.margin_,
      this.background_,
      this.title_);

  this.padding_ = null;
  this.margin_ = null;
  this.background_ = null;
  this.title_ = null;
  this.paddingBounds = null;

  anychart.mapModule.elements.Callout.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.mapModule.elements.Callout.prototype;
  proto['title'] = proto.title;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['margin'] = proto.margin;
  proto['items'] = proto.items;

  // auto generated
  // proto['orientation'] = proto.orientation;
  // proto['align'] = proto.align;
  // proto['length'] = proto.length;
  // proto['width'] = proto.width;
})();
//endregion
