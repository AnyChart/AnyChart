//region --- Requiring and Providing
goog.provide('anychart.core.ui.Callout');
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
anychart.core.ui.Callout = function() {
  anychart.core.ui.Callout.base(this, 'constructor');

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

  this.ALL_VISUAL_STATES = anychart.ConsistencyState.CALLOUT_TITLE |
      anychart.ConsistencyState.CALLOUT_LABELS |
      anychart.ConsistencyState.CALLOUT_BACKGROUND;
};
goog.inherits(anychart.core.ui.Callout, anychart.core.VisualBase);


//region --- Class constants
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Callout.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CALLOUT_TITLE |
    anychart.ConsistencyState.CALLOUT_LABELS |
    anychart.ConsistencyState.CALLOUT_BACKGROUND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Callout.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Title z-index.
 * @type {number}
 */
anychart.core.ui.Callout.ZINDEX_CALLOUT_TITLE = 2;


/**
 * Labels z-index.
 * @type {number}
 */
anychart.core.ui.Callout.ZINDEX_CALLOUT_LABELS = 1;


/**
 * Background z-index.
 * @type {number}
 */
anychart.core.ui.Callout.ZINDEX_CALLOUT_BACKGROUND = 0;


//endregion
//region --- Settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Callout)} Axis labels of itself for method chaining.
 */
anychart.core.ui.Callout.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.registerDisposable(this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets callout hover labels.
 * @param {(Object|boolean|null)=} opt_value Labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Callout)} Labels instance or itself for chaining call.
 */
anychart.core.ui.Callout.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.hoverLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Gets or sets callout select labels.
 * @param {(Object|boolean|null)=} opt_value Labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Callout)} Labels instance or itself for chaining call.
 */
anychart.core.ui.Callout.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
    this.selectLabels_.enabled(null);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.Callout.prototype.labelsInvalidated_ = function(event) {
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
 * Getter/setter for orientation.
 * @param {(string|anychart.enums.Orientation|null)=} opt_value Callout orientation.
 * @return {anychart.enums.Orientation|!anychart.core.ui.Callout} Callout orientation or itself for method chaining.
 */
anychart.core.ui.Callout.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var orientation = goog.isNull(opt_value) ? null : anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != orientation) {
      this.orientation_ = orientation;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.orientation_ || anychart.enums.Orientation.RIGHT;
  }
};


/**
 * Getter/setter for color range align setting.
 * @param {(anychart.enums.Align|string)=} opt_value Color range align.
 * @return {(anychart.enums.Align|anychart.core.ui.Callout)} Color range align or self for chaining.
 */
anychart.core.ui.Callout.prototype.align = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAlign(opt_value);
    if (this.align_ != opt_value) {
      this.align_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.align_;
  }
};


/**
 * Color range line length.
 * @param {string|number|null=} opt_value Color line length.
 * @return {null|number|string|anychart.core.ui.Callout} Color line length.
 */
anychart.core.ui.Callout.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.length_ != opt_value) {
      this.length_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.length_;
};


/**
 * @param {?(number|string)=} opt_value .
 * @return {anychart.core.ui.Callout|number|string|null} .
 */
anychart.core.ui.Callout.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(this.ALL_VISUAL_STATES, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Callout|anychart.core.utils.Padding)} .
 */
anychart.core.ui.Callout.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.padding_);
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
 * @return {!(anychart.core.ui.Callout|anychart.core.utils.Margin)} .
 */
anychart.core.ui.Callout.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.registerDisposable(this.margin_);
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
anychart.core.ui.Callout.prototype.boundsInvalidated_ = function(event) {
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
 * @return {Array.<string>|anychart.core.ui.Callout}
 */
anychart.core.ui.Callout.prototype.items = function(opt_value) {
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
 * @return {!(anychart.core.ui.Background|anychart.core.ui.Callout)} .
 */
anychart.core.ui.Callout.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.registerDisposable(this.background_);
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
anychart.core.ui.Callout.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CALLOUT_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.core.ui.Callout)} Axis title or itself for method chaining.
 */
