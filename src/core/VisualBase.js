goog.provide('anychart.core.MouseEvent');
goog.provide('anychart.core.VisualBase');
goog.require('acgraph');
goog.require('anychart.core.Base');
goog.require('anychart.core.reporting');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');


/**
 * @typedef {{
 *   type: acgraph.events.EventType,
 *   target: (anychart.core.VisualBase|acgraph.vector.Element|acgraph.vector.Stage|Node|undefined),
 *   currentTarget: (anychart.core.VisualBase|acgraph.vector.Element|acgraph.vector.Stage|Node|undefined),
 *   relatedTarget: (anychart.core.VisualBase|acgraph.vector.Element|acgraph.vector.Stage|Node|undefined),
 *   domTarget: (acgraph.vector.Element|acgraph.vector.Stage|Node|undefined),
 *   relatedDomTarget: (acgraph.vector.Element|acgraph.vector.Stage|Node|undefined),
 *   offsetX: number,
 *   offsetY: number,
 *   clientX: number,
 *   clientY: number,
 *   screenX: number,
 *   screenY: number,
 *   button: number,
 *   keyCode: number,
 *   charCode: number,
 *   ctrlKey: boolean,
 *   altKey: boolean,
 *   shiftKey: boolean,
 *   metaKey: boolean,
 *   platformModifierKey: boolean,
 *   originalEvent: acgraph.events.BrowserEvent
 * }}
 */
anychart.core.MouseEvent;



/**
 * Base class for all elements.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.VisualBase = function() {
  anychart.core.VisualBase.base(this, 'constructor');

  /**
   * Handler to manage browser event listeners.
   * @type {goog.events.EventHandler}
   */
  this.eventsHandler = new goog.events.EventHandler(this);

  this.themeSettings['enabled'] = true;

  /**
   * If the instance should follow enabled double-suspension schema.
   * @type {boolean}
   */
  this.supportsEnabledSuspension = true;

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.VisualBase, anychart.core.Base);


/**
 * Container to which the root element should be added to.
 * @type {acgraph.vector.ILayer}
 * @private
 */
anychart.core.VisualBase.prototype.container_ = null;


/**
 * Original container. Used to allow containers comparison on container change.
 * If it is an ILayer, an Element or boolean true, the container considered valid.
 * If it is false - the container was not set yet, or invalid.
 * @type {!(acgraph.vector.ILayer|Element|boolean)}
 * @private
 */
anychart.core.VisualBase.prototype.originalContainer_ = false;


/**
 * Parent bounds storage.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.core.VisualBase.prototype.parentBounds_ = null;


/**
 * Double suspension flag.
 * @type {boolean}
 * @protected
 */
anychart.core.VisualBase.prototype.doubleSuspension;


/**
 * Auto z index of the element.
 * @type {number|undefined}
 * @protected
 */
anychart.core.VisualBase.prototype.autoZIndex;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.Z_INDEX_STATE_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.ENABLED |
    anychart.ConsistencyState.CONTAINER |
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.Z_INDEX;


/**
 * Applies all handlers to passed element. By default this.handleBrowserEvent handler is applied. But you can override
 * handlers by corresponding parameters.
 * @param {acgraph.vector.Element|acgraph.vector.Stage} element
 * @param {?function(acgraph.events.BrowserEvent)=} opt_overHandler
 * @param {?function(acgraph.events.BrowserEvent)=} opt_outHandler
 * @param {?function(acgraph.events.BrowserEvent)=} opt_clickHandler
 * @param {?function(acgraph.events.BrowserEvent)=} opt_moveHandler
 * @param {?function(acgraph.events.BrowserEvent)=} opt_downHandler
 * @param {?function(acgraph.events.BrowserEvent)=} opt_upHandler
 * @protected
 */
anychart.core.VisualBase.prototype.bindHandlersToGraphics = function(element, opt_overHandler, opt_outHandler,
    opt_clickHandler, opt_moveHandler, opt_downHandler, opt_upHandler) {
  element.tag = this;
  this.eventsHandler.listen(element, acgraph.events.EventType.CLICK, opt_clickHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.DBLCLICK, this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.MOUSEOVER, opt_overHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.MOUSEOUT, opt_outHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.MOUSEDOWN, opt_downHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.MOUSEUP, opt_upHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.MOUSEMOVE, opt_moveHandler || this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.TOUCHSTART, this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.TOUCHEND, this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.TOUCHCANCEL, this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.TOUCHMOVE, this.handleBrowserEvent);
  this.eventsHandler.listen(element, acgraph.events.EventType.CONTEXTMENU, this.handleBrowserEvent);
};


