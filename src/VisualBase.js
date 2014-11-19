goog.provide('anychart.VisualBase');
goog.require('acgraph');
goog.require('anychart.Base');
goog.require('goog.dom');
goog.require('goog.json.hybrid');



/**
 * Base class for all elements.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.VisualBase = function() {
  goog.base(this);

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.VisualBase, anychart.Base);


/**
 * Container to which the root element should be added to.
 * @type {acgraph.vector.ILayer}
 * @private
 */
anychart.VisualBase.prototype.container_ = null;


/**
 * Parent bounds storage.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.VisualBase.prototype.parentBounds_ = null;


/**
 * Z index of the element.
 * @type {number}
 * @private
 */
anychart.VisualBase.prototype.zIndex_;


/**
 * Auto z index of the element.
 * @type {number}
 * @private
 */
anychart.VisualBase.prototype.autoZIndex_ = 0;


/**
 * Whether element is enabled or not.
 * @type {boolean}
 * @private
 */
anychart.VisualBase.prototype.enabled_ = true;


/**
 * Double signals dispatching for enabled state signals special treatment.
 * @type {boolean}
 * @private
 */
anychart.VisualBase.prototype.doubleSuspension_ = false;


/**
 * Supported signals.
 * @type {number}
 */
anychart.VisualBase.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.ENABLED |
    anychart.ConsistencyState.CONTAINER |
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.Z_INDEX;


/**
 * Getter for the element current container.
 * @return {acgraph.vector.ILayer} The current container.
 *//**
 * Setter for the element container.<br/>
 * Each element appends all its content to this container.<br/>
 * The order of adding is not defined, but usually it will be the order in which elements are drawn for the first time.
 * If you need to specify the order use {@link anychart.VisualBase#zIndex}.
 * @example <t>listingOnly</t>
 * // string
 *  element.container('containerIdentifier');
 * // DOM-element
 *  var domElement = document.getElementById('containerIdentifier');
 *  element.container(domElement);
 * // Framework-element
 *  var fwElement = anychart.elements.title();
 *  element.container( fwElement.container() );
 * @example <t>lineChart</t>
 * chart.line([4, 2, 8]);
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value The value to set.
 * @return {anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|anychart.VisualBase)} .
 */
anychart.VisualBase.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.container_ != opt_value) {
      var containerBounds = this.container_ && this.container_.getStage() && this.container_.getStage().getBounds();
      if (goog.isString(opt_value) || goog.dom.isElement(opt_value)) {
        // Should we use registerDisposable in this case?
        // TODO(Anton Saukh): fix type cast to {Element|string} when this will be fixed in graphics.
        this.container_ = acgraph.create();
        this.registerDisposable(this.container_);
        this.container_.container(/** @type {Element} */(opt_value));

        //if graphics engine can't recognize passed container
        //we should destroy stage to avoid uncontrolled behaviour
        if (!this.container_.container()) {
          this.container_.dispose();
          this.container_ = null;
          return this;
        }
      } else {
        this.container_ = /** @type {acgraph.vector.ILayer} */(opt_value);
      }

      // wrapping <svg> to div with position:relative and size of parent container
      // need to correctly position credits <a> dom element
      // see DVF-791
      var innerDom;
      if (this.container_ instanceof acgraph.vector.Stage) {
        if (!this.container_.wrapped_) {
          innerDom = goog.dom.createDom(goog.dom.TagName.DIV, {
            style: 'position: relative; left: 0; top: 0; width: 100%; height: 100%'});
          goog.dom.appendChild(/** @type {Element} */((/** @type {acgraph.vector.Stage} */(this.container_)).container()), innerDom);
          this.container_.container(innerDom);
          this.container_.wrapped_ = true;
        }
      }

      var state = anychart.ConsistencyState.CONTAINER;
      var newContainerBounds = this.container_ && this.container_.getStage() && this.container_.getStage().getBounds();
      if (!goog.math.Rect.equals(containerBounds, newContainerBounds))
        state |= anychart.ConsistencyState.BOUNDS;

      this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.container_;
};


