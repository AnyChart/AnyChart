goog.provide('anychart.core.MouseEvent');
goog.provide('anychart.core.VisualBase');
goog.require('acgraph');
goog.require('anychart.core.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.exports');
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
 *   platformModifierKey: boolean
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
 * Z index of the element.
 * @type {number}
 * @private
 */
anychart.core.VisualBase.prototype.zIndex_;


/**
 * Double suspension flag.
 * @type {boolean}
 * @protected
 */
anychart.core.VisualBase.prototype.doubleSuspension;


/**
 * Auto z index of the element.
 * @type {number}
 * @protected
 */
anychart.core.VisualBase.prototype.autoZIndex = 0;


/**
 * Whether element is enabled or not.
 * @type {?boolean}
 * @private
 */
anychart.core.VisualBase.prototype.enabled_ = true;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED;


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
  while (target instanceof acgraph.vector.Element) {
    if (target.tag instanceof anychart.core.VisualBase) {
      return /** @type {anychart.core.VisualBase} */(target.tag);
    }
    target = (/** @type {acgraph.vector.Element} */(target)).parent();
  }
  return null;
};


/**
 * Getter/setter for container.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.VisualBase)} .
 */
anychart.core.VisualBase.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    /** @type {?(acgraph.vector.ILayer|Element)} */
    var value = (goog.isString(opt_value) ? goog.dom.getElement(opt_value || null) : opt_value);
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
        var newContainerBounds = this.container_ && this.container_.getStage() && this.container_.getStage().getBounds();
        if (!goog.math.Rect.equals(prevContainerBounds, newContainerBounds))
          state |= anychart.ConsistencyState.BOUNDS;
      } else {
        this.container_ = null;
      }
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
      this.resumeSignalsDispatching(true);

      // we dispose old stage here, because we want everything to be transfered from it to the new stage.
      if (toDispose)
        anychart.globalLock.onUnlock(function() {
          goog.dispose(toDispose);
        });
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
    if (this.zIndex_ != val) {
      this.zIndex_ = val;
      this.invalidate(anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.zIndex_) ? this.zIndex_ : this.autoZIndex;
};


/**
 * Auto z-index setter.
 * @param {number} value
 */
anychart.core.VisualBase.prototype.setAutoZIndex = function(value) {
  this.autoZIndex = value;
};


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.VisualBase|boolean|null} .
 */