/**
 * Applies all handlers to passed element. By default this.handleMouseEvent handler is applied. But you can override
 * handlers by corresponding parameters.
 * @param {anychart.core.VisualBase} target
 * @param {?function(anychart.core.MouseEvent)=} opt_overHandler
 * @param {?function(anychart.core.MouseEvent)=} opt_outHandler
 * @param {?function(anychart.core.MouseEvent)=} opt_clickHandler
 * @param {?function(anychart.core.MouseEvent)=} opt_moveHandler
 * @param {?function(anychart.core.MouseEvent)=} opt_allHandler - if set, replaces this.handleMouseEvent default.
 * @param {?function(anychart.core.MouseEvent)=} opt_downHandler
 * @protected
 */
anychart.core.VisualBase.prototype.bindHandlersToComponent = function(target, opt_overHandler, opt_outHandler,
                                                                      opt_clickHandler, opt_moveHandler, opt_allHandler, opt_downHandler) {
  this.eventsHandler.listen(target, acgraph.events.EventType.CLICK, opt_clickHandler || opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.DBLCLICK, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.MOUSEOVER, opt_overHandler || opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.MOUSEOUT, opt_outHandler || opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.MOUSEDOWN, opt_downHandler || opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.MOUSEUP, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.MOUSEMOVE, opt_moveHandler || opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.TOUCHSTART, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.TOUCHEND, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.TOUCHCANCEL, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.TOUCHMOVE, opt_allHandler || this.handleMouseEvent);
  this.eventsHandler.listen(target, acgraph.events.EventType.CONTEXTMENU, opt_allHandler || this.handleMouseEvent);
};


/**
 * Default browser event handler. Redispatches the event over ACDVF event target hierarchy.
 * @param {acgraph.events.BrowserEvent} e
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 * @protected
 */
anychart.core.VisualBase.prototype.handleBrowserEvent = function(e) {
  // we stop wrapper propagation to prevent parent elements hearing this event from their layer.
  // we stop only wrapper propagation to continue DOM event propagation through DOM elements under the Stage.
  e.stopWrapperPropagation();
  var wrappedEvent = this.makeBrowserEvent(e);
  wrappedEvent.originalEvent = e;
  /**
   * Returns original event.
   * @this {anychart.core.MouseEvent}
   * @return {acgraph.events.BrowserEvent}
   */
  wrappedEvent['getOriginalEvent'] = function() {
    return this.originalEvent;
  };
  return this.dispatchEvent(wrappedEvent);
};


/**
 * Default event patcher. Does nothing by default.
 * @param {anychart.core.MouseEvent} e
 * @protected
 */
anychart.core.VisualBase.prototype.handleMouseEvent = function(e) {
};


/**
 * Creates anychart.core.MouseEvent from acgraph.events.BrowserEvent. Can be used to patch event before dispatching.
 * @param {acgraph.events.BrowserEvent} e
 * @return {anychart.core.MouseEvent}
 * @protected
 */
anychart.core.VisualBase.prototype.makeBrowserEvent = function(e) {
  return {
    'type': e['type'],
    'originalEvent': e,
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };
};


/**
 * Finds owner element for a graphics element. Uses tag of the element.
 * @param {*} target
 * @return {anychart.core.VisualBase}
 * @protected
 */
anychart.core.VisualBase.prototype.getOwnerElement = function(target) {
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    if (anychart.utils.instanceOf(target.tag, anychart.core.VisualBase)) {
      return /** @type {anychart.core.VisualBase} */(target.tag);
    }
    target = (/** @type {acgraph.vector.Element} */(target)).parent();
  }
  return null;
};


/**
 * Whether stage for this element owned by element.
 * @return {boolean} Whether stage is owned by element.
 */
anychart.core.VisualBase.prototype.isOwnStage = function() {
  return this.stageOwn_;
};


/**
 * Getter/setter for container.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.VisualBase)} .
 */