/**
 * Getter for the current Z-index of the element.
 * @return {number} The current zIndex.
 *//**
 * Setter for the Z-index of the element.<br/>
 * @illustration <t>stageOnly</t>
 *  var stroke = '1 black 1';
 *  layer.ellipse(75, 105, 55, 35).fill('#cc6622', 1).stroke(stroke)
 *  layer.ellipse(95, 75, 55, 35).fill('#ccaa22', 1).stroke(stroke)
 *  layer.ellipse(115, 45, 55, 35).fill('#ccee22', 1).stroke(stroke);
 *  layer.text(195, 100, 'index = 0');
 *  layer.text(195, 70, 'index = 1');
 *  layer.text(195, 40, 'index = 2');
 * @illustrationDesc
 * The bigger the index - the higher the element position is.
 * @param {number=} opt_value Value to set.
 * @return {!anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {(number|!anychart.VisualBase)} .
 */
anychart.VisualBase.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.zIndex_ != val) {
      this.zIndex_ = val;
      this.invalidate(anychart.ConsistencyState.Z_INDEX, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return goog.isDef(this.zIndex_) ? this.zIndex_ : this.autoZIndex_;
};


/**
 * Auto z-index setter.
 * @param {number} value
 */
anychart.VisualBase.prototype.setAutoZIndex = function(value) {
  this.autoZIndex_ = value;
};


/**
 * Getter for the current element state (enabled or disabled).
 * @return {boolean} The current element state.
 *//**
 * Setter for the element enabled state.
 * @example <t>listingOnly</t>
 * if (!element.enabled())
 *    element.enabled(true);
 * @example <t>lineChart</t>
 * var blueLine = chart.line([1, 1.6, 1.2, 2.1]).enabled(true);
 * // there are no second series.
 * var redLine = chart.line([11, 11.6, 11.2, 12.1]).enabled(false);
 * @param {boolean=} opt_value Value to set.
 * @return {anychart.VisualBase} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Value to set.
 * @return {anychart.VisualBase|boolean} .
 */
anychart.VisualBase.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      if (this.enabled_) {
        this.doubleSuspension_ = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension_ = true;
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
anychart.VisualBase.prototype.getEnableChangeSignals = function() {
  return anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
};


/** @inheritDoc */
anychart.VisualBase.prototype.resumeSignalsDispatching = function(doDispatch) {
  var doSpecial = this.doubleSuspension_ && this.suspensionLevel == 1;
  var realSignals;
  if (doSpecial) {
    realSignals = this.suspendedDispatching;
    this.suspendedDispatching = this.getEnableChangeSignals();
    this.doubleSuspension_ = false;
  }
  goog.base(this, 'resumeSignalsDispatching', doDispatch);
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
anychart.VisualBase.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
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
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    anychart.utils.error(anychart.enums.ErrorCode.CONTAINER_NOT_SET);
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Remove all elements content from the container.
 * @protected
 */
anychart.VisualBase.prototype.remove = goog.nullFunction;


/**
 * Gets or sets bounds that would be used in case of percent size calculations. Expects pixel values only.
 * As a getter falls back to stage bounds.
 * @param {(anychart.math.Rect|number)=} opt_boundsOrLeft
 * @param {number=} opt_top
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @return {anychart.VisualBase|anychart.math.Rect}
 */
anychart.VisualBase.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
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
        this.parentBounds_ = new anychart.math.Rect(left, top, width, height);
      }
      this.invalidateParentBounds();
    }
    return this;
  }
  if (this.parentBounds_)
    return this.parentBounds_;
  var stage;
  if (this.container_ && (stage = this.container_.getStage()))
    return stage.getBounds();
  return null;
};


/**
 * Overridable invalidator for visual bounds.
 * @protected
 */