anychart.core.ui.Callout.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.registerDisposable(this.title_);
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
anychart.core.ui.Callout.prototype.titleInvalidated_ = function(event) {
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
 * @return {anychart.core.ui.Callout}
 */
anychart.core.ui.Callout.prototype.updateOnZoomOrMove = function() {
  for (var i = 0, len = this.labels().labelsCount(); i < len; i++) {
    var label = this.labels().getLabel(i);
    var connector = label.getConnectorElement();

    var item = this.processedItems_[i];
    var series = item.getSeries();
    var iterator = series.getResetIterator();
    iterator.select(item.getIndex());

    var positionProvider = this.createPositionProvider(label.getIndex())['value'];
    var middlePoint = series.getMiddlePoint()['value'];

    connector
        .clear()
        .moveTo(positionProvider['x'], positionProvider['y'])
        .lineTo(middlePoint['x'], middlePoint['y']);

  }
  return this;
};


/** @inheritDoc */
anychart.core.ui.Callout.prototype.handleMouseEvent = function(event) {
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
anychart.core.ui.Callout.prototype.setProcessedItems = function(value) {
  this.processedItems_ = value;
};


/**
 * Whether an axis is horizontal.
 * @return {boolean} If the axis is horizontal.
 */
anychart.core.ui.Callout.prototype.isHorizontal = function() {
  var orientation = this.orientation();
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


//endregion//
//region --- Layering
/**
 * Returns callout root layer.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.Callout.prototype.getRootLayer = function() {
  if (!this.layer) this.layer = acgraph.layer();
  return this.layer;
};


//endregion
//region --- Bounds
/**
 * Returns remaining parent bounds to use elsewhere.
 * @example <t>simple-h100</t>
 * var axis = anychart.axes.linear();
 * axis
 *     .orientation('left')
 *     .scale(anychart.scales.ordinal().values([1,2,3]))
 *     .container(stage).draw();
 * var label = anychart.ui.label();
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
anychart.core.ui.Callout.prototype.getRemainingBounds = function() {
  var parentBounds = this.parentBounds();

  if (parentBounds) {
    var remainingBounds = parentBounds.clone();

    if (this.enabled()) {
      var calloutBounds = this.getPixelBounds();

      var heightOffset = calloutBounds.height;
      var widthOffset = calloutBounds.width;

      switch (this.orientation()) {
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
anychart.core.ui.Callout.prototype.getPixelBounds = function() {
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
      var autoLength = !goog.isDefAndNotNull(this.length_);
      var autoSize = !goog.isDefAndNotNull(this.width_);

      var length = goog.isDefAndNotNull(this.length_) ?
          anychart.utils.normalizeSize(/** @type {null|number|string} */(this.length()), parentLength) :
          maxLabelLength * itemsCount;

      var size = goog.isDefAndNotNull(this.width_) ?
          anychart.utils.normalizeSize(/** @type {null|number|string} */(this.width()), parentSize) :
          maxLabelSize;

      var titleSize = 0;
      var titleLength = 0;
      var affectSize = false;
      var affectLength = false;

      var title = this.title();
      if (title.enabled()) {
        if (!title.container()) title.container(/** @type {acgraph.vector.ILayer} */(this.container()));
        title.suspendSignalsDispatching();
        title.parentBounds(parentBounds);
        title.defaultOrientation(/** @type {anychart.enums.Orientation} */(this.orientation()));

        if (this.isHorizontal()) {
          titleSize = title.getContentBounds().height;
          titleLength = title.getContentBounds().width;
        } else {
          titleSize = title.getContentBounds().width;
          titleLength = title.getContentBounds().height;
        }

        var titleOrientation = title.getOption('orientation') || title.defaultOrientation();
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

      var align = this.align();
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
      switch (this.orientation()) {
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
        var titleOrientation = title.getOption('orientation') || title.defaultOrientation();
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
anychart.core.ui.Callout.prototype.createPositionProvider = function(index) {
  if (goog.isNull(this.internalItemLength_) || goog.isNull(this.internalItemSize_)) {
    return {'value': {'x': 0, 'y': 0}};
  } else {
    var x, y;
    var bounds = this.labelSpace;

    switch (this.orientation()) {
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
 * @param {anychart.core.map.series.Base} series Series of label.
 * @param {anychart.PointState|number} index Point index.
 * @param {number} pointState Point state.
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.Callout.prototype.configureSeriesLabel = function(label, series, index, pointState) {
  var iterator = series.getIterator();

  var selected = series.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && series.state.isStateContains(pointState, anychart.PointState.HOVER);
  var currentLabelsFactory, pointLabel, stateLabel;
  var parentLabelsFactory = series.labels();

  pointLabel = iterator.get('label');
  if (selected) {
    stateLabel = iterator.get('selectLabel');
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(series.selectLabels());
  } else if (hovered) {
    stateLabel = iterator.get('hoverLabel');
    currentLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(series.hoverLabels());
  } else {
    stateLabel = null;
    currentLabelsFactory = series.labels();
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
anychart.core.ui.Callout.prototype.configureLabel = function(item, label, opt_pointState) {
  var pointIndex = item.getIndex();

  var series = /** @type {anychart.core.map.series.Base} */(item.getSeries());
  var iterator = series.getResetIterator();
  iterator.select(pointIndex);

  var pointState = goog.isDef(opt_pointState) ? opt_pointState : series.state.getPointStateByIndex(pointIndex);
  item.state = pointState;

  this.configureSeriesLabel(label, series, pointIndex, pointState);

  var selected = series.state.isStateContains(pointState, anychart.PointState.SELECT);
  var hovered = !selected && series.state.isStateContains(pointState, anychart.PointState.HOVER);
  var calloutLabelsFactory;

  if (selected) {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());
  } else if (hovered) {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  } else {
    calloutLabelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  }

  var parentSettings = this.labels().getChangedSettings();
  parentSettings['enabled'] = this.labels().enabled();
  var currentSettings = calloutLabelsFactory.getChangedSettings();
  currentSettings['enabled'] = goog.isNull(calloutLabelsFactory.enabled()) ? parentSettings['enabled'] : calloutLabelsFactory.enabled();

  label.setSettings(parentSettings, goog.object.extend(label.superSettingsObj, currentSettings));

  var positionProvider = this.createPositionProvider(label.getIndex());
  positionProvider['connectorPoint'] = series.getMiddlePoint();
  label.positionProvider(positionProvider);

  if (this.isHorizontal()) {
    label.width(this.internalItemLength_).height(this.internalItemSize_);
  } else {
    label.width(this.internalItemSize_).height(this.internalItemLength_);
  }

  switch (this.orientation()) {
    case anychart.enums.Orientation.TOP:
      label.anchor('centerbottom');
      break;
    case anychart.enums.Orientation.RIGHT:
      label.anchor('leftcenter');
      break;
    case anychart.enums.Orientation.BOTTOM:
      label.anchor('centertop');
      break;
    case anychart.enums.Orientation.LEFT:
      label.anchor('rightcenter');
      break;
  }

  var fill = series.getFinalFill(true, pointState);
  var stroke = series.getFinalStroke(true, pointState);

  label.background()
      .enabled(true)
      .fill(fill)
      .stroke(stroke);

  return label;
};


/**
 *
 */
anychart.core.ui.Callout.prototype.calculateLabels = function() {
  var labels = this.labels();
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

    switch (this.orientation()) {
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
 * @return {anychart.core.ui.Callout}
 */
anychart.core.ui.Callout.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

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
              label = this.configureLabel(item, this.labels().getLabel(k), series.state.getPointStateByIndex(index));
              label.draw();
              label.parentLabelsFactory().dropCallsCache();
              found = true;
              break;
            }
          }

          if (!found && item.state == anychart.PointState.HOVER) {
            label = this.configureLabel(item, this.labels().getLabel(k), anychart.PointState.NORMAL);
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
              label = this.configureLabel(item, this.labels().getLabel(k), series.state.getPointStateByIndex(index));
              label.draw();
              label.parentLabelsFactory().dropCallsCache();
              found = true;
              break;
            }
          }

          if (!found && series.state.isStateContains(item.state, anychart.PointState.SELECT)) {
            label = this.configureLabel(item, this.labels().getLabel(k), series.state.getPointStateByIndex(index));
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
  this.labels().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.layer.zIndex(zIndex);
    this.title().zIndex(anychart.core.ui.Callout.ZINDEX_CALLOUT_TITLE);
    this.labels().zIndex(anychart.core.ui.Callout.ZINDEX_CALLOUT_LABELS);
    this.background().zIndex(anychart.core.ui.Callout.ZINDEX_CALLOUT_BACKGROUND);
    this.handlerLayer.zIndex(anychart.core.ui.Callout.ZINDEX_CALLOUT_LABELS + .1);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.layer.parent(container);
    this.title().container(this.layer);
    this.labels().container(this.layer);
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
    this.labels().draw();
    for (var i = 0, len = this.labels().labelsCount(); i < len; i++) {
      var label = this.labels().getLabel(i);
      var connector = label.getConnectorElement();
      label.parentLabelsFactory().dropCallsCache();
      if (connector)
        connector.clip(this.chart.getPlotBounds());
    }
    this.markConsistent(anychart.ConsistencyState.CALLOUT_LABELS);
  }

  this.title().resumeSignalsDispatching(false);
  this.labels().resumeSignalsDispatching(false);

  return this;
};


/** @inheritDoc */
anychart.core.ui.Callout.prototype.remove = function() {
  if (this.title_) this.title_.remove();
  if (this.labels_) this.labels_.remove();
};


//endregion
//region --- Setup and dispose
/** @inheritDoc */
anychart.core.ui.Callout.prototype.serialize = function() {
  var json = anychart.core.ui.Callout.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['background'] = this.background().serialize();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['width'] = this.width();
  json['length'] = this.length();

  json['orientation'] = this.orientation();
  json['align'] = this.align();

  json['items'] = this.items();

  json['padding'] = this.padding().serialize();
  json['margin'] = this.margin().serialize();

  return json;
};


/** @inheritDoc */
anychart.core.ui.Callout.prototype.setupByJSON = function(config, opt_default) {
  this.suspendSignalsDispatching();
  anychart.core.ui.Callout.base(this, 'setupByJSON', config, opt_default);


  if ('title' in config)
    this.title(config['title']);

  if ('background' in config)
    this.background(config['background']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);

  this.labels().setup(config['labels']);
  this.hoverLabels().setup(config['hoverLabels']);
  this.selectLabels().setup(config['selectLabels']);

  this.width(config['width']);
  this.length(config['length']);

  this.orientation(config['orientation']);
  this.align(config['align']);

  this.items(config['items']);

  this.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.core.ui.Callout.prototype.disposeInternal = function() {
  anychart.core.ui.Callout.base(this, 'disposeInternal');

  this.title_ = null;
  this.padding_ = null;
  this.margin_ = null;
  this.background_ = null;

  this.paddingBounds = null;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.Callout.prototype;
  proto['title'] = proto.title;
  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['margin'] = proto.margin;
  proto['length'] = proto.length;
  proto['width'] = proto.width;
  proto['align'] = proto.align;
  proto['items'] = proto.items;
  proto['orientation'] = proto.orientation;
})();
//endregion