anychart.core.VisualBase.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /** @type {?(acgraph.vector.ILayer|Element)} */
    var value = (goog.isString(opt_value) ? anychart.document.getElementById(opt_value) : opt_value);
    // var value = (goog.isString(opt_value) ? goog.dom.getElement(opt_value || null) : opt_value);
    var validContainer = value || goog.isNull(opt_value);
    if (this.originalContainer_ != validContainer) {
      this.originalContainer_ = validContainer;
      var toDispose = this.stageOwn_ ? this.container_ : null;
      this.suspendSignalsDispatching();
      var state = anychart.ConsistencyState.CONTAINER;
      if (value) {
        var prevContainerBounds = this.container_ && this.container_.getStage() && this.container_.getStage().getBounds();
        this.stageOwn_ = false;
        if (goog.dom.isElement(value)) {
          if (this.stageOwn_) {
            this.container_.container(value);
          } else {
            this.container_ = this.createStage();
            if (acgraph.type() != acgraph.StageType.VML)
              this.container_.domElement().setAttribute('role', 'presentation');
            this.container_.container(/** @type {Element} */(value));
            this.stageOwn_ = true;
          }
        } else {
          this.container_ = /** @type {acgraph.vector.ILayer} */(value);
        }
        if (!this.parentBounds_ &&
            !goog.math.Rect.equals(prevContainerBounds, this.container_ && this.container_.getStage() && this.container_.getStage().getBounds()))
          state |= anychart.ConsistencyState.BOUNDS;
      } else {
        this.container_ = null;
      }
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
      this.resumeSignalsDispatching(true);

      // we dispose old stage here, because we want everything to be transfered from it to the new stage.
      if (toDispose)
          anychart.globalLock.onUnlock(function() {
            if (toDispose.getCharts) {
              var id = acgraph.utils.IdGenerator.getInstance().identify(this, 'chart');
              delete toDispose.getCharts()[id];
            }
            goog.dispose(toDispose);
        }, this);
    }
    return this;
  }
  return this.container_;
};


/**
 * Must create the Stage.
 * @return {!acgraph.vector.Stage}
 * @protected
 */
anychart.core.VisualBase.prototype.createStage = function() {
  var stage = acgraph.create();
  stage.allowCreditsDisabling = false;
  // forcing credits to be created to apply credits disabling policy
  stage.credits();
  return stage;
};


/**
 * Getter/setter for zIndex.
 * @param {number=} opt_value .
 * @return {(number|!anychart.core.VisualBase)} .
 */
anychart.core.VisualBase.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.ownSettings['zIndex'] != val) {
      this.ownSettings['zIndex'] = val;
      this.invalidate(anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW | anychart.Signal.Z_INDEX_STATE_CHANGED);
    }
    return this;
  }
  return /** @type {number} */(this.hasOwnOption('zIndex') ?
      this.ownSettings['zIndex'] :
      goog.isDef(this.autoZIndex) ?
          this.autoZIndex : this.themeSettings['zIndex']);
};


/**
 * Auto z-index setter.
 * @param {number} value
 */
anychart.core.VisualBase.prototype.setAutoZIndex = function(value) {
  this.autoZIndex = value;
};


/**
 * Reset auto z-index value.
 */
anychart.core.VisualBase.prototype.resetAutoZIndex = function() {
  this.autoZIndex = void 0;
};


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.VisualBase|boolean|null} .
 */