anychart.VisualBase.prototype.invalidateParentBounds = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  JSON.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.VisualBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['enabled'] = this.enabled();
  if (goog.isDef(this.zIndex_))
    json['zIndex'] = this.zIndex_;
  return json;
};


/**
 * @inheritDoc
 */
anychart.VisualBase.prototype.deserialize = function(config) {
  if ('enabled' in config)
    this.enabled(config['enabled']);
  if ('zIndex' in config)
    this.zIndex(config['zIndex']);

  return goog.base(this, 'deserialize', config);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Export.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Return data for stage export.
 * @return {Array.<string>} .
 * @protected
 */
anychart.VisualBase.prototype.getExportData = function() {
  var stage = this.container() ? this.container().getStage() : null;
  var result = [];

  if (stage) {
    var type = acgraph.type();
    if (type == acgraph.StageType.VML) {
      var jsonData = stage.data() || {};
      result = [goog.json.hybrid.stringify(jsonData), 'json', 'graphics'];

    } else if (type == acgraph.StageType.SVG) {
      var serializer = new XMLSerializer();
      var svgNode = stage.domElement();
      result = [serializer.serializeToString(svgNode), 'svg', 'graphics'];
    }
  }

  return result;
};


/**
 * Saves the current visual state into PNG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.top(50);
 * var button = new anychart.ui.button();
 * button.parentBounds( anychart.math.rect(120, 0, 100, 49) )
 * .text('Save image')
 * .padding(10)
 * .setOnClickListener(function(){
 *      chart.saveAsPNG();
 *  })
 * .container(stage).draw();
 */
anychart.VisualBase.prototype.saveAsPNG = function() {
  var data = this.getExportData();
  var stage = this.container() ? this.container().getStage() : null;

  if (data.length && stage) {
    stage.saveAsPNG(data[0], data[1], data[2]);
  }

};


/**
 * Saves the current visual state into JPEG file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.top(50);
 * var button = new anychart.ui.button();
 * button.parentBounds( anychart.math.rect(120, 0, 100, 49) )
 * .text('Save image')
 * .padding(10)
 * .setOnClickListener(function(){
 *      chart.saveAsJPG();
 *  })
 * .container(stage).draw();
 */
anychart.VisualBase.prototype.saveAsJPG = function() {
  var data = this.getExportData();
  var stage = this.container() ? this.container().getStage() : null;

  if (data.length && stage) {
    stage.saveAsJPG(data[0], data[1], data[2]);
  }
};


/**
 * Saves the current visual state into PDF file.
 * @example <t>lineChart</t>
 * chart.line([4, 2, 12]);
 * chart.top(50);
 * var button = new anychart.ui.button();
 * button.parentBounds( anychart.math.rect(120, 0, 100, 49) )
 * .text('Save image')
 * .padding(10)
 * .setOnClickListener(function(){
 *      chart.saveAsPDF();
 *  })
 * .container(stage).draw();
 */
anychart.VisualBase.prototype.saveAsPDF = function() {
  var data = this.getExportData();
  var stage = this.container() ? this.container().getStage() : null;

  if (data.length && stage) {
    stage.saveAsPDF(data[0], data[1], data[2]);
  }
};


//exports
anychart.VisualBase.prototype['container'] = anychart.VisualBase.prototype.container;//doc|ex
anychart.VisualBase.prototype['zIndex'] = anychart.VisualBase.prototype.zIndex;//in docs/final
anychart.VisualBase.prototype['enabled'] = anychart.VisualBase.prototype.enabled;//doc|ex
anychart.VisualBase.prototype['saveAsPNG'] = anychart.VisualBase.prototype.saveAsPNG;//doc|ex
anychart.VisualBase.prototype['saveAsJPG'] = anychart.VisualBase.prototype.saveAsJPG;//doc|ex
anychart.VisualBase.prototype['saveAsPDF'] = anychart.VisualBase.prototype.saveAsPDF;//doc|ex
anychart.VisualBase.prototype['parentBounds'] = anychart.VisualBase.prototype.parentBounds;