anychart.core.VisualBase.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      if (this.enabled_) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return this.enabled_;
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
  var doSpecial = this.doubleSuspension && this.suspensionLevel == 1;
  var realSignals;
  if (doSpecial) {
    realSignals = this.suspendedDispatching;
    this.suspendedDispatching = this.getEnableChangeSignals();
    this.doubleSuspension = false;
  }
  anychart.core.VisualBase.base(this, 'resumeSignalsDispatching', doDispatch);
  if (doSpecial) {
    this.suspendSignalsDispatching();
    if (realSignals)
      this.dispatchSignal(realSignals);
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
    } else if (opt_boundsOrLeft instanceof anychart.math.Rect) {
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
  if (this.container_ && (stage = this.container_.getStage()))
    return stage.getBounds();
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Export.
//
//----------------------------------------------------------------------------------------------------------------------
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
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments({
      'width': opt_widthOrOptions,
      'height': opt_height,
      'quality': opt_quality,
      'filename': opt_filename
    }, opt_widthOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.saveAsPng(args['width'], args['height'], args['quality'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'width': opt_widthOrOptions,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite,
          'filename': opt_filename
        },
        opt_widthOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.saveAsJpg(args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y,
          'filename': opt_filename
        },
        opt_paperSizeOrWidthOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.saveAsPdf(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'filename': opt_filename
        },
        opt_paperSizeOrWidthOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.saveAsSvg(args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
  }
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @param {(string|number|Object)=} opt_paperSizeOrWidthOrOptions Paper Size or width or object of options.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @return {string}
 */
anychart.core.VisualBase.prototype.toSvg = function(opt_paperSizeOrWidthOrOptions, opt_landscapeOrHeight) {
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrWidthOrOptions,
          'width': opt_paperSizeOrWidthOrOptions,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight
        },
        opt_paperSizeOrWidthOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height']});

    return stage.toSvg(args['paperSize'] || args['width'], args['landscape'] || args['height']);
  }
  return '';
};


//region --- SHARING ---
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
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'filename': opt_filename
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.shareAsPng(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite,
          'filename': opt_filename
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.shareAsJpg(args['onSuccess'], args['onError'], args['asBase64'], args['width'], args['height'], args['quality'], args['forceTransparentWhite'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'filename': opt_filename
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.shareAsSvg(args['onSuccess'], args['onError'], args['asBase64'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'asBase64': opt_asBase64,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y,
          'filename': opt_filename
        }, onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height'], 'filename': anychart.exports.filename()});

    stage.shareAsPdf(
        args['onSuccess'],
        args['onError'],
        args['asBase64'],
        args['paperSize'] || args['width'],
        args['landscape'] || args['height'],
        args['x'],
        args['y'],
        args['filename']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height']});

    stage.getPngBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'width': opt_width,
          'height': opt_height,
          'quality': opt_quality,
          'forceTransparentWhite': opt_forceTransparentWhite
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height']});

    stage.getJpgBase64String(args['onSuccess'], args['onError'], args['width'], args['height'], args['quality'], args['forceTransparentWhite']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height']});

    stage.getSvgBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height']);
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
  var stage = this.container_ ? this.container_.getStage() : null;

  if (stage) {
    /**
     * @type {Object} args
     */
    var args = anychart.utils.decomposeArguments(
        {
          'onSuccess': onSuccessOrOptions,
          'onError': opt_onError,
          'paperSize': opt_paperSizeOrWidth,
          'width': opt_paperSizeOrWidth,
          'landscape': opt_landscapeOrHeight,
          'height': opt_landscapeOrHeight,
          'x': opt_x,
          'y': opt_y
        },
        onSuccessOrOptions, {'width': anychart.exports.image()['width'], 'height': anychart.exports.image()['height']});

    stage.getPdfBase64String(args['onSuccess'], args['onError'], args['paperSize'] || args['width'], args['landscape'] || args['height'], args['x'], args['y']);
  }
};
//endregion


/**
 * Print all element on related stage.
 * @param {(acgraph.vector.PaperSize|Object)=} opt_paperSizeOrOptions Paper size or object with options/
 * @param {boolean=} opt_landscape
 */
anychart.core.VisualBase.prototype.print = function(opt_paperSizeOrOptions, opt_landscape) {
  var stage = this.container_ ? this.container_.getStage() : null;
  if (stage) {
    var args = anychart.utils.decomposeArguments(
        {
          'paperSize': opt_paperSizeOrOptions,
          'landscape': opt_landscape
        },
        opt_paperSizeOrOptions);

    stage.print(args['paperSize'], args['landscape']);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Deprecated Export.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Saves the current visual state into PNG file.
 * @deprecated Since 7.6.0. Use saveAsPng() method instead.
 */
anychart.core.VisualBase.prototype.saveAsPNG = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['saveAsPNG()', 'saveAsPng()'], true);
  this.saveAsPng();
};


/**
 * Saves the current visual state into JPEG file.
 * @deprecated Since 7.6.0. Use saveAsJpg() method instead.
 */
anychart.core.VisualBase.prototype.saveAsJPG = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['saveAsJPG()', 'saveAsJpg()'], true);
  this.saveAsJpg();
};


/**
 * Saves the current visual state into PDF file.
 * @deprecated Since 7.6.0. Use saveAsPdf() method instead.
 */
anychart.core.VisualBase.prototype.saveAsPDF = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['saveAsPDF()', 'saveAsPdf()'], true);
  this.saveAsPdf();
};


/**
 * Saves the current visual state into SVG file.
 * @deprecated Since 7.6.0. Use saveAsSvg() method instead.
 */
anychart.core.VisualBase.prototype.saveAsSVG = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['saveAsSVG()', 'saveAsSvg()'], true);
  this.saveAsSvg();
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @deprecated Since 7.6.0. Use toSvg() method instead.
 * @return {string}
 */
anychart.core.VisualBase.prototype.toSVG = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['toSVG()', 'toSvg()'], true);
  return this.toSvg();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.VisualBase.prototype.serialize = function() {
  var json = anychart.core.VisualBase.base(this, 'serialize');
  json['enabled'] = this.enabled();
  if (goog.isDef(this.zIndex_))
    json['zIndex'] = this.zIndex();
  return json;
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.specialSetupByVal = function(value) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    this.enabled(!!value);
    return true;
  }
  return anychart.core.Base.prototype.specialSetupByVal.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.VisualBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.VisualBase.base(this, 'setupByJSON', config, opt_default);

  var enabled = config['enabled'];
  this.enabled(goog.isDefAndNotNull(enabled) ? enabled : !goog.isDef(enabled) ? true : undefined);
  this.zIndex(config['zIndex']);
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


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.core.VisualBase.prototype;
  proto['saveAsPNG'] = proto.saveAsPNG;//deprecated
  proto['saveAsJPG'] = proto.saveAsJPG;//deprecated
  proto['saveAsSVG'] = proto.saveAsSVG;//deprecated
  proto['saveAsPDF'] = proto.saveAsPDF;//deprecated
  proto['toSVG'] = proto.toSVG;//deprecated

  proto['zIndex'] = proto.zIndex;//in docs/final
  proto['enabled'] = proto.enabled;//doc|ex
  proto['print'] = proto.print;
})();