anychart.core.VisualBase.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] !== opt_value) {
      this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      if (this.supportsEnabledSuspension) {
        if (this.ownSettings['enabled']) {
          if (this.suspendedByEnable) {
            this.resumeSignalsDispatching(true);
          }
          this.suspendedByEnable = false;
        } else {
          this.suspendSignalsDispatching();
          this.suspendedByEnable = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


/**
 * Returns enabled state change signals.
 * @return {number}
 * @protected
 */
anychart.core.VisualBase.prototype.getEnableChangeSignals = function() {
  return anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.ENABLED_STATE_CHANGED;
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.resumeSignalsDispatching = function(doDispatch) {
  var doSpecial = this.suspendedByEnable && this.suspensionLevel == 2;
  var realSignals;
  if (doSpecial) {
    realSignals = this.suspendedDispatching;
    this.suspendedDispatching = this.getEnableChangeSignals();
    this.suspensionLevel--;
  }
  anychart.core.VisualBase.base(this, 'resumeSignalsDispatching', doDispatch);
  if (doSpecial) {
    this.suspendSignalsDispatching();
    if (realSignals) {
      this.dispatchSignal(realSignals);
    }
  }

  return this;
};


/**
 * Checks if drawing continuation is needed. Also resolves enabled state.
 * @return {boolean} True - if we should continue drawing, false otherwise.
 */
anychart.core.VisualBase.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent() || this.isDisposed())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.invalidate(anychart.ConsistencyState.CONTAINER);
    }
    return false;
  } else if (!this.container()) {
    this.remove(); // It should be removed if it was drawn.
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
    if (!this.originalContainer_)
      anychart.core.reporting.error(anychart.enums.ErrorCode.CONTAINER_NOT_SET);
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Remove all elements content from the container.
 * @protected
 */
anychart.core.VisualBase.prototype.remove = goog.nullFunction;


/**
 * Gets or sets bounds that would be used in case of percent size calculations. Expects pixel values only.
 * As a getter falls back to stage bounds.
 * @param {(anychart.math.Rect|{left:number,top:number,width:number,height:number}|number|null)=} opt_boundsOrLeft
 * @param {number=} opt_top
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @return {anychart.core.VisualBase|anychart.math.Rect}
 */
anychart.core.VisualBase.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
  if (goog.isDef(opt_boundsOrLeft)) {
    var left, top, width, height;
    if (goog.isNull(opt_boundsOrLeft)) {
      if (this.parentBounds_) {
        this.parentBounds_ = null;
        this.invalidateParentBounds();
      }
    } else if (anychart.utils.instanceOf(opt_boundsOrLeft, anychart.math.Rect)) {
      left = opt_boundsOrLeft.left;
      top = opt_boundsOrLeft.top;
      width = opt_boundsOrLeft.width;
      height = opt_boundsOrLeft.height;
    } else if (goog.isObject(opt_boundsOrLeft)) {
      left = opt_boundsOrLeft['left'];
      top = opt_boundsOrLeft['top'];
      width = opt_boundsOrLeft['width'];
      height = opt_boundsOrLeft['height'];
    } else {
      left = opt_boundsOrLeft;
      top = opt_top;
      width = opt_width;
      height = opt_height;
    }
    left = anychart.utils.toNumber(left);
    top = anychart.utils.toNumber(top);
    width = anychart.utils.toNumber(width);
    height = anychart.utils.toNumber(height);
    if (!isNaN(left) && !isNaN(top) && !isNaN(width) && !isNaN(height) && (
        !this.parentBounds_ ||
        this.parentBounds_.left != left ||
        this.parentBounds_.top != top ||
        this.parentBounds_.width != width ||
        this.parentBounds_.height != height)) {
      if (this.parentBounds_) {
        this.parentBounds_.left = left;
        this.parentBounds_.top = top;
        this.parentBounds_.width = width;
        this.parentBounds_.height = height;
      } else {
        this.parentBounds_ = anychart.math.rect(left, top, width, height);
      }
      this.invalidateParentBounds();
    }
    return this;
  }
  if (this.parentBounds_)
    return this.parentBounds_.clone();
  var stage;
  if (this.container_ && (stage = this.container_.getStage())) {
    return goog.global['isNodeJS'] ? anychart.math.Rect.fromJSON(goog.global['defaultBounds']) : stage.getBounds();
  }
  return null;
};


/**
 * Overridable invalidator for visual bounds.
 * @protected
 */
anychart.core.VisualBase.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
};


/**
 * Whether element depends on container size.
 * @return {boolean} Depends or not.
 */
anychart.core.VisualBase.prototype.dependsOnContainerSize = function() {
  return true;
};


//region --- Saving
/**
 * Saves the current visual state into PNG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsPng();
 *   });
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.saveAsPng = function(opt_widthOrOptions, opt_height, opt_quality, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.saveAsPng(this, this.container_, opt_widthOrOptions, opt_height, opt_quality, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves the current visual state into JPEG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsJpg();
 *   });
 * @param {(number|Object)=} opt_widthOrOptions Image width or object with options.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.saveAsJpg = function(opt_widthOrOptions, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.saveAsJpg(this, this.container_, opt_widthOrOptions, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves the current visual state into PDF file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsPdf();
 *   });
 * @param {(number|string|Object)=} opt_paperSizeOrWidthOrOptions Any paper format like 'a0', 'tabloid', 'b4', etc or width, or object with options.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape or pdf height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.saveAsPdf = function(opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.saveAsPdf(this, this.container_, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_x, opt_y, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves the current visual state into SVG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.label()
 *   .background(true)
 *   .text('Save image')
 *   .fontColor('#fff')
 *   .padding(5)
 *   .offsetX(5)
 *   .listen('click', function(){
 *      chart.saveAsSvg();
 *   });
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object with options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.saveAsSvg = function(opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.saveAsSvg(this, this.container_, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object of options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @return {string}
 */
anychart.core.VisualBase.prototype.toSvg = function(opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight) {
  var exports = anychart.module['exports'];
  if (exports) {
    return exports.toSvg(this, this.container_, opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
    return '';
  }
};


//endregion
//region --- Sharing
/**
 * Share container's stage as png and return link to shared image.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.shareAsPng = function(onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareAsPng(this, this.container_, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Share container's stage as jpg and return link to shared image.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.shareAsJpg = function(onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareAsJpg(this, this.container_, onSuccessOrOptions, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Share container's stage as svg and return link to shared image.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.shareAsSvg = function(onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareAsSvg(this, this.container_, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Share container's stage as pdf and return link to shared pdf document.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.VisualBase.prototype.shareAsPdf = function(onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareAsPdf(this, this.container_, onSuccessOrOptions, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Returns base64 string for png.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 */
anychart.core.VisualBase.prototype.getPngBase64String = function(onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.getPngBase64String(this, this.container_, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Returns base64 string for jpg.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 */
anychart.core.VisualBase.prototype.getJpgBase64String = function(onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.getJpgBase64String(this, this.container_, onSuccessOrOptions, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Returns base64 string for svg.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
anychart.core.VisualBase.prototype.getSvgBase64String = function(onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.getSvgBase64String(this, this.container_, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Returns base64 string for pdf.
 * @param {(function(string)|Object)} onSuccessOrOptions Function that will be called when sharing will complete or object with options.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Define, is landscape.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 */
anychart.core.VisualBase.prototype.getPdfBase64String = function(onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.getPdfBase64String(this, this.container_, onSuccessOrOptions, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Print all element on related stage.
 * @param {(acgraph.vector.PaperSize|Object)=} opt_paperSizeOrOptions Paper size or object with options/
 * @param {boolean=} opt_landscape
 */
anychart.core.VisualBase.prototype.print = function(opt_paperSizeOrOptions, opt_landscape) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.print(this, this.container_, opt_paperSizeOrOptions, opt_landscape);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Opens Facebook sharing dialog.
 * @param {(string|Object)=} opt_captionOrOptions Caption for main link. If not set hostname will be used. Or object with options.
 * @param {string=} opt_link Url of the link attached to publication.
 * @param {string=} opt_name Title for the attached link. If not set hostname or opt_link url will be used.
 * @param {string=} opt_description Description for the attached link.
 */
anychart.core.VisualBase.prototype.shareWithFacebook = function(opt_captionOrOptions, opt_link, opt_name, opt_description) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareWithFacebook(this, this.container_, opt_captionOrOptions, opt_link, opt_name, opt_description);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Opens Twitter sharing dialog.
 */
anychart.core.VisualBase.prototype.shareWithTwitter = function() {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareWithTwitter(this, this.container_);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Opens LinkedIn sharing dialog.
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication. If not set 'AnyChart' will be used. Or object with options.
 * @param {string=} opt_description Description. If not set opt_caption will be used.
 */
anychart.core.VisualBase.prototype.shareWithLinkedIn = function(opt_captionOrOptions, opt_description) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareWithLinkedIn(this, this.container_, opt_captionOrOptions, opt_description);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Opens Pinterest sharing dialog.
 * @param {(string|Object)=} opt_linkOrOptions Attached link. If not set, the image url will be used. Or object with options.
 * @param {string=} opt_description Description.
 */
anychart.core.VisualBase.prototype.shareWithPinterest = function(opt_linkOrOptions, opt_description) {
  var exports = anychart.module['exports'];
  if (exports) {
    exports.shareWithPinterest(this, this.container_, opt_linkOrOptions, opt_description);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


//endregion
//region --- Setup, Serialize, Dispose
/** @inheritDoc */
anychart.core.VisualBase.prototype.serialize = function() {
  var json = anychart.core.VisualBase.base(this, 'serialize');

  var zIndex = anychart.core.Base.prototype.getOption.call(this, 'zIndex');
  if (goog.isDef(zIndex))
    json['zIndex'] = zIndex;

  var enabled = anychart.core.Base.prototype.getOption.call(this, 'enabled');
  if (goog.isDef(enabled))
    json['enabled'] = enabled;

  return json;
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = anychart.core.VisualBase.prototype.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault)
      this.themeSettings['enabled'] = resolvedValue['enabled'];
    else
      this.enabled(resolvedValue['enabled']);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.VisualBase.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
    if ('zIndex' in config) this.themeSettings['zIndex'] = config['zIndex'];
  } else {
    var enabled = config['enabled'];
    this.enabled(goog.isDefAndNotNull(enabled) ? enabled : !goog.isDef(enabled) ? true : undefined);
    this.zIndex(config['zIndex']);
  }
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.disposeInternal = function() {
  goog.dispose(this.eventsHandler);
  this.eventsHandler = null;
  this.parentBounds_ = null;

  if (this.stageOwn_) {
    goog.dispose(this.container_);
  }
  this.container_ = null;
  this.originalContainer_ = false;

  anychart.core.VisualBase.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.core.VisualBase.prototype;
  proto['zIndex'] = proto.zIndex;//in docs/final
  proto['enabled'] = proto.enabled;//doc|ex
  proto['print'] = proto.print;
})();
